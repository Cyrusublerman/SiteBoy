/**
 * EquationEditor - Interactive equation display with clickable values
 * 
 * Displays a formatted equation where values can be clicked to edit inline.
 * 
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class EquationEditor extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'equation-editor' }, deps);
        
        // Equation template with {paramName} placeholders
        // e.g., "r = {A}·sin({f}·θ + {φ})"
        this.template = options.template ?? '';
        
        // Parameter definitions: {name: {value, min, max, step, precision}}
        this.params = options.params ?? {};
        
        this.onChange = options.onChange ?? (() => {});
        
        this.paramElements = {};
        this.activeInput = null;
    }
    
    render() {
        if (this.element) return this.element;
        
        const { F, F2 } = this.getF();
        
        this.element = this.createElement('div', 'equation-editor component');
        this.element.style.cssText = `
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${F}px;
            color: var(--c-text);
            padding: ${F}px;
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            line-height: 1.6;
        `;
        
        this._renderEquation(F);
        
        return this.element;
    }
    
    _renderEquation(F) {
        this.element.innerHTML = '';
        this.paramElements = {};
        const F2 = F / 2;
        
        // Parse template and replace {paramName} with clickable spans
        const parts = this.template.split(/(\{[^}]+\})/g);
        
        parts.forEach(part => {
            const match = part.match(/^\{(.+)\}$/);
            
            if (match) {
                const paramName = match[1];
                const param = this.params[paramName];
                
                if (param) {
                    const span = this.createElement('span', 'equation-param');
                    span.dataset.param = paramName;
                    span.textContent = this._formatValue(param.value, param.precision ?? 2);
                    span.style.cssText = `
                        color: var(--c-accent, var(--c-text));
                        cursor: pointer;
                        padding: 0 ${F2}px;
                        border-bottom: 1px dashed var(--c-border);
                    `;
                    
                    span.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this._showInlineInput(paramName, span, F);
                    });
                    
                    span.addEventListener('mouseenter', () => {
                        span.style.background = 'var(--c-text)';
                        span.style.color = 'var(--c-bg)';
                    });
                    span.addEventListener('mouseleave', () => {
                        span.style.background = 'transparent';
                        span.style.color = 'var(--c-accent, var(--c-text))';
                    });
                    
                    this.paramElements[paramName] = span;
                    this.element.appendChild(span);
                } else {
                    // Unknown param, just show as text
                    this.element.appendChild(document.createTextNode(part));
                }
            } else {
                this.element.appendChild(document.createTextNode(part));
            }
        });
    }
    
    _formatValue(value, precision = 2) {
        if (Math.abs(value - Math.round(value)) < 0.001) {
            return String(Math.round(value));
        }
        return value.toFixed(precision);
    }
    
    _showInlineInput(paramName, span, F) {
        // Close any existing input
        this._closeActiveInput();
        
        const F2 = F / 2;
        const param = this.params[paramName];
        
        // Create inline input that replaces the span content
        const input = this.createElement('input', 'equation-inline-input');
        input.type = 'number';
        input.value = param.value;
        input.min = param.min ?? '';
        input.max = param.max ?? '';
        input.step = param.step ?? 'any';
        input.style.cssText = `
            width: ${F * 3}px;
            height: ${F}px;
            padding: 0 2px;
            border: none;
            border-bottom: 1px solid var(--c-text);
            background: transparent;
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: inherit;
            text-align: center;
            outline: none;
            -moz-appearance: textfield;
        `;
        
        // Hide the spinner arrows
        this._injectSpinnerHideCSS();
        
        // Store original text and replace with input
        const originalText = span.textContent;
        span.textContent = '';
        span.appendChild(input);
        span.style.padding = '0';
        span.style.borderBottom = 'none';
        
        input.focus();
        input.select();
        
        this.activeInput = { input, span, paramName, originalText };
        
        const commit = () => {
            const newValue = parseFloat(input.value);
            if (!isNaN(newValue)) {
                let clamped = newValue;
                if (param.min !== undefined) clamped = Math.max(param.min, clamped);
                if (param.max !== undefined) clamped = Math.min(param.max, clamped);
                
                param.value = clamped;
                this._closeActiveInput(this._formatValue(clamped, param.precision ?? 2));
                this.onChange(paramName, clamped, this.getValues());
            } else {
                this._closeActiveInput(originalText);
            }
        };
        
        input.addEventListener('blur', commit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                commit();
            } else if (e.key === 'Escape') {
                this._closeActiveInput(originalText);
            }
        });
    }
    
    _injectSpinnerHideCSS() {
        if (!document.getElementById('equation-spinner-hide')) {
            const style = document.createElement('style');
            style.id = 'equation-spinner-hide';
            style.textContent = `
                .equation-inline-input::-webkit-outer-spin-button,
                .equation-inline-input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    _closeActiveInput(newText) {
        if (this.activeInput) {
            const { input, span, originalText } = this.activeInput;
            const { F, F2 } = this.getF();
            
            // Remove input and restore span
            span.textContent = newText ?? originalText;
            span.style.padding = `0 ${F2}px`;
            span.style.borderBottom = '1px dashed var(--c-border)';
            
            this.activeInput = null;
        }
    }
    
    // Public API
    getValues() {
        const values = {};
        for (const [name, param] of Object.entries(this.params)) {
            values[name] = param.value;
        }
        return values;
    }
    
    setValue(paramName, value) {
        if (this.params[paramName]) {
            this.params[paramName].value = value;
            if (this.paramElements[paramName]) {
                this.paramElements[paramName].textContent = this._formatValue(
                    value, 
                    this.params[paramName].precision ?? 2
                );
            }
        }
    }
    
    setValues(values) {
        for (const [name, value] of Object.entries(values)) {
            this.setValue(name, value);
        }
    }
    
    destroy() {
        this._closeActiveInput();
        super.destroy();
    }
}

