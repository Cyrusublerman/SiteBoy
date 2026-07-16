/**
 * Router - SiteBoy Framework
 *
 * SINGLE SOURCE OF TRUTH FOR ROUTING:
 * - Normal history paths for public knowledge: /wiki, /blog and /figures
 * - Backward-compatible hash navigation for existing SiteBoy sections
 * - Route parsing and validation
 * - Navigation callbacks and state management
 * - Section loading coordination
 *
 * @version 2.0.0 - Hybrid public-path and legacy-hash routing
 * @dependencies ['SiteBoyApp'] - Integrates with app for content building
 */

const Router = {
    version: '2.0.0',

    currentRoute: { section: 'home', subsection: null, isFullMode: false, routeMode: 'hash' },
    routeChangeCallbacks: new Set(),

    sections: {
        'home': 'HomeSection',
        'wiki': 'WikiSection',
        'blog': 'PKLBlogSection',
        'figures': 'FigureSection',
        'art': 'ArtSection',
        'tools': 'ToolsSection',
        'projects': 'ProjectsSection',
        'contact': 'ContactSection',
        'qr': 'QrHubSection',
        'about': 'AboutSection',
        'store': 'StoreSection',
        'three-d': 'ThreeDSection',
        'admin': 'AdminSection'
    },

    pathSections: new Set(['wiki', 'blog', 'figures']),

    init() {
        window.debugLog('INIT', `🧭 Router v${this.version} initializing...`);
        window.addEventListener('hashchange', () => this.handleRouteChange());
        window.addEventListener('popstate', () => this.handleRouteChange());
        this.handleRouteChange();
        window.debugLog('INIT', '✅ Router initialized');
    },

    parsePathRoute() {
        const pathname = decodeURIComponent(window.location.pathname || '/')
            .replace(/\/+/g, '/')
            .replace(/^\/+|\/+$/g, '');

        if (!pathname) return null;

        const parts = pathname.split('/');
        const section = parts[0];
        if (!this.pathSections.has(section)) return null;

        return {
            section,
            subsection: parts.length > 1 ? parts.slice(1).join('/') : null,
            isFullMode: false,
            routeMode: 'path'
        };
    },

    parseHashRoute() {
        let hash = window.location.hash.slice(1).replace(/^\/+/, '');
        window.debugLog('NAVIGATION', `🔍 Router.parseRoute() - raw hash: "${hash}"`);

        const isFullMode = hash.endsWith(':full');
        if (isFullMode) {
            hash = hash.slice(0, -5);
            window.debugLog('NAVIGATION', `🖼️ Full mode detected! Stripped hash: "${hash}"`);
        }

        if (!hash || hash === 'home') {
            return {
                section: 'home',
                subsection: null,
                isFullMode,
                routeMode: 'hash'
            };
        }

        const parts = hash.split('/');
        return {
            section: parts[0] || 'home',
            subsection: parts.length > 1 ? parts.slice(1).join('/') : null,
            isFullMode,
            routeMode: 'hash'
        };
    },

    /**
     * Parse the current normal path first, falling back to legacy hash routes.
     * @returns {Object} { section, subsection, isFullMode, routeMode }
     */
    parseRoute() {
        const route = this.parsePathRoute() || this.parseHashRoute();
        window.debugLog(
            'NAVIGATION',
            `🔍 Parsed route: section="${route.section}", subsection="${route.subsection}", mode=${route.routeMode}, isFullMode=${route.isFullMode}`
        );
        return route;
    },

    handleRouteChange() {
        const newRoute = this.parseRoute();
        const { section, subsection, isFullMode, routeMode } = newRoute;
        const modeStr = isFullMode ? ':full' : '';
        window.debugLog(
            'NAVIGATION',
            `🧭 Route change: ${section}${subsection ? '/' + subsection : ''}${modeStr} [${routeMode}]`
        );

        this.currentRoute = newRoute;
        this.routeChangeCallbacks.forEach(callback => {
            try {
                callback(newRoute);
            } catch (error) {
                console.error('Router callback error:', error);
            }
        });
    },

    subscribe(callback) {
        this.routeChangeCallbacks.add(callback);
        return () => this.routeChangeCallbacks.delete(callback);
    },

    buildPath(section, subsection = null) {
        const encodedParts = subsection
            ? subsection.split('/').filter(Boolean).map(part => encodeURIComponent(part))
            : [];
        return `/${section}${encodedParts.length ? '/' + encodedParts.join('/') : ''}`;
    },

    /**
     * Public knowledge routes use history paths. Existing sections retain hashes.
     */
    navigateToSection(section, subsection = null, fullMode = false, { replace = false } = {}) {
        if (this.pathSections.has(section)) {
            const path = this.buildPath(section, subsection);
            const method = replace ? 'replaceState' : 'pushState';
            window.history[method]({}, '', path);
            this.handleRouteChange();
            return;
        }

        const fullSuffix = fullMode ? ':full' : '';
        const hash = `#${section}${subsection ? '/' + subsection : ''}${fullSuffix}`;

        if (this.parsePathRoute()) {
            const rootWithHash = `/${hash}`;
            if (replace) {
                window.location.replace(rootWithHash);
            } else {
                window.location.assign(rootWithHash);
            }
            return;
        }

        if (window.location.hash !== hash) {
            window.location.hash = hash;
        } else {
            this.handleRouteChange();
        }
    },

    getCurrentRoute() {
        return { ...this.currentRoute };
    },

    isValidRoute(section, subsection = null, fullMode = false) {
        if (!this.sections[section]) return false;
        if (fullMode && this.pathSections.has(section)) return false;
        return true;
    },

    getSections() {
        return { ...this.sections };
    },

    registerSection(sectionName, moduleName) {
        this.sections[sectionName] = moduleName;
        window.debugLog('VERBOSE', `📝 Router registered section: ${sectionName} -> ${moduleName}`);
    },

    unregisterSection(sectionName) {
        if (this.sections[sectionName]) {
            delete this.sections[sectionName];
            window.debugLog('VERBOSE', `🗑️ Router unregistered section: ${sectionName}`);
        }
    }
};

export { Router };

if (typeof window !== 'undefined') {
    window.Router = Router;
}

window.debugLog('INIT', `🧭 Router v${Router.version} loaded - Hybrid Routing System`);
