/**
 * Colour Quantizer Tool - SiteBoy Framework
 * 
 * High-fidelity image quantization with custom colour palettes and advanced dithering.
 * EXACT ORIGINAL IMPLEMENTATION - follows PolygonCalculator pattern
 * 
 * @version 1.0.0
 * @dependencies ComponentLibrary
 */

class ColourQuantizer {
    constructor(container, deps = {}) {
        this.container = container;
        this.deps = deps;
        this.componentInstances = [];
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
        this.offscreen = { canvas: null, ctx: null, width: 0, height: 0 };
        this.view = { scale: 1, panX: 0, panY: 0, minScale: 0.1, maxScale: 16, dragging: false, lastX: 0, lastY: 0 };
        
        // Color space converter
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
        this.destroy();
        const F = this.deps.MF ? this.deps.MF.F : 12;
        
        // Title like polygon calculator
        // No title/description - direct to interface
        
        // Main layout container - exact F*36 pixel layout like original
        const container = document.createElement('div');
        container.className = 'cq-container';
        container.style.cssText = `
            display: grid; 
            grid-template-columns: ${F*36}px 1fr; 
            gap: ${F}px;
        `;
        
        // Controls column
        const controls = document.createElement('div');
        controls.className = 'cq-controls';
        container.appendChild(controls);
        
        // Canvas section
        const canvasBox = this.createCanvasSection(F);
        container.appendChild(canvasBox);
        
        this.container.appendChild(container);
        
        // Now create all the control sections
        this.createAllSections(controls, F);
        
        // Initialize
        this.renderPaletteSwatches(this.state.customPaletteArray);
        this.toggleCustomTools();
        this.ui.processBtn.disabled = true; 
        this.ui.undoBtn.disabled = true; 
        this.ui.downloadBtn.disabled = true;
        this.loadBlueNoise();
        
        // Subscribe to resize events for responsive layout
        this.onResize = () => this.updateLayout(F);
        this.subscribeToResize();
        
        // Ensure correct initial layout after DOM insertion
        requestAnimationFrame(() => this.updateLayout(F));
    }
    
    createAllSections(controls, F) {
        // Boxes helper - creates stacked boxes with shared borders
        const makeBox = (titleText) => {
            const box = document.createElement('div');
            box.className = 'cq-box';
            box.style.cssText = `
                border: 1px solid var(--c-border); 
                background: var(--c-bg); 
                padding: ${F}px;
            `;
            
            const h = document.createElement('div');
            h.className = 'cq-box-title';
            h.textContent = titleText;
            h.style.cssText = `
                font-weight: bold; 
                border-bottom: 1px solid var(--c-border); 
                margin-bottom: ${F}px;
            `;
            box.appendChild(h);
            
            // Avoid double border between stacked boxes: remove top border for non-first boxes
            if (controls && controls.children && controls.children.length > 0) {
                box.style.borderTop = 'none';
            }
            return box;
        };
        
        // Upload section
        this.createUploadSection(makeBox, controls, F);
        
        // Palette section  
        this.createPaletteSection(makeBox, controls, F);
        
        // Adjustments section
        this.createAdjustmentsSection(makeBox, controls, F);
        
        // Dithering section
        this.createDitheringSection(makeBox, controls, F);
        
        // View section
        this.createViewSection(makeBox, controls, F);
        
        // Status section
        this.createStatusSection(makeBox, controls, F);
        
        // Action buttons
        this.createActionButtons(controls, F);
    }
    
    createUploadSection(makeBox, controls, F) {
        const uploadBox = makeBox('UPLOAD IMAGE');
        
        // Hidden native input for image
        this.ui.imageFileInput = document.createElement('input');
        this.ui.imageFileInput.type = 'file';
        this.ui.imageFileInput.accept = 'image/png, image/jpeg, image/webp, image/bmp';
        this.ui.imageFileInput.style.cssText = 'display:none;';
        this._on(this.ui.imageFileInput, 'change', (e) => {
            const f = e.target.files && e.target.files[0];
            if (this.ui.imageFileName) this.ui.imageFileName.textContent = f ? f.name : 'NONE';
            this.handleFileSelected(e);
        });
        
        // Custom row UI following polygon calculator pattern
        const imgFileRow = document.createElement('div');
        imgFileRow.style.cssText = `display:flex; gap:${Math.floor(F/2)}px; align-items:center; width:100%;`;
        
        const imgChooseBtn = document.createElement('button');
        imgChooseBtn.className = 'cq-btn';
        imgChooseBtn.textContent = 'CHOOSE FILE';
        imgChooseBtn.style.cssText = this.buttonStyle();
        this._on(imgChooseBtn, 'click', () => { this.ui.imageFileInput.click(); });
        
        this.ui.imageFileName = document.createElement('div');
        this.ui.imageFileName.textContent = 'NONE';
        this.ui.imageFileName.style.cssText = `flex:1 1 auto; height:${F*2}px; line-height:${F*2-2}px; border:1px solid var(--c-border); padding:0 ${Math.floor(F/2)}px; box-sizing:border-box; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-align:left;`;
        
        imgFileRow.appendChild(imgChooseBtn);
        imgFileRow.appendChild(this.ui.imageFileName);
        uploadBox.appendChild(this.ui.imageFileInput);
        uploadBox.appendChild(imgFileRow);
        controls.appendChild(uploadBox);
    }
    
    createPaletteSection(makeBox, controls, F) {
        const paletteBox = makeBox('COLOUR PALETTE');
        
        const paletteHeader = document.createElement('div');
        paletteHeader.style.cssText = `display:flex; align-items:center;`;
        
        // Dropdown using ComponentLibrary.Dropdown
        this.ui.paletteDropdownContainer = document.createElement('div');
        this.ui.paletteDropdownContainer.style.cssText = `width:100%;`;
        this.createPaletteDropdown(F);
        paletteHeader.appendChild(this.ui.paletteDropdownContainer);
        paletteBox.appendChild(paletteHeader);
        
        // Swatches display
        this.ui.paletteSwatchDisplay = document.createElement('div');
        this.ui.paletteSwatchDisplay.className = 'cq-palette-display';
        this.ui.paletteSwatchDisplay.style.cssText = `
            display:flex; flex-wrap:wrap; gap: ${Math.max(2, Math.floor(F/6))}px; padding:${Math.floor(F/3)}px; background: var(--c-bg);
            border-left:1px solid var(--c-border); border-right:1px solid var(--c-border); border-bottom:1px solid var(--c-border); border-top:none;
            min-height:${F*2}px;
        `;
        paletteBox.appendChild(this.ui.paletteSwatchDisplay);
        
        // Custom tools
        this.ui.customTools = document.createElement('div');
        this.ui.customTools.className = 'cq-custom-tools';
        this.ui.customTools.style.cssText = `border-top:1px dashed var(--c-border); margin-top:${F}px; padding-top:${F}px; display:none;`;
        
        // Eyedropper
        this.ui.eyedropperBtn = document.createElement('button');
        this.ui.eyedropperBtn.className = 'cq-btn';
        this.ui.eyedropperBtn.textContent = 'EYEDROPPER';
        this._on(this.ui.eyedropperBtn, 'click', () => this.toggleEyedropper());
        this.ui.eyedropperBtn.style.cssText = this.buttonStyle();
        this.ui.customTools.appendChild(this.ui.eyedropperBtn);
        
        // Color + hex + add row
        const row = document.createElement('div');
        row.style.cssText = `display:flex; gap:${Math.floor(F/2)}px; align-items:center; margin-top:${Math.floor(F/2)}px;`;
        
        this.ui.customColor = document.createElement('input'); 
        this.ui.customColor.type = 'color';
        this.ui.customColor.style.cssText = `width:${F*2}px; height:${F*2}px; border:1px solid var(--c-border); padding:0;`;
        
        this.ui.customHex = document.createElement('input'); 
        this.ui.customHex.type = 'text'; 
        this.ui.customHex.placeholder = '#RRGGBB';
        this.ui.customHex.style.cssText = `flex:1 1 auto; height:${F*2}px; border:1px solid var(--c-border); box-sizing:border-box; padding:0 ${Math.floor(F/2)}px;`;
        
        this.ui.addColourBtn = document.createElement('button'); 
        this.ui.addColourBtn.className = 'cq-btn';
        this.ui.addColourBtn.textContent = 'ADD';
        this.ui.addColourBtn.style.cssText = this.buttonStyle();
        
        this.ui.customColour = this.ui.customColor; // Alias for consistency
        
        this._on(this.ui.customColour, 'input', (e) => { this.ui.customHex.value = e.target.value.toUpperCase(); this.ui.customHex.style.borderColor = ''; });
        this._on(this.ui.customHex, 'input', (e) => { const f = this.formatHex(e.target.value); if (f) { this.ui.customColour.value = f; e.target.value = f; e.target.style.borderColor = ''; } else { e.target.style.borderColor = 'var(--c-accent)'; } });
        this._on(this.ui.addColourBtn, 'click', () => this.addCustomColour());
        
        row.appendChild(this.ui.customColour); 
        row.appendChild(this.ui.customHex); 
        row.appendChild(this.ui.addColourBtn);
        this.ui.customTools.appendChild(row);
        
        // Palette file import section
        this.createPaletteFileSection(this.ui.customTools, F);
        
        paletteBox.appendChild(this.ui.customTools);
        controls.appendChild(paletteBox);
    }
    
    createPaletteFileSection(parent, F) {
        const fileWrap = document.createElement('div');
        fileWrap.style.cssText = `margin-top:${F}px; border-top:1px dashed var(--c-border); padding-top:${F}px;`;
        
        const fileLbl = document.createElement('label');
        fileLbl.textContent = 'REPLACE CUSTOM PALETTE FROM FILE (.txt, .gpl, .hex)';
        fileLbl.style.cssText = `display:block; margin-bottom:${Math.floor(F/3)}px;`;
        
        // Hidden native input
        this.ui.paletteFileInput = document.createElement('input');
        this.ui.paletteFileInput.type = 'file';
        this.ui.paletteFileInput.accept = '.txt,.gpl,.hex';
        this.ui.paletteFileInput.style.cssText = 'display:none;';
        this._on(this.ui.paletteFileInput, 'change', (e) => this.onPaletteFileSelected(e));
        
        // Custom row
        const fileRow = document.createElement('div');
        fileRow.style.cssText = `display:flex; gap:${Math.floor(F/2)}px; align-items:center; width:100%;`;
        
        const chooseBtn = document.createElement('button');
        chooseBtn.className = 'cq-btn';
        chooseBtn.textContent = 'CHOOSE FILE';
        chooseBtn.style.cssText = this.buttonStyle();
        
        const fileName = document.createElement('div');
        fileName.textContent = 'NONE';
        fileName.style.cssText = `flex:1 1 auto; height:${F*2}px; line-height:${F*2-2}px; border:1px solid var(--c-border); padding:0 ${Math.floor(F/2)}px; box-sizing:border-box; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-align:left;`;
        
        this._on(chooseBtn, 'click', () => { this.ui.paletteFileInput.click(); });
        this._on(this.ui.paletteFileInput, 'change', (e) => { const f=e.target.files&&e.target.files[0]; fileName.textContent = f? f.name : 'NONE'; });
        
        fileRow.appendChild(chooseBtn);
        fileRow.appendChild(fileName);
        fileWrap.appendChild(fileLbl);
        fileWrap.appendChild(this.ui.paletteFileInput);
        fileWrap.appendChild(fileRow);
        parent.appendChild(fileWrap);
    }
    
    createAdjustmentsSection(makeBox, controls, F) {
        const adjBox = makeBox('IMAGE ADJUSTMENTS');
        
        const makeSlider = (label, min, max, step, value, id) => {
            const wrap = document.createElement('div');
            const lbl = document.createElement('label');
            lbl.textContent = label;
            lbl.style.cssText = `display:block; margin-bottom:${Math.floor(F/3)}px;`;
            
            const input = document.createElement('input'); 
            input.type = 'range'; 
            input.min = String(min); 
            input.max = String(max); 
            input.step = String(step); 
            input.value = String(value); 
            input.id = id;
            input.style.cssText = `width:100%;`;
            this._on(input, 'input', () => { this.updateAdjustmentLabels(); this.updatePreview(); });
            
            wrap.appendChild(lbl); 
            wrap.appendChild(input); 
            return { wrap, input };
        };
        
        const gamma = makeSlider('GAMMA', 0.2, 2.2, 0.1, 1.0, 'cq-gamma'); 
        this.ui.gamma = gamma.input; 
        adjBox.appendChild(gamma.wrap);
        
        const contrast = makeSlider('CONTRAST', 0, 200, 5, 100, 'cq-contrast'); 
        this.ui.contrast = contrast.input; 
        adjBox.appendChild(contrast.wrap);
        
        const saturation = makeSlider('SATURATION', 0, 200, 5, 100, 'cq-saturation'); 
        this.ui.saturation = saturation.input; 
        adjBox.appendChild(saturation.wrap);
        
        this.ui.resetBtn = document.createElement('button');
        this.ui.resetBtn.className = 'cq-btn';
        this.ui.resetBtn.textContent = 'RESET';
        this.ui.resetBtn.style.cssText = this.buttonStyle();
        this._on(this.ui.resetBtn, 'click', () => this.resetAdjustments());
        adjBox.appendChild(this.ui.resetBtn);
        
        controls.appendChild(adjBox);
    }
    
    createDitheringSection(makeBox, controls, F) {
        const dithBox = makeBox('DITHERING');
        this.ui.ditherDropdownContainer = document.createElement('div');
        this.ui.ditherDropdownContainer.style.cssText = `width:100%;`;
        this.createDitherDropdown(F);
        dithBox.appendChild(this.ui.ditherDropdownContainer);
        controls.appendChild(dithBox);
    }
    
    createViewSection(makeBox, controls, F) {
        const viewBox = makeBox('VIEW');
        const zoomRow = document.createElement('div');
        zoomRow.style.cssText = `display:flex; gap:${Math.floor(F/2)}px; align-items:center; width:100%;`;
        
        const zoomLabel = document.createElement('div');
        zoomLabel.textContent = 'SCALE';
        zoomLabel.style.cssText = `width:${F*4}px; height:${F*2}px; line-height:${F*2-2}px;`;
        
        this.ui.zoomInput = document.createElement('input');
        this.ui.zoomInput.type = 'text';
        this.ui.zoomInput.value = '100%';
        this.ui.zoomInput.style.cssText = `flex:1 1 auto; height:${F*2}px; border:1px solid var(--c-border); box-sizing:border-box; padding:0 ${Math.floor(F/2)}px;`;
        
        const btnMinus = document.createElement('button');
        btnMinus.className = 'cq-btn';
        btnMinus.textContent = '−';
        btnMinus.style.cssText = this.buttonStyle();
        
        const btnPlus = document.createElement('button');
        btnPlus.className = 'cq-btn';
        btnPlus.textContent = '+';
        btnPlus.style.cssText = this.buttonStyle();
        
        this._on(this.ui.zoomInput, 'change', () => this.onZoomInputChange());
        this._on(btnMinus, 'click', () => this.onZoomStep(-0.1));
        this._on(btnPlus, 'click', () => this.onZoomStep(0.1));
        
        zoomRow.appendChild(zoomLabel);
        zoomRow.appendChild(this.ui.zoomInput);
        zoomRow.appendChild(btnMinus);
        zoomRow.appendChild(btnPlus);
        viewBox.appendChild(zoomRow);
        controls.appendChild(viewBox);
    }
    
    createStatusSection(makeBox, controls, F) {
        const statusBox = makeBox('STATUS');
        this.ui.status = document.createElement('div');
        this.ui.status.className = 'cq-status';
        this.ui.status.textContent = 'Initializing...';
        statusBox.appendChild(this.ui.status);
        controls.appendChild(statusBox);
    }
    
    createActionButtons(controls, F) {
        const btnRow = document.createElement('div'); 
        btnRow.style.cssText = `display:flex; gap:${Math.floor(F/2)}px;`;
        
        this.ui.processBtn = document.createElement('button');
        this.ui.processBtn.className = 'cq-btn';
        this.ui.processBtn.textContent = 'PROCESS';
        this.ui.processBtn.style.cssText = this.primaryButtonStyle();
        
        this.ui.undoBtn = document.createElement('button');
        this.ui.undoBtn.className = 'cq-btn';
        this.ui.undoBtn.textContent = 'UNDO';
        this.ui.undoBtn.style.cssText = this.buttonStyle();
        
        this.ui.downloadBtn = document.createElement('button');
        this.ui.downloadBtn.className = 'cq-btn';
        this.ui.downloadBtn.textContent = 'DOWNLOAD';
        this.ui.downloadBtn.style.cssText = this.buttonStyle();
        
        this._on(this.ui.processBtn, 'click', () => this.processImage());
        this._on(this.ui.undoBtn, 'click', () => this.undoProcess());
        this._on(this.ui.downloadBtn, 'click', () => this.downloadImage());
        
        btnRow.appendChild(this.ui.processBtn); 
        btnRow.appendChild(this.ui.undoBtn); 
        btnRow.appendChild(this.ui.downloadBtn);
        controls.appendChild(btnRow);
    }
    
    createCanvasSection(F) {
        const canvasBox = document.createElement('div');
        canvasBox.className = 'cq-canvas-box';
        canvasBox.style.cssText = `border:1px solid var(--c-border); padding:${F}px; background: var(--c-bg); min-height:${F*30}px; display:flex; align-items:center; justify-content:center; overflow:auto;`;
        
        this.ui.canvas = document.createElement('canvas');
        this.ui.canvas.className = 'cq-canvas';
        this.ui.canvas.style.cssText = `width:100%; height:100%; image-rendering: pixelated; background: var(--c-bg); cursor: grab;`;
        
        this._on(this.ui.canvas, 'click', (e) => this.onCanvasClick(e));
        this._on(this.ui.canvas, 'wheel', (e) => this.onWheelZoom(e));
        this._on(this.ui.canvas, 'mousedown', (e) => this.onDragStart(e));
        this._on(window, 'mousemove', (e) => this.onDragMove(e));
        this._on(window, 'mouseup', () => this.onDragEnd());
        
        canvasBox.appendChild(this.ui.canvas);
        return canvasBox;
    }
    
    // Helper methods
    buttonStyle() {
        return `flex:1 1 auto; border:1px solid var(--c-border); background: var(--c-bg); color: var(--c-text); cursor:pointer; padding: 6px ${this.deps.MF?this.deps.MF.F:12}px;`;
    }
    
    primaryButtonStyle() {
        return `flex:1 1 auto; border:1px solid var(--c-text); background: var(--c-text); color: var(--c-bg); cursor:pointer; padding: 6px ${this.deps.MF?this.deps.MF.F:12}px; font-weight:bold;`;
    }
    
    formatLabel(v){ return v.toUpperCase().replace(/[-_]/g,' '); }
    
    formatHex(hexString) {
        if (!hexString) return null; 
        let h = String(hexString).trim(); 
        if (!h.startsWith('#')) h = '#'+h;
        if (/^#[0-9A-F]{6}$/i.test(h)) return h.toUpperCase(); 
        if (/^#[0-9A-F]{3}$/i.test(h)) return ('#'+h[1]+h[1]+h[2]+h[2]+h[3]+h[3]).toUpperCase(); 
        return null;
    }
    
    showStatus(msg){ if (this.ui.status) this.ui.status.textContent = msg; }
    
    _on(el, type, fn){ 
        el.addEventListener(type, fn); 
        this._binded.add({ el, type, fn }); 
    }
    
    toggleCustomTools(){ 
        if (!this.ui.customTools) return; 
        const isCustom = this.currentPaletteKey === 'custom'; 
        this.ui.customTools.style.display = isCustom ? 'block' : 'none'; 
    }
    
    getActivePalette(){ 
        const sel = this.currentPaletteKey || 'custom'; 
        if (sel==='custom') return [...this.state.customPaletteArray]; 
        return this.predefinedPalettes[sel] || ['#000000','#FFFFFF']; 
    }
    
    renderPaletteSwatches(paletteArray){ 
        if (!this.ui.paletteSwatchDisplay) return; 
        this.ui.paletteSwatchDisplay.innerHTML=''; 
        const isCustom = (this.currentPaletteKey==='custom'); 
        const unit = (this.deps.MF?this.deps.MF.F:12)*2; 
        
        paletteArray.forEach((hex, idx)=>{ 
            const sw = document.createElement('div');
            sw.className = 'cq-swatch';
            sw.style.cssText = `width:${unit}px; height:${unit}px; border:1px solid var(--c-border); background:${hex}; position:relative; display:flex; align-items:center; justify-content:center;`;
            
            if (isCustom) {
                const overlay = document.createElement('div');
                overlay.className = 'cq-swatch-overlay';
                overlay.textContent = '×';
                overlay.style.cssText = `display:none; font-size:${Math.floor(unit*0.9)}px; line-height:1; color: var(--c-bg); background: var(--c-text); width:${unit}px; height:${unit}px; position:absolute; top:0; left:0; align-items:center; justify-content:center; opacity:0.85;`;
                
                sw.addEventListener('mouseenter', ()=>{ overlay.style.display='flex'; });
                sw.addEventListener('mouseleave', ()=>{ overlay.style.display='none'; });
                this._on(overlay,'click',(e)=>{ 
                    e.stopPropagation(); 
                    if (idx>=0 && idx<this.state.customPaletteArray.length){ 
                        this.state.customPaletteArray.splice(idx,1); 
                        this.renderPaletteSwatches(this.state.customPaletteArray); 
                    } 
                });
                sw.appendChild(overlay);
            }
            this.ui.paletteSwatchDisplay.appendChild(sw); 
        }); 
    }
    
    createPaletteDropdown(F){
        const options = ['custom','1bit','2bit','3bit','3bit-gray','nes','gameboy','primaries','pastel','ggost'];
        const items = options.map(k => ({ label: this.formatLabel(k), value: k }));
        
        this.paletteDropdown = new ComponentLibrary.Dropdown({
            items,
            onSelect: (item) => { 
                this.currentPaletteKey = item.value || item; 
                this.updatePaletteTrigger(); 
                this.toggleCustomTools(); 
                this.renderPaletteSwatches(this.getActivePalette()); 
            },
            onToggle: (open) => { this.updatePaletteTrigger(open); }
        }, { MF: this.deps.MF, Resize: this.deps.Resize });
        
        const el = this.paletteDropdown.render();
        el.style.width = '100%';
        
        if (this.paletteDropdown.triggerElement){
            const t = this.paletteDropdown.triggerElement; 
            t.style.cssText = `width:100%; min-height:${F*2}px; border:1px solid var(--c-border); background: var(--c-bg); color: var(--c-text); text-align:left; padding:0 ${F}px; display:flex; align-items:center; justify-content:space-between;`;
            
            // Build left/right spans for label and symbol
            t.innerHTML = '';
            this.ui.paletteLabel = document.createElement('span');
            this.ui.paletteSymbol = document.createElement('span');
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
    
    createDitherDropdown(F){
        const options = [
            { key: 'none', label: 'NONE' },
            { key: 'blue-noise', label: 'BLUE NOISE' }
        ];
        const items = options.map(o => ({ label: o.label, value: o.key }));
        
        this.ditherDropdown = new ComponentLibrary.Dropdown({
            items,
            onSelect: (item) => { 
                this.currentDitherKey = item.value || item; 
                this.updateDitherTrigger(); 
            },
            onToggle: (open) => { this.updateDitherTrigger(open); }
        }, { MF: this.deps.MF, Resize: this.deps.Resize });
        
        const el = this.ditherDropdown.render();
        el.style.width = '100%';
        
        if (this.ditherDropdown.triggerElement){
            const t = this.ditherDropdown.triggerElement; 
            t.style.cssText = `width:100%; min-height:${F*2}px; border:1px solid var(--c-border); background: var(--c-bg); color: var(--c-text); text-align:left; padding:0 ${F}px; display:flex; align-items:center; justify-content:space-between;`;
            
            t.innerHTML = '';
            this.ui.ditherLabel = document.createElement('span');
            this.ui.ditherSymbol = document.createElement('span');
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
    
    updatePaletteTrigger(open=false){ 
        if (!this.paletteDropdown || !this.paletteDropdown.triggerElement) return; 
        const label = this.formatLabel(this.currentPaletteKey); 
        if (this.ui.paletteLabel) this.ui.paletteLabel.textContent = label; 
        if (this.ui.paletteSymbol) this.ui.paletteSymbol.textContent = open ? '−' : '+'; 
    }
    
    updateDitherTrigger(open=false){ 
        if (!this.ditherDropdown || !this.ditherDropdown.triggerElement) return; 
        const label = this.formatLabel(this.currentDitherKey); 
        if (this.ui.ditherLabel) this.ui.ditherLabel.textContent = label; 
        if (this.ui.ditherSymbol) this.ui.ditherSymbol.textContent = open ? '−' : '+'; 
    }
    
    updateLayout(F){ 
        if (!this.container) return; 
        const container = document.querySelector('.cq-container'); 
        if (!container) return; 
        const viewport = window.innerWidth || document.documentElement.clientWidth || 1024; 
        if (viewport < 700) { 
            container.style.gridTemplateColumns = `1fr`; 
        } else { 
            container.style.gridTemplateColumns = `${F*36}px 1fr`; 
        } 
    }
    
    // Processing methods (simplified stubs for now)
    handleFileSelected(e){ 
        const file = e.target.files && e.target.files[0]; 
        if (!file) return; 
        this.state.originalFileName = file.name.replace(/\.[^/.]+$/, ''); 
        this.showStatus('Image loading...');
    }
    
    loadBlueNoise(){
        try {
            this.showStatus('Blue noise ready');
            this.ui.processBtn.disabled = (this.state.originalImageData===null);
        } catch(e) {
            this.showStatus('Blue noise unavailable');
        }
    }
    
    resetAdjustments(){ 
        if (!this.ui.gamma || !this.ui.contrast || !this.ui.saturation) return; 
        this.ui.gamma.value='1.0'; 
        this.ui.contrast.value='100'; 
        this.ui.saturation.value='100'; 
        this.updateAdjustmentLabels(); 
        this.updatePreview(); 
        this.showStatus('Adjustments reset'); 
    }
    
    updateAdjustmentLabels(){}
    updatePreview(){}
    processImage(){ this.showStatus('Processing...'); }
    undoProcess(){ this.showStatus('Undo...'); }
    downloadImage(){ this.showStatus('Download...'); }
    toggleEyedropper(){ this.showStatus('Eyedropper toggled'); }
    addCustomColour(){ 
        const hex = this.formatHex(this.ui.customHex?.value); 
        if (hex){ 
            if (!this.state.customPaletteArray.includes(hex)){ 
                this.state.customPaletteArray.push(hex); 
                this.renderPaletteSwatches(this.state.customPaletteArray); 
                this.ui.customHex.style.borderColor=''; 
                this.showStatus(`${hex} added`); 
            } else { 
                this.showStatus(`${hex} already in palette`); 
            } 
        } else { 
            this.showStatus('Invalid hex'); 
            if (this.ui.customHex) this.ui.customHex.style.borderColor='var(--c-accent)'; 
        } 
    }
    onPaletteFileSelected(e){ this.showStatus('Palette file selected'); }
    
    // Event handlers (simplified)
    onWheelZoom(e){ e.preventDefault(); }
    onDragStart(e){ this.view.dragging = true; this.view.lastX = e.clientX; this.view.lastY = e.clientY; }
    onDragMove(e){ 
        if (!this.view.dragging) return; 
        const dx = e.clientX - this.view.lastX; 
        const dy = e.clientY - this.view.lastY; 
        this.view.lastX = e.clientX; 
        this.view.lastY = e.clientY; 
        this.view.panX += dx; 
        this.view.panY += dy; 
    }
    onDragEnd(){ this.view.dragging = false; }
    onCanvasClick(event){}
    onZoomInputChange(){}
    onZoomStep(delta){}
    
    // Resize handling
    subscribeToResize() {
        if (window.ResizeManager && window.ResizeManager.subscribe) {
            window.ResizeManager.subscribe(this.onResize);
        } else {
            window.addEventListener('resize', this.onResize);
            this._binded.add({ el: window, type: 'resize', fn: this.onResize });
        }
    }
    
    // Cleanup
    destroy() {
        // Unsubscribe from resize if using ResizeManager
        if (window.ResizeManager && window.ResizeManager.unsubscribe && this.onResize) {
            window.ResizeManager.unsubscribe(this.onResize);
        }
        
        for (const instance of this.componentInstances) {
            if (instance && typeof instance.destroy === 'function') {
                instance.destroy();
            }
        }
        this.componentInstances = [];
        
        for (const b of this._binded) { 
            const { el, type, fn } = b; 
            try { 
                el.removeEventListener(type, fn); 
            } catch(_) {} 
        } 
        this._binded.clear(); 
    }
}

// Export for window global access (like PolygonCalculator)
// Maintain ColorQuantizer name for compatibility with tools_section.js
window.ColorQuantizer = ColourQuantizer;
