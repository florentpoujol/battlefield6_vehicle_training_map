
/**
 * Script for the "Florent's Vehicle Training" map on Mirak 
 * Build by Florent Poujol
 * Sources: https://github.com/florentpoujol/battlefield6_vehicle_training_map
 * Built on: Mon Nov  3 23:45:28     2025
 */

////////////////////////////////////////////////////////////////////////////////////////////////////
// src/UIHelpers.ts

/**
 * Helper functions to create UI from a JSON object tree.
 * Taken from the example mods.
 * 
 * This has been modified with the following differences:
 * - The type is now the UIWidgetType enum
 * - the colors can be set as an RGB array
 * - main method is CreateUI() instead of ParseUI()
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
            CreateUI(childParams);
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

export function CreateUI(params: UIParams): mod.UIWidget
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
    public log(message: string|mod.Message): void
    {
        const date = new Date();
        const timeElapsed = mod.GetMatchTimeElapsed().toFixed(3);

        console.log(
            `[${date.getMinutes()}m ${date.getSeconds()}s ${date.getMilliseconds()}ms] `, 
            `[${timeElapsed}] `, 
            message
        );
    }

    private loggedOnce: {[index: string]: boolean} = {};

    public logOnce(message: string): void
    {
        if (this.loggedOnce.hasOwnProperty(message)) {
            return;
        }

        this.loggedOnce[message] = true;

        this.log('[ONCE] ' + message);
    }

    public getRandomValueInArray<T>(array: Array<T>): T
    {
        return array[Math.floor(Math.random() * array.length)];
    }

    public vectorToString(vector: mod.Vector): string
    {
        return `(${mod.XComponentOf(vector)}, ${mod.YComponentOf(vector)}, ${mod.ZComponentOf(vector)})`
    }

    public isPlayerCloseTo(player: mod.Player, position: mod.Vector, maxDistance: number = 10): boolean
    {
        const playerPos = mod.GetSoldierState(player, mod.SoldierStateVector.GetPosition);

        return mod.DistanceBetween(playerPos, position) < maxDistance;
    }
}

export const devTools = new DevTools();

////////////////////////////////////////////////////////////////////////////////////////////////////
// src/VehicleManager.ts

// vehicle spawners are scatered around the map
// when they spawn, they spawn AIs and set them in their seat
// there is only a single AI spawner, so this is fairly slow, but it's OK

// import { devTools } from "./DevTools";

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

////////////////////////////////////////////////////////////////////////////////////////////////////
// src/AiPathManager.ts

// import {mod} from './index.d.ts';
// import {devTools} from "./DevTools";

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

////////////////////////////////////////////////////////////////////////////////////////////////////
// src/main.ts

/** @ts-ignore */
// import {mod} from './index.d.ts';
// import {CreateUI, UIWidgetType} from './UIHelpers';
// import {devTools} from './DevTools';
// import {vehicleManager} from './VehicleManager';
// import {AiPathManager} from "./AiPathManager";

// replaced by the concatenation script
const DEBUG_SCRIPT_BUILD_TIME = 'Mon Nov  3 23:45:28     2025'; 

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
// concatenated files:
// - src/UIHelpers.ts
// - src/DevTools.ts
// - src/VehicleManager.ts
// - src/AiPathManager.ts
// - src/main.ts
