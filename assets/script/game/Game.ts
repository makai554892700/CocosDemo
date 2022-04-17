import {_decorator, Component, Node, assetManager, AssetManager, SpriteAtlas, Prefab, SpriteFrame} from 'cc';
import {PokerFactory} from "./PokerFactory";
import {Poker} from "./Poker";

const {ccclass, property} = _decorator;

@ccclass('Game')
export class Game extends Component {

    private gameBundle: AssetManager.Bundle = null!;
    private pokers = new Map<string, SpriteFrame>();
    private pokerViewPrefab: Prefab = null!;
    private usePokers = new Map<number, Poker>();

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
        this.initPoker();
    }

    private initPoker() {
        this.usePokers.clear();
        let tempPokerNumber;
        for (let i = 1; i < 5; i++) {
            for (let j = 1; j < 14; j++) {
                tempPokerNumber = i * 100 + j;
                this.usePokers.set(tempPokerNumber, PokerFactory.instance.createPoker(tempPokerNumber));
            }
        }
        this.usePokers.set(516, PokerFactory.instance.createPoker(516));
        this.usePokers.set(517, PokerFactory.instance.createPoker(517));
    }

}

