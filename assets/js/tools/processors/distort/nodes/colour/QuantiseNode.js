import { createEffectModule } from '../../core/EffectModule.js';
import {
  quantiseToPalette,
  ditherBayer,
  ditherFloydSteinberg,
  posterize,
  posterizeRGB,
  posterizeHSL
} from '../../../../../shared/algorithms/image/colour-adjustments.js';

const PALETTES = {
  '1-bit':     [[0,0,0],[255,255,255]],
  '2-bit':     [[0,0,0],[85,85,85],[170,170,170],[255,255,255]],
  '3-bit':     [[0,0,0],[255,0,0],[0,255,0],[255,255,0],[0,0,255],[255,0,255],[0,255,255],[255,255,255]],
  'gameboy':   [[15,56,15],[48,98,48],[139,172,15],[155,188,15]],
  'nes':       [[124,124,124],[0,0,252],[0,0,188],[68,40,188],[148,0,132],[168,0,32],[168,16,0],[136,20,0],
               [80,48,0],[0,120,0],[0,104,0],[0,88,0],[0,64,88],[0,0,0],[248,248,248],[255,255,255]],
  'pastel':    [[255,192,203],[230,230,250],[173,216,230],[152,255,152],[255,255,224],[255,218,185]],
  'c64':       [[0,0,0],[255,255,255],[136,0,0],[170,255,238],[204,68,204],[0,204,85],[0,0,170],[238,238,119],
               [221,136,85],[102,68,0],[255,119,119],[51,51,51],[119,119,119],[170,255,102],[0,136,255],[187,187,187]],
  'pico8':     [[0,0,0],[29,43,83],[126,37,83],[0,135,81],[171,82,54],[95,87,79],[194,195,199],[255,241,232],
               [255,0,77],[255,163,0],[255,236,39],[0,228,54],[41,173,255],[131,118,156],[255,119,168],[255,204,170]],
  'cga':       [[0,0,0],[0,170,170],[170,0,170],[170,170,170],[85,255,255],[255,85,255]],
  'gruvbox':   [[40,40,40],[204,36,29],[152,151,26],[215,153,33],[69,133,136],[177,98,134],[104,157,106],[168,153,132],
               [146,131,116],[251,73,52],[184,187,38],[250,189,47],[131,165,152],[211,134,155],[142,192,124],[235,219,178]]
};

const PALETTE_KEYS = Object.keys(PALETTES);

export const QuantiseNode = createEffectModule({
  type: 'quantise', name: 'QUANTISE', category: 'COLOUR / TONE',
  params: {
    mode:           { value: 'palette',         type: 'select', options: ['palette', 'posterise'], label: 'MODE',         tier: 3 },
    palette:        { value: '1-bit',            type: 'select', options: PALETTE_KEYS,             label: 'PALETTE',      tier: 3, when: { param: 'mode', equals: 'palette' } },
    ditherMode:     { value: 'none',             type: 'select', options: ['none', 'floyd-steinberg', 'bayer'], label: 'DITHER MODE', tier: 4, when: { param: 'mode', equals: 'palette' } },
    ditherStrength: { value: 1, min: 0, max: 2, step: 0.05,     label: 'STRENGTH',     tier: 4, driveable: true, unit: 'n', when: { param: 'ditherMode', notEquals: 'none' } },
    posteriseSpace: { value: 'rgb',              type: 'select', options: ['rgb', 'hsl'],           label: 'COLOUR SPACE', tier: 3, when: { param: 'mode', equals: 'posterise' } },
    rLevels:        { value: 4, min: 2, max: 32, step: 1, label: 'R LEVELS', tier: 4, driveable: true, unit: 'steps', when: { param: 'posteriseSpace', equals: 'rgb' } },
    gLevels:        { value: 4, min: 2, max: 32, step: 1, label: 'G LEVELS', tier: 4, driveable: true, unit: 'steps', when: { param: 'posteriseSpace', equals: 'rgb' } },
    bLevels:        { value: 4, min: 2, max: 32, step: 1, label: 'B LEVELS', tier: 4, driveable: true, unit: 'steps', when: { param: 'posteriseSpace', equals: 'rgb' } },
    hLevels:        { value: 4, min: 2, max: 32, step: 1, label: 'H LEVELS', tier: 4, driveable: true, unit: 'steps', when: { param: 'posteriseSpace', equals: 'hsl' } },
    sLevels:        { value: 4, min: 2, max: 32, step: 1, label: 'S LEVELS', tier: 4, driveable: true, unit: 'steps', when: { param: 'posteriseSpace', equals: 'hsl' } },
    lLevels:        { value: 4, min: 2, max: 32, step: 1, label: 'L LEVELS', tier: 4, driveable: true, unit: 'steps', when: { param: 'posteriseSpace', equals: 'hsl' } }
  },
  apply(src, dst, w, h, p, ctx, modulate) {
    const _m_ditherStrength = modulate('ditherStrength', 0);
    const _m_rLevels = Math.round(modulate('rLevels', 0));
    const _m_gLevels = Math.round(modulate('gLevels', 0));
    const _m_bLevels = Math.round(modulate('bLevels', 0));
    const _m_hLevels = Math.round(modulate('hLevels', 0));
    const _m_sLevels = Math.round(modulate('sLevels', 0));
    const _m_lLevels = Math.round(modulate('lLevels', 0));
    if (p.mode === 'posterise') {
      if (p.posteriseSpace === 'hsl') {
        dst.set(posterizeHSL(src, w, h, _m_hLevels, _m_sLevels, _m_lLevels));
      } else {
        dst.set(posterizeRGB(src, w, h, _m_rLevels, _m_gLevels, _m_bLevels));
      }
      return;
    }
    let result = quantiseToPalette(src, w, h, PALETTES[p.palette] ?? PALETTES['1-bit']);
    if (p.ditherMode === 'bayer') {
      result = ditherBayer(result, w, h, 2, _m_ditherStrength);
    } else if (p.ditherMode === 'floyd-steinberg') {
      result = ditherFloydSteinberg(result, w, h, 2, _m_ditherStrength);
    }
    dst.set(result);
  }
});
