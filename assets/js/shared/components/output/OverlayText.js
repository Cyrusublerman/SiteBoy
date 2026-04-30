/**
 * OverlayText — canvas-draw helper for positioned text and equation overlays.
 *
 * Not a DOM component (no element). Renders directly onto a 2D canvas context.
 * Consumes FontRegistry for font loading.
 *
 * Anchor values:
 *   horizontal: 'left' | 'center' | 'right'
 *   vertical:   'top'  | 'middle' | 'bottom'
 *
 * Usage in a generator draw():
 *   import { OverlayText } from '.../components/output/OverlayText.js';
 *
 *   const overlay = new OverlayText({
 *       fontId:   'eb-garamond',
 *       size:     24,
 *       colour:   '#ffffff',
 *       alpha:    0.85,
 *       anchorH:  'center',
 *       anchorV:  'bottom',
 *       padding:  12,
 *   });
 *
 *   // In draw(ctx, canvas, params, frame):
 *   overlay.draw(ctx, canvas, {
 *       text:  'f(t) = A·sin(ωt + φ)',
 *       x:     canvas.width / 2,
 *       y:     canvas.height - 20,
 *   });
 *
 * Multi-line: pass lines[] instead of text.
 * Equation rendering: plain text only (no MathJax). Use Unicode math symbols.
 */

import { FontRegistry } from '../../typography/font-registry.js';

export class OverlayText {
    /**
     * @param {Object} [opts]
     * @param {string}  [opts.fontId='merriweather']   - FontRegistry font id
     * @param {number}  [opts.size=20]                 - Font size in px (canvas pixels)
     * @param {string}  [opts.weight='400']            - Font weight
     * @param {string}  [opts.colour='#ffffff']        - Text colour
     * @param {number}  [opts.alpha=1]                 - Opacity 0–1
     * @param {'left'|'center'|'right'} [opts.anchorH='center']
     * @param {'top'|'middle'|'bottom'} [opts.anchorV='bottom']
     * @param {number}  [opts.lineHeight=1.4]          - Line height multiplier
     * @param {number}  [opts.padding=8]               - Internal padding (px)
     * @param {boolean} [opts.background=false]        - Draw background rect
     * @param {string}  [opts.backgroundColour='#000000']
     * @param {number}  [opts.backgroundAlpha=0.5]
     */
    constructor(opts = {}) {
        this.fontId           = opts.fontId           ?? 'merriweather';
        this.size             = opts.size             ?? 20;
        this.weight           = opts.weight           ?? '400';
        this.colour           = opts.colour           ?? '#ffffff';
        this.alpha            = opts.alpha            ?? 1;
        this.anchorH          = opts.anchorH          ?? 'center';
        this.anchorV          = opts.anchorV          ?? 'bottom';
        this.lineHeight       = opts.lineHeight       ?? 1.4;
        this.padding          = opts.padding          ?? 8;
        this.background       = opts.background       ?? false;
        this.backgroundColour = opts.backgroundColour ?? '#000000';
        this.backgroundAlpha  = opts.backgroundAlpha  ?? 0.5;

        // Trigger font CSS injection immediately
        FontRegistry.loadFont(this.fontId);
    }

    /**
     * Render text onto a 2D canvas context.
     *
     * @param {CanvasRenderingContext2D} ctx
     * @param {HTMLCanvasElement}        canvas
     * @param {Object} drawOpts
     * @param {string}   [drawOpts.text]    - Single string (may contain '\n')
     * @param {string[]} [drawOpts.lines]   - Explicit line array (overrides text)
     * @param {number}   [drawOpts.x]       - Anchor x in canvas pixels (default: center)
     * @param {number}   [drawOpts.y]       - Anchor y in canvas pixels (default: bottom-padding)
     * @param {number}   [drawOpts.size]    - Override font size
     * @param {string}   [drawOpts.colour]  - Override colour
     * @param {number}   [drawOpts.alpha]   - Override alpha
     */
    draw(ctx, canvas, drawOpts = {}) {
        const size    = drawOpts.size   ?? this.size;
        const colour  = drawOpts.colour ?? this.colour;
        const alpha   = drawOpts.alpha  ?? this.alpha;

        const x = drawOpts.x ?? canvas.width  / 2;
        const y = drawOpts.y ?? canvas.height - this.padding;

        const lines = drawOpts.lines
            ?? (drawOpts.text ?? '').split('\n');

        if (!lines.length || (lines.length === 1 && !lines[0])) return;

        const fontFamily = FontRegistry.getFontStack(this.fontId);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = `${this.weight} ${size}px ${fontFamily}`;

        // Measure to align
        const lineMetrics  = lines.map(l => ctx.measureText(l));
        const maxWidth     = Math.max(...lineMetrics.map(m => m.width));
        const lineH        = size * this.lineHeight;
        const totalH       = lineH * lines.length;

        // Resolve anchor
        let textX = x;
        if      (this.anchorH === 'left')   textX = x;
        else if (this.anchorH === 'right')  textX = x - maxWidth;
        else                                 textX = x - maxWidth / 2; // center

        let textY = y;
        if      (this.anchorV === 'top')    textY = y;
        else if (this.anchorV === 'middle') textY = y - totalH / 2;
        else                                textY = y - totalH; // bottom

        // Optional background rect
        if (this.background) {
            ctx.globalAlpha = this.backgroundAlpha;
            ctx.fillStyle   = this.backgroundColour;
            ctx.fillRect(
                textX - this.padding,
                textY - this.padding,
                maxWidth + this.padding * 2,
                totalH + this.padding * 2
            );
            ctx.globalAlpha = alpha;
        }

        ctx.fillStyle   = colour;
        ctx.textBaseline = 'top';
        ctx.textAlign    = 'left';

        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], textX, textY + i * lineH);
        }

        ctx.restore();
    }
}
