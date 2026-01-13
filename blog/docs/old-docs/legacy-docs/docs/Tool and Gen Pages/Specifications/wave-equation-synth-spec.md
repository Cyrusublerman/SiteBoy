# Wave Equation Synth — Specification

## 1. Overview
- Purpose: Audio synthesis from arbitrary equations with visual feedback
- Output Type: Audio + Animation

## 2. Module Dependencies
| Category | Module ID | Import From |
|----------|-----------|-------------|
| Math | MATH-002, MATH-004 | shared/math-utils.js |
| Audio | AUDIO-004..008 | shared/audio-utils.js |
| Canvas | CANVAS-014..016 | shared/canvas-utils.js |

## 3. Sidebar Structure
TAB: CONTROLS
  BLOCK: Core
    - slider: baseFrequency [1, 2000]
    - slider: sampleRate [8000, 192000]
    - slider: duration [0.1, 300]
  BLOCK: Equations
    - stepper: equationCount [1, 16]
    - textarea: equation1 [sin(2*pi*p)]
    - textarea: equation2..N (dynamic)
  BLOCK: Behavior
    - dropdown: mode [Oscilloscope, Segmented, Circular Loop]
    - stepper: cyclesShown [1, 64]
    - stepper: segmentStartWave [0, 100000]
    - stepper: segmentWaveCount [1, 256]

TAB: AUDIO
  BLOCK: Playback
    - button: Play/Stop
    - slider: volume [0, 1]
  BLOCK: Export
    - button: Export WAV
    - button: Export Segment WAV

TAB: CANVAS
  BLOCK: Style
    - color: lineColor
    - color: backgroundColor
    - slider: strokeWidth [1, 8]
    - slider: modulationDepth [0, 1]
  BLOCK: Export
    - button: Export PNG
    - button: Export GIF

TAB: INFO
  BLOCK: Variables
    - label: p = phase [0,1], w = wave index, u = normalised wave, t = time, g = global progress

## 4. Implementation Skeleton
```javascript
var TOOL_CONFIG = {
    title: 'WAVE EQUATION SYNTH',
    sidebar: [/* tabs/blocks as above */],
    canvas: { width: 420, height: 420 },
    onInit: function(ctx, canvas, values) {
        this.audioContext = new AudioContext();
        this.compileEquations(values);
        this.generateBuffer(values);
    },
    onDraw: function(ctx, canvas, values) {
        switch (values.mode) {
            case 'Oscilloscope':
                oscilloscopeRenderer(ctx, this.buffer, values);
                break;
            case 'Circular Loop':
                circularLoopRenderer(ctx, this.buffer, values);
                break;
        }
    }
};
```

