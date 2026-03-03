/**
 * @fileoverview Noise Function Library
 * 
 * Procedural noise functions for texture generation and domain warping.
 * All functions are pure and stateless.
 * 
 * @module noise/noise-functions
 */

// ═══════════════════════════════════════════════════════════════════════════
// SIMPLEX NOISE (2D)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Permutation table for gradient selection
 * @type {Uint8Array}
 */
const PERM = new Uint8Array(512);
const PERM_MOD12 = new Uint8Array(512);

// Initialize permutation table with default seed
(function initPermutation() {
    const p = [];
    for (let i = 0; i < 256; i++) p[i] = i;
    
    // Fisher-Yates shuffle with fixed seed
    let seed = 0;
    for (let i = 255; i > 0; i--) {
        seed = (seed * 1103515245 + 12345) >>> 0;
        const j = seed % (i + 1);
        [p[i], p[j]] = [p[j], p[i]];
    }
    
    for (let i = 0; i < 512; i++) {
        PERM[i] = p[i & 255];
        PERM_MOD12[i] = PERM[i] % 12;
    }
})();

/**
 * 2D gradient vectors
 * @type {number[][]}
 */
const GRAD2 = [
    [1, 1], [-1, 1], [1, -1], [-1, -1],
    [1, 0], [-1, 0], [0, 1], [0, -1],
    [1, 1], [-1, 1], [1, -1], [-1, -1]
];

/**
 * Skewing factors for 2D simplex
 */
const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;

/**
 * 2D Simplex noise
 *
 * @source blog/ideas/reference documentation/17_Noise_Functions/Simplex_noise.md
 * @wikipedia https://en.wikipedia.org/wiki/Simplex_noise
 * @section 2D Simplex Noise Algorithm
 * @formula n_i = \max(0, r^2 - d_i^2)^4 \cdot (\nabla_i \cdot \vec{d_i})
 *
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {number} Noise value in range [-1, 1]
 *
 * @example
 * const value = simplex2D(x * 0.01, y * 0.01);
 */
export function simplex2D(x, y) {
    // Skew input space
    const s = (x + y) * F2;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    
    // Unskew back to get simplex vertex
    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = x - X0;
    const y0 = y - Y0;
    
    // Determine which simplex
    const i1 = x0 > y0 ? 1 : 0;
    const j1 = x0 > y0 ? 0 : 1;
    
    // Offsets for corners
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;
    
    // Wrap indices for permutation table
    const ii = i & 255;
    const jj = j & 255;
    
    // Calculate contributions from corners
    let n0 = 0, n1 = 0, n2 = 0;
    
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
        const gi0 = PERM_MOD12[ii + PERM[jj]];
        t0 *= t0;
        n0 = t0 * t0 * (GRAD2[gi0][0] * x0 + GRAD2[gi0][1] * y0);
    }
    
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
        const gi1 = PERM_MOD12[ii + i1 + PERM[jj + j1]];
        t1 *= t1;
        n1 = t1 * t1 * (GRAD2[gi1][0] * x1 + GRAD2[gi1][1] * y1);
    }
    
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
        const gi2 = PERM_MOD12[ii + 1 + PERM[jj + 1]];
        t2 *= t2;
        n2 = t2 * t2 * (GRAD2[gi2][0] * x2 + GRAD2[gi2][1] * y2);
    }
    
    // Scale to [-1, 1]
    return 70 * (n0 + n1 + n2);
}

// ═══════════════════════════════════════════════════════════════════════════
// FRACTAL BROWNIAN MOTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fractal Brownian Motion (fBm) using simplex noise
 *
 * @source blog/ideas/reference documentation/17_Noise_Functions/Perlin_noise.md
 * @wikipedia https://en.wikipedia.org/wiki/Fractional_Brownian_motion
 * @section Fractal Brownian Motion
 * @formula \text{fbm}(x, y) = \sum_{i=0}^{n-1} \text{persistence}^i \cdot \text{noise}(\text{lacunarity}^i \cdot x, \text{lacunarity}^i \cdot y)
 *
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Object} [options] - fBm parameters
 * @param {number} [options.octaves=4] - Number of noise layers
 * @param {number} [options.lacunarity=2.0] - Frequency multiplier per octave
 * @param {number} [options.persistence=0.5] - Amplitude decay per octave
 * @returns {number} Noise value (range depends on octaves)
 *
 * @example
 * const terrain = fbm2D(x * 0.005, y * 0.005, { octaves: 6 });
 */
export function fbm2D(x, y, options = {}) {
    const {
        octaves = 4,
        lacunarity = 2.0,
        persistence = 0.5
    } = options;
    
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;
    
    for (let i = 0; i < octaves; i++) {
        value += amplitude * simplex2D(x * frequency, y * frequency);
        maxValue += amplitude;
        amplitude *= persistence;
        frequency *= lacunarity;
    }
    
    return value / maxValue;
}

// ═══════════════════════════════════════════════════════════════════════════
// DOMAIN WARPING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Domain warp using noise displacement
 *
 * Applies noise-based coordinate distortion before sampling.
 *
 * @source blog/ideas/reference documentation/17_Noise_Functions/Domain_warping.md
 * @wikipedia https://en.wikipedia.org/wiki/Domain_warping
 * @section 3.2 Scaled Warp
 * @formula f(\mathbf{p}) = \text{noise}(\mathbf{p} + A \cdot \text{noise}(B \cdot \mathbf{p}))
 *
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Object} [options] - Warp parameters
 * @param {number} [options.strength=1.0] - Warp intensity
 * @param {number} [options.scale=0.01] - Noise frequency
 * @param {number} [options.octaves=4] - fBm octaves
 * @returns {{x: number, y: number}} Warped coordinates
 *
 * @example
 * const warped = domainWarp2D(x, y, { strength: 50, scale: 0.005 });
 * const value = simplex2D(warped.x * 0.01, warped.y * 0.01);
 */
export function domainWarp2D(x, y, options = {}) {
    const {
        strength = 1.0,
        scale = 0.01,
        octaves = 4
    } = options;
    
    const warpX = fbm2D(x * scale, y * scale, { octaves });
    const warpY = fbm2D(x * scale + 5.2, y * scale + 1.3, { octaves });
    
    return {
        x: x + warpX * strength,
        y: y + warpY * strength
    };
}

/**
 * Multi-layer domain warp (warped warp)
 *
 * @source blog/ideas/reference documentation/17_Noise_Functions/Domain_warping.md
 * @wikipedia https://en.wikipedia.org/wiki/Domain_warping
 * @section 3.3 Layered Warp (Inigo Quilez)
 * @formula q = \text{noise}(\mathbf{p}); r = \text{noise}(\mathbf{p} + q); f(\mathbf{p}) = \text{noise}(\mathbf{p} + r)
 *
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} [layers=2] - Number of warp layers
 * @param {Object} [options] - Warp parameters per layer
 * @returns {{x: number, y: number}} Multiply warped coordinates
 */
export function multiWarp2D(x, y, layers = 2, options = {}) {
    let wx = x, wy = y;
    
    for (let i = 0; i < layers; i++) {
        const scale = (options.scale || 0.01) * Math.pow(2, i);
        const strength = (options.strength || 50) / Math.pow(2, i);
        
        const warped = domainWarp2D(wx, wy, { ...options, scale, strength });
        wx = warped.x;
        wy = warped.y;
    }
    
    return { x: wx, y: wy };
}

// ═══════════════════════════════════════════════════════════════════════════
// SMOOTHSTEP & INTERPOLATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Standard cubic smoothstep
 * 
 * Formula: 3t² - 2t³
 * 
 * @param {number} edge0 - Lower edge of threshold
 * @param {number} edge1 - Upper edge of threshold
 * @param {number} x - Input value
 * @returns {number} Smoothly interpolated value in [0, 1]
 */
export function smoothstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
}

/**
 * Ken Perlin's improved smoothstep (smootherstep)
 * 
 * Formula: 6t⁵ - 15t⁴ + 10t³
 * Has zero first AND second derivatives at endpoints.
 * 
 * @param {number} edge0 - Lower edge of threshold
 * @param {number} edge1 - Upper edge of threshold
 * @param {number} x - Input value
 * @returns {number} Smoothly interpolated value in [0, 1]
 */
export function smootherstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * t * (t * (t * 6 - 15) + 10);
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Seed the noise permutation table
 * 
 * @param {number} seed - Integer seed value
 */
export function seedNoise(seed) {
    const p = [];
    for (let i = 0; i < 256; i++) p[i] = i;
    
    // Fisher-Yates shuffle with provided seed
    let s = seed >>> 0;
    for (let i = 255; i > 0; i--) {
        s = (s * 1103515245 + 12345) >>> 0;
        const j = s % (i + 1);
        [p[i], p[j]] = [p[j], p[i]];
    }
    
    for (let i = 0; i < 512; i++) {
        PERM[i] = p[i & 255];
        PERM_MOD12[i] = PERM[i] % 12;
    }
}

/**
 * Map noise output to custom range
 * 
 * @param {number} value - Noise value (typically -1 to 1)
 * @param {number} min - Output minimum
 * @param {number} max - Output maximum
 * @returns {number} Remapped value
 */
export function mapNoiseRange(value, min, max) {
    return min + (value + 1) * 0.5 * (max - min);
}

// ═══════════════════════════════════════════════════════════════════════════
// PERLIN NOISE (2D)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Classic Perlin noise (2D)
 * 
 * Uses gradient noise with fade interpolation on a square grid.
 * Ken Perlin's original algorithm (1983).
 * 
 * @source blog/ideas/reference documentation/17_Noise_Functions/Perlin_noise.md
 * @wikipedia https://en.wikipedia.org/wiki/Perlin_noise
 * @section Mathematical Basis
 * @formula fade(t) = 6t^5 - 15t^4 + 10t^3 (smootherstep)
 * @formula influence = g · d = g_x(x - x_0) + g_y(y - y_0)
 * @formula result = lerp(v, lerp(u, n00, n10), lerp(u, n01, n11))
 * 
 * Algorithm steps:
 * 1. Identify four corners of unit square containing point
 * 2. Generate pseudorandom gradient vector at each corner
 * 3. Compute dot product of gradient with distance vector
 * 4. Apply fade function (smootherstep)
 * 5. Bilinearly interpolate the four corner influences
 * 
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {number} Noise value in range [-1, 1]
 */
export function perlin2D(x, y) {
    // Step 1: Identify four corners of unit square containing point
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    
    // Relative position within square (distance vectors)
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    
    // Step 2: Hash coordinates of 4 square corners using permutation table
    // perm[i] = hash(i) mod 256
    // This gives us: perm[(perm[x] + y) mod 256]
    const aa = PERM[PERM[xi] + yi];
    const ab = PERM[PERM[xi] + yi + 1];
    const ba = PERM[PERM[xi + 1] + yi];
    const bb = PERM[PERM[xi + 1] + yi + 1];
    
    // Step 3: Select gradients and compute dot products
    // Common 2D gradients (from docs): (1,1), (-1,1), (1,-1), (-1,-1), (1,0), (-1,0), (0,1), (0,-1)
    // gradient = gradients[perm[(perm[x] + y) mod 256] mod numGradients]
    const gradients = [
        [1, 1], [-1, 1], [1, -1], [-1, -1],
        [1, 0], [-1, 0], [0, 1], [0, -1]
    ];
    
    // Gradient selection and dot product: influence = g · d = g_x(x - x_0) + g_y(y - y_0)
    const dotGrad = (hash, x, y) => {
        const g = gradients[hash & 7];  // hash & 7 = hash mod 8 (select from 8 gradients)
        return g[0] * x + g[1] * y;
    };
    
    // Dot products for four corners (n_ij where i,j are corner indices)
    const n00 = dotGrad(aa, xf, yf);           // (x0, y0)
    const n10 = dotGrad(ba, xf - 1, yf);       // (x0+1, y0)
    const n01 = dotGrad(ab, xf, yf - 1);       // (x0, y0+1)
    const n11 = dotGrad(bb, xf - 1, yf - 1);   // (x0+1, y0+1)
    
    // Step 4: Apply fade function (smootherstep)
    // fade(t) = 6t^5 - 15t^4 + 10t^3
    const u = smootherstep(0, 1, xf);
    const v = smootherstep(0, 1, yf);
    
    // Step 5: Bilinear interpolation
    // result = lerp(v, lerp(u, n00, n10), lerp(u, n01, n11))
    const lerp = (a, b, t) => a + t * (b - a);
    const x1 = lerp(n00, n10, u);
    const x2 = lerp(n01, n11, u);
    return lerp(x1, x2, v);
}

// ── RGBA pixel-buffer API (DISTORT pipeline) ─────────────────────────────────

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

/**
 * Overlay fBm Perlin noise onto an RGBA buffer using a blend mode.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} scale     - Noise frequency [0.1, 20]
 * @param {number} octaves   - fBm octave count [1, 8]
 * @param {number} strength  - Blend strength [0, 1]
 * @param {'add'|'multiply'|'screen'|'overlay'} blendMode
 * @param {object} noise     - Object with .fbm(u, v, octaves) → scalar [-1, 1]
 * @returns {Uint8ClampedArray}
 */
export function perlinOverlayRGBA(src, w, h, scale, octaves, strength, blendMode, noise) {
  const dst = new Uint8ClampedArray(src.length);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const n = (noise.fbm(x / w * scale, y / h * scale, octaves) + 1) * 0.5;
    const oi = (y * w + x) * 4;
    for (let c = 0; c < 3; c++) {
      const sv = src[oi + c] / 255;
      let out;
      if (blendMode === 'add') out = sv + (n - 0.5) * strength * 2;
      else if (blendMode === 'multiply') out = sv * (1 - strength + n * strength);
      else if (blendMode === 'screen') out = 1 - (1 - sv) * (1 - n * strength);
      else out = sv < 0.5 ? 2 * sv * (0.5 + (n - 0.5) * strength) : 1 - 2 * (1 - sv) * (0.5 + (0.5 - n) * strength);
      dst[oi + c] = Math.max(0, Math.min(255, Math.round(out * 255)));
    }
    dst[oi + 3] = src[oi + 3];
  }
  return dst;
}

/**
 * Domain warp — iteratively warp spatial coordinates using fBm noise, then sample.
 * Each additional layer doubles frequency and halves strength.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} strength  - Base warp magnitude in pixels [0, 200]
 * @param {number} scale     - Base noise frequency [0.1, 20]
 * @param {number} octaves   - fBm octave count [1, 8]
 * @param {number} layers    - Warp recursion depth [1, 3]
 * @param {object} noise     - Object with .fbm(u, v, octaves) → scalar
 * @returns {Uint8ClampedArray}
 */
export function domainWarpRGBA(src, w, h, strength, scale, octaves, layers, noise) {
  const dst = new Uint8ClampedArray(src.length);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let wx = x, wy = y;
    for (let l = 0; l < layers; l++) {
      const sc = scale * Math.pow(2, l), str = strength / Math.pow(2, l);
      wx += noise.fbm(wx / w * sc, wy / h * sc, octaves) * str;
      wy += noise.fbm(wx / w * sc + 5.2, wy / h * sc + 1.3, octaves) * str;
    }
    _bilinearDst(src, w, h, wx, wy, dst, (y * w + x) * 4);
  }
  return dst;
}

