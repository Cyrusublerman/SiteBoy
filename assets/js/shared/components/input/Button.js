/**
 * Button - Universal button and button group component
 * 
 * Modes:
 * - Single button: just text + onClick
 * - Group mode (buttons array provided):
 *   - mode: 'action' — all buttons independent
 *   - mode: 'toggle' — multi-select, buttons stay pressed
 *   - mode: 'radio' — single select, one active at a time
 * 
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class Button extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'button' }, deps);
        
        // Single button mode
        this.text = options.text ?? '';
        this.icon = options.icon ?? '';
        this.title = options.title ?? '';
        this.onClick = options.onClick ?? null;
        this.disabled = options.disabled ?? false;
        
        // Group mode
        this.buttons = options.buttons ?? null; // [{text, value, icon, title, onClick}]
        this.mode = options.mode ?? 'action'; // 'action' | 'toggle' | 'radio'
        this.layout = options.layout ?? 'row'; // 'row' | 'column' | 'grid'
        this.columns = options.columns ?? 3;
        
        // State (toggle/radio)
        this.activeValue = options.activeValue ?? null;
        this.activeValues = options.activeValues ?? [];
        
        // Events (group)
        this.onSelect = options.onSelect ?? (() => {});
        
        // Styling
        this.size = options.size ?? 'm'; // 's' | 'm' | 'l'
        this.fill = options.fill ?? false;
        
        this.buttonElements = [];
    }
    
    render() {
        if (this.element) return this.element;
        
        const { F, F2 } = this.getF();
        
        // Single button or group?
        if (this.buttons && this.buttons.length > 0) {
            return this._renderGroup(F, F2);
        } else {
            return this._renderSingle(F, F2);
        }
    }
    
    _renderSingle(F, F2) {
        this.element = this.createElement('button', 'button component');
        this.element.type = 'button';
        this.element.disabled = this.disabled;
        this.element.title = this.title;
        
        const height = this.size === 's' ? F * 1.5 : this.size === 'l' ? F * 3 : F * 2;
        
        this.element.style.cssText = `
            height: ${height}px;
            padding: 0 ${F}px;
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${F}px;
            cursor: ${this.disabled ? 'not-allowed' : 'pointer'};
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: ${F2}px;
            ${this.fill ? 'width: 100%;' : ''}
            opacity: ${this.disabled ? '0.5' : '1'};
        `;
        
        if (this.icon) {
            const iconEl = this.createElement('span', 'button-icon');
            iconEl.textContent = this.icon;
            this.element.appendChild(iconEl);
        }
        
        if (this.text) {
            const textEl = this.createElement('span', 'button-text');
            textEl.textContent = this.text;
            this.element.appendChild(textEl);
        }
        
        if (this.onClick) {
            this.element.addEventListener('click', () => {
                if (!this.disabled) this.onClick();
            });
        }
        
        this._addHoverEffects(this.element);
        
        return this.element;
    }
    
    _renderGroup(F, F2) {
        this.element = this.createElement('div', 'button-group component');
        
        let layoutStyle = '';
        if (this.layout === 'row') {
            layoutStyle = `display: flex; flex-direction: row; gap: 0;`;
        } else if (this.layout === 'column') {
            layoutStyle = `display: flex; flex-direction: column; gap: 0;`;
        } else if (this.layout === 'grid') {
            layoutStyle = `display: grid; grid-template-columns: repeat(${this.columns}, 1fr); gap: 0;`;
        }
        
        this.element.style.cssText = layoutStyle;
        
        this.buttonElements = [];
        
        this.buttons.forEach((btn, index) => {
            const btnEl = this.createElement('button', 'button-group-item');
            btnEl.type = 'button';
            btnEl.title = btn.title ?? '';
            btnEl.dataset.value = btn.value ?? index;
            
            const height = this.size === 's' ? F * 1.5 : this.size === 'l' ? F * 3 : F * 2;
            const isActive = this._isActive(btn.value ?? index);
            
            // Collapsing borders: default to no gap, add -1px for stacked rows/cols
            let marginTop = '0';
            if (this.layout === 'column' && index > 0) {
                marginTop = '-1px';
            } else if (this.layout === 'grid' && index >= this.columns) {
                marginTop = '-1px';
            }
            
            btnEl.style.cssText = `
                height: ${height}px;
                padding: 0 ${F}px;
                border: 1px solid var(--c-border);
                margin-left: -1px;
                margin-top: ${marginTop};
                background: ${isActive ? 'var(--c-text)' : 'var(--c-bg)'};
                color: ${isActive ? 'var(--c-bg)' : 'var(--c-text)'};
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: ${F}px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: ${F2}px;
            `;
            
            // Fix first item margin
            if (index === 0 || (this.layout === 'grid' && index % this.columns === 0)) {
                btnEl.style.marginLeft = '0';
            }
            if (index === 0 || (this.layout === 'grid' && index % this.columns === 0)) {
                btnEl.style.marginTop = '0';
            }
            
            if (btn.icon) {
                const iconEl = this.createElement('span', 'button-icon');
                iconEl.textContent = btn.icon;
                btnEl.appendChild(iconEl);
            }
            
            if (btn.text) {
                const textEl = this.createElement('span', 'button-text');
                textEl.textContent = btn.text;
                btnEl.appendChild(textEl);
            }
            
            btnEl.addEventListener('click', () => this._handleClick(btn, index, btnEl));
            
            this._addHoverEffects(btnEl, isActive);
            
            this.element.appendChild(btnEl);
            this.buttonElements.push(btnEl);
        });
        
        return this.element;
    }
    
    _isActive(value) {
        if (this.mode === 'radio') {
            return this.activeValue === value;
        } else if (this.mode === 'toggle') {
            return this.activeValues.includes(value);
        }
        return false;
    }
    
    _handleClick(btn, index, btnEl) {
        const value = btn.value ?? index;
        
        if (this.mode === 'action') {
            // Just fire onClick or onSelect
            if (btn.onClick) btn.onClick();
            this.onSelect(value);
        } else if (this.mode === 'radio') {
            this.activeValue = value;
            this._updateActiveStates();
            this.onSelect(value);
        } else if (this.mode === 'toggle') {
            const idx = this.activeValues.indexOf(value);
            if (idx >= 0) {
                this.activeValues.splice(idx, 1);
            } else {
                this.activeValues.push(value);
            }
            this._updateActiveStates();
            this.onSelect(value, this.activeValues.includes(value));
        }
    }
    
    _updateActiveStates() {
        this.buttonElements.forEach((btnEl, i) => {
            const value = this.buttons[i].value ?? i;
            const isActive = this._isActive(value);
            btnEl.style.background = isActive ? 'var(--c-text)' : 'var(--c-bg)';
            btnEl.style.color = isActive ? 'var(--c-bg)' : 'var(--c-text)';
        });
    }
    
    _addHoverEffects(el, skipIfActive = false) {
        el.addEventListener('mouseenter', () => {
            if (skipIfActive && this._isActive(el.dataset.value)) return;
            el.style.background = 'var(--c-text)';
            el.style.color = 'var(--c-bg)';
        });
        el.addEventListener('mouseleave', () => {
            const isActive = this._isActive(el.dataset.value);
            if (!isActive) {
                el.style.background = 'var(--c-bg)';
                el.style.color = 'var(--c-text)';
            }
        });
    }
    
    // Public API
    setActive(value) {
        if (this.mode === 'radio') {
            this.activeValue = value;
            this._updateActiveStates();
        }
    }
    
    setActiveValues(values) {
        if (this.mode === 'toggle') {
            this.activeValues = [...values];
            this._updateActiveStates();
        }
    }
    
    setDisabled(disabled) {
        this.disabled = disabled;
        if (this.element && !this.buttons) {
            this.element.disabled = disabled;
            this.element.style.opacity = disabled ? '0.5' : '1';
            this.element.style.cursor = disabled ? 'not-allowed' : 'pointer';
        }
    }
    
    setText(text) {
        this.text = text;
        const textEl = this.element?.querySelector('.button-text');
        if (textEl) textEl.textContent = text;
    }
}

