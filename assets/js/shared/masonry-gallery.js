/**
 * Masonry Gallery - SiteBoy Framework
 *
 * COMPONENTS OWNED BY THIS FILE:
 * - GalleryLightbox       (full-screen zoom/pan image viewer, keyboard+touch nav)
 * - MasonryGallery        (CSS column masonry with lazy loading, opens GalleryLightbox)
 * - ImageGrid             (2-column card grid for category/section/image browsing)
 * - ArtworkPage           (vertical block-stack for a single artwork page)
 * - HorizontalImageStrip  (horizontal snap-scroll strip; reserved future block type)
 *
 * @version 5.0.0
 * @dependencies foundation.js (BaseComponent)
 */

import { BaseComponent } from './foundation.js';
import { MarkdownBody } from './content.js';

// ── GalleryLightbox ────────────────────────────────────────────────────────────

/**
 * Full-screen image viewer.
 * - Mouse wheel zoom (toward cursor)
 * - Click+drag pan (when zoomed)
 * - Touch pinch-to-zoom + drag-to-pan
 * - Touch swipe left/right to navigate (when not zoomed)
 * - Keyboard: ← → navigate, Esc close
 * - Click backdrop to close
 */
export class GalleryLightbox extends BaseComponent {
    static MODES = ['fit', 'fill', 'actual'];

    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'gallery-lightbox' }, deps);
        this.images = options.images || [];   // [{ src, zoom, title, caption }]
        this.index  = options.index  ?? 0;

        this._mode       = GalleryLightbox.MODES.includes(options.mode) ? options.mode : 'fit';
        this._zoom       = 1;
        this._panX       = 0;
        this._panY       = 0;
        this._drag       = null;
        this._dragged    = false;
        this._pinchStart = null;

        this._overlay   = null;
        this._imgEl     = null;
        this._imgWrap   = null;
        this._counter   = null;
        this._modeBtn   = null;
        this._loadingEl = null;

        this._onKey   = this._onKey.bind(this);
        this._onWheel = this._onWheel.bind(this);
        this._onMD    = this._onMD.bind(this);
        this._onMM    = this._onMM.bind(this);
        this._onMU    = this._onMU.bind(this);
    }

    render() {
        if (!this.element) this.element = this.createElement('div', 'gallery-lightbox');
        return this.element;
    }

    open() {
        this._buildOverlay();
        this.attachToBody(this._overlay);
        this._loadImage();
        document.addEventListener('keydown', this._onKey);
    }

    close() {
        if (!this._overlay) return;
        document.removeEventListener('keydown', this._onKey);
        this._removeZoomListeners();
        this._overlay.remove();
        this._overlay   = null;
        this._imgEl     = null;
        this._imgWrap   = null;
        this._counter   = null;
        this._modeBtn   = null;
        this._loadingEl = null;
    }

    // ── Build DOM ──────────────────────────────────────────────────────────────

    _buildOverlay() {
        this._overlay = this.createElement('div', 'gallery-lightbox__overlay');

        // Top bar — toolbar layout per component-patterns.md §3.1:
        // status cell (left, flex:1) │ action cells (right, 6F each)
        const bar = this.createElement('div', 'gallery-lightbox__bar');

        this._counter = this.createElement('div', 'gallery-lightbox__counter');
        bar.appendChild(this._counter);

        const prev = this._barBtn('PREV', '←', 'left');
        prev.addEventListener('click', (e) => { e.stopPropagation(); this._navigate(-1); });
        bar.appendChild(prev);

        const next = this._barBtn('NEXT', '→', 'right');
        next.addEventListener('click', (e) => { e.stopPropagation(); this._navigate(1); });
        bar.appendChild(next);

        // Mode is a cyclic state label (FIT/FILL/ACTUAL). Per design-law §13.3
        // the label shows the current state; no glyph indicates state change.
        this._modeBtn = this._barBtn(this._mode.toUpperCase());
        this._modeBtn.addEventListener('click', (e) => { e.stopPropagation(); this._cycleMode(); });
        bar.appendChild(this._modeBtn);

        const closeBtn = this._barBtn('CLOSE', '×', 'right');
        closeBtn.addEventListener('click', (e) => { e.stopPropagation(); this.close(); });
        bar.appendChild(closeBtn);

        // Image wrap — click backdrop closes
        this._imgWrap = this.createElement('div', 'gallery-lightbox__wrap');
        this._imgWrap.addEventListener('click', () => {
            if (!this._dragged) this.close();
        });

        this._imgEl = this.createElement('img', 'gallery-lightbox__img');
        this._imgEl.draggable = false;
        this._imgEl.addEventListener('click', (e) => e.stopPropagation());

        this._loadingEl = this.createElement('div', 'gallery-lightbox__loading');
        this._loadingEl.textContent = 'LOADING';

        this._imgWrap.appendChild(this._imgEl);
        this._imgWrap.appendChild(this._loadingEl);

        this._overlay.appendChild(bar);
        this._overlay.appendChild(this._imgWrap);

        this._applyMode();
        this._addZoomListeners();
    }

    /**
     * Build a toolbar button per semiotics §5 (canonical glyph DOM):
     * label and glyph live in separate spans, separated by one literal space
     * (per semiotics §4). When `glyph` is falsy the button shows label only —
     * used for cyclic state-label cells (e.g. MODE = FIT/FILL/ACTUAL).
     *
     * @param {string} label             - UPPERCASE label text.
     * @param {string} [glyph]           - Optional glyph (e.g. '←', '→', '×').
     * @param {'left'|'right'} [side]    - Glyph position; required when `glyph` is set.
     */
    _barBtn(label, glyph, side) {
        const btn = this.createElement('button', 'gallery-lightbox__btn');
        btn.type = 'button';
        if (!glyph) {
            btn.textContent = label;
            return btn;
        }
        const g = this.createElement('span', 'gallery-lightbox__btn-glyph');
        const l = this.createElement('span', 'gallery-lightbox__btn-label');
        if (side === 'left') {
            g.textContent = glyph;
            l.textContent = ' ' + label;
            btn.appendChild(g);
            btn.appendChild(l);
        } else {
            l.textContent = label;
            g.textContent = ' ' + glyph;
            btn.appendChild(l);
            btn.appendChild(g);
        }
        return btn;
    }

    // ── Display modes (FIT / FILL / ACTUAL) ────────────────────────────────────
    // Owned by toolbar per component-patterns.md §4.

    _cycleMode() {
        const modes = GalleryLightbox.MODES;
        this._mode = modes[(modes.indexOf(this._mode) + 1) % modes.length];
        if (this._modeBtn) this._modeBtn.textContent = this._mode.toUpperCase();
        this._applyMode();
    }

    _applyMode() {
        if (!this._imgEl || !this._imgWrap) return;

        // Reset zoom/pan on mode change so the chosen mode is observed cleanly.
        this._zoom = 1;
        this._panX = 0;
        this._panY = 0;

        this._imgEl.classList.remove('gallery-lightbox__img--fill', 'gallery-lightbox__img--actual');
        this._imgWrap.classList.remove('gallery-lightbox__wrap--actual');

        if (this._mode === 'fill') {
            this._imgEl.classList.add('gallery-lightbox__img--fill');
        } else if (this._mode === 'actual') {
            this._imgEl.classList.add('gallery-lightbox__img--actual');
            this._imgWrap.classList.add('gallery-lightbox__wrap--actual');
        }

        this._applyTransform();
    }

    // ── Image loading ──────────────────────────────────────────────────────────

    _loadImage() {
        const img = this.images[this.index];
        if (!img || !this._imgEl) return;

        this._zoom = 1; this._panX = 0; this._panY = 0;
        this._applyTransform();

        this._imgEl.style.opacity = '0';
        this._loadingEl.style.display = 'flex';

        const src = img.zoom || img.src;
        this._imgEl.onload = () => {
            this._imgEl.style.opacity = '1';
            this._loadingEl.style.display = 'none';
            this._loadingEl.classList.remove('gallery-lightbox__loading--error');
            this._loadingEl.textContent = 'LOADING';
        };
        this._imgEl.onerror = () => {
            if (img.src && this._imgEl.src !== img.src) {
                this._imgEl.src = img.src;
            } else {
                this._loadingEl.classList.add('gallery-lightbox__loading--error');
                this._loadingEl.textContent = 'FAILED TO LOAD';
            }
        };
        this._imgEl.src = src;
        this._imgEl.alt = img.title || '';

        const total = String(this.images.length).padStart(4, '0');
        const cur   = String(this.index + 1).padStart(4, '0');
        this._counter.textContent = `${cur} / ${total}`;
    }

    _navigate(dir) {
        if (this.images.length <= 1) return;
        this.index = (this.index + dir + this.images.length) % this.images.length;
        this._loadImage();
    }

    _onKey(e) {
        if (e.key === 'Escape')     this.close();
        if (e.key === 'ArrowLeft')  this._navigate(-1);
        if (e.key === 'ArrowRight') this._navigate(1);
    }

    // ── Zoom / Pan ─────────────────────────────────────────────────────────────

    _applyTransform() {
        if (!this._imgEl) return;
        this._imgEl.style.transform = `translate(${this._panX}px, ${this._panY}px) scale(${this._zoom})`;
        if (this._imgWrap) {
            this._imgWrap.style.cursor = this._canPan() ? 'grab' : 'zoom-in';
        }
    }

    _canPan() {
        return this._zoom > 1 || this._mode === 'actual';
    }

    _addZoomListeners() {
        this._imgWrap.addEventListener('wheel', this._onWheel, { passive: false });
        this._imgWrap.addEventListener('mousedown', this._onMD);
        window.addEventListener('mousemove', this._onMM);
        window.addEventListener('mouseup', this._onMU);
        this._onTS = this._onTouchStart.bind(this);
        this._onTM = this._onTouchMove.bind(this);
        this._onTE = () => { this._drag = null; this._pinchStart = null; };
        this._imgWrap.addEventListener('touchstart', this._onTS, { passive: false });
        this._imgWrap.addEventListener('touchmove',  this._onTM, { passive: false });
        this._imgWrap.addEventListener('touchend',   this._onTE);
    }

    _removeZoomListeners() {
        if (!this._imgWrap) return;
        this._imgWrap.removeEventListener('wheel', this._onWheel);
        this._imgWrap.removeEventListener('mousedown', this._onMD);
        window.removeEventListener('mousemove', this._onMM);
        window.removeEventListener('mouseup', this._onMU);
        if (this._onTS) this._imgWrap.removeEventListener('touchstart', this._onTS);
        if (this._onTM) this._imgWrap.removeEventListener('touchmove',  this._onTM);
        if (this._onTE) this._imgWrap.removeEventListener('touchend',   this._onTE);
    }

    _onWheel(e) {
        e.preventDefault();
        const rect = this._imgWrap.getBoundingClientRect();
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;
        const mx = e.clientX - cx;
        const my = e.clientY - cy;
        const factor = e.deltaY < 0 ? 1.15 : 0.87;
        const newZoom = Math.max(0.5, Math.min(8, this._zoom * factor));
        const s = newZoom / this._zoom;
        // Zoom toward cursor: adjust pan so the point under cursor stays fixed
        this._panX = mx + (this._panX - mx) * s;
        this._panY = my + (this._panY - my) * s;
        this._zoom = newZoom;
        this._applyTransform();
    }

    _onMD(e) {
        e.preventDefault();
        this._dragged = false;
        this._drag = { sx: e.clientX, sy: e.clientY, px: this._panX, py: this._panY };
        if (this._canPan()) this._imgWrap.style.cursor = 'grabbing';
    }

    _onMM(e) {
        if (!this._drag) return;
        const dx = e.clientX - this._drag.sx;
        const dy = e.clientY - this._drag.sy;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) this._dragged = true;
        if (this._canPan()) {
            this._panX = this._drag.px + dx;
            this._panY = this._drag.py + dy;
            this._applyTransform();
        }
    }

    _onMU() {
        this._drag = null;
        if (this._imgWrap) this._imgWrap.style.cursor = this._canPan() ? 'grab' : 'zoom-in';
    }

    _onTouchStart(e) {
        if (e.touches.length === 2) {
            e.preventDefault();
            this._pinchStart = {
                dist: this._touchDist(e.touches),
                zoom: this._zoom,
            };
            this._drag = null;
        } else if (e.touches.length === 1) {
            const t = e.touches[0];
            this._drag = { sx: t.clientX, sy: t.clientY, px: this._panX, py: this._panY };
            this._dragged = false;
        }
    }

    _onTouchMove(e) {
        e.preventDefault();
        if (e.touches.length === 2 && this._pinchStart) {
            const dist = this._touchDist(e.touches);
            this._zoom = Math.max(0.5, Math.min(8, this._pinchStart.zoom * (dist / this._pinchStart.dist)));
            this._applyTransform();
        } else if (e.touches.length === 1 && this._drag) {
            const t = e.touches[0];
            const dx = t.clientX - this._drag.sx;
            const dy = t.clientY - this._drag.sy;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) this._dragged = true;
            if (this._canPan()) {
                this._panX = this._drag.px + dx;
                this._panY = this._drag.py + dy;
                this._applyTransform();
            } else if (this._dragged && Math.abs(dx) > 60 && Math.abs(dy) < 40) {
                // Swipe to navigate
                this._navigate(dx < 0 ? 1 : -1);
                this._drag = null;
            }
        }
    }

    _touchDist(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    destroy() {
        this.close();
        super.destroy();
    }
}

// ── MasonryGallery ─────────────────────────────────────────────────────────────

export class MasonryGallery extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'masonry-gallery' }, deps);
        this.images = options.images || [];
        this.gap    = options.gap    || 0;
        this.columns = {
            mobile:  options.columnsMobile  || 1,
            tablet:  options.columnsTablet  || 2,
            desktop: options.columnsDesktop || 3,
            wide:    options.columnsWide    || 4,
        };
        this.observer    = null;
        this.loadBuffer  = options.loadBuffer || 200;
        this.lightbox    = null;
        // If provided, overrides the default lightbox-open behaviour on card click.
        this.onItemClick = options.onItemClick || null;
    }

    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'masonry-gallery');
            const grid = this.createElement('ul', 'masonry-gallery__grid');
            this.images.forEach((img, index) => grid.appendChild(this.createItem(img, index)));
            this.element.appendChild(grid);
            requestAnimationFrame(() => this.setupLazyLoading(grid));
        }
        return this.element;
    }

    createItem(imageData, index) {
        const item = this.createElement('li', 'masonry-item');
        item.dataset.index = index;

        const img = this.createElement('img', 'masonry-item__img');
        img.dataset.src = imageData.thumb || imageData.src || imageData.imageUrl;
        img.alt = imageData.title || `Image ${index + 1}`;

        const label = this.createElement('div', 'masonry-item__label');
        label.textContent = `#${String(index + 1).padStart(4, '0')}`;

        item.appendChild(img);
        item.appendChild(label);

        item.addEventListener('click', () => {
            if (this.onItemClick) {
                this.onItemClick(imageData, index, item);
            } else {
                this._openLightbox(index);
            }
        });
        return item;
    }

    _openLightbox(startIndex) {
        if (this.lightbox) { this.lightbox.destroy(); this.lightbox = null; }
        const images = this.images.map(img => ({
            src:     img.src     || img.imageUrl || img.thumb,
            zoom:    img.zoom    || img.src || img.imageUrl,
            title:   img.title   || '',
            caption: img.caption || '',
        }));
        this.lightbox = new GalleryLightbox(
            { images, index: startIndex },
            { MF: this.deps.MF }
        );
        this.lightbox.open();
    }

    setupLazyLoading(grid) {
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    const item = entry.target;
                    const img  = item.querySelector('img');
                    if (img && img.dataset.src) {
                        img.src = img.dataset.src;
                        img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
                        delete img.dataset.src;
                    }
                    this.observer.unobserve(item);
                });
            },
            { rootMargin: `${this.loadBuffer}px`, threshold: 0.01 }
        );
        grid.querySelectorAll('.masonry-item').forEach(item => this.observer.observe(item));
    }

    destroy() {
        if (this.observer) { this.observer.disconnect(); this.observer = null; }
        if (this.lightbox) { this.lightbox.destroy(); this.lightbox = null; }
        if (this.element)  { this.element.remove(); this.element = null; }
    }
}

// ── ImageGrid ──────────────────────────────────────────────────────────────────

/**
 * 2-column card grid for art category/section/image browsing.
 *
 * Each card:
 *   - 4-sided border (var(--c-border))
 *   - F internal padding all sides
 *   - Cropped preview image (1:1 aspect ratio, object-fit: cover)
 *   - F gap below image (spacer)
 *   - Label row 2F tall: NAME (left, var(--c-text)) | COUNT (right, var(--c-border))
 *     UPPERCASE, font-size F × 0.75 per text-treatment §2
 *   - Card padding F provides the gap from label to bottom border
 *
 * Hover: border → var(--c-text), image opacity 0.85, text → var(--c-text).
 * Orphan (odd count): last card spans both columns.
 * Lazy loads images via IntersectionObserver.
 *
 * Options:
 *   items   [{ image, label, count, onClick }]  — card data
 *   columns  number  — default 2; set to 1 to force single-column
 */
export class ImageGrid extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'image-grid' }, deps);
        this.items   = options.items   || [];
        this.columns = options.columns || 2;
        this.observer = null;
    }

    render() {
        if (this.element) return this.element;

        const F = this.deps.MF ? this.deps.MF.F : 14;

        this.element = this.createElement('div', 'image-grid');
        this.element.style.cssText = `
            display: grid;
            grid-template-columns: repeat(${this.columns}, 1fr);
            column-gap: ${F}px;
            row-gap: ${F * 2}px;
            box-sizing: border-box;
        `;

        this.items.forEach((item, index) => {
            const card = this._createCard(item, index, F);
            // Orphan: last item in an odd-count grid spans full width
            if (this.items.length % 2 !== 0 && index === this.items.length - 1) {
                card.style.gridColumn = '1 / -1';
            }
            this.element.appendChild(card);
        });

        this._setupLazyLoading();
        return this.element;
    }

    _createCard(item, index, F) {
        const card = this.createElement('div', 'image-grid-card');
        card.style.cssText = `
            border: 1px solid var(--c-border);
            padding: ${F}px;
            cursor: pointer;
            box-sizing: border-box;
            transition: border-color 0.15s;
        `;

        // Preview image
        const imgWrap = this.createElement('div', 'image-grid-card-img');
        imgWrap.style.cssText = `
            width: 100%;
            aspect-ratio: 1 / 1;
            overflow: hidden;
            display: block;
        `;
        const img = this.createElement('img');
        img.alt = item.label || '';
        img.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            transition: opacity 0.15s;
        `;
        if (item.image) {
            img.dataset.src = item.image;
            img.dataset.gridIndex = index;
        }
        imgWrap.appendChild(img);
        card.appendChild(imgWrap);

        // Gap image → label
        const spacer = this.createElement('div');
        spacer.style.height = `${F}px`;
        card.appendChild(spacer);

        // Label row
        const label = this.createElement('div', 'image-grid-card-label');
        label.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: ${F * 2}px;
            font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F * 0.75}px;
            text-transform: uppercase;
            white-space: nowrap;
            overflow: hidden;
            box-sizing: border-box;
        `;

        const nameEl = this.createElement('span', 'image-grid-card-name');
        nameEl.textContent = item.label || '';
        nameEl.style.cssText = `
            color: var(--c-text);
            overflow: hidden;
            text-overflow: ellipsis;
            transition: color 0.15s;
        `;

        const countEl = this.createElement('span', 'image-grid-card-count');
        countEl.textContent = item.count != null ? String(item.count) : '';
        countEl.style.cssText = `
            color: var(--c-border);
            flex-shrink: 0;
            margin-left: ${F / 2}px;
            transition: color 0.15s;
        `;

        label.appendChild(nameEl);
        label.appendChild(countEl);
        card.appendChild(label);

        // No explicit bottom spacer — card padding (F) provides the gap from label to border.

        // Hover state
        card.addEventListener('mouseenter', () => {
            card.style.borderColor = 'var(--c-text)';
            img.style.opacity = '0.85';
            nameEl.style.color = 'var(--c-text)';
            countEl.style.color = 'var(--c-text)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.borderColor = 'var(--c-border)';
            img.style.opacity = '1';
            nameEl.style.color = 'var(--c-text)';
            countEl.style.color = 'var(--c-border)';
        });

        // Click
        if (item.onClick) {
            card.addEventListener('click', () => item.onClick(item, index, card));
        }

        return card;
    }

    _setupLazyLoading() {
        if (!this.element) return;
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    const img = entry.target.querySelector('img[data-src]');
                    if (img) {
                        img.src = img.dataset.src;
                        img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
                        delete img.dataset.src;
                    }
                    this.observer.unobserve(entry.target);
                });
            },
            { rootMargin: '200px', threshold: 0.01 }
        );
        this.element.querySelectorAll('.image-grid-card').forEach(card => {
            this.observer.observe(card);
        });
    }

    destroy() {
        if (this.observer) { this.observer.disconnect(); this.observer = null; }
        if (this.element)  { this.element.remove(); this.element = null; }
    }
}

// ── ArtworkPage ────────────────────────────────────────────────────────────────

/**
 * Vertical block-stack renderer for a single artwork's page content.
 *
 * Blocks schema: [{ type: 'image', src, zoom, thumb, title } | { type: 'md', text }]
 * Unknown block types are silently skipped (forward-compatible for 'strip' etc.).
 *
 * Scrollbar stays inside the bordered frame: outer .artwork-page is overflow:hidden,
 * inner .artwork-page-inner is overflow-y:auto.
 * Image max-height is measured from the container height after first paint and
 * tracked via ResizeObserver.
 *
 * Options:
 *   blocks   [{ type, ...fields }]
 *   title    string
 *   onClose  function  (called on Escape key)
 */
export class ArtworkPage extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'artwork-page' }, deps);
        this.blocks  = options.blocks  || [];
        this.title   = options.title   || '';
        this.onClose = options.onClose || null;

        this._lightbox       = null;
        this._markdownBodies = [];
        this._allImgs        = [];
        this._resizeObserver = null;
        this._onKey          = this._onKey.bind(this);
    }

    render() {
        if (this.element) return this.element;
        const F = this.deps.MF ? this.deps.MF.F : 14;

        this.element = this.createElement('div', 'artwork-page');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            overflow: hidden;
        `;

        const inner = this.createElement('div', 'artwork-page-inner');
        inner.style.cssText = `
            width: 100%;
            height: 100%;
            overflow-y: auto;
            overflow-x: hidden;
            box-sizing: border-box;
        `;
        this.element.appendChild(inner);

        // CSS fallback max-height until JS measurement is ready
        const fallbackMaxH = `calc(100vh - var(--header-height) * 2 - ${F * 4}px)`;

        const applyImgCap = () => {
            const h = this.element.getBoundingClientRect().height;
            if (!h) return;
            const cap = `${Math.max(120, h - F * 2)}px`;
            this._allImgs.forEach(img => { img.style.maxHeight = cap; });
        };

        this._resizeObserver = new ResizeObserver(applyImgCap);
        this._resizeObserver.observe(this.element);

        // Collect image-type blocks for the page-scoped lightbox
        const imageBlocks = this.blocks.filter(b => b.type === 'image');

        this.blocks.forEach((block, bi) => {
            if (block.type === 'image') {
                const imageIndex = imageBlocks.indexOf(block);
                const wrapper = this.createElement('div', 'artwork-page-image-block');
                wrapper.style.cssText = `
                    display: flex;
                    justify-content: center;
                    padding: 0 ${F}px;
                    box-sizing: border-box;
                    ${bi > 0 ? `border-top: 1px solid var(--c-border);` : ''}
                `;
                const img = this.createElement('img');
                img.alt = block.title || '';
                img.style.cssText = `
                    max-width: 100%;
                    width: auto;
                    max-height: ${fallbackMaxH};
                    height: auto;
                    display: block;
                    cursor: zoom-in;
                `;
                img.dataset.src = block.src || block.zoom || '';
                img.addEventListener('click', () => this._openLightbox(imageBlocks, imageIndex));
                this._allImgs.push(img);
                wrapper.appendChild(img);
                inner.appendChild(wrapper);
            } else if (block.type === 'md') {
                const md = new MarkdownBody({
                    markdownText: block.text,
                    className:    'artwork-page-md-block markdown-body',
                }, { MF: this.deps.MF });
                this._markdownBodies.push(md);
                const textEl = md.render();
                textEl.style.cssText = `
                    padding: ${F}px;
                    box-sizing: border-box;
                    ${bi > 0 ? `border-top: 1px solid var(--c-border);` : ''}
                `;
                inner.appendChild(textEl);
            }
            // Unknown types: silently skipped
        });

        // Lazy-load images via IntersectionObserver
        this._imgObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const img = entry.target;
                if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
                this._imgObserver.unobserve(img);
            });
        }, { rootMargin: '400px', threshold: 0.01 });
        this._allImgs.forEach(img => this._imgObserver.observe(img));

        requestAnimationFrame(applyImgCap);
        return this.element;
    }

    _openLightbox(imageBlocks, startIndex) {
        if (this._lightbox) { this._lightbox.destroy(); this._lightbox = null; }
        const images = imageBlocks.map(b => ({
            src:   b.src   || b.zoom || '',
            zoom:  b.zoom  || b.src  || '',
            title: b.title || '',
        }));
        this._lightbox = new GalleryLightbox(
            { images, index: startIndex },
            { MF: this.deps.MF }
        );
        this._lightbox.open();
    }

    _onKey(e) {
        if (e.key === 'Escape' && this.onClose) this.onClose();
    }

    mount() {
        document.addEventListener('keydown', this._onKey);
    }

    destroy() {
        document.removeEventListener('keydown', this._onKey);
        if (this._lightbox)      { this._lightbox.destroy(); this._lightbox = null; }
        if (this._resizeObserver){ this._resizeObserver.disconnect(); this._resizeObserver = null; }
        if (this._imgObserver)   { this._imgObserver.disconnect(); this._imgObserver = null; }
        this._markdownBodies.forEach(m => { try { m.destroy?.(); } catch (_) { /* no-op */ } });
        this._markdownBodies = [];
        this._allImgs = [];
        if (this.element) { this.element.remove(); this.element = null; }
        super.destroy();
    }
}

// ── HorizontalImageStrip ───────────────────────────────────────────────────────

/**
 * Horizontal snap-scroll strip of image slots.
 * Reserved for future use as a { type: 'strip' } block inside ArtworkPage,
 * or as a standalone component elsewhere in the UI.
 *
 * Each slot shows one group of images stacked vertically; the strip
 * translates horizontally to reveal the active slot.
 *
 * Options:
 *   projects   [{ id, title, images: [{src,zoom,thumb,title}], text? }]
 *   startIndex number
 *   onNavigate function(index, project)  — called on slot change
 */
export class HorizontalImageStrip extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'horizontal-image-strip' }, deps);
        this.projects      = options.projects    || [];
        this._currentIndex = options.startIndex  || 0;
        this.onNavigate    = options.onNavigate  || null;

        this._strip              = null;
        this._lightbox           = null;
        this._stackObserver      = null;
        this._slotResizeObserver = null;
        this._slotResizeCallbacks = [];
        this._markdownBodies     = [];
        this._onTouchStart       = this._onTouchStart.bind(this);
        this._onTouchEnd         = this._onTouchEnd.bind(this);
        this._touchStartX        = 0;
    }

    render() {
        if (this.element) return this.element;
        const F = this.deps.MF ? this.deps.MF.F : 14;

        this.element = this.createElement('div', 'horizontal-image-strip');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            overflow: hidden;
        `;

        this._strip = this._buildStrip(F);
        this.element.appendChild(this._strip);
        return this.element;
    }

    mount() {
        this.element?.addEventListener('touchstart', this._onTouchStart, { passive: true });
        this.element?.addEventListener('touchend',   this._onTouchEnd,   { passive: true });
        this.scrollTo(this._currentIndex, false);
    }

    scrollTo(index, animate = true) {
        if (!this._strip) return;
        const slots = this._strip.querySelectorAll('.his-slot');
        if (!slots[index]) return;
        this._currentIndex = index;

        slots.forEach(s => {
            const inner = s.querySelector('.his-slot-inner');
            if (inner) inner.scrollTop = 0;
        });

        const offset = index * this._strip.offsetWidth;
        // Transition declared in components.css under .his-strip; toggle the
        // .his-strip--no-transition modifier for the non-animated initial mount.
        this._strip.classList.toggle('his-strip--no-transition', !animate);
        this._strip.style.transform = `translateX(-${offset}px)`;

        const proj = this.projects[index];
        if (this.onNavigate) {
            try { this.onNavigate(index, proj); } catch (_) { /* no-op */ }
        }
    }

    prev() { if (this._currentIndex > 0) this.scrollTo(this._currentIndex - 1); }
    next() { if (this._currentIndex < this.projects.length - 1) this.scrollTo(this._currentIndex + 1); }

    _buildStrip(F) {
        const strip = this.createElement('div', 'his-strip');
        strip.style.cssText = `
            display: flex;
            flex-direction: row;
            flex: 1;
            min-height: 0;
            overflow: hidden;
            box-sizing: border-box;
        `;

        this._stackObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const img = entry.target.querySelector('img[data-src]');
                if (img) { img.src = img.dataset.src; delete img.dataset.src; }
                this._stackObserver.unobserve(entry.target);
            });
        }, { rootMargin: '400px', threshold: 0.01 });

        this._slotResizeObserver = new ResizeObserver(() => {
            this._slotResizeCallbacks.forEach(cb => cb());
        });

        this.projects.forEach((project, pi) => {
            strip.appendChild(this._buildSlot(project, pi, F));
        });
        return strip;
    }

    _buildSlot(project, pi, F) {
        const slot = this.createElement('div', 'his-slot');
        slot.style.cssText = `
            flex: 0 0 100%;
            width: 100%;
            overflow: hidden;
            box-sizing: border-box;
            min-height: 0;
        `;

        const inner = this.createElement('div', 'his-slot-inner');
        inner.style.cssText = `
            width: 100%;
            height: 100%;
            overflow-y: auto;
            overflow-x: hidden;
            box-sizing: border-box;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            align-content: flex-start;
            align-items: flex-start;
        `;
        slot.appendChild(inner);

        const fallbackMaxH = `calc(100vh - var(--header-height) * 2 - ${F * 4}px)`;
        const allImgs = [];
        const applyImgCap = () => {
            const h = slot.getBoundingClientRect().height;
            if (!h) return;
            const cap = `${Math.max(120, h - F * 2)}px`;
            allImgs.forEach(img => { img.style.maxHeight = cap; });
        };
        this._slotResizeCallbacks.push(applyImgCap);
        this._slotResizeObserver.observe(slot);

        project.images.forEach((imageData, ii) => {
            const block = this.createElement('div', 'his-image-block');
            block.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 0 ${F}px;
                box-sizing: border-box;
                flex: 1 0 100%;
                ${ii > 0 ? 'border-top: 1px solid var(--c-border);' : ''}
            `;
            const img = this.createElement('img');
            img.alt = imageData.title || '';
            img.style.cssText = `
                max-width: 100%;
                width: auto;
                max-height: ${fallbackMaxH};
                height: auto;
                display: block;
                cursor: zoom-in;
            `;
            img.dataset.src = imageData.src || imageData.zoom || '';
            img.addEventListener('click', () => this._openLightbox(project.images, ii));
            allImgs.push(img);
            block.appendChild(img);
            inner.appendChild(block);
            if (this._stackObserver) this._stackObserver.observe(block);
        });

        if (project.text) {
            const md = new MarkdownBody({
                markdownText: project.text,
                className:    'his-md-block markdown-body',
            }, { MF: this.deps.MF });
            this._markdownBodies.push(md);
            const textEl = md.render();
            textEl.style.cssText = `
                padding: ${F}px;
                box-sizing: border-box;
                border-top: 1px solid var(--c-border);
                flex: 1 0 100%;
            `;
            inner.appendChild(textEl);
        }

        requestAnimationFrame(applyImgCap);
        return slot;
    }

    _openLightbox(images, startIndex) {
        if (this._lightbox) { this._lightbox.destroy(); this._lightbox = null; }
        this._lightbox = new GalleryLightbox(
            { images, index: startIndex },
            { MF: this.deps.MF }
        );
        this._lightbox.open();
    }

    _onTouchStart(e) { this._touchStartX = e.touches[0].clientX; }
    _onTouchEnd(e) {
        const dx = e.changedTouches[0].clientX - this._touchStartX;
        if (Math.abs(dx) < 40) return;
        if (dx < 0) this.next(); else this.prev();
    }

    destroy() {
        if (this._lightbox)           { this._lightbox.destroy(); this._lightbox = null; }
        if (this._stackObserver)      { this._stackObserver.disconnect(); this._stackObserver = null; }
        if (this._slotResizeObserver) { this._slotResizeObserver.disconnect(); this._slotResizeObserver = null; }
        this._slotResizeCallbacks = [];
        this._markdownBodies.forEach(m => { try { m.destroy?.(); } catch (_) { /* no-op */ } });
        this._markdownBodies = [];
        if (this.element) { this.element.remove(); this.element = null; }
        super.destroy();
    }
}
