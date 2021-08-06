import { ObjectSystem } from "../../system/objectSystem.js";
import { Visualizer } from "../../system/visualizer.js";
import { Color } from "../../util/color.js";
import { OrthogonalVector, PolarVector } from "../../util/vector.js";
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

export class Particle extends MovingBackground {
    constructor(x, y, group) {
        var bounce = 1000;
        super(x, y, bounce);
        this.group = group;
        this.type.push("Particle");

        this.friction = 0.1;
        this.movable = true;
        this.opaque = false;
        var colorList = { 1: Color.Red, 2: Color.Yellow, 3: Color.Green };
        this.color = colorList[group];
        console.log(this.color);
    }

    update(dt) {
        ObjectSystem.find("Particle").forEach(obj => {
            if (this !== obj) {
                switch (this.group) {
                    case 1:
                        switch (obj.group) {
                            case 1:
                                var pos = obj.pos.minus(this.pos);
                                var mag = -1000 / (pos.r + 1) ** 2;
                                var force = new PolarVector(mag, pos.theta);
                                this.applyForce(force);
                                break;
                            case 2:
                                var pos = obj.pos.minus(this.pos);
                                var mag = 10 * pos.r;
                                var force = new PolarVector(mag, pos.theta);
                                this.applyForce(force);
                                break;
                            case 3:
                                var pos = obj.pos.minus(this.pos);
                                var mag = 100 / (pos.r + 1);
                                var force = new PolarVector(mag, pos.theta);
                                this.applyForce(force);
                                break;
                        }
                        break;
                    case 2:
                        switch (obj.group) {
                            case 1:
                                break;
                            case 2:
                                var pos = obj.pos.minus(this.pos);
                                var mag = 100 / (pos.r + 1) ** 2;
                                var force = new PolarVector(mag, pos.theta);
                                this.applyForce(force);
                                break;
                            case 3:
                                break;
                        }
                        break;
                    case 3:
                        switch (obj.group) {
                            case 1:
                                var pos = obj.pos.minus(this.pos);
                                var mag = Math.max(10,5 * pos.r);
                                var force = new PolarVector(mag, pos.theta);
                                this.applyForce(force);
                                break;
                            case 2:
                                var pos = obj.pos.minus(this.pos);
                                var mag = Math.min(-19, -3 * (pos.r + 1));
                                var force = new PolarVector(mag, pos.theta);
                                this.applyForce(force);
                                break;
                            case 3:
                                break;
                        }
                        break;
                }
            }
        });
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
}