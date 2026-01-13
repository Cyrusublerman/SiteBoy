/**
 * Interactive Components - SiteBoy Framework
 * 
 * COMPONENTS OWNED BY THIS FILE:
 * - CollapsibleBase (shared foundation for expand/collapse patterns)
 * - Dropdown (standard dropdown component extending CollapsibleBase)
 * - Menu (navigation menu with keyboard support)
 * - Breadcrumb (breadcrumb navigation)
 * - Button (interactive button component)
 * - Input (form input component)
 * - Select (form select dropdown)
 * - ButtonGroup (grouped button interface)
 * 
 * DO NOT ADD DUPLICATES OF THESE COMPONENTS IN OTHER FILES!
 * This is the SINGLE SOURCE OF TRUTH for all interactive UI components.
 * 
 * USAGE PATTERN:
 * import { Button, Input, Menu } from './interactive.js';
 * const button = new Button({ text: 'Click me' }, deps);
 * 
 * DEPENDENCIES:
 * - foundation.js (BaseComponent)
 * 
 * 📖 PLACEMENT GUIDE: See COMPONENT_PLACEMENT_GUIDE.md for component placement rules
 * 🚨 BEFORE ADDING: Check if component already exists and verify correct category
 */

import { BaseComponent } from './foundation.js';

/**
 * CollapsibleBase - Shared foundation for expand/collapse UI patterns
 * Used by: Dropdown, TOC sections, accordions, etc.
 */
export class CollapsibleBase extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super(options, deps);
        this.isOpen = options.isOpen || false;
        this.items = options.items || [];
        this.onToggle = options.onToggle || null;
        this.onSelect = options.onSelect || null;
        
        // Keyboard navigation state
        this.currentIndex = -1;
        this.focusableItems = [];
    }
    
    /**
     * Toggle open/closed state
     */
    toggle() {
        this.isOpen = !this.isOpen;
        this.updateVisibility();
        
        if (this.onToggle) {
            this.onToggle(this.isOpen);
        }
        
        console.log(`🔄 ${this.constructor.name}: ${this.isOpen ? 'opened' : 'closed'}`);
    }
    
    /**
     * Open the collapsible
     */
    open() {
        if (!this.isOpen) {
            this.isOpen = true;
            this.updateVisibility();
            this.focusFirst();
            
            if (this.onToggle) {
                this.onToggle(true);
            }
        }
    }
    
    /**
     * Close the collapsible
     */
    close() {
        if (this.isOpen) {
            this.isOpen = false;
            this.updateVisibility();
            this.currentIndex = -1;
            
            if (this.onToggle) {
                this.onToggle(false);
            }
        }
    }
    
    /**
     * Handle keyboard navigation (shared logic)
     */
    handleKeydown(event) {
        if (!this.isOpen) return;
        
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.navigateDown();
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.navigateUp();
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                this.selectCurrent();
                break;
            case 'Escape':
                event.preventDefault();
                this.close();
                break;
            case 'Home':
                event.preventDefault();
                this.focusFirst();
                break;
            case 'End':
                event.preventDefault();
                this.focusLast();
                break;
        }
    }
    
    /**
     * Navigate to next item
     */
    navigateDown() {
        if (this.focusableItems.length === 0) return;
        this.currentIndex = (this.currentIndex + 1) % this.focusableItems.length;
        this.focusCurrent();
    }
    
    /**
     * Navigate to previous item
     */
    navigateUp() {
        if (this.focusableItems.length === 0) return;
        this.currentIndex = this.currentIndex <= 0 ? this.focusableItems.length - 1 : this.currentIndex - 1;
        this.focusCurrent();
    }
    
    /**
     * Focus first item
     */
    focusFirst() {
        this.currentIndex = 0;
        this.focusCurrent();
    }
    
    /**
     * Focus last item
     */
    focusLast() {
        this.currentIndex = this.focusableItems.length - 1;
        this.focusCurrent();
    }
    
    /**
     * Focus current item
     */
    focusCurrent() {
        if (this.currentIndex >= 0 && this.currentIndex < this.focusableItems.length) {
            this.focusableItems[this.currentIndex].focus();
        }
    }
    
    /**
     * Select current item
     */
    selectCurrent() {
        if (this.currentIndex >= 0 && this.currentIndex < this.items.length) {
            const item = this.items[this.currentIndex];
            if (this.onSelect) {
                this.onSelect(item, this.currentIndex);
            }
        }
    }
    
    /**
     * Update visibility (should be overridden by subclasses)
     */
    updateVisibility() {
        // Override in subclasses
    }
}

/**
 * Dropdown - Standard dropdown component extending CollapsibleBase
 */
export class Dropdown extends CollapsibleBase {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'dropdown' }, deps);
        this.triggerText = options.triggerText || 'Dropdown';
        this.position = options.position || 'bottom-left'; // bottom-left, bottom-right, top-left, top-right
        this.minWidth = options.minWidth || null;
        
        this.triggerElement = null;
        this.dropdownElement = null;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'dropdown-container');
            this.element.style.position = 'relative';
            this.element.style.display = 'inline-block';
            
            // Create trigger button
            this.triggerElement = this.createElement('button', 'dropdown-trigger');
            this.triggerElement.type = 'button';
            this.triggerElement.setAttribute('aria-haspopup', 'true');
            this.triggerElement.setAttribute('aria-expanded', 'false');
            this.triggerElement.textContent = this.triggerText;
            
            // Create dropdown list
            this.dropdownElement = this.createElement('div', 'dropdown-list');
            this.dropdownElement.setAttribute('role', 'menu');
            this.dropdownElement.style.cssText = `
                position: absolute;
                background: var(--c-bg);
                outline: 1px solid var(--c-border);
                box-sizing: border-box;
                z-index: 1000;
                display: none;
            `;
            
            // Apply Mathematical Foundation sizing
            if (this.deps.MF) {
                const dims = this.deps.MF.calculateComponentDimensions('dropdown');
                this.triggerElement.style.minHeight = dims.height;
                this.dropdownElement.style.maxHeight = dims.maxHeight;
                this.dropdownElement.style.overflowY = 'auto';
                
                if (this.minWidth) {
                    this.dropdownElement.style.minWidth = this.minWidth;
                } else {
                    this.dropdownElement.style.minWidth = dims.width;
                }
            }
            
            // Render items
            this.renderItems();
            
            // Event listeners
            this.triggerElement.addEventListener('click', () => this.toggle());
            this.triggerElement.addEventListener('keydown', (e) => this.handleTriggerKeydown(e));
            this.dropdownElement.addEventListener('keydown', (e) => this.handleKeydown(e));
            
            // Close on outside click
            document.addEventListener('click', (e) => this.handleOutsideClick(e));
            
            this.element.appendChild(this.triggerElement);
            this.element.appendChild(this.dropdownElement);
        }
        return this.element;
    }
    
    renderItems() {
        if (!this.dropdownElement) return;
        
        this.dropdownElement.innerHTML = '';
        this.focusableItems = [];
        
        this.items.forEach((item, index) => {
            const itemElement = this.createElement('div', 'dropdown-item');
            itemElement.setAttribute('role', 'menuitem');
            itemElement.setAttribute('tabindex', '0');
            itemElement.textContent = item.label || item.title || item.text || item;
            
            // Height and layout handled by CSS .dropdown-item rule
            itemElement.style.cssText = `
                background: var(--c-bg);
                color: var(--c-text);
            `;
            
            // Hover and focus styles (consistent with framework standard)
            itemElement.addEventListener('mouseenter', () => {
                itemElement.style.background = 'var(--c-text)';
                itemElement.style.color = 'var(--c-bg)';
                this.currentIndex = index;
            });
            
            itemElement.addEventListener('mouseleave', () => {
                itemElement.style.background = 'var(--c-bg)';
                itemElement.style.color = 'var(--c-text)';
            });
            
            itemElement.addEventListener('focus', () => {
                itemElement.style.background = 'var(--c-text)';
                itemElement.style.color = 'var(--c-bg)';
                this.currentIndex = index;
            });
            
            itemElement.addEventListener('blur', () => {
                itemElement.style.background = 'var(--c-bg)';
                itemElement.style.color = 'var(--c-text)';
            });
            
            itemElement.addEventListener('click', () => {
                if (this.onSelect) {
                    this.onSelect(item);
                }
                this.close();
            });
            
            this.dropdownElement.appendChild(itemElement);
            this.focusableItems.push(itemElement);
        });
        
        // Remove border from last item
        if (this.focusableItems.length > 0) {
            const lastItem = this.focusableItems[this.focusableItems.length - 1];
            lastItem.style.borderBottom = 'none';
        }
    }
    
    updateVisibility() {
        if (!this.dropdownElement || !this.triggerElement) return;
        
        if (this.isOpen) {
            this.dropdownElement.style.display = 'block';
            this.triggerElement.setAttribute('aria-expanded', 'true');
            this.positionDropdown();
        } else {
            this.dropdownElement.style.display = 'none';
            this.triggerElement.setAttribute('aria-expanded', 'false');
        }
    }
    
    positionDropdown() {
        if (!this.dropdownElement || !this.triggerElement) return;
        
        const triggerRect = this.triggerElement.getBoundingClientRect();
        const dropdownHeight = this.dropdownElement.offsetHeight;
        const viewportHeight = window.innerHeight;
        
        // Reset positioning
        this.dropdownElement.style.top = '';
        this.dropdownElement.style.bottom = '';
        this.dropdownElement.style.left = '';
        this.dropdownElement.style.right = '';
        
        // Position based on available space and preference
        const spaceBelow = viewportHeight - triggerRect.bottom;
        const spaceAbove = triggerRect.top;
        
        if (this.position.includes('bottom') && spaceBelow >= dropdownHeight) {
            this.dropdownElement.style.top = '100%';
        } else if (this.position.includes('top') && spaceAbove >= dropdownHeight) {
            this.dropdownElement.style.bottom = '100%';
        } else if (spaceBelow >= spaceAbove) {
            this.dropdownElement.style.top = '100%';
        } else {
            this.dropdownElement.style.bottom = '100%';
        }
        
        // Horizontal positioning
        if (this.position.includes('left')) {
            this.dropdownElement.style.left = '0';
        } else {
            this.dropdownElement.style.right = '0';
        }
    }
    
    handleTriggerKeydown(event) {
        switch (event.key) {
            case 'ArrowDown':
            case 'Enter':
            case ' ':
                event.preventDefault();
                this.open();
                break;
            case 'Escape':
                event.preventDefault();
                this.close();
                break;
        }
    }
    
    handleOutsideClick(event) {
        if (this.isOpen && this.element && !this.element.contains(event.target)) {
            this.close();
        }
    }
    
    updateItems(newItems) {
        this.items = newItems;
        this.renderItems();
    }
}

/**
 * Menu - Navigation menu component with keyboard support
 */
export class Menu extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'menu' }, deps);
        this.items = options.items || [];
        this.current = options.current || null;
        this.onSelect = options.onSelect || null;
        this.isOpen = false;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('nav', 'menu');
            this.element.setAttribute('role', 'menu');
            
            const menuList = this.createElement('ul', 'menu-list');
            menuList.setAttribute('role', 'menubar');
            
            this.items.forEach((item, index) => {
                const menuItem = this.createElement('li', 'menu-item');
                menuItem.setAttribute('role', 'menuitem');
                menuItem.setAttribute('tabindex', '0');
                menuItem.textContent = item.label || item.text || item;
                
                if (this.current === item.path || this.current === item) {
                    menuItem.classList.add('current');
                    menuItem.setAttribute('aria-current', 'page');
                }
                
                if (this.onSelect) {
                    menuItem.addEventListener('click', () => this.onSelect(item, index));
                    menuItem.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            this.onSelect(item, index);
                        }
                    });
                }
                
                menuList.appendChild(menuItem);
            });
            
            this.element.appendChild(menuList);
        }
        return this.element;
    }
}

/**
 * Breadcrumb - Breadcrumb navigation component
 */
export class Breadcrumb extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'breadcrumb' }, deps);
        this.items = options.items || [];
        this.current = options.current || null;
        this.onSelect = options.onSelect || null;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('nav', 'breadcrumb');
            this.element.setAttribute('aria-label', 'Breadcrumb');
            
            const breadcrumbList = this.createElement('ol', 'breadcrumb-list');
            
            this.items.forEach((item, index) => {
                const breadcrumbItem = this.createElement('li', 'breadcrumb-item');
                
                const isLast = index === this.items.length - 1;
                const isCurrent = this.current === item.path || this.current === item;
                
                if (isLast || isCurrent) {
                    breadcrumbItem.textContent = item.label || item.text || item;
                    breadcrumbItem.setAttribute('aria-current', 'page');
                } else {
                    const link = this.createElement('a', 'breadcrumb-link');
                    link.href = item.path || '#';
                    link.textContent = item.label || item.text || item;
                    
                    if (this.onSelect) {
                        link.addEventListener('click', (e) => {
                            e.preventDefault();
                            this.onSelect(item, index);
                        });
                    }
                    
                    breadcrumbItem.appendChild(link);
                }
                
                breadcrumbList.appendChild(breadcrumbItem);
            });
            
            this.element.appendChild(breadcrumbList);
        }
        return this.element;
    }
}

/**
 * Button - Interactive button component
 */
export class Button extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'button' }, deps);
        this.text = options.text || 'Button';
        this.disabled = options.disabled || false;
        this.type = options.type || 'button';
        this.onClick = options.onClick || null;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('button', 'btn component');
            this.element.type = this.type;
            this.element.textContent = this.text;
            
            if (this.disabled) {
                this.element.disabled = true;
            }
            
            if (this.onClick) {
                this.element.addEventListener('click', this.onClick);
            }
            
            // Keyboard support
            this.element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.element.click();
                }
            });
        }
        return this.element;
    }
    
    setText(text) {
        this.text = text;
        if (this.element) {
            this.element.textContent = text;
        }
    }
    
    setDisabled(disabled) {
        this.disabled = disabled;
        if (this.element) {
            this.element.disabled = disabled;
        }
    }
}

/**
 * Input - Form input component
 */
export class Input extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'input' }, deps);
        this.name = options.name || '';
        this.value = options.value || '';
        this.placeholder = options.placeholder || '';
        this.type = options.type || 'text';
        this.onChange = options.onChange || null;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('input', 'input component');
            this.element.type = this.type;
            this.element.name = this.name;
            this.element.value = this.value;
            this.element.placeholder = this.placeholder;
            
            if (this.onChange) {
                this.element.addEventListener('input', (e) => {
                    this.value = e.target.value;
                    this.onChange(this.value, e);
                });
            }
        }
        return this.element;
    }
    
    getValue() {
        return this.element ? this.element.value : this.value;
    }
    
    setValue(value) {
        this.value = value;
        if (this.element) {
            this.element.value = value;
        }
    }
}

/**
 * Select - Form select dropdown component
 */
export class Select extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'select' }, deps);
        this.name = options.name || '';
        this.options_list = options.options || [];
        this.value = options.value || '';
        this.onChange = options.onChange || null;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('select', 'select component');
            this.element.name = this.name;
            
            this.options_list.forEach(option => {
                const optionElement = this.createElement('option', 'select-option');
                optionElement.value = option.value || option;
                optionElement.textContent = option.label || option.text || option;
                
                if (this.value === optionElement.value) {
                    optionElement.selected = true;
                }
                
                this.element.appendChild(optionElement);
            });
            
            if (this.onChange) {
                this.element.addEventListener('change', (e) => {
                    this.value = e.target.value;
                    this.onChange(this.value, e);
                });
            }
        }
        return this.element;
    }
    
    getValue() {
        return this.element ? this.element.value : this.value;
    }
    
    setValue(value) {
        this.value = value;
        if (this.element) {
            this.element.value = value;
        }
    }
}

/**
 * NumericInput - Enhanced numeric input with validation
 */
export class NumericInput extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'numeric-input' }, deps);
        this.value = options.value || 0;
        this.min = options.min;
        this.max = options.max;
        this.step = options.step || 1;
        this.label = options.label || '';
        this.onChange = options.onChange || (() => {});
        this.precision = options.precision || 3;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'numeric-input component');
            
            if (this.label) {
                const label = this.createElement('label', 'numeric-input-label');
                label.textContent = this.label;
                label.style.cssText = `
                    display: block;
                    margin-bottom: calc(var(--f) * 0.5);
                    font-size: calc(var(--f) * 0.8);
                    font-family: 'Atkinson Hyperlegible', monospace;
                    color: var(--c-text);
                `;
                this.element.appendChild(label);
            }
            
            const input = this.createElement('input', 'numeric-input-field');
            input.type = 'number';
            input.value = this.value;
            if (this.min !== undefined) input.min = this.min;
            if (this.max !== undefined) input.max = this.max;
            input.step = this.step;
            
            input.style.cssText = `
                width: 100%;
                padding: calc(var(--f) * 0.5) calc(var(--f) * 0.75);
                border: 1px solid var(--c-border);
                background: var(--c-bg);
                color: var(--c-text);
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: calc(var(--f) * 0.8);
                box-sizing: border-box;
            `;
            
            input.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value)) {
                    this.value = value;
                    this.onChange(value, e);
                }
            });
            
            this.element.appendChild(input);
            this.inputElement = input;
        }
        return this.element;
    }
    
    setValue(value) {
        this.value = value;
        if (this.inputElement) {
            this.inputElement.value = value.toFixed(this.precision);
        }
    }
}

/**
 * ProgressBar - Progress indicator component
 */
export class ProgressBar extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'progress' }, deps);
        this.value = Math.max(0, Math.min(100, options.value || 0));
        this.max = options.max || 100;
        // Support both showText and showPercent for compatibility
        this.showText = options.showText !== false || options.showPercent === true;
        this.size = options.size || 'm'; // s, m, l
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', `progress-bar progress-${this.size}`);
            
            const track = this.createElement('div', 'progress-track');
            track.style.cssText = `
                width: 100%;
                height: 20px;
                background: var(--c-bg);
                border: 1px solid var(--c-border);
                position: relative;
                overflow: hidden;
            `;
            
            const fill = this.createElement('div', 'progress-fill');
            fill.style.cssText = `
                width: ${this.value}%;
                height: 100%;
                background: var(--c-accent);
                transition: width 0.3s ease;
            `;
            
            track.appendChild(fill);
            this.element.appendChild(track);
            
            let textElement = null;
            if (this.showText) {
                textElement = this.createElement('div', 'progress-text');
                textElement.textContent = `${this.value}%`;
                textElement.style.cssText = `
                    text-align: center;
                    font-size: 12px;
                    margin-top: 4px;
                `;
                this.element.appendChild(textElement);
            }
            
            this.fillElement = fill;
            this.textElement = textElement;
        }
        return this.element;
    }
    
    setValue(value) {
        this.value = Math.max(0, Math.min(100, value));
        if (this.fillElement) {
            this.fillElement.style.width = `${this.value}%`;
        }
        if (this.textElement) {
            this.textElement.textContent = `${this.value}%`;
        }
    }
}

/**
 * ButtonGroup - Grouped button interface component
 */
export class ButtonGroup extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'button-group' }, deps);
        this.buttons = options.buttons || [];
        this.buttonInstances = [];
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'button-group component');
            
            this.buttons.forEach((buttonConfig, index) => {
                const buttonEl = this.createElement('button', 'btn group-button');
                buttonEl.textContent = buttonConfig.text || 'Button';
                buttonEl.type = 'button';
                
                if (buttonConfig.onClick) {
                    buttonEl.addEventListener('click', buttonConfig.onClick);
                }
                
                if (buttonConfig.disabled) {
                    buttonEl.disabled = true;
                }
                
                this.element.appendChild(buttonEl);
            });
        }
        return this.element;
    }
}

/**
 * Lightbox - Minimal overlay for zooming images on click
 */
export class Lightbox extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'lightbox' }, deps);
        this.src = options.src || '';
        this.onClose = options.onClose || null;
        this.overlay = null;
        this.imgEl = null;
        this.closeBtn = null;
    }
    
    render() {
        if (!this.element) {
            // Container is not attached; overlay attaches to document.body
            this.element = this.createElement('div', 'lightbox component');
        }
        return this.element;
    }
    
    open(src) {
        this.src = src || this.src;
        if (!this.overlay) {
            this.overlay = this.createElement('div', 'lightbox-overlay');
            const inner = this.createElement('div', 'lightbox-inner');
            this.imgEl = this.createElement('img', 'lightbox-image');
            this.imgEl.src = this.src;
            this.imgEl.alt = '';
            this.closeBtn = this.createElement('button', 'lightbox-close');
            this.closeBtn.type = 'button';
            this.closeBtn.textContent = 'X';
            
            // Close interactions
            this.closeBtn.addEventListener('click', () => this.close());
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) this.close();
            });
            document.addEventListener('keydown', this._escHandler = (e) => {
                if (e.key === 'Escape') this.close();
            });
            
            inner.appendChild(this.imgEl);
            inner.appendChild(this.closeBtn);
            this.overlay.appendChild(inner);
        }
        // Attach using BaseComponent helper
        this.attachToBody(this.overlay);
        this.overlay.style.display = 'flex';
    }
    
    close() {
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
        if (this._escHandler) {
            document.removeEventListener('keydown', this._escHandler);
            this._escHandler = null;
        }
        if (this.onClose) this.onClose();
    }
    
    destroy() {
        this.close();
        this.overlay = null;
        this.imgEl = null;
        this.closeBtn = null;
        super.destroy();
    }
}
/**
 * CollapsibleSection - A self-contained collapsible section with a header and content area.
 */
export class CollapsibleSection extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'collapsible-section' }, deps);
        this.title = this.options.title || 'Section';
        this.defaultOpen = this.options.defaultOpen || false; // Use option or default to collapsed
        this.isFirst = this.options.isFirst || false;
        this.contentLoader = this.options.contentLoader; // An async function that returns a DOM element
        // Show header title by default; allow opt-in hide via hideHeaderTitle: true
        this.hideHeaderTitle = this.options.hideHeaderTitle === true;
        // Compute persistent storage key with version (v2 for new defaultOpen behavior)
        const baseKey = this.options.storageKey || this.options.id || this.title || 'section';
        const slug = String(baseKey).toLowerCase().replace(/\s+/g, '-');
        this.storageKey = `sb:collapsible:v2:${window.location.pathname}:${slug}`;
        // Load persisted state; use defaultOpen if no saved state
        try {
            const saved = window.localStorage.getItem(this.storageKey);
            this.isOpen = saved === null ? this.defaultOpen : saved === '1';
        } catch (e) {
            this.isOpen = this.defaultOpen;
        }
        this.contentLoaded = false;
        this.componentInstances = []; // To track any sub-components if needed
        this.F = this.deps.MF ? this.deps.MF.F : 12;
    }

    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'collapsible-section');
            this.applyStyles(this.element, {
                'border-left': '1px solid var(--c-border)',
                'border-right': '1px solid var(--c-border)',
                'border-bottom': '1px solid var(--c-border)',
                'background': 'var(--c-bg)',
            });

            if (this.isFirst) {
                this.element.style.borderTop = '1px solid var(--c-border)';
            }

            this._createHeader();
            this._createContentArea();
            this._attachHeaderListener();

            if (this.isOpen) {
                this.open();
            }
        }
        return this.element;
    }

    _createHeader() {
        this.header = this.createElement('div', 'collapsible-header');
        this.applyStyles(this.header, {
            'padding': `${this.F}px`,
            'cursor': 'pointer',
            'display': 'flex',
            'justify-content': 'space-between',
            'align-items': 'center',
            'border-bottom': this.isOpen ? '1px solid var(--c-border)' : 'none',
        });

        if (!this.hideHeaderTitle) {
            const title = this.createElement('span', 'header-title');
            title.textContent = this.title;
            this.applyStyles(title, {
                'font-family': '"Atkinson Hyperlegible", monospace',
                'font-size': `${this.F}px`,
                'font-weight': 'normal',
                'text-transform': 'uppercase',
            });
            this.header.appendChild(title);
        }

        this.indicator = this.createElement('span', 'header-indicator');
        this.indicator.textContent = this.isOpen ? '−' : '+';
        this.applyStyles(this.indicator, {
            'font-family': '"Atkinson Hyperlegible", monospace',
            'font-size': `${this.F}px`,
            'width': `${this.F * 2}px`,
            'text-align': 'center',
        });
        this.header.appendChild(this.indicator);
        this.element.appendChild(this.header);
    }

    _createContentArea() {
        this.content = this.createElement('div', 'collapsible-content');
        this.applyStyles(this.content, {
            'padding': `${this.F}px`,
            'display': this.isOpen ? 'block' : 'none',
        });

        if (this.contentLoader) {
            const loadingText = this.createElement('div', 'loading-text');
            loadingText.textContent = 'Loading...';
            this.applyStyles(loadingText, {
                'color': 'var(--c-text)',
                'font-style': 'italic',
            });
            this.content.appendChild(loadingText);
        }

        this.element.appendChild(this.content);
    }

    async _loadContentAsync() {
        if (!this.contentLoader || this.contentLoaded) return;
        this.content.innerHTML = ''; // Clear loading text

        try {
            const contentElement = await this.contentLoader();
            if (contentElement instanceof HTMLElement) {
                this.content.appendChild(contentElement);
                this._executeScripts(contentElement);
            } else {
                throw new Error('contentLoader did not return a valid HTML element.');
            }
        } catch (error) {
            console.error('Error loading content via contentLoader:', error);
            this.content.innerHTML = `<div style="color: var(--vga-red);"><strong>Error:</strong> ${error.message}</div>`;
        } finally {
            this.contentLoaded = true;
        }
    }

    async toggle() {
        this.isOpen = !this.isOpen;
        this.updateVisibility();
        if (this.isOpen && !this.contentLoaded) {
            await this._loadContentAsync();
        }
    }

    async open() {
        this.isOpen = true;
        this.updateVisibility();
        if (!this.contentLoaded) {
            await this._loadContentAsync();
        }
    }
    
    close() {
        this.isOpen = false;
        this.updateVisibility();
    }

    updateVisibility() {
        this.content.style.display = this.isOpen ? 'block' : 'none';
        this.indicator.textContent = this.isOpen ? '−' : '+';
        this.header.style.borderBottom = this.isOpen ? '1px solid var(--c-border)' : 'none';
        // Persist state
        try {
            window.localStorage.setItem(this.storageKey, this.isOpen ? '1' : '0');
        } catch (e) {}
    }

    _attachHeaderListener() {
        this.header.addEventListener('click', () => this.toggle());
    }

    _executeScripts(element) {
        const scripts = Array.from(element.querySelectorAll('script'));
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            if (oldScript.innerHTML) newScript.innerHTML = oldScript.innerHTML;
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
    }

    destroy() {
        this.componentInstances.forEach(instance => instance.destroy && instance.destroy());
        this.componentInstances = [];
        super.destroy();
    }
}

/**
 * Carousel - Minimalist image carousel with VGA aesthetic
 * Full-width image display with prev/next controls below
 */
export class Carousel extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'carousel' }, deps);
        this.images = options.images || []; // Array of { src, caption, alt }
        this.currentIndex = 0;
        this.enableZoom = options.enableZoom !== false; // Default true
        this.F = this.deps.MF ? this.deps.MF.F : 12;
    }

    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'carousel');
            
            // Image container - full width
            this.imageContainer = this.createElement('div', 'carousel-image-container');
            this.element.appendChild(this.imageContainer);
            
            // Controls container - split into two equal parts
            this.controlsContainer = this.createElement('div', 'carousel-controls');
            
            // Left arrow button
            this.prevButton = this.createElement('button', 'carousel-button carousel-button-prev');
            this.prevButton.textContent = '<';
            this.prevButton.type = 'button';
            this.prevButton.addEventListener('click', () => this.prev());
            
            // Right arrow button
            this.nextButton = this.createElement('button', 'carousel-button carousel-button-next');
            this.nextButton.textContent = '>';
            this.nextButton.type = 'button';
            this.nextButton.addEventListener('click', () => this.next());
            
            this.controlsContainer.appendChild(this.prevButton);
            this.controlsContainer.appendChild(this.nextButton);
            this.element.appendChild(this.controlsContainer);
            
            // Render initial image
            this.renderImage();
            
            // Keyboard navigation
            this._keyHandler = (e) => {
                if (e.key === 'ArrowLeft') this.prev();
                if (e.key === 'ArrowRight') this.next();
            };
            document.addEventListener('keydown', this._keyHandler);
        }
        return this.element;
    }
    
    renderImage() {
        if (this.images.length === 0) {
            this.imageContainer.innerHTML = '<p style="padding: var(--f); text-align: center;">No images available</p>';
            return;
        }
        
        const currentImage = this.images[this.currentIndex];
        this.imageContainer.innerHTML = '';
        
        // Create image element
        const img = this.createElement('img', 'carousel-image');
        img.src = currentImage.src;
        img.alt = currentImage.alt || currentImage.caption || `Image ${this.currentIndex + 1}`;
        
        // Add zoom capability
        if (this.enableZoom && window.ComponentLibrary && window.ComponentLibrary.Lightbox) {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', () => {
                const lb = new window.ComponentLibrary.Lightbox({ src: currentImage.src }, this.deps);
                lb.open(currentImage.src);
            });
        }
        
        this.imageContainer.appendChild(img);
        
        // Add caption if exists
        if (currentImage.caption) {
            const caption = this.createElement('div', 'carousel-caption');
            caption.textContent = currentImage.caption;
            this.imageContainer.appendChild(caption);
        }
        
        // Update button states
        this.updateButtonStates();
    }
    
    updateButtonStates() {
        // Disable prev button on first image
        if (this.currentIndex === 0) {
            this.prevButton.disabled = true;
            this.prevButton.style.opacity = '0.3';
        } else {
            this.prevButton.disabled = false;
            this.prevButton.style.opacity = '1';
        }
        
        // Disable next button on last image
        if (this.currentIndex === this.images.length - 1) {
            this.nextButton.disabled = true;
            this.nextButton.style.opacity = '0.3';
        } else {
            this.nextButton.disabled = false;
            this.nextButton.style.opacity = '1';
        }
    }
    
    next() {
        if (this.currentIndex < this.images.length - 1) {
            this.currentIndex++;
            this.renderImage();
        }
    }
    
    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.renderImage();
        }
    }
    
    destroy() {
        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
            this._keyHandler = null;
        }
        super.destroy();
    }
}

/**
 * CheckpointList - Draggable, reorderable list of saved states/checkpoints
 * Used by: wave-interference, lissajous, any tool with state saving
 * 
 * Features:
 * - Save/load checkpoints (parameter snapshots)
 * - Rename checkpoints inline
 * - Set duration per checkpoint
 * - Drag-and-drop reordering
 * - Delete/duplicate checkpoints
 * - Empty state handling
 */
export class CheckpointList extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'checkpoint-list' }, deps);
        this.items = options.items || [];
        this.onLoad = options.onLoad || null;
        this.onDelete = options.onDelete || null;
        this.onDuplicate = options.onDuplicate || null;
        this.onReorder = options.onReorder || null;
        this.onRename = options.onRename || null;
        this.onDurationChange = options.onDurationChange || null;
        this.emptyMessage = options.emptyMessage || 'No checkpoints saved';
        this.maxHeight = options.maxHeight || '250px';
        
        // Drag state
        this._draggedIndex = null;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'checkpoint-list');
        }
        this._renderItems();
        return this.element;
    }
    
    /**
     * Update items and re-render
     */
    setItems(items) {
        this.items = items || [];
        this._renderItems();
    }
    
    /**
     * Render all checkpoint items
     */
    _renderItems() {
        // Clear existing content
        this.element.innerHTML = '';
        
        if (this.items.length === 0) {
            const empty = this.createElement('div', 'checkpoint-empty');
            empty.textContent = this.emptyMessage;
            this.element.appendChild(empty);
            return;
        }
        
        this.items.forEach((item, index) => {
            const itemEl = this._createItemElement(item, index);
            this.element.appendChild(itemEl);
        });
    }
    
    /**
     * Create a single checkpoint item element
     */
    _createItemElement(item, index) {
        const itemEl = this.createElement('div', 'checkpoint-item');
        itemEl.draggable = true;
        itemEl.dataset.index = index;
        
        // Drag handle
        const handle = this.createElement('span', 'checkpoint-handle');
        handle.textContent = '⋮⋮';
        handle.title = 'Drag to reorder';
        
        // Name input
        const nameInput = this.createElement('input', 'checkpoint-name');
        nameInput.type = 'text';
        nameInput.value = item.name || `State ${index + 1}`;
        nameInput.addEventListener('change', () => {
            if (this.onRename) {
                this.onRename(index, nameInput.value);
            }
        });
        nameInput.addEventListener('click', (e) => e.stopPropagation());
        
        // Duration input
        const durInput = this.createElement('input', 'checkpoint-duration');
        durInput.type = 'number';
        durInput.value = item.duration || 3;
        durInput.min = 0.5;
        durInput.max = 60;
        durInput.step = 0.5;
        durInput.title = 'Duration (seconds)';
        durInput.addEventListener('change', () => {
            if (this.onDurationChange) {
                this.onDurationChange(index, parseFloat(durInput.value) || 3);
            }
        });
        durInput.addEventListener('click', (e) => e.stopPropagation());
        
        // Load button
        const loadBtn = this.createElement('button', 'checkpoint-btn checkpoint-load');
        loadBtn.textContent = '▶';
        loadBtn.title = 'Load checkpoint';
        loadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.onLoad) this.onLoad(index);
        });
        
        // Duplicate button
        const dupBtn = this.createElement('button', 'checkpoint-btn checkpoint-duplicate');
        dupBtn.textContent = '⎘';
        dupBtn.title = 'Duplicate';
        dupBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.onDuplicate) this.onDuplicate(index);
        });
        
        // Delete button
        const delBtn = this.createElement('button', 'checkpoint-btn checkpoint-delete');
        delBtn.textContent = '×';
        delBtn.title = 'Delete';
        delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.onDelete) this.onDelete(index);
        });
        
        // Assemble
        itemEl.appendChild(handle);
        itemEl.appendChild(nameInput);
        itemEl.appendChild(durInput);
        itemEl.appendChild(loadBtn);
        itemEl.appendChild(dupBtn);
        itemEl.appendChild(delBtn);
        
        // Drag events
        itemEl.addEventListener('dragstart', (e) => this._onDragStart(e, index));
        itemEl.addEventListener('dragend', (e) => this._onDragEnd(e));
        itemEl.addEventListener('dragover', (e) => this._onDragOver(e, index));
        itemEl.addEventListener('drop', (e) => this._onDrop(e, index));
        
        return itemEl;
    }
    
    _onDragStart(e, index) {
        this._draggedIndex = index;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    }
    
    _onDragEnd(e) {
        e.target.classList.remove('dragging');
        this._draggedIndex = null;
    }
    
    _onDragOver(e, index) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }
    
    _onDrop(e, dropIndex) {
        e.preventDefault();
        if (this._draggedIndex !== null && this._draggedIndex !== dropIndex) {
            if (this.onReorder) {
                this.onReorder(this._draggedIndex, dropIndex);
            }
        }
    }
    
    destroy() {
        this._draggedIndex = null;
        super.destroy();
    }
}

/**
 * Sequencer - Site-wide animation sequencer component
 * 
 * Creates a timeline of checkpoints with configurable transitions.
 * Checkpoints hold parameter states; transitions interpolate between them.
 * 
 * Structure:
 * [Checkpoint 1] → [Transition] → [Checkpoint 2] → [Transition] → [Checkpoint 3] → ...
 * 
 * Each Checkpoint has:
 * - grab handle (drag reorder)
 * - name (editable)
 * - hold frames (how long to stay before transition)
 * - load button (apply params)
 * - duplicate button
 * - delete button
 * 
 * Each Transition has:
 * - frame count (interpolation duration)
 * - mode: 'all' (interpolate all at once) or 'sequential' (one param at a time)
 * - type: 'blend' (linear interpolation) or 'step' (jump at end)
 * 
 * Callbacks:
 * - onSave(params): called when user clicks save, should return params object
 * - onLoad(index, params): apply checkpoint params to tool
 * - onPlay(sequenceData): start playing the sequence
 * - onStop(): stop sequence playback
 * - onTotalFramesChange(frames): fired when total frames changes
 */
export class Sequencer extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'sequencer' }, deps);
        
        // Sequence data: alternating checkpoints and transitions
        // checkpoints[i] → transitions[i] → checkpoints[i+1]
        this.checkpoints = options.checkpoints || [];
        this.transitions = options.transitions || [];
        
        // Callbacks
        this.onSave = options.onSave || null;
        this.onLoad = options.onLoad || null;
        this.onDelete = options.onDelete || null;
        this.onDuplicate = options.onDuplicate || null;
        this.onPlay = options.onPlay || null;
        this.onStop = options.onStop || null;
        this.onTotalFramesChange = options.onTotalFramesChange || null;
        this.onSequenceChange = options.onSequenceChange || null;
        
        // Default transition settings
        this.defaultTransitionFrames = options.defaultTransitionFrames || 60;
        this.defaultHoldFrames = options.defaultHoldFrames || 60;
        
        // Playback state
        this.isPlaying = false;
        this.loop = options.loop !== false;
        
        // Drag state
        this._draggedIndex = null;
        this._draggedType = null; // 'checkpoint' or 'transition'
        
        // References
        this._listEl = null;
        this._controlsEl = null;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'sequencer');
            
            // Controls bar
            this._controlsEl = this.createElement('div', 'sequencer-controls');
            this._renderControls();
            this.element.appendChild(this._controlsEl);
            
            // Sequence list
            this._listEl = this.createElement('div', 'sequencer-list');
            this._renderSequence();
            this.element.appendChild(this._listEl);
            
            // Total frames display
            this._totalEl = this.createElement('div', 'sequencer-total');
            this._updateTotal();
            this.element.appendChild(this._totalEl);
        }
        return this.element;
    }
    
    /**
     * Render control buttons
     */
    _renderControls() {
        this._controlsEl.innerHTML = '';
        
        // Save checkpoint button
        const saveBtn = this.createElement('button', 'sequencer-btn sequencer-save');
        saveBtn.textContent = '+ SAVE STATE';
        saveBtn.title = 'Save current parameters as checkpoint';
        saveBtn.addEventListener('click', () => this._handleSave());
        
        // Play/Stop button
        const playBtn = this.createElement('button', 'sequencer-btn sequencer-play');
        playBtn.textContent = this.isPlaying ? '■ STOP' : '▶ PLAY';
        playBtn.addEventListener('click', () => this._togglePlay());
        this._playBtn = playBtn;
        
        // Loop toggle
        const loopLabel = this.createElement('label', 'sequencer-loop-label');
        const loopCheck = this.createElement('input', 'sequencer-loop');
        loopCheck.type = 'checkbox';
        loopCheck.checked = this.loop;
        loopCheck.addEventListener('change', () => {
            this.loop = loopCheck.checked;
        });
        loopLabel.appendChild(loopCheck);
        loopLabel.appendChild(document.createTextNode(' Loop'));
        
        // Clear all button
        const clearBtn = this.createElement('button', 'sequencer-btn sequencer-clear');
        clearBtn.textContent = 'CLEAR';
        clearBtn.title = 'Clear all checkpoints';
        clearBtn.addEventListener('click', () => this._handleClearAll());
        
        this._controlsEl.appendChild(saveBtn);
        this._controlsEl.appendChild(playBtn);
        this._controlsEl.appendChild(loopLabel);
        this._controlsEl.appendChild(clearBtn);
    }
    
    /**
     * Render the sequence (checkpoints + transitions)
     */
    _renderSequence() {
        this._listEl.innerHTML = '';
        
        if (this.checkpoints.length === 0) {
            const empty = this.createElement('div', 'sequencer-empty');
            empty.textContent = 'No checkpoints. Click "SAVE STATE" to add one.';
            this._listEl.appendChild(empty);
            return;
        }
        
        this.checkpoints.forEach((cp, i) => {
            // Checkpoint item
            const cpEl = this._createCheckpointElement(cp, i);
            this._listEl.appendChild(cpEl);
            
            // Transition after (if not last checkpoint)
            if (i < this.checkpoints.length - 1) {
                const tr = this.transitions[i] || this._createDefaultTransition();
                this.transitions[i] = tr; // ensure it exists
                const trEl = this._createTransitionElement(tr, i);
                this._listEl.appendChild(trEl);
            }
        });
    }
    
    /**
     * Create checkpoint element
     */
    _createCheckpointElement(cp, index) {
        const el = this.createElement('div', 'sequencer-checkpoint');
        el.draggable = true;
        el.dataset.index = index;
        el.dataset.type = 'checkpoint';
        
        // Grab handle
        const handle = this.createElement('span', 'sequencer-handle');
        handle.textContent = '⋮⋮';
        handle.title = 'Drag to reorder';
        
        // Name input
        const nameInput = this.createElement('input', 'sequencer-name');
        nameInput.type = 'text';
        nameInput.value = cp.name || `State ${index + 1}`;
        nameInput.addEventListener('change', () => {
            cp.name = nameInput.value;
            this._fireChange();
        });
        nameInput.addEventListener('click', (e) => e.stopPropagation());
        
        // Hold frames input
        const holdLabel = this.createElement('span', 'sequencer-label');
        holdLabel.textContent = 'Hold:';
        const holdInput = this.createElement('input', 'sequencer-frames');
        holdInput.type = 'number';
        holdInput.value = cp.holdFrames || this.defaultHoldFrames;
        holdInput.min = 1;
        holdInput.max = 10000;
        holdInput.step = 1;
        holdInput.title = 'Frames to hold before transition';
        holdInput.addEventListener('change', () => {
            cp.holdFrames = parseInt(holdInput.value) || this.defaultHoldFrames;
            this._updateTotal();
            this._fireChange();
        });
        holdInput.addEventListener('click', (e) => e.stopPropagation());
        
        // Load button
        const loadBtn = this.createElement('button', 'sequencer-btn-sm');
        loadBtn.textContent = '▶';
        loadBtn.title = 'Load into parameters';
        loadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.onLoad) this.onLoad(index, cp.params);
        });
        
        // Duplicate button
        const dupBtn = this.createElement('button', 'sequencer-btn-sm');
        dupBtn.textContent = '⎘';
        dupBtn.title = 'Duplicate';
        dupBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this._handleDuplicate(index);
        });
        
        // Delete button
        const delBtn = this.createElement('button', 'sequencer-btn-sm sequencer-del');
        delBtn.textContent = '×';
        delBtn.title = 'Delete';
        delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this._handleDelete(index);
        });
        
        // Assemble
        el.appendChild(handle);
        el.appendChild(nameInput);
        el.appendChild(holdLabel);
        el.appendChild(holdInput);
        el.appendChild(loadBtn);
        el.appendChild(dupBtn);
        el.appendChild(delBtn);
        
        // Drag events
        el.addEventListener('dragstart', (e) => this._onDragStart(e, index, 'checkpoint'));
        el.addEventListener('dragend', () => this._onDragEnd());
        el.addEventListener('dragover', (e) => this._onDragOver(e));
        el.addEventListener('drop', (e) => this._onDrop(e, index, 'checkpoint'));
        
        return el;
    }
    
    /**
     * Create transition element
     */
    _createTransitionElement(tr, index) {
        const el = this.createElement('div', 'sequencer-transition');
        el.dataset.index = index;
        el.dataset.type = 'transition';
        
        // Arrow indicator
        const arrow = this.createElement('span', 'sequencer-arrow');
        arrow.textContent = '↓';
        
        // Frames input
        const framesLabel = this.createElement('span', 'sequencer-label');
        framesLabel.textContent = 'Transition:';
        const framesInput = this.createElement('input', 'sequencer-frames');
        framesInput.type = 'number';
        framesInput.value = tr.frames || this.defaultTransitionFrames;
        framesInput.min = 1;
        framesInput.max = 10000;
        framesInput.step = 1;
        framesInput.title = 'Frames to transition';
        framesInput.addEventListener('change', () => {
            tr.frames = parseInt(framesInput.value) || this.defaultTransitionFrames;
            this._updateTotal();
            this._fireChange();
        });
        
        // Mode toggle: all vs sequential
        const modeLabel = this.createElement('label', 'sequencer-toggle');
        const modeCheck = this.createElement('input');
        modeCheck.type = 'checkbox';
        modeCheck.checked = tr.mode === 'sequential';
        modeCheck.title = 'Sequential: animate one param at a time';
        modeCheck.addEventListener('change', () => {
            tr.mode = modeCheck.checked ? 'sequential' : 'all';
            modeLabel.querySelector('span').textContent = tr.mode === 'sequential' ? 'SEQ' : 'ALL';
            this._fireChange();
        });
        const modeSpan = this.createElement('span');
        modeSpan.textContent = tr.mode === 'sequential' ? 'SEQ' : 'ALL';
        modeLabel.appendChild(modeCheck);
        modeLabel.appendChild(modeSpan);
        
        // Type toggle: blend vs step
        const typeLabel = this.createElement('label', 'sequencer-toggle');
        const typeCheck = this.createElement('input');
        typeCheck.type = 'checkbox';
        typeCheck.checked = tr.type === 'step';
        typeCheck.title = 'Step: jump at end instead of blend';
        typeCheck.addEventListener('change', () => {
            tr.type = typeCheck.checked ? 'step' : 'blend';
            typeLabel.querySelector('span').textContent = tr.type === 'step' ? 'STEP' : 'BLEND';
            this._fireChange();
        });
        const typeSpan = this.createElement('span');
        typeSpan.textContent = tr.type === 'step' ? 'STEP' : 'BLEND';
        typeLabel.appendChild(typeCheck);
        typeLabel.appendChild(typeSpan);
        
        // Assemble
        el.appendChild(arrow);
        el.appendChild(framesLabel);
        el.appendChild(framesInput);
        el.appendChild(modeLabel);
        el.appendChild(typeLabel);
        
        return el;
    }
    
    /**
     * Create default transition object
     */
    _createDefaultTransition() {
        return {
            frames: this.defaultTransitionFrames,
            mode: 'all',  // 'all' or 'sequential'
            type: 'blend' // 'blend' or 'step'
        };
    }
    
    /**
     * Calculate and display total frames
     */
    _updateTotal() {
        let total = 0;
        
        // Sum checkpoint hold frames
        this.checkpoints.forEach(cp => {
            total += cp.holdFrames || this.defaultHoldFrames;
        });
        
        // Sum transition frames
        this.transitions.forEach(tr => {
            total += tr.frames || this.defaultTransitionFrames;
        });
        
        if (this._totalEl) {
            this._totalEl.textContent = `Total: ${total} frames (${(total / 60).toFixed(1)}s @ 60fps)`;
        }
        
        if (this.onTotalFramesChange) {
            this.onTotalFramesChange(total);
        }
        
        return total;
    }
    
    /**
     * Get total frames (for export)
     */
    getTotalFrames() {
        return this._updateTotal();
    }
    
    /**
     * Get sequence data for playback
     */
    getSequenceData() {
        return {
            checkpoints: this.checkpoints,
            transitions: this.transitions,
            loop: this.loop,
            totalFrames: this.getTotalFrames()
        };
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // Event Handlers
    // ═══════════════════════════════════════════════════════════════════
    
    _handleSave() {
        if (this.onSave) {
            const params = this.onSave();
            if (params) {
                this.addCheckpoint(params);
            }
        }
    }
    
    /**
     * Add a checkpoint
     */
    addCheckpoint(params, name = null) {
        const cp = {
            name: name || `State ${this.checkpoints.length + 1}`,
            params: JSON.parse(JSON.stringify(params)),
            holdFrames: this.defaultHoldFrames,
            timestamp: Date.now()
        };
        
        // Add transition if not first checkpoint
        if (this.checkpoints.length > 0) {
            this.transitions.push(this._createDefaultTransition());
        }
        
        this.checkpoints.push(cp);
        this._renderSequence();
        this._updateTotal();
        this._fireChange();
    }
    
    _handleDelete(index) {
        if (index < 0 || index >= this.checkpoints.length) return;
        
        this.checkpoints.splice(index, 1);
        
        // Remove associated transition
        if (index > 0) {
            this.transitions.splice(index - 1, 1);
        } else if (this.transitions.length > 0) {
            this.transitions.splice(0, 1);
        }
        
        this._renderSequence();
        this._updateTotal();
        this._fireChange();
        
        if (this.onDelete) this.onDelete(index);
    }
    
    _handleDuplicate(index) {
        if (index < 0 || index >= this.checkpoints.length) return;
        
        const original = this.checkpoints[index];
        const copy = {
            name: original.name + ' (copy)',
            params: JSON.parse(JSON.stringify(original.params)),
            holdFrames: original.holdFrames,
            timestamp: Date.now()
        };
        
        // Insert after original
        this.checkpoints.splice(index + 1, 0, copy);
        this.transitions.splice(index, 0, this._createDefaultTransition());
        
        this._renderSequence();
        this._updateTotal();
        this._fireChange();
        
        if (this.onDuplicate) this.onDuplicate(index);
    }
    
    _handleClearAll() {
        this.checkpoints = [];
        this.transitions = [];
        this._renderSequence();
        this._updateTotal();
        this._fireChange();
    }
    
    _togglePlay() {
        this.isPlaying = !this.isPlaying;
        
        if (this._playBtn) {
            this._playBtn.textContent = this.isPlaying ? '■ STOP' : '▶ PLAY';
        }
        
        if (this.isPlaying) {
            if (this.onPlay) this.onPlay(this.getSequenceData());
        } else {
            if (this.onStop) this.onStop();
        }
    }
    
    /**
     * External control: set playing state
     */
    setPlaying(playing) {
        this.isPlaying = playing;
        if (this._playBtn) {
            this._playBtn.textContent = this.isPlaying ? '■ STOP' : '▶ PLAY';
        }
    }
    
    _fireChange() {
        if (this.onSequenceChange) {
            this.onSequenceChange(this.getSequenceData());
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // Drag and Drop
    // ═══════════════════════════════════════════════════════════════════
    
    _onDragStart(e, index, type) {
        this._draggedIndex = index;
        this._draggedType = type;
        e.dataTransfer.effectAllowed = 'move';
    }
    
    _onDragEnd() {
        this._draggedIndex = null;
        this._draggedType = null;
    }
    
    _onDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }
    
    _onDrop(e, dropIndex, dropType) {
        e.preventDefault();
        
        if (this._draggedIndex === null || this._draggedType !== 'checkpoint' || dropType !== 'checkpoint') {
            return;
        }
        
        if (this._draggedIndex !== dropIndex) {
            // Reorder checkpoints
            const [moved] = this.checkpoints.splice(this._draggedIndex, 1);
            this.checkpoints.splice(dropIndex, 0, moved);
            
            // Rebuild transitions
            this.transitions = [];
            for (let i = 0; i < this.checkpoints.length - 1; i++) {
                this.transitions.push(this._createDefaultTransition());
            }
            
            this._renderSequence();
            this._fireChange();
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // Public API
    // ═══════════════════════════════════════════════════════════════════
    
    /**
     * Set checkpoints from external data
     */
    setCheckpoints(checkpoints, transitions = null) {
        this.checkpoints = checkpoints || [];
        this.transitions = transitions || [];
        
        // Ensure transitions array matches
        while (this.transitions.length < this.checkpoints.length - 1) {
            this.transitions.push(this._createDefaultTransition());
        }
        
        this._renderSequence();
        this._updateTotal();
    }
    
    /**
     * Get current checkpoint at index
     */
    getCheckpoint(index) {
        return this.checkpoints[index] || null;
    }
    
    /**
     * Get transition at index
     */
    getTransition(index) {
        return this.transitions[index] || null;
    }
    
    destroy() {
        this._draggedIndex = null;
        this._draggedType = null;
        this._listEl = null;
        this._controlsEl = null;
        this._totalEl = null;
        this._playBtn = null;
        super.destroy();
    }
}
