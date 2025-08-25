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
    // CRITICAL: Use old build's mathematical system for perfect alignment
    // Base mathematical unit - F=12px for typography, H=30px for layout
    F: 12,
    
    // OLD BUILD'S PERFECT HEADER HEIGHT (NOT F-based)
    headerHeight: 30,  // FIXED 30px like old build (not F*2=24px)
    
    // Component sizing (using old build's mathematical relationships)
    sizing: {
        header: 30,         // headerH = 30px (old build's perfect system)
        subheader: 30,      // subheaderH = 30px  
        footer: 30,         // footerH = 30px
        bodyMinH_withSub: 8,    // body min height offset with subheader = F * 8
        bodyMinH_noSub: 6,      // body min height offset without subheader = F * 6
        gutter: 1,          // gutter = F = 12px
        pad: 1,             // padding = F = 12px
        indent: 2,          // indent = F * 2 = 24px
        dropdownMaxH: 25,   // dropdown max height = F * 25 = 300px
    },
    
    // OLD BUILD'S EXACT GRID SYSTEM CONSTANTS
    grid: {
        minCols: 1,
        maxCols: 6,
        aspectMultiplier: 3.982,  // Old build's exact values
        aspectOffset: 1.088,      // Old build's exact values
        gap: 1                    // Old build's 1px gap
    },
    
    // OLD BUILD'S EXACT MARGINS
    margins: {
        desktop: 64,  // targetMargin = 64px (old build's exact value)
        mobile: 5     // mobileMargin = 5px (old build's exact value)
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
     * Initialize CSS variables using OLD BUILD'S PERFECT SYSTEM
     */
    initializeCSSVars() {
        const root = document.documentElement;
        root.style.setProperty('--f', `${Config.F}px`); // F=12px for typography
        root.style.setProperty('--F', `${Config.F}px`); // Legacy compatibility
        root.style.setProperty('--header-height', `${Config.headerHeight}px`); // 30px fixed
        root.style.setProperty('--target-margin', `${Config.margins.desktop}px`); // 64px
        root.style.setProperty('--mobile-margin', `${Config.margins.mobile}px`); // 5px
        root.style.setProperty('--outline-width', '1px'); // Old build's border width
        console.log('✅ Config: CSS variables initialized with old build\'s mathematical system');
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
     * OLD BUILD'S PERFECT LAYOUT COMPUTATION
     * Uses 30px header height and precise grid geometry
     */
    computeLayout(width = window.innerWidth, height = window.innerHeight) {
        const cols = this.computeColumns(width, height);
        const currentMargin = cols === 1 ? Config.margins.mobile : Config.margins.desktop;
        const geo = this.calculateGridGeometry(width, cols, Config.grid.gap, currentMargin);
        const headerHeight = Config.headerHeight; // 30px fixed
        
        // OLD BUILD'S PRECISE HEADER CALCULATIONS
        const mainHeaderLeftWidth = Math.floor(geo.gridWidth / 2);
        const mainHeaderToggleWidth = headerHeight; // 30px square
        const mainHeaderNavWidth = geo.gridWidth - mainHeaderLeftWidth - mainHeaderToggleWidth;

        // OLD BUILD'S PRECISE SUBHEADER CALCULATIONS  
        const subheaderTitleWidth = mainHeaderLeftWidth - 1; // Border compensation
        const subheaderNavContainerWidth = geo.gridWidth - subheaderTitleWidth;
        const subheaderPrevButtonWidth = Math.floor(subheaderNavContainerWidth / 2);
        const subheaderNextButtonWidth = subheaderNavContainerWidth - subheaderPrevButtonWidth;

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
            contentMinHeight: height - (headerHeight * 4), // OLD BUILD LOGIC
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
     * Calculate standard dimensions for component types
     * (Consolidated from ComponentCalculator for simplified architecture)
     */
    calculateComponentDimensions(type) {
        const F = Config.F;
        const base = { 
            width: '100%', 
            height: `${F * 2}px`, 
            minHeight: `${F * 2}px` 
        };
        
        switch (type) {
            case 'button':
                return { ...base, width: `${F * 8}px`, height: `${F * 2}px` };
            case 'dropdown':
                return { ...base, maxHeight: `${F * 25}px` };
            case 'grid':
                return { width: '100%', minHeight: `${F * 4}px` };
            case 'canvas':
                return { width: '100%', height: `${F * 20}px`, maxWidth: `${F * 50}px` };
            case 'markdown':
                return { width: '100%', minHeight: `calc(100vh - ${F * 6}px)` };
            case 'subheader':
                return { width: '100%', height: `${F * 2}px` };
            case 'header':
            case 'footer':
                return { width: '100%', height: `${F * 2}px` };
            default:
                return base;
        }
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
