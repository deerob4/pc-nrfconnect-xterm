import TerminalAddon from '../TerminalAddon';
import { isMac } from '../utils';

/**
 * Adds copy-paste functionality to the terminal, guaranteed
 * to work consistently across platforms.
 *
 * The registered shortcuts are Ctrl-C for copy, and Ctrl-V
 * for paste. On a Mac, the the addon is not initialised, since
 * the required functionality works out of the box.
 */
export default class CopyPasteAddon extends TerminalAddon {
    public name = 'CopyPasteAddon';

    protected onActivate() {
        if (isMac()) return;

        this.terminal.onKey(async ({ domEvent }) => {
            if (isCopy(domEvent)) {
                document.execCommand('copy');
            }

            if (isPaste(domEvent)) {
                document.execCommand('paste');
            }
        });
    }
}

function isCopy(e: KeyboardEvent): boolean {
    return e.ctrlKey && e.code === 'KeyC';
}

function isPaste(e: KeyboardEvent): boolean {
    return e.ctrlKey && e.code === 'KeyV';
}
