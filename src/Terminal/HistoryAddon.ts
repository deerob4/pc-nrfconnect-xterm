import { Terminal, ITerminalAddon } from 'xterm';
import TerminalCommander from './TerminalCommander';
import { charCode, CharCodes } from './utils';

export default class HistoryAddon implements ITerminalAddon {
    private history: string[] = [];
    private currentIndex = -1;
    private terminal!: Terminal;
    private commander: TerminalCommander;

    constructor(commander: TerminalCommander) {
        this.commander = commander;
    }

    public activate(terminal: Terminal): void {
        this.terminal = terminal;

        this.terminal.onData(data => {
            if (charCode(data) === CharCodes.LF) {
                this.addToHistory(this.commander.output);
                this.moveToFront();
            }
        });

        this.terminal.onKey(e => {
            switch (e.domEvent.key) {
                case 'ArrowUp':
                    return this.moveBackwards();
                case 'ArrowDown':
                    return this.moveForwards();
            }
        });
    }

    public dispose(): void {
        this.history = [];
    }

    /**
     * Adds `command` to the terminal buffer, allowing it to be
     * retrieved using the arrow keys and search-function.
     * @param command The command to add to the history buffer.
     */
    public addToHistory(command: string): void {
        if (command.length && charCode(command) !== CharCodes.LF) {
            this.history.unshift(command);
        }
    }

    /**
     * Moves the position in the history to the front, so the last
     * command to be saved will be the next one returned.
     */
    public moveToFront() {
        this.currentIndex = -1;
    }

    /**
     * The command at the current history position.
     */
    public get currentCommand(): string {
        return this.history[this.currentIndex];
    }

    private moveForwards(): void {
        if (this.currentIndex < 0) return;
        this.currentIndex -= 1;
        const command = this.currentIndex === -1 ? '' : this.currentCommand;
        this.commander.replaceCommandWith(command);
    }

    private moveBackwards(): void {
        if (this.currentIndex >= this.history.length - 1) return;
        this.currentIndex += 1;
        this.commander.replaceCommandWith(this.currentCommand);
    }
}
