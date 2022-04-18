import {_decorator, Component, Node, SpriteFrame, Sprite} from 'cc';

const {ccclass, property} = _decorator;

@ccclass('Poker')
export class Poker extends Component {

    public static instance: Poker = null!;
    private value: number;
    private backSp: SpriteFrame;
    private valueSp: SpriteFrame;
    private sprite: Sprite = null!;
    private check: boolean = false;

    public init(value: number, backSp: SpriteFrame, valueSp: SpriteFrame) {
        Poker.instance = this;
        this.value = value;
        this.backSp = backSp;
        this.valueSp = valueSp;
        this.sprite = this.node.getComponent(Sprite);
        if (this.valueSp.name == "dw" || this.valueSp.name == "xw") {
            this.sprite.node.setScale(0.87, 0.87);
        }
        this.node.on(Node.EventType.TOUCH_START, function (sx: number, sy: number) {
            this.check = !this.check;
            if (this.check) {
                this.node.setPosition(this.node.position.x, this.node.position.y + 20);
            } else {
                this.node.setPosition(this.node.position.x, this.node.position.y - 20);
            }
        }, this);
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

    public checkValue() {
        return this.check;
    }

}

