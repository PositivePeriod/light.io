import { ObjectSystem } from "../../system/objectSystem.js";
import { Visualizer } from "../../system/visualizer.js";
import { Color } from "../../util/color.js";
import { BouncyBackground } from "./bouncyBg.js";

export class MovingBackground extends BouncyBackground {
    constructor(x, y, bounce) {
        super(x, y, bounce);
        this.type.push("MovingBackground");

        this.color = new Color("hex", "#444444");

        this.friction = 0.1;
        this.movable = true;
    }

    collide(other) {
        var force = super.collide(other);
        this.applyForce(force.negative());
    }

    update(dt) {
        super.update(dt);

        var collidedObj = [];
        ObjectSystem.find("GameObject").forEach(obj => {
            if (!obj.passable && this.isCollidedWith(obj) && obj !== this) {
                obj.collide(this, dt);
                collidedObj.push(obj);
            }
        });
        collidedObj.forEach(obj => { obj.collideAfter(this); });
        this.velocity.multiplyBy(Math.pow(this.friction, dt));
    }

    draw() { this.drawFuncUid = Visualizer.addFunc("mover", function(layer, obj) { this.drawObject(layer, obj); }, [this]); }

    removeDraw() { Visualizer.removeFunc("mover", this.drawFuncUid); }

    collideAfter() { return; }
}