/**
 * EasingCurveInput — easing function selector with optional bezier editor.
 *
 * Exposes a dropdown of named presets plus an expandable bezier handle editor
 * (two control points P1 and P2 on a unit square). The component returns:
 *   - getValue() → easingFn: (t: number) → number, where t ∈ [0,1]
 *   - getCurveId() → string preset id, or 'custom' for editor-defined curves
 *
 * onChange(id, fn) fires whenever the selection or handles change.
 *
 * All bezier math is self-contained (no dependency on CSS cubic-bezier).
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

// ── Easing presets ────────────────────────────────────────────────────────────

/**
 * @typedef {Object} EasingPreset
 * @property {string}   id
 * @property {string}   label
 * @property {number[]} bezier  - [x1, y1, x2, y2] cubic control points, or null for special
 * @property {Function} [fn]    - Direct function for non-bezier curves (linear, step)
 */

const PRESETS = [
    { id: 'linear',          label: 'Linear',               bezier: null, fn: t => t },
    { id: 'ease',            label: 'Ease',                 bezier: [0.25, 0.1, 0.25, 1.0] },
    { id: 'ease-in',         label: 'Ease In',              bezier: [0.42, 0.0, 1.0,  1.0] },
    { id: 'ease-out',        label: 'Ease Out',             bezier: [0.0,  0.0, 0.58, 1.0] },
    { id: 'ease-in-out',     label: 'Ease In-Out',          bezier: [0.42, 0.0, 0.58, 1.0] },
    { id: 'ease-in-cubic',   label: 'Ease In (Cubic)',      bezier: [0.55, 0.055, 0.675, 0.19] },
    { id: 'ease-out-cubic',  label: 'Ease Out (Cubic)',     bezier: [0.215, 0.61, 0.355, 1.0] },
    { id: 'ease-in-out-cubic', label: 'Ease In-Out (Cubic)', bezier: [0.645, 0.045, 0.355, 1.0] },
    { id: 'ease-in-sine',    label: 'Ease In (Sine)',       bezier: null, fn: t => 1 - Math.cos(t * Math.PI / 2) },
    { id: 'ease-out-sine',   label: 'Ease Out (Sine)',      bezier: null, fn: t => Math.sin(t * Math.PI / 2) },
    { id: 'ease-in-out-sine',label: 'Ease In-Out (Sine)',   bezier: null, fn: t => -(Math.cos(Math.PI * t) - 1) / 2 },
    { id: 'ease-in-expo',    label: 'Ease In (Expo)',       bezier: null, fn: t => t === 0 ? 0 : Math.pow(2, 10 * t - 10) },
    { id: 'ease-out-expo',   label: 'Ease Out (Expo)',      bezier: null, fn: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t) },
    { id: 'ease-in-elastic', label: 'Ease In (Elastic)',    bezier: null, fn: t => {
        if (t === 0 || t === 1) return t;
        const c4 = (2 * Math.PI) / 3;
        return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
    }},
    { id: 'ease-out-elastic',label: 'Ease Out (Elastic)',   bezier: null, fn: t => {
        if (t === 0 || t === 1) return t;
        const c4 = (2 * Math.PI) / 3;
        return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }},
    { id: 'step-start',      label: 'Step Start',           bezier: null, fn: t => t <= 0 ? 0 : 1 },
    { id: 'step-end',        label: 'Step End',             bezier: null, fn: t => t < 1 ? 0 : 1 },
    { id: 'custom',          label: 'Custom (Bezier)',       bezier: [0.25, 0.1, 0.75, 0.9] },
];

// ── Bezier solver (1D cubic newton method) ────────────────────────────────────

function _cubicBezier(x1, y1, x2, y2) {
    // Returns a function t → y, where t is the time parameter [0,1].
    // Uses Newton's method to invert the cubic x-parameterisation.
    const ax = 1 - 3 * x2 + 3 * x1;
    const bx = 3 * x2 - 6 * x1;
    const cx = 3 * x1;
    const ay = 1 - 3 * y2 + 3 * y1;
    const by = 3 * y2 - 6 * y1;
    const cy = 3 * y1;

    const sampleX = t => ((ax * t + bx) * t + cx) * t;
    const sampleY = t => ((ay * t + by) * t + cy) * t;
    const sampleDX = t => (3 * ax * t + 2 * bx) * t + cx;

    return (x) => {
        if (x === 0 || x === 1) return x;
        let t = x;
        for (let i = 0; i < 8; i++) {
            const error = sampleX(t) - x;
            if (Math.abs(error) < 1e-6) break;
            const d = sampleDX(t);
            if (Math.abs(d) < 1e-12) break;
            t -= error / d;
        }
        return sampleY(t);
    };
}

function _buildFn(preset) {
    if (preset.fn) return preset.fn;
    const [x1, y1, x2, y2] = preset.bezier;
    return _cubicBezier(x1, y1, x2, y2);
}

const PRESET_MAP = new Map(PRESETS.map(p => [p.id, p]));

// ── Component ─────────────────────────────────────────────────────────────────

const EDITOR_SIZE = 120;
const HANDLE_R    = 6;

export class EasingCurveInput extends BaseComponent {
    /**
     * @param {Object}   options
     * @param {string}   [options.label='Easing']
     * @param {string}   [options.value='ease-in-out-cubic']  - Preset id
     * @param {number[]} [options.bezier]                     - Custom [x1,y1,x2,y2]
     * @param {Function} options.onChange  - (id: string, fn: Function) => void
     */
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'easing-curve-input' }, deps);

        this.label    = options.label ?? 'Easing';
        this._id      = options.value ?? 'ease-in-out-cubic';
        this._bezier  = options.bezier ?? (PRESET_MAP.get(this._id)?.bezier ?? [0.42, 0, 0.58, 1]);
        this.onChange = options.onChange ?? (() => {});

        this._expanded    = false;
        this._dragging    = null; // 'p1' | 'p2' | null
        this._els         = {};
        this._currentFn   = _buildFn(PRESET_MAP.get(this._id) ?? { bezier: this._bezier });
    }

    render() {
        if (this.element) return this.element;

        const { F, F2 } = this.getF();

        this.element = this.createElement('div', 'easing-curve-input component');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            width: 100%;
            border: 1px solid var(--c-border);
        `;

        // ── Header ──────────────────────────────────────────────────────
        const header = this.createElement('div', 'easing-curve-input__header');
        header.style.cssText = `
            display: flex;
            align-items: center;
            gap: ${F2}px;
            padding: ${F2}px ${F}px;
            cursor: pointer;
            background: var(--c-bg);
            border-bottom: 1px solid var(--c-border);
        `;

        const labelEl = this.createElement('span');
        labelEl.textContent = this.label;
        labelEl.style.cssText = `
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${F}px;
            color: var(--c-text);
            flex: 1;
        `;

        // Preset dropdown inline in header
        this._els.select = this.createElement('select', 'easing-curve-input__select');
        this._els.select.style.cssText = `
            height: ${F * 2}px;
            padding: 0 ${F2}px;
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${F}px;
            cursor: pointer;
        `;
        for (const p of PRESETS) {
            const opt = this.createElement('option');
            opt.value = p.id;
            opt.textContent = p.label;
            if (p.id === this._id) opt.selected = true;
            this._els.select.appendChild(opt);
        }
        this._els.select.addEventListener('change', (e) => {
            e.stopPropagation();
            this._selectPreset(e.target.value);
        });

        this._els.chevron = this.createElement('span');
        this._els.chevron.textContent = '+';
        this._els.chevron.style.cssText = `
            font-family: monospace;
            font-size: ${F}px;
            color: var(--c-text);
            width: ${F}px;
            text-align: center;
        `;

        header.appendChild(labelEl);
        header.appendChild(this._els.select);
        header.appendChild(this._els.chevron);
        header.addEventListener('click', (e) => {
            if (e.target === this._els.select) return;
            this._toggleExpand();
        });
        this.element.appendChild(header);

        // ── Bezier editor ────────────────────────────────────────────────
        this._els.editor = this.createElement('div', 'easing-curve-input__editor');
        this._els.editor.style.cssText = `
            display: none;
            flex-direction: column;
            align-items: center;
            gap: ${F2}px;
            padding: ${F}px;
            background: var(--c-bg);
        `;

        this._els.canvas = this.createElement('canvas', 'easing-curve-input__canvas');
        this._els.canvas.width  = EDITOR_SIZE;
        this._els.canvas.height = EDITOR_SIZE;
        this._els.canvas.style.cssText = `
            border: 1px solid var(--c-border);
            cursor: crosshair;
            touch-action: none;
        `;

        this._attachDragHandlers();
        this._els.editor.appendChild(this._els.canvas);

        // Coordinate readout
        this._els.readout = this.createElement('span');
        this._els.readout.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F}px;
            color: var(--c-text);
        `;
        this._updateReadout();
        this._els.editor.appendChild(this._els.readout);

        this.element.appendChild(this._els.editor);

        this._drawEditor();
        return this.element;
    }

    _selectPreset(id) {
        this._id = id;
        const preset = PRESET_MAP.get(id);
        if (preset?.bezier) this._bezier = [...preset.bezier];
        this._currentFn = _buildFn(preset ?? { bezier: this._bezier });
        this._drawEditor();
        this._updateReadout();
        this.onChange(this._id, this._currentFn);
    }

    _toggleExpand() {
        this._expanded = !this._expanded;
        this._els.editor.style.display  = this._expanded ? 'flex' : 'none';
        this._els.chevron.textContent    = this._expanded ? '−' : '+';
        if (this._expanded) this._drawEditor();
    }

    _attachDragHandlers() {
        const canvas = this._els.canvas;

        const getHandle = (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = EDITOR_SIZE / rect.width;
            const scaleY = EDITOR_SIZE / rect.height;
            const cx = (e.clientX - rect.left) * scaleX;
            const cy = (e.clientY - rect.top)  * scaleY;

            const [x1, y1, x2, y2] = this._bezier;
            const p1x = x1 * EDITOR_SIZE;
            const p1y = (1 - y1) * EDITOR_SIZE;
            const p2x = x2 * EDITOR_SIZE;
            const p2y = (1 - y2) * EDITOR_SIZE;

            const d1 = Math.hypot(cx - p1x, cy - p1y);
            const d2 = Math.hypot(cx - p2x, cy - p2y);
            if (d1 < HANDLE_R * 2) return 'p1';
            if (d2 < HANDLE_R * 2) return 'p2';
            return null;
        };

        const update = (e) => {
            if (!this._dragging) return;
            const rect = canvas.getBoundingClientRect();
            const scaleX = EDITOR_SIZE / rect.width;
            const scaleY = EDITOR_SIZE / rect.height;
            const nx = Math.max(0, Math.min(1, (e.clientX - rect.left) * scaleX / EDITOR_SIZE));
            const ny = 1 - (e.clientY - rect.top) * scaleY / EDITOR_SIZE;

            if (this._dragging === 'p1') {
                this._bezier[0] = nx;
                this._bezier[1] = ny;
            } else {
                this._bezier[2] = nx;
                this._bezier[3] = ny;
            }
            this._id = 'custom';
            this._els.select.value = 'custom';
            this._currentFn = _buildFn({ bezier: this._bezier });
            this._drawEditor();
            this._updateReadout();
            this.onChange('custom', this._currentFn);
        };

        canvas.addEventListener('pointerdown', (e) => {
            const h = getHandle(e);
            if (h) { this._dragging = h; canvas.setPointerCapture(e.pointerId); }
        });
        canvas.addEventListener('pointermove', update);
        canvas.addEventListener('pointerup',   () => { this._dragging = null; });
    }

    _drawEditor() {
        const canvas = this._els.canvas;
        if (!canvas) return;
        const ctx    = canvas.getContext('2d');
        const S      = EDITOR_SIZE;

        // Background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, S, S);

        const [x1, y1, x2, y2] = this._bezier;

        // Diagonal guide
        ctx.strokeStyle = '#333333';
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(0, S);
        ctx.lineTo(S, 0);
        ctx.stroke();

        // Control-point lines
        ctx.strokeStyle = '#555555';
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(0, S);
        ctx.lineTo(x1 * S, (1 - y1) * S);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(S, 0);
        ctx.lineTo(x2 * S, (1 - y2) * S);
        ctx.stroke();

        // Bezier curve
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth   = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, S);
        ctx.bezierCurveTo(x1 * S, (1 - y1) * S, x2 * S, (1 - y2) * S, S, 0);
        ctx.stroke();

        // Handle dots
        for (const [hx, hy] of [[x1, y1], [x2, y2]]) {
            ctx.fillStyle = 'var(--c-accent, #ffffff)';
            ctx.beginPath();
            ctx.arc(hx * S, (1 - hy) * S, HANDLE_R, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    _updateReadout() {
        if (!this._els.readout) return;
        const [x1, y1, x2, y2] = this._bezier;
        this._els.readout.textContent =
            `P1(${x1.toFixed(2)}, ${y1.toFixed(2)})  P2(${x2.toFixed(2)}, ${y2.toFixed(2)})`;
    }

    /** @returns {Function} t → t' easing function */
    getValue() { return this._currentFn; }

    /** @returns {string} current preset id or 'custom' */
    getCurveId() { return this._id; }

    /** @returns {number[]} [x1, y1, x2, y2] */
    getBezier() { return [...this._bezier]; }

    /** Programmatically set a preset. */
    setValue(id) {
        this._selectPreset(id);
        if (this._els.select) this._els.select.value = id;
    }

    destroy() {
        super.destroy();
    }
}
