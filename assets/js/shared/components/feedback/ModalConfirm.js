/**
 * ModalConfirm — confirm/cancel pane for BaseComponent-hosted tools (absolute inset).
 */

import { BaseComponent } from '../../foundation.js';

export class ModalConfirm extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'modal-confirm' }, deps);
        this.message = options.message ?? '';
        this.onConfirm = options.onConfirm ?? (() => {});
        this.onCancel = options.onCancel ?? (() => {});
        this.confirmLabel = options.confirmLabel ?? 'CONFIRM';
        this.cancelLabel = options.cancelLabel ?? 'CANCEL';
    }

    render() {
        if (this.element) return this.element;

        const { F, F2 } = this.getF();

        this.element = this.createElement('div', 'modal-confirm');
        this.element.style.cssText = `
            position: absolute;
            inset: 0;
            z-index: 998;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.45);
            box-sizing: border-box;
        `;

        const panel = this.createElement('div', 'modal-confirm-panel');
        panel.style.cssText = `
            width: calc(100% - ${F * 4}px);
            max-width: calc(var(--f) * 40);
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            padding: calc(var(--f) * 2);
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            gap: calc(var(--f) * 1);
        `;

        const msg = this.createElement('p', 'modal-confirm-message');
        msg.textContent = this.message;
        msg.style.cssText = `
            margin: 0;
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: var(--f);
            color: var(--c-text);
            text-align: center;
        `;

        const row = this.createElement('div', 'modal-confirm-buttons');
        row.style.cssText = `
            display: flex;
            flex-direction: row;
            gap: ${F}px;
            justify-content: center;
            margin-top: ${F2}px;
        `;

        const mkBtn = (label, inverse, fn) => {
            const b = this.createElement('button');
            b.type = 'button';
            b.textContent = label;
            b.style.cssText = `
                min-height: calc(var(--f) * 2);
                padding: 0 calc(var(--f) * 1.5);
                border: 1px solid var(--c-border);
                background: ${inverse ? 'var(--c-text)' : 'var(--c-bg)'};
                color: ${inverse ? 'var(--c-bg)' : 'var(--c-text)'};
                font-family: 'Atkinson Hyperlegible Mono', monospace;
                font-size: var(--f);
                cursor: pointer;
            `;
            b.addEventListener('click', fn);
            return b;
        };

        row.appendChild(mkBtn(this.confirmLabel, true, () => {
            try { this.onConfirm(this); } finally { this.destroy(); }
        }));
        row.appendChild(mkBtn(this.cancelLabel, false, () => {
            try { this.onCancel(this); } finally { this.destroy(); }
        }));

        panel.appendChild(msg);
        panel.appendChild(row);
        this.element.appendChild(panel);

        return this.element;
    }
}
