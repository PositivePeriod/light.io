export class RigidWall {
    constructor(p1, p2, accuracy) {
        super(x, y);
        this.accuracy = accuracy || 10;
    }

    collide(other, dt) {
        var dPos = other.velocity.multiply(dt);
        var counter = 0;
        while (this.isCollidedWith(other)) {
            if (counter++ > 1e4) {
                console.error("Infinite collision detection; check init collision between bodies");
                return;
            }
            other.pos.minusBy(dPos);
        }
        for (let i = 0; i < this.accuracy; i++) {
            dPos.multiplyBy(1 / 2);
            var counter = 0;
            while (!this.isCollidedWith(other)) {
                if (counter++ > 1e4) {
                    console.error("Infinite collision detection; check init collision between bodies");
                    return;
                }
                other.pos.addBy(dPos);
            }
            other.pos.minusBy(dPos);
        }
    }
}

export class GameObj {
    constructor() {
        this.visual = null;
        this.light = null;
        this.physicalWall = null;
        this.opticalWall = null;
    }
}