/**
 * @fileoverview Pattern Generation Library
 * 
 * Procedural pattern generators including Truchet tiles, gratings, and moiré effects.
 * All functions are pure and stateless.
 * 
 * @module patterns/pattern-generators
 */

// ═══════════════════════════════════════════════════════════════════════════
// TRUCHET TILES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate Truchet tile grid states
 *
 * @source blog/ideas/reference documentation/18_Pattern_Generation/Truchet_tiles.md
 * @wikipedia https://en.wikipedia.org/wiki/Truchet_tiles
 * @section Quarter-Circle Truchet (Smith Tiles)
 * @formula s_{i,j} \in \{0, 1\} determines tile orientation
 *
 * @param {number} cols - Number of columns
 * @param {number} rows - Number of rows
 * @param {number} [seed=0] - Random seed
 * @returns {Uint8Array} Flat array of tile states (0 or 1)
 */
export function generateTruchetGrid(cols, rows, seed = 0) {
    const grid = new Uint8Array(cols * rows);
    
    for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
            grid[j * cols + i] = hashTile(i, j, seed) & 1;
        }
    }
    
    return grid;
}

/**
 * Get Truchet tile arcs for rendering
 * 
 * @param {number} i - Column index
 * @param {number} j - Row index
 * @param {number} state - Tile state (0 or 1)
 * @param {number} size - Tile size in pixels
 * @returns {Array<{cx: number, cy: number, r: number, startAngle: number, endAngle: number}>}
 */
export function getTruchetArcs(i, j, state, size) {
    const x = i * size;
    const y = j * size;
    const r = size / 2;
    
    if (state === 0) {
        return [
            { cx: x, cy: y, r, startAngle: 0, endAngle: Math.PI / 2 },
            { cx: x + size, cy: y + size, r, startAngle: Math.PI, endAngle: 3 * Math.PI / 2 }
        ];
    } else {
        return [
            { cx: x + size, cy: y, r, startAngle: Math.PI / 2, endAngle: Math.PI },
            { cx: x, cy: y + size, r, startAngle: 3 * Math.PI / 2, endAngle: 2 * Math.PI }
        ];
    }
}

/**
 * Evaluate Truchet tile at a point (SDF-like)
 * Returns distance to nearest arc edge
 * 
 * @param {number} px - X coordinate
 * @param {number} py - Y coordinate
 * @param {number} tileSize - Size of each tile
 * @param {Uint8Array} grid - Tile states
 * @param {number} cols - Grid columns
 * @param {number} strokeWidth - Arc stroke width
 * @returns {number} Distance to arc (negative inside stroke)
 */
export function truchetSDF(px, py, tileSize, grid, cols, strokeWidth) {
    const i = Math.floor(px / tileSize);
    const j = Math.floor(py / tileSize);
    const idx = j * cols + i;
    const state = grid[idx] || 0;
    
    const lx = px - i * tileSize;
    const ly = py - j * tileSize;
    const r = tileSize / 2;
    
    let minDist = Infinity;
    
    const arcs = getTruchetArcs(0, 0, state, tileSize);
    for (const arc of arcs) {
        const dx = lx - arc.cx;
        const dy = ly - arc.cy;
        const dist = Math.abs(Math.sqrt(dx * dx + dy * dy) - r);
        minDist = Math.min(minDist, dist);
    }
    
    return minDist - strokeWidth / 2;
}

// ═══════════════════════════════════════════════════════════════════════════
// GRATING PATTERNS (for Moiré)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Linear grating intensity
 * 
 * @param {number} x - X coordinate
 * @param {number} wavelength - Grating period
 * @param {number} [phase=0] - Phase offset (0 to 1)
 * @param {number} [angle=0] - Rotation angle in radians
 * @returns {number} Intensity [0, 1]
 */
export function linearGrating(x, y, wavelength, phase = 0, angle = 0) {
    const rotX = x * Math.cos(angle) + y * Math.sin(angle);
    return 0.5 * (1 + Math.cos(2 * Math.PI * (rotX / wavelength + phase)));
}

/**
 * Radial grating intensity (concentric rings)
 * 
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} cx - Center X
 * @param {number} cy - Center Y
 * @param {number} wavelength - Ring spacing
 * @param {number} [phase=0] - Phase offset
 * @returns {number} Intensity [0, 1]
 */
export function radialGrating(x, y, cx, cy, wavelength, phase = 0) {
    const r = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    return 0.5 * (1 + Math.cos(2 * Math.PI * (r / wavelength + phase)));
}

/**
 * Angular grating intensity (spokes)
 * 
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} cx - Center X
 * @param {number} cy - Center Y
 * @param {number} n - Number of lobes
 * @param {number} [phase=0] - Angular phase offset (radians)
 * @returns {number} Intensity [0, 1]
 */
export function angularGrating(x, y, cx, cy, n, phase = 0) {
    const theta = Math.atan2(y - cy, x - cx);
    return 0.5 * (1 + Math.cos(n * theta + phase));
}

/**
 * Spiral grating (combined radial + angular)
 * 
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} cx - Center X
 * @param {number} cy - Center Y
 * @param {number} wavelength - Radial wavelength
 * @param {number} spiralRate - Angular twist per revolution
 * @param {number} [phase=0] - Phase offset
 * @returns {number} Intensity [0, 1]
 */
export function spiralGrating(x, y, cx, cy, wavelength, spiralRate, phase = 0) {
    const dx = x - cx;
    const dy = y - cy;
    const r = Math.sqrt(dx * dx + dy * dy);
    const theta = Math.atan2(dy, dx);
    const u = r / wavelength + spiralRate * theta / (2 * Math.PI);
    return 0.5 * (1 + Math.cos(2 * Math.PI * (u + phase)));
}

// ═══════════════════════════════════════════════════════════════════════════
// MOIRÉ COMBINATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Combine two grating intensities
 * 
 * @param {number} i1 - First grating intensity
 * @param {number} i2 - Second grating intensity
 * @param {'product'|'sum'|'min'|'max'|'xor'} [mode='product'] - Combination mode
 * @returns {number} Combined intensity
 */
export function combineMoire(i1, i2, mode = 'product') {
    switch (mode) {
        case 'product': return i1 * i2;
        case 'sum': return Math.min(1, (i1 + i2) / 2);
        case 'min': return Math.min(i1, i2);
        case 'max': return Math.max(i1, i2);
        case 'xor': return Math.abs(i1 - i2);
        default: return i1 * i2;
    }
}

/**
 * Apply threshold to grating intensity
 * 
 * @param {number} intensity - Input intensity [0, 1]
 * @param {number} threshold - Threshold value [0, 1]
 * @param {boolean} [smooth=false] - Use smoothstep instead of hard threshold
 * @param {number} [smoothness=0.1] - Smoothstep width
 * @returns {number} Thresholded value (0 or 1, or smooth transition)
 */
export function thresholdGrating(intensity, threshold, smooth = false, smoothness = 0.1) {
    if (!smooth) {
        return intensity > threshold ? 1 : 0;
    }
    
    const t = (intensity - threshold + smoothness / 2) / smoothness;
    return Math.max(0, Math.min(1, t * t * (3 - 2 * t)));
}

// ═══════════════════════════════════════════════════════════════════════════
// SUPERELLIPSE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Superellipse implicit function
 * 
 * Formula: |x/a|^n + |y/b|^n - 1
 * 
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} a - Semi-axis X
 * @param {number} b - Semi-axis Y
 * @param {number} n - Exponent (2=ellipse, >2=rounded rect, <2=star)
 * @returns {number} <0 inside, =0 on boundary, >0 outside
 */
export function superellipse(x, y, a, b, n) {
    return Math.pow(Math.abs(x / a), n) + Math.pow(Math.abs(y / b), n) - 1;
}

/**
 * Superellipse parametric point
 * 
 * @param {number} theta - Angle [0, 2π)
 * @param {number} a - Semi-axis X
 * @param {number} b - Semi-axis Y
 * @param {number} n - Exponent
 * @returns {{x: number, y: number}} Point on superellipse
 */
export function superellipsePoint(theta, a, b, n) {
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    const exp = 2 / n;
    return {
        x: a * Math.sign(c) * Math.pow(Math.abs(c), exp),
        y: b * Math.sign(s) * Math.pow(Math.abs(s), exp)
    };
}

/**
 * Generate superellipse points for rendering
 * 
 * @param {number} a - Semi-axis X
 * @param {number} b - Semi-axis Y
 * @param {number} n - Exponent
 * @param {number} [segments=64] - Number of points
 * @returns {Array<{x: number, y: number}>} Array of points
 */
export function superellipsePoints(a, b, n, segments = 64) {
    const points = [];
    for (let i = 0; i < segments; i++) {
        const theta = (2 * Math.PI * i) / segments;
        points.push(superellipsePoint(theta, a, b, n));
    }
    return points;
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hash function for tile state generation
 * 
 * @param {number} i - Column index
 * @param {number} j - Row index
 * @param {number} seed - Random seed
 * @returns {number} Hash value
 */
function hashTile(i, j, seed) {
    let h = seed >>> 0;
    h = ((h ^ i) * 0x45d9f3b) >>> 0;
    h = ((h ^ j) * 0x45d9f3b) >>> 0;
    h = ((h >> 16) ^ h) >>> 0;
    return h;
}

function _truchetSDFFromSeed(px, py, tileSize, seed, strokeWidth) {
    const i = Math.floor(px / tileSize);
    const j = Math.floor(py / tileSize);
    const state = hashTile(i, j, seed) & 1;
    const lx = px - i * tileSize;
    const ly = py - j * tileSize;
    const r = tileSize / 2;
    let minDist = Infinity;
    const arcs = getTruchetArcs(0, 0, state, tileSize);
    for (const arc of arcs) {
        const dx = lx - arc.cx;
        const dy = ly - arc.cy;
        const dist = Math.abs(Math.sqrt(dx * dx + dy * dy) - r);
        minDist = Math.min(minDist, dist);
    }
    return minDist - strokeWidth / 2;
}

function _gratingPhaseU(x, y, mode, params) {
    const period = params.wavelength ?? params.period ?? 8;
    switch (mode) {
        case 'linear': {
            const angle = params.angle ?? 0;
            const rotX = x * Math.cos(angle) + y * Math.sin(angle);
            return rotX / period + (params.phase ?? 0);
        }
        case 'radial': {
            const cx = params.cx ?? 0;
            const cy = params.cy ?? 0;
            const r = Math.hypot(x - cx, y - cy);
            return r / period + (params.phase ?? 0);
        }
        case 'angular': {
            const cx = params.cx ?? 0;
            const cy = params.cy ?? 0;
            const n = params.n ?? 8;
            const theta = Math.atan2(y - cy, x - cx);
            return (n * theta) / (Math.PI * 2) + (params.phase ?? 0);
        }
        case 'spiral': {
            const cx = params.cx ?? 0;
            const cy = params.cy ?? 0;
            const spiralRate = params.spiralRate ?? 1;
            const dx = x - cx;
            const dy = y - cy;
            const r = Math.sqrt(dx * dx + dy * dy);
            const theta = Math.atan2(dy, dx);
            return r / period + (spiralRate * theta) / (Math.PI * 2) + (params.phase ?? 0);
        }
        default:
            return x / period;
    }
}

/**
 * Per-pixel Truchet field: SDF stroke distance, outward normal, binary mask.
 * @param {number} x
 * @param {number} y
 * @param {number} tileSize
 * @param {number} seed
 * @param {'arcs'|string} [motifSet='arcs']
 * @param {number} [strokeWidth=1]
 * @returns {{ distStroke: number, normal: {x:number,y:number}, mask: number }}
 */
export function truchetTileField2D(x, y, tileSize, seed, motifSet = 'arcs', strokeWidth = 1) {
    void motifSet;
    const eps = Math.max(1e-4, tileSize * 1e-4);
    const distStroke = _truchetSDFFromSeed(x, y, tileSize, seed, strokeWidth);
    const dx =
        (_truchetSDFFromSeed(x + eps, y, tileSize, seed, strokeWidth) -
            _truchetSDFFromSeed(x - eps, y, tileSize, seed, strokeWidth)) /
        (2 * eps);
    const dy =
        (_truchetSDFFromSeed(x, y + eps, tileSize, seed, strokeWidth) -
            _truchetSDFFromSeed(x, y - eps, tileSize, seed, strokeWidth)) /
        (2 * eps);
    const len = Math.hypot(dx, dy) || 1;
    const normal = { x: dx / len, y: dy / len };
    const mask = distStroke < 0 ? 1 : 0;
    return { distStroke, normal, mask };
}

/**
 * N-wave cosine interference, normalised to [0, 1].
 * @param {number} x
 * @param {number} y
 * @param {Array<{ freq?: number, angle?: number, phase?: number, weight?: number }>} waves
 * @returns {number}
 */
export function moireWaveInterference2D(x, y, waves) {
    let sum = 0;
    let wsum = 0;
    const PI2 = Math.PI * 2;
    for (const w of waves) {
        const freq = w.freq ?? 1;
        const angle = w.angle ?? 0;
        const phase = w.phase ?? 0;
        const weight = w.weight ?? 1;
        const phi = PI2 * (freq * (x * Math.cos(angle) + y * Math.sin(angle))) + phase;
        sum += weight * Math.cos(phi);
        wsum += Math.abs(weight);
    }
    const n = wsum > 1e-12 ? sum / wsum : 0;
    return 0.5 * (1 + Math.max(-1, Math.min(1, n)));
}

/**
 * @param {number} x
 * @param {number} y
 * @param {'linear'|'radial'|'angular'|'spiral'} mode
 * @param {object} [params]
 * @returns {{ phi: number, bandIndex: number, distEdge: number, tangent: {x:number,y:number}, normal: {x:number,y:number} }}
 */
export function gratingBandField2D(x, y, mode, params = {}) {
    const period = params.wavelength ?? params.period ?? 8;
    const eps = Math.max(1e-4, period * 1e-4);
    const u0 = _gratingPhaseU(x, y, mode, params);
    const uxp = _gratingPhaseU(x + eps, y, mode, params);
    const uyp = _gratingPhaseU(x, y + eps, mode, params);
    const gx = (uxp - u0) / eps;
    const gy = (uyp - u0) / eps;
    const glen = Math.hypot(gx, gy) || 1;
    const normal = { x: gx / glen, y: gy / glen };
    const tangent = { x: -normal.y, y: normal.x };
    const bandIndex = Math.floor(u0);
    const frac = u0 - bandIndex;
    const distEdge = Math.min(frac, 1 - frac) * period;
    const phi = Math.PI * 2 * u0;
    return { phi, bandIndex, distEdge, tangent, normal };
}

// ── RGBA pixel-buffer API (DISTORT pipeline) ─────────────────────────────────

function _blendPixel(src, dst, i, intensity, blendMode) {
  for (let c = 0; c < 3; c++) {
    const sv = src[i + c] / 255;
    let out;
    if (blendMode === 'multiply') out = sv * intensity;
    else if (blendMode === 'screen') out = 1 - (1 - sv) * (1 - intensity);
    else if (blendMode === 'overlay') out = sv < 0.5 ? 2 * sv * intensity : 1 - 2 * (1 - sv) * (1 - intensity);
    else out = intensity; // replace
    dst[i + c] = Math.round(Math.max(0, Math.min(1, out)) * 255);
  }
  dst[i + 3] = src[i + 3];
}

/**
 * Render Truchet quarter-circle tiles blended onto an RGBA buffer.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} tileSize
 * @param {number} strokeWidth
 * @param {'multiply'|'screen'|'overlay'} blendMode
 * @param {number} seed
 * @returns {Uint8ClampedArray}
 */
export function truchetRGBA(src, w, h, tileSize, strokeWidth, blendMode, seed) {
  const ts = Math.max(5, tileSize), sw = strokeWidth;
  const cols = Math.ceil(w / ts), rows = Math.ceil(h / ts);
  const grid = new Uint8Array(cols * rows);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    let hv = seed ^ (i * 0x45d9f3b);
    hv = ((hv ^ j) * 0x45d9f3b) >>> 0;
    hv = ((hv >> 16) ^ hv) >>> 0;
    grid[j * cols + i] = hv & 1;
  }
  const dst = new Uint8ClampedArray(src);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const ti = Math.floor(x / ts), tj = Math.floor(y / ts);
    const st = grid[Math.min(tj, rows - 1) * cols + Math.min(ti, cols - 1)];
    const lx = x - ti * ts, ly = y - tj * ts, r = ts / 2;
    let minDist = Infinity;
    if (st === 0) {
      minDist = Math.min(minDist, Math.abs(Math.sqrt(lx * lx + ly * ly) - r));
      const dx2 = lx - ts, dy2 = ly - ts;
      minDist = Math.min(minDist, Math.abs(Math.sqrt(dx2 * dx2 + dy2 * dy2) - r));
    } else {
      const dx1 = lx - ts;
      minDist = Math.min(minDist, Math.abs(Math.sqrt(dx1 * dx1 + ly * ly) - r));
      const dy2 = ly - ts;
      minDist = Math.min(minDist, Math.abs(Math.sqrt(lx * lx + dy2 * dy2) - r));
    }
    const pat = minDist < sw / 2 ? 0 : 255;
    _blendPixel(src, dst, (y * w + x) * 4, pat / 255, blendMode);
  }
  return dst;
}

/**
 * Generate a moiré interference pattern blended onto an RGBA buffer.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} wavelength1   @param {number} angle1
 * @param {number} wavelength2   @param {number} angle2
 * @param {'product'|'sum'|'xor'|'min'|'max'} combineMode
 * @param {'multiply'|'screen'|'replace'} blendMode
 * @returns {Uint8ClampedArray}
 */
export function moireRGBA(src, w, h, wavelength1, angle1, wavelength2, angle2, combineMode, blendMode) {
  const r1 = angle1 * Math.PI / 180, r2 = angle2 * Math.PI / 180, PI2 = Math.PI * 2;
  const dst = new Uint8ClampedArray(src.length);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const rx1 = x * Math.cos(r1) + y * Math.sin(r1), rx2 = x * Math.cos(r2) + y * Math.sin(r2);
    const i1 = 0.5 * (1 + Math.cos(PI2 * rx1 / wavelength1));
    const i2 = 0.5 * (1 + Math.cos(PI2 * rx2 / wavelength2));
    let v;
    if (combineMode === 'product') v = i1 * i2;
    else if (combineMode === 'sum') v = Math.min(1, (i1 + i2) / 2);
    else if (combineMode === 'xor') v = Math.abs(i1 - i2);
    else if (combineMode === 'min') v = Math.min(i1, i2);
    else v = Math.max(i1, i2);
    _blendPixel(src, dst, (y * w + x) * 4, v, blendMode);
  }
  return dst;
}

/**
 * Halftone dot pattern — luminance-modulated circle dots on a flat background.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} spacing      @param {number} angle (degrees)
 * @param {number} minDot       @param {number} maxDot  (radii in pixels)
 * @param {number} bgLevel      @param {number} dotLevel (0-255)
 * @returns {Uint8ClampedArray}
 */
export function halftonePatternRGBA(
  src, w, h, spacing, angle, minDot, maxDot, bgLevel, dotLevel,
  gridType = 'square', responseSource = 'luminance', responseCurve = 'linear',
  invert = false, softClamp = false
) {
  const cosA = Math.cos(angle * Math.PI / 180), sinA = Math.sin(angle * Math.PI / 180);
  const dst = new Uint8ClampedArray(src.length);
  for (let i = 0, n = w * h * 4; i < n; i += 4) { dst[i] = dst[i + 1] = dst[i + 2] = bgLevel; dst[i + 3] = src[i + 3]; }

  // Build response field
  const field = new Float32Array(w * h);
  if (responseSource === 'luminance') {
    for (let i = 0; i < w * h; i++) { const j = i * 4; field[i] = (src[j] * 0.299 + src[j + 1] * 0.587 + src[j + 2] * 0.114) / 255; }
  } else if (responseSource === 'red') {
    for (let i = 0; i < w * h; i++) field[i] = src[i * 4] / 255;
  } else if (responseSource === 'green') {
    for (let i = 0; i < w * h; i++) field[i] = src[i * 4 + 1] / 255;
  } else if (responseSource === 'blue') {
    for (let i = 0; i < w * h; i++) field[i] = src[i * 4 + 2] / 255;
  } else if (responseSource === 'alpha') {
    for (let i = 0; i < w * h; i++) field[i] = src[i * 4 + 3] / 255;
  } else if (responseSource === 'hue') {
    for (let i = 0; i < w * h; i++) {
      const j = i * 4, r = src[j] / 255, g = src[j + 1] / 255, b = src[j + 2] / 255;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
      if (d === 0) { field[i] = 0; continue; }
      let h6 = mx === r ? (g - b) / d : mx === g ? 2 + (b - r) / d : 4 + (r - g) / d;
      field[i] = (((h6 / 6) % 1) + 1) % 1;
    }
  } else if (responseSource === 'saturation') {
    for (let i = 0; i < w * h; i++) {
      const j = i * 4, r = src[j] / 255, g = src[j + 1] / 255, b = src[j + 2] / 255;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      field[i] = mx === 0 ? 0 : (mx - mn) / mx;
    }
  } else if (responseSource === 'gradientMagnitude') {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const gx2 = x < w - 1 ? x + 1 : x, gx0 = x > 0 ? x - 1 : x;
      const gy2 = y < h - 1 ? y + 1 : y, gy0 = y > 0 ? y - 1 : y;
      const lum = (v) => { const j = v * 4; return (src[j] * 0.299 + src[j + 1] * 0.587 + src[j + 2] * 0.114) / 255; };
      const sx = lum(y * w + gx2) - lum(y * w + gx0);
      const sy = lum(gy2 * w + x) - lum(gy0 * w + x);
      field[i] = Math.min(1, Math.sqrt(sx * sx + sy * sy));
    }
  } else if (responseSource === 'distanceToEdge') {
    const tmp = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) { const j = i * 4; tmp[i] = (src[j] * 0.299 + src[j + 1] * 0.587 + src[j + 2] * 0.114) / 255; }
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const dx = Math.min(x, w - 1 - x), dy = Math.min(y, h - 1 - y);
      field[y * w + x] = Math.min(1, Math.min(dx, dy) / (Math.min(w, h) * 0.1 + 1));
    }
  } else {
    for (let i = 0; i < w * h; i++) { const j = i * 4; field[i] = (src[j] * 0.299 + src[j + 1] * 0.587 + src[j + 2] * 0.114) / 255; }
  }

  function applyResponseCurve(v) {
    if (responseCurve === 'smoothstep') return v * v * (3 - 2 * v);
    if (responseCurve === 'exponential') return v * v;
    if (responseCurve === 'threshold') return v >= 0.5 ? 1 : 0;
    if (responseCurve === 'stepped') return Math.round(v * 4) / 4;
    return v;
  }

  function computeRadius(fieldVal) {
    let v = applyResponseCurve(invert ? 1 - fieldVal : fieldVal);
    const radius = minDot + (1 - v) * (maxDot - minDot);
    if (softClamp) {
      const t = Math.max(0, Math.min(1, (radius - minDot) / (maxDot - minDot + 0.001)));
      return minDot + t * t * (3 - 2 * t) * (maxDot - minDot);
    }
    return Math.max(minDot, Math.min(maxDot, radius));
  }

  const diag = Math.sqrt(w * w + h * h), numI = Math.ceil(diag / spacing) * 2;

  for (let gi = -numI; gi <= numI; gi++) for (let gj = -numI; gj <= numI; gj++) {
    let gx = gi * spacing, gy = gj * spacing;
    // Grid type offsets
    if (gridType === 'hexagonal' && (gi & 1)) gy += spacing * 0.5;
    else if (gridType === 'staggered' && (gj & 1)) gx += spacing * 0.5;
    const px = Math.round(w / 2 + gx * cosA - gy * sinA);
    const py = Math.round(h / 2 + gx * sinA + gy * cosA);
    if (px < 0 || px >= w || py < 0 || py >= h) continue;
    const radius = computeRadius(field[py * w + px]);
    const r2 = radius * radius, ir = Math.ceil(radius);
    for (let dy = -ir; dy <= ir; dy++) { const ny = py + dy; if (ny < 0 || ny >= h) continue;
      for (let dx = -ir; dx <= ir; dx++) { const nx = px + dx; if (nx < 0 || nx >= w) continue;
        if (dx * dx + dy * dy <= r2) { const oi = (ny * w + nx) * 4; dst[oi] = dst[oi + 1] = dst[oi + 2] = dotLevel; }
      }
    }
  }
  return dst;
}

/**
 * Sine grating pattern (linear, radial, angular, or spiral) blended onto RGBA.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {'linear'|'radial'|'angular'|'spiral'} type
 * @param {number} wavelength   @param {number} phase [0,1]
 * @param {number} angle (degrees)  @param {number} spiralRate
 * @param {'multiply'|'screen'|'replace'} blendMode
 * @returns {Uint8ClampedArray}
 */
export function gratingRGBA(src, w, h, type, wavelength, phase, angle, spiralRate, blendMode) {
  const cx = w / 2, cy = h / 2, rad = angle * Math.PI / 180, PI2 = Math.PI * 2;
  const dst = new Uint8ClampedArray(src.length);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let intensity;
    if (type === 'linear') {
      const rx = x * Math.cos(rad) + y * Math.sin(rad);
      intensity = 0.5 * (1 + Math.cos(PI2 * (rx / wavelength + phase)));
    } else if (type === 'radial') {
      const r = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      intensity = 0.5 * (1 + Math.cos(PI2 * (r / wavelength + phase)));
    } else if (type === 'angular') {
      const theta = Math.atan2(y - cy, x - cx);
      intensity = 0.5 * (1 + Math.cos(wavelength * theta + phase * PI2));
    } else {
      const dx = x - cx, dy2 = y - cy, r = Math.sqrt(dx * dx + dy2 * dy2), theta = Math.atan2(dy2, dx);
      intensity = 0.5 * (1 + Math.cos(PI2 * (r / wavelength + spiralRate * theta / PI2 + phase)));
    }
    _blendPixel(src, dst, (y * w + x) * 4, intensity, blendMode);
  }
  return dst;
}

