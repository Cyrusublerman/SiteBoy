/**
 * Professional Adjustment Bundle
 * 
 * Full adjustment suite - composed ONLY from ComponentLibrary components
 */

import { AdjustmentBundleBase } from './AdjustmentBundleBase.js';
import { SimpleCurveEditor } from './SimpleCurveEditor.js';

export class ProfessionalBundle extends AdjustmentBundleBase {
    constructor(options = {}, deps = {}) {
        window.debugLog('INIT', '🎨 ProfessionalBundle constructor called');
        super({ ...options, componentType: 'professional-bundle' }, deps);
        
        this.sections = [];
        this.sliders = new Map();
        this.buttons = [];
        
        window.debugLog('INIT', '✅ ProfessionalBundle initialized');
    }
    
    getDefaultSettings() {
        return {
            ...super.getDefaultSettings(),
            exposure: 0,
            levels: { black: 0, mid: 1.0, white: 255 },
            curveLUT: null
        };
    }
    
    render() {
        window.debugLog('INIT', '🎨 ProfessionalBundle.render() called');
        
        const { Stack, Section, NumericInput, Button } = this.deps.ComponentLibrary;
        
        if (!Stack || !Section || !NumericInput || !Button) {
            console.error('❌ Required ComponentLibrary components not found');
            return this.createElement('div');
        }
        
        // Main vertical stack
        const mainStack = new Stack({
            direction: 'column',
            gap: 0.5
        }, this.deps);
        
        this.components.push(mainStack);
        
        // TONE section
        const toneChildren = [
            this.createSlider(NumericInput, 'Brightness', 'brightness', -100, 100, 1, 0),
            this.createSlider(NumericInput, 'Contrast', 'contrast', 0, 2, 0.01, 1),
            this.createSlider(NumericInput, 'Gamma', 'gamma', 0.2, 3, 0.1, 1),
            this.createSlider(NumericInput, 'Exposure', 'exposure', -3, 3, 0.1, 0, ' EV')
        ];
        
        const toneSection = new Section({
            title: 'TONE',
            collapsible: true,
            collapsed: false,
            children: toneChildren
        }, this.deps);
        
        this.sections.push(toneSection);
        mainStack.addChild(toneSection);
        
        // COLOR section
        const colorChildren = [
            this.createSlider(NumericInput, 'Saturation', 'saturation', 0, 2, 0.01, 1),
            this.createSlider(NumericInput, 'Hue', 'hue', -180, 180, 1, 0, '°')
        ];
        
        const colorSection = new Section({
            title: 'COLOR',
            collapsible: true,
            collapsed: false,
            children: colorChildren
        }, this.deps);
        
        this.sections.push(colorSection);
        mainStack.addChild(colorSection);
        
        // CURVES section
        this.curveEditor = new SimpleCurveEditor({ width: 196, height: 196 }, this.deps);
        this.curveEditor.on('change', (data) => {
            this.pushUndo();
            this.state.settings.curveLUT = data.lut;
            this.debouncedApply();
        });
        
        const resetCurveBtn = new Button({
            text: 'Reset Curve',
            onClick: () => this.curveEditor.reset()
        }, this.deps);
        this.buttons.push(resetCurveBtn);
        
        const curvesSection = new Section({
            title: 'CURVES',
            collapsible: true,
            collapsed: true,
            children: [this.curveEditor, resetCurveBtn]
        }, this.deps);
        
        this.sections.push(curvesSection);
        mainStack.addChild(curvesSection);
        
        // LEVELS section
        const levelsChildren = [
            this.createSlider(NumericInput, 'Black', 'levels.black', 0, 255, 1, 0),
            this.createSlider(NumericInput, 'Mid', 'levels.mid', 0.1, 9.9, 0.1, 1.0),
            this.createSlider(NumericInput, 'White', 'levels.white', 0, 255, 1, 255)
        ];
        
        const levelsSection = new Section({
            title: 'LEVELS',
            collapsible: true,
            collapsed: true,
            children: levelsChildren
        }, this.deps);
        
        this.sections.push(levelsSection);
        mainStack.addChild(levelsSection);
        
        // TRANSFORM section
        const transformControls = this.createTransformControls(Stack, Button);
        const transformSection = new Section({
            title: 'TRANSFORM',
            collapsible: true,
            collapsed: true,
            children: [transformControls]
        }, this.deps);
        
        this.sections.push(transformSection);
        mainStack.addChild(transformSection);
        
        // Action buttons
        const resetBtn = new Button({ text: 'Reset All', onClick: () => this.reset() }, this.deps);
        const undoBtn = new Button({ text: 'Undo', onClick: () => this.undo() }, this.deps);
        const redoBtn = new Button({ text: 'Redo', onClick: () => this.redo() }, this.deps);
        
        this.buttons.push(resetBtn, undoBtn, redoBtn);
        
        const buttonStack = new Stack({
            direction: 'row',
            gap: 0.5,
            children: [resetBtn, undoBtn, redoBtn]
        }, this.deps);
        
        this.components.push(buttonStack);
        mainStack.addChild(buttonStack);
        
        window.debugLog('INIT', '✅ ProfessionalBundle render complete');
        return mainStack.render();
    }
    
    createSlider(NumericInput, label, key, min, max, step, defaultValue, unit = '') {
        const slider = new NumericInput({
            label: label,
            min: min,
            max: max,
            step: step,
            value: defaultValue,
            display: 'both',
            unit: unit,
            onChange: (value) => {
                this.updateSettingNested(key, value);
            }
        }, this.deps);
        
        this.sliders.set(key, slider);
        this.components.push(slider);
        
        return slider;
    }
    
    createTransformControls(Stack, Button) {
        // Resize controls row
        const resizeScales = ['1×', '2×', '4×', '½', '¼'];
        let selectedScale = '1×';
        
        const resizeButtons = resizeScales.map(scale => {
            const btn = new Button({
                text: scale,
                onClick: () => {
                    selectedScale = scale;
                    const scaleMap = { '1×': 1, '2×': 2, '4×': 4, '½': 0.5, '¼': 0.25 };
                    const scaleValue = scaleMap[scale];
                    if (scaleValue !== 1) {
                        this.applyTransform('resize', scaleValue);
                    }
                }
            }, this.deps);
            this.buttons.push(btn);
            return btn;
        });
        
        const resizeStack = new Stack({
            direction: 'row',
            gap: 0.25,
            children: resizeButtons
        }, this.deps);
        this.components.push(resizeStack);
        
        // Rotate/Flip buttons
        const rotate90Btn = new Button({ 
            text: '⟲ 90°', 
            onClick: () => this.applyTransform('rotate', 1) 
        }, this.deps);
        
        const rotate270Btn = new Button({ 
            text: '⟳ 90°', 
            onClick: () => this.applyTransform('rotate', -1) 
        }, this.deps);
        
        const flipHBtn = new Button({ 
            text: '↔ H', 
            onClick: () => this.applyTransform('flipH') 
        }, this.deps);
        
        const flipVBtn = new Button({ 
            text: '↕ V', 
            onClick: () => this.applyTransform('flipV') 
        }, this.deps);
        
        this.buttons.push(rotate90Btn, rotate270Btn, flipHBtn, flipVBtn);
        
        const transformStack = new Stack({
            direction: 'row',
            gap: 0.25,
            children: [rotate90Btn, rotate270Btn, flipHBtn, flipVBtn]
        }, this.deps);
        this.components.push(transformStack);
        
        // Combine into vertical stack
        const container = new Stack({
            direction: 'column',
            gap: 0.5,
            children: [resizeStack, transformStack]
        }, this.deps);
        this.components.push(container);
        
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
    
    updateUI() {
        // Update all sliders
        this.sliders.forEach((slider, key) => {
            if (key.includes('.')) {
                const [parent, child] = key.split('.');
                const value = this.state.settings[parent]?.[child];
                if (value !== undefined && slider.setValue) {
                    slider.setValue(value);
                }
            } else {
                const value = this.state.settings[key];
                if (value !== undefined && slider.setValue) {
                    slider.setValue(value);
                }
            }
        });
    }
    
    destroy() {
        if (this.curveEditor) {
            this.curveEditor.destroy();
        }
        this.sections.forEach(s => s.destroy && s.destroy());
        this.buttons.forEach(btn => btn.destroy && btn.destroy());
        super.destroy();
    }
}
