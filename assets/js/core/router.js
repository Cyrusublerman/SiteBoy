/**
 * Router - SiteBoy Framework
 *
 * SINGLE SOURCE OF TRUTH FOR ROUTING:
 * - Hash-based navigation (#section/subsection)
 * - Route parsing and validation
 * - Navigation callbacks and state management
 * - Section loading coordination
 *
 * @version 1.0.0 - Single Source of Truth for Routing
 * @dependencies ['SiteBoyApp'] - Integrates with app for content building
 */

const Router = {
    version: '1.0.0',

    // Route state
    currentRoute: { section: 'home', subsection: null, isFullMode: false },
    routeChangeCallbacks: new Set(),

    // Available sections (matches app.js)
    sections: {
        'home': 'HomeSection',
        'blog': 'BlogSection',
        'art': 'ArtSection',
        'tools': 'ToolsSection',
        'projects': 'ProjectsSection',
        'contact': 'ContactSection',
        'qr': 'QrHubSection'
    },

    /**
     * Initialize router
     */
    init() {
        window.debugLog('INIT', `🧭 Router v${this.version} initializing...`);

        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleRouteChange());

        // Handle initial route
        this.handleRouteChange();

        window.debugLog('INIT', '✅ Router initialized');
    },

    /**
     * Parse current URL hash into section, subsection, and display mode
     * Supports :full modifier for full-page mode (no header/footer)
     * @returns {Object} { section, subsection, isFullMode }
     * 
     * Examples:
     *   #tools/about-you       → { section: 'tools', subsection: 'about-you', isFullMode: false }
     *   #tools/about-you:full  → { section: 'tools', subsection: 'about-you', isFullMode: true }
     *   #home:full             → { section: 'home', subsection: null, isFullMode: true }
     */
    parseRoute() {
        let hash = window.location.hash.slice(1).replace(/^\/+/, ''); // Remove # and any leading slashes
        console.log(`🔍 Router.parseRoute() - raw hash: "${hash}"`);

        // Check for :full modifier
        const isFullMode = hash.endsWith(':full');
        if (isFullMode) {
            hash = hash.slice(0, -5); // Remove ':full' suffix
            console.log(`🖼️ Full mode detected! Stripped hash: "${hash}"`);
        }

        // Handle empty or home route
        if (!hash || hash === 'home') {
            return { section: 'home', subsection: null, isFullMode };
        }

        // Parse section/subsection
        const parts = hash.split('/');
        const section = parts[0] || 'home';
        const subsection = parts.length > 1 ? parts.slice(1).join('/') : null;

        console.log(`🔍 Parsed route: section="${section}", subsection="${subsection}", isFullMode=${isFullMode}`);
        return { section, subsection, isFullMode };
    },

    /**
     * Handle route changes - notify all callbacks
     */
    handleRouteChange() {
        const newRoute = this.parseRoute();
        const { section, subsection, isFullMode } = newRoute;

        const modeStr = isFullMode ? ':full' : '';
        window.debugLog('NAVIGATION', `🧭 Route change: ${section}${subsection ? '/' + subsection : ''}${modeStr}`);

        // Update current route
        this.currentRoute = newRoute;

        // Notify all callbacks (including SiteBoyApp)
        this.routeChangeCallbacks.forEach(callback => {
            try {
                callback(newRoute);
            } catch (error) {
                console.error('Router callback error:', error);
            }
        });
    },

    /**
     * Subscribe to route changes
     * @param {Function} callback - Called with { section, subsection }
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback) {
        this.routeChangeCallbacks.add(callback);
        return () => this.routeChangeCallbacks.delete(callback);
    },

    /**
     * Navigate to a section
     * @param {string} section - Section name
     * @param {string|null} subsection - Subsection name
     * @param {boolean} fullMode - Whether to use full-page mode (no header/footer)
     */
    navigateToSection(section, subsection = null, fullMode = false) {
        const fullSuffix = fullMode ? ':full' : '';
        const hash = `#${section}${subsection ? '/' + subsection : ''}${fullSuffix}`;

        if (window.location.hash !== hash) {
            window.location.hash = hash;
            // hashchange event will trigger handleRouteChange
        }
    },

    /**
     * Get current route info
     * @returns {Object} { section, subsection }
     */
    getCurrentRoute() {
        return { ...this.currentRoute };
    },

    /**
     * Check if a route is valid
     * @param {string} section - Section name
     * @param {string|null} subsection - Subsection name
     * @param {boolean} fullMode - Whether route uses full-page mode
     * @returns {boolean}
     */
    isValidRoute(section, subsection = null, fullMode = false) {
        // Check if section exists
        if (!this.sections[section]) {
            return false;
        }

        // Full mode is always valid for any route
        // Additional validation can be added here
        return true;
    },

    /**
     * Get available sections
     * @returns {Object} Section mapping
     */
    getSections() {
        return { ...this.sections };
    },

    /**
     * Register a new section (for dynamic loading)
     * @param {string} sectionName - Section identifier
     * @param {string} moduleName - Global module name
     */
    registerSection(sectionName, moduleName) {
        this.sections[sectionName] = moduleName;
        window.debugLog('VERBOSE', `📝 Router registered section: ${sectionName} -> ${moduleName}`);
    },

    /**
     * Unregister a section
     * @param {string} sectionName - Section identifier
     */
    unregisterSection(sectionName) {
        if (this.sections[sectionName]) {
            delete this.sections[sectionName];
            window.debugLog('VERBOSE', `🗑️ Router unregistered section: ${sectionName}`);
        }
    }
};

// =================================================================
// ES MODULE EXPORT & BACKWARD COMPATIBILITY
// =================================================================

/**
 * ES module export for modern code
 * Provides tree-shakeable access to Router
 */
export { Router };

/**
 * Global compatibility layer for legacy tools
 * Maintains backward compatibility during migration
 */
if (typeof window !== 'undefined') {
  // Global registration
  window.Router = Router;
}

window.debugLog('INIT', `🧭 Router v${Router.version} loaded - Single source of truth for routing`);


