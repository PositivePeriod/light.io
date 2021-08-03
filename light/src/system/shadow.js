import { Polygon } from "../util/polygon.js";
import { UID } from "../util/uid.js";
import { OrthogonalVector } from "../util/vector.js";

class Shadow {
    constructor() {
        this.groups = new Map(); // Custom offscreencanvas for better performance
        this.groupsFunc = new Map();
        this.groupsInfo = new Map();

        // static
        this.addGroup("static", { "wallReset": false, "funcReset": false });
        // dynamic
        this.addGroup("dynamic");
        this.addGroup("one-shot", { "wallReset": true, "funcReset": true });
    }

    addWalls(name, walls) {
        var uids = [];
        var group = this.findGroup(name);
        walls.forEach(wall => {
            var uid = UID.get();
            group.set(uid, wall);
            uids.push(uid);
        });
        return uids
    }

    removeWalls(name, uids) {
        var group = this.findGroup(name);
        uids.forEach(uid => {
            if (!group.delete(uid)) { console.warn("Fail to remove wall;", uid); }
        });
    }

    addFunc(name, func, arg) {
        var uid = UID.get();
        this.groupsFunc.get(name).set(uid, { "func": func, "arg": arg || [] });
        return uid
    }

    removeFunc(name, uid) {
        var group = this.groupsFunc.get(name);
        if (!group.delete(uid)) { console.warn("Fail to remove func;", uid, group); }
    }

    addGroup(name, option) {
        this.groups.set(name, new Map());
        this.groupsInfo.set(name, option ? option : { "wallReset": true, "funcReset": false });
        this.groupsFunc.set(name, new Map());
    }

    findGroup(name) {
        if (!this.groups.has(name)) { this.addGroup(name); }
        return this.groups.get(name);
    }

    resetGroup(name, group) {
        var group = group || this.findGroup(name);
        group.clear();
    }

    getWalls(mover) {
        ["static", "dynamic", "one-shot"].forEach(name => {
            var group = this.findGroup(name);
            var info = this.groupsInfo.get(name);
            var funcs = this.groupsFunc.get(name);
            if (info.wallReset) {
                this.resetGroup(name, group);
                funcs.forEach((input) => { input.func.bind(this)(group, mover, ...input.arg); })
            }
            if (info.funcReset) { this.groupsFunc.set(name, new Map()); }
        });
        var segments = [];
        this.groups.forEach(group => {
            group.forEach(segment => {
                segment.setMover(mover);
                // checking overlapped edges
                if (segment !== null && segments.every(s => !s.same(segment))) { segments.push(segment); }
            })
        })

        // segments.forEach(l => { Visualizer.addFunc("one-shot", function(layer, line) { this.drawLine(layer, line, Color.Cyan); }, [l]); })

        // Checking intersecting edges
        // var newSegments = [];
        // var counter = 0;
        // while (segments.length !== 0) {
        //     if (counter++ > 1e3) {
        //         console.error("Infinite checking intersecting edges");
        //         return;
        //     }
        //     var segment = segments.pop();

        //     var index = newSegments.findIndex(s => s.intersectWith(segment, false, true) !== null);
        //     if (index === -1) {
        //         newSegments.push(segment);
        //     } else {
        //         if (newSegments[index].vector.parallel(segment.vector)) {
        //             var line = unionParallelLine(newSegments[index], segment);
        //             newSegments.splice(index, 1);
        //             segments.push(line);
        //         } else {
        //             var intersection = newSegments[index].intersectWith(segment);
        //             var valid = [newSegments[index].p1, newSegments[index].p2, segment.p1, segment.p2].every(p => !p.same(intersection));

        //             if (valid) {
        //                 [newSegments[index].p1, newSegments[index].p2, segment.p1, segment.p2].forEach(point => {
        //                     segments.push(new VisibilitySegment(point, intersection, false));
        //                 });
        //                 newSegments.splice(index, 1);
        //             } else { newSegments.push(segment); }
        //         }
        //     }
        // }
        // newSegments = segments
        // newSegments.forEach(l => { Visualizer.addFunc("one-shot", function(layer, line) { this.drawLine(layer, line, Color.Cyan); }, [l]); })

        return segments
    }

    getIntersection(ray, segment) {
        // RAY in parametric: Point + Delta*T1
        var r_px = ray.a.x;
        var r_py = ray.a.y;
        var r_dx = ray.b.x - ray.a.x;
        var r_dy = ray.b.y - ray.a.y;
        // SEGMENT in parametric: Point + Delta*T2
        var s_px = segment.p1.x;
        var s_py = segment.p1.y;
        var s_dx = segment.p2.x - segment.p1.x;
        var s_dy = segment.p2.y - segment.p1.y;
        // Are they parallel? If so, no intersect
        var r_mag = Math.sqrt(r_dx * r_dx + r_dy * r_dy);
        var s_mag = Math.sqrt(s_dx * s_dx + s_dy * s_dy);
        if (Math.abs(r_dx / r_mag - s_dx / s_mag) < 1e-6 && Math.abs(r_dy / r_mag - s_dy / s_mag) < 1e-6) {
            // Unit vectors are the same.
            return null;
        }
        // SOLVE FOR T1 & T2
        // r_px+r_dx*T1 = s_px+s_dx*T2 && r_py+r_dy*T1 = s_py+s_dy*T2
        // ==> T1 = (s_px+s_dx*T2-r_px)/r_dx = (s_py+s_dy*T2-r_py)/r_dy
        // ==> s_px*r_dy + s_dx*T2*r_dy - r_px*r_dy = s_py*r_dx + s_dy*T2*r_dx - r_py*r_dx
        // ==> T2 = (r_dx*(s_py-r_py) + r_dy*(r_px-s_px))/(s_dx*r_dy - s_dy*r_dx)
        var T2 = (r_dx * (s_py - r_py) + r_dy * (r_px - s_px)) / (s_dx * r_dy - s_dy * r_dx);
        var T1 = (s_px + s_dx * T2 - r_px) / r_dx;
        // Must be within parametic whatevers for RAY/SEGMENT
        if (T1 < 0) return null;
        if (T2 < 0 || T2 > 1) return null;
        // Return the POINT OF INTERSECTION
        return { x: r_px + r_dx * T1, y: r_py + r_dy * T1, param: T1 };

    }

    calcVisiblility(mover) {
        var angleLimit = 1e-6;
        var segments = this.getWalls(mover);
        var points = [];
        segments.forEach(segment => {
            if (points.every(p => { return !p.same(segment.p1) })) { points.push(segment.p1); }
            if (points.every(p => { return !p.same(segment.p2) })) { points.push(segment.p2); }
        })
        var angles = [];
        for (var j = 0; j < points.length; j++) {
            var point = points[j];
            var angle = Math.atan2(point.y - mover.pos.y, point.x - mover.pos.x);
            point.angle = angle;
            if (angles.every(a => { return Math.abs(a - angle) > 1e-6 })) {
                angles.push(angle - angleLimit, angle, angle + angleLimit);
            }
        }
        // RAYS IN ALL DIRECTIONS
        var intersects = [];
        for (var i = 0; i < angles.length; i++) {
            var angle = angles[i];
            // Calculate dx & dy from angle
            var dx = Math.cos(angle);
            var dy = Math.sin(angle);
            // Ray from center of screen to mouse
            var ray = {
                a: { x: mover.pos.x, y: mover.pos.y },
                b: { x: mover.pos.x + dx, y: mover.pos.y + dy }
            };
            // Find CLOSEST intersection
            var closestIntersect = null;
            for (var j = 0; j < segments.length; j++) {
                var intersect = this.getIntersection(ray, segments[j]);
                if (!intersect) { continue; }
                if (!closestIntersect || intersect.param < closestIntersect.param) {
                    closestIntersect = intersect;
                }
            }
            // Intersect angle
            if (!closestIntersect) { continue; }
            closestIntersect.angle = angle;
            // Add to list of intersects
            intersects.push(closestIntersect);
        }
        // Sort intersects by angle
        intersects.sort(function(a, b) { return a.angle - b.angle; });
        var vertices = intersects.map(intersect => new OrthogonalVector(intersect.x, intersect.y));
        vertices = this.optimizeVertices(vertices);

        // Visualizer.addFunc("one-shot", function(layer, points) { this.drawPolygon(layer, points, { "color": Color.Cyan }); }, [vertices]);
        // vertices.forEach((v, i) => {
        //     Visualizer.addFunc("one-shot", function(layer) { this.drawCircle(layer, { "pos": v, "rad": 3 }, { "color": Color.Magenta }); }, []);
        //     Visualizer.addFunc("one-shot", function(layer) { this.drawText(layer, v.add(new OrthogonalVector(0, i % 3 * 5)), "V" + i.toString(), { "color": Color.Magenta }); }, []);
        // });

        return { "visibleEdges": [], "visibleArea": new Polygon(vertices) }
    }

    optimizeVertices(vertices) {
        if (vertices.length <= 3) { return vertices }
        var newV = [vertices[0], vertices[1]];
        for (let i = 2; i < vertices.length; i++) {
            var v1 = newV[newV.length - 1].minus(newV[newV.length - 2]);
            var v2 = vertices[i].minus(newV[newV.length - 1]);
            if (v1.parallel(v2) || v1.r < 1e-6) { newV.pop(); }
            newV.push(vertices[i]);
        }
        // Check parallelity of vertices[last]
        var v1 = newV[newV.length - 1].minus(newV[newV.length - 2]);
        var v2 = newV[0].minus(newV[newV.length - 1]);
        if (v1.parallel(v2) || v1.r < 1e-6) { newV.pop(); }
        // Check parallelity of vertices[0]
        var v1 = newV[0].minus(newV[newV.length - 1]);
        var v2 = newV[1].minus(newV[0]); // Error for special case? not edfined newV[1]
        if (v1.parallel(v2) || v1.r < 1e-6) { newV.splice(0, 1); }
        // Check again for being sure and some error
        var i = 0;
        var counter = 0;
        while (i < newV.length) {
            if (counter++ > 1e4) {
                console.error("Infinite optimizing vertices");
                return;
            }
            var v1 = newV[(i + 1) % newV.length].minus(newV[i]);
            var v2 = newV[(i + 2) % newV.length].minus(newV[(i + 1) % newV.length]);
            if (v1.parallel(v2)) { newV.splice((i + 1) % newV.length, 1); } else { i++; }
        }
        return newV
    }
}


var shadow = new Shadow();
export { shadow as Shadow }