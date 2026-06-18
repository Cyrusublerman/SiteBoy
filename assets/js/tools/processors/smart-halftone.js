/**
 * Smart Halftone System - Modular Halftoning Engine
 * 
 * Modular halftoning engine with field-based linework.
 * 
 * Design Spec: blog/ideas/tools/smart-halftone-system/01-design-spec.md
 * 
 * @version 1.0.0
 */
// ES Module imports
import { ToolBase } from '../core/tool-base.js';
import ComponentLibrary from '../../shared/component-library.js';

// ═══════════════════════════════════════════════════════════════════════════════
    // MODULE-LEVEL STATE
    // ═══════════════════════════════════════════════════════════════════════════════
    
    var sourceImage = null;
    var toneField = null;
    var directionField = null;

    // ═══════════════════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════════════

    export const TOOL_CONFIG = {
        title: 'SMART HALFTONE',
        
        sidebar: [
            // ═══════════════════════════════════════════════════════════════════
            // TAB 1: CONTROLS — Input & Tone
            // ═══════════════════════════════════════════════════════════════════
            ['CONTROLS', [
                ['Input', [
                    ['file', 'Upload Image', 'image/*', { key: 'imageFile' }],
                    ['dropdown', 'Source', ['Image', 'Height Map', 'RD Field', 'AO Map'], { key: 'inputSource', value: 'Image' }],
                    ['number', 'Seed', 0, 99999, 1, { value: 1234, key: 'seed' }],
                ]],
                ['Tone', [
                    ['stepper', 'Tone Levels', 2, 8, 1, { value: 5, key: 'toneLevels' }],
                    ['dropdown', 'Halftone Style', ['Base Lines', 'Smart Lines', 'Topographic', 'RD-Driven'], { key: 'halftoneStyle', value: 'Smart Lines' }],
                    ['slider', 'Base Frequency', 0.1, 20, 0.1, { value: 4, key: 'baseFreq', withNumber: true }],
                    ['stepper', 'Family Count', 1, 6, 1, { value: 4, key: 'familyCount' }],
                ]],
            ]],
            
            // ═══════════════════════════════════════════════════════════════════
            // TAB 2: STYLE — Structure & Direction
            // ═══════════════════════════════════════════════════════════════════
            ['STYLE', [
                ['Structure', [
                    ['dropdown', 'Line Direction', ['Global', 'Image-Gradient', 'Surface-Slope'], { key: 'lineDirection', value: 'Image-Gradient' }],
                    ['stepper', 'Contour Count', 1, 64, 1, { value: 16, key: 'contourCount' }],
                    ['slider', 'Contour Width', 0.001, 0.25, 0.001, { value: 0.03, key: 'contourWidth', withNumber: true, precision: 3 }],
                    ['slider', 'Domain Warp', 0, 1, 0.01, { value: 0.2, key: 'domainWarp', withNumber: true }],
                ]],
                ['RD Settings', [
                    ['dropdown', 'RD Preset', ['Off', 'Spots', 'Stripes', 'Maze'], { key: 'rdPreset', value: 'Off' }],
                    ['stepper', 'RD Steps', 0, 5000, 100, { value: 1000, key: 'rdSteps' }],
                ]],
                ['Appearance', [
                    ['color', 'Foreground', '#000000', { key: 'fgColor' }],
                    ['color', 'Background', '#FFFFFF', { key: 'bgColor' }],
                    ['slider', 'Stroke Width', 0.5, 5, 0.5, { value: 1, key: 'strokeWidth', withNumber: true }],
                ]],
            ]],
            
            // ═══════════════════════════════════════════════════════════════════
            // TAB 3: CANVAS — Size & Export
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
            
            // ═══════════════════════════════════════════════════════════════════
            // TAB 4: PRESETS
            // ═══════════════════════════════════════════════════════════════════
            ['PRESETS', [
                ['Styles', [
                    ['button', 'Engraving', null, { key: 'presetEngraving' }],
                    ['button', 'Topo Map', null, { key: 'presetTopo' }],
                    ['button', 'Organic', null, { key: 'presetOrganic' }],
                    ['button', 'Technical', null, { key: 'presetTechnical' }],
                ]],
            ]],
        ],
        
        canvas: { size: 420 },
        
        onInit: function(values) {
            var self = this;
            
            wireButton(this, 'exportPng', function() { exportPNG(self); });
            wireButton(this, 'exportSvg', function() { exportSVG(self); });
            wireButton(this, 'process', function() { processImage(self); });
            
            // Presets
            wireButton(this, 'presetEngraving', function() {
                applyPreset(self, { halftoneStyle: 'Smart Lines', lineDirection: 'Image-Gradient', familyCount: 4 });
            });
            wireButton(this, 'presetTopo', function() {
                applyPreset(self, { halftoneStyle: 'Topographic', contourCount: 32, contourWidth: 0.02 });
            });
            wireButton(this, 'presetOrganic', function() {
                applyPreset(self, { halftoneStyle: 'RD-Driven', rdPreset: 'Spots', rdSteps: 2000 });
            });
            wireButton(this, 'presetTechnical', function() {
                applyPreset(self, { halftoneStyle: 'Base Lines', lineDirection: 'Global', familyCount: 6 });
            });
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
            
            if (key === 'imageFile' && value) {
                loadImage(value, self);
            }
        },
        
        onDraw: function(ctx, canvas, values) {
            var w = canvas.width;
            var h = canvas.height;
            
            // Clear
            ctx.fillStyle = values.bgColor || '#FFFFFF';
            ctx.fillRect(0, 0, w, h);
            
            if (sourceImage) {
                drawHalftone(ctx, w, h, values);
            } else {
                // Placeholder
                ctx.fillStyle = values.fgColor || '#000000';
                ctx.font = '14px "Atkinson Hyperlegible", monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Upload an image to begin', w / 2, h / 2);
            }
        },
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // IMAGE LOADING
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function loadImage(file, toolInstance) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var img = new Image();
            img.onload = function() {
                sourceImage = img;
                processImage(toolInstance);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    function processImage(toolInstance) {
        if (!sourceImage) return;
        
        var values = toolInstance.getValues();
        var w = values.canvasWidth || 420;
        var h = values.canvasHeight || 420;
        
        // Create temporary canvas to get image data
        var tempCanvas = document.createElement('canvas');
        tempCanvas.width = w;
        tempCanvas.height = h;
        var tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(sourceImage, 0, 0, w, h);
        
        var imageData = tempCtx.getImageData(0, 0, w, h);
        var data = imageData.data;
        
        // Build tone field
        toneField = new Float32Array(w * h);
        directionField = new Float32Array(w * h);
        
        for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
                var i = (y * w + x) * 4;
                var luma = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
                toneField[y * w + x] = luma;
                
                // Compute gradient direction
                if (x > 0 && x < w - 1 && y > 0 && y < h - 1) {
                    var gx = toneField[y * w + (x + 1)] - toneField[y * w + (x - 1)];
                    var gy = toneField[(y + 1) * w + x] - toneField[(y - 1) * w + x];
                    directionField[y * w + x] = Math.atan2(gy, gx);
                }
            }
        }
        
        toolInstance.draw();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // HALFTONE RENDERING
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function drawHalftone(ctx, w, h, values) {
        var style = values.halftoneStyle || 'Smart Lines';
        var fgColor = values.fgColor || '#000000';
        var strokeWidth = values.strokeWidth || 1;
        
        ctx.strokeStyle = fgColor;
        ctx.lineWidth = strokeWidth;
        
        switch (style) {
            case 'Base Lines':
                drawBaseLines(ctx, w, h, values);
                break;
            case 'Smart Lines':
                drawSmartLines(ctx, w, h, values);
                break;
            case 'Topographic':
                drawTopographic(ctx, w, h, values);
                break;
            case 'RD-Driven':
                drawRDDriven(ctx, w, h, values);
                break;
        }
    }
    
    function drawBaseLines(ctx, w, h, values) {
        var freq = values.baseFreq || 4;
        var families = values.familyCount || 4;
        var toneLevels = values.toneLevels || 5;
        
        var spacing = w / (freq * 10);
        
        for (var f = 0; f < families; f++) {
            var angle = (f / families) * Math.PI;
            
            ctx.save();
            ctx.translate(w / 2, h / 2);
            ctx.rotate(angle);
            
            for (var i = -w; i < w; i += spacing) {
                ctx.beginPath();
                ctx.moveTo(i, -h);
                ctx.lineTo(i, h);
                ctx.stroke();
            }
            
            ctx.restore();
        }
    }
    
    function drawSmartLines(ctx, w, h, values) {
        var freq = values.baseFreq || 4;
        var families = values.familyCount || 4;
        var lineDir = values.lineDirection || 'Image-Gradient';
        var toneLevels = values.toneLevels || 5;
        
        var spacing = w / (freq * 5);
        
        for (var y = 0; y < h; y += spacing) {
            ctx.beginPath();
            var started = false;
            
            for (var x = 0; x < w; x += 2) {
                var idx = Math.floor(y) * w + Math.floor(x);
                var tone = toneField ? toneField[idx] : 0.5;
                var dir = directionField ? directionField[idx] : 0;
                
                // Determine if line should be drawn based on tone
                var threshold = Math.floor(tone * toneLevels) / toneLevels;
                var yOffset = Math.sin(x * 0.05 + dir) * spacing * 0.3 * (1 - tone);
                
                if (tone < 0.8) {
                    if (!started) {
                        ctx.moveTo(x, y + yOffset);
                        started = true;
                    } else {
                        ctx.lineTo(x, y + yOffset);
                    }
                } else {
                    if (started) {
                        ctx.stroke();
                        ctx.beginPath();
                        started = false;
                    }
                }
            }
            
            if (started) ctx.stroke();
        }
    }
    
    function drawTopographic(ctx, w, h, values) {
        var contourCount = values.contourCount || 16;
        var contourWidth = values.contourWidth || 0.03;
        
        if (!toneField) return;
        
        for (var level = 0; level < contourCount; level++) {
            var threshold = level / contourCount;
            
            ctx.beginPath();
            
            for (var y = 1; y < h - 1; y++) {
                for (var x = 1; x < w - 1; x++) {
                    var tone = toneField[y * w + x];
                    var diff = Math.abs(tone - threshold);
                    
                    if (diff < contourWidth) {
                        ctx.moveTo(x, y);
                        ctx.lineTo(x + 1, y);
                    }
                }
            }
            
            ctx.stroke();
        }
    }
    
    function drawRDDriven(ctx, w, h, values) {
        var rdPreset = values.rdPreset || 'Off';
        
        if (rdPreset === 'Off') {
            drawSmartLines(ctx, w, h, values);
            return;
        }
        
        // Simplified RD visualization
        var spacing = 5;
        
        for (var y = 0; y < h; y += spacing) {
            for (var x = 0; x < w; x += spacing) {
                var idx = Math.floor(y) * w + Math.floor(x);
                var tone = toneField ? toneField[idx] : 0.5;
                
                if (tone < 0.5) {
                    var r = (0.5 - tone) * spacing * 0.8;
                    ctx.beginPath();
                    ctx.arc(x, y, r, 0, Math.PI * 2);
                    ctx.stroke();
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
    
    function applyPreset(tool, preset) {
        for (var key in preset) {
            tool.setValue(key, preset[key]);
        }
        processImage(tool);
    }
    
    function exportPNG(tool) {
        var canvas = tool.getCanvas();
        var a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = 'smart-halftone.png';
        a.click();
    }
    
    function exportSVG(tool) {
        alert('SVG export coming soon');
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOOL CLASS
    // ═══════════════════════════════════════════════════════════════════════════════

export class SmartHalftoneTool {
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
            
            window.debugLog('TOOLS', '✅ SmartHalftoneTool rendered');
        } catch (error) {
            console.error('❌ SmartHalftoneTool error:', error);
            this.container.innerHTML = 
                '<div style="padding: 20px; color: var(--c-text);">' +
                '<h2>SMART HALFTONE ERROR</h2>' +
                '<p style="color: red;">' + error.message + '</p>' +
                '</div>';
        }
    }
    
    destroy() {
        sourceImage = null;
        toneField = null;
        directionField = null;
        
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
    }
}

// Export as default for tools_section.js
export default SmartHalftoneTool;

window.debugLog('TOOLS', '✅ SmartHalftoneTool loaded (ES Module)');

