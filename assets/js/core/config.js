/**
 * SiteBoy Configuration - Deterministic Layout System
 *
 * SINGLE SOURCE OF TRUTH APPROACH:
 * - F base unit (typography + layout foundation)
 * - Single margin variable with B/S modes (B=tight/smaller, S=loose/larger)
 * - One F-snapped frame for all components (viewport - 2×margin, snapped to F multiple)
 * - Simple header/subheader splits: 50% title, 2F toggle, (50%-2F) sections
 * - Everything recalculates deterministically from F + margin mode
 *
 * USAGE FOR DYNAMIC CHANGES:
 * - Change F: everything scales proportionally
 * - Toggle B/S: margin changes, frame recalculates, all components adapt
 * - No manual overrides - single margin knob controls everything
 *
 * @version 4.0.0 - Deterministic Single-Margin Layout System
 */

// F configuration is loaded globally from f-config.js

// =================================================================
// SINGLE SOURCE OF TRUTH - F + MARGIN MODE
// =================================================================

// Configurable default margin mode - can be overridden by application
const DEFAULT_MARGIN_MODE = 'B'; // 'B' = big frame, 'S' = small frame

// Runtime F value storage - get from global set by f-config.js
let runtimeF = window.F || 14;

// Single margin mode: 'B' (big/larger frame) or 'S' (small/smaller frame)
let runtimeMarginMode = DEFAULT_MARGIN_MODE;

const MARGIN_PRESETS = {
    B: 1,  // 1F = small margins = big frame
    S: 4   // 4F = large margins = small frame
};

export const Config = {
    // F base unit - Dynamic getter/setter for runtime changes
    get F() {
        return runtimeF;
    },

    set F(value) {
        runtimeF = value;
    },

    // Single margin mode getter/setter
    get marginMode() {
        return runtimeMarginMode;
    },

    set marginMode(mode) {
        if (mode === 'B' || mode === 'S') {
            runtimeMarginMode = mode;
        }
    },

    // Component sizing (MATHEMATICAL EXPRESSIONS - Auto-calculating)
    get sizing() {
        return {
            header: this.F * 2,           // Always 2F
            subheader: this.F * 2,        // Always 2F
            footer: this.F * 2,           // Always 2F
            bodyMinH_withSub: this.F * 8, // Always 8F (header + subheader + content + footer)
            bodyMinH_noSub: this.F * 6,   // Always 6F (header + content + footer)
            gutter: 1,                    // Always 1px (minimum viable)
            pad: 1,                       // F padding multiplier
            indent: this.F * 2,           // Always 2F
            dropdownMaxH: this.F * 25,    // Always 25F
        };
    },

    // Grid system (SIMPLIFIED - now uses the shared frame)
    grid: {
        minCols: 1,
        maxCols: 6,
        gap: 1  // Always 1px gap
    },

    // SINGLE MARGIN SYSTEM - no desktop/mobile split
    get margin() {
        return this.F * MARGIN_PRESETS[this.marginMode]; // 2F for B, 4F for S
    },

    /**
     * Set margin mode (B=tight, S=loose)
     */
    setMarginMode(mode) {
        if (mode === 'B' || mode === 'S') {
            runtimeMarginMode = mode;
        }
    },

    /**
     * Toggle between B and S modes
     */
    toggleMarginMode() {
        this.marginMode = this.marginMode === 'B' ? 'S' : 'B';
    },
    
    // Footer configuration
    showBackToTop: false,       // Show/hide the ↑ TOP back-to-top button in footer
    showFooterControls: false,  // Toggle all footer controls (F display +/- buttons and B/S margin buttons)

    // Debug configuration
    debug: {
        INIT: false,        // Initialization/startup logs (ComponentLibrary, Sections, Router, App)
        LAYOUT: false,      // Layout calculations (F, margins, dimensions, PageContainer states)
        NAVIGATION: false,  // Route changes, subheader updates, navigation setup
        TOOLS: false,       // Tool loading, rendering, and operations
        VERBOSE: false      // Repetitive operations (dropdown open/close, multiple renders)
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
     * Initialize CSS variables for deterministic layout system
     */
    initializeCSSVars() {
        const root = document.documentElement;
        const layout = this.computeLayout();

        // Core F and margin variables
        root.style.setProperty('--f', `${Config.F}px`);
        root.style.setProperty('--F', `${Config.F}px`); // Legacy compatibility

        // Frame and margin variables
        root.style.setProperty('--frame-width', `${layout.frameWidth}px`);
        root.style.setProperty('--frame-height', `${layout.frameHeight}px`);
        root.style.setProperty('--frame-margin-left', `${layout.marginLeft}px`);
        root.style.setProperty('--frame-margin-right', `${layout.marginRight}px`);
        root.style.setProperty('--margin', `${Config.margin}px`);

        // Header dimensions and splits
        root.style.setProperty('--header-height', `${layout.headerHeight}px`);
        root.style.setProperty('--header-left-width', `${layout.mainHeaderLeftWidth}px`);
        root.style.setProperty('--header-toggle-width', `${layout.mainHeaderToggleWidth}px`);
        root.style.setProperty('--header-nav-width', `${layout.mainHeaderNavWidth}px`);

        // Subheader dimensions and splits
        root.style.setProperty('--subheader-title-width', `${layout.subheaderTitleWidth}px`);
        root.style.setProperty('--subheader-nav-width', `${layout.subheaderNavContainerWidth}px`);
        root.style.setProperty('--subheader-prev-width', `${layout.subheaderPrevButtonWidth}px`);
        root.style.setProperty('--subheader-next-width', `${layout.subheaderNextButtonWidth}px`);

        // Layout positions
        root.style.setProperty('--header-y', `${Config.margin}px`);
        root.style.setProperty('--subheader-y', `${Config.margin + layout.headerHeight}px`);
        root.style.setProperty('--content-y-with-sub', `${Config.margin + layout.headerHeight * 2}px`);
        root.style.setProperty('--content-y-no-sub', `${Config.margin + layout.headerHeight}px`);
        root.style.setProperty('--footer-y', `${window.innerHeight - layout.headerHeight - Config.margin}px`);

        // Content heights - frameHeight - 6F (header + subheader + footer) or frameHeight - 4F (no subheader), snapped to F multiples
        root.style.setProperty('--content-height-with-sub', `${Math.floor((layout.frameHeight - (6 * Config.F)) / Config.F) * Config.F}px`);
        root.style.setProperty('--content-height-no-sub', `${Math.floor((layout.frameHeight - (4 * Config.F)) / Config.F) * Config.F}px`);

        // Borders and separators
        root.style.setProperty('--outline-width', '1px');

        window.debugLog('INIT', '✅ Config: Deterministic layout variables initialized');
        window.debugLog('INIT', `   F=${Config.F}px, Frame=${layout.frameWidth}px×${layout.frameHeight}px, Margin=${Config.margin}px (${Config.marginMode} mode)`);
    },
    
    /**
     * Apply frame layout to element - uses the single shared frame
     */
    applyFrameLayout(element) {
        if (!element) return;
        const layout = this.computeLayout();
        element.style.width = `${layout.frameWidth}px`;
        element.style.marginLeft = `${layout.marginLeft}px`;
        element.style.marginRight = `${layout.marginRight}px`;
    },
    
    /**
     * DETERMINISTIC FRAME CALCULATION - Single F-snapped frame for all components
     * Frame width = (viewport - 2×margin) snapped to nearest F multiple
     * Simple header/subheader splits: 50% title, 2F toggle, (50%-2F) sections
     */
    computeLayout(width = window.innerWidth, height = window.innerHeight) {
        // Use clientWidth to account for scrollbar
        const actualWidth = document.documentElement ?
            Math.min(width, document.documentElement.clientWidth) : width;

        const F = Config.F;
        const isMobile = actualWidth < Config.breakpoints.desktop;
        const margin = isMobile ? 1 : Config.margin;
        const headerHeight = Config.sizing.header; // Always 2F

        // SINGLE FRAME CALCULATION - F-snapped for mathematical precision
        const availableWidth = actualWidth - 2 * margin;           // Viewport minus margins
        const frameWidth = isMobile
            ? availableWidth                                        // No F-snapping on mobile; use full available width
            : Math.floor(availableWidth / F) * F;                  // Snap to F multiple on desktop
        const availableHeight = height - 2 * margin;               // Viewport minus margins
        const frameHeight = Math.floor(availableHeight / F) * F;   // Snap to F multiple
        const marginLeft = (actualWidth - frameWidth) / 2;         // Center the frame
        const marginRight = marginLeft;                             // Symmetric margins

        // SIMPLE HEADER/SUBHEADER SPLITS - 50% title, 2F toggle, remainder sections
        // Account for 2px of borders: title-right(1px) + nav-right(1px)
        // Header needs separation between all functional areas unlike subheader
        const borderAdjustment = 2; // 2px total border width
        const headerAvailableWidth = frameWidth - borderAdjustment;
        const titleWidth = Math.floor(headerAvailableWidth / 2);     // 50% for title (adjusted)
        const toggleWidth = headerHeight;                             // 2F toggle (same as height)
        const navWidth = headerAvailableWidth - titleWidth - toggleWidth; // Exact remainder (adjusted)

        // SUBHEADER MIRRORS HEADER - same splits, same nav button math
        // Account for 2px of borders: title-right(1px) + prev-right(1px)
        const subheaderBorderAdjustment = 2; // 2px total border width
        const subheaderAvailableWidth = frameWidth - subheaderBorderAdjustment;
        const subheaderTitleWidth = Math.floor(subheaderAvailableWidth / 2); // Same 50% (adjusted)
        const subheaderNavWidth = subheaderAvailableWidth - subheaderTitleWidth; // Remaining (adjusted)
        const subheaderPrevWidth = Math.floor(subheaderNavWidth / 2); // Floor first half
        const subheaderNextWidth = subheaderNavWidth - subheaderPrevWidth; // Exact remainder

        return {
            // FRAME DIMENSIONS - single source for all components
            frameWidth,
            frameHeight,
            marginLeft,
            marginRight,
            headerHeight,

            // HEADER SPLITS - simple percentages
            mainHeaderLeftWidth: titleWidth,
            mainHeaderToggleWidth: toggleWidth,
            mainHeaderNavWidth: navWidth,

            // SUBHEADER SPLITS - mirrors header exactly
            subheaderTitleWidth,
            subheaderNavContainerWidth: subheaderNavWidth,
            subheaderPrevButtonWidth: subheaderPrevWidth,
            subheaderNextButtonWidth: subheaderNextWidth,

            // LEGACY COMPATIBILITY - for existing components
            gridWidth: frameWidth,
            cols: 1, // Simplified - frame is now the single layout unit
            boxSize: frameWidth,
            isDesktop: true, // Always desktop-like with single frame
            contentMinHeight: height - (margin + headerHeight * 2) // Frame height minus stacks
        };
    },
    
    /**
     * Apply container CSS variables using the shared frame
     */
    applyContainerVars(element, options = {}) {
        if (!element) return;
        const { withSubheader = false } = options;
        const layout = this.computeLayout();

        element.style.setProperty('--comp-w', `${layout.frameWidth}px`);
        element.style.setProperty('--comp-h', `${layout.headerHeight}px`);
        element.style.setProperty('--comp-min-h', withSubheader ? `calc(100vh - ${Config.F * 8}px)` : `calc(100vh - ${Config.F * 6}px)`);
        element.style.setProperty('--top-offset', withSubheader ?
            `calc(var(--margin) + var(--header-height) + var(--header-height))` :
            `calc(var(--margin) + var(--header-height))`);
        element.style.setProperty('--left-offset', `${layout.marginLeft}px`);
        element.style.setProperty('--frame-width', `${layout.frameWidth}px`);
    },

    /**
     * Calculate standard dimensions using F-system mathematical foundation
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
                return { ...base, maxHeight: `${Config.sizing.dropdownMaxH}px` };
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
    
    
    // ═══════════════════════════════════════════════════════════════════
    // MATH UTILITIES - Wrappers around math.js + animation helpers
    // ═══════════════════════════════════════════════════════════════════
    
    /**
     * Reference to math.js library (loaded via CDN)
     * @returns {object} math.js instance
     */
    get math() {
        return window.math;
    },
    
    /**
     * Safe power function - handles negative bases with fractional exponents
     * @param {number} base - Base value
     * @param {number} exp - Exponent
     * @returns {number} Result of base^exp, handling edge cases
     */
    safePow(base, exp) {
        if (!window.math) {
            // Fallback if math.js not loaded
            if (Math.abs(base) < 1e-9 && exp < 0) return 0;
            if (Math.abs(exp - 1) < 1e-9) return base;
            if (Math.abs(exp) < 1e-9) return 1;
            const sign = base >= 0 ? 1 : -1;
            const result = sign * Math.pow(Math.abs(base), exp);
            return isFinite(result) ? result : 0;
        }
        // math.js handles edge cases properly
        try {
            return window.math.pow(base, exp);
        } catch (e) {
            return 0;
        }
    },
    
    /**
     * Linear interpolation between two values
     * @param {number} a - Start value
     * @param {number} b - End value
     * @param {number} t - Interpolation factor (0-1)
     * @returns {number} Interpolated value
     */
    lerp(a, b, t) {
        return a + (b - a) * t;
    },
    
    /**
     * Clamp value between min and max
     * @param {number} value - Value to clamp
     * @param {number} min - Minimum bound
     * @param {number} max - Maximum bound
     * @returns {number} Clamped value
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },
    
    /**
     * Map value from one range to another
     * @param {number} value - Input value
     * @param {number} inMin - Input range minimum
     * @param {number} inMax - Input range maximum
     * @param {number} outMin - Output range minimum
     * @param {number} outMax - Output range maximum
     * @returns {number} Mapped value (returns outMin if inMin === inMax)
     */
    map(value, inMin, inMax, outMin, outMax) {
        if (inMin === inMax) return outMin;
        return outMin + (value - inMin) / (inMax - inMin) * (outMax - outMin);
    },
    
    /**
     * Wrap value within a range (for cyclic values like angles)
     * @param {number} value - Value to wrap
     * @param {number} min - Range minimum
     * @param {number} max - Range maximum
     * @returns {number} Wrapped value within [min, max) (returns min if min === max)
     */
    wrap(value, min, max) {
        const range = max - min;
        if (range === 0) return min;
        return ((value - min) % range + range) % range + min;
    },
    
    /**
     * Convert degrees to radians
     * @param {number} degrees - Angle in degrees
     * @returns {number} Angle in radians
     */
    toRadians(degrees) {
        return degrees * Math.PI / 180;
    },
    
    /**
     * Convert radians to degrees
     * @param {number} radians - Angle in radians
     * @returns {number} Angle in degrees
     */
    toDegrees(radians) {
        return radians * 180 / Math.PI;
    },

    // ═══════════════════════════════════════════════════════════════════
    // COMPONENT DIMENSIONS
    // ═══════════════════════════════════════════════════════════════════
    
    /**
     * Calculate component dimensions using deterministic frame system
     * @param {string} type - Component type for dimension calculation
     * @returns {object} Dimensions object with layout, F, and component-specific measurements
     */
    calculateDimensions(type = 'default') {
        const layout = this.computeLayout();
        const F = this.F;

        // Component-specific dimension calculations - now uses shared frame
        const componentDimensions = {
            default: {},
            page: {
                headerHeight: Config.sizing.header,
                subheaderHeight: Config.sizing.subheader,
                footerHeight: Config.sizing.footer,
                frameWidth: layout.frameWidth,
                margin: Config.margin,
                contentMinHeight: Config.sizing.bodyMinH_withSub
            },
            header: {
                height: Config.sizing.header,
                leftWidth: layout.mainHeaderLeftWidth,
                toggleWidth: layout.mainHeaderToggleWidth,
                navWidth: layout.mainHeaderNavWidth
            },
            subheader: {
                height: Config.sizing.subheader,
                titleWidth: layout.subheaderTitleWidth,
                navWidth: layout.subheaderNavContainerWidth,
                prevButtonWidth: layout.subheaderPrevButtonWidth,
                nextButtonWidth: layout.subheaderNextButtonWidth
            },
            footer: {
                height: Config.sizing.footer,
                frameWidth: layout.frameWidth
            },
            grid: {
                frameWidth: layout.frameWidth,
                gap: Config.grid.gap
            },
            dropdown: {
                maxHeight: Config.sizing.dropdownMaxH,
                itemHeight: F * 2, // 24px per item
                frameWidth: layout.frameWidth
            },
            'animation-canvas': {
                width: F * 67,    // 804px at F=12, 938px at F=14
                height: F * 67,   // Square canvas for generative animations
                sidebarWidth: F * 36  // 432px at F=12, 504px at F=14
            },
            'export-presets': {
                // Instagram export presets
                square: { width: 1080, height: 1080, label: 'Square (1080×1080)' },
                portrait: { width: 1080, height: 1920, label: 'Portrait (1080×1920)' },
                story: { width: 1080, height: 1920, label: 'Story (1080×1920)' },
                landscape: { width: 1920, height: 1080, label: 'Landscape (1920×1920)' }
            }
        };

        return {
            layout,
            F,
            margin: Config.margin,
            marginMode: Config.marginMode,
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
// GLOBALS - Make available for all scripts
// =================================================================

// =================================================================
// DEBUG UTILITIES
// =================================================================

/**
 * Conditional console.log wrapper - only logs if debug flag is enabled
 * @param {string} category - Debug category (INIT, LAYOUT, NAVIGATION, TOOLS, VERBOSE)
 * @param  {...any} args - Arguments to pass to console.log
 */
export function debugLog(category, ...args) {
    if (Config.debug && Config.debug[category]) {
        console.log(...args);
    }
}

/**
 * Enable/disable specific debug categories
 * @param {string|string[]|object} categories - Category name(s) or object with boolean values
 * @param {boolean} enabled - Enable/disable (only used if categories is a string or array)
 * 
 * Examples:
 *   debugToggle('INIT', true)                    // Enable INIT logs
 *   debugToggle(['INIT', 'LAYOUT'], true)        // Enable multiple categories
 *   debugToggle({ INIT: true, VERBOSE: false })  // Set multiple categories
 *   debugToggle('ALL', true)                     // Enable all categories
 */
export function debugToggle(categories, enabled = true) {
    if (categories === 'ALL') {
        Object.keys(Config.debug).forEach(key => {
            Config.debug[key] = enabled;
        });
        console.log(`✅ ${enabled ? 'Enabled' : 'Disabled'} all debug categories`);
        return;
    }

    if (typeof categories === 'object' && !Array.isArray(categories)) {
        Object.entries(categories).forEach(([key, value]) => {
            if (Config.debug.hasOwnProperty(key)) {
                Config.debug[key] = value;
            }
        });
        console.log('✅ Debug configuration updated:', Config.debug);
        return;
    }

    const categoryList = Array.isArray(categories) ? categories : [categories];
    categoryList.forEach(cat => {
        if (Config.debug.hasOwnProperty(cat)) {
            Config.debug[cat] = enabled;
        }
    });
    console.log(`✅ ${enabled ? 'Enabled' : 'Disabled'} debug categories:`, categoryList);
}

// Make globals available for all scripts
window.Config = Config;
window.LayoutCalculator = LayoutCalculator;
window.ComponentCalculator = ComponentCalculator;
window.debugLog = debugLog;
window.debugToggle = debugToggle;
