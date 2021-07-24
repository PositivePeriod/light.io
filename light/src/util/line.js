import { OrthogonalVector, PolarVector } from "./vector.js";

export class Line {
    constructor(p1, p2, infinite=true) {
        this.p1 = p1.toOrthogonal().copy();
        this.p2 = p2.toOrthogonal().copy();
        this.center = new OrthogonalVector((this.p1.x + this.p2.x) / 2, (this.p1.y + this.p2.y) / 2);
        this.infinite = infinite;

        this.p1.line = this;
        this.p2.line = this;

        this.vector = this.p2.minus(this.p1);
    }

    represent() {
        return { "p1": this.p1.represent(), "p2": this.p2.represent() }
    }

    toInfinite() { this.infinite = true; return this }
    toFinite() { this.infinite = false; return this }

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
        if (this.infinite) { return d2 } else { return (d1 < 0 || this.vector.r < d1) ? Math.min(d.r, p.minus(this.p2).r) : d2 }
    }

    intersectWith(other, infinite = false) {
        // https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
        if (this.vector.parallel(other.vector)) {
            var v = this.p1.minus(other.p1);
            if (this.vector.parallel(v)) {
                // common line
                var existInfinite = infinite || this.infinite || other.infinite;
                var projection = v.scalarProjectTo(this.vector);
                if (existInfinite || -other.vector.r <= projection || projection < this.vector.r) { console.error('Infinite intersection'); return 'infinite' }
            }
            return null
        }
        var p1 = this.p1;
        var p2 = this.p2;
        var p3 = other.p1;
        var p4 = other.p2;
        const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / ((p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x));
        const u = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / ((p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x));
        if (!(infinite || this.infinite) && !(0 <= t && t <= 1)) { return null }
        if (!(infinite || other.infinite) && !(0 <= u && u <= 1)) { return null }
        var p = p1.interpolate(p2, t);
        return p
    }

    same(other) {
        return (this.p1.same(other.p1) && this.p2.same(other.p2)) || (this.p1.same(other.p2) && this.p2.same(other.p1))
    }

    isCCWThan(point) {
        // segment exists lefter than point
        return this.p2.minus(point).inner(this.vector.normal()) < 0
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
        // - 2 * Math. PI < dAngle < 2 * Math.PI
        if (dAngle <= -Math.PI) { dAngle += 2 * Math.PI; }
        if (dAngle > Math.PI) { dAngle -= 2 * Math.PI; }
        // - Math.PI < dAngle <= Math.PI
        this.p1.setProp(mover, "beginLine", dAngle > 0);
        this.p2.setProp(mover, "beginLine", dAngle <= 0);
    }

    draw(layer, mover, visualizer, color) {
        if (this.obj === undefined) {
            var v1 = this.getProp(mover, "v1");
            var v2 = this.getProp(mover, "v2");
            layer.ctx.save();
            layer.ctx.strokeStyle = color || mover.color.HEX();
            layer.ctx.lineWidth = 2;
            layer.ctx.beginPath();
            layer.ctx.moveTo(v1.x, v1.y);
            layer.ctx.lineTo(v2.x, v2.y);
            layer.ctx.closePath();
            layer.ctx.stroke();
            layer.ctx.restore();
        } else {
            // Visualizer.drawCircle(Visualizer.findLayer("static"), { "pos": this.getProp(mover, "v1"), "rad": 1, });
            // Visualizer.drawCircle(Visualizer.findLayer("static"), { "pos": this.getProp(mover, "v2"), "rad": 1, });

            var v1 = this.getProp(mover, "v1").toOrthogonal();
            var l1 = v1.minus(mover.pos);
            var l2 = v1.minus(this.obj.pos);
            var p1 = l2.minus(new PolarVector((this.obj.rad ** 2 - l2.r2) ** 0.5, l1.theta));

            var v2 = this.getProp(mover, "v2").toOrthogonal();
            var l1 = v2.minus(mover.pos);
            var l2 = v2.minus(this.obj.pos);
            var p2 = l2.minus(new PolarVector((this.obj.rad ** 2 - l2.r2) ** 0.5, l1.theta));


            var pseudoObject = {
                "pos": this.obj.pos,
                "rad": this.obj.rad,
                "CCWAngle": p1.theta,
                "CWAngle": p2.theta,
                "color": mover.color
            };
            visualizer.drawArc(layer, pseudoObject);
        }
    }

    setVisibleRange(mover, angle1, angle2) {
        var p1 = mover.pos.add(new PolarVector(1, angle1));
        var p2 = mover.pos.add(new PolarVector(1, angle2));
        var l1 = new Line(mover.pos, p1);
        var l2 = new Line(mover.pos, p2);
        var v1 = this.intersectWith(l1, true);
        var v2 = this.intersectWith(l2, true);
        v1.line = this;
        v2.line = this;
        this.setProp(mover, "v1", v1);
        this.setProp(mover, "v2", v2);
    }
}

export function segmentInFrontOf(s1, s2, relativePoint) {
    // TODO hardcoding what about?
    var limit = 1e-6;
    const A1 = s1.isCCWThan(s2.p1.interpolate(s2.p2, limit));
    const A2 = s1.isCCWThan(s2.p2.interpolate(s2.p1, limit));
    const A3 = s1.isCCWThan(relativePoint);

    const B1 = s2.isCCWThan(s1.p1.interpolate(s1.p2, limit));
    const B2 = s2.isCCWThan(s1.p2.interpolate(s1.p1, limit));
    const B3 = s2.isCCWThan(relativePoint);
    if (B1 === B2 && B2 !== B3) return true;
    if (A1 === A2 && A2 === A3) return true;
    if (A1 === A2 && A2 !== A3) return false;
    if (B1 === B2 && B2 === B3) return false;

    console.error('segmentInFrontof');

    return false;
};