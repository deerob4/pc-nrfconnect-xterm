import os from 'os';

const { BrowserWindow } = require('electron').remote;

export function charCode(str: string): number {
    return str.charCodeAt(0);
}

export const CharCodes = {
    EOL: '\n',
    LF: 13,
    BACKSPACE: 127,
    ARROW_KEY: 27,
    CTRL_C: 3,
    ESCAPE: 27,
};

export function devReloadWindow(): void {
    BrowserWindow.getFocusedWindow().reload();
}

export function isMac() {
    return os.platform() === 'darwin';
}

export function isWindows() {
    return os.platform() === 'win32';
}

export function isLinux() {
    return os.platform() === 'linux';
}

export function stripAnsiCodes(str: string): string {
    const regex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
    return str.replace(regex, '');
}
