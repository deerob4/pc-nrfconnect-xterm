import { Terminal, ITerminalAddon } from 'xterm';
import { logger } from 'pc-nrfconnect-shared';
import TerminalCommander from './TerminalCommander';

/**
 * Manages the lifecycle of a terminal extension, and provides
 * access to the `xterm.js` and `TerminalCommander` instances.
 */
export default abstract class TerminalAddon implements ITerminalAddon {
    /**
     * The name of the addon, used to identify it in debug messages and similar.
     */
    abstract name: string;

    protected terminal!: Terminal;
    protected commander: TerminalCommander;

    constructor(commander: TerminalCommander) {
        this.commander = commander;
    }

    /**
     * Called when the addon is first loaded into the `xterm.js`
     * terminal instance.
     *
     * All the addon's setup code, i.e. registering event listeners,
     * should take place here.
     */
    protected abstract onActivate(): void;

    protected debug(message: string, ...meta: unknown[]) {
        logger.debug(`[${this.name}] ${message}`, meta);
    }

    public activate(terminal: Terminal) {
        logger.info(`Loaded ${this.name}`);
        this.terminal = terminal;
        this.onActivate();
    }

    public dispose() {
        logger.debug(`Disposing of ${this.name}`);
    }
}
