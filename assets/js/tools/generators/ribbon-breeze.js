/**
 * Ribbon Breeze - Animated Ribbon Field Generator
 * 
 * Generate animated ribbon fields with 2.5D depth illusion.
 * 
 * Design Spec: blog/ideas/tools/ribbon-breeze/01-design-spec.md
 * 
 * @version 1.0.0
 */
// ES Module imports
import { ToolBase } from '../core/tool-base.js';
import ComponentLibrary from '../../shared/component-library.js';
import { AnimationLoop } from '../../core/animation-foundation.js';
import { ExportUtils } from '../../shared/algorithms/index.js';

// ═══════════════════════════════════════════════════════════════════════════════
    // MODULE-LEVEL STATE
    // ═══════════════════════════════════════════════════════════════════════════════
    
    var animator = null;
    var frameIndex = 0;
    var isAnimating = false;
    var ribbons = [];

    // ═══════════════════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════════════

    export const TOOL_CONFIG = {
        title: 'RIBBON BREEZE',
        
        sidebar: [
            // ═══════════════════════════════════════════════════════════════════
            // TAB 1: CONTROLS — Layout & Wind
            // ═══════════════════════════════════════════════════════════════════
            ['CONTROLS', [
                ['Layout', [
                    ['stepper', 'Rows', 1, 20, 1, { value: 8, key: 'rows' }],
                    ['slider', 'Row Spacing', 20, 100, 1, { value: 40, key: 'rowSpacing', withNumber: true }],
                    ['slider', 'Ribbon Length', 100, 800, 10, { value: 400, key: 'ribbonLength', withNumber: true }],
                    ['slider', 'Thickness', 5, 50, 1, { value: 20, key: 'thickness', withNumber: true }],
                ]],
                ['Wind', [
                    ['slider', 'Wave Number k', 0.01, 0.1, 0.001, { value: 0.03, key: 'waveK', withNumber: true, precision: 3 }],
                    ['slider', 'Omega', 0.01, 0.2, 0.01, { value: 0.05, key: 'omega', withNumber: true }],
                    ['slider', 'Base Amplitude', 10, 100, 1, { value: 40, key: 'amplitude', withNumber: true }],
                    ['slider', 'Noise Amount', 0, 1, 0.01, { value: 0.2, key: 'noiseAmount', withNumber: true }],
                ]],
                ['Animation', [
                    ['stepper', 'Loop Frames', 30, 300, 10, { value: 120, key: 'loopFrames' }],
                    ['stepper', 'Wind Cycles', 1, 8, 1, { value: 2, key: 'windCycles' }],
                    ['button', 'Play', null, { key: 'play' }],
                    ['button', 'Pause', null, { key: 'pause' }],
                    ['button', 'Reset', null, { key: 'reset' }],
                    ['value', '0', { label: 'Frame', key: 'frameDisplay' }],
                ]],
            ]],
            
            // ═══════════════════════════════════════════════════════════════════
            // TAB 2: STYLE — Shading & Colors
            // ═══════════════════════════════════════════════════════════════════
            ['STYLE', [
                ['Shading', [
                    ['dropdown', 'Shading Mode', ['Gradient', 'Inverted', 'Flat', 'Pattern', 'Dither'], { key: 'shadingMode', value: 'Gradient' }],
                    ['color', 'Front Color', '#FFFFFF', { key: 'frontColor' }],
                    ['color', 'Underside Color', '#808080', { key: 'undersideColor' }],
                    ['color', 'Riser Color', '#000000', { key: 'riserColor' }],
                ]],
                ['Variation', [
                    ['slider', 'Per-Row Phase', 0, 1, 0.01, { value: 0.2, key: 'rowPhase', withNumber: true }],
                    ['slider', 'Amplitude Var', 0, 1, 0.01, { value: 0.1, key: 'ampVariation', withNumber: true }],
                    ['slider', 'Thickness Var', 0, 1, 0.01, { value: 0.1, key: 'thickVariation', withNumber: true }],
                ]],
                ['Background', [
                    ['color', 'Background', '#000000', { key: 'bgColor' }],
                ]],
                ['Export', [
                    ['button', 'Export Frame', null, { key: 'exportFrame' }],
                    ['button', 'Export SVG', null, { key: 'exportSvg' }],
                    ['button', 'Export GIF', null, { key: 'exportGif' }],
                ]],
            ]],
        ],
        
        // Auto-injects CANVAS tab (sizing) and ANIMATION tab (export controls)
        canvas: { 
            width: 420, 
            height: 420,
            showControls: true 
        },
        
        // Animation export configuration
        animation: {
            type: 'loop',
            loopFrames: 120,  // Default from loopFrames stepper
            defaultFps: 30,
            canPrerender: true
        },
        
        onInit: function(values) {
            var self = this;
            
            // Wire animation buttons
            wireButton(this, 'play', function() { startAnimation(self); });
            wireButton(this, 'pause', function() { pauseAnimation(); });
            wireButton(this, 'reset', function() { resetAnimation(self); });
            
            // Wire export buttons
            wireButton(this, 'exportFrame', function() { exportPNG(self); });
            wireButton(this, 'exportGif', function() { alert('GIF: Record ' + (values.loopFrames || 120) + ' frames'); });
            wireButton(this, 'exportSvg', function() { exportSVG(self); });
            
            // Initialize ribbons
            initRibbons(values);
        },
        
        onUpdate: function(key, value, allValues) {
            // Canvas width/height now handled by auto-CANVAS tab
            // Display mode removed (was custom feature)
            // FPS now handled by auto-ANIMATION tab
            
            // Layout changes require ribbon rebuild
            if (['rows', 'rowSpacing', 'ribbonLength', 'thickness'].indexOf(key) >= 0) {
                initRibbons(allValues);
            }
        },
        
        onDraw: function(ctx, canvas, values) {
            var w = canvas.width;
            var h = canvas.height;
            
            // Clear
            ctx.fillStyle = values.bgColor || '#000000';
            ctx.fillRect(0, 0, w, h);
            
            // Draw ribbons
            drawRibbons(ctx, w, h, values, frameIndex);
            
            // Update frame display
            var frameComp = this.getComponent('frameDisplay');
            if (frameComp && frameComp.setValue) {
                frameComp.setValue(frameIndex + ' / ' + (values.loopFrames || 120));
            }
        },
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // RIBBON GENERATION
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function initRibbons(values) {
        ribbons = [];
        var rows = values.rows || 8;
        var rowSpacing = values.rowSpacing || 40;
        var ribbonLength = values.ribbonLength || 400;
        var thickness = values.thickness || 20;
        
        for (var i = 0; i < rows; i++) {
            ribbons.push({
                row: i,
                y: 50 + i * rowSpacing,
                length: ribbonLength * (0.8 + Math.random() * 0.4),
                thickness: thickness * (0.9 + Math.random() * 0.2),
                phaseOffset: Math.random() * Math.PI * 2
            });
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // RENDERING
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function drawRibbons(ctx, w, h, values, frame) {
        var waveK = values.waveK || 0.03;
        var omega = values.omega || 0.05;
        var amplitude = values.amplitude || 40;
        var noiseAmount = values.noiseAmount || 0.2;
        var rowPhase = values.rowPhase || 0.2;
        var ampVariation = values.ampVariation || 0.1;
        var thickVariation = values.thickVariation || 0.1;
        var loopFrames = values.loopFrames || 120;
        var windCycles = values.windCycles || 2;
        
        var shadingMode = values.shadingMode || 'Gradient';
        var frontColor = parseColor(values.frontColor || '#FFFFFF');
        var undersideColor = parseColor(values.undersideColor || '#808080');
        var riserColor = parseColor(values.riserColor || '#000000');
        
        // Time for looping animation
        var t = (frame / loopFrames) * Math.PI * 2 * windCycles;
        
        // Sort ribbons by depth (back to front)
        var sorted = ribbons.slice().sort(function(a, b) {
            return a.y - b.y;
        });
        
        for (var ri = 0; ri < sorted.length; ri++) {
            var ribbon = sorted[ri];
            var rowIdx = ribbon.row;
            
            // Per-ribbon variation
            var localPhase = ribbon.phaseOffset + rowIdx * rowPhase * Math.PI;
            var localAmp = amplitude * (1 + (Math.random() - 0.5) * ampVariation * 2);
            var localThick = ribbon.thickness * (1 + (Math.random() - 0.5) * thickVariation * 2);
            
            // Generate ribbon points
            var pointCount = 100;
            var points = [];
            var xStart = (w - ribbon.length) / 2;
            
            for (var i = 0; i <= pointCount; i++) {
                var px = xStart + (i / pointCount) * ribbon.length;
                var phase = waveK * px + omega * t + localPhase;
                
                // Add noise
                var noise = noiseAmount * Math.sin(px * 0.02 + t * 0.5) * 20;
                
                // Wave displacement
                var dy = Math.sin(phase) * localAmp + noise;
                var py = ribbon.y + dy;
                
                // Store slope for shading
                var slope = Math.cos(phase) * localAmp * waveK;
                
                points.push({
                    x: px,
                    y: py,
                    slope: slope,
                    phase: phase
                });
            }
            
            // Draw ribbon with 2.5D effect
            drawRibbon2D(ctx, points, localThick, shadingMode, frontColor, undersideColor, riserColor);
        }
    }
    
    function drawRibbon2D(ctx, points, thickness, shadingMode, front, under, riser) {
        if (points.length < 2) return;
        
        // Draw filled ribbon
        ctx.beginPath();
        
        // Top edge
        for (var i = 0; i < points.length; i++) {
            var p = points[i];
            var y = p.y - thickness / 2;
            if (i === 0) ctx.moveTo(p.x, y);
            else ctx.lineTo(p.x, y);
        }
        
        // Bottom edge (reverse)
        for (var i = points.length - 1; i >= 0; i--) {
            var p = points[i];
            var y = p.y + thickness / 2;
            ctx.lineTo(p.x, y);
        }
        
        ctx.closePath();
        
        // Determine fill based on shading mode
        if (shadingMode === 'Gradient') {
            // Create gradient based on average slope
            var avgSlope = 0;
            for (var i = 0; i < points.length; i++) {
                avgSlope += points[i].slope;
            }
            avgSlope /= points.length;
            
            var t = (avgSlope + 1) / 2; // Normalize to [0,1]
            ctx.fillStyle = lerpColor(under, front, t);
        } else if (shadingMode === 'Inverted') {
            var midSlope = points[Math.floor(points.length / 2)].slope;
            ctx.fillStyle = midSlope > 0 ? colorToHex(front) : colorToHex(under);
        } else if (shadingMode === 'Flat') {
            ctx.fillStyle = colorToHex(front);
        } else if (shadingMode === 'Pattern') {
            // Simple stripe pattern
            ctx.fillStyle = colorToHex(front);
        } else if (shadingMode === 'Dither') {
            ctx.fillStyle = colorToHex(front);
        }
        
        ctx.fill();
        
        // Draw edges (risers) for depth
        ctx.strokeStyle = colorToHex(riser);
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw per-segment shading for gradient mode
        if (shadingMode === 'Gradient') {
            for (var i = 0; i < points.length - 1; i++) {
                var p0 = points[i];
                var p1 = points[i + 1];
                
                // Shade based on local slope
                var localSlope = (p0.slope + p1.slope) / 2;
                var t = (localSlope + 1) / 2;
                var c = lerpColor(under, front, t);
                
                ctx.fillStyle = c;
                ctx.beginPath();
                ctx.moveTo(p0.x, p0.y - thickness / 2);
                ctx.lineTo(p1.x, p1.y - thickness / 2);
                ctx.lineTo(p1.x, p1.y + thickness / 2);
                ctx.lineTo(p0.x, p0.y + thickness / 2);
                ctx.closePath();
                ctx.fill();
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // ANIMATION
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function startAnimation(toolInstance) {
        if (!AnimationLoop) {
            console.warn('AnimationFoundation not available');
            return;
        }
        
        var fps = toolInstance.getValue('fps') || 30;
        var loopFrames = toolInstance.getValue('loopFrames') || 120;
        
        if (animator && animator.isPaused) {
            animator.resume();
            isAnimating = true;
            return;
        }
        
        if (animator) {
            animator.destroy();
        }
        
        isAnimating = true;
        animator = new AnimationLoop({
            fps: fps,
            onFrame: function() {
                frameIndex = (frameIndex + 1) % loopFrames;
                toolInstance.draw();
            }
        });
        animator.start();
    }
    
    function pauseAnimation() {
        if (animator) {
            animator.pause();
            isAnimating = false;
        }
    }
    
    function resetAnimation(toolInstance) {
        frameIndex = 0;
        isAnimating = false;
        if (animator) {
            animator.stop();
        }
        toolInstance.draw();
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
        return {
            r: parseInt(hex.slice(1, 3), 16),
            g: parseInt(hex.slice(3, 5), 16),
            b: parseInt(hex.slice(5, 7), 16)
        };
    }
    
    function colorToHex(c) {
        return '#' + 
            ('0' + Math.round(c.r).toString(16)).slice(-2) +
            ('0' + Math.round(c.g).toString(16)).slice(-2) +
            ('0' + Math.round(c.b).toString(16)).slice(-2);
    }
    
    function lerpColor(c1, c2, t) {
        t = Math.max(0, Math.min(1, t));
        return colorToHex({
            r: c1.r + (c2.r - c1.r) * t,
            g: c1.g + (c2.g - c1.g) * t,
            b: c1.b + (c2.b - c1.b) * t
        });
    }
    
    function exportPNG(tool) {
        const canvas = tool.getCanvas();
        if (!canvas) return;
        ExportUtils.exportCanvasPNG(canvas, 'ribbon-breeze');
    }
    
    function exportSVG(tool) {
        alert('SVG export coming soon');
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOOL CLASS
    // ═══════════════════════════════════════════════════════════════════════════════

export class RibbonBreezeTool {
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
            
            console.log('✅ RibbonBreezeTool rendered');
        } catch (error) {
            console.error('❌ RibbonBreezeTool error:', error);
            this.container.innerHTML = 
                '<div style="padding: 20px; color: var(--c-text);">' +
                '<h2>RIBBON BREEZE ERROR</h2>' +
                '<p style="color: red;">' + error.message + '</p>' +
                '</div>';
        }
    }
    
    destroy() {
        if (animator) {
            animator.destroy();
            animator = null;
        }
        ribbons = [];
        frameIndex = 0;
        isAnimating = false;
        
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
    }
}

// Export as default for tools_section.js
export default RibbonBreezeTool;

console.log('✅ RibbonBreezeTool loaded (ES Module)');

