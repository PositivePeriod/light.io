export const mapData = Object.freeze({
    "width": 5,
    "height": 5,
    "map": [
        ["W", "W", "W", "W", "W"],
        ["W", "M1", "W", "P1", "W"],
        ["W", "B", "W", "B", "W"],
        ["W", "B", "B", "B", "W"],
        ["W", "W", "W", "W", "W"],
    ],
    "mover": {
        "M1": { "range": 300 }
    },
    "panel": { "P1": ["M1"] }
});