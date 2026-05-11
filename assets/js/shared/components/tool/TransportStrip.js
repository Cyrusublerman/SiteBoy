/**
 * TransportStrip — PLAY/STOP/SPEED/TIMELINE strip rendered below the canvas.
 *
 * Replaces the Playback block in the ANIMATE sidebar tab.
 * The host mounts this component in _buildContainerLayout() below the canvas.
 *
 * Layout:
 *   [▶ PLAY]  [■ STOP]  Speed [━━━━] 1.0×  [TIMELINE ▾]
 *
 * Emits: onChange(key, value) for:
 *   'playPause'      → null
 *   'stopReset'      → null
 *   'animSpeed'      → number
 *   'toggleTimeline' → null
 *
 * The host calls:
 *   setPlaying(bool)  — to update play/pause button label
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class GeneratorTransportStrip extends BaseComponent {
    /**
     * @param {Object} options
     * @param {number}   [options.defaultSpeed]   - Initial speed value (default 1)
     * @param {boolean}  [options.showTimeline]   - Show timeline button (default false)
     * @param {Function} options.onChange         - (key, value) => void
     */
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'transport-strip' }, deps);

        this.defaultSpeed   = options.defaultSpeed ?? 1;
        this.showTimeline   = options.showTimeline  ?? false;
        this.onChange       = options.onChange      ?? (() => {});

        this._playing = false;
        this._els = {};
    }

    render() {
        if (this.element) return this.element;

        const { F } = this.getF();

        this.element = this.createElement('div', 'transport-strip component');
        this.element.style.cssText = `
            display: flex;
            align-items: center;
            gap: 0;
            height: ${F * 2}px;
            border-top: 1px solid var(--c-border);
            background: var(--c-bg);
            flex-shrink: 0;
        `;

        // PLAY / PAUSE button
        this._els.playBtn = this._makeBtn('▶ PLAY', F, () => {
            this.onChange('playPause', null);
        });
        this.element.appendChild(this._els.playBtn);

        // STOP button
        const stopBtn = this._makeBtn('■ STOP', F, () => {
            this.onChange('stopReset', null);
        });
        this.element.appendChild(stopBtn);

        // Divider
        this.element.appendChild(this._divider(F));

        // Speed label
        const speedLbl = this.createElement('span');
        speedLbl.textContent = 'SPEED';
        speedLbl.style.cssText = `
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${F}px;
            color: var(--c-text);
            padding: 0 ${F * 0.5}px;
            white-space: nowrap;
            flex-shrink: 0;
        `;
        this.element.appendChild(speedLbl);

        // Speed slider
        const speedSlider = this.createElement('input');
        speedSlider.type  = 'range';
        speedSlider.min   = '0.1';
        speedSlider.max   = '5';
        speedSlider.step  = '0.1';
        speedSlider.value = String(this.defaultSpeed);
        speedSlider.style.cssText = `width: ${F * 10}px; cursor: pointer; flex-shrink: 0;`;
        speedSlider.addEventListener('input', (e) => {
            const v = parseFloat(e.target.value);
            speedNum.textContent = v.toFixed(1) + '×';
            this.onChange('animSpeed', v);
        });
        this._els.speedSlider = speedSlider;
        this.element.appendChild(speedSlider);

        // Speed readout
        const speedNum = this.createElement('span');
        speedNum.textContent = this.defaultSpeed.toFixed(1) + '×';
        speedNum.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F}px;
            color: var(--c-text);
            width: ${F * 3}px;
            text-align: right;
            padding-right: ${F * 0.5}px;
            flex-shrink: 0;
        `;
        this._els.speedNum = speedNum;
        this.element.appendChild(speedNum);

        // Timeline button (conditional)
        if (this.showTimeline) {
            this.element.appendChild(this._divider(F));
            const timelineBtn = this._makeBtn('TIMELINE', F, () => {
                this.onChange('toggleTimeline', null);
            });
            this._els.timelineBtn = timelineBtn;
            this.element.appendChild(timelineBtn);
        }

        return this.element;
    }

    _makeBtn(label, F, onClick) {
        const btn = this.createElement('button');
        btn.type = 'button';
        btn.textContent = label;
        btn.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 ${F}px;
            height: ${F * 2}px;
            border: none;
            border-right: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${F}px;
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

    _divider(F) {
        const d = this.createElement('div');
        d.style.cssText = `
            width: 1px;
            height: ${F * 1.25}px;
            background: var(--c-border);
            flex-shrink: 0;
            margin: 0 ${F * 0.5}px;
        `;
        return d;
    }

    /** Update play/pause button label to reflect current state. */
    setPlaying(playing) {
        this._playing = playing;
        if (this._els.playBtn) {
            this._els.playBtn.textContent = playing ? '‖ PAUSE' : '▶ PLAY';
        }
    }

    /** Update speed slider from outside (e.g. preset load). */
    setSpeed(speed) {
        if (this._els.speedSlider) {
            this._els.speedSlider.value = String(speed);
            this._els.speedNum.textContent = speed.toFixed(1) + '×';
        }
    }

    destroy() {
        super.destroy();
    }
}
