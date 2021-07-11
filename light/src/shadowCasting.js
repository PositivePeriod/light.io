import { Visualizer } from "./util/visualizer.js";
import { KeyboardManager, MouseManager } from "./util/inputManager.js";
import { MovableObject } from "./entity/movableObject.js";
import { GameObject } from "./entity/gameObject.js";
import { RigidBackground } from "./entity/mapObject/rigidBg.js";
import { OrthogonalVector, Line, getTrianglePoints, segmentInFrontOf } from "./util/vector.js";

import { mapData } from "./data/map1.js"
import { AtLeastPanel } from "./entity/mapObject/panel.js";

export class Game {
    constructor() {
        this.fps = 10;
        this.dt = 1 / this.fps;

        this.visualizer = new Visualizer();
        this.initGameObjects();
        setInterval(this.update.bind(this), Math.round(1000 / this.fps));
    }

    initGameObjects() {
        var stageWidth = this.visualizer.stageWidth;
        var stageHeight = this.visualizer.stageHeight;
        this.mapWidth = mapData.width;
        this.mapHeight = mapData.height;
        this.gridSize = Math.min(stageWidth / this.mapWidth, stageHeight / this.mapHeight) * 0.6;
        this.startX = (stageWidth - this.gridSize * this.mapWidth) / 2;
        this.startY = (stageHeight - this.gridSize * this.mapHeight) / 2;

        var playerColor = ["hsl(0, 100%, 50%)", "hsl(120, 100%, 50%)", "hsl(240, 100%, 50%)"];
        var playerCounter = 0;

        for (let x = 0; x < this.mapWidth; x++) {
            for (let y = 0; y < this.mapHeight; y++) {
                var blockType = mapData.map[y][x].slice(0, 1);
                var posX = this.startX + this.gridSize * (x + 0.5);
                var posY = this.startY + this.gridSize * (y + 0.5);
                switch (blockType) {
                    case "W":
                        var block = new RigidBackground(0, 0).makeShape("Rect", { "x": posX, "y": posY, "width": this.gridSize, "height": this.gridSize, "color": "#000000" });
                        GameObject.system.add(block);
                        break;
                    case "S":
                        this.keyboard = new KeyboardManager();
                        this.mouse = new MouseManager();
                        var color = playerColor[playerCounter];
                        playerCounter += 1;
                        var player = new MovableObject(posX, posY, this.keyboard, this.mouse).makeShape("Circle", { "rad": this.gridSize * 0.2, "color": color });
                        GameObject.system.add(player);
                        break;
                    case "P":
                        var panel = new AtLeastPanel(posX, posY).makeShape("Rect", { "width": this.gridSize * 0.2, "height": this.gridSize * 0.2, "color": "#000000" });
                        GameObject.system.add(panel);
                        break;
                    case "F":
                        break;
                    case "B":
                    default:
                        break;
                }
            }
        }
    }

    update() {
        var movers = GameObject.system.find("MovableObject");
        var maps = GameObject.system.find("MapObject");

        movers.forEach(mover => { mover.update(this.dt); });
        var walls = this.getWalls();
        movers.forEach(mover => {
            mover.polygon = this.rayTracing(mover.pos, walls);
        })
        maps.forEach(map => { map.update(); });


        this.visualizer.clearWhole();
        movers.forEach(mover => { this.visualizer.drawVisibility(mover); })
        this.visualizer.draw(false);
    }

    getWalls() {
        var walls = [];
        GameObject.system.find("MapObject").forEach(obj => {
            if (!(obj instanceof AtLeastPanel)) {
                var p1 = new OrthogonalVector(obj.pos.x - obj.width / 2, obj.pos.y - obj.height / 2);
                var p2 = new OrthogonalVector(obj.pos.x - obj.width / 2, obj.pos.y + obj.height / 2);
                var p3 = new OrthogonalVector(obj.pos.x + obj.width / 2, obj.pos.y - obj.height / 2);
                var p4 = new OrthogonalVector(obj.pos.x + obj.width / 2, obj.pos.y + obj.height / 2);
                walls.push(...[new Line(p1, p3), new Line(p1, p2), new Line(p3, p4), new Line(p2, p4)]);
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
            if (!p1.beginSegment && p2.beginSegment) return 1;
            if (p1.beginSegment && !p2.beginSegment) return -1;
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

                if (endpoint.beginSegment) {
                    var segment = openSegments.find(segment => { return !segment || !segmentInFrontOf(endpoint.segment, segment, center) });

                    // push
                    if (!segment) {
                        openSegments.push(endpoint.segment);
                    } else {
                        var index = openSegments.indexOf(segment);
                        openSegments.splice(index, 0, endpoint.segment);
                    }
                } else {
                    // remove
                    var index = openSegments.indexOf(endpoint.segment)
                    if (index > -1) openSegments.splice(index, 1);
                }

                if (openSegment !== openSegments[0]) {
                    if (pass === 1) {
                        var trianglePoints = getTrianglePoints(center, beginAngle, endpoint.centeredTheta, openSegment);
                        output.push(trianglePoints);
                    }
                    beginAngle = endpoint.centeredTheta;
                }
            }
        }
        return output
    }
}