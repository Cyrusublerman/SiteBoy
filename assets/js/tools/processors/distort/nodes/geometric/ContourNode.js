import { createEffectModule } from '../../core/EffectModule.js';
import { contourRGBA } from '../../../../../shared/algorithms/image/compositing.js';

export const ContourNode = createEffectModule({
  type: 'contour',
  name: 'CONTOUR',
  category: 'GEOMETRIC',
  params: {
    outputMode:      { label: 'OUTPUT MODE',   type: 'select', options: ['CONTOUR', 'FILL', 'CONTOUR+FILL', 'MASK', 'FIELD'], value: 'CONTOUR', tier: 3 },
    domain:          { label: 'INPUT DOMAIN',  type: 'select', options: ['LUMINANCE', 'RED', 'GREEN', 'BLUE', 'HUE', 'SATURATION', 'CHROMA', 'GRADIENT MAGNITUDE'], value: 'LUMINANCE', tier: 3 },
    bandSpacing:     { label: 'BAND SPACING',  type: 'select', options: ['UNIFORM', 'SHADOW-BIASED', 'HIGHLIGHT-BIASED', 'HISTOGRAM-ADAPTIVE'], value: 'UNIFORM', tier: 3 },
    levels:          { label: 'LEVELS',        min: 2, max: 32,  step: 1,    value: 8,   tier: 3, previewMax: 16, unit: 'n' },
    strokeW:         { label: 'STROKE W',      min: 0.5, max: 4, step: 0.5,  value: 1,   tier: 3, previewMax: 2,  unit: 'px' },
    strokeColourMode:{ label: 'STROKE COL MODE', type: 'select', options: ['GREYSCALE', 'RGB', 'SOURCE-DERIVED', 'BAND-DERIVED'], value: 'GREYSCALE', tier: 3 },
    strokeLevel:     { label: 'STROKE LVL',    min: 0, max: 255, step: 1,    value: 0,   tier: 4, unit: 'lvl', when: { strokeColourMode: 'GREYSCALE' } },
    strokeR:         { label: 'STROKE R',      min: 0, max: 255, step: 1,    value: 0,   tier: 3, unit: 'lvl', when: { strokeColourMode: 'RGB' } },
    strokeG:         { label: 'STROKE G',      min: 0, max: 255, step: 1,    value: 0,   tier: 3, unit: 'lvl', when: { strokeColourMode: 'RGB' } },
    strokeB:         { label: 'STROKE B',      min: 0, max: 255, step: 1,    value: 0,   tier: 3, unit: 'lvl', when: { strokeColourMode: 'RGB' } },
    blendAmt:        { label: 'BLEND',         min: 0, max: 1,   step: 0.01, value: 0.7, tier: 3, unit: '0–1' },
    fillMode:        { label: 'FILL MODE',     type: 'select', options: ['NONE', 'FLAT', 'ALTERNATING', 'SOURCE-PRESERVING'], value: 'FLAT', tier: 3, when: { outputMode: ['FILL', 'CONTOUR+FILL'] } },
    fillOpacity:     { label: 'FILL OPACITY',  min: 0, max: 1,   step: 0.01, value: 1,   tier: 3, unit: '0–1', when: { outputMode: ['FILL', 'CONTOUR+FILL'] } },
    invertBands:     { label: 'INVERT BANDS',  type: 'toggle', value: false, tier: 4 },
    fieldExport:     { label: 'FIELD EXPORT',  type: 'select', options: ['NONE', 'BAND INDEX', 'CONTOUR MASK', 'CONTOUR DISTANCE'], value: 'NONE', tier: 4, when: { outputMode: 'FIELD' } }
  },
  apply(src, dst, w, h, p, ctx, modulate) {
    // Resolve stroke level from colour mode
    let strokeLvl = p.strokeLevel;
    if (p.strokeColourMode === 'RGB') {
      strokeLvl = Math.round(0.299 * p.strokeR + 0.587 * p.strokeG + 0.114 * p.strokeB);
    }
    dst.set(contourRGBA(src, w, h, p.levels, p.strokeW, strokeLvl, p.blendAmt));
  }
});
