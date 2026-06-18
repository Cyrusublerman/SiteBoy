/**
 * Three-D Section - SiteBoy Framework
 *
 * Browsable 3D file list with ModelViewer + SplatViewer demo.
 *
 * @version 1.1.0
 * @dependencies ['ComponentLibrary', 'BaseComponent']
 */

class ThreeDIndexView extends BaseComponent {
    constructor(catalog, options = {}, deps = {}) {
        super({ componentType: 'three-d-index' }, deps);
        this.catalog = catalog;
        this.onNavigate = options.onNavigate;
        this.tracked = [];
    }

    _track(component) {
        this.tracked.push(component);
        this.children.add(component);
        return component;
    }

    render() {
        if (this.element) return this.element;

        this.element = this.createElement('div', 'three-d-section three-d-section-index toc-container');

        this.appendElement(this.element, this._track(new ComponentLibrary.Heading({
            level: 1,
            content: this.catalog.header || '3D FILES'
        }, this.deps)).render());

        if (this.catalog.subheader) {
            this.appendElement(this.element, this._track(new ComponentLibrary.Paragraph({
                content: this.catalog.subheader
            }, this.deps)).render());
        }

        (this.catalog.items || []).forEach((item) => {
            const row = this._track(new ComponentLibrary.Paragraph({
                content: `${item.title} (${(item.format || '').toUpperCase()})`,
                isClickable: true,
                onClick: () => this.onNavigate?.(item.id)
            }, this.deps));
            const rowEl = row.render();
            rowEl.classList.add('three-d-item-row');
            this.appendElement(this.element, rowEl);
        });

        return this.element;
    }

    destroy() {
        if (this.tracked.length && window.ComponentLibrary) {
            ComponentLibrary.destroyTracked(this.tracked);
        }
        this.tracked = [];
        super.destroy();
    }
}

class ThreeDDetailView extends BaseComponent {
    constructor(item, options = {}, deps = {}) {
        super({ componentType: 'three-d-detail' }, deps);
        this.item = item;
        this.onNavigate = options.onNavigate;
        this.onDownload = options.onDownload;
        this.tracked = [];
    }

    _track(component) {
        this.tracked.push(component);
        this.children.add(component);
        return component;
    }

    render() {
        if (this.element) return this.element;

        const item = this.item;
        this.element = this.createElement('div', 'three-d-section three-d-section-detail toc-container');

        this.appendElement(this.element, this._track(new ComponentLibrary.Heading({
            level: 1,
            content: item.title || item.id.toUpperCase()
        }, this.deps)).render());

        if (item.description) {
            this.appendElement(this.element, this._track(new ComponentLibrary.Paragraph({
                content: item.description
            }, this.deps)).render());
        }

        const format = (item.format || '').toLowerCase();
        if (format === 'splat' || format === 'ply') {
            const splat = this._track(new ComponentLibrary.SplatViewer({
                src: item.src || '',
                alt: item.title || item.id
            }, this.deps));
            this.appendElement(this.element, splat.render());
        } else if (item.src) {
            const viewer = this._track(new ComponentLibrary.ModelViewer({
                src: item.src,
                alt: item.title || item.id,
                poster: item.thumbnail || '',
                cameraControls: true
            }, this.deps));
            this.appendElement(this.element, viewer.render());
        }

        const download = this._track(new ComponentLibrary.Button({
            text: 'DOWNLOAD',
            onClick: () => this.onDownload?.(item)
        }, this.deps));
        this.appendElement(this.element, download.render());

        const back = this._track(new ComponentLibrary.Paragraph({
            content: '← BACK TO 3D FILES',
            isClickable: true,
            onClick: () => this.onNavigate?.(null)
        }, this.deps));
        this.appendElement(this.element, back.render());

        return this.element;
    }

    destroy() {
        if (this.tracked.length && window.ComponentLibrary) {
            ComponentLibrary.destroyTracked(this.tracked);
        }
        this.tracked = [];
        super.destroy();
    }
}

class ThreeDErrorView extends BaseComponent {
    constructor(message, deps = {}) {
        super({ componentType: 'three-d-error' }, deps);
        this.message = message;
        this.tracked = [];
    }

    render() {
        if (this.element) return this.element;
        this.element = this.createElement('div', 'three-d-section toc-container');
        const para = new ComponentLibrary.Paragraph({ content: `⚠ ${this.message}` }, this.deps);
        this.tracked.push(para);
        this.appendElement(this.element, para.render());
        return this.element;
    }

    destroy() {
        if (this.tracked.length && window.ComponentLibrary) {
            ComponentLibrary.destroyTracked(this.tracked);
        }
        this.tracked = [];
        super.destroy();
    }
}

const ThreeDSection = {
    version: '1.1.0',
    currentContainer: null,
    componentInstances: [],
    navigationCallbacks: null,
    dataUrl: 'blog/data/three-d.json',
    catalog: null,
    _view: null,

    get pages() {
        const base = ['#three-d'];
        const ids = (this.catalog?.items || []).map((i) => `#three-d/${i.id}`);
        return [...base, ...ids];
    },

    async handleRoute(subsection, container, callbacks = {}) {
        window.debugLog('NAVIGATION', `📦 3D Section v${this.version} handling route: ${subsection || 'index'}`);

        this.currentContainer = container;
        this.navigationCallbacks = callbacks;
        this.cleanup();

        try {
            await this.ensureCatalog();
        } catch (err) {
            this._mountError(err.message);
            return;
        }

        window.NavigationController.setupNavigation('three-d', subsection, this.pages, callbacks);

        if (!subsection) {
            this._mountIndex();
        } else {
            this._mountItem(subsection);
        }
    },

    async ensureCatalog() {
        if (this.catalog) return this.catalog;
        const response = await fetch(this.dataUrl, { cache: 'no-cache' });
        if (!response.ok) throw new Error(`HTTP ${response.status} loading ${this.dataUrl}`);
        this.catalog = await response.json();
        return this.catalog;
    },

    _deps() {
        return { MF: window.MathematicalFoundation, Resize: window.ResizeManager };
    },

    _mountIndex() {
        this._view = new ThreeDIndexView(this.catalog, {
            onNavigate: (id) => this._navigate(id)
        }, this._deps());
        BaseComponent.mountSectionView(this.currentContainer, this._view);
        this.componentInstances = this._view.tracked;
    },

    _mountItem(id) {
        const item = (this.catalog.items || []).find((i) => i.id === id);
        if (!item) {
            this._mountError(`Unknown model: ${id}`);
            return;
        }
        this._view = new ThreeDDetailView(item, {
            onNavigate: (sub) => this._navigate(sub),
            onDownload: (it) => this.issueDownload(it)
        }, this._deps());
        BaseComponent.mountSectionView(this.currentContainer, this._view);
        this.componentInstances = this._view.tracked;
    },

    _mountError(message) {
        this._view = new ThreeDErrorView(message, this._deps());
        BaseComponent.mountSectionView(this.currentContainer, this._view);
        this.componentInstances = this._view.tracked;
    },

    issueDownload(item) {
        if (!item.src) {
            window.debugLog('TOOLS', `📦 Download stub: no src for ${item.id} (A4 signed URL pending)`);
            return;
        }
        window.debugLog('TOOLS', `📦 Download stub for ${item.id}: ${item.src}`);
        window.open(item.src, '_blank', 'noopener,noreferrer');
    },

    _navigate(subsection) {
        if (this.navigationCallbacks?.navigateToSection) {
            this.navigationCallbacks.navigateToSection('three-d', subsection);
        } else if (window.Router) {
            window.Router.navigateToSection('three-d', subsection);
        }
    },

    cleanup() {
        window.debugLog('VERBOSE', '🧹 Cleaning up 3D Section...');
        if (this._view) {
            this._view.destroy();
            this._view = null;
        }
        if (this.currentContainer) {
            BaseComponent.clearSectionContainer(this.currentContainer, [
                'three-d-section', 'three-d-section-index', 'three-d-section-detail', 'toc-container'
            ]);
        }
        this.componentInstances = [];
    }
};

window.ThreeDSection = ThreeDSection;
window.debugLog('INIT', `📦 ThreeDSection v${ThreeDSection.version} loaded`);
