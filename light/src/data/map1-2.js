export const mapData = Object.freeze({
    "width": 7,
    "height": 4,
    "map": [
        ["W", "W", "W", "W", "W", "W", "W"],
        ["W", "M1", "B", "P1", "B", "P2", "W"],
        ["W", "W", "W", "B", "W", "W", "W"],
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