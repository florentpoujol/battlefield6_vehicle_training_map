
/*

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
*/


    // ParseUI({
    //     player: player,
    //     type: UIWidgetType.Container,
    //     name: "container_" + playerId,
    //     position: [0, 0], // position relative à l'ancre
    //     size: [800, 800], // what is the Z ?
    //     bgColor: [1, 1, 1], // white
    //     bgFill: mod.UIBgFill.Blur,
    //     bgAlpha: 0.8,
    //     padding: 10, // pixels
    //     visible: true,
    //     children: [
    //         {
    //             type: UIWidgetType.Button,
    //             name: "close_button_" + playerId,
    //             size: [30, 30],
    //             position: [0, 0],
    //             anchor: mod.UIAnchor.TopRight,
    //             bgFill: mod.UIBgFill.Solid,
    //             bgColor: [255, 0, 0],
    //             padding: 5,
    //             children: [
    //                 {
    //                     type: UIWidgetType.Text,
    //                     anchor: mod.UIAnchor.TopRight,
    //                     bgFill: mod.UIBgFill.None,
    //                     textLabel: mod.stringkeys.close_button,
    //                     textSize: 25,
    //                 }
    //             ]
    //         },
    //         {
    //             type: UIWidgetType.Text,
    //             position: [0, 50],
    //             size: [750, 750],
    //             anchor: mod.UIAnchor.TopLeft,
    //             bgFill: mod.UIBgFill.Solid,
    //             textLabel: mod.stringkeys.lorem,
    //             textSize: 15,
    //             textColor: [0, 0, 0],
    //             bgColor: [0, 255, 0],
    //             bgAlpha: 0.1
    //         }
    //     ]
    // });

    // const button = mod.FindUIWidgetWithName("close_button_" +  playerId);
    // mod.EnableUIButtonEvent(button, mod.UIButtonEvent.ButtonUp, true);
    // mod.EnableUIInputMode(true, player);