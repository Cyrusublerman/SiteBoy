import { createEffectModule } from '../../core/EffectModule.js';
import { paintStamp } from '../../../../../shared/algorithms/painter/brush-engine.js';
import { SeededRNG } from '../../core/SeededRNG.js';
import { gradientMagnitude2D } from '../../../../../shared/algorithms/features/feature-extraction.js';
import { paintStrokeErrorGuided } from '../../../../../shared/algorithms/rendering/paintstroke-error.js';

// ── Source analysis helpers ───────────────────────────────────────────────────

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
      gx[i] = vx; gy[i] = vy;
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
    const dr = src[j] - buf[j], dg = src[j + 1] - buf[j + 1], db = src[j + 2] - buf[j + 2];
    err[i] = dr * dr + dg * dg + db * db;
  }
  return err;
}

function _updateErrorRegion(err, src, buf, w, h, cx, cy, r) {
  const x0 = Math.max(0, cx - r), x1 = Math.min(w - 1, cx + r);
  const y0 = Math.max(0, cy - r), y1 = Math.min(h - 1, cy + r);
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const i = y * w + x, j = i * 4;
      const dr = src[j] - buf[j], dg = src[j + 1] - buf[j + 1], db = src[j + 2] - buf[j + 2];
      err[i] = dr * dr + dg * dg + db * db;
    }
  }
}

// ── Weighted sampler (alias/cdf approach for small-N is fine; use linear scan) ─

function _buildCDF(weights, n) {
  const cdf = new Float32Array(n);
  let total = 0;
  for (let i = 0; i < n; i++) total += weights[i];
  if (total === 0) { for (let i = 0; i < n; i++) cdf[i] = (i + 1) / n; return cdf; }
  let acc = 0;
  for (let i = 0; i < n; i++) { acc += weights[i]; cdf[i] = acc / total; }
  return cdf;
}

function _sampleCDF(cdf, rndVal) {
  let lo = 0, hi = cdf.length - 1;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (cdf[mid] < rndVal) lo = mid + 1; else hi = mid; }
  return lo;
}

// ── Palette helpers ───────────────────────────────────────────────────────────

function _buildPalette(src, w, h, mode, rng) {
  if (mode === 'greyscale') return [[0,0,0],[64,64,64],[128,128,128],[192,192,192],[255,255,255]];
  if (mode === 'warm') return [[30,10,5],[120,40,20],[200,100,50],[240,180,100],[255,230,200]];
  if (mode === 'cool') return [[5,10,30],[20,40,120],[50,100,200],[100,180,240],[200,230,255]];
  const samples = Math.min(16, Math.max(8, Math.floor(w * h / 1000)));
  const palette = [];
  for (let i = 0; i < samples; i++) {
    const x = rng.nextInt(0, w), y = rng.nextInt(0, h), si = (y * w + x) * 4;
    palette.push([src[si], src[si + 1], src[si + 2]]);
  }
  return palette;
}

function _nearestPalette(palette, r, g, b) {
  let best = null, bestDist = Infinity;
  for (const pc of palette) {
    const d = (pc[0]-r)**2 + (pc[1]-g)**2 + (pc[2]-b)**2;
    if (d < bestDist) { bestDist = d; best = pc; }
  }
  return best;
}

// ── Ellipse-oriented brush stamp ──────────────────────────────────────────────
// Paints an axis-aligned ellipse rotated by `angle` radians, with semi-axis
// `radiusA` along the stroke direction and `radiusB` perpendicular.

function _stampEllipse(buf, w, h, cx, cy, color, radiusA, radiusB, angle, hardness) {
  const cosA = Math.cos(-angle), sinA = Math.sin(-angle);
  const rA2 = radiusA * radiusA, rB2 = radiusB * radiusB;
  const rmax = Math.max(radiusA, radiusB);
  const x0 = Math.max(0, Math.floor(cx - rmax)), x1 = Math.min(w - 1, Math.ceil(cx + rmax));
  const y0 = Math.max(0, Math.floor(cy - rmax)), y1 = Math.min(h - 1, Math.ceil(cy + rmax));
  const colA = (color[3] / 255);
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dx = x - cx, dy = y - cy;
      const lx = cosA * dx - sinA * dy;
      const ly = sinA * dx + cosA * dy;
      const t = lx * lx / rA2 + ly * ly / rB2;
      if (t > 1) continue;
      const dist = Math.sqrt(t);
      const alpha = colA * (dist <= hardness ? 1 : Math.max(0, 1 - (dist - hardness) / (1 - hardness + 1e-6)));
      const inv = 1 - alpha;
      const j = (y * w + x) * 4;
      buf[j]     = buf[j]     * inv + color[0] * alpha;
      buf[j + 1] = buf[j + 1] * inv + color[1] * alpha;
      buf[j + 2] = buf[j + 2] * inv + color[2] * alpha;
      buf[j + 3] = Math.min(255, buf[j + 3] + 255 * alpha);
    }
  }
}

// ── Stroke angle resolver ─────────────────────────────────────────────────────

function _resolveAngle(directionSource, manualAngle, gradAng, idx, rng) {
  switch (directionSource) {
    case 'GRADIENT ANGLE': return gradAng[idx];
    case 'EDGE TANGENT':   return gradAng[idx] + Math.PI * 0.5;
    case 'MANUAL ANGLE':   return manualAngle * (Math.PI / 180);
    default:               return rng.next() * Math.PI * 2;
  }
}

// ── Placement weight builder ──────────────────────────────────────────────────

function _buildPlacementWeights(mode, n, errorMap, edgeMap, gradMag, lum,
                                edgeInf, contrastInf, lumInf) {
  const weights = new Float32Array(n);
  if (mode === 'RANDOM') {
    weights.fill(1);
    return weights;
  }
  for (let i = 0; i < n; i++) {
    let w = 1;
    if (mode === 'ERROR DRIVEN')    w = errorMap[i] / (255 * 255 * 3 + 1e-6);
    else if (mode === 'EDGE DRIVEN')     w = edgeMap[i];
    else if (mode === 'GRADIENT DRIVEN') w = gradMag[i];
    else if (mode === 'WEIGHTED RANDOM') {
      w = edgeMap[i] * edgeInf + gradMag[i] * contrastInf + (lum[i] / 255) * lumInf;
      w = Math.max(w, 0.01);
    }
    weights[i] = w;
  }
  return weights;
}

// ── Colour selection ──────────────────────────────────────────────────────────

function _pickColour(src, buf, mode, palette, rng, px, py, w, paletteBlend, colourJitter) {
  const si = (py * w + px) * 4;
  let r, g, b;

  if (mode === 'SOURCE') {
    r = src[si]; g = src[si + 1]; b = src[si + 2];
  } else if (palette && palette.length) {
    const sr = src[si], sg = src[si + 1], sb = src[si + 2];
    const pc = _nearestPalette(palette, sr, sg, sb);
    const blend = paletteBlend;
    r = pc[0] + (sr - pc[0]) * blend;
    g = pc[1] + (sg - pc[1]) * blend;
    b = pc[2] + (sb - pc[2]) * blend;
  } else {
    r = src[si]; g = src[si + 1]; b = src[si + 2];
  }

  if (colourJitter > 0) {
    r = Math.max(0, Math.min(255, r + (rng.next() * 2 - 1) * colourJitter));
    g = Math.max(0, Math.min(255, g + (rng.next() * 2 - 1) * colourJitter));
    b = Math.max(0, Math.min(255, b + (rng.next() * 2 - 1) * colourJitter));
  }

  return [Math.round(r), Math.round(g), Math.round(b)];
}

// ── Per-pass stroke loop ──────────────────────────────────────────────────────

function _runPass(buf, src, w, h, n, rng, p, passIdx, passCount,
                  gradMag, gradAng, edgeMap, lum, errorMap) {
  const effectiveBrushMin = Math.min(p.brushMin, p.brushMax);
  const effectiveBrushMax = Math.max(p.brushMin + 1, p.brushMax);

  const t = passCount > 1 ? (1 - passIdx / (passCount - 1)) : 1;
  const sizeMax = effectiveBrushMax * (0.3 + 0.7 * t);
  const sizeMin = effectiveBrushMin * (0.3 + 0.7 * t);

  const strokesPerPass = Math.max(1, Math.ceil(p.iterations / passCount));
  const palette = p.paletteMode === 'SOURCE' ? null
    : _buildPalette(src, w, h, p.paletteMode.toLowerCase(), rng);

  const edgeInf     = p.edgeInfluence ?? 0;
  const contrastInf = p.contrastInfluence ?? 0;
  const lumInf      = p.luminanceInfluence ?? 0;

  const weights = _buildPlacementWeights(
    p.placementMode, n, errorMap, edgeMap, gradMag, lum, edgeInf, contrastInf, lumInf
  );
  const cdf = _buildCDF(weights, n);

  const errThreshSq = (p.errorThreshold ?? 255) ** 2 * 3;
  const coverageTarget = p.coverageTarget ?? 1;

  const doStroke = p.painterMode !== 'DOT';
  const hardness = p.brushHardness ?? 0.75;
  const brushLengthScale = doStroke ? Math.max(1, p.brushLength ?? 20) : 1;

  let covered = 0;

  for (let iter = 0; iter < strokesPerPass; iter++) {
    const pidx = _sampleCDF(cdf, rng.next());
    const px = pidx % w;
    const py = (pidx / w) | 0;

    if (errorMap[pidx] < errThreshSq * 0.01) continue;

    const size = rng.nextRange(sizeMin, sizeMax);
    const jitter = p.brushJitter ?? 0;
    const jx = jitter > 0 ? Math.round((rng.next() * 2 - 1) * jitter) : 0;
    const jy = jitter > 0 ? Math.round((rng.next() * 2 - 1) * jitter) : 0;
    const cx = Math.max(0, Math.min(w - 1, px + jx));
    const cy = Math.max(0, Math.min(h - 1, py + jy));

    const opacity = rng.nextRange(p.minOpacity, p.maxOpacity);
    const [r, g, b] = _pickColour(src, buf, p.paletteMode, palette, rng, cx, cy, w,
                                   p.paletteBlend ?? 0, p.colourJitter ?? 0);

    if (doStroke) {
      const angle = _resolveAngle(p.directionSource, p.manualAngle ?? 0, gradAng, pidx, rng);
      const radiusA = Math.max(1, size * brushLengthScale / 2);
      const radiusB = Math.max(1, size / 2);
      const angleJitter = (p.strokeAngleJitter ?? 0) * (Math.PI / 180) * (rng.next() * 2 - 1);
      _stampEllipse(buf, w, h, cx, cy, [r, g, b, opacity], radiusA, radiusB, angle + angleJitter, hardness);
      _updateErrorRegion(errorMap, src, buf, w, h, cx, cy, Math.ceil(radiusA));
    } else {
      const radius = Math.max(1, Math.round(size / 2));
      const color = [r, g, b, opacity];
      const rr = radius * radius;
      for (let oy = -radius; oy <= radius; oy++) {
        for (let ox = -radius; ox <= radius; ox++) {
          const d2 = ox * ox + oy * oy;
          if (d2 > rr) continue;
          const bx = cx + ox, by = cy + oy;
          if (bx < 0 || by < 0 || bx >= w || by >= h) continue;
          const td = Math.sqrt(d2) / radius;
          const alpha = (opacity / 255) * (td <= hardness ? 1 : Math.max(0, 1 - (td - hardness) / (1 - hardness + 1e-6)));
          const inv = 1 - alpha;
          const j = (by * w + bx) * 4;
          buf[j]     = buf[j]     * inv + r * alpha;
          buf[j + 1] = buf[j + 1] * inv + g * alpha;
          buf[j + 2] = buf[j + 2] * inv + b * alpha;
          buf[j + 3] = Math.min(255, buf[j + 3] + 255 * alpha);
        }
      }
      _updateErrorRegion(errorMap, src, buf, w, h, cx, cy, Math.ceil(size / 2));
    }

    covered++;
    if (covered / strokesPerPass >= coverageTarget) break;
  }
}

// ── Module ────────────────────────────────────────────────────────────────────

export const PaintStrokeNode = createEffectModule({
  type: 'paintstroke',
  name: 'PAINT STROKE',
  category: 'GENERATIVE',
  params: {
    // ── Existing brush params (retained) ──────────────────────────────────────
    brushMin:    { label: 'BRUSH MIN',   min: 1,     max: 100,   step: 1,     value: 10,    tier: 3, unit: 'px', driveable: true },
    brushMax:    { label: 'BRUSH MAX',   min: 2,     max: 200,   step: 1,     value: 50,    tier: 3, unit: 'px', driveable: true },
    minOpacity:  { label: 'MIN OPAC',    min: 1,     max: 255,   step: 1,     value: 10,    tier: 3, unit: 'lvl', driveable: true },
    maxOpacity:  { label: 'MAX OPAC',    min: 1,     max: 255,   step: 1,     value: 50,    tier: 3, unit: 'lvl', driveable: true },
    iterations:  { label: 'STROKES',     min: 100,   max: 50000, step: 100,   value: 5000,  tier: 3, previewMax: 1000, unit: 'n', driveable: true },
    maxLayers:   { label: 'MAX LAYERS',  min: 1,     max: 50,    step: 1,     value: 15,    tier: 4, unit: 'n', driveable: true },
    paletteMode: { label: 'PALETTE',     type: 'select', options: ['SOURCE','GREYSCALE','WARM','COOL'], value: 'SOURCE', tier: 4 },

    // ── Painter mode ──────────────────────────────────────────────────────────
    painterMode: { label: 'PAINTER MODE', type: 'select',
      options: ['DOT','STROKE','FLOW STROKE','PATCH','PALETTE RECONSTRUCTION'],
      value: 'DOT', tier: 3 },

    // ── Brush shape and properties ────────────────────────────────────────────
    brushShape:    { label: 'BRUSH SHAPE', type: 'select',
      options: ['SOFT DAB','HARD DAB','ELLIPSE','BRISTLE','RIBBON','DRY BRUSH'],
      value: 'SOFT DAB', tier: 3 },
    brushHardness: { label: 'HARDNESS',    min: 0, max: 1,   step: 0.01, value: 0.75, tier: 3, unit: 'normalised', driveable: true },
    brushLength:   { label: 'LENGTH',      min: 1, max: 200, step: 1,    value: 20,   tier: 3, unit: 'px', driveable: true,
      when: { brushShape: ['ELLIPSE','BRISTLE','RIBBON'] } },
    brushJitter:   { label: 'JITTER',      min: 0, max: 100, step: 1,    value: 5,    tier: 3, unit: 'px', driveable: true },
    edgeSoftness:  { label: 'EDGE SOFTNESS', min: 0, max: 1, step: 0.01, value: 0.2,  tier: 3, unit: 'normalised', driveable: true,
      when: { brushShape: ['ELLIPSE','BRISTLE','RIBBON'] } },

    // ── Placement ─────────────────────────────────────────────────────────────
    placementMode: { label: 'PLACEMENT', type: 'select',
      options: ['RANDOM','WEIGHTED RANDOM','ERROR DRIVEN','EDGE DRIVEN','GRADIENT DRIVEN','SALIENCY DRIVEN'],
      value: 'RANDOM', tier: 3 },

    // ── Direction ─────────────────────────────────────────────────────────────
    directionSource: { label: 'DIRECTION', type: 'select',
      options: ['NONE','GRADIENT ANGLE','EDGE TANGENT','FLOW FIELD','MANUAL ANGLE'],
      value: 'NONE', tier: 3 },
    manualAngle:     { label: 'ANGLE',   min: 0, max: 360, step: 1, value: 0, tier: 3, unit: '°', driveable: true,
      when: { directionSource: 'MANUAL ANGLE' } },
    strokeAngleJitter: { label: 'ANGLE JITTER', min: 0, max: 180, step: 1, value: 0, tier: 3, unit: '°', driveable: true },

    // ── Colour ────────────────────────────────────────────────────────────────
    paletteBlend:  { label: 'PAL BLEND',  min: 0, max: 1,   step: 0.01, value: 0,  tier: 4, unit: 'normalised', driveable: true },
    colourJitter:  { label: 'COL JITTER', min: 0, max: 255, step: 1,    value: 0,  tier: 4, unit: 'lvl', driveable: true },

    // ── Reconstruction ────────────────────────────────────────────────────────
    passCount:       { label: 'PASSES',    min: 1, max: 6,     step: 1,   value: 1,   tier: 4, unit: 'n', driveable: true,
      when: { painterMode: ['STROKE','FLOW STROKE','PATCH','PALETTE RECONSTRUCTION'] } },
    coverageTarget:  { label: 'COVERAGE',  min: 0, max: 1,     step: 0.01, value: 1,  tier: 4, unit: 'normalised', driveable: true,
      when: { painterMode: ['STROKE','FLOW STROKE','PATCH','PALETTE RECONSTRUCTION'] } },
    errorThreshold:  { label: 'ERR THRESH', min: 0, max: 255,  step: 1,    value: 0,  tier: 4, unit: 'lvl', driveable: true,
      when: { painterMode: ['STROKE','FLOW STROKE','PATCH','PALETTE RECONSTRUCTION'] } },
    frame:           { label: 'FRAME',      min: 0, max: 50000, step: 1,   value: 0,  tier: 3, unit: 'n', driveable: true },

    // ── Source guidance ───────────────────────────────────────────────────────
    edgeInfluence:     { label: 'EDGE INF',     min: 0, max: 1, step: 0.01, value: 0, tier: 4, unit: 'normalised', driveable: true,
      when: { placementMode: ['WEIGHTED RANDOM','ERROR DRIVEN','EDGE DRIVEN','GRADIENT DRIVEN'] } },
    contrastInfluence: { label: 'CONTRAST INF', min: 0, max: 1, step: 0.01, value: 0, tier: 4, unit: 'normalised', driveable: true,
      when: { placementMode: ['WEIGHTED RANDOM','ERROR DRIVEN','EDGE DRIVEN','GRADIENT DRIVEN'] } },
    luminanceInfluence:{ label: 'LUM INF',      min: 0, max: 1, step: 0.01, value: 0, tier: 4, unit: 'normalised', driveable: true,
      when: { placementMode: ['WEIGHTED RANDOM','ERROR DRIVEN','EDGE DRIVEN','GRADIENT DRIVEN'] } },
    hueInfluence:      { label: 'HUE INF',      min: 0, max: 1, step: 0.01, value: 0, tier: 4, unit: 'normalised', driveable: true,
      when: { placementMode: ['WEIGHTED RANDOM','ERROR DRIVEN','EDGE DRIVEN','GRADIENT DRIVEN'] } },
  },

  apply(src, dst, w, h, p, ctx, modulate) {
    const seed = ctx?.nodeSeed ?? 42;
    const rng  = new SeededRNG(seed);
    const n    = w * h;

    // ── Resolve driveable values ──────────────────────────────────────────────
    const brushMin     = modulate ? modulate('brushMin',     p.brushMin)     : p.brushMin;
    const brushMax     = modulate ? modulate('brushMax',     p.brushMax)     : p.brushMax;
    const minOpacity   = modulate ? modulate('minOpacity',   p.minOpacity)   : p.minOpacity;
    const maxOpacity   = modulate ? modulate('maxOpacity',   p.maxOpacity)   : p.maxOpacity;
    const iters        = modulate ? modulate('iterations',   p.iterations)   : p.iterations;
    const passCount    = modulate ? modulate('passCount',    p.passCount ?? 1)    : (p.passCount ?? 1);
    const brushHardness= modulate ? modulate('brushHardness',p.brushHardness ?? 0.75) : (p.brushHardness ?? 0.75);
    const brushLength  = modulate ? modulate('brushLength',  p.brushLength ?? 20) : (p.brushLength ?? 20);
    const brushJitter  = modulate ? modulate('brushJitter',  p.brushJitter ?? 0)  : (p.brushJitter ?? 0);
    const paletteBlend = modulate ? modulate('paletteBlend', p.paletteBlend ?? 0) : (p.paletteBlend ?? 0);
    const colourJitter = modulate ? modulate('colourJitter', p.colourJitter ?? 0) : (p.colourJitter ?? 0);
    const coverageTarget  = modulate ? modulate('coverageTarget',  p.coverageTarget ?? 1)  : (p.coverageTarget ?? 1);
    const errorThreshold  = modulate ? modulate('errorThreshold',  p.errorThreshold ?? 0)  : (p.errorThreshold ?? 0);
    const edgeInfluence   = modulate ? modulate('edgeInfluence',   p.edgeInfluence ?? 0)   : (p.edgeInfluence ?? 0);
    const contrastInfluence = modulate ? modulate('contrastInfluence', p.contrastInfluence ?? 0) : (p.contrastInfluence ?? 0);
    const luminanceInfluence = modulate ? modulate('luminanceInfluence', p.luminanceInfluence ?? 0) : (p.luminanceInfluence ?? 0);
    const manualAngle  = modulate ? modulate('manualAngle',  p.manualAngle ?? 0)  : (p.manualAngle ?? 0);
    const strokeAngleJitter = modulate ? modulate('strokeAngleJitter', p.strokeAngleJitter ?? 0) : (p.strokeAngleJitter ?? 0);

    // Clamp brushMin ≤ brushMax (guard undefined behaviour)
    const effBrushMin = Math.min(brushMin, brushMax);
    const effBrushMax = Math.max(brushMin + 1, brushMax);

    // Flatten resolved values into a working param object for pass helpers
    const wp = {
      ...p,
      brushMin: effBrushMin, brushMax: effBrushMax,
      minOpacity, maxOpacity,
      iterations: iters,
      passCount: Math.max(1, Math.round(passCount)),
      brushHardness, brushLength, brushJitter, paletteBlend, colourJitter,
      coverageTarget, errorThreshold,
      edgeInfluence, contrastInfluence, luminanceInfluence,
      manualAngle, strokeAngleJitter,
    };

    // ── Stage 1: Source analysis ──────────────────────────────────────────────
    const lum  = _luma(src, n);
    const grad = _sobelGrad(lum, w, h);
    const edgeMap = _edgeMap(grad.mag, n);

    // ── Working canvas ────────────────────────────────────────────────────────
    const buf = new Uint8ClampedArray(w * h * 4);
    for (let i = 3; i < buf.length; i += 4) buf[i] = 255;

    // ── Stage 4: Initial error map ────────────────────────────────────────────
    const errorMap = _errorMap(src, buf, n);

    // ── DOT mode — preserved original logic with bounded snapshots ────────────
    if (wp.painterMode === 'DOT') {
      const palette = _buildPalette(src, w, h, wp.paletteMode.toLowerCase(), rng);
      const layers = new Float32Array(n);
      const totalPixels = n;
      let totalStrokes = 0;

      const MAX_SNAPSHOTS = 20;
      const snapInterval = Math.max(250, Math.ceil(iters / MAX_SNAPSHOTS));
      let lastSnap = new Uint8ClampedArray(buf);

      for (let iter = 0; iter < iters; iter++) {
        const avgBrushR = (effBrushMin + effBrushMax) / 4;
        if ((totalStrokes * Math.PI * avgBrushR * avgBrushR) / totalPixels >= wp.maxLayers) break;
        const x = rng.nextInt(0, w), y = rng.nextInt(0, h);
        if (layers[y * w + x] > wp.maxLayers * 1.3) continue;
        const si = (y * w + x) * 4;
        const tr = src[si], tg = src[si + 1], tb = src[si + 2];
        const cr = buf[si], cg = buf[si + 1], cb = buf[si + 2];
        const alphaNorm = ((minOpacity + maxOpacity) / 2) / 255;
        let bestColor = null, bestDist = Infinity;
        for (const pc of palette) {
          const sr = cr + (pc[0] - cr) * alphaNorm;
          const sg = cg + (pc[1] - cg) * alphaNorm;
          const sb = cb + (pc[2] - cb) * alphaNorm;
          const d = (sr - tr) ** 2 + (sg - tg) ** 2 + (sb - tb) ** 2;
          if (d < bestDist) { bestDist = d; bestColor = pc; }
        }
        if (!bestColor) continue;
        const opacity = rng.nextRange(minOpacity, maxOpacity);
        const size    = rng.nextRange(effBrushMin, effBrushMax);
        const radius  = Math.max(1, Math.round(size / 2));
        const color   = [bestColor[0], bestColor[1], bestColor[2], opacity];
        const rr = radius * radius;
        for (let oy = -radius; oy <= radius; oy++) {
          for (let ox = -radius; ox <= radius; ox++) {
            const d2 = ox * ox + oy * oy;
            if (d2 > rr) continue;
            const bx = x + ox, by = y + oy;
            if (bx < 0 || by < 0 || bx >= w || by >= h) continue;
            const td = Math.sqrt(d2) / radius;
            const hard = brushHardness;
            const alpha = (opacity / 255) * (td <= hard ? 1 : Math.max(0, 1 - (td - hard) / (1 - hard + 1e-6)));
            const inv = 1 - alpha;
            const j = (by * w + bx) * 4;
            buf[j]     = buf[j]     * inv + color[0] * alpha;
            buf[j + 1] = buf[j + 1] * inv + color[1] * alpha;
            buf[j + 2] = buf[j + 2] * inv + color[2] * alpha;
            buf[j + 3] = Math.min(255, buf[j + 3] + 255 * alpha);
          }
        }
        const lr = Math.floor(size / 4);
        for (let py = Math.max(0, y - lr); py < Math.min(h, y + lr); py++)
          for (let px = Math.max(0, x - lr); px < Math.min(w, x + lr); px++) layers[py * w + px]++;
        totalStrokes++;

        // Bounded snapshots — at most MAX_SNAPSHOTS clones regardless of iters
        if ((iter + 1) % snapInterval === 0) {
          lastSnap = new Uint8ClampedArray(buf);
        }
      }

      dst.set(lastSnap);
      return;
    }

    // ── STROKE / FLOW STROKE / PATCH / PALETTE RECONSTRUCTION modes ───────────
    // Stage 5: Multi-pass coarse-to-fine reconstruction
    const numPasses = wp.passCount;
    for (let pass = 0; pass < numPasses; pass++) {
      _runPass(buf, src, w, h, n, rng, wp, pass, numPasses, grad.mag, grad.ang, edgeMap, lum, errorMap);
    }

    dst.set(buf);
  }
});
