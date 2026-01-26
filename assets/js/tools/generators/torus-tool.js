/**
 * Torus Animation Tool - ToolBase Implementation
 * 3D toroidal spirals in continuous rotation
 * 
 * @version 1.0.0 - ToolBase Refactor
 */

// ES Module imports
import { ToolBase } from '../core/tool-base.js';
import ComponentLibrary from '../../shared/component-library.js';
import { AnimationLoop } from '../../core/animation-foundation.js';

// Animation state
    let frame = 0;
    let animator = null;
    let majorRadius = 0;
    let minorRadius = 0;
    let numSpirals = 9;
    let cycleFrames = 3600;
    let viewAngleX = Math.PI / 6;
    let viewAngleY = Math.PI / 8;
    let centerX = 0;
    let centerY = 0;
    
    // ToolBase configuration
    const TOOL_CONFIG = {
        title: 'TOROIDAL SPIRALS',
        
        // Animation export config: cycle-based loop animation
        animation: {
            type: 'loop',
            loopFrames: 3600,  // Default cycleFrames
            defaultFps: 60,
            canPrerender: true
        },
        
        sidebar: [
            ['CONTROLS', [
                ['Torus', [
                    ['slider', 'Spirals', 3, 18, 1, { 
                        key: 'numSpirals', 
                        value: 9, 
                        withNumber: true 
                    }],
                    ['slider', 'Size', 0.1, 0.4, 0.01, { 
                        key: 'torusSize', 
                        value: 0.18, 
                        precision: 2,
                        withNumber: true 
                    }],
                ]],
                ['Rotation', [
                    ['slider', 'View X', 0, 360, 1, { 
                        key: 'viewX', 
                        value: 30, 
                        withNumber: true 
                    }],
                    ['slider', 'View Y', 0, 360, 1, { 
                        key: 'viewY', 
                        value: 22.5, 
                        withNumber: true 
                    }],
                    ['slider', 'Cycle Speed', 600, 7200, 60, { 
                        key: 'cycleFrames', 
                        value: 3600, 
                        withNumber: true 
                    }],
                ]],
                ['Actions', [
                    ['button', 'Reset Animation', null, { key: 'resetAnimation' }],
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
            const self = this;
            
            // Wire reset button
            const resetBtn = this.getComponent('resetAnimation');
            if (resetBtn && resetBtn.element) {
                resetBtn.element.addEventListener('click', function() {
                    frame = 0;
                    self.setStatus('Animation reset');
                });
            }
            
            // Initialize
            updateRadii(this.canvas.width, this.canvas.height, values.torusSize || 0.18);
            centerX = this.canvas.width / 2;
            centerY = this.canvas.height / 2;
            
            // Start animation loop
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
            // Only handle tool-specific controls - ToolBase handles canvas controls
            switch(key) {
                case 'numSpirals':
                    numSpirals = parseInt(value) || 9;
                    break;
                    
                case 'torusSize':
                    updateRadii(this.canvas.width, this.canvas.height, parseFloat(value) || 0.18);
                    break;
                    
                case 'viewX':
                    viewAngleX = (parseFloat(value) || 30) * Math.PI / 180;
                    break;
                    
                case 'viewY':
                    viewAngleY = (parseFloat(value) || 22.5) * Math.PI / 180;
                    break;
                    
                case 'cycleFrames':
                    cycleFrames = parseInt(value) || 3600;
                    break;
                    
                // Canvas resize - update radii
                case '_canvasResize':
                    updateRadii(value.width, value.height, allValues.torusSize || 0.18);
                    centerX = value.width / 2;
                    centerY = value.height / 2;
                    break;
            }
        },
        
        // Pre-render support: render a specific frame for animation export
        onRenderFrame: function(frameIndex, totalFrames) {
            const originalFrame = frame;
            frame = frameIndex % cycleFrames;
            
            const ctx = this.ctx;
            const canvas = this.canvas;
            const W = canvas.width;
            const H = canvas.height;
            centerX = W / 2;
            centerY = H / 2;
            
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, W, H);
            
            const torusRotation = (frame / cycleFrames) * Math.PI * 2;
            const spiralRotation = -(frame / cycleFrames) * Math.PI * 2;
            const xRotation = (frame / cycleFrames) * Math.PI * 2;
            
            drawTorusSpiral(ctx, torusRotation, xRotation);
            
            for (let i = 0; i < numSpirals; i++) {
                const offset = (i / numSpirals) * Math.PI * 2;
                drawToroidalSurfaceSpiral(ctx, spiralRotation, offset, xRotation, false);
                drawToroidalSurfaceSpiral(ctx, spiralRotation, offset, xRotation, true);
            }
            
            frame = originalFrame;
        },
        
        onDraw: function(ctx, canvas, values) {
            frame++;
            
            const W = canvas.width;
            const H = canvas.height;
            centerX = W / 2;
            centerY = H / 2;
            
            // Clear
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, W, H);
            
            const torusRotation = (frame / cycleFrames) * Math.PI * 2;
            const spiralRotation = -(frame / cycleFrames) * Math.PI * 2;
            const xRotation = (frame / cycleFrames) * Math.PI * 2;
            
            // Draw central torus spiral
            drawTorusSpiral(ctx, torusRotation, xRotation);
            
            // Draw spirals in both directions
            for (let i = 0; i < numSpirals; i++) {
                const offset = (i / numSpirals) * Math.PI * 2;
                drawToroidalSurfaceSpiral(ctx, spiralRotation, offset, xRotation, false);
                drawToroidalSurfaceSpiral(ctx, spiralRotation, offset, xRotation, true);
            }
        }
    };
    
    function updateRadii(width, height, sizeFactor) {
        const minDim = Math.min(width, height);
        majorRadius = minDim * sizeFactor;
        minorRadius = minDim * sizeFactor;
    }
    
    function project3D(x, y, z, xRotation) {
        // Rotate around X-axis
        let y0 = y * Math.cos(xRotation) - z * Math.sin(xRotation);
        let z0 = y * Math.sin(xRotation) + z * Math.cos(xRotation);
        
        // Apply camera angles
        let y1 = y0 * Math.cos(viewAngleX) - z0 * Math.sin(viewAngleX);
        let z1 = y0 * Math.sin(viewAngleX) + z0 * Math.cos(viewAngleX);
        let x2 = x * Math.cos(viewAngleY) + z1 * Math.sin(viewAngleY);
        
        return { x: centerX + x2, y: centerY - y1 };
    }
    
    function drawTorusSpiral(ctx, rotation, xRotation) {
        const numEllipses = 36;
        const R = majorRadius;
        const r = minorRadius;
        
        ctx.fillStyle = 'rgba(192, 192, 192, 0.25)';
        
        for (let i = 0; i < numEllipses; i++) {
            const theta = (i / numEllipses) * Math.PI * 2 + rotation;
            
            ctx.beginPath();
            
            const points = 50;
            for (let j = 0; j <= points; j++) {
                const phi = (j / points) * Math.PI * 2;
                
                const x = (R + r * Math.cos(phi)) * Math.cos(theta);
                const y = (R + r * Math.cos(phi)) * Math.sin(theta);
                const z = r * Math.sin(phi);
                
                const p = project3D(x, y, z, xRotation);
                
                if (j === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            }
            
            ctx.closePath();
            ctx.fill();
        }
    }
    
    function drawToroidalSurfaceSpiral(ctx, spiralRotation, offset, xRotation, reverse) {
        const R = majorRadius;
        const r = minorRadius;
        const winds = 4;
        const points = 1000;
        
        ctx.beginPath();
        
        for (let i = 0; i <= points; i++) {
            const t = i / points;
            const phi = t * Math.PI * 2;
            const windDirection = reverse ? -1 : 1;
            const theta = t * winds * windDirection * Math.PI * 2 + spiralRotation + offset;
            
            const x = (R + r * Math.cos(phi)) * Math.cos(theta);
            const y = (R + r * Math.cos(phi)) * Math.sin(theta);
            const z = r * Math.sin(phi);
            
            const p = project3D(x, y, z, xRotation);
            
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        }
        
        ctx.strokeStyle = '#c0c0c0';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    /**
     * TorusTool wrapper class
     */
    function TorusTool(container, deps) {
        this.container = container;
        this.deps = {
            ComponentLibrary,
            ...(deps || {})
        };
        this.tool = null;
        this.render();
    }
    
    TorusTool.prototype.render = function() {
        try {
            this.tool = new ToolBase(TOOL_CONFIG, this.deps);
            this.tool.mount(this.container);
            this.tool.draw();
            console.log('✅ TorusTool rendered');
        } catch (error) {
            console.error('❌ TorusTool error:', error);
            this.container.innerHTML =
                '<div style="padding: 20px; color: var(--c-text);">' +
                '<h2>TORUS TOOL ERROR</h2>' +
                '<p style="color: red;">' + error.message + '</p>' +
                '</div>';
        }
    };
    
    TorusTool.prototype.destroy = function() {
        if (animator) {
            animator.destroy();
            animator = null;
        }
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
        frame = 0;
    };
    
    // ES Module export
    export { TorusTool };
    export default TorusTool;
    
    // Global compatibility
    if (typeof window !== 'undefined') {
        window.TorusTool = TorusTool;
    }
    
    console.log('✅ TorusTool loaded (ToolBase)');
