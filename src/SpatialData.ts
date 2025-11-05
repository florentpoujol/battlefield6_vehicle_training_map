
// this is "filled" on-the-fly by the build.ts script
import assert from "node:assert/strict";

const RAW_SPATIAL_DATA: {ObjId: number, name: string, id: string, type: string, position:any}[] = [];

export class SpatialData
{
    public static objectsPerId: Map<number, SpatialObject>;
    public static objectsPerHierarchy: Map<string, SpatialObject>;
    public static objectsPerName: Map<string, SpatialObject>; // note that the name may be not unique

    public static init(): void
    {
        for (const object of RAW_SPATIAL_DATA) {
            const type = object.type;

            let objectFqcn: string = 'SpatialObject';
            switch (type) {
                case "VehicleSpawner": objectFqcn = 'VehicleSpawner'; break;
            }

            const objectType = {
                SpatialObject, VehicleSpawner,
            }[objectFqcn];
            if (objectType === undefined) {
                continue;
            }

            let metadata: {[index: string]: string} = {};
            for (let [key, value] of Object.entries(object)) {
                if (key.startsWith('metadata/')) {
                    metadata[key.substring(9)] = value;
                }
            }

            const instance = new objectType(
                object.ObjId, // Object id as defined in Godot
                object.name, // last part of the Godot object hierarchy. Ie: "VehicleSpawner5"
                object.id, // Godot object hierarchy. ie: "TankRange/Start/VehicleSpawner5"
                // @ts-ignore
                mod.Types[object.type], // object.type is the name of the object as found in Godot's asset library. Ie: "VehicleSpawner"
                mod.CreateVector(object.position.x, object.position.y, object.position.z),
                metadata,
                object,
            );

            this.objectsPerId.set(instance.id, instance);
            this.objectsPerHierarchy.set(instance.hierarchy, instance);
            this.objectsPerName.set(instance.name, instance);
        }
    }

    public static getByObjectId(objectId: number): SpatialObject|null
    {
        return this.objectsPerId.get(objectId) ?? null;
    }

    public static getByHierarchy(name: string): SpatialObject|null
    {
        return this.objectsPerHierarchy.get(name) ?? null;
    }

    public static getByName(name: string): SpatialObject|null
    {
        return this.objectsPerName.get(name) ?? null;
    }
}

export class SpatialObject
{
    constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly hierarchy: string,
        public readonly type: mod.Types,
        public readonly position: mod.Vector,
        public readonly metadata: {[index: string]: string}, // an object
        public readonly rawData: {[index: string]: any}, // this a JSON object, but its more practical to type is as any
    ) {
        this.initFromRawData();
    }

    protected initFromRawData(): void
    {
        // allow for child classes to define more properties with the raw data
        // without having to redeclare a constructor
    }
}

export class VehicleSpawner extends SpatialObject
{
    // @ts-ignore
    public vehicleType: mod.VehicleList;

    protected initFromRawData(): void
    {
        // @ts-ignore
        this.vehicleType = mod.VehicleList[this.rawData.VehicleType];
    }

    public getObject(): mod.VehicleSpawner|null
    {
        return mod.GetVehicleSpawner(this.id) ?? null;
    }
}
