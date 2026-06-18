import { createEffectModule } from '../../core/EffectModule.js';
import { perlin2D, simplex2D, fbm2D } from '../../../../../shared/algorithms/noise/noise-functions.js';
import { valueNoise2D } from '../../../../../shared/algorithms/noise/value-2d.js';
import { worleyNoise2D } from '../../../../../shared/algorithms/noise/worley-2d.js';
import { whiteGaussianNoise2D } from '../../../../../shared/algorithms/noise/white-gaussian-2d.js';
import { turbulenceField2D } from '../../../../../shared/algorithms/noise/turbulence-2d.js';
import { ridgedFbm2D } from '../../../../../shared/algorithms/noise/ridged-fbm-2d.js';

// ── Seeded PRNG ──────────────────────────────────────────────────────────────

function lcgRng(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0x100000000; };
}

// ── Hash helpers for per-pixel grain (no Math.random) ────────────────────────

function hashNoise(x, y, seed) {
  let h = ((x * 73856093) ^ (y * 19349663) ^ ((seed | 0) * 83492791)) >>> 0;
  h = (h ^ (h >>> 13)) >>> 0;
  h = (h * 1103515245 + 12345) >>> 0;
  return (h >>> 0) / 0x100000000;
}

// ── Noise dispatch ───────────────────────────────────────────────────────────

function sampleNoise(algorithm, nx, ny, seed, scale, octaves, lacunarity, persistence) {
  const x = nx * scale * 8;
  const y = ny * scale * 8;
  switch (algorithm) {
    case 'WHITE':
      return hashNoise(Math.floor(nx * scale * 256), Math.floor(ny * scale * 256), seed) * 2 - 1;
    case 'GAUSSIAN':
      return whiteGaussianNoise2D(Math.floor(nx * scale * 256), Math.floor(ny * scale * 256), seed, 0.5);
    case 'VALUE':
      return valueNoise2D(x, y, seed) * 2 - 1;
    case 'PERLIN':
      return perlin2D(x, y, seed);
    case 'SIMPLEX':
      return simplex2D(x, y);
    case 'WORLEY':
      return worleyNoise2D(x, y, seed).f1 * 2 - 1;
    case 'FBM':
      return fbm2D(x, y, { octaves, persistence, lacunarity, noiseFn: simplex2D });
    case 'RIDGED':
      return ridgedFbm2D(x, y, seed, octaves, persistence, lacunarity) * 2 - 1;
    case 'TURBULENCE':
      return turbulenceField2D(x, y, seed, octaves, persistence, lacunarity) * 2 - 1;
    default:
      return 0;
  }
}

// ── Layer field generation ───────────────────────────────────────────────────

function buildLayerField(w, h, layerCfg, baseSeed, frame) {
  const {
    enabled, algorithm, seed: lseed, scale, amplitude,
    offsetX, offsetY, octaves, lacunarity, persistence,
    temporalPhase, temporalSpeed, threshold, quantisation
  } = layerCfg;

  if (!enabled || amplitude <= 0) return null;

  const effectiveSeed = (baseSeed + (lseed | 0)) >>> 0;
  const timeOffset = (temporalPhase + frame * temporalSpeed) * 0.01;
  const field = new Float32Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = (x + offsetX * w) / w + timeOffset;
      const ny = (y + offsetY * h) / h;
      let v = sampleNoise(algorithm, nx, ny, effectiveSeed, scale, octaves, lacunarity, persistence);
      if (threshold > 0) v = Math.abs(v) > threshold ? v : 0;
      if (quantisation > 1) v = Math.round(v * quantisation) / quantisation;
      field[y * w + x] = v * amplitude;
    }
  }
  return field;
}

// ── Tonal zone weight ─────────────────────────────────────────────────────────

function tonalWeight(lum, shadowW, midtoneW, highlightW, blackProt, whiteProt, lumInfluence) {
  const shadow = Math.max(0, 1 - lum * 2);
  const highlight = Math.max(0, lum * 2 - 1);
  const midtone = 1 - shadow - highlight;
  const base = shadow * shadowW + midtone * midtoneW + highlight * highlightW;
  const prot = lum < 0.05 ? (1 - blackProt * (1 - lum / 0.05))
             : lum > 0.95 ? (1 - whiteProt * ((lum - 0.95) / 0.05))
             : 1;
  const lumMod = 1 - lumInfluence * Math.abs(lum - 0.5) * 2;
  return base * prot * Math.max(0, lumMod);
}

// ── Sobel edge + local contrast derivation ────────────────────────────────────

function buildEdgeMap(src, w, h) {
  const edge = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const lum = (i) => (src[i] * 0.299 + src[i + 1] * 0.587 + src[i + 2] * 0.114) / 255;
      const l00 = lum(((y - 1) * w + (x - 1)) * 4);
      const l01 = lum(((y - 1) * w +  x     ) * 4);
      const l02 = lum(((y - 1) * w + (x + 1)) * 4);
      const l10 = lum(( y      * w + (x - 1)) * 4);
      const l12 = lum(( y      * w + (x + 1)) * 4);
      const l20 = lum(((y + 1) * w + (x - 1)) * 4);
      const l21 = lum(((y + 1) * w +  x     ) * 4);
      const l22 = lum(((y + 1) * w + (x + 1)) * 4);
      const gx = -l00 + l02 - 2 * l10 + 2 * l12 - l20 + l22;
      const gy = -l00 - 2 * l01 - l02 + l20 + 2 * l21 + l22;
      edge[y * w + x] = Math.min(1, Math.sqrt(gx * gx + gy * gy));
    }
  }
  return edge;
}

// ── Local contrast map (3x3 luminance variance) ───────────────────────────────

function buildLocalContrastMap(src, w, h) {
  const lc = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let sum = 0;
      let sum2 = 0;
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const i = ((y + dy) * w + (x + dx)) * 4;
          const v = (src[i] * 0.299 + src[i + 1] * 0.587 + src[i + 2] * 0.114) / 255;
          sum += v;
          sum2 += v * v;
          n++;
        }
      }
      const mean = sum / n;
      lc[y * w + x] = Math.min(1, Math.sqrt(Math.max(0, sum2 / n - mean * mean)) * 8);
    }
  }
  return lc;
}

// ── Effective seed from temporal mode ─────────────────────────────────────────

function resolveTemporalSeed(baseSeed, temporalSeed, temporalMode, frame, driftSpeed) {
  const ts = (temporalSeed | 0);
  switch (temporalMode) {
    case 'LOCKED':    return (baseSeed + ts) >>> 0;
    case 'BAKED':     return (baseSeed + ts + (frame | 0) * 131) >>> 0;
    case 'DRIFT':     return (baseSeed + ts + Math.floor(frame * driftSpeed) * 9973) >>> 0;
    case 'SCROLL':    return (baseSeed + ts + (frame | 0) * 7919) >>> 0;
    case 'FLICKER':   return (baseSeed + ts + (lcgRng((frame | 0) ^ 0xDEAD)() * 0xFFFFFF | 0)) >>> 0;
    case 'RESAMPLED':
    default:          return (baseSeed + ts + (frame | 0) * 7919) >>> 0;
  }
}

// ── Module definition ─────────────────────────────────────────────────────────

export const FilmGrainNode = createEffectModule({
  type: 'filmgrain',
  name: 'FILM GRAIN',
  category: 'TEXTURE',

  params: {
    // G9 frame driver
    frame:            { label: 'FRAME',           min: 0, max: 240, step: 1,    value: 0,    tier: 3, driveable: true,  unit: 'frames' },

    // Primary controls
    amount:           { label: 'AMOUNT',           min: 0, max: 100, step: 0.5,  value: 25,   tier: 3, driveable: true,  unit: '%' },
    size:             { label: 'SIZE',             min: 1, max: 8,   step: 1,    value: 1,    tier: 4, driveable: true,  unit: 'px' },

    // Operating & render mode
    operatingMode:    { label: 'OPERATING MODE',   type: 'select',
                        options: ['FINISH', 'PERTURBATION', 'FIELD OUTPUT', 'HYBRID'],
                        value: 'FINISH', tier: 3 },
    channelMode:      { label: 'CHANNEL MODE',     type: 'select',
                        options: ['MONO', 'RGB LINKED', 'RGB DECORRELATED', 'LUMA-CHROMA SPLIT'],
                        value: 'MONO', tier: 3 },
    renderMode:       { label: 'RENDER MODE',      type: 'select',
                        options: ['MONOCHROME', 'PARTICULATE', 'SOFT CLOUDED', 'THRESHOLDED SPECK', 'DIRECTIONAL', 'SENSOR NOISE'],
                        value: 'MONOCHROME', tier: 4 },

    // Tonal zone controls
    lumInfluence:     { label: 'LUM INFLUENCE',    min: 0, max: 1,   step: 0.01, value: 0.5,  tier: 3, driveable: true,  unit: '0-1' },
    shadowWeight:     { label: 'SHADOW WT',        min: 0, max: 2,   step: 0.01, value: 1,    tier: 4, driveable: true,  unit: '0-2' },
    midtoneWeight:    { label: 'MIDTONE WT',       min: 0, max: 2,   step: 0.01, value: 1,    tier: 4, driveable: true,  unit: '0-2' },
    highlightWeight:  { label: 'HIGHLIGHT WT',     min: 0, max: 2,   step: 0.01, value: 0.7,  tier: 4, driveable: true,  unit: '0-2' },
    blackProtection:  { label: 'BLACK PROT',       min: 0, max: 1,   step: 0.01, value: 0,    tier: 5, driveable: true,  unit: '0-1' },
    whiteProtection:  { label: 'WHITE PROT',       min: 0, max: 1,   step: 0.01, value: 0,    tier: 5, driveable: true,  unit: '0-1' },
    flatAreaBoost:    { label: 'FLAT BOOST',       min: 0, max: 2,   step: 0.01, value: 0,    tier: 5, driveable: true,  unit: '0-2' },
    localContrastInf: { label: 'LOCAL CONTRAST',   min: 0, max: 1,   step: 0.01, value: 0,    tier: 5, driveable: true,  unit: '0-1' },

    // Image-reactive driver mapping
    edgeInfluence:        { label: 'EDGE INF',      min: 0, max: 1, step: 0.01, value: 0, tier: 5, driveable: true, unit: '0-1' },
    gradientMagnitudeInf: { label: 'GRADIENT INF',  min: 0, max: 1, step: 0.01, value: 0, tier: 5, driveable: true, unit: '0-1' },

    // Render mode params
    softness:         { label: 'SOFTNESS',         min: 0, max: 1,   step: 0.01, value: 0.3,  tier: 4, driveable: true,  unit: '0-1' },
    thresholdCutoff:  { label: 'THRESHOLD',        min: 0, max: 1,   step: 0.01, value: 0.5,  tier: 4, driveable: true,  unit: '0-1' },
    channelDecorr:    { label: 'CH DECORR',        min: 0, max: 1,   step: 0.01, value: 0.3,  tier: 4, driveable: true,  unit: '0-1' },
    highlightContam:  { label: 'HI CONTAM',        min: 0, max: 1,   step: 0.01, value: 0,    tier: 5, driveable: true,  unit: '0-1' },
    shadowDensity:    { label: 'SHADOW DENS',      min: 0, max: 2,   step: 0.01, value: 1,    tier: 5, driveable: true,  unit: '0-2' },

    // Image perturbation (PERTURBATION / HYBRID mode)
    lumPerturbation:    { label: 'LUM PERTURB',    min: 0, max: 1,   step: 0.01, value: 0,    tier: 4, driveable: true,  unit: '0-1' },
    chromaPerturbation: { label: 'CHROMA PERTURB', min: 0, max: 1,   step: 0.01, value: 0,    tier: 4, driveable: true,  unit: '0-1' },
    hueJitter:          { label: 'HUE JITTER',     min: 0, max: 1,   step: 0.01, value: 0,    tier: 5, driveable: true,  unit: '0-1' },
    satJitter:          { label: 'SAT JITTER',     min: 0, max: 1,   step: 0.01, value: 0,    tier: 5, driveable: true,  unit: '0-1' },

    // Temporal
    temporalMode:      { label: 'TIME MODE',       type: 'select',
                         options: ['LOCKED', 'RESAMPLED', 'DRIFT', 'SCROLL', 'FLICKER', 'BAKED'],
                         value: 'RESAMPLED', tier: 4 },
    driftSpeed:        { label: 'DRIFT SPD',       min: 0, max: 5,   step: 0.05, value: 1,    tier: 4, driveable: true,  unit: 'spd' },
    temporalCoherence: { label: 'T COHERENCE',     min: 0, max: 1,   step: 0.01, value: 0,    tier: 5, driveable: true,  unit: '0-1' },
    temporalSeed:      { label: 'T SEED',          min: 0, max: 9999, step: 1,   value: 0,    tier: 5, unit: 'n' },

    // Compositing
    gammaAware:        { label: 'GAMMA AWARE',     type: 'toggle',   value: false, tier: 5 },

    // Layer 1 — Coarse
    l1enabled:    { label: 'L1 ENABLED',    type: 'toggle',   value: true,    tier: 4 },
    l1algorithm:  { label: 'L1 ALGORITHM',  type: 'select',
                    options: ['WHITE', 'GAUSSIAN', 'VALUE', 'PERLIN', 'SIMPLEX', 'WORLEY', 'FBM', 'RIDGED', 'TURBULENCE'],
                    value: 'GAUSSIAN', tier: 4 },
    l1seed:       { label: 'L1 SEED',       min: 0, max: 9999, step: 1, value: 0,    tier: 5, unit: 'n' },
    l1scale:      { label: 'L1 SCALE',      min: 0.1, max: 20, step: 0.1, value: 1,  tier: 4, driveable: true, unit: 'n' },
    l1amplitude:  { label: 'L1 AMPLITUDE',  min: 0, max: 2,   step: 0.01, value: 0.6, tier: 4, driveable: true, unit: '0-2' },
    l1offsetX:    { label: 'L1 OFFSET X',   min: -1, max: 1,  step: 0.01, value: 0,  tier: 5, driveable: true, unit: '0-1' },
    l1offsetY:    { label: 'L1 OFFSET Y',   min: -1, max: 1,  step: 0.01, value: 0,  tier: 5, driveable: true, unit: '0-1' },
    l1octaves:    { label: 'L1 OCTAVES',    min: 1, max: 8,   step: 1,    value: 4,  tier: 5, unit: 'n' },
    l1lacunarity: { label: 'L1 LACUNARITY', min: 1, max: 4,   step: 0.1,  value: 2,  tier: 5, unit: 'n' },
    l1persistence:{ label: 'L1 PERSIST',    min: 0, max: 1,   step: 0.01, value: 0.5, tier: 5, unit: '0-1' },
    l1threshold:  { label: 'L1 THRESHOLD',  min: 0, max: 1,   step: 0.01, value: 0,  tier: 5, unit: '0-1' },
    l1quantise:   { label: 'L1 QUANTISE',   min: 1, max: 16,  step: 1,    value: 1,  tier: 5, unit: 'n' },
    l1tPhase:     { label: 'L1 T PHASE',    min: 0, max: 1,   step: 0.01, value: 0,  tier: 5, unit: '0-1' },
    l1tSpeed:     { label: 'L1 T SPEED',    min: 0, max: 5,   step: 0.05, value: 1,  tier: 5, driveable: true, unit: 'spd' },

    // Layer 2 — Medium
    l2enabled:    { label: 'L2 ENABLED',    type: 'toggle',   value: true,    tier: 4 },
    l2algorithm:  { label: 'L2 ALGORITHM',  type: 'select',
                    options: ['WHITE', 'GAUSSIAN', 'VALUE', 'PERLIN', 'SIMPLEX', 'WORLEY', 'FBM', 'RIDGED', 'TURBULENCE'],
                    value: 'PERLIN', tier: 4 },
    l2seed:       { label: 'L2 SEED',       min: 0, max: 9999, step: 1, value: 100,  tier: 5, unit: 'n' },
    l2scale:      { label: 'L2 SCALE',      min: 0.1, max: 20, step: 0.1, value: 3,  tier: 4, driveable: true, unit: 'n' },
    l2amplitude:  { label: 'L2 AMPLITUDE',  min: 0, max: 2,   step: 0.01, value: 0.3, tier: 4, driveable: true, unit: '0-2' },
    l2offsetX:    { label: 'L2 OFFSET X',   min: -1, max: 1,  step: 0.01, value: 0,  tier: 5, driveable: true, unit: '0-1' },
    l2offsetY:    { label: 'L2 OFFSET Y',   min: -1, max: 1,  step: 0.01, value: 0,  tier: 5, driveable: true, unit: '0-1' },
    l2octaves:    { label: 'L2 OCTAVES',    min: 1, max: 8,   step: 1,    value: 3,  tier: 5, unit: 'n' },
    l2lacunarity: { label: 'L2 LACUNARITY', min: 1, max: 4,   step: 0.1,  value: 2,  tier: 5, unit: 'n' },
    l2persistence:{ label: 'L2 PERSIST',    min: 0, max: 1,   step: 0.01, value: 0.5, tier: 5, unit: '0-1' },
    l2threshold:  { label: 'L2 THRESHOLD',  min: 0, max: 1,   step: 0.01, value: 0,  tier: 5, unit: '0-1' },
    l2quantise:   { label: 'L2 QUANTISE',   min: 1, max: 16,  step: 1,    value: 1,  tier: 5, unit: 'n' },
    l2tPhase:     { label: 'L2 T PHASE',    min: 0, max: 1,   step: 0.01, value: 0.3, tier: 5, unit: '0-1' },
    l2tSpeed:     { label: 'L2 T SPEED',    min: 0, max: 5,   step: 0.05, value: 0.7, tier: 5, driveable: true, unit: 'spd' },

    // Layer 3 — Fine
    l3enabled:    { label: 'L3 ENABLED',    type: 'toggle',   value: true,    tier: 4 },
    l3algorithm:  { label: 'L3 ALGORITHM',  type: 'select',
                    options: ['WHITE', 'GAUSSIAN', 'VALUE', 'PERLIN', 'SIMPLEX', 'WORLEY', 'FBM', 'RIDGED', 'TURBULENCE'],
                    value: 'WHITE', tier: 4 },
    l3seed:       { label: 'L3 SEED',       min: 0, max: 9999, step: 1, value: 200,  tier: 5, unit: 'n' },
    l3scale:      { label: 'L3 SCALE',      min: 0.1, max: 20, step: 0.1, value: 8,  tier: 4, driveable: true, unit: 'n' },
    l3amplitude:  { label: 'L3 AMPLITUDE',  min: 0, max: 2,   step: 0.01, value: 0.1, tier: 4, driveable: true, unit: '0-2' },
    l3offsetX:    { label: 'L3 OFFSET X',   min: -1, max: 1,  step: 0.01, value: 0,  tier: 5, driveable: true, unit: '0-1' },
    l3offsetY:    { label: 'L3 OFFSET Y',   min: -1, max: 1,  step: 0.01, value: 0,  tier: 5, driveable: true, unit: '0-1' },
    l3octaves:    { label: 'L3 OCTAVES',    min: 1, max: 8,   step: 1,    value: 2,  tier: 5, unit: 'n' },
    l3lacunarity: { label: 'L3 LACUNARITY', min: 1, max: 4,   step: 0.1,  value: 2,  tier: 5, unit: 'n' },
    l3persistence:{ label: 'L3 PERSIST',    min: 0, max: 1,   step: 0.01, value: 0.5, tier: 5, unit: '0-1' },
    l3threshold:  { label: 'L3 THRESHOLD',  min: 0, max: 1,   step: 0.01, value: 0,  tier: 5, unit: '0-1' },
    l3quantise:   { label: 'L3 QUANTISE',   min: 1, max: 16,  step: 1,    value: 1,  tier: 5, unit: 'n' },
    l3tPhase:     { label: 'L3 T PHASE',    min: 0, max: 1,   step: 0.01, value: 0.6, tier: 5, unit: '0-1' },
    l3tSpeed:     { label: 'L3 T SPEED',    min: 0, max: 5,   step: 0.05, value: 0.3, tier: 5, driveable: true, unit: 'spd' },
  },

  extendedControls: [
    { type: 'temporal-mode-control', paramKeys: { mode: 'temporalMode' } }
  ],

  apply(src, dst, w, h, p, ctx, modulate) {
    const _m_frame = Math.round(modulate('frame', 0));
    const _m_size = Math.round(modulate('size', 0));
    const _m_temporalCoherence = modulate('temporalCoherence', 0);
    const _m_temporalSeed = Math.round(modulate('temporalSeed', 0));
    const _m_l1seed = Math.round(modulate('l1seed', 0));
    const _m_l1offsetX = modulate('l1offsetX', 0);
    const _m_l1offsetY = modulate('l1offsetY', 0);
    const _m_l1octaves = Math.round(modulate('l1octaves', 0));
    const _m_l1lacunarity = modulate('l1lacunarity', 0);
    const _m_l1persistence = modulate('l1persistence', 0);
    const _m_l1threshold = modulate('l1threshold', 0);
    const _m_l1quantise = Math.round(modulate('l1quantise', 0));
    const _m_l1tPhase = modulate('l1tPhase', 0);
    const _m_l2seed = Math.round(modulate('l2seed', 0));
    const _m_l2offsetX = modulate('l2offsetX', 0);
    const _m_l2offsetY = modulate('l2offsetY', 0);
    const _m_l2octaves = Math.round(modulate('l2octaves', 0));
    const _m_l2lacunarity = modulate('l2lacunarity', 0);
    const _m_l2persistence = modulate('l2persistence', 0);
    const _m_l2threshold = modulate('l2threshold', 0);
    const _m_l2quantise = Math.round(modulate('l2quantise', 0));
    const _m_l2tPhase = modulate('l2tPhase', 0);
    const _m_l3seed = Math.round(modulate('l3seed', 0));
    const _m_l3offsetX = modulate('l3offsetX', 0);
    const _m_l3offsetY = modulate('l3offsetY', 0);
    const _m_l3octaves = Math.round(modulate('l3octaves', 0));
    const _m_l3lacunarity = modulate('l3lacunarity', 0);
    const _m_l3persistence = modulate('l3persistence', 0);
    const _m_l3threshold = modulate('l3threshold', 0);
    const _m_l3quantise = Math.round(modulate('l3quantise', 0));
    const _m_l3tPhase = modulate('l3tPhase', 0);
    const baseSeed = ctx?.nodeSeed ?? 42;
    const frame    = ctx?.frame ?? (_m_frame | 0);
    const driftSpd = modulate('driftSpeed', 0);
    const effSeed  = resolveTemporalSeed(baseSeed, _m_temporalSeed, p.temporalMode, frame, driftSpd);

    // Modulated primary params
    const amount        = modulate('amount',            0) / 100;
    const lumInfluence  = modulate('lumInfluence',      0);
    const shadowW       = modulate('shadowWeight',      0);
    const midtoneW      = modulate('midtoneWeight',     0);
    const highlightW    = modulate('highlightWeight',   0);
    const blackProt     = modulate('blackProtection',   0);
    const whiteProt     = modulate('whiteProtection',   0);
    const flatBoost     = modulate('flatAreaBoost',     0);
    const localContInf  = modulate('localContrastInf',  0);
    const edgeInf       = modulate('edgeInfluence',     0);
    const gradMagInf    = modulate('gradientMagnitudeInf', 0);
    const softness      = modulate('softness',          0);
    const threshCut     = modulate('thresholdCutoff',   0);
    const chDecorr      = modulate('channelDecorr',     0);
    const hiContam      = modulate('highlightContam',   0);
    const shadowDens    = modulate('shadowDensity',     0);
    const lumPerturb    = modulate('lumPerturbation',   0);
    const chromaPerturb = modulate('chromaPerturbation', 0);
    const hueJit        = modulate('hueJitter',         0);
    const satJit        = modulate('satJitter',         0);
    const size          = Math.max(1, _m_size | 0);

    const opMode     = p.operatingMode;
    const chanMode   = p.channelMode;
    const renderMode = p.renderMode;
    const isField    = opMode === 'FIELD OUTPUT';
    const isPerturb  = opMode === 'PERTURBATION' || opMode === 'HYBRID';
    const isFinish   = opMode === 'FINISH' || opMode === 'HYBRID';

    // Stage 3: image-derived maps (built only when parameters require them)
    const needEdge   = edgeInf > 0 || gradMagInf > 0;
    const needLC     = localContInf > 0;
    const edgeMap    = needEdge ? buildEdgeMap(src, w, h) : null;
    const lcMap      = needLC ? buildLocalContrastMap(src, w, h) : null;

    // Stage 1: build each grain layer field at downsampled resolution
    const gw = Math.ceil(w / size);
    const gh = Math.ceil(h / size);

    const layers = [
      { enabled: p.l1enabled, algorithm: p.l1algorithm, seed: _m_l1seed,
        scale: modulate('l1scale', 0), amplitude: modulate('l1amplitude', 0),
        offsetX: _m_l1offsetX, offsetY: _m_l1offsetY,
        octaves: _m_l1octaves, lacunarity: _m_l1lacunarity, persistence: _m_l1persistence,
        threshold: _m_l1threshold, quantisation: _m_l1quantise,
        temporalPhase: _m_l1tPhase, temporalSpeed: modulate('l1tSpeed', 0) },
      { enabled: p.l2enabled, algorithm: p.l2algorithm, seed: _m_l2seed,
        scale: modulate('l2scale', 0), amplitude: modulate('l2amplitude', 0),
        offsetX: _m_l2offsetX, offsetY: _m_l2offsetY,
        octaves: _m_l2octaves, lacunarity: _m_l2lacunarity, persistence: _m_l2persistence,
        threshold: _m_l2threshold, quantisation: _m_l2quantise,
        temporalPhase: _m_l2tPhase, temporalSpeed: modulate('l2tSpeed', 0) },
      { enabled: p.l3enabled, algorithm: p.l3algorithm, seed: _m_l3seed,
        scale: modulate('l3scale', 0), amplitude: modulate('l3amplitude', 0),
        offsetX: _m_l3offsetX, offsetY: _m_l3offsetY,
        octaves: _m_l3octaves, lacunarity: _m_l3lacunarity, persistence: _m_l3persistence,
        threshold: _m_l3threshold, quantisation: _m_l3quantise,
        temporalPhase: _m_l3tPhase, temporalSpeed: modulate('l3tSpeed', 0) },
    ];

    const layerFields = layers.map((cfg, li) =>
      buildLayerField(gw, gh, { ...cfg, seed: cfg.seed + li * 311 }, effSeed, frame)
    );

    // Combine layers into composite grain field (R channel)
    const grainField = new Float32Array(gw * gh);
    for (const lf of layerFields) {
      if (!lf) continue;
      for (let i = 0; i < gw * gh; i++) grainField[i] += lf[i];
    }

    // Per-channel fields for RGB DECORRELATED mode
    let grainFieldG = null;
    let grainFieldB = null;
    if (chanMode === 'RGB DECORRELATED') {
      grainFieldG = new Float32Array(gw * gh);
      grainFieldB = new Float32Array(gw * gh);
      const rng2 = lcgRng((effSeed ^ 0xABCD1234) >>> 0);
      const rng3 = lcgRng((effSeed ^ 0x5678EFAB) >>> 0);
      for (let i = 0; i < gw * gh; i++) {
        grainFieldG[i] = grainField[i] * (1 - chDecorr) + (rng2() * 2 - 1) * chDecorr;
        grainFieldB[i] = grainField[i] * (1 - chDecorr) + (rng3() * 2 - 1) * chDecorr;
      }
    }

    // Stage 8: expose grain field to ctx for downstream consumption
    if (ctx && isField) {
      ctx.grainField = { data: grainField, w: gw, h: gh, scale: size };
    }

    // FIELD OUTPUT mode: write normalised scalar field to dst and return early
    if (isField) {
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          const gi = Math.floor(y / size) * gw + Math.floor(x / size);
          const v = Math.round(Math.max(0, Math.min(1, (grainField[gi] + 1) * 0.5)) * 255);
          dst[i] = dst[i + 1] = dst[i + 2] = v;
          dst[i + 3] = 255;
        }
      }
      return;
    }

    // Gamma linearisation helpers
    const toLinear   = p.gammaAware ? (v) => (v / 255) ** 2.2 * 255 : (v) => v;
    const fromLinear = p.gammaAware ? (v) => (v / 255) ** (1 / 2.2) * 255 : (v) => v;

    // Stage 6: image perturbation pass before composite (PERTURBATION / HYBRID)
    const workSrc = isPerturb && (lumPerturb > 0 || chromaPerturb > 0 || hueJit > 0 || satJit > 0)
      ? applyImagePerturbation(src, w, h, grainField, gw, size, lumPerturb, chromaPerturb, hueJit, satJit, effSeed)
      : src;

    // Stage 4/5/7: per-pixel composite
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const pixelIdx = y * w + x;
        const i = pixelIdx * 4;
        const gi = Math.floor(y / size) * gw + Math.floor(x / size);

        const r = workSrc[i];
        const g = workSrc[i + 1];
        const b = workSrc[i + 2];
        const a = workSrc[i + 3];

        const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

        // Stage 3: image-derived amplitude modulation
        let edgeW = 1;
        if (needEdge && edgeMap) {
          const em = edgeMap[pixelIdx];
          edgeW = 1 + em * edgeInf + em * gradMagInf;
        }

        let lcW = 1;
        if (needLC && lcMap) {
          lcW = 1 + lcMap[pixelIdx] * localContInf;
        }

        // Flat-area boost: low field variance → boost grain
        const flatW = flatBoost > 0 ? 1 + flatBoost * (1 - Math.min(1, Math.abs(grainField[gi]) * 4)) : 1;

        // Stage 2: tonal zone weight
        const tw = tonalWeight(lum, shadowW, midtoneW, highlightW, blackProt, whiteProt, lumInfluence);

        // Combined pixel amplitude
        const pixelAmp = amount * tw * edgeW * lcW * flatW;

        if (!isFinish) {
          // PERTURBATION only — perturbation already applied above; copy through
          dst[i]     = Math.max(0, Math.min(255, workSrc[i]));
          dst[i + 1] = Math.max(0, Math.min(255, workSrc[i + 1]));
          dst[i + 2] = Math.max(0, Math.min(255, workSrc[i + 2]));
          dst[i + 3] = a;
          continue;
        }

        let gR = grainField[gi];
        let gG = grainFieldG ? grainFieldG[gi] : gR;
        let gB = grainFieldB ? grainFieldB[gi] : gR;

        // Stage 5: render mode shaping
        switch (renderMode) {
          case 'PARTICULATE': {
            const sharp = 1 + softness * 4;
            gR = Math.sign(gR) * Math.pow(Math.abs(gR), sharp);
            gG = Math.sign(gG) * Math.pow(Math.abs(gG), sharp);
            gB = Math.sign(gB) * Math.pow(Math.abs(gB), sharp);
            break;
          }
          case 'SOFT CLOUDED': {
            const hR = hashNoise(x + 3, y + 5, effSeed) * 2 - 1;
            const hG = hashNoise(x + 7, y + 11, effSeed + 13) * 2 - 1;
            const hB = hashNoise(x + 13, y + 7, effSeed + 29) * 2 - 1;
            gR = gR * softness + hR * (1 - softness);
            gG = chanMode === 'RGB DECORRELATED' ? gG * softness + hG * (1 - softness) : gR;
            gB = chanMode === 'RGB DECORRELATED' ? gB * softness + hB * (1 - softness) : gR;
            break;
          }
          case 'THRESHOLDED SPECK':
            gR = Math.abs(gR) > threshCut ? gR : 0;
            gG = Math.abs(gG) > threshCut ? gG : 0;
            gB = Math.abs(gB) > threshCut ? gB : 0;
            break;
          case 'SENSOR NOISE': {
            const snR = (hashNoise(x, y, effSeed) * 2 - 1) * 0.3;
            const snG = (hashNoise(x, y, effSeed + 7) * 2 - 1) * 0.3;
            const snB = (hashNoise(x, y, effSeed + 13) * 2 - 1) * 0.3;
            gR = gR * 0.7 + snR;
            gG = (chanMode === 'RGB DECORRELATED' ? gG : gR) * 0.7 + snG;
            gB = (chanMode === 'RGB DECORRELATED' ? gB : gR) * 0.7 + snB;
            break;
          }
          default: break;
        }

        // Stage 7: channel-aware compositing
        if (chanMode === 'LUMA-CHROMA SPLIT') {
          // Apply grain to luminance axis only, preserving chroma ratios
          const lumaGrain = gR * pixelAmp * 255;
          const shadowFactor = (1 - lum) * shadowDens;
          const hiAdj = lum * hiContam;
          const str = 1 + shadowFactor + hiAdj;
          dst[i]     = Math.max(0, Math.min(255, fromLinear(toLinear(r) + lumaGrain * str)));
          dst[i + 1] = Math.max(0, Math.min(255, fromLinear(toLinear(g) + lumaGrain * str)));
          dst[i + 2] = Math.max(0, Math.min(255, fromLinear(toLinear(b) + lumaGrain * str)));
        } else {
          const str = pixelAmp * 255;
          const shadowFactor = (1 - lum) * (shadowDens - 1);
          const shadowStr = str * (1 + shadowFactor);
          const hiAdj = lum * hiContam;
          const strR = shadowStr * (1 + hiAdj);
          const strG = shadowStr * (1 + (chanMode === 'RGB DECORRELATED' ? hiAdj * 0.9 : hiAdj));
          const strB = shadowStr * (1 + (chanMode === 'RGB DECORRELATED' ? hiAdj * 1.1 : hiAdj));
          dst[i]     = Math.max(0, Math.min(255, fromLinear(toLinear(r) + gR * strR)));
          dst[i + 1] = Math.max(0, Math.min(255, fromLinear(toLinear(g) + gG * strG)));
          dst[i + 2] = Math.max(0, Math.min(255, fromLinear(toLinear(b) + gB * strB)));
        }
        dst[i + 3] = a;
      }
    }
  }
});

// ── Image perturbation pass (Stage 6) ────────────────────────────────────────

function applyImagePerturbation(src, w, h, grainField, gw, size, lumP, chromaP, hueJit, satJit, seed) {
  const out = new Uint8ClampedArray(src.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const gi = Math.floor(y / size) * gw + Math.floor(x / size);
      const gv = grainField[gi];

      let r = src[i] / 255;
      let g = src[i + 1] / 255;
      let b = src[i + 2] / 255;

      if (lumP > 0) {
        const shift = gv * lumP * 0.1;
        r = Math.max(0, Math.min(1, r + shift));
        g = Math.max(0, Math.min(1, g + shift));
        b = Math.max(0, Math.min(1, b + shift));
      }

      if (chromaP > 0) {
        const cr = hashNoise(x, y, seed + 1) * 2 - 1;
        const cg = hashNoise(x, y, seed + 2) * 2 - 1;
        const cb = hashNoise(x, y, seed + 3) * 2 - 1;
        r = Math.max(0, Math.min(1, r + cr * chromaP * 0.1));
        g = Math.max(0, Math.min(1, g + cg * chromaP * 0.1));
        b = Math.max(0, Math.min(1, b + cb * chromaP * 0.1));
      }

      if (hueJit > 0 || satJit > 0) {
        const lv = r * 0.299 + g * 0.587 + b * 0.114;
        const hj = (hashNoise(x, y, seed + 4) * 2 - 1) * hueJit * 0.15;
        const sj = 1 + (hashNoise(x, y, seed + 5) * 2 - 1) * satJit;
        r = Math.max(0, Math.min(1, lv + (r - lv + hj) * sj));
        g = Math.max(0, Math.min(1, lv + (g - lv - hj * 0.5) * sj));
        b = Math.max(0, Math.min(1, lv + (b - lv - hj * 0.5) * sj));
      }

      out[i]     = Math.round(r * 255);
      out[i + 1] = Math.round(g * 255);
      out[i + 2] = Math.round(b * 255);
      out[i + 3] = src[i + 3];
    }
  }
  return out;
}
