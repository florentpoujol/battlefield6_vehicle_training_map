
/**
 * Script for the "Florent's Vehicle Training" map on Mirak 
 * Build by Florent Poujol
 * Sources: https://github.com/florentpoujol/battlefield6_vehicle_training_map
 * Built on: Tue Oct 14 23:46:10     2025
 */

////////////////////////////////////////////////////////////////////////////////////////////////////
// src/UIHelpers.ts

/**
 * Helper functions to create UI from a JSON object tree.
 * Only export ParseUI() at the end
 * Taken from the example mods.
 * 
 * This has been modified with the following differences:
 * - The type is now the UIWidgetType enum
 * - the colors can be set as an RGB array
 */

type UIVector = mod.Vector | number[];

export enum UIWidgetType {
    Container,
    Text,
    Button,
    Image
}

interface UIParams {
    type: UIWidgetType;
    name?: string;
    position?: UIVector;
    size?: UIVector;
    anchor?: mod.UIAnchor;
    parent?: mod.UIWidget;
    visible?: boolean;
    textLabel?: string|mod.Message;
    textColor?: UIVector;
    textAlpha?: number;
    textSize?: number;
    textAnchor?: mod.UIAnchor;
    padding?: number;
    bgColor?: UIVector;
    bgAlpha?: number;
    bgFill?: mod.UIBgFill;
    imageType?: mod.UIImageType;
    imageColor?: UIVector;
    imageAlpha?: number;
    team?: mod.Team;
    player?: mod.Player;
    children?: UIParams[];
    buttonEnabled?: boolean;
    buttonColorBase?: UIVector;
    buttonAlphaBase?: number;
    buttonColorDisabled?: UIVector;
    buttonAlphaDisabled?: number;
    buttonColorPressed?: UIVector;
    buttonAlphaPressed?: number;
    buttonColorHover?: UIVector;
    buttonAlphaHover?: number;
    buttonColorFocused?: UIVector;
    buttonAlphaFocused?: number;
}

interface UIParamsWithDefaultFilled {
    type: UIWidgetType;
    name: string;
    position: UIVector;
    size: UIVector;
    anchor: mod.UIAnchor;
    parent: mod.UIWidget;
    visible: boolean;
    textLabel: string|mod.Message;
    textColor: UIVector;
    textAlpha: number;
    textSize: number;
    textAnchor: mod.UIAnchor;
    padding: number;
    bgColor: UIVector;
    bgAlpha: number;
    bgFill: mod.UIBgFill;
    imageType: mod.UIImageType;
    imageColor: UIVector;
    imageAlpha: number;
    team?: mod.Team;
    player?: mod.Player;
    children?: any[];
    buttonEnabled: boolean;
    buttonColorBase: UIVector;
    buttonAlphaBase: number;
    buttonColorDisabled: UIVector;
    buttonAlphaDisabled: number;
    buttonColorPressed: UIVector;
    buttonAlphaPressed: number;
    buttonColorHover: UIVector;
    buttonAlphaHover: number;
    buttonColorFocused: UIVector;
    buttonAlphaFocused: number;
}

function __asModVector(param: UIVector, isColor: boolean = false): mod.Vector 
{
    if (Array.isArray(param)) {
        param[2] ??= 0

        if (isColor) {
            if (param[0] > 1) param[0] /= 255;
            if (param[1] > 1) param[1] /= 255;
            if (param[2] > 1) param[2] /= 255;
        }

        return mod.CreateVector(param[0], param[1], param[2]);
    }
    
    return param;
}

function __asModMessage(param: string | mod.Message): mod.Message
{
    if (typeof (param) === "string")
        return mod.Message(param);

    return param;
}

function __fillInDefaultArgs(params: UIParams): UIParamsWithDefaultFilled 
{
    if (!params.hasOwnProperty('name'))
        params.name = "";
    if (!params.hasOwnProperty('position'))
        params.position = mod.CreateVector(0, 0, 0);
    if (!params.hasOwnProperty('size'))
        params.size = mod.CreateVector(100, 100, 0);
    if (!params.hasOwnProperty('anchor'))
        params.anchor = mod.UIAnchor.Center;
    if (!params.hasOwnProperty('parent'))
        params.parent = mod.GetUIRoot();
    if (!params.hasOwnProperty('visible'))
        params.visible = true;
    if (!params.hasOwnProperty('padding'))
        params.padding = 10;
    if (!params.hasOwnProperty('bgColor'))
        params.bgColor = mod.CreateVector(1, 1, 1); // white
    if (!params.hasOwnProperty('bgAlpha'))
        params.bgAlpha = 1.0;
    if (!params.hasOwnProperty('bgFill'))
        params.bgFill = mod.UIBgFill.Solid;

    return params as UIParamsWithDefaultFilled;
}

function __setNameAndGetWidget(uniqueName: string, params: UIParamsWithDefaultFilled): mod.UIWidget
{
    let widget = mod.FindUIWidgetWithName(uniqueName) as mod.UIWidget;
    mod.SetUIWidgetName(widget, params.name);
    return widget;
}

const __cUniqueName = "----uniquename----";

function __addUIContainer(params: UIParams) {
    const params2 = __fillInDefaultArgs(params);
    const restrict = params2.team ?? params2.player;

    if (restrict) {
        mod.AddUIContainer(__cUniqueName,
            __asModVector(params2.position),
            __asModVector(params2.size),
            params2.anchor,
            params2.parent,
            params2.visible,
            params2.padding,
            __asModVector(params2.bgColor, true),
            params2.bgAlpha,
            params2.bgFill,
            restrict);
    } else {
        mod.AddUIContainer(__cUniqueName,
            __asModVector(params2.position),
            __asModVector(params2.size),
            params2.anchor,
            params2.parent,
            params2.visible,
            params2.padding,
            __asModVector(params2.bgColor, true),
            params2.bgAlpha,
            params2.bgFill);
    }

    const widget = __setNameAndGetWidget(__cUniqueName, params2);
    if (params2.children) {
        params2.children.forEach((childParams: UIParams) => {
            childParams.parent = widget;
            ParseUI(childParams);
        });
    }
    return widget;
}

function __fillInDefaultTextArgs(params: UIParams): UIParamsWithDefaultFilled
{
    if (!params.hasOwnProperty('textLabel'))
        params.textLabel = "{missing text}";
    if (!params.hasOwnProperty('textSize'))
        params.textSize = 50;
    if (!params.hasOwnProperty('textColor'))
        params.textColor = mod.CreateVector(0.25, 0.25, 0.25); // (63/63/63) #3F3F3F black grey / charcoal;
    if (!params.hasOwnProperty('textAlpha'))
        params.textAlpha = 1;
    if (!params.hasOwnProperty('textAnchor'))
        params.textAnchor = mod.UIAnchor.Center;

    return params as UIParamsWithDefaultFilled;
}

function __addUIText(params: UIParams): mod.UIWidget {
    const params2 = __fillInDefaultArgs(params);
    const params3 = __fillInDefaultTextArgs(params2);

    let restrict = params3.team ?? params3.player;
    if (restrict) {
        mod.AddUIText(__cUniqueName,
            __asModVector(params3.position),
            __asModVector(params3.size),
            params3.anchor,
            params3.parent,
            params3.visible,
            params3.padding,
            __asModVector(params3.bgColor, true),
            params3.bgAlpha,
            params3.bgFill,
            __asModMessage(params3.textLabel),
            params3.textSize,
            __asModVector(params3.textColor, true),
            params3.textAlpha,
            params3.textAnchor,
            restrict);
    } else {
        mod.AddUIText(__cUniqueName,
            __asModVector(params3.position),
            __asModVector(params3.size),
            params3.anchor,
            params3.parent,
            params3.visible,
            params3.padding,
            __asModVector(params3.bgColor, true),
            params3.bgAlpha,
            params3.bgFill,
            __asModMessage(params3.textLabel),
            params3.textSize,
            __asModVector(params3.textColor, true),
            params3.textAlpha,
            params3.textAnchor);
    }
    return __setNameAndGetWidget(__cUniqueName, params3);
}

function __fillInDefaultImageArgs(params: UIParams): UIParamsWithDefaultFilled
{
    if (!params.hasOwnProperty('imageType'))
        params.imageType = mod.UIImageType.None;
    if (!params.hasOwnProperty('imageColor'))
        params.imageColor = mod.CreateVector(1, 1, 1);
    if (!params.hasOwnProperty('imageAlpha'))
        params.imageAlpha = 1;

    return params as UIParamsWithDefaultFilled;
}

function __addUIImage(params: UIParams): mod.UIWidget
{
    const params2 = __fillInDefaultImageArgs(__fillInDefaultArgs(params));
    const restrict = params2.team ?? params2.player;

    if (restrict) {
        mod.AddUIImage(__cUniqueName,
            __asModVector(params2.position),
            __asModVector(params2.size),
            params2.anchor,
            params2.parent,
            params2.visible,
            params2.padding,
            __asModVector(params2.bgColor, true),
            params2.bgAlpha,
            params2.bgFill,
            params2.imageType,
            __asModVector(params2.imageColor, true),
            params2.imageAlpha,
            restrict);
    } else {
        mod.AddUIImage(__cUniqueName,
            __asModVector(params2.position),
            __asModVector(params2.size),
            params2.anchor,
            params2.parent,
            params2.visible,
            params2.padding,
            __asModVector(params2.bgColor, true),
            params2.bgAlpha,
            params2.bgFill,
            params2.imageType,
            __asModVector(params2.imageColor, true),
            params2.imageAlpha);
    }

    return __setNameAndGetWidget(__cUniqueName, params2);
}

function __fillInDefaultButtonArgs(params: UIParams): UIParamsWithDefaultFilled
{
    if (!params.hasOwnProperty('buttonEnabled'))
        params.buttonEnabled = true;
    if (!params.hasOwnProperty('buttonColorBase'))
        params.buttonColorBase = mod.CreateVector(0.7, 0.7, 0.7);
    if (!params.hasOwnProperty('buttonAlphaBase'))
        params.buttonAlphaBase = 1;
    if (!params.hasOwnProperty('buttonColorDisabled'))
        params.buttonColorDisabled = mod.CreateVector(0.2, 0.2, 0.2);
    if (!params.hasOwnProperty('buttonAlphaDisabled'))
        params.buttonAlphaDisabled = 0.5;
    if (!params.hasOwnProperty('buttonColorPressed'))
        params.buttonColorPressed = mod.CreateVector(0.25, 0.25, 0.25);
    if (!params.hasOwnProperty('buttonAlphaPressed'))
        params.buttonAlphaPressed = 1;
    if (!params.hasOwnProperty('buttonColorHover'))
        params.buttonColorHover = mod.CreateVector(1, 1, 1);
    if (!params.hasOwnProperty('buttonAlphaHover'))
        params.buttonAlphaHover = 1;
    if (!params.hasOwnProperty('buttonColorFocused'))
        params.buttonColorFocused = mod.CreateVector(1, 1, 1);
    if (!params.hasOwnProperty('buttonAlphaFocused'))
        params.buttonAlphaFocused = 1;

    return params as UIParamsWithDefaultFilled;
}

function __addUIButton(params: UIParams): mod.UIWidget
{
    const params2 = __fillInDefaultButtonArgs(__fillInDefaultArgs(params));
    const restrict = params2.team ?? params2.player;

    if (restrict) {
        mod.AddUIButton(__cUniqueName,
            __asModVector(params2.position),
            __asModVector(params2.size),
            params2.anchor,
            params2.parent,
            params2.visible,
            params2.padding,
            __asModVector(params2.bgColor, true),
            params2.bgAlpha,
            params2.bgFill,
            params2.buttonEnabled,
            __asModVector(params2.buttonColorBase, true), params2.buttonAlphaBase,
            __asModVector(params2.buttonColorDisabled, true), params2.buttonAlphaDisabled,
            __asModVector(params2.buttonColorPressed, true), params2.buttonAlphaPressed,
            __asModVector(params2.buttonColorHover, true), params2.buttonAlphaHover,
            __asModVector(params2.buttonColorFocused, true), params2.buttonAlphaFocused,
            restrict);
    } else {
        mod.AddUIButton(__cUniqueName,
            __asModVector(params2.position),
            __asModVector(params2.size),
            params2.anchor,
            params2.parent,
            params2.visible,
            params2.padding,
            __asModVector(params2.bgColor, true),
            params2.bgAlpha,
            params2.bgFill,
            params2.buttonEnabled,
            __asModVector(params2.buttonColorBase, true), params2.buttonAlphaBase,
            __asModVector(params2.buttonColorDisabled, true), params2.buttonAlphaDisabled,
            __asModVector(params2.buttonColorPressed, true), params2.buttonAlphaPressed,
            __asModVector(params2.buttonColorHover, true), params2.buttonAlphaHover,
            __asModVector(params2.buttonColorFocused, true), params2.buttonAlphaFocused);
    }

    return __setNameAndGetWidget(__cUniqueName, params2);
}

export function ParseUI(params: UIParams): mod.UIWidget
{
    switch(params.type) {
        case UIWidgetType.Container: return __addUIContainer(params);
        case UIWidgetType.Text: return __addUIText(params);
        case UIWidgetType.Image: return __addUIImage(params);
        case UIWidgetType.Button: return __addUIButton(params);           
    }
    
    throw new Error("no specified UI type");
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// src/DevTools.ts

export class DevTools
{
    log(message: string, player: mod.Player|null = null): void
    {
    	if (player !== null) {
	        mod.DisplayHighlightedWorldLogMessage(mod.Message(mod.stringkeys.any, message), player);
    	} else {
    		mod.DisplayHighlightedWorldLogMessage(mod.Message(mod.stringkeys.any, message));
    	}
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// src/code.ts

// import {ParseUI, UIWidgetType} from './UIHelpers';
// import {DevTools} from './DevTools';
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
// concatenated files:
// - src/UIHelpers.ts
// - src/DevTools.ts
// - src/code.ts
