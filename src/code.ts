

/*
on game mode start


spawn vehicles that moves between two points

*/

let team1hqPosition: Vector;
let team2hqPosition: Vector;

export function OnGameModeStarted(): void
{
	console.log("Florent's Vehicle Training map started !");

	// spawn vehicle
	// Moves the Object by the delta position and rotation over the time provided. Options to loop indefinitely and reverse
    // mode.MoveObjectOverTime(
    //     object: mod.Object,
    //     positionDelta: Vector,
    //     rotationDelta: Vector,
    //     timeInSeconds: number,
    //     shouldLoop: boolean,
    //     shouldReverse: boolean
    // ): void;



    // team1hqPosition = mod.GetObjectPosition(mod.GetHQ(1))
    // team2hqPosition = mod.GetObjectPosition(mod.GetHQ(2))
}


// allow to spawn : 
// - when a player whant one, spawn the vehicle and Move the vehicle
// ou just SpawnObject(RuntimeSpawn_Common.{VehicleOfChoise}, position)


export function OnPlayerDeployed(eventPlayer: mod.Player): void 
{
export function OnPlayerDeployed(eventPlayer: mod.Player): void 
{
    console.log(mod.stringkeys.player_spawned);
    
    let msg = mod.Message(mod.stringkeys.builtin_message);
    mod.DisplayNotificationMessage(msg, eventPlayer);

    msg = mod.Message(mod.stringkeys.world_log);
    mod.DisplayHighlightedWorldLogMessage(msg, eventPlayer);

    msg = mod.Message(mod.stringkeys.custom_1);
    mod.DisplayCustomNotificationMessage(msg, mod.CustomNotificationSlots.HeaderText, 60, eventPlayer);

    msg = mod.Message(mod.stringkeys.custom_2);
    mod.DisplayCustomNotificationMessage(msg, mod.CustomNotificationSlots.MessageText1, 60, eventPlayer);

    msg = mod.Message(mod.stringkeys.custom_3);
    mod.DisplayCustomNotificationMessage(msg, mod.CustomNotificationSlots.MessageText2, 60, eventPlayer);

    msg = mod.Message(mod.stringkeys.custom_4);
    mod.DisplayCustomNotificationMessage(msg, mod.CustomNotificationSlots.MessageText3, 60, eventPlayer);

    msg = mod.Message(mod.stringkeys.custom_5);
    mod.DisplayCustomNotificationMessage(msg, mod.CustomNotificationSlots.MessageText4, 60, eventPlayer);
}
}
