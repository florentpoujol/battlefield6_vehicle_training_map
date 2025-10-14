
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
