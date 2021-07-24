import { Color } from "../util/color.js";
import { segmentInFrontOf } from "../util/line.js";
import { Polygon } from "../util/polygon.js";
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

    getWallGroups(mover) {
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
        return this.groups
    }

    static specCounter = 0;

    endPointCompare(p1, p2) { // endPointCompare
        var cTheta1 = p1.getProp(this, "cTheta");
        var cTheta2 = p2.getProp(this, "cTheta");
        var beginLine1 = p1.getProp(this, "beginLine");
        var beginLine2 = p2.getProp(this, "beginLine");
        if (cTheta1 > cTheta2) return 1;
        if (cTheta1 < cTheta2) return -1;
        if (!beginLine1 && beginLine2) return 1;
        if (beginLine1 && !beginLine2) return -1;
        // console.log('comp', p1.line.represent(), p2.line.represent());
        return p1.line.center.minus(this.pos).r < p2.line.center.minus(this.pos).r ? -1 : 1;
    }

    calcVisiblility(mover) {
        var segments = [];
        var points = [];
        this.getWallGroups(mover).forEach(group => {
            group.forEach(segment => {
                segment.setMover(mover);
                // checking overlapped edges
                if (segment !== null && segments.every(s => { return !s.same(segment) })) { segments.push(segment); }
            })
        })
        // console.log(mover.pos);
        var points = segments.map(segment => [segment.p1, segment.p2]).flat(1);
        points.sort(this.endPointCompare.bind(mover));
        // console.log(segments[8].represent(), segments[9].represent());
        var openSegments = [];
        var vertices = [];
        var edges = [];
        var beginAngle = 0;

        for (let pass = 0; pass < 2; pass++) {
            for (let i = 0; i < points.length; i++) {
                var point = points[i];
                var openSegment = openSegments[0];
                if (point.getProp(mover, "beginLine")) {
                    var segment = openSegments.find(segment => { return !segment || !segmentInFrontOf(point.line, segment, mover.pos) });
                    // push
                    if (!segment) {
                        openSegments.push(point.line);
                    } else {
                        var index = openSegments.indexOf(segment);
                        openSegments.splice(index, 0, point.line);
                    }
                } else {
                    // remove
                    var index = openSegments.indexOf(point.line)
                    if (index > -1) openSegments.splice(index, 1);
                }
                if (openSegment && openSegment !== openSegments[0]) {
                    if (pass === 1 && Math.abs(beginAngle - point.getProp(mover, "cTheta")) > 1e-6) {
                        openSegment.setVisibleRange(mover, beginAngle, point.getProp(mover, "cTheta"));
                        vertices.push(openSegment.getProp(mover, "v1"), openSegment.getProp(mover, "v2"));
                        edges.push(openSegment);
                    }
                    beginAngle = point.getProp(mover, "cTheta");
                }
            }
        }

        // edges.forEach((segment, index) => {
        //     Visualizer.addFunc("time", function(layer, line) { this.drawLine(layer, line, '#00FFFF'); }, [segment]);
        //     Visualizer.addFunc("time", function(layer) { this.drawText(layer, { "pos": segment.center }, 'Q' + index.toString()); }, []);
        // })

        var polygonVertices = [edges[0].getProp(mover, "v1")];
        for (let i = 0; i < edges.length; i++) {
            var v1 = edges[i].getProp(mover, "v1");
            var v2 = edges[i].getProp(mover, "v2");
            // TODO might be error
            if (!polygonVertices[polygonVertices.length - 1].same(v1)) { polygonVertices.push(v1); }
            if (!polygonVertices[polygonVertices.length - 1].same(v2)) { polygonVertices.push(v2); }
        }
        if (polygonVertices[0].same(polygonVertices[polygonVertices.length - 1])) { polygonVertices.pop(); }
        return { "visibleEdges": edges, "visibleArea": new Polygon(polygonVertices) }
    }

    isVisible(mover, line) {
        // return mover.visibleArea.includePoint(line.p1)
    }
}

var shadow = new Shadow();
export { shadow as Shadow }