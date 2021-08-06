export const mapData = Object.freeze({
    "name": "mapMain",
    "width": 7,
    "height": 7,
    "map": [
        ["R", "R", "R", "R", "R", "R", "R"],
        ["R", "T", "T", "T", "T", "T", "R"],
        ["R", "T", "b", "T", "b", "T", "R"],
        ["R", "T", "M1", "M2", "M3", "T", "R"],
        ["R", "T", "b", "T", "b", "T", "R"],
        ["R", "T", "T", "T", "T", "T", "R"],
        ["R", "R", "R", "R", "R", "R", "R"]

    ],
    "object": {
        "M1": {
            "color": "Red",
            "visibleRange": 3000,
            "mass": 1,
            "friction": 0.001,
            "movingForceMag": 1000,
            "movingKey": { "KeyW": { x: 0, y: -1 }, "KeyA": { x: -1, y: 0 }, "KeyS": { x: 0, y: 1 }, "KeyD": { x: 1, y: 0 } }
        },
        "M2": {
            "color": "Green",
            "visibleRange": 3000,
            "mass": 1,
            "friction": 0.001,
            "movingForceMag": 1000,
            "movingKey": { "KeyT": { x: 0, y: -1 }, "KeyF": { x: -1, y: 0 }, "KeyG": { x: 0, y: 1 }, "KeyH": { x: 1, y: 0 } }
        },
        "M3": {
            "color": "Blue",
            "visibleRange": 3000,
            "mass": 1,
            "friction": 0.001,
            "movingForceMag": 1000,
            "movingKey": { "KeyI": { x: 0, y: -1 }, "KeyJ": { x: -1, y: 0 }, "KeyK": { x: 0, y: 1 }, "KeyL": { x: 1, y: 0 } }
        }
    }
});