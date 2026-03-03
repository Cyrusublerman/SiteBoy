/**
 * @fileoverview Geometric distortion algorithms — band shift, spherize, twirl,
 *   chromatic aberration, lens bubbles.
 *
 * All functions operate on Uint8ClampedArray RGBA buffers.
 * Coordinate sampling uses nearest-neighbour by default; pass a bilinear helper for better quality.
 *
 * @source DISTORT image pipeline reference (src/nodes/warp/, src/nodes/distortion/, src/nodes/refraction/)
 * @wikipedia https://en.wikipedia.org/wiki/Spherical_aberration
 *   https://en.wikipedia.org/wiki/Chromatic_aberration
 *   https://en.wikipedia.org/wiki/Twirl_(image_distortion)
 * @formula
 *   spherize: newR = t^(1+amount) * r (power > 1 = barrel); scale = newR / dist
 *   twirl: twist = (1-t)^2 * maxAngle; apply rotation matrix at (x,y) around centre
 *   chromaticAb: rOff = t * redShift; bOff = t * blueShift; shift along radial vector
 *   bandShift: off[band] = f(t); dest(x,y) = src(x+off, y) or src(x, y+off)
 *   lensBubbles: inside bubble r: m = 1 + (magnify-1)*edge*(1-t^2); src = centre + delta/m
 */

// ── Helpers ─────────────────────────────────────────────────────────────────

function sampleNearest(src, w, h, fx, fy) {
  const sx = Math.max(0, Math.min(w - 1, Math.round(fx)));
  const sy = Math.max(0, Math.min(h - 1, Math.round(fy)));
  return (sy * w + sx) * 4;
}

function _bilinearDst(src, w, h, fx, fy, dst, i) {
  const x0 = Math.floor(fx), y0 = Math.floor(fy);
  const dx = fx - x0, dy = fy - y0;
  const cx0 = x0 < 0 ? 0 : x0 >= w ? w - 1 : x0;
  const cx1 = x0 + 1 >= w ? w - 1 : x0 + 1 < 0 ? 0 : x0 + 1;
  const cy0 = y0 < 0 ? 0 : y0 >= h ? h - 1 : y0;
  const cy1 = y0 + 1 >= h ? h - 1 : y0 + 1 < 0 ? 0 : y0 + 1;
  const i00 = (cy0 * w + cx0) * 4, i10 = (cy0 * w + cx1) * 4;
  const i01 = (cy1 * w + cx0) * 4, i11 = (cy1 * w + cx1) * 4;
  const idx = 1 - dx, idy = 1 - dy;
  const w00 = idx * idy, w10 = dx * idy, w01 = idx * dy, w11 = dx * dy;
  dst[i]     = src[i00] * w00 + src[i10] * w10 + src[i01] * w01 + src[i11] * w11;
  dst[i + 1] = src[i00 + 1] * w00 + src[i10 + 1] * w10 + src[i01 + 1] * w01 + src[i11 + 1] * w11;
  dst[i + 2] = src[i00 + 2] * w00 + src[i10 + 2] * w10 + src[i01 + 2] * w01 + src[i11 + 2] * w11;
  dst[i + 3] = src[i00 + 3] * w00 + src[i10 + 3] * w10 + src[i01 + 3] * w01 + src[i11 + 3] * w11;
}

/** LCG RNG, values in [0, 1). */
function lcgRng(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0x100000000; };
}

// ── Band Shift ───────────────────────────────────────────────────────────────

/**
 * Shift image rows or columns by a per-band offset.
 * Offset pattern: 'sine', 'stepped', or provided via `noiseFn(t, phase)`.
 *
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {object} [opts={}]
 * @param {'horizontal'|'vertical'} [opts.axis='horizontal']
 * @param {number} [opts.bandSize=20] - Height/width of each band in pixels
 * @param {number} [opts.intensity=30] - Maximum shift in pixels
 * @param {'sine'|'stepped'|'noise'} [opts.offsetType='noise']
 * @param {number} [opts.phase=0]
 * @param {number} [opts.freq=1]
 * @param {((t:number, phase:number)=>number)|null} [opts.noiseFn=null] - Used when offsetType='noise'
 * @param {number} [opts.seed=42]
 * @returns {Uint8ClampedArray} New buffer
 */
export function bandShift(src, w, h, opts = {}) {
  const { axis = 'horizontal', bandSize = 20, intensity = 30, offsetType = 'noise', phase = 0, freq = 1, noiseFn = null, seed = 42 } = opts;
  const rng = lcgRng(seed);
  const isH = axis === 'horizontal';
  const dim = isH ? h : w;
  const num = Math.ceil(dim / Math.max(1, bandSize));
  const off = new Float32Array(num);

  for (let b = 0; b < num; b++) {
    const t = b / num;
    if (offsetType === 'sine') {
      off[b] = Math.sin(t * freq * Math.PI * 2 + phase) * intensity;
    } else if (offsetType === 'stepped') {
      off[b] = (Math.round(rng() * 4) - 2) * intensity * 0.5;
    } else if (noiseFn) {
      off[b] = noiseFn(t * (opts.noiseScale || 2), phase) * intensity;
    } else {
      off[b] = Math.sin(t * freq * Math.PI * 2 + phase) * intensity;
    }
  }

  const dst = new Uint8ClampedArray(src.length);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const bi = Math.min(Math.floor((isH ? y : x) / Math.max(1, bandSize)), num - 1);
    const o = off[bi];
    const si = sampleNearest(src, w, h, isH ? x + o : x, isH ? y : y + o);
    const di = (y * w + x) * 4;
    dst[di] = src[si]; dst[di + 1] = src[si + 1]; dst[di + 2] = src[si + 2]; dst[di + 3] = src[si + 3];
  }
  return dst;
}

// ── Spherize ─────────────────────────────────────────────────────────────────

/**
 * Spherize — barrel (amount>0) or pincushion (amount<0) lens distortion.
 * Pixels within the radius are remapped using a power-law radial function.
 *
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} [amount=0.5] - [-1, 1]; >0 = barrel, <0 = pincushion
 * @param {number} [centreX=0.5] - Normalised
 * @param {number} [centreY=0.5]
 * @param {number} [radius=0.5] - Fraction of min(w,h)
 * @returns {Uint8ClampedArray} New buffer
 */
export function spherize(src, w, h, amount = 0.5, centreX = 0.5, centreY = 0.5, radius = 0.5, interpolation = 'bilinear') {
  const cx = centreX * w, cy = centreY * h;
  const r = radius * Math.min(w, h);
  const r2 = r * r;
  const dst = new Uint8ClampedArray(src.length);
  const useBilinear = interpolation !== 'nearest';

  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = x - cx, dy = y - cy;
    const dist2 = dx * dx + dy * dy;
    const di = (y * w + x) * 4;
    if (dist2 < r2) {
      const dist = Math.sqrt(dist2);
      const t = dist / r;
      const newR = amount > 0
        ? Math.pow(t, 1 + amount) * r
        : Math.pow(t, 1 / (1 - amount)) * r;
      const scale = dist > 0.001 ? newR / dist : 1;
      if (useBilinear) { _bilinearDst(src, w, h, cx + dx * scale, cy + dy * scale, dst, di); }
      else { const si = sampleNearest(src, w, h, cx + dx * scale, cy + dy * scale); dst[di] = src[si]; dst[di + 1] = src[si + 1]; dst[di + 2] = src[si + 2]; dst[di + 3] = src[si + 3]; }
    } else {
      dst[di] = src[di]; dst[di + 1] = src[di + 1]; dst[di + 2] = src[di + 2]; dst[di + 3] = src[di + 3];
    }
  }
  return dst;
}

// ── Twirl ────────────────────────────────────────────────────────────────────

/**
 * Twirl distortion — rotate pixels within a radius by an angle that falls off
 * quadratically from centre to edge.
 *
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} [angle=180] - Maximum twist angle in degrees at centre
 * @param {number} [centreX=0.5]
 * @param {number} [centreY=0.5]
 * @param {number} [radius=0.5] - Fraction of min(w,h)
 * @returns {Uint8ClampedArray} New buffer
 */
export function twirl(src, w, h, angle = 180, centreX = 0.5, centreY = 0.5, radius = 0.5, interpolation = 'bilinear') {
  const cx = centreX * w, cy = centreY * h;
  const r = radius * Math.min(w, h);
  const maxAngle = angle * Math.PI / 180;
  const dst = new Uint8ClampedArray(src.length);
  const useBilinear = interpolation !== 'nearest';

  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = x - cx, dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const di = (y * w + x) * 4;
    if (dist < r) {
      const t = 1 - dist / r;
      const twist = t * t * maxAngle;
      const cosT = Math.cos(twist), sinT = Math.sin(twist);
      const fx = cx + dx * cosT - dy * sinT, fy = cy + dx * sinT + dy * cosT;
      if (useBilinear) { _bilinearDst(src, w, h, fx, fy, dst, di); }
      else { const si = sampleNearest(src, w, h, fx, fy); dst[di] = src[si]; dst[di + 1] = src[si + 1]; dst[di + 2] = src[si + 2]; dst[di + 3] = src[si + 3]; }
    } else {
      dst[di] = src[di]; dst[di + 1] = src[di + 1]; dst[di + 2] = src[di + 2]; dst[di + 3] = src[di + 3];
    }
  }
  return dst;
}

// ── Chromatic Aberration ──────────────────────────────────────────────────────

/**
 * Radial chromatic aberration — shift R and B channels outward/inward from a centre point.
 * The shift magnitude scales linearly with normalised distance from centre.
 * G channel is unaffected.
 *
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} [redShift=2] - Pixel shift for red channel at maximum radius (signed)
 * @param {number} [blueShift=-2] - Pixel shift for blue channel
 * @param {number} [centreX=0.5]
 * @param {number} [centreY=0.5]
 * @returns {Uint8ClampedArray} New buffer
 */
export function chromaticAberration(src, w, h, redShift = 2, blueShift = -2, centreX = 0.5, centreY = 0.5) {
  const cx = centreX * w, cy = centreY * h;
  const maxDist = Math.sqrt(cx * cx + cy * cy) || 1;
  const dst = new Uint8ClampedArray(src.length);

  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = x - cx, dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const t = dist / maxDist;
    const ang = dist > 0.001 ? Math.atan2(dy, dx) : 0;
    const cosA = Math.cos(ang), sinA = Math.sin(ang);
    const i = (y * w + x) * 4;

    const rOff = t * redShift;
    const rx = Math.max(0, Math.min(w - 1, Math.round(x + cosA * rOff)));
    const ry = Math.max(0, Math.min(h - 1, Math.round(y + sinA * rOff)));
    dst[i] = src[(ry * w + rx) * 4];

    dst[i + 1] = src[i + 1];

    const bOff = t * blueShift;
    const bx = Math.max(0, Math.min(w - 1, Math.round(x + cosA * bOff)));
    const by = Math.max(0, Math.min(h - 1, Math.round(y + sinA * bOff)));
    dst[i + 2] = src[(by * w + bx) * 4 + 2];
    dst[i + 3] = src[i + 3];
  }
  return dst;
}

// ── Pixelate ─────────────────────────────────────────────────────────────────

/**
 * Mosaic pixelation — average each block of blockSize×blockSize pixels.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} [blockSize=8] - Block side length in pixels [2, 100]
 * @returns {Uint8ClampedArray}
 */
export function pixelate(src, w, h, blockSize = 8) {
  const bs = Math.max(2, blockSize);
  const dst = new Uint8ClampedArray(src.length);
  for (let by = 0; by < h; by += bs) {
    for (let bx = 0; bx < w; bx += bs) {
      let ar = 0, ag = 0, ab = 0, count = 0;
      const yEnd = Math.min(by + bs, h), xEnd = Math.min(bx + bs, w);
      for (let y = by; y < yEnd; y++) {
        for (let x = bx; x < xEnd; x++) {
          const i = (y * w + x) * 4;
          ar += src[i]; ag += src[i + 1]; ab += src[i + 2]; count++;
        }
      }
      ar = Math.round(ar / count); ag = Math.round(ag / count); ab = Math.round(ab / count);
      for (let y = by; y < yEnd; y++) {
        for (let x = bx; x < xEnd; x++) {
          const i = (y * w + x) * 4;
          dst[i] = ar; dst[i + 1] = ag; dst[i + 2] = ab; dst[i + 3] = src[i + 3];
        }
      }
    }
  }
  return dst;
}

// ── Polar Coordinate Remap ────────────────────────────────────────────────────

/**
 * Remap between rectangular and polar coordinate systems.
 * rectToPolar: row y = radius, col x = angle → maps to polar circle.
 * polarToRect: maps polar circle back to rectangular grid.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {'rectToPolar'|'polarToRect'} [mode='rectToPolar']
 * @param {number} [centreX=0.5] - Normalised polar centre X
 * @param {number} [centreY=0.5] - Normalised polar centre Y
 * @returns {Uint8ClampedArray}
 */
export function polarCoords(src, w, h, mode = 'rectToPolar', centreX = 0.5, centreY = 0.5) {
  const cx = centreX * w, cy = centreY * h;
  const maxR = Math.sqrt(cx * cx + cy * cy);
  const dst = new Uint8ClampedArray(src.length);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let fx, fy;
      if (mode === 'rectToPolar') {
        const r = (y / h) * maxR, a = (x / w) * Math.PI * 2;
        fx = cx + Math.cos(a) * r; fy = cy + Math.sin(a) * r;
      } else {
        const dx = x - cx, dy = y - cy;
        const r = Math.sqrt(dx * dx + dy * dy);
        const a = Math.atan2(dy, dx);
        fx = ((a + Math.PI) / (Math.PI * 2)) * w; fy = (r / maxR) * h;
      }
      const di = (y * w + x) * 4;
      _bilinearDst(src, w, h, fx, fy, dst, di);
    }
  }
  return dst;
}

// ── Lens Bubbles ─────────────────────────────────────────────────────────────

/**
 * Place randomised circular magnifying-lens bubbles over the image.
 * Inside each bubble, pixels are remapped with a radial magnification that
 * falls off to 1× at the bubble edge (controlled by edgeSoft).
 *
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {object} [opts={}]
 * @param {number} [opts.count=5]
 * @param {number} [opts.minRadius=0.03] - As fraction of diagonal
 * @param {number} [opts.maxRadius=0.12]
 * @param {number} [opts.magnification=1.5]
 * @param {number} [opts.edgeSoft=0.2] - Edge softness [0, 1]
 * @param {number} [opts.seed=42]
 * @returns {Uint8ClampedArray} New buffer
 */
export function lensBubbles(src, w, h, opts = {}) {
  const { count = 5, minRadius = 0.03, maxRadius = 0.12, magnification = 1.5, edgeSoft = 0.2, seed = 42 } = opts;
  const rng = lcgRng(seed);
  const diag = Math.sqrt(w * w + h * h);
  const bubbles = [];
  for (let i = 0; i < count; i++) {
    const r = (minRadius + rng() * (maxRadius - minRadius)) * diag;
    bubbles.push({ cx: rng() * w, cy: rng() * h, r });
  }

  const dst = new Uint8ClampedArray(src.length);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let sx = x, sy = y;
    for (const b of bubbles) {
      const dx = x - b.cx, dy = y - b.cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < b.r) {
        const t = dist / b.r;
        const se = edgeSoft > 0 ? Math.min(1, (1 - t) / edgeSoft) : 1;
        const m = 1 + (magnification - 1) * se * (1 - t * t);
        sx = b.cx + dx / m;
        sy = b.cy + dy / m;
        break;
      }
    }
    const si = sampleNearest(src, w, h, sx, sy);
    const di = (y * w + x) * 4;
    dst[di] = src[si]; dst[di + 1] = src[si + 1]; dst[di + 2] = src[si + 2]; dst[di + 3] = src[si + 3];
  }
  return dst;
}
