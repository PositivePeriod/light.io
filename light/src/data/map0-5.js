export const mapData = Object.freeze({
    "width": 7,
    "height": 7,
    "map": [
        ["R", "R", "R", "R", "R", "R", "R"],
        ["R", "U", "U", "U", "U", "U", "R"],
        ["R", "U", "U", "U", "U", "U", "R"],
        ["R", "U", "U", "M", "U", "U", "R"],
        ["R", "U", "U", "U", "U", "U", "R"],
        ["R", "U", "U", "U", "U", "U", "R"],
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