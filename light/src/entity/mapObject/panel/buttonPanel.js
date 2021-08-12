import { ObjectSystem } from "../../../system/objectSystem.js";
import { Shadow } from "../../../system/shadow.js";
import { Visualizer } from "../../../system/visualizer.js";
import { Color } from "../../../util/color.js";
import { Line, ShadowLine } from "../../../util/line.js";
import { OrthogonalVector } from "../../../util/vector.js";
import { BouncyBackground } from "../bouncyBg.js";
import { RigidBackground } from "../rigidBg.js";
import { Panel } from "./panel.js";

export class ButtonPanel extends Panel {
    constructor(x, y, color) {
        super(x, y);
        this.type.push("ButtonPanel");

        this.onColor = color;
        this.passable = true;
        this.wasCollided = false;
        this.on = false;
    }

    update() {
        super.update();
        var beCollided = ObjectSystem.find("MovableObject").some(mover => mover.isCollidedWith(this));
        if (beCollided && !this.wasCollided) { this.on = !this.on; }
        this.color = this.on ? this.onColor : Color.Gray;
        this.wasCollided = beCollided;
    }

    draw() {
        this.drawFuncUid = Visualizer.addFunc("panel", function(layer, obj) { this.drawObject(layer, obj); }, [this]);
    }
}

export class StartPanel extends ButtonPanel {
    constructor(x, y, func) {
        super(x, y, Color.Gray);
        this.type.push("StartPanel");

        this.func = func;
    }

    update() {
        super.update();
        var beCollided = ObjectSystem.find("MovableObject").some(mover => mover.isCollidedWith(this));
        if (beCollided) { this.func(); }
    }
}

export class ColorDoorPanel extends Panel {
    constructor(x, y, color) {
        super(x, y);
        this.type.push("ColorDoorPanel");

        this.onColor = color;
        this.state = " ";
        this.pseudoObject = null;
    }

    draw() {}

    makeShape(shape, option) {
        super.makeShape(shape, option);
        this.refresh();
    }

    refresh(state) {
        switch (state) {
            case "R":
                var obj = new BouncyBackground(this.pos.x, this.pos.y, 300000);
                obj.makeShape("Rect", { "width": this.width, "height": this.height, "color": Color.Black });
                ObjectSystem.add(obj);
                var p1 = new OrthogonalVector(obj.pos.x - obj.width / 2, obj.pos.y - obj.height / 2);
                var p2 = new OrthogonalVector(obj.pos.x - obj.width / 2, obj.pos.y + obj.height / 2);
                var p3 = new OrthogonalVector(obj.pos.x + obj.width / 2, obj.pos.y - obj.height / 2);
                var p4 = new OrthogonalVector(obj.pos.x + obj.width / 2, obj.pos.y + obj.height / 2);
                obj.edges = [
                    new ShadowLine(p1, p3, 'line'),
                    new ShadowLine(p1, p2, 'line'),
                    new ShadowLine(p3, p4, 'line'),
                    new ShadowLine(p2, p4, 'line')
                ]
                obj.wallUIDs = Shadow.addWalls("static", obj.edges);
                obj.draw();
                this.pseudoObject = obj;
                break;
            case " ":
                if (this.state === "R") {
                    ObjectSystem.remove(this.pseudoObject);
                    Shadow.removeWalls("static", this.pseudoObject.wallUIDs);
                    this.pseudoObject.removeDraw();
                    this.pseudoObject = null;
                }
                break;
        }
        this.state = state;
        Visualizer.drawReset(); // TODO?
    }

    update() {
        this.observers = [];
        ObjectSystem.find("MovableObject").forEach(mover => {
            // console.log('update', mover.color.name);
            switch (this.shape) {
                case "Rect":
                    if (this.pseudoObject === null) {

                        var visible = mover.visibleArea.includePoint(this.pos) ||
                            mover.visibleArea.edges.some(e1 => {
                                var counter = 0;
                                for (let i = 0; i < this.polygon.edges.length; i++) {
                                    const e2 = this.polygon.edges[i];
                                    var inter = e1.intersectWith(e2);
                                    if (inter === true) {
                                        // console.log('interTrue', e1, e2);
                                        // [e1, e2].forEach((edge, index) => {
                                        //     Visualizer.addFunc("one-shot", function(layer) { this.drawText(layer, edge.center, 'V' + index.toString()); }, []);
                                        // })
                                        return true
                                    }
                                    if (inter !== null) { counter++; }
                                }
                                // console.log('counter', counter);
                                return counter >= 2
                            });
                        // console.log(mover.visibleArea.includePoint(this.pos), visible);
                        // var visible = mover.visibleArea.intersectWith(this.polygon) || mover.visibleArea.includePoint(this.pos);
                    } else {
                        // console.log('rectNotNull');
                        var visible = this.pseudoObject.edges.some(edge => mover.visibleEdges.some(e => {
                            // [edge, e].forEach((eg, index) => {
                            //     Visualizer.addFunc("one-shot", function(layer) { this.drawText(layer, eg.center, 'W' + index.toString()); }, []);
                            // })
                            return e.intersectWith(edge) === true
                        }))
                    }
                    break;
                case "Circle":
                    // TODO, might be error
                    // console.log('circle');
                    var visible = mover.visibleArea.intersectWithCircle(this) || mover.visibleArea.includePoint(this.pos);
                    break;
                default:
                    console.error("Unexpected shape", this.shape);
                    break;
            }
            if (visible && this.pos.minus(mover.pos).r < mover.visibleRange) { this.observers.push(mover); }
        });

        if (this.observers.length === 0) {
            this.color = Color.LightGray;
        } else {
            var colors = this.observers.map(observer => observer.color);
            this.color = Color.add(colors);
        }
        console.log(this.onColor.name, this.color.name);
        var state = this.color === this.onColor ? "R" : " ";
        if (this.state === state) { return } else { this.refresh(state); }
    }
}