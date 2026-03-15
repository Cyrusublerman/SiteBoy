/**
 * Unified Pattern — Mid-Century Superellipse SDF Generator
 *
 * Implements:
 *   GEO-018  Jittered Grid
 *   GEO-019  Domain Warp
 *   GEO-020  Superellipse SDF
 *   GEO-021  Nested Shapes
 *   GEO-022  Smooth Union (numerically stable smooth-min)
 *   COLOR-008 Palette Mapper
 *   CANVAS-013 SDF Renderer (per-pixel, putImageData)
 *
 * Compute: Tier 2 adaptive resolution + Tier 3 Web Worker offload.
 * Static image — no animation.
 *
 * @script unified-pattern
 * @category other
 * @version 1.0.0
 */

// ── Palettes ──────────────────────────────────────────────────────────────────
// Canvas pixel output — VGA/CSS-var constraint exempt (design-law §6.2).
const _PAL = {
    Warm:   [[220,55,35],[240,130,25],[250,195,45],[195,75,45],[165,35,15]],
    Cool:   [[25,75,200],[35,145,195],[75,195,215],[55,115,175],[15,45,145]],
    Mixed:  [[220,55,35],[35,145,195],[250,195,45],[75,175,95],[175,55,175]],
    Earth:  [[125,85,45],[165,125,65],[85,125,55],[185,155,85],[105,65,35]],
    Pastel: [[228,175,165],[175,205,228],[228,218,165],[185,225,205],[218,185,228]]
};
const _BG = {
    Warm:   [25,15,15],
    Cool:   [8,18,38],
    Mixed:  [18,18,28],
    Earth:  [38,28,18],
    Pastel: [238,232,228]
};

// ── PRNG: mulberry32 ──────────────────────────────────────────────────────────
function _rng(seed) {
    let s = (seed >>> 0) + 1;
    return function () {
        s = (s + 0x6D2B79F5) >>> 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// ── Value noise for GEO-019 domain warp ──────────────────────────────────────
function _h2(ix, iy) {
    let h = (((ix * 374761393) ^ (iy * 668265263)) + 2166136261) >>> 0;
    h = ((h ^ (h >>> 13)) * 1274126177) >>> 0;
    return (h ^ (h >>> 16)) / 4294967296;
}

function _n2(x, y) {
    const ix = Math.floor(x), iy = Math.floor(y);
    const fx = x - ix, fy = y - iy;
    const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    const a = _h2(ix, iy),     b = _h2(ix + 1, iy);
    const c = _h2(ix, iy + 1), d = _h2(ix + 1, iy + 1);
    return (a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy) * 2 - 1;
}

// ── GEO-020: Superellipse SDF ─────────────────────────────────────────────────
// f(x,y; c,a,b,p) = ( |Δx/a|^p + |Δy/b|^p )^(1/p) − 1
// f < 0 inside  |  f = 0 boundary  |  f > 0 outside
function _sdf(px, py, cx, cy, a, b, p) {
    const dx = Math.abs(px - cx) / a;
    const dy = Math.abs(py - cy) / b;
    const qx = dx < 1e-12 ? 0 : Math.pow(dx, p);
    const qy = dy < 1e-12 ? 0 : Math.pow(dy, p);
    return Math.pow(qx + qy, 1 / p) - 1;
}

// ── GEO-022: Numerically stable smooth-min ────────────────────────────────────
// Stable log-sum-exp form: shift by m = min(a,b) before exponentiation.
// issues-and-conflicts.md: overflow/underflow otherwise occurs for large |a−b|/σ.
function _smin(a, b, sigma) {
    if (sigma < 1e-9) return a < b ? a : b;
    const m = a < b ? a : b;
    return m - sigma * Math.log(Math.exp((m - a) / sigma) + Math.exp((m - b) / sigma));
}

// ── GEO-018: Jittered grid cell builder ──────────────────────────────────────
function _buildCells(W, H, params) {
    const gs   = params.gridSpacing;
    const jt   = params.jitter;
    const ot   = params.occupancyThreshold;
    const sm   = params.sizeMin, sx = params.sizeMax;
    const arLo = params.aspectRatioMin, arHi = params.aspectRatioMax;
    const nl   = Math.round(params.nestingLevels);
    const nr   = params.nestingRatio;
    const wm   = params.warpAmplitude * sx * 0.6;   // warp margin in px

    const cols = Math.ceil(W / gs) + 2;
    const rows = Math.ceil(H / gs) + 2;
    const cells = [];

    for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
            const seed = (((row + 500) * 31337 + (col + 500) * 7919) & 0x7FFFFFFF) >>> 0;
            const rand = _rng(seed);
            if (rand() > ot) continue;          // occupancy filter

            const jx = _n2(col * 0.61, row * 0.61) * jt * gs;
            const jy = _n2(col * 0.61 + 5.2, row * 0.61 + 1.3) * jt * gs;
            const cx = col * gs + jx;
            const cy = row * gs + jy;

            const size   = sm + rand() * (sx - sm);
            const aspect = arLo + rand() * (arHi - arLo);
            const cshift = rand();

            // GEO-021: build nestingLevels+1 concentric shapes per cell
            const numShapes = nl + 1;
            const shapes = [];
            let s = size;
            for (let l = 0; l < numShapes; l++) {
                shapes.push({ a: s, b: s / aspect });
                s *= nr;
            }

            const margin = shapes[0].a + shapes[0].b + wm;
            cells.push({
                cx, cy, shapes, cshift,
                bbx0: cx - margin, bbx1: cx + margin,
                bby0: cy - margin, bby1: cy + margin
            });
        }
    }
    return cells;
}

// ── CANVAS-013: Pixel-by-pixel SDF renderer ───────────────────────────────────
function _renderSDF(imageData, params) {
    const W = imageData.width, H = imageData.height;
    const data = imageData.data;

    const pal  = _PAL[params.palettePreset] || _PAL.Warm;
    const bg   = _BG[params.palettePreset]  || _BG.Warm;
    const pv   = params.paletteVariance;
    const p    = Math.max(params.cornerExponent, 2);
    const sigma = params.blendRadius * params.sizeMax;
    const wa   = params.warpAmplitude;
    const warpScale  = wa * params.sizeMax * 0.5;
    const noiseScale = params.warpFrequency * 4 / Math.max(W, H);
    const nl   = Math.round(params.nestingLevels);
    const plen = pal.length;
    const bandSize = Math.max(params.sizeMin / (nl + 1), 1.5);

    const cells = _buildCells(W, H, params);

    for (let py = 0; py < H; py++) {
        for (let px = 0; px < W; px++) {
            // GEO-019: domain warp
            let wx = px, wy = py;
            if (wa > 1e-6) {
                const nx = px * noiseScale, ny = py * noiseScale;
                wx = px + warpScale * _n2(nx, ny);
                wy = py + warpScale * _n2(nx + 5.2, ny + 1.3);
            }

            // GEO-020/021/022: SDF field with bounding-box spatial culling
            let field = Infinity, rawMin = Infinity, cshift = 0;
            for (let ci = 0; ci < cells.length; ci++) {
                const c = cells[ci];
                if (wx < c.bbx0 || wx > c.bbx1 || wy < c.bby0 || wy > c.bby1) continue;
                for (let si = 0; si < c.shapes.length; si++) {
                    const sh = c.shapes[si];
                    const sv = _sdf(wx, wy, c.cx, c.cy, sh.a, sh.b, p);
                    if (sv < rawMin) { rawMin = sv; cshift = c.cshift; }
                    field = _smin(field, sv, sigma);
                }
            }

            // COLOR-008: palette mapping
            const i4 = (py * W + px) * 4;
            if (field > 0 || !isFinite(field)) {
                data[i4] = bg[0]; data[i4 + 1] = bg[1]; data[i4 + 2] = bg[2];
            } else {
                const band  = Math.floor(Math.abs(field) / bandSize);
                const shift = Math.floor(cshift * pv * plen);
                const col   = pal[(band + shift) % plen];
                data[i4] = col[0]; data[i4 + 1] = col[1]; data[i4 + 2] = col[2];
            }
            data[i4 + 3] = 255;
        }
    }
    return imageData;
}

// ── draw (main-thread path — Tier 1/2 fallback) ───────────────────────────────
function draw(ctx, canvas, params, frame) {
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    _renderSDF(imageData, params);
    ctx.putImageData(imageData, 0, 0);
}

// ── Script configuration ──────────────────────────────────────────────────────
export const SCRIPT_CONFIG = {
    id: 'unified-pattern',
    title: 'Unified Pattern',
    category: 'other',
    version: '1.0.0',

    // ComputeScheduler hints (compute-scheduler.js)
    // Tier 2: 50% linear resolution (~25% pixels) during slider interaction.
    // Tier 3: worker offload via computePixels — main thread never blocked.
    compute: {
        cost: 'per-pixel',
        interactionScale: 0.5,
        idleDelay: 300,
        worker: true
    },

    canvas: {
        width: 800,
        height: 800,
        context: '2d',
        background: '#000000'
    },

    infoSections: [
        {
            heading: 'DESCRIPTION',
            body: 'Unified Pattern produces static geometric images in the style of Googie, Atomic Age, and Op-Art. The generator places superellipse shapes on a noise-jittered grid, deforms the coordinate space via domain warping, and combines shape signed distance fields using smooth union. The output is a single static image computed pixel-by-pixel via SDF evaluation and written to canvas with putImageData. Canvas: 800×800, 2d context. Computation is offloaded to a Web Worker; the interface remains fully responsive during rendering. Adaptive resolution reduces pixel count to 25% during slider interaction for fast interactive preview.'
        },
        {
            heading: 'ALGORITHM',
            body: 'Seven subsystems execute per render. GEO-018 Jittered Grid: a regular grid at spacing gridSpacing is sampled; each cell centre is displaced by value-noise jitter of magnitude jitter×gridSpacing; cells are retained with probability occupancyThreshold. GEO-019 Domain Warp: each pixel (px,py) is mapped to warped coordinates (wx,wy) = (px + A·noise(px·f, py·f), py + A·noise(px·f+5.2, py·f+1.3)) where A = warpAmplitude×sizeMax×0.5 in pixels and f = warpFrequency×4/canvasSize; the offset constants (5.2, 1.3) decorrelate the two noise axes. GEO-020 Superellipse SDF: for cell centre (cx,cy) with half-axes a = size and b = size/aspect, the SDF is f = (|Δx/a|^p + |Δy/b|^p)^(1/p) − 1 where p = cornerExponent; f < 0 inside, f = 0 boundary, f > 0 outside; p = 2 gives an ellipse, large p approximates a rectangle. GEO-021 Nested Shapes: nestingLevels+1 concentric shapes per cell at sizes size, size×ratio, size×ratio^2 …; all sharing the same centre and aspect. GEO-022 Smooth Union: all shape SDFs folded left-to-right via numerically stable smooth-min smin(a,b,σ) = m − σ·ln(exp((m−a)/σ) + exp((m−b)/σ)) where m = min(a,b); the log-sum-exp shift prevents overflow/underflow for large |a−b|/σ. COLOR-008 Palette Mapper: pixels where field > 0 receive the background colour; pixels inside receive palette[(band + shift) % |palette|] where band = floor(|field|/bandSize), bandSize = sizeMin/(nestingLevels+1), and shift is a per-cell variance offset. CANVAS-013 SDF Renderer: per-pixel evaluation with bounding-box spatial culling — cells whose bbox does not contain the warped pixel coordinate are skipped.'
        },
        {
            heading: 'PARAMETERS',
            body: 'Layout group — gridSpacing (slider, 10–100, step 1, default 50): cell spacing in pixels; smaller values produce denser patterns at higher render cost. jitter (slider, 0–1, step 0.01, default 0.5): noise displacement magnitude as fraction of gridSpacing; 0 = regular grid, 1 = maximum disorder. warpAmplitude (slider, 0–1, step 0.01, default 0.3): domain warp strength; displacement = warpAmplitude × sizeMax × 0.5 pixels. warpFrequency (slider, 0.1–5, step 0.1, default 1.0): spatial frequency of warp noise; higher values produce finer warp detail across the canvas. occupancyThreshold (slider, 0–1, step 0.01, default 0.8): per-cell retention probability; 0 = empty, 1 = all cells present. Shape group — cornerExponent (slider, 2–20, step 0.5, default 4): superellipse exponent p; 2 = ellipse, 4 = rounded rectangle, 18 = near-rectangle. aspectRatioMin (slider, 0.3–1, step 0.01, default 0.6): lower bound of per-cell width-to-height ratio. aspectRatioMax (slider, 1–3, step 0.01, default 1.5): upper bound of per-cell width-to-height ratio. nestingLevels (slider, 0–6, step 1, default 2): additional concentric shapes per cell beyond the base; total shapes = nestingLevels+1. nestingRatio (slider, 0.5–0.9, step 0.01, default 0.7): size multiplier between successive nesting levels. blendRadius (slider, 0–0.5, step 0.01, default 0.1): smooth-min σ = blendRadius × sizeMax in pixels; 0 = hard min, larger values blend junctions between nearby shapes. Style group — palettePreset (dropdown, Warm|Cool|Mixed|Earth|Pastel, default Warm): palette array for colour banding. paletteVariance (slider, 0–1, step 0.01, default 0.3): per-cell palette offset fraction; 0 = uniform, 1 = maximum per-cell colour variation. sizeMin (slider, 5–30, step 1, default 15): minimum cell shape half-width in pixels. sizeMax (slider, 20–80, step 1, default 40): maximum cell shape half-width; also scales warp amplitude and smooth-min sigma.'
        },
        {
            heading: 'PRESETS',
            body: 'Atomic: warm palette, gridSpacing 60, cornerExponent 6, nestingLevels 3 — rounded-rectangle nested shapes in mid-century warm tones. Op-Art: cool palette, gridSpacing 40, cornerExponent 18, nestingLevels 4 — near-rectangular concentric frames with optical regularity. Organic: earth palette, jitter 0.85, warpAmplitude 0.7, nestingLevels 2 — irregular naturalistic cell distribution with heavy deformation. Minimal: pastel palette, gridSpacing 80, occupancyThreshold 0.5, nestingLevels 0, no warp — sparse isolated ellipses on a light ground. Dense: mixed palette, gridSpacing 25, occupancyThreshold 0.95, nestingLevels 2 — tightly packed overlapping cells with blended junctions.'
        },
        {
            heading: 'PERFORMANCE',
            body: 'Complexity: O(W×H×C_range×(nestingLevels+1)) where C_range is the average number of cells whose bounding box covers a pixel. Bounding-box culling reduces the naïve O(W×H×N_cells×nestingLevels) to approximately O(W×H×9×nestingLevels) for typical parameters. At defaults (gridSpacing 50, nestingLevels 2, occupancyThreshold 0.8): approximately 7 cells in bbox range × 3 shapes = 21 SDF evaluations per pixel; estimated 200–600 ms in worker on a mid-range CPU. At gridSpacing 10, nestingLevels 4: potentially 2000+ in-range cells per pixel depending on sizeMax — renders may exceed 5 seconds. Three mitigations applied: Tier 3 Worker Offload (main thread never blocked — UI remains responsive throughout); Tier 2 Adaptive Resolution (50% linear scale during slider drag → 25% pixel count → ~4× faster interactive preview, idleDelay 300 ms before full-res render); per-pixel bounding-box spatial culling. Static image: compute fires once per parameter change, not per animation frame.'
        },
        {
            heading: 'ANIMATION',
            body: 'Type: none. The generator produces a single static image per parameter state. No animation loop is established. No animatable parameters are defined. Sequencer: not applicable. AnimationExport: not applicable. Export: PNG only — GIF and WebM are not applicable to static output.'
        },
        {
            heading: 'KNOWN LIMITATIONS',
            body: 'Render time scales with N_cells×nestingLevels; gridSpacing below 20 with nestingLevels above 2 can exceed 5 seconds even in the worker (borderline to impractical). SVG export is not implemented: pixel-by-pixel SDF output cannot be vectorised without contour extraction (not in scope). Colour mapping uses closest-cell heuristic for per-cell variance: the cell contributing the minimum raw SDF value determines the colour shift for that pixel, which is approximate near blended junctions. At blendRadius above 0.3, smooth-min pulls shape interiors together, merging colour bands across cell boundaries. The domain warp uses value noise (bilinear hash lattice), not Perlin noise; this produces slightly more regular deformation at the same frequency parameter. The banding period is fixed at sizeMin/(nestingLevels+1); it does not adapt to per-cell size variation, so larger cells show wider bands than smaller cells.'
        },
        {
            heading: 'REFERENCES',
            body: 'Superellipse SDF: Lamé curve (Gabriel Lamé, 1818); implicit form f = (|x/a|^p + |y/b|^p)^(1/p) − 1. Smooth-min / smooth union: Inigo Quilez, distance field techniques, iquilezles.com (2010–). Domain warping with noise fields: Ken Perlin, "Improving Noise" (SIGGRAPH 2002).'
        }
    ],

    parameters: [
        {
            group: 'Layout',
            params: [
                { key: 'gridSpacing',        type: 'slider', label: 'Grid Spacing',  min: 10,  max: 100, step: 1,    default: 50   },
                { key: 'jitter',             type: 'slider', label: 'Jitter',         min: 0,   max: 1,   step: 0.01, default: 0.5  },
                { key: 'warpAmplitude',      type: 'slider', label: 'Warp Amplitude', min: 0,   max: 1,   step: 0.01, default: 0.3  },
                { key: 'warpFrequency',      type: 'slider', label: 'Warp Frequency', min: 0.1, max: 5,   step: 0.1,  default: 1.0  },
                { key: 'occupancyThreshold', type: 'slider', label: 'Density',        min: 0,   max: 1,   step: 0.01, default: 0.8  }
            ]
        },
        {
            group: 'Shape',
            params: [
                { key: 'cornerExponent',  type: 'slider', label: 'Corner Exponent', min: 2,   max: 20,  step: 0.5,  default: 4    },
                { key: 'aspectRatioMin',  type: 'slider', label: 'Aspect Min',      min: 0.3, max: 1,   step: 0.01, default: 0.6  },
                { key: 'aspectRatioMax',  type: 'slider', label: 'Aspect Max',      min: 1,   max: 3,   step: 0.01, default: 1.5  },
                { key: 'nestingLevels',   type: 'slider', label: 'Nesting Levels',  min: 0,   max: 6,   step: 1,    default: 2    },
                { key: 'nestingRatio',    type: 'slider', label: 'Nesting Ratio',   min: 0.5, max: 0.9, step: 0.01, default: 0.7  },
                { key: 'blendRadius',     type: 'slider', label: 'Blend Radius',    min: 0,   max: 0.5, step: 0.01, default: 0.1  }
            ]
        },
        {
            group: 'Style',
            params: [
                { key: 'palettePreset',   type: 'dropdown', label: 'Palette',          options: ['Warm', 'Cool', 'Mixed', 'Earth', 'Pastel'], default: 'Warm' },
                { key: 'paletteVariance', type: 'slider',   label: 'Palette Variance', min: 0,  max: 1,  step: 0.01, default: 0.3 },
                { key: 'sizeMin',         type: 'slider',   label: 'Size Min',         min: 5,  max: 30, step: 1,    default: 15  },
                { key: 'sizeMax',         type: 'slider',   label: 'Size Max',         min: 20, max: 80, step: 1,    default: 40  }
            ]
        }
    ],

    presets: [
        { name: 'Atomic', values: {
            gridSpacing: 60, jitter: 0.4, warpAmplitude: 0.2, warpFrequency: 1.0, occupancyThreshold: 0.85,
            cornerExponent: 6, aspectRatioMin: 0.5, aspectRatioMax: 2.0, nestingLevels: 3, nestingRatio: 0.7, blendRadius: 0.15,
            palettePreset: 'Warm', paletteVariance: 0.4, sizeMin: 18, sizeMax: 50
        }},
        { name: 'Op-Art', values: {
            gridSpacing: 40, jitter: 0.1, warpAmplitude: 0.05, warpFrequency: 0.5, occupancyThreshold: 0.9,
            cornerExponent: 18, aspectRatioMin: 0.8, aspectRatioMax: 1.2, nestingLevels: 4, nestingRatio: 0.75, blendRadius: 0.02,
            palettePreset: 'Cool', paletteVariance: 0.1, sizeMin: 12, sizeMax: 30
        }},
        { name: 'Organic', values: {
            gridSpacing: 55, jitter: 0.85, warpAmplitude: 0.7, warpFrequency: 1.5, occupancyThreshold: 0.75,
            cornerExponent: 2, aspectRatioMin: 0.4, aspectRatioMax: 2.5, nestingLevels: 2, nestingRatio: 0.65, blendRadius: 0.25,
            palettePreset: 'Earth', paletteVariance: 0.5, sizeMin: 20, sizeMax: 55
        }},
        { name: 'Minimal', values: {
            gridSpacing: 80, jitter: 0.2, warpAmplitude: 0.0, warpFrequency: 1.0, occupancyThreshold: 0.5,
            cornerExponent: 8, aspectRatioMin: 0.9, aspectRatioMax: 1.1, nestingLevels: 0, nestingRatio: 0.7, blendRadius: 0.0,
            palettePreset: 'Pastel', paletteVariance: 0.2, sizeMin: 20, sizeMax: 45
        }},
        { name: 'Dense', values: {
            gridSpacing: 25, jitter: 0.6, warpAmplitude: 0.35, warpFrequency: 2.0, occupancyThreshold: 0.95,
            cornerExponent: 4, aspectRatioMin: 0.3, aspectRatioMax: 3.0, nestingLevels: 2, nestingRatio: 0.72, blendRadius: 0.2,
            palettePreset: 'Mixed', paletteVariance: 0.6, sizeMin: 8, sizeMax: 22
        }}
    ],

    animation: {
        type: 'none'
    },

    export: {
        png: true,
        gif: false,
        webm: false
    },

    draw,

    /**
     * Tier 3 worker function — self-contained; no closure references to module scope.
     * All helpers defined inline so this function can be serialised via .toString()
     * and reconstructed inside a Web Worker via new Function().
     * Receives an empty ImageData, fills it, returns it.
     */
    computePixels: function (imageData, params, frame) {
        // ── Palettes ──────────────────────────────────────────────────────────
        const PAL = {
            Warm:   [[220,55,35],[240,130,25],[250,195,45],[195,75,45],[165,35,15]],
            Cool:   [[25,75,200],[35,145,195],[75,195,215],[55,115,175],[15,45,145]],
            Mixed:  [[220,55,35],[35,145,195],[250,195,45],[75,175,95],[175,55,175]],
            Earth:  [[125,85,45],[165,125,65],[85,125,55],[185,155,85],[105,65,35]],
            Pastel: [[228,175,165],[175,205,228],[228,218,165],[185,225,205],[218,185,228]]
        };
        const BG = {
            Warm:   [25,15,15],
            Cool:   [8,18,38],
            Mixed:  [18,18,28],
            Earth:  [38,28,18],
            Pastel: [238,232,228]
        };

        // ── PRNG ──────────────────────────────────────────────────────────────
        function rng(seed) {
            let s = (seed >>> 0) + 1;
            return function () {
                s = (s + 0x6D2B79F5) >>> 0;
                let t = Math.imul(s ^ (s >>> 15), 1 | s);
                t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
                return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
            };
        }

        // ── Value noise ────────────────────────────────────────────────────────
        function h2(ix, iy) {
            let h = (((ix * 374761393) ^ (iy * 668265263)) + 2166136261) >>> 0;
            h = ((h ^ (h >>> 13)) * 1274126177) >>> 0;
            return (h ^ (h >>> 16)) / 4294967296;
        }
        function n2(x, y) {
            const ix = Math.floor(x), iy = Math.floor(y);
            const fx = x - ix, fy = y - iy;
            const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
            const a = h2(ix, iy),     b = h2(ix + 1, iy);
            const c = h2(ix, iy + 1), d = h2(ix + 1, iy + 1);
            return (a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy) * 2 - 1;
        }

        // ── Superellipse SDF ───────────────────────────────────────────────────
        function sdf(px, py, cx, cy, a, b, p) {
            const dx = Math.abs(px - cx) / a;
            const dy = Math.abs(py - cy) / b;
            const qx = dx < 1e-12 ? 0 : Math.pow(dx, p);
            const qy = dy < 1e-12 ? 0 : Math.pow(dy, p);
            return Math.pow(qx + qy, 1 / p) - 1;
        }

        // ── Numerically stable smooth-min ──────────────────────────────────────
        function smin(a, b, sigma) {
            if (sigma < 1e-9) return a < b ? a : b;
            const m = a < b ? a : b;
            return m - sigma * Math.log(Math.exp((m - a) / sigma) + Math.exp((m - b) / sigma));
        }

        // ── Build cells ────────────────────────────────────────────────────────
        function buildCells(W, H) {
            const gs   = params.gridSpacing;
            const jt   = params.jitter;
            const ot   = params.occupancyThreshold;
            const sm   = params.sizeMin, sx = params.sizeMax;
            const arLo = params.aspectRatioMin, arHi = params.aspectRatioMax;
            const nl   = Math.round(params.nestingLevels);
            const nr   = params.nestingRatio;
            const wm   = params.warpAmplitude * sx * 0.6;
            const cols = Math.ceil(W / gs) + 2;
            const rows = Math.ceil(H / gs) + 2;
            const cells = [];

            for (let row = -1; row < rows; row++) {
                for (let col = -1; col < cols; col++) {
                    const seed = (((row + 500) * 31337 + (col + 500) * 7919) & 0x7FFFFFFF) >>> 0;
                    const rand = rng(seed);
                    if (rand() > ot) continue;

                    const jx = n2(col * 0.61, row * 0.61) * jt * gs;
                    const jy = n2(col * 0.61 + 5.2, row * 0.61 + 1.3) * jt * gs;
                    const cx = col * gs + jx;
                    const cy = row * gs + jy;

                    const size   = sm + rand() * (sx - sm);
                    const aspect = arLo + rand() * (arHi - arLo);
                    const cshift = rand();

                    const numShapes = nl + 1;
                    const shapes = [];
                    let s = size;
                    for (let l = 0; l < numShapes; l++) {
                        shapes.push({ a: s, b: s / aspect });
                        s *= nr;
                    }

                    const margin = shapes[0].a + shapes[0].b + wm;
                    cells.push({
                        cx, cy, shapes, cshift,
                        bbx0: cx - margin, bbx1: cx + margin,
                        bby0: cy - margin, bby1: cy + margin
                    });
                }
            }
            return cells;
        }

        // ── Render ─────────────────────────────────────────────────────────────
        const W = imageData.width, H = imageData.height;
        const data = imageData.data;

        const pal  = PAL[params.palettePreset] || PAL.Warm;
        const bg   = BG[params.palettePreset]  || BG.Warm;
        const pv   = params.paletteVariance;
        const p    = Math.max(params.cornerExponent, 2);
        const sigma = params.blendRadius * params.sizeMax;
        const wa   = params.warpAmplitude;
        const warpScale  = wa * params.sizeMax * 0.5;
        const noiseScale = params.warpFrequency * 4 / Math.max(W, H);
        const nl   = Math.round(params.nestingLevels);
        const plen = pal.length;
        const bandSize = Math.max(params.sizeMin / (nl + 1), 1.5);

        const cells = buildCells(W, H);

        for (let py = 0; py < H; py++) {
            for (let px = 0; px < W; px++) {
                let wx = px, wy = py;
                if (wa > 1e-6) {
                    const nx = px * noiseScale, ny = py * noiseScale;
                    wx = px + warpScale * n2(nx, ny);
                    wy = py + warpScale * n2(nx + 5.2, ny + 1.3);
                }

                let field = Infinity, rawMin = Infinity, cshift = 0;
                for (let ci = 0; ci < cells.length; ci++) {
                    const c = cells[ci];
                    if (wx < c.bbx0 || wx > c.bbx1 || wy < c.bby0 || wy > c.bby1) continue;
                    for (let si = 0; si < c.shapes.length; si++) {
                        const sh = c.shapes[si];
                        const sv = sdf(wx, wy, c.cx, c.cy, sh.a, sh.b, p);
                        if (sv < rawMin) { rawMin = sv; cshift = c.cshift; }
                        field = smin(field, sv, sigma);
                    }
                }

                const i4 = (py * W + px) * 4;
                if (field > 0 || !isFinite(field)) {
                    data[i4] = bg[0]; data[i4 + 1] = bg[1]; data[i4 + 2] = bg[2];
                } else {
                    const band  = Math.floor(Math.abs(field) / bandSize);
                    const shift = Math.floor(cshift * pv * plen);
                    const col   = pal[(band + shift) % plen];
                    data[i4] = col[0]; data[i4 + 1] = col[1]; data[i4 + 2] = col[2];
                }
                data[i4 + 3] = 255;
            }
        }

        return imageData;
    }
};
