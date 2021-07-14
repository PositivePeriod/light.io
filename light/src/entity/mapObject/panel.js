import { ObjectSystem } from "../../system/objectSystem.js";
import { Visualizer } from "../../system/visualizer.js";
import { Color } from "../../util/color.js";
import { pointIsInPoly } from "../../util/line.js";
import { GameObject } from "../gameObject.js";
import { MapObject } from "./mapObject.js";

class Panel extends MapObject {
    constructor(x, y) {
        super(x, y);
        this.type.push("Panel");

        this.passable = true;
        this.opaque = false;
    }

    update() {
        var observers = [];
        ObjectSystem.find("MovableObject").forEach(mover => {
            var flatPolygon = [].concat(...mover.polygon);
            if (pointIsInPoly(this.pos, flatPolygon)) { observers.push(mover); }
        });
        this.observers = observers;
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
        Visualizer.addFunc("mover",function (layer, obj)  { this.drawObject(layer, obj); }, [this]);
    }
}