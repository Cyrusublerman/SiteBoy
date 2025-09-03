/**
 * SiteBoy Configuration - Stable Constants & Core Calculations
 * 
 * STABLE CORE INFO:
 * - F=12px mathematical foundation
 * - Layout calculation functions
 * - CSS variable management  
 * - Component dimension rules
 * - Responsive breakpoints
 * 
 * @version 1.0.0 - Extracted from kitchen-sink app.js
 */

// =================================================================
// CORE CONSTANTS - STABLE THROUGHOUT SESSION
// =================================================================

export const Config = {
    // F=12px base unit (paragraph font size) - KEEP F SYSTEM INTACT
    F: 12,
    
    // Component sizing (F-BASED INTEGER MULTIPLES - YOUR ORIGINAL SYSTEM)
    sizing: {
        header: 24,             // 2 * F = 24px (KEEP YOUR F SYSTEM)
        subheader: 24,          // 2 * F = 24px  
        footer: 24,             // 2 * F = 24px
        bodyMinH_withSub: 96,   // F * 8 = 96px
        bodyMinH_noSub: 72,     // F * 6 = 72px
        gutter: 1,              // 1px gap
        pad: 1,                 // F padding multiplier
        indent: 2,              // F * 2 = 24px
        dropdownMaxH: 300,      // F * 25 = 300px
    },
    
    // Grid system (USE REFERENCE PRECISION TECHNIQUES WITH YOUR VALUES)
    grid: {
        minCols: 1,
        maxCols: 6,
        aspectMultiplier: 3.982,  // Reference build's empirical values
        aspectOffset: 1.088,      // Reference build's empirical values
        gap: 1                    // 1px gap
    },
    
    // Margins (F-BASED SYSTEM - YOUR ORIGINAL)
    margins: {
        desktop: 48,    // 4 * F = 48px (KEEP YOUR F SYSTEM)
        mobile: 6       // F/2 = 6px
    },
    
    // Breakpoints
    breakpoints: {
        desktop: 768  // Simple mobile/desktop split
    },
    
    // VGA Color constants (if needed)
    colors: {
        // Add VGA color definitions here if not handled in CSS
    }
};

// =================================================================
// LAYOUT CALCULATION FUNCTIONS - PURE FUNCTIONS
// =================================================================

export const LayoutCalculator = {
    
    // Expose F value for component calculations
    get F() {
        return Config.F;
    },
    
    /**
     * Initialize CSS variables using FIXED INTEGER VALUES
     */
    initializeCSSVars() {
        const root = document.documentElement;
        root.style.setProperty('--f', `${Config.F}px`); // F=12px for typography only
        root.style.setProperty('--F', `${Config.F}px`); // Legacy compatibility
        root.style.setProperty('--header-height', `${Config.sizing.header}px`); // 2F = 24px
        root.style.setProperty('--target-margin', `${Config.margins.desktop}px`); // 4F = 48px
        root.style.setProperty('--mobile-margin', `${Config.margins.mobile}px`); // F/2 = 6px
        root.style.setProperty('--outline-width', '1px'); // Fixed 1px border
        console.log('✅ Config: CSS variables initialized with SIMPLE F MULTIPLES');
        console.log(`   F=${Config.F}px, Header=2F=${Config.sizing.header}px, Margin=4F=${Config.margins.desktop}px, Mobile=F/2=${Config.margins.mobile}px`);
    },
    
    /**
     * Compute responsive columns based on aspect ratio
     */
    computeColumns(width, height) {
        const aspect = width / height;
        return Math.max(Config.grid.minCols, Math.min(Config.grid.maxCols, 
            Math.round(Config.grid.aspectMultiplier * aspect - Config.grid.aspectOffset)));
    },
    
    /**
     * Calculate grid geometry using OLD BUILD'S PERFECT SYSTEM
     * This ensures mathematical precision with no rounding errors
     */
    calculateGridGeometry(viewportWidth, cols, gap, margin) {
        const usableWidth = viewportWidth - 2 * margin;
        const maxBoxSize = Math.floor((usableWidth - (cols - 1) * gap) / cols);
        const gridWidth = maxBoxSize * cols + (cols - 1) * gap;
        const leftover = viewportWidth - gridWidth;
        const marginLeft = Math.floor(leftover / 2);
        const marginRight = leftover - marginLeft; // No rounding errors
        
        return { boxSize: maxBoxSize, gridWidth, marginLeft, marginRight };
    },
    
    /**
     * Apply layout to element (OLD BUILD'S BORDER-AWARE SYSTEM)
     */
    applyLayout(element, layout) {
        if (!element) return;
        element.style.width = `${layout.gridWidth}px`;
        element.style.marginLeft = `${layout.marginLeft}px`;
        element.style.marginRight = `${layout.marginRight}px`;
    },
    
    /**
     * Apply layout with border compensation (OLD BUILD'S PRECISION)
     */
    applyLayoutWithBorder(element, layout) {
        if (!element) return;
        element.style.width = `${layout.gridWidth + 2}px`;      // +2px for borders
        element.style.marginLeft = `${layout.marginLeft - 1}px`; // -1px compensation
        element.style.marginRight = `${layout.marginRight - 1}px`; // -1px compensation
    },
    
    /**
     * PERFECT MATHEMATICAL LAYOUT using OLD BUILD'S techniques
     * Key: Floor first half, calculate remainder for second half (NO ROUNDING ERRORS)
     */
    computeLayout(width = window.innerWidth, height = window.innerHeight) {
        const cols = this.computeColumns(width, height);
        const currentMargin = cols === 1 ? Config.margins.mobile : Config.margins.desktop;
        const geo = this.calculateGridGeometry(width, cols, Config.grid.gap, currentMargin);
        const headerHeight = Config.sizing.header; // 24px (2*F) - KEEP F SYSTEM
        
        // REFERENCE MATHEMATICAL PRECISION: Header split calculation with border offset
        let headerSplit;
        if (cols % 2 === 0) {
            // For even columns, split at the gap between middle columns (REFERENCE TECHNIQUE)
            const colsBeforeSplit = cols / 2;
            // Add 1px to account for the border shifting content (REFERENCE PRECISION)
            headerSplit = (geo.boxSize * colsBeforeSplit) + (Config.grid.gap * (colsBeforeSplit - 1)) + Math.floor(Config.grid.gap / 2) + 1;
        } else {
            // For odd columns, split at center (REFERENCE TECHNIQUE)
            headerSplit = Math.floor(geo.gridWidth / 2) + 1;
        }
        
        const mainHeaderLeftWidth = headerSplit;                        // REFERENCE precision with F values
        const mainHeaderToggleWidth = headerHeight;                     // 24px (2*F) perfect square
        const mainHeaderNavWidth = geo.gridWidth - mainHeaderLeftWidth - mainHeaderToggleWidth; // EXACT remainder

        // SUBHEADER PERFECT CENTERING (REFERENCE precision with border compensation)
        const subheaderTitleWidth = mainHeaderLeftWidth - 1;          // -1px border compensation (old build technique)
        const subheaderNavContainerWidth = geo.gridWidth - subheaderTitleWidth;
        const subheaderPrevButtonWidth = Math.floor(subheaderNavContainerWidth / 2);    // FLOOR (1:2 ratio)
        const subheaderNextButtonWidth = subheaderNavContainerWidth - subheaderPrevButtonWidth; // EXACT remainder

        return { 
            cols, 
            ...geo, 
            headerHeight, 
            mainHeaderLeftWidth,
            mainHeaderNavWidth,
            mainHeaderToggleWidth,
            subheaderTitleWidth,
            subheaderNavContainerWidth,
            subheaderPrevButtonWidth,
            subheaderNextButtonWidth,
            // Additional properties for compatibility
            isDesktop: cols > 1,
            contentMinHeight: height - (Config.margins.desktop + headerHeight * 2), // Fixed integer calculation
            boxSize: geo.boxSize
        };
    },
    
    /**
     * Apply container-specific CSS variables
     */
    applyContainerVars(element, options = {}) {
        if (!element) return;
        const { withSubheader = false } = options;
        const layout = this.computeLayout();
        
        element.style.setProperty('--comp-w', `${layout.gridWidth}px`);
        element.style.setProperty('--comp-h', `${layout.headerHeight}px`);
        element.style.setProperty('--comp-min-h', withSubheader ? `calc(100vh - ${Config.F * 8}px)` : `calc(100vh - ${Config.F * 6}px)`);
        element.style.setProperty('--top-offset', withSubheader ? 
            `calc(var(--target-margin) + var(--header-height) + var(--header-height))` : 
            `calc(var(--target-margin) + var(--header-height))`);
        element.style.setProperty('--left-offset', `${layout.marginLeft}px`);
        element.style.setProperty('--grid-width', `${layout.gridWidth}px`);
    },

    /**
     * Calculate standard dimensions using F=12px mathematical foundation
     */
    calculateComponentDimensions(type) {
        const F = Config.F;
        const headerHeight = Config.sizing.header; // 2F = 24px
        
        const base = { 
            width: '100%', 
            height: `${headerHeight}px`, 
            minHeight: `${headerHeight}px` 
        };
        
        switch (type) {
            case 'button':
                return { ...base, width: `${F * 8}px`, height: `${headerHeight}px` };
            case 'dropdown':
                return { ...base, maxHeight: `${F * 25}px` };
            case 'grid':
                return { width: '100%', minHeight: `${F * 4}px` };
            case 'canvas':
                return { width: '100%', height: `${F * 20}px`, maxWidth: `${F * 50}px` };
            case 'markdown':
                return { width: '100%', minHeight: `calc(100vh - ${F * 6}px)` };
            case 'subheader':
            case 'header':
            case 'footer':
                return { width: '100%', height: `${headerHeight}px` };
            default:
                return base;
        }
    },
    
    /**
     * BORDER ALIGNMENT FUNCTIONS (Old Build's Perfect Techniques)
     */
    alignDropdownBorders(dropdown, parentElement) {
        if (!dropdown || !parentElement) return;
        
        // OLD BUILD'S -1px BORDER ALIGNMENT TECHNIQUE
        dropdown.style.left = '-1px';           // Align with parent left border
        dropdown.style.right = '-1px';          // Align with parent right border  
        dropdown.style.borderTop = 'none';      // Merge with parent bottom border
        dropdown.style.position = 'absolute';
        dropdown.style.top = '100%';            // Position below parent
    },
    
    /**
     * Create perfect pixel separators (like old build's header separators)
     */
    createSeparator(element, side = 'right') {
        if (!element) return;
        
        const separator = element.querySelector('::after') || 
                         document.createElement('div');
        
        separator.style.cssText = `
            content: '';
            position: absolute;
            ${side}: 0;
            top: 0;
            bottom: 0;
            width: var(--outline-width);
            background: var(--c-border);
            pointer-events: none;
        `;
        
        if (!element.querySelector('::after')) {
            element.appendChild(separator);
        }
    },
    
    /**
     * Ensure integer-only measurements (prevent fractional pixels)
     */
    ensureIntegerLayout(layout) {
        const integerLayout = { ...layout };
        
        // Force all measurements to integers
        integerLayout.boxSize = Math.floor(layout.boxSize);
        integerLayout.gridWidth = integerLayout.boxSize * layout.cols + (layout.cols - 1) * Config.grid.gap;
        integerLayout.marginLeft = Math.floor(layout.marginLeft);
        integerLayout.marginRight = layout.viewportWidth ? 
            layout.viewportWidth - integerLayout.gridWidth - integerLayout.marginLeft :
            layout.marginRight;
            
        // Recalculate header splits with integer grid
        integerLayout.mainHeaderLeftWidth = Math.floor(integerLayout.gridWidth / 2);
        integerLayout.mainHeaderToggleWidth = Config.sizing.header;
        integerLayout.mainHeaderNavWidth = integerLayout.gridWidth - 
            integerLayout.mainHeaderLeftWidth - integerLayout.mainHeaderToggleWidth;
        
        return integerLayout;
    },
    
    /**
     * Calculate component dimensions - Required by BaseComponent architecture
     * @param {string} type - Component type for dimension calculation
     * @returns {object} Dimensions object with layout, F, and component-specific measurements
     */
    calculateDimensions(type = 'default') {
        const layout = this.computeLayout();
        const F = this.F;
        
        // Component-specific dimension calculations
        const componentDimensions = {
            default: {},
            page: {
                headerHeight: Config.sizing.header,
                subheaderHeight: Config.sizing.subheader,
                footerHeight: Config.sizing.footer,
                contentMinHeight: Config.sizing.bodyMinH_withSub
            },
            header: {
                height: Config.sizing.header,
                leftWidth: layout.mainHeaderLeftWidth,
                rightWidth: layout.mainHeaderRightWidth
            },
            subheader: {
                height: Config.sizing.subheader,
                titleWidth: layout.subheaderTitleWidth,
                navWidth: layout.subheaderNavContainerWidth,
                prevButtonWidth: layout.subheaderPrevButtonWidth,
                nextButtonWidth: layout.subheaderNextButtonWidth
            },
            footer: {
                height: Config.sizing.footer
            },
            grid: {
                cols: layout.cols,
                itemSize: layout.galleryItemSize,
                gap: Config.grid.gap
            },
            dropdown: {
                maxHeight: Config.sizing.dropdownMaxH,
                itemHeight: F * 2 // 24px per item
            }
        };
        
        return {
            layout,
            F,
            dimensions: componentDimensions[type] || componentDimensions.default,
            type
        };
    }
};

// =================================================================
// LEGACY EXPORTS - Maintained for compatibility
// =================================================================

// ComponentCalculator is now consolidated into LayoutCalculator
export const ComponentCalculator = LayoutCalculator;

// =================================================================
// EXPORTS - Clean interface for consuming modules
// =================================================================

// Export everything for easy importing
export default {
    Config,
    LayoutCalculator,
    ComponentCalculator
};
