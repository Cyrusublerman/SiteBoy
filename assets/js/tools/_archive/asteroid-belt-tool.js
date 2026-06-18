/**
 * Asteroid Belt Tool - ToolBase Declarative Format
 *
 * Canvas-based asteroid belt visualization with noise pattern
 * Uses AnimationFoundation for smooth rotation
 *
 * @version 3.0.0 - ToolBase conversion
 */

// ES Module imports
import { ToolBase } from '../tool-base.js';
import ComponentLibrary from '../../shared/component-library.js';
import { AnimationLoop } from '../../core/animation-foundation.js';

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════════════════════

    let particles = [];
    let cached = null;
    let rotationAngle = 0;
    let animator = null;

    const TWO_PI = Math.PI * 2;

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOOL CONFIG
    // ═══════════════════════════════════════════════════════════════════════════════

    const TOOL_CONFIG = {
        title: 'ASTEROID BELT',
        
        sidebar: [
            ['CONTROLS', [
                ['Belt Parameters', [
                    ['slider', 'Inner Radius', 0.5, 5.0, 0.1, { value: 2.2, withNumber: true, key: 'innerRadius' }],
                    ['slider', 'Outer Radius', 1.0, 8.0, 0.1, { value: 3.2, withNumber: true, key: 'outerRadius' }],
                    ['slider', 'Particle Count', 50, 2000, 50, { value: 300, withNumber: true, key: 'particleCount' }],
                ]],
                ['Display', [
                    ['slider', 'Scale', 20, 200, 10, { value: 80, withNumber: true, key: 'scale' }],
                    ['color', 'Background', '#000000', { key: 'bgColor' }],
                ]],
                ['Animation', [
                    ['toggle', 'Rotation', ['Enabled'], { key: 'rotationEnabled', selectedValues: [] }],
                    ['slider', 'Speed', 0.1, 5.0, 0.1, { value: 0.5, precision: 1, withNumber: true, key: 'speed' }],
                ]],
                ['Actions', [
                    ['button', 'Regenerate', null, { key: 'regenerate' }],
                    ['button', 'Clear', null, { key: 'clear' }],
                ]],
            ]],
        ],
        
        canvas: { size: 420 },
        
        onInit: function(values) {
            // Generate initial particles
            generateParticles(values);
            
            // Wire up buttons
            const self = this;
            const regenerateBtn = this.getComponent('regenerate');
            if (regenerateBtn && regenerateBtn.element) {
                regenerateBtn.element.addEventListener('click', function() {
                    generateParticles(self.getValues());
                    self.draw();
                });
            }
            
            const clearBtn = this.getComponent('clear');
            if (clearBtn && clearBtn.element) {
                clearBtn.element.addEventListener('click', function() {
                    particles = [];
                    cached = null;
                    self.draw();
                });
            }
            
            // Initialize animator
            initAnimator(this);
        },
        
        onUpdate: function(key, value, allValues) {
            // Regenerate on parameter changes
            if (key === 'innerRadius' || key === 'outerRadius' || key === 'particleCount') {
                generateParticles(allValues);
            }
            
            // Handle scale change (invalidate cache)
            if (key === 'scale') {
                cached = null;
            }
            
            // Handle animation toggle
            if (key === 'rotationEnabled') {
                const enabled = Array.isArray(value) && value.indexOf('Enabled') >= 0;
                if (enabled) {
                    startAnimation(this);
                } else {
                    stopAnimation();
                }
            }
        },
        
        onDraw: function(ctx, canvas, values) {
            const w = canvas.width;
            const h = canvas.height;
            const cx = w / 2;
            const cy = h / 2;
            
            // Clear canvas
            ctx.fillStyle = values.bgColor || '#000000';
            ctx.fillRect(0, 0, w, h);
            
            // Draw center point (sun)
            ctx.fillStyle = '#FFFF00';
            ctx.beginPath();
            ctx.arc(cx, cy, 5, 0, TWO_PI);
            ctx.fill();
            
            // Generate cache if needed
            const scale = values.scale || 80;
            if (!cached) {
                cached = [];
                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    const scaledDist = p.distance * scale;
                    cached.push({
                        x: scaledDist * Math.cos(p.angle),
                        y: scaledDist * Math.sin(p.angle),
                        color: p.color
                    });
                }
            }
            
            // Apply rotation if animating
            const rotationEnabled = Array.isArray(values.rotationEnabled) && 
                                   values.rotationEnabled.indexOf('Enabled') >= 0;
            const rotation = rotationEnabled ? rotationAngle : 0;
            
            // Render particles
            for (let i = 0; i < cached.length; i++) {
                let x = cached[i].x;
                let y = cached[i].y;
                
                // Apply rotation
                if (rotation !== 0) {
                    const cos = Math.cos(rotation);
                    const sin = Math.sin(rotation);
                    const rotatedX = x * cos - y * sin;
                    const rotatedY = x * sin + y * cos;
                    x = rotatedX;
                    y = rotatedY;
                }
                
                // Translate to center and draw
                const screenX = cx + x;
                const screenY = cy + y;
                
                ctx.fillStyle = cached[i].color;
                ctx.fillRect(screenX - 0.5, screenY - 0.5, 1, 1);
            }
            
            // Draw reference circles
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            
            const innerRadius = values.innerRadius || 2.2;
            const outerRadius = values.outerRadius || 3.2;
            
            // Inner radius circle
            ctx.beginPath();
            ctx.arc(cx, cy, innerRadius * scale, 0, TWO_PI);
            ctx.stroke();
            
            // Outer radius circle
            ctx.beginPath();
            ctx.arc(cx, cy, outerRadius * scale, 0, TWO_PI);
            ctx.stroke();
        },
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // HELPER FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    function generateParticles(values) {
        particles = [];
        cached = null;
        
        const colors = ['#FFFFFF', '#000000'];
        const innerRadius = values.innerRadius || 2.2;
        const outerRadius = values.outerRadius || 3.2;
        const particleCount = values.particleCount || 300;
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                angle: Math.random() * TWO_PI,
                distance: innerRadius + Math.random() * (outerRadius - innerRadius),
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }
    }

    function initAnimator(toolInstance) {
        if (AnimationLoop) {
            animator = new AnimationLoop({
                onFrame: function(deltaTime) {
                    const values = toolInstance.getValues();
                    const speed = values.speed || 0.5;
                    rotationAngle += speed * 0.01 * (deltaTime / 16.67);
                    toolInstance.draw();
                },
                fps: 60
            });
        }
    }

    function startAnimation(toolInstance) {
        if (animator) {
            animator.start();
        }
    }

    function stopAnimation() {
        if (animator) {
            animator.stop();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOOL CLASS
    // ═══════════════════════════════════════════════════════════════════════════════

    function AsteroidBeltTool(container, deps) {
        this.container = container;
        this.deps = deps || {};
        this.tool = null;
        this.render();
    }
    
    AsteroidBeltTool.prototype.render = function() {
        try {
            this.tool = new window.ToolBase(TOOL_CONFIG, this.deps);
            this.tool.mount(this.container);
            this.tool.draw();
        } catch (error) {
            console.error('AsteroidBeltTool error:', error);
            this.container.innerHTML = '<p style="color: var(--c-text); padding: 20px;">Error: ' + error.message + '</p>';
        }
    };
    
    AsteroidBeltTool.prototype.destroy = function() {
        // Stop animation
        stopAnimation();
        if (animator) {
            animator.destroy();
            animator = null;
        }
        
        // Reset state
        particles = [];
        cached = null;
        rotationAngle = 0;
        
        // Destroy tool
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
    };

    // Export
    window.AsteroidBeltTool = AsteroidBeltTool;
    
    window.debugLog('TOOLS', '✅ AsteroidBeltTool loaded (ToolBase)');
})();
