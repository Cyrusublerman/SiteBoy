/**
 * ModulatorChip — compact inline chip rendered next to each modulatable param.
 *
 * States:
 *   • No modulator declared  → [+ MOD]  (add button)
 *   • Modulator disabled     → [MOD OFF] (grey)
 *   • Modulator enabled      → [MOD: lfo∿]  (active summary, accent text)
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
            height: ${F * 1.5}px;
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
            height: ${F * 1.5}px;
            padding: 0 ${F * 0.5}px;
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F * 0.75}px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            cursor: pointer;
            white-space: nowrap;
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
        const { F } = this.getF();
        const mod = this.modulator;

        if (!mod) {
            this._btn.textContent = '+ mod';
            this._btn.style.color  = 'var(--c-border)';
            this._btn.style.border = `1px solid var(--c-border)`;
        } else if (!mod.enabled) {
            const icon = DRIVER_ICONS[mod.driver?.type] ?? '?';
            this._btn.textContent = `mod ${icon}`;
            this._btn.style.color  = 'var(--c-text)';
            this._btn.style.border = `1px solid var(--c-border)`;
        } else {
            const icon = DRIVER_ICONS[mod.driver?.type] ?? '?';
            this._btn.textContent = `mod ${icon}`;
            this._btn.style.color  = 'var(--c-accent)';
            this._btn.style.border = `1px solid var(--c-accent)`;
        }

        if (this._panelOpen) {
            this._btn.style.background = 'var(--c-border)';
        } else {
            this._btn.style.background = 'var(--c-bg)';
        }
    }

    /** Update the modulator reference (called by host after state changes). */
    setModulator(modulator) {
        this.modulator = modulator;
        this._update();
    }

    /** Sync panel-open visual state without triggering callbacks. */
    setPanelOpen(open) {
        this._panelOpen = open;
        this._update();
    }

    destroy() {
        super.destroy();
    }
}
