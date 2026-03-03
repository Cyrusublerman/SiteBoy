import { createEffectModule } from '../../core/EffectModule.js';
import { buildSerpentineLines } from '../../../../../shared/algorithms/line/serpentine-line-engine.js';
import { vectorToRaster } from '../bridge/node-adapters.js';

export const ModuleSerpentineNode = createEffectModule({
  type: 'moduleserpentine',
  name: 'MODULE SERPENTINE',
  category: 'LINE',
  isVector: true,
  params: {
    spacing:     { label: 'SPACING',    min: 2, max: 40,  step: 1,    value: 8,   tier: 3, unit: 'px', driveable: true },
    amplitude:   { label: 'AMPLITUDE',  min: 0.5, max: 20, step: 0.5, value: 3,   tier: 3, unit: 'px', driveable: true },
    frequency:   { label: 'FREQUENCY',  min: 0.05, max: 1.5, step: 0.05, value: 0.2, tier: 3, driveable: true },
    jitter:      { label: 'JITTER',     min: 0, max: 4,   step: 0.1,  value: 0.4, tier: 4, driveable: true },
    strokeW:     { label: 'STROKE W',   min: 0.25, max: 4, step: 0.25, value: 1,  tier: 3, unit: 'px' },
    bgColor:     { label: 'BG LEVEL',   min: 0, max: 255, step: 1,   value: 255, tier: 4 },
    strokeColor: { label: 'STROKE LVL', min: 0, max: 255, step: 1,   value: 0,   tier: 4, driveable: true }
  },
  applyVector(_src, w, h, p, ctx) {
    const set = buildSerpentineLines({
      width: w, height: h, spacing: p.spacing, amplitude: p.amplitude,
      frequency: p.frequency, seed: ctx?.nodeSeed ?? 42,
      jitter: ctx?.quality === 'preview' ? p.jitter * 0.5 : p.jitter
    });
    return { lines: set.lines, strokeRGBA: [p.strokeColor, p.strokeColor, p.strokeColor, 255], strokeWidth: p.strokeW, clearRGBA: [p.bgColor, p.bgColor, p.bgColor, 255] };
  },
  apply(src, dst, w, h, p, ctx) {
    const set = buildSerpentineLines({
      width: w, height: h, spacing: p.spacing, amplitude: p.amplitude,
      frequency: p.frequency, seed: ctx?.nodeSeed ?? 42,
      jitter: ctx?.quality === 'preview' ? p.jitter * 0.5 : p.jitter
    });
    dst.set(vectorToRaster({
      basePixels: src, width: w, height: h, lines: set.lines,
      strokeRGBA: [p.strokeColor, p.strokeColor, p.strokeColor, 255],
      strokeWidth: p.strokeW,
      clearRGBA: [p.bgColor, p.bgColor, p.bgColor, 255],
      opacity: 1
    }));
  }
});
