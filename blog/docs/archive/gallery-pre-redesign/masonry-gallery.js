/**
 * Masonry Gallery - SiteBoy Framework
 *
 * COMPONENTS OWNED BY THIS FILE:
 * - GalleryLightbox  (full-screen zoom/pan image viewer, keyboard+touch nav)
 * - MasonryGallery   (CSS column masonry with lazy loading, opens GalleryLightbox)
 *
 * @version 3.0.0
 * @dependencies foundation.js (BaseComponent)
 */

import { BaseComponent } from './foundation.js';

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
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'gallery-lightbox' }, deps);
        this.images = options.images || [];   // [{ src, zoom, title, caption }]
        this.index  = options.index  ?? 0;

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
        this._loadingEl = null;
    }

    // ── Build DOM ──────────────────────────────────────────────────────────────

    _buildOverlay() {
        this._overlay = this.createElement('div', 'gallery-lightbox__overlay');

        // Top bar
        const bar = this.createElement('div', 'gallery-lightbox__bar');
        const prev = this._barBtn('<-');
        prev.addEventListener('click', (e) => { e.stopPropagation(); this._navigate(-1); });

        this._counter = this.createElement('div', 'gallery-lightbox__counter');

        const next = this._barBtn('->');
        next.addEventListener('click', (e) => { e.stopPropagation(); this._navigate(1); });

        const closeBtn = this._barBtn('[X]', true);
        closeBtn.addEventListener('click', (e) => { e.stopPropagation(); this.close(); });

        bar.appendChild(prev);
        bar.appendChild(this._counter);
        bar.appendChild(next);
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
        this._loadingEl.textContent = 'loading...';

        this._imgWrap.appendChild(this._imgEl);
        this._imgWrap.appendChild(this._loadingEl);

        this._overlay.appendChild(bar);
        this._overlay.appendChild(this._imgWrap);

        this._addZoomListeners();
    }

    _barBtn(text, rightBorder = false) {
        const btn = this.createElement('button', `gallery-lightbox__btn${rightBorder ? ' gallery-lightbox__btn--sep' : ''}`);
        btn.type = 'button';
        btn.textContent = text;
        return btn;
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
        };
        this._imgEl.onerror = () => {
            if (img.src && this._imgEl.src !== img.src) this._imgEl.src = img.src;
            else this._loadingEl.textContent = 'failed to load';
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
            this._imgWrap.style.cursor = this._zoom > 1 ? 'grab' : 'zoom-in';
        }
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
        if (this._zoom > 1) this._imgWrap.style.cursor = 'grabbing';
    }

    _onMM(e) {
        if (!this._drag) return;
        const dx = e.clientX - this._drag.sx;
        const dy = e.clientY - this._drag.sy;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) this._dragged = true;
        if (this._zoom > 1) {
            this._panX = this._drag.px + dx;
            this._panY = this._drag.py + dy;
            this._applyTransform();
        }
    }

    _onMU() {
        this._drag = null;
        if (this._imgWrap) this._imgWrap.style.cursor = this._zoom > 1 ? 'grab' : 'zoom-in';
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
            if (this._zoom > 1) {
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
        this.observer  = null;
        this.loadBuffer = options.loadBuffer || 200;
        this.lightbox   = null;
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

        item.addEventListener('click', () => this._openLightbox(index));
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
