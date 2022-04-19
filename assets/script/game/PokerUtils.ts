import {Poker} from "./Poker";
import {PokerType} from "./PokerType";

interface PokerArrayBack {
    (data: Poker[]): void;
}

export class PokerUtils {

    public static POKER_TYPES = ["typeBoom", "typeKingBoom", "typeSingle", "typePair", "typeThree", "typeThreeSingle"
        , "typeThreePair", "typeStraight", "typeStraightPairs", "typePlane", "typePlane2Single", "typePlane2Pairs"
        , "typeFour2Single", "typeFour2Pairs"
    ];
    private pokerMap: Map<string, Poker[][]> = new Map<string, Poker[][]>();
    private userType: number = -1;

    public constructor(userType: number, pokers: Poker[]) {
        this.userType = userType;
        this.updatePokerMap(pokers);
    }

    public updatePokerMap(pokers: Poker[]) {
        this.pokerMap.clear();
        if (pokers == null) {
            return;
        }
        const allPokers: Poker[][] = PokerUtils.getPokerArray(pokers);
        allPokers.forEach(((value) => {
            let pokerType: PokerType = PokerUtils.getPokerType(value);
            if (pokerType != null) {
                let mapValue: Poker[][] = this.pokerMap.get(pokerType.getType());
                if (mapValue == null) {
                    mapValue = [];
                }
                mapValue.push(value);
                this.pokerMap.set(pokerType.getType(), mapValue);
            }
        }));
    }

    public static getPokerArray(pokers: Poker[]): Poker[][] {
        let result = [];
        for (let i = 1; i < pokers.length; i++) {
            this.updatePokerArray(pokers, [], i, (data: Poker[]) => {
                result.push(data);
            });
        }
        result.push(pokers);
        return result;
    }

    public static updatePokerArray(parent: Poker[], current: Poker[], len: number, pokerArrayBack: PokerArrayBack) {
        let copyData: Poker[] = null!;
        let copyWorkSpace: Poker[] = null!;
        if (current.length == len) {
            pokerArrayBack(current);
        }
        for (let i = 0; i < parent.length; i++) {
            copyData = [];
            parent.forEach((poker: Poker) => {
                copyData.push(poker);
            });
            copyWorkSpace = [];
            current.forEach((poker: Poker) => {
                copyWorkSpace.push(poker);
            });
            copyWorkSpace.push(copyData[i]);
            for (let j = i; j >= 0; j--) {
                copyData.splice(j, 1);
            }
            this.updatePokerArray(copyData, copyWorkSpace, len, pokerArrayBack);
        }
    }

    public getPlay(currentPokers: Poker[]): Poker[] {
        let pokerType: PokerType = PokerUtils.getPokerType(currentPokers);
        if (pokerType.getType() == PokerUtils.POKER_TYPES[1]) {
            return null;
        }
        let typePokers: Poker[][] = this.pokerMap.get(pokerType.getType());
        let canPokers: Poker[][] = [];
        if (typePokers != null) {
            typePokers.forEach((value => {
                let tempPokerType: PokerType = PokerUtils.getPokerType(value);
                if (PokerUtils.canPlay(tempPokerType, pokerType)) {
                    canPokers.push(value);
                }
            }));
        }
        if (canPokers.length > 0) {
            canPokers.sort((a: Poker[], b: Poker[]) => {
                let typeA = PokerUtils.getPokerType(a);
                let typeB = PokerUtils.getPokerType(b);
                if (typeA == null || typeB == null) {
                    return 0;
                }
                if (typeA.getSort() > typeB.getSort()) {
                    return 1;
                } else {
                    return -1;
                }
            });
            canPokers.forEach((canPoker: Poker[]) => {
                let pt: PokerType = PokerUtils.getPokerType(canPoker);
                console.log("canPoker:" + pt.getType() + ":" + pt.getSort());
            });
            return canPokers[0];
        }
        return null;
    }

    public static canPlay(pokerA: PokerType, pokerB: PokerType): boolean {
        if (this.POKER_TYPES[1] === pokerA.getType()) {
            return true;
        } else if (this.POKER_TYPES[0] === pokerA.getType() && (this.POKER_TYPES[0] != pokerB.getType() || pokerA.getSort() > pokerB.getSort())) {
            return true;
        } else if (pokerA.getLength() == pokerB.getLength() && pokerA.getSort() > pokerB.getSort()) {
            return true;
        }
        return false;
    }

    public static getPokerType(pokers: Poker[]) {
        if (pokers == null || pokers.length == 0) {
            return null;
        }
        pokers.sort(this.sortPoker);
        let pokerNumber = -1;
        const functions: Function[] = [this.isBoom, this.isKingBoom, this.isSingle, this.isPair, this.isThree
            , this.isThreeSingle, this.isThreePairs, this.isStraight, this.isStraightPairs, this.isPlane
            , this.isPlane2Single, this.isPlane2pairs, this.isFour2Single, this.isFour2Pairs,];
        let i = 0;
        for (; pokerNumber == -1 && i < functions.length; i++) {
            pokerNumber = functions[i](pokers);
        }
        if (pokerNumber != -1 && i <= functions.length) {
            return new PokerType(this.POKER_TYPES[i - 1], pokerNumber, pokers.length);
        }
        return null;
    }

    public static isBoom(array: Poker[]): number {
        if (array.length == 4 && array[1].realValue() == array[0].realValue()
            && array[2].realValue() == array[0].realValue()
            && array[3].realValue() == array[0].realValue()) {
            return array[0].realValue();
        } else {
            return -1;
        }
    }

    public static isKingBoom(array: Poker[]): number {
        if (array.length == 2 && array[0].realValue() === 17 && array[1].realValue() === 16) {
            return 0;
        } else {
            return -1;
        }
    }

    public static isSingle(array: Poker[]): number {
        if (array.length == 1) return array[0].realValue();
        return -1;
    }

    public static isPair(array: Poker[]): number {
        if (array.length == 2 && array[0].realValue() == array[1].realValue())
            return array[0].realValue();
        return -1;
    }

    public static isStraight(array: Poker[]): number {
        if (array.length < 5 || array.length > 12) return -1;
        if (array[0].realValue() > 14) return -1;
        for (let i = 0; i < array.length - 1; i++) {
            if (array[i].realValue() != array[i + 1].realValue() + 1) return -1;
        }
        return array[0].realValue();
    }

    public static isThree(array: Poker[]): number {
        if (array.length != 3) return -1;
        if (array[1].realValue() == array[0].realValue()
            && array[2].realValue() == array[0].realValue())
            return array[0].realValue();
        return -1;
    }

    public static isThreeSingle(array: Poker[]): number {
        if (array.length != 4) return -1;
        if (array[1].realValue() === array[0].realValue()
            && array[2].realValue() === array[0].realValue()
            && array[3].realValue() != array[0].realValue())
            return array[0].realValue();
        if (array[1].realValue() === array[3].realValue()
            && array[2].realValue() === array[3].realValue()
            && array[0].realValue() != array[3].realValue())
            return array[1].realValue();
        return -1;
    }

    public static isThreePairs(array: Poker[]): number {
        if (array.length != 5) return -1;
        if (array[1].realValue() === array[0].realValue()
            && array[2].realValue() === array[0].realValue()
            && array[3].realValue() != array[0].realValue()
            && array[3].realValue() === array[4].realValue())
            return array[0].realValue();
        if (array[0].realValue() === array[1].realValue()
            && array[2].realValue() === array[3].realValue()
            && array[3].realValue() === array[4].realValue()
            && array[0].realValue() != array[2].realValue())
            return array[2].realValue();
        return -1;
    }

    public static isStraightPairs(array: Poker[]): number {
        if (array.length < 6 || array.length > 20 || array.length % 2 != 0) return -1;
        if (array[0].realValue() < 3) return -1;

        for (let i = 0; i < array.length - 1; i += 2) {
            if (array[i].realValue() != array[i + 1].realValue()) return -1;
        }
        for (let i = 0; i < array.length - 2; i += 2) {
            if (array[i].realValue() != array[i + 2].realValue() + 1) return -1;
        }
        return array[0].realValue();
    }

    public static isPlane(array: Poker[]): number {
        if (array.length != 6) return -1;
        if (array[0].realValue() < 3) return -1;
        if (array[0].realValue() === array[1].realValue() && array[1].realValue() === array[2].realValue()
            && array[3].realValue() === array[4].realValue() && array[4].realValue() === array[5].realValue()
            && array[0].realValue() === array[3].realValue() + 1)
            return array[0].realValue();
        return -1;
    }

    public static isPlane2Single(array: Poker[]): number {
        let a: Poker[] = [];
        if (array.length != 8) return -1;
        for (let i = 0; i < array.length - 2; i++) {
            if (array[i].realValue() === array[i + 1].realValue()
                && array[i].realValue() == array[i + 2].realValue()) {
                a.push(array[i]);
            }
        }
        if (a.length != 2) return -1;
        if (a[0].realValue() > 14) return -1;
        if (a[0].realValue() - 1 === a[1].realValue())
            return a[0].realValue();
        return -1;
    }

    public static isPlane2pairs(array: Poker[]): number {
        if (array.length != 10) return -1;
        let newArray: Poker[] = [];
        let three: Poker[] = [];
        for (let i = 0; i < array.length - 2; i++) {
            if (array[i].realValue() == array[i + 1].realValue()
                && array[i].realValue() == array[i + 2].realValue()) {
                three.push(array[i]);
            }
            newArray = newArray.concat(PokerUtils.removePokers(array, [array[i], array[i + 1], array[i + 2]]));
        }
        if (three.length != 2) return -1;
        newArray = PokerUtils.removePokers(array, newArray);
        for (let i = 0; i < newArray.length - 1; i += 2) {
            if (newArray[i].realValue() !== newArray[i + 1].realValue()) return -1;
        }
        if (three[0].realValue() > 14) return -1;
        if (three[0].realValue() - 1 === three[1].realValue()) return three[0].realValue();
        return -1;
    }

    public static isFour2Single(array: Poker[]): number {
        if (array.length != 6) return -1;
        for (let i = 0; i < array.length - 3; i++) {
            if (array[i].realValue() === array[i + 1].realValue()
                && array[i].realValue() === array[i + 2].realValue()
                && array[i].realValue() === array[i + 3].realValue())
                return array[i].realValue();
        }
        return -1;
    }

    public static isFour2Pairs(array: Poker[]): number {
        let newArray: Poker[] = [];
        let four: Poker = null!;
        if (array.length != 8) return -1;
        for (let i = 0; i < array.length - 3; i++) {
            if (array[i].realValue() === array[i + 1].realValue()
                && array[i].realValue() === array[i + 2].realValue()
                && array[i].realValue() === array[i + 3].realValue()) {
                newArray = newArray.concat(PokerUtils.removePokers(array, [array[i], array[i + 1], array[i + 2], array[i + 3]]));
                four = array[i];
            }
        }
        for (let i = 0; i < newArray.length - 1; i += 2) {
            if (newArray[i].realValue() !== newArray[i + 1].realValue()) return -1;
        }
        return four == null ? -1 : four.realValue();
    }

    public static removePokers(array: Poker[], elements: Poker[]): Poker[] {
        let result: Poker[] = [];
        for (let i = 0; i < array.length; i++) {
            let flag: boolean = false;
            for (let j = 0; j < elements.length; j++) {
                if (array[i].pokerValue() == elements[j].pokerValue()) {
                    flag = true;
                }
            }
            if (!flag) {
                result.push(array[i]);
            }
        }
        return result;
    }

    public static sortPoker(a: Poker, b: Poker) {
        let valueA: number = a.realValue();
        let valueB: number = b.realValue();
        if (valueA == valueB) {
            return 0;
        } else if (valueA > valueB) {
            return -1;
        } else {
            return 1;
        }
    }

}

