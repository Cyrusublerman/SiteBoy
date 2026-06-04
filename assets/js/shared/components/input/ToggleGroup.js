/**
 * ToggleGroup — segmented toggle/radio/checkbox group rendered as one
 * bordered Partition (Composite Component Construction, worked example B).
 *
 * Layout (one outer Partition; no gaps; shared boundaries only):
 *   ┌ LABEL ───────────────┐   title div (top border toggleable, no bottom)
 *   ├───────────────────────┤   items box top = shared divider
 *   │ ITEM A                │   list: each later row owns border-top
 *   │ ITEM B  (inverted)    │   state by full-row inversion
 *   └───────────────────────┘
 *
 * Modes:
 *   layout: 'list'  — vertical stack (border-top dividers)
 *   layout: 'row'   — horizontal stack (border-left dividers)
 *   layout: 'grid'  — grid (border-left + border-top dividers)
 *   exclusive: true — radio behaviour (single select)
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class ToggleGroup extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'toggle-group' }, deps);

        this.items = options.items ?? []; // [{value, label}] or ['string']
        this.layout = options.layout ?? 'list'; // 'list' | 'row' | 'grid'
        this.gridColumns = options.gridColumns ?? 2;
        this.exclusive = options.exclusive ?? false;
        this.label = options.label ?? '';

        // State
        this.selectedValues = options.selectedValues ?? [];
        this.selectedValue = options.selectedValue ?? null; // For exclusive mode

        // Stack edge (border-system §3). Off when this composite sits directly
        // below another bordered sibling so the shared edge is not doubled.
        this.topBorder = options.topBorder ?? true;
        // Embedded inside another composite: suppress the outer box (top/right/
        // bottom) and keep only border-left as a divider (Contract C1).
        this.embedded = options.embedded ?? false;

        this.onChange = options.onChange ?? (() => {});

        this.checkboxElements = [];
        this.itemElements = [];
        this._titleDiv = null;
        this._itemsContainer = null;
    }

    render() {
        if (this.element) return this.element;

        const { F, F2 } = this.getF();

        this.element = this.createElement('div', 'toggle-group component');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 0;
            width: 100%;
        `;

        // Title div — attached above the items box, sharing its top edge.
        // Left/right always; top toggles per stack position; no bottom
        // (items box top is the shared divider). Same as ExpressionParam step 7.
        if (this.label) {
            this._titleDiv = this.createElement('div', 'toggle-group__label-row');
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

            const labelEl = this.createElement('span', 'toggle-group__label');
            labelEl.textContent = this.label.toUpperCase();
            labelEl.style.cssText = `
                font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
                font-size: ${F * 0.75}px;
                color: var(--c-text);
                text-transform: uppercase;
                text-align: left;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            `;
            this._titleDiv.appendChild(labelEl);
            this.element.appendChild(this._titleDiv);
        }

        // Items container = outer Partition. gap: 0; box-sizing: border-box.
        const container = this.createElement('div', 'toggle-group-items');
        this._itemsContainer = container;
        const cols = Math.max(1, this.gridColumns | 0);
        const display = this.layout === 'row'
            ? 'display: flex; flex-direction: row; flex-wrap: nowrap;'
            : this.layout === 'grid'
                ? `display: grid; grid-template-columns: repeat(${cols}, minmax(0, 1fr));`
                : 'display: flex; flex-direction: column;';
        container.style.cssText = `
            ${display}
            gap: 0;
            width: 100%;
            ${this._containerBorderCss()}
        `;

        this.checkboxElements = [];
        this.itemElements = [];

        this.items.forEach((item, index) => {
            const value = typeof item === 'object' ? item.value : item;
            const label = typeof item === 'object' ? (item.label ?? item.value) : item;
            const isChecked = this._isChecked(value);

            const itemEl = this.createElement('label', 'toggle-group-item');
            itemEl.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: flex-start;
                height: ${F * 2}px;
                padding: 0 ${F}px;
                cursor: pointer;
                font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
                font-size: ${F * 0.75}px;
                text-transform: uppercase;
                text-align: left;
                background: ${isChecked ? 'var(--c-text)' : 'var(--c-bg)'};
                color: ${isChecked ? 'var(--c-bg)' : 'var(--c-text)'};
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                box-sizing: border-box;
                ${this._cellDividerCss(index, cols)}
            `;

            // Hidden input drives value/form semantics; the visual is row inversion.
            const checkbox = this.createElement('input', 'toggle-group-checkbox');
            checkbox.type = this.exclusive ? 'radio' : 'checkbox';
            checkbox.name = this.exclusive ? `toggle-group-${this.id}` : '';
            checkbox.value = value;
            checkbox.checked = isChecked;
            checkbox.style.cssText = `
                position: absolute;
                opacity: 0;
                width: 0;
                height: 0;
                pointer-events: none;
            `;

            checkbox.addEventListener('change', (e) => {
                if (this.exclusive) {
                    this.selectedValue = value;
                    this._syncAllVisuals();
                    this.onChange(value);
                } else {
                    if (e.target.checked) {
                        if (!this.selectedValues.includes(value)) {
                            this.selectedValues.push(value);
                        }
                    } else {
                        const idx = this.selectedValues.indexOf(value);
                        if (idx >= 0) this.selectedValues.splice(idx, 1);
                    }
                    this._syncAllVisuals();
                    this.onChange([...this.selectedValues]);
                }
            });

            // Hover inverts; on leave, restore to the item's checked state.
            itemEl.addEventListener('mouseenter', () => this._setInverted(itemEl, true));
            itemEl.addEventListener('mouseleave', () => this._setInverted(itemEl, this._isChecked(value)));

            const labelText = this.createElement('span', 'toggle-group-item-label');
            labelText.textContent = String(label).toUpperCase();
            labelText.style.cssText = `
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            `;

            itemEl.appendChild(checkbox);
            itemEl.appendChild(labelText);
            container.appendChild(itemEl);

            this.checkboxElements.push(checkbox);
            this.itemElements.push(itemEl);
        });

        this.element.appendChild(container);

        return this.element;
    }

    /** Outer Partition border. Embedded → border-left divider only (Contract C1). */
    _containerBorderCss() {
        if (this.embedded) {
            return `
                border-top: none;
                border-right: none;
                border-bottom: none;
                border-left: 1px solid var(--c-border);
            `;
        }
        // With a title div above, the container top is always the shared divider
        // (the title owns the toggleable outer top edge). Without a title, the
        // container top is the stack edge controlled by topBorder.
        const top = this.label ? true : this.topBorder;
        return `
            border-top: ${top ? '1px solid var(--c-border)' : 'none'};
            border-right: 1px solid var(--c-border);
            border-bottom: 1px solid var(--c-border);
            border-left: 1px solid var(--c-border);
        `;
    }

    /**
     * Per-cell divider. List = vertical stack (border-top, border-system §3);
     * row = horizontal stack (border-left, §4); grid = both. First cell in each
     * axis has no leading divider; the container owns the outer edges.
     */
    _cellDividerCss(index, cols) {
        if (this.layout === 'row') {
            return `border-left: ${index > 0 ? '1px solid var(--c-border)' : 'none'};`;
        }
        if (this.layout === 'grid') {
            const col = index % cols;
            const left = col > 0 ? '1px solid var(--c-border)' : 'none';
            const top = index >= cols ? '1px solid var(--c-border)' : 'none';
            return `border-left: ${left}; border-top: ${top};`;
        }
        return `border-top: ${index > 0 ? '1px solid var(--c-border)' : 'none'};`;
    }

    _isChecked(value) {
        return this.exclusive
            ? this.selectedValue === value
            : this.selectedValues.includes(value);
    }

    _setInverted(itemEl, on) {
        itemEl.style.background = on ? 'var(--c-text)' : 'var(--c-bg)';
        itemEl.style.color = on ? 'var(--c-bg)' : 'var(--c-text)';
    }

    _syncAllVisuals() {
        this.itemElements.forEach((itemEl, i) => {
            const itemValue = typeof this.items[i] === 'object' ? this.items[i].value : this.items[i];
            const checked = this._isChecked(itemValue);
            if (this.checkboxElements[i]) this.checkboxElements[i].checked = checked;
            this._setInverted(itemEl, checked);
        });
    }

    /**
     * Toggle the stack-edge top border. With a label, this is the title div's
     * top; without one, the items container's top (vertical-stack rule §3).
     */
    setTopBorder(on) {
        this.topBorder = !!on;
        if (this.embedded) return;
        const edge = on ? '1px solid var(--c-border)' : 'none';
        if (this._titleDiv) {
            this._titleDiv.style.borderTop = edge;
        } else if (this._itemsContainer) {
            this._itemsContainer.style.borderTop = edge;
        }
    }

    getValue() {
        return this.exclusive ? this.selectedValue : [...this.selectedValues];
    }

    setValue(value) {
        if (this.exclusive) {
            this.selectedValue = value;
        } else {
            this.selectedValues = Array.isArray(value) ? [...value] : [value];
        }
        this._syncAllVisuals();
    }
}
