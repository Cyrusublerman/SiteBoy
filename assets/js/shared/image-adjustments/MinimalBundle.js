/**
 * Minimal Adjustment Bundle
 * 
 * 5 controls: Brightness, Contrast, Gamma, Saturation, Hue
 */

import { AdjustmentBundleBase } from './AdjustmentBundleBase.js';

export class MinimalBundle extends AdjustmentBundleBase {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'minimal-bundle' }, deps);
    }
    render() {
        const container = document.createElement('div');
        container.className = 'adjustment-bundle minimal';
        
        // Create sliders
        const controls = [
            { label: 'Brightness', key: 'brightness', min: -100, max: 100, step: 1, default: 0 },
            { label: 'Contrast', key: 'contrast', min: 0, max: 2, step: 0.01, default: 1 },
            { label: 'Gamma', key: 'gamma', min: 0.2, max: 3, step: 0.1, default: 1 },
            { label: 'Saturation', key: 'saturation', min: 0, max: 2, step: 0.01, default: 1 },
            { label: 'Hue', key: 'hue', min: -180, max: 180, step: 1, default: 0 }
        ];
        
        this.sliders = {};
        this.valueDisplays = {};
        
        controls.forEach(control => {
            const row = document.createElement('div');
            row.className = 'control-row';
            
            const label = document.createElement('label');
            label.textContent = control.label;
            
            const slider = document.createElement('input');
            slider.type = 'range';
            slider.min = control.min;
            slider.max = control.max;
            slider.step = control.step;
            slider.value = control.default;
            slider.className = 'adjustment-slider';
            
            const valueDisplay = document.createElement('span');
            valueDisplay.className = 'value-display';
            valueDisplay.textContent = this.formatValue(control.default, control.key);
            
            slider.addEventListener('input', () => {
                const value = parseFloat(slider.value);
                this.updateSetting(control.key, value);
                valueDisplay.textContent = this.formatValue(value, control.key);
            });
            
            this.sliders[control.key] = slider;
            this.valueDisplays[control.key] = valueDisplay;
            
            row.appendChild(label);
            row.appendChild(slider);
            row.appendChild(valueDisplay);
            container.appendChild(row);
        });
        
        // Reset button
        const resetBtn = document.createElement('button');
        resetBtn.textContent = 'Reset All';
        resetBtn.className = 'reset-button';
        resetBtn.addEventListener('click', () => this.reset());
        container.appendChild(resetBtn);
        
        return container;
    }
    
    formatValue(value, key) {
        if (key === 'brightness' || key === 'hue') {
            return Math.round(value);
        }
        return value.toFixed(2);
    }
    
    updateUI() {
        const s = this.state.settings;
        Object.keys(this.sliders).forEach(key => {
            if (this.sliders[key]) {
                this.sliders[key].value = s[key] || 0;
                this.valueDisplays[key].textContent = this.formatValue(s[key] || 0, key);
            }
        });
    }
}

