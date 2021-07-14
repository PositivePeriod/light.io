import { OrthogonalVector, PolarVector } from "./vector.js";

class Line {
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

export class VisibilitySegment extends Line {
    constructor(p1, p2) {
        super(p1, p2);
        this.prop = new Map();
        this.p1.prop = new Map();
        this.p2.prop = new Map();
        this.p1.setProp = this.setProp.bind(this.p1);
        this.p2.setProp = this.setProp.bind(this.p2);
        this.p1.getProp = this.getProp.bind(this.p1);
        this.p2.getProp = this.getProp.bind(this.p2);
    }

    setProp(mover, prop, value) {
        if (!this.prop.has(mover.id)) { this.prop.set(mover.id, {}); }
        this.prop.get(mover.id)[prop] = value;
    }

    getProp(mover, prop) {
        if (!this.prop.has(mover.id)) { this.prop.set(mover.id, {}); }
        return this.prop.get(mover.id)[prop]
    }

    setMover(mover) {
        var cTheta1 = this.p1.minus(mover.pos).theta;
        var cTheta2 = this.p2.minus(mover.pos).theta;
        this.p1.setProp(mover, "cTheta", cTheta1);
        this.p2.setProp(mover, "cTheta", cTheta2);

        var dAngle = cTheta2 - cTheta1;
        if (dAngle <= -Math.PI) { dAngle += 2 * Math.PI; }
        if (dAngle > Math.PI) { dAngle -= 2 * Math.PI; }
        this.p1.setProp(mover, "beginLine", dAngle > 0);
        this.p2.setProp(mover, "beginLine", dAngle <= 0);
    }

    draw(layer, mover, visualizer) {
        if (this.obj === undefined) {
            var v1 = this.getProp(mover, "v1");
            var v2 = this.getProp(mover, "v2");
            layer.ctx.beginPath();
            layer.ctx.moveTo(Math.floor(v1.x), Math.floor(v1.y));
            layer.ctx.lineTo(Math.floor(v2.x), Math.floor(v2.y));
            layer.ctx.closePath();
            layer.ctx.stroke();
        } else {
            var pseudoObject = {
                "pos": this.obj.pos,
                "rad": this.obj.rad,
                "startAngle": this.getProp(mover, "startAngle"),
                "endAngle": this.getProp(mover, "endAngle"),
            };
            visualizer.drawArc(layer, pseudoObject);
        }
    }

    getVisibleLine(mover, angle1, angle2) {
        // var rad = 1e6; // Should be Infinity
        // center.add(new PolarVector(rad, angle1));
        // center.add(new PolarVector(rad, angle2));
        var p1 = mover.pos.add(new PolarVector(1, angle1));
        var p2 = mover.pos.add(new PolarVector(1, angle2));
        var l1 = new VisibilitySegment(mover.pos, p1);
        var l2 = new VisibilitySegment(mover.pos, p2);
        var l = new VisibilitySegment(this.p1, this.p2);
        var v1 = l.intesectWith(l1);
        var v2 = l.intesectWith(l2);
        v1.line = this;
        v2.line = this;
        this.setProp(mover, "v1", v1);
        this.setProp(mover, "v2", v2);
        return [v1, v2]
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