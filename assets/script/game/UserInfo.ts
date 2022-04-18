import {_decorator, Component, SpriteFrame, Sprite, Label} from 'cc';

const {ccclass, property} = _decorator;

@ccclass('UserInfo')
export class UserInfo extends Component {

    public static instance: UserInfo = null!;
    private userName: string = null!;
    private lessTime: number = null!;
    private havePoker: number = null!;
    private userType: number = null!;
    private userHead: SpriteFrame = null!;
    private head_image: Sprite = null!;
    private user_name: Label = null!;
    private clock_left: Sprite = null!;
    private clock_left_text: Label = null!;
    private clock_right: Sprite = null!;
    private clock_right_text: Label = null!;
    private less_poker_left: Sprite = null!;
    private less_poker_left_text: Label = null!;
    private less_poker_right: Sprite = null!;
    private less_poker_right_text: Label = null!;

    public init(userType: number, userName: string, lessTime: number, havePoker: number, userHead: SpriteFrame) {
        UserInfo.instance = this;
        if (userName.length >= 5) {
            userName = userName.substr(0, 5) + "...";
        }
        this.userType = userType;
        this.userName = userName;
        this.lessTime = lessTime;
        this.havePoker = havePoker;
        this.userHead = userHead;
        this.user_name = this.node.getChildByName("user_name").getComponent(Label);
        this.user_name.string = userName;

        this.clock_left = this.node.getChildByName("clock_left").getComponent(Sprite);
        this.clock_left_text = this.node.getChildByName("clock_left").getChildByName("clock_text").getComponent(Label);
        this.clock_right = this.node.getChildByName("clock_right").getComponent(Sprite);
        this.clock_right_text = this.node.getChildByName("clock_right").getChildByName("clock_text").getComponent(Label);
        this.less_poker_left = this.node.getChildByName("less_poker_left").getComponent(Sprite);

        this.less_poker_left_text = this.node.getChildByName("less_poker_left").getChildByName("less_poker_text").getComponent(Label);
        this.less_poker_right = this.node.getChildByName("less_poker_right").getComponent(Sprite);
        this.less_poker_right_text = this.node.getChildByName("less_poker_right").getChildByName("less_poker_text").getComponent(Label);

        this.head_image = this.node.getChildByName("head_back").getChildByName("head_image").getComponent(Sprite);
        this.head_image.spriteFrame = userHead;
        this.updateUI(lessTime, havePoker);
    }


    public updateUI(lessTime: number, havePoker: number) {
        this.lessTime = lessTime;
        this.havePoker = havePoker;
        if (this.lessTime == 0) {
            this.clock_right.node.active = false;
            this.clock_left.node.active = false;
        } else {
            this.clock_right.node.active = true;
            this.clock_left.node.active = true;
        }
        if (this.havePoker < 1) {
            this.less_poker_left.node.active = false;
            this.less_poker_right.node.active = false;
        } else {
            this.less_poker_left.node.active = true;
            this.less_poker_right.node.active = true;
        }
        this.clock_left_text.string = "" + this.lessTime;
        this.clock_right_text.string = "" + this.lessTime;
        this.less_poker_left_text.string = "" + this.havePoker;
        this.less_poker_right_text.string = "" + this.havePoker;
        switch (this.userType) {
            case 1:
                this.node.setPosition(-800, 200);
                this.clock_left.node.active = false;
                this.less_poker_left.node.active = false;
                break;
            case 2:
                this.node.setPosition(800, 200);
                this.clock_right.node.active = false;
                this.less_poker_right.node.active = false;
                break;
            default:
                this.node.setPosition(-700, -400);
                this.clock_left.node.active = false;
                this.clock_right.node.active = false;
                this.less_poker_left.node.active = false;
                this.less_poker_right.node.active = false;
                break;
        }
    }

}

