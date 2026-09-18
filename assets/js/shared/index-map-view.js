/**
 * IndexMapView — shared lab/production shell for IndexMapTOC.
 * Toolbar (TREE|INDEX|MAP), status line, stage.
 */

import { BaseComponent } from './foundation.js';
import { IndexMapTOC } from './index-map-toc.js';

export class IndexMapView extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ componentType: 'index-map-view' }, deps);
        this.treeData = options.data || { label: 'INDEX', children: [] };
        this.onNavigate = options.onNavigate || null;
        this.onStateChange = options.onStateChange || null;
        this.initialState = options.initialState || { view: 'tree', open: '', focus: '' };
        this.showHeading = options.showHeading !== false;
        this.headingText = options.headingText || 'PROJECTS';
        this.tracked = [];
        this._map = null;
        this._statusEl = null;
        this._toggle = null;
    }

    _track(c) {
        this.tracked.push(c);
        this.children.add(c);
        return c;
    }

    render() {
        if (this.element) return this.element;

        this.element = this.createElement('div', 'index-map-section toc-container');

        if (this.showHeading) {
            const title = this._track(new ComponentLibrary.Heading({
                level: 1,
                content: this.headingText
            }, this.deps));
            this.appendElement(this.element, title.render());
        }

        const toolbar = this.createElement('div', 'index-map-toolbar');
        const initView = this.initialState.view || 'tree';
        this._toggle = this._track(new ComponentLibrary.ToggleGroup({
            label: 'VIEW',
            layout: 'row',
            exclusive: true,
            topBorder: true,
            selectedValue: initView,
            items: [
                { value: 'tree', label: 'TREE' },
                { value: 'index', label: 'INDEX' },
                { value: 'map', label: 'MAP' }
            ],
            onChange: (v) => {
                const next = typeof v === 'string' ? v : (Array.isArray(v) ? v[0] : 'tree');
                this._map?.setView(next);
                this._emitState();
            }
        }, this.deps));
        this.appendElement(toolbar, this._toggle.render());
        this.appendElement(this.element, toolbar);

        const status = this._track(new ComponentLibrary.Paragraph({
            content: 'READY — expand a bucket · hover a leaf for related echo · Enter twice to open'
        }, this.deps));
        this._statusEl = status.render();
        this._statusEl.classList.add('index-map-status');
        this.appendElement(this.element, this._statusEl);

        const stage = this.createElement('div', 'index-map-stage');
        this._map = this._track(new IndexMapTOC({
            data: this.treeData,
            view: initView,
            openBucketId: this.initialState.open || '',
            focusId: this.initialState.focus || '',
            focusMode: true,
            focusDepth: 1,
            stagedExpand: true,
            metaGutter: true,
            relatedHighlight: true,
            onItemClick: (item) => this._handleOpen(item),
            onStatus: (msg) => this._setStatus(msg),
            onStateChange: () => this._emitState()
        }, this.deps));
        this.appendElement(stage, this._map.render());
        this.appendElement(this.element, stage);

        queueMicrotask(() => this._map?.focusMap?.());

        return this.element;
    }

    _setStatus(text) {
        if (this._statusEl) this._statusEl.textContent = text;
    }

    _handleOpen(item) {
        const slug = item.slug || item.id;
        const label = item.label || slug || 'ITEM';
        this._setStatus(`OPEN — ${String(label).toUpperCase()}`);
        if (item.section && this.onNavigate) {
            this.onNavigate(item);
        }
    }

    _emitState() {
        if (!this._map || !this.onStateChange) return;
        this.onStateChange(this._map.getState());
    }

    getMap() { return this._map; }

    destroy() {
        if (this.tracked.length && window.ComponentLibrary) {
            ComponentLibrary.destroyTracked(this.tracked);
        }
        this.tracked = [];
        this._map = null;
        this._statusEl = null;
        super.destroy();
    }
}

export default IndexMapView;
