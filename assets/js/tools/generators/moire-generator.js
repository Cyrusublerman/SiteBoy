/**
 * Moiré Generator - Interference Pattern Tool
 *
 * Generates moiré patterns using radial, angular, and multi-centre gratings.
 * Supports animation and multiple combination modes.
 *
 * @version 2.0.0 - ES Module Migration
 */

// ES Module imports
import { ToolBase } from '../core/tool-base.js';
import ComponentLibrary from '../../shared/component-library.js';
import { AnimationLoop } from '../../core/animation-foundation.js';
import { ExportUtils, Patterns } from '../../shared/algorithms/index.js';

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE-LEVEL STATE
// ═══════════════════════════════════════════════════════════════════════════════

let animator = null;
let animationTime = 0;

    // ═══════════════════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════════════

export const TOOL_CONFIG = {
        title: 'MOIRÉ GENERATOR',
        
        sidebar: [
            // TAB 1: CONTROLS — Pattern Parameters
            ['CONTROLS', [
                ['Gratings', [
                    ['stepper', 'Count', 1, 4, 1, { value: 2, key: 'gratingCount' }],
                    ['slider', 'Wavelength', 0.005, 0.1, 0.001, { value: 0.02, key: 'wavelength', withNumber: true, precision: 3 }],
                    ['slider', 'Angular Freq', 0, 24, 1, { value: 0, key: 'angularFreq', withNumber: true }],
                    ['slider', 'Phase', 0, 1, 0.01, { value: 0, key: 'phaseOffset', withNumber: true }],
                ]],
                ['Combination', [
                    ['dropdown', 'Mode', ['Sum', 'Product', 'Min', 'Max'], { key: 'combineMode', value: 'Sum' }],
                    ['slider', 'Threshold', 0, 1, 0.01, { value: 0.5, key: 'threshold', withNumber: true }],
                ]],
                ['Multi-Centre', [
                    ['slider', 'Offset', 0, 1, 0.01, { value: 0, key: 'centreOffset', withNumber: true }],
                    ['slider', 'Weight A', 0, 1, 0.01, { value: 1, key: 'weightA', withNumber: true }],
                    ['slider', 'Weight B', 0, 1, 0.01, { value: 1, key: 'weightB', withNumber: true }],
                ]],
                ['Motion Parameters', [
                    ['slider', 'Phase Speed', 0, 1, 0.01, { value: 0.1, key: 'phaseSpeed', withNumber: true }],
                    ['slider', 'Wave Mod', 0, 0.2, 0.01, { value: 0, key: 'waveMod', withNumber: true }],
                    ['slider', 'Centre Osc', 0, 1, 0.01, { value: 0, key: 'centreOsc', withNumber: true }],
                ]],
                ['Playback', [
                    ['button', 'Play/Pause', null, { key: 'playPause' }],
                    ['button', 'Reset', null, { key: 'reset' }],
                ]],
            ]],
            
            // TAB 2: STYLE — Visual Appearance
            ['STYLE', [
                ['Mask', [
                    ['dropdown', 'Type', ['None', 'Circle', 'Triangle', 'Square'], { key: 'maskType', value: 'None' }],
                    ['slider', 'Size', 0, 1, 0.01, { value: 1, key: 'maskSize', withNumber: true }],
                    ['slider', 'Softness', 0, 0.2, 0.01, { value: 0, key: 'maskSoftness', withNumber: true }],
                ]],
                ['Colors', [
                    ['color', 'Foreground', '#FFFFFF', { key: 'fgColor' }],
                    ['color', 'Background', '#000000', { key: 'bgColor' }],
                    ['toggle', 'Options', ['Invert'], { key: 'colorOptions', selectedValues: [] }],
                ]],
                ['Export', [
                    ['button', 'Download PNG', null, { key: 'exportPng' }],
                    ['button', 'Download GIF', null, { key: 'exportGif' }],
                ]],
            ]],
        ],
        
        // Auto-injects CANVAS tab (canvas sizing) and ANIMATION tab (export)
        canvas: { 
            width: 420, 
            height: 420,
            showControls: true 
        },
        
        // Animation export configuration
        animation: {
            type: 'infinite',
            defaultFps: 30,
            canPrerender: true
        },
        
        onInit: function(values) {
            var self = this;
            
            wireButton(this, 'playPause', function() { toggleAnimation(self); });
            wireButton(this, 'reset', function() { resetAnimation(self); });
            wireButton(this, 'exportPng', function() { exportPNG(self); });
            wireButton(this, 'exportGif', function() { alert('GIF export coming soon'); });
        },
        
        onUpdate: function(key, value, allValues) {
            // Canvas width/height now handled by auto-CANVAS tab (_canvasWidth/_canvasHeight)
            // Display mode removed (was custom feature, can be added back if needed)
            // FPS now handled by auto-ANIMATION tab
            
            // No canvas-specific updates needed - auto-CANVAS handles resizing
        },
        
        onDraw: function(ctx, canvas, values) {
            var w = canvas.width;
            var h = canvas.height;
            var imageData = ctx.createImageData(w, h);
            var data = imageData.data;
            
            // Parse colors
            var fg = parseColor(values.fgColor || '#FFFFFF');
            var bg = parseColor(values.bgColor || '#000000');
            var invert = (values.colorOptions || []).indexOf('Invert') >= 0;
            
            // Grating parameters
            var wavelength = values.wavelength || 0.02;
            var angularFreq = values.angularFreq || 0;
            var phase = (values.phaseOffset || 0) + animationTime * (values.phaseSpeed || 0.1);
            var gratingCount = values.gratingCount || 2;
            var combineMode = values.combineMode || 'Sum';
            var threshold = values.threshold || 0.5;
            
            // Multi-centre
            var centreOffset = (values.centreOffset || 0) + Math.sin(animationTime * 2) * (values.centreOsc || 0);
            var weightA = values.weightA || 1;
            var weightB = values.weightB || 1;
            
            // Mask
            var maskType = values.maskType || 'None';
            var maskSize = values.maskSize || 1;
            var maskSoftness = values.maskSoftness || 0;
            
            for (var py = 0; py < h; py++) {
                for (var px = 0; px < w; px++) {
                    // Normalize to [-1, 1]
                    var x = (px / w) * 2 - 1;
                    var y = (py / h) * 2 - 1;
                    
                    // Compute gratings
                    var intensity = computeGratings(
                        x, y, wavelength, angularFreq, phase,
                        centreOffset, weightA, weightB, gratingCount, combineMode
                    );
                    
                    // Apply mask
                    var mask = computeMask(x, y, maskType, maskSize, maskSoftness);
                    intensity *= mask;
                    
                    // Threshold
                    var on = intensity > threshold;
                    if (invert) on = !on;
                    
                    var color = on ? fg : bg;
                    var i = (py * w + px) * 4;
                    data[i] = color.r;
                    data[i + 1] = color.g;
                    data[i + 2] = color.b;
                    data[i + 3] = 255;
                }
            }
            
            ctx.putImageData(imageData, 0, 0);
        },
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // GRATING COMPUTATION
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function computeGratings(x, y, wavelength, angularFreq, phase, 
                            centreOffset, weightA, weightB, count, mode) {
        var values = [];
        
        // Centre A (origin)
        // Adjust phase by -0.25 to maintain sin() behavior from cos() implementation
        var gA = Patterns.radialGrating(x, y, 0, 0, wavelength, phase - 0.25) * weightA;
        if (angularFreq > 0) {
            gA *= Patterns.angularGrating(x, y, 0, 0, angularFreq, -Math.PI / 2);
        }
        values.push(gA);
        
        // Centre B (offset)
        if (count >= 2 && centreOffset > 0) {
            var xB = x - centreOffset;
            var gB = Patterns.radialGrating(x, y, centreOffset, 0, wavelength, phase - 0.25) * weightB;
            if (angularFreq > 0) {
                gB *= Patterns.angularGrating(x, y, centreOffset, 0, angularFreq, -Math.PI / 2);
            }
            values.push(gB);
        }
        
        // Additional gratings with rotation
        for (var i = 2; i < count; i++) {
            var angle = (i - 1) * Math.PI / count;
            // For rotated gratings, we use linearGrating as it supports an angle parameter
            // Note: the original radialGrating loop was slightly odd as it didn't use i in radial calculation
            // but the original code did: var rR = Math.sqrt(xR * xR + yR * yR);
            // We can just use radialGrating with 0,0 center on rotated coordinates
            var cosA = Math.cos(angle);
            var sinA = Math.sin(angle);
            var xR = x * cosA + y * sinA;
            var yR = -x * sinA + y * cosA;
            values.push(Patterns.radialGrating(xR, yR, 0, 0, wavelength, phase - 0.25 + i * 0.1));
        }
        
        // Combine
        var intensity = values[0];
        for (var i = 1; i < values.length; i++) {
            intensity = Patterns.combineMoire(intensity, values[i], mode.toLowerCase());
        }
        return intensity;
    }
    
    // Inline functions removed (using Patterns library)

    // ═══════════════════════════════════════════════════════════════════════════════
    // MASK
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function computeMask(x, y, type, size, softness) {
        if (type === 'None') return 1;
        
        var d;
        switch (type) {
            case 'Circle':
                d = Math.sqrt(x * x + y * y);
                break;
            case 'Triangle':
                // Equilateral triangle SDF
                var ax = Math.abs(x);
                d = Math.max(ax * 0.866 + y * 0.5, -y) - 0.5;
                d = (d + 0.5) / 1;
                break;
            case 'Square':
                d = Math.max(Math.abs(x), Math.abs(y));
                break;
            default:
                return 1;
        }
        
        var edge = size;
        if (softness > 0) {
            return smoothstep(edge + softness, edge - softness, d);
        }
        return d < edge ? 1 : 0;
    }
    
    function smoothstep(edge0, edge1, x) {
        var t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
        return t * t * (3 - 2 * t);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // ANIMATION
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function toggleAnimation(tool) {
        if (!AnimationLoop) {
            console.warn('AnimationLoop not available');
            return;
        }

        if (animator) {
            if (animator.isRunning && !animator.isPaused) {
                animator.pause();
            } else if (animator.isPaused) {
                animator.resume();
            } else {
                animator.start();
            }
        } else {
            var fps = tool.getValue('fps') || 30;
            animator = new AnimationLoop({
                fps: fps,
                onFrame: function() {
                    animationTime += 1 / fps;
                    tool.draw();
                }
            });
            animator.start();
        }
    }
    
    function resetAnimation(tool) {
        animationTime = 0;
        if (animator) animator.stop();
        tool.draw();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function wireButton(tool, key, callback) {
        var btn = tool.getComponent(key);
        if (btn && btn.element) {
            btn.element.addEventListener('click', callback);
        }
    }
    
    function parseColor(hex) {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        return { r: r, g: g, b: b };
    }
    
    function exportPNG(tool) {
        const canvas = tool.getCanvas();
        if (!canvas) return;
        ExportUtils.exportCanvasPNG(canvas, 'moire-pattern');
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOOL CLASS
    // ═══════════════════════════════════════════════════════════════════════════════

export class MoireGeneratorTool {
    constructor(container, deps = {}) {
        this.container = container;
        this.deps = {
            ComponentLibrary,
            ...deps
        };
        this.tool = null;
        this.render();
    }
    
    render() {
        try {
            this.tool = new ToolBase(TOOL_CONFIG, this.deps);
            this.tool.mount(this.container);
            this.tool.draw();

            window.debugLog('TOOLS', '✅ MoireGeneratorTool rendered');
        } catch (error) {
            console.error('❌ MoireGeneratorTool error:', error);
            this.container.innerHTML =
                '<div style="padding: 20px; color: var(--c-text);">' +
                '<h2>MOIRÉ GENERATOR ERROR</h2>' +
                '<p style="color: red;">' + error.message + '</p>' +
                '</div>';
        }
    }

    destroy() {
        if (animator) {
            animator.destroy();
            animator = null;
        }
        animationTime = 0;
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
    }
}

// Export as default for tools_section.js
export default MoireGeneratorTool;

window.debugLog('TOOLS', '✅ MoireGeneratorTool loaded (ES Module)');

