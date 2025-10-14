
import {ParseUI, UIWidgetType} from './UIHelpers';
import {DevTools} from './DevTools';
const devTools = new DevTools();


// ----------------------------------------
// UI test

export function OnPlayerDeployed(player: mod.Player): void
{
    const playerId = mod.GetObjId(player);

    if (mod.GetSoldierState(player, mod.SoldierStateBool.IsAISoldier)) {
        devTools.log("aitowaypoint");
        mod.AIWaypointIdleBehavior(player, mod.GetWaypointPath(671));

        return;
    }

    devTools.log(mod.stringkeys.Player, player);

    ParseUI({
        player: player,
        type: UIWidgetType.Container,
        name: "container_" + playerId,
        position: [0, 0], // position relative à l'ancre
        size: [800, 800], // what is the Z ?
        bgColor: [1, 1, 1], // white
        bgFill: mod.UIBgFill.Blur,
        bgAlpha: 0.8,
        padding: 10, // pixels
        visible: true,
        children: [
            {
                type: UIWidgetType.Button,
                name: "close_button_" + playerId,
                size: [30, 30],
                position: [0, 0],
                anchor: mod.UIAnchor.TopRight,
                bgFill: mod.UIBgFill.Solid,
                bgColor: [255, 0, 0],
                padding: 5,
                children: [
                    {
                        type: UIWidgetType.Text,
                        anchor: mod.UIAnchor.TopRight,
                        bgFill: mod.UIBgFill.None,
                        textLabel: mod.stringkeys.close_button,
                        textSize: 25,
                    }
                ]
            },
            {
                type: UIWidgetType.Text,
                position: [0, 50],
                size: [750, 750],
                anchor: mod.UIAnchor.TopLeft,
                bgFill: mod.UIBgFill.Solid,
                textLabel: mod.stringkeys.lorem,
                textSize: 15,
                textColor: [0, 0, 0],
                bgColor: [0, 255, 0],
                bgAlpha: 0.1
            }
        ]
    });

    const button = mod.FindUIWidgetWithName("close_button_" +  playerId);
    mod.EnableUIButtonEvent(button, mod.UIButtonEvent.ButtonUp, true);
    mod.EnableUIInputMode(true, player);
}

export function OnPlayerUIButtonEvent(player: mod.Player, widget: mod.UIWidget, buttonEvent: mod.UIButtonEvent): void 
{
    // Hide UI when clicking the the X button
    const playerId = mod.GetObjId(player);

    let containerWidget: mod.UIWidget = mod.FindUIWidgetWithName("container_" + playerId);
    // mod.SetUIWidgetVisible(containerWidget, false);
    mod.DeleteUIWidget(containerWidget); // we delete because it is recreated on every deployment, the last widget still exists
    mod.EnableUIInputMode(false, player);

    devTools.log("UI hidden", player);
}

//-----------------------------------------------------------
// AI vehcile test

export async function OnGameModeStarted()
{
    await mod.Wait(15);

    devTools.log(mod.stringkeys.starting);

    const aiSpawner = mod.GetSpawner(666);
    mod.SetAIToHumanDamageModifier(0);

    mod.SpawnAIFromAISpawner(aiSpawner, mod.GetTeam(2));

    const vehSpawner = mod.GetVehicleSpawner(667);
    mod.ForceVehicleSpawnerSpawn(vehSpawner);
}

let _ai: mod.Player;
let _vehicle: mod.Vehicle;

export function OnPlayerJoinGame(player: mod.Player): void
{
    if (mod.GetSoldierState(player, mod.SoldierStateBool.IsAISoldier)) {
        _ai = player;
        mod.EnablePlayerDeploy(player, true);
        // mod.AIIdleBehavior(player);
        mod.AIEnableShooting(player, false);

        devTools.log(mod.stringkeys.ai_spawned);

        ForceAiInVehicle();
    }
}

export function OnVehicleSpawned(vehicle: mod.Vehicle): void
{
    _vehicle = vehicle;
    devTools.log(mod.stringkeys.vehicle_spawned);
    
    ForceAiInVehicle();
}

function ForceAiInVehicle(): void
{
    if (_ai && _vehicle) {
        devTools.log(mod.stringkeys.ai_in_vehicle);

        // mod.ForcePlayerToSeat(_ai, _vehicle, 0);
        // mod.AIWaypointIdleBehavior(_ai, mod.GetWaypointPath(671));

        return;
    }

    devTools.log(mod.stringkeys.no_ai_or_vehicle);
}

// This will trigger when an AI Soldier stops following a waypoint.
export function OnAIWaypointIdleFailed(eventPlayer: mod.Player): void
{
    devTools.log('OnAIWaypointIdleFailed');
}

// This will trigger when an AI Soldier starts following a waypoint.
export function OnAIWaypointIdleRunning(eventPlayer: mod.Player): void
{
    devTools.log('OnAIWaypointIdleRunning');
}

// This will trigger when an AI Soldier finishes following a waypoint.
export function OnAIWaypointIdleSucceeded(eventPlayer: mod.Player): void
{
    devTools.log('OnAIWaypointIdleSucceeded');
}