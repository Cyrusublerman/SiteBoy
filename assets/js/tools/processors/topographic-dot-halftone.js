/**
 * Topographic Dot Halftone - Contour-Aligned Dot Patterns
 * 
 * Generate dot halftone patterns aligned to contours.
 * 
 * Design Spec: blog/ideas/tools/topographic-dot-halftone/01-design-spec.md
 * 
 * @version 1.0.0
 */
// ES Module imports
import { ToolBase } from '../core/tool-base.js';
import ComponentLibrary from '../../shared/component-library.js';

// ═══════════════════════════════════════════════════════════════════════════════
    // MODULE-LEVEL STATE
    // ═══════════════════════════════════════════════════════════════════════════════
    
    var depthMap = null;
    var normalMap = null;
    var lumaImage = null;
    var compositeField = null;

    // ═══════════════════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════════════

    export const TOOL_CONFIG = {
        title: 'TOPOGRAPHIC DOT HALFTONE',
        
        sidebar: [
            // ═══════════════════════════════════════════════════════════════════
            // TAB 1: INPUT — Mode & Files
            // ═══════════════════════════════════════════════════════════════════
            ['INPUT', [
                ['Mode', [
                    ['dropdown', 'Input Mode', ['Single Image', 'Depth + Normal', 'Vector SVG'], { key: 'inputMode', value: 'Single Image' }],
                ]],
                ['Files', [
                    ['file', 'Depth Map', 'image/*', { key: 'depthFile' }],
                    ['file', 'Normal Map', 'image/*', { key: 'normalFile' }],
                    ['file', 'Luma Image', 'image/*', { key: 'lumaFile' }],
                ]],
                ['Vector', [
                    ['dropdown', 'Contour Source', ['SDF', 'Geodesic', 'Laplace'], { key: 'contourSource', value: 'SDF' }],
                ]],
            ]],
            
            // ═══════════════════════════════════════════════════════════════════
            // TAB 2: FIELD — Weights & Processing
            // ═══════════════════════════════════════════════════════════════════
            ['FIELD', [
                ['Weights', [
                    ['slider', 'Depth Weight', 0, 1, 0.01, { value: 0.5, key: 'weightDepth', withNumber: true }],
                    ['slider', 'Normal Weight', 0, 1, 0.01, { value: 0.3, key: 'weightNormal', withNumber: true }],
                    ['slider', 'Luma Weight', 0, 1, 0.01, { value: 0.2, key: 'weightLuma', withNumber: true }],
                    ['slider', 'Gamma', 0.5, 3, 0.1, { value: 1, key: 'gamma', withNumber: true }],
                ]],
                ['Processing', [
                    ['slider', 'Blur', 0, 10, 0.5, { value: 0, key: 'blur', withNumber: true }],
                    ['slider', 'Contrast', 0.5, 2, 0.1, { value: 1, key: 'contrast', withNumber: true }],
                ]],
            ]],
            
            // ═══════════════════════════════════════════════════════════════════
            // TAB 3: PATTERN — Dot Lattice
            // ═══════════════════════════════════════════════════════════════════
            ['PATTERN', [
                ['Dots', [
                    ['slider', 'Dot Density', 0.1, 2, 0.1, { value: 1, key: 'dotDensity', withNumber: true }],
                    ['slider', 'Min Radius', 0.5, 5, 0.5, { value: 1, key: 'minRadius', withNumber: true }],
                    ['slider', 'Max Radius', 2, 20, 0.5, { value: 8, key: 'maxRadius', withNumber: true }],
                ]],
                ['Spacing', [
                    ['slider', 'Band Pitch', 5, 50, 1, { value: 15, key: 'bandPitch', withNumber: true }],
                    ['slider', 'Along Pitch', 5, 50, 1, { value: 15, key: 'alongPitch', withNumber: true }],
                    ['slider', 'Jitter', 0, 1, 0.01, { value: 0.1, key: 'jitter', withNumber: true }],
                ]],
                ['Colors', [
                    ['color', 'Dot Color', '#000000', { key: 'dotColor' }],
                    ['color', 'Background', '#FFFFFF', { key: 'bgColor' }],
                ]],
            ]],
            
            // ═══════════════════════════════════════════════════════════════════
            // TAB 4: CANVAS — Size & Export
            // ═══════════════════════════════════════════════════════════════════
            ['CANVAS', [
                ['Size', [
                    ['slider', 'Width', 196, 840, 14, { value: 420, key: 'canvasWidth', withNumber: true }],
                    ['slider', 'Height', 196, 840, 14, { value: 420, key: 'canvasHeight', withNumber: true }],
                    ['radio', 'Display', ['Fit', 'Actual'], { key: 'displayMode', selectedValue: 'Fit' }],
                ]],
                ['Export', [
                    ['button', 'Download PNG', null, { key: 'exportPng' }],
                    ['button', 'Download SVG', null, { key: 'exportSvg' }],
                    ['button', 'Process', null, { key: 'process' }],
                ]],
            ]],
        ],
        
        canvas: { size: 420 },
        
        onInit: function(values) {
            var self = this;
            
            wireButton(this, 'exportPng', function() { exportPNG(self); });
            wireButton(this, 'exportSvg', function() { exportSVG(self); });
            wireButton(this, 'process', function() { processFields(self); });
        },
        
        onUpdate: function(key, value, allValues) {
            var self = this;
            
            if (key === 'canvasWidth' || key === 'canvasHeight' || key === 'displayMode') {
                this.resizeCanvas(
                    allValues.canvasWidth || 420,
                    allValues.canvasHeight || 420,
                    { displayMode: (allValues.displayMode || 'Fit').toLowerCase() }
                );
            }
            
            if (key === 'depthFile' && value) {
                loadImageToField(value, 'depth', self);
            }
            if (key === 'normalFile' && value) {
                loadImageToField(value, 'normal', self);
            }
            if (key === 'lumaFile' && value) {
                loadImageToField(value, 'luma', self);
            }
        },
        
        onDraw: function(ctx, canvas, values) {
            var w = canvas.width;
            var h = canvas.height;
            
            // Clear
            ctx.fillStyle = values.bgColor || '#FFFFFF';
            ctx.fillRect(0, 0, w, h);
            
            if (compositeField) {
                drawDots(ctx, w, h, values);
            } else {
                // Placeholder
                ctx.fillStyle = values.dotColor || '#000000';
                ctx.font = '14px "Atkinson Hyperlegible", monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Upload depth/luma images', w / 2, h / 2);
            }
        },
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // IMAGE LOADING
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function loadImageToField(file, type, toolInstance) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var img = new Image();
            img.onload = function() {
                if (type === 'depth') depthMap = img;
                else if (type === 'normal') normalMap = img;
                else if (type === 'luma') lumaImage = img;
                
                processFields(toolInstance);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    function processFields(toolInstance) {
        var values = toolInstance.getValues();
        var w = values.canvasWidth || 420;
        var h = values.canvasHeight || 420;
        
        compositeField = new Float32Array(w * h);
        
        var wDepth = values.weightDepth || 0.5;
        var wNormal = values.weightNormal || 0.3;
        var wLuma = values.weightLuma || 0.2;
        var gamma = values.gamma || 1;
        
        // Get image data from available sources
        var depthData = getImageData(depthMap, w, h);
        var normalData = getImageData(normalMap, w, h);
        var lumaData = getImageData(lumaImage, w, h);
        
        for (var i = 0; i < w * h; i++) {
            var d = depthData ? depthData[i * 4] / 255 : 0.5;
            var n = normalData ? normalData[i * 4] / 255 : 0.5;
            var l = lumaData ? (lumaData[i * 4] * 0.299 + lumaData[i * 4 + 1] * 0.587 + lumaData[i * 4 + 2] * 0.114) / 255 : 0.5;
            
            var val = d * wDepth + n * wNormal + l * wLuma;
            val = Math.pow(val, gamma);
            compositeField[i] = val;
        }
        
        toolInstance.draw();
    }
    
    function getImageData(img, w, h) {
        if (!img) return null;
        
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        return ctx.getImageData(0, 0, w, h).data;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // DOT RENDERING
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function drawDots(ctx, w, h, values) {
        var density = values.dotDensity || 1;
        var minR = values.minRadius || 1;
        var maxR = values.maxRadius || 8;
        var bandPitch = values.bandPitch || 15;
        var alongPitch = values.alongPitch || 15;
        var jitter = values.jitter || 0.1;
        var dotColor = values.dotColor || '#000000';
        
        ctx.fillStyle = dotColor;
        
        var spacing = bandPitch / density;
        
        for (var y = 0; y < h; y += spacing) {
            for (var x = 0; x < w; x += alongPitch / density) {
                var idx = Math.floor(y) * w + Math.floor(x);
                var field = compositeField[idx] || 0.5;
                
                // Jitter position
                var jx = x + (Math.random() - 0.5) * spacing * jitter;
                var jy = y + (Math.random() - 0.5) * spacing * jitter;
                
                // Map field value to radius (dark = big dots)
                var r = minR + (1 - field) * (maxR - minR);
                
                if (r > 0.5) {
                    ctx.beginPath();
                    ctx.arc(jx, jy, r, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
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
    
    function exportPNG(tool) {
        var canvas = tool.getCanvas();
        var a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = 'topographic-dots.png';
        a.click();
    }
    
    function exportSVG(tool) {
        alert('SVG export coming soon');
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOOL CLASS
    // ═══════════════════════════════════════════════════════════════════════════════

export class TopographicDotHalftoneTool {
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
            
            window.debugLog('TOOLS', '✅ TopographicDotHalftoneTool rendered');
        } catch (error) {
            console.error('❌ TopographicDotHalftoneTool error:', error);
            this.container.innerHTML = 
                '<div style="padding: 20px; color: var(--c-text);">' +
                '<h2>TOPOGRAPHIC DOT HALFTONE ERROR</h2>' +
                '<p style="color: red;">' + error.message + '</p>' +
                '</div>';
        }
    }
    
    destroy() {
        depthMap = null;
        normalMap = null;
        lumaImage = null;
        compositeField = null;
        
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
    }
}

// Export as default for tools_section.js
export default TopographicDotHalftoneTool;

window.debugLog('TOOLS', '✅ TopographicDotHalftoneTool loaded (ES Module)');

