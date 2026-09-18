/**
 * Index Map Section — alias to #projects (B6 promote).
 * Route: #index-map → redirects to ProjectsSection index.
 */

const IndexMapSection = {
    version: '2.0.0',
    currentContainer: null,
    componentInstances: [],

    handleRoute(subsection, container, callbacks = {}) {
        this.currentContainer = container;
        const projects = window.ProjectsSection;
        if (!projects) return;

        if (!subsection && callbacks.navigateToSection) {
            callbacks.navigateToSection('projects', null);
            return;
        }

        projects.handleRoute(subsection, container, callbacks);
        this.componentInstances = projects.componentInstances;
    },

    cleanup() {
        window.ProjectsSection?.cleanup?.();
        this.componentInstances = [];
        this.currentContainer = null;
    }
};

window.IndexMapSection = IndexMapSection;
window.debugLog('INIT', `IndexMapSection v${IndexMapSection.version} loaded (alias → projects)`);
