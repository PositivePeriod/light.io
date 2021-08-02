export const mapData = Object.freeze({
    "width": 5,
    "height": 5,
    "map": [
        ["R", "R", "R", "R", "R"],
        ["R", " ", "P", " ", "R"],
        ["R", "M1", " ", " ", "R"],
        ["R", " ", "N", " ", "R"],
        ["R", "R", "R", "R", "R"],
    ],
    "mover": {
        "M1": { "range": 1000 }
    },
    "panel": {
        "P1": ["M1"],
        "P2": ["M1"]
    },
    "itme": {
        "line": 1,
    }
});