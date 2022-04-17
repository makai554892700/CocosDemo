import {_decorator, Component, Node} from 'cc';

const {ccclass, property} = _decorator;

@ccclass('ButtonScaler')
export class ButtonScaler extends Component {

    @property({visible: true})
    private buttonNormal: number = 1;
    @property({visible: true})
    private buttonTouch: number = 0.8;

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, function (sx: number, sy: number) {
            this.node.setScale(this.buttonTouch, this.buttonTouch);
        }, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, function (sx: number, sy: number) {
            this.node.setScale(this.buttonNormal, this.buttonNormal);
        }, this);
        this.node.on(Node.EventType.TOUCH_END, function (sx: number, sy: number) {
            this.node.setScale(this.buttonNormal, this.buttonNormal);
        }, this);
    }

    start() {
    }

}
