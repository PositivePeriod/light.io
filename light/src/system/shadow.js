import { CircleLineIntersection, ShadowLine } from "../util/line.js";
import { Polygon, ShadowPolygon } from "../util/polygon.js";
import { UID } from "../util/uid.js";
import { OrthogonalVector } from "../util/vector.js";
import { Visualizer } from "./visualizer.js";


// Reference : https://ncase.me/sight-and-light/draft6.html

class Shadow {
    constructor() {
        this.activate();
    }

    activate() {
        this.groups = new Map(); // Custom offscreencanvas for better performance
        this.groupsFunc = new Map();
        this.groupsInfo = new Map();

        // static
        this.addGroup("static", { "wallReset": false, "funcReset": false });
        // dynamic
        this.addGroup("dynamic");
        this.addGroup("one-shot", { "wallReset": true, "funcReset": true });
    }

    reset() { this.activate(); }

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
                if (segment !== null && segments.every(s => !s.same(segment))) { segments.push(segment); }
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
        return { "x": r_px + r_dx * T1, "y": r_py + r_dy * T1, "param": T1, "segment": segment };

    }

    calcVisiblility(mover) {
        var angleLimit = 1e-12;
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
            if (angles.every(a => { return Math.abs(a - angle) > angleLimit })) {
                angles.push(angle - angleLimit, angle, angle + angleLimit);
            }
        }
        // RAYS IN ALL DIRECTIONS
        var intersects = [];
        for (var i = 0; i < angles.length; i++) {
            var angle = angles[i];
            // Ray from center of screen to mouse
            var ray = {
                a: { x: mover.pos.x, y: mover.pos.y },
                b: { x: mover.pos.x + Math.cos(angle), y: mover.pos.y + Math.sin(angle) }
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
        var vertices = intersects.map(intersect => {
            var vertex = new OrthogonalVector(intersect.x, intersect.y);
            vertex.segment = intersect.segment;
            return vertex
        });
        vertices = this.optimizeVertices(vertices);
        var polygon = new Polygon(vertices);
        var usedEdges = vertices.map(v => v.segment);
        var edges = this.optimizeEdges(polygon.edges, usedEdges, mover.pos);
        return { "visibleEdges": edges, "visibleArea": polygon }
    }

    optimizeVertices(vertices) {
        if (vertices.length <= 3) { return vertices }
        var newV = [vertices[0], vertices[1]];
        for (let i = 2; i < vertices.length; i++) {
            var v1 = newV[newV.length - 1].minus(newV[newV.length - 2]);
            var v2 = vertices[i].minus(newV[newV.length - 1]);
            if (v1.r < 1e-6 || v2.r < 1e-6 || v1.parallel(v2)) { newV.pop(); }
            newV.push(vertices[i]);
        }
        // Check parallelity of vertices[last]
        var v1 = newV[newV.length - 1].minus(newV[newV.length - 2]);
        var v2 = newV[0].minus(newV[newV.length - 1]);
        if (v1.r < 1e-6 || v2.r < 1e-6 || v1.parallel(v2)) { newV.pop(); }
        // Check parallelity of vertices[0]
        var v1 = newV[0].minus(newV[newV.length - 1]);
        var v2 = newV[1].minus(newV[0]); // Error for special case? not edfined newV[1]
        if (v1.r < 1e-6 || v2.r < 1e-6 || v1.parallel(v2)) { newV.splice(0, 1); }
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

    optimizeEdges(polygonEdges, usedEdges, center) {
        var visibleEdges = [];
        for (let i = 0; i < polygonEdges.length; i++) {
            const edge = polygonEdges[i];
            for (let j = 0; j < usedEdges.length; j++) {
                const e = usedEdges[j];
                var isValid = edge.intersectWith(e) === true;
                if (!isValid) { continue }
                switch (e.type) {
                    case 'line':
                        var line = new ShadowLine(edge.p1, edge.p2, 'line');
                        visibleEdges.push(line);
                        break;
                    case "arc":
                        var index1 = i === polygonEdges.length - 1 ? 0 : i + 1;
                        var index2 = i === 0 ? polygonEdges.length - 1 : i - 1;
                        var inter1 = CircleLineIntersection(e.param, polygonEdges[index1]);
                        var inter2 = CircleLineIntersection(e.param, polygonEdges[index2]);
                        switch (inter1.length) {
                            case 0:
                                console.warn('Emtpy inter1', e.param, polygonEdges[index1]);
                                break;
                            case 1:
                                var v1 = inter1[0];
                                break;
                            case 2:
                                var v1 = inter1[0].minus(center).r < inter1[1].minus(center).r ? inter1[0] : inter1[1];
                                break;
                        }
                        switch (inter2.length) {
                            case 0:
                                console.warn('Empty inter2', e.param, polygonEdges[index2]);
                                break;
                            case 1:
                                var v2 = inter2[0];
                                break;
                            case 2:
                                var v2 = inter2[0].minus(center).r < inter2[1].minus(center).r ? inter2[0] : inter2[1];
                                break;
                        }
                        if (v1 && v2) {
                            var startAngle = v1.minus(e.param.pos).theta;
                            var endAngle = v2.minus(e.param.pos).theta;
                            var param = { "pos": e.param.pos, "rad": e.param.rad, "startAngle": startAngle, "endAngle": endAngle };
                            var line = new ShadowLine(edge.p1, edge.p2, 'arc', param);
                            visibleEdges.push(line);
                            break;
                        }
                    default:
                        console.warn('Unknown type', e.type, e);
                        console.trace();
                        break;
                }
                break;
            }
        }
        return visibleEdges
    }
}


var shadow = new Shadow();
export { shadow as Shadow }