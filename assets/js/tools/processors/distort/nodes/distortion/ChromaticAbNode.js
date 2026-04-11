import { createEffectModule } from '../../core/EffectModule.js';

function _sampleChannel(src, w, h, fx, fy, ch, edgeMode, nearest) {
  if (nearest) {
    const sx = Math.round(fx), sy = Math.round(fy);
    let cx, cy;
    if (edgeMode === 'mirror') {
      cx = sx < 0 ? -sx : sx >= w ? 2 * w - 2 - sx : sx;
      cy = sy < 0 ? -sy : sy >= h ? 2 * h - 2 - sy : sy;
      cx = Math.max(0, Math.min(w - 1, cx));
      cy = Math.max(0, Math.min(h - 1, cy));
    } else if (edgeMode === 'wrap') {
      cx = ((sx % w) + w) % w;
      cy = ((sy % h) + h) % h;
    } else if (edgeMode === 'transparent') {
      if (sx < 0 || sx >= w || sy < 0 || sy >= h) return 0;
      cx = sx; cy = sy;
    } else {
      cx = Math.max(0, Math.min(w - 1, sx));
      cy = Math.max(0, Math.min(h - 1, sy));
    }
    return src[(cy * w + cx) * 4 + ch];
  }
  const x0 = Math.floor(fx), y0 = Math.floor(fy);
  const dx = fx - x0, dy = fy - y0;
  function clampCoord(v, max) {
    if (edgeMode === 'mirror') { v = v < 0 ? -v : v >= max ? 2 * max - 2 - v : v; return Math.max(0, Math.min(max - 1, v)); }
    if (edgeMode === 'wrap') return ((v % max) + max) % max;
    return Math.max(0, Math.min(max - 1, v));
  }
  function oob(cx, cy) {
    return edgeMode === 'transparent' && (cx < 0 || cx >= w || cy < 0 || cy >= h);
  }
  const cx0 = x0, cx1 = x0 + 1, cy0 = y0, cy1 = y0 + 1;
  const s00 = oob(cx0, cy0) ? 0 : src[(clampCoord(cy0, h) * w + clampCoord(cx0, w)) * 4 + ch];
  const s10 = oob(cx1, cy0) ? 0 : src[(clampCoord(cy0, h) * w + clampCoord(cx1, w)) * 4 + ch];
  const s01 = oob(cx0, cy1) ? 0 : src[(clampCoord(cy1, h) * w + clampCoord(cx0, w)) * 4 + ch];
  const s11 = oob(cx1, cy1) ? 0 : src[(clampCoord(cy1, h) * w + clampCoord(cx1, w)) * 4 + ch];
  return s00 * (1 - dx) * (1 - dy) + s10 * dx * (1 - dy) + s01 * (1 - dx) * dy + s11 * dx * dy;
}

function _applyFalloff(t, curve) {
  if (curve === 'linear')     return t;
  if (curve === 'quadratic')  return t * t;
  if (curve === 'cubic')      return t * t * t;
  if (curve === 'smoothstep') return t * t * (3 - 2 * t);
  return t;
}

export const ChromaticAbNode = createEffectModule({
  type: 'chromaticab', name: 'CHROMATIC AB', category: 'DISTORTION',
  params: {
    strength:     { value: 4,   min: 0, max: 50, step: 0.5, label: 'STRENGTH',    tier: 3, driveable: true, unit: 'px' },
    redScale:     { value: 1,   min: -2, max: 2, step: 0.05, label: 'RED SCALE',  tier: 3, driveable: true, unit: '×' },
    greenScale:   { value: 0,   min: -1, max: 1, step: 0.05, label: 'GREEN SCALE',tier: 3, driveable: true, unit: '×' },
    blueScale:    { value: -1,  min: -2, max: 2, step: 0.05, label: 'BLUE SCALE', tier: 3, driveable: true, unit: '×' },
    centreX:      { value: 0.5, min: 0, max: 1,  step: 0.01, label: 'CENTRE X',   tier: 4, driveable: true, unit: '0–1' },
    centreY:      { value: 0.5, min: 0, max: 1,  step: 0.01, label: 'CENTRE Y',   tier: 4, driveable: true, unit: '0–1' },
    falloff:      { value: 'quadratic', type: 'select', options: ['linear','quadratic','cubic','smoothstep'], label: 'FALLOFF',      tier: 4 },
    edgeMode:     { value: 'clamp',     type: 'select', options: ['clamp','mirror','wrap','transparent'],    label: 'EDGE MODE',    tier: 4 },
    samplingMode: { value: 'bilinear',  type: 'select', options: ['nearest','bilinear'],                     label: 'SAMPLING MODE',tier: 4 },
    radiusNorm:   { value: 'corner distance', type: 'select', options: ['min dimension','max dimension','corner distance'], label: 'RADIUS NORM', tier: 4 }
  },
  apply(src, dst, w, h, p, ctx, modulate) {
    const nearest = p.samplingMode === 'nearest' || ctx?.quality === 'preview';
    let maxRadius;
    if (p.radiusNorm === 'min dimension') maxRadius = Math.min(w, h) / 2;
    else if (p.radiusNorm === 'max dimension') maxRadius = Math.max(w, h) / 2;
    else maxRadius = Math.sqrt(w * w + h * h) / 2;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const oi = i * 4;
      const cx = modulate('centreX', i) * w;
      const cy = modulate('centreY', i) * h;
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const t = maxRadius > 0 ? Math.min(dist / maxRadius, 1) : 0;
      const ft = _applyFalloff(t, p.falloff);
      const S = modulate('strength', i) * ft;
      const len = dist > 0 ? dist : 1;
      const nx = dx / len, ny = dy / len;
      const offsetR = S * modulate('redScale', i);
      const offsetG = S * modulate('greenScale', i);
      const offsetB = S * modulate('blueScale', i);
      dst[oi]     = _sampleChannel(src, w, h, x + nx * offsetR, y + ny * offsetR, 0, p.edgeMode, nearest);
      dst[oi + 1] = _sampleChannel(src, w, h, x + nx * offsetG, y + ny * offsetG, 1, p.edgeMode, nearest);
      dst[oi + 2] = _sampleChannel(src, w, h, x + nx * offsetB, y + ny * offsetB, 2, p.edgeMode, nearest);
      dst[oi + 3] = src[oi + 3];
    }
  }
});
