export class Line {
    constructor(p1, p2) {
        this.p1 = p1.copy();
        this.p2 = p2.copy();
        this.p1.segment = this;
        this.p2.segment = this;
    }

    setCenter(center) {
        // p1 : start, p2 : end
        var centeredP1 = this.p1.minus(center);
        var centeredP2 = this.p2.minus(center);
        this.p1.centeredTheta = centeredP1.theta;
        this.p2.centeredTheta = centeredP2.theta;
        var dAngle = this.p2.centeredTheta - this.p1.centeredTheta;
        if (dAngle <= -Math.PI) { dAngle += 2 * Math.PI; }
        if (dAngle > Math.PI) { dAngle -= 2 * Math.PI; }
        this.p1.beginSegment = dAngle > 0;
        this.p2.beginSegment = dAngle <= 0;
    }

    static linePointDistance(line, point) {
        var l1 = line.p1.toOrthogonal();
        var l2 = line.p2.toOrthogonal();
        var p = point.toOrthogonal();
        var l = l1.minus(l2);
        var d = l1.minus(p);
        return d.scalarProjectTo(l.normal())
    }

    static lineSegmentPointDistance(line, point) {
        var l1 = line.p1.toOrthogonal();
        var l2 = line.p2.toOrthogonal();
        var p = point.toOrthogonal();
        var l = l1.minus(l2);
        var d = l1.minus(p);
        return 0 <= d.scalarProjectTo(l) < l.r ? d.scalarProjectTo(l.normal()) : Math.min(l1.minus(p).r, l2.minus(p).r)
    }

    intesectAt(other) {
        const s = ((other.p2.x - other.p1.x) * (this.p1.y - other.p1.y) - (other.p2.y - other.p1.y) * (this.p1.x - other.p1.x)) /
            ((other.p2.y - other.p1.y) * (this.p2.x - this.p1.x) - (other.p2.x - other.p1.x) * (this.p2.y - this.p1.y));

        return new OrthogonalVector(this.p1.x + s * (this.p2.x - this.p1.x), this.p1.y + s * (this.p2.y - this.p1.y));
    }

    lefterThan(point) {
        // segment exists lefter than poiint
        var l = this.p2.minus(this.p1);
        var d = point.toOrthogonal().minus(this.p1);
        return d.inner(l.normal()) > 0
    }
}


class Vector {
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
        // return new PolarVector(this.r, this.theta + Math.PI / 2 * (CCW ? 1 : -1)) // TODO inefficient
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

    static interpolate(v1, v2, t) {
        return new OrthogonalVector(v1.x * (1 - t) + v2.x * t, v1.y * (1 - t) + v2.y * t)
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
        this.theta %= 2 * Math.PI
    }

    checkZero() {
        if (this.r < PolarVector.rLimit) {
            this.r = 0
        }
    }

    toOrthogonal() {
        return new OrthogonalVector(this.x, this.y);
    }

    toPolar() {
        return this;
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

    toOrthogonal() {
        return this;
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

export function getTrianglePoints(origin, angle1, angle2, segment) {
    var rad = 1e6; // Should be Infinity
    var p1 = origin.add(new PolarVector(1, angle1));
    var p2 = origin.add(new PolarVector(1, angle2));
    var p3 = segment ? segment.p1 : origin.add(new PolarVector(rad, angle1));
    var p4 = segment ? segment.p2 : origin.add(new PolarVector(rad, angle2));

    var l1 = new Line(origin, p1);
    var l2 = new Line(origin, p2);
    var l = new Line(p3, p4);

    return [l.intesectAt(l1), l.intesectAt(l2)]
}

export function segmentInFrontOf(s1, s2, relativePoint) {
    const A1 = s1.lefterThan(Vector.interpolate(s2.p1, s2.p2, 0.01));
    const A2 = s1.lefterThan(Vector.interpolate(s2.p2, s2.p1, 0.01));
    const A3 = s1.lefterThan(relativePoint);

    const B1 = s2.lefterThan(Vector.interpolate(s1.p1, s1.p2, 0.01));
    const B2 = s2.lefterThan(Vector.interpolate(s1.p2, s1.p1, 0.01));
    const B3 = s2.lefterThan(relativePoint);

    if (B1 === B2 && B2 !== B3) return true;
    if (A1 === A2 && A2 === A3) return true;
    if (A1 === A2 && A2 !== A3) return false;
    if (B1 === B2 && B2 === B3) return false;
    return false;
};

export function pointIsInPoly(p, polygon) {
    // https://stackoverflow.com/a/17490923/14251702
    var isInside = false;
    var minX = polygon[0].x,
        maxX = polygon[0].x;
    var minY = polygon[0].y,
        maxY = polygon[0].y;
    for (var n = 1; n < polygon.length; n++) {
        var q = polygon[n];
        minX = Math.min(q.x, minX);
        maxX = Math.max(q.x, maxX);
        minY = Math.min(q.y, minY);
        maxY = Math.max(q.y, maxY);
    }

    if (p.x < minX || p.x > maxX || p.y < minY || p.y > maxY) {
        return false;
    }
    var i = 0,
        j = polygon.length - 1;
    for (i, j; i < polygon.length; j = i++) {
        if ((polygon[i].y > p.y) != (polygon[j].y > p.y) &&
            p.x < (polygon[j].x - polygon[i].x) * (p.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x) {
            isInside = !isInside;
        }
    }
    return isInside;
}

export function pointIsInPoly2(p, polygon) {
    var i = 0;
    var j = 0;
    var isIncluded = false;
    for (i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        if (((polygon[i].y > p.y) != (polygon[j].y > p.y)) &&
            (p.x < (polygon[j].x - polygon[i].x) * (p.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x))
            isIncluded = !isIncluded;
    }
    return isIncluded;
}