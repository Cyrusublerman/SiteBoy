/**
 * Tile Mosaic Generator
 * 
 * Deterministic tile mosaics with 3D depth shading and animation.
 * Based on mid-century geometric tile art with raised/embossed effect.
 * 
 * @version 2.2.0 - Fixed depth shading, animation, overlap, SeedInput
 * @source blog/ideas/art/generative/Tile Mosaic/Tile Mosaic Full Spec.md
 */
// ES Module imports
import { ToolBase } from '../core/tool-base.js';
import ComponentLibrary from '../../shared/component-library.js';
import { AnimationLoop } from '../../core/animation-foundation.js';
import { ExportUtils } from '../../shared/algorithms/index.js';

// ═══════════════════════════════════════════════════════════════════════════════
    // MODULE-LEVEL STATE
    // ═══════════════════════════════════════════════════════════════════════════════
    
    var state = {
        lattice: null,
        macroTiles: null,
        sprites: null,
        animator: null,
        time: 0,
        playing: false
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // PRNG MODULE
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function PRNG(seed) {
        this.state = seed >>> 0;
    }
    
    PRNG.prototype.next = function() {
        this.state = ((this.state * 1664525) + 1013904223) >>> 0;
        return this.state / 0x100000000;
    };
    
    PRNG.prototype.nextInt = function(max) {
        return Math.floor(this.next() * max);
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // PALETTE MODULE (from Color Quantizer + custom)
    // ═══════════════════════════════════════════════════════════════════════════════
    
    // Import single-color palettes from color quantizer
    var QUANTIZER_PALETTES = {
        '1-bit': ['#000000', '#FFFFFF'],
        '2-bit': ['#000000', '#555555', '#AAAAAA', '#FFFFFF'],
        '3-bit': ['#000000', '#FF0000', '#00FF00', '#FFFF00', '#0000FF', '#FF00FF', '#00FFFF', '#FFFFFF'],
        '3-bit-gray': ['#000000', '#242424', '#484848', '#6C6C6C', '#909090', '#B4B4B4', '#D8D8D8', '#FFFFFF'],
        'nes': ['#7C7C7C', '#0000FC', '#0000BC', '#4428BC', '#940084', '#A80020', '#A81000', '#881400', '#503000', '#007800', '#006800', '#005800', '#004058', '#000000', '#F8F8F8', '#FFFFFF'],
        'gameboy': ['#0F380F', '#306230', '#8BAC0F', '#9BBC0F'],
        'primaries': ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF'],
        'pastel': ['#FFC0CB', '#E6E6FA', '#ADD8E6', '#98FF98', '#FFFFE0', '#FFDAB9'],
        'ggost': ['#000000', '#1E2223', '#224AC4', '#6245B9', '#65A3EC', '#6AB960', '#8B897D', '#9C3B35', '#B8C0C3', '#C56B60', '#F88127', '#FB5A9E', '#FBDF2B', '#FCC292', '#FD432A', '#FDE6C4', '#FFFFFF']
    };
    
    // Split into 4-color sub-palettes for tile variation
    function createTilePalettes(colors) {
        var palettes = [];
        var chunkSize = Math.max(4, Math.floor(colors.length / 4));
        
        for (var i = 0; i < 4; i++) {
            var start = (i * chunkSize) % colors.length;
            var palette = [];
            for (var j = 0; j < 4; j++) {
                palette.push(colors[(start + j) % colors.length]);
            }
            palettes.push(palette);
        }
        
        return palettes;
    }
    
    // Generate all palettes
    var PALETTES = {};
    for (var name in QUANTIZER_PALETTES) {
        PALETTES[name] = createTilePalettes(QUANTIZER_PALETTES[name]);
    }
    
    // Add custom artistic palettes
    PALETTES['vibrant'] = [
        ['#FF0000', '#FFFFFF', '#000000', '#FFFF00'],
        ['#0000FF', '#00FFFF', '#FFFFFF', '#000000'],
        ['#FF6600', '#FFFF00', '#FFFFFF', '#000000'],
        ['#008000', '#00FF00', '#FFFF00', '#FFFFFF']
    ];
    PALETTES['earth'] = [
        ['#8B4513', '#D2691E', '#F5DEB3', '#000000'],
        ['#556B2F', '#808000', '#BDB76B', '#FFFFFF'],
        ['#8B4513', '#CD853F', '#DEB887', '#000000'],
        ['#2F4F4F', '#696969', '#A9A9A9', '#FFFFFF']
    ];
    PALETTES['retro'] = [
        ['#FF6347', '#FFD700', '#00CED1', '#FFFFFF'],
        ['#FF1493', '#FF69B4', '#FFFFE0', '#000000'],
        ['#FF4500', '#FFA500', '#FFFF00', '#000000'],
        ['#4169E1', '#87CEEB', '#F0E68C', '#FFFFFF']
    ];

    // ═══════════════════════════════════════════════════════════════════════════════
    // LATTICE MODULE
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function generateLattice(C, R) {
        var lattice = [];
        for (var j = 0; j < R; j++) {
            for (var i = 0; i < C; i++) {
                lattice.push({
                    id: j * C + i,
                    i: i,
                    j: j,
                    tileId: -1
                });
            }
        }
        return lattice;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // LAYOUT MODULE
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function layoutL0(lattice, C, R, rng) {
        var tiles = [];
        for (var idx = 0; idx < lattice.length; idx++) {
            var cell = lattice[idx];
            cell.tileId = idx;
            
            tiles.push({
                id: idx,
                cells: [cell],
                bounds: { x: cell.i, y: cell.j, w: 1, h: 1 },
                grammar: selectGrammar(rng),
                seed: rng.nextInt(0xFFFFFF),
                paletteIndex: rng.nextInt(4)
            });
        }
        return tiles;
    }
    
    function layoutL1(lattice, C, R, rng) {
        var tiles = [];
        var tileId = 0;
        var occupied = {};
        
        // Try 2×2 blocks
        for (var j = 0; j <= R - 2; j += 2) {
            for (var i = 0; i <= C - 2; i += 2) {
                var idx = j * C + i;
                if (occupied[idx]) continue;
                
                if (rng.next() < 0.7 && i + 1 < C && j + 1 < R) {
                    var cells = [
                        lattice[idx],
                        lattice[idx + 1],
                        lattice[idx + C],
                        lattice[idx + C + 1]
                    ];
                    
                    for (var k = 0; k < cells.length; k++) {
                        cells[k].tileId = tileId;
                        occupied[cells[k].id] = true;
                    }
                    
                    tiles.push({
                        id: tileId,
                        cells: cells,
                        bounds: { x: i, y: j, w: 2, h: 2 },
                        grammar: selectGrammar(rng),
                        seed: rng.nextInt(0xFFFFFF),
                        paletteIndex: rng.nextInt(4)
                    });
                    
                    tileId++;
                }
            }
        }
        
        // Fill remaining with 1×1
        for (var idx = 0; idx < lattice.length; idx++) {
            if (!occupied[idx]) {
                var cell = lattice[idx];
                cell.tileId = tileId;
                
                tiles.push({
                    id: tileId,
                    cells: [cell],
                    bounds: { x: cell.i, y: cell.j, w: 1, h: 1 },
                    grammar: selectGrammar(rng),
                    seed: rng.nextInt(0xFFFFFF),
                    paletteIndex: rng.nextInt(4)
                });
                
                tileId++;
            }
        }
        
        return tiles;
    }
    
    function layoutL2(lattice, C, R, rng) {
        var tiles = [];
        var tileId = 0;
        var occupied = {};
        
        // Try 3×3 tiles
        for (var j = 0; j <= R - 3; j++) {
            for (var i = 0; i <= C - 3; i++) {
                var idx = j * C + i;
                if (occupied[idx] || rng.next() >= 0.15) continue;
                
                var cells = [];
                var valid = true;
                
                for (var dy = 0; dy < 3; dy++) {
                    for (var dx = 0; dx < 3; dx++) {
                        var cellIdx = (j + dy) * C + (i + dx);
                        if (occupied[cellIdx]) {
                            valid = false;
                            break;
                        }
                        cells.push(lattice[cellIdx]);
                    }
                    if (!valid) break;
                }
                
                if (valid) {
                    for (var k = 0; k < cells.length; k++) {
                        cells[k].tileId = tileId;
                        occupied[cells[k].id] = true;
                    }
                    
                    tiles.push({
                        id: tileId,
                        cells: cells,
                        bounds: { x: i, y: j, w: 3, h: 3 },
                        grammar: selectGrammar(rng),
                        seed: rng.nextInt(0xFFFFFF),
                        paletteIndex: rng.nextInt(4)
                    });
                    
                    tileId++;
                }
            }
        }
        
        // Fill remaining with 1×1, 2×1, 1×2
        for (var idx = 0; idx < lattice.length; idx++) {
            if (!occupied[idx]) {
                var cell = lattice[idx];
                var i = cell.i;
                var j = cell.j;
                var cells = [cell];
                var w = 1, h = 1;
                
                if (rng.next() < 0.3 && i + 1 < C && !occupied[idx + 1]) {
                    cells.push(lattice[idx + 1]);
                    w = 2;
                } else if (rng.next() < 0.3 && j + 1 < R && !occupied[idx + C]) {
                    cells.push(lattice[idx + C]);
                    h = 2;
                }
                
                for (var k = 0; k < cells.length; k++) {
                    cells[k].tileId = tileId;
                    occupied[cells[k].id] = true;
                }
                
                tiles.push({
                    id: tileId,
                    cells: cells,
                    bounds: { x: i, y: j, w: w, h: h },
                    grammar: selectGrammar(rng),
                    seed: rng.nextInt(0xFFFFFF),
                    paletteIndex: rng.nextInt(4)
                });
                
                tileId++;
            }
        }
        
        return tiles;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // GRAMMAR MODULE
    // ═══════════════════════════════════════════════════════════════════════════════
    
    var GRAMMARS = ['concentric', 'wedge', 'stripe', 'microdots', 'solid'];
    
    function selectGrammar(rng) {
        return GRAMMARS[rng.nextInt(GRAMMARS.length)];
    }
    
    function renderConcentric(ctx, w, h, palette, rng) {
        var cx = w / 2;
        var cy = h / 2;
        var maxR = Math.min(w, h) / 2;
        var n = 2 + rng.nextInt(4);
        
        for (var k = n; k >= 1; k--) {
            var r = maxR * k / (n + 1);
            var colorIdx = k % palette.length;
            
            ctx.fillStyle = palette[colorIdx];
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    function renderWedge(ctx, w, h, palette, rng) {
        var cx = w / 2;
        var cy = h / 2;
        var maxR = Math.max(w, h);
        var n = 4 + rng.nextInt(8);
        
        for (var k = 0; k < n; k++) {
            var theta0 = k * Math.PI * 2 / n;
            var theta1 = (k + 1) * Math.PI * 2 / n;
            var colorIdx = k % palette.length;
            
            ctx.fillStyle = palette[colorIdx];
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, maxR, theta0, theta1);
            ctx.closePath();
            ctx.fill();
        }
    }
    
    function renderStripe(ctx, w, h, palette, rng) {
        var n = 3 + rng.nextInt(6);
        var vertical = rng.next() > 0.5;
        
        for (var k = 0; k < n; k++) {
            var colorIdx = k % palette.length;
            ctx.fillStyle = palette[colorIdx];
            
            if (vertical) {
                ctx.fillRect(k * w / n, 0, w / n, h);
            } else {
                ctx.fillRect(0, k * h / n, w, h / n);
            }
        }
    }
    
    function renderMicrodots(ctx, w, h, palette, rng) {
        var n = 15 + rng.nextInt(30);
        
        ctx.fillStyle = palette[0];
        ctx.fillRect(0, 0, w, h);
        
        for (var k = 0; k < n; k++) {
            var x = rng.next() * w;
            var y = rng.next() * h;
            var r = 2 + rng.next() * Math.min(w, h) * 0.1;
            var colorIdx = 1 + rng.nextInt(palette.length - 1);
            
            ctx.fillStyle = palette[colorIdx];
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    function renderSolid(ctx, w, h, palette, rng) {
        var colorIdx = rng.nextInt(palette.length);
        ctx.fillStyle = palette[colorIdx];
        ctx.fillRect(0, 0, w, h);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // NOISE TEXTURE MODULE
    // ═══════════════════════════════════════════════════════════════════════════════
    
    /**
     * Simplex noise (imported from algorithms library pattern)
     * @source assets/js/shared/algorithms/noise/noise-functions.js
     */
    function simplex2D(x, y) {
        var F2 = 0.5 * (Math.sqrt(3) - 1);
        var G2 = (3 - Math.sqrt(3)) / 6;
        
        var s = (x + y) * F2;
        var i = Math.floor(x + s);
        var j = Math.floor(y + s);
        
        var t = (i + j) * G2;
        var X0 = i - t;
        var Y0 = j - t;
        var x0 = x - X0;
        var y0 = y - Y0;
        
        var i1 = x0 > y0 ? 1 : 0;
        var j1 = x0 > y0 ? 0 : 1;
        
        var x1 = x0 - i1 + G2;
        var y1 = y0 - j1 + G2;
        var x2 = x0 - 1 + 2 * G2;
        var y2 = y0 - 1 + 2 * G2;
        
        var ii = i & 255;
        var jj = j & 255;
        
        // Simple gradient selection
        var gi0 = ((ii + jj * 57) & 255) % 8;
        var gi1 = ((ii + i1 + (jj + j1) * 57) & 255) % 8;
        var gi2 = ((ii + 1 + (jj + 1) * 57) & 255) % 8;
        
        var grad = [
            [1, 1], [-1, 1], [1, -1], [-1, -1],
            [1, 0], [-1, 0], [0, 1], [0, -1]
        ];
        
        var n0 = 0, n1 = 0, n2 = 0;
        
        var t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 >= 0) {
            t0 *= t0;
            n0 = t0 * t0 * (grad[gi0][0] * x0 + grad[gi0][1] * y0);
        }
        
        var t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 >= 0) {
            t1 *= t1;
            n1 = t1 * t1 * (grad[gi1][0] * x1 + grad[gi1][1] * y1);
        }
        
        var t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 >= 0) {
            t2 *= t2;
            n2 = t2 * t2 * (grad[gi2][0] * x2 + grad[gi2][1] * y2);
        }
        
        return 70 * (n0 + n1 + n2);
    }
    
    /**
     * Fractal Brownian Motion
     * @formula fBm(x) = Σ persistence^i · noise(x · lacunarity^i)
     */
    function fbm2D(x, y, octaves, lacunarity, persistence) {
        var value = 0;
        var amplitude = 1;
        var frequency = 1;
        var maxValue = 0;
        
        for (var i = 0; i < octaves; i++) {
            value += amplitude * simplex2D(x * frequency, y * frequency);
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= lacunarity;
        }
        
        return value / maxValue;
    }
    
    /**
     * Apply texture noise to sprite
     * Separate controls for color and depth variation
     */
    function applyTexture(ctx, w, h, textureParams) {
        if (textureParams.colorStrength <= 0 && textureParams.depthStrength <= 0) return;
        
        var imageData = ctx.getImageData(0, 0, w, h);
        var data = imageData.data;
        
        var scale = textureParams.scale;
        var octaves = textureParams.octaves;
        var lacunarity = textureParams.lacunarity;
        var persistence = textureParams.persistence;
        
        for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
                var idx = (y * w + x) * 4;
                
                // Get noise value
                var noise = fbm2D(x * scale, y * scale, octaves, lacunarity, persistence);
                
                // Color variation (affects RGB channels)
                if (textureParams.colorStrength > 0) {
                    var colorFactor = 1 + noise * textureParams.colorStrength * 0.3;
                    data[idx] = Math.max(0, Math.min(255, data[idx] * colorFactor));
                    data[idx + 1] = Math.max(0, Math.min(255, data[idx + 1] * colorFactor));
                    data[idx + 2] = Math.max(0, Math.min(255, data[idx + 2] * colorFactor));
                }
                
                // Depth variation (simulates surface bumps)
                if (textureParams.depthStrength > 0) {
                    // Calculate fake normal from noise gradient
                    var noiseDx = fbm2D((x + 1) * scale, y * scale, octaves, lacunarity, persistence) - noise;
                    var noiseDy = fbm2D(x * scale, (y + 1) * scale, octaves, lacunarity, persistence) - noise;
                    
                    var normalX = -noiseDx * textureParams.depthStrength * 10;
                    var normalY = -noiseDy * textureParams.depthStrength * 10;
                    var normalZ = 1;
                    
                    // Simple lighting from top-left
                    var lightX = -0.5;
                    var lightY = -0.5;
                    var lightZ = 1;
                    
                    var lighting = (normalX * lightX + normalY * lightY + normalZ * lightZ);
                    var depthFactor = 1 + lighting * 0.2;
                    
                    data[idx] = Math.max(0, Math.min(255, data[idx] * depthFactor));
                    data[idx + 1] = Math.max(0, Math.min(255, data[idx + 1] * depthFactor));
                    data[idx + 2] = Math.max(0, Math.min(255, data[idx + 2] * depthFactor));
                }
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // 3D DEPTH SHADING MODULE
    // ═══════════════════════════════════════════════════════════════════════════════
    
    /**
     * Apply parametric 3D raised/embossed effect to tile
     * 
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} w - Width
     * @param {number} h - Height
     * @param {number} height - Tile height (0-1, affects shadow/highlight intensity)
     * @param {number} lightAngle - Light direction in degrees (0=top, 90=right, 180=bottom, 270=left)
     * @param {number} softness - Edge softness (0.01-1, higher = softer/wider edge)
     */
    function apply3DShading(ctx, w, h, height, lightAngle, softness) {
        if (height <= 0) return;
        
        var imageData = ctx.getImageData(0, 0, w, h);
        var data = imageData.data;
        
        // Convert angle to radians and calculate light direction
        var angleRad = (lightAngle - 90) * Math.PI / 180; // -90 to make 0° point up
        var lightX = Math.cos(angleRad);
        var lightY = Math.sin(angleRad);
        
        // Edge width based on softness (min 2px, max 40% of tile)
        var baseEdgeWidth = Math.min(w, h) * 0.08;
        var edgeWidth = Math.max(2, Math.floor(baseEdgeWidth * softness * 5));
        
        for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
                var idx = (y * w + x) * 4;
                
                // Distance from edges
                var distLeft = x;
                var distTop = y;
                var distRight = w - 1 - x;
                var distBottom = h - 1 - y;
                
                var minDist = Math.min(distLeft, distTop, distRight, distBottom);
                
                if (minDist < edgeWidth) {
                    // Normalized position on tile (0-1)
                    var nx = x / w - 0.5;
                    var ny = y / h - 0.5;
                    
                    // Calculate surface normal based on distance from edge
                    // Center = flat (0,0,1), edges = tilted based on distance
                    var edgeFactor = 1 - (minDist / edgeWidth);
                    
                    var normalX = 0;
                    var normalY = 0;
                    
                    // Determine which edge(s) influence this pixel
                    if (distLeft < edgeWidth) {
                        normalX -= edgeFactor;
                    }
                    if (distRight < edgeWidth) {
                        normalX += edgeFactor;
                    }
                    if (distTop < edgeWidth) {
                        normalY -= edgeFactor;
                    }
                    if (distBottom < edgeWidth) {
                        normalY += edgeFactor;
                    }
                    
                    // Normalize the normal vector
                    var normalZ = 1.0;
                    var normalLen = Math.sqrt(normalX * normalX + normalY * normalY + normalZ * normalZ);
                    normalX /= normalLen;
                    normalY /= normalLen;
                    normalZ /= normalLen;
                    
                    // Calculate lighting (dot product with light direction)
                    var lightZ = 0.5; // Light comes from slightly above
                    var lighting = normalX * lightX + normalY * lightY + normalZ * lightZ;
                    
                    // Apply height-based intensity scaling
                    var intensity = lighting * height;
                    
                    // Map lighting to brightness factor
                    // Positive = highlight, negative = shadow
                    var factor = 1.0;
                    if (intensity > 0) {
                        // Highlight (brighten)
                        factor = 1 + intensity * 0.6;
                    } else {
                        // Shadow (darken)
                        factor = 1 + intensity * 0.7;
                    }
                    
                    // Apply with smooth falloff
                    var falloff = Math.pow(edgeFactor, 1.5 / softness);
                    var finalFactor = 1 + (factor - 1) * falloff;
                    
                    data[idx] = Math.max(0, Math.min(255, data[idx] * finalFactor));
                    data[idx + 1] = Math.max(0, Math.min(255, data[idx + 1] * finalFactor));
                    data[idx + 2] = Math.max(0, Math.min(255, data[idx + 2] * finalFactor));
                }
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // SPRITE MODULE
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function renderSprite(tile, tileSize, paletteSet, shadingParams, textureParams) {
        var w = tile.bounds.w * tileSize;
        var h = tile.bounds.h * tileSize;
        
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');
        
        var rng = new PRNG(tile.seed);
        var palette = paletteSet[tile.paletteIndex];
        
        // Render pattern
        switch (tile.grammar) {
            case 'concentric':
                renderConcentric(ctx, w, h, palette, rng);
                break;
            case 'wedge':
                renderWedge(ctx, w, h, palette, rng);
                break;
            case 'stripe':
                renderStripe(ctx, w, h, palette, rng);
                break;
            case 'microdots':
                renderMicrodots(ctx, w, h, palette, rng);
                break;
            case 'solid':
                renderSolid(ctx, w, h, palette, rng);
                break;
        }
        
        // Apply texture noise (before 3D shading for realistic bumps)
        applyTexture(ctx, w, h, textureParams);
        
        // Apply 3D depth shading
        apply3DShading(ctx, w, h, shadingParams.height, shadingParams.lightAngle, shadingParams.softness);
        
        return canvas;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // ANIMATION MODULE
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function getTileScale(tile, t, pulseA, pulseF, omega) {
        if (pulseA <= 0) return 1;
        var i = tile.bounds.x;
        var j = tile.bounds.y;
        var phi = (i * Math.cos(omega * t) + j * Math.sin(omega * t)) * 0.5;
        return 1 + pulseA * Math.sin(2 * Math.PI * pulseF * t + phi);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // RENDERER
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function renderFrame(ctx, canvas, values) {
        var w = canvas.width;
        var h = canvas.height;
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);
        
        if (!state.macroTiles || !state.sprites) return;
        
        var tileSize = values.tileSize || 32;
        var t = state.time;
        var pulseA = values.pulseA || 0;
        var pulseF = values.pulseF || 1;
        var omega = values.omega || 1;
        
        for (var i = 0; i < state.macroTiles.length; i++) {
            var tile = state.macroTiles[i];
            var sprite = state.sprites.get(tile.id);
            if (!sprite) continue;
            
            var scale = getTileScale(tile, t, pulseA, pulseF, omega);
            var tx = tile.bounds.x * tileSize;
            var ty = tile.bounds.y * tileSize;
            var tw = tile.bounds.w * tileSize * scale;
            var th = tile.bounds.h * tileSize * scale;
            
            tx += (tile.bounds.w * tileSize - tw) / 2;
            ty += (tile.bounds.h * tileSize - th) / 2;
            
            ctx.drawImage(sprite, tx, ty, tw, th);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // GENERATION PIPELINE
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function regenerate(values) {
        var canvasWidth = values.canvasWidth || 700;
        var canvasHeight = values.canvasHeight || 700;
        var tileSize = values.tileSize || 32;
        var seed = values.seed || 1234;
        var layoutMode = values.layoutMode || 0;
        var paletteName = values.palette || 'vibrant';
        
        // Shading parameters
        var shadingParams = {
            height: values.tileHeight || 0.6,
            lightAngle: values.lightAngle || 315,
            softness: values.edgeSoftness || 0.5
        };
        
        // Texture parameters
        var textureParams = {
            colorStrength: values.textureColor || 0,
            depthStrength: values.textureDepth || 0,
            scale: values.textureScale || 0.02,
            octaves: values.textureOctaves || 4,
            lacunarity: values.textureLacunarity || 2,
            persistence: values.texturePersistence || 0.5
        };
        
        // Calculate C and R to fill canvas exactly
        var C = Math.ceil(canvasWidth / tileSize);
        var R = Math.ceil(canvasHeight / tileSize);
        
        var rng = new PRNG(seed);
        var paletteSet = PALETTES[paletteName];
        
        state.lattice = generateLattice(C, R);
        
        switch (layoutMode) {
            case 0:
                state.macroTiles = layoutL0(state.lattice, C, R, rng);
                break;
            case 1:
                state.macroTiles = layoutL1(state.lattice, C, R, rng);
                break;
            case 2:
                state.macroTiles = layoutL2(state.lattice, C, R, rng);
                break;
            default:
                state.macroTiles = layoutL0(state.lattice, C, R, rng);
        }
        
        state.sprites = new Map();
        for (var i = 0; i < state.macroTiles.length; i++) {
            var tile = state.macroTiles[i];
            var sprite = renderSprite(tile, tileSize, paletteSet, shadingParams, textureParams);
            state.sprites.set(tile.id, sprite);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // EXPORT
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function exportPNG(tool) {
        const canvas = tool.getCanvas();
        if (!canvas) return;
        ExportUtils.exportCanvasPNG(canvas, 'unified-pattern');
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════════════

    export const TOOL_CONFIG = {
        title: 'TILE MOSAIC',
        
        sidebar: [
            ['GRID', [
                ['Size', [
                    ['slider', 'Tile Size', 12, 80, 2, { value: 32, key: 'tileSize', withNumber: true }],
                    ['seed', 'Seed', { key: 'seed', value: 1234, component: 'SeedInput' }],
                ]],
                ['Layout', [
                    ['radio', 'Mode', ['1×1', '2×2 Mix', 'Varied'], { key: 'layoutMode', selectedValue: '1×1' }],
                ]],
            ]],
            
            ['COLOR', [
                ['Palette', [
                    ['radio', 'Set', ['Vibrant', 'Earth', 'Retro', '1-bit', '2-bit', 'Gameboy', 'NES', 'GGost', 'Pastel'], { key: 'palette', selectedValue: 'Vibrant' }],
                ]],
            ]],
            
            ['LIGHTING', [
                ['3D Shading', [
                    ['slider', 'Tile Height', 0, 1, 0.05, { value: 0.6, key: 'tileHeight', withNumber: true }],
                    ['slider', 'Light Angle', 0, 360, 15, { value: 315, key: 'lightAngle', withNumber: true }],
                    ['slider', 'Edge Softness', 0.1, 2, 0.1, { value: 0.5, key: 'edgeSoftness', withNumber: true }],
                ]],
            ]],
            
            ['TEXTURE', [
                ['Noise Strength', [
                    ['slider', 'Color Var', 0, 1, 0.05, { value: 0, key: 'textureColor', withNumber: true }],
                    ['slider', 'Depth Var', 0, 1, 0.05, { value: 0, key: 'textureDepth', withNumber: true }],
                ]],
                ['Noise Pattern', [
                    ['slider', 'Scale', 0.001, 0.1, 0.001, { value: 0.02, key: 'textureScale', withNumber: true }],
                    ['stepper', 'Octaves', 1, 8, 1, { value: 4, key: 'textureOctaves' }],
                    ['slider', 'Lacunarity', 1.5, 3, 0.1, { value: 2, key: 'textureLacunarity', withNumber: true }],
                    ['slider', 'Persistence', 0.1, 0.9, 0.05, { value: 0.5, key: 'texturePersistence', withNumber: true }],
                ]],
            ]],
            
            ['ANIMATION', [
                ['Breathing', [
                    ['slider', 'Amount', 0, 0.3, 0.02, { value: 0, key: 'pulseA', withNumber: true }],
                    ['slider', 'Speed', 0, 5, 0.5, { value: 1, key: 'pulseF', withNumber: true }],
                    ['slider', 'Wave', 0, 3, 0.1, { value: 0.5, key: 'omega', withNumber: true }],
                ]],
                ['Control', [
                    ['button', 'Play/Pause', null, { key: 'playPause' }],
                    ['button', 'Reset', null, { key: 'resetTime' }],
                ]],
            ]],
            
            ['EXPORT', [
                ['Canvas', [
                    ['slider', 'Width', 280, 1400, 14, { value: 700, key: 'canvasWidth', withNumber: true }],
                    ['slider', 'Height', 280, 1400, 14, { value: 700, key: 'canvasHeight', withNumber: true }],
                    ['radio', 'Display', ['Fit', 'Actual'], { key: 'displayMode', selectedValue: 'Fit' }],
                ]],
                ['Actions', [
                    ['button', 'Download PNG', null, { key: 'exportPng' }],
                    ['button', 'Regenerate', null, { key: 'regenerate' }],
                ]],
            ]],
        ],
        
        canvas: { size: 700 },
        
        onInit: function(values) {
            var self = this;
            
            var layoutMap = { '1×1': 0, '2×2 Mix': 1, 'Varied': 2 };
            values.layoutMode = layoutMap[values.layoutMode] || 0;
            
            var paletteMap = { 
                'Vibrant': 'vibrant', 'Earth': 'earth', 'Retro': 'retro',
                '1-bit': '1-bit', '2-bit': '2-bit', 'Gameboy': 'gameboy',
                'NES': 'nes', 'GGost': 'ggost', 'Pastel': 'pastel'
            };
            values.palette = paletteMap[values.palette] || 'vibrant';
            
            wireButton(this, 'exportPng', function() { exportPNG(self); });
            wireButton(this, 'regenerate', function() {
                var newSeed = Math.floor(Math.random() * 999999);
                self.setValue('seed', newSeed);
                regenerate(self.getValues());
                self.draw();
            });
            wireButton(this, 'playPause', function() {
                state.playing = !state.playing;
                if (state.playing && !state.animator) {
                    state.animator = new AnimationLoop({
                        onFrame: function() {
                            state.time += 1 / 60;
                            self.draw();
                        }
                    });
                } else if (!state.playing && state.animator) {
                    state.animator.destroy();
                    state.animator = null;
                }
            });
            wireButton(this, 'resetTime', function() {
                state.time = 0;
                self.draw();
            });
            
            regenerate(values);
        },
        
        onUpdate: function(key, value, allValues) {
            if (key === 'layoutMode') {
                var layoutMap = { '1×1': 0, '2×2 Mix': 1, 'Varied': 2 };
                allValues.layoutMode = layoutMap[value] || 0;
            }
            
            if (key === 'palette') {
                var paletteMap = { 
                    'Vibrant': 'vibrant', 'Earth': 'earth', 'Retro': 'retro',
                    '1-bit': '1-bit', '2-bit': '2-bit', 'Gameboy': 'gameboy',
                    'NES': 'nes', 'GGost': 'ggost', 'Pastel': 'pastel'
                };
                allValues.palette = paletteMap[value] || 'vibrant';
            }
            
            if (key === 'canvasWidth' || key === 'canvasHeight' || key === 'displayMode') {
                this.resizeCanvas(
                    allValues.canvasWidth || 700,
                    allValues.canvasHeight || 700,
                    { displayMode: (allValues.displayMode || 'Fit').toLowerCase() }
                );
            }
            
            if (['seed', 'layoutMode', 'tileSize', 'palette', 'tileHeight', 'lightAngle', 'edgeSoftness',
                 'textureColor', 'textureDepth', 'textureScale', 'textureOctaves', 'textureLacunarity', 'texturePersistence',
                 'canvasWidth', 'canvasHeight'].indexOf(key) >= 0) {
                regenerate(allValues);
            }
        },
        
        onDraw: function(ctx, canvas, values) {
            renderFrame(ctx, canvas, values);
        },
    };

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

export class UnifiedPatternTool {
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
            
            console.log('✅ Tile Mosaic Generator v2.2.0');
        } catch (error) {
            console.error('❌ UnifiedPatternTool error:', error);
            this.container.innerHTML = 
                '<div style="padding: 20px; color: var(--c-text);">' +
                '<h2>TILE MOSAIC ERROR</h2>' +
                '<p style="color: red;">' + error.message + '</p>' +
                '</div>';
        }
    }
    
    destroy() {
        if (state.animator) {
            state.animator.destroy();
        }
        state = {
            lattice: null,
            macroTiles: null,
            sprites: null,
            animator: null,
            time: 0,
            playing: false
        };
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
    }
}

// Export as default for tools_section.js
export default UnifiedPatternTool;

// Global compatibility
if (typeof window !== 'undefined') {
    window.UnifiedPatternTool = UnifiedPatternTool;
}
