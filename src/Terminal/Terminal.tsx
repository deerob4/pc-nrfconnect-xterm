import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { XTerm } from 'xterm-for-react';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { SearchAddon } from 'xterm-addon-search';
import { SearchBarAddon } from 'xterm-addon-search-bar';
import { withResizeDetector } from 'react-resize-detector';
import * as c from 'ansi-colors';
import * as ansi from 'ansi-escapes';

import { State } from '../index';
import HistoryNavigator from './HistoryNavigator';

import 'xterm/css/xterm.css';
import './terminal.scss';
import colours from './colours.scss';

interface Props {
    width: number;
    height: number;
}

interface KeyPress {
    key: string;
    domEvent: KeyboardEvent;
}

const EOL = '\n';
const LF = 10;
const BACKSPACE = 127;
const ARROW_KEY = 27;

let output = '';

const historyNavigator = new HistoryNavigator();

const fitAddon = new FitAddon();
const weblinksAddon = new WebLinksAddon();
const searchAddon = new SearchAddon();
const searchBarAddon = new SearchBarAddon({ searchAddon });

const Terminal: React.FC<Props> = ({ width, height }) => {
    const xtermRef = useRef<XTerm>(null);
    const { port } = useSelector(({ app }: State) => app);

    useEffect(
        function resizeTerminal() {
            if (width * height > 0) {
                fitAddon.fit();
            }
        },
        [width, height]
    );

    useEffect(
        function writePortOutput() {
            if (!port) {
                xtermRef.current?.terminal.writeln(
                    'Open a device to activate the terminal!'
                );
                return;
            }

            port.on('rx', (data: string, unsolicited: boolean) => {
                xtermRef.current?.terminal.write(data);
            });
        },
        [port]
    );

    useEffect(function toggleSearchBar() {
        xtermRef.current?.terminal.attachCustomKeyEventHandler(event => {
            if (event.metaKey && event.code === 'KeyF') {
                searchBarAddon.show();
            }
            if (event.code === 'Escape') {
                searchBarAddon.hidden();
            }

            return true;
        });
    }, []);

    const char = (str: string) => str.charCodeAt(0);

    const prompt = '\n\rAT> ';

    function atBeginningOfLine() {
        const buffer = xtermRef.current?.terminal.buffer.active;
        return buffer && buffer?.cursorX > prompt.length - 2;
    }

    function atEndOfLine() {
        const buffer = xtermRef.current?.terminal.buffer.active;
        const maxRightCursor = prompt.length - 2 + output.length;

        return buffer && buffer?.cursorX >= maxRightCursor;
    }

    const recordCommand = useCallback((command: string) => {
        if (!command.length || char(command) === LF) return;
        historyNavigator.addToHistory(command);
    }, []);

    const runCommand = useCallback(() => {
        recordCommand(output);

        switch (output) {
            case 'show_history':
                console.log(historyNavigator);
                break;
        }

        xtermRef.current?.terminal.write(prompt);
        historyNavigator.moveToFront();
        output = '';
    }, [recordCommand]);

    const backspace = useCallback(() => {
        if (atBeginningOfLine()) {
            xtermRef.current?.terminal.write('\b \b');
            output = output.slice(0, output.length - 1);
        }
    }, []);

    const clearInput = useCallback(() => {
        // Value of output will change as backspace() is repeatedly
        // called, thus we need a reference outside the loop.
        const charsToDelete = output.length - 1;
        for (let i = 0; i <= charsToDelete; i += 1) {
            backspace();
        }
    }, [backspace]);

    const onData = useCallback(
        (data: string) => {
            if (char(data) === ARROW_KEY) return;
            if (char(data) === BACKSPACE) return backspace();

            const str = data.replace('\r', EOL);

            if (char(str) === LF) return runCommand();

            output += str;

            xtermRef.current?.terminal.write(str);
        },
        [backspace, runCommand]
    );

    const onKey = useCallback(
        ({ domEvent }: KeyPress) => {
            switch (domEvent.key) {
                case 'ArrowLeft': {
                    if (atBeginningOfLine()) {
                        xtermRef.current?.terminal.write(
                            ansi.cursorBackward(1)
                        );
                    }
                    break;
                }

                case 'ArrowRight': {
                    if (!atEndOfLine()) {
                        xtermRef.current?.terminal.write(ansi.cursorForward(1));
                    }
                    break;
                }

                case 'ArrowUp':
                case 'ArrowDown': {
                    const command =
                        domEvent.key === 'ArrowUp'
                            ? historyNavigator.moveBackwards()
                            : historyNavigator.moveForwards();

                    if (command !== null) {
                        clearInput();
                        xtermRef.current?.terminal.write(command);
                        output = command;
                    }
                    break;
                }
            }
        },
        [clearInput]
    );

    return (
        <XTerm
            ref={xtermRef}
            // onLineFeed={onLineFeed}
            onData={onData}
            onKey={onKey}
            addons={[fitAddon, weblinksAddon, searchAddon, searchBarAddon]}
            className="terminal-container"
            options={{
                fontFamily: 'Fira Code',
                theme: {
                    foreground: colours.gray50,
                    background: colours.gray900,
                },
            }}
        />
    );
};

export default withResizeDetector(Terminal);
