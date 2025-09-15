/**
 * Polygon Calculator Tool - SiteBoy Framework
 * 
 * Interactive polygon geometry calculator with SVG visualization
 * Integrates with SiteBoy component system and aesthetic rules
 * 
 * @version 1.0.0
 * @dependencies ComponentLibrary
 */

class PolygonCalculator {
    constructor(container, deps = {}) {
        this.container = container;
        this.deps = deps;
        this.componentInstances = [];
        this.state = {
            sides: 6,
            wallWidth: 0.2,
            outer: {
                apothem: 2.5,
                circumradius: 0,
                sideLength: 0,
                perimeter: 0,
                area: 0
            },
            inner: {
                apothem: 2.3,
                circumradius: 0,
                sideLength: 0,
                perimeter: 0,
                area: 0
            },
            lastChange: {
                polygon: "outer",
                measure: "apothem"
            }
        };
    }
    
    render() {
        this.destroy();
        
        const title = new ComponentLibrary.Heading({
            level: 1,
            content: 'POLYGON CALCULATOR'
        });
        this.componentInstances.push(title);
        this.container.appendChild(title.render());
        
        const description = new ComponentLibrary.Paragraph({
            content: 'Interactive polygon geometry with mathematical precision. Calculate relationships between apothem, circumradius, side length, perimeter, and area.'
        });
        this.componentInstances.push(description);
        this.container.appendChild(description.render());
        
        // Main layout following ColorQuantizer pattern
        this.renderMainInterface();
        
        // Mathematical glossary
        this.renderGlossary();
        
        // Initialize with default values and update
        this.setupEventListeners();
        this.initializeState();
    }
    
    renderMainInterface() {
        // Following ColorQuantizer pattern exactly
        const F = 12; // F base size
        
        // Main container with grid layout (left inputs, right output)
        const container = document.createElement('div');
        container.className = 'polygon-container';
        container.style.cssText = `
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            grid-template-rows: 1fr;
            align-items: stretch;
            gap: 0;
            margin-bottom: 0;
        `;
        
        // Add comprehensive responsive styles
        const polygonResponsiveStyle = document.createElement('style');
        polygonResponsiveStyle.id = 'polygon-responsive-styles';
        polygonResponsiveStyle.textContent = `
            @media (max-width: 1023px) {
                .polygon-container {
                    grid-template-columns: 1fr !important;
                    grid-template-rows: auto auto !important;
                }
                .polygon-controls {
                    border-right: 1px solid var(--c-border) !important;
                    border-bottom: none !important;
                    order: 1 !important;
                }
                .polygon-output {
                    border-top: none !important;
                    order: 2 !important;
                }
            }
        `;
        
        // Remove existing responsive styles first
        const existingResponsive = document.querySelector('#polygon-responsive-styles');
        if (existingResponsive) {
            existingResponsive.remove();
        }
        document.head.appendChild(polygonResponsiveStyle);
        
        // Left column - Controls (inputs)
        const controls = document.createElement('div');
        controls.className = 'polygon-controls';
        controls.style.cssText = `
            border: 1px solid var(--c-border);
            border-right: none;
            background: var(--c-bg);
            padding: ${F}px;
            height: 100%;
            box-sizing: border-box;
        `;
        
        // Right column - Output (visualization)
        const output = document.createElement('div');
        output.className = 'polygon-output';
        output.style.cssText = `
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            padding: ${F}px;
            height: 100%;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
        `;
        
        // Build controls
        this.buildControls(controls, F);
        
        // Build output
        this.buildOutput(output, F);
        
        // Assemble
        container.appendChild(controls);
        container.appendChild(output);
        this.container.appendChild(container);
    }
    
    buildControls(controls, F) {
        // Basic parameters section
        const basicSection = this.createInputSection('BASIC PARAMETERS', F);
        this.addInputRow(basicSection, 'Number of Sides:', 'sides', this.state.sides, { min: 3, step: 1 }, F);
        this.addInputRow(basicSection, 'Wall Width (m):', 'wallWidth', this.state.wallWidth, { min: 0, step: 0.001 }, F);
        controls.appendChild(basicSection);
        
        // Outer polygon section
        const outerSection = this.createInputSection('OUTER POLYGON', F);
        this.addInputRow(outerSection, 'Apothem (m):', 'outer-apothem', this.state.outer.apothem, { min: 0, step: 0.001 }, F);
        this.addInputRow(outerSection, 'Circumradius (m):', 'outer-circumradius', this.state.outer.circumradius, { min: 0, step: 0.001 }, F);
        this.addInputRow(outerSection, 'Side Length (m):', 'outer-sideLength', this.state.outer.sideLength, { min: 0, step: 0.001 }, F);
        this.addInputRow(outerSection, 'Perimeter (m):', 'outer-perimeter', this.state.outer.perimeter, { min: 0, step: 0.001 }, F);
        this.addInputRow(outerSection, 'Area (m²):', 'outer-area', this.state.outer.area, { min: 0, step: 0.001 }, F);
        controls.appendChild(outerSection);
        
        // Inner polygon section
        const innerSection = this.createInputSection('INNER POLYGON', F);
        this.addInputRow(innerSection, 'Apothem (m):', 'inner-apothem', this.state.inner.apothem, { min: 0, step: 0.001 }, F);
        this.addInputRow(innerSection, 'Circumradius (m):', 'inner-circumradius', this.state.inner.circumradius, { min: 0, step: 0.001 }, F);
        this.addInputRow(innerSection, 'Side Length (m):', 'inner-sideLength', this.state.inner.sideLength, { min: 0, step: 0.001 }, F);
        this.addInputRow(innerSection, 'Perimeter (m):', 'inner-perimeter', this.state.inner.perimeter, { min: 0, step: 0.001 }, F);
        this.addInputRow(innerSection, 'Area (m²):', 'inner-area', this.state.inner.area, { min: 0, step: 0.001 }, F);
        controls.appendChild(innerSection);
    }
    
    buildOutput(output, F) {
        // Match reference structure exactly: <div class="box visualization-box">
        const visualizationBox = document.createElement('div');
        visualizationBox.className = 'box visualization-box';
        visualizationBox.style.cssText = `
            width: 90%;
            height: 0;
            padding-bottom: 90%;
            position: relative;
            background: var(--vga-black);
            margin: 0 auto ${F}px auto;
            box-sizing: border-box;
        `;
        
        // Create SVG element exactly like reference
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.id = 'polygon-display';
        
        // Force viewBox with multiple methods to ensure it sticks
        this.svg.setAttribute('viewBox', '-3 -3 6 6');
        this.svg.setAttributeNS(null, 'viewBox', '-3 -3 6 6');
        
        // Verify viewBox is set correctly
        if (this.svg.getAttribute('viewBox') !== '-3 -3 6 6') {
            this.svg.setAttributeNS(null, 'viewBox', '-3 -3 6 6');
        }
        this.svg.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: transparent;
            display: block;
            overflow: visible;
        `;
        visualizationBox.appendChild(this.svg);
        
        
        output.appendChild(visualizationBox);
        
        // Download buttons exactly like reference
        const downloadButtons = document.createElement('div');
        downloadButtons.className = 'download-buttons';
        downloadButtons.style.cssText = `
            display: flex;
            gap: ${F}px;
            justify-content: center;
            margin: 0 auto;
        `;
        
        const svgBtn = this.createDownloadButton('Download SVG', () => this.downloadSVG());
        const pngBtn = this.createDownloadButton('Download PNG', () => this.downloadPNG());
        const toggleBtn = this.createDownloadButton(
            this.showIntermediateLines ? 'Hide Lines' : 'Show Lines', 
            () => this.toggleIntermediateLines()
        );
        
        downloadButtons.appendChild(svgBtn);
        downloadButtons.appendChild(pngBtn);
        downloadButtons.appendChild(toggleBtn);
        output.appendChild(downloadButtons);
    }
    
    createDownloadButton(text, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = 'download-button';
        button.style.cssText = `
            font-family: 'Space Mono', monospace;
            font-size: var(--f);
            background: var(--vga-black);
            color: var(--vga-silver);
            border: 1px solid var(--c-border);
            padding: calc(var(--f) / 2);
            cursor: pointer;
            transition: none;
            min-width: 120px;
            text-align: center;
        `;
        button.addEventListener('click', onClick);
        return button;
    }
    
    createButton(text, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.cssText = `
            flex: 1;
            padding: 6px 12px;
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Space Mono', monospace;
            font-size: 10px;
            cursor: pointer;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        button.addEventListener('click', onClick);
        return button;
    }
    
    createInputSection(title, F) {
        const section = document.createElement('div');
        section.style.cssText = `margin-bottom: ${F}px;`;
        
        if (title) {
            const header = document.createElement('div');
            header.textContent = title;
            header.style.cssText = `
                font-weight: bold;
                font-size: ${F}px;
                margin-bottom: ${Math.floor(F/2)}px;
                padding-bottom: ${Math.floor(F/4)}px;
                border-bottom: 1px solid var(--c-border);
                color: var(--c-text);
            `;
            section.appendChild(header);
        }
        
        return section;
    }
    
    addInputRow(container, label, id, value, options, F) {
        const row = document.createElement('div');
        row.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: ${Math.floor(F/2)}px;
            gap: ${Math.floor(F/2)}px;
        `;
        
        // Label
        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        labelEl.style.cssText = `
            flex: 1;
            font-size: ${F}px;
            font-family: 'Space Mono', monospace;
            color: var(--c-text);
        `;
        
        // Input group with [ - | input | + ]
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
        input.id = id;
        input.value = value.toFixed(id.includes('sides') ? 0 : 3);
        input.min = options.min || 0;
        input.step = options.step || 0.001;
        input.style.cssText = `
            width: ${F*6}px;
            height: ${F*2}px;
            padding: 0 ${Math.floor(F/2)}px;
            border: 1px solid var(--c-border);
            border-left: none;
            border-right: none;
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Space Mono', monospace;
            font-size: ${F}px;
            text-align: center;
            box-sizing: border-box;
            -moz-appearance: textfield;
        `;
        
        // Hide webkit spinners
        if (!document.querySelector('#hide-input-spinners')) {
            const spinnerStyle = document.createElement('style');
            spinnerStyle.id = 'hide-input-spinners';
            spinnerStyle.textContent = `
                input[type=number]::-webkit-outer-spin-button,
                input[type=number]::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type=number] {
                    -moz-appearance: textfield;
                }
            `;
            document.head.appendChild(spinnerStyle);
        }
        
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
        
        // Add event listeners for +/- buttons
        minusBtn.addEventListener('click', () => {
            const currentValue = parseFloat(input.value) || 0;
            const step = options.step || 0.001;
            const newValue = Math.max(options.min || 0, currentValue - step);
            input.value = newValue.toFixed(id.includes('sides') ? 0 : 3);
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        
        plusBtn.addEventListener('click', () => {
            const currentValue = parseFloat(input.value) || 0;
            const step = options.step || 0.001;
            const newValue = currentValue + step;
            input.value = newValue.toFixed(id.includes('sides') ? 0 : 3);
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        
        inputGroup.appendChild(minusBtn);
        inputGroup.appendChild(input);
        inputGroup.appendChild(plusBtn);
        
        row.appendChild(labelEl);
        row.appendChild(inputGroup);
        container.appendChild(row);
    }
    
    createBasicTable(F) {
        const table = document.createElement('table');
        table.className = 'measurements-table';
        table.style.cssText = `
            width: 100%;
            border-collapse: collapse;
            font-family: 'Space Mono', monospace;
            font-size: var(--f);
        `;
        
        const tbody = document.createElement('tbody');
        
        // Number of sides row
        const sidesRow = document.createElement('tr');
        const sidesLabelCell = document.createElement('td');
        sidesLabelCell.className = 'row-header';
        sidesLabelCell.textContent = 'Number of Sides';
        sidesLabelCell.style.cssText = `
            text-align: right;
            white-space: nowrap;
            width: 12ch;
            padding: calc(var(--f) / 4);
            height: var(--f);
        `;
        
        const sidesInputCell = document.createElement('td');
        sidesInputCell.style.cssText = `padding: calc(var(--f) / 4); height: var(--f); text-align: center;`;
        const sidesInput = document.createElement('input');
        sidesInput.type = 'number';
        sidesInput.id = 'sides';
        sidesInput.min = '3';
        sidesInput.value = '6';
        sidesInput.style.cssText = `
            width: 12ch;
            height: var(--f);
            padding: calc(var(--f) / 4) calc(var(--f) / 2);
            border: 1px solid var(--c-border);
            font-family: inherit;
            font-size: var(--f);
            text-align: center;
            margin: 0 auto;
            display: block;
        `;
        sidesInputCell.appendChild(sidesInput);
        
        const sidesEmptyCell = document.createElement('td');
        sidesEmptyCell.style.cssText = 'width: 12ch;';
        
        sidesRow.appendChild(sidesLabelCell);
        sidesRow.appendChild(sidesInputCell);
        sidesRow.appendChild(sidesEmptyCell);
        tbody.appendChild(sidesRow);
        
        // Wall width row
        const wallRow = document.createElement('tr');
        const wallLabelCell = document.createElement('td');
        wallLabelCell.className = 'row-header';
        wallLabelCell.textContent = 'Wall Width (m)';
        wallLabelCell.style.cssText = `
            text-align: right;
            white-space: nowrap;
            width: 12ch;
            padding: calc(var(--f) / 4);
            height: var(--f);
        `;
        
        const wallInputCell = document.createElement('td');
        wallInputCell.style.cssText = `padding: calc(var(--f) / 4); height: var(--f); text-align: center;`;
        const wallInput = document.createElement('input');
        wallInput.type = 'number';
        wallInput.id = 'wallWidth';
        wallInput.min = '0';
        wallInput.step = '0.001';
        wallInput.value = '0.200';
        wallInput.style.cssText = `
            width: 12ch;
            height: var(--f);
            padding: calc(var(--f) / 4) calc(var(--f) / 2);
            border: 1px solid var(--c-border);
            font-family: inherit;
            font-size: var(--f);
            text-align: center;
            margin: 0 auto;
            display: block;
        `;
        wallInputCell.appendChild(wallInput);
        
        const wallEmptyCell = document.createElement('td');
        wallEmptyCell.style.cssText = 'width: 12ch;';
        
        wallRow.appendChild(wallLabelCell);
        wallRow.appendChild(wallInputCell);
        wallRow.appendChild(wallEmptyCell);
        tbody.appendChild(wallRow);
        
        table.appendChild(tbody);
        return table;
    }
    
    
    
    
    setupEventListeners() {
        // Debounced input handler exactly like reference
        const debounce = (func, wait) => {
            let timeout;
            return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => func(...args), wait);
            };
        };
        
        const handleInputChange = debounce((event) => {
            const { id, value } = event.target;
            const numValue = parseFloat(value);
            
            if (value === "") return;
            if (isNaN(numValue) || numValue <= 0) return;
            
            if (id === "sides") {
                if (numValue >= 3) {
                    this.updateFromSides(numValue);
                }
            } else if (id === "wallWidth") {
                this.updateFromWallWidth(numValue);
            } else {
                const [polygon, measure] = id.split("-");
                this.state.lastChange = { polygon, measure };
                this.updateFromMeasure(polygon, measure, numValue);
            }
        }, 300);
        
        // Add event listeners to all inputs
        setTimeout(() => {
            this.container.querySelectorAll("input").forEach((input) => {
                input.addEventListener("input", handleInputChange);
            });
        }, 100); // Delay to ensure DOM is ready
    }
    
    // Initialize exactly like reference
    initializeState() {
        console.log('🚀 Initializing state...');
        
        // Make sure we have valid initial state
        this.state.outer.apothem = 2.5;
        this.state.inner.apothem = 2.3;
        this.state.wallWidth = 0.2;
        this.state.sides = 6;
        
        // Add toggle state for intermediate lines
        this.showIntermediateLines = true;
        
        // Initial calculation and display exactly like reference line 354
        this.updateFromMeasure("outer", "apothem", this.state.outer.apothem);
    }

    toggleIntermediateLines() {
        this.showIntermediateLines = !this.showIntermediateLines;
        
        // Update button text
        const toggleBtn = this.container.querySelector('.download-buttons').children[2];
        if (toggleBtn) {
            toggleBtn.textContent = this.showIntermediateLines ? 'Hide Lines' : 'Show Lines';
        }
        
        // Refresh visualization
        this.updateVisualization();
    }
    
    createMeasurementsTable(F) {
        const table = document.createElement('table');
        table.className = 'measurements-table';
        table.style.cssText = `
            width: 100%;
            border-collapse: collapse;
            font-family: 'Space Mono', monospace;
            font-size: var(--f);
        `;
        
        // Header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        ['', 'OUTER POLYGON', 'INNER POLYGON'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            th.style.cssText = `
                font-weight: normal;
                padding-bottom: calc(var(--f) / 2);
                border-bottom: 1px solid var(--c-border);
                padding: calc(var(--f) / 4);
                height: var(--f);
                text-align: center;
            `;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Body
        const tbody = document.createElement('tbody');
        
        const measurements = [
            { key: 'apothem', label: 'Apothem (m)' },
            { key: 'circumradius', label: 'Circumradius (m)' },
            { key: 'sideLength', label: 'Side Length (m)' },
            { key: 'perimeter', label: 'Perimeter (m)' },
            { key: 'area', label: 'Area (m²)' }
        ];
        
        measurements.forEach(({ key, label }) => {
            const row = document.createElement('tr');
            
            // Label cell
            const labelCell = document.createElement('td');
            labelCell.className = 'row-header';
            labelCell.textContent = label;
            labelCell.style.cssText = `
                text-align: right;
                white-space: nowrap;
                width: 12ch;
                padding: calc(var(--f) / 4);
                height: var(--f);
            `;
            row.appendChild(labelCell);
            
            // Outer input cell
            const outerCell = document.createElement('td');
            outerCell.style.cssText = `padding: calc(var(--f) / 4); height: var(--f); text-align: center;`;
            const outerInput = document.createElement('input');
            outerInput.type = 'number';
            outerInput.id = `outer-${key}`;
            outerInput.step = '0.001';
            outerInput.style.cssText = `
                width: 12ch;
                height: var(--f);
                padding: calc(var(--f) / 4) calc(var(--f) / 2);
                border: 1px solid var(--c-border);
                font-family: inherit;
                font-size: var(--f);
                text-align: center;
                margin: 0 auto;
                display: block;
            `;
            outerCell.appendChild(outerInput);
            row.appendChild(outerCell);
            
            // Inner input cell
            const innerCell = document.createElement('td');
            innerCell.style.cssText = `padding: calc(var(--f) / 4); height: var(--f); text-align: center;`;
            const innerInput = document.createElement('input');
            innerInput.type = 'number';
            innerInput.id = `inner-${key}`;
            innerInput.step = '0.001';
            innerInput.style.cssText = `
                width: 12ch;
                height: var(--f);
                padding: calc(var(--f) / 4) calc(var(--f) / 2);
                border: 1px solid var(--c-border);
                font-family: inherit;
                font-size: var(--f);
                text-align: center;
                margin: 0 auto;
                display: block;
            `;
            innerCell.appendChild(innerInput);
            row.appendChild(innerCell);
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        return table;
    }
    
    createTableRow(label, input) {
        const row = document.createElement('tr');
        
        const labelCell = document.createElement('td');
        labelCell.textContent = label;
        labelCell.style.cssText = `
            padding: calc(var(--f) * 0.5);
            border: 1px solid var(--c-border);
            font-weight: bold;
            background: var(--c-bg-alt);
        `;
        
        const inputCell = document.createElement('td');
        inputCell.style.cssText = `padding: calc(var(--f) * 0.25); border: 1px solid var(--c-border);`;
        inputCell.appendChild(input);
        
        const emptyCell = document.createElement('td');
        emptyCell.style.cssText = `border: 1px solid var(--c-border);`;
        
        row.appendChild(labelCell);
        row.appendChild(inputCell);
        row.appendChild(emptyCell);
        
        return row;
    }
    
    createNumericTableInput(value, min, max, step, onChange) {
        const input = document.createElement('input');
        input.type = 'number';
        input.value = value.toFixed(3);
        if (min !== undefined) input.min = min;
        if (max !== undefined) input.max = max;
        input.step = step || 0.001;
        
        input.style.cssText = `
            width: 100%;
            padding: calc(var(--f) * 0.25);
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Space Mono', monospace;
            font-size: var(--f);
            box-sizing: border-box;
        `;
        
        let timeout;
        input.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const numValue = parseFloat(e.target.value);
                if (!isNaN(numValue) && numValue > 0) {
                    onChange(numValue);
                }
            }, 300);
        });
        
        return input;
    }
    
    renderGlossary() {
        const glossaryContainer = document.createElement('div');
        glossaryContainer.style.cssText = `
            margin-top: var(--f);
            padding: var(--f);
            border: 1px solid var(--c-border);
            background: var(--c-border);
            color: #000000;
        `;
        
        const glossaryTitle = document.createElement('h2');
        glossaryTitle.textContent = 'MATHEMATICAL GLOSSARY';
        glossaryTitle.style.cssText = `
            font-size: var(--f);
            margin-bottom: var(--f);
            padding-bottom: calc(var(--f) / 2);
            font-weight: normal;
            border-bottom: 1px solid #000000;
            color: #000000;
        `;
        glossaryContainer.appendChild(glossaryTitle);
        
        const sections = [
            {
                title: 'Variables',
                content: `n = number of sides
a = apothem (distance from center to middle of side)
R = circumradius (distance from center to vertex)
s = side length
P = perimeter
A = area
θ = π/n (half angle between vertices from center)`
            },
            {
                title: 'Converting to Apothem',
                content: `From circumradius:    a = R cos(π/n)
From side length:     a = s/(2 tan(π/n))
From perimeter:       a = P/(2n tan(π/n))
From area:            a = √(A/(n tan(π/n)))`
            },
            {
                title: 'Calculating from Apothem',
                content: `Circumradius:        R = a/cos(π/n)
Side length:         s = 2a tan(π/n)
Perimeter:           P = n × s
Area:                A = (n × s × a)/2`
            }
        ];
        
        sections.forEach(section => {
            const sectionEl = document.createElement('section');
            sectionEl.style.cssText = `margin-bottom: var(--f);`;
            
            const sectionTitle = document.createElement('h3');
            sectionTitle.textContent = section.title;
            sectionTitle.style.cssText = `
                font-size: var(--f);
                margin-bottom: calc(var(--f) / 2);
                color: #000000;
            `;
            sectionEl.appendChild(sectionTitle);
            
            const pre = document.createElement('pre');
            pre.textContent = section.content;
            pre.style.cssText = `
                font-family: 'Space Mono', monospace;
                font-size: var(--f);
                margin: 0;
                white-space: pre-wrap;
                color: #000000;
            `;
            sectionEl.appendChild(pre);
            
            glossaryContainer.appendChild(sectionEl);
        });
        
        this.container.appendChild(glossaryContainer);
    }
    
    // Update Functions exactly like reference
    updateFromSides(newSides) {
        const { polygon, measure } = this.state.lastChange;
        const lastValue = this.state[polygon][measure];
        const newApothem = this.getApothemFrom[measure](lastValue, newSides);
        
        if (newApothem === null) return;
        this.updateState(newSides, this.state.wallWidth, newApothem);
    }
    
    updateFromWallWidth(newWallWidth) {
        if (this.state.outer.apothem <= newWallWidth) return;
        this.updateState(this.state.sides, newWallWidth, this.state.outer.apothem);
    }
    
    updateFromMeasure(polygon, measure, value) {
        const newApothem = this.getApothemFrom[measure](value, this.state.sides);
        
        if (newApothem === null) return;
        
        if (polygon === "outer") {
            this.updateState(this.state.sides, this.state.wallWidth, newApothem);
        } else {
            if (this.state.outer.apothem <= newApothem) return;
            const newWallWidth = this.state.outer.apothem - newApothem;
            this.updateState(this.state.sides, newWallWidth, this.state.outer.apothem);
        }
    }
    
    updateState(sides, wallWidth, outerApothem) {
        const outer = this.getFromApothem(outerApothem, sides);
        const inner = this.getFromApothem(outerApothem - wallWidth, sides);
        
        if (!outer || !inner) return;
        
        this.state = {
            ...this.state,
            sides,
            wallWidth,
            outer,
            inner
        };
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        // Update primary inputs exactly like reference
        const sidesInput = document.getElementById("sides");
        if (sidesInput) sidesInput.value = this.state.sides;
        
        const wallInput = document.getElementById("wallWidth");
        if (wallInput) wallInput.value = this.state.wallWidth.toFixed(3);
        
        // Update measurements exactly like reference
        const measurements = [
            "apothem",
            "circumradius", 
            "sideLength",
            "perimeter",
            "area"
        ];
        measurements.forEach((measure) => {
            ["outer", "inner"].forEach((polygon) => {
                const input = document.getElementById(`${polygon}-${measure}`);
                if (input) {
                    const value = this.state[polygon][measure];
                    input.value = value.toFixed(3);
                }
            });
        });
        
        this.updateVisualization();
    }
    
    // Geometry calculations exactly like reference
    getApothemFrom = {
        circumradius: (value, sides) => {
            if (value <= 0) return null;
            return value * Math.cos(Math.PI / sides);
        },
        sideLength: (value, sides) => {
            if (value <= 0) return null;
            return value / (2 * Math.tan(Math.PI / sides));
        },
        perimeter: (value, sides) => {
            if (value <= 0) return null;
            return value / (2 * sides * Math.tan(Math.PI / sides));
        },
        area: (value, sides) => {
            if (value <= 0) return null;
            return Math.sqrt(value / (sides * Math.tan(Math.PI / sides)));
        },
        apothem: (value) => (value <= 0 ? null : value)
    };
    
    getFromApothem(apothem, sides) {
        if (!sides || sides < 3 || apothem <= 0) return null;
        
        const sideLength = 2 * apothem * Math.tan(Math.PI / sides);
        const circumradius = apothem / Math.cos(Math.PI / sides);
        const perimeter = sides * sideLength;
        const area = (sides * sideLength * apothem) / 2;
        
        return {
            apothem: Number(apothem.toFixed(3)),
            circumradius: Number(circumradius.toFixed(3)),
            sideLength: Number(sideLength.toFixed(3)),
            perimeter: Number(perimeter.toFixed(3)),
            area: Number(area.toFixed(3))
        };
    }
    
    
    
    updateVisualization() {
        if (!this.svg) return;
        
        // Calculate dynamic viewBox based on polygon size
        const maxRadius = Math.max(
            this.state.outer.circumradius || 0,
            this.state.inner.circumradius || 0
        );
        
        // Add padding around the polygon (20% extra space)
        const padding = maxRadius * 0.2;
        const viewSize = (maxRadius + padding) * 2;
        const viewCenter = maxRadius + padding;
        
        // Minimum viewBox to ensure small polygons are visible
        const minViewSize = 6;
        const finalViewSize = Math.max(viewSize, minViewSize);
        const finalCenter = finalViewSize / 2;
        
        const viewBoxString = `-${finalCenter} -${finalCenter} ${finalViewSize} ${finalViewSize}`;
        this.svg.setAttributeNS(null, 'viewBox', viewBoxString);
        
        this.svg.innerHTML = '';
        
        // Add CSS styles for polygon classes (matching reference exactly)
        // Force recreation to ensure styles are applied
        const existingStyle = document.querySelector('#polygon-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        const style = document.createElement('style');
        style.id = 'polygon-styles';
        // Scale stroke widths and font sizes based on viewBox
        const baseStroke = Math.max(0.01, finalCenter * 0.002);
        const thickStroke = baseStroke * 2;
        const fontSize = Math.max(0.1, finalCenter * 0.02);
        
        style.textContent = `
            #polygon-display .grid-line { stroke: var(--vga-gray) !important; stroke-width: ${baseStroke} !important; }
            #polygon-display .grid-marker { stroke: var(--vga-gray) !important; stroke-width: ${baseStroke} !important; }
            #polygon-display .grid-label { font-family: 'Space Mono', monospace !important; font-size: ${fontSize}px !important; text-anchor: middle !important; fill: var(--vga-gray) !important; }
            #polygon-display .intermediate-polygon { fill: none !important; stroke: var(--vga-gray) !important; stroke-width: ${baseStroke} !important; }
            #polygon-display .main-polygon { fill: none !important; stroke: var(--vga-silver) !important; stroke-width: ${thickStroke} !important; }
            #polygon-display .center-point { fill: var(--vga-silver) !important; }
        `;
        document.head.appendChild(style);
        
        // Create grid scaled to current viewBox
        const gridGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const gridExtent = finalCenter;
        const tickSize = gridExtent * 0.02;
        const labelOffset = gridExtent * 0.05;
        
        // Generate grid markers based on the size
        const numTicks = Math.min(8, Math.max(3, Math.floor(gridExtent)));
        const tickValues = [];
        for (let i = -numTicks; i <= numTicks; i++) {
            if (i !== 0) {
                const value = (i * gridExtent) / numTicks;
                tickValues.push(value);
            }
        }
        
        gridGroup.innerHTML = `
            <line x1="-${gridExtent}" y1="0" x2="${gridExtent}" y2="0" class="grid-line" />
            <line x1="0" y1="-${gridExtent}" x2="0" y2="${gridExtent}" class="grid-line" />
            ${tickValues
              .map(
                (val) => `
                <line x1="${val}" y1="-${tickSize}" x2="${val}" y2="${tickSize}" class="grid-marker" />
                <line x1="-${tickSize}" y1="${val}" x2="${tickSize}" y2="${val}" class="grid-marker" />
                <text x="${val}" y="${labelOffset}" class="grid-label">${Math.abs(val).toFixed(1)}m</text>
            `
              )
              .join("")}
        `;
        this.svg.appendChild(gridGroup);
        
        // Add intermediate polygons only if toggle is on
        if (this.showIntermediateLines) {
            let currentRadius = this.state.inner.circumradius - this.state.wallWidth;
            while (currentRadius > 0) {
                const path = this.createPolygonPath(currentRadius, "intermediate-polygon");
                if (path) {
                    this.svg.appendChild(path);
                }
                currentRadius -= this.state.wallWidth;
            }
        }
        
        // Add main polygons (exactly like reference)
        const outerPath = this.createPolygonPath(this.state.outer.circumradius, "main-polygon");
        const innerPath = this.createPolygonPath(this.state.inner.circumradius, "main-polygon");
        
        if (outerPath) {
            // Add inline styles as fallback
            outerPath.setAttribute('fill', 'none');
            outerPath.setAttribute('stroke', '#000000');
            outerPath.setAttribute('stroke-width', '0.02');
            this.svg.appendChild(outerPath);
            console.log('🔴 Added outer polygon with radius:', this.state.outer.circumradius);
        } else {
            console.log('❌ No outer path created');
        }
        
        if (innerPath) {
            // Add inline styles as fallback
            innerPath.setAttribute('fill', 'none');
            innerPath.setAttribute('stroke', '#000000');
            innerPath.setAttribute('stroke-width', '0.02');
            this.svg.appendChild(innerPath);
            console.log('🟢 Added inner polygon with radius:', this.state.inner.circumradius);
        } else {
            console.log('❌ No inner path created');
        }
        
        // Add center point scaled to viewBox
        const center = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        center.setAttribute("cx", "0");
        center.setAttribute("cy", "0");
        center.setAttribute("r", Math.max(0.02, finalCenter * 0.01)); // Scale with viewBox
        center.setAttribute("class", "center-point");
        center.setAttribute("fill", "var(--vga-silver)"); // Inline style fallback
        this.svg.appendChild(center);
        
        console.log('🎨 Visualization complete');
    }
    
    generatePolygonPoints(radius, sides) {
        if (!sides || sides < 3 || !radius || radius <= 0) return [];
        const points = [];
        for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
            points.push({
                x: radius * Math.cos(angle),
                y: radius * Math.sin(angle)
            });
        }
        return points;
    }
    
    pointsToPath(points) {
        if (!points.length) return "";
        return (
            points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ") +
            " Z"
        );
    }
    
    createPolygonPath(radius, className) {
        const points = this.generatePolygonPoints(radius, this.state.sides);
        if (points.length === 0) return null;

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", this.pointsToPath(points));
        path.setAttribute("class", className);
        return path;
    }
    
    downloadSVG() {
        const svgContent = this.getSVGContent();
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `polygon_n${this.state.sides}_w${this.state.wallWidth.toFixed(3)}.svg`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
    
    downloadPNG() {
        const svgContent = this.getSVGContent(800, 600);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 800;
        canvas.height = 600;
        
        const image = new Image();
        image.onload = () => {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 800, 600);
            ctx.drawImage(image, 0, 0);
            
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `polygon_n${this.state.sides}_w${this.state.wallWidth.toFixed(3)}.png`;
                link.click();
                URL.revokeObjectURL(url);
            }, 'image/png');
        };
        
        image.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgContent)));
    }
    
    getSVGContent(width = '100%', height = '100%') {
        // Use the direct SVG element instead of svgDisplay component
        return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg width="${width}" height="${height}" viewBox="-3 -3 6 6" 
     version="1.1" xmlns="http://www.w3.org/2000/svg">
    <metadata>
        ${JSON.stringify({
            sides: this.state.sides,
            wallWidth: this.state.wallWidth,
            outer: this.state.outer,
            inner: this.state.inner,
            date: new Date().toISOString()
        })}
    </metadata>
    <rect x="-3" y="-3" width="6" height="6" fill="white"/>
    ${this.svg ? this.svg.innerHTML : ''}
</svg>`;
    }
    
    destroy() {
        ComponentLibrary.destroyTracked(this.componentInstances);
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Register globally
window.PolygonCalculator = PolygonCalculator;
