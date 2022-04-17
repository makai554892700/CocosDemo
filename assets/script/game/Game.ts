import {_decorator, Component, Node, assetManager, AssetManager, SpriteAtlas, Prefab, SpriteFrame} from 'cc';
import {PokerFactory} from "./PokerFactory";
import {Poker} from "./Poker";

const {ccclass, property} = _decorator;

@ccclass('Game')
export class Game extends Component {

    private gameBundle: AssetManager.Bundle = null!;
    private pokers = new Map<string, SpriteFrame>();
    private pokerViewPrefab: Prefab = null!;
    private pokerNumbers: number[] = [];
    private tempPokerNumbers: number[] = [];
    private usePokers = new Map<number, Poker>();
    private selfPokers = new Map<number, Poker>();
    private lastPokers = new Map<number, Poker>();
    private nextPokers = new Map<number, Poker>();
    private selfXPos = -400;
    private selfYPos = 0;

    onLoad() {
        console.log("onLoad time=" + new Date().getTime());
        assetManager.loadBundle("game", (err, bundle: AssetManager.Bundle) => {
            console.log("load game success. err=" + err);
            this.gameBundle = bundle;
            this.onLoadPokerAtlas();
        });
    }

    private onLoadPokerAtlas() {
        this.gameBundle.loadDir("pokers", SpriteFrame, (err, pokers: SpriteFrame[]) => {
            console.log("load poker success. err=" + err + ";pokers=" + pokers.length);
            for (let i = 0; i < pokers.length; i++) {
                const poker = pokers[i];
                this.pokers.set(poker.name, poker);
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
        this.node.addComponent(PokerFactory).init(this.pokers, this.pokerViewPrefab);
        this.initPokerNumber();
        this.initPoker();
        this.sendPoker();
        this.setLandlord(0);
        this.sortPoker();
    }

    private sortPoker() {
        const selfPokers: Poker[] = [];
        this.selfPokers.forEach((value, key, map) => {
            selfPokers.push(value);
        })
        selfPokers.sort((a, b) => {
            let valueA: number = a.pokerValue() % 100;
            let valueB: number = b.pokerValue() % 100;
            if (valueA == 1 || valueA == 2) {
                valueA += 15;
                console.log("a=" + valueA);
            }
            if (valueB == 1 || valueB == 2) {
                valueB += 15;
                console.log("b=" + valueB);
            }
            if (valueA == valueB) {
                return 0;
            } else if (valueA > valueB) {
                return -1;
            } else {
                return 1;
            }
        });
        this.selfPokers.clear();
        selfPokers.forEach((poker: Poker) => {
            this.selfPokers.set(poker.pokerValue(), poker);
        })
        let tempZIndex = 100;
        this.selfPokers.forEach((value, key, map) => {
            value.node.active = true;
            value.showValue();
            if (value.pokerValue() == 518 || value.pokerValue() == 519) {
                value.node.setPosition(this.selfXPos, this.selfYPos + 3);
            } else {
                value.node.setPosition(this.selfXPos, this.selfYPos);
            }
            this.selfXPos += 48;
            value.node.setSiblingIndex(tempZIndex++);
        })
    }

    private setLandlord(landlord: number) {
        for (let j = 0; j < 3; j++) {
            this.sendPokerByNumber(landlord);
        }
    }

    private sendPoker() {
        this.tempPokerNumbers = [];
        this.pokerNumbers.forEach((pokerNumber: number) => {
            this.tempPokerNumbers.push(pokerNumber);
        });
        this.tempPokerNumbers.sort((a: number, b: number) => {
            let tempInt: number = Math.random() * 9;
            if (tempInt < 3) {
                return -1;
            } else if (tempInt < 6) {
                return 1;
            } else {
                return 0;
            }
        });
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 17; j++) {
                this.sendPokerByNumber(i);
            }
        }
    }

    private sendPokerByNumber(userNumber: number) {
        let tempPokerNumber = this.tempPokerNumbers.pop();
        let tempPoker = this.usePokers.get(tempPokerNumber);
        this.usePokers.delete(tempPokerNumber);
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

    private initPoker() {
        this.selfXPos = -400;
        this.selfYPos = 0;
        this.usePokers.clear();
        this.selfPokers.clear();
        this.lastPokers.clear();
        this.nextPokers.clear();
        this.pokerNumbers.forEach((pokerNumber: number) => {
            this.usePokers.set(pokerNumber, PokerFactory.instance.createPoker(pokerNumber));
        });
    }

    private initPokerNumber() {
        for (let i = 1; i < 5; i++) {
            for (let j = 1; j < 14; j++) {
                this.pokerNumbers.push(i * 100 + j);
            }
        }
        this.pokerNumbers.push(518);
        this.pokerNumbers.push(519);
    }

}

