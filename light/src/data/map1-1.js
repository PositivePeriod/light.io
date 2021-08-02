export const mapData = Object.freeze({
    "width": 5,
    "height": 5,
    "map": [
        ["R", "R", "R", "R", "R"],
        ["R", "M1", "R", "P1", "R"],
        ["R", " ", "R", " ", "R"],
        ["R", " ", " ", " ", "R"],
        ["R", "R", "R", "R", "R"],
    ],
    "mover": {
        "M1": { "range": 300 }
    },
    "panel": { "P1": ["M1"] }
});