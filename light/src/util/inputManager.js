// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code - key name
// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key - key event

export class InputManager {
    constructor(log = false) {
        this.keyboard = new KeyboardManager(log);
        this.mouse = new MouseManager(log);
    }

    toggle() {
        this.keyboard.toggle();
        this.mouse.toggle();
    }

    activate() {
        this.keyboard.activate();
        this.mouse.activate();
    }

    deactivate() {
        this.keyboard.deactivate();
        this.mouse.deactivate();
    }

    reset() {
        this.deactivate();
        this.activate();
    }
}

export class KeyboardManager {
    constructor(log = false) {
        this.log = log;

        this.keyStatus = new Map();
        this.keyCallback = new Map();
        this.active = false;

        window.addEventListener("keydown", this.handler.bind(this));
        window.addEventListener("keyup", this.handler.bind(this));
    }

    waitKeyUp(keycode = null) {
        // Have not used -> not verified in application
        return new Promise(function(resolve, reject) {
            window.addEventListener("mouseup",
                function(e) { if (keycode === null || keycode === e.code) { resolve(); } }.bind(this));
        }.bind(this));
    }

    isPressed(keyCode) { return this.keyStatus.has(keyCode) ? this.keyStatus.get(keyCode) : false; }

    handler(e) {
        if (!this.active) { return; }
        if (this.log) { console.log(e.type, e.code); }
        switch (e.type) {
            case "keydown":
                this.keyStatus.set(e.code, true);
                if (this.keyCallback.has(e.code)) {
                    if (this.log) { console.log("listen", e.code); }
                    this.keyCallback.get(e.code)();
                }
                break;
            case "keyup":
                this.keyStatus.set(e.code, false);
                break;
            default:
                break;
        }
    }

    listen(keyCode, callback) { this.keyCallback.set(keyCode, callback); }

    toggle() { if (this.active) { this.deactivate(); } else { this.activate(); } }

    activate() { this.active = true; }

    deactivate() {
        this.keyStatus = new Map();
        this.active = false;
    }
}

export class MouseManager {
    constructor(log = false) {
        this.log = log;

        this.mouseCallback = new Map();
        this.pos = { "x": null, "y": null };
        this.downPos = { "x": null, "y": null };
        this.isPressed = false;
        this.active = false;

        // window.addEventListener("mousemove", this.handler.bind(this));
        window.addEventListener("mousedown", this.handler.bind(this));
        window.addEventListener("mouseup", this.handler.bind(this));
    }

    waitMouseUp() {
        return new Promise(function(resolve, reject) {
            window.addEventListener("mouseup",
                function() { resolve({ "downPos": this.downPos, "upPos": this.upPos }); }.bind(this));
        }.bind(this));
    }

    handler(e) {
        if (!this.active) { return; }
        const x = e.offsetX;
        const y = e.offsetY;
        if (this.log) { console.log(e.type, x, y); }
        switch (e.type) {
            case "mousemove":
                this.pos = { "x": x, "y": y };
                break;
            case "mousedown":
                this.downPos = { "x": x, "y": y };
                this.isPressed = true;
                if (this.mouseCallback.has(e.type)) { this.mouseCallback.get(e.type)(this.downX, this.downY); }
                break;
            case "mouseup":
                this.upPos = { "x": x, "y": y };
                this.isPressed = false;
                if (this.mouseCallback.has(e.type)) { this.mouseCallback.get(e.type)(this.downX, this.downY, this.upX, this.upY); }
                break;
            case "click":
                break;
            case "dbclick":
                break;
            default:
                break;
        }
    }

    listen(eventType, callback) { this.mouseCallback.set(eventType, callback); }

    toggle() { if (this.active) { this.deactivate(); } else { this.activate(); } }

    activate() { this.active = true; }

    deactivate() {
        this.pos = { "x": null, "y": null };
        this.downPos = { "x": null, "y": null };
        this.isPressed = false;
        this.active = false;
    }
}