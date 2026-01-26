/**
 * @fileoverview Animation Utilities
 * 
 * LFO, perfect loops, easing functions, and animation timing.
 * 
 * @module animation/animation-utils
 * @source blog/ideas/reference documentation/20_Physics_Simulation/Low_frequency_oscillation.md
 * @wikipedia https://en.wikipedia.org/wiki/Low-frequency_oscillation
 * 
 * Key equations from reference:
 * @formula Sine wave: y(t) = A sin(2πft + φ)
 * @formula Triangle wave: y(t) = (4A/T)|((t-φ) mod T) - T/2| - A
 * @formula Sawtooth wave: y(t) = 2A((t/T) - floor(t/T + 0.5))
 * @formula Square wave: y(t) = A·sign(sin(2πft + φ))
 * 
 * Perfect loop: frequency = cycles/loopDuration where cycles is integer
 * 
 * LFO typical ranges:
 * - Position offset: ±10-100 px at 0.1-2 Hz
 * - Scale: 0.8-1.2 at 0.5-1 Hz
 * - Rotation: ±5-15° at 0.2-0.5 Hz
 */

// ═══════════════════════════════════════════════════════════════════════════
// LOW FREQUENCY OSCILLATOR (LFO)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * LFO waveform types
 * @enum {string}
 */
export const LFO_WAVEFORM = {
    SINE: 'sine',
    TRIANGLE: 'triangle',
    SQUARE: 'square',
    SAWTOOTH: 'sawtooth',
    RANDOM: 'random'
};

/**
 * Create an LFO generator function
 * 
 * @param {Object} params - LFO parameters
 * @param {number} params.frequency - Frequency in Hz
 * @param {number} [params.amplitude=1] - Peak amplitude
 * @param {number} [params.offset=0] - DC offset
 * @param {number} [params.phase=0] - Initial phase (0-1)
 * @param {string} [params.waveform='sine'] - Waveform type
 * @returns {Function} (time) => value
 */
export function createLFO(params) {
    const { 
        frequency, 
        amplitude = 1, 
        offset = 0, 
        phase = 0, 
        waveform = 'sine' 
    } = params;
    
    return function(time) {
        const t = (time * frequency + phase) % 1;
        let value;
        
        switch (waveform) {
            case 'sine':
                value = Math.sin(t * 2 * Math.PI);
                break;
            case 'triangle':
                value = 4 * Math.abs(t - 0.5) - 1;
                break;
            case 'square':
                value = t < 0.5 ? 1 : -1;
                break;
            case 'sawtooth':
                value = 2 * t - 1;
                break;
            case 'random':
                // Smooth random using noise-like interpolation
                const idx = Math.floor(time * frequency);
                const frac = (time * frequency) % 1;
                const smoothFrac = frac * frac * (3 - 2 * frac);
                const v0 = Math.sin(idx * 12.9898 + 78.233) * 43758.5453 % 1 * 2 - 1;
                const v1 = Math.sin((idx + 1) * 12.9898 + 78.233) * 43758.5453 % 1 * 2 - 1;
                value = v0 + smoothFrac * (v1 - v0);
                break;
            default:
                value = Math.sin(t * 2 * Math.PI);
        }
        
        return offset + amplitude * value;
    };
}

/**
 * Combine multiple LFOs
 * 
 * @param {Array<Function>} lfos - Array of LFO functions
 * @param {string} [mode='sum'] - Combination mode: 'sum', 'product', 'max', 'min'
 * @returns {Function} Combined LFO function
 */
export function combineLFOs(lfos, mode = 'sum') {
    return function(time) {
        const values = lfos.map(lfo => lfo(time));
        
        switch (mode) {
            case 'product':
                return values.reduce((a, b) => a * b, 1);
            case 'max':
                return Math.max(...values);
            case 'min':
                return Math.min(...values);
            case 'sum':
            default:
                return values.reduce((a, b) => a + b, 0);
        }
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// PERFECT LOOP ANIMATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create perfectly looping time parameter
 * 
 * @param {number} time - Current time
 * @param {number} loopDuration - Duration of one loop
 * @returns {number} Normalized loop time (0-1)
 */
export function loopTime(time, loopDuration) {
    return (time % loopDuration) / loopDuration;
}

/**
 * Create pingpong animation time (goes 0→1→0)
 * 
 * @param {number} t - Normalized time (0-1)
 * @returns {number} Pingpong time (0-1-0)
 */
export function pingpong(t) {
    const cycle = t % 1;
    return cycle < 0.5 ? 2 * cycle : 2 * (1 - cycle);
}

/**
 * Create seamless noise loop using cosine interpolation on a circle
 * 
 * @param {number} t - Time (0-1)
 * @param {number} seed - Random seed
 * @param {number} [octaves=4] - Noise octaves
 * @returns {number} Smooth looping noise value (-1 to 1)
 */
export function loopingNoise1D(t, seed, octaves = 4) {
    // Sample noise on a circle in 2D noise space
    const angle = t * 2 * Math.PI;
    const x = Math.cos(angle);
    const y = Math.sin(angle);
    
    // Simple hash-based noise
    function hash(px, py, s) {
        return Math.sin(px * 12.9898 + py * 78.233 + s) * 43758.5453 % 1;
    }
    
    function smoothNoise(px, py, s) {
        const ix = Math.floor(px);
        const iy = Math.floor(py);
        const fx = px - ix;
        const fy = py - iy;
        
        const sx = fx * fx * (3 - 2 * fx);
        const sy = fy * fy * (3 - 2 * fy);
        
        const n00 = hash(ix, iy, s) * 2 - 1;
        const n10 = hash(ix + 1, iy, s) * 2 - 1;
        const n01 = hash(ix, iy + 1, s) * 2 - 1;
        const n11 = hash(ix + 1, iy + 1, s) * 2 - 1;
        
        const nx0 = n00 + sx * (n10 - n00);
        const nx1 = n01 + sx * (n11 - n01);
        
        return nx0 + sy * (nx1 - nx0);
    }
    
    let value = 0;
    let amplitude = 1;
    let freq = 1;
    let maxValue = 0;
    
    for (let i = 0; i < octaves; i++) {
        value += amplitude * smoothNoise(x * freq, y * freq, seed + i * 100);
        maxValue += amplitude;
        amplitude *= 0.5;
        freq *= 2;
    }
    
    return value / maxValue;
}

/**
 * Create keyframe animation with perfect loop
 * 
 * @param {number[]} keyframes - Array of values (first and last should match for perfect loop)
 * @param {number} t - Normalized time (0-1)
 * @param {Function} [easing] - Easing function for interpolation
 * @returns {number} Interpolated value
 */
export function keyframeLoop(keyframes, t, easing = (x) => x) {
    const n = keyframes.length;
    const scaledT = t * n;
    const idx = Math.floor(scaledT) % n;
    const frac = scaledT - Math.floor(scaledT);
    const easedFrac = easing(frac);
    
    const a = keyframes[idx];
    const b = keyframes[(idx + 1) % n];
    
    return a + (b - a) * easedFrac;
}

// ═══════════════════════════════════════════════════════════════════════════
// EASING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Standard easing functions
 */
export const Easing = {
    linear: (t) => t,
    
    // Quadratic
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => t * (2 - t),
    easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    
    // Cubic
    easeInCubic: (t) => t * t * t,
    easeOutCubic: (t) => (--t) * t * t + 1,
    easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    
    // Quartic
    easeInQuart: (t) => t * t * t * t,
    easeOutQuart: (t) => 1 - (--t) * t * t * t,
    easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
    
    // Sine
    easeInSine: (t) => 1 - Math.cos(t * Math.PI / 2),
    easeOutSine: (t) => Math.sin(t * Math.PI / 2),
    easeInOutSine: (t) => 0.5 * (1 - Math.cos(Math.PI * t)),
    
    // Exponential
    easeInExpo: (t) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
    easeOutExpo: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
    easeInOutExpo: (t) => {
        if (t === 0 || t === 1) return t;
        if (t < 0.5) return 0.5 * Math.pow(2, 20 * t - 10);
        return 1 - 0.5 * Math.pow(2, -20 * t + 10);
    },
    
    // Elastic
    easeOutElastic: (t) => {
        if (t === 0 || t === 1) return t;
        return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
    },
    
    // Bounce
    easeOutBounce: (t) => {
        if (t < 1 / 2.75) return 7.5625 * t * t;
        if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// LAYOUT MORPHING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Interpolate between two point layouts
 * 
 * @param {Array<{x, y}>} from - Start positions
 * @param {Array<{x, y}>} to - End positions
 * @param {number} t - Interpolation factor (0-1)
 * @param {Function} [easing=Easing.easeInOutCubic] - Easing function
 * @returns {Array<{x, y}>} Interpolated positions
 */
export function morphLayout(from, to, t, easing = Easing.easeInOutCubic) {
    const easedT = easing(t);
    const n = Math.min(from.length, to.length);
    const result = [];
    
    for (let i = 0; i < n; i++) {
        result.push({
            x: from[i].x + (to[i].x - from[i].x) * easedT,
            y: from[i].y + (to[i].y - from[i].y) * easedT
        });
    }
    
    return result;
}

/**
 * Stagger animation start times
 * 
 * @param {number} index - Item index
 * @param {number} total - Total items
 * @param {number} staggerAmount - Delay between items (0-1)
 * @param {number} t - Global time (0-1)
 * @returns {number} Local time for this item (0-1, clamped)
 */
export function staggeredTime(index, total, staggerAmount, t) {
    const delay = (index / (total - 1)) * staggerAmount;
    const duration = 1 - staggerAmount;
    const localT = (t - delay) / duration;
    return Math.max(0, Math.min(1, localT));
}

/**
 * Create spring physics animation
 * 
 * @param {Object} params - Spring parameters
 * @param {number} params.stiffness - Spring stiffness (1-300)
 * @param {number} params.damping - Damping ratio (0-1)
 * @param {number} params.mass - Mass (0.1-10)
 * @returns {Function} (target, current, velocity, dt) => {position, velocity}
 */
export function createSpring(params) {
    const { stiffness = 100, damping = 0.5, mass = 1 } = params;
    
    return function(target, current, velocity, dt) {
        const force = stiffness * (target - current);
        const dampingForce = damping * velocity * 2 * Math.sqrt(stiffness * mass);
        const acceleration = (force - dampingForce) / mass;
        
        const newVelocity = velocity + acceleration * dt;
        const newPosition = current + newVelocity * dt;
        
        return { position: newPosition, velocity: newVelocity };
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOM EASING & REMAPPING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Power easing with configurable exponent
 * Creates ease-in-out curve with adjustable "sharpness"
 * Higher power = more time at start/end, less in middle
 * 
 * @source reference/defecated.html:227-234
 * @formula For t < 0.5: (2t)^p / 2, For t >= 0.5: 1 - (2(1-t))^p / 2
 * 
 * @param {number} t - Time (0-1)
 * @param {number} power - Exponent (higher = more time at edges, default 6)
 * @returns {number} Eased value (0-1)
 * 
 * @example
 * // Dwell longer at start/end
 * const morphT = powerEase(linearT, 6);
 */
export function powerEase(t, power = 6) {
    if (t < 0.5) {
        return Math.pow(t * 2, power) / 2;
    } else {
        return 1 - Math.pow((1 - t) * 2, power) / 2;
    }
}

/**
 * Remap time through sine wave with scale/offset
 * Creates smooth bulge/dip in 0-1 curve for animation effects
 * 
 * @source reference/defecated.html:236-239
 * @formula y = max(0, sin(t·π) · scale + offset)
 * 
 * @param {number} t - Time (0-1)
 * @param {number} scale - Scale factor (>1.0 = over-swing, <1.0 = under-swing)
 * @param {number} offset - Offset (negative creates dip for sharp edges)
 * @param {boolean} clampNegative - Clamp negative values to 0
 * @returns {number} Remapped value
 * 
 * @example
 * // Create dip at start/end for sharp transitions
 * const intensity = sineRemap(morphT, 1.1, -0.1, true);
 */
export function sineRemap(t, scale = 1.1, offset = -0.1, clampNegative = true) {
    const raw = Math.sin(t * Math.PI);
    const remapped = raw * scale + offset;
    return clampNegative ? Math.max(0, remapped) : remapped;
}

