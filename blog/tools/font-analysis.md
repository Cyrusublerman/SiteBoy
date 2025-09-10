# Font Analysis Tool

Compare and analyze different fonts with precise control over typography parameters.

## Enhanced Font Comparison Tool

<div id="font-analysis-tool-container" style="
    border: var(--outline-width) solid var(--c-border);
    padding: 20px;
    margin: 20px 0;
    background: var(--c-bg);
">
    <div id="font-analysis-tool-content">
        <h3>Enhanced Font Comparison Tool</h3>
        <div id="font-analysis-global-controls">
            <label for="custom-text">Custom Text:</label>
            <input type="text" id="custom-text" value="The quick brown fox jumps over the lazy dog">
            <label for="font-size">Font Size:</label>
            <input type="number" id="font-size" value="32" min="1" max="100">
        </div>
        <div id="font-analysis-controls">
            <div id="font-input-1">
                <h4>Rubik Mono One</h4>
                <label for="display1">Display:</label>
                <select id="display1">
                    <option value="inline-block">inline-block</option>
                    <option value="inline">inline</option>
                    <option value="block">block</option>
                </select>
                <label for="scaleX1">Scale X:</label>
                <input type="number" id="scaleX1" value="100" min="10" max="200" step="1">
                <label for="scaleY1">Scale Y:</label>
                <input type="number" id="scaleY1" value="100" min="10" max="200" step="1">
                <label for="letterSpacing1">Letter Spacing:</label>
                <input type="number" id="letterSpacing1" value="0" min="-5" max="20" step="0.1">
                <label for="wordSpacing1">Word Spacing:</label>
                <input type="number" id="wordSpacing1" value="0" min="-5" max="20" step="0.1">
                <label for="lineHeight1">Line Height:</label>
                <input type="number" id="lineHeight1" value="1.2" min="0.5" max="3" step="0.1">
            </div>
            <div id="font-input-2">
                <h4>Space Mono</h4>
                <label for="display2">Display:</label>
                <select id="display2">
                    <option value="inline-block">inline-block</option>
                    <option value="inline">inline</option>
                    <option value="block">block</option>
                </select>
                <label for="scaleX2">Scale X:</label>
                <input type="number" id="scaleX2" value="100" min="10" max="200" step="1">
                <label for="scaleY2">Scale Y:</label>
                <input type="number" id="scaleY2" value="100" min="10" max="200" step="1">
                <label for="letterSpacing2">Letter Spacing:</label>
                <input type="number" id="letterSpacing2" value="0" min="-5" max="20" step="0.1">
                <label for="wordSpacing2">Word Spacing:</label>
                <input type="number" id="wordSpacing2" value="0" min="-5" max="20" step="0.1">
                <label for="lineHeight2">Line Height:</label>
                <input type="number" id="lineHeight2" value="1.2" min="0.5" max="3" step="0.1">
            </div>
            <div id="font-input-3">
                <h4>Syne Mono</h4>
                <label for="display3">Display:</label>
                <select id="display3">
                    <option value="inline-block">inline-block</option>
                    <option value="inline">inline</option>
                    <option value="block">block</option>
                </select>
                <label for="scaleX3">Scale X:</label>
                <input type="number" id="scaleX3" value="100" min="10" max="200" step="1">
                <label for="scaleY3">Scale Y:</label>
                <input type="number" id="scaleY3" value="100" min="10" max="200" step="1">
                <label for="letterSpacing3">Letter Spacing:</label>
                <input type="number" id="letterSpacing3" value="0" min="-5" max="20" step="0.1">
                <label for="wordSpacing3">Word Spacing:</label>
                <input type="number" id="wordSpacing3" value="0" min="-5" max="20" step="0.1">
                <label for="lineHeight3">Line Height:</label>
                <input type="number" id="lineHeight3" value="1.2" min="0.5" max="3" step="0.1">
            </div>
        </div>
        <div id="font-analysis-display">
            <p id="text1"></p>
            <p id="text2"></p>
            <p id="text3"></p>
        </div>
        <div id="font-analysis-ratio-comparison"></div>
    </div>
</div>

## About This Tool

The Enhanced Font Comparison Tool allows you to:

- **Compare Multiple Fonts**: Side-by-side comparison of different typefaces
- **Adjust Typography Parameters**: Fine-tune scale, spacing, and line height
- **Real-time Preview**: See changes instantly as you adjust settings
- **Ratio Analysis**: Compare character widths and proportions
- **Custom Text**: Test with your own sample text

## Features

- **Display Modes**: inline-block, inline, block
- **Scale Control**: Independent X and Y scaling
- **Spacing Control**: Letter and word spacing adjustments
- **Line Height**: Precise line height control
- **Real-time Updates**: Instant visual feedback

## Usage

1. Enter custom text or use the default sample
2. Adjust font size for the comparison
3. Modify individual font parameters
4. Compare the visual results
5. Analyze character ratios and proportions

This tool is perfect for:
- Font selection and comparison
- Typography system design
- Ensuring consistent text rendering
- Fine-tuning typography parameters 