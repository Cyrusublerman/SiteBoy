/**
 * Golden Grid — p5.js Generator
 *
 * Recursive golden-ratio subdivision with animated proportions.
 * Port of pulsing_recursive_grid sketch.
 * Reference implementation for p5.js generators in the unified system.
 *
 * @version 2.0.0
 */

const PHI = 1.618033988749;
const P_BIG   = PHI / (1 + PHI);  // ≈ 0.618
const P_SMALL = 1 - P_BIG;        // ≈ 0.382

export const SCRIPT_CONFIG = {
    id: 'golden-grid',
    title: 'Golden Grid',
    category: 'pattern',
    description: 'Recursive golden ratio subdivision with animated proportions. Each cell\'s colour is derived from its proportional dimensions.',
    version: '2.0.0',

    canvas: {
        width: 800,
        height: 800,
        context: 'p5'
    },

    parameters: [
        {
            group: 'Subdivision',
            params: [
                { key: 'maxDepth',   type: 'slider', label: 'Max Depth',          min: 4,  max: 16,  step: 1,   default: 13  },
                { key: 'loopFrames', type: 'slider', label: 'Loop Frames',         min: 60, max: 720, step: 60,  default: 360 }
            ]
        },
        {
            group: 'Animation',
            params: [
                { key: 'hueSpeed', type: 'slider', label: 'Hue Speed',         min: 0, max: 10, step: 0.5, default: 3 },
                { key: 'satSpeed', type: 'slider', label: 'Saturation Speed',  min: 0, max: 10, step: 0.5, default: 2 },
                { key: 'lumSpeed', type: 'slider', label: 'Lightness Speed',   min: 0, max: 5,  step: 0.5, default: 1 }
            ]
        }
    ],

    presets: [
        { name: 'Classic', values: { maxDepth: 13, loopFrames: 360, hueSpeed: 3,   satSpeed: 2, lumSpeed: 1   } },
        { name: 'Deep',    values: { maxDepth: 16, loopFrames: 720, hueSpeed: 2,   satSpeed: 1, lumSpeed: 0.5 } },
        { name: 'Shallow', values: { maxDepth: 8,  loopFrames: 180, hueSpeed: 5,   satSpeed: 3, lumSpeed: 2   } },
        { name: 'Static',  values: { maxDepth: 13, loopFrames: 360, hueSpeed: 0,   satSpeed: 0, lumSpeed: 0   } }
    ],

    export: { png: true, gif: true, webm: false },

    animation: {
        type: 'loop',
        // Getter ensures animation.loopFrames always reflects the current params slider.
        // Synced by p5Draw via SCRIPT_CONFIG._liveLoopFrames on every frame.
        get loopFrames() { return SCRIPT_CONFIG._liveLoopFrames ?? 360; },
        defaultFps: 60,
        canPrerender: true,
        animatableParams: ['hueSpeed', 'satSpeed', 'lumSpeed']
    },

    infoSections: [
        {
            heading: 'Description',
            body: 'Golden Grid recursively subdivides an 800×800 canvas using golden-ratio proportions. At each depth the split alternates vertical and horizontal. The split ratio oscillates sinusoidally between the two golden proportions (≈0.382 and ≈0.618), causing the grid to breathe. Each terminal cell is coloured from its accumulated width, height, and area proportions via HSL, producing a continuously shifting chromatic mosaic.'
        },
        {
            heading: 'Algorithm',
            body: 'Constants: φ = 1.618…, P_BIG = φ/(1+φ) ≈ 0.618, P_SMALL = 1−P_BIG ≈ 0.382. Time: t = (frame % loopFrames) / loopFrames ∈ [0,1). Ratio (per frame, computed once): r = φ^sin(2πt), split = r/(1+r) ∈ [P_SMALL, P_BIG]. Subdivision (_subdivide): binary tree to maxDepth; even depth = vertical split, odd = horizontal; flipped alternates the larger-cell side; wProp/hProp accumulate the product of all split ratios to the node. Log-norm (_logNorm): logNorm(v, mn, mx) = (ln v − ln mn)/(ln mx − ln mn), mapping golden-ratio products to linear [0,1]. Bounds: wMax = P_BIG^⌈d/2⌉, wMin = P_SMALL^⌈d/2⌉ (symmetric for height), cached until maxDepth changes. Colour at terminal cell: H = (wNorm + t×hueSpeed) % 1 (sawtooth); S = 1 − |(hNorm + t×satSpeed)×2 % 2 − 1| (triangle wave); L = 1 − |(aNorm + t×lumSpeed)×2 % 2 − 1| (triangle wave on area proportion).'
        },
        {
            heading: 'Parameters',
            body: 'maxDepth (4–16, step 1, default 13): recursion depth; terminal cells = 2^maxDepth. Depth 13 → 8,192 cells; depth 16 → 65,536 cells (likely drops frames). loopFrames (60–720, step 60, default 360): loop period in frames at 60 fps; controls both the animation cycle length and export frame count. hueSpeed (0–10, step 0.5, default 3): speed of sawtooth hue cycle driven by cell width. satSpeed (0–10, step 0.5, default 2): speed of triangle-wave saturation cycle driven by cell height. lumSpeed (0–5, step 0.5, default 1): speed of triangle-wave lightness cycle driven by cell area.'
        },
        {
            heading: 'Presets',
            body: 'Classic (depth 13, 360 frames, hue 3, sat 2, lum 1): balanced default. Deep (depth 16, 720 frames, slower speeds): dense fine-grained grid at the performance limit. Shallow (depth 8, 180 frames, faster speeds): coarse grid with rapid colour cycling. Static (depth 13, 360 frames, all speeds 0): frozen grid with no colour motion.'
        },
        {
            heading: 'Performance',
            body: 'Cost is O(2^maxDepth) rect calls per frame. Depth 13 (default): 8,192 calls ≈ 8–12 ms/frame. Depth 16: 65,536 calls — likely exceeds 16 ms. The split ratio is computed once per frame and passed into the tree, eliminating 65,534 redundant sin/pow calls at depth 16. Normalisation bounds are cached and recomputed only when maxDepth changes. Worker offload is not feasible (uses p5 canvas API directly).'
        },
        {
            heading: 'Animation',
            body: 'Type: loop. Period: loopFrames frames (default 360 at 60 fps = 6 s). Fully deterministic: same frame + params → same output. Eligible for GIF export. The animation.loopFrames property dynamically tracks params.loopFrames, so export frame count always matches the current slider value. Colour-speed params (hueSpeed, satSpeed, lumSpeed) are registered as animatable — the ANIMATE tab can interpolate them between sequencer checkpoints.'
        },
        {
            heading: 'Known Limitations',
            body: 'At maxDepth 16 frame drops are expected on most hardware. loopFrames doubles as both the colour-cycle driver and the export frame count; changing it alters both simultaneously. Canvas is fixed at 800×800; no user resize control is exposed.'
        },
        {
            heading: 'References',
            body: 'Golden ratio: φ = (1+√5)/2 ≈ 1.618. Colour model: HSL via p.colorMode(HSL, 1, 1, 1). Log-normalisation maps geometrically-distributed proportion products to a perceptually linear scale. Based on pulsing_recursive_grid sketch.'
        }
    ],

    /**
     * Log normalisation: maps a value in a geometric range [minVal, maxVal] to [0, 1].
     */
    _logNorm(val, minVal, maxVal) {
        return (Math.log(val) - Math.log(minVal)) / (Math.log(maxVal) - Math.log(minVal));
    },

    /**
     * Recursive binary subdivision of a rectangle.
     * ratio is pre-computed for the frame and passed down to avoid re-evaluation per node.
     */
    _subdivide(p, x, y, w, h, depth, flipped, wProp, hProp, params, frame, bounds, ratio) {
        if (depth >= params.maxDepth) {
            const areaProp = wProp * hProp;
            const wNorm = this._logNorm(wProp, bounds.wMin, bounds.wMax);
            const hNorm = this._logNorm(hProp, bounds.hMin, bounds.hMax);
            const aNorm = this._logNorm(areaProp, bounds.aMin, bounds.aMax);

            const t = (frame % params.loopFrames) / params.loopFrames;
            const hueNorm = (wNorm + t * params.hueSpeed) % 1;
            const satNorm = 1 - Math.abs((hNorm + t * params.satSpeed) * 2 % 2 - 1);
            const lumNorm = 1 - Math.abs((aNorm + t * params.lumSpeed) * 2 % 2 - 1);

            p.fill(hueNorm, satNorm, lumNorm);
            p.rect(x, y, w, h);
            return;
        }

        const vert = (depth % 2) === 0;

        if (vert) {
            const wB = w * ratio;
            const wS = w - wB;
            const xB = flipped ? x + wS : x;
            const xS = flipped ? x : x + wB;
            this._subdivide(p, xB, y, wB, h, depth + 1,  flipped, wProp * ratio,       hProp, params, frame, bounds, ratio);
            this._subdivide(p, xS, y, wS, h, depth + 1, !flipped, wProp * (1 - ratio), hProp, params, frame, bounds, ratio);
        } else {
            const hB = h * ratio;
            const hS = h - hB;
            const yB = flipped ? y + hS : y;
            const yS = flipped ? y : y + hB;
            this._subdivide(p, x, yB, w, hB, depth + 1,  flipped, wProp, hProp * ratio,       params, frame, bounds, ratio);
            this._subdivide(p, x, yS, w, hS, depth + 1, !flipped, wProp, hProp * (1 - ratio), params, frame, bounds, ratio);
        }
    },

    p5Setup(p, params) {
        p.colorMode(p.HSL, 1, 1, 1);
        p.noStroke();
        p.noSmooth();
        p.noLoop();
    },

    p5Draw(p, params, frame) {
        // Sync animation.loopFrames getter with the live param value.
        SCRIPT_CONFIG._liveLoopFrames = params.loopFrames;

        // Recompute bounds only when maxDepth changes.
        if (this._lastMaxDepth !== params.maxDepth) {
            this._lastMaxDepth = params.maxDepth;
            const vSplits = Math.ceil(params.maxDepth / 2);
            const hSplits = Math.floor(params.maxDepth / 2);
            const wMax = Math.pow(P_BIG,   vSplits);
            const wMin = Math.pow(P_SMALL, vSplits);
            const hMax = Math.pow(P_BIG,   hSplits);
            const hMin = Math.pow(P_SMALL, hSplits);
            this._cachedBounds = { wMax, wMin, hMax, hMin, aMax: wMax * hMax, aMin: wMin * hMin };
        }

        // Split ratio is constant for the entire frame — compute once.
        const t = (frame % params.loopFrames) / params.loopFrames;
        const r = Math.pow(PHI, Math.sin(t * Math.PI * 2));
        const ratio = r / (1 + r);

        this._subdivide(p, 0, 0, p.width, p.height, 0, false, 1, 1, params, frame, this._cachedBounds, ratio);
    }
};
