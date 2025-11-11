/**
 * Torus Animation - 3D Toroidal Spirals
 * Refactored for SiteBoy Framework
 * 
 * @version 1.0.0
 */

(function() {
    'use strict';

    class TorusAnimation {
        constructor(containerElement, options = {}) {
            this.container = containerElement;
            this.options = {
                width: options.width || 600,
                height: options.height || 600,
                majorRadius: options.majorRadius || 150,
                minorRadius: options.minorRadius || 150,
                cycleFrames: options.cycleFrames || 3600,
                numSpirals: options.numSpirals || 9,
                ...options
            };
            
            this.canvas = null;
            this.ctx = null;
            this.frame = 0;
            this.isRunning = false;
            this.animationId = null;
            this.centerX = 0;
            this.centerY = 0;
            this.viewAngleX = Math.PI / 6;
            this.viewAngleY = Math.PI / 8;
            
            this.init();
        }

        init() {
            // Create canvas
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.options.width;
            this.canvas.height = this.options.height;
            this.canvas.style.cssText = `
                display: block;
                width: 100%;
                height: auto;
                border: 1px solid var(--c-border);
                background: var(--c-bg);
            `;
            this.ctx = this.canvas.getContext('2d', { alpha: false });
            
            this.centerX = this.canvas.width / 2;
            this.centerY = this.canvas.height / 2;
            
            // Append to container
            this.container.appendChild(this.canvas);
        }

        project3D(x, y, z, xRotation = 0) {
            // Rotate around X-axis first (spin the whole shape)
            let y0 = y * Math.cos(xRotation) - z * Math.sin(xRotation);
            let z0 = y * Math.sin(xRotation) + z * Math.cos(xRotation);
            
            // Then apply camera angles
            let y1 = y0 * Math.cos(this.viewAngleX) - z0 * Math.sin(this.viewAngleX);
            let z1 = y0 * Math.sin(this.viewAngleX) + z0 * Math.cos(this.viewAngleX);
            let x2 = x * Math.cos(this.viewAngleY) + z1 * Math.sin(this.viewAngleY);
            let z2 = -x * Math.sin(this.viewAngleY) + z1 * Math.cos(this.viewAngleY);
            
            return { x: this.centerX + x2, y: this.centerY - y1 };
        }

        drawTorusSpiral(rotation, xRotation) {
            const numEllipses = 36;
            const R = this.options.majorRadius;
            const r = this.options.minorRadius;
            
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
            const R = this.options.majorRadius;
            const r = this.options.minorRadius;
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
            this.frame++;
            
            // Clear
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            const torusRotation = (this.frame / this.options.cycleFrames) * Math.PI * 2;
            const spiralRotation = -(this.frame / this.options.cycleFrames) * Math.PI * 2;
            const xRotation = (this.frame / this.options.cycleFrames) * Math.PI * 2;
            
            // Draw central torus spiral
            this.drawTorusSpiral(torusRotation, xRotation);
            
            // Draw spirals in one direction
            for (let i = 0; i < this.options.numSpirals; i++) {
                const offset = (i / this.options.numSpirals) * Math.PI * 2;
                this.drawToroidalSurfaceSpiral(spiralRotation, offset, xRotation, false);
            }
            
            // Draw spirals in opposite direction
            for (let i = 0; i < this.options.numSpirals; i++) {
                const offset = (i / this.options.numSpirals) * Math.PI * 2;
                this.drawToroidalSurfaceSpiral(spiralRotation, offset, xRotation, true);
            }
        }

        start() {
            if (this.isRunning) return;
            this.isRunning = true;
            this.animate();
        }

        stop() {
            this.isRunning = false;
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        }

        animate() {
            if (!this.isRunning) return;
            this.draw();
            this.animationId = requestAnimationFrame(() => this.animate());
        }

        destroy() {
            this.stop();
            if (this.canvas && this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
            }
            this.canvas = null;
            this.ctx = null;
        }
    }

    // Export to window
    window.TorusAnimation = TorusAnimation;
    console.log('🍩 Torus Animation loaded');
})();




