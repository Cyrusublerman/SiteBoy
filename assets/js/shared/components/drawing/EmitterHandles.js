/**
 * EmitterHandles — transparent canvas overlay with draggable point handles.
 *
 * Mounted above the generator canvas (position: absolute, pointer-events: all).
 * Renders N circular handles at param-driven positions. Pointer drag updates
 * positions and fires onChange() per handle, enabling generators to use the
 * overlay for repositioning emitters, wave sources, or any spatial param.
 *
 * Coordinate system: normalised [0,1]×[0,1] relative to canvas W×H.
 * Readout: both normalised and polar (r, θ°) relative to canvas centre.
 *
 * Usage:
 *   const handles = new EmitterHandles({
 *       handles: [
 *           { id: 'src1', x: 0.3, y: 0.5, label: 'Source 1', colour: '#ff0000' },
 *           { id: 'src2', x: 0.7, y: 0.5, label: 'Source 2', colour: '#0000ff' },
 *       ],
 *       onChange: (id, x, y) => { params[id + 'X'] = x; params[id + 'Y'] = y; },
 *   }, deps);
 *   canvasContainer.appendChild(handles.render());
 *   // In cleanup:
 *   handles.destroy();
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

const HANDLE_R    = 8;
const LABEL_OFFSET = 14;

export class EmitterHandles extends BaseComponent {
    /**
     * @param {Object} options
     * @param {Array<{id:string, x:number, y:number, label?:string, colour?:string}>} options.handles
     *   Initial handle descriptors. x,y are normalised [0,1].
     * @param {Function} options.onChange  - (id: string, x: number, y: number) => void
     * @param {boolean}  [options.showLabels=true]
     * @param {boolean}  [options.showReadout=true]  - Show polar+cartesian coords on hover
     */
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'emitter-handles' }, deps);

        this._handles    = (options.handles ?? []).map(h => ({ ...h }));
        this.onChange    = options.onChange    ?? (() => {});
        this._showLabels  = options.showLabels  ?? true;
        this._showReadout = options.showReadout ?? true;

        this._canvas     = null;
        this._ctx        = null;
        this._dragging   = null;  // handle id or null
        this._hovering   = null;  // handle id or null

        this._onPointerDown  = this._onPointerDown.bind(this);
        this._onPointerMove  = this._onPointerMove.bind(this);
        this._onPointerUp    = this._onPointerUp.bind(this);
        this._onPointerLeave = this._onPointerLeave.bind(this);
    }

    render() {
        if (this.element) return this.element;

        this.element = this.createElement('div', 'emitter-handles component');
        this.element.style.cssText = `
            position: absolute;
            inset: 0;
            pointer-events: none;
            overflow: hidden;
        `;

        this._canvas = this.createElement('canvas', 'emitter-handles__canvas');
        this._canvas.style.cssText = `
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            pointer-events: all;
            cursor: default;
        `;
        this._ctx = this._canvas.getContext('2d');

        this._canvas.addEventListener('pointerdown',  this._onPointerDown);
        this._canvas.addEventListener('pointermove',  this._onPointerMove);
        this._canvas.addEventListener('pointerup',    this._onPointerUp);
        this._canvas.addEventListener('pointerleave', this._onPointerLeave);

        this.element.appendChild(this._canvas);

        // Size the canvas when element is mounted
        this._scheduleResize();
        return this.element;
    }

    _scheduleResize() {
        // Use ResizeObserver to keep overlay canvas pixel-size in sync
        if (typeof ResizeObserver !== 'undefined') {
            this._ro = new ResizeObserver(() => this._resize());
            this._ro.observe(this.element);
        }
        // Fallback immediate
        requestAnimationFrame(() => this._resize());
    }

    _resize() {
        if (!this._canvas || !this.element) return;
        const r = this.element.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;
        if (this._canvas.width !== r.width || this._canvas.height !== r.height) {
            this._canvas.width  = r.width;
            this._canvas.height = r.height;
        }
        this._draw();
    }

    _draw() {
        const ctx = this._ctx;
        const W   = this._canvas.width;
        const H   = this._canvas.height;
        if (!ctx || W === 0 || H === 0) return;

        ctx.clearRect(0, 0, W, H);

        for (const h of this._handles) {
            const px = h.x * W;
            const py = h.y * H;
            const isHovered  = this._hovering === h.id;
            const isDragging = this._dragging === h.id;

            // Outer ring
            ctx.strokeStyle = h.colour ?? '#ffffff';
            ctx.lineWidth   = isDragging ? 2 : 1;
            ctx.globalAlpha = isDragging ? 1 : (isHovered ? 0.9 : 0.6);
            ctx.beginPath();
            ctx.arc(px, py, HANDLE_R, 0, Math.PI * 2);
            ctx.stroke();

            // Fill dot
            ctx.fillStyle   = h.colour ?? '#ffffff';
            ctx.globalAlpha = isDragging ? 0.9 : 0.4;
            ctx.beginPath();
            ctx.arc(px, py, HANDLE_R / 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = 1;

            // Label
            if (this._showLabels && h.label) {
                ctx.font      = '11px monospace';
                ctx.fillStyle = h.colour ?? '#ffffff';
                ctx.fillText(h.label, px + LABEL_OFFSET, py - LABEL_OFFSET);
            }

            // Readout (polar + norm) on hover/drag
            if (this._showReadout && (isHovered || isDragging)) {
                const dx   = h.x - 0.5;
                const dy   = -(h.y - 0.5);
                const r    = Math.sqrt(dx * dx + dy * dy);
                const theta = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
                const label = `(${h.x.toFixed(2)}, ${h.y.toFixed(2)})  r=${r.toFixed(2)} θ=${theta.toFixed(1)}°`;
                ctx.font      = '10px monospace';
                ctx.fillStyle = '#ffffff';
                ctx.globalAlpha = 0.7;
                ctx.fillText(label, 4, H - 6);
                ctx.globalAlpha = 1;
            }
        }
    }

    _getHandleAt(px, py) {
        const W = this._canvas.width;
        const H = this._canvas.height;
        for (const h of this._handles) {
            const hx = h.x * W;
            const hy = h.y * H;
            if (Math.hypot(px - hx, py - hy) <= HANDLE_R + 4) return h;
        }
        return null;
    }

    _clientToCanvas(e) {
        const rect = this._canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    _onPointerDown(e) {
        const { x, y } = this._clientToCanvas(e);
        const h = this._getHandleAt(x, y);
        if (!h) return;
        this._dragging = h.id;
        this._canvas.setPointerCapture(e.pointerId);
        this._canvas.style.cursor = 'grabbing';
        e.stopPropagation();
    }

    _onPointerMove(e) {
        const { x, y } = this._clientToCanvas(e);
        const W = this._canvas.width;
        const H = this._canvas.height;

        if (this._dragging) {
            const h = this._handles.find(h => h.id === this._dragging);
            if (h) {
                h.x = Math.max(0, Math.min(1, x / W));
                h.y = Math.max(0, Math.min(1, y / H));
                this.onChange(h.id, h.x, h.y);
                this._draw();
            }
        } else {
            const hover = this._getHandleAt(x, y);
            const prevHover = this._hovering;
            this._hovering = hover?.id ?? null;
            this._canvas.style.cursor = this._hovering ? 'grab' : 'default';
            if (this._hovering !== prevHover) this._draw();
        }
    }

    _onPointerUp() {
        this._dragging = null;
        this._canvas.style.cursor = this._hovering ? 'grab' : 'default';
    }

    _onPointerLeave() {
        if (!this._dragging) {
            this._hovering = null;
            this._draw();
        }
    }

    /**
     * Update handle positions from external param change (e.g. preset load).
     * @param {string} id
     * @param {number} x  - Normalised [0,1]
     * @param {number} y  - Normalised [0,1]
     */
    setHandle(id, x, y) {
        const h = this._handles.find(h => h.id === id);
        if (h) { h.x = x; h.y = y; this._draw(); }
    }

    /**
     * Replace the full handle list (e.g. after script change).
     * @param {Array<{id,x,y,label?,colour?}>} handles
     */
    setHandles(handles) {
        this._handles = handles.map(h => ({ ...h }));
        this._draw();
    }

    /**
     * @returns {Array<{id, x, y}>} Current normalised positions.
     */
    getHandles() {
        return this._handles.map(({ id, x, y }) => ({ id, x, y }));
    }

    destroy() {
        if (this._ro) { this._ro.disconnect(); this._ro = null; }
        if (this._canvas) {
            this._canvas.removeEventListener('pointerdown',  this._onPointerDown);
            this._canvas.removeEventListener('pointermove',  this._onPointerMove);
            this._canvas.removeEventListener('pointerup',    this._onPointerUp);
            this._canvas.removeEventListener('pointerleave', this._onPointerLeave);
        }
        super.destroy();
    }
}
