import { Angle, OrthogonalVector, PolarVector } from "./util/vector.js";
import { Line, ShadowLine } from "./util/line.js";
import { InputManager } from "./util/inputManager.js";
import { Color } from "./util/color.js";

import { Visualizer } from "./system/visualizer.js";
import { ObjectSystem } from "./system/objectSystem.js"
import { Shadow } from "./system/shadow.js";

import { mapData as mapIntro } from "./data/mapIntro.js"
// import { mapData as mapMain } from "./data/mapMain2.js"
import { mapData as mapMain } from "./data/stage/map1-3.js"

import { BouncyBackground } from "./entity/mapObject/bouncyBg.js";
import { MovingBackground, Particle } from "./entity/mapObject/movingBg.js";
import { RigidBackground } from "./entity/mapObject/rigidBg.js";
import { MovableObject } from "./entity/movableObject.js";
import { PositivePanel } from "./entity/mapObject/panel/positivePanel.js";
import { NegativePanel } from "./entity/mapObject/panel/negativePanel.js";
import { UncertainPanel } from "./entity/mapObject/panel/uncertainPanel.js";
import { TimerPanel } from "./entity/mapObject/panel/timerPanel.js";
import { ButtonPanel, ColorDoorPanel, StartPanel } from "./entity/mapObject/panel/buttonPanel.js";

var object = {
    "RB": RigidBackground,
    "BB": BouncyBackground,
    "MB": MovingBackground,

    "MO": MovableObject,

    "PP": PositivePanel,
    "NP": NegativePanel,
    "UP": UncertainPanel,
    "TP": TimerPanel,
    "BP": ButtonPanel,
    "SP": StartPanel,
    "CP": ColorDoorPanel,
};

export const OBJECT = Object.freeze(new Map(Object.entries(object)));



export class Game {
    // static fps = 10;
    static fps = 20;
    static dt = 1 / this.fps;
    static score = 0;

    constructor() {
        this.resetData = new Map();

        this.input = new InputManager();
        this.input.keyboard.listen("KeyO", this.addGameObject.bind(this));

        var drawFunc = function(layer, pos) { this.drawText(layer, new OrthogonalVector(50, 50), `MouseDown : ${pos.x}, ${pos.y}`, { "color": Color.White, 'size': 20 }); };
        this.input.mouse.listen('mousedown', function(pos) { Visualizer.addFunc("one-shot", drawFunc, [pos]); });

        this.input.activate();
        Visualizer.activate();

        this.initGameObjects(mapIntro);
        Visualizer.drawReset();

        setInterval(this.update.bind(this), Math.round(1000 / Game.fps));
    }

    reset() {
        ObjectSystem.reset();
        Shadow.reset();
        Visualizer.reset();
        this.initGameObjects(mapMain);

        Game.score = 0;
        // Game.time = 0;
        Game.maxTime = 0;
        Game.averageTime = 0;
        Game.turn = 0;
    }

    initGameObjects(mapData) {
        this.grid = Visualizer.getGrid(mapData.width, mapData.height);

        this.moverColor = [Color.Red, Color.Green, Color.Blue];
        this.panelType = { "P": PositivePanel, "N": NegativePanel, "U": UncertainPanel, "T": TimerPanel, "t": ButtonPanel, "s": StartPanel };
        this.moverCounter = 0;
        this.panelCounter = 0;
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
                        obj.makeShape("Circle", { "rad": this.grid.size * 0.1, "color": Color.Black });
                        break;
                    case "j": // Particle
                    case "k":
                    case "l":
                        var particleType = { "j": 1, "k": 2, "l": 3 };
                        obj = new Particle(posX, posY, particleType[blockType]);
                        obj.makeShape("Circle", { "rad": this.grid.size * 0.1, "color": Color.Black });
                        break;
                    case "M": // Mover
                        var option = mapData.object[mapData.map[y][x]] || {};
                        if (option.color) {
                            if (mapData.name === "mapMain") {
                                if (!this.resetData.get('PossibleMoverColor').includes(option.color)) { break; }
                            }
                            option.color = Color.findName(option.color);
                        }
                        obj = new MovableObject(posX, posY, this.moverCounter, option);
                        // var color = this.moverColor[this.moverCounter % this.moverColor.length]
                        obj.makeShape("Circle", { "rad": this.grid.size * 0.2 });
                        this.input.keyboard.listen(`Digit${++this.moverCounter}`, obj.input.toggle.bind(obj.input));

                        // obj.input.deactivate();
                        // var func = function(obj) {
                        //     ObjectSystem.find("MovableObject").forEach(mover => {
                        //         if (mover.id !== this.id) { mover.input.deactivate(); } else { mover.input.activate(); }
                        //     })
                        // }
                        // this.input.keyboard.listen(`Digit${++this.moverCounter}`, func.bind(obj));
                        switch (obj.moverID) {
                            case 0:
                                obj.movingKey = {
                                    "KeyW": { x: 0, y: -1 },
                                    "KeyA": { x: -1, y: 0 },
                                    "KeyS": { x: 0, y: 1 },
                                    "KeyD": { x: 1, y: 0 }
                                }
                                break;
                            case 1:
                                obj.movingKey = {
                                    "KeyT": { x: 0, y: -1 },
                                    "KeyF": { x: -1, y: 0 },
                                    "KeyG": { x: 0, y: 1 },
                                    "KeyH": { x: 1, y: 0 }
                                }
                                break;
                            case 2:
                                obj.movingKey = {
                                    "KeyI": { x: 0, y: -1 },
                                    "KeyJ": { x: -1, y: 0 },
                                    "KeyK": { x: 0, y: 1 },
                                    "KeyL": { x: 1, y: 0 }
                                }
                                break;
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
                    case "T": // TimerPanel
                        var a = this.resetData.get('PossibleMoverColor');
                        var b;
                        if (a.length === 1) {
                            b = [Color.findName(a[0])];
                        } else if (a.length === 2) {
                            b = [Color.findName(a[0]), Color.findName(a[1])];
                            b.push(Color.add(b));
                        } else {
                            b = [Color.White, Color.Red, Color.Green, Color.Blue, Color.Yellow, Color.Magenta, Color.Cyan];
                        }
                        obj = new this.panelType[blockType](posX, posY, b);
                        obj.makeShape("Circle", { "rad": this.grid.size * 0.2 });
                        break;
                    case "t": // ButtonPanel
                        var color = this.moverColor[this.panelCounter++ % this.moverColor.length];
                        obj = new this.panelType[blockType](posX, posY, color);
                        var size = this.grid.size * 0.5;
                        obj.makeShape("Rect", { "width": size, "height": size });
                        this.resetData.set('ButtonPanel' + color.name, obj);
                        break;
                    case "s": // StartPanel
                        var func = function() {
                            var colorString = ['Red', 'Green', 'Blue'];
                            this.resetData.set('PossibleMoverColor', []);
                            var flag = false;
                            colorString.forEach(color => {
                                var beChoosed = this.resetData.get('ButtonPanel' + color).on;
                                if (beChoosed) {
                                    this.resetData.get('PossibleMoverColor').push(color);
                                    flag = true;
                                }
                            })
                            if (flag) { this.reset(); }
                        }.bind(this);
                        obj = new this.panelType[blockType](posX, posY, func);
                        var size = this.grid.size * 0.5;
                        obj.makeShape("Rect", { "width": size, "height": size });
                        break;
                    case "C":
                        var option = mapData.object[mapData.map[y][x]] || {};
                        var color = Color.findName(option.color);
                        obj = new ColorDoorPanel(posX, posY, color);
                        var size = this.grid.size;
                        obj.makeShape("Rect", { "width": size, "height": size });
                        break;
                    case " ": // Empty Background
                        break;
                    case "L": // Line
                        var layer = Visualizer.findLayer("static");
                        var p1, p2;
                        Visualizer.addWalls(layer, [new Line(p1, p2, false)]);
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
                                            new ShadowLine(p1, p3, 'line'),
                                            new ShadowLine(p1, p2, 'line'),
                                            new ShadowLine(p3, p4, 'line'),
                                            new ShadowLine(p2, p4, 'line')
                                        ]);
                                    }
                                    Shadow.addFunc("dynamic", func, [obj]);
                                } else {
                                    Shadow.addWalls("static", [
                                        new ShadowLine(p1, p3, 'line'),
                                        new ShadowLine(p1, p2, 'line'),
                                        new ShadowLine(p3, p4, 'line'),
                                        new ShadowLine(p2, p4, 'line')
                                    ]);
                                }
                                break;
                            case "Circle":
                                var func = function(group, mover, obj) {
                                    var dPos = mover.pos.minus(obj.pos);
                                    var angle = Math.acos(obj.rad / dPos.r);
                                    var p1 = obj.pos.add(new PolarVector(obj.rad, dPos.theta + angle));
                                    var p2 = obj.pos.add(new PolarVector(obj.rad, dPos.theta - angle));
                                    var param = { "pos": obj.pos, "rad": obj.rad };
                                    var line = new ShadowLine(p1, p2, 'arc', param);
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
            case "j": // Particle
            case "k":
            case "l":
                var particleType = { "j": 1, "k": 2, "l": 3 };
                obj = new Particle(posX, posY, particleType[blockType]);
                obj.makeShape("Circle", { "rad": this.grid.size * 0.1, "color": Color.Black });
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
                Shadow.addWalls(Shadow.findGroup("static"), [new Line(p1, p2, false)]);
                break;
            default:
                console.log("Unknown block type: " + blockType);
                return;
        }
        if (obj) {

        }
    }

    update() {
        Game.time = Date.now();

        var movers = ObjectSystem.find("MovableObject");
        var maps = ObjectSystem.find("MapObject");
        maps.forEach(map => { map.update(Game.dt, Game.turn); });
        movers.forEach(mover => { mover.update(Game.dt, Game.turn); });
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
        if (this.turn > this.fps) { this.maxTime = Math.max(time, this.maxTime); } // Start after roughly 1s
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