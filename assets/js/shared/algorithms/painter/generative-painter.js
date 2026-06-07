/**
 * @fileoverview Deterministic generative painter — palette reconstruction engine.
 * @source blog/docs/components/distort/modules/paintstroke.md
 * @wikipedia https://en.wikipedia.org/wiki/Pointillism
 * @formula P = C + (T - C) * min(overshoot, 1/alpha); placement weight w_i = base_i * (1 + edge*eInf + grad*cInf + lum*lInf)
 */

import { hexToRgb as hexToRgbObj } from '../color/color-space.js';
import { paintBrushShape, paintPolyline } from './brush-engine.js';
import { paintStrokeErrorGuided } from '../rendering/paintstroke-error.js';

/** @returns {[number, number, number]} RGB array for internal palette/bg use */
function hexToRgb(hex) {
  const { r, g, b } = hexToRgbObj(hex);
  return [r, g, b];
}

const PRESET_PALETTES = {
  greyscale: [[0, 0, 0], [64, 64, 64], [128, 128, 128], [192, 192, 192], [255, 255, 255]],
  warm: [[30, 10, 5], [120, 40, 20], [200, 100, 50], [240, 180, 100], [255, 230, 200]],
  cool: [[5, 10, 30], [20, 40, 120], [50, 100, 200], [100, 180, 240], [200, 230, 255]],
};

/**
 * Parse palette hex JSON / arrays into RGB triples.
 * @source blog/docs/components/distort/modules/paintstroke.md
 * @wikipedia https://en.wikipedia.org/wiki/Color_quantization
 * @formula rgb = hexToRgb(entry) for each palette member
 */
export function parsePaletteColours(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map(c => (Array.isArray(c) ? c : hexToRgb(c)));
  }
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr.map(c => (Array.isArray(c) ? c : hexToRgb(c)));
  } catch { /* fall through */ }
  return String(raw).split(',').map(s => hexToRgb(s.trim())).filter(c => c.length === 3);
}

function _luma(src, n) {
  const lum = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const j = i * 4;
    lum[i] = src[j] * 0.299 + src[j + 1] * 0.587 + src[j + 2] * 0.114;
  }
  return lum;
}

function _sobelGrad(lum, w, h) {
  const n = w * h;
  const gx = new Float32Array(n);
  const gy = new Float32Array(n);
  const mag = new Float32Array(n);
  const ang = new Float32Array(n);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const vx = -lum[i - w - 1] + lum[i - w + 1] - 2 * lum[i - 1] + 2 * lum[i + 1] - lum[i + w - 1] + lum[i + w + 1];
      const vy = -lum[i - w - 1] - 2 * lum[i - w] - lum[i - w + 1] + lum[i + w - 1] + 2 * lum[i + w] + lum[i + w + 1];
      gx[i] = vx;
      gy[i] = vy;
      mag[i] = Math.hypot(vx, vy);
      ang[i] = Math.atan2(vy, vx);
    }
  }
  return { gx, gy, mag, ang };
}

function _edgeMap(mag, n) {
  let maxM = 0;
  for (let i = 0; i < n; i++) if (mag[i] > maxM) maxM = mag[i];
  const edge = new Float32Array(n);
  const inv = maxM > 0 ? 1 / maxM : 0;
  for (let i = 0; i < n; i++) edge[i] = mag[i] * inv;
  return edge;
}

function _errorMap(src, buf, n) {
  const err = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const j = i * 4;
    const dr = src[j] - buf[j];
    const dg = src[j + 1] - buf[j + 1];
    const db = src[j + 2] - buf[j + 2];
    err[i] = dr * dr + dg * dg + db * db;
  }
  return err;
}

function _updateErrorRegion(err, src, buf, w, h, cx, cy, r) {
  const x0 = Math.max(0, cx - r);
  const x1 = Math.min(w - 1, cx + r);
  const y0 = Math.max(0, cy - r);
  const y1 = Math.min(h - 1, cy + r);
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const i = y * w + x;
      const j = i * 4;
      const dr = src[j] - buf[j];
      const dg = src[j + 1] - buf[j + 1];
      const db = src[j + 2] - buf[j + 2];
      err[i] = dr * dr + dg * dg + db * db;
    }
  }
}

function _buildCDF(weights, n) {
  const cdf = new Float32Array(n);
  let total = 0;
  for (let i = 0; i < n; i++) total += weights[i];
  if (total === 0) {
    for (let i = 0; i < n; i++) cdf[i] = (i + 1) / n;
    return cdf;
  }
  let acc = 0;
  for (let i = 0; i < n; i++) {
    acc += weights[i];
    cdf[i] = acc / total;
  }
  return cdf;
}

function _sampleCDF(cdf, rndVal) {
  let lo = 0;
  let hi = cdf.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cdf[mid] < rndVal) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/**
 * Build stroke palette from mode (CUSTOM/SOURCE/EXTRACT/presets).
 * @source blog/docs/components/distort/modules/paintstroke.md
 * @wikipedia https://en.wikipedia.org/wiki/Color_quantization
 * @formula palette = sample(source) | extract(histogram) | preset[mode]
 */
export function buildPalette(src, w, h, mode, rng, customColours, extractCount = 12) {
  const m = String(mode).toUpperCase();
  if (m === 'CUSTOM' && customColours?.length) return customColours;
  if (m === 'GREYSCALE') return PRESET_PALETTES.greyscale;
  if (m === 'WARM') return PRESET_PALETTES.warm;
  if (m === 'COOL') return PRESET_PALETTES.cool;
  if (m === 'EXTRACT') return _extractPalette(src, w, h, extractCount);
  const samples = Math.min(16, Math.max(8, Math.floor(w * h / 1000)));
  const palette = [];
  for (let i = 0; i < samples; i++) {
    const x = rng.nextInt(0, w);
    const y = rng.nextInt(0, h);
    const si = (y * w + x) * 4;
    palette.push([src[si], src[si + 1], src[si + 2]]);
  }
  return palette;
}

function _extractPalette(src, w, h, k) {
  const buckets = new Map();
  const step = Math.max(1, Math.floor(Math.sqrt((w * h) / (k * 80))));
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const j = (y * w + x) * 4;
      const key = `${(src[j] >> 4)},${(src[j + 1] >> 4)},${(src[j + 2] >> 4)}`;
      const prev = buckets.get(key);
      if (prev) {
        prev[0] += src[j];
        prev[1] += src[j + 1];
        prev[2] += src[j + 2];
        prev[3]++;
      } else {
        buckets.set(key, [src[j], src[j + 1], src[j + 2], 1]);
      }
    }
  }
  const sorted = [...buckets.values()]
    .map(v => [Math.round(v[0] / v[3]), Math.round(v[1] / v[3]), Math.round(v[2] / v[3]), v[3]])
    .sort((a, b) => b[3] - a[3]);
  return sorted.slice(0, k).map(v => [v[0], v[1], v[2]]);
}

function _nearestPalette(palette, r, g, b) {
  let best = palette[0];
  let bestDist = Infinity;
  for (const pc of palette) {
    const d = (pc[0] - r) ** 2 + (pc[1] - g) ** 2 + (pc[2] - b) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = pc;
    }
  }
  return best;
}

function _alphaNorm(minOp, maxOp, mode) {
  if (mode === 'expected') return (minOp + maxOp) / 2 / 255;
  return ((minOp + maxOp) / 2) / 255;
}

function _findBestPaletteColour(buf, src, palette, px, py, w, minOp, maxOp, alphaMode, colourDistance, paletteBlend) {
  const si = (py * w + px) * 4;
  const tr = src[si];
  const tg = src[si + 1];
  const tb = src[si + 2];
  const cr = buf[si];
  const cg = buf[si + 1];
  const cb = buf[si + 2];
  const alphaNorm = _alphaNorm(minOp, maxOp, alphaMode);

  let bestColor = null;
  let bestDist = Infinity;
  for (const pc of palette) {
    const sr = cr + (pc[0] - cr) * alphaNorm;
    const sg = cg + (pc[1] - cg) * alphaNorm;
    const sb = cb + (pc[2] - cb) * alphaNorm;
    let d;
    if (colourDistance === 'lumaOnly') {
      const sl = sr * 0.299 + sg * 0.587 + sb * 0.114;
      const tl = tr * 0.299 + tg * 0.587 + tb * 0.114;
      d = (sl - tl) ** 2;
    } else {
      d = (sr - tr) ** 2 + (sg - tg) ** 2 + (sb - tb) ** 2;
    }
    if (d < bestDist) {
      bestDist = d;
      bestColor = pc;
    }
  }
  if (!bestColor) return null;
  const blend = paletteBlend ?? 0;
  return [
    Math.round(bestColor[0] + (tr - bestColor[0]) * blend),
    Math.round(bestColor[1] + (tg - bestColor[1]) * blend),
    Math.round(bestColor[2] + (tb - bestColor[2]) * blend),
  ];
}

function _clamp8(v) {
  return v < 0 ? 0 : (v > 255 ? 255 : v);
}

/**
 * Analytic overcorrection colour solve. Given current canvas C and target T at
 * the pixel, solve for the paint colour P such that the translucent blend lands
 * on target: C + (P - C)*a == T  ->  P = C + (T - C)/a. With a < 1 this overshoots
 * past the target (deliberately out of gamut), then snaps to the nearest palette
 * member so the needed extreme is chosen. paletteBlend relaxes the snap toward the
 * clamped ideal; colourJitter adds break-up for an impressionist feel. The gain is
 * capped at `overshoot` (gain = min(overshoot, 1/a)) so a single translucent dab
 * never demands a wildly out-of-gamut palette extreme — keeping picked colours close
 * to the target and robust to brush/canvas feedback.
 */
function _solveOvercorrectColour(buf, src, palette, rng, px, py, w, minOp, maxOp, alphaMode, paletteBlend, colourJitter, overshoot) {
  const si = (py * w + px) * 4;
  const tr = src[si], tg = src[si + 1], tb = src[si + 2];
  const cr = buf[si], cg = buf[si + 1], cb = buf[si + 2];
  const a = Math.max(0.02, _alphaNorm(minOp, maxOp, alphaMode));
  const gain = Math.min(Math.max(1, overshoot ?? 2), 1 / a);

  const pr = cr + (tr - cr) * gain;
  const pg = cg + (tg - cg) * gain;
  const pb = cb + (tb - cb) * gain;

  const snapped = palette?.length
    ? _nearestPalette(palette, pr, pg, pb)
    : [_clamp8(pr), _clamp8(pg), _clamp8(pb)];

  const blend = paletteBlend ?? 0;
  let r = snapped[0] + (_clamp8(pr) - snapped[0]) * blend;
  let g = snapped[1] + (_clamp8(pg) - snapped[1]) * blend;
  let b = snapped[2] + (_clamp8(pb) - snapped[2]) * blend;

  if (colourJitter > 0) {
    r += (rng.next() * 2 - 1) * colourJitter;
    g += (rng.next() * 2 - 1) * colourJitter;
    b += (rng.next() * 2 - 1) * colourJitter;
  }
  return [Math.round(_clamp8(r)), Math.round(_clamp8(g)), Math.round(_clamp8(b))];
}

function _resolveAngle(directionSource, manualAngle, gradAng, idx, rng) {
  switch (directionSource) {
    case 'GRADIENT ANGLE': return gradAng[idx];
    case 'EDGE TANGENT': return gradAng[idx] + Math.PI * 0.5;
    case 'MANUAL ANGLE': return manualAngle * (Math.PI / 180);
    default: return rng.next() * Math.PI * 2;
  }
}

function _normMode(m) {
  return String(m).toUpperCase().replace(/\s+/g, ' ');
}

function _buildPlacementWeights(mode, n, errorMap, edgeMap, gradMag, lum, saliency, edgeInf, contrastInf, lumInf, modulate) {
  const weights = new Float32Array(n);
  const m = _normMode(mode);
  if (m === 'RANDOM' || m === 'UNIFORMRANDOM') {
    weights.fill(1);
    return weights;
  }
  for (let i = 0; i < n; i++) {
    const ei = modulate?.('edgeInfluence', i) ?? edgeInf;
    const ci = modulate?.('contrastInfluence', i) ?? contrastInf;
    const li = modulate?.('luminanceInfluence', i) ?? lumInf;
    const inf = 1 + edgeMap[i] * ei + gradMag[i] * ci + (lum[i] / 255) * li;

    let w = 1;
    if (m === 'ERROR DRIVEN') w = (errorMap[i] / (255 * 255 * 3 + 1e-6)) * inf;
    else if (m === 'EDGE DRIVEN') w = edgeMap[i] * inf;
    else if (m === 'GRADIENT DRIVEN') w = gradMag[i] * inf;
    else if (m === 'SALIENCY DRIVEN') w = saliency[i] * inf;
    else if (m === 'WEIGHTED RANDOM') {
      w = edgeMap[i] * ei + gradMag[i] * ci + (lum[i] / 255) * li;
      w = Math.max(w, 0.01);
    } else if (m === 'STRATIFIED') {
      weights.fill(1);
      return weights;
    }
    weights[i] = Math.max(w, 0.01);
  }
  return weights;
}

function _resolveWeight(pidx, weightSource, weightMode, rng, hooks) {
  let w = 1;
  const src = String(weightSource).toUpperCase();
  if (src === 'DRIVER') {
    w = (hooks.getDriverWeight?.(pidx) ?? 255) / 255;
  } else if (src === 'MASK') {
    w = hooks.maskData ? hooks.maskData[pidx] / 255 : 1;
  } else if (src === 'SOURCE LUM') {
    w = hooks.sourceLum?.[pidx] ?? 1;
  }
  w = Math.max(0, Math.min(1, w));
  const mode = String(weightMode).toUpperCase();
  if (mode === 'REJECT' || mode === 'PROBABILITY') {
    return { skip: rng.next() > w, scaleOpacity: 1, scaleSize: 1 };
  }
  if (mode === 'SCALE OPACITY') return { skip: false, scaleOpacity: w, scaleSize: 1 };
  if (mode === 'SCALE SIZE') return { skip: false, scaleOpacity: 1, scaleSize: w };
  return { skip: false, scaleOpacity: 1, scaleSize: 1 };
}

// Footprint radius tracks the actual painted mark (radius ~= size/2), so the
// per-pixel layer grid reflects real brush-size overlap, not a smaller centre box.
function _addLayerFootprint(layers, w, h, x, y, size) {
  const lr = Math.max(1, Math.round(size / 2));
  const lr2 = lr * lr;
  let touched = 0;
  for (let py = Math.max(0, y - lr); py < Math.min(h, y + lr); py++) {
    const dy = py - y;
    for (let px = Math.max(0, x - lr); px < Math.min(w, x + lr); px++) {
      const dx = px - x;
      if (dx * dx + dy * dy > lr2) continue;
      layers[py * w + px]++;
      touched++;
    }
  }
  return touched;
}

function _coverageAlphaFactor(shape) {
  const s = String(shape).toUpperCase();
  if (s === 'HARD DAB') return 1;
  if (s === 'RADIAL GRADIENT' || s === 'SOFT DAB') return 0.6;
  return 0.75;
}

function _avgCoverage(totalStrokes, brushMin, brushMax, totalPixels) {
  const avgBrushR = (brushMin + brushMax) / 4;
  return (totalStrokes * Math.PI * avgBrushR * avgBrushR) / totalPixels;
}

/**
 * Run generative painter into dst buffer.
 * @source blog/docs/components/distort/modules/paintstroke.md
 * @wikipedia https://en.wikipedia.org/wiki/Pointillism
 * @formula stroke budget = passCount * iterations; stop when avgLayers >= maxAverageLayers
 * @param {Uint8ClampedArray} src
 * @param {Uint8ClampedArray} dst
 * @param {number} w
 * @param {number} h
 * @param {object} p - Resolved params
 * @param {object} hooks - { rng, modulate(key,pidx), maskData, getDriverWeight(pidx), strokes[], debug }
 */
export function runGenerativePainter(src, dst, w, h, p, hooks) {
  const rng = hooks.rng;
  const n = w * h;
  const bg = hexToRgb(p.backgroundColour ?? '#000000');

  const buf = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < n; i++) {
    const j = i * 4;
    buf[j] = bg[0];
    buf[j + 1] = bg[1];
    buf[j + 2] = bg[2];
    buf[j + 3] = 255;
  }

  const lum = _luma(src, n);
  hooks.sourceLum = lum;
  const grad = _sobelGrad(lum, w, h);
  const edgeMap = _edgeMap(grad.mag, n);
  const saliency = new Float32Array(n);
  for (let i = 0; i < n; i++) saliency[i] = edgeMap[i] * (grad.mag[i] / (255 + 1e-6));

  const layers = new Float32Array(n);
  const totalPixels = n;
  let totalStrokes = 0;
  let coverageSum = 0;
  const coverageModel = p.coverageModel ?? 'brushAreaApprox';
  const useTrueAccum = coverageModel === 'trueAccumulation';

  const brushMin = Math.min(p.brushMin, p.brushMax);
  const brushMax = Math.max(p.brushMin + 1, p.brushMax);
  const maxAvg = p.maxAverageLayers ?? p.maxLayers ?? 15;
  const maxPix = p.maxPixelLayers ?? 20;
  const iters = p.iterations ?? 5000;
  const painterMode = String(p.painterMode ?? 'DOT').toUpperCase();
    const isDot = painterMode === 'DOT';
    const isPatch = painterMode === 'PATCH';
    const passCount = isDot ? 1 : Math.max(1, Math.round(p.passCount ?? 1));
  const palette = buildPalette(src, w, h, p.paletteMode, rng, parsePaletteColours(p.paletteColours), p.extractCount ?? 12);
  const brushShape = isDot ? 'RADIAL GRADIENT' : (p.brushShape ?? 'ELLIPSE');
  const placementMode = isDot ? 'RANDOM' : (p.placementMode ?? 'RANDOM');
  const modulate = hooks.modulate ?? (() => 0);
  const strokeLog = hooks.strokes;
  const strokeLogLimit = p.strokeLogLimit ?? 5000;

  let errorMap = _errorMap(src, buf, n);
  const flowPolylines = [];

  for (let pass = 0; pass < passCount; pass++) {
    const strokesPerPass = Math.max(1, Math.round(iters));

    const weights = _buildPlacementWeights(
      placementMode, n, errorMap, edgeMap, grad.mag, lum, saliency,
      p.edgeInfluence ?? 0, p.contrastInfluence ?? 0, p.luminanceInfluence ?? 0,
      modulate,
    );
    const cdf = _buildCDF(weights, n);
    const errThreshSq = (p.errorThreshold ?? 0) ** 2 * 3;
    const doStroke = painterMode !== 'DOT';
    const flowBrushLength = doStroke ? Math.max(1, p.brushLength ?? 20) : 1;

    if (painterMode === 'FLOW STROKE' && pass === 0) {
      const polys = paintStrokeErrorGuided(errorMap, w, h, grad, edgeMap, {
        brushRadius: Math.max(1, Math.round((brushMin + brushMax) / 4)),
        minLength: 4,
        maxLength: Math.round(flowBrushLength * 2),
        passCount: Math.min(32, Math.max(4, Math.floor(strokesPerPass / 50))),
        seed: (hooks.seed ?? 0) + pass,
      });
      flowPolylines.push(...polys);
    }

    let covered = 0;
    for (let iter = 0; iter < strokesPerPass; iter++) {
      if (useTrueAccum) {
        if (coverageSum / totalPixels >= maxAvg) break;
      } else if (_avgCoverage(totalStrokes, brushMin, brushMax, totalPixels) >= maxAvg) {
        break;
      }

      let pidx;
      if (_normMode(placementMode) === 'STRATIFIED') {
        const grid = Math.ceil(Math.sqrt(strokesPerPass));
        const cell = iter % (grid * grid);
        const gx = cell % grid;
        const gy = (cell / grid) | 0;
        const px = Math.min(w - 1, Math.floor((gx + rng.next()) * w / grid));
        const py = Math.min(h - 1, Math.floor((gy + rng.next()) * h / grid));
        pidx = py * w + px;
      } else {
        pidx = _sampleCDF(cdf, rng.next());
      }

      const px = pidx % w;
      const py = (pidx / w) | 0;

      if (errorMap[pidx] < errThreshSq * 0.01 && errThreshSq > 0) continue;
      if (layers[pidx] > maxPix) continue;

      const wt = _resolveWeight(pidx, p.weightSource ?? 'NONE', p.weightMode ?? 'REJECT', rng, hooks);
      if (wt.skip) continue;

      let size = rng.nextRange(modulate('brushMin', pidx), modulate('brushMax', pidx))
        * wt.scaleSize;
      if (isPatch) size *= 1.35;
      const jitter = modulate('brushJitter', pidx) ?? p.brushJitter ?? 0;
      const jx = jitter > 0 ? Math.round((rng.next() * 2 - 1) * jitter) : 0;
      const jy = jitter > 0 ? Math.round((rng.next() * 2 - 1) * jitter) : 0;
      const cx = Math.max(0, Math.min(w - 1, px + jx));
      const cy = Math.max(0, Math.min(h - 1, py + jy));

      const minOp = modulate('minOpacity', pidx) ?? p.minOpacity;
      const maxOp = modulate('maxOpacity', pidx) ?? p.maxOpacity;
      let opacity = rng.nextRange(minOp, maxOp) * wt.scaleOpacity;
      opacity = Math.max(1, Math.min(255, Math.round(opacity)));

      const paletteBlend = modulate('paletteBlend', pidx) ?? p.paletteBlend ?? 0;
      const colourJitter = modulate('colourJitter', pidx) ?? p.colourJitter ?? 0;
      const hardness = modulate('brushHardness', pidx) ?? p.brushHardness ?? 0.75;
      const brushLengthScale = doStroke
        ? Math.max(1, modulate('brushLength', pidx) ?? p.brushLength ?? 20)
        : 1;

      let rgb;
      if (isDot) {
        rgb = _findBestPaletteColour(
          buf, src, palette, cx, cy, w, minOp, maxOp,
          p.alphaAssumption ?? 'midpoint', p.colourDistance ?? 'rgbSquared', paletteBlend,
        );
        if (!rgb) continue;
      } else {
        rgb = _solveOvercorrectColour(
          buf, src, palette, rng, cx, cy, w, minOp, maxOp,
          p.alphaAssumption ?? 'midpoint', paletteBlend, colourJitter,
          modulate('overshoot', pidx) ?? p.overshoot ?? 2,
        );
      }

      const color = [rgb[0], rgb[1], rgb[2], opacity];
      const strokeAngleJitterDeg = modulate('strokeAngleJitter', pidx) ?? p.strokeAngleJitter ?? 0;
      const angleJitter = strokeAngleJitterDeg * (Math.PI / 180) * (rng.next() * 2 - 1);
      const manualAngle = modulate('manualAngle', pidx) ?? p.manualAngle ?? 0;
      const angle = _resolveAngle(p.directionSource ?? 'NONE', manualAngle, grad.ang, pidx, rng) + angleJitter;

      if (doStroke && painterMode !== 'FLOW STROKE') {
        paintBrushShape(buf, w, h, cx, cy, color, size, brushShape, hardness, angle, rng, brushLengthScale);
        _updateErrorRegion(errorMap, src, buf, w, h, cx, cy, Math.ceil(size));
      } else if (painterMode === 'FLOW STROKE' && flowPolylines.length) {
        const poly = flowPolylines[iter % flowPolylines.length];
        if (poly?.length) {
          const pts = poly.map(pt => ({ x: pt[0], y: pt[1] }));
          const out = paintPolyline(buf, w, h, pts, {
            color,
            radius: Math.max(1, Math.round(size / 2)),
            hardness,
            shape: brushShape === 'RADIAL GRADIENT' ? 'RADIAL GRADIENT' : 'SOFT DAB',
          });
          buf.set(out);
          _updateErrorRegion(errorMap, src, buf, w, h, cx, cy, Math.ceil(size / 2));
        }
      } else {
        paintBrushShape(buf, w, h, cx, cy, color, size, 'RADIAL GRADIENT', hardness, angle, rng);
        _updateErrorRegion(errorMap, src, buf, w, h, cx, cy, Math.ceil(size / 2));
      }

      const stampShape = doStroke ? brushShape : 'RADIAL GRADIENT';
      const touched = _addLayerFootprint(layers, w, h, cx, cy, size);
      if (useTrueAccum) {
        const effAlpha = (opacity / 255) * _coverageAlphaFactor(stampShape);
        coverageSum += touched * effAlpha;
      }
      totalStrokes++;
      covered++;

      if (strokeLog && strokeLog.length < strokeLogLimit) {
        strokeLog.push({ x: cx, y: cy, size, opacity, colour: rgb });
      }

      if (covered / strokesPerPass >= (p.coverageTarget ?? 1)) break;
    }
  }

  if (hooks.debug) {
    hooks.debug.layerMap = layers;
    hooks.debug.errorMap = errorMap;
    hooks.debug.stats = {
      totalStrokes,
      avgLayers: useTrueAccum ? coverageSum / totalPixels : _avgCoverage(totalStrokes, brushMin, brushMax, totalPixels),
      coverageSum,
    };
  }

  dst.set(buf);
}
