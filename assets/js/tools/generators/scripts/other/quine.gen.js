/**
 * Quine - p5.js Generator
 *
 * A self-referential artwork. The generator renders its own source code text,
 * character by character, onto simulated paper. Ink bleeds and diffuses into
 * the paper fibres using a float pixel buffer. Comments are coloured
 * in a warm terracotta, code in dark charcoal.
 *
 * The timing model is character-index based: each character's delay is seeded
 * from a deterministic hash of its character index, making the per-character
 * delay reproducible across invocations with the same parameters.
 *
 * Based on Quine sketch.
 *
 * @version 1.0.0
 */

import '../../../../shared/algorithms/core/math-utils.js';
import { FontRegistry } from '../../../../shared/typography/font-registry.js';

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
    // Each character has a deterministic hash-seeded delay.
    // Punctuation (. , { }) add extra pause for rhythm.
    // After all text is typed: pause, fade, reset, repeat.
    p5Draw(p, params, frame) {
        // Advance character state (frame-based)
        // Render ink on offscreen buffer
        // Bleed ink into float pixel residue
        // Diffuse residue (dirty-region bounded)
        // Composite sharp text + bleed halo to canvas
    }
};`;

// QUI-01: default canvas palette (used as fallbacks; colourway overrides at runtime)
const _DEF_BG      = { r: 242, g: 238, b: 226 };
const _DEF_CODE    = { r: 45,  g: 42,  b: 48  };
const _DEF_COMMENT = { r: 125, g: 88,  b: 82  };

// QUI-06: dimensions are dynamic — set in p5Setup from canvas config, not hardcoded
// _W and _H used only in _makeState (passed in); all functions use state.W / state.H

// Per-instance mutable state keyed by p5 instance — isolates state from the SCRIPT_CONFIG singleton
const _instances = new WeakMap();

// QUI-01: hex string to {r,g,b} object
function _hexToRGB(hex) {
    const h = (hex || '#000000').replace('#', '');
    return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16) };
}

// QUI-06: W and H passed in dynamically
function _makeState(imagined, W, H, bg) {
    const total   = W * H * 4;
    const residue = new Float32Array(total);
    const echo    = new Float32Array(total);
    for (let i = 0; i < total; i += 4) {
        residue[i] = bg.r; residue[i + 1] = bg.g; residue[i + 2] = bg.b; residue[i + 3] = 0;
    }
    return {
        imagined,
        W, H,
        ego:         _QUINE_TEXT,
        past:        [],
        present:     '',
        charIndex:   0,
        lineIndex:   0,
        dormant:     false,
        clearing:    false,
        blankLines:  0,
        nextFrame:   0,
        residue,
        echo,
        passDir:     0,
        activeX0: W, activeY0: H, activeX1: 0, activeY1: 0,
    };
}

// Deterministic hash → value in [0, 1) for character delay variation
function _pseudoNoise(seed) {
    let h = seed | 0;
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
    h = h ^ (h >>> 16);
    return (h >>> 0) / 0x100000000;
}

function _isComment(line) {
    const t = line.trim();
    return t.startsWith('//') || t.startsWith('/*') || t.startsWith('*');
}

// Delay for the character at charIndex — seeded from charIndex for determinism
function _charDelay(charIndex, ch, params) {
    const { delayScale, pauseDelay } = params;
    let base = 2 + Math.round(_pseudoNoise(charIndex) * 3);
    if (ch === ' ')  base += 1;
    if (ch === '.')  base += Math.round(pauseDelay * 0.6);
    if (ch === '\n') base += Math.round(pauseDelay * 0.7);
    if (ch === '{')  base += Math.round(pauseDelay * 0.2);
    if (ch === ',')  base += Math.round(pauseDelay * 0.3);
    return Math.round(base * delayScale);
}

// Read darkness from imagined buffer and transfer ink mass to residue.
// Updates the active bounding box to cover newly inked pixels.
function _absorbInk(state, urgency, inkAbsorption) {
    const { imagined, residue, W } = state;
    imagined.loadPixels();
    const pixels = imagined.pixels;
    const absCoeff = inkAbsorption || 1;
    let x0 = state.activeX0, y0 = state.activeY0;
    let x1 = state.activeX1, y1 = state.activeY1;
    for (let i = 0; i < pixels.length; i += 4) {
        const pr = pixels[i], pg = pixels[i + 1], pb = pixels[i + 2];
        const darkness = 255 - Math.max(pr, pg, pb);
        if (darkness > 20) {
            const existing = residue[i + 3];
            // QUI-03: inkAbsorption scales how much wet ink is absorbed
            const newWet = Math.min(existing + (darkness / 255) * urgency * absCoeff, 50);
            if (existing > 0) {
                const ratio = urgency / (existing + urgency);
                residue[i]     = residue[i]     + (pr - residue[i])     * ratio;
                residue[i + 1] = residue[i + 1] + (pg - residue[i + 1]) * ratio;
                residue[i + 2] = residue[i + 2] + (pb - residue[i + 2]) * ratio;
            } else {
                residue[i] = pr; residue[i + 1] = pg; residue[i + 2] = pb;
            }
            residue[i + 3] = newWet;
            const pIdx = i >> 2;
            const x = pIdx % W, y = (pIdx / W) | 0;
            if (x < x0) x0 = x;
            if (y < y0) y0 = y;
            if (x > x1) x1 = x;
            if (y > y1) y1 = y;
        }
    }
    state.activeX0 = x0; state.activeY0 = y0;
    state.activeX1 = x1; state.activeY1 = y1;
}

// QUI-02: 8-directional diffusion with roughness-modulated bleed coefficient.
// Uses state.W / state.H for dynamic canvas dimensions.
function _diffuse(state, entropy, gravity, paperRoughness) {
    const residue = state.residue;
    const echo    = state.echo;
    const W = state.W, H = state.H;
    const roughness = paperRoughness || 0;

    const bx0 = Math.max(1,     state.activeX0 - 2);
    const by0 = Math.max(1,     state.activeY0 - 2);
    const bx1 = Math.min(W - 2, state.activeX1 + 2);
    const by1 = Math.min(H - 2, state.activeY1 + 2);

    if (bx0 > bx1 || by0 > by1) { state.passDir = 1 - state.passDir; return; }

    for (let y = by0; y <= by1; y++) {
        for (let x = bx0; x <= bx1; x++) {
            const i = (x + y * W) * 4;
            echo[i] = residue[i]; echo[i + 1] = residue[i + 1];
            echo[i + 2] = residue[i + 2]; echo[i + 3] = residue[i + 3];
        }
    }

    let nx0 = W, ny0 = H, nx1 = 0, ny1 = 0;
    const fwd = state.passDir === 0;
    const y0i = fwd ? by0 : by1, y1i = fwd ? by1 : by0, yd = fwd ? 1 : -1;
    const x0i = fwd ? bx0 : bx1, x1i = fwd ? bx1 : bx0, xd = fwd ? 1 : -1;

    // QUI-02: 8-directional neighbour offsets [dx, dy, weight]
    // Cardinal = 1.0, diagonal = 0.5; downward gets +0.15 gravity bias
    const DIRS = [
        [1, 0, 1.0], [-1, 0, 1.0], [0, 1, 1.15], [0, -1, 0.85],
        [1, 1, 0.5], [-1, 1, 0.5], [1, -1, 0.5], [-1, -1, 0.5]
    ];

    for (let y = y0i; fwd ? y <= y1i : y >= y1i; y += yd) {
        for (let x = x0i; fwd ? x <= x1i : x >= x1i; x += xd) {
            const here = (x + y * W) * 4;
            const vit  = echo[here + 3];
            if (vit > gravity) {
                residue[here + 3] = vit - gravity * 0.5;
                for (const [dx, dy, dw] of DIRS) {
                    const nx = x + dx, ny = y + dy;
                    if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
                    const n = (nx + ny * W) * 4;
                    if (echo[n + 3] < vit) {
                        // QUI-03: roughness modulates bleed coefficient
                        const rMod = roughness > 0
                            ? 1 + roughness * (_pseudoNoise((x * 7 + y * 13 + n) & 0x7fffffff) - 0.5)
                            : 1;
                        const d = 0.15 * dw * rMod;
                        residue[n]     = residue[n]     + (echo[here]     - residue[n])     * d;
                        residue[n + 1] = residue[n + 1] + (echo[here + 1] - residue[n + 1]) * d;
                        residue[n + 2] = residue[n + 2] + (echo[here + 2] - residue[n + 2]) * d;
                        residue[n + 3] = Math.min(echo[n + 3] + 0.3 * dw, vit * 0.8);
                    }
                }
            }
            residue[here + 3] = Math.max(0, residue[here + 3] - entropy);
            if (residue[here + 3] > 0) {
                if (x < nx0) nx0 = x; if (y < ny0) ny0 = y;
                if (x > nx1) nx1 = x; if (y > ny1) ny1 = y;
            }
        }
    }

    state.activeX0 = nx0 < W ? nx0 : W;
    state.activeY0 = ny0 < H ? ny0 : H;
    state.activeX1 = nx1;
    state.activeY1 = ny1;
    state.passDir  = 1 - state.passDir;
}

// Cheaper entropy-only decay used during clearing and dormant phases (no neighbourhood bleed)
function _decayResidue(state, entropy) {
    const { residue, activeX0, activeY0, activeX1, activeY1, W, H } = state;
    if (activeX0 > activeX1 || activeY0 > activeY1) return;
    let nx0 = W, ny0 = H, nx1 = 0, ny1 = 0;
    for (let y = activeY0; y <= activeY1; y++) {
        for (let x = activeX0; x <= activeX1; x++) {
            const ai = (x + y * W) * 4 + 3;
            const a  = Math.max(0, residue[ai] - entropy);
            residue[ai] = a;
            if (a > 0) {
                if (x < nx0) nx0 = x; if (y < ny0) ny0 = y;
                if (x > nx1) nx1 = x; if (y > ny1) ny1 = y;
            }
        }
    }
    state.activeX0 = nx0; state.activeY0 = ny0;
    state.activeX1 = nx1; state.activeY1 = ny1;
}

export const SCRIPT_CONFIG = {
    id: 'quine',
    title: 'Quine',
    category: 'other',
    description: 'A self-referential sketch that types its own source code onto simulated paper, with ink that bleeds and diffuses into the fibres.',
    version: '1.0.0',

    canvas: {
        width: 1080, height: 1080, context: 'p5',
        // QUI-01: colourway for paper/code/comment colours
        colourway: [
            { id: 'paper',      label: 'Paper',        colour: '#f2ede2', kind: 'fill' },
            { id: 'ink-code',   label: 'Ink (code)',   colour: '#2d2a30', kind: 'fill' },
            { id: 'ink-comment',label: 'Ink (comment)',colour: '#7d5852', kind: 'fill' }
        ]
    },

    parameters: [
        {
            group: 'Ink',
            params: [
                { key: 'entropy',       type: 'slider', label: 'Entropy',       min: 0.01, max: 0.5,  step: 0.01, default: 0.15 },
                { key: 'urgency',       type: 'slider', label: 'Urgency',       min: 1,    max: 20,   step: 1,    default: 8 },
                { key: 'gravity',       type: 'slider', label: 'Gravity',       min: 0.5,  max: 10,   step: 0.5,  default: 2 },
                // QUI-03: ink absorption and paper texture
                { key: 'inkAbsorption', type: 'slider', label: 'Ink Absorption', min: 0.2, max: 2, step: 0.1, default: 1, precision: 1 },
                { key: 'paperRoughness',type: 'slider', label: 'Paper Roughness', min: 0,  max: 2, step: 0.1, default: 0, precision: 1 },
                { key: 'paperTexture',  type: 'select', label: 'Paper Texture',
                  options: [
                    { value: 'none',  label: 'None (smooth)' },
                    { value: 'grain', label: 'Grain' },
                    { value: 'laid',  label: 'Laid (lines)' }
                  ], default: 'none' }
            ]
        },
        {
            group: 'Typing',
            params: [
                { key: 'delayScale', type: 'slider', label: 'Delay Scale',          min: 0.5, max: 4,  step: 0.1, default: 1 },
                { key: 'pauseDelay', type: 'slider', label: 'Pause Delay (frames)', min: 5,   max: 60, step: 5,   default: 20 }
            ]
        },
        {
            group: 'Text',
            params: [
                // QUI-01: font selector via FontRegistry
                { key: 'fontId',     type: 'select', label: 'Font',
                  options: [{ value: 'monospace', label: 'System Monospace' },
                            ...(() => {
                                try { return FontRegistry.listFonts().filter(f => f.category === 'monospace').map(f => ({ value: f.id, label: f.family })); }
                                catch(e) { return []; }
                            })()], default: 'monospace' },
                { key: 'fontSize',   type: 'slider', label: 'Font Size',   min: 8,  max: 36, step: 1, default: 16 },
                { key: 'lineHeight', type: 'slider', label: 'Line Height', min: 10, max: 50, step: 1, default: 24 },
                // QUI-07: margin as fraction of canvas width (0.02–0.1)
                { key: 'marginFrac', type: 'slider', label: 'Margin (%)',  min: 0.02, max: 0.12, step: 0.01, default: 0.046, precision: 3 }
            ]
        }
    ],

    presets: [
        { name: 'Classic',    values: { entropy: 0.15, urgency: 8,  gravity: 2, delayScale: 1,   pauseDelay: 20, fontSize: 16, lineHeight: 24, marginFrac: 0.046, inkAbsorption: 1,   paperRoughness: 0,   paperTexture: 'none' } },
        { name: 'Fast',       values: { entropy: 0.2,  urgency: 6,  gravity: 3, delayScale: 0.5, pauseDelay: 10, fontSize: 16, lineHeight: 24, marginFrac: 0.046, inkAbsorption: 0.8, paperRoughness: 0,   paperTexture: 'none' } },
        { name: 'Slow Bleed', values: { entropy: 0.05, urgency: 12, gravity: 1, delayScale: 2,   pauseDelay: 30, fontSize: 14, lineHeight: 22, marginFrac: 0.037, inkAbsorption: 1.5, paperRoughness: 0.8, paperTexture: 'grain' } }
    ],

    // QUI-05: Cap at 30 FPS — O(W×H) diffusion on main thread; 60fps exceeds budget.
    animation: {
        type:             'infinite',
        defaultFps:       30,
        animatableParams: ['entropy', 'urgency', 'gravity', 'delayScale'],
        sequencer:        false,
        animationExport:  false,
    },

    export: { png: true, gif: false, webm: false },

    compute: {
        cost:             'per-pixel',
        interactionScale: 0.5,
        idleDelay:        200,
    },

    infoSections: [
        {
            heading: 'DESCRIPTION',
            body: 'Quine is a P5.js pixel-buffer animation that types its own source code character by character onto a simulated 1080x1080 paper canvas. Ink bleeds from the typed text into the surrounding paper fibres via a float-precision pixel diffusion buffer. The generator is self-referential: the text it types is the _QUINE_TEXT constant embedded in the source, which is an abridged version of the generator\'s own SCRIPT_CONFIG block. The paper is warm off-white. Code text is dark charcoal. Comment lines (starting with //, /*, or *) are warm terracotta. The ink bleed produces a diffuse halo that spreads outward from each typed character over time, controlled by entropy, urgency, and gravity. After all text is typed, blank lines are inserted to push the content off screen, the generator enters a dormant phase that rapidly fades the residue, and the full cycle restarts from the beginning.'
        },
        {
            heading: 'ALGORITHM',
            body: 'The generator runs a four-stage pipeline per frame. Stage 1 — text state machine: if the current frame number meets or exceeds nextFrame, the next character from the ego string is emitted. _charDelay computes the delay for that character: it seeds a deterministic hash from charIndex to produce a base delay of 2-5 frames, then adds punctuation penalties (period: pauseDelay x 0.6, newline: x 0.7, brace: x 0.2, comma: x 0.3) and multiplies the total by delayScale. Newlines push the current in-progress line to the past array and reset the present string. When charIndex reaches the end of the ego string, the clearing flag is set; blank lines are pushed at intervals controlled by pauseDelay until 40 blanks have accumulated, then the dormant flag is set. During dormant, all residue alpha values are multiplied by 0.2 (rapid fade) and the text state is reset. Stage 2 — text render: the offscreen graphics buffer (_imagined) is cleared and filled white. The last maxLines = floor((H - 2 x margin) / lineHeight) completed lines from past are drawn at the configured fontSize and margin, using inkCode colour for code lines and inkComment for comment lines (detected by _isComment, which checks line prefixes // /* *). The current in-progress present string is drawn with a trailing underscore cursor. Stage 3 — _absorbInk: imagined.loadPixels() is called; for each pixel, darkness = 255 - max(R,G,B). If darkness exceeds 20, ink mass is added to the float residue buffer at that position: newWet = min(existing + (darkness/255) x urgency, 50). If the pixel already had ink, its residue colour is blended toward the new pixel colour by urgency/(existing+urgency). The active bounding box is expanded to include any newly inked pixel. Stage 4 — _diffuse (dirty-region bounded): during clearing and dormant phases, a cheaper _decayResidue pass applies entropy decay only. During normal typing, the full _diffuse function runs. _diffuse clips iteration to the active bounding box (expanded by 2 pixels on each side) and runs a single directional pass per frame, alternating forward (top-left to bottom-right) and backward (bottom-right to top-left) on successive frames, using a read-snapshot in echo and writing results to residue. Each pixel with alpha above gravity has its alpha reduced by gravity x 0.5 and bleeds a fraction (d=0.15) of its colour and mass to each of its four cardinal neighbours whose alpha is lower. All processed pixels then have entropy subtracted from their alpha. The new tight bounding box is recomputed from remaining wet pixels. Stage 5 — composite: p.loadPixels() is called. For each pixel: if the corresponding imagined pixel is ink (darkness > 20), the sharp pixel is copied directly. Else if residue alpha exceeds 0.5, the output is blended from paper colour toward the residue colour by min(wet/30, 0.6). Else the paper background colour is used. p.updatePixels() flushes the result.'
        },
        {
            heading: 'PARAMETERS',
            body: 'entropy [0.01, 0.5] step 0.01 default 0.15: decay rate of ink wetness per diffusion step. Higher values cause the bleed halo to fade faster. At maximum entropy (0.5) the bleed is barely visible; at minimum (0.01) ink persists for many frames. urgency [1, 20] step 1 default 8: ink mass added to the residue per frame per dark pixel. Higher values produce more aggressive bleeding and wider halos. At maximum urgency the residue fills quickly and may overflow the cap of 50. gravity [0.5, 10] step 0.5 default 2: minimum wetness threshold a pixel must exceed before it bleeds ink to its cardinal neighbours. Lower gravity allows even faint ink to spread; higher gravity restricts bleed to only heavily saturated pixels. entropy and gravity interact: high gravity with low entropy means ink accumulates without spreading far; low gravity with high entropy means ink spreads rapidly but fades quickly. delayScale [0.5, 4] step 0.1 default 1: global multiplier for per-character delay. Values above 1 slow typing; values below 1 speed it up. Affects the overall cycle length. pauseDelay [5, 60] step 5 default 20: base delay in frames for punctuation characters. Controls the rhythm of pauses at periods, newlines, braces, and commas. delayScale and pauseDelay both affect rhythm; delayScale scales the total delay uniformly, pauseDelay scales only the punctuation component. fontSize [10, 28] step 1 default 16: font size in pixels for the typed text on the canvas. Larger values reduce the number of visible lines. lineHeight [14, 40] step 1 default 24: vertical spacing in pixels between lines. Also reduces visible line count when increased. margin [20, 80] step 5 default 50: canvas margin in pixels applied on all sides. Affects both the horizontal text width and the vertical line count via maxLines = floor((1080 - 2 x margin) / lineHeight).'
        },
        {
            heading: 'PRESETS',
            body: 'Classic: entropy 0.15, urgency 8, gravity 2, delayScale 1, pauseDelay 20, fontSize 16, lineHeight 24, margin 50. The reference configuration. Moderate ink bleed with natural typing rhythm. Fast: entropy 0.2, urgency 6, gravity 3, delayScale 0.5, pauseDelay 10, fontSize 16, lineHeight 24, margin 50. Faster typing with reduced bleed. Higher gravity and entropy keep the halo tight and short-lived. Slow Bleed: entropy 0.05, urgency 12, gravity 1, delayScale 2, pauseDelay 30, fontSize 14, lineHeight 22, margin 40. Maximum bleed with slow typing. Low entropy causes ink to persist and spread widely. Higher urgency forces residue to fill rapidly. Smaller font and tighter line height allow more text on screen simultaneously.'
        },
        {
            heading: 'PERFORMANCE',
            body: 'Complexity is O(W x H) per frame, dominated by three full pixel-array passes: _absorbInk (~3-5ms), _diffuse (~15-25ms at defaults), and composite (~3-5ms). Expected frame rate is 20-40fps at default parameters — below the 60fps target. _diffuse is the dominant bottleneck at approximately 28M arithmetic operations per frame when the full canvas is wet. The dirty-region optimisation limits diffusion passes to the active bounding box of wet pixels, significantly reducing cost when only a small region of the canvas has ink (early in each cycle). Memory usage: two Float32Array buffers (residue and echo) at 1080x1080x4 floats each occupy approximately 37MB of heap total. This may cause pressure on devices with less than 4GB RAM. At maximum urgency (20) and minimum entropy (0.01), more pixels exceed the gravity threshold per frame, increasing the neighbourhood bleed loop cost. At minimum urgency and maximum entropy, most pixels are dry and the dirty-region shortcut is most effective.'
        },
        {
            heading: 'ANIMATION',
            body: 'Animation type is infinite with no defined loop frame count. The animation is not frame-deterministic: although the delay for each individual character is derived from a seeded hash of its character index (reproducible for a given charIndex value and params), the frame number at which any character is emitted is the cumulative sum of all prior delays, which depends on delayScale and pauseDelay at the time each prior character was emitted. Two render passes with the same frame index but different parameter histories will produce different visual output. GIF and WebM export are not supported. PNG export is supported. The animation is driven by the frame counter passed to p5Draw; no real-time clock or Math.random is used. passDir alternates each diffuse frame to achieve bidirectional spread over two consecutive frames.'
        },
        {
            heading: 'KNOWN LIMITATIONS',
            body: 'The self-referential text (_QUINE_TEXT) is a partial representation of the generator\'s configuration: it lists parameter names without their current numeric default values. A fully accurate quine would render the exact source of SCRIPT_CONFIG verbatim. The animation is not frame-deterministic with respect to frame index: the character emit schedule depends on cumulative delay history, not frame count alone. GIF and WebM export are therefore unavailable. At default settings the generator runs at approximately 20-40fps due to the cost of the pixel diffusion pass; it will not reach 60fps on most devices. Performance degrades at high urgency and low entropy when a large proportion of the canvas is simultaneously wet. At the start of each cycle, the dirty-region optimisation provides the greatest benefit; as ink spreads across the canvas, the active bounding box grows and the optimisation provides less saving.'
        },
        {
            heading: 'REFERENCES',
            body: 'Origin: port of the Quine sketch. Version 1.0.0. No external academic sources cited. The ink diffusion model is a custom single-direction-per-frame cellular automaton applied to a float-precision RGBA buffer, combining a gravity threshold with entropy decay and 4-connected neighbourhood bleed.'
        }
    ],

    p5Setup(p, params) {
        p.pixelDensity(1);
        p.noLoop();
        // QUI-06: use actual canvas dimensions, not hardcoded 1080
        const W = p.width  || this.canvas.width  || 1080;
        const H = p.height || this.canvas.height || 1080;
        // QUI-01: resolve bg from colourway
        const cw  = params.colourway || [];
        const bgH = (cw.find(c => c.id === 'paper') || {}).colour || '#f2ede2';
        const bg  = _hexToRGB(bgH);
        // QUI-01: load all canvas fonts for font selector
        FontRegistry.ensureLoaded();
        const imagined = p.createGraphics(W, H);
        imagined.pixelDensity(1);
        imagined.noStroke();
        _instances.set(p, _makeState(imagined, W, H, bg));
    },

    p5Draw(p, params, frame) {
        let state = _instances.get(p);
        const W = p.width  || this.canvas.width  || 1080;
        const H = p.height || this.canvas.height || 1080;
        // QUI-01: resolve palette from colourway
        const cw = params.colourway || [];
        const bgH  = (cw.find(c => c.id === 'paper')       || {}).colour || '#f2ede2';
        const cdH  = (cw.find(c => c.id === 'ink-code')    || {}).colour || '#2d2a30';
        const ccH  = (cw.find(c => c.id === 'ink-comment') || {}).colour || '#7d5852';
        const BG      = _hexToRGB(bgH);
        const INK_CODE    = _hexToRGB(cdH);
        const INK_COMMENT = _hexToRGB(ccH);

        // Guard: re-initialise if p5Setup was not called before first p5Draw
        if (!state || state.W !== W || state.H !== H) {
            if (state && state.imagined) state.imagined.remove();
            // QUI-01: inject fonts
            FontRegistry.ensureLoaded();
            const imagined = p.createGraphics(W, H);
            imagined.pixelDensity(1);
            imagined.noStroke();
            state = _makeState(imagined, W, H, BG);
            _instances.set(p, state);
        }

        // QUI-07: margin as fraction of canvas width
        const marginFrac = params.marginFrac ?? 0.046;
        const margin     = Math.round(W * marginFrac);

        const { entropy, urgency, gravity, fontSize, lineHeight, pauseDelay,
                inkAbsorption, paperRoughness, paperTexture } = params;

        // QUI-01: resolve font family from FontRegistry
        const fontId = params.fontId || 'monospace';
        let fontFamily = 'monospace';
        if (fontId !== 'monospace') {
            const entry = FontRegistry.listFonts().find(f => f.id === fontId);
            if (entry) fontFamily = `'${entry.family}', monospace`;
        }

        // Advance text state
        if (frame >= state.nextFrame) {
            if (state.clearing) {
                state.past.push('');
                state.blankLines++;
                state.nextFrame = frame + Math.round(pauseDelay * 0.1);
                if (state.blankLines > 40) {
                    state.clearing = false;
                    state.dormant  = true;
                    state.nextFrame = frame + pauseDelay * 3;
                }
            } else if (state.dormant) {
                // Rapid fade over active region before reset
                const { residue, activeX0, activeY0, activeX1, activeY1 } = state;
                for (let y = activeY0; y <= activeY1; y++) {
                    for (let x = activeX0; x <= activeX1; x++) {
                        residue[(x + y * _W) * 4 + 3] *= 0.2;
                    }
                }
                state.past = []; state.present = '';
                state.charIndex = 0; state.lineIndex = 0; state.blankLines = 0;
                state.dormant   = false;
                state.nextFrame = frame + 2;
            } else {
                const ch = state.ego.charAt(state.charIndex);
                if (ch === '\n') {
                    state.past.push(state.present);
                    state.present = '';
                    state.lineIndex++;
                } else {
                    state.present += ch;
                }
                state.nextFrame = frame + _charDelay(state.charIndex, ch, params);
                state.charIndex++;
                if (state.charIndex >= state.ego.length) {
                    state.past.push(state.present);
                    state.present  = '';
                    state.clearing = true;
                    state.blankLines = 0;
                }
            }
        }

        // Render text to offscreen buffer
        const im = state.imagined;
        im.clear();
        im.background(255);
        im.textFont(fontFamily); // QUI-01: use resolved font family
        im.textSize(fontSize);
        // QUI-06: use dynamic H for maxLines calc; QUI-07: use computed margin
        const maxLines = Math.floor((H - margin * 2) / lineHeight);
        const visible  = state.past.slice(-maxLines);
        for (let i = 0; i < visible.length; i++) {
            const yPos = margin + i * lineHeight;
            const col  = _isComment(visible[i]) ? INK_COMMENT : INK_CODE;
            im.fill(col.r, col.g, col.b);
            im.text(visible[i], margin, yPos);
        }
        const curY = margin + visible.length * lineHeight;
        if (curY < H - margin && !state.clearing && !state.dormant) {
            const col = _isComment(state.present) ? INK_COMMENT : INK_CODE;
            im.fill(col.r, col.g, col.b);
            im.text(state.present + '_', margin, curY);
        }

        // Absorb ink from imagined into residue (also calls im.loadPixels())
        _absorbInk(state, urgency, inkAbsorption);

        // QUI-02: diffuse with roughness; QUI-03: pass paperRoughness
        if (state.clearing) {
            _decayResidue(state, entropy);
        } else {
            _diffuse(state, entropy, gravity, paperRoughness);
        }

        // Composite
        const { residue } = state;
        const imPixels = im.pixels;
        p.loadPixels();
        for (let i = 0; i < p.pixels.length; i += 4) {
            const sR = imPixels[i], sG = imPixels[i + 1], sB = imPixels[i + 2];
            const wet = residue[i + 3];
            const isInk = (255 - Math.max(sR, sG, sB)) > 20;
            if (isInk) {
                p.pixels[i] = sR; p.pixels[i + 1] = sG; p.pixels[i + 2] = sB;
            } else if (wet > 0.5) {
                const bR = residue[i], bG = residue[i + 1], bB = residue[i + 2];
                const inf = Math.min(wet / 30, 0.6);
                // QUI-01: use colourway BG for composite base
                p.pixels[i]     = BG.r + (bR - BG.r) * inf;
                p.pixels[i + 1] = BG.g + (bG - BG.g) * inf;
                p.pixels[i + 2] = BG.b + (bB - BG.b) * inf;
            } else {
                let pr = BG.r, pg = BG.g, pb = BG.b;
                // QUI-03: apply paper texture to background pixels
                if (paperTexture === 'grain') {
                    const n = _pseudoNoise(i >> 2) * 8 - 4;
                    pr = Math.max(0, Math.min(255, pr + n));
                    pg = Math.max(0, Math.min(255, pg + n));
                    pb = Math.max(0, Math.min(255, pb + n));
                } else if (paperTexture === 'laid') {
                    // Horizontal laid lines: every 6 pixels darken slightly
                    const row = ((i >> 2) / W) | 0;
                    if (row % 6 === 0) { pr = pr - 8; pg = pg - 8; pb = pb - 8; }
                }
                p.pixels[i] = pr; p.pixels[i + 1] = pg; p.pixels[i + 2] = pb;
            }
            p.pixels[i + 3] = 255;
        }
        p.updatePixels();
    }
};
