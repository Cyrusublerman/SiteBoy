import { createEffectModule } from '../../core/EffectModule.js';
import { capByFrame } from '../../core/frameCap.js';
import { buildGradientDisplacedLines } from '../../../../../shared/algorithms/line/flow-line-engine.js';
import { vectorToRaster } from '../bridge/node-adapters.js';

export const LuminanceFlowNode = createEffectModule({
  type: 'lumflow',
  name: 'LUMINANCE FLOW',
  category: 'LINE',
  isVector: true,
  params: {
    frame:        { label: 'FRAME',     min: 0, max: 240, step: 1,    value: 0,   tier: 3, driveable: true, unit: 'frames' },
    patternType:  { label: 'PATTERN',   type: 'select', options: ['HORIZONTAL', 'VERTICAL', 'DIAGONAL', 'GRID', 'RADIAL', 'CONCENTRIC'], value: 'HORIZONTAL', tier: 3 },
    spacing:      { label: 'SPACING',   min: 1, max: 40,  step: 1,   value: 8,    tier: 3, unit: 'px', driveable: true, previewMax: 8 },
    strokeWeight: { label: 'STROKE W',  min: 0.1, max: 4, step: 0.1, value: 0.7, tier: 3, unit: 'px', driveable: true },
    resolution:   { label: 'STEP',      min: 1, max: 10,  step: 1,   value: 2,    tier: 4, driveable: true, unit: 'n' },
    amplitude:    { label: 'AMPLITUDE', min: 0, max: 80,  step: 1,   value: 15,   tier: 3, unit: 'px', driveable: true },
    lumExp:       { label: 'LUM EXP',   min: 0.2, max: 4, step: 0.1, value: 1,   tier: 4, driveable: true, unit: 'n' },
    damping:      { label: 'DAMPING',   min: 0.01, max: 1, step: 0.01, value: 0.95, tier: 4, driveable: true, unit: '0–1' },
    iterations:   { label: 'ITERATIONS', min: 1, max: 20, step: 1,   value: 3,   tier: 4, previewMax: 2, driveable: true, unit: 'n' },
    bgBrightness: { label: 'BG LEVEL',  min: 0, max: 255, step: 1,   value: 10,  tier: 4, driveable: true, unit: 'lvl' }
  },
  applyVector(src, w, h, p, ctx) {
    let iters = ctx?.quality === 'preview' ? Math.min(p.iterations, 2) : p.iterations;
    iters = capByFrame(iters, p.frame);
    const set = buildGradientDisplacedLines({
      src, width: w, height: h,
      pattern: p.patternType.toLowerCase(),
      spacing: p.spacing, resolution: p.resolution,
      amplitude: p.amplitude, lumExp: p.lumExp,
      damping: p.damping, iterations: iters
    });
    return { lines: set.lines, strokeRGBA: [255, 255, 255, 204], strokeWidth: p.strokeWeight, clearRGBA: [p.bgBrightness, p.bgBrightness, p.bgBrightness, 255] };
  },
  apply(src, dst, w, h, p, ctx, modulate) {
    let iters = ctx?.quality === 'preview' ? Math.min(p.iterations, 2) : p.iterations;
    iters = capByFrame(iters, p.frame);
    const set = buildGradientDisplacedLines({
      src, width: w, height: h,
      pattern: p.patternType.toLowerCase(),
      spacing: p.spacing, resolution: p.resolution,
      amplitude: p.amplitude, lumExp: p.lumExp,
      damping: p.damping, iterations: iters
    });
    dst.set(vectorToRaster({
      basePixels: src, width: w, height: h, lines: set.lines,
      strokeRGBA: [255, 255, 255, 204],
      strokeWidth: p.strokeWeight,
      clearRGBA: [p.bgBrightness, p.bgBrightness, p.bgBrightness, 255],
      opacity: 1
    }));
  },
  buildGeometry(w, h, p, ctx, src) {
    if (!src || src.length < w * h * 4) return [];
    let iters = ctx?.quality === 'preview' ? Math.min(p.iterations, 2) : p.iterations;
    iters = capByFrame(iters, p.frame);
    const set = buildGradientDisplacedLines({
      src, width: w, height: h,
      pattern: p.patternType.toLowerCase(),
      spacing: p.spacing, resolution: p.resolution,
      amplitude: p.amplitude, lumExp: p.lumExp,
      damping: p.damping, iterations: iters
    });
    return set.lines || [];
  }
});
