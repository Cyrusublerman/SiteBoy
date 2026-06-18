import { createEffectModule } from '../../core/EffectModule.js';
import { SeededRNG } from '../../core/SeededRNG.js';
import { runGenerativePainter } from '../../../../../shared/algorithms/painter/generative-painter.js';

export const PaintStrokeNode = createEffectModule({
  type: 'paintstroke',
  name: 'PAINT STROKE',
  category: 'GENERATIVE',
  forceWorkerPreview: true,
  params: {
    brushMin:    { label: 'BRUSH MIN',   min: 1,     max: 100,   step: 1,     value: 10,    tier: 3, unit: 'px', driveable: true },
    brushMax:    { label: 'BRUSH MAX',   min: 2,     max: 200,   step: 1,     value: 50,    tier: 3, unit: 'px', driveable: true },
    minOpacity:  { label: 'MIN OPAC',    min: 1,     max: 255,   step: 1,     value: 10,    tier: 3, unit: 'lvl', driveable: true },
    maxOpacity:  { label: 'MAX OPAC',    min: 1,     max: 255,   step: 1,     value: 50,    tier: 3, unit: 'lvl', driveable: true },
    passCount:   { label: 'PASSES',      min: 1,     max: 10000,  step: 1,     value: 1,     tier: 3, unit: 'n',
      when: { param: 'painterMode', in: ['STROKE', 'FLOW STROKE', 'PATCH', 'PALETTE RECONSTRUCTION'] } },
    iterations:  { label: 'STROKES/PASS', min: 0,    max: 200000, step: 1,     value: 5000,  tier: 3, previewMax: 50000, unit: 'n' },
    maxAverageLayers: { label: 'AVG LAYERS', min: 0, max: 9999, step: 1, value: 15, tier: 4, unit: 'n' },
    maxPixelLayers:   { label: 'PIX LAYERS', min: 0, max: 9999, step: 1, value: 20, tier: 4, unit: 'n' },
    paletteMode: { label: 'PALETTE', type: 'select',
      options: ['CUSTOM', 'SOURCE', 'EXTRACT', 'GREYSCALE', 'WARM', 'COOL'], value: 'SOURCE', tier: 4 },
    paletteColours: { label: 'PALETTE HEX', type: 'internal', value: '["#000000","#ffffff","#ff0000"]', tier: 6 },
    backgroundColour: { label: 'BG COLOUR', type: 'internal', value: '#000000', tier: 6 },
    extractCount: { label: 'EXTRACT N', min: 4, max: 32, step: 1, value: 12, tier: 5, unit: 'n',
      when: { param: 'paletteMode', equals: 'EXTRACT' } },

    weight: { label: 'WEIGHT', min: 0, max: 255, step: 1, value: 255, tier: 4, unit: 'lvl', driveable: true },
    weightSource: { label: 'WT SOURCE', type: 'select',
      options: ['NONE', 'DRIVER', 'MASK', 'SOURCE LUM'], value: 'NONE', tier: 4 },
    weightMode: { label: 'WT MODE', type: 'select',
      options: ['REJECT', 'PROBABILITY', 'SCALE OPACITY', 'SCALE SIZE'], value: 'REJECT', tier: 4,
      when: { param: 'weightSource', in: ['DRIVER', 'MASK', 'SOURCE LUM'] } },

    painterMode: { label: 'PAINTER MODE', type: 'select',
      options: ['DOT', 'STROKE', 'FLOW STROKE', 'PATCH', 'PALETTE RECONSTRUCTION'],
      value: 'DOT', tier: 3 },

    brushShape: { label: 'BRUSH SHAPE', type: 'select',
      options: ['RADIAL GRADIENT', 'SOFT DAB', 'HARD DAB', 'ELLIPSE', 'BRISTLE', 'RIBBON', 'DRY BRUSH'],
      value: 'RADIAL GRADIENT', tier: 3,
      when: { param: 'painterMode', in: ['STROKE', 'FLOW STROKE', 'PATCH', 'PALETTE RECONSTRUCTION'] } },
    brushHardness: { label: 'HARDNESS', min: 0, max: 1, step: 0.01, value: 0.75, tier: 3, unit: 'normalised', driveable: true,
      when: [
        { param: 'painterMode', in: ['STROKE', 'FLOW STROKE', 'PATCH', 'PALETTE RECONSTRUCTION'] },
        { param: 'brushShape', in: ['SOFT DAB', 'ELLIPSE', 'BRISTLE', 'RIBBON'] },
      ] },
    brushLength: { label: 'LENGTH', min: 1, max: 200, step: 1, value: 20, tier: 3, unit: 'px', driveable: true,
      when: [
        { param: 'painterMode', in: ['STROKE', 'FLOW STROKE', 'PATCH', 'PALETTE RECONSTRUCTION'] },
        { param: 'brushShape', in: ['ELLIPSE', 'BRISTLE', 'RIBBON'] },
      ] },
    brushJitter: { label: 'JITTER', min: 0, max: 100, step: 1, value: 5, tier: 3, unit: 'px', driveable: true,
      when: { param: 'painterMode', in: ['STROKE', 'FLOW STROKE', 'PATCH', 'PALETTE RECONSTRUCTION'] } },

    placementMode: { label: 'PLACEMENT', type: 'select',
      options: ['RANDOM', 'WEIGHTED RANDOM', 'ERROR DRIVEN', 'EDGE DRIVEN', 'GRADIENT DRIVEN', 'SALIENCY DRIVEN', 'STRATIFIED'],
      value: 'RANDOM', tier: 3,
      when: { param: 'painterMode', in: ['STROKE', 'FLOW STROKE', 'PATCH', 'PALETTE RECONSTRUCTION'] } },

    directionSource: { label: 'DIRECTION', type: 'select',
      options: ['NONE', 'GRADIENT ANGLE', 'EDGE TANGENT', 'FLOW FIELD', 'MANUAL ANGLE'],
      value: 'NONE', tier: 3,
      when: { param: 'painterMode', in: ['STROKE', 'FLOW STROKE', 'PATCH', 'PALETTE RECONSTRUCTION'] } },
    manualAngle: { label: 'ANGLE', min: 0, max: 360, step: 1, value: 0, tier: 3, unit: '°', driveable: true,
      when: { param: 'directionSource', equals: 'MANUAL ANGLE' } },
    strokeAngleJitter: { label: 'ANGLE JITTER', min: 0, max: 180, step: 1, value: 0, tier: 3, unit: '°', driveable: true,
      when: { param: 'painterMode', in: ['STROKE', 'FLOW STROKE', 'PATCH', 'PALETTE RECONSTRUCTION'] } },

    overshoot:     { label: 'OVERSHOOT', min: 1, max: 16, step: 0.1, value: 2, tier: 4, unit: '×', driveable: true,
      when: { param: 'painterMode', in: ['STROKE', 'FLOW STROKE', 'PATCH', 'PALETTE RECONSTRUCTION'] } },
    paletteBlend:  { label: 'PAL BLEND', min: 0, max: 1, step: 0.01, value: 0, tier: 4, unit: 'normalised', driveable: true },
    colourJitter:  { label: 'COL JITTER', min: 0, max: 255, step: 1, value: 0, tier: 4, unit: 'lvl', driveable: true },
    colourDistance: { label: 'DIST', type: 'select', options: ['rgbSquared', 'lumaOnly'], value: 'rgbSquared', tier: 5 },
    alphaAssumption: { label: 'ALPHA SIM', type: 'select', options: ['midpoint', 'expected'], value: 'midpoint', tier: 5 },
    coverageModel: { label: 'ACCUM', type: 'select', options: ['brushAreaApprox', 'trueAccumulation'], value: 'brushAreaApprox', tier: 5 },

    coverageTarget: { label: 'COVERAGE', min: 0, max: 1, step: 0.01, value: 1, tier: 4, unit: 'normalised',
      when: { param: 'painterMode', in: ['STROKE', 'FLOW STROKE', 'PATCH', 'PALETTE RECONSTRUCTION'] } },
    errorThreshold: { label: 'ERR THRESH', min: 0, max: 255, step: 1, value: 0, tier: 4, unit: 'lvl',
      when: { param: 'painterMode', in: ['STROKE', 'FLOW STROKE', 'PATCH', 'PALETTE RECONSTRUCTION'] } },
    outputMode: { label: 'OUTPUT', type: 'select', options: ['raster', 'raster+strokes', 'raster+debug'], value: 'raster', tier: 5 },
    strokeLogLimit: { label: 'LOG MAX', min: 0, max: 50000, step: 100, value: 5000, tier: 5, unit: 'n',
      when: { param: 'outputMode', in: ['raster+strokes', 'raster+debug'] } },

    edgeInfluence: { label: 'EDGE INF', min: 0, max: 1, step: 0.01, value: 0, tier: 4, unit: 'normalised', driveable: true,
      when: { param: 'placementMode', in: ['WEIGHTED RANDOM', 'ERROR DRIVEN', 'EDGE DRIVEN', 'GRADIENT DRIVEN', 'SALIENCY DRIVEN'] } },
    contrastInfluence: { label: 'CONTRAST INF', min: 0, max: 1, step: 0.01, value: 0, tier: 4, unit: 'normalised', driveable: true,
      when: { param: 'placementMode', in: ['WEIGHTED RANDOM', 'ERROR DRIVEN', 'EDGE DRIVEN', 'GRADIENT DRIVEN', 'SALIENCY DRIVEN'] } },
    luminanceInfluence: { label: 'LUM INF', min: 0, max: 1, step: 0.01, value: 0, tier: 4, unit: 'normalised', driveable: true,
      when: { param: 'placementMode', in: ['WEIGHTED RANDOM', 'ERROR DRIVEN', 'EDGE DRIVEN', 'GRADIENT DRIVEN', 'SALIENCY DRIVEN'] } },
  },

  extendedControls: [
    {
      type: 'color-input',
      options: { label: 'BG COLOUR' },
      paramKeys: { value: 'backgroundColour' },
    },
    {
      type: 'paint-palette-control',
      paramKeys: { colours: 'paletteColours' },
      when: { param: 'paletteMode', equals: 'CUSTOM' },
    },
  ],

  apply(src, dst, w, h, p, ctx, modulate) {
    const _m_brushMin = Math.round(modulate('brushMin', 0));
    const _m_brushMax = Math.round(modulate('brushMax', 0));
    const _m_minOpacity = Math.round(modulate('minOpacity', 0));
    const _m_maxOpacity = Math.round(modulate('maxOpacity', 0));
    const _m_passCount = Math.round(modulate('passCount', 0));
    const _m_iterations = Math.round(modulate('iterations', 0));
    const _m_maxAverageLayers = Math.round(modulate('maxAverageLayers', 0));
    const _m_maxPixelLayers = Math.round(modulate('maxPixelLayers', 0));
    const _m_extractCount = Math.round(modulate('extractCount', 0));
    const _m_brushHardness = modulate('brushHardness', 0);
    const _m_brushLength = Math.round(modulate('brushLength', 0));
    const _m_brushJitter = Math.round(modulate('brushJitter', 0));
    const _m_manualAngle = Math.round(modulate('manualAngle', 0));
    const _m_strokeAngleJitter = Math.round(modulate('strokeAngleJitter', 0));
    const _m_overshoot = modulate('overshoot', 0);
    const _m_paletteBlend = modulate('paletteBlend', 0);
    const _m_colourJitter = Math.round(modulate('colourJitter', 0));
    const _m_coverageTarget = modulate('coverageTarget', 0);
    const _m_errorThreshold = Math.round(modulate('errorThreshold', 0));
    const _m_strokeLogLimit = modulate('strokeLogLimit', 0);
    const _m_edgeInfluence = modulate('edgeInfluence', 0);
    const _m_contrastInfluence = modulate('contrastInfluence', 0);
    const _m_luminanceInfluence = modulate('luminanceInfluence', 0);
    const seed = ctx?.nodeSeed ?? 42;
    const rng = new SeededRNG(seed);

    const wp = {
      ...p,
      brushMin: Math.min(_m_brushMin, _m_brushMax),
      brushMax: Math.max(_m_brushMin + 1, _m_brushMax),
      backgroundColour: p.backgroundColour ?? '#000000',
      paletteColours: p.paletteColours,
    };

    wp.iterations = Math.max(1, _m_iterations ?? 5000);

    const strokes = (p.outputMode === 'raster+strokes' || p.outputMode === 'raster+debug') ? [] : null;
    const debug = p.outputMode === 'raster+debug' ? {} : null;

    runGenerativePainter(src, dst, w, h, wp, {
      rng,
      seed,
      modulate: (key, pidx) => modulate(key, pidx),
      maskData: ctx?.maskData ?? null,
      getDriverWeight: (pidx) => modulate('weight', pidx),
      strokes,
      debug,
    });
  },
});
