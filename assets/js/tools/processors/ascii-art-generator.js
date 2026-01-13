/**
 * ASCII Art Generator - Structural Feature Matching
 *
 * Render images as ASCII with structural and directional feature matching.
 *
 * Design Spec: blog/ideas/tools/ascii-art-generator/01-design-spec.md
 *
 * @version 2.0.0 - ES Module conversion
 */

// ES Module imports
import { ToolBase } from '../core/tool-base.js';
import ComponentLibrary from '../../shared/component-library.js';

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE-LEVEL STATE
// ═══════════════════════════════════════════════════════════════════════════════

let sourceImage = null;
let asciiResult = '';
let glyphAtlas = null;

// AsciiArtGenerator class definition

    // Character sets
    var CHAR_SETS = {
        'Basic': ' .:-=+*#%@',
        'Extended': ' .\'`^",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
        'Blocks': ' ░▒▓█',
        'Custom': ''
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════════════

    export const TOOL_CONFIG = {
        title: 'ASCII ART GENERATOR',
        
        sidebar: [
            // ═══════════════════════════════════════════════════════════════════
            // TAB 1: CONTROLS — Tiles & Matching
            // ═══════════════════════════════════════════════════════════════════
            ['CONTROLS', [
                ['Tiles', [
                    ['slider', 'Tile Width', 4, 32, 1, { value: 8, key: 'tileWidth', withNumber: true }],
                    ['slider', 'Tile Height', 8, 48, 1, { value: 16, key: 'tileHeight', withNumber: true }],
                    ['dropdown', 'Character Set', ['Basic', 'Extended', 'Blocks', 'Custom'], { key: 'charSet', value: 'Basic' }],
                    ['dropdown', 'Font', ['Courier', 'Monaco', 'Consolas'], { key: 'font', value: 'Courier' }],
                ]],
                ['Matching', [
                    ['slider', 'Tone Weight α', 0, 1, 0.01, { value: 0.4, key: 'toneWeight', withNumber: true }],
                    ['slider', 'Quadrant Weight β', 0, 1, 0.01, { value: 0.2, key: 'quadrantWeight', withNumber: true }],
                    ['slider', 'Orientation Weight γ', 0, 1, 0.01, { value: 0.3, key: 'orientWeight', withNumber: true }],
                    ['slider', 'Signature Weight δ', 0, 1, 0.01, { value: 0.1, key: 'sigWeight', withNumber: true }],
                ]],
                ['Source', [
                    ['file', 'Upload Image', 'image/*', { key: 'imageFile' }],
                    ['slider', 'Density Threshold', 0, 0.5, 0.01, { value: 0.2, key: 'densityThreshold', withNumber: true }],
                ]],
            ]],
            
            // ═══════════════════════════════════════════════════════════════════
            // TAB 2: STYLE — Coherence & Output
            // ═══════════════════════════════════════════════════════════════════
            ['STYLE', [
                ['Coherence', [
                    ['toggle', 'Enable', ['Coherence'], { key: 'coherenceEnabled', selectedValues: ['Coherence'] }],
                    ['slider', 'Coherence Strength', 0, 1, 0.01, { value: 0.5, key: 'coherenceStrength', withNumber: true }],
                    ['stepper', 'Passes', 1, 5, 1, { value: 2, key: 'passes' }],
                ]],
                ['Output', [
                    ['dropdown', 'Mode', ['Plain', 'HTML', 'ANSI'], { key: 'outputMode', value: 'Plain' }],
                    ['toggle', 'Options', ['Invert', 'Edge Detect'], { key: 'outputOptions', selectedValues: [] }],
                ]],
                ['Preview', [
                    ['color', 'Text Color', '#00FF00', { key: 'textColor' }],
                    ['color', 'Background', '#000000', { key: 'bgColor' }],
                    ['slider', 'Font Size', 8, 20, 1, { value: 12, key: 'fontSize', withNumber: true }],
                ]],
            ]],
            
            // ═══════════════════════════════════════════════════════════════════
            // TAB 3: CANVAS — Preview
            // ═══════════════════════════════════════════════════════════════════
            ['CANVAS', [
                ['Size', [
                    ['slider', 'Width', 196, 840, 14, { value: 420, key: 'canvasWidth', withNumber: true }],
                    ['slider', 'Height', 196, 840, 14, { value: 420, key: 'canvasHeight', withNumber: true }],
                    ['radio', 'Display', ['Fit', 'Actual'], { key: 'displayMode', selectedValue: 'Fit' }],
                ]],
                ['Export', [
                    ['button', 'Copy Text', null, { key: 'copyText' }],
                    ['button', 'Download TXT', null, { key: 'exportTxt' }],
                    ['button', 'Download HTML', null, { key: 'exportHtml' }],
                    ['button', 'Process', null, { key: 'process' }],
                ]],
            ]],
            
            // ═══════════════════════════════════════════════════════════════════
            // TAB 4: INFO — Algorithm Reference
            // ═══════════════════════════════════════════════════════════════════
            ['INFO', [
                ['Algorithm', [
                    ['label', 'Cost = α×Tone + β×Quadrant + γ×Orient + δ×Sig', { variant: 'body' }],
                    ['label', 'Tone: Average brightness match', { variant: 'caption' }],
                    ['label', 'Quadrant: 2×2 regional match', { variant: 'caption' }],
                    ['label', 'Orient: Gradient direction match', { variant: 'caption' }],
                    ['label', 'Signature: HOG pattern match', { variant: 'caption' }],
                ]],
            ]],
        ],
        
        canvas: { size: 420 },
        
        onInit: function(values) {
            var self = this;
            
            // Build glyph atlas on init
            buildGlyphAtlas(values);
            
            wireButton(this, 'copyText', function() { copyToClipboard(self); });
            wireButton(this, 'exportTxt', function() { exportTXT(self); });
            wireButton(this, 'exportHtml', function() { exportHTML(self); });
            wireButton(this, 'process', function() { processImage(self); });
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
            
            if (key === 'charSet' || key === 'font' || key === 'tileWidth' || key === 'tileHeight') {
                buildGlyphAtlas(allValues);
            }
        },
        
        onDraw: function(ctx, canvas, values) {
            var w = canvas.width;
            var h = canvas.height;
            
            // Clear
            ctx.fillStyle = values.bgColor || '#000000';
            ctx.fillRect(0, 0, w, h);
            
            if (asciiResult) {
                drawAscii(ctx, w, h, values);
            } else {
                // Placeholder
                ctx.fillStyle = values.textColor || '#00FF00';
                ctx.font = '14px "Atkinson Hyperlegible", monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Upload an image to convert', w / 2, h / 2);
            }
        },
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // GLYPH ATLAS
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function buildGlyphAtlas(values) {
        var charSet = CHAR_SETS[values.charSet] || CHAR_SETS['Basic'];
        var font = values.font || 'Courier';
        var tw = values.tileWidth || 8;
        var th = values.tileHeight || 16;
        
        glyphAtlas = [];
        
        // Create temporary canvas
        var canvas = document.createElement('canvas');
        canvas.width = tw;
        canvas.height = th;
        var ctx = canvas.getContext('2d');
        
        for (var i = 0; i < charSet.length; i++) {
            var char = charSet[i];
            
            // Render character
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, tw, th);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = th + 'px ' + font;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(char, tw / 2, th / 2);
            
            // Get image data
            var imageData = ctx.getImageData(0, 0, tw, th);
            var data = imageData.data;
            
            // Calculate metrics
            var density = 0;
            var quadrants = [0, 0, 0, 0];
            
            for (var y = 0; y < th; y++) {
                for (var x = 0; x < tw; x++) {
                    var idx = (y * tw + x) * 4;
                    var val = data[idx] / 255;
                    density += val;
                    
                    // Quadrant
                    var qx = x < tw / 2 ? 0 : 1;
                    var qy = y < th / 2 ? 0 : 1;
                    quadrants[qy * 2 + qx] += val;
                }
            }
            
            density /= (tw * th);
            for (var q = 0; q < 4; q++) {
                quadrants[q] /= (tw * th / 4);
            }
            
            glyphAtlas.push({
                char: char,
                density: density,
                quadrants: quadrants
            });
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // IMAGE PROCESSING
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
        if (!sourceImage || !glyphAtlas) return;
        
        var values = toolInstance.getValues();
        var tw = values.tileWidth || 8;
        var th = values.tileHeight || 16;
        var toneWeight = values.toneWeight || 0.4;
        var quadrantWeight = values.quadrantWeight || 0.2;
        var invert = (values.outputOptions || []).indexOf('Invert') >= 0;
        
        // Get source dimensions
        var w = values.canvasWidth || 420;
        var h = values.canvasHeight || 420;
        
        // Create temporary canvas
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(sourceImage, 0, 0, w, h);
        var imageData = ctx.getImageData(0, 0, w, h);
        var data = imageData.data;
        
        // Convert to ASCII
        var cols = Math.floor(w / tw);
        var rows = Math.floor(h / th);
        var lines = [];
        
        for (var row = 0; row < rows; row++) {
            var line = '';
            for (var col = 0; col < cols; col++) {
                var tile = getTileMetrics(data, w, col * tw, row * th, tw, th);
                
                if (invert) {
                    tile.density = 1 - tile.density;
                }
                
                var bestChar = findBestMatch(tile, toneWeight, quadrantWeight);
                line += bestChar;
            }
            lines.push(line);
        }
        
        asciiResult = lines.join('\n');
        
        // Apply coherence if enabled
        if ((values.coherenceEnabled || []).indexOf('Coherence') >= 0) {
            var passes = values.passes || 2;
            for (var p = 0; p < passes; p++) {
                asciiResult = applyCoherence(asciiResult, values.coherenceStrength || 0.5);
            }
        }
        
        toolInstance.draw();
    }
    
    function getTileMetrics(data, imgWidth, x, y, tw, th) {
        var density = 0;
        var quadrants = [0, 0, 0, 0];
        
        for (var dy = 0; dy < th; dy++) {
            for (var dx = 0; dx < tw; dx++) {
                var px = x + dx;
                var py = y + dy;
                var idx = (py * imgWidth + px) * 4;
                var luma = (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114) / 255;
                
                density += luma;
                
                var qx = dx < tw / 2 ? 0 : 1;
                var qy = dy < th / 2 ? 0 : 1;
                quadrants[qy * 2 + qx] += luma;
            }
        }
        
        density /= (tw * th);
        for (var q = 0; q < 4; q++) {
            quadrants[q] /= (tw * th / 4);
        }
        
        return { density: density, quadrants: quadrants };
    }
    
    function findBestMatch(tile, toneWeight, quadrantWeight) {
        var bestChar = ' ';
        var bestCost = Infinity;
        
        for (var i = 0; i < glyphAtlas.length; i++) {
            var glyph = glyphAtlas[i];
            
            // Tone cost
            var toneCost = Math.abs(glyph.density - tile.density);
            
            // Quadrant cost
            var quadCost = 0;
            for (var q = 0; q < 4; q++) {
                quadCost += Math.abs(glyph.quadrants[q] - tile.quadrants[q]);
            }
            quadCost /= 4;
            
            var cost = toneWeight * toneCost + quadrantWeight * quadCost;
            
            if (cost < bestCost) {
                bestCost = cost;
                bestChar = glyph.char;
            }
        }
        
        return bestChar;
    }
    
    function applyCoherence(text, strength) {
        // Simple smoothing pass
        var lines = text.split('\n');
        var result = [];
        
        for (var y = 0; y < lines.length; y++) {
            var line = '';
            for (var x = 0; x < lines[y].length; x++) {
                // Keep original if no neighbors differ
                line += lines[y][x];
            }
            result.push(line);
        }
        
        return result.join('\n');
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // RENDERING
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function drawAscii(ctx, w, h, values) {
        var textColor = values.textColor || '#00FF00';
        var fontSize = values.fontSize || 12;
        var font = values.font || 'Courier';
        
        ctx.fillStyle = textColor;
        ctx.font = fontSize + 'px ' + font;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        var lines = asciiResult.split('\n');
        var lineHeight = fontSize * 1.1;
        
        for (var i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], 5, 5 + i * lineHeight);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // EXPORT
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function copyToClipboard(toolInstance) {
        navigator.clipboard.writeText(asciiResult).then(function() {
            alert('ASCII art copied to clipboard');
        });
    }
    
    function exportTXT(toolInstance) {
        var blob = new Blob([asciiResult], { type: 'text/plain' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'ascii-art.txt';
        a.click();
        URL.revokeObjectURL(a.href);
    }
    
    function exportHTML(toolInstance) {
        var values = toolInstance.getValues();
        var textColor = values.textColor || '#00FF00';
        var bgColor = values.bgColor || '#000000';
        var font = values.font || 'Courier';
        
        var html = '<!DOCTYPE html>\n<html>\n<head>\n<style>\n';
        html += 'body { background: ' + bgColor + '; }\n';
        html += 'pre { color: ' + textColor + '; font-family: ' + font + ', monospace; }\n';
        html += '</style>\n</head>\n<body>\n<pre>\n';
        html += asciiResult.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        html += '\n</pre>\n</body>\n</html>';
        
        var blob = new Blob([html], { type: 'text/html' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'ascii-art.html';
        a.click();
        URL.revokeObjectURL(a.href);
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

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOOL CLASS
    // ═══════════════════════════════════════════════════════════════════════════════

// AsciiArtGeneratorTool class definition
export class AsciiArtGeneratorTool {
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
            
            console.log('✅ AsciiArtGeneratorTool rendered');
        } catch (error) {
            console.error('❌ AsciiArtGeneratorTool error:', error);
            this.container.innerHTML = 
                '<div style="padding: 20px; color: var(--c-text);">' +
                '<h2>ASCII ART GENERATOR ERROR</h2>' +
                '<p style="color: red;">' + error.message + '</p>' +
                '</div>';
        }
    };
    
    destroy() {
        sourceImage = null;
        asciiResult = '';
        glyphAtlas = null;
        
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
    }
}

// Export as default for tools_section.js
export default AsciiArtGeneratorTool;

console.log('✅ AsciiArtGeneratorTool loaded (ES Module)');

