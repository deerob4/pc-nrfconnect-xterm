import TerminalAddon from '../TerminalAddon';
import * as c from 'ansi-colors';
import { charCode, CharCodes } from '../utils';

export default class HistoryAddon extends TerminalAddon {
    public name = 'HistoryAddon';

    private _history: string[] = [];
    private currentIndex = -1;

    protected onActivate(): void {
        this.terminal.onData(data => {
            if (charCode(data) === CharCodes.LF) {
                console.log(this.commander.output);
                this.addToHistory(this.commander.output);
                this.resetCursor();
            }
        });

        this.terminal.onKey(e => {
            switch (e.domEvent.code) {
                case 'ArrowUp':
                    return this.moveBackwards();
                case 'ArrowDown':
                    return this.moveForwards();
            }
        });
    }

    /**
     * Adds `command` to the terminal buffer, allowing it to be
     * retrieved using the arrow keys and search-function.
     * @param command The command to add to the history buffer.
     */
    public addToHistory(command: string): void {
        if (command.length && charCode(command) !== CharCodes.LF) {
            this._history.unshift(command);
        }
    }

    /**
     * Moves the position in the history to the front, so the last
     * command to be saved will be the next one returned.
     */
    public resetCursor() {
        this.currentIndex = -1;
    }

    /**
     * Removes all the commands saved into the history list.
     */
    public clearHistory() {
        this._history = [];
        this.currentIndex = -1;
    }

    /**
     * The command at the current history position.
     */
    public get currentCommand(): string {
        return this._history[this.currentIndex];
    }

    /**
     * A list of commands saved to the history list.
     */
    public get history(): string[] {
        return this._history;
    }

    private moveForwards(): void {
        if (this.currentIndex < 0) return;
        this.currentIndex -= 1;
        console.log(this.currentIndex);
        console.log(this.history);
        const command = this.currentIndex === -1 ? '' : this.currentCommand;
        this.commander.replaceCommandWith(command);
    }

    private moveBackwards(): void {
        if (this.currentIndex >= this._history.length - 1) return;
        this.currentIndex += 1;
        console.log(this.currentIndex);
        console.log(this.history);
        this.commander.replaceCommandWith(`${this.currentCommand}`);
    }
}
