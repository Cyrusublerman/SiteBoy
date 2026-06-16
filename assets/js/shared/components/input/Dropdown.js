/**
 * Dropdown — custom select with anchored menu (Composite partition).
 *
 * Layout:
 *   ┌ LABEL ───────────────┐   title div (topBorder toggleable, no bottom)
 *   ├──────────────────────┤   trigger cell = shared divider top when titled
 *   │ CURRENT VALUE    +   │
 *   └──────────────────────┘
 *   (menu portal: border-system §9)
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class Dropdown extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'dropdown' }, deps);

        this.options = options.options ?? [];
        this.value = options.value ?? this._getFirstValue();
        this.label = options.label ?? '';
        this.placeholder = options.placeholder ?? 'Select...';
        this.disabled = options.disabled ?? false;
        this.topBorder = options.topBorder ?? true;
        this.embedded = options.embedded ?? false;

        this.onChange = options.onChange ?? (() => {});

        this.triggerEl = null;
        this.menuEl = null;
        this._titleDiv = null;
        this._box = null;
        this.isOpen = false;
        this.selectedIndex = this._findValueIndex(this.value);

        this._handleDocumentClick = this._handleDocumentClick.bind(this);
        this._handleKeyDown = this._handleKeyDown.bind(this);
        this._handleScroll = this._handleScroll.bind(this);
    }

    _getFirstValue() {
        if (this.options.length === 0) return '';
        const first = this.options[0];
        return typeof first === 'object' ? first.value : first;
    }

    _findValueIndex(value) {
        return this.options.findIndex(opt => {
            if (opt && typeof opt === 'object' && opt.separator) return false;
            const optValue = typeof opt === 'object' ? opt.value : opt;
            return optValue === value;
        });
    }

    _getLabel(opt) {
        if (typeof opt === 'object') {
            return opt.separator ? (opt.label ?? '') : (opt.label ?? opt.value);
        }
        return opt;
    }

    _getValue(opt) {
        if (opt && typeof opt === 'object' && opt.separator) return '\u0000__sep\u0000';
        return typeof opt === 'object' ? opt.value : opt;
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

        this.element = this.createElement('div', 'dropdown-component component');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 0;
            width: 100%;
            position: relative;
        `;

        if (this.label) {
            this._titleDiv = this.createElement('div', 'dropdown__label-row');
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
            const labelEl = this.createElement('span', 'dropdown__label');
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

        this._box = this.createElement('div', 'dropdown__box');
        this._box.style.cssText = `
            display: flex;
            width: 100%;
            height: ${F * 2 + 2}px;
            box-sizing: border-box;
            ${this._containerBorderCss()}
        `;

        this.triggerEl = this.createElement('button', 'dropdown-trigger');
        this.triggerEl.type = 'button';
        this.triggerEl.disabled = this.disabled;
        this._syncTriggerVisual(false);
        this.triggerEl.style.cssText = `
            width: 100%;
            height: 100%;
            padding: 0 ${F}px;
            border: none;
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F * 0.75}px;
            text-align: left;
            cursor: ${this.disabled ? 'not-allowed' : 'pointer'};
            box-sizing: border-box;
            display: flex;
            justify-content: space-between;
            align-items: center;
            text-transform: uppercase;
            overflow: hidden;
            white-space: nowrap;
        `;

        const triggerText = this.createElement('span', 'dropdown-trigger-text');
        triggerText.textContent = this._getCurrentLabel();
        triggerText.style.cssText = `
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            flex: 1;
            min-width: 0;
        `;
        this.triggerEl.appendChild(triggerText);

        const arrow = this.createElement('span', 'dropdown-arrow');
        arrow.textContent = '+';
        arrow.style.cssText = `flex-shrink: 0; margin-left: ${F2}px;`;
        this.triggerEl.appendChild(arrow);

        this.triggerEl.addEventListener('click', () => this.toggle());

        if (!this.disabled) {
            this.triggerEl.addEventListener('mouseenter', () => {
                if (!this.isOpen) this._setTriggerInverted(true);
            });
            this.triggerEl.addEventListener('mouseleave', () => {
                if (!this.isOpen) this._setTriggerInverted(false);
            });
        }

        this._box.appendChild(this.triggerEl);
        this.element.appendChild(this._box);

        this.menuEl = this.createElement('div', 'dropdown-menu');
        this.menuEl.style.cssText = `
            position: fixed;
            max-height: ${F * 20}px;
            overflow-y: auto;
            border: 1px solid var(--c-border);
            border-top: none;
            background: var(--c-bg);
            box-sizing: border-box;
            z-index: 10000;
            display: none;
        `;

        this._renderOptions(F);
        document.body.appendChild(this.menuEl);

        return this.element;
    }

    _syncTriggerVisual(open) {
        if (!this.triggerEl) return;
        if (this.disabled) {
            this.triggerEl.style.borderLeft = '3px solid var(--c-accent)';
            this.triggerEl.style.background = 'var(--c-bg)';
            this.triggerEl.style.color = 'var(--c-border)';
            return;
        }
        this.triggerEl.style.borderLeft = 'none';
        if (open) {
            this._setTriggerInverted(true);
        } else {
            this._setTriggerInverted(false);
        }
    }

    _setTriggerInverted(on) {
        if (!this.triggerEl || this.disabled) return;
        this.triggerEl.style.background = on ? 'var(--c-text)' : 'var(--c-bg)';
        this.triggerEl.style.color = on ? 'var(--c-bg)' : 'var(--c-text)';
    }

    _renderOptions(F) {
        if (!this.menuEl) return;
        this.menuEl.innerHTML = '';

        let itemIndex = 0;
        this.options.forEach((opt, index) => {
            if (opt && typeof opt === 'object' && opt.separator) {
                const item = this.createElement('div', 'dropdown-item dropdown-item--sep');
                item.textContent = opt.label ?? '————';
                item.style.cssText = `
                    height: ${F * 2}px;
                    line-height: ${F * 2}px;
                    padding: 0 ${F}px;
                    border-top: ${itemIndex > 0 ? '1px solid var(--c-border)' : 'none'};
                    border-bottom: none;
                    background: var(--c-bg);
                    color: var(--c-border);
                    cursor: default;
                    text-transform: uppercase;
                    font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
                    font-size: ${F * 0.75}px;
                    pointer-events: none;
                    box-sizing: border-box;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                `;
                this.menuEl.appendChild(item);
                itemIndex++;
                return;
            }

            const value = this._getValue(opt);
            const label = this._getLabel(opt);
            const isSelected = value === this.value;

            const item = this.createElement('div', 'dropdown-item');
            item.dataset.value = value;
            item.dataset.index = index;
            item.textContent = String(label).toUpperCase();
            item.style.cssText = `
                height: ${F * 2}px;
                line-height: ${F * 2}px;
                padding: 0 ${F}px;
                border-top: ${itemIndex > 0 ? '1px solid var(--c-border)' : 'none'};
                border-bottom: none;
                background: ${isSelected ? 'var(--c-text)' : 'var(--c-bg)'};
                color: ${isSelected ? 'var(--c-bg)' : 'var(--c-text)'};
                cursor: pointer;
                text-transform: uppercase;
                font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
                font-size: ${F * 0.75}px;
                box-sizing: border-box;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            `;

            item.addEventListener('click', () => this._select(value, index, true));
            item.addEventListener('mouseenter', () => {
                item.style.background = 'var(--c-text)';
                item.style.color = 'var(--c-bg)';
            });
            item.addEventListener('mouseleave', () => {
                const sel = this._getValue(this.options[index]) === this.value;
                item.style.background = sel ? 'var(--c-text)' : 'var(--c-bg)';
                item.style.color = sel ? 'var(--c-bg)' : 'var(--c-text)';
            });

            this.menuEl.appendChild(item);
            itemIndex++;
        });
    }

    _getCurrentLabel() {
        if (this.selectedIndex < 0 || this.selectedIndex >= this.options.length) {
            return this.placeholder.toUpperCase();
        }
        return String(this._getLabel(this.options[this.selectedIndex])).toUpperCase();
    }

    _select(value, index, triggerChange = true) {
        if (value === '\u0000__sep\u0000') return;
        this.value = value;
        this.selectedIndex = index;

        const textEl = this.triggerEl?.querySelector('.dropdown-trigger-text');
        if (textEl) textEl.textContent = this._getCurrentLabel();

        const { F } = this.getF();
        this._renderOptions(F);

        this.close();
        if (triggerChange) this.onChange(value);
    }

    toggle() {
        if (this.disabled) return;
        if (this.isOpen) this.close();
        else this.open();
    }

    open() {
        if (this.disabled || this.isOpen) return;

        const { F } = this.getF();
        const defaultMaxPx = F * 20;
        this.isOpen = true;

        const viewportPad = Math.max(Math.round(F * 0.5), 8);
        // Anchor the menu to the bordered box (outer edge) so it aligns flush with
        // the parent rather than being inset by the container border (composite §3).
        const anchorEl = this._box || this.triggerEl;
        const triggerRect = anchorEl.getBoundingClientRect();
        const vh = window.innerHeight;
        const vw = window.innerWidth;

        this.menuEl.style.width = `${triggerRect.width}px`;
        this.menuEl.style.display = 'block';

        const bottomAnchor = triggerRect.bottom;
        let top = bottomAnchor;
        let bottomSpace = vh - bottomAnchor - viewportPad;
        let topSpace = triggerRect.top - viewportPad;

        let maxH = Math.max(viewportPad * 2, Math.min(defaultMaxPx, bottomSpace));
        this.menuEl.style.maxHeight = `${maxH}px`;

        let menuRect = this.menuEl.getBoundingClientRect();

        if (menuRect.bottom > vh - viewportPad) {
            const flipAbove = topSpace >= bottomSpace && topSpace >= viewportPad * 3;
            if (flipAbove) {
                maxH = Math.max(viewportPad * 2, Math.min(defaultMaxPx, topSpace));
                this.menuEl.style.maxHeight = `${maxH}px`;
                menuRect = this.menuEl.getBoundingClientRect();
                top = Math.max(viewportPad, triggerRect.top - menuRect.height);
            } else {
                maxH = Math.max(viewportPad * 2, Math.min(defaultMaxPx, bottomSpace));
                this.menuEl.style.maxHeight = `${maxH}px`;
                top = bottomAnchor;
                menuRect = this.menuEl.getBoundingClientRect();
            }
        }

        top = Math.max(viewportPad, Math.min(top, vh - menuRect.height - viewportPad));

        let left = triggerRect.left;
        if (left + menuRect.width > vw - viewportPad) {
            left = Math.max(viewportPad, vw - menuRect.width - viewportPad);
        }

        this.menuEl.style.left = `${Math.round(left)}px`;
        this.menuEl.style.top = `${Math.round(top)}px`;

        this._syncTriggerVisual(true);
        const arrow = this.triggerEl.querySelector('.dropdown-arrow');
        if (arrow) arrow.textContent = '−';

        document.addEventListener('click', this._handleDocumentClick);
        document.addEventListener('keydown', this._handleKeyDown);
        window.addEventListener('scroll', this._handleScroll, true);

        const selectedItem = this.menuEl.querySelector(`[data-index="${this.selectedIndex}"]`);
        if (selectedItem) selectedItem.scrollIntoView({ block: 'nearest' });
    }

    close() {
        if (!this.isOpen) return;

        const { F } = this.getF();
        this.menuEl.style.maxHeight = `${F * 20}px`;
        this.isOpen = false;
        this.menuEl.style.display = 'none';

        this._syncTriggerVisual(false);
        const arrow = this.triggerEl?.querySelector('.dropdown-arrow');
        if (arrow) arrow.textContent = '+';

        document.removeEventListener('click', this._handleDocumentClick);
        document.removeEventListener('keydown', this._handleKeyDown);
        window.removeEventListener('scroll', this._handleScroll, true);
    }

    _handleDocumentClick(e) {
        if (!this.element.contains(e.target) && !this.menuEl?.contains(e.target)) {
            this.close();
        }
    }

    _handleScroll(e) {
        if (this.menuEl && this.menuEl.contains(e.target)) return;
        this.close();
    }

    _handleKeyDown(e) {
        if (!this.isOpen) return;
        switch (e.key) {
            case 'Escape':
                this.close();
                break;
            case 'ArrowDown':
                e.preventDefault();
                this._navigate(1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this._navigate(-1);
                break;
            case 'Enter':
                e.preventDefault();
                if (this.selectedIndex >= 0) {
                    this._select(
                        this._getValue(this.options[this.selectedIndex]),
                        this.selectedIndex,
                        true
                    );
                }
                break;
        }
    }

    _navigate(delta) {
        const newIndex = Math.max(0, Math.min(this.options.length - 1, this.selectedIndex + delta));
        if (newIndex !== this.selectedIndex) {
            this.selectedIndex = newIndex;
            const { F } = this.getF();
            this._renderOptions(F);
            const item = this.menuEl.querySelector(`[data-index="${newIndex}"]`);
            if (item) item.scrollIntoView({ block: 'nearest' });
        }
    }

    setTopBorder(on) {
        this.topBorder = !!on;
        if (this.embedded) return;
        const edge = on ? '1px solid var(--c-border)' : 'none';
        if (this._titleDiv) {
            this._titleDiv.style.borderTop = edge;
        } else if (this._box) {
            this._box.style.borderTop = edge;
        }
    }

    getValue() {
        return this.value;
    }

    setValue(value, triggerChange = true) {
        const index = this._findValueIndex(value);
        if (index >= 0) {
            this._select(value, index, triggerChange);
        }
    }

    setValueSilent(value) {
        this.setValue(value, false);
    }

    setOptions(options) {
        this.options = options;
        this.selectedIndex = this._findValueIndex(this.value);
        if (this.selectedIndex < 0 && options.length > 0) {
            this.value = this._getValue(options[0]);
            this.selectedIndex = 0;
        }
        if (this.menuEl) {
            const { F } = this.getF();
            this._renderOptions(F);
        }
        const textEl = this.triggerEl?.querySelector('.dropdown-trigger-text');
        if (textEl) textEl.textContent = this._getCurrentLabel();
    }

    destroy() {
        document.removeEventListener('click', this._handleDocumentClick);
        document.removeEventListener('keydown', this._handleKeyDown);
        window.removeEventListener('scroll', this._handleScroll, true);
        if (this.menuEl?.parentNode) {
            this.menuEl.parentNode.removeChild(this.menuEl);
        }
        super.destroy();
    }
}
