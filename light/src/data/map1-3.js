export const mapData = Object.freeze({
    "width": 5,
    "height": 6,
    "map": [
        ["W", "W", "W", "W", "W"],
        ["W", "M1", "P1", "B", "W"],
        ["W", "B", "W", "B", "W"],
        ["W", "P2", "B", "B", "W"],
        ["W", "W", "W", "P3", "W"],
        ["W", "W", "W", "W", "W"],
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