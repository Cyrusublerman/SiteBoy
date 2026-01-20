/**
 * Colour Quantizer - ToolBase Format
 *
 * Image quantization with LAB color space and blue noise dithering
 *
 * @version 3.0.0 - ES Module conversion
 */

// ES Module imports
import { ToolBase } from '../core/tool-base.js';
import ComponentLibrary from '../../shared/component-library.js';
import PaletteSystemModule from '../../shared/data/palettes/index.js';
import { parseGPL, exportGPL, parseHexFile, exportHexFile, parsePaletteJson, exportPaletteJson } from '../../shared/data/palettes/utils.js';
import * as ErrorDiffusion from '../../shared/algorithms/dither/error-diffusion.js';
import * as OrderedDither from '../../shared/algorithms/dither/ordered.js';
import * as PaletteExtraction from '../../shared/algorithms/color/palette-extraction.js';

// ES Module state and utilities

    // ═══════════════════════════════════════════════════════════════════════════════
    // COLOR SPACE CONVERTER
    // ═══════════════════════════════════════════════════════════════════════════════

    const ColorSpaceConverter = {
        cache: new Map(),
        WHITE_REFERENCE: { X: 0.95047, Y: 1.0, Z: 1.08883 },
        epsilon: 0.008856,
        kappa: 903.3,

        hexToRgb: function(hex) {
            const key = 'hex-' + hex;
            if (this.cache.has(key)) return this.cache.get(key);

            const c = (hex || '').startsWith('#') ? hex.slice(1) : (hex || '');
            let fullHex = c;
            if (c.length === 3) {
                fullHex = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
            }
            if (fullHex.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(fullHex)) {
                fullHex = '000000';
            }

            const rgb = {
                r: parseInt(fullHex.slice(0, 2), 16),
                g: parseInt(fullHex.slice(2, 4), 16),
                b: parseInt(fullHex.slice(4, 6), 16)
            };
            this.cache.set(key, rgb);
            return rgb;
        },

        rgbToLab: function(r, g, b) {
            const key = 'rgb-' + r + '-' + g + '-' + b;
            if (this.cache.has(key)) return this.cache.get(key);

            r = Number.isFinite(r) ? r : 0;
            g = Number.isFinite(g) ? g : 0;
            b = Number.isFinite(b) ? b : 0;

            const linear = this._srgbToLinear([r, g, b]);
            const xyz = this._linearToXyz(linear);
            const lab = this._xyzToLab(xyz[0], xyz[1], xyz[2]);

            this.cache.set(key, lab);
            return lab;
        },

        _srgbToLinear: function(rgbArray) {
            return rgbArray.map(function(v) {
                v /= 255.0;
                return (v <= 0.04045) ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
            });
        },

        _linearToXyz: function(linear) {
            const lr = linear[0], lg = linear[1], lb = linear[2];
            return [
                lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375,
                lr * 0.2126729 + lg * 0.7151522 + lb * 0.0721750,
                lr * 0.0193339 + lg * 0.1191920 + lb * 0.9503041
            ];
        },

        _xyzToLab: function(X, Y, Z) {
            const ref = this.WHITE_REFERENCE;
            const xr = X / ref.X, yr = Y / ref.Y, zr = Z / ref.Z;

            const fx = xr > this.epsilon ? Math.cbrt(xr) : (this.kappa * xr + 16) / 116;
            const fy = yr > this.epsilon ? Math.cbrt(yr) : (this.kappa * yr + 16) / 116;
            const fz = zr > this.epsilon ? Math.cbrt(zr) : (this.kappa * zr + 16) / 116;

            return {
                L: 116 * fy - 16,
                a: 500 * (fx - fy),
                b: 200 * (fy - fz)
            };
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // PALETTE SYSTEM
    // ═══════════════════════════════════════════════════════════════════════════════
    
    // Import palette system
    const PaletteSystem = PaletteSystemModule;
    
    // Fallback palettes if import fails
    const FALLBACK_PALETTES = {
        '1-bit': ['#000000', '#FFFFFF'],
        '2-bit': ['#000000', '#555555', '#AAAAAA', '#FFFFFF']
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════════════════════

    var state = {
        originalImageData: null,
        previewImageData: null,
        currentImageData: null,
        blueNoiseTextureData: null,
        customPalette: ['#000000', '#FFFFFF'],
        originalFileName: 'image',
        isProcessing: false,
        adjustmentBundle: null,
        batchFiles: [],
        batchResults: [],
        isBatchProcessing: false,
        viewTransform: {
            scale: 1,
            offsetX: 0,
            offsetY: 0,
            isPanning: false,
            lastX: 0,
            lastY: 0
        },
        canvasHandlers: null
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // QUANTIZATION FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    function clamp(v) {
        return Math.max(0, Math.min(255, Math.round(v)));
    }

    function deltaE76(lab1, lab2) {
        const dL = lab1.L - lab2.L;
        const da = lab1.a - lab2.a;
        const db = lab1.b - lab2.b;
        return Math.sqrt(dL*dL + da*da + db*db);
    }

    function findNearestColor(pixelLab, paletteLabs) {
        var minDist = Infinity;
        var nearestIdx = 0;
        for (var i = 0; i < paletteLabs.length; i++) {
            var dist = deltaE76(pixelLab, paletteLabs[i]);
            if (dist < minDist) {
                minDist = dist;
                nearestIdx = i;
            }
        }
        return nearestIdx;
    }

    function applyImageAdjustments(imageData, gamma, contrast, saturation) {
        if (!imageData) return null;

        var data = imageData.data;
        var newData = new Uint8ClampedArray(data.length);
        var gammaExponent = gamma === 0 ? Infinity : 1.0 / gamma;
        var contrastFactor = contrast / 100;
        var saturationFactor = saturation / 100;
        var lumR = 0.2126, lumG = 0.7152, lumB = 0.0722;

        for (var i = 0; i < data.length; i += 4) {
            var r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];

            // Saturation
            if (saturationFactor !== 1.0) {
                var gray = r * lumR + g * lumG + b * lumB;
                r = clamp(gray + saturationFactor * (r - gray));
                g = clamp(gray + saturationFactor * (g - gray));
                b = clamp(gray + saturationFactor * (b - gray));
            }

            // Contrast
            if (contrastFactor !== 1.0) {
                r = clamp(((r / 255.0 - 0.5) * contrastFactor + 0.5) * 255.0);
                g = clamp(((g / 255.0 - 0.5) * contrastFactor + 0.5) * 255.0);
                b = clamp(((b / 255.0 - 0.5) * contrastFactor + 0.5) * 255.0);
            }

            // Gamma
            if (gamma !== 1.0 && gamma > 0) {
                r = clamp(Math.pow(r / 255.0, gammaExponent) * 255.0);
                g = clamp(Math.pow(g / 255.0, gammaExponent) * 255.0);
                b = clamp(Math.pow(b / 255.0, gammaExponent) * 255.0);
            }

            newData[i] = Math.round(r);
            newData[i+1] = Math.round(g);
            newData[i+2] = Math.round(b);
            newData[i+3] = a;
        }

        return new ImageData(newData, imageData.width, imageData.height);
    }

    function quantizeNoDither(imageData, palette, paletteLabs) {
        var data = imageData.data;
        var outArr = new Uint8ClampedArray(data.length);

        for (var i = 0; i < data.length; i += 4) {
            var r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
            var labPix = ColorSpaceConverter.rgbToLab(r, g, b);
            var idx = findNearestColor(labPix, paletteLabs);
            var rgb = ColorSpaceConverter.hexToRgb(palette[idx]);
            outArr[i] = rgb.r;
            outArr[i+1] = rgb.g;
            outArr[i+2] = rgb.b;
            outArr[i+3] = a;
        }

        return new ImageData(outArr, imageData.width, imageData.height);
    }

    function quantizeWithDither(imageData, palette, paletteLabs, noiseData) {
        var width = imageData.width;
        var height = imageData.height;
        var data = imageData.data;
        var outArr = new Uint8ClampedArray(data.length);
        var noiseWidth = noiseData.width;
        var noiseHeight = noiseData.height;

        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var i = (y * width + x) * 4;
                var r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
                var labPix = ColorSpaceConverter.rgbToLab(r, g, b);

                // Get blue noise threshold
                var noiseX = x % noiseWidth;
                var noiseY = y % noiseHeight;
                var noiseIdx = (noiseY * noiseWidth + noiseX) * 4;
                var threshold = noiseData.data[noiseIdx] / 255.0;

                // Find nearest and opposite colors
                var nearestIdx = findNearestColor(labPix, paletteLabs);
                var nearestLab = paletteLabs[nearestIdx];
                
                // Find opposite color (furthest from nearest)
                var maxDist = 0;
                var oppositeIdx = nearestIdx;
                for (var j = 0; j < paletteLabs.length; j++) {
                    if (j !== nearestIdx) {
                        var dist = deltaE76(nearestLab, paletteLabs[j]);
                        if (dist > maxDist) {
                            maxDist = dist;
                            oppositeIdx = j;
                        }
                    }
                }

                // Calculate blend factor based on distance
                var distNearest = deltaE76(labPix, nearestLab);
                var distOpposite = deltaE76(labPix, paletteLabs[oppositeIdx]);
                var totalDist = distNearest + distOpposite;
                var blendFactor = totalDist > 0 ? distNearest / totalDist : 0;

                // Choose color based on threshold
                var chosenIdx = (threshold < blendFactor) ? oppositeIdx : nearestIdx;
                var rgb = ColorSpaceConverter.hexToRgb(palette[chosenIdx]);

                outArr[i] = rgb.r;
                outArr[i+1] = rgb.g;
                outArr[i+2] = rgb.b;
                outArr[i+3] = a;
            }
        }

        return new ImageData(outArr, imageData.width, imageData.height);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // HELPER FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    function applyDisplayMode(toolInstance, mode) {
        if (!toolInstance.canvas) return;
        
        var canvas = toolInstance.canvas;
        
        console.log('🎭 Applying display mode:', mode);
        
        switch(mode) {
            case 'Fit':
            case 'fit':
                // Scale to fit container, maintain aspect ratio
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.objectFit = 'contain';
                canvas.style.imageRendering = 'auto';
                break;
                
            case 'Fill':
            case 'fill':
                // Scale to fill container, may crop
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.objectFit = 'cover';
                canvas.style.imageRendering = 'auto';
                break;
                
            case 'Actual':
            case 'actual':
                // Show at actual pixel size, no scaling
                canvas.style.width = canvas.width + 'px';
                canvas.style.height = canvas.height + 'px';
                canvas.style.objectFit = 'none';
                canvas.style.imageRendering = 'pixelated';
                break;
        }
        
        console.log('✅ Display mode applied:', mode, 'Canvas:', canvas.width, 'x', canvas.height);
    }

    function formatHex(hex) {
        if (!hex) return null;
        var h = hex.trim();
        if (!h.startsWith('#')) h = '#' + h;
        if (/^#[0-9A-F]{6}$/i.test(h)) return h.toUpperCase();
        if (/^#[0-9A-F]{3}$/i.test(h)) {
            return ('#' + h[1]+h[1] + h[2]+h[2] + h[3]+h[3]).toUpperCase();
        }
        return null;
    }

    function persistCustomPalette() {
        try {
            localStorage.setItem('colourQuantizer_customPalette', JSON.stringify(state.customPalette));
        } catch (err) {
            console.warn('Custom palette persistence failed:', err);
        }
    }

    function loadCustomPalette() {
        try {
            var raw = localStorage.getItem('colourQuantizer_customPalette');
            if (!raw) return;
            var parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return;
            var cleaned = parsed.map(formatHex).filter(Boolean);
            if (cleaned.length) {
                state.customPalette = cleaned;
            }
        } catch (err) {
            console.warn('Custom palette load failed:', err);
        }
    }

    function getCurrentPalette(values) {
        var paletteKey = values.palette;
        
        // Handle custom palette
        if (paletteKey === 'Custom') {
            return state.customPalette.length > 0 ? state.customPalette.slice() : ['#000000', '#FFFFFF'];
        }
        
        // Handle category separators (ignore them)
        if (paletteKey && paletteKey.startsWith('───')) {
            return ['#000000', '#FFFFFF'];
        }
        
        // Try to get from palette system
        if (PaletteSystem && PaletteSystem.getPaletteColours) {
            var colours = PaletteSystem.getPaletteColours(paletteKey);
            if (colours) return colours.slice();
        }
        
        // Fallback
        return FALLBACK_PALETTES[paletteKey] || ['#000000', '#FFFFFF'];
    }

    function loadBlueNoise() {
        var img = new Image();
        img.onload = function() {
            var tempCanvas = document.createElement('canvas');
            var tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = img.naturalWidth;
            tempCanvas.height = img.naturalHeight;
            tempCtx.drawImage(img, 0, 0);
            state.blueNoiseTextureData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            window.debugLog('TOOLS', 'Blue noise texture loaded:', tempCanvas.width, 'x', tempCanvas.height);
        };
        img.onerror = function() {
            console.error('Failed to load blue noise texture');
        };
        img.src = '/assets/images/blue-noise-64x64.png';
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOOL CONFIG
    // ═══════════════════════════════════════════════════════════════════════════════

export const TOOL_CONFIG = {
        title: 'COLOUR QUANTIZER',

        sidebar: [
            ['IMAGE', [
                ['Source', [
                    ['file', 'Upload Image', 'image/*', { key: 'imageFile', buttonText: 'Choose...' }],
                ]],
                ['Image Adjustments', [
                    ['adjustment-bundle', 'professional', null, {
                        key: 'imageAdjust'
                    }],
                ]],
                ['Transform', [
                    ['slider', 'Scale %', 10, 100, 5, { value: 100, key: 'resizeScale', withNumber: true }],
                    ['button', 'Apply Resize', null, { key: 'applyResize' }],
                ]],
            ]],
            ['PALETTE', [
                ['Selection', [
                    ['dropdown', 'Palette', [
                        '─── TECHNICAL ───',
                        '1-bit', '2-bit', '3-bit', '3-bit-grey', 'primaries', 'pastel',
                        '─── RETRO ───',
                        'nes', 'gameboy', 'cga-cyan-magenta', 'cga-red-green', 'ega', 'vga', 
                        'commodore-64', 'apple-ii', 'zx-spectrum', 'pico-8',
                        '─── ARTISTIC ───',
                        'elevate', 'primaries-artistic', 'imperial', 'galaxy', 'ketchup', 'pueblo',
                        'kelp', 'seance', 'rose', 'wildfire', 'blueberry', 'ocean',
                        'lilac', 'sepia', 'lichen', 'bronze', 'shamrock', 'sandcastle',
                        'apricot', 'goldust', 'brass', 'patina', 'wildberry', 'sunny',
                        'faded', 'neon', 'watermelon', 'crystals', 'monochrome', 'mondrianchromatic',
                        '─── CUSTOM ───',
                        'Custom'
                    ], { key: 'palette', value: 'Custom' }],
                ]],
                ['Extract from Image', [
                    ['dropdown', 'Method', ['Median Cut', 'K-means', 'Histogram'], { key: 'extractMethod', value: 'Median Cut' }],
                    ['stepper', 'Colours', 2, 32, 1, { value: 16, key: 'extractCount' }],
                    ['button', 'Extract Palette', null, { key: 'extractPalette' }],
                    ['label', 'Extracted: 0 colours', { key: 'extractedCount', variant: 'caption' }],
                ]],
                ['Custom Colors', [
                    ['color', 'New Colour', '#FF0000', { key: 'newColour' }],
                    ['button', 'Add Colour', null, { key: 'addColour' }],
                    ['button', 'Clear Custom', null, { key: 'clearCustom' }],
                    ['label', 'Custom: 2 colours', { key: 'customCount', variant: 'caption' }],
                ]],
                ['Import/Export', [
                    ['file', 'Import Palette', '.gpl,.hex,.json', { key: 'importPalette', buttonText: 'Choose...' }],
                    ['dropdown', 'Format', ['GPL', 'HEX', 'JSON'], { key: 'exportFormat', value: 'GPL' }],
                    ['button', 'Export Palette', null, { key: 'exportPalette' }],
                ]],
            ]],
            ['PROCESS', [
                ['Options', [
                    ['dropdown', 'Dither Algorithm', [
                        'None',
                        '─── NOISE ───',
                        'Blue Noise',
                        '─── ERROR DIFFUSION ───',
                        'Floyd-Steinberg',
                        'Atkinson',
                        'Jarvis-Judice-Ninke',
                        'Stucki',
                        'Burkes',
                        'Sierra-3',
                        '─── ORDERED ───',
                        'Bayer 2×2',
                        'Bayer 4×4',
                        'Bayer 8×8',
                        'Halftone',
                        'Checkerboard',
                        'Cluster Dot',
                        'Hatch Horizontal',
                        'Hatch Vertical'
                    ], { key: 'ditherAlgorithm', value: 'Blue Noise' }],
                ]],
                ['Actions', [
                    ['button', 'Process Image', null, { key: 'process' }],
                    ['button', 'Undo to Preview', null, { key: 'undo' }],
                ]],
                ['Batch', [
                    ['file', 'Batch Images', 'image/*', { key: 'batchFiles', buttonText: 'Choose...', multiple: true }],
                    ['label', 'No files selected', { key: 'batchCount', variant: 'caption' }],
                    ['progress', 'Batch Progress', 0, { key: 'batchProgress' }],
                    ['button', 'Process Batch', null, { key: 'batchProcess' }],
                    ['button', 'Download ZIP', null, { key: 'batchDownload' }],
                ]],
            ]],
            ['CANVAS', [
                ['Size', [
                    ['slider', 'Width', 14, 2048, 1, { value: 420, key: 'canvasWidth', withNumber: true }],
                    ['slider', 'Height', 14, 2048, 1, { value: 420, key: 'canvasHeight', withNumber: true }],
                ]],
                ['Display', [
                    ['radio', 'Mode', ['Fit', 'Fill', 'Actual'], { key: 'displayMode', selectedValue: 'Fit' }],
                ]],
                ['Export', [
                    ['button', 'Export PNG', null, { key: 'exportPng' }],
                ]],
            ]],
        ],

        canvas: { size: 420 },

        onInit: function(values) {
            var self = this;

            // Load blue noise texture
            loadBlueNoise();

            // Restore custom palette from storage
            loadCustomPalette();
            updateCustomCount(this);
            updateBatchCount(this);

            attachCanvasInteractions(this);

            // Get adjustment bundle from ToolBase's component registry
            state.adjustmentBundle = this.components.get('imageAdjust');
            if (!state.adjustmentBundle) {
                console.error('❌ Adjustment bundle not found in component registry');
                return;
            }
            
            // Wire up callbacks now that we have access to 'this'
            state.adjustmentBundle.options.onChange = function(adjustedImage, settings) {
                console.log('📊 Adjustment bundle onChange:', settings);
                state.previewImageData = adjustedImage;
                state.currentImageData = adjustedImage;
                self.draw();
            };
            
            state.adjustmentBundle.options.onTransform = function(transformedImage, transform) {
                console.log('🔄 Transform applied:', transform.type);
                state.originalImageData = transformedImage;
                
                if (transform.type === 'resize') {
                    // Update canvas dimensions to match resized image
                    if (self.canvas) {
                        self.canvas.width = transformedImage.width;
                        self.canvas.height = transformedImage.height;
                    }
                }
                
                self.draw();
            };
            
            console.log('✅ Adjustment bundle initialized:', state.adjustmentBundle);

            // Wire add colour button
            var addColourBtn = this.getComponent('addColour');
            if (addColourBtn && addColourBtn.element) {
                addColourBtn.element.addEventListener('click', function() {
                    var newColour = formatHex(self.getValue('newColour'));
                    if (newColour && !state.customPalette.includes(newColour)) {
                        state.customPalette.push(newColour);
                        updateCustomCount(self);
                        persistCustomPalette();
                        self.setStatus('Added ' + newColour + ' to custom palette');
                    }
                });
            }

            // Wire clear custom button
            var clearCustomBtn = this.getComponent('clearCustom');
            if (clearCustomBtn && clearCustomBtn.element) {
                clearCustomBtn.element.addEventListener('click', function() {
                    state.customPalette = ['#000000', '#FFFFFF'];
                    updateCustomCount(self);
                    persistCustomPalette();
                    var extractedLabel = self.getComponent('extractedCount');
                    if (extractedLabel && extractedLabel.element) {
                        extractedLabel.element.textContent = 'Extracted: 0 colours';
                    }
                    self.setStatus('Custom palette reset');
                });
            }

            // Wire process button
            var processBtn = this.getComponent('process');
            if (processBtn && processBtn.element) {
                processBtn.element.addEventListener('click', function() {
                    processImage(self);
                });
            }

            // Wire extract palette button
            var extractBtn = this.getComponent('extractPalette');
            if (extractBtn && extractBtn.element) {
                extractBtn.element.addEventListener('click', function() {
                    if (!state.originalImageData) {
                        self.setStatus('Please load an image first');
                        return;
                    }

                    var method = self.getValue('extractMethod') || 'Median Cut';
                    var count = parseInt(self.getValue('extractCount') || 16, 10);
                    if (!count || count < 2) {
                        self.setStatus('Invalid colour count');
                        return;
                    }

                    var extracted;
                    switch (method) {
                        case 'K-means':
                            extracted = PaletteExtraction.extractKMeans(state.originalImageData, count);
                            break;
                        case 'Histogram':
                            extracted = PaletteExtraction.extractHistogram(state.originalImageData, count);
                            break;
                        case 'Median Cut':
                        default:
                            extracted = PaletteExtraction.extractMedianCut(state.originalImageData, count);
                            break;
                    }

                    if (!extracted || !extracted.length) {
                        self.setStatus('No colours extracted');
                        return;
                    }

                    state.customPalette = extracted.slice();
                    updateCustomCount(self);
                    persistCustomPalette();

                    self.setValue('palette', 'Custom');
                    self.setStatus('Extracted ' + extracted.length + ' colours (' + method + ')');

                    var extractedLabel = self.getComponent('extractedCount');
                    if (extractedLabel && extractedLabel.element) {
                        extractedLabel.element.textContent = 'Extracted: ' + extracted.length + ' colours';
                    }
                });
            }

            // Wire resize button
            var resizeBtn = this.getComponent('applyResize');
            if (resizeBtn && resizeBtn.element) {
                resizeBtn.element.addEventListener('click', function() {
                    var scale = (self.getValue('resizeScale') || 100) / 100;
                    if (!state.originalImageData) {
                        self.setStatus('Please load an image first');
                        return;
                    }
                    if (scale === 1) {
                        self.setStatus('Scale is already 100%');
                        return;
                    }
                    if (!window.Algorithms || !window.Algorithms.Image || !window.Algorithms.Image.resizeProportional) {
                        self.setStatus('Resize algorithm not available');
                        return;
                    }

                    var resized = window.Algorithms.Image.resizeProportional(state.originalImageData, scale);
                    state.originalImageData = resized;
                    state.previewImageData = resized;
                    state.currentImageData = resized;

                    isResizingFromUpload = true;
                    self.setValue('canvasWidth', resized.width);
                    self.setValue('canvasHeight', resized.height);
                    isResizingFromUpload = false;

                    if (self.canvas) {
                        self.canvas.width = resized.width;
                        self.canvas.height = resized.height;
                    }

                    applyDisplayMode(self, (self.getValue('displayMode') || 'Fit'));

                    if (state.adjustmentBundle) {
                        state.adjustmentBundle.setImage(resized);
                    }

                    self.draw();
                    self.setStatus('Resized to ' + resized.width + 'x' + resized.height);
                });
            }

            // Wire export palette button
            var exportPaletteBtn = this.getComponent('exportPalette');
            if (exportPaletteBtn && exportPaletteBtn.element) {
                exportPaletteBtn.element.addEventListener('click', function() {
                    exportPalette(self);
                });
            }

            // Wire batch process button
            var batchProcessBtn = this.getComponent('batchProcess');
            if (batchProcessBtn && batchProcessBtn.element) {
                batchProcessBtn.element.addEventListener('click', function() {
                    processBatch(self);
                });
            }

            // Wire batch download button
            var batchDownloadBtn = this.getComponent('batchDownload');
            if (batchDownloadBtn && batchDownloadBtn.element) {
                batchDownloadBtn.element.addEventListener('click', function() {
                    downloadBatchZip(self);
                });
            }

            // Wire undo button
            var undoBtn = this.getComponent('undo');
            if (undoBtn && undoBtn.element) {
                undoBtn.element.addEventListener('click', function() {
                    if (state.previewImageData) {
                        state.currentImageData = state.previewImageData;
                        self.draw();
                        self.setStatus('Reverted to preview');
                    }
                });
            }

            // Wire export button
            var exportBtn = this.getComponent('exportPng');
            if (exportBtn && exportBtn.element) {
                exportBtn.element.addEventListener('click', function() {
                    exportPng(self);
                });
            }

            updateCustomCount(self);
        },

        onUpdate: function(key, value, allValues) {
            var self = this;
            
            console.log('🔄 onUpdate called:', key, value ? '(value exists)' : '(no value)');

            // Handle file upload
            if (key === 'imageFile' && value) {
                console.log('📁 File upload detected, calling loadImage');
                loadImage(self, value);
                return;
            }

            // Handle palette import
            if (key === 'importPalette' && value) {
                importPalette(self, value);
                return;
            }

            // Handle batch file selection
            if (key === 'batchFiles' && value) {
                state.batchFiles = Array.from(value || []);
                updateBatchCount(self);
                setBatchProgress(self, 0);
                self.setStatus(state.batchFiles.length + ' batch files selected');
                return;
            }

            // Adjustment bundle handles its own updates now
            // No need to handle gamma/contrast/saturation individually

            // Handle canvas resize or display mode change
            // Skip if we're in the middle of resizing from upload
            if ((key === 'canvasWidth' || key === 'canvasHeight' || key === 'displayMode') && !isResizingFromUpload) {
                // Update canvas dimensions directly
                if (key === 'canvasWidth' || key === 'canvasHeight') {
                    if (this.canvas) {
                        this.canvas.width = allValues.canvasWidth || 420;
                        this.canvas.height = allValues.canvasHeight || 420;
                        console.log('📐 Canvas resized to:', this.canvas.width, 'x', this.canvas.height);
                    }
                }
                
                // Apply display mode (handles CSS styling)
                applyDisplayMode(this, allValues.displayMode || 'Fit');
                
                // Redraw with new size/display
                this.draw();
                return;
            }
        },

        onDraw: function(ctx, canvas, values) {
            // Clear canvas
            var bgColor = getComputedStyle(document.documentElement).getPropertyValue('--c-bg').trim() || '#000000';
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw current image data if available
            if (state.currentImageData) {
                // Create temporary canvas for ImageData
                var tempCanvas = document.createElement('canvas');
                tempCanvas.width = state.currentImageData.width;
                tempCanvas.height = state.currentImageData.height;
                var tempCtx = tempCanvas.getContext('2d');
                tempCtx.putImageData(state.currentImageData, 0, 0);

                // CRITICAL: Draw at 1:1 pixel ratio - NO SCALING
                // The canvas resolution should already match the image dimensions
                // Display mode (Fit/Fill/Actual) only affects CSS display size, not pixel data
                ctx.imageSmoothingEnabled = false;

                // Apply pan/zoom transform
                var vt = state.viewTransform;
                ctx.save();
                ctx.setTransform(vt.scale, 0, 0, vt.scale, vt.offsetX, vt.offsetY);
                ctx.drawImage(tempCanvas, 0, 0);
                ctx.restore();
            } else {
                // Draw placeholder
                ctx.fillStyle = 'var(--c-text)';
                ctx.font = '14px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('Upload an image to begin', canvas.width / 2, canvas.height / 2);
            }
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOOL FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    var isResizingFromUpload = false;  // Flag to prevent recursive updates

    function loadImage(tool, file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var img = new Image();
            img.onload = function() {
                var tempCanvas = document.createElement('canvas');
                tempCanvas.width = img.naturalWidth;
                tempCanvas.height = img.naturalHeight;
                var tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(img, 0, 0);
                
                state.originalImageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
                state.originalFileName = file.name.replace(/\.[^/.]+$/, '');
                
                console.log('📸 Image loaded:', img.naturalWidth, 'x', img.naturalHeight);
                
                // Pass image to adjustment bundle
                if (state.adjustmentBundle) {
                    state.adjustmentBundle.setImage(state.originalImageData);
                    console.log('🎨 Image passed to adjustment bundle');
                }
                
                // Set flag to prevent onUpdate from triggering during setValue
                isResizingFromUpload = true;
                
                // Update slider values (won't trigger resize due to flag)
                tool.setValue('canvasWidth', img.naturalWidth);
                tool.setValue('canvasHeight', img.naturalHeight);
                
                // Clear flag
                isResizingFromUpload = false;
                
                // Get current values including display mode
                var values = tool.getValues();
                
                // Update canvas dimensions directly
                if (tool.canvas) {
                    tool.canvas.width = img.naturalWidth;
                    tool.canvas.height = img.naturalHeight;
                    console.log('📐 Canvas resized to:', tool.canvas.width, 'x', tool.canvas.height);
                    
                    // Apply display mode
                    applyDisplayMode(tool, values.displayMode || 'Fit');
                } else {
                    console.error('❌ tool.canvas is null!');
                }
                
                resetViewTransform();

                // Ensure immediate draw from original image data
                state.previewImageData = state.originalImageData;
                state.currentImageData = state.originalImageData;
                tool.draw();

                // Apply current adjustments and redraw
                updatePreview(tool);
                tool.setStatus('Image loaded: ' + img.naturalWidth + 'x' + img.naturalHeight);
                
                console.log('✅ Image processing complete');
            };
            img.onerror = function() {
                console.error('❌ Failed to load image');
                tool.setStatus('Error: Failed to load image');
            };
            img.src = e.target.result;
        };
        reader.onerror = function() {
            console.error('❌ FileReader error');
            tool.setStatus('Error: Failed to read file');
        };
        reader.readAsDataURL(file);
    }

    function updatePreview(tool) {
        // Adjustment bundle now handles preview updates via onChange callback
        // This function kept for backwards compatibility but does nothing
        console.log('⚠️ updatePreview called (deprecated - bundle handles this)');
    }

    function updateCustomCount(tool) {
        var countLabel = tool.getComponent('customCount');
        if (countLabel && countLabel.element) {
            countLabel.element.textContent = 'Custom: ' + state.customPalette.length + ' colours';
        }
    }

    function updateBatchCount(tool) {
        var batchLabel = tool.getComponent('batchCount');
        if (batchLabel && batchLabel.element) {
            var count = state.batchFiles.length;
            batchLabel.element.textContent = count ? (count + ' files selected') : 'No files selected';
        }
    }

    function setBatchProgress(tool, value) {
        var progress = tool.getComponent('batchProgress');
        if (progress && typeof progress.setValue === 'function') {
            progress.setValue(value);
        }
    }

    function slugify(value) {
        return String(value || '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    function applyDitherAlgorithm(imageData, algorithm, palette, paletteLabs) {
        switch (algorithm) {
            case 'None':
                return quantizeNoDither(imageData, palette, paletteLabs);
            case 'Blue Noise':
                if (state.blueNoiseTextureData) {
                    return quantizeWithDither(imageData, palette, paletteLabs, state.blueNoiseTextureData);
                }
                return quantizeNoDither(imageData, palette, paletteLabs);
            case 'Floyd-Steinberg':
                return ErrorDiffusion.floydSteinberg(imageData, palette, paletteLabs, ColorSpaceConverter);
            case 'Atkinson':
                return ErrorDiffusion.atkinson(imageData, palette, paletteLabs, ColorSpaceConverter);
            case 'Jarvis-Judice-Ninke':
                return ErrorDiffusion.javisJudiceNinke(imageData, palette, paletteLabs, ColorSpaceConverter);
            case 'Stucki':
                return ErrorDiffusion.stucki(imageData, palette, paletteLabs, ColorSpaceConverter);
            case 'Burkes':
                return ErrorDiffusion.burkes(imageData, palette, paletteLabs, ColorSpaceConverter);
            case 'Sierra-3':
                return ErrorDiffusion.sierra3(imageData, palette, paletteLabs, ColorSpaceConverter);
            case 'Bayer 2×2':
                return OrderedDither.bayer2x2(imageData, palette, paletteLabs, ColorSpaceConverter);
            case 'Bayer 4×4':
                return OrderedDither.bayer4x4(imageData, palette, paletteLabs, ColorSpaceConverter);
            case 'Bayer 8×8':
                return OrderedDither.bayer8x8(imageData, palette, paletteLabs, ColorSpaceConverter);
            case 'Halftone':
                return OrderedDither.halftone(imageData, palette, paletteLabs, ColorSpaceConverter);
            case 'Checkerboard':
                return OrderedDither.checkerboard(imageData, palette, paletteLabs, ColorSpaceConverter);
            case 'Cluster Dot':
                return OrderedDither.cluster(imageData, palette, paletteLabs, ColorSpaceConverter);
            case 'Hatch Horizontal':
                return OrderedDither.hatchHorizontal(imageData, palette, paletteLabs, ColorSpaceConverter);
            case 'Hatch Vertical':
                return OrderedDither.hatchVertical(imageData, palette, paletteLabs, ColorSpaceConverter);
            default:
                return quantizeNoDither(imageData, palette, paletteLabs);
        }
    }

    function resetViewTransform() {
        state.viewTransform.scale = 1;
        state.viewTransform.offsetX = 0;
        state.viewTransform.offsetY = 0;
    }

    function canvasPointFromEvent(canvas, event) {
        var rect = canvas.getBoundingClientRect();
        var scaleX = canvas.width / rect.width;
        var scaleY = canvas.height / rect.height;
        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY
        };
    }

    function attachCanvasInteractions(tool) {
        if (!tool.canvas) return;

        var canvas = tool.canvas;
        var onWheel = function(event) {
            event.preventDefault();
            var point = canvasPointFromEvent(canvas, event);
            var vt = state.viewTransform;
            var scaleFactor = event.deltaY < 0 ? 1.1 : 0.9;
            var newScale = Math.max(0.1, Math.min(20, vt.scale * scaleFactor));
            var worldX = (point.x - vt.offsetX) / vt.scale;
            var worldY = (point.y - vt.offsetY) / vt.scale;
            vt.scale = newScale;
            vt.offsetX = point.x - worldX * newScale;
            vt.offsetY = point.y - worldY * newScale;
            tool.draw();
        };

        var onMouseDown = function(event) {
            if (event.button !== 0) return;
            var point = canvasPointFromEvent(canvas, event);
            state.viewTransform.isPanning = true;
            state.viewTransform.lastX = point.x;
            state.viewTransform.lastY = point.y;
            canvas.style.cursor = 'grabbing';
            event.preventDefault();
        };

        var onMouseMove = function(event) {
            if (!state.viewTransform.isPanning) return;
            var point = canvasPointFromEvent(canvas, event);
            var dx = point.x - state.viewTransform.lastX;
            var dy = point.y - state.viewTransform.lastY;
            state.viewTransform.offsetX += dx;
            state.viewTransform.offsetY += dy;
            state.viewTransform.lastX = point.x;
            state.viewTransform.lastY = point.y;
            tool.draw();
        };

        var onMouseUp = function() {
            state.viewTransform.isPanning = false;
            canvas.style.cursor = 'grab';
        };

        var onMouseLeave = function() {
            state.viewTransform.isPanning = false;
            canvas.style.cursor = 'grab';
        };

        canvas.addEventListener('wheel', onWheel, { passive: false });
        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('mouseleave', onMouseLeave);
        canvas.style.cursor = 'grab';

        state.canvasHandlers = {
            onWheel: onWheel,
            onMouseDown: onMouseDown,
            onMouseMove: onMouseMove,
            onMouseUp: onMouseUp,
            onMouseLeave: onMouseLeave
        };
    }

    function detachCanvasInteractions(tool) {
        if (!tool || !tool.canvas || !state.canvasHandlers) return;
        var canvas = tool.canvas;
        canvas.removeEventListener('wheel', state.canvasHandlers.onWheel);
        canvas.removeEventListener('mousedown', state.canvasHandlers.onMouseDown);
        canvas.removeEventListener('mousemove', state.canvasHandlers.onMouseMove);
        canvas.removeEventListener('mouseup', state.canvasHandlers.onMouseUp);
        canvas.removeEventListener('mouseleave', state.canvasHandlers.onMouseLeave);
        state.canvasHandlers = null;
    }

    function readImageDataFromFile(file) {
        return new Promise(function(resolve, reject) {
            var reader = new FileReader();
            reader.onload = function(e) {
                var img = new Image();
                img.onload = function() {
                    var canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    var ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
                };
                img.onerror = function() {
                    reject(new Error('Failed to load image'));
                };
                img.src = e.target.result;
            };
            reader.onerror = function() {
                reject(new Error('Failed to read file'));
            };
            reader.readAsDataURL(file);
        });
    }

    async function processBatch(tool) {
        if (state.isBatchProcessing) {
            tool.setStatus('Batch already processing...');
            return;
        }
        if (!state.batchFiles || state.batchFiles.length === 0) {
            tool.setStatus('No batch files selected');
            return;
        }

        state.isBatchProcessing = true;
        state.batchResults = [];
        setBatchProgress(tool, 0);
        tool.showLoading('Processing batch...');

        var processBtn = tool.getComponent('batchProcess');
        var downloadBtn = tool.getComponent('batchDownload');
        if (processBtn && typeof processBtn.setDisabled === 'function') {
            processBtn.setDisabled(true);
        }
        if (downloadBtn && typeof downloadBtn.setDisabled === 'function') {
            downloadBtn.setDisabled(true);
        }

        try {
            var values = tool.getValues();
            var palette = getCurrentPalette(values);
            var paletteLabs = palette.map(function(hex) {
                var rgb = ColorSpaceConverter.hexToRgb(hex);
                return ColorSpaceConverter.rgbToLab(rgb.r, rgb.g, rgb.b);
            });
            var algorithm = values.ditherAlgorithm || 'None';
            if (algorithm && algorithm.startsWith('───')) {
                algorithm = 'None';
            }

            for (var i = 0; i < state.batchFiles.length; i++) {
                var file = state.batchFiles[i];
                var imageData = await readImageDataFromFile(file);
                var processed = applyDitherAlgorithm(imageData, algorithm, palette, paletteLabs);
                state.batchResults.push({
                    file: file,
                    imageData: processed
                });
                setBatchProgress(tool, Math.round(((i + 1) / state.batchFiles.length) * 100));
            }

            tool.setStatus('Batch processed: ' + state.batchResults.length + ' files');
        } catch (err) {
            console.error('Batch processing failed:', err);
            tool.setStatus('Batch processing failed');
        } finally {
            state.isBatchProcessing = false;
            tool.hideLoading();
            if (processBtn && typeof processBtn.setDisabled === 'function') {
                processBtn.setDisabled(false);
            }
            if (downloadBtn && typeof downloadBtn.setDisabled === 'function') {
                downloadBtn.setDisabled(false);
            }
        }
    }

    function imageDataToBlob(imageData) {
        return new Promise(function(resolve) {
            var canvas = document.createElement('canvas');
            canvas.width = imageData.width;
            canvas.height = imageData.height;
            var ctx = canvas.getContext('2d');
            ctx.putImageData(imageData, 0, 0);
            canvas.toBlob(function(blob) {
                resolve(blob);
            }, 'image/png');
        });
    }

    async function downloadBatchZip(tool) {
        if (!state.batchResults || state.batchResults.length === 0) {
            tool.setStatus('No batch results to export');
            return;
        }

        try {
            if (!window.AssetLoader || !window.AssetLoader.ensureJSZip) {
                tool.setStatus('JSZip not available');
                return;
            }

            tool.showLoading('Preparing ZIP...');
            var JSZip = await window.AssetLoader.ensureJSZip();
            var zip = new JSZip();

            var values = tool.getValues();
            var algorithm = values.ditherAlgorithm || 'None';
            if (algorithm && algorithm.startsWith('───')) {
                algorithm = 'None';
            }
            var algoSlug = slugify(algorithm || 'none');
            var paletteSlug = slugify(values.palette || 'palette');

            for (var i = 0; i < state.batchResults.length; i++) {
                var result = state.batchResults[i];
                var baseName = (result.file.name || 'image').replace(/\.[^/.]+$/, '');
                var filename = baseName + '_quant_' + paletteSlug + '_' + algoSlug + '.png';
                var blob = await imageDataToBlob(result.imageData);
                zip.file(filename, blob);
            }

            var zipBlob = await zip.generateAsync({ type: 'blob' });
            var url = URL.createObjectURL(zipBlob);
            var link = document.createElement('a');
            link.download = 'batch_quantized_' + paletteSlug + '_' + algoSlug + '.zip';
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);

            tool.setStatus('Batch ZIP exported');
        } catch (err) {
            console.error('ZIP export failed:', err);
            tool.setStatus('ZIP export failed');
        } finally {
            tool.hideLoading();
        }
    }

    function processImage(tool) {
        var imageData = state.previewImageData || state.originalImageData;
        if (!imageData) {
            tool.setStatus('Please load an image first');
            return;
        }

        if (state.isProcessing) {
            tool.setStatus('Already processing...');
            return;
        }

        state.isProcessing = true;
        tool.setStatus('Processing...');
        tool.showLoading('Processing image...');

        var processBtn = tool.getComponent('process');
        if (processBtn && typeof processBtn.setDisabled === 'function') {
            processBtn.setDisabled(true);
        }

        var values = tool.getValues();
        var palette = getCurrentPalette(values);
        var paletteLabs = palette.map(function(hex) {
            var rgb = ColorSpaceConverter.hexToRgb(hex);
            return ColorSpaceConverter.rgbToLab(rgb.r, rgb.g, rgb.b);
        });
        var algorithm = values.ditherAlgorithm || 'None';
        if (algorithm && algorithm.startsWith('───')) {
            algorithm = 'None';
        }

        // Use setTimeout to allow UI to update
        setTimeout(function() {
            try {
                var startTime = performance.now();
                var result;

                result = applyDitherAlgorithm(imageData, algorithm, palette, paletteLabs);

                var endTime = performance.now();
                state.currentImageData = result;
                tool.draw();
                tool.setStatus('Processed in ' + ((endTime - startTime) / 1000).toFixed(2) + 's');
            } catch (err) {
                tool.setStatus('Error: ' + err.message);
                console.error('Processing error:', err);
            } finally {
                state.isProcessing = false;
                tool.hideLoading();
                if (processBtn && typeof processBtn.setDisabled === 'function') {
                    processBtn.setDisabled(false);
                }
            }
        }, 50);
    }

    function importPalette(tool, file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            try {
                var text = e.target.result || '';
                var name = (file && file.name) ? file.name.toLowerCase() : '';
                var colours = [];

                if (name.endsWith('.gpl')) {
                    colours = parseGPL(text);
                } else if (name.endsWith('.hex') || name.endsWith('.txt')) {
                    colours = parseHexFile(text);
                } else if (name.endsWith('.json')) {
                    colours = parsePaletteJson(text);
                } else {
                    colours = parsePaletteJson(text);
                    if (!colours.length) {
                        colours = parseHexFile(text);
                    }
                }

                if (!colours.length) {
                    tool.setStatus('No colours found in palette file');
                    return;
                }

                state.customPalette = colours;
                updateCustomCount(tool);
                persistCustomPalette();
                tool.setValue('palette', 'Custom');

                var extractedLabel = tool.getComponent('extractedCount');
                if (extractedLabel && extractedLabel.element) {
                    extractedLabel.element.textContent = 'Extracted: 0 colours';
                }

                tool.setStatus('Imported ' + colours.length + ' colours');
            } catch (err) {
                console.error('Palette import failed:', err);
                tool.setStatus('Error importing palette');
            }
        };
        reader.onerror = function() {
            tool.setStatus('Error reading palette file');
        };
        reader.readAsText(file);
    }

    function exportPalette(tool) {
        var colours = state.customPalette.length ? state.customPalette.slice() : ['#000000', '#FFFFFF'];
        var format = tool.getValue('exportFormat') || 'GPL';
        var baseName = state.originalFileName || 'palette';
        var fileName;
        var content;
        var mimeType = 'text/plain';

        switch (format) {
            case 'JSON':
                content = exportPaletteJson(colours, baseName);
                fileName = baseName + '.json';
                mimeType = 'application/json';
                break;
            case 'HEX':
                content = exportHexFile(colours);
                fileName = baseName + '.hex';
                break;
            case 'GPL':
            default:
                content = exportGPL(colours, baseName);
                fileName = baseName + '.gpl';
                break;
        }

        var blob = new Blob([content], { type: mimeType });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.download = fileName;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);

        tool.setStatus('Exported palette: ' + fileName);
    }

    function exportPng(tool) {
        if (!state.currentImageData) {
            tool.setStatus('No image to export');
            return;
        }

        var values = tool.getValues();
        var algorithm = values.ditherAlgorithm || 'None';
        if (algorithm && algorithm.startsWith('───')) {
            algorithm = 'None';
        }
        var algoSlug = algorithm.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        var filename = state.originalFileName + '_quant_' + values.palette.toLowerCase() + '_' + (algoSlug || 'none') + '.png';

        var tempCanvas = document.createElement('canvas');
        tempCanvas.width = state.currentImageData.width;
        tempCanvas.height = state.currentImageData.height;
        var tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(state.currentImageData, 0, 0);

        var link = document.createElement('a');
        link.download = filename;
        link.href = tempCanvas.toDataURL('image/png');
        link.click();

        tool.setStatus('Exported: ' + filename);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOOL CLASS (ToolBase wrapper)
    // ═══════════════════════════════════════════════════════════════════════════════

// ColourQuantizerTool class definition
export class ColourQuantizerTool {
    constructor(container, deps = {}) {
        this.container = container;
        this.deps = {
            ComponentLibrary,
            ...deps
        };
        this.tool = null;
    }

    render() {
        try {
            this.tool = new ToolBase(TOOL_CONFIG, this.deps);
            this.tool.mount(this.container);
            this.tool.draw();
            console.log('✅ ColourQuantizerTool rendered');
        } catch (error) {
            console.error('❌ ColourQuantizerTool error:', error);
            this.container.innerHTML = 
                '<div style="padding: 20px; color: var(--c-text);">' +
                '<h2>COLOUR QUANTIZER ERROR</h2>' +
                '<p style="color: red;">' + error.message + '</p>' +
                '</div>';
        }
    };

    destroy() {
        if (this.tool) {
            detachCanvasInteractions(this.tool);
            this.tool.destroy();
        }
        // Reset state
        state.originalImageData = null;
        state.previewImageData = null;
        state.currentImageData = null;
        state.customPalette = ['#000000', '#FFFFFF'];
        state.originalFileName = 'image';
        state.isProcessing = false;
    }
}

// Register globally for backward compatibility
if (typeof window !== 'undefined') {
    window.ColourQuantizerTool = ColourQuantizerTool;
}

console.log('✅ ColourQuantizerTool loaded (ES Module)');

