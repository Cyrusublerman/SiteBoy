/**
 * Text - Universal text display component
 * 
 * Variants:
 * - 'heading' — h1-h6
 * - 'body' — paragraph
 * - 'status' — status message with type
 * - 'value' — label + value + unit display
 * 
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class Text extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'text' }, deps);
        
        this.variant = options.variant ?? 'body'; // 'heading' | 'body' | 'status' | 'value'
        this.content = options.content ?? '';
        
        // Heading options
        this.level = options.level ?? 2; // 1-6
        
        // Status options
        this.statusType = options.statusType ?? 'info'; // 'info' | 'success' | 'warning' | 'error'
        
        // Value options
        this.label = options.label ?? '';
        this.value = options.value ?? '';
        this.unit = options.unit ?? '';
        this.precision = options.precision ?? 2;
        
        this.contentEl = null;
        this.valueEl = null;
    }
    
    render() {
        if (this.element) return this.element;
        
        const { F, F2 } = this.getF();
        
        switch (this.variant) {
            case 'heading':
                return this._renderHeading(F, F2);
            case 'status':
                return this._renderStatus(F, F2);
            case 'value':
                return this._renderValue(F, F2);
            default:
                return this._renderBody(F, F2);
        }
    }
    
    _renderHeading(F, F2) {
        const tag = `h${Math.max(1, Math.min(6, this.level))}`;
        this.element = document.createElement(tag);
        this.element.className = 'text text-heading component';
        
        // F-SYSTEM: Heading sizes in clean F multiples
        const sizes = {
            1: F * 2,      // 2F = 28px
            2: F * 1.5,    // 1.5F = 21px
            3: F,          // 1F = 14px (same as body, differentiated by weight)
            4: F,          // 1F = 14px
            5: F,          // 1F = 14px
            6: F           // 1F = 14px
        };
        
        this.element.style.cssText = `
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${sizes[this.level] ?? F}px;
            font-weight: bold;
            color: var(--c-text);
            margin: 0;
            text-transform: uppercase;
        `;
        
        this.element.textContent = this.content;
        return this.element;
    }
    
    _renderBody(F, F2) {
        this.element = this.createElement('p', 'text text-body component');
        this.element.style.cssText = `
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${F}px;
            color: var(--c-text);
            margin: 0;
            line-height: 1.5;
        `;
        
        this.element.textContent = this.content;
        return this.element;
    }
    
    _renderStatus(F, F2) {
        this.element = this.createElement('div', 'text text-status component');
        
        const colors = {
            info: 'var(--c-text)',
            success: 'var(--vga-green, #00AA00)',
            warning: 'var(--vga-yellow, #AAAA00)',
            error: 'var(--vga-red, #AA0000)'
        };
        
        this.element.style.cssText = `
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${F}px;
            color: ${colors[this.statusType] ?? colors.info};
            padding: ${F2}px ${F}px;
            border: 1px solid var(--c-border);
            background: var(--c-bg);
        `;
        
        this.contentEl = this.createElement('span', 'status-content');
        this.contentEl.textContent = this.content;
        this.element.appendChild(this.contentEl);
        
        return this.element;
    }
    
    _renderValue(F, F2) {
        this.element = this.createElement('div', 'text text-value component');
        this.element.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${F}px;
            color: var(--c-text);
            gap: ${F}px;
        `;
        
        if (this.label) {
            const labelEl = this.createElement('span', 'value-label');
            labelEl.textContent = this.label;
            labelEl.style.opacity = '0.7';
            this.element.appendChild(labelEl);
        }
        
        const valueWrapper = this.createElement('span', 'value-wrapper');
        
        this.valueEl = this.createElement('span', 'value-content');
        this.valueEl.textContent = this._formatValue();
        valueWrapper.appendChild(this.valueEl);
        
        if (this.unit) {
            const unitEl = this.createElement('span', 'value-unit');
            unitEl.textContent = this.unit;
            unitEl.style.opacity = '0.7';
            unitEl.style.marginLeft = `${F2}px`;
            valueWrapper.appendChild(unitEl);
        }
        
        this.element.appendChild(valueWrapper);
        
        return this.element;
    }
    
    _formatValue() {
        if (typeof this.value === 'number') {
            if (Number.isInteger(this.value)) {
                return String(this.value);
            }
            return this.value.toFixed(this.precision);
        }
        return String(this.value ?? this.content);
    }
    
    // Public API
    setContent(content) {
        this.content = content;
        if (this.variant === 'status' && this.contentEl) {
            this.contentEl.textContent = content;
        } else if (this.element) {
            this.element.textContent = content;
        }
    }
    
    setValue(value) {
        this.value = value;
        if (this.valueEl) {
            this.valueEl.textContent = this._formatValue();
        } else {
            this.setContent(String(value));
        }
    }
    
    setStatus(type, content) {
        this.statusType = type;
        if (content !== undefined) this.content = content;
        
        if (this.element && this.variant === 'status') {
            const colors = {
                info: 'var(--c-text)',
                success: 'var(--vga-green, #00AA00)',
                warning: 'var(--vga-yellow, #AAAA00)',
                error: 'var(--vga-red, #AA0000)'
            };
            this.element.style.color = colors[type] ?? colors.info;
            if (this.contentEl) this.contentEl.textContent = this.content;
        }
    }
}

