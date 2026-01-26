/**
 * Canvas Utilities
 * 
 * Helper functions for canvas/ImageData operations.
 * These functions create temporary canvases for data processing,
 * isolated from main application components.
 * 
 * @module utils/canvas-utils
 */

/**
 * Convert ImageData to Canvas
 * 
 * Creates a temporary canvas and renders ImageData to it.
 * Useful for exporting ImageData as image formats.
 * 
 * @param {ImageData} imageData - Source image data
 * @returns {HTMLCanvasElement} Canvas with rendered image
 * 
 * @example
 * const canvas = imageDataToCanvas(processedImageData);
 * const blob = await canvas.toBlob();
 */
export function imageDataToCanvas(imageData) {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

/**
 * Convert Image element to ImageData
 * 
 * Draws an Image element to a temporary canvas and extracts ImageData.
 * Useful for loading images into processing pipeline.
 * 
 * @param {HTMLImageElement} img - Source image element
 * @returns {ImageData} Extracted image data
 * 
 * @example
 * const img = new Image();
 * img.onload = () => {
 *     const imageData = imageToImageData(img);
 *     processImage(imageData);
 * };
 * img.src = 'path/to/image.png';
 */
export function imageToImageData(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * Convert Canvas to Blob
 * 
 * Asynchronously converts canvas to Blob for file operations.
 * 
 * @param {HTMLCanvasElement} canvas - Source canvas
 * @param {string} [type='image/png'] - MIME type
 * @param {number} [quality=1] - Quality (0-1, for JPEG)
 * @returns {Promise<Blob>} Blob containing image data
 * 
 * @example
 * const blob = await canvasToBlob(canvas, 'image/jpeg', 0.9);
 * downloadBlob(blob, 'output.jpg');
 */
export function canvasToBlob(canvas, type = 'image/png', quality = 1) {
    return new Promise((resolve) => {
        canvas.toBlob(resolve, type, quality);
    });
}

/**
 * Load image from file
 * 
 * Loads an image file and returns ImageData.
 * 
 * @param {File} file - Image file
 * @returns {Promise<ImageData>} Loaded image data
 * 
 * @example
 * const fileInput = document.querySelector('input[type="file"]');
 * fileInput.addEventListener('change', async (e) => {
 *     const imageData = await loadImageFromFile(e.target.files[0]);
 *     viewport.setImageData(imageData);
 * });
 */
export function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            
            img.onload = () => {
                try {
                    const imageData = imageToImageData(img);
                    resolve(imageData);
                } catch (err) {
                    reject(err);
                }
            };
            
            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };
            
            img.src = e.target.result;
        };
        
        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };
        
        reader.readAsDataURL(file);
    });
}

/**
 * Create empty ImageData with specified dimensions
 * 
 * @param {number} width - Width in pixels
 * @param {number} height - Height in pixels
 * @param {string} [fillColor='transparent'] - Fill colour (hex or 'transparent')
 * @returns {ImageData} New ImageData object
 * 
 * @example
 * const blank = createImageData(800, 600, '#FFFFFF');
 */
export function createImageData(width, height, fillColor = 'transparent') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (fillColor !== 'transparent') {
        ctx.fillStyle = fillColor;
        ctx.fillRect(0, 0, width, height);
    }
    
    return ctx.getImageData(0, 0, width, height);
}

/**
 * Clone ImageData
 * 
 * Creates a deep copy of ImageData.
 * 
 * @param {ImageData} imageData - Source image data
 * @returns {ImageData} Cloned image data
 * 
 * @example
 * const backup = cloneImageData(originalImageData);
 * processImage(originalImageData);
 * if (error) {
 *     imageData = backup; // Restore from backup
 * }
 */
export function cloneImageData(imageData) {
    const clonedData = new Uint8ClampedArray(imageData.data);
    return new ImageData(clonedData, imageData.width, imageData.height);
}
