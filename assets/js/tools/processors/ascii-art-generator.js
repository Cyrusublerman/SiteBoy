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
// MODULE-LEVEL STATE
// ═══════════════════════════════════════════════════════════════════════════════

let sourceImage = null;
let asciiGrid = null; // Now stores structured data with colors
let glyphAtlas = null;
let processedImageData = null;
let processedImageBitmap = null;
let processedPreviewData = null;
let lastCanvasScale = 1;
let isPreparingBitmap = false;
let systemFonts = []; // Detected system fonts
let loadedCustomFonts = []; // Google Fonts or uploaded fonts
let atlasLocked = false;
let atlasConfig = null;
let isRevertingAtlas = false;
let rebuildArmed = false;
let atlasWarning = false;

/**
 * Get combined font list (system + loaded custom)
 */
function getAvailableFonts() {
    const combined = [...systemFonts, ...loadedCustomFonts];
    return [...new Set(combined)].sort(); // Deduplicate and sort
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

    export const TOOL_CONFIG = {
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
                    ['toggle', 'Split View', ['Split View'], { key: 'showSplitView', selectedValues: [] }],
                    ['slider', 'Divider %', 0, 100, 1, { value: 50, key: 'splitPosition', withNumber: true }],
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
                ['Layout Mode', [
                    ['radio', 'Mode', ['Monospace (Grid)', 'Proportional (Sequential)'], { key: 'fontMode', selectedValue: 'Monospace (Grid)' }],
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
                    ['slider', 'Tone α', 0, 1, 0.01, { value: 0.4, key: 'toneWeight', withNumber: true }],
                    ['slider', 'Quadrant β', 0, 1, 0.01, { value: 0.2, key: 'quadrantWeight', withNumber: true }],
                    ['slider', 'Orientation γ', 0, 1, 0.01, { value: 0.3, key: 'orientWeight', withNumber: true }],
                    ['dropdown', 'Flow Mode', [
                        'Gradient Perpendicular (Contour)',
                        'Gradient Parallel (Extrusion)',
                        'Character Stroke (Edges)',
                        'Ignore'
                    ], { key: 'flowMode', value: 'Gradient Perpendicular (Contour)' }],
                    ['slider', 'Signature δ', 0, 1, 0.01, { value: 0.1, key: 'sigWeight', withNumber: true }],
                    ['toggle', 'Mapping', ['Invert Mapping'], { key: 'invertMapping', selectedValues: [] }],
                ]],
            ]],
            
            // ═══════════════════════════════════════════════════════════════════
            // TAB 4: DISPLAY — Visual output & export (doesn't affect conversion)
            // ═══════════════════════════════════════════════════════════════════
            ['DISPLAY', [
                ['View', [
                    ['radio', 'Display Mode', ['Fit', 'Fill', 'Actual'], { key: 'displayMode', selectedValue: 'Actual' }],
                    ['color', 'Text Color', '#FFFFFF', { key: 'textColor' }],
                    ['dropdown', 'Background', ['Black', 'White', 'Transparent'], { key: 'bgMode', value: 'Black' }],
                    ['toggle', 'Show Grid', ['Grid'], { key: 'showGrid', selectedValues: [] }],
                ]],
                ['Export', [
                    ['dropdown', 'Format', ['Plain Text', 'HTML Colored', 'ANSI', 'SVG (Vector)', 'LaTeX', 'Image PNG'], { key: 'exportFormat', value: 'HTML Colored' }],
                    ['button', 'Copy Text', null, { key: 'copyText' }],
                    ['button', 'Export File', null, { key: 'exportFile' }],
                ]],
            ]],
        ],
        
        canvas: { 
            size: 420,
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
                    processedImageData = adjustedImage;
                    prepareProcessedBitmap(adjustedImage, self);
                    
                    // Regenerate ASCII if atlas ready
                    if (glyphAtlas && glyphAtlas.charMetrics) {
                        processImage(self);
                    } else {
                        self.draw(); // Just show adjusted image
                    }
                };
                
                // Wire onTransform callback
                adjustmentBundle.options.onTransform = function(transformedImage, transform) {
                    window.debugLog('TOOLS', '🔄 ASCII Art: Transform applied -', transform.type);
                    
                    processedImageData = transformedImage;
                    prepareProcessedBitmap(transformedImage, self);
                    
                    // Create temporary canvas to convert ImageData back to Image
                    var tempCanvas = document.createElement('canvas');
                    tempCanvas.width = transformedImage.width;
                    tempCanvas.height = transformedImage.height;
                    var tempCtx = tempCanvas.getContext('2d');
                    tempCtx.putImageData(transformedImage, 0, 0);
                    
                    var newImage = new Image();
                    newImage.onload = function() {
                        sourceImage = newImage;
                        
                        // Update canvas dimensions if resized
                        if (transform.type === 'resize' && self.canvas) {
                            self.canvas.width = transformedImage.width;
                            self.canvas.height = transformedImage.height;
                        }
                        
                        // Reprocess with new dimensions
                        if (glyphAtlas && glyphAtlas.charMetrics) {
                            processImage(self);
                        }
                    };
                    newImage.src = tempCanvas.toDataURL();
                };
            }
            
            // Detect system fonts
            systemFonts = await detectSystemFonts();
            
            // Update font dropdown with detected fonts
            updateFontDropdown(this, values);
            
            wireButton(this, 'copyText', function() { copyToClipboard(self); });
            wireButton(this, 'exportFile', function() { exportFile(self); });
            wireButton(this, 'process', function() { processImage(self); });
            wireButton(this, 'loadGoogleFont', function() { loadGoogleFontHandler(self); });
            wireButton(this, 'buildAtlas', function() { handleBuildAtlas(self); });
            wireButton(this, 'setA4Portrait', function() { applyCanvasAspectRatio(self, 595 / 842); });
            wireButton(this, 'setA4Landscape', function() { applyCanvasAspectRatio(self, 842 / 595); });
            
            // Apply initial display mode (Actual)
            applyDisplayMode(this, values.displayMode || 'Actual');
            updateAtlasStatusLabel(this);
        },
        
        onUpdate: function(key, value, allValues) {
            var self = this;
            
            window.debugLog('TOOLS', `onUpdate triggered: key="${key}", value type=${typeof value}, has value=${!!value}`);
            
            if (isRevertingAtlas) {
                return;
            }
            
            // Canvas resize - resize AND rebuild/reprocess if image loaded
            if (key === 'canvasWidth' || key === 'canvasHeight') {
                // Update canvas dimensions directly
                if (this.canvas) {
                    this.canvas.width = allValues.canvasWidth || 420;
                    this.canvas.height = allValues.canvasHeight || 420;
                    
                    // Reapply display mode after resize
                    applyDisplayMode(this, allValues.displayMode || 'Actual');
                }
                // Reprocess with new canvas size
                if (sourceImage) {
                    triggerAutoRebuild(self, true);
                    processImage(self);
                }
                return;
            }
            
            // Display mode - apply styling to canvas
            if (key === 'displayMode') {
                applyDisplayMode(self, allValues.displayMode || 'Fit');
                return;
            }
            
            // Font filter changed - update dropdown
            if (key === 'fontFilter') {
                updateFontDropdown(this, allValues);
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
                loadImage(value, self);
                return; // loadImage calls processImage internally
            }
            
            // Output target mode
            if (key === 'outputTarget') {
                applyOutputTargetConstraints(self, value);
                triggerAutoRebuild(self, true);
                if (sourceImage) {
                    processImage(self);
                } else {
                    self.draw();
                }
                return;
            }
            
            // Typography changes - always rebuild
            if (key === 'font' || key === 'fontSize' || key === 'charSet' || key === 'lineHeight' || key === 'letterSpacing') {
                if (key === 'font') {
                    applyFontModeFromFont(self, value);
                }
                triggerAutoRebuild(self, true);
                if (sourceImage) {
                    processImage(self);
                } else {
                    self.draw();
                }
                return;
            }
            
            // Matching weights - reprocess image
            if (key === 'toneWeight' || key === 'quadrantWeight' || 
                key === 'orientWeight' || key === 'sigWeight' || key === 'flowMode') {
                if (sourceImage) {
                    window.debugLog('TOOLS', 'Reprocessing image after weight change...');
                    processImage(self);
                }
                return;
            }
            
            // Image adjustments - reprocess image
            if (key === 'gamma' || key === 'contrast' || key === 'saturation' || key === 'brightness') {
                if (sourceImage) {
                    processImage(self);
                }
                return;
            }
            
            // Image fit mode / canvas scale - update canvas and rebuild
            if (key === 'imageFit' || key === 'canvasScale') {
                if (allValues.imageFit === 'Canvas from Image') {
                    applyCanvasFromImage(self, allValues);
                    triggerAutoRebuild(self, true);
                    if (sourceImage) {
                        processImage(self);
                    }
                    return;
                }
                if (key === 'canvasScale') {
                    applyCanvasScale(self, allValues);
                    triggerAutoRebuild(self, true);
                    if (sourceImage) {
                        processImage(self);
                    }
                    return;
                }
                if (sourceImage) {
                    triggerAutoRebuild(self, true);
                    processImage(self);
                }
                return;
            }
            
            // Processing options - rebuild + reprocess
            if (key === 'processOptions' || key === 'edgeMode' || key === 'edgeStrength' || key === 'pixelGroup') {
                if (sourceImage) {
                    triggerAutoRebuild(self, true);
                    processImage(self);
                }
                return;
            }
            
            // Density and layout controls - rebuild + reprocess
            if (key === 'lineHeight' || key === 'letterSpacing' || key === 'marginX' || key === 'marginY' || key === 'offsetX' || key === 'offsetY') {
                triggerAutoRebuild(self, true);
                if (sourceImage) {
                    processImage(self);
                } else {
                    self.draw();
                }
                return;
            }
            
            if (key === 'fontMode') {
                triggerAutoRebuild(self, true);
                if (sourceImage) {
                    processImage(self);
                } else {
                    self.draw();
                }
                return;
            }
            
            // Display settings - just redraw
            if (key === 'bgMode' || key === 'showGrid' || key === 'textColor') {
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
            
            // Get background mode
            var bgMode = values.bgMode || 'Black';
            var bgColor = bgMode === 'White' ? '#FFFFFF' : bgMode === 'Transparent' ? 'transparent' : '#000000';
            
            // Clear
            if (bgMode !== 'Transparent') {
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, w, h);
            } else {
                ctx.clearRect(0, 0, w, h);
            }
            
            var showSplit = (values.showSplitView || []).indexOf('Split View') >= 0;
            var splitPosition = Math.max(0, Math.min(100, values.splitPosition || 50)) / 100;
            var dividerX = Math.floor(w * splitPosition);
            
            if (showSplit && (processedPreviewData || processedImageData)) {
                // Left: adjusted image
                ctx.save();
                ctx.beginPath();
                ctx.rect(0, 0, dividerX, h);
                ctx.clip();
                drawAdjustedImage(ctx, w, h, values);
                ctx.restore();
                
                // Right: ASCII output
                ctx.save();
                ctx.beginPath();
                ctx.rect(dividerX, 0, w - dividerX, h);
                ctx.clip();
            if (asciiGrid && asciiGrid.length > 0) {
                    drawAscii(ctx, w, h, values);
                }
                ctx.restore();
                
                // Divider
                ctx.strokeStyle = '#00FF00';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(dividerX, 0);
                ctx.lineTo(dividerX, h);
                ctx.stroke();
            } else if (asciiGrid && asciiGrid.length > 0) {
                drawAscii(ctx, w, h, values);
            } else {
                // Placeholder
                var textColor = values.textColor || '#FFFFFF';
                ctx.fillStyle = textColor;
                ctx.font = '14px "Atkinson Hyperlegible", monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('Upload an image to convert', w / 2, h / 2);
            }
        },
    };

// ═══════════════════════════════════════════════════════════════════════════════
// GLYPH ATLAS
// ═══════════════════════════════════════════════════════════════════════════════
    
    function updateAtlasStatusLabel(toolInstance) {
        var label = toolInstance.getComponent('atlasStatus');
        if (label && label.setContent) {
            if (!atlasLocked) {
                label.setContent('Atlas not built');
                return;
            }
            
            if (rebuildArmed) {
                label.setContent('Atlas locked - click Rebuild again to confirm');
                return;
            }
            
            if (atlasWarning) {
                label.setContent('Atlas locked - rebuild to apply changes');
                return;
            }
            
            label.setContent('Atlas locked');
        }
    }
    
    function updateAtlasButton(toolInstance) {
        var button = toolInstance.getComponent('buildAtlas');
        if (button && button.setText) {
            if (!atlasLocked) {
                button.setText('Build Atlas');
                return;
            }
            
            button.setText(rebuildArmed ? 'Confirm Rebuild' : 'Rebuild Atlas');
        }
    }
    
    function restoreAtlasConfig(toolInstance) {
        if (!atlasConfig) return;
        
        isRevertingAtlas = true;
        toolInstance.values.font = atlasConfig.font;
        toolInstance.values.fontSize = atlasConfig.fontSize;
        toolInstance.values.lineHeight = atlasConfig.lineHeight;
        toolInstance.values.letterSpacing = atlasConfig.letterSpacing;
        toolInstance.values.charSet = atlasConfig.charSet;
        toolInstance.values.pixelGroup = atlasConfig.pixelGroup;
        
        var fontComponent = toolInstance.getComponent('font');
        var fontSizeComponent = toolInstance.getComponent('fontSize');
        var lineHeightComponent = toolInstance.getComponent('lineHeight');
        var letterSpacingComponent = toolInstance.getComponent('letterSpacing');
        var charSetComponent = toolInstance.getComponent('charSet');
        var resolutionComponent = toolInstance.getComponent('pixelGroup');
        
        if (fontComponent && fontComponent.setValue) fontComponent.setValue(atlasConfig.font);
        if (fontSizeComponent && fontSizeComponent.setValue) fontSizeComponent.setValue(atlasConfig.fontSize, false);
        if (lineHeightComponent && lineHeightComponent.setValue) lineHeightComponent.setValue(atlasConfig.lineHeight, false);
        if (letterSpacingComponent && letterSpacingComponent.setValue) letterSpacingComponent.setValue(atlasConfig.letterSpacing, false);
        if (charSetComponent && charSetComponent.setValue) charSetComponent.setValue(atlasConfig.charSet);
        if (resolutionComponent && resolutionComponent.setValue) resolutionComponent.setValue(atlasConfig.pixelGroup);
        
        isRevertingAtlas = false;
    }
    
    function handleBuildAtlas(toolInstance, skipProcess, forceRebuild) {
        var values = toolInstance.getValues();
        
        if (atlasLocked && !rebuildArmed && !forceRebuild) {
            rebuildArmed = true;
            atlasWarning = false;
            updateAtlasButton(toolInstance);
            updateAtlasStatusLabel(toolInstance);
            window.debugLog('TOOLS', 'Atlas rebuild armed. Click Rebuild again to confirm.');
            return;
        }
        
        rebuildArmed = false;
        
        buildGlyphAtlas(values);
        atlasLocked = true;
        atlasWarning = false;
        atlasConfig = {
            font: values.font,
            fontSize: values.fontSize,
            lineHeight: values.lineHeight,
            letterSpacing: values.letterSpacing,
            charSet: values.charSet,
            pixelGroup: values.pixelGroup
        };
        
        updateAtlasButton(toolInstance);
        updateAtlasStatusLabel(toolInstance);
        
        if (sourceImage && !skipProcess) {
            processImage(toolInstance);
        }
    }

    function triggerAutoRebuild(toolInstance, skipProcess) {
        handleBuildAtlas(toolInstance, skipProcess, true);
    }
    
    function buildGlyphAtlas(values) {
        var charSet = CHAR_SETS[values.charSet] || CHAR_SETS['Extended'];
        var font = values.font || 'Atkinson Hyperlegible';
        var fontSize = values.fontSize || 12;
        var resolution = parsePixelGroup(values.pixelGroup || '1');
        
        // Measure exact character dimensions
        var metrics = measureCharacterMetrics(font, fontSize);
        var tw = metrics.width;
        var th = metrics.height;
        
        glyphAtlas = [];
        
        // Store metrics for use in processing
        glyphAtlas.charMetrics = {
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
        
        glyphAtlas.widthMap = {};
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
            glyphAtlas.widthMap[char] = charWidth;
            totalWidth += charWidth;
            
            // Get image data and extract metrics using glyph width
            var imageData = ctx.getImageData(0, 0, tw, th);
        var metricsData = extractTileMetrics(imageData.data, tw, 0, 0, Math.min(charWidth, tw), th, resolution);
            
            var density = metricsData.density;
            var quadrants = metricsData.quadrants;
            var orientation = metricsData.orientation;
            var signature = metricsData.signature;
            
            glyphAtlas.push({
                char: char,
                width: charWidth,
                density: density,
                quadrants: quadrants,
                orientation: orientation,
                signature: signature
            });
        }
        
        glyphAtlas.averageWidth = totalWidth / Math.max(1, charSet.length);
        
        window.debugLog('TOOLS', `Glyph atlas built: ${glyphAtlas.length} characters at ${tw}×${th}px`);
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
    
    function prepareProcessedBitmap(imageData, toolInstance) {
        if (!imageData) return;
        if (typeof createImageBitmap !== 'function') {
            processedImageBitmap = null;
            return;
        }
        
        if (isPreparingBitmap) return;
        isPreparingBitmap = true;
        
        createImageBitmap(imageData)
            .then(function(bitmap) {
                processedImageBitmap = bitmap;
                isPreparingBitmap = false;
                
                if (toolInstance) {
                    toolInstance.draw();
                }
            })
            .catch(function(error) {
                isPreparingBitmap = false;
                console.error('Failed to create image bitmap', error);
            });
    }
    
    function loadImage(file, toolInstance) {
        window.debugLog('TOOLS', `loadImage called with file: ${file ? file.name : 'null'}`);
        
        var reader = new FileReader();
        reader.onload = function(e) {
            window.debugLog('TOOLS', 'FileReader loaded successfully');
            var img = new Image();
            img.onload = function() {
                sourceImage = img;
                toolInstance.values.sourceImageWidth = img.width;
                toolInstance.values.sourceImageHeight = img.height;
                window.debugLog('TOOLS', `Image loaded: ${img.width}×${img.height}px`);
                processedImageData = null;
                processedImageBitmap = null;
                isPreparingBitmap = false;
                
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
                triggerAutoRebuild(toolInstance, true);
                
                if (skipProcess) {
                    applyCanvasFromImage(toolInstance, values);
                } else {
                    setCanvasSize(toolInstance, img.width, img.height);
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
    
    function processImage(toolInstance) {
        if (!sourceImage) {
            window.debugLog('TOOLS', '⚠️ Cannot process: no source image');
            return;
        }
        
        if (!glyphAtlas || !glyphAtlas.charMetrics) {
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
        var tw = glyphAtlas.charMetrics.width;
        var th = glyphAtlas.charMetrics.height;
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
        var sourceWidth = sourceImage.width;
        var sourceHeight = sourceImage.height;
        var sourceCanvas = null;
        
        if (processedImageData) {
            sourceCanvas = document.createElement('canvas');
            sourceCanvas.width = processedImageData.width;
            sourceCanvas.height = processedImageData.height;
            var sourceCtx = sourceCanvas.getContext('2d');
            sourceCtx.putImageData(processedImageData, 0, 0);
            sourceWidth = processedImageData.width;
            sourceHeight = processedImageData.height;
        } else {
            sourceCanvas = sourceImage;
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
        processedPreviewData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
        
        var data = new Uint8ClampedArray(processedPreviewData.data);
        
        // Apply ASCII-specific processing options
        // (Edge detection and invert are NOT in adjustment bundle)
        
        if (edgeMode !== 'Off') {
            window.debugLog('TOOLS', `🔍 Applying edge detection: ${edgeMode}`);
            var edges = applyEdgeDetection(data, canvasWidth, canvasHeight);
            
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
            processImageProportional(toolInstance, sampleData, canvasWidth, canvasHeight, values, {
                tone: toneWeight,
                quadrant: quadrantWeight,
                orientation: orientWeight,
                signature: sigWeight
            }, flowMode, pixelGroup);
            return;
        }
        
        // Convert to ASCII grid
        asciiGrid = [];
        
        window.debugLog('TOOLS', `Processing image: ${cols}×${rows} tiles`);
        
        for (var row = 0; row < rows; row++) {
            var line = [];
            for (var col = 0; col < cols; col++) {
                var offsets = getLayoutOffsets(values, canvasWidth, canvasHeight, outputWidth, outputHeight, lineHeight, tw);
                var tileX = offsets.offsetX + col * (tw + letterSpacing);
                var tileY = offsets.offsetY + row * lineHeight;
                var tile = extractTileMetrics(sampleData, canvasWidth, Math.floor(tileX), Math.floor(tileY), Math.floor(tw), Math.floor(th), pixelGroup);
                if ((values.invertMapping || []).indexOf('Invert Mapping') >= 0) {
                    tile = invertTileMetrics(tile);
                }
                var bestChar = findBestMatch(tile, glyphAtlas, {
                    tone: toneWeight,
                    quadrant: quadrantWeight,
                    orientation: orientWeight,
                    signature: sigWeight
                }, flowMode);
                line.push(bestChar);
            }
            asciiGrid.push(line);
        }
        
        // Coherence disabled per critical analysis (kept for future research)
        
        window.debugLog('TOOLS', `✅ ASCII generation complete: ${rows} lines × ${cols} columns = ${rows * cols} characters`);
        toolInstance.draw();
    }
    
    function processImageProportional(toolInstance, data, canvasWidth, canvasHeight, values, weights, flowMode, pixelGroup) {
        if (!glyphAtlas || !glyphAtlas.charMetrics) return;
        
        var charHeight = glyphAtlas.charMetrics.height;
        var lineHeightPercent = values.lineHeight || 100;
        var lineHeight = (charHeight * lineHeightPercent) / 100;
        var letterSpacing = values.letterSpacing || 0;
        var avgWidth = glyphAtlas.averageWidth || glyphAtlas.charMetrics.width;
        var marginX = (values.marginX || 0) * avgWidth;
        var marginY = (values.marginY || 0) * lineHeight;
        var startX = marginX + (values.offsetX || 0);
        var startY = marginY + (values.offsetY || 0);
        var maxX = Math.max(startX, canvasWidth - marginX);
        var maxY = Math.max(startY, canvasHeight - marginY);
        
        asciiGrid = [];
        
        var y = startY;
        while (y + charHeight <= maxY) {
            var line = [];
            var x = startX;
            
            while (x + 1 <= maxX) {
                var bestChar = ' ';
                var bestCost = Infinity;
                var bestWidth = avgWidth;
                
                for (var i = 0; i < glyphAtlas.length; i++) {
                    var glyph = glyphAtlas[i];
                    var glyphWidth = Math.max(1, glyph.width || avgWidth);
                    
                    if (x + glyphWidth > maxX) {
                        continue;
                    }
                    
                    var tile = extractTileMetrics(data, canvasWidth, Math.floor(x), Math.floor(y), Math.floor(glyphWidth), Math.floor(charHeight), pixelGroup);
                    if ((values.invertMapping || []).indexOf('Invert Mapping') >= 0) {
                        tile = invertTileMetrics(tile);
                    }
                    
                    var toneCost = calculateToneCost(glyph.density, tile.density);
                    var quadCost = calculateQuadrantCost(glyph.quadrants, tile.quadrants);
                    var orientCost = calculateOrientationCostWithMode(glyph.orientation, tile, flowMode);
                    var sigCost = calculateSignatureCost(glyph.signature, tile.signature);
                    
                    var cost = weights.tone * toneCost
                             + weights.quadrant * quadCost
                             + weights.orientation * orientCost
                             + weights.signature * sigCost;
                    
                    if (cost < bestCost) {
                        bestCost = cost;
                        bestChar = glyph.char;
                        bestWidth = glyphWidth;
                    }
                }
                
                line.push({ char: bestChar, x: x, y: y });
                x += bestWidth + letterSpacing;
            }
            
            asciiGrid.push(line);
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
    
    function getAsciiLayout(values, canvasWidth, canvasHeight) {
        if (!asciiGrid || !glyphAtlas || !glyphAtlas.charMetrics) return null;
        
        var charWidth = glyphAtlas.charMetrics.width;
        var charHeight = glyphAtlas.charMetrics.height;
        var lineHeightPercent = values.lineHeight || 100;
        var letterSpacing = values.letterSpacing || 0;
        var lineHeight = (charHeight * lineHeightPercent) / 100;
        var rows = asciiGrid.length;
        var cols = asciiGrid[0] ? asciiGrid[0].length : 0;
        
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
    
    function drawAscii(ctx, w, h, values) {
        if (!asciiGrid || !glyphAtlas || !glyphAtlas.charMetrics) return;
        
        var font = glyphAtlas.charMetrics.font;
        var fontSize = glyphAtlas.charMetrics.fontSize;
        var layout = getAsciiLayout(values, w, h);
        if (!layout) return;
        
        // Get appearance settings
        var textColor = values.textColor || '#FFFFFF';
        var bgMode = values.bgMode || 'Black';
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
                for (var col = 0; col < asciiGrid[row].length; col++) {
                    var item = asciiGrid[row][col];
                    ctx.fillText(item.char, offsetX + item.x, offsetY + item.y);
                }
            }
        } else {
        // Draw character grid
        for (var row = 0; row < rows; row++) {
            for (var col = 0; col < cols; col++) {
                var char = asciiGrid[row][col];
                    var x = offsetX + col * (layout.charWidth + layout.letterSpacing);
                    var y = offsetY + row * layout.lineHeight;
                
                // Draw grid if enabled
                if (showGrid) {
                    ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
                    ctx.lineWidth = 1;
                        ctx.strokeRect(x, y, layout.charWidth, layout.charHeight);
                }
                
                ctx.fillText(char, x, y);
                }
            }
        }
        
        // Show dimensions info
        ctx.fillStyle = 'rgba(128, 128, 128, 0.7)';
        ctx.font = '10px "Atkinson Hyperlegible", monospace';
        ctx.fillText(`${cols}×${rows} chars | ${Math.round(outputWidth)}×${Math.round(outputHeight)}px`, 5, h - 15);
    }
    
    function drawAdjustedImage(ctx, areaWidth, areaHeight, values) {
        if (areaWidth <= 0 || areaHeight <= 0) return;
        
        var previewData = processedPreviewData || processedImageData;
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
        
        if (processedImageBitmap && !processedPreviewData) {
            ctx.drawImage(processedImageBitmap, offsetX, offsetY, drawWidth, drawHeight);
            return;
        }
        
        var tempCanvas = document.createElement('canvas');
        tempCanvas.width = previewData.width;
        tempCanvas.height = previewData.height;
        var tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(previewData, 0, 0);
        ctx.drawImage(tempCanvas, offsetX, offsetY, drawWidth, drawHeight);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // EXPORT
    // ═══════════════════════════════════════════════════════════════════════════════
    
    function copyToClipboard(toolInstance) {
        if (!asciiGrid || asciiGrid.length === 0) {
            window.debugLog('TOOLS', 'No ASCII result to copy');
            return;
        }
        
        // Convert grid to plain text
        var text = gridToPlainText(asciiGrid);
        
        navigator.clipboard.writeText(text).then(function() {
            window.debugLog('TOOLS', 'ASCII art copied to clipboard');
        }).catch(function(err) {
            console.error('Failed to copy to clipboard:', err);
        });
    }
    
    function gridToPlainText(grid) {
        var lines = [];
        for (var i = 0; i < grid.length; i++) {
            lines.push(grid[i].join(''));
        }
        return lines.join('\n');
    }
    
    function exportFile(toolInstance) {
        if (!asciiGrid || asciiGrid.length === 0) {
            window.debugLog('TOOLS', 'No ASCII result to export');
            return;
        }
        
        var values = toolInstance.getValues();
        var format = values.exportFormat || 'HTML Colored';
        
        switch (format) {
            case 'Plain Text':
                exportPlainText(toolInstance);
                break;
            case 'HTML Colored':
                exportHTML(toolInstance);
                break;
            case 'ANSI':
                exportANSI(toolInstance);
                break;
            case 'SVG (Vector)':
                exportSVG(toolInstance);
                break;
            case 'LaTeX':
                exportLatex(toolInstance);
                break;
            case 'Image PNG':
                exportImage(toolInstance);
                break;
            default:
                exportPlainText(toolInstance);
        }
    }
    
    function exportPlainText(toolInstance) {
        var text = gridToPlainText(asciiGrid);
        var blob = new Blob([text], { type: 'text/plain' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'ascii-art-' + Date.now() + '.txt';
        a.click();
        URL.revokeObjectURL(a.href);
        window.debugLog('TOOLS', 'ASCII art exported as plain text');
    }
    
    function exportHTML(toolInstance) {
        if (!asciiGrid || asciiGrid.length === 0 || !glyphAtlas || !glyphAtlas.charMetrics) {
            window.debugLog('TOOLS', 'No ASCII result to export');
            return;
        }
        
        var values = toolInstance.getValues();
        var font = glyphAtlas.charMetrics.font;
        var fontSize = glyphAtlas.charMetrics.fontSize;
        var lineHeightPercent = values.lineHeight || 100;
        var letterSpacing = values.letterSpacing || 0;
        var bgMode = values.bgMode || 'Black';
        var bgColor = bgMode === 'White' ? '#FFFFFF' : bgMode === 'Transparent' ? 'transparent' : '#000000';
        var textColor = values.textColor || '#FFFFFF';
        
        var html = '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<style>\n';
        html += 'body { background: ' + bgColor + '; margin: 0; padding: 20px; font-family: "' + font + '", monospace; }\n';
        html += 'pre { color: ' + textColor + '; font-size: ' + fontSize + 'px; ';
        html += 'line-height: ' + (lineHeightPercent / 100) + '; ';
        html += 'letter-spacing: ' + letterSpacing + 'px; ';
        html += 'white-space: pre; overflow-x: auto; margin: 0; }\n';
        html += '</style>\n</head>\n<body>\n<pre>';
        
        var text = gridToPlainText(asciiGrid);
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
    
    function exportANSI(toolInstance) {
        if (!asciiGrid || asciiGrid.length === 0) {
            window.debugLog('TOOLS', 'No ASCII result to export');
            return;
        }
        
        // For now, export as plain text (ANSI color codes would go here later)
        var text = gridToPlainText(asciiGrid);
        var blob = new Blob([text], { type: 'text/plain' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'ascii-art-' + Date.now() + '.ans';
        a.click();
        URL.revokeObjectURL(a.href);
        window.debugLog('TOOLS', 'ASCII art exported as ANSI');
    }
    
    function exportSVG(toolInstance) {
        if (!asciiGrid || asciiGrid.length === 0 || !glyphAtlas || !glyphAtlas.charMetrics) {
            window.debugLog('TOOLS', 'No ASCII result to export');
            return;
        }
        
        var values = toolInstance.getValues();
        var font = glyphAtlas.charMetrics.font;
        var fontSize = glyphAtlas.charMetrics.fontSize;
        var charWidth = glyphAtlas.charMetrics.width;
        var charHeight = glyphAtlas.charMetrics.height;
        var lineHeightPercent = values.lineHeight || 100;
        var letterSpacing = values.letterSpacing || 0;
        var lineHeight = (charHeight * lineHeightPercent) / 100;
        var textColor = values.textColor || '#FFFFFF';
        var bgMode = values.bgMode || 'Black';
        var bgColor = bgMode === 'White' ? '#FFFFFF' : bgMode === 'Transparent' ? 'transparent' : '#000000';
        var fontMode = values.fontMode || 'Monospace (Grid)';
        
        var rows = asciiGrid.length;
        var cols = asciiGrid[0] ? asciiGrid[0].length : 0;
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
                for (var col = 0; col < asciiGrid[row].length; col++) {
                    var item = asciiGrid[row][col];
                    var x = Math.round(item.x);
                    var y = Math.round(item.y + charHeight);
                    svg.push(`<text x="${x}" y="${y}">${escapeXML(item.char)}</text>`);
                }
            }
            svg.push('</g>');
        } else {
            svg.push(`<text font-family="${font}, monospace" font-size="${fontSize}" fill="${textColor}" letter-spacing="${letterSpacing}">`);
            for (var i = 0; i < rows; i++) {
                var line = asciiGrid[i].join('');
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
    
    function exportLatex(toolInstance) {
        if (!asciiGrid || asciiGrid.length === 0) {
            window.debugLog('TOOLS', 'No ASCII result to export');
            return;
        }
        
        var text = gridToPlainText(asciiGrid);
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
        if (!toolInstance.canvas) return;
        
        var canvas = toolInstance.canvas;
        
        switch(mode) {
            case 'Fit':
                // Scale to fit container, maintain aspect ratio
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.objectFit = 'contain';
                canvas.style.imageRendering = 'auto';
                break;
                
            case 'Fill':
                // Scale to fill container, may crop
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.objectFit = 'cover';
                canvas.style.imageRendering = 'auto';
                break;
                
            case 'Actual':
                // Show at actual pixel size, no scaling
                canvas.style.width = canvas.width + 'px';
                canvas.style.height = canvas.height + 'px';
                canvas.style.objectFit = 'none';
                canvas.style.imageRendering = 'pixelated';
                break;
        }
        
        window.debugLog('TOOLS', `Display mode set to: ${mode}`);
    }
    
    function setCanvasSize(toolInstance, width, height, options) {
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
        if (toolInstance.canvas) {
            toolInstance.canvas.width = width;
            toolInstance.canvas.height = height;
            
            // Reapply display mode
            var displayMode = toolInstance.values.displayMode || 'Actual';
            applyDisplayMode(toolInstance, displayMode);
        }
        
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
        if (sourceImage) {
            processImage(toolInstance);
        } else {
            toolInstance.draw();
        }
    }
    
    function applyCanvasFromImage(toolInstance, values) {
        if (!sourceImage) return;
        
        var scale = parseCanvasScale(values.canvasScale || '1×');
        lastCanvasScale = scale;
        var width = Math.max(1, Math.round(sourceImage.width * scale));
        var height = Math.max(1, Math.round(sourceImage.height * scale));
        
        setCanvasSize(toolInstance, width, height);
    }
    
    function applyOutputTargetConstraints(toolInstance, target) {
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
                updateFontDropdown(toolInstance, toolInstance.values);
                forceFontMode(toolInstance, 'Monospace (Grid)');
                setCanvasSize(toolInstance, 80 * charWidth, 24 * charHeight);
                break;
            }
            case 'Terminal (120×40)': {
                toolInstance.values.fontFilter = ['Monospace Only'];
                if (fontFilterComponent && fontFilterComponent.setValue) {
                    fontFilterComponent.setValue(['Monospace Only']);
                }
                updateFontDropdown(toolInstance, toolInstance.values);
                forceFontMode(toolInstance, 'Monospace (Grid)');
                setCanvasSize(toolInstance, 120 * charWidth, 40 * charHeight);
                break;
            }
            case 'Print (A4 Portrait)': {
                applyCanvasAspectRatio(toolInstance, 595 / 842);
                break;
            }
            case 'Print (A4 Landscape)': {
                applyCanvasAspectRatio(toolInstance, 842 / 595);
                break;
            }
            case 'Document (Monospace)': {
                toolInstance.values.fontFilter = ['Monospace Only'];
                if (fontFilterComponent && fontFilterComponent.setValue) {
                    fontFilterComponent.setValue(['Monospace Only']);
                }
                updateFontDropdown(toolInstance, toolInstance.values);
                forceFontMode(toolInstance, 'Monospace (Grid)');
                setCanvasSize(toolInstance, 80 * charWidth, toolInstance.values.canvasHeight || 420);
                break;
            }
            case 'Document (Non-monospace)': {
                toolInstance.values.fontFilter = [];
                if (fontFilterComponent && fontFilterComponent.setValue) {
                    fontFilterComponent.setValue([]);
                }
                updateFontDropdown(toolInstance, toolInstance.values);
                forceFontMode(toolInstance, 'Proportional (Sequential)');
                setCanvasSize(toolInstance, toolInstance.values.canvasWidth || 420, toolInstance.values.canvasHeight || 420);
                break;
            }
            case 'Web Page': {
                setCanvasSize(toolInstance, 600, toolInstance.values.canvasHeight || 420);
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

    function applyCanvasScale(toolInstance, values) {
        var nextScale = parseCanvasScale(values.canvasScale || '1×');
        var currentWidth = values.canvasWidth || (toolInstance.canvas ? toolInstance.canvas.width : 420);
        var currentHeight = values.canvasHeight || (toolInstance.canvas ? toolInstance.canvas.height : 420);
        var baseWidth = currentWidth / (lastCanvasScale || 1);
        var baseHeight = currentHeight / (lastCanvasScale || 1);
        
        lastCanvasScale = nextScale;
        setCanvasSize(toolInstance, baseWidth * nextScale, baseHeight * nextScale);
    }
    
    function applyFontModeFromFont(toolInstance, fontName) {
        if (!fontName) return;
        var mode = isMonospaceFont(fontName) ? 'Monospace (Grid)' : 'Proportional (Sequential)';
        forceFontMode(toolInstance, mode);
    }
    
    function forceFontMode(toolInstance, mode) {
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
    
    function applyCanvasAspectRatio(toolInstance, aspect) {
        var width = toolInstance.values.canvasWidth || (toolInstance.canvas ? toolInstance.canvas.width : 420);
        var height = toolInstance.values.canvasHeight || (toolInstance.canvas ? toolInstance.canvas.height : 420);
        var area = Math.max(1, width * height);
        
        var newWidth = Math.sqrt(area * aspect);
        var newHeight = area / newWidth;
        
        setCanvasSize(toolInstance, newWidth, newHeight);
    }
    
    
    function updateFontDropdown(tool, values) {
        // Get font component
        var fontComponent = tool.getComponent('font');
        if (!fontComponent) return;
        
        // Get available fonts based on filter
        var showMonospaceOnly = (values.fontFilter || []).indexOf('Monospace Only') >= 0;
        var fonts = getAvailableFonts();
        
        if (showMonospaceOnly) {
            fonts = getMonospaceFonts(fonts);
            window.debugLog('TOOLS', `Filtered to ${fonts.length} monospace fonts`);
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
    
    function loadGoogleFontHandler(toolInstance) {
        var values = toolInstance.getValues();
        var fontName = values.googleFontName;
        
        if (!fontName || fontName.trim() === '') {
            console.error('Please enter a Google Font name');
            return;
        }
        
        loadGoogleFont(fontName)
            .then(function(loadedFont) {
                // Font loaded successfully - track it
                loadedCustomFonts.push(loadedFont);
                
                window.debugLog('TOOLS', `Google Font "${loadedFont}" loaded successfully`);
                
                // Update dropdown
                updateFontDropdown(toolInstance, values);
                
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
        this.render();
    }
    
    render() {
        try {
            this.tool = new ToolBase(TOOL_CONFIG, this.deps);
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
        sourceImage = null;
        asciiGrid = null;
        glyphAtlas = null;
        processedImageData = null;
        
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
