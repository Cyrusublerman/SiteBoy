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
            
            // Feed image to adjustment bundle
            const adjustBundle = toolBase.components.get('imageAdjust');
            if (adjustBundle && typeof adjustBundle.setSourceImage === 'function') {
                // Convert image to ImageData
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = img.width;
                tempCanvas.height = img.height;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(img, 0, 0);
                const imageData = tempCtx.getImageData(0, 0, img.width, img.height);
                
                adjustBundle.setSourceImage(imageData);
                console.log('✅ Source image loaded into adjustment bundle');
            }
            
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
     * Quantize image using palette - stores SEQUENCE per pixel, not just RGB
     * This is critical: multiple sequences can produce similar colours, so we
     * must track which sequence was chosen for each pixel to generate STL correctly.
     */
    async quantize(values, toolBase) {
        if (!this.state.sourceImageElement && !this.state.sourceImageData) {
            toolBase.setValue('quantizeStatus', '❌ Load source image first');
            return;
        }
        
        if (!this.state.quantizationConfig) {
            toolBase.setValue('quantizeStatus', '❌ No palette available. Generate grid or analyze scan first.');
            return;
        }
        
        try {
            toolBase.setValue('quantizeStatus', '⏳ Quantizing image...');
            
            const palette = this.state.quantizationConfig.colorMap;
            const sourceImg = this.state.sourceImageElement;
            
            // Use adjusted image if available, otherwise original
            let sourceData;
            let width, height;
            
            if (this.state.sourceImageData) {
                // Use adjusted image data
                sourceData = this.state.sourceImageData;
                width = sourceData.width;
                height = sourceData.height;
            } else {
                // Read from source image element
                const sourceCanvas = document.createElement('canvas');
                sourceCanvas.width = sourceImg.width;
                sourceCanvas.height = sourceImg.height;
                const sourceCtx = sourceCanvas.getContext('2d');
                sourceCtx.drawImage(sourceImg, 0, 0);
                sourceData = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
                width = sourceImg.width;
                height = sourceImg.height;
            }
            
            // Build lookup for fast matching - index by palette position
            // Each entry: { rgb, sequence, paletteIndex }
            const paletteWithIndex = palette.map((c, idx) => ({
                rgb: c.rgb,
                sequence: c.sequence,
                paletteIndex: idx
            }));
            
            // Create output canvas for visual display
            const outputCanvas = document.createElement('canvas');
            outputCanvas.width = width;
            outputCanvas.height = height;
            const outputCtx = outputCanvas.getContext('2d');
            const outputData = outputCtx.createImageData(width, height);
            
            // Create SEQUENCE MAP - stores palette index per pixel
            // This is critical for STL export: we know exactly which sequence each pixel uses
            const pixelCount = width * height;
            const sequenceMap = new Uint16Array(pixelCount);  // Max 65535 palette entries
            
            // Statistics
            let matchCount = 0;
            const usedSequences = new Set();
            
            // Quantize each pixel
            for (let i = 0; i < sourceData.data.length; i += 4) {
                const pixelIndex = i / 4;
                const r = sourceData.data[i];
                const g = sourceData.data[i + 1];
                const b = sourceData.data[i + 2];
                const a = sourceData.data[i + 3];
                
                // Find nearest palette color (Euclidean distance in RGB space)
                let minDist = Infinity;
                let nearestIdx = 0;
                
                for (let j = 0; j < paletteWithIndex.length; j++) {
                    const c = paletteWithIndex[j].rgb;
                    const dr = r - c.r;
                    const dg = g - c.g;
                    const db = b - c.b;
                    // Skip sqrt for speed - relative comparison still valid
                    const distSq = dr * dr + dg * dg + db * db;
                    
                    if (distSq < minDist) {
                        minDist = distSq;
                        nearestIdx = j;
                    }
                }
                
                const matched = paletteWithIndex[nearestIdx];
                usedSequences.add(nearestIdx);
                matchCount++;
                
                // Store sequence index for this pixel (for STL export)
                sequenceMap[pixelIndex] = nearestIdx;
                
                // Set visual output pixel
                outputData.data[i] = matched.rgb.r;
                outputData.data[i + 1] = matched.rgb.g;
                outputData.data[i + 2] = matched.rgb.b;
                outputData.data[i + 3] = a;
            }
            
            outputCtx.putImageData(outputData, 0, 0);
            
            // Store results
            this.state.quantizedImageData = outputData;
            this.state.quantizedSequenceMap = {
                width,
                height,
                map: sequenceMap,  // Palette index per pixel
                palette: palette   // Reference to palette for sequence lookup
            };
            
            // Store visual image for display
            this.state.quantizedImageElement = new Image();
            this.state.quantizedImageElement.onload = () => {
                toolBase.draw();
                const usedCount = usedSequences.size;
                const paletteType = this.state.quantizationConfig.type || 'loaded';
                toolBase.setValue('quantizeStatus', `✅ Quantized: ${usedCount}/${palette.length} sequences used (${paletteType} palette)`);
                console.log(`✅ Quantization complete: ${pixelCount} pixels → ${usedCount} unique sequences`);
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
    
    /**
     * Load palette from JSON file (calibration-palette.json)
     * Format: { version, type, filaments, colorMap: [{name, rgb, hex, sequence, ...}] }
     */
    async loadPaletteFromJSON(file, toolBase) {
        if (!file) return;
        
        try {
            toolBase.setValue('paletteStatus', '⏳ Loading palette...');
            
            const text = await file.text();
            const data = JSON.parse(text);
            
            // Validate required fields
            if (!data.colors && !data.colorMap) {
                throw new Error('Invalid palette format: missing colors or colorMap');
            }
            
            // Support both formats (calibration-palette.json uses "colors", quantization-config uses "colorMap")
            const colors = data.colors || data.colorMap;
            
            // Convert to quantization config format
            this.state.quantizationConfig = {
                version: data.version || '1.0.0',
                type: data.type || 'imported',
                generatedAt: data.generatedAt || new Date().toISOString(),
                paletteName: data.paletteName || (data.filaments?.map(f => f.name).join('')) || 'Imported',
                filaments: data.filaments || [],
                layerCount: data.layerCount || colors[0]?.sequence?.length || 4,
                baseLayers: data.baseLayers || 0,
                topLayers: data.topLayers || 0,
                colorMap: colors.map(c => ({
                    name: c.sequenceStr || c.name || c.sequence?.join(''),
                    rgb: Array.isArray(c.rgb) ? { r: c.rgb[0], g: c.rgb[1], b: c.rgb[2] } : c.rgb,
                    hex: c.hex,
                    sequence: c.sequence,
                    filamentStack: c.filamentStack || null,
                    tileCount: c.tileCount || 1,
                    deviation: c.deviation || null
                })),
                tileData: data.tileData || null
            };
            
            const colorCount = this.state.quantizationConfig.colorMap.length;
            toolBase.setValue('paletteStatus', `✅ Palette loaded: ${colorCount} colours (${this.state.quantizationConfig.type})`);
            console.log(`✅ Palette loaded from JSON: ${colorCount} colours`);
            
        } catch (err) {
            console.error('❌ Palette load error:', err);
            toolBase.setValue('paletteStatus', `❌ Failed to load palette: ${err.message}`);
        }
    }
}

