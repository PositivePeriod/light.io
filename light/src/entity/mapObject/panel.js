import { ObjectSystem } from "../../system/objectSystem.js";
import { Shadow } from "../../system/shadow.js";
import { Visualizer } from "../../system/visualizer.js";
import { Color } from "../../util/color.js";
import { VisibilitySegment } from "../../util/line.js";
import { Polygon } from "../../util/polygon.js";
import { OrthogonalVector } from "../../util/vector.js";
import { MapObject } from "./mapObject.js";
import { RigidBackground } from "./rigidBg.js";

class Panel extends MapObject {
    constructor(x, y) {
        super(x, y);
        this.type.push("Panel");

        this.passable = true;
        this.opaque = false;
        this.observers = [];
    }

    makeShape(shape, option) {
        super.makeShape(shape, option);
        var p1 = new OrthogonalVector(this.pos.x - this.width / 2, this.pos.y - this.height / 2);
        var p2 = new OrthogonalVector(this.pos.x + this.width / 2, this.pos.y - this.height / 2);
        var p3 = new OrthogonalVector(this.pos.x + this.width / 2, this.pos.y + this.height / 2);
        var p4 = new OrthogonalVector(this.pos.x - this.width / 2, this.pos.y + this.height / 2);
        this.polygon = new Polygon([p1, p2, p3, p4]);
    }

    update() {
        this.observers = [];
        ObjectSystem.find("MovableObject").forEach(mover => {
            var visible = mover.visibleArea.intersectWith(this.polygon) || mover.visibleArea.includePoint(this.pos);
            if (visible && this.pos.minus(mover.pos).r < mover.visibleRange) { this.observers.push(mover); }

            // var string = [this.observers.length.toString(), this.alreadyWatched.toString()];
            // if (mover.visibleArea.intersectWith(this.polygon)) { string.push("intersect"); }
            // if (mover.visibleArea.includePoint(this.pos)) { string.push("include"); }
            // Visualizer.addFunc("one-shot", function(layer, obj, string) { this.drawText(layer, obj.pos, string); }, [this, string]);
        });
    }
}

export class PositivePanel extends Panel {
    constructor(x, y) {
        super(x, y);
        this.type.push("PositivePanel");

        this.passable = true;
    }

    update() {
        super.update();
        if (this.observers.length === 0) {
            this.color = Color.White;
        } else {
            var r = 0;
            var g = 0;
            var b = 0;
            this.observers.forEach(observer => {
                var rgb = observer.color.rgb;
                r += rgb[0];
                g += rgb[1];
                b += rgb[2];
            })
            r /= this.observers.length;
            g /= this.observers.length;
            b /= this.observers.length;
            this.color = new Color("rgb", r, g, b);
        }
    }

    draw() {
        this.drawFuncUid = Visualizer.addFunc("panel", function(layer, obj) { this.drawObject(layer, obj); }, [this]);
    }
}

export class NegativePanel extends Panel {
    constructor(x, y) {
        super(x, y);
        this.type.push("PositivePanel");

        this.passable = true;
    }

    update() {
        super.update();
        if (this.observers.length === 0) {
            this.color = Color.Black;
        } else {
            var r = 0;
            var g = 0;
            var b = 0;
            this.observers.forEach(observer => {
                var rgb = observer.color.rgb;
                r += rgb[0];
                g += rgb[1];
                b += rgb[2];
            })
            r = 256 - r / this.observers.length;
            g = 256 - g / this.observers.length;
            b = 256 - b / this.observers.length;
            this.color = new Color("rgb", r, g, b);
        }
    }

    draw() {
        this.drawFuncUid = Visualizer.addFunc("panel", function(layer, obj) { this.drawObject(layer, obj); }, [this]);
    }
}

export class UncertainPanel extends Panel {
    constructor(x, y) {
        super(x, y);
        this.type.push("UncertainPanel");

        this.possibility = 0.8;
        this.state = " ";
        this.pseudoObject = null;
        this.alreadyWatched = false;
    }

    draw() {}

    makeShape(shape, option) {
        super.makeShape(shape, option);
        this.refresh();
    }

    refresh() {
        var state = Math.random() > this.possibility ? "R" : " ";
        if (this.state === "R") {
            ObjectSystem.remove(this.pseudoObject);
            Shadow.removeWalls("static", this.pseudoObject.wallUIDs);
            this.pseudoObject.removeDraw();
            this.pseudoObject = null;
        }
        switch (state) {
            case "R":
                var obj = new RigidBackground(this.pos.x, this.pos.y);
                obj.makeShape("Rect", { "width": this.width, "height": this.height, "color": Color.Black });
                ObjectSystem.add(obj);
                var p1 = new OrthogonalVector(obj.pos.x - obj.width / 2, obj.pos.y - obj.height / 2);
                var p2 = new OrthogonalVector(obj.pos.x - obj.width / 2, obj.pos.y + obj.height / 2);
                var p3 = new OrthogonalVector(obj.pos.x + obj.width / 2, obj.pos.y - obj.height / 2);
                var p4 = new OrthogonalVector(obj.pos.x + obj.width / 2, obj.pos.y + obj.height / 2);
                obj.edges = [
                    new VisibilitySegment(p1, p3),
                    new VisibilitySegment(p1, p2),
                    new VisibilitySegment(p3, p4),
                    new VisibilitySegment(p2, p4)
                ]
                obj.wallUIDs = Shadow.addWalls("static", obj.edges);
                obj.draw();
                this.pseudoObject = obj;
                break;
            case " ":
                break;
        }
        this.state = state;
        Visualizer.initDraw();
    }

    update() {
        super.update();
        if (this.observers.length === 0) { // not shown
            if (this.alreadyWatched) {
                this.refresh();
                this.alreadyWatched = false;
            } else {
                // if (this.pseudoObject !== null) {
                //     this.pseudoObject.color = Color.Blue;
                //     Visualizer.initDraw();
                // }
            }
        } else { // shown
            // if (this.pseudoObject !== null) {
            //     this.pseudoObject.color = Color.Red;
            //     Visualizer.initDraw();
            // }
            this.alreadyWatched = true;
        }
    }
}

export class TimeAttackPanel extends Panel {
    constructor(x, y) {
        super(x, y);
        this.type.push("TimeAttackPanel");

        this.possibility = 0.8;
        this.state = " ";
        this.pseudoObject = null;
        this.alreadyWatched = false;
    }

    draw() {}

    makeShape(shape, option) {
        super.makeShape(shape, option);
        this.refresh();
    }

    refresh() {
        var state = Math.random() > this.possibility ? "R" : " ";
        if (this.state === "R") {
            ObjectSystem.remove(this.pseudoObject);
            Shadow.removeWalls("static", this.pseudoObject.wallUIDs);
            this.pseudoObject.removeDraw();
            this.pseudoObject = null;
        }
        switch (state) {
            case "R":
                var obj = new RigidBackground(this.pos.x, this.pos.y);
                obj.makeShape("Rect", { "width": this.width, "height": this.height, "color": Color.Black });
                ObjectSystem.add(obj);
                var p1 = new OrthogonalVector(obj.pos.x - obj.width / 2, obj.pos.y - obj.height / 2);
                var p2 = new OrthogonalVector(obj.pos.x - obj.width / 2, obj.pos.y + obj.height / 2);
                var p3 = new OrthogonalVector(obj.pos.x + obj.width / 2, obj.pos.y - obj.height / 2);
                var p4 = new OrthogonalVector(obj.pos.x + obj.width / 2, obj.pos.y + obj.height / 2);
                obj.edges = [
                    new VisibilitySegment(p1, p3),
                    new VisibilitySegment(p1, p2),
                    new VisibilitySegment(p3, p4),
                    new VisibilitySegment(p2, p4)
                ]
                obj.wallUIDs = Shadow.addWalls("static", obj.edges);
                obj.draw();
                this.pseudoObject = obj;
                break;
            case " ":
                break;
        }
        this.state = state;
        Visualizer.initDraw();
    }

    update() {
        super.update();
        if (this.observers.length === 0) { // not shown
            if (this.alreadyWatched) {
                this.refresh();
                this.alreadyWatched = false;
            } else {
                // if (this.pseudoObject !== null) {
                //     this.pseudoObject.color = Color.Blue;
                //     Visualizer.initDraw();
                // }
            }
        } else { // shown
            // if (this.pseudoObject !== null) {
            //     this.pseudoObject.color = Color.Red;
            //     Visualizer.initDraw();
            // }
            this.alreadyWatched = true;
        }
    }
}