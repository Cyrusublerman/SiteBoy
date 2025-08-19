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
        
        // Dependency injection with fallbacks
        this.deps = {
            MF: deps.MF || window.MathematicalFoundation,
            Resize: deps.Resize || window.ResizeManager,
            ...deps
        };
        
        // Component type for dimension calculations
        this.componentType = options.componentType || 'default';
        
        // Validate dependencies
        if (!this.deps.MF) {
            console.warn('BaseComponent: MathematicalFoundation not available');
        }
        if (!this.deps.Resize) {
            console.warn('BaseComponent: ResizeManager not available');
        }
    }
    
    /**
     * Lifecycle hook - called before render
     */
    beforeRender() {
        // Override in subclasses if needed
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
// NAV COMPONENTS
// =================================================================

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
            this.element = this.createElement('div', 'page-container');
            this.element.id = 'wrapper';
            
            // Apply H-based Layout & Sizing Guide calculations
            this.applyLayoutGuideCalculations();
            
            // Create header
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
            
            // Create content container
            const container = this.createElement('div', 'content-container');
            container.id = 'container';
            
            // Create content body
            this.contentBody = this.createElement('article', 'content-body');
            container.appendChild(this.contentBody);
            this.element.appendChild(container);
            
            // Create footer
            this.footerComponent = new PageFooter({}, this.deps);
            const footerEl = this.footerComponent.render();
            this.element.appendChild(footerEl);
            
            // Set initial layout state (no subheader by default)
            this.setSubheaderState(false);
            
            // Subscribe to resize
            this.subscribeToResize();
        }
        return this.element;
    }
    
    /**
     * Apply H-based Layout & Sizing Guide calculations
     * Implements SiteBoy Layout & Sizing Guide within component
     */
    applyLayoutGuideCalculations() {
        if (!this.deps.MF) {
            console.warn('PageContainer: MathematicalFoundation not available for layout calculations');
            return;
        }
        
        const layout = this.deps.MF.computeLayout();
        const H = this.deps.MF.F * 2; // H = 24px (header height)
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const isDesktop = layout.isDesktop; // Use the clear isDesktop flag from computeLayout
        
        console.log(`📐 PageContainer: Applying ${isDesktop ? 'Desktop' : 'Mobile'} layout calculations`);
        
        if (isDesktop) {
            // Desktop: width = window - 2H, margin = H per edge
            const contentWidth = windowWidth - (2 * H);
            const marginOffset = H;
            
            this.setLayoutVariables({
                '--layout-width': `${contentWidth}px`,
                '--layout-margin': `${marginOffset}px`,
                '--header-y': `${H}px`,
                '--subheader-y': `${2 * H}px`,
                '--content-y-with-sub': `${3 * H}px`,
                '--content-y-no-sub': `${2 * H}px`,
                '--footer-y': `${windowHeight - H}px`,
                '--content-min-h-with-sub': `${windowHeight - (4 * H)}px`,
                '--content-min-h-no-sub': `${windowHeight - (3 * H)}px`,
                '--layout-type': 'desktop'
            });
            
        } else {
            // Mobile: full width, 1px border
            this.setLayoutVariables({
                '--layout-width': '100%',
                '--layout-margin': '0px',
                '--header-y': '0px',
                '--subheader-y': `${H}px`,
                '--content-y-with-sub': `${2 * H}px`,
                '--content-y-no-sub': `${H}px`,
                '--footer-y': `${windowHeight - H}px`,
                '--content-min-h-with-sub': `${windowHeight - (3 * H)}px`,
                '--content-min-h-no-sub': `${windowHeight - (2 * H)}px`,
                '--layout-type': 'mobile'
            });
        }
        
        console.log(`✅ PageContainer: Layout variables applied for ${isDesktop ? 'desktop' : 'mobile'}`);
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
            this.element = this.createElement('header', 'page-header');
            this.element.id = 'header';
            
            // Left side - Home link
            const leftContainer = this.createElement('div', 'header-left');
            const homeLink = this.createElement('div', 'header-item');
            homeLink.id = 'home-link';
            homeLink.textContent = 'AEINODER';
            
            if (this.onNavigate) {
                homeLink.addEventListener('click', () => {
                    this.onNavigate({ title: 'HOME' });
                });
                homeLink.classList.add('clickable');
            }
            
            leftContainer.appendChild(homeLink);
            this.element.appendChild(leftContainer);
            
            // Right side - Navigation and theme toggle
            const rightContainer = this.createElement('div', 'header-right');
            
            const headerNav = this.createElement('div', 'header-item');
            headerNav.id = 'header-nav';
            headerNav.textContent = 'SECTIONS';
            headerNav.classList.add('clickable');
            
            const headerToggle = this.createElement('div', 'header-item square-button');
            headerToggle.id = 'header-toggle';
            headerToggle.textContent = this.getThemeIcon();
            headerToggle.addEventListener('click', () => this.toggleTheme());
            headerToggle.classList.add('clickable');
            
            rightContainer.appendChild(headerNav);
            rightContainer.appendChild(headerToggle);
            this.element.appendChild(rightContainer);
            
            // Subscribe to resize
            this.subscribeToResize();
        }
        return this.element;
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
            
            const footerItems = [
                { text: '↑ TOP', onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
                { text: 'INSTAGRAM', href: 'https://instagram.com' },
                { text: 'CONTACT', href: 'mailto:contact@example.com' },
                { text: '◐', onClick: () => console.log('Footer toggle') }
            ];
            
            footerItems.forEach(item => {
                const footerItem = this.createElement(item.href ? 'a' : 'div', 'footer-item');
                footerItem.textContent = item.text;
                
                if (item.href) {
                    footerItem.href = item.href;
                    if (item.href.startsWith('http')) {
                        footerItem.target = '_blank';
                    }
                } else if (item.onClick) {
                    footerItem.addEventListener('click', item.onClick);
                }
                
                footerItem.classList.add('clickable');
                this.element.appendChild(footerItem);
            });
            
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
            
            // Title section
            const subheaderTitle = this.createElement('div', 'subheader-title');
            subheaderTitle.textContent = this.sectionTitle;
            
            // Navigation
            const subheaderNav = this.createElement('div', 'subheader-nav');
            
            const prevButton = this.createElement('div', 'nav-button');
            prevButton.textContent = 'PREV ←';
            if (this.onPrevClick) {
                prevButton.addEventListener('click', this.onPrevClick);
                prevButton.classList.add('clickable');
            }
            
            const nextButton = this.createElement('div', 'nav-button');
            nextButton.textContent = '→ NEXT';
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
        
        // Clear existing handlers
        if (prevButton) {
            prevButton.replaceWith(prevButton.cloneNode(true));
            const newPrevButton = this.element.querySelector('.nav-button:first-child');
            newPrevButton.textContent = 'PREV ←';
            
            if (onPrev) {
                newPrevButton.addEventListener('click', onPrev);
                newPrevButton.classList.add('clickable');
                newPrevButton.style.opacity = '1';
            } else {
                newPrevButton.style.opacity = '0.5';
                newPrevButton.style.cursor = 'not-allowed';
            }
        }
        
        if (nextButton) {
            nextButton.replaceWith(nextButton.cloneNode(true));
            const newNextButton = this.element.querySelector('.nav-button:last-child');
            newNextButton.textContent = '→ NEXT';
            
            if (onNext) {
                newNextButton.addEventListener('click', onNext);
                newNextButton.classList.add('clickable');
                newNextButton.style.opacity = '1';
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
        
        const titleElement = this.element.querySelector('.subheader-title');
        if (!titleElement) return;
        
        // For now, we'll enhance the title to show page count
        // In a full implementation, this would be a proper dropdown
        const pageCount = items ? items.length : 0;
        const currentTitle = titleElement.textContent;
        
        if (pageCount > 0) {
            titleElement.title = `${pageCount} pages available in this section`;
        }
        
        console.log(`🧭 Subheader dropdown content set: ${pageCount} items`);
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
            this.element = this.createElement('div', 'hierarchical-toc');
            
            // Calculate dimensions based on mathematical foundation
            const layout = this.deps.MF ? this.deps.MF.computeLayout() : { gridWidth: 800, headerHeight: 24 };
            const dimensions = this.calculateTOCDimensions(layout);
            
            // Create TOC container
            const tocContainer = this.createElement('div', 'toc-container');
            tocContainer.style.cssText = `
                margin: ${dimensions.headerHeight * 2}px auto 0 auto;
                width: ${dimensions.rowWidth}px;
            `;
            
            // Generate section items
            this.sections.forEach((section, index) => {
                const sectionElement = this.createSectionElement(section, index + 1, dimensions);
                tocContainer.appendChild(sectionElement);
                
                // Add subsections if expanded
                if (section.isExpanded && section.subsections) {
                    section.subsections.forEach(subsection => {
                        const subsectionElement = this.createSubsectionElement(subsection, dimensions);
                        tocContainer.appendChild(subsectionElement);
                    });
                }
            });
            
            this.element.appendChild(tocContainer);
        }
        return this.element;
    }
    
    calculateTOCDimensions(layout) {
        // Use Mathematical Foundation F value if available
        const F = this.deps.MF ? this.deps.MF.F : 12;
        const headerHeight = F * 2; // 24px (F=12px * 2)
        const numberBoxSize = headerHeight * 2; // 48px
        const rowWidth = layout.gridWidth - (headerHeight * 4); // Body width - margins
        const textWidth = rowWidth - numberBoxSize - (headerHeight * 2); // Remaining space
        const arrowWidth = headerHeight * 2; // Same as number box
        
        return {
            headerHeight,
            numberBoxSize,
            rowWidth,
            textWidth,
            arrowWidth
        };
    }
    
    createSectionElement(section, index, dimensions) {
        const sectionEl = this.createElement('div', 'toc-section-header');
        sectionEl.dataset.section = section.id;
        sectionEl.dataset.expandable = section.isExpandable;
        sectionEl.dataset.expanded = section.isExpanded;
        
        const expandIcon = section.isExpandable ? (section.isExpanded ? '▼' : '▶') : '';
        
        sectionEl.style.cssText = `
            width: ${dimensions.rowWidth}px;
            height: ${dimensions.numberBoxSize}px;
            cursor: ${section.isExpandable ? 'pointer' : 'default'};
            display: flex;
            align-items: stretch;
            border: 1px solid var(--c-border);
            ${index > 1 ? 'border-top: none;' : ''}
            background: var(--c-bg);
            color: var(--c-text);
        `;
        
        // Number box
        const numberBox = this.createElement('div', 'toc-number');
        numberBox.style.cssText = `
            width: ${dimensions.numberBoxSize}px;
            height: ${dimensions.numberBoxSize}px;
            background: var(--c-text);
            color: var(--c-bg);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            font-weight: 400;
            flex-shrink: 0;
        `;
        numberBox.textContent = String(index).padStart(2, '0');
        
        // Content area
        const contentArea = this.createElement('div', 'toc-content');
        contentArea.style.cssText = `
            width: ${dimensions.textWidth}px;
            padding: 12px 24px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            flex-shrink: 0;
            border-left: 1px solid var(--c-border);
        `;
        
        const title = this.createElement('div', 'toc-title');
        title.style.cssText = `
            margin: 0 0 4px 0;
            text-transform: uppercase;
            font-size: 14px;
            letter-spacing: 0.05em;
            font-weight: 400;
            line-height: 1.2;
        `;
        title.textContent = section.title;
        
        const description = this.createElement('div', 'toc-description');
        description.style.cssText = `
            margin: 0;
            font-size: 11px;
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
            height: ${dimensions.numberBoxSize}px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
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
        const subsectionEl = this.createElement('div', 'toc-subsection');
        subsectionEl.dataset.path = subsection.path;
        
        const subItemHeight = Math.floor(dimensions.numberBoxSize * 0.75);
        
        subsectionEl.style.cssText = `
            width: ${dimensions.rowWidth}px;
            height: ${subItemHeight}px;
            cursor: pointer;
            display: flex;
            align-items: stretch;
            border: 1px solid var(--c-border);
            border-top: none;
            background: rgba(128, 128, 128, 0.05);
            color: var(--c-text);
        `;
        
        // Bullet box
        const bulletBox = this.createElement('div', 'toc-bullet');
        bulletBox.style.cssText = `
            width: ${dimensions.numberBoxSize}px;
            height: ${subItemHeight}px;
            background: var(--c-border);
            color: var(--c-bg);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            flex-shrink: 0;
        `;
        bulletBox.textContent = '•';
        
        // Content
        const content = this.createElement('div', 'toc-subcontent');
        content.style.cssText = `
            width: ${dimensions.textWidth}px;
            padding: 8px 24px;
            display: flex;
            align-items: center;
            flex-shrink: 0;
            border-left: 1px solid var(--c-border);
        `;
        
        const title = this.createElement('div', 'toc-subtitle');
        title.style.cssText = `
            text-transform: uppercase;
            font-size: 12px;
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
            font-size: 14px;
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