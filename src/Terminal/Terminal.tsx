import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { XTerm } from 'xterm-for-react';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { SearchAddon } from 'xterm-addon-search';
import { SearchBarAddon } from 'xterm-addon-search-bar';
import { withResizeDetector } from 'react-resize-detector';
import c from 'ansi-colors';

import { State } from '../index';
import TerminalCommander from './TerminalCommander';

import 'xterm/css/xterm.css';
import './terminal.scss';
import colours from './colours.scss';

interface Props {
    width: number;
    height: number;
}

const commander = new TerminalCommander(
    `${c.green('AT[')}${c.greenBright(':lineCount')}${c.green(']>')}`
);

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

    // useEffect(function toggleSearchBar() {
    //     xtermRef.current?.terminal.attachCustomKeyEventHandler(event => {
    //         console.log(event);
    //         if (event.metaKey && event.code === 'KeyF') {
    //             searchBarAddon.show();
    //         }
    //         if (event.code === 'Escape') {
    //             searchBarAddon.hidden();
    //         }

    //         return true;
    //     });
    // }, []);

    return (
        <XTerm
            ref={xtermRef}
            addons={[
                fitAddon,
                weblinksAddon,
                searchAddon,
                searchBarAddon,
                commander,
            ]}
            className="terminal-container"
            options={{
                fontFamily: 'Fira Code',
                theme: {
                    foreground: colours.gray50,
                    background: colours.gray900,
                    green: colours.green,
                    blue: colours.blueSlate,
                    brightBlue: colours.nordicBlue,
                },
            }}
        />
    );
};

export default withResizeDetector(Terminal);
