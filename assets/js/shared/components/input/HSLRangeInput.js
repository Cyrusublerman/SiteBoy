/**
 * HSLRangeInput — dual-handle HSL range selector.
 *
 * Renders three dual-range rows (H, S, L), each with two drag handles
 * defining a min/max within [0, 1]. Emits onChange({ h, s, l }) where
 * each channel is { min, max }.
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

const CHANNELS = [
    { key: 'h', label: 'H', trackColor: 'linear-gradient(to right,hsl(0,80%,50%),hsl(60,80%,50%),hsl(120,80%,50%),hsl(180,80%,50%),hsl(240,80%,50%),hsl(300,80%,50%),hsl(360,80%,50%))' },
    { key: 's', label: 'S', trackColor: 'linear-gradient(to right,hsl(0,0%,55%),hsl(200,100%,50%))' },
    { key: 'l', label: 'L', trackColor: 'linear-gradient(to right,#000,#888,#fff)' }
];

function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

export class HSLRangeInput extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'hsl-range-input' }, deps);

        this.label    = options.label    ?? 'HSL Range';
        this.onChange = options.onChange ?? (() => {});
        this.value    = {
            h: { min: options.hMin ?? 0,   max: options.hMax ?? 1 },
            s: { min: options.sMin ?? 0.3, max: options.sMax ?? 1 },
            l: { min: options.lMin ?? 0.2, max: options.lMax ?? 0.8 }
        };

        this._rows = {};
    }

    render() {
        if (this.element) return this.element;

        const { F, F2 } = this.getF();
        this.element = this.createElement('div', 'hsl-range-input component');
        this.element.style.cssText = `display:flex;flex-direction:column;gap:${F}px;width:100%;`;

        if (this.label) {
            const lbl = this.createElement('label', 'hsl-range-input__label');
            lbl.textContent = this.label;
            lbl.style.cssText = `font-family:'Atkinson Hyperlegible',monospace;font-size:${F}px;color:var(--c-text);`;
            this.element.appendChild(lbl);
        }

        for (const ch of CHANNELS) {
            const row = this._buildRow(ch, F, F2);
            this._rows[ch.key] = row;
            this.element.appendChild(row.el);
        }

        return this.element;
    }

    _buildRow(ch, F, F2) {
        const TRACK_H = Math.max(6, F2);
        const HANDLE_W = F2 + 2;

        const wrap = this.createElement('div', `hsl-range-input__row hsl-range-input__row--${ch.key}`);
        wrap.style.cssText = `display:flex;flex-direction:column;gap:${Math.round(F2 / 2)}px;`;

        const rowLabel = this.createElement('span');
        rowLabel.textContent = ch.label;
        rowLabel.style.cssText = `font-family:'Atkinson Hyperlegible',monospace;font-size:${Math.max(9, F - 2)}px;color:var(--c-text);text-transform:uppercase;`;
        wrap.appendChild(rowLabel);

        const trackWrap = this.createElement('div');
        trackWrap.style.cssText = `position:relative;height:${TRACK_H}px;width:100%;cursor:pointer;`;

        const track = this.createElement('div');
        track.style.cssText = `position:absolute;inset:0;background:${ch.trackColor};border:1px solid var(--c-border);`;

        const selBar = this.createElement('div');
        selBar.style.cssText = `position:absolute;top:0;bottom:0;background:rgba(255,255,255,0.25);pointer-events:none;`;

        const hMin = this.createElement('div', 'hsl-range-input__handle');
        hMin.style.cssText = `position:absolute;top:50%;transform:translateY(-50%);width:${HANDLE_W}px;height:${TRACK_H + 4}px;background:var(--c-bg);border:1px solid var(--c-text);cursor:ew-resize;box-sizing:border-box;`;

        const hMax = this.createElement('div', 'hsl-range-input__handle');
        hMax.style.cssText = hMin.style.cssText;

        trackWrap.appendChild(track);
        trackWrap.appendChild(selBar);
        trackWrap.appendChild(hMin);
        trackWrap.appendChild(hMax);
        wrap.appendChild(trackWrap);

        const numRow = this.createElement('div');
        numRow.style.cssText = `display:flex;justify-content:space-between;gap:${F2}px;`;
        const minInput = this._makeNumInput(F);
        const maxInput = this._makeNumInput(F);
        numRow.appendChild(minInput);
        numRow.appendChild(maxInput);
        wrap.appendChild(numRow);

        const row = { el: wrap, trackWrap, selBar, hMin, hMax, minInput, maxInput, ch, HANDLE_W, TRACK_H };

        const update = (minV, maxV) => {
            minV = clamp(minV, 0, 1);
            maxV = clamp(maxV, 0, 1);
            if (minV > maxV) [minV, maxV] = [maxV, minV];
            this.value[ch.key].min = minV;
            this.value[ch.key].max = maxV;
            this._positionHandles(row);
            minInput.value = minV.toFixed(2);
            maxInput.value = maxV.toFixed(2);
            this.onChange({ ...this.value });
        };

        const getX = (e) => {
            const rect = trackWrap.getBoundingClientRect();
            return clamp((e.clientX - rect.left) / rect.width, 0, 1);
        };

        const dragHandle = (isMin, startE) => {
            startE.preventDefault();
            const onMove = (e) => {
                const v = getX(e);
                if (isMin) update(v, this.value[ch.key].max);
                else update(this.value[ch.key].min, v);
            };
            const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        };

        hMin.addEventListener('mousedown', (e) => dragHandle(true, e));
        hMax.addEventListener('mousedown', (e) => dragHandle(false, e));

        minInput.addEventListener('change', () => {
            const v = parseFloat(minInput.value);
            if (!isNaN(v)) update(v, this.value[ch.key].max);
        });
        maxInput.addEventListener('change', () => {
            const v = parseFloat(maxInput.value);
            if (!isNaN(v)) update(this.value[ch.key].min, v);
        });

        this._positionHandles(row);
        minInput.value = this.value[ch.key].min.toFixed(2);
        maxInput.value = this.value[ch.key].max.toFixed(2);

        return row;
    }

    _makeNumInput(F) {
        const el = this.createElement('input');
        el.type = 'number';
        el.min = '0'; el.max = '1'; el.step = '0.01';
        el.style.cssText = `width:52px;font-family:'Atkinson Hyperlegible Mono',monospace;font-size:${Math.max(9,F-2)}px;background:var(--c-bg);color:var(--c-text);border:1px solid var(--c-border);padding:1px 2px;box-sizing:border-box;`;
        return el;
    }

    _positionHandles(row) {
        const { trackWrap, selBar, hMin, hMax, ch, HANDLE_W } = row;
        const W = trackWrap.offsetWidth || 1;
        const minV = this.value[ch.key].min;
        const maxV = this.value[ch.key].max;
        const minPx = Math.round(minV * W - HANDLE_W / 2);
        const maxPx = Math.round(maxV * W - HANDLE_W / 2);
        hMin.style.left = `${minPx}px`;
        hMax.style.left = `${maxPx}px`;
        selBar.style.left  = `${Math.round(minV * W)}px`;
        selBar.style.width = `${Math.round((maxV - minV) * W)}px`;
    }

    getValue() { return { ...this.value }; }

    setValue(v) {
        if (v.h) this.value.h = { ...this.value.h, ...v.h };
        if (v.s) this.value.s = { ...this.value.s, ...v.s };
        if (v.l) this.value.l = { ...this.value.l, ...v.l };
        for (const ch of CHANNELS) {
            const row = this._rows[ch.key];
            if (row) {
                this._positionHandles(row);
                row.minInput.value = this.value[ch.key].min.toFixed(2);
                row.maxInput.value = this.value[ch.key].max.toFixed(2);
            }
        }
    }

    destroy() {
        super.destroy();
    }
}
