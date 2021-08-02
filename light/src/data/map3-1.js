export const mapData = Object.freeze({
    "width": 5,
    "height": 6,
    "map": [
        ["R", "R", "R", "R", "R"],
        ["R", "M1", " ", " ", "R"],
        ["R", " ", "m", " ", "R"],
        ["R", " ", " ", " ", "R"],
        ["R", "R", "R", " ", "R"],
        ["R", "R", "R", "R", "R"],
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