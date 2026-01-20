/**
 * Tile Mosaic System - Decorative Tile Pattern Generator
 * 
 * Generate tile-based mosaics with concentric discs, wedges, and stripes.
 * 
 * Design Spec: blog/ideas/tools/tile-mosaic-system/01-design-spec.md
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
    var tiles = [];
    var seed = 1234;

    // ═══════════════════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════════════

    export const TOOL_CONFIG = {
        title: 'TILE MOSAIC',
        
        sidebar: [
            // ═══════════════════════════════════════════════════════════════════
            // TAB 1: CONTROLS
            // ═══════════════════════════════════════════════════════════════════
            ['CONTROLS', [
                ['Parameters', [
                    ['slider', 'Grid Columns', 4, 80, 1, { value: 30, key: 'gridCols', withNumber: true }],
                    ['slider', 'Grid Rows', 4, 80, 1, { value: 30, key: 'gridRows', withNumber: true }],
                    ['slider', 'Tile Size', 10, 80, 1, { value: 24, key: 'tileSize', withNumber: true }],
                    ['dropdown', 'Layout Mode', ['Uniform', 'Packed A', 'Packed B'], { key: 'layoutMode', value: 'Uniform' }],
                ]],
                ['Behavior', [
                    ['number', 'Random Seed', 0, 999999, 1, { value: 1234, key: 'seed' }],
                    ['dropdown', 'Animation Mode', ['Static', 'Morph', 'Breathing', 'Drift'], { key: 'animMode', value: 'Static' }],
                    ['slider', 'Animation Speed', 0.1, 5, 0.1, { value: 1, key: 'animSpeed', withNumber: true }],
                ]],
            ]],
            
            // ═══════════════════════════════════════════════════════════════════
            // TAB 2: STYLE
            // ═══════════════════════════════════════════════════════════════════
            ['STYLE', [
                ['Colors', [
                    ['dropdown', 'Palette', ['Warm', 'Cool', 'Mixed', 'Earth', 'Mono'], { key: 'palette', value: 'Mixed' }],
                    ['slider', 'Color Variance', 0, 1, 0.01, { value: 0.3, key: 'colorVariance', withNumber: true }],
                    ['color', 'Background', '#000000', { key: 'bgColor' }],
                ]],
                ['Depth & Light', [
                    ['slider', 'Depth Strength', 0, 1, 0.01, { value: 0.4, key: 'depthStrength', withNumber: true }],
                    ['slider', 'Highlight', 0, 1, 0.01, { value: 0.25, key: 'highlight', withNumber: true }],
                    ['slider', 'Light Angle', 0, 360, 1, { value: 315, key: 'lightAngle', withNumber: true }],
                ]],
                ['Tile Style', [
                    ['dropdown', 'Tile Type', ['Disc', 'Wedge', 'Stripe', 'Mixed'], { key: 'tileType', value: 'Mixed' }],
                    ['slider', 'Gap', 0, 5, 0.5, { value: 1, key: 'gap', withNumber: true }],
                ]],
            ]],
            
            // ═══════════════════════════════════════════════════════════════════
            // TAB 3: ANIMATION
            // ═══════════════════════════════════════════════════════════════════
            ['ANIMATION', [
                ['Playback', [
                    ['button', 'Play', null, { key: 'play' }],
                    ['button', 'Pause', null, { key: 'pause' }],
                    ['button', 'Reset', null, { key: 'reset' }],
                    ['slider', 'FPS', 1, 60, 1, { value: 30, key: 'fps', withNumber: true }],
                ]],
                ['Export', [
                    ['button', 'Export Frame', null, { key: 'exportFrame' }],
                    ['button', 'Export GIF', null, { key: 'exportGif' }],
                ]],
            ]],
            
            // ═══════════════════════════════════════════════════════════════════
            // TAB 4: CANVAS
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
                    ['button', 'Regenerate', null, { key: 'regenerate' }],
                ]],
            ]],
        ],
        
        canvas: { size: 420 },
        
        onInit: function(values) {
            var self = this;
            seed = values.seed || 1234;
            
            // Wire animation buttons
            wireButton(this, 'play', function() { startAnimation(self); });
            wireButton(this, 'pause', function() { pauseAnimation(); });
            wireButton(this, 'reset', function() { resetAnimation(self); });
            
            // Wire export buttons
            wireButton(this, 'exportFrame', function() { exportPNG(self); });
            wireButton(this, 'exportGif', function() { alert('GIF export: Record animation frames'); });
            wireButton(this, 'exportPng', function() { exportPNG(self); });
            wireButton(this, 'exportSvg', function() { exportSVG(self); });
            wireButton(this, 'regenerate', function() { 
                seed = Math.floor(Math.random() * 999999);
                self.setValue('seed', seed);
                generateTiles(self.getValues());
                self.draw();
            });
            
            generateTiles(values);
        },
        
        onUpdate: function(key, value, allValues) {
            if (key === 'canvasWidth' || key === 'canvasHeight' || key === 'displayMode') {
                this.resizeCanvas(
                    allValues.canvasWidth || 420,
                    allValues.canvasHeight || 420,
                    { displayMode: (allValues.displayMode || 'Fit').toLowerCase() }
                );
            }
            
            if (key === 'seed') {
                seed = value;
            }
            
            if (['gridCols', 'gridRows', 'tileSize', 'layoutMode', 'seed', 'tileType'].indexOf(key) >= 0) {
                generateTiles(allValues);
            }
            
            if (key === 'fps' && animator) {
                animator.fps = value;
            }
        },
        
        onDraw: function(ctx, canvas, values) {
            var w = canvas.width;
            var h = canvas.height;
            
            // Clear
            ctx.fillStyle = values.bgColor || '#000000';
            ctx.fillRect(0, 0, w, h);
            
            // Draw tiles
            drawTiles(ctx, w, h, values, frameIndex);
        },
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // TILE GENERATION
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function generateTiles(values) {
        tiles = [];
        var cols = values.gridCols || 30;
        var rows = values.gridRows || 30;
        var size = values.tileSize || 24;
        var tileType = values.tileType || 'Mixed';
        var rng = createRNG(seed);
        
        for (var j = 0; j < rows; j++) {
            for (var i = 0; i < cols; i++) {
                var type;
                if (tileType === 'Mixed') {
                    var r = rng();
                    if (r < 0.4) type = 'disc';
                    else if (r < 0.7) type = 'wedge';
                    else type = 'stripe';
                } else {
                    type = tileType.toLowerCase();
                }
                
                tiles.push({
                    col: i,
                    row: j,
                    type: type,
                    colorIdx: Math.floor(rng() * 5),
                    rotation: Math.floor(rng() * 4) * 90,
                    rings: 2 + Math.floor(rng() * 3),
                    phase: rng() * Math.PI * 2
                });
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // RENDERING
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function drawTiles(ctx, w, h, values, frame) {
        var cols = values.gridCols || 30;
        var rows = values.gridRows || 30;
        var size = values.tileSize || 24;
        var gap = values.gap || 1;
        var palette = getPalette(values.palette || 'Mixed');
        var colorVariance = values.colorVariance || 0.3;
        var depthStrength = values.depthStrength || 0.4;
        var highlight = values.highlight || 0.25;
        var lightAngle = (values.lightAngle || 315) * Math.PI / 180;
        var animMode = values.animMode || 'Static';
        var animSpeed = values.animSpeed || 1;
        
        var tileWidth = (w - gap) / cols;
        var tileHeight = (h - gap) / rows;
        
        for (var ti = 0; ti < tiles.length; ti++) {
            var tile = tiles[ti];
            var x = tile.col * tileWidth + gap / 2;
            var y = tile.row * tileHeight + gap / 2;
            var tw = tileWidth - gap;
            var th = tileHeight - gap;
            
            // Animation modifiers
            var animPhase = tile.phase + frame * 0.05 * animSpeed;
            var scale = 1;
            var rotation = tile.rotation;
            
            if (animMode === 'Morph') {
                rotation += Math.sin(animPhase) * 45;
            } else if (animMode === 'Breathing') {
                scale = 0.9 + 0.1 * Math.sin(animPhase);
            } else if (animMode === 'Drift') {
                x += Math.sin(animPhase) * 2;
                y += Math.cos(animPhase * 0.7) * 2;
            }
            
            // Get colors
            var baseColor = palette[tile.colorIdx % palette.length];
            var colors = generateTileColors(baseColor, colorVariance, depthStrength, highlight, lightAngle);
            
            // Draw tile
            ctx.save();
            ctx.translate(x + tw / 2, y + th / 2);
            ctx.rotate(rotation * Math.PI / 180);
            ctx.scale(scale, scale);
            
            switch (tile.type) {
                case 'disc':
                    drawDiscTile(ctx, tw, th, colors, tile.rings);
                    break;
                case 'wedge':
                    drawWedgeTile(ctx, tw, th, colors);
                    break;
                case 'stripe':
                    drawStripeTile(ctx, tw, th, colors);
                    break;
            }
            
            ctx.restore();
        }
    }
    
    function drawDiscTile(ctx, w, h, colors, rings) {
        var r = Math.min(w, h) / 2;
        
        for (var i = rings; i > 0; i--) {
            var radius = (i / rings) * r;
            ctx.fillStyle = colors[i % colors.length];
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    function drawWedgeTile(ctx, w, h, colors) {
        var r = Math.min(w, h) / 2 * 1.2;
        var sectors = 4;
        
        for (var i = 0; i < sectors; i++) {
            var startAngle = (i / sectors) * Math.PI * 2;
            var endAngle = ((i + 1) / sectors) * Math.PI * 2;
            
            ctx.fillStyle = colors[i % colors.length];
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, r, startAngle, endAngle);
            ctx.closePath();
            ctx.fill();
        }
    }
    
    function drawStripeTile(ctx, w, h, colors) {
        var stripes = 4;
        var stripeWidth = w / stripes;
        
        for (var i = 0; i < stripes; i++) {
            ctx.fillStyle = colors[i % colors.length];
            ctx.fillRect(-w / 2 + i * stripeWidth, -h / 2, stripeWidth, h);
        }
    }
    
    function generateTileColors(baseColor, variance, depth, highlight, lightAngle) {
        var colors = [];
        var base = parseColor(baseColor);
        
        for (var i = 0; i < 4; i++) {
            var factor = 1 - (i * depth * 0.2);
            var h = (i === 0) ? highlight : 0;
            
            colors.push(colorToHex({
                r: Math.min(255, base.r * factor + h * 100 + (Math.random() - 0.5) * variance * 50),
                g: Math.min(255, base.g * factor + h * 100 + (Math.random() - 0.5) * variance * 50),
                b: Math.min(255, base.b * factor + h * 100 + (Math.random() - 0.5) * variance * 50)
            }));
        }
        
        return colors;
    }
    
    function getPalette(name) {
        var palettes = {
            'Warm': ['#FF6B6B', '#FFE66D', '#FF8E53', '#FF5E5B', '#D9534F'],
            'Cool': ['#4ECDC4', '#45B7D1', '#96CEB4', '#88D8B0', '#5BC0BE'],
            'Mixed': ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'],
            'Earth': ['#8B4513', '#A0522D', '#CD853F', '#DEB887', '#D2691E'],
            'Mono': ['#FFFFFF', '#CCCCCC', '#999999', '#666666', '#333333']
        };
        return palettes[name] || palettes['Mixed'];
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
        
        if (animator && animator.isPaused) {
            animator.resume();
            isAnimating = true;
            return;
        }
        
        if (animator) animator.destroy();
        
        isAnimating = true;
        animator = new AnimationLoop({
            fps: fps,
            onFrame: function() {
                frameIndex++;
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
        if (animator) animator.stop();
        toolInstance.draw();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function createRNG(seed) {
        var s = seed;
        return function() {
            s = (s * 1103515245 + 12345) & 0x7fffffff;
            return s / 0x7fffffff;
        };
    }
    
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
            ('0' + Math.max(0, Math.min(255, Math.round(c.r))).toString(16)).slice(-2) +
            ('0' + Math.max(0, Math.min(255, Math.round(c.g))).toString(16)).slice(-2) +
            ('0' + Math.max(0, Math.min(255, Math.round(c.b))).toString(16)).slice(-2);
    }
    
    function exportPNG(tool) {
        const canvas = tool.getCanvas();
        if (!canvas) return;
        ExportUtils.exportCanvasPNG(canvas, 'tile-mosaic');
    }
    
    function exportSVG(tool) {
        alert('SVG export coming soon');
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOOL CLASS
    // ═══════════════════════════════════════════════════════════════════════════════

export class TileMosaicTool {
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
            
            console.log('✅ TileMosaicTool rendered');
        } catch (error) {
            console.error('❌ TileMosaicTool error:', error);
            this.container.innerHTML = 
                '<div style="padding: 20px; color: var(--c-text);">' +
                '<h2>TILE MOSAIC ERROR</h2>' +
                '<p style="color: red;">' + error.message + '</p>' +
                '</div>';
        }
    }
    
    destroy() {
        if (animator) {
            animator.destroy();
            animator = null;
        }
        tiles = [];
        frameIndex = 0;
        isAnimating = false;
        
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
    }
}

// Export as default for tools_section.js
export default TileMosaicTool;

console.log('✅ TileMosaicTool loaded (ES Module)');

