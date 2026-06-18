/**
 * SplatViewer - Gaussian splat / point cloud viewer stub (B5)
 *
 * Placeholder canvas host until gsplat/WebGL2 loader lands.
 * GPU access will route through gpu-foundation.js in full implementation.
 *
 * @extends BaseComponent
 * @version 0.1.0
 */

import { BaseComponent } from '../../foundation.js';

export class SplatViewer extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'splat-viewer' }, deps);

        this.src = options.src ?? '';
        this.alt = options.alt ?? 'Point cloud';
        this.onReady = options.onReady ?? (() => {});
    }

    render() {
        if (this.element) return this.element;

        const F = this.deps.MF?.F ?? 14;

        this.element = this.createElement('div', 'splat-viewer-host component');

        const status = this.createElement('div', 'splat-viewer-status');
        status.textContent = this.src
            ? `SPLAT STUB — ${this.alt} (loader pending)`
            : 'SPLAT STUB — assign src to preview';
        this.element.appendChild(status);

        const canvas = this.createElement('canvas', 'splat-viewer-canvas');
        canvas.width = Math.round(F * 40);
        canvas.height = Math.round(F * 30);
        canvas.setAttribute('aria-label', this.alt);
        this.element.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#808080';
            ctx.font = `${F}px Atkinson Hyperlegible, monospace`;
            ctx.fillText('SPLAT VIEWER STUB', F, F * 2);
            if (this.src) {
                ctx.fillStyle = '#c0c0c0';
                ctx.fillText(this.src, F, F * 4);
            }
        }

        this.onReady({ stub: true, src: this.src });
        return this.element;
    }

    setSrc(src) {
        this.src = src;
    }
}

export default SplatViewer;
