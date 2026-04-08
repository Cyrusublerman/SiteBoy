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
        // Steppers shown by default whenever a field is present; opt out with showSteppers: false
        this.showSteppers = options.showSteppers ?? (options.display !== 'slider');
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
        
        // Scroll velocity tracking for exponential scroll response
        this._scrollVelocity = 0;
        this._scrollLastTime = 0;
        this._scrollDecayTimer = null;
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
        
        // Number field - hide browser spinners; field is left anchor of [field | − | +]
        if (this.display === 'field' || this.display === 'both') {
            this.fieldEl = this.createElement('input', 'numeric-input-field');
            this.fieldEl.type = 'number';
            this.fieldEl.min = this.min;
            this.fieldEl.max = this.max;
            this.fieldEl.step = this.step;
            this.fieldEl.value = this._formatValue(this.value);
            // Field owns top/left/bottom borders; right border is owned by the adjacent stepper's border-left
            const fieldBorderRight = this.showSteppers ? 'none' : '1px solid var(--c-border)';
            this.fieldEl.style.cssText = `
                width: ${F * this.fieldWidthF}px;
                height: ${F * 2}px;
                padding: 0 ${F2}px;
                border-top: 1px solid var(--c-border);
                border-left: 1px solid var(--c-border);
                border-bottom: 1px solid var(--c-border);
                border-right: ${fieldBorderRight};
                background: var(--c-bg);
                color: var(--c-text);
                font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
                font-size: ${F * 0.75}px;
                text-align: right;
                box-sizing: border-box;
                -moz-appearance: textfield;
                flex-shrink: 0;
            `;
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

            this.fieldEl.addEventListener('dblclick', () => {
                this._updateValue(this.defaultValue, false);
            });

            this.fieldEl.addEventListener('wheel', (e) => {
                e.preventDefault();
                this._handleScrollStep(e.deltaY);
            }, { passive: false });
            
            controlRow.appendChild(this.fieldEl);
        }
        
        // Stepper minus — border-left only (shared boundary with field per border-system §4)
        if (this.showSteppers) {
            controlRow.appendChild(this._makeStepperBtn('−', -1, F));
        }
        
        // Stepper plus — border-left only (shared boundary with minus per border-system §4)
        if (this.showSteppers) {
            controlRow.appendChild(this._makeStepperBtn('+', 1, F));
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
    
    _makeStepperBtn(glyph, direction, F) {
        const btn = this.createElement('button', `numeric-input-stepper ${direction > 0 ? 'plus' : 'minus'}`);
        btn.type = 'button';
        btn.textContent = glyph;
        btn.style.cssText = this._stepperStyle(F);
        btn.addEventListener('click', () => this._step(direction));
        btn.addEventListener('mouseenter', () => {
            btn.style.background = 'var(--c-text)';
            btn.style.color = 'var(--c-bg)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.background = 'var(--c-bg)';
            btn.style.color = 'var(--c-text)';
        });
        return btn;
    }

    _stepperStyle(F) {
        // Horizontal stack: each stepper owns its left boundary only (border-system §4)
        return `
            width: ${F * 2}px;
            height: ${F * 2}px;
            border-top: none;
            border-bottom: none;
            border-right: none;
            border-left: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F * 0.75}px;
            line-height: ${F * 2}px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            box-sizing: border-box;
            padding: 0;
            user-select: none;
        `;
    }

    _handleScrollStep(deltaY) {
        const now = performance.now();
        const dt = now - this._scrollLastTime;
        this._scrollLastTime = now;

        // Exponential velocity accumulation — faster scroll = larger steps
        // Decay previous velocity if time gap is large
        const decay = dt > 200 ? 0 : Math.exp(-dt / 150);
        this._scrollVelocity = this._scrollVelocity * decay + Math.abs(deltaY);

        // Clamp velocity to prevent runaway accumulation
        this._scrollVelocity = Math.min(this._scrollVelocity, 800);

        // Exponential multiplier: 1× at low velocity, up to ~8× at high velocity
        const multiplier = 1 + (this._scrollVelocity / 100) ** 1.4;
        const steps = Math.sign(deltaY) * multiplier;
        const newVal = this._clamp(this.value + this.step * steps);

        this._updateValue(newVal, false);

        // Decay velocity back to zero when scrolling stops
        if (this._scrollDecayTimer) clearTimeout(this._scrollDecayTimer);
        this._scrollDecayTimer = setTimeout(() => {
            this._scrollVelocity = 0;
        }, 200);
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

    destroy() {
        if (this._scrollDecayTimer) {
            clearTimeout(this._scrollDecayTimer);
            this._scrollDecayTimer = null;
        }
        super.destroy?.();
    }
}

