/**
 * Component Library - SiteBoy Framework
 * 
 * COMPLETE COMPONENT SYSTEM - All component code in ONE place
 * Contains BaseComponent + canonical glossary + specialized widgets + page structure
 * All components follow F=12px mathematical constraints and VGA/Mono styling
 * 
 * @version 3.0.0 - Complete Component System
 * @dependencies ['MathematicalFoundation', 'ResizeManager'] - Injected dependencies
 */

// =================================================================
// BASE COMPONENT - Foundation for all UI components
// =================================================================

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
        if (!this.deps.MF && window.MathematicalFoundation) {
            this.deps.MF = window.MathematicalFoundation;
        }
        if (!this.deps.Resize && window.ResizeManager) {
            this.deps.Resize = window.ResizeManager;
        }
        
        // Only warn if still missing after retry
        if (!this.deps.MF) {
            console.warn(`BaseComponent (${this.componentType}): MathematicalFoundation not available`);
        }
        if (!this.deps.Resize) {
            console.warn(`BaseComponent (${this.componentType}): ResizeManager not available`);
        }
    }
    
    /**
     * Lifecycle hook - called before render
     */
    beforeRender() {
        // Retry dependency validation before rendering
        this.validateDependencies();
    }
    
    /**
     * Lifecycle hook - called after render
     */
    afterRender() {
        // Override in subclasses if needed
    }
    
    /**
     * Lifecycle hook - called before destroy
     */
    beforeDestroy() {
        // Override in subclasses if needed
    }
    
    /**
     * Lifecycle hook - called after destroy
     */
    afterDestroy() {
        // Override in subclasses if needed
    }
    
    /**
     * Calculate dimensions using MathematicalFoundation
     */
    calculateDimensions(componentType = null) {
        if (!this.deps.MF) return;
        
        const type = componentType || this.componentType;
        this.dimensions = this.deps.MF.calculateComponentDimensions(type);
        return this.dimensions;
    }
    
    /**
     * Create DOM element - ONLY place where DOM creation is allowed
     */
    createElement(tagName = 'div', className = '') {
        const element = document.createElement(tagName);
        if (className) {
            element.className = className;
        }
        
        return element;
    }
    
    /**
     * Apply dimensions using CSS variables (only allowed inline styling)
     */
    applyDimensions() {
        if (!this.element || !this.dimensions) return;
        
        // Only set CSS variables - no other inline styles allowed
        Object.entries(this.dimensions).forEach(([key, value]) => {
            if (typeof value === 'string' && value.includes('var(') || value.includes('calc(')) {
                this.element.style.setProperty(`--comp-${key}`, value);
            }
        });
        
        // Apply container variables if MF is available
        if (this.deps.MF && this.deps.MF.applyContainerVars) {
            this.deps.MF.applyContainerVars(this.element, { 
                componentType: this.componentType 
            });
        }
    }
    
    /**
     * Attach event listeners - only if callbacks provided
     */
    attachEventListeners() {
        if (!this.element) return;
        
        // Only attach listeners if callbacks are provided in options
        if (this.options.onClick) {
            this.element.addEventListener('click', this.options.onClick);
            this.element.classList.add('clickable');
        }
        
        if (this.options.onKeyDown) {
            this.element.addEventListener('keydown', this.options.onKeyDown);
        }
        
        if (this.options.onFocus) {
            this.element.addEventListener('focus', this.options.onFocus);
        }
        
        if (this.options.onBlur) {
            this.element.addEventListener('blur', this.options.onBlur);
        }
    }
    
    /**
     * Add child component
     */
    addChild(child) {
        if (child instanceof BaseComponent) {
            this.children.add(child);
        }
    }
    
    /**
     * Remove child component
     */
    removeChild(child) {
        this.children.delete(child);
    }
    
    /**
     * Set content safely using replaceChildren
     */
    setContent(content) {
        if (!this.element) return;
        
        if (typeof content === 'string') {
            this.element.textContent = content;
        } else if (content instanceof Node) {
            this.element.replaceChildren(content);
        } else if (Array.isArray(content)) {
            this.element.replaceChildren(...content);
        }
    }
    
    /**
     * Add CSS class
     */
    addClass(className) {
        if (this.element && className) {
            this.element.classList.add(className);
        }
    }
    
    /**
     * Remove CSS class
     */
    removeClass(className) {
        if (this.element && className) {
            this.element.classList.remove(className);
        }
    }
    
    /**
     * Toggle CSS class
     */
    toggleClass(className) {
        if (this.element && className) {
            return this.element.classList.toggle(className);
        }
        return false;
    }
    
    /**
     * Show component
     */
    show() {
        this.removeClass('is-hidden');
    }
    
    /**
     * Hide component
     */
    hide() {
        this.addClass('is-hidden');
    }
    
    /**
     * Subscribe to resize events
     */
    subscribeToResize() {
        if (this.deps.Resize && !this.resizeToken) {
            this.resizeToken = this.deps.Resize.subscribe(() => {
                if (!this.isDestroyed) {
                    this.onResize();
                }
            });
        }
    }
    
    /**
     * Handle resize event - override in subclasses
     */
    onResize() {
        // Recalculate and apply dimensions
        this.calculateDimensions();
        this.applyDimensions();
    }
    
    /**
     * Render component - idempotent
     */
    render() {
        if (this.isDestroyed) {
            console.warn('BaseComponent: Cannot render destroyed component');
            return null;
        }
        
        // Only create element once
        if (!this.element) {
            this.beforeRender();
            
            // Create element using createElement method
            this.element = this.createElement('div', 'base-component');
            
            // Calculate and apply dimensions
            this.calculateDimensions();
            this.applyDimensions();
            
            // Attach event listeners
            this.attachEventListeners();
            
            // Subscribe to resize events if needed
            if (this.options.responsive !== false) {
                this.subscribeToResize();
            }
            
            this.afterRender();
        }
        
        return this.element;
    }
    
    /**
     * Destroy component - idempotent
     */
    destroy() {
        if (this.isDestroyed) return;
        
        this.beforeDestroy();
        
        // Destroy all children first
        for (const child of this.children) {
            child.destroy();
        }
        this.children.clear();
        
        // Unsubscribe from resize events
        if (this.resizeToken && this.deps.Resize) {
            this.deps.Resize.unsubscribe(this.resizeToken);
            this.resizeToken = null;
        }
        
        // Remove from DOM
        if (this.element?.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        
        // Clear references
        this.element = null;
        this.dimensions = null;
        this.isDestroyed = true;
        
        this.afterDestroy();
    }
    
    /**
     * Check if component is destroyed
     */
    isDestroyed() {
        return this.isDestroyed;
    }
    
    /**
     * Get component info for debugging
     */
    getInfo() {
        return {
            componentType: this.componentType,
            hasElement: !!this.element,
            childrenCount: this.children.size,
            isDestroyed: this.isDestroyed,
            hasDimensions: !!this.dimensions,
            hasResizeToken: !!this.resizeToken
        };
    }
}

// =================================================================
// NAVIGATION DROPDOWN - Shared dropdown for header and subheader  
// =================================================================

/**
 * BaseNavigationDropdown - Reusable dropdown for header and subheader
 * Matches original reference implementation exactly
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
            outline: '1px solid var(--c-border)',
            outlineOffset: '-1px',
            maxHeight: `min(${F * 50}px, 80vh)`, // Adaptive height: either 600px or 80% of viewport
            overflowY: 'auto',
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
            
            menuItem.style.cssText = `
                height: ${2 * F}px; line-height: ${2 * F}px; cursor: pointer;
                padding: 0 ${F}px 0 ${leftPadding}px; box-sizing: border-box;
                border-bottom: 1px solid var(--c-border);
                background: var(--c-bg); color: var(--c-text);
                font-size: ${F}px; text-transform: uppercase;
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
            
            // Add hover effects only for clickable items
            menuItem.addEventListener('mouseenter', () => {
                menuItem.style.background = 'var(--c-border)';
            });
            menuItem.addEventListener('mouseleave', () => {
                menuItem.style.background = 'var(--c-bg)';
            });
            
            this.dropdownElement.appendChild(menuItem);
        });
        
        console.log(`✅ Dropdown populated with ${this.dropdownElement.children.length} items`);
        console.log('🔄 Dropdown element after population:', this.dropdownElement);
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
                this.dropdownElement.style.width = `${triggerRect.width + 1}px`; // Make 1px wider
                console.log('🔄 Positioned dropdown to body at:', {
                    top: triggerRect.bottom,
                    left: triggerRect.left - 1,
                    width: triggerRect.width + 1
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
    
    destroy() {
        if (this.dropdownElement) {
            this.dropdownElement.remove();
        }
        super.destroy();
    }
}

// =================================================================
// UTILITY COMPONENTS
// =================================================================

/**
 * Spacing - Utility spacing component
 */
export class Spacing extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'spacing' }, deps);
        this.size = options.size || 'm'; // s, m, l
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', `spacing spacing-${this.size}`);
        }
        return this.element;
    }
}

/**
 * Grid - Layout grid component
 */
export class Grid extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'grid' }, deps);
        this.items = options.items || [];
        this.cols = options.cols || 4;
        this.onItemClick = options.onItemClick || null;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'grid component');
            this.element.style.setProperty('--grid-cols', this.cols);
            
            this.items.forEach((item, index) => {
                const gridItem = this.createElement('div', 'grid-item');
                gridItem.textContent = typeof item === 'string' ? item : (item.text || item.title || `${index + 1}`);
                
                if (this.onItemClick) {
                    gridItem.addEventListener('click', () => this.onItemClick(item, index));
                    gridItem.classList.add('clickable');
                }
                
                this.element.appendChild(gridItem);
            });
        }
        return this.element;
    }
}

// =================================================================
// TEXT COMPONENTS
// =================================================================

/**
 * Heading - Semantic heading component
 */
export class Heading extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'heading' }, deps);
        this.level = Math.max(1, Math.min(6, options.level || 1));
        this.content = options.content || '';
    }
    
    render() {
        if (!this.element) {
            const tag = `h${this.level}`;
            this.element = this.createElement(tag, `heading heading-${this.level}`);
            this.setContent(this.content);
        }
        return this.element;
    }
}

/**
 * Paragraph - Semantic paragraph component
 */
export class Paragraph extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'paragraph' }, deps);
        this.content = options.content || '';
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('p', 'paragraph');
            this.setContent(this.content);
        }
        return this.element;
    }
}

/**
 * Quote - Semantic blockquote component
 */
export class Quote extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'quote' }, deps);
        this.content = options.content || '';
        this.cite = options.cite || null;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('blockquote', 'quote');
            this.setContent(this.content);
            
            if (this.cite) {
                const citation = this.createElement('cite', 'quote-cite');
                citation.textContent = this.cite;
                this.element.appendChild(citation);
            }
        }
        return this.element;
    }
}

// =================================================================
// MEDIA COMPONENTS
// =================================================================

/**
 * Image - Semantic image component
 */
export class Image extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'image' }, deps);
        this.src = options.src || '';
        this.size = options.size || 'm'; // s, m, l, full
        this.caption = options.caption || null;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('figure', `image image-${this.size}`);
            
            const img = this.createElement('img', 'image-element');
            img.src = this.src;
            img.alt = this.caption || '';
            this.element.appendChild(img);
            
            if (this.caption) {
                const figcaption = this.createElement('figcaption', 'image-caption');
                figcaption.textContent = this.caption;
                this.element.appendChild(figcaption);
            }
        }
        return this.element;
    }
}

/**
 * Video - Semantic video component
 */
export class Video extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'video' }, deps);
        this.src = options.src || '';
        this.size = options.size || 'm';
        this.caption = options.caption || null;
        this.controls = options.controls !== false;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('figure', `video video-${this.size}`);
            
            const video = this.createElement('video', 'video-element');
            video.src = this.src;
            if (this.controls) video.controls = true;
            this.element.appendChild(video);
            
            if (this.caption) {
                const figcaption = this.createElement('figcaption', 'video-caption');
                figcaption.textContent = this.caption;
                this.element.appendChild(figcaption);
            }
        }
        return this.element;
    }
}

/**
 * Audio - Semantic audio component
 */
export class Audio extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'audio' }, deps);
        this.src = options.src || '';
        this.caption = options.caption || null;
        this.controls = options.controls !== false;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('figure', 'audio');
            
            const audio = this.createElement('audio', 'audio-element');
            audio.src = this.src;
            if (this.controls) audio.controls = true;
            this.element.appendChild(audio);
            
            if (this.caption) {
                const figcaption = this.createElement('figcaption', 'audio-caption');
                figcaption.textContent = this.caption;
                this.element.appendChild(figcaption);
            }
        }
        return this.element;
    }
}

// =================================================================
// SHARED INTERACTIVE FOUNDATION
// =================================================================

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
        this.currentIndex = this.currentIndex <= 0 ? 
            this.focusableItems.length - 1 : 
            this.currentIndex - 1;
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
                this.onSelect(item);
            }
            this.close();
        }
    }
    
    /**
     * Update visibility - override in subclasses
     */
    updateVisibility() {
        // Override in subclasses
    }
    
    /**
     * Update focusable items list - override in subclasses
     */
    updateFocusableItems() {
        // Override in subclasses
    }
}

// =================================================================
// NAV COMPONENTS
// =================================================================

/**
 * Dropdown - Positioned dropdown component with CollapsibleBase foundation
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
            
            itemElement.style.cssText = `
                height: ${(this.deps.MF ? this.deps.MF.F : 12) * 2}px;
                line-height: ${(this.deps.MF ? this.deps.MF.F : 12) * 2}px;
                padding: 0 ${this.deps.MF ? this.deps.MF.F : 12}px;
                box-sizing: border-box; cursor: pointer;
                border-bottom: 1px solid var(--c-border);
                background: var(--c-bg);
                color: var(--c-text);
            `;
            
            // Hover and focus styles
            itemElement.addEventListener('mouseenter', () => {
                itemElement.style.background = 'var(--c-border)';
                this.currentIndex = index;
            });
            
            itemElement.addEventListener('mouseleave', () => {
                itemElement.style.background = 'var(--c-bg)';
            });
            
            itemElement.addEventListener('focus', () => {
                itemElement.style.background = 'var(--c-border)';
                this.currentIndex = index;
            });
            
            itemElement.addEventListener('blur', () => {
                itemElement.style.background = 'var(--c-bg)';
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
    
    updateTriggerText(text) {
        this.triggerText = text;
        if (this.triggerElement) {
            this.triggerElement.textContent = text;
        }
    }
    
    destroy() {
        document.removeEventListener('click', this.handleOutsideClick);
        super.destroy();
    }
}

/**
 * Menu - Accessible menu component
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
                menuItem.textContent = item.label || item.title || item;
                
                if (this.current === item.path || this.current === item) {
                    menuItem.classList.add('current');
                    menuItem.setAttribute('aria-current', 'page');
                }
                
                // Keyboard navigation
                menuItem.addEventListener('keydown', (e) => {
                    this.handleMenuKeydown(e, index);
                });
                
                menuItem.addEventListener('click', () => {
                    if (this.onSelect) {
                        this.onSelect(item.path || item);
                    }
                });
                
                menuList.appendChild(menuItem);
            });
            
            this.element.appendChild(menuList);
        }
        return this.element;
    }
    
    handleMenuKeydown(event, currentIndex) {
        const items = this.element.querySelectorAll('.menu-item');
        let nextIndex = currentIndex;
        
        switch (event.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                event.preventDefault();
                nextIndex = (currentIndex + 1) % items.length;
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                event.preventDefault();
                nextIndex = (currentIndex - 1 + items.length) % items.length;
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                event.target.click();
                return;
            case 'Escape':
                event.preventDefault();
                this.close();
                return;
        }
        
        items[nextIndex].focus();
    }
    
    close() {
        this.isOpen = false;
        this.element.classList.remove('open');
    }
}

/**
 * Breadcrumb - Accessible breadcrumb navigation
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
                    breadcrumbItem.textContent = item.label || item.title || item;
                    breadcrumbItem.setAttribute('aria-current', 'page');
                } else {
                    const link = this.createElement('a', 'breadcrumb-link');
                    link.href = item.path || '#';
                    link.textContent = item.label || item.title || item;
                    
                    if (this.onSelect) {
                        link.addEventListener('click', (e) => {
                            e.preventDefault();
                            this.onSelect(item.path || item);
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

// =================================================================
// FORM COMPONENTS
// =================================================================

/**
 * Button - Accessible button component
 */
export class Button extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'button' }, deps);
        this.text = options.text || 'Button';
        this.disabled = options.disabled || false;
        this.type = options.type || 'button';
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('button', 'btn component');
            this.element.type = this.type;
            this.element.textContent = this.text;
            
            if (this.disabled) {
                this.element.disabled = true;
            }
            
            // Keyboard support
            this.element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (!this.disabled && this.options.onClick) {
                        this.options.onClick(e);
                    }
                }
            });
        }
        return this.element;
    }
}

/**
 * Input - Accessible input component
 */
export class Input extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'input' }, deps);
        this.name = options.name || '';
        this.value = options.value || '';
        this.placeholder = options.placeholder || '';
        this.type = options.type || 'text';
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('input', 'input component');
            this.element.type = this.type;
            this.element.name = this.name;
            this.element.value = this.value;
            this.element.placeholder = this.placeholder;
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
 * Select - Accessible select component
 */
export class Select extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'select' }, deps);
        this.name = options.name || '';
        this.options_list = options.options || [];
        this.value = options.value || '';
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

// =================================================================
// GRAPH COMPONENTS (specialized rendering)
// =================================================================

/**
 * BarGraph - Bar chart visualization
 */
export class BarGraph extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'graph' }, deps);
        this.data = options.data || [];
        this.labels = options.labels || [];
        this.colours = options.colours || [];
        this.size = options.size || 'm';
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', `bar-graph graph-${this.size}`);
            // Graph rendering implementation would go here
            this.element.textContent = 'Bar Graph - Implementation pending';
        }
        return this.element;
    }
}

/**
 * LineGraph - Line chart visualization
 */
export class LineGraph extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'graph' }, deps);
        this.data = options.data || [];
        this.labels = options.labels || [];
        this.colours = options.colours || [];
        this.size = options.size || 'm';
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', `line-graph graph-${this.size}`);
            // Graph rendering implementation would go here
            this.element.textContent = 'Line Graph - Implementation pending';
        }
        return this.element;
    }
}

/**
 * PieGraph - Pie chart visualization
 */
export class PieGraph extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'graph' }, deps);
        this.data = options.data || [];
        this.labels = options.labels || [];
        this.colours = options.colours || [];
        this.size = options.size || 'm';
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', `pie-graph graph-${this.size}`);
            // Graph rendering implementation would go here
            this.element.textContent = 'Pie Graph - Implementation pending';
        }
        return this.element;
    }
}

// =================================================================
// VGA SPECIALIZED WIDGETS
// =================================================================

/**
 * VGAGrid - Color grid with VGA styling
 */
export class VGAGrid extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'grid' }, deps);
        this.items = options.items || [];
        this.cols = options.cols || 4;
        this.showHex = options.showHex !== false;
        this.onItemClick = options.onItemClick || null;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'vga-grid component');
            this.element.style.setProperty('--grid-cols', this.cols);
            
            this.items.forEach((colorData, index) => {
                const gridItem = this.createElement('div', 'vga-grid-item');
                
                // Set background color
                if (colorData?.value) {
                    gridItem.style.backgroundColor = colorData.value;
                }
                
                if (this.showHex) {
                    const caption = this.createElement('div', 'grid-caption');
                    const text = this.createElement('span', 'caption-text');
                    text.textContent = colorData.value || '';
                    
                    const icon = this.createElement('div', 'caption-icon');
                    icon.textContent = String(index + 1).padStart(2, '0');
                    
                    caption.appendChild(text);
                    caption.appendChild(icon);
                    gridItem.appendChild(caption);
                }
                
                if (this.onItemClick) {
                    gridItem.addEventListener('click', () => this.onItemClick(colorData, index));
                    gridItem.classList.add('clickable');
                }
                
                this.element.appendChild(gridItem);
            });
        }
        return this.element;
    }
}

/**
 * ButtonGroup - Collection of related buttons
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
    
    destroy() {
        this.buttonInstances.forEach(button => {
            if (button.destroy) button.destroy();
        });
        this.buttonInstances = [];
        super.destroy();
    }
}

/**
 * MathematicalCanvas - Canvas for mathematical visualizations
 */
export class MathematicalCanvas extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'canvas' }, deps);
        this.width = options.width || null;
        this.height = options.height || 300;
        this.drawFunction = options.drawFunction || null;
        this.ctx = null;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('canvas', 'mathematical-canvas component');
            
            // Set canvas dimensions
            const canvasWidth = this.width || 600;
            const canvasHeight = this.height;
            
            this.element.width = canvasWidth;
            this.element.height = canvasHeight;
            
            // Get context and set up
            this.ctx = this.element.getContext('2d');
            this.ctx.fillStyle = 'var(--c-text)';
            this.ctx.strokeStyle = 'var(--c-text)';
            this.ctx.font = '12px "Space Mono", monospace';
            this.ctx.textBaseline = 'top';
            this.ctx.imageSmoothingEnabled = false;
            
            // Execute draw function if provided
            if (this.drawFunction) {
                this.drawFunction(this.ctx, canvasWidth, canvasHeight);
            }
        }
        return this.element;
    }
    
    draw(fn) {
        if (this.ctx && fn) {
            this.ctx.clearRect(0, 0, this.element.width, this.element.height);
            fn(this.ctx, this.element.width, this.element.height);
        }
    }
}

/**
 * ProgressBar - Progress indication widget
 */
export class ProgressBar extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'progress' }, deps);
        this.value = options.value || 0;
        this.max = options.max || 100;
        this.showText = options.showText !== false;
        this.fill = null;
        this.textEl = null;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'progress-bar component');
            
            this.fill = this.createElement('div', 'progress-fill');
            this.fill.style.width = `${(this.value / this.max) * 100}%`;
            this.element.appendChild(this.fill);
            
            if (this.showText) {
                this.textEl = this.createElement('div', 'progress-text');
                this.textEl.textContent = `${Math.round((this.value / this.max) * 100)}%`;
                this.element.appendChild(this.textEl);
            }
        }
        return this.element;
    }
    
    setValue(value) {
        this.value = Math.max(0, Math.min(this.max, value));
        if (this.fill) {
            this.fill.style.width = `${(this.value / this.max) * 100}%`;
        }
        if (this.textEl) {
            this.textEl.textContent = `${Math.round((this.value / this.max) * 100)}%`;
        }
    }
}

/**
 * MarkdownBody - Markdown content renderer
 */
export class MarkdownBody extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'markdown' }, deps);
        this.markdownText = options.markdownText || '';
        this.className = options.className || 'markdown-body';
        this.enableTOC = options.enableTOC || false;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', this.className);
            
            // Parse markdown to HTML
            const htmlContent = this.parseMarkdown(this.markdownText);
            this.element.innerHTML = htmlContent;
        }
        return this.element;
    }
    
    parseMarkdown(markdown) {
        if (!markdown || markdown.trim() === '') {
            return '<p><em>No content available.</em></p>';
        }
        
        try {
            // Use marked.js if available
            if (typeof marked !== 'undefined') {
                return marked.parse(markdown, {
                    breaks: true,
                    gfm: true
                });
            } else {
                // Fallback: basic markdown parsing
                return this.basicMarkdownParse(markdown);
            }
        } catch (error) {
            console.error('❌ Markdown parsing failed:', error);
            return `<p>Error parsing markdown: ${error.message}</p><pre>${markdown}</pre>`;
        }
    }
    
    basicMarkdownParse(markdown) {
        let html = markdown;
        
        // Headers (H1-H6)
        html = html.replace(/^#{6} (.*$)/gim, '<h6>$1</h6>');
        html = html.replace(/^#{5} (.*$)/gim, '<h5>$1</h5>');
        html = html.replace(/^#{4} (.*$)/gim, '<h4>$1</h4>');
        html = html.replace(/^#{3} (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^#{2} (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^#{1} (.*$)/gim, '<h1>$1</h1>');
        
        // Code blocks
        html = html.replace(/```([^`]+)```/gims, '<pre><code>$1</code></pre>');
        html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');
        
        // Bold and italic
        html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
        html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
        
        // Links and images
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>');
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1">');
        
        // Lists
        html = html.replace(/^[-*+] (.+)$/gim, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>');
        
        // Paragraphs
        html = html.replace(/\n\n/gim, '</p><p>');
        html = '<p>' + html + '</p>';
        
        return html;
    }
    
    updateContent(markdownText) {
        this.markdownText = markdownText;
        if (this.element) {
            const htmlContent = this.parseMarkdown(markdownText);
            this.element.innerHTML = htmlContent;
        }
    }
}

// =================================================================
// PAGE STRUCTURE COMPONENTS
// =================================================================

/**
 * PageContainer - Main page layout container
 */
export class PageContainer extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'page' }, deps);
        this.navigationItems = options.navigationItems || [];
        this.onNavigate = options.onNavigate || null;
        this.headerComponent = null;
        this.contentBody = null;
        this.footerComponent = null;
        this.subheaderComponent = null;
    }
    
    render() {
        if (!this.element) {
            this.calculateDimensions('page');
            const layout = this.dimensions?.layout || this.deps.MF?.computeLayout() || {};
            const F = this.deps.MF ? this.deps.MF.F : 12;
            
            // Create wrapper with full viewport
            this.element = this.createElement('div');
            this.element.id = 'wrapper';
            this.element.style.cssText = `
                position: relative; width: 100vw; min-height: 100vh; background: var(--c-bg);
            `;
            
            // Create curtains for proper margins (like original)
            this.createCurtains();
            
            // Apply F-based Layout & Sizing Guide calculations  
            this.applyLayoutGuideCalculations();
            
            // Create header with restored split layout
            this.headerComponent = new PageHeader({
                navigationItems: this.navigationItems.filter(item => 
                    item.title.toUpperCase() !== 'HOME'
                ),
                onNavigate: this.onNavigate
            }, this.deps);
            
            const headerEl = this.headerComponent.render();
            this.element.appendChild(headerEl);
            
            // Create subheader (hidden by default)
            this.subheaderComponent = new Subheader({
                sectionTitle: 'SECTION'
            }, this.deps);
            
            const subheaderEl = this.subheaderComponent.render();
            document.body.appendChild(subheaderEl);
            
            // Make globally accessible
            window.Subheader = this.subheaderComponent;
            
            // Create content container - this will hold TOC directly with padding
            const container = this.createElement('div', 'content-container');
            container.id = 'container';
            // All positioning handled by CSS variables in styles.css
            
            // Content container becomes the direct parent for content (no content-body wrapper)
            this.contentBody = container; // Point to container directly
            this.element.appendChild(container);
            
            // Create footer - positioned via CSS variables
            this.footerComponent = new PageFooter({}, this.deps);
            const footerEl = this.footerComponent.render();
            document.body.appendChild(footerEl);
            
            // Set initial layout state (no subheader by default)
            this.setSubheaderState(false);
            
            // Subscribe to resize
            this.subscribeToResize();
        }
        return this.element;
    }
    
    /**
     * Create curtains for proper page margins (restored from original)
     */
    createCurtains() {
        // Create top curtain - positioned via CSS variables
        const topCurtain = this.createElement('div', 'page-curtain-top');
        topCurtain.id = 'curtain';
        // Positioning handled by CSS
        document.body.appendChild(topCurtain);
        
        // Create bottom curtain
        const bottomCurtain = this.createElement('div', 'page-curtain-bottom');
        bottomCurtain.id = 'bottom-curtain';
        // Positioning handled by CSS
        document.body.appendChild(bottomCurtain);
    }
    
    /**
     * Apply F-based Layout & Sizing Guide calculations
     * Implements SiteBoy Layout & Sizing Guide within component
     */
    applyLayoutGuideCalculations() {
        if (!this.deps.MF) {
            console.warn('PageContainer: MathematicalFoundation not available for layout calculations');
            return;
        }
        
        const layout = this.deps.MF.computeLayout();
        const headerHeight = this.deps.MF.F * 2; // Header height = 24px (2*F)
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const isDesktop = layout.isDesktop; // Use the clear isDesktop flag from computeLayout
        
        console.log(`📐 PageContainer: Applying ${isDesktop ? 'Desktop' : 'Mobile'} layout calculations`);
        
        if (isDesktop) {
            // Desktop: width = window - 2*headerHeight, margin = headerHeight per edge
            const contentWidth = windowWidth - (2 * headerHeight);
            const marginOffset = headerHeight;
            
            this.setLayoutVariables({
                '--layout-width': `${contentWidth}px`,
                '--layout-margin': `${marginOffset}px`,
                '--header-y': `${headerHeight}px`,
                '--subheader-y': `${2 * headerHeight}px`,
                '--content-y-with-sub': `${3 * headerHeight}px`,
                '--content-y-no-sub': `${2 * headerHeight}px`,
                '--footer-y': `${windowHeight - headerHeight}px`,
                '--content-min-h-with-sub': `${windowHeight - (4 * headerHeight)}px`,
                '--content-min-h-no-sub': `${windowHeight - (3 * headerHeight)}px`,
                '--layout-type': 'desktop'
            });
            
        } else {
            // Mobile: full width, minimal margins
            const mobileMargin = this.deps.MF ? this.deps.MF.F : 12;
            this.setLayoutVariables({
                '--layout-width': `${windowWidth - (2 * mobileMargin)}px`,  // Mobile width with margins
                '--layout-margin': `${mobileMargin}px`,                    // 12px mobile margin
                '--header-y': `${mobileMargin}px`,                         // Header at 12px from top
                '--subheader-y': `${headerHeight}px`,
                '--content-y-with-sub': `${2 * headerHeight}px`,
                '--content-y-no-sub': `${headerHeight}px`,
                '--footer-y': `${windowHeight - headerHeight}px`,
                '--content-min-h-with-sub': `${windowHeight - (3 * headerHeight)}px`,
                '--content-min-h-no-sub': `${windowHeight - (2 * headerHeight)}px`,
                '--layout-type': 'mobile'
            });
        }
        
        console.log(`✅ PageContainer: Layout variables applied for ${isDesktop ? 'desktop' : 'mobile'}`);
        console.log('📐 Layout debug:', {
            windowWidth,
            windowHeight,
            headerHeight,
            isDesktop,
            marginOffset: isDesktop ? headerHeight : 0,
            contentWidth: isDesktop ? windowWidth - (2 * headerHeight) : 'auto'
        });
    }
    
    /**
     * Set CSS layout variables on document root
     * @param {Object} variables - CSS variable key-value pairs
     */
    setLayoutVariables(variables) {
        const root = document.documentElement;
        Object.entries(variables).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });
    }
    
    /**
     * Set subheader state and apply corresponding layout
     * @param {boolean} hasSubheader - Whether subheader should be shown
     */
    setSubheaderState(hasSubheader) {
        if (hasSubheader) {
            document.body.className = 'with-subheader';
            this.subheaderComponent?.show();
        } else {
            document.body.className = 'no-subheader';
            this.subheaderComponent?.hide();
        }
        
        console.log(`📐 PageContainer: Layout state set to ${hasSubheader ? 'with' : 'no'} subheader`);
    }
    
    /**
     * Handle resize event - recalculate layout
     */
    onResize() {
        super.onResize();
        
        // Recalculate layout on resize
        this.applyLayoutGuideCalculations();
        
        // Footer position handled by CSS variables - no manual updates needed
        
        console.log('📐 PageContainer: Layout recalculated for new viewport size');
    }
    
    getContentContainer() {
        return this.contentBody;
    }
    
    destroy() {
        if (this.headerComponent) this.headerComponent.destroy();
        if (this.subheaderComponent) this.subheaderComponent.destroy();
        if (this.footerComponent) this.footerComponent.destroy();
        super.destroy();
    }
}

/**
 * PageHeader - Site header component
 */
export class PageHeader extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'header' }, deps);
        this.navigationItems = options.navigationItems || [];
        this.onNavigate = options.onNavigate || null;
    }
    
    render() {
        if (!this.element) {
            this.calculateDimensions('header');
            const layout = this.dimensions?.layout || this.deps.MF?.computeLayout() || {};
            const F = this.deps.MF ? this.deps.MF.F : 12;
            // Header height = 24px (2*F)
            
            this.element = this.createElement('header', 'page-header');
            this.element.id = 'header';
            // Ensure visibility during debugging
            this.element.style.visibility = 'visible';
            this.element.style.display = 'flex';
            console.log('📄 PageHeader created with class:', this.element.className);
            
            // LEFT HALF - Site title (50% with border separator)
            const leftContainer = this.createElement('div', 'header-left');
            leftContainer.style.cssText = `
                position: absolute; left: 0; top: 0; width: 50%; height: 100%;
                background: var(--c-bg); border-right: 1px solid var(--c-border); 
                box-sizing: border-box;
            `;
            
            const homeLink = this.createElement('div', 'header-item');
            homeLink.id = 'home-link';
            homeLink.textContent = 'AEINODER';
            homeLink.style.cssText = `
                position: absolute; left: 0; top: 0; width: 100%; height: 100%;
                padding: 0 ${F}px; display: flex; align-items: center; text-transform: uppercase;
                font-size: ${F}px; box-sizing: border-box; cursor: pointer;
                font-family: 'Space Mono', monospace; font-weight: 400;
            `;
            
            if (this.onNavigate) {
                homeLink.addEventListener('click', () => {
                    this.onNavigate({ title: 'HOME' });
                });
                homeLink.classList.add('clickable');
            }
            
            leftContainer.appendChild(homeLink);
            this.element.appendChild(leftContainer);
            
            // RIGHT HALF - Navigation dropdown and theme toggle (50%)
            const rightContainer = this.createElement('div', 'header-right');
            rightContainer.style.cssText = `
                position: absolute; right: 0; top: 0; width: 50%; height: 100%;
                background: var(--c-bg); box-sizing: border-box;
            `;
            
            // Create reusable navigation dropdown
            this.navigationDropdown = new BaseNavigationDropdown({
                items: this.navigationItems,
                onItemClick: (item) => {
                    if (this.onNavigate && item.onClick) {
                        item.onClick();
                    }
                }
            }, this.deps);
            
            // Navigation area - calc(100% - headerHeight) to leave space for toggle
            const navContainer = this.createElement('div', 'header-nav');
            navContainer.id = 'header-nav';
            navContainer.style.cssText = `
                position: absolute; left: 0; top: 0; 
                width: calc(100% - ${F * 2}px); height: 100%;
                padding: 0 ${F}px; display: flex; align-items: center; text-transform: uppercase;
                font-size: ${F}px; cursor: pointer; box-sizing: border-box;
                overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
            `;
            
            const navText = this.createElement('span');
            navText.textContent = 'SECTIONS';
            const menuSymbol = this.createElement('span');
            menuSymbol.id = 'menu-symbol';
            menuSymbol.style.cssText = `font-size: ${F}px; margin-left: 2px; line-height: 1; display: inline-block;`;
            menuSymbol.textContent = '+';
            
            navContainer.appendChild(navText);
            navContainer.appendChild(menuSymbol);
            
            rightContainer.appendChild(navContainer);
            
            // Navigation dropdown positioning
            const dropdownMenu = this.navigationDropdown.createDropdownStructure('dropdown-menu', {
                zIndex: 190,
                right: `calc(${F * 2}px - 1px)`
            });
            
            // Position dropdown to span from left edge to toggle button
            dropdownMenu.style.top = '100%';
            dropdownMenu.style.right = `calc(${F * 2}px - 1px)`;
            dropdownMenu.style.left = '-1px';
            
            rightContainer.appendChild(dropdownMenu);
            
            // Set symbol element for toggle functionality
            this.navigationDropdown.setSymbolElement(menuSymbol);
            
            // Populate dropdown with navigation items
            this.navigationDropdown.populateDropdown(this.navigationItems);
            
            // Theme toggle button - exactly headerHeight width (24px square)
            const headerToggle = this.createElement('div', 'header-toggle');
            headerToggle.id = 'header-toggle';
            headerToggle.textContent = this.getThemeIcon();
            headerToggle.style.cssText = `
                position: absolute; right: 0; top: 0; 
                width: ${F * 2}px; height: 100%;
                display: flex; align-items: center; justify-content: center;
                border-left: 1px solid var(--c-border); box-sizing: border-box;
                font-size: ${F}px; line-height: 1; cursor: pointer;
                font-family: 'Space Mono', monospace;
            `;
            
            headerToggle.addEventListener('click', () => this.toggleTheme());
            headerToggle.classList.add('clickable');
            
            rightContainer.appendChild(headerToggle);
            this.element.appendChild(rightContainer);
            
            // Set symbol element for toggle functionality
            this.navigationDropdown.setSymbolElement(menuSymbol);
            
            // Add toggle functionality
            navContainer.addEventListener('click', () => {
                this.navigationDropdown.toggle();
            });
            
            // Setup click outside functionality
            this.navigationDropdown.setupClickOutside(navContainer);
            
            // Subscribe to resize
            this.subscribeToResize();
            
            // Ensure header is visible after creation
            setTimeout(() => {
                if (this.element) {
                    console.log('📐 Header visibility check:', {
                        display: this.element.style.display,
                        position: getComputedStyle(this.element).position,
                        top: getComputedStyle(this.element).top,
                        left: getComputedStyle(this.element).left,
                        zIndex: getComputedStyle(this.element).zIndex
                    });
                }
            }, 100);
        }
        return this.element;
    }
    
    /**
     * Fallback resize handler to ensure header stays visible
     */
    onResize() {
        if (this.element) {
            // Ensure header remains visible during resize
            const computedStyle = getComputedStyle(this.element);
            if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
                console.warn('⚠️ Header became hidden, forcing visibility');
                this.element.style.display = 'flex';
                this.element.style.visibility = 'visible';
            }
        }
    }
    
    getThemeIcon() {
        return document.documentElement.classList.contains('inverted') ? '☾' : '☼';
    }
    
    toggleTheme() {
        document.documentElement.classList.toggle('inverted');
        const isInverted = document.documentElement.classList.contains('inverted');
        localStorage.setItem('theme', isInverted ? 'inverted' : 'normal');
        
        const toggle = document.getElementById('header-toggle');
        if (toggle) {
            toggle.textContent = this.getThemeIcon();
        }
    }
}

/**
 * PageFooter - Site footer component
 */
export class PageFooter extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'footer' }, deps);
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('footer', 'page-footer');
            this.element.id = 'footer';
            
            const F = this.deps?.MF?.F || 12;
            
            // Back to top button (25%)
            const backToTop = this.createElement('div', 'footer-item');
            backToTop.id = 'back-to-top';
            backToTop.textContent = '↑ TOP';
            backToTop.style.cssText = `
                position: absolute; top: 0; left: 0; height: 100%; width: 25%;
                display: flex; align-items: center; justify-content: center;
                text-transform: uppercase; font-size: ${F}px;
                box-sizing: border-box; cursor: pointer;
            `;
            backToTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            backToTop.classList.add('clickable');
            this.element.appendChild(backToTop);
            
            // Instagram link (25%) - with left border separator
            const instagramLink = this.createElement('a', 'footer-item');
            instagramLink.href = 'https://instagram.com';
            instagramLink.target = '_blank';
            instagramLink.textContent = 'INSTAGRAM';
            instagramLink.style.cssText = `
                position: absolute; top: 0; left: 25%; height: 100%; width: 25%;
                display: flex; align-items: center; justify-content: center;
                text-transform: uppercase; font-size: ${F}px; text-decoration: none; color: inherit;
                border-left: 1px solid var(--c-border); box-sizing: border-box; cursor: pointer;
            `;
            instagramLink.classList.add('clickable');
            this.element.appendChild(instagramLink);
            
            // Contact link (25%) - with left border separator  
            const contactLink = this.createElement('a', 'footer-item');
            contactLink.href = 'mailto:contact@example.com';
            contactLink.textContent = 'CONTACT';
            contactLink.style.cssText = `
                position: absolute; top: 0; left: 50%; height: 100%; width: 25%;
                display: flex; align-items: center; justify-content: center;
                text-transform: uppercase; font-size: ${F}px; text-decoration: none; color: inherit;
                border-left: 1px solid var(--c-border); box-sizing: border-box; cursor: pointer;
            `;
            contactLink.classList.add('clickable');
            this.element.appendChild(contactLink);
            
            // Footer toggle (25%) - with left border separator
            const footerToggle = this.createElement('div', 'footer-item');
            footerToggle.id = 'footer-toggle';
            footerToggle.textContent = '◐';
            footerToggle.style.cssText = `
                position: absolute; top: 0; left: 75%; height: 100%; width: 25%;
                display: flex; align-items: center; justify-content: center;
                text-transform: uppercase; font-size: ${F}px;
                border-left: 1px solid var(--c-border); box-sizing: border-box; cursor: pointer;
            `;
            footerToggle.addEventListener('click', () => {
                console.log('Footer toggle clicked - can be extended for additional features');
            });
            footerToggle.classList.add('clickable');
            this.element.appendChild(footerToggle);
            
            // Subscribe to resize
            this.subscribeToResize();
        }
        return this.element;
    }
}

/**
 * Subheader - Section subheader component
 */
export class Subheader extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'subheader' }, deps);
        this.sectionTitle = options.sectionTitle || 'SECTION';
        this.onPrevClick = options.onPrevClick || null;
        this.onNextClick = options.onNextClick || null;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'subheader');
            this.element.id = 'subheader';
            this.hide(); // Start hidden
            
            // Apply precise subheader styling to fix border and width issues
            this.element.style.cssText = `
                position: fixed;
                top: calc(var(--subheader-y) - 1px); /* Move up 1px to overlap header border */
                left: var(--layout-margin);
                width: var(--layout-width);
                height: var(--header-height);
                background: var(--c-bg);
                border: 1px solid var(--c-border);
                border-top: none; /* Remove top border completely - overlaps header */
                box-sizing: border-box;
                z-index: 180;
                display: none;
                font-family: 'Space Mono', monospace;
                font-size: var(--f);
            `;
            
            // Title section - exactly 50% accounting for border
            const subheaderTitle = this.createElement('div', 'subheader-title');
            subheaderTitle.textContent = this.sectionTitle;
            subheaderTitle.style.cssText = `
                position: absolute;
                left: 0;
                top: 0;
                width: calc(50% + 1px); /* Add 1px to account for center border */
                height: 100%;
                display: flex;
                align-items: center;
                padding: 0 var(--f);
                text-transform: uppercase;
                border-right: 1px solid var(--c-border);
                box-sizing: border-box;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            `;
            
            // Navigation container - exactly 50% starting at center
            const subheaderNav = this.createElement('div', 'subheader-nav');
            subheaderNav.style.cssText = `
                position: absolute;
                left: 50%;
                top: 0;
                width: 50%;
                height: 100%;
                display: flex;
            `;
            
            // Previous button - exactly 25% of total width (50% of nav container)
            const prevButton = this.createElement('div', 'nav-button');
            prevButton.textContent = 'PREV ←';
            prevButton.style.cssText = `
                width: 50%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                text-transform: uppercase;
                border-right: 1px solid var(--c-border);
                box-sizing: border-box;
                cursor: pointer;
                font-family: 'Space Mono', monospace;
                font-size: var(--f);
            `;
            
            // Next button - exactly 25% of total width (50% of nav container)
            const nextButton = this.createElement('div', 'nav-button');
            nextButton.textContent = '→ NEXT';
            nextButton.style.cssText = `
                width: 50%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                text-transform: uppercase;
                box-sizing: border-box;
                cursor: pointer;
                font-family: 'Space Mono', monospace;
                font-size: var(--f);
            `;
            
            if (this.onPrevClick) {
                prevButton.addEventListener('click', this.onPrevClick);
                prevButton.classList.add('clickable');
            }
            
            if (this.onNextClick) {
                nextButton.addEventListener('click', this.onNextClick);
                nextButton.classList.add('clickable');
            }
            
            subheaderNav.appendChild(prevButton);
            subheaderNav.appendChild(nextButton);
            
            this.element.appendChild(subheaderTitle);
            this.element.appendChild(subheaderNav);
            
            // Subscribe to resize
            this.subscribeToResize();
        }
        return this.element;
    }
    
    // Subheader positioning handled by CSS variables - no resize handler needed
    
    updateTitle(title) {
        const titleElement = this.element?.querySelector('.subheader-title');
        if (titleElement) {
            titleElement.textContent = title.toUpperCase();
        }
    }
    
    /**
     * Show subheader with proper display
     */
    show() {
        if (this.element) {
            this.element.style.display = 'flex';
            console.log('🧭 Subheader shown');
        }
    }
    
    /**
     * Hide subheader
     */
    hide() {
        if (this.element) {
            this.element.style.display = 'none';
            console.log('🧭 Subheader hidden');
        }
    }
    
    /**
     * Update navigation buttons with new handlers
     * @param {Function} onPrev - Previous page handler
     * @param {Function} onNext - Next page handler
     */
    updateNavigation(onPrev = null, onNext = null) {
        if (!this.element) return;
        
        const prevButton = this.element.querySelector('.nav-button:first-child');
        const nextButton = this.element.querySelector('.nav-button:last-child');
        
        // Clear existing handlers and update functionality
        if (prevButton) {
            // Store original styles before cloning
            const originalPrevStyle = prevButton.style.cssText;
            prevButton.replaceWith(prevButton.cloneNode(true));
            const newPrevButton = this.element.querySelector('.nav-button:first-child');
            newPrevButton.textContent = 'PREV ←';
            
            // Restore original styles
            newPrevButton.style.cssText = originalPrevStyle;
            
            if (onPrev) {
                newPrevButton.addEventListener('click', onPrev);
                newPrevButton.classList.add('clickable');
                newPrevButton.style.opacity = '1';
                newPrevButton.style.cursor = 'pointer';
            } else {
                newPrevButton.style.opacity = '0.5';
                newPrevButton.style.cursor = 'not-allowed';
            }
        }
        
        if (nextButton) {
            // Store original styles before cloning
            const originalNextStyle = nextButton.style.cssText;
            nextButton.replaceWith(nextButton.cloneNode(true));
            const newNextButton = this.element.querySelector('.nav-button:last-child');
            newNextButton.textContent = '→ NEXT';
            
            // Restore original styles
            newNextButton.style.cssText = originalNextStyle;
            
            if (onNext) {
                newNextButton.addEventListener('click', onNext);
                newNextButton.classList.add('clickable');
                newNextButton.style.opacity = '1';
                newNextButton.style.cursor = 'pointer';
            } else {
                newNextButton.style.opacity = '0.5';
                newNextButton.style.cursor = 'not-allowed';
            }
        }
        
        console.log('🧭 Subheader navigation updated');
    }
    
    /**
     * Set dropdown content for left side of subheader
     * @param {Array} items - Dropdown items {label, value, url}
     * @param {Function} onSelect - Selection handler
     */
    setDropdownContent(items, onSelect = null) {
        if (!this.element) return;
        
        console.log('🔄 Subheader.setDropdownContent called with items:', items);
        console.log('🔄 Subheader element exists:', !!this.element);
        
        const titleElement = this.element.querySelector('.subheader-title');
        console.log('🔄 Title element found:', !!titleElement);
        if (!titleElement) return;
        
        // Create actual dropdown if items provided
        if (items && items.length > 0) {
            const F = this.deps.MF ? this.deps.MF.F : 12;
            const layout = this.deps.MF ? this.deps.MF.computeLayout() : {};
            
            // Create reusable navigation dropdown - like header but different positioning
            this.pageDropdown = new BaseNavigationDropdown({
                items: items,
                onItemClick: onSelect
            }, this.deps);
            
            // Create trigger element that fits precisely in the 50% title area
            const triggerElement = this.createElement('div', 'subheader-dropdown-trigger');
            triggerElement.style.cssText = `
                position: absolute;
                left: 0;
                top: 0;
                width: calc(50% + 1px); /* Add 1px to account for center border */
                height: 100%;
                display: flex;
                align-items: center;
                padding: 0 ${F}px;
                cursor: pointer;
                text-transform: uppercase;
                border-right: 1px solid var(--c-border);
                box-sizing: border-box;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                position: relative;
            `;
            
            const triggerText = this.createElement('span');
            triggerText.textContent = this.sectionTitle;
            const menuSymbol = this.createElement('span');
            menuSymbol.id = 'subheader-menu-symbol';
            menuSymbol.style.cssText = `font-size: ${F}px; margin-left: 2px; line-height: 1;`;
            menuSymbol.textContent = '+';
            
            triggerElement.appendChild(triggerText);
            triggerElement.appendChild(menuSymbol);
            
            // Create dropdown structure for subheader (spans exactly 50% width)
            const dropdownMenu = this.pageDropdown.createDropdownStructure('subheader-dropdown', {
                zIndex: 1500  // Much higher z-index to ensure visibility
            });
            
            // Position dropdown to match trigger width exactly (don't override all styles)
            dropdownMenu.style.width = 'calc(50% + 2px)'; /* 1px wider than trigger */
            dropdownMenu.style.border = '1px solid var(--c-border)';
            dropdownMenu.style.borderTop = 'none';
            dropdownMenu.style.zIndex = '1500';
            
            // Set symbol element for toggle functionality
            this.pageDropdown.setSymbolElement(menuSymbol);
            
            // Populate dropdown with navigation items
            this.pageDropdown.populateDropdown(items);
            
            // Add toggle functionality
            triggerElement.addEventListener('click', (e) => {
                console.log('🔄 Subheader dropdown trigger clicked!');
                console.log('🔄 PageDropdown exists:', !!this.pageDropdown);
                e.preventDefault();
                e.stopPropagation();
                this.pageDropdown.toggle();
            });
            
            // Setup click outside functionality
            this.pageDropdown.setupClickOutside(triggerElement);
            
            // Replace title element with trigger and append dropdown to body for visibility
            titleElement.parentNode.replaceChild(triggerElement, titleElement);
            
            // Append dropdown to document body to avoid clipping issues
            document.body.appendChild(dropdownMenu);
            
            // Store reference to the trigger for positioning
            this.dropdownTrigger = triggerElement;
            
            console.log(`🧭 Subheader dropdown created with ${items.length} items using BaseNavigationDropdown`);
        } else {
            // Fallback to simple title
            const pageCount = items ? items.length : 0;
            if (pageCount > 0) {
                titleElement.title = `${pageCount} pages available in this section`;
            }
            console.log(`🧭 Subheader dropdown content set: ${pageCount} items`);
        }
    }
    
    /**
     * Update dropdown trigger text (current page)
     * @param {string} text - New trigger text
     */
    updateDropdownText(text) {
        if (this.pageDropdown) {
            // Update trigger text for BaseNavigationDropdown
            const triggerElement = this.element?.querySelector('.subheader-dropdown-trigger span');
            if (triggerElement) {
                triggerElement.textContent = text.toUpperCase();
            }
        } else {
            this.updateTitle(text);
        }
    }
}

/**
 * HierarchicalTOC - Table of Contents component matching old design
 */
export class HierarchicalTOC extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'toc' }, deps);
        this.sections = options.sections || [];
        this.onSectionClick = options.onSectionClick || null;
        this.onSubsectionClick = options.onSubsectionClick || null;
    }
    
    render() {
        if (!this.element) {
            const F = this.deps.MF ? this.deps.MF.F : 12;
            // SIMPLIFIED: Direct TOC element with CSS positioning
            this.element = this.createElement('div', 'hierarchical-toc');
            
            // Calculate dimensions based on mathematical foundation
            const layout = this.deps.MF ? this.deps.MF.computeLayout() : { gridWidth: 800, headerHeight: 24 };
            const dimensions = this.calculateTOCDimensions(layout);
            
            // SIMPLIFIED: TOC takes full width, no margins (container has padding)
            this.element.style.cssText = `
                width: ${dimensions.rowWidth}px;
                margin: 0;
                position: relative;
            `;
            
            // Generate section items directly
            this.sections.forEach((section, index) => {
                const sectionElement = this.createSectionElement(section, index + 1, dimensions);
                this.element.appendChild(sectionElement);
                
                // Add subsections if expanded
                if (section.isExpanded && section.subsections) {
                    section.subsections.forEach(subsection => {
                        const subsectionElement = this.createSubsectionElement(subsection, dimensions);
                        this.element.appendChild(subsectionElement);
                    });
                }
            });
            
            // Subscribe to resize events to update layout
            this.subscribeToResize();
        }
        return this.element;
    }
    
    /**
     * Handle resize event - recalculate TOC dimensions
     */
    onResize() {
        if (this.element) {
            const F = this.deps.MF ? this.deps.MF.F : 12;
            const layout = this.deps.MF ? this.deps.MF.computeLayout() : { gridWidth: 800, headerHeight: 24 };
            const dimensions = this.calculateTOCDimensions(layout);
            
            // Update TOC dimensions directly (simplified structure)
            if (this.element) {
                this.element.style.cssText = `
                    width: ${dimensions.rowWidth}px;
                    margin: 0;
                    position: relative;
                `;
                
                // Update all section elements
                const sections = this.element.querySelectorAll('.toc-section-header');
                sections.forEach(section => {
                    section.style.width = `${dimensions.rowWidth}px`;
                    section.style.height = `${4 * F}px`;
                });
                
                // Update all subsection elements
                const subsections = this.element.querySelectorAll('.toc-subsection');
                subsections.forEach(subsection => {
                    subsection.style.width = `${dimensions.rowWidth}px`;
                });
            }
        }
    }
    
    calculateTOCDimensions(layout) {
        // Use Mathematical Foundation F value if available
        const F = this.deps.MF ? this.deps.MF.F : 12;
        const headerHeight = F * 4; // 48px (F=12px * 4) - FIXED: rows should be 4F tall
        
        // SIMPLIFIED: content-container has 4F padding, TOC takes full available width
        const isDesktop = layout.isDesktop !== false; // Default to desktop if not specified
        const containerPadding = isDesktop ? (4 * F) : F; // 4F on desktop, 1F on mobile
        const rowWidth = layout.gridWidth - (2 * containerPadding); // Account for container padding only
        
        const numberBoxSize = 4 * F; // 48px (4F wide as specified) - FIXED
        const arrowWidth = 4 * F; // Arrow width = 4F (48px) - FIXED: square box 4F wide
        const textWidth = rowWidth - numberBoxSize - arrowWidth; // Remaining space for text
        
        return {
            headerHeight,
            numberBoxSize,
            rowWidth,
            textWidth,
            arrowWidth
            // No padding needed - container handles it
        };
    }
    
    createSectionElement(section, index, dimensions) {
        const F = this.deps.MF ? this.deps.MF.F : 12;
        const sectionEl = this.createElement('div', 'toc-section-header');
        sectionEl.dataset.section = section.id;
        sectionEl.dataset.expandable = section.isExpandable;
        sectionEl.dataset.expanded = section.isExpanded;
        
        const expandIcon = section.isExpandable ? (section.isExpanded ? '▼' : '▶') : '';
        
        sectionEl.style.cssText = `
            width: ${dimensions.rowWidth}px;
            height: ${4 * F}px;
            cursor: ${section.isExpandable ? 'pointer' : 'default'};
            display: flex;
            align-items: stretch;
            border-left: 1px solid var(--c-border);
            border-right: 1px solid var(--c-border);
            border-bottom: 1px solid var(--c-border);
            ${index === 1 ? 'border-top: 1px solid var(--c-border);' : ''}
            background: var(--c-bg);
            color: var(--c-text);
            box-sizing: border-box;
        `;
        
        // Number box
        const numberBox = this.createElement('div', 'toc-number');
        numberBox.style.cssText = `
            width: ${dimensions.numberBoxSize}px;
            height: ${4 * F}px;
            background: var(--c-bg);
            color: var(--c-text);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${F}px;
            font-weight: 400;
            flex-shrink: 0;
            box-sizing: border-box;
        `;
        numberBox.textContent = String(index).padStart(2, '0');
        
        // Content area
        const contentArea = this.createElement('div', 'toc-content');
        contentArea.style.cssText = `
            width: ${dimensions.textWidth}px;
            height: ${4 * F}px;
            padding: 0 ${F}px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            flex-shrink: 0;
            border-left: 1px solid var(--c-border);
            box-sizing: border-box;
        `;
        
        const title = this.createElement('div', 'toc-title');
        title.style.cssText = `
            margin: 0 0 4px 0;
            text-transform: uppercase;
            font-size: ${F}px;
            letter-spacing: 0.05em;
            font-weight: 400;
            line-height: 1.2;
        `;
        title.textContent = section.title;
        
        const description = this.createElement('div', 'toc-description');
        description.style.cssText = `
            margin: 0;
            font-size: ${F}px;
            opacity: 0.7;
            text-transform: none;
            line-height: 1;
        `;
        description.textContent = section.description;
        
        contentArea.appendChild(title);
        contentArea.appendChild(description);
        
        // Arrow
        const arrow = this.createElement('div', 'toc-arrow');
        arrow.style.cssText = `
            width: ${dimensions.arrowWidth}px;
            height: ${4 * F}px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${F}px;
            border-left: 1px solid var(--c-border);
            flex-shrink: 0;
        `;
        arrow.textContent = expandIcon || '→';
        
        // Event handling
        sectionEl.addEventListener('click', () => {
            if (section.isExpandable && this.onSectionClick) {
                this.onSectionClick(section.id);
            } else if (!section.isExpandable && this.onSectionClick) {
                this.onSectionClick(section.id);
            }
        });
        
        sectionEl.appendChild(numberBox);
        sectionEl.appendChild(contentArea);
        sectionEl.appendChild(arrow);
        
        return sectionEl;
    }
    
    createSubsectionElement(subsection, dimensions) {
        const F = this.deps.MF ? this.deps.MF.F : 12;
        const subsectionEl = this.createElement('div', 'toc-subsection');
        subsectionEl.dataset.path = subsection.path;
        
        const subItemHeight = 2 * F; // 2F = 24px (same height as main sections)
        
        subsectionEl.style.cssText = `
            width: ${dimensions.rowWidth}px;
            height: ${subItemHeight}px;
            cursor: pointer;
            display: flex;
            align-items: stretch;
            border-left: 1px solid var(--c-border);
            border-right: 1px solid var(--c-border);
            border-bottom: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
        `;
        
        // Bullet box
        const bulletBox = this.createElement('div', 'toc-bullet');
        bulletBox.style.cssText = `
            width: ${dimensions.numberBoxSize}px;
            height: ${subItemHeight}px;
            background: var(--c-bg);
            color: var(--c-text);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${F}px;
            border-right: 1px solid var(--c-border);
            box-sizing: border-box;
            flex-shrink: 0;
        `;
        bulletBox.textContent = '•';
        
        // Content
        const content = this.createElement('div', 'toc-subcontent');
        content.style.cssText = `
            width: ${dimensions.textWidth}px;
            height: ${subItemHeight}px;
            padding: 0 ${F}px;
            display: flex;
            align-items: center;
            flex-shrink: 0;
            border-left: 1px solid var(--c-border);
            box-sizing: border-box;
        `;
        
        const title = this.createElement('div', 'toc-subtitle');
        title.style.cssText = `
            text-transform: uppercase;
            font-size: ${F}px;
            letter-spacing: 0.03em;
            font-weight: 400;
            line-height: 1.2;
        `;
        title.textContent = subsection.title;
        content.appendChild(title);
        
        // Arrow
        const arrow = this.createElement('div', 'toc-subarrow');
        arrow.style.cssText = `
            width: ${dimensions.arrowWidth}px;
            height: ${subItemHeight}px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${F}px;
            border-left: 1px solid var(--c-border);
            flex-shrink: 0;
        `;
        arrow.textContent = '→';
        
        // Event handling
        subsectionEl.addEventListener('click', () => {
            if (this.onSubsectionClick) {
                this.onSubsectionClick(subsection.path);
            }
        });
        
        subsectionEl.appendChild(bulletBox);
        subsectionEl.appendChild(content);
        subsectionEl.appendChild(arrow);
        
        return subsectionEl;
    }
    
    toggleSection(sectionId) {
        const section = this.sections.find(s => s.id === sectionId);
        if (section && section.isExpandable) {
            section.isExpanded = !section.isExpanded;
            
            // Re-render the component
            this.element.innerHTML = '';
            this.render();
        }
    }
}

// =================================================================
// COMPONENT LIBRARY FACTORY
// =================================================================

export const ComponentLibrary = {
    version: '2.0.0',
    
    // ALL Component classes in ONE place
    BaseNavigationDropdown, CollapsibleBase, Dropdown,
    Spacing, Grid,
    Heading, Paragraph, Quote,
    Image, Video, Audio,
    Menu, Breadcrumb,
    Button, Input, Select,
    BarGraph, LineGraph, PieGraph,
    VGAGrid, ButtonGroup, MathematicalCanvas, ProgressBar, MarkdownBody,
    PageContainer, PageHeader, PageFooter, Subheader, HierarchicalTOC,
    
    /**
     * Component factory
     */
    create(type, options = {}, deps = {}) {
        const components = {
            // Navigation Foundation
            baseNavigationDropdown: BaseNavigationDropdown,
            // Interactive Foundation
            collapsibleBase: CollapsibleBase,
            dropdown: Dropdown,
            // Canonical Glossary
            spacing: Spacing,
            grid: Grid,
            heading: Heading,
            paragraph: Paragraph,
            quote: Quote,
            image: Image,
            video: Video,
            audio: Audio,
            menu: Menu,
            breadcrumb: Breadcrumb,
            button: Button,
            input: Input,
            select: Select,
            // Graphs
            barGraph: BarGraph,
            lineGraph: LineGraph,
            pieGraph: PieGraph,
            // Specialized Widgets
            vgaGrid: VGAGrid,
            buttonGroup: ButtonGroup,
            canvas: MathematicalCanvas,
            progress: ProgressBar,
            markdownBody: MarkdownBody,
            // Page Structure
            pageContainer: PageContainer,
            pageHeader: PageHeader,
            pageFooter: PageFooter,
            subheader: Subheader,
            hierarchicalTOC: HierarchicalTOC
        };
        
        const ComponentClass = components[type];
        if (!ComponentClass) {
            throw new Error(`Unknown component type: ${type}`);
        }
        
        const component = new ComponentClass(options, deps);
        const container = component.render();
        
        return { container, component };
    },
    
    // Convenience factory methods
    // Navigation Foundation
    baseNavigationDropdown: (items, options = {}, deps) => ComponentLibrary.create('baseNavigationDropdown', { items, ...options }, deps),
    // Interactive Foundation
    dropdown: (items, options = {}, deps) => ComponentLibrary.create('dropdown', { items, ...options }, deps),
    // Canonical Glossary
    spacing: (options, deps) => ComponentLibrary.create('spacing', options, deps),
    grid: (items, options = {}, deps) => ComponentLibrary.create('grid', { items, ...options }, deps),
    heading: (level, content, options = {}, deps) => ComponentLibrary.create('heading', { level, content, ...options }, deps),
    paragraph: (content, options = {}, deps) => ComponentLibrary.create('paragraph', { content, ...options }, deps),
    quote: (content, cite, options = {}, deps) => ComponentLibrary.create('quote', { content, cite, ...options }, deps),
    image: (src, options = {}, deps) => ComponentLibrary.create('image', { src, ...options }, deps),
    video: (src, options = {}, deps) => ComponentLibrary.create('video', { src, ...options }, deps),
    audio: (src, options = {}, deps) => ComponentLibrary.create('audio', { src, ...options }, deps),
    menu: (items, options = {}, deps) => ComponentLibrary.create('menu', { items, ...options }, deps),
    breadcrumb: (items, options = {}, deps) => ComponentLibrary.create('breadcrumb', { items, ...options }, deps),
    button: (text, onClick, options = {}, deps) => ComponentLibrary.create('button', { text, onClick, ...options }, deps),
    input: (options = {}, deps) => ComponentLibrary.create('input', options, deps),
    select: (options = {}, deps) => ComponentLibrary.create('select', options, deps),
    // Graphs
    barGraph: (data, options = {}, deps) => ComponentLibrary.create('barGraph', { data, ...options }, deps),
    lineGraph: (data, options = {}, deps) => ComponentLibrary.create('lineGraph', { data, ...options }, deps),
    pieGraph: (data, options = {}, deps) => ComponentLibrary.create('pieGraph', { data, ...options }, deps),
    // Specialized Widgets
    vgaGrid: (items, options = {}, deps) => ComponentLibrary.create('vgaGrid', { items, ...options }, deps),
    buttonGroup: (buttons, options = {}, deps) => ComponentLibrary.create('buttonGroup', { buttons, ...options }, deps),
    canvas: (options = {}, deps) => ComponentLibrary.create('canvas', options, deps),
    progress: (options = {}, deps) => ComponentLibrary.create('progress', options, deps),
    markdownBody: (markdownText, options = {}, deps) => ComponentLibrary.create('markdownBody', { markdownText, ...options }, deps),
    // Page Structure
    pageContainer: (options = {}, deps) => ComponentLibrary.create('pageContainer', options, deps),
    pageHeader: (options = {}, deps) => ComponentLibrary.create('pageHeader', options, deps),
    pageFooter: (options = {}, deps) => ComponentLibrary.create('pageFooter', options, deps),
    subheader: (options = {}, deps) => ComponentLibrary.create('subheader', options, deps),
    hierarchicalTOC: (sections, options = {}, deps) => ComponentLibrary.create('hierarchicalTOC', { sections, ...options }, deps),
    
    /**
     * Memory management
     */
    createTracked(type, options, tracker, deps) {
        const result = this.create(type, options, deps);
        tracker.push(result.component);
        return result;
    },
    
    destroyTracked(tracker) {
        tracker.forEach(component => component.destroy());
        tracker.length = 0;
    }
};

// Global registration for legacy compatibility
window.ComponentLibrary = ComponentLibrary;

console.log(`📚 ComponentLibrary v${ComponentLibrary.version} - Canonical Glossary Components Ready`);