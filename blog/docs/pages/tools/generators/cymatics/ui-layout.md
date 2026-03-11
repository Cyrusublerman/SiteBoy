# Cymatics — UI Layout

## Parameter Table

| Key | Label | Type | Min | Max | Step | Default | Group | Controls | Rebuild? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `vizMode` | Display | radio | — | — | — | Particle | Visualization | Selects the rendering mode. `Particle` displaces a grid of probes; `Density` computes per-pixel intensity as ImageData; `Radial` samples at 2px grid and draws circles. Applies live. | No |
| `showSources` | Show Sources | toggle | — | — | — | true | Visualization | When true, draws a 4px white circle at each source position. Applies live. | No |
| `rootNote` | Root Note | dropdown | — | — | — | A4 | Frequency | Base frequency for all sources. Options: C4=262Hz, D4=294Hz, E4=330Hz, F4=349Hz, G4=392Hz, A4=440Hz, B4=494Hz. Applied live each frame by updating each source's `baseFreq, noteFreq, freq`. | No |
| `chordType` | Chord Type | dropdown | — | — | — | maj | Frequency | Sets the semitone intervals assigned to sources (cycling through the chord's semitone array). Applied only at first frame; changing after first frame has no effect. Options: maj [0,4,7], min [0,3,7], dim [0,3,6], aug [0,4,8], maj7 [0,4,7,11], min7 [0,3,7,10], dom7 [0,4,7,10], sus4 [0,5,7]. | Yes (first frame only — bug) |
| `template` | Layout | dropdown | — | — | — | triangle | Pattern | Sets the spatial arrangement of sources. Applied only at first frame; changing after first frame has no effect. Options: triangle (3), circle6 (6), circle12 (12), grid3 (9), grid4 (16), star5 (5), corners (4), cross (5). Number in parentheses = source count for that template. | Yes (first frame only — bug) |
| `amplitude` | Amplitude | slider | 1 | 10 | 0.5 | 3 | Wave Parameters | Wave amplitude applied to all sources. Updated live each frame on all sources. Directly scales `wave_s = amp × sin(...)`. Higher values increase particle displacement and pixel brightness. | No |
| `speed` | Speed | slider | 0.01 | 0.2 | 0.01 | 0.08 | Wave Parameters | Controls the rate of time accumulation: `t = frame × speed`. Higher speed advances the phase faster, making the pattern appear to rotate more quickly. | No |
| `boost` | Contrast | slider | 1 | 10 | 0.5 | 3 | Wave Parameters | Gamma correction exponent: `normalised^(1/boost)`. Only applies to Density and Radial modes. At boost=1 (linear); at boost>1, mid-tones are brightened (gamma < 1). | No |
| `particleSpacing` | Particle Density | slider | 2 | 10 | 1 | 5 | Wave Parameters | Spacing in pixels between particle probes in the grid. Applied only at first frame; changing after first frame has no effect. At spacing=5 on 512×512: ≈10,486 particles. At spacing=2: ≈65,536 particles. | Yes (first frame only — bug) |
| `canvasWidth` | Width | slider | 256 | 1024 | 64 | 512 | Canvas | Declared in parameters but **not read in `draw()`**. The generator uses `canvas.width` from the host argument. Has no effect on output. | No |
| `canvasHeight` | Height | slider | 256 | 1024 | 64 | 512 | Canvas | Declared in parameters but **not read in `draw()`**. Same issue as `canvasWidth`. | No |

---

## Preset Table

Preset values use the `values: {}` nested format (non-standard; see `issues-and-conflicts.md`). Not all parameter keys are present in each preset — `canvasWidth/Height` are omitted.

| Name | Key values | Visual character |
| --- | --- | --- |
| Default | vizMode: particle, rootNote: A4, chordType: maj, template: triangle, amplitude: 3, speed: 0.08, boost: 3, particleSpacing: 5, showSources: true | Three-source triangle arrangement at A4 major intervals. Moderate particle density, source markers visible. Baseline entry state. |
| Density Field | vizMode: density, rootNote: C4, chordType: min7, template: circle6, amplitude: 4, speed: 0.05, boost: 4, particleSpacing: 5, showSources: false | Six sources in ring at C4 minor-7th intervals; full-canvas density map; slow animation; enhanced contrast. No source markers. |
| Grid Pattern | vizMode: particle, rootNote: G4, chordType: maj7, template: grid3, amplitude: 2, speed: 0.1, boost: 3, particleSpacing: 4, showSources: true | Nine sources in 3×3 grid at G4 major-7th intervals; denser particle grid (spacing=4); faster animation. |

---

## Sidebar Structure

```
PARAMS
  Visualization
    Display (radio) [vizMode]
    Show Sources (toggle) [showSources]
  Frequency
    Root Note (dropdown) [rootNote]
    Chord Type (dropdown) [chordType]
  Pattern
    Layout (dropdown) [template]
  Wave Parameters
    Amplitude (slider) [amplitude]
    Speed (slider) [speed]
    Contrast (slider) [boost]
    Particle Density (slider) [particleSpacing]
  Canvas
    Width (slider) [canvasWidth]
    Height (slider) [canvasHeight]
ANIMATE  (present — type: infinite, defaultFps: 60, canPrerender: true)
EXPORT   (present — png: true, gif: true, webm: true, sequence: true)
INFO     (present — description field exists)
```

---

## UX Notes

- `template`, `chordType`, and `particleSpacing` silently ignore changes after the first frame. Users who change these parameters mid-session will observe no effect, with no error or warning. To apply a new template or chord, the generator must be reloaded/reinitialised. This is a known bug.

- `boost` has no effect in particle mode — it is only used in `drawDensity` and `drawRadial`. The label "Contrast" would be confusing to users in particle mode where it does nothing.

- Source count varies significantly by template: grid4 produces 16 sources, triangle produces 3. This has a large effect on performance (density mode: 16× more computation with grid4 than triangle) but is not communicated to the user.

- In Density mode, the computation cost is O(W × H × N_sources) per frame — at 512×512 with grid4 (16 sources): ~4.19M wave evaluations per frame at 60fps. This is a significant performance load.

- `canvasWidth` and `canvasHeight` sliders are inert (see parameter table note). Moving them changes values that are never read.

- The `radial` mode uses a hardcoded resolution of 2 pixels (samples every 2 pixels). A user-facing resolution control was specified in the legacy docs but is not present in the live source.
