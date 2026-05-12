/**
 * Home Section - SiteBoy Framework
 *
 * Full-viewport TreeTOC under root "ALI EINODER".
 * No header, footer, or subheader — controlled by Config.homeMode.
 * Content container scrolls normally; tree is centred on load.
 *
 * @version 7.0.0
 * @dependencies ['ComponentLibrary']
 */

class HomeSectionComponent extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'home-section' }, deps);
        this._toc           = null;
        this._panLoop       = null;
        this._panVx         = 0;
        this._panVy         = 0;
        this._mouseX        = 0;
        this._mouseY        = 0;
        this._dragActive    = false;
        this._dragMoved     = false;
        this._dragStartX    = 0;
        this._dragStartY    = 0;
        this._dragStartScrollL = 0;
        this._dragStartScrollT = 0;
        this._onPointerDown = null;
        this._onPointerMove = null;
        this._onPointerUp   = null;
        this._onPointerLeave = null;
    }

    render() {
        if (this.element) return this.element;

        // Wrapper: centres tree when smaller than viewport; expands naturally when larger.
        // Container is plain overflow:auto block — no flex on container so scroll works.
        this.element = this.createElement('div', 'home-section');
        this.element.style.cssText = `
            min-width: 100%;
            min-height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: calc(var(--f) * 4);
            box-sizing: border-box;
            cursor: grab;
            touch-action: none;
        `;

        this._toc = new ComponentLibrary.TreeTOC({
            data:                  this._buildTree(),
            collapsible:           true,
            noAutoScroll:          true,
            onItemClick:           (item) => this._handleClick(item),
            onBranchDoubleClick:   (item) => this._handleClick(item),
            onBranchAuxClick:      (item) => this._handleAuxClick(item),
        }, this.deps);

        this.children.add(this._toc);
        this.element.appendChild(this._toc.render());

        this._loadDocsAsync();
        this._initPan();

        return this.element;
    }

    // ── Pan: click-drag + edge-hover ──────────────────────────────────────────

    _initPan() {
        const el = this.element;
        let capturedPointerId = null;

        // ── Click-drag ────────────────────────────────────────────────────────
        // setPointerCapture is NOT called on pointerdown — doing so redirects
        // pointerup away from child label elements, breaking their click handlers.
        // Instead, capture is acquired only once the 4px drag threshold is crossed,
        // at which point a genuine drag is occurring and label clicks are irrelevant.
        this._onPointerDown = (e) => {
            if (e.button !== 0) return;
            const parent = el.parentElement;
            if (!parent) return;
            this._dragActive       = true;
            this._dragMoved        = false;
            this._dragStartX       = e.clientX;
            this._dragStartY       = e.clientY;
            this._dragStartScrollL = parent.scrollLeft;
            this._dragStartScrollT = parent.scrollTop;
            capturedPointerId      = e.pointerId;
        };

        this._onPointerMove = (e) => {
            const parent = el.parentElement;
            if (!parent) return;

            // Cursor position relative to container for edge-hover pan
            const rect = parent.getBoundingClientRect();
            this._mouseX = e.clientX - rect.left;
            this._mouseY = e.clientY - rect.top;

            if (this._dragActive) {
                const dx = e.clientX - this._dragStartX;
                const dy = e.clientY - this._dragStartY;
                if (!this._dragMoved && Math.abs(dx) + Math.abs(dy) >= 4) {
                    this._dragMoved = true;
                    el.style.cursor = 'grabbing';
                    // Acquire capture only after threshold — label pointerup has
                    // already fired, so no click events will be disrupted.
                    try { el.setPointerCapture(capturedPointerId); } catch (_) {}
                }
                if (this._dragMoved) {
                    parent.scrollLeft = this._dragStartScrollL - dx;
                    parent.scrollTop  = this._dragStartScrollT - dy;
                }
                return;
            }

            // Edge-hover velocity (only when not dragging)
            const F         = this._F();
            const EDGE_ZONE = F * 4;
            const MAX_SPEED = F * 60;
            const W         = parent.clientWidth;
            const H         = parent.clientHeight;
            const cx        = this._mouseX;
            const cy        = this._mouseY;

            let vx = 0, vy = 0;
            if (cx < EDGE_ZONE)          vx = -MAX_SPEED * (1 - cx / EDGE_ZONE);
            else if (cx > W - EDGE_ZONE) vx =  MAX_SPEED * (1 - (W - cx) / EDGE_ZONE);
            if (cy < EDGE_ZONE)          vy = -MAX_SPEED * (1 - cy / EDGE_ZONE);
            else if (cy > H - EDGE_ZONE) vy =  MAX_SPEED * (1 - (H - cy) / EDGE_ZONE);

            this._panVx = vx;
            this._panVy = vy;
        };

        this._onPointerUp = (e) => {
            if (!this._dragActive) return;
            try { el.releasePointerCapture(e.pointerId); } catch (_) {}
            capturedPointerId = null;
            this._dragActive  = false;
            el.style.cursor   = 'grab';
            this._dragMoved   = false;
        };

        // Suppress click events that follow a completed drag (capture phase so
        // we intercept before label click handlers fire).
        this._onClickCapture = (e) => {
            if (this._dragMoved) {
                e.stopPropagation();
                e.preventDefault();
            }
        };

        this._onPointerLeave = () => {
            this._panVx = 0;
            this._panVy = 0;
        };

        el.addEventListener('pointerdown',   this._onPointerDown);
        el.addEventListener('pointermove',   this._onPointerMove);
        el.addEventListener('pointerup',     this._onPointerUp);
        el.addEventListener('pointercancel', this._onPointerUp);
        el.addEventListener('click',         this._onClickCapture, true);
        el.addEventListener('pointerleave',  this._onPointerLeave);

        // ── Edge-hover AnimationLoop ──────────────────────────────────────────
        const AF = window.AnimationFoundation;
        if (AF && AF.AnimationLoop) {
            this._panLoop = new AF.AnimationLoop({
                onFrame: (delta) => {
                    if (this._dragActive) return;
                    if (!this._panVx && !this._panVy) return;
                    const parent = el.parentElement;
                    if (!parent) return;
                    parent.scrollLeft += this._panVx * (delta / 1000);
                    parent.scrollTop  += this._panVy * (delta / 1000);
                },
            });
            this._panLoop.start();
        }
    }

    // ── Tree ──────────────────────────────────────────────────────────────────

    _buildTree() {
        return {
            label: 'ALI EINODER',
            children: [
                this._buildArt(),
                this._buildTools(),
                this._buildDocs(),
                this._buildProjects(),
                this._buildContact(),
            ],
        };
    }

    _buildArt() {
        return {
            label: 'ART',
            description: 'Generative, physical, and photographic works',
            _data: { section: 'art' },
            children: [
                { label: 'Physical',    _data: { section: 'art', slug: 'physical' } },
                { label: 'Objects',     _data: { section: 'art', slug: 'objects' } },
                { label: 'Digital',     _data: { section: 'art', slug: 'digital' } },
                { label: 'Render',      _data: { section: 'art', slug: 'render' } },
                { label: 'Book',        _data: { section: 'art', slug: 'book' } },
                { label: 'Photography', _data: { section: 'art', slug: 'photography' } },
            ],
        };
    }

    _buildTools() {
        const toolsData = window.ToolsSection?.prepareToolsTOCData?.() || [];
        return {
            label: 'TOOLS',
            description: 'Creative development tools for generative art, image processing, and fabrication',
            _data: { section: 'tools' },
            children: toolsData.map(cat => ({
                label: cat.title || '',
                description: cat.description || '',
                children: (cat.articles || []).map(a => ({
                    label: a.title || '',
                    _data: { section: 'tools', slug: a.slug || a.id },
                })),
            })),
        };
    }

    _buildDocs() {
        return {
            label: 'DOCS',
            description: 'Technical documentation, guides, and references',
            _data: { section: 'blog' },
            children: [{ label: '(LOADING)', _data: null }],
        };
    }

    _buildProjects() {
        const structure = window.ProjectsSection?.navigationConfig?.structure || [];
        return {
            label: 'PROJECTS',
            description: 'Extended projects and case studies',
            _data: { section: 'projects' },
            children: structure.map(p => ({
                label: p.title || '',
                _data: { section: 'projects', slug: p.id },
            })),
        };
    }

    _buildContact() {
        return {
            label: 'CONTACT',
            description: 'Get in touch or find me online',
            _data: { action: 'contact' },
            children: [
                { label: 'Instagram',    _data: { external: true, url: 'https://www.instagram.com/a.einoder/' } },
                { label: 'Send message', _data: { action: 'contact' } },
            ],
        };
    }

    // ── Async docs ────────────────────────────────────────────────────────────

    async _loadDocsAsync() {
        const blog = window.BlogSection;
        if (!blog) return;
        if (!blog.manifestReady) await blog.ensureManifestReady?.();
        if (!blog.manifestReady || !this._toc) return;
        const treeData = blog.prepareBlogTreeData?.();
        if (treeData?.children) {
            this._toc.replaceBranchChildren('DOCS', treeData.children);
        }
    }

    // ── Click handling ────────────────────────────────────────────────────────

    _handleClick(item) {
        if (!item) return;
        if (item.external && item.url) {
            window.open(item.url, '_blank', 'noopener,noreferrer');
            return;
        }
        if (item.action === 'contact')    { this._navigate('contact');              return; }
        if (item.section === 'art')       { this._navigate('art',      item.slug);  return; }
        if (item.section === 'tools')     { this._navigate('tools',    item.slug);  return; }
        if (item.section === 'projects')  { this._navigate('projects', item.slug);  return; }
        if (item.section === 'blog')      { this._navigate('blog',     item.slug);  return; }
        if (item.slug)                    { this._navigate('blog',     item.slug); }
    }

    _handleAuxClick(item) {
        if (!item) return;
        if (item.external && item.url) {
            window.open(item.url, '_blank', 'noopener,noreferrer');
            return;
        }
        const section = item.section || item.action;
        if (!section) return;
        const base = window.location.href.split('#')[0];
        window.open(`${base}#${section}`, '_blank', 'noopener,noreferrer');
    }

    _navigate(section, subsection = null) {
        const cb = this.deps?.navigationCallbacks;
        if (cb?.navigateToSection) {
            cb.navigateToSection(section, subsection);
        } else if (window.Router) {
            window.Router.navigateToSection(section, subsection);
        }
    }

    // ── Utility ───────────────────────────────────────────────────────────────

    _F() { return this.deps?.MF?.F || window.Config?.F || 14; }

    destroy() {
        this._panLoop?.destroy();
        this._panLoop        = null;
        this._onPointerDown  = null;
        this._onPointerMove  = null;
        this._onPointerUp    = null;
        this._onClickCapture = null;
        this._onPointerLeave = null;
        this._toc            = null;
        super.destroy();
    }
}

// ── Section module (stateful singleton used by app.js) ────────────────────────

const HomeSection = {
    version: '7.0.0',
    currentContainer: null,
    _component: null,

    handleRoute(subsection, container, callbacks = {}) {
        this.currentContainer = container;
        this.cleanup();
        this._component = new HomeSectionComponent({}, {
            MF:     window.MathematicalFoundation,
            Resize: window.ResizeManager,
            navigationCallbacks: callbacks,
        });
        container.appendChild(this._component.render());
    },

    cleanup() {
        if (this._component) {
            this._component.destroy();
            this._component = null;
        }
    },

    getSectionInfo() {
        return { name: 'home', title: 'HOME', type: 'tree-toc' };
    },

    init() {},
};

window.HomeSection = HomeSection;
window.debugLog('INIT', `🏠 Home Section v${HomeSection.version} ready`);
