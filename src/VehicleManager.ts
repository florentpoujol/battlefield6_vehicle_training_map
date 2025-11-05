
// vehicle spawners are scatered around the map
// when they spawn, they spawn AIs and set them in their seat
// there is only a single AI spawner, so this is fairly slow, but it's OK

import { devTools } from "./DevTools.ts";

export class VehicleManager 
{
    private vehcileSpawnerPositionPerId: {[index: string]: mod.Vector} = {
        // these are not actual spawner position, but just some points in the area
        // that I don't need to change all the time
        "_1": mod.CreateVector(-395, 93, -269),
        "_2": mod.CreateVector(-384, 95, -185),
        "_3": mod.CreateVector(-500, 90, -180),
        "_4": mod.CreateVector(-332, 90, -236),
    };

    private aiSpawnerIds: number[] = [
        11001, 11002, 11003, 11004,
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

        if (devTools.isPlayerCloseTo(ai, mod.CreateVector(-324, 96, -454))) {
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
            if (distance < 150) {
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

                await mod.Wait(2); // let time for the AI to spawn

                continue;
            }

            devTools.log(`ForcePlayer ${mod.GetObjId(ai)} to seat in ${mod.GetObjId(vehicle)}, in seat ${seatNumber}`);
            mod.ForcePlayerToSeat(ai, vehicle, seatNumber);

            const position = mod.GetVehicleState(vehicle, mod.VehicleStateVector.VehiclePosition);

            let maxDistance = 500;
            if (mod.CompareVehicleName(vehicle, mod.VehicleList.AH64) || mod.CompareVehicleName(vehicle, mod.VehicleList.Eurocopter)) {
                maxDistance = 1000;
            }
            mod.AIDefendPositionBehavior(ai, position, 0, maxDistance);

            seatNumber++;
        }

        if (attemptsLeft <= 0) {
            devTools.log("bailed from forcing AI into vehicle after too many attempts");
        }
    }
}

export const vehicleManager = new VehicleManager();
