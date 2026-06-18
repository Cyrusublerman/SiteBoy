/**
 * Nested Circles Tool - ToolBase Declarative Format
 *
 * Animated nested circles visualization with multiple display modes.
 * Each circle orbits within its parent, creating hypnotic patterns.
 *
 * Based on: art/Generative/source/circles
 * @version 1.0.0
 */

// ES Module imports
import { ToolBase } from '../tool-base.js';
import ComponentLibrary from '../../shared/component-library.js';
import { AnimationLoop } from '../../core/animation-foundation.js';

(function() {
    'use strict';

    // Animation state (persists across redraws)
    let frame = 0;
    let animator = null;

    const TOOL_CONFIG = {
        title: 'NESTED CIRCLES',
        
        sidebar: [
            ['Parameters', [
                ['Circles', [
                    ['slider', 'Count', 10, 200, 1, { key: 'numCircles', defaultValue: 100, withNumber: true }],
                    ['slider', 'Largest Radius', 100, 400, 10, { key: 'largestRadius', defaultValue: 350, withNumber: true }],
                    ['slider', 'Radius Step', 1, 10, 0.5, { key: 'radiusDecrement', defaultValue: 3.5, withNumber: true }],
                ]],
                ['Animation', [
                    ['slider', 'Cycle Frames', 100, 10000, 100, { key: 'cycleFrames', defaultValue: 3600, withNumber: true }],
                    ['slider', 'Speed', 0.1, 5, 0.1, { key: 'speed', defaultValue: 1, withNumber: true }],
                    ['toggle', 'Play', ['▶', '⏸'], { key: 'playing', defaultIndex: 0 }],
                ]],
                ['Display', [
                    ['toggle', 'Mode', ['Lines', 'B/W', 'Gradient'], { key: 'mode', defaultIndex: 0 }],
                    ['slider', 'Line Width', 0.5, 5, 0.5, { key: 'lineWidth', defaultValue: 1.5, withNumber: true }],
                    ['slider', 'Opacity', 0.01, 0.1, 0.01, { key: 'gradientOpacity', defaultValue: 0.01, withNumber: true }],
                ]],
            ]],
        ],
        
        canvas: {
            width: 800,
            height: 800,
            displayMode: 'fit'
        },
        
        onInit: function(values, tool) {
            window.debugLog('TOOLS', '🔵 Nested Circles Tool initialized');
            frame = 0;
            
            // Start animation loop
            if (AnimationLoop) {
                animator = new AnimationLoop({
                    fps: 60,
                    onFrame: () => {
                        if (values.playing === '▶') {
                            frame += values.speed || 1;
                            tool.redraw();
                        }
                    }
                });
                animator.start();
            } else {
                // Fallback without AnimationFoundation
                const animate = () => {
                    if (tool._destroyed) return;
                    if (tool.values && tool.values.playing === '▶') {
                        frame += tool.values.speed || 1;
                        tool.redraw();
                    }
                    requestAnimationFrame(animate);
                };
                requestAnimationFrame(animate);
            }
        },
        
        onUpdate: function(key, value, values, tool) {
            // Redraw on parameter change
            if (key !== 'playing') {
                tool.redraw();
            }
        },
        
        onDraw: function(ctx, canvas, values) {
            const W = canvas.width;
            const H = canvas.height;
            const centerX = W / 2;
            const centerY = H / 2;
            
            // Parameters
            const numCircles = values.numCircles || 100;
            const largestRadius = values.largestRadius || 350;
            const radiusDecrement = values.radiusDecrement || 3.5;
            const cycleFrames = values.cycleFrames || 3600;
            const lineWidth = values.lineWidth || 1.5;
            const gradientOpacity = values.gradientOpacity || 0.01;
            const mode = values.mode || 'Lines';
            
            // Build circle data
            const circles = [];
            for (let i = 0; i < numCircles; i++) {
                circles.push({
                    radius: Math.max(1, largestRadius - i * radiusDecrement),
                    parent: i === 0 ? null : i - 1
                });
            }
            
            // Clear canvas
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, W, H);
            
            // Calculate all transforms
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
            
            // Draw based on mode
            circles.forEach((circle, i) => {
                const t = transforms[i];
                ctx.save();
                ctx.translate(t.x, t.y);
                ctx.rotate(t.rotation);
                ctx.beginPath();
                ctx.arc(0, 0, circle.radius, 0, Math.PI * 2);
                
                if (mode === 'Lines') {
                    // White outlines only, no fill
                    ctx.strokeStyle = '#f5f5f5';
                    ctx.lineWidth = lineWidth;
                    ctx.stroke();
                } else if (mode === 'B/W') {
                    // Alternating fully opaque black/white filled circles
                    const isWhite = i % 2 === 0;
                    if (isWhite) {
                        ctx.fillStyle = '#f5f5f5';
                        ctx.fill();
                    } else {
                        ctx.fillStyle = '#000000';
                        ctx.fill();
                        // Add white stroke so black circles are visible
                        ctx.strokeStyle = '#f5f5f5';
                        ctx.lineWidth = lineWidth;
                        ctx.stroke();
                    }
                } else if (mode === 'Gradient') {
                    // Transparency per layer - all white circles building up
                    ctx.fillStyle = `rgba(245, 245, 245, ${gradientOpacity})`;
                    ctx.fill();
                }
                
                ctx.restore();
            });
        },
        
        onDestroy: function() {
            if (animator) {
                animator.destroy();
                animator = null;
            }
        }
    };

    // Register the tool
    window.NestedCirclesTool = function(container, deps = {}) {
        const ToolBase = window.ToolBase;
        if (!ToolBase) {
            console.error('ToolBase not available');
            return null;
        }
        
        const tool = new ToolBase(TOOL_CONFIG, deps);
        const element = tool.render();
        if (container) {
            container.appendChild(element);
        }
        return tool;
    };

    // Also expose the config
    window.NestedCirclesToolConfig = TOOL_CONFIG;

    window.debugLog('TOOLS', '🔵 Nested Circles Tool ready');
})();

