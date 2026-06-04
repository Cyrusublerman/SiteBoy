/**
 * ExpressionParam — numeric parameter with static / expression mode toggle.
 *
 * Layout (two stacked bordered partitions sharing a divider; no gaps):
 *   ┌ LABEL ─────────────────────────┐     title div (top border toggleable)
 *   ├───┬──────────┬───┬───────┬──────┤
 *   │ = │ ───o───  │ − │  {n}  │  +   │     static mode
 *   └───┴──────────┴───┴───────┴──────┘
 *   (expression mode: [ f | {expression text ............} ])
 *   (label hover → description tooltip; toggle hover → variable reference)
 *
 * Composed from three subcomponents: toggle button, Slider, NumericInput
 * (field + steppers, embedded). Expression mode swaps slider+numeric for a
 * single text field, evaluated per frame by the host.
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';
import { NumericInput } from './NumericInput.js';
import { Slider } from './Slider.js';
import { EXPRESSION_CONTEXT_SCHEMA } from '../../../tools/generators/core/expression-context.js';

// ─── Shared tooltip singleton ─────────────────────────────────────────────────

let _tooltipEl = null;
let _tooltipHideTimer = null;

function _ensureTooltip() {
    if (_tooltipEl) return _tooltipEl;
    _tooltipEl = document.createElement('div');
    _tooltipEl.className = 'expression-param-tooltip';
    _tooltipEl.style.cssText = `
        position: fixed;
        z-index: 10000;
        display: none;
        max-width: calc(var(--f, 14px) * 22);
        padding: calc(var(--f, 14px) * 0.5) calc(var(--f, 14px) * 0.75);
        border: 1px solid var(--c-border);
        background: var(--c-bg);
        color: var(--c-text);
        font-family: 'Atkinson Hyperlegible Mono', monospace;
        font-size: calc(var(--f, 14px) * 0.75);
        line-height: 1.4;
        pointer-events: none;
        white-space: normal;
    `;
    document.body.appendChild(_tooltipEl);
    return _tooltipEl;
}

function _formatSchemaTooltip() {
    const lines = [];
    for (const group of EXPRESSION_CONTEXT_SCHEMA) {
        lines.push(group.label.toUpperCase());
        for (const item of group.items) {
            lines.push(`  ${item.name} — ${item.description}`);
        }
    }
    return lines.join('\n');
}

const _EXPR_REF_TEXT = _formatSchemaTooltip();

function _showTooltip(anchorEl, text) {
    if (!text) return;
    const tip = _ensureTooltip();
    tip.textContent = text;
    tip.style.display = 'block';
    const rect = anchorEl.getBoundingClientRect();
    tip.style.left = `${rect.left}px`;
    tip.style.top  = `${rect.bottom + 4}px`;
    if (_tooltipHideTimer) clearTimeout(_tooltipHideTimer);
}

function _hideTooltip() {
    if (_tooltipHideTimer) clearTimeout(_tooltipHideTimer);
    _tooltipHideTimer = setTimeout(() => {
        if (_tooltipEl) _tooltipEl.style.display = 'none';
    }, 80);
}

function _compileExpression(src) {
    if (!src || !src.trim()) return { fn: () => 0, error: null };
    try {
        // eslint-disable-next-line no-new-func
        const fn = new Function('ctx', `with(ctx){ return (${src}); }`);
        return { fn, error: null };
    } catch (e) {
        return { fn: null, error: e.message };
    }
}

export class ExpressionParam extends BaseComponent {
    /**
     * @param {Object} options
     * @param {string}   options.key
     * @param {string}   options.label
     * @param {string}   [options.description] - Shown on label hover
     * @param {number}   [options.min]
     * @param {number}   [options.max]
     * @param {number}   [options.step]
     * @param {number}   [options.value]
     * @param {number}   [options.precision]
     * @param {string}   [options.display] - 'both' | 'field' | 'slider'
     * @param {Function} [options.onChange] - Static value change
     * @param {Function} [options.onExpressionChange] - Expression text or mode change
     */
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'expression-param' }, deps);

        this.paramKey   = options.key ?? '';
        this.label      = options.label ?? '';
        this.description = options.description ?? '';
        this.min        = options.min ?? 0;
        this.max        = options.max ?? 100;
        this.step       = options.step ?? 1;
        this.precision  = options.precision ?? 0;
        this.display    = options.display ?? 'both';
        // Top border of the title div. Off when this param sits directly below
        // another bordered element (vertical-stack rule, border-system §3), so
        // the neighbour's bottom edge serves as this component's top.
        this.topBorder  = options.topBorder ?? true;

        this.mode       = 'static';
        this.expression = '';
        this._staticValue = options.value ?? 0;
        this._lastEval    = this._staticValue;
        this._compiledFn  = null;
        this._compileError = null;

        this.onChange            = options.onChange ?? (() => {});
        this.onExpressionChange  = options.onExpressionChange ?? (() => {});

        this._numericInput = null;
        this._slider       = null;
        this._exprInputEl  = null;
        this._exprWrap     = null;
        this._toggleBtn    = null;
        this._staticWrap   = null;
        this._labelDiv     = null;
    }

    render() {
        if (this.element) return this.element;

        const { F, F2 } = this.getF();

        this.element = this.createElement('div', 'expression-param component');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 0;
            width: 100%;
        `;

        // Title div — attached above the control box, sharing its top edge.
        // Left/right always; top toggles per stack position (border-system §3).
        // No bottom border: the control box top is the shared divider (§8).
        this._labelDiv = this.createElement('div', 'expression-param__label-row');
        this._labelDiv.style.cssText = `
            display: flex;
            align-items: center;
            height: ${F * 1.5}px;
            padding: 0 ${F2}px;
            border-top: ${this.topBorder ? '1px solid var(--c-border)' : 'none'};
            border-left: 1px solid var(--c-border);
            border-right: 1px solid var(--c-border);
            box-sizing: border-box;
        `;

        const labelEl = this.createElement('span', 'expression-param__label');
        labelEl.textContent = this.label.toUpperCase();
        labelEl.style.cssText = `
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${F * 0.75}px;
            color: var(--c-text);
            text-transform: uppercase;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            cursor: ${this.description ? 'help' : 'default'};
        `;

        if (this.description) {
            labelEl.addEventListener('mouseenter', () => _showTooltip(labelEl, this.description));
            labelEl.addEventListener('mouseleave', _hideTooltip);
        }

        this._labelDiv.appendChild(labelEl);
        this.element.appendChild(this._labelDiv);

        // Control box — bordered partition flush below the title (top = shared
        // divider). Children divide it with border-left only (border-system §4);
        // no internal gaps, no double borders.
        const box = this.createElement('div', 'expression-param__box');
        box.style.cssText = `
            display: flex;
            align-items: stretch;
            gap: 0;
            width: 100%;
            height: ${F * 2 + 2}px;
            border: 1px solid var(--c-border);
            box-sizing: border-box;
        `;

        // Toggle — first cell; no border (container's left + top/bottom serve)
        this._toggleBtn = this.createElement('button', 'expression-param__toggle');
        this._toggleBtn.type = 'button';
        this._toggleBtn.style.cssText = `
            width: ${F * 2}px;
            height: 100%;
            flex-shrink: 0;
            border: none;
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F * 0.75}px;
            text-align: center;
            cursor: pointer;
            padding: 0;
            user-select: none;
        `;
        this._toggleBtn.addEventListener('click', () => this._toggleMode());
        this._toggleBtn.addEventListener('mouseenter', () => _showTooltip(this._toggleBtn, _EXPR_REF_TEXT));
        this._toggleBtn.addEventListener('mouseleave', _hideTooltip);
        box.appendChild(this._toggleBtn);

        this._buildStaticInput(F, F2);
        this._buildExpressionInput(F, F2);
        box.appendChild(this._staticWrap);
        box.appendChild(this._exprWrap);

        this.element.appendChild(box);

        this._syncToggleVisual();
        this._showActiveInput();

        return this.element;
    }

    _buildStaticInput(F, F2) {
        this._staticWrap = this.createElement('div', 'expression-param__static');
        this._staticWrap.style.cssText = `
            display: flex;
            align-items: stretch;
            flex: 1;
            min-width: 0;
            height: 100%;
        `;

        const showSlider = this.display === 'slider' || this.display === 'both';
        const showField  = this.display === 'field'  || this.display === 'both';

        if (showSlider) {
            this._slider = new Slider({
                min: this.min, max: this.max, step: this.step,
                value: this._staticValue,
                trackHF: 2,
                ariaLabel: this.label,
                borders: { top: false, right: false, bottom: false, left: true },
                onInput:  (v) => this._onStaticChange(v),
                onChange: (v) => this._onStaticChange(v),
            }, this.deps);
            this.addChild(this._slider);
            const sl = this._slider.render();
            sl.style.flex = '1';
            sl.style.minWidth = '0';
            sl.style.height = '100%';
            this._staticWrap.appendChild(sl);
        }

        if (showField) {
            this._numericInput = new NumericInput({
                label:   '',
                min:     this.min,
                max:     this.max,
                step:    this.step,
                value:   this._staticValue,
                display: 'field',
                precision: this.precision,
                embedded: true,
                onChange: (v) => this._onStaticChange(v),
            }, this.deps);
            this.addChild(this._numericInput);
            const ni = this._numericInput.render();
            ni.style.flexShrink = '0';
            ni.style.width = 'auto';
            ni.style.height = '100%';
            this._staticWrap.appendChild(ni);
        }
    }

    /** Static value changed from either the slider or the numeric field; keep both in sync. */
    _onStaticChange(v) {
        this._staticValue = v;
        this._lastEval = v;
        if (this._slider)        this._slider.setValue(v, false);
        if (this._numericInput)  this._numericInput.setValue(v, false);
        this.onChange(v);
    }

    _buildExpressionInput(F, F2) {
        this._exprWrap = this.createElement('div', 'expression-param__expr-wrap');
        this._exprWrap.style.cssText = `display: none; flex: 1; min-width: 0; height: 100%;`;

        this._exprInputEl = this.createElement('input', 'expression-param__expr-field');
        this._exprInputEl.type = 'text';
        this._exprInputEl.value = this.expression;
        this._exprInputEl.placeholder = 'sin(t * TAU)';
        this._exprInputEl.style.cssText = `
            width: 100%;
            height: 100%;
            padding: 0 ${F}px;
            border-top: none;
            border-right: none;
            border-bottom: none;
            border-left: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F * 0.75}px;
            box-sizing: border-box;
        `;

        this._exprInputEl.addEventListener('input', (e) => {
            this.expression = e.target.value;
            this._recompile();
            this.onExpressionChange();
        });

        this._exprInputEl.addEventListener('change', (e) => {
            this.expression = e.target.value;
            this._recompile();
            this.onExpressionChange();
        });

        this._exprWrap.appendChild(this._exprInputEl);
    }

    _recompile() {
        const { fn, error } = _compileExpression(this.expression);
        this._compiledFn   = fn;
        this._compileError = error;
        if (this._exprInputEl) {
            // Error state: divider turns accent, distinct from idle border (design-law §14.3)
            this._exprInputEl.style.borderLeftColor = error ? 'var(--c-accent)' : 'var(--c-border)';
        }
    }

    _toggleMode() {
        if (this.mode === 'static') {
            this.mode = 'expression';
            if (!this.expression) {
                this.expression = String(this._staticValue);
                if (this._exprInputEl) this._exprInputEl.value = this.expression;
            }
            this._recompile();
        } else {
            this.mode = 'static';
            const v = this._lastEval;
            this._staticValue = v;
            if (this._slider)       this._slider.setValue(v, false);
            if (this._numericInput) this._numericInput.setValue(v, false);
            this.onChange(v);
        }
        this._syncToggleVisual();
        this._showActiveInput();
        this.onExpressionChange();
    }

    _syncToggleVisual() {
        if (!this._toggleBtn) return;
        const isExpr = this.mode === 'expression';
        this._toggleBtn.textContent = isExpr ? 'f' : '=';
        // State by inversion (design-law §6.3): expression-driven param reads inverted.
        this._toggleBtn.style.background = isExpr ? 'var(--c-text)' : 'var(--c-bg)';
        this._toggleBtn.style.color      = isExpr ? 'var(--c-bg)'   : 'var(--c-text)';
    }

    _showActiveInput() {
        const isExpr = this.mode === 'expression';
        if (this._staticWrap) this._staticWrap.style.display = isExpr ? 'none' : 'flex';
        if (this._exprWrap)   this._exprWrap.style.display   = isExpr ? 'flex' : 'none';
    }

    /** Evaluate expression for the current frame context. */
    evaluate(ctx) {
        if (this.mode !== 'expression') return this._staticValue;
        if (!this._compiledFn) {
            this._recompile();
        }
        if (!this._compiledFn || this._compileError) return this._lastEval;
        try {
            const result = this._compiledFn(ctx);
            const num = Number(result);
            if (Number.isFinite(num)) {
                this._lastEval = num;
                return num;
            }
        } catch (_e) {
            // keep last good value
        }
        return this._lastEval;
    }

    getMode()       { return this.mode; }
    getExpression() { return this.expression; }

    getValue() {
        return this.mode === 'expression' ? this._lastEval : this._staticValue;
    }

    setValue(val, triggerChange = true) {
        this._staticValue = val;
        this._lastEval    = val;
        if (this._slider)       this._slider.setValue(val, false);
        if (this._numericInput) this._numericInput.setValue(val, triggerChange);
    }

    /** Whether this param needs per-frame expression evaluation. */
    isExpressionMode() {
        return this.mode === 'expression';
    }

    /**
     * Toggle the title div's top border. A container applies the vertical-stack
     * rule (border-system §3): the first item keeps its top border; items below
     * a bordered sibling pass `false` so the shared edge is not doubled.
     */
    setTopBorder(on) {
        this.topBorder = !!on;
        if (this._labelDiv) {
            this._labelDiv.style.borderTop = on ? '1px solid var(--c-border)' : 'none';
        }
    }

    destroy() {
        if (_tooltipEl?.style.display === 'block') _hideTooltip();
        super.destroy();
    }
}