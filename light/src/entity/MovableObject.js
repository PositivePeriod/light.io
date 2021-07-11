import { GameObject } from "./gameObject.js";
import { OrthogonalVector, PolarVector } from "../util/vector.js";

export class MovableObject extends GameObject {
    constructor(x, y, keyboard, mouse) {
        super(x, y);
        this.type.push("MovableObject");
        this.color = "#000000";

        // Kinematics
        this.mass = 1;
        this.friction = 1e-2;
        this.movingForceMag = 400;

        // External Input
        this.movingKey = {
            "KeyW": { x: 0, y: -1 },
            "KeyA": { x: -1, y: 0 },
            "KeyS": { x: 0, y: 1 },
            "KeyD": { x: 1, y: 0 }
        }

        this.keyboard = keyboard;
        this.mouse = mouse;
        this.activate();
    }

    activate() {
        this.keyboard.activate();
        this.mouse.activate();
    }

    move() {
        var direction = new OrthogonalVector();
        for (const [keyName, value] of Object.entries(this.movingKey)) {
            if (this.keyboard.isPressed(keyName)) {
                direction.addBy(new OrthogonalVector(value.x, value.y));
            }
        }
        if (direction.r !== 0) {
            this.applyForce(new PolarVector(this.movingForceMag, direction.theta));
        }
    }

    update(dt) {
        this.move();
        super.update(dt);

        var collidedObj = [];
        GameObject.system.find("MapObject").forEach(obj => {
            if (!obj.passable && this.isCollidedWith(obj)) {
                obj.collide(this, dt);
                collidedObj.push(obj);
            }
        });
        collidedObj.forEach(obj => { obj.collideAfter(this); });

        this.velocity.multiplyBy(Math.pow(this.friction, dt));
    }
}