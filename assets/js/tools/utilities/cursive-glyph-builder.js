/**
 * Cursive Glyph Builder — ToolBase shell for vector stroke capture over a reference font.
 *
 * @see blog/docs/pages/tools/utilities/cursive-glyph-builder.md — loaded into INFO panel.
 */

import { ToolBase } from '../core/tool-base.js';
import ComponentLibrary from '../../shared/component-library.js';
import { GlyphCaptureCanvas } from '../../shared/components/drawing/GlyphCaptureCanvas.js';
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
    peekUpcoming,
} from '../../shared/algorithms/typography/prompt-sequencer.js';
import { normaliseStrokes, computeDrawingMetrics } from '../../shared/algorithms/typography/stroke-capture.js';
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
    'NEXT ENTER · SKIP ESC · CLEAR INK (SIDEBAR) · UNDO CTRL+Z · REDO CTRL+SHIFT+Z · EXPORT ▾ (TOOLBAR)';

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
                ['button', 'Next',      { key: 'saveNext' }],
                ['button', 'Skip',      { key: 'skipPrompt' }],
                ['button', 'Clear Ink', { key: 'clearInk' }],
            ], { contentColumns: 3 }],
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
            ['Layout', [
                ['slider', 'Draw height', 0.4, 1.5, 0.05, {
                    key: 'drawHeightFraction',
                    withNumber: true,
                    value: 0.7,
                }],
            ]],
        ]],
    ],

    canvas: {
        displayMode:   'fit',
        fillContainer: true,
        enableZoom:    true,
        enablePan:     true,
    },
};

export class CursiveGlyphBuilderTool {
    constructor(container, deps = {}) {
        this.container = container;
        this.deps = { ComponentLibrary, ...deps };

        this._adapterFont   = null;
        this._fontBytes     = null;
        this._queueState    = { prompts: [], currentIndex: 0, skipDeferred: [], history: [] };
        this._library       = this._emptyLibrary();
        this._captureCanvas = null;
        this._dirty         = false;

        this.tool = null;
        this._glyphToolbar = null;
        this._fontDropdown = null;
        this._onKeyDown = this._onKeyDown.bind(this);
        this._unregisterKeydown = null;

        this.initialize();
    }

    async initialize() {
        try {
            const Lib = this.deps.ComponentLibrary;

            this._fontDropdown = new Lib.Dropdown({
                label:       '',
                options:     [{ value: '__noop__', label: 'REFERENCE FONT' }],
                value:       '__noop__',
                placeholder: 'REFERENCE FONT',
                onChange:    (v) => this._onFontDropdownChange(v),
            }, this.deps);

            this._glyphToolbar = new Lib.GlyphBuilderToolbar({
                fontDropdown: this._fontDropdown,
                displayMode:  'fit',
                infoFetchPath: DOC_MD_PATH,
                onDisplayModeChange: (mode) => {
                    this.tool?.setCanvasDisplayMode(mode);
                    this._syncCaptureCanvasSizeFromTool();
                    this._renderCurrentPrompt();
                },
                onExportPng: () => this._exportPng(),
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
                    if (this._glyphToolbar) tb.setTopBar(this._glyphToolbar);
                },
            }, this.deps);
            this.tool.onUpdate = (key, value, values) =>
                this._handleUpdate(key, value, values);

            if (this.container) {
                this.tool.mount(this.container);
            }

            this.tool.setValue('_guides', DEFAULT_GUIDES);
            this.tool.setValue('drawHeightFraction', 0.7);

            await this._rebuildFontDropdown();

            this._captureCanvas = new GlyphCaptureCanvas({
                width:          560,
                height:         392,
                heightFraction: 0.7,
                F:              this.tool.F || 14,
                fontMetrics:    null,
                prompt:         null,
                overlays:       {
                    baseline: true, descender: true, xHeight: true, capHeight: true,
                    ascender: false, refGlyph: true,
                    ascenderShade: false, bbox: false, leftBound: false, rightBound: false,
                },
                onStrokeEnd:   () => { this._dirty = true; },
                onDirtyChange: (dirty) => { this._dirty = dirty; },
                onRedraw:      () => { this.tool?.draw(); },
            }, this.deps);

            if (this.tool.canvas) this._captureCanvas.attach(this.tool.canvas);

            this.tool.onDraw = (ctx) => {
                if (this._captureCanvas && ctx) this._captureCanvas.draw(ctx);
            };
            this.tool.draw();

            this._syncCaptureCanvasSizeFromTool();
            queueMicrotask(() => this._syncCaptureCanvasSizeFromTool());

            this._applyGuidesToCanvas(this.tool.values['_guides']);

            await this._tryRestoreSession();

            this._renderCurrentPrompt();

            this._unregisterKeydown = this.tool.registerKeydown(this._onKeyDown);
        } catch (err) {
            this._showError('Initialisation failed', err);
        }
    }

    _onFontDropdownChange(value) {
        if (this.tool) this.tool.values.fontFamily = value;
        void this._loadFromPick(value);
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

    _syncCaptureCanvasSizeFromTool() {
        const canvas = this.tool?.canvas;
        const cap = this._captureCanvas;
        if (!canvas || !cap?.setSize) return;
        const w = canvas.width | 0;
        const h = canvas.height | 0;
        if (w > 0 && h > 0) cap.setSize(w, h);
    }

    /**
     * @returns {{
     *   cw:number, ch:number, padX:number, baselineY:number,
     *   fontSize:number, canvasAdvanceWidth:number
     * } | null}
     */
    _resolvePromptLayout() {
        const canvas = this.tool?.canvas;
        const cap = this._captureCanvas;
        if (!canvas || !cap) return null;

        const cw = Math.max(1, canvas.width | 0);
        const ch = Math.max(1, canvas.height | 0);
        const fracH = Number(this.tool.values.drawHeightFraction);
        const heightFrac = Number.isFinite(fracH) ? fracH : 0.7;
        const F = Number(this.tool.F) || 14;
        const padX = Math.max(F, Math.round(cw * (40 / 560)));
        const baselineY = ch * heightFrac;
        const fontSize = ch * (280 / 392);
        const canvasAdvanceWidth = cw - padX * 2;
        return {
            cw, ch, padX, baselineY, fontSize, canvasAdvanceWidth,
        };
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
            this._library     = record.payload;
            this._fontBytes   = record.fontBytes;
            this._adapterFont = await Adapter.loadFromBytes(record.fontBytes);
            this._queueState  = this._library.queueState;
            await this._rebuildFontDropdown();
            const pick = this._library.referenceFont?.pickValue ?? this._guessPickToken(this._library.referenceFont?.name);
            if (pick) {
                this.tool.values.fontFamily = pick;
            }
            this._captureCanvas?.setFontMetrics(this._library.referenceFont.metrics);
            this._applyGuidesToCanvas(this.tool.values['_guides']);
            this._updatePromptUI();
            this._renderCurrentPrompt();
            window.debugLog('TOOLS', '[GlyphBuilder] Session restored');
        } catch (err) {
            console.error('[GlyphBuilder] Session restore failed:', err);
            this._library = this._emptyLibrary();
            this._queueState = this._library.queueState;
            await this._rebuildFontDropdown();
        }
    }

    _guessPickToken(fname) {
        if (!fname) return null;
        if (GF_CURSIVE.includes(fname)) return `gf:${fname}`;
        return `sf:${fname}`;
    }

    async _rebuildFontDropdown() {
        const dd = this._fontDropdown;
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
            this._library.referenceFont?.pickValue
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
            this._showError('FONT LOAD FAILED — USE FONT FILE BUTTON', err);
        }
    }

    async _applyLoadedFont(adapter, bytes, pickValue, displayName) {
        this._adapterFont = adapter;
        this._fontBytes   = bytes;
        this._library.referenceFont = {
            name:     displayName,
            hash:     await Adapter.hashBytes(bytes),
            metrics:  Adapter.getMetrics(adapter),
            pickValue,
        };
        if (this.tool) this.tool.values.fontFamily = pickValue;
        this._captureCanvas?.setFontMetrics(this._library.referenceFont.metrics);
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
        this._queueState = { prompts, currentIndex: 0, skipDeferred: [], history: [] };
        this._library.queueState = this._queueState;
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
                this._library.referenceFont?.name
                ?? (this.tool?.values?.fontFamily && this.tool.values.fontFamily !== '__noop__'
                    ? String(this.tool.values.fontFamily).replace(/^gf:|sf:/u, '').replace(/\+/gu, ' ')
                    : '')
            ).trim();

        cc.setRails({
            headerLine: headerLineOverride
                ?? (
                    fontName.length
                        ? `NO ACTIVE PROMPT · ${fontName.toUpperCase()}`
                        : 'NO FONT LOADED — PICK REFERENCE FONT (TOOLBAR LEFT) OR IMPORT (EXPORT ▾)'
                ),
            footerLine: RAIL_FOOTER,
        });
        cc.setPromptBoundingBox(null);
        cc.setLayoutMarks(null);
        cc.setPrompt(null);
        cc.setFontPath('');
        cc.setUpcoming([]);
        cc.setFontMetrics(this._adapterFont ? Adapter.getMetrics(this._adapterFont) : null);
    }

    _renderCurrentPrompt() {
        if (!this._captureCanvas) return;

        this._syncCaptureCanvasSizeFromTool();
        const lay = this._resolvePromptLayout();
        if (!lay) return;

        const prompt = currentPrompt(this._queueState);
        const fontLabel = (
            this._library.referenceFont?.name ?? ''
        ).trim().toUpperCase();

        if (!this._adapterFont || !prompt) {
            this._idleViewportChrome();
            this.tool?.draw?.();
            return;
        }

        const metrics = Adapter.getMetrics(this._adapterFont);
        let combinedPath = '';
        let xCursor = lay.padX;
        for (const ch of prompt.text) {
            const { d, advance } = Adapter.getGlyphPath(
                this._adapterFont, ch, xCursor, lay.baselineY, lay.fontSize,
            );
            if (d) combinedPath += d + ' ';
            xCursor += advance;
        }
        this._captureCanvas.setPrompt({ text: prompt.text, glyphPathD: combinedPath, advance: xCursor });
        this._captureCanvas.setFontMetrics(metrics);

        const bbPx = Adapter.boundingBoxPromptCanvas(
            this._adapterFont, prompt.text, lay.padX, lay.baselineY, lay.fontSize,
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
            left: lay.padX,
            baselineY: lay.baselineY,
            advanceX: xCursor,
        });

        const v = Number(prompt.variationsDrawn ?? 0);
        this._captureCanvas.setRails({
            headerLine:
                `"${prompt.text}" · ${String(prompt.type).toUpperCase()} · V${v + 1} · ${fontLabel || 'UNKNOWN FONT'}`,
            footerLine: RAIL_FOOTER,
        });

        this._captureCanvas.setUpcoming(peekUpcoming(this._queueState, 6));
        this.tool?.draw?.();
    }

    async _saveAndNext() {
        const prompt = currentPrompt(this._queueState);
        if (!prompt) return;

        const strokes = this._captureCanvas ? this._captureCanvas.getStrokes() : [];
        if (strokes.length === 0) { this._skipPrompt(); return; }

        const lay = this._resolvePromptLayout();
        if (!lay) return;

        const metrics = Adapter.getMetrics(this._adapterFont);
        const fontAdvanceWidth = metrics.unitsPerEm;
        const promptGeometry = {
            canvasOriginX:       lay.padX,
            canvasBaselineY:     lay.baselineY,
            canvasAdvanceWidth:  lay.canvasAdvanceWidth,
        };
        const normStrokes      = normaliseStrokes(strokes, promptGeometry, fontAdvanceWidth);
        const drawingMetrics   = computeDrawingMetrics(normStrokes, fontAdvanceWidth);
        const drawingId        = `drawing_${prompt.id}_v${prompt.variationsDrawn + 1}`;

        this._library.drawings = this._library.drawings ?? {};
        this._library.drawings[drawingId] = {
            id:         drawingId,
            promptId:   prompt.id,
            promptText: prompt.text,
            fontHash:   this._library.referenceFont?.hash || '',
            capturedAt: Date.now(),
            strokes:    normStrokes,
            metrics:    drawingMetrics,
        };

        this._queueState = advance(markDrawn(this._queueState, prompt.id));
        this._library.queueState = this._queueState;
        if (this._captureCanvas) this._captureCanvas.clearInk();
        this._dirty = false;
        this._updatePromptUI();
        this._renderCurrentPrompt();

        await this._autosave();
        window.debugLog('TOOLS', `[GlyphBuilder] Saved: ${drawingId}`);
    }

    _skipPrompt() {
        const prompt = currentPrompt(this._queueState);
        if (!prompt) return;
        this._queueState = advance(deferSkip(this._queueState, prompt.id));
        this._library.queueState = this._queueState;
        if (this._captureCanvas) this._captureCanvas.clearInk();
        this._dirty = false;
        this._updatePromptUI();
        this._renderCurrentPrompt();
        this._autosave();
    }

    _updatePromptUI() {
        const prompt = currentPrompt(this._queueState);
        if (!this.tool) return;
        const set = (key, val) => { try { this.tool.setValue(key, val); } catch (_) {} };
        const pct = `${coveragePercent(this._queueState)}%`;
        const modeWord = prompt ? this._modeWord(prompt.type) : '—';
        const glyphs = prompt ? `"${prompt.text}"` : '—';
        set('sessionLine', `${modeWord} — ${glyphs} — ${pct}`);
        set('promptLabel',   prompt ? `"${prompt.text}"` : '—');
        set('phaseLabel',    prompt ? prompt.type.toUpperCase() : '—');
        set('coverageLabel', pct);
    }

    async _autosave() {
        if (!this._fontBytes) return;
        try {
            await Store.putActive(this._library, this._fontBytes);
        } catch (err) {
            console.error('[GlyphBuilder] Autosave failed:', err);
            this._showError('AUTOSAVE FAILED', err);
        }
    }

    async _exportZip() {
        try {
            if (!this._fontBytes) throw new Error('No font loaded to export.');
            const { default: JSZip } = await import('jszip');
            const zip = new JSZip();
            zip.file(
                'manifest.json',
                JSON.stringify({
                    version: 1,
                    exportedAt: new Date().toISOString(),
                    fontName:   this._library.referenceFont?.name || 'unknown',
                    fontHash:   this._library.referenceFont?.hash || '',
                    drawingCount: Object.keys(this._library.drawings || {}).length,
                }, null, 2),
            );
            zip.file('font/reference.ttf', this._fontBytes);
            zip.file('queue/state.json', JSON.stringify(this._library.queueState, null, 2));

            const drawings = this._library.drawings || {};
            const singles = zip.folder('drawings/singles');
            const digraphs = zip.folder('drawings/digraphs');
            const trigraphs = zip.folder('drawings/trigraphs');
            const hardpairs = zip.folder('drawings/hardpairs');
            const variations = zip.folder('drawings/variations');
            const anchors = zip.folder('anchors');

            for (const [id, rec] of Object.entries(drawings)) {
                const p = this._queueState.prompts.find((x) => x.id === rec.promptId);
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

    async _importZip(file) {
        try {
            const { default: JSZip } = await import('jszip');
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
            this._library = {
                referenceFont: {
                    name:     manifestParsed.fontName ?? 'library',
                    hash:     manifestParsed.fontHash || '',
                    metrics:  Adapter.getMetrics(ada),
                    pickValue:'__noop__',
                },
                queueState,
                drawings,
            };
            this._queueState = queueState;

            await this._rebuildFontDropdown();
            this._captureCanvas?.setFontMetrics(this._library.referenceFont.metrics);
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
        switch (key) {
            case '_canvasResize': {
                const w = Number(value?.width), h = Number(value?.height);
                if (w > 0 && h > 0) {
                    this._captureCanvas?.setSize(w, h);
                    this._renderCurrentPrompt();
                }
                break;
            }
            case 'newLibrary':
                this._confirmAndNewLibrary();
                break;
            case 'saveNext':
                void this._saveAndNext();
                break;
            case 'skipPrompt':
                this._skipPrompt();
                break;
            case 'clearInk':
                this._captureCanvas?.clearInk();
                break;
            case '_guides':
                this._applyGuidesToCanvas(Array.isArray(value) ? value : []);
                break;
            case 'drawHeightFraction': {
                const v = Number(value);
                if (Number.isFinite(v)) this._captureCanvas?.setReferenceHeightFraction(v);
                this._renderCurrentPrompt();
                break;
            }
        }
    }

    _confirmAndNewLibrary() {
        const drawingCount = Object.keys(this._library.drawings || {}).length;
        const msg = drawingCount > 0
            ? 'Create a new library? This clears all drawings from the autosave slot.'
            : 'Start a fresh library? Clears the queue and resets the autosave slot.';
        const run = async () => {
            await Store.clearActive();
            await this._resetLibrary();
        };
        this._openModalConfirm(
            msg,
            () => { void run(); },
            () => {},
        );
    }

    async _resetLibrary() {
        this._library    = this._emptyLibrary();
        this._queueState = { prompts: [], currentIndex: 0, skipDeferred: [], history: [] };
        this._adapterFont = null;
        this._fontBytes   = null;
        if (this._captureCanvas) {
            this._captureCanvas.clearInk();
            this._captureCanvas.setFontMetrics(null);
            this._idleViewportChrome();
        }
        this._dirty = false;
        if (this._fontDropdown && typeof this._fontDropdown.setValueSilent === 'function') {
            this._fontDropdown.setValueSilent('__noop__');
        }
        this.tool.values.fontFamily = '__noop__';
        this._library.queueState = this._queueState;
        await this._rebuildFontDropdown();
        this._applyGuidesToCanvas(this.tool.values['_guides']);
        this._updatePromptUI();
        try { this.tool?.setStatus?.('NEW LIBRARY — PICK FONT OR IMPORT ZIP'); } catch (_) {}
        this.tool?.draw?.();
    }

    _emptyLibrary() {
        return {
            referenceFont: null,
            queueState: { prompts: [], currentIndex: 0,
                skipDeferred: [], history: [] },
            drawings: {}, settings: {}, stats: {},
        };
    }

    _promptImportZip(file) {
        const has = Object.keys(this._library.drawings || {}).length > 0;
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
        if (typeof this.tool.isFocusInForm === 'function' && this.tool.isFocusInForm()) return;
        if (
            typeof this.tool.isShortcutScopeActive !== 'function'
            || !this.tool.isShortcutScopeActive(true)
        ) return;

        if (e.key === 'Enter' && !e.shiftKey && !e.altKey) {
            e.preventDefault(); void this._saveAndNext();
        } else if (e.key === 'Escape') {
            e.preventDefault(); this._skipPrompt();
        } else if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
            e.preventDefault(); this._captureCanvas?.redo();
        } else if (e.ctrlKey && !e.shiftKey && e.key === 'z') {
            e.preventDefault(); this._captureCanvas?.undo();
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
        if (!window.ComponentLibrary?.ModalConfirm) {
            try {
                if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
                    if (window.confirm(msg)) ok();
                    else cancel();
                    return;
                }
            } catch (_) {}
            void ok?.();
            return;
        }

        const m = new window.ComponentLibrary.ModalConfirm({
            message: msg,
            onConfirm: /** @param {*} _ */ () => { ok(); },
            onCancel:  /** @param {*} _ */ () => { cancel(); },
        }, this.deps);

        if (typeof this.tool?.showFloatingOverlay === 'function') {
            this.tool.showFloatingOverlay(m);
            return;
        }

        m.destroy?.();
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

        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }

        if (this._fontDropdown) {
            try { this._fontDropdown.destroy(); } catch (_) {}
            this._fontDropdown = null;
        }
        this._glyphToolbar = null;
    }
}

export default CursiveGlyphBuilderTool;
