import TerminalAddon from '../TerminalAddon';
import TerminalCommander from '../TerminalCommander';

export default class AutocompleteAddon extends TerminalAddon {
    public name = 'AutcompleteAddon';

    public completions: string[];
    private suggestions: string[] = [];

    constructor(commander: TerminalCommander, completions: string[]) {
        super(commander);
        this.completions = completions;
    }

    protected onActivate() {
        this.commander.onOutputChange(output => {
            console.log('New output!', output);
        });
    }

    private drawSuggestionBox() {}
}
