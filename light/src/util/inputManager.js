// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code - key name
// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key - key event

// TODO change into new Map()

export class KeyboardManager {
    constructor(log=false) {
        this.log = log;

        this.keyStatus = {};
        this.keyCallback = {};
        this.active = false;

        window.addEventListener("keydown", this.handler.bind(this));
        window.addEventListener("keyup", this.handler.bind(this));
    }

    isPressed(keyCode) {
        return keyCode in this.keyStatus ? this.keyStatus[keyCode] : false;
    }

    handler(e) {
        if (!this.active) { return; }
        if (this.log) { console.log(e.type, e.code); }
        switch (e.type) {
            case "keydown":
                this.keyStatus[e.code] = true;
                if (e.code in this.keyCallback) {
                    if (this.log) { console.log("listen", e.code) }
                    this.keyCallback[e.code]();
                }
                break;
            case "keyup":
                this.keyStatus[e.code] = false;
                break;
            default:
                break;
        }
    }

    listen(keyCode, callback) {
        this.keyCallback[keyCode] = callback;
    }

    toggle() { if (this.active) { this.deactivate(); } else { this.activate(); } }

    activate() { this.active = true; }

    deactivate() {
        this.keyStatus = {};
        this.active = false;
    }
}

export class MouseManager {
    constructor(log=false) {
        this.log = log;

        this.mouseCallback = {};
        this.x = null;
        this.y = null;
        this.downX = null;
        this.downY = null;
        this.isPressed = false;
        this.active = false;

        // window.addEventListener("mousemove", this.handler.bind(this));
        window.addEventListener("mousedown", this.handler.bind(this));
        window.addEventListener("mouseup", this.handler.bind(this));
    }

    getPoint() {
        return new Promise(function(resolve, reject) {
            window.addEventListener("mouseup", function() {
                resolve({ "downX": this.downX, "downY": this.downY, "upX": this.upX, "upY": this.upY });
            }.bind(this));
        }.bind(this));
    }

    handler(e) {
        if (!this.active) { return; }
        const x = e.offsetX;
        const y = e.offsetY;
        if (this.log) { console.log(e.type, x, y); }
        switch (e.type) {
            case "mousemove":
                this.x = x;
                this.y = y;
                break;
            case "mousedown":
                this.downX = x;
                this.downY = y;
                this.isPressed = true;
                if (e.type in this.mouseCallback) { this.mouseCallback[e.type](this.downX, this.downY); }
                break;
            case "mouseup":
                this.upX = x;
                this.upY = y;
                this.isPressed = false;
                if (e.type in this.mouseCallback) {
                    this.mouseCallback[e.type](this.downX, this.downY, this.upX, this.upY);
                }
                break;
            case "click":
                break;
            case "dbclick":
                break;
            default:
                break;
        }
    }

    listen(eventType, callback) {
        this.mouseCallback[eventType] = callback;
    }

    toggle() { if (this.active) { this.deactivate(); } else { this.activate(); } }

    activate() { this.active = true; }

    deactivate() {
        this.x = null;
        this.y = null;
        this.downX = null;
        this.downY = null;
        this.isPressed = false;
        this.active = false;
    }
}