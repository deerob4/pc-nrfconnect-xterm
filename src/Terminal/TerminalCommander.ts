import { Terminal, ITerminalAddon } from 'xterm';
import * as ansi from 'ansi-escapes';
import { charCode, CharCodes } from './utils';
import HistoryAddon from './HistoryAddon';

export interface KeyEvent {
    key: string;
    domEvent: KeyboardEvent;
}

/**
 * Contains logic for the most common terminal tasks like typing.
 */
export default class TerminalCommander implements ITerminalAddon {
    private terminal!: Terminal;
    private historyAddon!: HistoryAddon;

    /**
     * The value of the current line.
     */
    public output = '';

    /**
     * The characters written at the beginning of each new line.
     */
    public prompt: string;

    constructor(prompt: string) {
        this.prompt = `\n\r${prompt} `;
    }

    public activate(terminal: Terminal) {
        this.terminal = terminal;

        const historyAddon = new HistoryAddon(this);
        this.historyAddon = historyAddon;
        this.terminal.loadAddon(historyAddon);

        this.terminal.onKey(this.onKey.bind(this));
        this.terminal.onData(this.onData.bind(this));
    }

    public dispose() {
        return false;
    }

    /**
     * Removes the command currently being entered into the buffer
     * and replaces it with `newCommand`.
     * @param newCommand The command to write to the screen.
     */
    public replaceCommandWith(newCommand: string): void {
        this.clearInput();
        this.terminal.write(newCommand);
        this.output = newCommand;
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
        console.log(charsToDelete);
        for (let i = 0; i <= charsToDelete; i += 1) {
            this.backspace();
        }
    }

    private backspace(): void {
        if (!this.atBeginningOfLine()) {
            this.terminal.write('\b \b');
            this.output = this.output.slice(0, this.output.length - 1);
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
        this.historyAddon.addToHistory(this.output);
        this.terminal.write(this.prompt);
        this.historyAddon.moveToFront();
        this.output = '';
    }

    private onData(data: string): void {
        if (charCode(data) === CharCodes.ARROW_KEY) {
            return;
        }

        if (charCode(data) === CharCodes.BACKSPACE) {
            return this.backspace();
        }

        if (charCode(data) === CharCodes.LF) {
            return this.runCommand();
        }

        this.output += data;
        this.terminal.write(data);
    }

    private onKey(e: KeyEvent): void {
        switch (e.domEvent.key) {
            case 'ArrowLeft':
                return this.moveCaretLeft();

            case 'ArrowRight':
                return this.moveCaretRight();
        }
    }
}
