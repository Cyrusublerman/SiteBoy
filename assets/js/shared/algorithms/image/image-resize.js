/**
 * Image Resizing — Pixel-Perfect Downsampling
 * 
 * Aliasing-free image downsampling methods for pixel art and dithered images.
 * All methods ensure crisp, clean output without blur or interpolation artifacts.
 * 
 * @module algorithms/image/image-resize
 * @wikipedia https://en.wikipedia.org/wiki/Image_scaling
 */

/**
 * Nearest Neighbor downsampling (pixel dropping)
 * 
 * Removes every Nth pixel. Fastest method but can create uneven results.
 * Best for: Quick previews, power-of-2 scaling (2×, 4×, 8×).
 * 
 * @param {ImageData} imageData - Source image
 * @param {number} scale - Scale factor (e.g., 2 = half size, 4 = quarter size)
 * @returns {ImageData} Resized image
 * 
 * @formula newWidth = floor(width / scale), newHeight = floor(height / scale)
 *          output[x,y] = input[x*scale, y*scale]
 * 
 * @example
 * const half = nearestNeighbor(imageData, 2); // 50% size
 */
export function nearestNeighbor(imageData, scale) {
    if (scale <= 1) return imageData;
    
    const { width, height, data } = imageData;
    const newWidth = Math.floor(width / scale);
    const newHeight = Math.floor(height / scale);
    const output = new Uint8ClampedArray(newWidth * newHeight * 4);

    for (let y = 0; y < newHeight; y++) {
        for (let x = 0; x < newWidth; x++) {
            const srcX = x * scale;
            const srcY = y * scale;
            const srcIndex = (srcY * width + srcX) * 4;
            const destIndex = (y * newWidth + x) * 4;

            output[destIndex] = data[srcIndex];
            output[destIndex + 1] = data[srcIndex + 1];
            output[destIndex + 2] = data[srcIndex + 2];
            output[destIndex + 3] = data[srcIndex + 3];
        }
    }

    return new ImageData(output, newWidth, newHeight);
}

/**
 * Block Average downsampling
 * 
 * Averages RGB values within each block. Produces smoothest results.
 * Best for: Photographs, gradients, smooth transitions.
 * 
 * @param {ImageData} imageData - Source image
 * @param {number} scale - Scale factor (integer, e.g., 2, 3, 4)
 * @returns {ImageData} Resized image
 * 
 * @formula For each block of scale×scale pixels, average all RGB values
 * 
 * @example
 * const quarter = blockAverage(imageData, 4); // 25% size
 */
export function blockAverage(imageData, scale) {
    if (scale <= 1) return imageData;
    
    const { width, height, data } = imageData;
    const newWidth = Math.floor(width / scale);
    const newHeight = Math.floor(height / scale);
    const output = new Uint8ClampedArray(newWidth * newHeight * 4);

    for (let y = 0; y < newHeight; y++) {
        for (let x = 0; x < newWidth; x++) {
            let sumR = 0, sumG = 0, sumB = 0, sumA = 0;
            let count = 0;

            // Average all pixels in the block
            for (let by = 0; by < scale; by++) {
                for (let bx = 0; bx < scale; bx++) {
                    const srcX = x * scale + bx;
                    const srcY = y * scale + by;
                    
                    if (srcX < width && srcY < height) {
                        const srcIndex = (srcY * width + srcX) * 4;
                        sumR += data[srcIndex];
                        sumG += data[srcIndex + 1];
                        sumB += data[srcIndex + 2];
                        sumA += data[srcIndex + 3];
                        count++;
                    }
                }
            }

            const destIndex = (y * newWidth + x) * 4;
            output[destIndex] = Math.round(sumR / count);
            output[destIndex + 1] = Math.round(sumG / count);
            output[destIndex + 2] = Math.round(sumB / count);
            output[destIndex + 3] = Math.round(sumA / count);
        }
    }

    return new ImageData(output, newWidth, newHeight);
}

/**
 * Block Mode downsampling (most common color)
 * 
 * Selects most frequently occurring color in each block.
 * Best for: Pixel art, dithered images, preserving exact palette colors.
 * 
 * @param {ImageData} imageData - Source image
 * @param {number} scale - Scale factor (integer)
 * @returns {ImageData} Resized image
 * 
 * @formula For each block, count color frequencies and select mode (most common)
 * 
 * @example
 * const downsampledPixelArt = blockMode(pixelArt, 2);
 */
export function blockMode(imageData, scale) {
    if (scale <= 1) return imageData;
    
    const { width, height, data } = imageData;
    const newWidth = Math.floor(width / scale);
    const newHeight = Math.floor(height / scale);
    const output = new Uint8ClampedArray(newWidth * newHeight * 4);

    for (let y = 0; y < newHeight; y++) {
        for (let x = 0; x < newWidth; x++) {
            const colorCounts = new Map();

            // Count color frequencies in block
            for (let by = 0; by < scale; by++) {
                for (let bx = 0; bx < scale; bx++) {
                    const srcX = x * scale + bx;
                    const srcY = y * scale + by;
                    
                    if (srcX < width && srcY < height) {
                        const srcIndex = (srcY * width + srcX) * 4;
                        const r = data[srcIndex];
                        const g = data[srcIndex + 1];
                        const b = data[srcIndex + 2];
                        const a = data[srcIndex + 3];
                        
                        // Create color key (ignore alpha for counting)
                        const colorKey = `${r},${g},${b},${a}`;
                        colorCounts.set(colorKey, (colorCounts.get(colorKey) || 0) + 1);
                    }
                }
            }

            // Find most common color
            let maxCount = 0;
            let modeColor = null;
            
            for (const [colorKey, count] of colorCounts.entries()) {
                if (count > maxCount) {
                    maxCount = count;
                    modeColor = colorKey;
                }
            }

            // Write mode color
            const destIndex = (y * newWidth + x) * 4;
            if (modeColor) {
                const [r, g, b, a] = modeColor.split(',').map(Number);
                output[destIndex] = r;
                output[destIndex + 1] = g;
                output[destIndex + 2] = b;
                output[destIndex + 3] = a;
            } else {
                // Fallback to first pixel if no mode found
                const srcIndex = (y * scale * width + x * scale) * 4;
                output[destIndex] = data[srcIndex];
                output[destIndex + 1] = data[srcIndex + 1];
                output[destIndex + 2] = data[srcIndex + 2];
                output[destIndex + 3] = data[srcIndex + 3];
            }
        }
    }

    return new ImageData(output, newWidth, newHeight);
}

/**
 * Block Median downsampling
 * 
 * Selects median color value for each channel in each block.
 * Best for: Noise reduction, edge preservation, balanced results.
 * 
 * @param {ImageData} imageData - Source image
 * @param {number} scale - Scale factor (integer)
 * @returns {ImageData} Resized image
 * 
 * @formula For each block, calculate median of R, G, B channels independently
 * 
 * @example
 * const cleaned = blockMedian(noisyImage, 2);
 */
export function blockMedian(imageData, scale) {
    if (scale <= 1) return imageData;
    
    const { width, height, data } = imageData;
    const newWidth = Math.floor(width / scale);
    const newHeight = Math.floor(height / scale);
    const output = new Uint8ClampedArray(newWidth * newHeight * 4);

    for (let y = 0; y < newHeight; y++) {
        for (let x = 0; x < newWidth; x++) {
            const reds = [];
            const greens = [];
            const blues = [];
            const alphas = [];

            // Collect all values in block
            for (let by = 0; by < scale; by++) {
                for (let bx = 0; bx < scale; bx++) {
                    const srcX = x * scale + bx;
                    const srcY = y * scale + by;
                    
                    if (srcX < width && srcY < height) {
                        const srcIndex = (srcY * width + srcX) * 4;
                        reds.push(data[srcIndex]);
                        greens.push(data[srcIndex + 1]);
                        blues.push(data[srcIndex + 2]);
                        alphas.push(data[srcIndex + 3]);
                    }
                }
            }

            // Sort and find median
            reds.sort((a, b) => a - b);
            greens.sort((a, b) => a - b);
            blues.sort((a, b) => a - b);
            alphas.sort((a, b) => a - b);

            const midIndex = Math.floor(reds.length / 2);

            const destIndex = (y * newWidth + x) * 4;
            output[destIndex] = reds[midIndex];
            output[destIndex + 1] = greens[midIndex];
            output[destIndex + 2] = blues[midIndex];
            output[destIndex + 3] = alphas[midIndex];
        }
    }

    return new ImageData(output, newWidth, newHeight);
}

/**
 * Calculate optimal dimensions for target size while maintaining aspect ratio
 * 
 * @param {number} srcWidth - Source width
 * @param {number} srcHeight - Source height
 * @param {number} targetWidth - Target width (optional)
 * @param {number} targetHeight - Target height (optional)
 * @param {number} maxDimension - Maximum dimension constraint (optional)
 * @returns {{width: number, height: number, scale: number}}
 * 
 * @example
 * const dims = calculateOptimalDimensions(1920, 1080, 960); // { width: 960, height: 540, scale: 2 }
 */
export function calculateOptimalDimensions(
    srcWidth,
    srcHeight,
    targetWidth = null,
    targetHeight = null,
    maxDimension = null
) {
    let scale = 1;

    if (maxDimension) {
        const maxSrc = Math.max(srcWidth, srcHeight);
        if (maxSrc > maxDimension) {
            scale = Math.ceil(maxSrc / maxDimension);
        }
    }

    if (targetWidth && !targetHeight) {
        scale = Math.ceil(srcWidth / targetWidth);
    } else if (targetHeight && !targetWidth) {
        scale = Math.ceil(srcHeight / targetHeight);
    } else if (targetWidth && targetHeight) {
        scale = Math.max(
            Math.ceil(srcWidth / targetWidth),
            Math.ceil(srcHeight / targetHeight)
        );
    }

    return {
        width: Math.floor(srcWidth / scale),
        height: Math.floor(srcHeight / scale),
        scale: scale
    };
}

