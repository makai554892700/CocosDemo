export class PokerType {

    private readonly type: string;
    private readonly sort: number;
    private readonly length: number;

    public constructor(type: string, sort: number, length: number) {
        this.type = type;
        this.sort = sort;
        this.length = length;
    }

    public getType(): string {
        return this.type;
    }

    public getSort(): number {
        return this.sort;
    }

    public getLength(): number {
        return this.length;
    }

}

