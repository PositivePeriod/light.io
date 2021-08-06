export const mapData = Object.freeze({
    "name": "mapMain",
    "width": 11,
    "height": 11,
    "map": [
        ["B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B"],
        ["B", " ", " ", " ", " ", " ", " ", " ", " ", " ", "B"],
        ["B", " ", "c", " ", " ", " ", " ", " ", "c", " ", "B"],
        ["B", " ", " ", " ", "c", "M2", "c", " ", " ", " ", "B"],
        ["B", " ", " ", "c", " ", " ", " ", "c", " ", " ", "B"],
        ["B", " ", " ", "M1", " ", "c", " ", "M3", " ", " ", "B"],
        ["B", " ", " ", "c", " ", " ", " ", "c", " ", " ", "B"],
        ["B", " ", " ", " ", "c", " ", "c", " ", " ", " ", "B"],
        ["B", " ", "c", " ", " ", " ", " ", " ", "c", " ", "B"],
        ["B", " ", " ", " ", " ", " ", " ", " ", " ", " ", "B"],
        ["B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B"]

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