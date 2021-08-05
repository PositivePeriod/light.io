export const mapData = Object.freeze({
    "name": "mapMain",
    "width": 11,
    "height": 11,
    "map": [
        ["B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B"],
        ["B", "T", "T", "T", "T", "T", "T", "T", "T", "T", "B"],
        ["B", "T", "b", "T", "T", "T", "T", "T", "b", "T", "B"],
        ["B", "T", "T", "T", "b", "M2", "b", "T", "T", "T", "B"],
        ["B", "T", "T", "b", "T", "T", "T", "b", "T", "T", "B"],
        ["B", "T", "T", "M1", "T", "b", "T", "M3", "T", "T", "B"],
        ["B", "T", "T", "b", "T", "T", "T", "b", "T", "T", "B"],
        ["B", "T", "T", "T", "b", "T", "b", "T", "T", "T", "B"],
        ["B", "T", "b", "T", "T", "T", "T", "T", "b", "T", "B"],
        ["B", "T", "T", "T", "T", "T", "T", "T", "T", "T", "B"],
        ["B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B"]

    ],
    "object": {
        "M1": {
            "color": "Red",
            "visibleRange": 500,
            "mass": 1,
            "friction": 0.001,
            "movingForceMag": 1000,
            "movingKey": { "KeyW": { x: 0, y: -1 }, "KeyA": { x: -1, y: 0 }, "KeyS": { x: 0, y: 1 }, "KeyD": { x: 1, y: 0 } }
        },
        "M2": {
            "color": "Green",
            "visibleRange": 500,
            "mass": 1,
            "friction": 0.001,
            "movingForceMag": 1000,
            "movingKey": { "KeyT": { x: 0, y: -1 }, "KeyF": { x: -1, y: 0 }, "KeyG": { x: 0, y: 1 }, "KeyH": { x: 1, y: 0 } }
        },
        "M3": {
            "color": "Blue",
            "visibleRange": 500,
            "mass": 1,
            "friction": 0.001,
            "movingForceMag": 1000,
            "movingKey": { "KeyI": { x: 0, y: -1 }, "KeyJ": { x: -1, y: 0 }, "KeyK": { x: 0, y: 1 }, "KeyL": { x: 1, y: 0 } }
        }
    }
});