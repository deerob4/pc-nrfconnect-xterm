import { Terminal, ITerminalAddon } from 'xterm';
import * as ansi from 'ansi-escapes';
import * as c from 'ansi-colors';

import HistoryAddon from './addons/HistoryAddon';
import TimestampAddon from './addons/TimestampAddon';
import CopyPasteAddon from './addons/CopyPasteAddon';
import AutocompleteAddon from './addons/AutocompleteAddon';
import HoverAddon from './addons/HoverAddon';

import { charCode, CharCodes, devReloadWindow } from './utils';

export interface KeyEvent {
    key: string;
    domEvent: KeyboardEvent;
}

export type OutputChangeListener = (output: string) => void;

/**
 * Contains logic and control code for the most common terminal tasks,
 * like typing, moving the caret, and running commands.
 *
 * Some of this logic is exposed as public methods, allowing addons
 * to make use of it.
 *
 * Those same addons are loaded as part of this addon's activation
 * process, so this class can be thought of as the "root" of the
 * addon tree.
 */
export default class TerminalCommander implements ITerminalAddon {
    private terminal!: Terminal;

    private _output: string = '';
    private historyAddon!: HistoryAddon;

    private _lineSpan = 0;
    private registeredCommands: { [command: string]: () => void } = {};
    private outputChangeListeners: OutputChangeListener[] = [];

    /**
     * The characters written at the beginning of each new line.
     */
    public readonly prompt: string;

    constructor(prompt: string) {
        this.prompt = `\n\r${prompt} `;
    }

    public activate(terminal: Terminal) {
        this.terminal = terminal;

        const historyAddon = new HistoryAddon(this);
        this.historyAddon = historyAddon;
        this.terminal.loadAddon(historyAddon);

        const timestampAddon = new TimestampAddon(this);
        this.terminal.loadAddon(timestampAddon);

        const copyPasteAddon = new CopyPasteAddon(this);
        this.terminal.loadAddon(copyPasteAddon);

        const autocompleteAddon = new AutocompleteAddon(this, []);
        this.terminal.loadAddon(autocompleteAddon);

        const hoverAddon = new HoverAddon(this);
        this.terminal.loadAddon(hoverAddon);

        this.terminal.onKey(this.onKey.bind(this));
        this.terminal.onData(this.onData.bind(this));

        this.registerCommand('toggle_timestamps', () => {
            timestampAddon.toggleTimestamps();
        });

        this.registerCommand('show_history', () => {
            console.log(historyAddon.history);
        });

        this.registerCommand('clear_history', () => {
            historyAddon.clearHistory();
        });
    }

    public dispose() {
        return false;
    }

    /**
     * The value of the current line.
     */
    public get output() {
        return this._output || '';
    }

    /**
     * The number of lines spanned by the current command.
     */
    public get lineSpan() {
        return this._lineSpan;
    }

    /**
     * Removes the command currently being entered into the buffer
     * and replaces it with `newCommand`.
     * @param newCommand The command to write to the screen.
     */
    public replaceCommandWith(newCommand: string): void {
        this.clearInput();
        this.terminal.write(newCommand);
        this.setOutput(newCommand);
    }

    /**
     * Returns `true` if the cursor is placed at the beginning of
     * the line (i.e. right after the prompt), otherwise `false`.
     */
    public atBeginningOfLine(): boolean {
        const buffer = this.terminal.buffer.active;
        return buffer.cursorX <= this.prompt.length - 2;
    }

    /**
     * Returns `true` if the cursor is placed at the end of
     * the line (i.e. one character after the final one typed),
     * otherwise `false`.
     */
    public atEndOfLine(): boolean {
        const maxRightCursor = this.prompt.length - 2 + this.output.length;
        const buffer = this.terminal.buffer.active;
        return buffer.cursorX >= maxRightCursor;
    }

    /**
     * Removes all the typed characters on the current line, and
     * moves the cursor to the beginning.
     */
    public clearInput(): void {
        const charsToDelete = this.output.length - 1;
        for (let i = 0; i <= charsToDelete; i += 1) {
            this.backspace();
        }
    }

    /**
     * Adds an event listener for when the output changes. This happens
     * on more or less every keypress into the terminal, so `listener`
     * should not be expensive.
     *
     * The advantage of using this method rather than the underlying
     * terminal's `onData` or `onKey` callbacks is that the output is
     * guaranteed to be the latest, whereas the other callbacks can
     * result in a race condition when accessing the output.
     *
     * @param listener The callback function to call.
     */
    public onOutputChange(listener: OutputChangeListener): void {
        this.outputChangeListeners.push(listener);
    }

    /**
     * Registers the given `command` in the terminal, such that when it is
     * executed `callback` is run.
     * @param command The command to listen for.
     * @param callback The function to run when the command is given.
     */
    private registerCommand(command: string, callback: () => void): void {
        this.registeredCommands[command] = callback;
    }

    private backspace(): void {
        if (!this.atBeginningOfLine()) {
            this.terminal.write('\b \b');
            this.setOutput(this.output.slice(0, this.output.length - 1));
        }
    }

    private moveCaretLeft(): void {
        if (!this.atBeginningOfLine()) {
            this.terminal.write(ansi.cursorBackward(1));
        }
    }

    private moveCaretRight(): void {
        if (!this.atEndOfLine()) {
            this.terminal.write(ansi.cursorForward(1));
        }
    }

    private runCommand(): void {
        const callback = this.registeredCommands[this.output];
        if (callback) {
            callback();
        }
        this.writeNewLine();
    }

    private writeNewLine(): void {
        this.terminal.write(this.prompt);
        this.historyAddon.resetCursor();
        this.setOutput('');
    }

    private onData(data: string): void {
        if (charCode(data) === CharCodes.ARROW_KEY) return;

        if (charCode(data) === CharCodes.BACKSPACE) {
            return this.backspace();
        }
        if (charCode(data) === CharCodes.LF) {
            if (this.output.length) {
                return this.runCommand();
            }
        }

        this.setOutput(this.output + data);
        this.updateLineSpan();

        this.terminal.write(data);
    }

    private onKey(e: KeyEvent): void {
        switch (e.domEvent.code) {
            case 'ArrowLeft': {
                return this.moveCaretLeft();
            }
            case 'ArrowRight': {
                return this.moveCaretRight();
            }
            case 'KeyC': {
                if (e.domEvent.ctrlKey) this.writeNewLine();
                break;
            }
            case 'KeyR': {
                if (e.domEvent.ctrlKey) devReloadWindow();
                break;
            }
        }
    }

    private updateLineSpan() {
        const delta = this.terminal.cols - this.prompt.length;
        this._lineSpan = Math.floor(this.output.length / delta);
    }

    private setOutput(newOutput: string) {
        // this.outputChangeListeners.forEach(f => f(newOutput));
        this._output = newOutput;
    }
}
