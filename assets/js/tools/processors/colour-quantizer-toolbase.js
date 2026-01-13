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
    // PALETTES
    // ═══════════════════════════════════════════════════════════════════════════════

    const PALETTES = {
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
        isProcessing: false
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

    function getCurrentPalette(values) {
        var paletteKey = values.palette;
        if (paletteKey === 'Custom') {
            return state.customPalette.length > 0 ? state.customPalette.slice() : ['#000000', '#FFFFFF'];
        }
        return PALETTES[paletteKey] || ['#000000', '#FFFFFF'];
    }

    function loadBlueNoise() {
        var img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function() {
            var tempCanvas = document.createElement('canvas');
            var tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = img.naturalWidth;
            tempCanvas.height = img.naturalHeight;
            tempCtx.drawImage(img, 0, 0);
            state.blueNoiseTextureData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            console.log('Blue noise texture loaded:', tempCanvas.width, 'x', tempCanvas.height);
        };
        img.onerror = function() {
            console.error('Failed to load blue noise texture');
        };
        // Use a data URL for reliability (128x128 blue noise pattern)
        img.src = 'https://assets.codepen.io/3457130/HDR_L_0.png';
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
                ['Adjustments', [
                    ['slider', 'Gamma', 0.1, 3.0, 0.1, { value: 1.0, key: 'gamma', withNumber: true }],
                    ['slider', 'Contrast', 0, 200, 1, { value: 100, key: 'contrast', withNumber: true }],
                    ['slider', 'Saturation', 0, 200, 1, { value: 100, key: 'saturation', withNumber: true }],
                    ['button', 'Reset Adjustments', null, { key: 'resetAdjust' }],
                ]],
            ]],
            ['PALETTE', [
                ['Selection', [
                    ['dropdown', 'Palette', [
                        '1-bit', '2-bit', '3-bit', '3-bit-gray',
                        'nes', 'gameboy', 'primaries', 'pastel', 'ggost', 'Custom'
                    ], { key: 'palette', value: 'Custom' }],
                ]],
                ['Custom Colors', [
                    ['color', 'New Colour', '#FF0000', { key: 'newColour' }],
                    ['button', 'Add Colour', null, { key: 'addColour' }],
                    ['button', 'Clear Custom', null, { key: 'clearCustom' }],
                    ['label', 'Custom: 2 colours', { key: 'customCount', variant: 'caption' }],
                ]],
            ]],
            ['PROCESS', [
                ['Options', [
                    ['toggle', 'Dithering', ['Blue Noise'], { key: 'dithering', selectedValues: [] }],
                ]],
                ['Actions', [
                    ['button', 'Process Image', null, { key: 'process' }],
                    ['button', 'Undo to Preview', null, { key: 'undo' }],
                ]],
            ]],
            ['EXPORT', [
                ['Canvas', [
                    ['slider', 'Width', 14, 2048, 1, { value: 420, key: 'canvasWidth', withNumber: true }],
                    ['slider', 'Height', 14, 2048, 1, { value: 420, key: 'canvasHeight', withNumber: true }],
                ]],
                ['Download', [
                    ['button', 'Export PNG', null, { key: 'exportPng' }],
                ]],
            ]],
        ],

        canvas: { size: 420 },

        onInit: function(values) {
            var self = this;

            // Load blue noise texture
            loadBlueNoise();

            // Wire reset adjustments button
            var resetBtn = this.getComponent('resetAdjust');
            if (resetBtn && resetBtn.element) {
                resetBtn.element.addEventListener('click', function() {
                    self.setValue('gamma', 1.0);
                    self.setValue('contrast', 100);
                    self.setValue('saturation', 100);
                    updatePreview(self);
                });
            }

            // Wire add colour button
            var addColourBtn = this.getComponent('addColour');
            if (addColourBtn && addColourBtn.element) {
                addColourBtn.element.addEventListener('click', function() {
                    var newColour = formatHex(self.getValue('newColour'));
                    if (newColour && !state.customPalette.includes(newColour)) {
                        state.customPalette.push(newColour);
                        updateCustomCount(self);
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

            // Handle file upload
            if (key === 'imageFile' && value) {
                loadImage(self, value);
                return;
            }

            // Handle adjustment changes - update preview
            if (key === 'gamma' || key === 'contrast' || key === 'saturation') {
                updatePreview(self);
                return;
            }

            // Handle canvas resize
            if (key === 'canvasWidth' || key === 'canvasHeight') {
                this.resizeCanvas(allValues.canvasWidth, allValues.canvasHeight);
                this.draw();
                return;
            }
        },

        onDraw: function(ctx, canvas, values) {
            // Clear canvas
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw current image data if available
            if (state.currentImageData) {
                // Scale to fit canvas
                var img = state.currentImageData;
                var scale = Math.min(canvas.width / img.width, canvas.height / img.height);
                var w = img.width * scale;
                var h = img.height * scale;
                var x = (canvas.width - w) / 2;
                var y = (canvas.height - h) / 2;

                // Create temporary canvas to draw scaled image
                var tempCanvas = document.createElement('canvas');
                tempCanvas.width = img.width;
                tempCanvas.height = img.height;
                var tempCtx = tempCanvas.getContext('2d');
                tempCtx.putImageData(img, 0, 0);

                ctx.drawImage(tempCanvas, x, y, w, h);
            } else {
                // Draw placeholder
                ctx.fillStyle = 'var(--c-text)';
                ctx.font = '14px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Upload an image to begin', canvas.width / 2, canvas.height / 2);
            }
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOOL FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════════

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
                
                // Apply current adjustments
                updatePreview(tool);
                tool.setStatus('Image loaded: ' + img.naturalWidth + 'x' + img.naturalHeight);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function updatePreview(tool) {
        if (!state.originalImageData) return;

        var values = tool.getValues();
        state.previewImageData = applyImageAdjustments(
            state.originalImageData,
            values.gamma,
            values.contrast,
            values.saturation
        );
        state.currentImageData = state.previewImageData;
        tool.draw();
    }

    function updateCustomCount(tool) {
        var countLabel = tool.getComponent('customCount');
        if (countLabel && countLabel.element) {
            countLabel.element.textContent = 'Custom: ' + state.customPalette.length + ' colours';
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

        var values = tool.getValues();
        var palette = getCurrentPalette(values);
        var paletteLabs = palette.map(function(hex) {
            var rgb = ColorSpaceConverter.hexToRgb(hex);
            return ColorSpaceConverter.rgbToLab(rgb.r, rgb.g, rgb.b);
        });

        var useDither = values.dithering && values.dithering.includes('Blue Noise');

        // Use setTimeout to allow UI to update
        setTimeout(function() {
            try {
                var startTime = performance.now();
                var result;

                if (useDither && state.blueNoiseTextureData) {
                    result = quantizeWithDither(imageData, palette, paletteLabs, state.blueNoiseTextureData);
                } else {
                    result = quantizeNoDither(imageData, palette, paletteLabs);
                }

                var endTime = performance.now();
                state.currentImageData = result;
                tool.draw();
                tool.setStatus('Processed in ' + ((endTime - startTime) / 1000).toFixed(2) + 's');
            } catch (err) {
                tool.setStatus('Error: ' + err.message);
                console.error('Processing error:', err);
            } finally {
                state.isProcessing = false;
            }
        }, 50);
    }

    function exportPng(tool) {
        if (!state.currentImageData) {
            tool.setStatus('No image to export');
            return;
        }

        var values = tool.getValues();
        var useDither = values.dithering && values.dithering.includes('Blue Noise');
        var ditherStr = useDither ? 'dither' : 'nodither';
        var filename = state.originalFileName + '_quant_' + values.palette.toLowerCase() + '_' + ditherStr + '.png';

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

