
/** @ts-ignore */
import {mod} from './index.d.ts';
import {CreateUI, UIWidgetType} from './UIHelpers';
import {devTools} from './DevTools';
import {vehicleManager} from './VehicleManager';
import {AiPathManager} from "./AiPathManager";

// replaced by the concatenation script
const DEBUG_SCRIPT_BUILD_TIME = '{script_build_time}'; 

/*
Object id prefix for the objects that we may target from the scripts:

Spawners
10xxx SpawnPoint (Human)
11xxx Spawner (AI)
12xxx VehicleSpawner
13xxx EmplacementSpawner

"Zone" objects
20xxx HQ
21xxx Sector
22xxx CapturePoint
23xxx MCOM
24xxx InteractPoint
25xxx AreaTrigger

Misc
30xxx WaypointPath
31xxx ScreenEffect
32xxx SFX
33xxx VFX
34xxx VO
35xxx WorldIcon
36xxx SpatialObject
*/

// ----------------------------------------

let aiPathManager: AiPathManager|undefined;

export async function OnGameModeStarted()
{
    devTools.log("OnGameModeStarted " + DEBUG_SCRIPT_BUILD_TIME);
    mod.SetAIToHumanDamageModifier(0);

    const icon = mod.GetWorldIcon(35001);
    mod.EnableWorldIconImage(icon, true);
    mod.SetWorldIconText(icon, mod.Message(mod.stringkeys.sectors.moving_ais));
    mod.EnableWorldIconText(icon, true);

    const icon2 = mod.GetWorldIcon(35002);
    mod.EnableWorldIconImage(icon2, true);
    mod.SetWorldIconText(icon2, mod.Message(mod.stringkeys.sectors.tank_range));
    mod.EnableWorldIconText(icon2, true);

    aiPathManager = new AiPathManager(
        [55001, 55002],
        55101
    );
    await mod.Wait(15);
    mod.DisplayHighlightedWorldLogMessage(mod.Message(mod.stringkeys.spawnai));
    aiPathManager.spawnAi();
}

export function OnVehicleSpawned(vehicle: mod.Vehicle): void
{
    vehicleManager.OnVehicleSpawned(vehicle);
}

export function OnSpawnerSpawned(ai: mod.Player): void
{
     vehicleManager.OnAiSpawned(ai);
}

export async function OnPlayerDeployed(player: mod.Player): Promise<void>
{
    vehicleManager.OnPlayerDeployed(player);

    if (aiPathManager) {
        aiPathManager.OnPlayerDeployed(player);
    }
}

export function OnPlayerInteract(eventPlayer: mod.Player, eventInteractPoint: mod.InteractPoint): void
{
    devTools.log('interaction');
    mod.AddEquipment(eventPlayer, mod.Gadgets.Launcher_Auto_Guided, mod.InventorySlots.GadgetTwo);
    mod.SetInventoryAmmo(eventPlayer, mod.InventorySlots.GadgetTwo, 99);
    // mod.SetInventoryMagazineAmmo(eventPlayer, mod.InventorySlots.GadgetTwo, 99);


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