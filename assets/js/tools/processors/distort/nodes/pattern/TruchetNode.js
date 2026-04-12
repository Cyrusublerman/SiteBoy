import { createEffectModule } from '../../core/EffectModule.js';
import { truchetTileField2D } from '../../../../../shared/algorithms/patterns/pattern-generators.js';
import { wgsl, glsl, gpuBindings as _gpuBindings } from '../../shaders/truchet.shader.js';

// ── helpers ───────────────────────────────────────────────────────────────────

function _hashTile(i, j, seed) {
  let h = seed >>> 0;
  h = ((h ^ i) * 0x45d9f3b) >>> 0;
  h = ((h ^ j) * 0x45d9f3b) >>> 0;
  h = ((h >> 16) ^ h) >>> 0;
  return h;
}

function _blendOver(srcR, srcG, srcB, pr, pg, pb, pa, blendMode) {
  const sv = [srcR / 255, srcG / 255, srcB / 255];
  const pv = [pr / 255, pg / 255, pb / 255];
  const a  = pa / 255;
  const out = [0, 0, 0];
  for (let c = 0; c < 3; c++) {
    let b;
    if      (blendMode === 'multiply') b = sv[c] * pv[c];
    else if (blendMode === 'screen')   b = 1 - (1 - sv[c]) * (1 - pv[c]);
    else if (blendMode === 'overlay')  b = sv[c] < 0.5
      ? 2 * sv[c] * pv[c]
      : 1 - 2 * (1 - sv[c]) * (1 - pv[c]);
    else                               b = pv[c]; // replace
    out[c] = Math.round(Math.max(0, Math.min(1, sv[c] + (b - sv[c]) * a)) * 255);
  }
  return out;
}

// Bilinear sample with clamp-to-edge
function _bilerp(src, w, h, fx, fy) {
  const x0 = Math.max(0, Math.min(w - 1, Math.floor(fx)));
  const y0 = Math.max(0, Math.min(h - 1, Math.floor(fy)));
  const x1 = Math.min(w - 1, x0 + 1);
  const y1 = Math.min(h - 1, y0 + 1);
  const dx = fx - x0, dy = fy - y0;
  const w00 = (1 - dx) * (1 - dy), w10 = dx * (1 - dy);
  const w01 = (1 - dx) * dy,       w11 = dx * dy;
  const i00 = (y0 * w + x0) * 4, i10 = (y0 * w + x1) * 4;
  const i01 = (y1 * w + x0) * 4, i11 = (y1 * w + x1) * 4;
  return [
    src[i00]     * w00 + src[i10]     * w10 + src[i01]     * w01 + src[i11]     * w11,
    src[i00 + 1] * w00 + src[i10 + 1] * w10 + src[i01 + 1] * w01 + src[i11 + 1] * w11,
    src[i00 + 2] * w00 + src[i10 + 2] * w10 + src[i01 + 2] * w01 + src[i11 + 2] * w11,
    src[i00 + 3] * w00 + src[i10 + 3] * w10 + src[i01 + 3] * w01 + src[i11 + 3] * w11,
  ];
}

// Resolve orientation for a tile cell under given orientationMode
function _resolveOrientation(ti, tj, seed, mode, lum) {
  switch (mode) {
    case 'FIXED':   return 0;
    case 'CHECKER': return (ti + tj) & 1;
    case 'DRIVEN':  return lum < 0.5 ? 0 : 1;
    default:        return _hashTile(ti, tj, seed) & 1; // RANDOM
  }
}

// Cross SDF: two perpendicular bars — signed, negative inside either bar
function _crossSDF(lx, ly, ts, sw) {
  const hw = sw / 2;
  const barX = Math.max(Math.abs(lx - ts / 2) - ts / 2, 0) + Math.abs(ly - ts / 2) - hw;
  const barY = Math.max(Math.abs(ly - ts / 2) - ts / 2, 0) + Math.abs(lx - ts / 2) - hw;
  return Math.min(barX, barY);
}

// Filled tile: everything inside is "on"
function _filledSDF(lx, ly, ts) {
  void lx; void ly; void ts;
  return -1; // always inside
}

// Double arc: two arcs connecting midpoints of opposite edges
function _doubleArcSDF(lx, ly, ts, sw, state) {
  const r = ts / 2;
  // Arc 1: connects midpoint-top to midpoint-right
  // Arc 2: connects midpoint-bottom to midpoint-left
  let d1, d2;
  if (state === 0) {
    d1 = Math.abs(Math.sqrt((lx - 0)   * (lx - 0)   + (ly - 0)   * (ly - 0))   - r);
    d2 = Math.abs(Math.sqrt((lx - ts)  * (lx - ts)  + (ly - ts)  * (ly - ts))  - r);
  } else {
    d1 = Math.abs(Math.sqrt((lx - ts)  * (lx - ts)  + (ly - 0)   * (ly - 0))   - r);
    d2 = Math.abs(Math.sqrt((lx - 0)   * (lx - 0)   + (ly - ts)  * (ly - ts))  - r);
  }
  return Math.min(d1, d2) - sw / 2;
}

// Blob / filled-region: like arc but fills region between arcs
function _blobSDF(lx, ly, ts, sw, state) {
  // Use distance to arc centre minus r; negative inside the blob region
  const r = ts / 2;
  let d1, d2;
  if (state === 0) {
    d1 = Math.sqrt(lx * lx + ly * ly) - r;
    d2 = Math.sqrt((lx - ts) * (lx - ts) + (ly - ts) * (ly - ts)) - r;
  } else {
    d1 = Math.sqrt((lx - ts) * (lx - ts) + ly * ly) - r;
    d2 = Math.sqrt(lx * lx + (ly - ts) * (ly - ts)) - r;
  }
  return Math.min(d1, d2);
}

// Multi-line: four corner-to-midpoint lines as SDF
function _multiLineSDF(lx, ly, ts, sw) {
  const hw = sw / 2;
  const cx = ts / 2, cy = ts / 2;
  // lines from centre to each edge midpoint
  const endpoints = [[cx, 0], [ts, cy], [cx, ts], [0, cy]];
  let minD = Infinity;
  for (const [ex, ey] of endpoints) {
    const ax = ex - cx, ay = ey - cy;
    const bx = lx - cx, by = ly - cy;
    const t = Math.max(0, Math.min(1, (bx * ax + by * ay) / (ax * ax + ay * ay)));
    const fx = bx - t * ax, fy = by - t * ay;
    minD = Math.min(minD, Math.sqrt(fx * fx + fy * fy));
  }
  return minD - hw;
}

// Dispatch per-motif SDF (state = 0|1 for arc-based motifs)
function _motifSDF(lx, ly, ts, sw, motif, state) {
  switch (motif) {
    case 'DOUBLE ARC':  return _doubleArcSDF(lx, ly, ts, sw, state);
    case 'CROSS':       return _crossSDF(lx, ly, ts, sw);
    case 'BLOB':        return _blobSDF(lx, ly, ts, sw, state);
    case 'MULTI-LINE':  return _multiLineSDF(lx, ly, ts, sw);
    case 'FILLED':      return _filledSDF(lx, ly, ts);
    default: { // QUARTER ARC — canonical truchet
      const r = ts / 2;
      let d1, d2;
      if (state === 0) {
        d1 = Math.abs(Math.sqrt(lx * lx + ly * ly) - r);
        d2 = Math.abs(Math.sqrt((lx - ts) * (lx - ts) + (ly - ts) * (ly - ts)) - r);
      } else {
        d1 = Math.abs(Math.sqrt((lx - ts) * (lx - ts) + ly * ly) - r);
        d2 = Math.abs(Math.sqrt(lx * lx + (ly - ts) * (ly - ts)) - r);
      }
      return Math.min(d1, d2) - sw / 2;
    }
  }
}

/** internalBlend: tile overlay compositing (not the stack blendMode). */
export const TruchetNode = createEffectModule({
  type: 'truchet',
  name: 'TRUCHET',
  category: 'PATTERN',
  params: {
    // ── Layer 1: Pattern Generation ──────────────────────────────────────────
    tileSize:       { label: 'TILE SIZE',    min: 5,   max: 100,  step: 1,    value: 20,  tier: 3, previewMax: 40, unit: 'px',  driveable: true },
    strokeWidth:    { label: 'STROKE W',     min: 0.5, max: 15,   step: 0.5,  value: 3,   tier: 3, previewMax: 8,  unit: 'px',  driveable: true },
    tileMotif:      { label: 'TILE MOTIF',   type: 'select', options: ['QUARTER ARC', 'DOUBLE ARC', 'CROSS', 'BLOB', 'MULTI-LINE', 'FILLED'], value: 'QUARTER ARC', tier: 3 },
    orientationMode:{ label: 'ORIENT MODE',  type: 'select', options: ['RANDOM', 'FIXED', 'CHECKER', 'DRIVEN'], value: 'RANDOM', tier: 3 },
    seed:           { label: 'SEED',         min: 0,   max: 9999, step: 1,    value: 0,   tier: 3, unit: 'n',   driveable: true },
    gridOffsetX:    { label: 'OFFSET X',     min: -100,max: 100,  step: 1,    value: 0,   tier: 4, unit: 'px',  driveable: true },
    gridOffsetY:    { label: 'OFFSET Y',     min: -100,max: 100,  step: 1,    value: 0,   tier: 4, unit: 'px',  driveable: true },
    rotation:       { label: 'ROTATION',     min: 0,   max: 360,  step: 1,    value: 0,   tier: 4, unit: '°',   driveable: true },

    // ── Layer 4: Rendering ────────────────────────────────────────────────────
    internalBlend:  { label: 'BLEND',        type: 'select', options: ['MULTIPLY', 'SCREEN', 'OVERLAY', 'REPLACE'], value: 'MULTIPLY', tier: 4 },
    patternOpacity: { label: 'PATTERN OPQ',  min: 0,   max: 1,    step: 0.01, value: 1,   tier: 4, unit: '0–1', driveable: true },
    strokeR:        { label: 'STROKE R',     min: 0,   max: 255,  step: 1,    value: 0,   tier: 4, unit: 'lvl', driveable: true },
    strokeG:        { label: 'STROKE G',     min: 0,   max: 255,  step: 1,    value: 0,   tier: 4, unit: 'lvl', driveable: true },
    strokeB:        { label: 'STROKE B',     min: 0,   max: 255,  step: 1,    value: 0,   tier: 4, unit: 'lvl', driveable: true },
    antiAlias:      { label: 'ANTI-ALIAS',   type: 'toggle', value: true, tier: 4 },

    // ── Layer 5: Image Modification ───────────────────────────────────────────
    modificationMode: { label: 'MOD MODE',   type: 'select', options: ['NONE', 'STROKE MASK', 'REGION MASK', 'DISTANCE FIELD', 'DISPLACEMENT'], value: 'NONE', tier: 5 },
    insideStrength:   { label: 'INSIDE STR', min: -1,  max: 1,    step: 0.01, value: 0.3, tier: 5, unit: '0–1', driveable: true, when: { modificationMode: ['STROKE MASK', 'REGION MASK'] } },
    outsideStrength:  { label: 'OUTSIDE STR',min: -1,  max: 1,    step: 0.01, value: 0,   tier: 5, unit: '0–1', driveable: true, when: { modificationMode: ['STROKE MASK', 'REGION MASK'] } },
    maskFeather:      { label: 'MASK FEATHER',min: 0,  max: 20,   step: 0.5,  value: 2,   tier: 5, unit: 'px',  driveable: true, when: { modificationMode: ['STROKE MASK', 'REGION MASK'] } },
    displacementStrength: { label: 'DISPLACE STR',  min: 0, max: 50,  step: 0.5,  value: 10, tier: 5, unit: 'px',  driveable: true, when: { modificationMode: 'DISPLACEMENT' } },
    displacementRadius:   { label: 'DISPLACE RAD',  min: 0, max: 100, step: 1,    value: 20, tier: 5, unit: 'px',  driveable: true, when: { modificationMode: 'DISPLACEMENT' } },
    colourShiftStrength:  { label: 'COLOUR SHIFT',  min: 0, max: 1,   step: 0.01, value: 0,  tier: 5, unit: '0–1', driveable: true, when: { modificationMode: 'DISTANCE FIELD' } },
    blurStrength:         { label: 'BLUR STR',       min: 0, max: 20,  step: 0.5,  value: 0,  tier: 5, unit: 'px',  driveable: true, when: { modificationMode: 'DISTANCE FIELD' } },
    sharpenStrength:      { label: 'SHARPEN STR',    min: 0, max: 5,   step: 0.1,  value: 0,  tier: 5, unit: 'n',   driveable: true, when: { modificationMode: 'DISTANCE FIELD' } },
    orientationATreatment:{ label: 'ORIENT A',       type: 'select', options: ['NONE', 'LIGHTEN', 'DARKEN', 'DESATURATE', 'TINT'], value: 'NONE', tier: 5, when: { modificationMode: 'REGION MASK' } },
    orientationBTreatment:{ label: 'ORIENT B',       type: 'select', options: ['NONE', 'LIGHTEN', 'DARKEN', 'DESATURATE', 'TINT'], value: 'NONE', tier: 5, when: { modificationMode: 'REGION MASK' } }
  },

  apply(src, dst, w, h, p, ctx, modulate) {
    const baseSeed = ((p.seed ?? 0) + (ctx?.nodeSeed ?? 0)) >>> 0;
    const motif    = p.tileMotif      ?? 'QUARTER ARC';
    const oriMode  = p.orientationMode ?? 'RANDOM';
    const modMode  = p.modificationMode ?? 'NONE';
    const blend    = (p.internalBlend ?? 'MULTIPLY').toLowerCase();
    const cosR     = Math.cos(((p.rotation ?? 0) * Math.PI) / 180);
    const sinR     = Math.sin(((p.rotation ?? 0) * Math.PI) / 180);
    const cx       = w / 2, cy = h / 2;

    // Pre-derive image luminance field for DRIVEN orientation (tile-centre sampling)
    // Built lazily into a cached tile-grid to avoid per-pixel cost.
    let orientationGrid = null;
    if (oriMode === 'DRIVEN') {
      const ts      = Math.max(5, p.tileSize);
      const offX    = p.gridOffsetX ?? 0;
      const offY    = p.gridOffsetY ?? 0;
      const cols    = Math.ceil(w / ts) + 2;
      const rows    = Math.ceil(h / ts) + 2;
      orientationGrid = new Uint8Array(cols * rows);
      for (let tj = 0; tj < rows; tj++) {
        for (let ti = 0; ti < cols; ti++) {
          const tcx = ti * ts - offX + ts / 2;
          const tcy = tj * ts - offY + ts / 2;
          const sx  = Math.max(0, Math.min(w - 1, Math.round(tcx))) | 0;
          const sy  = Math.max(0, Math.min(h - 1, Math.round(tcy))) | 0;
          const bi  = (sy * w + sx) * 4;
          const lum = (0.299 * src[bi] + 0.587 * src[bi + 1] + 0.114 * src[bi + 2]) / 255;
          orientationGrid[tj * cols + ti] = lum < 0.5 ? 0 : 1;
        }
      }
    }

    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const pixelIdx = py * w + px;
        const base     = pixelIdx * 4;

        const tileSize   = modulate('tileSize',   pixelIdx);
        const strokeW    = modulate('strokeWidth', pixelIdx);
        const offX       = modulate('gridOffsetX', pixelIdx);
        const offY       = modulate('gridOffsetY', pixelIdx);
        const opacity    = modulate('patternOpacity', pixelIdx);
        const rot        = modulate('rotation',   pixelIdx);
        const pr         = modulate('strokeR',    pixelIdx);
        const pg         = modulate('strokeG',    pixelIdx);
        const pb         = modulate('strokeB',    pixelIdx);

        const ts = Math.max(5, tileSize);

        // Rotate pixel around canvas centre
        const rdx  = px - cx, rdy = py - cy;
        const cosRi = rot === (p.rotation ?? 0) ? cosR : Math.cos((rot * Math.PI) / 180);
        const sinRi = rot === (p.rotation ?? 0) ? sinR : Math.sin((rot * Math.PI) / 180);
        const rx   = cosRi * rdx - sinRi * rdy + cx + offX;
        const ry   = sinRi * rdx + cosRi * rdy + cy + offY;

        const ti   = Math.floor(rx / ts);
        const tj   = Math.floor(ry / ts);
        const lx   = rx - ti * ts;
        const ly   = ry - tj * ts;

        // Resolve tile orientation
        let state;
        if (oriMode === 'DRIVEN' && orientationGrid) {
          const tcols = Math.ceil(w / ts) + 2;
          const tig   = Math.max(0, Math.min(tcols - 1, ti));
          const tjg   = Math.max(0, Math.min(Math.ceil(h / ts) + 1, tj));
          state       = orientationGrid[tjg * tcols + tig];
        } else {
          const lum = 0; // unused for non-driven modes
          state = _resolveOrientation(ti, tj, baseSeed, oriMode, lum);
        }

        // Compute motif SDF
        const dist  = _motifSDF(lx, ly, ts, strokeW, motif, state);
        const onStroke = p.antiAlias
          ? Math.max(0, Math.min(1, -dist + 0.5))   // smoothstep over 1px
          : (dist < 0 ? 1 : 0);

        const srcR = src[base], srcG = src[base + 1], srcB = src[base + 2], srcA = src[base + 3];

        // ── Layer 5: Image Modification ───────────────────────────────────────
        if (modMode !== 'NONE') {
          let modR = srcR, modG = srcG, modB = srcB;

          if (modMode === 'STROKE MASK' || modMode === 'REGION MASK') {
            const inStr  = modulate('insideStrength',  pixelIdx);
            const outStr = modulate('outsideStrength', pixelIdx);
            const feather = modulate('maskFeather',    pixelIdx);
            const soft = feather > 0
              ? Math.max(0, Math.min(1, (-dist + feather) / (2 * feather)))
              : onStroke;
            const str  = soft * inStr + (1 - soft) * outStr;
            const lumMod = str * 128;
            modR = Math.max(0, Math.min(255, srcR + lumMod));
            modG = Math.max(0, Math.min(255, srcG + lumMod));
            modB = Math.max(0, Math.min(255, srcB + lumMod));

            if (modMode === 'REGION MASK') {
              const treatment = state === 0 ? p.orientationATreatment : p.orientationBTreatment;
              if (treatment === 'LIGHTEN') {
                modR = Math.min(255, modR + 40 * soft);
                modG = Math.min(255, modG + 40 * soft);
                modB = Math.min(255, modB + 40 * soft);
              } else if (treatment === 'DARKEN') {
                modR = Math.max(0, modR - 40 * soft);
                modG = Math.max(0, modG - 40 * soft);
                modB = Math.max(0, modB - 40 * soft);
              } else if (treatment === 'DESATURATE') {
                const grey = 0.299 * modR + 0.587 * modG + 0.114 * modB;
                modR = modR + (grey - modR) * soft;
                modG = modG + (grey - modG) * soft;
                modB = modB + (grey - modB) * soft;
              } else if (treatment === 'TINT') {
                modR = modR + (pr - modR) * soft * 0.5;
                modG = modG + (pg - modG) * soft * 0.5;
                modB = modB + (pb - modB) * soft * 0.5;
              }
            }

          } else if (modMode === 'DISTANCE FIELD') {
            // Normalise distStroke to [0,1] over a reference distance of ts
            const normDist = Math.max(0, Math.min(1, Math.abs(dist) / ts));
            const colShift = modulate('colourShiftStrength', pixelIdx);
            const blurStr  = modulate('blurStrength', pixelIdx);
            const shrpStr  = modulate('sharpenStrength', pixelIdx);

            // Colour shift: push hue toward stroke colour proportional to proximity
            modR = srcR + (pr - srcR) * colShift * (1 - normDist);
            modG = srcG + (pg - srcG) * colShift * (1 - normDist);
            modB = srcB + (pb - srcB) * colShift * (1 - normDist);

            // Box-blur approximation: sample a neighbourhood of radius blurStr
            if (blurStr > 0) {
              const rad = Math.round(blurStr * (1 - normDist));
              if (rad > 0) {
                let sr = 0, sg = 0, sb = 0, cnt = 0;
                for (let dy = -rad; dy <= rad; dy++) {
                  for (let dx = -rad; dx <= rad; dx++) {
                    const sx = Math.max(0, Math.min(w - 1, px + dx));
                    const sy = Math.max(0, Math.min(h - 1, py + dy));
                    const bi = (sy * w + sx) * 4;
                    sr += src[bi]; sg += src[bi + 1]; sb += src[bi + 2]; cnt++;
                  }
                }
                const inv = 1 / cnt;
                modR = modR + (sr * inv - modR) * Math.max(0, Math.min(1, blurStr / 10));
                modG = modG + (sg * inv - modG) * Math.max(0, Math.min(1, blurStr / 10));
                modB = modB + (sb * inv - modB) * Math.max(0, Math.min(1, blurStr / 10));
              }
            }

            // Unsharp mask approximation
            if (shrpStr > 0) {
              const grey = 0.299 * srcR + 0.587 * srcG + 0.114 * srcB;
              modR = Math.max(0, Math.min(255, modR + (modR - grey) * shrpStr * (1 - normDist)));
              modG = Math.max(0, Math.min(255, modG + (modG - grey) * shrpStr * (1 - normDist)));
              modB = Math.max(0, Math.min(255, modB + (modB - grey) * shrpStr * (1 - normDist)));
            }

          } else if (modMode === 'DISPLACEMENT') {
            const dispStr = modulate('displacementStrength', pixelIdx);
            const dispRad = modulate('displacementRadius',   pixelIdx);
            // Compute SDF gradient normal via truchetTileField2D for accuracy
            const field  = truchetTileField2D(rx, ry, ts, baseSeed, 'arcs', strokeW);
            const falloff = dispRad > 0
              ? Math.max(0, 1 - Math.abs(field.distStroke) / dispRad)
              : 1;
            const fx = px + field.normal.x * dispStr * falloff;
            const fy = py + field.normal.y * dispStr * falloff;
            const sampled = _bilerp(src, w, h, fx, fy);
            modR = sampled[0]; modG = sampled[1]; modB = sampled[2];
          }

          dst[base]     = modR;
          dst[base + 1] = modG;
          dst[base + 2] = modB;
          dst[base + 3] = srcA;

          // Layer 4 overlay on top of modified image
          if (onStroke > 0) {
            const blended = _blendOver(dst[base], dst[base + 1], dst[base + 2], pr, pg, pb, Math.round(onStroke * opacity * 255), blend);
            dst[base]     = blended[0];
            dst[base + 1] = blended[1];
            dst[base + 2] = blended[2];
          }

        } else {
          // ── Layer 4: Render only ────────────────────────────────────────────
          if (onStroke > 0) {
            const blended = _blendOver(srcR, srcG, srcB, pr, pg, pb, Math.round(onStroke * opacity * 255), blend);
            dst[base]     = blended[0];
            dst[base + 1] = blended[1];
            dst[base + 2] = blended[2];
            dst[base + 3] = srcA;
          } else {
            dst[base]     = srcR;
            dst[base + 1] = srcG;
            dst[base + 2] = srcB;
            dst[base + 3] = srcA;
          }
        }
      }
    }
  },
  wgsl,
  glsl,
  gpuBindings: _gpuBindings,
});
