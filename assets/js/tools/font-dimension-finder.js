/**
 * Font Dimension Finder Tool - SiteBoy Framework
 * 
 * Visualizes font metrics with precise canvas measurements
 * Integrates with SiteBoy component system and aesthetic rules
 * 
 * @version 1.0.0
 * @dependencies ComponentLibrary
 */

class FontDimensionFinder {
    constructor(container, deps = {}) {
        this.container = container;
        this.deps = deps;
        this.componentInstances = [];
        this.state = {
            font: 'Space Mono',
            fontSize: 200,
            letter: 'A'
        };
        this.availableFonts = [
            'Space Mono',
            'Atkinson Hyperlegible',
            'Atkinson Hyperlegible Mono'
        ];
    }
    
    render() {
        this.destroy();
        
        const title = new ComponentLibrary.Heading({
            level: 1,
            content: 'FONT DIMENSION FINDER'
        });
        this.componentInstances.push(title);
        this.container.appendChild(title.render());
        
        const description = new ComponentLibrary.Paragraph({
            content: 'Visualize font metrics with mathematical precision. All dimensions derived from F=12px base unit.'
        });
        this.componentInstances.push(description);
        this.container.appendChild(description.render());
        
        // Controls section
        this.renderControls();
        
        // Canvas section
        this.renderCanvas();
        
        // Metrics display
        this.renderMetricsDisplay();
        
        // Initial render
        this.updateVisualization();
    }
    
    renderControls() {
        const controlsGrid = new ComponentLibrary.Grid({
            items: [
                this.createFontSelect(),
                this.createFontSizeInput(),
                this.createLetterInput()
            ],
            cols: 3
        });
        
        this.componentInstances.push(controlsGrid);
        this.container.appendChild(controlsGrid.render());
    }
    
    createFontSelect() {
        const container = document.createElement('div');
        
        const label = document.createElement('label');
        label.textContent = 'Font Family:';
        label.style.cssText = `
            display: block;
            margin-bottom: calc(var(--f) * 0.5);
            font-size: calc(var(--f) * 0.8);
            font-family: 'Space Mono', monospace;
            color: var(--c-text);
        `;
        
        const select = document.createElement('select');
        select.style.cssText = `
            width: 100%;
            padding: calc(var(--f) * 0.5) calc(var(--f) * 0.75);
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Space Mono', monospace;
            font-size: calc(var(--f) * 0.8);
        `;
        
        this.availableFonts.forEach(font => {
            const option = document.createElement('option');
            option.value = font;
            option.textContent = font;
            option.selected = font === this.state.font;
            select.appendChild(option);
        });
        
        select.addEventListener('change', (e) => {
            this.state.font = e.target.value;
            this.updateVisualization();
        });
        
        container.appendChild(label);
        container.appendChild(select);
        return container;
    }
    
    createFontSizeInput() {
        const fontSizeInput = new ComponentLibrary.NumericInput({
            label: 'Font Size (px):',
            value: this.state.fontSize,
            min: 50,
            max: 400,
            step: 1,
            onChange: (value) => {
                this.state.fontSize = value;
                this.updateVisualization();
            }
        });
        
        this.componentInstances.push(fontSizeInput);
        return fontSizeInput.render();
    }
    
    createLetterInput() {
        const container = document.createElement('div');
        
        const label = document.createElement('label');
        label.textContent = 'Letter:';
        label.style.cssText = `
            display: block;
            margin-bottom: calc(var(--f) * 0.5);
            font-size: calc(var(--f) * 0.8);
            font-family: 'Space Mono', monospace;
            color: var(--c-text);
        `;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 1;
        input.value = this.state.letter;
        input.style.cssText = `
            width: 100%;
            padding: calc(var(--f) * 0.5) calc(var(--f) * 0.75);
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Space Mono', monospace;
            font-size: calc(var(--f) * 0.8);
            text-align: center;
            box-sizing: border-box;
        `;
        
        input.addEventListener('input', (e) => {
            const value = e.target.value.slice(-1); // Take only the last character
            e.target.value = value;
            this.state.letter = value || 'A';
            this.updateVisualization();
        });
        
        container.appendChild(label);
        container.appendChild(input);
        return container;
    }
    
    renderCanvas() {
        this.canvasComponent = new ComponentLibrary.MathematicalCanvas({
            width: 800,
            height: 600,
            drawFunction: (ctx, width, height) => {
                this.drawFontMetrics(ctx, width, height);
            }
        });
        
        this.componentInstances.push(this.canvasComponent);
        this.container.appendChild(this.canvasComponent.render());
    }
    
    renderMetricsDisplay() {
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
    
    measureFont() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.font = `${this.state.fontSize}px "${this.state.font}"`;
        
        const metrics = ctx.measureText(this.state.letter);
        
        const ascent = Math.abs(metrics.fontBoundingBoxAscent);
        const descent = Math.abs(metrics.fontBoundingBoxDescent);
        const actualWidth = metrics.actualBoundingBoxRight - metrics.actualBoundingBoxLeft;

        return {
            ascent,
            descent,
            xHeight: ctx.measureText('x').actualBoundingBoxAscent,
            capHeight: ctx.measureText('H').actualBoundingBoxAscent,
            leftBearing: metrics.actualBoundingBoxLeft,
            rightBearing: metrics.width - metrics.actualBoundingBoxRight,
            width: actualWidth,
            advance: metrics.width,
            actualBoundingBoxAscent: metrics.actualBoundingBoxAscent,
            actualBoundingBoxDescent: metrics.actualBoundingBoxDescent,
            actualBoundingBoxLeft: metrics.actualBoundingBoxLeft,
            actualBoundingBoxRight: metrics.actualBoundingBoxRight
        };
    }
    
    drawFontMetrics(ctx, canvasWidth, canvasHeight) {
        const metrics = this.measureFont();
        const margin = 50;
        const startX = margin;
        const startY = margin + metrics.ascent;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.fillStyle = 'var(--c-bg)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Set text styles
        ctx.font = `${this.state.fontSize}px "${this.state.font}"`;
        ctx.fillStyle = 'var(--c-text)';
        ctx.strokeStyle = 'var(--c-border)';
        ctx.lineWidth = 1;
        
        // Draw advance width rectangle
        ctx.strokeStyle = 'var(--vga-gray)';
        ctx.strokeRect(startX, startY - metrics.ascent, metrics.advance, metrics.ascent + metrics.descent);
        
        // Draw bounding box
        ctx.strokeStyle = 'var(--vga-red)';
        ctx.strokeRect(
            startX + metrics.actualBoundingBoxLeft,
            startY - metrics.actualBoundingBoxAscent,
            metrics.width,
            metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
        );
        
        // Draw the letter
        ctx.fillStyle = 'var(--c-text)';
        ctx.textAlign = 'left';
        ctx.fillText(this.state.letter, startX, startY);
        
        // Draw metric lines with labels
        this.drawHorizontalLine(ctx, startY - metrics.ascent, 'Ascent', 'var(--vga-red)', canvasWidth);
        this.drawHorizontalLine(ctx, startY, 'Baseline', 'var(--vga-green)', canvasWidth);
        this.drawHorizontalLine(ctx, startY + metrics.descent, 'Descent', 'var(--vga-blue)', canvasWidth);
        this.drawHorizontalLine(ctx, startY - metrics.capHeight, 'Cap Height', 'var(--vga-magenta)', canvasWidth);
        this.drawHorizontalLine(ctx, startY - metrics.xHeight, 'x-Height', 'var(--vga-yellow)', canvasWidth);
        
        // Draw vertical lines
        this.drawVerticalLine(ctx, startX, startY - metrics.ascent, metrics.ascent + metrics.descent, 'Left Edge', 'var(--vga-cyan)');
        this.drawVerticalLine(ctx, startX + metrics.advance, startY - metrics.ascent, metrics.ascent + metrics.descent, 'Advance Width', 'var(--vga-cyan)');
    }
    
    drawHorizontalLine(ctx, y, label, color, canvasWidth) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
        
        // Label
        ctx.fillStyle = color;
        ctx.font = '12px "Space Mono"';
        ctx.fillText(label, 5, y - 5);
    }
    
    drawVerticalLine(ctx, x, y, height, label, color) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + height);
        ctx.stroke();
        
        // Label (rotated)
        ctx.save();
        ctx.translate(x, y + height);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = color;
        ctx.font = '12px "Space Mono"';
        ctx.fillText(label, 5, -5);
        ctx.restore();
    }
    
    updateVisualization() {
        // Recreate the canvas component following SiteBoy pattern
        if (this.canvasComponent) {
            // Remove old canvas from DOM and component tracking
            const canvasElement = this.canvasComponent.element;
            if (canvasElement && canvasElement.parentNode) {
                canvasElement.parentNode.removeChild(canvasElement);
            }
            // Remove from component instances
            const index = this.componentInstances.indexOf(this.canvasComponent);
            if (index > -1) {
                this.componentInstances.splice(index, 1);
            }
        }
        
        // Create new canvas component with updated drawing
        this.canvasComponent = new ComponentLibrary.MathematicalCanvas({
            width: 800,
            height: 600,
            drawFunction: (ctx, width, height) => {
                this.drawFontMetrics(ctx, width, height);
            }
        });
        
        this.componentInstances.push(this.canvasComponent);
        this.container.appendChild(this.canvasComponent.render());

        // Update metrics display
        const metrics = this.measureFont();
        const ratios = {};
        for (let [key, value] of Object.entries(metrics)) {
            ratios[key] = value / this.state.fontSize;
        }
        
        this.metricsContainer.innerHTML = `
            <h3>Font Metrics</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--f);">
                <div>
                    <h4>Vertical Measurements</h4>
                    <p>Ascent: ${metrics.ascent.toFixed(2)}px (${ratios.ascent.toFixed(3)})</p>
                    <p>Descent: ${metrics.descent.toFixed(2)}px (${ratios.descent.toFixed(3)})</p>
                    <p>Cap Height: ${metrics.capHeight.toFixed(2)}px (${ratios.capHeight.toFixed(3)})</p>
                    <p>x-Height: ${metrics.xHeight.toFixed(2)}px (${ratios.xHeight.toFixed(3)})</p>
                </div>
                <div>
                    <h4>Horizontal Measurements</h4>
                    <p>Width: ${metrics.width.toFixed(2)}px (${ratios.width.toFixed(3)})</p>
                    <p>Advance: ${metrics.advance.toFixed(2)}px (${ratios.advance.toFixed(3)})</p>
                    <p>Left Bearing: ${metrics.leftBearing.toFixed(2)}px (${ratios.leftBearing.toFixed(3)})</p>
                    <p>Right Bearing: ${metrics.rightBearing.toFixed(2)}px (${ratios.rightBearing.toFixed(3)})</p>
                </div>
            </div>
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
window.FontDimensionFinder = FontDimensionFinder;
