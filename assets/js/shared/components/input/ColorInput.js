/**
 * ColorInput - Color picker component
 * 
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class ColorInput extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'color-input' }, deps);
        
        this.value = options.value ?? '#000000';
        this.label = options.label ?? '';
        this.showHex = options.showHex ?? true;
        this.swatches = options.swatches ?? null;
        
        this.onChange = options.onChange ?? (() => {});
        
        this.colorEl = null;
        this.hexEl = null;
    }
    
    render() {
        if (this.element) return this.element;
        
        const { F, F2 } = this.getF();
        
        this.element = this.createElement('div', 'color-input component');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: ${F2}px;
            width: 100%;
        `;
        
        if (this.label) {
            const labelEl = this.createElement('label', 'color-input-label');
            labelEl.textContent = this.label;
            labelEl.style.cssText = `
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: ${F}px;
                color: var(--c-text);
            `;
            this.element.appendChild(labelEl);
        }
        
        const row = this.createElement('div', 'color-input-row');
        row.style.cssText = `
            display: flex;
            align-items: center;
            gap: ${F2}px;
        `;
        
        // Color picker
        this.colorEl = this.createElement('input', 'color-input-picker');
        this.colorEl.type = 'color';
        this.colorEl.value = this.value;
        this.colorEl.style.cssText = `
            width: ${F * 2}px;
            height: ${F * 2}px;
            padding: 0;
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            cursor: pointer;
        `;
        
        this.colorEl.addEventListener('input', (e) => {
            this.value = e.target.value;
            if (this.hexEl) this.hexEl.value = this.value;
            this.onChange(this.value);
        });
        
        row.appendChild(this.colorEl);
        
        // Hex text input
        if (this.showHex) {
            this.hexEl = this.createElement('input', 'color-input-hex');
            this.hexEl.type = 'text';
            this.hexEl.value = this.value;
            this.hexEl.maxLength = 7;
            this.hexEl.style.cssText = `
                width: ${F * 6}px;
                height: ${F * 2}px;
                padding: 0 ${F2}px;
                border: 1px solid var(--c-border);
                background: var(--c-bg);
                color: var(--c-text);
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: ${F}px;
                text-transform: uppercase;
                box-sizing: border-box;
            `;
            
            this.hexEl.addEventListener('change', (e) => {
                let hex = e.target.value;
                if (!hex.startsWith('#')) hex = '#' + hex;
                if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                    this.value = hex;
                    this.colorEl.value = hex;
                    this.onChange(this.value);
                } else {
                    e.target.value = this.value;
                }
            });
            
            row.appendChild(this.hexEl);
        }
        
        this.element.appendChild(row);
        
        // Swatches
        if (this.swatches && this.swatches.length > 0) {
            const swatchRow = this.createElement('div', 'color-input-swatches');
            swatchRow.style.cssText = `
                display: flex;
                flex-wrap: wrap;
                gap: ${F2}px;
                margin-top: ${F2}px;
            `;
            
            this.swatches.forEach(color => {
                const swatch = this.createElement('div', 'color-input-swatch');
                swatch.style.cssText = `
                    width: ${F}px;
                    height: ${F}px;
                    background: ${color};
                    border: 1px solid var(--c-border);
                    cursor: pointer;
                `;
                
                swatch.addEventListener('click', () => {
                    this.setValue(color);
                    this.onChange(this.value);
                });
                
                swatchRow.appendChild(swatch);
            });
            
            this.element.appendChild(swatchRow);
        }
        
        return this.element;
    }
    
    getValue() {
        return this.value;
    }
    
    setValue(color) {
        this.value = color;
        if (this.colorEl) this.colorEl.value = color;
        if (this.hexEl) this.hexEl.value = color;
    }
}

