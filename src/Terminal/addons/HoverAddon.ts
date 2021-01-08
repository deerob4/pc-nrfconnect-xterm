import TerminalAddon from '../TerminalAddon';
import TerminalCommander from '../TerminalCommander';

export interface HoverMetadata {
    match: RegExp;
    title: string;
    body: string;
}

export default class HoverAddon extends TerminalAddon {
    name = 'HoverAddon';

    hoverMetadata: HoverMetadata[];

    constructor(commander: TerminalCommander, hoverMetadata: HoverMetadata[]) {
        super(commander);
        this.hoverMetadata = hoverMetadata;
    }

    protected onActivate(): void {
        const r = new RegExp('I will match');
        this.terminal.registerLinkMatcher(r, (e, uri) => {
            console.log('You clicked on the special matching phrase');
        });

        this.commander.registerOutputListener(output => {
            this.matchCommands(output);
        });
    }

    private matchCommands(output: string): void {
        const words = output.split(' ');
    }
}
