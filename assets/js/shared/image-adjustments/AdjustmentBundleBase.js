/**
 * Adjustment Bundle Base — Shared Logic
 * 
 * Base class for all adjustment bundles
 */

import { BaseComponent } from '../foundation.js';
import {
    applyBrightness,
    applyExposure,
    applyHueRotation,
    applyLevels,
    applyCurveLUT
} from '../algorithms/image/image-adjustments-extended.js';
import {
    applyGamma,
    applyContrast,
    applySaturation
} from '../algorithms/image/image-adjustments.js';
import {
    resizeProportional,
    rotate90,
    flipHorizontal,
    flipVertical
} from '../algorithms/image/image-resize-proportional.js';

export class AdjustmentBundleBase extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'adjustment-bundle-base' }, deps);
        
        this.options = {
            onChange: null,
            onTransform: null,
            ...options
        };
        
        this.state = {
            originalImage: null,
            settings: this.getDefaultSettings(),
            undoStack: [],
            redoStack: []
        };
        
        this.components = [];
    }
    
    getDefaultSettings() {
        return {
            brightness: 0,
            contrast: 1.0,
            gamma: 1.0,
            saturation: 1.0,
            hue: 0
        };
    }
    
    setImage(imageData) {
        this.state.originalImage = imageData;
        this.applyAdjustments();
    }
    
    applyAdjustments() {
        if (!this.state.originalImage) return;
        
        let result = this.state.originalImage;
        const s = this.state.settings;
        
        // Apply adjustments in optimal order
        if (s.levels) result = applyLevels(result, s.levels);
        if (s.exposure !== 0) result = applyExposure(result, s.exposure);
        if (s.brightness !== 0) result = applyBrightness(result, s.brightness);
        if (s.contrast !== 1) result = applyContrast(result, s.contrast);
        if (s.gamma !== 1) result = applyGamma(result, s.gamma);
        if (s.hue !== 0) result = applyHueRotation(result, s.hue);
        if (s.saturation !== 1) result = applySaturation(result, s.saturation);
        if (s.curveLUT) result = applyCurveLUT(result, s.curveLUT, 'rgb');
        
        if (this.options.onChange) {
            this.options.onChange(result, s);
        }
    }
    
    updateSetting(key, value) {
        this.pushUndo();
        this.state.settings[key] = value;
        this.debouncedApply();
    }
    
    applyTransform(transformType, value) {
        if (!this.state.originalImage) return;
        
        let result = this.state.originalImage;
        
        if (transformType === 'resize') {
            result = resizeProportional(result, value);
        } else if (transformType === 'rotate') {
            result = rotate90(result, value);
        } else if (transformType === 'flipH') {
            result = flipHorizontal(result);
        } else if (transformType === 'flipV') {
            result = flipVertical(result);
        }
        
        this.state.originalImage = result;
        
        if (this.options.onTransform) {
            this.options.onTransform(result, { type: transformType, value });
        }
        
        this.applyAdjustments();
    }
    
    pushUndo() {
        this.state.undoStack.push({ ...this.state.settings });
        if (this.state.undoStack.length > 20) {
            this.state.undoStack.shift();
        }
        this.state.redoStack = [];
    }
    
    undo() {
        if (this.state.undoStack.length === 0) return;
        this.state.redoStack.push({ ...this.state.settings });
        this.state.settings = this.state.undoStack.pop();
        this.applyAdjustments();
        this.updateUI();
    }
    
    redo() {
        if (this.state.redoStack.length === 0) return;
        this.state.undoStack.push({ ...this.state.settings });
        this.state.settings = this.state.redoStack.pop();
        this.applyAdjustments();
        this.updateUI();
    }
    
    reset() {
        this.pushUndo();
        this.state.settings = this.getDefaultSettings();
        this.applyAdjustments();
        this.updateUI();
    }
    
    updateUI() {
        // Override in subclasses to update slider values
    }
    
    debouncedApply = (() => {
        let timeout;
        return () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => this.applyAdjustments(), 100);
        };
    })();
    
    destroy() {
        this.components.forEach(c => c.destroy && c.destroy());
        super.destroy();
    }
}

