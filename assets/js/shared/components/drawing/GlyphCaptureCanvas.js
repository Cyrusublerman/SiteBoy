/**
 * GlyphCaptureCanvas — stroke-capture controller for a ToolBase canvas element.
 *
 * Attaches to an existing canvas element provided by ToolBase's standard Canvas
 * component. All DOM creation and sizing is owned by ToolBase. This class is
 * logic-only: it manages stroke state and renders into the context that ToolBase
 * provides via its onDraw callback.
 *
 * Usage:
 *   const ctrl = new GlyphCaptureCanvas({ width, height, F, overlays, ... }, deps);
 *   ctrl.attach(toolBase.canvas);
 *   toolBase.onDraw = (ctx) => ctrl.draw(ctx);
 *
 * Public API:
 *   attach(canvasEl)         — wire pointer events to a canvas element
 *   detach()                 — remove pointer events
 *   draw(ctx)                — render reference + overlays + ink (called by onDraw)
 *   setPrompt(prompt)        — update displayed glyph prompt
 *   setFontPath(pathD)       — set precomputed SVG path string for reference glyph
 *   setFontMetrics(metrics)  — update typography metrics for overlay positions
 *   setOverlayToggles(obj)   — toggle visibility of individual guide lines
 *   undo()                   — remove last committed stroke
 *   redo()                   — restore last undone stroke
 *   clearInk()               — discard all committed strokes
 *   getStrokes()             → committed stroke objects[]
 *
 * @emits onStrokeEnd(stroke)    after each pointer-up that produced ≥2 points
 * @emits onDirtyChange(bool)    when ink gains or loses strokes
 * @emits onRedraw()             when a canvas redraw is needed (caller triggers tool.draw())
 *
 * @extends BaseComponent
 */
import { BaseComponent } from '../../foundation.js';
import { smoothStroke } from '../../algorithms/typography/stroke-capture.js';
import { fitCubicsToPolyline, extractAnchors } from '../../algorithms/typography/bezier-fit.js';

let _strokeSeq = 0;
const _makeStrokeId = () => `stroke_${String(++_strokeSeq).padStart(6, '0')}`;

export class GlyphCaptureCanvas extends BaseComponent {
    /**
     * @param {{
     *   width         : number,
     *   height        : number,
     *   F             : number,
     *   overlays      : { baseline:boolean, xHeight:boolean, capHeight:boolean, descender:boolean, ascender:boolean },
     *   fontMetrics   : { unitsPerEm, ascender, xHeight, capHeight, baseline, descender } | null,
     *   prompt        : { text:string, glyphPathD:string } | null,
     *   onStrokeEnd   : (stroke)=>void,
     *   onDirtyChange : (dirty:boolean)=>void,
     *   onRedraw      : ()=>void,
     * }} options
     */
    constructor(options = {}, deps = {}) {
        super({ componentType: 'glyph-capture-canvas', ...options }, deps);

        this._w = options.width  || 560;
        this._h = options.height || 392;
        this._F = options.F     || 14;

        this._overlays    = { baseline: true, xHeight: true, capHeight: true, descender: true, ascender: false, refGlyph: true, ...(options.overlays || {}) };
        this._fontMetrics = options.fontMetrics || null;
        this._prompt      = options.prompt     || null;
        this._customPathD = null;

        this._onStrokeEnd   = options.onStrokeEnd   || null;
        this._onDirtyChange = options.onDirtyChange || null;
        this._onRedraw      = options.onRedraw      || null;

        // Stroke state
        this._currentPoints    = [];
        this._drawing          = false;
        this._committedStrokes = [];
        this._redoStack        = [];

        // Attached canvas element
        this._canvasEl = null;

        // Bound event handlers
        this._onPointerDown  = this._onPointerDown.bind(this);
        this._onPointerMove  = this._onPointerMove.bind(this);
        this._onPointerUp    = this._onPointerUp.bind(this);
        this._onPointerLeave = this._onPointerLeave.bind(this);
        this._noContext      = e => e.preventDefault();
    }

    // ─── Attachment ───────────────────────────────────────────────────────────

    /** Attach to a canvas element owned by ToolBase. */
    attach(canvasEl) {
        this.detach();
        this._canvasEl = canvasEl;
        canvasEl.addEventListener('pointerdown',  this._onPointerDown);
        canvasEl.addEventListener('pointermove',  this._onPointerMove);
        canvasEl.addEventListener('pointerup',    this._onPointerUp);
        canvasEl.addEventListener('pointerleave', this._onPointerLeave);
        canvasEl.addEventListener('contextmenu',  this._noContext);
        canvasEl.style.cursor = 'crosshair';
    }

    /** Remove pointer events from the attached canvas element. */
    detach() {
        if (!this._canvasEl) return;
        this._canvasEl.removeEventListener('pointerdown',  this._onPointerDown);
        this._canvasEl.removeEventListener('pointermove',  this._onPointerMove);
        this._canvasEl.removeEventListener('pointerup',    this._onPointerUp);
        this._canvasEl.removeEventListener('pointerleave', this._onPointerLeave);
        this._canvasEl.removeEventListener('contextmenu',  this._noContext);
        this._canvasEl = null;
    }

    // ─── Public API ───────────────────────────────────────────────────────────

    /** Update the displayed glyph prompt and trigger a redraw. */
    setPrompt(prompt) {
        this._prompt      = prompt;
        this._customPathD = null;
        this._requestRedraw();
    }

    /**
     * Set a precomputed SVG path string for the reference glyph.
     * Called by the tool shell after computing the path via opentype-adapter.
     */
    setFontPath(svgPathD) {
        this._customPathD = svgPathD;
        this._requestRedraw();
    }

    /** Toggle overlay guide line visibility. */
    setOverlayToggles(toggles) {
        this._overlays = { ...this._overlays, ...toggles };
        this._requestRedraw();
    }

    /** Update font metrics (affects overlay positions). */
    setFontMetrics(metrics) {
        this._fontMetrics = metrics;
        this._requestRedraw();
    }

    /** Undo last committed stroke. */
    undo() {
        if (this._committedStrokes.length === 0) return;
        this._redoStack.push(this._committedStrokes.pop());
        this._emitDirty();
        this._requestRedraw();
    }

    /** Redo last undone stroke. */
    redo() {
        if (this._redoStack.length === 0) return;
        this._committedStrokes.push(this._redoStack.pop());
        this._emitDirty();
        this._requestRedraw();
    }

    /** Clear all committed strokes. */
    clearInk() {
        this._committedStrokes = [];
        this._redoStack        = [];
        this._emitDirty();
        this._requestRedraw();
    }

    /**
     * Return all committed strokes (pre-normalisation canvas-pixel space).
     * @returns {object[]}
     */
    getStrokes() {
        return this._committedStrokes.map(s => ({ ...s }));
    }

    // ─── Main draw — called by ToolBase onDraw ────────────────────────────────

    /**
     * Render all layers onto the provided context.
     * Called by the ToolBase onDraw callback after canvas.clear().
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        this._drawRef(ctx);
        this._drawOverlays(ctx);
        this._drawInk(ctx);
        if (this._drawing && this._currentPoints.length >= 2) {
            this._drawLiveStroke(ctx);
        }
    }

    // ─── Pointer events ───────────────────────────────────────────────────────

    _onPointerDown(e) {
        e.preventDefault();
        this._canvasEl.setPointerCapture(e.pointerId);
        this._drawing       = true;
        this._currentPoints = [this._rawPoint(e)];
        this._redoStack     = [];
    }

    _onPointerMove(e) {
        if (!this._drawing) return;
        e.preventDefault();
        this._currentPoints.push(this._rawPoint(e));
        this._requestRedraw();
    }

    _onPointerUp(e) {
        if (!this._drawing) return;
        e.preventDefault();
        this._drawing = false;

        const pts = this._currentPoints;
        this._currentPoints = [];

        if (pts.length < 2) { this._requestRedraw(); return; }

        const id      = _makeStrokeId();
        const smoothed = smoothStroke(pts, 2);
        const beziers  = fitCubicsToPolyline(smoothed);
        const anchors  = extractAnchors(beziers, id);
        const order    = this._committedStrokes.length;
        const stroke   = { id, order, rawPoints: pts, smoothed, beziers, anchors };

        this._committedStrokes.push(stroke);
        this._emitDirty();
        this._requestRedraw();
        if (this._onStrokeEnd) this._onStrokeEnd(stroke);
    }

    _onPointerLeave(e) {
        if (this._drawing) this._onPointerUp(e);
    }

    /**
     * Map a pointer event to canvas-buffer coordinates.
     * Uses getBoundingClientRect so it is correct under any CSS transform
     * (fit / fill / actual display modes applied by the Canvas component).
     */
    _rawPoint(e) {
        const rect = this._canvasEl.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (this._w / rect.width),
            y: (e.clientY - rect.top)  * (this._h / rect.height),
            t: e.timeStamp || Date.now(),
        };
    }

    // ─── Rendering ────────────────────────────────────────────────────────────

    _drawRef(ctx) {
        if (!this._overlays.refGlyph) return;
        const pathD = this._customPathD || (this._prompt && this._prompt.glyphPathD);
        if (!pathD) return;

        const cText = getComputedStyle(document.documentElement).getPropertyValue('--c-text').trim() || '#f5f5f5';
        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.fillStyle   = cText;
        try {
            ctx.fill(new Path2D(pathD));
        } catch (_) {}
        ctx.restore();
    }

    _drawOverlays(ctx) {
        if (!this._fontMetrics) return;

        const { ascender, xHeight, capHeight, descender } = this._fontMetrics;
        if (!ascender) return;

        const descFrac  = Math.abs(descender) / (ascender - descender);
        const baselineY = this._h * (1 - descFrac * 0.7 - 0.12);
        const scale     = (this._h * 0.7) / ascender;

        const cBorder = getComputedStyle(document.documentElement).getPropertyValue('--c-border').trim() || '#444';
        const F = this._F;

        const drawGuide = (yFontUnit, label) => {
            const y = baselineY - yFontUnit * scale;
            ctx.save();
            ctx.strokeStyle = cBorder;
            ctx.lineWidth   = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this._w, y);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.font      = `${F * 0.75}px 'Atkinson Hyperlegible', monospace`;
            ctx.fillStyle = cBorder;
            ctx.fillText(label, 4, y - 3);
            ctx.restore();
        };

        if (this._overlays.baseline)  drawGuide(0,         'BASELINE');
        if (this._overlays.xHeight)   drawGuide(xHeight,   'X-HEIGHT');
        if (this._overlays.capHeight) drawGuide(capHeight, 'CAP');
        if (this._overlays.descender) drawGuide(descender, 'DESCENDER');
        if (this._overlays.ascender)  drawGuide(ascender,  'ASCENDER');
    }

    _drawInk(ctx) {
        if (this._committedStrokes.length === 0) return;
        const cText = getComputedStyle(document.documentElement).getPropertyValue('--c-text').trim() || '#f5f5f5';
        ctx.save();
        ctx.strokeStyle = cText;
        ctx.lineWidth   = 2;
        ctx.lineCap     = 'round';
        ctx.lineJoin    = 'round';
        for (const stroke of this._committedStrokes) {
            this._drawBeziers(ctx, stroke.beziers);
        }
        ctx.restore();
    }

    _drawLiveStroke(ctx) {
        const pts   = this._currentPoints;
        const cText = getComputedStyle(document.documentElement).getPropertyValue('--c-text').trim() || '#f5f5f5';
        ctx.save();
        ctx.strokeStyle = cText;
        ctx.lineWidth   = 2;
        ctx.lineCap     = 'round';
        ctx.lineJoin    = 'round';
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();
        ctx.restore();
    }

    _drawBeziers(ctx, beziers) {
        if (!beziers || beziers.length === 0) return;
        ctx.beginPath();
        ctx.moveTo(beziers[0].a0.x, beziers[0].a0.y);
        for (const seg of beziers) {
            ctx.bezierCurveTo(seg.h1.x, seg.h1.y, seg.h2.x, seg.h2.y, seg.a1.x, seg.a1.y);
        }
        ctx.stroke();
    }

    // ─── Internal helpers ─────────────────────────────────────────────────────

    _requestRedraw() {
        if (this._onRedraw) this._onRedraw();
    }

    _emitDirty() {
        if (this._onDirtyChange) {
            this._onDirtyChange(this._committedStrokes.length > 0);
        }
    }

    // ─── Lifecycle ────────────────────────────────────────────────────────────

    destroy() {
        if (this.isDestroyed) return;
        this.detach();
        super.destroy();
    }
}
