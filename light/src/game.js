import { Visualizer } from "./system/visualizer.js";
import { KeyboardManager, MouseManager } from "./util/inputManager.js";
import { MovableObject } from "./entity/movableObject.js";
import { RigidBackground } from "./entity/mapObject/rigidBg.js";
import { OrthogonalVector, PolarVector } from "./util/vector.js";
import { VisibilitySegment } from "./util/line.js";
import { ObjectSystem } from "./system/objectSystem.js"

import { mapData } from "./data/mapRandom.js"
import { AtLeastPanel } from "./entity/mapObject/panel.js";
import { Color } from "./util/color.js";
import { Shadow } from "./system/shadow.js";

export class Game {

    static fps = 15;

    constructor() {
        this.dt = 1 / Game.fps;
        this.initGameSize();
        this.initGameObjects();
        this.initShadowNVisualizer();
        Visualizer.initDraw();
        setInterval(this.update.bind(this), Math.round(1000 / Game.fps));
    }

    initGameSize() {
        var stageWidth = Visualizer.stageWidth;
        var stageHeight = Visualizer.stageHeight;
        this.mapWidth = mapData.width;
        this.mapHeight = mapData.height;
        this.gridSize = Math.min(stageWidth / this.mapWidth, stageHeight / this.mapHeight) * 0.6;
        this.startX = (stageWidth - this.gridSize * this.mapWidth) / 2;
        this.startY = (stageHeight - this.gridSize * this.mapHeight) / 2;
    }

    initGameObjects() {
        var moverColor = [Color.Red, Color.Blue, Color.Green];
        var moverCounter = 0;
        var keyboard = new KeyboardManager();
        var mouse = new MouseManager();
        for (let x = 0; x < this.mapWidth; x++) {
            for (let y = 0; y < this.mapHeight; y++) {
                var blockType = mapData.map[y][x].slice(0, 1);
                var posX = this.startX + this.gridSize * (x + 0.5);
                var posY = this.startY + this.gridSize * (y + 0.5);
                switch (blockType) {
                    case "W":
                        var wall = new RigidBackground(posX, posY)
                        wall.makeShape("Rect", { "width": this.gridSize, "height": this.gridSize, "color": Color.Black });
                        ObjectSystem.add(wall);
                        break;
                    case "M":
                        var mover = new MovableObject(posX, posY, keyboard, mouse, moverCounter)
                        mover.makeShape("Circle", { "rad": this.gridSize * 0.2, "color": moverColor[moverCounter++] });
                        ObjectSystem.add(mover);
                        break;
                    case "P":
                        var panel = new AtLeastPanel(posX, posY)
                        panel.makeShape("Rect", { "width": this.gridSize * 0.2, "height": this.gridSize * 0.2, "color": Color.Black });
                        ObjectSystem.add(panel);
                        break;
                    case "C":
                        var circle = new RigidBackground(posX, posY)
                        circle.makeShape("Circle", { "rad": this.gridSize * 0.5, "color": Color.Black });
                        ObjectSystem.add(circle);
                        break;
                    case "B": // Background
                        break;
                    default:
                        break;
                }
            }
        }
    }

    initShadowNVisualizer() {
        ObjectSystem.find("GameObject").forEach(obj => {
            if (obj.opaque) {
                switch (obj.shape) {
                    case "Rect":
                        var p1 = new OrthogonalVector(obj.pos.x - obj.width / 2, obj.pos.y - obj.height / 2);
                        var p2 = new OrthogonalVector(obj.pos.x - obj.width / 2, obj.pos.y + obj.height / 2);
                        var p3 = new OrthogonalVector(obj.pos.x + obj.width / 2, obj.pos.y - obj.height / 2);
                        var p4 = new OrthogonalVector(obj.pos.x + obj.width / 2, obj.pos.y + obj.height / 2);
                        Shadow.addWalls("static", [new VisibilitySegment(p1, p3), new VisibilitySegment(p1, p2), new VisibilitySegment(p3, p4), new VisibilitySegment(p2, p4)]);
                        break;
                    case "Circle":
                        var func = (group, mover, obj) => {
                            var dPos = mover.pos.minus(obj.pos);
                            var angle = Math.acos(obj.rad / dPos.r);
                            var p1 = obj.pos.add(new PolarVector(obj.rad, dPos.theta + angle));
                            var p2 = obj.pos.add(new PolarVector(obj.rad, dPos.theta - angle));
                            var line = new VisibilitySegment(p1, p2);
                            line.setProp(mover, "startAngle", dPos.theta + angle);
                            line.setProp(mover, "endAngle", dPos.theta - angle);
                            line.obj = obj;
                            group.push(line);
                        }
                        Shadow.addFunc("semi-static", func, [obj]);
                        break;
                    default:
                        break;
                }
            }
            obj.draw();
        })
        // var p1 = new OrthogonalVector(Visualizer.stageWidth / 2 - 100, Visualizer.stageHeight / 2 - 100);
        // var p2 = new OrthogonalVector(Visualizer.stageWidth / 2 + 100, Visualizer.stageHeight / 2 + 100);
    }

    update() {
        Game.time = Date.now();

        var movers = ObjectSystem.find("MovableObject");
        var maps = ObjectSystem.find("MapObject");
        movers.forEach(mover => { mover.update(this.dt); });
        maps.forEach(map => { map.update(); });
        movers.forEach(mover => {
            mover.visibleArea = Shadow.calcVisibleArea(mover);
        })
        Visualizer.draw();

        Game.checkFPS();
    }

    static checkFPS() {
        var fps = 1000 / (Date.now() - this.time);
        if (this.turn > this.fps) { this.minFPS = Math.min(this.minFPS, fps); }
        this.averageFPS = (this.averageFPS * this.turn + fps) / (++this.turn);
        if (this.turn % (this.fps) === 0) { // roughly 1s
            console.clear();
            console.log("MinFPS :", this.minFPS.toFixed(2));
            console.log("AverageFPS :", this.averageFPS.toFixed(2));
        }
    }

    static time = 0;
    static minFPS = Infinity
    static averageFPS = 0;
    static turn = 0;
}