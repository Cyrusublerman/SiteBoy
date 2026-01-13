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

