/**
 * Three-D Section - SiteBoy Framework
 *
 * Browsable 3D file list with ModelViewer + SplatViewer demo.
 *
 * @version 1.0.0
 * @dependencies ['ComponentLibrary']
 */

const ThreeDSection = {
    version: '1.0.0',
    currentContainer: null,
    componentInstances: [],
    navigationCallbacks: null,
    dataUrl: 'blog/data/three-d.json',
    catalog: null,

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
            this.renderError(err.message);
            return;
        }

        window.NavigationController.setupNavigation('three-d', subsection, this.pages, callbacks);

        if (!subsection) {
            this.renderIndex();
        } else {
            this.renderItem(subsection);
        }
    },

    async ensureCatalog() {
        if (this.catalog) return this.catalog;
        const response = await fetch(this.dataUrl, { cache: 'no-cache' });
        if (!response.ok) throw new Error(`HTTP ${response.status} loading ${this.dataUrl}`);
        this.catalog = await response.json();
        return this.catalog;
    },

    renderIndex() {
        const deps = this._deps();
        const tracked = this._track();
        this._prepareContainer('three-d-section-index');

        this.currentContainer.appendChild(tracked(new ComponentLibrary.Heading({
            level: 1,
            content: this.catalog.header || '3D FILES'
        }, deps)).render());

        if (this.catalog.subheader) {
            this.currentContainer.appendChild(tracked(new ComponentLibrary.Paragraph({
                content: this.catalog.subheader
            }, deps)).render());
        }

        (this.catalog.items || []).forEach((item) => {
            const row = tracked(new ComponentLibrary.Paragraph({
                content: `${item.title} (${(item.format || '').toUpperCase()})`,
                isClickable: true,
                onClick: () => this._navigate(item.id)
            }, deps));
            const rowEl = row.render();
            rowEl.classList.add('three-d-item-row');
            this.currentContainer.appendChild(rowEl);
        });
    },

    renderItem(id) {
        const item = (this.catalog.items || []).find((i) => i.id === id);
        if (!item) {
            this.renderError(`Unknown model: ${id}`);
            return;
        }

        const deps = this._deps();
        const tracked = this._track();
        this._prepareContainer('three-d-section-detail');

        this.currentContainer.appendChild(tracked(new ComponentLibrary.Heading({
            level: 1,
            content: item.title || id.toUpperCase()
        }, deps)).render());

        if (item.description) {
            this.currentContainer.appendChild(tracked(new ComponentLibrary.Paragraph({
                content: item.description
            }, deps)).render());
        }

        const format = (item.format || '').toLowerCase();
        if (format === 'splat' || format === 'ply') {
            const splat = tracked(new ComponentLibrary.SplatViewer({
                src: item.src || '',
                alt: item.title || id
            }, deps));
            this.currentContainer.appendChild(splat.render());
        } else if (item.src) {
            const viewer = tracked(new ComponentLibrary.ModelViewer({
                src: item.src,
                alt: item.title || id,
                poster: item.thumbnail || '',
                cameraControls: true
            }, deps));
            this.currentContainer.appendChild(viewer.render());
        }

        const download = tracked(new ComponentLibrary.Button({
            text: 'DOWNLOAD',
            onClick: () => this.issueDownload(item)
        }, deps));
        this.currentContainer.appendChild(download.render());

        const back = tracked(new ComponentLibrary.Paragraph({
            content: '← BACK TO 3D FILES',
            isClickable: true,
            onClick: () => this._navigate(null)
        }, deps));
        this.currentContainer.appendChild(back.render());
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

    _prepareContainer(className) {
        this.currentContainer.innerHTML = '';
        this.currentContainer.classList.add('three-d-section', className, 'toc-container');
    },

    _deps() {
        return { MF: window.MathematicalFoundation, Resize: window.ResizeManager };
    },

    _track() {
        return (component) => {
            this.componentInstances.push(component);
            return component;
        };
    },

    renderError(message) {
        this.currentContainer.innerHTML = '';
        const para = new ComponentLibrary.Paragraph({ content: `⚠ ${message}` }, this._deps());
        this.componentInstances.push(para);
        this.currentContainer.appendChild(para.render());
    },

    cleanup() {
        window.debugLog('VERBOSE', '🧹 Cleaning up 3D Section...');
        if (this.currentContainer) {
            this.currentContainer.innerHTML = '';
            this.currentContainer.classList.remove('three-d-section', 'three-d-section-index', 'three-d-section-detail', 'toc-container');
        }
        if (this.componentInstances.length && window.ComponentLibrary) {
            ComponentLibrary.destroyTracked(this.componentInstances);
        }
        this.componentInstances = [];
    }
};

window.ThreeDSection = ThreeDSection;
window.debugLog('INIT', `📦 ThreeDSection v${ThreeDSection.version} loaded`);
