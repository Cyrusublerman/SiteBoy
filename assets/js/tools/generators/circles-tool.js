/**
 * Circles Animation Tool - ToolBase Implementation
 * Nested rolling circles with three display modes
 *
 * @version 2.0.0 - ES Module conversion
 */

// ES Module imports
import { ToolBase } from '../core/tool-base.js';
import ComponentLibrary from '../../shared/component-library.js';
import { AnimationLoop } from '../../core/animation-foundation.js';

// Animation state
let frame = 0;
let mode = 'lines';
let animator = null;
let numCircles = 100;
let cycleFrames = 3600;
let circles = [];
let largestRadius = 0;
let radiusDecrement = 0;

// ES Module class definition
    
    // ToolBase configuration
    const TOOL_CONFIG = {
        title: 'NESTED CIRCLES',
        
        // Animation export config: cycle-based loop animation
        animation: {
            type: 'loop',
            loopFrames: 3600,  // Default cycleFrames
            defaultFps: 60,
            canPrerender: true
        },
        
        sidebar: [
            ['CONTROLS', [
                ['Display', [
                    ['radio', 'Mode', ['Lines', 'B/W', 'Gradient'], { 
                        key: 'displayMode', 
                        selectedValue: 'Lines' 
                    }],
                ]],
                ['Animation', [
                    ['slider', 'Circle Count', 10, 200, 1, { 
                        key: 'circleCount', 
                        value: 100, 
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
            // CANVAS tab is auto-injected by ToolBase when showControls: true
        ],
        
        canvas: {
            width: 800,
            height: 800,
            showControls: true  // ToolBase handles all canvas controls
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
            
            // Initialize circles
            initCircles(this.canvas.width, this.canvas.height, values.circleCount || 100);
            
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
            // Only handle tool-specific controls - ToolBase handles canvas controls
            switch(key) {
                case 'displayMode':
                    mode = (value || 'Lines').toLowerCase();
                    break;
                    
                case 'circleCount':
                    numCircles = parseInt(value) || 100;
                    initCircles(this.canvas.width, this.canvas.height, numCircles);
                    break;
                    
                case 'cycleFrames':
                    cycleFrames = parseInt(value) || 3600;
                    break;
                    
                // Canvas resize - reinitialize circles when canvas size changes
                case '_canvasResize':
                    initCircles(value.width, value.height, numCircles);
                    break;
            }
        },
        
        // Pre-render support: render a specific frame for animation export
        onRenderFrame: function(frameIndex, totalFrames) {
            // Set frame to the export frame index (wraps at cycleFrames)
            const originalFrame = frame;
            frame = frameIndex % cycleFrames;
            // Draw without incrementing
            const ctx = this.ctx;
            const canvas = this.canvas;
            const W = canvas.width;
            const H = canvas.height;
            const centerX = W / 2;
            const centerY = H / 2;
            
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, W, H);
            
            const transforms = [];
            for (let i = 0; i < circles.length; i++) {
                const circle = circles[i];
                if (circle.parent === null) {
                    transforms[i] = { x: centerX, y: centerY, rotation: 0 };
                } else {
                    const parent = circles[circle.parent];
                    const parentTransform = transforms[circle.parent];
                    const orbitRadius = parent.radius - circle.radius;
                    const orbitAngle = (frame / cycleFrames) * Math.PI * 2;
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
            
            circles.forEach(function(circle, i) {
                const t = transforms[i];
                ctx.save();
                ctx.translate(t.x, t.y);
                ctx.rotate(t.rotation);
                ctx.beginPath();
                ctx.arc(0, 0, circle.radius, 0, Math.PI * 2);
                if (mode === 'lines') {
                    ctx.strokeStyle = '#f5f5f5';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                } else if (mode === 'b/w') {
                    const isWhite = i % 2 === 0;
                    ctx.fillStyle = isWhite ? '#f5f5f5' : '#000000';
                    ctx.fill();
                    if (!isWhite) {
                        ctx.strokeStyle = '#f5f5f5';
                        ctx.lineWidth = 1.5;
                        ctx.stroke();
                    }
                } else if (mode === 'gradient') {
                    ctx.fillStyle = 'rgba(245, 245, 245, 0.01)';
                    ctx.fill();
                }
                ctx.restore();
            });
            
            frame = originalFrame;
        },
        
        onDraw: function(ctx, canvas, values) {
            frame++;
            
            const W = canvas.width;
            const H = canvas.height;
            const centerX = W / 2;
            const centerY = H / 2;
            
            // Clear
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, W, H);
            
            // Calculate transforms
            const transforms = [];
            
            for (let i = 0; i < circles.length; i++) {
                const circle = circles[i];
                
                if (circle.parent === null) {
                    transforms[i] = { x: centerX, y: centerY, rotation: 0 };
                } else {
                    const parent = circles[circle.parent];
                    const parentTransform = transforms[circle.parent];
                    const orbitRadius = parent.radius - circle.radius;
                    const orbitAngle = (frame / cycleFrames) * Math.PI * 2;
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
            circles.forEach(function(circle, i) {
                const t = transforms[i];
                ctx.save();
                ctx.translate(t.x, t.y);
                ctx.rotate(t.rotation);
                ctx.beginPath();
                ctx.arc(0, 0, circle.radius, 0, Math.PI * 2);
                
                if (mode === 'lines') {
                    ctx.strokeStyle = '#f5f5f5';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                } else if (mode === 'b/w') {
                    const isWhite = i % 2 === 0;
                    ctx.fillStyle = isWhite ? '#f5f5f5' : '#000000';
                    ctx.fill();
                    if (!isWhite) {
                        ctx.strokeStyle = '#f5f5f5';
                        ctx.lineWidth = 1.5;
                        ctx.stroke();
                    }
                } else if (mode === 'gradient') {
                    ctx.fillStyle = 'rgba(245, 245, 245, 0.01)';
                    ctx.fill();
                }
                
                ctx.restore();
            });
        }
    };
    
    /**
     * Initialize circles array
     */
    function initCircles(width, height, count) {
        const minDim = Math.min(width, height);
        largestRadius = minDim * 0.42;
        radiusDecrement = largestRadius / count;
        
        circles = [];
        for (let i = 0; i < count; i++) {
            circles.push({
                radius: largestRadius - i * radiusDecrement,
                parent: i === 0 ? null : i - 1
            });
        }
    }
    
// CirclesTool class definition
export class CirclesTool {
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
            window.debugLog('TOOLS', '✅ CirclesTool rendered');
        } catch (error) {
            console.error('❌ CirclesTool error:', error);
            this.container.innerHTML =
                '<div style="padding: 20px; color: var(--c-text);">' +
                '<h2>CIRCLES TOOL ERROR</h2>' +
                '<p style="color: red;">' + error.message + '</p>' +
                '</div>';
        }
    };
    
    destroy() {
        if (animator) {
            animator.destroy();
            animator = null;
        }
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
        frame = 0;
        circles = [];
    }
}

window.debugLog('TOOLS', '✅ CirclesTool loaded (ES Module)');
