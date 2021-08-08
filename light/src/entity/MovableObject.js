import { GameObject } from "./gameObject.js";
import { ObjectSystem } from "../system/objectSystem.js"
import { OrthogonalVector, PolarVector } from "../util/vector.js";
import { Color } from "../util/color.js";
import { Visualizer } from "../system/visualizer.js";
import { InputManager } from "../util/inputManager.js";
import { Polygon } from "../util/polygon.js";

export class MovableObject extends GameObject {
    constructor(x, y, moverID, option) {
        super(x, y);
        this.input = option.input || new InputManager();
        this.moverID = moverID;
        this.type.push("MovableObject");
        this.color = option.color || Color.Gray;

        // Kinematics
        this.mass = option.mass || 1;
        this.friction = option.friction || 0.001;
        this.movingForceMag = option.movingForceMag || 1000;

        // External Input
        this.movingKey = option.movingKey || {
            "KeyW": { x: 0, y: -1 },
            "KeyA": { x: -1, y: 0 },
            "KeyS": { x: 0, y: 1 },
            "KeyD": { x: 1, y: 0 }
        }

        this.visibleRange = option.visibleRange || 500;
        this.visibleArea = new Polygon();
        this.visibleEdges = [];
        this.input.activate();
    }

    move() {
        var direction = new OrthogonalVector();
        for (const [keyName, value] of Object.entries(this.movingKey)) {
            if (this.input.keyboard.isPressed(keyName)) {
                direction.addBy(new OrthogonalVector(value.x, value.y));
            }
        }
        if (direction.r !== 0) {
            this.applyForce(new PolarVector(this.movingForceMag, direction.theta));
        }
    }

    update(dt, turn) {
        this.move();
        super.update(dt);

        var collidedObj = [];
        ObjectSystem.find("GameObject").forEach(obj => {
            if (!obj.passable && this.isCollidedWith(obj)) {
                obj.collide(this, dt);
                collidedObj.push(obj);
            }
        });
        collidedObj.forEach(obj => { obj.collideAfter(this); });
        this.velocity.multiplyBy(Math.pow(this.friction, dt));
    }

    draw() {
        Visualizer.addFunc("mover", function(layer, obj) { this.drawObject(layer, obj); }, [this]);
        Visualizer.addFunc("visibleArea", function(layer, obj) { this.drawvisibleArea(layer, obj); }, [this]);
        Visualizer.addFunc("panel", function(layer, obj) { this.drawVisibleEdge(layer, obj); }, [this]);
    }
}