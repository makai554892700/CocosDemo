import {_decorator, Component, Node, SpriteFrame, Sprite} from 'cc';

const {ccclass, property} = _decorator;

@ccclass('Poker')
export class Poker extends Component {

    public static instance: Poker = null!;
    private value: number;
    private backSp: SpriteFrame;
    private valueSp: SpriteFrame;
    private sprite: Sprite = null!;

    public init(value: number, backSp: SpriteFrame, valueSp: SpriteFrame) {
        Poker.instance = this;
        this.value = value;
        this.backSp = backSp;
        this.valueSp = valueSp;
        this.sprite = this.node.getComponent(Sprite);
        if (this.valueSp.name == "dw" || this.valueSp.name == "xw") {
            this.sprite.node.setScale(0.87, 0.87);
        }
    }

    public showBackground() {
        this.sprite.spriteFrame = this.backSp;
    }

    public showValue() {
        this.sprite.spriteFrame = this.valueSp;
    }

    public pokerValue() {
        return this.value;
    }

}

