import TerminalAddon from '../TerminalAddon';
import TerminalCommander from '../TerminalCommander';

export default class AutocompleteAddon extends TerminalAddon {
    public name = 'AutcompleteAddon';

    public completions: string[];

    constructor(commander: TerminalCommander, completions: string[]) {
        super(commander);
        this.completions = completions;
    }

    public onActivate() {}
}
