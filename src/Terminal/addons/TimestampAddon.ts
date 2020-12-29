import * as dateFns from 'date-fns';
import * as c from 'ansi-colors';
import * as ansi from 'ansi-escapes';
import TerminalAddon from '../TerminalAddon';
import { charCode, CharCodes } from '../utils';
import TerminalCommander from '../TerminalCommander';

/**
 * Prints the date and time a command was executed at the
 * rightmost edge of the screen.
 *
 * The format of the displayed timestamp can be set by
 * passing an alternative string to the constructor, or
 * by changing the `format` property at any time. By default, the
 * format is `HH:mm:ss`.
 *
 * Timestamps can be toggled using the `toggleTimestamps` method,
 * or by using the `"toggle_timestamps"` command registered by
 * this addon.
 */
export default class TimestampAddon extends TerminalAddon {
    public name = 'TimestampAddon';

    /**
     * The `date-fns` compatible formatter used to format the timestamp.
     */
    public format: string;

    private _showTimestamps = true;

    constructor(commander: TerminalCommander, format?: string) {
        super(commander);
        this.format = format || 'HH:mm:ss';
    }

    protected onActivate() {
        this.terminal.onData(data => {
            if (this.showingTimestamps && charCode(data) === CharCodes.LF) {
                this.writeTimestamp();
            }
        });
    }

    private writeTimestamp(): void {
        const now = new Date();
        const formatted = dateFns.format(now, this.format);

        const endCols =
            this.terminal.cols -
            this.commander.output.length -
            formatted.length -
            this.commander.prompt.length;

        this.terminal.write(ansi.cursorForward(endCols));
        this.terminal.write(c.bold(c.grey(formatted)));
    }

    /**
     * Whether or not timestamps will be shown on new commands.
     */
    public get showingTimestamps(): boolean {
        return this._showTimestamps;
    }

    /**
     * Toggles the printing of timestamps on or off.
     */
    public toggleTimestamps(): void {
        this._showTimestamps = !this.showingTimestamps;
    }
}
