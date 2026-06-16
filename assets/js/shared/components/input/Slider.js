/**
 * Slider - standalone monochrome range primitive.
 *
 * Single owner of `<input type="range">` markup and behaviour. Other
 * components (NumericInput, TransportStrip, ModulatorPanel, GradientStops) compose this
 * rather than building their own range inputs, so every slider on the site is
 * visually and behaviourally identical.
 *
 * Visual styling (track + thumb) lives in `assets/css/components.css` under
 * `.slider`; this component only supplies the F-derived sizing custom
 * properties, since pseudo-elements cannot be styled inline.
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class Slider extends BaseComponent {
    /**
     * @param {Object} options
     * @param {number}   [options.min]
     * @param {number}   [options.max]
     * @param {number}   [options.step]
     * @param {number}   [options.value]
     * @param {number}   [options.trackHF] - Track + thumb height in F units (default 2 = full control row)
     * @param {number}   [options.thumbWF] - Thumb width in F units (default 0.5)
     * @param {Object}   [options.borders] - Per-edge track border toggles { top, right, bottom, left }.
     *                                        Default all true. Disable edges to avoid double borders
     *                                        when nested inside an already-bordered container.
     * @param {string}   [options.ariaLabel]
     * @param {Function} [options.onInput]  - Continuous (drag) value change
     * @param {Function} [options.onChange] - Committed value change
     */
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'slider' }, deps);

        this.min   = options.min ?? 0;
        this.max   = options.max ?? 100;
        this.step  = options.step ?? 1;
        this.value = options.value ?? this.min;

        this.trackHF = options.trackHF ?? 2;
        this.thumbWF = options.thumbWF ?? 0.5;

        this.borders = { top: true, right: true, bottom: true, left: true, ...(options.borders || {}) };

        this.ariaLabel = options.ariaLabel ?? '';
        this.onInput   = options.onInput  ?? (() => {});
        this.onChange  = options.onChange ?? (() => {});
    }

    render() {
        if (this.element) return this.element;

        const { F } = this.getF();

        this.element = this.createElement('input', 'slider component');
        this.element.type  = 'range';
        this.element.min   = String(this.min);
        this.element.max   = String(this.max);
        this.element.step  = String(this.step);
        this.element.value = String(this.value);
        if (this.ariaLabel) this.element.setAttribute('aria-label', this.ariaLabel);

        const trackPx = F * this.trackHF;
        const edge = (on) => (on ? '1px solid var(--c-border)' : 'none');
        const topB = this.borders.top ? 1 : 0;
        const botB = this.borders.bottom ? 1 : 0;

        const s = this.element.style;
        s.setProperty('--slider-track-h', `${trackPx}px`);
        s.setProperty('--slider-thumb-w', `${F * this.thumbWF}px`);
        // Thumb fills the track interior exactly (track height minus the borders it draws),
        // so the bar lines up vertically instead of overflowing by the border width.
        s.setProperty('--slider-thumb-h', `${trackPx - topB - botB}px`);
        s.setProperty('--slider-bd-top', edge(this.borders.top));
        s.setProperty('--slider-bd-right', edge(this.borders.right));
        s.setProperty('--slider-bd-bottom', edge(this.borders.bottom));
        s.setProperty('--slider-bd-left', edge(this.borders.left));

        this.element.addEventListener('input', (e) => {
            this.value = parseFloat(e.target.value);
            this.onInput(this.value);
        });
        this.element.addEventListener('change', (e) => {
            this.value = parseFloat(e.target.value);
            this.onChange(this.value);
        });

        return this.element;
    }

    getValue() {
        return this.value;
    }

    setValue(val, triggerChange = false) {
        this.value = val;
        if (this.element) this.element.value = String(val);
        if (triggerChange) this.onChange(val);
    }

    setRange(min, max) {
        this.min = min;
        this.max = max;
        if (this.element) {
            this.element.min = String(min);
            this.element.max = String(max);
        }
    }

    destroy() {
        super.destroy();
    }
}
