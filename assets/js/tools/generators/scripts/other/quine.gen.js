/**
 * Quine - p5.js Generator
 *
 * A self-referential artwork. The generator renders its own source code text,
 * character by character, onto simulated paper. Ink bleeds and diffuses into
 * the paper fibres using a float pixel buffer. Comments are coloured
 * in a warm terracotta, code in dark charcoal.
 *
 * The timing model is frame-based: each character is shown for `delayFrames`
 * frames (controlled by the FPS and a Perlin noise-driven delay multiplier).
 *
 * Based on Quine sketch.
 *
 * @version 1.0.0
 */

// Source text rendered by this generator (partial quine - configuration block)
const _QUINE_TEXT =
`/** Quine - p5.js Generator
 * A self-referential sketch that renders its own config as typed text on paper.
 * Ink bleeds into the fibre of the page using a float pixel diffusion buffer.
 * Comments render in warm terracotta, code in dark charcoal.
 */
export const SCRIPT_CONFIG = {
    id: 'quine',
    title: 'Quine',
    category: 'other',
    canvas: { width: 1080, height: 1080, context: 'p5' },
    // === Parameters ===
    parameters: [
        entropy,    // how fast ink fades
        urgency,    // how much ink bleeds per frame
        gravity,    // ink flow threshold
        delayScale, // typing speed multiplier
        fontSize,   // text size in px
        lineHeight, // vertical spacing
    ],
    // === Animation ===
    // Each character has a Perlin noise-driven delay.
    // Punctuation (. , { }) add extra pause for rhythm.
    // After all text is typed: pause, fade, reset, repeat.
    p5Draw(p, params, frame) {
        // Advance character state (frame-based millis simulation)
        // Render ink on offscreen buffer
        // Bleed ink into float pixel residue
        // Diffuse residue bidirectionally
        // Composite sharp text + bleed halo to canvas
    }
};`;

export const SCRIPT_CONFIG = {
    id: 'quine',
    title: 'Quine',
    category: 'other',
    description: 'A self-referential sketch that types its own source code onto simulated paper, with ink that bleeds and diffuses into the fibres.',
    version: '1.0.0',

    canvas: { width: 1080, height: 1080, context: 'p5' },

    parameters: [
        {
            group: 'Ink',
            params: [
                { key: 'entropy',    type: 'slider', label: 'Entropy',    min: 0.01, max: 0.5, step: 0.01, default: 0.15 },
                { key: 'urgency',    type: 'slider', label: 'Urgency',    min: 1,    max: 20,  step: 1,    default: 8 },
                { key: 'gravity',    type: 'slider', label: 'Gravity',    min: 0.5,  max: 10,  step: 0.5,  default: 2 }
            ]
        },
        {
            group: 'Typing',
            params: [
                { key: 'delayScale', type: 'slider', label: 'Delay Scale', min: 0.5, max: 4,   step: 0.1, default: 1 },
                { key: 'pauseDelay', type: 'slider', label: 'Pause Delay (frames)', min: 5, max: 60, step: 5, default: 20 }
            ]
        },
        {
            group: 'Text',
            params: [
                { key: 'fontSize',   type: 'slider', label: 'Font Size',   min: 10,  max: 28, step: 1,   default: 16 },
                { key: 'lineHeight', type: 'slider', label: 'Line Height', min: 14,  max: 40, step: 1,   default: 24 },
                { key: 'margin',     type: 'slider', label: 'Margin',      min: 20,  max: 80, step: 5,   default: 50 }
            ]
        }
    ],

    presets: [
        { name: 'Classic',   entropy: 0.15, urgency: 8, gravity: 2, delayScale: 1,   pauseDelay: 20, fontSize: 16, lineHeight: 24, margin: 50 },
        { name: 'Fast',      entropy: 0.2,  urgency: 6, gravity: 3, delayScale: 0.5, pauseDelay: 10, fontSize: 16, lineHeight: 24, margin: 50 },
        { name: 'Slow Bleed',entropy: 0.05, urgency: 12, gravity: 1, delayScale: 2,  pauseDelay: 30, fontSize: 14, lineHeight: 22, margin: 40 }
    ],

    animation: { type: 'infinite', defaultFps: 60 },

    // Colours (paper-like)
    _BG: { r: 242, g: 238, b: 226 },
    _INK_CODE:    { r: 45,  g: 42,  b: 48 },
    _INK_COMMENT: { r: 125, g: 88,  b: 82 },

    // State
    _ego: _QUINE_TEXT,
    _past: null,
    _present: null,
    _charIndex: 0,
    _lineIndex: 0,
    _dormant: false,
    _clearing: false,
    _blankLines: 0,
    _lastRenderedLine: -1,
    _noiseT: 0,
    _residue: null,
    _echo: null,
    _reflection: null,
    _imagined: null,
    _nextFrame: 0,
    _initialized: false,

    _isComment(line) {
        const t = line.trim();
        return t.startsWith('//') || t.startsWith('/*') || t.startsWith('*');
    },

    _charDelay(ch, params) {
        const { delayScale, pauseDelay } = params;
        let base = 2 + Math.round((this._noiseT % 1.0) * 3);
        this._noiseT += 0.05;
        if (ch === ' ')   base += 1;
        if (ch === '.')   base += Math.round(pauseDelay * 0.6);
        if (ch === '\n')  base += Math.round(pauseDelay * 0.7);
        if (ch === '{')   base += Math.round(pauseDelay * 0.2);
        if (ch === ',')   base += Math.round(pauseDelay * 0.3);
        return Math.round(base * delayScale);
    },

    _absorbInk(imagined, residue, urgency, bg) {
        const W = imagined.width, H = imagined.height;
        imagined.loadPixels();
        for (let i = 0; i < imagined.pixels.length; i += 4) {
            const pr = imagined.pixels[i], pg = imagined.pixels[i + 1], pb = imagined.pixels[i + 2];
            const darkness = 255 - Math.max(pr, pg, pb);
            if (darkness > 20) {
                const existing = residue[i + 3];
                const newWet   = Math.min(existing + (darkness / 255) * urgency, 50);
                if (existing > 0) {
                    const ratio = urgency / (existing + urgency);
                    residue[i]     = residue[i]     + (pr - residue[i])     * ratio;
                    residue[i + 1] = residue[i + 1] + (pg - residue[i + 1]) * ratio;
                    residue[i + 2] = residue[i + 2] + (pb - residue[i + 2]) * ratio;
                } else {
                    residue[i] = pr; residue[i + 1] = pg; residue[i + 2] = pb;
                }
                residue[i + 3] = newWet;
            }
        }
    },

    _diffuse(residue, echo, reflection, W, H, entropy, gravity) {
        // Copy
        for (let i = 0; i < residue.length; i++) { echo[i] = residue[i]; reflection[i] = residue[i]; }

        // Forward pass
        for (let y = 1; y < H - 1; y++) {
            for (let x = 1; x < W - 1; x++) {
                const here = (x + y * W) * 4;
                const vit  = residue[here + 3];
                if (vit > gravity) {
                    echo[here + 3] = vit - gravity * 0.5;
                    for (const n of [here + 4, here - 4, here + W * 4, here - W * 4]) {
                        if (residue[n + 3] < vit) {
                            const d = 0.3;
                            echo[n]     = echo[n]     + (residue[here]     - echo[n])     * d * 0.5;
                            echo[n + 1] = echo[n + 1] + (residue[here + 1] - echo[n + 1]) * d * 0.5;
                            echo[n + 2] = echo[n + 2] + (residue[here + 2] - echo[n + 2]) * d * 0.5;
                            echo[n + 3] = Math.min(residue[n + 3] + d, vit * 0.8);
                        }
                    }
                }
                echo[here + 3] = Math.max(0, echo[here + 3] - entropy);
            }
        }

        // Backward pass
        for (let y = H - 2; y > 0; y--) {
            for (let x = W - 2; x > 0; x--) {
                const here = (x + y * W) * 4;
                const vit  = residue[here + 3];
                if (vit > gravity) {
                    reflection[here + 3] = vit - gravity * 0.5;
                    for (const n of [here + 4, here - 4, here + W * 4, here - W * 4]) {
                        if (residue[n + 3] < vit) {
                            const d = 0.3;
                            reflection[n]     = reflection[n]     + (residue[here]     - reflection[n])     * d * 0.5;
                            reflection[n + 1] = reflection[n + 1] + (residue[here + 1] - reflection[n + 1]) * d * 0.5;
                            reflection[n + 2] = reflection[n + 2] + (residue[here + 2] - reflection[n + 2]) * d * 0.5;
                            reflection[n + 3] = Math.min(residue[n + 3] + d, vit * 0.8);
                        }
                    }
                }
                reflection[here + 3] = Math.max(0, reflection[here + 3] - entropy);
            }
        }

        // Average
        for (let i = 0; i < residue.length; i += 4) {
            residue[i]     = (echo[i]     + reflection[i])     / 2;
            residue[i + 1] = (echo[i + 1] + reflection[i + 1]) / 2;
            residue[i + 2] = (echo[i + 2] + reflection[i + 2]) / 2;
            residue[i + 3] = (echo[i + 3] + reflection[i + 3]) / 2;
        }
    },

    _reset(params) {
        const { bg } = this._getColors();
        const total = 1080 * 1080 * 4;
        this._residue = new Float32Array(total);
        this._echo    = new Float32Array(total);
        this._reflection = new Float32Array(total);
        for (let i = 0; i < total; i += 4) {
            this._residue[i] = bg.r; this._residue[i + 1] = bg.g; this._residue[i + 2] = bg.b;
            this._residue[i + 3] = 0;
        }
        this._past = []; this._present = ''; this._charIndex = 0; this._lineIndex = 0;
        this._dormant = false; this._clearing = false; this._blankLines = 0;
        this._lastRenderedLine = -1; this._nextFrame = 0; this._noiseT = 0;
    },

    _getColors() {
        return { bg: this._BG, inkCode: this._INK_CODE, inkComment: this._INK_COMMENT };
    },

    p5Setup(p, params) {
        p.pixelDensity(1);
        p.noLoop();
        this._imagined = p.createGraphics(1080, 1080);
        this._imagined.pixelDensity(1);
        this._imagined.textFont('monospace');
        this._imagined.noStroke();
        this._reset(params);
        this._initialized = true;
    },

    p5Draw(p, params, frame) {
        if (!this._initialized) { this._imagined = p.createGraphics(1080, 1080); this._imagined.pixelDensity(1); this._imagined.textFont('monospace'); this._imagined.noStroke(); this._reset(params); this._initialized = true; }

        const { entropy, urgency, gravity, fontSize, lineHeight, margin, pauseDelay } = params;
        const { bg, inkCode, inkComment } = this._getColors();

        // Advance text state (frame-based)
        if (frame >= this._nextFrame) {
            if (this._clearing) {
                this._past.push('');
                this._blankLines++;
                this._nextFrame = frame + Math.round(pauseDelay * 0.1);
                if (this._blankLines > 40) {
                    this._clearing = false;
                    this._dormant  = true;
                    this._nextFrame = frame + pauseDelay * 3;
                }
            } else if (this._dormant) {
                // Fade residue and reset
                for (let i = 0; i < this._residue.length; i += 4) this._residue[i + 3] *= 0.2;
                this._past = []; this._present = ''; this._charIndex = 0; this._lineIndex = 0;
                this._blankLines = 0; this._dormant = false; this._lastRenderedLine = -1;
                this._nextFrame = frame + 2;
            } else {
                const ch = this._ego.charAt(this._charIndex);
                if (ch === '\n') {
                    this._past.push(this._present);
                    this._present = '';
                    this._lineIndex++;
                } else {
                    this._present += ch;
                }
                this._nextFrame = frame + this._charDelay(ch, params);
                this._charIndex++;
                if (this._charIndex >= this._ego.length) {
                    this._past.push(this._present); this._present = '';
                    this._clearing = true; this._blankLines = 0;
                }
            }
        }

        // Render text to imagined buffer
        const im = this._imagined;
        im.clear();
        im.background(255);
        im.textSize(fontSize);
        const maxLines = Math.floor((1080 - margin * 2) / lineHeight);
        const visible  = this._past.slice(-maxLines);
        for (let i = 0; i < visible.length; i++) {
            const yPos = margin + i * lineHeight;
            const col  = this._isComment(visible[i]) ? inkComment : inkCode;
            im.fill(col.r, col.g, col.b);
            im.text(visible[i], margin, yPos);
        }
        const curY = margin + visible.length * lineHeight;
        if (curY < 1080 - margin && !this._clearing && !this._dormant) {
            const col = this._isComment(this._present) ? inkComment : inkCode;
            im.fill(col.r, col.g, col.b);
            im.text(this._present + '_', margin, curY);
        }

        // Absorb ink
        this._absorbInk(im, this._residue, urgency, bg);

        // Diffuse
        this._diffuse(this._residue, this._echo, this._reflection, 1080, 1080, entropy, gravity);

        // Composite
        im.loadPixels();
        p.loadPixels();
        for (let i = 0; i < p.pixels.length; i += 4) {
            const sR = im.pixels[i], sG = im.pixels[i + 1], sB = im.pixels[i + 2];
            const wet = this._residue[i + 3];
            const bR  = this._residue[i], bG = this._residue[i + 1], bB = this._residue[i + 2];
            const isInk = (255 - Math.max(sR, sG, sB)) > 20;
            if (isInk) {
                p.pixels[i] = sR; p.pixels[i + 1] = sG; p.pixels[i + 2] = sB;
            } else if (wet > 0.5) {
                const inf = Math.min(wet / 30, 0.6);
                p.pixels[i]     = bg.r + (bR - bg.r) * inf;
                p.pixels[i + 1] = bg.g + (bG - bg.g) * inf;
                p.pixels[i + 2] = bg.b + (bB - bg.b) * inf;
            } else {
                p.pixels[i] = bg.r; p.pixels[i + 1] = bg.g; p.pixels[i + 2] = bg.b;
            }
            p.pixels[i + 3] = 255;
        }
        p.updatePixels();
    }
};
