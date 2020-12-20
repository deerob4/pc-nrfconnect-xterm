export default class HistoryNavigator {
    private commands: string[];
    private currentIndex = -1;

    constructor(commands: string[] = []) {
        this.commands = commands;
    }

    public addToHistory(command: string) {
        this.commands.unshift(command);
    }

    public moveBackwards(): string | null {
        if (this.currentIndex >= this.commands.length - 1) return null;
        this.currentIndex += 1;
        return this.commands[this.currentIndex];
    }

    public moveForwards(): string | null {
        if (this.currentIndex < 0) return null;
        this.currentIndex -= 1;
        return this.currentIndex === -1 ? '' : this.commands[this.currentIndex];
    }

    public moveToFront() {
        this.currentIndex = -1;
    }

    public get currentCommand(): string {
        return this.commands[this.currentIndex];
    }

    public searchCommands(searchString: string): string[] {
        return this.commands.filter(c => c.startsWith(searchString));
    }
}
