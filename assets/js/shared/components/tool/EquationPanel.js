/**
 * EquationPanel — collapsible MathJax equation strip for generative tool canvas dock.
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class EquationPanel extends BaseComponent {
    /**
     * @param {object} options
     * @param {boolean} [options.expanded=true]
     * @param {object} deps
     */
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'equation-panel' }, deps);
        this.expanded = options.expanded !== false;
        this._equations = [];
        this._params = {};
        this._headerEl = null;
        this._caretEl = null;
        this._bodyEl = null;
        this._typesetToken = 0;
        this._updateRafId = null;
    }

    _spec() {
        return this.deps.MF?.calculateDimensions('equation-panel') ?? { F: 14, dimensions: {} };
    }

    _dockSpec() {
        return this.deps.MF?.calculateDimensions('generative-canvas-dock') ?? { F: 14, dimensions: {} };
    }

    render() {
        if (this.element) return this.element;

        const { F, dimensions } = this._spec();
        const headerH = dimensions.headerHeight ?? F;

        this.element = this.createElement('div', 'equation-panel component');

        this._headerEl = this.createElement('button', 'equation-panel-header');
        this._headerEl.type = 'button';
        this._headerEl.style.cssText = [
            'box-sizing:border-box',
            'display:flex',
            'align-items:center',
            'width:100%',
            `height:${headerH}px`,
            'padding:0',
            'margin:0',
            'border:none',
            'border-bottom:1px solid var(--c-border)',
            'background:var(--c-bg)',
            'color:var(--c-text)',
            'font-family:\'Atkinson Hyperlegible\',\'Atkinson Hyperlegible Mono\',monospace',
            `font-size:calc(var(--f) * 0.79)`,
            'text-transform:uppercase',
            'cursor:pointer',
        ].join(';');

        this._caretEl = this.createElement('span', 'equation-panel-caret');
        this._caretEl.setAttribute('aria-hidden', 'true');
        this._caretEl.textContent = this.expanded ? '\u25BE' : '\u25B8';
        this._caretEl.style.cssText = [
            'flex-shrink:0',
            `width:${F}px`,
            'text-align:center',
        ].join(';');

        const labelEl = this.createElement('span', 'equation-panel-label');
        labelEl.textContent = 'EQUATIONS';

        this.appendElement(this._headerEl, this._caretEl);
        this.appendElement(this._headerEl, labelEl);
        this._headerEl.addEventListener('click', () => this._toggleExpanded());

        this._bodyEl = this.createElement('div', 'equation-panel-body');
        this.appendElement(this.element, this._headerEl);
        this.appendElement(this.element, this._bodyEl);

        this._applyExpandedState();
        return this.element;
    }

    /**
     * @param {Array<{latex:string,caption?:string,showWhen?:{param:string,value:*}}>} equations
     * @param {Object} params
     */
    setEquations(equations, params = {}) {
        this._equations = equations || [];
        this._params = params || {};
        if (!this.element) this.render();
        void this._renderBody();
    }

    /**
     * Re-filter visible equations when params change (showWhen gates / latexFn).
     * Coalesced to one render per animation frame.
     * @param {Object} params
     */
    updateParams(params = {}) {
        this._params = params || {};
        this._scheduleRenderBody();
    }

    _scheduleRenderBody() {
        if (this._updateRafId != null) return;
        this._updateRafId = requestAnimationFrame(() => {
            this._updateRafId = null;
            void this._renderBody();
        });
    }

    _resolveLatex(eq) {
        if (typeof eq.latexFn === 'function') {
            try {
                return eq.latexFn(this._params) || '';
            } catch (error) {
                console.error('EquationPanel latexFn error:', error);
                return '';
            }
        }
        return eq.latex || '';
    }

    _toggleExpanded() {
        this.expanded = !this.expanded;
        this._applyExpandedState();
    }

    _applyExpandedState() {
        if (!this._bodyEl || !this._caretEl) return;
        this._caretEl.textContent = this.expanded ? '\u25BE' : '\u25B8';
        this._bodyEl.style.display = this.expanded ? '' : 'none';
    }

    _filterEquations() {
        return this._equations.filter((eq) => {
            if (!eq.showWhen) return true;
            return this._params[eq.showWhen.param] === eq.showWhen.value;
        });
    }

    async _renderBody() {
        if (!this._bodyEl) return;

        const token = ++this._typesetToken;
        const visible = this._filterEquations()
            .map((eq) => ({ eq, latex: this._resolveLatex(eq) }))
            .filter(({ latex }) => latex);

        if (visible.length === 0) {
            this.element.style.display = 'none';
            this.clearElement(this._bodyEl);
            return;
        }

        this.element.style.display = '';
        this.clearElement(this._bodyEl);

        const { F } = this._spec();
        const { dimensions: dockDims } = this._dockSpec();
        const maxH = dockDims.equationPanelMaxHeight ?? F * 12;

        this._bodyEl.style.cssText = [
            'box-sizing:border-box',
            `max-height:${maxH}px`,
            'overflow-y:auto',
            'overflow-x:hidden',
            'background:var(--c-bg)',
        ].join(';');

        visible.forEach(({ eq, latex }, i) => {
            const isFirst = i === 0;
            const isLast = i === visible.length - 1;

            const block = this.createElement('div', 'equation-block');
            block.style.cssText = [
                'box-sizing:border-box',
                `border-top:${isFirst ? 'none' : '1px solid var(--c-border)'}`,
                isLast ? 'border-bottom:1px solid var(--c-border);' : '',
            ].join('');

            if (eq.caption) {
                const heading = this.createElement('div', 'equation-block-heading');
                heading.textContent = eq.caption.toUpperCase();
                heading.style.cssText = [
                    'box-sizing:border-box',
                    `padding:0 ${F}px`,
                    `height:${F}px`,
                    'display:flex',
                    'align-items:center',
                    'font-family:\'Atkinson Hyperlegible\',\'Atkinson Hyperlegible Mono\',monospace',
                    `font-size:calc(var(--f) * 0.79)`,
                    'text-transform:uppercase',
                    'color:var(--c-text)',
                    'border-bottom:1px solid var(--c-border)',
                ].join(';');
                this.appendElement(block, heading);
            }

            const mathWrap = this.createElement('div', 'equation-block-math');
            mathWrap.style.cssText = [
                'box-sizing:border-box',
                `padding:${F}px`,
                'text-align:center',
                'color:var(--c-text)',
            ].join(';');

            const displayMath = this.createElement('div', 'equation-display-math');
            displayMath.textContent = `\\[${latex}\\]`;
            this.appendElement(mathWrap, displayMath);
            this.appendElement(block, mathWrap);
            this.appendElement(this._bodyEl, block);
        });

        try {
            await this._waitForMathJax();
            if (token !== this._typesetToken) return;
            await window.MathJax.typesetPromise([this._bodyEl]);
            if (token !== this._typesetToken) return;
            this._styleMathElements();
        } catch (error) {
            console.error('EquationPanel MathJax render failed:', error);
        }
    }

    async _waitForMathJax(maxWait = 5000) {
        const start = Date.now();
        while ((!window.MathJax || !window.MathJax.typesetPromise) && (Date.now() - start) < maxWait) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        if (!window.MathJax?.typesetPromise) {
            throw new Error('MathJax not available');
        }
    }

    _styleMathElements() {
        if (!this._bodyEl) return;
        const currentF = window.Config?.F || this._spec().F || 14;
        this._bodyEl.querySelectorAll('mjx-container').forEach((mathEl) => {
            const isDisplay = mathEl.getAttribute('display') === 'true';
            if (isDisplay) {
                mathEl.style.fontSize = `${Math.round(currentF * 1.2)}px`;
                mathEl.style.margin = `${currentF}px 0`;
                mathEl.style.display = 'block';
                mathEl.style.textAlign = 'center';
            } else {
                mathEl.style.fontSize = `${Math.round(currentF * 1.05)}px`;
                mathEl.style.margin = '0 2px';
                mathEl.style.verticalAlign = 'middle';
            }
        });
    }

    destroy() {
        this._typesetToken++;
        if (this._updateRafId != null) {
            cancelAnimationFrame(this._updateRafId);
            this._updateRafId = null;
        }
        super.destroy();
    }
}
