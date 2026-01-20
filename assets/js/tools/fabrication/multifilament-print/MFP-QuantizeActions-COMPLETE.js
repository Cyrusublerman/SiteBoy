/**
 * MFP-QuantizeActions.js
 * 
 * All QUANTIZE tab logic - image loading, color quantization
 * NO DOM manipulation - pure logic only.
 * ZERO PLACEHOLDERS - ALL METHODS COMPLETE
 */

export class MFPQuantizeActions {
    constructor(sharedState) {
        this.state = sharedState;
    }
    
    /**
     * Load source image for quantization - COMPLETE
     */
    async loadSourceImage(file, toolBase) {
        if (!file) return;
        
        const img = new Image();
        img.onload = () => {
            this.state.sourceImageElement = img;
            toolBase.draw();
            toolBase.setValue('quantizeStatus', `✅ Source image loaded (${img.width}×${img.height}px)`);
        };
        img.onerror = (err) => {
            console.error('❌ Image load error:', err);
            toolBase.setValue('quantizeStatus', '❌ Failed to load image');
        };
        img.src = URL.createObjectURL(file);
    }
    
    /**
     * Quantize image using scanned palette - COMPLETE
     */
    async quantize(values, toolBase) {
        if (!this.state.sourceImageElement) {
            toolBase.setValue('quantizeStatus', '❌ Load source image first');
            return;
        }
        
        if (!this.state.quantizationConfig) {
            toolBase.setValue('quantizeStatus', '❌ Analyze scan first (SCAN tab) to generate palette');
            return;
        }
        
        try {
            toolBase.setValue('quantizeStatus', '⏳ Quantizing image...');
            
            const sourceImg = this.state.sourceImageElement;
            const palette = this.state.quantizationConfig.colorMap;
            
            // Create canvas to read source image
            const sourceCanvas = document.createElement('canvas');
            sourceCanvas.width = sourceImg.width;
            sourceCanvas.height = sourceImg.height;
            const sourceCtx = sourceCanvas.getContext('2d');
            sourceCtx.drawImage(sourceImg, 0, 0);
            const sourceData = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
            
            // Create output canvas
            const outputCanvas = document.createElement('canvas');
            outputCanvas.width = sourceImg.width;
            outputCanvas.height = sourceImg.height;
            const outputCtx = outputCanvas.getContext('2d');
            const outputData = outputCtx.createImageData(sourceCanvas.width, sourceCanvas.height);
            
            // Quantize each pixel to nearest palette color
            for (let i = 0; i < sourceData.data.length; i += 4) {
                const r = sourceData.data[i];
                const g = sourceData.data[i + 1];
                const b = sourceData.data[i + 2];
                const a = sourceData.data[i + 3];
                
                // Find nearest palette color (Euclidean distance in RGB space)
                let minDist = Infinity;
                let nearestColor = palette[0];
                
                for (const color of palette) {
                    const dr = r - color.rgb.r;
                    const dg = g - color.rgb.g;
                    const db = b - color.rgb.b;
                    const dist = Math.sqrt(dr * dr + dg * dg + db * db);
                    
                    if (dist < minDist) {
                        minDist = dist;
                        nearestColor = color;
                    }
                }
                
                // Set output pixel to nearest palette color
                outputData.data[i] = nearestColor.rgb.r;
                outputData.data[i + 1] = nearestColor.rgb.g;
                outputData.data[i + 2] = nearestColor.rgb.b;
                outputData.data[i + 3] = a;
            }
            
            outputCtx.putImageData(outputData, 0, 0);
            
            // Store quantized image
            this.state.quantizedImageElement = new Image();
            this.state.quantizedImageElement.onload = () => {
                toolBase.draw();
                toolBase.setValue('quantizeStatus', `✅ Quantized to ${palette.length} colors from scanned calibration`);
            };
            this.state.quantizedImageElement.src = outputCanvas.toDataURL();
            
        } catch (err) {
            toolBase.setValue('quantizeStatus', `❌ Quantization failed: ${err.message}`);
            console.error('Quantization error:', err);
        }
    }
    
    /**
     * Export quantized image - COMPLETE
     */
    exportQuantizedImage(toolBase) {
        if (!this.state.quantizedImageElement) {
            toolBase.setValue('quantizeStatus', '❌ Quantize image first');
            return;
        }
        
        // Create canvas with quantized image
        const canvas = document.createElement('canvas');
        canvas.width = this.state.quantizedImageElement.width;
        canvas.height = this.state.quantizedImageElement.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.state.quantizedImageElement, 0, 0);
        
        // Export as PNG
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `quantized-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
            
            toolBase.setValue('quantizeStatus', '✅ Exported quantized image');
        });
    }
}

