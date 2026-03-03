/**
 * @fileoverview Signed Distance Function Operations
 * 
 * SDF primitives, boolean operations, and transformations.
 * All functions are pure and stateless.
 * 
 * @module geometry/sdf-operations
 */

// ═══════════════════════════════════════════════════════════════════════════
// SDF PRIMITIVES (2D)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Circle SDF
 *
 * @source blog/ideas/reference documentation/13_Distance_Morphology_Topology/Signed_distance_function.md
 * @wikipedia https://en.wikipedia.org/wiki/Signed_distance_function
 * @section 3.1 Circle/Sphere
 * @formula \text{SDF}_{\text{circle}}(\mathbf{p}, c, r) = \|\mathbf{p} - c\| - r
 *
 * @param {number} px - Point X
 * @param {number} py - Point Y
 * @param {number} cx - Center X
 * @param {number} cy - Center Y
 * @param {number} r - Radius
 * @returns {number} Signed distance (negative inside)
 */
export function sdfCircle(px, py, cx, cy, r) {
    const dx = px - cx;
    const dy = py - cy;
    return Math.sqrt(dx * dx + dy * dy) - r;
}

/**
 * Box SDF (axis-aligned)
 *
 * @source blog/ideas/reference documentation/13_Distance_Morphology_Topology/Signed_distance_function.md
 * @wikipedia https://en.wikipedia.org/wiki/Signed_distance_function
 * @section 3.2 Box (Axis-Aligned)
 * @formula \text{SDF}_{\text{box}}(\mathbf{p}, b) = \|\max(|\mathbf{p}| - b, 0)\| + \min(\max(|p_x| - b_x, |p_y| - b_y), 0)
 *
 * @param {number} px - Point X
 * @param {number} py - Point Y
 * @param {number} cx - Center X
 * @param {number} cy - Center Y
 * @param {number} hw - Half-width
 * @param {number} hh - Half-height
 * @returns {number} Signed distance
 */
export function sdfBox(px, py, cx, cy, hw, hh) {
    const dx = Math.abs(px - cx) - hw;
    const dy = Math.abs(py - cy) - hh;
    const outside = Math.sqrt(Math.max(dx, 0) ** 2 + Math.max(dy, 0) ** 2);
    const inside = Math.min(Math.max(dx, dy), 0);
    return outside + inside;
}

/**
 * Rounded box SDF
 * 
 * @param {number} px - Point X
 * @param {number} py - Point Y
 * @param {number} cx - Center X
 * @param {number} cy - Center Y
 * @param {number} hw - Half-width
 * @param {number} hh - Half-height
 * @param {number} r - Corner radius
 * @returns {number} Signed distance
 */
export function sdfRoundedBox(px, py, cx, cy, hw, hh, r) {
    return sdfBox(px, py, cx, cy, hw - r, hh - r) - r;
}

/**
 * Line segment SDF
 * 
 * @param {number} px - Point X
 * @param {number} py - Point Y
 * @param {number} ax - Start X
 * @param {number} ay - Start Y
 * @param {number} bx - End X
 * @param {number} by - End Y
 * @returns {number} Distance to segment
 */
export function sdfSegment(px, py, ax, ay, bx, by) {
    const pax = px - ax, pay = py - ay;
    const bax = bx - ax, bay = by - ay;
    const h = Math.max(0, Math.min(1, (pax * bax + pay * bay) / (bax * bax + bay * bay)));
    const dx = pax - bax * h;
    const dy = pay - bay * h;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Polygon SDF (convex or concave)
 * 
 * @param {number} px - Point X
 * @param {number} py - Point Y
 * @param {Array<{x: number, y: number}>} vertices - Polygon vertices
 * @returns {number} Signed distance
 */
export function sdfPolygon(px, py, vertices) {
    const n = vertices.length;
    let d = Infinity;
    let s = 1;
    
    for (let i = 0, j = n - 1; i < n; j = i++) {
        const vi = vertices[i], vj = vertices[j];
        const ex = vj.x - vi.x, ey = vj.y - vi.y;
        const wx = px - vi.x, wy = py - vi.y;
        const b = Math.max(0, Math.min(1, (wx * ex + wy * ey) / (ex * ex + ey * ey)));
        const dx = wx - ex * b, dy = wy - ey * b;
        d = Math.min(d, dx * dx + dy * dy);
        
        // Winding number for inside/outside
        const c1 = py >= vi.y;
        const c2 = py < vj.y;
        const c3 = ex * wy > ey * wx;
        if ((c1 && c2 && c3) || (!c1 && !c2 && !c3)) s *= -1;
    }
    
    return s * Math.sqrt(d);
}

// ═══════════════════════════════════════════════════════════════════════════
// BOOLEAN OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * SDF Union (min)
 * 
 * @param {number} d1 - First SDF value
 * @param {number} d2 - Second SDF value
 * @returns {number} Union distance
 */
export function sdfUnion(d1, d2) {
    return Math.min(d1, d2);
}

/**
 * SDF Intersection (max)
 * 
 * @param {number} d1 - First SDF value
 * @param {number} d2 - Second SDF value
 * @returns {number} Intersection distance
 */
export function sdfIntersection(d1, d2) {
    return Math.max(d1, d2);
}

/**
 * SDF Subtraction
 * 
 * @param {number} d1 - Base SDF value
 * @param {number} d2 - Subtracting SDF value
 * @returns {number} Subtraction distance
 */
export function sdfSubtraction(d1, d2) {
    return Math.max(d1, -d2);
}

/**
 * Smooth Union (polynomial)
 * 
 * @param {number} d1 - First SDF value
 * @param {number} d2 - Second SDF value
 * @param {number} k - Smoothing factor (larger = smoother)
 * @returns {number} Smooth union distance
 */
export function sdfSmoothUnion(d1, d2, k) {
    const h = Math.max(0, Math.min(1, 0.5 + 0.5 * (d2 - d1) / k));
    return d2 * (1 - h) + d1 * h - k * h * (1 - h);
}

/**
 * Smooth Subtraction
 * 
 * @param {number} d1 - Base SDF value
 * @param {number} d2 - Subtracting SDF value
 * @param {number} k - Smoothing factor
 * @returns {number} Smooth subtraction distance
 */
export function sdfSmoothSubtraction(d1, d2, k) {
    const h = Math.max(0, Math.min(1, 0.5 - 0.5 * (d2 + d1) / k));
    return d1 * (1 - h) + (-d2) * h + k * h * (1 - h);
}

/**
 * Smooth Intersection
 * 
 * @param {number} d1 - First SDF value
 * @param {number} d2 - Second SDF value
 * @param {number} k - Smoothing factor
 * @returns {number} Smooth intersection distance
 */
export function sdfSmoothIntersection(d1, d2, k) {
    const h = Math.max(0, Math.min(1, 0.5 - 0.5 * (d2 - d1) / k));
    return d2 * (1 - h) + d1 * h + k * h * (1 - h);
}

// ═══════════════════════════════════════════════════════════════════════════
// DOMAIN OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Infinite repetition
 * 
 * @param {number} p - Coordinate
 * @param {number} c - Cell size
 * @returns {number} Repeated coordinate (centered in cell)
 */
export function sdfRepeat(p, c) {
    return ((p % c) + c) % c - c * 0.5;
}

/**
 * Limited repetition
 * 
 * @param {number} p - Coordinate
 * @param {number} c - Cell size
 * @param {number} limit - Max repetitions in each direction
 * @returns {number} Repeated coordinate (clamped)
 */
export function sdfRepeatLimited(p, c, limit) {
    return p - c * Math.max(-limit, Math.min(limit, Math.round(p / c)));
}

/**
 * Rotation (2D)
 * 
 * @param {number} px - Point X
 * @param {number} py - Point Y
 * @param {number} angle - Rotation angle (radians)
 * @returns {{x: number, y: number}} Rotated point
 */
export function sdfRotate(px, py, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return {
        x: px * c - py * s,
        y: px * s + py * c
    };
}

/**
 * Round (expand) SDF
 * 
 * @param {number} d - SDF value
 * @param {number} r - Rounding amount
 * @returns {number} Rounded distance
 */
export function sdfRound(d, r) {
    return d - r;
}

/**
 * Annular (ring/shell) SDF
 * 
 * @param {number} d - SDF value
 * @param {number} thickness - Shell thickness
 * @returns {number} Annular distance
 */
export function sdfAnnular(d, thickness) {
    return Math.abs(d) - thickness;
}

// ═══════════════════════════════════════════════════════════════════════════
// DISTANCE FIELD UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Evaluate SDF grid from function
 * 
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 * @param {Function} sdfFunc - SDF function (x, y) => distance
 * @returns {Float32Array} Distance field
 */
export function evaluateSDFGrid(width, height, sdfFunc) {
    const field = new Float32Array(width * height);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            field[y * width + x] = sdfFunc(x, y);
        }
    }
    
    return field;
}

/**
 * Compute SDF gradient (normal direction)
 * 
 * @param {Float32Array} field - Distance field
 * @param {number} width - Grid width
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {{x: number, y: number}} Normalized gradient
 */
export function sdfGradient(field, width, x, y) {
    const height = field.length / width;
    const x0 = Math.max(0, x - 1);
    const x1 = Math.min(width - 1, x + 1);
    const y0 = Math.max(0, y - 1);
    const y1 = Math.min(height - 1, y + 1);
    
    const dx = field[y * width + x1] - field[y * width + x0];
    const dy = field[y1 * width + x] - field[y0 * width + x];
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    
    return { x: dx / len, y: dy / len };
}

/**
 * Convert SDF to binary mask
 * 
 * @param {Float32Array} field - Distance field
 * @param {number} threshold - Distance threshold (default 0)
 * @returns {Uint8Array} Binary mask (255 inside, 0 outside)
 */
export function sdfToMask(field, threshold = 0) {
    const mask = new Uint8Array(field.length);
    for (let i = 0; i < field.length; i++) {
        mask[i] = field[i] <= threshold ? 255 : 0;
    }
    return mask;
}

/**
 * Anti-aliased SDF rendering
 * 
 * @param {number} d - SDF value
 * @param {number} smoothing - AA width (typically 1-2 pixels)
 * @returns {number} Alpha value [0, 1]
 */
export function sdfAlpha(d, smoothing = 1.0) {
    return 1 - Math.max(0, Math.min(1, d / smoothing + 0.5));
}

// ── RGBA pixel-buffer API (DISTORT pipeline) ─────────────────────────────────

/**
 * Render a single SDF primitive over an RGBA buffer using smooth alpha blending.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {'circle'|'box'|'ring'} shape
 * @param {number} centreX    - Normalised X centre [0, 1]
 * @param {number} centreY    - Normalised Y centre [0, 1]
 * @param {number} size       - Normalised size (fraction of min(w,h)) [0.01, 1]
 * @param {number} softness   - Smoothing width (normalised) [0, 0.2]
 * @param {boolean} invert    - Invert the shape mask
 * @param {number} fillR      - Fill colour red [0, 255]
 * @param {number} fillG      - Fill colour green [0, 255]
 * @param {number} fillB      - Fill colour blue [0, 255]
 * @returns {Uint8ClampedArray}
 */
export function sdfShapeRGBA(src, w, h, shape, centreX, centreY, size, softness, invert, fillR, fillG, fillB) {
  const cx = centreX * w, cy = centreY * h, sz = size * Math.min(w, h);
  const softPx = softness * Math.min(w, h);
  const dst = new Uint8ClampedArray(src.length);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = x - cx, dy = y - cy;
    let dist;
    if (shape === 'circle') dist = Math.sqrt(dx * dx + dy * dy) - sz;
    else if (shape === 'box') { const ax = Math.abs(dx) - sz, ay = Math.abs(dy) - sz; dist = Math.sqrt(Math.max(ax, 0) ** 2 + Math.max(ay, 0) ** 2) + Math.min(Math.max(ax, ay), 0); }
    else dist = Math.abs(Math.sqrt(dx * dx + dy * dy) - sz) - sz * 0.15;
    let alpha = softPx > 0 ? Math.max(0, Math.min(1, 0.5 - dist / softPx)) : (dist < 0 ? 1 : 0);
    if (invert) alpha = 1 - alpha;
    const i = (y * w + x) * 4;
    dst[i]     = Math.round(src[i]     * (1 - alpha) + fillR * alpha);
    dst[i + 1] = Math.round(src[i + 1] * (1 - alpha) + fillG * alpha);
    dst[i + 2] = Math.round(src[i + 2] * (1 - alpha) + fillB * alpha);
    dst[i + 3] = src[i + 3];
  }
  return dst;
}
