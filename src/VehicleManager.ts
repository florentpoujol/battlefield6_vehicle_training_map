
// vehicle spawners are scatered around the map
// when they spawn, they spawn AIs and set them in their seat
// there is only a single AI spawner, so this is fairly slow, but it's OK

import { devTools } from "./DevTools";

export class VehicleManager 
{
    private vehcileSpawnerIds: number[] = [
        // 12001,
        // 12002,
        // 12003,
        // 12004,
    ];
    private vehcileSpawnerPositionPerId: {[index: string]: mod.Vector} = {
        // these are not actual spawner position, but just some points in the area
        // that I don't need to change all the time
        "12001": mod.CreateVector(-132, 101, 94),
        "12002": mod.CreateVector(33, 95, 123),
        "12003": mod.CreateVector(-47, 96, 33),
    };


    private aiSpawnerIds: number[] = [
        11001, 11002, 11003
    ];
    private aiSpawners: Array<mod.Spawner> = [];
    private aiTeamNumber: number = 3;
    private aiTeam: mod.Team;

    private availableAis: mod.Player[] = [];
    private botNameSuffix: number = 1;

    constructor()
    {
        for (const id of this.aiSpawnerIds) {
            const spawner = mod.GetSpawner(id);
            if (spawner) {
                this.aiSpawners.push(spawner);
            }
        }
        if (this.aiSpawners.length === 0) {
            throw new Error("No AI spawners found");
        }

        this.aiTeam = mod.GetTeam(this.aiTeamNumber);

        // for (const id of this.vehcileSpawnerIds) {
        //     const spawner = mod.GetVehicleSpawner(id);
        //     this.vehcileSpawnerPositionPerId[String(id)] = mod.GetObjectPosition(spawner);
        // }
    }

    private spawnAi(): void
    {
        devTools.log("ask to spawn ai with name: " + this.botNameSuffix);
        mod.SpawnAIFromAISpawner(
            devTools.getRandomValueInArray(this.aiSpawners),
            mod.Message(mod.stringkeys.botname, this.botNameSuffix), // name, ie: "bot 1"
            this.aiTeam
        );
        this.botNameSuffix++;
    }

    public OnAiSpawned(ai: mod.Player): void
    {
        devTools.log("OnAiSpawned");
        mod.EnablePlayerDeploy(ai, true);
    }

    public OnPlayerDeployed(ai: mod.Player): void
    {
        if (!mod.GetSoldierState(ai, mod.SoldierStateBool.IsAISoldier)) {
            return;
        }

        devTools.log("ai deployed: " + mod.GetObjId(ai));
        mod.AIEnableShooting(ai, false);

        this.availableAis.push(ai);
    }

    private findSpawnerFromVehiclePosition(vehicle: mod.Vehicle): null|string
    {
        const vehiclePosition = mod.GetVehicleState(vehicle, mod.VehicleStateVector.VehiclePosition);
        
        for (const spawnerIdAsString of Object.keys(this.vehcileSpawnerPositionPerId)) {
            const spawnerPosition = this.vehcileSpawnerPositionPerId[spawnerIdAsString];
            const distance = mod.DistanceBetween(vehiclePosition, spawnerPosition);
            if (distance < 200) {
                return spawnerIdAsString;
            }
        }

        return null;
    }

    public async OnVehicleSpawned(vehicle: mod.Vehicle): Promise<void>
    {
        if (this.findSpawnerFromVehiclePosition(vehicle) === null) {
            // devTools.log(`no spawner found for vehicle ${mod.GetObjId(vehicle)}`);
            return;
        }

        // devTools.log("OnVehicleSpawned " + mod.GetObjId(vehicle));

        let seatNumber = 0;
        let attemptsLeft = 5;
        while (seatNumber < 1 && attemptsLeft > 0) { // if 2, vehicle will also have gunners
            const ai = this.availableAis.shift();
            if (ai === undefined) {
                this.spawnAi();
                attemptsLeft--;

                await mod.Wait(1); // let time for the AI to spawn

                continue;
            }

            devTools.log(`ForcePlayer ${mod.GetObjId(ai)} to seat in ${mod.GetObjId(vehicle)}, in seat ${seatNumber}`);
            mod.ForcePlayerToSeat(ai, vehicle, seatNumber);

            const position = mod.GetVehicleState(vehicle, mod.VehicleStateVector.VehiclePosition);
            mod.AIDefendPositionBehavior(ai, position, 0, 400); 

            seatNumber++;
        }

        if (attemptsLeft <= 0) {
            devTools.log("bailed from forcing AI into vehicle after too many attempts");
        }
    }
}

export const vehicleManager = new VehicleManager();
