export class Vector {
    static rLimit = 1e-12;

    constructor() {}

    inner(other) {
        return this.x * other.x + this.y * other.y;
    }

    scalarProjectTo(other) {
        return (this.x * other.x + this.y * other.y) / other.r;
    }

    vectorProjectTo(other) {
        return other.multiply((this.x * other.x + this.y * other.y) / other.r2);
    }

    normal(CCW = true) {
        if (CCW) {
            return new OrthogonalVector(this.y, -this.x)
        } else {
            return new OrthogonalVector(-this.y, this.x)
        }
    }

    copy() {
        if (this instanceof OrthogonalVector) {
            return new OrthogonalVector(this.x, this.y)
        } else {
            return new PolarVector(this.r, this.theta)
        }
    }

    same(other) {
        return this.minus(other).r < Vector.rLimit
    }

    interpolate(other, t) {
        // this : other = t : 1-t
        return new OrthogonalVector(this.x * (1 - t) + other.x * t, this.y * (1 - t) + other.y * t)
    }

}

export class PolarVector extends Vector {
    constructor(r, theta) {
        super();
        this.r = r || 0;
        this.theta = theta || 0;
        this.checkRange();
        this.checkZero();
    }

    represent() {
        return { "r": this.r, "theta": this.theta }
    }

    get r2() {
        return this.r ** 2;
    }

    get x() {
        return this.r * Math.cos(this.theta);
    }

    get y() {
        return this.r * Math.sin(this.theta);
    }

    checkRange() {
        if (this.r < 0) {
            this.r *= -1;
            this.theta += Math.PI;
        }
        this.theta %= 2 * Math.PI;
    }

    checkZero() {
        if (this.r < PolarVector.rLimit) {
            this.r = 0
        }
    }

    toOrthogonal() {
        return new OrthogonalVector(this.x, this.y);
    }

    toPolar(copy = false) {
        return copy ? new PolarVector(this.r, this.theta) : this;
    }

    rotate(angle) {
        return new PolarVector(this.r, this.theta + angle);
    }

    rotateBy(angle) {
        this.theta += angle;
        this.checkRange();
    }

    multiply(scalar) {
        return new PolarVector(this.r * scalar, this.theta);
    }

    multiplyBy(scalar) {
        this.r *= scalar;
        this.checkZero();
    }

    negaitve() {
        return new PolarVector(-this.r, this.theta);
    }

    normalize() {
        this.r = (this.r === 0) ? 0 : 1;
    }
}

export class OrthogonalVector extends Vector {
    constructor(x, y) {
        super();
        this.x = x || 0;
        this.y = y || 0;
        this.checkZero();
    }

    represent() {
        return { "x": this.x, "y": this.y }
    }

    get r() {
        return (this.x ** 2 + this.y ** 2) ** 0.5;
    }

    get r2() {
        return this.x ** 2 + this.y ** 2;
    }

    get theta() {
        return Math.atan2(this.y, this.x);
    }

    checkZero() {
        if (Math.abs(this.r) < OrthogonalVector.rLimit) {
            this.x = 0;
            this.y = 0;
        }
    }

    toPolar() {
        return new PolarVector(this.r, this.theta);
    }

    toOrthogonal(copy = false) {
        return copy ? new OrthogonalVector(this.x, this.y) : this;
    }

    add(other) {
        return new OrthogonalVector(this.x + other.x, this.y + other.y);
    }

    addBy(other) {
        this.x += other.x;
        this.y += other.y;
        this.checkZero();
    }

    minus(other) {
        return new OrthogonalVector(this.x - other.x, this.y - other.y);
    }

    minusBy(other) {
        this.x -= other.x;
        this.y -= other.y;
        this.checkZero();
    }

    negative() {
        return new OrthogonalVector(-this.x, -this.y);
    }

    multiply(scalar) {
        return new OrthogonalVector(this.x * scalar, this.y * scalar);
    }

    multiplyBy(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.checkZero();
    }
}

export function angleIsBetween(CCW, angle, CW) {
    return (CCW < angle && angle < CW) || (angle < CW && CW < CCW) || (CW < CCW && CCW < angle)
}