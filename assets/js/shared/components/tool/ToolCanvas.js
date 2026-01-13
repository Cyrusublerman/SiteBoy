/**
 * ToolCanvas - Canvas container for tool visualization
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class ToolCanvas extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'tool-canvas' }, deps);

        this.width = options.width || 420;
        this.height = options.height || 420;
        this.statusText = options.statusText || '';
    }

    render() {
        if (this.element) return this.element;

        this.element = this.createElement('div', 'tool-canvas-container');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
        `;

        // Canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.cssText = `
            border: 1px solid var(--c-border);
            background: #000000;
            max-width: 100%;
            max-height: 100%;
        `;

        this.element.appendChild(this.canvas);

        // Status bar
        if (this.statusText) {
            const statusBar = document.createElement('div');
            statusBar.style.cssText = `
                padding: 4px 8px;
                background: var(--c-bg-secondary);
                border-top: 1px solid var(--c-border);
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: 12px;
                color: var(--c-text);
            `;
            statusBar.textContent = this.statusText;
            this.element.appendChild(statusBar);
        }

        return this.element;
    }

    getCanvas() {
        return this.canvas;
    }
}