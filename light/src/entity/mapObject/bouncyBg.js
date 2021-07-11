import { SHAPE } from "../../util/constant.js";
import { PolarVector } from "../../util/vector.js";
import { MapObject } from "./mapObject.js";

export class BouncyBackground extends MapObject {
    constructor(x, y, bounce) {
        super(x, y);
        this.type.push("BouncyBackground");
        this.bounce = bounce || 1;

        this.color = "#444444";
    }

    collide(other) {
        // TODO 제일 깊숙이 들어간 점 기준으로 해야 하는 것이 맞지 않은가?
        if (!SHAPE.has(this.shape)) {
            console.error("Impossible object shape; ", this.shape);
        }
        switch (this.shape) {
            case "Rect":
                var pos = other.pos.minus(this.pos);
                if (this.width > this.height) {
                    var l = (this.width - this.height) / 2;
                    if (Math.abs(pos.x) <= l) {
                        if (pos.y === 0) { break; }
                        var force = new PolarVector(this.bounce / Math.abs(pos.y), pos.y > 0 ? Math.PI / 2 : Math.PI * 3 / 2);
                    } else {
                        pos.addBy(new PolarVector(l, pos.x > 0 ? Math.PI : 0));
                        var mag = this.bounce / pos.r;
                        var force = new PolarVector(mag, pos.theta);
                    }
                } else {
                    var l = (this.height - this.width) / 2;
                    if (Math.abs(pos.y) <= l) {
                        if (pos.x === 0) { break; }
                        var force = new PolarVector(this.bounce / Math.abs(pos.x), pos.x > 0 ? Math.PI : 0);
                    } else {
                        pos.addBy(new PolarVector(l, pos.y > 0 ? Math.PI * 3 / 2 : Math.PI / 2));
                        var mag = this.bounce / pos.r;
                        var force = new PolarVector(mag, pos.theta);
                    }
                }
                other.applyForce(force);
                break;
            case "Circle":
                var pos = other.pos.minus(this.pos);
                if (pos.r !== 0) {
                    var mag = this.bounce / Math.abs(pos.r);
                    var force = new PolarVector(mag, pos.theta);
                    other.applyForce(force);
                }
                break;
            case "Donut":
                var pos = other.pos.minus(this.pos);
                var centerR = (this.innerR + this.outerR) / 2;
                if (pos.r !== centerR) {
                    var mag = this.bounce / Math.abs(pos.r - centerR);
                    var force = new PolarVector(Math.sign(pos.r - centerR) * mag, pos.theta);
                    other.applyForce(force);
                }
                break;
            case "Tri":
                // TODO
                break;
            case "Hex":
                // TODO
                break;
        }
    }

    collideAfter() { return; }
}