import { Color } from "../util/color.js";
import { segmentInFrontOf } from "../util/line.js";
import { Polygon } from "../util/polygon.js";
import { OrthogonalVector } from "../util/vector.js";
import { Visualizer } from "./visualizer.js";

class Shadow {
    constructor() {
        this.groups = new Map(); // Custom offscreencanvas for better performance
        this.groupsFunc = new Map();
        this.groupsInfo = new Map();

        // static
        this.addGroup("static", { "wallReset": false, "funcReset": false });
        // dynamic
        this.addGroup("semi-static");
        this.addGroup("dynamic", { "wallReset": true, "funcReset": true });
    }

    addWalls(name, walls) {
        this.findGroup(name).push(...walls);
    }

    addFunc(name, func, arg) {
        this.groupsFunc.get(name).push({ "func": func, "arg": arg || [] });
    }

    addGroup(name, option) {
        this.groups.set(name, []);
        this.groupsInfo.set(name, option ? option : { "wallReset": true, "funcReset": false });
        this.groupsFunc.set(name, []);
    }

    findGroup(name) {
        if (!this.groups.has(name)) { this.addGroup(name); }
        return this.groups.get(name);
    }

    resetGroup(name, group) {
        var group = group || this.findGroup(name);
        group.length = 0;
    }

    getWalls(mover) {
        ["static", "semi-static", "dynamic"].forEach(name => {
            var group = this.findGroup(name);
            var info = this.groupsInfo.get(name);
            var funcs = this.groupsFunc.get(name);
            if (info.wallReset) {
                this.resetGroup(name, group);
                funcs.forEach((input) => { input.func.bind(this)(group, mover, ...input.arg); })
            }
            if (info.funcReset) { this.groupsFunc.set(name, []); }
        });
        var segments = [];
        this.groups.forEach(group => {
            group.forEach(segment => {
                segment.setMover(mover);
                // checking overlapped edges
                if (segment !== null && segments.every(s => { return !s.same(segment) })) { segments.push(segment); }
            })
        })
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
        return {
            x: r_px + r_dx * T1,
            y: r_py + r_dy * T1,
            param: T1
        };

    }

    calcVisiblility(mover) {
        var angleLimit = 0.00001;
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
            if (angles.every(a => { return Math.abs(a - angle) > 1e-12 })) {
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
        var polygonVertices = intersects.map(intersect => new OrthogonalVector(intersect.x, intersect.y));

        return { "visibleEdges": [], "visibleArea": new Polygon(polygonVertices) }
    }
}

var shadow = new Shadow();
export { shadow as Shadow }