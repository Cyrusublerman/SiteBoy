import { createEffectModule } from '../../core/EffectModule.js';
import { capByFrame } from '../../core/frameCap.js';
import { buildWavefrontLines } from '../../../../../shared/algorithms/line/serpentine-line-engine.js';
import { vectorToRaster } from '../bridge/node-adapters.js';

function _lumAt(lum, w, h, cx, cy) {
  return lum[Math.max(0, Math.min(h - 1, Math.floor(cy))) * w + Math.max(0, Math.min(w - 1, Math.floor(cx)))];
}

export const SerpentineNode = createEffectModule({
  type: 'serpentine',
  name: 'SERPENTINE',
  category: 'LINE',
  isVector: true,
  params: {
    frame:       { label: 'FRAME',      min: 0, max: 240,  step: 1,    value: 0,   tier: 3, driveable: true, unit: 'frames' },
    spacing:     { label: 'SPACING',    min: 2, max: 40,   step: 1,    value: 6,   tier: 3, unit: 'px', driveable: true },
    amplitude:   { label: 'AMPLITUDE',  min: 0.5, max: 20, step: 0.5,  value: 2.5, tier: 3, unit: 'px', driveable: true },
    frequency:   { label: 'FREQUENCY',  min: 0.1, max: 5,  step: 0.1,  value: 1,   tier: 3, driveable: true, unit: 'Hz' },
    baseSpeed:   { label: 'SPEED',      min: 0.05, max: 3, step: 0.05, value: 0.5, tier: 3, driveable: true, unit: 'n' },
    dragLight:   { label: 'DRAG LIGHT', min: 0, max: 0.8,  step: 0.01, value: 0,   tier: 4, driveable: true, unit: '0–1' },
    dragDark:    { label: 'DRAG DARK',  min: 0, max: 0.95, step: 0.01, value: 0.5, tier: 4, driveable: true, unit: '0–1' },
    iterations:  { label: 'ITERATIONS', min: 10, max: 2000, step: 10,  value: 200, tier: 4, previewMax: 60, driveable: true, unit: 'n' },
    strokeW:     { label: 'STROKE W',   min: 0.25, max: 4, step: 0.25, value: 1,   tier: 3, unit: 'px', driveable: true },
    bgColor:     { label: 'BG LEVEL',   min: 0, max: 255,  step: 1,   value: 255,  tier: 4, driveable: true, unit: 'lvl' },
    strokeColor: { label: 'STROKE LVL', min: 0, max: 255,  step: 1,   value: 0,    tier: 4, driveable: true, unit: 'lvl' }
  },
  applyVector(src, w, h, p, ctx) {
    const n = w * h, lum = new Float32Array(n);
    for (let i = 0; i < n; i++) { const j = i * 4; lum[i] = (0.2126 * src[j] + 0.7152 * src[j + 1] + 0.0722 * src[j + 2]) / 255; }
    let iters = ctx?.quality === 'preview' ? Math.min(p.iterations, 60) : p.iterations;
    iters = capByFrame(iters, p.frame);
    const set = buildWavefrontLines({
      width: w, height: h,
      luminanceAt: (cx, cy) => _lumAt(lum, w, h, cx, cy),
      spacing: p.spacing, amplitude: p.amplitude, frequency: p.frequency,
      baseSpeed: p.baseSpeed, dragLight: p.dragLight, dragDark: p.dragDark,
      iterations: iters
    });
    return { lines: set.lines, strokeRGBA: [p.strokeColor, p.strokeColor, p.strokeColor, 255], strokeWidth: p.strokeW, clearRGBA: [p.bgColor, p.bgColor, p.bgColor, 255] };
  },
  apply(src, dst, w, h, p, ctx) {
    const n = w * h, lum = new Float32Array(n);
    for (let i = 0; i < n; i++) { const j = i * 4; lum[i] = (0.2126 * src[j] + 0.7152 * src[j + 1] + 0.0722 * src[j + 2]) / 255; }
    let iters = ctx?.quality === 'preview' ? Math.min(p.iterations, 60) : p.iterations;
    iters = capByFrame(iters, p.frame);
    const set = buildWavefrontLines({
      width: w, height: h,
      luminanceAt: (cx, cy) => _lumAt(lum, w, h, cx, cy),
      spacing: p.spacing, amplitude: p.amplitude, frequency: p.frequency,
      baseSpeed: p.baseSpeed, dragLight: p.dragLight, dragDark: p.dragDark,
      iterations: iters
    });
    dst.set(vectorToRaster({
      basePixels: src, width: w, height: h, lines: set.lines,
      strokeRGBA: [p.strokeColor, p.strokeColor, p.strokeColor, 255],
      strokeWidth: p.strokeW,
      clearRGBA: [p.bgColor, p.bgColor, p.bgColor, 255],
      opacity: 1
    }));
  },
  buildGeometry(w, h, p, ctx, src) {
    if (!src || src.length < w * h * 4) return [];
    const n = w * h, lum = new Float32Array(n);
    for (let i = 0; i < n; i++) { const j = i * 4; lum[i] = (0.2126 * src[j] + 0.7152 * src[j + 1] + 0.0722 * src[j + 2]) / 255; }
    let iters = ctx?.quality === 'preview' ? Math.min(p.iterations, 60) : p.iterations;
    iters = capByFrame(iters, p.frame);
    const set = buildWavefrontLines({
      width: w, height: h,
      luminanceAt: (cx, cy) => _lumAt(lum, w, h, cx, cy),
      spacing: p.spacing, amplitude: p.amplitude, frequency: p.frequency,
      baseSpeed: p.baseSpeed, dragLight: p.dragLight, dragDark: p.dragDark,
      iterations: iters
    });
    return set.lines || [];
  }
});
