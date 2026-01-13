# Wave Equation Synth + Circular Loop Oscilloscope

## 1. Overview

**Purpose:**  
Generate audio from arbitrary mathematical equations, visualise playback in oscilloscope or circular loop modes, and export both audio and visuals.

**Output Type:**  
Audio + Animation

**Target User:**  
Sound designers, generative artists, DSP developers.

---

## 2. Parameters

### Core Parameters

| Parameter | Type | Range | Default | Step | Purpose |
|-----------|------|--------|---------|--------|---------|
| Base Frequency | slider | 1–2000 Hz | 440 | 1 | Determines samples-per-wave |
| Sample Rate | slider | 8000–192000 | 48000 | 1000 | Defines audio resolution |
| Duration | slider | 0.1–300 s | 30 | 0.1 | Total generated buffer length |
| Equation Count | stepper | 1–16 | 1 | 1 | Number of active equations |
| Equation Text (per equation) | textarea | — | sin(2*pi*p) | — | User-defined DSP equation |

---

### Appearance

| Parameter | Type | Options/Range | Default | Purpose |
|-----------|------|----------------|---------|---------|
| Line Color | color | — | #00FFAA | Stroke color for visuals |
| Background Color | color | — | #000000 | Canvas background |
| Modulation Depth | slider | 0–1 | 0.3 | Radius modulation (circular mode) |
| Stroke Width | slider | 1–8 px | 2 | Line thickness |

---

### Behavior

| Parameter | Type | Options | Default | Purpose |
|-----------|------|---------|---------|---------|
| Mode | dropdown | Oscilloscope, Segmented Oscilloscope, Circular Loop | Oscilloscope | Selects visualisation method |
| Cycles Shown | stepper | 1–64 | 4 | Oscilloscope window in cycles |
| Segment Start Wave | stepper | 0–100000 | 0 | Start of looped segment |
| Segment Wave Count | stepper | 1–256 | 4 | Number of waves in loop segment |
| FPS | slider | 1–120 | 60 | Animation update rate |
| Loop Playback | toggle | [Loop] | [Loop] | Continuous playback toggle |

---

## 3. Controls Layout

### Tab: CONTROLS

#### Block: Core Parameters
- slider: Base Frequency — sets samples-per-wave  
- slider: Sample Rate — defines resolution  
- slider: Duration — buffer length  
- stepper: Equation Count — number of equations

#### Block: Equations
- textarea: Equation 1 — equation definition  
- textarea: Equation 2 — equation 2 (if active)  
- (auto-add based on Equation Count)

#### Block: Behavior
- dropdown: Mode — oscilloscope / segmented / circular  
- stepper: Cycles Shown — number of cycles in oscilloscope  
- stepper: Segment Start Wave — start index for looped segment  
- stepper: Segment Wave Count — waves included in segment loop  

---

### Tab: AUDIO

#### Block: Playback
- button: Play/Stop — toggles audio playback  
- slider: Volume — output gain  
- toggle: Options — [Mute]

#### Block: Export
- button: Export WAV — writes full buffer  
- button: Export Segment WAV — writes only the segment loop

---

### Tab: CANVAS

#### Block: Canvas
- slider: Width — canvas width  
- slider: Height — canvas height

#### Block: Style
- color: Line Color  
- color: Background Color  
- slider: Stroke Width  
- slider: Modulation Depth  

#### Block: Export
- button: Export PNG  
- button: Export Frame  
- button: Export GIF  

---

### Tab: ANIMATION

#### Block: Playback
- button: Play/Pause  
- slider: FPS  
- toggle: Options — [Loop]

---

### Tab: INFO

#### Block: Notes
- label: Variables available to equations: `p, w, u, t, g`  
- label: Segment and oscilloscope mode descriptions  
- label: Circular loop mapping details  

---

## 4. Interactions

### Parameter Effects

| When | Then |
|------|------|
| Base Frequency changes | Recompute samples-per-wave and redraw |
| Sample Rate changes | Regenerate entire buffer |
| Duration changes | Recompute N_total, N_waves |
| Equation Count changes | Regenerate equation fields |
| Equation text changes | Recompile equation functions |
| Mode changes | Switch renderer |
| Cycles Shown changes | Resize oscilloscope window |
| Segment Start Wave changes | Update segment boundaries |
| Segment Wave Count changes | Update segment length |
| FPS changes | Adjust animation update interval |
| Modulation Depth changes | Redraw circular mode |
| Stroke Width/Color changes | Redraw canvas |

---

### Button Actions

| Button | Action |
|--------|--------|
| Play/Stop | Start or stop audio playback |
| Export WAV | Save full generated audio buffer |
| Export Segment WAV | Save isolated loop segment |
| Export PNG | Save current canvas as PNG |
| Export Frame | Save current animation frame |
| Export GIF | Encode frames at FPS into GIF |

---

## 5. Canvas Specification

**Content:**  
Visualisation varies by mode.

---

### Oscilloscope Mode

**Content:**  
Waveform representing exactly **Cycles Shown** cycles.

**Coordinate System:**  
- X axis = phase across N cycles  
- Y axis = amplitude  

**Elements:**  
- Polyline sampled per pixel  
- Optional playhead marker  

---

### Segmented Oscilloscope Mode

**Content:**  
Displays the selected loop segment (`SegmentWaveCount` waves).

**Elements:**  
- Window of S_seg samples  
- Stable looping visual  
- Optional playback cursor  

---

### Circular Loop Mode

**Mapping:**  
- Segment of S_seg samples mapped around a circle  
- Angle θ = 2π(n / S_seg)  
- Radius r = R0(1 + ModDepth*y[n])  
- Cartesian mapping to canvas center  

**Elements:**  
- Radius-modulated polyloop  
- Optional rotating animation  
- Optional pointer at current sample  

---

**Default Size:**  
420 × 420 px

**Background:**  
Background Color

---

## 6. Algorithm Notes

### Wave Indexing
- S_wave = sampleRate / baseFrequency  
- w = floor(i / S_wave)  
- p = (i % S_wave) / S_wave  
- u = w / (N_waves - 1)  
- t = i / sampleRate  
- g = i / (N_total - 1)

---

### Equation Evaluation
`y = f(p, w, u, t, g)`

Compiled via safe sandboxed new Function.

---

### Oscilloscope Rendering
`S_display = CyclesShown * S_wave`

Mapping: `x = (n / S_display) * canvasWidth`

---

### Segment Looping
```
S_seg = SegmentWaveCount * S_wave
n_play = (n_play + sampleRate/FPS) % S_seg
```

---

### Circular Rendering
```
θ = 2π * (n / (S_seg - 1))
r = R0 * (1 + ModDepth * y[n])
x = cx + r*cos(θ)
y = cy + r*sin(θ)
```

---

### Performance Notes
- Use one draw point per pixel  
- Precompile all equations  
- Use offscreen canvas for GIF export  
- Consider WebAudio AudioBufferSourceNode for playback  

---

## 7. Similar Tools

- Wave Interference Tool — parametric equation generation  
- Cymatics Tool — audio visualisation  
- Signal Visualiser — oscilloscope-like traces  

This tool extends them with:  
- Arbitrary equations  
- Wave indexing  
- Segment looping  
- Circular polar display  

---

## 8. Future Extensions
- Sequencing system for equation switching  
- Keyframe animation for parameters  
- Per-equation colour modulation  
- Interactive cursor for node-based equation editing  
- SVG export of circular loops  

---

## 9. Reusable Code Candidates

| Code Block | Category | Reuse Potential |
|------------|----------|-----------------|
| Equation compiler | Equation | High |
| Oscilloscope renderer | Visualisation | Medium |
| Circular polar mapping | Visualisation | Medium |
| WAV exporter | Audio Export | High |
| Loop-segment engine | Audio DSP | Medium |
| FPS–sample-rate synchroniser | Animation | High |

