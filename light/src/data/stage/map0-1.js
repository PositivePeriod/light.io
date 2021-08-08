export const mapData = Object.freeze({
    "name": "map1",
    "width": 12,
    "height": 5,
    "map": [
        ["R ", "R ", "R ", "R ", "R ", "R ", "R ", "R ", "R ", "R ", "R ", "R "],
        ["R ", "R ", "R ", "R ", "R ", "  ", "  ", "  ", "R ", "R ", "R ", "R "],
        ["R ", "M1", "M2", "C1", "  ", "C2", "R ", "R ", "R ", "R ", "R ", "R "],
        ["R ", "R ", "  ", "R ", "R ", "R ", "R ", "R ", "R ", "R ", "R ", "R "],
        ["R ", "R ", "R ", "R ", "R ", "R ", "R ", "R ", "R ", "R ", "R ", "R "],

    ],
    "object": {
        "M1": {
            "color": "Red",
            "visibleRange": 1000,
            "mass": 1,
            "friction": 0.001,
            "movingForceMag": 1000,
            "movingKey": { "KeyW": { x: 0, y: -1 }, "KeyA": { x: -1, y: 0 }, "KeyS": { x: 0, y: 1 }, "KeyD": { x: 1, y: 0 } }
        },
        "M2": {
            "color": "Green",
            "visibleRange": 1000,
            "mass": 1,
            "friction": 0.001,
            "movingForceMag": 1000,
            "movingKey": { "KeyT": { x: 0, y: -1 }, "KeyF": { x: -1, y: 0 }, "KeyG": { x: 0, y: 1 }, "KeyH": { x: 1, y: 0 } }
        },

        "C1": {
            "color": "Green",
        },
        "C2": {
            "color": "Yellow",
        },
    }
});