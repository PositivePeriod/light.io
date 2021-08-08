import { Line } from "../util/line.js";
import { Polygon } from "../util/polygon.js";

export class OpticalObject {
    constructor(obj, option) {
        this.obj = obj;

        this.staticWalls = option.staticWalls || []
        this.dynamicWalls = option.dynamicWalls || [];

        this.opaque = true;
        this.lightSource = null;
    }

    get opticalWalls(point) {
        return this.opaque ? [...this.staticWalls, ...this.dynamicWalls.map(func => func(this.obj, point))] : [];
    }
}

export function InitOpticalWall(type, param) {
    var staticWalls = [];
    var dynamicWalls = [];
    switch (type) {
        case poly:
            var polygon = param.polygon || new Polygon(); // CW order
            var walls = polygon.edges.map(edge => new Line(edge.p1, edge.p2, false));
            staticWalls.push(...walls);
            break;
        case circle:
            var func = function(obj, point) {
                var dPos = point.minus(obj.pos);
                var angle = Math.acos(obj.rad / dPos.r);
                var p1 = obj.pos.add(new PolarVector(obj.rad, dPos.theta + angle));
                var p2 = obj.pos.add(new PolarVector(obj.rad, dPos.theta - angle));
                return new Line(p1, p2, false);
            }
            dynamicWalls.push(func)
            break;
    }
    return { "static": staticWalls, "dynamic": dynamicWalls }
}