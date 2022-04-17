
import { _decorator, Component, Node, director, ProgressBar, Label, Sprite } from 'cc';
const { ccclass, property } = _decorator;


 
@ccclass('Launch')
export class Launch extends Component {

    @property({ type: Sprite, visible: true })
    private loadingBack: Sprite = null!;
    @property({ type: Sprite, visible: true })
    private loadingLine: Sprite = null!;
    @property({ type: Label, visible: true })
    private loadingText: Label = null!;
    private totalTime: number = 15;
    private currentTime: number = 0;


    start() {
        console.log("Launch start.");
    }

    update(deltaTime: number) {
        let ratio = this.currentTime / this.totalTime;
        this.loadingLine.fillRange = ratio;
        this.loadingText.string = "loading..." + this.currentTime + "/" + this.totalTime;
        this.currentTime += deltaTime;
        if (this.currentTime > this.totalTime) {
            this.currentTime = 0;
            console.log("currentTime = 0");
        }
    }

    private handleClick() {
        console.log("handle click.");
        director.loadScene("Home");
    }


}

