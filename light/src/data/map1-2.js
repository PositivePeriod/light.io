export const mapData = Object.freeze({
    "width": 7,
    "height": 4,
    "map": [
        ["R", "R", "R", "R", "R", "R", "R"],
        ["R", "M1", " ", " ", " ", "P2", "R"],
        ["R", "R", "R", "P1", "R", "R", "R"],
        ["R", "R", "R", "R", "R", "R", "R"],
    ],
    "mover": {
        "M1": { "range": 300 }
    },
    "panel": {
        "P1": ["M1"],
        "P2": ["M1"]
    }
});