import { Terminal, ITerminalAddon } from 'xterm';
import TerminalCommander from './TerminalCommander';
import { logger } from 'pc-nrfconnect-shared';

export default abstract class TerminalAddon implements ITerminalAddon {
    /**
     * The name of the addon, used in debug logs and similar.
     */
    public abstract name: string;

    /**
     * Instance of the `xterm.js` terminal the add-on is loaded into.
     */
    protected terminal!: Terminal;
    protected commander: TerminalCommander;

    constructor(commander: TerminalCommander) {
        this.commander = commander;
    }

    /**
     * Called when the addon is first activated by the underlying terminal.
     *
     * Use this to add event handlers and the like to the terminal instance.
     */
    protected abstract onActivate(): void;

    public activate(terminal: Terminal) {
        logger.info(`Loaded ${this.name}`);
        this.terminal = terminal;
        this.onActivate();
    }

    public dispose() {
        logger.debug(`Disposing of ${this.name}`);
    }

    protected debug(message: string) {
        logger.debug(`[${this.name}] ${message}`);
    }
}
