/**
 * PaletteTable — stacked palette rows in one outer partition.
 *
 * Layout (gap: 0; border-top dividers between rows):
 *   ┌ row 0 ─────────────┐
 *   ├ row 1 ─────────────┤
 *   └ row N ─────────────┘
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';
import { PaletteRow } from './PaletteRow.js';

export class PaletteTable extends BaseComponent {
    /**
     * @param {Object} options
     * @param {Object[]} [options.layers]
     * @param {Function} [options.onChange]   - (layerId, patch) => void
     * @param {Function} [options.onModulate] - (layerId) => void
     * @param {boolean}  [options.topBorder]
     */
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'palette-table' }, deps);

        this.layers = options.layers ?? [];
        this.topBorder = options.topBorder ?? true;

        this.onChange = options.onChange ?? (() => {});
        this.onModulate = options.onModulate ?? (() => {});

        this._box = null;
        this._rows = [];
    }

    _renderRows() {
        this._rows = [];
        while (this._box.firstChild) {
            this._box.removeChild(this._box.firstChild);
        }

        this.layers.forEach((layer, index) => {
            const row = new PaletteRow({
                layer,
                embedded: true,
                topBorder: index > 0,
                hasModulator: layer.hasModulator ?? false,
                modEnabled: layer.modEnabled ?? false,
                onChange: (layerId, patch) => this.onChange(layerId, patch),
                onModulate: (layerId) => this.onModulate(layerId),
            }, this.deps);
            this.addChild(row);
            this._rows.push(row);
            const rowEl = row.render();
            rowEl.style.width = '100%';
            this._box.appendChild(rowEl);
        });
    }

    render() {
        if (this.element) return this.element;

        this.element = this.createElement('div', 'palette-table component');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 0;
            width: 100%;
        `;

        this._box = this.createElement('div', 'palette-table__box');
        this._box.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 0;
            width: 100%;
            box-sizing: border-box;
            border-top: ${this.topBorder ? '1px solid var(--c-border)' : 'none'};
            border-right: 1px solid var(--c-border);
            border-bottom: 1px solid var(--c-border);
            border-left: 1px solid var(--c-border);
        `;

        this._renderRows();
        this.element.appendChild(this._box);

        return this.element;
    }

    setTopBorder(on) {
        this.topBorder = !!on;
        if (this._box) {
            this._box.style.borderTop = on ? '1px solid var(--c-border)' : 'none';
        }
    }

    setLayers(layers) {
        this.layers = layers ?? [];
        if (!this._box) return;
        this._rows.forEach((row) => row.destroy());
        this._renderRows();
    }

    setRowModState(layerId, hasModulator, enabled) {
        const index = this.layers.findIndex((l) => l.id === layerId);
        if (index >= 0 && this._rows[index]) {
            this._rows[index].setModState(hasModulator, enabled);
        }
    }

    destroy() {
        super.destroy();
    }
}
