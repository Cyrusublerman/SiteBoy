/**
 * Colour Quantizer — Image Dithering & Palette Reduction Tool
 * 
 * Reduces image colours to limited palette with multiple dithering algorithms.
 * Uses perceptually accurate LAB colour space for nearest-colour matching.
 * 
 * @version 1.0.0
 */
(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════
    // ALGORITHM ACCESS (loaded by AssetLoader)
    // ═══════════════════════════════════════════════════════════════════
    var ColorSpace = null;
    var Dither = null;
    var ImageAdjustments = null;
    var ImageResize = null;

    // ═══════════════════════════════════════════════════════════════════
    // PREDEFINED PALETTES
    // ═══════════════════════════════════════════════════════════════════
    var PALETTES = {
        'Custom': ['#000000', '#FFFFFF'],
        '1-bit': ['#000000', '#FFFFFF'],
        '2-bit': ['#000000', '#555555', '#AAAAAA', '#FFFFFF'],
        '3-bit': ['#000000', '#FF0000', '#00FF00', '#FFFF00', '#0000FF', '#FF00FF', '#00FFFF', '#FFFFFF'],
        '3-bit Grayscale': ['#000000', '#242424', '#484848', '#6C6C6C', '#909090', '#B4B4B4', '#D8D8D8', '#FFFFFF'],
        'NES': ['#7C7C7C', '#0000FC', '#0000BC', '#4428BC', '#940084', '#A80020', '#A81000', '#881400', '#503000', '#007800', '#006800', '#005800', '#004058', '#000000', '#F8F8F8', '#FFFFFF'],
        'Game Boy': ['#0F380F', '#306230', '#8BAC0F', '#9BBC0F'],
        'Primaries': ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF'],
        'Pastel': ['#FFC0CB', '#E6E6FA', '#ADD8E6', '#98FF98', '#FFFFE0', '#FFDAB9'],
        'Ggost': ['#000000', '#1E2223', '#224AC4', '#6245B9', '#65A3EC', '#6AB960', '#8B897D', '#9C3B35', '#B8C0C3', '#C56B60', '#F88127', '#FB5A9E', '#FBDF2B', '#FCC292', '#FD432A', '#FDE6C4', '#FFFFFF']
    };

    // ═══════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════
    var TOOL_CONFIG = {
        title: 'COLOUR QUANTIZER',
        
        sidebar: [
            ['SOURCE', [
                ['Upload', [
                    ['file', 'Image', 'image/png,image/jpeg,image/webp', { key: 'imageFile' }],
                ]],
            ]],
            
            ['PALETTE', [
                ['Selection', [
                    ['dropdown', 'Preset', Object.keys(PALETTES), { key: 'palettePreset', value: 'Custom' }],
                ]],
            ]],
            
            ['ADJUSTMENTS', [
                ['Image', [
                    ['slider', 'Gamma', 0.2, 2.2, 0.1, { value: 1.0, key: 'gamma', withNumber: true }],
                    ['slider', 'Contrast', 0, 200, 5, { value: 100, key: 'contrast', withNumber: true }],
                    ['slider', 'Saturation', 0, 200, 5, { value: 100, key: 'saturation', withNumber: true }],
                    ['button', 'Reset', null, { key: 'resetAdjustments' }],
                ]],
            ]],
            
            ['DITHERING', [
                ['Algorithm', [
                    ['dropdown', 'Method', [
                        'None',
                        'Blue Noise',
                        'Floyd-Steinberg',
                        'Atkinson',
                        'Bayer 2×2',
                        'Bayer 4×4',
                        'Bayer 8×8',
                        'Halftone',
                        'Jarvis-Judice-Ninke',
                        'Stucki',
                        'Burkes',
                        'Sierra-3'
                    ], { key: 'ditherAlgorithm', value: 'Blue Noise' }],
                ]],
            ]],
        ],
        
        canvas: {
            size: 420,
            showControls: true
        },
        
        onInit: function(values) {
            var self = this;
            
            // Wire reset button
            var resetBtn = this.getComponent('resetAdjustments');
            if (resetBtn && resetBtn.element) {
                resetBtn.element.addEventListener('click', function() {
                    self.setValue('gamma', 1.0);
                    self.setValue('contrast', 100);
                    self.setValue('saturation', 100);
                });
            }
            
            window.debugLog('TOOLS', 'Colour Quantizer initialised');
        },
        
        onUpdate: function(key, value, allValues) {
            var self = this;
            
            // Image file upload
            if (key === 'imageFile' && value) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    var img = new Image();
                    img.onload = function() {
                        self._handleImageLoaded(img);
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(value);
                return;
            }
            
            // Adjustments changed → update preview
            if (key === 'gamma' || key === 'contrast' || key === 'saturation') {
                if (self._state.originalImage) {
                    self._updatePreview(allValues);
                }
                return;
            }
            
            // Dither algorithm changed → show info
            if (key === 'ditherAlgorithm') {
                self._updateDitherInfo(value);
            }
        },
        
        onDraw: function(ctx, canvas, values) {
            var self = this;
            
            // Clear canvas
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Determine which image to display
            var imageToDisplay = self._state.processedImage || 
                                self._state.previewImage || 
                                self._state.originalImage;
            
            if (imageToDisplay) {
                // Center image on canvas
                var x = Math.floor((canvas.width - imageToDisplay.width) / 2);
                var y = Math.floor((canvas.height - imageToDisplay.height) / 2);
                ctx.putImageData(imageToDisplay, x, y);
            } else {
                // Show "Upload Image" message
                ctx.fillStyle = '#AAAAAA';
                ctx.font = '14px "Atkinson Hyperlegible", monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('Upload an image to begin', canvas.width / 2, canvas.height / 2);
            }
        },
    };

    // ═══════════════════════════════════════════════════════════════════
    // TOOL CLASS
    // ═══════════════════════════════════════════════════════════════════
    function ColourQuantizer(container, deps) {
        this.container = container;
        this.deps = deps || {};
        this.tool = null;
        
        // Tool state
        this._state = {
            originalImage: null,      // ImageData from upload
            previewImage: null,       // With adjustments applied
            processedImage: null,     // After quantization/dithering
            blueNoiseTexture: null,   // Loaded blue noise texture
            customPalette: ['#000000', '#FFFFFF']
        };
        
        this.render();
    }
    
    ColourQuantizer.prototype.render = function() {
        try {
            // Access algorithms (guaranteed loaded by AssetLoader dependency)
            ColorSpace = window.Algorithms.ColorSpace;
            Dither = window.Algorithms.Dither;
            ImageAdjustments = window.Algorithms.ImageAdjustments;
            ImageResize = window.Algorithms.ImageResize;
            
            if (!ColorSpace || !Dither || !ImageAdjustments) {
                throw new Error('Required algorithm modules not loaded');
            }
            
            if (!window.ToolBase) {
                throw new Error('ToolBase not loaded');
            }
            
            // Create ToolBase instance
            this.tool = new window.ToolBase(TOOL_CONFIG, this.deps);
            
            // CRITICAL: Use mount() method
            this.tool.mount(this.container);
            
            // Initial draw
            this.tool.draw();
            
            // Load blue noise texture
            this._loadBlueNoise();
            
            // Create action buttons in a custom footer
            this._createActionButtons();
            
            window.debugLog('TOOLS', 'Colour Quantizer rendered');
        } catch (error) {
            console.error('ColourQuantizer render error:', error);
            this.container.innerHTML = 
                '<div style="padding: 20px; color: var(--c-text);">' +
                '<h2>COLOUR QUANTIZER ERROR</h2>' +
                '<p style="color: red;">' + error.message + '</p>' +
                '</div>';
        }
    };

    // ═══════════════════════════════════════════════════════════════════
    // IMAGE HANDLING
    // ═══════════════════════════════════════════════════════════════════
    
    ColourQuantizer.prototype._handleImageLoaded = function(img) {
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        this._state.originalImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
        this._state.processedImage = null; // Clear any previous processing
        
        // Update preview with current adjustments
        var values = this.tool.getValues();
        this._updatePreview(values);
        
        window.debugLog('TOOLS', 'Image loaded:', img.width + '×' + img.height);
    };
    
    ColourQuantizer.prototype._updatePreview = function(values) {
        if (!this._state.originalImage) return;
        
        var adjustments = {
            gamma: values.gamma || 1.0,
            contrast: (values.contrast || 100) / 100,
            saturation: (values.saturation || 100) / 100
        };
        
        // Apply adjustments using algorithm library
        this._state.previewImage = ImageAdjustments.applyAllAdjustments(
            this._state.originalImage,
            adjustments
        );
        
        // Redraw
        this.tool.draw();
    };

    // ═══════════════════════════════════════════════════════════════════
    // PROCESSING
    // ═══════════════════════════════════════════════════════════════════
    
    ColourQuantizer.prototype._processImage = function() {
        var values = this.tool.getValues();
        var imageData = this._state.previewImage || this._state.originalImage;
        
        if (!imageData) {
            this.tool.setStatus('No image loaded');
            return;
        }
        
        this.tool.setStatus('Processing...');
        
        var self = this;
        
        // Use setTimeout to allow UI to update
        setTimeout(function() {
            try {
                var startTime = performance.now();
                
                // Get active palette
                var palette = self._getActivePalette(values.palettePreset);
                
                // Convert palette to LAB
                var paletteLabs = palette.map(function(hex) {
                    var rgb = ColorSpace.hexToRgb(hex);
                    return ColorSpace.rgbToLab(rgb.r, rgb.g, rgb.b);
                });
                
                // Apply dithering
                var result = self._applyDithering(
                    imageData,
                    palette,
                    paletteLabs,
                    values.ditherAlgorithm
                );
                
                self._state.processedImage = result;
                self.tool.draw();
                
                var elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
                self.tool.setStatus('Processed in ' + elapsed + 's');
                
                window.debugLog('TOOLS', 'Processing complete:', elapsed + 's');
            } catch (error) {
                console.error('Processing error:', error);
                self.tool.setStatus('Error: ' + error.message);
            }
        }, 50);
    };
    
    ColourQuantizer.prototype._applyDithering = function(imageData, palette, paletteLabs, algorithm) {
        switch (algorithm) {
            case 'None':
                return Dither.nearestColorQuantize(imageData, palette, paletteLabs, ColorSpace);
            
            case 'Blue Noise':
                if (!this._state.blueNoiseTexture) {
                    console.warn('Blue noise texture not loaded, falling back to Floyd-Steinberg');
                    return Dither.floydSteinberg(imageData, palette, paletteLabs, ColorSpace);
                }
                return Dither.ditherBlueNoiseBracketing(
                    imageData, palette, paletteLabs,
                    this._state.blueNoiseTexture, ColorSpace
                );
            
            case 'Floyd-Steinberg':
                return Dither.floydSteinberg(imageData, palette, paletteLabs, ColorSpace);
            
            case 'Atkinson':
                return Dither.atkinson(imageData, palette, paletteLabs, ColorSpace);
            
            case 'Jarvis-Judice-Ninke':
                return Dither.javisJudiceNinke(imageData, palette, paletteLabs, ColorSpace);
            
            case 'Stucki':
                return Dither.stucki(imageData, palette, paletteLabs, ColorSpace);
            
            case 'Burkes':
                return Dither.burkes(imageData, palette, paletteLabs, ColorSpace);
            
            case 'Sierra-3':
                return Dither.sierra3(imageData, palette, paletteLabs, ColorSpace);
            
            case 'Bayer 2×2':
                return Dither.bayer2x2(imageData, palette, paletteLabs, ColorSpace);
            
            case 'Bayer 4×4':
                return Dither.bayer4x4(imageData, palette, paletteLabs, ColorSpace);
            
            case 'Bayer 8×8':
                return Dither.bayer8x8(imageData, palette, paletteLabs, ColorSpace);
            
            case 'Halftone':
                return Dither.halftone(imageData, palette, paletteLabs, ColorSpace);
            
            default:
                console.warn('Unknown dither algorithm:', algorithm);
                return Dither.nearestColorQuantize(imageData, palette, paletteLabs, ColorSpace);
        }
    };

    // ═══════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════════
    
    ColourQuantizer.prototype._getActivePalette = function(presetName) {
        if (PALETTES[presetName]) {
            return PALETTES[presetName].slice(); // Return copy
        }
        
        // Default to 1-bit if not found
        return PALETTES['1-bit'].slice();
    };
    
    ColourQuantizer.prototype._loadBlueNoise = function() {
        var self = this;
        var img = new Image();
        img.crossOrigin = 'Anonymous';
        
        img.onload = function() {
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            self._state.blueNoiseTexture = ctx.getImageData(0, 0, canvas.width, canvas.height);
            window.debugLog('TOOLS', 'Blue noise texture loaded:', canvas.width + '×' + canvas.height);
        };
        
        img.onerror = function() {
            console.warn('Blue noise texture failed to load');
        };
        
        // Blue noise texture URL
        img.src = 'https://assets.codepen.io/3457130/HDR_L_0.png';
    };
    
    ColourQuantizer.prototype._updateDitherInfo = function(algorithm) {
        var info = {
            'None': 'Nearest colour only, no dithering',
            'Blue Noise': 'Geometric bracketing with blue noise (best quality)',
            'Floyd-Steinberg': 'Classic error diffusion, diagonal grain',
            'Atkinson': 'High contrast, reduced bleed (1-bit style)',
            'Jarvis-Judice-Ninke': 'Wide diffusion, smooth gradients',
            'Stucki': 'Very wide diffusion, organic patterns',
            'Burkes': 'Good speed/quality balance',
            'Sierra-3': 'Three-row Sierra filter',
            'Bayer 2×2': 'Checkerboard pattern',
            'Bayer 4×4': 'Classic crosshatch (most common)',
            'Bayer 8×8': 'Fine crosshatch',
            'Halftone': 'Newspaper-style dots'
        };
        
        var message = info[algorithm] || algorithm;
        this.tool.setStatus(message);
    };

    // ═══════════════════════════════════════════════════════════════════
    // ACTION BUTTONS (Custom UI Below Canvas)
    // ═══════════════════════════════════════════════════════════════════
    
    ColourQuantizer.prototype._createActionButtons = function() {
        // Find the canvas container
        var canvasEl = this.tool.getCanvas();
        if (!canvasEl || !canvasEl.parentElement) return;
        
        var canvasContainer = canvasEl.parentElement;
        
        // Create button container
        var buttonContainer = document.createElement('div');
        buttonContainer.className = 'tool-action-buttons';
        buttonContainer.style.cssText = 
            'display: flex; gap: calc(var(--f) * 1); margin-top: calc(var(--f) * 1); justify-content: center;';
        
        // Create buttons
        var processBtn = this._createButton('Process', this._processImage.bind(this));
        var undoBtn = this._createButton('Undo', this._undoProcess.bind(this));
        var downloadBtn = this._createButton('Download PNG', this._downloadPNG.bind(this));
        
        buttonContainer.appendChild(processBtn);
        buttonContainer.appendChild(undoBtn);
        buttonContainer.appendChild(downloadBtn);
        
        // Append after canvas
        canvasContainer.appendChild(buttonContainer);
    };
    
    ColourQuantizer.prototype._createButton = function(text, onClick) {
        var button = document.createElement('button');
        button.textContent = text;
        button.className = 'tool-button';
        button.style.cssText = 
            'padding: calc(var(--f) * 0.5) calc(var(--f) * 1);' +
            'background: var(--c-bg-secondary);' +
            'color: var(--c-text);' +
            'border: 1px solid var(--c-border);' +
            'font-family: "Atkinson Hyperlegible", monospace;' +
            'font-size: calc(var(--f) * 1);' +
            'cursor: pointer;';
        
        button.addEventListener('click', onClick);
        
        // Hover effect
        button.addEventListener('mouseenter', function() {
            button.style.background = 'var(--c-bg-tertiary)';
        });
        button.addEventListener('mouseleave', function() {
            button.style.background = 'var(--c-bg-secondary)';
        });
        
        return button;
    };
    
    ColourQuantizer.prototype._undoProcess = function() {
        this._state.processedImage = null;
        this.tool.draw();
        this.tool.setStatus('Reverted to preview');
    };
    
    ColourQuantizer.prototype._downloadPNG = function() {
        var imageData = this._state.processedImage || this._state.previewImage;
        
        if (!imageData) {
            this.tool.setStatus('No image to download');
            return;
        }
        
        var canvas = document.createElement('canvas');
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        var ctx = canvas.getContext('2d');
        ctx.putImageData(imageData, 0, 0);
        
        var values = this.tool.getValues();
        var filename = 'quantized_' + 
                      values.palettePreset.toLowerCase().replace(/\s+/g, '-') + '_' +
                      values.ditherAlgorithm.toLowerCase().replace(/\s+/g, '-') + '_' +
                      Date.now() + '.png';
        
        var a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = filename;
        a.click();
        
        this.tool.setStatus('Downloaded: ' + filename);
    };

    // ═══════════════════════════════════════════════════════════════════
    // CLEANUP
    // ═══════════════════════════════════════════════════════════════════
    
    ColourQuantizer.prototype.destroy = function() {
        // Clear state
        this._state.originalImage = null;
        this._state.previewImage = null;
        this._state.processedImage = null;
        this._state.blueNoiseTexture = null;
        
        // Destroy ToolBase instance
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
        
        window.debugLog('TOOLS', 'Colour Quantizer destroyed');
    };

    // ═══════════════════════════════════════════════════════════════════
    // EXPORT
    // ═══════════════════════════════════════════════════════════════════
    
    window.ColourQuantizer = ColourQuantizer;
    console.log('✅ ColourQuantizer loaded');
})();
