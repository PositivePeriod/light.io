import { segmentInFrontOf } from "../util/line.js";

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

    endPointCompare(p1, p2) { // endPointCompare
        var cTheta1 = p1.getProp(this, "cTheta");
        var cTheta2 = p2.getProp(this, "cTheta");
        var beginLine1 = p1.getProp(this, "beginLine");
        var beginLine2 = p2.getProp(this, "beginLine");
        if (cTheta1 > cTheta2) return 1;
        if (cTheta1 < cTheta2) return -1;
        if (!beginLine1 && beginLine2) return 1;
        if (beginLine1 && !beginLine2) return -1;
        return 0;
    }

    calcVisibleArea(mover) {
        var segments = [];
        this.getWallGroups(mover).forEach(group => {
            group.forEach(segment => {
                segment.setMover(mover);
                segments.push(segment);
            })
        })

        var count = 0;
        for (let i = 0; i < segments.length-1; i += 1) {
            var flag = false;
            for (let j = i+1; j < segments.length; j += 1) {
                var si = segments[i];
                var sj = segments[j];
                if (si === null || sj === null) { continue }
                if (si.same(sj)) {
                    // console.log('flag', i, j);
                    flag = true;
                    segments[j] = null;
                }
            }
            if (flag) { count++; }
        }
        var points = segments.map((segment) => segment ? [segment.p1, segment.p2] : []).flat(1);
        // console.log('count', segments.length, count, points.length);

        points.sort(this.endPointCompare.bind(mover));

        var openSegments = [];
        var output = [];
        var beginAngle = 0;

        for (let pass = 0; pass < 2; pass += 1) {
            for (let i = 0; i < points.length; i += 1) {
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
                    if (pass === 1) {
                        var line = openSegment.getVisibleLine(mover, beginAngle, point.getProp(mover, "cTheta"));
                        output.push(line);
                    }
                    beginAngle = point.getProp(mover, "cTheta");
                }
            }
        }
        return output
    }
}

var shadow = new Shadow();
export { shadow as Shadow }