export const mapData = Object.freeze({
    "width": 7,
    "height": 4,
    "map": [
        ["W", "W", "W", "W", "W", "W", "W"],
        ["W", "M1", "W", "B", "B", "B", "W"],
        ["W", "B", "B", "B", "W", "B", "W"],
        ["W", "W", "W", "W", "W", "W", "W"],
    ],
    "mover": {
        "M1": { "range": 300 }
    },
    "panel": {
        "P1": ["M1"],
        "P2": ["M1"]
    }
});