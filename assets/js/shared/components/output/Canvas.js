/**
 * Canvas - Universal procedural rendering component
 *
 * FEATURE FLAGS:
 * - enableZoom: Mouse wheel / pinch zoom (CSS transform, GPU-accelerated)
 * - enablePan: Drag to pan (CSS transform, GPU-accelerated)
 * - displayMode: 'auto' | 'fit' | 'fill' | 'actual'
 * - interactive: Enable click/drag/wheel event callbacks
 * - enableHUD: Enable HUD overlay system
 *
 * ZOOM/PAN BEHAVIOUR:
 * - Uses CSS transform (NOT context transform)
 * - Pixel buffer unchanged during zoom/pan — GPU compositing only
 * - Pointer events unify mouse, touch, and pen input
 * - Two-finger pinch-to-zoom on touch devices
 * - Smooth easing on keyboard zoom / reset via AnimationLoop
 * - Pan bounds: at least 25% of canvas remains visible at all times
 * - Zoom percentage indicator (auto-fades after 1.5 s)
 *
 * USE FOR:
 * - Animations (60fps redraw via AnimationFoundation)
 * - Generative art
 * - Interactive graphics
 * - Charts / graphs
 *
 * FOR STATIC IMAGES:
 * Use ImageViewport component — same zoom/pan behaviour,
 * but uses setImageData() instead of draw() callback.
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';
import { AnimationLoop } from '../../../core/animation-foundation.js';

/** Zoom/pan and some interaction paths call preventDefault on pointer events. */
const POINTER_NON_PASSIVE = { passive: false };

export class Canvas extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'canvas' }, deps);

        // === CORE ===
        this.contextType = options.context ?? '2d';
        this.width = options.width ?? 400;
        this.height = options.height ?? 400;
        // Full-resolution logical dimensions — preserved so setBufferScale() can restore.
        this._logicalWidth = this.width;
        this._logicalHeight = this.height;
        this.aspectRatio = options.aspectRatio ?? null;
        this.draw = options.draw ?? null;

        // DPR scaling for high-DPI displays
        this.enableDPR = options.enableDPR ?? true;
        this.dpr = this.enableDPR ? (window.devicePixelRatio || 1) : 1;

        // === FEATURE FLAGS ===
        this.interactive = options.interactive ?? false;
        this.enableZoom = options.enableZoom ?? false;
        this.enablePan = options.enablePan ?? false;
        /** Arrow keys pan viewport when hovered (disable when tool owns ←/→). */
        this.enableArrowPan = options.enableArrowPan ?? true;
        this.displayMode = options.displayMode ?? 'auto';
        this.enableHUD = options.enableHUD ?? (options.hud?.length > 0);

        // === ZOOM/PAN CONFIG ===
        this.minZoom = options.minZoom ?? 0.1;
        this.maxZoom = options.maxZoom ?? 10;
        this.zoomSpeed = options.zoomSpeed ?? 0.1;

        // === INTERACTION CALLBACKS ===
        this.onClick = options.onClick ?? null;
        this.onDrag = options.onDrag ?? null;
        this.onWheel = options.onWheel ?? null;

        // === LIFECYCLE CALLBACKS ===
        this.onResize = options.onResize ?? null;
        this.onMount = options.onMount ?? null;
        this.onDestroy = options.onDestroy ?? null;

        // === HUD CONFIG ===
        this.hud = options.hud ?? [];

        // === INTERNAL STATE ===
        this.canvasEl = null;
        this.ctx = null;
        this.viewportEl = null;
        this.hudComponents = [];

        // CSS transform state
        this.transform = {
            x: 0,
            y: 0,
            scale: 1,
            isDragging: false,
            startX: 0,
            startY: 0
        };

        // Custom onClick/onDrag interaction state
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;

        // Pointer tracking (for pinch-to-zoom)
        this._activePointers = new Map();
        this._pinchStartDistance = 0;
        this._pinchStartScale = 1;

        // Short-lived transition animator (keyboard zoom / reset easing)
        this._transitionAnimator = null;

        // Zoom indicator
        this._zoomIndicatorEl = null;
        this._zoomFadeTimer = null;

        // Bound event handlers for cleanup
        this._boundHandlers = {};
    }

    render() {
        if (this.element) return this.element;

        const F = this.deps.MF?.F ?? 14;

        this.element = this.createElement('div', 'canvas-container component');
        this.element.style.cssText = `
            position: relative;
            width: 100%;
            height: 100%;
            background: var(--c-bg);
            box-sizing: border-box;
            overflow: hidden;
        `;

        this.viewportEl = this.createElement('div', 'canvas-viewport');
        this.viewportEl.style.cssText = `
            position: absolute;
            inset: 0;
            overflow: hidden;
        `;

        this.canvasEl = this.createElement('canvas', 'canvas-element');

        // Buffer size = logical size × DPR
        this.canvasEl.width = this.width * this.dpr;
        this.canvasEl.height = this.height * this.dpr;

        // CSS size = logical size (CSS handles the scaling)
        this.canvasEl.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: ${this.width}px;
            height: ${this.height}px;
            transform-origin: 0 0;
        `;

        if (this.contextType === 'webgl') {
            this.ctx = this.canvasEl.getContext('webgl') || this.canvasEl.getContext('experimental-webgl');
        } else {
            this.ctx = this.canvasEl.getContext('2d');
            // Logical drawing space: buffer is physical px, context scaled by DPR
            if (this.dpr !== 1) {
                this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
            }
        }

        this.viewportEl.appendChild(this.canvasEl);
        this.element.appendChild(this.viewportEl);

        if (this.interactive) {
            this._setupInteraction();
        }

        // Handlers always mounted; enablePan / enableZoom gate behaviour (supports runtime toggles).
        this._setupZoomPan();
        if (this.enableZoom) {
            this._setupZoomIndicator();
        }

        if (this.enableHUD && this.hud.length > 0) {
            this._setupHUD(F);
        }

        if (this.draw) {
            this.redraw();
        }

        // Apply display mode once the container has real dimensions.
        // Observe the outer element (the containing block for the absolute viewport)
        // so that any parent height settling triggers a re-apply.
        this._lastViewportWidth = 0;
        this._lastViewportHeight = 0;
        this._viewportResizeObserver = new ResizeObserver(() => {
            const w = this.viewportEl.clientWidth | 0;
            const h = this.viewportEl.clientHeight | 0;
            if (w > 0 && h > 0) {
                if (w !== this._lastViewportWidth || h !== this._lastViewportHeight) {
                    this._lastViewportWidth = w;
                    this._lastViewportHeight = h;
                    this._applyDisplayMode();
                }
            }
        });
        this._viewportResizeObserver.observe(this.element);

        // ResizeObserver does not run on `devicePixelRatio` changes alone; window
        // `resize` does (e.g. moving the tab between displays). Keep backing store in sync.
        this._boundHandlers.windowResizeDpr = () => {
            if (this.isDestroyed || !this.enableDPR || !this.canvasEl) return;
            const nextDpr = window.devicePixelRatio || 1;
            if (nextDpr !== this.dpr && this.width > 0 && this.height > 0) {
                this.resize(this.width, this.height, { resetTransform: false });
            }
        };
        window.addEventListener('resize', this._boundHandlers.windowResizeDpr);

        // Belt-and-suspenders: double-rAF ensures layout has settled even when
        // the ResizeObserver's first callback fires before parent heights resolve.
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (this.viewportEl) this._applyDisplayMode();
            });
        });

        if (this.onMount) {
            this.onMount();
        }

        return this.element;
    }

    // =========================================================================
    // SIZE MANAGEMENT
    // =========================================================================

    _updateContainerSize() {
        if (this.aspectRatio) {
            this.height = Math.round(this.width / this.aspectRatio);
        }
    }

    resize(width, height, options = {}) {
        const oldWidth = this.width;
        const oldHeight = this.height;

        this.width = width;
        this.height = height ?? (this.aspectRatio
            ? Math.round(width / this.aspectRatio)
            : width);

        // Track full-resolution dimensions unless this is a scale-only resize.
        if (!options._scaleOnly) {
            this._logicalWidth = this.width;
            this._logicalHeight = this.height;
        }

        const nextDpr = this.enableDPR ? (window.devicePixelRatio || 1) : 1;
        this.dpr = nextDpr;

        if (this.canvasEl) {
            this.canvasEl.width = this.width * this.dpr;
            this.canvasEl.height = this.height * this.dpr;
            this.canvasEl.style.width = `${this.width}px`;
            this.canvasEl.style.height = `${this.height}px`;

            if (this.contextType === '2d' && this.ctx) {
                this.ctx.setTransform(1, 0, 0, 1, 0, 0);
                if (this.dpr !== 1) {
                    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
                }
            }
        }

        this._updateContainerSize();
        this._applyDisplayMode();

        if (options.resetTransform) {
            this.resetTransform(false);
        }

        if (this.onResize) {
            this.onResize(this.width, this.height, oldWidth, oldHeight);
        }

        this.redraw();
    }

    // =========================================================================
    // DISPLAY MODE
    // =========================================================================

    _applyDisplayMode() {
        if (!this.canvasEl || !this.viewportEl) return;

        const mode = this.displayMode || 'auto';
        const canvasWidth = this.width;
        const canvasHeight = this.height;

        // Integer layout box avoids sub-pixel fit scale blur (getBoundingClientRect is fractional).
        const viewportWidth = Math.max(1, this.viewportEl.clientWidth | 0);
        const viewportHeight = Math.max(1, this.viewportEl.clientHeight | 0);
        // Bail out if viewport has no dimensions yet — ResizeObserver will retry
        if (viewportWidth === 0 || viewportHeight === 0) return;

        let scale = 1;
        let x = 0;
        let y = 0;

        switch (mode) {
            case 'fit': {
                const fitScaleX = viewportWidth / canvasWidth;
                const fitScaleY = viewportHeight / canvasHeight;
                scale = Math.min(fitScaleX, fitScaleY);
                x = (viewportWidth - canvasWidth * scale) / 2;
                y = (viewportHeight - canvasHeight * scale) / 2;
                break;
            }
            case 'fill': {
                const fillScaleX = viewportWidth / canvasWidth;
                const fillScaleY = viewportHeight / canvasHeight;
                scale = Math.max(fillScaleX, fillScaleY);
                x = (viewportWidth - canvasWidth * scale) / 2;
                y = (viewportHeight - canvasHeight * scale) / 2;
                break;
            }
            case 'actual':
            case 'auto':
            default:
                scale = 1;
                x = (viewportWidth - canvasWidth) / 2;
                y = (viewportHeight - canvasHeight) / 2;
                break;
        }

        // Pixel-aligned display: near-unity scale from integer viewport/buffer → force 1, integer translate
        if (Math.abs(scale - 1) <= 0.002) {
            scale = 1;
            x = Math.round(x);
            y = Math.round(y);
        } else {
            x = Math.round(x * 1000) / 1000;
            y = Math.round(y * 1000) / 1000;
            scale = Math.round(scale * 1000) / 1000;
        }

        this.transform.x = x;
        this.transform.y = y;
        this.transform.scale = scale;

        this._applyViewportTransform();
    }

    setDisplayMode(mode) {
        if (!['auto', 'fit', 'fill', 'actual'].includes(mode)) {
            console.warn(`Canvas: Invalid display mode '${mode}', using 'auto'`);
            mode = 'auto';
        }
        this.displayMode = mode;
        this._applyDisplayMode();
    }

    // =========================================================================
    // ZOOM/PAN (CSS TRANSFORM) — pointer events unify mouse, touch, pen
    // =========================================================================

    _setupZoomPan() {
        const target = this.viewportEl || this.canvasEl;

        this._boundHandlers.wheelZoom      = (e) => this._handleWheelZoom(e);
        this._boundHandlers.pointerdown    = (e) => this._handlePointerdown(e);
        this._boundHandlers.pointermove    = (e) => this._handlePointermove(e);
        this._boundHandlers.pointerup      = (e) => this._handlePointerup(e);
        this._boundHandlers.pointercancel  = (e) => this._handlePointerup(e);
        this._boundHandlers.keydown        = (e) => this._handleKeydown(e);

        target.addEventListener('wheel',         this._boundHandlers.wheelZoom, { passive: false });
        target.addEventListener('pointerdown',   this._boundHandlers.pointerdown, POINTER_NON_PASSIVE);
        target.addEventListener('pointermove',   this._boundHandlers.pointermove, POINTER_NON_PASSIVE);
        target.addEventListener('pointerup',     this._boundHandlers.pointerup, POINTER_NON_PASSIVE);
        target.addEventListener('pointercancel', this._boundHandlers.pointercancel, POINTER_NON_PASSIVE);
        document.addEventListener('keydown',     this._boundHandlers.keydown);

        // Suppress context menu so right-drag doesn't trigger it
        target.addEventListener('contextmenu', (e) => e.preventDefault());

        if (this.enablePan) {
            target.style.cursor = 'grab';
        }
    }

    _handleWheelZoom(e) {
        if (!this.enableZoom) return;
        e.preventDefault();

        // Use viewport rect — stable, not shifted by the CSS transform
        const vp = this.viewportEl.getBoundingClientRect();
        const mouseX = e.clientX - vp.left;
        const mouseY = e.clientY - vp.top;

        // Normalise delta magnitude across devices:
        //   deltaMode 0 = pixels (trackpad), 1 = lines, 2 = pages
        const rawDelta = -e.deltaY;
        const normDelta = e.deltaMode === 1 ? rawDelta * 16 :
                          e.deltaMode === 2 ? rawDelta * 400 : rawDelta;

        // Exponential scaling: 1.002^pixel → ~22% per typical scroll notch (120px)
        // Clamped per-event to prevent single-event jumps
        const factor = Math.max(0.5, Math.min(2.0, Math.pow(1.002, normDelta)));

        this._zoomToPoint(mouseX, mouseY, factor);
    }

    _handlePointerdown(e) {
        if (e.button === 2) return; // Ignore right-click

        this._activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (this._activePointers.size === 1 && this.enablePan) {
            e.preventDefault();
            const target = this.viewportEl || this.canvasEl;
            // Capture pointer so move/up fire here even when outside the element
            target.setPointerCapture(e.pointerId);
            this.transform.isDragging = true;
            this.transform.startX = e.clientX - this.transform.x;
            this.transform.startY = e.clientY - this.transform.y;
            // Cancel any running easing transition when the user grabs
            this._cancelTransition();
            target.style.cursor = 'grabbing';

        } else if (this._activePointers.size === 2 && this.enableZoom) {
            // Second finger: begin pinch tracking
            const pts = [...this._activePointers.values()];
            this._pinchStartDistance = this._pointerDistance(pts[0], pts[1]);
            this._pinchStartScale = this.transform.scale;
            this._cancelTransition();
        }
    }

    _handlePointermove(e) {
        if (!this._activePointers.has(e.pointerId)) return;

        this._activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (this._activePointers.size >= 2 && this.enableZoom) {
            // Pinch zoom — zoom toward the midpoint between the two fingers
            const pts = [...this._activePointers.values()];
            const currentDist = this._pointerDistance(pts[0], pts[1]);
            if (this._pinchStartDistance < 1) return;

            const factor = currentDist / this._pinchStartDistance;
            const newScale = Math.max(this.minZoom, Math.min(this.maxZoom, this._pinchStartScale * factor));

            const mid = this._pointerMidpoint(pts[0], pts[1]);
            const vp = this.viewportEl.getBoundingClientRect();
            const midX = mid.x - vp.left;
            const midY = mid.y - vp.top;

            const oldScale = this.transform.scale;
            this.transform.x = midX - (midX - this.transform.x) * (newScale / oldScale);
            this.transform.y = midY - (midY - this.transform.y) * (newScale / oldScale);
            this.transform.scale = newScale;

            this._clampPanBounds();
            this._applyViewportTransform();
            this._showZoomIndicator();

        } else if (this._activePointers.size === 1 && this.transform.isDragging) {
            // Single-pointer pan
            this.transform.x = e.clientX - this.transform.startX;
            this.transform.y = e.clientY - this.transform.startY;
            this._clampPanBounds();
            this._applyViewportTransform();
        }
    }

    _handlePointerup(e) {
        this._activePointers.delete(e.pointerId);
        const target = this.viewportEl || this.canvasEl;

        if (this._activePointers.size === 1 && this.transform.isDragging) {
            // One finger lifted from a pinch — resume single-finger pan seamlessly
            const [remaining] = this._activePointers.values();
            this.transform.startX = remaining.x - this.transform.x;
            this.transform.startY = remaining.y - this.transform.y;
        } else if (this._activePointers.size === 0) {
            this.transform.isDragging = false;
            target.style.cursor = this.enablePan ? 'grab' : 'default';
        }
    }

    _pointerDistance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    _pointerMidpoint(a, b) {
        return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    }

    _handleKeydown(e) {
        const target = this.viewportEl || this.canvasEl;
        if (!target.matches(':hover')) return;

        switch (e.key) {
            case '+':
            case '=':
                e.preventDefault();
                this.zoom(1 + this.zoomSpeed);
                break;
            case '-':
            case '_':
                e.preventDefault();
                this.zoom(1 - this.zoomSpeed);
                break;
            case '0':
                e.preventDefault();
                this.resetViewport();
                break;
            case 'ArrowLeft':
            case 'ArrowRight':
            case 'ArrowUp':
            case 'ArrowDown':
                if (!this.enableArrowPan) return;
                e.preventDefault();
                if (e.key === 'ArrowLeft') this.pan(50, 0);
                else if (e.key === 'ArrowRight') this.pan(-50, 0);
                else if (e.key === 'ArrowUp') this.pan(0, 50);
                else this.pan(0, -50);
                break;
            default:
                return;
        }

        e.stopPropagation();
    }

    _zoomToPoint(x, y, factor) {
        const oldScale = this.transform.scale;
        const newScale = Math.max(this.minZoom, Math.min(this.maxZoom, oldScale * factor));
        if (newScale === oldScale) return;

        // Adjust pan so the point under the pointer stays fixed
        this.transform.x = x - (x - this.transform.x) * (newScale / oldScale);
        this.transform.y = y - (y - this.transform.y) * (newScale / oldScale);
        this.transform.scale = newScale;

        this._clampPanBounds();
        this._applyViewportTransform();
        this._showZoomIndicator();
    }

    _clampPanBounds() {
        if (!this.viewportEl) return;
        const vp = this.viewportEl.getBoundingClientRect();
        if (!vp.width && !vp.height) return;

        const cw = this.width * this.transform.scale;
        const ch = this.height * this.transform.scale;
        const margin = 0.25;

        // At least 25% of the canvas must remain visible in each axis
        this.transform.x = Math.max(
            -(cw * (1 - margin)),
            Math.min(vp.width * (1 - margin), this.transform.x)
        );
        this.transform.y = Math.max(
            -(ch * (1 - margin)),
            Math.min(vp.height * (1 - margin), this.transform.y)
        );
    }

    _applyViewportTransform() {
        if (!this.canvasEl) return;
        const { x, y, scale } = this.transform;
        this.canvasEl.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;

        if (this._zoomIndicatorEl) {
            this._zoomIndicatorEl.textContent = `${Math.round(scale * 100)}%`;
        }
    }

    // =========================================================================
    // ZOOM INDICATOR
    // =========================================================================

    _setupZoomIndicator() {
        const el = this.createElement('div', 'canvas-zoom-indicator');
        el.style.cssText = `
            position: absolute;
            bottom: 6px;
            right: 8px;
            font-family: 'Space Mono', monospace;
            font-size: 10px;
            color: var(--c-text);
            background: var(--c-bg);
            border: 1px solid var(--c-border);
            padding: 1px 5px;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s ease;
            z-index: 5;
            user-select: none;
        `;
        this.viewportEl.appendChild(el);
        this._zoomIndicatorEl = el;
    }

    _showZoomIndicator() {
        if (!this._zoomIndicatorEl) return;
        this._zoomIndicatorEl.style.opacity = '1';
        clearTimeout(this._zoomFadeTimer);
        this._zoomFadeTimer = setTimeout(() => {
            if (this._zoomIndicatorEl) this._zoomIndicatorEl.style.opacity = '0';
        }, 1500);
    }

    // =========================================================================
    // TRANSITION ANIMATION (short-lived easing for keyboard / reset actions)
    // =========================================================================

    _animateTransformTo(targetX, targetY, targetScale, duration = 150, onComplete = null) {
        this._cancelTransition();

        const startX = this.transform.x;
        const startY = this.transform.y;
        const startScale = this.transform.scale;
        const startTime = performance.now();

        this._transitionAnimator = new AnimationLoop({
            onFrame: () => {
                const elapsed = performance.now() - startTime;
                const t = Math.min(1, elapsed / duration);
                const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic

                this.transform.x = startX + (targetX - startX) * ease;
                this.transform.y = startY + (targetY - startY) * ease;
                this.transform.scale = startScale + (targetScale - startScale) * ease;
                this._applyViewportTransform();

                if (t >= 1) {
                    this._transitionAnimator?.stop();
                    this._transitionAnimator = null;
                    if (onComplete) onComplete();
                }
            }
        });
        this._transitionAnimator.start();
    }

    _cancelTransition() {
        if (this._transitionAnimator) {
            this._transitionAnimator.destroy();
            this._transitionAnimator = null;
        }
    }

    // =========================================================================
    // PUBLIC TRANSFORM API
    // =========================================================================

    /**
     * Reset to raw origin (0, 0, scale=1) — use resetViewport() to respect display mode
     */
    resetTransform(shouldRedraw = true) {
        this._cancelTransition();
        this.transform.x = 0;
        this.transform.y = 0;
        this.transform.scale = 1;
        this._applyViewportTransform();
        if (shouldRedraw) this.redraw();
    }

    /**
     * Animate back to the display-mode default (fit/fill/actual centred position)
     */
    resetViewport(shouldRedraw = true) {
        const mode = this.displayMode || 'auto';
        const vp = this.viewportEl?.getBoundingClientRect();

        if (!vp?.width) {
            this._applyDisplayMode();
            if (shouldRedraw) this.redraw();
            return;
        }

        let targetScale = 1;
        let targetX = (vp.width - this.width) / 2;
        let targetY = (vp.height - this.height) / 2;

        if (mode === 'fit') {
            targetScale = Math.min(vp.width / this.width, vp.height / this.height);
            targetX = (vp.width - this.width * targetScale) / 2;
            targetY = (vp.height - this.height * targetScale) / 2;
        } else if (mode === 'fill') {
            targetScale = Math.max(vp.width / this.width, vp.height / this.height);
            targetX = (vp.width - this.width * targetScale) / 2;
            targetY = (vp.height - this.height * targetScale) / 2;
        }

        this._animateTransformTo(targetX, targetY, targetScale, 200, () => {
            if (shouldRedraw) this.redraw();
        });
        this._showZoomIndicator();
    }

    /**
     * Zoom by factor, animated, toward the viewport visual centre
     */
    zoom(factor) {
        const vp = this.viewportEl?.getBoundingClientRect();
        const centerX = vp ? vp.width / 2 : this.width / 2;
        const centerY = vp ? vp.height / 2 : this.height / 2;

        const oldScale = this.transform.scale;
        const newScale = Math.max(this.minZoom, Math.min(this.maxZoom, oldScale * factor));
        if (newScale === oldScale) return;

        const targetX = centerX - (centerX - this.transform.x) * (newScale / oldScale);
        const targetY = centerY - (centerY - this.transform.y) * (newScale / oldScale);

        this._animateTransformTo(targetX, targetY, newScale, 120);
        this._showZoomIndicator();
    }

    /**
     * Pan by pixel offset (viewport space)
     */
    pan(dx, dy) {
        this._cancelTransition();
        this.transform.x += dx;
        this.transform.y += dy;
        this._clampPanBounds();
        this._applyViewportTransform();
    }

    /**
     * Enable or disable drag-to-pan on the viewport (e.g. glyph capture tools default off).
     * @param {boolean} enabled
     */
    setPanEnabled(enabled) {
        this.enablePan = !!enabled;
        const target = this.viewportEl || this.canvasEl;
        if (!target) return;
        if (!this.enablePan && this.transform.isDragging) {
            this.transform.isDragging = false;
            this._activePointers.clear();
        }
        target.style.cursor = this.enablePan ? 'grab' : 'default';
    }

    /**
     * Enable or disable wheel / keyboard zoom affordances.
     * @param {boolean} enabled
     */
    setZoomEnabled(enabled) {
        this.enableZoom = !!enabled;
        if (this.enableZoom && this.viewportEl && !this._zoomIndicatorEl) {
            this._setupZoomIndicator();
        }
    }

    setTransform(x, y, scale) {
        this._cancelTransition();
        this.transform.x = x;
        this.transform.y = y;
        this.transform.scale = Math.max(this.minZoom, Math.min(this.maxZoom, scale));
        this._applyViewportTransform();
    }

    getTransform() {
        return {
            x: this.transform.x,
            y: this.transform.y,
            scale: this.transform.scale
        };
    }

    /**
     * Convert screen coordinates (clientX/Y) to canvas logical coordinates.
     * Reverses the viewport CSS transform (pan + zoom).
     */
    screenToCanvas(clientX, clientY) {
        const vp = this.viewportEl.getBoundingClientRect();
        return {
            x: (clientX - vp.left - this.transform.x) / this.transform.scale,
            y: (clientY - vp.top  - this.transform.y) / this.transform.scale
        };
    }

    // =========================================================================
    // INTERACTION (custom onClick / onDrag callbacks)
    // =========================================================================

    _setupInteraction() {
        this._boundHandlers.click                   = (e) => this._handleClick(e);
        this._boundHandlers.interactionPointerdown  = (e) => this._handleInteractionPointerdown(e);
        this._boundHandlers.interactionPointermove  = (e) => this._handleInteractionPointermove(e);
        this._boundHandlers.interactionPointerup    = (e) => this._handleInteractionPointerup(e);
        this._boundHandlers.wheel                   = (e) => this._handleWheel(e);

        this.canvasEl.addEventListener('click',         this._boundHandlers.click);
        this.canvasEl.addEventListener('pointerdown',   this._boundHandlers.interactionPointerdown, POINTER_NON_PASSIVE);
        this.canvasEl.addEventListener('pointermove',   this._boundHandlers.interactionPointermove, POINTER_NON_PASSIVE);
        this.canvasEl.addEventListener('pointerup',     this._boundHandlers.interactionPointerup, POINTER_NON_PASSIVE);
        this.canvasEl.addEventListener('pointercancel', this._boundHandlers.interactionPointerup, POINTER_NON_PASSIVE);

        if (this.onWheel) {
            this.canvasEl.addEventListener('wheel', this._boundHandlers.wheel, { passive: false });
        }

        this.canvasEl.style.cursor = this.onDrag ? 'grab' : 'default';
    }

    _handleClick(e) {
        if (this.onClick && !this.isDragging) {
            const coords = this.screenToCanvas(e.clientX, e.clientY);
            this.onClick(coords.x, coords.y, e);
        }
    }

    _handleInteractionPointerdown(e) {
        if (e.button !== 0) return;
        if (this.onDrag) {
            // Stop propagation so the viewport pan handler does not also fire
            e.stopPropagation();
            this.isDragging = true;
            this.canvasEl.setPointerCapture(e.pointerId);
            const coords = this.screenToCanvas(e.clientX, e.clientY);
            this.lastX = coords.x;
            this.lastY = coords.y;
            this.canvasEl.style.cursor = 'grabbing';
        }
    }

    _handleInteractionPointermove(e) {
        if (this.isDragging && this.onDrag) {
            const coords = this.screenToCanvas(e.clientX, e.clientY);
            const dx = coords.x - this.lastX;
            const dy = coords.y - this.lastY;
            this.onDrag(coords.x, coords.y, dx, dy, e);
            this.lastX = coords.x;
            this.lastY = coords.y;
        }
    }

    _handleInteractionPointerup() {
        if (this.isDragging) {
            this.isDragging = false;
            this.canvasEl.style.cursor = this.onDrag ? 'grab' : 'default';
        }
    }

    _handleWheel(e) {
        if (this.onWheel) {
            e.preventDefault();
            this.onWheel(e.deltaY, e);
        }
    }

    // Kept for backwards-compat with internal callers
    _screenToCanvas(screenX, screenY) {
        return this.screenToCanvas(screenX, screenY);
    }

    // =========================================================================
    // HUD
    // =========================================================================

    _setupHUD(F) {
        const hudContainer = this.createElement('div', 'canvas-hud');
        hudContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            padding: ${F * 0.5}px;
            z-index: 10;
        `;

        import('./Text.js').then(({ Text }) => {
            this.hud.forEach(config => {
                const text = new Text({
                    variant: 'value',
                    ...config
                }, this.deps);

                const el = text.render();
                el.style.position = 'absolute';

                const anchor = config.anchor ?? 'top-left';
                if (anchor.includes('top'))    el.style.top    = `${F * 0.5}px`;
                if (anchor.includes('bottom')) el.style.bottom = `${F * 0.5}px`;
                if (anchor.includes('left'))   el.style.left   = `${F * 0.5}px`;
                if (anchor.includes('right'))  el.style.right  = `${F * 0.5}px`;

                el.style.background = 'var(--c-bg)';
                el.style.padding = `${F * 0.25}px ${F * 0.5}px`;

                hudContainer.appendChild(el);
                this.hudComponents.push(text);
            });
        });

        this.element.appendChild(hudContainer);
    }

    updateHUD(index, value) {
        if (this.hudComponents[index]) {
            this.hudComponents[index].setValue(value);
        }
    }

    // =========================================================================
    // DRAWING
    // =========================================================================

    redraw() {
        if (this.draw && this.ctx) {
            this.clear();
            this.draw(this.ctx, this.width, this.height);
        }
    }

    clear() {
        if (!this.ctx) return;

        if (this.contextType === '2d') {
            this.ctx.save();
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
            this.ctx.restore();
        } else {
            this.ctx.clear(this.ctx.COLOR_BUFFER_BIT);
        }
    }

    // =========================================================================
    // PUBLIC API
    // =========================================================================

    getContext() {
        return this.ctx;
    }

    getCanvas() {
        return this.canvasEl;
    }

    getImageData() {
        if (this.contextType === '2d') {
            return this.ctx.getImageData(0, 0, this.canvasEl.width, this.canvasEl.height);
        }
        return null;
    }

    setImageData(imageData, x = 0, y = 0) {
        if (this.contextType === '2d' && this.ctx && imageData) {
            this.ctx.putImageData(imageData, x, y);
        }
    }

    toDataURL(type = 'image/png', quality = 1) {
        return this.canvasEl?.toDataURL(type, quality) ?? '';
    }

    toBlob(type = 'image/png', quality = 1) {
        return new Promise((resolve) => {
            if (!this.canvasEl) { resolve(null); return; }
            this.canvasEl.toBlob(resolve, type, quality);
        });
    }

    download(filename = 'canvas.png') {
        const url = this.toDataURL();
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.click();
    }

    /**
     * Tier 2 adaptive resolution — temporarily resize the pixel buffer without
     * changing the CSS display size. The canvas visually stretches to fill the
     * same viewport, giving a cheap low-res preview during interaction.
     *
     * scale=1   → full resolution (restores _logicalWidth × _logicalHeight)
     * scale=0.5 → half resolution (quarter pixel count)
     *
     * Called by ComputeScheduler; do not call directly from tools.
     * onResize is intentionally NOT fired (display size is unchanged).
     */
    setBufferScale(scale) {
        const w = Math.max(1, Math.round(this._logicalWidth * scale));
        const h = Math.max(1, Math.round(this._logicalHeight * scale));
        if (w === this.width && h === this.height) return;
        // _scaleOnly prevents _logicalWidth/_logicalHeight being overwritten.
        this.resize(w, h, { resetTransform: false, _scaleOnly: scale !== 1 });
    }

    // =========================================================================
    // LIFECYCLE
    // =========================================================================

    destroy() {
        if (this.onDestroy) {
            this.onDestroy();
        }

        // Cancel in-progress transition
        this._cancelTransition();

        // Disconnect viewport resize observer
        if (this._viewportResizeObserver) {
            this._viewportResizeObserver.disconnect();
            this._viewportResizeObserver = null;
        }

        // Clear zoom indicator timer
        if (this._zoomFadeTimer) {
            clearTimeout(this._zoomFadeTimer);
            this._zoomFadeTimer = null;
        }

        // Remove the only document-level listener
        if (this._boundHandlers.keydown) {
            document.removeEventListener('keydown', this._boundHandlers.keydown);
        }
        if (this._boundHandlers.windowResizeDpr) {
            window.removeEventListener('resize', this._boundHandlers.windowResizeDpr);
            delete this._boundHandlers.windowResizeDpr;
        }

        this._boundHandlers = {};

        this.hudComponents.forEach(c => c.destroy());
        this.hudComponents = [];

        super.destroy();
    }
}
