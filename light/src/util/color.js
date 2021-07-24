export class Color {
    // RGB is actually sRGB
    // https://www.w3.org/TR/css-color-3/#hsl-color
    // https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    // https://en.wikipedia.org/wiki/HSL_and_HSV#Formal_derivation

    static White = new Color("hex", "#FFFFFF");
    static Gray = new Color("hex", "#888888");
    static Black = new Color("hex", "#000000");

    static Red = new Color("hex", "#F44336");
    static Green = new Color("hex", "#4CAF50");
    static Blue = new Color("hex", "#2196F3");

    static Yellow = new Color("hex", "#FFFF00");
    static Magenta = new Color("hex", "#FF00FF");
    static Cyan = new Color("hex", "#00FFFF");

    static random() {
        var color = '#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
        return new Color("hex", color)
    }


    static isValidColor(string) {
        var s = new Option().style;
        s.color = string;
        return s.color === string;
    }

    static RGBtoHSL(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        var max = Math.max(r, g, b); // v
        var min = Math.min(r, g, b);
        var c = max - min;
        var hue;
        if (c === 0) { hue = 0; } else {
            switch (max) {
                case r:
                    var segment = (g - b) / c;
                    var shift = 0 / 60; // R° / (360° / hex sides)
                    if (segment < 0) { // hue > 180, full rotation
                        shift = 360 / 60; // R° / (360° / hex sides)
                    }
                    hue = segment + shift;
                    break;
                case g:
                    var segment = (b - r) / c;
                    var shift = 120 / 60; // G° / (360° / hex sides)
                    hue = segment + shift;
                    break;
                case b:
                    var segment = (r - g) / c;
                    var shift = 240 / 60; // B° / (360° / hex sides)
                    hue = segment + shift;
                    break;
            }
        }
        hue *= 60; // hue is in [0,6], scale it up
        var s = c / (1 - Math.abs(2 * max - c - 1));
        var l = (min + max) / 2
        return [hue, s, l]
    }

    static HSLtoRGB(h, s, l) {
        var m2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
        var m1 = 2 * l - m2;
        var r = HUEtoRGB(m1, m2, h + 1 / 3);
        var g = HUEtoRGB(m1, m2, h);
        var b = HUEtoRGB(m1, m2, h - 1 / 3);
        return [r, g, b]
    }

    static HUEtoRGB(m1, m2, h) {
        if (h < 0) { h ++; }
        if (h > 1) { h -= 1; }
        if (h < 1 / 6) return m1 + (m2 - m1) * h * 6;
        if (h < 1 / 2) return m2;
        if (h < 2 / 3) return m1 + (m2 - m1) * (2 / 3 - h) * 6;
        return m;
    }

    static RGBtoHEX(r, g, b) {
        return "#" + ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1);
    }

    static HEXtoRGB(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    }

    constructor(type, ...color) {
        this.type = type;
        switch (type) {
            case "hsl":
                this.hsl = color.slice(0, 3);
                this.rgb = Color.HSLtoRGB(...this.hsl);
                this.hex = Color.RGBtoHEX(...this.rgb);
                this.alpha = color[3] || 1;
                break;
            case "rgb":
                this.rgb = color.slice(0, 3);
                this.hsl = Color.RGBtoHSL(...this.rgb);
                this.hex = Color.RGBtoHEX(...this.rgb);
                this.alpha = color[3] || 1;
                break;
            case "hex":
                this.hex = color[0].slice(0, 7);
                this.rgb = Color.HEXtoRGB(this.hex);
                this.hsl = Color.RGBtoHSL(...this.rgb);
                this.alpha = color[1] || 1;
                break;
        }
    }

    setAlpha(alpha) {
        this.alpha = alpha;
    }

    HSL() {
        return `hsl(${this.hsl[0]}, ${this.hsl[1]*100}%, ${this.hsl[2]*100}%)`
    }

    HSLA(a) {
        var alpha = a || this.alpha;
        return `hsla(${this.hsl[0]}, ${this.hsl[1]*100}%, ${this.hsl[2]*100}%, ${alpha})`
    }

    RGB() {
        return `rgb(${this.rgb[0]}, ${this.rgb[1]}, ${this.rgb[2]})`
    }

    RGBA(a) {
        var alpha = a || this.alpha;
        return `rgba(${this.rgb[0]}, ${this.rgb[1]}, ${this.rgb[2]}, ${alpha})`
    }

    HEX() {
        return this.hex
    }

    HEXA(a) {
        var alpha = a || this.alpha;
        return this.hex + Math.round(alpha*255).toString(16).toUpperCase();
    }

    represent() {
        return this[this.type]
    }
}