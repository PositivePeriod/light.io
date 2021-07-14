class Shadow {
    constructor() {
        this.static = [];
        this.dynamic = [];
    }



    calcVisibleArea(center, walls) {
        var endPoints = [];
        walls.forEach(wall => {
            wall.setCenter(center);
            endPoints.push(wall.p1, wall.p2);
        })
    
        var endPointCompare = (p1, p2) => {
            if (p1.centeredTheta > p2.centeredTheta) return 1;
            if (p1.centeredTheta < p2.centeredTheta) return -1;
            if (!p1.beginLine && p2.beginLine) return 1;
            if (p1.beginLine && !p2.beginLine) return -1;
            return 0;
        }
        endPoints.sort(endPointCompare);
    
        let openSegments = [];
        let output = [];
        let beginAngle = 0;
    
        for (let pass = 0; pass < 2; pass += 1) {
            for (let i = 0; i < endPoints.length; i += 1) {
                let endpoint = endPoints[i];
                let openSegment = openSegments[0];
    
                if (endpoint.beginLine) {
                    var segment = openSegments.find(segment => { return !segment || !segmentInFrontOf(endpoint.line, segment, center) });
    
                    // push
                    if (!segment) {
                        openSegments.push(endpoint.line);
                    } else {
                        var index = openSegments.indexOf(segment);
                        openSegments.splice(index, 0, endpoint.line);
                    }
                } else {
                    // remove
                    var index = openSegments.indexOf(endpoint.line)
                    if (index > -1) openSegments.splice(index, 1);
                }
    
                if (openSegment !== openSegments[0]) {
                    if (pass === 1) {
                        var trianglePoints = openSegment.getTriPoints(center, beginAngle, endpoint.centeredTheta);
                        output.push(trianglePoints);
                    }
                    beginAngle = endpoint.centeredTheta;
                }
            }
        }
        return output
    }
}



export function rayTracing(center, walls) {
    var endPoints = [];
    walls.forEach(wall => {
        wall.setCenter(center);
        endPoints.push(wall.p1, wall.p2);
    })

    var endPointCompare = (p1, p2) => {
        if (p1.centeredTheta > p2.centeredTheta) return 1;
        if (p1.centeredTheta < p2.centeredTheta) return -1;
        if (!p1.beginLine && p2.beginLine) return 1;
        if (p1.beginLine && !p2.beginLine) return -1;
        return 0;
    }
    endPoints.sort(endPointCompare);

    let openSegments = [];
    let output = [];
    let beginAngle = 0;

    for (let pass = 0; pass < 2; pass += 1) {
        for (let i = 0; i < endPoints.length; i += 1) {
            let endpoint = endPoints[i];
            let openSegment = openSegments[0];

            if (endpoint.beginLine) {
                var segment = openSegments.find(segment => { return !segment || !segmentInFrontOf(endpoint.line, segment, center) });

                // push
                if (!segment) {
                    openSegments.push(endpoint.line);
                } else {
                    var index = openSegments.indexOf(segment);
                    openSegments.splice(index, 0, endpoint.line);
                }
            } else {
                // remove
                var index = openSegments.indexOf(endpoint.line)
                if (index > -1) openSegments.splice(index, 1);
            }

            if (openSegment !== openSegments[0]) {
                if (pass === 1) {
                    var trianglePoints = openSegment.getTriPoints(center, beginAngle, endpoint.centeredTheta);
                    output.push(trianglePoints);
                }
                beginAngle = endpoint.centeredTheta;
            }
        }
    }
    return output
}