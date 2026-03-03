import { createEffectModule } from '../../core/EffectModule.js';
import { paintStamp } from '../../../../../shared/algorithms/painter/brush-engine.js';
import { LayerTracker } from '../../../../../shared/algorithms/painter/layer-tracker.js';
import { SeededRNG } from '../../core/SeededRNG.js';

function _buildPalette(src, w, h, mode, rng) {
  if (mode === 'greyscale') return [[0, 0, 0], [64, 64, 64], [128, 128, 128], [192, 192, 192], [255, 255, 255]];
  if (mode === 'warm') return [[30, 10, 5], [120, 40, 20], [200, 100, 50], [240, 180, 100], [255, 230, 200]];
  if (mode === 'cool') return [[5, 10, 30], [20, 40, 120], [50, 100, 200], [100, 180, 240], [200, 230, 255]];
  const samples = Math.min(16, Math.max(8, Math.floor(w * h / 1000))), palette = [];
  for (let i = 0; i < samples; i++) {
    const x = rng.nextInt(0, w), y = rng.nextInt(0, h), si = (y * w + x) * 4;
    palette.push([src[si], src[si + 1], src[si + 2]]);
  }
  return palette;
}

export const PaintStrokeNode = createEffectModule({
  type: 'paintstroke',
  name: 'PAINT STROKE',
  category: 'GENERATIVE',
  params: {
    brushMin:    { label: 'BRUSH MIN',  min: 1,   max: 100,   step: 1,   value: 10,   tier: 3, unit: 'px' },
    brushMax:    { label: 'BRUSH MAX',  min: 2,   max: 200,   step: 1,   value: 50,   tier: 3, unit: 'px' },
    minOpacity:  { label: 'MIN OPAC',   min: 1,   max: 255,   step: 1,   value: 10,   tier: 3 },
    maxOpacity:  { label: 'MAX OPAC',   min: 1,   max: 255,   step: 1,   value: 50,   tier: 3 },
    iterations:  { label: 'STROKES',    min: 100, max: 50000, step: 100, value: 5000, tier: 3, previewMax: 1000 },
    maxLayers:   { label: 'MAX LAYERS', min: 1,   max: 50,    step: 1,   value: 15,   tier: 4 },
    paletteMode: { label: 'PALETTE',    type: 'select', options: ['SOURCE', 'GREYSCALE', 'WARM', 'COOL'], value: 'SOURCE', tier: 4 }
  },
  apply(src, dst, w, h, p, ctx) {
    const rng = new SeededRNG(ctx?.nodeSeed ?? 42);
    const iters = ctx?.quality === 'preview' ? Math.min(p.iterations, 1000) : p.iterations;
    const layers = new Float32Array(w * h);
    const totalPixels = w * h;
    let totalStrokes = 0;
    let buf = new Uint8ClampedArray(w * h * 4);
    for (let i = 3; i < buf.length; i += 4) buf[i] = 255;
    const tracker = new LayerTracker();
    const palette = _buildPalette(src, w, h, p.paletteMode.toLowerCase(), rng);

    for (let iter = 0; iter < iters; iter++) {
      const avgBrushR = (p.brushMin + p.brushMax) / 4;
      if ((totalStrokes * Math.PI * avgBrushR * avgBrushR) / totalPixels >= p.maxLayers) break;
      const x = rng.nextInt(0, w), y = rng.nextInt(0, h);
      if (layers[y * w + x] > p.maxLayers * 1.3) continue;
      const si = (y * w + x) * 4;
      const tr = src[si], tg = src[si + 1], tb = src[si + 2];
      const cr = buf[si], cg = buf[si + 1], cb = buf[si + 2];
      const alphaNorm = ((p.minOpacity + p.maxOpacity) / 2) / 255;
      let bestColor = null, bestDist = Infinity;
      for (const pc of palette) {
        const sr = cr + (pc[0] - cr) * alphaNorm, sg = cg + (pc[1] - cg) * alphaNorm, sb = cb + (pc[2] - cb) * alphaNorm;
        const d = (sr - tr) ** 2 + (sg - tg) ** 2 + (sb - tb) ** 2;
        if (d < bestDist) { bestDist = d; bestColor = pc; }
      }
      if (!bestColor) continue;
      const opacity = rng.nextRange(p.minOpacity, p.maxOpacity);
      const size = rng.nextRange(p.brushMin, p.brushMax);
      buf = paintStamp(buf, w, h, x, y, [bestColor[0], bestColor[1], bestColor[2], opacity], Math.max(1, Math.round(size / 2)), 0.75);
      const lr = Math.floor(size / 4);
      for (let py = Math.max(0, y - lr); py < Math.min(h, y + lr); py++)
        for (let px = Math.max(0, x - lr); px < Math.min(w, x + lr); px++) layers[py * w + px]++;
      totalStrokes++;
      if ((iter + 1) % 250 === 0) tracker.push(`iter-${iter + 1}`, buf, { iter: iter + 1 });
    }
    const flattened = tracker.flatten();
    dst.set(flattened || buf);
  }
});
