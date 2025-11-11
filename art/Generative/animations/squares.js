/**
 * Squares Animation - SiteBoy Component
 * 4-minute optical illusion cycle with pattern transitions and geometric effects
 * 
 * ARCHITECTURE:
 * - Extends BaseComponent ✅
 * - Uses AnimationContainer ✅
 * - Uses ComponentLibrary for GUI ✅
 * - Uses AnimationFoundation for loops ✅
 * - NO inline styles ✅
 * - NO manual DOM creation ✅
 * 
 * @version 1.0.0
 */

import { BaseComponent } from '../../../assets/js/shared/foundation.js';
import { AnimationContainer } from '../../../assets/js/shared/animation-container.js';
import { AnimationLoop } from '../../../assets/js/core/animation-foundation.js';

export class SquaresAnimation extends BaseComponent {
    constructor(container, deps = {}) {
        super({ componentType: 'animation-canvas' }, deps);
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.animator = null;
        
        // Animation state
        this.time = 0;
        this.isPaused = false;
        this.GRID = 50;
        this.loopFrames = 240 * 60; // 4 minutes at 60fps
        this.exportScale = 1;
        
        // Build spiral path
        this.spiralPath = this.generateSpiral();
    }
    
    generateSpiral() {
        const path = [];
        let left = 0, right = this.GRID - 1, top = 0, bottom = this.GRID - 1;
        
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
    
    render() {
        this.destroy();
        
        const dims = this.calculateDimensions('animation-canvas');
        const F = dims.F || 12;
        
        // Create canvas
        this.canvas = this.createElement('canvas', 'animation-canvas');
        this.canvas.width = dims.dimensions ? dims.dimensions.width : (F * 67);
        this.canvas.height = dims.dimensions ? dims.dimensions.height : (F * 67);
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        
        // Create animation container with export enabled
        const animContainer = new AnimationContainer({
            enableExport: true,
            animationInstance: this,
            loopFrames: this.loopFrames
        }, this.deps);
        this.addChild(animContainer);
        
        animContainer.setCanvas(this.canvas);
        
        // Create controls
        const { Button, Heading } = window.ComponentLibrary;
        
        const controlsHeading = new Heading({ text: 'CONTROLS', level: 3 }, this.deps);
        this.addChild(controlsHeading);
        animContainer.addToSidebar(controlsHeading.render());
        
        // Play/Pause button
        const playBtn = new Button({
            text: this.isPaused ? 'PLAY' : 'PAUSE',
            onClick: () => {
                this.isPaused = !this.isPaused;
                playBtn.updateText(this.isPaused ? 'PLAY' : 'PAUSE');
            }
        }, this.deps);
        this.addChild(playBtn);
        animContainer.addToSidebar(playBtn.render());
        
        // Restart button
        const restartBtn = new Button({
            text: 'RESTART',
            onClick: () => { this.time = 0; }
        }, this.deps);
        this.addChild(restartBtn);
        animContainer.addToSidebar(restartBtn.render());
        
        // Info display
        const infoHeading = new Heading({ text: 'TIMELINE', level: 3 }, this.deps);
        this.addChild(infoHeading);
        animContainer.addToSidebar(infoHeading.render());
        
        // Create info display element
        this.infoEl = this.createElement('div', 'squares-info');
        this.infoEl.style.cssText = `
            padding: 12px;
            border: 1px solid var(--c-border);
            font-size: 11px;
            line-height: 1.6;
            font-family: 'Space Mono', monospace;
        `;
        animContainer.addToSidebar(this.infoEl);
        
        // Render container
        const rendered = animContainer.render();
        this.container.appendChild(rendered);
        
        // Setup keyboard controls
        this.setupKeyboardControls(playBtn);
        
        // Start animation
        this.startAnimation();
        
        return rendered;
    }
    
    setupKeyboardControls(playBtn) {
        // Store references
        this.playBtn = playBtn;
        this.infoVisible = true;
        
        // Keyboard event handler
        this.keyHandler = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.isPaused = !this.isPaused;
                if (this.playBtn) {
                    this.playBtn.updateText(this.isPaused ? 'PLAY' : 'PAUSE');
                }
            } else if (e.code === 'KeyR') {
                e.preventDefault();
                this.time = 0;
            } else if (e.code === 'KeyH') {
                e.preventDefault();
                this.infoVisible = !this.infoVisible;
                if (this.infoEl) {
                    this.infoEl.style.display = this.infoVisible ? 'block' : 'none';
                }
            }
        };
        
        document.addEventListener('keydown', this.keyHandler);
    }
    
    startAnimation() {
        this.animator = new AnimationLoop({
            onFrame: () => this.draw()
        });
        this.animator.start();
    }
    
    onResize(width, height) {
        if (!this.canvas) return;
        this.canvas.width = width;
        this.canvas.height = height;
    }
    
    // Easing functions
    easeIn(t) { return t * t * t; }
    easeOut(t) { return 1 - Math.pow(1 - t, 3); }
    easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    
    // Hash function for random patterns
    hash(x, y) {
        let h = x * 374761393 + y * 668265263;
        h = (h ^ (h >>> 13)) * 1274126177;
        return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    }
    
    // Envelope for smooth effect transitions
    envelope(localT, duration) {
        const fadeTime = Math.min(1, duration * 0.1);
        if (localT < fadeTime) return this.easeInOut(localT / fadeTime);
        if (localT > duration - fadeTime) return this.easeInOut((duration - localT) / fadeTime);
        return 1;
    }
    
    // PATTERNS
    getPattern(name, col, row, nx, ny) {
        switch(name) {
            case 'allBlack': return false;
            case 'allWhite': return true;
            case 'checkerboard': return (Math.floor(col) + Math.floor(row)) % 2 === 0;
            case 'horizontalStripes': return Math.floor(row) % 2 === 0;
            case 'verticalStripes': return Math.floor(col) % 2 === 0;
            case 'cafeWall': {
                const offset = Math.floor(row) % 2 === 0 ? 0 : 0.5;
                return Math.floor(col + offset) % 2 === 0;
            }
            case 'diagonalStripes': return (Math.floor(col) + Math.floor(row)) % 4 < 2;
            default: return false;
        }
    }
    
    // TRANSITIONS
    getTransition(name, col, row, nx, ny, progress, fromPattern, toPattern) {
        switch(name) {
            case 'radialWave': return this.radialWave(col, row, nx, ny, progress, fromPattern, toPattern);
            case 'linearSweep': return this.linearSweep(col, row, nx, ny, progress, fromPattern, toPattern);
            case 'verticalSweep': return this.verticalSweep(col, row, nx, ny, progress, fromPattern, toPattern);
            case 'spiralUnwind': return this.spiralUnwind(col, row, nx, ny, progress, fromPattern, toPattern);
            case 'randomFlicker': return this.randomFlicker(col, row, nx, ny, progress, fromPattern, toPattern);
            default: return { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0, isWhite: false };
        }
    }
    
    radialWave(col, row, nx, ny, progress, fromPattern, toPattern) {
        const cx = 0.5, cy = 0.5;
        const dist = Math.sqrt((nx-cx)*(nx-cx) + (ny-cy)*(ny-cy));
        const maxDist = 0.707;
        const duration = 0.25;
        const normalizedDist = dist / maxDist;
        const flipStart = normalizedDist - progress * (1 + duration);
        return this.getFlipState(flipStart, duration, fromPattern, toPattern, col, row, nx, ny, 'x');
    }
    
    linearSweep(col, row, nx, ny, progress, fromPattern, toPattern) {
        const duration = 0.2;
        const flipStart = nx - progress * (1 + duration);
        return this.getFlipState(flipStart, duration, fromPattern, toPattern, col, row, nx, ny, 'x');
    }
    
    verticalSweep(col, row, nx, ny, progress, fromPattern, toPattern) {
        const duration = 0.2;
        const flipStart = ny - progress * (1 + duration);
        return this.getFlipState(flipStart, duration, fromPattern, toPattern, col, row, nx, ny, 'y');
    }
    
    spiralUnwind(col, row, nx, ny, progress, fromPattern, toPattern) {
        const tileIndex = this.spiralPath.findIndex(([c, r]) => c === Math.floor(col) && r === Math.floor(row));
        if (tileIndex === -1) return { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0, isWhite: toPattern };
        
        const totalTiles = this.spiralPath.length;
        const tileProgress = tileIndex / totalTiles;
        const duration = 1.5 / totalTiles;
        const flipStart = tileProgress - progress * (1 + duration);
        
        let flipAxis = 'x';
        if (tileIndex < totalTiles - 1) {
            const [currCol, currRow] = this.spiralPath[tileIndex];
            const [nextCol, nextRow] = this.spiralPath[tileIndex + 1];
            flipAxis = Math.abs(nextRow - currRow) > 0 ? 'y' : 'x';
        }
        
        return this.getFlipState(flipStart, duration, fromPattern, toPattern, col, row, nx, ny, flipAxis);
    }
    
    randomFlicker(col, row, nx, ny, progress, fromPattern, toPattern) {
        const h = this.hash(col, row);
        const duration = 0.25;
        const flipStart = h - progress * (1 + duration);
        return this.getFlipState(flipStart, duration, fromPattern, toPattern, col, row, nx, ny, 'y');
    }
    
    getFlipState(flipStart, duration, fromPattern, toPattern, col, row, nx, ny, axis = 'x') {
        const flipEnd = flipStart + duration;
        let scaleX = 1, scaleY = 1, offsetX = 0, offsetY = 0;
        const fromColor = this.getPattern(fromPattern, col, row, nx, ny);
        const toColor = this.getPattern(toPattern, col, row, nx, ny);
        let isWhite = fromColor;
        
        if (fromColor === toColor) {
            return { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0, isWhite: toColor };
        }
        
        if (flipStart < 0 && flipEnd > 0) {
            const flipProgress = Math.min(1, -flipStart / duration);
            
            if (flipProgress < 0.5) {
                if (axis === 'x') scaleX = 1 - this.easeIn(flipProgress * 2);
                else scaleY = 1 - this.easeIn(flipProgress * 2);
            } else {
                if (axis === 'x') scaleX = this.easeOut((flipProgress - 0.5) * 2);
                else scaleY = this.easeOut((flipProgress - 0.5) * 2);
                isWhite = toColor;
            }
        } else if (flipStart <= -duration) {
            isWhite = toColor;
        }
        
        return { scaleX, scaleY, offsetX, offsetY, isWhite };
    }
    
    // EFFECTS
    applyEffect(name, col, row, nx, ny, localT, duration, state) {
        const env = this.envelope(localT, duration);
        
        switch(name) {
            case 'none':
                return state;
                
            case 'rotationWave': {
                const cx = 0.5, cy = 0.5;
                const dist = Math.sqrt((nx-cx)*(nx-cx) + (ny-cy)*(ny-cy));
                const cycles = 10;
                const phase = (localT / duration) * cycles * Math.PI * 2;
                const spatialFreq = 12;
                state.rotation = Math.sin(dist * spatialFreq - phase) * 20 * env;
                return state;
            }
            
            case 'compressionWave': {
                const cycles = 8;
                const phase = (localT / duration) * cycles * Math.PI * 2;
                const spatialFreq = 12;
                const wave = Math.sin(nx * spatialFreq - phase);
                state.scaleY = 1 + wave * 0.6 * env;
                state.scaleX = 1 - wave * 0.3 * env;
                state.rotation = wave * 35 * env;
                return state;
            }
            
            case 'cafeWallShift': {
                const cycles = 6;
                const phase = (localT / duration) * cycles * Math.PI * 2;
                const shift = Math.sin(phase) * 0.15;
                const rowOffset = Math.floor(row) % 2 === 0 ? shift : -shift;
                state.offsetX = rowOffset * env;
                const edgeDist = Math.min(nx, 1 - nx);
                if (edgeDist < 0.1) {
                    state.scaleX = 0.7 + edgeDist * 3;
                }
                return state;
            }
            
            case 'radialPulse': {
                const cx = 0.5, cy = 0.5;
                const dist = Math.sqrt((nx-cx)*(nx-cx) + (ny-cy)*(ny-cy));
                const cycles = 5;
                const phase = (localT / duration) * cycles * Math.PI * 2;
                const spatialFreq = 8;
                const pulse = (Math.sin(dist * spatialFreq - phase) + 1) / 2;
                state.scaleX = 1 + pulse * 0.3 * env;
                state.scaleY = 1 + pulse * 0.3 * env;
                if (dist > 0.6) {
                    const squeeze = (dist - 0.6) / 0.4;
                    state.offsetX = (nx - cx) * squeeze * 0.1 * env;
                    state.offsetY = (ny - cy) * squeeze * 0.1 * env;
                }
                return state;
            }
            
            case 'spiralRotation': {
                const cx = 0.5, cy = 0.5;
                const angle = Math.atan2(ny - cy, nx - cx);
                const dist = Math.sqrt((nx-cx)*(nx-cx) + (ny-cy)*(ny-cy));
                const cycles = 4;
                const phase = (localT / duration) * cycles * Math.PI * 2;
                const rotation = (angle * 3 + dist * 15 - phase) * (180 / Math.PI);
                state.rotation = (rotation % 360) * env;
                return state;
            }
            
            case 'shapeMorph': {
                const cx = 0.5, cy = 0.5;
                const dist = Math.sqrt((nx-cx)*(nx-cx) + (ny-cy)*(ny-cy));
                const cycles = 3;
                const morphPhase = (localT / duration) * cycles * Math.PI * 2;
                const spatialFreq = 12;
                const morph = (Math.sin(dist * spatialFreq - morphPhase) + 1) / 2;
                state.roundness = morph * morph * (3 - 2 * morph) * env;
                const scalePhase = (localT / duration) * 4 * Math.PI * 2;
                const scalePulse = Math.sin(scalePhase) * 0.35;
                state.scaleX = 1 + scalePulse * env;
                state.scaleY = 1 + scalePulse * env;
                return state;
            }
            
            default:
                return state;
        }
    }
    
    // TIMELINE (4-minute cycle)
    getTimeline() {
        return [
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
    }
    
    getCurrentState() {
        const t = this.time % 240;
        const timeline = this.getTimeline();
        
        for (let i = 0; i < timeline.length; i++) {
            const curr = timeline[i];
            if (t >= curr.t && t < curr.t + curr.dur) {
                const localT = t - curr.t;
                const progress = localT / curr.dur;
                
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
                        `${curr.from} → ${curr.to}` :
                        `${curr.pattern} + ${curr.effect}`
                };
            }
        }
        
        return timeline[timeline.length - 1];
    }
    
    getTileState(col, row, nx, ny) {
        const state = this.getCurrentState();
        let result = { rotation: 0, scaleX: 1, scaleY: 1, roundness: 0, offsetX: 0, offsetY: 0, isWhite: false };
        
        if (state.type === 'transition') {
            const flipState = this.getTransition(
                state.transition,
                col, row, nx, ny, state.progress,
                state.from, state.to
            );
            result = { ...result, ...flipState };
        } else {
            result.isWhite = this.getPattern(state.pattern, col, row, nx, ny);
            result = this.applyEffect(state.effect, col, row, nx, ny, state.localT, state.duration, result);
        }
        
        return result;
    }
    
    drawCard(x, y, size, scaleX, scaleY, rotation, roundness, offsetX, offsetY, isWhite) {
        this.ctx.save();
        this.ctx.translate(x + offsetX * size, y + offsetY * size);
        this.ctx.rotate(rotation * Math.PI / 180);
        
        const w = size * scaleX * 1;
        const h = size * scaleY * 1;
        
        this.ctx.fillStyle = isWhite ? '#fff' : '#000';
        this.ctx.strokeStyle = isWhite ? '#000' : '#fff';
        this.ctx.lineWidth = 1;
        
        this.ctx.beginPath();
        if (roundness > 0.99) {
            this.ctx.ellipse(0, 0, w/2, h/2, 0, 0, Math.PI * 2);
        } else if (roundness < 0.01) {
            this.ctx.rect(-w/2, -h/2, w, h);
        } else {
            const rX = roundness * w/2, rY = roundness * h/2;
            this.ctx.moveTo(-w/2 + rX, -h/2);
            this.ctx.lineTo(w/2 - rX, -h/2);
            this.ctx.quadraticCurveTo(w/2, -h/2, w/2, -h/2 + rY);
            this.ctx.lineTo(w/2, h/2 - rY);
            this.ctx.quadraticCurveTo(w/2, h/2, w/2 - rX, h/2);
            this.ctx.lineTo(-w/2 + rX, h/2);
            this.ctx.quadraticCurveTo(-w/2, h/2, -w/2, h/2 - rY);
            this.ctx.lineTo(-w/2, -h/2 + rY);
            this.ctx.quadraticCurveTo(-w/2, -h/2, -w/2 + rX, -h/2);
            this.ctx.closePath();
        }
        
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();
    }
    
    draw() {
        if (!this.ctx) return;
        
        if (!this.isPaused) {
            this.time += 0.016;
            if (this.time >= 240) this.time = 0;
        }
        
        // Clear
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculate grid
        const cellSize = Math.min(this.canvas.width / this.GRID, this.canvas.height / this.GRID);
        const offsetX = (this.canvas.width - this.GRID * cellSize) / 2;
        const offsetY = (this.canvas.height - this.GRID * cellSize) / 2;
        
        // Apply export scale
        const scale = this.exportScale || 1;
        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.scale(scale, scale);
        this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
        
        // Draw grid
        for (let row = 0; row < this.GRID; row++) {
            for (let col = 0; col < this.GRID; col++) {
                const nx = col / this.GRID;
                const ny = row / this.GRID;
                const tile = this.getTileState(col, row, nx, ny);
                
                const x = offsetX + col * cellSize + cellSize / 2;
                const y = offsetY + row * cellSize + cellSize / 2;
                
                this.drawCard(x, y, cellSize, tile.scaleX, tile.scaleY, tile.rotation, 
                             tile.roundness, tile.offsetX, tile.offsetY, tile.isWhite);
            }
        }
        
        this.ctx.restore();
        
        // Update info
        this.updateInfo();
    }
    
    updateInfo() {
        if (!this.infoEl) return;
        
        const state = this.getCurrentState();
        const mins = Math.floor(this.time / 60);
        const secs = Math.floor(this.time % 60);
        
        this.infoEl.innerHTML = `
            <strong>Phase:</strong> ${state.name || 'LOADING'}<br>
            <strong>Type:</strong> ${state.type === 'transition' ? 'Flipping tiles' : 'Geometric effect'}<br>
            <strong>Time:</strong> ${mins}:${secs.toString().padStart(2, '0')} / 4:00
        `;
    }
    
    destroy() {
        // Remove keyboard listener
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
            this.keyHandler = null;
        }
        
        if (this.animator) {
            this.animator.destroy();
            this.animator = null;
        }
        super.destroy();
    }
}

// Export globally for art_section.js compatibility
window.SquaresAnimation = SquaresAnimation;

