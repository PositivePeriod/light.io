import { Panel } from "./panel.js";

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
                    new Line(p1, p3, false),
                    new Line(p1, p2, false),
                    new Line(p3, p4, false),
                    new Line(p2, p4, false)
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