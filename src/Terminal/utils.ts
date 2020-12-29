const { BrowserWindow } = require('electron').remote;

export function devReloadWindow(): void {
    BrowserWindow.getFocusedWindow().reload();
}

export function charCode(str: string): number {
    return str.charCodeAt(0);
}

export const CharCodes = {
    EOL: '\n',
    LF: 13,
    BACKSPACE: 127,
    ARROW_KEY: 27,
};
