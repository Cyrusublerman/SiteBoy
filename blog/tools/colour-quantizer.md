# Colour Quantizer

High-fidelity image quantization with custom colour palettes and advanced dithering.

## High-Fidelity Image Quantization Tool

<div id="colour-quantizer-tool-container" style="
    border: var(--outline-width) solid var(--c-border);
    padding: 20px;
    margin: 20px 0;
    background: var(--c-bg);
">
    <div id="colour-quantizer-tool-content">
        <h3>High-Fidelity Image Quantization</h3>
        
        <div id="colour-quantizer-controls">
            <div class="control-box">
                <h4>Upload Image</h4>
                <label for="image-input">Select image file:</label>
                <input type="file" id="image-input" accept="image/png, image/jpeg, image/webp, image/bmp">
            </div>

            <div class="control-box">
                <h4>colour Palette</h4>
                <label for="palette-select">Choose or Define Palette:</label>
                <select id="palette-select">
                    <option value="custom">Custom</option>
                    <option value="1bit">1-bit (Black & White)</option>
                    <option value="2bit">2-bit (4 Greys)</option>
                    <option value="3bit">3-bit (8 Colours)</option>
                    <option value="3bit-gray">3-bit Grayscale (8 Shades)</option>
                    <option value="nes">NES (16 Colours)</option>
                    <option value="gameboy">Game Boy (4 Colours)</option>
                    <option value="primaries">Primaries (RGB + BW)</option>
                    <option value="pastel">Pastel</option>
                    <option value="ggost">Ggost</option>
                </select>

                <label for="palette-swatch-display">Active Palette:</label>
                <div id="palette-swatch-display" class="palette-display-area"></div>

                <div id="custom-palette-tools" class="hidden">
                    <h4>Edit Custom Palette</h4>
                    <p>(Click 'X' on swatches above to remove colours)</p>
                    <button type="button" id="eyedropper-button">Pick colour from Image (Eyedropper)</button>
                    <div class="colour-input-group">
                        <input type="colour" id="custom-colour-picker" value="#CCCCCC">
                        <input type="text" id="custom-hex-input" value="#CCCCCC" placeholder="#RRGGBB">
                        <button id="add-colour-button" type="button">Add</button>
                    </div>
                    <div class="file-input-group">
                        <label for="palette-file-input">Replace Custom Palette from File (.txt, .gpl, .hex):</label>
                        <input type="file" id="palette-file-input" accept=".txt,.gpl,.hex">
                    </div>
                </div>
            </div>

            <div class="control-box">
                <h4>Image Adjustments</h4>
                <div class="slider-group">
                    <label for="gamma-slider">Gamma (<span id="gamma-value">1.0</span>):</label>
                    <input type="range" id="gamma-slider" min="0.2" max="2.2" step="0.1" value="1.0">
                </div>
                <div class="slider-group">
                    <label for="contrast-slider">Contrast (<span id="contrast-value">100</span>%):</label>
                    <input type="range" id="contrast-slider" min="0" max="200" step="5" value="100">
                </div>
                <div class="slider-group">
                    <label for="saturation-slider">Saturation (<span id="saturation-value">100</span>%):</label>
                    <input type="range" id="saturation-slider" min="0" max="200" step="5" value="100">
                </div>
                <button id="reset-adjustments-button">Reset Adjustments</button>
            </div>

            <div class="control-box">
                <h4>Dithering Options</h4>
                <label for="dithering-enable">
                    <input type="checkbox" id="dithering-enable" checked>
                    Enable Blue Noise Dithering
                </label>
            </div>

            <div class="control-box">
                <h4>Status</h4>
                <div id="status-message">Initializing...</div>
            </div>

            <div class="button-row">
                <button id="process-button">Process Image</button>
                <button id="undo-button">Undo Process</button>
                <button id="download-button">Download Result</button>
            </div>
        </div>

        <div id="colour-quantizer-canvas-container">
            <canvas id="canvas" aria-label="Image display and processing area"></canvas>
        </div>
    </div>
</div>

## About This Tool

The High-Fidelity Image Quantization Tool provides:

- **Custom colour Palettes**: Create and edit your own colour schemes
- **Pre-built Palettes**: Classic retro palettes (NES, Game Boy, etc.)
- **Image Adjustments**: Gamma, contrast, and saturation controls
- **Advanced Dithering**: Blue noise dithering for smooth gradients
- **High-Quality Output**: Maintains image detail during quantization

## Features

- **Multiple Palette Options**: From 1-bit to full colour palettes
- **Real-time Preview**: See changes instantly
- **File Support**: PNG, JPEG, WebP, BMP input formats
- **Export Options**: Download processed images
- **Eyedropper Tool**: Pick colours directly from images
- **Palette Import**: Load palettes from various file formats

## Usage

1. **Upload Image**: Select an image file to process
2. **Choose Palette**: Select a pre-built palette or create custom
3. **Adjust Settings**: Fine-tune gamma, contrast, and saturation
4. **Enable Dithering**: Add blue noise dithering for smooth gradients
5. **Process Image**: Apply quantization with current settings
6. **Download Result**: Save the processed image

## Applications

- **Retro Game Art**: Create authentic pixel art
- **Print Design**: Reduce colours for cost-effective printing
- **Web Optimization**: Create smaller, faster-loading images
- **Artistic Effects**: Achieve unique visual styles
- **Colour Analysis**: Study colour relationships and palettes

This tool is perfect for creating authentic retro aesthetics while maintaining image quality and detail. 