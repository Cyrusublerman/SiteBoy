/**
 * Font Size Comparison Tool - SiteBoy Framework
 * 
 * Real-time comparison of fonts with scaling controls
 * Integrates with SiteBoy component system and aesthetic rules
 * 
 * @version 1.0.0
 * @dependencies ComponentLibrary
 */

class FontSizeComparison {
    constructor(container, deps = {}) {
        this.container = container;
        this.deps = deps;
        this.componentInstances = [];
        this.state = {
            customText: 'The quick brown fox jumps over the lazy dog',
            fontSize: 32,
            fonts: [
                {
                    name: 'Space Mono',
                    display: 'inline-block',
                    scaleX: 100,
                    scaleY: 100,
                    letterSpacing: 0,
                    wordSpacing: 0,
                    lineHeight: 1.2
                },
                {
                    name: 'Atkinson Hyperlegible',
                    display: 'inline-block',
                    scaleX: 100,
                    scaleY: 100,
                    letterSpacing: 0,
                    wordSpacing: 0,
                    lineHeight: 1.2
                },
                {
                    name: 'Atkinson Hyperlegible Mono',
                    display: 'inline-block',
                    scaleX: 100,
                    scaleY: 100,
                    letterSpacing: 0,
                    wordSpacing: 0,
                    lineHeight: 1.2
                }
            ]
        };
    }
    
    render() {
        this.destroy();
        
        const title = new ComponentLibrary.Heading({
            level: 1,
            content: 'FONT SIZE COMPARISON'
        });
        this.componentInstances.push(title);
        this.container.appendChild(title.render());
        
        const description = new ComponentLibrary.Paragraph({
            content: 'Compare font characteristics with precise scaling controls. All measurements derived from F=12px mathematical foundation.'
        });
        this.componentInstances.push(description);
        this.container.appendChild(description.render());
        
        // Global controls
        this.renderGlobalControls();
        
        // Font controls
        this.renderFontControls();
        
        // Font display
        this.renderFontDisplay();
        
        // Comparison metrics
        this.renderComparisonMetrics();
        
        // Initial update
        this.updateDisplay();
    }
    
    renderGlobalControls() {
        const globalGrid = new ComponentLibrary.Grid({
            items: [
                this.createCustomTextInput(),
                this.createFontSizeInput()
            ],
            cols: 2
        });
        
        this.componentInstances.push(globalGrid);
        this.container.appendChild(globalGrid.render());
    }
    
    createCustomTextInput() {
        const container = document.createElement('div');
        
        const label = document.createElement('label');
        label.textContent = 'Custom Text:';
        label.style.cssText = `
            display: block;
            margin-bottom: calc(var(--f) * 0.5);
            font-size: calc(var(--f) * 0.8);
            font-family: 'Space Mono', monospace;
            color: var(--c-text);
        `;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = this.state.customText;
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
            this.state.customText = e.target.value;
            this.updateDisplay();
        });
        
        container.appendChild(label);
        container.appendChild(input);
        return container;
    }
    
    createFontSizeInput() {
        const fontSizeInput = new ComponentLibrary.NumericInput({
            label: 'Font Size (px):',
            value: this.state.fontSize,
            min: 8,
            max: 100,
            step: 1,
            onChange: (value) => {
                this.state.fontSize = value;
                this.updateDisplay();
            }
        });
        
        this.componentInstances.push(fontSizeInput);
        return fontSizeInput.render();
    }
    
    renderFontControls() {
        const controlsContainer = document.createElement('div');
        controlsContainer.style.cssText = `
            margin: var(--f) 0;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: var(--f);
        `;
        
        this.state.fonts.forEach((font, index) => {
            const fontPanel = this.createFontControlPanel(font, index);
            controlsContainer.appendChild(fontPanel);
        });
        
        this.container.appendChild(controlsContainer);
    }
    
    createFontControlPanel(font, index) {
        const panel = document.createElement('div');
        panel.style.cssText = `
            border: 1px solid var(--c-border);
            padding: var(--f);
            background: var(--c-bg);
        `;
        
        const title = document.createElement('h3');
        title.textContent = font.name;
        title.style.cssText = `
            margin: 0 0 var(--f) 0;
            font-size: calc(var(--f) * 1.2);
            font-family: 'Space Mono', monospace;
            color: var(--c-text);
        `;
        panel.appendChild(title);
        
        // Display type
        const displaySelect = this.createSelect('Display:', font.display, 
            ['inline-block', 'inline', 'block'], 
            (value) => {
                font.display = value;
                this.updateDisplay();
            }
        );
        panel.appendChild(displaySelect);
        
        // Scale X
        const scaleXInput = this.createNumericControl('Scale X:', font.scaleX, 10, 200, 1,
            (value) => {
                font.scaleX = value;
                this.updateDisplay();
            }
        );
        panel.appendChild(scaleXInput);
        
        // Scale Y
        const scaleYInput = this.createNumericControl('Scale Y:', font.scaleY, 10, 200, 1,
            (value) => {
                font.scaleY = value;
                this.updateDisplay();
            }
        );
        panel.appendChild(scaleYInput);
        
        // Letter Spacing
        const letterSpacingInput = this.createNumericControl('Letter Spacing:', font.letterSpacing, -5, 20, 0.1,
            (value) => {
                font.letterSpacing = value;
                this.updateDisplay();
            }
        );
        panel.appendChild(letterSpacingInput);
        
        // Word Spacing
        const wordSpacingInput = this.createNumericControl('Word Spacing:', font.wordSpacing, -5, 20, 0.1,
            (value) => {
                font.wordSpacing = value;
                this.updateDisplay();
            }
        );
        panel.appendChild(wordSpacingInput);
        
        // Line Height
        const lineHeightInput = this.createNumericControl('Line Height:', font.lineHeight, 0.5, 3, 0.1,
            (value) => {
                font.lineHeight = value;
                this.updateDisplay();
            }
        );
        panel.appendChild(lineHeightInput);
        
        return panel;
    }
    
    createSelect(label, value, options, onChange) {
        const container = document.createElement('div');
        container.style.cssText = `margin-bottom: calc(var(--f) * 0.75);`;
        
        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        labelEl.style.cssText = `
            display: block;
            margin-bottom: calc(var(--f) * 0.25);
            font-size: calc(var(--f) * 0.7);
            font-family: 'Space Mono', monospace;
            color: var(--c-text);
        `;
        
        const select = document.createElement('select');
        select.style.cssText = `
            width: 100%;
            padding: calc(var(--f) * 0.25) calc(var(--f) * 0.5);
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Space Mono', monospace;
            font-size: calc(var(--f) * 0.7);
        `;
        
        options.forEach(option => {
            const optionEl = document.createElement('option');
            optionEl.value = option;
            optionEl.textContent = option;
            optionEl.selected = option === value;
            select.appendChild(optionEl);
        });
        
        select.addEventListener('change', (e) => onChange(e.target.value));
        
        container.appendChild(labelEl);
        container.appendChild(select);
        return container;
    }
    
    createNumericControl(label, value, min, max, step, onChange) {
        const container = document.createElement('div');
        container.style.cssText = `margin-bottom: calc(var(--f) * 0.75);`;
        
        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        labelEl.style.cssText = `
            display: block;
            margin-bottom: calc(var(--f) * 0.25);
            font-size: calc(var(--f) * 0.7);
            font-family: 'Space Mono', monospace;
            color: var(--c-text);
        `;
        
        const input = document.createElement('input');
        input.type = 'number';
        input.value = value;
        input.min = min;
        input.max = max;
        input.step = step;
        input.style.cssText = `
            width: 100%;
            padding: calc(var(--f) * 0.25) calc(var(--f) * 0.5);
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Space Mono', monospace;
            font-size: calc(var(--f) * 0.7);
            box-sizing: border-box;
        `;
        
        input.addEventListener('input', (e) => {
            const numValue = parseFloat(e.target.value);
            if (!isNaN(numValue)) {
                onChange(numValue);
            }
        });
        
        container.appendChild(labelEl);
        container.appendChild(input);
        return container;
    }
    
    renderFontDisplay() {
        this.displayContainer = document.createElement('div');
        this.displayContainer.style.cssText = `
            margin: var(--f) 0;
            padding: var(--f);
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            min-height: calc(var(--f) * 10);
        `;
        
        this.textElements = [];
        this.state.fonts.forEach((font, index) => {
            const textElement = document.createElement('p');
            textElement.style.cssText = `
                margin: var(--f) 0;
                padding: calc(var(--f) * 0.5);
                border-bottom: 1px solid var(--c-border);
            `;
            this.textElements.push(textElement);
            this.displayContainer.appendChild(textElement);
        });
        
        this.container.appendChild(this.displayContainer);
    }
    
    renderComparisonMetrics() {
        this.metricsContainer = document.createElement('div');
        this.metricsContainer.style.cssText = `
            margin-top: var(--f);
            padding: var(--f);
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            font-family: 'Space Mono', monospace;
            font-size: calc(var(--f) * 0.8);
        `;
        
        this.container.appendChild(this.metricsContainer);
    }
    
    measureFont(fontName, fontSize) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.font = `${fontSize}px "${fontName}"`;
        
        const testString = this.state.customText;
        const capitalHeight = ctx.measureText('H').actualBoundingBoxAscent;
        const xHeight = ctx.measureText('x').actualBoundingBoxAscent;
        const emBoxWidth = ctx.measureText('M').width;
        const avgCharWidth = ctx.measureText(testString).width / testString.length;
        
        return {
            font: fontName,
            size: fontSize,
            capitalHeight,
            xHeight,
            emBoxWidth,
            avgCharWidth,
            capitalHeightRatio: capitalHeight / fontSize,
            xHeightRatio: xHeight / fontSize,
            emBoxWidthRatio: emBoxWidth / fontSize,
            avgCharWidthRatio: avgCharWidth / fontSize
        };
    }
    
    updateDisplay() {
        // Update text displays
        this.state.fonts.forEach((font, index) => {
            if (this.textElements[index]) {
                const element = this.textElements[index];
                element.style.fontFamily = `"${font.name}", monospace`;
                element.style.fontSize = `${this.state.fontSize}px`;
                element.style.display = font.display;
                element.style.transform = `scale(${font.scaleX / 100}, ${font.scaleY / 100})`;
                element.style.letterSpacing = `${font.letterSpacing}px`;
                element.style.wordSpacing = `${font.wordSpacing}px`;
                element.style.lineHeight = font.lineHeight;
                element.textContent = this.state.customText;
            }
        });
        
        // Update comparison metrics
        const measurements = this.state.fonts.map(font => 
            this.measureFont(font.name, this.state.fontSize)
        );
        
        const baseFont = measurements[0];
        const comparisons = measurements.map(m => {
            const charRatio = baseFont.avgCharWidth / m.avgCharWidth;
            return `
                <strong>${m.font}</strong><br>
                Capital Height: ${m.capitalHeight.toFixed(2)}px (${(m.capitalHeight / baseFont.capitalHeight * 100).toFixed(2)}% of ${baseFont.font})<br>
                x-Height: ${m.xHeight.toFixed(2)}px (${(m.xHeight / baseFont.xHeight * 100).toFixed(2)}% of ${baseFont.font})<br>
                Em Box Width: ${m.emBoxWidth.toFixed(2)}px (${(m.emBoxWidth / baseFont.emBoxWidth * 100).toFixed(2)}% of ${baseFont.font})<br>
                Avg Char Width: ${m.avgCharWidth.toFixed(2)}px (${(m.avgCharWidth / baseFont.avgCharWidth * 100).toFixed(2)}% of ${baseFont.font})<br>
                Character Ratio: 1 character of ${baseFont.font} = ${charRatio.toFixed(4)} characters of ${m.font}
            `;
        }).join('<hr style="margin: var(--f) 0; border: 1px solid var(--c-border);">');
        
        this.metricsContainer.innerHTML = `
            <h3>Comparison (relative to ${baseFont.font}):</h3>
            ${comparisons}
        `;
    }
    
    destroy() {
        ComponentLibrary.destroyTracked(this.componentInstances);
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Register globally
window.FontSizeComparison = FontSizeComparison;
