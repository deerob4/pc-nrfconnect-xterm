import * as dateFns from 'date-fns';
import * as c from 'ansi-colors';
import * as ansi from 'ansi-escapes';
import TerminalAddon from '../TerminalAddon';
import { charCode, CharCodes } from '../utils';

export default class TimestampAddon extends TerminalAddon {
    public name = 'TimestampAddon';

    public showTimestamps = true;

    public onActivate() {
        this.terminal.onData(data => {
            if (this.showTimestamps && charCode(data) === CharCodes.LF) {
                this.writeTimestamp();
            }
        });
    }

    private writeTimestamp(): void {
        const now = new Date();
        const formatted = dateFns.format(now, 'HH:mm:ss');

        const endCols =
            this.terminal.cols -
            this.commander.output.length -
            formatted.length -
            this.commander.prompt.length;

        this.terminal.write(ansi.cursorForward(endCols));
        this.terminal.write(c.bold(c.grey(formatted)));
    }
}
