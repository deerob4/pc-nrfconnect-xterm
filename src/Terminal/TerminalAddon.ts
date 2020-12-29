import { Terminal, ITerminalAddon } from 'xterm';
import { logger } from 'pc-nrfconnect-shared';
import TerminalCommander from './TerminalCommander';

export default abstract class TerminalAddon implements ITerminalAddon {
    abstract name: string;

    protected terminal!: Terminal;
    protected commander: TerminalCommander;

    constructor(commander: TerminalCommander) {
        this.commander = commander;
    }

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

    protected abstract onActivate(): void;
}
