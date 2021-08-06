export const mapData = Object.freeze({
    "name": "mapLobby",
    "width": ,
    "height": 7,
    "map": [
        ["R", "R", "R", "R", "R", "R", "R"],
        ["R", " ", " ", "s", " ", " ", "R"],
        ["R", " ", " ", " ", " ", " ", "R"],
        ["R", " ", "t1", "t2", "t3", " ", "R"],
        ["R", " ", " ", "M1", " ", " ", "R"],
        ["R", " ", " ", " ", " ", " ", "R"],
        ["R", "R", "R", "R", "R", "R", "R"]

    ],
    "object": {
        "M1": {
            "color": "LightGray",
            "visibleRange": 500,
            "mass": 1,
            "friction": 0.001,
            "movingForceMag": 1000,
            "movingKey": { "KeyW": { x: 0, y: -1 }, "KeyA": { x: -1, y: 0 }, "KeyS": { x: 0, y: 1 }, "KeyD": { x: 1, y: 0 } }
        },
        "t1": { "color": "Red" },
        "t2": { "color": "Green" },
        "t3": { "color": "Blue" }

    }
});