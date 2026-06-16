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
import { Slider } from './Slider.js';

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
        // Embedded: drop the outer box (top/bottom/right) and use border-left dividers
        // only, so the group sits inside an already-bordered container without doubling.
        this.embedded = options.embedded ?? false;
        this.topBorder = options.topBorder ?? true;
        // Steppers shown by default whenever a field is present; opt out with showSteppers: false
        this.showSteppers = options.showSteppers ?? (options.display !== 'slider');
        // Let the number field grow to fill its container instead of a fixed width.
        // Used when the field is the sole flexible cell (e.g. CanvasSizePair).
        this.fieldFlex = options.fieldFlex ?? false;
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
        this._sliderComp = null;
        this.sliderEl = null;
        this.fieldEl = null;
        this._titleDiv = null;
        this._box = null;
        
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
    
    _containerBorderCss() {
        if (this.embedded) return '';
        const top = this.label ? true : this.topBorder;
        return `
            border-top: ${top ? '1px solid var(--c-border)' : 'none'};
            border-right: 1px solid var(--c-border);
            border-bottom: 1px solid var(--c-border);
            border-left: 1px solid var(--c-border);
        `;
    }

    render() {
        if (this.element) return this.element;
        
        const { F, F2 } = this.getF();
        
        this.element = this.createElement('div', 'numeric-input component');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 0;
            width: 100%;
        `;
        
        if (this.label && !this.embedded) {
            this._titleDiv = this.createElement('div', 'numeric-input__label-row');
            this._titleDiv.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: space-between;
                height: ${F * 1.5}px;
                padding: 0 ${F2}px;
                border-top: ${this.topBorder ? '1px solid var(--c-border)' : 'none'};
                border-left: 1px solid var(--c-border);
                border-right: 1px solid var(--c-border);
                box-sizing: border-box;
            `;
            const labelEl = this.createElement('span', 'numeric-input-label');
            labelEl.textContent = this.label.toUpperCase();
            labelEl.style.cssText = `
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: ${F * 0.75}px;
                color: var(--c-text);
                text-transform: uppercase;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            `;
            this._titleDiv.appendChild(labelEl);
            if (this.display === 'slider') {
                this.valueDisplay = this.createElement('span', 'numeric-input-value');
                this.valueDisplay.textContent = this._formatValue(this.value);
                this.valueDisplay.style.cssText = `
                    font-family: 'Atkinson Hyperlegible Mono', monospace;
                    font-size: ${F * 0.75}px;
                    color: var(--c-text);
                    flex-shrink: 0;
                `;
                this._titleDiv.appendChild(this.valueDisplay);
            }
            this.element.appendChild(this._titleDiv);
        }
        
        const controlRow = this.createElement('div', 'numeric-input-controls');
        if (this.embedded) {
            controlRow.style.cssText = `display: flex; align-items: stretch; gap: 0; height: 100%;`;
        } else {
            this._box = this.createElement('div', 'numeric-input__box');
            this._box.style.cssText = `
                display: flex;
                align-items: stretch;
                gap: 0;
                width: 100%;
                height: ${F * 2 + 2}px;
                box-sizing: border-box;
                ${this._containerBorderCss()}
            `;
            controlRow.style.cssText = `display: flex; align-items: stretch; gap: 0; width: 100%; height: 100%;`;
            this._box.appendChild(controlRow);
            this.element.appendChild(this._box);
        }
        
        const hasSlider = this.display === 'slider' || this.display === 'both';
        const sliderBorders = this.embedded
            ? { top: false, right: false, bottom: false, left: true }
            : { top: false, right: false, bottom: false, left: false };

        if (hasSlider) {
            this._sliderComp = new Slider({
                min:   this.min,
                max:   this.max,
                step:  this.step,
                value: this.value,
                trackHF: 2,
                ariaLabel: this.label,
                borders: sliderBorders,
                onInput:  (val) => this._updateValue(val, true),
                onChange: (val) => this._updateValue(val, false),
            }, this.deps);
            this.addChild(this._sliderComp);
            this.sliderEl = this._sliderComp.render();
            this.sliderEl.style.flex = '1';
            this.sliderEl.style.minWidth = '0';
            this.sliderEl.style.height = '100%';
            controlRow.appendChild(this.sliderEl);
        }
        
        // Field + stepper group: [ − | field | + ]
        const hasField = this.display === 'field' || this.display === 'both';

        // Stepper minus — first cell of the group
        if (this.showSteppers) {
            controlRow.appendChild(this._makeStepperBtn('−', -1, F, false, hasSlider && !this.embedded));
        }

        // Number field — hide browser spinners
        if (hasField) {
            this.fieldEl = this.createElement('input', 'numeric-input-field');
            this.fieldEl.type = 'number';
            this.fieldEl.min = this.min;
            this.fieldEl.max = this.max;
            this.fieldEl.step = this.step;
            this.fieldEl.value = this._formatValue(this.value);
            const fieldIsLast = !this.showSteppers;
            const fieldSizing = this.fieldFlex
                ? `flex: 1; min-width: 0; width: auto;`
                : `width: ${F * this.fieldWidthF}px; flex-shrink: 0;`;
            this.fieldEl.style.cssText = `
                ${fieldSizing}
                height: 100%;
                padding: 0 ${F2}px;
                ${this._cellBorderCss(fieldIsLast, !this.embedded && (hasSlider || this.showSteppers))}
                background: var(--c-bg);
                color: var(--c-text);
                font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
                font-size: ${F * 0.75}px;
                text-align: right;
                box-sizing: border-box;
                -moz-appearance: textfield;
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
        
        // Stepper plus — last cell of the group
        if (this.showSteppers) {
            controlRow.appendChild(this._makeStepperBtn('+', 1, F, true, !this.embedded));
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
        
        if (this.embedded) this.element.appendChild(controlRow);
        
        return this.element;
    }
    
    _makeStepperBtn(glyph, direction, F, isLast, withLeftDivider = false) {
        const btn = this.createElement('button', `numeric-input-stepper ${direction > 0 ? 'plus' : 'minus'}`);
        btn.type = 'button';
        btn.textContent = glyph;
        btn.style.cssText = this._stepperStyle(F, isLast, withLeftDivider);
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

    /**
     * Border CSS for one cell of the [ − | field | + ] group.
     * Standalone: full box (top/bottom/left; right only on the last cell).
     * Embedded: border-left divider only — the container owns the outer box.
     */
    _cellBorderCss(isLast, withLeftDivider = false) {
        if (this.embedded) {
            return `
                border-top: none;
                border-bottom: none;
                border-right: none;
                border-left: 1px solid var(--c-border);
            `;
        }
        return `
            border-top: none;
            border-bottom: none;
            border-right: none;
            border-left: ${withLeftDivider || !isLast ? '1px solid var(--c-border)' : 'none'};
        `;
    }

    _stepperStyle(F, isLast, withLeftDivider = false) {
        return `
            width: ${F * 2}px;
            height: 100%;
            ${this._cellBorderCss(isLast, withLeftDivider)}
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
    
    setTopBorder(on) {
        this.topBorder = !!on;
        if (this.embedded) return;
        const edge = on ? '1px solid var(--c-border)' : 'none';
        if (this._titleDiv) {
            this._titleDiv.style.borderTop = edge;
        } else if (this._box) {
            this._box.style.borderTop = edge;
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
        if (this._sliderComp) {
            this._sliderComp.destroy();
            this._sliderComp = null;
        }
        super.destroy?.();
    }
}

