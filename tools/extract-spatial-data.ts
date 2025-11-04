/**
 * this file take the *.spatial.json file,
 * extract all objects that have an Object Id
 * in a data structure that is usable in the scripts
 * so that you can query the object by the id or by their name.
 *
 * It will also alert on duplicate object ids.
 */

import fs from "node:fs/promises";

async function main(): Promise<void>
{
    const stringContent = await fs.readFile('./portal/MP_Mirak_Florent_Vehicle_Training.spatial.json');
    // @ts-ignore
    const data = JSON.parse(stringContent);

    const keptObjects= [];
    for (const object of data.Portal_Dynamic) {
        if (object.ObjId && object.type.toLowerCase().includes('spawner')) {
            keptObjects.push(object);
        }
    }

    const rawSpatialData = JSON.stringify(keptObjects);

    const contentBuffer = await fs.readFile('./src/SpatialData.ts');
    let contentString = contentBuffer.toString();
    let contentString2 = contentString.replace(
        /const RAW_SPATIAL_DATA = .+];/g,
        `const RAW_SPATIAL_DATA = ${rawSpatialData};`
    );
    await fs.writeFile('./src/SpatialData.ts', contentString2);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});