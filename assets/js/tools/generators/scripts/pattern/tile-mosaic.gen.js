/**
 * Tile Mosaic — Canvas 2D generator
 *
 * Tile-based mosaic: rect packing → offscreen sprite cache → pseudo-3D lighting
 * → noise overlay. Four animation modes: Breathing, Morph Layouts, Texture Drift,
 * and All (combined).
 *
 * @version 1.0.0
 */

import '../../../../shared/algorithms/core/math-utils.js';

// ─── Palette definitions: [hue°, saturation%, lightness%] × 8 ───────────────

const PALETTES = {
    'Warm':          [[10,85,55],[25,90,50],[40,80,60],[0,70,45],[50,95,55],[20,75,65],[35,85,50],[5,80,60]],
    'Cool':          [[200,75,55],[220,80,50],[180,70,60],[240,65,45],[210,85,55],[195,70,65],[230,75,50],[185,80,60]],
    'Mixed':         [[10,85,55],[200,75,55],[120,70,50],[280,65,60],[45,90,55],[170,70,65],[330,75,50],[90,80,55]],
    'Earth':         [[25,55,40],[35,50,50],[20,60,35],[40,45,55],[30,65,42],[15,58,38],[45,52,45],[30,48,50]],
    'Pastel':        [[300,50,80],[180,45,78],[60,48,82],[120,46,80],[240,50,79],[30,52,81],[210,44,77],[90,48,83]],
    'High-Contrast': [[0,100,50],[120,100,50],[240,100,50],[60,100,50],[300,100,50],[180,100,50],[30,100,50],[270,100,50]]
};

export const SCRIPT_CONFIG = {
    id: 'tile-mosaic',
    title: 'Tile Mosaic',
    category: 'pattern',
    description: 'Tile-based mosaic with rect packing, offscreen sprite caching, pseudo-3D lighting, and noise overlay. Four animation modes.',
    version: '1.1.0',

    canvas: {
        width: 800, height: 800, context: '2d',
        // TIL-05: custom palette via colourway — 8 slots mirror PALETTES row structure
        colourway: [
            { id: 'c0', label: 'Colour 1', colour: '#c8441a' },
            { id: 'c1', label: 'Colour 2', colour: '#d4621e' },
            { id: 'c2', label: 'Colour 3', colour: '#d4882d' },
            { id: 'c3', label: 'Colour 4', colour: '#b83217' },
            { id: 'c4', label: 'Colour 5', colour: '#d89a28' },
            { id: 'c5', label: 'Colour 6', colour: '#c86432' },
            { id: 'c6', label: 'Colour 7', colour: '#c05220' },
            { id: 'c7', label: 'Colour 8', colour: '#b04019' }
        ]
    },

    animation: {
        type: 'infinite',
        defaultFps: 60,
        sequencer: true,
        animationExport: false
    },

    export: { png: true, gif: false, webm: false },

    parameters: [
        {
            group: 'Grid',
            params: [
                { key: 'gridColumns', type: 'slider',   label: 'Columns',    min: 4,  max: 40,    step: 1,   default: 10   },
                { key: 'gridRows',    type: 'slider',   label: 'Rows',       min: 4,  max: 40,    step: 1,   default: 10   },
                { key: 'tileSize',    type: 'slider',   label: 'Tile Size',  min: 10, max: 80,    step: 2,   default: 40   }
            ]
        },
        {
            group: 'Layout',
            params: [
                { key: 'layoutMode',  type: 'dropdown', label: 'Layout Mode',
                  options: ['Uniform Grid', 'Packed Rects A', 'Packed Rects B'], default: 'Uniform Grid' },
                { key: 'tileTypes',   type: 'toggle',   label: 'Tile Types',
                  options: ['Concentric', 'Wedge', 'Stripe', 'Solid', 'Texture', 'Micro', 'Truchet', 'Hex', 'Triangle'],
                  default: ['Concentric', 'Wedge', 'Stripe', 'Solid'] },
                { key: 'randomSeed',  type: 'slider',   label: 'Seed',       min: 0,  max: 999999, step: 1,  default: 42   }
            ]
        },
        {
            group: 'Behaviour',
            params: [
                { key: 'animationMode',  type: 'dropdown', label: 'Animation Mode',
                  options: ['Static', 'Morph Layouts', 'Breathing', 'Texture Drift', 'All'], default: 'Static' },
                { key: 'animationSpeed', type: 'slider',   label: 'Speed', min: 0.1, max: 5, step: 0.1, default: 1, precision: 1 }
            ]
        },
        {
            group: 'Palette',
            params: [
                // TIL-05: paletteMode — preset built-in or custom via colourway
                { key: 'paletteMode', type: 'select', label: 'Palette Mode',
                  options: [
                    { value: 'preset', label: 'Preset' },
                    { value: 'custom', label: 'Custom (Canvas colours)' }
                  ], default: 'preset' },
                { key: 'paletteSelection', type: 'dropdown', label: 'Preset Palette',
                  options: ['Warm', 'Cool', 'Mixed', 'Earth', 'Pastel', 'High-Contrast'], default: 'Warm' },
                { key: 'paletteVariance', type: 'slider', label: 'Variance',
                  min: 0, max: 1, step: 0.05, default: 0.3, precision: 2 }
            ]
        },
        {
            group: 'Depth',
            params: [
                { key: 'depthStrength',      type: 'slider', label: 'Depth',
                  min: 0, max: 1, step: 0.05, default: 0.5, precision: 2 },
                { key: 'highlightIntensity', type: 'slider', label: 'Highlight',
                  min: 0, max: 1, step: 0.05, default: 0.4, precision: 2 },
                { key: 'globalLightAngle',   type: 'slider', label: 'Light Angle',
                  min: 0, max: 360, step: 1, default: 45 },
                // TIL-03: Z-stack controls
                { key: 'zStackEnabled',  type: 'toggle', label: 'Z-Stack',  default: false },
                { key: 'zShadowBlur',    type: 'slider', label: 'Shadow Blur',
                  min: 0, max: 24, step: 1, default: 6 },
                { key: 'zShadowSpread', type: 'slider', label: 'Shadow Spread',
                  min: 0, max: 1, step: 0.05, default: 0.4, precision: 2 }
            ]
        },
        {
            group: 'Texture',
            params: [
                { key: 'textureStrength', type: 'slider', label: 'Global Strength',
                  min: 0, max: 1, step: 0.05, default: 0.3, precision: 2 },
                { key: 'overlayMode', type: 'dropdown', label: 'Global Overlay',
                  options: ['None', 'Noise', 'Noise+Light'], default: 'None' },
                // TIL-04: per-tile texture overlay
                { key: 'tileTextureOverlay', type: 'select', label: 'Tile Overlay',
                  options: [
                    { value: 'none',       label: 'None' },
                    { value: 'grain',      label: 'Grain' },
                    { value: 'crosshatch', label: 'Crosshatch' },
                    { value: 'dots',       label: 'Dots' }
                  ], default: 'none' },
                { key: 'tileTextureOpacity', type: 'slider', label: 'Tile Overlay Opacity',
                  min: 0, max: 1, step: 0.05, default: 0.25, precision: 2 }
            ]
        }
    ],

    presets: [
        {
            name: 'Geometric',
            values: {
                gridColumns: 12, gridRows: 12, tileSize: 40, layoutMode: 'Uniform Grid',
                tileTypes: ['Concentric', 'Wedge', 'Solid'], animationMode: 'Static',
                animationSpeed: 1, paletteSelection: 'Cool', paletteVariance: 0.2,
                depthStrength: 0.6, highlightIntensity: 0.5, globalLightAngle: 45,
                textureStrength: 0, overlayMode: 'None', randomSeed: 42
            }
        },
        {
            name: 'Organic',
            values: {
                gridColumns: 8, gridRows: 8, tileSize: 60, layoutMode: 'Packed Rects A',
                tileTypes: ['Concentric', 'Stripe', 'Texture'], animationMode: 'Breathing',
                animationSpeed: 1, paletteSelection: 'Earth', paletteVariance: 0.4,
                depthStrength: 0.4, highlightIntensity: 0.3, globalLightAngle: 135,
                textureStrength: 0.4, overlayMode: 'Noise', randomSeed: 1337
            }
        },
        {
            name: 'Neon Grid',
            values: {
                gridColumns: 16, gridRows: 16, tileSize: 30, layoutMode: 'Uniform Grid',
                tileTypes: ['Solid', 'Stripe'], animationMode: 'Texture Drift',
                animationSpeed: 2, paletteSelection: 'High-Contrast', paletteVariance: 0.1,
                depthStrength: 0.8, highlightIntensity: 0.7, globalLightAngle: 315,
                textureStrength: 0.2, overlayMode: 'Noise+Light', randomSeed: 7
            }
        },
        {
            name: 'Mosaic Flow',
            values: {
                gridColumns: 20, gridRows: 20, tileSize: 20, layoutMode: 'Packed Rects B',
                tileTypes: ['Wedge', 'Concentric', 'Solid'], animationMode: 'Morph Layouts',
                animationSpeed: 0.5, paletteSelection: 'Mixed', paletteVariance: 0.5,
                depthStrength: 0.5, highlightIntensity: 0.4, globalLightAngle: 225,
                textureStrength: 0.3, overlayMode: 'None', randomSeed: 999
            }
        },
        {
            name: 'Pastel Dream',
            values: {
                gridColumns: 6, gridRows: 6, tileSize: 80, layoutMode: 'Uniform Grid',
                tileTypes: ['Concentric', 'Wedge', 'Micro'], animationMode: 'All',
                animationSpeed: 1.5, paletteSelection: 'Pastel', paletteVariance: 0.3,
                depthStrength: 0.3, highlightIntensity: 0.5, globalLightAngle: 90,
                textureStrength: 0.5, overlayMode: 'Noise', randomSeed: 31415
            }
        }
    ],

    infoSections: [
        {
            heading: 'DESCRIPTION',
            body: 'Tile Mosaic generates dynamic tile-based mosaics on an 800×800 canvas. Three phases: (1) layout — compute tile geometry via one of three packing algorithms; (2) sprite generation — render each tile type once to an OffscreenCanvas for caching; (3) blit — composite sprites with optional noise overlay. Four animation modes drive Breathing (sinusoidal scale), Morph Layouts (position interpolation between two seeded layouts), Texture Drift (scrolling UV coordinates), and All (combined). Canvas size is 800×800; the spec value of 900×900 was not adopted.'
        },
        {
            heading: 'ALGORITHM',
            body: 'Phase 1 — rectPacker (GEO-016): Uniform Grid divides the canvas into gridColumns×gridRows equal cells. Packed Rects A applies a shelf-first heuristic seeded by randomSeed — tiles are placed left to right, a new shelf opens when the current shelf has insufficient width. Packed Rects B applies the same shelf heuristic with candidates sorted by descending height before packing, yielding a different fill density. Phase 2 — sprite generation (CANVAS-008): each unique (type, w, h, colourIdx) tuple is rendered once. Pseudo-3D lighting (PAT-008) applies a linear-gradient highlight toward globalLightAngle and shadow in the opposing direction, scaled by highlightIntensity and depthStrength. Phase 3 — blit (CANVAS-009): sprites composited via drawImage. When overlayMode ≠ None, a cached fBm noise OffscreenCanvas is blended with globalCompositeOperation multiply (PAT-009).'
        },
        {
            heading: 'TILE TYPES',
            body: 'Concentric (CANVAS-008): concentric arc rings at decreasing radii drawn from tile edge to centre; ring count is ⌊min(w,h)/16⌋ + 3, alternating primary and secondary palette colours. Wedge: pie-sector arcs dividing the tile into 6 equal sectors, alternating two palette variants. Stripe: 5 evenly-spaced filled bands — horizontal when tile width ≥ height, otherwise vertical. Solid: single fillRect in the tile colour. Texture: fillRect with colour, then a grayscale fBm noise OffscreenCanvas composited with multiply blend, producing a tinted noise surface. Micro: 10 fine bands, giving a high-frequency repeat. Enabled types are selected per tile by seeded RNG; when no types are selected, Solid is used as fallback.'
        },
        {
            heading: 'LIGHTING MODEL',
            body: 'Pseudo-3D lighting (PAT-008) is applied as the last step of each sprite. Two linear gradients are drawn over the tile: a shadow gradient (rgba(0,0,0,depthStrength×0.7)) runs from the lit side to transparent across the tile diagonal; a highlight gradient (rgba(255,255,255,highlightIntensity×0.7)) runs from the opposite side. Both gradients use the full diagonal length as extent, spanning corner to corner. globalLightAngle (0–360°) sets the light-source direction. At depthStrength=0 and highlightIntensity=0, tiles are flat. At maximum values, tiles read as strongly bevelled.'
        },
        {
            heading: 'NOISE OVERLAY',
            body: 'When overlayMode = Noise, a full-canvas fBm noise texture is composited with globalCompositeOperation multiply at textureStrength opacity. When overlayMode = Noise+Light, the same noise canvas is drawn first, then a secondary directional gradient (modulated by globalLightAngle) is multiplied over it at 0.4 alpha, producing a surface-relief effect. The fBm noise uses 4 octaves of bilinear-interpolated value noise with quintic smoothstep, at base scale 128 px. The noise OffscreenCanvas (800×800) is computed once per randomSeed change and cached; all subsequent frames blit it via drawImage. When useDrift is active, the noise canvas is drawn twice at a phase-offset x position to simulate seamless horizontal scrolling.'
        },
        {
            heading: 'ANIMATION',
            body: 'Static: no frame-driven changes; composition is fully determined by params. Breathing (ANIM-009): each tile scales by breathScale = 1 + 0.1·sin(2π·speed·frame/120), drawn via translate/scale/drawImage transform. Period ≈ 120/speed frames (≈2 s at speed=1, 60 fps). Morph Layouts (ANIM-008): two tile sets are generated from randomSeed and randomSeed+1; tile i position is lerp(posA[i], posB[i], t) where t = 0.5+0.5·sin(2π·speed·frame/240). The oscillation period is 240/speed frames (≈4 s at speed=1). Texture Drift (ANIM-010): driftOffset accumulates speed×0.3 px per frame; the noise overlay canvas is translated by driftOffset, producing horizontal scroll. All: all three modes run simultaneously. Animation type is infinite; GIF export is suppressed; sequencer is disabled.'
        },
        {
            heading: 'PARAMETERS',
            body: 'gridColumns (4–40, step 1, default 10): column count for Uniform Grid; approximate for packed modes. gridRows (4–40, step 1, default 10): row count. tileSize (10–80, step 2, default 40): base tile dimension for packed-rect packing; also controls variance (±40%). layoutMode (Uniform Grid | Packed Rects A | Packed Rects B, default Uniform Grid): packing algorithm selection. tileTypes (multi-select toggle, default Concentric/Wedge/Stripe/Solid): enabled tile types drawn by seeded RNG. randomSeed (0–999999, default 42): seeds layout RNG and all colour jitter RNGs. animationMode (Static | Morph Layouts | Breathing | Texture Drift | All, default Static): animation behaviour. animationSpeed (0.1–5, step 0.1, default 1): scales all animation rates. paletteSelection (Warm | Cool | Mixed | Earth | Pastel | High-Contrast, default Warm): HSL colour family. paletteVariance (0–1, step 0.05, default 0.3): per-tile colour jitter in H, S, L. depthStrength (0–1, default 0.5): shadow gradient opacity. highlightIntensity (0–1, default 0.4): highlight gradient opacity. globalLightAngle (0–360, default 45): light-source bearing in degrees. textureStrength (0–1, default 0.3): noise overlay blend opacity. overlayMode (None | Noise | Noise+Light, default None): noise overlay composite mode.'
        },
        {
            heading: 'PERFORMANCE',
            body: 'Sprite caching (CANVAS-008): each unique (type, ⌊w⌋, ⌊h⌋, colourIdx) renders once to OffscreenCanvas. At gridColumns=gridRows=40 with 6 types × 8 palette slots, up to 1920 unique sprite keys are possible but in practice far fewer exist given uniform-grid tile sizes. Cache invalidation occurs on paletteSelection, paletteVariance, depthStrength, highlightIntensity, or globalLightAngle changes. Layout rebuild occurs on gridColumns, gridRows, tileSize, layoutMode, randomSeed, or tileTypes changes. Noise OffscreenCanvas (O(W×H) at build time, ~640K ops at 800×800) is rebuilt only when randomSeed changes; all subsequent frames use drawImage blit. Main-thread blit cost is O(N_tiles) drawImage calls per frame — GPU-accelerated; at 1600 tiles (40×40 grid), negligible. No Tier 2 (adaptive resolution) is used: resolution change invalidates sprite dimensions and causes double cache rebuild. Tier 1 RAF coalescing is always active via host and sufficient given the sprite-cache architecture.'
        }
    ],

    // ─── Internal state ───────────────────────────────────────────────────────
    _spriteCache:       null,
    _noiseCanvas:       null,
    _noiseSeed:         -1,
    _layoutA:           null,
    _layoutB:           null,
    _lastLayoutKey:     '',
    _lastStyleKey:      '',
    _lastTileTexKey:    '',
    _driftOffset:       0,

    // ─── Seeded LCG RNG ───────────────────────────────────────────────────────
    _lcg(seed) {
        let s = ((seed | 0) + 1) >>> 0;
        return () => {
            s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
            return s / 4294967296;
        };
    },

    // ─── Value-noise hash ─────────────────────────────────────────────────────
    _hash(ix, iy, seed) {
        let h = ((Math.imul(ix, 374761393) ^ Math.imul(iy, 1103515245)) + Math.imul(seed | 0, 2891336453 | 0)) >>> 0;
        h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
        return ((h ^ (h >>> 16)) & 0xffff) / 65535;
    },

    _valueNoise(x, y, scale, seed) {
        const sx = x / scale, sy = y / scale;
        const ix = Math.floor(sx), iy = Math.floor(sy);
        const fx = sx - ix, fy = sy - iy;
        const ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10);
        const uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
        const a = this._hash(ix,     iy,     seed);
        const b = this._hash(ix + 1, iy,     seed);
        const c = this._hash(ix,     iy + 1, seed);
        const d = this._hash(ix + 1, iy + 1, seed);
        return a + (b - a) * ux + (c - a) * uy + (d - c - b + a) * ux * uy;
    },

    _fBm(x, y, seed) {
        let v = 0, amp = 0.5, scale = 128;
        for (let o = 0; o < 4; o++) {
            v += amp * this._valueNoise(x, y, scale, seed + o * 7919);
            amp *= 0.5;
            scale *= 0.5;
        }
        return v;
    },

    // ─── Colour from palette ──────────────────────────────────────────────────
    // TIL-05: when paletteMode === 'custom', use colourway entries instead of preset HSL palettes.
    _tileColor(colorIdx, params) {
        if (params.paletteMode === 'custom') {
            const cw = params.colourway || [];
            if (cw.length > 0) {
                const entry = cw[colorIdx % cw.length];
                return entry ? entry.colour : '#888888';
            }
        }
        const pal  = PALETTES[params.paletteSelection] || PALETTES['Warm'];
        const base = pal[colorIdx % pal.length];
        const v    = params.paletteVariance ?? 0.3;
        const rng  = this._lcg(colorIdx * 997 + (params.randomSeed | 0));
        const h = ((base[0] + (rng() - 0.5) * 60 * v) + 720) % 360;
        const s = Math.max(5,  Math.min(100, base[1] + (rng() - 0.5) * 40 * v));
        const l = Math.max(10, Math.min(90,  base[2] + (rng() - 0.5) * 30 * v));
        return `hsl(${h.toFixed(1)},${s.toFixed(1)}%,${l.toFixed(1)}%)`;
    },

    // TIL-04: apply per-tile texture overlay (grain, crosshatch, dots)
    _applyTileTextureOverlay(ctx, w, h, params) {
        const mode    = params.tileTextureOverlay || 'none';
        const opacity = params.tileTextureOpacity ?? 0.25;
        if (mode === 'none' || opacity < 0.01) return;
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.strokeStyle = 'rgba(0,0,0,0.8)';
        ctx.fillStyle   = 'rgba(0,0,0,0.8)';
        if (mode === 'grain') {
            // Fine noise scatter
            const seed = (params.randomSeed | 0) * 7 + w + h;
            const rng  = this._lcg(seed);
            const count = Math.round(w * h * 0.05);
            for (let i = 0; i < count; i++) {
                ctx.fillRect(Math.floor(rng() * w), Math.floor(rng() * h), 1, 1);
            }
        } else if (mode === 'crosshatch') {
            const spacing = Math.max(4, Math.min(w, h) / 6);
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            for (let x = 0; x < w; x += spacing) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
            for (let y = 0; y < h; y += spacing) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
            ctx.stroke();
        } else if (mode === 'dots') {
            const spacing = Math.max(5, Math.min(w, h) / 5);
            const r = spacing * 0.15;
            for (let y = spacing / 2; y < h; y += spacing) {
                for (let x = spacing / 2; x < w; x += spacing) {
                    ctx.beginPath();
                    ctx.arc(x, y, r, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        ctx.restore();
    },

    // ─── Guillotine partition packer — guarantees 0 gap, 0 overlap ───────────
    // Recursively bisects the canvas until tiles reach minSize. Each leaf is a
    // tile. Split depth is mapped from gridColumns × gridRows tile-count target.
    _guillotinePack(x, y, w, h, depth, maxDepth, preferLong, rng, tiles, types) {
        const atLeaf = depth >= maxDepth || (w < 20 && h < 20);
        if (atLeaf) {
            // TIL-03: assign z-layer based on tile area (smaller tiles appear raised)
            tiles.push({
                x, y, w, h,
                type:     types[Math.floor(rng() * types.length)],
                colorIdx: Math.floor(rng() * 8),
                zLayer:   Math.floor(rng() * 4)
            });
            return;
        }
        const splitHoriz = preferLong ? w >= h : rng() >= 0.5;
        if (splitHoriz && w >= 20) {
            const minCut = Math.max(1, Math.round(w * 0.2));
            const maxCut = Math.round(w * 0.8);
            const cut = minCut + Math.floor(rng() * (maxCut - minCut + 1));
            this._guillotinePack(x, y, cut, h, depth + 1, maxDepth, preferLong, rng, tiles, types);
            this._guillotinePack(x + cut, y, w - cut, h, depth + 1, maxDepth, preferLong, rng, tiles, types);
        } else if (h >= 20) {
            const minCut = Math.max(1, Math.round(h * 0.2));
            const maxCut = Math.round(h * 0.8);
            const cut = minCut + Math.floor(rng() * (maxCut - minCut + 1));
            this._guillotinePack(x, y, w, cut, depth + 1, maxDepth, preferLong, rng, tiles, types);
            this._guillotinePack(x, y + cut, w, h - cut, depth + 1, maxDepth, preferLong, rng, tiles, types);
        } else {
            tiles.push({
                x, y, w, h,
                type:     types[Math.floor(rng() * types.length)],
                colorIdx: Math.floor(rng() * 8),
                zLayer:   Math.floor(rng() * 4)
            });
        }
    },

    // ─── Layout — TIL-01/02 MaxRects (guillotine) ─────────────────────────────
    _buildLayout(W, H, params, seedOffset) {
        const rng = this._lcg(params.randomSeed + seedOffset * 1000003);
        const types = (Array.isArray(params.tileTypes) && params.tileTypes.length > 0)
            ? params.tileTypes : ['Solid'];
        const tiles = [];

        if (params.layoutMode === 'Uniform Grid') {
            const cols = params.gridColumns | 0;
            const rows = params.gridRows    | 0;
            const tw = W / cols;
            const th = H / rows;
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    tiles.push({
                        x: c * tw, y: r * th, w: tw, h: th,
                        type:     types[Math.floor(rng() * types.length)],
                        colorIdx: Math.floor(rng() * 8),
                        // TIL-03: z-layer for uniform grid — checkerboard pattern
                        zLayer: (r + c) % 4
                    });
                }
            }
        } else {
            const targetCount = (params.gridColumns | 0) * (params.gridRows | 0);
            const maxDepth = Math.max(1, Math.ceil(Math.log2(Math.max(1, targetCount))));
            const preferLong = params.layoutMode === 'Packed Rects B';
            this._guillotinePack(0, 0, W, H, 0, maxDepth, preferLong, rng, tiles, types);
        }
        return tiles;
    },

    // ─── Sprite rendering — CANVAS-008 offscreenSprite ───────────────────────
    _spriteKey(type, w, h, colorIdx) {
        return `${type}|${Math.round(w)}|${Math.round(h)}|${colorIdx}`;
    },

    _buildSprite(type, w, h, colorIdx, params) {
        const iW = Math.max(2, Math.round(w));
        const iH = Math.max(2, Math.round(h));
        const oc  = new OffscreenCanvas(iW, iH);
        const ctx = oc.getContext('2d');
        const col  = this._tileColor(colorIdx,         params);
        const col2 = this._tileColor((colorIdx + 3) % 8, params);

        switch (type) {
            case 'Concentric': {
                ctx.fillStyle = col2;
                ctx.fillRect(0, 0, iW, iH);
                const cx = iW / 2, cy = iH / 2;
                const maxR = Math.min(iW, iH) / 2;
                const rings = Math.max(3, Math.floor(maxR / 8));
                for (let i = 0; i <= rings; i++) {
                    const r = Math.max(0.5, maxR * (1 - i / rings));
                    ctx.beginPath();
                    ctx.arc(cx, cy, r, 0, Math.PI * 2);
                    ctx.fillStyle = (i % 2 === 0) ? col : col2;
                    ctx.fill();
                }
                break;
            }
            case 'Wedge': {
                ctx.fillStyle = col2;
                ctx.fillRect(0, 0, iW, iH);
                const cx = iW / 2, cy = iH / 2;
                const r  = Math.min(iW, iH) * 0.7;
                const n  = 6;
                for (let i = 0; i < n; i++) {
                    const a0 = (i / n) * Math.PI * 2;
                    const a1 = ((i + 1) / n) * Math.PI * 2;
                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.arc(cx, cy, r, a0, a1);
                    ctx.closePath();
                    ctx.fillStyle = (i % 2 === 0) ? col : col2;
                    ctx.fill();
                }
                break;
            }
            case 'Stripe': {
                ctx.fillStyle = col2;
                ctx.fillRect(0, 0, iW, iH);
                ctx.fillStyle = col;
                const bands = 5;
                const horiz = iW >= iH;
                for (let i = 0; i < bands; i += 2) {
                    if (horiz) {
                        ctx.fillRect(i * iW / bands, 0, iW / bands, iH);
                    } else {
                        ctx.fillRect(0, i * iH / bands, iW, iH / bands);
                    }
                }
                break;
            }
            case 'Texture': {
                ctx.fillStyle = col;
                ctx.fillRect(0, 0, iW, iH);
                const imgData = ctx.createImageData(iW, iH);
                const d    = imgData.data;
                const seed = (params.randomSeed | 0) + colorIdx * 31;
                for (let py = 0; py < iH; py++) {
                    for (let px = 0; px < iW; px++) {
                        const v   = Math.round(this._fBm(px, py, seed) * 255);
                        const idx = (py * iW + px) * 4;
                        d[idx] = d[idx + 1] = d[idx + 2] = v;
                        d[idx + 3] = 255;
                    }
                }
                const noiseOc = new OffscreenCanvas(iW, iH);
                noiseOc.getContext('2d').putImageData(imgData, 0, 0);
                ctx.globalCompositeOperation = 'multiply';
                ctx.drawImage(noiseOc, 0, 0);
                ctx.globalCompositeOperation = 'source-over';
                break;
            }
            case 'Micro': {
                ctx.fillStyle = col2;
                ctx.fillRect(0, 0, iW, iH);
                ctx.fillStyle = col;
                const bands = 10;
                for (let i = 0; i < bands; i += 2) {
                    ctx.fillRect(i * iW / bands, 0, iW / bands, iH);
                }
                break;
            }
            // TIL-06: Truchet — two-arc quarter-circle variant per seeded RNG
            case 'Truchet': {
                ctx.fillStyle = col2;
                ctx.fillRect(0, 0, iW, iH);
                const seed = (params.randomSeed | 0) + colorIdx * 13;
                const flip = (((seed * 2654435761) >>> 0) % 2) === 0;
                const rr = Math.min(iW, iH) / 2;
                ctx.strokeStyle = col;
                ctx.lineWidth = Math.max(2, rr * 0.35);
                ctx.lineCap = 'butt';
                ctx.beginPath();
                if (flip) {
                    ctx.arc(0, 0, rr, 0, Math.PI / 2);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.arc(iW, iH, rr, Math.PI, Math.PI * 1.5);
                    ctx.stroke();
                } else {
                    ctx.arc(iW, 0, rr, Math.PI / 2, Math.PI);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.arc(0, iH, rr, Math.PI * 1.5, Math.PI * 2);
                    ctx.stroke();
                }
                break;
            }
            // TIL-06: Hex — hexagonal subdivision (semi-regular aesthetic)
            case 'Hex': {
                ctx.fillStyle = col2;
                ctx.fillRect(0, 0, iW, iH);
                const cx = iW / 2, cy = iH / 2;
                const hr = Math.min(iW, iH) * 0.45;
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
                    const x = cx + hr * Math.cos(a), y = cy + hr * Math.sin(a);
                    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fillStyle = col;
                ctx.fill();
                ctx.strokeStyle = col2;
                ctx.lineWidth = Math.max(1, hr * 0.08);
                ctx.stroke();
                // Inner triangle sub-division
                ctx.strokeStyle = col2;
                ctx.lineWidth = 1;
                for (let i = 0; i < 6; i++) {
                    const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
                    const x = cx + hr * Math.cos(a), y = cy + hr * Math.sin(a);
                    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
                }
                break;
            }
            // TIL-06: Triangle — isohedral triangle grid within the tile
            case 'Triangle': {
                ctx.fillStyle = col2;
                ctx.fillRect(0, 0, iW, iH);
                const rows = 3, cols = 3;
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        const x0 = c * iW / cols, x1 = (c + 1) * iW / cols;
                        const y0 = r * iH / rows, y1 = (r + 1) * iH / rows;
                        const parity = (r + c) % 2 === 0;
                        ctx.beginPath();
                        if (parity) {
                            ctx.moveTo(x0, y1); ctx.lineTo(x1, y1); ctx.lineTo((x0 + x1) / 2, y0);
                        } else {
                            ctx.moveTo(x0, y0); ctx.lineTo(x1, y0); ctx.lineTo((x0 + x1) / 2, y1);
                        }
                        ctx.closePath();
                        ctx.fillStyle = (r + c) % 2 === 0 ? col : col2;
                        ctx.fill();
                    }
                }
                break;
            }
            case 'Solid':
            default: {
                ctx.fillStyle = col;
                ctx.fillRect(0, 0, iW, iH);
                break;
            }
        }

        this._applyLighting(ctx, iW, iH, params);
        // TIL-04: per-tile texture overlay (grain/crosshatch/dots)
        this._applyTileTextureOverlay(ctx, iW, iH, params);
        return oc;
    },

    // ─── Pseudo-3D lighting — PAT-008 ────────────────────────────────────────
    _applyLighting(ctx, w, h, params) {
        if (params.depthStrength < 0.01 && params.highlightIntensity < 0.01) return;
        const ang  = (params.globalLightAngle * Math.PI) / 180;
        const dx   = Math.cos(ang), dy = Math.sin(ang);
        const cx   = w / 2, cy = h / 2;
        const diag = Math.sqrt(w * w + h * h);

        if (params.depthStrength > 0.01) {
            const gS = ctx.createLinearGradient(
                cx - dx * diag, cy - dy * diag,
                cx + dx * diag, cy + dy * diag
            );
            gS.addColorStop(0, `rgba(0,0,0,${(params.depthStrength * 0.7).toFixed(3)})`);
            gS.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gS;
            ctx.fillRect(0, 0, w, h);
        }

        if (params.highlightIntensity > 0.01) {
            const gH = ctx.createLinearGradient(
                cx + dx * diag, cy + dy * diag,
                cx - dx * diag, cy - dy * diag
            );
            gH.addColorStop(0, `rgba(255,255,255,${(params.highlightIntensity * 0.7).toFixed(3)})`);
            gH.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = gH;
            ctx.fillRect(0, 0, w, h);
        }
    },

    // ─── Noise canvas — PAT-009 ───────────────────────────────────────────────
    _buildNoiseCanvas(W, H, seed) {
        const oc  = new OffscreenCanvas(W, H);
        const ctx = oc.getContext('2d');
        const img = ctx.createImageData(W, H);
        const d   = img.data;
        for (let py = 0; py < H; py++) {
            for (let px = 0; px < W; px++) {
                const v   = Math.round(this._fBm(px, py, seed) * 255);
                const idx = (py * W + px) * 4;
                d[idx] = d[idx + 1] = d[idx + 2] = v;
                d[idx + 3] = 255;
            }
        }
        ctx.putImageData(img, 0, 0);
        return oc;
    },

    // ─── Cache key helpers ─────────────────────────────────────────────────────
    _layoutKey(params) {
        const t = Array.isArray(params.tileTypes) ? params.tileTypes.slice().sort().join(',') : '';
        return `${params.gridColumns}|${params.gridRows}|${params.tileSize}|${params.layoutMode}|${params.randomSeed}|${t}`;
    },

    _styleKey(params) {
        const cwHash = (params.colourway || []).map(c => c.colour).join(',');
        return `${params.paletteMode}|${params.paletteSelection}|${params.paletteVariance}|${params.depthStrength}|${params.highlightIntensity}|${params.globalLightAngle}|${cwHash}`;
    },

    _tileTexKey(params) {
        return `${params.tileTextureOverlay}|${params.tileTextureOpacity}|${params.randomSeed}`;
    },

    // ─── Draw — CANVAS-009 spriteBlit ────────────────────────────────────────
    draw(ctx, canvas, params, frame) {
        const W = canvas.width;
        const H = canvas.height;
        const f = frame ?? 0;

        const lk = this._layoutKey(params);
        if (lk !== this._lastLayoutKey) {
            this._lastLayoutKey = lk;
            this._spriteCache   = new Map();
            this._layoutA = this._buildLayout(W, H, params, 0);
            this._layoutB = this._buildLayout(W, H, params, 1);
        }

        const sk = this._styleKey(params);
        if (sk !== this._lastStyleKey) {
            this._lastStyleKey = sk;
            this._spriteCache  = new Map();
        }

        const ttk = this._tileTexKey(params);
        if (ttk !== this._lastTileTexKey) {
            this._lastTileTexKey = ttk;
            this._spriteCache    = new Map();
        }

        if (!this._spriteCache) this._spriteCache = new Map();

        const mode  = params.animationMode  || 'Static';
        const speed = params.animationSpeed || 1;

        const useMorph  = mode === 'Morph Layouts' || mode === 'All';
        const useBreath = mode === 'Breathing'     || mode === 'All';
        const useDrift  = mode === 'Texture Drift' || mode === 'All';

        if (useDrift) this._driftOffset += speed * 0.3;

        const morphT      = useMorph  ? (0.5 + 0.5 * Math.sin(2 * Math.PI * speed * f / 240)) : 0;
        const breathScale = useBreath ? (1    + 0.1 * Math.sin(2 * Math.PI * speed * f / 120)) : 1;

        if (params.overlayMode !== 'None' &&
            (this._noiseCanvas === null || this._noiseSeed !== params.randomSeed)) {
            this._noiseSeed   = params.randomSeed;
            this._noiseCanvas = this._buildNoiseCanvas(W, H, (params.randomSeed | 0) + 99991);
        }

        ctx.fillStyle = '#111111';
        ctx.fillRect(0, 0, W, H);

        const tilesA = this._layoutA || [];
        const tilesB = this._layoutB || tilesA;

        // TIL-03: build draw list; sort by zLayer ascending (lower z drawn first → higher z on top)
        const drawList = tilesA.map((tA, i) => ({ tA, tB: i < tilesB.length ? tilesB[i] : tA }));
        const useZStack = params.zStackEnabled;
        if (useZStack) {
            drawList.sort((a, b) => (a.tA.zLayer || 0) - (b.tA.zLayer || 0));
        }

        const shadowBlur   = params.zShadowBlur   ?? 6;
        const shadowSpread = params.zShadowSpread  ?? 0.4;
        const lightAngRad  = (params.globalLightAngle || 45) * Math.PI / 180;

        for (let i = 0; i < drawList.length; i++) {
            const { tA, tB } = drawList[i];

            const x = useMorph ? tA.x + (tB.x - tA.x) * morphT : tA.x;
            const y = useMorph ? tA.y + (tB.y - tA.y) * morphT : tA.y;
            const w = tA.w;
            const h = tA.h;

            const key = this._spriteKey(tA.type, w, h, tA.colorIdx);
            if (!this._spriteCache.has(key)) {
                this._spriteCache.set(key, this._buildSprite(tA.type, w, h, tA.colorIdx, params));
            }
            const sprite = this._spriteCache.get(key);

            // TIL-03: apply drop-shadow for z-stacked tiles
            if (useZStack && (tA.zLayer || 0) > 0) {
                const z = (tA.zLayer || 0);
                const elevation = z * shadowSpread;
                ctx.shadowBlur    = shadowBlur * z;
                ctx.shadowColor   = 'rgba(0,0,0,0.4)';
                ctx.shadowOffsetX = Math.cos(lightAngRad + Math.PI) * elevation * 4;
                ctx.shadowOffsetY = Math.sin(lightAngRad + Math.PI) * elevation * 4;
            } else {
                ctx.shadowBlur    = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
            }

            if (useBreath) {
                ctx.save();
                ctx.translate(x + w / 2, y + h / 2);
                ctx.scale(breathScale, breathScale);
                ctx.drawImage(sprite, -w / 2, -h / 2, w, h);
                ctx.restore();
            } else {
                ctx.drawImage(sprite, x, y, w, h);
            }
        }

        // Reset shadow after tile loop
        ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;

        if (params.overlayMode !== 'None' && this._noiseCanvas && params.textureStrength > 0) {
            ctx.save();
            ctx.globalCompositeOperation = 'multiply';
            ctx.globalAlpha = params.textureStrength;
            const dx = useDrift ? (this._driftOffset % W) : 0;
            if (useDrift) {
                ctx.drawImage(this._noiseCanvas, dx - W, 0);
            }
            ctx.drawImage(this._noiseCanvas, dx, 0);

            if (params.overlayMode === 'Noise+Light') {
                const ang = (params.globalLightAngle * Math.PI) / 180;
                const gx = Math.cos(ang), gy = Math.sin(ang);
                const gL = ctx.createLinearGradient(
                    W / 2 + gx * W, H / 2 + gy * H,
                    W / 2 - gx * W, H / 2 - gy * H
                );
                gL.addColorStop(0, 'rgba(255,255,255,0.5)');
                gL.addColorStop(1, 'rgba(0,0,0,0.5)');
                ctx.globalCompositeOperation = 'multiply';
                ctx.globalAlpha = 0.4;
                ctx.fillStyle = gL;
                ctx.fillRect(0, 0, W, H);
            }
            ctx.restore();
        }
    }
};
