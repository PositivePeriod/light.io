import { GameObject } from "../entity/gameObject.js";
import { SHAPE } from "./constant.js";

// https://developer.mozilla.org/ko/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas

export class Visualizer {
    constructor() {
        this.layers = [];

        this.initCanvas();
        this.initResize();

    }

    drawObject(obj) {
        if (typeof obj.draw === "function") {
            obj.draw(this);
        } else {
            if (!SHAPE.has(obj.shape)) {
                console.error("Impossible object shape; ", obj.shape, obj);
            }
            switch (obj.shape) {
                case "Rect":
                    this.drawRect(obj.pos.x, obj.pos.y, obj.width, obj.height, obj.color);
                    break;
                case "Circle":
                    this.drawCircle(obj.pos.x, obj.pos.y, obj.rad, obj.color);
                    break;
                case "Donut":
                    this.drawDonut(obj.pos.x, obj.pos.y, obj.innerR, obj.outerR, obj.color);
                    break;
                case "Tri":
                    this.drawTri(obj.pos.x, obj.pos.y, obj.width, obj.height, obj.dir, obj.color);
                    break;
                case "Hex":
                    obj.pseudoObjects.forEach(object => { this.drawObject(object) });
                    break;
            }
        }
    }

    draw(clear = true) {
        if (clear) { this.clearWhole(); }
        GameObject.system.objects.forEach(group => {
            group.forEach(obj => { this.drawObject(obj); })
        })
    }

    initCanvas() {
        this.canvas = document.createElement("canvas");
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext("2d");
        // this.ctx.lineWidth = 1;
    }

    addCanvas() {
        var canvas = document.createElement("canvas");
        canvas.width = this.canvas.width;
        canvas.height = this.canvas.height;
        document.body.appendChild(canvas);
        return canvas.getContext("2d")
    }

    initResize() {
        this.pixelRatio = window.devicePixelRatio > 1 ? 2 : 1;
        window.addEventListener("resize", this.resize.bind(this), false);
        this.resize();
    }

    resize() {
        this.stageWidth = document.body.clientWidth;
        this.stageHeight = document.body.clientHeight;
        this.canvas.width = this.stageWidth * this.pixelRatio;
        this.canvas.height = this.stageHeight * this.pixelRatio;
        this.ctx.scale(this.pixelRatio, this.pixelRatio);

        this.draw();
    }

    drawCircle(x, y, r, color = "#000000", stroke = false) {
        var x = Math.floor(x);
        var y = Math.floor(y);
        var r = Math.floor(r);

        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;

        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, 2 * Math.PI);
        if (stroke) {
            this.ctx.stroke();
        } else {
            this.ctx.fill();
        }
        this.ctx.restore();
    }

    drawDonut(x, y, innerR, outerR, color = "#000000", stroke = false) {
        var x = Math.floor(x);
        var y = Math.floor(y);
        var innerR = Math.floor(innerR);
        var outerR = Math.floor(outerR);

        // https://en.wikipedia.org/wiki/Nonzero-rule
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;

        if (stroke) {
            this.ctx.beginPath();
            this.ctx.arc(x, y, outerR, 0, 2 * Math.PI);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.arc(x, y, innerR, 0, 2 * Math.PI);
            this.ctx.stroke();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(x, y, outerR, 0, 2 * Math.PI, false);
            this.ctx.arc(x, y, innerR, 0, 2 * Math.PI, true);
            this.ctx.fill();
        }
        this.ctx.restore();
    }

    drawRect(x, y, w, h, color = "#000000", stroke = false, center = true) {
        var x = Math.floor(x);
        var y = Math.floor(y);
        var w = Math.floor(w);
        var h = Math.floor(h);

        // color = `rgba(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255})`
        this.ctx.save();
        this.ctx.alpha = 0.2;
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;

        var drawX = center ? x - w / 2 : x
        var drawY = center ? y - h / 2 : y

        if (stroke) {
            this.ctx.strokeRect(drawX, drawY, w, h);
        } else {
            this.ctx.fillRect(drawX, drawY, w, h);
        }
        this.ctx.restore();
    }

    drawTri(x, y, w, h, dir, color = "#000000", stroke = false, centerMass = false) {
        var x = Math.floor(x);
        var y = Math.floor(y);
        var w = Math.floor(w);
        var h = Math.floor(h);

        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;

        var rightVertex = [x - dir[0] * w / (centerMass ? 3 : 2), y - dir[1] * h / (centerMass ? 3 : 2)];
        this.ctx.beginPath();
        this.ctx.moveTo(rightVertex[0], rightVertex[1]);
        this.ctx.lineTo(rightVertex[0] + dir[0] * w, rightVertex[1]);
        this.ctx.lineTo(rightVertex[0], rightVertex[1] + dir[1] * h);

        if (stroke) {
            this.ctx.stroke();
        } else {
            this.ctx.fill();
        }
        this.ctx.restore();
    }

    drawPolygon(points, color = "#000000", stroke = false) {
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;

        this.ctx.beginPath();
        this.ctx.moveTo(Math.floor(points[0].x), Math.floor(points[0].y));
        points.forEach(p => { this.ctx.lineTo(Math.floor(p.x), Math.floor(p.y)); });
        this.ctx.closePath();
        if (stroke) {
            this.ctx.stroke();
        } else {
            this.ctx.fill();
            this.ctx.stroke();
        }
        this.ctx.restore();
    }

    drawVisibility(mover) {
        const regexp = /hsl\(\s*(\d+)\s*,\s*(\d+(?:\.\d+)?%)\s*,\s*(\d+(?:\.\d+)?%)\)/g;
        var [h, s, l] = regexp.exec(mover.color).slice(1);
        let gradient = this.ctx.createRadialGradient(mover.pos.x, mover.pos.y, mover.rad, mover.pos.x, mover.pos.y, 500);
        gradient.addColorStop(0, `hsla(${h}, ${s}, ${"40%"}, 0.4)`); // start
        gradient.addColorStop(1, `hsla(${h}, ${s}, ${"0%"}, 0)`); // end
        var polygon = mover.polygon;
        if (polygon.length === 0) { return }
        this.ctx.save();
        this.ctx.globalCompositeOperation = "screen";
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.moveTo(Math.floor(polygon[0].x), Math.floor(polygon[0].y));
        polygon.forEach(tri => {
            this.ctx.lineTo(Math.floor(tri[0].x), Math.floor(tri[0].y));
            this.ctx.lineTo(Math.floor(tri[1].x), Math.floor(tri[1].y));
        })
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
    }

    clear(cx, cy, w, h) {
        // var w = parseInt(w / 2);
        // var h = parseInt(h / 2);
        var x = cx - w / 2;
        var y = cy - h / 2;
        this.ctx.clearRect(x, y, width, height);
    }

    clearWhole() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}