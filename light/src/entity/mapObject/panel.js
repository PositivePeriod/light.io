import { Game } from "../../game.js";
import { ObjectSystem } from "../../system/objectSystem.js";
import { Shadow } from "../../system/shadow.js";
import { Visualizer } from "../../system/visualizer.js";
import { Color } from "../../util/color.js";
import { VisibilitySegment } from "../../util/line.js";
import { Polygon } from "../../util/polygon.js";
import { Angle, OrthogonalVector, PolarVector } from "../../util/vector.js";
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
            var colors = this.observers.map(observer => observer.color);
            this.color = Color.add(colors);
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
            var colors = this.observers.map(observer => observer.color);
            this.color = Color.add(colors);
        }
    }

    draw() {
        this.drawFuncUid = Visualizer.addFunc("panel", function(layer, obj) { this.drawObject(layer, obj); }, [this]);
    }
}

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
        Visualizer.drawReset(); // TODO?
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
                //     Visualizer.drawReset();
                // }
            }
        } else { // shown
            // if (this.pseudoObject !== null) {
            //     this.pseudoObject.color = Color.Red;
            //     Visualizer.drawReset();
            // }
            this.alreadyWatched = true;
        }
    }
}

export class TimerPanel extends Panel {
    static lastNumber = 3;
    constructor(x, y, color) {
        super(x, y);
        this.type.push("TimerPanel");

        this.possibility = 0.2;
        this.alreadyWatched = false;

        this.drawFuncUid = null;
        this.blastTime = 10;
        this.blastTurn = null;
        this.bombColor = null;

        // this.colorList = [Color.White, Color.Black, Color.Red, Color.Green, Color.Blue, Color.Yellow, Color.Magenta, Color.Cyan];
        // this.colorList = [Color.Red, Color.Blue, Color.Magenta];
        this.colorList = color;
    }

    draw() {}

    addBomb(turn) {
        if (TimerPanel.lastNumber <= 0) { return }
        TimerPanel.lastNumber--;
        this.blastTurn = turn + Game.fps * this.blastTime;
        this.bombColor = [
            this.colorList[Math.floor(Math.random() * this.colorList.length)],
            // this.colorList[Math.floor(Math.random() * this.colorList.length)]
        ];
        var func = function(layer, obj) {
            if (obj.bombColor === null) { return }
            switch (obj.bombColor.length) {
                case 1:
                    this.drawCircle(layer, { "pos": obj.pos, "rad": obj.rad * 0.6, "color": obj.bombColor[0] });
                    break;
                case 2:
                    this.drawCircle(layer, { "pos": obj.pos, "rad": obj.rad * 0.9, "color": obj.bombColor[0] });
                    this.drawCircle(layer, { "pos": obj.pos, "rad": obj.rad * 0.6, "color": obj.bombColor[1] });
                    break;
            }
            var ratio = (obj.blastTurn - Game.turn) / (Game.fps * obj.blastTime);
            var angle = (1 - ratio) * 2 * Math.PI;
            this.drawSector(layer, { "pos": obj.pos, "rad": obj.rad * 0.3, "color": Color.White, "CCWAngle": -Math.PI / 2, "CWAngle": -Math.PI / 2 + angle, "stroke": false });

            if (ratio > 0.5) {
                var oneShotLayer = this.findLayer("one-shot");
                this.drawSector(oneShotLayer, { "pos": obj.pos, "rad": obj.rad * 0.3, "color": Color.White, "CCWAngle": -Math.PI / 2, "CWAngle": -Math.PI / 2 + angle, "stroke": false });
            }
        }
        this.drawFuncUid = Visualizer.addFunc("panel", func, [this]);
    }

    removeBomb() {
        this.bombColor.splice(0, 1);
        if (this.bombColor.length === 0) {
            Visualizer.removeFunc("panel", this.drawFuncUid);
            this.blastTurn = null;
            this.bombColor = null;
            Game.score += 1;
            TimerPanel.lastNumber++;
        }
    }

    blast() {
        Visualizer.removeFunc("panel", this.drawFuncUid);
        this.blastTurn = null;
        this.bombColor = null;
        Visualizer.addMultiShotFunc(function(layer, ratio, obj) {
            if(ratio > 1) {console.trace();}
            this.drawCircle(layer, { "pos": obj.pos, "rad": obj.rad + ratio * 100, "color": Color.White });
        }, [this], 5);
        alert(`Time: ${(Game.turn/Game.fps).toFixed(2)}, Score:${Game.score}`);
    }

    update(dt, turn) {
        super.update();

        if (this.observers.length === 0) {
            this.color = Color.Black;

            // Invisible
            if (this.alreadyWatched) {
                // Refresh
                if (this.bombColor === null && Math.random() < this.possibility) { this.addBomb(turn); }
                this.alreadyWatched = false;
            }
        } else {
            var colors = this.observers.map(observer => observer.color);
            this.color = Color.add(colors);
            this.alreadyWatched = true;

            // Visible
            if (this.bombColor !== null && this.color === this.bombColor[0]) {
                this.removeBomb();
            }
        }
        if (this.blastTurn !== null && turn > this.blastTurn) {
            this.blast();
        }
    }
}