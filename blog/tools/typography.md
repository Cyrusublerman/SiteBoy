# Typography Scale Calculator

A mathematical approach to typography with precise font metrics visualization.

## Font Metrics Visualizer

<div id="typography-tool-container" style="
    font-family: var(--font-mono);
    color: var(--c-text);
    background: var(--c-bg);
    padding: 20px;
    margin: 20px 0;
    border: var(--outline-width) solid var(--c-border);
">
    <div id="typography-tool-content">
        <h1 style="font-family: 'Rubik Mono One', monospace; margin: 0 0 20px 0;">Font Metrics Visualizer</h1>
        
        <div id="typography-controls" style="margin-bottom: 20px;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                <div>
                    <label for="fontSelect">Choose a font:</label>
                    <select id="fontSelect">
                        <option value="Rubik Mono One">Rubik Mono One</option>
                        <option value="Space Mono">Space Mono</option>
                        <option value="Syne Mono">Syne Mono</option>
                    </select>
                </div>
                <div>
                    <label for="fontSize">Font size:</label>
                    <input type="number" id="fontSize" value="200" min="100" max="400">
                </div>
                <div>
                    <label for="letterInput">Letter:</label>
                    <input type="text" id="letterInput" value="A" maxlength="1">
                </div>
            </div>
        </div>
        
        <div id="typography-visualizer" style="border: var(--outline-width) solid var(--c-border); margin-bottom: 20px; text-align: center;">
            <canvas id="metricsCanvas"></canvas>
        </div>
        
        <div id="typography-metrics" style="font-size: 14px; line-height: 1.5;"></div>
        
        <div id="typography-comparison" style="margin-top: 40px;">
            <h2 style="font-family: var(--font-mono); margin: 0 0 16px 0;">Font Comparison</h2>
            <div style="margin-bottom: 16px;">
                <label for="metricSelect">Compare metric:</label>
                <select id="metricSelect">
                    <option value="ascent">Ascent</option>
                    <option value="descent">Descent</option>
                    <option value="capHeight">Cap Height</option>
                    <option value="xHeight">x-Height</option>
                    <option value="width">Width</option>
                    <option value="leftBearing">Left Bearing</option>
                    <option value="rightBearing">Right Bearing</option>
                    <option value="advance">Advance</option>
                </select>
            </div>
            <div style="border: var(--outline-width) solid var(--c-border); text-align: center;">
                <canvas id="comparisonCanvas" width="600" height="400"></canvas>
            </div>
        </div>
    </div>
</div>

## About This Tool

The Font Metrics Visualizer provides precise measurements of font characteristics:

- **Character Width**: Exact pixel width of individual characters
- **Baseline Position**: Vertical positioning reference
- **Cap Height**: Height of capital letters
- **x-Height**: Height of lowercase letters
- **Ascender/Descender**: Extension above/below baseline
- **Bearing**: Left and right spacing around characters
- **Advance Width**: Total space allocated for the character

This tool is essential for:
- Creating precise typography systems
- Matching font metrics across different typefaces
- Designing mathematical layouts
- Ensuring consistent text rendering
- Comparing font characteristics

## Usage

1. Select a font from the dropdown
2. Adjust the font size using the number input
3. Type a single character to analyze
4. View the detailed metrics display with editable values
5. Use the comparison chart to analyze font relationships
6. Edit metric values to find optimal font sizes

The tool uses canvas-based measurement for pixel-perfect accuracy and provides real-time updates as you adjust parameters. 