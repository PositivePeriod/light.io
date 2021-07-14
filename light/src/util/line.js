import { OrthogonalVector, PolarVector } from "./vector.js";

export class Line {
    constructor(p1, p2) {
        this.p1 = p1.toOrthogonal().copy();
        this.p2 = p2.toOrthogonal().copy();

        this.p1.line = this;
        this.p2.line = this;
    }

    distanceToPoint(point, segment = false) {
        var p = point.toOrthogonal();
        var l = this.p1.minus(this.p2);
        var d = this.p2.minus(p);
        if (segment) {
            return 0 <= d.scalarProjectTo(l) < l.r ? d.scalarProjectTo(l.normal()) : Math.min(d.r, this.p2.minus(p).r)
        } else {
            return d.scalarProjectTo(l.normal())
        }
    }

    intesectWith(other) {
        const s = ((other.p2.x - other.p1.x) * (this.p1.y - other.p1.y) - (other.p2.y - other.p1.y) * (this.p1.x - other.p1.x)) /
            ((other.p2.y - other.p1.y) * (this.p2.x - this.p1.x) - (other.p2.x - other.p1.x) * (this.p2.y - this.p1.y));

        return new OrthogonalVector((1 - s) * this.p1.x + s * this.p2.x, (1 - s) * this.p1.y + s * this.p2.y);
    }

    CWThan(point) {
        // segment exists righter than point
        var l = this.p2.minus(this.p1);
        var d = point.toOrthogonal().minus(this.p1);
        return d.inner(l.normal()) > 0
    }
}

export class VisibilityLine extends Line {
    constructor(p1, p2) {
        super(p1, p2);
    }

    setCenter(center) {
        var centeredP1 = this.p1.minus(center);
        var centeredP2 = this.p2.minus(center);
        this.p1.centeredTheta = centeredP1.theta;
        this.p2.centeredTheta = centeredP2.theta;
        var dAngle = this.p2.centeredTheta - this.p1.centeredTheta;
        if (dAngle <= -Math.PI) { dAngle += 2 * Math.PI; }
        if (dAngle > Math.PI) { dAngle -= 2 * Math.PI; }
        this.p1.beginLine = dAngle > 0;
        this.p2.beginLine = dAngle <= 0;
    }

    getTriPoints(origin, angle1, angle2) {
        // var rad = 1e6; // Should be Infinity
        // origin.add(new PolarVector(rad, angle1));
        // origin.add(new PolarVector(rad, angle2));
        var p1 = origin.add(new PolarVector(1, angle1));
        var p2 = origin.add(new PolarVector(1, angle2));
        var l1 = new VisibilityLine(origin, p1);
        var l2 = new VisibilityLine(origin, p2);
        var l = new VisibilityLine(this.p1, this.p2);
        return [l.intesectWith(l1), l.intesectWith(l2)]
    }
}

export function segmentInFrontOf(s1, s2, relativePoint) {
    const A1 = s1.CWThan(s2.p1.interpolate(s2.p2, 0.01));
    const A2 = s1.CWThan(s2.p2.interpolate(s2.p1, 0.01));
    const A3 = s1.CWThan(relativePoint);

    const B1 = s2.CWThan(s1.p1.interpolate(s1.p2, 0.01));
    const B2 = s2.CWThan(s1.p2.interpolate(s1.p1, 0.01));
    const B3 = s2.CWThan(relativePoint);

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