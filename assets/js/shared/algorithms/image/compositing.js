/**
 * @fileoverview Image compositing algorithms — luminance-weighted stipple dot placement, tile blend.
 *
 * @source DISTORT image pipeline reference (src/nodes/composite/)
 * @wikipedia https://en.wikipedia.org/wiki/Stippling
 *   https://en.wikipedia.org/wiki/Alpha_compositing
 * @formula
 *   stipple: Poisson-ish importance sampling weighted by (1 - lum);
 *     acceptance = rng() < (1 - lum) * 0.8 + 0.1
 *   tile blend: crossfade = a*(1-mix)+b*mix; multiply = a*b; difference = |a-b|
 *     then tonemapped: out = clamp(out * 2^exposure, 0,1)^(1/gamma)
 */

// ── Helpers ─────────────────────────────────────────────────────────────────

function lcgRng(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0x100000000; };
}

function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

// ── Stipple ──────────────────────────────────────────────────────────────────

/**
 * Place stipple dots on a flat background using luminance-weighted Poisson-ish sampling.
 * Darker pixels attract more dots; lighter pixels attract fewer.
 *
 * @param {Uint8ClampedArray} src - RGBA source (luminance reference only)
 * @param {number} w
 * @param {number} h
 * @param {object} [opts={}]
 * @param {number} [opts.minDist=4] - Minimum dot-to-dot distance in pixels
 * @param {number} [opts.dotRadius=1.5]
 * @param {number} [opts.attempts=30] - Poisson candidate attempts per accepted dot
 * @param {number} [opts.bgLevel=255] - Background grey value [0, 255]
 * @param {number} [opts.dotLevel=0] - Dot grey value [0, 255]
 * @param {number} [opts.maxPoints=15000]
 * @param {number} [opts.seed=42]
 * @returns {Uint8ClampedArray} New RGBA buffer
 */
export function stipple(src, w, h, opts = {}) {
  const { minDist = 4, dotRadius = 1.5, bgLevel = 255, dotLevel = 0, maxPoints = 15000, seed = 42 } = opts;
  const rng = lcgRng(seed);
  const n = w * h;
  const lum = new Float32Array(n);
  for (let i = 0; i < n; i++) { const j = i * 4; lum[i] = (src[j] * 0.299 + src[j + 1] * 0.587 + src[j + 2] * 0.114) / 255; }

  const cellSize = minDist / Math.SQRT2;
  const gw = Math.ceil(w / cellSize), gh = Math.ceil(h / cellSize);
  const grid = new Int32Array(gw * gh).fill(-1);
  const points = [];

  for (let iter = 0; iter < maxPoints; iter++) {
    const px = rng() * w, py = rng() * h;
    const ix = Math.floor(px / cellSize), iy = Math.floor(py / cellSize);
    const li = Math.floor(py) * w + Math.floor(px);
    const l = li >= 0 && li < n ? lum[li] : 0.5;
    if (rng() > (1 - l) * 0.8 + 0.1) continue;

    let tooClose = false;
    outer: for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const nx = ix + dx, ny = iy + dy;
        if (nx < 0 || nx >= gw || ny < 0 || ny >= gh) continue;
        const gi = grid[ny * gw + nx];
        if (gi >= 0) {
          const ddx = px - points[gi * 2], ddy = py - points[gi * 2 + 1];
          if (ddx * ddx + ddy * ddy < minDist * minDist) { tooClose = true; break outer; }
        }
      }
    }
    if (tooClose) continue;
    const pi = points.length / 2;
    points.push(px, py);
    grid[iy * gw + ix] = pi;
  }

  const dst = new Uint8ClampedArray(w * h * 4);
  for (let i = 0, nn = w * h * 4; i < nn; i += 4) { dst[i] = dst[i + 1] = dst[i + 2] = bgLevel; dst[i + 3] = src[i + 3]; }
  const r2 = dotRadius * dotRadius;
  const ir = Math.ceil(dotRadius);
  for (let p = 0; p < points.length; p += 2) {
    const px = points[p], py = points[p + 1];
    for (let dy = -ir; dy <= ir; dy++) {
      const ny = Math.round(py) + dy; if (ny < 0 || ny >= h) continue;
      for (let dx = -ir; dx <= ir; dx++) {
        const nx = Math.round(px) + dx; if (nx < 0 || nx >= w) continue;
        if (dx * dx + dy * dy <= r2) { const oi = (ny * w + nx) * 4; dst[oi] = dst[oi + 1] = dst[oi + 2] = dotLevel; }
      }
    }
  }
  return dst;
}

// ── Tile Blend ───────────────────────────────────────────────────────────────

/**
 * Self-blend an image by compositing a spatially offset (and optionally mirrored) copy.
 * Available blend modes: 'crossfade', 'multiply', 'difference'.
 * Output is tonemapped by exposure and gamma.
 *
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {object} [opts={}]
 * @param {'crossfade'|'multiply'|'difference'} [opts.blendMode='multiply']
 * @param {number} [opts.mix=0.5]
 * @param {number} [opts.offsetX=0.5] - Horizontal offset as fraction of width
 * @param {number} [opts.offsetY=0.5] - Vertical offset as fraction of height
 * @param {boolean} [opts.mirrorX=false]
 * @param {boolean} [opts.mirrorY=false]
 * @param {number} [opts.exposure=0] - EV stops
 * @param {number} [opts.gamma=1]
 * @returns {Uint8ClampedArray} New buffer
 */
export function tileBlend(src, w, h, opts = {}) {
  const { blendMode = 'multiply', mix = 0.5, offsetX = 0.5, offsetY = 0.5, mirrorX = false, mirrorY = false, exposure = 0, gamma = 1 } = opts;
  const ox = Math.round(offsetX * w);
  const oy = Math.round(offsetY * h);
  const expMul = Math.pow(2, exposure);
  const invGamma = 1 / Math.max(0.01, gamma);
  const dst = new Uint8ClampedArray(src.length);

  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    let sx = (x + ox) % w;
    let sy = (y + oy) % h;
    if (mirrorX && sx > w / 2) sx = w - sx;
    if (mirrorY && sy > h / 2) sy = h - sy;
    sx = Math.max(0, Math.min(w - 1, Math.round(sx)));
    sy = Math.max(0, Math.min(h - 1, Math.round(sy)));
    const j = (sy * w + sx) * 4;

    for (let c = 0; c < 3; c++) {
      const a = src[i + c] / 255, b = src[j + c] / 255;
      let out;
      if (blendMode === 'crossfade') out = a * (1 - mix) + b * mix;
      else if (blendMode === 'multiply') out = a * b;
      else out = Math.abs(a - b);
      out = clamp01(out * expMul);
      dst[i + c] = Math.round(Math.pow(out, invGamma) * 255);
    }
    dst[i + 3] = src[i + 3];
  }
  return dst;
}

// ── Voronoi ───────────────────────────────────────────────────────────────────

/**
 * Render a Voronoi diagram over an RGBA source.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} pointCount   - Number of Voronoi sites [4, 512]
 * @param {'distance'|'cell'|'edge'} colorMode
 * @param {number} blendAmt     - Mix between source and Voronoi output [0, 1]
 * @param {object} rng          - Object with .next()→[0,1), .nextInt(lo,hi)→int
 * @returns {Uint8ClampedArray}
 */
export function voronoiRGBA(src, w, h, pointCount, colorMode, blendAmt, rng) {
  const pts = [];
  for (let i = 0; i < pointCount; i++) {
    pts.push({ x: rng.next() * w, y: rng.next() * h, r: 50 + Math.floor(rng.next() * 205), g: 50 + Math.floor(rng.next() * 205), b: 50 + Math.floor(rng.next() * 205) });
  }
  const inv = 1 - blendAmt;
  const dst = new Uint8ClampedArray(src.length);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let minD = Infinity, minD2 = Infinity, minIdx = 0;
    for (let p = 0; p < pts.length; p++) {
      const dx = x - pts[p].x, dy = y - pts[p].y, dd = dx * dx + dy * dy;
      if (dd < minD) { minD2 = minD; minD = dd; minIdx = p; } else if (dd < minD2) minD2 = dd;
    }
    const oi = (y * w + x) * 4;
    if (colorMode === 'distance') {
      const v = Math.min(255, Math.sqrt(minD));
      dst[oi] = Math.round(src[oi] * inv + v * blendAmt); dst[oi + 1] = Math.round(src[oi + 1] * inv + v * blendAmt); dst[oi + 2] = Math.round(src[oi + 2] * inv + v * blendAmt);
    } else if (colorMode === 'cell') {
      const cp = pts[minIdx];
      dst[oi] = Math.round(src[oi] * inv + cp.r * blendAmt); dst[oi + 1] = Math.round(src[oi + 1] * inv + cp.g * blendAmt); dst[oi + 2] = Math.round(src[oi + 2] * inv + cp.b * blendAmt);
    } else {
      const edge = Math.sqrt(minD2) - Math.sqrt(minD), v = edge < 2 ? 0 : 255;
      dst[oi] = Math.round(src[oi] * inv + v * blendAmt); dst[oi + 1] = Math.round(src[oi + 1] * inv + v * blendAmt); dst[oi + 2] = Math.round(src[oi + 2] * inv + v * blendAmt);
    }
    dst[oi + 3] = src[oi + 3];
  }
  return dst;
}

// ── Contour ───────────────────────────────────────────────────────────────────

/**
 * Draw luminance isoline contours over an RGBA buffer.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} levels       - Number of isolines [2, 32]
 * @param {number} strokeW      - Line half-width in pixels [0.5, 4]
 * @param {number} strokeLevel  - Stroke brightness [0, 255]
 * @param {number} blendAmt     - Mix [0, 1]
 * @returns {Uint8ClampedArray}
 */
export function contourRGBA(src, w, h, levels, strokeW, strokeLevel, blendAmt) {
  const n = w * h;
  const lum = new Float32Array(n);
  for (let i = 0; i < n; i++) { const j = i * 4; lum[i] = (src[j] * 0.299 + src[j + 1] * 0.587 + src[j + 2] * 0.114) / 255; }
  const edge = new Uint8Array(n);
  for (let y = 0; y < h - 1; y++) for (let x = 0; x < w - 1; x++) {
    const i = y * w + x, lv = Math.floor(lum[i] * levels);
    if (lv !== Math.floor(lum[i + 1] * levels) || lv !== Math.floor(lum[i + w] * levels)) edge[i] = 1;
  }
  const rad = Math.ceil(strokeW), edgeOut = new Uint8Array(n);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!edge[y * w + x]) continue;
    for (let dy = -rad; dy <= rad; dy++) { const ny = y + dy; if (ny < 0 || ny >= h) continue;
      for (let dx = -rad; dx <= rad; dx++) { const nx = x + dx; if (nx < 0 || nx >= w) continue; if (dx * dx + dy * dy <= rad * rad) edgeOut[ny * w + nx] = 1; } }
  }
  const inv = 1 - blendAmt;
  const dst = new Uint8ClampedArray(src.length);
  for (let i = 0; i < n; i++) {
    const j = i * 4;
    if (edgeOut[i]) { dst[j] = Math.round(src[j] * inv + strokeLevel * blendAmt); dst[j + 1] = Math.round(src[j + 1] * inv + strokeLevel * blendAmt); dst[j + 2] = Math.round(src[j + 2] * inv + strokeLevel * blendAmt); }
    else { dst[j] = src[j]; dst[j + 1] = src[j + 1]; dst[j + 2] = src[j + 2]; }
    dst[j + 3] = src[j + 3];
  }
  return dst;
}

// ── Delaunay Mesh ─────────────────────────────────────────────────────────────

function _inCircumDelaunay(pts, tri, p) {
  const a = pts[tri[0]], b = pts[tri[1]], c = pts[tri[2]];
  const ax = a.x - p.x, ay = a.y - p.y, bx = b.x - p.x, by = b.y - p.y, cx = c.x - p.x, cy = c.y - p.y;
  return ax * (by * (cx * cx + cy * cy) - cy * (bx * bx + by * by)) - ay * (bx * (cx * cx + cy * cy) - cx * (bx * bx + by * by)) + (ax * ax + ay * ay) * (bx * cy - by * cx) > 0;
}

function _triangulate(pts) {
  if (pts.length < 3) return [];
  const minX = pts.reduce((m, p) => Math.min(m, p.x), Infinity);
  const minY = pts.reduce((m, p) => Math.min(m, p.y), Infinity);
  const maxX = pts.reduce((m, p) => Math.max(m, p.x), -Infinity);
  const maxY = pts.reduce((m, p) => Math.max(m, p.y), -Infinity);
  const dx = maxX - minX, dy = maxY - minY, dmax = Math.max(dx, dy) * 2;
  const si = pts.length;
  pts.push({ x: minX - dmax, y: minY - 1 }, { x: minX + dmax * 2, y: minY - 1 }, { x: minX + dx / 2, y: maxY + dmax });
  let tris = [[si, si + 1, si + 2]];
  for (let i = 0; i < si; i++) {
    const p = pts[i], bad = [], poly = [];
    for (const t of tris) if (_inCircumDelaunay(pts, t, p)) bad.push(t);
    for (const t of bad) for (let j = 0; j < 3; j++) {
      const e = [t[j], t[(j + 1) % 3]]; let shared = false;
      for (const b of bad) { if (b === t) continue; for (let k = 0; k < 3; k++) if ((b[k] === e[0] && b[(k + 1) % 3] === e[1]) || (b[k] === e[1] && b[(k + 1) % 3] === e[0])) { shared = true; break; } if (shared) break; }
      if (!shared) poly.push(e);
    }
    tris = tris.filter(t => !bad.includes(t));
    for (const e of poly) tris.push([e[0], e[1], i]);
  }
  return tris.filter(t => t[0] < si && t[1] < si && t[2] < si);
}

function _drawLine(dst, w, h, x0, y0, x1, y1, r, g, b, lineW) {
  const dx = x1 - x0, dy = y1 - y0, len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return;
  const nx = -dy / len, ny = dx / len, steps = Math.ceil(len * 2), hw = lineW / 2;
  for (let s = 0; s <= steps; s++) {
    const t = s / steps, cx = x0 + dx * t, cy = y0 + dy * t;
    const ir = Math.ceil(hw);
    for (let py = Math.round(cy) - ir; py <= Math.round(cy) + ir; py++) {
      for (let px = Math.round(cx) - ir; px <= Math.round(cx) + ir; px++) {
        if (px < 0 || px >= w || py < 0 || py >= h) continue;
        const ax = px - cx, ay = py - cy;
        const proj = ax * nx + ay * ny, perp = ax * (dx / len) + ay * (dy / len);
        if (Math.abs(proj) <= hw && Math.abs(perp) <= hw + 0.5) {
          const oi = (py * w + px) * 4; dst[oi] = r; dst[oi + 1] = g; dst[oi + 2] = b;
        }
      }
    }
  }
}

/**
 * Generate a Delaunay triangulation mesh overlay.
 * Uses OffscreenCanvas if available, falls back to scanline fill.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} pointCount   - Number of random interior points
 * @param {number} wireWeight   - Wire width in pixels [0, 3]
 * @param {number} wireLevel    - Wire brightness [0, 255]
 * @param {'flat'|'wire'} colorMode
 * @param {object} rng          - Object with .next()→[0,1)
 * @returns {Uint8ClampedArray}
 */
export function delaunayMeshRGBA(src, w, h, pointCount, wireWeight, wireLevel, colorMode, rng) {
  const pts = [];
  for (let i = 0; i < pointCount; i++) pts.push({ x: rng.next() * w, y: rng.next() * h });
  pts.push({ x: 0, y: 0 }, { x: w, y: 0 }, { x: 0, y: h }, { x: w, y: h });
  const tris = _triangulate(pts);

  if (typeof OffscreenCanvas !== 'undefined') {
    const oc = new OffscreenCanvas(w, h);
    const ctx = oc.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    if (colorMode === 'flat') {
      for (const tri of tris) {
        const p0 = pts[tri[0]], p1 = pts[tri[1]], p2 = pts[tri[2]];
        const cx2 = Math.max(0, Math.min(w - 1, Math.round((p0.x + p1.x + p2.x) / 3)));
        const cy2 = Math.max(0, Math.min(h - 1, Math.round((p0.y + p1.y + p2.y) / 3)));
        const si = (cy2 * w + cx2) * 4;
        ctx.fillStyle = `rgb(${src[si]},${src[si + 1]},${src[si + 2]})`;
        ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.closePath(); ctx.fill();
      }
    }
    if (wireWeight > 0) {
      ctx.strokeStyle = `rgb(${wireLevel},${wireLevel},${wireLevel})`; ctx.lineWidth = wireWeight;
      for (const tri of tris) {
        const p0 = pts[tri[0]], p1 = pts[tri[1]], p2 = pts[tri[2]];
        ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.closePath(); ctx.stroke();
      }
    }
    const id = ctx.getImageData(0, 0, w, h);
    const dst = new Uint8ClampedArray(src.length);
    if (colorMode === 'wire') {
      for (let i = 0, n = w * h * 4; i < n; i += 4) {
        const a = id.data[i + 3] / 255;
        dst[i] = Math.round(src[i] * (1 - a) + id.data[i] * a); dst[i + 1] = Math.round(src[i + 1] * (1 - a) + id.data[i + 1] * a); dst[i + 2] = Math.round(src[i + 2] * (1 - a) + id.data[i + 2] * a); dst[i + 3] = src[i + 3];
      }
    } else { dst.set(id.data); }
    return dst;
  }

  // Fallback: wire-only mode without OffscreenCanvas
  const dst = new Uint8ClampedArray(src);
  if (wireWeight > 0) {
    for (const tri of tris) {
      const p0 = pts[tri[0]], p1 = pts[tri[1]], p2 = pts[tri[2]];
      _drawLine(dst, w, h, p0.x, p0.y, p1.x, p1.y, wireLevel, wireLevel, wireLevel, wireWeight);
      _drawLine(dst, w, h, p1.x, p1.y, p2.x, p2.y, wireLevel, wireLevel, wireLevel, wireWeight);
      _drawLine(dst, w, h, p2.x, p2.y, p0.x, p0.y, wireLevel, wireLevel, wireLevel, wireWeight);
    }
  }
  return dst;
}
