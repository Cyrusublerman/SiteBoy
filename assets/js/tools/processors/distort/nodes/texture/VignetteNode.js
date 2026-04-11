import { createEffectModule } from '../../core/EffectModule.js';

export const VignetteNode = createEffectModule({
  type: 'vignette',
  name: 'VIGNETTE',
  category: 'TEXTURE',
  params: {
    amount:     { label: 'AMOUNT',     min: 0,    max: 1,  step: 0.01, value: 0.5, tier: 3, driveable: true,  unit: '0–1' },
    softness:   { label: 'SOFTNESS',   min: 0.01, max: 1,  step: 0.01, value: 0.5, tier: 3, driveable: true,  unit: '0–1' },
    roundness:  { label: 'ROUNDNESS',  min: 0,    max: 1,  step: 0.01, value: 1,   tier: 4, driveable: true,  unit: '0–1' },
    centreX:    { label: 'CENTRE X',   min: 0,    max: 1,  step: 0.01, value: 0.5, tier: 3, driveable: true,  unit: '0–1' },
    centreY:    { label: 'CENTRE Y',   min: 0,    max: 1,  step: 0.01, value: 0.5, tier: 3, driveable: true,  unit: '0–1' },
    renderMode: { label: 'RENDER MODE', type: 'select', options: ['overlay', 'field'], value: 'overlay', tier: 3 }
  },
  apply(src, dst, w, h, p, ctx, modulate) {
    const cx  = p.centreX * w;
    const cy  = p.centreY * h;
    const maxWH = Math.max(w, h);
    const rx = p.roundness + (1 - p.roundness) * (w / maxWH);
    const ry = p.roundness + (1 - p.roundness) * (h / maxWH);
    const isField = p.renderMode === 'field';
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const pixelIdx = y * w + x;
        const i = pixelIdx * 4;
        const amount   = modulate('amount',   pixelIdx);
        const softness = Math.max(0.01, modulate('softness', pixelIdx));
        const dx  = (x - cx) / (cx || 1);
        const dy  = (y - cy) / (cy || 1);
        const dist  = Math.sqrt((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry));
        const edge  = 1 - softness;
        const v     = dist < edge ? 1 : Math.max(0, 1 - (dist - edge) / Math.max(0.001, softness));
        const factor = 1 - amount * (1 - v * v);
        if (isField) {
          const f = Math.round(factor * 255);
          dst[i] = dst[i + 1] = dst[i + 2] = f;
          dst[i + 3] = 255;
        } else {
          dst[i]     = src[i]     * factor;
          dst[i + 1] = src[i + 1] * factor;
          dst[i + 2] = src[i + 2] * factor;
          dst[i + 3] = src[i + 3];
        }
      }
    }
  }
});
