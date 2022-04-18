import {_decorator, Component, assetManager, AssetManager, Prefab, SpriteFrame, Button} from 'cc';
import {PokerFactory} from "./PokerFactory";
import {Poker} from "./Poker";

const {ccclass, property} = _decorator;

@ccclass('Game')
export class Game extends Component {

    private gameBundle: AssetManager.Bundle = null!;
    private pokerFrames = new Map<string, SpriteFrame>();
    private pokerViewPrefab: Prefab = null!;
    private pokerNumbers: number[] = [
        101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113
        , 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213
        , 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313
        , 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413
        , 516, 617
    ];
    private pokers: Poker[] = [];
    private inUsePokers: Poker[] = [];
    private selfPokers = new Map<number, Poker>();
    private lastPokers = new Map<number, Poker>();
    private nextPokers = new Map<number, Poker>();
    @property({type: Button, visible: true})
    private readyButton: Button = null!;

    onLoad() {
        console.log("onLoad time=" + new Date().getTime());
        assetManager.loadBundle("game", (err, bundle: AssetManager.Bundle) => {
            console.log("load game success. err=" + err);
            this.gameBundle = bundle;
            this.onLoadPokerAtlas();
        });
    }

    private readyButtonClick() {
        console.log("readyButtonClick");
        this.sendPoker();
        this.setLandlord(0);
        this.showPoker();
    }

    private onLoadPokerAtlas() {
        this.gameBundle.loadDir("pokers", SpriteFrame, (err, pokers: SpriteFrame[]) => {
            console.log("load poker success. err=" + err + ";pokers=" + pokers.length);
            for (let i = 0; i < pokers.length; i++) {
                const poker = pokers[i];
                this.pokerFrames.set(poker.name, poker);
            }
            this.onLoadPokerPrefab();
        });
    }

    private onLoadPokerPrefab() {
        this.gameBundle.load("PokerView", Prefab, (err, prefab: Prefab) => {
            console.log("load PokerView success. err=" + err);
            this.pokerViewPrefab = prefab;
            this.enterGame();
        });
    }

    private enterGame() {
        console.log("enterGame time=" + new Date().getTime());
        this.node.addComponent(PokerFactory).init(this.pokerFrames, this.pokerViewPrefab);
        this.pokerNumbers.forEach((pokerNumber: number) => {
            this.pokers.push(PokerFactory.instance.createPoker(pokerNumber));
        });
    }

    private showPoker() {
        this.selfPokers = this.sortPoker(this.selfPokers);
        let tempZIndex = 100;
        let selfXPos = -400;
        let selfYPos = -400;
        this.selfPokers.forEach((value, key, map) => {
            value.node.active = true;
            value.showValue();
            if (value.pokerValue() == 516 || value.pokerValue() == 517) {
                value.node.setPosition(selfXPos, selfYPos + 3);
            } else {
                value.node.setPosition(selfXPos, selfYPos);
            }
            selfXPos += 48;
            value.node.setSiblingIndex(tempZIndex++);
        });
        tempZIndex = 100;
        selfXPos = -700;
        selfYPos = 200;
        let lastIndex = 0;
        this.lastPokers = this.sortPoker(this.lastPokers);
        this.lastPokers.forEach((value, key, map) => {
            value.node.active = true;
            value.showValue();
            if (value.pokerValue() == 518 || value.pokerValue() == 519) {
                value.node.setPosition(selfXPos, selfYPos - 3);
            } else {
                value.node.setPosition(selfXPos, selfYPos);
            }
            selfXPos += 48;
            value.node.setSiblingIndex(tempZIndex++);
            if (lastIndex++ == 10) {
                selfYPos = 140;
                selfXPos = -700;
            }
        });

        tempZIndex = 100;
        selfXPos = 200;
        selfYPos = 200;
        let nextIndex = 0;
        this.nextPokers = this.sortPoker(this.nextPokers);
        this.nextPokers.forEach((value, key, map) => {
            value.node.active = true;
            value.showValue();
            if (value.pokerValue() == 518 || value.pokerValue() == 519) {
                value.node.setPosition(selfXPos, selfYPos - 3);
            } else {
                value.node.setPosition(selfXPos, selfYPos);
            }
            selfXPos += 48;
            value.node.setSiblingIndex(tempZIndex++);
            if (nextIndex++ == 10) {
                selfYPos = 140;
                selfXPos = 200;
            }
        });
    }

    private sendPoker() {
        this.selfPokers.clear();
        this.lastPokers.clear();
        this.nextPokers.clear();
        this.inUsePokers = [];
        this.pokers.forEach((poker: Poker) => {
            this.inUsePokers.push(poker);
        })
        for (let i = 0; i < 3; i++) {
            this.inUsePokers.sort(this.randomPoker);
        }
        for (let i = 0; i < 51; i++) {
            this.sendPokerByNumber(i % 3);
        }
    }

    private setLandlord(landlord: number) {
        for (let j = 0; j < 3; j++) {
            this.sendPokerByNumber(landlord);
        }
    }

    private sendPokerByNumber(userNumber: number) {
        let tempPoker: Poker = this.inUsePokers.pop();
        switch (userNumber) {
            case 1:
                this.nextPokers.set(tempPoker.pokerValue(), tempPoker);
                break;
            case 2:
                this.lastPokers.set(tempPoker.pokerValue(), tempPoker);
                break;
            default:
                this.selfPokers.set(tempPoker.pokerValue(), tempPoker);
                break;
        }
    }

    private sortPoker(pokers: Map<number, Poker>) {
        const result = new Map<number, Poker>();
        const tempPokers: Poker[] = [];
        pokers.forEach((value, key, map) => {
            tempPokers.push(value);
        })
        tempPokers.sort((a: Poker, b: Poker) => {
            let valueA: number = a.pokerValue() % 100;
            let valueB: number = b.pokerValue() % 100;
            if (valueA == 1 || valueA == 2) {
                valueA += 13;
            }
            if (valueB == 1 || valueB == 2) {
                valueB += 13;
            }
            if (valueA == valueB) {
                return 0;
            } else if (valueA > valueB) {
                return -1;
            } else {
                return 1;
            }
        });
        tempPokers.forEach((poker: Poker) => {
            result.set(poker.pokerValue(), poker);
        })
        return result;
    }

    private randomPoker(a: Poker, b: Poker) {
        let tempInt: number = Math.random() * 9;
        if (tempInt < 3) {
            return -1;
        } else if (tempInt < 6) {
            return 1;
        } else {
            return 0;
        }
    };

}

