import {
    _decorator,
    Component,
    assetManager,
    AssetManager,
    Prefab,
    SpriteFrame,
    Button,
    director,
    Sprite,
    Label
} from 'cc';
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
    private leftButton: Button = null!;
    @property({type: Button, visible: true})
    private rightButton: Button = null!;
    @property({type: Sprite, visible: true})
    private clock: Sprite = null!;
    @property({type: Label, visible: true})
    private clockText: Label = null!;
    @property({type: Label, visible: true})
    private leftButtonText: Label = null!;
    @property({type: Label, visible: true})
    private rightButtonText: Label = null!;
    private gameState = 3;                  // 0 轮到我 / 1 轮到下家 /  2 轮到上家 / 3 等待开始(未准备) / 4 等待开始(已准备) / 5 发牌中 / 6 游戏失败结束 / 7 游戏胜利结束
    private lastGameState = 3;
    private lessTime = -1;                  // 当前出牌者剩余出牌时间
    private currentPokers: Poker[] = [];    // 当前出的牌
    private currentPokerBelong: number = -1;    // 最后出牌者
    private landlord: number = -1;          // 地主 0 我 / 1 下家 / 2 上家

    private returnButtonClick() {
        director.loadScene("Launch");
    }

    private leftButtonClick() {
        console.log("leftButtonClick");
        this.lastGameState = this.gameState;
        if (this.gameState == 3) {
            this.gameState = 4;
            this.leftButtonText.string = "取消准备";
            this.rightButton.node.active = true;
            this.rightButtonText.string = "开始";
        } else if (this.gameState == 4) {
            this.gameState = 3;
            this.leftButtonText.string = "准备";
            this.rightButton.node.active = false;
        }
        this.updateUI();
    }

    private rightButtonClick() {
        console.log("rightButtonClick");
        if (this.gameState == 0) {
            this.playPoker();
        } else if (this.gameState == 4) {
            this.gameState = 5;
            this.leftButton.node.active = true;
            this.rightButton.node.active = true;
            this.leftButtonText.string = "要不起";
            this.rightButtonText.string = "出牌";
            this.restartGame();
            this.lastGameState = this.gameState;
            this.gameState = this.landlord;
        }
    }

    private restartGame() {
        this.sendPoker();
        this.landlord = Math.round(Math.random() * 2);
        this.setLandlord(this.landlord);
        this.selfUserInfo.updateUI(0, this.selfPokers.length);
        this.nextUserInfo.updateUI(0, this.nextPokers.length);
        this.lastUserInfo.updateUI(0, this.lastPokers.length);
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
        this.clock.node.active = false;
        this.rightButton.node.active = false;
        this.node.addComponent(PokerFactory).init(this.pokerFrames, this.pokerPrefabs.get("prefab/PokerView"));
        this.pokerNumbers.forEach((pokerNumber: number) => {
            this.pokers.push(PokerFactory.instance.createPoker(pokerNumber));
        });
        this.node.addComponent(UserInfoFactory).init(this.pokerPrefabs.get("prefab/UserInfo"));
        this.selfUserInfo = UserInfoFactory.instance.createUserInfo(0, "testUserName1", 0
            , this.selfPokers.length, this.headFrames.get("head_4"));
        this.lastUserInfo = UserInfoFactory.instance.createUserInfo(1, "testUserName2", 0
            , this.lastPokers.length, this.headFrames.get("head_2"));
        this.nextUserInfo = UserInfoFactory.instance.createUserInfo(2, "testUserName3", 0
            , this.nextPokers.length, this.headFrames.get("head_3"));
        this.schedule(this.updateUI, 1);
    }

    private updateUI() {
        console.log("gameState=" + this.gameState);
        if (this.lastGameState != this.gameState) {
            if (this.gameState == 0 || this.gameState == 1 || this.gameState == 2) {
                this.lessTime = 15;
                if (this.lastGameState == 0) {
                    this.clock.node.active = false;
                }
            }
            this.lastGameState = this.gameState;
        }
        switch (this.gameState) {
            case 0:
                if (this.lessTime >= 0) {
                    if (this.lessTime == 0) {
                        this.gameState = 1;
                        this.lessTime = 15;
                        this.clock.node.active = false;
                        this.selfUserInfo.updateUI(0, this.selfPokers.length);
                    } else {
                        if (!this.clock.node.active) {
                            this.clock.node.active = true;
                        }
                        this.clockText.string = "" + this.lessTime;
                        this.selfUserInfo.updateUI(this.lessTime--, this.selfPokers.length);
                    }
                }
                break;
            case 1:
                if (this.lessTime >= 0) {
                    if (this.lessTime == 0) {
                        this.gameState = 2;
                        this.lessTime = 15;
                        this.nextUserInfo.updateUI(0, this.nextPokers.length);
                    } else {
                        this.nextUserInfo.updateUI(this.lessTime--, this.nextPokers.length);
                    }
                }
                break;
            case 2:
                if (this.lessTime >= 0) {
                    if (this.lessTime == 0) {
                        this.gameState = 0;
                        this.lessTime = 15;
                        this.lastUserInfo.updateUI(0, this.lastPokers.length);
                    } else {
                        this.lastUserInfo.updateUI(this.lessTime--, this.lastPokers.length);
                    }
                }
                break;
        }
    }

    private playPoker() {
        this.gameState = 1;
        this.updateUI();
    }

    private showPoker() {
        this.showSelfScope(this.selfPokers);
    }

    private showSelfScope(pokers: Poker[]) {
        this.commonShowPoker(pokers, -450, -400, 21);
    }

    private showLastScope(pokers: Poker[]) {
        this.commonShowPoker(pokers, -550, 200, 10);
    }

    private showNextScope(pokers: Poker[]) {
        this.commonShowPoker(pokers, 150, 200, 10);
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
        this.showSelfScope(this.selfPokers);
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
        let tempInt: number = Math.round(Math.random() * 8);
        if (tempInt < 3) {
            return -1;
        } else if (tempInt < 6) {
            return 1;
        } else {
            return 0;
        }
    };

}

