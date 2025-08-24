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
    // Base mathematical unit
    F: 12,
    
    // Component sizing (in multiples of F)
    sizing: {
        header: 2,          // headerH = F * 2 = 24px
        subheader: 2,       // subheaderH = F * 2 = 24px  
        footer: 2,          // footerH = F * 2 = 24px
        bodyMinH_withSub: 8,    // body min height offset with subheader = F * 8
        bodyMinH_noSub: 6,      // body min height offset without subheader = F * 6
        gutter: 1,          // gutter = F = 12px
        pad: 1,             // padding = F = 12px
        indent: 2,          // indent = F * 2 = 24px
        dropdownMaxH: 25,   // dropdown max height = F * 25 = 300px
    },
    
    // Grid system constants
    grid: {
        minCols: 1,
        maxCols: 6,
        aspectMultiplier: 3.982,
        aspectOffset: 1.088
    },
    
    // Responsive margins
    margins: {
        desktop: 48,  // targetMargin = H * 2 
        mobile: 12
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
     * Initialize CSS variables on document root
     */
    initializeCSSVars() {
        const root = document.documentElement;
        root.style.setProperty('--F', `${Config.F}px`);
        root.style.setProperty('--header-height', `${Config.F * 2}px`);
        root.style.setProperty('--target-margin', `${Config.margins.desktop}px`);
        root.style.setProperty('--mobile-margin', `${Config.margins.mobile}px`);
        console.log('✅ Config: CSS variables initialized');
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
     * Calculate grid geometry for given parameters
     */
    calculateGridGeometry(viewportWidth, cols, gap, margin) {
        const usableWidth = viewportWidth - 2 * margin;
        const maxBoxSize = Math.floor((usableWidth - (cols - 1) * gap) / cols);
        const gridWidth = maxBoxSize * cols + (cols - 1) * gap;
        const leftover = viewportWidth - gridWidth;
        
        return {
            boxSize: maxBoxSize,
            gridWidth,
            marginLeft: Math.floor(leftover / 2),
            marginRight: leftover - Math.floor(leftover / 2)
        };
    },
    
    /**
     * H-based layout computation - the core layout system
     */
    computeLayout(width = window.innerWidth, height = window.innerHeight) {
        const H = Config.F * 2; // Header height = 24px
        // FIXED: Better desktop detection - consider both width AND screen size
        // Portrait on desktop/tablet should still use desktop layout
        const isDesktop = width > Config.breakpoints.desktop || 
                         (width > 600 && height > 600); // Tablet/desktop in portrait
        
        if (isDesktop) {
            // Desktop: HW = window width - 2*H (as you specified)
            const HW = width - (2 * H);
            const centerOffset = (width - HW) / 2; // For centering = H
            const cols = this.computeColumns(width, height);
            const geo = this.calculateGridGeometry(HW, cols, Config.grid.gap, 0);
            
            // Calculate header split accounting for border offset (from reference)
            let headerSplit;
            if (cols % 2 === 0) {
                // For even columns, split at the gap between middle columns
                const colsBeforeSplit = cols / 2;
                // Add 1px to account for the border shifting content
                headerSplit = (geo.boxSize * colsBeforeSplit) + 
                              (Config.grid.gap * (colsBeforeSplit - 1)) + 
                              Math.floor(Config.grid.gap / 2) + 1;
            } else {
                // For odd columns, split at center
                headerSplit = Math.floor(HW / 2) + 1;
            }
            
            // Calculate precise header component widths
            const mainHeaderLeftWidth = headerSplit;
            const mainHeaderToggleWidth = H; // 24px square toggle
            const mainHeaderNavWidth = HW - mainHeaderLeftWidth - mainHeaderToggleWidth;
            
            return {
                isDesktop: true,
                marginLeft: centerOffset,  // H for centering
                gridWidth: HW,             // Header/body/footer width
                headerHeight: H,           // 24px
                contentMinHeight: height - (4 * H), // Your specification: window height - 4*H
                // Header split calculations
                headerSplit,
                mainHeaderLeftWidth,
                mainHeaderNavWidth,
                mainHeaderToggleWidth,
                // Legacy properties for compatibility
                cols,
                boxSize: geo.boxSize,
                marginRight: centerOffset
            };
        } else {
            // Mobile: full width with minimal margins
            return {
                isDesktop: false,
                marginLeft: Config.F,      // 12px mobile margin
                gridWidth: width - (2 * Config.F), // Window - 24px
                headerHeight: H,
                contentMinHeight: height - (3 * H), // Mobile: less vertical margin
                // Legacy properties for compatibility  
                cols: 1,
                boxSize: width - (2 * Config.F),
                marginRight: Config.F
            };
        }
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
