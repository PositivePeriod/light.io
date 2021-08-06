import { Game } from "../../../game.js";
import { Visualizer } from "../../../system/visualizer.js";
import { Color } from "../../../util/color.js";
import { Panel } from "./panel.js";
export class TimerPanel extends Panel {
    static lastNumber = 3;
    constructor(x, y, color) {
        super(x, y);
        this.type.push("TimerPanel");

        this.possibility = 0.2;
        this.alreadyWatched = false;

        this.drawFuncUid = null;
        this.blastTime = 8;
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