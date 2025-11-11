/**
 * Harmonics Animation - Proper SiteBoy Component
 * Musical intervals as Lissajous patterns - 12 minute cycle
 * 
 * @version 1.0.0
 */

import { BaseComponent } from '../../../assets/js/shared/foundation.js';
import { AnimationContainer } from '../../../assets/js/shared/animation-container.js';
import { AnimationLoop } from '../../../assets/js/core/animation-foundation.js';

export class HarmonicsAnimation extends BaseComponent {
    constructor(container, deps = {}) {
        super({ componentType: 'animation-canvas' }, deps);
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.animator = null;
        this.startTime = null;
        this.infoDisplay = null;
        
        // Musical intervals
        this.intervals = [
            [1, 1],      // unison
            [16, 15],    // minor second
            [9, 8],      // major second
            [6, 5],      // minor third
            [5, 4],      // major third
            [4, 3],      // perfect fourth
            [45, 32],    // tritone
            [3, 2],      // perfect fifth
            [8, 5],      // minor sixth
            [5, 3],      // major sixth
            [9, 5],      // minor seventh
            [15, 8],     // major seventh
            [2, 1]       // octave
        ];
        
        this.views = ['lateralClosed', 'counterCurrent', 'lateralOpen', 'concurrent'];
        this.passDuration = 90; // seconds
        this.totalCycleDuration = 720; // 12 minutes
        this.loopFrames = 43200; // 720 seconds * 60fps = 12 minutes
        this.motionBlurAlpha = 0.05;
        this.exportScale = 1; // Scale factor for export aspect ratios
    }
    
    render() {
        this.destroy();
        
        const dims = this.calculateDimensions('animation-canvas');
        const F = dims.F || 12;
        
        // Create canvas first (needed for export)
        this.canvas = this.createElement('canvas', 'animation-canvas');
        this.canvas.width = dims.dimensions ? dims.dimensions.width : (F * 67);
        this.canvas.height = dims.dimensions ? dims.dimensions.height : (F * 67);
        this.ctx = this.canvas.getContext('2d', { alpha: false, desynchronized: true });
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        
        // Create animation container with export enabled
        const animContainer = new AnimationContainer({
            enableExport: true,
            animationInstance: this,
            loopFrames: this.loopFrames
        }, this.deps);
        this.addChild(animContainer);
        
        animContainer.setCanvas(this.canvas);
        
        // Create info display using ComponentLibrary
        const { Heading } = window.ComponentLibrary;
        this.infoDisplay = new Heading({ text: 'Ratio: 1:1', level: 3 }, this.deps);
        this.addChild(this.infoDisplay);
        animContainer.addToSidebar(this.infoDisplay.render());
        
        // Render container
        const rendered = animContainer.render();
        this.container.appendChild(rendered);
        
        // Start animation
        this.startAnimation();
        
        return rendered;
    }
    
    startAnimation() {
        this.startTime = Date.now();
        this.animator = new AnimationLoop({
            onFrame: () => this.draw()
        });
        this.animator.start();
    }
    
    timeWarp(x) {
        const numIntervals = this.intervals.length - 1;
        const scaledProgress = x * numIntervals;
        const currentInterval = Math.floor(scaledProgress);
        const localProgress = scaledProgress - currentInterval;
        
        const smoothstep = (t) => t * t * (3 - 2 * t);
        let eased = smoothstep(localProgress);
        eased = smoothstep(eased);
        
        return (currentInterval + eased) / numIntervals;
    }
    
    getCoordinates(t, ratio, view, scale, baseRadius) {
        const [a, b] = ratio;
        
        if (!isFinite(a) || !isFinite(b) || !isFinite(t)) {
            return { x: 0, y: 0 };
        }
        
        switch(view) {
            case 'lateralOpen':
                return {
                    x: scale * Math.sin(a * t),
                    y: scale * Math.sin(b * t)
                };
            
            case 'lateralClosed':
                return {
                    x: scale * Math.cos(a * t),
                    y: scale * Math.sin(b * t)
                };
            
            case 'concurrent':
                const r1 = baseRadius * (1 + 0.6 * Math.sin(b * t));
                const angle1 = a * t;
                return {
                    x: r1 * Math.cos(angle1),
                    y: r1 * Math.sin(angle1)
                };
            
            case 'counterCurrent':
                const r2 = baseRadius * (1 + 0.6 * Math.sin(b * t));
                const angle2 = a * t - b * t;
                return {
                    x: r2 * Math.cos(angle2),
                    y: r2 * Math.sin(angle2)
                };
            
            default:
                return { x: 0, y: 0 };
        }
    }
    
    draw() {
        if (!this.ctx) return;
        
        const elapsed = (Date.now() - this.startTime) / 1000;
        const cycleTime = elapsed % this.totalCycleDuration;
        
        const passIndex = Math.floor(cycleTime / this.passDuration);
        const timeInPass = cycleTime % this.passDuration;
        
        const isAscending = passIndex % 2 === 0;
        const isTransitioning = !isAscending;
        
        const viewSegment = Math.floor(passIndex / 2);
        const currentViewIndex = viewSegment % this.views.length;
        const nextViewIndex = (viewSegment + 1) % this.views.length;
        
        const linearProgress = timeInPass / this.passDuration;
        const warpedProgress = this.timeWarp(linearProgress);
        
        let ratioProgress;
        if (isAscending) {
            ratioProgress = warpedProgress * (this.intervals.length - 1);
        } else {
            ratioProgress = (this.intervals.length - 1) * (1 - warpedProgress);
        }
        
        const viewProgress = isTransitioning ? warpedProgress : 0;
        
        const ratioIndex = Math.floor(ratioProgress);
        const ratioT = ratioProgress - ratioIndex;
        
        const safeRatioIndex = Math.min(Math.max(ratioIndex, 0), this.intervals.length - 1);
        const safeNextRatioIndex = Math.min(Math.max(ratioIndex + 1, 0), this.intervals.length - 1);
        
        const currentRatio = [
            this.intervals[safeRatioIndex][0] + (this.intervals[safeNextRatioIndex][0] - this.intervals[safeRatioIndex][0]) * ratioT,
            this.intervals[safeRatioIndex][1] + (this.intervals[safeNextRatioIndex][1] - this.intervals[safeRatioIndex][1]) * ratioT
        ];
        
        // Update info display
        if (this.infoDisplay && this.infoDisplay.element) {
            this.infoDisplay.element.textContent = `Ratio: ${currentRatio[0].toFixed(2)}:${currentRatio[1].toFixed(2)}`;
        }
        
        // Motion blur
        this.ctx.fillStyle = `rgba(0, 0, 0, ${this.motionBlurAlpha})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw pattern
        const w = this.canvas.width;
        const h = this.canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const scale = Math.min(w, h) * 0.35;
        const baseRadius = scale * 0.7;
        const points = 800;
        const cycles = Math.max(2, Math.ceil(Math.max(currentRatio[0], currentRatio[1])) * 2);
        
        // Apply export scale if set
        const exportScale = this.exportScale || 1;
        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.scale(exportScale, exportScale);
        this.ctx.translate(-cx, -cy);
        
        this.ctx.fillStyle = '#c0c0c0';
        
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2 * cycles;
            
            const current = this.getCoordinates(angle, currentRatio, this.views[currentViewIndex], scale, baseRadius);
            const next = this.getCoordinates(angle, currentRatio, this.views[nextViewIndex], scale, baseRadius);
            
            const x = cx + current.x * (1 - viewProgress) + next.x * viewProgress;
            const y = cy + current.y * (1 - viewProgress) + next.y * viewProgress;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 1, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Restore export scale transform
        this.ctx.restore();
    }
    
    destroy() {
        if (this.animator) {
            this.animator.destroy();
            this.animator = null;
        }
        super.destroy();
    }
}

window.HarmonicsAnimation = HarmonicsAnimation;

