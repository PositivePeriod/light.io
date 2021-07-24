export const mapData = Object.freeze({
    "width": 7,
    "height": 7,
    "map": [
        ["W", "W", "W", "W", "W", "W", "W"],
        ["W", "M", "B", "B", "B", "B", "W"],
        ["W", "B", "B", "B", "B", "B", "W"],
        ["W", "B", "B", "B", "B", "B", "W"],
        ["W", "B", "B", "B", "B", "B", "W"],
        ["W", "B", "B", "B", "B", "B", "W"],
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