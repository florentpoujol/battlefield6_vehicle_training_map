
import {ParseUI, UIWidgetType} from './UIHelpers';
import {DevTools} from './DevTools';
const devTools = new DevTools();


// ----------------------------------------
// 

let availableAis: mod.Player[] = [];

export async function OnPlayerDeployed(player: mod.Player)
{
    const playerId = mod.GetObjId(player);

    if (mod.GetSoldierState(player, mod.SoldierStateBool.IsAISoldier)) {
        // devTools.log("OnPlayerDeployed");

        mod.AIEnableShooting(player, false);
        // mod.AISetMoveSpeed(player, mod.MoveSpeed.Patrol);
        // mod.AIWaypointIdleBehavior(player, mod.GetWaypointPath(671));

        availableAis.push(player);

        return;
    }

    devTools.log(mod.stringkeys.Player, player);

}

//-----------------------------------------------------------
// AI vehcile test

export function OnGameModeStarted()
{
    devTools.log("OnGameModeStarted");
    mod.SetAIToHumanDamageModifier(0);

}

let botNameSuffix: number = 1;

export async function OnVehicleSpawned(vehicle: mod.Vehicle)
{
    devTools.log("OnVehicleSpawned " + mod.GetObjId(vehicle));

    const aiSpawner = mod.GetSpawner(666);
    mod.SpawnAIFromAISpawner(aiSpawner, mod.Message(mod.stringkeys.botname, botNameSuffix++), mod.GetTeam(2));
    await mod.Wait(1);
    mod.SpawnAIFromAISpawner(aiSpawner, mod.Message(mod.stringkeys.botname, botNameSuffix++), mod.GetTeam(2));

    let count = 0;
    while (count < 2) {
        const ai = availableAis.pop();
        if (ai === undefined) {
            await mod.Wait(1);
        }

        mod.ForcePlayerToSeat(ai as mod.Player, vehicle, count);
        count++;
    }
}

// export function OnVehicleDestroyed(vehicle: mod.Vehicle)
// {
//     if (mod.GetVehicleTeam(vehicle) !== mod.GetTeam(2)) {
//         return;
//     }
// 
//     respawn vehicle
// }







export function OnPlayerInteract(eventPlayer: mod.Player, eventInteractPoint: mod.InteractPoint): void
{
    devTools.log(mod.stringkeys.playerInteracted, eventPlayer);
    // spawnAI();
}


