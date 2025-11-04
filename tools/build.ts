/**
 * copy/pasted and then modified from https://github.com/gazreyn/bf6-portal-firing-range/blob/main/scripts/build.ts
 */

import { Project, SyntaxKind } from "ts-morph";
import path from "node:path";
import fs from "node:fs/promises";

const ENTRY = "src/main.ts";
const OUT = "portal/script.ts";

// If you need to treat some packages as externals that Battlefield Portal provides,
// add them here so we keep their import statements.
const EXTERNALS = new Set<string>([]);

// Files to exclude from the bundle (like utility files that shouldn't be included)
const EXCLUDE_FILES = new Set<string>([
    // "src/lib/string-macro.ts"
]);

async function main() {
    const project = new Project({
        tsConfigFilePath: "tsconfig.json",
        // Ensure we load all src files, not only those TS thinks are referenced
        skipAddingFilesFromTsConfig: false,
    });

    const entry = project.getSourceFile(ENTRY);
    if (!entry) throw new Error(`Entry not found: ${ENTRY}`);

    const orderedSourceFiles = topoOrder(entry);
    const pieces: string[] = [];

    for (const sourceFile of orderedSourceFiles) {
        // Skip excluded files
        const relativePath = path.relative(process.cwd(), sourceFile.getFilePath());
        if (EXCLUDE_FILES.has(relativePath.replace(/\\/g, '/'))) {
            continue;
        }

        // Remove import declarations for local files. Keep externals.
        for (const imp of sourceFile.getImportDeclarations()) {
            const isLocal =
                !!imp.getModuleSpecifierSourceFile() &&
                !EXTERNALS.has(imp.getModuleSpecifierValue());
            if (isLocal) {
                // If it is "type-only" import, safe to drop.
                // If it's value import, we rely on inlined symbols being in scope.
                imp.remove();
            }
        }

        // Flatten re-exports like `export { x } from './y'`
        for (const ex of sourceFile.getExportDeclarations()) {
            const target = ex.getModuleSpecifierSourceFile();
            if (target) {
                // Replace with in-file export to keep symbol visibility
                const named = ex.getNamedExports();
                if (named.length) {
                    pieces.push(
                        `// Re-export from ${path.relative(process.cwd(), target.getFilePath())}\n` +
                        named.map(n => `export { ${n.getName()} };`).join("\n")
                    );
                }
                ex.remove();
            } else {
                // `export { a, b }` stays as-is
            }
        }

        // Drop "export" keywords on top-level declarations to keep them as plain symbols.
        // Exception: Keep export on functions in main.ts
        const isMainFile = path.basename(sourceFile.getFilePath()) === 'main.ts';

        for (const statement of sourceFile.getStatements()) {
            if (statement.getKind() === SyntaxKind.FunctionDeclaration ||
                statement.getKind() === SyntaxKind.ClassDeclaration ||
                statement.getKind() === SyntaxKind.VariableStatement ||
                statement.getKind() === SyntaxKind.InterfaceDeclaration ||
                statement.getKind() === SyntaxKind.TypeAliasDeclaration) {

                // Cast to a type that has modifiers
                const declarationNode = statement as any;
                if (declarationNode.getModifiers) {
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
        } else {
            // For other files: Remove all export keywords
            fileText = fileText.replace(/^export\s+(function|class|const|let|var|interface|type)/gm, '$1');
        }

        // Add a banner per file for readability and use processed text
        pieces.push(
            `\n// ===== File: ${path.relative(process.cwd(), sourceFile.getFilePath())} =====\n` +
            fileText
        );
    }

    // Optional: Prepend a generated header
    const header = ``;

    await fs.mkdir(path.dirname(OUT), { recursive: true });
    await fs.writeFile(OUT, header + pieces.join("\n"));

    console.log(`Wrote ${OUT}`);
}

/**
 * Find all unique source files, recursively, taking the import statements into account
 * and order them logically
 */
function topoOrder(entry: import("ts-morph").SourceFile) {
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

function inferDefaultName(base: string) {
    // index -> module name from folder, else filename
    if (base === "index") return "defaultExport";
    return `${base}Default`;
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});