import { Terminal, ITerminalAddon } from 'xterm';
import * as ansi from 'ansi-escapes';

import Prompt from './Prompt';
import HistoryAddon from './addons/HistoryAddon';
import TimestampAddon from './addons/TimestampAddon';
import CopyPasteAddon from './addons/CopyPasteAddon';
import AutocompleteAddon, { Completion } from './addons/AutocompleteAddon';

import { charCode, CharCodes, devReloadWindow, isMac } from './utils';
import HoverAddon, { HoverMetadata } from './addons/HoverAddon';

export interface KeyEvent {
    key: string;
    domEvent: KeyboardEvent;
}

export type OutputListener = (output: string) => void;

const completions: Completion[] = [
    {
        value: 'toggle_history',
        description: 'Toggles history on and off',
    },
    {
        value: 'toggle_timestamps',
        description: 'Toggles the line numbers on and off',
    },
    {
        value: '+CGEREP',
        description:
            'The `+CGEREP` command enables or disables the sending of packet domain events.',
    },
];

interface NrfTerminalConfig {
    prompt: string;
    completions: Completion[];
    commands: { [name: string]: () => void };
    hoverMetadata: HoverMetadata[];
}

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
    #terminal!: Terminal;
    #prompt: Prompt;
    #historyAddon!: HistoryAddon;
    autocompleteAddon!: AutocompleteAddon;

    #lineSpan = 0;
    #lineCount = 1;
    #outputValue = '';

    #registeredCommands: { [command: string]: () => void } = {};
    #outputListeners: ((output: string) => void)[] = [];

    constructor(promptTemplate: string) {
        this.#prompt = new Prompt(this, promptTemplate);
    }

    public activate(terminal: Terminal) {
        this.#terminal = terminal;

        const historyAddon = new HistoryAddon(this);
        this.#historyAddon = historyAddon;
        this.#terminal.loadAddon(historyAddon);

        const timestampAddon = new TimestampAddon(this);
        this.#terminal.loadAddon(timestampAddon);

        const copyPasteAddon = new CopyPasteAddon(this);
        this.#terminal.loadAddon(copyPasteAddon);

        const autocompleteAddon = new AutocompleteAddon(this, completions);
        this.#terminal.loadAddon(autocompleteAddon);
        this.autocompleteAddon = autocompleteAddon;

        const hoverAddon = new HoverAddon(this, []);
        this.#terminal.loadAddon(hoverAddon);

        this.#terminal.onKey(this.onKey.bind(this));
        this.#terminal.onData(this.onData.bind(this));

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
        return this.#outputValue;
    }

    private set _output(newOutput: string) {
        this.#outputValue = newOutput;
        this.#outputListeners.forEach(l => l(this.output));
    }

    /**
     * The number of lines spanned by the current command.
     */
    public get lineSpan() {
        return this.#lineSpan;
    }

    public get lineCount() {
        return this.#lineCount;
    }

    public get prompt() {
        return this.#prompt;
    }

    /**
     * Registers the given `command` in the terminal, such that when it is
     * executed `callback` is run.
     * @param command The command to listen for.
     * @param callback The function to run when the command is given.
     */
    private registerCommand(command: string, callback: () => void): void {
        this.#registeredCommands[command] = callback;
    }

    /**
     * Registers a function that will be called whenever the output changes,
     * with the new output value.
     * @param listener The function to call when the output changes.
     */
    public registerOutputListener(listener: (output: string) => void): void {
        this.#outputListeners.push(listener);
    }

    /**
     * Removes the command currently being entered into the buffer
     * and replaces it with `newCommand`.
     * @param newCommand The command to write to the screen.
     */
    public replaceInputWith(newCommand: string): void {
        this.clearInput();
        this.#terminal.write(newCommand);
        this._output = newCommand;
    }

    /**
     * Returns `true` if the cursor is placed at the beginning of
     * the line (i.e. right after the prompt), otherwise `false`.
     */
    public atBeginningOfLine(): boolean {
        const buffer = this.#terminal.buffer.active;
        return buffer.cursorX <= this.#prompt.length - 2;
    }

    /**
     * Returns `true` if the cursor is placed at the end of
     * the line (i.e. one character after the final one typed),
     * otherwise `false`.
     */
    public atEndOfLine(): boolean {
        const maxRightCursor = this.#prompt.length - 2 + this.output.length;
        const buffer = this.#terminal.buffer.active;
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

    private backspace(): void {
        if (!this.atBeginningOfLine()) {
            this.#terminal.write('\b \b');
            this._output = this.output.slice(0, this.output.length - 1);
        }
    }

    private moveCaretLeft(): void {
        if (!this.atBeginningOfLine()) {
            this.#terminal.write(ansi.cursorBackward(1));
        }
    }

    private moveCaretRight(): void {
        if (!this.atEndOfLine()) {
            this.#terminal.write(ansi.cursorForward(1));
        }
    }

    private runCommand(): void {
        if (this.output.trim().length) {
            const callback = this.#registeredCommands[this.output];
            if (callback) {
                callback();
            }
        }

        this.breakCurrentCommand();
    }

    /**
     * Prints a new prompt and removes the currently entered
     * text. Useful whenever a new line of input needs to be
     * started, i.e. because a command was just run.
     */
    private breakCurrentCommand() {
        this.#terminal.write(this.#prompt.value);
        this.#historyAddon.resetCursor();
        this._output = '';
        this.#lineCount += 1;
    }

    private onData(data: string): void {
        switch (charCode(data)) {
            case CharCodes.CTRL_C:
            case CharCodes.ARROW_KEY:
                return;

            case CharCodes.BACKSPACE:
                return this.backspace();

            case CharCodes.LF:
                if (!this.autocompleteAddon.isVisible) {
                    return this.runCommand();
                }
        }

        this._output = this.output + data;
        this.updateLineSpan();
        this.autocompleteAddon.enable();
        this.#terminal.write(data);
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
                if (!e.domEvent.ctrlKey) break;
                // On Windows and Linux, pressing Ctrl-C when text is selected
                // should copy that text rather than breaking the line.
                if (!isMac() && this.#terminal.getSelection().length) break;
                this.breakCurrentCommand();
                break;
            }

            case 'KeyR': {
                if (e.domEvent.ctrlKey && !isMac()) devReloadWindow();
                break;
            }
        }
    }

    private updateLineSpan() {
        const delta = this.#terminal.cols - this.#prompt.length;
        this.#lineSpan = Math.floor(this.output.length / delta);
    }
}
