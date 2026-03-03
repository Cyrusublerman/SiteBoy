import { createEffectModule } from '../../core/EffectModule.js';
import { quantiseToPalette } from '../../../../../shared/algorithms/image/colour-adjustments.js';

const PALETTES = {
  '1-bit':   [[0,0,0],[255,255,255]],
  '2-bit':   [[0,0,0],[85,85,85],[170,170,170],[255,255,255]],
  '3-bit':   [[0,0,0],[255,0,0],[0,255,0],[255,255,0],[0,0,255],[255,0,255],[0,255,255],[255,255,255]],
  'gameboy': [[15,56,15],[48,98,48],[139,172,15],[155,188,15]],
  'nes':     [[124,124,124],[0,0,252],[0,0,188],[68,40,188],[148,0,132],[168,0,32],[168,16,0],[136,20,0],
              [80,48,0],[0,120,0],[0,104,0],[0,88,0],[0,64,88],[0,0,0],[248,248,248],[255,255,255]],
  'pastel':  [[255,192,203],[230,230,250],[173,216,230],[152,255,152],[255,255,224],[255,218,185]]
};

const PALETTE_KEYS = Object.keys(PALETTES);

export const QuantiseNode = createEffectModule({
  type: 'quantise', name: 'QUANTISE', category: 'COLOUR / TONE',
  params: {
    palette: { value: '1-bit', type: 'select', options: PALETTE_KEYS, label: 'PALETTE', tier: 3 }
  },
  apply(src, dst, w, h, p) {
    dst.set(quantiseToPalette(src, w, h, PALETTES[p.palette] ?? PALETTES['1-bit']));
  }
});
