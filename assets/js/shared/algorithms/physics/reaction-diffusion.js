/**
 * @fileoverview Reaction-Diffusion Systems
 * 
 * Gray-Scott and Turing pattern simulations.
 * All functions are pure and stateless.
 * 
 * @module physics/reaction-diffusion
 * @source blog/ideas/reference documentation/08_Reaction_Diffusion_PDE/Gray-Scott_model.md
 * @source blog/ideas/reference documentation/08_Reaction_Diffusion_PDE/Cellular_automaton.md
 * @wikipedia https://en.wikipedia.org/wiki/Reaction%E2%80%93diffusion_system
 * @wikipedia https://en.wikipedia.org/wiki/Cellular_automaton
 * 
 * Key equations from reference:
 * @formula Gray-Scott: ∂u/∂t = Du∇²u - uv² + f(1-u)
 * @formula Gray-Scott: ∂v/∂t = Dv∇²v + uv² - (f+k)v
 * @formula Game of Life: s^{t+1} = 1 if (dead & n=3) or (alive & n∈{2,3}), else 0
 * @formula Wolfram rule: next = (rule >> pattern) & 1
 */

// ═══════════════════════════════════════════════════════════════════════════
// GRAY-SCOTT MODEL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Gray-Scott reaction-diffusion parameters
 * @typedef {Object} GrayScottParams
 * @property {number} Du - Diffusion rate of U (typically 0.2-0.25)
 * @property {number} Dv - Diffusion rate of V (typically 0.05-0.1)
 * @property {number} feed - Feed rate (typically 0.01-0.1)
 * @property {number} kill - Kill rate (typically 0.045-0.07)
 */

/**
 * Initialize Gray-Scott fields with center seed
 * 
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 * @param {Object} [options] - Initialization options
 * @param {number} [options.seedSize=20] - Size of initial seed region
 * @param {boolean} [options.random=false] - Add random perturbation
 * @returns {{u: Float32Array, v: Float32Array}}
 */
export function initGrayScott(width, height, options = {}) {
    const { seedSize = 20, random = false } = options;
    
    const u = new Float32Array(width * height).fill(1.0);
    const v = new Float32Array(width * height).fill(0.0);
    
    // Seed center region
    const cx = Math.floor(width / 2);
    const cy = Math.floor(height / 2);
    const half = Math.floor(seedSize / 2);
    
    for (let y = cy - half; y < cy + half; y++) {
        for (let x = cx - half; x < cx + half; x++) {
            if (x >= 0 && x < width && y >= 0 && y < height) {
                const idx = y * width + x;
                u[idx] = 0.5;
                v[idx] = 0.25;
                
                if (random) {
                    u[idx] += (Math.random() - 0.5) * 0.1;
                    v[idx] += (Math.random() - 0.5) * 0.1;
                }
            }
        }
    }
    
    return { u, v };
}

/**
 * Compute 2D Laplacian using 5-point stencil
 * 
 * @param {Float32Array} field - Input field
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {number} Laplacian value
 */
function laplacian5(field, width, height, x, y) {
    const idx = y * width + x;
    const c = field[idx];
    
    // Wrap boundaries
    const l = field[y * width + ((x - 1 + width) % width)];
    const r = field[y * width + ((x + 1) % width)];
    const t = field[((y - 1 + height) % height) * width + x];
    const b = field[((y + 1) % height) * width + x];
    
    return l + r + t + b - 4 * c;
}

/**
 * Single Gray-Scott simulation step
 * 
 * Equations:
 *   du/dt = Du∇²u - uv² + f(1-u)
 *   dv/dt = Dv∇²v + uv² - (f+k)v
 * 
 * @param {Float32Array} u - U concentration field
 * @param {Float32Array} v - V concentration field
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 * @param {GrayScottParams} params - Model parameters
 * @param {number} [dt=1.0] - Time step
 * @returns {{u: Float32Array, v: Float32Array}} Updated fields
 */
export function stepGrayScott(u, v, width, height, params, dt = 1.0) {
    const { Du, Dv, feed, kill } = params;
    const uNext = new Float32Array(u.length);
    const vNext = new Float32Array(v.length);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            const uVal = u[idx];
            const vVal = v[idx];
            
            const lapU = laplacian5(u, width, height, x, y);
            const lapV = laplacian5(v, width, height, x, y);
            
            // Reaction term: uv² (predator-prey interaction)
            const v2 = vVal * vVal;
            const uv2 = uVal * v2;
            
            uNext[idx] = uVal + dt * (Du * lapU - uv2 + feed * (1 - uVal));
            vNext[idx] = vVal + dt * (Dv * lapV + uv2 - (feed + kill) * vVal);
            
            // Clamp to valid range
            uNext[idx] = Math.max(0, Math.min(1, uNext[idx]));
            vNext[idx] = Math.max(0, Math.min(1, vNext[idx]));
        }
    }
    
    return { u: uNext, v: vNext };
}

/**
 * Run Gray-Scott simulation for N steps
 * 
 * @param {Float32Array} u - Initial U field
 * @param {Float32Array} v - Initial V field
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 * @param {GrayScottParams} params - Model parameters
 * @param {number} steps - Number of simulation steps
 * @param {number} [dt=1.0] - Time step
 * @returns {{u: Float32Array, v: Float32Array}} Final fields
 */
export function runGrayScott(u, v, width, height, params, steps, dt = 1.0) {
    let currentU = u;
    let currentV = v;
    
    for (let i = 0; i < steps; i++) {
        const result = stepGrayScott(currentU, currentV, width, height, params, dt);
        currentU = result.u;
        currentV = result.v;
    }
    
    return { u: currentU, v: currentV };
}

/**
 * Preset Gray-Scott parameters for different patterns
 */
export const GRAY_SCOTT_PRESETS = {
    // Mitosis/cell division
    mitosis: { Du: 0.2097, Dv: 0.105, feed: 0.0367, kill: 0.0649 },
    // Coral-like growth
    coral: { Du: 0.16, Dv: 0.08, feed: 0.06, kill: 0.062 },
    // Spots
    spots: { Du: 0.16, Dv: 0.08, feed: 0.035, kill: 0.065 },
    // Stripes/maze
    maze: { Du: 0.21, Dv: 0.105, feed: 0.029, kill: 0.057 },
    // Worms
    worms: { Du: 0.21, Dv: 0.105, feed: 0.046, kill: 0.063 },
    // Solitons
    solitons: { Du: 0.19, Dv: 0.095, feed: 0.03, kill: 0.06 },
    // Pulsating
    pulsating: { Du: 0.19, Dv: 0.095, feed: 0.026, kill: 0.055 },
    // Chaos
    chaos: { Du: 0.16, Dv: 0.08, feed: 0.026, kill: 0.052 }
};

// ═══════════════════════════════════════════════════════════════════════════
// TURING PATTERN (Generic)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generic Turing pattern step with customizable reaction
 * 
 * @param {Float32Array} a - Activator field
 * @param {Float32Array} b - Inhibitor field
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 * @param {Object} params - Parameters
 * @param {number} params.Da - Activator diffusion
 * @param {number} params.Db - Inhibitor diffusion
 * @param {Function} params.reaction - Reaction function (a, b) => {da, db}
 * @param {number} [dt=0.1] - Time step
 * @returns {{a: Float32Array, b: Float32Array}}
 */
export function stepTuringPattern(a, b, width, height, params, dt = 0.1) {
    const { Da, Db, reaction } = params;
    const aNext = new Float32Array(a.length);
    const bNext = new Float32Array(b.length);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            const aVal = a[idx];
            const bVal = b[idx];
            
            const lapA = laplacian5(a, width, height, x, y);
            const lapB = laplacian5(b, width, height, x, y);
            
            const { da, db } = reaction(aVal, bVal);
            
            aNext[idx] = aVal + dt * (Da * lapA + da);
            bNext[idx] = bVal + dt * (Db * lapB + db);
        }
    }
    
    return { a: aNext, b: bNext };
}

// ═══════════════════════════════════════════════════════════════════════════
// CELLULAR AUTOMATA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Conway's Game of Life step
 * 
 * @param {Uint8Array} grid - Current state (0 or 1)
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 * @returns {Uint8Array} Next state
 */
export function stepGameOfLife(grid, width, height) {
    const next = new Uint8Array(grid.length);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            let neighbors = 0;
            
            // Count 8 neighbors (with wrapping)
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    const nx = (x + dx + width) % width;
                    const ny = (y + dy + height) % height;
                    neighbors += grid[ny * width + nx];
                }
            }
            
            const alive = grid[idx];
            if (alive) {
                next[idx] = (neighbors === 2 || neighbors === 3) ? 1 : 0;
            } else {
                next[idx] = (neighbors === 3) ? 1 : 0;
            }
        }
    }
    
    return next;
}

/**
 * Generic cellular automaton step with custom rule
 * 
 * @param {Uint8Array} grid - Current state
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 * @param {Object} rule - Rule specification
 * @param {number[]} rule.birth - Neighbor counts that cause birth
 * @param {number[]} rule.survival - Neighbor counts that allow survival
 * @returns {Uint8Array} Next state
 */
export function stepCellularAutomaton(grid, width, height, rule) {
    const next = new Uint8Array(grid.length);
    const { birth, survival } = rule;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            let neighbors = 0;
            
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    const nx = (x + dx + width) % width;
                    const ny = (y + dy + height) % height;
                    if (grid[ny * width + nx] > 0) neighbors++;
                }
            }
            
            const alive = grid[idx] > 0;
            if (alive) {
                next[idx] = survival.includes(neighbors) ? 1 : 0;
            } else {
                next[idx] = birth.includes(neighbors) ? 1 : 0;
            }
        }
    }
    
    return next;
}

/**
 * Common CA rule presets
 */
export const CA_RULES = {
    // Conway's Game of Life (B3/S23)
    life: { birth: [3], survival: [2, 3] },
    // HighLife (B36/S23)
    highLife: { birth: [3, 6], survival: [2, 3] },
    // Seeds (B2/S)
    seeds: { birth: [2], survival: [] },
    // Day & Night (B3678/S34678)
    dayNight: { birth: [3, 6, 7, 8], survival: [3, 4, 6, 7, 8] },
    // Maze (B3/S12345)
    maze: { birth: [3], survival: [1, 2, 3, 4, 5] },
    // Anneal (B4678/S35678)
    anneal: { birth: [4, 6, 7, 8], survival: [3, 5, 6, 7, 8] }
};

/**
 * Initialize CA grid with random state
 * 
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 * @param {number} [density=0.3] - Initial fill density
 * @param {Function} [rng=Math.random] - Random function
 * @returns {Uint8Array}
 */
export function initCellularAutomaton(width, height, density = 0.3, rng = Math.random) {
    const grid = new Uint8Array(width * height);
    for (let i = 0; i < grid.length; i++) {
        grid[i] = rng() < density ? 1 : 0;
    }
    return grid;
}

// ── RGBA pixel-buffer API (DISTORT pipeline) ─────────────────────────────────

/**
 * Run Gray-Scott reaction-diffusion and render V concentration to RGBA greyscale.
 * @param {Uint8ClampedArray} src    - Source image (used to seed V field)
 * @param {number} w
 * @param {number} h
 * @param {string} preset            - Key from GRAY_SCOTT_PRESETS
 * @param {number} steps             - Simulation steps [10, 5000]
 * @param {number} seedSize          - Seed region size in pixels [5, 100]
 * @returns {Uint8ClampedArray}
 */
export function reactionDiffusionRGBA(src, w, h, preset, steps, seedSize) {
  const p = GRAY_SCOTT_PRESETS[preset] ?? GRAY_SCOTT_PRESETS.coral;
  const half = Math.floor(seedSize / 2), cx = w >> 1, cy = h >> 1, n = w * h;
  let u = new Float32Array(n).fill(1), v = new Float32Array(n).fill(0);
  for (let y = cy - half; y < cy + half && y < h; y++) for (let x = cx - half; x < cx + half && x < w; x++) {
    if (x >= 0 && y >= 0) {
      const i = y * w + x, j = i * 4;
      u[i] = 0.5;
      v[i] = 0.25 + ((src[j] * 0.299 + src[j + 1] * 0.587 + src[j + 2] * 0.114) / 255) * 0.1;
    }
  }
  const { Du, Dv, feed, kill } = p;
  let uN = new Float32Array(n), vN = new Float32Array(n);
  for (let step = 0; step < steps; step++) {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const l = x > 0 ? i - 1 : i, r = x < w - 1 ? i + 1 : i;
      const t = y > 0 ? i - w : i, b = y < h - 1 ? i + w : i;
      const lapU = u[l] + u[r] + u[t] + u[b] - 4 * u[i];
      const lapV = v[l] + v[r] + v[t] + v[b] - 4 * v[i];
      const uv2 = u[i] * v[i] * v[i];
      uN[i] = Math.max(0, Math.min(1, u[i] + Du * lapU - uv2 + feed * (1 - u[i])));
      vN[i] = Math.max(0, Math.min(1, v[i] + Dv * lapV + uv2 - (feed + kill) * v[i]));
    }
    [u, uN] = [uN, u]; [v, vN] = [vN, v];
  }
  const dst = new Uint8ClampedArray(src.length);
  for (let i = 0; i < n; i++) {
    const val = Math.round(v[i] * 255), j = i * 4;
    dst[j] = val; dst[j + 1] = val; dst[j + 2] = val; dst[j + 3] = src[j + 3];
  }
  return dst;
}

/**
 * Run cellular automaton (B/S rules) and blend result with source RGBA.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {string} ruleName   - Key from CA_RULES
 * @param {number} steps      - Simulation steps [1, 500]
 * @param {number} threshold  - Luminance threshold for initial grid [0, 255]
 * @param {number} blendAmt   - Alpha blend CA output over src [0, 1]
 * @returns {Uint8ClampedArray}
 */
export function cellularAutomataRGBA(src, w, h, ruleName, steps, threshold, blendAmt) {
  const rule = CA_RULES[ruleName] ?? CA_RULES.life;
  const n = w * h;
  let grid = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const j = i * 4;
    grid[i] = (src[j] * 0.299 + src[j + 1] * 0.587 + src[j + 2] * 0.114) > threshold ? 1 : 0;
  }
  for (let s = 0; s < steps; s++) grid = stepCellularAutomaton(grid, w, h, rule);
  const dst = new Uint8ClampedArray(src.length);
  const inv = 1 - blendAmt;
  for (let i = 0; i < n; i++) {
    const j = i * 4, ca = grid[i] * 255;
    dst[j]     = Math.round(src[j]     * inv + ca * blendAmt);
    dst[j + 1] = Math.round(src[j + 1] * inv + ca * blendAmt);
    dst[j + 2] = Math.round(src[j + 2] * inv + ca * blendAmt);
    dst[j + 3] = src[j + 3];
  }
  return dst;
}
