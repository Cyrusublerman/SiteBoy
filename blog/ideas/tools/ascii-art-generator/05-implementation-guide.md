# ASCII Art Generator — Implementation Guide

## 1. File Structure

```
assets/js/tools/
├── ascii-art-generator/
│   └── ascii-art-generator-tool.js

blog/pages/tools/
└── ascii-art-generator.json
```

## 2. Tool Class Skeleton

```javascript
import ToolBase from '../tool-base.js';
import { EdgeDetection, ImageAnalysis, Posterization, HalftonePatterns } from '../../shared/algorithms/index.js';

export default class ASCIIArtGeneratorTool extends ToolBase {
    constructor(container, options = {}) {
        super(container, {
            name: 'ascii-art-generator',
            title: 'ASCII Art Generator',
            ...options
        });
        
        this.glyphDB = null;
        this.tileGrid = null;
        this.asciiOutput = '';
    }
    
    getDefaultParams() {
        return {
            tileWidth: 8,
            tileHeight: 16,
            characterSet: 'basic',
            font: 'Courier',
            toneWeight: 0.4,
            quadrantWeight: 0.2,
            orientationWeight: 0.3,
            signatureWeight: 0.1,
            densityThreshold: 0.2,
            coherenceEnabled: true,
            coherenceStrength: 0.5,
            passes: 2,
            outputMode: 'plain'
        };
    }
    
    onInit() {
        this.buildGlyphDB();
    }
    
    buildGlyphDB() {
        const chars = this.getCharacterSet();
        this.glyphDB = {
            glyphs: [],
            densityBuckets: new Map(),
            orientationBuckets: new Map()
        };
        
        for (const char of chars) {
            const bitmap = this.renderGlyph(char);
            const features = ImageAnalysis.analyzeGlyph(bitmap);
            
            const entry = { char, features };
            this.glyphDB.glyphs.push(entry);
            
            // Index by density bucket
            const densityBucket = Math.floor(features.density * 10);
            if (!this.glyphDB.densityBuckets.has(densityBucket)) {
                this.glyphDB.densityBuckets.set(densityBucket, []);
            }
            this.glyphDB.densityBuckets.get(densityBucket).push(entry);
        }
    }
    
    getCharacterSet() {
        const sets = {
            basic: ' .:-=+*#%@',
            extended: ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
            blocks: ' ░▒▓█'
        };
        return sets[this.params.characterSet] || sets.basic;
    }
    
    renderGlyph(char) {
        const canvas = new OffscreenCanvas(this.params.tileWidth, this.params.tileHeight);
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${this.params.tileHeight}px ${this.params.font}`;
        ctx.textBaseline = 'top';
        ctx.fillText(char, 0, 0);
        
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
    
    processImage(imageData) {
        const { tileWidth, tileHeight } = this.params;
        const cols = Math.floor(imageData.width / tileWidth);
        const rows = Math.floor(imageData.height / tileHeight);
        
        this.tileGrid = [];
        
        for (let row = 0; row < rows; row++) {
            const gridRow = [];
            for (let col = 0; col < cols; col++) {
                const tileData = this.extractTile(imageData, col, row);
                const features = ImageAnalysis.analyzeGlyph(tileData);
                
                const match = ImageAnalysis.matchGlyph(features, this.glyphDB, {
                    alpha: this.params.toneWeight,
                    beta: this.params.quadrantWeight,
                    gamma: this.params.orientationWeight,
                    delta: this.params.signatureWeight
                });
                
                gridRow.push({
                    features,
                    matchedGlyph: match.glyph,
                    cost: match.cost
                });
            }
            this.tileGrid.push(gridRow);
        }
        
        // Apply coherence
        if (this.params.coherenceEnabled) {
            ImageAnalysis.coherenceSmoothing(
                this.tileGrid,
                this.params.coherenceStrength,
                this.params.passes
            );
        }
        
        // Generate output
        this.generateOutput();
    }
    
    generateOutput() {
        this.asciiOutput = this.tileGrid
            .map(row => row.map(tile => tile.matchedGlyph).join(''))
            .join('\n');
    }
    
    onDraw(ctx) {
        // Render ASCII preview to canvas
        ctx.fillStyle = 'var(--vga-black)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        ctx.fillStyle = 'var(--vga-white)';
        ctx.font = '10px monospace';
        ctx.textBaseline = 'top';
        
        const lines = this.asciiOutput.split('\n');
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], 0, i * 10);
        }
    }
    
    exportText() {
        return this.asciiOutput;
    }
    
    exportHTML() {
        return `<pre style="font-family: monospace;">${this.asciiOutput}</pre>`;
    }
}
```

## 3. Requirements Mapping

| Requirement | Status |
|-------------|--------|
| ToolBase extension | Planned |
| VGA colors | Planned |
| F-system | Planned |

