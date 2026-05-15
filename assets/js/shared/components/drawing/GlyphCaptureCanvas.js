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
import { AnimationLoop } from '../../../core/animation-foundation.js';
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

        this._overlays    = {
            baseline: true, xHeight: true, capHeight: true, descender: true, ascender: false,
            ascenderShade: false, refGlyph: true,
            bbox: false, leftBound: false, rightBound: false,
            ...(options.overlays || {}),
        };
        this._fontMetrics = options.fontMetrics || null;
        this._prompt      = options.prompt     || null;
        this._customPathD = null;

        /** @type {number}  fraction of canvas height for reference line (0.4–1.5) */
        this._heightFraction = options.heightFraction ?? 0.7;
        /** @type {{ id?: string, text?: string }[]} */
        this._upcoming       = [];

        /** @type {{ headerLine:string, footerLine:string }} */
        this._rails = { headerLine: '', footerLine: '' };

        /** @type {{ x:number, y:number, w:number, h:number } | null} */
        this._promptBBox = null;

        /** @type {{ left:number, baselineY:number, advanceX:number } | null} */
        this._layoutMarks = null;

        this._slideDx         = 0;
        /** @type {import('../../../core/animation-foundation.js').AnimationLoop|null} */
        this._queueAnim       = null;

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
        this._customPathD = svgPathD != null && String(svgPathD).trim() !== ''
            ? String(svgPathD)
            : null;
        this._requestRedraw();
    }

    /** Toggle overlay guide line visibility. */
    setOverlayToggles(toggles) {
        this._overlays = { ...this._overlays, ...toggles };
        this._requestRedraw();
    }

    /** @param {{ headerLine?: string, footerLine?: string }} r */
    setRails(r) {
        this._rails = {
            headerLine: r?.headerLine != null ? String(r.headerLine) : '',
            footerLine: r?.footerLine != null ? String(r.footerLine) : '',
        };
        this._requestRedraw();
    }

    /** @param {{ x:number, y:number, w:number, h:number } | null} box */
    setPromptBoundingBox(box) {
        this._promptBBox = box && Number.isFinite(box.w) && Number.isFinite(box.h) && box.w >= 0 && box.h >= 0
            ? { x: box.x, y: box.y, w: box.w, h: box.h }
            : null;
        this._requestRedraw();
    }

    /**
     * Vertical guide positions for left/right advance lines (canvas px).
     * @param {{ left:number, baselineY:number, advanceX:number } | null} marks
     */
    setLayoutMarks(marks) {
        this._layoutMarks = marks
            && Number.isFinite(marks.left)
            && Number.isFinite(marks.baselineY)
            && Number.isFinite(marks.advanceX)
            ? { left: marks.left, baselineY: marks.baselineY, advanceX: marks.advanceX }
            : null;
        this._requestRedraw();
    }

    /** Update font metrics (affects overlay positions). */
    setFontMetrics(metrics) {
        this._fontMetrics = metrics;
        this._requestRedraw();
    }

    /** Set internal buffer width/height (canvas backing store). */
    setSize(w, h) {
        this._w = w;
        this._h = h;
        this._requestRedraw();
    }

    /** Drawing-height scale (matches tool slider 0.4–1.5). */
    setReferenceHeightFraction(v) {
        this._heightFraction = v;
        this._requestRedraw();
    }

    /**
     * @param {{ id?: string, text?: string }[]} prompts
     */
    setUpcoming(prompts) {
        const next = Array.isArray(prompts) ? prompts.slice(0, 5) : [];
        const had = this._upcoming.length > 0;
        if (had && next.length > 0 && (this._upcoming[0]?.id ?? '') !== (next[0]?.id ?? '')) {
            this._startQueueSlide();
        }
        this._upcoming = next;
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
        this._drawAscenderBand(ctx);
        this._drawOverlays(ctx);
        this._drawBBox(ctx);
        this._drawAdvanceBounds(ctx);
        this._drawUpcoming(ctx);
        this._drawInk(ctx);
        if (this._drawing && this._currentPoints.length >= 2) {
            this._drawLiveStroke(ctx);
        }
        this._drawRails(ctx);
        if (this._needsIdleHint()) this._drawIdleHint(ctx);
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

    /** Match tool `_resolvePromptLayout`: baseline = height × draw fraction. */
    _baselineCanvasY() {
        const hf = Number(this._heightFraction);
        return this._h * (Number.isFinite(hf) ? hf : 0.7);
    }

    /**
     * Pixels per one font unit (matches tool glyph layout: fontSize = canvasH × (280/392)).
     * @returns {number}
     */
    _pixelsPerFontUnit() {
        const upm = this._fontMetrics?.unitsPerEm;
        if (!upm || upm <= 0) return 1;
        return (this._h * (280 / 392)) / upm;
    }

    _refPathAvailable() {
        const d =
            this._customPathD
            ?? (this._prompt?.glyphPathD != null ? String(this._prompt.glyphPathD) : '');
        return d.trim().length > 0;
    }

    _needsIdleHint() {
        const idlePath = !this._refPathAvailable();
        return (
            idlePath
            && this._committedStrokes.length === 0
            && !this._drawing
        );
    }

    _readToken(name, vgaFallback) {
        return getComputedStyle(document.documentElement)
            .getPropertyValue(name).trim() || vgaFallback;
    }

    _startQueueSlide() {
        if (this._queueAnim) {
            try { this._queueAnim.destroy(); } catch (_) {}
            this._queueAnim = null;
        }
        const slotW = Math.max(8, (this._w * 0.45) / 5);
        this._slideDx = slotW;
        const started = performance.now();
        const dur = 220;

        this._queueAnim = new AnimationLoop({
            onFrame: () => {
                const t = Math.min(1, (performance.now() - started) / dur);
                const smooth = t * t * (3 - 2 * t);
                this._slideDx = slotW * (1 - smooth);
                this._requestRedraw();
                if (t >= 1) {
                    this._slideDx = 0;
                    if (this._queueAnim) {
                        try { this._queueAnim.destroy(); } catch (_) {}
                        this._queueAnim = null;
                    }
                    this._requestRedraw();
                }
            },
        });
        this._queueAnim.start();
    }

    _drawRef(ctx) {
        if (!this._overlays.refGlyph) return;
        const pathD = this._customPathD || (this._prompt?.glyphPathD);
        if (!pathD) return;

        const cText = this._readToken('--c-text', '#c0c0c0');
        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.fillStyle   = cText;
        ctx.lineWidth   = Math.max(1, this._F * 0.10);
        try {
            ctx.fill(new Path2D(pathD));
        } catch (_) {}
        ctx.restore();
    }

    _drawAscenderBand(ctx) {
        if (
            !this._overlays.ascenderShade
            || !this._fontMetrics
        ) return;

        const { ascender, xHeight } = this._fontMetrics;
        if (ascender == null || xHeight == null) return;
        const bl = this._baselineCanvasY();
        const pu = this._pixelsPerFontUnit();
        const yAsc = bl - ascender * pu;
        const yXh = bl - xHeight * pu;

        const cBorder = this._readToken('--c-border', '#808080');
        ctx.save();
        ctx.globalAlpha = 0.10;
        ctx.fillStyle = cBorder;
        const top = Math.min(yAsc, yXh);
        const bot = Math.max(yAsc, yXh);
        ctx.fillRect(0, top, this._w, Math.max(0, bot - top));
        ctx.restore();
    }

    _drawOverlays(ctx) {
        if (!this._fontMetrics) return;

        const { ascender, xHeight, capHeight, descender } = this._fontMetrics;

        const baselineY = this._baselineCanvasY();
        const scale     = this._pixelsPerFontUnit();

        const cBorder = this._readToken('--c-border', '#808080');
        const F = this._F;

        const drawGuide = (yFontUnit, label) => {
            const y = baselineY - yFontUnit * scale;
            ctx.save();
            ctx.strokeStyle = cBorder;
            ctx.lineWidth   = Math.max(1, this._F * 0.07);
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

        if (this._overlays.baseline) drawGuide(0, 'BASELINE');
        if (xHeight != null && this._overlays.xHeight) drawGuide(xHeight, 'X-HEIGHT');
        if (capHeight != null && this._overlays.capHeight) drawGuide(capHeight, 'CAP');
        if (this._overlays.descender && descender != null) drawGuide(descender, 'DESCENDER');
        if (ascender != null && this._overlays.ascender) drawGuide(ascender, 'ASCENDER');
    }

    _drawBBox(ctx) {
        if (!this._overlays.bbox || !this._promptBBox) return;

        const b = this._promptBBox;
        const cAccent = this._readToken('--c-accent', '#c0c0c0');
        ctx.save();
        ctx.strokeStyle = cAccent;
        ctx.lineWidth   = Math.max(1, this._F * 0.075);
        ctx.setLineDash([6, 3]);
        ctx.strokeRect(b.x, b.y, b.w, b.h);
        ctx.restore();
    }

    _drawAdvanceBounds(ctx) {
        const lm = this._layoutMarks;
        if (!lm) return;
        const cBorder = this._readToken('--c-border', '#808080');
        const drawV = (x, want) => {
            if (!want) return;
            ctx.save();
            ctx.strokeStyle = cBorder;
            ctx.lineWidth   = Math.max(1, this._F * 0.07);
            ctx.setLineDash([2, 6]);
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this._h);
            ctx.stroke();
            ctx.restore();
        };
        drawV(lm.left, this._overlays.leftBound);
        drawV(lm.advanceX, this._overlays.rightBound);
    }

    _drawRails(ctx) {
        const hdr = String(this._rails.headerLine ?? '').trim();
        const ftr = String(this._rails.footerLine ?? '').trim();
        if (!hdr && !ftr) return;

        const stripH = Math.max(this._F * 2, Math.round(this._F * 1.15 + 11));
        const pad    = Math.max(4, Math.round(this._F * 0.5));

        const cBorder = this._readToken('--c-border', '#808080');
        const cBg     = this._readToken('--c-bg', '#000000');
        const cText   = this._readToken('--c-text', '#c0c0c0');
        const fs      = Math.max(10, Math.round(this._F * 0.86));

        ctx.save();
        ctx.font         = `${fs}px 'Atkinson Hyperlegible', monospace`;
        ctx.textBaseline = 'top';

        if (hdr) {
            ctx.fillStyle = cBg;
            ctx.fillRect(0, 0, this._w, stripH);
            ctx.fillStyle = cText;
            const yText = pad;
            ctx.fillText(hdr.slice(0, 400), pad, yText);
            ctx.strokeStyle = cBorder;
            ctx.lineWidth   = Math.max(1, this._F * 0.065);
            ctx.beginPath();
            ctx.moveTo(0, stripH);
            ctx.lineTo(this._w, stripH);
            ctx.stroke();
        }

        if (ftr) {
            const y0 = this._h - stripH;
            ctx.fillStyle = cBg;
            ctx.fillRect(0, y0, this._w, stripH);
            ctx.strokeStyle = cBorder;
            ctx.lineWidth   = Math.max(1, this._F * 0.065);
            ctx.beginPath();
            ctx.moveTo(0, y0);
            ctx.lineTo(this._w, y0);
            ctx.stroke();
            ctx.fillStyle = cText;
            ctx.fillText(ftr.slice(0, 400), pad, y0 + pad);
        }

        ctx.restore();
    }

    _drawIdleHint(ctx) {
        const cBorder = this._readToken('--c-border', '#808080');
        const msg =
            !this._fontMetrics
                ? 'PICK OR LOAD A FONT (SESSION → FONT)'
                : 'NO ACTIVE PROMPT — QUEUE IDLE';
        ctx.save();
        ctx.font         = `${Math.max(13, Math.round(this._h * 0.05))}px 'Atkinson Hyperlegible', monospace`;
        ctx.textBaseline = 'middle';
        ctx.textAlign    = 'center';
        ctx.fillStyle    = cBorder;
        ctx.globalAlpha  = 0.55;
        ctx.fillText(msg, this._w / 2, this._h / 2);
        ctx.restore();
    }

    _drawUpcoming(ctx) {
        if (!this._upcoming || this._upcoming.length === 0) return;

        const baselineY = this._baselineCanvasY();
        const slotCount = this._upcoming.length;
        const regionW   = this._w * 0.45;
        const slotStep  = slotCount ? regionW / slotCount : regionW;
        const fontSz    = this._h * this._heightFraction * 0.45;
        const startX    = this._w * 0.55 + this._slideDx;
        const cBorder   = this._readToken('--c-border', '#808080');

        ctx.save();
        ctx.globalAlpha = 0.40;
        ctx.fillStyle   = cBorder;
        ctx.font        = `${Math.max(8, Math.round(fontSz))}px 'Atkinson Hyperlegible', monospace`;
        ctx.textBaseline = 'alphabetic';
        for (let i = 0; i < slotCount; i++) {
            const text = String(this._upcoming[i]?.text ?? '');
            const x = startX + slotStep * (i + 0.5);
            const tw = ctx.measureText(text).width;
            ctx.fillText(text, x - tw / 2, baselineY);
        }
        ctx.restore();
    }

    _drawInk(ctx) {
        if (this._committedStrokes.length === 0) return;
        const cText = this._readToken('--c-text', '#c0c0c0');
        ctx.save();
        ctx.strokeStyle = cText;
        ctx.lineWidth   = Math.max(1, this._F * 0.18);
        ctx.lineCap     = 'round';
        ctx.lineJoin    = 'round';
        for (const stroke of this._committedStrokes) {
            this._drawBeziers(ctx, stroke.beziers);
        }
        ctx.restore();
    }

    _drawLiveStroke(ctx) {
        const pts   = this._currentPoints;
        const cText = this._readToken('--c-text', '#c0c0c0');
        ctx.save();
        ctx.strokeStyle = cText;
        ctx.lineWidth   = Math.max(1, this._F * 0.18);
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
        if (this._queueAnim) {
            try { this._queueAnim.destroy(); } catch (_) {}
            this._queueAnim = null;
        }
        this.detach();
        super.destroy();
    }
}
