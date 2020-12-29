import TerminalAddon from '../TerminalAddon';
import { isMac } from '../utils';

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

    protected onActivate() {
        this.commander.registerCustomKeyEventHandler(e => {
            if (isCopy(e)) {
                const copySucceeded = document.execCommand('copy');
                console.log('Copy succeeded?', copySucceeded);
            }

            if (isPaste(e)) {
                console.log('thinking of pasting');
            }

            return true;
        });
    }
}

// On Windows and Linux Ctrl is used; on Mac, the cmd key.
function isModifierKeyPressed(e: KeyboardEvent): boolean {
    return isMac() ? e.metaKey : e.ctrlKey;
}

function isCopy(e: KeyboardEvent): boolean {
    return isModifierKeyPressed(e) && e.code === 'KeyC';
}

function isPaste(e: KeyboardEvent): boolean {
    return isModifierKeyPressed(e) && e.code === 'KeyV';
}
