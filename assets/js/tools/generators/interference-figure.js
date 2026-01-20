/**
 * Interference Figure Generator - Conoscopic Pattern Tool
 * 
 * Generate conoscopic interference patterns from optical path difference fields.
 * Supports radial, spiral, biaxial, grid, petal, and organic patterns.
 * 
 * Design Spec: blog/ideas/tools/interference-figure-generator/01-design-spec.md
 * 
 * @version 1.0.0
 */
// ES Module imports
import { ToolBase } from '../core/tool-base.js';
import ComponentLibrary from '../../shared/component-library.js';
import { ExportUtils } from '../../shared/algorithms/index.js';

// ═══════════════════════════════════════════════════════════════════════════════
    // CONFIGURATION — Following Design Spec
    // ═══════════════════════════════════════════════════════════════════════════════

    export const TOOL_CONFIG = {
        title: 'INTERFERENCE FIGURE',
        
        sidebar: [
            // ═══════════════════════════════════════════════════════════════════
            // TAB 1: CONTROLS — Pattern Parameters + Presets
            // ═══════════════════════════════════════════════════════════════════
            ['CONTROLS', [
                ['Parameters', [
                    ['dropdown', 'Pattern Family', ['Rings', 'Spiral', 'Biaxial', 'Grid', 'Petal', 'Organic'], { key: 'patternFamily', value: 'Rings' }],
                    ['slider', 'Radial Weight', 0, 1, 0.01, { value: 1, key: 'radialWeight', withNumber: true }],
                    ['slider', 'Spiral Weight', 0, 1, 0.01, { value: 0, key: 'spiralWeight', withNumber: true }],
                    ['slider', 'Spiral Rate', -4, 4, 0.1, { value: 2, key: 'spiralRate', withNumber: true }],
                ]],
                ['Structure', [
                    ['slider', 'Wedge X Weight', 0, 1, 0.01, { value: 0, key: 'wedgeXWeight', withNumber: true }],
                    ['slider', 'Wedge Y Weight', 0, 1, 0.01, { value: 0, key: 'wedgeYWeight', withNumber: true }],
                    ['slider', 'Angular N2', -1, 1, 0.01, { value: 0, key: 'angularN2', withNumber: true }],
                    ['slider', 'Angular N4', -1, 1, 0.01, { value: 0, key: 'angularN4', withNumber: true }],
                ]],
                ['Multi-Axis', [
                    ['slider', 'Saddle Weight', -1, 1, 0.01, { value: 0, key: 'saddleWeight', withNumber: true }],
                    ['slider', 'Global Scale', 0.2, 3, 0.01, { value: 1, key: 'globalScale', withNumber: true }],
                    ['stepper', 'Multi-Axis Count', 0, 4, 1, { value: 0, key: 'multiAxisCount' }],
                    ['slider', 'Axis Radius', 0, 0.5, 0.01, { value: 0.2, key: 'axisRadius', withNumber: true }],
                ]],
                ['Presets', [
                    ['button', 'Newton Rings', null, { key: 'presetRings' }],
                    ['button', 'Spiral Arms', null, { key: 'presetSpiral' }],
                    ['button', 'Biaxial Cross', null, { key: 'presetBiaxial' }],
                    ['button', 'Petal Flower', null, { key: 'presetPetal' }],
                    ['button', 'Oil Slick', null, { key: 'presetOil' }],
                    ['button', 'CD Surface', null, { key: 'presetCD' }],
                    ['button', 'Bubble', null, { key: 'presetBubble' }],
                ]],
                ['Actions', [
                    ['button', 'Regenerate', null, { key: 'regenerate' }],
                    ['button', 'Download PNG', null, { key: 'exportPng' }],
                    ['button', 'Download SVG', null, { key: 'exportSvg' }],
                ]],
            ]],
            
            // ═══════════════════════════════════════════════════════════════════
            // TAB 2: STYLE — Color & Tone
            // ═══════════════════════════════════════════════════════════════════
            ['STYLE', [
                ['Color & Tone', [
                    ['dropdown', 'Spectral Mode', ['Physical', 'Stylised'], { key: 'spectralMode', value: 'Physical' }],
                    ['slider', 'Exposure', 0.5, 2, 0.01, { value: 1, key: 'exposure', withNumber: true }],
                    ['slider', 'Gamma', 1.8, 2.4, 0.01, { value: 2.2, key: 'gamma', withNumber: true }],
                    ['slider', 'Saturation', 0.5, 1.5, 0.01, { value: 1, key: 'saturation', withNumber: true }],
                ]],
                ['Noise', [
                    ['slider', 'Noise Weight', 0, 0.5, 0.01, { value: 0, key: 'noiseWeight', withNumber: true }],
                    ['slider', 'Noise Scale', 0.1, 2, 0.1, { value: 1, key: 'noiseScale', withNumber: true }],
                    ['stepper', 'Noise Octaves', 1, 6, 1, { value: 3, key: 'noiseOctaves' }],
                ]],
                ['Colors', [
                    ['color', 'Background', '#000000', { key: 'bgColor' }],
                    ['color', 'Tint', '#FFFFFF', { key: 'tintColor' }],
                ]],
            ]],
        ],
        
        // Auto-injects CANVAS tab (sizing controls)
        canvas: { 
            width: 420, 
            height: 420,
            showControls: true 
        },
        
        onInit: function(values) {
            var self = this;
            
            // Wire export buttons
            wireButton(this, 'exportPng', function() { exportPNG(self); });
            wireButton(this, 'exportSvg', function() { alert('SVG export not supported for pixel-based patterns'); });
            wireButton(this, 'regenerate', function() { self.draw(); });
            
            // Wire presets
            wireButton(this, 'presetRings', function() {
                applyPreset(self, { patternFamily: 'Rings', radialWeight: 1, spiralWeight: 0, saddleWeight: 0 });
            });
            wireButton(this, 'presetSpiral', function() {
                applyPreset(self, { patternFamily: 'Spiral', spiralWeight: 0.5, spiralRate: 3, radialWeight: 0.5 });
            });
            wireButton(this, 'presetBiaxial', function() {
                applyPreset(self, { patternFamily: 'Biaxial', multiAxisCount: 2, axisRadius: 0.3, radialWeight: 1 });
            });
            wireButton(this, 'presetPetal', function() {
                applyPreset(self, { patternFamily: 'Petal', angularN4: 0.5, radialWeight: 1 });
            });
            wireButton(this, 'presetOil', function() {
                applyPreset(self, { noiseWeight: 0.3, noiseScale: 1.5, spectralMode: 'Physical' });
            });
            wireButton(this, 'presetCD', function() {
                applyPreset(self, { spiralWeight: 0.3, spiralRate: -2, spectralMode: 'Stylised' });
            });
            wireButton(this, 'presetBubble', function() {
                applyPreset(self, { radialWeight: 1, globalScale: 2, spectralMode: 'Physical', saturation: 1.3 });
            });
        },
        
        onUpdate: function(key, value, allValues) {
            // Canvas width/height now handled by auto-CANVAS tab
            // Display mode removed (was custom feature)
            
            // Apply pattern family presets
            if (key === 'patternFamily') {
                var presets = {
                    'Rings': { radialWeight: 1, spiralWeight: 0, saddleWeight: 0 },
                    'Spiral': { spiralWeight: 0.5, spiralRate: 2 },
                    'Biaxial': { multiAxisCount: 2, axisRadius: 0.25 },
                    'Grid': { wedgeXWeight: 0.5, wedgeYWeight: 0.5 },
                    'Petal': { angularN4: 0.4, angularN2: 0.2 },
                    'Organic': { noiseWeight: 0.3, noiseScale: 1.2 }
                };
                if (presets[value]) {
                    for (var k in presets[value]) {
                        this.setValue(k, presets[value][k]);
                    }
                }
            }
        },
        
        onDraw: function(ctx, canvas, values) {
            var w = canvas.width;
            var h = canvas.height;
            var imageData = ctx.createImageData(w, h);
            var data = imageData.data;
            
            // Parameters
            var radialWeight = values.radialWeight || 0;
            var spiralWeight = values.spiralWeight || 0;
            var spiralRate = values.spiralRate || 2;
            var wedgeXWeight = values.wedgeXWeight || 0;
            var wedgeYWeight = values.wedgeYWeight || 0;
            var angularN2 = values.angularN2 || 0;
            var angularN4 = values.angularN4 || 0;
            var saddleWeight = values.saddleWeight || 0;
            var globalScale = values.globalScale || 1;
            var multiAxisCount = values.multiAxisCount || 0;
            var axisRadius = values.axisRadius || 0.2;
            
            var exposure = values.exposure || 1;
            var gamma = values.gamma || 2.2;
            var saturation = values.saturation || 1;
            var spectralMode = values.spectralMode || 'Physical';
            
            var noiseWeight = values.noiseWeight || 0;
            var noiseScale = values.noiseScale || 1;
            var noiseOctaves = values.noiseOctaves || 3;
            
            for (var py = 0; py < h; py++) {
                for (var px = 0; px < w; px++) {
                    // Normalize to [-1, 1]
                    var x = (px / w) * 2 - 1;
                    var y = (py / h) * 2 - 1;
                    
                    // Compute optical path difference
                    var opd = computeOPD(
                        x, y,
                        radialWeight, spiralWeight, spiralRate,
                        wedgeXWeight, wedgeYWeight,
                        angularN2, angularN4, saddleWeight,
                        globalScale, multiAxisCount, axisRadius,
                        noiseWeight, noiseScale, noiseOctaves
                    );
                    
                    // Convert OPD to color
                    var color;
                    if (spectralMode === 'Physical') {
                        color = opdToSpectralColor(opd, exposure, gamma, saturation);
                    } else {
                        color = opdToStylisedColor(opd, exposure, gamma, saturation);
                    }
                    
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
    // OPTICAL PATH DIFFERENCE CALCULATION
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function computeOPD(x, y, radialW, spiralW, spiralRate, wedgeX, wedgeY, 
                        n2, n4, saddleW, scale, multiAxis, axisR, noiseW, noiseS, noiseO) {
        var opd = 0;
        
        var r = Math.sqrt(x * x + y * y);
        var theta = Math.atan2(y, x);
        
        // Radial component (Newton's rings)
        if (radialW > 0) {
            opd += radialW * r * r * 20;
        }
        
        // Spiral component
        if (spiralW > 0) {
            opd += spiralW * (r * r + theta * spiralRate / Math.PI) * 10;
        }
        
        // Wedge components (linear)
        if (wedgeX > 0) {
            opd += wedgeX * Math.abs(x) * 15;
        }
        if (wedgeY > 0) {
            opd += wedgeY * Math.abs(y) * 15;
        }
        
        // Angular harmonics
        if (n2 !== 0) {
            opd += n2 * r * Math.cos(2 * theta) * 5;
        }
        if (n4 !== 0) {
            opd += n4 * r * Math.cos(4 * theta) * 5;
        }
        
        // Saddle (hyperbolic)
        if (saddleW !== 0) {
            opd += saddleW * (x * x - y * y) * 10;
        }
        
        // Multi-axis (biaxial crystal simulation)
        if (multiAxis > 0) {
            for (var i = 0; i < multiAxis; i++) {
                var angle = (i / multiAxis) * Math.PI * 2;
                var ax = axisR * Math.cos(angle);
                var ay = axisR * Math.sin(angle);
                var dx = x - ax;
                var dy = y - ay;
                var dr = Math.sqrt(dx * dx + dy * dy);
                opd += (dr * dr) * 10 / multiAxis;
            }
        }
        
        // Noise perturbation
        if (noiseW > 0) {
            var noise = 0;
            var amp = 1;
            var freq = noiseS;
            for (var o = 0; o < noiseO; o++) {
                noise += amp * simplexNoise(x * freq * 5, y * freq * 5);
                amp *= 0.5;
                freq *= 2;
            }
            opd += noiseW * noise * 5;
        }
        
        return opd * scale;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // COLOR CONVERSION
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function opdToSpectralColor(opd, exposure, gamma, saturation) {
        // Simulate thin-film interference color
        // Based on optical path difference → wavelength → RGB
        
        var phase = opd * Math.PI * 2;
        
        // Approximate spectral color via interference
        var r = Math.cos(phase) * 0.5 + 0.5;
        var g = Math.cos(phase + Math.PI * 2 / 3) * 0.5 + 0.5;
        var b = Math.cos(phase + Math.PI * 4 / 3) * 0.5 + 0.5;
        
        // Apply saturation
        var gray = (r + g + b) / 3;
        r = gray + (r - gray) * saturation;
        g = gray + (g - gray) * saturation;
        b = gray + (b - gray) * saturation;
        
        // Apply exposure
        r *= exposure;
        g *= exposure;
        b *= exposure;
        
        // Apply gamma correction
        var invGamma = 1 / gamma;
        r = Math.pow(Math.max(0, Math.min(1, r)), invGamma);
        g = Math.pow(Math.max(0, Math.min(1, g)), invGamma);
        b = Math.pow(Math.max(0, Math.min(1, b)), invGamma);
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }
    
    function opdToStylisedColor(opd, exposure, gamma, saturation) {
        // Rainbow gradient based on OPD
        var hue = (opd * 60) % 360;
        if (hue < 0) hue += 360;
        
        // HSL to RGB
        var s = saturation;
        var l = 0.5 * exposure;
        l = Math.max(0, Math.min(1, l));
        
        var c = (1 - Math.abs(2 * l - 1)) * s;
        var h = hue / 60;
        var x = c * (1 - Math.abs(h % 2 - 1));
        var m = l - c / 2;
        
        var r, g, b;
        if (h < 1) { r = c; g = x; b = 0; }
        else if (h < 2) { r = x; g = c; b = 0; }
        else if (h < 3) { r = 0; g = c; b = x; }
        else if (h < 4) { r = 0; g = x; b = c; }
        else if (h < 5) { r = x; g = 0; b = c; }
        else { r = c; g = 0; b = x; }
        
        r += m; g += m; b += m;
        
        // Gamma
        var invGamma = 1 / gamma;
        r = Math.pow(r, invGamma);
        g = Math.pow(g, invGamma);
        b = Math.pow(b, invGamma);
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function simplexNoise(x, y) {
        // Simplified 2D noise
        return Math.sin(x * 1.7 + y * 2.3) * Math.cos(x * 2.1 - y * 1.9) * 
               Math.sin((x + y) * 0.8);
    }
    
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
        tool.draw();
    }
    
    function exportPNG(tool) {
        const canvas = tool.getCanvas();
        if (!canvas) return;
        ExportUtils.exportCanvasPNG(canvas, 'interference-figure');
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOOL CLASS
    // ═══════════════════════════════════════════════════════════════════════════════

export class InterferenceFigureTool {
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
            
            console.log('✅ InterferenceFigureTool rendered');
        } catch (error) {
            console.error('❌ InterferenceFigureTool error:', error);
            this.container.innerHTML = 
                '<div style="padding: 20px; color: var(--c-text);">' +
                '<h2>INTERFERENCE FIGURE ERROR</h2>' +
                '<p style="color: red;">' + error.message + '</p>' +
                '</div>';
        }
    }
    
    destroy() {
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
    }
}

// Export as default for tools_section.js
export default InterferenceFigureTool;

console.log('✅ InterferenceFigureTool loaded (ES Module)');

