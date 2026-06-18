import { createEffectModule } from '../../core/EffectModule.js';
import { applyStaticDisplacement } from '../../../../../shared/algorithms/line/static-line-engine.js';
import { vectorToRaster } from '../bridge/node-adapters.js';

function _lumAt(lum, w, h, cx, cy) {
  return lum[Math.max(0, Math.min(h - 1, Math.floor(cy))) * w + Math.max(0, Math.min(w - 1, Math.floor(cx)))];
}

export const StaticHalftoneNode = createEffectModule({
  type: 'statichalftone',
  name: 'STATIC HALFTONE',
  category: 'LINE',
  isVector: true,
  params: {
    frame:         { label: 'FRAME',      min: 0, max: 240,  step: 1,    value: 0,   tier: 3, driveable: true, unit: 'frames' },
    spacing:       { label: 'SPACING',    min: 2, max: 40,   step: 1,    value: 6,   tier: 3, unit: 'px', driveable: true },
    maxAmplitude:  { label: 'MAX AMP',    min: 0.5, max: 30, step: 0.5,  value: 3,   tier: 3, unit: 'px', driveable: true },
    frequency:     { label: 'FREQUENCY',  min: 5, max: 300,  step: 1,    value: 60,  tier: 3, driveable: true, unit: 'cyc' },
    sampleStep:    { label: 'DENSITY',    min: 0.5, max: 5,  step: 0.25, value: 1,   tier: 4, driveable: true, unit: 'n' },
    phaseOffset:   { label: 'PHASE',      min: 0, max: 6.28, step: 0.01, value: 0,   tier: 4, driveable: true, unit: 'rad' },
    phaseInc:      { label: 'PHASE INC',  min: 0, max: 3.14, step: 0.01, value: 0,   tier: 5, driveable: true, unit: 'rad' },
    ampCurve:      { label: 'AMP CURVE',  type: 'select', options: ['LINEAR', 'EXPONENTIAL', 'LOGARITHMIC', 'SIGMOID'], value: 'LINEAR', tier: 4 },
    curveStrength: { label: 'CURVE STR',  min: 0.5, max: 5, step: 0.1,  value: 2,   tier: 5, driveable: true, unit: 'n', when: { param: 'ampCurve', notEquals: 'LINEAR' } },
    orientation:   { label: 'ORIENT',     type: 'select', options: ['HORIZONTAL', 'VERTICAL'], value: 'HORIZONTAL', tier: 3 },
    strokeW:       { label: 'STROKE W',   min: 0.25, max: 4, step: 0.25, value: 1,  tier: 3, unit: 'px', driveable: true },
    bgColor:       { label: 'BG LEVEL',   min: 0, max: 255, step: 1,   value: 255, tier: 4, driveable: true, unit: 'lvl' },
    strokeColor:   { label: 'STROKE LVL', min: 0, max: 255, step: 1,   value: 0,   tier: 4, driveable: true, unit: 'lvl' }
  },
  applyVector(src, w, h, p, _ctx) {
    const n = w * h, lum = new Float32Array(n);
    for (let i = 0; i < n; i++) { const j = i * 4; lum[i] = (0.2126 * src[j] + 0.7152 * src[j + 1] + 0.0722 * src[j + 2]) / 255; }
    const phaseOff = p.phaseOffset + p.frame * 0.02;
    const set = applyStaticDisplacement({
      width: w, height: h,
      luminanceAt: (cx, cy) => _lumAt(lum, w, h, cx, cy),
      lineSpacing: p.spacing, sampleStep: p.sampleStep,
      maxAmplitude: p.maxAmplitude, frequency: p.frequency,
      phaseOffset: phaseOff, phaseIncrement: p.phaseInc,
      ampCurve: p.ampCurve.toLowerCase(), ampCurveStrength: p.curveStrength,
      horizontal: p.orientation === 'HORIZONTAL', padding: 2
    });
    return { lines: set.lines, strokeRGBA: [p.strokeColor, p.strokeColor, p.strokeColor, 255], strokeWidth: p.strokeW, clearRGBA: [p.bgColor, p.bgColor, p.bgColor, 255] };
  },
  apply(src, dst, w, h, p, _ctx, _modulate) {
    const _m_frame = Math.round(modulate('frame', 0));
    const _m_spacing = Math.round(modulate('spacing', 0));
    const _m_maxAmplitude = modulate('maxAmplitude', 0);
    const _m_frequency = Math.round(modulate('frequency', 0));
    const _m_sampleStep = modulate('sampleStep', 0);
    const _m_phaseOffset = modulate('phaseOffset', 0);
    const _m_phaseInc = modulate('phaseInc', 0);
    const _m_curveStrength = modulate('curveStrength', 0);
    const _m_strokeW = modulate('strokeW', 0);
    const _m_bgColor = Math.round(modulate('bgColor', 0));
    const _m_strokeColor = Math.round(modulate('strokeColor', 0));
    const n = w * h, lum = new Float32Array(n);
    for (let i = 0; i < n; i++) { const j = i * 4; lum[i] = (0.2126 * src[j] + 0.7152 * src[j + 1] + 0.0722 * src[j + 2]) / 255; }
    const phaseOff = _m_phaseOffset + _m_frame * 0.02;
    const set = applyStaticDisplacement({
      width: w, height: h,
      luminanceAt: (cx, cy) => _lumAt(lum, w, h, cx, cy),
      lineSpacing: _m_spacing, sampleStep: _m_sampleStep,
      maxAmplitude: _m_maxAmplitude, frequency: _m_frequency,
      phaseOffset: phaseOff, phaseIncrement: _m_phaseInc,
      ampCurve: p.ampCurve.toLowerCase(), ampCurveStrength: _m_curveStrength,
      horizontal: p.orientation === 'HORIZONTAL', padding: 2
    });
    dst.set(vectorToRaster({
      basePixels: src, width: w, height: h, lines: set.lines,
      strokeRGBA: [_m_strokeColor, _m_strokeColor, _m_strokeColor, 255],
      strokeWidth: _m_strokeW,
      clearRGBA: [_m_bgColor, _m_bgColor, _m_bgColor, 255],
      opacity: 1
    }));
  },
  buildGeometry(w, h, p, _ctx, src) {
    if (!src || src.length < w * h * 4) return [];
    const n = w * h, lum = new Float32Array(n);
    for (let i = 0; i < n; i++) { const j = i * 4; lum[i] = (0.2126 * src[j] + 0.7152 * src[j + 1] + 0.0722 * src[j + 2]) / 255; }
    const phaseOff = p.phaseOffset + p.frame * 0.02;
    const set = applyStaticDisplacement({
      width: w, height: h,
      luminanceAt: (cx, cy) => _lumAt(lum, w, h, cx, cy),
      lineSpacing: p.spacing, sampleStep: p.sampleStep,
      maxAmplitude: p.maxAmplitude, frequency: p.frequency,
      phaseOffset: phaseOff, phaseIncrement: p.phaseInc,
      ampCurve: p.ampCurve.toLowerCase(), ampCurveStrength: p.curveStrength,
      horizontal: p.orientation === 'HORIZONTAL', padding: 2
    });
    return set.lines || [];
  }
});
