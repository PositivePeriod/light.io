import { pointIsInPoly, pointIsInPoly2 } from "../../util/vector.js";
import { GameObject } from "../gameObject.js";
import { MapObject } from "./mapObject.js";

class Panel extends MapObject {
    constructor(x, y) {
        super(x, y);
        this.type.push("Panel");

        this.passable = true;
    }

    update() {
        var observers = [];
        GameObject.system.find("MovableObject").forEach(mover => {
            var flatPolygon = [].concat(...mover.polygon);
            if (pointIsInPoly(this.pos, flatPolygon)) { observers.push(mover); }
        });
        this.observers = observers;
    }
}

export class AtLeastPanel extends Panel {
    constructor(x, y) {
        super(x, y);
        this.type.push("AtLeastPanel");

        this.passable = true;
    }

    update() {
        // var getRandomInt = (min, max) => {
        //     min = Math.ceil(min);
        //     max = Math.floor(max);
        //     return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
        // }
        super.update();
        console.log('ob', this.observers, this.observers.length);
        if (this.observers.length === 0) {
            this.color = "#FFFFFF";
        } else {
            var index = Math.floor(Math.random() * this.observers.length);
            this.color = this.observers[index].color;
        }
    }
}