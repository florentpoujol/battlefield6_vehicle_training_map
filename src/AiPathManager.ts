
import {mod} from './index.d.ts';
import {devTools} from "./DevTools";

export class AiPathManager
{
    private pathPositions = new Array<mod.Vector>();
    private spawner: mod.Spawner;

    constructor(
        private pathObjectIds: Array<number>,
        private aiSpawnerId: number,
    ) {
        for (const objectId of this.pathObjectIds) {
            this.pathPositions.push(mod.GetObjectPosition(mod.GetSpatialObject(objectId)));
        }

        this.spawner = mod.GetSpawner(aiSpawnerId);
    }

    public spawnAi(): void
    {
        mod.SpawnAIFromAISpawner(
            this.spawner,
            mod.Message(mod.stringkeys.moving_ai_name, '1'),
            mod.GetTeam(3),
        );
        console.log('AI Path', 'ask to spawn AI');
    }

    private player: mod.Player|undefined;

    public async OnPlayerDeployed(ai: mod.Player): Promise<void>
    {
        if (!mod.GetSoldierState(ai, mod.SoldierStateBool.IsAISoldier)) {
            return;
        }

        // mod.CreateVector(-324, 96, -454) is the spawner position
        if (!devTools.isPlayerCloseTo(ai, mod.CreateVector(-267, 92, -438), 50)) {
            console.log("ignoring ai for moving with name ");
            return;
        }
        console.log('AI Path', 'Ai spawned: ');

        this.startPath(ai);
    }

    private targetCoordinateId: number = 1;

    private startPath(player: mod.Player): void
    {
        this.player = player;

        // tod calculate orientation toward the next waypoint
        const position = mod.CreateVector(
            mod.XComponentOf(this.pathPositions[0]) + 1,
            mod.YComponentOf(this.pathPositions[0]),
            mod.ZComponentOf(this.pathPositions[0])
        );
        mod.Teleport(this.player, position, 0);

        this.targetCoordinateId = 1;
        mod.AIMoveToBehavior(this.player, this.pathPositions[1]);
        console.log('AI Path', 'start loop', mod.GetObjId(this.player));

        // this.pathLoop();
    }

    private async pathLoop(): Promise<void>
    {
        // check the coordinates, if they are close enough of the next waypoint,
        while (this.player) {
            await mod.Wait(1);

            const objId = mod.GetObjId(this.player);
            if (objId === undefined || objId === -1) {
                console.log('ending Ai move loop because wrong player ', objId);
                return;
            }


            const position = mod.GetSoldierState(this.player, mod.SoldierStateVector.GetPosition);
            const distance = mod.DistanceBetween(position, this.pathPositions[this.targetCoordinateId]);

            if (distance < 1) {
                this.targetCoordinateId++;
                if (this.pathPositions[this.targetCoordinateId] == undefined) {
                    this.targetCoordinateId = 0;
                }

                mod.AIValidatedMoveToBehavior(this.player, this.pathPositions[this.targetCoordinateId]);
                console.log('AI Path', 'new target: ', this.targetCoordinateId, ' to ', devTools.vectorToString(this.pathPositions[this.targetCoordinateId]));
            }
        }
    }
}
