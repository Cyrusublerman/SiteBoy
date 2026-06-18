/**
 * GeneratorTransportStrip — Transport controls for the generator canvas chrome.
 *
 * Layout (left → right):
 *   ▶ ⏸ ■  │  SPEED [━━━] 1.0×  │  60 FPS  │  ● REC  │  TIMELINE ▾
 *
 * Play/Pause/Stop cells show when timeline is NOT visible (they move
 * into the sequencer strip when timeline is expanded).
 *
 * Emits onChange(key, value):
 *   'playPause'      → null
 *   'stopReset'      → null
 *   'animSpeed'      → number
 *   'fpsLock'        → number
 *   'startRecord'    → null
 *   'toggleTimeline' → null
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';
import { Slider } from '../input/Slider.js';

export class GeneratorTransportStrip extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'transport-strip' }, deps);

        this.showTimeline   = options.showTimeline ?? false;
        this.showRecord     = options.showRecord   ?? true;
        this.onChange        = options.onChange     ?? (() => {});

        this._fps      = options.defaultFps ?? 60;
        this._playing  = false;
        this._recording = false;
        this._els      = {};
    }

    _dims() {
        const pack = this.calculateDimensions('generator-transport-strip');
        const F = pack.F;
        const d = pack.dimensions || {};
        return {
            F,
            rowHeight:       d.rowHeight       ?? F * 2,
            labelFontSize:   d.labelFontSize   ?? Math.round(F * 0.75),
            cellWidth:       F * 2,
            fpsSliderMin:    F * 4,
            fpsGap:          Math.round(F * 0.4),
            fpsReadoutWidth: Math.round(F * 3.5),
            recCellWidth:    F * 4,
            timelineBtnWidth: d.timelineBtnWidth ?? F * 6,
            thumbDiameter:   d.thumbDiameter    ?? F,
            sliderTrackH:    d.sliderTrackHeight ?? Math.round(F * 0.25),
        };
    }

    render() {
        if (this.element) return this.element;

        const d = this._dims();

        this.element = this.createElement('div', 'transport-strip component');
        this.element.setAttribute('data-generator-transport-strip', '');
        // First Cell of the unified chrome Partition: the dock chrome stack owns
        // the outer top border, so this row declares none (I4/I6).
        this.element.style.cssText = `
            display: flex;
            align-items: stretch;
            height: ${d.rowHeight}px;
            background: var(--c-bg);
            flex-shrink: 0;
        `;

        this._renderPlaybackCells(d);
        this._renderFpsCell(d);
        if (this.showRecord) {
            this._renderRecCell(d);
        }

        if (this.showTimeline) {
            this._renderTimelineBtn(d);
        }

        return this.element;
    }

    // ─── PLAYBACK (▶ ⏸ ■) ────────────────────────────────────────────────────

    _renderPlaybackCells(d) {
        const container = this.createElement('div', 'transport-playback');
        container.style.cssText = `
            display: flex;
            align-items: stretch;
            flex-shrink: 0;
        `;

        this._els.playBtn = this._iconBtn('▶', d, () => this.onChange('playPause', null));
        this._els.pauseBtn = this._iconBtn('⏸', d, () => this.onChange('playPause', null));
        this._els.pauseBtn.style.display = 'none';
        this._els.stopBtn = this._iconBtn('■', d, () => this.onChange('stopReset', null));
        this._els.stopBtn.style.borderLeft = '1px solid var(--c-border)';

        this.appendElement(container, this._els.playBtn);
        this.appendElement(container, this._els.pauseBtn);
        this.appendElement(container, this._els.stopBtn);

        this._els.playbackContainer = container;
        this.appendElement(this.element, container);
    }

    _iconBtn(glyph, d, onClick) {
        const btn = this.createElement('button');
        btn.type = 'button';
        btn.textContent = glyph;
        btn.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${d.cellWidth}px;
            height: ${d.rowHeight}px;
            border: none;
            background: var(--c-bg);
            color: var(--c-text);
            font-size: ${d.labelFontSize}px;
            cursor: pointer;
            flex-shrink: 0;
            padding: 0;
        `;
        btn.addEventListener('mouseenter', () => {
            if (btn.dataset.active === '1') return;
            btn.style.background = 'var(--c-text)';
            btn.style.color = 'var(--c-bg)';
        });
        btn.addEventListener('mouseleave', () => {
            const active = btn.dataset.active === '1';
            btn.style.background = active ? 'var(--c-text)' : 'var(--c-bg)';
            btn.style.color = active ? 'var(--c-bg)' : 'var(--c-text)';
        });
        btn.addEventListener('click', onClick);
        return btn;
    }

    // ─── FPS (slider + readout) ─────────────────────────────────────────────

    _renderFpsCell(d) {
        const cell = this.createElement('div', 'transport-fps');
        cell.style.cssText = `
            display: flex;
            align-items: center;
            flex: 1;
            min-width: 0;
            height: ${d.rowHeight}px;
            padding: 0 ${d.fpsGap}px;
            gap: ${d.fpsGap}px;
            border-left: 1px solid var(--c-border);
        `;

        this._fpsSliderComp = new Slider({
            min: 6, max: 120, step: 6,
            value: this._fps,
            trackHF: 2,
            // Embedded in the strip Partition: the cell owns the border-left divider,
            // so the slider draws no box edges (no inset top/bottom lines, fills row).
            borders: { top: false, right: false, bottom: false, left: false },
            ariaLabel: 'FPS',
            onInput: (v) => {
                this._fps = v;
                this._els.fpsReadout.textContent = v + ' FPS';
                this.onChange('fpsChange', v);
            },
        }, this.deps);
        const slider = this._fpsSliderComp.render();
        slider.style.flex = '1';
        slider.style.minWidth = `${d.fpsSliderMin}px`;
        this._els.fpsSlider = slider;
        this.appendElement(cell, slider);

        const readout = this.createElement('span');
        readout.textContent = this._fps + ' FPS';
        readout.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${d.labelFontSize}px;
            color: var(--c-text);
            width: ${d.fpsReadoutWidth}px;
            text-align: right;
            flex-shrink: 0;
            white-space: nowrap;
        `;
        this._els.fpsReadout = readout;
        this.appendElement(cell, readout);

        this.appendElement(this.element, cell);
    }

    // ─── REC ──────────────────────────────────────────────────────────────────

    _renderRecCell(d) {
        const btn = this.createElement('button');
        btn.type = 'button';
        btn.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            gap: ${Math.round(d.F * 0.3)}px;
            width: ${d.recCellWidth}px;
            height: ${d.rowHeight}px;
            border: none;
            border-left: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${d.labelFontSize}px;
            cursor: pointer;
            flex-shrink: 0;
            white-space: nowrap;
            padding: 0;
        `;

        const dot = this.createElement('span');
        dot.textContent = '●';
        // Record affordance marked with the single accent token (idle); flips to the
        // background token when the button is inverted (hover/recording) for legibility.
        dot.style.color = 'var(--c-accent)';
        this.appendElement(btn, dot);

        const label = this.createElement('span');
        label.textContent = 'REC';
        this.appendElement(btn, label);

        btn.addEventListener('mouseenter', () => {
            if (this._recording) return;
            btn.style.background = 'var(--c-text)';
            btn.style.color = 'var(--c-bg)';
            dot.style.color = 'var(--c-bg)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.background = this._recording ? 'var(--c-text)' : 'var(--c-bg)';
            btn.style.color = this._recording ? 'var(--c-bg)' : 'var(--c-text)';
            dot.style.color = this._recording ? 'var(--c-bg)' : 'var(--c-accent)';
        });
        btn.addEventListener('click', () => this.onChange('startRecord', null));

        this._els.recBtn = btn;
        this._els.recDot = dot;
        this._els.recLabel = label;
        this.appendElement(this.element, btn);
    }

    // ─── TIMELINE ─────────────────────────────────────────────────────────────

    _renderTimelineBtn(d) {
        this._els.timelineBtn = this._labelBtn('TIMELINE ▾', d, () => {
            this.onChange('toggleTimeline', null);
        });
        this.appendElement(this.element, this._els.timelineBtn);
    }

    _labelBtn(text, d, onClick) {
        const btn = this.createElement('button');
        btn.type = 'button';
        btn.textContent = text;
        btn.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${d.timelineBtnWidth}px;
            height: ${d.rowHeight}px;
            border: none;
            border-left: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${d.labelFontSize}px;
            text-transform: uppercase;
            cursor: pointer;
            flex-shrink: 0;
            white-space: nowrap;
            padding: 0;
        `;
        btn.addEventListener('mouseenter', () => {
            btn.style.background = 'var(--c-text)';
            btn.style.color = 'var(--c-bg)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.background = 'var(--c-bg)';
            btn.style.color = 'var(--c-text)';
        });
        btn.addEventListener('click', onClick);
        return btn;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════

    setPlaying(playing) {
        this._playing = playing;
        if (!this._els.playBtn) return;

        if (playing) {
            this._els.playBtn.style.display = 'none';
            this._els.pauseBtn.style.display = 'flex';
            this._els.playBtn.dataset.active = '';
            this._els.pauseBtn.dataset.active = '1';
            this._els.pauseBtn.style.background = 'var(--c-text)';
            this._els.pauseBtn.style.color = 'var(--c-bg)';
        } else {
            this._els.playBtn.style.display = 'flex';
            this._els.pauseBtn.style.display = 'none';
            this._els.pauseBtn.dataset.active = '';
            this._els.pauseBtn.style.background = 'var(--c-bg)';
            this._els.pauseBtn.style.color = 'var(--c-text)';
        }
    }

    setRecording(recording) {
        this._recording = recording;
        if (!this._els.recBtn) return;

        if (recording) {
            this._els.recBtn.style.background = 'var(--c-text)';
            this._els.recBtn.style.color = 'var(--c-bg)';
            this._els.recDot.style.color = 'var(--c-bg)';
        } else {
            this._els.recBtn.style.background = 'var(--c-bg)';
            this._els.recBtn.style.color = 'var(--c-text)';
            this._els.recDot.style.color = 'var(--c-accent)';
            if (this._els.recLabel) this._els.recLabel.textContent = 'REC';
        }
    }

  /** Upload progress while REC uploads to gallery (C4). */
    setUploadProgress(percent, message) {
        if (!this._els.recLabel) return;
        if (percent == null) {
            this._els.recLabel.textContent = this._recording ? 'REC' : 'REC';
            return;
        }
        const pct = Math.round(Math.min(100, Math.max(0, percent)));
        this._els.recLabel.textContent = message || `${pct}%`;
    }

    setFps(fps) {
        this._fps = fps;
        if (this._els.fpsSlider) {
            this._els.fpsSlider.value = String(fps);
        }
        if (this._els.fpsReadout) {
            this._els.fpsReadout.textContent = fps + ' FPS';
        }
    }

    setTimelineControlVisible(show) {
        if (!this.element) return;
        const visible = !!show;
        const d = this._dims();

        if (visible) {
            if (!this._els.timelineBtn) {
                this._renderTimelineBtn(d);
            }
            this._els.timelineBtn.style.display = '';
        } else if (this._els.timelineBtn) {
            this._els.timelineBtn.style.display = 'none';
        }
    }

    applyScriptTransportOptions(opts = {}) {
        if (opts.defaultFps != null) this.setFps(Number(opts.defaultFps));
        if (opts.showTimeline != null) this.setTimelineControlVisible(opts.showTimeline);
        if (opts.showRecord != null && opts.showRecord !== this.showRecord) {
            this.showRecord = !!opts.showRecord;
            if (this.element) {
                const hasRec = !!this._els.recBtn;
                if (this.showRecord && !hasRec) {
                    this._renderRecCell(this._dims());
                } else if (!this.showRecord && hasRec) {
                    this._els.recBtn.remove();
                    this._els.recBtn = null;
                    this._els.recDot = null;
                    this._els.recLabel = null;
                }
            }
        }
    }

    destroy() {
        if (this._fpsSliderComp) {
            this._fpsSliderComp.destroy();
            this._fpsSliderComp = null;
        }
        super.destroy();
    }
}
