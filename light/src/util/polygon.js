import { Line, ShadowLine } from "./line.js";

export class Polygon {
    constructor(vertices) {
        this.vertices = vertices || [];
        this.n = this.vertices.length;
        this.initEdge();
    }

    initEdge() {
        this.edges = []
        if (this.n > 0) {
            for (let i = 0; i < this.n - 1; i++) {
                var p1 = this.vertices[i];
                var p2 = this.vertices[i + 1];
                this.edges.push(new Line(p1, p2, false));
            }
            this.edges.push(new Line(this.vertices[this.n - 1], this.vertices[0], false));
        }
    }

    includePoint(point) {
        // https://stackoverflow.com/a/17490923/14251702
        if (this.n > 8) { // require sufficiently big enough number
            var minX = this.vertices[0].x;
            var maxX = this.vertices[0].x;
            var minY = this.vertices[0].y;
            var maxY = this.vertices[0].y;
            this.vertices.forEach(v => {
                minX = Math.min(v.x, minX);
                maxX = Math.max(v.x, maxX);
                minY = Math.min(v.y, minY);
                maxY = Math.max(v.y, maxY);
            })
            if (point.x < minX || maxX < point.x || point.y < minY || maxY < point.y) { return false; }
        }

        var isIncluded = false;
        var i = 0;
        var j = this.n - 1;
        for (i, j; i < this.n; j = i++) {
            var vi = this.vertices[i];
            var vj = this.vertices[j];
            if ((vi.y > point.y) !== (vj.y > point.y) && point.x < (vj.x - vi.x) * (point.y - vi.y) / (vj.y - vi.y) + vi.x) {
                isIncluded = !isIncluded;
            }
        }
        return isIncluded;
    }

    intersectWith(other, strict = false) {
        if (strict) {
            return this.edges.some(e1 => other.edges.some(e2 => e1.intersectWith(e2, false) === true));
        } else {
            return this.edges.some(e1 => other.edges.some(e2 => e1.intersectWith(e2, false) !== null));
        }
    }

    intersectWithCircle(circle) {
        return this.edges.some(e => e.distanceToPoint(circle.pos) < circle.rad);
    }
}

export class ShadowPolygon extends Polygon {
    constructor(vertices) {
        super(vertices);
    }

    initEdge() {
        this.edges = []
        if (this.n > 0) {
            for (let i = 0; i < this.n - 1; i++) {
                var p1 = this.vertices[i];
                var p2 = this.vertices[i + 1];
                this.edges.push(new ShadowLine(p1, p2, 'line'));
            }
            this.edges.push(new ShadowLine(this.vertices[this.n - 1], this.vertices[0], 'line'));
        }
    }
}