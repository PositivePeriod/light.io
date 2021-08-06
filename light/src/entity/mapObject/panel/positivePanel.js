import { Panel } from "./panel.js";

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