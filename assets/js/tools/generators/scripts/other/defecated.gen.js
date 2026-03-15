/**
 * Defecated - WebGL gooey font morphing animation
 * Cycles 40 Google Fonts via GLSL Gaussian blur + smoothstep threshold shader.
 * @version 1.0.0
 */

// === FONT DATABASE ===

const FONT_NAMES = [
    'Bebas Neue', 'Anton', 'Archivo Black', 'Black Ops One',
    'Monoton', 'Bungee', 'Bangers', 'Creepster', 'Nosifer',
    'Orbitron', 'Audiowide', 'Press Start 2P', 'VT323',
    'Abril Fatface', 'Playfair Display', 'Ultra', 'Yeseva One',
    'Permanent Marker', 'Lobster', 'Pacifico', 'Kaushan Script',
    'Alfa Slab One', 'Titan One', 'Sigmar One', 'Righteous',
    'Russo One', 'Staatliches', 'Teko', 'Fjalla One', 'Passion One',
    'Fredoka One', 'Comfortaa', 'Quicksand',
    'Metal Mania', 'Rubik Mono One', 'Cinzel',
    'Montserrat', 'Poppins', 'Raleway', 'Space Grotesk'
];

// === GLSL SHADERS ===

const VERT_SRC = `
attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;
void main() {
  vTexCoord = aTexCoord;
  vec4 pos = vec4(aPosition, 1.0);
  pos.xy = pos.xy * 2.0 - 1.0;
  gl_Position = pos;
}`;

const FRAG_SRC = `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform sampler2D tex1;
uniform float blurAmount;
uniform float threshold;
uniform float intensity;
uniform vec2 texelSize;

vec4 blur(sampler2D tex, vec2 uv, float amount) {
  vec4 sum = vec4(0.0);
  float total = 0.0;
  for (int x = -15; x <= 15; x++) {
    for (int y = -15; y <= 15; y++) {
      if (abs(float(x)) > amount || abs(float(y)) > amount) continue;
      float weight = exp(-(float(x * x + y * y)) / (2.0 * amount * amount + 0.001));
      sum += texture2D(tex, uv + vec2(float(x), float(y)) * texelSize) * weight;
      total += weight;
    }
  }
  return sum / total;
}

void main() {
  vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
  vec4 c1 = blur(tex0, uv, blurAmount);
  vec4 c2 = blur(tex1, uv, blurAmount);
  vec4 mixed = mix(c1, c2, intensity);
  float alpha = smoothstep(threshold - 0.1, threshold + 0.1, mixed.a);
  gl_FragColor = vec4(mixed.rgb, alpha);
}`;

// === MODULE-LEVEL HELPERS ===

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

function advanceFont(state) {
    state._fontQueue.shift();
    let n;
    do {
        n = Math.floor(Math.random() * state._fontNames.length);
    } while (state._fontQueue.includes(n));
    state._fontQueue.push(n);
}

function calculateSizes(gfx, params, fontName) {
    const lines = [params.line1, params.line2, params.line3].filter(s => s && s.trim());
    if (lines.length === 0) return { fontName, sizes: [], heights: [], lines: [] };

    const tw = gfx.width * params.targetWidth;
    const mh = gfx.height * params.maxHeight;
    const gap = gfx.height * params.lineGap;
    const baseSize = 300;

    gfx.textFont(fontName);
    gfx.textSize(baseSize);
    gfx.textStyle(gfx.BOLD);

    const sizes = [];
    const heights = [];

    for (const line of lines) {
        const w = gfx.textWidth(line);
        const s = w > 0 ? baseSize * tw / w : baseSize;
        sizes.push(s);
        gfx.textSize(s);
        heights.push(gfx.textAscent() + gfx.textDescent());
    }

    const totalGap = gap * Math.max(0, lines.length - 1);
    const total = heights.reduce((a, b) => a + b, 0) + totalGap;

    if (total > mh) {
        const sc = (mh - totalGap) / (total - totalGap);
        for (let i = 0; i < sizes.length; i++) {
            sizes[i] *= sc;
            heights[i] *= sc;
        }
    }

    return { fontName, sizes, heights, lines };
}

function drawTextToGraphics(gfx, data, params) {
    const { fontName, sizes, heights, lines } = data;
    if (!lines || lines.length === 0) { gfx.clear(); return; }

    const gap = gfx.height * params.lineGap;
    const total = heights.reduce((a, b) => a + b, 0) + gap * Math.max(0, heights.length - 1);
    let y = (gfx.height - total) / 2;

    gfx.clear();
    gfx.fill(255);
    gfx.noStroke();
    gfx.textAlign(gfx.CENTER, gfx.TOP);
    gfx.textStyle(gfx.BOLD);

    for (let i = 0; i < lines.length; i++) {
        gfx.textFont(fontName);
        gfx.textSize(sizes[i]);
        gfx.text(lines[i], gfx.width / 2, y);
        y += heights[i] + gap;
    }
}

// === SCRIPT CONFIG ===

export const SCRIPT_CONFIG = {
    id: 'defecated',
    title: 'DEFECATED',
    category: 'other',
    version: '1.0.0',

    canvas: { width: 800, height: 600, context: 'p5' },

    export: { png: true, gif: false, webm: false },

    animation: {
        type: 'infinite',
        loopFrames: 0,
        defaultFps: 60,
        sequencer: false,
        animationExport: false,
    },

    parameters: [
        { group: 'Text', params: [
            { key: 'line1', type: 'dropdown', label: 'Line 1',
              options: ['HAVE YOU', 'ARE YOU', 'DID YOU', 'WILL YOU', 'CAN YOU'],
              default: 'HAVE YOU' },
            { key: 'line2', type: 'dropdown', label: 'Line 2',
              options: ['DEFECATED', 'EXCREMENT', 'ABLUTED', 'EVACUATED', 'EXPELLED'],
              default: 'DEFECATED' },
            { key: 'line3', type: 'dropdown', label: 'Line 3',
              options: ['RECENTLY?', 'TODAY?', 'YET?', 'ALREADY?', 'AGAIN?'],
              default: 'RECENTLY?' },
        ]},
        { group: 'Layout', params: [
            { key: 'targetWidth', type: 'slider', label: 'Width',
              min: 0.5, max: 0.95, step: 0.05, default: 0.85, precision: 2 },
            { key: 'maxHeight', type: 'slider', label: 'Max Height',
              min: 0.5, max: 0.9, step: 0.05, default: 0.75, precision: 2 },
            { key: 'lineGap', type: 'slider', label: 'Line Gap',
              min: 0, max: 0.02, step: 0.001, default: 0.005, precision: 3 },
        ]},
        { group: 'Timing', params: [
            { key: 'morphTime', type: 'slider', label: 'Morph Time (ms)',
              min: 800, max: 3000, step: 100, default: 1800 },
            { key: 'power', type: 'slider', label: 'Power Curve',
              min: 2, max: 10, step: 1, default: 6 },
        ]},
        { group: 'Effect', params: [
            { key: 'blurMax', type: 'slider', label: 'Blur Max',
              min: 5, max: 40, step: 1, default: 24 },
        ]},
        { group: 'Display', params: [
            { key: 'displayOptions', type: 'toggle', label: 'Options',
              options: ['Show Debug'], default: [] },
        ]},
    ],

    presets: [
        { name: 'Default', values: {
            line1: 'HAVE YOU', line2: 'DEFECATED', line3: 'RECENTLY?',
            targetWidth: 0.85, maxHeight: 0.75, lineGap: 0.005,
            morphTime: 1800, power: 6, blurMax: 24, displayOptions: []
        }},
        { name: 'Rapid Fire', values: { morphTime: 800, power: 2, blurMax: 12 } },
        { name: 'Slow Burn', values: { morphTime: 3000, power: 10, blurMax: 35 } },
        { name: 'Tight Stack', values: { targetWidth: 0.95, maxHeight: 0.9, lineGap: 0 } },
    ],

    infoSections: [
        {
            heading: 'DESCRIPTION',
            body: 'Defecated cycles 40 Google Fonts, rendering three text lines that dissolve between fonts using a WebGL gooey blur-threshold shader. Each morph cycle blends the current font to the next over morphTime ms. A power-curve easing concentrates dwell time at the sharp endpoints and compresses the visible transition to the midpoint. White text on black background.'
        },
        {
            heading: 'ALGORITHM',
            body: 'preload: injects Google Fonts CSS link (40 families, 700 weight). setup: WEBGL canvas 800x600, two 2D offscreen graphics buffers (gfx1/gfx2), GLSL shader, Fisher-Yates font shuffle, font queue [0,1,2], initial calculateSizes and drawTextToGraphics for both buffers, cycle timer start. shuffleArray: Fisher-Yates in-place. advanceFont: shift queue[0], append random index not already in queue. calculateSizes: sets font at baseSize=300 on gfx, measures each line width, scales to targetWidth x canvasWidth, measures heights at scaled size, if total height > maxHeight x canvasHeight uniformly scales down. drawTextToGraphics: clear gfx, fill white, bold, centre-align, draw each line with computed gap. draw: t=elapsed/morphTime; morphT=power ease (t<0.5: pow(t*2,p)/2, else 1-pow((1-t)*2,p)/2); intensity=max(0, sin(morphT*PI)*1.1-0.1); blurAmount=intensity*blurMax; threshold=lerp(0.5,0.3,intensity). If intensity=0: image gfx1 or gfx2 directly. Else: shader(tex0=gfx1, tex1=gfx2, blurAmount, threshold, intensity=morphT, texelSize); fullscreen rect; resetShader. GLSL blur: 31x31 Gaussian kernel, weight=exp(-(x^2+y^2)/(2*amount^2+0.001)), skip |x|>amount or |y|>amount; mix(c1,c2,morphT); alpha=smoothstep(threshold-0.1, threshold+0.1, mixed.a).'
        },
        {
            heading: 'PARAMETERS',
            body: 'line1 (dropdown, default HAVE YOU): first text line content. line2 (dropdown, default DEFECATED): second text line. line3 (dropdown, default RECENTLY?): third text line. targetWidth (slider 0.5-0.95 step 0.05, default 0.85): text block width as fraction of canvas width. maxHeight (slider 0.5-0.9 step 0.05, default 0.75): max combined text height as fraction of canvas height. lineGap (slider 0-0.02 step 0.001, default 0.005): gap between lines as fraction of canvas height. morphTime (slider 800-3000 ms step 100, default 1800): one morph cycle duration. power (slider 2-10 step 1, default 6): power-curve exponent; higher = sharper transitions and more dwell time at endpoints. blurMax (slider 5-40 step 1, default 24): peak Gaussian blur radius in pixels at mid-morph. displayOptions (toggle [Show Debug], default off): overlays t, morphT, intensity, blur, and threshold diagnostics.'
        },
        {
            heading: 'PRESETS',
            body: 'Default: HAVE YOU / DEFECATED / RECENTLY? at standard timings (1800 ms, power 6, blur 24). Rapid Fire: morphTime 800, power 2, blurMax 12 — fast cycling, soft blur. Slow Burn: morphTime 3000, power 10, blurMax 35 — long dwell, heavy blur peak. Tight Stack: targetWidth 0.95, maxHeight 0.9, lineGap 0 — fills canvas edge-to-edge, no vertical gap.'
        },
        {
            heading: 'PERFORMANCE',
            body: 'Fragment shader runs a 31x31 Gaussian blur (up to 961 texture lookups per output pixel). At 800x600: ~460M texture reads per frame at peak blur — GPU-bound, typically well under 16 ms on modern hardware. Effective kernel shrinks quadratically with lower blurMax. Google Fonts (40 families, 700 weight) fetched from fonts.googleapis.com on init — one network request. Two 2D P5Graphics offscreen buffers at approx 1.8 MB each. Text measurement and buffer redraw occur once per cycle completion, not every frame.'
        },
        {
            heading: 'ANIMATION',
            body: 'Infinite, wall-clock driven. p.millis() elapsed time controls each morph cycle; not frame-count-based. Font order randomised by Fisher-Yates on each init. Non-deterministic: font sequence and any interrupted cycle are unrepeatable. loopFrames: 0. GIF and WebM export disabled — wall-clock timing and non-determinism preclude frame-accurate capture. PNG snapshot available at any cycle point.'
        },
        {
            heading: 'KNOWN LIMITATIONS',
            body: '(1) Text content is selected from preset word lists via dropdown — free-text input is not supported by the SCRIPT_CONFIG parameter system. (2) Google Fonts CDN required; text renders in system fallback until CDN response arrives. (3) Font sequence is non-deterministic; no two runs produce the same order. (4) GIF and WebM export disabled. (5) Host Fit/Fill/Actual display controls are not effective — WEBGL canvas re-creation bypasses the host viewport manager; canvas is centred at native 800x600 resolution.'
        },
        {
            heading: 'REFERENCES',
            body: 'Google Fonts API: fonts.googleapis.com. P5.js WEBGL shader API: createShader, shader, setUniform, resetShader — p5js.org/reference.'
        },
    ],

    p5Setup(p, params) {
        // Recreate canvas in WEBGL mode — overrides the host 2D canvas
        const cnv = p.createCanvas(800, 600, p.WEBGL);
        p.pixelDensity(1);

        // Centre the new WEBGL canvas in the host container
        const el = cnv.elt;
        el.style.position = 'absolute';
        el.style.top = '50%';
        el.style.left = '50%';
        el.style.transform = 'translate(-50%, -50%)';
        el.style.display = 'block';

        // Inject Google Fonts CSS (once per page load)
        if (!document.querySelector('link[data-defecated-fonts]')) {
            const families = FONT_NAMES.map(f => f.replace(/ /g, '+')).join('|');
            const link = document.createElement('link');
            link.href = `https://fonts.googleapis.com/css?family=${families}:700&display=swap`;
            link.rel = 'stylesheet';
            link.setAttribute('data-defecated-fonts', '');
            document.head.appendChild(link);
        }

        // Initialise shuffled font queue
        const fontNames = [...FONT_NAMES];
        shuffleArray(fontNames);
        this._fontNames = fontNames;
        this._fontQueue = [0, 1, 2];

        // Create GLSL shader
        this._shader = p.createShader(VERT_SRC, FRAG_SRC);

        // Create 2D offscreen graphics buffers for text rendering
        this._gfx1 = p.createGraphics(800, 600);
        this._gfx2 = p.createGraphics(800, 600);

        // Create 2D debug overlay buffer (reliable text rendering in WEBGL context)
        this._debugGfx = p.createGraphics(172, 90);

        // Initial text calculations and buffer fills
        this._currentData = calculateSizes(this._gfx1, params, fontNames[this._fontQueue[0]]);
        this._nextData    = calculateSizes(this._gfx1, params, fontNames[this._fontQueue[1]]);
        drawTextToGraphics(this._gfx1, this._currentData, params);
        drawTextToGraphics(this._gfx2, this._nextData, params);

        // Cycle timer and change-detection signature
        this._startTime    = p.millis();
        this._lastTextSig  = '';

        // Enable p5 internal loop — wall-clock timing drives this animation
        p.loop();
    },

    p5Draw(p, params, _frame) {
        // Detect text or layout param changes; recalculate buffers when they occur
        const sig = `${params.line1}|${params.line2}|${params.line3}|${params.targetWidth}|${params.maxHeight}|${params.lineGap}`;
        if (sig !== this._lastTextSig) {
            this._lastTextSig  = sig;
            this._currentData  = calculateSizes(this._gfx1, params, this._fontNames[this._fontQueue[0]]);
            this._nextData     = calculateSizes(this._gfx1, params, this._fontNames[this._fontQueue[1]]);
            drawTextToGraphics(this._gfx1, this._currentData, params);
            drawTextToGraphics(this._gfx2, this._nextData, params);
            this._startTime    = p.millis();
        }

        const elapsed = p.millis() - this._startTime;
        const t       = Math.min(elapsed / params.morphTime, 1);

        // Symmetric power-curve ease — more time at endpoints, fast middle
        let morphT;
        if (t < 0.5) {
            morphT = Math.pow(t * 2, params.power) / 2;
        } else {
            morphT = 1 - Math.pow((1 - t) * 2, params.power) / 2;
        }

        // Intensity bell: zero for the first/last ~10% of the cycle
        const rawSine    = Math.sin(morphT * Math.PI);
        const intensity  = Math.max(0, rawSine * 1.1 - 0.1);
        const blurAmount = intensity * params.blurMax;
        const threshold  = p.map(intensity, 0, 1, 0.5, 0.3);

        p.background(0);

        if (intensity === 0) {
            // Sharp endpoint — draw texture directly, no shader
            p.image(morphT < 0.5 ? this._gfx1 : this._gfx2, -p.width / 2, -p.height / 2);
        } else {
            // Morphing — gooey blur-threshold shader
            p.shader(this._shader);
            this._shader.setUniform('tex0',       this._gfx1);
            this._shader.setUniform('tex1',       this._gfx2);
            this._shader.setUniform('blurAmount', blurAmount);
            this._shader.setUniform('threshold',  threshold);
            this._shader.setUniform('intensity',  morphT);
            this._shader.setUniform('texelSize',  [1.0 / p.width, 1.0 / p.height]);
            p.rect(-p.width / 2, -p.height / 2, p.width, p.height);
            p.resetShader();
        }

        // Debug overlay — uses 2D graphics buffer for reliable text rendering
        if (Array.isArray(params.displayOptions) && params.displayOptions.includes('Show Debug')) {
            const dg = this._debugGfx;
            dg.clear();
            dg.background(0, 200);
            dg.fill(0, 255, 0);
            dg.noStroke();
            dg.textSize(11);
            dg.textAlign(dg.LEFT, dg.TOP);
            dg.text(`t:         ${t.toFixed(3)}`,         5,  5);
            dg.text(`morphT:    ${morphT.toFixed(3)}`,    5, 18);
            dg.text(`intensity: ${intensity.toFixed(3)}`, 5, 31);
            dg.text(`blur:      ${blurAmount.toFixed(1)}`,5, 44);
            dg.text(`threshold: ${threshold.toFixed(2)}`, 5, 57);
            p.image(dg, -p.width / 2 + 10, -p.height / 2 + 10);
        }

        // Cycle complete — advance font queue, swap buffers, calculate new next
        if (t >= 1) {
            advanceFont(this);
            [this._gfx1, this._gfx2] = [this._gfx2, this._gfx1];
            this._currentData = this._nextData;
            this._nextData    = calculateSizes(this._gfx1, params, this._fontNames[this._fontQueue[1]]);
            drawTextToGraphics(this._gfx2, this._nextData, params);
            this._startTime   = p.millis();
        }
    },
};
