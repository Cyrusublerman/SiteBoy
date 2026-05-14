/**
 * TransportStrip — SPEED + TIMELINE toggle on the generator canvas chrome stack.
 *
 * In GenerativeCanvasDock it sits directly above the optional SequencerV2 strip (paired chrome).
 * Play/pause/stop live in the toolbar — this strip owns only:
 *   SPEED  [━━━━━━━━━━━]  1.0×   │  TIMELINE ▾
 *
 * Emits onChange(key, value):
 *   'animSpeed'      → number
 *   'toggleTimeline' → null
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class GeneratorTransportStrip extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'transport-strip' }, deps);

        this.defaultSpeed   = options.defaultSpeed ?? 1;
        this.showTimeline   = options.showTimeline ?? false;
        this.onChange        = options.onChange     ?? (() => {});

        this._speed = this.defaultSpeed;
        this._els   = {};
    }

    /** @returns {object} Normalised dims from LayoutCalculator — scales when F changes */
    _transportDims() {
        const pack = this.calculateDimensions('generator-transport-strip');
        const F = pack.F;
        const d = pack.dimensions || {};
        return {
            F,
            rowHeight: d.rowHeight ?? F * 2,
            labelFontSize: d.labelFontSize ?? Math.round(F * 0.75),
            speedCellPaddingX: d.speedCellPaddingX ?? F,
            speedCellGap: d.speedCellGap ?? Math.round(F * 0.5),
            sliderMinWidth: d.sliderMinWidth ?? F * 4,
            sliderTrackHeight: d.sliderTrackHeight ?? Math.round(F * 0.25),
            readoutWidth: d.readoutWidth ?? F * 3,
            timelineBtnWidth: d.timelineBtnWidth ?? F * 6,
            thumbDiameter: d.thumbDiameter ?? F,
        };
    }

    render() {
        if (this.element) return this.element;

        const dim = this._transportDims();
        const cellH = dim.rowHeight;
        const fontSize = dim.labelFontSize;

        this.element = this.createElement('div', 'transport-strip component');
        this.element.style.cssText = `
            display: flex;
            align-items: stretch;
            height: ${cellH}px;
            border-top: 1px solid var(--c-border);
            background: var(--c-bg);
            flex-shrink: 0;
        `;

        // ── SPEED (label + slider + readout) ──────────────────────────
        const speedCell = this.createElement('div');
        speedCell.style.cssText = `
            display: flex;
            align-items: center;
            flex: 1;
            min-width: 0;
            height: ${cellH}px;
            padding: 0 ${dim.speedCellPaddingX}px;
            gap: ${dim.speedCellGap}px;
        `;

        const speedLbl = this.createElement('span');
        speedLbl.textContent = 'SPEED';
        speedLbl.style.cssText = `
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${fontSize}px;
            color: var(--c-text);
            white-space: nowrap;
            flex-shrink: 0;
        `;
        this.appendElement(speedCell, speedLbl);

        const slider = this.createElement('input');
        slider.type  = 'range';
        slider.min   = '0.1';
        slider.max   = '5';
        slider.step  = '0.1';
        slider.value = String(this.defaultSpeed);
        slider.className = 'transport-speed-slider';
        slider.style.cssText = `
            flex: 1;
            min-width: ${dim.sliderMinWidth}px;
            height: ${dim.sliderTrackHeight}px;
            cursor: pointer;
            -webkit-appearance: none;
            appearance: none;
            background: var(--c-bg);
            border: 1px solid var(--c-text);
        `;
        slider.style.setProperty('--generator-transport-thumb-d', `${dim.thumbDiameter}px`);
        slider.style.setProperty('--generator-transport-track-h', `${dim.sliderTrackHeight}px`);
        slider.addEventListener('input', (e) => {
            const v = parseFloat(e.target.value);
            this._speed = v;
            speedNum.textContent = v.toFixed(1) + '×';
            this.onChange('animSpeed', v);
        });
        this._els.speedSlider = slider;
        this.appendElement(speedCell, slider);

        const speedNum = this.createElement('span');
        speedNum.textContent = this.defaultSpeed.toFixed(1) + '×';
        speedNum.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${fontSize}px;
            color: var(--c-text);
            width: ${dim.readoutWidth}px;
            text-align: right;
            flex-shrink: 0;
        `;
        this._els.speedNum = speedNum;
        this.appendElement(speedCell, speedNum);

        this.appendElement(this.element, speedCell);

        // ── TIMELINE (conditional) ────────────────────────────────────
        if (this.showTimeline) {
            this._els.timelineBtn = this._cell('TIMELINE ▾', dim, () => {
                this.onChange('toggleTimeline', null);
            });
            this.appendElement(this.element, this._els.timelineBtn);
        }

        return this.element;
    }

    _cell(label, dim, onClick) {
        const btn = this.createElement('button');
        btn.type = 'button';
        btn.textContent = label;
        btn.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${dim.timelineBtnWidth}px;
            height: ${dim.rowHeight}px;
            border: none;
            border-left: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${dim.labelFontSize}px;
            text-transform: uppercase;
            cursor: pointer;
            flex-shrink: 0;
            white-space: nowrap;
        `;
        btn.addEventListener('mouseenter', () => { btn.style.background = 'var(--c-border)'; });
        btn.addEventListener('mouseleave', () => { btn.style.background = 'var(--c-bg)'; });
        btn.addEventListener('click', onClick);
        return btn;
    }

    /** Update speed slider from outside (e.g. preset load). */
    setSpeed(speed) {
        this._speed = speed;
        if (this._els.speedSlider) {
            this._els.speedSlider.value = String(speed);
        }
        if (this._els.speedNum) {
            this._els.speedNum.textContent = speed.toFixed(1) + '×';
        }
    }

    /** Show or hide TIMELINE control without rebuilding the strip. */
    setTimelineControlVisible(show) {
        if (!this.element) return;
        const visible = !!show;
        const dim = this._transportDims();

        if (visible) {
            if (!this._els.timelineBtn) {
                this._els.timelineBtn = this._cell('TIMELINE ▾', dim, () => {
                    this.onChange('toggleTimeline', null);
                });
                this.appendElement(this.element, this._els.timelineBtn);
            }
            this._els.timelineBtn.style.display = '';
        } else if (this._els.timelineBtn) {
            this._els.timelineBtn.style.display = 'none';
        }
    }

    /** Update behaviours when switching generator script (reuse same DOM node). */
    applyScriptTransportOptions(opts = {}) {
        if (opts.defaultSpeed != null) this.setSpeed(Number(opts.defaultSpeed));
        if (opts.showTimeline != null) this.setTimelineControlVisible(opts.showTimeline);
    }

    /** No-op kept for API compat — play state is shown in toolbar now. */
    setPlaying(_playing) {}

    destroy() {
        super.destroy();
    }
}
