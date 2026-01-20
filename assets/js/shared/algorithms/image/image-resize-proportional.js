/**
 * Image Resize — Proportional Scaling
 * 
 * Simple proportional resize functions for quick scaling
 * 
 * @module algorithms/image/image-resize-proportional
 */

/**
 * Resize image proportionally using nearest neighbor
 * 
 * @param {ImageData} imageData - Source image
 * @param {number} scale - Scale factor (2 = 2×, 0.5 = ½)
 * @returns {ImageData} Resized image
 * 
 * @example
 * const doubled = resizeProportional(imageData, 2);
 * const halved = resizeProportional(imageData, 0.5);
 */
export function resizeProportional(imageData, scale) {
    const { width, height, data } = imageData;
    const newWidth = Math.round(width * scale);
    const newHeight = Math.round(height * scale);
    
    const output = new Uint8ClampedArray(newWidth * newHeight * 4);
    
    for (let y = 0; y < newHeight; y++) {
        for (let x = 0; x < newWidth; x++) {
            const srcX = Math.floor(x / scale);
            const srcY = Math.floor(y / scale);
            const srcIdx = (srcY * width + srcX) * 4;
            const dstIdx = (y * newWidth + x) * 4;
            
            output[dstIdx] = data[srcIdx];
            output[dstIdx + 1] = data[srcIdx + 1];
            output[dstIdx + 2] = data[srcIdx + 2];
            output[dstIdx + 3] = data[srcIdx + 3];
        }
    }
    
    return new ImageData(output, newWidth, newHeight);
}

/**
 * Rotate image 90 degrees
 * 
 * @param {ImageData} imageData - Source image
 * @param {number} times - Number of 90° rotations (1 = 90° CW, -1 = 90° CCW, 2 = 180°)
 * @returns {ImageData} Rotated image
 */
export function rotate90(imageData, times = 1) {
    // Normalize to 0-3 range
    times = ((times % 4) + 4) % 4;
    
    if (times === 0) return imageData;
    if (times === 2) return rotate180(imageData);
    
    const { width, height, data } = imageData;
    const newWidth = height;
    const newHeight = width;
    const output = new Uint8ClampedArray(newWidth * newHeight * 4);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const srcIdx = (y * width + x) * 4;
            
            let dstX, dstY;
            if (times === 1) {
                // 90° CW
                dstX = height - 1 - y;
                dstY = x;
            } else {
                // 270° CW (or 90° CCW)
                dstX = y;
                dstY = width - 1 - x;
            }
            
            const dstIdx = (dstY * newWidth + dstX) * 4;
            output[dstIdx] = data[srcIdx];
            output[dstIdx + 1] = data[srcIdx + 1];
            output[dstIdx + 2] = data[srcIdx + 2];
            output[dstIdx + 3] = data[srcIdx + 3];
        }
    }
    
    return new ImageData(output, newWidth, newHeight);
}

/**
 * Rotate image 180 degrees
 * @private
 */
function rotate180(imageData) {
    const { width, height, data } = imageData;
    const output = new Uint8ClampedArray(data.length);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const srcIdx = (y * width + x) * 4;
            const dstIdx = ((height - 1 - y) * width + (width - 1 - x)) * 4;
            
            output[dstIdx] = data[srcIdx];
            output[dstIdx + 1] = data[srcIdx + 1];
            output[dstIdx + 2] = data[srcIdx + 2];
            output[dstIdx + 3] = data[srcIdx + 3];
        }
    }
    
    return new ImageData(output, width, height);
}

/**
 * Flip image horizontally
 * 
 * @param {ImageData} imageData - Source image
 * @returns {ImageData} Flipped image
 */
export function flipHorizontal(imageData) {
    const { width, height, data } = imageData;
    const output = new Uint8ClampedArray(data.length);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const srcIdx = (y * width + x) * 4;
            const dstIdx = (y * width + (width - 1 - x)) * 4;
            
            output[dstIdx] = data[srcIdx];
            output[dstIdx + 1] = data[srcIdx + 1];
            output[dstIdx + 2] = data[srcIdx + 2];
            output[dstIdx + 3] = data[srcIdx + 3];
        }
    }
    
    return new ImageData(output, width, height);
}

/**
 * Flip image vertically
 * 
 * @param {ImageData} imageData - Source image
 * @returns {ImageData} Flipped image
 */
export function flipVertical(imageData) {
    const { width, height, data } = imageData;
    const output = new Uint8ClampedArray(data.length);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const srcIdx = (y * width + x) * 4;
            const dstIdx = ((height - 1 - y) * width + x) * 4;
            
            output[dstIdx] = data[srcIdx];
            output[dstIdx + 1] = data[srcIdx + 1];
            output[dstIdx + 2] = data[srcIdx + 2];
            output[dstIdx + 3] = data[srcIdx + 3];
        }
    }
    
    return new ImageData(output, width, height);
}

