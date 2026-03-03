import { createEffectModule } from '../../core/EffectModule.js';
import { buildBaseGradient } from '../../../../../shared/algorithms/field/base-gradient.js';
import { normalizeField } from '../../../../../shared/algorithms/field/vector-field.js';
import { buildFlowLines } from '../../../../../shared/algorithms/line/flow-line-engine.js';
import { vectorToRaster } from '../bridge/node-adapters.js';

function _seedGrid(w, h, spacing) {
  const seeds = [];
  for (let y = spacing; y < h; y += spacing)
    for (let x = spacing; x < w; x += spacing) seeds.push({ x, y });
  return seeds;
}

export const ModuleFlowLinesNode = createEffectModule({
  type: 'moduleflowlines',
  name: 'MODULE FLOW LINES',
  category: 'LINE',
  isVector: true,
  params: {
    spacing:     { label: 'SPACING',    min: 2, max: 40,   step: 1,    value: 8,  tier: 3, unit: 'px', driveable: true },
    iterations:  { label: 'ITERATIONS', min: 4, max: 200,  step: 1,    value: 24, tier: 3, previewMax: 12 },
    stepSize:    { label: 'STEP',       min: 0.25, max: 5, step: 0.25, value: 1,  tier: 4, unit: 'px' },
    strokeW:     { label: 'STROKE W',   min: 0.25, max: 4, step: 0.25, value: 1,  tier: 3, unit: 'px' },
    bgColor:     { label: 'BG LEVEL',   min: 0, max: 255,  step: 1,   value: 255, tier: 4 },
    strokeColor: { label: 'STROKE LVL', min: 0, max: 255,  step: 1,   value: 0,   tier: 4, driveable: true }
  },
  applyVector(src, w, h, p) {
    const field = normalizeField(buildBaseGradient(src, w, h, true));
    const seeds = _seedGrid(w, h, Math.max(2, p.spacing));
    const set = buildFlowLines({ field, seeds, iterations: p.iterations, step: p.stepSize });
    return { lines: set.lines, strokeRGBA: [p.strokeColor, p.strokeColor, p.strokeColor, 255], strokeWidth: p.strokeW, clearRGBA: [p.bgColor, p.bgColor, p.bgColor, 255] };
  },
  apply(src, dst, w, h, p) {
    const field = normalizeField(buildBaseGradient(src, w, h, true));
    const seeds = _seedGrid(w, h, Math.max(2, p.spacing));
    const set = buildFlowLines({ field, seeds, iterations: p.iterations, step: p.stepSize });
    dst.set(vectorToRaster({
      basePixels: src, width: w, height: h, lines: set.lines,
      strokeRGBA: [p.strokeColor, p.strokeColor, p.strokeColor, 255],
      strokeWidth: p.strokeW,
      clearRGBA: [p.bgColor, p.bgColor, p.bgColor, 255],
      opacity: 1
    }));
  }
});
