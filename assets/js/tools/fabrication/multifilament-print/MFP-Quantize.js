/**
 * MFP-Quantize.js - QUANTIZE tab module
 * 
 * Handles image quantization using extracted color palettes:
 * - Source image upload
 * - Apply quantization config
 * - Preview quantized result
 * - Export quantized image
 * 
 * Uses ComponentLibrary - NO direct DOM manipulation!
 */

import { FileInput } from '../../../shared/components/input/FileInput.js';
import { StatusDisplay } from '../../../shared/component-library.js';
import { Button } from '../../../shared/component-library.js';
import { Dropdown } from '../../../shared/components/input/Dropdown.js';

export class MFPQuantizeTab {
    constructor(sharedState) {
        this.state = sharedState;
        this.components = [];
        this.quantizeStatus = null;
    }
    
    /**
     * Build sidebar using ComponentLibrary
     */
    getSidebar(toolBase) {
        this.components = [];
        
        // QUANTIZATION CONFIG STATUS
        const configStatusText = this.state.quantizationConfig
            ? `✅ Config: ${this.state.quantizationConfig.palette.length} colors`
            : '⚠️ No config. Analyze scan first.';
        
        const configStatus = new StatusDisplay({
            status: this.state.quantizationConfig ? 'success' : 'warning',
            message: configStatusText
        });
        this.components.push(configStatus);
        
        // SOURCE IMAGE UPLOAD
        const sourceImageInput = new FileInput({
            label: 'Upload Source Image',
            accept: 'image/*',
            onChange: (file) => this._loadSourceImage(file, toolBase)
        });
        this.components.push(sourceImageInput);
        
        this.quantizeStatus = new StatusDisplay({
            status: 'idle',
            message: this.state.sourceImageElement ? '✅ Image loaded' : 'Upload image to quantize'
        });
        this.components.push(this.quantizeStatus);
        
        // QUANTIZATION METHOD
        const methodDropdown = new Dropdown({
            label: 'Quantization Method',
            options: ['K-means', 'Median Cut', 'Octree', 'Nearest Color'],
            selected: 'Nearest Color',
            onChange: (value) => {
                toolBase.updateValue('quantMethod', value);
            }
        });
        this.components.push(methodDropdown);
        
        // APPLY QUANTIZATION
        const applyBtn = new Button({
            label: 'Apply Quantization',
            variant: 'primary',
            onClick: () => this._applyQuantization(toolBase)
        });
        this.components.push(applyBtn);
        
        // EXPORT
        const exportBtn = new Button({
            label: 'Export Quantized Image',
            onClick: () => this._exportQuantizedImage(toolBase)
        });
        this.components.push(exportBtn);
        
        return this.components;
    }
    
    /**
     * Load source image
     */
    async _loadSourceImage(file, toolBase) {
        try {
            this.quantizeStatus.setStatus('info', '⏳ Loading image...');
            
            const img = new Image();
            const url = URL.createObjectURL(file);
            
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = url;
            });
            
            URL.revokeObjectURL(url);
            
            this.state.sourceImageElement = img;
            
            // Resize canvas
            const canvas = toolBase.canvas;
            canvas.width = img.width;
            canvas.height = img.height;
            
            toolBase.draw();
            
            this.quantizeStatus.setStatus('success', `✅ Loaded ${img.width}×${img.height}px`);
            
        } catch (err) {
            console.error('Image load error:', err);
            this.quantizeStatus.setStatus('error', `❌ Load failed: ${err.message}`);
        }
    }
    
    /**
     * Apply quantization
     */
    async _applyQuantization(toolBase) {
        if (!this.state.sourceImageElement) {
            this.quantizeStatus.setStatus('error', '❌ Load source image first');
            return;
        }
        if (!this.state.quantizationConfig) {
            this.quantizeStatus.setStatus('error', '❌ Load quantization config first');
            return;
        }
        
        try {
            this.quantizeStatus.setStatus('info', '⏳ Quantizing...');
            
            // TODO: Implement quantization
            // Use algorithms from shared/algorithms/image/
            
            this.quantizeStatus.setStatus('success', '✅ Quantization complete (placeholder)');
            
        } catch (err) {
            console.error('Quantization error:', err);
            this.quantizeStatus.setStatus('error', `❌ Quantization failed: ${err.message}`);
        }
    }
    
    /**
     * Export quantized image
     */
    _exportQuantizedImage(toolBase) {
        if (!this.state.quantizedImage) {
            this.quantizeStatus.setStatus('error', '❌ Apply quantization first');
            return;
        }
        
        // TODO: Export as PNG
        this.quantizeStatus.setStatus('info', 'Export: TODO');
    }
    
    /**
     * Handle value updates
     */
    onUpdate(key, value, allValues, toolBase) {
        // Redraw if needed
        toolBase.draw();
    }
    
    /**
     * Draw canvas
     */
    onDraw(ctx, canvas, values) {
        if (this.state.quantizedImage) {
            // Draw quantized result
            ctx.drawImage(this.state.quantizedImage, 0, 0);
        } else if (this.state.sourceImageElement) {
            // Draw source image
            ctx.drawImage(this.state.sourceImageElement, 0, 0);
        } else {
            // Placeholder
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#00ff00';
            ctx.font = '16px "Atkinson Hyperlegible", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Upload Source Image', canvas.width / 2, canvas.height / 2);
        }
    }
    
    /**
     * Tab activation
     */
    onActivate(toolBase) {
        toolBase.draw();
    }
    
    /**
     * Cleanup
     */
    destroy() {
        this.components.forEach(comp => {
            if (comp && typeof comp.destroy === 'function') {
                comp.destroy();
            }
        });
        this.components = [];
    }
}

