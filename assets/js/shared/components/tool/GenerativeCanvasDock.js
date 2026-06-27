/**
 * GenerativeCanvasDock — wraps ToolBase `.tool-canvas-area` internals in a deterministic
 * flex column: viewport · chrome stack (SPEED strip · optional SequencerV2 strip below).
 *
 * Transport sits immediately above the timeline so expanding the timeline grows downward and
 * the viewport shrinks — the transport moves up with the canvas edge (paired chrome).
 *
 * Layout is applied in JS (`element.style`), not stylesheet rules — matches ToolBase/PageContainer patterns.
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class GenerativeCanvasDock extends BaseComponent {
    /**
     * @param {object} options
     * @param {boolean} [options.showTimelineSlot=false] — reserve slot below transport for SequencerV2 strip
     * @param {object} deps
     */
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'generative-canvas-dock' }, deps);
        this.showTimelineSlot = options.showTimelineSlot === true;
        this.showEquationSlot = options.showEquationSlot !== false;
        this.viewportSlotEl = null;
        this.chromeStackEl = null;
        this.equationSlotEl = null;
        this.transportAnchorEl = null;
        this.timelineSlotEl = null;
        this._timelineVisible = false;
    }

    _spec() {
        return this.deps.MF.calculateDimensions('generative-canvas-dock');
    }

    _isPortraitCanvasColumn() {
        if (typeof window === 'undefined') return false;
        return window.innerWidth < window.innerHeight || window.innerWidth < 800;
    }

    /**
     * Recompute dock + viewport + timeline inline geometry (call after resize / ToolBase rebuild).
     */
    refreshLayoutGeometry() {
        if (!this.element || !this.deps.MF) return;
        const portrait = this._isPortraitCanvasColumn();

        const rootParts = [
            'box-sizing:border-box',
            'display:flex',
            'flex-direction:column',
            'align-items:stretch',
            'justify-content:flex-start',
            'width:100%',
            'min-height:0',
            'min-width:0',
            'overflow:hidden',
            'background:var(--c-bg)',
        ];
        if (portrait) rootParts.push('flex:1 1 0%');
        else rootParts.push('height:100%');
        this.element.style.cssText = rootParts.join(';');

        if (this.viewportSlotEl) {
            this.viewportSlotEl.style.cssText = [
                'box-sizing:border-box',
                'display:flex',
                'flex-direction:column',
                'flex:1 1 0',
                'min-height:0',
                'min-width:0',
                'overflow:hidden',
            ].join(';');
        }

        if (this.chromeStackEl) {
            // The chrome stack is one unified Composite Partition (transport row +
            // timeline rows). It owns the single outer top border (the stack edge
            // against the viewport); inner Cells never re-declare it (I4/I6).
            this.chromeStackEl.style.cssText = [
                'box-sizing:border-box',
                'display:flex',
                'flex-direction:column',
                'flex-shrink:0',
                'min-width:0',
                'border-top:1px solid var(--c-border)',
            ].join(';');
        }

        if (this.transportAnchorEl) {
            this.transportAnchorEl.style.cssText = [
                'box-sizing:border-box',
                'flex-shrink:0',
                'min-width:0',
            ].join(';');
        }

        if (this.equationSlotEl && this.showEquationSlot) {
            this.equationSlotEl.style.cssText = [
                'box-sizing:border-box',
                'flex-shrink:0',
                'min-width:0',
            ].join(';');
        }

        if (this.timelineSlotEl && this.showTimelineSlot) {
            this.setTimelineVisible(this._timelineVisible);
        }
    }

    /**
     * Mount or re-mount: absorbs all `.tool-canvas-area` native children except this dock root and transport strip,
     * then ensures dock root + transport strip order inside the canvas area.
     * @param {HTMLElement} canvasArea — ToolBase `this.canvasArea`
     */
    mountIntoCanvasArea(canvasArea) {
        if (!canvasArea || !this.element || !this.viewportSlotEl) return;
        const dock = this.element;
        const TRANSPORT = '[data-generator-transport-strip]';

        [...canvasArea.children].forEach((ch) => {
            if (ch === dock) return;
            if (ch.matches?.(TRANSPORT)) return;
            this.appendElement(this.viewportSlotEl, ch);
        });

        let transportEl = canvasArea.querySelector(TRANSPORT);
        if (!transportEl && dock.querySelector(TRANSPORT)) {
            transportEl = dock.querySelector(TRANSPORT);
        }

        if (!canvasArea.contains(dock)) {
            this.appendElement(canvasArea, dock);
        }

        const anchor = this.transportAnchorEl;
        if (transportEl && anchor && transportEl.parentNode !== anchor) {
            this.appendElement(anchor, transportEl);
        }

        this.refreshLayoutGeometry();
    }

    /** Append SPEED strip inside chrome stack above the timeline slot (no-op if already mounted). */
    appendTransportStrip(stripEl) {
        if (!this.transportAnchorEl || !stripEl) return;
        stripEl.dataset.generatorTransportStrip = 'true';
        if (!this.transportAnchorEl.contains(stripEl)) {
            this.appendElement(this.transportAnchorEl, stripEl);
        }
        this.refreshLayoutGeometry();
    }

    render() {
        if (this.element) return this.element;

        this.element = this.createElement('div', 'generative-canvas-dock component');

        this.viewportSlotEl = this.createElement('div', 'generative-canvas-dock-viewport');
        this.viewportSlotEl.style.cssText = [
            'box-sizing:border-box',
            'display:flex',
            'flex-direction:column',
            'flex:1 1 0',
            'min-height:0',
            'min-width:0',
            'overflow:hidden',
        ].join(';');
        this.appendElement(this.element, this.viewportSlotEl);

        this.chromeStackEl = this.createElement('div', 'generative-canvas-dock-chrome');

        if (this.showEquationSlot) {
            this.equationSlotEl = this.createElement('div', 'generative-canvas-dock-equations');
            this.appendElement(this.chromeStackEl, this.equationSlotEl);
        }

        this.transportAnchorEl = this.createElement('div', 'generative-canvas-dock-transport');
        this.appendElement(this.chromeStackEl, this.transportAnchorEl);

        if (this.showTimelineSlot) {
            this.timelineSlotEl = this.createElement('div', 'generative-canvas-dock-timeline');
            this.appendElement(this.chromeStackEl, this.timelineSlotEl);
        }

        this.appendElement(this.element, this.chromeStackEl);

        this.refreshLayoutGeometry();

        if (this.deps.Resize?.subscribe) {
            this.resizeToken = this.deps.Resize.subscribe(() => this.refreshLayoutGeometry());
        }

        return this.element;
    }

    getViewportSlot() {
        return this.viewportSlotEl;
    }

    getEquationSlot() {
        return this.equationSlotEl;
    }

    getTimelineSlot() {
        return this.timelineSlotEl;
    }

    /**
     * Expand / collapse sequencer strip region (timeline grows below SPEED strip).
     * @param {boolean} visible
     */
    setTimelineVisible(visible) {
        this._timelineVisible = !!visible;
        if (!this.timelineSlotEl || !this.showTimelineSlot || !this.deps.MF) return;

        const { dimensions, F } = this._spec();
        const minH = dimensions.sequencerTimelineMinHeight ?? F * 4;

        if (this._timelineVisible) {
            this.timelineSlotEl.style.cssText = [
                'box-sizing:border-box',
                'flex-shrink:0',
                `min-height:${minH}px`,
                'overflow-x:auto',
                'overflow-y:hidden',
                'border-top:1px solid var(--c-border)',
            ].join(';');
        } else {
            this.timelineSlotEl.style.cssText = [
                'box-sizing:border-box',
                'flex-shrink:0',
                'height:0',
                'min-height:0',
                'overflow:hidden',
                'border:none',
                'margin:0',
                'padding:0',
            ].join(';');
        }
    }

    /**
     * Release Resize subscription only — DOM may move with mountIntoCanvasArea().
     */
    detachSubscriptions() {
        if (this.resizeToken && this.deps?.Resize?.unsubscribe) {
            this.deps.Resize.unsubscribe(this.resizeToken);
            this.resizeToken = null;
        }
    }

    destroy() {
        this.detachSubscriptions();
        super.destroy();
    }
}
