/**
 * About Section - SiteBoy Framework
 *
 * JSON-driven bio page from blog/data/about.json.
 * ComponentLibrary blocks only; no manual DOM in section handlers.
 *
 * @version 1.0.0
 * @dependencies ['ComponentLibrary']
 */

const AboutSection = {
    version: '1.0.0',
    currentContainer: null,
    componentInstances: [],
    navigationCallbacks: null,
    dataUrl: 'blog/data/about.json',

    async handleRoute(subsection, container, callbacks = {}) {
        window.debugLog('NAVIGATION', `👤 About Section v${this.version} handling route: ${subsection || 'main'}`);

        this.currentContainer = container;
        this.navigationCallbacks = callbacks;
        this.cleanup();

        if (subsection) {
            this.renderError(`Unknown about route: ${subsection}`);
            return;
        }

        window.NavigationController.setupNavigation('about', null, ['#about'], callbacks);

        try {
            const data = await this.loadData();
            this.renderPage(data);
        } catch (err) {
            console.error('About section load failed:', err);
            this.renderError(err.message);
        }
    },

    async loadData() {
        const response = await fetch(this.dataUrl, { cache: 'no-cache' });
        if (!response.ok) throw new Error(`HTTP ${response.status} loading ${this.dataUrl}`);
        return response.json();
    },

    renderPage(data) {
        const deps = { MF: window.MathematicalFoundation, Resize: window.ResizeManager };
        const tracked = (component) => {
            this.componentInstances.push(component);
            return component;
        };

        this.currentContainer.innerHTML = '';
        this.currentContainer.classList.add('about-section', 'toc-container');

        const title = tracked(new ComponentLibrary.Heading({
            level: 1,
            content: data.header || 'ABOUT'
        }, deps));
        this.currentContainer.appendChild(title.render());

        if (data.subheader) {
            const sub = tracked(new ComponentLibrary.Paragraph({ content: data.subheader }, deps));
            const subEl = sub.render();
            subEl.classList.add('about-section-subheader');
            this.currentContainer.appendChild(subEl);
        }

        if (data.hero?.src) {
            const hero = tracked(new ComponentLibrary.Image({
                src: data.hero.src,
                caption: data.hero.caption || '',
                size: (data.hero.size || 'm').toLowerCase()
            }, deps));
            this.currentContainer.appendChild(hero.render());
        }

        if (Array.isArray(data.blocks)) {
            data.blocks.forEach((block) => {
                const el = window.BlockRenderer?.renderBlock(block, this.componentInstances)
                    ?? this._renderBlockFallback(block, tracked, deps);
                if (el) this.currentContainer.appendChild(el);
            });
        }

        if (Array.isArray(data.links) && data.links.length) {
            const linksHeading = tracked(new ComponentLibrary.Heading({ level: 2, content: 'LINKS' }, deps));
            this.currentContainer.appendChild(linksHeading.render());

            data.links.forEach((link) => {
                const para = tracked(new ComponentLibrary.Paragraph({
                    content: link.label || link.url,
                    isClickable: true,
                    onClick: () => this._openLink(link)
                }, deps));
                const paraEl = para.render();
                paraEl.classList.add('about-section-link');
                this.currentContainer.appendChild(paraEl);
            });
        }

        if (Array.isArray(data.timeline) && data.timeline.length) {
            const timelineHeading = tracked(new ComponentLibrary.Heading({ level: 2, content: 'TIMELINE' }, deps));
            this.currentContainer.appendChild(timelineHeading.render());

            data.timeline.forEach((entry) => {
                const md = tracked(new ComponentLibrary.MarkdownBody({
                    markdownText: `**${entry.year} — ${entry.title}**\n\n${entry.detail || ''}`
                }, deps));
                this.currentContainer.appendChild(md.render());
            });
        }

        window.debugLog('NAVIGATION', '✅ About page rendered from JSON');
    },

    _renderBlockFallback(block, tracked, deps) {
        if (block.type === 'markdown') {
            const md = tracked(new ComponentLibrary.MarkdownBody({ markdownText: block.content || '' }, deps));
            return md.render();
        }
        if (block.type === 'media' && block.src) {
            const img = tracked(new ComponentLibrary.Image({
                src: block.src,
                caption: block.caption || '',
                size: (block.size || 'm').toLowerCase()
            }, deps));
            return img.render();
        }
        return null;
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

    renderError(message) {
        this.currentContainer.innerHTML = '';
        const para = new ComponentLibrary.Paragraph({ content: `⚠ ${message}` }, {
            MF: window.MathematicalFoundation
        });
        this.componentInstances.push(para);
        this.currentContainer.appendChild(para.render());
    },

    cleanup() {
        window.debugLog('VERBOSE', '🧹 Cleaning up About Section...');
        if (this.currentContainer) {
            this.currentContainer.innerHTML = '';
            this.currentContainer.classList.remove('about-section', 'toc-container');
        }
        if (this.componentInstances.length && window.ComponentLibrary) {
            ComponentLibrary.destroyTracked(this.componentInstances);
        }
        this.componentInstances = [];
    }
};

window.AboutSection = AboutSection;
window.debugLog('INIT', `👤 AboutSection v${AboutSection.version} loaded`);
