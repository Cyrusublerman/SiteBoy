/**
 * Squares Animation Tool - ToolBase Implementation
 * 4-minute optical illusion cycle with pattern transitions
 * 
 * Original: 15-phase choreographed animation with:
 * - 7 patterns (allBlack, allWhite, checkerboard, etc.)
 * - 5 transitions (radialWave, linearSweep, etc.)
 * - 6 effects (rotationWave, compressionWave, etc.)
 * 
 * @version 2.0.0 - Full Original Timeline Restored
 */

// ES Module imports
import { ToolBase } from '../core/tool-base.js';
import ComponentLibrary from '../../shared/component-library.js';
import { AnimationLoop } from '../../core/animation-foundation.js';

// Animation state
    var time = 0;
    var isPaused = false;
    var animator = null;
    var GRID = 50;
    var spiralPath = [];
    
    // ========================================================================
    // EASING FUNCTIONS
    // ========================================================================
    
    function easeIn(t) { return t * t * t; }
    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
    function easeInOut(t) { 
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; 
    }
    
    // Spatial hash for deterministic randomness
    function hash(x, y) {
        var h = x * 374761393 + y * 668265263;
        h = (h ^ (h >>> 13)) * 1274126177;
        return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    }
    
    // Generate spiral path for spiral unwind transition
    function generateSpiral() {
        var path = [];
        var left = 0, right = GRID - 1, top = 0, bottom = GRID - 1;
        
        while (left <= right && top <= bottom) {
            for (var col = left; col <= right; col++) path.push([col, top]);
            top++;
            for (var row = top; row <= bottom; row++) path.push([right, row]);
            right--;
            if (top <= bottom) {
                for (var col2 = right; col2 >= left; col2--) path.push([col2, bottom]);
                bottom--;
            }
            if (left <= right) {
                for (var row2 = bottom; row2 >= top; row2--) path.push([left, row2]);
                left++;
            }
        }
        return path;
    }
    
    // Envelope: smooth entry/exit for effects
    function envelope(localT, duration) {
        var fadeTime = Math.min(1, duration * 0.1);
        if (localT < fadeTime) return easeInOut(localT / fadeTime);
        if (localT > duration - fadeTime) return easeInOut((duration - localT) / fadeTime);
        return 1;
    }
    
    // ========================================================================
    // PATTERNS (7 types)
    // ========================================================================
    
    var patterns = {
        allBlack: function(col, row, nx, ny) { return false; },
        allWhite: function(col, row, nx, ny) { return true; },
        checkerboard: function(col, row, nx, ny) { 
            return (Math.floor(col) + Math.floor(row)) % 2 === 0; 
        },
        horizontalStripes: function(col, row, nx, ny) { 
            return Math.floor(row) % 2 === 0; 
        },
        verticalStripes: function(col, row, nx, ny) { 
            return Math.floor(col) % 2 === 0; 
        },
        cafeWall: function(col, row, nx, ny) {
            var offset = Math.floor(row) % 2 === 0 ? 0 : 0.5;
            return Math.floor(col + offset) % 2 === 0;
        },
        diagonalStripes: function(col, row, nx, ny) { 
            return (Math.floor(col) + Math.floor(row)) % 4 < 2; 
        }
    };
    
    // ========================================================================
    // FLIP STATE HELPER
    // ========================================================================
    
    function getFlipState(flipStart, duration, fromPattern, toPattern, col, row, nx, ny, axis) {
        var flipEnd = flipStart + duration;
        var scaleX = 1, scaleY = 1, offsetX = 0, offsetY = 0;
        var fromColor = fromPattern(col, row, nx, ny);
        var toColor = toPattern(col, row, nx, ny);
        var isWhite = fromColor;
        
        // Only flip if color is actually changing
        if (fromColor === toColor) {
            return { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0, isWhite: toColor };
        }
        
        if (flipStart < 0 && flipEnd > 0) {
            var flipProgress = Math.min(1, -flipStart / duration);
            
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
        
        return { scaleX: scaleX, scaleY: scaleY, offsetX: offsetX, offsetY: offsetY, isWhite: isWhite };
    }
    
    // ========================================================================
    // TRANSITIONS (5 types)
    // ========================================================================
    
    var transitions = {
        radialWave: function(col, row, nx, ny, progress, fromPattern, toPattern) {
            var cx = 0.5, cy = 0.5;
            var dist = Math.sqrt((nx-cx)*(nx-cx) + (ny-cy)*(ny-cy));
            var maxDist = 0.707;
            var duration = 0.25;
            var normalizedDist = dist / maxDist;
            var flipStart = normalizedDist - progress * (1 + duration);
            
            return getFlipState(flipStart, duration, fromPattern, toPattern, col, row, nx, ny, 'x');
        },
        
        linearSweep: function(col, row, nx, ny, progress, fromPattern, toPattern) {
            var duration = 0.2;
            var flipStart = nx - progress * (1 + duration);
            return getFlipState(flipStart, duration, fromPattern, toPattern, col, row, nx, ny, 'x');
        },
        
        verticalSweep: function(col, row, nx, ny, progress, fromPattern, toPattern) {
            var duration = 0.2;
            var flipStart = ny - progress * (1 + duration);
            return getFlipState(flipStart, duration, fromPattern, toPattern, col, row, nx, ny, 'y');
        },
        
        spiralUnwind: function(col, row, nx, ny, progress, fromPattern, toPattern) {
            var tileIndex = -1;
            for (var i = 0; i < spiralPath.length; i++) {
                if (spiralPath[i][0] === Math.floor(col) && spiralPath[i][1] === Math.floor(row)) {
                    tileIndex = i;
                    break;
                }
            }
            
            if (tileIndex === -1) {
                return { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0, isWhite: toPattern(col, row, nx, ny) };
            }
            
            var totalTiles = spiralPath.length;
            var tileProgress = tileIndex / totalTiles;
            var duration = 1.5 / totalTiles;
            var flipStart = tileProgress - progress * (1 + duration);
            
            var flipAxis = 'x';
            if (tileIndex < totalTiles - 1) {
                var currCol = spiralPath[tileIndex][0], currRow = spiralPath[tileIndex][1];
                var nextCol = spiralPath[tileIndex + 1][0], nextRow = spiralPath[tileIndex + 1][1];
                flipAxis = Math.abs(nextRow - currRow) > 0 ? 'y' : 'x';
            }
            
            return getFlipState(flipStart, duration, fromPattern, toPattern, col, row, nx, ny, flipAxis);
        },
        
        randomFlicker: function(col, row, nx, ny, progress, fromPattern, toPattern) {
            var h = hash(col, row);
            var duration = 0.25;
            var flipStart = h - progress * (1 + duration);
            return getFlipState(flipStart, duration, fromPattern, toPattern, col, row, nx, ny, 'y');
        }
    };
    
    // ========================================================================
    // EFFECTS (6 types) - Phase aligned to end at neutral
    // ========================================================================
    
    var effects = {
        none: function(col, row, nx, ny, localT, duration, state) { return state; },
        
        rotationWave: function(col, row, nx, ny, localT, duration, state) {
            var cx = 0.5, cy = 0.5;
            var dist = Math.sqrt((nx-cx)*(nx-cx) + (ny-cy)*(ny-cy));
            
            var cycles = 10;
            var phase = (localT / duration) * cycles * Math.PI * 2;
            var spatialFreq = 12;
            
            var env = envelope(localT, duration);
            state.rotation = Math.sin(dist * spatialFreq - phase) * 20 * env;
            return state;
        },
        
        compressionWave: function(col, row, nx, ny, localT, duration, state) {
            var cycles = 8;
            var phase = (localT / duration) * cycles * Math.PI * 2;
            var spatialFreq = 12;
            
            var wave = Math.sin(nx * spatialFreq - phase);
            var env = envelope(localT, duration);
            
            state.scaleY = 1 + wave * 0.6 * env;
            state.scaleX = 1 - wave * 0.3 * env;
            state.rotation = wave * 35 * env;
            return state;
        },
        
        cafeWallShift: function(col, row, nx, ny, localT, duration, state) {
            var cycles = 6;
            var phase = (localT / duration) * cycles * Math.PI * 2;
            
            var shift = Math.sin(phase) * 0.15;
            var rowOffset = Math.floor(row) % 2 === 0 ? shift : -shift;
            var env = envelope(localT, duration);
            
            state.offsetX = rowOffset * env;
            
            // Edge compression
            var edgeDist = Math.min(nx, 1 - nx);
            if (edgeDist < 0.1) {
                state.scaleX = 0.7 + edgeDist * 3;
            }
            
            return state;
        },
        
        radialPulse: function(col, row, nx, ny, localT, duration, state) {
            var cx = 0.5, cy = 0.5;
            var dist = Math.sqrt((nx-cx)*(nx-cx) + (ny-cy)*(ny-cy));
            
            var cycles = 5;
            var phase = (localT / duration) * cycles * Math.PI * 2;
            var spatialFreq = 8;
            
            var pulse = (Math.sin(dist * spatialFreq - phase) + 1) / 2;
            var env = envelope(localT, duration);
            
            state.scaleX = 1 + pulse * 0.3 * env;
            state.scaleY = 1 + pulse * 0.3 * env;
            
            if (dist > 0.6) {
                var squeeze = (dist - 0.6) / 0.4;
                state.offsetX = (nx - cx) * squeeze * 0.1 * env;
                state.offsetY = (ny - cy) * squeeze * 0.1 * env;
            }
            
            return state;
        },
        
        spiralRotation: function(col, row, nx, ny, localT, duration, state) {
            var cx = 0.5, cy = 0.5;
            var angle = Math.atan2(ny - cy, nx - cx);
            var dist = Math.sqrt((nx-cx)*(nx-cx) + (ny-cy)*(ny-cy));
            
            var cycles = 4;
            var phase = (localT / duration) * cycles * Math.PI * 2;
            
            var rotation = (angle * 3 + dist * 15 - phase) * (180 / Math.PI);
            var env = envelope(localT, duration);
            
            state.rotation = (rotation % 360) * env;
            return state;
        },
        
        shapeMorph: function(col, row, nx, ny, localT, duration, state) {
            var cx = 0.5, cy = 0.5;
            var dist = Math.sqrt((nx-cx)*(nx-cx) + (ny-cy)*(ny-cy));
            
            var cycles = 3;
            var morphPhase = (localT / duration) * cycles * Math.PI * 2;
            var spatialFreq = 12;
            
            var morph = (Math.sin(dist * spatialFreq - morphPhase) + 1) / 2;
            var env = envelope(localT, duration);
            
            state.roundness = morph * morph * (3 - 2 * morph) * env;
            
            var scalePhase = (localT / duration) * 4 * Math.PI * 2;
            var scalePulse = Math.sin(scalePhase) * 0.35;
            
            state.scaleX = 1 + scalePulse * env;
            state.scaleY = 1 + scalePulse * env;
            return state;
        }
    };
    
    // ========================================================================
    // TIMELINE (15 phases, 4-minute cycle)
    // ========================================================================
    
    var timeline = [
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
    
    function getCurrentState() {
        var t = time % 240;
        
        for (var i = 0; i < timeline.length; i++) {
            var curr = timeline[i];
            if (t >= curr.t && t < curr.t + curr.dur) {
                var localT = t - curr.t;
                var progress = localT / curr.dur;
                
                return {
                    type: curr.type,
                    pattern: curr.pattern,
                    effect: curr.effect,
                    transition: curr.transition,
                    from: curr.from,
                    to: curr.to,
                    progress: progress,
                    localT: localT,
                    duration: curr.dur,
                    name: curr.type === 'transition' ? 
                        curr.from + ' → ' + curr.to :
                        curr.pattern + ' + ' + curr.effect
                };
            }
        }
        
        return timeline[timeline.length - 1];
    }
    
    function getTileState(col, row, nx, ny) {
        var state = getCurrentState();
        var result = { rotation: 0, scaleX: 1, scaleY: 1, roundness: 0, offsetX: 0, offsetY: 0, isWhite: false };
        
        if (state.type === 'transition') {
            var transitionFn = transitions[state.transition];
            var flipState = transitionFn(
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
            var effectFn = effects[state.effect];
            result = effectFn(col, row, nx, ny, state.localT, state.duration, result);
        }
        
        return result;
    }
    
    // Draw a single card/tile
    function drawCard(ctx, x, y, size, scaleX, scaleY, rotation, roundness, offsetX, offsetY, isWhite) {
        ctx.save();
        ctx.translate(x + offsetX * size, y + offsetY * size);
        ctx.rotate(rotation * Math.PI / 180);
        
        var w = size * scaleX;
        var h = size * scaleY;
        
        ctx.fillStyle = isWhite ? '#ffffff' : '#000000';
        ctx.strokeStyle = isWhite ? '#000000' : '#ffffff';
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        if (roundness > 0.99) {
            ctx.ellipse(0, 0, w/2, h/2, 0, 0, Math.PI * 2);
        } else if (roundness < 0.01) {
            ctx.rect(-w/2, -h/2, w, h);
        } else {
            var rX = roundness * w/2, rY = roundness * h/2;
            ctx.moveTo(-w/2 + rX, -h/2);
            ctx.lineTo(w/2 - rX, -h/2);
            ctx.quadraticCurveTo(w/2, -h/2, w/2, -h/2 + rY);
            ctx.lineTo(w/2, h/2 - rY);
            ctx.quadraticCurveTo(w/2, h/2, w/2 - rX, h/2);
            ctx.lineTo(-w/2 + rX, h/2);
            ctx.quadraticCurveTo(-w/2, h/2, -w/2, h/2 - rY);
            ctx.lineTo(-w/2, -h/2 + rY);
            ctx.quadraticCurveTo(-w/2, -h/2, -w/2 + rX, -h/2);
            ctx.closePath();
        }
        
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
    
    // ========================================================================
    // TOOLBASE CONFIGURATION
    // ========================================================================
    
    export const TOOL_CONFIG = {
        title: 'SQUARES ILLUSION',
        
        // Animation export config: 4-minute (240s) choreographed timeline
        animation: {
            type: 'loop',
            loopDuration: 240,  // 4 minutes in seconds
            loopFrames: 240 * 60,  // 14400 frames at 60fps
            defaultFps: 60,
            canPrerender: true
        },
        
        sidebar: [
            ['CONTROLS', [
                ['Playback', [
                    ['button', 'Play/Pause', null, { key: 'playPause' }],
                    ['button', 'Restart', null, { key: 'restart' }],
                ]],
                ['Info', [
                    ['label', 'Phase: Intro', { key: 'phaseInfo', variant: 'heading' }],
                    ['label', 'Time: 0:00 / 4:00', { key: 'timeInfo', variant: 'caption' }],
                ]],
            ]],
            ['SETTINGS', [
                ['Grid', [
                    ['slider', 'Grid Size', 20, 80, 5, { key: 'gridSize', value: 50, withNumber: true }],
                ]],
                ['Timeline', [
                    ['slider', 'Speed', 0.5, 3, 0.1, { key: 'speed', value: 1, withNumber: true }],
                    ['slider', 'Seek', 0, 240, 1, { key: 'seek', value: 0, withNumber: true }],
                ]],
            ]],
            // CANVAS tab auto-injected by ToolBase
        ],
        
        canvas: {
            width: 800,
            height: 800,
            showControls: true
        },
        
        onInit: function(values) {
            var self = this;
            spiralPath = generateSpiral();
            
            // Wire play/pause button
            var playPauseBtn = this.getComponent('playPause');
            if (playPauseBtn && playPauseBtn.element) {
                playPauseBtn.element.addEventListener('click', function() {
                    isPaused = !isPaused;
                    playPauseBtn.element.textContent = isPaused ? 'PLAY' : 'PAUSE';
                });
            }
            
            // Wire restart button
            var restartBtn = this.getComponent('restart');
            if (restartBtn && restartBtn.element) {
                restartBtn.element.addEventListener('click', function() {
                    time = 0;
                    self.setStatus('Animation restarted');
                });
            }
            
            // Start animation loop using AnimationFoundation
            if (AnimationLoop) {
                animator = new AnimationLoop({
                    onFrame: function() {
                        self.draw();
                    }
                });
                animator.start();
            } else {
                console.error('AnimationFoundation not available - animation disabled');
                // Fallback: draw once immediately so canvas isn't blank
                self.draw();
                animator = { destroy: function() { } };
            }
        },
        
        onUpdate: function(key, value, allValues) {
            switch(key) {
                case 'gridSize':
                    GRID = parseInt(value) || 50;
                    spiralPath = generateSpiral();
                    break;
                case 'speed':
                    // Handled in onDraw
                    break;
                case 'seek':
                    time = parseFloat(value) || 0;
                    break;
            }
        },
        
        // Pre-render support: render a specific frame for animation export
        onRenderFrame: function(frameIndex, totalFrames) {
            var originalTime = time;
            // Map frameIndex to time (0-240 seconds)
            time = (frameIndex / totalFrames) * 240;
            
            var ctx = this.ctx;
            var canvas = this.canvas;
            var W = canvas.width;
            var H = canvas.height;
            var cellSize = Math.min(W, H) / GRID;
            var offsetX = (W - GRID * cellSize) / 2;
            var offsetY = (H - GRID * cellSize) / 2;
            
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, W, H);
            
            for (var row = 0; row < GRID; row++) {
                for (var col = 0; col < GRID; col++) {
                    var nx = col / GRID;
                    var ny = row / GRID;
                    var tile = getTileState(col, row, nx, ny);
                    var x = offsetX + col * cellSize + cellSize / 2;
                    var y = offsetY + row * cellSize + cellSize / 2;
                    drawCard(ctx, x, y, cellSize, tile.scaleX, tile.scaleY, tile.rotation, 
                             tile.roundness, tile.offsetX, tile.offsetY, tile.isWhite);
                }
            }
            
            time = originalTime;
        },
        
        onDraw: function(ctx, canvas, values) {
            var speed = values.speed || 1;
            
            if (!isPaused) {
                time += (1 / 60) * speed;
                if (time >= 240) time = 0;
            }
            
            var W = canvas.width;
            var H = canvas.height;
            var cellSize = Math.min(W, H) / GRID;
            var offsetX = (W - GRID * cellSize) / 2;
            var offsetY = (H - GRID * cellSize) / 2;
            
            // Clear
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, W, H);
            
            // Get current timeline state
            var currentState = getCurrentState();
            
            // Update info labels
            var phaseLabel = this.getComponent('phaseInfo');
            if (phaseLabel && phaseLabel.element) {
                phaseLabel.element.textContent = 'Phase: ' + currentState.name;
            }
            
            var timeLabel = this.getComponent('timeInfo');
            if (timeLabel && timeLabel.element) {
                var mins = Math.floor(time / 60);
                var secs = Math.floor(time % 60);
                timeLabel.element.textContent = 'Time: ' + mins + ':' + (secs < 10 ? '0' : '') + secs + ' / 4:00';
            }
            
            // Update seek slider to match current time
            var seekSlider = this.getComponent('seek');
            if (seekSlider && seekSlider.setValue && !isPaused) {
                // Only update if user isn't dragging
            }
            
            // Draw grid
            for (var row = 0; row < GRID; row++) {
                for (var col = 0; col < GRID; col++) {
                    var nx = col / GRID;
                    var ny = row / GRID;
                    var tile = getTileState(col, row, nx, ny);
                    
                    var x = offsetX + col * cellSize + cellSize / 2;
                    var y = offsetY + row * cellSize + cellSize / 2;
                    
                    drawCard(ctx, x, y, cellSize, tile.scaleX, tile.scaleY, tile.rotation, 
                             tile.roundness, tile.offsetX, tile.offsetY, tile.isWhite);
                }
            }
        }
    };
    
    /**
     * SquaresTool wrapper class
     */
    export class SquaresTool {
        constructor(container, deps) {
        this.container = container;
        this.deps = {
            ComponentLibrary,
            ...(deps || {})
        };
        this.tool = null;
        this.render();
    }
    
    render() {
        try {
            
            this.tool = new ToolBase(TOOL_CONFIG, this.deps);
            this.tool.mount(this.container);
            this.tool.draw();
            window.debugLog('TOOLS', '✅ SquaresTool rendered (v2.0 - Full Timeline)');
        } catch (error) {
            console.error('❌ SquaresTool error:', error);
        }
    }
    
    destroy() {
        if (animator) {
            animator.destroy();
            animator = null;
        }
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
        time = 0;
        isPaused = false;
    }
}
