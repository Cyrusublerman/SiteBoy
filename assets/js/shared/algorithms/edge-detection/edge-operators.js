/**
 * @fileoverview Edge Detection Algorithms
 * 
 * Mathematical Foundation:
 * Edge detection finds discontinuities in image intensity by computing
 * gradients (first derivatives) or zero-crossings (second derivatives).
 * 
 * Gradient Magnitude: G = √(Gₓ² + Gᵧ²)
 * Gradient Direction: Θ = atan2(Gᵧ, Gₓ)
 * 
 * @see Reference: 01_Edge_Gradient_Differential_Operators/*.md
 */

import { Matrix } from '../core/matrix.js';
import { MathUtils } from '../core/math-utils.js';

// ═══════════════════════════════════════════════════════════════════════════
// SOBEL OPERATOR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Sobel edge detection operator
 *
 * @source blog/ideas/reference documentation/01_Edge_Gradient_Differential_Operators/Sobel_operator.md
 * @wikipedia https://en.wikipedia.org/wiki/Sobel_operator
 * @section Formulation
 * @formula \mathbf{G}_x = \begin{bmatrix}-1&0&+1\\-2&0&+2\\-1&0&+1\end{bmatrix} * \mathbf{A}; \mathbf{G}_y = \begin{bmatrix}-1&-2&-1\\0&0&0\\+1&+2&+1\end{bmatrix} * \mathbf{A}
 *
 * Mathematics:
 *   Gₓ = [[-1,0,+1],[-2,0,+2],[-1,0,+1]] * A
 *   Gᵧ = [[-1,-2,-1],[0,0,0],[+1,+2,+1]] * A
 *   G = √(Gₓ² + Gᵧ²)
 *   Θ = atan2(Gᵧ, Gₓ)
 *
 * Separable form (efficient):
 *   Gₓ = [1,2,1]ᵀ * ([1,0,-1] * A)
 *   Gᵧ = [1,0,-1]ᵀ * ([1,2,1] * A)
 *
 * @param {Float32Array} image - Grayscale image [0-255]
 * @param {number} width
 * @param {number} height
 * @returns {{magnitude: Float32Array, direction: Float32Array, gx: Float32Array, gy: Float32Array}}
 */
export function sobel(image, width, height) {
    // Compute horizontal and vertical gradients
    const gx = Matrix.convolve2D(image, width, height, Matrix.kernels.sobelX);
    const gy = Matrix.convolve2D(image, width, height, Matrix.kernels.sobelY);
    
    const size = width * height;
    const magnitude = new Float32Array(size);
    const direction = new Float32Array(size);
    
    for (let i = 0; i < size; i++) {
        // G = √(Gₓ² + Gᵧ²)
        magnitude[i] = Math.sqrt(gx[i] * gx[i] + gy[i] * gy[i]);
        // Θ = atan2(Gᵧ, Gₓ)
        direction[i] = Math.atan2(gy[i], gx[i]);
    }
    
    return { magnitude, direction, gx, gy };
}

// ═══════════════════════════════════════════════════════════════════════════
// SCHARR OPERATOR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Scharr operator - better rotational symmetry than Sobel
 *
 * @source blog/ideas/reference documentation/01_Edge_Gradient_Differential_Operators/Scharr_operator.md
 * @wikipedia https://en.wikipedia.org/wiki/Scharr_operator
 * @section Scharr operator
 * @formula G_x = \begin{bmatrix}-3&0&3\\-10&0&10\\-3&0&3\end{bmatrix}; G_y = \begin{bmatrix}-3&-10&-3\\0&0&0\\3&10&3\end{bmatrix}
 *
 * Kernels:
 *   Gₓ = [[-3,0,3],[-10,0,10],[-3,0,3]]
 *   Gᵧ = [[-3,-10,-3],[0,0,0],[3,10,3]]
 *
 * @param {Float32Array} image
 * @param {number} width
 * @param {number} height
 * @returns {{magnitude: Float32Array, direction: Float32Array}}
 */
export function scharr(image, width, height) {
    const gx = Matrix.convolve2D(image, width, height, Matrix.kernels.scharrX);
    const gy = Matrix.convolve2D(image, width, height, Matrix.kernels.scharrY);
    
    const size = width * height;
    const magnitude = new Float32Array(size);
    const direction = new Float32Array(size);
    
    for (let i = 0; i < size; i++) {
        magnitude[i] = Math.sqrt(gx[i] * gx[i] + gy[i] * gy[i]);
        direction[i] = Math.atan2(gy[i], gx[i]);
    }
    
    return { magnitude, direction, gx, gy };
}

// ═══════════════════════════════════════════════════════════════════════════
// PREWITT OPERATOR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Prewitt operator - simpler than Sobel (uniform smoothing)
 *
 * @source blog/ideas/reference documentation/01_Edge_Gradient_Differential_Operators/Prewitt_operator.md
 * @wikipedia https://en.wikipedia.org/wiki/Prewitt_operator
 * @section Prewitt operator
 * @formula G_x = \begin{bmatrix}-1&0&1\\-1&0&1\\-1&0&1\end{bmatrix}; G_y = \begin{bmatrix}-1&-1&-1\\0&0&0\\1&1&1\end{bmatrix}
 *
 * Kernels:
 *   Gₓ = [[-1,0,1],[-1,0,1],[-1,0,1]]
 *   Gᵧ = [[-1,-1,-1],[0,0,0],[1,1,1]]
 *
 * @param {Float32Array} image
 * @param {number} width
 * @param {number} height
 * @returns {{magnitude: Float32Array, direction: Float32Array}}
 */
export function prewitt(image, width, height) {
    const gx = Matrix.convolve2D(image, width, height, Matrix.kernels.prewittX);
    const gy = Matrix.convolve2D(image, width, height, Matrix.kernels.prewittY);
    
    const size = width * height;
    const magnitude = new Float32Array(size);
    const direction = new Float32Array(size);
    
    for (let i = 0; i < size; i++) {
        magnitude[i] = Math.sqrt(gx[i] * gx[i] + gy[i] * gy[i]);
        direction[i] = Math.atan2(gy[i], gx[i]);
    }
    
    return { magnitude, direction };
}

// ═══════════════════════════════════════════════════════════════════════════
// ROBERTS CROSS OPERATOR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Roberts cross operator - 2×2 diagonal gradient
 *
 * @source blog/ideas/reference documentation/01_Edge_Gradient_Differential_Operators/Roberts_cross.md
 * @wikipedia https://en.wikipedia.org/wiki/Roberts_cross
 * @section Formulation
 * @formula G_x = \begin{bmatrix}+1&0\\0&-1\end{bmatrix}; G_y = \begin{bmatrix}0&+1\\-1&0\end{bmatrix}
 *
 * Kernels:
 *   Gₓ = [[1,0],[0,-1]]
 *   Gᵧ = [[0,1],[-1,0]]
 *
 * Good for diagonal edges, fast computation
 *
 * @param {Float32Array} image
 * @param {number} width
 * @param {number} height
 * @returns {{magnitude: Float32Array, direction: Float32Array}}
 */
export function robertsCross(image, width, height) {
    const gx = Matrix.convolve2D(image, width, height, Matrix.kernels.robertsX);
    const gy = Matrix.convolve2D(image, width, height, Matrix.kernels.robertsY);
    
    const size = width * height;
    const magnitude = new Float32Array(size);
    const direction = new Float32Array(size);
    
    for (let i = 0; i < size; i++) {
        magnitude[i] = Math.sqrt(gx[i] * gx[i] + gy[i] * gy[i]);
        direction[i] = Math.atan2(gy[i], gx[i]);
    }
    
    return { magnitude, direction };
}

// ═══════════════════════════════════════════════════════════════════════════
// LAPLACIAN OPERATOR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Laplacian edge detection (second derivative)
 *
 * @source blog/ideas/reference documentation/01_Edge_Gradient_Differential_Operators/Laplacian.md
 * @wikipedia https://en.wikipedia.org/wiki/Laplace_operator
 * @section Definition
 * @formula \nabla^2 f = \frac{\partial^2 f}{\partial x^2} + \frac{\partial^2 f}{\partial y^2}
 *
 * ∇²f = ∂²f/∂x² + ∂²f/∂y²
 *
 * Discrete approximation (4-connected):
 *   [[0,1,0],[1,-4,1],[0,1,0]]
 *
 * Edges are detected at zero-crossings
 *
 * @param {Float32Array} image
 * @param {number} width
 * @param {number} height
 * @param {boolean} [use8Connected=false] - Use 8-connected kernel
 * @returns {Float32Array}
 */
export function laplacian(image, width, height, use8Connected = false) {
    const kernel = use8Connected ? Matrix.kernels.laplacian8 : Matrix.kernels.laplacian4;
    return Matrix.convolve2D(image, width, height, kernel);
}

// ═══════════════════════════════════════════════════════════════════════════
// LAPLACIAN OF GAUSSIAN (LoG)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Laplacian of Gaussian (LoG) - Marr-Hildreth edge detector
 *
 * @source blog/ideas/reference documentation/01_Edge_Gradient_Differential_Operators/Laplacian_of_Gaussian.md
 * @wikipedia https://en.wikipedia.org/wiki/Blob_detection#The_Laplacian_of_Gaussian
 * @section The Laplacian of Gaussian
 * @formula \nabla^2 L = L_{xx} + L_{yy}
 *
 * LoG(x,y) = -(1/πσ⁴)[1 - (x² + y²)/2σ²] · exp(-(x² + y²)/2σ²)
 *
 * Combines Gaussian smoothing with Laplacian edge detection.
 * Edges are found at zero-crossings.
 *
 * @param {Float32Array} image
 * @param {number} width
 * @param {number} height
 * @param {number} sigma - Gaussian sigma (controls scale)
 * @returns {Float32Array}
 */
export function laplacianOfGaussian(image, width, height, sigma = 1.4) {
    const size = Math.ceil(sigma * 6) | 1;
    const kernel = Matrix.laplacianOfGaussianKernel(size, sigma);
    return Matrix.convolve2D(image, width, height, kernel);
}

// ═══════════════════════════════════════════════════════════════════════════
// DIFFERENCE OF GAUSSIANS (DoG)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Difference of Gaussians - approximates LoG
 *
 * @source blog/ideas/reference documentation/01_Edge_Gradient_Differential_Operators/Difference_of_Gaussians.md
 * @wikipedia https://en.wikipedia.org/wiki/Difference_of_Gaussians
 * @section Formulation
 * @formula K_{t_1,t_2} = \Phi_{t_1} - \Phi_{t_2}
 *
 * DoG(x,y) = G(x,y,σ₁) - G(x,y,σ₂)
 *
 * Typically σ₂ = k·σ₁ where k ≈ 1.6 approximates LoG
 *
 * @param {Float32Array} image
 * @param {number} width
 * @param {number} height
 * @param {number} sigma1 - First Gaussian sigma
 * @param {number} sigma2 - Second Gaussian sigma (larger)
 * @returns {Float32Array}
 */
export function differenceOfGaussians(image, width, height, sigma1 = 1.0, sigma2 = 1.6) {
    const g1 = Matrix.gaussianBlur(image, width, height, sigma1);
    const g2 = Matrix.gaussianBlur(image, width, height, sigma2);
    
    const size = width * height;
    const result = new Float32Array(size);
    
    for (let i = 0; i < size; i++) {
        result[i] = g1[i] - g2[i];
    }
    
    return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// CANNY EDGE DETECTOR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Canny edge detection - multi-stage algorithm
 *
 * @source blog/ideas/reference documentation/01_Edge_Gradient_Differential_Operators/Canny_edge_detector.md
 * @wikipedia https://en.wikipedia.org/wiki/Canny_edge_detector
 * @section Process
 * @formula Gradient: G = \sqrt{G_x^2 + G_y^2}, \Theta = \tan^{-1}(G_y / G_x)
 *
 * Steps:
 * 1. Gaussian smoothing: H = (1/2πσ²)·exp(-(i² + j²)/2σ²)
 * 2. Gradient computation: G = √(Gₓ² + Gᵧ²), Θ = atan2(Gᵧ, Gₓ)
 * 3. Non-maximum suppression
 * 4. Double thresholding
 * 5. Edge tracking by hysteresis
 *
 * @param {Float32Array} image
 * @param {number} width
 * @param {number} height
 * @param {Object} options
 * @param {number} [options.sigma=1.4] - Gaussian sigma
 * @param {number} [options.lowThreshold=0.1] - Low threshold (0-1)
 * @param {number} [options.highThreshold=0.3] - High threshold (0-1)
 * @returns {{edges: Uint8Array, magnitude: Float32Array, direction: Float32Array}}
 */
export function canny(image, width, height, options = {}) {
    const {
        sigma = 1.4,
        lowThreshold = 0.1,
        highThreshold = 0.3
    } = options;
    
    const size = width * height;
    
    // Step 1: Gaussian smoothing
    const smoothed = Matrix.gaussianBlur(image, width, height, sigma);
    
    // Step 2: Compute gradients using Sobel
    const { magnitude, direction, gx, gy } = sobel(smoothed, width, height);
    
    // Find max magnitude for normalization
    let maxMag = 0;
    for (let i = 0; i < size; i++) {
        if (magnitude[i] > maxMag) maxMag = magnitude[i];
    }
    
    // Step 3: Non-maximum suppression
    const suppressed = new Float32Array(size);
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = y * width + x;
            const mag = magnitude[idx];
            const dir = direction[idx];
            
            // Quantize direction to 4 angles (0°, 45°, 90°, 135°)
            // and get interpolated neighbor magnitudes
            const angle = (dir + Math.PI) % Math.PI; // [0, π)
            
            let mag1, mag2;
            
            if (angle < Math.PI / 8 || angle >= 7 * Math.PI / 8) {
                // Horizontal edge (compare left/right)
                mag1 = magnitude[idx - 1];
                mag2 = magnitude[idx + 1];
            } else if (angle < 3 * Math.PI / 8) {
                // 45° diagonal
                mag1 = magnitude[(y - 1) * width + (x + 1)];
                mag2 = magnitude[(y + 1) * width + (x - 1)];
            } else if (angle < 5 * Math.PI / 8) {
                // Vertical edge (compare top/bottom)
                mag1 = magnitude[(y - 1) * width + x];
                mag2 = magnitude[(y + 1) * width + x];
            } else {
                // 135° diagonal
                mag1 = magnitude[(y - 1) * width + (x - 1)];
                mag2 = magnitude[(y + 1) * width + (x + 1)];
            }
            
            // Suppress if not local maximum
            if (mag >= mag1 && mag >= mag2) {
                suppressed[idx] = mag;
            }
        }
    }
    
    // Step 4: Double thresholding
    const lowThresh = lowThreshold * maxMag;
    const highThresh = highThreshold * maxMag;
    
    const edges = new Uint8Array(size);
    const WEAK = 128;
    const STRONG = 255;
    
    for (let i = 0; i < size; i++) {
        if (suppressed[i] >= highThresh) {
            edges[i] = STRONG;
        } else if (suppressed[i] >= lowThresh) {
            edges[i] = WEAK;
        }
    }
    
    // Step 5: Edge tracking by hysteresis
    // Connect weak edges to strong edges
    let changed = true;
    while (changed) {
        changed = false;
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = y * width + x;
                
                if (edges[idx] === WEAK) {
                    // Check 8-connected neighbors for strong edge
                    const hasStrongNeighbor = 
                        edges[(y-1) * width + (x-1)] === STRONG ||
                        edges[(y-1) * width + x] === STRONG ||
                        edges[(y-1) * width + (x+1)] === STRONG ||
                        edges[y * width + (x-1)] === STRONG ||
                        edges[y * width + (x+1)] === STRONG ||
                        edges[(y+1) * width + (x-1)] === STRONG ||
                        edges[(y+1) * width + x] === STRONG ||
                        edges[(y+1) * width + (x+1)] === STRONG;
                    
                    if (hasStrongNeighbor) {
                        edges[idx] = STRONG;
                        changed = true;
                    }
                }
            }
        }
    }
    
    // Remove remaining weak edges
    for (let i = 0; i < size; i++) {
        if (edges[i] === WEAK) edges[i] = 0;
    }
    
    return { edges, magnitude, direction };
}

// ═══════════════════════════════════════════════════════════════════════════
// ZERO-CROSSING DETECTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Detect zero-crossings in image (for LoG/DoG edge detection)
 * 
 * @param {Float32Array} image - LoG or DoG filtered image
 * @param {number} width 
 * @param {number} height 
 * @param {number} [threshold=0] - Minimum gradient at zero-crossing
 * @returns {Uint8Array} - Binary edge image
 */
export function zeroCrossings(image, width, height, threshold = 0) {
    const edges = new Uint8Array(width * height);
    
    for (let y = 0; y < height - 1; y++) {
        for (let x = 0; x < width - 1; x++) {
            const idx = y * width + x;
            const val = image[idx];
            
            // Check horizontal and vertical neighbors for sign change
            const rightVal = image[idx + 1];
            const bottomVal = image[(y + 1) * width + x];
            
            // Zero-crossing: sign change with sufficient gradient
            const hCross = (val * rightVal < 0) && 
                           (Math.abs(val - rightVal) > threshold);
            const vCross = (val * bottomVal < 0) && 
                           (Math.abs(val - bottomVal) > threshold);
            
            if (hCross || vCross) {
                edges[idx] = 255;
            }
        }
    }
    
    return edges;
}

// ═══════════════════════════════════════════════════════════════════════════
// GRADIENT FIELD UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Compute structure tensor (second moment matrix)
 * Used for corner detection and orientation estimation
 * 
 * J = [Σ Iₓ²    Σ IₓIᵧ]
 *     [Σ IₓIᵧ   Σ Iᵧ² ]
 * 
 * @param {Float32Array} image 
 * @param {number} width 
 * @param {number} height 
 * @param {number} [sigma=1.0] - Gaussian window sigma
 * @returns {{j11: Float32Array, j12: Float32Array, j22: Float32Array}}
 */
export function structureTensor(image, width, height, sigma = 1.0) {
    const { gx, gy } = sobel(image, width, height);
    const size = width * height;
    
    // Compute tensor components
    const ixix = new Float32Array(size);
    const ixiy = new Float32Array(size);
    const iyiy = new Float32Array(size);
    
    for (let i = 0; i < size; i++) {
        ixix[i] = gx[i] * gx[i];
        ixiy[i] = gx[i] * gy[i];
        iyiy[i] = gy[i] * gy[i];
    }
    
    // Gaussian smoothing of tensor components
    const j11 = Matrix.gaussianBlur(ixix, width, height, sigma);
    const j12 = Matrix.gaussianBlur(ixiy, width, height, sigma);
    const j22 = Matrix.gaussianBlur(iyiy, width, height, sigma);
    
    return { j11, j12, j22 };
}

/**
 * Compute dominant orientation from structure tensor
 * 
 * θ = ½ atan2(2·J₁₂, J₁₁ - J₂₂)
 * 
 * @param {{j11: Float32Array, j12: Float32Array, j22: Float32Array}} tensor 
 * @param {number} width 
 * @param {number} height 
 * @returns {Float32Array} - Orientation angles
 */
export function dominantOrientation(tensor, width, height) {
    const { j11, j12, j22 } = tensor;
    const size = width * height;
    const orientation = new Float32Array(size);
    
    for (let i = 0; i < size; i++) {
        orientation[i] = 0.5 * Math.atan2(2 * j12[i], j11[i] - j22[i]);
    }
    
    return orientation;
}

export default {
    sobel,
    scharr,
    prewitt,
    robertsCross,
    laplacian,
    laplacianOfGaussian,
    differenceOfGaussians,
    canny,
    zeroCrossings,
    structureTensor,
    dominantOrientation
};

// ── RGBA pixel-buffer API (DISTORT pipeline) ─────────────────────────────────
// These functions operate on Uint8ClampedArray RGBA buffers directly,
// matching the DISTORT node pipeline contract.

function _luma(src, n) {
  const lum = new Float32Array(n);
  for (let i = 0; i < n; i++) { const j = i * 4; lum[i] = src[j] * 0.299 + src[j + 1] * 0.587 + src[j + 2] * 0.114; }
  return lum;
}

function _gaussBlur1D(src, n, w, h, sigma) {
  const rad = Math.ceil(sigma * 3);
  const k = new Float32Array(rad * 2 + 1); let ks = 0;
  for (let i = -rad; i <= rad; i++) { k[i + rad] = Math.exp(-(i * i) / (2 * sigma * sigma)); ks += k[i + rad]; }
  for (let i = 0; i < k.length; i++) k[i] /= ks;
  const tmp = new Float32Array(n), out = new Float32Array(n);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let v = 0; for (let j = -rad; j <= rad; j++) v += src[y * w + Math.max(0, Math.min(w - 1, x + j))] * k[j + rad]; tmp[y * w + x] = v;
  }
  for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) {
    let v = 0; for (let j = -rad; j <= rad; j++) v += tmp[Math.max(0, Math.min(h - 1, y + j)) * w + x] * k[j + rad]; out[y * w + x] = v;
  }
  return out;
}

/**
 * Sobel edge detection on an RGBA buffer.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} [threshold=0]   - Edges below this magnitude are zeroed [0, 255]
 * @param {boolean} [normalize=true] - Stretch magnitude to full 0–255 range
 * @returns {Uint8ClampedArray}
 */
export function sobelEdge(src, w, h, threshold = 0, normalize = true) {
  const n = w * h, lum = _luma(src, n);
  const mag = new Float32Array(n); let maxMag = 0;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x;
    const gx = -lum[i - w - 1] + lum[i - w + 1] - 2 * lum[i - 1] + 2 * lum[i + 1] - lum[i + w - 1] + lum[i + w + 1];
    const gy = -lum[i - w - 1] - 2 * lum[i - w] - lum[i - w + 1] + lum[i + w - 1] + 2 * lum[i + w] + lum[i + w + 1];
    mag[i] = Math.sqrt(gx * gx + gy * gy); if (mag[i] > maxMag) maxMag = mag[i];
  }
  const scale = normalize && maxMag > 0 ? 255 / maxMag : 1;
  const dst = new Uint8ClampedArray(src.length);
  for (let i = 0; i < n; i++) {
    const v = Math.min(255, mag[i] * scale), j = i * 4;
    dst[j] = dst[j + 1] = dst[j + 2] = v > threshold ? v : 0; dst[j + 3] = src[j + 3];
  }
  return dst;
}

/**
 * Laplacian edge detection on an RGBA buffer.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {'4-conn'|'8-conn'} [mode='4-conn'] - Connectivity kernel
 * @param {boolean} [normalize=true]
 * @returns {Uint8ClampedArray}
 */
export function laplacianEdge(src, w, h, mode = '4-conn', normalize = true) {
  const n = w * h, lum = _luma(src, n);
  const use8 = mode === '8-conn';
  const out = new Float32Array(n); let maxV = 0;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x;
    const v = use8
      ? lum[i - w - 1] + lum[i - w] + lum[i - w + 1] + lum[i - 1] - 8 * lum[i] + lum[i + 1] + lum[i + w - 1] + lum[i + w] + lum[i + w + 1]
      : lum[i - w] + lum[i - 1] - 4 * lum[i] + lum[i + 1] + lum[i + w];
    out[i] = Math.abs(v); if (out[i] > maxV) maxV = out[i];
  }
  const scale = normalize && maxV > 0 ? 255 / maxV : 1;
  const dst = new Uint8ClampedArray(src.length);
  for (let i = 0; i < n; i++) { const v = Math.min(255, out[i] * scale), j = i * 4; dst[j] = dst[j + 1] = dst[j + 2] = v; dst[j + 3] = src[j + 3]; }
  return dst;
}

/**
 * Difference of Gaussians — approximates LoG edge detection.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} [sigma1=1]      - Fine scale sigma
 * @param {number} [sigma2=1.6]    - Coarse scale sigma (must be > sigma1)
 * @param {number} [threshold=5]   - Minimum abs(G1-G2) to register as edge [0, 50]
 * @returns {Uint8ClampedArray}
 */
export function differenceOfGaussiansRGBA(src, w, h, sigma1 = 1, sigma2 = 1.6, threshold = 5) {
  const n = w * h, lum = _luma(src, n);
  const g1 = _gaussBlur1D(lum, n, w, h, sigma1);
  const g2 = _gaussBlur1D(lum, n, w, h, sigma2);
  const dst = new Uint8ClampedArray(src.length);
  for (let i = 0; i < n; i++) {
    const v = Math.abs(g1[i] - g2[i]);
    const val = v > threshold ? Math.min(255, v) : 0;
    const j = i * 4; dst[j] = dst[j + 1] = dst[j + 2] = val; dst[j + 3] = src[j + 3];
  }
  return dst;
}

/**
 * Canny edge detection — Gaussian smooth → Sobel gradient → NMS → hysteresis.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} [sigma=1.4]          - Gaussian pre-blur sigma [0.5, 5]
 * @param {number} [lowThreshold=0.1]   - Hysteresis low threshold (fraction of max) [0.01, 0.5]
 * @param {number} [highThreshold=0.3]  - Hysteresis high threshold (fraction of max) [0.05, 1]
 * @returns {Uint8ClampedArray}
 */
export function cannyEdge(src, w, h, sigma = 1.4, lowThreshold = 0.1, highThreshold = 0.3) {
  const n = w * h, grey = _luma(src, n);
  const smooth = _gaussBlur1D(grey, n, w, h, sigma);

  const mag = new Float32Array(n), dir = new Float32Array(n); let maxM = 0;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x;
    const gx = -smooth[i - w - 1] + smooth[i - w + 1] - 2 * smooth[i - 1] + 2 * smooth[i + 1] - smooth[i + w - 1] + smooth[i + w + 1];
    const gy = -smooth[i - w - 1] - 2 * smooth[i - w] - smooth[i - w + 1] + smooth[i + w - 1] + 2 * smooth[i + w] + smooth[i + w + 1];
    mag[i] = Math.sqrt(gx * gx + gy * gy); dir[i] = Math.atan2(gy, gx); if (mag[i] > maxM) maxM = mag[i];
  }

  const nms = new Float32Array(n);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x, a = (dir[i] + Math.PI) % Math.PI; let m1, m2;
    if (a < Math.PI / 8 || a >= 7 * Math.PI / 8) { m1 = mag[i - 1]; m2 = mag[i + 1]; }
    else if (a < 3 * Math.PI / 8) { m1 = mag[i - w + 1]; m2 = mag[i + w - 1]; }
    else if (a < 5 * Math.PI / 8) { m1 = mag[i - w]; m2 = mag[i + w]; }
    else { m1 = mag[i - w - 1]; m2 = mag[i + w + 1]; }
    nms[i] = (mag[i] >= m1 && mag[i] >= m2) ? mag[i] : 0;
  }

  const lo = lowThreshold * maxM, hi = highThreshold * maxM;
  const edges = new Uint8Array(n);
  for (let i = 0; i < n; i++) edges[i] = nms[i] >= hi ? 255 : nms[i] >= lo ? 128 : 0;
  let changed = true;
  while (changed) {
    changed = false;
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (edges[i] === 128) {
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          if (edges[(y + dy) * w + x + dx] === 255) { edges[i] = 255; changed = true; break; }
        }
      }
    }
  }
  for (let i = 0; i < n; i++) if (edges[i] === 128) edges[i] = 0;

  const dst = new Uint8ClampedArray(src.length);
  for (let i = 0; i < n; i++) { const j = i * 4; dst[j] = dst[j + 1] = dst[j + 2] = edges[i]; dst[j + 3] = src[j + 3]; }
  return dst;
}

