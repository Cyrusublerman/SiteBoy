/**
 * @fileoverview Advection and Flow Field Operations
 * 
 * Fluid-like transport of quantities through velocity fields.
 * All functions are pure and stateless (except where noted).
 * 
 * @module physics/advection
 */

// ═══════════════════════════════════════════════════════════════════════════
// VELOCITY FIELD SAMPLERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Bilinear interpolation for field sampling
 * 
 * @param {Float32Array} field - Scalar or vector field
 * @param {number} width - Field width
 * @param {number} height - Field height
 * @param {number} x - X coordinate (can be fractional)
 * @param {number} y - Y coordinate (can be fractional)
 * @param {number} [components=1] - Number of components per cell (1 for scalar, 2 for vector)
 * @returns {number|Array<number>} Interpolated value(s)
 */
export function bilinearSample(field, width, height, x, y, components = 1) {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const x1 = Math.min(x0 + 1, width - 1);
    const y1 = Math.min(y0 + 1, height - 1);
    const fx = x - x0;
    const fy = y - y0;
    
    const clampX0 = Math.max(0, x0);
    const clampY0 = Math.max(0, y0);
    
    if (components === 1) {
        const v00 = field[clampY0 * width + clampX0];
        const v10 = field[clampY0 * width + x1];
        const v01 = field[y1 * width + clampX0];
        const v11 = field[y1 * width + x1];
        
        return v00 * (1 - fx) * (1 - fy) +
               v10 * fx * (1 - fy) +
               v01 * (1 - fx) * fy +
               v11 * fx * fy;
    } else {
        const result = [];
        for (let c = 0; c < components; c++) {
            const v00 = field[(clampY0 * width + clampX0) * components + c];
            const v10 = field[(clampY0 * width + x1) * components + c];
            const v01 = field[(y1 * width + clampX0) * components + c];
            const v11 = field[(y1 * width + x1) * components + c];
            
            result.push(
                v00 * (1 - fx) * (1 - fy) +
                v10 * fx * (1 - fy) +
                v01 * (1 - fx) * fy +
                v11 * fx * fy
            );
        }
        return result;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// SEMI-LAGRANGIAN ADVECTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Semi-Lagrangian advection step (stable for any timestep)
 *
 * @source blog/ideas/reference documentation/08_Reaction_Diffusion_PDE/Advection.md
 * @wikipedia https://en.wikipedia.org/wiki/Semi-Lagrangian_method
 * @section 3.1 Semi-Lagrangian Advection
 * @formula \mathbf{x}' = \mathbf{x} - \Delta t \cdot \mathbf{u}(\mathbf{x})
 *
 * Traces backward through velocity field to find source value.
 *
 * @param {Float32Array} quantity - Scalar field to advect
 * @param {Float32Array} velocityX - X component of velocity field
 * @param {Float32Array} velocityY - Y component of velocity field
 * @param {number} width - Field width
 * @param {number} height - Field height
 * @param {number} dt - Timestep
 * @returns {Float32Array} Advected field
 */
export function advectSemiLagrangian(quantity, velocityX, velocityY, width, height, dt) {
    const result = new Float32Array(width * height);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            
            // Trace backward
            const vx = velocityX[idx];
            const vy = velocityY[idx];
            const srcX = x - dt * vx;
            const srcY = y - dt * vy;
            
            // Sample at source position
            result[idx] = bilinearSample(quantity, width, height, srcX, srcY);
        }
    }
    
    return result;
}

/**
 * MacCormack advection (reduced dissipation)
 * 
 * Predictor-corrector scheme for sharper results.
 * 
 * @param {Float32Array} quantity - Scalar field to advect
 * @param {Float32Array} velocityX - X velocity
 * @param {Float32Array} velocityY - Y velocity
 * @param {number} width - Field width
 * @param {number} height - Field height
 * @param {number} dt - Timestep
 * @returns {Float32Array} Advected field
 */
export function advectMacCormack(quantity, velocityX, velocityY, width, height, dt) {
    // Forward pass
    const phiHat = advectSemiLagrangian(quantity, velocityX, velocityY, width, height, dt);
    
    // Backward pass
    const phiHatHat = advectSemiLagrangian(phiHat, velocityX, velocityY, width, height, -dt);
    
    // Correction
    const result = new Float32Array(width * height);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            
            // MacCormack correction
            let corrected = phiHat[idx] + 0.5 * (quantity[idx] - phiHatHat[idx]);
            
            // Clamp to local min/max to prevent oscillations
            const srcX = x - dt * velocityX[idx];
            const srcY = y - dt * velocityY[idx];
            const x0 = Math.floor(srcX), y0 = Math.floor(srcY);
            const x1 = x0 + 1, y1 = y0 + 1;
            
            let minVal = Infinity, maxVal = -Infinity;
            for (let sy = y0; sy <= y1; sy++) {
                for (let sx = x0; sx <= x1; sx++) {
                    if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
                        const v = quantity[sy * width + sx];
                        minVal = Math.min(minVal, v);
                        maxVal = Math.max(maxVal, v);
                    }
                }
            }
            
            result[idx] = Math.max(minVal, Math.min(maxVal, corrected));
        }
    }
    
    return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// PARTICLE ADVECTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Advect single particle using Euler integration
 * 
 * @param {number} x - Particle X
 * @param {number} y - Particle Y
 * @param {Float32Array} velocityX - X velocity field
 * @param {Float32Array} velocityY - Y velocity field
 * @param {number} width - Field width
 * @param {number} height - Field height
 * @param {number} dt - Timestep
 * @returns {{x: number, y: number}} New position
 */
export function advectParticleEuler(x, y, velocityX, velocityY, width, height, dt) {
    const vx = bilinearSample(velocityX, width, height, x, y);
    const vy = bilinearSample(velocityY, width, height, x, y);
    
    return {
        x: x + dt * vx,
        y: y + dt * vy
    };
}

/**
 * Advect single particle using RK4 integration (more accurate)
 * 
 * @param {number} x - Particle X
 * @param {number} y - Particle Y
 * @param {Float32Array} velocityX - X velocity field
 * @param {Float32Array} velocityY - Y velocity field
 * @param {number} width - Field width
 * @param {number} height - Field height
 * @param {number} dt - Timestep
 * @returns {{x: number, y: number}} New position
 */
export function advectParticleRK4(x, y, velocityX, velocityY, width, height, dt) {
    // k1
    const k1x = bilinearSample(velocityX, width, height, x, y);
    const k1y = bilinearSample(velocityY, width, height, x, y);
    
    // k2
    const k2x = bilinearSample(velocityX, width, height, x + 0.5 * dt * k1x, y + 0.5 * dt * k1y);
    const k2y = bilinearSample(velocityY, width, height, x + 0.5 * dt * k1x, y + 0.5 * dt * k1y);
    
    // k3
    const k3x = bilinearSample(velocityX, width, height, x + 0.5 * dt * k2x, y + 0.5 * dt * k2y);
    const k3y = bilinearSample(velocityY, width, height, x + 0.5 * dt * k2x, y + 0.5 * dt * k2y);
    
    // k4
    const k4x = bilinearSample(velocityX, width, height, x + dt * k3x, y + dt * k3y);
    const k4y = bilinearSample(velocityY, width, height, x + dt * k3x, y + dt * k3y);
    
    return {
        x: x + dt * (k1x + 2 * k2x + 2 * k3x + k4x) / 6,
        y: y + dt * (k1y + 2 * k2y + 2 * k3y + k4y) / 6
    };
}

/**
 * Trace streamline from starting point
 * 
 * @param {number} startX - Start X
 * @param {number} startY - Start Y
 * @param {Float32Array} velocityX - X velocity field
 * @param {Float32Array} velocityY - Y velocity field
 * @param {number} width - Field width
 * @param {number} height - Field height
 * @param {number} dt - Step size
 * @param {number} maxSteps - Maximum steps
 * @returns {Array<{x: number, y: number}>} Streamline points
 */
export function traceStreamline(startX, startY, velocityX, velocityY, width, height, dt, maxSteps) {
    const points = [{ x: startX, y: startY }];
    let x = startX, y = startY;
    
    for (let i = 0; i < maxSteps; i++) {
        const next = advectParticleRK4(x, y, velocityX, velocityY, width, height, dt);
        
        // Stop if out of bounds
        if (next.x < 0 || next.x >= width || next.y < 0 || next.y >= height) break;
        
        // Stop if velocity too low
        const vx = bilinearSample(velocityX, width, height, next.x, next.y);
        const vy = bilinearSample(velocityY, width, height, next.x, next.y);
        if (vx * vx + vy * vy < 0.0001) break;
        
        points.push(next);
        x = next.x;
        y = next.y;
    }
    
    return points;
}

/**
 * Streamline as polyline; Euler or RK4 per step.
 * @param {number} startX
 * @param {number} startY
 * @param {Float32Array} velocityX
 * @param {Float32Array} velocityY
 * @param {number} width
 * @param {number} height
 * @param {number} [dt=1]
 * @param {number} [maxSteps=200]
 * @param {'euler'|'rk4'} [method='rk4']
 * @returns {Array<{x: number, y: number}>}
 */
export function streamlineIntegrate2D(
    startX,
    startY,
    velocityX,
    velocityY,
    width,
    height,
    dt = 1,
    maxSteps = 200,
    method = 'rk4'
) {
    const points = [{ x: startX, y: startY }];
    let x = startX;
    let y = startY;
    const stepFn = method === 'euler' ? advectParticleEuler : advectParticleRK4;
    for (let i = 0; i < maxSteps; i++) {
        const next = stepFn(x, y, velocityX, velocityY, width, height, dt);
        if (next.x < 0 || next.x >= width || next.y < 0 || next.y >= height) break;
        const vx = bilinearSample(velocityX, width, height, next.x, next.y);
        const vy = bilinearSample(velocityY, width, height, next.x, next.y);
        if (vx * vx + vy * vy < 0.0001) break;
        points.push(next);
        x = next.x;
        y = next.y;
    }
    return points;
}

// ═══════════════════════════════════════════════════════════════════════════
// VELOCITY FIELD GENERATORS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate uniform velocity field
 * 
 * @param {number} width - Field width
 * @param {number} height - Field height
 * @param {number} vx - X velocity
 * @param {number} vy - Y velocity
 * @returns {{velocityX: Float32Array, velocityY: Float32Array}}
 */
export function uniformVelocityField(width, height, vx, vy) {
    const size = width * height;
    const velocityX = new Float32Array(size).fill(vx);
    const velocityY = new Float32Array(size).fill(vy);
    return { velocityX, velocityY };
}

/**
 * Generate rotational velocity field
 * 
 * @param {number} width - Field width
 * @param {number} height - Field height
 * @param {number} cx - Center X
 * @param {number} cy - Center Y
 * @param {number} strength - Rotation strength
 * @returns {{velocityX: Float32Array, velocityY: Float32Array}}
 */
export function rotationalVelocityField(width, height, cx, cy, strength) {
    const velocityX = new Float32Array(width * height);
    const velocityY = new Float32Array(width * height);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            const dx = x - cx;
            const dy = y - cy;
            const r = Math.sqrt(dx * dx + dy * dy) || 1;
            
            velocityX[idx] = -strength * dy / r;
            velocityY[idx] = strength * dx / r;
        }
    }
    
    return { velocityX, velocityY };
}

/**
 * Generate curl noise velocity field (divergence-free)
 * 
 * @param {number} width - Field width
 * @param {number} height - Field height
 * @param {Function} noiseFunc - 2D noise function
 * @param {number} scale - Noise scale
 * @param {number} strength - Velocity strength
 * @returns {{velocityX: Float32Array, velocityY: Float32Array}}
 */
export function curlNoiseVelocityField(width, height, noiseFunc, scale, strength) {
    const velocityX = new Float32Array(width * height);
    const velocityY = new Float32Array(width * height);
    const eps = 0.001;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            const nx = x * scale;
            const ny = y * scale;
            
            // Curl of scalar noise field
            const n1 = noiseFunc(nx, ny + eps);
            const n2 = noiseFunc(nx, ny - eps);
            const n3 = noiseFunc(nx + eps, ny);
            const n4 = noiseFunc(nx - eps, ny);
            
            velocityX[idx] = strength * (n1 - n2) / (2 * eps);
            velocityY[idx] = -strength * (n3 - n4) / (2 * eps);
        }
    }
    
    return { velocityX, velocityY };
}

/**
 * Pointwise curl noise sample (2-D).
 *
 * @param {number} x
 * @param {number} y
 * @param {function(number, number): number} noiseFunc
 * @param {number} [scale=1]
 * @param {number} [eps=0.001]
 * @returns {{ vx: number, vy: number }}
 */
export function curlNoise2D(x, y, noiseFunc, scale = 1, eps = 0.001) {
    const nx = x * scale;
    const ny = y * scale;
    const n1 = noiseFunc(nx, ny + eps);
    const n2 = noiseFunc(nx, ny - eps);
    const n3 = noiseFunc(nx + eps, ny);
    const n4 = noiseFunc(nx - eps, ny);
    return {
        vx: (n1 - n2) / (2 * eps),
        vy: -(n3 - n4) / (2 * eps)
    };
}
