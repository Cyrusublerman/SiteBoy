/**
 * Cursive Glyph Builder — ToolBase shell for vector stroke capture over a reference font.
 *
 * @see blog/docs/pages/tools/utilities/cursive-glyph-builder.md — loaded into INFO panel.
 */

import { ToolBase } from '../core/tool-base.js';
import ComponentLibrary from '../../shared/component-library.js';
import { GlyphCaptureCanvas } from '../../shared/components/drawing/GlyphCaptureCanvas.js';
import { GlyphAtlasGrid } from '../../shared/components/drawing/GlyphAtlasGrid.js';
import * as Store   from '../../shared/data/glyph-library-store.js';
import * as Adapter from '../../shared/typography/opentype-adapter.js';
import { detectSystemFonts } from '../../core/font-loader.js';
import {
    buildPromptSet,
    advance,
    deferSkip,
    coveragePercent,
    currentPrompt,
    markDrawn,
    getRowWindow,
    stepPrevious,
} from '../../shared/algorithms/typography/prompt-sequencer.js';
import {
    normaliseStrokes,
    computeDrawingMetrics,
    captureGeometryFromCanvasRow,
    captureGeometryLocal,
    isValidCaptureGeometry,
    metricBandPx,
    promptGeometryFromCapture,
    linePromptGeometry,
    projectStrokes,
} from '../../shared/algorithms/typography/stroke-capture.js';
import {
    composeTextToVectors,
    buildSVGDocument,
    wrapPreviewLines,
    measureLineAdvanceEm,
    advanceEmForSegment,
    computeSingleGlyphAdvanceBounds,
    buildSpaceVariationAdvancesEm,
    buildSyntheticSpaceGlyphs,
    resolveSpaceVariationAdvancesEm,
    isUncapturedSpaceSegment,
    pickSyntheticSpaceGlyph,
    resolveSegments,
    DEFAULT_SEGMENT_WEIGHT_PER_GLYPH,
    DEFAULT_SEGMENT_TEMPERATURE,
} from '../../shared/algorithms/typography/handwriting-compose.js';
import {
    perturbCanvasStrokesWithAnchorNoise,
    normaliseAnchorNoiseOptions,
    DEFAULT_ANCHOR_NOISE,
} from '../../shared/algorithms/typography/anchor-noise.js';
import { ExportUtils } from '../../shared/algorithms/index.js';

const GF_CURSIVE = [
    'Dancing Script', 'Pacifico', 'Sacramento', 'Great Vibes', 'Allura',
    'Alex Brush', 'Pinyon Script', 'Clicker Script', 'Tangerine', 'Caveat',
    'Kalam', 'Permanent Marker', 'Indie Flower', 'Patrick Hand', 'Amatic SC',
];

const DOC_MD_PATH = '/blog/docs/pages/tools/utilities/cursive-glyph-builder.md';

/** Default VIEW toggles; extended keys map in `_applyGuidesToCanvas`. */
const DEFAULT_GUIDES = ['BASELINE', 'DESC', 'XH', 'CAP', 'REF'];

const RAIL_FOOTER =
    'NEXT ENTER/→ · SKIP ESC · PREV ← · CLEAR BACKSPACE · UNDO CTRL+Z · REDO CTRL+SHIFT+Z · EXPORT ▾ (TOOLBAR)';

/** Default compose body for PREVIEW / SVG export (user-editable in VIEW tab). */
const DEFAULT_PREVIEW_TEXT = '';

/** Default compose output size (px); independent of SESSION trace size. */
const DEFAULT_PREVIEW_FONT_SIZE = 72;

const DEFAULT_PREVIEW_SETTINGS = Object.freeze({
    previewText:         DEFAULT_PREVIEW_TEXT,
    previewFontSize:     DEFAULT_PREVIEW_FONT_SIZE,
    segmentTemperature:  DEFAULT_SEGMENT_TEMPERATURE,
    segmentRoll:         0,
});

/** Inter-row gap as em (leading beyond ascender–descender body). */
const DEFAULT_ROW_MARGIN_EM = 0.1;

/** Target visible rows when auto-sizing trace from viewport. */
const STANDARD_VISIBLE_ROWS = 5;

/** Default typography (SESSION); persisted on library.settings. */
const DEFAULT_TYPOGRAPHY = Object.freeze({
    traceFontSize:     72,
    rowMarginEm:       DEFAULT_ROW_MARGIN_EM,
    letterSpacingEm:   0,
    kerningAdjust:     0,
    skewDeg:           0,
    typographyStyle:   [],
});

const TYPOGRAPHY_CONTROL_KEYS = [
    'traceFontSize',
    'rowMarginEm',
    'letterSpacingEm',
    'kerningAdjust',
    'skewDeg',
    'typographyStyle',
];

const TYPOGRAPHY_STYLE_VALUES = ['bold', 'italic', 'underline'];

/** Ink display (VIEW tab); persisted on library.settings. */
const DEFAULT_INK_VIEW = Object.freeze({
    inkLineWidthPx: 2,
    inkLineCap:    'round',
});

const INK_LINE_CAP_OPTIONS = [
    { value: 'round',  label: 'ROUND' },
    { value: 'butt',   label: 'BUTT' },
    { value: 'square', label: 'SQUARE' },
];

const ANCHOR_NOISE_FN_OPTIONS = [
    { value: 'fbm',    label: 'FBM' },
    { value: 'perlin', label: 'PERLIN' },
];

const GUIDE_TOGGLE_ITEMS = [
    { value: 'BASELINE', label: 'BASE' },
    { value: 'DESC',     label: 'DESC' },
    { value: 'XH',       label: 'X-HGT' },
    { value: 'CAP',      label: 'CAP' },
    { value: 'REF',      label: 'REF' },
    { value: 'ASC',      label: 'ASC' },
    { value: 'ASHADE',   label: 'A-SHD' },
    { value: 'LFT',      label: 'L-BND' },
    { value: 'RGT',      label: 'R-BND' },
    { value: 'BOX',      label: 'BBOX' },
];

const TOOL_CONFIG = {
    title: 'CURSIVE GLYPH BUILDER',

    sidebar: [
        ['SESSION', [
            ['Library', [
                ['button', 'New Library', { key: 'newLibrary' }],
            ]],
            ['Font', [
                ['dropdown', 'Reference font', [{ value: '__noop__', label: 'REFERENCE FONT' }],
                    { key: 'fontFamily', value: '__noop__' }],
                ['label', '', { key: 'fontStatus', value: '', variant: 'caption' }],
            ]],
            ['Typography', [
                ['number', 'Trace size', 24, 512, 1, {
                    key: 'traceFontSize',
                    value: DEFAULT_TYPOGRAPHY.traceFontSize,
                    display: 'field',
                }],
                ['slider', 'Leading', 0.05, 0.25, 0.01, {
                    key: 'rowMarginEm',
                    withNumber: true,
                    value: DEFAULT_TYPOGRAPHY.rowMarginEm,
                }],
                ['slider', 'Tracking', 0, 0.5, 0.01, {
                    key: 'letterSpacingEm',
                    withNumber: true,
                    value: DEFAULT_TYPOGRAPHY.letterSpacingEm,
                }],
                ['slider', 'Kerning', -0.15, 0.15, 0.005, {
                    key: 'kerningAdjust',
                    withNumber: true,
                    value: DEFAULT_TYPOGRAPHY.kerningAdjust,
                }],
                ['slider', 'Skew', -20, 20, 1, {
                    key: 'skewDeg',
                    withNumber: true,
                    value: DEFAULT_TYPOGRAPHY.skewDeg,
                }],
            ]],
            ['Style', [
                ['toggle', 'Style', [
                    { value: 'bold', label: 'BOLD' },
                    { value: 'italic', label: 'ITALIC' },
                    { value: 'underline', label: 'UNDER' },
                ], {
                    key: 'typographyStyle',
                    exclusive: false,
                    layout: 'grid',
                    gridColumns: 3,
                    selectedValues: [],
                }],
                ['toggle', 'Lock', [
                    { value: 'lock', label: 'LOCK' },
                ], {
                    key: 'typographyLock',
                    exclusive: false,
                    layout: 'grid',
                    gridColumns: 1,
                    selectedValues: [],
                }],
            ]],
        ]],
        ['PROMPT', [
            ['Status', [
                ['label', '', { key: 'sessionLine', value: '—', variant: 'caption' }],
            ]],
            ['Current', [
                ['label', 'Prompt',   { key: 'promptLabel',   value: '—', variant: 'caption' }],
                ['label', 'Phase',    { key: 'phaseLabel',    value: '—', variant: 'caption' }],
                ['label', 'Coverage', { key: 'coverageLabel', value: '0%', variant: 'caption' }],
            ], { contentColumns: 3 }],
            ['Queue', [
                ['button', 'Previous',  { key: 'prevPrompt' }],
                ['button', 'Next',      { key: 'saveNext' }],
                ['button', 'Skip',      { key: 'skipPrompt' }],
                ['button', 'Clear Ink', { key: 'clearInk' }],
            ], { contentColumns: 4 }],
        ]],
        ['VIEW', [
            ['Guides', [
                ['toggle', 'Overlays', GUIDE_TOGGLE_ITEMS, {
                    key: '_guides',
                    exclusive: false,
                    layout: 'grid',
                    gridColumns: 2,
                    selectedValues: DEFAULT_GUIDES,
                }],
            ]],
            ['Viewport', [
                ['toggle', 'Mode', [
                    { value: 'pan', label: 'PAN' },
                ], {
                    key: 'canvasPan',
                    exclusive: false,
                    layout: 'grid',
                    gridColumns: 1,
                    selectedValues: [],
                }],
            ]],
            ['Ink', [
                ['number', 'Line thickness px', 1, 128, 1, {
                    key: 'inkLineWidthPx',
                    value: DEFAULT_INK_VIEW.inkLineWidthPx,
                    display: 'field',
                }],
                ['dropdown', 'Line cap', INK_LINE_CAP_OPTIONS, {
                    key: 'inkLineCap',
                    value: DEFAULT_INK_VIEW.inkLineCap,
                }],
            ]],
            ['Preview', [
                ['number', 'Output size', 12, 512, 1, {
                    key: 'previewFontSize',
                    value: DEFAULT_PREVIEW_FONT_SIZE,
                    display: 'field',
                }],
                ['number', 'N-gram noise', 0, 2, 0.1, {
                    key: 'segmentTemperature',
                    value: DEFAULT_SEGMENT_TEMPERATURE,
                    display: 'field',
                }],
                ['button', 'Reroll n-grams', null, { key: 'segmentRerollNgrams' }],
                ['text', '', DEFAULT_PREVIEW_TEXT, {
                    key: 'previewText',
                    multiline: true,
                    placeholder: 'Enter text to preview with captured ink…',
                    rows: 6,
                }],
            ]],
            ['Anchor noise', [
                ['number', 'Amplitude px', 0, 32, 0.5, {
                    key: 'anchorNoiseAmplitudePx',
                    value: DEFAULT_ANCHOR_NOISE.amplitudePx,
                    display: 'field',
                }],
                ['number', 'Noise scale', 0.001, 0.05, 0.001, {
                    key: 'anchorNoiseScale',
                    value: DEFAULT_ANCHOR_NOISE.noiseScale,
                    display: 'field',
                }],
                ['number', 'Octaves', 1, 8, 1, {
                    key: 'anchorNoiseOctaves',
                    value: DEFAULT_ANCHOR_NOISE.octaves,
                    display: 'field',
                }],
                ['number', 'Persistence', 0.1, 1, 0.05, {
                    key: 'anchorNoisePersistence',
                    value: DEFAULT_ANCHOR_NOISE.persistence,
                    display: 'field',
                }],
                ['number', 'Lacunarity', 1, 4, 0.1, {
                    key: 'anchorNoiseLacunarity',
                    value: DEFAULT_ANCHOR_NOISE.lacunarity,
                    display: 'field',
                }],
                ['dropdown', 'Noise fn', ANCHOR_NOISE_FN_OPTIONS, {
                    key: 'anchorNoiseFn',
                    value: DEFAULT_ANCHOR_NOISE.noiseFn,
                }],
                ['number', 'Seed', 0, 99999, 1, {
                    key: 'anchorNoiseSeed',
                    value: DEFAULT_ANCHOR_NOISE.seed,
                    display: 'field',
                }],
            ]],
        ]],
    ],

    canvas: {
        width:         560,
        height:        392,
        displayMode:   'fit',
        fillContainer: true,
        enableZoom:    true,
        enablePan:     false,
        enableArrowPan: false,
    },
};

export class CursiveGlyphBuilderTool {
    constructor(container, deps = {}) {
        this.container = container;
        this.deps = { ComponentLibrary, ...deps };

        this._adapterFont   = null;
        this._fontBytes     = null;
        this._session = {
            library: this._emptyLibrary(),
            queue: null,
            view: 'capture',
            dirty: false,
            activeInkPromptId: null,
            inkRestoreSuppressed: null,
            layoutCanvasW: 0,
            layoutCanvasH: 0,
        };
        this._session.queue = this._session.library.queueState;
        this._captureCanvas = null;
        /** @type {ReturnType<typeof Adapter.getFontCapabilities>|null} */
        this._fontCapabilities = null;
        /**
         * Preview render cache — offscreen canvas + the key it was built from.
         * Invalidated when library size, canvas dimensions, or typography changes.
         * @type {{ bitmap: ImageBitmap|null, key: string }}
         */
        this._previewCache = { bitmap: null, key: '' };

        this.tool = null;
        this._glyphToolbar = null;
        /** @type {GlyphAtlasGrid|null} */
        this._atlasGrid = null;
        this._onKeyDown = this._onKeyDown.bind(this);
        this._unregisterKeydown = null;

        this.initialize();
    }

    async initialize() {
        try {
            const Lib = this.deps.ComponentLibrary;

            this._glyphToolbar = new Lib.GlyphBuilderToolbar({
                displayMode:  'fit',
                canvasView:   'capture',
                infoFetchPath: DOC_MD_PATH,
                onDisplayModeChange: (mode) => {
                    this.tool?.setCanvasDisplayMode(mode);
                    this._syncCaptureCanvasSizeFromTool();
                    if (this._session.view === 'capture') {
                        this._renderCurrentPrompt();
                    } else {
                        this.tool?.draw?.();
                    }
                },
                onPreviewClick: () => {
                    this._setCanvasView(this._session.view === 'preview' ? 'capture' : 'preview');
                },
                onGlyphsClick: () => {
                    this._setCanvasView(this._session.view === 'atlas' ? 'capture' : 'atlas');
                },
                onExportPng: () => this._exportPng(),
                onExportSvg: () => this._exportComposedSvg(),
                onExportZip: () => void this._exportZip(),
                onImportZipPick: (f) => this._promptImportZip(f),
                onImportFontPick: (f) => void this._loadFontFromUpload(f),
            }, this.deps);

            if (this.container) {
                this.container.classList.add('tool-viewport');
            }

            this.tool = new ToolBase({
                ...TOOL_CONFIG,
                onAfterRender: (tb) => {
                    this._onToolBaseInit(tb);
                },
            }, this.deps);
            this.tool.onUpdate = (key, value, values) =>
                this._handleUpdate(key, value, values);

            if (this.container) {
                this.tool.mount(this.container);
            }

            const origResize = this.tool._handleResize.bind(this.tool);
            this.tool._handleResize = () => {
                const prevEl = this.tool.element;
                origResize();
                if (this.tool.element !== prevEl) {
                    this._onToolBaseInit(this.tool);
                }
            };

            this.tool.setValue('_guides', DEFAULT_GUIDES);
            this._applyTypographyToToolValues(DEFAULT_TYPOGRAPHY);
            this._applyInkViewToToolValues(DEFAULT_INK_VIEW);
            this._applyPreviewSettingsToToolValues(DEFAULT_PREVIEW_SETTINGS);
            this._applyAnchorNoiseToToolValues(DEFAULT_ANCHOR_NOISE);

            await this._rebuildFontDropdown();

            queueMicrotask(() => {
                this._syncCaptureCanvasSizeFromTool();
                this._bootstrapTraceFontSizeFromViewport();
            });

            await this._tryRestoreSession();

            this._applyTypographyLockUI();
            this._applyFontCapabilitiesUI();

            this._renderCurrentPrompt();
        } catch (err) {
            this._showError('Initialisation failed', err);
        }
    }

    /**
     * Idempotent injection of toolbar, capture canvas, atlas grid, and draw hook.
     * Runs on first render and after ToolBase orientation rebuild.
     * @param {import('../core/tool-base.js').ToolBase} tb
     */
    _onToolBaseInit(tb) {
        if (!tb) return;

        if (typeof this._unregisterKeydown === 'function') {
            try { this._unregisterKeydown(); } catch (_) {}
        }
        this._unregisterKeydown = null;

        if (this._captureCanvas) {
            this._captureCanvas.destroy();
            this._captureCanvas = null;
        }
        if (this._atlasGrid) {
            this._atlasGrid.destroy();
            this._atlasGrid = null;
        }

        if (this._glyphToolbar) {
            tb.setTopBar(this._glyphToolbar);
            this._glyphToolbar.setCanvasView(this._session.view);
            this._glyphToolbar.setDisplayMode(this._glyphToolbar.displayMode || 'fit');
        }

        const newLib = tb.getComponent('newLibrary');
        if (newLib) {
            newLib.onClick = () => this._confirmAndNewLibrary();
        }

        this._atlasGrid = new GlyphAtlasGrid(
            { F: tb.F || 14 },
            this.deps,
        );
        if (tb.canvasArea) {
            this._atlasGrid.mountTo(tb.canvasArea);
        }

        this._captureCanvas = new GlyphCaptureCanvas({
            width:          560,
            height:         392,
            heightFraction: 0.7,
            F:              tb.F || 14,
            fontMetrics:    this._session.library.referenceFont?.metrics ?? null,
            prompt:         null,
            overlays:       {
                baseline: true, descender: true, xHeight: true, capHeight: true,
                ascender: false, refGlyph: true,
                ascenderShade: false, bbox: false, leftBound: false, rightBound: false,
            },
            onStrokeEnd:   () => { this._session.dirty = true; },
            onDirtyChange: (dirty) => { this._session.dirty = dirty; },
            onRedraw:      () => { tb.draw?.(); },
        }, this.deps);

        tb.onDraw = (ctx) => {
            if (!this._captureCanvas || !ctx) return;
            const { w, h } = this._logicalCanvasCssSize();
            if (w > 0 && h > 0) {
                const sizeChanged = w !== this._session.layoutCanvasW || h !== this._session.layoutCanvasH;
                if (sizeChanged) {
                    this._session.layoutCanvasW = w;
                    this._session.layoutCanvasH = h;
                    this._captureCanvas.setLogicalSize(w, h);
                    if (this._session.view === 'capture') {
                        this._renderCurrentPrompt({ redraw: false });
                    }
                }
            }
            if (this._session.view === 'preview') {
                this._drawPreviewView(ctx, w, h);
                return;
            }
            if (this._session.view === 'atlas') {
                return;
            }
            this._captureCanvas.draw(ctx);
        };

        if (this._session.view === 'atlas') {
            tb.canvasArea?.classList.add('atlas-active');
            this._renderAtlasDOM();
        } else {
            tb.canvasArea?.classList.remove('atlas-active');
        }

        this._applyGuidesToCanvas(tb.values['_guides'] ?? DEFAULT_GUIDES);
        this._applyInkViewToCanvas();
        this._applyCanvasPanMode(tb.values?.canvasPan ?? []);

        this._syncCaptureCanvasSizeFromTool();
        this._renderCurrentPrompt();

        queueMicrotask(() => {
            if (typeof tb._resizeCanvasToFit === 'function') {
                try { tb._resizeCanvasToFit(); } catch (_) {}
            }
            this._syncCaptureCanvasSizeFromTool();
            this._applyCanvasPanMode(this.tool?.values?.canvasPan ?? []);
            this._renderCurrentPrompt();
        });

        this._unregisterKeydown = tb.registerKeydown(this._onKeyDown);
    }

    _modeWord(type) {
        const map = {
            single:   'SINGLE',
            digraph:  'DOUBLE',
            trigraph: 'TRIPLE',
            hardpair: 'HARDPAIR',
            variation: 'VAR',
        };
        return map[type] ?? String(type || '—').toUpperCase();
    }

    /** Logical px (matches Canvas 2D user space), not backing-store width/height. */
    _logicalCanvasCssSize() {
        const comp = this.tool?.canvasComponent;
        if (comp && comp.width > 0 && comp.height > 0) {
            return { w: comp.width | 0, h: comp.height | 0 };
        }
        const el = this.tool?.canvas;
        if (el) {
            return {
                w: Math.max(1, Math.round(el.clientWidth)),
                h: Math.max(1, Math.round(el.clientHeight)),
            };
        }
        return { w: 0, h: 0 };
    }

    _syncCaptureCanvasSizeFromTool() {
        const cap = this._captureCanvas;
        if (!cap?.setSize) return;
        const { w, h } = this._logicalCanvasCssSize();
        if (w > 0 && h > 0) cap.setSize(w, h);
    }

    _isTypographyLocked() {
        const v = this.tool?.values?.typographyLock;
        return Array.isArray(v) && v.includes('lock');
    }

    /** @returns {string[]} */
    _typographyStyleSelection() {
        const v = this.tool?.values?.typographyStyle;
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
    }

    /**
     * Resolved typography for layout + reference rendering.
     * @returns {{
     *   traceFontSize:number, rowMarginEm:number, letterSpacingEm:number,
     *   kerningAdjust:number, skewDeg:number, effectiveSkewDeg:number,
     *   bold:boolean, italic:boolean, underline:boolean
     * }}
     */
    _typography() {
        const v = this.tool?.values ?? {};
        const fs = Number(v.traceFontSize);
        const margin = Number(v.rowMarginEm);
        const track = Number(v.letterSpacingEm);
        const kern = Number(v.kerningAdjust);
        const skew = Number(v.skewDeg);
        const style = this._effectiveTypographyStyle();
        const caps = this._fontCapabilities;
        const bold = style.includes('bold');
        const italic = style.includes('italic');
        const underline = style.includes('underline');
        const skewDeg = Number.isFinite(skew) ? skew : DEFAULT_TYPOGRAPHY.skewDeg;
        let effectiveSkewDeg = skewDeg;
        if (italic && caps?.hasItalic) {
            effectiveSkewDeg = caps.italicAngle;
        }
        return {
            traceFontSize: Number.isFinite(fs) && fs > 0
                ? fs
                : DEFAULT_TYPOGRAPHY.traceFontSize,
            rowMarginEm: Number.isFinite(margin)
                ? Math.min(0.25, Math.max(0.05, margin))
                : DEFAULT_TYPOGRAPHY.rowMarginEm,
            letterSpacingEm: Number.isFinite(track)
                ? Math.min(0.5, Math.max(0, track))
                : DEFAULT_TYPOGRAPHY.letterSpacingEm,
            kerningAdjust: Number.isFinite(kern)
                ? Math.min(0.15, Math.max(-0.15, kern))
                : DEFAULT_TYPOGRAPHY.kerningAdjust,
            skewDeg,
            effectiveSkewDeg,
            bold,
            italic,
            underline,
        };
    }

    /** Style toggles allowed for the loaded font face. */
    _allowedTypographyStyles() {
        const caps = this._fontCapabilities;
        if (!caps) return [];
        return TYPOGRAPHY_STYLE_VALUES.filter((key) => {
            if (key === 'bold') return caps.hasBold;
            if (key === 'italic') return caps.hasItalic;
            if (key === 'underline') return caps.hasUnderline;
            return false;
        });
    }

    /** Active style toggles after capability gating (for save + render). */
    _effectiveTypographyStyle() {
        const allowed = new Set(this._allowedTypographyStyles());
        return this._typographyStyleSelection().filter((v) => allowed.has(v));
    }

    /** Drop style toggles the current font face does not support. */
    _pruneUnsupportedTypographyStyle() {
        if (!this.tool) return;
        const prev = this._typographyStyleSelection();
        const next = this._effectiveTypographyStyle();
        if (next.length !== prev.length) {
            this.tool.setValue('typographyStyle', next);
        }
    }

    _refreshFontCapabilities() {
        this._fontCapabilities = this._adapterFont
            ? Adapter.getFontCapabilities(this._adapterFont)
            : null;
        if (this._session.library?.referenceFont && this._fontCapabilities) {
            this._session.library.referenceFont.capabilities = this._fontCapabilities;
        }
    }

    /** Enable/disable BOLD / ITALIC / UNDER toggles from OpenType tables. */
    _applyFontCapabilitiesUI() {
        const caps = this._fontCapabilities;
        const tg = this.tool?.components?.get('typographyStyle');
        if (!tg?.checkboxElements?.length) return;

        const enabledByValue = {
            bold:      !!caps?.hasBold,
            italic:    !!caps?.hasItalic,
            underline: !!caps?.hasUnderline,
        };

        tg.checkboxElements.forEach((cb, i) => {
            const item = tg.items[i];
            const val = typeof item === 'object' ? item.value : item;
            const on = caps != null && enabledByValue[val] === true;
            if (!on && cb.checked) {
                cb.checked = false;
                const idx = tg.selectedValues?.indexOf(val);
                if (typeof idx === 'number' && idx >= 0) tg.selectedValues.splice(idx, 1);
                const itemEl = tg.itemElements?.[i];
                if (itemEl && typeof tg._setInverted === 'function') {
                    tg._setInverted(itemEl, false);
                }
            }
            cb.disabled = !on;
            const label = cb.parentElement;
            if (label) {
                label.classList.toggle('control-dimmed', !on);
            }
        });

        this._pruneUnsupportedTypographyStyle();
    }

    /** @param {object} [settings] library.settings typography */
    _normaliseTypographySettings(settings) {
        const raw = settings || {};
        const trackRaw = raw.letterSpacingEm ?? raw.letterGap;
        const s = {
            traceFontSize: Number(raw.traceFontSize),
            rowMarginEm: Number(raw.rowMarginEm),
            letterSpacingEm: Number(trackRaw),
            kerningAdjust: Number(raw.kerningAdjust),
            skewDeg: Number(raw.skewDeg),
            typographyStyle: (Array.isArray(raw.typographyStyle)
                ? raw.typographyStyle
                : []
            ).filter((v) => TYPOGRAPHY_STYLE_VALUES.includes(v)),
        };
        if (!Number.isFinite(s.traceFontSize) || s.traceFontSize <= 0) {
            s.traceFontSize = DEFAULT_TYPOGRAPHY.traceFontSize;
        }
        if (!Number.isFinite(s.rowMarginEm)) {
            s.rowMarginEm = DEFAULT_TYPOGRAPHY.rowMarginEm;
        } else {
            s.rowMarginEm = Math.min(0.25, Math.max(0.05, s.rowMarginEm));
        }
        if (!Number.isFinite(s.letterSpacingEm)) {
            s.letterSpacingEm = DEFAULT_TYPOGRAPHY.letterSpacingEm;
        } else {
            s.letterSpacingEm = Math.min(0.5, Math.max(0, s.letterSpacingEm));
        }
        if (!Number.isFinite(s.kerningAdjust)) {
            s.kerningAdjust = DEFAULT_TYPOGRAPHY.kerningAdjust;
        } else {
            s.kerningAdjust = Math.min(0.15, Math.max(-0.15, s.kerningAdjust));
        }
        if (!Number.isFinite(s.skewDeg)) {
            s.skewDeg = DEFAULT_TYPOGRAPHY.skewDeg;
        } else {
            s.skewDeg = Math.min(20, Math.max(-20, s.skewDeg));
        }
        return s;
    }

    _applyTypographyToToolValues(settings) {
        const s = this._normaliseTypographySettings(settings);
        this.tool?.setValue?.('traceFontSize', s.traceFontSize);
        this.tool?.setValue?.('rowMarginEm', s.rowMarginEm);
        this.tool?.setValue?.('letterSpacingEm', s.letterSpacingEm);
        this.tool?.setValue?.('kerningAdjust', s.kerningAdjust);
        this.tool?.setValue?.('skewDeg', s.skewDeg);
        this.tool?.setValue?.('typographyStyle', s.typographyStyle);
        if (this.tool) {
            this.tool.values.traceFontSize = s.traceFontSize;
            this.tool.values.rowMarginEm = s.rowMarginEm;
            this.tool.values.letterSpacingEm = s.letterSpacingEm;
            this.tool.values.kerningAdjust = s.kerningAdjust;
            this.tool.values.skewDeg = s.skewDeg;
            this.tool.values.typographyStyle = [...s.typographyStyle];
        }
    }

    _readTypographyForLibrary() {
        const t = this._typography();
        return {
            traceFontSize: t.traceFontSize,
            rowMarginEm: t.rowMarginEm,
            letterSpacingEm: t.letterSpacingEm,
            kerningAdjust: t.kerningAdjust,
            skewDeg: t.skewDeg,
            typographyStyle: this._effectiveTypographyStyle(),
            typographyLock: this._isTypographyLocked(),
        };
    }

    _syncLibraryTypography() {
        this._session.library.settings = {
            ...(this._session.library.settings || {}),
            ...this._readTypographyForLibrary(),
            ...this._readInkViewForLibrary(),
            ...this._readPreviewSettingsForLibrary(),
            ...this._readAnchorNoiseForLibrary(),
        };
    }

    /** @param {object} [settings] */
    _normalisePreviewSettings(settings) {
        const raw = settings || {};
        const fs = Number(raw.previewFontSize);
        const temp = Number(raw.segmentTemperature);
        const roll = Number(raw.segmentRoll);
        return {
            previewText: typeof raw.previewText === 'string'
                ? raw.previewText
                : DEFAULT_PREVIEW_SETTINGS.previewText,
            previewFontSize: Number.isFinite(fs) && fs > 0
                ? Math.min(512, Math.max(12, fs))
                : DEFAULT_PREVIEW_SETTINGS.previewFontSize,
            segmentTemperature: Number.isFinite(temp)
                ? Math.min(2, Math.max(0, temp))
                : DEFAULT_PREVIEW_SETTINGS.segmentTemperature,
            segmentRoll: Number.isFinite(roll) && roll >= 0
                ? (roll >>> 0)
                : DEFAULT_PREVIEW_SETTINGS.segmentRoll,
        };
    }

    /** @returns {string} user compose text for preview / SVG export */
    _previewText() {
        return this._normalisePreviewSettings(this.tool?.values).previewText;
    }

    /** @returns {number} compose output size (px) for preview / SVG export */
    _previewFontSize() {
        return this._normalisePreviewSettings(this.tool?.values).previewFontSize;
    }

    /** @param {object} [settings] */
    _applyPreviewSettingsToToolValues(settings) {
        const s = this._normalisePreviewSettings(settings);
        this.tool?.setValue?.('previewText', s.previewText);
        this.tool?.setValue?.('previewFontSize', s.previewFontSize);
        this.tool?.setValue?.('segmentTemperature', s.segmentTemperature);
        if (this.tool) {
            this.tool.values.previewText = s.previewText;
            this.tool.values.previewFontSize = s.previewFontSize;
            this.tool.values.segmentTemperature = s.segmentTemperature;
        }
    }

    /** @returns {number} softmax temperature for single/di/tri pick noise */
    _segmentTemperature() {
        return this._normalisePreviewSettings(this.tool?.values).segmentTemperature;
    }

    _readPreviewSettingsForLibrary() {
        const s = this._normalisePreviewSettings(this.tool?.values);
        return {
            previewText:        s.previewText,
            previewFontSize:    s.previewFontSize,
            segmentTemperature: s.segmentTemperature,
            segmentRoll:        s.segmentRoll,
        };
    }

    /** @param {object} [settings] */
    _normaliseAnchorNoiseSettings(settings) {
        const raw = settings || {};
        return normaliseAnchorNoiseOptions({
            amplitudePx:  raw.anchorNoiseAmplitudePx ?? raw.amplitudePx,
            noiseScale:   raw.anchorNoiseScale ?? raw.noiseScale,
            octaves:      raw.anchorNoiseOctaves ?? raw.octaves,
            lacunarity:   raw.anchorNoiseLacunarity ?? raw.lacunarity,
            persistence:  raw.anchorNoisePersistence ?? raw.persistence,
            seed:         raw.anchorNoiseSeed ?? raw.seed,
            noiseFn:      raw.anchorNoiseFn ?? raw.noiseFn,
        });
    }

    /** @returns {ReturnType<typeof normaliseAnchorNoiseOptions>} */
    _anchorNoiseOptions() {
        return this._normaliseAnchorNoiseSettings(this.tool?.values);
    }

    _readAnchorNoiseForLibrary() {
        const s = this._normaliseAnchorNoiseSettings(this.tool?.values);
        return {
            anchorNoiseAmplitudePx:  s.amplitudePx,
            anchorNoiseScale:        s.noiseScale,
            anchorNoiseOctaves:      s.octaves,
            anchorNoiseLacunarity:   s.lacunarity,
            anchorNoisePersistence:  s.persistence,
            anchorNoiseSeed:         s.seed,
            anchorNoiseFn:           s.noiseFn,
        };
    }

    /** @param {object} [settings] */
    _applyAnchorNoiseToToolValues(settings) {
        const s = this._normaliseAnchorNoiseSettings(settings);
        const pairs = [
            ['anchorNoiseAmplitudePx', s.amplitudePx],
            ['anchorNoiseScale', s.noiseScale],
            ['anchorNoiseOctaves', s.octaves],
            ['anchorNoiseLacunarity', s.lacunarity],
            ['anchorNoisePersistence', s.persistence],
            ['anchorNoiseSeed', s.seed],
            ['anchorNoiseFn', s.noiseFn],
        ];
        for (const [key, val] of pairs) {
            this.tool?.setValue?.(key, val);
            if (this.tool?.values) this.tool.values[key] = val;
        }
    }

    /** @param {object} [settings] */
    _normaliseInkViewSettings(settings) {
        const raw = settings || {};
        const cap = String(raw.inkLineCap ?? DEFAULT_INK_VIEW.inkLineCap);
        let px = Number(raw.inkLineWidthPx);
        if (!Number.isFinite(px) || px <= 0) {
            const legacyF = Number(raw.inkLineWidthF);
            if (Number.isFinite(legacyF) && legacyF > 0) {
                px = Math.round(legacyF * DEFAULT_TYPOGRAPHY.traceFontSize);
            } else {
                px = DEFAULT_INK_VIEW.inkLineWidthPx;
            }
        }
        const s = {
            inkLineWidthPx: Math.min(128, Math.max(1, Math.round(px))),
            inkLineCap: INK_LINE_CAP_OPTIONS.some((o) => o.value === cap)
                ? cap
                : DEFAULT_INK_VIEW.inkLineCap,
        };
        return s;
    }

    /** @param {object} [settings] */
    _applyInkViewToToolValues(settings) {
        const s = this._normaliseInkViewSettings(settings);
        this.tool?.setValue?.('inkLineWidthPx', s.inkLineWidthPx);
        this.tool?.setValue?.('inkLineCap', s.inkLineCap);
        if (this.tool) {
            this.tool.values.inkLineWidthPx = s.inkLineWidthPx;
            this.tool.values.inkLineCap = s.inkLineCap;
        }
    }

    /**
     * @returns {{ inkLineWidthPx:number, inkLineCap:'round'|'butt'|'square' }}
     */
    _inkView() {
        return this._normaliseInkViewSettings(this.tool?.values ?? {});
    }

    _readInkViewForLibrary() {
        return this._inkView();
    }

    _applyInkViewToCanvas() {
        const ink = this._inkView();
        this._captureCanvas?.setInkStyle({
            lineWidthPx: ink.inkLineWidthPx,
            lineCap:     ink.inkLineCap,
        });
        this._invalidatePreviewCache();
        if (this._session.view === 'atlas') {
            this._renderAtlasDOM();
        }
        this.tool?.draw?.();
    }

    /**
     * Standard trace size: fit ~STANDARD_VISIBLE_ROWS in the drawable band using font body + leading.
     * @param {boolean} [force] apply even when trace size is already set
     */
    _bootstrapTraceFontSizeFromViewport(force = false) {
        if (!this.tool || !this._adapterFont) return;
        const cur = Number(this.tool.values.traceFontSize);
        if (!force && Number.isFinite(cur) && cur > 0) return;

        const { h } = this._logicalCanvasCssSize();
        if (h < 1) return;

        const F = Number(this.tool.F) || 14;
        const innerH = Math.max(F, h - F * 4);
        const metrics = Adapter.getMetrics(this._adapterFont);
        const upm = metrics.unitsPerEm || 1000;
        const bodyEm = Math.max(
            0.5,
            (metrics.ascender - metrics.descender) / upm,
        );
        const marginEm = this._typography().rowMarginEm;
        const rowPitchEm = bodyEm + marginEm;
        const fs = Math.floor(innerH / (STANDARD_VISIBLE_ROWS * rowPitchEm));
        const clamped = Math.min(512, Math.max(24, fs));
        this.tool.setValue('traceFontSize', clamped);
    }

    _applyTypographyLockUI() {
        const locked = this._isTypographyLocked();
        for (const key of TYPOGRAPHY_CONTROL_KEYS) {
            const c = this.tool?.components?.get(key);
            if (!c) continue;
            if (key === 'typographyStyle') {
                continue;
            }
            if (typeof c.setDisabled === 'function') {
                c.setDisabled(locked);
            } else if (c.element) {
                c.element.classList.toggle('control-locked', locked);
                const inputs = c.element.querySelectorAll('input, button');
                inputs.forEach((el) => { el.disabled = locked; });
            }
        }
        this._applyFontCapabilitiesUI();
        if (locked) {
            const tg = this.tool?.components?.get('typographyStyle');
            tg?.checkboxElements?.forEach((cb) => { cb.disabled = true; });
        }
    }

    /** Advance width of a glyph run at a given font size (px). */
    _runAdvancePx(text, startX, baselineY, fontSize, typo = this._typography()) {
        const { advanceX } = this._buildGlyphRunPath(text, startX, baselineY, fontSize, typo);
        return advanceX - startX;
    }

    /**
     * Row pitch from font body (ascender→descender at trace size) plus margin em.
     * maxRows = floor(innerH / rowPitch).
     *
     * @param {{ unitsPerEm:number, ascender:number, descender:number }} metrics
     * @param {number} fontSize trace size (px)
     * @param {number} rowMarginEm gap between row bodies (em)
     * @param {number} innerH drawable height (px)
     */
    _rowGridMetrics(metrics, fontSize, rowMarginEm, innerH) {
        const band = metricBandPx(metrics, fontSize);
        const { ascPx, descPx, captureHeight: bodyPx } = band;
        const marginPx = fontSize * rowMarginEm;
        const rowPitch = bodyPx + marginPx;
        const maxRows = Math.max(1, Math.floor(innerH / rowPitch));
        return { rowPitch, maxRows, bodyPx, marginPx, ascPx, descPx };
    }

    /**
     * Baseline Y for grid slot: stack uses metric rowPitch; block centred in drawable band.
     * Body centre (canvas y-down): baselineY − (ascPx + descPx) / 2.
     *
     * @param {number} stripH
     * @param {number} innerH
     * @param {number} slot 0…maxRows−1
     * @param {number} rowPitch
     * @param {number} ascPx
     * @param {number} descPx
     * @param {number} maxRows
     */
    _rowBaselineY(stripH, innerH, slot, rowPitch, ascPx, descPx, maxRows) {
        const bodyPx = ascPx - descPx;
        const stackH = maxRows > 1
            ? (maxRows - 1) * rowPitch + bodyPx
            : bodyPx;
        const stackTop = stripH + (innerH - stackH) / 2;
        return stackTop + ascPx + slot * rowPitch;
    }

    /**
     * Vertical row grid: active prompt in centre slot; prior rows above, upcoming below.
     * @returns {{
     *   cw:number, ch:number, padX:number, fontSize:number,
     *   rowPitch:number, maxRows:number, centerSlot:number,
     *   rows: Array<{
     *     id:string, text:string, isActive:boolean, queueIndex:number,
     *     baselineY:number, pathD:string, originX:number, advanceX:number, advanceWidth:number
     *   }>,
     *   active: object|null
     * } | null}
     */
    _resolvePromptLayout() {
        const cap = this._captureCanvas;
        if (!this.tool?.canvas || !cap) return null;

        const { w: cw, h: ch } = this._logicalCanvasCssSize();
        if (cw < 1 || ch < 1) return null;

        const prompt = currentPrompt(this._session.queue);
        if (!prompt?.text || !this._adapterFont) return null;

        const typo = this._typography();
        const metrics = Adapter.getMetrics(this._adapterFont);
        const F = Number(this.tool.F) || 14;
        const padX = Math.max(F, Math.round(cw * 0.04));
        const stripH = F * 2;
        const innerH = Math.max(F, ch - stripH * 2);
        const fontSize = typo.traceFontSize;
        const grid = this._rowGridMetrics(metrics, fontSize, typo.rowMarginEm, innerH);
        const { maxRows, rowPitch, ascPx, descPx } = grid;
        const { centerSlot, rows: windowRows } = getRowWindow(this._session.queue, maxRows);

        const unitW = (text) => this._runAdvancePx(text, 0, 0, 1, typo);
        const rows = [];
        let active = null;

        for (const wr of windowRows) {
            if (!wr.prompt?.text) continue;
            const text = String(wr.prompt.text);
            const baselineY = this._rowBaselineY(
                stripH, innerH, wr.slot, rowPitch, ascPx, descPx, maxRows,
            );
            const runWEm = unitW(text);
            const runPx = runWEm * fontSize;
            const originX = (cw - runPx) / 2;
            const { pathD, advanceX } = this._buildGlyphRunPath(
                text, originX, baselineY, fontSize, typo,
            );
            const row = {
                id:            wr.prompt.id ?? '',
                text,
                isActive:      wr.isActive,
                queueIndex:    wr.index,
                baselineY,
                pathD,
                originX,
                advanceX,
                advanceWidth:  Math.max(1, advanceX - originX),
            };
            rows.push(row);
            if (wr.isActive) active = row;
        }

        if (!active) return null;

        return {
            cw,
            ch,
            padX,
            stripH,
            innerH,
            fontSize,
            rowPitch: grid.rowPitch,
            maxRows,
            centerSlot,
            rows,
            active,
            canvasAdvanceWidth: active.advanceWidth,
        };
    }

    /**
     * Build combined SVG path for a prompt string at canvas coordinates.
     * @returns {{ pathD: string, advanceX: number }}
     */
    /**
     * Latest saved stroke set for a prompt id (library storage, glyph-space).
     * @param {string} promptId
     * @returns {object[]|null}
     */
    _latestDrawingStrokes(promptId) {
        if (!promptId) return null;
        const drawings = this._session.library?.drawings ?? {};
        let best = null;
        for (const rec of Object.values(drawings)) {
            if (rec?.promptId !== promptId || !rec?.strokes?.length) continue;
            if (!best || (rec.capturedAt ?? 0) > (best.capturedAt ?? 0)) best = rec;
        }
        return best?.strokes ?? null;
    }

    /**
     * Saved ink on rows above the active index (scrolls with the row grid).
     * @param {{ rows: Array<{ id:string, queueIndex:number, originX:number, baselineY:number, advanceWidth:number }> }} lay
     * @param {number} fontAdvanceWidth
     * @returns {object[][]}
     */
    _ghostInkForCompletedRows(lay, fontAdvanceWidth) {
        const cur = this._session.queue.currentIndex ?? 0;
        const out = [];
        for (const row of lay.rows) {
            if (row.queueIndex >= cur) continue;
            const norm = this._latestDrawingStrokes(row.id);
            if (!norm) continue;
            const canvasStrokes = projectStrokes(norm, linePromptGeometry(
                row.originX, row.baselineY, row.advanceWidth,
            ), fontAdvanceWidth);
            if (canvasStrokes.length) out.push(canvasStrokes);
        }
        return out;
    }

    /**
     * Restore live ink for the active prompt when a saved drawing exists.
     * @param {{ id:string }} prompt
     * @param {{ active: { originX:number, baselineY:number, advanceWidth:number } }} lay
     * @param {number} fontAdvanceWidth
     */
    _syncActiveInk(prompt, lay, fontAdvanceWidth) {
        if (!this._captureCanvas || !prompt?.id || !lay?.active) return;

        if (this._session.inkRestoreSuppressed === prompt.id) return;
        if (this._session.activeInkPromptId === prompt.id) return;

        this._session.activeInkPromptId = prompt.id;
        const norm = this._latestDrawingStrokes(prompt.id);
        if (!norm) {
            this._captureCanvas.clearInk();
            return;
        }
        const canvasStrokes = projectStrokes(norm, linePromptGeometry(
            lay.active.originX, lay.active.baselineY, lay.active.advanceWidth,
        ), fontAdvanceWidth);
        this._captureCanvas.setCommittedStrokes(canvasStrokes);
    }

    _buildGlyphRunPath(text, startX, baselineY, fontSize, typo = this._typography()) {
        let combinedPath = '';
        let xCursor = startX;
        const chars = [...text];
        for (let i = 0; i < chars.length; i += 1) {
            const ch = chars[i];
            if (i > 0) {
                const pairKern = Adapter.getKerningEm(
                    this._adapterFont, chars[i - 1], ch,
                );
                xCursor += (pairKern + typo.kerningAdjust) * fontSize;
            }
            const { d, advance } = Adapter.getGlyphPath(
                this._adapterFont, ch, xCursor, baselineY, fontSize,
            );
            if (d) combinedPath += `${d} `;
            xCursor += advance;
            if (i < chars.length - 1 && typo.letterSpacingEm) {
                xCursor += typo.letterSpacingEm * fontSize;
            }
        }
        return { pathD: combinedPath.trim(), advanceX: xCursor };
    }

    /**
     * Pan viewport vs trace ink — mutually exclusive (product: trace is default).
     * @param {string[]|unknown} selection toggle values from `canvasPan`
     */
    _applyCanvasPanMode(selection) {
        const panOn = Array.isArray(selection) && selection.includes('pan');
        const cc = this.tool?.canvasComponent;
        if (cc?.setPanEnabled) cc.setPanEnabled(panOn);
        if (!this.tool?.canvas || !this._captureCanvas) return;
        if (this._session.view !== 'capture') {
            this._captureCanvas.detach();
            if (cc?.resetViewport) cc.resetViewport(false);
            this.tool?.draw?.();
            return;
        }
        if (panOn) {
            this._captureCanvas.detach();
            if (cc?.resetViewport) cc.resetViewport(false);
        } else {
            this._captureCanvas.attach(this.tool.canvas);
            if (cc?.resetViewport) cc.resetViewport(false);
        }
        this.tool?.draw?.();
    }

    /**
     * @param {'capture'|'preview'|'atlas'} view
     */
    _setCanvasView(view) {
        if (view === this._session.view) return;
        this._session.view = view;
        this._glyphToolbar?.setCanvasView(view);

        const cc         = this.tool?.canvasComponent;
        const canvasArea = this.tool?.canvasArea;

        if (view === 'atlas') {
            this._captureCanvas?.detach();
            if (cc?.resetViewport) cc.resetViewport(false);
            canvasArea?.classList.add('atlas-active');
            this._renderAtlasDOM();
        } else {
            canvasArea?.classList.remove('atlas-active');
            if (view === 'capture') {
                this._applyCanvasPanMode(this.tool?.values?.canvasPan ?? []);
                this._renderCurrentPrompt();
            } else {
                this._captureCanvas?.detach();
                if (cc?.resetViewport) cc.resetViewport(false);
                this.tool?.draw?.();
            }
        }
    }

    /**
     * Capture viewport rect for one active row (ascender→descender band × advance width).
     * Stored on each drawing so the atlas can replay the same drawable area.
     *
     * @param {{ active: { originX:number, baselineY:number, advanceWidth:number }, fontSize:number }} lay
     * @param {{ unitsPerEm:number, ascender?:number, descender?:number }} metrics
     */
    /** @param {string|undefined} _promptType */
    _captureGeometryFromLayout(lay, metrics, _promptType) {
        return captureGeometryFromCanvasRow(
            lay.active,
            metrics,
            lay.fontSize,
        );
    }

    /**
     * Capture box for atlas when {@link drawing.captureGeometry} was not persisted.
     * Uses the same advance + metric band math as live capture layout.
     *
     * @param {string} promptText
     * @param {string|undefined} promptType
     */
    _estimateCaptureGeometry(promptText, _promptType) {
        if (!this._adapterFont) return null;
        const metrics  = Adapter.getMetrics(this._adapterFont);
        const typo     = this._typography();
        const fontSize = typo.traceFontSize;
        const text     = String(promptText ?? 'a');
        const advancePx = Math.max(1, this._runAdvancePx(text, 0, 0, fontSize, typo));
        return captureGeometryLocal({ advanceWidthPx: advancePx, fontSize }, metrics);
    }

    /**
     * @param {object} drawing
     * @param {string} promptText
     * @param {string|undefined} promptType
     */
    _captureGeometryForAtlas(drawing, promptText, promptType) {
        const stored = drawing?.captureGeometry;
        if (!this._adapterFont) {
            return isValidCaptureGeometry(stored) ? stored : null;
        }

        const metrics  = Adapter.getMetrics(this._adapterFont);
        const typo     = this._typography();
        const text     = String(promptText ?? 'a');
        const fontSize = stored?.traceFontSize ?? typo.traceFontSize;
        const advancePx = Math.max(1, this._runAdvancePx(text, 0, 0, fontSize, typo));
        const band     = captureGeometryLocal({ advanceWidthPx: advancePx, fontSize }, metrics);

        if (!isValidCaptureGeometry(stored)) return band;

        const drift = Math.abs(stored.canvasAdvanceWidth - advancePx) / advancePx;
        if (drift > 0.05) {
            return {
                ...band,
                canvasOriginX:   stored.canvasOriginX,
                canvasBaselineY: stored.canvasBaselineY,
                captureTopY:     stored.captureTopY,
            };
        }
        return stored;
    }

    /** Rebuild the atlas DOM grid from current library entries. */
    _renderAtlasDOM() {
        if (!this._atlasGrid) return;
        const entries = this._getAtlasEntries();
        const F       = Number(this.tool?.F) || 14;
        const metrics = this._adapterFont ? Adapter.getMetrics(this._adapterFont) : null;
        const upm     = metrics?.unitsPerEm || 1000;
        const v = this.tool?.values ?? {};
        this._atlasGrid.update({
            entries,
            upm,
            F,
            fontMetrics:   metrics,
            traceFontSize: Number(v.traceFontSize) || DEFAULT_TYPOGRAPHY.traceFontSize,
            inkLineWidthPx: Number(v.inkLineWidthPx) || DEFAULT_INK_VIEW.inkLineWidthPx,
            inkLineCap:    String(v.inkLineCap    || 'round'),
        });
    }

    /** Stable seed for weighted segment tie-breaks (varies when text or library changes). */
    _composeSegmentSeed() {
        const stored = this._session.library?.settings?.segmentSeed;
        if (Number.isFinite(stored) && stored > 0) return stored >>> 0;
        let h = 2166136261;
        const lookup = this._drawingLookupByText();
        const payload = [
            this._previewText(),
            [...lookup.keys()].sort().join(','),
        ].join('|');
        for (let i = 0; i < payload.length; i += 1) {
            h ^= payload.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        const roll = Number(this._session.library?.settings?.segmentRoll) || 0;
        return (h ^ roll) >>> 0 || 1;
    }

    /**
     * Shared compose options for preview measure, canvas draw, and SVG export.
     *
     * @param {ReturnType<CursiveGlyphBuilderTool['_typography']>} typo
     * @param {Map<string, object>} lookup
     * @param {number} [fontSize]
     */
    _composeAdvanceOptions(typo, lookup, fontSize) {
        const size = Math.max(1, fontSize ?? this._previewFontSize());
        const bounds = computeSingleGlyphAdvanceBounds(
            (text) => this._runAdvancePx(text, 0, 0, 1, typo),
            lookup,
        );
        const spaceVariationAdvancesEm = buildSpaceVariationAdvancesEm(
            bounds.minEm,
            bounds.maxEm,
        );
        const metrics = this._adapterFont ? Adapter.getMetrics(this._adapterFont) : null;
        const syntheticSpaceGlyphs = buildSyntheticSpaceGlyphs(bounds, {
            upm: metrics?.unitsPerEm ?? 1000,
            fontSize: size,
            metrics: metrics ?? { unitsPerEm: 1000 },
        });
        return {
            advanceFn: (text) => this._runAdvancePx(text, 0, 0, 1, typo),
            minSingleCharAdvanceEm: bounds.minEm,
            maxSingleCharAdvanceEm: bounds.maxEm,
            spaceVariationAdvancesEm,
            spaceVariationCount: spaceVariationAdvancesEm.length,
            syntheticSpaceGlyphs,
            segmentSeed: this._composeSegmentSeed(),
            segmentTemperature: this._segmentTemperature(),
            weightPerGlyph: Number(this._session.library?.settings?.segmentWeightPerGlyph)
                || DEFAULT_SEGMENT_WEIGHT_PER_GLYPH,
            kerningFn: this._adapterFont
                ? (prev, next) => Adapter.getKerningEm(this._adapterFont, prev, next)
                : undefined,
            kerningAdjust: typo.kerningAdjust,
            letterSpacingEm: typo.letterSpacingEm,
        };
    }

    /** @param {Map<string, object>} lookup */
    _hasCapturedSpaceGlyph(lookup) {
        const rec = lookup.get(' ');
        return Boolean(rec?.strokes?.length);
    }

    /** @returns {Map<string, object>} promptText → latest drawing record */
    _drawingLookupByText() {
        const map = new Map();
        for (const rec of Object.values(this._session.library?.drawings ?? {})) {
            if (!rec?.promptText || !rec?.strokes?.length) continue;
            const key = String(rec.promptText);
            const prev = map.get(key);
            if (!prev || (rec.capturedAt ?? 0) > (prev.capturedAt ?? 0)) {
                map.set(key, rec);
            }
        }
        return map;
    }

    /**
     * @param {string} promptId
     * @returns {object|null}
     */
    _latestDrawingRecord(promptId) {
        if (!promptId) return null;
        let best = null;
        for (const rec of Object.values(this._session.library?.drawings ?? {})) {
            if (rec?.promptId !== promptId || !rec?.strokes?.length) continue;
            if (!best || (rec.capturedAt ?? 0) > (best.capturedAt ?? 0)) best = rec;
        }
        return best;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {object[]} strokes canvas-space strokes
     */
    _drawInkStrokes(ctx, strokes) {
        if (!strokes?.length) return;
        const ink = this._inkView();
        ctx.save();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = ink.inkLineWidthPx;
        ctx.lineCap = ink.inkLineCap;
        ctx.lineJoin = 'round';
        for (const stroke of strokes) {
            const beziers = stroke?.beziers;
            if (!beziers?.length) continue;
            ctx.beginPath();
            ctx.moveTo(beziers[0].a0.x, beziers[0].a0.y);
            for (const seg of beziers) {
                ctx.bezierCurveTo(
                    seg.h1.x, seg.h1.y, seg.h2.x, seg.h2.y, seg.a1.x, seg.a1.y,
                );
            }
            ctx.stroke();
        }
        ctx.restore();
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} w
     * @param {number} h
     * @param {string} headerLine
     * @param {string} [footerLine]
     */
    _drawComposeRails(ctx, w, h, headerLine, footerLine = RAIL_FOOTER) {
        const F = Number(this.tool?.F) || 14;
        const stripH = F * 2;
        const pad = F / 2;
        const fs = F * 0.75;
        const hdr = String(headerLine ?? '').trim();
        const ftr = String(footerLine ?? '').trim();

        ctx.save();
        ctx.font = `${fs}px 'Atkinson Hyperlegible', monospace`;
        ctx.textBaseline = 'top';

        if (hdr) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, w, stripH);
            ctx.fillStyle = '#c0c0c0';
            ctx.fillText(hdr.slice(0, 400), pad, pad);
            ctx.strokeStyle = '#808080';
            ctx.lineWidth = Math.max(1, F * 0.065);
            ctx.beginPath();
            ctx.moveTo(0, stripH);
            ctx.lineTo(w, stripH);
            ctx.stroke();
        }

        if (ftr) {
            const y0 = h - stripH;
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, y0, w, stripH);
            ctx.strokeStyle = '#808080';
            ctx.lineWidth = Math.max(1, F * 0.065);
            ctx.beginPath();
            ctx.moveTo(0, y0);
            ctx.lineTo(w, y0);
            ctx.stroke();
            ctx.fillStyle = '#c0c0c0';
            ctx.fillText(ftr.slice(0, 400), pad, y0 + pad);
        }

        ctx.restore();
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} w
     * @param {number} h
     * @param {string} message
     */
    _drawComposeHint(ctx, w, h, message) {
        const F = Number(this.tool?.F) || 14;
        ctx.save();
        ctx.font = `${F}px 'Atkinson Hyperlegible', monospace`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#808080';
        ctx.globalAlpha = 0.55;
        ctx.fillText(message, w / 2, h / 2);
        ctx.restore();
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {string} pathD
     * @param {number} alpha
     */
    _drawRefPathD(ctx, pathD, alpha = 0.22) {
        if (!pathD?.trim()) return;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#808080';
        try { ctx.fill(new Path2D(pathD)); } catch (_) {}
        ctx.restore();
    }

    /**
     * Lay out and draw one sentence line from captured ink.
     *
     * @returns {number} total width (px)
     */
    _drawComposedLine(
        ctx, sentence, startX, baselineY, lookup, upm, fontSize, typo, F,
        spaceIndexState, wordIndexState, anchorNoiseSegmentState,
    ) {
        const advanceOpts = this._composeAdvanceOptions(typo, lookup, fontSize);
        const anchorNoise = this._anchorNoiseOptions();
        const segments = resolveSegments(sentence, lookup, advanceOpts, wordIndexState);
        let x = startX;
        let prevChar = null;

        for (let si = 0; si < segments.length; si += 1) {
            const seg = segments[si];
            const first = seg.text[0];
            if (prevChar && first && this._adapterFont) {
                const pairKern = Adapter.getKerningEm(this._adapterFont, prevChar, first);
                x += (pairKern + typo.kerningAdjust) * fontSize;
            }

            const hasInk = Boolean(seg.drawing?.strokes?.length);
            const advanceEm = advanceEmForSegment(seg.text, hasInk, spaceIndexState, advanceOpts);
            const advanceWidth = Math.max(1, advanceEm * fontSize);

            let drawing = seg.drawing;
            if (isUncapturedSpaceSegment(seg.text, hasInk) && spaceIndexState.n > 0) {
                const variantIndex = spaceIndexState.n - 1;
                drawing = pickSyntheticSpaceGlyph(variantIndex, advanceOpts) ?? drawing;
            }

            if (drawing?.strokes?.length) {
                const geom = linePromptGeometry(x, baselineY, advanceWidth);
                const fontUnits = drawing.captureGeometry?.fontAdvanceWidth ?? upm;
                let canvasStrokes = projectStrokes(
                    drawing.strokes,
                    geom,
                    fontUnits,
                );
                if (anchorNoise.amplitudePx > 0) {
                    canvasStrokes = perturbCanvasStrokesWithAnchorNoise(
                        canvasStrokes,
                        anchorNoise,
                        {
                            originX:      geom.canvasOriginX,
                            originY:      geom.canvasBaselineY,
                            segmentIndex: anchorNoiseSegmentState.n,
                        },
                    );
                    anchorNoiseSegmentState.n += 1;
                }
                this._drawInkStrokes(ctx, canvasStrokes);
            } else if (this._adapterFont && seg.text !== ' ') {
                const { pathD } = this._buildGlyphRunPath(
                    seg.text, x, baselineY, fontSize, typo,
                );
                this._drawRefPathD(ctx, pathD);
            }

            x += advanceWidth;
            if (si < segments.length - 1 && typo.letterSpacingEm) {
                x += typo.letterSpacingEm * fontSize;
            }
            prevChar = seg.text[seg.text.length - 1] ?? prevChar;
        }

        return x - startX;
    }

    /**
     * Word-wrap text to fit a max line width (px).
     *
     * @param {string} text
     * @param {number} maxWidthPx
     * @param {ReturnType<CursiveGlyphBuilderTool['_typography']>} typo
     * @param {number} fontSize
     * @returns {string[]}
     */
    _wrapPreviewLines(text, maxWidthPx, typo, fontSize, lookup) {
        const advanceOpts = this._composeAdvanceOptions(typo, lookup, fontSize);
        const spaceIndexState = { n: 0 };
        const wordIndexState = { n: 0 };
        return wrapPreviewLines(text, maxWidthPx, (line, spaceStart, wordStart) => {
            const { em, spaceIndexEnd, wordIndexEnd } = measureLineAdvanceEm(
                line, lookup, advanceOpts, spaceStart, wordStart,
            );
            return { widthPx: em * fontSize, spaceIndexEnd, wordIndexEnd };
        }, spaceIndexState, wordIndexState);
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} w
     * @param {number} h
     */
    _drawPreviewView(ctx, w, h) {
        const F = Number(this.tool?.F) || 14;
        const typo = this._typography();
        const lookup = this._drawingLookupByText();
        const captured = lookup.size;
        const fontLabel = (this._session.library.referenceFont?.name ?? '').trim().toUpperCase();

        const ink = this._inkView();
        const advanceOpts = this._composeAdvanceOptions(typo, lookup);
        const anchorNoise = this._anchorNoiseOptions();

        const cacheKey = [
            w, h, captured,
            fontLabel,
            typo.traceFontSize,
            typo.rowMarginEm,
            typo.letterSpacingEm,
            typo.kerningAdjust,
            typo.skewDeg ?? 0,
            this._previewFontSize(),
            this._previewText(),
            advanceOpts.spaceVariationAdvancesEm.join(','),
            advanceOpts.segmentSeed,
            advanceOpts.segmentTemperature,
            advanceOpts.weightPerGlyph,
            anchorNoise.amplitudePx,
            anchorNoise.noiseScale,
            anchorNoise.octaves,
            anchorNoise.lacunarity,
            anchorNoise.persistence,
            anchorNoise.seed,
            anchorNoise.noiseFn,
            ink.inkLineWidthPx,
            ink.inkLineCap,
            [...lookup.keys()].sort().join(','),
        ].join('|');

        if (this._previewCache.key === cacheKey && this._previewCache.bitmap) {
            ctx.drawImage(this._previewCache.bitmap, 0, 0);
            return;
        }

        const stripH = F * 2;
        const innerH = Math.max(F, h - stripH * 2);

        this._drawComposeRails(
            ctx, w, h,
            `PREVIEW — ${captured} CAPTURE${captured === 1 ? '' : 'S'} · ${fontLabel || 'NO FONT'}`,
        );

        if (!this._adapterFont) {
            this._drawComposeHint(ctx, w, h, 'LOAD A REFERENCE FONT TO PREVIEW');
            return;
        }
        if (captured === 0) {
            this._drawComposeHint(ctx, w, h, 'CAPTURE GLYPHS — PREVIEW USES YOUR INK');
            return;
        }

        const composeText = this._previewText().trim();
        if (!composeText) {
            this._drawComposeHint(ctx, w, h, 'ENTER COMPOSE TEXT IN VIEW → PREVIEW');
            return;
        }

        const metrics = Adapter.getMetrics(this._adapterFont);
        const upm = metrics.unitsPerEm;
        const padX = Math.max(F, Math.round(w * 0.04));
        const maxW = Math.max(F, w - padX * 2);

        let previewSize = this._previewFontSize();
        let grid = this._rowGridMetrics(metrics, previewSize, typo.rowMarginEm, innerH);
        let lines = this._wrapPreviewLines(composeText, maxW, typo, previewSize, lookup);
        let maxLines = Math.max(1, Math.floor(innerH / grid.rowPitch));

        while (lines.length > maxLines && previewSize > 20) {
            previewSize = Math.max(20, previewSize * 0.92);
            grid = this._rowGridMetrics(metrics, previewSize, typo.rowMarginEm, innerH);
            lines = this._wrapPreviewLines(composeText, maxW, typo, previewSize, lookup);
            maxLines = Math.max(1, Math.floor(innerH / grid.rowPitch));
        }

        const lineCount = Math.min(lines.length, maxLines);
        const composeSpaceState = { n: 0 };
        const composeWordState = { n: 0 };
        const composeAnchorNoiseState = { n: 0 };
        for (let i = 0; i < lineCount; i += 1) {
            const baselineY = this._rowBaselineY(
                stripH, innerH, i, grid.rowPitch, grid.ascPx, grid.descPx, lineCount,
            );
            this._drawComposedLine(
                ctx, lines[i], padX, baselineY, lookup, upm, previewSize, typo, F,
                composeSpaceState, composeWordState, composeAnchorNoiseState,
            );
        }

        // Capture to bitmap asynchronously; subsequent renders with same key will blit
        createImageBitmap(ctx.canvas).then((bmp) => {
            if (this._previewCache) {
                this._previewCache.bitmap?.close?.();
                this._previewCache = { bitmap: bmp, key: cacheKey };
            }
        }).catch(() => {});
    }

    /** Invalidate the preview cache (call when library changes). */
    _invalidatePreviewCache() {
        this._previewCache.bitmap?.close?.();
        this._previewCache = { bitmap: null, key: '' };
    }

    /**
     * @returns {Array<{ type:string, sortKey:string, drawing:object }>}
     */
    _getAtlasEntries() {
        const entries = [];
        const seen = new Set();

        for (const p of this._session.queue.prompts ?? []) {
            const rec = this._latestDrawingRecord(p.id);
            if (!rec) continue;
            const text = String(p.text ?? rec.promptText ?? '');
            entries.push({
                type:    String(p.type ?? 'single'),
                sortKey: text,
                drawing: rec,
                captureGeometry: this._captureGeometryForAtlas(rec, text, p.type),
            });
            seen.add(p.id);
        }

        for (const rec of Object.values(this._session.library?.drawings ?? {})) {
            if (!rec?.strokes?.length || !rec.promptId || seen.has(rec.promptId)) continue;
            const text = String(rec.promptText ?? '');
            entries.push({
                type:    'extra',
                sortKey: text,
                drawing: rec,
                captureGeometry: this._captureGeometryForAtlas(rec, text, 'extra'),
            });
            seen.add(rec.promptId);
        }

        const rank = (t) => {
            const order = { single: 0, digraph: 1, trigraph: 2, hardpair: 3, variation: 4, extra: 5 };
            return order[t] ?? 9;
        };
        entries.sort((a, b) => {
            const dr = rank(a.type) - rank(b.type);
            if (dr !== 0) return dr;
            return a.sortKey.localeCompare(b.sortKey);
        });

        const lookup = this._drawingLookupByText();
        if (this._adapterFont && !this._hasCapturedSpaceGlyph(lookup)) {
            const typo = this._typography();
            const metrics = Adapter.getMetrics(this._adapterFont);
            const bounds = computeSingleGlyphAdvanceBounds(
                (text) => this._runAdvancePx(text, 0, 0, 1, typo),
                lookup,
            );
            const glyphs = buildSyntheticSpaceGlyphs(bounds, {
                upm: metrics.unitsPerEm,
                fontSize: typo.traceFontSize,
                metrics,
            });
            for (const g of glyphs) {
                entries.push({
                    type:    'variation',
                    sortKey: g.promptText ?? `·${g.syntheticSpaceVariant}`,
                    drawing: g,
                    captureGeometry: g.captureGeometry,
                });
            }
            entries.sort((a, b) => {
                const dr = rank(a.type) - rank(b.type);
                if (dr !== 0) return dr;
                return a.sortKey.localeCompare(b.sortKey);
            });
        }

        return entries;
    }

    _applyGuidesToCanvas(selection) {
        const defs = ['BASELINE', 'DESC', 'XH', 'CAP', 'REF', 'ASC', 'ASHADE', 'LFT', 'RGT', 'BOX'];
        const raw = Array.isArray(selection)
            ? selection.filter((/** @type {string} */ v) =>
                defs.includes(String(v)),
            )
            : null;
        const activeSet = raw === null || raw.length === 0 ? [...DEFAULT_GUIDES] : raw;
        const s = new Set(activeSet);

        this._captureCanvas?.setOverlayToggles({
            baseline:       s.has('BASELINE'),
            descender:      s.has('DESC'),
            xHeight:        s.has('XH'),
            capHeight:      s.has('CAP'),
            refGlyph:       s.has('REF'),
            ascender:       s.has('ASC'),
            ascenderShade:  s.has('ASHADE'),
            leftBound:      s.has('LFT'),
            rightBound:     s.has('RGT'),
            bbox:           s.has('BOX'),
        });
    }

    async _tryRestoreSession() {
        try {
            const record = await Store.getActive();
            if (!record) {
                window.debugLog('TOOLS', '[GlyphBuilder] No persisted session.');
                return;
            }
            this._session.library     = record.payload;
            this._fontBytes   = record.fontBytes;
            this._adapterFont = await Adapter.loadFromBytes(record.fontBytes);
            this._session.queue  = this._session.library.queueState;
            await this._rebuildFontDropdown();
            const pick = this._session.library.referenceFont?.pickValue ?? this._guessPickToken(this._session.library.referenceFont?.name);
            if (pick) {
                this.tool.values.fontFamily = pick;
            }
            this._refreshFontCapabilities();
            this._captureCanvas?.setFontMetrics(this._session.library.referenceFont.metrics);
            if (this._session.library.settings) {
                this._applyTypographyToToolValues(this._session.library.settings);
                this._applyInkViewToToolValues(this._session.library.settings);
                this._applyPreviewSettingsToToolValues(this._session.library.settings);
                this._applyAnchorNoiseToToolValues(this._session.library.settings);
                const lockOn = !!this._session.library.settings.typographyLock;
                this.tool?.setValue?.(
                    'typographyLock',
                    lockOn ? ['lock'] : [],
                );
            }
            this._applyTypographyLockUI();
            this._applyFontCapabilitiesUI();
            this._applyGuidesToCanvas(this.tool.values['_guides']);
            this._applyInkViewToCanvas();
            this._updatePromptUI();
            this._renderCurrentPrompt();
            window.debugLog('TOOLS', '[GlyphBuilder] Session restored');
        } catch (err) {
            console.error('[GlyphBuilder] Session restore failed:', err);
            this._session.library = this._emptyLibrary();
            this._session.queue = this._session.library.queueState;
            await this._rebuildFontDropdown();
        }
    }

    _guessPickToken(fname) {
        if (!fname) return null;
        if (GF_CURSIVE.includes(fname)) return `gf:${fname}`;
        return `sf:${fname}`;
    }

    async _rebuildFontDropdown() {
        const dd = this.tool?.components.get('fontFamily');
        if (!dd?.setOptions) return;

        const families = await detectSystemFonts();
        const opts = [{ value: '__noop__', label: 'REFERENCE FONT' }];
        families.forEach((name) =>
            opts.push({ value: `sf:${name}`, label: String(name).toUpperCase() }),
        );
        opts.push({ separator: true, label: 'GOOGLE OPTIONAL' });
        GF_CURSIVE.forEach((name) =>
            opts.push({ value: `gf:${name}`, label: name.toUpperCase() }),
        );
        dd.setOptions(opts);

        let cur =
            this._session.library.referenceFont?.pickValue
            ?? (this.tool?.values?.fontFamily && this.tool.values.fontFamily !== '__noop__'
                ? this.tool.values.fontFamily
                : '__noop__');

        if (cur === '__upload__') cur = '__noop__';
        const hasCur = opts.some((o) => !o.separator && String(o?.value ?? '') === String(cur));
        if (!hasCur) cur = '__noop__';

        if (typeof dd.setValueSilent === 'function') {
            dd.setValueSilent(cur);
        } else {
            try { dd.setValue(cur); } catch (_) {
                try { dd.setValue('__noop__'); } catch (_) {}
            }
        }
    }

    async _loadFromPick(pref) {
        if (!pref || pref === '__noop__' || pref === '__upload__') return;
        try {
            if (pref.startsWith('gf:')) {
                const name = pref.slice(3);
                const ada = await Adapter.loadFromGoogle(name);
                await this._applyLoadedFont(
                    ada, Adapter.getFontBytes(ada), pref, name,
                );
                return;
            }
            if (pref.startsWith('sf:')) {
                const name = pref.slice(3);
                const ada = await Adapter.loadFromLocal(name);
                await this._applyLoadedFont(
                    ada, Adapter.getFontBytes(ada), pref, name,
                );
                return;
            }
        } catch (err) {
            console.error('[GlyphBuilder] Font load failed:', err);
            await this._handleFontLoadFailure(err, pref);
            this._showError('FONT LOAD FAILED — USE FONT FILE BUTTON', err);
        }
    }

    /**
     * Clear adapter + session font after a failed pick (e.g. TTC-only local face).
     * @param {Error|unknown} err
     * @param {string} [attemptedPick]
     */
    async _handleFontLoadFailure(err, attemptedPick = '') {
        this._adapterFont = null;
        this._fontBytes = null;
        this._fontCapabilities = null;
        this._session.library.referenceFont = null;
        this._session.queue = { prompts: [], currentIndex: 0, skipDeferred: [], history: [] };
        this._session.library.queueState = this._session.queue;

        const detail = err?.message || String(err ?? '');
        const short = detail.length > 120 ? `${detail.slice(0, 117)}…` : detail;
        this.tool?.setValue?.('fontStatus', short || 'FONT LOAD FAILED');
        if (this.tool) this.tool.values.fontFamily = '__noop__';

        await this._rebuildFontDropdown();
        this._idleViewportChrome(
            attemptedPick
                ? `FONT NOT LOADED — ${short.toUpperCase()}`
                : null,
        );
        this._updatePromptUI();
        this.tool?.draw?.();
    }

    async _applyLoadedFont(adapter, bytes, pickValue, displayName) {
        this._invalidatePreviewCache();
        this._adapterFont = adapter;
        this._fontBytes   = bytes;
        this._session.library.referenceFont = {
            name:     displayName,
            hash:     await Adapter.hashBytes(bytes),
            metrics:  Adapter.getMetrics(adapter),
            pickValue,
        };
        this._refreshFontCapabilities();
        if (this.tool) this.tool.values.fontFamily = pickValue;
        this.tool?.setValue?.('fontStatus', '');
        this._captureCanvas?.setFontMetrics(this._session.library.referenceFont.metrics);
        if (!this._session.library.settings?.traceFontSize) {
            this._applyTypographyToToolValues(DEFAULT_TYPOGRAPHY);
            this._applyInkViewToToolValues(DEFAULT_INK_VIEW);
            this._applyInkViewToCanvas();
            this._bootstrapTraceFontSizeFromViewport(true);
        }
        this._syncLibraryTypography();
        this._applyFontCapabilitiesUI();
        this._buildQueue();
        await this._autosave();
        window.debugLog('TOOLS', `[GlyphBuilder] Font ready: ${displayName}`);
    }

    async _loadFontFromUpload(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const ada = await Adapter.loadFromBytes(arrayBuffer);
            const bytes = Adapter.getFontBytes(ada);
            await this._applyLoadedFont(
                ada,
                bytes,
                '__upload__',
                file.name.replace(/\.[^.]+$/, ''),
            );
        } catch (err) {
            console.error('[GlyphBuilder] Font file load failed:', err);
            await this._handleFontLoadFailure(err);
            this._showError('FONT FILE INVALID', err);
        }
    }

    _buildQueue() {
        if (!this._adapterFont) return;
        const pairs = Adapter.getKerningPairs(this._adapterFont);
        const hasGlyph = (ch) => Adapter.hasGlyph(this._adapterFont, ch);
        const prompts =
            buildPromptSet(this._adapterFont, hasGlyph, pairs,
                { phasesEnabled: true, hardPairCount: 50 });
        this._session.queue = { prompts, currentIndex: 0, skipDeferred: [], history: [] };
        this._session.library.queueState = this._session.queue;
        if (prompts.length === 0) {
            window.debugLog('TOOLS', '[GlyphBuilder] Prompt queue empty — font may lack required glyphs.');
        }
        this._updatePromptUI();
        this._renderCurrentPrompt();
    }

    _idleViewportChrome(headerLineOverride = null) {
        const cc = this._captureCanvas;
        if (!cc) return;

        const fontName =
            (
                this._session.library.referenceFont?.name
                ?? (this.tool?.values?.fontFamily && this.tool.values.fontFamily !== '__noop__'
                    ? String(this.tool.values.fontFamily).replace(/^gf:|sf:/u, '').replace(/\+/gu, ' ')
                    : '')
            ).trim();

        cc.setRails({
            headerLine: headerLineOverride
                ?? (
                    fontName.length
                        ? `NO ACTIVE PROMPT · ${fontName.toUpperCase()}`
                        : 'NO FONT LOADED — PICK REFERENCE FONT (SESSION) OR IMPORT (EXPORT ▾)'
                ),
            footerLine: RAIL_FOOTER,
        });
        cc.setPromptBoundingBox(null);
        cc.setLayoutMarks(null);
        cc.setPrompt(null);
        cc.setFontPath('');
        cc.setUpcoming([]);
        cc.setPrior([]);
        cc.setInactiveRows([]);
        cc.setGhostInk([]);
        cc.setFontMetrics(this._adapterFont ? Adapter.getMetrics(this._adapterFont) : null);
    }

    /**
     * Rebuild row paths, guides, and canvas chrome for the current queue state.
     * @param {{ redraw?: boolean }} [options] redraw:false when called from onDraw (avoid loop).
     */
    _renderCurrentPrompt(options = {}) {
        const { redraw = true } = options;
        if (!this._captureCanvas) return;

        this._syncCaptureCanvasSizeFromTool();
        const { w, h } = this._logicalCanvasCssSize();
        if (w > 0 && h > 0) {
            this._session.layoutCanvasW = w;
            this._session.layoutCanvasH = h;
        }
        const lay = this._resolvePromptLayout();
        if (!lay) {
            if (!this._adapterFont || !currentPrompt(this._session.queue)) {
                this._idleViewportChrome();
            }
            if (redraw) this.tool?.draw?.();
            return;
        }

        const prompt = currentPrompt(this._session.queue);
        const fontLabel = (
            this._session.library.referenceFont?.name ?? ''
        ).trim().toUpperCase();

        if (!this._adapterFont || !prompt) {
            this._idleViewportChrome();
            this.tool?.draw?.();
            return;
        }

        const metrics = Adapter.getMetrics(this._adapterFont);
        const typo = this._typography();
        const active = lay.active;
        this._captureCanvas.setPrompt({
            text: active.text,
            glyphPathD: active.pathD,
            advance: active.advanceX,
        });
        this._captureCanvas.setFontMetrics(metrics);

        const inactiveRows = lay.rows
            .filter((r) => !r.isActive && r.pathD)
            .map((r) => ({
                pathD:     r.pathD,
                left:      r.originX,
                baselineY: r.baselineY,
                advanceX:  r.advanceX,
            }));
        this._captureCanvas.setInactiveRows(inactiveRows);
        this._captureCanvas.setPrior([]);
        this._captureCanvas.setUpcoming([]);

        const bbPx = Adapter.boundingBoxPromptCanvas(
            this._adapterFont, active.text, active.originX, active.baselineY, lay.fontSize,
        );
        if (bbPx) {
            this._captureCanvas.setPromptBoundingBox({
                x: bbPx.xMin,
                y: bbPx.yMin,
                w: Math.max(0, bbPx.xMax - bbPx.xMin),
                h: Math.max(0, bbPx.yMax - bbPx.yMin),
            });
        } else this._captureCanvas.setPromptBoundingBox(null);

        this._captureCanvas.setLayoutMarks({
            left: active.originX,
            baselineY: active.baselineY,
            advanceX: active.advanceX,
            fontSize: lay.fontSize,
            skewDeg: typo.effectiveSkewDeg,
        });
        const caps = this._fontCapabilities;
        this._captureCanvas.setReferenceStyle({
            skewDeg: typo.effectiveSkewDeg,
            underline: typo.underline,
            underlinePosition: caps?.underlinePosition ?? null,
            underlineThickness: caps?.underlineThickness ?? null,
        });

        const v = Number(prompt.variationsDrawn ?? 0);
        const rowInfo = `${lay.rows.length}/${lay.maxRows} ROWS`;
        this._captureCanvas.setRails({
            headerLine:
                `"${active.text}" · ${String(prompt.type).toUpperCase()} · V${v + 1} · ${fontLabel || 'UNKNOWN FONT'} · ${rowInfo}`,
            footerLine: RAIL_FOOTER,
        });

        this._captureCanvas.setGhostInk(
            this._ghostInkForCompletedRows(lay, metrics.unitsPerEm),
        );
        this._syncActiveInk(prompt, lay, metrics.unitsPerEm);
        if (redraw) this.tool?.draw?.();
    }

    async _saveAndNext() {
        if (this._session.view !== 'capture') return;
        const prompt = currentPrompt(this._session.queue);
        if (!prompt) return;

        const strokes = this._captureCanvas ? this._captureCanvas.getStrokes() : [];
        if (strokes.length === 0) { this._skipPrompt(); return; }

        const lay = this._resolvePromptLayout();
        if (!lay) return;

        const metrics = Adapter.getMetrics(this._adapterFont);
        const captureGeometry = this._captureGeometryFromLayout(lay, metrics, prompt.type);
        const normStrokes = normaliseStrokes(
            strokes,
            promptGeometryFromCapture(captureGeometry),
            captureGeometry.fontAdvanceWidth,
        );
        const drawingMetrics = computeDrawingMetrics(normStrokes, captureGeometry.fontAdvanceWidth);
        const drawingId        = `drawing_${prompt.id}_v${prompt.variationsDrawn + 1}`;

        this._session.library.drawings = this._session.library.drawings ?? {};
        this._session.library.drawings[drawingId] = {
            id:         drawingId,
            promptId:   prompt.id,
            promptText: prompt.text,
            fontHash:   this._session.library.referenceFont?.hash || '',
            capturedAt: Date.now(),
            strokes:    normStrokes,
            metrics:    drawingMetrics,
            captureGeometry,
        };

        this._session.queue = advance(markDrawn(this._session.queue, prompt.id));
        this._session.library.queueState = this._session.queue;
        this._session.activeInkPromptId = null;
        this._session.inkRestoreSuppressed = null;
        if (this._captureCanvas) this._captureCanvas.clearInk();
        this._session.dirty = false;
        this._invalidatePreviewCache();
        this._updatePromptUI();
        this._renderCurrentPrompt();

        await this._autosave();
        window.debugLog('TOOLS', `[GlyphBuilder] Saved: ${drawingId}`);
    }

    _skipPrompt() {
        if (this._session.view !== 'capture') return;
        const prompt = currentPrompt(this._session.queue);
        if (!prompt) return;
        this._session.queue = advance(deferSkip(this._session.queue, prompt.id));
        this._session.library.queueState = this._session.queue;
        if (this._captureCanvas) this._captureCanvas.clearInk();
        this._session.dirty = false;
        this._updatePromptUI();
        this._renderCurrentPrompt();
        this._autosave();
    }

    _updatePromptUI() {
        const prompt = currentPrompt(this._session.queue);
        if (!this.tool) return;
        const set = (key, val) => { try { this.tool.setValue(key, val); } catch (_) {} };
        const pct = `${coveragePercent(this._session.queue)}%`;
        const modeWord = prompt ? this._modeWord(prompt.type) : '—';
        const glyphs = prompt ? `"${prompt.text}"` : '—';
        set('sessionLine', `${modeWord} — ${glyphs} — ${pct}`);
        set('promptLabel',   prompt ? `"${prompt.text}"` : '—');
        set('phaseLabel',    prompt ? prompt.type.toUpperCase() : '—');
        set('coverageLabel', pct);
    }

    async _autosave() {
        if (!this._fontBytes) return;
        this._syncLibraryTypography();
        try {
            await Store.putActive(this._session.library, this._fontBytes);
        } catch (err) {
            console.error('[GlyphBuilder] Autosave failed:', err);
            this._showError('AUTOSAVE FAILED', err);
        }
    }

    async _loadJSZip() {
        if (!window.AssetLoader?.ensureJSZip) {
            throw new Error('AssetLoader not available — JSZip cannot be loaded');
        }
        return window.AssetLoader.ensureJSZip();
    }

    async _exportZip() {
        try {
            if (!this._fontBytes) throw new Error('No font loaded to export.');
            const JSZip = await this._loadJSZip();
            const zip = new JSZip();
            zip.file(
                'manifest.json',
                JSON.stringify({
                    version: 1,
                    exportedAt: new Date().toISOString(),
                    fontName:   this._session.library.referenceFont?.name || 'unknown',
                    fontHash:   this._session.library.referenceFont?.hash || '',
                    drawingCount: Object.keys(this._session.library.drawings || {}).length,
                }, null, 2),
            );
            zip.file('font/reference.ttf', this._fontBytes);
            zip.file('queue/state.json', JSON.stringify(this._session.library.queueState, null, 2));

            const drawings = this._session.library.drawings || {};
            const singles = zip.folder('drawings/singles');
            const digraphs = zip.folder('drawings/digraphs');
            const trigraphs = zip.folder('drawings/trigraphs');
            const hardpairs = zip.folder('drawings/hardpairs');
            const variations = zip.folder('drawings/variations');
            const anchors = zip.folder('anchors');

            for (const [id, rec] of Object.entries(drawings)) {
                const p = this._session.queue.prompts.find((x) => x.id === rec.promptId);
                const type = p?.type || 'singles';
                const folder = {
                    single: singles,
                    digraph: digraphs,
                    trigraph: trigraphs,
                    hardpair: hardpairs,
                    variation: variations,
                }[type] || singles;
                folder.file(`${id}.json`, JSON.stringify(rec, null, 2));
                const allAnchors = rec.strokes.flatMap((s) => s.anchors || []);
                if (allAnchors.length) {
                    anchors.file(`${id}_anchors.json`, JSON.stringify(allAnchors, null, 2));
                }
            }

            const blob = await zip.generateAsync({ type: 'blob' });
            ExportUtils.downloadBlob(blob, `glyph-library-${Date.now()}.zip`);
            window.debugLog('TOOLS', '[GlyphBuilder] ZIP exported');
        } catch (err) {
            console.error('[GlyphBuilder] ZIP export failed:', err);
            this._showError('ZIP EXPORT FAILED', err);
        }
    }

    _exportPng() {
        try {
            const canvas = this.tool?.canvas;
            if (!canvas) throw new Error('Canvas not ready.');
            ExportUtils.exportCanvasPNG(canvas, TOOL_CONFIG.title, {
                filename:
                    `cursive-glyph-${new Date().toISOString().replace(/[:]/g, '-').slice(0, 19)}Z.png`,
            });
            window.debugLog('TOOLS', '[GlyphBuilder] PNG exported');
        } catch (err) {
            console.error('[GlyphBuilder] PNG export failed:', err);
            this._showError('PNG EXPORT FAILED', err);
        }
    }

    _exportComposedSvg() {
        try {
            const lookup = this._drawingLookupByText();
            if (lookup.size === 0) throw new Error('No captured glyphs to export.');
            if (!this._adapterFont) throw new Error('No reference font loaded.');

            const typo = this._typography();
            const metrics = Adapter.getMetrics(this._adapterFont);
            const upm = metrics.unitsPerEm;
            const canvas = this.tool?.canvas;
            const w = canvas?.width ?? 800;
            const h = canvas?.height ?? 600;
            const F = Number(this.tool?.F) || 14;
            const stripH = F * 2;
            const innerH = Math.max(F, h - stripH * 2);
            const padX = Math.max(F, Math.round(w * 0.04));
            const maxW = Math.max(F, w - padX * 2);
            const ink = this._inkView();
            const lineWidth = ink.inkLineWidthPx;

            const composeText = this._previewText().trim();
            if (!composeText) throw new Error('Enter compose text in VIEW → Preview.');

            const advanceOpts = this._composeAdvanceOptions(typo, lookup, this._previewFontSize());
            const anchorNoise = this._anchorNoiseOptions();

            const composed = composeTextToVectors(composeText, lookup, {
                fontSize: this._previewFontSize(),
                upm,
                metrics,
                ...advanceOpts,
                anchorNoise,
                lineWidth,
                perturbation: { baselineAmplitude: 0.02, sizeAmplitude: 0.05, decay: 0.85 },
                seed: Date.now(),
                wrapWidth: maxW,
                layout: {
                    padX,
                    stripH,
                    innerH,
                    rowMarginEm: typo.rowMarginEm,
                    minFontSize: 20,
                },
            });

            const svg = buildSVGDocument(composed, {
                stroke: '#000000',
                strokeWidth: lineWidth,
                lineCap: ink.inkLineCap,
            });

            ExportUtils.exportSVG(svg, TOOL_CONFIG.title, {
                filename:
                    `cursive-handwriting-${new Date().toISOString().replace(/[:]/g, '-').slice(0, 19)}Z.svg`,
            });
            window.debugLog('TOOLS', '[GlyphBuilder] SVG exported');
        } catch (err) {
            console.error('[GlyphBuilder] SVG export failed:', err);
            this._showError('SVG EXPORT FAILED', err);
        }
    }

    async _importZip(file) {
        try {
            const JSZip = await this._loadJSZip();
            const zip = await JSZip.loadAsync(await file.arrayBuffer());

            const manifestFile = zip.file('manifest.json');
            if (!manifestFile) throw new Error('ZIP missing manifest.json');
            const manifestParsed = JSON.parse(await manifestFile.async('string'));

            const fontFile = zip.file('font/reference.ttf');
            if (!fontFile) throw new Error('ZIP missing font/reference.ttf');
            const fontBytes = await fontFile.async('arraybuffer');

            const queueFile = zip.file('queue/state.json');
            const queueState = queueFile
                ? JSON.parse(await queueFile.async('string'))
                : {
                    prompts: [], currentIndex: 0,
                    skipDeferred: [], history: [],
                };

            const drawings = {};
            const drawingPaths = Object.keys(zip.files).filter(
                (name) =>
                    zip.files[name]
                    && !zip.files[name].dir
                    && /^drawings\/[^\\]+\.json$/u.test(name)
                    && name.indexOf('_anchors') === -1,
            );

            for (const path of drawingPaths) {
                const fObj = zip.file(path);
                if (!fObj) continue;
                const data = JSON.parse(await fObj.async('string'));
                if (data && data.id) drawings[data.id] = data;
            }

            const ada = await Adapter.loadFromBytes(fontBytes);
            this._adapterFont   = ada;
            this._fontBytes     = Adapter.getFontBytes(ada);
            this._session.library = {
                referenceFont: {
                    name:     manifestParsed.fontName ?? 'library',
                    hash:     manifestParsed.fontHash || '',
                    metrics:  Adapter.getMetrics(ada),
                    pickValue:'__noop__',
                },
                queueState,
                drawings,
            };
            this._session.queue = queueState;

            await this._rebuildFontDropdown();
            this._captureCanvas?.setFontMetrics(this._session.library.referenceFont.metrics);
            this._applyGuidesToCanvas(this.tool.values['_guides']);
            this._captureCanvas?.clearInk();
            this._updatePromptUI();
            this._renderCurrentPrompt();
            await this._autosave();
            window.debugLog('TOOLS', '[GlyphBuilder] ZIP imported');
        } catch (err) {
            console.error('[GlyphBuilder] ZIP import failed:', err);
            this._showError('ZIP IMPORT FAILED', err);
        }
    }

    _handleUpdate(key, value, _values) {
        window.debugLog('TOOLS', `[GlyphBuilder] Update: ${key}`);

        if (
            this._isTypographyLocked()
            && TYPOGRAPHY_CONTROL_KEYS.includes(key)
        ) {
            return;
        }

        switch (key) {
            case '_canvasResize': {
                const w = Number(value?.width), h = Number(value?.height);
                if (w > 0 && h > 0) {
                    this._captureCanvas?.setSize(w, h);
                    this._applyCanvasPanMode(this.tool?.values?.canvasPan ?? []);
                    this._renderCurrentPrompt();
                }
                break;
            }
            case 'newLibrary':
                this._confirmAndNewLibrary();
                break;
            case 'prevPrompt':
                this._goPrevious();
                break;
            case 'fontFamily':
                void this._loadFromPick(value);
                break;
            case 'saveNext':
                void this._saveAndNext();
                break;
            case 'skipPrompt':
                this._skipPrompt();
                break;
            case 'clearInk': {
                const p = currentPrompt(this._session.queue);
                if (p?.id) this._session.inkRestoreSuppressed = p.id;
                this._captureCanvas?.clearInk();
                break;
            }
            case '_guides':
                this._applyGuidesToCanvas(Array.isArray(value) ? value : []);
                break;
            case 'canvasPan':
                this._applyCanvasPanMode(Array.isArray(value) ? value : []);
                break;
            case 'inkLineWidthPx':
            case 'inkLineCap':
                this._syncLibraryTypography();
                this._applyInkViewToCanvas();
                break;
            case 'anchorNoiseAmplitudePx':
            case 'anchorNoiseScale':
            case 'anchorNoiseOctaves':
            case 'anchorNoisePersistence':
            case 'anchorNoiseLacunarity':
            case 'anchorNoiseFn':
            case 'anchorNoiseSeed':
                this._invalidatePreviewCache();
                this._syncLibraryTypography();
                if (this._session.view === 'preview') {
                    this.tool?.draw?.();
                }
                void this._autosave();
                break;
            case 'previewText':
            case 'previewFontSize':
            case 'segmentTemperature':
                this._invalidatePreviewCache();
                this._syncLibraryTypography();
                if (this._session.view === 'preview') {
                    this.tool?.draw?.();
                }
                void this._autosave();
                break;
            case 'segmentRerollNgrams': {
                const roll = (Math.floor(Math.random() * 0xffffffff) >>> 0) || 1;
                if (this.tool?.values) this.tool.values.segmentRoll = roll;
                this._session.library.settings = {
                    ...(this._session.library.settings || {}),
                    segmentRoll: roll,
                };
                this._invalidatePreviewCache();
                this._syncLibraryTypography();
                if (this._session.view === 'preview') {
                    this.tool?.draw?.();
                }
                void this._autosave();
                break;
            }
            case 'traceFontSize':
            case 'rowMarginEm':
            case 'letterSpacingEm':
            case 'kerningAdjust':
            case 'skewDeg':
            case 'typographyStyle': {
                this._invalidatePreviewCache();
                this._syncLibraryTypography();
                this._renderCurrentPrompt();
                break;
            }
            case 'typographyLock':
                this._applyTypographyLockUI();
                this._syncLibraryTypography();
                void this._autosave();
                break;
        }
    }

    _confirmAndNewLibrary() {
        const drawingCount = Object.keys(this._session.library.drawings || {}).length;
        const hasFont = !!this._adapterFont;
        const msg = drawingCount > 0
            ? 'Start a new library? All saved drawings will be deleted. This cannot be undone.'
            : hasFont
                ? 'Start a new library? The prompt queue will restart from the beginning. Saved drawings are cleared.'
                : 'Start a new library? Clears the autosave slot.';
        try {
            if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
                if (!window.confirm(msg)) return;
            }
        } catch (_) {
            return;
        }
        void this._applyNewLibrary();
    }

    async _applyNewLibrary() {
        await Store.clearActive();

        const keepRef = this._session.library.referenceFont;
        const keepAda = this._adapterFont;
        const keepBytes = this._fontBytes;
        const keepPick = this.tool?.values?.fontFamily;

        this._session.library = this._emptyLibrary();
        this._session.queue = this._session.library.queueState;
        this._session.dirty = false;

        if (keepAda && keepRef) {
            this._adapterFont = keepAda;
            this._fontBytes = keepBytes;
            this._session.library.referenceFont = { ...keepRef };
            if (keepPick && keepPick !== '__noop__') this.tool.values.fontFamily = keepPick;
            this._applyTypographyToToolValues(DEFAULT_TYPOGRAPHY);
            this._applyInkViewToToolValues(DEFAULT_INK_VIEW);
            this._applyPreviewSettingsToToolValues(DEFAULT_PREVIEW_SETTINGS);
            this._applyAnchorNoiseToToolValues(DEFAULT_ANCHOR_NOISE);
            this._applyInkViewToCanvas();
            this._bootstrapTraceFontSizeFromViewport(true);
            this._refreshFontCapabilities();
            this._captureCanvas?.setFontMetrics(Adapter.getMetrics(keepAda));
            this._applyFontCapabilitiesUI();
            this._buildQueue();
            this._session.library.queueState = this._session.queue;
            await this._autosave();
            this._captureCanvas?.clearInk();
            this._updatePromptUI();
            this._renderCurrentPrompt();
            try { this.tool?.setStatus?.('NEW LIBRARY — QUEUE RESTARTED'); } catch (_) {}
            this.tool?.draw?.();
            return;
        }

        await this._resetLibrary();
    }

    _goPrevious() {
        if (!this._session.queue || this._session.queue.currentIndex <= 0) return;
        this._session.queue = stepPrevious(this._session.queue);
        this._session.library.queueState = this._session.queue;
        this._session.activeInkPromptId = null;
        this._session.inkRestoreSuppressed = null;
        this._session.dirty = false;
        this._updatePromptUI();
        this._renderCurrentPrompt();
    }

    async _resetLibrary() {
        this._session.library    = this._emptyLibrary();
        this._session.queue = { prompts: [], currentIndex: 0, skipDeferred: [], history: [] };
        this._adapterFont = null;
        this._fontBytes   = null;
        if (this._captureCanvas) {
            this._captureCanvas.clearInk();
            this._captureCanvas.setPrior([]);
            this._captureCanvas.setUpcoming([]);
            this._captureCanvas.setGhostInk([]);
            this._captureCanvas.setFontMetrics(null);
            this._idleViewportChrome();
        }
        this._session.dirty = false;
        const ddReset = this.tool?.components?.get('fontFamily');
        if (ddReset && typeof ddReset.setValueSilent === 'function') {
            ddReset.setValueSilent('__noop__');
        }
        if (this.tool) this.tool.values.fontFamily = '__noop__';
        this._session.library.queueState = this._session.queue;
        await this._rebuildFontDropdown();
        this._applyPreviewSettingsToToolValues(this._session.library.settings);
        this._applyAnchorNoiseToToolValues(this._session.library.settings);
        this._applyGuidesToCanvas(this.tool.values['_guides']);
        this._invalidatePreviewCache();
        this._updatePromptUI();
        this._renderCurrentPrompt();
        try { this.tool?.setStatus?.('NEW LIBRARY — PICK FONT IN SESSION OR IMPORT ZIP'); } catch (_) {}
        this.tool?.draw?.();
    }

    _emptyLibrary() {
        return {
            referenceFont: null,
            queueState: { prompts: [], currentIndex: 0,
                skipDeferred: [], history: [] },
            drawings: {},
            settings: {
                ...DEFAULT_TYPOGRAPHY,
                ...DEFAULT_INK_VIEW,
                ...DEFAULT_PREVIEW_SETTINGS,
                typographyLock: false,
            },
            stats: {},
        };
    }

    _promptImportZip(file) {
        const has = Object.keys(this._session.library.drawings || {}).length > 0;
        if (has) {
            this._openModalConfirm(
                'Import ZIP? This will overwrite the current library.',
                () => void this._importZip(file),
                () => {},
            );
        } else void this._importZip(file);
    }

    _onKeyDown(e) {
        if (!this.tool) return;
        if (this._session.view !== 'capture') return;
        const panOn = Array.isArray(this.tool.values?.canvasPan)
            && this.tool.values.canvasPan.includes('pan');
        if (panOn) return;

        const mod = e.ctrlKey || e.metaKey;
        const key = typeof e.key === 'string' ? e.key.toLowerCase() : '';

        if (typeof this.tool.isFocusInForm === 'function' && this.tool.isFocusInForm()) {
            const onCanvas = this.tool.isFocusOnCanvas?.() ?? false;
            if (!onCanvas) return;
        }
        if (
            typeof this.tool.isShortcutScopeActive !== 'function'
            || !this.tool.isShortcutScopeActive(true)
        ) return;

        if (key === 'enter' && !e.shiftKey && !e.altKey) {
            e.preventDefault();
            void this._saveAndNext();
        } else if (key === 'escape') {
            e.preventDefault();
            this._skipPrompt();
        } else if (mod && e.shiftKey && key === 'z') {
            e.preventDefault();
            this._captureCanvas?.redo();
        } else if (mod && !e.shiftKey && key === 'z') {
            e.preventDefault();
            this._captureCanvas?.undo();
        } else if (key === 'backspace' && !mod && !e.altKey) {
            e.preventDefault();
            const p = currentPrompt(this._session.queue);
            if (p?.id) this._session.inkRestoreSuppressed = p.id;
            this._captureCanvas?.clearInk();
        } else if (
            (key === 'arrowleft' || key === 'arrowright')
            && !mod
            && !e.altKey
        ) {
            e.preventDefault();
            e.stopPropagation();
            if (key === 'arrowleft') this._goPrevious();
            else void this._saveAndNext();
        }
    }

    _hideToolOverlay() {
        try {
            if (typeof this.tool?.hideFloatingOverlay === 'function') {
                this.tool.hideFloatingOverlay();
            }
        } catch (_) {}
    }

    _showError(title, err) {
        if (!window.ComponentLibrary?.ErrorPane) return;

        const pane = new window.ComponentLibrary.ErrorPane({
            title,
            detail: err?.message || String(err ?? ''),
            onDismiss: () => this._hideToolOverlay(),
        }, this.deps);

        if (typeof this.tool?.showFloatingOverlay === 'function') {
            this.tool.showFloatingOverlay(pane);
            return;
        }

        pane.destroy?.();
        console.error(`[GlyphBuilder] ${title}:`, err ?? '');
    }

    _openModalConfirm(msg, ok, cancel) {
        try {
            if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
                if (window.confirm(msg)) ok();
                else cancel();
                return;
            }
        } catch (_) {}

        const Lib = this.deps?.ComponentLibrary ?? ComponentLibrary;
        const ModalConfirm = Lib?.ModalConfirm;
        if (!ModalConfirm) {
            void ok?.();
            return;
        }

        const m = new ModalConfirm({
            message: msg,
            onConfirm: /** @param {*} _ */ () => { ok(); },
            onCancel:  /** @param {*} _ */ () => { cancel(); },
        }, this.deps);

        if (typeof this.tool?.showFloatingOverlay === 'function') {
            this.tool.showFloatingOverlay(m);
            if (m.element?.isConnected) return;
            try { m.destroy?.(); } catch (_) {}
        }

        void ok?.();
    }

    render() {}

    destroy() {
        if (typeof this._unregisterKeydown === 'function') {
            try { this._unregisterKeydown(); } catch (_) {}
        }
        this._unregisterKeydown = null;

        this._hideToolOverlay();

        if (this._captureCanvas) {
            this._captureCanvas.destroy();
            this._captureCanvas = null;
        }

        this._invalidatePreviewCache();

        if (this._atlasGrid) {
            this._atlasGrid.destroy();
            this._atlasGrid = null;
        }

        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }

        this._glyphToolbar = null;
    }
}

export default CursiveGlyphBuilderTool;
