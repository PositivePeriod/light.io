import { PolarVector } from "../util/vector.js";
import { GameObject } from "./gameObject.js";
import { ObjectSystem } from "./system/objectSystem.js"

export class ProjectileObject extends GameObject {
    constructor(x, y, velocity, option) {
        super(x, y);
        this.type.push("ProjectileObject");
        this.velocity = velocity.toOrthogonal();
        this.option = option || { range: 1, damage: 1, force: 1 };
        this.makeShape("Circle", { "rad": this.option.rad });
    }

    update(dt, others, visualizer) {
        super.update(dt);
        for (let i = 0; i < others.length; i++) {
            if (!others[i].passable && this.isCollidedWith(others[i])) {
                this.burst(visualizer);
                break;
            }
        }
    }

    burst(visualizer) {
        ObjectSystem.find("MovableObject").forEach(player => {
            var pos = player.pos.minus(this.pos);
            if (pos.r < this.option.range) {
                player.shield -= this.option.damage * (1 - pos.r / this.option.range);
                var force = new PolarVector(this.option.force / pos.r, pos.theta); // TODO 0에 수렴
                player.applyForce(force);
            }
        })
        // visualizer.drawCircle(this.pos.x, this.pos.y, this.option.range, this.color);
        ObjectSystem.remove(this);
    }
}