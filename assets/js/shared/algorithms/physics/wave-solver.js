/**
 * @fileoverview Wave Equation Solvers
 * 
 * 1D and 2D wave equation simulation.
 * All functions are pure and stateless.
 * 
 * @module physics/wave-solver
 * @source blog/ideas/reference documentation/08_Reaction_Diffusion_PDE/Wave_equation.md
 * @wikipedia https://en.wikipedia.org/wiki/Wave_equation
 * 
 * Key equations from reference:
 * @formula Scalar wave equation: ∂²u/∂t² = c²Δu
 * @formula 1D: ∂²u/∂t² = c²(∂²u/∂x²)
 * @formula d'Alembert: u(x,t) = F(x-ct) + G(x+ct)
 * @formula Discretized: u(t+dt) = 2u(t) - u(t-dt) + c²dt²/dx² [u(x+1) - 2u(x) + u(x-1)]
 * @formula CFL condition: c*dt/dx ≤ 1
 */

// ═══════════════════════════════════════════════════════════════════════════
// 1D WAVE EQUATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Initialize 1D wave state
 * 
 * @param {number} length - Number of samples
 * @param {Object} [options] - Options
 * @param {string} [options.initial='gaussian'] - Initial shape: 'gaussian', 'sine', 'step', 'zero'
 * @param {number} [options.position=0.5] - Initial wave position (0-1)
 * @param {number} [options.width=0.1] - Initial wave width
 * @returns {{current: Float32Array, previous: Float32Array}}
 */
export function initWave1D(length, options = {}) {
    const { initial = 'gaussian', position = 0.5, width = 0.1 } = options;
    
    const current = new Float32Array(length);
    const previous = new Float32Array(length);
    
    const center = Math.floor(length * position);
    const sigma = length * width;
    
    for (let i = 0; i < length; i++) {
        let value = 0;
        
        switch (initial) {
            case 'gaussian':
                value = Math.exp(-((i - center) ** 2) / (2 * sigma ** 2));
                break;
            case 'sine':
                value = Math.sin(2 * Math.PI * i / length);
                break;
            case 'step':
                value = i < center ? 1 : 0;
                break;
            case 'zero':
            default:
                value = 0;
        }
        
        current[i] = value;
        previous[i] = value;
    }
    
    return { current, previous };
}

/**
 * Single 1D wave equation step
 * 
 * Equation: ∂²u/∂t² = c² ∂²u/∂x²
 * Discretized: u(t+dt) = 2u(t) - u(t-dt) + c²dt²/dx² [u(x+1) - 2u(x) + u(x-1)]
 * 
 * @param {Float32Array} current - Current state
 * @param {Float32Array} previous - Previous state
 * @param {Object} params - Parameters
 * @param {number} params.c - Wave speed
 * @param {number} params.damping - Damping factor (0-1)
 * @param {string} [params.boundary='reflect'] - Boundary: 'reflect', 'absorb', 'periodic'
 * @returns {{current: Float32Array, previous: Float32Array}}
 */
export function stepWave1D(current, previous, params) {
    const { c = 1, damping = 0.99, boundary = 'reflect' } = params;
    const n = current.length;
    const next = new Float32Array(n);
    
    // CFL condition: c*dt/dx <= 1
    const c2 = c * c;
    
    for (let i = 1; i < n - 1; i++) {
        const laplacian = current[i - 1] - 2 * current[i] + current[i + 1];
        next[i] = damping * (2 * current[i] - previous[i] + c2 * laplacian);
    }
    
    // Boundary conditions
    switch (boundary) {
        case 'reflect':
            next[0] = next[1];
            next[n - 1] = next[n - 2];
            break;
        case 'absorb':
            next[0] = 0;
            next[n - 1] = 0;
            break;
        case 'periodic':
            const lap0 = current[n - 1] - 2 * current[0] + current[1];
            const lapN = current[n - 2] - 2 * current[n - 1] + current[0];
            next[0] = damping * (2 * current[0] - previous[0] + c2 * lap0);
            next[n - 1] = damping * (2 * current[n - 1] - previous[n - 1] + c2 * lapN);
            break;
    }
    
    return { current: next, previous: current };
}

/**
 * Apply impulse to 1D wave
 * 
 * @param {Float32Array} current - Current state
 * @param {number} position - Impulse position (0-1)
 * @param {number} amplitude - Impulse amplitude
 * @param {number} [width=0.05] - Impulse width
 * @returns {Float32Array} Modified state
 */
export function impulseWave1D(current, position, amplitude, width = 0.05) {
    const result = new Float32Array(current);
    const n = current.length;
    const center = Math.floor(n * position);
    const sigma = n * width;
    
    for (let i = 0; i < n; i++) {
        const gaussian = Math.exp(-((i - center) ** 2) / (2 * sigma ** 2));
        result[i] += amplitude * gaussian;
    }
    
    return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// 2D WAVE EQUATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Initialize 2D wave state
 * 
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 * @param {Object} [options] - Options
 * @returns {{current: Float32Array, previous: Float32Array}}
 */
export function initWave2D(width, height, options = {}) {
    const { initial = 'gaussian', cx = 0.5, cy = 0.5, radius = 0.1 } = options;
    
    const size = width * height;
    const current = new Float32Array(size);
    const previous = new Float32Array(size);
    
    const centerX = width * cx;
    const centerY = height * cy;
    const r = Math.min(width, height) * radius;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            const dx = x - centerX;
            const dy = y - centerY;
            const d = Math.sqrt(dx * dx + dy * dy);
            
            let value = 0;
            if (initial === 'gaussian') {
                value = Math.exp(-(d * d) / (2 * r * r));
            } else if (initial === 'ripple') {
                value = Math.cos(d / r * Math.PI) * Math.exp(-d / (2 * r));
            }
            
            current[idx] = value;
            previous[idx] = value;
        }
    }
    
    return { current, previous };
}

/**
 * Single 2D wave equation step
 * 
 * @param {Float32Array} current - Current state
 * @param {Float32Array} previous - Previous state
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 * @param {Object} params - Parameters
 * @returns {{current: Float32Array, previous: Float32Array}}
 */
export function stepWave2D(current, previous, width, height, params) {
    const { c = 0.5, damping = 0.995 } = params;
    const next = new Float32Array(current.length);
    const c2 = c * c;
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = y * width + x;
            
            const laplacian = 
                current[idx - 1] + current[idx + 1] +
                current[idx - width] + current[idx + width] -
                4 * current[idx];
            
            next[idx] = damping * (2 * current[idx] - previous[idx] + c2 * laplacian);
        }
    }
    
    // Absorbing boundaries
    for (let x = 0; x < width; x++) {
        next[x] = 0;
        next[(height - 1) * width + x] = 0;
    }
    for (let y = 0; y < height; y++) {
        next[y * width] = 0;
        next[y * width + width - 1] = 0;
    }
    
    return { current: next, previous: current };
}

/**
 * Apply circular ripple to 2D wave
 * 
 * @param {Float32Array} current - Current state
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 * @param {number} cx - Center X (0-1)
 * @param {number} cy - Center Y (0-1)
 * @param {number} amplitude - Ripple amplitude
 * @param {number} [radius=0.05] - Ripple radius
 * @returns {Float32Array} Modified state
 */
export function rippleWave2D(current, width, height, cx, cy, amplitude, radius = 0.05) {
    const result = new Float32Array(current);
    const centerX = width * cx;
    const centerY = height * cy;
    const r = Math.min(width, height) * radius;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            const dx = x - centerX;
            const dy = y - centerY;
            const d = Math.sqrt(dx * dx + dy * dy);
            
            if (d < r * 2) {
                result[idx] += amplitude * Math.exp(-(d * d) / (r * r));
            }
        }
    }
    
    return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// TRAVELLING WAVE UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate travelling sine wave
 * 
 * @param {number} length - Array length
 * @param {number} time - Current time
 * @param {Object} params - Wave parameters
 * @param {number} params.frequency - Wave frequency
 * @param {number} params.wavelength - Wavelength (in array units)
 * @param {number} params.amplitude - Wave amplitude
 * @param {number} [params.phase=0] - Initial phase
 * @returns {Float32Array} Wave values
 */
export function travellingWave(length, time, params) {
    const { frequency, wavelength, amplitude, phase = 0 } = params;
    const wave = new Float32Array(length);
    const k = 2 * Math.PI / wavelength;
    const omega = 2 * Math.PI * frequency;
    
    for (let i = 0; i < length; i++) {
        wave[i] = amplitude * Math.sin(k * i - omega * time + phase);
    }
    
    return wave;
}

/**
 * Evaluate radial travelling wave at a distance
 * 
 * @param {number} dist - Distance from source
 * @param {number} time - Current time
 * @param {Object} params - Wave parameters
 * @param {number} params.freq - Spatial frequency (1/wavelength)
 * @param {number} params.amp - Wave amplitude
 * @param {number} [params.phase=0] - Initial phase
 * @returns {number} Wave intensity
 */
export function travellingWaveRadial(dist, time, params) {
    const { freq, amp, phase = 0 } = params;
    const w = 2 * Math.PI * freq;
    return amp * Math.sin(w * dist - time + phase);
}

/**
 * Generate standing wave (superposition of two travelling waves)
 * 
 * @param {number} length - Array length
 * @param {number} time - Current time
 * @param {Object} params - Wave parameters
 * @returns {Float32Array} Wave values
 */
export function standingWave(length, time, params) {
    const { frequency, wavelength, amplitude } = params;
    const wave = new Float32Array(length);
    const k = 2 * Math.PI / wavelength;
    const omega = 2 * Math.PI * frequency;
    
    for (let i = 0; i < length; i++) {
        // Standing wave: 2A cos(kx) cos(ωt)
        wave[i] = 2 * amplitude * Math.cos(k * i) * Math.cos(omega * time);
    }
    
    return wave;
}

/**
 * Calculate wave energy
 * 
 * @param {Float32Array} current - Current state
 * @param {Float32Array} previous - Previous state
 * @param {number} c - Wave speed
 * @returns {number} Total energy
 */
export function waveEnergy(current, previous, c) {
    let kinetic = 0;
    let potential = 0;
    
    for (let i = 0; i < current.length; i++) {
        const velocity = current[i] - previous[i];
        kinetic += 0.5 * velocity * velocity;
    }
    
    for (let i = 1; i < current.length; i++) {
        const strain = current[i] - current[i - 1];
        potential += 0.5 * c * c * strain * strain;
    }
    
    return kinetic + potential;
}

// ── RGBA pixel-buffer API (DISTORT pipeline) ─────────────────────────────────

function _bilinearWave(src, w, h, fx, fy, dst, i) {
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
 * Simulate 2D wave equation and use displacement field to warp src RGBA buffer.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} speed      - Wave propagation speed [0.01, 2]
 * @param {number} damping    - Amplitude damping per step [0.9, 1]
 * @param {number} steps      - Simulation steps [10, 500]
 * @param {number} strength   - Displacement magnitude in pixels [0, 50]
 * @param {'gaussian'|'ripple'} initType - Initial wave shape
 * @param {number} radius     - Initial perturbation radius as fraction of image [0.01, 0.5]
 * @returns {Uint8ClampedArray}
 */
export function waveDistortionRGBA(src, w, h, speed, damping, steps, strength, initType, radius) {
  const n = w * h, c2 = speed * speed, cx = w / 2, cy = h / 2;
  const rPx = radius * Math.min(w, h);
  let cur = new Float32Array(n), prev = new Float32Array(n);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = x - cx, dy = y - cy, dist = Math.sqrt(dx * dx + dy * dy);
    const v = initType === 'ripple'
      ? Math.cos(dist / rPx * Math.PI) * Math.exp(-dist / (2 * rPx))
      : Math.exp(-(dist * dist) / (2 * rPx * rPx));
    cur[y * w + x] = prev[y * w + x] = v;
  }
  let next = new Float32Array(n);
  for (let s = 0; s < steps; s++) {
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      next[i] = damping * (2 * cur[i] - prev[i] + c2 * (cur[i - 1] + cur[i + 1] + cur[i - w] + cur[i + w] - 4 * cur[i]));
    }
    [prev, cur, next] = [cur, next, prev];
  }
  const dst = new Uint8ClampedArray(src.length);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const disp = cur[y * w + x] * strength;
    _bilinearWave(src, w, h, x + disp, y + disp, dst, (y * w + x) * 4);
  }
  return dst;
}
