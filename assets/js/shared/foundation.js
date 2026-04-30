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
     * Clear child nodes without exposing innerHTML to component subclasses.
     */
    clearElement(element) {
        if (!element) return;
        element.replaceChildren();
    }

    /**
     * Append a child element through the foundation DOM boundary.
     */
    appendElement(parent, child) {
        if (!parent || !child) return;
        parent.appendChild(child);
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
        // Handle both Set (default) and Array (used by container components)
        if (typeof this.children.clear === 'function') {
            this.children.clear();
        } else if (Array.isArray(this.children)) {
            this.children.length = 0;
        }
        
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

    /**
     * Remove an element through the foundation DOM boundary.
     */
    detachElement(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }
}

/**
 * BaseNavigationDropdown - Complete dropdown component from original system
 * Supports flat items, headers, and collapsible subsections with +/- toggles
 */
export class BaseNavigationDropdown extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'dropdown' }, deps);
        this.items = options.items || [];
        this.onItemClick = options.onItemClick || null;
        this.isOpen = false;
        this.dropdownElement = null;
        this.symbolElement = null;
        this.subsectionStates = new Map(); // Track collapsed state of subsections
        this.expandSubsection = options.expandSubsection || null; // Auto-expand this subsection
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

        const F = this.deps.MF ? this.deps.MF.F : 12;
        this.dropdownElement.innerHTML = ''; // Clear existing items

        items.forEach((item, index) => {
            // Handle collapsible subsection items (file-directory style)
            if (item.type === 'subsection') {
                this.createSubsectionItem(item, F);
                return;
            }

            // Handle header items with special styling
            if (item.type === 'header') {
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

            // Regular clickable item
            this.createMenuItem(item, F, item.depth || 0);
        });

        // Remove bottom border from last visible item
        this.updateLastItemBorder();

        // Check if content overflows and set overflow accordingly
        this.updateOverflowBehavior();
    }
    
    /**
     * Create a collapsible subsection with +/- toggle
     */
    createSubsectionItem(item, F) {
        const subsectionId = item.id || item.title;
        
        // Auto-expand if this is the current subsection, otherwise default to collapsed
        const shouldExpand = this.expandSubsection === subsectionId;
        const isCollapsed = this.subsectionStates.get(subsectionId) !== false && !shouldExpand;
        
        // Initialize state for this subsection
        if (shouldExpand) {
            this.subsectionStates.set(subsectionId, true); // true = expanded
        }
        
        const isNavigable = !!item.path;

        // Create subsection header row (like a folder)
        const subsectionHeader = this.createElement('div', 'dropdown-subsection');
        subsectionHeader.dataset.subsectionId = subsectionId;
        subsectionHeader.style.cssText = `
            height: ${2 * F}px; line-height: ${2 * F}px;
            padding: 0 ${F}px; box-sizing: border-box;
            background: var(--c-bg); color: var(--c-text);
            font-size: ${F}px; text-transform: uppercase;
            cursor: pointer; display: flex; align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid var(--c-border);
        `;

        // Title text
        const titleSpan = this.createElement('span');
        titleSpan.textContent = item.title;
        titleSpan.style.cssText = 'flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';

        // +/- toggle symbol
        const toggleSymbol = this.createElement('span', 'subsection-toggle');
        toggleSymbol.textContent = isCollapsed ? '+' : '-';
        toggleSymbol.style.cssText = `font-size: ${F}px; margin-left: ${F/2}px; flex-shrink: 0;`;

        subsectionHeader.appendChild(titleSpan);
        subsectionHeader.appendChild(toggleSymbol);

        // Create container for child items
        const childContainer = this.createElement('div', 'dropdown-subsection-children');
        childContainer.dataset.parentId = subsectionId;
        childContainer.style.cssText = isCollapsed ? 'display: none;' : 'display: block;';

        // Add child items to container
        if (item.items && item.items.length > 0) {
            item.items.forEach(childItem => {
                this.createMenuItem(childItem, F, 1, childContainer);
            });
        }

        const doToggle = () => {
            const currentlyCollapsed = childContainer.style.display === 'none';
            childContainer.style.display = currentlyCollapsed ? 'block' : 'none';
            toggleSymbol.textContent = currentlyCollapsed ? '-' : '+';
            this.subsectionStates.set(subsectionId, !currentlyCollapsed);
            this.updateOverflowBehavior();
            this.updateLastItemBorder();
        };

        // Click: left half navigates, right half toggles
        subsectionHeader.addEventListener('click', (e) => {
            e.stopPropagation();
            const rect = subsectionHeader.getBoundingClientRect();
            const inLeftHalf = e.clientX < rect.left + rect.width / 2;
            if (inLeftHalf && isNavigable) {
                if (childContainer.style.display === 'none') doToggle();
                if (this.onItemClick) this.onItemClick(item);
                this.close();
            } else {
                doToggle();
            }
        });

        // Hover effect
        subsectionHeader.addEventListener('mouseenter', () => {
            subsectionHeader.style.setProperty('background', 'var(--c-text)', 'important');
            subsectionHeader.style.setProperty('color', 'var(--c-bg)', 'important');
        });
        subsectionHeader.addEventListener('mouseleave', () => {
            subsectionHeader.style.setProperty('background', 'var(--c-bg)', 'important');
            subsectionHeader.style.setProperty('color', 'var(--c-text)', 'important');
        });
        
        this.dropdownElement.appendChild(subsectionHeader);
        this.dropdownElement.appendChild(childContainer);
    }
    
    /**
     * Create a regular clickable menu item
     */
    createMenuItem(item, F, depth = 0, container = null) {
        const targetContainer = container || this.dropdownElement;
        const menuItem = this.createElement('div', 'dropdown-item');
        
        // Indentation: base F + depth * F for nested items
        const leftPadding = F + (depth * F);
        
        menuItem.style.cssText = `
            padding-left: ${leftPadding}px;
            background: var(--c-bg); color: var(--c-text);
            font-size: ${F}px;
        `;
        menuItem.textContent = item.title || item.label || item.text || item;
        
        // Mark active item
        if (item.isActive) {
            menuItem.style.setProperty('background', 'var(--c-text)', 'important');
            menuItem.style.setProperty('color', 'var(--c-bg)', 'important');
        }
        
        menuItem.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.onItemClick) {
                this.onItemClick(item);
            } else if (item.onClick) {
                item.onClick();
            }
            this.close();
        });
        
        // Hover effects (skip for active item)
        if (!item.isActive) {
            menuItem.addEventListener('mouseenter', () => {
                menuItem.style.setProperty('background', 'var(--c-text)', 'important');
                menuItem.style.setProperty('color', 'var(--c-bg)', 'important');
            });
            menuItem.addEventListener('mouseleave', () => {
                menuItem.style.setProperty('background', 'var(--c-bg)', 'important');
                menuItem.style.setProperty('color', 'var(--c-text)', 'important');
            });
        }
        
        targetContainer.appendChild(menuItem);
        return menuItem;
    }
    
    /**
     * Update last visible item to remove bottom border
     */
    updateLastItemBorder() {
        if (!this.dropdownElement) return;
        
        // Reset all borders first
        const allItems = this.dropdownElement.querySelectorAll('.dropdown-item, .dropdown-subsection');
        allItems.forEach(item => {
            item.style.borderBottom = '1px solid var(--c-border)';
        });
        
        // Find last visible item (accounting for collapsed sections)
        const children = Array.from(this.dropdownElement.children);
        for (let i = children.length - 1; i >= 0; i--) {
            const child = children[i];
            if (child.classList.contains('dropdown-subsection-children')) {
                // Check if expanded and has visible children
                if (child.style.display !== 'none' && child.children.length > 0) {
                    const lastChild = child.lastElementChild;
                    if (lastChild) lastChild.style.borderBottom = 'none';
                    return;
                }
            } else if (child.classList.contains('dropdown-item') || child.classList.contains('dropdown-subsection')) {
                child.style.borderBottom = 'none';
                return;
            }
        }
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
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        if (this.dropdownElement) {
            // Position dropdown if attached to body
            if (this.dropdownElement.parentNode === document.body) {
                this.positionDropdownToBody();
            }

            // Force display block to override any CSS issues
            this.dropdownElement.classList.remove('hidden');
            this.dropdownElement.style.display = 'block';
            this.dropdownElement.style.visibility = 'visible';
            this.isOpen = true;

            if (this.symbolElement) {
                this.symbolElement.textContent = '-';
            }
        }
    }
    
    close() {
        if (this.dropdownElement) {
            window.debugLog('VERBOSE', '🔄 BaseNavigationDropdown.close() called');
            this.dropdownElement.classList.add('hidden');
            this.dropdownElement.style.display = 'none';
            this.isOpen = false;
            window.debugLog('VERBOSE', '🔄 Dropdown closed, display set to none');
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
            // Try subheader trigger first
            let trigger = this.symbolElement.closest('.subheader-dropdown-trigger');

            // If not found, try header nav container - use the full clickable area, not just the span
            if (!trigger) {
                // For header dropdown, use the #header-nav container which is the full clickable area
                trigger = document.getElementById('header-nav');
            }

            if (trigger) {
                const triggerRect = trigger.getBoundingClientRect();
                this.dropdownElement.style.position = 'fixed';
                this.dropdownElement.style.top = `${triggerRect.bottom}px`;
                this.dropdownElement.style.left = `${triggerRect.left}px`; // Align with trigger left edge
                this.dropdownElement.style.width = `${triggerRect.width}px`; // Match trigger width exactly
                console.log('🔄 Positioned dropdown to body at:', {
                    top: triggerRect.bottom,
                    left: triggerRect.left,
                    width: triggerRect.width,
                    triggerId: trigger.id || trigger.className
                });
            } else {
                console.warn('⚠️ positionDropdownToBody: Could not find trigger element for dropdown positioning');
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

// =================================================================
// ES MODULE EXPORT & BACKWARD COMPATIBILITY
// =================================================================

/**
 * ES module exports for modern code
 * Provides tree-shakeable access to components
 */
// BaseComponent and BaseNavigationDropdown are already exported above in their class definitions

/**
 * Global compatibility layer for legacy tools
 * Maintains backward compatibility during migration
 */
if (typeof window !== 'undefined') {
  // Make components globally available
  window.BaseComponent = BaseComponent;
  window.BaseNavigationDropdown = BaseNavigationDropdown;
}
