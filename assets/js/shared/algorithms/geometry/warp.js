/**
 * @fileoverview Warp and refraction algorithms — flow field, band shift, advection,
 *   radial ripple, lens bubbles.
 *
 * All functions operate on RGBA Uint8ClampedArray buffers.
 * Noise and RNG are accepted as parameters so algorithms remain pure and testable.
 *
 * @source DISTORT image pipeline (nodes/warp/, nodes/refraction/)
 * @formula
 *   flow field: for each pixel, trace back through noise vector field N steps
 *   band shift: offset bands by noise/sine/stepped amount
 *   advection:  for each pixel, follow velocity field N steps backward
 *   ripple:     offset radially by sin(dist * freq) * amp * falloff
 *   lens:       magnify pixels inside each bubble radius
 */

// ── Sampling helpers ──────────────────────────────────────────────────────────

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

function _nearestDst(src, w, h, fx, fy, dst, i) {
  const x = Math.round(fx), y = Math.round(fy);
  const cx = x < 0 ? 0 : x >= w ? w - 1 : x;
  const cy = y < 0 ? 0 : y >= h ? h - 1 : y;
  const si = (cy * w + cx) * 4;
  dst[i] = src[si]; dst[i + 1] = src[si + 1]; dst[i + 2] = src[si + 2]; dst[i + 3] = src[si + 3];
}

function _sampleDst(src, w, h, fx, fy, interp, dst, i) {
  if (interp === 'bilinear') _bilinearDst(src, w, h, fx, fy, dst, i);
  else _nearestDst(src, w, h, fx, fy, dst, i);
}

// ── Flow Field Warp ──────────────────────────────────────────────────────────

/**
 * Warp pixels along a Perlin noise vector field.
 * Each pixel traces back through the field for advectSteps iterations.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} noiseScale       - Field frequency [0.1, 20]
 * @param {number} octaves          - fBm octave count [1, 8]
 * @param {number} lacunarity       - Frequency multiplier per octave [1, 4]
 * @param {number} gain             - Amplitude multiplier per octave [0.1, 0.9]
 * @param {number} strength         - Displacement magnitude (pixels)
 * @param {number} curl             - Curl blend [−1, 1]; 0 = straight noise
 * @param {number} advectSteps      - Trace iterations [1, 10]
 * @param {object} noise            - Object with .fbm(u, v, octaves, lacunarity, gain) → scalar
 * @param {'bilinear'|'nearest'} [interpolation='bilinear']
 * @returns {Uint8ClampedArray}
 */
export function flowFieldWarp(src, w, h, noiseScale, octaves, lacunarity, gain, strength, curl, advectSteps, noise, interpolation = 'bilinear') {
  const dst = new Uint8ClampedArray(src.length);
  const ss = strength / advectSteps;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sx = x, sy = y;
      for (let st = 0; st < advectSteps; st++) {
        const u = sx / w * noiseScale, v = sy / h * noiseScale;
        let dx = noise.fbm(u, v, octaves, lacunarity, gain);
        let dy = noise.fbm(u + 31.7, v + 47.3, octaves, lacunarity, gain);
        if (curl) {
          const cd = dy * curl, cy2 = -dx * curl;
          dx = dx * (1 - Math.abs(curl)) + cd;
          dy = dy * (1 - Math.abs(curl)) + cy2;
        }
        sx -= dx * ss; sy -= dy * ss;
      }
      _sampleDst(src, w, h, sx, sy, interpolation, dst, (y * w + x) * 4);
    }
  }
  return dst;
}

// ── Band Shift ───────────────────────────────────────────────────────────────

/**
 * Offset horizontal or vertical bands by noise/sine/stepped amounts.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {'horizontal'|'vertical'} axis
 * @param {number} bandSize         - Band width/height in pixels [2, 200]
 * @param {number} intensity        - Max offset in pixels [0, 200]
 * @param {'noise'|'sine'|'stepped'} offsetType
 * @param {number} phase            - Phase offset for sine/noise [0, 2π]
 * @param {number} freq             - Frequency multiplier for sine [0.1, 10]
 * @param {number} noiseScale       - Noise frequency [0.1, 10]
 * @param {object} noise            - Object with .noise2D(u, v) → scalar [-1, 1]
 * @param {object} rng              - Object with .next() → [0,1]
 * @param {'bilinear'|'nearest'} [interpolation='bilinear']
 * @returns {Uint8ClampedArray}
 */
export function bandShift(src, w, h, axis, bandSize, intensity, offsetType, phase, freq, noiseScale, noise, rng, interpolation = 'bilinear') {
  const isH = axis === 'horizontal';
  const dim = isH ? h : w;
  const num = Math.ceil(dim / Math.max(1, bandSize));
  const off = new Float32Array(num);

  for (let b = 0; b < num; b++) {
    const t = b / num;
    if (offsetType === 'sine') {
      off[b] = Math.sin(t * freq * Math.PI * 2 + phase) * intensity;
    } else if (offsetType === 'stepped') {
      off[b] = (Math.round(rng.next() * 4) - 2) * intensity * 0.5;
    } else {
      off[b] = noise.noise2D(t * noiseScale, phase) * intensity;
    }
  }

  const dst = new Uint8ClampedArray(src.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const bi = Math.min(Math.floor((isH ? y : x) / Math.max(1, bandSize)), num - 1);
      const i = (y * w + x) * 4;
      _sampleDst(src, w, h, isH ? x + off[bi] : x, isH ? y : y + off[bi], interpolation, dst, i);
    }
  }
  return dst;
}

// ── Advection ────────────────────────────────────────────────────────────────

/**
 * Advect pixels backward through a velocity field.
 * Velocity types: noise (fBm), radial (outward from centre), vortex (rotational).
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {'noise'|'radial'|'vortex'} velocityType
 * @param {number} steps            - Advection iterations [1, 30]
 * @param {number} speed            - Step magnitude [0.1, 20]
 * @param {number} noiseScale       - Noise frequency (for noise type) [0.1, 20]
 * @param {object} noise            - Object with .fbm(u, v, octaves) → scalar
 * @param {'bilinear'|'nearest'} [interpolation='bilinear']
 * @returns {Uint8ClampedArray}
 */
export function advectionWarp(src, w, h, velocityType, steps, speed, noiseScale, noise, interpolation = 'bilinear') {
  const dst = new Uint8ClampedArray(src.length);
  const cx = w / 2, cy = h / 2;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let px = x, py = y;
      for (let st = 0; st < steps; st++) {
        let vx, vy;
        if (velocityType === 'noise') {
          vx = noise.fbm(px / w * noiseScale, py / h * noiseScale, 3);
          vy = noise.fbm(px / w * noiseScale + 31.7, py / h * noiseScale + 47.3, 3);
        } else if (velocityType === 'radial') {
          const ddx = px - cx, ddy = py - cy, dist = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
          vx = ddx / dist; vy = ddy / dist;
        } else {
          const ddx = px - cx, ddy = py - cy, dist = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
          vx = -ddy / dist; vy = ddx / dist;
        }
        px -= vx * speed; py -= vy * speed;
      }
      _sampleDst(src, w, h, px, py, interpolation, dst, (y * w + x) * 4);
    }
  }
  return dst;
}

// ── Radial Ripple ─────────────────────────────────────────────────────────────

/**
 * Displace pixels radially using a sine wave from a centre point.
 * @formula offset = sin(dist/w * freq * 2π + phase) * amp * exp(-(dist/maxDist) * falloff)
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} centreX          - Normalised [0, 1]
 * @param {number} centreY          - Normalised [0, 1]
 * @param {number} amplitude        - Peak displacement in pixels [0, 100]
 * @param {number} frequency        - Wave frequency [0.5, 50]
 * @param {number} phase            - Phase offset in radians [0, 2π]
 * @param {number} falloff          - Radial amplitude decay exponent [0, 5]
 * @param {'bilinear'|'nearest'} [interpolation='bilinear']
 * @returns {Uint8ClampedArray}
 */
export function radialRipple(src, w, h, centreX, centreY, amplitude, frequency, phase, falloff, interpolation = 'bilinear') {
  const cx = centreX * w, cy = centreY * h;
  const md = Math.sqrt(w * w + h * h) * 0.5;
  const dst = new Uint8ClampedArray(src.length);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const i = (y * w + x) * 4;
      if (dist < 0.001) { dst[i] = src[i]; dst[i+1] = src[i+1]; dst[i+2] = src[i+2]; dst[i+3] = src[i+3]; continue; }
      const off = Math.sin(dist / w * frequency * Math.PI * 2 + phase) * amplitude * Math.exp(-(dist / md) * falloff);
      const ang = Math.atan2(dy, dx);
      _sampleDst(src, w, h, x + Math.cos(ang) * off, y + Math.sin(ang) * off, interpolation, dst, i);
    }
  }
  return dst;
}

// ── Lens Bubbles ─────────────────────────────────────────────────────────────

/**
 * Place randomly seeded magnifying lens bubbles across the image.
 * Each bubble applies a smooth spherical magnification within its radius.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} count            - Number of bubbles [1, 30]
 * @param {number} minRadius        - Min radius as fraction of diagonal [0.01, 0.3]
 * @param {number} maxRadius        - Max radius as fraction of diagonal [0.02, 0.5]
 * @param {number} magnification    - Peak magnification factor [0.2, 5]
 * @param {number} edgeSoft         - Edge softness blend zone [0, 1]
 * @param {object} rng              - Object with .next()→[0,1], .nextRange(lo,hi)→scalar
 * @param {'bilinear'|'nearest'} [interpolation='bilinear']
 * @returns {Uint8ClampedArray}
 */
export function lensBubbles(src, w, h, count, minRadius, maxRadius, magnification, edgeSoft, rng, interpolation = 'bilinear') {
  const diag = Math.sqrt(w * w + h * h);
  const bubbles = [];
  for (let i = 0; i < count; i++) {
    bubbles.push({
      cx: rng.next() * w,
      cy: rng.next() * h,
      r: rng.nextRange(minRadius, maxRadius) * diag
    });
  }

  const dst = new Uint8ClampedArray(src.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sx = x, sy = y;
      for (const b of bubbles) {
        const dx = x - b.cx, dy = y - b.cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < b.r) {
          const t = dist / b.r;
          const se = edgeSoft > 0 ? Math.min(1, (1 - t) / edgeSoft) : 1;
          const m = 1 + (magnification - 1) * se * (1 - t * t);
          sx = b.cx + dx / m; sy = b.cy + dy / m;
          break;
        }
      }
      _sampleDst(src, w, h, sx, sy, interpolation, dst, (y * w + x) * 4);
    }
  }
  return dst;
}
