import { ObjectSystem } from "../../system/objectSystem.js";
import { Visualizer } from "../../system/visualizer.js";
import { Color } from "../../util/color.js";
import { Polygon } from "../../util/polygon.js";
import { OrthogonalVector } from "../../util/vector.js";
import { MapObject } from "./mapObject.js";

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
            this.color = new Color('rgb', r, g, b);
        }
    }

    draw() {
        Visualizer.addFunc("panel", function(layer, obj) { this.drawObject(layer, obj); }, [this]);
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
            this.color = new Color('rgb', r, g, b);
        }
    }

    draw() {
        Visualizer.addFunc("panel", function(layer, obj) { this.drawObject(layer, obj); }, [this]);
    }
}