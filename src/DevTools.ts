
export class DevTools
{
    log(message: string|mod.Message): void
    {
        const date = new Date();
        const dateStr = `[${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}] `;
        const callingFunction = (new Error()).stack.split('\n')[2].trim();
        console.log(dateStr, callingFunction, message);
    }

    #loggedOnce: {[index: string]: boolean} = {};

    logOnce(message: string): void
    {
        if (this.#loggedOnce.hasOwnProperty(message)) {
            return;
        }

        this.#loggedOnce[message] = true;

        this.log('[ONCE] ' + message);
    }
}
