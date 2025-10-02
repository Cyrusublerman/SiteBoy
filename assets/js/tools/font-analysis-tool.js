/**
 * Font Analysis Tool - SiteBoy Framework
 * 
 * COMBINED TOOL - Merges font-size-comparison + font-dimension-finder
 * Features:
 * - Dynamic Google Fonts loading and analysis
 * - Multi-font comparison with scaling controls  
 * - Detailed metrics visualization on canvas
 * - Real-time measurements and ratios
 * - VGA aesthetic with F=12px mathematical foundation
 * 
 * @version 1.0.0 - Combined Tool
 * @dependencies ComponentLibrary, GoogleFontsLoader
 */

class FontAnalysisTool {
    constructor(container, deps = {}) {
        this.container = container;
        this.deps = deps;
        this.componentInstances = [];
        
        // Tool state
        this.state = {
            // Analysis mode: 'comparison' | 'metrics' | 'both'
            mode: 'both',
            // Sample text for analysis
            sampleText: 'The quick brown fox jumps over the lazy dog',
            // Base font size for all measurements
            fontSize: 48,
            // Letter for detailed metrics
            letter: 'A',
            // Fonts being analyzed (up to 3)
            fonts: [
                {
                    family: 'Atkinson Hyperlegible Mono',
                    loaded: true,
                    display: 'inline-block',
                    scaleX: 100,
                    scaleY: 100,
                    letterSpacing: 0,
                    wordSpacing: 0,
                    lineHeight: 1.2,
                    individualSize: 48
                },
                {
                    family: 'Roboto',
                    loaded: false,
                    display: 'inline-block',
                    scaleX: 100,
                    scaleY: 100,
                    letterSpacing: 0,
                    wordSpacing: 0,
                    lineHeight: 1.2,
                    individualSize: 48
                },
                {
                    family: 'Roboto Mono',
                    loaded: false,
                    display: 'inline-block',
                    scaleX: 100,
                    scaleY: 100,
                    letterSpacing: 0,
                    wordSpacing: 0,
                    lineHeight: 1.2,
                    individualSize: 48
                }
            ],
            // Selected font for detailed metrics
            selectedFont: 'Atkinson Hyperlegible Mono'
        };

        // UI elements
        this.canvasElement = null;
        this.canvasContext = null;
        this.metricsContainer = null;
        this.comparisonContainer = null;
        
        // Font loader
        this.fontLoader = window.googleFontsLoader;
        
        // Debounced update function
        this.debouncedUpdate = this.debounce(() => this.updateDisplay(), 100);
    }

    render() {
        this.destroy();
        
        // Create clean 3-column layout for the entire page
        this.renderMainLayout();
        
        // Add debug logging
        console.log('🔤 FontAnalysisTool initialized with fonts:', this.state.fonts);
        
        // Load initial fonts and display
        this.loadInitialFonts();
    }

    renderMainLayout() {
        const F = 12; // F base size - SiteBoy mathematical foundation
        
        // Title
        const title = new ComponentLibrary.Heading({
            level: 1,
            content: 'FONT ANALYSIS'
        });
        this.componentInstances.push(title);
        this.container.appendChild(title.render());
        
        // Global controls row following polygon calculator pattern
        this.renderGlobalControls(F);
        
        // Add responsive styles like polygon calculator
        const fontResponsiveStyle = document.createElement('style');
        fontResponsiveStyle.id = 'font-analysis-responsive-styles';
        fontResponsiveStyle.textContent = `
            @media (max-width: 1023px) {
                .font-analysis-container {
                    grid-template-columns: 1fr !important;
                    grid-template-rows: auto auto auto !important;
                    height: auto !important;
                }
                .font-column-0, .font-column-1, .font-column-2 {
                    border-right: 1px solid var(--c-border) !important;
                    height: auto !important;
                }
            }
        `;
        
        const existing = document.querySelector('#font-analysis-responsive-styles');
        if (existing) existing.remove();
        document.head.appendChild(fontResponsiveStyle);
        
        // Main 3-column layout with shared borders (NO GAPS!)
        const container = document.createElement('div');
        container.className = 'font-analysis-container';
        container.style.cssText = `
            display: grid; 
            grid-template-columns: 1fr 1fr 1fr; 
            grid-template-rows: 1fr;
            align-items: stretch;
            gap: 0;
            margin: 0;
            min-height: 600px;
            outline: 1px solid var(--c-border);
        `;
        
        // Create 3 font columns manually like polygon calculator structure
        for (let i = 0; i < 3; i++) {
            const column = this.createFontColumn(i, F);
            container.appendChild(column);
        }
        
        this.container.appendChild(container);
        
        // Make sure there's no gap between the main container and comparison ratios
        container.style.marginBottom = '0';
        
        this.renderComparisonRatios(F);
    }
    
    renderGlobalControls(F) {
        // Global controls with shared borders pattern
        const controlsContainer = document.createElement('div');
        controlsContainer.style.cssText = `
            display: grid; 
            grid-template-columns: 1fr 1fr 1fr;
            gap: 0;
            margin: 0;
            outline: 1px solid var(--c-border);
        `;
        
        // Sample text input with polygon-style increment/decrement
        this.addGlobalInputRow(controlsContainer, 'SAMPLE TEXT:', 'sampleText', this.state.sampleText, { type: 'text' }, F, 0);
        this.addGlobalInputRow(controlsContainer, 'BASE SIZE:', 'fontSize', this.state.fontSize, { type: 'number', min: 8, max: 200, step: 1 }, F, 1);
        this.addGlobalInputRow(controlsContainer, 'LETTER:', 'letter', this.state.letter, { type: 'text', maxLength: 1 }, F, 2);
        
        this.container.appendChild(controlsContainer);
    }
    
    addGlobalInputRow(container, label, id, value, options, F, index) {
        const cell = document.createElement('div');
        // Shared border pattern - only right borders to create dividers
        let borderStyle = '';
        if (index < 2) {
            borderStyle = 'border-right: 1px solid var(--c-border);';
        }
        
        cell.style.cssText = `
            padding: ${F/2}px;
            background: var(--c-bg);
            ${borderStyle}
            display: flex;
            flex-direction: column;
        `;
        
        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        labelEl.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F}px;
            color: var(--c-text);
            margin-bottom: ${F/2}px;
            text-transform: uppercase;
        `;
        
        if (options.type === 'number') {
            // Use polygon-style increment/decrement for numbers
            const inputGroup = this.createIncrementInput(id, value, options, F);
            cell.appendChild(labelEl);
            cell.appendChild(inputGroup);
        } else {
            // Regular text input
            const input = document.createElement('input');
            input.type = options.type;
            input.value = value;
            if (options.maxLength) input.maxLength = options.maxLength;
            
            input.style.cssText = `
                font-family: 'Atkinson Hyperlegible Mono', monospace;
                font-size: ${F}px;
                background: var(--c-bg);
                color: var(--c-text);
                border: 1px solid var(--c-border);
                padding: ${F/2}px;
                width: 100%;
                box-sizing: border-box;
                ${options.maxLength === 1 ? 'text-align: center;' : ''}
            `;
            
            input.addEventListener('input', (e) => {
                this.state[id] = e.target.value;
                this.updateAllColumns();
            });
            
            cell.appendChild(labelEl);
            cell.appendChild(input);
        }
        
        container.appendChild(cell);
    }
    
    createIncrementInput(id, value, options, F) {
        // Exact copy of polygon calculator increment/decrement pattern
        const inputGroup = document.createElement('div');
        inputGroup.style.cssText = `display: flex; align-items: center;`;
        
        // Minus button
        const minusBtn = document.createElement('button');
        minusBtn.textContent = '−';
        minusBtn.style.cssText = `
            width: ${F*2}px;
            height: ${F*2}px;
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            cursor: pointer;
            font-family: 'Space Mono', monospace;
            font-size: ${F}px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        // Input field
        const input = document.createElement('input');
        input.type = 'number';
        input.value = value;
        input.min = options.min || 0;
        input.max = options.max || 999;
        input.step = options.step || 1;
        input.style.cssText = `
            flex: 1;
            height: ${F*2}px;
            border: 1px solid var(--c-border);
            border-left: none;
            border-right: none;
            background: var(--c-bg);
            color: var(--c-text);
            text-align: center;
            font-family: 'Space Mono', monospace;
            font-size: ${F}px;
            padding: 0;
        `;
        
        // Plus button
        const plusBtn = document.createElement('button');
        plusBtn.textContent = '+';
        plusBtn.style.cssText = `
            width: ${F*2}px;
            height: ${F*2}px;
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            cursor: pointer;
            font-family: 'Space Mono', monospace;
            font-size: ${F}px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        // Event listeners for +/- buttons
        minusBtn.addEventListener('click', () => {
            const currentValue = parseFloat(input.value) || 0;
            const step = options.step || 1;
            const newValue = Math.max(options.min || 0, currentValue - step);
            input.value = newValue;
            this.state[id] = newValue;
            this.updateAllColumns();
        });
        
        plusBtn.addEventListener('click', () => {
            const currentValue = parseFloat(input.value) || 0;
            const step = options.step || 1;
            const newValue = Math.min(options.max || 999, currentValue + step);
            input.value = newValue;
            this.state[id] = newValue;
            this.updateAllColumns();
        });
        
        input.addEventListener('input', (e) => {
            this.state[id] = parseFloat(e.target.value) || 0;
            this.updateAllColumns();
        });
        
        inputGroup.appendChild(minusBtn);
        inputGroup.appendChild(input);
        inputGroup.appendChild(plusBtn);
        
        return inputGroup;
    }

    renderControlsHeader(F) {
        // Controls header using ComponentLibrary.Panel with proper grid class
        const controlsHeader = new ComponentLibrary.Panel({
            className: 'controls-header',
            content: ''
        }, this.deps);
        this.componentInstances.push(controlsHeader);

        // Left control: Sample Text
        const textControl = this.createControlCell('SAMPLE TEXT', 'text', this.state.sampleText, (value) => {
            this.state.sampleText = value;
            this.updateAllColumns();
        }, F, 0);

        // Middle control: Base Size
        const sizeControl = this.createControlCell('BASE SIZE', 'number', this.state.fontSize, (value) => {
            this.state.fontSize = parseInt(value);
            // Update individual sizes that match current base
            for (let i = 0; i < 3; i++) {
                if (this.state.fonts[i] && this.state.fonts[i].individualSize === this.state.fontSize) {
                    this.state.fonts[i].individualSize = parseInt(value);
                }
            }
            this.updateAllColumns();
        }, F, 1);

        // Right control: Letter
        const letterControl = this.createControlCell('LETTER', 'text', this.state.letter, (value) => {
            this.state.letter = value || 'A';
            this.updateAllColumns();
        }, F, 2, true);

        const controlsElement = controlsHeader.render();
        controlsElement.appendChild(textControl);
        controlsElement.appendChild(sizeControl);
        controlsElement.appendChild(letterControl);
        this.container.appendChild(controlsElement);
    }

    // Optimized helper methods
    createControl(label, type, value, onChange, isLetter = false) {
        const opts = { type, value, label, onChange };
        if (type === 'number') { opts.min = 8; opts.max = 200; }
        if (isLetter) opts.maxLength = 1;
        const input = new ComponentLibrary.Input(opts, this.deps);
        this.componentInstances.push(input);
        return { content: input.render() };
    }
    
    createSection(index) {
        const section = new ComponentLibrary.Panel({ className: 'font-section' }, this.deps);
        this.componentInstances.push(section);
        const el = section.render();
        el.appendChild(this.createEl('font-header', [this.createSelector(index), this.createSizeInput(index)]));
        el.appendChild(this.createEl('font-sample', [this.createSampleText(index)]));
        el.appendChild(this.createEl('font-canvas', [this.createEl('section-title', 'LETTER ANALYSIS'), this.createCanvas(index)]));
        el.appendChild(this.createEl('font-charset', [this.createEl('section-title', 'CHARACTER SET'), this.createCharset(index)]));
        return el;
    }
    
    createEl(className, children) {
        const el = document.createElement('div');
        el.className = className;
        if (typeof children === 'string') el.textContent = children;
        else if (Array.isArray(children)) children.forEach(c => el.appendChild(c));
        return el;
    }
    
    createSelector(index) {
        const fonts = this.fontLoader.getPopularFonts();
        const select = new ComponentLibrary.Select({
            options: fonts.map(f => ({ value: f, label: f })),
            value: this.state.fonts[index]?.family || fonts[0],
            onChange: v => this.changeFontInColumn(index, v)
        }, this.deps);
        this.componentInstances.push(select);
        return select.render();
    }
    
    createSizeInput(index) {
        const input = new ComponentLibrary.Input({
            type: 'number', min: 8, max: 200,
            value: this.state.fonts[index]?.individualSize || this.state.fontSize,
            onChange: v => this.updateFontSizeInColumn(index, +v)
        }, this.deps);
        this.componentInstances.push(input);
        return input.render();
    }
    
    createSampleText(index) {
        const el = document.createElement('div');
        el.className = `sample-text-${index}`;
        return el;
    }
    
    createCanvas(index) {
        const container = this.createEl('canvas-container');
        const canvas = document.createElement('canvas');
        canvas.className = `metrics-canvas metrics-canvas-${index}`;
        canvas.width = canvas.height = 400;
        container.appendChild(canvas);
        return container;
    }
    
    createCharset(index) {
        const el = document.createElement('div');
        el.className = `charset-display charset-display-${index}`;
        return el;
    }

    createControlCell(label, type, value, onChange, F, index, isLetter = false) {
        // Create panel container using ComponentLibrary
        const cellClass = `control-cell control-cell-${index}`;
        const cell = new ComponentLibrary.Panel({
            className: cellClass,
            content: ''
        }, this.deps);
        
        // Create input using ComponentLibrary.Input
        const inputOptions = {
            type: type,
            value: value,
            label: label,
            onChange: onChange,
            className: isLetter ? 'letter-input' : 'standard-input'
        };
        
        if (type === 'number') {
            inputOptions.min = 8;
            inputOptions.max = 200;
        }
        if (isLetter) {
            inputOptions.maxLength = 1;
        }
        
        const input = new ComponentLibrary.Input(inputOptions, this.deps);
        this.componentInstances.push(input);
        
        const cellElement = cell.render();
        cellElement.appendChild(input.render());
        
        return cellElement;
    }

    renderComparisonRatios(F) {
        // Comparison ratios section following polygon calculator pattern
        const ratiosContainer = document.createElement('div');
        ratiosContainer.className = 'comparison-ratios';
        ratiosContainer.style.cssText = `
            margin: 0;
            padding: ${F/2}px;
            border: 1px solid var(--c-border);
            border-top: none;
            background: var(--c-bg);
        `;

        const title = document.createElement('h2');
        title.textContent = 'FONT COMPARISON RATIOS';
        title.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F}px;
            color: var(--c-text);
            margin: 0 0 ${F/2}px 0;
            text-transform: uppercase;
            border-bottom: 1px solid var(--c-border);
            padding-bottom: ${F/2}px;
        `;

        const ratiosGrid = document.createElement('div');
        ratiosGrid.className = 'ratios-grid';
        ratiosGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: ${F}px;
        `;

        ratiosContainer.appendChild(title);
        ratiosContainer.appendChild(ratiosGrid);
        this.container.appendChild(ratiosContainer);
        
        // Store reference for updates
        this.ratiosGrid = ratiosGrid;
    }

    renderModeSelector() {
        const modeGrid = new ComponentLibrary.Grid({
            items: [
                {
                    type: 'button',
                    props: {
                        text: 'COMPARISON',
                        onClick: () => this.setMode('comparison'),
                        variant: this.state.mode === 'comparison' ? 'primary' : 'secondary'
                    }
                },
                {
                    type: 'button', 
                    props: {
                        text: 'METRICS',
                        onClick: () => this.setMode('metrics'),
                        variant: this.state.mode === 'metrics' ? 'primary' : 'secondary'
                    }
                },
                {
                    type: 'button',
                    props: {
                        text: 'BOTH',
                        onClick: () => this.setMode('both'),
                        variant: this.state.mode === 'both' ? 'primary' : 'secondary'
                    }
                }
            ],
            cols: 3
        });
        this.componentInstances.push(modeGrid);
        this.container.appendChild(modeGrid.render());

        const spacing = new ComponentLibrary.Spacing({ size: 'm' });
        this.componentInstances.push(spacing);
        this.container.appendChild(spacing.render());
    }

    renderGlobalControls() {
        // Global controls container
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'font-analysis-controls';
        controlsContainer.style.cssText = `
            display: grid; 
            grid-template-columns: 1fr 1fr;
            gap: calc(var(--f) * 2);
            margin-bottom: calc(var(--f) * 3);
            padding: calc(var(--f) * 2);
            outline: var(--outline-width) solid var(--c-border);
        `;

        // Sample text input
        const textLabel = document.createElement('label');
        textLabel.textContent = 'SAMPLE TEXT:';
        textLabel.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: var(--f);
            color: var(--vga-white);
            text-transform: uppercase;
            margin-bottom: calc(var(--f) / 2);
            display: block;
            font-weight: 700;
        `;

        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.value = this.state.sampleText;
        textInput.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: var(--f);
            background: var(--vga-black);
            color: var(--vga-white);
            border: none;
            outline: var(--outline-width) solid var(--vga-gray);
            padding: calc(var(--f) / 2);
            width: 100%;
        `;
        textInput.addEventListener('input', (e) => {
            this.state.sampleText = e.target.value;
            this.debouncedUpdate();
        });

        // Font size input
        const sizeLabel = document.createElement('label');
        sizeLabel.textContent = 'FONT SIZE (PX):';
        sizeLabel.style.cssText = textLabel.style.cssText;

        const sizeInput = document.createElement('input');
        sizeInput.type = 'number';
        sizeInput.value = this.state.fontSize;
        sizeInput.min = '8';
        sizeInput.max = '200';
        sizeInput.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: var(--f);
            background: var(--vga-black);
            color: var(--vga-white);
            border: none;
            outline: var(--outline-width) solid var(--vga-gray);
            padding: calc(var(--f) / 2);
            width: 100%;
        `;
        sizeInput.addEventListener('input', (e) => {
            this.state.fontSize = parseInt(e.target.value);
            this.debouncedUpdate();
        });

        // Letter input (for metrics)
        const letterLabel = document.createElement('label');
        letterLabel.textContent = 'METRICS LETTER:';
        letterLabel.style.cssText = textLabel.style.cssText;

        const letterInput = document.createElement('input');
        letterInput.type = 'text';
        letterInput.value = this.state.letter;
        letterInput.maxLength = '1';
        letterInput.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: var(--f);
            background: var(--vga-black);
            color: var(--vga-white);
            border: none;
            outline: var(--outline-width) solid var(--vga-gray);
            padding: calc(var(--f) / 2);
            width: 100%;
            text-align: center;
        `;
        letterInput.addEventListener('input', (e) => {
            this.state.letter = e.target.value || 'A';
            this.debouncedUpdate();
        });

        // Assemble controls
        const leftColumn = document.createElement('div');
        leftColumn.appendChild(textLabel);
        leftColumn.appendChild(textInput);

        const rightColumn = document.createElement('div');
        rightColumn.style.cssText = `display: grid; grid-template-columns: 1fr 1fr; gap: calc(var(--f));`;
        
        const sizeGroup = document.createElement('div');
        sizeGroup.appendChild(sizeLabel);
        sizeGroup.appendChild(sizeInput);
        
        const letterGroup = document.createElement('div');
        letterGroup.appendChild(letterLabel);
        letterGroup.appendChild(letterInput);

        rightColumn.appendChild(sizeGroup);
        rightColumn.appendChild(letterGroup);

        controlsContainer.appendChild(leftColumn);
        controlsContainer.appendChild(rightColumn);
        this.container.appendChild(controlsContainer);
    }

    renderFontManagement() {
        // Font management header
        const fontHeader = new ComponentLibrary.Heading({
            level: 2,
            content: 'FONT MANAGEMENT'
        });
        this.componentInstances.push(fontHeader);
        this.container.appendChild(fontHeader.render());

        // Add font section
        this.renderAddFontSection();

        // Current fonts list
        this.renderCurrentFonts();
    }

    renderAddFontSection() {
        const addContainer = document.createElement('div');
        addContainer.className = 'add-font-section';
        addContainer.style.cssText = `
            display: grid;
            grid-template-columns: 2fr 1fr auto;
            gap: calc(var(--f));
            align-items: end;
            margin-bottom: calc(var(--f) * 2);
            padding: calc(var(--f) * 2);
            outline: var(--outline-width) solid var(--c-border);
        `;

        // Font selector (popular fonts dropdown)
        const fontSelect = document.createElement('select');
        fontSelect.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: var(--f);
            background: var(--c-bg);
            color: var(--c-text);
            border: none;
            outline: var(--outline-width) solid var(--c-border);
            padding: calc(var(--f) / 2);
        `;

        // Add popular fonts to selector
        const popularFonts = this.fontLoader.getPopularFonts();
        popularFonts.forEach(font => {
            const option = document.createElement('option');
            option.value = font;
            option.textContent = this.fontLoader.getFontDisplayName(font);
            fontSelect.appendChild(option);
        });

        // Custom font input
        const customInput = document.createElement('input');
        customInput.type = 'text';
        customInput.placeholder = 'Custom font name...';
        customInput.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: var(--f);
            background: var(--c-bg);
            color: var(--c-text);
            border: none;
            outline: var(--outline-width) solid var(--c-border);
            padding: calc(var(--f) / 2);
        `;

        // Add font button
        const addButton = document.createElement('button');
        addButton.textContent = 'ADD FONT';
        addButton.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: var(--f);
            background: var(--c-bg);
            color: var(--c-text);
            border: none;
            outline: var(--outline-width) solid var(--c-border);
            padding: calc(var(--f) / 2) var(--f);
            cursor: pointer;
            text-transform: uppercase;
        `;
        addButton.addEventListener('click', () => this.addFont(customInput.value || fontSelect.value));

        addContainer.appendChild(fontSelect);
        addContainer.appendChild(customInput);
        addContainer.appendChild(addButton);
        this.container.appendChild(addContainer);
    }

    renderCurrentFonts() {
        // Container for current fonts
        this.fontsContainer = document.createElement('div');
        this.fontsContainer.className = 'current-fonts';
        this.container.appendChild(this.fontsContainer);
        
        this.updateFontsDisplay();
    }

    renderAnalysisDisplay() {
        // Analysis container
        this.analysisContainer = document.createElement('div');
        this.analysisContainer.className = 'analysis-display';
        this.analysisContainer.style.cssText = `
            margin-top: calc(var(--f) * 3);
        `;

        // Comparison section
        if (this.state.mode === 'comparison' || this.state.mode === 'both') {
            this.renderComparisonSection();
        }

        // Metrics section  
        if (this.state.mode === 'metrics' || this.state.mode === 'both') {
            this.renderMetricsSection();
        }

        this.container.appendChild(this.analysisContainer);
    }

    renderComparisonSection() {
        const comparisonHeader = new ComponentLibrary.Heading({
            level: 2,
            content: 'FONT COMPARISON'
        });
        this.componentInstances.push(comparisonHeader);
        this.analysisContainer.appendChild(comparisonHeader.render());

        // Main comparison grid - 3 columns for up to 3 fonts
        this.comparisonContainer = document.createElement('div');
        this.comparisonContainer.className = 'font-comparison-grid';
        this.comparisonContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: calc(var(--f) * 2);
            margin-bottom: calc(var(--f) * 3);
        `;
        this.analysisContainer.appendChild(this.comparisonContainer);

        // Comparison metrics summary
        this.comparisonMetrics = document.createElement('div');
        this.comparisonMetrics.className = 'comparison-metrics';
        this.comparisonMetrics.style.cssText = `
            padding: calc(var(--f) * 2);
            outline: var(--outline-width) solid var(--c-border);
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: var(--f);
            margin-bottom: calc(var(--f) * 2);
            background: var(--c-bg);
        `;
        this.analysisContainer.appendChild(this.comparisonMetrics);
    }

    renderMetricsSection() {
        const metricsHeader = new ComponentLibrary.Heading({
            level: 2,
            content: 'DETAILED METRICS'
        });
        this.componentInstances.push(metricsHeader);
        this.analysisContainer.appendChild(metricsHeader.render());

        // Canvas for metrics visualization
        this.canvasElement = document.createElement('canvas');
        this.canvasElement.style.cssText = `
            outline: var(--outline-width) solid var(--c-border);
            display: block;
            margin-bottom: calc(var(--f) * 2);
            background: var(--c-bg);
        `;
        this.canvasContext = this.canvasElement.getContext('2d');
        this.analysisContainer.appendChild(this.canvasElement);

        // Metrics data display
        this.metricsContainer = document.createElement('div');
        this.metricsContainer.className = 'metrics-data';
        this.metricsContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: calc(var(--f) * 2);
        `;
        this.analysisContainer.appendChild(this.metricsContainer);
    }

    // Font management methods
    async addFont(fontFamily) {
        if (!fontFamily || this.state.fonts.some(f => f.family === fontFamily)) {
            return;
        }

        if (this.state.fonts.length >= 3) {
            alert('Maximum 3 fonts allowed for comparison');
            return;
        }

        try {
            // Show loading state
            this.showLoadingState(fontFamily);
            
            // Load the font
            const loadedFamily = await this.fontLoader.loadFont(fontFamily);
            
            // Add to state
            this.state.fonts.push({
                family: loadedFamily,
                loaded: true,
                display: 'inline-block',
                scaleX: 100,
                scaleY: 100,
                letterSpacing: 0,
                wordSpacing: 0,
                lineHeight: 1.2
            });

            // Update displays
            this.updateFontsDisplay();
            this.updateDisplay();
            
        } catch (error) {
            console.error('Failed to load font:', error);
            alert(`Failed to load font: ${fontFamily}`);
        }
    }

    removeFont(index) {
        if (this.state.fonts.length > 1) {
            this.state.fonts.splice(index, 1);
            this.updateFontsDisplay();
            this.updateDisplay();
        }
    }

    updateFontProperty(index, property, value) {
        if (this.state.fonts[index]) {
            this.state.fonts[index][property] = value;
            this.debouncedUpdate();
        }
    }

    // Display update methods
    updateFontsDisplay() {
        if (!this.fontsContainer) return;

        this.fontsContainer.innerHTML = '';

        this.state.fonts.forEach((font, index) => {
            const fontContainer = this.createFontControls(font, index);
            this.fontsContainer.appendChild(fontContainer);
        });
    }

    createFontControls(font, index) {
        const container = document.createElement('div');
        container.style.cssText = `
            margin-bottom: calc(var(--f) * 2);
            padding: calc(var(--f) * 2);
            outline: var(--outline-width) solid var(--c-border);
        `;

        // Font header with remove button
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: calc(var(--f));
        `;

        const title = document.createElement('h3');
        title.textContent = font.family.toUpperCase();
        title.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: var(--f);
            margin: 0;
        `;

        const removeButton = document.createElement('button');
        removeButton.textContent = '✕';
        removeButton.style.cssText = `
            background: none;
            border: none;
            color: var(--vga-red);
            font-size: calc(var(--f) * 1.2);
            cursor: pointer;
            padding: 0;
            width: calc(var(--f) * 2);
            height: calc(var(--f) * 2);
        `;
        removeButton.addEventListener('click', () => this.removeFont(index));

        header.appendChild(title);
        if (this.state.fonts.length > 1) {
            header.appendChild(removeButton);
        }

        // Controls grid
        const controlsGrid = document.createElement('div');
        controlsGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: calc(var(--f));
        `;

        // Create controls
        const controls = [
            { label: 'Display', type: 'select', prop: 'display', options: ['inline-block', 'inline', 'block'] },
            { label: 'Scale X (%)', type: 'number', prop: 'scaleX', min: 10, max: 200, step: 1 },
            { label: 'Scale Y (%)', type: 'number', prop: 'scaleY', min: 10, max: 200, step: 1 },
            { label: 'Letter Spacing', type: 'number', prop: 'letterSpacing', min: -5, max: 20, step: 0.1 },
            { label: 'Word Spacing', type: 'number', prop: 'wordSpacing', min: -5, max: 20, step: 0.1 },
            { label: 'Line Height', type: 'number', prop: 'lineHeight', min: 0.5, max: 3, step: 0.1 }
        ];

        controls.forEach(control => {
            const group = this.createControlGroup(control, font[control.prop], (value) => {
                this.updateFontProperty(index, control.prop, value);
            });
            controlsGrid.appendChild(group);
        });

        container.appendChild(header);
        container.appendChild(controlsGrid);
        return container;
    }

    createControlGroup(control, value, onChange) {
        const group = document.createElement('div');
        
        const label = document.createElement('label');
        label.textContent = control.label.toUpperCase() + ':';
        label.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: calc(var(--f) * 0.8);
            color: var(--c-text);
            display: block;
            margin-bottom: calc(var(--f) / 4);
        `;

        let input;
        if (control.type === 'select') {
            input = document.createElement('select');
            control.options.forEach(option => {
                const opt = document.createElement('option');
                opt.value = option;
                opt.textContent = option;
                opt.selected = option === value;
                input.appendChild(opt);
            });
        } else {
            input = document.createElement('input');
            input.type = control.type;
            input.value = value;
            if (control.min !== undefined) input.min = control.min;
            if (control.max !== undefined) input.max = control.max;
            if (control.step !== undefined) input.step = control.step;
        }

        input.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: calc(var(--f) * 0.8);
            background: var(--c-bg);
            color: var(--c-text);
            border: none;
            outline: var(--outline-width) solid var(--c-border);
            padding: calc(var(--f) / 4);
            width: 100%;
        `;

        input.addEventListener('input', (e) => {
            const val = control.type === 'number' ? parseFloat(e.target.value) : e.target.value;
            onChange(val);
        });

        group.appendChild(label);
        group.appendChild(input);
        return group;
    }

    // Analysis and measurement methods
    updateDisplay() {
        if (this.state.mode === 'comparison' || this.state.mode === 'both') {
            this.updateComparison();
        }
        
        if (this.state.mode === 'metrics' || this.state.mode === 'both') {
            this.updateMetrics();
        }
    }

    updateComparison() {
        if (!this.comparisonContainer) return;

        console.log('🔤 updateComparison called with fonts:', this.state.fonts.length);

        // Clear previous samples
        this.comparisonContainer.innerHTML = '';

        // Show all fonts (load state doesn't matter for display)
        const measurements = this.state.fonts.map((font, index) => {
            console.log(`🔤 Processing font ${index}: ${font.family}`);
            const measurement = this.measureFont(font);
            const sample = this.createFontSample(font, measurement, index);
            this.comparisonContainer.appendChild(sample);
            return { font, measurement };
        });

        // If we have fewer than 3 fonts, show empty slots
        for (let i = this.state.fonts.length; i < 3; i++) {
            console.log(`🔤 Creating empty slot ${i}`);
            const emptySlot = this.createEmptyFontSlot(i);
            this.comparisonContainer.appendChild(emptySlot);
        }

        // Update comparison metrics
        if (measurements.length > 0) {
            this.updateComparisonMetrics(measurements);
        }
        
        console.log('🔤 updateComparison completed');
    }

    measureFont(font) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Use EXACT font size - NO SCALING
        const fontSize = font.individualSize || this.state.fontSize;
        ctx.font = `${fontSize}px "${font.family}"`;
        
        // Measure the specific letter like reference implementation
        const letterMetrics = ctx.measureText(this.state.letter);
        
        // Extract raw measurements directly like reference
        const ascent = Math.abs(letterMetrics.fontBoundingBoxAscent || 0);
        const descent = Math.abs(letterMetrics.fontBoundingBoxDescent || 0);
        const actualWidth = letterMetrics.actualBoundingBoxRight - letterMetrics.actualBoundingBoxLeft;
        
        // Calculate additional metrics like reference
        const hMetrics = ctx.measureText('H');
        const xMetrics = ctx.measureText('x');
        
        return {
            fontFamily: font.family,
            fontSize: fontSize, // EXACT size, no scaling
            
            // Core measurements from reference
            ascent: ascent,
            descent: descent,
            xHeight: xMetrics.actualBoundingBoxAscent || 0,
            capitalHeight: hMetrics.actualBoundingBoxAscent || 0,
            leftBearing: letterMetrics.actualBoundingBoxLeft || 0,
            rightBearing: letterMetrics.width - (letterMetrics.actualBoundingBoxRight || letterMetrics.width),
            width: actualWidth,
            advance: letterMetrics.width,
            
            // Bounding box details
            actualBoundingBoxAscent: letterMetrics.actualBoundingBoxAscent || 0,
            actualBoundingBoxDescent: letterMetrics.actualBoundingBoxDescent || 0,
            actualBoundingBoxLeft: letterMetrics.actualBoundingBoxLeft || 0,
            actualBoundingBoxRight: letterMetrics.actualBoundingBoxRight || letterMetrics.width,
            
            // Legacy properties for compatibility
            emBoxWidth: letterMetrics.width,
            avgCharWidth: letterMetrics.width,
            totalWidth: letterMetrics.width
        };
    }

    createFontSample(font, measurement, index) {
        const sample = document.createElement('div');
        sample.className = 'font-sample-card';
        sample.style.cssText = `
            padding: calc(var(--f) * 2);
            outline: var(--outline-width) solid var(--c-border);
            background: var(--c-bg);
            display: flex;
            flex-direction: column;
            min-height: 400px;
        `;

        // Font header with controls
        const header = this.createFontSampleHeader(font, index);
        sample.appendChild(header);

        // Sample text display
        const textDisplay = this.createFontTextDisplay(font);
        sample.appendChild(textDisplay);

        // Font metrics breakdown
        const metricsBreakdown = this.createFontMetricsBreakdown(measurement);
        sample.appendChild(metricsBreakdown);

        // Character set display
        const charsetDisplay = this.createCharacterSetDisplay(font);
        sample.appendChild(charsetDisplay);

        return sample;
    }

    createFontSampleHeader(font, index) {
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: calc(var(--f));
            border-bottom: var(--outline-width) solid var(--c-border);
            padding-bottom: calc(var(--f) / 2);
        `;

        // Font name
        const name = document.createElement('h3');
        name.textContent = font.family.toUpperCase();
        name.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: var(--f);
            margin: 0;
            color: var(--vga-white);
            font-weight: 700;
        `;

        // Individual font size input
        const sizeControl = document.createElement('div');
        sizeControl.style.cssText = `
            display: flex;
            align-items: center;
            gap: calc(var(--f) / 2);
        `;

        const sizeLabel = document.createElement('label');
        sizeLabel.textContent = 'SIZE:';
        sizeLabel.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: calc(var(--f) * 0.8);
            color: var(--vga-silver);
            text-transform: uppercase;
        `;

        const sizeInput = document.createElement('input');
        sizeInput.type = 'number';
        sizeInput.value = font.individualSize || this.state.fontSize;
        sizeInput.min = '8';
        sizeInput.max = '200';
        sizeInput.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: calc(var(--f) * 0.8);
            background: var(--c-bg);
            color: var(--vga-white);
            border: none;
            outline: var(--outline-width) solid var(--vga-gray);
            padding: calc(var(--f) / 4);
            width: 60px;
        `;
        sizeInput.addEventListener('input', (e) => {
            font.individualSize = parseInt(e.target.value);
            this.debouncedUpdate();
        });

        sizeControl.appendChild(sizeLabel);
        sizeControl.appendChild(sizeInput);

        header.appendChild(name);
        header.appendChild(sizeControl);
        return header;
    }

    createFontTextDisplay(font) {
        const textContainer = document.createElement('div');
        textContainer.style.cssText = `
            margin-bottom: calc(var(--f) * 1.5);
            min-height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--vga-black);
            outline: var(--outline-width) solid var(--vga-gray);
            padding: calc(var(--f));
        `;

        const text = document.createElement('div');
        text.textContent = this.state.sampleText;
        text.style.cssText = `
            font-family: "${font.family}";
            font-size: ${font.individualSize || this.state.fontSize}px;
            color: var(--vga-white);
            text-align: center;
            line-height: ${font.lineHeight || 1.2};
            letter-spacing: ${font.letterSpacing || 0}px;
            word-spacing: ${font.wordSpacing || 0}px;
            transform: scale(${(font.scaleX || 100) / 100}, ${(font.scaleY || 100) / 100});
            transform-origin: center;
        `;

        textContainer.appendChild(text);
        return textContainer;
    }

    createFontMetricsBreakdown(measurement) {
        const breakdown = document.createElement('div');
        breakdown.className = 'metrics-breakdown';
        breakdown.style.cssText = `
            margin-bottom: calc(var(--f) * 1.5);
            padding: calc(var(--f));
            background: var(--vga-black);
            outline: var(--outline-width) solid var(--vga-gray);
        `;

        const title = document.createElement('div');
        title.textContent = 'METRICS BREAKDOWN';
        title.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: calc(var(--f) * 0.8);
            color: var(--vga-yellow);
            margin-bottom: calc(var(--f) / 2);
            text-transform: uppercase;
            font-weight: 700;
        `;

        const metricsGrid = document.createElement('div');
        metricsGrid.style.cssText = `
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: calc(var(--f) / 2);
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: calc(var(--f) * 0.7);
        `;

        const metrics = [
            { label: 'Cap Height', value: measurement.capitalHeight, color: 'var(--vga-lime)' },
            { label: 'x-Height', value: measurement.xHeight, color: 'var(--vga-aqua)' },
            { label: 'Ascent', value: measurement.ascent, color: 'var(--vga-red)' },
            { label: 'Descent', value: measurement.descent, color: 'var(--vga-blue)' },
            { label: 'Em Width', value: measurement.emBoxWidth, color: 'var(--vga-fuchsia)' },
            { label: 'Avg Char', value: measurement.avgCharWidth, color: 'var(--vga-white)' }
        ];

        metrics.forEach(metric => {
            const item = document.createElement('div');
            item.style.cssText = `color: ${metric.color};`;
            item.innerHTML = `${metric.label}: <strong>${metric.value.toFixed(1)}px</strong>`;
            metricsGrid.appendChild(item);
        });

        breakdown.appendChild(title);
        breakdown.appendChild(metricsGrid);
        return breakdown;
    }

    createCharacterSetDisplay(font) {
        const charsetContainer = document.createElement('div');
        charsetContainer.className = 'charset-display';
        charsetContainer.style.cssText = `
            flex-grow: 1;
            background: var(--vga-black);
            outline: var(--outline-width) solid var(--vga-gray);
            padding: calc(var(--f));
        `;

        const title = document.createElement('div');
        title.textContent = 'CHARACTER SET';
        title.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: calc(var(--f) * 0.8);
            color: var(--vga-yellow);
            margin-bottom: calc(var(--f) / 2);
            text-transform: uppercase;
            font-weight: 700;
        `;

        const charset = document.createElement('div');
        charset.style.cssText = `
            font-family: "${font.family}";
            font-size: calc(var(--f) * 0.8);
            color: var(--vga-silver);
            line-height: 1.4;
            word-spacing: 2px;
            letter-spacing: 1px;
        `;

        // Complete character set
        const characters = [
            'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            'abcdefghijklmnopqrstuvwxyz',
            '0123456789',
            '!@#$%^&*()_+-=[]{}|;:,.<>?',
            '"\'`~'
        ];

        characters.forEach((line, index) => {
            const lineDiv = document.createElement('div');
            lineDiv.textContent = line;
            lineDiv.style.cssText = `
                margin-bottom: calc(var(--f) / 4);
                color: ${index === 0 ? 'var(--vga-white)' : 
                        index === 1 ? 'var(--vga-lime)' : 
                        index === 2 ? 'var(--vga-aqua)' : 
                        'var(--vga-silver)'};
            `;
            charset.appendChild(lineDiv);
        });

        charsetContainer.appendChild(title);
        charsetContainer.appendChild(charset);
        return charsetContainer;
    }

    createFontColumn(index, F) {
        // SHARED BORDERS PATTERN - NO individual borders, rely on grid outline!
        const column = document.createElement('div');
        column.className = `font-column font-column-${index}`;
        
        // Only right border on middle columns to create shared border effect
        let borderStyle = '';
        if (index < 2) {
            borderStyle = 'border-right: 1px solid var(--c-border);';
        }
        
        column.style.cssText = `
            ${borderStyle}
            background: var(--c-bg);
            min-height: 600px;
            box-sizing: border-box;
            display: grid;
            grid-template-rows: auto auto min-content 1fr;
            gap: 0;
        `;
        
        // Sections with NO GAPS - shared border pattern like polygon calculator
        
        // Font selector (grid row 1)
        const fontHeader = this.createFontSelector(index, F);
        column.appendChild(fontHeader);
        
        // Sample text display (grid row 2)
        const sampleDisplay = this.createSampleDisplay(index, F);
        column.appendChild(sampleDisplay);
        
        // Letter analysis canvas (grid row 3)
        const canvasSection = this.createCanvasSection(index, F);
        column.appendChild(canvasSection);
        
        // Character set display (grid row 4 - takes remaining space with 1fr)
        const charsetSection = this.createCharsetSection(index, F);
        column.appendChild(charsetSection);
        
        return column;
    }
    
    createFontSelector(index, F) {
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            gap: ${F/2}px;
            align-items: center;
            padding: ${F/2}px;
            border-bottom: 1px solid var(--c-border);
        `;
        
        // Font dropdown using proper Dropdown component with button trigger
        const popularFonts = this.fontLoader.getPopularFonts();
        const fontItems = popularFonts.map(font => ({ 
            label: font, 
            value: font,
            onClick: () => this.changeFontInColumn(index, font)
        }));
        
        const currentFont = this.state.fonts[index]?.family || popularFonts[0];
        const fontDropdown = new ComponentLibrary.Dropdown({
            triggerText: currentFont,
            items: fontItems,
            position: 'bottom-left'
        }, this.deps);
        this.componentInstances.push(fontDropdown);
        
        const dropdownElement = fontDropdown.render();
        dropdownElement.style.flex = '1';
        
        // Size input with increment/decrement
        const sizeGroup = this.createIncrementInput(`size-${index}`, 
            this.state.fonts[index]?.individualSize || this.state.fontSize,
            { min: 8, max: 200, step: 1 }, F);
        sizeGroup.style.width = '80px';
        
        // Listen for size changes - need to bind to both input AND increment buttons
        const sizeInput = sizeGroup.querySelector('input');
        sizeInput.addEventListener('input', (e) => {
            this.updateFontSizeInColumn(index, parseInt(e.target.value) || this.state.fontSize);
        });
        
        // Also add event listeners to the +/- buttons for immediate font size updates
        const minusBtn = sizeGroup.querySelector('button:first-child');
        const plusBtn = sizeGroup.querySelector('button:last-child');
        
        minusBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const currentValue = parseInt(sizeInput.value) || this.state.fontSize;
            const newValue = Math.max(8, currentValue - 1);
            sizeInput.value = newValue;
            this.updateFontSizeInColumn(index, newValue);
        });
        
        plusBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const currentValue = parseInt(sizeInput.value) || this.state.fontSize;
            const newValue = Math.min(200, currentValue + 1);
            sizeInput.value = newValue;
            this.updateFontSizeInColumn(index, newValue);
        });
        
        header.appendChild(dropdownElement);
        header.appendChild(sizeGroup);
        return header;
    }
    
    createSampleDisplay(index, F) {
        const display = document.createElement('div');
        display.className = `sample-display sample-display-${index}`;
        display.style.cssText = `
            height: ${F * 10}px;
            background: var(--c-bg);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            padding: ${F/2}px;
            box-sizing: border-box;
            border-bottom: 1px solid var(--c-border);
        `;
        
        const text = document.createElement('div');
        text.className = `sample-text sample-text-${index}`;
        text.textContent = this.state.sampleText;
        text.style.cssText = `
            font-family: "${this.state.fonts[index]?.family || 'Space Mono'}", monospace;
            font-size: ${this.state.fonts[index]?.individualSize || this.state.fontSize}px;
            color: var(--c-text);
            text-align: center;
            line-height: 1.2;
            word-break: break-word;
            max-width: 100%;
            max-height: 100%;
        `;
        
        display.appendChild(text);
        return display;
    }
    
    createCanvasSection(index, F) {
        // Canvas container - NO ASPECT RATIO CONSTRAINT
        const container = document.createElement('div');
        container.style.cssText = `
            width: 100%;
            min-height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--c-bg);
            padding: ${F/2}px;
            box-sizing: border-box;
            border-bottom: 1px solid var(--c-border);
        `;
        
        const canvas = document.createElement('canvas');
        canvas.className = `metrics-canvas metrics-canvas-${index}`;
        // NO FIXED SIZE - will be set dynamically based on content
        canvas.style.cssText = `
            display: block;
            max-width: 100%;
            background: transparent;
        `;
        
        container.appendChild(canvas);
        return container;
    }
    
    createCharsetSection(index, F) {
        const section = document.createElement('div');
        section.style.cssText = `
            background: var(--c-bg);
            padding: ${F/2}px;
            overflow-y: auto;
            min-height: 0;
        `;
        
        const title = document.createElement('div');
        title.textContent = 'CHARACTER SET';
        title.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F}px;
            color: var(--c-text);
            margin-bottom: ${F/2}px;
            text-transform: uppercase;
        `;
        
        const charset = document.createElement('div');
        charset.className = `charset-display charset-display-${index}`;
        charset.style.cssText = `
            font-size: 20px;
            color: var(--c-text);
            line-height: 1.4;
        `;
        
        // Add character set content immediately
        this.populateCharacterSet(charset, index);
        
        section.appendChild(title);
        section.appendChild(charset);
        return section;
    }
    
    populateCharacterSet(container, index) {
        const fontFamily = this.state.fonts[index]?.family || 'Space Mono';
        
        const categories = [
            { label: 'UPPERCASE', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', color: 'var(--vga-yellow)' },
            { label: 'LOWERCASE', chars: 'abcdefghijklmnopqrstuvwxyz', color: 'var(--vga-cyan)' },
            { label: 'NUMBERS', chars: '0123456789', color: 'var(--vga-green)' },
            { label: 'SYMBOLS', chars: '!@#$%^&*()_+-=[]{}|;:,.<>?', color: 'var(--vga-magenta)' }
        ];
        
        container.innerHTML = '';
        categories.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.style.marginBottom = '3px';
            
            const label = document.createElement('div');
            label.textContent = category.label + ':';
            label.style.cssText = `
                font-size: 12px;
                color: ${category.color};
                margin-bottom: 1px;
                font-weight: bold;
            `;
            
            const chars = document.createElement('div');
            chars.textContent = category.chars;
            chars.style.cssText = `
                font-family: "${fontFamily}", monospace;
                font-size: 16px;
                color: var(--c-text);
                word-break: break-all;
                line-height: 1.2;
            `;
            
            categoryDiv.appendChild(label);
            categoryDiv.appendChild(chars);
            container.appendChild(categoryDiv);
        });
    }
    
    createFixedHeader(index, F) {
        // Use ComponentLibrary.Panel with CSS class
        const header = new ComponentLibrary.Panel({
            className: 'font-header',
            content: ''
        }, this.deps);
        this.componentInstances.push(header);
        
        // Font selector using ComponentLibrary.Select
        const popularFonts = this.fontLoader.getPopularFonts();
        const fontOptions = popularFonts.map(font => ({
            value: font,
            label: font
        }));
        
        const fontSelect = new ComponentLibrary.Select({
            options: fontOptions,
            value: this.state.fonts[index]?.family || popularFonts[0],
            onChange: (value) => this.changeFontInColumn(index, value),
            className: 'font-selector'
        }, this.deps);
        
        this.componentInstances.push(fontSelect);
        
        // Size input using ComponentLibrary.Input
        const sizeInput = new ComponentLibrary.Input({
            type: 'number',
            value: this.state.fonts[index]?.individualSize || this.state.fontSize,
            min: 8,
            max: 200,
            onChange: (value) => {
                const newSize = parseInt(value) || this.state.fontSize;
                this.updateFontSizeInColumn(index, newSize);
            },
            className: 'size-input'
        }, this.deps);
        
        this.componentInstances.push(sizeInput);
        
        const headerElement = header.render();
        headerElement.appendChild(fontSelect.render());
        headerElement.appendChild(sizeInput.render());
        return headerElement;
    }
    
    createFixedSampleDisplay(index, F) {
        const display = document.createElement('div');
        display.className = `sample-display-${index}`;
        display.style.cssText = `
            height: ${F * 10}px;
            padding: ${F}px;
            border-bottom: 1px solid var(--c-border);
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--c-bg);
            overflow: hidden;
        `;
        
        const text = document.createElement('div');
        text.className = 'sample-text';
        text.textContent = this.state.sampleText;
        text.style.cssText = `
            font-family: "${this.state.fonts[index]?.family || 'Space Mono'}", monospace;
            font-size: ${this.state.fonts[index]?.individualSize || this.state.fontSize}px;
            color: var(--c-text);
            text-align: center;
            line-height: 1.2;
            word-break: break-word;
            max-width: 100%;
        `;
        
        display.appendChild(text);
        return display;
    }
    
    createFixedCanvasSection(index, F) {
        const section = document.createElement('div');
        section.style.cssText = `
            height: ${F * 20}px;
            padding: ${F}px;
            border-bottom: 1px solid var(--c-border);
            background: var(--c-bg);
            display: flex;
            flex-direction: column;
        `;
        
        const title = document.createElement('div');
        title.textContent = 'LETTER ANALYSIS';
        title.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F}px;
            color: var(--c-text);
            margin-bottom: ${F/2}px;
            text-transform: uppercase;
        `;
        
        // Canvas container that maintains square aspect ratio
        const canvasContainer = document.createElement('div');
        canvasContainer.style.cssText = `
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const canvas = document.createElement('canvas');
        canvas.className = `metrics-canvas-${index}`;
        canvas.width = 400;
        canvas.height = 400;
        canvas.style.cssText = `
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            width: ${F * 16}px;
            height: ${F * 16}px;
            display: block;
        `;
        
        canvasContainer.appendChild(canvas);
        section.appendChild(title);
        section.appendChild(canvasContainer);
        return section;
    }
    
    createFixedCharsetSection(index, F) {
        const section = document.createElement('div');
        section.style.cssText = `
            flex: 1;
            padding: ${F}px;
            background: var(--c-bg);
            overflow-y: auto;
        `;
        
        const title = document.createElement('div');
        title.textContent = 'CHARACTER SET';
        title.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F}px;
            color: var(--c-text);
            margin-bottom: ${F}px;
            text-transform: uppercase;
        `;
        
        const charset = document.createElement('div');
        charset.className = `charset-display-${index}`;
        charset.style.cssText = `
            font-size: 20px;
            color: var(--c-text);
            line-height: 1.4;
            font-family: "${this.state.fonts[index]?.family || 'Space Mono'}", monospace;
        `;
        
        section.appendChild(title);
        section.appendChild(charset);
        return section;
    }

    createColumnHeader(index) {
        const header = document.createElement('div');
        header.className = 'column-header';
        header.style.cssText = `
            padding: calc(var(--f));
            background: var(--c-bg);
            border-bottom: var(--outline-width) solid var(--c-border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        // Font selector dropdown
        const fontSelect = document.createElement('select');
        fontSelect.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: calc(var(--f) * 0.9);
            background: var(--c-bg);
            color: var(--vga-white);
            border: none;
            outline: var(--outline-width) solid var(--vga-white);
            padding: calc(var(--f) / 2);
            flex: 1;
            margin-right: calc(var(--f) / 2);
            cursor: pointer;
        `;

        // Add popular fonts to selector
        const popularFonts = this.fontLoader.getPopularFonts();
        popularFonts.forEach(font => {
            const option = document.createElement('option');
            option.value = font;
            option.textContent = font;
            fontSelect.appendChild(option);
        });

        // Set initial font if available
        if (this.state.fonts[index]) {
            fontSelect.value = this.state.fonts[index].family;
        } else {
            // Create default font entry if missing
            this.state.fonts[index] = {
                family: fontSelect.value,
                loaded: fontSelect.value === 'Space Mono',
                individualSize: this.state.fontSize,
                scaleX: 100,
                scaleY: 100,
                letterSpacing: 0,
                wordSpacing: 0,
                lineHeight: 1.2
            };
        }

        fontSelect.addEventListener('change', (e) => {
            this.changeFontInColumn(index, e.target.value);
        });

        // Individual size input
        const sizeInput = document.createElement('input');
        sizeInput.type = 'number';
        sizeInput.value = this.state.fonts[index]?.individualSize || this.state.fontSize;
        sizeInput.min = '8';
        sizeInput.max = '200';
        sizeInput.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: calc(var(--f) * 0.9);
            background: var(--c-bg);
            color: var(--vga-white);
            border: none;
            outline: var(--outline-width) solid var(--vga-white);
            padding: calc(var(--f) / 2);
            width: 70px;
            text-align: center;
            cursor: pointer;
        `;
        sizeInput.addEventListener('input', (e) => {
            const newSize = parseInt(e.target.value) || this.state.fontSize;
            this.updateFontSizeInColumn(index, newSize);
        });

        header.appendChild(fontSelect);
        header.appendChild(sizeInput);
        return header;
    }

    createFontDisplayArea(index) {
        const displayArea = document.createElement('div');
        displayArea.className = `font-display-${index}`;
        displayArea.style.cssText = `
            padding: calc(var(--f));
            background: var(--c-bg);
            border-bottom: var(--outline-width) solid var(--c-border);
            text-align: center;
            height: 140px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        `;

        const sampleText = document.createElement('div');
        sampleText.className = 'sample-text';
        sampleText.textContent = this.state.sampleText;
        sampleText.style.cssText = `
            color: var(--vga-white);
            line-height: 1.1;
            word-break: break-word;
            text-align: center;
            max-width: 100%;
            hyphens: auto;
        `;

        displayArea.appendChild(sampleText);
        return displayArea;
    }

    createMetricsArea(index) {
        const metricsArea = document.createElement('div');
        metricsArea.className = `metrics-area-${index}`;
        metricsArea.style.cssText = `
            padding: calc(var(--f));
            background: var(--c-bg);
            border-bottom: var(--outline-width) solid var(--c-border);
            flex-shrink: 0;
            overflow: hidden;
            min-height: 240px;
            display: flex;
            flex-direction: column;
        `;

        const title = document.createElement('div');
        title.textContent = 'LETTER ANALYSIS';
        title.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: var(--f);
            color: var(--vga-yellow);
            margin-bottom: calc(var(--f) / 2);
            font-weight: 700;
            text-transform: uppercase;
            border-bottom: var(--outline-width) solid var(--vga-yellow);
            padding-bottom: calc(var(--f) / 4);
        `;

        // Canvas for font metrics visualization - square and high resolution
        const canvas = document.createElement('canvas');
        canvas.className = `metrics-canvas-${index}`;
        // High resolution canvas - 2x for crisp rendering
        canvas.width = 400;
        canvas.height = 400;
        canvas.style.cssText = `
            outline: var(--outline-width) solid var(--c-border);
            background: var(--c-bg);
            display: block;
            width: 100%;
            aspect-ratio: 1 / 1;
            height: auto;
            max-width: 100%;
            image-rendering: crisp-edges;
            image-rendering: pixelated;
            flex-shrink: 0;
        `;

        metricsArea.appendChild(title);
        metricsArea.appendChild(canvas);
        return metricsArea;
    }

    createCharsetArea(index) {
        const charsetArea = document.createElement('div');
        charsetArea.className = `charset-area-${index}`;
        charsetArea.style.cssText = `
            padding: calc(var(--f));
            background: var(--c-bg);
            flex: 1;
            overflow-y: auto;
            min-height: 250px;
        `;

        const title = document.createElement('div');
        title.textContent = 'CHARACTER SET';
        title.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: var(--f);
            color: var(--vga-yellow);
            margin-bottom: calc(var(--f));
            font-weight: 700;
            text-transform: uppercase;
            border-bottom: var(--outline-width) solid var(--vga-yellow);
            padding-bottom: calc(var(--f) / 2);
        `;

        const charset = document.createElement('div');
        charset.className = 'charset-display';
        charset.style.cssText = `
            font-size: 20px;
            color: var(--vga-silver);
            line-height: 1.4;
            word-spacing: 2px;
            letter-spacing: 1px;
        `;

        charsetArea.appendChild(title);
        charsetArea.appendChild(charset);
        return charsetArea;
    }

    updateComparisonMetrics(measurements) {
        if (!this.comparisonMetrics || measurements.length === 0) return;

        const baseFont = measurements[0];
        let html = `<h3>COMPARISON METRICS (relative to ${baseFont.font.family}):</h3>`;

        measurements.forEach(({ font, measurement }) => {
            const capRatio = (measurement.capitalHeight / baseFont.measurement.capitalHeight * 100).toFixed(2);
            const xRatio = (measurement.xHeight / baseFont.measurement.xHeight * 100).toFixed(2);
            const widthRatio = (measurement.avgCharWidth / baseFont.measurement.avgCharWidth * 100).toFixed(2);
            const charRatio = (baseFont.measurement.avgCharWidth / measurement.avgCharWidth).toFixed(4);

            html += `
                <div style="margin-bottom: calc(var(--f) * 2); padding: calc(var(--f)); outline: var(--outline-width) solid var(--c-border);">
                    <strong>${font.family}</strong><br>
                    Capital Height: ${measurement.capitalHeight.toFixed(2)}px (${capRatio}%)<br>
                    x-Height: ${measurement.xHeight.toFixed(2)}px (${xRatio}%)<br>
                    Avg Char Width: ${measurement.avgCharWidth.toFixed(2)}px (${widthRatio}%)<br>
                    Character Ratio: 1 char of ${baseFont.font.family} = ${charRatio} chars of ${font.family}
                </div>
            `;
        });

        this.comparisonMetrics.innerHTML = html;
    }

    updateMetrics() {
        if (!this.canvasElement || this.state.fonts.length === 0) return;

        // Use selected font or first font
        const targetFont = this.state.fonts.find(f => f.family === this.state.selectedFont) || this.state.fonts[0];
        
        // Measure the letter
        const detailedMetrics = this.measureDetailedMetrics(targetFont.family, this.state.letter);
        
        // Draw on canvas
        this.drawMetricsVisualization(detailedMetrics, targetFont.family);
        
        // Update metrics data
        this.updateMetricsData(detailedMetrics);
    }

    measureDetailedMetrics(fontFamily, letter) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.font = `${this.state.fontSize}px "${fontFamily}"`;
        
        const metrics = ctx.measureText(letter);
        
        return {
            fontFamily,
            fontSize: this.state.fontSize,
            letter,
            ascent: Math.abs(metrics.fontBoundingBoxAscent),
            descent: Math.abs(metrics.fontBoundingBoxDescent),
            xHeight: ctx.measureText('x').actualBoundingBoxAscent,
            capHeight: ctx.measureText('H').actualBoundingBoxAscent,
            leftBearing: metrics.actualBoundingBoxLeft,
            rightBearing: metrics.width - metrics.actualBoundingBoxRight,
            width: metrics.actualBoundingBoxRight - metrics.actualBoundingBoxLeft,
            advance: metrics.width,
            actualBoundingBoxAscent: metrics.actualBoundingBoxAscent,
            actualBoundingBoxDescent: metrics.actualBoundingBoxDescent,
            actualBoundingBoxLeft: metrics.actualBoundingBoxLeft,
            actualBoundingBoxRight: metrics.actualBoundingBoxRight
        };
    }

    drawMetricsVisualization(metrics, fontFamily) {
        const ctx = this.canvasContext;
        const canvasMargin = 50;
        
        // Size canvas appropriately
        const canvasWidth = Math.max(metrics.advance * 2, 600);
        const canvasHeight = Math.max((metrics.ascent + metrics.descent) * 2, 400);
        
        this.canvasElement.width = canvasWidth;
        this.canvasElement.height = canvasHeight;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        const startX = canvasMargin;
        const startY = canvasMargin + metrics.ascent;
        
        // Draw the letter
        ctx.font = `${metrics.fontSize}px "${fontFamily}"`;
        ctx.fillStyle = 'var(--c-text)';
        ctx.textAlign = 'left';
        ctx.fillText(metrics.letter, startX, startY);
        
        // Draw metric lines with VGA colors
        this.drawMetricLine(ctx, startY - metrics.ascent, 'ASCENT', '#ff0000', canvasWidth); // VGA red
        this.drawMetricLine(ctx, startY, 'BASELINE', '#00ff00', canvasWidth); // VGA lime
        this.drawMetricLine(ctx, startY + metrics.descent, 'DESCENT', '#0000ff', canvasWidth); // VGA blue
        this.drawMetricLine(ctx, startY - metrics.capHeight, 'CAP HEIGHT', '#ff00ff', canvasWidth); // VGA fuchsia
        this.drawMetricLine(ctx, startY - metrics.xHeight, 'X-HEIGHT', '#ffff00', canvasWidth); // VGA yellow
        
        // Draw vertical guides
        this.drawVerticalGuide(ctx, startX, startY - metrics.ascent, metrics.ascent + metrics.descent, 'LEFT BEARING', '#00ffff'); // VGA aqua
        this.drawVerticalGuide(ctx, startX + metrics.advance, startY - metrics.ascent, metrics.ascent + metrics.descent, 'ADVANCE', '#808080'); // VGA gray
        
        // Draw bounding box
        ctx.strokeStyle = '#c0c0c0'; // VGA silver
        ctx.strokeRect(
            startX + metrics.actualBoundingBoxLeft, 
            startY - metrics.actualBoundingBoxAscent, 
            metrics.width, 
            metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
        );
    }

    drawMetricLine(ctx, y, label, color, width) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
        
        // Label
        ctx.fillStyle = color;
        ctx.font = '12px "Atkinson Hyperlegible Mono"';
        ctx.textAlign = 'right';
        ctx.fillText(label, width - 5, y - 5);
    }

    drawVerticalGuide(ctx, x, y, height, label, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + height);
        ctx.stroke();
        
        // Rotated label
        ctx.save();
        ctx.translate(x, y + height);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = color;
        ctx.font = '12px "Atkinson Hyperlegible Mono"';
        ctx.textAlign = 'right';
        ctx.fillText(label, 0, -5);
        ctx.restore();
    }

    updateMetricsData(metrics) {
        if (!this.metricsContainer) return;

        const categories = [
            {
                title: 'VERTICAL MEASUREMENTS',
                items: [
                    { label: 'Ascent', value: metrics.ascent, ratio: metrics.ascent / metrics.fontSize },
                    { label: 'Descent', value: metrics.descent, ratio: metrics.descent / metrics.fontSize },
                    { label: 'Cap Height', value: metrics.capHeight, ratio: metrics.capHeight / metrics.fontSize },
                    { label: 'x-Height', value: metrics.xHeight, ratio: metrics.xHeight / metrics.fontSize }
                ]
            },
            {
                title: 'HORIZONTAL MEASUREMENTS',
                items: [
                    { label: 'Left Bearing', value: metrics.leftBearing, ratio: metrics.leftBearing / metrics.fontSize },
                    { label: 'Width', value: metrics.width, ratio: metrics.width / metrics.fontSize },
                    { label: 'Right Bearing', value: metrics.rightBearing, ratio: metrics.rightBearing / metrics.fontSize },
                    { label: 'Advance', value: metrics.advance, ratio: metrics.advance / metrics.fontSize }
                ]
            }
        ];

        this.metricsContainer.innerHTML = '';
        
        categories.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.style.cssText = `
                padding: calc(var(--f) * 2);
                outline: var(--outline-width) solid var(--c-border);
            `;

            const title = document.createElement('h3');
            title.textContent = category.title;
            title.style.cssText = `
                font-family: 'Atkinson Hyperlegible Mono', monospace;
                font-size: var(--f);
                margin: 0 0 calc(var(--f)) 0;
                color: var(--c-accent);
            `;

            categoryDiv.appendChild(title);

            category.items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.style.cssText = `
                    font-family: 'Atkinson Hyperlegible Mono', monospace;
                    font-size: calc(var(--f) * 0.9);
                    margin-bottom: calc(var(--f) / 2);
                `;
                itemDiv.innerHTML = `${item.label}: <strong>${item.value.toFixed(2)}px</strong> (${item.ratio.toFixed(3)})`;
                categoryDiv.appendChild(itemDiv);
            });

            this.metricsContainer.appendChild(categoryDiv);
        });
    }

    // Utility methods
    setMode(mode) {
        this.state.mode = mode;
        
        // Re-render analysis display
        this.analysisContainer.innerHTML = '';
        this.renderAnalysisDisplay();
        this.updateDisplay();
        
        // Update mode buttons
        const buttons = document.querySelectorAll('.font-analysis-tool button');
        // Note: In a full implementation, you'd want to track button references
    }

    showLoadingState(fontFamily) {
        // Show loading indicator
        console.log(`Loading font: ${fontFamily}...`);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Column management methods
    updateAllColumns() {
        for (let i = 0; i < 3; i++) {
            this.updateColumn(i);
        }
        
        // Update comparison ratios
        this.updateComparisonRatios();
    }

    updateColumn(index) {
        const font = this.state.fonts[index];
        if (!font) {
            console.warn(`🔤 No font found for column ${index}`);
            return;
        }

        console.log(`🔤 Updating column ${index} with font: ${font.family}, size: ${font.individualSize || this.state.fontSize}`);

        // Update sample text display with correct class names
        const sampleText = document.querySelector(`.sample-text-${index}`);
        if (sampleText) {
            sampleText.textContent = this.state.sampleText;
            sampleText.style.fontFamily = `"${font.family}", monospace`;
            sampleText.style.fontSize = `${font.individualSize || this.state.fontSize}px`;
            sampleText.style.color = 'var(--c-text)';
            sampleText.style.lineHeight = '1.2';
            console.log(`🔤 Updated sample text for column ${index}`);
        } else {
            console.warn(`🔤 Sample text element not found for column ${index}`);
        }

        // Update font size input to reflect current value
        const sizeInput = document.querySelector(`.font-column-${index} input[type="number"]`);
        if (sizeInput) {
            sizeInput.value = font.individualSize || this.state.fontSize;
            console.log(`🔤 Updated size input for column ${index} to: ${sizeInput.value}`);
        } else {
            console.warn(`🔤 Size input not found for column ${index}`);
        }

        // Update metrics
        this.updateColumnMetrics(index);

        // Update character set
        this.updateColumnCharset(index);
    }

    updateColumnMetrics(index) {
        const font = this.state.fonts[index];
        if (!font) return;

        const canvas = document.querySelector(`.metrics-canvas-${index}`);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const measurement = this.measureFont(font);
        
        // Draw the detailed font metrics visualization
        this.drawFontMetricsCanvas(ctx, measurement, font.family, font.individualSize || this.state.fontSize, this.state.letter);
    }

    drawFontMetricsCanvas(ctx, metrics, fontFamily, fontSize, letter) {
        console.log(`🎯 Drawing EXACT font analysis: "${letter}" in ${fontFamily} at ${fontSize}px`);

        // EXACT IMPLEMENTATION FROM REFERENCE - Dynamic canvas sizing
        const canvasMargin = 50;
        const canvasWidth = Math.max(metrics.advance * 2, 400);
        const canvasHeight = Math.max((metrics.ascent + metrics.descent) * 2, 400);
        
        // Set canvas native size = display size (NO CSS SCALING)
        ctx.canvas.width = canvasWidth;
        ctx.canvas.height = canvasHeight;
        
        // Clear canvas - transparent background like reference
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Only draw if we have valid metrics
        if (!metrics.advance || !metrics.ascent) {
            ctx.fillStyle = '#808080';
            ctx.font = '16px "Atkinson Hyperlegible Mono"';
            ctx.textAlign = 'center';
            ctx.fillText('Loading font...', canvasWidth/2, canvasHeight/2);
            return;
        }

        const startX = canvasMargin;
        const startY = canvasMargin + metrics.ascent;

        // Draw advance width box (reference style)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(startX, startY - metrics.ascent, metrics.advance, metrics.ascent + metrics.descent);

        // Draw bounding box (reference style)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(
            startX + (metrics.actualBoundingBoxLeft || 0), 
            startY - (metrics.actualBoundingBoxAscent || metrics.ascent), 
            metrics.width || (metrics.actualBoundingBoxRight - metrics.actualBoundingBoxLeft), 
            (metrics.actualBoundingBoxAscent || metrics.ascent) + (metrics.actualBoundingBoxDescent || metrics.descent)
        );

        // Draw the letter at EXACT font size - NO SCALING AT ALL
        ctx.font = `${fontSize}px "${fontFamily}"`;
        ctx.fillStyle = '#808080'; // VGA gray for visibility on dark background
        ctx.textAlign = 'left';        // LEFT align like reference
        ctx.textBaseline = 'alphabetic'; // BASELINE positioning like reference
        ctx.fillText(letter, startX, startY);

        // Draw metric lines with VGA colors - EXACT pixel coordinates
        this.drawHorizontalLineWithLabel(ctx, startY - metrics.ascent, 'Ascent', '#ff0000', true);
        this.drawHorizontalLineWithLabel(ctx, startY, 'Baseline', '#00ff00', true);
        this.drawHorizontalLineWithLabel(ctx, startY + metrics.descent, 'Descent', '#0000ff', true);
        this.drawHorizontalLineWithLabel(ctx, startY - (metrics.capitalHeight || 0), 'Cap Height', '#ff00ff', false);
        this.drawHorizontalLineWithLabel(ctx, startY - (metrics.xHeight || 0), 'x-Height', '#ffff00', true);

        // Draw vertical guides - EXACT pixel coordinates
        this.drawVerticalLineWithLabel(ctx, startX, startY - metrics.ascent, metrics.ascent + metrics.descent, 'Left Bearing', '#00ffff');
        this.drawVerticalLineWithLabel(ctx, startX + metrics.advance, startY - metrics.ascent, metrics.ascent + metrics.descent, 'Right Bearing', '#808080');

        // Draw measurement brackets - EXACT measurements
        this.drawBracketWithLabel(
            ctx, 
            startX + (metrics.actualBoundingBoxLeft || 0), 
            startY + (metrics.actualBoundingBoxDescent || metrics.descent) + 20,
            metrics.width || (metrics.actualBoundingBoxRight - metrics.actualBoundingBoxLeft), 
            `Width: ${(metrics.width || (metrics.actualBoundingBoxRight - metrics.actualBoundingBoxLeft)).toFixed(1)}px`, 
            '#000000'
        );

        this.drawBracketWithLabel(
            ctx, 
            startX, 
            startY + metrics.descent + 40,
            metrics.advance, 
            `Advance: ${metrics.advance.toFixed(1)}px`, 
            'rgba(0, 0, 0, 0.5)'
        );

        console.log(`✅ Canvas drawn: ${canvasWidth}x${canvasHeight}, font: ${fontSize}px actual size`);
    }

    drawHorizontalLineWithLabel(ctx, y, label, color, labelOnRight = false) {
        // Draw line across full canvas width
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(ctx.canvas.width, y);
        ctx.stroke();

        // Draw label
        ctx.fillStyle = color;
        ctx.font = '12px "Atkinson Hyperlegible Mono"';
        ctx.textAlign = labelOnRight ? 'right' : 'left';
        const x = labelOnRight ? ctx.canvas.width - 5 : 5;
        ctx.fillText(label, x, y - 3);
    }

    drawVerticalLineWithLabel(ctx, x, y, height, label, color) {
        // Draw line
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + height);
        ctx.stroke();

        // Draw rotated label
        ctx.save();
        ctx.translate(x, y + height);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = color;
        ctx.font = '12px "Atkinson Hyperlegible Mono"';
        ctx.textAlign = 'right';
        ctx.fillText(label, 0, -3);
        ctx.restore();
    }

    drawBracketWithLabel(ctx, x, y, width, label, color) {
        const bracketHeight = 15;

        // Draw bracket exactly like reference
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + bracketHeight);
        ctx.lineTo(x + width, y + bracketHeight);
        ctx.lineTo(x + width, y);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw label exactly like reference
        ctx.fillStyle = color;
        ctx.font = '12px "Atkinson Hyperlegible Mono"';
        ctx.textAlign = 'center';
        ctx.fillText(label, x + width / 2, y + bracketHeight + 15);
    }

    updateColumnCharset(index) {
        const font = this.state.fonts[index];
        if (!font) return;

        const charsetDisplay = document.querySelector(`.charset-display-${index}`);
        if (!charsetDisplay) {
            console.warn(`Character set display not found for column ${index}`);
            return;
        }

        // Update font family for character set display
        charsetDisplay.style.fontFamily = `"${font.family}", monospace`;
        
        // Re-populate character set with new font
        this.populateCharacterSet(charsetDisplay, index);
    }

    async changeFontInColumn(index, fontFamily) {
        console.log(`🔤 Changing font in column ${index} to: ${fontFamily}`);
        
        if (!this.state.fonts[index]) {
            // Create new font entry
            this.state.fonts[index] = {
                family: fontFamily,
                loaded: false,
                individualSize: this.state.fontSize,
                scaleX: 100,
                scaleY: 100,
                letterSpacing: 0,
                wordSpacing: 0,
                lineHeight: 1.2
            };
        } else {
            this.state.fonts[index].family = fontFamily;
        }

        // Update dropdown trigger text
        const dropdownTrigger = document.querySelector(`.font-column-${index} .dropdown-trigger`);
        if (dropdownTrigger) {
            dropdownTrigger.textContent = fontFamily;
            console.log(`🔤 Updated dropdown trigger for column ${index}`);
        } else {
            console.warn(`🔤 Dropdown trigger not found for column ${index}`);
        }

        // Load font if needed
        if (fontFamily !== 'Space Mono' && !this.fontLoader.isFontAvailable(fontFamily)) {
            try {
                console.log(`🔄 Loading font: ${fontFamily}`);
                await this.fontLoader.loadFont(fontFamily);
                this.state.fonts[index].loaded = true;
                console.log(`✅ Font loaded: ${fontFamily}`);
            } catch (error) {
                console.warn(`❌ Failed to load font: ${fontFamily}`, error);
            }
        } else {
            this.state.fonts[index].loaded = true;
            console.log(`✅ Font already available: ${fontFamily}`);
        }

        console.log(`🔤 Updating column ${index} display`);
        this.updateColumn(index);
    }

    updateFontSizeInColumn(index, size) {
        console.log(`🔤 Updating font size in column ${index} to: ${size}`);
        if (this.state.fonts[index]) {
            this.state.fonts[index].individualSize = size;
            console.log(`🔤 Updated state for column ${index}:`, this.state.fonts[index]);
            this.updateColumn(index);
        } else {
            console.warn(`🔤 No font state found for column ${index}`);
        }
    }

    updateComparisonRatios() {
        const ratiosGrid = document.querySelector('.ratios-grid');
        if (!ratiosGrid) return;

        // Get measurements for all loaded fonts
        const measurements = this.state.fonts.map(font => {
            const measurement = this.measureFont(font);
            return { font: font.family, measurement };
        });

        if (measurements.length === 0) return;

        const baseFont = measurements[0];
        ratiosGrid.innerHTML = '';

        measurements.forEach(({ font, measurement }) => {
            const ratioCard = document.createElement('div');
            ratioCard.style.cssText = `
                padding: calc(var(--f));
                outline: var(--outline-width) solid var(--c-border);
                background: var(--c-bg);
            `;

            const fontTitle = document.createElement('h3');
            fontTitle.textContent = font.toUpperCase();
            fontTitle.style.cssText = `
                color: var(--vga-white);
                margin: 0 0 calc(var(--f)) 0;
                font-size: var(--f);
                font-weight: 700;
            `;

            const ratiosText = document.createElement('div');
            ratiosText.style.cssText = `
                color: var(--vga-silver);
                line-height: 1.6;
            `;

            // Calculate ratios relative to base font
            const capRatio = (measurement.capitalHeight / baseFont.measurement.capitalHeight * 100).toFixed(1);
            const xRatio = (measurement.xHeight / baseFont.measurement.xHeight * 100).toFixed(1);
            const emRatio = (measurement.emBoxWidth / baseFont.measurement.emBoxWidth * 100).toFixed(1);
            const avgCharRatio = (measurement.avgCharWidth / baseFont.measurement.avgCharWidth * 100).toFixed(1);
            const charEquivalent = (baseFont.measurement.avgCharWidth / measurement.avgCharWidth).toFixed(3);

            ratiosText.innerHTML = `
                <div style="color: #00ff00;">Cap Height: ${measurement.capitalHeight.toFixed(1)}px (${capRatio}%)</div>
                <div style="color: #00ffff;">x-Height: ${measurement.xHeight.toFixed(1)}px (${xRatio}%)</div>
                <div style="color: #ff00ff;">Em Width: ${measurement.emBoxWidth.toFixed(1)}px (${emRatio}%)</div>
                <div style="color: #ffffff;">Avg Char: ${measurement.avgCharWidth.toFixed(1)}px (${avgCharRatio}%)</div>
                <div style="color: #ffff00; margin-top: calc(var(--f) / 2);">Character Ratio: 1 ${baseFont.font} = ${charEquivalent} ${font}</div>
            `;

            ratioCard.appendChild(fontTitle);
            ratioCard.appendChild(ratiosText);
            ratiosGrid.appendChild(ratioCard);
        });
    }

    // Initial font loading
    async loadInitialFonts() {
        console.log('🔤 Loading initial fonts...', this.state.fonts);
        
        // Update all columns immediately with current fonts
        this.updateAllColumns();

        // Load Google Fonts for fonts that aren't already loaded
        const loadPromises = this.state.fonts.map(async (font, index) => {
            if (!font.loaded && font.family !== 'Space Mono') {
                try {
                    console.log(`🔄 Loading font: ${font.family}`);
                    await this.fontLoader.loadFont(font.family);
                    font.loaded = true;
                    console.log(`✅ Loaded initial font: ${font.family}`);
                } catch (error) {
                    console.warn(`❌ Failed to load initial font: ${font.family}`, error);
                    font.loaded = false;
                }
            } else {
                font.loaded = true;
                console.log(`✅ Font already available: ${font.family}`);
            }
        });

        await Promise.all(loadPromises);
        
        // Update displays after fonts are loaded
        console.log('🔤 Fonts loaded, updating displays...');
        this.updateAllColumns();
        console.log('🔤 Font analysis tool ready');
    }

    destroy() {
        // Clean up component instances
        this.componentInstances.forEach(component => component.destroy());
        this.componentInstances = [];
        
        // Clear container
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        // Reset references
        this.canvasElement = null;
        this.canvasContext = null;
        this.metricsContainer = null;
        this.comparisonContainer = null;
        this.analysisContainer = null;
        this.fontsContainer = null;
    }
}

// Register globally
window.FontAnalysisTool = FontAnalysisTool;

console.log('🔤 Font Analysis Tool ready - Combined comparison + metrics with Google Fonts loading');
