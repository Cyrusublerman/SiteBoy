/**
 * @fileoverview Matrix operations and 2D convolution for image processing.
 * 
 * Mathematical Reference:
 * - 2D Convolution: N(x,y) = Σᵢ Σⱼ K(i,j) · P(x-i, y-j)
 * - Separable filters: K = kᵥ × kₕᵀ for efficiency
 * 
 * @see Sobel operator, Gaussian blur, edge detection kernels
 */

export const Matrix = {
    // ═══════════════════════════════════════════════════════════════════════
    // KERNEL DEFINITIONS
    // ═══════════════════════════════════════════════════════════════════════
    
    /**
     * Predefined convolution kernels
     * All kernels are row-major: kernel[row][col]
     */
    kernels: {
        // Sobel operators for gradient detection
        // Gₓ = [[-1,0,+1],[-2,0,+2],[-1,0,+1]] * A
        sobelX: [
            [-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1]
        ],
        // Gᵧ = [[-1,-2,-1],[0,0,0],[+1,+2,+1]] * A
        sobelY: [
            [-1, -2, -1],
            [ 0,  0,  0],
            [ 1,  2,  1]
        ],

        // Scharr operators (better rotational symmetry)
        scharrX: [
            [-3, 0, 3],
            [-10, 0, 10],
            [-3, 0, 3]
        ],
        scharrY: [
            [-3, -10, -3],
            [ 0,   0,  0],
            [ 3,  10,  3]
        ],

        // Prewitt operators
        prewittX: [
            [-1, 0, 1],
            [-1, 0, 1],
            [-1, 0, 1]
        ],
        prewittY: [
            [-1, -1, -1],
            [ 0,  0,  0],
            [ 1,  1,  1]
        ],

        // Roberts cross operators (2×2)
        robertsX: [
            [1,  0],
            [0, -1]
        ],
        robertsY: [
            [ 0, 1],
            [-1, 0]
        ],

        // Laplacian (discrete approximation of ∇²)
        laplacian4: [
            [0,  1, 0],
            [1, -4, 1],
            [0,  1, 0]
        ],
        laplacian8: [
            [1,  1, 1],
            [1, -8, 1],
            [1,  1, 1]
        ],

        // Identity (no change)
        identity: [
            [0, 0, 0],
            [0, 1, 0],
            [0, 0, 0]
        ],

        // Box blur (mean filter)
        boxBlur3: [
            [1/9, 1/9, 1/9],
            [1/9, 1/9, 1/9],
            [1/9, 1/9, 1/9]
        ],

        // Sharpen
        sharpen: [
            [ 0, -1,  0],
            [-1,  5, -1],
            [ 0, -1,  0]
        ],

        // Emboss
        emboss: [
            [-2, -1, 0],
            [-1,  1, 1],
            [ 0,  1, 2]
        ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // KERNEL GENERATION
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Generate Gaussian kernel
     * G(x,y) = (1/2πσ²) · exp(-(x² + y²)/2σ²)
     * 
     * @param {number} size - Kernel size (odd number)
     * @param {number} sigma - Standard deviation
     * @returns {number[][]}
     */
    gaussianKernel(size, sigma) {
        const kernel = [];
        const half = Math.floor(size / 2);
        let sum = 0;
        
        // Two-sigma factor for normalization
        const s2 = 2 * sigma * sigma;
        
        for (let y = -half; y <= half; y++) {
            const row = [];
            for (let x = -half; x <= half; x++) {
                // G(x,y) = exp(-(x² + y²) / 2σ²)
                const val = Math.exp(-(x * x + y * y) / s2);
                row.push(val);
                sum += val;
            }
            kernel.push(row);
        }
        
        // Normalize so sum = 1
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                kernel[y][x] /= sum;
            }
        }
        
        return kernel;
    },

    /**
     * Generate Laplacian of Gaussian (LoG) kernel
     * LoG(x,y) = -(1/πσ⁴)[1 - (x² + y²)/2σ²] · exp(-(x² + y²)/2σ²)
     * 
     * @param {number} size - Kernel size
     * @param {number} sigma - Standard deviation
     * @returns {number[][]}
     */
    laplacianOfGaussianKernel(size, sigma) {
        const kernel = [];
        const half = Math.floor(size / 2);
        const sigma2 = sigma * sigma;
        const sigma4 = sigma2 * sigma2;
        
        for (let y = -half; y <= half; y++) {
            const row = [];
            for (let x = -half; x <= half; x++) {
                const r2 = x * x + y * y;
                // LoG formula
                const val = -1 / (Math.PI * sigma4) * 
                    (1 - r2 / (2 * sigma2)) * 
                    Math.exp(-r2 / (2 * sigma2));
                row.push(val);
            }
            kernel.push(row);
        }
        
        // Zero-center the kernel (sum should be 0 for edge detection)
        let sum = 0;
        for (const row of kernel) {
            for (const val of row) sum += val;
        }
        const offset = sum / (size * size);
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                kernel[y][x] -= offset;
            }
        }
        
        return kernel;
    },

    /**
     * Generate Difference of Gaussians (DoG) kernel
     * DoG = G(σ₁) - G(σ₂), approximates LoG
     * 
     * @param {number} size 
     * @param {number} sigma1 
     * @param {number} sigma2 
     * @returns {number[][]}
     */
    differenceOfGaussiansKernel(size, sigma1, sigma2) {
        const g1 = this.gaussianKernel(size, sigma1);
        const g2 = this.gaussianKernel(size, sigma2);
        
        const kernel = [];
        for (let y = 0; y < size; y++) {
            const row = [];
            for (let x = 0; x < size; x++) {
                row.push(g1[y][x] - g2[y][x]);
            }
            kernel.push(row);
        }
        
        return kernel;
    },

    // ═══════════════════════════════════════════════════════════════════════
    // CONVOLUTION OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * 2D Convolution
     *
     * @source blog/ideas/reference documentation/14_Signal_Processing_Filtering/Convolution.md
     * @wikipedia https://en.wikipedia.org/wiki/Convolution
     * @section Discrete convolution
     * @formula N(x,y) = \sum_{i=-k}^k \sum_{j=-k}^k K(i,j) \cdot I(x-i, y-j)
     *
     * N(x,y) = Σᵢ₌₋ₖᵏ Σⱼ₌₋ₖᵏ K(i,j) · I(x-i, y-j)
     *
     * @param {Float32Array|number[]} image - Grayscale image data
     * @param {number} width - Image width
     * @param {number} height - Image height
     * @param {number[][]} kernel - Convolution kernel
     * @param {string} [boundary='replicate'] - 'replicate'|'zero'|'wrap'
     * @returns {Float32Array}
     */
    convolve2D(image, width, height, kernel, boundary = 'replicate') {
        const kHeight = kernel.length;
        const kWidth = kernel[0].length;
        const kHalfH = Math.floor(kHeight / 2);
        const kHalfW = Math.floor(kWidth / 2);
        
        const output = new Float32Array(width * height);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let sum = 0;
                
                for (let ky = 0; ky < kHeight; ky++) {
                    for (let kx = 0; kx < kWidth; kx++) {
                        // Sample position (convolution flips kernel)
                        let sy = y + ky - kHalfH;
                        let sx = x + kx - kHalfW;
                        
                        // Handle boundaries
                        let pixelVal = 0;
                        if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
                            pixelVal = image[sy * width + sx];
                        } else if (boundary === 'replicate') {
                            sx = Math.max(0, Math.min(width - 1, sx));
                            sy = Math.max(0, Math.min(height - 1, sy));
                            pixelVal = image[sy * width + sx];
                        } else if (boundary === 'wrap') {
                            sx = ((sx % width) + width) % width;
                            sy = ((sy % height) + height) % height;
                            pixelVal = image[sy * width + sx];
                        }
                        // 'zero' boundary: pixelVal stays 0
                        
                        sum += kernel[ky][kx] * pixelVal;
                    }
                }
                
                output[y * width + x] = sum;
            }
        }
        
        return output;
    },

    /**
     * Separable convolution (more efficient for separable kernels)
     * K = kᵥ × kₕᵀ where kᵥ is column vector, kₕ is row vector
     * Result: first convolve with kₕ, then with kᵥ
     * 
     * @param {Float32Array} image 
     * @param {number} width 
     * @param {number} height 
     * @param {number[]} kernelH - Horizontal 1D kernel
     * @param {number[]} kernelV - Vertical 1D kernel
     * @returns {Float32Array}
     */
    convolveSeparable(image, width, height, kernelH, kernelV) {
        // First pass: horizontal
        const temp = new Float32Array(width * height);
        const kHalfH = Math.floor(kernelH.length / 2);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let sum = 0;
                for (let i = 0; i < kernelH.length; i++) {
                    const sx = Math.max(0, Math.min(width - 1, x + i - kHalfH));
                    sum += kernelH[i] * image[y * width + sx];
                }
                temp[y * width + x] = sum;
            }
        }
        
        // Second pass: vertical
        const output = new Float32Array(width * height);
        const kHalfV = Math.floor(kernelV.length / 2);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let sum = 0;
                for (let i = 0; i < kernelV.length; i++) {
                    const sy = Math.max(0, Math.min(height - 1, y + i - kHalfV));
                    sum += kernelV[i] * temp[sy * width + x];
                }
                output[y * width + x] = sum;
            }
        }
        
        return output;
    },

    /**
     * Gaussian blur using separable convolution
     * Efficient: O(n·k) instead of O(n·k²)
     * 
     * @param {Float32Array} image 
     * @param {number} width 
     * @param {number} height 
     * @param {number} sigma 
     * @returns {Float32Array}
     */
    gaussianBlur(image, width, height, sigma) {
        // Generate 1D Gaussian kernel
        const size = Math.ceil(sigma * 6) | 1; // Ensure odd
        const half = Math.floor(size / 2);
        const kernel = [];
        let sum = 0;
        
        for (let i = -half; i <= half; i++) {
            const val = Math.exp(-(i * i) / (2 * sigma * sigma));
            kernel.push(val);
            sum += val;
        }
        
        // Normalize
        for (let i = 0; i < kernel.length; i++) {
            kernel[i] /= sum;
        }
        
        // Separable convolution (same kernel for H and V)
        return this.convolveSeparable(image, width, height, kernel, kernel);
    },

    // ═══════════════════════════════════════════════════════════════════════
    // MATRIX UTILITIES
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Transpose matrix
     * @param {number[][]} m 
     * @returns {number[][]}
     */
    transpose(m) {
        const rows = m.length;
        const cols = m[0].length;
        const result = [];
        
        for (let c = 0; c < cols; c++) {
            const row = [];
            for (let r = 0; r < rows; r++) {
                row.push(m[r][c]);
            }
            result.push(row);
        }
        
        return result;
    },

    /**
     * Matrix multiplication
     * @param {number[][]} a 
     * @param {number[][]} b 
     * @returns {number[][]}
     */
    multiply(a, b) {
        const aRows = a.length;
        const aCols = a[0].length;
        const bCols = b[0].length;
        
        const result = [];
        for (let i = 0; i < aRows; i++) {
            const row = [];
            for (let j = 0; j < bCols; j++) {
                let sum = 0;
                for (let k = 0; k < aCols; k++) {
                    sum += a[i][k] * b[k][j];
                }
                row.push(sum);
            }
            result.push(row);
        }
        
        return result;
    },

    /**
     * Compute outer product of two 1D arrays
     * Useful for creating separable kernels: K = kᵥ × kₕᵀ
     * 
     * @param {number[]} v - Column vector
     * @param {number[]} h - Row vector
     * @returns {number[][]}
     */
    outerProduct(v, h) {
        const result = [];
        for (let i = 0; i < v.length; i++) {
            const row = [];
            for (let j = 0; j < h.length; j++) {
                row.push(v[i] * h[j]);
            }
            result.push(row);
        }
        return result;
    },

    /**
     * Normalize kernel so absolute values sum to 1
     * @param {number[][]} kernel 
     * @returns {number[][]}
     */
    normalizeKernel(kernel) {
        let sum = 0;
        for (const row of kernel) {
            for (const val of row) {
                sum += Math.abs(val);
            }
        }
        
        if (sum === 0) return kernel;
        
        return kernel.map(row => row.map(v => v / sum));
    }
};

export default Matrix;

