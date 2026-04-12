import { createEffectModule } from '../../core/EffectModule.js';
import { halftonePatternRGBA } from '../../../../../shared/algorithms/patterns/pattern-generators.js';
import { wgsl, glsl, gpuBindings as _gpuBindings } from '../../shaders/halftonepattern.shader.js';

export const HalftonePatternNode = createEffectModule({
  type: 'halftonepattern',
  name: 'HALFTONE DOT',
  category: 'PATTERN',
  params: {
    spacing:        { label: 'SPACING',        min: 2, max: 40,  step: 1,   value: 8,   tier: 3, previewMax: 20, unit: 'px', driveable: true },
    angle:          { label: 'ANGLE',          min: 0, max: 180, step: 1,   value: 45,  tier: 3, unit: 'deg', driveable: true },
    minDot:         { label: 'MIN DOT',        min: 0, max: 5,   step: 0.1, value: 0.5, tier: 4, previewMax: 3, unit: 'px', driveable: true },
    maxDot:         { label: 'MAX DOT',        min: 1, max: 15,  step: 0.5, value: 4,   tier: 4, previewMax: 8, unit: 'px', driveable: true },
    bgLevel:        { label: 'BG LEVEL',       min: 0, max: 255, step: 1,   value: 255, tier: 4, driveable: true, unit: 'lvl' },
    dotLevel:       { label: 'DOT LEVEL',      min: 0, max: 255, step: 1,   value: 0,   tier: 4, driveable: true, unit: 'lvl' },
    patternType:    { label: 'PATTERN TYPE',   type: 'select', value: 'dot',       options: ['dot'], tier: 3 },
    gridType:       { label: 'GRID TYPE',      type: 'select', value: 'square',    options: ['square','hexagonal','staggered'], tier: 3 },
    responseSource: { label: 'RESPONSE SOURCE',type: 'select', value: 'luminance', options: ['luminance','red','green','blue','hue','saturation','alpha','gradientMagnitude','distanceToEdge'], tier: 4 },
    responseCurve:  { label: 'RESPONSE CURVE', type: 'select', value: 'linear',    options: ['linear','smoothstep','exponential','threshold','stepped'], tier: 4 },
    invert:         { label: 'INVERT',         type: 'toggle', value: false, tier: 4 },
    softClamp:      { label: 'SOFT CLAMP',     type: 'toggle', value: false, tier: 4 }
  },
  apply(src, dst, w, h, p, ctx, modulate) {
    dst.set(halftonePatternRGBA(src, w, h,
      modulate('spacing',  0), modulate('angle', 0),
      modulate('minDot',   0), modulate('maxDot', 0),
      modulate('bgLevel',  0), modulate('dotLevel', 0),
      p.gridType, p.responseSource, p.responseCurve, p.invert, p.softClamp
    ));
  },
  wgsl,
  glsl,
  gpuBindings: _gpuBindings,
});
