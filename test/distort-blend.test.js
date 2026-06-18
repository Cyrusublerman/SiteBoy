/**
 * G13 blend-mode regression harness (E2)
 * Reference: SVG/CSS compositing in linear light; per-channel opacity blend.
 */
import { describe, it, expect } from 'vitest';
import { blendChannel, srgbByteToLinear, linearToSrgbByte } from '../assets/js/tools/processors/distort/core/Pipeline.js';

const TOL = 2;

function refBlend(base, layer, mode) {
  const bv = srgbByteToLinear(base);
  const lv = srgbByteToLinear(layer);
  let out;
  switch (mode) {
    case 'screen': out = 1 - (1 - bv) * (1 - lv); break;
    case 'multiply': out = bv * lv; break;
    case 'overlay':
      out = bv < 0.5 ? 2 * bv * lv : 1 - 2 * (1 - bv) * (1 - lv);
      break;
    case 'add': out = Math.min(1, bv + lv); break;
    case 'difference': out = Math.abs(bv - lv); break;
    case 'lighten': out = Math.max(bv, lv); break;
    case 'darken': out = Math.min(bv, lv); break;
    case 'softlight':
      out = bv < 0.5
        ? bv - (1 - 2 * lv) * bv * (1 - bv)
        : bv + (2 * lv - 1) * ((bv > 0.25 ? Math.sqrt(bv) : ((16 * bv - 12) * bv + 4) * bv) - bv);
      break;
    case 'hardlight':
      out = lv < 0.5 ? 2 * bv * lv : 1 - 2 * (1 - bv) * (1 - lv);
      break;
    case 'colordodge':
      out = lv >= 1 ? 1 : Math.min(1, bv / (1 - lv));
      break;
    case 'colorburn':
      out = lv <= 0 ? 0 : Math.max(0, 1 - (1 - bv) / lv);
      break;
    default:
      out = lv;
  }
  return linearToSrgbByte(out);
}

const MODES = [
  'normal', 'screen', 'multiply', 'overlay', 'add', 'difference',
  'lighten', 'darken', 'softlight', 'hardlight', 'colordodge', 'colorburn',
];

const PAIRS = [
  [0, 0], [255, 255], [128, 64], [64, 192], [200, 50], [10, 240], [127, 128],
];

describe('G13 blend modes (Pipeline._blend)', () => {
  for (const mode of MODES) {
    it(`${mode} matches reference on fixed input pairs`, () => {
      for (const [base, layer] of PAIRS) {
        for (const opacity of [0, 0.5, 1]) {
          const got = blendChannel(base, layer, mode, opacity, 1);
          const fullRef = refBlend(base, layer, mode);
          const expected = opacity >= 1
            ? fullRef
            : linearToSrgbByte(srgbByteToLinear(base) * (1 - opacity) + srgbByteToLinear(fullRef) * opacity);
          expect(Math.abs(got - expected)).toBeLessThanOrEqual(TOL);
        }
      }
    });
  }

  it('mask scales opacity', () => {
    const a = blendChannel(100, 200, 'multiply', 1, 0.5);
    const b = blendChannel(100, 200, 'multiply', 0.5, 1);
    expect(Math.abs(a - b)).toBeLessThanOrEqual(TOL);
  });

  it('softlight: dark base stays near dark with bright layer', () => {
    const got = blendChannel(0, 255, 'softlight', 1, 1);
    expect(got).toBeLessThanOrEqual(2);
  });
});
