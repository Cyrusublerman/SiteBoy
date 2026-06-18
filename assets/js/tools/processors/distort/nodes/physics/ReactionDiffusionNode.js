import { createEffectModule } from '../../core/EffectModule.js';
import { capByFrame } from '../../core/frameCap.js';

// ── Preset table ──────────────────────────────────────────────────────────────

const PRESETS = {
  CORAL:   { dA: 0.16,   dB: 0.08,  f: 0.06,   k: 0.062  },
  MITOSIS: { dA: 0.2097, dB: 0.105, f: 0.0367,  k: 0.0649 },
  STRIPES: { dA: 0.21,   dB: 0.105, f: 0.029,   k: 0.057  },
  SPOTS:   { dA: 0.16,   dB: 0.08,  f: 0.035,   k: 0.065  },
  WORMS:   { dA: 0.21,   dB: 0.105, f: 0.046,   k: 0.063  },
  CUSTOM:  { dA: 0.16,   dB: 0.08,  f: 0.055,   k: 0.062  },
};

// ── Colourmap LUTs (256-entry RGBA, packed as Uint8Array) ─────────────────────

function buildLUT(fn) {
  const lut = new Uint8Array(256 * 4);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    const [r, g, b] = fn(t);
    lut[i * 4]     = r;
    lut[i * 4 + 1] = g;
    lut[i * 4 + 2] = b;
    lut[i * 4 + 3] = 255;
  }
  return lut;
}

const COLORMAPS = {
  grey:    buildLUT(t => [t * 255, t * 255, t * 255]),
  plasma:  buildLUT(t => {
    const r = Math.round(Math.min(255, Math.max(0, (0.063 + t * (0.6 + t * (0.66 - t * 0.32))) * 255)));
    const g = Math.round(Math.min(255, Math.max(0, (0.006 + t * (0.05 + t * (1.0  - t * 0.5)))  * 255)));
    const b = Math.round(Math.min(255, Math.max(0, (0.534 + t * (0.55 - t * (1.1  - t * 0.9)))  * 255)));
    return [r, g, b];
  }),
  viridis: buildLUT(t => {
    const r = Math.round(Math.min(255, Math.max(0, (0.267 + t * (-0.003 + t * (1.77 - t * 1.05))) * 255)));
    const g = Math.round(Math.min(255, Math.max(0, (0.004 + t * (1.33  - t * (0.6  - t * 0.33))) * 255)));
    const b = Math.round(Math.min(255, Math.max(0, (0.329 + t * (1.41  - t * (2.34 - t * 1.18))) * 255)));
    return [r, g, b];
  }),
  hot:     buildLUT(t => [
    Math.round(Math.min(255, t * 3 * 255)),
    Math.round(Math.min(255, Math.max(0, (t * 3 - 1) * 255))),
    Math.round(Math.min(255, Math.max(0, (t * 3 - 2) * 255))),
  ]),
  cool:    buildLUT(t => [Math.round(t * 255), Math.round((1 - t) * 255), 255]),
};

// ── Image-derived driver field extraction ─────────────────────────────────────

/**
 * Extract a [0,1] driver field from src RGBA pixels.
 * Returns null when driver is 'none'.
 * @param {Uint8ClampedArray} src
 * @param {number} n  — pixel count
 * @param {string} driver
 * @returns {Float32Array|null}
 */
function extractDriverField(src, n, driver) {
  if (!driver || driver === 'none') return null;
  const field = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const j = i * 4;
    const r = src[j] / 255, g = src[j + 1] / 255, b = src[j + 2] / 255;
    switch (driver) {
      case 'luminance':  field[i] = r * 0.299 + g * 0.587 + b * 0.114; break;
      case 'red':        field[i] = r; break;
      case 'green':      field[i] = g; break;
      case 'blue':       field[i] = b; break;
      case 'saturation': {
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
        field[i] = mx > 0 ? (mx - mn) / mx : 0;
        break;
      }
      default:           field[i] = r * 0.299 + g * 0.587 + b * 0.114;
    }
  }
  return field;
}

// ── Seed initialisation ───────────────────────────────────────────────────────

/**
 * Initialise Gray-Scott U/A and V/B fields.
 * A (activator/U) starts at 1; B (inhibitor/V) starts at 0.
 * Seeding places (0.5, 0.25+perturbation) patches according to seedMode.
 */
function initState(src, w, h, seedMode, seedSize, seedDensity, seedRandomness, imageSeedStrength) {
  const n = w * h;
  const stateA = new Float32Array(n).fill(1.0);
  const stateB = new Float32Array(n).fill(0.0);
  const half   = Math.max(1, Math.floor(seedSize / 2));
  const cx = w >> 1, cy = h >> 1;

  const seedCell = (x, y, lum) => {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const i = y * w + x;
    stateA[i] = 0.5;
    stateB[i] = 0.25 + (seedRandomness > 0 ? (Math.random() - 0.5) * seedRandomness * 0.2 : 0)
                     + lum * imageSeedStrength * 0.1;
  };

  switch (seedMode) {
    case 'noise': {
      const density = Math.max(0.001, Math.min(1, seedDensity));
      for (let i = 0; i < n; i++) {
        if (Math.random() < density) {
          const x = i % w, y = (i / w) | 0;
          seedCell(x, y, 0.5);
        }
      }
      break;
    }
    case 'corners': {
      const regions = [
        [0, 0], [w - seedSize, 0], [0, h - seedSize], [w - seedSize, h - seedSize]
      ];
      for (const [bx, by] of regions) {
        for (let dy = 0; dy < seedSize; dy++) for (let dx = 0; dx < seedSize; dx++) {
          seedCell(bx + dx, by + dy, 0.5);
        }
      }
      break;
    }
    case 'random': {
      const count = Math.max(1, Math.round(n * Math.max(0.0005, seedDensity * 0.01)));
      for (let c = 0; c < count; c++) {
        const rx = (Math.random() * w) | 0;
        const ry = (Math.random() * h) | 0;
        for (let dy = -half; dy <= half; dy++) for (let dx = -half; dx <= half; dx++) {
          seedCell(rx + dx, ry + dy, 0.5);
        }
      }
      break;
    }
    case 'image-luminance':
    default: {
      for (let y = cy - half; y < cy + half; y++) for (let x = cx - half; x < cx + half; x++) {
        if (x < 0 || x >= w || y < 0 || y >= h) continue;
        const j = (y * w + x) * 4;
        const lum = (src[j] * 0.299 + src[j + 1] * 0.587 + src[j + 2] * 0.114) / 255;
        seedCell(x, y, lum);
      }
      break;
    }
  }

  return { stateA, stateB };
}

// ── Colourmap application ─────────────────────────────────────────────────────

function applyColormap(val, lut) {
  const idx = Math.max(0, Math.min(255, Math.round(val * 255)));
  const base = idx * 4;
  return [lut[base], lut[base + 1], lut[base + 2]];
}

// ── Main simulation step (in-place, uses swap buffers) ────────────────────────

/**
 * Run N Gray-Scott steps with optional spatially-varying parameter fields.
 * Modifies stateA / stateB in-place via internal swap buffers allocated once
 * and reused across calls (passed as tmpA / tmpB).
 */
function runSteps(stateA, stateB, tmpA, tmpB, w, h, dA, dB, f, k, dt, steps,
                  feedField, killField, couplingStrength) {
  // src/dst ping-pong: even steps read from stateA→stateB, odd steps read from tmp buffers.
  // After all steps, the result is always written back into stateA/stateB.
  let src_A = stateA, src_B = stateB, dst_A = tmpA, dst_B = tmpB;

  for (let s = 0; s < steps; s++) {
    for (let y = 0; y < h; y++) {
      const row = y * w;
      const rT = y > 0     ? row - w : row;
      const rB = y < h - 1 ? row + w : row;
      for (let x = 0; x < w; x++) {
        const i  = row + x;
        const l  = x > 0     ? i - 1 : i;
        const r  = x < w - 1 ? i + 1 : i;
        const lapA = src_A[l] + src_A[r] + src_A[rT + x] + src_A[rB + x] - 4 * src_A[i];
        const lapB = src_B[l] + src_B[r] + src_B[rT + x] + src_B[rB + x] - 4 * src_B[i];
        const a = src_A[i], b = src_B[i];
        const rxn = a * b * b;

        // Spatial parameter override via coupling
        let fi = f, ki = k;
        if (feedField && couplingStrength > 0) {
          const t = feedField[i] * couplingStrength;
          fi = f * (1 - t) + feedField[i] * t;
        }
        if (killField && couplingStrength > 0) {
          const t = killField[i] * couplingStrength;
          ki = k * (1 - t) + killField[i] * t;
        }

        dst_A[i] = Math.max(0, Math.min(1, a + (dA * lapA - rxn + fi * (1 - a)) * dt));
        dst_B[i] = Math.max(0, Math.min(1, b + (dB * lapB + rxn - (ki + fi) * b) * dt));
      }
    }
    // Swap src/dst roles for next step
    const swapA = src_A; src_A = dst_A; dst_A = swapA;
    const swapB = src_B; src_B = dst_B; dst_B = swapB;
  }

  // After all steps, src_A/src_B hold the final values.
  // If they are not stateA/stateB (odd step count), copy back.
  if (src_A !== stateA) {
    stateA.set(src_A);
    stateB.set(src_B);
  }
}

// ── Node ──────────────────────────────────────────────────────────────────────

export const ReactionDiffusionNode = createEffectModule({
  type: 'reactiondiffusion',
  name: 'REACT-DIFFUSE',
  category: 'PHYSICS',
  forceWorkerPreview: true,

  params: {
    // Layer 1 — Initialisation
    frame:            { label: 'FRAME',           min: 0,      max: 240,  step: 1,      value: 0,              tier: 3, driveable: true, unit: 'frames' },
    preset:           { label: 'PRESET',          type: 'select', options: ['CORAL', 'MITOSIS', 'STRIPES', 'SPOTS', 'WORMS', 'CUSTOM'], value: 'CORAL', tier: 3 },
    seedMode:         { label: 'SEED MODE',       type: 'select', options: ['image-luminance', 'noise', 'centre', 'corners', 'random'], value: 'image-luminance', tier: 3 },
    seedSize:         { label: 'SEED SIZE',       min: 5,      max: 200,  step: 1,      value: 20,             tier: 4, driveable: true, unit: 'px' },
    seedDensity:      { label: 'SEED DENSITY',    min: 0.001,  max: 1,    step: 0.001,  value: 0.05,           tier: 4, driveable: true, unit: '0–1' },
    seedRandomness:   { label: 'SEED RANDOM',     min: 0,      max: 1,    step: 0.01,   value: 0.2,            tier: 4, driveable: true, unit: '0–1' },
    imageSeedStrength:{ label: 'SEED IMG STR',    min: 0,      max: 1,    step: 0.01,   value: 0.5,            tier: 4, driveable: true, unit: '0–1' },

    // Layer 2 — Parameter fields
    f:                { label: 'FEED RATE',       min: 0.01,   max: 0.12, step: 0.001,  value: 0.06,           tier: 3, driveable: true, unit: 'f' },
    k:                { label: 'KILL RATE',       min: 0.04,   max: 0.08, step: 0.001,  value: 0.062,          tier: 3, driveable: true, unit: 'k' },
    dA:               { label: 'DIFFUSION A',     min: 0.05,   max: 0.5,  step: 0.005,  value: 0.16,           tier: 4, driveable: true, unit: 'dA' },
    dB:               { label: 'DIFFUSION B',     min: 0.01,   max: 0.25, step: 0.005,  value: 0.08,           tier: 4, driveable: true, unit: 'dB' },
    imageCoupling:    { label: 'IMG COUPLING',    type: 'select', options: ['none', 'feed-rate', 'kill-rate', 'seed-mask'], value: 'none', tier: 4 },
    couplingStrength: { label: 'COUPLING STR',    min: 0,      max: 1,    step: 0.01,   value: 0.5,            tier: 4, driveable: true, unit: '0–1' },

    // Layer 3 — Stepping
    timestep:         { label: 'TIMESTEP',        min: 0.1,    max: 2.0,  step: 0.05,   value: 1.0,            tier: 4, driveable: true, unit: 'dt' },
    stepsPerFrame:    { label: 'STEPS/FRAME',     min: 1,      max: 50,   step: 1,      value: 10,             tier: 3, previewMax: 2, driveable: true, unit: 'n' },

    // Layer 4 — Output / Rendering
    renderChannel:    { label: 'RENDER CH',       type: 'select', options: ['A', 'B', 'A-B', 'normalized'], value: 'B', tier: 3 },
    colormap:         { label: 'COLORMAP',        type: 'select', options: ['grey', 'plasma', 'viridis', 'hot', 'cool'], value: 'grey', tier: 3 },
  },

  apply(src, dst, w, h, p, ctx, modulate) {
    const _m_frame = Math.round(modulate('frame', 0));
    const _m_seedSize = Math.round(modulate('seedSize', 0));
    const _m_seedDensity = modulate('seedDensity', 0);
    const _m_seedRandomness = modulate('seedRandomness', 0);
    const _m_imageSeedStrength = modulate('imageSeedStrength', 0);
    const _m_f = modulate('f', 0);
    const _m_k = modulate('k', 0);
    const _m_dA = modulate('dA', 0);
    const _m_dB = modulate('dB', 0);
    const _m_couplingStrength = modulate('couplingStrength', 0);
    const _m_timestep = modulate('timestep', 0);
    const _m_stepsPerFrame = Math.round(modulate('stepsPerFrame', 0));
    const n = w * h;

    // ── Resolve preset into base params, allow manual override ────────────────
    const presetKey = (p.preset || 'CORAL').toUpperCase();
    const base = PRESETS[presetKey] ?? PRESETS.CORAL;
    const dA = _m_dA !== base.dA || presetKey === 'CUSTOM' ? _m_dA : base.dA;
    const dB = _m_dB !== base.dB || presetKey === 'CUSTOM' ? _m_dB : base.dB;
    const f  = _m_f  !== base.f  || presetKey === 'CUSTOM' ? _m_f  : base.f;
    const k  = _m_k  !== base.k  || presetKey === 'CUSTOM' ? _m_k  : base.k;

    // ── Preset-sync: when preset changes, update param values and reset state ──
    const sigPreset = `${p.preset}`;
    const sigSeed   = `${p.seedMode}|${_m_seedSize}|${_m_seedDensity}|${_m_seedRandomness}`;
    const sigSize   = `${w}|${h}`;

    const needReset = !this._stateA
      || this._sigPreset !== sigPreset
      || this._sigSeed   !== sigSeed
      || this._sigSize   !== sigSize;

    if (needReset) {
      // Image coupling for seed-mask mode
      let seedSrc = src;
      const { stateA, stateB } = initState(
        seedSrc, w, h,
        p.seedMode, _m_seedSize, _m_seedDensity, _m_seedRandomness, _m_imageSeedStrength
      );
      this._stateA   = stateA;
      this._stateB   = stateB;
      this._tmpA     = new Float32Array(n);
      this._tmpB     = new Float32Array(n);
      this._sigPreset = sigPreset;
      this._sigSeed   = sigSeed;
      this._sigSize   = sigSize;
    }

    // ── Frame cap (G9) ────────────────────────────────────────────────────────
    let steps = _m_stepsPerFrame;
    steps = capByFrame(steps, _m_frame);

    // ── Image coupling: build parameter driver fields ─────────────────────────
    let feedField = null, killField = null;
    if (p.imageCoupling !== 'none' && _m_couplingStrength > 0) {
      const driver = 'luminance';
      const field = extractDriverField(src, n, driver);
      if (p.imageCoupling === 'feed-rate') feedField = field;
      else if (p.imageCoupling === 'kill-rate') killField = field;
      // seed-mask handled at init; no per-step field needed
    }

    // ── Run simulation steps ──────────────────────────────────────────────────
    runSteps(
      this._stateA, this._stateB,
      this._tmpA, this._tmpB,
      w, h, dA, dB, f, k, _m_timestep, steps,
      feedField, killField, _m_couplingStrength
    );

    // ── Render channel ────────────────────────────────────────────────────────
    const lut = COLORMAPS[p.colormap] ?? COLORMAPS.grey;
    const A = this._stateA, B = this._stateB;

    switch (p.renderChannel) {
      case 'A': {
        for (let i = 0; i < n; i++) {
          const [r, g, b] = applyColormap(A[i], lut);
          const j = i * 4;
          dst[j] = r; dst[j + 1] = g; dst[j + 2] = b; dst[j + 3] = src[j + 3];
        }
        break;
      }
      case 'A-B': {
        for (let i = 0; i < n; i++) {
          const val = Math.max(0, Math.min(1, A[i] - B[i]));
          const [r, g, b] = applyColormap(val, lut);
          const j = i * 4;
          dst[j] = r; dst[j + 1] = g; dst[j + 2] = b; dst[j + 3] = src[j + 3];
        }
        break;
      }
      case 'normalized': {
        let mn = Infinity, mx = -Infinity;
        for (let i = 0; i < n; i++) { if (B[i] < mn) mn = B[i]; if (B[i] > mx) mx = B[i]; }
        const range = mx - mn || 1;
        for (let i = 0; i < n; i++) {
          const [r, g, b] = applyColormap((B[i] - mn) / range, lut);
          const j = i * 4;
          dst[j] = r; dst[j + 1] = g; dst[j + 2] = b; dst[j + 3] = src[j + 3];
        }
        break;
      }
      case 'B':
      default: {
        for (let i = 0; i < n; i++) {
          const [r, g, b] = applyColormap(B[i], lut);
          const j = i * 4;
          dst[j] = r; dst[j + 1] = g; dst[j + 2] = b; dst[j + 3] = src[j + 3];
        }
        break;
      }
    }
  },

  destroy() {
    this._stateA    = null;
    this._stateB    = null;
    this._tmpA      = null;
    this._tmpB      = null;
    this._sigPreset = null;
    this._sigSeed   = null;
    this._sigSize   = null;
  }
});
