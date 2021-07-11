import { GameObject } from "../gameObject.js"

export class MapObject extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.type.push("MapObject");

        this.color = "#808080";
        this.movable = false;
        this.passable = false;
    }

    update(dt) {
        if (this.movable) { super.update(dt); }
    }

    applyForce(force) {
        if (this.movable) { super.applyForce(force); }
    }
}