/**
 * Squares Illusion Script - 4-minute optical illusion cycle
 * 15-phase choreographed animation with pattern transitions
 * 
 * Original: 7 patterns, 5 transitions, 6 effects
 * 
 * @script squares
 * @category other
 * @version 2.0.0
 */

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS & STATE
// ═══════════════════════════════════════════════════════════════════

let time = 0;
let GRID = 50;
let spiralPath = [];

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
    return path;
}

function envelope(localT, duration) {
    const fadeTime = Math.min(1, duration * 0.1);
    if (localT < fadeTime) return easeInOut(localT / fadeTime);
    if (localT > duration - fadeTime) return easeInOut((duration - localT) / fadeTime);
    return 1;
}

// ═══════════════════════════════════════════════════════════════════
// PATTERNS (7 types)
// ═══════════════════════════════════════════════════════════════════

const patterns = {
    allBlack: (col, row, nx, ny) => false,
    allWhite: (col, row, nx, ny) => true,
    checkerboard: (col, row, nx, ny) => (Math.floor(col) + Math.floor(row)) % 2 === 0,
    horizontalStripes: (col, row, nx, ny) => Math.floor(row) % 2 === 0,
    verticalStripes: (col, row, nx, ny) => Math.floor(col) % 2 === 0,
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
// ═══════════════════════════════════════════════════════════════════

const transitions = {
    radialWave: (col, row, nx, ny, progress, fromPattern, toPattern) => {
        const cx = 0.5, cy = 0.5;
        const dist = Math.sqrt((nx-cx)*(nx-cx) + (ny-cy)*(ny-cy));
        const maxDist = 0.707;
        const duration = 0.25;
        const normalizedDist = dist / maxDist;
        const flipStart = normalizedDist - progress * (1 + duration);
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
    
    spiralUnwind: (col, row, nx, ny, progress, fromPattern, toPattern) => {
        let tileIndex = -1;
        for (let i = 0; i < spiralPath.length; i++) {
            if (spiralPath[i][0] === Math.floor(col) && spiralPath[i][1] === Math.floor(row)) {
                tileIndex = i;
                break;
            }
        }
        
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
// EFFECTS (6 types)
// ═══════════════════════════════════════════════════════════════════

const effects = {
    none: (col, row, nx, ny, localT, duration, state) => state,
    
    rotationWave: (col, row, nx, ny, localT, duration, state) => {
        const cx = 0.5, cy = 0.5;
        const dist = Math.sqrt((nx-cx)*(nx-cx) + (ny-cy)*(ny-cy));
        const cycles = 10;
        const phase = (localT / duration) * cycles * Math.PI * 2;
        const spatialFreq = 12;
        const env = envelope(localT, duration);
        state.rotation = Math.sin(dist * spatialFreq - phase) * 20 * env;
        return state;
    },
    
    compressionWave: (col, row, nx, ny, localT, duration, state) => {
        const cycles = 8;
        const phase = (localT / duration) * cycles * Math.PI * 2;
        const spatialFreq = 12;
        const wave = Math.sin(nx * spatialFreq - phase);
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
        const dist = Math.sqrt((nx-cx)*(nx-cx) + (ny-cy)*(ny-cy));
        const cycles = 5;
        const phase = (localT / duration) * cycles * Math.PI * 2;
        const spatialFreq = 8;
        const pulse = (Math.sin(dist * spatialFreq - phase) + 1) / 2;
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
        const dist = Math.sqrt((nx-cx)*(nx-cx) + (ny-cy)*(ny-cy));
        const cycles = 4;
        const phase = (localT / duration) * cycles * Math.PI * 2;
        const rotation = (angle * 3 + dist * 15 - phase) * (180 / Math.PI);
        const env = envelope(localT, duration);
        state.rotation = (rotation % 360) * env;
        return state;
    },
    
    shapeMorph: (col, row, nx, ny, localT, duration, state) => {
        const cx = 0.5, cy = 0.5;
        const dist = Math.sqrt((nx-cx)*(nx-cx) + (ny-cy)*(ny-cy));
        const cycles = 3;
        const morphPhase = (localT / duration) * cycles * Math.PI * 2;
        const spatialFreq = 12;
        const morph = (Math.sin(dist * spatialFreq - morphPhase) + 1) / 2;
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
// TIMELINE (15 phases, 4-minute cycle)
// ═══════════════════════════════════════════════════════════════════

const timeline = [
    { t: 0, type: 'pattern', pattern: 'allBlack', effect: 'none', dur: 2 },
    { t: 2, type: 'transition', transition: 'radialWave', from: 'allBlack', to: 'checkerboard', dur: 6 },
    { t: 8, type: 'pattern', pattern: 'checkerboard', effect: 'rotationWave', dur: 20 },
    
    { t: 28, type: 'transition', transition: 'linearSweep', from: 'checkerboard', to: 'horizontalStripes', dur: 5 },
    { t: 33, type: 'pattern', pattern: 'horizontalStripes', effect: 'compressionWave', dur: 30 },
    
    { t: 63, type: 'transition', transition: 'verticalSweep', from: 'horizontalStripes', to: 'verticalStripes', dur: 5 },
    { t: 68, type: 'pattern', pattern: 'verticalStripes', effect: 'radialPulse', dur: 20 },
    
    { t: 88, type: 'transition', transition: 'randomFlicker', from: 'verticalStripes', to: 'cafeWall', dur: 5 },
    { t: 93, type: 'pattern', pattern: 'cafeWall', effect: 'cafeWallShift', dur: 35 },
    
    { t: 128, type: 'transition', transition: 'linearSweep', from: 'cafeWall', to: 'diagonalStripes', dur: 5 },
    { t: 133, type: 'pattern', pattern: 'diagonalStripes', effect: 'compressionWave', dur: 25 },
    
    { t: 158, type: 'transition', transition: 'randomFlicker', from: 'diagonalStripes', to: 'checkerboard', dur: 5 },
    { t: 163, type: 'pattern', pattern: 'checkerboard', effect: 'spiralRotation', dur: 35 },
    
    { t: 198, type: 'transition', transition: 'spiralUnwind', from: 'checkerboard', to: 'allBlack', dur: 12 },
    { t: 210, type: 'pattern', pattern: 'allBlack', effect: 'shapeMorph', dur: 30 }
];

function getCurrentState(t) {
    const cycleTime = t % 240;
    
    for (let i = 0; i < timeline.length; i++) {
        const curr = timeline[i];
        if (cycleTime >= curr.t && cycleTime < curr.t + curr.dur) {
            const localT = cycleTime - curr.t;
            const progress = localT / curr.dur;
            
            return {
                type: curr.type,
                pattern: curr.pattern,
                effect: curr.effect,
                transition: curr.transition,
                from: curr.from,
                to: curr.to,
                progress,
                localT,
                duration: curr.dur,
                name: curr.type === 'transition' ? 
                    curr.from + ' → ' + curr.to :
                    curr.pattern + ' + ' + curr.effect
            };
        }
    }
    
    return timeline[timeline.length - 1];
}

function getTileState(col, row, nx, ny, t) {
    const state = getCurrentState(t);
    let result = { rotation: 0, scaleX: 1, scaleY: 1, roundness: 0, offsetX: 0, offsetY: 0, isWhite: false };
    
    if (state.type === 'transition') {
        const transitionFn = transitions[state.transition];
        const flipState = transitionFn(
            col, row, nx, ny, state.progress,
            patterns[state.from], patterns[state.to]
        );
        result.scaleX = flipState.scaleX;
        result.scaleY = flipState.scaleY;
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

function drawCard(ctx, x, y, size, scaleX, scaleY, rotation, roundness, offsetX, offsetY, isWhite) {
    ctx.save();
    ctx.translate(x + offsetX * size, y + offsetY * size);
    ctx.rotate(rotation * Math.PI / 180);
    
    const w = size * scaleX;
    const h = size * scaleY;
    
    ctx.fillStyle = isWhite ? '#ffffff' : '#000000';
    ctx.strokeStyle = isWhite ? '#000000' : '#ffffff';
    ctx.lineWidth = 0.5;
    
    if (roundness > 0.01) {
        const radius = Math.min(w, h) * 0.5 * roundness;
        ctx.beginPath();
        ctx.roundRect(-w/2, -h/2, w, h, radius);
        ctx.fill();
        ctx.stroke();
    } else {
        ctx.fillRect(-w/2, -h/2, w, h);
        ctx.strokeRect(-w/2, -h/2, w, h);
    }
    
    ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════
// DRAW FUNCTION
// ═══════════════════════════════════════════════════════════════════

function draw(ctx, canvas, params, frame) {
    const grid = params.gridSize || 50;
    const speed = params.speed || 1;
    
    // Update grid and spiral if changed
    if (grid !== GRID) {
        GRID = grid;
        spiralPath = generateSpiral(GRID);
    }
    
    // Ensure spiral is initialized
    if (spiralPath.length === 0) {
        spiralPath = generateSpiral(GRID);
    }
    
    // Calculate time from frame
    const t = (frame / 60) * speed;
    
    const W = canvas.width;
    const H = canvas.height;
    const cellSize = Math.min(W, H) / GRID;
    const offsetX = (W - GRID * cellSize) / 2;
    const offsetY = (H - GRID * cellSize) / 2;
    
    // Clear
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);
    
    // Draw grid
    for (let row = 0; row < GRID; row++) {
        for (let col = 0; col < GRID; col++) {
            const nx = col / GRID;
            const ny = row / GRID;
            const tile = getTileState(col, row, nx, ny, t);
            
            const x = offsetX + col * cellSize + cellSize / 2;
            const y = offsetY + row * cellSize + cellSize / 2;
            
            drawCard(ctx, x, y, cellSize, tile.scaleX, tile.scaleY, tile.rotation, 
                     tile.roundness, tile.offsetX, tile.offsetY, tile.isWhite);
        }
    }
}

// ═══════════════════════════════════════════════════════════════════
// SCRIPT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

export const SCRIPT_CONFIG = {
    id: 'squares',
    title: 'Squares Illusion',
    category: 'other',
    description: '4-minute optical illusion cycle with 15 phases. Features 7 patterns (checkerboard, cafe wall, stripes), 5 transitions (radial wave, spiral unwind), and 6 effects (rotation wave, compression, morph).',
    version: '2.0.0',
    
    canvas: {
        width: 800,
        height: 800,
        context: '2d',
        background: '#000000'
    },
    
    animation: {
        type: 'loop',
        loopDuration: 240,      // 4 minutes
        loopFrames: 240 * 60,   // 14400 frames at 60fps
        defaultFps: 60,
        defaultSpeed: 1,
        canPrerender: true
    },
    
    export: {
        png: true,
        gif: true,
        webm: true,
        sequence: true
    },
    
    presets: [
        {
            name: 'Default',
            values: { gridSize: 50, speed: 1 }
        },
        {
            name: 'Fine Grid',
            values: { gridSize: 80, speed: 1 }
        },
        {
            name: 'Coarse Grid',
            values: { gridSize: 25, speed: 1 }
        },
        {
            name: 'Fast',
            values: { gridSize: 50, speed: 2 }
        },
        {
            name: 'Slow',
            values: { gridSize: 50, speed: 0.5 }
        }
    ],
    
    parameters: [
        {
            group: 'Grid',
            params: [
                {
                    key: 'gridSize',
                    type: 'slider',
                    label: 'Grid Size',
                    min: 20,
                    max: 80,
                    step: 5,
                    default: 50
                }
            ]
        },
        {
            group: 'Timeline',
            params: [
                {
                    key: 'speed',
                    type: 'slider',
                    label: 'Speed',
                    min: 0.5,
                    max: 3,
                    step: 0.1,
                    default: 1,
                    precision: 1
                },
                {
                    key: 'seek',
                    type: 'slider',
                    label: 'Seek (seconds)',
                    min: 0,
                    max: 240,
                    step: 1,
                    default: 0
                }
            ]
        },
        {
            group: 'Canvas',
            params: [
                {
                    key: 'canvasWidth',
                    type: 'slider',
                    label: 'Width',
                    min: 400,
                    max: 1600,
                    step: 100,
                    default: 800
                },
                {
                    key: 'canvasHeight',
                    type: 'slider',
                    label: 'Height',
                    min: 400,
                    max: 1600,
                    step: 100,
                    default: 800
                }
            ]
        }
    ],
    
    draw: draw
};

console.log('✅ Squares Illusion script loaded');
