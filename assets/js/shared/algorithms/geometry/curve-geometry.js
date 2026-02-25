/**
 * @fileoverview Curve Geometry Operations
 * 
 * Extrusion, normals, curvature, and depth sorting.
 * 
 * @module geometry/curve-geometry
 * @source blog/ideas/reference documentation/10_Curve_Theory_Stroke_Geometry/Curvature.md
 * @wikipedia https://en.wikipedia.org/wiki/Curvature
 * 
 * Key equations from reference:
 * @formula Curvature: κ = |dT/ds| where T is unit tangent, s is arc length
 * @formula Plane curve: κ = |x'y'' - y'x''| / (x'² + y'²)^(3/2)
 * @formula Menger curvature: κ = 4A / (|a||b||c|) for triangle with signed area A
 * @formula Radius of curvature: R = 1/κ
 * 
 * Notes:
 * - Curvature vector K is perpendicular to tangent T
 * - Center of curvature: C = P + K/κ²
 * - Signed curvature positive = curving left (CCW)
 */

// ═══════════════════════════════════════════════════════════════════════════
// NORMAL AND TANGENT COMPUTATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Compute tangent vector at each point of a polyline
 * 
 * @param {Array<{x: number, y: number}>} points - Polyline points
 * @returns {Array<{x: number, y: number}>} Tangent vectors (normalized)
 */
export function computeTangents(points) {
    const n = points.length;
    if (n < 2) return [];
    
    const tangents = [];
    
    for (let i = 0; i < n; i++) {
        let dx, dy;
        
        if (i === 0) {
            // Forward difference
            dx = points[1].x - points[0].x;
            dy = points[1].y - points[0].y;
        } else if (i === n - 1) {
            // Backward difference
            dx = points[n - 1].x - points[n - 2].x;
            dy = points[n - 1].y - points[n - 2].y;
        } else {
            // Central difference
            dx = points[i + 1].x - points[i - 1].x;
            dy = points[i + 1].y - points[i - 1].y;
        }
        
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0.0001) {
            tangents.push({ x: dx / len, y: dy / len });
        } else {
            tangents.push({ x: 1, y: 0 });
        }
    }
    
    return tangents;
}

/**
 * Compute normal vectors (perpendicular to tangent)
 * 
 * @param {Array<{x: number, y: number}>} points - Polyline points
 * @param {boolean} [leftHanded=false] - If true, normal points left
 * @returns {Array<{x: number, y: number}>} Normal vectors
 */
export function computeNormals(points, leftHanded = false) {
    const tangents = computeTangents(points);
    const sign = leftHanded ? -1 : 1;
    
    return tangents.map(t => ({
        x: -sign * t.y,
        y: sign * t.x
    }));
}

/**
 * Compute signed curvature at each point
 * 
 * @param {Array<{x: number, y: number}>} points - Polyline points
 * @returns {number[]} Curvature values (positive = curving left)
 */
export function computeCurvature(points) {
    const n = points.length;
    if (n < 3) return new Array(n).fill(0);
    
    const curvatures = [];
    
    for (let i = 0; i < n; i++) {
        if (i === 0 || i === n - 1) {
            curvatures.push(0);
            continue;
        }
        
        const p0 = points[i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        
        // Menger curvature: κ = 4A / (|a||b||c|)
        // where A is signed area of triangle
        const ax = p1.x - p0.x, ay = p1.y - p0.y;
        const bx = p2.x - p1.x, by = p2.y - p1.y;
        const cx = p0.x - p2.x, cy = p0.y - p2.y;
        
        const a = Math.sqrt(ax * ax + ay * ay);
        const b = Math.sqrt(bx * bx + by * by);
        const c = Math.sqrt(cx * cx + cy * cy);
        
        // Signed area via cross product
        const area = (ax * by - ay * bx) / 2;
        
        const denom = a * b * c;
        if (denom > 0.0001) {
            curvatures.push(4 * area / denom);
        } else {
            curvatures.push(0);
        }
    }
    
    return curvatures;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXTRUSION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extrude polyline along normals to create a ribbon
 * 
 * @param {Array<{x: number, y: number}>} centerline - Center points
 * @param {number|number[]} width - Width or per-point widths
 * @returns {{left: Array<{x, y}>, right: Array<{x, y}>}} Ribbon edges
 */
export function extrudeRibbon(centerline, width) {
    const normals = computeNormals(centerline);
    const n = centerline.length;
    
    const widths = typeof width === 'number' 
        ? new Array(n).fill(width) 
        : width;
    
    const left = [];
    const right = [];
    
    for (let i = 0; i < n; i++) {
        const halfW = widths[i] / 2;
        const p = centerline[i];
        const normal = normals[i];
        
        left.push({
            x: p.x + normal.x * halfW,
            y: p.y + normal.y * halfW
        });
        
        right.push({
            x: p.x - normal.x * halfW,
            y: p.y - normal.y * halfW
        });
    }
    
    return { left, right };
}

/**
 * Create ribbon triangles for rendering
 * 
 * @param {Array<{x, y}>} left - Left edge points
 * @param {Array<{x, y}>} right - Right edge points
 * @returns {Array<{a: {x,y}, b: {x,y}, c: {x,y}}>} Triangles
 */
export function ribbonTriangles(left, right) {
    const triangles = [];
    const n = left.length;
    
    for (let i = 0; i < n - 1; i++) {
        // Two triangles per segment
        triangles.push({
            a: left[i],
            b: right[i],
            c: left[i + 1]
        });
        triangles.push({
            a: right[i],
            b: right[i + 1],
            c: left[i + 1]
        });
    }
    
    return triangles;
}

/**
 * Extrude polyline with varying width based on curvature
 * 
 * @param {Array<{x, y}>} centerline - Center points
 * @param {number} baseWidth - Base width
 * @param {number} curvatureFactor - How much curvature affects width
 * @returns {{left: Array<{x, y}>, right: Array<{x, y}>}}
 */
export function extrudeWithCurvature(centerline, baseWidth, curvatureFactor) {
    const curvatures = computeCurvature(centerline);
    const widths = curvatures.map(k => 
        baseWidth * (1 + curvatureFactor * Math.abs(k))
    );
    return extrudeRibbon(centerline, widths);
}

// ═══════════════════════════════════════════════════════════════════════════
// DEPTH SORTING (PAINTER'S ALGORITHM)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Sort objects by depth (back to front)
 * 
 * @param {Array<{z: number, ...rest}>} objects - Objects with z coordinate
 * @returns {Array} Sorted array (back to front)
 */
export function depthSortBackToFront(objects) {
    return [...objects].sort((a, b) => a.z - b.z);
}

/**
 * Sort objects front to back (for z-buffer optimization)
 * 
 * @param {Array<{z: number}>} objects - Objects with z coordinate
 * @returns {Array} Sorted array (front to back)
 */
export function depthSortFrontToBack(objects) {
    return [...objects].sort((a, b) => b.z - a.z);
}

/**
 * Assign depth values to ribbon segments based on Y (screen space)
 * 
 * @param {Array<{a: {x,y}, b: {x,y}, c: {x,y}}>} triangles - Ribbon triangles
 * @param {string} [mode='avgY'] - Depth mode: 'avgY', 'minY', 'maxY'
 * @returns {Array<{...tri, z: number}>} Triangles with depth
 */
export function assignDepthFromY(triangles, mode = 'avgY') {
    return triangles.map(tri => {
        let z;
        switch (mode) {
            case 'minY':
                z = Math.min(tri.a.y, tri.b.y, tri.c.y);
                break;
            case 'maxY':
                z = Math.max(tri.a.y, tri.b.y, tri.c.y);
                break;
            case 'avgY':
            default:
                z = (tri.a.y + tri.b.y + tri.c.y) / 3;
        }
        return { ...tri, z };
    });
}

/**
 * Sort ribbon triangles for proper overlap rendering
 * 
 * @param {Array<{a, b, c}>} triangles - Triangles
 * @param {'y'|'x'|Function} sortKey - Sort by 'y', 'x', or custom function
 * @returns {Array} Sorted triangles
 */
export function sortRibbonTriangles(triangles, sortKey = 'y') {
    let keyFn;
    
    if (sortKey === 'y') {
        keyFn = t => (t.a.y + t.b.y + t.c.y) / 3;
    } else if (sortKey === 'x') {
        keyFn = t => (t.a.x + t.b.x + t.c.x) / 3;
    } else {
        keyFn = sortKey;
    }
    
    return [...triangles].sort((a, b) => keyFn(a) - keyFn(b));
}

// ═══════════════════════════════════════════════════════════════════════════
// CURVE SMOOTHING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Chaikin corner-cutting subdivision
 *
 * Each iteration replaces every edge AB with two points at 25% and 75%
 * along the edge, converging towards a quadratic B-spline.
 *
 * @source https://en.wikipedia.org/wiki/Chaikin%27s_algorithm
 * @formula P_new = [0.75·A + 0.25·B, 0.25·A + 0.75·B]
 *
 * @param {Array<{x: number, y: number}>} points - Input polyline/polygon
 * @param {number} [iterations=2] - Subdivision passes (1–4 typical)
 * @param {boolean} [closed=true] - Treat as closed polygon
 * @returns {Array<{x: number, y: number}>} Smoothed curve
 */
export function chaikinSmooth(points, iterations = 2, closed = true) {
    if (points.length < 3 || iterations <= 0) return [...points];

    let pts = points;

    for (let iter = 0; iter < iterations; iter++) {
        const n = pts.length;
        const out = [];
        const limit = closed ? n : n - 1;

        for (let i = 0; i < limit; i++) {
            const a = pts[i];
            const b = pts[(i + 1) % n];
            out.push({ x: 0.75 * a.x + 0.25 * b.x, y: 0.75 * a.y + 0.25 * b.y });
            out.push({ x: 0.25 * a.x + 0.75 * b.x, y: 0.25 * a.y + 0.75 * b.y });
        }

        if (!closed) {
            out.unshift(pts[0]);
            out.push(pts[n - 1]);
        }

        pts = out;
    }

    return pts;
}

// ═══════════════════════════════════════════════════════════════════════════
// OFFSET CURVES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create offset curve (parallel curve)
 * 
 * @param {Array<{x, y}>} curve - Input curve
 * @param {number} offset - Offset distance (positive = left)
 * @returns {Array<{x, y}>} Offset curve
 */
export function offsetCurve(curve, offset) {
    const normals = computeNormals(curve);
    
    return curve.map((p, i) => ({
        x: p.x + normals[i].x * offset,
        y: p.y + normals[i].y * offset
    }));
}

/**
 * Create multiple offset curves (contour lines)
 * 
 * @param {Array<{x, y}>} curve - Input curve
 * @param {number[]} offsets - Array of offset distances
 * @returns {Array<Array<{x, y}>>} Array of offset curves
 */
export function multipleOffsetCurves(curve, offsets) {
    const normals = computeNormals(curve);
    
    return offsets.map(offset => 
        curve.map((p, i) => ({
            x: p.x + normals[i].x * offset,
            y: p.y + normals[i].y * offset
        }))
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// PSEUDO-3D SHADING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate pseudo-3D shading based on normal direction
 * 
 * @param {Array<{x, y}>} normals - Normal vectors
 * @param {{x: number, y: number}} lightDir - Light direction (normalized)
 * @returns {number[]} Shading values (0-1)
 */
export function normalShading(normals, lightDir) {
    return normals.map(n => {
        const dot = n.x * lightDir.x + n.y * lightDir.y;
        return Math.max(0, Math.min(1, (dot + 1) / 2));
    });
}

/**
 * Calculate rim/edge highlighting
 * 
 * @param {Array<{x, y}>} normals - Normal vectors
 * @param {{x: number, y: number}} viewDir - View direction (normalized)
 * @param {number} [rimPower=2] - Rim falloff power
 * @returns {number[]} Rim intensity values (0-1)
 */
export function rimLighting(normals, viewDir, rimPower = 2) {
    return normals.map(n => {
        const dot = Math.abs(n.x * viewDir.x + n.y * viewDir.y);
        return Math.pow(1 - dot, rimPower);
    });
}

/**
 * Combined shading model
 * 
 * @param {Array<{x, y}>} normals - Normal vectors
 * @param {Object} params - Shading parameters
 * @param {number} params.ambient - Ambient light (0-1)
 * @param {number} params.diffuse - Diffuse strength
 * @param {number} params.rim - Rim light strength
 * @param {{x, y}} params.lightDir - Light direction
 * @returns {number[]} Final shading values
 */
export function combinedShading(normals, params) {
    const { ambient = 0.3, diffuse = 0.5, rim = 0.2, lightDir = { x: 0.7, y: -0.7 } } = params;
    
    const diffuseShading = normalShading(normals, lightDir);
    const rimShading = rimLighting(normals, { x: 0, y: -1 });
    
    return normals.map((_, i) => 
        Math.min(1, ambient + diffuse * diffuseShading[i] + rim * rimShading[i])
    );
}

