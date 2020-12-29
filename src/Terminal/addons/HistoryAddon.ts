import { charCode, CharCodes } from '../utils';
import TerminalAddon from '../TerminalAddon';

export default class HistoryAddon extends TerminalAddon {
    public name = 'HistoryAddon';

    private _history: string[] = [];
    private currentIndex = -1;

    protected onActivate(): void {
        this.terminal.onData(data => {
            if (
                charCode(data) === CharCodes.LF &&
                this.commander.output.trim().length
            ) {
                this.addToHistory(this.commander.output);
                this.resetCursor();
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

    private addToHistory(command: string): void {
        if (command.length && charCode(command) !== CharCodes.LF) {
            this._history.unshift(command);
        }
    }

    private moveForwards(): void {
        if (this.currentIndex < 0) return;
        this.currentIndex -= 1;
        const command = this.currentIndex === -1 ? '' : this.currentCommand;
        this.commander.replaceInputWith(command);
    }

    private moveBackwards(): void {
        if (this.currentIndex >= this.history.length - 1) return;
        this.currentIndex += 1;
        this.commander.replaceInputWith(this.currentCommand);
    }

    /**
     * A list of commands saved to the history list.
     */
    public get history() {
        return this._history;
    }

    /**
     * The command at the current history position.
     */
    public get currentCommand(): string {
        return this.history[this.currentIndex];
    }

    /**
     * Moves the position in the history to the front, so the last
     * command to be saved will be the next one returned.
     */
    public resetCursor(): void {
        this.currentIndex = -1;
    }

    /**
     * Removes all the commands saved into the history list.
     */
    public clearHistory(): void {
        this._history = [];
        this.currentIndex = -1;
    }
}
