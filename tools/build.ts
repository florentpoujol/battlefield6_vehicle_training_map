/**
 * copy/pasted and then modified from https://github.com/gazreyn/bf6-portal-firing-range/blob/main/scripts/build.ts
 */

import {Project, SourceFile, SyntaxKind} from "ts-morph";
import path from "node:path";
import fs from "node:fs/promises";
import assert from 'node:assert/strict';

// If you need to treat some packages as externals that Battlefield Portal provides,
// add them here so we keep their import statements.
const EXTERNALS = new Set<string>([]);

// Files to exclude from the bundle (like utility files that shouldn't be included)
const EXCLUDE_FILES = new Set<string>([
    // "src/lib/string-macro.ts"
]);

async function main() {
    // get .tscn and .spatial.json files from Godot
    fs.copyFile(
        'G:\\bf6_portal\\GodotProject\\levels\\MP_Mirak_Florent_Vehicle_Training.tscn',
        'G:\\code\\bf6_vehicle_training_map\\godot\\MP_Mirak_Florent_Vehicle_Training.tscn'
    );
    fs.copyFile(
        'G:\\bf6_portal\\export\\levels\\MP_Mirak_Florent_Vehicle_Training.spatial.json',
        'G:\\code\\bf6_vehicle_training_map\\portal\\MP_Mirak_Florent_Vehicle_Training.spatial.json'
    );

    // --------------------------------------------------
    // Concatenate all sources files.
    // Find all sources to concatenate by the import statements.
    // Most of the code is related to removing or transforming most import and export statements.

    const contentToOutput: string[] = [];

    // add watermark at the top
    let watermark = (await fs.readFile('./tools/watermark.ts')).toString();
    const date = new Date();
    contentToOutput.push(watermark.replace('{date}', date.toISOString()));

    const project = new Project({
        tsConfigFilePath: "tsconfig.json",
        // Ensure we load all src files, not only those TS thinks are referenced
        skipAddingFilesFromTsConfig: false,
    });

    const mainSourceFile = project.getSourceFile('src/main.ts');
    assert(mainSourceFile instanceof SourceFile);

    const orderedSourceFiles = orderSourceFiles(mainSourceFile);
    const cwd = process.cwd();
    for (const sourceFile of orderedSourceFiles) {
        // Skip excluded files
        const relativePath = path.relative(cwd, sourceFile.getFilePath());
        if (EXCLUDE_FILES.has(relativePath.replace(/\\/g, '/'))) {
            continue;
        }

        // Remove import declarations for local files. Keep externals.
        for (const importDecl of sourceFile.getImportDeclarations()) {
            const isLocal =
                !!importDecl.getModuleSpecifierSourceFile() &&
                !EXTERNALS.has(importDecl.getModuleSpecifierValue());
            if (isLocal) {
                // If it is "type-only" import, safe to drop.
                // If it's value import, we rely on inlined symbols being in scope.
                importDecl.remove();
            }
        }

        // Flatten re-exports like `export { x } from './y'`
        for (const exportDecl of sourceFile.getExportDeclarations()) {
            const target = exportDecl.getModuleSpecifierSourceFile();
            if (target) {
                // Replace with in-file export to keep symbol visibility
                const named = exportDecl.getNamedExports();
                if (named.length) {
                    contentToOutput.push(
                        `// Re-export from ${path.relative(process.cwd(), target.getFilePath())}\n` +
                        named.map(n => `export { ${n.getName()} };`).join("\n")
                    );
                }
                exportDecl.remove();
            } else {
                // `export { a, b }` stays as-is
            }
        }

        // Drop "export" keywords on top-level declarations to keep them as plain symbols.
        // Exception: Keep export on functions in main.ts
        const isMainFile = path.basename(sourceFile.getFilePath()) === 'main.ts';

        for (const statement of sourceFile.getStatements()) {
            if (
                statement.getKind() === SyntaxKind.FunctionDeclaration ||
                statement.getKind() === SyntaxKind.ClassDeclaration ||
                statement.getKind() === SyntaxKind.VariableStatement ||
                statement.getKind() === SyntaxKind.InterfaceDeclaration ||
                statement.getKind() === SyntaxKind.TypeAliasDeclaration
            ) {
                // Cast to a type that has modifiers
                const declarationNode = statement as any;
                if (declarationNode.getModifiers) { // if the method exists
                    const modifiers = declarationNode.getModifiers();
                    const exportModifier = modifiers.find((mod: any) => mod.getKind() === SyntaxKind.ExportKeyword);
                    if (exportModifier) {
                        // Keep export on functions in main.ts, remove from others
                        const shouldKeepExport = isMainFile && statement.getKind() === SyntaxKind.FunctionDeclaration;

                        if (!shouldKeepExport) {
                            // Remove the export modifier by replacing the text
                            const text = statement.getText();
                            const newText = text.replace(/^export\s+/, '');
                            statement.replaceWithText(newText);
                        }
                    }
                }
            }
        }

        // Convert `export default` to a const with a stable name
        sourceFile.getDescendantsOfKind(SyntaxKind.ExportAssignment).forEach(exp => {
            const expr = exp.getExpression().getText();
            const name = inferDefaultName(sourceFile.getBaseNameWithoutExtension());
            exp.replaceWithText(`const ${name} = ${expr};`);
        });

        // Get the text and manually remove any remaining local imports
        let fileText = sourceFile.getFullText();

        // Remove any remaining import statements for local files
        fileText = fileText.replace(/import\s+.*?from\s+['"]\..*?['"];?\s*/g, '');

        // Remove any remaining export keywords from declarations, except functions in main.ts
        if (isMainFile) {
            // For main.ts: Remove exports from non-function declarations only
            fileText = fileText.replace(/^export\s+(class|const|let|var|interface|type)/gm, '$1');

            fileText = fileText.replace("{script_build_time}", date.toISOString());
        } else {
            // For other files: Remove all export keywords
            fileText = fileText.replace(/^export\s+(function|class|const|let|var|interface|type)/gm, '$1');
        }

        if (sourceFile.getBaseName() === 'SpatialData.ts') {
            fileText = await extractSpatialData(fileText);
        }

        // Add a banner per file for readability and use processed text
        contentToOutput.push(
            `\n// ===== File: ${path.relative(process.cwd(), sourceFile.getFilePath())} =====\n` +
            fileText
        );
    }

    // --------------------------------------------------
    // write the output

    const outFilePath = 'portal/script.ts';
    await fs.writeFile(outFilePath, contentToOutput.join("\n"));

    console.log(`Wrote ${outFilePath}`);
}

/**
 * Find all unique source files, recursively, taking the import statements into account
 * and order them logically
 */
function orderSourceFiles(entry: import("ts-morph").SourceFile)
{
    const seen = new Set<string>();
    const ordered: import("ts-morph").SourceFile[] = [];

    function visit(sf: import("ts-morph").SourceFile) {
        const id = sf.getFilePath();
        if (seen.has(id)) return;
        seen.add(id);

        // Recurse imports first
        for (const imp of sf.getImportDeclarations()) {
            const dep = imp.getModuleSpecifierSourceFile();
            if (dep) visit(dep);
        }
        ordered.push(sf);
    }

    visit(entry);
    return ordered;
}

function inferDefaultName(base: string)
{
    // index -> module name from folder, else filename
    if (base === "index") return "defaultExport";
    return `${base}Default`;
}

/**
 * Take the *.spatial.json file,
 * extract all objects that have an Object Id
 * in a data structure that is usable in the scripts
 * so that you can query the object by the id or by their name.
 *
 * It will also alert on duplicate object ids.
 */
async function extractSpatialData(fileText: string): Promise<string>
{
    const stringContent = (await fs.readFile('./portal/MP_Mirak_Florent_Vehicle_Training.spatial.json')).toString();
    const data = JSON.parse(stringContent);

    const keptObjects: any[] = [];
    const objectFullnamesPerObjId = new Map<number, string[]>();

    for (const object of data.Portal_Dynamic) {
        if (
            object.ObjId && object.ObjId > 0
            // && object.type.toLowerCase().includes('spawner')
        ) {
            keptObjects.push(object);

            const objId = object.ObjId;
            if (objectFullnamesPerObjId.has(objId)) {
                objectFullnamesPerObjId.get(objId)?.push(object.id); // "id" is the full name
            } else {
                objectFullnamesPerObjId.set(objId, [object.id]);
            }
        }
    }

    for (const [objId, names] of objectFullnamesPerObjId.entries()) {
        if (names.length < 2) {
            continue;
        }

        // TODO this kind of check should be done regardless of the SpatialData.ts script being used
        console.log(`WARNING: Multiple objects with the same ObjId '${objId}': `, names);
    }

    const rawSpatialData = JSON.stringify(keptObjects);

    return fileText.replace(
        /const RAW_SPATIAL_DATA = .+];/g,
        `const RAW_SPATIAL_DATA = ${rawSpatialData};`
    );
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});