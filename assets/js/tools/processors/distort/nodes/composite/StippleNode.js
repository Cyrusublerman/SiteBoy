import { createEffectModule } from '../../core/EffectModule.js';
import { SeededRNG } from '../../core/SeededRNG.js';

// ── Luminance helpers ─────────────────────────────────────────────────────────

function _buildLuma(src, n) {
  const lum = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const j = i * 4;
    lum[i] = (src[j] * 0.2126 + src[j + 1] * 0.7152 + src[j + 2] * 0.0722) / 255;
  }
  return lum;
}

function _toLinear(v) {
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function _buildLumaLinear(src, n) {
  const lum = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const j = i * 4;
    const r = _toLinear(src[j] / 255);
    const g = _toLinear(src[j + 1] / 255);
    const b = _toLinear(src[j + 2] / 255);
    lum[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  return lum;
}

// ── Density field builders ────────────────────────────────────────────────────

function _sobelMagnitude(lum, w, h) {
  const n = w * h;
  const mag = new Float32Array(n);
  let maxM = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const vx = -lum[i - w - 1] + lum[i - w + 1] - 2 * lum[i - 1] + 2 * lum[i + 1] - lum[i + w - 1] + lum[i + w + 1];
      const vy = -lum[i - w - 1] - 2 * lum[i - w] - lum[i - w + 1] + lum[i + w - 1] + 2 * lum[i + w] + lum[i + w + 1];
      mag[i] = Math.hypot(vx, vy);
      if (mag[i] > maxM) maxM = mag[i];
    }
  }
  if (maxM > 0) for (let i = 0; i < n; i++) mag[i] /= maxM;
  return mag;
}

function _buildSaturation(src, n) {
  const sat = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const j = i * 4;
    const r = src[j] / 255, g = src[j + 1] / 255, b = src[j + 2] / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    sat[i] = mx > 0 ? (mx - mn) / mx : 0;
  }
  return sat;
}

/**
 * Build a [0,1] density field where 1 = maximum dot attraction.
 * For luminance mode: dark (low lum) → high density; light (high lum) → low density.
 * invertTone swaps this mapping.
 */
function _buildDensityField(src, lum, w, h, n, densityMode, invertTone, shadowThreshold, highlightThreshold, toneGamma) {
  let field;

  if (densityMode === 'gradient') {
    field = _sobelMagnitude(lum, w, h);
  } else if (densityMode === 'saturation') {
    field = _buildSaturation(src, n);
  } else {
    // luminance mode — dark areas get more dots: density = 1 - lum
    field = new Float32Array(n);
    for (let i = 0; i < n; i++) field[i] = 1 - lum[i];
  }

  // Apply shadow/highlight clamp: remap [shadowThreshold, highlightThreshold] → [0,1]
  const lo = shadowThreshold, hi = highlightThreshold;
  const range = hi - lo;
  if (range > 0.001) {
    for (let i = 0; i < n; i++) {
      field[i] = Math.max(0, Math.min(1, (field[i] - lo) / range));
    }
  }

  // Apply tone gamma
  if (Math.abs(toneGamma - 1) > 0.001) {
    const inv = 1 / Math.max(0.01, toneGamma);
    for (let i = 0; i < n; i++) field[i] = Math.pow(field[i], inv);
  }

  if (invertTone) {
    for (let i = 0; i < n; i++) field[i] = 1 - field[i];
  }

  return field;
}

// ── CDF sampler ───────────────────────────────────────────────────────────────

function _buildCDF(weights, n) {
  const cdf = new Float32Array(n);
  let total = 0;
  for (let i = 0; i < n; i++) total += weights[i];
  if (total === 0) { for (let i = 0; i < n; i++) cdf[i] = (i + 1) / n; return { cdf, total: n }; }
  let acc = 0;
  for (let i = 0; i < n; i++) { acc += weights[i]; cdf[i] = acc / total; }
  return { cdf, total };
}

function _sampleCDF(cdf, rndVal) {
  let lo = 0, hi = cdf.length - 1;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (cdf[mid] < rndVal) lo = mid + 1; else hi = mid; }
  return lo;
}

// ── Spatial grid for minimum-spacing enforcement ──────────────────────────────

function _makeSpatialGrid(cellSize, w, h) {
  const cols = Math.ceil(w / cellSize);
  const rows = Math.ceil(h / cellSize);
  const cells = new Array(cols * rows).fill(null).map(() => []);
  return { cells, cols, rows, cellSize };
}

function _gridCell(grid, x, y) {
  const col = Math.floor(x / grid.cellSize);
  const row = Math.floor(y / grid.cellSize);
  if (col < 0 || row < 0 || col >= grid.cols || row >= grid.rows) return null;
  return grid.cells[row * grid.cols + col];
}

function _gridInsert(grid, x, y) {
  const cell = _gridCell(grid, x, y);
  if (cell) cell.push([x, y]);
}

function _gridHasNeighbour(grid, x, y, minDist) {
  const col = Math.floor(x / grid.cellSize);
  const row = Math.floor(y / grid.cellSize);
  const span = Math.ceil(minDist / grid.cellSize) + 1;
  const c0 = Math.max(0, col - span), c1 = Math.min(grid.cols - 1, col + span);
  const r0 = Math.max(0, row - span), r1 = Math.min(grid.rows - 1, row + span);
  const d2 = minDist * minDist;
  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) {
      const bucket = grid.cells[r * grid.cols + c];
      for (const [px, py] of bucket) {
        if ((x - px) ** 2 + (y - py) ** 2 < d2) return true;
      }
    }
  }
  return false;
}

// ── Seeding algorithms ────────────────────────────────────────────────────────

function _seedWeightedRandom(cdf, n, w, dotCount, minSpacing, rng) {
  const grid = _makeSpatialGrid(Math.max(1, minSpacing), w, Math.ceil(n / w));
  const pts = [];
  const attempts = dotCount * 8;
  for (let a = 0; a < attempts && pts.length < dotCount; a++) {
    const idx = _sampleCDF(cdf, rng.next());
    const x = idx % w;
    const y = (idx / w) | 0;
    if (minSpacing > 0 && _gridHasNeighbour(grid, x, y, minSpacing)) continue;
    pts.push([x, y]);
    _gridInsert(grid, x, y);
  }
  return pts;
}

function _seedPoisson(density, w, h, dotCount, minSpacing, rng) {
  // Bridson weighted Poisson-disc: candidate ring sampling biased by density field
  const grid = _makeSpatialGrid(Math.max(1, minSpacing / Math.SQRT2), w, h);
  const pts = [];
  const active = [];
  const k = 30; // candidates per active point

  // Weighted initial seed
  const n = w * h;
  let bestSeed = 0, bestW = -1;
  for (let i = 0; i < Math.min(1000, n); i++) {
    const idx = (rng.next() * n) | 0;
    if (density[idx] > bestW) { bestW = density[idx]; bestSeed = idx; }
  }
  const sx = bestSeed % w, sy = (bestSeed / w) | 0;
  pts.push([sx, sy]);
  active.push([sx, sy]);
  _gridInsert(grid, sx, sy);

  while (active.length > 0 && pts.length < dotCount) {
    const ai = (rng.next() * active.length) | 0;
    const [ax, ay] = active[ai];
    let found = false;
    for (let ci = 0; ci < k; ci++) {
      const angle = rng.next() * Math.PI * 2;
      const dist = minSpacing + rng.next() * minSpacing;
      const cx = ax + Math.cos(angle) * dist;
      const cy = ay + Math.sin(angle) * dist;
      if (cx < 0 || cy < 0 || cx >= w || cy >= h) continue;
      // Weighted acceptance: reject with probability proportional to (1 - density)
      const di = (Math.floor(cy) * w + Math.floor(cx)) | 0;
      const d = density[Math.max(0, Math.min(n - 1, di))];
      if (rng.next() > d * 0.9 + 0.1) continue; // sparse areas less likely to accept
      if (_gridHasNeighbour(grid, cx, cy, minSpacing)) continue;
      pts.push([cx, cy]);
      active.push([cx, cy]);
      _gridInsert(grid, cx, cy);
      found = true;
      if (pts.length >= dotCount) break;
    }
    if (!found) active.splice(ai, 1);
  }
  return pts;
}

function _seedGrid(w, h, dotCount, minSpacing, rng, randomness) {
  const pts = [];
  const cols = Math.ceil(Math.sqrt(dotCount * w / h));
  const rows = Math.ceil(dotCount / cols);
  const sx = w / cols, sy = h / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (pts.length >= dotCount) break;
      const jx = randomness > 0 ? (rng.next() * 2 - 1) * randomness * sx * 0.5 : 0;
      const jy = randomness > 0 ? (rng.next() * 2 - 1) * randomness * sy * 0.5 : 0;
      const x = Math.max(0, Math.min(w - 1, (c + 0.5) * sx + jx));
      const y = Math.max(0, Math.min(h - 1, (r + 0.5) * sy + jy));
      pts.push([x, y]);
    }
  }
  return pts;
}

// ── Relaxation (weighted Lloyd's algorithm) ───────────────────────────────────

function _relax(pts, density, w, h, n, iterations, strength) {
  if (iterations < 1 || strength <= 0) return pts;
  // Build Voronoi approximation via nearest-point rasterisation for Lloyd step.
  // For performance we do a simplified version: each point moves toward the
  // weighted centroid of its local Voronoi neighbourhood estimated by a
  // spatial hash approach — O(N * gridLookup) not full O(WH).
  // This is a lightweight approximation sufficient for stippling quality.

  const gridSize = Math.max(4, Math.sqrt(n / pts.length) * 2) | 0;
  const gw = Math.ceil(w / gridSize), gh = Math.ceil(h / gridSize);
  const assignment = new Int32Array(gw * gh).fill(-1);

  for (let iter = 0; iter < iterations; iter++) {
    // Assign each grid cell to nearest point
    for (let gy = 0; gy < gh; gy++) {
      for (let gx = 0; gx < gw; gx++) {
        const px = (gx + 0.5) * gridSize, py = (gy + 0.5) * gridSize;
        let best = -1, bestD = Infinity;
        for (let pi = 0; pi < pts.length; pi++) {
          const d = (px - pts[pi][0]) ** 2 + (py - pts[pi][1]) ** 2;
          if (d < bestD) { bestD = d; best = pi; }
        }
        assignment[gy * gw + gx] = best;
      }
    }

    // Compute weighted centroids
    const sumX = new Float64Array(pts.length);
    const sumY = new Float64Array(pts.length);
    const sumW = new Float64Array(pts.length);

    for (let gy = 0; gy < gh; gy++) {
      for (let gx = 0; gx < gw; gx++) {
        const pi = assignment[gy * gw + gx];
        if (pi < 0) continue;
        const px = (gx + 0.5) * gridSize, py = (gy + 0.5) * gridSize;
        const si = Math.max(0, Math.min(n - 1, (Math.floor(py) * w + Math.floor(px)) | 0));
        const w_ = density[si] + 0.001;
        sumX[pi] += px * w_;
        sumY[pi] += py * w_;
        sumW[pi] += w_;
      }
    }

    // Move points toward centroid by `strength`
    for (let pi = 0; pi < pts.length; pi++) {
      if (sumW[pi] <= 0) continue;
      const cx = sumX[pi] / sumW[pi];
      const cy = sumY[pi] / sumW[pi];
      pts[pi][0] = Math.max(0, Math.min(w - 1, pts[pi][0] + (cx - pts[pi][0]) * strength));
      pts[pi][1] = Math.max(0, Math.min(h - 1, pts[pi][1] + (cy - pts[pi][1]) * strength));
    }
  }
  return pts;
}

// ── Dot rasterisers ───────────────────────────────────────────────────────────

function _paintCircle(buf, w, h, cx, cy, r, color, opacity, antialias) {
  const x0 = Math.max(0, Math.floor(cx - r)), x1 = Math.min(w - 1, Math.ceil(cx + r));
  const y0 = Math.max(0, Math.floor(cy - r)), y1 = Math.min(h - 1, Math.ceil(cy + r));
  const rr = r * r;
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dx = x - cx, dy = y - cy;
      const d2 = dx * dx + dy * dy;
      if (d2 > rr) continue;
      let alpha = opacity;
      if (antialias) {
        const edge = r - Math.sqrt(d2);
        if (edge < 1) alpha *= Math.max(0, edge);
      }
      if (alpha <= 0) continue;
      const j = (y * w + x) * 4;
      const inv = 1 - alpha;
      buf[j]     = buf[j]     * inv + color[0] * alpha;
      buf[j + 1] = buf[j + 1] * inv + color[1] * alpha;
      buf[j + 2] = buf[j + 2] * inv + color[2] * alpha;
      buf[j + 3] = Math.min(255, buf[j + 3] + 255 * alpha);
    }
  }
}

function _paintSquare(buf, w, h, cx, cy, r, color, opacity) {
  const x0 = Math.max(0, Math.floor(cx - r)), x1 = Math.min(w - 1, Math.ceil(cx + r));
  const y0 = Math.max(0, Math.floor(cy - r)), y1 = Math.min(h - 1, Math.ceil(cy + r));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const inv = 1 - opacity;
      const j = (y * w + x) * 4;
      buf[j]     = buf[j]     * inv + color[0] * opacity;
      buf[j + 1] = buf[j + 1] * inv + color[1] * opacity;
      buf[j + 2] = buf[j + 2] * inv + color[2] * opacity;
      buf[j + 3] = Math.min(255, buf[j + 3] + 255 * opacity);
    }
  }
}

function _paintEllipse(buf, w, h, cx, cy, rx, ry, color, opacity) {
  const rmax = Math.max(rx, ry);
  const x0 = Math.max(0, Math.floor(cx - rmax)), x1 = Math.min(w - 1, Math.ceil(cx + rmax));
  const y0 = Math.max(0, Math.floor(cy - rmax)), y1 = Math.min(h - 1, Math.ceil(cy + rmax));
  const rx2 = rx * rx, ry2 = ry * ry;
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dx = x - cx, dy = y - cy;
      if ((dx * dx / rx2) + (dy * dy / ry2) > 1) continue;
      const inv = 1 - opacity;
      const j = (y * w + x) * 4;
      buf[j]     = buf[j]     * inv + color[0] * opacity;
      buf[j + 1] = buf[j + 1] * inv + color[1] * opacity;
      buf[j + 2] = buf[j + 2] * inv + color[2] * opacity;
      buf[j + 3] = Math.min(255, buf[j + 3] + 255 * opacity);
    }
  }
}

function _paintDiamond(buf, w, h, cx, cy, r, color, opacity) {
  const x0 = Math.max(0, Math.floor(cx - r)), x1 = Math.min(w - 1, Math.ceil(cx + r));
  const y0 = Math.max(0, Math.floor(cy - r)), y1 = Math.min(h - 1, Math.ceil(cy + r));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (Math.abs(x - cx) + Math.abs(y - cy) > r) continue;
      const inv = 1 - opacity;
      const j = (y * w + x) * 4;
      buf[j]     = buf[j]     * inv + color[0] * opacity;
      buf[j + 1] = buf[j + 1] * inv + color[1] * opacity;
      buf[j + 2] = buf[j + 2] * inv + color[2] * opacity;
      buf[j + 3] = Math.min(255, buf[j + 3] + 255 * opacity);
    }
  }
}

// ── Module ────────────────────────────────────────────────────────────────────

export const StippleNode = createEffectModule({
  type: 'stipple',
  name: 'STIPPLE',
  category: 'COMPOSITE',
  forceWorkerPreview: true,
  params: {
    // ── Stage 1 — Tone Field ──────────────────────────────────────────────────
    toneGamma:         { label: 'TONE GAMMA',   min: 0.1,  max: 4,     step: 0.05,  value: 1,      tier: 4, unit: 'n',          driveable: true },
    toneInvert:        { label: 'INVERT TONE',  type: 'toggle',                      value: false,  tier: 4 },
    linearLight:       { label: 'LINEAR LIGHT', type: 'toggle',                      value: false,  tier: 5 },

    // ── Stage 2 — Density / Demand Field ─────────────────────────────────────
    dotCount:          { label: 'DOT COUNT',    min: 10,   max: 30000, step: 10,     value: 2000,   tier: 3, previewMax: 500,    unit: 'n',          driveable: true },
    shadowThreshold:   { label: 'SHADOW THR',   min: 0,    max: 1,     step: 0.01,  value: 0,      tier: 4, unit: 'normalised', driveable: true },
    highlightThreshold:{ label: 'HIGHLIGHT THR',min: 0,    max: 1,     step: 0.01,  value: 1,      tier: 4, unit: 'normalised', driveable: true },
    densityMode:       { label: 'DENSITY MODE', type: 'select', options: ['luminance', 'gradient', 'saturation'], value: 'luminance', tier: 4 },

    // ── Stage 3 — Point Seeding ───────────────────────────────────────────────
    seedMode:          { label: 'SEED MODE',    type: 'select', options: ['weighted-random', 'poisson', 'grid', 'jittered-grid'], value: 'weighted-random', tier: 3 },
    randomness:        { label: 'RANDOMNESS',   min: 0,    max: 1,     step: 0.01,  value: 0.5,    tier: 4, unit: 'normalised', driveable: true },
    seed:              { label: 'SEED',         min: 0,    max: 99999, step: 1,     value: 42,     tier: 4, unit: 'n',          driveable: true },

    // ── Stage 4 — Relaxation ─────────────────────────────────────────────────
    relaxIterations:   { label: 'RELAX ITERS',  min: 0,    max: 20,    step: 1,     value: 3,      tier: 4, previewMax: 3,      unit: 'n',          driveable: true },
    relaxStrength:     { label: 'RELAX STR',    min: 0,    max: 1,     step: 0.05,  value: 0.5,    tier: 5, unit: 'normalised', driveable: true },
    minSpacing:        { label: 'MIN SPACING',  min: 1,    max: 40,    step: 0.5,   value: 3,      tier: 3, previewMax: 8,      unit: 'px',         driveable: true },

    // ── Stage 5 — Attribute Assignment ────────────────────────────────────────
    dotShape:          { label: 'DOT SHAPE',    type: 'select', options: ['circle', 'square', 'ellipse', 'diamond'], value: 'circle', tier: 3 },
    minDotSize:        { label: 'MIN DOT SIZE', min: 0.5,  max: 20,    step: 0.5,   value: 0.5,    tier: 3, unit: 'px',         driveable: true },
    maxDotSize:        { label: 'MAX DOT SIZE', min: 0.5,  max: 20,    step: 0.5,   value: 3,      tier: 3, unit: 'px',         driveable: true },
    dotOpacity:        { label: 'DOT OPACITY',  min: 0,    max: 1,     step: 0.01,  value: 1,      tier: 4, unit: 'normalised', driveable: true },
    antialias:         { label: 'ANTIALIAS',    type: 'toggle',                      value: true,   tier: 5 },

    // ── Stage 5 — Colour ──────────────────────────────────────────────────────
    colourMode:        { label: 'COLOUR MODE',  type: 'select', options: ['source', 'solid', 'ink'], value: 'ink', tier: 3 },
    dotColourR:        { label: 'DOT R',        min: 0,    max: 255,   step: 1,     value: 0,      tier: 4, unit: 'lvl', driveable: true, when: { param: 'colourMode', notEquals: 'source' } },
    dotColourG:        { label: 'DOT G',        min: 0,    max: 255,   step: 1,     value: 0,      tier: 4, unit: 'lvl', driveable: true, when: { param: 'colourMode', notEquals: 'source' } },
    dotColourB:        { label: 'DOT B',        min: 0,    max: 255,   step: 1,     value: 0,      tier: 4, unit: 'lvl', driveable: true, when: { param: 'colourMode', notEquals: 'source' } },
    bgColourR:         { label: 'BG R',         min: 0,    max: 255,   step: 1,     value: 255,    tier: 4, unit: 'lvl', driveable: true },
    bgColourG:         { label: 'BG G',         min: 0,    max: 255,   step: 1,     value: 255,    tier: 4, unit: 'lvl', driveable: true },
    bgColourB:         { label: 'BG B',         min: 0,    max: 255,   step: 1,     value: 255,    tier: 4, unit: 'lvl', driveable: true },

    // ── Animation ─────────────────────────────────────────────────────────────
    frame:             { label: 'FRAME',        min: 0,    max: 50000, step: 1,     value: 0,      tier: 3, unit: 'n',          driveable: true },
  },

  apply(src, dst, w, h, p, ctx, modulate) {
    const _m_toneGamma = modulate('toneGamma', 0);
    const _m_dotCount = modulate('dotCount', 0);
    const _m_shadowThreshold = modulate('shadowThreshold', 0);
    const _m_highlightThreshold = modulate('highlightThreshold', 0);
    const _m_randomness = modulate('randomness', 0);
    const _m_seed = Math.round(modulate('seed', 0));
    const _m_relaxIterations = Math.round(modulate('relaxIterations', 0));
    const _m_relaxStrength = modulate('relaxStrength', 0);
    const _m_minSpacing = modulate('minSpacing', 0);
    const _m_minDotSize = modulate('minDotSize', 0);
    const _m_maxDotSize = modulate('maxDotSize', 0);
    const _m_dotOpacity = modulate('dotOpacity', 0);
    const _m_dotColourR = Math.round(modulate('dotColourR', 0));
    const _m_dotColourG = Math.round(modulate('dotColourG', 0));
    const _m_dotColourB = Math.round(modulate('dotColourB', 0));
    const _m_bgColourR = Math.round(modulate('bgColourR', 0));
    const _m_bgColourG = Math.round(modulate('bgColourG', 0));
    const _m_bgColourB = Math.round(modulate('bgColourB', 0));
    const _m_frame = Math.round(modulate('frame', 0));
    const n = w * h;
    const isPreview = ctx?.quality === 'preview';

    // ── Resolve driveable params ──────────────────────────────────────────────
    const m = (key, fallback) => modulate ? modulate(key, fallback) : fallback;
    const dotCount      = Math.max(1, Math.round(m('dotCount',      _m_dotCount)));
    const minSpacing    = Math.max(0, m('minSpacing',    _m_minSpacing));
    const minDotSize    = Math.max(0.5, m('minDotSize',  _m_minDotSize));
    const maxDotSize    = Math.max(minDotSize, m('maxDotSize', _m_maxDotSize));
    const dotOpacity    = Math.max(0, Math.min(1, m('dotOpacity',   _m_dotOpacity)));
    const relaxIters    = Math.max(0, Math.round(m('relaxIterations', _m_relaxIterations)));
    const relaxStrength = Math.max(0, Math.min(1, m('relaxStrength', _m_relaxStrength)));
    const randomness    = Math.max(0, Math.min(1, m('randomness',   _m_randomness)));
    const toneGamma     = Math.max(0.01, m('toneGamma',  _m_toneGamma));
    const shadowThr     = Math.max(0, Math.min(1, m('shadowThreshold',    _m_shadowThreshold)));
    const highlightThr  = Math.max(shadowThr + 0.001, Math.min(1, m('highlightThreshold', _m_highlightThreshold)));
    const seed          = Math.round(m('seed', _m_seed)) + (_m_frame | 0);
    const dotColourR    = Math.round(m('dotColourR', _m_dotColourR));
    const dotColourG    = Math.round(m('dotColourG', _m_dotColourG));
    const dotColourB    = Math.round(m('dotColourB', _m_dotColourB));
    const bgColourR     = Math.round(m('bgColourR', _m_bgColourR));
    const bgColourG     = Math.round(m('bgColourG', _m_bgColourG));
    const bgColourB     = Math.round(m('bgColourB', _m_bgColourB));

    const rng = new SeededRNG(seed >>> 0);

    // ── Stage 1 — Tone field ──────────────────────────────────────────────────
    const lum = p.linearLight ? _buildLumaLinear(src, n) : _buildLuma(src, n);

    // ── Stage 2 — Density field ───────────────────────────────────────────────
    const density = _buildDensityField(
      src, lum, w, h, n,
      p.densityMode, p.toneInvert,
      shadowThr, highlightThr, toneGamma
    );

    // ── Stage 3 — Point seeding ───────────────────────────────────────────────
    let pts;
    const mode = p.seedMode;

    if (mode === 'poisson') {
      pts = _seedPoisson(density, w, h, dotCount, Math.max(1, minSpacing), rng);
    } else if (mode === 'grid') {
      pts = _seedGrid(w, h, dotCount, Math.max(1, minSpacing), rng, 0);
    } else if (mode === 'jittered-grid') {
      pts = _seedGrid(w, h, dotCount, Math.max(1, minSpacing), rng, randomness);
    } else {
      // weighted-random (default)
      const { cdf } = _buildCDF(density, n);
      pts = _seedWeightedRandom(cdf, n, w, dotCount, Math.max(1, minSpacing), rng);
    }

    // ── Stage 4 — Relaxation ─────────────────────────────────────────────────
    if (relaxIters > 0 && pts.length > 1) {
      _relax(pts, density, w, h, n, relaxIters, relaxStrength);
    }

    // ── Stage 5 — Background fill ─────────────────────────────────────────────
    const buf = new Uint8ClampedArray(n * 4);
    for (let i = 0; i < n; i++) {
      const j = i * 4;
      buf[j]     = bgColourR;
      buf[j + 1] = bgColourG;
      buf[j + 2] = bgColourB;
      buf[j + 3] = 255;
    }

    // ── Stage 5 — Dot rendering ───────────────────────────────────────────────
    const shape     = p.dotShape;
    const cMode     = p.colourMode;
    const antialias = p.antialias !== false;

    for (const [fx, fy] of pts) {
      const xi = Math.max(0, Math.min(w - 1, Math.floor(fx)));
      const yi = Math.max(0, Math.min(h - 1, Math.floor(fy)));
      const pi = yi * w + xi;

      // Dot colour
      let dr, dg, db;
      if (cMode === 'source') {
        const si = pi * 4;
        dr = src[si]; dg = src[si + 1]; db = src[si + 2];
      } else {
        // solid / ink — use dot colour params
        dr = dotColourR; dg = dotColourG; db = dotColourB;
      }

      // Dot size: map density → radius (dark/high-density → larger dot)
      const d = density[pi];
      const radius = minDotSize + (maxDotSize - minDotSize) * d;

      const color = [dr, dg, db];

      switch (shape) {
        case 'square':
          _paintSquare(buf, w, h, fx, fy, radius, color, dotOpacity);
          break;
        case 'ellipse':
          _paintEllipse(buf, w, h, fx, fy, radius, radius * 0.6, color, dotOpacity);
          break;
        case 'diamond':
          _paintDiamond(buf, w, h, fx, fy, radius, color, dotOpacity);
          break;
        default:
          _paintCircle(buf, w, h, fx, fy, radius, color, dotOpacity, antialias);
      }
    }

    dst.set(buf);
  }
});
