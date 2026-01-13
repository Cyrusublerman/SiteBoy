# Wave Equation Synth — Implementation Guide

## 1. File Structure

```
assets/js/tools/
├── wave-equation-synth/
│   └── wave-equation-synth-tool.js

blog/pages/tools/
└── wave-equation-synth.json
```

## 2. Tool Class Skeleton

```javascript
import ToolBase from '../tool-base.js';
import { WaveSolver, WavEncoder, DSPEvaluator, CoordinateTransforms } from '../../shared/algorithms/index.js';

export default class WaveEquationSynthTool extends ToolBase {
    constructor(container, options = {}) {
        super(container, {
            name: 'wave-equation-synth',
            title: 'Wave Equation Synth',
            ...options
        });
        
        this.audioBuffer = null;
        this.compiledEquations = [];
        this.audioContext = null;
    }
    
    getDefaultParams() {
        return {
            baseFrequency: 440,
            sampleRate: 48000,
            duration: 30,
            equationCount: 1,
            equations: ['sin(2*Math.PI*p)'],
            mode: 'oscilloscope',
            cyclesShown: 4,
            modulationDepth: 0.3,
            lineColor: '#00FFAA',
            backgroundColor: '#000000',
            strokeWidth: 2
        };
    }
    
    onInit() {
        this.compileEquations();
        this.generateBuffer();
    }
    
    compileEquations() {
        this.compiledEquations = [];
        
        for (const eq of this.params.equations) {
            try {
                const fn = DSPEvaluator.evaluateEquation(eq);
                this.compiledEquations.push({ fn, source: eq });
            } catch (e) {
                console.error('Failed to compile equation:', eq);
            }
        }
    }
    
    generateBuffer() {
        const { baseFrequency, sampleRate, duration } = this.params;
        const totalSamples = Math.floor(sampleRate * duration);
        const samplesPerWave = Math.floor(sampleRate / baseFrequency);
        const totalWaves = Math.floor(totalSamples / samplesPerWave);
        
        this.audioBuffer = new Float32Array(totalSamples);
        
        for (let i = 0; i < totalSamples; i++) {
            const w = Math.floor(i / samplesPerWave);
            const p = (i % samplesPerWave) / samplesPerWave;
            const u = w / (totalWaves - 1);
            const t = i / sampleRate;
            const g = i / (totalSamples - 1);
            
            let y = 0;
            for (const eq of this.compiledEquations) {
                y += eq.fn({ p, w, u, t, g });
            }
            
            this.audioBuffer[i] = y / this.compiledEquations.length;
        }
    }
    
    onDraw(ctx) {
        const { width, height } = this.canvas;
        
        ctx.fillStyle = this.params.backgroundColor;
        ctx.fillRect(0, 0, width, height);
        
        if (!this.audioBuffer) return;
        
        const { mode } = this.params;
        let path;
        
        switch (mode) {
            case 'oscilloscope':
                path = this.getOscilloscopePath();
                break;
            case 'circular':
                path = CoordinateTransforms.waveformToCircular(
                    this.getSegmentSamples(),
                    width / 2, height / 2,
                    Math.min(width, height) * 0.4,
                    this.params.modulationDepth
                );
                break;
        }
        
        this.drawPath(ctx, path);
    }
    
    getOscilloscopePath() {
        const { cyclesShown, baseFrequency, sampleRate } = this.params;
        const samplesPerWave = Math.floor(sampleRate / baseFrequency);
        const displaySamples = cyclesShown * samplesPerWave;
        
        const samples = this.audioBuffer.slice(0, displaySamples);
        return CoordinateTransforms.waveformToPath(
            samples, 
            this.canvas.width, 
            this.canvas.height
        );
    }
    
    drawPath(ctx, path) {
        ctx.strokeStyle = this.params.lineColor;
        ctx.lineWidth = this.params.strokeWidth;
        ctx.beginPath();
        
        for (let i = 0; i < path.length; i++) {
            if (i === 0) {
                ctx.moveTo(path[i].x, path[i].y);
            } else {
                ctx.lineTo(path[i].x, path[i].y);
            }
        }
        
        ctx.stroke();
    }
    
    exportWAV() {
        const wavBuffer = WavEncoder.encodeWavMono(
            this.audioBuffer,
            this.params.sampleRate,
            16
        );
        
        const blob = new Blob([wavBuffer], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        
        // Download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'wave-synth.wav';
        a.click();
        URL.revokeObjectURL(url);
    }
}
```

## 3. Requirements Mapping

| Requirement | Status |
|-------------|--------|
| ToolBase extension | Planned |
| VGA colors | Planned |
| F-system | Planned |
| Web Audio (platform) | Planned |

