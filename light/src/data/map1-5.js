export const mapData = Object.freeze({
    "width": 7,
    "height": 7,
    "map": [
        ["W", "W", "W", "W", "W", "W", "W"],
        ["W", "U", "U", "U", "U", "U", "W"],
        ["W", "U", "U", "U", "U", "U", "W"],
        ["W", "U", "U", "M", "U", "U", "W"],
        ["W", "U", "U", "U", "U", "U", "W"],
        ["W", "U", "U", "U", "U", "U", "W"],
        ["W", "W", "W", "W", "W", "W", "W"]
    ],
    "mover": {
        "M1": {
            "range": 300,
            "friction": 0.001,
            "movingForceMag": 500,
        }
    },
    "panel": {
        "P1": ["M1"],
        "P2": ["M1"],
        "P3": ["M1"]
    }
});