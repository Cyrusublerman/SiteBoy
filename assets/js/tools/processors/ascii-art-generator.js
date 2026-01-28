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
import { sobel } from '../../shared/algorithms/edge-detection/edge-operators.js';
import { 
    extractTileMetrics, 
    findBestMatch, 
    calculateToneCost, 
    calculateQuadrantCost, 
    calculateSignatureCost, 
    calculateOrientationCostWithMode 
} from '../../shared/algorithms/ascii/index.js';
import { quantizeByPixelGroup } from '../../shared/algorithms/image/image-quantize-grid.js';
import { 
    detectSystemFonts, 
    loadGoogleFont, 
    isMonospaceFont, 
    getMonospaceFonts,
    measureCharacterMetrics 
} from '../../core/font-loader.js';

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get combined font list (system + loaded custom)
 * Falls back to common fonts if detection fails
 */
function getAvailableFonts(instance) {
    const systemFonts = instance.state.systemFonts || [];
    const customFonts = instance.state.loadedCustomFonts || [];
    const combined = [...systemFonts, ...customFonts];
    
    // Ensure at least the site default font is available
    if (!combined.includes('Atkinson Hyperlegible')) {
        combined.push('Atkinson Hyperlegible');
    }
    
    // If detection failed completely, provide fallback common fonts
    if (combined.length <= 1) {
        const fallbackFonts = [
            'Courier New', 'Consolas', 'Monaco', 'Menlo', 'Lucida Console',
            'Arial', 'Helvetica', 'Verdana', 'Times New Roman', 'Georgia'
        ];
        combined.push(...fallbackFonts);
    }
    
    return [...new Set(combined)].sort();
}

// Character sets
const CHAR_SETS = {
    'Basic': ' .:-=+*#%@',
    'Extended': ' .\'`^",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
    'Blocks': ' ░▒▓█',
    'ASCII Full': ` !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_\`abcdefghijklmnopqrstuvwxyz{|}~`
};

    // ═══════════════════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════════════

    function createToolConfig(instance) {
        return {
        title: 'ASCII ART GENERATOR',
        
        sidebar: [
            // ═══════════════════════════════════════════════════════════════════
            // TAB 1: INPUT — All source data & processing settings
            // ═══════════════════════════════════════════════════════════════════
            ['INPUT', [
                ['Output Target', [
                    ['dropdown', 'Mode', [
                        'Generic',
                        'Terminal (80×24)',
                        'Terminal (120×40)',
                        'Terminal (Custom)',
                        'Web Page',
                        'Print (A4 Portrait)',
                        'Print (A4 Landscape)',
                        'Document (Monospace)',
                        'Document (Non-monospace)'
                    ], { key: 'outputTarget', value: 'Generic' }],
                ]],
                ['Source', [
                    ['file', 'Upload Image', 'image/*', { key: 'imageFile' }],
                    ['radio', 'Text Mode', ['Black on White', 'White on Black'], { key: 'textMode', selectedValue: 'Black on White' }],
                ]],
                ['Resolution', [
                    ['slider', 'Canvas Width', 196, 4096, 14, { value: 420, key: 'canvasWidth', withNumber: true }],
                    ['slider', 'Canvas Height', 196, 4096, 14, { value: 420, key: 'canvasHeight', withNumber: true }],
                    ['radio', 'Image Fit (default: Canvas from Image)', ['Stretch', 'Fit', 'Fill', 'Center', 'Canvas from Image'], { key: 'imageFit', selectedValue: 'Canvas from Image' }],
                    ['dropdown', 'Canvas Scale', ['¼×', '½×', '1×', '2×', '4×'], { key: 'canvasScale', value: '1×' }],
                    ['button', 'A4 Portrait', null, { key: 'setA4Portrait' }],
                    ['button', 'A4 Landscape', null, { key: 'setA4Landscape' }],
                ]],
                ['Image Adjustments', [
                    ['adjustment-bundle', 'professional', null, {
                        key: 'imageAdjust'
                    }],
                ]],
                ['Processing', [
                    ['dropdown', 'Edge Detection', [
                        'Off',
                        'Replace (Current)',
                        'Overlay (Multiply)',
                        'Overlay (Screen)',
                        'Overlay (Add)',
                        'Guide Only'
                    ], { key: 'edgeMode', value: 'Off' }],
                    ['slider', 'Edge Strength', 0, 100, 1, { value: 100, key: 'edgeStrength', withNumber: true }],
                    ['toggle', 'Options', ['Invert Image'], { key: 'processOptions', selectedValues: [] }],
                ]],
                ['Preview', [
                    ['toggle', 'Split View', ['Split View', 'ASCII Over Image', 'Show Edge Detection'], { key: 'showSplitView', selectedValues: [] }],
                    ['slider', 'Divider %', 0, 100, 1, { value: 50, key: 'splitPosition', withNumber: true }],
                    ['slider', 'ASCII Opacity %', 0, 100, 1, { value: 50, key: 'asciiOpacity', withNumber: true }],
                ]],
            ]],
            
            // ═══════════════════════════════════════════════════════════════════
            // TAB 2: TYPE — All typography/font presentation settings
            // ═══════════════════════════════════════════════════════════════════
            ['TYPE', [
                ['Font', [
                    ['dropdown', 'System Font', [], { key: 'font', value: 'Atkinson Hyperlegible', dynamic: true }],
                    ['toggle', 'Filter', ['Monospace Only'], { key: 'fontFilter', selectedValues: ['Monospace Only'] }],
                ]],
                ['Load Google Font', [
                    ['text', 'Font Name', { key: 'googleFontName', placeholder: 'e.g., Roboto Mono' }],
                    ['button', 'Load', null, { key: 'loadGoogleFont' }],
                ]],
                ['Typography', [
                    ['slider', 'Font Size', 8, 24, 1, { value: 12, key: 'fontSize', withNumber: true }],
                    ['slider', 'Line Height %', 80, 120, 1, { value: 100, key: 'lineHeight', withNumber: true }],
                    ['slider', 'Letter Spacing', -2, 2, 0.1, { value: 0, key: 'letterSpacing', withNumber: true }],
                ]],
                ['Layout', [
                    ['slider', 'Margin X (chars)', 0, 20, 1, { value: 0, key: 'marginX', withNumber: true }],
                    ['slider', 'Margin Y (chars)', 0, 20, 1, { value: 0, key: 'marginY', withNumber: true }],
                    ['slider', 'Offset X (px)', -200, 200, 1, { value: 0, key: 'offsetX', withNumber: true }],
                    ['slider', 'Offset Y (px)', -200, 200, 1, { value: 0, key: 'offsetY', withNumber: true }],
                ]],
                ['Characters', [
                    ['dropdown', 'Character Set', Object.keys(CHAR_SETS), { key: 'charSet', value: 'Extended' }],
                ]],
                ['Atlas', [
                    ['button', 'Build Atlas', null, { key: 'buildAtlas' }],
                    ['label', 'Atlas not built', { key: 'atlasStatus', variant: 'caption' }],
                ]],
            ]],
            
            // ═══════════════════════════════════════════════════════════════════
            // TAB 3: MATCH — Algorithm & conversion settings
            // ═══════════════════════════════════════════════════════════════════
            ['MATCH', [
                ['Generate', [
                    ['button', 'Generate ASCII', null, { key: 'process' }],
                ]],
                ['Sampling Resolution', [
                    ['dropdown', 'Pixel Group (px)', ['1', '2', '3', '4', '5'], { key: 'pixelGroup', value: '1' }],
                ]],
                ['Matching Weights', [
                    ['slider', 'Tone α', 0, 1, 0.01, { value: 0.2, key: 'toneWeight', withNumber: true }],
                    ['slider', 'Quadrant β', 0, 1, 0.01, { value: 0.6, key: 'quadrantWeight', withNumber: true }],
                    ['slider', 'Orientation γ', 0, 1, 0.01, { value: 0.2, key: 'orientWeight', withNumber: true }],
                    ['dropdown', 'Flow Mode', [
                        'Gradient Perpendicular (Contour)',
                        'Gradient Parallel (Extrusion)',
                        'Character Stroke (Edges)',
                        'Ignore'
                    ], { key: 'flowMode', value: 'Ignore' }],
                    ['slider', 'Signature δ', 0, 1, 0.01, { value: 0.1, key: 'sigWeight', withNumber: true }],
                ]],
            ]],
            
            // ═══════════════════════════════════════════════════════════════════
            // TAB 4: DISPLAY — Visual output & export (doesn't affect conversion)
            // ═══════════════════════════════════════════════════════════════════
            ['DISPLAY', [
                ['View', [
                    ['radio', 'Display Mode', ['Fit', 'Fill', 'Actual'], { key: 'displayMode', selectedValue: 'Fit' }],
                    ['toggle', 'Show Grid', ['Grid'], { key: 'showGrid', selectedValues: [] }],
                ]],
                ['Export', [
                    ['dropdown', 'Format', ['Plain Text', 'HTML Colored', 'ANSI', 'SVG (Vector)', 'LaTeX', 'Image PNG'], { key: 'exportFormat', value: 'HTML Colored' }],
                    ['button', 'Copy Text', null, { key: 'copyText' }],
                    ['button', 'Export File', null, { key: 'exportFile' }],
                ]],
                ['Batch Process', [
                    ['file', 'Upload Folder', 'image/*', { key: 'batchFolder', multiple: true }],
                    ['button', 'Add Current to Batch', null, { key: 'addToBatch' }],
                    ['label', 'Batch: 0 images', { key: 'batchStatus', variant: 'caption' }],
                    ['label', 'Ready', { key: 'batchProgress', variant: 'caption' }],
                    ['button', 'Process Batch', null, { key: 'processBatch' }],
                    ['button', 'Export All', null, { key: 'exportBatch' }],
                    ['button', 'Clear Batch', null, { key: 'clearBatch' }],
                ]],
            ]],
        ],
        
        canvas: { 
            size: 420,
            enableZoom: true,
            enablePan: true,
            displayMode: 'fit',
            info: {
                title: 'Algorithm Info',
                content: [
                    '# Pixel-Perfect ASCII Art',
                    '',
                    '**Output pixels = Input pixels**',
                    'Each character maps to exact pixel area.',
                    '',
                    '## Cost Function',
                    '```',
                    'Cost = α×Tone + β×Quadrant + γ×Orient + δ×Sig',
                    '```',
                    '',
                    '**Tone:** Average brightness matching',
                    '**Quadrant:** 2×2 regional structure',
                    '**Orientation:** Gradient direction (Sobel)',
                    '**Signature:** 8-bin HOG pattern',
                    '',
                    '## Features',
                    '- System + Google Fonts support',
                    '- Monospace auto-detection',
                    '- Density controls (line-height, spacing)',
                    '- Multiple export formats'
                ].join('\n')
            }
        },
        
        onInit: async function(values) {
            var self = this;
            
            // Get adjustment bundle from component registry
            var adjustmentBundle = this.components.get('imageAdjust');
            
            if (!adjustmentBundle) {
                console.error('❌ ASCII Art: Adjustment bundle not found in component registry');
            } else {
                window.debugLog('TOOLS', '✅ ASCII Art: Adjustment bundle initialized');
                
                // Wire onChange callback
                adjustmentBundle.options.onChange = function(adjustedImage, settings) {
                    window.debugLog('TOOLS', '📊 ASCII Art: Image adjusted', settings);
                    instance.state.processedImageData = adjustedImage;
                    prepareProcessedBitmap(instance, adjustedImage, self);
                    
                    // Regenerate ASCII if atlas ready
                    if (instance.state.glyphAtlas && instance.state.glyphAtlas.charMetrics) {
                        processImage(instance, self);
                    } else {
                        self.draw(); // Just show adjusted image
                    }
                };
                
                // Wire onTransform callback
                adjustmentBundle.options.onTransform = function(transformedImage, transform) {
                    window.debugLog('TOOLS', '🔄 ASCII Art: Transform applied -', transform.type);
                    
                    instance.state.processedImageData = transformedImage;
                    prepareProcessedBitmap(instance, transformedImage, self);
                    
                    // Create temporary canvas to convert ImageData back to Image
                    var tempCanvas = document.createElement('canvas');
                    tempCanvas.width = transformedImage.width;
                    tempCanvas.height = transformedImage.height;
                    var tempCtx = tempCanvas.getContext('2d');
                    tempCtx.putImageData(transformedImage, 0, 0);
                    
                    var newImage = new Image();
                    newImage.onload = function() {
                        instance.state.sourceImage = newImage;
                        
                        // Update canvas dimensions if resized
                    if (transform.type === 'resize') {
                        setCanvasSize(instance, self, transformedImage.width, transformedImage.height);
                    }
                        
                        // Reprocess with new dimensions
                        if (instance.state.glyphAtlas && instance.state.glyphAtlas.charMetrics) {
                            processImage(instance, self);
                        }
                    };
                    newImage.src = tempCanvas.toDataURL();
                };
            }
            
            // Detect system fonts
            instance.state.systemFonts = await detectSystemFonts();
            
            // Update font dropdown with detected fonts
            updateFontDropdown(instance, this, values);
            
            wireButton(this, 'copyText', function() { copyToClipboard(instance, self); });
            wireButton(this, 'exportFile', function() { exportFile(instance, self); });
            wireButton(this, 'process', function() { processImage(instance, self); });
            wireButton(this, 'loadGoogleFont', function() { loadGoogleFontHandler(instance, self); });
            wireButton(this, 'buildAtlas', function() { handleBuildAtlas(instance, self); });
            wireButton(this, 'setA4Portrait', function() { applyCanvasAspectRatio(instance, self, 595 / 842); });
            wireButton(this, 'setA4Landscape', function() { applyCanvasAspectRatio(instance, self, 842 / 595); });
            wireButton(this, 'addToBatch', function() { addToBatch(instance, self); });
            wireButton(this, 'processBatch', function() { processBatch(instance, self); });
            wireButton(this, 'exportBatch', function() { exportBatch(instance, self); });
            wireButton(this, 'clearBatch', function() { clearBatch(instance, self); });
            
            // Apply initial display mode (Actual)
            applyDisplayMode(this, values.displayMode || 'Actual');
            updateAtlasStatusLabel(instance, this);
            updateBatchStatus(instance, this);
        },
        
        onUpdate: function(key, value, allValues) {
            var self = this;
            
            window.debugLog('TOOLS', `onUpdate triggered: key="${key}", value type=${typeof value}, has value=${!!value}`);
            
            if (instance.state.isRevertingAtlas) {
                return;
            }
            
            // Canvas resize - resize AND rebuild/reprocess if image loaded
            if (key === 'canvasWidth' || key === 'canvasHeight') {
                triggerAutoRebuild(instance, self, true);
                setCanvasSize(instance, this, allValues.canvasWidth || 420, allValues.canvasHeight || 420);
                return;
            }
            
            // Display mode - apply styling to canvas
            if (key === 'displayMode') {
                applyDisplayMode(self, allValues.displayMode || 'Fit');
                return;
            }
            
            // Font filter changed - update dropdown
            if (key === 'fontFilter') {
                updateFontDropdown(instance, this, allValues);
                return;
            }
            
            // Font source changed
            if (key === 'fontSource') {
                // Just toggle UI visibility, no processing needed
                return;
            }
            
            // Image upload
            if (key === 'imageFile' && value) {
                window.debugLog('TOOLS', `Image file detected, type: ${value.constructor.name}, size: ${value.size || 'unknown'}`);
                loadImage(instance, value, self);
                return; // loadImage calls processImage internally
            }
            
            // Batch folder upload
            if (key === 'batchFolder' && value) {
                window.debugLog('TOOLS', `Batch folder upload detected`);
                loadBatchFolder(instance, value, self);
                return;
            }
            
            // Output target mode
            if (key === 'outputTarget') {
                applyOutputTargetConstraints(instance, self, value);
                triggerAutoRebuild(instance, self, true);
                if (instance.state.sourceImage) {
                    processImage(instance, self);
                } else {
                    self.draw();
                }
                return;
            }
            
            // Typography changes - always rebuild
            if (key === 'font' || key === 'fontSize' || key === 'charSet' || key === 'lineHeight' || key === 'letterSpacing') {
                if (key === 'font') {
                    applyFontModeFromFont(instance, self, value);
                }
                triggerAutoRebuild(instance, self, true);
                if (instance.state.sourceImage) {
                    processImage(instance, self);
                } else {
                    self.draw();
                }
                return;
            }
            
            // Matching weights - reprocess image
            if (key === 'toneWeight' || key === 'quadrantWeight' || 
                key === 'orientWeight' || key === 'sigWeight' || key === 'flowMode') {
                if (instance.state.sourceImage) {
                    window.debugLog('TOOLS', 'Reprocessing image after weight change...');
                    processImage(instance, self);
                }
                return;
            }
            
            // Image adjustments - reprocess image
            if (key === 'gamma' || key === 'contrast' || key === 'saturation' || key === 'brightness') {
                if (instance.state.sourceImage) {
                    processImage(instance, self);
                }
                return;
            }
            
            // Image fit mode / canvas scale - update canvas and rebuild
            if (key === 'imageFit' || key === 'canvasScale') {
                if (allValues.imageFit === 'Canvas from Image') {
                    applyCanvasFromImage(instance, self, allValues);
                    triggerAutoRebuild(instance, self, true);
                    if (instance.state.sourceImage) {
                        processImage(instance, self);
                    }
                    return;
                }
                if (key === 'canvasScale') {
                    applyCanvasScale(instance, self, allValues);
                    triggerAutoRebuild(instance, self, true);
                    if (instance.state.sourceImage) {
                        processImage(instance, self);
                    }
                    return;
                }
                if (instance.state.sourceImage) {
                    triggerAutoRebuild(instance, self, true);
                    processImage(instance, self);
                }
                return;
            }
            
            // Text mode - reprocess with inverted mapping and update display
            if (key === 'textMode') {
                if (instance.state.sourceImage) {
                    triggerAutoRebuild(instance, self, true);
                    processImage(instance, self);
                } else {
                    self.draw();
                }
                return;
            }
            
            // Processing options - rebuild + reprocess
            // But also trigger immediate draw for preview
            if (key === 'processOptions' || key === 'edgeMode' || key === 'edgeStrength' || key === 'pixelGroup') {
                if (instance.state.sourceImage) {
                    triggerAutoRebuild(instance, self, true);
                    processImage(instance, self);
                } else {
                    self.draw();
                }
                return;
            }
            
            // Density and layout controls - rebuild + reprocess
            if (key === 'lineHeight' || key === 'letterSpacing' || key === 'marginX' || key === 'marginY' || key === 'offsetX' || key === 'offsetY') {
                triggerAutoRebuild(instance, self, true);
                if (instance.state.sourceImage) {
                    processImage(instance, self);
                } else {
                    self.draw();
                }
                return;
            }
            
            // Display settings - just redraw
            if (key === 'showGrid' || key === 'asciiOpacity') {
                self.draw();
                return;
            }
            
            // Preview settings - just redraw
            if (key === 'showSplitView' || key === 'splitPosition') {
                self.draw();
                return;
            }
        },
        
        onDraw: function(ctx, canvas, values) {
            var w = canvas.width;
            var h = canvas.height;
            
            // Get text rendering mode and set colors accordingly
            var textMode = values.textMode || 'Black on White';
            var bgColor = textMode === 'Black on White' ? '#FFFFFF' : '#000000';
            var textColor = textMode === 'Black on White' ? '#000000' : '#FFFFFF';
            
            // Clear with background color
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, w, h);
            
            // Parse split view options from showSplitView toggle
            var showSplitView = values.showSplitView || [];
            var splitViewEnabled = showSplitView.indexOf('Split View') >= 0;
            var showAsciiOverImage = showSplitView.indexOf('ASCII Over Image') >= 0;
            var showEdgeDetection = showSplitView.indexOf('Show Edge Detection') >= 0;
            var splitPosition = Math.max(0, Math.min(100, values.splitPosition || 50)) / 100;
            var dividerX = Math.floor(w * splitPosition);
            
            if (splitViewEnabled && (instance.state.processedPreviewData || instance.state.processedImageData)) {
                // Left: adjusted image (with optional edge detection overlay)
                ctx.save();
                ctx.beginPath();
                ctx.rect(0, 0, dividerX, h);
                ctx.clip();
                drawAdjustedImage(instance, ctx, w, h, values);
                
                // Optionally overlay edge detection on left side
                if (showEdgeDetection && instance.state.edgeDetectionData) {
                    drawEdgeDetection(instance, ctx, w, h, values);
                }
                ctx.restore();
                
                // Right: ASCII output (with optional image underlay)
                ctx.save();
                ctx.beginPath();
                ctx.rect(dividerX, 0, w - dividerX, h);
                ctx.clip();
                
                // Optionally draw image under ASCII on right side
                if (showAsciiOverImage) {
                    drawAdjustedImage(instance, ctx, w, h, values);
                }
                
                if (instance.state.asciiGrid && instance.state.asciiGrid.length > 0) {
                    if (showAsciiOverImage) {
                        var asciiOpacity = (values.asciiOpacity || 50) / 100;
                        ctx.globalAlpha = asciiOpacity;
                    }
                    drawAscii(instance, ctx, w, h, values);
                    ctx.globalAlpha = 1.0;
                }
                ctx.restore();
                
                // Divider
                ctx.strokeStyle = '#00FF00';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(dividerX, 0);
                ctx.lineTo(dividerX, h);
                ctx.stroke();
            } else if (showEdgeDetection && instance.state.edgeDetectionData) {
                // Show edge detection
                drawAdjustedImage(instance, ctx, w, h, values);
                drawEdgeDetection(instance, ctx, w, h, values);
            } else if (showAsciiOverImage && instance.state.asciiGrid && instance.state.asciiGrid.length > 0) {
                // Draw image first
                drawAdjustedImage(instance, ctx, w, h, values);
                // Then draw ASCII with transparency
                var asciiOpacity = (values.asciiOpacity || 50) / 100;
                ctx.globalAlpha = asciiOpacity;
                drawAscii(instance, ctx, w, h, values);
                ctx.globalAlpha = 1.0;
            } else if (instance.state.asciiGrid && instance.state.asciiGrid.length > 0) {
                drawAscii(instance, ctx, w, h, values);
            } else {
                // Placeholder
                ctx.fillStyle = textColor;
                ctx.font = '14px "Atkinson Hyperlegible", monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('Upload an image to convert', w / 2, h / 2);
            }
        }
    }; // end of config object
    } // end createToolConfig

// ═══════════════════════════════════════════════════════════════════════════════
// GLYPH ATLAS
// ═══════════════════════════════════════════════════════════════════════════════
    
    function updateAtlasStatusLabel(instance, toolInstance) {
        var label = toolInstance.getComponent('atlasStatus');
        if (label && label.setContent) {
            if (!instance.state.atlasLocked) {
                label.setContent('Atlas not built');
                return;
            }
            
            if (instance.state.rebuildArmed) {
                label.setContent('Atlas locked - click Rebuild again to confirm');
                return;
            }
            
            if (instance.state.atlasWarning) {
                label.setContent('Atlas locked - rebuild to apply changes');
                return;
            }
            
            label.setContent('Atlas locked');
        }
    }
    
    function updateAtlasButton(instance, toolInstance) {
        var button = toolInstance.getComponent('buildAtlas');
        if (button && button.setText) {
            if (!instance.state.atlasLocked) {
                button.setText('Build Atlas');
                return;
            }
            
            button.setText(instance.state.rebuildArmed ? 'Confirm Rebuild' : 'Rebuild Atlas');
        }
    }
    
    function restoreAtlasConfig(instance, toolInstance) {
        if (!instance.state.atlasConfig) return;
        
        instance.state.isRevertingAtlas = true;
        toolInstance.values.font = instance.state.atlasConfig.font;
        toolInstance.values.fontSize = instance.state.atlasConfig.fontSize;
        toolInstance.values.lineHeight = instance.state.atlasConfig.lineHeight;
        toolInstance.values.letterSpacing = instance.state.atlasConfig.letterSpacing;
        toolInstance.values.charSet = instance.state.atlasConfig.charSet;
        toolInstance.values.pixelGroup = instance.state.atlasConfig.pixelGroup;
        
        var fontComponent = toolInstance.getComponent('font');
        var fontSizeComponent = toolInstance.getComponent('fontSize');
        var lineHeightComponent = toolInstance.getComponent('lineHeight');
        var letterSpacingComponent = toolInstance.getComponent('letterSpacing');
        var charSetComponent = toolInstance.getComponent('charSet');
        var resolutionComponent = toolInstance.getComponent('pixelGroup');
        
        if (fontComponent && fontComponent.setValue) fontComponent.setValue(instance.state.atlasConfig.font);
        if (fontSizeComponent && fontSizeComponent.setValue) fontSizeComponent.setValue(instance.state.atlasConfig.fontSize, false);
        if (lineHeightComponent && lineHeightComponent.setValue) lineHeightComponent.setValue(instance.state.atlasConfig.lineHeight, false);
        if (letterSpacingComponent && letterSpacingComponent.setValue) letterSpacingComponent.setValue(instance.state.atlasConfig.letterSpacing, false);
        if (charSetComponent && charSetComponent.setValue) charSetComponent.setValue(instance.state.atlasConfig.charSet);
        if (resolutionComponent && resolutionComponent.setValue) resolutionComponent.setValue(instance.state.atlasConfig.pixelGroup);
        
        instance.state.isRevertingAtlas = false;
    }
    
    function handleBuildAtlas(instance, toolInstance, skipProcess, forceRebuild) {
        var values = toolInstance.getValues();
        
        if (instance.state.atlasLocked && !instance.state.rebuildArmed && !forceRebuild) {
            instance.state.rebuildArmed = true;
            instance.state.atlasWarning = false;
            updateAtlasButton(instance, toolInstance);
            updateAtlasStatusLabel(instance, toolInstance);
            window.debugLog('TOOLS', 'Atlas rebuild armed. Click Rebuild again to confirm.');
            return;
        }
        
        instance.state.rebuildArmed = false;
        
        buildGlyphAtlas(instance, values);
        instance.state.atlasLocked = true;
        instance.state.atlasWarning = false;
        instance.state.atlasConfig = {
            font: values.font,
            fontSize: values.fontSize,
            lineHeight: values.lineHeight,
            letterSpacing: values.letterSpacing,
            charSet: values.charSet,
            pixelGroup: values.pixelGroup
        };
        
        updateAtlasButton(instance, toolInstance);
        updateAtlasStatusLabel(instance, toolInstance);
        
        if (instance.state.sourceImage && !skipProcess) {
            processImage(instance, toolInstance);
        }
    }

    function triggerAutoRebuild(instance, toolInstance, skipProcess) {
        handleBuildAtlas(instance, toolInstance, skipProcess, true);
    }
    
    function buildGlyphAtlas(instance, values) {
        var charSet = CHAR_SETS[values.charSet] || CHAR_SETS['Extended'];
        var font = values.font || 'Atkinson Hyperlegible';
        var fontSize = values.fontSize || 12;
        var resolution = parsePixelGroup(values.pixelGroup || '1');
        
        // Measure exact character dimensions
        var metrics = measureCharacterMetrics(font, fontSize);
        var tw = metrics.width;
        var th = metrics.height;
        
        instance.state.glyphAtlas = [];
        
        // Store metrics for use in processing
        instance.state.glyphAtlas.charMetrics = {
            width: tw,
            height: th,
            baseline: metrics.baseline,
            font: font,
            fontSize: fontSize
        };
        
        // Create temporary canvas
        var canvas = document.createElement('canvas');
        canvas.width = tw;
        canvas.height = th;
        var ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        instance.state.glyphAtlas.widthMap = {};
        var totalWidth = 0;
        
        for (var i = 0; i < charSet.length; i++) {
            var char = charSet[i];
            
            // Render character
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, tw, th);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `${fontSize}px "${font}", monospace`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(char, 0, 0);
            
            // Measure character width for proportional mode
            var charWidth = Math.max(1, Math.ceil(ctx.measureText(char).width));
            instance.state.glyphAtlas.widthMap[char] = charWidth;
            totalWidth += charWidth;
            
            // Get image data and extract metrics using glyph width
            var imageData = ctx.getImageData(0, 0, tw, th);
        var metricsData = extractTileMetrics(imageData.data, tw, 0, 0, Math.min(charWidth, tw), th, resolution);
            
            var density = metricsData.density;
            var quadrants = metricsData.quadrants;
            var orientation = metricsData.orientation;
            var signature = metricsData.signature;
            
            instance.state.glyphAtlas.push({
                char: char,
                width: charWidth,
                density: density,
                quadrants: quadrants,
                orientation: orientation,
                signature: signature
            });
        }
        
        instance.state.glyphAtlas.averageWidth = totalWidth / Math.max(1, charSet.length);
        
        window.debugLog('TOOLS', `Glyph atlas built: ${instance.state.glyphAtlas.length} characters at ${tw}×${th}px`);
    }
    
    

    // ═══════════════════════════════════════════════════════════════════════════════
    // IMAGE PROCESSING
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function applyInvert(data) {
        var result = new Uint8ClampedArray(data.length);
        
        for (var i = 0; i < data.length; i += 4) {
            result[i] = 255 - data[i];         // Invert R
            result[i + 1] = 255 - data[i + 1]; // Invert G
            result[i + 2] = 255 - data[i + 2]; // Invert B
            result[i + 3] = data[i + 3];       // Alpha unchanged
        }
        
        return result;
    }
    
    function prepareProcessedBitmap(instance, imageData, toolInstance) {
        if (!imageData) return;
        if (typeof createImageBitmap !== 'function') {
            instance.state.processedImageBitmap = null;
            return;
        }
        
        if (instance.state.isPreparingBitmap) return;
        instance.state.isPreparingBitmap = true;
        
        createImageBitmap(imageData)
            .then(function(bitmap) {
                instance.state.processedImageBitmap = bitmap;
                instance.state.isPreparingBitmap = false;
                
                if (toolInstance) {
                    toolInstance.draw();
                }
            })
            .catch(function(error) {
                instance.state.isPreparingBitmap = false;
                console.error('Failed to create image bitmap', error);
            });
    }
    
    function loadImage(instance, file, toolInstance) {
        window.debugLog('TOOLS', `loadImage called with file: ${file ? file.name : 'null'}`);
        
        var reader = new FileReader();
        reader.onload = function(e) {
            window.debugLog('TOOLS', 'FileReader loaded successfully');
            var img = new Image();
            img.onload = function() {
                instance.state.sourceImage = img;
                toolInstance.values.sourceImageWidth = img.width;
                toolInstance.values.sourceImageHeight = img.height;
                window.debugLog('TOOLS', `Image loaded: ${img.width}×${img.height}px`);
                instance.state.processedImageData = null;
                instance.state.processedImageBitmap = null;
                instance.state.isPreparingBitmap = false;
                
                // Create ImageData and feed to adjustment bundle
                var tempCanvas = document.createElement('canvas');
                tempCanvas.width = img.width;
                tempCanvas.height = img.height;
                var tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(img, 0, 0);
                var imageData = tempCtx.getImageData(0, 0, img.width, img.height);
                
                // Send to adjustment bundle
                var adjustmentBundle = toolInstance.components.get('imageAdjust');
                if (adjustmentBundle) {
                    window.debugLog('TOOLS', '📤 Sending image to adjustment bundle');
                    adjustmentBundle.setImage(imageData);
                } else {
                    console.error('❌ Adjustment bundle not found');
                }
                
                window.debugLog('TOOLS', '🔨 Auto-building atlas after image upload');
                var values = toolInstance.getValues();
                var skipProcess = values.imageFit === 'Canvas from Image';
                triggerAutoRebuild(instance, toolInstance, true);
                
                if (skipProcess) {
                    applyCanvasFromImage(instance, toolInstance, values);
                } else {
                    setCanvasSize(instance, toolInstance, img.width, img.height);
                }
                
            };
            img.onerror = function() {
                console.error('Failed to load image');
            };
            img.src = e.target.result;
        };
        reader.onerror = function() {
            console.error('Failed to read file');
        };
        reader.readAsDataURL(file);
    }
    
    function processImage(instance, toolInstance) {
        if (!instance.state.sourceImage) {
            window.debugLog('TOOLS', '⚠️ Cannot process: no source image');
            return;
        }
        
        if (!instance.state.glyphAtlas || !instance.state.glyphAtlas.charMetrics) {
            window.debugLog('TOOLS', '⚠️ Cannot process: glyph atlas not ready');
            return;
        }
        
        window.debugLog('TOOLS', '🔄 Processing image...');
        
        var values = toolInstance.getValues();
        var toneWeight = values.toneWeight || 0.4;
        var quadrantWeight = values.quadrantWeight || 0.2;
        var orientWeight = values.orientWeight || 0.3;
        var sigWeight = values.sigWeight || 0.1;
        var flowMode = values.flowMode || 'Gradient Perpendicular (Contour)';
        
        // Get processing options (ASCII-specific)
        var edgeMode = values.edgeMode || 'Off';
        var edgeStrength = (values.edgeStrength || 100) / 100;
        var invert = (values.processOptions || []).indexOf('Invert Image') >= 0;
        
        // Use measured character dimensions (pixel-perfect)
        var tw = instance.state.glyphAtlas.charMetrics.width;
        var th = instance.state.glyphAtlas.charMetrics.height;
        var lineHeightPercent = values.lineHeight || 100;
        var letterSpacing = values.letterSpacing || 0;
        var lineHeight = (th * lineHeightPercent) / 100;
        
        // Calculate grid dimensions - use CANVAS size, not source image
        // This prevents cropping by making the canvas size determine the grid
        var canvasWidth = values.canvasWidth || 420;
        var canvasHeight = values.canvasHeight || 420;
        
        // Calculate how many characters fit the canvas
        var cols = Math.floor(canvasWidth / (tw + letterSpacing));
        var rows = Math.floor(canvasHeight / lineHeight);
        
        // Calculate exact output dimensions (may be slightly less than canvas)
        var outputWidth = cols * (tw + letterSpacing);
        var outputHeight = rows * lineHeight;
        
        toolInstance.values.gridCols = cols;
        toolInstance.values.gridRows = rows;
        toolInstance.values.outputWidth = Math.round(outputWidth);
        toolInstance.values.outputHeight = Math.round(outputHeight);
        
        window.debugLog('TOOLS', `Canvas: ${canvasWidth}×${canvasHeight}px → Grid: ${cols}×${rows} chars → Output: ${outputWidth}×${outputHeight}px`);
        
        // Create temporary canvas at canvas resolution
        // Scale source image to fit exactly into canvas based on fit mode
        var canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        var ctx = canvas.getContext('2d');
        
        // Get image fit mode
        var imageFit = values.imageFit || 'Stretch';
        var sourceWidth = instance.state.sourceImage.width;
        var sourceHeight = instance.state.sourceImage.height;
        var sourceCanvas = null;
        
        if (instance.state.processedImageData) {
            sourceCanvas = document.createElement('canvas');
            sourceCanvas.width = instance.state.processedImageData.width;
            sourceCanvas.height = instance.state.processedImageData.height;
            var sourceCtx = sourceCanvas.getContext('2d');
            sourceCtx.putImageData(instance.state.processedImageData, 0, 0);
            sourceWidth = instance.state.processedImageData.width;
            sourceHeight = instance.state.processedImageData.height;
        } else {
            sourceCanvas = instance.state.sourceImage;
        }
        
        // Calculate source region and destination region based on fit mode
        var sx = 0, sy = 0, sw = sourceWidth, sh = sourceHeight;
        var dx = 0, dy = 0, dw = canvasWidth, dh = canvasHeight;
        
        var sourceMatchesCanvas = sourceWidth === canvasWidth && sourceHeight === canvasHeight;
        
        if (sourceMatchesCanvas) {
            imageFit = 'Stretch';
        }
        
        if (!sourceMatchesCanvas) {
        switch(imageFit) {
            case 'Stretch':
                // Default - stretch to fill entire output
                // Already set above
                break;
                
            case 'Fit':
                // Scale to fit, maintain aspect ratio, may have margins
                var canvasAspect = canvasWidth / canvasHeight;
                var sourceAspect = sourceWidth / sourceHeight;
                var scale = (canvasAspect >= sourceAspect)
                    ? (canvasHeight / sourceHeight)
                    : (canvasWidth / sourceWidth);
                dw = sourceWidth * scale;
                dh = sourceHeight * scale;
                dx = (canvasWidth - dw) / 2;
                dy = (canvasHeight - dh) / 2;
                break;
                
            case 'Fill':
                // Scale to fill, maintain aspect ratio, may crop
                var canvasAspect = canvasWidth / canvasHeight;
                var sourceAspect = sourceWidth / sourceHeight;
                var scale = (canvasAspect >= sourceAspect)
                    ? (canvasWidth / sourceWidth)
                    : (canvasHeight / sourceHeight);
                var scaledWidth = sourceWidth * scale;
                var scaledHeight = sourceHeight * scale;
                sx = (scaledWidth > canvasWidth) ? (scaledWidth - canvasWidth) / (2 * scale) : 0;
                sy = (scaledHeight > canvasHeight) ? (scaledHeight - canvasHeight) / (2 * scale) : 0;
                sw = canvasWidth / scale;
                sh = canvasHeight / scale;
                break;
                
            case 'Center':
                // No scaling, center crop
                sx = Math.max(0, (sourceWidth - canvasWidth) / 2);
                sy = Math.max(0, (sourceHeight - canvasHeight) / 2);
                sw = Math.min(sourceWidth, canvasWidth);
                sh = Math.min(sourceHeight, canvasHeight);
                dx = Math.max(0, (canvasWidth - sourceWidth) / 2);
                dy = Math.max(0, (canvasHeight - sourceHeight) / 2);
                dw = sw;
                dh = sh;
                break;
            }
        }
        
        // Fill with black first (for Fit mode margins)
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Draw source image with calculated regions
        ctx.drawImage(sourceCanvas, sx, sy, sw, sh, dx, dy, dw, dh);
        instance.state.processedPreviewData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
        
        var data = new Uint8ClampedArray(instance.state.processedPreviewData.data);
        
        // Apply ASCII-specific processing options
        // (Edge detection and invert are NOT in adjustment bundle)
        
        if (edgeMode !== 'Off') {
            window.debugLog('TOOLS', `🔍 Applying edge detection: ${edgeMode}`);
            var edges = applyEdgeDetection(data, canvasWidth, canvasHeight);
            
            // Store edge detection for visualization
            instance.state.edgeDetectionData = new ImageData(
                new Uint8ClampedArray(edges),
                canvasWidth,
                canvasHeight
            );
            
            switch (edgeMode) {
                case 'Replace (Current)':
                    data = edges;
                    break;
                case 'Overlay (Multiply)':
            for (var i = 0; i < data.length; i += 4) {
                        var edgeValue = edges[i] / 255;
                        var darkness = 1 - (edgeValue * edgeStrength);
                        data[i] = Math.min(255, data[i] * darkness);
                        data[i + 1] = Math.min(255, data[i + 1] * darkness);
                        data[i + 2] = Math.min(255, data[i + 2] * darkness);
                    }
                    break;
                case 'Overlay (Screen)':
                    for (var i = 0; i < data.length; i += 4) {
                        var edgeValue = edges[i] / 255;
                        var brightness = edgeValue * edgeStrength * 255;
                        data[i] = Math.min(255, data[i] + brightness);
                        data[i + 1] = Math.min(255, data[i + 1] + brightness);
                        data[i + 2] = Math.min(255, data[i + 2] + brightness);
                    }
                    break;
                case 'Overlay (Add)':
                    for (var i = 0; i < data.length; i += 4) {
                        var edgeValue = edges[i] / 255;
                        var boost = edgeValue * edgeStrength * 128;
                        data[i] = Math.min(255, data[i] + boost);
                        data[i + 1] = Math.min(255, data[i + 1] + boost);
                        data[i + 2] = Math.min(255, data[i + 2] + boost);
                    }
                    break;
                case 'Guide Only':
                    // No visual change; edges reserved for future guidance
                    break;
            }
        } else {
            instance.state.edgeDetectionData = null;
        }
        
        if (invert) {
            window.debugLog('TOOLS', '🔄 Applying invert');
            data = applyInvert(data);
        }
        
        var pixelGroup = parsePixelGroup(values.pixelGroup || '1');
        var fontMode = values.fontMode || 'Monospace (Grid)';
        var sampleData = (pixelGroup > 1)
            ? quantizeByPixelGroup(data, canvasWidth, canvasHeight, pixelGroup)
            : data;
        
        if (fontMode === 'Proportional (Sequential)') {
            processImageProportional(instance, toolInstance, sampleData, canvasWidth, canvasHeight, values, {
                tone: toneWeight,
                quadrant: quadrantWeight,
                orientation: orientWeight,
                signature: sigWeight
            }, flowMode, pixelGroup);
            return;
        }
        
        // Convert to ASCII grid
        instance.state.asciiGrid = [];
        
        window.debugLog('TOOLS', `Processing image: ${cols}×${rows} tiles`);
        
        for (var row = 0; row < rows; row++) {
            var line = [];
            for (var col = 0; col < cols; col++) {
                var offsets = getLayoutOffsets(values, canvasWidth, canvasHeight, outputWidth, outputHeight, lineHeight, tw);
                var tileX = offsets.offsetX + col * (tw + letterSpacing);
                var tileY = offsets.offsetY + row * lineHeight;
                var tile = extractTileMetrics(sampleData, canvasWidth, Math.floor(tileX), Math.floor(tileY), Math.floor(tw), Math.floor(th), pixelGroup);
                // Apply inversion for "Black on White" mode (glyph atlas is white-on-black, so invert image to match)
                if (values.textMode === 'Black on White') {
                    tile = invertTileMetrics(tile);
                }
                var bestChar = findBestMatch(tile, instance.state.glyphAtlas, {
                    tone: toneWeight,
                    quadrant: quadrantWeight,
                    orientation: orientWeight,
                    signature: sigWeight
                }, flowMode);
                line.push(bestChar);
            }
            instance.state.asciiGrid.push(line);
        }
        
        // Coherence disabled per critical analysis (kept for future research)
        
        window.debugLog('TOOLS', `✅ ASCII generation complete: ${rows} lines × ${cols} columns = ${rows * cols} characters`);
        toolInstance.draw();
    }
    
    function processImageProportional(instance, toolInstance, data, canvasWidth, canvasHeight, values, weights, flowMode, pixelGroup) {
        if (!instance.state.glyphAtlas || !instance.state.glyphAtlas.charMetrics) return;
        
        var charHeight = instance.state.glyphAtlas.charMetrics.height;
        var lineHeightPercent = values.lineHeight || 100;
        var lineHeight = (charHeight * lineHeightPercent) / 100;
        var letterSpacing = values.letterSpacing || 0;
        var avgWidth = instance.state.glyphAtlas.averageWidth || instance.state.glyphAtlas.charMetrics.width;
        var marginX = (values.marginX || 0) * avgWidth;
        var marginY = (values.marginY || 0) * lineHeight;
        var startX = marginX + (values.offsetX || 0);
        var startY = marginY + (values.offsetY || 0);
        var maxX = Math.max(startX, canvasWidth - marginX);
        var maxY = Math.max(startY, canvasHeight - marginY);
        
        instance.state.asciiGrid = [];
        
        // PERFORMANCE FIX: Extract tile ONCE per position using average width,
        // then match against pre-computed glyph metrics (same as monospace mode)
        var sampleWidth = Math.floor(avgWidth);
        var sampleHeight = Math.floor(charHeight);
        var shouldInvert = (values.textMode === 'Black on White');
        
        var y = startY;
        while (y + charHeight <= maxY) {
            var line = [];
            var x = startX;
            
            while (x + sampleWidth <= maxX) {
                // Extract tile metrics ONCE per position
                var tile = extractTileMetrics(data, canvasWidth, Math.floor(x), Math.floor(y), sampleWidth, sampleHeight, pixelGroup);
                if (shouldInvert) {
                    tile = invertTileMetrics(tile);
                }
                
                // Use existing findBestMatch for O(n) glyph comparison
                var bestChar = findBestMatch(tile, instance.state.glyphAtlas, weights, flowMode);
                var bestWidth = instance.state.glyphAtlas.widthMap[bestChar] || avgWidth;
                
                line.push({ char: bestChar, x: x, y: y });
                x += bestWidth + letterSpacing;
            }
            
            instance.state.asciiGrid.push(line);
            y += lineHeight;
        }
        
        toolInstance.draw();
    }
    function applyEdgeDetection(data, w, h) {
        // Convert RGB to grayscale Float32Array for edge detection algorithm
        var grayscale = new Float32Array(w * h);
        for (var i = 0; i < data.length; i += 4) {
            var luma = data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
            grayscale[i / 4] = luma;
        }
        
        // Apply Sobel edge detection using algorithm library
        var edgeResult = sobel(grayscale, w, h);
        var magnitude = edgeResult.magnitude;
        
        // Convert magnitude back to RGB Uint8ClampedArray
        var result = new Uint8ClampedArray(data.length);
        for (var i = 0; i < magnitude.length; i++) {
            var val = Math.min(255, magnitude[i]);
            result[i * 4] = val;
            result[i * 4 + 1] = val;
            result[i * 4 + 2] = val;
            result[i * 4 + 3] = 255;
        }
        
        return result;
    }
    
    // DEPRECATED: Coherence disabled per critical analysis.
    // Keep for research into alternatives (cost regularization, perceptual grouping).
    function applyCoherenceToGrid(grid, strength) {
        // Coherence smoothing on grid structure
        var result = [];
        var rows = grid.length;
        var cols = grid[0] ? grid[0].length : 0;
        
        for (var y = 0; y < rows; y++) {
            var line = [];
            for (var x = 0; x < cols; x++) {
                var current = grid[y][x];
                
                // Collect neighbors
                var neighbors = [];
                for (var dy = -1; dy <= 1; dy++) {
                    for (var dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        var ny = y + dy;
                        var nx = x + dx;
                        if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
                            neighbors.push(grid[ny][nx]);
                        }
                    }
                }
                
                if (neighbors.length === 0) {
                    line.push(current);
                    continue;
                }
                
                // Count neighbor occurrences
                var counts = {};
                for (var i = 0; i < neighbors.length; i++) {
                    var ch = neighbors[i];
                    counts[ch] = (counts[ch] || 0) + 1;
                }
                
                // Find most common neighbor
                var maxCount = 0;
                var mostCommon = current;
                for (var ch in counts) {
                    if (counts[ch] > maxCount) {
                        maxCount = counts[ch];
                        mostCommon = ch;
                    }
                }
                
                // Replace if most neighbors agree (based on strength)
                var threshold = neighbors.length * strength;
                if (maxCount > threshold && mostCommon !== current) {
                    line.push(mostCommon);
                } else {
                    line.push(current);
                }
            }
            result.push(line);
        }
        
        return result;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // RENDERING
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function getLayoutOffsets(values, canvasWidth, canvasHeight, outputWidth, outputHeight, lineHeight, charWidth) {
        var marginX = (values.marginX || 0) * charWidth;
        var marginY = (values.marginY || 0) * lineHeight;
        var offsetX = (values.offsetX || 0);
        var offsetY = (values.offsetY || 0);
        
        var availableWidth = Math.max(0, canvasWidth - (marginX * 2));
        var availableHeight = Math.max(0, canvasHeight - (marginY * 2));
        
        var baseX = marginX + Math.max(0, (availableWidth - outputWidth) / 2);
        var baseY = marginY + Math.max(0, (availableHeight - outputHeight) / 2);
        
        return {
            offsetX: baseX + offsetX,
            offsetY: baseY + offsetY
        };
    }
    
    function getAsciiLayout(instance, values, canvasWidth, canvasHeight) {
        if (!instance.state.asciiGrid || !instance.state.glyphAtlas || !instance.state.glyphAtlas.charMetrics) return null;
        
        var charWidth = instance.state.glyphAtlas.charMetrics.width;
        var charHeight = instance.state.glyphAtlas.charMetrics.height;
        var lineHeightPercent = values.lineHeight || 100;
        var letterSpacing = values.letterSpacing || 0;
        var lineHeight = (charHeight * lineHeightPercent) / 100;
        var rows = instance.state.asciiGrid.length;
        var cols = instance.state.asciiGrid[0] ? instance.state.asciiGrid[0].length : 0;
        
        var outputWidth = cols * (charWidth + letterSpacing);
        var outputHeight = rows * lineHeight;
        var offsets = getLayoutOffsets(values, canvasWidth, canvasHeight, outputWidth, outputHeight, lineHeight, charWidth);
        
        return {
            charWidth: charWidth,
            charHeight: charHeight,
            lineHeight: lineHeight,
            letterSpacing: letterSpacing,
            rows: rows,
            cols: cols,
            outputWidth: outputWidth,
            outputHeight: outputHeight,
            offsetX: offsets.offsetX,
            offsetY: offsets.offsetY
        };
    }
    
    function drawAscii(instance, ctx, w, h, values) {
        if (!instance.state.asciiGrid || !instance.state.glyphAtlas || !instance.state.glyphAtlas.charMetrics) return;
        
        var font = instance.state.glyphAtlas.charMetrics.font;
        var fontSize = instance.state.glyphAtlas.charMetrics.fontSize;
        var layout = getAsciiLayout(instance, values, w, h);
        if (!layout) return;
        
        // Get appearance settings
        var textMode = values.textMode || 'Black on White';
        var textColor = textMode === 'Black on White' ? '#000000' : '#FFFFFF';
        var showGrid = (values.showGrid || []).indexOf('Grid') >= 0;
        
        ctx.fillStyle = textColor;
        ctx.font = `${fontSize}px "${font}", monospace`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        var fontMode = values.fontMode || 'Monospace (Grid)';
        var rows = layout.rows;
        var cols = layout.cols;
        var outputWidth = layout.outputWidth;
        var outputHeight = layout.outputHeight;
        var offsetX = layout.offsetX;
        var offsetY = layout.offsetY;
        
        if (fontMode === 'Proportional (Sequential)') {
            for (var row = 0; row < rows; row++) {
                for (var col = 0; col < instance.state.asciiGrid[row].length; col++) {
                    var item = instance.state.asciiGrid[row][col];
                    ctx.fillText(item.char, offsetX + item.x, offsetY + item.y);
                }
            }
        } else {
        // Draw character grid
        for (var row = 0; row < rows; row++) {
            for (var col = 0; col < cols; col++) {
                var char = instance.state.asciiGrid[row][col];
                    var x = offsetX + col * (layout.charWidth + layout.letterSpacing);
                    var y = offsetY + row * layout.lineHeight;
                
                // Draw grid if enabled
                if (showGrid) {
                    ctx.strokeStyle = '#800000'; // VGA maroon
                    ctx.lineWidth = 1;
                        ctx.strokeRect(x, y, layout.charWidth, layout.charHeight);
                }
                
                ctx.fillText(char, x, y);
                }
            }
        }
        
        // Show dimensions info
        ctx.fillStyle = '#808080'; // VGA gray
        ctx.font = '10px "Atkinson Hyperlegible", monospace';
        ctx.fillText(`${cols}×${rows} chars | ${Math.round(outputWidth)}×${Math.round(outputHeight)}px`, 5, h - 15);
    }
    
    function drawAdjustedImage(instance, ctx, areaWidth, areaHeight, values) {
        if (areaWidth <= 0 || areaHeight <= 0) return;
        
        var previewData = instance.state.processedPreviewData || instance.state.processedImageData;
        if (!previewData) return;
        
        var drawWidth = previewData.width;
        var drawHeight = previewData.height;
        var offsetX = 0;
        var offsetY = 0;
        
        if (previewData.width !== areaWidth || previewData.height !== areaHeight) {
            var scale = Math.min(areaWidth / previewData.width, areaHeight / previewData.height);
            drawWidth = previewData.width * scale;
            drawHeight = previewData.height * scale;
            offsetX = Math.floor((areaWidth - drawWidth) / 2);
            offsetY = Math.floor((areaHeight - drawHeight) / 2);
        }
        
        if (instance.state.processedImageBitmap && !instance.state.processedPreviewData) {
            ctx.drawImage(instance.state.processedImageBitmap, offsetX, offsetY, drawWidth, drawHeight);
            return;
        }
        
        var tempCanvas = document.createElement('canvas');
        tempCanvas.width = previewData.width;
        tempCanvas.height = previewData.height;
        var tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(previewData, 0, 0);
        ctx.drawImage(tempCanvas, offsetX, offsetY, drawWidth, drawHeight);
    }
    
    function drawEdgeDetection(instance, ctx, areaWidth, areaHeight, values) {
        if (areaWidth <= 0 || areaHeight <= 0) return;
        if (!instance.state.edgeDetectionData) return;
        
        var edgeData = instance.state.edgeDetectionData;
        var drawWidth = edgeData.width;
        var drawHeight = edgeData.height;
        var offsetX = 0;
        var offsetY = 0;
        
        if (edgeData.width !== areaWidth || edgeData.height !== areaHeight) {
            var scale = Math.min(areaWidth / edgeData.width, areaHeight / edgeData.height);
            drawWidth = edgeData.width * scale;
            drawHeight = edgeData.height * scale;
            offsetX = Math.floor((areaWidth - drawWidth) / 2);
            offsetY = Math.floor((areaHeight - drawHeight) / 2);
        }
        
        var tempCanvas = document.createElement('canvas');
        tempCanvas.width = edgeData.width;
        tempCanvas.height = edgeData.height;
        var tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(edgeData, 0, 0);
        ctx.drawImage(tempCanvas, offsetX, offsetY, drawWidth, drawHeight);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // BATCH PROCESSING
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function updateBatchStatus(instance, toolInstance) {
        var label = toolInstance.getComponent('batchStatus');
        if (label && label.setContent) {
            var count = instance.state.batchQueue.length;
            label.setContent(`Batch: ${count} image${count !== 1 ? 's' : ''}`);
        }
    }
    
    function updateBatchProgress(instance, toolInstance, message) {
        var label = toolInstance.getComponent('batchProgress');
        if (label && label.setContent) {
            label.setContent(message);
        }
    }
    
    function loadBatchFolder(instance, files, toolInstance) {
        // Handle FileList or array of files
        var fileArray = Array.isArray(files) ? files : Array.from(files);
        var imageFiles = fileArray.filter(function(file) {
            return file.type.startsWith('image/');
        });
        
        if (imageFiles.length === 0) {
            window.debugLog('TOOLS', '⚠️ No image files found in selection');
            updateBatchProgress(instance, toolInstance, 'No images found');
            return;
        }
        
        if (imageFiles.length > 1000) {
            window.debugLog('TOOLS', `⚠️ ${imageFiles.length} images exceeds recommended limit of 1000`);
            if (!confirm(`Processing ${imageFiles.length} images may take several minutes and use significant memory. Continue?`)) {
                updateBatchProgress(instance, toolInstance, 'Cancelled');
                return;
            }
        }
        
        window.debugLog('TOOLS', `📁 Loading batch folder: ${imageFiles.length} images`);
        updateBatchProgress(instance, toolInstance, `Loading ${imageFiles.length} images...`);
        
        var values = toolInstance.getValues();
        var processedCount = 0;
        var failedCount = 0;
        var totalFiles = imageFiles.length;
        var startTime = Date.now();
        
        // Sort files by name for sequential frame processing
        imageFiles.sort(function(a, b) {
            return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
        });
        
        // Process each image sequentially with progress updates
        function processNextImage(index) {
            if (index >= imageFiles.length) {
                var duration = ((Date.now() - startTime) / 1000).toFixed(1);
                var message = `Complete: ${processedCount}/${totalFiles} processed in ${duration}s`;
                if (failedCount > 0) {
                    message += ` (${failedCount} failed)`;
                }
                window.debugLog('TOOLS', `✅ ${message}`);
                updateBatchProgress(instance, toolInstance, message);
                updateBatchStatus(instance, toolInstance);
                return;
            }
            
            // Update progress every 10 images or on last image
            if (index % 10 === 0 || index === imageFiles.length - 1) {
                var percent = Math.round((index / imageFiles.length) * 100);
                var elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
                var rate = (index / (Date.now() - startTime) * 1000).toFixed(1);
                updateBatchProgress(instance, toolInstance, 
                    `Processing: ${index}/${totalFiles} (${percent}%) - ${rate} img/s`);
                updateBatchStatus(instance, toolInstance);
            }
            
            var file = imageFiles[index];
            var fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
            
            var reader = new FileReader();
            reader.onload = function(e) {
                var img = new Image();
                img.onload = function() {
                    try {
                        // Create ImageData for processing (don't store full image to save memory)
                        var tempCanvas = document.createElement('canvas');
                        tempCanvas.width = img.width;
                        tempCanvas.height = img.height;
                        var tempCtx = tempCanvas.getContext('2d');
                        tempCtx.drawImage(img, 0, 0);
                        var imageData = tempCtx.getImageData(0, 0, img.width, img.height);
                        
                        // Process to ASCII with current atlas
                        if (instance.state.glyphAtlas && instance.state.glyphAtlas.charMetrics) {
                            var asciiGrid = processImageDataToGrid(instance, imageData, values);
                            
                            // Store only essential data (no full image to save memory)
                            var timestamp = Date.now() + index; // Unique timestamp
                            instance.state.batchQueue.push({
                                asciiGrid: asciiGrid,
                                glyphAtlas: instance.state.glyphAtlas, // Reference, not copy
                                settings: {
                                    font: values.font,
                                    fontSize: values.fontSize,
                                    lineHeight: values.lineHeight,
                                    letterSpacing: values.letterSpacing,
                                    textColor: values.textColor,
                                    bgMode: values.bgMode
                                },
                                name: fileName,
                                timestamp: timestamp,
                                width: img.width,
                                height: img.height
                            });
                            processedCount++;
                        }
                    } catch (error) {
                        window.debugLog('TOOLS', `⚠️ Failed to process: ${file.name} - ${error.message}`);
                        failedCount++;
                    }
                    
                    // Process next image with minimal delay (use 0 for maximum speed)
                    setTimeout(function() {
                        processNextImage(index + 1);
                    }, 0);
                };
                img.onerror = function() {
                    window.debugLog('TOOLS', `⚠️ Failed to load: ${file.name}`);
                    failedCount++;
                    processNextImage(index + 1);
                };
                img.src = e.target.result;
            };
            reader.onerror = function() {
                window.debugLog('TOOLS', `⚠️ Failed to read: ${file.name}`);
                failedCount++;
                processNextImage(index + 1);
            };
            reader.readAsDataURL(file);
        }
        
        // Start processing
        processNextImage(0);
    }
    
    function processImageDataToGrid(instance, imageData, values) {
        // Optimized batch processing - returns only the ASCII grid
        var toneWeight = values.toneWeight || 0.4;
        var quadrantWeight = values.quadrantWeight || 0.2;
        var orientWeight = values.orientWeight || 0.3;
        var sigWeight = values.sigWeight || 0.1;
        var flowMode = values.flowMode || 'Gradient Perpendicular (Contour)';
        
        var tw = instance.state.glyphAtlas.charMetrics.width;
        var th = instance.state.glyphAtlas.charMetrics.height;
        var lineHeightPercent = values.lineHeight || 100;
        var letterSpacing = values.letterSpacing || 0;
        var lineHeight = (th * lineHeightPercent) / 100;
        
        var canvasWidth = imageData.width;
        var canvasHeight = imageData.height;
        
        var cols = Math.floor(canvasWidth / (tw + letterSpacing));
        var rows = Math.floor(canvasHeight / lineHeight);
        
        var outputWidth = cols * (tw + letterSpacing);
        var outputHeight = rows * lineHeight;
        
        var data = new Uint8ClampedArray(imageData.data);
        var pixelGroup = parsePixelGroup(values.pixelGroup || '1');
        var sampleData = (pixelGroup > 1)
            ? quantizeByPixelGroup(data, canvasWidth, canvasHeight, pixelGroup)
            : data;
        
        var asciiGrid = [];
        var shouldInvert = (values.textMode === 'Black on White');
        var weights = {
            tone: toneWeight,
            quadrant: quadrantWeight,
            orientation: orientWeight,
            signature: sigWeight
        };
        
        for (var row = 0; row < rows; row++) {
            var line = [];
            for (var col = 0; col < cols; col++) {
                var offsets = getLayoutOffsets(values, canvasWidth, canvasHeight, outputWidth, outputHeight, lineHeight, tw);
                var tileX = offsets.offsetX + col * (tw + letterSpacing);
                var tileY = offsets.offsetY + row * lineHeight;
                var tile = extractTileMetrics(sampleData, canvasWidth, Math.floor(tileX), Math.floor(tileY), Math.floor(tw), Math.floor(th), pixelGroup);
                if (shouldInvert) {
                    tile = invertTileMetrics(tile);
                }
                var bestChar = findBestMatch(tile, instance.state.glyphAtlas, weights, flowMode);
                line.push(bestChar);
            }
            asciiGrid.push(line);
        }
        
        return asciiGrid;
    }
    
    function processImageForBatch(instance, toolInstance, fileName) {
        // DEPRECATED: Replaced by processImageDataToGrid for better memory efficiency
        // Kept for backwards compatibility
        var imageData = instance.state.processedImageData;
        if (!imageData) return;
        
        var values = toolInstance.getValues();
        var asciiGrid = processImageDataToGrid(instance, imageData, values);
        
        var timestamp = Date.now();
        instance.state.batchQueue.push({
            asciiGrid: asciiGrid,
            glyphAtlas: instance.state.glyphAtlas,
            settings: {
                font: values.font,
                fontSize: values.fontSize,
                lineHeight: values.lineHeight,
                letterSpacing: values.letterSpacing,
                textColor: values.textColor,
                bgMode: values.bgMode
            },
            name: fileName || `ascii-art-${timestamp}`,
            timestamp: timestamp,
            width: imageData.width,
            height: imageData.height
        });
    }
    
    function addToBatch(instance, toolInstance) {
        if (!instance.state.sourceImage || !instance.state.asciiGrid) {
            window.debugLog('TOOLS', '⚠️ No ASCII result to add to batch');
            return;
        }
        
        var values = toolInstance.getValues();
        var timestamp = Date.now();
        var name = `ascii-art-${timestamp}`;
        
        instance.state.batchQueue.push({
            asciiGrid: JSON.parse(JSON.stringify(instance.state.asciiGrid)),
            glyphAtlas: instance.state.glyphAtlas, // Reference, not copy
            settings: {
                font: values.font,
                fontSize: values.fontSize,
                lineHeight: values.lineHeight,
                letterSpacing: values.letterSpacing,
                textColor: values.textColor,
                bgMode: values.bgMode
            },
            name: name,
            timestamp: timestamp,
            width: instance.state.sourceImage.width,
            height: instance.state.sourceImage.height
        });
        
        updateBatchStatus(instance, toolInstance);
        updateBatchProgress(instance, toolInstance, `Added: ${name}`);
        window.debugLog('TOOLS', `✅ Added to batch: ${name} (${instance.state.batchQueue.length} total)`);
    }
    
    function processBatch(instance, toolInstance) {
        if (instance.state.batchQueue.length === 0) {
            window.debugLog('TOOLS', '⚠️ Batch queue is empty');
            return;
        }
        
        window.debugLog('TOOLS', `🔄 Processing batch of ${instance.state.batchQueue.length} images...`);
        // Batch is already processed when added, just confirm
        window.debugLog('TOOLS', `✅ Batch ready for export`);
    }
    
    function exportBatch(instance, toolInstance) {
        if (instance.state.batchQueue.length === 0) {
            window.debugLog('TOOLS', '⚠️ Batch queue is empty');
            return;
        }
        
        var values = toolInstance.getValues();
        var format = values.exportFormat || 'HTML Colored';
        var timestamp = Date.now();
        
        window.debugLog('TOOLS', `📦 Exporting batch of ${instance.state.batchQueue.length} images as ${format}...`);
        
        // Export each item in batch
        for (var i = 0; i < instance.state.batchQueue.length; i++) {
            var item = instance.state.batchQueue[i];
            var tempGrid = instance.state.asciiGrid;
            var tempAtlas = instance.state.glyphAtlas;
            
            // Temporarily swap to batch item
            instance.state.asciiGrid = item.asciiGrid;
            instance.state.glyphAtlas = item.glyphAtlas;
            
            // Export with batch item name
            var itemName = item.name + '-' + (i + 1);
            
            switch (format) {
                case 'Plain Text':
                    exportPlainTextWithName(instance, itemName);
                    break;
                case 'HTML Colored':
                    exportHTMLWithName(instance, toolInstance, itemName);
                    break;
                case 'SVG (Vector)':
                    exportSVGWithName(instance, toolInstance, itemName);
                    break;
                default:
                    exportPlainTextWithName(instance, itemName);
            }
            
            // Restore
            instance.state.asciiGrid = tempGrid;
            instance.state.glyphAtlas = tempAtlas;
        }
        
        window.debugLog('TOOLS', `✅ Batch export complete: ${instance.state.batchQueue.length} files`);
    }
    
    function clearBatch(instance, toolInstance) {
        var count = instance.state.batchQueue.length;
        instance.state.batchQueue = [];
        updateBatchStatus(instance, toolInstance);
        updateBatchProgress(instance, toolInstance, `Cleared ${count} images`);
        window.debugLog('TOOLS', `🗑️ Batch cleared (${count} images removed)`);
    }
    
    function exportPlainTextWithName(instance, name) {
        var text = gridToPlainText(instance.state.asciiGrid);
        var blob = new Blob([text], { type: 'text/plain' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = name + '.txt';
        a.click();
        URL.revokeObjectURL(a.href);
    }
    
    function exportHTMLWithName(instance, toolInstance, name) {
        if (!instance.state.asciiGrid || !instance.state.glyphAtlas) return;
        
        var values = toolInstance.getValues();
        var font = instance.state.glyphAtlas.charMetrics.font;
        var fontSize = instance.state.glyphAtlas.charMetrics.fontSize;
        var lineHeightPercent = values.lineHeight || 100;
        var letterSpacing = values.letterSpacing || 0;
        var textMode = values.textMode || 'Black on White';
        var bgColor = textMode === 'Black on White' ? '#FFFFFF' : '#000000';
        var textColor = textMode === 'Black on White' ? '#000000' : '#FFFFFF';
        
        var html = '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<style>\n';
        html += 'body { background: ' + bgColor + '; margin: 0; padding: 20px; }\n';
        html += 'pre { font-family: "' + font + '", monospace; color: ' + textColor + '; font-size: ' + fontSize + 'px; ';
        html += 'line-height: ' + (lineHeightPercent / 100) + '; ';
        html += 'letter-spacing: ' + letterSpacing + 'px; ';
        html += 'white-space: pre; overflow-x: auto; margin: 0; }\n';
        html += '</style>\n</head>\n<body>\n<pre>';
        
        var text = gridToPlainText(instance.state.asciiGrid);
        html += text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        html += '</pre>\n</body>\n</html>';
        
        var blob = new Blob([html], { type: 'text/html' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = name + '.html';
        a.click();
        URL.revokeObjectURL(a.href);
    }
    
    function exportSVGWithName(instance, toolInstance, name) {
        if (!instance.state.asciiGrid || !instance.state.glyphAtlas) return;
        
        var values = toolInstance.getValues();
        var font = instance.state.glyphAtlas.charMetrics.font;
        var fontSize = instance.state.glyphAtlas.charMetrics.fontSize;
        var charWidth = instance.state.glyphAtlas.charMetrics.width;
        var charHeight = instance.state.glyphAtlas.charMetrics.height;
        var lineHeightPercent = values.lineHeight || 100;
        var letterSpacing = values.letterSpacing || 0;
        var lineHeight = (charHeight * lineHeightPercent) / 100;
        var textMode = values.textMode || 'Black on White';
        var bgColor = textMode === 'Black on White' ? '#FFFFFF' : '#000000';
        var textColor = textMode === 'Black on White' ? '#000000' : '#FFFFFF';
        
        var rows = instance.state.asciiGrid.length;
        var cols = instance.state.asciiGrid[0] ? instance.state.asciiGrid[0].length : 0;
        var outputWidth = Math.max(1, Math.round(cols * (charWidth + letterSpacing)));
        var outputHeight = Math.max(1, Math.round(rows * lineHeight));
        
        var svg = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            `<svg xmlns="http://www.w3.org/2000/svg" width="${outputWidth}" height="${outputHeight}" viewBox="0 0 ${outputWidth} ${outputHeight}">`
        ];
        
        if (bgColor !== 'transparent') {
            svg.push(`<rect width="100%" height="100%" fill="${bgColor}" />`);
        }
        
        svg.push(`<text font-family="${font}, monospace" font-size="${fontSize}" fill="${textColor}" letter-spacing="${letterSpacing}">`);
        for (var i = 0; i < rows; i++) {
            var line = '';
            for (var j = 0; j < instance.state.asciiGrid[i].length; j++) {
                var item = instance.state.asciiGrid[i][j];
                line += typeof item === 'string' ? item : item.char;
            }
            var y = Math.round((i + 1) * lineHeight);
            svg.push(`<tspan x="0" y="${y}">${escapeXML(line)}</tspan>`);
        }
        svg.push('</text>');
        svg.push('</svg>');
        
        var content = svg.join('\n');
        var blob = new Blob([content], { type: 'image/svg+xml' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = name + '.svg';
        a.click();
        URL.revokeObjectURL(a.href);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // EXPORT
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function copyToClipboard(instance, toolInstance) {
        if (!instance.state.asciiGrid || instance.state.asciiGrid.length === 0) {
            window.debugLog('TOOLS', 'No ASCII result to copy');
            return;
        }
        
        // Convert grid to plain text
        var text = gridToPlainText(instance.state.asciiGrid);
        
        navigator.clipboard.writeText(text).then(function() {
            window.debugLog('TOOLS', 'ASCII art copied to clipboard');
        }).catch(function(err) {
            console.error('Failed to copy to clipboard:', err);
        });
    }
    
    function gridToPlainText(grid) {
        var lines = [];
        for (var i = 0; i < grid.length; i++) {
            var line = '';
            for (var j = 0; j < grid[i].length; j++) {
                var item = grid[i][j];
                // Handle both string characters and {char, x, y} objects (proportional mode)
                line += typeof item === 'string' ? item : (item.char || '');
            }
            lines.push(line);
        }
        return lines.join('\n');
    }
    
    function exportFile(instance, toolInstance) {
        if (!instance.state.asciiGrid || instance.state.asciiGrid.length === 0) {
            window.debugLog('TOOLS', 'No ASCII result to export');
            return;
        }
        
        var values = toolInstance.getValues();
        var format = values.exportFormat || 'HTML Colored';
        
        switch (format) {
            case 'Plain Text':
                exportPlainText(instance);
                break;
            case 'HTML Colored':
                exportHTML(instance, toolInstance);
                break;
            case 'ANSI':
                exportANSI(instance);
                break;
            case 'SVG (Vector)':
                exportSVG(instance, toolInstance);
                break;
            case 'LaTeX':
                exportLatex(instance);
                break;
            case 'Image PNG':
                exportImage(toolInstance);
                break;
            default:
                exportPlainText(instance);
        }
    }
    
    function exportPlainText(instance) {
        var text = gridToPlainText(instance.state.asciiGrid);
        var blob = new Blob([text], { type: 'text/plain' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'ascii-art-' + Date.now() + '.txt';
        a.click();
        URL.revokeObjectURL(a.href);
        window.debugLog('TOOLS', 'ASCII art exported as plain text');
    }
    
    function exportHTML(instance, toolInstance) {
        if (!instance.state.asciiGrid || instance.state.asciiGrid.length === 0 || !instance.state.glyphAtlas || !instance.state.glyphAtlas.charMetrics) {
            window.debugLog('TOOLS', 'No ASCII result to export');
            return;
        }
        
        var values = toolInstance.getValues();
        var font = instance.state.glyphAtlas.charMetrics.font;
        var fontSize = instance.state.glyphAtlas.charMetrics.fontSize;
        var lineHeightPercent = values.lineHeight || 100;
        var letterSpacing = values.letterSpacing || 0;
        var textMode = values.textMode || 'Black on White';
        var bgColor = textMode === 'Black on White' ? '#FFFFFF' : '#000000';
        var textColor = textMode === 'Black on White' ? '#000000' : '#FFFFFF';
        
        var html = '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<style>\n';
        html += 'body { background: ' + bgColor + '; margin: 0; padding: 20px; }\n';
        html += 'pre { font-family: "' + font + '", monospace; color: ' + textColor + '; font-size: ' + fontSize + 'px; ';
        html += 'line-height: ' + (lineHeightPercent / 100) + '; ';
        html += 'letter-spacing: ' + letterSpacing + 'px; ';
        html += 'white-space: pre; overflow-x: auto; margin: 0; }\n';
        html += '</style>\n</head>\n<body>\n<pre>';
        
        var text = gridToPlainText(instance.state.asciiGrid);
        html += text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        html += '</pre>\n</body>\n</html>';
        
        var blob = new Blob([html], { type: 'text/html' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'ascii-art-' + Date.now() + '.html';
        a.click();
        URL.revokeObjectURL(a.href);
        window.debugLog('TOOLS', 'ASCII art exported as HTML');
    }
    
    function exportANSI(instance) {
        if (!instance.state.asciiGrid || instance.state.asciiGrid.length === 0) {
            window.debugLog('TOOLS', 'No ASCII result to export');
            return;
        }
        
        // For now, export as plain text (ANSI color codes would go here later)
        var text = gridToPlainText(instance.state.asciiGrid);
        var blob = new Blob([text], { type: 'text/plain' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'ascii-art-' + Date.now() + '.ans';
        a.click();
        URL.revokeObjectURL(a.href);
        window.debugLog('TOOLS', 'ASCII art exported as ANSI');
    }
    
    function exportSVG(instance, toolInstance) {
        if (!instance.state.asciiGrid || instance.state.asciiGrid.length === 0 || !instance.state.glyphAtlas || !instance.state.glyphAtlas.charMetrics) {
            window.debugLog('TOOLS', 'No ASCII result to export');
            return;
        }
        
        var values = toolInstance.getValues();
        var font = instance.state.glyphAtlas.charMetrics.font;
        var fontSize = instance.state.glyphAtlas.charMetrics.fontSize;
        var charWidth = instance.state.glyphAtlas.charMetrics.width;
        var charHeight = instance.state.glyphAtlas.charMetrics.height;
        var lineHeightPercent = values.lineHeight || 100;
        var letterSpacing = values.letterSpacing || 0;
        var lineHeight = (charHeight * lineHeightPercent) / 100;
        var textColor = values.textColor || '#FFFFFF';
        var bgMode = values.bgMode || 'Black';
        var bgColor = bgMode === 'White' ? '#FFFFFF' : bgMode === 'Transparent' ? 'transparent' : '#000000';
        var fontMode = values.fontMode || 'Monospace (Grid)';
        
        var rows = instance.state.asciiGrid.length;
        var cols = instance.state.asciiGrid[0] ? instance.state.asciiGrid[0].length : 0;
        var outputWidth = Math.max(1, Math.round(cols * (charWidth + letterSpacing)));
        var outputHeight = Math.max(1, Math.round(rows * lineHeight));
        
        var svg = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            `<svg xmlns="http://www.w3.org/2000/svg" width="${outputWidth}" height="${outputHeight}" viewBox="0 0 ${outputWidth} ${outputHeight}">`
        ];
        
        if (bgColor !== 'transparent') {
            svg.push(`<rect width="100%" height="100%" fill="${bgColor}" />`);
        }
        
        if (fontMode === 'Proportional (Sequential)') {
            svg.push(`<g font-family="${font}, monospace" font-size="${fontSize}" fill="${textColor}">`);
            for (var row = 0; row < rows; row++) {
                for (var col = 0; col < instance.state.asciiGrid[row].length; col++) {
                    var item = instance.state.asciiGrid[row][col];
                    var x = Math.round(item.x);
                    var y = Math.round(item.y + charHeight);
                    svg.push(`<text x="${x}" y="${y}">${escapeXML(item.char)}</text>`);
                }
            }
            svg.push('</g>');
        } else {
            svg.push(`<text font-family="${font}, monospace" font-size="${fontSize}" fill="${textColor}" letter-spacing="${letterSpacing}">`);
            for (var i = 0; i < rows; i++) {
                var line = instance.state.asciiGrid[i].join('');
                var y = Math.round((i + 1) * lineHeight);
                svg.push(`<tspan x="0" y="${y}">${escapeXML(line)}</tspan>`);
            }
            svg.push('</text>');
        }
        
        svg.push('</svg>');
        
        var content = svg.join('\n');
        var blob = new Blob([content], { type: 'image/svg+xml' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'ascii-art-' + Date.now() + '.svg';
        a.click();
        URL.revokeObjectURL(a.href);
        window.debugLog('TOOLS', 'ASCII art exported as SVG');
    }
    
    function exportLatex(instance) {
        if (!instance.state.asciiGrid || instance.state.asciiGrid.length === 0) {
            window.debugLog('TOOLS', 'No ASCII result to export');
            return;
        }
        
        var text = gridToPlainText(instance.state.asciiGrid);
        var content = [
            '\\\\documentclass{article}',
            '\\\\usepackage[utf8]{inputenc}',
            '\\\\usepackage{listings}',
            '\\\\begin{document}',
            '\\\\begin{lstlisting}[basicstyle=\\\\ttfamily\\\\small]',
            text,
            '\\\\end{lstlisting}',
            '\\\\end{document}'
        ].join('\\n');
        
        var blob = new Blob([content], { type: 'application/x-latex' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'ascii-art-' + Date.now() + '.tex';
        a.click();
        URL.revokeObjectURL(a.href);
        window.debugLog('TOOLS', 'ASCII art exported as LaTeX');
    }
    
    function escapeXML(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
    
    function exportImage(toolInstance) {
        if (!asciiGrid || asciiGrid.length === 0) {
            window.debugLog('TOOLS', 'No ASCII result to export');
            return;
        }
        
        // Get the canvas and export it
        var canvas = toolInstance.canvas;
        if (canvas) {
            canvas.toBlob(function(blob) {
                var a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'ascii-art-' + Date.now() + '.png';
                a.click();
                URL.revokeObjectURL(a.href);
                window.debugLog('TOOLS', 'ASCII art exported as PNG image');
            });
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function applyDisplayMode(toolInstance, mode) {
        if (!toolInstance || !toolInstance.setCanvasDisplayMode) return;
        
        var mappedMode = 'auto';
        switch (mode) {
            case 'Fit':
                mappedMode = 'fit';
                break;
            case 'Fill':
                mappedMode = 'fill';
                break;
            case 'Actual':
                mappedMode = 'actual';
                break;
            default:
                mappedMode = 'auto';
                break;
        }
        
        toolInstance.setCanvasDisplayMode(mappedMode);
        window.debugLog('TOOLS', `Display mode set to: ${mode}`);
    }
    
    function setCanvasSize(instance, toolInstance, width, height, options) {
        var opts = options || {};
        var snapToGrid = !!opts.snapToGrid;
        
        width = Math.round(width);
        height = Math.round(height);
        
        if (snapToGrid) {
        // Snap to 14px grid
        width = Math.floor(width / 14) * 14;
        height = Math.floor(height / 14) * 14;
        }
        
        window.debugLog('TOOLS', `Setting canvas to ${width}×${height}px`);
        
        // Update canvas
        if (toolInstance.canvasComponent && toolInstance.canvasComponent.resize) {
            toolInstance.canvasComponent.resize(width, height, { resetTransform: true });
            toolInstance.canvas = toolInstance.canvasComponent.canvasEl;
            toolInstance.ctx = toolInstance.canvasComponent.ctx;
        } else if (toolInstance.canvas) {
            toolInstance.canvas.width = width;
            toolInstance.canvas.height = height;
        }
        
        // Reapply display mode
        var displayMode = toolInstance.values.displayMode || 'Actual';
        applyDisplayMode(toolInstance, displayMode);
        
        // Update sliders and displays
        var widthSlider = toolInstance.getComponent('canvasWidth');
        var heightSlider = toolInstance.getComponent('canvasHeight');
        
        toolInstance.values.canvasWidth = Math.round(width);
        toolInstance.values.canvasHeight = Math.round(height);
        
        if (widthSlider) {
            if (widthSlider.setValue) {
                widthSlider.setValue(width, false);
            } else {
            if (widthSlider.sliderEl) widthSlider.sliderEl.value = width;
            if (widthSlider.fieldEl) widthSlider.fieldEl.value = width;
            if (widthSlider.valueDisplay) widthSlider.valueDisplay.textContent = width + (widthSlider.unit || '');
            }
        }
        
        if (heightSlider) {
            if (heightSlider.setValue) {
                heightSlider.setValue(height, false);
            } else {
            if (heightSlider.sliderEl) heightSlider.sliderEl.value = height;
            if (heightSlider.fieldEl) heightSlider.fieldEl.value = height;
            if (heightSlider.valueDisplay) heightSlider.valueDisplay.textContent = height + (heightSlider.unit || '');
            }
        }
        
        // Reprocess if image loaded
        if (instance.state.sourceImage) {
            processImage(instance, toolInstance);
        } else {
            toolInstance.draw();
        }
    }
    
    function applyCanvasFromImage(instance, toolInstance, values) {
        if (!instance.state.sourceImage) return;
        
        var scale = parseCanvasScale(values.canvasScale || '1×');
        instance.state.lastCanvasScale = scale;
        var width = Math.max(1, Math.round(instance.state.sourceImage.width * scale));
        var height = Math.max(1, Math.round(instance.state.sourceImage.height * scale));
        
        setCanvasSize(instance, toolInstance, width, height);
    }
    
    function applyOutputTargetConstraints(instance, toolInstance, target) {
        var values = toolInstance.getValues();
        var font = values.font || 'Atkinson Hyperlegible';
        var fontSize = values.fontSize || 12;
        var metrics = measureCharacterMetrics(font, fontSize);
        var charWidth = metrics.width;
        var charHeight = metrics.height;
        
        var fontFilterComponent = toolInstance.getComponent('fontFilter');
        
        switch (target) {
            case 'Terminal (80×24)': {
                toolInstance.values.fontFilter = ['Monospace Only'];
                if (fontFilterComponent && fontFilterComponent.setValue) {
                    fontFilterComponent.setValue(['Monospace Only']);
                }
                updateFontDropdown(instance, toolInstance, toolInstance.values);
                forceFontMode(instance, toolInstance, 'Monospace (Grid)');
                setCanvasSize(instance, toolInstance, 80 * charWidth, 24 * charHeight);
                break;
            }
            case 'Terminal (120×40)': {
                toolInstance.values.fontFilter = ['Monospace Only'];
                if (fontFilterComponent && fontFilterComponent.setValue) {
                    fontFilterComponent.setValue(['Monospace Only']);
                }
                updateFontDropdown(instance, toolInstance, toolInstance.values);
                forceFontMode(instance, toolInstance, 'Monospace (Grid)');
                setCanvasSize(instance, toolInstance, 120 * charWidth, 40 * charHeight);
                break;
            }
            case 'Print (A4 Portrait)': {
                applyCanvasAspectRatio(instance, toolInstance, 595 / 842);
                break;
            }
            case 'Print (A4 Landscape)': {
                applyCanvasAspectRatio(instance, toolInstance, 842 / 595);
                break;
            }
            case 'Document (Monospace)': {
                toolInstance.values.fontFilter = ['Monospace Only'];
                if (fontFilterComponent && fontFilterComponent.setValue) {
                    fontFilterComponent.setValue(['Monospace Only']);
                }
                updateFontDropdown(instance, toolInstance, toolInstance.values);
                forceFontMode(instance, toolInstance, 'Monospace (Grid)');
                setCanvasSize(instance, toolInstance, 80 * charWidth, toolInstance.values.canvasHeight || 420);
                break;
            }
            case 'Document (Non-monospace)': {
                toolInstance.values.fontFilter = [];
                if (fontFilterComponent && fontFilterComponent.setValue) {
                    fontFilterComponent.setValue([]);
                }
                updateFontDropdown(instance, toolInstance, toolInstance.values);
                forceFontMode(instance, toolInstance, 'Proportional (Sequential)');
                setCanvasSize(instance, toolInstance, toolInstance.values.canvasWidth || 420, toolInstance.values.canvasHeight || 420);
                break;
            }
            case 'Web Page': {
                setCanvasSize(instance, toolInstance, 600, toolInstance.values.canvasHeight || 420);
                break;
            }
            case 'Terminal (Custom)':
            case 'Generic':
            default:
                toolInstance.values.imageFit = 'Canvas from Image';
                var imageFitComponent = toolInstance.getComponent('imageFit');
                if (imageFitComponent && imageFitComponent.setValue) {
                    imageFitComponent.setValue('Canvas from Image');
                }
                break;
        }
    }
    
    function parsePixelGroup(value) {
        var parsed = parseInt(value, 10);
        if (isNaN(parsed) || parsed < 1) return 1;
        return Math.min(5, parsed);
    }

    function parseCanvasScale(value) {
        switch (value) {
            case '¼×':
                return 0.25;
            case '½×':
                return 0.5;
            case '2×':
                return 2;
            case '4×':
                return 4;
            case '1×':
            default:
                return 1;
        }
    }

    function applyCanvasScale(instance, toolInstance, values) {
        var nextScale = parseCanvasScale(values.canvasScale || '1×');
        var currentWidth = values.canvasWidth || (toolInstance.canvas ? toolInstance.canvas.width : 420);
        var currentHeight = values.canvasHeight || (toolInstance.canvas ? toolInstance.canvas.height : 420);
        var baseWidth = currentWidth / (instance.state.lastCanvasScale || 1);
        var baseHeight = currentHeight / (instance.state.lastCanvasScale || 1);
        
        instance.state.lastCanvasScale = nextScale;
        setCanvasSize(instance, toolInstance, baseWidth * nextScale, baseHeight * nextScale);
    }
    
    function applyFontModeFromFont(instance, toolInstance, fontName) {
        if (!fontName) return;
        var mode = isMonospaceFont(fontName) ? 'Monospace (Grid)' : 'Proportional (Sequential)';
        forceFontMode(instance, toolInstance, mode);
    }
    
    function forceFontMode(instance, toolInstance, mode) {
        toolInstance.values.fontMode = mode;
        var fontModeComponent = toolInstance.getComponent('fontMode');
        if (fontModeComponent && fontModeComponent.setValue) {
            fontModeComponent.setValue(mode);
        }
    }
    
    function invertTileMetrics(tile) {
        return {
            density: 1 - tile.density,
            quadrants: tile.quadrants ? tile.quadrants.map(function(q) { return 1 - q; }) : tile.quadrants,
            orientation: tile.orientation,
            signature: tile.signature
        };
    }
    
    function applyCanvasAspectRatio(instance, toolInstance, aspect) {
        var width = toolInstance.values.canvasWidth || (toolInstance.canvas ? toolInstance.canvas.width : 420);
        var height = toolInstance.values.canvasHeight || (toolInstance.canvas ? toolInstance.canvas.height : 420);
        var area = Math.max(1, width * height);
        
        var newWidth = Math.sqrt(area * aspect);
        var newHeight = area / newWidth;
        
        setCanvasSize(instance, toolInstance, newWidth, newHeight);
    }
    
    
    function updateFontDropdown(instance, tool, values) {
        // Get font component
        var fontComponent = tool.getComponent('font');
        if (!fontComponent) return;
        
        // Get available fonts based on filter
        var showMonospaceOnly = (values.fontFilter || []).indexOf('Monospace Only') >= 0;
        var fonts = getAvailableFonts(instance);
        
        if (showMonospaceOnly) {
            fonts = getMonospaceFonts(fonts);
            window.debugLog('TOOLS', `Filtered to ${fonts.length} monospace fonts`);
        } else {
            window.debugLog('TOOLS', `Showing all ${fonts.length} fonts`);
        }
        
        // Update dropdown options via component API
        if (fontComponent.setOptions) {
            fontComponent.setOptions(fonts);
            var nextFont = values.font;
            if (!nextFont || fonts.indexOf(nextFont) < 0) {
                nextFont = fonts[0] || '';
            }
            if (nextFont) {
                fontComponent.setValue(nextFont);
                tool.values.font = nextFont;
            }
            window.debugLog('TOOLS', `Font dropdown updated with ${fonts.length} fonts`);
        }
    }
    
    function loadGoogleFontHandler(instance, toolInstance) {
        var values = toolInstance.getValues();
        var fontName = values.googleFontName;
        
        if (!fontName || fontName.trim() === '') {
            console.error('Please enter a Google Font name');
            return;
        }
        
        loadGoogleFont(fontName)
            .then(function(loadedFont) {
                // Font loaded successfully - track it
                instance.state.loadedCustomFonts.push(loadedFont);
                
                window.debugLog('TOOLS', `Google Font "${loadedFont}" loaded successfully`);
                
                // Update dropdown
                updateFontDropdown(instance, toolInstance, values);
                
                // Select the newly loaded font
                var fontComponent = toolInstance.getComponent('font');
                if (fontComponent && fontComponent.setValue) {
                    fontComponent.setValue(loadedFont);
                }
                
                // Clear input
                var nameInput = toolInstance.getComponent('googleFontName');
                if (nameInput && nameInput.element) {
                    nameInput.element.value = '';
                }
            })
            .catch(function(err) {
                console.error('Failed to load Google Font:', err.message);
            });
    }
    
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
        
        // Instance state - replaces module-level variables
        this.state = {
            sourceImage: null,
            asciiGrid: null,
            glyphAtlas: null,
            processedImageData: null,
            processedImageBitmap: null,
            processedPreviewData: null,
            edgeDetectionData: null,
            lastCanvasScale: 1,
            isPreparingBitmap: false,
            systemFonts: [],
            loadedCustomFonts: [],
            atlasLocked: false,
            atlasConfig: null,
            isRevertingAtlas: false,
            rebuildArmed: false,
            atlasWarning: false,
            batchQueue: [] // Array of {sourceImage, asciiGrid, settings, name}
        };
        
        this.render();
    }
    
    render() {
        try {
            const config = createToolConfig(this);
            this.tool = new ToolBase(config, this.deps);
            this.tool.mount(this.container);
            this.tool.draw();
            
            window.debugLog('TOOLS', '✅ AsciiArtGeneratorTool rendered');
        } catch (error) {
            console.error('❌ AsciiArtGeneratorTool error:', error);
            this.container.innerHTML = 
                '<div style="padding: 20px; color: var(--c-text);">' +
                '<h2>ASCII ART GENERATOR ERROR</h2>' +
                '<p style="color: var(--vga-red);">' + error.message + '</p>' +
                '</div>';
        }
    };
    
    destroy() {
        // Clear instance state
        this.state.sourceImage = null;
        this.state.asciiGrid = null;
        this.state.glyphAtlas = null;
        this.state.processedImageData = null;
        this.state.processedImageBitmap = null;
        this.state.processedPreviewData = null;
        this.state.edgeDetectionData = null;
        this.state.systemFonts = [];
        this.state.loadedCustomFonts = [];
        this.state.atlasConfig = null;
        this.state.batchQueue = [];
        this.state = null;
        
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
        
        window.debugLog('TOOLS', 'AsciiArtGeneratorTool destroyed');
    }
}

// Export as default for tools_section.js
export default AsciiArtGeneratorTool;

window.debugLog('INIT', '✅ AsciiArtGeneratorTool loaded (ES Module)');
