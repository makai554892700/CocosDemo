import {_decorator, Component, Prefab, instantiate, SpriteFrame} from 'cc';
import {UserInfo} from "./UserInfo";

const {ccclass, property} = _decorator;

@ccclass('UserInfoFactory')
export class UserInfoFactory extends Component {

    public static instance: UserInfoFactory = null!;
    private userInfoPrefab: Prefab = null!;

    public init(userInfoPrefab: Prefab) {
        UserInfoFactory.instance = this;
        this.userInfoPrefab = userInfoPrefab;
    }

    public createUserInfo(userType: number, userName: string, lessTime: number, havePoker: number, userHead: SpriteFrame): UserInfo {
        const userInfo = instantiate(this.userInfoPrefab);
        this.node.addChild(userInfo);
        const userInfoCtrl = userInfo.addComponent(UserInfo);
        userInfoCtrl.init(userType, userName, lessTime, havePoker, userHead);
        return userInfoCtrl;
    }

}

