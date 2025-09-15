/**
 * Specialized Components - SiteBoy Framework
 * 
 * COMPONENTS OWNED BY THIS FILE:
 * - VGAGrid (VGA-styled color grid component)
 * - MathematicalCanvas (mathematical visualization canvas)
 * - ProgressBar (progress indicator component)
 * 
 * DO NOT ADD DUPLICATES OF THESE COMPONENTS IN OTHER FILES!
 * This is the SINGLE SOURCE OF TRUTH for all specialized/advanced UI components.
 * 
 * USAGE PATTERN:
 * import { VGAGrid, ProgressBar } from './specialized.js';
 * const grid = new VGAGrid({ items: [...] }, deps);
 * 
 * DEPENDENCIES:
 * - foundation.js (BaseComponent)
 * 
 * 📖 PLACEMENT GUIDE: See COMPONENT_PLACEMENT_GUIDE.md for component placement rules
 * 🚨 BEFORE ADDING: Check if component already exists and verify correct category
 */

import { BaseComponent } from './foundation.js';
import { Dropdown } from './interactive.js';
import DitherFunctions from '../../js/tools/dither/algorithms.js';

/**
 * VGAGrid - Color grid with VGA styling
 */
export class VGAGrid extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'grid' }, deps);
        this.items = options.items || [];
        this.cols = options.cols || 4;
        this.rows = options.rows || 4;
        this.cellSize = options.cellSize || 20;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'vga-grid component');
            
            const grid = this.createElement('div', 'vga-grid-container');
            grid.style.cssText = `
                display: grid; 
                grid-template-columns: repeat(${this.cols}, ${this.cellSize}px);
                gap: 1px; 
                background: var(--c-border);
                border: 1px solid var(--c-border);
            `;
            
            // Generate VGA-style grid items
            for (let i = 0; i < this.cols * this.rows; i++) {
                const cell = this.createElement('div', 'vga-cell');
                cell.style.cssText = `
                    width: ${this.cellSize}px;
                    height: ${this.cellSize}px;
                    background: var(--vga-color-${i % 16});
                    border: 1px solid var(--c-border);
                    box-sizing: border-box;
                `;
                grid.appendChild(cell);
            }
            
            this.element.appendChild(grid);
        }
        return this.element;
    }
}

/**
 * MathematicalCanvas - Mathematical visualization canvas
 */
export class MathematicalCanvas extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'canvas' }, deps);
        this.width = options.width || 400;
        this.height = options.height || 300;
        this.drawFunction = options.drawFunction || null;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'mathematical-canvas component');
            
            const canvas = this.createElement('canvas', 'math-canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            canvas.style.cssText = `
                width: ${this.width}px;
                height: ${this.height}px;
                border: 1px solid var(--c-border);
                background: var(--c-bg);
            `;
            
            this.element.appendChild(canvas);
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            
            if (this.drawFunction) {
                this.drawFunction(this.ctx, this.width, this.height);
            }
        }
        return this.element;
    }
    
    getContext() {
        return this.ctx;
    }
    
    clear() {
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.width, this.height);
        }
    }
}

/**
 * ProgressBar - Progress indicator component
 */
export class ProgressBar extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'progress' }, deps);
        this.value = Math.max(0, Math.min(100, options.value || 0));
        this.max = options.max || 100;
        // Support both showText and showPercent for compatibility
        this.showText = options.showText !== false || options.showPercent === true;
        this.size = options.size || 'm'; // s, m, l
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', `progress-bar progress-${this.size}`);
            
            const track = this.createElement('div', 'progress-track');
            track.style.cssText = `
                width: 100%;
                height: 20px;
                background: var(--c-bg);
                border: 1px solid var(--c-border);
                position: relative;
                overflow: hidden;
            `;
            
            const fill = this.createElement('div', 'progress-fill');
            fill.style.cssText = `
                width: ${this.value}%;
                height: 100%;
                background: var(--c-accent);
                transition: width 0.3s ease;
            `;
            
            track.appendChild(fill);
            this.element.appendChild(track);
            
            let textElement = null;
            if (this.showText) {
                textElement = this.createElement('div', 'progress-text');
                textElement.textContent = `${this.value}%`;
                textElement.style.cssText = `
                    text-align: center;
                    font-size: 12px;
                    margin-top: 4px;
                `;
                this.element.appendChild(textElement);
            }
            
            this.fillElement = fill;
            this.textElement = textElement;
        }
        return this.element;
    }
    
    setValue(value) {
        this.value = Math.max(0, Math.min(100, value));
        if (this.fillElement) {
            this.fillElement.style.width = `${this.value}%`;
        }
        if (this.textElement) {
            this.textElement.textContent = `${this.value}%`;
        }
    }
}


/**
 * ColorQuantizer - Image color reduction & dithering tool
 * - Encapsulates all DOM ops within BaseComponent methods
 * - Uses SiteBoy CSS vars and MF for spacing where needed
 */

/**
 * NumericInput - Enhanced numeric input with validation
 */
export class NumericInput extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'numeric-input' }, deps);
        this.value = options.value || 0;
        this.min = options.min;
        this.max = options.max;
        this.step = options.step || 1;
        this.label = options.label || '';
        this.onChange = options.onChange || (() => {});
        this.precision = options.precision || 3;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'numeric-input component');
            
            if (this.label) {
                const label = this.createElement('label', 'numeric-input-label');
                label.textContent = this.label;
                label.style.cssText = `
                    display: block;
                    margin-bottom: calc(var(--f) * 0.5);
                    font-size: calc(var(--f) * 0.8);
                    font-family: 'Space Mono', monospace;
                    color: var(--c-text);
                `;
                this.element.appendChild(label);
            }
            
            const input = this.createElement('input', 'numeric-input-field');
            input.type = 'number';
            input.value = this.value;
            if (this.min !== undefined) input.min = this.min;
            if (this.max !== undefined) input.max = this.max;
            input.step = this.step;
            
            input.style.cssText = `
                width: 100%;
                padding: calc(var(--f) * 0.5) calc(var(--f) * 0.75);
                border: 1px solid var(--c-border);
                background: var(--c-bg);
                color: var(--c-text);
                font-family: 'Space Mono', monospace;
                font-size: calc(var(--f) * 0.8);
                box-sizing: border-box;
            `;
            
            input.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value)) {
                    this.value = value;
                    this.onChange(value, e);
                }
            });
            
            this.element.appendChild(input);
            this.inputElement = input;
        }
        return this.element;
    }
    
    setValue(value) {
        this.value = value;
        if (this.inputElement) {
            this.inputElement.value = value.toFixed(this.precision);
        }
    }
}

/**
 * SVGDisplay - Container for mathematical SVG visualizations
 */
export class SVGDisplay extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'svg-display' }, deps);
        this.width = options.width || '100%';
        this.height = options.height || '400px';
        this.viewBox = options.viewBox || '-3 -3 6 6';
        this.svgContent = options.svgContent || '';
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'svg-display component');
            this.element.style.cssText = `
                width: 100%;
                border: 1px solid var(--c-border);
                background: var(--c-bg);
                padding: var(--f);
                box-sizing: border-box;
            `;
            
            this.svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.svgElement.setAttribute('width', this.width);
            this.svgElement.setAttribute('height', this.height);
            this.svgElement.setAttribute('viewBox', this.viewBox);
            this.svgElement.style.cssText = `
                width: 100%;
                height: ${this.height};
                display: block;
            `;
            
            this.element.appendChild(this.svgElement);
        }
        return this.element;
    }
    
    setSVGContent(content) {
        if (this.svgElement) {
            this.svgElement.innerHTML = content;
        }
    }
    
    getSVGElement() {
        return this.svgElement;
    }
}

/**
 * StatusDisplay - Status message component
 */
export class StatusDisplay extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'status-display' }, deps);
        this.message = options.message || 'Ready';
        this.type = options.type || 'info'; // info, success, warning, error
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'status-display component');
            this.element.style.cssText = `
                padding: calc(var(--f) * 0.75) var(--f);
                background: var(--c-bg);
                border: 1px solid var(--c-border);
                font-family: 'Space Mono', monospace;
                font-size: calc(var(--f) * 0.8);
                color: var(--c-text);
                margin: calc(var(--f) * 0.5) 0;
            `;
            
            this.textElement = this.createElement('span', 'status-text');
            this.textElement.textContent = this.message;
            this.element.appendChild(this.textElement);
        }
        return this.element;
    }
    
    setMessage(message, type = 'info') {
        this.message = message;
        this.type = type;
        if (this.textElement) {
            this.textElement.textContent = message;
        }
    }
}

/**
 * AnimationControls - Play/pause/navigation controls
 */
export class AnimationControls extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'animation-controls' }, deps);
        this.isPlaying = false;
        this.currentFrame = options.currentFrame || 0;
        this.totalFrames = options.totalFrames || 1;
        this.onPlay = options.onPlay || (() => {});
        this.onPause = options.onPause || (() => {});
        this.onNext = options.onNext || (() => {});
        this.onPrevious = options.onPrevious || (() => {});
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'animation-controls component');
            this.element.style.cssText = `
                display: flex;
                flex-direction: column;
                gap: calc(var(--f) * 0.5);
                padding: var(--f);
                border: 1px solid var(--c-border);
                background: var(--c-bg);
            `;
            
            // Frame info
            this.frameInfo = this.createElement('div', 'frame-info');
            this.frameInfo.style.cssText = `
                font-family: 'Space Mono', monospace;
                font-size: calc(var(--f) * 0.8);
                color: var(--c-text);
                text-align: center;
            `;
            this.updateFrameInfo();
            
            // Control buttons
            const buttonRow = this.createElement('div', 'button-row');
            buttonRow.style.cssText = `
                display: flex;
                gap: calc(var(--f) * 0.5);
                justify-content: center;
            `;
            
            this.playButton = this.createElement('button', 'play-button');
            this.playButton.textContent = 'Play';
            this.playButton.style.cssText = this.getButtonStyle();
            this.playButton.addEventListener('click', () => this.togglePlay());
            
            this.prevButton = this.createElement('button', 'prev-button');
            this.prevButton.textContent = '← Prev';
            this.prevButton.style.cssText = this.getButtonStyle();
            this.prevButton.addEventListener('click', () => {
                this.onPrevious();
                this.updateFrameInfo();
            });
            
            this.nextButton = this.createElement('button', 'next-button');
            this.nextButton.textContent = 'Next →';
            this.nextButton.style.cssText = this.getButtonStyle();
            this.nextButton.addEventListener('click', () => {
                this.onNext();
                this.updateFrameInfo();
            });
            
            buttonRow.appendChild(this.prevButton);
            buttonRow.appendChild(this.playButton);
            buttonRow.appendChild(this.nextButton);
            
            this.element.appendChild(this.frameInfo);
            this.element.appendChild(buttonRow);
        }
        return this.element;
    }
    
    getButtonStyle() {
        return `
            padding: calc(var(--f) * 0.5) calc(var(--f) * 0.75);
            background: var(--c-bg);
            border: 1px solid var(--c-border);
            color: var(--c-text);
            font-family: 'Space Mono', monospace;
            font-size: calc(var(--f) * 0.8);
            cursor: pointer;
            min-width: calc(var(--f) * 4);
        `;
    }
    
    togglePlay() {
        this.isPlaying = !this.isPlaying;
        this.playButton.textContent = this.isPlaying ? 'Pause' : 'Play';
        if (this.isPlaying) {
            this.onPlay();
        } else {
            this.onPause();
        }
    }
    
    updateFrameInfo() {
        if (this.frameInfo) {
            this.frameInfo.textContent = `Frame ${this.currentFrame + 1}/${this.totalFrames}`;
        }
    }
    
    setFrameInfo(current, total) {
        this.currentFrame = current;
        this.totalFrames = total;
        this.updateFrameInfo();
    }
}

export class ColorQuantizer extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'color-quantizer' }, deps);
        this.state = {
            originalFileName: 'image',
            originalImageData: null,
            previewImageData: null,
            currentImageData: null,
            blueNoiseTextureData: null,
            isProcessing: false,
            isEyedropperActive: false,
            customPaletteArray: ['#000000', '#FFFFFF']
        };
        this.ui = {};
        this._binded = new Set();
        this.currentPaletteKey = 'custom';
        this.currentDitherKey = 'none';
        // Offscreen buffer and view transform state for pan/zoom
        this.offscreen = { canvas: null, ctx: null, width: 0, height: 0 }; // after
        this.before = { canvas: null, ctx: null, width: 0, height: 0 }; // before
        this.view = { scale: 1, panX: 0, panY: 0, minScale: 0.1, maxScale: 16, dragging: false, lastX: 0, lastY: 0 };
        this.compare = { enabled: false, position: 0.5 };
        this.converter = new (class ColorSpaceConverter {
            constructor() {
                this.cache = new Map();
                this.WHITE_REFERENCE = { X: 0.95047, Y: 1.0, Z: 1.08883 };
                this.epsilon = 0.008856;
                this.kappa = 903.3;
            }
            hexToRgb(hex) {
                const key = `hex-${hex}`;
                if (this.cache.has(key)) return this.cache.get(key);
                const c = hex?.startsWith('#') ? hex.slice(1) : (hex || '');
                let fullHex = c;
                if (c.length === 3) fullHex = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
                if (fullHex.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(fullHex)) fullHex = '000000';
                const rgb = { r: parseInt(fullHex.slice(0,2),16), g: parseInt(fullHex.slice(2,4),16), b: parseInt(fullHex.slice(4,6),16) };
                this.cache.set(key, rgb); return rgb;
            }
            rgbToLab(r, g, b) {
                const key = `rgb-${r}-${g}-${b}`; if (this.cache.has(key)) return this.cache.get(key);
                r = Number.isFinite(r) ? r : 0; g = Number.isFinite(g) ? g : 0; b = Number.isFinite(b) ? b : 0;
                const [lr, lg, lb] = [r, g, b].map(v => { v/=255; return v<=0.04045 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); });
                const X = lr*0.4124564 + lg*0.3575761 + lb*0.1804375;
                const Y = lr*0.2126729 + lg*0.7151522 + lb*0.0721750;
                const Z = lr*0.0193339 + lg*0.1191920 + lb*0.9503041;
                const { X: Xn, Y: Yn, Z: Zn } = this.WHITE_REFERENCE;
                const xr=X/Xn, yr=Y/Yn, zr=Z/Zn;
                const fx = xr>this.epsilon ? Math.cbrt(xr) : (this.kappa*xr+16)/116;
                const fy = yr>this.epsilon ? Math.cbrt(yr) : (this.kappa*yr+16)/116;
                const fz = zr>this.epsilon ? Math.cbrt(zr) : (this.kappa*zr+16)/116;
                const L = 116*fy - 16; const a = 500*(fx - fy); const b_lab = 200*(fy - fz);
                const lab = { L, a, b: b_lab }; this.cache.set(key, lab); return lab;
            }
        })();
        this.predefinedPalettes = {
            '1bit': ['#000000', '#FFFFFF'],
            '2bit': ['#000000', '#555555', '#AAAAAA', '#FFFFFF'],
            '3bit': ['#000000', '#FF0000', '#00FF00', '#FFFF00', '#0000FF', '#FF00FF', '#00FFFF', '#FFFFFF'],
            '3bit-gray': ['#000000', '#242424', '#484848', '#6C6C6C', '#909090', '#B4B4B4', '#D8D8D8', '#FFFFFF'],
            'nes': ['#7C7C7C','#0000FC','#0000BC','#4428BC','#940084','#A80020','#A81000','#881400','#503000','#007800','#006800','#005800','#004058','#000000','#F8F8F8','#FFFFFF'],
            'gameboy': ['#0F380F', '#306230', '#8BAC0F', '#9BBC0F'],
            'primaries': ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF'],
            'pastel': ['#FFC0CB', '#E6E6FA', '#ADD8E6', '#98FF98', '#FFFFE0', '#FFDAB9'],
            'ggost': ['#000000','#1E2223','#224AC4','#6245B9','#65A3EC','#6AB960','#8B897D','#9C3B35','#B8C0C3','#C56B60','#F88127','#FB5A9E','#FBDF2B','#FCC292','#FD432A','#FDE6C4','#FFFFFF']
        };
    }
    render() {
        if (this.element) return this.element;
        const F = this.deps.MF ? this.deps.MF.F : 12;
        this.element = this.createElement('div', 'color-quantizer component');
        // Layout container
        const container = this.createElement('div', 'cq-container');
        container.style.cssText = `
            display: grid; grid-template-columns: ${F*36}px 1fr; gap: ${F}px;
        `;
        
        // Add responsive styles for ColorQuantizer
        const cqResponsiveStyle = document.createElement('style');
        cqResponsiveStyle.id = 'cq-responsive-styles';
        cqResponsiveStyle.textContent = `
            @media (max-width: 1023px) {
                .cq-container {
                    grid-template-columns: 1fr !important;
                    grid-template-rows: auto auto !important;
                    gap: ${F}px !important;
                }
                .cq-controls {
                    order: 1 !important;
                }
                .cq-canvas-box {
                    order: 2 !important;
                }
            }
        `;
        
        // Remove existing responsive styles first
        const existingCqResponsive = document.querySelector('#cq-responsive-styles');
        if (existingCqResponsive) {
            existingCqResponsive.remove();
        }
        document.head.appendChild(cqResponsiveStyle);
        // Controls column
        const controls = this.createElement('div', 'cq-controls');
        // Boxes helper
        const makeBox = (titleText) => {
            const box = this.createElement('div', 'cq-box');
            box.style.cssText = `
                border: 1px solid var(--c-border); background: var(--c-bg); padding: ${F}px;
            `;
            const h = this.createElement('div', 'cq-box-title', titleText);
            h.style.cssText = `
                font-weight: bold; border-bottom: 1px solid var(--c-border); margin-bottom: ${F}px;
            `;
            box.appendChild(h);
            // Avoid double border between stacked boxes: remove top border for non-first boxes
            if (controls && controls.children && controls.children.length > 0) {
                box.style.borderTop = 'none';
            }
            return box;
        };
        // Upload
        const uploadBox = makeBox('UPLOAD IMAGE');
        // Hidden native input for image
        this.ui.imageFileInput = this.createElement('input');
        this.ui.imageFileInput.type = 'file';
        this.ui.imageFileInput.accept = 'image/png, image/jpeg, image/webp, image/bmp';
        this.ui.imageFileInput.style.cssText = 'display:none;';
        this._on(this.ui.imageFileInput, 'change', (e) => {
            const f = e.target.files && e.target.files[0];
            if (this.ui.imageFileName) this.ui.imageFileName.textContent = f ? f.name : 'NONE';
            this.handleFileSelected(e);
        });
        // Custom row UI
        const imgFileRow = this.createElement('div');
        imgFileRow.style.cssText = `display:flex; gap:${Math.floor(F/2)}px; align-items:center; width:100%;`;
        const imgChooseBtn = this.createElement('button', 'cq-btn', 'CHOOSE FILE');
        imgChooseBtn.style.cssText = this.buttonStyle();
        this._on(imgChooseBtn, 'click', () => { this.ui.imageFileInput.click(); });
        this.ui.imageFileName = this.createElement('div', '', 'NONE');
        this.ui.imageFileName.style.cssText = `flex:1 1 auto; height:${F*2}px; line-height:${F*2-2}px; border:1px solid var(--c-border); padding:0 ${Math.floor(F/2)}px; box-sizing:border-box; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-align:left;`;
        imgFileRow.appendChild(imgChooseBtn);
        imgFileRow.appendChild(this.ui.imageFileName);
        uploadBox.appendChild(this.ui.imageFileInput);
        uploadBox.appendChild(imgFileRow);
        controls.appendChild(uploadBox);
        // Palette
        const paletteBox = makeBox('COLOR PALETTE');
        const paletteHeader = this.createElement('div');
        paletteHeader.style.cssText = `display:flex; align-items:center;`;
        // Dropdown trigger styled to 2F row, full width
        this.ui.paletteDropdownContainer = this.createElement('div');
        this.ui.paletteDropdownContainer.style.cssText = `width:100%;`;
        this.createPaletteDropdown(F);
        paletteHeader.appendChild(this.ui.paletteDropdownContainer);
        paletteBox.appendChild(paletteHeader);
        // Swatches display
        this.ui.paletteSwatchDisplay = this.createElement('div', 'cq-palette-display');
        this.ui.paletteSwatchDisplay.style.cssText = `
            display:flex; flex-wrap:wrap; gap: ${Math.max(2, Math.floor(F/6))}px; padding:${Math.floor(F/3)}px; background: var(--c-bg);
            border-left:1px solid var(--c-border); border-right:1px solid var(--c-border); border-bottom:1px solid var(--c-border); border-top:none;
            min-height:${F*2}px;
        `;
        paletteBox.appendChild(this.ui.paletteSwatchDisplay);
        // Custom tools
        this.ui.customTools = this.createElement('div', 'cq-custom-tools');
        this.ui.customTools.style.cssText = `border-top:1px dashed var(--c-border); margin-top:${F}px; padding-top:${F}px; display:none;`;
        // Eyedropper
        this.ui.eyedropperBtn = this.createElement('button', 'cq-btn', 'EYEDROPPER');
        this._on(this.ui.eyedropperBtn, 'click', () => this.toggleEyedropper());
        this.ui.eyedropperBtn.style.cssText = this.buttonStyle();
        this.ui.customTools.appendChild(this.ui.eyedropperBtn);
        // Color + hex + add
        const row = this.createElement('div');
        row.style.cssText = `display:flex; gap:${Math.floor(F/2)}px; align-items:center; margin-top:${Math.floor(F/2)}px;`;
        this.ui.customColor = this.createElement('input'); this.ui.customColor.type = 'color';
        this.ui.customColor.style.cssText = `width:${F*2}px; height:${F*2}px; border:1px solid var(--c-border); padding:0;`;
        this.ui.customHex = this.createElement('input'); this.ui.customHex.type = 'text'; this.ui.customHex.placeholder = '#RRGGBB';
        this.ui.customHex.style.cssText = `flex:1 1 auto; height:${F*2}px; border:1px solid var(--c-border); box-sizing:border-box; padding:0 ${Math.floor(F/2)}px;`;
        this.ui.addColorBtn = this.createElement('button', 'cq-btn', 'ADD'); this.ui.addColorBtn.style.cssText = this.buttonStyle();
        this._on(this.ui.customColor, 'input', (e) => { this.ui.customHex.value = e.target.value.toUpperCase(); this.ui.customHex.style.borderColor = ''; });
        this._on(this.ui.customHex, 'input', (e) => { const f = this.formatHex(e.target.value); if (f) { this.ui.customColor.value = f; e.target.value = f; e.target.style.borderColor = ''; } else { e.target.style.borderColor = 'var(--c-accent)'; } });
        this._on(this.ui.addColorBtn, 'click', () => this.addCustomColor());
        row.appendChild(this.ui.customColor); row.appendChild(this.ui.customHex); row.appendChild(this.ui.addColorBtn);
        this.ui.customTools.appendChild(row);
        // Palette file import (.txt, .gpl, .hex)
        const fileWrap = this.createElement('div');
        fileWrap.style.cssText = `margin-top:${F}px; border-top:1px dashed var(--c-border); padding-top:${F}px;`;
        const fileLbl = this.createElement('label', '', 'REPLACE CUSTOM PALETTE FROM FILE (.txt, .gpl, .hex)');
        fileLbl.style.cssText = `display:block; margin-bottom:${Math.floor(F/3)}px;`;
        // Hidden native input
        this.ui.paletteFileInput = this.createElement('input');
        this.ui.paletteFileInput.type = 'file';
        this.ui.paletteFileInput.accept = '.txt,.gpl,.hex';
        this.ui.paletteFileInput.style.cssText = 'display:none;';
        this._on(this.ui.paletteFileInput, 'change', (e) => this.onPaletteFileSelected(e));
        // Custom row
        const fileRow = this.createElement('div');
        fileRow.style.cssText = `display:flex; gap:${Math.floor(F/2)}px; align-items:center; width:100%;`;
        const chooseBtn = this.createElement('button', 'cq-btn', 'CHOOSE FILE');
        chooseBtn.style.cssText = this.buttonStyle();
        const fileName = this.createElement('div', '', 'NONE');
        fileName.style.cssText = `flex:1 1 auto; height:${F*2}px; line-height:${F*2-2}px; border:1px solid var(--c-border); padding:0 ${Math.floor(F/2)}px; box-sizing:border-box; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-align:left;`;
        this._on(chooseBtn, 'click', () => { this.ui.paletteFileInput.click(); });
        // Update name on selection
        this._on(this.ui.paletteFileInput, 'change', (e) => { const f=e.target.files&&e.target.files[0]; fileName.textContent = f? f.name : 'NONE'; });
        fileRow.appendChild(chooseBtn);
        fileRow.appendChild(fileName);
        fileWrap.appendChild(fileLbl);
        fileWrap.appendChild(this.ui.paletteFileInput);
        fileWrap.appendChild(fileRow);
        this.ui.customTools.appendChild(fileWrap);
        paletteBox.appendChild(this.ui.customTools);
        controls.appendChild(paletteBox);
        // Adjustments
        const adjBox = makeBox('IMAGE ADJUSTMENTS');
        const makeSlider = (label, min, max, step, value, id) => {
            const wrap = this.createElement('div');
            const lbl = this.createElement('label', '', label);
            lbl.style.cssText = `display:block; margin-bottom:${Math.floor(F/3)}px;`;
            const input = this.createElement('input'); input.type = 'range'; input.min = String(min); input.max = String(max); input.step = String(step); input.value = String(value); input.id = id;
            input.style.cssText = `width:100%;`;
            this._on(input, 'input', () => { this.updateAdjustmentLabels(); this.updatePreview(); });
            wrap.appendChild(lbl); wrap.appendChild(input); return { wrap, input };
        };
        const gamma = makeSlider('GAMMA', 0.2, 2.2, 0.1, 1.0, 'cq-gamma'); this.ui.gamma = gamma.input; adjBox.appendChild(gamma.wrap);
        const contrast = makeSlider('CONTRAST', 0, 200, 5, 100, 'cq-contrast'); this.ui.contrast = contrast.input; adjBox.appendChild(contrast.wrap);
        const saturation = makeSlider('SATURATION', 0, 200, 5, 100, 'cq-saturation'); this.ui.saturation = saturation.input; adjBox.appendChild(saturation.wrap);
        this.ui.resetBtn = this.createElement('button', 'cq-btn', 'RESET'); this.ui.resetBtn.style.cssText = this.buttonStyle();
        this._on(this.ui.resetBtn, 'click', () => this.resetAdjustments());
        adjBox.appendChild(this.ui.resetBtn);
        controls.appendChild(adjBox);
        // Dither
        const dithBox = makeBox('DITHERING');
        this.ui.ditherDropdownContainer = this.createElement('div');
        this.ui.ditherDropdownContainer.style.cssText = `width:100%;`;
        this.createDitherDropdown(F);
        dithBox.appendChild(this.ui.ditherDropdownContainer);
        controls.appendChild(dithBox);

        // View / Zoom controls
        const viewBox = makeBox('VIEW');
        const zoomRow = this.createElement('div');
        zoomRow.style.cssText = `display:flex; gap:${Math.floor(F/2)}px; align-items:center; width:100%;`;
        const zoomLabel = this.createElement('div', '', 'SCALE');
        zoomLabel.style.cssText = `width:${F*4}px; height:${F*2}px; line-height:${F*2-2}px;`;
        this.ui.zoomInput = this.createElement('input');
        this.ui.zoomInput.type = 'text';
        this.ui.zoomInput.value = '100%';
        this.ui.zoomInput.style.cssText = `flex:1 1 auto; height:${F*2}px; border:1px solid var(--c-border); box-sizing:border-box; padding:0 ${Math.floor(F/2)}px;`;
        const btnMinus = this.createElement('button', 'cq-btn', '−');
        btnMinus.style.cssText = this.buttonStyle();
        const btnPlus = this.createElement('button', 'cq-btn', '+');
        btnPlus.style.cssText = this.buttonStyle();
        this._on(this.ui.zoomInput, 'change', () => this.onZoomInputChange());
        this._on(btnMinus, 'click', () => this.onZoomStep(-0.1));
        this._on(btnPlus, 'click', () => this.onZoomStep(0.1));
        zoomRow.appendChild(zoomLabel);
        zoomRow.appendChild(this.ui.zoomInput);
        zoomRow.appendChild(btnMinus);
        zoomRow.appendChild(btnPlus);
        viewBox.appendChild(zoomRow);
        // Compare controls
        const cmpRow = this.createElement('div');
        cmpRow.style.cssText = `display:flex; gap:${Math.floor(F/2)}px; align-items:center; width:100%; margin-top:${Math.floor(F/2)}px;`;
        this.ui.compareToggle = this.createElement('input'); this.ui.compareToggle.type = 'checkbox'; this.ui.compareToggle.checked = false;
        const cmpLbl = this.createElement('label', '', 'COMPARE BEFORE/AFTER');
        cmpLbl.style.cssText = `height:${F*2}px; line-height:${F*2-2}px;`;
        this.ui.compareSlider = this.createElement('input'); this.ui.compareSlider.type = 'range'; this.ui.compareSlider.min = '0'; this.ui.compareSlider.max = '100'; this.ui.compareSlider.step = '1'; this.ui.compareSlider.value = '50'; this.ui.compareSlider.style.cssText = `flex:1 1 auto;`;
        this._on(this.ui.compareToggle, 'change', () => { this.compare.enabled = !!this.ui.compareToggle.checked; this.renderDisplay(); });
        this._on(this.ui.compareSlider, 'input', () => { this.compare.position = (parseInt(this.ui.compareSlider.value,10)||50)/100; this.renderDisplay(); });
        cmpRow.appendChild(this.ui.compareToggle);
        cmpRow.appendChild(cmpLbl);
        cmpRow.appendChild(this.ui.compareSlider);
        viewBox.appendChild(cmpRow);
        controls.appendChild(viewBox);
        // Status
        const statusBox = makeBox('STATUS');
        this.ui.status = this.createElement('div', 'cq-status', 'Initializing...');
        statusBox.appendChild(this.ui.status);
        controls.appendChild(statusBox);
        // Buttons
        const btnRow = this.createElement('div'); btnRow.style.cssText = `display:flex; gap:${Math.floor(F/2)}px;`;
        this.ui.processBtn = this.createElement('button', 'cq-btn', 'PROCESS'); this.ui.processBtn.style.cssText = this.primaryButtonStyle();
        this.ui.undoBtn = this.createElement('button', 'cq-btn', 'UNDO'); this.ui.undoBtn.style.cssText = this.buttonStyle();
        this.ui.downloadBtn = this.createElement('button', 'cq-btn', 'DOWNLOAD'); this.ui.downloadBtn.style.cssText = this.buttonStyle();
        this._on(this.ui.processBtn, 'click', () => this.processImage());
        this._on(this.ui.undoBtn, 'click', () => this.undoProcess());
        this._on(this.ui.downloadBtn, 'click', () => this.downloadImage());
        btnRow.appendChild(this.ui.processBtn); btnRow.appendChild(this.ui.undoBtn); btnRow.appendChild(this.ui.downloadBtn);
        controls.appendChild(btnRow);
        // Canvas column
        const canvasBox = this.createElement('div', 'cq-canvas-box');
        canvasBox.style.cssText = `border:1px solid var(--c-border); padding:${F}px; background: var(--c-bg); min-height:${F*30}px; display:flex; align-items:center; justify-content:center; overflow:auto;`;
        this.ui.canvas = this.createElement('canvas', 'cq-canvas');
        this.ui.canvas.style.cssText = `width:100%; height:100%; image-rendering: pixelated; background: var(--c-bg); cursor: grab;`;
        this._on(this.ui.canvas, 'click', (e) => this.onCanvasClick(e));
        // Pan/zoom events
        this._on(this.ui.canvas, 'wheel', (e) => this.onWheelZoom(e));
        this._on(this.ui.canvas, 'mousedown', (e) => this.onDragStart(e));
        this._on(window, 'mousemove', (e) => this.onDragMove(e));
        this._on(window, 'mouseup', () => this.onDragEnd());
        canvasBox.appendChild(this.ui.canvas);
        // Assemble
        container.appendChild(controls);
        container.appendChild(canvasBox);
        this.element.appendChild(container);
        // Initialize
        this.renderPaletteSwatches(this.state.customPaletteArray);
        this.toggleCustomTools();
        this.ui.processBtn.disabled = true; this.ui.undoBtn.disabled = true; this.ui.downloadBtn.disabled = true;
        this.loadBlueNoise();
        this.onResize = () => this.updateLayout(F);
        this.subscribeToResize();
        // Ensure correct initial layout after DOM insertion
        requestAnimationFrame(() => this.updateLayout(F));
        return this.element;
    }
    // UI helpers
    buttonStyle() {
        return `flex:1 1 auto; border:1px solid var(--c-border); background: var(--c-bg); color: var(--c-text); cursor:pointer; padding: 6px ${this.deps.MF?this.deps.MF.F:12}px;`;
    }
    primaryButtonStyle() {
        return `flex:1 1 auto; border:1px solid var(--c-text); background: var(--c-text); color: var(--c-bg); cursor:pointer; padding: 6px ${this.deps.MF?this.deps.MF.F:12}px; font-weight:bold;`;
    }
    formatLabel(v){ return v.toUpperCase().replace(/[-_]/g,' '); }
    formatHex(hexString) {
        if (!hexString) return null; let h = String(hexString).trim(); if (!h.startsWith('#')) h = '#'+h;
        if (/^#[0-9A-F]{6}$/i.test(h)) return h.toUpperCase(); if (/^#[0-9A-F]{3}$/i.test(h)) return ('#'+h[1]+h[1]+h[2]+h[2]+h[3]+h[3]).toUpperCase(); return null;
    }
    showStatus(msg){ if (this.ui.status) this.ui.status.textContent = msg; }
    _on(el, type, fn){ el.addEventListener(type, fn); this._binded.add({ el, type, fn }); }
    toggleCustomTools(){ if (!this.ui.customTools) return; const isCustom = this.currentPaletteKey === 'custom'; this.ui.customTools.style.display = isCustom ? 'block' : 'none'; }
    getActivePalette(){ const sel = this.currentPaletteKey || 'custom'; if (sel==='custom') return [...this.state.customPaletteArray]; return this.predefinedPalettes[sel] || ['#000000','#FFFFFF']; }
    renderPaletteSwatches(paletteArray){ if (!this.ui.paletteSwatchDisplay) return; this.ui.paletteSwatchDisplay.innerHTML=''; const isCustom = (this.currentPaletteKey==='custom'); const unit = (this.deps.MF?this.deps.MF.F:12)*2; paletteArray.forEach((hex, idx)=>{ const sw = this.createElement('div','cq-swatch'); sw.style.cssText = `width:${unit}px; height:${unit}px; border:1px solid var(--c-border); background:${hex}; position:relative; display:flex; align-items:center; justify-content:center;`;
        if (isCustom) {
            const overlay = this.createElement('div','cq-swatch-overlay','×');
            overlay.style.cssText = `display:none; font-size:${Math.floor(unit*0.9)}px; line-height:1; color: var(--c-bg); background: var(--c-text); width:${unit}px; height:${unit}px; position:absolute; top:0; left:0; align-items:center; justify-content:center; opacity:0.85;`;
            sw.addEventListener('mouseenter', ()=>{ overlay.style.display='flex'; });
            sw.addEventListener('mouseleave', ()=>{ overlay.style.display='none'; });
            this._on(overlay,'click',(e)=>{ e.stopPropagation(); if (idx>=0 && idx<this.state.customPaletteArray.length){ this.state.customPaletteArray.splice(idx,1); this.renderPaletteSwatches(this.state.customPaletteArray); } });
            sw.appendChild(overlay);
        }
        this.ui.paletteSwatchDisplay.appendChild(sw); }); }
    createPaletteDropdown(F){
        const options = ['custom','1bit','2bit','3bit','3bit-gray','nes','gameboy','primaries','pastel','ggost'];
        const items = options.map(k => ({ label: this.formatLabel(k), value: k }));
        this.paletteDropdown = new Dropdown({
            items,
            onSelect: (item) => { this.currentPaletteKey = item.value || item; this.updatePaletteTrigger(); this.toggleCustomTools(); this.renderPaletteSwatches(this.getActivePalette()); },
            onToggle: (open) => { this.updatePaletteTrigger(open); }
        }, { MF: this.deps.MF, Resize: this.deps.Resize });
        const el = this.paletteDropdown.render();
        el.style.width = '100%';
        if (this.paletteDropdown.triggerElement){
            const t = this.paletteDropdown.triggerElement; t.style.cssText = `width:100%; min-height:${F*2}px; border:1px solid var(--c-border); background: var(--c-bg); color: var(--c-text); text-align:left; padding:0 ${F}px; display:flex; align-items:center; justify-content:space-between;`;
            // Build left/right spans for label and symbol
            t.innerHTML = '';
            this.ui.paletteLabel = this.createElement('span');
            this.ui.paletteSymbol = this.createElement('span');
            this.ui.paletteSymbol.style.cssText = `padding-left:${F}px;`;
            t.appendChild(this.ui.paletteLabel);
            t.appendChild(this.ui.paletteSymbol);
        }
        // Remove outer border on dropdown list to avoid double border
        if (this.paletteDropdown.dropdownElement) {
            this.paletteDropdown.dropdownElement.style.outline = 'none';
            this.paletteDropdown.dropdownElement.style.borderTop = 'none';
            this.paletteDropdown.dropdownElement.style.borderBottom = '1px solid var(--c-border)';
            this.paletteDropdown.dropdownElement.style.borderLeft = '1px solid var(--c-border)';
            this.paletteDropdown.dropdownElement.style.borderRight = '1px solid var(--c-border)';
        }
        this.updatePaletteTrigger(false);
        this.ui.paletteDropdownContainer.innerHTML = '';
        this.ui.paletteDropdownContainer.appendChild(el);
    }
    updatePaletteTrigger(open=false){ if (!this.paletteDropdown || !this.paletteDropdown.triggerElement) return; const label = this.formatLabel(this.currentPaletteKey); if (this.ui.paletteLabel) this.ui.paletteLabel.textContent = label; if (this.ui.paletteSymbol) this.ui.paletteSymbol.textContent = open ? '−' : '+'; }
    updateLayout(F){ if (!this.element) return; const container = this.element.querySelector('.cq-container'); if (!container) return; const viewport = window.innerWidth || document.documentElement.clientWidth || 1024; if (viewport < 700) { container.style.gridTemplateColumns = `1fr`; } else { container.style.gridTemplateColumns = `${F*36}px 1fr`; } }
    ensureDisplayCanvasSize(){ if (!this.ui.canvas) return; const parent = this.ui.canvas.parentElement; if (!parent) return; const rect = parent.getBoundingClientRect(); const w = Math.max(1, Math.floor(rect.width)); const h = Math.max(1, Math.floor(rect.height)); if (this.ui.canvas.width !== w || this.ui.canvas.height !== h){ this.ui.canvas.width = w; this.ui.canvas.height = h; } }
    ensureOffscreen(){ if (!this.offscreen.canvas){ const c = document.createElement('canvas'); this.offscreen.canvas = c; this.offscreen.ctx = c.getContext('2d'); } if (!this.before.canvas){ const c2 = document.createElement('canvas'); this.before.canvas = c2; this.before.ctx = c2.getContext('2d'); } }
    updateOffscreenFromImageData(imgData){ this.ensureOffscreen(); const c = this.offscreen.canvas, ctx = this.offscreen.ctx; if (!imgData) return; if (c.width !== imgData.width || c.height !== imgData.height){ c.width = imgData.width; c.height = imgData.height; } ctx.putImageData(imgData, 0, 0); this.offscreen.width = c.width; this.offscreen.height = c.height; this.renderDisplay(); }
    updateBeforeFromImageData(imgData){ this.ensureOffscreen(); const c = this.before.canvas, ctx = this.before.ctx; if (!imgData) return; if (c.width !== imgData.width || c.height !== imgData.height){ c.width = imgData.width; c.height = imgData.height; } ctx.putImageData(imgData, 0, 0); this.before.width = c.width; this.before.height = c.height; }
    renderDisplay(){ if (!this.ui.canvas || !this.offscreen.canvas) return; this.ensureDisplayCanvasSize(); const ctx = this.ui.canvas.getContext('2d'); const { width, height } = this.ui.canvas; ctx.clearRect(0,0,width,height); ctx.save(); ctx.imageSmoothingEnabled = false; const s = this.view.scale; const dx = this.view.panX; const dy = this.view.panY; const dw = this.offscreen.width * s; const dh = this.offscreen.height * s; if (this.compare.enabled && this.before.canvas){ const splitX = dx + dw * this.compare.position; // screen-space split
            // Draw before on left side
            ctx.save(); ctx.beginPath(); ctx.rect(0, 0, splitX, height); ctx.clip(); ctx.drawImage(this.before.canvas, dx, dy, dw, dh); ctx.restore();
            // Draw after on right side
            ctx.save(); ctx.beginPath(); ctx.rect(splitX, 0, width - splitX, height); ctx.clip(); ctx.drawImage(this.offscreen.canvas, dx, dy, dw, dh); ctx.restore();
            // Divider line
            ctx.strokeStyle = 'var(--c-border)'; ctx.beginPath(); ctx.moveTo(splitX+0.5, 0); ctx.lineTo(splitX+0.5, height); ctx.stroke();
        } else {
            ctx.drawImage(this.offscreen.canvas, dx, dy, dw, dh);
        }
        ctx.restore(); }
    // Zoom with wheel around pointer
    onWheelZoom(e){ if (!this.offscreen.canvas) return; e.preventDefault(); const rect = this.ui.canvas.getBoundingClientRect(); const mouseX = e.clientX - rect.left; const mouseY = e.clientY - rect.top; const preImageX = (mouseX - this.view.panX) / this.view.scale; const preImageY = (mouseY - this.view.panY) / this.view.scale; const delta = -Math.sign(e.deltaY) * 0.1; const newScale = Math.max(this.view.minScale, Math.min(this.view.maxScale, this.view.scale * (1 + delta))); this.view.scale = newScale; this.view.panX = mouseX - preImageX * newScale; this.view.panY = mouseY - preImageY * newScale; this.updateZoomUI(); this.renderDisplay(); }
    onDragStart(e){ if (this.state.isEyedropperActive) return; this.view.dragging = true; this.view.lastX = e.clientX; this.view.lastY = e.clientY; this.ui.canvas.style.cursor = 'grabbing'; }
    onDragMove(e){ if (!this.view.dragging) return; const dx = e.clientX - this.view.lastX; const dy = e.clientY - this.view.lastY; this.view.lastX = e.clientX; this.view.lastY = e.clientY; this.view.panX += dx; this.view.panY += dy; this.renderDisplay(); }
    onDragEnd(){ if (!this.view.dragging) return; this.view.dragging = false; if (!this.state.isEyedropperActive) this.ui.canvas.style.cursor = 'grab'; }

    createDitherDropdown(F){
        const options = [
            { key: 'none', label: 'NONE' },
            { key: 'blue-noise', label: 'BLUE NOISE' }
        ];
        const items = options.map(o => ({ label: o.label, value: o.key }));
        this.ditherDropdown = new Dropdown({
            items,
            onSelect: (item) => { this.currentDitherKey = item.value || item; this.updateDitherTrigger(); },
            onToggle: (open) => { this.updateDitherTrigger(open); }
        }, { MF: this.deps.MF, Resize: this.deps.Resize });
        const el = this.ditherDropdown.render();
        el.style.width = '100%';
        if (this.ditherDropdown.triggerElement){
            const t = this.ditherDropdown.triggerElement; t.style.cssText = `width:100%; min-height:${F*2}px; border:1px solid var(--c-border); background: var(--c-bg); color: var(--c-text); text-align:left; padding:0 ${F}px; display:flex; align-items:center; justify-content:space-between;`;
            t.innerHTML = '';
            this.ui.ditherLabel = this.createElement('span');
            this.ui.ditherSymbol = this.createElement('span');
            this.ui.ditherSymbol.style.cssText = `padding-left:${F}px;`;
            t.appendChild(this.ui.ditherLabel);
            t.appendChild(this.ui.ditherSymbol);
        }
        if (this.ditherDropdown.dropdownElement) {
            this.ditherDropdown.dropdownElement.style.outline = 'none';
            this.ditherDropdown.dropdownElement.style.borderTop = 'none';
            this.ditherDropdown.dropdownElement.style.borderBottom = '1px solid var(--c-border)';
            this.ditherDropdown.dropdownElement.style.borderLeft = '1px solid var(--c-border)';
            this.ditherDropdown.dropdownElement.style.borderRight = '1px solid var(--c-border)';
        }
        this.updateDitherTrigger(false);
        this.ui.ditherDropdownContainer.innerHTML = '';
        this.ui.ditherDropdownContainer.appendChild(el);
    }
    updateDitherTrigger(open=false){ if (!this.ditherDropdown || !this.ditherDropdown.triggerElement) return; const label = this.formatLabel(this.currentDitherKey); if (this.ui.ditherLabel) this.ui.ditherLabel.textContent = label; if (this.ui.ditherSymbol) this.ui.ditherSymbol.textContent = open ? '−' : '+'; }
    addCustomColor(){ const hex = this.formatHex(this.ui.customHex?.value); if (hex){ if (!this.state.customPaletteArray.includes(hex)){ this.state.customPaletteArray.push(hex); this.renderPaletteSwatches(this.state.customPaletteArray); this.ui.customHex.style.borderColor=''; this.showStatus(`${hex} added`); } else { this.showStatus(`${hex} already in palette`); } } else { this.showStatus('Invalid hex'); if (this.ui.customHex) this.ui.customHex.style.borderColor='var(--c-accent)'; } }
    onPaletteFileSelected(e){ const file = e.target.files && e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (ev)=>{ try { const txt = ev.target.result; const newPalette = this.parsePaletteFile(txt, file.name); if (newPalette && newPalette.length>0){ this.state.customPaletteArray = newPalette; this.currentPaletteKey = 'custom'; this.updatePaletteTrigger(); this.toggleCustomTools(); this.renderPaletteSwatches(this.state.customPaletteArray); this.showStatus(`Loaded ${newPalette.length} colors from ${file.name}`); } else { this.showStatus('No colors parsed'); } } catch(err){ this.showStatus('Parse error'); } finally { e.target.value = null; } }; reader.onerror=()=>{ this.showStatus('Error reading file'); e.target.value=null; }; reader.readAsText(file); }
    parsePaletteFile(content, fileName){ const colors = new Set(); const lines = String(content).split(/[\r\n]+/);
        const lower = (fileName||'').toLowerCase();
        if (lower.endsWith('.gpl')){
            lines.forEach(line=>{ if (line.startsWith('#') || line.trim()==='' || line.startsWith('GIMP Palette') || line.startsWith('Name:') || line.startsWith('Columns:')) return; const parts = line.trim().split(/\s+/); if (parts.length>=3){ const r=parseInt(parts[0],10), g=parseInt(parts[1],10), b=parseInt(parts[2],10); if (!Number.isNaN(r)&&!Number.isNaN(g)&&!Number.isNaN(b)){ const rH = Math.max(0,Math.min(255,r)).toString(16).padStart(2,'0'); const gH = Math.max(0,Math.min(255,g)).toString(16).padStart(2,'0'); const bH = Math.max(0,Math.min(255,b)).toString(16).padStart(2,'0'); colors.add(`#${rH}${gH}${bH}`.toUpperCase()); } } });
        } else {
            lines.forEach(line=>{ const parts = line.split(/[\s,;]+/); parts.forEach(p=>{ const hex = this.formatHex(p); if (hex) colors.add(hex); }); });
        }
        return Array.from(colors);
    }
    // Image loading
    async handleFileSelected(e){ const file = e.target.files && e.target.files[0]; if (!file) return; this.state.originalFileName = file.name.replace(/\.[^/.]+$/, ''); const url = URL.createObjectURL(file); await this.loadImage(url); this.ui.fileInput.value = null; }
    async loadImage(url){ try { this.showStatus('Loading image...'); const img = new Image(); img.src = url; await new Promise((res, rej)=>{ img.onload = ()=>res(); img.onerror = (er)=>rej(er); }); // Draw to offscreen then capture ImageData
            this.ensureOffscreen(); const octx = this.offscreen.ctx; this.offscreen.canvas.width = img.naturalWidth; this.offscreen.canvas.height = img.naturalHeight; octx.drawImage(img,0,0); const id = octx.getImageData(0,0,this.offscreen.canvas.width,this.offscreen.canvas.height); this.state.originalImageData = id; this.state.previewImageData = id; this.state.currentImageData = id; this.view.scale = 1; this.view.panX = 0; this.view.panY = 0; this.ensureDisplayCanvasSize(); this.updateBeforeFromImageData(id); this.updateOffscreenFromImageData(id); this.resetAdjustments(); this.ui.undoBtn.disabled = false; this.ui.downloadBtn.disabled = false; this.ui.processBtn.disabled = !this.state.blueNoiseTextureData; this.showStatus('Image loaded'); } catch(err){ this.showStatus('Error loading image'); } finally { if (url && url.startsWith('blob:')) URL.revokeObjectURL(url); } }
    loadBlueNoise(){
        try {
            const size = 128;
            // Generate a deterministic Bayer-like threshold map tiled to size x size
            const bayer8 = [
                0,48,12,60,3,51,15,63,
                32,16,44,28,35,19,47,31,
                8,56,4,52,11,59,7,55,
                40,24,36,20,43,27,39,23,
                2,50,14,62,1,49,13,61,
                34,18,46,30,33,17,45,29,
                10,58,6,54,9,57,5,53,
                42,26,38,22,41,25,37,21
            ];
            const tC = this.createElement('canvas');
            tC.width = size; tC.height = size;
            const ctx = tC.getContext('2d');
            const img = ctx.createImageData(size, size);
            for (let y=0;y<size;y++){
                for (let x=0;x<size;x++){
                    const i = (y*size + x)*4;
                    const v = bayer8[(y%8)*8 + (x%8)]/64; // 0..0.984375
                    const g = Math.max(0, Math.min(255, Math.round(v*255)));
                    img.data[i]=g; img.data[i+1]=g; img.data[i+2]=g; img.data[i+3]=255;
                }
            }
            ctx.putImageData(img,0,0);
            this.state.blueNoiseTextureData = img;
            this.showStatus('Blue noise ready');
            this.ui.processBtn.disabled = (this.state.originalImageData===null);
        } catch(e) {
            this.showStatus('Blue noise unavailable');
        }
    }
    // Adjustments
    resetAdjustments(){ if (!this.ui.gamma || !this.ui.contrast || !this.ui.saturation) return; this.ui.gamma.value='1.0'; this.ui.contrast.value='100'; this.ui.saturation.value='100'; this.updateAdjustmentLabels(); this.updatePreview(); this.showStatus('Adjustments reset'); }
    updateAdjustmentLabels(){ /* labels are inline in titles; keep minimal */ }
    updatePreview(){ if (!this.state.originalImageData || this.state.isProcessing) return; const adjustments = { gamma: parseFloat(this.ui.gamma.value)||1, contrast: (parseFloat(this.ui.contrast.value)||100)/100, saturation: (parseFloat(this.ui.saturation.value)||100)/100 }; const out = this.applyImageAdjustments(this.state.originalImageData, adjustments); if (out){ this.state.previewImageData = out; this.state.currentImageData = out; this.updateOffscreenFromImageData(out); this.showStatus('Preview updated'); } }
    updateZoomUI(){ if (!this.ui.zoomInput) return; const pct = Math.round(this.view.scale * 100); this.ui.zoomInput.value = `${pct}%`; }
    onZoomInputChange(){ if (!this.ui.zoomInput) return; const val = this.ui.zoomInput.value.trim().replace('%',''); const num = parseFloat(val); if (!isFinite(num)) { this.updateZoomUI(); return; } const newScale = Math.max(this.view.minScale, Math.min(this.view.maxScale, num/100)); // Keep center in view; use canvas center
        const rect = this.ui.canvas.getBoundingClientRect(); const cx = rect.width/2; const cy = rect.height/2; const preImageX = (cx - this.view.panX) / this.view.scale; const preImageY = (cy - this.view.panY) / this.view.scale; this.view.scale = newScale; this.view.panX = cx - preImageX * newScale; this.view.panY = cy - preImageY * newScale; this.updateZoomUI(); this.renderDisplay(); }
    onZoomStep(delta){ const newScale = Math.max(this.view.minScale, Math.min(this.view.maxScale, this.view.scale * (1 + delta))); const rect = this.ui.canvas.getBoundingClientRect(); const cx = rect.width/2; const cy = rect.height/2; const preImageX = (cx - this.view.panX) / this.view.scale; const preImageY = (cy - this.view.panY) / this.view.scale; this.view.scale = newScale; this.view.panX = cx - preImageX * newScale; this.view.panY = cy - preImageY * newScale; this.updateZoomUI(); this.renderDisplay(); }
    // Processing
    processImage(){ const src = this.state.previewImageData || this.state.originalImageData; if (!src) { this.showStatus('Load an image first'); return; } if (this.state.isProcessing){ this.showStatus('Already processing'); return; } this.state.isProcessing = true; this.ui.processBtn.disabled = true; this.ui.undoBtn.disabled = true; this.ui.downloadBtn.disabled = true; this.showStatus('Processing...'); setTimeout(()=>{ try { const palette = this.getActivePalette(); const paletteLabs = palette.map(h => { const rgb = this.converter.hexToRgb(h); return this.converter.rgbToLab(rgb.r, rgb.g, rgb.b); }); let out; if (this.currentDitherKey === 'none'){ out = DitherFunctions.none(src, palette, paletteLabs, this.converter); } else if (this.currentDitherKey === 'blue-noise'){ if (!this.state.blueNoiseTextureData){ this.showStatus('Blue noise unavailable'); throw new Error('Blue noise missing'); } out = DitherFunctions['blue-noise'](src, palette, paletteLabs, this.converter, this.state.blueNoiseTextureData); } else if (this.currentDitherKey === 'floyd-steinberg'){ out = DitherFunctions['floyd-steinberg'](src, palette, paletteLabs, this.converter); } else { out = DitherFunctions.none(src, palette, paletteLabs, this.converter); }
            this.state.currentImageData = out; this.updateBeforeFromImageData(this.state.originalImageData); this.updateOffscreenFromImageData(out); this.showStatus('Done'); } catch(err){ if (err && err.message) console.error(err.message); } finally { this.state.isProcessing = false; this.ui.processBtn.disabled = !this.state.blueNoiseTextureData || !this.state.originalImageData; this.ui.undoBtn.disabled = !this.state.originalImageData; this.ui.downloadBtn.disabled = !this.state.currentImageData; } }, 30); }
    undoProcess(){ const restore = this.state.previewImageData || this.state.originalImageData; if (!restore) { this.showStatus('Nothing to undo'); return; } this.state.currentImageData = restore; this.updateOffscreenFromImageData(restore); this.showStatus('Reverted to preview'); }
    downloadImage(){ if (!this.state.currentImageData) { this.showStatus('Nothing to download'); return; } const t = this.createElement('canvas'); t.width = this.state.currentImageData.width; t.height = this.state.currentImageData.height; const tCtx = t.getContext('2d'); tCtx.putImageData(this.state.currentImageData,0,0); const link = this.createElement('a'); const ditherFlag = (this.currentDitherKey === 'none') ? 'dither_off' : 'dither_on'; link.download = `${this.state.originalFileName}_quant_${this.currentPaletteKey}_${ditherFlag}.png`; link.href = t.toDataURL('image/png'); link.click(); this.showStatus('Download started'); }
    onCanvasClick(event){ if (!this.state.isEyedropperActive) return; const canvas = this.ui.canvas; const rect = canvas.getBoundingClientRect(); const sX = canvas.width / rect.width; const sY = canvas.height / rect.height; const cX = Math.floor((event.clientX - rect.left) * sX); const cY = Math.floor((event.clientY - rect.top) * sY); const img = this.state.previewImageData || this.state.originalImageData; if (!img) return; const idx = (cY * canvas.width + cX) * 4; const r = img.data[idx], g = img.data[idx+1], b = img.data[idx+2]; const hex = `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`.toUpperCase(); if (this.ui.customHex) { this.ui.customHex.value = hex; this.ui.customHex.style.borderColor = ''; } if (this.ui.customColor) { this.ui.customColor.value = hex; } this.state.isEyedropperActive = false; canvas.style.outline=''; this.showStatus(`Picked ${hex}`); }
    toggleEyedropper(){ this.state.isEyedropperActive = !this.state.isEyedropperActive; if (this.ui.canvas){ this.ui.canvas.style.outline = this.state.isEyedropperActive ? `1px solid var(--c-accent)` : ''; const cursorUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAVUlEQVQ4T6XUsQ2AMAhF0SWQKQJqgCagCSgCkiQkqVQ9n6r0QF1v3b5gk0jQ2jv0gIY2gG0q4QkYqgQ8n5lJQmKfXQw8D7gq4sHh8l9t8lq0z0nqgP1w7D1wC8wU3S2Qv8yqv+8C2wB6qvAx3Qwz+YF5hAAAAAElFTkSuQmCC'; this.ui.canvas.style.cursor = this.state.isEyedropperActive ? `url(${cursorUrl}) 1 15, crosshair` : ''; } this.showStatus(this.state.isEyedropperActive ? 'Eyedropper: click canvas' : 'Eyedropper off'); }
    // Processing helpers
    clamp(v, min=0, max=255){ return Math.max(min, Math.min(max, v)); }
    deltaE76(l1, l2){ const dL=l1.L-l2.L, da=l1.a-l2.a, db=l1.b-l2.b; return Math.sqrt(dL*dL+da*da+db*db); }
    pickNearest(lab, paletteLabs){ let best=0, bestD=Infinity; for (let i=0;i<paletteLabs.length;i++){ const d=this.deltaE76(lab, paletteLabs[i]); if (d<bestD){ bestD=d; best=i; if (d<0.001) break; } } return best; }
    vecSub(a,b){ return { L:a.L-b.L, a:a.a-b.a, b:a.b-b.b }; }
    vecDot(a,b){ return a.L*b.L + a.a*b.a + a.b*b.b; }
    vecMagSq(a){ return this.vecDot(a,a); }
    projectOntoSegment(O, P1, P2){ const V=this.vecSub(P2,P1); const W=this.vecSub(O,P1); const VV=this.vecMagSq(V); if (VV<1e-9) return { pointM:P1, weightP1:1.0 }; const t=this.vecDot(W,V)/VV; const tc=Math.max(0,Math.min(1,t)); return { pointM:{ L:P1.L+V.L*tc, a:P1.a+V.a*tc, b:P1.b+V.b*tc }, weightP1: 1.0 - tc };
    }
    findOppositeColor(O, idxC, paletteLabs){ if (paletteLabs.length<2) return -1; const C = paletteLabs[idxC]; const OC = this.vecSub(C,O); const magOC = Math.sqrt(this.vecMagSq(OC)); if (magOC<1e-9) return -1; let best=-1, minCos=1.0; for (let k=0;k<paletteLabs.length;k++){ if (k===idxC) continue; const OK = this.vecSub(paletteLabs[k], O); const magOK = Math.sqrt(this.vecMagSq(OK)); const denom = magOC*magOK; if (denom<1e-9) continue; const cos = this.vecDot(OC,OK)/denom; if (cos<minCos){ minCos=cos; best=k; } } return best; }
    strategyNearestOpposite(O, paletteLabs){ const idxC = this.pickNearest(O, paletteLabs); const C = paletteLabs[idxC]; const distC = this.deltaE76(O,C); if (distC<0.001 || paletteLabs.length<2) return { type:'solid', idx1: idxC };
        const idxI = this.findOppositeColor(O, idxC, paletteLabs); if (idxI===-1) return { type:'solid', idx1: idxC };
        const I = paletteLabs[idxI]; const { pointM, weightP1 } = this.projectOntoSegment(O, C, I); const distM = this.deltaE76(O, pointM);
        if (distM < distC) return { type:'dither', idx1: idxC, idx2: idxI, weight1: Math.max(0, Math.min(1, weightP1)) };
        return { type:'solid', idx1: idxC };
    }
    ditherNearestOppositeChecked(imageData, palette, paletteLabs, blueNoise){ const { width, height, data } = imageData; const out = new Uint8ClampedArray(data.length); const bnW=blueNoise.width, bnH=blueNoise.height, bnD=blueNoise.data; for (let y=0;y<height;y++){ for (let x=0;x<width;x++){ const i4=(y*width+x)*4; const r=data[i4], g=data[i4+1], b=data[i4+2], a=data[i4+3]; const O=this.converter.rgbToLab(r,g,b); const strat=this.strategyNearestOpposite(O, paletteLabs); let chosen=strat.idx1; if (strat.type==='dither'){ const bnX=x%bnW, bnY=y%bnH; const bnIdx=(bnY*bnW+bnX)*4; const bnV = bnD[bnIdx]/255; chosen = (bnV < strat.weight1) ? strat.idx1 : strat.idx2; }
            const q = this.converter.hexToRgb(palette[chosen] || '#000000'); out[i4]=q.r; out[i4+1]=q.g; out[i4+2]=q.b; out[i4+3]=a; } }
        return new ImageData(out, width, height);
    }
    doNoDitherLargePalette(imageData, palette, paletteLabs){ const { width, height, data } = imageData; const out = new Uint8ClampedArray(data.length); for (let i=0;i<data.length;i+=4){ const r=data[i], g=data[i+1], b=data[i+2], a=data[i+3]; const lab=this.converter.rgbToLab(r,g,b); const idx=this.pickNearest(lab, paletteLabs); const q=this.converter.hexToRgb(palette[idx] || '#000000'); out[i]=q.r; out[i+1]=q.g; out[i+2]=q.b; out[i+3]=a; } return new ImageData(out, width, height); }
    applyImageAdjustments(src, adj){ if (!src) return null; const { gamma, contrast, saturation } = adj; const gExp = gamma===0 ? Infinity : 1.0/gamma; const { width, height, data } = src; const out = new Uint8ClampedArray(data); const lumR=0.2126, lumG=0.7152, lumB=0.0722; for (let i=0;i<out.length;i+=4){ let r=data[i], g=data[i+1], b=data[i+2]; if(saturation!==1.0){ const gray=r*lumR+g*lumG+b*lumB; r=this.clamp(gray+saturation*(r-gray)); g=this.clamp(gray+saturation*(g-gray)); b=this.clamp(gray+saturation*(b-gray)); } if (contrast!==1.0){ r=this.clamp(((r/255-0.5)*contrast+0.5)*255); g=this.clamp(((g/255-0.5)*contrast+0.5)*255); b=this.clamp(((b/255-0.5)*contrast+0.5)*255); } if (gamma!==1.0 && gamma>0){ r=this.clamp(Math.pow(r/255, gExp)*255); g=this.clamp(Math.pow(g/255, gExp)*255); b=this.clamp(Math.pow(b/255, gExp)*255); } out[i]=Math.round(r); out[i+1]=Math.round(g); out[i+2]=Math.round(b); }
        return new ImageData(out, width, height);
    }
    // Cleanup
    destroy(){ for (const b of this._binded){ const { el, type, fn } = b; try { el.removeEventListener(type, fn); } catch(_){} } this._binded.clear(); super.destroy(); }
}

