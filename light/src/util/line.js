import { OrthogonalVector, PolarVector } from "./vector.js";

export class Line {
    constructor(p1, p2, infinite = true) {
        this.p1 = p1.toOrthogonal(true);
        this.p2 = p2.toOrthogonal(true);
        this.center = new OrthogonalVector((this.p1.x + this.p2.x) / 2, (this.p1.y + this.p2.y) / 2);
        this.infinite = infinite;

        this.p1.line = this;
        this.p2.line = this;

        this.vector = this.p2.minus(this.p1);
    }

    perpendicularToPoint(point) {
        var p = point.toOrthogonal();
        var d = p.minus(this.p1);
        var perpendicular = d.vectorProjectTo(this.vector).add(this.p1);
        return perpendicular
    }

    distanceToPoint(point) {
        var p = point.toOrthogonal();
        var d = p.minus(this.p1);
        var d1 = d.scalarProjectTo(this.vector);
        var d2 = d.scalarProjectTo(this.vector.normal());
        if (this.infinite) { return Math.abs(d2) } else { return (d1 < 0 || this.vector.r < d1) ? Math.min(d.r, p.minus(this.p2).r) : Math.abs(d2) }
    }

    intersectWith(other, mustInfinite = false, strict = false, log=false) {
        // https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
        if (this.vector.parallel(other.vector)) {
            var v = other.p1.minus(this.p1);
            if (v.r < 1e-6) { return true }
            if (this.vector.parallel(v)) {
                // common line
                var existInfinite = mustInfinite || this.infinite || other.infinite;
                if (existInfinite) {
                    return true
                } // Infinite many intersection
                var projection = v.scalarProjectTo(this.vector);
                var isSameDir = other.vector.scalarProjectTo(this.vector) > 0;
                if (log) {console.log('intersectWith', projection, isSameDir);                }
                if (isSameDir) {
                    return -other.vector.r < projection && projection < this.vector.r ? true : null
                } else {
                    return 0 < projection && projection < this.vector.r + other.vector.r ? true : null
                }
            }
            return null
        } else {
            var p1 = this.p1;
            var p2 = this.p2;
            var p3 = other.p1;
            var p4 = other.p2;
            const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / ((p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x));
            const u = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / ((p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x));
            if (!(mustInfinite || this.infinite) && !(0 <= t && t <= 1)) { return null }
            if (!(mustInfinite || other.infinite) && !(0 <= u && u <= 1)) { return null }
            if (strict && (!(0 < t && t < 1) || !(0 < t && t < 1))) { return null }
            var p = p1.interpolate(p2, t);
            return p
        }
    }

    same(other) {
        return (this.p1.same(other.p1) && this.p2.same(other.p2)) || (this.p1.same(other.p2) && this.p2.same(other.p1))
    }
}

export class ShadowLine extends Line {
    static typeList = ['line', 'arc'];

    constructor(p1, p2, type, param) {
        if (!ShadowLine.typeList.includes(type)) { console.error('Unknown Type for ShadowLine', type); }

        super(p1, p2, false);
        this.type = type;
        this.param = param || {};
    }

    getPath() {
        var path = new Path2D();
        switch (this.type) {
            case "line":
                path.moveTo(this.p1.x, this.p1.y);
                path.lineTo(this.p2.x, this.p2.y);
                break;
            case "arc":
                path.arc(this.param.pos.x, this.param.pos.y, this.param.rad, this.param.startAngle, this.param.endAngle);
                break;
        }
        return path
    }
}

// https://mathworld.wolfram.com/Circle-LineIntersection.html
export function CircleLineIntersection(circle, line) {
    var p1 = line.p1.minus(circle.pos);
    var p2 = p1.add(new PolarVector(1, line.vector.theta));

    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    var D = p1.x * p2.y - p2.x * p1.y;
    var discriminant = circle.rad ** 2 * (dx ** 2 + dy ** 2) - D ** 2;
    if (Math.abs(discriminant) < 1e-6) { discriminant = 0; }
    var sgn = dy < 0 ? -1 : 1;
    switch (Math.sign(discriminant)) {
        case 1:
            var x1 = (D * dy + sgn * dx * discriminant ** 0.5) / (dx ** 2 + dy ** 2);
            var y1 = (-D * dx + Math.abs(dy) * discriminant ** 0.5) / (dx ** 2 + dy ** 2);
            var x2 = (D * dy - sgn * dx * discriminant ** 0.5) / (dx ** 2 + dy ** 2);
            var y2 = (-D * dx - Math.abs(dy) * discriminant ** 0.5) / (dx ** 2 + dy ** 2);
            return [new OrthogonalVector(x1, y1).add(circle.pos), new OrthogonalVector(x2, y2).add(circle.pos)]
        case -1:
            console.log('dis', circle.rad, dx ** 2 + dy ** 2, D, discriminant);
            return []
        default: // 0
            var x = (D * dy) / (dx ** 2 + dy ** 2);
            var y = (-D * dx) / (dx ** 2 + dy ** 2);
            return [new OrthogonalVector(x, y).add(circle.pos)]
    }
}