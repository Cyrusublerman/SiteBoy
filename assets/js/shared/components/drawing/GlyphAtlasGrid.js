/**
 * GlyphAtlasGrid — uniform-scale grid of capture viewports (ink only).
 *
 * Each cell replays the stored {@link CaptureGeometry} via
 * {@link viewportPromptGeometry} — same coordinate frame as capture save,
 * preview compose, and row replay.
 *
 * @extends BaseComponent
 */
import { BaseComponent } from '../../foundation.js';
import {
    canvasStrokeBounds,
    captureGeometryLocal,
    captureCellDimensions,
    fitTransformForBounds,
    isValidCaptureGeometry,
    metricBandPx,
    projectStrokes,
    viewportPromptGeometry,
} from '../../algorithms/typography/stroke-capture.js';

export class GlyphAtlasGrid extends BaseComponent {
    /** Fraction of each cell used when bbox-fitting ink. */
    static INK_CELL_FILL = 0.88;

    /**
     * @param {{
     *   F?             : number,
     *   inkLineWidthPx? : number,
     *   inkLineCap?    : 'round'|'butt'|'square',
     * }} options
     */
    constructor(options = {}, deps = {}) {
        super({ componentType: 'glyph-atlas-grid', ...options }, deps);
        this._F             = options.F            ?? 14;
        this._inkLineWidthPx = options.inkLineWidthPx ?? 2;
        this._inkLineCap    = options.inkLineCap    ?? 'round';
        this._upm           = 1000;
        this._fontMetrics   = null;
        this._traceFontSize = 24;
        /** @type {Array<{ sortKey:string, type?:string, drawing:object, captureGeometry?:object }>} */
        this._entries       = [];
        /** @type {Array<{ cell: HTMLElement, entry: object, geom: object }>} */
        this._cells         = [];
        /** Pixels per capture pixel — identical for every cell. */
        this._displayScale  = 1;
        /** @type {IntersectionObserver|null} */
        this._drawObserver  = null;
        /** @type {ResizeObserver|null} */
        this._layoutObserver = null;
        this._cellData      = new WeakMap();
    }

    render() {
        if (this.element) return this.element;
        this.element = this.createElement('div', 'glyph-atlas-grid');
        return this.element;
    }

    mountTo(parentEl) {
        this.appendElement(parentEl, this.render());
    }

    /**
     * @param {{
     *   entries       : Array<{ type?:string, sortKey:string, drawing:object, captureGeometry?:object }>,
     *   upm           : number,
     *   F             : number,
     *   fontMetrics   : object|null,
     *   traceFontSize : number,
     *   inkLineWidthPx : number,
     *   inkLineCap    : string,
     * }} opts
     */
    update(opts) {
        if (!this.element) this.render();

        this._entries       = opts.entries ?? [];
        this._F             = opts.F             ?? this._F;
        this._inkLineWidthPx = opts.inkLineWidthPx ?? this._inkLineWidthPx;
        this._inkLineCap    = opts.inkLineCap    ?? this._inkLineCap;
        this._upm           = opts.upm           ?? 1000;
        this._fontMetrics   = opts.fontMetrics   ?? null;
        this._traceFontSize = opts.traceFontSize ?? this._traceFontSize;

        this._disconnectObservers();
        this.clearElement(this.element);
        this._cellData = new WeakMap();
        this._cells = [];

        if (!this._entries.length) {
            const hint = this.createElement('div', 'glyph-atlas-empty', 'NO CAPTURES YET');
            this.appendElement(this.element, hint);
            return;
        }

        for (const entry of this._entries) {
            const geom = this._resolveCaptureGeometry(entry);
            const cell = this.createElement('div', 'glyph-atlas-cell');
            const slot = this.createElement('div', 'glyph-atlas-cell-canvas');
            this.appendElement(cell, slot);
            this._cellData.set(cell, { entry, geom });
            this._cells.push({ cell, entry, geom });
            this.appendElement(this.element, cell);
        }

        this._wireLayoutObserver();
        queueMicrotask(() => {
            this._applyLayout();
            this._setupDrawObserver();
        });
    }

    /**
     * @param {{ captureGeometry?:object, drawing?:object, sortKey?:string, type?:string }} entry
     */
    _resolveCaptureGeometry(entry) {
        const g = entry.captureGeometry ?? entry.drawing?.captureGeometry;
        if (isValidCaptureGeometry(g)) return g;

        const metrics = this._fontMetrics ?? { unitsPerEm: this._upm };
        const fontSize = this._traceFontSize;
        const band = metricBandPx(metrics, fontSize);
        const span = this._inferWidthSpan(entry);
        const advancePx = Math.max(1, band.ppu * band.upm * span);
        return captureGeometryLocal({ advanceWidthPx: advancePx, fontSize }, metrics);
    }

    /**
     * @param {{ type?:string, sortKey?:string, drawing?:object }} entry
     */
    _inferWidthSpan(entry) {
        const map = { single: 1, digraph: 2, trigraph: 3, hardpair: 2, variation: 1, extra: 1 };
        if (map[String(entry.type ?? '')]) return map[String(entry.type ?? '')];
        const text = String(entry.drawing?.promptText ?? entry.sortKey ?? 'a');
        return Math.max(1, [...text].length);
    }

    _wireLayoutObserver() {
        if (typeof ResizeObserver === 'undefined') return;
        this._layoutObserver = new ResizeObserver(() => {
            queueMicrotask(() => {
                this._applyLayout();
                this._redrawAllCells();
            });
        });
        this._layoutObserver.observe(this.element);
    }

    /**
     * One display scale for all cells; each cell = its capture box × that scale.
     */
    _applyLayout() {
        if (!this.element || !this._cells.length) return;

        const containerW = this.element.clientWidth | 0;
        if (containerW < 1) return;

        const metrics = this._fontMetrics ?? { unitsPerEm: this._upm };
        const band = metricBandPx(metrics, this._traceFontSize);
        let refSingleW = this._traceFontSize;
        let refCapH    = band.captureHeight;

        for (const { geom, entry } of this._cells) {
            if (geom.captureHeight > 0) {
                refCapH = Math.max(refCapH, geom.captureHeight);
            }
            const span = Math.max(1, this._inferWidthSpan(entry));
            if (geom.canvasAdvanceWidth > 0 && span > 0) {
                refSingleW = Math.max(refSingleW, geom.canvasAdvanceWidth / span);
            }
        }

        const targetSingleCols = Math.max(3, Math.floor(containerW / (this._F * 6)));
        const targetCellW      = Math.floor(containerW / targetSingleCols);
        this._displayScale     = targetCellW / refSingleW;

        for (const { cell, geom } of this._cells) {
            const { w, h } = captureCellDimensions(geom, this._displayScale);
            cell.style.width  = `${w}px`;
            cell.style.height = `${h}px`;
        }
    }

    _setupDrawObserver() {
        if (this._drawObserver) {
            this._drawObserver.disconnect();
        }

        if (typeof IntersectionObserver === 'undefined') {
            for (const { cell } of this._cells) {
                this._drawCellCanvas(cell);
            }
            return;
        }

        this._drawObserver = new IntersectionObserver(
            (observations) => {
                for (const obs of observations) {
                    if (!obs.isIntersecting) continue;
                    this._drawCellCanvas(/** @type {HTMLElement} */ (obs.target));
                }
            },
            { root: this.element, threshold: 0 },
        );

        for (const { cell } of this._cells) {
            this._drawObserver.observe(cell);
        }
    }

    _redrawAllCells() {
        for (const { cell } of this._cells) {
            this._clearCellCanvas(cell);
            this._drawCellCanvas(cell);
        }
    }

    _clearCellCanvas(cell) {
        const slot = cell.querySelector('.glyph-atlas-cell-canvas');
        const cvs = slot?.querySelector('canvas');
        if (cvs && slot) slot.removeChild(cvs);
    }

    _drawCellCanvas(cell) {
        const data = this._cellData.get(cell);
        if (!data) return;

        const slot = cell.querySelector('.glyph-atlas-cell-canvas');
        if (!slot) return;

        const cellW = Math.max(1, cell.clientWidth | 0);
        const cellH = Math.max(1, cell.clientHeight | 0);
        if (cellW < 1 || cellH < 1) return;

        const scaleKey = `${cellW}|${cellH}|fit|${data.geom.canvasAdvanceWidth}|${data.geom.captureHeight}`;
        const existing = slot.querySelector('canvas');
        if (existing?.dataset.layoutKey === scaleKey) return;

        if (existing) slot.removeChild(existing);

        const cvs = this.createElement('canvas');
        cvs.dataset.layoutKey = scaleKey;

        const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
        cvs.width  = Math.max(1, Math.round(cellW * dpr));
        cvs.height = Math.max(1, Math.round(cellH * dpr));

        const ctx = cvs.getContext('2d');
        if (ctx && data.entry.drawing?.strokes?.length) {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            this._renderInk(ctx, data.entry.drawing, data.geom, cellW, cellH);
        }

        this.appendElement(slot, cvs);
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {object} drawing
     * @param {object} geom
     * @param {number} cellW
     */
    _renderInk(ctx, drawing, geom, cellW, cellH) {
        const capW = Math.max(1, geom.canvasAdvanceWidth);
        const fontUnits = geom.fontAdvanceWidth ?? this._upm;
        const promptGeometry = viewportPromptGeometry(geom, capW);
        const canvasStrokes = projectStrokes(
            drawing.strokes,
            promptGeometry,
            fontUnits,
        );

        const lineW = this._inkLineWidthPx;
        const bounds = canvasStrokeBounds(canvasStrokes, lineW);
        if (!bounds) return;

        const { scale, tx, ty } = fitTransformForBounds(
            bounds,
            cellW,
            cellH,
            GlyphAtlasGrid.INK_CELL_FILL,
        );

        ctx.save();
        ctx.translate(tx, ty);
        ctx.scale(scale, scale);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth   = lineW;
        ctx.lineCap     = this._inkLineCap;
        ctx.lineJoin    = 'round';

        for (const stroke of canvasStrokes) {
            const beziers = stroke?.beziers;
            if (!beziers?.length) continue;
            ctx.beginPath();
            ctx.moveTo(beziers[0].a0.x, beziers[0].a0.y);
            for (const seg of beziers) {
                ctx.bezierCurveTo(seg.h1.x, seg.h1.y, seg.h2.x, seg.h2.y, seg.a1.x, seg.a1.y);
            }
            ctx.stroke();
        }
        ctx.restore();
    }

    _disconnectObservers() {
        if (this._drawObserver) {
            this._drawObserver.disconnect();
            this._drawObserver = null;
        }
        if (this._layoutObserver) {
            this._layoutObserver.disconnect();
            this._layoutObserver = null;
        }
    }

    destroy() {
        if (this.isDestroyed) return;
        this._disconnectObservers();
        this._cellData = new WeakMap();
        this._entries = [];
        this._cells = [];
        super.destroy();
    }
}
