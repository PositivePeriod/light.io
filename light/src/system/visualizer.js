import { Color } from "../util/color.js";
import { Timer } from "../util/timer.js";

// https://developer.mozilla.org/ko/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas

class Visualizer {
    constructor() {
        this.timer = new Timer();

        this.layers = new Map(); // Custom offscreencanvas for better performance
        this.layersFunc = new Map();
        this.layersInfo = new Map();

        this.initMasterLayer();
        // static
        this.addLayer("static", { "drawReset": false, "funcReset": false });
        // dynamic
        this.addLayer("visibleArea");
        this.addLayer("visibleEdge");
        this.addLayer("panel");
        this.addLayer("mover");
        this.addLayer("time", { "drawReset": true, "funcReset": true });

        this.pixelRatio = window.devicePixelRatio > 1 ? 2 : 1;
        window.addEventListener("resize", this.resize.bind(this), false);
        this.resize();
    }

    initMasterLayer() {
        var canvas = document.createElement("canvas");
        document.body.appendChild(canvas);
        var ctx = canvas.getContext("2d");
        this.master = { "canvas": canvas, "ctx": ctx };
    }

    addFunc(name, func, arg) {
        this.layersFunc.get(name).push({ "func": func, "arg": arg || undefined });
    }

    addLayer(name, option) {
        var canvas = document.createElement("canvas");
        // document.body.appendChild(canvas);
        var ctx = canvas.getContext("2d");
        this.layers.set(name, { "canvas": canvas, "ctx": ctx });
        this.layersInfo.set(name, option ? option : { "drawReset": true, "funcReset": false });
        this.layersFunc.set(name, []);
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
        this.stageWidth = document.body.clientWidth;
        this.stageHeight = document.body.clientHeight;
        this.master.canvas.width = this.stageWidth * this.pixelRatio;
        this.master.canvas.height = this.stageHeight * this.pixelRatio;
        this.master.ctx.scale(this.pixelRatio, this.pixelRatio);
        this.layers.forEach(layer => {
            layer.canvas.width = this.stageWidth * this.pixelRatio;
            layer.canvas.height = this.stageHeight * this.pixelRatio;
            layer.ctx.scale(this.pixelRatio, this.pixelRatio);
        })
        this.initDraw();
    }

    initDraw() {
        this.resetLayer("master", this.master);
        ["visibleArea", "static", "visibleEdge", "panel", "mover", "time"].forEach(name => {
            var layer = this.findLayer(name);
            var funcs = this.layersFunc.get(name);
            this.resetLayer(name, layer);
            funcs.forEach(input => { input.func.bind(this)(layer, ...input.arg); })
            this.master.ctx.drawImage(layer.canvas, 0, 0);
        });
    }

    draw() {
        this.resetLayer("master", this.master);
        ["visibleArea", "static", "visibleEdge", "panel", "mover", "time"].forEach(name => {
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
                    default:
                        funcs.forEach(input => { input.func.bind(this)(layer, ...input.arg); })
                        break;
                }
            }
            if (info.funcReset) { this.layersFunc.set(name, []); }
            switch (name) {
                case "visibleEdge":
                    this.master.ctx.save();
                    this.master.ctx.globalCompositeOperation = "screen";
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

    drawCircle(layer, obj, stroke = false) {
        var x = Math.floor(obj.pos.x);
        var y = Math.floor(obj.pos.y);
        var r = Math.floor(obj.rad);
        var color = obj.color || Color.Black;

        layer.ctx.save();
        layer.ctx.fillStyle = color.HEX();
        layer.ctx.strokeStyle = color.HEX();

        layer.ctx.beginPath();
        layer.ctx.arc(x, y, r, 0, 2 * Math.PI);
        if (stroke) { layer.ctx.stroke(); } else { layer.ctx.fill(); }
        layer.ctx.restore();
    }

    drawArc(layer, obj, stroke = true, CCW = true) {
        var x = Math.floor(obj.pos.x);
        var y = Math.floor(obj.pos.y);
        var r = Math.floor(obj.rad);
        var startAngle = obj.startAngle;
        var endAngle = obj.endAngle;
        var color = obj.color || Color.White;

        layer.ctx.save();
        layer.ctx.fillStyle = color.HEX();
        layer.ctx.strokeStyle = color.HEX();

        layer.ctx.beginPath();
        layer.ctx.arc(x, y, r, startAngle, endAngle, CCW);
        if (stroke) { layer.ctx.stroke(); } else { layer.ctx.fill(); }
        layer.ctx.restore();
    }

    drawDonut(layer, obj, stroke = false) {
        // https://en.wikipedia.org/wiki/Nonzero-rule
        var x = Math.floor(obj.pos.x);
        var y = Math.floor(obj.pos.y);
        var innerR = Math.floor(obj.innerR);
        var outerR = Math.floor(obj.outerR);
        var color = obj.color || Color.Black;

        layer.ctx.save();
        layer.ctx.fillStyle = color.HEX();
        layer.ctx.strokeStyle = color.HEX();

        if (stroke) {
            layer.ctx.beginPath();
            layer.ctx.arc(x, y, outerR, 0, 2 * Math.PI);
            layer.ctx.stroke();
            layer.ctx.beginPath();
            layer.ctx.arc(x, y, innerR, 0, 2 * Math.PI);
            layer.ctx.stroke();
        } else {
            layer.ctx.beginPath();
            layer.ctx.arc(x, y, outerR, 0, 2 * Math.PI, false);
            layer.ctx.arc(x, y, innerR, 0, 2 * Math.PI, true);
            layer.ctx.fill();
        }
        layer.ctx.restore();
    }

    drawRect(layer, obj, stroke = false, center = true) {
        var x = Math.floor(obj.pos.x);
        var y = Math.floor(obj.pos.y);
        var w = Math.floor(obj.width);
        var h = Math.floor(obj.height);
        var color = obj.color || Color.Black;

        layer.ctx.save();
        layer.ctx.alpha = 0.2;
        layer.ctx.fillStyle = color.HEX();
        layer.ctx.strokeStyle = color.HEX();

        var drawX = center ? x - w / 2 : x
        var drawY = center ? y - h / 2 : y
        var func = stroke ? "strokeRect" : "fillRect";
        layer.ctx[func](drawX, drawY, w, h);
        layer.ctx.restore();
    }

    drawTri(layer, obj, stroke = false, centerMass = false) {
        var x = Math.floor(obj.pos.x);
        var y = Math.floor(obj.pos.y);
        var w = Math.floor(obj.width);
        var h = Math.floor(obj.height);
        var dir = obj.dir;
        var color = obj.color || Color.Black;

        layer.ctx.save();
        layer.ctx.fillStyle = color.HEX();
        layer.ctx.strokeStyle = color.HEX();

        var rightVertex = [x - dir[0] * w / (centerMass ? 3 : 2), y - dir[1] * h / (centerMass ? 3 : 2)];
        layer.ctx.beginPath();
        layer.ctx.moveTo(rightVertex[0], rightVertex[1]);
        layer.ctx.lineTo(rightVertex[0] + dir[0] * w, rightVertex[1]);
        layer.ctx.lineTo(rightVertex[0], rightVertex[1] + dir[1] * h);
        if (stroke) { layer.ctx.stroke(); } else { layer.ctx.fill(); }
        layer.ctx.restore();
    }

    drawPolygon(layer, points, color = Color.Black, stroke = false) {
        layer.ctx.save();
        layer.ctx.fillStyle = color.HEX();
        layer.ctx.strokeStyle = color.HEX();

        layer.ctx.beginPath();
        layer.ctx.moveTo(Math.floor(points[0].x), Math.floor(points[0].y));
        points.forEach(p => { layer.ctx.lineTo(Math.floor(p.x), Math.floor(p.y)); });
        layer.ctx.closePath();
        layer.ctx.stroke();
        if (!stroke) { layer.ctx.fill(); }
        layer.ctx.restore();
    }

    drawVisibleArea(layer, mover) {
        var polygon = mover.visibleArea;
        if (polygon === undefined || polygon.length === 0) { return }

        let gradient = layer.ctx.createRadialGradient(mover.pos.x, mover.pos.y, mover.rad, mover.pos.x, mover.pos.y, mover.visibleRange);
        var hsl = mover.color.hsl;
        gradient.addColorStop(0, `hsla(${hsl[0]}, ${hsl[1]*100}%, 40%, 1)`); // start
        gradient.addColorStop(1, `hsla(${hsl[0]}, ${hsl[1]*100}%, 0%, 0)`); // end


        layer.ctx.save();
        layer.ctx.globalCompositeOperation = "screen";
        layer.ctx.fillStyle = gradient;
        layer.ctx.beginPath();
        layer.ctx.moveTo(Math.floor(polygon[0][0].x), Math.floor(polygon[0][0].y));
        polygon.forEach(line => {
            layer.ctx.lineTo(Math.floor(line[0].x), Math.floor(line[0].y));
            layer.ctx.lineTo(Math.floor(line[1].x), Math.floor(line[1].y));
        })
        layer.ctx.closePath();
        layer.ctx.fill();
        layer.ctx.restore();
    }

    drawVisibleEdge(layer, mover) {
        var polygon = mover.visibleArea;
        if (polygon === undefined || polygon.length === 0) { return }

        layer.ctx.save();
        // layer.ctx.globalCompositeOperation = "lighter";
        layer.ctx.strokeStyle = Color.White.HEX();

        polygon.forEach(line => { line[0].line.draw(layer, mover, this); })
        layer.ctx.restore();
    }
};

var visualizer = new Visualizer();
export { visualizer as Visualizer }