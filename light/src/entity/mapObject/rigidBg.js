import { Color } from "../../util/color.js";
import { OrthogonalVector } from "../../util/vector.js";
import { MapObject } from "./mapObject.js";

export class RigidBackground extends MapObject {
    constructor(x, y, accuracy) {
        super(x, y);
        this.type.push("RigidBackground");
        this.accuracy = accuracy || 10;

        this.color = new Color("hex", "#444444");
    }

    collide(other, dt) {
        var dPos = other.velocity.multiply(dt);
        var counter = 0;
        while (this.isCollidedWith(other)) {
            if (counter++ > 1e4) {
                console.error("Infinite collision detection; check init collision between bodies");
                return;
            }
            other.pos.minusBy(dPos);
        }
        for (let i = 0; i < this.accuracy; i++) {
            dPos.multiplyBy(1 / 2);
            var counter = 0;
            while (!this.isCollidedWith(other)) {
                if (counter++ > 1e4) {
                    console.error("Infinite collision detection; check init collision between bodies");
                    return;
                }
                other.pos.addBy(dPos);
            }
            other.pos.minusBy(dPos);
        }
    }

    collideAfter(other) { other.velocity = new OrthogonalVector(); }
}

export class RigidLine extends MapObject {
    // TODO
}