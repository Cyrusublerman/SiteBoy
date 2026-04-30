/**
 * Generative Pattern — p5.js Generator
 *
 * Unified pattern system: hybrid point distribution → proximity graph →
 * optional Gray-Scott reaction-diffusion evolution → SDF distance field →
 * 4 rendering modes (Truchet, Blob, Nested Contours, Global Contours).
 * Flow-field animation warps the SDF lookup each frame via value noise.
 *
 * Algorithm sources:
 *   Gray-Scott RD  — Pearson (1993): "Complex Patterns in a Simple System"
 *   Truchet tiles  — Smith (1987), Browne (2008)
 *   Marching Squares — Lorensen & Cline (1987) adapted for arc/contour modes
 *
 * @version 1.0.0
 */

import '../../../../shared/algorithms/core/math-utils.js';

// SDF grid resolution: 80×80 cells → 10 px/cell on 800×800 canvas.
// Chosen so SDF rebuild cost (O(SDF_RES² × E)) stays < 30 ms at max params.
const SDF_RES = 80;

// Truchet / contour tile grid: 20×20 → 40 px tiles.
const TILE_N = 20;

// Hard cap on point count to bound O(N²) graph construction.
const MAX_PTS = 250;

export const SCRIPT_CONFIG = {
    id: 'generative-pattern',
    title: 'Generative Pattern',
    category: 'pattern',
    version: '1.0.0',
    description: 'Unified Truchet / blob / contour pattern system driven by a proximity graph on a hybrid point distribution with optional Gray-Scott reaction-diffusion.',

    canvas: { width: 800, height: 800, context: 'p5' },

    // Tier 1 (RAF coalesce) active. Tier 2/3 not applied:
    // SDF rebuild is a one-time setup cost, not per-frame; animation uses a
    // hash-noise UV warp (O(SDF_RES²) per frame) which does not benefit from
    // worker offload (no ImageData path) or adaptive resolution (SDF is fixed-size).
    compute: { cost: 'sdf' },

    parameters: [
        {
            group: 'Points',
            params: [
                { key: 'density',          type: 'slider', label: 'Density',          min: 0.5,  max: 10,  step: 0.5,  default: 3   },
                { key: 'gridStrength',     type: 'slider', label: 'Grid Strength',    min: 0,    max: 1,   step: 0.05, default: 0.5 },
                { key: 'clusterScale',     type: 'slider', label: 'Cluster Scale',    min: 0.1,  max: 5,   step: 0.1,  default: 1.5 },
                { key: 'jitter',           type: 'slider', label: 'Jitter',           min: 0,    max: 1,   step: 0.05, default: 0.35 }
            ]
        },
        {
            group: 'Connectivity',
            params: [
                { key: 'connectionRadius', type: 'slider', label: 'Connection Radius',min: 0.5,  max: 5,   step: 0.1,  default: 2   },
                { key: 'maxDegree',        type: 'slider', label: 'Max Degree',       min: 2,    max: 8,   step: 1,    default: 4   },
                { key: 'axisBias',         type: 'slider', label: 'Axis Bias',        min: 0,    max: 1,   step: 0.05, default: 0.3 },
                { key: 'arcQuantisation',  type: 'slider', label: 'Arc Quantisation', min: 0,    max: 1,   step: 0.05, default: 0   }
            ]
        },
        {
            group: 'Evolution',
            params: [
                { key: 'Du',         type: 'slider', label: 'Du',        min: 0.1,  max: 0.5,  step: 0.01,  default: 0.21  },
                { key: 'Dv',         type: 'slider', label: 'Dv',        min: 0.01, max: 0.2,  step: 0.005, default: 0.105 },
                { key: 'feedRate',   type: 'slider', label: 'Feed Rate', min: 0.01, max: 0.1,  step: 0.001, default: 0.055 },
                { key: 'killRate',   type: 'slider', label: 'Kill Rate', min: 0.04, max: 0.08, step: 0.001, default: 0.062 },
                { key: 'iterations', type: 'slider', label: 'Iterations',min: 0,    max: 5000, step: 100,   default: 0     }
            ]
        },
        {
            group: 'Render',
            params: [
                { key: 'renderMode',     type: 'dropdown', label: 'Mode',         options: ['Blob', 'Truchet', 'Nested Contours', 'Global Contours'], default: 'Blob' },
                { key: 'weightScale',    type: 'slider',   label: 'Weight Scale', min: 0.5, max: 5,   step: 0.1,  default: 1.5 },
                { key: 'tileWindowSize', type: 'slider',   label: 'Tile Window',  min: 0.5, max: 2,   step: 0.1,  default: 1   },
                { key: 'boundaryCost',   type: 'slider',   label: 'Boundary',     min: 0,   max: 1,   step: 0.05, default: 0.5 }
            ]
        },
        {
            group: 'Animation',
            params: [
                { key: 'flowSpeed',      type: 'slider', label: 'Flow Speed',      min: 0,   max: 2,   step: 0.05, default: 0.3 },
                { key: 'noiseFrequency', type: 'slider', label: 'Noise Frequency', min: 0.1, max: 5,   step: 0.1,  default: 1.5 }
            ]
        }
    ],

    presets: [
        {
            name: 'Truchet Grid',
            values: {
                density: 4, gridStrength: 0.9, clusterScale: 1, jitter: 0.1,
                connectionRadius: 1.6, maxDegree: 4, axisBias: 0.85, arcQuantisation: 0.8,
                Du: 0.21, Dv: 0.105, feedRate: 0.055, killRate: 0.062, iterations: 0,
                renderMode: 'Truchet', weightScale: 1.5, tileWindowSize: 1, boundaryCost: 0.5,
                flowSpeed: 0.1, noiseFrequency: 1
            }
        },
        {
            name: 'Blob Field',
            values: {
                density: 3, gridStrength: 0.2, clusterScale: 2, jitter: 0.7,
                connectionRadius: 2.5, maxDegree: 6, axisBias: 0, arcQuantisation: 0,
                Du: 0.21, Dv: 0.105, feedRate: 0.055, killRate: 0.062, iterations: 0,
                renderMode: 'Blob', weightScale: 2.5, tileWindowSize: 1, boundaryCost: 0.5,
                flowSpeed: 0.5, noiseFrequency: 0.8
            }
        },
        {
            name: 'RD Contours',
            values: {
                density: 2.5, gridStrength: 0.4, clusterScale: 1.5, jitter: 0.4,
                connectionRadius: 3, maxDegree: 5, axisBias: 0.1, arcQuantisation: 0,
                Du: 0.21, Dv: 0.105, feedRate: 0.037, killRate: 0.06, iterations: 2000,
                renderMode: 'Nested Contours', weightScale: 1.5, tileWindowSize: 1.2, boundaryCost: 0.3,
                flowSpeed: 0.2, noiseFrequency: 1.5
            }
        },
        {
            name: 'Global Web',
            values: {
                density: 5, gridStrength: 0.3, clusterScale: 1, jitter: 0.5,
                connectionRadius: 2, maxDegree: 4, axisBias: 0.2, arcQuantisation: 0,
                Du: 0.21, Dv: 0.105, feedRate: 0.055, killRate: 0.062, iterations: 0,
                renderMode: 'Global Contours', weightScale: 1.5, tileWindowSize: 1, boundaryCost: 0.5,
                flowSpeed: 0.3, noiseFrequency: 1.2
            }
        }
    ],

    export: { png: true, gif: false, webm: false },

    // Flow advection uses time = frame × flowSpeed × 0.01. This advances without
    // modulo; the warp field never reproduces its initial state. Non-loopable →
    // gif and webm disabled. Sequencer not useful (no loop boundary).
    animation: { type: 'infinite', defaultFps: 60, animatableParams: ['flowSpeed', 'noiseFrequency'], sequencer: true },

    infoSections: [
        {
            heading: 'DESCRIPTION',
            body: 'Generative Pattern is a four-phase unified pattern system. A hybrid point set is distributed across the canvas; a proximity graph is built from the set; an optional Gray-Scott reaction-diffusion solver evolves scalar fields on the graph topology; and a 2D signed-distance field (SDF) is computed from the graph edges. The SDF drives four rendering modes: Blob (inflated smooth union), Truchet (arc-template tiles from marching-squares classification), Nested Contours (close-spaced iso-lines), and Global Contours (wide-spaced iso-lines across the full SDF range). A noise-warp flow field animates the SDF lookup continuously, advecting the visual output without recomputing the SDF each frame.'
        },
        {
            heading: 'ALGORITHM',
            body: 'Phase 1 — Hybrid Point Distribution (GEO-023): N = clamp(density × 50, 10, 250) points placed on a ceil(√N) × ceil(√N) grid. Jitter displacement = (rng − 0.5) × 2 × jitter × cellSize × 0.5; point position = gridPos × gridStrength + (gridPos + jitter) × (1 − gridStrength). Cluster weight per point: w = 0.3 + 0.7 × valueNoise(x × clusterScale / W, y × clusterScale / H). Phase 2 — Proximity Graph (GEO-024): for each pair (i, j), Euclidean distance d is compared to connectionRadius × avgSpacing. Axis bias: effectiveDist = d × (1 + axisBias × |sin(2 × atan2(dy, dx))|). Arc quantisation: connection angle rounded to nearest 2π / (4 + arcQuantisation × 8) step before bias. Candidates sorted by effectiveDist; each node limited to maxDegree connections. Phase 3 — Gray-Scott Solver (PHYS-005): ∂u/∂t = Du·∇²u − u·v² + F·(1−u); ∂v/∂t = Dv·∇²v + u·v² − (F+k)·v; ∇² is the degree-normalised graph Laplacian; dt = 0.5 per step; seeded with v = 0.25 in nodes within 80 px of canvas centre. Phase 4 — SDF (IMG-018): per 80×80 grid cell, minimum weighted distance to any graph edge: sdf(c) = min over edges of dist(c, edge) / ((wa + wb)/2 × weightScale). Animation: per frame, each SDF sample warped by (ox, oy) = (noise2d(gx × f / SDF_RES, gy × f / SDF_RES, t) − 0.5) × flowSpeed × SDF_RES × 0.3, where t = frame × flowSpeed × 0.01.'
        },
        {
            heading: 'PARAMETERS',
            body: 'Points — density: 0.5–10 step 0.5 default 3; N = density × 50 (capped at 250). gridStrength: 0–1 step 0.05 default 0.5; 1 = pure grid, 0 = full jitter displacement. clusterScale: 0.1–5 step 0.1 default 1.5; spatial frequency of the noise-weight field. jitter: 0–1 step 0.05 default 0.35; maximum jitter as a fraction of cell size. Connectivity — connectionRadius: 0.5–5 step 0.1 default 2; multiplier of average cell spacing as connection threshold. maxDegree: 2–8 step 1 default 4; maximum edges per node. axisBias: 0–1 step 0.05 default 0.3; penalty for non-cardinal edge directions; 1 forces near-cardinal connections only. arcQuantisation: 0–1 step 0.05 default 0; 0 = continuous angles, 1 = angles quantised to nearest of 12 steps. Evolution — Du: 0.1–0.5 step 0.01 default 0.21; u-species diffusion rate. Dv: 0.01–0.2 step 0.005 default 0.105; v-species diffusion rate. feedRate: 0.01–0.1 step 0.001 default 0.055; Gray-Scott F parameter. killRate: 0.04–0.08 step 0.001 default 0.062; Gray-Scott k parameter. iterations: 0–5000 step 100 default 0; RD steps computed once at setup; 0 skips Phase 3. Render — renderMode: Blob / Truchet / Nested Contours / Global Contours. weightScale: 0.5–5 step 0.1 default 1.5; scales point weights in SDF, expanding or contracting the effective reach of each node. tileWindowSize: 0.5–2 step 0.1 default 1; iso-level spacing multiplier for contour modes; Truchet threshold range. boundaryCost: 0–1 step 0.05 default 0.5; shifts the SDF threshold toward the SDF maximum, thinning or thickening blobs/contours. Animation — flowSpeed: 0–2 step 0.05 default 0.3; controls both warp magnitude and time advance rate. noiseFrequency: 0.1–5 step 0.1 default 1.5; spatial frequency of the warp noise field.'
        },
        {
            heading: 'PRESETS',
            body: 'Truchet Grid: density 4, gridStrength 0.9, jitter 0.1, axisBias 0.85, arcQuantisation 0.8, mode Truchet. A near-regular grid with strongly cardinal edges produces recognisable Truchet arc patterns with gentle flow. Blob Field: density 3, gridStrength 0.2, jitter 0.7, maxDegree 6, weightScale 2.5, mode Blob. Irregular point clusters produce organic blobby shapes animated by a moderate flow warp. RD Contours: density 2.5, iterations 2000, feedRate 0.037, killRate 0.06, mode Nested Contours. Gray-Scott run on a sparse graph seeds Turing-like weight variation; nested iso-contours reveal the topology of the RD pattern. Global Web: density 5, connectionRadius 2, mode Global Contours. Dense graph with no RD evolution; global iso-contours trace a web-like skeleton across the full canvas.'
        },
        {
            heading: 'PERFORMANCE',
            body: 'Setup (rebuild, one-time cost on param change): Phase 1 O(N), Phase 2 O(N²) worst case (~75 µs at N = 150 using sorted candidates), Phase 3 O(N × iterations) (~50 ms at N = 150 and iterations = 5000), Phase 4 (SDF) O(SDF_RES² × E) = O(6400 × E); at E = 300: ~1.9M operations (~8 ms). Total rebuild at default params (iterations = 0): < 5 ms. Total rebuild at iterations = 5000, N = 150: ~55 ms (noticeable but one-time). Per-frame cost: O(SDF_RES²) = 6400 cells × 2 hash-noise evaluations = ~12,800 operations (~0.5 ms); plus O(TILE_N²) = 400 arc draw calls for Truchet, O(SDF_RES²) = 6400 marching-squares segments for contour modes. Total per-frame: 1–3 ms, well within 16 ms budget. Dominant per-frame cost for Truchet is the p.arc() draw call batch (400 arcs); for contour modes, the marching-squares line segment loop.'
        },
        {
            heading: 'ANIMATION',
            body: 'Type: infinite. The animation warp is driven by t = frame × flowSpeed × 0.01, which advances monotonically without modulo; the warp field never reproduces its initial state. This makes the animation non-loopable: there is no frame at which the canvas returns to its initial appearance, so GIF and WebM export are disabled. flowSpeed = 0 produces a fully static render (no warp, no visual change between frames). flowSpeed > 0 applies a hash-noise UV displacement to each SDF lookup, creating an organic drift without recomputing the SDF. noiseFrequency controls the spatial granularity of the warp. The SDF itself is precomputed once and held constant; only the lookup coordinates change per frame. Default FPS: 60. PNG export available.'
        },
        {
            heading: 'KNOWN LIMITATIONS',
            body: 'SDF is rasterised at 80×80 resolution (10 px/cell on 800×800 canvas). Contour lines and Truchet arc boundaries may appear slightly stepped or blocky at high zoom, especially at low density (few, widely-spaced edges). Truchet mode uses a hard threshold and may show abrupt transitions on smooth SDF regions; increasing tileWindowSize spreads the threshold range. Gray-Scott solver with iterations > 0 triggers a full rebuild on every parameter change, including Evolution parameters; at iterations = 5000 this rebuild takes ~50 ms and is perceptible. The graph Laplacian Gray-Scott initialisation is seeded at canvas centre (within 80 px radius); for low-density configurations with few central nodes, the seed may find no nodes and produce no RD pattern. arcQuantisation rounds angles to a fixed step count (4–12 steps); at high quantisation, some edges that were within connectionRadius may have their quantised angle fall outside the proximity check, reducing edge count unexpectedly. Warp animation uses 2D value noise, not Perlin noise; the flow field lacks the smoothness of Perlin at high noiseFrequency values.'
        },
        {
            heading: 'REFERENCES',
            body: 'Gray-Scott reaction-diffusion: Pearson, J.E. (1993) "Complex Patterns in a Simple System", Science 261:189–192. Truchet tiles: Smith, C.S. (1987) "The tiling patterns of Sebastien Truchet", Leonardo 20(4):373–385; Browne, C. (2008) "Truchet tilings revisited". Marching Squares: Lorensen, W.E. & Cline, H.E. (1987) "Marching Cubes", SIGGRAPH 87. Module codes: GEO-023 (hybrid point distribution), GEO-024 (proximity graph), PHYS-005 (Gray-Scott solver), IMG-018 (distance transform/SDF), PAT-010 (Truchet), PAT-011 (blob union), PAT-012 (nested contours), ANIM-012 (flow advection).'
        }
    ],

    // ─── State ────────────────────────────────────────────────────────────────
    _points: null,        // Array<{x, y, weight, u, v}>
    _edges: null,         // Array<{a, b}>
    _sdf: null,           // Float32Array[SDF_RES × SDF_RES]
    _sdfMin: 0,
    _sdfMax: 1,
    _lastStructKey: null,
    _offImg: null,        // p5 p.createImage buffer (blob/contour renderer)
    _rngState: 42,

    // ─── Utilities ────────────────────────────────────────────────────────────

    /** LCG pseudo-random number generator seeded deterministically. */
    _rng() {
        this._rngState = (Math.imul(this._rngState, 1664525) + 1013904223) | 0;
        return (this._rngState >>> 0) / 0x100000000;
    },

    _rngSeed(s) { this._rngState = s | 0; },

    /**
     * 2D value noise via integer hashing + bilinear interpolation.
     * O(1) per call; no external dependency.
     */
    _noise2d(x, y) {
        const ix = Math.floor(x), iy = Math.floor(y);
        const fx = x - ix, fy = y - iy;
        const ux = fx * fx * (3 - 2 * fx);
        const uy = fy * fy * (3 - 2 * fy);
        return (
            this._h(ix,   iy)   * (1 - ux) * (1 - uy) +
            this._h(ix+1, iy)   * ux       * (1 - uy) +
            this._h(ix,   iy+1) * (1 - ux) * uy       +
            this._h(ix+1, iy+1) * ux       * uy
        );
    },

    /** Integer hash for value noise lattice. */
    _h(x, y) {
        let n = (x * 374761393 + y * 668265263) | 0;
        n = Math.imul(n ^ (n >>> 13), 1274126177) | 0;
        return ((n ^ (n >>> 16)) >>> 0) / 0x100000000;
    },

    /**
     * 3D value noise: interpolates two 2D planes at integer z boundaries.
     * Used for the time-varying warp field.
     */
    _noise3d(x, y, z) {
        const iz = Math.floor(z), fz = z - iz;
        const v0 = this._noise2d(x + iz       * 7.31, y + iz       * 3.71);
        const v1 = this._noise2d(x + (iz + 1) * 7.31, y + (iz + 1) * 3.71);
        const uz = fz * fz * (3 - 2 * fz);
        return v0 * (1 - uz) + v1 * uz;
    },

    /**
     * Minimum distance from point (px, py) to line segment (ax, ay)→(bx, by).
     * GEO utility shared by SDF computation.
     */
    _segDist(px, py, ax, ay, bx, by) {
        const dx = bx - ax, dy = by - ay;
        const lenSq = dx * dx + dy * dy;
        if (lenSq < 1e-6) {
            const ex = px - ax, ey = py - ay;
            return Math.sqrt(ex * ex + ey * ey);
        }
        const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
        const rx = px - ax - t * dx, ry = py - ay - t * dy;
        return Math.sqrt(rx * rx + ry * ry);
    },

    /**
     * Clamped SDF lookup with out-of-bounds returning _sdfMax.
     */
    _sdfAt(gx, gy) {
        const ix = Math.max(0, Math.min(SDF_RES - 1, Math.round(gx)));
        const iy = Math.max(0, Math.min(SDF_RES - 1, Math.round(gy)));
        return this._sdf[iy * SDF_RES + ix];
    },

    /**
     * SDF lookup with hash-noise warp applied.
     * Cost: 2 × _noise3d calls ≈ 14 hash operations.
     * Used directly only by the Truchet renderer (sparse corner queries).
     * Contour and Blob renderers use _buildWarpedCache() instead.
     */
    _sdfWarped(gx, gy, t, noiseFrequency, flowSpeed) {
        if (flowSpeed <= 0) return this._sdfAt(gx, gy);
        const nx = gx * noiseFrequency / SDF_RES;
        const ny = gy * noiseFrequency / SDF_RES;
        const mag = flowSpeed * SDF_RES * 0.25;
        const ox = (this._noise3d(nx,      ny,       t) - 0.5) * mag;
        const oy = (this._noise3d(nx + 50, ny + 50,  t * 0.7) - 0.5) * mag;
        return this._sdfAt(gx + ox, gy + oy);
    },

    /**
     * Performance mitigation: pre-compute the warped SDF
     * for all SDF_RES² cells once per frame. Cost: O(SDF_RES²) = 6400 warp
     * evaluations. Renderers that visit every cell multiple times (contour modes
     * visit SDF_RES² cells × numLines iso-levels) use this cache instead of
     * calling _sdfWarped per-cell-per-iso-level, reducing warp noise from
     * O(SDF_RES² × numLines) to O(SDF_RES²).
     */
    _buildWarpedCache(t, noiseFrequency, flowSpeed) {
        const cache = new Float32Array(SDF_RES * SDF_RES);
        for (let gy = 0; gy < SDF_RES; gy++) {
            for (let gx = 0; gx < SDF_RES; gx++) {
                cache[gy * SDF_RES + gx] = this._sdfWarped(gx, gy, t, noiseFrequency, flowSpeed);
            }
        }
        return cache;
    },

    /** Struct-change key: all params that trigger a full rebuild. */
    _structKey(params) {
        return [
            params.density, params.gridStrength, params.clusterScale, params.jitter,
            params.connectionRadius, params.maxDegree, params.axisBias, params.arcQuantisation,
            params.Du, params.Dv, params.feedRate, params.killRate, params.iterations,
            params.weightScale
        ].join('|');
    },

    // ─── Phase 1: Hybrid Point Distribution (GEO-023) ─────────────────────────

    /**
     * Builds a jittered grid point set modulated by a noise weight field.
     * gridStrength: 1 = pure grid, 0 = full jitter displacement from grid.
     * clusterScale: spatial frequency of the noise weight field.
     */
    _hybridPointDistribution(params, W, H) {
        const { density, gridStrength, clusterScale, jitter } = params;
        const N = Math.max(10, Math.min(MAX_PTS, Math.round(density * 50)));
        const side = Math.ceil(Math.sqrt(N));
        const cellW = W / side;
        const cellH = H / side;

        const pts = [];
        for (let gy = 0; gy < side && pts.length < N; gy++) {
            for (let gx = 0; gx < side && pts.length < N; gx++) {
                const baseX = (gx + 0.5) * cellW;
                const baseY = (gy + 0.5) * cellH;

                const jScale = jitter * Math.min(cellW, cellH) * 0.5;
                const jx = (this._rng() - 0.5) * 2 * jScale;
                const jy = (this._rng() - 0.5) * 2 * jScale;

                // gridStrength blends between pure grid and jittered grid position
                const x = Math.max(0, Math.min(W - 1, baseX + jx * (1 - gridStrength)));
                const y = Math.max(0, Math.min(H - 1, baseY + jy * (1 - gridStrength)));

                // Cluster weight: noise modulates influence radius in the SDF
                const weight = 0.3 + 0.7 * this._noise2d(
                    x * clusterScale / W,
                    y * clusterScale / H
                );

                pts.push({ x, y, weight, u: 1, v: 0 });
            }
        }
        return pts;
    },

    // ─── Phase 2: Proximity Graph (GEO-024) ───────────────────────────────────

    /**
     * Builds an undirected proximity graph on the point set.
     * axisBias penalises non-cardinal edge directions.
     * arcQuantisation rounds connection angles to discrete steps before bias.
     */
    _proximityGraph(params, W) {
        const { connectionRadius, maxDegree, axisBias, arcQuantisation } = params;
        const N = this._points.length;
        const avgSpacing = W / Math.ceil(Math.sqrt(N));
        const radiusPx = connectionRadius * avgSpacing;
        const angleSteps = Math.round(4 + arcQuantisation * 8);  // 4 to 12 steps
        const angleStep  = (Math.PI * 2) / angleSteps;

        const edges = [];
        const degree = new Int32Array(N);

        for (let i = 0; i < N; i++) {
            const pi = this._points[i];
            const candidates = [];

            for (let j = i + 1; j < N; j++) {
                const pj = this._points[j];
                const dx = pj.x - pi.x;
                const dy = pj.y - pi.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist >= radiusPx) continue;

                // arcQuantisation: round connection angle to nearest discrete step
                let angle = Math.atan2(dy, dx);
                if (arcQuantisation > 0) {
                    angle = Math.round(angle / angleStep) * angleStep;
                }

                // axisBias: |sin(2θ)| = 0 at cardinal, 1 at diagonal → penalise diagonal
                const axisAlignment = Math.abs(Math.sin(2 * angle));
                const effectiveDist = dist * (1 + axisBias * axisAlignment);

                candidates.push({ j, effectiveDist });
            }

            candidates.sort((a, b) => a.effectiveDist - b.effectiveDist);

            for (const c of candidates) {
                if (degree[i] >= maxDegree) break;
                if (degree[c.j] >= maxDegree) continue;
                edges.push({ a: i, b: c.j });
                degree[i]++;
                degree[c.j]++;
            }
        }
        return edges;
    },

    // ─── Phase 3: Gray-Scott Solver (PHYS-005) ────────────────────────────────

    /**
     * Evolves Gray-Scott reaction-diffusion on the proximity graph topology.
     * ∂u/∂t = Du·∇²u − u·v² + F·(1−u)
     * ∂v/∂t = Dv·∇²v + u·v² − (F+k)·v
     * ∇² is the degree-normalised graph Laplacian.
     * v values are stored into point.weight after simulation.
     */
    _grayScottSolver(params) {
        const { Du, Dv, feedRate, killRate, iterations } = params;
        const N = this._points.length;

        // Build adjacency list
        const adj = Array.from({ length: N }, () => []);
        for (const e of this._edges) {
            adj[e.a].push(e.b);
            adj[e.b].push(e.a);
        }

        const u = new Float32Array(N).fill(1);
        const v = new Float32Array(N).fill(0);
        const newU = new Float32Array(N);
        const newV = new Float32Array(N);

        // Seed v in nodes within 80 px of canvas centre
        for (let i = 0; i < N; i++) {
            const dx = this._points[i].x - 400;
            const dy = this._points[i].y - 400;
            if (dx * dx + dy * dy < 80 * 80) {
                u[i] = 0.75;
                v[i] = 0.25 + this._rng() * 0.01;
            }
        }

        const dt = 0.5;

        for (let iter = 0; iter < iterations; iter++) {
            for (let i = 0; i < N; i++) {
                const deg = adj[i].length;
                let lapU = 0, lapV = 0;

                if (deg > 0) {
                    for (const j of adj[i]) {
                        lapU += u[j] - u[i];
                        lapV += v[j] - v[i];
                    }
                    lapU /= deg;
                    lapV /= deg;
                }

                const uvv = u[i] * v[i] * v[i];
                newU[i] = Math.max(0, Math.min(1,
                    u[i] + dt * (Du * lapU - uvv + feedRate * (1 - u[i]))
                ));
                newV[i] = Math.max(0, Math.min(1,
                    v[i] + dt * (Dv * lapV + uvv - (feedRate + killRate) * v[i])
                ));
            }
            u.set(newU);
            v.set(newV);
        }

        // Blend RD v-field into point weights
        for (let i = 0; i < N; i++) {
            this._points[i].u = u[i];
            this._points[i].v = v[i];
            // v > 0 indicates RD pattern region; modulate the SDF weight field
            this._points[i].weight = Math.max(0.1, this._points[i].weight * (1 - v[i] * 1.5));
        }
    },

    // ─── Phase 4: Distance Transform / SDF (IMG-018) ──────────────────────────

    /**
     * Computes the SDF field on an 80×80 grid.
     * Per cell: minimum weighted distance to any graph edge.
     * weight = (wa + wb) / 2 × weightScale; divides raw distance, so high-weight
     * nodes appear "closer" and create wider influence zones in the SDF.
     * Falls back to point-only distance when no edges exist.
     */
    _computeSDF(params, W, H) {
        const { weightScale } = params;
        const cellW = W / SDF_RES;
        const cellH = H / SDF_RES;
        const sdf = new Float32Array(SDF_RES * SDF_RES);
        const pts = this._points;
        const edges = this._edges;
        const hasEdges = edges.length > 0;

        for (let gy = 0; gy < SDF_RES; gy++) {
            const cy = (gy + 0.5) * cellH;
            for (let gx = 0; gx < SDF_RES; gx++) {
                const cx = (gx + 0.5) * cellW;
                let minD = Infinity;

                if (hasEdges) {
                    for (const e of edges) {
                        const pa = pts[e.a], pb = pts[e.b];
                        const d = this._segDist(cx, cy, pa.x, pa.y, pb.x, pb.y);
                        const w = (pa.weight + pb.weight) * 0.5 * weightScale;
                        minD = Math.min(minD, d / Math.max(0.1, w));
                    }
                } else {
                    for (const pt of pts) {
                        const dx = cx - pt.x, dy = cy - pt.y;
                        const d = Math.sqrt(dx * dx + dy * dy);
                        minD = Math.min(minD, d / Math.max(0.1, pt.weight * weightScale));
                    }
                }

                sdf[gy * SDF_RES + gx] = minD;
            }
        }

        let mn = Infinity, mx = -Infinity;
        for (let i = 0; i < sdf.length; i++) {
            if (sdf[i] < mn) mn = sdf[i];
            if (sdf[i] > mx) mx = sdf[i];
        }

        this._sdf = sdf;
        this._sdfMin = mn;
        this._sdfMax = mx;
    },

    // ─── Full Rebuild ─────────────────────────────────────────────────────────

    _rebuild(p, params) {
        this._rngSeed(12345);  // deterministic across rebuilds
        this._points = this._hybridPointDistribution(params, p.width, p.height);
        this._edges  = this._proximityGraph(params, p.width);
        if (params.iterations > 0) this._grayScottSolver(params);
        this._computeSDF(params, p.width, p.height);
        this._lastStructKey = this._structKey(params);
    },

    // ─── Rendering: Blob (PAT-011) ────────────────────────────────────────────

    /**
     * Renders the SDF as a smooth inflated-union blob field.
     * Inside threshold: bright; outside: rapid falloff to dark.
     * Output produced at SDF_RES and scaled to canvas via p.image().
     */
    _renderBlob(p, params, frame) {
        const { boundaryCost, flowSpeed, noiseFrequency } = params;
        const range = this._sdfMax - this._sdfMin;
        if (range < 1e-6) return;

        const threshold = this._sdfMin + range * (0.4 + boundaryCost * 0.3);
        const t = frame * flowSpeed * 0.01;

        // Pre-build warped cache once (O(SDF_RES²)) — avoids re-evaluating
        // per-cell warp for each pixel lookup in the image loop.
        const cache = this._buildWarpedCache(t, noiseFrequency, flowSpeed);

        if (!this._offImg || this._offImg.width !== SDF_RES) {
            this._offImg = p.createImage(SDF_RES, SDF_RES);
        }
        const img = this._offImg;
        img.loadPixels();
        const px = img.pixels;

        const threshNorm = (threshold - this._sdfMin) / range;

        for (let gy = 0; gy < SDF_RES; gy++) {
            for (let gx = 0; gx < SDF_RES; gx++) {
                const sval = cache[gy * SDF_RES + gx];
                let c;
                if (sval < threshold) {
                    const tNorm = (sval - this._sdfMin) / (threshold - this._sdfMin);
                    c = Math.round(200 + 55 * (1 - tNorm));
                } else {
                    const norm = (sval - this._sdfMin) / range;
                    const excess = Math.min(1, (norm - threshNorm) * 3);
                    c = Math.round(40 * (1 - excess));
                }
                const i = (gy * SDF_RES + gx) * 4;
                px[i] = px[i+1] = px[i+2] = c;
                px[i+3] = 255;
            }
        }
        img.updatePixels();
        p.image(img, 0, 0, p.width, p.height);
    },

    // ─── Rendering: Truchet (PAT-010) ─────────────────────────────────────────

    /**
     * Renders arc-template tiles by classifying each tile's four corners
     * against an SDF threshold (marching-squares classification).
     * Ambiguous cases (6, 9) and pass-through cases (3, 5, 10, 12) alternate
     * between TL+BR and TR+BL arc pairs using tile-parity for a classic
     * Truchet chequerboard distribution.
     */
    _renderTruchet(p, params, frame) {
        const { boundaryCost, flowSpeed, noiseFrequency, tileWindowSize } = params;
        const range = this._sdfMax - this._sdfMin;
        if (range < 1e-6) return;

        const threshold = this._sdfMin + range * (0.2 + boundaryCost * 0.5 * tileWindowSize);
        const t = frame * flowSpeed * 0.01;
        const W = p.width, H = p.height;
        const tileW = W / TILE_N;
        const tileH = H / TILE_N;

        p.background(0);
        p.noFill();
        p.stroke(255);
        p.strokeWeight(Math.max(1.2, tileW * 0.07));

        const sdfCorner = (tx, ty) => {
            const gx = tx * SDF_RES / TILE_N;
            const gy = ty * SDF_RES / TILE_N;
            return this._sdfWarped(gx, gy, t, noiseFrequency, flowSpeed);
        };

        const HALF_PI = Math.PI / 2;
        const PI = Math.PI;

        for (let ty = 0; ty < TILE_N; ty++) {
            for (let tx = 0; tx < TILE_N; tx++) {
                const x = tx * tileW;
                const y = ty * tileH;
                const w = tileW, h = tileH;

                const vTL = sdfCorner(tx,   ty)   < threshold ? 1 : 0;
                const vTR = sdfCorner(tx+1, ty)   < threshold ? 1 : 0;
                const vBL = sdfCorner(tx,   ty+1) < threshold ? 1 : 0;
                const vBR = sdfCorner(tx+1, ty+1) < threshold ? 1 : 0;
                const code = (vTL << 3) | (vTR << 2) | (vBL << 1) | vBR;

                // Corner arcs (arc from one edge midpoint to adjacent edge midpoint):
                //   TL arc: p.arc(x,   y,   w, h,  0,        HALF_PI) → top-mid ↔ left-mid
                //   TR arc: p.arc(x+w, y,   w, h,  HALF_PI,  PI     ) → right-mid ↔ top-mid
                //   BL arc: p.arc(x,   y+h, w, h, -HALF_PI,  0      ) → left-mid ↔ bottom-mid
                //   BR arc: p.arc(x+w, y+h, w, h,  PI,       PI+HALF_PI) → bottom-mid ↔ right-mid
                const drawTL = () => p.arc(x,   y,   w, h, 0,        HALF_PI,      p.OPEN);
                const drawTR = () => p.arc(x+w, y,   w, h, HALF_PI,  PI,           p.OPEN);
                const drawBL = () => p.arc(x,   y+h, w, h, -HALF_PI, 0,            p.OPEN);
                const drawBR = () => p.arc(x+w, y+h, w, h, PI,       PI + HALF_PI, p.OPEN);

                // Tile parity alternates arc pair for ambiguous/pass-through cases
                const alt = (tx + ty) % 2 === 0;

                switch (code) {
                    case 0: case 15: break;
                    case 1:  case 14: drawBR(); break;
                    case 2:  case 13: drawBL(); break;
                    case 4:  case 11: drawTR(); break;
                    case 8:  case 7:  drawTL(); break;
                    case 3:  case 12:  // horizontal pass-through
                        alt ? (drawTL(), drawBR()) : (drawTR(), drawBL()); break;
                    case 5:  case 10:  // vertical pass-through
                        alt ? (drawTL(), drawBR()) : (drawTR(), drawBL()); break;
                    case 6:  // saddle: TL-TR-BR or BL-BR-TL
                        alt ? (drawTL(), drawBR()) : (drawTR(), drawBL()); break;
                    case 9:  // saddle: TR-TL or BL-BR
                        alt ? (drawTR(), drawBL()) : (drawTL(), drawBR()); break;
                }
            }
        }
    },

    // ─── Rendering: Nested Contours (PAT-012) ────────────────────────────────

    /**
     * Extracts iso-lines from the SDF using marching squares on the 80×80
     * grid. Draws multiple iso-levels spaced by tileWindowSize × range × 0.08
     * starting from boundaryCost-shifted threshold.
     */
    _renderNestedContours(p, params, frame) {
        const { boundaryCost, tileWindowSize, flowSpeed, noiseFrequency } = params;
        const range = this._sdfMax - this._sdfMin;
        if (range < 1e-6) return;

        const baseIso  = this._sdfMin + range * (0.08 + boundaryCost * 0.5);
        const spacing  = range * tileWindowSize * 0.08;
        const numLines = Math.min(25, Math.max(1, Math.floor((this._sdfMax - baseIso) / spacing)));
        const t = frame * flowSpeed * 0.01;
        const W = p.width, H = p.height;
        const cellW = W / SDF_RES;
        const cellH = H / SDF_RES;

        p.background(0);
        p.stroke(255);
        p.strokeWeight(1.2);

        // Cache warped SDF once; reuse across all numLines passes.
        // Reduces warp noise evaluations from O(SDF_RES² × numLines) to O(SDF_RES²).
        const cache = this._buildWarpedCache(t, noiseFrequency, flowSpeed);

        for (let ci = 0; ci < numLines; ci++) {
            const iso = baseIso + ci * spacing;

            for (let gy = 0; gy < SDF_RES - 1; gy++) {
                const y0 = gy * cellH;
                const y1 = y0 + cellH;
                for (let gx = 0; gx < SDF_RES - 1; gx++) {
                    const x0 = gx * cellW;
                    const x1 = x0 + cellW;
                    this._marchSquares(p, x0, y0, x1, y1,
                        cache[gy       * SDF_RES + gx],
                        cache[gy       * SDF_RES + gx + 1],
                        cache[(gy + 1) * SDF_RES + gx],
                        cache[(gy + 1) * SDF_RES + gx + 1],
                        iso
                    );
                }
            }
        }
    },

    // ─── Rendering: Global Contours (PAT-012 global variant) ─────────────────

    /**
     * Same as Nested Contours but iso-levels are spaced across the full SDF
     * range, producing a web-like global skeleton.
     */
    _renderGlobalContours(p, params, frame) {
        const { boundaryCost, tileWindowSize, flowSpeed, noiseFrequency } = params;
        const range = this._sdfMax - this._sdfMin;
        if (range < 1e-6) return;

        const spacing  = range * tileWindowSize * 0.12;
        const numLines = Math.min(30, Math.max(1, Math.floor(range / spacing)));
        const t = frame * flowSpeed * 0.01;
        const W = p.width, H = p.height;
        const cellW = W / SDF_RES;
        const cellH = H / SDF_RES;

        p.background(0);
        p.stroke(255);
        p.strokeWeight(1.2);

        // Cache warped SDF once; reuse across all numLines passes.
        const cache = this._buildWarpedCache(t, noiseFrequency, flowSpeed);

        for (let ci = 0; ci < numLines; ci++) {
            const iso = this._sdfMin + ci * spacing;

            for (let gy = 0; gy < SDF_RES - 1; gy++) {
                const y0 = gy * cellH;
                const y1 = y0 + cellH;
                for (let gx = 0; gx < SDF_RES - 1; gx++) {
                    const x0 = gx * cellW;
                    const x1 = x0 + cellW;
                    this._marchSquares(p, x0, y0, x1, y1,
                        cache[gy       * SDF_RES + gx],
                        cache[gy       * SDF_RES + gx + 1],
                        cache[(gy + 1) * SDF_RES + gx],
                        cache[(gy + 1) * SDF_RES + gx + 1],
                        iso
                    );
                }
            }
        }
    },

    // ─── Marching Squares Line Segments ───────────────────────────────────────

    /**
     * Emits 0, 1, or 2 line segments for one cell in the marching-squares
     * traversal of a scalar field at iso-level `iso`.
     * Edge crossing coordinates are linearly interpolated.
     * Saddle cases (6, 9) use a single fixed variant (no centre-value test).
     */
    _marchSquares(p, x0, y0, x1, y1, tl, tr, bl, br, iso) {
        const code = ((tl < iso) ? 8 : 0) | ((tr < iso) ? 4 : 0) |
                     ((bl < iso) ? 2 : 0) | ((br < iso) ? 1 : 0);
        if (code === 0 || code === 15) return;

        const lerp = (a, b, va, vb) => {
            const d = vb - va;
            return Math.abs(d) < 1e-9 ? a : a + (b - a) * ((iso - va) / d);
        };

        // Edge crossing points (in screen coordinates)
        const tE = () => [lerp(x0, x1, tl, tr), y0];
        const rE = () => [x1, lerp(y0, y1, tr, br)];
        const bE = () => [lerp(x0, x1, bl, br), y1];
        const lE = () => [x0, lerp(y0, y1, tl, bl)];

        const seg = (a, b) => p.line(a[0], a[1], b[0], b[1]);

        switch (code) {
            case 1:  seg(bE(), rE()); break;
            case 2:  seg(lE(), bE()); break;
            case 3:  seg(lE(), rE()); break;
            case 4:  seg(tE(), rE()); break;
            case 5:  seg(tE(), bE()); break;
            case 6:  seg(tE(), lE()); seg(rE(), bE()); break;
            case 7:  seg(tE(), lE()); break;
            case 8:  seg(tE(), lE()); break;
            case 9:  seg(tE(), rE()); seg(lE(), bE()); break;
            case 10: seg(tE(), bE()); break;
            case 11: seg(tE(), rE()); break;
            case 12: seg(lE(), rE()); break;
            case 13: seg(lE(), bE()); break;
            case 14: seg(rE(), bE()); break;
        }
    },

    // ─── p5.js Lifecycle ──────────────────────────────────────────────────────

    p5Setup(p, params) {
        p.noLoop();
        p.colorMode(p.RGB, 255);
        this._rebuild(p, params);
    },

    p5Draw(p, params, frame) {
        if (this._structKey(params) !== this._lastStructKey) {
            this._rebuild(p, params);
        }

        const mode = params.renderMode;
        if      (mode === 'Truchet')          this._renderTruchet(p, params, frame);
        else if (mode === 'Blob')             this._renderBlob(p, params, frame);
        else if (mode === 'Nested Contours')  this._renderNestedContours(p, params, frame);
        else                                  this._renderGlobalContours(p, params, frame);
    }
};
