/**
 * ErrorPane — full-container error pane with dismiss (ToolBase-relative).
 */

import { BaseComponent } from '../../foundation.js';

export class ErrorPane extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'error-pane' }, deps);
        this.title = options.title ?? 'ERROR';
        this.detail = options.detail ?? '';
        this.dismissLabel = options.dismissLabel ?? 'DISMISS';
        this.onDismiss = options.onDismiss ?? (() => {});
    }

    render() {
        if (this.element) return this.element;

        const { F } = this.getF();

        this.element = this.createElement('div', 'error-pane');
        this.element.style.cssText = `
            position: absolute;
            inset: 0;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: var(--c-bg);
            border: 1px solid var(--c-border);
            box-sizing: border-box;
            padding: calc(var(--f) * 2);
        `;

        const hd = this.createElement('div', 'error-pane-title');
        hd.textContent = this.title.toUpperCase();
        hd.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: calc(var(--f) * 1.15);
            letter-spacing: 0.06em;
            color: var(--c-text);
            margin-bottom: ${F}px;
            text-align: center;
        `;

        const dt = this.createElement('div', 'error-pane-detail');
        dt.textContent = this.detail;
        dt.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: calc(var(--f) * 0.92);
            color: var(--c-text);
            opacity: 0.6;
            text-align: center;
            max-width: calc(var(--f) * 42);
            word-break: break-word;
        `;

        const b = this.createElement('button');
        b.type = 'button';
        b.textContent = this.dismissLabel;
        b.style.cssText = `
            margin-top: calc(var(--f) * 2);
            min-height: calc(var(--f) * 2);
            padding: 0 calc(var(--f) * 1.5);
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: var(--f);
            cursor: pointer;
        `;
        b.addEventListener('click', () => {
            try { this.onDismiss(this); } finally { this.destroy(); }
        });

        this.element.appendChild(hd);
        this.element.appendChild(dt);
        this.element.appendChild(b);

        return this.element;
    }
}
