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
import {PokerUtils} from "./PokerUtils";
import {PokerType} from "./PokerType";

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
    @property({type: Sprite, visible: true})
    private resultFail: Sprite = null!;
    @property({type: Sprite, visible: true})
    private resultVictory: Sprite = null!;
    private gameState = 3;                  // 0 轮到我 / 1 轮到下家 /  2 轮到上家 / 3 等待开始(未准备) / 4 等待开始(已准备) / 5 发牌中 / 6 游戏失败结束 / 7 游戏胜利结束
    private lastGameState = -1;
    private lessTime = -1;                  // 当前出牌者剩余出牌时间
    private currentPokers: Poker[] = [];    // 当前出的牌
    private currentPokerBelong: number = -1;    // 最后出牌者
    private landlord: number = -1;          // 地主 0 我 / 1 下家 / 2 上家
    private selfPokerUtils: PokerUtils = null!;
    private nextPokerUtils: PokerUtils = null!;
    private lastPokerUtils: PokerUtils = null!;

    private returnButtonClick() {
        director.loadScene("Launch");
    }

    private leftButtonClick() {
        console.log("leftButtonClick");
        this.lastGameState = this.gameState;
        if (this.gameState == 3) {
            this.gameState = 4;
        } else if (this.gameState == 4) {
            this.gameState = 3;
        }
        this.updateUI();
    }

    private rightButtonClick() {
        console.log("rightButtonClick");
        if (this.gameState == 0) {
            this.playPoker();
        } else if (this.gameState == 4) {
            this.gameState = 5;
            this.updateUI();
        }
    }

    private restartGame() {
        this.sendPoker();
        // this.landlord = Math.round(Math.random() * 2);
        this.landlord = 0;
        this.currentPokerBelong = this.landlord;
        this.setLandlord(this.landlord);
        this.selfUserInfo.updateUI(0, this.selfPokers.length, this.landlord == 0);
        this.nextUserInfo.updateUI(0, this.nextPokers.length, this.landlord == 1);
        this.lastUserInfo.updateUI(0, this.lastPokers.length, this.landlord == 2);
        this.showSelfScope(this.selfPokers);
        this.selfPokerUtils = new PokerUtils(0, this.selfPokers);
        this.nextPokerUtils = new PokerUtils(1, this.nextPokers);
        this.lastPokerUtils = new PokerUtils(2, this.lastPokers);
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
        this.selfUserInfo = UserInfoFactory.instance.createUserInfo(0, "testUserName1", 0
            , this.selfPokers.length, this.headFrames.get("head_4"));
        this.lastUserInfo = UserInfoFactory.instance.createUserInfo(1, "testUserName2", 0
            , this.lastPokers.length, this.headFrames.get("head_2"));
        this.nextUserInfo = UserInfoFactory.instance.createUserInfo(2, "testUserName3", 0
            , this.nextPokers.length, this.headFrames.get("head_3"));
        this.schedule(this.updateUI, 1);
        this.gameState = 3;
        this.updateUI();
    }

    private updateUI() {
        if (this.lastGameState != this.gameState) {
            let tempGameState = this.lastGameState;
            this.lastGameState = this.gameState;
            if (this.gameState < 3) {
                this.lessTime = 15;
                if (tempGameState == 0) {
                    this.clock.node.active = false;
                }
            } else {
                switch (this.gameState) {
                    case 3:
                        this.pokers.forEach((poker: Poker) => {
                            poker.node.active = false;
                        });
                        this.leftButtonText.string = "准备";
                        this.clock.node.active = false;
                        this.rightButton.node.active = false;
                        this.resultFail.node.active = false;
                        this.resultVictory.node.active = false;
                        this.selfUserInfo.updateUI(0, 0, false);
                        this.nextUserInfo.updateUI(0, 0, false);
                        this.lastUserInfo.updateUI(0, 0, false);
                        break;
                    case 4:
                        this.leftButtonText.string = "取消准备";
                        this.rightButton.node.active = true;
                        this.rightButtonText.string = "开始";
                        break;
                    case 5:
                        this.leftButton.node.active = true;
                        this.rightButton.node.active = true;
                        this.leftButtonText.string = "要不起";
                        this.rightButtonText.string = "出牌";
                        this.restartGame();
                        this.gameState = this.landlord;
                        break;
                    case 6:
                        this.showSelfScope(this.selfPokers);
                        this.showNextScope(this.nextPokers);
                        this.showLastScope(this.lastPokers);
                        this.resultFail.node.setSiblingIndex(100);
                        this.resultFail.node.active = true;
                        break;
                    case 7:
                        this.showSelfScope(this.selfPokers);
                        this.showNextScope(this.nextPokers);
                        this.showLastScope(this.lastPokers);
                        this.resultVictory.node.setSiblingIndex(100);
                        this.resultVictory.node.active = true;
                        break;
                }
            }
        }
        if (this.gameState < 3 && (this.selfPokers.length == 0 || this.nextPokers.length == 0 || this.lastPokers.length == 0)) {
            if (this.selfPokers.length == 0) {
                this.gameState = 7;
            } else {
                this.gameState = 6;
            }
            this.schedule(() => {
                this.gameState = 3;
                this.updateUI();
            }, 5);
            this.lessTime = -1;
            this.updateUI();
        }
        switch (this.gameState) {
            case 0:
                if (this.lessTime >= 0) {
                    if (this.lessTime == 0) {
                        if (this.currentPokerBelong == 0) {
                            this.commonPlayPoker(0, [this.selfPokers[this.selfPokers.length - 1]]);
                        } else {
                            this.nextPlayer();
                        }
                    } else {
                        if (!this.clock.node.active) {
                            this.clock.node.active = true;
                        }
                        this.clockText.string = "" + this.lessTime;
                        this.selfUserInfo.updateUI(this.lessTime--, this.selfPokers.length, this.landlord == 0);
                    }
                }
                break;
            case 1:
                if (this.lessTime >= 0) {
                    if (this.lessTime == 10) {
                        if (this.currentPokerBelong == 2) {
                            this.nextPlayer();
                            return;
                        }
                        if (this.currentPokerBelong == 1) {
                            this.commonPlayPoker(1, [this.nextPokers[this.nextPokers.length - 1]]);
                            return;
                        }
                        let canPlay: Poker[] = this.nextPokerUtils.getPlay(this.currentPokers);
                        if (canPlay != null) {
                            this.commonPlayPoker(1, canPlay);
                            return;
                        } else {
                            this.nextPlayer();
                            return;
                        }
                    }
                    if (this.lessTime == 0) {
                        this.nextPlayer();
                    } else {
                        this.nextUserInfo.updateUI(this.lessTime--, this.nextPokers.length, this.landlord == 1);
                    }
                }
                break;
            case 2:
                if (this.lessTime >= 0) {
                    if (this.lessTime == 10) {
                        if (this.currentPokerBelong == 1) {
                            this.nextPlayer();
                            return;
                        }
                        if (this.currentPokerBelong == 2) {
                            this.commonPlayPoker(2, [this.lastPokers[this.lastPokers.length - 1]]);
                            return;
                        }
                        let canPlay: Poker[] = this.lastPokerUtils.getPlay(this.currentPokers);
                        if (canPlay != null) {
                            this.commonPlayPoker(2, canPlay);
                            return;
                        } else {
                            this.nextPlayer();
                            return;
                        }
                    }
                    if (this.lessTime == 0) {
                        this.nextPlayer();
                    } else {
                        this.lastUserInfo.updateUI(this.lessTime--, this.lastPokers.length, this.landlord == 2);
                    }
                }
                break;
        }
    }

    private nextPlayer() {
        this.lessTime = 15;
        switch (this.gameState) {
            case 0:
                this.clock.node.active = false;
                this.gameState = 1;
                this.selfUserInfo.updateUI(0, this.selfPokers.length, this.landlord == 0);
                break;
            case 1:
                this.gameState = 2;
                this.nextUserInfo.updateUI(0, this.nextPokers.length, this.landlord == 1);
                break;
            case 2:
                this.gameState = 0;
                this.clock.node.active = true;
                this.lastUserInfo.updateUI(0, this.lastPokers.length, this.landlord == 2);
                break;
        }
    }

    private playPoker() {
        let choosePokers: Poker[] = [];
        this.selfPokers.forEach((poker: Poker) => {
            if (poker.checkValue()) {
                choosePokers.push(poker);
            }
        });
        this.commonPlayPoker(0, choosePokers);
    }

    private commonPlayPoker(playUser: number, choosePokers: Poker[]): boolean {
        const pokerType = PokerUtils.getPokerType(choosePokers);
        if (pokerType == null) {
            return false;
        }
        console.log(playUser + " play " + pokerType.getType() + ";sort=" + pokerType.getSort());
        const currentPokerType: PokerType = PokerUtils.getPokerType(this.currentPokers);
        if (currentPokerType != null && this.currentPokerBelong != playUser) {
            console.log("last play " + currentPokerType.getType() + ";sort=" + currentPokerType.getSort());
            if (!PokerUtils.canPlay(pokerType, currentPokerType)) {
                return false;
            }
        }
        let selfPoker = "";
        this.selfPokers.forEach((poker: Poker) => {
            selfPoker += (poker.realValue() + ",");
        });
        let nextPoker = "";
        this.nextPokers.forEach((poker: Poker) => {
            nextPoker += (poker.realValue() + ",");
        });
        let lastPoker = "";
        this.lastPokers.forEach((poker: Poker) => {
            lastPoker += (poker.realValue() + ",");
        });

        for (let i = 0; i < this.currentPokers.length; i++) {
            this.currentPokers[i].node.active = false;
        }
        switch (playUser) {
            case 1:
                choosePokers.forEach((poker: Poker) => {
                    this.nextPokers.splice(this.nextPokers.indexOf(poker), 1);
                });
                this.showNextScope(choosePokers);
                this.nextUserInfo.updateUI(0, this.nextPokers.length, this.landlord == 1);
                this.nextPokerUtils.updatePokerMap(this.nextPokers);
                this.currentPokerBelong = 1;
                break;
            case 2:
                choosePokers.forEach((poker: Poker) => {
                    this.lastPokers.splice(this.lastPokers.indexOf(poker), 1);
                });
                this.showLastScope(choosePokers);
                this.lastUserInfo.updateUI(0, this.lastPokers.length, this.landlord == 2);
                this.lastPokerUtils.updatePokerMap(this.lastPokers);
                this.currentPokerBelong = 2;
                break;
            default:
                choosePokers.forEach((poker: Poker) => {
                    this.selfPokers.splice(this.selfPokers.indexOf(poker), 1);
                });
                this.showSelfPlayScope(choosePokers);
                this.showSelfScope(this.selfPokers);
                this.selfUserInfo.updateUI(0, this.selfPokers.length, this.landlord == 0);
                this.selfPokerUtils.updatePokerMap(this.selfPokers);
                this.currentPokerBelong = 0;
                break;
        }
        console.log("selfPoker=" + selfPoker);
        console.log("nextPoker=" + nextPoker);
        console.log("lastPoker=" + lastPoker);
        this.currentPokers = choosePokers;
        this.nextPlayer();
        this.updateUI();
    }

    private showSelfPlayScope(pokers: Poker[]) {
        this.commonShowPoker(pokers, -150, -100, 30);
    }

    private showSelfScope(pokers: Poker[]) {
        this.commonShowPoker(pokers, -450, -400, 30);
    }

    private showLastScope(pokers: Poker[]) {
        this.commonShowPoker(pokers, -550, 200, 10);
    }

    private showNextScope(pokers: Poker[]) {
        this.commonShowPoker(pokers, 150, 200, 10);
    }

    private commonShowPoker(pokers: Poker[], startXPos: number, startYPos: number, maxIndex: number) {
        if (pokers.length == 0) {
            return;
        }
        pokers.sort(PokerUtils.sortPoker);
        let tempZIndex = 50;
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

