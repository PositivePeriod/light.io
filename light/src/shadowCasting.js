import { Visualizer } from "./system/visualizer.js";
import { KeyboardManager, MouseManager } from "./util/inputManager.js";
import { MovableObject } from "./entity/movableObject.js";
import { RigidBackground } from "./entity/mapObject/rigidBg.js";
import { OrthogonalVector, PolarVector } from "./util/vector.js";
import { VisibilityLine, segmentInFrontOf } from "./util/line.js";
import { ObjectSystem } from "./system/objectSystem.js"

import { mapData } from "./data/map2.js"
import { AtLeastPanel } from "./entity/mapObject/panel.js";
import { Color } from "./util/color.js";

export class Game {
    constructor() {
        this.fps = 10;
        this.dt = 1 / this.fps;
        this.initGameSize();
        this.initGameObjects();
        setInterval(this.update.bind(this), Math.round(1000 / this.fps));
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
                        var color = moverColor[moverCounter++];
                        var mover = new MovableObject(posX, posY, keyboard, mouse)
                        mover.makeShape("Circle", { "rad": this.gridSize * 0.2, "color": color });
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
        console.log(ObjectSystem.objects);
        ObjectSystem.find("GameObject").forEach(obj => { obj.draw(); })
        Visualizer.initDraw();
    }

    update() {
        var movers = ObjectSystem.find("MovableObject");
        var maps = ObjectSystem.find("MapObject");

        movers.forEach(mover => { mover.update(this.dt); });
        var staticWalls = this.getStaticWalls();
        movers.forEach(mover => {
            var dynamicWalls = this.getDynamicWalls(mover.pos);
            mover.polygon = this.rayTracing(mover.pos, [...staticWalls, ...dynamicWalls]);
        })
        maps.forEach(map => { map.update(); });
        Visualizer.draw();
    }

    getStaticWalls() {
        var walls = [];
        ObjectSystem.find("GameObject").forEach(obj => {
            if (obj.opaque) {
                switch (obj.shape) {
                    case "Rect":
                        var p1 = new OrthogonalVector(obj.pos.x - obj.width / 2, obj.pos.y - obj.height / 2);
                        var p2 = new OrthogonalVector(obj.pos.x - obj.width / 2, obj.pos.y + obj.height / 2);
                        var p3 = new OrthogonalVector(obj.pos.x + obj.width / 2, obj.pos.y - obj.height / 2);
                        var p4 = new OrthogonalVector(obj.pos.x + obj.width / 2, obj.pos.y + obj.height / 2);
                        walls.push(...[new VisibilityLine(p1, p3), new VisibilityLine(p1, p2), new VisibilityLine(p3, p4), new VisibilityLine(p2, p4)]);
                        break;
                    default:
                        break;
                }
            }
        })
        // var p1 = new OrthogonalVector(Visualizer.stageWidth / 2 - 100, Visualizer.stageHeight / 2 - 100);
        // var p2 = new OrthogonalVector(Visualizer.stageWidth / 2 + 100, Visualizer.stageHeight / 2 + 100);
        // walls.push(new VisibilityLine(p1, p2));
        return walls
    }

    getDynamicWalls(center) {
        var walls = [];
        ObjectSystem.find("GameObject").forEach(obj => {
            if (obj.opaque) {
                switch (obj.shape) {
                    case "Circle":
                        var dPos = center.minus(obj.pos);
                        var angle = Math.acos(obj.rad / dPos.r);
                        var p1 = obj.pos.add(new PolarVector(obj.rad, dPos.theta + angle));
                        var p2 = obj.pos.add(new PolarVector(obj.rad, dPos.theta - angle));
                        walls.push(new VisibilityLine(p1, p2));
                    default:
                        break;
                }
            }
        })
        return walls
    }

    rayTracing(center, walls) {
        var endPoints = [];
        walls.forEach(wall => {
            wall.setCenter(center);
            endPoints.push(wall.p1, wall.p2);
        })

        var endPointCompare = (p1, p2) => {
            if (p1.centeredTheta > p2.centeredTheta) return 1;
            if (p1.centeredTheta < p2.centeredTheta) return -1;
            if (!p1.beginLine && p2.beginLine) return 1;
            if (p1.beginLine && !p2.beginLine) return -1;
            return 0;
        }
        endPoints.sort(endPointCompare);

        let openSegments = [];
        let output = [];
        let beginAngle = 0;

        for (let pass = 0; pass < 2; pass += 1) {
            for (let i = 0; i < endPoints.length; i += 1) {
                let endpoint = endPoints[i];
                let openSegment = openSegments[0];

                if (endpoint.beginLine) {
                    var segment = openSegments.find(segment => { return !segment || !segmentInFrontOf(endpoint.line, segment, center) });

                    // push
                    if (!segment) {
                        openSegments.push(endpoint.line);
                    } else {
                        var index = openSegments.indexOf(segment);
                        openSegments.splice(index, 0, endpoint.line);
                    }
                } else {
                    // remove
                    var index = openSegments.indexOf(endpoint.line)
                    if (index > -1) openSegments.splice(index, 1);
                }

                if (openSegment !== openSegments[0]) {
                    if (pass === 1) {
                        var trianglePoints = openSegment.getTriPoints(center, beginAngle, endpoint.centeredTheta);
                        output.push(trianglePoints);
                    }
                    beginAngle = endpoint.centeredTheta;
                }
            }
        }
        return output
    }
}