
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
    mod.EnableAreaTrigger(mod.GetAreaTrigger(1010), true);

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
    devTools.log('interaction');
    mod.AddEquipment(eventPlayer, mod.Gadgets.Launcher_Auto_Guided, mod.InventorySlots.GadgetTwo);
    mod.SetInventoryAmmo(eventPlayer, mod.InventorySlots.GadgetTwo, 999999);
    mod.SetInventoryMagazineAmmo(eventPlayer, mod.InventorySlots.GadgetTwo, 999999);


    // spawnAI();
}


export function OnPlayerEnterAreaTrigger(eventPlayer: mod.Player, eventAreaTrigger: mod.AreaTrigger)
{
    const id = mod.GetObjId(eventAreaTrigger);
    const player_id = mod.GetObjId(eventPlayer);
    if (id === 1010 && mod.FindUIWidgetWithName('Gadgets.Launcher_Auto_Guided' + player_id) == undefined) {
        devTools.log('show ui');

        mod.AddUIGadgetImage(
            'Gadgets.Launcher_Auto_Guided' + player_id,
            mod.CreateVector(0, 0, 0),
            mod.CreateVector(50, 50, 0),
            mod.UIAnchor.Center,
            mod.Gadgets.Launcher_Auto_Guided,
            mod.GetUIRoot(),
            eventPlayer,
        );
        return;
    }

    devTools.log('dont show ui');
    
}

export function OnPlayerExitAreaTrigger(eventPlayer: mod.Player, eventAreaTrigger: mod.AreaTrigger)
{
    const id = mod.GetObjId(eventAreaTrigger);
    const player_id = mod.GetObjId(eventPlayer);
    if (id === 1010 && mod.FindUIWidgetWithName('Gadgets.Launcher_Auto_Guided' + player_id) != undefined) {
        devTools.log('delete ui');
        mod.DeleteUIWidget(mod.FindUIWidgetWithName('Gadgets.Launcher_Auto_Guided' + player_id));
        return;
    }

    devTools.log('dont delete ui');
}


// interestin gadgets for vehicle
/*
Deployable_Missile_Intercept_System,
Deployable_Portable_Mortar,
Deployable_Recon_Drone,
Launcher_Aim_Guided,
Launcher_Air_Defense,
Launcher_Auto_Guided,
Launcher_Breaching_Projectile,
Launcher_High_Explosive,
Launcher_Incendiary_Airburst,
Launcher_Long_Range,
Launcher_Thermobaric_Grenade,
Launcher_Unguided_Rocket,
Misc_Acoustic_Sensor_AV_Mine,
Misc_Anti_Vehicle_Mine,
Misc_Demolition_Charge,
Misc_Tracer_Dart,
Misc_Tripwire_Sensor_AV_Mine,
Throwable_Anti_Vehicle_Grenade,
Throwable_Fragmentation_Grenade,
Throwable_Incendiary_Grenade,
*/