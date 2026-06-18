/**
 * ModelViewer - Google model-viewer web component wrapper
 *
 * Inline GLB/GLTF/STL/OBJ preview via @google/model-viewer.
 * DOM creation confined to BaseComponent boundary.
 *
 * @extends BaseComponent
 * @version 1.0.0
 */

import { BaseComponent } from '../../foundation.js';

const MODEL_VIEWER_SCRIPT = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js';
let modelViewerLoadPromise = null;

function ensureModelViewerScript() {
    if (customElements.get('model-viewer')) return Promise.resolve();
    if (modelViewerLoadPromise) return modelViewerLoadPromise;

    modelViewerLoadPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${MODEL_VIEWER_SCRIPT}"]`);
        if (existing) {
            existing.addEventListener('load', () => resolve());
            existing.addEventListener('error', reject);
            return;
        }
        const script = document.createElement('script');
        script.type = 'module';
        script.src = MODEL_VIEWER_SCRIPT;
        script.onload = () => resolve();
        script.onerror = reject;
        document.head.appendChild(script);
    });

    return modelViewerLoadPromise;
}

export class ModelViewer extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'model-viewer' }, deps);

        this.src = options.src ?? '';
        this.alt = options.alt ?? '3D model';
        this.poster = options.poster ?? '';
        this.cameraControls = options.cameraControls !== false;
        this.autoRotate = options.autoRotate ?? false;
        this.exposure = options.exposure ?? 1;
        this.onLoad = options.onLoad ?? (() => {});
        this.onError = options.onError ?? (() => {});

        this._viewerEl = null;
        this._ready = false;
    }

    render() {
        if (this.element) return this.element;

        this.element = this.createElement('div', 'model-viewer-host component');
        this._viewerEl = this.createElement('model-viewer', 'model-viewer-element');
        this._viewerEl.setAttribute('alt', this.alt);
        this._viewerEl.setAttribute('loading', 'lazy');
        if (this.src) this._viewerEl.setAttribute('src', this.src);
        if (this.poster) this._viewerEl.setAttribute('poster', this.poster);
        if (this.cameraControls) this._viewerEl.setAttribute('camera-controls', '');
        if (this.autoRotate) this._viewerEl.setAttribute('auto-rotate', '');
        this._viewerEl.setAttribute('shadow-intensity', '1');
        this._viewerEl.setAttribute('exposure', String(this.exposure));

        this._viewerEl.addEventListener('load', () => {
            this._ready = true;
            this.onLoad();
        });
        this._viewerEl.addEventListener('error', (e) => this.onError(e));

        this.element.appendChild(this._viewerEl);
        ensureModelViewerScript().catch((err) => {
            console.error('ModelViewer script load failed:', err);
            this.onError(err);
        });

        return this.element;
    }

    setSrc(src) {
        this.src = src;
        if (this._viewerEl) {
            if (src) this._viewerEl.setAttribute('src', src);
            else this._viewerEl.removeAttribute('src');
        }
    }

    destroy() {
        this._viewerEl = null;
        this._ready = false;
        super.destroy();
    }
}

export default ModelViewer;
