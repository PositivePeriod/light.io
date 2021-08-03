import { Visualizer } from "./system/visualizer.js";
import { InputManager } from "./util/inputManager.js";
import { MovableObject } from "./entity/movableObject.js";
import { RigidBackground } from "./entity/mapObject/rigidBg.js";
import { Angle, OrthogonalVector, PolarVector } from "./util/vector.js";
import { VisibilitySegment } from "./util/line.js";
import { ObjectSystem } from "./system/objectSystem.js"

import { mapData } from "./data/map-1.js"
import { NegativePanel, PositivePanel, TimeAttackPanel, UncertainPanel } from "./entity/mapObject/panel.js";
import { Color } from "./util/color.js";
import { Shadow } from "./system/shadow.js";
import { BouncyBackground } from "./entity/mapObject/bouncyBg.js";
import { MovingBackground } from "./entity/mapObject/movingBg.js";

export class Game {
    static fps = 20;
    static dt = 1 / this.fps;
    static score = 0;

    constructor() {
        this.input = new InputManager();
        this.input.keyboard.listen("KeyG", this.addGameObject.bind(this));
        this.input.activate();

        this.initGameObjects();
        // this.initShadowNVisualizer();
        Visualizer.initDraw();

        setInterval(this.update.bind(this), Math.round(1000 / Game.fps));
    }
    initGameObjects() {
        this.grid = Visualizer.getGrid(mapData.width, mapData.height);

        this.moverColor = [Color.Red, Color.Blue, Color.Green];
        this.panelType = { "P": PositivePanel, "N": NegativePanel, "U": UncertainPanel, "T": TimeAttackPanel };
        this.moverCounter = 0;
        for (let x = 0; x < mapData.width; x++) {
            for (let y = 0; y < mapData.height; y++) {
                var blockType = mapData.map[y][x].slice(0, 1);
                var posX = this.grid.startX + this.grid.size * (x + 0.5);
                var posY = this.grid.startY + this.grid.size * (y + 0.5);
                var obj = null;
                switch (blockType) {
                    case "R": // RigidBg
                        obj = new RigidBackground(posX, posY);
                        obj.makeShape("Rect", { "width": this.grid.size, "height": this.grid.size, "color": Color.Black });
                        break;
                    case "r": // RigidBg
                        obj = new RigidBackground(posX, posY);
                        obj.makeShape("Circle", { "rad": this.grid.size * 0.5, "color": Color.Black });
                        break;
                    case "B": // BouncyBg
                        obj = new BouncyBackground(posX, posY, 90000);
                        obj.makeShape("Rect", { "width": this.grid.size, "height": this.grid.size, "color": Color.Black });
                        break;
                    case "b": // BouncyBg
                        obj = new BouncyBackground(posX, posY, 60000);
                        obj.makeShape("Circle", { "rad": this.grid.size * 0.5, "color": Color.Black });
                        break;
                    case "m": // MovingBg
                        obj = new MovingBackground(posX, posY, 60000);
                        obj.makeShape("Rect", { "width": this.grid.size, "height": this.grid.size, "color": Color.Black });
                        break;
                    case "c": // MovingBg
                        obj = new MovingBackground(posX, posY, 150000);
                        obj.makeShape("Circle", { "rad": this.grid.size * 0.1, "height": this.grid.size, "color": Color.Black });
                        break;
                    case "M": // Mover
                        obj = new MovableObject(posX, posY, this.moverCounter);
                        var color = this.moverColor[this.moverCounter % this.moverColor.length]
                        obj.makeShape("Circle", { "rad": this.grid.size * 0.2, "color": color });
                        this.input.keyboard.listen(`Digit${++this.moverCounter}`, obj.input.toggle.bind(obj.input));

                        // obj.input.deactivate();
                        // var func = function(obj) {
                        //     ObjectSystem.find("MovableObject").forEach(mover => {
                        //         if (mover.id !== this.id) { mover.input.deactivate(); } else { mover.input.activate(); }
                        //     })
                        // }
                        // this.input.keyboard.listen(`Digit${++this.moverCounter}`, func.bind(obj));
                        if (obj.id === 1) {
                            obj.movingKey = {
                                "KeyI": { x: 0, y: -1 },
                                "KeyJ": { x: -1, y: 0 },
                                "KeyK": { x: 0, y: 1 },
                                "KeyL": { x: 1, y: 0 }
                            }
                        }

                        break;
                    case "P": // PositivePanel
                    case "N": // NegativePanel
                        obj = new this.panelType[blockType](posX, posY);
                        obj.makeShape("Rect", { "width": this.grid.size * 0.2, "height": this.grid.size * 0.2 });
                        break;
                    case "U": // UncertainPanel
                        obj = new this.panelType[blockType](posX, posY);
                        var size = this.grid.size;
                        obj.makeShape("Rect", { "width": size, "height": size });
                        break;
                    case "T": // TimeAttackPanel
                        obj = new this.panelType[blockType](posX, posY);
                        obj.makeShape("Circle", { "rad": this.grid.size * 0.2 });
                        break;
                    case "C": // Circle
                        obj = new RigidBackground(posX, posY);
                        obj.makeShape("Circle", { "rad": this.grid.size * 0.5, "color": Color.Black });
                        break;
                    case " ": // Empty Background
                        break;
                    case "L": // Line
                        var layer = Visualizer.findLayer("static");
                        var p1, p2;
                        Visualizer.addWalls(layer, [new VisibilitySegment(p1, p2)]);
                        break;
                    default:
                        break;
                }
                if (obj) {
                    ObjectSystem.add(obj);
                    if (obj.opaque) {
                        switch (obj.shape) {
                            case "Rect":
                                var p1 = new OrthogonalVector(obj.pos.x - obj.width / 2, obj.pos.y - obj.height / 2);
                                var p2 = new OrthogonalVector(obj.pos.x - obj.width / 2, obj.pos.y + obj.height / 2);
                                var p3 = new OrthogonalVector(obj.pos.x + obj.width / 2, obj.pos.y - obj.height / 2);
                                var p4 = new OrthogonalVector(obj.pos.x + obj.width / 2, obj.pos.y + obj.height / 2);
                                if (obj instanceof MovingBackground) {
                                    var func = function(group, mover, obj) {
                                        var p1 = new OrthogonalVector(obj.pos.x - obj.width / 2, obj.pos.y - obj.height / 2);
                                        var p2 = new OrthogonalVector(obj.pos.x - obj.width / 2, obj.pos.y + obj.height / 2);
                                        var p3 = new OrthogonalVector(obj.pos.x + obj.width / 2, obj.pos.y - obj.height / 2);
                                        var p4 = new OrthogonalVector(obj.pos.x + obj.width / 2, obj.pos.y + obj.height / 2);
                                        this.addWalls("dynamic", [
                                            new VisibilitySegment(p1, p3),
                                            new VisibilitySegment(p1, p2),
                                            new VisibilitySegment(p3, p4),
                                            new VisibilitySegment(p2, p4)
                                        ]);
                                    }
                                    Shadow.addFunc("dynamic", func, [obj]);
                                } else {
                                    Shadow.addWalls("static", [
                                        new VisibilitySegment(p1, p3), new VisibilitySegment(p1, p2),
                                        new VisibilitySegment(p3, p4), new VisibilitySegment(p2, p4)
                                    ]);
                                }
                                break;
                            case "Circle":
                                var func = function(group, mover, obj) {
                                    var dPos = mover.pos.minus(obj.pos);
                                    var angle = Math.acos(obj.rad / dPos.r);
                                    var p1 = obj.pos.add(new PolarVector(obj.rad, dPos.theta + angle));
                                    var p2 = obj.pos.add(new PolarVector(obj.rad, dPos.theta - angle));
                                    var line = new VisibilitySegment(p1, p2);
                                    var angle1 = dPos.theta + angle;
                                    var angle2 = dPos.theta - angle;
                                    if (Angle.isBetween(angle1, dPos.theta, angle2)) {
                                        line.setProp(mover, "CCW", angle1);
                                        line.setProp(mover, "CW", angle2);
                                    } else {
                                        line.setProp(mover, "CCW", angle2);
                                        line.setProp(mover, "CW", angle1);
                                    }
                                    line.obj = obj;
                                    this.addWalls("dynamic", [line]);
                                }
                                Shadow.addFunc("dynamic", func, [obj]);
                                break;
                            default:
                                break;
                        }
                    }
                    obj.draw(); // TODO
                }
            }
        }
    }

    async addGameObject() {
        var blockType = window.prompt("message", "default");
        var point = await this.input.mouse.waitMouseUp();
        var downPos = point.downPos;
        var upPos = point.upPos;
        var posX = (downPos.x + upPos.x) / 2;
        var posY = (downPos.y + upPos.y) / 2;
        var width = Math.abs(upPos.x - downPos.x);
        var height = Math.abs(upPos.y - downPos.y);
        var rad = (width ** 2 + height ** 2) ** 0.5;
        var obj = null;
        switch (blockType) {
            case "R": // Wall
                obj = new RigidBackground(posX, posY);
                obj.makeShape("Rect", { "width": this.grid.size, "height": this.grid.size, "color": Color.Black });
                break;
            case "M": // Mover
                obj = new MovableObject(posX, posY, this.moverCounter);
                var color = this.moverColor[this.moverCounter % this.moverColor.length]
                obj.makeShape("Circle", { "rad": this.grid.size * 0.2, "color": color });
                this.input.keyboard.listen(`Digit${++this.moverCounter}`, obj.input.toggle.bind(obj.input));
                break;
            case "P": // PositivePanel
            case "N": // NegativePanel
            case "U": // UncertainPanel
                obj = new this.panelType[blockType](posX, posY);
                obj.makeShape("Rect", { "width": this.grid.size * 0.2, "height": this.grid.size * 0.2 });
                break;
            case "C": // Circle
                obj = new RigidBackground(posX, posY);
                obj.makeShape("Circle", { "rad": this.grid.size * 0.5, "color": Color.Black });
                break;
            case " ": // Background
                break;
            case "L": // Line
                var p1 = new OrthogonalVector(downPos.x, downPos.y);
                var p2 = new OrthogonalVector(upPos.x, upPos.y);
                Shadow.addWalls(Shadow.findGroup("static"), [new VisibilitySegment(p1, p2)]);
                break;
            default:
                console.log("Unknown block type: " + blockType);
                return;
        }
        if (obj) {
            ObjectSystem.add(obj);
            if (obj.opaque) {
                switch (obj.shape) {
                    case "Rect":
                        var p1 = new OrthogonalVector(obj.pos.x - obj.width / 2, obj.pos.y - obj.height / 2);
                        var p2 = new OrthogonalVector(obj.pos.x - obj.width / 2, obj.pos.y + obj.height / 2);
                        var p3 = new OrthogonalVector(obj.pos.x + obj.width / 2, obj.pos.y - obj.height / 2);
                        var p4 = new OrthogonalVector(obj.pos.x + obj.width / 2, obj.pos.y + obj.height / 2);
                        Shadow.addWalls("static", [
                            new VisibilitySegment(p1, p3),
                            new VisibilitySegment(p1, p2),
                            new VisibilitySegment(p3, p4),
                            new VisibilitySegment(p2, p4)
                        ]);
                        break;
                    case "Circle":
                        var func = (group, mover, obj) => {
                            var dPos = mover.pos.minus(obj.pos);
                            var angle = Math.acos(obj.rad / dPos.r);
                            var p1 = obj.pos.add(new PolarVector(obj.rad, dPos.theta + angle));
                            var p2 = obj.pos.add(new PolarVector(obj.rad, dPos.theta - angle));
                            var line = new VisibilitySegment(p1, p2);
                            var angle1 = dPos.theta + angle;
                            var angle2 = dPos.theta - angle;
                            if (Angle.isBetween(angle1, dPos.theta, angle2)) {
                                line.setProp(mover, "CCW", angle1);
                                line.setProp(mover, "CW", angle2);
                            } else {
                                line.setProp(mover, "CCW", angle2);
                                line.setProp(mover, "CW", angle1);
                            }
                            line.obj = obj;
                            group.push(line);
                        }
                        Shadow.addFunc("dynamic", func, [obj]);
                        break;
                    default:
                        break;
                }
            }
            obj.draw();
            Visualizer.initDraw();
        }
    }

    update() {
        Game.time = Date.now();

        var movers = ObjectSystem.find("MovableObject");
        var maps = ObjectSystem.find("MapObject");
        movers.forEach(mover => { mover.update(Game.dt, Game.turn); });
        maps.forEach(map => { map.update(Game.dt, Game.turn); });
        movers.forEach(mover => {
            var result = Shadow.calcVisiblility(mover);
            mover.visibleEdges = result.visibleEdges;
            mover.visibleArea = result.visibleArea;
        });
        Visualizer.draw();

        Game.checkFPS();
    }

    static checkFPS(log = false) {
        var time = Date.now() - this.time;
        if (time.turn > this.fps) { this.maxTime = Math.max(time, this.maxTime); } // Start after roughly 1s
        this.averageTime = (this.averageTime * this.turn + time) / (++this.turn);
        if (log && this.turn % (this.fps) === 0) { // iterate every roughly 1s
            console.clear();
            console.log("Turn :", this.turn);
            console.log("MinFPS :", (1000 / this.maxTime).toFixed(2));
            console.log("AverageFPS :", (1000 / this.averageTime).toFixed(2));
            console.log("CurrentFPS :", (1000 / time).toFixed(2));
        }
    }

    static time = 0;
    static maxTime = 0;
    static averageTime = 0;
    static turn = 0;
}