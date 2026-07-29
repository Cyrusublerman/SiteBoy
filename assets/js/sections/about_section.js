/**
 * About Section - SiteBoy Framework
 *
 * JSON-driven bio page from blog/data/about.json.
 * ComponentLibrary blocks only; DOM via BaseComponent views.
 *
 * @version 1.1.0
 * @dependencies ['ComponentLibrary', 'BaseComponent']
 */

class AboutPageView extends BaseComponent {
    constructor(data, options = {}, deps = {}) {
        super({ componentType: 'about-page' }, deps);
        this.data = data;
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

        this.element = this.createElement('div', 'about-section toc-container');
        const data = this.data;

        const title = this._track(new ComponentLibrary.Heading({
            level: 1,
            content: data.header || 'ABOUT'
        }, this.deps));
        this.appendElement(this.element, title.render());

        if (data.subheader) {
            const sub = this._track(new ComponentLibrary.Paragraph({ content: data.subheader }, this.deps));
            const subEl = sub.render();
            subEl.classList.add('about-section-subheader');
            this.appendElement(this.element, subEl);
        }

        if (data.hero?.src) {
            const hero = this._track(new ComponentLibrary.Image({
                src: data.hero.src,
                caption: data.hero.caption || '',
                size: (data.hero.size || 'm').toLowerCase()
            }, this.deps));
            this.appendElement(this.element, hero.render());
        }

        if (Array.isArray(data.blocks)) {
            data.blocks.forEach((block) => {
                const el = window.BlockRenderer?.renderBlock(block, this.tracked)
                    ?? this._renderBlockFallback(block);
                if (el) this.appendElement(this.element, el);
            });
        }

        if (Array.isArray(data.links) && data.links.length) {
            const linksHeading = this._track(new ComponentLibrary.Heading({ level: 2, content: 'LINKS' }, this.deps));
            this.appendElement(this.element, linksHeading.render());

            data.links.forEach((link) => {
                const para = this._track(new ComponentLibrary.Paragraph({
                    content: link.label || link.url,
                    isClickable: true,
                    onClick: () => this.onNavigate?.(link)
                }, this.deps));
                const paraEl = para.render();
                paraEl.classList.add('about-section-link');
                this.appendElement(this.element, paraEl);
            });
        }

        if (Array.isArray(data.timeline) && data.timeline.length) {
            const timelineHeading = this._track(new ComponentLibrary.Heading({ level: 2, content: 'TIMELINE' }, this.deps));
            this.appendElement(this.element, timelineHeading.render());

            data.timeline.forEach((entry) => {
                const md = this._track(new ComponentLibrary.MarkdownBody({
                    markdownText: `**${entry.year} — ${entry.title}**\n\n${entry.detail || ''}`
                }, this.deps));
                this.appendElement(this.element, md.render());
            });
        }

        return this.element;
    }

    _renderBlockFallback(block) {
        if (block.type === 'markdown') {
            const md = this._track(new ComponentLibrary.MarkdownBody({ markdownText: block.content || '' }, this.deps));
            return md.render();
        }
        if (block.type === 'media' && block.src) {
            const img = this._track(new ComponentLibrary.Image({
                src: block.src,
                caption: block.caption || '',
                size: (block.size || 'm').toLowerCase()
            }, this.deps));
            return img.render();
        }
        return null;
    }

    destroy() {
        if (this.tracked.length && window.ComponentLibrary) {
            ComponentLibrary.destroyTracked(this.tracked);
        }
        this.tracked = [];
        super.destroy();
    }
}

class AboutErrorView extends BaseComponent {
    constructor(message, deps = {}) {
        super({ componentType: 'about-error' }, deps);
        this.message = message;
        this.tracked = [];
    }

    render() {
        if (this.element) return this.element;
        this.element = this.createElement('div', 'about-section toc-container');
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

const AboutSection = {
    version: '1.1.0',
    currentContainer: null,
    componentInstances: [],
    navigationCallbacks: null,
    dataUrl: 'blog/data/about.json',
    _view: null,

    async handleRoute(subsection, container, callbacks = {}) {
        window.debugLog('NAVIGATION', `👤 About Section v${this.version} handling route: ${subsection || 'main'}`);

        this.currentContainer = container;
        this.navigationCallbacks = callbacks;
        this.cleanup();

        if (subsection) {
            this._mountError(`Unknown about route: ${subsection}`);
            return;
        }

        window.NavigationController.setupNavigation('about', null, ['#about'], callbacks);

        try {
            const data = await this.loadData();
            this._mountPage(data);
        } catch (err) {
            console.error('About section load failed:', err);
            this._mountError(err.message);
        }
    },

    async loadData() {
        try {
            const fromApi = await this._loadFromApi();
            if (fromApi) return fromApi;
        } catch (error) {
            if (typeof window.debugLog === 'function') {
                window.debugLog('TOOLS', 'About API unavailable, falling back to static JSON:', error);
            }
        }
        const response = await fetch(this.dataUrl, { cache: 'no-cache' });
        if (!response.ok) throw new Error(`HTTP ${response.status} loading ${this.dataUrl}`);
        return response.json();
    },

    /**
     * Prefer published page-blocks row with pageSlug === 'about'.
     * @returns {Promise<object|null>}
     */
    async _loadFromApi() {
        const response = await fetch('/api/content/page-blocks?limit=100', { cache: 'no-cache' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const items = Array.isArray(data.items) ? data.items : [];
        const about = items.find((item) => item.pageSlug === 'about');
        if (!about) return null;
        return {
            header: about.title || 'ABOUT',
            blocks: Array.isArray(about.blocksJsonb) ? about.blocksJsonb : [],
            subheader: about.frontmatterJsonb?.subheader || about.subheader || '',
            hero: about.frontmatterJsonb?.hero || about.hero || null,
            links: about.frontmatterJsonb?.links || about.links || [],
            timeline: about.frontmatterJsonb?.timeline || about.timeline || [],
        };
    },

    _deps() {
        return { MF: window.MathematicalFoundation, Resize: window.ResizeManager };
    },

    _mountPage(data) {
        this._view = new AboutPageView(data, {
            onNavigate: (link) => this._openLink(link)
        }, this._deps());
        BaseComponent.mountSectionView(this.currentContainer, this._view);
        this.componentInstances = this._view.tracked;
        window.debugLog('NAVIGATION', '✅ About page rendered from JSON');
    },

    _mountError(message) {
        this._view = new AboutErrorView(message, this._deps());
        BaseComponent.mountSectionView(this.currentContainer, this._view);
        this.componentInstances = this._view.tracked;
    },

    _openLink(link) {
        if (!link?.url) return;
        if (link.external || /^https?:\/\//.test(link.url)) {
            window.open(link.url, '_blank', 'noopener,noreferrer');
            return;
        }
        const hash = link.url.startsWith('#') ? link.url.slice(1) : link.url;
        const parts = hash.split('/');
        const section = parts[0];
        const subsection = parts.length > 1 ? parts.slice(1).join('/') : null;
        if (this.navigationCallbacks?.navigateToSection) {
            this.navigationCallbacks.navigateToSection(section, subsection);
        } else if (window.Router) {
            window.Router.navigateToSection(section, subsection);
        }
    },

    cleanup() {
        window.debugLog('VERBOSE', '🧹 Cleaning up About Section...');
        if (this._view) {
            this._view.destroy();
            this._view = null;
        }
        if (this.currentContainer) {
            BaseComponent.clearSectionContainer(this.currentContainer, ['about-section', 'toc-container']);
        }
        this.componentInstances = [];
    }
};

window.AboutSection = AboutSection;
window.debugLog('INIT', `👤 AboutSection v${AboutSection.version} loaded`);
