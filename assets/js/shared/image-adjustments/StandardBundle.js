/**
 * Standard Adjustment Bundle
 * 
 * 10 controls: Minimal + Exposure, Levels, Resize, Rotate, Flip
 */

import { AdjustmentBundleBase } from './AdjustmentBundleBase.js';

export class StandardBundle extends AdjustmentBundleBase {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'standard-bundle' }, deps);
    }
    getDefaultSettings() {
        return {
            ...super.getDefaultSettings(),
            exposure: 0,
            levels: { black: 0, mid: 1.0, white: 255 }
        };
    }
    
    render() {
        const container = document.createElement('div');
        container.className = 'adjustment-bundle standard';
        
        // TONE section
        const toneSection = this.createSection('TONE');
        toneSection.appendChild(this.createSlider('Brightness', 'brightness', -100, 100, 1, 0));
        toneSection.appendChild(this.createSlider('Contrast', 'contrast', 0, 2, 0.01, 1));
        toneSection.appendChild(this.createSlider('Gamma', 'gamma', 0.2, 3, 0.1, 1));
        toneSection.appendChild(this.createSlider('Exposure', 'exposure', -3, 3, 0.1, 0, ' EV'));
        container.appendChild(toneSection);
        
        // COLOR section
        const colorSection = this.createSection('COLOR');
        colorSection.appendChild(this.createSlider('Saturation', 'saturation', 0, 2, 0.01, 1));
        colorSection.appendChild(this.createSlider('Hue', 'hue', -180, 180, 1, 0, '°'));
        container.appendChild(colorSection);
        
        // LEVELS section
        const levelsSection = this.createSection('LEVELS');
        levelsSection.appendChild(this.createSlider('Black', 'levels.black', 0, 255, 1, 0));
        levelsSection.appendChild(this.createSlider('Mid', 'levels.mid', 0.1, 9.9, 0.1, 1.0));
        levelsSection.appendChild(this.createSlider('White', 'levels.white', 0, 255, 1, 255));
        container.appendChild(levelsSection);
        
        // TRANSFORM section
        const transformSection = this.createSection('TRANSFORM');
        transformSection.appendChild(this.createTransformControls());
        container.appendChild(transformSection);
        
        // Buttons
        const buttonRow = document.createElement('div');
        buttonRow.className = 'button-row';
        
        const resetBtn = document.createElement('button');
        resetBtn.textContent = 'Reset All';
        resetBtn.addEventListener('click', () => this.reset());
        
        const undoBtn = document.createElement('button');
        undoBtn.textContent = 'Undo';
        undoBtn.addEventListener('click', () => this.undo());
        
        buttonRow.appendChild(resetBtn);
        buttonRow.appendChild(undoBtn);
        container.appendChild(buttonRow);
        
        return container;
    }
    
    createSection(title) {
        const section = document.createElement('div');
        section.className = 'adjustment-section';
        
        const header = document.createElement('h4');
        header.textContent = title;
        section.appendChild(header);
        
        return section;
    }
    
    createSlider(label, key, min, max, step, defaultValue, suffix = '') {
        const row = document.createElement('div');
        row.className = 'control-row';
        
        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = min;
        slider.max = max;
        slider.step = step;
        slider.value = defaultValue;
        
        const valueDisplay = document.createElement('span');
        valueDisplay.className = 'value-display';
        valueDisplay.textContent = this.formatValue(defaultValue, step) + suffix;
        
        slider.addEventListener('input', () => {
            const value = parseFloat(slider.value);
            this.updateSettingNested(key, value);
            valueDisplay.textContent = this.formatValue(value, step) + suffix;
        });
        
        if (!this.sliders) this.sliders = {};
        if (!this.valueDisplays) this.valueDisplays = {};
        this.sliders[key] = slider;
        this.valueDisplays[key] = valueDisplay;
        
        row.appendChild(labelEl);
        row.appendChild(slider);
        row.appendChild(valueDisplay);
        
        return row;
    }
    
    createTransformControls() {
        const container = document.createElement('div');
        container.className = 'transform-controls';
        
        // Resize
        const resizeRow = document.createElement('div');
        resizeRow.className = 'control-row';
        
        const resizeLabel = document.createElement('label');
        resizeLabel.textContent = 'Resize';
        
        const resizeSelect = document.createElement('select');
        ['1×', '2×', '4×', '½', '¼'].forEach(scale => {
            const option = document.createElement('option');
            option.value = scale;
            option.textContent = scale;
            resizeSelect.appendChild(option);
        });
        resizeSelect.value = '1×';
        
        const resizeBtn = document.createElement('button');
        resizeBtn.textContent = 'Apply';
        resizeBtn.addEventListener('click', () => {
            const scaleMap = { '1×': 1, '2×': 2, '4×': 4, '½': 0.5, '¼': 0.25 };
            const scale = scaleMap[resizeSelect.value];
            if (scale !== 1) {
                this.applyTransform('resize', scale);
            }
        });
        
        resizeRow.appendChild(resizeLabel);
        resizeRow.appendChild(resizeSelect);
        resizeRow.appendChild(resizeBtn);
        container.appendChild(resizeRow);
        
        // Rotate/Flip
        const rotateRow = document.createElement('div');
        rotateRow.className = 'control-row button-group';
        
        const rotateLabel = document.createElement('label');
        rotateLabel.textContent = 'Transform';
        
        const rotate90Btn = document.createElement('button');
        rotate90Btn.textContent = '⟲ 90°';
        rotate90Btn.addEventListener('click', () => this.applyTransform('rotate', 1));
        
        const rotate270Btn = document.createElement('button');
        rotate270Btn.textContent = '⟳ 90°';
        rotate270Btn.addEventListener('click', () => this.applyTransform('rotate', -1));
        
        const flipHBtn = document.createElement('button');
        flipHBtn.textContent = '↔ H';
        flipHBtn.addEventListener('click', () => this.applyTransform('flipH'));
        
        const flipVBtn = document.createElement('button');
        flipVBtn.textContent = '↕ V';
        flipVBtn.addEventListener('click', () => this.applyTransform('flipV'));
        
        rotateRow.appendChild(rotateLabel);
        rotateRow.appendChild(rotate90Btn);
        rotateRow.appendChild(rotate270Btn);
        rotateRow.appendChild(flipHBtn);
        rotateRow.appendChild(flipVBtn);
        container.appendChild(rotateRow);
        
        return container;
    }
    
    updateSettingNested(key, value) {
        if (key.includes('.')) {
            const [parent, child] = key.split('.');
            this.pushUndo();
            if (!this.state.settings[parent]) {
                this.state.settings[parent] = {};
            }
            this.state.settings[parent][child] = value;
            this.debouncedApply();
        } else {
            this.updateSetting(key, value);
        }
    }
    
    formatValue(value, step) {
        if (step >= 1) return Math.round(value);
        if (step >= 0.1) return value.toFixed(1);
        return value.toFixed(2);
    }
    
    updateUI() {
        // Update all sliders
        Object.keys(this.sliders).forEach(key => {
            if (key.includes('.')) {
                const [parent, child] = key.split('.');
                const value = this.state.settings[parent]?.[child];
                if (value !== undefined) {
                    this.sliders[key].value = value;
                    this.valueDisplays[key].textContent = this.formatValue(value, parseFloat(this.sliders[key].step));
                }
            } else {
                const value = this.state.settings[key];
                if (value !== undefined) {
                    this.sliders[key].value = value;
                    this.valueDisplays[key].textContent = this.formatValue(value, parseFloat(this.sliders[key].step));
                }
            }
        });
    }
}

