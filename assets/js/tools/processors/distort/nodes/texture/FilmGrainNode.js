import { createEffectModule } from '../../core/EffectModule.js';
import { filmGrain } from '../../../../../shared/algorithms/image/texture-overlays.js';

export const FilmGrainNode = createEffectModule({
  type: 'filmgrain',
  name: 'FILM GRAIN',
  category: 'TEXTURE',
  params: {
    frame: { label: 'FRAME', min: 0, max: 240, step: 1, value: 0, tier: 3, driveable: true, unit: 'frames' },
    amount: { label: 'AMOUNT', min: 0, max: 100, step: 1, value: 25, tier: 3, driveable: true, unit: 'n' },
    size: { label: 'SIZE', min: 1, max: 3, step: 1, value: 1, tier: 3, unit: 'px', driveable: true },
    lumResp: { label: 'LUM RESP', min: 0, max: 1, step: 0.01, value: 0.5, tier: 4, driveable: true, unit: '0–1' },
    chromatic: { label: 'CHROMATIC', type: 'toggle', value: false, tier: 4 },
    driftSpeed: { label: 'DRIFT SPD', min: 0, max: 5, step: 0.05, value: 1, tier: 4, unit: '0–1' },
    noiseType: { label: 'NOISE TYPE', value: 'white', tier: 6, type: 'internal' },
    seed: { label: 'SEED', value: 42, tier: 6, type: 'internal' },
    noiseScale: { label: 'N SCALE', value: 1, tier: 6, type: 'internal' },
    octaves: { label: 'OCTAVES', value: 4, tier: 6, type: 'internal' },
    temporalMode: { label: 'TIME', value: 'STATIC', tier: 6, type: 'internal' }
  },
  extendedControls: [
    {
      type: 'noise-source-control',
      paramKeys: {
        noiseType: 'noiseType',
        seed: 'seed',
        scale: 'noiseScale',
        octaves: 'octaves'
      }
    },
    {
      type: 'temporal-mode-control',
      paramKeys: { mode: 'temporalMode' }
    }
  ],
  apply(src, dst, w, h, p, ctx) {
    const nodeBase = ctx?.nodeSeed ?? 42;
    const frameK = (p.frame | 0) * 7919;
    const frame = ctx?.frame ?? 0;
    let effSeed = (p.seed !== undefined ? (p.seed | 0) + frameK : nodeBase + frameK);
    if (p.temporalMode === 'DRIFT') {
      effSeed += Math.floor(frame * (Number(p.driftSpeed) || 1)) * 9973;
    } else if (p.temporalMode === 'BAKED') {
      effSeed += (frame | 0) * 131;
    }
    dst.set(filmGrain(src, w, h, p.amount, p.size, p.lumResp, p.chromatic, effSeed, {
      noiseType: p.noiseType || 'white',
      scale: typeof p.noiseScale === 'number' ? p.noiseScale : 1,
      octaves: typeof p.octaves === 'number' ? p.octaves : 4
    }));
  }
});
