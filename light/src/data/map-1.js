export const mapData = Object.freeze({
    "width": 7,
    "height": 7,
    "map": [
        ["R", "R", "R", "R", "R", "R", "R"],
        ["R", "T", "T", "T", "T", "T", "R"],
        ["R", "T", "r", "T", "r", "T", "R"],
        ["R", "T", "M", "T", "M", "T", "R"],
        ["R", "T", "r", "T", "r", "T", "R"],
        ["R", "T", "T", "T", "T", "T", "R"],
        ["R", "R", "R", "R", "R", "R", "R"]

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