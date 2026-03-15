/**
 * Squares Illusion Script - 4-minute optical illusion cycle
 * 15-phase choreographed animation with pattern transitions
 *
 * Original: 7 patterns, 5 transitions, 6 effects
 *
 * @script squares
 * @category other
 * @version 2.1.0
 */

// ═══════════════════════════════════════════════════════════════════
// EASING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function easeIn(t) { return t * t * t; }
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
function easeInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function hash(x, y) {
    let h = x * 374761393 + y * 668265263;
    h = (h ^ (h >>> 13)) * 1274126177;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/**
 * Generate clockwise-inward spiral path and O(1) reverse-lookup map.
 * Returns { path: [col,row][], indexMap: Map<col*100+row, index> }.
 */
function generateSpiral(grid) {
    const path = [];
    let left = 0, right = grid - 1, top = 0, bottom = grid - 1;

    while (left <= right && top <= bottom) {
        for (let col = left; col <= right; col++) path.push([col, top]);
        top++;
        for (let row = top; row <= bottom; row++) path.push([right, row]);
        right--;
        if (top <= bottom) {
            for (let col = right; col >= left; col--) path.push([col, bottom]);
            bottom--;
        }
        if (left <= right) {
            for (let row = bottom; row >= top; row--) path.push([left, row]);
            left++;
        }
    }

    // Precompute reverse-lookup: O(1) per query, replaces O(GRID²) linear scan.
    // Key = col*100+row; unique for col,row ∈ [0,99).
    const indexMap = new Map();
    for (let i = 0; i < path.length; i++) {
        indexMap.set(path[i][0] * 100 + path[i][1], i);
    }

    return { path, indexMap };
}

function envelope(localT, duration) {
    const fadeTime = Math.min(1, duration * 0.1);
    if (localT < fadeTime) return easeInOut(localT / fadeTime);
    if (localT > duration - fadeTime) return easeInOut((duration - localT) / fadeTime);
    return 1;
}

// ═══════════════════════════════════════════════════════════════════
// PATTERNS (7 types) — pure functions (col, row, nx, ny) → boolean
// ═══════════════════════════════════════════════════════════════════

const patterns = {
    allBlack:          (col, row, nx, ny) => false,
    allWhite:          (col, row, nx, ny) => true,
    checkerboard:      (col, row, nx, ny) => (Math.floor(col) + Math.floor(row)) % 2 === 0,
    horizontalStripes: (col, row, nx, ny) => Math.floor(row) % 2 === 0,
    verticalStripes:   (col, row, nx, ny) => Math.floor(col) % 2 === 0,
    cafeWall: (col, row, nx, ny) => {
        const offset = Math.floor(row) % 2 === 0 ? 0 : 0.5;
        return Math.floor(col + offset) % 2 === 0;
    },
    diagonalStripes: (col, row, nx, ny) => (Math.floor(col) + Math.floor(row)) % 4 < 2
};

// ═══════════════════════════════════════════════════════════════════
// FLIP STATE HELPER
// ═══════════════════════════════════════════════════════════════════

function getFlipState(flipStart, duration, fromPattern, toPattern, col, row, nx, ny, axis) {
    const flipEnd = flipStart + duration;
    let scaleX = 1, scaleY = 1, offsetX = 0, offsetY = 0;
    const fromColor = fromPattern(col, row, nx, ny);
    const toColor = toPattern(col, row, nx, ny);
    let isWhite = fromColor;

    if (fromColor === toColor) {
        return { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0, isWhite: toColor };
    }

    if (flipStart < 0 && flipEnd > 0) {
        const flipProgress = Math.min(1, -flipStart / duration);

        if (flipProgress < 0.5) {
            if (axis === 'x') scaleX = 1 - easeIn(flipProgress * 2);
            else scaleY = 1 - easeIn(flipProgress * 2);
        } else {
            if (axis === 'x') scaleX = easeOut((flipProgress - 0.5) * 2);
            else scaleY = easeOut((flipProgress - 0.5) * 2);
            isWhite = toColor;
        }
    } else if (flipStart <= -duration) {
        isWhite = toColor;
    }

    return { scaleX, scaleY, offsetX, offsetY, isWhite };
}

// ═══════════════════════════════════════════════════════════════════
// TRANSITIONS (5 types)
// All signatures include trailing (spiralPath, spiralIndexMap) for
// uniform call in getTileState; unused by all but spiralUnwind.
// ═══════════════════════════════════════════════════════════════════

const transitions = {
    radialWave: (col, row, nx, ny, progress, fromPattern, toPattern) => {
        const cx = 0.5, cy = 0.5;
        const dist = Math.sqrt((nx - cx) * (nx - cx) + (ny - cy) * (ny - cy));
        const duration = 0.25;
        const flipStart = dist / 0.707 - progress * (1 + duration);
        return getFlipState(flipStart, duration, fromPattern, toPattern, col, row, nx, ny, 'x');
    },

    linearSweep: (col, row, nx, ny, progress, fromPattern, toPattern) => {
        const duration = 0.2;
        const flipStart = nx - progress * (1 + duration);
        return getFlipState(flipStart, duration, fromPattern, toPattern, col, row, nx, ny, 'x');
    },

    verticalSweep: (col, row, nx, ny, progress, fromPattern, toPattern) => {
        const duration = 0.2;
        const flipStart = ny - progress * (1 + duration);
        return getFlipState(flipStart, duration, fromPattern, toPattern, col, row, nx, ny, 'y');
    },

    /**
     * Visits tiles in clockwise-inward spiral order.
     * Uses O(1) indexMap lookup — formerly O(GRID⁴) linear scan.
     */
    spiralUnwind: (col, row, nx, ny, progress, fromPattern, toPattern, spiralPath, spiralIndexMap) => {
        const key = Math.floor(col) * 100 + Math.floor(row);
        const tileIndex = spiralIndexMap.has(key) ? spiralIndexMap.get(key) : -1;

        if (tileIndex === -1) {
            return { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0, isWhite: toPattern(col, row, nx, ny) };
        }

        const totalTiles = spiralPath.length;
        const tileProgress = tileIndex / totalTiles;
        const duration = 1.5 / totalTiles;
        const flipStart = tileProgress - progress * (1 + duration);

        let flipAxis = 'x';
        if (tileIndex < totalTiles - 1) {
            const currCol = spiralPath[tileIndex][0], currRow = spiralPath[tileIndex][1];
            const nextCol = spiralPath[tileIndex + 1][0], nextRow = spiralPath[tileIndex + 1][1];
            flipAxis = Math.abs(nextRow - currRow) > 0 ? 'y' : 'x';
        }

        return getFlipState(flipStart, duration, fromPattern, toPattern, col, row, nx, ny, flipAxis);
    },

    randomFlicker: (col, row, nx, ny, progress, fromPattern, toPattern) => {
        const h = hash(col, row);
        const duration = 0.25;
        const flipStart = h - progress * (1 + duration);
        return getFlipState(flipStart, duration, fromPattern, toPattern, col, row, nx, ny, 'y');
    }
};

// ═══════════════════════════════════════════════════════════════════
// EFFECTS (6 types + none)
// ═══════════════════════════════════════════════════════════════════

const effects = {
    none: (col, row, nx, ny, localT, duration, state) => state,

    rotationWave: (col, row, nx, ny, localT, duration, state) => {
        const cx = 0.5, cy = 0.5;
        const dist = Math.sqrt((nx - cx) * (nx - cx) + (ny - cy) * (ny - cy));
        const cycles = 10;
        const phase = (localT / duration) * cycles * Math.PI * 2;
        const env = envelope(localT, duration);
        state.rotation = Math.sin(dist * 12 - phase) * 20 * env;
        return state;
    },

    compressionWave: (col, row, nx, ny, localT, duration, state) => {
        const cycles = 8;
        const phase = (localT / duration) * cycles * Math.PI * 2;
        const wave = Math.sin(nx * 12 - phase);
        const env = envelope(localT, duration);
        state.scaleY = 1 + wave * 0.6 * env;
        state.scaleX = 1 - wave * 0.3 * env;
        state.rotation = wave * 35 * env;
        return state;
    },

    cafeWallShift: (col, row, nx, ny, localT, duration, state) => {
        const cycles = 6;
        const phase = (localT / duration) * cycles * Math.PI * 2;
        const shift = Math.sin(phase) * 0.15;
        const rowOffset = Math.floor(row) % 2 === 0 ? shift : -shift;
        const env = envelope(localT, duration);
        state.offsetX = rowOffset * env;
        const edgeDist = Math.min(nx, 1 - nx);
        if (edgeDist < 0.1) {
            state.scaleX = 0.7 + edgeDist * 3;
        }
        return state;
    },

    radialPulse: (col, row, nx, ny, localT, duration, state) => {
        const cx = 0.5, cy = 0.5;
        const dist = Math.sqrt((nx - cx) * (nx - cx) + (ny - cy) * (ny - cy));
        const cycles = 5;
        const phase = (localT / duration) * cycles * Math.PI * 2;
        const pulse = (Math.sin(dist * 8 - phase) + 1) / 2;
        const env = envelope(localT, duration);
        state.scaleX = 1 + pulse * 0.3 * env;
        state.scaleY = 1 + pulse * 0.3 * env;
        if (dist > 0.6) {
            const squeeze = (dist - 0.6) / 0.4;
            state.offsetX = (nx - cx) * squeeze * 0.1 * env;
            state.offsetY = (ny - cy) * squeeze * 0.1 * env;
        }
        return state;
    },

    spiralRotation: (col, row, nx, ny, localT, duration, state) => {
        const cx = 0.5, cy = 0.5;
        const angle = Math.atan2(ny - cy, nx - cx);
        const dist = Math.sqrt((nx - cx) * (nx - cx) + (ny - cy) * (ny - cy));
        const cycles = 4;
        const phase = (localT / duration) * cycles * Math.PI * 2;
        const rotation = (angle * 3 + dist * 15 - phase) * (180 / Math.PI);
        const env = envelope(localT, duration);
        state.rotation = (rotation % 360) * env;
        return state;
    },

    shapeMorph: (col, row, nx, ny, localT, duration, state) => {
        const cx = 0.5, cy = 0.5;
        const dist = Math.sqrt((nx - cx) * (nx - cx) + (ny - cy) * (ny - cy));
        const cycles = 3;
        const morphPhase = (localT / duration) * cycles * Math.PI * 2;
        const morph = (Math.sin(dist * 12 - morphPhase) + 1) / 2;
        const env = envelope(localT, duration);
        state.roundness = morph * morph * (3 - 2 * morph) * env;
        const scalePhase = (localT / duration) * 4 * Math.PI * 2;
        const scalePulse = Math.sin(scalePhase) * 0.35;
        state.scaleX = 1 + scalePulse * env;
        state.scaleY = 1 + scalePulse * env;
        return state;
    }
};

// ═══════════════════════════════════════════════════════════════════
// TIMELINE (15 phases, 240 s)
// ═══════════════════════════════════════════════════════════════════

const timeline = [
    { t: 0,   type: 'pattern',    pattern: 'allBlack',         effect: 'none',            dur: 2   },
    { t: 2,   type: 'transition', transition: 'radialWave',    from: 'allBlack',          to: 'checkerboard',     dur: 6   },
    { t: 8,   type: 'pattern',    pattern: 'checkerboard',     effect: 'rotationWave',    dur: 20  },
    { t: 28,  type: 'transition', transition: 'linearSweep',   from: 'checkerboard',      to: 'horizontalStripes', dur: 5  },
    { t: 33,  type: 'pattern',    pattern: 'horizontalStripes', effect: 'compressionWave', dur: 30 },
    { t: 63,  type: 'transition', transition: 'verticalSweep', from: 'horizontalStripes', to: 'verticalStripes',  dur: 5   },
    { t: 68,  type: 'pattern',    pattern: 'verticalStripes',  effect: 'radialPulse',     dur: 20  },
    { t: 88,  type: 'transition', transition: 'randomFlicker', from: 'verticalStripes',   to: 'cafeWall',         dur: 5   },
    { t: 93,  type: 'pattern',    pattern: 'cafeWall',         effect: 'cafeWallShift',   dur: 35  },
    { t: 128, type: 'transition', transition: 'linearSweep',   from: 'cafeWall',          to: 'diagonalStripes',  dur: 5   },
    { t: 133, type: 'pattern',    pattern: 'diagonalStripes',  effect: 'compressionWave', dur: 25  },
    { t: 158, type: 'transition', transition: 'randomFlicker', from: 'diagonalStripes',   to: 'checkerboard',     dur: 5   },
    { t: 163, type: 'pattern',    pattern: 'checkerboard',     effect: 'spiralRotation',  dur: 35  },
    { t: 198, type: 'transition', transition: 'spiralUnwind',  from: 'checkerboard',      to: 'allBlack',         dur: 12  },
    { t: 210, type: 'pattern',    pattern: 'allBlack',         effect: 'shapeMorph',      dur: 30  }
];

function getCurrentState(t) {
    const cycleTime = t % 240;

    for (let i = 0; i < timeline.length; i++) {
        const curr = timeline[i];
        if (cycleTime >= curr.t && cycleTime < curr.t + curr.dur) {
            const localT = cycleTime - curr.t;
            const progress = localT / curr.dur;
            return {
                type:       curr.type,
                pattern:    curr.pattern,
                effect:     curr.effect,
                transition: curr.transition,
                from:       curr.from,
                to:         curr.to,
                progress,
                localT,
                duration:   curr.dur,
                name:       curr.type === 'transition'
                    ? curr.from + ' → ' + curr.to
                    : curr.pattern + ' + ' + curr.effect
            };
        }
    }

    return timeline[timeline.length - 1];
}

function getTileState(col, row, nx, ny, t, spiralPath, spiralIndexMap) {
    const state = getCurrentState(t);
    let result = { rotation: 0, scaleX: 1, scaleY: 1, roundness: 0, offsetX: 0, offsetY: 0, isWhite: false };

    if (state.type === 'transition') {
        const transitionFn = transitions[state.transition];
        const flipState = transitionFn(
            col, row, nx, ny, state.progress,
            patterns[state.from], patterns[state.to],
            spiralPath, spiralIndexMap
        );
        result.scaleX  = flipState.scaleX;
        result.scaleY  = flipState.scaleY;
        result.offsetX = flipState.offsetX;
        result.offsetY = flipState.offsetY;
        result.isWhite = flipState.isWhite;
    } else {
        result.isWhite = patterns[state.pattern](col, row, nx, ny);
        const effectFn = effects[state.effect];
        result = effectFn(col, row, nx, ny, state.localT, state.duration, result);
    }

    return result;
}

// ═══════════════════════════════════════════════════════════════════
// TILE DRAW
// ═══════════════════════════════════════════════════════════════════

function drawCard(ctx, x, y, size, scaleX, scaleY, rotation, roundness, offsetX, offsetY, isWhite) {
    ctx.save();
    ctx.translate(x + offsetX * size, y + offsetY * size);
    ctx.rotate(rotation * Math.PI / 180);

    const w = size * scaleX;
    const h = size * scaleY;

    ctx.fillStyle   = isWhite ? '#ffffff' : '#000000';
    ctx.strokeStyle = isWhite ? '#000000' : '#ffffff';
    ctx.lineWidth   = 0.5;

    if (roundness > 0.01) {
        const radius = Math.min(w, h) * 0.5 * roundness;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(-w / 2, -h / 2, w, h, radius);
        } else {
            // Manual arc-based fallback for Chrome < 99, Firefox < 112, Safari < 15.4.
            const x0 = -w / 2, y0 = -h / 2;
            ctx.moveTo(x0 + radius, y0);
            ctx.arcTo(x0 + w, y0,     x0 + w, y0 + h, radius);
            ctx.arcTo(x0 + w, y0 + h, x0,     y0 + h, radius);
            ctx.arcTo(x0,     y0 + h, x0,     y0,     radius);
            ctx.arcTo(x0,     y0,     x0 + w, y0,     radius);
            ctx.closePath();
        }
        ctx.fill();
        ctx.stroke();
    } else {
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.strokeRect(-w / 2, -h / 2, w, h);
    }

    ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════
// SCRIPT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

export const SCRIPT_CONFIG = {
    id:       'squares',
    title:    'Squares Illusion',
    category: 'other',
    description: '4-minute optical illusion cycle with 15 phases. Features 7 patterns (checkerboard, cafe wall, stripes), 5 transitions (radial wave, spiral unwind), and 6 effects (rotation wave, compression, morph).',
    version:  '2.1.0',

    // Per-instance cache — instance state stored here, not at module level.
    _GRID: 0,
    _spiralPath: [],
    _spiralIndexMap: new Map(),

    infoSections: [
        {
            heading: 'DESCRIPTION',
            body: 'Squares is a 240-second (4-minute) choreographed optical illusion. An N×N grid of square tiles cycles through 15 phases alternating static pattern phases and animated transition phases. Each tile is drawn with per-frame geometric transforms — position offset, non-uniform scale, rotation, and optional corner roundness — determined by the active pattern, transition, or effect function. The grid is letterboxed inside the canvas; cellSize = min(W,H)/GRID. All state derives from a single cycleTime = t % 240 where t = (frame/60)×speed + seek.'
        },
        {
            heading: 'ALGORITHM',
            body: 'easeIn(t)=t³. easeOut(t)=1−(1−t)³. easeInOut(t): cubic Hermite, C¹. hash(x,y): integer mix x×374761393+y×668265263 → two XOR-multiply rounds → ÷2³²; deterministic and spatially uniform. generateSpiral(grid): iterative inward-peeling rectangle traversal in clockwise order producing GRID² entries [col,row]; builds O(1) reverse-lookup indexMap (Map keyed col×100+row → spiral index). envelope(localT,duration): easeInOut fade-in and fade-out over min(1,duration×0.1) seconds; returns 1 in the interior. getCurrentState(t): cycleTime=t%240; linear scan of 15 timeline entries returns { type, pattern, transition, effect, from, to, progress, localT, duration, name }. Patterns — pure (col,row,nx,ny)→bool: allBlack always false; allWhite always true; checkerboard (⌊col⌋+⌊row⌋)%2===0; horizontalStripes ⌊row⌋%2===0; verticalStripes ⌊col⌋%2===0; cafeWall ⌊col+offset⌋%2===0 (offset=0.5 on odd rows); diagonalStripes (⌊col⌋+⌊row⌋)%4<2. getFlipState: per-tile two-stage scale flip; flipProgress=clamp(−flipStart/duration,0,1); phase 0–0.5 folds axis to 0 via easeIn, phase 0.5–1 unfolds via easeOut and switches colour to toPattern. Transitions — radialWave: flipStart=dist/0.707−progress×1.25, axis x; linearSweep: flipStart=nx−progress×1.2, axis x; verticalSweep: flipStart=ny−progress×1.2, axis y; spiralUnwind: O(1) indexMap lookup → flipStart=tileIndex/totalTiles−progress×(1+1.5/totalTiles), axis from direction of adjacent spiral step; randomFlicker: flipStart=hash(col,row)−progress×1.25, axis y. Effects (all modulated by envelope): rotationWave rotation=sin(dist×12−phase)×20×env; compressionWave scaleY=1+sin(nx×12−phase)×0.6×env, scaleX and rotation co-modulated; cafeWallShift offsetX=sin(phase)×0.15×rowParity×env with edge-pinch scaleX; radialPulse scale=1+pulse×0.3×env with outer-tile radial push; spiralRotation rotation=(angle×3+dist×15−phase)×(180/π)×env; shapeMorph roundness=smoothstep(morph)×env with sinusoidal scale pulse. drawCard: ctx.save → translate(x+offsetX×size, y+offsetY×size) → rotate(rotation×π/180) → fill+stroke rect or rounded-rect (ctx.roundRect with arcTo fallback) → ctx.restore.'
        },
        {
            heading: 'PARAMETERS',
            body: 'Grid — gridSize: slider 20–80, step 5, default 50; drives GRID and spiral path rebuild on change; higher values increase tile count (GRID²) and draw cost. Timeline — speed: slider 0.5–3, step 0.1, default 1, precision 1; scales wall-clock advance rate; effective loop length = 14400/speed frames. seek: slider 0–240, step 1, default 0; adds a fixed time offset in seconds to the animation position (t = (frame/60)×speed + seek); use to start the cycle at a specific phase.'
        },
        {
            heading: 'PRESETS',
            body: 'Default — gridSize 50, speed 1. Standard 50×50 grid at natural tempo; covers the full illusion suite in 4 minutes. Fine Grid — gridSize 80, speed 1. 6400 tiles; finer visual texture; higher per-frame draw cost; spiralUnwind phase is the most expensive segment. Coarse Grid — gridSize 25, speed 1. 625 tiles; bold geometry; very low cost; transition mechanics are clearly legible. Fast — gridSize 50, speed 2. 2× accelerated timeline; full cycle in 2 minutes; GIF/WebM loop accurate at 7200 frames (not the declared 14400). Slow — gridSize 50, speed 0.5. Half-speed; 8-minute cycle; meditative pacing; GIF/WebM loop accurate at 28800 frames.'
        },
        {
            heading: 'PERFORMANCE',
            body: 'Complexity: O(GRID²) per frame for pattern and effect phases — 2500 tiles at default, 6400 at maximum. spiralUnwind (198–210 s): formerly O(GRID⁴) linear scan; now O(GRID²) via O(1) precomputed indexMap lookup. spiralPath rebuild: O(GRID²) triggered on gridSize change only; indexMap built simultaneously. No ImageData allocation; pure 2D vector drawing. Memory: spiralPath ≈ GRID²×2 integers + indexMap entries; ~103 KB at gridSize 80. Canvas draw cost scales with rotation and roundRect calls during effect phases. Worker offload not applicable (ctx 2D is not transferable). Tier 2 adaptive resolution active during parameter interaction (interactionScale 0.5, idleDelay 300 ms) — reduces fill cost during slider drag.'
        },
        {
            heading: 'ANIMATION',
            body: 'Type: loop. Deterministic — same frame, speed, and seek always produce identical output. t = (frame/60)×speed + seek; cycleTime = t % 240. Full cycle at speed=1: 240 s = 14400 frames at 60 FPS. At speed≠1 the effective loop length is 14400/speed frames; the declared loopFrames (14400) is exact only when speed=1. GIF and WebM export capture the correct loop only at speed=1. canPrerender: true; frame parameter is the sole temporal variable. animatableParams: none — timeline drives all visual changes and no parameter smoothly interpolates between presets.'
        },
        {
            heading: 'KNOWN LIMITATIONS',
            body: 'seek adds a fixed offset to t before the mod-240; it does not clamp or scrub — during playback the animation continues advancing from the seek-offset start position, it does not hold at seek. GIF and WebM loop duration declared as 14400 frames; accurate only when speed=1; exports at other speeds will loop at the wrong cycle boundary. ctx.roundRect requires Chrome 99+, Firefox 112+, Safari 15.4+; older browsers use the manual arcTo fallback path, which is visually equivalent. Keyboard controls (Space/R/H) and info-hide overlay toggle are absent; play/pause is provided by host transport only.'
        },
        {
            heading: 'REFERENCES',
            body: 'Café wall illusion: Gregory & Heard (1979). Tile-flip choreography: no named published algorithm.'
        }
    ],

    // Tier 2 adaptive resolution during parameter interaction.
    // Vector drawing: interactionScale reduces canvas fill cost during slider drag.
    // Tier 3 (worker) not applicable — ctx 2D API cannot be transferred to a Worker.
    compute: {
        cost:             'geometric',
        interactionScale: 0.5,
        idleDelay:        300
    },

    canvas: {
        width:      800,
        height:     800,
        context:    '2d',
        background: '#000000'
    },

    animation: {
        type:          'loop',
        loopDuration:  240,
        // 14400 frames at speed=1; effective loop = 14400/speed frames at other speeds.
        loopFrames:    240 * 60,
        defaultFps:    60,
        defaultSpeed:  1,
        canPrerender:  true,
        animatableParams: ['speed'],
        sequencer: true,
    },

    export: {
        png:      true,
        gif:      true,
        webm:     true,
        sequence: true
    },

    presets: [
        { name: 'Default',     values: { gridSize: 50, speed: 1,   seek: 0 } },
        { name: 'Fine Grid',   values: { gridSize: 80, speed: 1,   seek: 0 } },
        { name: 'Coarse Grid', values: { gridSize: 25, speed: 1,   seek: 0 } },
        { name: 'Fast',        values: { gridSize: 50, speed: 2,   seek: 0 } },
        { name: 'Slow',        values: { gridSize: 50, speed: 0.5, seek: 0 } }
    ],

    parameters: [
        {
            group: 'Grid',
            params: [
                {
                    key:     'gridSize',
                    type:    'slider',
                    label:   'Grid Size',
                    min:     20,
                    max:     80,
                    step:    5,
                    default: 50
                }
            ]
        },
        {
            group: 'Timeline',
            params: [
                {
                    key:       'speed',
                    type:      'slider',
                    label:     'Speed',
                    min:       0.5,
                    max:       3,
                    step:      0.1,
                    default:   1,
                    precision: 1
                },
                {
                    key:     'seek',
                    type:    'slider',
                    label:   'Seek (seconds)',
                    min:     0,
                    max:     240,
                    step:    1,
                    default: 0
                }
            ]
        }
    ],

    draw(ctx, canvas, params, frame) {
        const grid  = params.gridSize || 50;
        const speed = params.speed    || 1;
        const seek  = params.seek     || 0;

        // Rebuild spiral and indexMap when gridSize changes or on first draw.
        if (grid !== this._GRID || this._spiralPath.length === 0) {
            this._GRID = grid;
            const built = generateSpiral(this._GRID);
            this._spiralPath    = built.path;
            this._spiralIndexMap = built.indexMap;
        }

        const t = (frame / 60) * speed + seek;

        const W        = canvas.width;
        const H        = canvas.height;
        const cellSize = Math.min(W, H) / this._GRID;
        const offsetX  = (W - this._GRID * cellSize) / 2;
        const offsetY  = (H - this._GRID * cellSize) / 2;

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, W, H);

        for (let row = 0; row < this._GRID; row++) {
            for (let col = 0; col < this._GRID; col++) {
                const nx   = col / this._GRID;
                const ny   = row / this._GRID;
                const tile = getTileState(col, row, nx, ny, t, this._spiralPath, this._spiralIndexMap);

                const x = offsetX + col * cellSize + cellSize / 2;
                const y = offsetY + row * cellSize + cellSize / 2;

                drawCard(ctx, x, y, cellSize,
                    tile.scaleX, tile.scaleY, tile.rotation,
                    tile.roundness, tile.offsetX, tile.offsetY, tile.isWhite);
            }
        }
    }
};
