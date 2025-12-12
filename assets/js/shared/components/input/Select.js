/**
 * Select - Universal dropdown/select component
 * 
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class Select extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'select' }, deps);
        
        this.options = options.options ?? []; // [{value, label}] or ['string']
        this.value = options.value ?? (this.options[0]?.value ?? this.options[0] ?? '');
        this.label = options.label ?? '';
        this.placeholder = options.placeholder ?? '';
        this.disabled = options.disabled ?? false;
        this.searchable = options.searchable ?? false;
        
        this.onChange = options.onChange ?? (() => {});
        
        this.selectEl = null;
    }
    
    render() {
        if (this.element) return this.element;
        
        const { F, F2 } = this.getF();
        
        this.element = this.createElement('div', 'select component');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: ${F2}px;
            width: 100%;
        `;
        
        if (this.label) {
            const labelEl = this.createElement('label', 'select-label');
            labelEl.textContent = this.label;
            labelEl.style.cssText = `
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: ${F}px;
                color: var(--c-text);
            `;
            this.element.appendChild(labelEl);
        }
        
        this.selectEl = this.createElement('select', 'select-field');
        this.selectEl.disabled = this.disabled;
        this.selectEl.style.cssText = `
            width: 100%;
            height: ${F * 2}px;
            padding: 0 ${F}px;
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${F}px;
            cursor: pointer;
            box-sizing: border-box;
        `;
        
        if (this.placeholder) {
            const placeholderOpt = this.createElement('option');
            placeholderOpt.value = '';
            placeholderOpt.textContent = this.placeholder;
            placeholderOpt.disabled = true;
            this.selectEl.appendChild(placeholderOpt);
        }
        
        this._renderOptions();
        
        this.selectEl.value = this.value;
        
        this.selectEl.addEventListener('change', (e) => {
            this.value = e.target.value;
            this.onChange(this.value);
        });
        
        this.element.appendChild(this.selectEl);
        
        return this.element;
    }
    
    _renderOptions() {
        // Clear existing (except placeholder)
        const startIndex = this.placeholder ? 1 : 0;
        while (this.selectEl.options.length > startIndex) {
            this.selectEl.remove(startIndex);
        }
        
        this.options.forEach(opt => {
            const optEl = this.createElement('option');
            if (typeof opt === 'object') {
                optEl.value = opt.value;
                optEl.textContent = opt.label ?? opt.value;
            } else {
                optEl.value = opt;
                optEl.textContent = opt;
            }
            this.selectEl.appendChild(optEl);
        });
    }
    
    getValue() {
        return this.value;
    }
    
    setValue(val) {
        this.value = val;
        if (this.selectEl) this.selectEl.value = val;
    }
    
    setOptions(options) {
        this.options = options;
        if (this.selectEl) {
            this._renderOptions();
            this.selectEl.value = this.value;
        }
    }
}

