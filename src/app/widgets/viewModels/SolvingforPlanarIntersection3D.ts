// private intersect(planePoints: number[], linePoints: number[]) {
    //     // 3 points defining the plane
    //     const x1 = planePoints[0];
    //     const y1 = planePoints[1];
    //     const z1 = planePoints[2];
    //     const x2 = planePoints[3];
    //     const y2 = planePoints[4]; 
    //     const z2 = planePoints[5];
    //     const x3 = planePoints[6];
    //     const y3 = planePoints[7]; 
    //     const z3 = planePoints[8];

    //     // 2 points defining the line
    //     const x4 = linePoints[0];
    //     const y4 = linePoints[1];
    //     const z4 = linePoints[2];
    //     const x5 = linePoints[3];
    //     const y5 = linePoints[4];
    //     const z5 = linePoints[5];

    //     // calculate intersection based on http://mathworld.wolfram.com/Line-PlaneIntersection.html
    //     const mat1 = mat4.fromValues(1, 1, 1, 1, x1, x2, x3, x4, y1, y2, y3, y4, z1, z2, z3, z4);
    //     const mat2 = mat4.fromValues(1, 1, 1, 0, x1, x2, x3, x5 - x4, y1, y2, y3, y5 - y4, z1, z2, z3, z5 - z4);
    //     const det1 = mat4.determinant(mat1);
    //     const det2 = mat4.determinant(mat2);

    //     if (det2 !== 0) {
    //         const t = - det1 / det2;
    //         const intersectionPoint = {
    //             x: x4 + (x5 - x4) * t,
    //             y: y4 + (y5 - y4) * t,
    //             z: z4 + (z5 - z4) * t
    //         };
    //         return intersectionPoint;
    //     }
    //     return null;
    // }

    // private getNonCollinearPoints(_polygon: Polygon) {
    //     // set the first two non-collinear points in the polygon
    //     try {
    //         const x1: any = _polygon.rings[0][0][0];
    //         const y1: any = _polygon.rings[0][0][1];
    //         const z1: any = _polygon.rings[0][0][2];

    //         const x2: any = _polygon.rings[0][1][0];
    //         const y2: any = _polygon.rings[0][1][1];
    //         const z2: any = _polygon.rings[0][1][2];
            
    //         // find the third non-collinear point in the polygon
    //         for (let i = 2; i <= _polygon.rings[0].length; i++) {
    //             let x3: any = _polygon.rings[0][i][0];
    //             let y3: any = _polygon.rings[0][i][1];
    //             let z3: any = _polygon.rings[0][i][2];
    //             if ((x3 - x1) / (x2 - x1) !== (y3 - y1) / (y2 - y1) || (x3 - x1) / (x2 - x1) !== (z3 - z1) / (z2 - z1)) {
    //                 return [x1, y1, z1, x2, y2, z2, x3, y3, z3];
    //             }
    //         }
    //     } catch (e) {
    //             console.log(e);
    //         }
    //     return null;
    // }

    // if (geometryEngine.intersects(poly_geo, base_point)) {
    //     // get a flat array of 3 non-collinear points in the polygon
    //     // we will use these points for the plane equation
    //     // !! need to determine if the basepoint intersects the triangle created by the three points
    //     const planePoints = this.getNonCollinearPoints(poly_geo);

    //     //get a flat array of 2 points that define the line
    //     const linePoints = [].concat.apply([], _line.paths[0]);

    //     // return intersection of the plane and line
    //     if (planePoints) {
    //         return this.intersect(planePoints, linePoints);
    //     } else {
    //         console.error("Polygon ", poly_geo, "doesn't have non-collinear points.");
    //     }
    // }
    // return null;