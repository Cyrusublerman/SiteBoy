/**
 * Circles Animation - Proper SiteBoy Component
 * Nested rolling circles with three display modes
 * 
 * ARCHITECTURE:
 * - Extends BaseComponent ✅
 * - Uses AnimationContainer ✅
 * - Uses ComponentLibrary for GUI ✅
 * - Uses AnimationFoundation for loops ✅
 * - Uses MathematicalFoundation for dimensions ✅
 * - NO inline styles ✅
 * - NO manual DOM creation ✅
 * 
 * @version 1.0.0
 */

import { BaseComponent } from '../../../assets/js/shared/foundation.js';
import { AnimationContainer } from '../../../assets/js/shared/animation-container.js';
import { AnimationLoop } from '../../../assets/js/core/animation-foundation.js';

export class CirclesAnimation extends BaseComponent {
    constructor(container, deps = {}) {
        super({ componentType: 'animation-canvas' }, deps);
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.frame = 0;
        this.mode = 'lines';
        this.animator = null;
        
        // Animation parameters
        this.numCircles = 100;
        this.cycleFrames = 3600;
        this.loopFrames = 3600; // Full loop length for export UI
        this.exportScale = 1; // Scale factor for export aspect ratios
        
        // Radius will be calculated based on canvas size
        this.largestRadius = null;
        this.radiusDecrement = null;
        this.circles = [];
    }
    
    render() {
        this.destroy();
        
        const dims = this.calculateDimensions('animation-canvas');
        const F = dims.F || 12;
        
        // Create canvas first (needed for export)
        this.canvas = this.createElement('canvas', 'animation-canvas');
        this.canvas.width = dims.dimensions ? dims.dimensions.width : (F * 67);
        this.canvas.height = dims.dimensions ? dims.dimensions.height : (F * 67);
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        
        // Calculate radius based on canvas size
        const minDim = Math.min(this.canvas.width, this.canvas.height);
        this.largestRadius = minDim * 0.42; // 42% of smallest dimension
        this.radiusDecrement = this.largestRadius / this.numCircles;
        
        // Build circle data now that we know the size
        this.circles = Array.from({ length: this.numCircles }, (_, i) => ({
            radius: this.largestRadius - i * this.radiusDecrement,
            parent: i === 0 ? null : i - 1
        }));
        
        // Create animation container with export enabled
        const animContainer = new AnimationContainer({
            enableExport: true,
            animationInstance: this,
            loopFrames: this.loopFrames
        }, this.deps);
        this.addChild(animContainer);
        
        animContainer.setCanvas(this.canvas);
        
        // Create controls using ComponentLibrary
        const { ButtonGroup } = window.ComponentLibrary;
        
        const modeButtons = new ButtonGroup({
            buttons: [
                { label: 'LINES', value: 'lines', active: this.mode === 'lines' },
                { label: 'B/W', value: 'bw', active: this.mode === 'bw' },
                { label: 'GRADIENT', value: 'gradient', active: this.mode === 'gradient' }
            ],
            onSelect: (value) => { this.mode = value; }
        }, this.deps);
        this.addChild(modeButtons);
        
        animContainer.addToSidebar(modeButtons.render());
        
        // Render container
        const rendered = animContainer.render();
        this.container.appendChild(rendered);
        
        // Start animation using AnimationFoundation
        this.startAnimation();
        
        return rendered;
    }
    
    startAnimation() {
        this.animator = new AnimationLoop({
            onFrame: () => this.draw()
        });
        this.animator.start();
    }
    
    /**
     * Recalculate dimensions when canvas is resized for export
     */
    onResize(width, height) {
        if (!this.canvas) return;
        
        // Update canvas size
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Recalculate radius based on new canvas size
        const minDim = Math.min(width, height);
        this.largestRadius = minDim * 0.42;
        this.radiusDecrement = this.largestRadius / this.numCircles;
        
        // Rebuild circle data
        this.circles = Array.from({ length: this.numCircles }, (_, i) => ({
            radius: this.largestRadius - i * this.radiusDecrement,
            parent: i === 0 ? null : i - 1
        }));
    }
    
    draw() {
        if (!this.ctx) return;
        
        this.frame++;
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Clear
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply export scale if set
        const scale = this.exportScale || 1;
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.scale(scale, scale);
        this.ctx.translate(-centerX, -centerY);
        
        // Calculate transforms
        const transforms = [];
        
        for (let i = 0; i < this.circles.length; i++) {
            const circle = this.circles[i];
            
            if (circle.parent === null) {
                transforms[i] = { x: centerX, y: centerY, rotation: 0 };
            } else {
                const parent = this.circles[circle.parent];
                const parentTransform = transforms[circle.parent];
                const orbitRadius = parent.radius - circle.radius;
                const orbitAngle = (this.frame / this.cycleFrames) * Math.PI * 2;
                const rollRotation = orbitAngle;
                
                const localX = orbitRadius * Math.cos(orbitAngle);
                const localY = orbitRadius * Math.sin(orbitAngle);
                const cos = Math.cos(parentTransform.rotation);
                const sin = Math.sin(parentTransform.rotation);
                
                transforms[i] = {
                    x: parentTransform.x + localX * cos - localY * sin,
                    y: parentTransform.y + localX * sin + localY * cos,
                    rotation: parentTransform.rotation + rollRotation
                };
            }
        }
        
        // Draw circles
        this.circles.forEach((circle, i) => {
            const t = transforms[i];
            this.ctx.save();
            this.ctx.translate(t.x, t.y);
            this.ctx.rotate(t.rotation);
            this.ctx.beginPath();
            this.ctx.arc(0, 0, circle.radius, 0, Math.PI * 2);
            
            if (this.mode === 'lines') {
                this.ctx.strokeStyle = '#f5f5f5';
                this.ctx.lineWidth = 1.5;
                this.ctx.stroke();
            } else if (this.mode === 'bw') {
                const isWhite = i % 2 === 0;
                this.ctx.fillStyle = isWhite ? '#f5f5f5' : '#000000';
                this.ctx.fill();
                if (!isWhite) {
                    this.ctx.strokeStyle = '#f5f5f5';
                    this.ctx.lineWidth = 1.5;
                    this.ctx.stroke();
                }
            } else if (this.mode === 'gradient') {
                this.ctx.fillStyle = 'rgba(245, 245, 245, 0.01)';
                this.ctx.fill();
            }
            
            this.ctx.restore();
        });
        
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

// Export globally for art_section.js compatibility
window.CirclesAnimation = CirclesAnimation;

