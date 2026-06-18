import { createEffectModule } from '../../core/EffectModule.js';
import { capByFrame } from '../../core/frameCap.js';

// ── Constants ─────────────────────────────────────────────────────────────────

const TWO_PI = Math.PI * 2;
// CFL-stable maximum speed for the finite-difference wave equation on a unit grid.
// c*dt/dx ≤ 1/sqrt(2) ≈ 0.707 for 2D; clamp at build time.
const CFL_MAX = 0.707;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Bilinear sample from src RGBA at (fx, fy) into dst at byte index i. */
function _bilinear(src, w, h, fx, fy, dst, i) {
  const x0 = fx | 0, y0 = fy | 0;
  const dx = fx - x0, dy = fy - y0;
  const cx0 = x0 < 0 ? 0 : x0 >= w ? w - 1 : x0;
  const cx1 = x0 + 1 >= w ? w - 1 : x0 + 1 < 0 ? 0 : x0 + 1;
  const cy0 = y0 < 0 ? 0 : y0 >= h ? h - 1 : y0;
  const cy1 = y0 + 1 >= h ? h - 1 : y0 + 1 < 0 ? 0 : y0 + 1;
  const i00 = (cy0 * w + cx0) * 4, i10 = (cy0 * w + cx1) * 4;
  const i01 = (cy1 * w + cx0) * 4, i11 = (cy1 * w + cx1) * 4;
  const idx = 1 - dx, idy = 1 - dy;
  const w00 = idx * idy, w10 = dx * idy, w01 = idx * dy, w11 = dx * dy;
  dst[i]     = src[i00] * w00 + src[i10] * w10 + src[i01] * w01 + src[i11] * w11;
  dst[i + 1] = src[i00 + 1] * w00 + src[i10 + 1] * w10 + src[i01 + 1] * w01 + src[i11 + 1] * w11;
  dst[i + 2] = src[i00 + 2] * w00 + src[i10 + 2] * w10 + src[i01 + 2] * w01 + src[i11 + 2] * w11;
  dst[i + 3] = src[i00 + 3] * w00 + src[i10 + 3] * w10 + src[i01 + 3] * w01 + src[i11 + 3] * w11;
}

/** Nearest-neighbour sample from src RGBA at (fx, fy) into dst at byte index i. */
function _nearest(src, w, h, fx, fy, dst, i) {
  const cx = Math.max(0, Math.min(w - 1, Math.round(fx)));
  const cy = Math.max(0, Math.min(h - 1, Math.round(fy)));
  const si = (cy * w + cx) * 4;
  dst[i] = src[si]; dst[i + 1] = src[si + 1]; dst[i + 2] = src[si + 2]; dst[i + 3] = src[si + 3];
}

/**
 * Evaluate waveform for given phase [0,1).
 * @param {string} waveType - SINE|SQUARE|SAWTOOTH|TRIANGLE|NOISE
 * @param {number} phase    - normalised [0,1)
 * @param {number} noiseVal - pre-sampled noise value [-1,1] for NOISE type
 */
function _waveform(waveType, phase, noiseVal) {
  switch (waveType) {
    case 'SQUARE':   return phase < 0.5 ? 1 : -1;
    case 'SAWTOOTH': return 2 * phase - 1;
    case 'TRIANGLE': return phase < 0.5 ? 4 * phase - 1 : 3 - 4 * phase;
    case 'NOISE':    return noiseVal;
    case 'SINE':
    default:         return Math.sin(TWO_PI * phase);
  }
}

/**
 * Cheap smooth noise via hash — avoids any external dependency.
 * Returns value in [-1, 1].
 */
function _hash(n) {
  let x = Math.sin(n) * 43758.5453123;
  return x - Math.floor(x);
}

function _smoothNoise2(x, y, scale) {
  const xs = x * scale, ys = y * scale;
  const ix = Math.floor(xs), iy = Math.floor(ys);
  const fx = xs - ix, fy = ys - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = _hash(ix + iy * 57.0);
  const b = _hash(ix + 1 + iy * 57.0);
  const c = _hash(ix + (iy + 1) * 57.0);
  const d = _hash(ix + 1 + (iy + 1) * 57.0);
  return 2 * (a + ux * (b - a) + uy * (c - a) + ux * uy * (a - b - c + d)) - 1;
}

/** Multi-octave noise in [-1,1]. */
function _fbm(x, y, scale, octaves) {
  let v = 0, amp = 0.5, freq = 1;
  for (let o = 0; o < octaves; o++) {
    v += amp * _smoothNoise2(x, y, scale * freq);
    amp *= 0.5;
    freq *= 2;
  }
  return Math.max(-1, Math.min(1, v * 1.5));
}

// ── Seed initialisers for the stateful solver ─────────────────────────────────

/**
 * Build initial `cur` and `prev` Float32Array fields for the 2D wave solver.
 * @param {Uint8ClampedArray} src  - source RGBA
 * @param {number} w
 * @param {number} h
 * @param {string} initType        - GAUSSIAN|RIPPLE|FLAT|IMAGE|EDGE
 * @param {number} initAmplitude   - [0,1]
 * @param {number} initRadius      - [0.01, 0.5] fraction of min(w,h)
 * @param {number} seedThreshold   - [0,1]
 * @param {string} seedSource      - LUMINANCE|RED|GREEN|BLUE|SATURATION|EDGE
 */
function _initFields(src, w, h, initType, initAmplitude, initRadius, seedThreshold, seedSource) {
  const n = w * h;
  const cur  = new Float32Array(n);
  const prev = new Float32Array(n);
  const cx = w * 0.5, cy = h * 0.5;
  const rPx = initRadius * Math.min(w, h);

  switch (initType) {
    case 'RIPPLE': {
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        const v = initAmplitude * Math.cos(d / rPx * Math.PI) * Math.exp(-d / (2 * rPx));
        cur[y * w + x] = prev[y * w + x] = v;
      }
      break;
    }
    case 'FLAT': {
      // All zeros — field starts quiet, emitters or forcing drive it.
      break;
    }
    case 'IMAGE': {
      for (let i = 0; i < n; i++) {
        const j = i * 4;
        const r = src[j] / 255, g = src[j + 1] / 255, b = src[j + 2] / 255;
        let v = 0;
        switch (seedSource) {
          case 'RED':        v = r; break;
          case 'GREEN':      v = g; break;
          case 'BLUE':       v = b; break;
          case 'SATURATION': { const mx = Math.max(r, g, b), mn = Math.min(r, g, b); v = mx > 0 ? (mx - mn) / mx : 0; break; }
          case 'LUMINANCE':
          default:           v = r * 0.299 + g * 0.587 + b * 0.114;
        }
        if (v >= seedThreshold) {
          cur[i] = prev[i] = initAmplitude * (v - seedThreshold) / Math.max(0.001, 1 - seedThreshold);
        }
      }
      break;
    }
    case 'EDGE': {
      // Sobel magnitude as seed.
      for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
        const lum = (j) => src[j] * 0.299 + src[j + 1] * 0.587 + src[j + 2] * 0.114;
        const i = y * w + x;
        const tl = lum((i - w - 1) * 4), tc = lum((i - w) * 4), tr = lum((i - w + 1) * 4);
        const ml = lum((i - 1) * 4),                              mr = lum((i + 1) * 4);
        const bl = lum((i + w - 1) * 4), bc = lum((i + w) * 4), br = lum((i + w + 1) * 4);
        const gx = (tr + 2 * mr + br - tl - 2 * ml - bl) / (4 * 255);
        const gy = (bl + 2 * bc + br - tl - 2 * tc - tr) / (4 * 255);
        const mag = Math.sqrt(gx * gx + gy * gy);
        if (mag >= seedThreshold) cur[i] = prev[i] = initAmplitude * Math.min(1, mag);
      }
      break;
    }
    case 'GAUSSIAN':
    default: {
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const dx = x - cx, dy = y - cy;
        const v = initAmplitude * Math.exp(-(dx * dx + dy * dy) / (2 * rPx * rPx));
        cur[y * w + x] = prev[y * w + x] = v;
      }
      break;
    }
  }

  return { cur, prev };
}

// ── 2D finite-difference solver (single step) ─────────────────────────────────

/**
 * Advance `cur`/`prev` one step. Writes result into `next` then swaps.
 * Modifies arrays in-place. Returns { cur, prev } after swap.
 * speed is clamped to CFL_MAX before squaring.
 *
 * @param {Float32Array} cur
 * @param {Float32Array} prev
 * @param {Float32Array} next  - scratch buffer, same length
 * @param {number} w
 * @param {number} h
 * @param {number} speed       - wave speed ≤ CFL_MAX
 * @param {number} damping     - per-step amplitude factor [0,1]
 * @param {string} boundaryMode - CLAMP|REFLECT|WRAP|ABSORB
 * @param {number} dispersion  - [0,1] — blends in a Laplacian-of-Laplacian term for frequency-dependent spread
 * @param {number} viscosity   - [0,1] — adds a first-derivative damping (velocity drag)
 */
function _stepWave2D(cur, prev, next, w, h, speed, damping, boundaryMode, dispersion, viscosity) {
  const c2 = speed * speed;
  const n = w * h;

  // Interior stencil
  for (let y = 1; y < h - 1; y++) {
    const row = y * w;
    for (let x = 1; x < w - 1; x++) {
      const i = row + x;
      const lap = cur[i - 1] + cur[i + 1] + cur[i - w] + cur[i + w] - 4 * cur[i];

      // Optional dispersion: biharmonic (Laplacian^2) term — uses nearest-corner approximation.
      let dispTerm = 0;
      if (dispersion > 0) {
        // 9-point cross approximation for biharmonic
        const lap2 = (
          cur[i - 2] + cur[i + 2] + cur[i - 2 * w] + cur[i + 2 * w]
          - 4 * (cur[i - 1] + cur[i + 1] + cur[i - w] + cur[i + w])
          + 12 * cur[i]
        );
        dispTerm = dispersion * 0.01 * lap2;
      }

      const vel = cur[i] - prev[i];
      const viscDamp = 1 - viscosity * 0.1;
      next[i] = damping * (2 * cur[i] - prev[i] + c2 * lap - dispTerm + viscDamp * vel - vel);
    }
  }

  // Boundary conditions
  switch (boundaryMode) {
    case 'REFLECT': {
      for (let x = 0; x < w; x++) { next[x] = next[w + x]; next[(h - 1) * w + x] = next[(h - 2) * w + x]; }
      for (let y = 0; y < h; y++) { next[y * w] = next[y * w + 1]; next[y * w + w - 1] = next[y * w + w - 2]; }
      break;
    }
    case 'WRAP': {
      for (let x = 0; x < w; x++) {
        const lap0 = cur[(h - 1) * w + x] + cur[w + x] + (x > 0 ? cur[x - 1] : cur[w - 1]) + (x < w - 1 ? cur[x + 1] : cur[0]) - 4 * cur[x];
        next[x] = damping * (2 * cur[x] - prev[x] + c2 * lap0);
        next[(h - 1) * w + x] = next[x];
      }
      for (let y = 0; y < h; y++) {
        const lap0 = (y > 0 ? cur[(y - 1) * w] : cur[(h - 1) * w]) + (y < h - 1 ? cur[(y + 1) * w] : cur[0]) + cur[y * w + w - 1] + cur[y * w + 1] - 4 * cur[y * w];
        next[y * w] = damping * (2 * cur[y * w] - prev[y * w] + c2 * lap0);
        next[y * w + w - 1] = next[y * w];
      }
      break;
    }
    case 'ABSORB': {
      for (let x = 0; x < w; x++) { next[x] = 0; next[(h - 1) * w + x] = 0; }
      for (let y = 0; y < h; y++) { next[y * w] = 0; next[y * w + w - 1] = 0; }
      break;
    }
    case 'CLAMP':
    default: {
      for (let x = 0; x < w; x++) { next[x] = cur[x]; next[(h - 1) * w + x] = cur[(h - 1) * w + x]; }
      for (let y = 0; y < h; y++) { next[y * w] = cur[y * w]; next[y * w + w - 1] = cur[y * w + w - 1]; }
      break;
    }
  }

  // Swap buffers: caller's cur becomes prev; next becomes cur
  return { cur: next, prev: cur };
}

// ── Emitter injection ─────────────────────────────────────────────────────────

/**
 * Inject emitter impulses into the wave field.
 * Emitter positions are expressed as normalised [0,1] pairs.
 */
function _injectEmitters(cur, w, h, emitterCount, emitterMode, frame,
                          emitterFreq, emitterPhase, emitterAmplitude, emitterRadius) {
  const rPx = emitterRadius * Math.min(w, h);
  const r2 = rPx * rPx;
  const omega = TWO_PI * emitterFreq;
  const emitters = _resolveEmitterPositions(emitterCount, emitterMode, w, h);

  for (let e = 0; e < emitters.length; e++) {
    const [ecx, ecy] = emitters[e];
    const phase = emitterPhase + e * (TWO_PI / Math.max(1, emitters.length));
    const amp = emitterAmplitude * Math.sin(omega * frame + phase);
    if (Math.abs(amp) < 1e-6) continue;

    const x0 = Math.max(0, (ecx - rPx) | 0), x1 = Math.min(w - 1, (ecx + rPx) | 0);
    const y0 = Math.max(0, (ecy - rPx) | 0), y1 = Math.min(h - 1, (ecy + rPx) | 0);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const d2 = (x - ecx) ** 2 + (y - ecy) ** 2;
      if (d2 > r2) continue;
      cur[y * w + x] += amp * Math.exp(-d2 / r2);
    }
  }
}

/** Resolve emitter pixel positions for the given mode. */
function _resolveEmitterPositions(count, mode, w, h) {
  const positions = [];
  const n = Math.max(1, count | 0);
  switch (mode) {
    case 'GRID': {
      const cols = Math.ceil(Math.sqrt(n)), rows = Math.ceil(n / cols);
      for (let r = 0; r < rows && positions.length < n; r++)
        for (let c = 0; c < cols && positions.length < n; c++)
          positions.push([(c + 0.5) / cols * w, (r + 0.5) / rows * h]);
      break;
    }
    case 'RADIAL': {
      for (let e = 0; e < n; e++) {
        const angle = (e / n) * TWO_PI;
        positions.push([w * 0.5 + Math.cos(angle) * w * 0.3, h * 0.5 + Math.sin(angle) * h * 0.3]);
      }
      break;
    }
    case 'RANDOM': {
      // Deterministic pseudo-random positions so they don't reseed every frame.
      for (let e = 0; e < n; e++) {
        positions.push([(_hash(e * 17.3 + 1.1) * w) | 0, (_hash(e * 31.7 + 5.3) * h) | 0]);
      }
      break;
    }
    case 'MANUAL':
    default: {
      // Default: evenly spaced along horizontal centre line.
      for (let e = 0; e < n; e++) {
        positions.push([(e + 1) / (n + 1) * w, h * 0.5]);
      }
      break;
    }
  }
  return positions;
}

// ── Slope / velocity field derivation ─────────────────────────────────────────

/**
 * Derive a signed scalar field according to outputMode.
 * Returns Float32Array of length n in normalised range (before contrast/gain).
 */
function _deriveOutputField(cur, prev, w, h, outputMode) {
  const n = w * h;
  const field = new Float32Array(n);
  switch (outputMode) {
    case 'VELOCITY': {
      for (let i = 0; i < n; i++) field[i] = cur[i] - prev[i];
      break;
    }
    case 'GRADIENT': {
      for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        const gx = (cur[i + 1] - cur[i - 1]) * 0.5;
        const gy = (cur[i + w] - cur[i - w]) * 0.5;
        field[i] = Math.sqrt(gx * gx + gy * gy);
      }
      break;
    }
    case 'INTERFERENCE': {
      // Zero-crossing density: high where |height| is low but velocity is high.
      for (let i = 0; i < n; i++) {
        const vel = Math.abs(cur[i] - prev[i]);
        field[i] = (1 - Math.abs(cur[i])) * vel;
      }
      break;
    }
    case 'NODE_MASK': {
      for (let i = 0; i < n; i++) field[i] = Math.abs(cur[i]) < 0.05 ? 1 : 0;
      break;
    }
    case 'HEIGHT':
    default: {
      for (let i = 0; i < n; i++) field[i] = cur[i];
      break;
    }
  }
  return field;
}

// ── Output rendering: field → dst pixels ──────────────────────────────────────

/**
 * Render output field to dst RGBA:
 *   DISPLACEMENT — warp src coords by field
 *   FIELD        — display field as greyscale overlay
 *   COMBINED     — warp + field composite
 */
function _renderOutput(
  src, dst, w, h, field,
  strength, axis, dirRad,
  interpolation, renderMode,
  contrast, gain, normalise
) {
  const n = w * h;

  // Normalise field to [-1,1] if requested.
  let scale = 1;
  if (normalise) {
    let mn = Infinity, mx = -Infinity;
    for (let i = 0; i < n; i++) { if (field[i] < mn) mn = field[i]; if (field[i] > mx) mx = field[i]; }
    const range = mx - mn;
    if (range > 1e-6) {
      scale = 2 / range;
      for (let i = 0; i < n; i++) field[i] = (field[i] - mn) * scale - 1;
    }
  }

  const cosDir = Math.cos(dirRad), sinDir = Math.sin(dirRad);
  const sample = interpolation === 'NEAREST' ? _nearest : _bilinear;

  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    const pi = i * 4;
    const raw = field[i] * contrast * gain * strength;

    if (renderMode === 'FIELD') {
      const v = Math.max(0, Math.min(255, (field[i] * 0.5 + 0.5) * contrast * gain * 255));
      dst[pi] = dst[pi + 1] = dst[pi + 2] = v;
      dst[pi + 3] = src[pi + 3];
      continue;
    }

    // Displacement
    let dx = 0, dy = 0;
    switch (axis) {
      case 'X':      dx = raw; break;
      case 'Y':      dy = raw; break;
      case 'RADIAL': {
        const cx = w * 0.5, cy2 = h * 0.5;
        const nx = (x - cx) / (w * 0.5 + 1), ny = (y - cy2) / (h * 0.5 + 1);
        const len = Math.sqrt(nx * nx + ny * ny) || 1;
        dx = raw * nx / len; dy = raw * ny / len;
        break;
      }
      case 'ANGLE': {
        const cx = w * 0.5, cy2 = h * 0.5;
        const nx = x - cx, ny = y - cy2;
        const len = Math.sqrt(nx * nx + ny * ny) || 1;
        dx = -raw * ny / len; dy = raw * nx / len;
        break;
      }
      case 'BOTH':
      default: {
        dx = raw * cosDir; dy = raw * sinDir;
        break;
      }
    }

    sample(src, w, h, x + dx, y + dy, dst, pi);

    if (renderMode === 'COMBINED') {
      const v = Math.max(0, Math.min(1, field[i] * 0.5 + 0.5)) * contrast * gain;
      dst[pi]     = Math.max(0, Math.min(255, dst[pi]     * (1 - v * 0.3) + v * 0.3 * 255));
      dst[pi + 1] = Math.max(0, Math.min(255, dst[pi + 1] * (1 - v * 0.3)));
      dst[pi + 2] = Math.max(0, Math.min(255, dst[pi + 2] * (1 - v * 0.3) + v * 0.3 * 255));
    }
  }
}

// ── Node ──────────────────────────────────────────────────────────────────────

export const WaveDistortionNode = createEffectModule({
  type: 'wavedistortion',
  name: 'WAVE DISTORT',
  category: 'PHYSICS',
  forceWorkerPreview: true,

  params: {
    // ── G9: Frame ──────────────────────────────────────────────────────────
    frame:          { label: 'FRAME',         min: 0,    max: 240,  step: 1,     value: 0,         tier: 3, driveable: true, unit: 'frames' },

    // ── Layer 1: Wave Field ────────────────────────────────────────────────
    waveType:       { label: 'WAVE TYPE',     type: 'select', options: ['SINE', 'SQUARE', 'SAWTOOTH', 'TRIANGLE', 'NOISE'], value: 'SINE', tier: 3 },
    amplitude:      { label: 'AMPLITUDE',     min: 0,    max: 100,  step: 0.5,   value: 10,        tier: 3, driveable: true, unit: 'px' },
    wavelength:     { label: 'WAVELENGTH',    min: 1,    max: 500,  step: 1,     value: 80,        tier: 3, driveable: true, unit: 'px' },
    speed:          { label: 'SPEED',         min: 0,    max: 2,    step: 0.01,  value: 0.3,       tier: 3, driveable: true, unit: 'px/s' },
    direction:      { label: 'DIRECTION',     min: 0,    max: 360,  step: 1,     value: 0,         tier: 3, driveable: true, unit: '°' },
    phaseOffset:    { label: 'PHASE OFFSET',  min: 0,    max: 1,    step: 0.01,  value: 0,         tier: 4, driveable: true, unit: '0-1' },
    axis:           { label: 'AXIS',          type: 'select', options: ['BOTH', 'X', 'Y', 'RADIAL', 'ANGLE'], value: 'BOTH', tier: 3 },
    octaves:        { label: 'OCTAVES',       min: 1,    max: 8,    step: 1,     value: 3,         tier: 4, previewMax: 3, driveable: true, unit: 'n' },
    noiseScale:     { label: 'NOISE SCALE',   min: 0.001,max: 0.1,  step: 0.001, value: 0.01,      tier: 4, driveable: true, unit: '0-1' },

    // ── Layer 1: Init ──────────────────────────────────────────────────────
    initType:       { label: 'INIT MODE',     type: 'select', options: ['GAUSSIAN', 'RIPPLE', 'FLAT', 'IMAGE', 'EDGE'], value: 'GAUSSIAN', tier: 4 },
    initAmplitude:  { label: 'INIT AMP',      min: 0,    max: 1,    step: 0.01,  value: 1,         tier: 4, driveable: true, unit: '0-1' },
    initRadius:     { label: 'INIT RADIUS',   min: 0.01, max: 0.5,  step: 0.01,  value: 0.1,       tier: 4, driveable: true, unit: '0-1' },
    seedSource:     { label: 'SEED SOURCE',   type: 'select', options: ['LUMINANCE', 'RED', 'GREEN', 'BLUE', 'SATURATION', 'EDGE'], value: 'LUMINANCE', tier: 4 },
    seedThreshold:  { label: 'SEED THRESH',   min: 0,    max: 1,    step: 0.01,  value: 0.3,       tier: 4, driveable: true, unit: '0-1' },

    // ── Layer 2: Simulation ────────────────────────────────────────────────
    simSpeed:       { label: 'SIM SPEED',     min: 0.01, max: 0.707,step: 0.01,  value: 0.5,       tier: 4, driveable: true, unit: 'c' },
    damping:        { label: 'DAMPING',       min: 0.9,  max: 1,    step: 0.001, value: 0.995,     tier: 3, driveable: true, unit: '0-1' },
    stepsPerFrame:  { label: 'STEPS/FRAME',   min: 1,    max: 100,  step: 1,     value: 20,        tier: 3, previewMax: 5, driveable: true, unit: 'n' },
    warmupSteps:    { label: 'WARMUP STEPS',  min: 0,    max: 500,  step: 10,    value: 0,         tier: 4, driveable: true, unit: 'n' },
    dispersion:     { label: 'DISPERSION',    min: 0,    max: 1,    step: 0.01,  value: 0,         tier: 4, driveable: true, unit: '0-1' },
    viscosity:      { label: 'VISCOSITY',     min: 0,    max: 1,    step: 0.01,  value: 0,         tier: 4, driveable: true, unit: '0-1' },
    boundaryMode:   { label: 'BOUNDARY',      type: 'select', options: ['CLAMP', 'REFLECT', 'WRAP', 'ABSORB'], value: 'CLAMP', tier: 4 },
    retainState:    { label: 'RETAIN STATE',  type: 'toggle', value: true,  tier: 3 },

    // ── Layer 2: Emitters ─────────────────────────────────────────────────
    emitterCount:   { label: 'EMITTER COUNT', min: 0,    max: 8,    step: 1,     value: 0,         tier: 3, driveable: true, unit: 'n' },
    emitterMode:    { label: 'EMITTER MODE',  type: 'select', options: ['MANUAL', 'GRID', 'RADIAL', 'RANDOM'], value: 'MANUAL', tier: 4 },
    emitterFreq:    { label: 'EMITTER FREQ',  min: 0,    max: 1,    step: 0.001, value: 0.05,      tier: 4, driveable: true, unit: 'Hz' },
    emitterPhase:   { label: 'EMITTER PHASE', min: 0,    max: 1,    step: 0.01,  value: 0,         tier: 4, driveable: true, unit: '0-1' },
    emitterAmp:     { label: 'EMITTER AMP',   min: 0,    max: 1,    step: 0.01,  value: 0.5,       tier: 4, driveable: true, unit: '0-1' },
    emitterRadius:  { label: 'EMITTER RAD',   min: 0.01, max: 0.5,  step: 0.01,  value: 0.05,      tier: 4, driveable: true, unit: '0-1' },

    // ── Layer 3: Image Coupling ────────────────────────────────────────────
    forcingStrength:{ label: 'FORCING STR',   min: 0,    max: 1,    step: 0.01,  value: 0,         tier: 4, driveable: true, unit: '0-1' },
    forcingInterval:{ label: 'FORCING INT',   min: 1,    max: 60,   step: 1,     value: 1,         tier: 4, driveable: true, unit: 'n' },

    // ── Layer 4: Output Fields ────────────────────────────────────────────
    outputMode:     { label: 'OUTPUT MODE',   type: 'select', options: ['DISPLACEMENT', 'FIELD', 'COMBINED'], value: 'DISPLACEMENT', tier: 3 },
    fieldSource:    { label: 'FIELD SOURCE',  type: 'select', options: ['HEIGHT', 'VELOCITY', 'GRADIENT', 'INTERFERENCE', 'NODE_MASK'], value: 'HEIGHT', tier: 4 },
    normaliseOutput:{ label: 'NORMALISE',     type: 'toggle', value: false, tier: 4 },
    contrast:       { label: 'CONTRAST',      min: 0.1,  max: 5,    step: 0.05,  value: 1,         tier: 4, driveable: true, unit: '×' },
    gain:           { label: 'GAIN',          min: 0,    max: 2,    step: 0.01,  value: 1,         tier: 4, driveable: true, unit: '×' },

    // ── Layer 5: Compositing ──────────────────────────────────────────────
    interpolation:  { label: 'INTERPOLATION', type: 'select', options: ['BILINEAR', 'NEAREST'], value: 'BILINEAR', tier: 4 },
    stiffness:      { label: 'STIFFNESS',     min: 0,    max: 1,    step: 0.01,  value: 0,         tier: 4, driveable: true, unit: '0-1' },
    decay:          { label: 'DECAY',         min: 0,    max: 1,    step: 0.01,  value: 0,         tier: 4, driveable: true, unit: '0-1' },
  },

  apply(src, dst, w, h, p, ctx, modulate) {
    const _m_frame = Math.round(modulate('frame', 0));
    const _m_wavelength = Math.round(modulate('wavelength', 0));
    const _m_direction = Math.round(modulate('direction', 0));
    const _m_octaves = Math.round(modulate('octaves', 0));
    const _m_initAmplitude = modulate('initAmplitude', 0);
    const _m_initRadius = modulate('initRadius', 0);
    const _m_seedThreshold = modulate('seedThreshold', 0);
    const _m_stepsPerFrame = Math.round(modulate('stepsPerFrame', 0));
    const _m_warmupSteps = modulate('warmupSteps', 0);
    const _m_emitterCount = Math.round(modulate('emitterCount', 0));
    const _m_forcingInterval = Math.round(modulate('forcingInterval', 0));
    const _m_stiffness = modulate('stiffness', 0);
    const _m_decay = modulate('decay', 0);
    const n = w * h;
    const frame = _m_frame;

    // ── Resolve per-frame (non-per-pixel) modulated scalars ────────────────
    // Spatial modulation is applied at pixel sampling time (amplitude, phaseOffset).
    // Field-wide params use pixel 0 as representative (frame-level modulation).
    const simSpeed   = Math.min(CFL_MAX, modulate('simSpeed', 0));
    const damping    = modulate('damping', 0);
    const dispersion = modulate('dispersion', 0);
    const viscosity  = modulate('viscosity', 0);

    // ── State signature — detect resets ───────────────────────────────────
    const sigSize  = `${w}|${h}`;
    const sigInit  = `${p.initType}|${_m_initAmplitude}|${_m_initRadius}|${p.seedSource}|${_m_seedThreshold}`;
    const sigSim   = `${simSpeed}|${p.boundaryMode}`;
    const needReset = !this._cur
      || !p.retainState
      || this._sigSize  !== sigSize
      || this._sigInit  !== sigInit;

    if (needReset) {
      const { cur, prev } = _initFields(src, w, h, p.initType, _m_initAmplitude, _m_initRadius, _m_seedThreshold, p.seedSource);
      this._cur   = cur;
      this._prev  = prev;
      this._tmp   = new Float32Array(n);
      this._frame = 0;
      this._sigSize = sigSize;
      this._sigInit = sigInit;
      this._sigSim  = sigSim;

      // Warmup steps before first display.
      if (_m_warmupSteps > 0) {
        for (let s = 0; s < _m_warmupSteps; s++) {
          const { cur: nc, prev: np } = _stepWave2D(this._cur, this._prev, this._tmp, w, h, simSpeed, damping, p.boundaryMode, dispersion, viscosity);
          this._tmp  = this._prev;
          this._cur  = nc;
          this._prev = np;
        }
      }
    }

    // ── Emitter injection ─────────────────────────────────────────────────
    if (_m_emitterCount > 0) {
      _injectEmitters(
        this._cur, w, h,
        _m_emitterCount, p.emitterMode, frame,
        modulate('emitterFreq', 0), modulate('emitterPhase', 0) * TWO_PI,
        modulate('emitterAmp', 0), modulate('emitterRadius', 0)
      );
    }

    // ── Image forcing (ongoing) ───────────────────────────────────────────
    const fstr = modulate('forcingStrength', 0);
    if (fstr > 0 && (frame % Math.max(1, _m_forcingInterval | 0) === 0)) {
      for (let i = 0; i < n; i++) {
        const j = i * 4;
        const lum = (src[j] * 0.299 + src[j + 1] * 0.587 + src[j + 2] * 0.114) / 255;
        this._cur[i] += fstr * (lum - 0.5) * 2;
      }
    }

    // ── Simulation advance ────────────────────────────────────────────────
    let steps = _m_stepsPerFrame;
    steps = capByFrame(steps, frame);

    for (let s = 0; s < steps; s++) {
      // stiffness: restoring force pulls toward zero
      if (_m_stiffness > 0) {
        for (let i = 0; i < n; i++) this._cur[i] -= _m_stiffness * 0.01 * this._cur[i];
      }
      // decay: extra amplitude reduction
      if (_m_decay > 0) {
        for (let i = 0; i < n; i++) this._cur[i] *= (1 - _m_decay * 0.01);
      }

      const { cur: nc, prev: np } = _stepWave2D(
        this._cur, this._prev, this._tmp,
        w, h, simSpeed, damping, p.boundaryMode, dispersion, viscosity
      );
      this._tmp  = this._prev;
      this._cur  = nc;
      this._prev = np;
    }

    // ── Derive output field from wave state ───────────────────────────────
    const field = _deriveOutputField(this._cur, this._prev, w, h, p.fieldSource);

    // ── Analytical wave layer (waveType, wavelength, speed, etc.) ─────────
    // The analytical wave modulates the field or can drive displacement directly.
    // When outputMode is DISPLACEMENT and waveType != NOISE with default params,
    // the analytic wave displaces on top of the sim field.
    const dirRad = (_m_direction * Math.PI) / 180;
    const cosDir = Math.cos(dirRad), sinDir = Math.sin(dirRad);
    const analyticalSpeed = modulate('speed', 0);
    const useAnalytic = analyticalSpeed > 0 || p.waveType !== 'SINE';

    if (useAnalytic) {
      const wl = Math.max(1, _m_wavelength);
      const timePhase = analyticalSpeed * frame / 60;

      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const proj = (x * cosDir + y * sinDir) / wl;
        const phase = proj - timePhase + modulate('phaseOffset', i);
        const fracPhase = phase - Math.floor(phase);
        const noiseVal = p.waveType === 'NOISE'
          ? _fbm(x, y, modulate('noiseScale', i), _m_octaves | 0)
          : 0;
        const wv = _waveform(p.waveType, fracPhase, noiseVal);
        // Blend: analytic wave modulates the field value.
        field[i] = field[i] * (1 - Math.min(1, analyticalSpeed)) + wv * Math.min(1, analyticalSpeed);
      }
    }

    // ── Render ────────────────────────────────────────────────────────────
    const renderMode = p.outputMode === 'DISPLACEMENT' ? 'DISPLACEMENT'
                     : p.outputMode === 'FIELD'        ? 'FIELD'
                     :                                   'COMBINED';

    _renderOutput(
      src, dst, w, h, field,
      modulate('amplitude', 0),
      p.axis, dirRad,
      p.interpolation, renderMode,
      modulate('contrast', 0),
      modulate('gain', 0),
      p.normaliseOutput
    );
  },

  destroy() {
    this._cur   = null;
    this._prev  = null;
    this._tmp   = null;
    this._sigSize = null;
    this._sigInit = null;
    this._sigSim  = null;
    this._frame = 0;
  }
});
