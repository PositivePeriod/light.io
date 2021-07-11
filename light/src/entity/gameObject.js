import { SHAPE } from "../util/constant.js";
import { OrthogonalVector } from "../util/vector.js";
import { ObjectSystem } from "./objectSystem.js";

export class GameObject {
    static system = new ObjectSystem();

    constructor(x, y) {
        this.type = ["GameObject"];

        // Kinematics
        this.mass = 1;
        this.force = new OrthogonalVector();
        this.velocity = new OrthogonalVector();
        this.pos = new OrthogonalVector(x, y);

        // Visualize
        this.shape = null; //
        this.color = "#000000";
        this.passable = true; //
        this.movable = true; //
    }

    applyForce(force) {
        this.force.addBy(force.toOrthogonal());
    }

    setPos(x, y) {
        this.pos = new OrthogonalVector(x, y);
    }

    update(dt) {
        var accel = this.force.multiply(1 / this.mass);
        this.velocity.addBy(accel.multiply(dt));
        this.pos.addBy(this.velocity.multiply(dt));
        this.force = new OrthogonalVector();
    }

    makeShape(shape, option) {
        if (!SHAPE.has(shape)) {
            console.error("Impossible object shape; ", shape);
            return this
        }
        SHAPE.get(shape).property.forEach(prop => {
            if (option[prop] === undefined) {
                console.error("Not enough property in option; ", prop, option[prop], option);
                return this
            }
        });

        SHAPE.get(shape).property.forEach(prop => { this[prop] = option[prop] })
        this.shape = shape;
        if (option.x && option.y) {
            this.setPos(option.x, option.y);
            if (shape === "Rect" && option.center === false) {
                this.setPos(option.x + option.width / 2, this.y = option.y + option.height / 2);
            }
        }
        if (option.color) {
            this.color = option.color;
        }
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
        return this
    }

    isCollidedWith(other) {
        return ObjectSystem.isCollided(this, other);
    }
}