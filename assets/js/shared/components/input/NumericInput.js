/**
 * NumericInput - Universal numeric input component
 * 
 * Modes:
 * - display: 'slider' — slider only
 * - display: 'field' — number field only
 * - display: 'both' — slider + synced number field (DEFAULT)
 * 
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class NumericInput extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'numeric-input' }, deps);
        
        // Value
        this.value = options.value ?? 0;
        this.defaultValue = options.defaultValue ?? this.value;
        
        // Constraints
        this.min = options.min ?? -Infinity;
        this.max = options.max ?? Infinity;
        this.step = options.step ?? 1;
        
        // Display mode
        this.display = options.display ?? 'both'; // 'slider' | 'field' | 'both'
        this.showSteppers = options.showSteppers ?? false;
        this.logarithmic = options.logarithmic ?? false;
        
        // Labels & formatting
        this.label = options.label ?? '';
        this.unit = options.unit ?? '';
        this.precision = options.precision ?? this._inferPrecision();
        
        // Field width in F units - auto-calculated from precision if not specified
        // Rule: need ~1 character per digit + decimal + sign + padding
        this.fieldWidthF = options.fieldWidth ?? this._calcFieldWidth();
        
        // Events
        this.onChange = options.onChange ?? (() => {});
        this.onInput = options.onInput ?? null; // Continuous (drag)
        
        // Internal refs
        this.sliderEl = null;
        this.fieldEl = null;
    }
    
    _inferPrecision() {
        const stepStr = String(this.step);
        const decimalIndex = stepStr.indexOf('.');
        return decimalIndex === -1 ? 0 : stepStr.length - decimalIndex - 1;
    }
    
    /**
     * Calculate field width in F units based on expected number of characters
     * Formula: max of (max digits + precision + 2 for padding)
     * Minimum: 4F, grows based on significant figures needed
     */
    _calcFieldWidth() {
        // Count max digits needed
        const maxAbsValue = Math.max(Math.abs(this.min), Math.abs(this.max));
        const integerDigits = maxAbsValue === Infinity ? 4 : Math.max(1, Math.floor(Math.log10(maxAbsValue || 1)) + 1);
        const decimalDigits = this.precision;
        const signChar = this.min < 0 ? 1 : 0;
        const decimalPoint = decimalDigits > 0 ? 1 : 0;
        
        // Total characters + padding
        const totalChars = integerDigits + decimalDigits + signChar + decimalPoint + 1;
        
        // Convert to F units (approximately F/2 per character for monospace)
        // Minimum 4F, round up to nearest integer F
        return Math.max(4, Math.ceil(totalChars * 0.6));
    }
    
    render() {
        if (this.element) return this.element;
        
        const { F, F2 } = this.getF();
        
        this.element = this.createElement('div', 'numeric-input component');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: ${F2}px;
            width: 100%;
        `;
        
        // Label row
        if (this.label) {
            const labelRow = this.createElement('div', 'numeric-input-label-row');
            labelRow.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: ${F}px;
                color: var(--c-text);
            `;
            
            const labelEl = this.createElement('span', 'numeric-input-label');
            labelEl.textContent = this.label;
            labelRow.appendChild(labelEl);
            
            // Value display with unit (for slider-only mode)
            if (this.display === 'slider') {
                this.valueDisplay = this.createElement('span', 'numeric-input-value');
                this.valueDisplay.textContent = this._formatValue(this.value);
                labelRow.appendChild(this.valueDisplay);
            }
            
            this.element.appendChild(labelRow);
        }
        
        // Control row - gap only between slider and other controls, not between field+steppers
        const controlRow = this.createElement('div', 'numeric-input-controls');
        controlRow.style.cssText = `
            display: flex;
            align-items: center;
            gap: 0;
        `;
        
        // Slider
        if (this.display === 'slider' || this.display === 'both') {
            this.sliderEl = this.createElement('input', 'numeric-input-slider');
            this.sliderEl.type = 'range';
            this.sliderEl.min = this.min;
            this.sliderEl.max = this.max;
            this.sliderEl.step = this.step;
            this.sliderEl.value = this.value;
            this.sliderEl.style.cssText = `
                flex: 1;
                height: ${F * 2}px;
                cursor: pointer;
                accent-color: var(--c-text);
                margin-right: ${F2}px;
            `;
            
            this.sliderEl.addEventListener('input', (e) => {
                const val = this._parseValue(e.target.value);
                this._updateValue(val, true);
            });
            
            this.sliderEl.addEventListener('change', (e) => {
                const val = this._parseValue(e.target.value);
                this._updateValue(val, false);
            });
            
            controlRow.appendChild(this.sliderEl);
        }
        
        // Stepper minus (shares right border with field)
        if (this.showSteppers) {
            const minusBtn = this.createElement('button', 'numeric-input-stepper minus');
            minusBtn.type = 'button';
            minusBtn.textContent = '−';
            minusBtn.style.cssText = this._stepperStyle(F, 'left');
            minusBtn.addEventListener('click', () => this._step(-1));
            controlRow.appendChild(minusBtn);
        }
        
        // Number field - hide browser spinners, share borders with steppers
        if (this.display === 'field' || this.display === 'both') {
            this.fieldEl = this.createElement('input', 'numeric-input-field');
            this.fieldEl.type = 'number';
            this.fieldEl.min = this.min;
            this.fieldEl.max = this.max;
            this.fieldEl.step = this.step;
            this.fieldEl.value = this._formatValue(this.value);
            this.fieldEl.style.cssText = `
                width: ${F * this.fieldWidthF}px;
                height: ${F * 2}px;
                padding: 0 ${F2}px;
                border: 1px solid var(--c-border);
                ${this.showSteppers ? 'margin-left: -1px;' : ''}
                background: var(--c-bg);
                color: var(--c-text);
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: ${F}px;
                text-align: center;
                box-sizing: border-box;
                -moz-appearance: textfield;
            `;
            // Hide browser spinners
            this._injectSpinnerHideCSS();
            
            this.fieldEl.addEventListener('input', (e) => {
                const val = this._parseValue(e.target.value);
                if (!isNaN(val)) {
                    this._updateValue(val, true);
                }
            });
            
            this.fieldEl.addEventListener('change', (e) => {
                const val = this._parseValue(e.target.value);
                if (!isNaN(val)) {
                    this._updateValue(this._clamp(val), false);
                } else {
                    e.target.value = this._formatValue(this.value);
                }
            });
            
            controlRow.appendChild(this.fieldEl);
        }
        
        // Stepper plus (shares left border with field)
        if (this.showSteppers) {
            const plusBtn = this.createElement('button', 'numeric-input-stepper plus');
            plusBtn.type = 'button';
            plusBtn.textContent = '+';
            plusBtn.style.cssText = this._stepperStyle(F, 'right');
            plusBtn.addEventListener('click', () => this._step(1));
            controlRow.appendChild(plusBtn);
        }
        
        // Unit label
        if (this.unit && this.display !== 'slider') {
            const unitEl = this.createElement('span', 'numeric-input-unit');
            unitEl.textContent = this.unit;
            unitEl.style.cssText = `
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: ${F}px;
                color: var(--c-text);
                opacity: 0.7;
            `;
            controlRow.appendChild(unitEl);
        }
        
        this.element.appendChild(controlRow);
        
        return this.element;
    }
    
    _stepperStyle(F, position) {
        // Shared borders: left stepper shares right border with field, right stepper shares left
        const marginStyle = position === 'right' ? 'margin-left: -1px;' : '';
        return `
            width: ${F * 2}px;
            height: ${F * 2}px;
            border: 1px solid var(--c-border);
            ${marginStyle}
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${F}px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
        `;
    }
    
    _injectSpinnerHideCSS() {
        // Inject CSS once to hide number input spinners
        if (!document.getElementById('numeric-input-spinner-hide')) {
            const style = document.createElement('style');
            style.id = 'numeric-input-spinner-hide';
            style.textContent = `
                .numeric-input-field::-webkit-outer-spin-button,
                .numeric-input-field::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    _parseValue(str) {
        return parseFloat(str);
    }
    
    _formatValue(val) {
        const formatted = val.toFixed(this.precision);
        return this.unit && this.display === 'slider' 
            ? `${formatted}${this.unit}` 
            : formatted;
    }
    
    _clamp(val) {
        return Math.max(this.min, Math.min(this.max, val));
    }
    
    _step(direction) {
        const newVal = this._clamp(this.value + (this.step * direction));
        this._updateValue(newVal, false);
    }
    
    _updateValue(val, isInput) {
        this.value = val;
        
        // Sync UI
        if (this.sliderEl && this.sliderEl.value !== String(val)) {
            this.sliderEl.value = val;
        }
        if (this.fieldEl && this.fieldEl.value !== this._formatValue(val)) {
            this.fieldEl.value = this._formatValue(val);
        }
        if (this.valueDisplay) {
            this.valueDisplay.textContent = this._formatValue(val);
        }
        
        // Fire events
        if (isInput && this.onInput) {
            this.onInput(val);
        }
        if (!isInput) {
            this.onChange(val);
        }
    }
    
    // Public API
    getValue() {
        return this.value;
    }
    
    setValue(val, triggerChange = true) {
        const next = this._clamp(val);
        if (triggerChange) {
            this._updateValue(next, false);
        } else {
            this.value = next;
            if (this.sliderEl) this.sliderEl.value = next;
            if (this.fieldEl) this.fieldEl.value = this._formatValue(next);
            if (this.valueDisplay) this.valueDisplay.textContent = this._formatValue(next);
        }
    }

    setRange(min, max) {
        this.min = min;
        this.max = max;
        this.value = this._clamp(this.value);
        if (this.sliderEl) {
            this.sliderEl.min = min;
            this.sliderEl.max = max;
            this.sliderEl.value = this.value;
        }
        if (this.fieldEl) {
            this.fieldEl.min = min;
            this.fieldEl.max = max;
            this.fieldEl.value = this._formatValue(this.value);
        }
    }
    
    reset() {
        this.setValue(this.defaultValue);
    }
}

