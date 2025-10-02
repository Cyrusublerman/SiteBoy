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
 * CollapsibleSection - A self-contained collapsible section with a header and content area.
 */
export class CollapsibleSection extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'collapsible-section' }, deps);
        this.title = this.options.title || 'Section';
        this.defaultOpen = this.options.defaultOpen || false;
        this.isFirst = this.options.isFirst || false;
        this.contentLoader = this.options.contentLoader; // An async function that returns a DOM element
        this.isOpen = this.defaultOpen;
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

        const title = this.createElement('span', 'header-title');
        title.textContent = this.title;
        this.applyStyles(title, {
            'font-family': '"Atkinson Hyperlegible", monospace',
            'font-size': `${this.F}px`,
            'font-weight': 'normal',
            'text-transform': 'uppercase',
        });

        this.indicator = this.createElement('span', 'header-indicator');
        this.indicator.textContent = this.isOpen ? '−' : '+';
        this.applyStyles(this.indicator, {
            'font-family': '"Atkinson Hyperlegible", monospace',
            'font-size': `${this.F}px`,
            'width': `${this.F * 2}px`,
            'text-align': 'center',
        });

        this.header.appendChild(title);
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
