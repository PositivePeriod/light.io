import { Polygon } from "../util/polygon.js";

export class PhysicalObject {
    constructor(obj, option) {
        this.obj = obj;

        this.mass = option.mass || 1;
        this.velocity = option.velocity || new OrthogonalVector();
        this.pos = option.pos || new OrthogonalVector();
        this.friction = option.friction || 1; // 0.001

        this.staticWalls = option.staticWalls || []
        this.dynamicWalls = option.dynamicWalls || [];

        this.force = new OrthogonalVector();
        this.movable = true;
    }

    get physicalWalls(point) {
        return this.passable ? [] : [...this.staticWalls, ...this.dynamicWalls.map(func => func.bind(this)(point))];
    }

    applyForce(force) {
        if (this.movable) { this.force.addBy(force.toOrthogonal()); }
    }

    update(dt) {
        if (this.movable) {
            var accel = this.force.multiply(1 / this.mass);
            this.velocity.addBy(accel.multiply(dt));
            this.pos.addBy(this.velocity.multiply(dt));
            this.force = new OrthogonalVector();
            this.velocity.multiplyBy(Math.pow(this.friction, dt));
        }
    }

    collision() {
        var collidedObj = [];
        ObjectSystem.find("GameObject").forEach(obj => {
            if (!obj.passable && this.isCollidedWith(obj)) {
                obj.collide(this, dt);
                collidedObj.push(obj);
            }
        });
        collidedObj.forEach(obj => { obj.collideAfter(this); });
    }

    isCollidedWith(other) {
        return Collision.isCollided(this, other);
    }
}

export class InputPhysicalObject extends PhysicalObject {
    constructor(obj, option) {
        super(obj, option);

        this.movingForceMag = option.movingForceMag || 1000;
        this.input = option.input || new InputManager();
        this.movingKey = option.movingKey || {
            "KeyW": { x: 0, y: -1 },
            "KeyA": { x: -1, y: 0 },
            "KeyS": { x: 0, y: 1 },
            "KeyD": { x: 1, y: 0 }
        }
    }

    move() {
        // TODO add mouse or joystick for mobile
        var direction = new OrthogonalVector();
        for (const [keyName, value] of Object.entries(this.movingKey)) {
            if (this.input.keyboard.isPressed(keyName)) { direction.addBy(new OrthogonalVector(value.x, value.y)); }
        }
        if (direction.r !== 0) { this.applyForce(new PolarVector(this.movingForceMag, direction.theta)); }
    }

    update(dt) {
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
    }
}

export function InitPhysicalWall(type, param) {
    var staticWalls = [];
    var dynamicWalls = [];
    switch (type) {
        case poly:
            var polygon = param.polygon || new Polygon(); // CW order
            var walls = polygon.edges.map(edge => new LineWall(edge));
            staticWalls.push(...walls);
            break;
        case circle:
            var wall = new CircleWall(param.pos, param.rad);
            staticWalls.push(wall);
            break;

    }
    return { "static": staticWalls, "dynamic": dynamicWalls }
}