# Cymatics (Wave Source Visualization)

## 1. Source Analysis

**Source file(s):** `reference/QuickToolRebuildReference/Generative Art/cymatics/dist/script.js`
**Related docs found:** None

### Purpose
Interactive Chladni-pattern wave interference visualization with audio. Simulates cymatics by placing wave sources and visualizing interference patterns. Supports musical intervals (chords) and geometric arrangements with real-time audio playback.

### Output Type
- [ ] Static image
- [x] Animation (continuous)
- [x] Interactive visualization (click to add sources)
- [ ] Data/calculation result
- [x] Audio (oscillator playback)
- [ ] Downloadable file

### Current Implementation
1. Click canvas to add wave sources at position
2. Each source has frequency (semitone offset from base) and amplitude
3. Wave interference calculated per-pixel
4. 3 visualization modes: particle (displacement), density (intensity), radial (dots)
5. Chord presets: maj, min, dim, aug, maj7, min7, dom7, sus4
6. Template positions: circle6, circle12, grid3, grid4, star5, star8, corners, cross
7. Audio playback via Web Audio oscillators

---

## 2. Tool Classification

**Is this a tool?** Generative Art + Audio Tool

**Input:** Source positions, frequencies, templates, chords
**Processing:** 2D wave interference calculation
**Output:** Animated visualization + audio

**Frame-based?** Yes
**Looping?** Yes (continuous)
**Duration:** Infinite

---

## 3. Variable Analysis

### Exposed Parameters (from source)
| Variable | Current Type | Range/Options | Purpose |
|----------|--------------|---------------|---------|
| baseNoteSelect | number | 261.63 (C4) | Base frequency Hz |
| ampInput | number | 0.1-2 | Source amplitude |
| speedInput | number | 0.01-0.5 | Animation speed |
| boostInput | number | 0.5-5 | Intensity boost |
| radialResInput | number | 1-20 | Radial mode resolution |
| vizMode | string | particle/density/radial | Visualization type |
| selectedSemitone | number | 0-12 | Next source interval |
| currentChord | string | maj/min/dim/etc | Chord preset |
| currentTemplate | string | circle6/grid3/etc | Position template |

### Chord Intervals (semitones)
| Chord | Intervals |
|-------|-----------|
| maj | 0, 4, 7 |
| min | 0, 3, 7 |
| dim | 0, 3, 6 |
| aug | 0, 4, 8 |
| maj7 | 0, 4, 7, 11 |
| min7 | 0, 3, 7, 10 |
| dom7 | 0, 4, 7, 10 |
| sus4 | 0, 5, 7 |

### Recommended UI Components
| Parameter | Component Type | Config |
|-----------|----------------|--------|
| Base Note | dropdown | C4, D4, E4, etc with Hz |
| Amplitude | slider | 0.1-2, step 0.1 |
| Speed | slider | 0.01-0.5, step 0.01 |
| Boost | slider | 0.5-5, step 0.1 |
| Radial Resolution | slider | 1-20, step 1 |
| Visualization | radio | particle/density/radial |
| Semitone | radio | 0-12 (note names) |
| Chord | dropdown | maj/min/dim/aug/etc |
| Template | dropdown | circle6/circle12/etc |
| Play Audio | button | toggle |
| Clear | button | reset |

### Missing Controls (not in source, should add)
- [ ] Export frame/video
- [ ] Canvas size control
- [ ] Volume control (exists in audio)
- [ ] Waveform selection per source
- [ ] Source list management (remove individual)

---

## 4. Gap Analysis

### Available in our library but missing in source:
- Export functionality
- Canvas resize
- Volume slider (global)

### Source features requiring new components:
- Dynamic source list with delete buttons
- Musical note selection (semitone picker)
- Chord/template preset buttons

---

## 5. Input/Output Specification

### Inputs
| Name | Type | Default | Min | Max | Step | Notes |
|------|------|---------|-----|-----|------|-------|
| baseNote | dropdown | 261.63 | - | - | - | Base frequency |
| amplitude | number | 0.5 | 0.1 | 2 | 0.1 | Wave amplitude |
| speed | number | 0.05 | 0.01 | 0.5 | 0.01 | Animation speed |
| boost | number | 1.5 | 0.5 | 5 | 0.1 | Intensity curve |
| radialRes | number | 5 | 1 | 20 | 1 | Radial mode resolution |
| vizMode | radio | particle | - | - | - | Display mode |
| semitone | radio | 0 | 0 | 12 | 1 | Interval offset |
| chord | dropdown | maj | - | - | - | Chord preset |
| template | dropdown | - | - | - | - | Position preset |

### Outputs
| Output | Type | Format | Trigger |
|--------|------|--------|---------|
| Animation | canvas | continuous | Auto |
| Audio | audio | oscillators | Play button |
| Source List | UI | dynamic list | On source add |

---

## 6. ToolBase Configuration

```javascript
const TOOL_CONFIG = {
    title: 'CYMATICS',
    
    sidebar: [
        ['SOURCES', [
            ['Base', [
                ['dropdown', 'Base Note', [
                    ['C4', 261.63], ['C#4', 277.18], ['D4', 293.66], ['D#4', 311.13],
                    ['E4', 329.63], ['F4', 349.23], ['F#4', 369.99], ['G4', 392.00],
                    ['G#4', 415.30], ['A4', 440.00], ['A#4', 466.16], ['B4', 493.88],
                    ['C5', 523.25]
                ], { key: 'baseNote' }],
                ['slider', 'Amplitude', 0.1, 2, 0.1, { value: 0.5, key: 'amplitude' }],
            ]],
            ['Interval', [
                ['radio', 'Semitone', ['0','1','2','3','4','5','6','7','8','9','10','11','12'], { key: 'semitone' }],
            ]],
            ['Presets', [
                ['dropdown', 'Chord', ['maj','min','dim','aug','maj7','min7','dom7','sus4'], { key: 'chord' }],
                ['dropdown', 'Template', ['circle6','circle12','grid3','grid4','star5','star8','corners','cross'], { key: 'template' }],
            ]],
        ]],
        ['VISUALIZATION', [
            ['Mode', [
                ['radio', 'Display', ['particle', 'density', 'radial'], { key: 'vizMode', selectedValue: 'particle' }],
            ]],
            ['Parameters', [
                ['slider', 'Speed', 0.01, 0.5, 0.01, { value: 0.05, key: 'speed' }],
                ['slider', 'Boost', 0.5, 5, 0.1, { value: 1.5, key: 'boost' }],
                ['slider', 'Radial Res', 1, 20, 1, { value: 5, key: 'radialRes' }],
            ]],
        ]],
        ['AUDIO', [
            ['Playback', [
                ['button', 'Play', { key: 'playAudio' }],
                ['button', 'Stop', { key: 'stopAudio' }],
                ['button', 'Clear All', { key: 'clear' }],
            ]],
            ['Sources', [
                ['label', 'Click canvas to add sources'],
                ['value', 'Source Count', { key: 'sourceCount' }],
            ]],
        ]],
    ],
    
    canvas: { size: 420 },
    
    onInit: function(values) {
        this.sources = [];
        this.medium = new Medium();
        this.t = 0;
        this.audioCtx = null;
        this.oscillators = [];
        this.animator = new AnimationFoundation.AnimationLoop({
            onFrame: () => {
                this.t += values.speed;
                this.draw();
            }
        });
        this.animator.start();
        
        // Canvas click handler
        var canvas = this.getCanvas();
        canvas.addEventListener('click', (e) => this.addSource(e));
    },
    
    onDraw: function(ctx, canvas, values) {
        this.medium.draw(ctx, canvas, this.sources, this.t, values);
    },
    
    destroy: function() {
        if (this.animator) this.animator.destroy();
        this.stopAudio();
        if (this.tool) this.tool.destroy();
    }
};
```

---

## 7. Implementation Notes

- **Wave Physics:** `wave = A * sin(2π * dist / freq - t)` for each source, summed at each point
- **Displacement Vectors:** Particle mode shows radial displacement from wave amplitude
- **Density Mode:** Per-pixel intensity calculation - computationally expensive
- **Radial Mode:** Sampled grid with variable resolution for performance
- **Audio:** Each source gets oscillator at `baseFreq * 2^(semitone/12)` Hz
- **AudioContext:** Must handle browser autoplay restrictions (resume on user gesture)
- **Performance:** Density mode at 800×800 = 640,000 calculations per frame

---

## 8. Reusable Code Candidates

| Code Block | Lines | Category | Similar To | Reuse Potential |
|------------|-------|----------|------------|-----------------|
| WaveSource class | 30 | physics | wave-interference | High |
| Medium class | 100 | physics | wave-interference | High |
| getWave | 8 | physics | wave-interference | High |
| getDisplacement | 10 | physics | - | Medium |
| getTemplatePositions | 40 | geometry | - | Medium |
| CHORDS object | 10 | music | - | High |
| semitoneToFrequency | 3 | music | - | High |
| startAudio/stopAudio | 25 | audio | tool-test-ui | High |

**Shared Utility Candidates:**
- `WavePhysics.interference(sources, x, y, t)` - Wave sum calculation
- `MusicTheory.semitoneToFrequency(base, semitone)` - Frequency from interval
- `MusicTheory.chordIntervals(chordName)` - Get semitone array for chord
- `AudioHelper.createOscillatorBank(ctx, frequencies)` - Multiple oscillators

