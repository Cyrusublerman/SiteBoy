/**
 * ToggleGroup - Checkbox/toggle group component
 * 
 * Modes:
 * - layout: 'list' — vertical checkboxes
 * - layout: 'row' — horizontal toggle buttons
 * - exclusive: true — radio behavior (single select)
 * 
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class ToggleGroup extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'toggle-group' }, deps);
        
        this.items = options.items ?? []; // [{value, label}] or ['string']
        this.layout = options.layout ?? 'list'; // 'list' | 'row' | 'grid'
        this.gridColumns = options.gridColumns ?? 2;
        this.exclusive = options.exclusive ?? false;
        this.label = options.label ?? '';
        
        // State
        this.selectedValues = options.selectedValues ?? [];
        this.selectedValue = options.selectedValue ?? null; // For exclusive mode
        
        this.onChange = options.onChange ?? (() => {});
        
        this.checkboxElements = [];
    }
    
    render() {
        if (this.element) return this.element;
        
        const { F, F2 } = this.getF();
        
        this.element = this.createElement('div', 'toggle-group component');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: ${F2}px;
        `;
        
        if (this.label) {
            const labelEl = this.createElement('div', 'toggle-group-label');
            labelEl.textContent = this.label;
            labelEl.style.cssText = `
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: ${F}px;
                color: var(--c-text);
            `;
            this.element.appendChild(labelEl);
        }
        
        const container = this.createElement('div', 'toggle-group-items');
        if (this.layout === 'row') {
            container.style.cssText = `display: flex; flex-direction: row; gap: ${F}px; flex-wrap: wrap;`;
        } else if (this.layout === 'grid') {
            const cols = Math.max(1, this.gridColumns | 0);
            container.style.cssText = `
                display: grid;
                grid-template-columns: repeat(${cols}, minmax(0, 1fr));
                gap: ${F}px;
            `;
        } else {
            container.style.cssText = `display: flex; flex-direction: column; gap: ${F2}px;`;
        }
        
        this.checkboxElements = [];
        
        this.items.forEach((item, index) => {
            const value = typeof item === 'object' ? item.value : item;
            const label = typeof item === 'object' ? (item.label ?? item.value) : item;
            const isChecked = this.exclusive 
                ? this.selectedValue === value
                : this.selectedValues.includes(value);
            
            const itemEl = this.createElement('label', 'toggle-group-item');
            itemEl.style.cssText = `
                display: flex;
                align-items: center;
                gap: ${F2}px;
                cursor: pointer;
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: ${F}px;
                color: var(--c-text);
                height: ${F * 2}px;
            `;
            
            // Hidden checkbox for form functionality
            const checkbox = this.createElement('input', 'toggle-group-checkbox');
            checkbox.type = this.exclusive ? 'radio' : 'checkbox';
            checkbox.name = this.exclusive ? `toggle-group-${this.id}` : '';
            checkbox.value = value;
            checkbox.checked = isChecked;
            checkbox.style.cssText = `
                position: absolute;
                opacity: 0;
                width: 0;
                height: 0;
            `;
            
            // Custom checkbox visual (VGA style - bordered box with fill)
            const customBox = this.createElement('span', 'toggle-group-custom-box');
            customBox.style.cssText = `
                width: ${F}px;
                height: ${F}px;
                border: 1px solid var(--c-border);
                background: ${isChecked ? 'var(--c-text)' : 'var(--c-bg)'};
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                box-sizing: border-box;
            `;
            
            checkbox.addEventListener('change', (e) => {
                if (this.exclusive) {
                    this.selectedValue = value;
                    // Update all custom boxes
                    this.checkboxElements.forEach((cb, i) => {
                        const box = cb.parentElement.querySelector('.toggle-group-custom-box');
                        const itemVal = typeof this.items[i] === 'object' ? this.items[i].value : this.items[i];
                        box.style.background = itemVal === value ? 'var(--c-text)' : 'var(--c-bg)';
                    });
                    this.onChange(value);
                } else {
                    if (e.target.checked) {
                        if (!this.selectedValues.includes(value)) {
                            this.selectedValues.push(value);
                        }
                        customBox.style.background = 'var(--c-text)';
                    } else {
                        const idx = this.selectedValues.indexOf(value);
                        if (idx >= 0) this.selectedValues.splice(idx, 1);
                        customBox.style.background = 'var(--c-bg)';
                    }
                    this.onChange([...this.selectedValues]);
                }
            });
            
            const labelText = this.createElement('span', 'toggle-group-item-label');
            labelText.textContent = label;
            
            itemEl.appendChild(checkbox);
            itemEl.appendChild(customBox);
            itemEl.appendChild(labelText);
            container.appendChild(itemEl);
            
            this.checkboxElements.push(checkbox);
        });
        
        this.element.appendChild(container);
        
        return this.element;
    }
    
    getValue() {
        return this.exclusive ? this.selectedValue : [...this.selectedValues];
    }
    
    setValue(value) {
        if (this.exclusive) {
            this.selectedValue = value;
            this.checkboxElements.forEach((cb, i) => {
                const itemValue = typeof this.items[i] === 'object' ? this.items[i].value : this.items[i];
                cb.checked = itemValue === value;
            });
        } else {
            this.selectedValues = Array.isArray(value) ? [...value] : [value];
            this.checkboxElements.forEach((cb, i) => {
                const itemValue = typeof this.items[i] === 'object' ? this.items[i].value : this.items[i];
                cb.checked = this.selectedValues.includes(itemValue);
            });
        }
    }
}

