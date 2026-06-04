/**
 * ModulatorChip — compact inline chip rendered next to each modulatable param.
 *
 * States:
 *   • No modulator declared  → [+ MOD]  (add button)
 *   • Modulator disabled     → [MOD OFF]
 *   • Modulator enabled      → [MOD: lfo∿]
 *
 * Click opens/closes the associated ModulatorPanel (sibling in the DOM managed
 * by parameter-builder.js). The chip does not own the panel; it emits:
 *   onTogglePanel(targetKey)  — request to open/close the panel
 *   onAdd(targetKey)          — request to create a default modulator
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

const DRIVER_ICONS = {
    lfo:        '∿',
    linear:     '/',
    expression: 'ƒ',
    'param-ref': '⇌',
    curve:      '⌒',
    link:       '⊗',
    noise:      '~',
};

export class ModulatorChip extends BaseComponent {
    /**
     * @param {Object} options
     * @param {string}   options.targetKey  - Param key this chip targets
     * @param {Object|null} options.modulator - Current ModulatorDescriptor or null
     * @param {Function} options.onTogglePanel - (targetKey) => void
     * @param {Function} options.onAdd         - (targetKey) => void
     */
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'modulator-chip' }, deps);

        this.targetKey     = options.targetKey     ?? '';
        this.modulator     = options.modulator     ?? null;
        this.onTogglePanel = options.onTogglePanel ?? (() => {});
        this.onAdd         = options.onAdd         ?? (() => {});

        this._panelOpen = false;
    }

    render() {
        if (this.element) return this.element;

        const { F } = this.getF();

        this.element = this.createElement('div', 'modulator-chip component');
        this.element.style.cssText = `
            display: inline-flex;
            align-items: center;
            height: ${F * 2}px;
            flex-shrink: 0;
            cursor: pointer;
            user-select: none;
        `;

        this._btn = this.createElement('button', 'modulator-chip__btn');
        this._btn.type = 'button';
        this._btn.style.cssText = `
            display: inline-flex;
            align-items: center;
            justify-content: center;
            height: ${F * 2}px;
            padding: 0 ${F}px;
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F * 0.75}px;
            text-transform: uppercase;
            cursor: pointer;
            white-space: nowrap;
            box-sizing: border-box;
        `;

        this._update();

        this._btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!this.modulator) {
                this.onAdd(this.targetKey);
            } else {
                this._panelOpen = !this._panelOpen;
                this.onTogglePanel(this.targetKey, this._panelOpen);
                this._update();
            }
        });

        this.element.appendChild(this._btn);
        return this.element;
    }

    _update() {
        if (!this._btn) return;
        const mod = this.modulator;
        const inverted = this._panelOpen;

        if (!mod) {
            this._btn.textContent = '+ mod';
        } else {
            const icon = DRIVER_ICONS[mod.driver?.type] ?? '?';
            this._btn.textContent = mod.enabled ? `mod ${icon}` : `mod ${icon}`;
        }

        this._btn.style.border = '1px solid var(--c-border)';
        if (inverted) {
            this._btn.style.background = 'var(--c-text)';
            this._btn.style.color = 'var(--c-bg)';
        } else if (!mod) {
            this._btn.style.background = 'var(--c-bg)';
            this._btn.style.color = 'var(--c-border)';
        } else {
            this._btn.style.background = 'var(--c-bg)';
            this._btn.style.color = 'var(--c-text)';
        }
    }

    setModulator(modulator) {
        this.modulator = modulator;
        this._update();
    }

    setPanelOpen(open) {
        this._panelOpen = open;
        this._update();
    }

    destroy() {
        super.destroy();
    }
}
