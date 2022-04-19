export class PokerType {

    private readonly type: string;
    private readonly sort: number;

    public constructor(type: string, sort: number) {
        this.type = type;
        this.sort = sort;
    }

    public getType(): string {
        return this.type;
    }

    public getSort(): number {
        return this.sort;
    }
}

