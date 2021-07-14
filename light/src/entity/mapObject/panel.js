import { ObjectSystem } from "../../system/objectSystem.js";
import { Visualizer } from "../../system/visualizer.js";
import { Color } from "../../util/color.js";
import { pointIsInPoly } from "../../util/line.js";
import { MapObject } from "./mapObject.js";

class Panel extends MapObject {
    constructor(x, y) {
        super(x, y);
        this.type.push("Panel");

        this.passable = true;
        this.opaque = false;
        this.observers = [];
    }

    update() {
        this.observers = [];
        ObjectSystem.find("MovableObject").forEach(mover => {
            if (mover.visibleArea !== undefined && mover.visibleArea.length !== 0) {
                var flatPolygon = mover.visibleArea.flat(1);
                if (pointIsInPoly(this.pos, flatPolygon) && this.pos.minus(mover.pos).r < mover.visibleRange) {
                    this.observers.push(mover);
                }
            }
        });
    }
}

export class AtLeastPanel extends Panel {
    constructor(x, y) {
        super(x, y);
        this.type.push("AtLeastPanel");

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