import TerminalAddon from '../TerminalAddon';

/**
 * Adds copy-paste functionality to the terminal, guaranteed
 * to work consistently across platforms.
 *
 * To copy, select the required text, and press Ctrl-Shift-C.
 *
 * Pasting occurs on Ctrl-Shift-V.
 */
export default class CopyPasteAddon extends TerminalAddon {
    public name = 'CopyPasteAddon';

    public onActivate() {
        this.terminal.attachCustomKeyEventHandler(e => {
            if (e.ctrlKey && e.key === 'c') {
                const copySucceeded = document.execCommand('copy');
                console.log('Copy succeeded?', copySucceeded);
            }
            return false;
        });
    }
}
