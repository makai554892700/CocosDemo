import {_decorator, Component, Node, SpriteAtlas, Prefab, instantiate, SpriteFrame} from 'cc';
import {Poker} from "./Poker";

const {ccclass, property} = _decorator;

@ccclass('PokerFactory')
export class PokerFactory extends Component {

    public static instance: PokerFactory = null!;

    private pokers: Map<string, SpriteFrame> = null!;
    private pokerViewPrefab: Prefab = null!;

    public init(pokers: Map<string, SpriteFrame>, pokerViewPrefab: Prefab) {
        PokerFactory.instance = this;
        this.pokers = pokers;
        this.pokerViewPrefab = pokerViewPrefab;
    }

    public value2Name(pokerValue: number) {
        if (pokerValue == 518) {
            return "xw";
        }
        if (pokerValue == 519) {
            return "dw";
        }
        const pokerTypes = ['hot', 'ht', 'f', 'm'];
        const pokerType = Math.floor(pokerValue / 100);
        const value = pokerValue % 100;
        const result = pokerTypes[pokerType - 1] + value;
        // console.log("value2Name " + pokerValue + "=" + result);
        return result;
    }

    public createPoker(pokerValue: number): Poker {
        const poker = instantiate(this.pokerViewPrefab);
        this.node.addChild(poker);
        const pokerCtrl = poker.addComponent(Poker);
        const backSp = this.pokers.get("poker_back");
        const valueSp = this.pokers.get(this.value2Name(pokerValue));
        pokerCtrl.init(pokerValue, backSp, valueSp);
        pokerCtrl.node.active = false;
        return pokerCtrl;
    }

}

