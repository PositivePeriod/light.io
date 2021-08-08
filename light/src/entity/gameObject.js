import { Color } from "../util/color.js";
import { SHAPE } from "../util/constant.js";
import { OrthogonalVector } from "../util/vector.js";
import { Collision } from "../system/collision.js";
import { Visualizer } from "../system/visualizer.js";
import { UID } from "../util/uid.js";

export class GameObject {
    constructor(x, y) {
        this.id = UID.get();
        this.type = ["GameObject"];

        // Kinematics
        this.mass = 1;
        this.force = new OrthogonalVector();
        this.velocity = new OrthogonalVector();
        this.pos = new OrthogonalVector(x, y);

        // Visualize
        this.shape = null;
        this.color = Color.Black;
        this.passable = true;
        this.movable = true;
        this.opaque = false;
    }

    applyForce(force) { this.force.addBy(force.toOrthogonal()); }

    update(dt) {
        var accel = this.force.multiply(1 / this.mass);
        this.velocity.addBy(accel.multiply(dt));
        this.pos.addBy(this.velocity.multiply(dt));
        this.force = new OrthogonalVector();
    }

    getPhysicalWall() {

    }

    makeShape(shape, option) {
        if (!SHAPE.has(shape)) { console.error("Impossible object shape; ", shape); return; }
        SHAPE.get(shape).property.forEach(prop => {
            if (option[prop] === undefined) { console.error("Not enough property in option; ", prop, option[prop], option); return; } else { this[prop] = option[prop] }
        })
        switch (shape) { // for roughCollide // Can be 2 but want to be sure
            case "Rect":

            case "Tri":
                break;
            case "Circle":
            case "Hex":
                this.width = 2.5 * this.rad;
                this.height = 2.5 * this.rad;
                break;
            case "Donut":
                this.width = 2.5 * this.outerR;
                this.height = 2.5 * this.outerR;
                break;
        }
        this.shape = shape;
        if (option.x && option.y) { this.pos = new OrthogonalVector(option.x , option.y); }
        if (option.color) { this.color = option.color; }
        if (shape === "Hex") {
            Object.defineProperty(this, "pseudoObjects", {
                get: function() {
                    return [
                        { "shape": "Tri", "pos": this.pos.add(new OrthogonalVector(this.rad * 3 / 4, this.rad * 3 ** 0.5 / 4)), "width": this.rad / 2, "height": this.rad * 3 ** 0.5 / 2, "dir": [1, 1] },
                        { "shape": "Tri", "pos": this.pos.add(new OrthogonalVector(this.rad * 3 / 4, -this.rad * 3 ** 0.5 / 4)), "width": this.rad / 2, "height": this.rad * 3 ** 0.5 / 2, "dir": [1, -1] },
                        { "shape": "Tri", "pos": this.pos.add(new OrthogonalVector(-this.rad * 3 / 4, this.rad * 3 ** 0.5 / 4)), "width": this.rad / 2, "height": this.rad * 3 ** 0.5 / 2, "dir": [-1, 1] },
                        { "shape": "Tri", "pos": this.pos.add(new OrthogonalVector(-this.rad * 3 / 4, -this.rad * 3 ** 0.5 / 4)), "width": this.rad / 2, "height": this.rad * 3 ** 0.5 / 2, "dir": [-1, -1] },
                        { "shape": "Rect", "pos": this.pos.copy(), "width": this.rad, "height": this.rad * 3 ** 0.5 },
                    ]
                }
            });
        }
    }

    draw() { this.drawFuncUid = Visualizer.addFunc("static", function(layer, obj) { this.drawObject(layer, obj); }, [this]); }

    removeDraw() { Visualizer.removeFunc("static", this.drawFuncUid); }

    isCollidedWith(other) {
        return Collision.isCollided(this, other);
    }
}