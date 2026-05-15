/**
 * Shape Array - p5.js Generator
 *
 * A grid of shapes that morph continuously through line → triangle → square
 * → circle, with a wave phase offset across columns and rows.
 *
 * Based on shape_array_accident sketch.
 *
 * @version 1.1.0
 */

import '../../../../shared/algorithms/core/math-utils.js';

export const SCRIPT_CONFIG = {
    id: 'shape-array',
    title: 'Shape Array',
    category: 'pattern',
    description: 'Grid of shapes that continuously morph from lines to polygons to circles. A wave phase offset creates a ripple across the array.',
    version: '1.1.0',

    infoSections: [
        {
            heading: 'DESCRIPTION',
            body: 'Shape Array renders a cols × rows grid of shapes on a 1080×1080 canvas. Each shape continuously morphs through four stages: line → triangle → square → circle. A diagonal phase offset (col + row) × phaseOffset staggers the morph cycle across the grid, producing a ripple wave effect. Background is dark (greyscale 20) or light (245); stroke is the inverse. All shapes are drawn stroke-only, closed at every stage including the degenerate 2-vertex line stage.'
        },
        {
            heading: 'ALGORITHM',
            body: 'Time model: globalT = (frame × morphSpeed) % 1 — fully deterministic; same (frame, params) always produces identical output. Phase per cell: t = (globalT + (col + row) × phaseOffset) % 1. Stage mapping: stages = [2, 3, 4, max(8, circleRes)]; stageT = t × 3; si = ⌊stageT⌋; localT = stageT − si. Shape building — (1) _polygon: n equally-spaced vertices on a circle of shapeSize radius, starting at −HALF_PI; n=2 yields a vertical diameter line. (2) _samplePerimeter: circleRes points at equal arc-length intervals; uses precomputed cumulative edge lengths and binary search — O(n + circleRes log n). (3) _lerpShape: per-point linear interpolation between from and to sample sets at localT. Optimisation: stage sample pairs (from, to) are precomputed once per frame per unique si and shared across all cells; at most 3 pairs computed regardless of grid size.'
        },
        {
            heading: 'PARAMETERS',
            body: 'Grid group — cols: slider, 3–20, step 1, default 10; column count. rows: slider, 3–20, step 1, default 10; row count. spacing: slider, 20–150 px, step 5, default 60; gap between cell centres. Shapes group — shapeSize: slider, 5–80 px, step 1, default 20; polygon circumradius for all stages. circleRes: slider, 8–64, step 4, default 32; perimeter sampling resolution and final stage polygon side count (stages[3] = max(8, circleRes)). Animation group — morphSpeed: slider, 0.001–0.02, step 0.001, default 0.005; globalT increment per frame; one full cycle = ⌈1 / morphSpeed⌉ frames (200 at default). phaseOffset: slider, 0–0.5, step 0.01, default 0.1; phase difference per diagonal step; at cols = rows = 10, diagonal range is 0–1.8 cycles. Style group — bgColor: dropdown, [dark, light], default dark. strokeWeight: slider, 0.5–4 px, step 0.5, default 1.5.'
        },
        {
            heading: 'PRESETS',
            body: 'Classic: cols 10, rows 10, spacing 60, shapeSize 20, circleRes 32, morphSpeed 0.005, phaseOffset 0.1, bgColor dark, strokeWeight 1.5. Default configuration; sparse diagonal ripple. Dense: cols 15, rows 15, spacing 40, shapeSize 12, circleRes 16, morphSpeed 0.008, phaseOffset 0.08, bgColor dark, strokeWeight 1. Tighter grid, faster morph, lower polygon resolution. Slow Drift: cols 8, rows 8, spacing 80, shapeSize 28, circleRes 32, morphSpeed 0.002, phaseOffset 0.05, bgColor light, strokeWeight 2. Wide-spaced shapes, slow gentle movement on light background.'
        },
        {
            heading: 'PERFORMANCE',
            body: 'Naive complexity: O(cols × rows × circleRes × n) per frame (n = polygon side count). Optimised (v1.1.0): (1) Stage sample pair cache — from/to sampled vertices precomputed once per frame per unique stage index si ∈ {0,1,2}; at most 3 _samplePerimeter call-pairs per frame regardless of grid size; all cells at the same si reuse the cached result. (2) _samplePerimeter: inner edge-walk O(circleRes × n) replaced by cumulative edge-length array + binary search → O(n + circleRes log n). Cell loop cost: _lerpShape O(circleRes) × cols × rows. At default (10×10, circleRes 32): ~3,200 lerp ops/frame plus ≤6 perimeter samples — well within 16 ms. At max (20×20, circleRes 64): ~25,600 lerp ops/frame — viable. Worker offload not feasible: uses P5.js canvas API throughout.'
        },
        {
            heading: 'ANIMATION',
            body: 'Type: infinite. No loopFrames — loop period is ⌈1 / morphSpeed⌉ frames (param-dependent; 200 at default morphSpeed 0.005), which cannot be declared statically. Fully deterministic after v1.1.0: globalT = (frame × morphSpeed) % 1; identical (frame, params) always yields identical output. Sequencer: disabled (infinite type, no static loop boundary). Animation export: disabled (no static loopFrames; GIF/sequence export requires a defined loop period). PNG export: available via toolbar.'
        },
        {
            heading: 'KNOWN LIMITATIONS',
            body: 'circleRes conflation: circleRes sets both the perimeter sampling resolution and the final stage polygon side count (stages[3] = max(8, circleRes)). Increasing circleRes for smoother interpolation also raises the circle fidelity; these cannot be independently adjusted. Line stage closure: the 2-gon line stage is closed with p.endShape(CLOSE), producing overlapping paths that appear as a line — visually correct but structurally a degenerate polygon. Phase wrap: at high phaseOffset, cells whose t wraps through 0 jump from stage 2 back to stage 0 within the same frame row; this is expected given the modulo time model and creates a visible discontinuity at the wrap boundary.'
        },
        {
            heading: 'REFERENCES',
            body: 'Origin: port of shape_array_accident sketch.'
        }
    ],

    canvas: { width: 1080, height: 1080, context: 'p5' },

    compute: { cost: 'geometric' },

    parameters: [
        {
            group: 'Grid',
            params: [
                { key: 'cols',      type: 'slider', label: 'Columns',    min: 3,  max: 20,  step: 1,     default: 10 },
                { key: 'rows',      type: 'slider', label: 'Rows',       min: 3,  max: 20,  step: 1,     default: 10 },
                { key: 'spacing',   type: 'slider', label: 'Spacing',    min: 20, max: 150, step: 5,     default: 60 }
            ]
        },
        {
            group: 'Shapes',
            params: [
                { key: 'shapeSize',  type: 'slider', label: 'Shape Size',        min: 5, max: 80, step: 1, default: 20 },
                { key: 'circleRes',  type: 'slider', label: 'Circle Resolution', min: 8, max: 64, step: 4, default: 32 }
            ]
        },
        {
            group: 'Animation',
            params: [
                { key: 'morphSpeed',  type: 'slider', label: 'Morph Speed',  min: 0.001, max: 0.02, step: 0.001, default: 0.005 },
                { key: 'phaseOffset', type: 'slider', label: 'Phase Offset', min: 0,     max: 0.5,  step: 0.01,  default: 0.1 },
                // SHA-01: cycle mode controls wrapping behaviour
                { key: 'cycleMode', type: 'select', label: 'Cycle Mode',
                  options: [
                    { value: 'linear',            label: 'Linear (wrap)' },
                    { value: 'palindrome',         label: 'Palindrome (reverse)' },
                    { value: 'rotate-and-reverse', label: 'Rotate + Reverse' }
                  ], default: 'linear' },
                // SHA-02: flip shape at reverse point in palindrome mode
                { key: 'flipOnReverse', type: 'toggle', label: 'Flip on Reverse', default: false },
                // SHA-03: per-cycle rotation accumulation
                { key: 'perCycleRotation', type: 'slider', label: 'Per-Cycle Rotation (°)',
                  min: 0, max: 180, step: 5, default: 0 }
            ]
        },
        {
            group: 'Style',
            params: [
                { key: 'bgColor',      type: 'dropdown', label: 'Background',    options: ['dark', 'light'], default: 'dark' },
                { key: 'strokeWeight', type: 'slider',   label: 'Stroke Weight', min: 0.5, max: 4, step: 0.5, default: 1.5 },
                // SHA-04: per-cell colour function
                { key: 'colourMode', type: 'select', label: 'Colour Mode',
                  options: [
                    { value: 'uniform',  label: 'Uniform (bg-derived)' },
                    { value: 'position', label: 'Position (x/y)' },
                    { value: 'progress', label: 'Cycle Progress' },
                    { value: 'combined', label: 'Position + Progress' }
                  ], default: 'uniform' },
                { key: 'colourHueRange', type: 'slider', label: 'Hue Range',
                  min: 0, max: 360, step: 10, default: 180 },
                { key: 'colourHueBase', type: 'slider', label: 'Hue Base (°)',
                  min: 0, max: 360, step: 5, default: 200 }
            ]
        }
    ],

    presets: [
        {
            name: 'Classic',
            values: {
                cols: 10, rows: 10, spacing: 60, shapeSize: 20, circleRes: 32,
                morphSpeed: 0.005, phaseOffset: 0.1, bgColor: 'dark', strokeWeight: 1.5
            }
        },
        {
            name: 'Dense',
            values: {
                cols: 15, rows: 15, spacing: 40, shapeSize: 12, circleRes: 16,
                morphSpeed: 0.008, phaseOffset: 0.08, bgColor: 'dark', strokeWeight: 1
            }
        },
        {
            name: 'Slow Drift',
            values: {
                cols: 8, rows: 8, spacing: 80, shapeSize: 28, circleRes: 32,
                morphSpeed: 0.002, phaseOffset: 0.05, bgColor: 'light', strokeWeight: 2
            }
        }
    ],

    export: { png: true, gif: false, webm: false },

    animation: {
        type:            'infinite',
        defaultFps:      60,
        sequencer:       false,
        animationExport: false,
        animatableParams: ['morphSpeed', 'phaseOffset', 'shapeSize', 'strokeWeight']
    },

    _polygon(p, n, radius, rotation = 0) {
        const verts = [];
        for (let i = 0; i < n; i++) {
            const angle = rotation + (p.TWO_PI * i) / n - p.HALF_PI;
            verts.push({ x: radius * p.cos(angle), y: radius * p.sin(angle) });
        }
        return verts;
    },

    // Precomputed cumulative edge lengths + binary search — O(n + count·log n)
    _samplePerimeter(verts, count) {
        const n = verts.length;
        const cumLen = new Float64Array(n + 1);
        for (let i = 0; i < n; i++) {
            const next = (i + 1) % n;
            const dx = verts[next].x - verts[i].x;
            const dy = verts[next].y - verts[i].y;
            cumLen[i + 1] = cumLen[i] + Math.sqrt(dx * dx + dy * dy);
        }
        const perimeter = cumLen[n];
        const samples = [];
        for (let s = 0; s < count; s++) {
            const target = (s / count) * perimeter;
            let lo = 0, hi = n - 1;
            while (lo < hi) {
                const mid = (lo + hi) >> 1;
                if (cumLen[mid + 1] < target) lo = mid + 1;
                else hi = mid;
            }
            const i = lo;
            const next = (i + 1) % n;
            const edgeLen = cumLen[i + 1] - cumLen[i];
            const t = edgeLen > 0 ? (target - cumLen[i]) / edgeLen : 0;
            samples.push({
                x: verts[i].x + (verts[next].x - verts[i].x) * t,
                y: verts[i].y + (verts[next].y - verts[i].y) * t
            });
        }
        return samples;
    },

    _lerpShape(a, b, t) {
        return a.map((v, i) => ({
            x: v.x + (b[i].x - v.x) * t,
            y: v.y + (b[i].y - v.y) * t
        }));
    },

    p5Setup(p, params) {
        p.noLoop();
        p.noFill();
    },

    // SHA-01/02: compute effective t given cycleMode, including palindrome
    _effectiveT(rawT, cycleMode) {
        if (cycleMode === 'palindrome' || cycleMode === 'rotate-and-reverse') {
            // remap: 0→0.5 maps to 0→1, 0.5→1 maps to 1→0
            return rawT < 0.5 ? rawT * 2 : (1 - rawT) * 2;
        }
        return rawT;
    },

    // SHA-01: cycle count (how many full cycles have elapsed) for rotation accumulation
    _cycleCount(frame, morphSpeed, cycleMode) {
        const raw = frame * morphSpeed;
        if (cycleMode === 'palindrome' || cycleMode === 'rotate-and-reverse') {
            // one palindrome cycle = 2 linear cycles worth of morphSpeed
            return Math.floor(raw / 2);
        }
        return Math.floor(raw);
    },

    // SHA-04: resolve per-cell stroke colour
    _cellColour(p, col, row, cols, rows, t, cycleMode, params, isDark) {
        const mode = params.colourMode || 'uniform';
        if (mode === 'uniform') {
            return isDark ? p.color(255) : p.color(0);
        }
        p.colorMode(p.HSL, 360, 100, 100);
        const hueBase  = params.colourHueBase  ?? 200;
        const hueRange = params.colourHueRange  ?? 180;
        const xN = cols > 1 ? col / (cols - 1) : 0;
        const yN = rows > 1 ? row / (rows - 1) : 0;
        let hue;
        if (mode === 'position') {
            hue = (hueBase + (xN + yN) * 0.5 * hueRange) % 360;
        } else if (mode === 'progress') {
            hue = (hueBase + t * hueRange) % 360;
        } else {
            // combined
            hue = (hueBase + ((xN + yN) * 0.5 + t) * 0.5 * hueRange) % 360;
        }
        const sat = 80, lum = isDark ? 70 : 45;
        const c = p.color(hue, sat, lum);
        p.colorMode(p.RGB, 255);
        return c;
    },

    p5Draw(p, params, frame) {
        const { cols, rows, spacing, shapeSize, circleRes, morphSpeed, phaseOffset, bgColor, strokeWeight,
                cycleMode, flipOnReverse, perCycleRotation, colourMode } = params;

        const rawGlobalT = (frame * morphSpeed) % (
            (cycleMode === 'palindrome' || cycleMode === 'rotate-and-reverse') ? 2 : 1
        );
        const globalT = this._effectiveT(rawGlobalT % 1, cycleMode);
        const isDark  = bgColor !== 'light';

        p.background(isDark ? 20 : 245);
        if ((colourMode || 'uniform') === 'uniform') {
            p.stroke(isDark ? 255 : 0);
        }
        p.strokeWeight(strokeWeight);
        p.noFill();

        const stages  = [2, 3, 4, Math.max(8, circleRes)];
        const offsetX = (p.width  - (cols - 1) * spacing) / 2;
        const offsetY = (p.height - (rows - 1) * spacing) / 2;

        // SHA-03: cumulative rotation per cycle
        const cycleCount   = this._cycleCount(frame, morphSpeed, cycleMode);
        const rotAccum     = (perCycleRotation || 0) * cycleCount * Math.PI / 180;
        // rotate-and-reverse: flip also rotates each reverse pass
        const isReversed   = (cycleMode === 'palindrome' || cycleMode === 'rotate-and-reverse')
                             && rawGlobalT >= 1;

        // Stage sample pair cache
        const stageCache = new Map();
        const getStageSamples = (si, rotation) => {
            const cacheKey = `${si}|${rotation.toFixed(4)}`;
            if (stageCache.has(cacheKey)) return stageCache.get(cacheKey);
            const fromN = stages[Math.min(si,     stages.length - 1)];
            const toN   = stages[Math.min(si + 1, stages.length - 1)];
            const entry = {
                from: this._samplePerimeter(this._polygon(p, fromN, shapeSize, rotation), circleRes),
                to:   this._samplePerimeter(this._polygon(p, toN,   shapeSize, rotation), circleRes)
            };
            stageCache.set(cacheKey, entry);
            return entry;
        };

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const phase  = (col + row) * phaseOffset;
                const t      = (globalT + phase) % 1;
                const stageT = t * (stages.length - 1);
                const si     = Math.floor(stageT);
                const localT = stageT - si;

                // SHA-03: per-cell accumulated rotation offset + per-cycle rotation
                const cellRotation = rotAccum + (cycleMode === 'rotate-and-reverse' && isReversed
                    ? Math.PI / 4 * (col + row)  // rotate-and-reverse adds positional twist
                    : 0);

                const { from, to } = getStageSamples(si, cellRotation);
                let shape = this._lerpShape(from, to, localT);

                // SHA-02: flip shape at reverse point
                if (flipOnReverse && isReversed) {
                    shape = shape.map(v => ({ x: -v.x, y: v.y }));
                }

                const px = offsetX + col * spacing;
                const py = offsetY + row * spacing;

                // SHA-04: per-cell colour
                if ((colourMode || 'uniform') !== 'uniform') {
                    p.stroke(this._cellColour(p, col, row, cols, rows, t, cycleMode, params, isDark));
                }

                p.push();
                p.translate(px, py);
                p.beginShape();
                for (const v of shape) p.vertex(v.x, v.y);
                p.endShape(p.CLOSE);
                p.pop();
            }
        }
    }
};
