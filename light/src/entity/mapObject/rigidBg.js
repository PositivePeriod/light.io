import { OrthogonalVector } from "../../util/vector.js";
import { MapObject } from "./mapObject.js";

export class RigidBackground extends MapObject {
    constructor(x, y, accuracy) {
        super(x, y);
        this.type.push("BouncyBackground");
        this.accuracy = accuracy || 10;

        this.color = "#444444";
    }

    collide(other, dt) {
        var dPos = other.velocity.multiply(dt);
        while (this.isCollidedWith(other)) {
            other.pos.minusBy(dPos);
        }
        for (let i = 0; i < this.accuracy; i++) {
            dPos.multiplyBy(1 / 2);
            var counter = 0;
            while (!this.isCollidedWith(other)) {
                if (counter > 1e6) {
                    console.error("Infinite collision detection; check init collision between bodies");
                    return;
                }
                counter += 1;
                other.pos.addBy(dPos);
            }
            other.pos.minusBy(dPos);
        }
    }

    collideAfter(other) { other.velocity = new OrthogonalVector(); }
}