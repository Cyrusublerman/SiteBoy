/**
 * Projects Section - SiteBoy Framework
 *
 * Index: IndexMapTOC (B6). Detail: manifest / bespoke project pages.
 *
 * @version 2.0.0
 * @dependencies ['ComponentLibrary']
 */

import { buildIndexMapTree, parseProjectsSubsection, encodeIndexState } from '../shared/index-map-data.js';

const ProjectsSection = {
    version: '2.0.0',
    currentContainer: null,
    componentInstances: [],
    navigationCallbacks: null,
    _indexView: null,
    _syncingUrl: false,

    PROJECT_REGISTRY: [
        { id: 'siteboy', title: 'SITEBOY FRAMEWORK', description: 'Owned-concern framework: BaseComponent, foundations, router, design system', typeLine: 'Owned-concern framework', year: '2024', status: 'currently', bucket: 'initiative', related: ['distort', 'process-engineering', 'paths-systems'], kind: 'manifest', src: 'projects/siteboy/project.json' },
        { id: 'multifilament-print', title: 'MULTIFILAMENT PRINT CALIBRATION', description: 'Source/scan/quantize/export pipeline for measured multi-filament prints', typeLine: 'Calibration pipeline', year: '2025', bucket: 'initiative', related: ['colour-quantizer', 'pixel-tiler'], kind: 'manifest', src: 'projects/multifilament-print/project.json' },
        { id: 'process-engineering', title: 'PROCESS ENGINEERING', description: 'Idea-to-library pipeline, AI workflow governance and compliance audit', typeLine: 'Idea-to-library pipeline', year: '2026', status: 'currently', bucket: 'research', related: ['siteboy', 'paths-systems'], kind: 'manifest', src: 'projects/process-engineering/project.json' },
        { id: 'typography', title: 'TYPOGRAPHY SYSTEM', description: 'Canvas TextMetrics-driven font metrics, ratios and visual diagnostics', typeLine: 'Canvas TextMetrics study', year: '2024', bucket: 'research', related: ['siteboy'], kind: 'manifest', src: 'projects/typography/project.json' },
        { id: 'distort', title: 'DISTORT', description: '69-module GPU image-processing pipeline with deterministic export', typeLine: 'GPU image graph', year: '2025', status: 'currently', bucket: 'artifact', related: ['siteboy', 'image-processing', 'colour-quantizer'], kind: 'manifest', src: 'projects/distort/project.json' },
        { id: 'generative-art', title: 'GENERATIVE ART', description: 'Parametric, harmonic, phyllotactic and wave-field generative pieces', typeLine: 'Parametric suites', year: '2024', bucket: 'artifact', related: ['music-audio', 'paths-evolution'], kind: 'manifest', src: 'projects/generative-art/project.json' },
        { id: 'image-processing', title: 'IMAGE PROCESSING', description: 'Pixel-buffer pipeline algebra: quantisation, dithering, ASCII, tiling', typeLine: 'Pixel-buffer algebra', year: '2024', bucket: 'artifact', related: ['distort', 'colour-quantizer', 'pixel-tiler'], kind: 'manifest', src: 'projects/image-processing/project.json' },
        { id: 'colour-quantizer', title: 'COLOUR QUANTIZER', description: 'LAB-space palette reduction with Delta E 76 and blue-noise dithering', typeLine: 'LAB Delta-E reduction', year: '2024', bucket: 'artifact', related: ['image-processing', 'multifilament-print'], kind: 'manifest', src: 'projects/colour-quantizer/project.json' },
        { id: 'pixel-tiler', title: 'PIXEL TILER', description: '2x2 mosaic composition over a combinatorial frame-addressable mode space', typeLine: '2×2 mosaic composer', year: '2024', bucket: 'artifact', related: ['image-processing', 'multifilament-print'], kind: 'manifest', src: 'projects/pixel-tiler/project.json' },
        { id: 'music-audio', title: 'MUSIC + AUDIO', description: 'Cymatics: chord templates as wave sources; visual + Web Audio playback', typeLine: 'Cymatics + Web Audio', year: '2023', bucket: 'artifact', related: ['generative-art'], kind: 'manifest', src: 'projects/music-audio/project.json' },
        { id: 'synthetic-biophilia', title: 'SYNTHETIC BIOPHILIA', description: 'Phyllotaxis-driven dome architecture from theory to fabricable geometry', typeLine: 'Phyllotaxis architecture', year: '2025', bucket: 'artifact', related: ['paths-evolution', 'generative-art'], kind: 'bespoke', global: 'SyntheticBiophiliaProject' }
    ],

    get registryIds() {
        return new Set(this.PROJECT_REGISTRY.map((p) => p.id));
    },

    get pages() {
        return ['#projects', ...this.PROJECT_REGISTRY.map((p) => `#projects/${p.id}`)];
    },

    get navigationConfig() {
        return {
            type: 'flat',
            indexTitle: 'PROJECTS',
            structure: this.PROJECT_REGISTRY.map(({ id, title, description }) => ({ id, title, description }))
        };
    },

    getIndexTree() {
        const CL = window.ComponentLibrary;
        if (CL?.buildIndexMapTree) return CL.buildIndexMapTree(this.PROJECT_REGISTRY);
        return buildIndexMapTree(this.PROJECT_REGISTRY);
    },

    handleRoute(subsection, container, callbacks) {
        callbacks = callbacks || {};
        window.debugLog('NAVIGATION', `Projects Section v${this.version} route: ${subsection || 'index'}`);

        this.currentContainer = container;
        this.navigationCallbacks = callbacks;
        this.cleanup();

        const registryIds = this.registryIds;
        const parsed = parseProjectsSubsection(subsection, registryIds);

        if (parsed.mode === 'detail') {
            window.NavigationController.setupNavigation('projects', parsed.projectId, this.pages, this.navigationCallbacks);
            this.renderProject(parsed.projectId);
            return;
        }

        window.NavigationController.setupNavigation('projects', subsection, this.pages, this.navigationCallbacks);

        const initialState = parsed.mode === 'index-state' && parsed.state
            ? parsed.state
            : { view: 'tree', open: '', focus: '' };

        this.renderProjectsIndex(initialState);
    },

    renderProjectsIndex(initialState = {}) {
        window.debugLog('TOOLS', 'Rendering projects index with IndexMapTOC');

        this.currentContainer.innerHTML = '';
        this.currentContainer.classList.add('toc-container');

        if (window.MathematicalFoundation) {
            const contentContainer = this.currentContainer.closest('.content-container');
            if (contentContainer) {
                const F = window.MathematicalFoundation.F;
                contentContainer.style.setProperty('--comp-min-h', `calc(100vh - ${F * 4}px)`);
                contentContainer.style.setProperty('--top-offset', `${F * 2}px`);
            }
        }

        const deps = {
            MF: window.MathematicalFoundation,
            Resize: window.ResizeManager
        };

        this._indexView = new ComponentLibrary.IndexMapView({
            data: this.getIndexTree(),
            headingText: 'PROJECTS',
            initialState,
            onNavigate: (item) => {
                const slug = item.slug || item.id;
                if (slug && this.navigationCallbacks?.navigateToSection) {
                    this.navigationCallbacks.navigateToSection('projects', slug);
                }
            },
            onStateChange: (state) => this._syncIndexUrl(state)
        }, deps);

        this.componentInstances.push(this._indexView);
        this.currentContainer.appendChild(this._indexView.render());
    },

    _syncIndexUrl(state) {
        if (this._syncingUrl) return;
        const enc = encodeIndexState(state);
        const hash = enc === 'index' ? '#projects' : `#projects/${enc}`;
        if (window.location.hash === hash) return;
        this._syncingUrl = true;
        if (window.Router?.replaceHashSilent) {
            window.Router.replaceHashSilent(hash);
        } else {
            history.replaceState(null, '', hash);
        }
        this._syncingUrl = false;
    },

    navigateToProject(projectId) {
        if (this.navigationCallbacks?.navigateToSection) {
            this.navigationCallbacks.navigateToSection('projects', projectId);
        }
    },

    getDropdownItems(currentSubsection) {
        const currentPath = `#projects/${currentSubsection}`;
        const indexItem = { label: 'PROJECTS INDEX', path: '#projects', isTOC: true, value: '#projects', isCurrent: false };
        const projectItems = this.PROJECT_REGISTRY.map(({ id, title }) => {
            const path = `#projects/${id}`;
            return { label: title, path, value: path, isCurrent: path === currentPath };
        });
        return [indexItem, ...projectItems];
    },

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
                if (callbacks?.navigateToSection) callbacks.navigateToSection(section, subsection);
            }
        };
    },

    async renderProject(projectId) {
        window.debugLog('TOOLS', `Rendering project: ${projectId}`);
        const entry = this.PROJECT_REGISTRY.find((p) => p.id === projectId);

        if (!entry) {
            this.renderUnknownProject(projectId);
            return;
        }

        this.currentContainer.innerHTML = '';

        if (entry.kind === 'bespoke') {
            const module = entry.global ? window[entry.global] : null;
            if (module?.render) {
                module.render(this.currentContainer);
                return;
            }
            console.warn(`Bespoke project '${projectId}' module not on window.${entry.global}`);
            this.renderUnknownProject(projectId);
            return;
        }

        if (entry.kind === 'manifest' && window.ProjectPage) {
            try {
                await window.ProjectPage.loadAndRender(this.currentContainer, entry.src);
            } catch (err) {
                console.warn(`Failed manifest project '${projectId}':`, err.message);
                this.renderUnknownProject(projectId);
            }
            return;
        }

        this.renderUnknownProject(projectId);
    },

    renderUnknownProject(projectId) {
        const deps = { MF: window.MathematicalFoundation, Resize: window.ResizeManager };
        const heading = new ComponentLibrary.Heading({
            level: 1,
            content: (projectId || 'UNKNOWN').toUpperCase().replace(/-/g, ' ')
        }, deps);
        const body = new ComponentLibrary.Paragraph({ content: 'This project page is not yet available.' });
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

    cleanup() {
        if (this.currentContainer) {
            this.currentContainer.innerHTML = '';
            this.currentContainer.className = this.currentContainer.className
                .replace(/toc-container|layout-\w+-\w+/g, '')
                .trim();
        }
        ComponentLibrary.destroyTracked(this.componentInstances);
        this.componentInstances = [];
        this._indexView = null;
        if (window.ProjectPage?.cleanup) window.ProjectPage.cleanup(null);
    },

    init() {
        window.debugLog('NAVIGATION', `Projects Section v${this.version} initialized`);
    },

    render(subsection) {
        const container = document.createElement('div');
        this.handleRoute(subsection, container);
        return container;
    }
};

// Deduplicate registry (keep first occurrence per id)
ProjectsSection.PROJECT_REGISTRY = ProjectsSection.PROJECT_REGISTRY.filter(
    (entry, i, arr) => arr.findIndex((e) => e.id === entry.id) === i
);

window.ProjectsSection = ProjectsSection;
window.debugLog('INIT', `Projects Section v${ProjectsSection.version} ready`);
