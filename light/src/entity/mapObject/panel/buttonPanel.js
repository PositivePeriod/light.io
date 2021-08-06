import { ObjectSystem } from "../../../system/objectSystem.js";
import { Visualizer } from "../../../system/visualizer.js";
import { Color } from "../../../util/color.js";
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