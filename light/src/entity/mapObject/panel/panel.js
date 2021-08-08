import { ObjectSystem } from "../../../system/objectSystem.js";
import { Polygon } from "../../../util/polygon.js";
import { OrthogonalVector } from "../../../util/vector.js";
import { MapObject } from "../mapObject.js";

export class Panel extends MapObject {
    constructor(x, y) {
        super(x, y);
        this.type.push("Panel");

        this.passable = true;
        this.opaque = false;
        this.observers = [];
    }

    makeShape(shape, option) {
        super.makeShape(shape, option);
        switch (shape) {
            case "Rect":
                var p1 = new OrthogonalVector(this.pos.x - this.width / 2, this.pos.y - this.height / 2);
                var p2 = new OrthogonalVector(this.pos.x + this.width / 2, this.pos.y - this.height / 2);
                var p3 = new OrthogonalVector(this.pos.x + this.width / 2, this.pos.y + this.height / 2);
                var p4 = new OrthogonalVector(this.pos.x - this.width / 2, this.pos.y + this.height / 2);
                this.polygon = new Polygon([p1, p2, p3, p4]);
                break;
            case "Circle":
                // var func = function(layer, mover, obj) {
                //     var dPos = mover.pos.minus(obj.pos);
                //     var angle = Math.acos(obj.rad / dPos.r);
                //     var p1 = obj.pos.add(new PolarVector(obj.rad, dPos.theta + angle));
                //     var p2 = obj.pos.add(new PolarVector(obj.rad, dPos.theta - angle));
                //     var line = new VisibilitySegment(p1, p2);
                //     var angle1 = dPos.theta + angle;
                //     var angle2 = dPos.theta - angle;
                //     if (Angle.isBetween(angle1, dPos.theta, angle2)) {
                //         line.setProp(mover, "CCW", angle1);
                //         line.setProp(mover, "CW", angle2);
                //     } else {
                //         line.setProp(mover, "CCW", angle2);
                //         line.setProp(mover, "CW", angle1);
                //     }
                //     line.obj = obj;
                //     this.addWalls("dynamic", [line]);
                // }
                // this.wallUIDs = Shadow.addFunc("dynamic", func, [this]);
                // break;
        }
    }

    update() {
        this.observers = [];
        ObjectSystem.find("MovableObject").forEach(mover => {
            switch (this.shape) {
                case "Rect":
                    // TODO might be error, refer to ColorDoorPanel.update()
                    var visible = mover.visibleArea.intersectWith(this.polygon) || mover.visibleArea.includePoint(this.pos);
                    break;
                case "Circle":
                    // TODO, might be error
                    var visible = mover.visibleArea.intersectWithCircle(this) || mover.visibleArea.includePoint(this.pos);
                    break;
                default:
                    console.error("Unexpected shape", this.shape);
            }
            if (visible && this.pos.minus(mover.pos).r < mover.visibleRange) { this.observers.push(mover); }

            // var string = [this.observers.length.toString(), this.alreadyWatched.toString()];
            // if (mover.visibleArea.intersectWith(this.polygon)) { string.push("intersect"); }
            // if (mover.visibleArea.includePoint(this.pos)) { string.push("include"); }
            // Visualizer.addFunc("one-shot", function(layer, obj, string) { this.drawText(layer, obj.pos, string); }, [this, string]);
        });
    }
}