import { Game } from "../game.js";
import { Color } from "../util/color.js";
import { UID } from "../util/uid.js";

// https://developer.mozilla.org/ko/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas

// Preprocess
function floor(x) { return x }

class Visualizer {
    constructor() {}

    activate() {
        this.layers = new Map(); // Custom offscreencanvas for better performance
        this.layersFunc = new Map();
        this.layersInfo = new Map();

        this.initMasterLayer();
        this.addLayer("static", { "drawReset": false, "funcReset": false });
        this.addLayer("visibleArea");
        this.addLayer("visibleEdge");
        this.addLayer("panel");
        this.addLayer("mover");
        this.addLayer("one-shot", { "drawReset": true, "funcReset": true });
        this.addLayer("multi-shot", { "drawReset": true, "funcReset": true });

        window.addEventListener("resize", this.resize.bind(this));
        this.resize();
    }

    reset() {
        window.removeEventListener("resize", this.resize.bind(this));
        this.master.canvas.remove();
        this.activate();
    }

    initMasterLayer() {
        var canvas = document.createElement("canvas");
        document.body.appendChild(canvas);
        var ctx = canvas.getContext("2d");
        this.master = { "canvas": canvas, "ctx": ctx };
    }

    addMultiShotFunc(func, arg, time) {
        // time in second
        var lastTurn = Game.turn + time * Game.fps;
        var dTurn = time * Game.fps;
        arg.splice(0, 0, lastTurn, dTurn);
        return this.addFunc("multi-shot", func, arg);
    }

    addFunc(name, func, arg) {
        var uid = UID.get();
        this.layersFunc.get(name).set(uid, { "func": func, "arg": arg || [] });
        this.drawReset(name);
        return uid
    }

    removeFunc(name, uid) {
        if (!this.layersFunc.get(name).delete(uid)) {
            console.warn("Fail to remove func;", uid);
        }
        this.drawReset(name);
    }

    addLayer(name, option) {
        var canvas = document.createElement("canvas");
        // canvas.setAttribute("id", name);
        // document.body.appendChild(canvas);
        var ctx = canvas.getContext("2d");
        this.layers.set(name, { "canvas": canvas, "ctx": ctx });
        this.layersInfo.set(name, option ? option : { "drawReset": true, "funcReset": false });
        this.layersFunc.set(name, new Map());
    }

    findLayer(name) {
        if (!this.layers.has(name)) { this.addLayer(name); }
        return this.layers.get(name);
    }

    resetLayer(name, layer) {
        var layer = layer || this.findLayer(name);
        layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
    }

    resize() {
        // var pixelRatio = window.devicePixelRatio;
        var pixelRatio = 1;
        this.stageWidth = window.innerWidth * pixelRatio;
        this.stageHeight = window.innerHeight * pixelRatio;
        this.master.canvas.width = this.stageWidth;
        this.master.canvas.height = this.stageHeight;
        this.master.ctx.scale(pixelRatio, pixelRatio);
        this.layers.forEach(layer => {
            layer.canvas.width = this.stageWidth;
            layer.canvas.height = this.stageHeight;
            layer.ctx.scale(pixelRatio, pixelRatio);
        })
        this.drawReset(); // TODO is it right?
    }

    getGrid(mapWidth, mapHeight) {
        var size = Math.min(this.stageWidth / mapWidth, this.stageHeight / mapHeight) * 1;
        var startX = (this.stageWidth - size * mapWidth) / 2;
        var startY = (this.stageHeight - size * mapHeight) / 2;
        return { "size": size, "startX": startX, "startY": startY }
    }

    drawReset(name) {
        var layers = name ? [name] : Array.from(this.layers.keys());
        layers.forEach(name => {
            if (!this.layersInfo.get(name).drawReset) {
                var layer = this.findLayer(name);
                var funcs = this.layersFunc.get(name);
                this.resetLayer(name, layer);
                funcs.forEach(input => { input.func.bind(this)(layer, ...input.arg); })
            }
        });
    }

    draw() {
        this.resetLayer("master", this.master);
        this.master.ctx.save();
        this.master.ctx.fillStyle = "black";
        this.master.ctx.fillRect(0, 0, this.master.canvas.width, this.master.canvas.height);
        this.master.ctx.restore();
        ['visibleArea', 'static', 'visibleEdge', 'panel', 'mover', 'one-shot', 'multi-shot'].forEach(name => {
            // Array.from(this.layers.keys()).forEach(name => {
            var layer = this.findLayer(name);
            var info = this.layersInfo.get(name);
            var funcs = this.layersFunc.get(name);
            if (info.drawReset) {
                this.resetLayer(name, layer);
                switch (name) {
                    case "mover":
                        layer.ctx.save();
                        layer.ctx.globalCompositeOperation = "screen";
                        funcs.forEach(input => { input.func.bind(this)(layer, ...input.arg); })
                        layer.ctx.restore();
                        break;
                        // case "panel":
                        //     var canvas = document.createElement("canvas");
                        //     var ctx = canvas.getContext("2d");
                        //     var pseudoLayer = { "canvas": canvas, "ctx": ctx };
                        //     pseudoLayer.canvas.width = this.stageWidth * this.pixelRatio;
                        //     pseudoLayer.canvas.height = this.stageHeight * this.pixelRatio;
                        //     pseudoLayer.ctx.scale(this.pixelRatio, this.pixelRatio);
                        //     ObjectSystem.find("MovableObject").forEach(mover => { this.drawPolygon(pseudoLayer, mover.visibleArea.vertices, { "color": Color.Gray }); })

                        //     layer.ctx.save();
                        //     funcs.forEach(input => { input.func.bind(this)(layer, ...input.arg); })
                        //     layer.ctx.globalCompositeOperation = "destination-in";
                        //     layer.ctx.drawImage(pseudoLayer.canvas, 0, 0);
                        //     layer.ctx.restore();
                        //     break;
                    case "multi-shot":
                        funcs.forEach(input => {
                            var ratio = 1 - (input.arg[0] - Game.turn) / input.arg[1];
                            var newArg = input.arg.slice(2);
                            input.func.bind(this)(layer, ratio, ...newArg);
                        })
                        break;
                    default:
                        funcs.forEach(input => { input.func.bind(this)(layer, ...input.arg); })
                        break;
                }
            }
            if (info.funcReset) {
                switch (name) {
                    case "multi-shot":
                        var nextFunc = new Map();
                        this.layersFunc.get(name).forEach((input, index) => {
                            if (input.arg && input.arg[0] > Game.turn) { nextFunc.set(index, input); }
                        });
                        this.layersFunc.set(name, nextFunc);
                        break;
                    default:
                        this.layersFunc.set(name, new Map());
                        break;
                }
            }
            switch (name) {
                case "visibleEdge":
                    this.master.ctx.save();
                    // this.master.ctx.globalCompositeOperation = "screen";
                    this.master.ctx.drawImage(layer.canvas, 0, 0);
                    this.master.ctx.restore();
                    break;
                default:
                    this.master.ctx.drawImage(layer.canvas, 0, 0);
                    break;
            }
        });
    }

    drawObject(layer, obj) {
        if (!obj.shape) { return }
        switch (obj.shape) {
            case "Rect":
            case "Circle":
            case "Donut":
            case "Tri":
                this["draw" + obj.shape](layer, obj);
                break;
            case "Hex":
                obj.pseudoObjects.forEach(object => { this.drawObject(layer, object) });
                break;
            default:
                console.error("Impossible object shape; ", obj.shape, obj);
                break;
        }
    }

    drawCircle(layer, obj, option = {}) {
        var x = floor(obj.pos.x);
        var y = floor(obj.pos.y);
        var r = floor(obj.rad);
        var color = option.color || obj.color || Color.random();

        layer.ctx.save();
        layer.ctx.fillStyle = color.RGBA();
        layer.ctx.strokeStyle = color.RGBA();

        layer.ctx.beginPath();
        layer.ctx.arc(x, y, r, 0, 2 * Math.PI);
        layer.ctx.closePath();
        if (option.stroke) { layer.ctx.stroke(); } else { layer.ctx.fill(); }
        layer.ctx.restore();
    }

    drawSector(layer, obj, option = {}) {
        var x = floor(obj.pos.x);
        var y = floor(obj.pos.y);
        var r = floor(obj.rad);
        var CCWAngle = obj.CCWAngle;
        var CWAngle = obj.CWAngle;
        var color = option.color || obj.color || Color.random();

        layer.ctx.save();
        layer.ctx.fillStyle = color.RGBA();
        layer.ctx.strokeStyle = color.RGBA();

        layer.ctx.beginPath();
        layer.ctx.moveTo(x, y);
        layer.ctx.arc(x, y, r, CCWAngle, CWAngle);
        layer.ctx.closePath();
        if (option.stroke) { layer.ctx.stroke(); } else { layer.ctx.fill(); }
        layer.ctx.restore();
    }

    drawArc(layer, obj, option = {}) {
        var x = floor(obj.pos.x);
        var y = floor(obj.pos.y);
        var r = floor(obj.rad);
        var CCWAngle = obj.CCWAngle;
        var CWAngle = obj.CWAngle;
        var color = option.color || obj.color || Color.random();

        layer.ctx.save();
        layer.ctx.fillStyle = color.RGBA();
        layer.ctx.strokeStyle = color.RGBA();

        layer.ctx.beginPath();
        layer.ctx.arc(x, y, r, CCWAngle, CWAngle, true);
        layer.ctx.closePath();
        if (option.stroke) { layer.ctx.stroke(); } else { layer.ctx.fill(); }
        layer.ctx.restore();
    }

    drawDonut(layer, obj, option = {}) {
        // https://en.wikipedia.org/wiki/Nonzero-rule
        var x = floor(obj.pos.x);
        var y = floor(obj.pos.y);
        var innerR = floor(obj.innerR);
        var outerR = floor(obj.outerR);
        var color = option.color || obj.color || Color.random();

        layer.ctx.save();
        layer.ctx.fillStyle = color.RGBA();
        layer.ctx.strokeStyle = color.RGBA();

        if (option.stroke) {
            layer.ctx.beginPath();
            layer.ctx.arc(x, y, outerR, 0, 2 * Math.PI);
            layer.ctx.closePath();
            layer.ctx.stroke();
            layer.ctx.beginPath();
            layer.ctx.arc(x, y, innerR, 0, 2 * Math.PI);
            layer.ctx.closePath();
            layer.ctx.stroke();
        } else {
            layer.ctx.beginPath();
            layer.ctx.arc(x, y, outerR, 0, 2 * Math.PI, false);
            layer.ctx.arc(x, y, innerR, 0, 2 * Math.PI, true);
            layer.ctx.closePath();
            layer.ctx.fill();
        }
        layer.ctx.restore();
    }

    drawRect(layer, obj, option = {}) {
        var x = floor(obj.pos.x);
        var y = floor(obj.pos.y);
        var w = floor(obj.width);
        var h = floor(obj.height);
        var color = option.color || obj.color || Color.Gray;
        layer.ctx.save();
        layer.ctx.fillStyle = color.RGBA();
        layer.ctx.strokeStyle = color.RGBA();

        var drawX = option.center || (option.center === undefined) ? x - w / 2 : x
        var drawY = option.center || (option.center === undefined) ? y - h / 2 : y
        var func = option.stroke ? "strokeRect" : "fillRect";
        layer.ctx[func](drawX, drawY, w, h);
        layer.ctx.restore();
    }

    drawTri(layer, obj, option = {}) {
        var x = floor(obj.pos.x);
        var y = floor(obj.pos.y);
        var w = floor(obj.width);
        var h = floor(obj.height);
        var dir = obj.dir;
        var color = option.color || obj.color || Color.random();

        layer.ctx.save();
        layer.ctx.fillStyle = color.RGBA();
        layer.ctx.strokeStyle = color.RGBA();

        var rightVertex = [x - dir[0] * w / (option.centerMass ? 3 : 2), y - dir[1] * h / (option.centerMass ? 3 : 2)];
        layer.ctx.beginPath();
        layer.ctx.moveTo(rightVertex[0], rightVertex[1]);
        layer.ctx.lineTo(rightVertex[0] + dir[0] * w, rightVertex[1]);
        layer.ctx.lineTo(rightVertex[0], rightVertex[1] + dir[1] * h);
        layer.ctx.closePath();
        if (option.stroke) { layer.ctx.stroke(); } else { layer.ctx.fill(); }
        layer.ctx.restore();
    }

    drawPolygon(layer, points, option = {}) {
        if (points.length === 0) { return }
        var color = option.color || Color.random();
        var stroke = option.stroke ? option.stroke : false;

        layer.ctx.save();
        layer.ctx.fillStyle = color.RGBA();
        layer.ctx.strokeStyle = color.RGBA();

        layer.ctx.beginPath();
        layer.ctx.moveTo(floor(points[0].x), floor(points[0].y));
        points.forEach(p => { layer.ctx.lineTo(floor(p.x), floor(p.y)); });
        layer.ctx.closePath();
        layer.ctx.stroke();
        if (!stroke) { layer.ctx.fill(); }
        layer.ctx.restore();
    }

    drawvisibleArea(layer, mover) {
        var polygon = mover.visibleArea;
        if (polygon.n === 0) { return }
        let gradient = layer.ctx.createRadialGradient(mover.pos.x, mover.pos.y, mover.rad, mover.pos.x, mover.pos.y, mover.visibleRange);
        var hsl = mover.color.hsl;
        gradient.addColorStop(0, `hsla(${hsl[0]}, ${hsl[1]*100}%, 40%, 1)`); // start
        gradient.addColorStop(1, `hsla(${hsl[0]}, ${hsl[1]*100}%, 0%, 0)`); // end

        layer.ctx.save();
        layer.ctx.globalCompositeOperation = "screen";
        layer.ctx.fillStyle = gradient;
        layer.ctx.beginPath();
        polygon.vertices.forEach(v => { layer.ctx.lineTo(floor(v.x), floor(v.y)); })
        layer.ctx.closePath();
        layer.ctx.fill();
        layer.ctx.restore();
    }

    drawVisibleEdge(layer, mover) {
        var lineWidth = 2;

        layer.ctx.save();
        layer.ctx.globalCompositeOperation = "screen";
        layer.ctx.strokeStyle = mover.color.RGBA();
        layer.ctx.lineWidth = lineWidth;

        mover.visibleEdges.forEach(edge => {
            var path = edge.getPath();
            layer.ctx.stroke(path);
        })
        layer.ctx.restore();
    }

    drawText(layer, pos, text, option = {}) {
        var lineHeight = 10;
        var x = floor(pos.x);
        var y = floor(pos.y);
        var color = option.color || Color.random();
        var size = option.size || 14;

        layer.ctx.save();
        layer.ctx.fillStyle = color.RGBA();
        layer.ctx.strokeStyle = color.RGBA();
        layer.ctx.font = `${size}px Noto Sans, sans-serif`;

        var func = option.stroke ? "strokeText" : "fillText";
        if (typeof text === "string") {
            layer.ctx[func](text, x, y);
        } else if (text instanceof Array) {
            text.forEach((line, index) => { layer.ctx[func](line, x, y + lineHeight * index); });
        }
        layer.ctx.restore();
    }

    drawLine(layer, obj, option = {}) {
        var color = option.color || obj.color || Color.random();
        var lineWidth = option.lineWidth || 2;

        layer.ctx.save();
        layer.ctx.strokeStyle = color.RGBA();
        layer.ctx.lineWidth = lineWidth;

        layer.ctx.beginPath();
        layer.ctx.moveTo(floor(obj.p1.x), floor(obj.p1.y));
        layer.ctx.lineTo(floor(obj.p2.x), floor(obj.p2.y));
        layer.ctx.closePath();
        layer.ctx.stroke();
        layer.ctx.restore();
    }
};

var visualizer = new Visualizer();
export { visualizer as Visualizer }