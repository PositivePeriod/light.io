var mapData = { "width": 10, "height": 10, "map": null };

mapData.map = Array(mapData.width).fill(null).map(() => Array(mapData.height).fill("R"));
for (var i = 1; i < mapData.width - 1; i++) {
    for (var j = 1; j < mapData.height - 1; j++) {
        mapData.map[i][j] = Math.random() > 0.2 ? " " : Math.random() > 0.1 ? "R" : "C";
    }
}
mapData.map[1][1] = "M1";
mapData.map[1][2] = "M2";
mapData.map[1][3] = "M3";

const _mapData = Object.freeze(mapData);
export { _mapData as mapData }