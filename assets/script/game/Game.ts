import {_decorator, Component, assetManager, AssetManager, Prefab, SpriteFrame, Button, director} from 'cc';
import {PokerFactory} from "./PokerFactory";
import {Poker} from "./Poker";
import {UserInfoFactory} from "./UserInfoFactory";
import {UserInfo} from "./UserInfo";

const {ccclass, property} = _decorator;

@ccclass('Game')
export class Game extends Component {

    private gameBundle: AssetManager.Bundle = null!;
    private pokerFrames = new Map<string, SpriteFrame>();
    private headFrames = new Map<string, SpriteFrame>();
    private pokerPrefabs = new Map<string, Prefab>();
    private pokerNumbers: number[] = [
        101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113
        , 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213
        , 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313
        , 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413
        , 516, 617
    ];
    private prefabNames: string[] = ["prefab/PokerView", "prefab/UserInfo"];
    private pokers: Poker[] = [];
    private inUsePokers: Poker[] = [];
    private selfPokers: Poker[] = [];
    private lastPokers: Poker[] = [];
    private nextPokers: Poker[] = [];
    private selfUserInfo: UserInfo = null!;
    private lastUserInfo: UserInfo = null!;
    private nextUserInfo: UserInfo = null!;
    @property({type: Button, visible: true})
    private readyButton: Button = null!;

    private returnButtonClick() {
        director.loadScene("Launch");
    }

    private readyButtonClick() {
        console.log("readyButtonClick");
        this.sendPoker();
        this.setLandlord(Math.round(Math.random() * 3));
        this.showPoker();
    }

    private restartButtonClick() {
        console.log("restartButtonClick");
        this.sendPoker();
        this.setLandlord(Math.round(Math.random() * 3));
        this.showPoker();
    }

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
                this.pokerFrames.set(poker.name, poker);
            }
            this.gameBundle.loadDir("heads", SpriteFrame, (err, heads: SpriteFrame[]) => {
                console.log("load heads success. err=" + err + ";heads=" + heads.length);
                for (let i = 0; i < heads.length; i++) {
                    const head = heads[i];
                    this.headFrames.set(head.name, head);
                }
                this.onLoadPokerPrefab();
            });
        });
    }

    private onLoadPokerPrefab() {
        this.loadPrefab(this.prefabNames, 0);
    }

    private loadPrefab(array: string[], index: number) {
        if (index >= array.length) {
            this.enterGame();
            return;
        }
        this.gameBundle.load(array[index], Prefab, (err, prefab: Prefab) => {
            console.log("load " + array[index] + " success. err=" + err);
            this.pokerPrefabs.set(array[index], prefab);
            this.loadPrefab(array, index + 1);
        });
    }

    private enterGame() {
        console.log("enterGame time=" + new Date().getTime());
        this.node.addComponent(PokerFactory).init(this.pokerFrames, this.pokerPrefabs.get("prefab/PokerView"));
        this.pokerNumbers.forEach((pokerNumber: number) => {
            this.pokers.push(PokerFactory.instance.createPoker(pokerNumber));
        });
        this.node.addComponent(UserInfoFactory).init(this.pokerPrefabs.get("prefab/UserInfo"));
        this.selfUserInfo = UserInfoFactory.instance.createUserInfo(0,"testUserName1", 5, 6, this.headFrames.get("head_4"));
        this.lastUserInfo = UserInfoFactory.instance.createUserInfo(1,"testUserName2", 7, 8, this.headFrames.get("head_2"));
        this.nextUserInfo = UserInfoFactory.instance.createUserInfo(2,"testUserName3", 9, 10, this.headFrames.get("head_3"));
    }

    private showPoker() {
        this.commonShowPoker(this.selfPokers, -450, -400, 20);
        this.commonShowPoker(this.lastPokers, -550, 200, 10);
        this.commonShowPoker(this.nextPokers, 150, 200, 10);
    }

    private commonShowPoker(pokers: Poker[], startXPos: number, startYPos: number, maxIndex: number) {
        pokers.sort((a: Poker, b: Poker) => {
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
        let tempZIndex = 100;
        let selfXPos = startXPos;
        let selfYPos = startYPos;
        let nextIndex = 0;
        pokers.forEach((value, key, map) => {
            value.node.active = true;
            value.showValue();
            if (value.pokerValue() == 518 || value.pokerValue() == 519) {
                value.node.setPosition(selfXPos, selfYPos > 0 ? (selfYPos - 3) : (selfYPos + 3));
            } else {
                value.node.setPosition(selfXPos, selfYPos);
            }
            selfXPos += 48;
            value.node.setSiblingIndex(tempZIndex++);
            if (nextIndex++ == maxIndex) {
                selfXPos = startXPos;
                selfYPos = startYPos - 60;
            }
        });
    }

    private sendPoker() {
        this.inUsePokers = [];
        this.selfPokers = [];
        this.lastPokers = [];
        this.nextPokers = [];
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
                this.nextPokers.push(tempPoker);
                break;
            case 2:
                this.lastPokers.push(tempPoker);
                break;
            default:
                this.selfPokers.push(tempPoker);
                break;
        }
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

