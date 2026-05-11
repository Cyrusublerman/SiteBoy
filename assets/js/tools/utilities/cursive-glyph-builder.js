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
} from '../../shared/algorithms/typography/prompt-sequencer.js';
import { normaliseStrokes, computeDrawingMetrics } from '../../shared/algorithms/typography/stroke-capture.js';

const GF_CURSIVE = [
    'Dancing Script', 'Pacifico', 'Sacramento', 'Great Vibes', 'Allura',
    'Alex Brush', 'Pinyon Script', 'Clicker Script', 'Tangerine', 'Caveat',
    'Kalam', 'Permanent Marker', 'Indie Flower', 'Patrick Hand', 'Amatic SC',
];

const DOC_MD_PATH = '/blog/docs/pages/tools/utilities/cursive-glyph-builder.md';

const TOOL_CONFIG = {
    title: 'CURSIVE GLYPH BUILDER',

    sidebar: [
        ['SESSION', [
            ['Library', [
                ['button', 'New Library', { key: 'newLibrary', value: 'NEW LIBRARY' }],
                ['button', 'Export ZIP',   { key: 'exportZip',   value: 'EXPORT ZIP' }],
            ]],
            ['Files', [
                ['file', '', '.zip', { key: 'zipFilePick', buttonText: 'IMPORT ZIP', label: '' }],
                ['file', '', '.ttf,.otf,.woff,.woff2', { key: 'fontFilePick', buttonText: 'FONT FILE', label: '' }],
            ]],
            ['Font', [
                ['dropdown', 'Font pick', [{ value: '__noop__', label: 'PICK FONT' }],
                    { key: 'fontFamily', value: '__noop__' }],
            ]],
        ]],
        ['PROMPT', [
            ['Current', [
                ['label', 'Prompt',   { key: 'promptLabel',    value: '—' }],
                ['label', 'Phase',    { key: 'phaseLabel',     value: '—' }],
                ['label', 'Coverage', { key: 'coverageLabel',  value: '0%' }],
            ]],
            ['Queue', [
                ['button', 'Save + Next', { key: 'saveNext', value: 'SAVE + NEXT' }],
                ['button', 'Skip',        { key: 'skipPrompt', value: 'SKIP' }],
                ['button', 'Clear Ink',   { key: 'clearInk',  value: 'CLEAR INK' }],
            ]],
        ]],
        ['CANVAS', [
            ['Viewport', [
                ['radio', '', [
                    { value: 'fit', label: 'FIT' },
                    { value: 'fill', label: 'FILL' },
                    { value: 'actual', label: 'ACTUAL' },
                ], { key: 'displayMode', layout: 'row', selectedValue: 'fit' }],
            ]],
            ['Guides', [
                ['toggle', '', [
                    { value: 'BASELINE', label: 'BASE' },
                    { value: 'DESC', label: 'DESC' },
                    { value: 'XH', label: 'X-HGT' },
                    { value: 'CAP', label: 'CAP' },
                    { value: 'REF', label: 'REF' },
                ], {
                    key: '_guides',
                    layout: 'grid',
                    gridColumns: 2,
                    selectedValues: ['BASELINE', 'DESC', 'XH', 'CAP', 'REF'],
                }],
            ]],
        ]],
        ['INFO', [
            ['', [
                ['markdown-fetch', DOC_MD_PATH],
            ]],
        ]],
    ],

    canvas: {
        displayMode: 'fit',
        width:  560,
        height: 392,
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
        this._onKeyDown = this._onKeyDown.bind(this);

        this.initialize();
    }

    async initialize() {
        try {
            this.tool = new ToolBase(TOOL_CONFIG, this.deps);
            this.tool.onUpdate = (key, value, values) =>
                this._handleUpdate(key, value, values);

            if (this.container) {
                this.container.classList.add('tool-viewport');
                this.tool.mount(this.container);
            }

            await this._rebuildFontDropdown();

            this._captureCanvas = new GlyphCaptureCanvas({
                width:       560,
                height:      392,
                F:           14,
                fontMetrics: null,
                prompt:      null,
                overlays:    {
                    baseline: true, descender: true, xHeight: true, capHeight: true,
                    ascender: false, refGlyph: true,
                },
                onStrokeEnd:   () => { this._dirty = true; },
                onDirtyChange: (dirty) => { this._dirty = dirty; },
                onRedraw:      () => { this.tool?.draw(); },
            }, this.deps);

            if (this.tool.canvas) this._captureCanvas.attach(this.tool.canvas);

            this.tool.onDraw = (ctx) => { this._captureCanvas.draw(ctx); };
            this.tool.draw();

            this._applyGuidesToCanvas(this.tool.values['_guides']);

            await this._tryRestoreSession();

            document.addEventListener('keydown', this._onKeyDown);
        } catch (err) {
            this._showError('Initialisation failed', err);
        }
    }

    _applyGuidesToCanvas(selection) {
        const defs = ['BASELINE', 'DESC', 'XH', 'CAP', 'REF'];
        const raw = Array.isArray(selection)
            ? selection.filter((/** @type {string} */ v) =>
                defs.includes(String(v)),
            )
            : null;
        const activeSet = raw === null ? defs : raw;
        const s = new Set(activeSet);

        this._captureCanvas?.setOverlayToggles({
            baseline:  s.has('BASELINE'),
            descender: s.has('DESC'),
            xHeight:   s.has('XH'),
            capHeight: s.has('CAP'),
            refGlyph:  s.has('REF'),
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
                try { this.tool?.setValue('fontFamily', pick); } catch (_) {}
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
        const dd = this.tool?.components.get('fontFamily');
        if (!dd?.setOptions) return;

        const families = await detectSystemFonts();
        const opts = [{ value: '__noop__', label: 'PICK FONT' }];
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

        try { dd.setValue(cur); } catch (_) {
            try { dd.setValue('__noop__'); } catch (_) {}
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
        this._updatePromptUI();
        this._renderCurrentPrompt();
    }

    _renderCurrentPrompt() {
        const prompt = currentPrompt(this._queueState);
        if (!prompt || !this._adapterFont || !this._captureCanvas) return;

        const metrics = Adapter.getMetrics(this._adapterFont);
        const fontSize = 280;
        const baselineY = 392 * 0.7;
        let combinedPath = '';
        let xCursor = 40;
        for (const ch of prompt.text) {
            const { d, advance } = Adapter.getGlyphPath(
                this._adapterFont, ch, xCursor, baselineY, fontSize,
            );
            if (d) combinedPath += d + ' ';
            xCursor += advance;
        }
        this._captureCanvas.setPrompt({ text: prompt.text, glyphPathD: combinedPath, advance: xCursor });
        this._captureCanvas.setFontMetrics(metrics);
    }

    async _saveAndNext() {
        const prompt = currentPrompt(this._queueState);
        if (!prompt) return;

        const strokes = this._captureCanvas ? this._captureCanvas.getStrokes() : [];
        if (strokes.length === 0) { this._skipPrompt(); return; }

        const metrics = Adapter.getMetrics(this._adapterFont);
        const fontAdvanceWidth = metrics.unitsPerEm;
        const promptGeometry = {
            canvasOriginX:     40,
            canvasBaselineY:   392 * 0.7,
            canvasAdvanceWidth: 560 - 80,
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
        set('promptLabel',   prompt ? `"${prompt.text}"` : '—');
        set('phaseLabel',    prompt ? prompt.type.toUpperCase() : '—');
        set('coverageLabel', `${coveragePercent(this._queueState)}%`);
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
            this._downloadBlob(blob, `glyph-library-${Date.now()}.zip`);
            window.debugLog('TOOLS', '[GlyphBuilder] ZIP exported');
        } catch (err) {
            console.error('[GlyphBuilder] ZIP export failed:', err);
            this._showError('ZIP EXPORT FAILED', err);
        }
    }

    /** @suppress {duplicate} Minimal browser download shim (architecture exception). */
    _downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = /** @type {HTMLAnchorElement} */ (document.createElement('a'));
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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
            case 'newLibrary':
                this._confirmAndNewLibrary();
                break;
            case 'exportZip':
                this._exportZip();
                break;
            case 'zipFilePick':
                if (value instanceof File && value.name) this._promptImportZip(value);
                break;
            case 'fontFilePick':
                if (value instanceof File) void this._loadFontFromUpload(value);
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
            case 'clearInk':
                this._captureCanvas?.clearInk();
                break;
            case '_guides':
                this._applyGuidesToCanvas(Array.isArray(value) ? value : []);
                break;
        }
    }

    _confirmAndNewLibrary() {
        const has = Object.keys(this._library.drawings || {}).length > 0;
        const run = async () => {
            await Store.clearActive();
            await this._resetLibrary();
        };
        if (has) {
            this._openModalConfirm(
                'Create a new library? All unsaved drawings will be lost.',
                () => { void run(); },
                () => {},
            );
        } else void run();
    }

    async _resetLibrary() {
        this._library    = this._emptyLibrary();
        this._queueState = { prompts: [], currentIndex: 0, skipDeferred: [], history: [] };
        this._adapterFont = null;
        this._fontBytes   = null;
        if (this._captureCanvas) this._captureCanvas.clearInk();
        this._dirty = false;
        try { void this.tool?.setValue('fontFamily', '__noop__'); } catch (_) {}
        this._library.queueState = this._queueState;
        await this._rebuildFontDropdown();
        this._applyGuidesToCanvas(this.tool.values['_guides']);
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
        if (!this.container || !document.body.contains(this.container)) return;

        const focusInTool = (
            typeof this.tool?.element?.contains === 'function'
                && this.tool.element.contains(document.activeElement)
        );
        const focusGlob = document.activeElement === document.body
            || this.container.contains(document.activeElement)
            || focusInTool;

        if (!focusGlob) return;

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
        if (!window.ComponentLibrary?.ModalConfirm) return;

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
        document.removeEventListener('keydown', this._onKeyDown);
        this._hideToolOverlay();

        if (this._captureCanvas) {
            this._captureCanvas.destroy();
            this._captureCanvas = null;
        }

        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
    }
}

export default CursiveGlyphBuilderTool;
