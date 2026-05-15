/**
 * Dropdown - Custom styled dropdown matching subheader/header dropdowns
 * 
 * Replaces native <select> with fully styled dropdown menu.
 * Follows VGA aesthetic: 2F height items, hover color swap, shared borders.
 * 
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class Dropdown extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'dropdown' }, deps);
        
        this.options = options.options ?? []; // [{value, label}] or ['string']
        this.value = options.value ?? (this._getFirstValue());
        this.label = options.label ?? '';
        this.placeholder = options.placeholder ?? 'Select...';
        this.disabled = options.disabled ?? false;
        
        this.onChange = options.onChange ?? (() => {});
        
        this.triggerEl = null;
        this.menuEl = null;
        this.isOpen = false;
        this.selectedIndex = this._findValueIndex(this.value);
        
        // Bind methods
        this._handleDocumentClick = this._handleDocumentClick.bind(this);
        this._handleKeyDown = this._handleKeyDown.bind(this);
        this._handleScroll = this._handleScroll.bind(this);
    }
    
    _getFirstValue() {
        if (this.options.length === 0) return '';
        const first = this.options[0];
        return typeof first === 'object' ? first.value : first;
    }
    
    _findValueIndex(value) {
        return this.options.findIndex(opt => {
            if (opt && typeof opt === 'object' && opt.separator) return false;
            const optValue = typeof opt === 'object' ? opt.value : opt;
            return optValue === value;
        });
    }
    
    _getLabel(opt) {
        if (typeof opt === 'object') {
            return opt.separator ? (opt.label ?? '') : (opt.label ?? opt.value);
        }
        return opt;
    }
    
    _getValue(opt) {
        if (opt && typeof opt === 'object' && opt.separator) return '\u0000__sep\u0000';
        return typeof opt === 'object' ? opt.value : opt;
    }
    
    render() {
        if (this.element) return this.element;
        
        const { F, F2 } = this.getF();
        
        this.element = this.createElement('div', 'dropdown-component component');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: ${F2}px;
            width: 100%;
            position: relative;
        `;
        
        // Label
        if (this.label) {
            const labelEl = this.createElement('label', 'dropdown-label');
            labelEl.textContent = this.label;
            labelEl.style.cssText = `
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: ${F}px;
                color: var(--c-text);
            `;
            this.element.appendChild(labelEl);
        }
        
        // Trigger button (shows current value)
        this.triggerEl = this.createElement('button', 'dropdown-trigger');
        this.triggerEl.type = 'button';
        this.triggerEl.disabled = this.disabled;
        this.triggerEl.style.cssText = `
            width: 100%;
            height: ${F * 2}px;
            padding: 0 ${F}px;
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${F}px;
            text-align: left;
            cursor: ${this.disabled ? 'not-allowed' : 'pointer'};
            box-sizing: border-box;
            display: flex;
            justify-content: space-between;
            align-items: center;
            text-transform: uppercase;
            opacity: ${this.disabled ? '0.5' : '1'};
        `;
        
        // Trigger text
        const triggerText = this.createElement('span', 'dropdown-trigger-text');
        triggerText.textContent = this._getCurrentLabel();
        this.triggerEl.appendChild(triggerText);
        
        // Dropdown arrow
        const arrow = this.createElement('span', 'dropdown-arrow');
        arrow.textContent = '+';
        arrow.style.cssText = `
            font-weight: normal;
        `;
        this.triggerEl.appendChild(arrow);
        
        this.triggerEl.addEventListener('click', () => this.toggle());
        
        // Hover effect on trigger
        if (!this.disabled) {
            this.triggerEl.addEventListener('mouseenter', () => {
                this.triggerEl.style.background = 'var(--c-text)';
                this.triggerEl.style.color = 'var(--c-bg)';
            });
            this.triggerEl.addEventListener('mouseleave', () => {
                if (!this.isOpen) {
                    this.triggerEl.style.background = 'var(--c-bg)';
                    this.triggerEl.style.color = 'var(--c-text)';
                }
            });
        }
        
        this.element.appendChild(this.triggerEl);
        
        // Dropdown menu - appended to body to avoid clipping by scrollable containers
        this.menuEl = this.createElement('div', 'dropdown-menu');
        this.menuEl.style.cssText = `
            position: fixed;
            max-height: ${F * 20}px;
            overflow-y: auto;
            border: 1px solid var(--c-border);
            border-top: none;
            background: var(--c-bg);
            box-sizing: border-box;
            z-index: 10000;
            display: none;
        `;
        
        this._renderOptions(F);
        
        // Append to body to avoid sidebar overflow clipping
        document.body.appendChild(this.menuEl);
        
        return this.element;
    }
    
    _renderOptions(F) {
        if (!this.menuEl) return;
        this.menuEl.innerHTML = '';
        
        this.options.forEach((opt, index) => {
            if (opt && typeof opt === 'object' && opt.separator) {
                const item = this.createElement('div', 'dropdown-item dropdown-item--sep');
                item.textContent = opt.label ?? '————';
                item.style.cssText = `
                    height: ${F * 2 - 1}px;
                    line-height: ${F * 2 - 1}px;
                    padding: 0 ${F}px;
                    border-bottom: 1px solid var(--c-border);
                    background: var(--c-bg);
                    color: var(--c-text);
                    opacity: 0.45;
                    cursor: default;
                    text-transform: uppercase;
                    font-family: 'Atkinson Hyperlegible', monospace;
                    font-size: ${F}px;
                    pointer-events: none;
                    box-sizing: border-box;
                `;
                this.menuEl.appendChild(item);
                return;
            }

            const item = this.createElement('div', 'dropdown-item');
            const value = this._getValue(opt);
            const label = this._getLabel(opt);
            const isSelected = value === this.value;
            
            item.dataset.value = value;
            item.dataset.index = index;
            item.textContent = label;
            item.style.cssText = `
                height: ${F * 2 - 1}px;
                line-height: ${F * 2 - 1}px;
                padding: 0 ${F}px;
                border-bottom: 1px solid var(--c-border);
                background: ${isSelected ? 'var(--c-text)' : 'var(--c-bg)'};
                color: ${isSelected ? 'var(--c-bg)' : 'var(--c-text)'};
                cursor: pointer;
                text-transform: uppercase;
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: ${F}px;
                box-sizing: border-box;
            `;
            
            // Remove border from last item
            if (index === this.options.length - 1) {
                item.style.borderBottom = 'none';
            }
            
            item.addEventListener('click', () => this._select(value, index));
            
            // Hover (only if not selected)
            item.addEventListener('mouseenter', () => {
                item.style.background = 'var(--c-text)';
                item.style.color = 'var(--c-bg)';
            });
            item.addEventListener('mouseleave', () => {
                const isCurrentlySelected = this._getValue(this.options[index]) === this.value;
                item.style.background = isCurrentlySelected ? 'var(--c-text)' : 'var(--c-bg)';
                item.style.color = isCurrentlySelected ? 'var(--c-bg)' : 'var(--c-text)';
            });
            
            this.menuEl.appendChild(item);
        });
    }
    
    _getCurrentLabel() {
        if (this.selectedIndex < 0 || this.selectedIndex >= this.options.length) {
            return this.placeholder;
        }
        return this._getLabel(this.options[this.selectedIndex]);
    }
    
    _select(value, index) {
        if (value === '\u0000__sep\u0000') return;
        this.value = value;
        this.selectedIndex = index;
        
        // Update trigger text
        const textEl = this.triggerEl.querySelector('.dropdown-trigger-text');
        if (textEl) textEl.textContent = this._getCurrentLabel();
        
        // Update item styles
        const { F } = this.getF();
        this._renderOptions(F);
        
        this.close();
        this.onChange(value);
    }
    
    toggle() {
        if (this.disabled) return;
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        if (this.disabled || this.isOpen) return;

        const { F } = this.getF();
        const defaultMaxPx = F * 20;

        this.isOpen = true;

        const viewportPad = Math.max(Math.round(F * 0.5), 8);
        const triggerRect = this.triggerEl.getBoundingClientRect();
        const vh = window.innerHeight;
        const vw = window.innerWidth;

        this.menuEl.style.width = `${triggerRect.width}px`;
        this.menuEl.style.display = 'block';

        const bottomAnchor = triggerRect.bottom;
        let top = bottomAnchor;
        let bottomSpace = vh - bottomAnchor - viewportPad;
        let topSpace = triggerRect.top - viewportPad;

        let maxH = Math.max(viewportPad * 2, Math.min(defaultMaxPx, bottomSpace));
        this.menuEl.style.maxHeight = `${maxH}px`;

        let menuRect = this.menuEl.getBoundingClientRect();

        if (menuRect.bottom > vh - viewportPad) {
            const flipAbove = topSpace >= bottomSpace && topSpace >= viewportPad * 3;
            if (flipAbove) {
                maxH = Math.max(viewportPad * 2, Math.min(defaultMaxPx, topSpace));
                this.menuEl.style.maxHeight = `${maxH}px`;
                menuRect = this.menuEl.getBoundingClientRect();
                top = Math.max(viewportPad, triggerRect.top - menuRect.height);
            } else {
                maxH = Math.max(viewportPad * 2, Math.min(defaultMaxPx, bottomSpace));
                this.menuEl.style.maxHeight = `${maxH}px`;
                top = bottomAnchor;
                menuRect = this.menuEl.getBoundingClientRect();
            }
        }

        top = Math.max(viewportPad, Math.min(top, vh - menuRect.height - viewportPad));

        let left = triggerRect.left;
        if (left + menuRect.width > vw - viewportPad) {
            left = Math.max(viewportPad, vw - menuRect.width - viewportPad);
        }

        this.menuEl.style.left = `${Math.round(left)}px`;
        this.menuEl.style.top = `${Math.round(top)}px`;

        // Keep trigger inverted while open
        this.triggerEl.style.background = 'var(--c-text)';
        this.triggerEl.style.color = 'var(--c-bg)';

        const arrow = this.triggerEl.querySelector('.dropdown-arrow');
        if (arrow) arrow.textContent = '−';

        document.addEventListener('click', this._handleDocumentClick);
        document.addEventListener('keydown', this._handleKeyDown);
        window.addEventListener('scroll', this._handleScroll, true);

        const selectedItem = this.menuEl.querySelector(`[data-index="${this.selectedIndex}"]`);
        if (selectedItem) {
            selectedItem.scrollIntoView({ block: 'nearest' });
        }
    }
    
    close() {
        if (!this.isOpen) return;

        const { F } = this.getF();
        this.menuEl.style.maxHeight = `${F * 20}px`;

        this.isOpen = false;
        this.menuEl.style.display = 'none';

        // Restore trigger colors
        this.triggerEl.style.background = 'var(--c-bg)';
        this.triggerEl.style.color = 'var(--c-text)';
        
        // Update arrow
        const arrow = this.triggerEl.querySelector('.dropdown-arrow');
        if (arrow) arrow.textContent = '+';
        
        // Remove listeners
        document.removeEventListener('click', this._handleDocumentClick);
        document.removeEventListener('keydown', this._handleKeyDown);
        window.removeEventListener('scroll', this._handleScroll, true);
    }
    
    _handleDocumentClick(e) {
        if (!this.element.contains(e.target)) {
            this.close();
        }
    }
    
    _handleScroll(e) {
        // Don't close if scrolling within the dropdown menu itself
        if (this.menuEl && this.menuEl.contains(e.target)) {
            return;
        }
        this.close();
    }
    
    _handleKeyDown(e) {
        if (!this.isOpen) return;
        
        switch (e.key) {
            case 'Escape':
                this.close();
                break;
            case 'ArrowDown':
                e.preventDefault();
                this._navigate(1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this._navigate(-1);
                break;
            case 'Enter':
                e.preventDefault();
                if (this.selectedIndex >= 0) {
                    this._select(this._getValue(this.options[this.selectedIndex]), this.selectedIndex);
                }
                break;
        }
    }
    
    _navigate(delta) {
        const newIndex = Math.max(0, Math.min(this.options.length - 1, this.selectedIndex + delta));
        if (newIndex !== this.selectedIndex) {
            this.selectedIndex = newIndex;
            const { F } = this.getF();
            this._renderOptions(F);
            
            // Scroll into view
            const item = this.menuEl.querySelector(`[data-index="${newIndex}"]`);
            if (item) item.scrollIntoView({ block: 'nearest' });
        }
    }
    
    // Public API
    getValue() {
        return this.value;
    }
    
    setValue(value) {
        const index = this._findValueIndex(value);
        if (index >= 0) {
            this._select(value, index);
        }
    }

    /**
     * Update displayed value without invoking onChange (programmatic sync).
     * @param {string} value
     */
    setValueSilent(value) {
        const index = this._findValueIndex(value);
        if (index < 0) return;
        this.value = value;
        this.selectedIndex = index;
        const textEl = this.triggerEl?.querySelector('.dropdown-trigger-text');
        if (textEl) textEl.textContent = this._getCurrentLabel();
        const { F } = this.getF();
        if (this.menuEl) this._renderOptions(F);
    }
    
    setOptions(options) {
        this.options = options;
        this.selectedIndex = this._findValueIndex(this.value);
        if (this.selectedIndex < 0 && options.length > 0) {
            this.value = this._getValue(options[0]);
            this.selectedIndex = 0;
        }
        
        if (this.menuEl) {
            const { F } = this.getF();
            this._renderOptions(F);
        }
        
        const textEl = this.triggerEl?.querySelector('.dropdown-trigger-text');
        if (textEl) textEl.textContent = this._getCurrentLabel();
    }
    
    destroy() {
        document.removeEventListener('click', this._handleDocumentClick);
        document.removeEventListener('keydown', this._handleKeyDown);
        window.removeEventListener('scroll', this._handleScroll, true);
        // Remove menu from body
        if (this.menuEl && this.menuEl.parentNode) {
            this.menuEl.parentNode.removeChild(this.menuEl);
        }
        super.destroy();
    }
}

