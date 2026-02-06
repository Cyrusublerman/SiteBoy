/**
 * TextInput - Universal text input component
 * 
 * Modes:
 * - multiline: false — single line input (DEFAULT)
 * - multiline: true — textarea
 * 
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class TextInput extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'text-input' }, deps);
        
        this.value = options.value ?? '';
        this.placeholder = options.placeholder ?? '';
        this.label = options.label ?? '';
        this.multiline = options.multiline ?? false;
        this.rows = options.rows ?? 4;
        this.maxLength = options.maxLength ?? null;
        this.pattern = options.pattern ?? null;
        this.disabled = options.disabled ?? false;
        this.inputClassName = options.inputClassName ?? null;
        
        this.onChange = options.onChange ?? (() => {});
        this.onInput = options.onInput ?? null;
        
        this.inputEl = null;
    }
    
    render() {
        if (this.element) return this.element;
        
        const { F, F2 } = this.getF();
        
        this.element = this.createElement('div', 'text-input component');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: ${F2}px;
            width: 100%;
        `;
        
        if (this.label) {
            const labelEl = this.createElement('label', 'text-input-label');
            labelEl.textContent = this.label;
            labelEl.style.cssText = `
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: ${F}px;
                color: var(--c-text);
            `;
            this.element.appendChild(labelEl);
        }
        
        const inputStyle = `
            width: 100%;
            padding: ${F2}px ${F}px;
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${F}px;
            box-sizing: border-box;
            resize: ${this.multiline ? 'vertical' : 'none'};
            ${this.multiline ? `height: calc(${this.rows} * 1.5em);` : ''}
        `;
        
        if (this.multiline) {
            this.inputEl = this.createElement('textarea', 'text-input-field');
            this.inputEl.rows = this.rows;
        } else {
            this.inputEl = this.createElement('input', 'text-input-field');
            this.inputEl.type = 'text';
        }
        
        this.inputEl.value = this.value;
        this.inputEl.placeholder = this.placeholder;
        this.inputEl.disabled = this.disabled;
        this.inputEl.style.cssText = inputStyle;
        
        if (this.maxLength) this.inputEl.maxLength = this.maxLength;
        if (this.pattern) this.inputEl.pattern = this.pattern;
        
        this.inputEl.addEventListener('input', (e) => {
            this.value = e.target.value;
            if (this.onInput) this.onInput(this.value);
        });
        
        this.inputEl.addEventListener('change', (e) => {
            this.value = e.target.value;
            this.onChange(this.value);
        });
        
        this.element.appendChild(this.inputEl);
        
        return this.element;
    }
    
    getValue() {
        return this.value;
    }
    
    setValue(val) {
        this.value = val;
        if (this.inputEl) this.inputEl.value = val;
    }
    
    clear() {
        this.setValue('');
    }
}

