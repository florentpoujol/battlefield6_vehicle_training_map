
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
