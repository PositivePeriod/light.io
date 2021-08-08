function zeroGuard(num) {
    if (num === 0) {
        console.error('Impossible to divide by 0', num);
        console.trace();
    }
}

export class Vector {
    static rLimit = 1e-6;
    static thetaLimit = 1e-6;
    static limit = 1e-4;

    constructor() {}

    inner(other) {
        return this.x * other.x + this.y * other.y;
    }

    innerAngle(other) {
        zeroGuard(this.r);
        zeroGuard(other.r);
        return Math.acos(this.inner(other) / this.r / other.r)
    }

    scalarProjectTo(other) {
        zeroGuard(other.r);
        return (this.x * other.x + this.y * other.y) / other.r;
    }

    vectorProjectTo(other) {
        zeroGuard(other.r2);
        return other.multiply((this.x * other.x + this.y * other.y) / other.r2);
    }

    normal(CCW = true) {
        if (CCW) {
            return new OrthogonalVector(-this.y, this.x)
        } else {
            return new OrthogonalVector(this.y, -this.x)
        }
    }

    copy() {
        if (this instanceof OrthogonalVector) {
            return new OrthogonalVector(this.x, this.y)
        } else {
            return new PolarVector(this.r, this.theta)
        }
    }

    interpolate(other, t) {
        // this : other = t : 1-t
        return new OrthogonalVector(this.x * (1 - t) + other.x * t, this.y * (1 - t) + other.y * t)
    }

    same(other) { return this.minus(other).r < Vector.rLimit }

    parallel(other) {
        zeroGuard(this.r);
        zeroGuard(other.r);
        return Math.abs((this.x * other.y - this.y * other.x) / this.r / other.r) < Vector.limit
    }

}

export class PolarVector extends Vector {
    constructor(r = 0, theta = 0) {
        super();
        this.r = r;
        this.theta = theta;
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
        if (this.r < PolarVector.rLimit) { this.r = 0 }
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

    negative() {
        return new PolarVector(-this.r, this.theta);
    }

    normalize() {
        this.r = (this.r === 0) ? 0 : 1;
    }
}

export class OrthogonalVector extends Vector {
    constructor(x = 0, y = 0) {
        super();
        this.x = x;
        this.y = y;
        this.checkZero();
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

export class Angle {
    static isBetween(CCW, angle, CW) {
        return (CCW < angle && angle < CW) || (angle < CW && CW < CCW) || (CW < CCW && CCW < angle)
    }
}