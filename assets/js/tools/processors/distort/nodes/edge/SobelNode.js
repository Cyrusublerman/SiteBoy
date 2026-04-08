import { createEffectModule } from '../../core/EffectModule.js';
import { sobelEdge } from '../../../../../shared/algorithms/edge-detection/edge-operators.js';

function _hexToRgb(hex) {
  const s = String(hex).replace('#', '');
  if (s.length === 3) {
    return {
      r: parseInt(s[0] + s[0], 16),
      g: parseInt(s[1] + s[1], 16),
      b: parseInt(s[2] + s[2], 16)
    };
  }
  if (s.length >= 6) {
    return {
      r: parseInt(s.slice(0, 2), 16) || 0,
      g: parseInt(s.slice(2, 4), 16) || 0,
      b: parseInt(s.slice(4, 6), 16) || 0
    };
  }
  return { r: 0, g: 0, b: 0 };
}

export const SobelNode = createEffectModule({
  type: 'sobel', name: 'SOBEL EDGE', category: 'EDGE',
  params: {
    threshold: { value: 0, min: 0, max: 255, step: 1, label: 'THRESHOLD', tier: 3, driveable: true, unit: 'lvl' },
    normalize: { value: 1, min: 0, max: 1, step: 1, label: 'NORMALIZE', type: 'toggle', tier: 4 },
    minColour: { label: 'MIN COLOUR', value: '#000000', tier: 6, type: 'internal' },
    maxColour: { label: 'MAX COLOUR', value: '#ffffff', tier: 6, type: 'internal' },
    rampSource: { label: 'RAMP SRC', value: 'NORMALISED_MAGNITUDE', tier: 6, type: 'internal' },
    rampSpace: { label: 'RAMP SPACE', value: 'RGB', tier: 6, type: 'internal' },
    rampClamp: { label: 'RAMP CLAMP', value: 1, tier: 6, type: 'internal' }
  },
  extendedControls: [
    {
      type: 'colour-ramp-control',
      paramKeys: {
        minColour: 'minColour',
        maxColour: 'maxColour',
        rampSource: 'rampSource',
        rampSpace: 'rampSpace',
        clamp: 'rampClamp'
      }
    }
  ],
  apply(src, dst, w, h, p) {
    const grey = sobelEdge(src, w, h, p.threshold, !!p.normalize);
    const lo = _hexToRgb(p.minColour);
    const hi = _hexToRgb(p.maxColour);
    const clamp = p.rampClamp !== false && p.rampClamp !== 0;
    const n = w * h;
    for (let i = 0; i < n; i++) {
      const t = grey[i * 4] / 255;
      let r = lo.r + (hi.r - lo.r) * t;
      let g = lo.g + (hi.g - lo.g) * t;
      let b = lo.b + (hi.b - lo.b) * t;
      if (clamp) {
        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));
      }
      const j = i * 4;
      dst[j] = Math.round(r);
      dst[j + 1] = Math.round(g);
      dst[j + 2] = Math.round(b);
      dst[j + 3] = src[j + 3];
    }
  }
});
