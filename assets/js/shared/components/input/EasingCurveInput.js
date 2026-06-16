/**
 * EasingCurveInput — easing preset selector with optional bezier editor (Composite).
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';
import { Dropdown } from './Dropdown.js';

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

function _cubicBezier(x1, y1, x2, y2) {
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
const EDITOR_SIZE = 120;
const HANDLE_R = 6;

export class EasingCurveInput extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'easing-curve-input' }, deps);

        this.label = options.label ?? 'Easing';
        this._id = options.value ?? 'ease-in-out-cubic';
        this._bezier = options.bezier ?? (PRESET_MAP.get(this._id)?.bezier ?? [0.42, 0, 0.58, 1]);
        this.topBorder = options.topBorder ?? true;
        this.embedded = options.embedded ?? false;
        this.onChange = options.onChange ?? (() => {});

        this._expanded = false;
        this._dragging = null;
        this._els = {};
        this._titleDiv = null;
        this._headerBox = null;
        this._dropdown = null;
        this._currentFn = _buildFn(PRESET_MAP.get(this._id) ?? { bezier: this._bezier });
    }

    _containerBorderCss() {
        if (this.embedded) {
            return `
                border-top: none;
                border-right: none;
                border-bottom: none;
                border-left: 1px solid var(--c-border);
            `;
        }
        const top = this.label ? true : this.topBorder;
        return `
            border-top: ${top ? '1px solid var(--c-border)' : 'none'};
            border-right: 1px solid var(--c-border);
            border-bottom: 1px solid var(--c-border);
            border-left: 1px solid var(--c-border);
        `;
    }

    render() {
        if (this.element) return this.element;

        const { F, F2 } = this.getF();

        this.element = this.createElement('div', 'easing-curve-input component');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 0;
            width: 100%;
        `;

        if (this.label) {
            this._titleDiv = this.createElement('div', 'easing-curve-input__label-row');
            this._titleDiv.style.cssText = `
                display: flex;
                align-items: center;
                height: ${F * 1.5}px;
                padding: 0 ${F2}px;
                border-top: ${this.topBorder ? '1px solid var(--c-border)' : 'none'};
                border-left: 1px solid var(--c-border);
                border-right: 1px solid var(--c-border);
                box-sizing: border-box;
            `;
            const labelEl = this.createElement('span');
            labelEl.textContent = this.label.toUpperCase();
            labelEl.style.cssText = `
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: ${F * 0.75}px;
                color: var(--c-text);
                text-transform: uppercase;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            `;
            this._titleDiv.appendChild(labelEl);
            this.element.appendChild(this._titleDiv);
        }

        this._headerBox = this.createElement('div', 'easing-curve-input__header-box');
        this._headerBox.style.cssText = `
            display: flex;
            align-items: stretch;
            gap: 0;
            width: 100%;
            height: ${F * 2 + 2}px;
            box-sizing: border-box;
            ${this._containerBorderCss()}
        `;

        const presetWrap = this.createElement('div', 'easing-curve-input__preset-wrap');
        presetWrap.style.cssText = `flex: 1; min-width: 0; height: 100%;`;

        this._dropdown = new Dropdown({
            label: '',
            options: PRESETS.map(p => ({ value: p.id, label: p.label })),
            value: this._id,
            embedded: true,
            onChange: (id) => this._selectPreset(id),
        }, this.deps);
        this.addChild(this._dropdown);
        const ddEl = this._dropdown.render();
        ddEl.style.height = '100%';
        ddEl.style.width = '100%';
        presetWrap.appendChild(ddEl);
        this._headerBox.appendChild(presetWrap);

        this._els.expandBtn = this.createElement('button', 'easing-curve-input__expand');
        this._els.expandBtn.type = 'button';
        this._els.expandBtn.textContent = '+';
        this._els.expandBtn.style.cssText = `
            width: ${F * 2}px;
            height: 100%;
            flex-shrink: 0;
            border: none;
            border-left: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F * 0.75}px;
            cursor: pointer;
            padding: 0;
            box-sizing: border-box;
        `;
        this._els.expandBtn.addEventListener('click', () => this._toggleExpand());
        this._els.expandBtn.addEventListener('mouseenter', () => this._setExpandInverted(true));
        this._els.expandBtn.addEventListener('mouseleave', () => {
            this._setExpandInverted(this._expanded);
        });
        this._headerBox.appendChild(this._els.expandBtn);
        this.element.appendChild(this._headerBox);

        this._els.editor = this.createElement('div', 'easing-curve-input__editor');
        this._els.editor.style.cssText = `
            display: none;
            flex-direction: column;
            align-items: center;
            gap: 0;
            padding: ${F}px;
            background: var(--c-bg);
            border-left: 1px solid var(--c-border);
            border-right: 1px solid var(--c-border);
            border-bottom: 1px solid var(--c-border);
            box-sizing: border-box;
        `;

        this._els.canvas = this.createElement('canvas', 'easing-curve-input__canvas');
        this._els.canvas.width = EDITOR_SIZE;
        this._els.canvas.height = EDITOR_SIZE;
        this._els.canvas.style.cssText = `
            border: 1px solid var(--c-border);
            cursor: crosshair;
            touch-action: none;
            margin-bottom: ${F2}px;
        `;
        this._attachDragHandlers();
        this._els.editor.appendChild(this._els.canvas);

        this._els.readout = this.createElement('span');
        this._els.readout.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F * 0.75}px;
            color: var(--c-text);
        `;
        this._updateReadout();
        this._els.editor.appendChild(this._els.readout);
        this.element.appendChild(this._els.editor);

        this._syncExpandVisual();
        this._drawEditor();
        return this.element;
    }

    _setExpandInverted(on) {
        if (!this._els.expandBtn) return;
        this._els.expandBtn.style.background = on ? 'var(--c-text)' : 'var(--c-bg)';
        this._els.expandBtn.style.color = on ? 'var(--c-bg)' : 'var(--c-text)';
    }

    _syncExpandVisual() {
        if (!this._els.expandBtn) return;
        this._els.expandBtn.textContent = this._expanded ? '−' : '+';
        this._setExpandInverted(this._expanded);
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
        this._els.editor.style.display = this._expanded ? 'flex' : 'none';
        this._syncExpandVisual();
        if (this._expanded) this._drawEditor();
    }

    _attachDragHandlers() {
        const canvas = this._els.canvas;
        const getHandle = (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = EDITOR_SIZE / rect.width;
            const scaleY = EDITOR_SIZE / rect.height;
            const cx = (e.clientX - rect.left) * scaleX;
            const cy = (e.clientY - rect.top) * scaleY;
            const [x1, y1, x2, y2] = this._bezier;
            const p1x = x1 * EDITOR_SIZE;
            const p1y = (1 - y1) * EDITOR_SIZE;
            const p2x = x2 * EDITOR_SIZE;
            const p2y = (1 - y2) * EDITOR_SIZE;
            if (Math.hypot(cx - p1x, cy - p1y) < HANDLE_R * 2) return 'p1';
            if (Math.hypot(cx - p2x, cy - p2y) < HANDLE_R * 2) return 'p2';
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
            this._dropdown?.setValue('custom', false);
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
        canvas.addEventListener('pointerup', () => { this._dragging = null; });
    }

    _drawEditor() {
        const canvas = this._els.canvas;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const S = EDITOR_SIZE;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, S, S);
        const [x1, y1, x2, y2] = this._bezier;
        ctx.strokeStyle = '#808080';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, S);
        ctx.lineTo(S, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, S);
        ctx.lineTo(x1 * S, (1 - y1) * S);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(S, 0);
        ctx.lineTo(x2 * S, (1 - y2) * S);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, S);
        ctx.bezierCurveTo(x1 * S, (1 - y1) * S, x2 * S, (1 - y2) * S, S, 0);
        ctx.stroke();
        for (const [hx, hy] of [[x1, y1], [x2, y2]]) {
            ctx.fillStyle = '#ffffff';
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

    setTopBorder(on) {
        this.topBorder = !!on;
        if (this.embedded) return;
        const edge = on ? '1px solid var(--c-border)' : 'none';
        if (this._titleDiv) {
            this._titleDiv.style.borderTop = edge;
        } else if (this._headerBox) {
            this._headerBox.style.borderTop = edge;
        }
    }

    getValue() { return this._currentFn; }
    getCurveId() { return this._id; }
    getBezier() { return [...this._bezier]; }

    setValue(id, triggerChange = true) {
        this._id = id;
        const preset = PRESET_MAP.get(id);
        if (preset?.bezier) this._bezier = [...preset.bezier];
        this._currentFn = _buildFn(preset ?? { bezier: this._bezier });
        if (this._dropdown) this._dropdown.setValue(id, false);
        this._drawEditor();
        this._updateReadout();
        if (triggerChange) this.onChange(this._id, this._currentFn);
    }

    destroy() {
        if (this._dropdown) {
            this._dropdown.destroy();
            this._dropdown = null;
        }
        super.destroy();
    }
}
