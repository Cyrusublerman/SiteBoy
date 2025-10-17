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
 * Adapts reference perfect-grid mathematical logic to SiteBoy F=12px system:
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
                console.log('🚨🚨🚨 NEW GRID CODE IS RUNNING 🚨🚨🚨');
                console.log('🔧 Grid render timeout triggered');
                if (this.element && this.element.parentElement) {
                    console.log('🔧 Grid has parent, calculating...');
                    this.calculateAndRender();
                    if (this.onItemClick || this.onCaptionArrowClick) {
                        this.bindEvents();
                    }
                    
                    // Start observing container changes
                    if (this.containerObserver && this.element.parentElement) {
                        this.containerObserver.observe(this.element.parentElement);
                    }
                } else {
                    console.log('🚨 Grid render failed - no parent element');
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
                headerHeight: 24 // F=24px system
            };
        }
        
        // FORCE: Measure the IMMEDIATE parent container only - no parent chain walking
        const immediateParent = this.element.parentElement;
        
        console.log('🔧 CONTAINER TRACING:');
        console.log(`   Element: ${this.element.className}`);
        console.log(`   Immediate Parent: ${immediateParent?.tagName} class="${immediateParent?.className}" id="${immediateParent?.id}"`);
        
        // Walk up to see the container hierarchy
        let current = this.element;
        let level = 0;
        while (current && level < 6) {
            const rect = current.getBoundingClientRect();
            const computed = getComputedStyle(current);
            console.log(`   Level ${level}: ${current.tagName}${current.id ? '#' + current.id : ''}${current.className ? '.' + current.className.split(' ').join('.') : ''} → ${Math.round(rect.width)}px (computed: ${computed.width})`);
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
        console.log(`🎯 Using container: ${containerToMeasure.tagName}${containerToMeasure.id ? '#' + containerToMeasure.id : ''} for measurement`);
        
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
        
        // Get F=12px system constants from CSS
        const rootStyle = getComputedStyle(document.documentElement);
        const headerHeight = parseInt(rootStyle.getPropertyValue('--header-height')) || 24; // 2*F
        
        // F=12px MATHEMATICAL PRECISION - F divisible sizing (1,2,3,4,6,12,24,36...)
        
        // Universal F-based grid calculations - adapts to ANY container width
        // Uses F=12px mathematical breakpoints for optimal column selection
        // Use the proper mathematical equation for column calculation
        let cols = this.cols;
        if (!cols) {
            // Use your elegant mathematical equation
            cols = this.calculateColumns(availableWidth, availableWidth);
            console.log(`🔧 Mathematical equation: ${cols} cols for ${availableWidth}px (3.982 * 1.0 - 1.088 = ${3.982 * 1.0 - 1.088})`);
        }
        
        const gap = 1; // 1px gap like reference (not F-based, this is outline)
        
        // UNIVERSAL F-BASED BOX SIZE CALCULATION - fits ANY container
        const totalGaps = (cols - 1) * gap;
        const boxSize = Math.floor((availableWidth - totalGaps) / cols);
        const gridWidth = boxSize * cols + totalGaps;
        
        console.log(`🔧 Universal calculation: ${cols} × ${boxSize}px + ${totalGaps}px gaps = ${gridWidth}px (fits in ${availableWidth}px)`);
        
        // Verify mathematical precision - should never overflow
        if (gridWidth > availableWidth) {
            console.log(`🚨 MATH ERROR: ${gridWidth}px > ${availableWidth}px - this should never happen`);
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
            console.log('🔧 Grid Container Debug - MEASURING ISSUE ANALYSIS:');
            console.log(`   📏 Measured Container Width: ${containerWidth}px`);
            console.log(`   📐 Calculated Available Width: ${availableWidth}px`);
            console.log(`   📊 Calculated Columns: ${cols}`);
            console.log(`   📦 Calculated Box Size: ${boxSize}px`);
            console.log(`   📏 Calculated Grid Width: ${gridWidth}px`);
            console.log(`   📋 Immediate Parent ID: ${this.element.parentElement?.id || 'no-id'}`);
            
            // Walk up the container chain to see what we're measuring vs what we should measure
            let current = this.element.parentElement;
            let level = 0;
            while (current && level < 5) {
                const rect = current.getBoundingClientRect();
                const style = getComputedStyle(current);
                const computedWidth = parseFloat(style.width);
                console.log(`   🔗 Parent ${level}: ${current.tagName}${current.id ? '#' + current.id : ''} = Rect:${Math.round(rect.width)}px | Computed:${computedWidth || 'auto'}px | Padding:${style.padding}`);
                current = current.parentElement;
                level++;
            }
            
            // VERIFY: Are we measuring the immediate parent correctly?
            const immediateParent = this.element.parentElement;
            if (!immediateParent) {
                console.log('   🚨 ERROR: Grid element has no parent - cannot measure container');
                return;
            }
            const immediateMeasurement = immediateParent.getBoundingClientRect();
            const immediateStyle = getComputedStyle(immediateParent);
            const immediateInnerWidth = immediateMeasurement.width - 
                parseFloat(immediateStyle.paddingLeft) - 
                parseFloat(immediateStyle.paddingRight) - 
                parseFloat(immediateStyle.borderLeftWidth) - 
                parseFloat(immediateStyle.borderRightWidth);
            
            console.log(`   🎯 IMMEDIATE PARENT (${immediateParent.tagName}${immediateParent.id ? '#' + immediateParent.id : ''}):`);
            console.log(`      Total: ${immediateMeasurement.width}px`);
            console.log(`      Inner: ${immediateInnerWidth}px (after padding/borders)`);
            console.log(`      Used:  ${availableWidth}px (what we calculated)`);
            console.log(`   ⚠️  FINAL CHECK: Grid ${gridWidth}px ${gridWidth > immediateInnerWidth ? 'OVERFLOWS' : 'FITS'} in ${immediateInnerWidth}px available space`);
            
            // Show if we're using the right measurement
            if (Math.abs(availableWidth - immediateInnerWidth) > 1) {
                console.log(`   🚨 CALCULATION ERROR: Expected ${immediateInnerWidth}px but calculated ${availableWidth}px`);
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
     * Translated to F=12px system: 24px captions, proper typography, outline separation
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
    }
    
    render() {
        if (!this.element) {
            this.dimensions = this.calculateDimensions('page');
            const layout = this.dimensions?.layout || this.deps.MF?.computeLayout() || {};
            const F = this.dimensions?.F || this.deps.MF?.F || 12;
            
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
        const headerHeight = this.deps.MF.F * 2; // Header height = 24px (2*F) - KEEP F SYSTEM
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const isDesktop = layout.isDesktop; // Use the clear isDesktop flag from computeLayout
        
        console.log(`📐 PageContainer: Applying ${isDesktop ? 'Desktop' : 'Mobile'} layout calculations`);
        
        if (isDesktop) {
            // Desktop: use F-based margins but with reference precision techniques
            const contentWidth = layout.gridWidth;
            const marginOffset = layout.marginLeft;
            const topMargin = headerHeight * 2; // 48px (2 * 24px) - F SYSTEM
            
            this.setLayoutVariables({
                '--layout-width': `${contentWidth}px`,
                '--layout-margin': `${marginOffset}px`,
                '--header-y': `${topMargin}px`,                            // F system: 48px top margin
                '--subheader-y': `${topMargin + headerHeight}px`,          // F system: 48px + 24px
                '--content-y-with-sub': `${topMargin + (2 * headerHeight)}px`,    // F system: 48px + 48px
                '--content-y-no-sub': `${topMargin + headerHeight}px`,     // F system: 48px + 24px
                '--footer-y': `${windowHeight - headerHeight}px`,
                '--content-min-h-with-sub': `${windowHeight - (topMargin + 3 * headerHeight)}px`,
                '--content-min-h-no-sub': `${windowHeight - (topMargin + 2 * headerHeight)}px`,
                '--layout-type': 'desktop'
            });
            
        } else {
            // Mobile: use mobile margins from config
            const mobileMargin = (this.deps.MF && this.deps.MF.Config && this.deps.MF.Config.margins) ? 
                this.deps.MF.Config.margins.mobile : 6;
            this.setLayoutVariables({
                '--layout-width': `${layout.gridWidth}px`,                // Use calculated mobile width
                '--layout-margin': `${layout.marginLeft}px`,              // Use calculated mobile margin
                '--header-y': `${mobileMargin}px`,                        // Header at mobile margin from top
                '--subheader-y': `${mobileMargin + headerHeight}px`,
                '--content-y-with-sub': `${mobileMargin + (2 * headerHeight)}px`,
                '--content-y-no-sub': `${mobileMargin + headerHeight}px`,
                '--footer-y': `${windowHeight - headerHeight - mobileMargin}px`,  // Footer with same margin as header
                '--content-min-h-with-sub': `${windowHeight - (mobileMargin * 2 + 3 * headerHeight)}px`,  // Account for both top and bottom margins
                '--content-min-h-no-sub': `${windowHeight - (mobileMargin * 2 + 2 * headerHeight)}px`,    // Account for both top and bottom margins
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
            // Get layout directly from MF like subheader does
            const layout = this.deps.MF ? this.deps.MF.computeLayout() : {};
            const F = this.deps.MF ? this.deps.MF.F : 12;
            // Header height = 24px (2*F)
            
            this.element = this.createElement('header', 'page-header');
            this.element.id = 'header';
            // Ensure visibility during debugging
            this.element.style.visibility = 'visible';
            this.element.style.display = 'flex';
            console.log('📄 PageHeader created with class:', this.element.className);
            
            // Listen for resize events to update F-based styling
            this.resizeHandler = () => this.onResize();
            window.addEventListener('resize', this.resizeHandler);
            
            // LEFT BLOCK - Site title (PRECISE WIDTH from layout calculations)
            const leftContainer = this.createElement('div', 'header-left');
            leftContainer.style.cssText = `
                position: absolute; left: 0; top: 0; 
                width: ${layout.mainHeaderLeftWidth}px;
                height: 100%;
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
                font-family: 'Atkinson Hyperlegible Mono', monospace; font-weight: 400;
            `;
            
            if (this.onNavigate) {
                homeLink.addEventListener('click', () => {
                    this.onNavigate({ title: 'HOME' });
                });
                homeLink.classList.add('clickable');
            }
            
            leftContainer.appendChild(homeLink);
            this.element.appendChild(leftContainer);
            
            // RIGHT BLOCK - Navigation dropdown and theme toggle (PRECISE WIDTH from calculations)
            const rightContainer = this.createElement('div', 'header-right');
            const rightWidth = layout.mainHeaderNavWidth + layout.mainHeaderToggleWidth;
            rightContainer.style.cssText = `
                position: absolute; right: 0; top: 0; 
                width: ${rightWidth}px;
                height: 100%;
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
            
            // Navigation area - PRECISE WIDTH from layout calculations
            const navContainer = this.createElement('div', 'header-nav');
            navContainer.id = 'header-nav';
            navContainer.style.cssText = `
                position: absolute; left: 0; top: 0; 
                width: ${layout.mainHeaderNavWidth}px; height: 100%;
                padding: 0 ${F}px; display: flex; align-items: center; text-transform: uppercase;
                font-size: ${F}px; cursor: pointer; box-sizing: border-box;
                border-left: 1px solid var(--c-border);
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
                zIndex: 190
            });
            
            // Position dropdown to match navigation area width exactly with border compensation
            dropdownMenu.style.top = '100%'; // Position directly below header
            dropdownMenu.style.left = '0px'; // Align with nav container
            dropdownMenu.style.width = `${layout.mainHeaderNavWidth}px`; // Match navigation area width exactly
            
            rightContainer.appendChild(dropdownMenu);
            
            // Set symbol element for toggle functionality
            this.navigationDropdown.setSymbolElement(menuSymbol);
            
            // Populate dropdown with navigation items
            this.navigationDropdown.populateDropdown(this.navigationItems);
            
            // Theme toggle button - PRECISE WIDTH from layout calculations
            const headerToggle = this.createElement('div', 'header-toggle');
            headerToggle.id = 'header-toggle';
            headerToggle.textContent = this.getThemeIcon();
            headerToggle.style.cssText = `
                position: absolute; right: 0; top: 0; 
                width: ${layout.mainHeaderToggleWidth}px; height: 100%;
                display: flex; align-items: center; justify-content: center;
                border-left: 1px solid var(--c-border); box-sizing: border-box;
                font-size: ${F}px; line-height: 1; cursor: pointer;
                font-family: 'Atkinson Hyperlegible Mono', monospace;
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
     * Handle resize - recalculate layout like subheader
     */
    onResize() {
        if (this.element && this.deps.MF) {
            const layout = this.deps.MF.computeLayout();
            const F = this.deps.MF.F;
            
            // Update left container width
            const leftContainer = this.element.querySelector('.header-left');
            if (leftContainer) {
                leftContainer.style.width = `${layout.mainHeaderLeftWidth}px`;
            }
            
            // Update right container width
            const rightContainer = this.element.querySelector('.header-right');
            if (rightContainer) {
                const rightWidth = layout.mainHeaderNavWidth + layout.mainHeaderToggleWidth;
                rightContainer.style.width = `${rightWidth}px`;
            }
            
            // Update navigation area width
            const navContainer = this.element.querySelector('#header-nav');
            if (navContainer) {
                navContainer.style.width = `${layout.mainHeaderNavWidth}px`;
                // Update font-size and padding for F scaling
                navContainer.style.fontSize = `${F}px`;
                navContainer.style.padding = `0 ${F}px`;
            }
            
            // Update home link font-size and padding for F scaling
            const homeLink = this.element.querySelector('#home-link');
            if (homeLink) {
                homeLink.style.fontSize = `${F}px`;
                homeLink.style.padding = `0 ${F}px`;
            }
            
            // Update menu symbol font-size for F scaling
            const menuSymbol = this.element.querySelector('#menu-symbol');
            if (menuSymbol) {
                menuSymbol.style.fontSize = `${F}px`;
            }
            
            // Update toggle width and font-size
            const headerToggle = this.element.querySelector('#header-toggle');
            if (headerToggle) {
                headerToggle.style.width = `${layout.mainHeaderToggleWidth}px`;
                headerToggle.style.fontSize = `${F}px`;
            }
            
            // Update dropdown width to match navigation area exactly
            const dropdown = this.element.querySelector('#dropdown-menu');
            if (dropdown) {
                dropdown.style.width = `${layout.mainHeaderNavWidth}px`;
            }
            
            // Update dropdown items if they exist
            if (this.navigationDropdown) {
                this.navigationDropdown.updateFontSizes(F);
            }
            
            console.log('📄 PageHeader: Layout and F-based styling recalculated on resize');
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
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
            });
            backToTop.classList.add('clickable');
            this.element.appendChild(backToTop);
            
            // Instagram link (25%) - with right border separator
            const instagramLink = this.createElement('a', 'footer-item');
            instagramLink.href = 'https://www.instagram.com/a.einoder/';
            instagramLink.target = '_blank';
            instagramLink.textContent = '@A.EINODER';
            instagramLink.style.cssText = `
                position: absolute; top: 0; left: 25%; height: 100%; width: 25%;
                display: flex; align-items: center; justify-content: center;
                text-transform: uppercase; font-size: ${F}px; text-decoration: none; color: inherit;
                border-right: 1px solid var(--c-border); box-sizing: border-box; cursor: pointer;
            `;
            instagramLink.classList.add('clickable');
            this.element.appendChild(instagramLink);
            
            // Contact link (25%) - with right border separator  
            const contactLink = this.createElement('a', 'footer-item');
            contactLink.href = '#contact';
            contactLink.textContent = 'CONTACT';
            contactLink.style.cssText = `
                position: absolute; top: 0; left: 50%; height: 100%; width: 25%;
                display: flex; align-items: center; justify-content: center;
                text-transform: uppercase; font-size: ${F}px; text-decoration: none; color: inherit;
                border-right: 1px solid var(--c-border); box-sizing: border-box; cursor: pointer;
            `;
            contactLink.classList.add('clickable');
            this.element.appendChild(contactLink);
            
            // F Controller Container (25%) - 3 separate buttons
            const fControllerContainer = this.createElement('div', 'footer-item f-controller-container');
            fControllerContainer.style.cssText = `
                position: absolute; top: 0; left: 75%; height: 100%; width: 25%;
                display: flex; align-items: center; justify-content: center;
                font-size: ${F}px; font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
                box-sizing: border-box;
            `;
            
            // Plus button (33.33%)
            const plusButton = this.createElement('button', 'f-control-btn f-plus');
            plusButton.textContent = '+';
            plusButton.title = 'Increase F by 1';
            plusButton.style.cssText = `
                width: 33.33%; height: 100%; border: none; background: transparent;
                color: inherit; font-family: inherit; font-size: inherit;
                cursor: pointer; border-right: 1px solid var(--c-border);
                display: flex; align-items: center; justify-content: center;
            `;
            plusButton.addEventListener('click', () => this.adjustF(1));
            
            // F display/input (33.33%)
            const fDisplay = this.createElement('div', 'f-display');
            fDisplay.style.cssText = `
                width: 33.34%; height: 100%; background: transparent;
                color: inherit; font-family: inherit; font-size: inherit;
                border: none; border-right: 1px solid var(--c-border);
                display: flex; align-items: center; justify-content: center;
                cursor: pointer; user-select: none;
            `;
            fDisplay.textContent = `F=${F}`;
            fDisplay.title = 'Click to edit F value directly';
            fDisplay.addEventListener('click', () => this.showFInput(fDisplay));
            
            // Minus button (33.33%)
            const minusButton = this.createElement('button', 'f-control-btn f-minus');
            minusButton.textContent = '-';
            minusButton.title = 'Decrease F by 1';
            minusButton.style.cssText = `
                width: 33.33%; height: 100%; border: none; background: transparent;
                color: inherit; font-family: inherit; font-size: inherit;
                cursor: pointer; display: flex; align-items: center; justify-content: center;
            `;
            minusButton.addEventListener('click', () => this.adjustF(-1));
            
            // Add hover effects
            [plusButton, fDisplay, minusButton].forEach(btn => {
                btn.addEventListener('mouseenter', () => {
                    btn.style.background = 'var(--c-accent)';
                    btn.style.color = 'var(--c-bg)';
                });
                btn.addEventListener('mouseleave', () => {
                    btn.style.background = 'transparent';
                    btn.style.color = 'inherit';
                });
            });
            
            fControllerContainer.appendChild(plusButton);
            fControllerContainer.appendChild(fDisplay);
            fControllerContainer.appendChild(minusButton);
            this.element.appendChild(fControllerContainer);
            
            // Store references for updates
            this.fDisplay = fDisplay;
            this.fControllerContainer = fControllerContainer;
            
            // Subscribe to resize
            this.subscribeToResize();
        }
        return this.element;
    }
    
    /**
     * Adjust F value by a delta amount
     */
    adjustF(delta) {
        const currentF = window.Config?.F || 12;
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
     * Show input field for direct F value entry
     */
    showFInput(displayElement) {
        const currentF = window.MathematicalFoundation?.F || window.Config?.F || 12;
        
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
            const finalF = window.MathematicalFoundation?.F || window.Config?.F || 12;
            displayElement.innerHTML = `F=${finalF}`;
        };
        
        // Event listeners for input completion
        input.addEventListener('blur', completeInput);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                completeInput();
            } else if (e.key === 'Escape') {
                // Cancel - restore original display
                const originalF = window.MathematicalFoundation?.F || window.Config?.F || 12;
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
            const layout = this.deps.MF ? this.deps.MF.computeLayout() : {};
            const F = this.deps.MF ? this.deps.MF.F : 12;
            
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
        }
        return this.element;
    }
    
    updateTitle(title) {
        console.log(`🏷️ Subheader updateTitle called: "${title}"`);
        
        // Ensure subheader is rendered
        if (!this.element) {
            console.log('🔄 Subheader not rendered, rendering now...');
            this.render();
        }
        
        const titleElement = this.element?.querySelector('.subheader-title');
        if (titleElement) {
            titleElement.textContent = title.toUpperCase();
            console.log(`✅ Subheader title updated to: "${titleElement.textContent}"`);
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
        let currentIndex = -1;
        
        if (currentSubsection === null || currentSubsection === undefined) {
            // For section index pages (like blog TOC), look for isTOC or section path
            currentIndex = items.findIndex(item => 
                item.isTOC === true || item.path === `#${this.currentSection}`
            );
        } else {
            // For subsection pages, look for ID or full path match
            currentIndex = items.findIndex(item => 
                item.id === currentSubsection || item.path === `#${this.currentSection}/${currentSubsection}`
            );
        }
        
        if (currentIndex === -1 || items.length <= 1) {
            this.prevItem = null;
            this.nextItem = null;
            return;
        }
        
        // Implement looping behavior
        // Previous: if at beginning (index 0), go to last item
        this.prevItem = currentIndex > 0 ? items[currentIndex - 1] : items[items.length - 1];
        
        // Next: if at end (last index), go to first item
        this.nextItem = currentIndex < items.length - 1 ? items[currentIndex + 1] : items[0];
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
            console.log('🔄 Force re-rendering subheader for clean state');
            this.element.remove();
            this.element = null;
            this.dropdownComponent = null;
        }
        
        console.log('🧹 Subheader cleared and will re-render on next use');
    }
    
    /**
     * Handle resize - recalculate layout like PageHeader
     */
    onResize() {
        if (this.element && this.deps.MF) {
            const layout = this.deps.MF.computeLayout();
            const F = this.deps.MF.F;
            
            // Update title section width
            const titleElement = this.element.querySelector('.subheader-title');
            if (titleElement) {
                titleElement.style.width = `${layout.subheaderTitleWidth}px`;
            }
            
            // Update navigation container width and position
            const navElement = this.element.querySelector('.subheader-nav');
            if (navElement) {
                navElement.style.left = `${layout.subheaderTitleWidth}px`;
                navElement.style.width = `${layout.subheaderNavContainerWidth}px`;
            }
            
            // Update navigation button widths
            const navButtons = this.element.querySelectorAll('.nav-button');
            if (navButtons.length >= 2) {
                navButtons[0].style.width = `${layout.subheaderPrevButtonWidth}px`;
                navButtons[1].style.width = `${layout.subheaderNextButtonWidth}px`;
            }
            
            console.log('📐 Subheader: Layout recalculated on resize');
        }
    }
    
    /**
     * Show subheader with proper display
     */
    show() {
        // Ensure subheader is rendered
        if (!this.element) {
            console.log('🔄 Subheader not rendered for show(), rendering now...');
            this.render();
        }
        
        if (this.element) {
            this.element.style.display = 'flex';
            // Force the display property to override any CSS
            this.element.style.setProperty('display', 'flex', 'important');
            
            // Update body class to show subheader
            document.body.className = 'with-subheader';
            
            console.log(`🧭 Subheader shown with title: "${this.sectionTitle || 'unknown'}" - display: ${this.element.style.display}, body class: ${document.body.className}`);
        }
    }
    
    /**
     * Hide subheader
     */
    hide() {
        if (this.element) {
            this.element.style.display = 'none';
            
            // Update body class to hide subheader
            document.body.className = 'no-subheader';
            
            console.log(`🧭 Subheader hidden - body class: ${document.body.className}`);
        }
    }
    
    /**
     * Update navigation buttons with new handlers (LEGACY METHOD - kept for compatibility)
     * @param {Function} onPrev - Previous page handler
     * @param {Function} onNext - Next page handler
     */
    updateNavigationLegacy(onPrev = null, onNext = null) {
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
     * Update navigation buttons with dynamic content and handlers
     * @param {Function} navigateCallback - Navigation callback function
     */
    updateNavigationButtons(navigateCallback = null) {
        if (!this.element) return;
        
        const prevButton = this.element.querySelector('.nav-button:first-child');
        const nextButton = this.element.querySelector('.nav-button:last-child');
        
        // Update Previous Button
        if (prevButton) {
            const originalPrevStyle = prevButton.style.cssText;
            prevButton.replaceWith(prevButton.cloneNode(true));
            const newPrevButton = this.element.querySelector('.nav-button:first-child');
            
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
            const newNextButton = this.element.querySelector('.nav-button:last-child');
            
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
     * Format navigation text for buttons
     */
    formatNavigationText(item, direction) {
        const title = item.title || item.id || 'ITEM';
        
        // Get actual button width from layout calculations
        const layout = this.deps.MF ? this.deps.MF.computeLayout() : {};
        const F = this.deps.MF ? this.deps.MF.F : 12;
        
        const buttonWidth = direction === 'prev' ? 
            (layout.subheaderPrevButtonWidth || 100) : 
            (layout.subheaderNextButtonWidth || 100);
        
        // Calculate available width: button width - 2*F for safety margins and arrow space
        const arrowAndSafetyWidth = 2 * F; // Space for " ←" or "→ " plus safety margin
        const availableWidth = buttonWidth - arrowAndSafetyWidth;
        
        // Estimate character width (Atkinson Hyperlegible is roughly 0.7 * F per character at 12px)
        const charWidth = F * 0.7;
        const maxChars = Math.floor(availableWidth / charWidth);
        
        // Ensure minimum of 4 characters and maximum of reasonable length
        const maxLength = Math.max(4, Math.min(maxChars, 25));
        
        let truncatedTitle = title.length > maxLength ? 
            title.substring(0, maxLength - 1) + '…' : title;
        
        return direction === 'prev' ? 
            `${truncatedTitle.toUpperCase()} ←` : 
            `→ ${truncatedTitle.toUpperCase()}`;
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
            
            console.log(`🧭 Subheader navigateToItem: ${item.path} → section=${section}, subsection=${subsection}`);
            navigateCallback(section, subsection);
        } else if (item.id && this.currentSection) {
            // Use current section with item id
            console.log(`🧭 Subheader navigateToItem: ${this.currentSection}/${item.id}`);
            navigateCallback(this.currentSection, item.id);
        }
    }
    
    /**
     * Set dropdown content for left side of subheader
     * @param {Array} items - Dropdown items {label, value, url}
     * @param {Function} onSelect - Selection handler
     */
    setDropdownContent(items, onSelect = null) {
        // Ensure subheader is rendered
        if (!this.element) {
            console.log('🔄 Subheader not rendered for setDropdownContent(), rendering now...');
            this.render();
        }
        
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
                width: 50%;
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
            
            // Position dropdown to match trigger width exactly
            dropdownMenu.style.width = '50%';
            dropdownMenu.style.border = '1px solid var(--c-border)';
            dropdownMenu.style.borderTop = '1px solid var(--c-border)'; // Keep top border for separation
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
