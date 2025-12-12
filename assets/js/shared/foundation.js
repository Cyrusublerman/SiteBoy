/**
 * Foundation Components - SiteBoy Framework
 * 
 * COMPONENTS OWNED BY THIS FILE:
 * - BaseComponent (foundation class for ALL UI components)
 * - BaseNavigationDropdown (reusable dropdown with keyboard nav)
 * 
 * DO NOT ADD DUPLICATES OF THESE COMPONENTS IN OTHER FILES!
 * This is the SINGLE SOURCE OF TRUTH for all foundational UI components.
 * ALL other components MUST extend BaseComponent and use its methods.
 * 
 * USAGE PATTERN:
 * import { BaseComponent } from './foundation.js';
 * class MyComponent extends BaseComponent { ... }
 * 
 * CRITICAL RULES:
 * - NO document.*, window.*, .innerHTML outside BaseComponent methods
 * - ALL DOM manipulation goes through BaseComponent.createElement()
 * - ALL components must call super() and use this.createElement()
 * - ALL components must implement .destroy() and call super.destroy()
 * 
 * DEPENDENCIES: None (this is the foundation)
 * 
 * 📖 PLACEMENT GUIDE: See COMPONENT_PLACEMENT_GUIDE.md for component placement rules
 * 🚨 BEFORE ADDING: Check if component already exists and verify correct category
 */

/**
 * BaseComponent - Foundation class for all SiteBoy UI components
 * 
 * CANONICAL BaseComponent - DI, CSS vars, lifecycle hooks
 * ALL DOM manipulation must go through BaseComponent methods
 * NO inline styling except CSS variables set by MF
 * 
 * @version 2.0.0 - DI & CSS Variables
 * @dependencies ['MathematicalFoundation', 'ResizeManager'] - Injected dependencies
 */
export class BaseComponent {
    constructor(options = {}, deps = {}) {
        this.options = options;
        this.element = null;
        this.children = new Set();
        this.resizeToken = null;
        this.isDestroyed = false;
        
        // Dependency injection with fallbacks and delayed initialization
        this.deps = {
            MF: deps.MF || window.MathematicalFoundation || null,
            Resize: deps.Resize || window.ResizeManager || null,
            ...deps
        };
        
        // Component type for dimension calculations
        this.componentType = options.componentType || 'default';
        
        // Validate dependencies with retry logic
        this.validateDependencies();
    }
    
    /**
     * Validate dependencies with retry logic
     */
    validateDependencies() {
        // Check if dependencies are available now
        if (!this.deps.MF || !this.deps.Resize) {
            // Retry after a short delay
            setTimeout(() => {
                this.deps.MF = this.deps.MF || window.MathematicalFoundation || null;
                this.deps.Resize = this.deps.Resize || window.ResizeManager || null;
                
                if (!this.deps.MF) {
                    console.warn('⚠️ MathematicalFoundation not available for component', this.componentType);
                }
                if (!this.deps.Resize) {
                    console.warn('⚠️ ResizeManager not available for component', this.componentType);
                }
            }, 100);
        }
    }
    
    /**
     * F-SYSTEM: Get the F unit value with proper fallbacks
     * Returns F and F2 (half-F) for consistent sizing across all components
     */
    getF() {
        // Priority: deps.MF.F → CSS variable → default 14
        let F = this.deps.MF?.F;
        if (!F) {
            const cssF = getComputedStyle(document.documentElement).getPropertyValue('--F');
            F = cssF ? parseInt(cssF, 10) : 14;
        }
        if (!F || isNaN(F)) F = 14;
        return { F, F2: F / 2 };
    }
    
    /**
     * Create a DOM element with class and optional content
     */
    createElement(tag, className = '', content = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.textContent = content;
        return element;
    }
    
    /**
     * Set text content of the component's element
     */
    setContent(content) {
        if (this.element) {
            this.element.textContent = content;
        }
    }
    
    /**
     * Subscribe to resize events if ResizeManager is available
     */
    subscribeToResize() {
        if (this.deps.Resize && typeof this.onResize === 'function') {
            this.resizeToken = this.deps.Resize.subscribe(this.onResize.bind(this));
        }
    }
    
    /**
     * Get calculated dimensions for this component type
     */
    calculateDimensions(type = this.componentType) {
        if (this.deps.MF && typeof this.deps.MF.calculateDimensions === 'function') {
            return this.deps.MF.calculateDimensions(type);
        }
        return {};
    }
    
    /**
     * Add a child component and track it
     */
    addChild(child) {
        this.children.add(child);
        if (this.element && child.element) {
            this.element.appendChild(child.element);
        }
        return child;
    }
    
    /**
     * Remove a child component
     */
    removeChild(child) {
        this.children.delete(child);
        if (child.element && child.element.parentNode) {
            child.element.parentNode.removeChild(child.element);
        }
        if (typeof child.destroy === 'function') {
            child.destroy();
        }
    }
    
    /**
     * Destroy component and clean up resources
     */
    destroy() {
        if (this.isDestroyed) return;
        
        // Unsubscribe from resize events
        if (this.resizeToken && this.deps.Resize) {
            this.deps.Resize.unsubscribe(this.resizeToken);
            this.resizeToken = null;
        }
        
        // Destroy all children
        for (const child of this.children) {
            if (typeof child.destroy === 'function') {
                child.destroy();
            }
        }
        this.children.clear();
        
        // Remove from DOM
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        
        // Clear references
        this.element = null;
        this.deps = {};
        this.isDestroyed = true;
    }
    
    /**
     * Render method - should be overridden by subclasses
     */
    render() {
        if (!this.element) {
            this.element = this.createElement('div', this.componentType);
        }
        return this.element;
    }
    
    /**
     * Apply CSS styles to an element
     * @param {HTMLElement} element - Element to style
     * @param {Object} styles - CSS styles object
     */
    applyStyles(element, styles) {
        if (!element || !styles) return;
        
        Object.keys(styles).forEach(property => {
            element.style[property] = styles[property];
        });
    }

    /**
     * Safely attach an element to document.body (for overlays/modals)
     * Centralizes document access inside BaseComponent internals
     */
    attachToBody(element) {
        if (!element) return;
        document.body.appendChild(element);
    }
}

/**
 * BaseNavigationDropdown - Complete dropdown component from original system
 */
export class BaseNavigationDropdown extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'dropdown' }, deps);
        this.items = options.items || [];
        this.onItemClick = options.onItemClick || null;
        this.isOpen = false;
        this.dropdownElement = null;
        this.symbolElement = null;
    }
    
    createDropdownStructure(containerId, position = {}) {
        const F = this.deps.MF ? this.deps.MF.F : 12;
        
        this.dropdownElement = this.createElement('nav');
        this.dropdownElement.id = containerId;
        this.dropdownElement.className = 'hidden';
        
        // Apply positioning from options or defaults
        const styles = {
            position: 'absolute',
            top: position.top || '100%',
            left: position.left || '0',
            right: position.right || undefined,
            width: position.width || undefined,
            background: 'var(--c-bg)',
            border: '1px solid var(--c-border)',
            borderTop: '1px solid var(--c-border)', // Keep top border for separation
            boxSizing: 'border-box',
            maxHeight: `min(${F * 50}px, 80vh)`, // Adaptive height: either 600px or 80% of viewport
            overflowY: 'hidden', // Start hidden, will be set to auto only if content actually overflows
            overflowX: 'hidden', // Prevent horizontal scrolling
            zIndex: position.zIndex || 185
        };
        
        // Apply styles
        Object.entries(styles).forEach(([prop, value]) => {
            if (value !== undefined) {
                this.dropdownElement.style[prop] = value;
            }
        });
        
        return this.dropdownElement;
    }
    
    populateDropdown(items) {
        if (!this.dropdownElement) return;
        
        console.log('🔄 BaseNavigationDropdown.populateDropdown called with items:', items);
        console.log('🔄 Dropdown element exists:', !!this.dropdownElement);
        
        const F = this.deps.MF ? this.deps.MF.F : 12;
        this.dropdownElement.innerHTML = ''; // Clear existing items
        
        items.forEach((item, index) => {
            console.log(`🔄 Processing dropdown item ${index}:`, item);
            
            // Handle header items with special styling
            if (item.type === 'header') {
                console.log(`📋 Creating header item: ${item.title}`);
                const headerItem = this.createElement('div', 'dropdown-header');
                headerItem.style.cssText = `
                    height: ${2 * F}px; line-height: ${2 * F}px;
                    padding: 0 ${F}px; box-sizing: border-box;
                    background: var(--c-border); color: var(--c-text);
                    font-size: ${F}px; text-transform: uppercase;
                    font-weight: bold; cursor: default;
                    border-bottom: 1px solid var(--c-border);
                `;
                headerItem.textContent = item.title;
                this.dropdownElement.appendChild(headerItem);
                return;
            }
            
            const menuItem = this.createElement('div', 'dropdown-item');
            
            // Determine indentation based on item type
            let leftPadding = F; // Default padding
            if (item.subitem) {
                leftPadding = F * 2; // Indent subitems (articles under categories)
            }
            
            // Height and layout handled by CSS .dropdown-item rule
            menuItem.style.cssText = `
                padding-left: ${leftPadding}px;
                background: var(--c-bg); color: var(--c-text);
                font-size: ${F}px;
            `;
            menuItem.textContent = item.title || item.label || item.text || item;
            console.log(`✅ Created menu item with text: "${menuItem.textContent}" and indentation: ${leftPadding}px`);
            
            menuItem.addEventListener('click', () => {
                if (this.onItemClick) {
                    this.onItemClick(item);
                } else if (item.onClick) {
                    item.onClick();
                }
                this.close();
            });
            
            // Add hover effects only for clickable items (matching framework style)
            menuItem.addEventListener('mouseenter', () => {
                menuItem.style.setProperty('background', 'var(--c-text)', 'important');
                menuItem.style.setProperty('color', 'var(--c-bg)', 'important');
            });
            menuItem.addEventListener('mouseleave', () => {
                menuItem.style.setProperty('background', 'var(--c-bg)', 'important');
                menuItem.style.setProperty('color', 'var(--c-text)', 'important');
            });
            
            this.dropdownElement.appendChild(menuItem);
        });
        
        // Remove bottom border from last item to avoid double border
        const lastItem = this.dropdownElement.lastElementChild;
        if (lastItem && lastItem.classList.contains('dropdown-item')) {
            lastItem.style.borderBottom = 'none';
        }
        
        console.log(`✅ Dropdown populated with ${this.dropdownElement.children.length} items`);
        console.log('🔄 Dropdown element after population:', this.dropdownElement);
        
        // Check if content overflows and set overflow accordingly
        this.updateOverflowBehavior();
    }
    
    /**
     * Update overflow behavior based on actual content height
     */
    updateOverflowBehavior() {
        if (!this.dropdownElement) return;
        
        // Force visibility temporarily to measure content
        const wasHidden = this.dropdownElement.classList.contains('hidden');
        this.dropdownElement.classList.remove('hidden');
        this.dropdownElement.style.visibility = 'hidden'; // Keep invisible but measurable
        
        // Get the actual content height and max height
        const contentHeight = this.dropdownElement.scrollHeight;
        const maxHeight = parseInt(this.dropdownElement.style.maxHeight);
        
        // Only show scrollbar if content actually overflows
        if (contentHeight > maxHeight) {
            this.dropdownElement.style.overflowY = 'auto';
        } else {
            this.dropdownElement.style.overflowY = 'hidden';
        }
        
        // Always keep horizontal overflow hidden to prevent horizontal scrollbar
        this.dropdownElement.style.overflowX = 'hidden';
        
        // Restore visibility state
        this.dropdownElement.style.visibility = '';
        if (wasHidden) {
            this.dropdownElement.classList.add('hidden');
        }
    }
    
    toggle() {
        console.log('🔄 BaseNavigationDropdown.toggle() called, current state:', this.isOpen);
        console.log('🔄 DropdownElement exists:', !!this.dropdownElement);
        if (this.dropdownElement) {
            console.log('🔄 Current classes:', this.dropdownElement.classList.toString());
            console.log('🔄 Current computed display:', window.getComputedStyle(this.dropdownElement).display);
        }
        
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        if (this.dropdownElement) {
            console.log('🔄 BaseNavigationDropdown.open() called');
            console.log('🔄 Dropdown element classList before:', this.dropdownElement.classList.toString());
            console.log('🔄 Dropdown element style.display before:', this.dropdownElement.style.display);
            
            // Position dropdown if attached to body
            if (this.dropdownElement.parentNode === document.body) {
                this.positionDropdownToBody();
            }
            
            // Force display block to override any CSS issues
            this.dropdownElement.classList.remove('hidden');
            this.dropdownElement.style.display = 'block';
            this.isOpen = true;
            
            console.log('🔄 Dropdown element classList after:', this.dropdownElement.classList.toString());
            console.log('🔄 Dropdown element style.display after:', this.dropdownElement.style.display);
            console.log('🔄 Final computed display:', window.getComputedStyle(this.dropdownElement).display);
            
            if (this.symbolElement) {
                this.symbolElement.textContent = '-';
            }
        } else {
            console.error('❌ BaseNavigationDropdown.open() - no dropdownElement!');
        }
    }
    
    close() {
        if (this.dropdownElement) {
            console.log('🔄 BaseNavigationDropdown.close() called');
            this.dropdownElement.classList.add('hidden');
            this.dropdownElement.style.display = 'none';
            this.isOpen = false;
            console.log('🔄 Dropdown closed, display set to none');
            if (this.symbolElement) {
                this.symbolElement.textContent = '+';
            }
        }
    }
    
    setSymbolElement(element) {
        this.symbolElement = element;
    }
    
    positionDropdownToBody() {
        // Position dropdown relative to trigger when attached to body
        if (this.symbolElement && this.dropdownElement) {
            const trigger = this.symbolElement.closest('.subheader-dropdown-trigger');
            if (trigger) {
                const triggerRect = trigger.getBoundingClientRect();
                this.dropdownElement.style.position = 'fixed';
                this.dropdownElement.style.top = `${triggerRect.bottom}px`;
                this.dropdownElement.style.left = `${triggerRect.left - 1}px`; // Shift left by 1px
                this.dropdownElement.style.width = `${triggerRect.width}px`; // Match trigger width exactly
                console.log('🔄 Positioned dropdown to body at:', {
                    top: triggerRect.bottom,
                    left: triggerRect.left - 1,
                    width: triggerRect.width
                });
            }
        }
    }
    
    setupClickOutside(triggerElement) {
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (triggerElement && !triggerElement.contains(e.target) && 
                this.dropdownElement && !this.dropdownElement.contains(e.target)) {
                this.close();
            }
        });
    }
    
    /**
     * Update font sizes for responsive design
     * @param {number} F - Current F value
     */
    updateFontSizes(F) {
        if (this.dropdownElement) {
            // Update dropdown font sizes based on F
            const menuItems = this.dropdownElement.querySelectorAll('.dropdown-item');
            menuItems.forEach(item => {
                item.style.fontSize = `${F}px`;
                item.style.lineHeight = `${F * 2}px`;
                item.style.padding = `0 ${F}px`;
            });
        }
    }
    
    destroy() {
        if (this.dropdownElement) {
            this.dropdownElement.remove();
        }
        super.destroy();
    }
}
