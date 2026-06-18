/**
 * Font Analysis Tool - ToolBase Declarative Format
 *
 * Multi-font comparison with canvas-rendered metrics visualization.
 * Compares up to 3 fonts side by side with detailed measurements.
 *
 * @version 3.0.0 - ES Module conversion
 */

// ES Module imports
import { ToolBase } from '../core/tool-base.js';
import ComponentLibrary from '../../shared/component-library.js';

// Utilities

    // Font loader utility
    const fontLoader = window.googleFontsLoader || {
        loadFont: async (name) => name,
        getPopularFonts: () => [
            'Space Mono', 'Roboto Mono', 'JetBrains Mono', 'Fira Code', 
            'Source Code Pro', 'IBM Plex Mono', 'Inconsolata', 'Ubuntu Mono',
            'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Inter', 'Poppins',
            'Atkinson Hyperlegible Mono', 'Atkinson Hyperlegible'
        ],
        isFontAvailable: () => true
    };

    // Default fonts configuration
    const DEFAULT_FONTS = [
        { family: 'Space Mono', size: 48 },
        { family: 'Roboto', size: 48 },
        { family: 'Roboto Mono', size: 48 }
    ];

    // Font measurement utility
    function measureFont(fontFamily, fontSize, letter) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.font = `${fontSize}px "${fontFamily}"`;
        
        const letterMetrics = ctx.measureText(letter);
        const hMetrics = ctx.measureText('H');
        const xMetrics = ctx.measureText('x');
        
        const ascent = Math.abs(letterMetrics.fontBoundingBoxAscent || fontSize * 0.8);
        const descent = Math.abs(letterMetrics.fontBoundingBoxDescent || fontSize * 0.2);
        const actualWidth = (letterMetrics.actualBoundingBoxRight || letterMetrics.width) - 
                           (letterMetrics.actualBoundingBoxLeft || 0);
        
        return {
            fontFamily,
            fontSize,
            letter,
            ascent,
            descent,
            xHeight: xMetrics.actualBoundingBoxAscent || fontSize * 0.5,
            capitalHeight: hMetrics.actualBoundingBoxAscent || fontSize * 0.7,
            leftBearing: letterMetrics.actualBoundingBoxLeft || 0,
            rightBearing: letterMetrics.width - (letterMetrics.actualBoundingBoxRight || letterMetrics.width),
            width: actualWidth,
            advance: letterMetrics.width,
            actualBoundingBoxAscent: letterMetrics.actualBoundingBoxAscent || ascent,
            actualBoundingBoxDescent: letterMetrics.actualBoundingBoxDescent || descent,
            actualBoundingBoxLeft: letterMetrics.actualBoundingBoxLeft || 0,
            actualBoundingBoxRight: letterMetrics.actualBoundingBoxRight || letterMetrics.width
        };
    }

    // Build font dropdown options (just use string array, Dropdown handles it)
    const fontOptions = fontLoader.getPopularFonts();

    // Tool configuration
    const TOOL_CONFIG = {
        title: 'FONT ANALYSIS',
        
        sidebar: [
            ['Global', [
                ['Sample Text', [
                    ['text', 'Sample', 'The quick brown fox jumps over the lazy dog', { key: 'sampleText' }],
                    ['text', 'Letter', 'A', { key: 'letter', maxLength: 1 }],
                ]],
            ]],
            ['Font 1', [
                ['Font Selection', [
                    ['dropdown', 'Font Family', fontOptions, { key: 'font1Family', value: 'Space Mono' }],
                    ['slider', 'Font Size', 8, 120, 1, { key: 'font1Size', value: 48, withNumber: true }],
                ]],
            ]],
            ['Font 2', [
                ['Font Selection', [
                    ['dropdown', 'Font Family', fontOptions, { key: 'font2Family', value: 'Roboto' }],
                    ['slider', 'Font Size', 8, 120, 1, { key: 'font2Size', value: 48, withNumber: true }],
                ]],
            ]],
            ['Font 3', [
                ['Font Selection', [
                    ['dropdown', 'Font Family', fontOptions, { key: 'font3Family', value: 'Roboto Mono' }],
                    ['slider', 'Font Size', 8, 120, 1, { key: 'font3Size', value: 48, withNumber: true }],
                ]],
            ]],
        ],
        
        canvas: {
            width: 1200,
            height: 1000,
            displayMode: 'fit',
            showControls: true  // Enable CANVAS tab with size/display controls
        },
        
        onInit: async function(values) {
            window.debugLog('TOOLS', '🔤 Font Analysis Tool initialized');

            // Load initial fonts
            const fonts = [values.font1Family, values.font2Family, values.font3Family];
            for (const font of fonts) {
                if (font && font !== 'Space Mono') {
                    try {
                        await fontLoader.loadFont(font);
                        window.debugLog('TOOLS', `✅ Loaded font: ${font}`);
                    } catch (e) {
                        console.warn(`❌ Failed to load font: ${font}`);
                    }
                }
            }
        },
        
        onUpdate: async function(key, value, values) {
            // Load font when family changes
            if (key.endsWith('Family') && value && value !== 'Space Mono') {
                try {
                    await fontLoader.loadFont(value);
                    window.debugLog('TOOLS', `✅ Loaded font: ${value}`);
                } catch (e) {
                    console.warn(`❌ Failed to load font: ${value}`);
                }
            }

            // Redraw on any change
            this.draw();
        },
        
        onDraw: function(ctx, canvas, values) {
            const W = canvas.width;
            const H = canvas.height;
            const F = 14; // Base font size
            
            // Get font configurations
            const fonts = [
                { family: values.font1Family || 'Space Mono', size: values.font1Size || 48 },
                { family: values.font2Family || 'Roboto', size: values.font2Size || 48 },
                { family: values.font3Family || 'Roboto Mono', size: values.font3Size || 48 }
            ];
            
            const sampleText = values.sampleText || 'The quick brown fox jumps over the lazy dog';
            const letter = values.letter || 'A';
            
            // Clear canvas
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--c-bg') || '#0a0a0a';
            ctx.fillRect(0, 0, W, H);
            
            // Layout calculations
            const columnWidth = W / 3;
            const headerHeight = F * 4;
            const sampleHeight = F * 10;
            const canvasHeight = 200;
            const charsetHeight = 200;
            const ratiosHeight = F * 12;
            
            // Get measurements for all fonts
            const measurements = fonts.map(f => measureFont(f.family, f.size, letter));
            
            // Draw 3 columns
            for (let i = 0; i < 3; i++) {
                const x = columnWidth * i;
                const font = fonts[i];
                const measurement = measurements[i];
                
                // Column border
                ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--c-border') || '#333';
                ctx.lineWidth = 1;
                if (i > 0) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, H - ratiosHeight);
                    ctx.stroke();
                }
                
                // Header
                drawColumnHeader(ctx, x, 0, columnWidth, headerHeight, font, i, F);
                
                // Sample text
                drawSampleText(ctx, x, headerHeight, columnWidth, sampleHeight, font, sampleText, F);
                
                // Letter analysis canvas
                drawLetterAnalysis(ctx, x, headerHeight + sampleHeight, columnWidth, canvasHeight, font, letter, measurement, F);
                
                // Character set
                drawCharacterSet(ctx, x, headerHeight + sampleHeight + canvasHeight, columnWidth, charsetHeight, font, F);
            }
            
            // Comparison ratios footer
            ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--c-border') || '#333';
            ctx.beginPath();
            ctx.moveTo(0, H - ratiosHeight);
            ctx.lineTo(W, H - ratiosHeight);
            ctx.stroke();
            
            drawComparisonRatios(ctx, 0, H - ratiosHeight, W, ratiosHeight, fonts, measurements, F);
        }
    };

    // Helper drawing functions
    function drawColumnHeader(ctx, x, y, w, h, font, index, F) {
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--c-text') || '#f5f5f5';
        const accentColor = ['#ff5555', '#55ff55', '#5555ff'][index];
        
        // Header background line
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--c-border') || '#333';
        ctx.beginPath();
        ctx.moveTo(x, y + h);
        ctx.lineTo(x + w, y + h);
        ctx.stroke();
        
        // Font name
        ctx.fillStyle = textColor;
        ctx.font = `bold ${F}px "Atkinson Hyperlegible Mono", monospace`;
        ctx.textAlign = 'left';
        ctx.fillText(`FONT ${index + 1}: ${font.family.toUpperCase()}`, x + F, y + F * 2);
        
        // Font size
        ctx.fillStyle = accentColor;
        ctx.font = `${F}px "Atkinson Hyperlegible Mono", monospace`;
        ctx.fillText(`SIZE: ${font.size}px`, x + F, y + F * 3.2);
    }

    function drawSampleText(ctx, x, y, w, h, font, text, F) {
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--c-text') || '#f5f5f5';
        
        // Background
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--c-bg') || '#0a0a0a';
        ctx.fillRect(x, y, w, h);
        
        // Border
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--c-border') || '#333';
        ctx.beginPath();
        ctx.moveTo(x, y + h);
        ctx.lineTo(x + w, y + h);
        ctx.stroke();
        
        // Sample text - centered vertically and horizontally
        ctx.fillStyle = textColor;
        ctx.font = `${font.size}px "${font.family}"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Wrap text if too long
        const maxWidth = w - F * 2;
        const words = text.split(' ');
        let lines = [];
        let currentLine = '';
        
        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) lines.push(currentLine);
        
        // Draw lines
        const lineHeight = font.size * 1.2;
        const totalHeight = lines.length * lineHeight;
        const startY = y + h / 2 - totalHeight / 2 + lineHeight / 2;
        
        lines.forEach((line, i) => {
            ctx.fillText(line, x + w / 2, startY + i * lineHeight);
        });
    }

    function drawLetterAnalysis(ctx, x, y, w, h, font, letter, metrics, F) {
        const canvasMargin = 30;
        const centerX = x + w / 2;
        const centerY = y + h / 2;
        
        // Background
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--c-bg') || '#0a0a0a';
        ctx.fillRect(x, y, w, h);
        
        // Border
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--c-border') || '#333';
        ctx.beginPath();
        ctx.moveTo(x, y + h);
        ctx.lineTo(x + w, y + h);
        ctx.stroke();
        
        // Title
        ctx.fillStyle = '#ffff00';
        ctx.font = `${F * 0.8}px "Atkinson Hyperlegible Mono", monospace`;
        ctx.textAlign = 'left';
        ctx.fillText('LETTER ANALYSIS', x + F/2, y + F);
        
        // Calculate scale to fit letter
        const letterSize = Math.min((w - canvasMargin * 2) / 2, (h - canvasMargin * 2 - F) / 2);
        const scale = letterSize / font.size;
        
        // Draw position
        const drawX = centerX - (metrics.advance * scale) / 2;
        const drawY = centerY + (metrics.ascent * scale) / 4;
        
        // Draw bounding box
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(
            drawX,
            drawY - metrics.ascent * scale,
            metrics.advance * scale,
            (metrics.ascent + metrics.descent) * scale
        );
        
        // Draw the letter
        ctx.fillStyle = '#808080';
        ctx.font = `${font.size * scale}px "${font.family}"`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(letter, drawX, drawY);
        
        // Draw metric lines
        const lineWidth = w - canvasMargin;
        
        // Baseline (green)
        ctx.strokeStyle = '#00ff00';
        ctx.beginPath();
        ctx.moveTo(x + F/2, drawY);
        ctx.lineTo(x + w - F/2, drawY);
        ctx.stroke();
        
        // Ascent (red)
        ctx.strokeStyle = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(x + F/2, drawY - metrics.ascent * scale);
        ctx.lineTo(x + w - F/2, drawY - metrics.ascent * scale);
        ctx.stroke();
        
        // Descent (blue)
        ctx.strokeStyle = '#0000ff';
        ctx.beginPath();
        ctx.moveTo(x + F/2, drawY + metrics.descent * scale);
        ctx.lineTo(x + w - F/2, drawY + metrics.descent * scale);
        ctx.stroke();
        
        // Cap height (magenta)
        ctx.strokeStyle = '#ff00ff';
        ctx.beginPath();
        ctx.moveTo(x + F/2, drawY - metrics.capitalHeight * scale);
        ctx.lineTo(x + w - F/2, drawY - metrics.capitalHeight * scale);
        ctx.stroke();
        
        // x-height (yellow)
        ctx.strokeStyle = '#ffff00';
        ctx.beginPath();
        ctx.moveTo(x + F/2, drawY - metrics.xHeight * scale);
        ctx.lineTo(x + w - F/2, drawY - metrics.xHeight * scale);
        ctx.stroke();
        
        // Metrics text
        ctx.fillStyle = '#808080';
        ctx.font = `${F * 0.7}px "Atkinson Hyperlegible Mono", monospace`;
        ctx.textAlign = 'left';
        const metricsY = y + h - F * 2;
        ctx.fillText(`Cap: ${metrics.capitalHeight.toFixed(1)}  x: ${metrics.xHeight.toFixed(1)}  Adv: ${metrics.advance.toFixed(1)}`, x + F/2, metricsY);
    }

    function drawCharacterSet(ctx, x, y, w, h, font, F) {
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--c-text') || '#f5f5f5';
        
        // Background
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--c-bg') || '#0a0a0a';
        ctx.fillRect(x, y, w, h);
        
        // Border
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--c-border') || '#333';
        ctx.beginPath();
        ctx.moveTo(x, y + h);
        ctx.lineTo(x + w, y + h);
        ctx.stroke();
        
        // Title
        ctx.fillStyle = '#ffff00';
        ctx.font = `${F * 0.8}px "Atkinson Hyperlegible Mono", monospace`;
        ctx.textAlign = 'left';
        ctx.fillText('CHARACTER SET', x + F/2, y + F);
        
        // Character categories
        const categories = [
            { label: 'UPPERCASE:', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', color: '#ffffff' },
            { label: 'lowercase:', chars: 'abcdefghijklmnopqrstuvwxyz', color: '#00ff00' },
            { label: 'Numbers:', chars: '0123456789', color: '#00ffff' },
            { label: 'Symbols:', chars: '!@#$%^&*()_+-=[]{}|;:', color: '#ff00ff' }
        ];
        
        let currentY = y + F * 2;
        const charSize = F * 1.2;
        
        categories.forEach(cat => {
            // Label
            ctx.fillStyle = cat.color;
            ctx.font = `${F * 0.7}px "Atkinson Hyperlegible Mono", monospace`;
            ctx.fillText(cat.label, x + F/2, currentY);
            currentY += F;
            
            // Characters in font
            ctx.fillStyle = textColor;
            ctx.font = `${charSize}px "${font.family}"`;
            
            // Wrap characters
            const maxWidth = w - F;
            let lineChars = '';
            let lineWidth = 0;
            
            for (const char of cat.chars) {
                const charWidth = ctx.measureText(char).width + 2;
                if (lineWidth + charWidth > maxWidth) {
                    ctx.fillText(lineChars, x + F/2, currentY);
                    currentY += charSize + 2;
                    lineChars = char;
                    lineWidth = charWidth;
                } else {
                    lineChars += char;
                    lineWidth += charWidth;
                }
            }
            if (lineChars) {
                ctx.fillText(lineChars, x + F/2, currentY);
                currentY += charSize + F/2;
            }
        });
    }

    function drawComparisonRatios(ctx, x, y, w, h, fonts, measurements, F) {
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--c-text') || '#f5f5f5';
        
        // Title
        ctx.fillStyle = '#ffff00';
        ctx.font = `bold ${F}px "Atkinson Hyperlegible Mono", monospace`;
        ctx.textAlign = 'left';
        ctx.fillText('FONT COMPARISON RATIOS', x + F, y + F * 1.5);
        
        // Border under title
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--c-border') || '#333';
        ctx.beginPath();
        ctx.moveTo(x, y + F * 2);
        ctx.lineTo(x + w, y + F * 2);
        ctx.stroke();
        
        // Calculate ratios relative to first font
        const base = measurements[0];
        const columnWidth = w / 3;
        
        fonts.forEach((font, i) => {
            const m = measurements[i];
            const colX = x + columnWidth * i + F;
            let rowY = y + F * 3;
            
            // Font name
            const colors = ['#ff5555', '#55ff55', '#5555ff'];
            ctx.fillStyle = colors[i];
            ctx.font = `bold ${F * 0.9}px "Atkinson Hyperlegible Mono", monospace`;
            ctx.fillText(font.family.toUpperCase(), colX, rowY);
            rowY += F * 1.5;
            
            // Metrics
            ctx.font = `${F * 0.8}px "Atkinson Hyperlegible Mono", monospace`;
            
            const capRatio = (m.capitalHeight / base.capitalHeight * 100).toFixed(1);
            ctx.fillStyle = '#00ff00';
            ctx.fillText(`Cap Height: ${m.capitalHeight.toFixed(1)}px (${capRatio}%)`, colX, rowY);
            rowY += F * 1.2;
            
            const xRatio = (m.xHeight / base.xHeight * 100).toFixed(1);
            ctx.fillStyle = '#00ffff';
            ctx.fillText(`x-Height: ${m.xHeight.toFixed(1)}px (${xRatio}%)`, colX, rowY);
            rowY += F * 1.2;
            
            const advRatio = (m.advance / base.advance * 100).toFixed(1);
            ctx.fillStyle = '#ff00ff';
            ctx.fillText(`Advance: ${m.advance.toFixed(1)}px (${advRatio}%)`, colX, rowY);
            rowY += F * 1.2;
            
            // Character equivalence
            const charEquiv = (base.advance / m.advance).toFixed(3);
            ctx.fillStyle = '#ffff00';
            ctx.fillText(`1 ${fonts[0].family.split(' ')[0]} = ${charEquiv} ${font.family.split(' ')[0]}`, colX, rowY);
        });
    }

// FontAnalysisTool class definition
export class FontAnalysisTool {
    constructor(container, deps = {}) {
        this.container = container;
        this.deps = {
            ComponentLibrary,
            ...deps
        };
        this.tool = null;
        this.config = TOOL_CONFIG;

        this.initialize();
    }

    initialize() {
        // Use imported ToolBase (ES module)
        this.tool = new ToolBase(this.config, this.deps);
        if (this.container) {
            this.tool.mount(this.container);
        }
    }

    // Delegate methods to the underlying tool
    render() {
        if (this.tool) {
            this.tool.draw();
        }
    }

    destroy() {
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
    }
}

// Export config for direct ToolBase usage
export { TOOL_CONFIG as FontAnalysisToolConfig };

window.debugLog('TOOLS', '🔤 Font Analysis Tool (ES Module) ready');
