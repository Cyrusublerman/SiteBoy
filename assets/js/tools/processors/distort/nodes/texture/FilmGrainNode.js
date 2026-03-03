import { createEffectModule } from '../../core/EffectModule.js';
import { filmGrain } from '../../../../../shared/algorithms/image/texture-overlays.js';

export const FilmGrainNode = createEffectModule({
  type: 'filmgrain',
  name: 'FILM GRAIN',
  category: 'TEXTURE',
  params: {
    amount:    { label: 'AMOUNT',    min: 0, max: 100, step: 1,    value: 25,  tier: 3, driveable: true },
    size:      { label: 'SIZE',      min: 1, max: 3,   step: 1,    value: 1,   tier: 3, unit: 'px' },
    lumResp:   { label: 'LUM RESP',  min: 0, max: 1,   step: 0.01, value: 0.5, tier: 4, driveable: true },
    chromatic: { label: 'CHROMATIC', type: 'toggle', value: false,             tier: 4 }
  },
  apply(src, dst, w, h, p, ctx) {
    dst.set(filmGrain(src, w, h, p.amount, p.size, p.lumResp, p.chromatic, ctx?.nodeSeed ?? 42));
  }
});
