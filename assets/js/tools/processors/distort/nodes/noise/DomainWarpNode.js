import { createEffectModule } from '../../core/EffectModule.js';
import { PerlinNoise } from '../../core/PerlinNoise.js';
import { wgsl, glsl, gpuBindings as _gpuBindings } from '../../shaders/domainwarp.shader.js';

function _bilerp(src, w, h, fx, fy, dst, oi) {
  const x0 = Math.floor(fx), y0 = Math.floor(fy);
  const dx = fx - x0, dy = fy - y0;
  const cx0 = Math.max(0, Math.min(w - 1, x0)), cx1 = Math.max(0, Math.min(w - 1, x0 + 1));
  const cy0 = Math.max(0, Math.min(h - 1, y0)), cy1 = Math.max(0, Math.min(h - 1, y0 + 1));
  const i00 = (cy0 * w + cx0) * 4, i10 = (cy0 * w + cx1) * 4;
  const i01 = (cy1 * w + cx0) * 4, i11 = (cy1 * w + cx1) * 4;
  const w00 = (1 - dx) * (1 - dy), w10 = dx * (1 - dy), w01 = (1 - dx) * dy, w11 = dx * dy;
  dst[oi]     = src[i00] * w00 + src[i10] * w10 + src[i01] * w01 + src[i11] * w11;
  dst[oi + 1] = src[i00 + 1] * w00 + src[i10 + 1] * w10 + src[i01 + 1] * w01 + src[i11 + 1] * w11;
  dst[oi + 2] = src[i00 + 2] * w00 + src[i10 + 2] * w10 + src[i01 + 2] * w01 + src[i11 + 2] * w11;
  dst[oi + 3] = src[i00 + 3] * w00 + src[i10 + 3] * w10 + src[i01 + 3] * w01 + src[i11 + 3] * w11;
}

export const DomainWarpNode = createEffectModule({
  type: 'domainwarp',
  name: 'DOMAIN WARP',
  category: 'NOISE',
  params: {
    strength: { label: 'STRENGTH', min: 0,   max: 200, step: 1,   value: 30,  tier: 3, previewMax: 50, unit: 'px', driveable: true },
    scale:    { label: 'SCALE',    min: 0.1, max: 20,  step: 0.1, value: 3,   tier: 3, previewMax: 8, driveable: true, unit: 'n' },
    octaves:  { label: 'OCTAVES', min: 1,   max: 8,   step: 1,   value: 4,   tier: 4, previewMax: 4, driveable: true, unit: 'n' },
    layers:   { label: 'LAYERS',  min: 1,   max: 3,   step: 1,   value: 1,   tier: 5, previewMax: 2, driveable: true, unit: 'n' },
    fieldType:       { label: 'FIELD TYPE',       type: 'select', value: 'perlin',   options: ['perlin','simplex','fbm','ridged','turbulence','cellular','curl'], tier: 3 },
    target:          { label: 'TARGET',           type: 'select', value: 'spatial',  options: ['spatial','rgb','hue','saturation','lightness','alpha'], tier: 3 },
    directionalMode: { label: 'DIRECTIONAL MODE', type: 'select', value: 'scalar_xy', options: ['scalar_x','scalar_y','scalar_xy','gradient','curl','two_noise'], tier: 3 }
  },
  apply(src, dst, w, h, p, ctx, modulate) {
    const _m_octaves = Math.round(modulate('octaves', 0));
    const _m_layers = Math.round(modulate('layers', 0));
    const noise = new PerlinNoise(ctx?.nodeSeed ?? 42);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const strength = modulate('strength', i);
      const scale    = modulate('scale', i);
      let wx = x, wy = y;
      for (let l = 0; l < _m_layers; l++) {
        const sc = scale * Math.pow(2, l), str = strength / Math.pow(2, l);
        wx += noise.fbm(wx / w * sc, wy / h * sc, _m_octaves) * str;
        wy += noise.fbm(wx / w * sc + 5.2, wy / h * sc + 1.3, _m_octaves) * str;
      }
      _bilerp(src, w, h, wx, wy, dst, i * 4);
    }
  },
  wgsl,
  glsl,
  gpuBindings: _gpuBindings,
});
