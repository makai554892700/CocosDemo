import {_decorator, Button, Component, director, Label, Sprite} from 'cc';

const { ccclass, property } = _decorator;



@ccclass('Launch')
export class Launch extends Component {

    @property({ type: Button, visible: true })
    private startButton: Button = null!;
    @property({ type: Sprite, visible: true })
    private loadingBack: Sprite = null!;
    @property({ type: Sprite, visible: true })
    private loadingLine: Sprite = null!;
    @property({ type: Label, visible: true })
    private loadingText: Label = null!;
    private totalLoading: number = 3;
    private currentLoading: number = 0;

    start() {
        this.loadingBack.node.active = true;
        this.startButton.node.active = false;
        this.updateLoading().then(r => {});
    }

    update(deltaTime: number) {
    }

    private async updateLoading() {
        this.loadingLine.fillRange = this.currentLoading / this.totalLoading;
        this.currentLoading += 1;
        this.loadingText.string = "loading..." + this.currentLoading + "/" + this.totalLoading;
        if (this.currentLoading >= this.totalLoading) {
            this.loadingBack.node.active = false;
            this.startButton.node.active = true;
        } else {
            this.scheduleOnce(function () {
                this.updateLoading();
            }, 1);
        }
    }

    private handleClick() {
        console.log("handle click.");
        director.loadScene("Home");
    }


}

