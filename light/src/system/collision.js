import { SHAPE } from "../util/constant.js";
import { OrthogonalVector } from "../util/vector.js";

export class Collision {
    constructor() {}

    static isCollided(obj1, obj2) {
        if (SHAPE.has(obj1.shape) && SHAPE.has(obj2.shape)) {
            var notReversed = SHAPE.get(obj1.shape).hierarchy <= SHAPE.get(obj2.shape).hierarchy;
            var functionName = notReversed ? obj1.shape + obj2.shape : obj2.shape + obj1.shape;

            var isRoughCollided = this.roughCollide(obj1, obj2);
            if (!isRoughCollided) { return false }
            if (functionName === "RectRect") { return isRoughCollided }

            return notReversed ? this[functionName](obj1, obj2) : this[functionName](obj2, obj1);
        } else {
            console.error("Impossible object shape; ", obj1.shape, obj2.shape, obj1, obj2);
        }
    }

    static roughCollide(obj1, obj2) { return this.RectRect(obj1, obj2) }


    static RectRect(rect1, rect2) {
        var pos = rect1.pos.minus(rect2.pos);
        var minX = (rect1.width + rect2.width) / 2;
        var minY = (rect1.height + rect2.height) / 2;
        return minX >= Math.abs(pos.x) && minY >= Math.abs(pos.y)
    }

    static RectCircle(rect, circle) {
        var testX = circle.pos.x;
        var testY = circle.pos.y;
        var left = rect.pos.x - rect.width / 2;
        var right = rect.pos.x + rect.width / 2;
        var top = rect.pos.y - rect.height / 2;
        var bottom = rect.pos.y + rect.height / 2;

        if (circle.pos.x < left) { testX = left; } else if (circle.pos.x > right) { testX = right; }
        if (circle.pos.y < top) { testY = top; } else if (circle.pos.y > bottom) { testY = bottom; }
        var distance2 = (circle.pos.x - testX) ** 2 + (circle.pos.y - testY) ** 2;
        return distance2 <= circle.rad ** 2;
    }

    static RectDonut(rect, donut) {
        var pos = rect.pos.minus(donut.pos);
        if (pos.r2 < donut.innerR ** 2) {
            var x = Math.abs(pos.x) + rect.width / 2;
            var y = Math.abs(pos.y) + rect.height / 2;
            var r2 = x ** 2 + y ** 2;
            return r2 >= donut.innerR ** 2;
        } else if (pos.r2 > donut.outerR ** 2) {
            var pseudoCircle = { "pos": donut.pos, "rad": donut.outerR }
            return this.RectCircle(rect, pseudoCircle)
        } else {
            return true
        }
    }

    static CircleCircle(circle1, circle2) {
        var cur2 = (circle1.pos.x - circle2.pos.x) ** 2 + (circle1.pos.y - circle2.pos.y) ** 2;
        var min2 = (circle1.rad + circle2.rad) ** 2
        return min2 >= cur2;
    }

    static CircleDonut(circle, donut) {
        var pos = circle.pos.minus(donut.pos);
        if (pos.r2 < donut.innerR ** 2) {
            return pos.r + circle.rad >= donut.innerR;
        } else if (pos.r2 > donut.outerR ** 2) {
            return pos.r - circle.rad <= donut.outerR;
        } else {
            return true
        }
    }

    static DonutDonut(donut1, donut2) {
        var pos = donut2.pos.minus(donut1.pos);
        if (pos.r > donut1.outerR + donut2.outerR) {
            return false
        } else if (pos.r + donut2.outerR < donut1.innerR || pos.r + donut1.outerR < donut2.innerR) {
            return false
        } else {
            return true
        }
    }
    d

    static RectTri(rect, tri) {
        // Already checked by roughCollide
        // if (!this.RectRect(rect, tri)) {
        //     return false
        // }
        var dir = new OrthogonalVector(tri.dir[0], tri.dir[1]).toPolar();
        dir.rotateBy(Math.PI / 2);
        var normal = new OrthogonalVector(dir.x * tri.width, dir.y * tri.height).toPolar();
        normal.rotateBy(-Math.PI / 2);
        var pos = rect.pos.minus(tri.pos);
        var centerDistance = pos.scalarProjectTo(normal);
        var rectDistance = new OrthogonalVector(tri.dir[0] * rect.width / 2, tri.dir[1] * rect.height / 2).scalarProjectTo(normal);
        return rectDistance >= centerDistance
    }

    static CircleTri(circle, tri) {
        if (!this.RectCircle(tri, circle)) {
            return false
        }
        var pos = circle.pos.minus(tri.pos);
        var dir = new OrthogonalVector(tri.dir[0], tri.dir[1]).toPolar();
        dir.rotateBy(Math.PI / 2);
        var diagonal = new OrthogonalVector(dir.x * tri.width, dir.y * tri.height).toPolar();
        var normal = diagonal.rotate(-Math.PI / 2);
        var diagonalDistance = pos.scalarProjectTo(diagonal);
        var normalDistance = pos.scalarProjectTo(normal);
        // Between false area, so <=, not < is right.
        if (Math.abs(diagonalDistance) <= diagonal.r / 2 && circle.rad < normalDistance) {
            return false
        }
        var verticeDistance1 = pos.add(new OrthogonalVector(-tri.dir[0] * tri.width / 2, tri.dir[1] * tri.height / 2)).r2;
        var verticeDistance2 = pos.add(new OrthogonalVector(tri.dir[0] * tri.width / 2, -tri.dir[1] * tri.height / 2)).r2;
        return !(normalDistance > 0 && Math.abs(diagonalDistance) > diagonal.r / 2 && circle.rad ** 2 < Math.min(verticeDistance1, verticeDistance2))
    }

    static DonutTri(donut, tri) {
        var pos = tri.pos.minus(donut.pos);
        if (pos.r < donut.innerR) {
            var existCollidedVertex = [
                [-1, -1],
                [-1, 1],
                [1, -1]
            ].some(sign => {
                var dPos = new OrthogonalVector(sign[0] * tri.dir[0] * tri.width / 2, sign[1] * tri.dir[1] * tri.height / 2);
                return pos.add(dPos).r >= donut.innerR;
            });
            return existCollidedVertex
        } else if (pos.r > donut.outerR) {
            var pseudoCircle = { "pos": donut.pos, "rad": donut.outerR };
            return this.CircleTri(pseudoCircle, tri)
        } else {
            return true
        }
    }

    static TriTri(tri1, tri2) {
        if (!(this.RectTri(tri1, tri2) && this.RectTri(tri2, tri1))) {
            return false
        }
        if (tri1.dir[0] + tri2.dir[0] === 0 && tri1.dir[1] + tri2.dir[1] === 0) {
            var pos = tri2.pos.minus(tri1.pos);
            var dir = new OrthogonalVector(tri1.dir[0], tri1.dir[1]).toPolar();
            dir.rotateBy(Math.PI / 2);
            var normal = new OrthogonalVector(dir.x * tri1.width, dir.y * tri1.height).toPolar();
            normal.rotateBy(-Math.PI / 2);

            var rectDistance1 = pos.add(new OrthogonalVector(tri2.dir[0] * tri2.width / 2, -tri2.dir[1] * tri2.height / 2)).scalarProjectTo(normal);
            var rectDistance2 = pos.add(new OrthogonalVector(-tri2.dir[0] * tri2.width / 2, tri2.dir[1] * tri2.height / 2)).scalarProjectTo(normal);

            if (0 >= rectDistance1 && 0 >= rectDistance2) { return true }
            if (0 < rectDistance1 && 0 < rectDistance2) { return false }

            var pos = tri1.pos.minus(tri2.pos);
            var dir = new OrthogonalVector(tri2.dir[0], tri2.dir[1]).toPolar();
            dir.rotateBy(Math.PI / 2);
            var normal = new OrthogonalVector(dir.x * tri2.width, dir.y * tri2.height).toPolar();
            normal.rotateBy(-Math.PI / 2);
            var rectDistance3 = pos.add(new OrthogonalVector(tri1.dir[0] * tri1.width / 2, -tri1.dir[1] * tri1.height / 2)).scalarProjectTo(normal);
            var rectDistance4 = pos.add(new OrthogonalVector(-tri1.dir[0] * tri1.width / 2, tri1.dir[1] * tri1.height / 2)).scalarProjectTo(normal);

            return 0 >= rectDistance3 || 0 >= rectDistance4
        } else {
            return true
        }
    }

    static RectHex(rect, hex) {
        return hex.pseudoObjects.some(object => {
            return this.isCollided(rect, object)
        })
    }

    static CircleHex(circle, hex) {
        return hex.pseudoObjects.some(object => {
            return this.isCollided(circle, object)
        })
    }

    static DonutHex(donut, hex) {
        return hex.pseudoObjects.some(object => {
            return this.isCollided(donut, object)
        })
    }

    static TriHex(tri, hex) {
        return hex.pseudoObjects.some(object => {
            return this.isCollided(tri, object)
        })
    }

    static HexHex(hex1, hex2) {
        return hex1.pseudoObjects.some(object => {
            return this.isCollided(hex2, object)
        })
    }
}