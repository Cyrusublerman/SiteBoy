import { createEffectModule } from '../../core/EffectModule.js';
import { otsuThreshold } from '../../../../../shared/algorithms/segmentation/thresholding.js';

export const OtsuThresholdNode = createEffectModule({
  type: 'otsuthreshold',
  name: 'OTSU THRESH',
  category: 'SEGMENTATION',
  params: {
    mode:     { label: 'MODE',             type: 'select', options: ['BINARY', 'MASK', 'SOFT MASK', 'FIELD'], value: 'BINARY', tier: 3 },
    invert:   { label: 'INVERT',           type: 'toggle', value: false, tier: 3 },
    domain:   { label: 'INPUT DOMAIN',     type: 'select', options: ['LUMINANCE', 'RED', 'GREEN', 'BLUE', 'SATURATION', 'CHROMA', 'GRADIENT', 'EXTERNAL'], value: 'LUMINANCE', tier: 3 },
    offset:   { label: 'THRESHOLD OFFSET', min: -128, max: 128, step: 1, value: 0, tier: 3, driveable: true, unit: '' },
    softness: { label: 'SOFTNESS',         min: 0, max: 64, step: 1, value: 8, tier: 3, driveable: true, unit: '', when: { param: 'mode', equals: 'SOFT MASK' } }
  },
  apply(src, dst, w, h, p, ctx, modulate) {
    const _m_offset = Math.round(modulate('offset', 0));
    const _m_softness = Math.round(modulate('softness', 0));
    const n = w * h;
    const domain = p.domain ?? 'LUMINANCE';
    const luma = new Uint8Array(n);

    if (domain === 'GRADIENT') {
      const tmp = new Uint8Array(n);
      for (let i = 0; i < n; i++) {
        const j = i * 4;
        tmp[i] = Math.round(src[j] * 0.299 + src[j + 1] * 0.587 + src[j + 2] * 0.114);
      }
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = y * w + x;
          const xp = y * w + Math.min(x + 1, w - 1), xm = y * w + Math.max(x - 1, 0);
          const yp = Math.min(y + 1, h - 1) * w + x, ym = Math.max(y - 1, 0) * w + x;
          const gx = tmp[xp] - tmp[xm], gy = tmp[yp] - tmp[ym];
          luma[i] = Math.min(255, Math.round(Math.sqrt(gx * gx + gy * gy) * 0.5));
        }
      }
    } else {
      for (let i = 0; i < n; i++) {
        const j = i * 4;
        const r = src[j], g = src[j + 1], b = src[j + 2];
        if (domain === 'RED')   { luma[i] = r; }
        else if (domain === 'GREEN') { luma[i] = g; }
        else if (domain === 'BLUE')  { luma[i] = b; }
        else if (domain === 'SATURATION') {
          const max = Math.max(r, g, b), min = Math.min(r, g, b);
          luma[i] = max === 0 ? 0 : Math.round((max - min) / max * 255);
        } else if (domain === 'CHROMA') {
          const l = Math.round(r * 0.299 + g * 0.587 + b * 0.114);
          luma[i] = Math.min(255, Math.round(Math.sqrt((r - l) ** 2 + (g - l) ** 2 + (b - l) ** 2) / Math.SQRT2));
        } else {
          luma[i] = Math.round(r * 0.299 + g * 0.587 + b * 0.114);
        }
      }
    }

    const { threshold: t } = otsuThreshold(luma);
    const tEff = Math.max(0, Math.min(255, t + (_m_offset ?? 0)));
    const mode = p.mode;
    const softness = Math.max(1, _m_softness ?? 8);

    for (let i = 0; i < n; i++) {
      const j = i * 4;
      if (mode === 'SOFT MASK') {
        let s = 1 / (1 + Math.exp(-(luma[i] - tEff) * softness / 16));
        if (p.invert) s = 1 - s;
        dst[j] = src[j] * s; dst[j + 1] = src[j + 1] * s; dst[j + 2] = src[j + 2] * s;
      } else {
        let bit = luma[i] > tEff ? 1 : 0;
        if (p.invert) bit = 1 - bit;
        if (mode === 'MASK') {
          dst[j] = src[j] * bit; dst[j + 1] = src[j + 1] * bit; dst[j + 2] = src[j + 2] * bit;
        } else {
          const v = bit * 255; dst[j] = v; dst[j + 1] = v; dst[j + 2] = v;
        }
      }
      dst[j + 3] = src[j + 3];
    }
  }
});
