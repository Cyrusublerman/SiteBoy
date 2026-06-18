/**
 * Projects Section - SiteBoy Framework
 * 
 * PROJECTS SECTION HANDLER - JSON-driven project portfolio
 * Handles project galleries and detailed views
 * 
 * @version 1.0.0 - Projects Section
 * @dependencies ['ComponentLibrary'] - Consolidated component system
 */

const ProjectsSection = {
    version: '1.0.0',
    currentContainer: null,
    componentInstances: [],
    navigationCallbacks: null,
    
    // Project registry - single source of truth for the projects index.
    // - 'bespoke' projects render via a pre-loaded module on window
    // - 'manifest' projects render via the generic ProjectPage engine
    PROJECT_REGISTRY: [
        { id: 'siteboy',              title: 'SITEBOY FRAMEWORK',              description: 'Owned-concern framework: BaseComponent, foundations, router, design system', kind: 'manifest', src: 'projects/siteboy/project.json' },
        { id: 'synthetic-biophilia',  title: 'SYNTHETIC BIOPHILIA',            description: 'Phyllotaxis-driven dome architecture from theory to fabricable geometry',     kind: 'bespoke',  global: 'SyntheticBiophiliaProject' },
        { id: 'distort',              title: 'DISTORT',                        description: '69-module GPU image-processing pipeline with deterministic export',         kind: 'manifest', src: 'projects/distort/project.json' },
        { id: 'generative-art',       title: 'GENERATIVE ART',                 description: 'Parametric, harmonic, phyllotactic and wave-field generative pieces',       kind: 'manifest', src: 'projects/generative-art/project.json' },
        { id: 'image-processing',     title: 'IMAGE PROCESSING',               description: 'Pixel-buffer pipeline algebra: quantisation, dithering, ASCII, tiling',     kind: 'manifest', src: 'projects/image-processing/project.json' },
        { id: 'colour-quantizer',     title: 'COLOUR QUANTIZER',               description: 'LAB-space palette reduction with Delta E 76 and blue-noise dithering',     kind: 'manifest', src: 'projects/colour-quantizer/project.json' },
        { id: 'pixel-tiler',          title: 'PIXEL TILER',                    description: '2x2 mosaic composition over a combinatorial frame-addressable mode space',  kind: 'manifest', src: 'projects/pixel-tiler/project.json' },
        { id: 'multifilament-print',  title: 'MULTIFILAMENT PRINT CALIBRATION', description: 'Source/scan/quantize/export pipeline for measured multi-filament prints',   kind: 'manifest', src: 'projects/multifilament-print/project.json' },
        { id: 'typography',           title: 'TYPOGRAPHY SYSTEM',              description: 'Canvas TextMetrics-driven font metrics, ratios and visual diagnostics',     kind: 'manifest', src: 'projects/typography/project.json' },
        { id: 'music-audio',          title: 'MUSIC + AUDIO',                  description: 'Cymatics: chord templates as wave sources; visual + Web Audio playback',    kind: 'manifest', src: 'projects/music-audio/project.json' },
        { id: 'process-engineering',  title: 'PROCESS ENGINEERING',            description: 'Idea-to-library pipeline, AI workflow governance and compliance audit',     kind: 'manifest', src: 'projects/process-engineering/project.json' }
    ],

    get pages() {
        return ['#projects', ...this.PROJECT_REGISTRY.map(p => `#projects/${p.id}`)];
    },

    get navigationConfig() {
        return {
            type: 'flat',
            indexTitle: 'PROJECTS',
            structure: this.PROJECT_REGISTRY.map(({ id, title, description }) => ({ id, title, description }))
        };
    },
    
    /**
     * Handle route changes for projects section
     * @param {string|null} subsection - Subsection path
     * @param {HTMLElement} container - Content container
     * @param {Object} callbacks - Navigation callbacks (injected from router)
     */
    handleRoute(subsection, container, callbacks) {
        callbacks = callbacks || {};
        window.debugLog('NAVIGATION', `🚀 Projects Section v${this.version} handling route: ${subsection || 'index'}`);
        
        this.currentContainer = container;
        this.navigationCallbacks = callbacks;
        this.cleanup();
        
        // Setup unified navigation (same code for all sections)
        window.NavigationController.setupNavigation('projects', subsection, this.pages, this.navigationCallbacks);
        
        if (!subsection) {
            this.renderProjectsIndex();
        } else {
            this.renderProject(subsection);
        }
    },
    
    
    /**
     * Render projects index using ComponentLibrary SimpleTOC
     */
    renderProjectsIndex() {
        window.debugLog('TOOLS', '🚀 Rendering projects index with SimpleTOC component');
        
        // Clear container and add TOC container class for proper CSS styling
        this.currentContainer.innerHTML = '';
        this.currentContainer.classList.add('toc-container');
        
        // Apply proper body sizing for projects index (no subheader)
        if (window.MathematicalFoundation) {
            const contentContainer = this.currentContainer.closest('.content-container');
            if (contentContainer) {
                const F = window.MathematicalFoundation.F;
                contentContainer.style.setProperty('--comp-min-h', `calc(100vh - ${F * 4}px)`);
                contentContainer.style.setProperty('--top-offset', `${F * 2}px`);
                window.debugLog('NAVIGATION', '✅ Applied no-subheader body sizing for projects index');
            }
        }
        
        
        // Create simple TOC component using ComponentLibrary with dependencies
        const tocComponent = new ComponentLibrary.SimpleTOC({
            sections: this.navigationConfig.structure,
            onItemClick: (item) => this.handleProjectClick(item)
        }, {
            MF: window.MathematicalFoundation,
            Resize: window.ResizeManager
        });
        
        this.componentInstances.push(tocComponent);
        this.currentContainer.appendChild(tocComponent.render());
        
        window.debugLog('TOOLS', '✅ Projects index rendered with SimpleTOC component');
    },
    
    /**
     * Handle project click from SimpleTOC
     */
    handleProjectClick(item) {
        this.navigateToProject(item.id);
        window.debugLog('NAVIGATION', `🚀 Project clicked: ${item.title} -> ${item.id}`);
    },
    
    /**
     * Navigate to specific project
     */
    navigateToProject(projectId) {
        if (this.navigationCallbacks && this.navigationCallbacks.navigateToSection) {
            this.navigationCallbacks.navigateToSection('projects', projectId);
        } else {
            console.warn('⚠️ Navigation callbacks not available');
        }
    },
    
    /**
     * Handle section click (expansion toggle)
     * @param {string} sectionId - Section ID
     */
    handleSectionClick(sectionId) {
        window.debugLog('NAVIGATION', `🚀 Section clicked: ${sectionId}`);
        // Find the TOC component and toggle the section
        const tocComponent = this.componentInstances.find(comp => comp instanceof ComponentLibrary.SimpleTOC);
        if (tocComponent) {
            tocComponent.toggleSection(sectionId);
        }
    },
    
    /**
     * Handle subsection click (navigation)
     * @param {string} path - Navigation path
     */
    handleSubsectionClick(path) {
        window.debugLog('NAVIGATION', `🚀 Subsection clicked: ${path}`);
        
        // Extract section and subsection from path (e.g., '#projects/siteboy')
        const hashPath = path.replace('#', '');
        const [section, subsection] = hashPath.split('/');
        
        // Use injected navigation callback
        if (this.navigationCallbacks && this.navigationCallbacks.navigateToSection) {
            this.navigationCallbacks.navigateToSection(section, subsection);
        } else {
            console.warn('Navigation callback not available');
        }
    },
    
    /**
     * Get dropdown items for subheader (derived from PROJECT_REGISTRY).
     * @param {string} currentSubsection - Current subsection ID
     * @returns {Array} Dropdown items with current selection marked
     */
    getDropdownItems(currentSubsection) {
        const currentPath = `#projects/${currentSubsection}`;
        const indexItem = { label: 'PROJECTS INDEX', path: '#projects', isTOC: true, value: '#projects', isCurrent: false };
        const projectItems = this.PROJECT_REGISTRY.map(({ id, title }) => {
            const path = `#projects/${id}`;
            return { label: title, path, value: path, isCurrent: path === currentPath };
        });
        return [indexItem, ...projectItems];
    },

    /**
     * Get navigation context for subheader (derived from PROJECT_REGISTRY).
     * @param {string} currentSubsection - Current subsection ID
     * @param {Object} callbacks - Navigation callbacks
     * @returns {Object} Navigation context
     */
    getNavigationContext(currentSubsection, callbacks) {
        const items = this.PROJECT_REGISTRY.map(({ id, title }) => ({
            id,
            title,
            path: `#projects/${id}`
        }));

        return {
            section: 'projects',
            subsection: currentSubsection,
            items,
            navigate: (section, subsection) => {
                if (callbacks && callbacks.navigateToSection) {
                    callbacks.navigateToSection(section, subsection);
                }
            }
        };
    },
    
    /**
     * Render individual project via the registry.
     * - bespoke entries call a pre-loaded module on window
     * - manifest entries fetch JSON and render via the generic ProjectPage engine
     * - unknown ids render a minimal not-found placeholder via ComponentLibrary
     */
    async renderProject(projectId) {
        window.debugLog('TOOLS', `🚀 Rendering project: ${projectId}`);

        const entry = this.PROJECT_REGISTRY.find(p => p.id === projectId);

        if (!entry) {
            this.renderUnknownProject(projectId);
            return;
        }

        this.currentContainer.innerHTML = '';

        if (entry.kind === 'bespoke') {
            const module = entry.global ? window[entry.global] : null;
            if (module && typeof module.render === 'function') {
                module.render(this.currentContainer);
                return;
            }
            console.warn(`⚠️ Bespoke project '${projectId}' module not available on window.${entry.global}`);
            this.renderUnknownProject(projectId);
            return;
        }

        if (entry.kind === 'manifest') {
            if (!window.ProjectPage) {
                console.warn('⚠️ ProjectPage engine not loaded; cannot render manifest project.');
                this.renderUnknownProject(projectId);
                return;
            }
            try {
                await window.ProjectPage.loadAndRender(this.currentContainer, entry.src);
            } catch (err) {
                console.warn(`⚠️ Failed to render manifest project '${projectId}':`, err.message);
                this.renderUnknownProject(projectId);
            }
            return;
        }

        this.renderUnknownProject(projectId);
    },

    /**
     * Minimal placeholder for ids that have no registry entry or fail to load.
     */
    renderUnknownProject(projectId) {
        const deps = { MF: window.MathematicalFoundation, Resize: window.ResizeManager };
        const heading = new ComponentLibrary.Heading({
            level: 1,
            content: (projectId || 'UNKNOWN').toUpperCase().replace(/-/g, ' ')
        }, deps);
        const body = new ComponentLibrary.Paragraph({
            content: 'This project page is not yet available.'
        });
        const back = new ComponentLibrary.Paragraph({
            content: '← Back to Projects',
            isClickable: true,
            onClick: () => { window.location.hash = '#projects'; }
        });
        this.componentInstances.push(heading, body, back);
        this.currentContainer.appendChild(heading.render());
        this.currentContainer.appendChild(body.render());
        this.currentContainer.appendChild(back.render());
    },


    /**
     * Cleanup section
     */
    cleanup() {
        if (this.currentContainer) {
            this.currentContainer.innerHTML = '';
            // Remove layout classes
            this.currentContainer.className = this.currentContainer.className
                .replace(/toc-container|layout-\w+-\w+/g, '')
                .trim();
        }

        // Destroy tracked components using ComponentLibrary method
        ComponentLibrary.destroyTracked(this.componentInstances);
        this.componentInstances = [];

        // Engine-level component teardown for the JSON-driven project pages
        if (window.ProjectPage && typeof window.ProjectPage.cleanup === 'function') {
            window.ProjectPage.cleanup(null);
        }
    },
    
    /**
     * Initialize section (legacy support)
     */
    init() {
        window.debugLog('NAVIGATION', `🚀 Projects Section v${this.version} initialized`);
    },
    
    /**
     * Render section (legacy support)
     */
    render(subsection) {
        const container = document.createElement('div');
        this.handleRoute(subsection, container);
        return container;
    }
};

// Global registration
window.ProjectsSection = ProjectsSection;

window.debugLog('INIT', `🚀 Projects Section v${ProjectsSection.version} ready`);
