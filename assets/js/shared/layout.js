/**
 * Layout Components - SiteBoy Framework
 * 
 * COMPONENTS OWNED BY THIS FILE:
 * - PageContainer (main page layout with CSS variables)
 * - PageHeader (site header with navigation dropdown)
 * - Subheader (section subheader with precise widths)
 * - PageFooter (site footer component)
 * - Grid (gallery grid with shared borders)
 * - Spacing (spacing utility component)
 * 
 * DO NOT ADD DUPLICATES OF THESE COMPONENTS IN OTHER FILES!
 * This is the SINGLE SOURCE OF TRUTH for all page layout components.
 * Contains ALL the header/subheader fixes with mathematical precision.
 * 
 * USAGE PATTERN:
 * import { PageContainer, Grid } from './layout.js';
 * const container = new PageContainer({ navigationItems: [...] }, deps);
 * 
 * CRITICAL NOTES:
 * - PageContainer sets CSS variables for layout (--layout-width, --header-y, etc.)
 * - PageHeader uses layout.mainHeaderLeftWidth for precise calculations
 * - Subheader uses layout.subheaderTitleWidth for mathematical alignment
 * - Grid uses layout.cols, layout.boxSize for perfect square tiling
 * 
 * DEPENDENCIES:
 * - foundation.js (BaseComponent, BaseNavigationDropdown)
 * 
 * 📖 PLACEMENT GUIDE: See COMPONENT_PLACEMENT_GUIDE.md for component placement rules
 * 🚨 BEFORE ADDING: Check if component already exists and verify correct category
 */

import { BaseComponent, BaseNavigationDropdown } from './foundation.js';

/**
 * Spacing - Simple spacing component
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
 * Grid - Container-aware perfect square tiling grid component
 * 
 * Adapts reference perfect-grid mathematical logic to SiteBoy F-system:
 * - Container-aware sizing (measures actual container, not viewport)
 * - F=24px header system (--header-height) for captions
 * - Outline-based 1px separation (no space-taking borders)
 * - Responsive recalculation on resize
 * - Caption structure with interactive arrows
 */
export class Grid extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'grid' }, deps);
        this.items = options.items || [];
        this.cols = options.cols || null;
        this.onItemClick = options.onItemClick || null;
        this.onCaptionArrowClick = options.onCaptionArrowClick || null;
        this.fillEmptyCells = options.fillEmptyCells !== false;
        this.containerElement = null;
        this.resizeHandler = null;
        this.currentGeometry = null;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'gallery-grid');
            this.setupResponsiveHandling();
            
            // VISIBLE DEBUG - to verify this code is actually running
            this.element.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--vga-red); background: var(--vga-yellow); border: 3px solid var(--vga-red);">🚨 NEW GRID CODE LOADING 🚨</div>';
            this.element.style.cssText = 'border: 5px solid red; min-height: 100px;';
            
            // Schedule calculation for after DOM insertion with more delay
            setTimeout(() => {
                window.debugLog('LAYOUT', '🚨🚨🚨 NEW GRID CODE IS RUNNING 🚨🚨🚨');
                window.debugLog('LAYOUT', '🔧 Grid render timeout triggered');
                if (this.element && this.element.parentElement) {
                    window.debugLog('LAYOUT', '🔧 Grid has parent, calculating...');
                    this.calculateAndRender();
                    if (this.onItemClick || this.onCaptionArrowClick) {
                        this.bindEvents();
                    }
                    
                    // Start observing container changes
                    if (this.containerObserver && this.element.parentElement) {
                        this.containerObserver.observe(this.element.parentElement);
                    }
                } else {
                    window.debugLog('LAYOUT', '🚨 Grid render failed - no parent element');
                    this.element.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--vga-red);">❌ Grid failed to initialize</div>';
                }
            }, 100); // Increased delay
        }
        return this.element;
    }
    
    /**
     * Container-aware geometry calculation using getBoundingClientRect()
     * Translates reference perfect-grid logic to work with actual container size
     * More precise than offsetWidth as it accounts for padding/borders
     */
    calculateContainerAwareGeometry() {
        // Wait for element to be in DOM to measure container
        if (!this.element.parentElement) {
            // Fallback to MF calculation if not yet mounted
            const layout = this.deps.MF?.computeLayout() || {};
            return {
                cols: this.cols || layout.cols || 4,
                boxSize: layout.boxSize || 200,
                gridWidth: layout.gridWidth || 800,
                headerHeight: 28 // F=14px system (2*F)
            };
        }
        
        // FORCE: Measure the IMMEDIATE parent container only - no parent chain walking
        const immediateParent = this.element.parentElement;
        
        window.debugLog('LAYOUT', '🔧 CONTAINER TRACING:');
        window.debugLog('LAYOUT', `   Element: ${this.element.className}`);
        window.debugLog('LAYOUT', `   Immediate Parent: ${immediateParent?.tagName} class="${immediateParent?.className}" id="${immediateParent?.id}"`);
        
        // Walk up to see the container hierarchy
        let current = this.element;
        let level = 0;
        while (current && level < 6) {
            const rect = current.getBoundingClientRect();
            const computed = getComputedStyle(current);
            window.debugLog('LAYOUT', `   Level ${level}: ${current.tagName}${current.id ? '#' + current.id : ''}${current.className ? '.' + current.className.split(' ').join('.') : ''} → ${Math.round(rect.width)}px (computed: ${computed.width})`);
            current = current.parentElement;
            level++;
        }
        
        // Use immediate parent as the container to measure - works for any container size
        const targetContainer = immediateParent;
        
        // CRITICAL: Wait for the element to be actually rendered before measuring
        if (!targetContainer || targetContainer.getBoundingClientRect().width === 0) {
            // Element not yet in DOM or not rendered, use fallback
            return {
                cols: 2,
                boxSize: 200,
                gridWidth: 400,
                headerHeight: 24
            };
        }
        
        // Use the found target container (46F container) instead of immediate parent
        const containerToMeasure = targetContainer || immediateParent;
        window.debugLog('LAYOUT', `🎯 Using container: ${containerToMeasure.tagName}${containerToMeasure.id ? '#' + containerToMeasure.id : ''} for measurement`);
        
        const parentRect = containerToMeasure.getBoundingClientRect();
        const parentStyle = getComputedStyle(containerToMeasure);
        
        // Calculate ONLY the immediate parent's content area
        const paddingLeft = parseFloat(parentStyle.paddingLeft) || 0;
        const paddingRight = parseFloat(parentStyle.paddingRight) || 0;
        const borderLeft = parseFloat(parentStyle.borderLeftWidth) || 0;
        const borderRight = parseFloat(parentStyle.borderRightWidth) || 0;
        
        // This is the EXACT space inside the immediate parent container
        const availableWidth = Math.floor(parentRect.width - paddingLeft - paddingRight - borderLeft - borderRight);
        const containerWidth = parentRect.width;
        
        // Get F-system constants from CSS
        const rootStyle = getComputedStyle(document.documentElement);
        const headerHeight = parseInt(rootStyle.getPropertyValue('--header-height')) || 24; // 2*F
        
        // F-SYSTEM MATHEMATICAL PRECISION - F divisible sizing (1,2,3,4,6,12,24,36...)
        
        // Universal F-based grid calculations - adapts to ANY container width
        // Uses F-system mathematical breakpoints for optimal column selection
        // Use the proper mathematical equation for column calculation
        let cols = this.cols;
        if (!cols) {
            // Use your elegant mathematical equation
            cols = this.calculateColumns(availableWidth, availableWidth);
            window.debugLog('LAYOUT', `🔧 Mathematical equation: ${cols} cols for ${availableWidth}px (3.982 * 1.0 - 1.088 = ${3.982 * 1.0 - 1.088})`);
        }
        
        const gap = 1; // 1px gap like reference (not F-based, this is outline)
        
        // UNIVERSAL F-BASED BOX SIZE CALCULATION - fits ANY container
        const totalGaps = (cols - 1) * gap;
        const boxSize = Math.floor((availableWidth - totalGaps) / cols);
        const gridWidth = boxSize * cols + totalGaps;
        
        window.debugLog('LAYOUT', `🔧 Universal calculation: ${cols} × ${boxSize}px + ${totalGaps}px gaps = ${gridWidth}px (fits in ${availableWidth}px)`);
        
        // Verify mathematical precision - should never overflow
        if (gridWidth > availableWidth) {
            window.debugLog('LAYOUT', `🚨 MATH ERROR: ${gridWidth}px > ${availableWidth}px - this should never happen`);
        }
        
        const marginLeft = 0;
        const marginRight = 0;
        
        return {
            cols,
            boxSize: boxSize,
            gridWidth,
            marginLeft,
            marginRight,
            headerHeight, // F=24px consistent with header system
            availableWidth,
            containerWidth
        };
    }
    
    /**
     * Calculate responsive columns based on aspect ratio
     * Uses same mathematical constants as reference but with fallback to MF
     */
    calculateColumns(width, height) {
        if (this.deps.MF?.computeColumns) {
            return this.deps.MF.computeColumns(width, height);
        }
        
        // Fallback calculation using reference constants
        const aspect = width / height;
        const aspectMultiplier = 3.982; // Reference empirical values
        const aspectOffset = 1.088;
        const minCols = 1, maxCols = 6;
        
        return Math.max(minCols, Math.min(maxCols, 
            Math.round(aspectMultiplier * aspect - aspectOffset)
        ));
    }
    
    /**
     * Calculate and render grid with current geometry
     */
    calculateAndRender() {
        this.currentGeometry = this.calculateContainerAwareGeometry();
        const { cols, boxSize, gridWidth, headerHeight, availableWidth, containerWidth } = this.currentGeometry;
        
        // Debug logging to understand sizing issues - DETAILED CONTAINER ANALYSIS
        if (window.location.hash.includes('ui-test')) {
            window.debugLog('LAYOUT', '🔧 Grid Container Debug - MEASURING ISSUE ANALYSIS:');
            window.debugLog('LAYOUT', `   📏 Measured Container Width: ${containerWidth}px`);
            window.debugLog('LAYOUT', `   📐 Calculated Available Width: ${availableWidth}px`);
            window.debugLog('LAYOUT', `   📊 Calculated Columns: ${cols}`);
            window.debugLog('LAYOUT', `   📦 Calculated Box Size: ${boxSize}px`);
            window.debugLog('LAYOUT', `   📏 Calculated Grid Width: ${gridWidth}px`);
            window.debugLog('LAYOUT', `   📋 Immediate Parent ID: ${this.element.parentElement?.id || 'no-id'}`);
            
            // Walk up the container chain to see what we're measuring vs what we should measure
            let current = this.element.parentElement;
            let level = 0;
            while (current && level < 5) {
                const rect = current.getBoundingClientRect();
                const style = getComputedStyle(current);
                const computedWidth = parseFloat(style.width);
                window.debugLog('LAYOUT', `   🔗 Parent ${level}: ${current.tagName}${current.id ? '#' + current.id : ''} = Rect:${Math.round(rect.width)}px | Computed:${computedWidth || 'auto'}px | Padding:${style.padding}`);
                current = current.parentElement;
                level++;
            }
            
            // VERIFY: Are we measuring the immediate parent correctly?
            const immediateParent = this.element.parentElement;
            if (!immediateParent) {
                window.debugLog('LAYOUT', '   🚨 ERROR: Grid element has no parent - cannot measure container');
                return;
            }
            const immediateMeasurement = immediateParent.getBoundingClientRect();
            const immediateStyle = getComputedStyle(immediateParent);
            const immediateInnerWidth = immediateMeasurement.width - 
                parseFloat(immediateStyle.paddingLeft) - 
                parseFloat(immediateStyle.paddingRight) - 
                parseFloat(immediateStyle.borderLeftWidth) - 
                parseFloat(immediateStyle.borderRightWidth);
            
            window.debugLog('LAYOUT', `   🎯 IMMEDIATE PARENT (${immediateParent.tagName}${immediateParent.id ? '#' + immediateParent.id : ''}):`);
            window.debugLog('LAYOUT', `      Total: ${immediateMeasurement.width}px`);
            window.debugLog('LAYOUT', `      Inner: ${immediateInnerWidth}px (after padding/borders)`);
            window.debugLog('LAYOUT', `      Used:  ${availableWidth}px (what we calculated)`);
            window.debugLog('LAYOUT', `   ⚠️  FINAL CHECK: Grid ${gridWidth}px ${gridWidth > immediateInnerWidth ? 'OVERFLOWS' : 'FITS'} in ${immediateInnerWidth}px available space`);
            
            // Show if we're using the right measurement
            if (Math.abs(availableWidth - immediateInnerWidth) > 1) {
                window.debugLog('LAYOUT', `   🚨 CALCULATION ERROR: Expected ${immediateInnerWidth}px but calculated ${availableWidth}px`);
            }
        }
        
        // Generate grid content
        this.element.innerHTML = this.generateGridHTML(cols, boxSize, headerHeight);
        
        // Apply CSS Grid layout with outline-based separation (not borders)
        // NO CSS MEDDLING - calculate correctly from the start
        this.element.style.cssText = `
            display: grid;
            grid-template-columns: repeat(${cols}, ${boxSize}px);
            gap: 1px;
            width: ${gridWidth}px;
            margin: 0 auto;
            position: relative;
            box-sizing: border-box;
        `;
    }
    
    /**
     * Generate grid HTML with F=24px caption system and interactive arrows
     */
    generateGridHTML(cols, boxSize, headerHeight) {
        const items = this.items.map((item, i) => this.itemHTML(item, i, boxSize, headerHeight)).join('');
        const empties = this.fillEmptyCells ? this.emptyHTML(cols, boxSize, headerHeight) : '';
        return items + empties;
    }
    
    /**
     * Generate individual grid item with reference-style caption structure
     * Translated to F-system: 28px captions, proper typography, outline separation
     */
    itemHTML(item, index, boxSize, headerHeight) {
        const isObject = typeof item === 'object';
        const title = isObject ? (item.title || item.alt || item.caption || '') : '';
        const caption = isObject ? (item.caption || item.title || '') : String(item);
        
        // Content area (image or placeholder)
        const content = isObject && item.image ? 
            `<img src="${item.image}" alt="${title}" style="max-width:100%;max-height:100%;object-fit:contain">` :
            `<div class="grid-content">${isObject ? (item.placeholder || item.text || caption) : caption}</div>`;
        
        // Caption structure matching reference with F=24px system
        const captionHTML = `
            <div class="grid-caption" style="height:${headerHeight}px">
                <span class="caption-text">${caption}</span>
                <div class="caption-icon" data-index="${index}" style="width:${headerHeight}px;height:${headerHeight}px">&gt;</div>
            </div>
        `;
        
        // Grid item with outline separation (not border - key difference from broken implementation)
        return `
            <div class="gallery-item" data-index="${index}" 
                 style="width:${boxSize}px;height:${boxSize}px;outline:1px solid var(--c-border);background:var(--c-bg);display:flex;flex-direction:column;position:relative;z-index:1;transition:outline-color 0.2s ease">
                <div class="grid-item-content" style="flex:1;display:flex;align-items:center;justify-content:center;padding:calc(var(--f)/2)">
                ${content}
            </div>
                ${captionHTML}
            </div>
        `;
    }
    
    /**
     * Generate empty cells to complete grid rows
     */
    emptyHTML(cols, boxSize, headerHeight) {
        const totalItems = this.items.length;
        const fullRows = Math.ceil(totalItems / cols);
        const totalCells = fullRows * cols;
        const empties = totalCells - totalItems;
        
        return Array(empties).fill().map((_, i) => 
            `<div class="gallery-empty" style="width:${boxSize}px;height:${boxSize}px;outline:1px solid var(--c-border);background:var(--c-bg)"></div>`
        ).join('');
    }
    
    /**
     * Bind click events for both items and caption arrows
     * Supports separate handlers for content vs arrow clicks
     */
    bindEvents() {
        this.element.addEventListener('click', (e) => {
            const arrow = e.target.closest('.caption-icon');
            const item = e.target.closest('.gallery-item');
            
            if (arrow && this.onCaptionArrowClick) {
                // Handle arrow clicks separately
                const index = parseInt(arrow.dataset.index);
                e.stopPropagation();
                this.onCaptionArrowClick(this.items[index], index, arrow);
            } else if (item && this.onItemClick) {
                // Handle general item clicks
                const index = parseInt(item.dataset.index);
                this.onItemClick(this.items[index], index, item);
            }
        });
    }
    
    /**
     * Setup responsive handling with debounced recalculation
     * Ensures grid adapts to container changes and window resizes
     */
    setupResponsiveHandling() {
        let resizeTimer;
        this.resizeHandler = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (this.element && this.element.parentElement) {
                    // Force recalculation on resize
                    this.currentGeometry = null;
                    this.calculateAndRender();
                    if (this.onItemClick || this.onCaptionArrowClick) {
                        this.bindEvents();
                    }
                }
            }, 100); // Debounce like reference
        };
        
        // Listen to both window resize and container changes
        window.addEventListener('resize', this.resizeHandler);
        
        // Also set up observer for container size changes
        if (window.ResizeObserver) {
            this.containerObserver = new ResizeObserver(() => {
                this.resizeHandler();
            });
        }
    }
    
    /**
     * Force recalculation (useful for dynamic content changes)
     */
    recalculate() {
        if (this.element) {
            this.calculateAndRender();
        }
    }
    
    /**
     * Clean up responsive handlers
     */
    destroy() {
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }
        if (this.containerObserver) {
            this.containerObserver.disconnect();
            this.containerObserver = null;
        }
        super.destroy();
    }
}

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
        this.marginOverride = null; // explicit margin override (px) or null for auto
    }
    
    render() {
        if (!this.element) {
            this.dimensions = this.calculateDimensions('page');
            const layout = this.dimensions?.layout || this.deps.MF?.computeLayout() || {};
            const F = this.dimensions?.F || this.deps.MF?.F || 14;
            
            // Create wrapper with full viewport
            this.element = this.createElement('div');
            this.element.id = 'wrapper';
            this.element.style.cssText = `
                position: relative; width: 100%; min-height: 100vh; background: var(--c-bg);
                box-sizing: border-box;
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
            window.Subheader = this.subheaderComponent;

            // Create content container
            const container = this.createElement('div', 'content-container');
            container.id = 'container';
            // Base styles — top/bottom/left/width/borders are set by setSubheaderState per route
            container.style.cssText = `
                position: fixed;
                background: var(--c-bg);
                box-sizing: border-box;
                z-index: 100;
            `;
            this.contentBody = container;
            document.body.appendChild(container);

            // Create footer
            this.footerComponent = new PageFooter({
                onMarginChange: (value) => this.setMarginMode(value),
                getMarginOverride: () => this.marginOverride,
                getMargins: () => this.lastMargins || {}
            }, this.deps);
            const footerEl = this.footerComponent.render();
            document.body.appendChild(footerEl);

            // Set initial layout state (no subheader by default)
            this.setSubheaderState(false);
            
            // Subscribe to resize
            this.subscribeToResize();
            // Fallback window resize listener to keep layout responsive without ResizeManager
            this.windowResizeHandler = () => this.onResize();
            window.addEventListener('resize', this.windowResizeHandler);
        }
        return this.element;
    }
    
    /**
     * Create curtains for proper page margins (restored from original)
     */
    createCurtains() {
        // Curtains removed per request; margins are handled by layout vars
    }
    
    /**
     * Apply deterministic layout calculations - single F-snapped frame for all components
     * Uses the new B/S margin system with simple 50% header/subheader splits
     */
    applyLayoutGuideCalculations() {
        if (!this.deps.MF) {
            console.warn('PageContainer: MathematicalFoundation not available for layout calculations');
            return;
        }

        // SINGLE CALL TO DETERMINISTIC SYSTEM - no complex calculations here
        const layout = this.deps.MF.computeLayout();
        const margin = this.deps.MF.Config?.margin || layout.marginLeft; // Use the single margin value

        window.debugLog('LAYOUT', `📐 PageContainer: Applying deterministic layout (margin=${margin}px, frame=${layout.frameWidth}px)`);

        // Cache current margins for footer controls (B/S system)
        this.lastMargins = {
            desktop: this.deps.MF.Config?.margin || 48,  // Default 4F
            mobile: this.deps.MF.Config?.margin || 24     // Same as desktop in new system
        };

        // SET ALL LAYOUT VARIABLES FROM THE SINGLE COMPUTE CALL
        this.setLayoutVariables({
            '--layout-width': `${layout.frameWidth}px`,
            '--layout-margin': `${layout.marginLeft}px`,
            '--header-y': `${margin}px`,
            '--subheader-y': `${margin + layout.headerHeight}px`,
            '--content-y-with-sub': `${margin + (2 * layout.headerHeight) - 1}px`,
            '--content-y-no-sub': `${margin + layout.headerHeight}px`,
            '--footer-y': `${window.innerHeight - layout.headerHeight - margin}px`,
            '--footer-offset': `${margin}px`,
            // Header splits - simple 50%
            '--header-left-width': `${layout.mainHeaderLeftWidth}px`,
            '--header-nav-width': `${layout.mainHeaderNavWidth}px`,
            '--header-toggle-width': `${layout.mainHeaderToggleWidth}px`,
            // Subheader splits - mirrors header exactly
            '--subheader-title-width': `${layout.subheaderTitleWidth}px`,
            '--subheader-nav-width': `${layout.subheaderNavContainerWidth}px`,
            '--subheader-prev-width': `${layout.subheaderPrevButtonWidth}px`,
            '--subheader-next-width': `${layout.subheaderNextButtonWidth}px`,
            // Content heights - frameHeight - 6F (header + subheader + footer) or frameHeight - 4F (no subheader), snapped to F multiples
            '--content-height-with-sub': `${Math.floor((layout.frameHeight - (6 * this.deps.MF.F)) / this.deps.MF.F) * this.deps.MF.F}px`,
            '--content-height-no-sub': `${Math.floor((layout.frameHeight - (4 * this.deps.MF.F)) / this.deps.MF.F) * this.deps.MF.F}px`,
            '--content-min-h-with-sub': `calc(100vh - ${2 * margin + 6 * this.deps.MF.F}px)`,
            '--content-min-h-no-sub': `calc(100vh - ${2 * margin + 4 * this.deps.MF.F}px)`,
            '--layout-type': 'deterministic' // Always deterministic in new system
        });

        window.debugLog('LAYOUT', '✅ PageContainer: Deterministic layout applied');
        window.debugLog('VERBOSE', '📐 Layout debug:', {
            frameWidth: layout.frameWidth,
            margin: margin,
            headerLeft: layout.mainHeaderLeftWidth,
            headerNav: layout.mainHeaderNavWidth,
            headerToggle: layout.mainHeaderToggleWidth
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
     * Set subheader state and apply corresponding layout to the content container.
     * Three modes (checked in priority order):
     *   1. home-mode  — full-bleed, no chrome visible, centred flex container
     *   2. full-mode  — margined with top/bottom borders (tool embedding)
     *   3. normal     — framed under header/subheader/footer
     * @param {boolean} hasSubheader
     */
    setSubheaderState(hasSubheader) {
        const isHomeMode   = document.body.classList.contains('home-mode');
        const isFullMode   = document.body.classList.contains('full-mode');

        if (hasSubheader) {
            document.body.classList.add('has-subheader');
            document.body.classList.remove('no-subheader');
            this.subheaderComponent?.show();
        } else {
            document.body.classList.add('no-subheader');
            document.body.classList.remove('has-subheader');
            this.subheaderComponent?.hide();
        }

        if (!this.contentBody) return;

        const isToolPage = document.body.classList.contains('tool-page');

        const layout     = this.deps.MF?.computeLayout() || {};
        const margin     = this.deps.MF?.Config?.margin || layout.marginLeft || 14;
        const headerH    = layout.headerHeight || 28;
        const noFooter   = document.body.classList.contains('tools-section') ||
                           document.body.classList.contains('projects-section');
        const frameWidth = layout.frameWidth || (window.innerWidth - 2 * margin);
        const marginLeft = layout.marginLeft  || margin;

        if (isHomeMode) {
            // Hide header, subheader, footer — same pattern as subheader.hide()
            this.headerComponent?.hide();
            this.subheaderComponent?.hide();
            this.footerComponent?.hide();

            // Full-bleed container — block flow so overflow:auto scrolls correctly.
            // Centering is handled by the home-section child div (min-height:100%, flex).
            this.contentBody.style.top          = `${margin}px`;
            this.contentBody.style.bottom       = `${margin}px`;
            this.contentBody.style.left         = `${marginLeft}px`;
            this.contentBody.style.width        = `${frameWidth}px`;
            this.contentBody.style.height       = 'auto';
            this.contentBody.style.padding      = '0';
            this.contentBody.style.overflow     = 'auto';
            this.contentBody.style.overflowY    = '';
            this.contentBody.style.display      = '';
            this.contentBody.style.alignItems   = '';
            this.contentBody.style.justifyContent = '';
            this.contentBody.style.borderTop    = '1px solid var(--c-border)';
            this.contentBody.style.borderBottom = '1px solid var(--c-border)';
            this.contentBody.style.borderLeft   = '1px solid var(--c-border)';
            this.contentBody.style.borderRight  = '1px solid var(--c-border)';
        } else if (isFullMode) {
            // Restore header/footer in case we came from home
            this.headerComponent?.show();
            this.footerComponent?.show();

            // Tool-embedding full mode — margined, with borders, header/footer hidden via CSS
            this.contentBody.style.top          = `${margin}px`;
            this.contentBody.style.bottom       = `${margin}px`;
            this.contentBody.style.left         = `${marginLeft}px`;
            this.contentBody.style.width        = `${frameWidth}px`;
            this.contentBody.style.height       = 'auto';
            const isToolContentFull = isToolPage || this.contentBody.classList.contains('tool-viewport');
            this.contentBody.style.padding      = isToolContentFull ? '0' : '';
            this.contentBody.style.overflow     = isToolContentFull ? 'hidden' : '';
            this.contentBody.style.overflowY    = isToolContentFull ? 'hidden' : 'auto';
            this.contentBody.style.minHeight    = isToolContentFull ? '0' : '';
            this.contentBody.style.maxHeight    = isToolContentFull ? 'none' : '';
            this.contentBody.style.display      = '';
            this.contentBody.style.alignItems   = '';
            this.contentBody.style.justifyContent = '';
            this.contentBody.style.borderTop    = '1px solid var(--c-border)';
            this.contentBody.style.borderBottom = '1px solid var(--c-border)';
            this.contentBody.style.borderLeft   = '1px solid var(--c-border)';
            this.contentBody.style.borderRight  = '1px solid var(--c-border)';
        } else {
            // Restore header/footer in case we came from home
            this.headerComponent?.show();
            this.footerComponent?.show();

            // Normal framed mode — under header, subheader, footer
            const contentTop = hasSubheader
                ? margin + (2 * headerH) - 1
                : margin + headerH;
            const bottomOffset = noFooter ? margin : headerH + margin;

            this.contentBody.style.top          = `${contentTop}px`;
            this.contentBody.style.bottom       = `${bottomOffset}px`;
            this.contentBody.style.left         = `${marginLeft}px`;
            this.contentBody.style.width        = `${frameWidth}px`;
            this.contentBody.style.height       = 'auto';
            const isToolContent = isToolPage || this.contentBody.classList.contains('tool-viewport');
            this.contentBody.style.padding      = isToolContent ? '0' : `calc(var(--f) * 4)`;
            this.contentBody.style.minHeight    = isToolContent ? '0' : '';
            this.contentBody.style.maxHeight    = isToolContent ? 'none' : '';
            this.contentBody.style.overflow     = isToolContent ? 'hidden' : '';
            this.contentBody.style.overflowY    = isToolContent ? 'hidden' : 'auto';
            this.contentBody.style.display      = '';
            this.contentBody.style.alignItems   = '';
            this.contentBody.style.justifyContent = '';
            this.contentBody.style.borderTop    = 'none';
            this.contentBody.style.borderBottom = noFooter ? '1px solid var(--c-border)' : 'none';
            this.contentBody.style.borderLeft   = '1px solid var(--c-border)';
            this.contentBody.style.borderRight  = '1px solid var(--c-border)';
        }

        const modeLabel = isHomeMode ? 'home' : isFullMode ? 'full' : 'normal';
        window.debugLog('LAYOUT', `📐 Container: ${modeLabel}, sub=${hasSubheader}`);
    }
    
    /**
     * Set margin mode (B=big frame/small margins, S=small frame/large margins) - replaces old override system
     */
    setMarginMode(mode) {
        if (!window.Config?.setMarginMode) return;

        window.Config.setMarginMode(mode);

        // Refresh CSS vars to reflect new margin mode
        if (this.deps.MF?.initializeCSSVars) {
            this.deps.MF.initializeCSSVars();
        }

        this.applyLayoutGuideCalculations();
        if (this.footerComponent?.updateMarginDisplay) {
            this.footerComponent.updateMarginDisplay(mode);
        }
        // Propagate layout change to header/subheader
        this.headerComponent?.onResize?.();
        this.subheaderComponent?.onResize?.();
        window.dispatchEvent(new Event('resize'));
    }

    /**
     * Legacy method for backward compatibility - now uses B/S system
     */
    setMarginOverride(value = null) {
        // Convert old px override to closest B/S mode
        if (value === null) {
            this.setMarginMode(DEFAULT_MARGIN_MODE); // Default to configured mode
        } else {
            const F = window.Config?.F || 14;
            const bMargin = F * 1; // B mode: 1F (big frame)
            const sMargin = F * 4; // S mode: 4F (small frame)
            this.setMarginMode(Math.abs(value - bMargin) < Math.abs(value - sMargin) ? 'B' : 'S');
        }
    }
    
    /**
     * Handle resize event - recalculate layout
     */
    onResize() {
        this.applyLayoutGuideCalculations();
        // Re-apply full container positioning for current mode
        const hasSubheader = document.body.classList.contains('has-subheader');
        this.setSubheaderState(hasSubheader);
        window.debugLog('LAYOUT', '📐 PageContainer: Layout recalculated for new viewport size');
    }
    
    getContentContainer() {
        return this.contentBody;
    }
    
    destroy() {
        if (this.headerComponent) this.headerComponent.destroy();
        if (this.subheaderComponent) this.subheaderComponent.destroy();
        if (this.footerComponent) this.footerComponent.destroy();
        // Clean up content container like header/footer
        if (this.contentBody && this.contentBody.parentNode) {
            this.contentBody.parentNode.removeChild(this.contentBody);
        }
        if (this.windowResizeHandler) {
            window.removeEventListener('resize', this.windowResizeHandler);
            this.windowResizeHandler = null;
        }
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

    getLayoutFromVars() {
        const fallback = this.deps.MF ? this.deps.MF.computeLayout() : {};
        const root = getComputedStyle(document.documentElement);
        const num = (name, fb) => {
            const v = parseInt(root.getPropertyValue(name), 10);
            return Number.isFinite(v) ? v : fb;
        };
        return {
            mainHeaderLeftWidth: num('--header-left-width', fallback.mainHeaderLeftWidth || 0),
            mainHeaderNavWidth: num('--header-nav-width', fallback.mainHeaderNavWidth || 0),
            mainHeaderToggleWidth: num('--header-toggle-width', fallback.mainHeaderToggleWidth || 0)
        };
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('header', 'page-header');
            this.element.id = 'header';
            this.element.style.cssText = `
                position: fixed;
                top: var(--header-y);
                left: var(--layout-margin);
                width: var(--layout-width);
                height: var(--header-height);
                background: var(--c-bg);
                border: 1px solid var(--c-border);
                box-sizing: border-box;
                z-index: 200;
                display: flex;
                font-family: 'Atkinson Hyperlegible Mono', monospace;
                font-size: var(--f);
            `;

            const homeLink = this.createElement('div', 'header-item');
            homeLink.id = 'home-link';
            homeLink.textContent = 'AEINODER';
            homeLink.style.cssText = `
                position: absolute;
                left: 0;
                top: 0;
                width: var(--header-left-width);
                height: 100%;
                display: flex;
                align-items: center;
                padding: 0 var(--f);
                text-transform: uppercase;
                border-right: 1px solid var(--c-border);
                box-sizing: border-box;
                cursor: pointer;
                font-family: 'Atkinson Hyperlegible Mono', monospace;
                font-weight: 400;
            `;

            if (this.onNavigate) {
                this._homeHandler = () => this.onNavigate({ title: 'HOME' });
                homeLink.addEventListener('click', this._homeHandler);
                homeLink.classList.add('clickable');
            }

            this.element.appendChild(homeLink);
            
            // Navigation area - BORDER BETWEEN NAV AND TOGGLE
            // Unlike subheader, header needs separation between functional areas
            // Nav gets border-right to separate from toggle button
            const navContainer = this.createElement('div', 'header-nav');
            navContainer.id = 'header-nav';
            navContainer.style.cssText = `
                position: absolute;
                left: var(--header-left-width);
                top: 0;
                width: var(--header-nav-width);
                height: 100%;
                display: flex;
                align-items: center;
                padding: 0 var(--f);
                text-transform: uppercase;
                border-right: 1px solid var(--c-border);
                box-sizing: border-box;
                cursor: pointer;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                font-family: 'Atkinson Hyperlegible Mono', monospace;
            `;

            const navText = this.createElement('span');
            navText.textContent = 'SECTIONS';
            const menuSymbol = this.createElement('span');
            menuSymbol.id = 'menu-symbol';
            menuSymbol.style.cssText = `margin-left: 2px; line-height: 1; display: inline-block;`;
            menuSymbol.textContent = '+';

            navContainer.appendChild(navText);
            navContainer.appendChild(menuSymbol);
            this.element.appendChild(navContainer);

            // Create reusable navigation dropdown
            this.navigationDropdown = new BaseNavigationDropdown({
                items: this.navigationItems,
                onItemClick: (item) => {
                    if (this.onNavigate && item.onClick) {
                        item.onClick();
                    }
                }
            }, this.deps);

            // Navigation dropdown positioning
            const dropdownMenu = this.navigationDropdown.createDropdownStructure('dropdown-menu', {
                zIndex: 210 // Higher than header z-index of 200
            });

            dropdownMenu.style.position = 'fixed';
            dropdownMenu.style.top = 'auto';
            dropdownMenu.style.left = 'auto';
            dropdownMenu.style.width = 'var(--header-nav-width)';

            // Attach dropdown to document.body for consistent timing with subheader
            document.body.appendChild(dropdownMenu);

            // Set symbol element for toggle functionality
            this.navigationDropdown.setSymbolElement(menuSymbol);

            // Populate dropdown with navigation items
            this.navigationDropdown.populateDropdown(this.navigationItems);

            const headerToggle = this.createElement('div', 'header-toggle');
            headerToggle.id = 'header-toggle';
            headerToggle.textContent = this.getThemeIcon();
            headerToggle.style.cssText = `
                position: absolute;
                right: 0;
                top: 0;
                width: var(--header-toggle-width);
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
                cursor: pointer;
                line-height: 1;
                font-family: 'Atkinson Hyperlegible Mono', monospace;
            `;

            this._toggleHandler = () => this.toggleTheme();
            headerToggle.addEventListener('click', this._toggleHandler);
            headerToggle.classList.add('clickable');

            this.element.appendChild(headerToggle);
            
            // Set symbol element for toggle functionality
            this.navigationDropdown.setSymbolElement(menuSymbol);
            
            // Add toggle functionality
            navContainer.addEventListener('click', () => {
                this.navigationDropdown.toggle();
            });
            
            // Setup click outside functionality
            this.navigationDropdown.setupClickOutside(navContainer);

            this.subscribeToResize();
            this.windowResizeHandler = () => this.onResize();
            window.addEventListener('resize', this.windowResizeHandler);
        }
        return this.element;
    }
    
    onResize() {
        if (this.navigationDropdown?.isOpen) {
            this.navigationDropdown.positionDropdownToBody();
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

    show() {
        if (this.element) this.element.style.display = '';
    }

    hide() {
        if (this.element) this.element.style.display = 'none';
    }

    destroy() {
        if (this.windowResizeHandler) {
            window.removeEventListener('resize', this.windowResizeHandler);
            this.windowResizeHandler = null;
        }
        super.destroy();
    }
}

/**
 * PageFooter - Site footer component
 */
export class PageFooter extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'footer' }, deps);
        this.onMarginChange = options.onMarginChange || null;
        this.getMarginMode = () => window.Config?.marginMode || 'S';
        this.getMargins = options.getMargins || (() => ({
            desktop: (window.Config?.F || 14) * 4,  // 4F for S mode
            mobile: (window.Config?.F || 14) * 2    // 2F for B mode
        }));
        this.marginMode = this.getMarginMode() || DEFAULT_MARGIN_MODE;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('footer', 'page-footer');
            this.element.id = 'footer';

            const F = this.deps?.MF?.F || 14;
            const showBackToTop     = window.Config?.showBackToTop    !== false;
            const showFooterControls = window.Config?.showFooterControls !== false;
            const hasControls = showFooterControls;

            // Slot count drives equal-width absolute positioning
            const itemCount = (showBackToTop ? 1 : 0) + 2 + (hasControls ? 1 : 0);
            const itemWidth = 100 / itemCount; // % per slot

            // Initialize control element variables
            let fDisplay = null;
            let tightButton = null;
            let looseButton = null;

            // Running slot index — each rendered item claims the next slot
            let slotIndex = 0;

            // Back to top button (conditional)
            if (showBackToTop) {
                const backToTop = this.createElement('div', 'footer-item');
                backToTop.id = 'back-to-top';
                backToTop.textContent = '↑ TOP';
                backToTop.style.cssText = `
                    position: absolute; top: 0; left: ${slotIndex * itemWidth}%; height: 100%; width: ${itemWidth}%;
                    display: flex; align-items: center; justify-content: center;
                    text-transform: uppercase; font-size: ${F}px;
                    box-sizing: border-box; cursor: pointer;
                `;
                backToTop.addEventListener('click', () => {
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                });
                backToTop.classList.add('clickable');
                this.element.appendChild(backToTop);
                slotIndex++;
            }

            // Instagram link
            const instagramLink = this.createElement('a', 'footer-item');
            instagramLink.href = 'https://www.instagram.com/a.einoder/';
            instagramLink.target = '_blank';
            instagramLink.textContent = '@A.EINODER';
            instagramLink.style.cssText = `
                position: absolute; top: 0; left: ${slotIndex * itemWidth}%; height: 100%; width: ${itemWidth}%;
                display: flex; align-items: center; justify-content: center;
                text-transform: uppercase; font-size: ${F}px; text-decoration: none; color: inherit;
                ${slotIndex > 0 ? 'border-left: 1px solid var(--c-border);' : ''} box-sizing: border-box; cursor: pointer;
            `;
            instagramLink.classList.add('clickable');
            this.element.appendChild(instagramLink);
            slotIndex++;

            // Contact link
            const contactLink = this.createElement('a', 'footer-item');
            contactLink.href = '#contact';
            contactLink.textContent = 'CONTACT';
            contactLink.style.cssText = `
                position: absolute; top: 0; left: ${slotIndex * itemWidth}%; height: 100%; width: ${itemWidth}%;
                display: flex; align-items: center; justify-content: center;
                text-transform: uppercase; font-size: ${F}px; text-decoration: none; color: inherit;
                border-left: 1px solid var(--c-border); box-sizing: border-box; cursor: pointer;
            `;
            contactLink.classList.add('clickable');
            this.element.appendChild(contactLink);
            slotIndex++;

            // F Controller Container (conditional)
            let fControllerContainer = null;
            if (hasControls) {
                fControllerContainer = this.createElement('div', 'footer-item f-controller-container');
                fControllerContainer.style.cssText = `
                    position: absolute; top: 0; left: ${slotIndex * itemWidth}%; height: 100%; width: ${itemWidth}%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: ${F}px; font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
                    border-left: 1px solid var(--c-border); box-sizing: border-box;
                `;

                const controlElements = [];

                if (showFooterControls) {
                    // Plus button
                    const plusButton = this.createElement('button', 'f-control-btn f-plus');
                    plusButton.textContent = '+';
                    plusButton.title = 'Increase F by 1';
                    plusButton.style.cssText = `
                        flex: 1; height: 100%; border: none; background: transparent;
                        color: inherit; font-family: inherit; font-size: inherit;
                        cursor: pointer; border-right: 1px solid var(--c-border);
                        display: flex; align-items: center; justify-content: center;
                    `;
                    plusButton.addEventListener('click', () => this.adjustF(1));
                    controlElements.push(plusButton);

                    // F display/input
                    const fDisplay = this.createElement('div', 'f-display');
                    fDisplay.style.cssText = `
                        flex: 2; height: 100%; background: transparent;
                        color: inherit; font-family: inherit; font-size: inherit;
                        border: none; border-right: 1px solid var(--c-border);
                        display: flex; align-items: center; justify-content: center;
                        cursor: pointer; user-select: none;
                    `;
                    fDisplay.textContent = `F=${F}`;
                    fDisplay.title = 'Click to edit F value directly';
                    fDisplay.addEventListener('click', () => this.showFInput(fDisplay));
                    controlElements.push(fDisplay);

                    // Minus button
                    const minusButton = this.createElement('button', 'f-control-btn f-minus');
                    minusButton.textContent = '-';
                    minusButton.title = 'Decrease F by 1';
                    minusButton.style.cssText = `
                        flex: 1; height: 100%; border: none; background: transparent;
                        color: inherit; font-family: inherit; font-size: inherit;
                        cursor: pointer; display: flex; align-items: center; justify-content: center;
                    `;
                    minusButton.addEventListener('click', () => this.adjustF(-1));
                    controlElements.push(minusButton);
                }

                if (showFooterControls) {
                    // Big frame (B) button
                    const tightButton = this.createElement('button', 'f-control-btn margin-b');
                    tightButton.textContent = 'B';
                    tightButton.title = 'Big frame (1F margins)';
                    tightButton.style.cssText = `
                        flex: 1; height: 100%; border: none; background: transparent;
                        color: inherit; font-family: inherit; font-size: inherit;
                        cursor: pointer; border-left: 1px solid var(--c-border);
                        display: flex; align-items: center; justify-content: center;
                    `;
                    tightButton.addEventListener('click', () => this.setMargin('B'));
                    controlElements.push(tightButton);

                    // Small frame (S) button
                    const looseButton = this.createElement('button', 'f-control-btn margin-s');
                    looseButton.textContent = 'S';
                    looseButton.title = 'Small frame (4F margins)';
                    looseButton.style.cssText = `
                        flex: 1; height: 100%; border: none; background: transparent;
                        color: inherit; font-family: inherit; font-size: inherit;
                        cursor: pointer; display: flex; align-items: center; justify-content: center;
                    `;
                    looseButton.addEventListener('click', () => this.setMargin('S'));
                    controlElements.push(looseButton);
                }

                // Add hover effects to all control elements
                controlElements.forEach(btn => {
                    btn.addEventListener('mouseenter', () => {
                        btn.style.background = 'var(--c-accent)';
                        btn.style.color = 'var(--c-bg)';
                    });
                    btn.addEventListener('mouseleave', () => {
                        btn.style.background = 'transparent';
                        btn.style.color = 'inherit';
                    });
                });

                // Add all control elements to container
                controlElements.forEach(element => {
                    fControllerContainer.appendChild(element);
                });

                this.element.appendChild(fControllerContainer);
            }

            // Store references for updates
            this.fDisplay = showFooterControls ? fDisplay : null;
            this.fControllerContainer = hasControls ? fControllerContainer : null;
            this.tightButton = showFooterControls ? tightButton : null;
            this.looseButton = showFooterControls ? looseButton : null;
            this.updateMarginDisplay(this.marginMode);
            
            // Subscribe to resize
            this.subscribeToResize();
        }
        return this.element;
    }
    
    /**
     * Adjust F value by a delta amount
     */
    adjustF(delta) {
        const currentF = window.Config?.F || 14;
        const newF = Math.max(6, Math.min(30, currentF + delta)); // Range: 6-30
        
        if (newF !== currentF) {
            // Use DynamicFManager to update F system-wide
            if (window.DynamicFManager) {
                window.DynamicFManager.setF(newF);
            } else {
                // Fallback: direct update
                if (window.Config) {
                    window.Config.F = newF;
                }
                this.updateFControllerDisplay(newF);
            }
        }
    }
    
    /**
     * Set margin mode (B=big frame/small margins, S=small frame/large margins)
     */
    setMargin(mode) {
        if (!this.onMarginChange) return;
        this.onMarginChange(mode);
        this.updateMarginDisplay(mode);
    }
    
    /**
     * Update margin mode button states (B=big frame, S=small frame)
     */
    updateMarginDisplay(currentMode) {
        const setActive = (btn, active) => {
            if (!btn) return;
            btn.style.background = active ? 'var(--c-accent)' : 'transparent';
            btn.style.color = active ? 'var(--c-bg)' : 'inherit';
        };

        const current = typeof currentMode === 'string' ? currentMode : this.getMarginMode();
        if (this.tightButton) setActive(this.tightButton, current === 'B');
        if (this.looseButton) setActive(this.looseButton, current === 'S');
    }
    
    /**
     * Show input field for direct F value entry
     */
    showFInput(displayElement) {
        const currentF = window.MathematicalFoundation?.F || window.Config?.F || 14;
        
        // Create input element
        const input = this.createElement('input', 'f-input');
        input.type = 'number';
        input.min = '6';
        input.max = '30';
        input.step = '1';
        input.value = currentF.toString();
        input.style.cssText = `
            width: 100%; height: 100%; border: none; background: var(--c-bg);
            color: var(--c-text); font-family: inherit; font-size: inherit;
            text-align: center; outline: 2px solid var(--c-accent);
        `;
        
        // Replace display with input
        displayElement.innerHTML = '';
        displayElement.appendChild(input);
        input.focus();
        input.select();
        
        // Handle input completion
        const completeInput = () => {
            const newValue = parseInt(input.value);
            if (!isNaN(newValue) && newValue >= 6 && newValue <= 30) {
                if (window.DynamicFManager) {
                    window.DynamicFManager.setF(newValue);
                }
            }
            
            // Restore display
            const finalF = window.MathematicalFoundation?.F || window.Config?.F || 14;
            displayElement.innerHTML = `F=${finalF}`;
        };
        
        // Event listeners for input completion
        input.addEventListener('blur', completeInput);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                completeInput();
            } else if (e.key === 'Escape') {
                // Cancel - restore original display
                const originalF = window.MathematicalFoundation?.F || window.Config?.F || 14;
                displayElement.innerHTML = `F=${originalF}`;
            }
        });
    }
    
    /**
     * Update F controller display when F changes externally
     */
    updateFControllerDisplay(newF) {
        if (this.fDisplay) {
            this.fDisplay.textContent = `F=${newF}`;
        }
        if (this.fControllerContainer) {
            this.fControllerContainer.style.fontSize = `${newF}px`;
        }
    }

    show() {
        if (this.element) this.element.style.display = '';
    }

    hide() {
        if (this.element) this.element.style.display = 'none';
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
        
        // Navigation context
        this.currentSection = null;
        this.currentSubsection = null;
        this.navigationContext = null;
        this.prevItem = null;
        this.nextItem = null;
    }

    getLayoutFromVars() {
        const fallback = this.deps.MF ? this.deps.MF.computeLayout() : {};
        const root = getComputedStyle(document.documentElement);
        const num = (name, fb) => {
            const v = parseInt(root.getPropertyValue(name), 10);
            return Number.isFinite(v) ? v : fb;
        };
        return {
            subheaderTitleWidth: num('--subheader-title-width', fallback.subheaderTitleWidth || 0),
            subheaderNavContainerWidth: num('--subheader-nav-width', fallback.subheaderNavContainerWidth || 0),
            subheaderPrevButtonWidth: num('--subheader-prev-width', fallback.subheaderPrevButtonWidth || 0),
            subheaderNextButtonWidth: num('--subheader-next-width', fallback.subheaderNextButtonWidth || 0)
        };
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'subheader');
            this.element.id = 'subheader';
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
                font-family: 'Atkinson Hyperlegible Mono', monospace;
                font-size: var(--f);
            `;
            
            // Title section - PRECISE WIDTH from layout calculations (same as header left block)
            const layout = this.getLayoutFromVars();
            const { F } = this.getF();
            
            const subheaderTitle = this.createElement('div', 'subheader-title');
            subheaderTitle.textContent = this.sectionTitle;
            subheaderTitle.style.cssText = `
                position: absolute;
                left: 0;
                top: 0;
                width: ${layout.subheaderTitleWidth}px;
                height: 100%;
                display: flex;
                align-items: center;
                padding: 0 ${F}px;
                text-transform: uppercase;
                border-right: 1px solid var(--c-border);
                box-sizing: border-box;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            `;
            
            // Navigation container - PRECISE WIDTH from layout calculations
            const subheaderNav = this.createElement('div', 'subheader-nav');
            subheaderNav.style.cssText = `
                position: absolute;
                left: ${layout.subheaderTitleWidth}px;
                top: 0;
                width: ${layout.subheaderNavContainerWidth}px;
                height: 100%;
                display: flex;
                overflow: hidden;
            `;
            
            // Previous button - PRECISE WIDTH from layout calculations
            const prevButton = this.createElement('div', 'nav-button');
            prevButton.textContent = 'PREV ←';
            prevButton.style.cssText = `
                width: ${layout.subheaderPrevButtonWidth}px;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                text-transform: uppercase;
                border-right: 1px solid var(--c-border);
                box-sizing: border-box;
                cursor: pointer;
                font-family: 'Atkinson Hyperlegible Mono', monospace;
                font-size: ${F}px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            `;
            
            // Next button - PRECISE WIDTH from layout calculations (exact remainder)
            const nextButton = this.createElement('div', 'nav-button');
            nextButton.textContent = '→ NEXT';
            nextButton.style.cssText = `
                width: ${layout.subheaderNextButtonWidth}px;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                text-transform: uppercase;
                box-sizing: border-box;
                cursor: pointer;
                font-family: 'Atkinson Hyperlegible Mono', monospace;
                font-size: var(--f);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
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
            
            // Append to document body (essential for visibility)
            document.body.appendChild(this.element);
            
            // Subscribe to resize
            this.subscribeToResize();
            // Fallback window resize listener to keep widths in sync when ResizeManager is absent
            this.windowResizeHandler = () => this.onResize();
            window.addEventListener('resize', this.windowResizeHandler);
        }
        return this.element;
    }
    
    updateTitle(title) {
        window.debugLog('NAVIGATION', `🏷️ Subheader updateTitle called: "${title}"`);
        
        // Ensure subheader is rendered
        if (!this.element) {
            window.debugLog('VERBOSE', '🔄 Subheader not rendered, rendering now...');
            this.render();
        }
        
        const titleElement = this.element?.querySelector('.subheader-title');
        if (titleElement) {
            titleElement.textContent = title.toUpperCase();
            window.debugLog('NAVIGATION', `✅ Subheader title updated to: "${titleElement.textContent}"`);
        } else {
            console.warn('⚠️ Subheader title element not found');
        }
        this.sectionTitle = title;
    }
    
    /**
     * Update navigation context and button functionality
     * @param {Object} context - Navigation context object
     * @param {string} context.section - Current section name
     * @param {string} context.subsection - Current subsection name  
     * @param {Array} context.items - Available navigation items
     * @param {Function} context.navigate - Navigation callback function
     */
    updateNavigation(context = {}) {
        this.currentSection = context.section;
        this.currentSubsection = context.subsection;
        this.navigationContext = context;
        
        if (context.items && Array.isArray(context.items)) {
            this.calculateNavigationItems(context.items, context.subsection);
        }
        
        this.updateNavigationButtons(context.navigate);
    }
    
    /**
     * Calculate previous and next items based on current position with looping
     */
    calculateNavigationItems(items, currentSubsection) {
        window.debugLog('NAVIGATION', `🧭 calculateNavigationItems: items=${items.length}, currentSubsection="${currentSubsection}"`);
        
        let currentIndex = -1;
        
        if (currentSubsection === null || currentSubsection === undefined) {
            // For section index pages (like blog TOC), look for isTOC or section path
            currentIndex = items.findIndex(item => 
                item.isTOC === true || item.path === `#${this.currentSection}`
            );
        } else {
            // Normalize currentSubsection for comparison (remove any leading/trailing slashes)
            const normalizedCurrent = currentSubsection.replace(/^\/+|\/+$/g, '');
            
            // For subsection pages, look for ID or full path match
            currentIndex = items.findIndex(item => {
                // Normalize item.id for comparison
                const normalizedId = item.id ? item.id.replace(/^\/+|\/+$/g, '') : null;
                
                // Try multiple matching strategies:
                // 1. Direct ID match (e.g., "utilities/tool-test" === "utilities/tool-test")
                // 2. Full path match (e.g., "#tools/utilities/tool-test")
                // 3. Path suffix match (handles cases where section prefix might differ)
                const directMatch = normalizedId === normalizedCurrent;
                const pathMatch = item.path === `#${this.currentSection}/${normalizedCurrent}`;
                const pathEndsMatch = item.path && item.path.endsWith(`/${normalizedCurrent}`);
                
                const matches = directMatch || pathMatch || pathEndsMatch;
                
                if (matches) {
                    window.debugLog('NAVIGATION', `🧭 Found match: item.id="${item.id}", item.path="${item.path}", currentSubsection="${currentSubsection}"`);
                }
                return matches;
            });
        }
        
        window.debugLog('NAVIGATION', `🧭 Current index: ${currentIndex} of ${items.length}`);
        
        if (currentIndex === -1 || items.length <= 1) {
            this.prevItem = null;
            this.nextItem = null;
            window.debugLog('NAVIGATION', `🧭 No navigation: currentIndex=${currentIndex}, items.length=${items.length}`);
            return;
        }
        
        // Implement looping behavior
        // Previous: if at beginning (index 0), go to last item
        this.prevItem = currentIndex > 0 ? items[currentIndex - 1] : items[items.length - 1];
        
        // Next: if at end (last index), go to first item
        this.nextItem = currentIndex < items.length - 1 ? items[currentIndex + 1] : items[0];
        
        window.debugLog('NAVIGATION', `🧭 Prev: "${this.prevItem?.title}", Next: "${this.nextItem?.title}"`);
    }
    
    /**
     * Clear all subheader content and state
     */
    clearContent() {
        // Reset navigation state
        this.currentSection = null;
        this.currentSubsection = null;
        this.navigationContext = null;
        this.prevItem = null;
        this.nextItem = null;
        
        // Force re-render of subheader to ensure clean state
        if (this.element) {
            window.debugLog('NAVIGATION', '🔄 Force re-rendering subheader for clean state');
            this.element.remove();
            this.element = null;
            this.dropdownComponent = null;
        }
        
        window.debugLog('NAVIGATION', '🧹 Subheader cleared and will re-render on next use');
    }
    
    /**
     * Handle resize - recalculate layout like PageHeader
     */
    onResize() {
        if (this.element) {
            const layout = this.getLayoutFromVars();
            const { F } = this.getF();
            
            // Update title section width
            const titleElement = this.element.querySelector('.subheader-title');
            if (titleElement) {
                titleElement.style.width = `${layout.subheaderTitleWidth}px`;
            }
            const dropdownTrigger = this.element.querySelector('.subheader-dropdown-trigger');
            if (dropdownTrigger) {
                dropdownTrigger.style.width = `${layout.subheaderTitleWidth}px`;
            }
            
            // Update navigation container width and position
            const navElement = this.element.querySelector('.subheader-nav');
            if (navElement) {
                navElement.style.left = `${layout.subheaderTitleWidth}px`;
                navElement.style.width = `${layout.subheaderNavContainerWidth}px`;
            }
            const dropdownMenu = document.getElementById('subheader-dropdown');
            if (dropdownMenu) {
                dropdownMenu.style.width = `${layout.subheaderTitleWidth}px`;
            }
            
            // Update navigation button widths and re-evaluate text fit
            const navButtons = this.element.querySelectorAll('.nav-button');
            if (navButtons.length >= 2) {
                navButtons[0].style.width = `${layout.subheaderPrevButtonWidth}px`;
                navButtons[1].style.width = `${layout.subheaderNextButtonWidth}px`;
            }
            this._refreshNavButtonText();
        }
    }

    /**
     * Re-evaluate nav button text after width changes.
     * Binary: shows full "NAME ←" / "→ NAME" when it fits, glyph-only otherwise.
     */
    _refreshNavButtonText() {
        if (!this.element) return;
        const navContainer = this.element.querySelector('.subheader-nav');
        if (!navContainer) return;
        const prevButton = navContainer.querySelector('.nav-button:first-child');
        const nextButton = navContainer.querySelector('.nav-button:last-child');
        if (prevButton && this.prevItem) {
            prevButton.textContent = this.formatNavigationText(this.prevItem, 'prev');
        }
        if (nextButton && this.nextItem) {
            nextButton.textContent = this.formatNavigationText(this.nextItem, 'next');
        }
    }
    
    /**
     * Show subheader with proper display
     */
    show() {
        // Ensure subheader is rendered
        if (!this.element) {
            window.debugLog('VERBOSE', '🔄 Subheader not rendered for show(), rendering now...');
            this.render();
        }
        
        if (this.element) {
            // Don't use inline !important styles - let CSS handle visibility
            this.element.style.display = 'flex';
            
            // Update body class to show subheader (preserve other classes like full-mode)
            document.body.classList.add('has-subheader');
            document.body.classList.remove('no-subheader');
            
            window.debugLog('NAVIGATION', `🧭 Subheader shown with title: "${this.sectionTitle || 'unknown'}" - display: ${this.element.style.display}, body class: ${document.body.className}`);
        }
    }
    
    /**
     * Hide subheader
     */
    hide() {
        if (this.element) {
            this.element.style.display = 'none';
            
            // Update body class to hide subheader (preserve other classes like full-mode)
            document.body.classList.add('no-subheader');
            document.body.classList.remove('has-subheader');
            
            // IMPORTANT: Also update the PageContainer layout state to reposition content
            // Use a flag to prevent infinite recursion (setSubheaderState calls hide again)
            if (!this._hiding && window.SiteBoyApp && window.SiteBoyApp.pageContainer) {
                this._hiding = true;
                // Directly reposition content container without calling setSubheaderState
                const pc = window.SiteBoyApp.pageContainer;
                if (pc.contentBody && pc.deps && pc.deps.MF) {
                    const layout = pc.deps.MF.computeLayout() || {};
                    const margin = pc.deps.MF.Config?.margin || layout.marginLeft || 14;
                    const headerHeight = layout.headerHeight || 28;
                    const isToolsSection = document.body.classList.contains('tools-section');
                    const contentTop = margin + headerHeight;
                    const bottomOffset = isToolsSection ? margin : headerHeight + margin;
                    pc.contentBody.style.top = `${contentTop}px`;
                    pc.contentBody.style.bottom = `${bottomOffset}px`;
                    pc.contentBody.style.borderBottom = isToolsSection ? '1px solid var(--c-border)' : 'none';
                }
                this._hiding = false;
            }
            
            window.debugLog('NAVIGATION', `🧭 Subheader hidden - body class: ${document.body.className}`);
        }
    }
    
    /**
     * Update navigation buttons with new handlers (LEGACY METHOD - kept for compatibility)
     * @param {Function} onPrev - Previous page handler
     * @param {Function} onNext - Next page handler
     */
    updateNavigationLegacy(onPrev = null, onNext = null) {
        if (!this.element) return;
        
        const navContainer = this.element.querySelector('.subheader-nav');
        if (!navContainer) return;
        const prevButton = navContainer.querySelector('.nav-button:first-child');
        const nextButton = navContainer.querySelector('.nav-button:last-child');
        
        // Clear existing handlers and update functionality
        if (prevButton) {
            // Store original styles before cloning
            const originalPrevStyle = prevButton.style.cssText;
            prevButton.replaceWith(prevButton.cloneNode(true));
            const newPrevButton = navContainer.querySelector('.nav-button:first-child');
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
            const newNextButton = navContainer.querySelector('.nav-button:last-child');
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
        
        window.debugLog('NAVIGATION', '🧭 Subheader navigation updated');
    }
    
    /**
     * Update navigation buttons with dynamic content and handlers
     * @param {Function} navigateCallback - Navigation callback function
     */
    updateNavigationButtons(navigateCallback = null) {
        if (!this.element) return;
        
        const navContainer = this.element.querySelector('.subheader-nav');
        if (!navContainer) return;
        const prevButton = navContainer.querySelector('.nav-button:first-child');
        const nextButton = navContainer.querySelector('.nav-button:last-child');
        
        // Update Previous Button
        if (prevButton) {
            const originalPrevStyle = prevButton.style.cssText;
            prevButton.replaceWith(prevButton.cloneNode(true));
            const newPrevButton = navContainer.querySelector('.nav-button:first-child');
            
            // Restore original styles first
            newPrevButton.style.cssText = originalPrevStyle;
            
            // Dynamic text based on previous item (always available due to looping)
            if (this.prevItem) {
                const prevText = this.formatNavigationText(this.prevItem, 'prev');
                newPrevButton.textContent = prevText;
                newPrevButton.title = `Navigate to ${this.prevItem.title || this.prevItem.id}`;
                
                // Always active due to looping behavior
                newPrevButton.style.opacity = '1';
                newPrevButton.style.cursor = 'pointer';
                
                if (navigateCallback) {
                    newPrevButton.addEventListener('click', () => {
                        this.navigateToItem(this.prevItem, navigateCallback);
                    });
                    newPrevButton.classList.add('clickable');
                }
            } else {
                // Only disabled if no items available (single item or empty list)
                newPrevButton.textContent = 'PREV ←';
                newPrevButton.title = 'No navigation available';
                newPrevButton.classList.remove('clickable');
                newPrevButton.style.opacity = '0.5';
                newPrevButton.style.cursor = 'default';
            }
        }
        
        // Update Next Button
        if (nextButton) {
            const originalNextStyle = nextButton.style.cssText;
            nextButton.replaceWith(nextButton.cloneNode(true));
            const newNextButton = navContainer.querySelector('.nav-button:last-child');
            
            // Restore original styles first
            newNextButton.style.cssText = originalNextStyle;
            
            // Dynamic text based on next item (always available due to looping)
            if (this.nextItem) {
                const nextText = this.formatNavigationText(this.nextItem, 'next');
                newNextButton.textContent = nextText;
                newNextButton.title = `Navigate to ${this.nextItem.title || this.nextItem.id}`;
                
                // Always active due to looping behavior
                newNextButton.style.opacity = '1';
                newNextButton.style.cursor = 'pointer';
                
                if (navigateCallback) {
                    newNextButton.addEventListener('click', () => {
                        this.navigateToItem(this.nextItem, navigateCallback);
                    });
                    newNextButton.classList.add('clickable');
                }
            } else {
                // Only disabled if no items available (single item or empty list)
                newNextButton.textContent = '→ NEXT';
                newNextButton.title = 'No navigation available';
                newNextButton.classList.remove('clickable');
                newNextButton.style.opacity = '0.5';
                newNextButton.style.cursor = 'default';
            }
        }
    }
    
    /**
     * Format navigation text for buttons — binary fit/degrade.
     * Shows "NAME ←" / "→ NAME" when the full string fits,
     * degrades to glyph-only ("←" / "→") when it does not.
     * Never truncates mid-word.
     */
    formatNavigationText(item, direction) {
        let displayTitle = item.title || item.id || 'ITEM';
        if (displayTitle.includes('/')) {
            const parts = displayTitle.split('/');
            displayTitle = parts[parts.length - 1];
        }

        const glyph = direction === 'prev' ? '←' : '→';
        const fullText = direction === 'prev'
            ? `${displayTitle.toUpperCase()} ${glyph}`
            : `${glyph} ${displayTitle.toUpperCase()}`;

        const layout = this.deps.MF ? this.deps.MF.computeLayout() : {};
        const F = this.deps.MF ? this.deps.MF.F : 14;
        const buttonWidth = direction === 'prev'
            ? (layout.subheaderPrevButtonWidth || 100)
            : (layout.subheaderNextButtonWidth || 100);

        const textWidth = this._measureText(fullText, F);
        if (textWidth <= buttonWidth - F) {
            return fullText;
        }
        return glyph;
    }

    _measureText(text, fontSize) {
        if (!this._measureCtx) {
            this._measureCtx = document.createElement('canvas').getContext('2d');
        }
        this._measureCtx.font = `${fontSize}px 'Atkinson Hyperlegible Mono', monospace`;
        return this._measureCtx.measureText(text).width;
    }
    
    /**
     * Navigate to specific item
     */
    navigateToItem(item, navigateCallback) {
        if (!item || !navigateCallback) return;
        
        // Handle different item formats
        if (item.path) {
            // Extract section/subsection from path (e.g., "#tools/ui-test" or "#blog")
            const pathParts = item.path.replace('#', '').split('/');
            const section = pathParts[0];
            const subsection = pathParts.length > 1 ? pathParts.slice(1).join('/') : null;
            
            window.debugLog('NAVIGATION', `🧭 Subheader navigateToItem: ${item.path} → section=${section}, subsection=${subsection}`);
            navigateCallback(section, subsection);
        } else if (item.id && this.currentSection) {
            // Use current section with item id
            window.debugLog('NAVIGATION', `🧭 Subheader navigateToItem: ${this.currentSection}/${item.id}`);
            navigateCallback(this.currentSection, item.id);
        }
    }
    
    /**
     * Set dropdown content for left side of subheader
     * @param {Array} items - Dropdown items {label, value, url}
     * @param {Function} onSelect - Selection handler
     * @param {string|null} expandSubsection - Subsection ID to auto-expand
     */
    setDropdownContent(items, onSelect = null, expandSubsection = null) {
        // Ensure subheader is rendered
        if (!this.element) {
            window.debugLog('VERBOSE', '🔄 Subheader not rendered for setDropdownContent(), rendering now...');
            this.render();
        }
        
        window.debugLog('VERBOSE', '🔄 Subheader.setDropdownContent called with items:', items);
        window.debugLog('VERBOSE', '🔄 Subheader element exists:', !!this.element);
        
        const titleElement = this.element.querySelector('.subheader-title');
        window.debugLog('VERBOSE', '🔄 Title element found:', !!titleElement);
        if (!titleElement) return;
        
        // Create actual dropdown if items provided
        if (items && items.length > 0) {
            const F = this.deps.MF ? this.deps.MF.F : 14;
            const layout = this.deps.MF ? this.deps.MF.computeLayout() : {};
            
            // Create reusable navigation dropdown - like header but different positioning
            this.pageDropdown = new BaseNavigationDropdown({
                items: items,
                onItemClick: onSelect,
                expandSubsection: expandSubsection // Pass auto-expand info
            }, this.deps);
            
            // Create trigger element sized by layout to avoid stale ellipsis on resize
            const triggerElement = this.createElement('div', 'subheader-dropdown-trigger');
            triggerElement.style.cssText = `
                position: absolute;
                left: 0;
                top: 0;
                width: ${layout.subheaderTitleWidth}px;
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
            
            // Position dropdown to match trigger width exactly
            dropdownMenu.style.width = `${layout.subheaderTitleWidth}px`;
            dropdownMenu.style.border = '1px solid var(--c-border)';
            dropdownMenu.style.borderTop = '1px solid var(--c-border)'; // Keep top border for separation
            dropdownMenu.style.zIndex = '1500';
            
            // Set symbol element for toggle functionality
            this.pageDropdown.setSymbolElement(menuSymbol);
            
            // Populate dropdown with navigation items
            this.pageDropdown.populateDropdown(items);
            
            // Add toggle functionality
            triggerElement.addEventListener('click', (e) => {
                window.debugLog('VERBOSE', '🔄 Subheader dropdown trigger clicked!');
                window.debugLog('VERBOSE', '🔄 PageDropdown exists:', !!this.pageDropdown);
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
            
            window.debugLog('NAVIGATION', `🧭 Subheader dropdown created with ${items.length} items using BaseNavigationDropdown`);
        } else {
            // Fallback to simple title
            const pageCount = items ? items.length : 0;
            if (pageCount > 0) {
                titleElement.title = `${pageCount} pages available in this section`;
            }
            window.debugLog('NAVIGATION', `🧭 Subheader dropdown content set: ${pageCount} items`);
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

    destroy() {
        if (this.windowResizeHandler) {
            window.removeEventListener('resize', this.windowResizeHandler);
            this.windowResizeHandler = null;
        }
        super.destroy();
    }
}

/**
 * Panel - Reusable container component with consistent styling
 */
export class Panel extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'panel' }, deps);
        this.title = options.title || '';
        this.content = options.content || '';
        this.className = options.className || '';
        this.collapsible = options.collapsible || false;
        this.isOpen = options.defaultOpen === true;
        this.onToggle = options.onToggle || null;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', `panel component ${this.className}`);
            this.element.style.cssText = `
                padding: var(--f);
                border: 1px solid var(--c-border);
                background: var(--c-bg);
                margin-bottom: var(--f);
            `;
            
            if (this.title) {
                const titleElement = this.createElement(this.collapsible ? 'button' : 'h3', 'panel-title');
                titleElement.textContent = this.title;
                titleElement.style.cssText = `
                    margin: 0 0 var(--f) 0;
                    font-size: calc(var(--f) * 1.2);
                    font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
                    color: var(--c-text);
                    ${this.collapsible ? 'display:block;width:100%;text-align:left;outline:1px solid var(--c-border);background: var(--c-bg);height: calc(var(--f) * 4);line-height: calc(var(--f) * 4);padding: 0 var(--f);' : ''}
                `;
                
                if (this.collapsible) {
                    titleElement.setAttribute('type', 'button');
                    titleElement.addEventListener('click', () => this.toggle());
                }
                
                this.element.appendChild(titleElement);
            }
            
            if (this.content) {
                const contentElement = this.createElement('div', 'panel-content');
                if (typeof this.content === 'string') {
                    contentElement.textContent = this.content;
                } else {
                    contentElement.appendChild(this.content);
                }
                if (this.collapsible && !this.isOpen) {
                    contentElement.style.display = 'none';
                }
                this.element.appendChild(contentElement);
            }
        }
        return this.element;
    }
    
    setContent(content) {
        const contentElement = this.element?.querySelector('.panel-content');
        if (contentElement) {
            if (typeof content === 'string') {
                contentElement.textContent = content;
            } else {
                contentElement.innerHTML = '';
                contentElement.appendChild(content);
            }
        }
    }

    toggle() {
        if (!this.collapsible) return;
        const contentElement = this.element?.querySelector('.panel-content');
        if (!contentElement) return;
        this.isOpen = !this.isOpen;
        contentElement.style.display = this.isOpen ? '' : 'none';
        if (typeof this.onToggle === 'function') {
            try { this.onToggle(this.isOpen); } catch (_) {}
        }
    }
}
