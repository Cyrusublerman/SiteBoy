/**
 * Torus Animation - Proper SiteBoy Component
 * 3D toroidal spirals in continuous rotation
 * 
 * @version 1.0.0
 */

import { BaseComponent } from '../../../assets/js/shared/foundation.js';
import { AnimationContainer } from '../../../assets/js/shared/animation-container.js';
import { AnimationLoop } from '../../../assets/js/core/animation-foundation.js';

export class TorusAnimation extends BaseComponent {
    constructor(container, deps = {}) {
        super({ componentType: 'animation-canvas' }, deps);
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.frame = 0;
        this.animator = null;
        
        // Animation parameters (will be scaled to canvas)
        this.majorRadius = null;
        this.minorRadius = null;
        this.numSpirals = 9;
        this.cycleFrames = 3600;
        this.loopFrames = 3600; // Full loop length for export UI
        this.viewAngleX = Math.PI / 6;
        this.viewAngleY = Math.PI / 8;
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
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        
        // Scale radii based on canvas size
        const minDim = Math.min(this.canvas.width, this.canvas.height);
        this.majorRadius = minDim * 0.18; // 18% of smallest dimension
        this.minorRadius = minDim * 0.18;
        
        // Create animation container with export enabled
        const animContainer = new AnimationContainer({
            enableExport: true,
            animationInstance: this,
            loopFrames: this.loopFrames
        }, this.deps);
        this.addChild(animContainer);
        
        animContainer.setCanvas(this.canvas);
        
        // No controls for this animation - pure visual
        
        // Render container
        const rendered = animContainer.render();
        this.container.appendChild(rendered);
        
        // Start animation
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
        
        // Update center
        this.centerX = width / 2;
        this.centerY = height / 2;
        
        // Recalculate radii based on new canvas size
        const minDim = Math.min(width, height);
        this.majorRadius = minDim * 0.18;
        this.minorRadius = minDim * 0.18;
    }
    
    project3D(x, y, z, xRotation = 0) {
        // Rotate around X-axis
        let y0 = y * Math.cos(xRotation) - z * Math.sin(xRotation);
        let z0 = y * Math.sin(xRotation) + z * Math.cos(xRotation);
        
        // Apply camera angles
        let y1 = y0 * Math.cos(this.viewAngleX) - z0 * Math.sin(this.viewAngleX);
        let z1 = y0 * Math.sin(this.viewAngleX) + z0 * Math.cos(this.viewAngleX);
        let x2 = x * Math.cos(this.viewAngleY) + z1 * Math.sin(this.viewAngleY);
        
        return { x: this.centerX + x2, y: this.centerY - y1 };
    }
    
    drawTorusSpiral(rotation, xRotation) {
        const numEllipses = 36;
        const R = this.majorRadius;
        const r = this.minorRadius;
        
        this.ctx.fillStyle = 'rgba(192, 192, 192, 0.25)';
        
        for (let i = 0; i < numEllipses; i++) {
            const theta = (i / numEllipses) * Math.PI * 2 + rotation;
            
            this.ctx.beginPath();
            
            const points = 50;
            for (let j = 0; j <= points; j++) {
                const phi = (j / points) * Math.PI * 2;
                
                const x = (R + r * Math.cos(phi)) * Math.cos(theta);
                const y = (R + r * Math.cos(phi)) * Math.sin(theta);
                const z = r * Math.sin(phi);
                
                const p = this.project3D(x, y, z, xRotation);
                
                if (j === 0) this.ctx.moveTo(p.x, p.y);
                else this.ctx.lineTo(p.x, p.y);
            }
            
            this.ctx.closePath();
            this.ctx.fill();
        }
    }
    
    drawToroidalSurfaceSpiral(spiralRotation, offset, xRotation, reverse = false) {
        const R = this.majorRadius;
        const r = this.minorRadius;
        const winds = 4;
        const points = 1000;
        
        this.ctx.beginPath();
        
        for (let i = 0; i <= points; i++) {
            const t = i / points;
            const phi = t * Math.PI * 2;
            const windDirection = reverse ? -1 : 1;
            const theta = t * winds * windDirection * Math.PI * 2 + spiralRotation + offset;
            
            const x = (R + r * Math.cos(phi)) * Math.cos(theta);
            const y = (R + r * Math.cos(phi)) * Math.sin(theta);
            const z = r * Math.sin(phi);
            
            const p = this.project3D(x, y, z, xRotation);
            
            if (i === 0) this.ctx.moveTo(p.x, p.y);
            else this.ctx.lineTo(p.x, p.y);
        }
        
        this.ctx.strokeStyle = '#c0c0c0';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
    
    draw() {
        if (!this.ctx) return;
        
        this.frame++;
        
        // Clear
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply export scale if set
        const scale = this.exportScale || 1;
        this.ctx.save();
        this.ctx.translate(this.centerX, this.centerY);
        this.ctx.scale(scale, scale);
        this.ctx.translate(-this.centerX, -this.centerY);
        
        const torusRotation = (this.frame / this.cycleFrames) * Math.PI * 2;
        const spiralRotation = -(this.frame / this.cycleFrames) * Math.PI * 2;
        const xRotation = (this.frame / this.cycleFrames) * Math.PI * 2;
        
        // Draw central torus spiral
        this.drawTorusSpiral(torusRotation, xRotation);
        
        // Draw spirals in both directions
        for (let i = 0; i < this.numSpirals; i++) {
            const offset = (i / this.numSpirals) * Math.PI * 2;
            this.drawToroidalSurfaceSpiral(spiralRotation, offset, xRotation, false);
            this.drawToroidalSurfaceSpiral(spiralRotation, offset, xRotation, true);
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

window.TorusAnimation = TorusAnimation;

