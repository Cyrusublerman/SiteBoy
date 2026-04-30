# Cymatics — Mechanisms

Mathematical model class: two-dimensional scalar wave superposition with musical pitch intervals, per-pixel and per-particle evaluation.

---

## State Model

All persistent state is held in module-level variables and reset via `destroy()` / `onDestroy()` compatibility hook on `SCRIPT_CONFIG`.

| Variable | Type | Holds | Initialised | Mutates | Reset trigger |
| --- | --- | --- | --- | --- | --- |
| `sources` | Array of WaveSource | Active wave source objects; each holds position, frequency, amplitude | First `draw()` call via `setupSources()` | `amp`, `baseFreq`, `noteFreq`, `freq` updated live each frame; position and semitone immutable after setup | `destroy/onDestroy`: set to `[]` |
| `particles` | Array of `{x, y, ox, oy}` | Grid of particle probes; `ox/oy` = rest position (immutable after setup); `x/y` = displaced position (updated per frame) | First `draw()` call via `initParticles()` | `x, y` updated every frame in `drawParticle()` | `destroy/onDestroy`: set to `[]` |
| `t` | number | Time accumulator; advances as `t = frame × speed`; argument to wave phase: `sin(... − t)` | 0 at module load; set on first `draw()` call | Every frame: `t = frame × speed` | `destroy/onDestroy`: reset to 0 |

### WaveSource instance fields

| Field | Type | Holds | Set by |
| --- | --- | --- | --- |
| `x, y` | number (px) | Canvas position of source | `setupSources()` via template; immutable after construction |
| `semitone` | number | Semitone offset from root note assigned to this source; range 0–11 | `setupSources()` — cycles through chord interval array; immutable |
| `amp` | number | Wave amplitude; range [1, 10] | Constructor; then overwritten each frame from `params.amplitude` |
| `baseFreq` | number (Hz) | Root frequency; range [262, 494] | Constructor; then overwritten each frame from `ROOT_NOTES[params.rootNote]` |
| `noteFreq` | number (Hz) | `baseFreq × 2^(semitone/12)` — equal temperament | Constructor; then recomputed each frame |
| `freq` | number | `noteFreq / 10` — spatial frequency divisor for canvas scale | Constructor; then recomputed each frame |

---

## Function Inventory

| Function | Role | Inputs | Output | Complexity |
| --- | --- | --- | --- | --- |
| `WaveSource.constructor(x, y, semitone, amplitude, baseFreq)` | Creates a wave source with position, pitch, and amplitude; computes `noteFreq` and `freq` | position, semitone, amplitude, baseFreq | WaveSource object | O(1) |
| `WaveSource.getWave(px, py, time)` | Evaluates the scalar wave contribution from this source at canvas point (px, py) at time | `px, py: number` (canvas px), `time: number` | `number` — signed wave value | O(1) |
| `WaveSource.getDisplacement(px, py, time)` | Returns radial displacement vector at (px, py) from this source | same as getWave | `{x: number, y: number}` — displacement in canvas pixels | O(1) |
| `initParticles(W, H, spacing)` | Creates a uniform grid of particle probes at `spacing` pixel intervals; sets rest positions | `W, H: number`, `spacing: number` | void; mutates module `particles` | O((W/spacing) × (H/spacing)) |
| `setupSources(template, chordType, W, H, baseFreq, amp)` | Gets template positions, assigns semitones from chord interval array cycling, creates WaveSource objects | template name, chord name, canvas dims, base frequency, amplitude | void; mutates module `sources` | O(N_positions) |
| `drawParticle(ctx, W, H, speed)` | Updates all particle positions via summed displacement vectors; alpha-bucket batch rendering (20 buckets); draws 2×2 px rects | ctx, canvas dims, speed (unused in this function) | void | O(N_particles × N_sources) |
| `drawDensity(ctx, W, H, boost)` | Per-pixel wave intensity computation using ImageData; min-max normalisation; gamma correction; putImageData | ctx, canvas dims, boost | void | O(W × H × N_sources) |
| `drawRadial(ctx, W, H, boost)` | Samples at 2px grid; computes intensity per sample; normalises and gamma-corrects; draws filled circles for samples above threshold | ctx, canvas dims, boost | void | O((W/2) × (H/2) × N_sources) |
| `draw(ctx, canvas, params, frame)` | Main render hook: lazy init, time update, live source param update, vizMode dispatch, source marker draw | ctx, canvas, params, frame | void | vizMode-dependent |

---

## Mathematical Model

**Equal temperament pitch:**
`noteFreq_s = baseFreq × 2^(semitone_s / 12)`

where:
- `baseFreq` — root frequency in Hz; from `ROOT_NOTES[params.rootNote]`: C4=262, D4=294, E4=330, F4=349, G4=392, A4=440, B4=494
- `semitone_s` — interval of source s from chord definition; e.g. major chord = [0, 4, 7]
- `noteFreq_s` — source frequency in Hz; equal temperament

**Spatial frequency (canvas scaling):**
`freq_s = noteFreq_s / 10`

where:
- `freq_s` — wave spatial frequency in pixels per cycle; wavelength = `freq_s`
- Division by 10 maps audible frequencies (262–550 Hz) to pixel wavelengths of 26–55 pixels — perceptually dense for a 512px canvas

**Scalar wave at point (per source):**
`wave_s(x, y, t) = amp × sin(2π × (dist(x,y,s) / freq_s − t))`

where:
- `dist(x,y,s) = sqrt((x − sx)² + (y − sy)²)` — Euclidean distance from source to canvas point; pixels (clamped to ≥1 to avoid division by zero)
- `amp` — amplitude; dimensionless, from `params.amplitude`; range [1, 10]
- `t` — time; dimensionless, = `frame × speed`
- `speed` — from `params.speed`; range [0.01, 0.2]

**Superposition (total wave intensity, density/radial modes):**
`total(x, y, t) = Σ_s |wave_s(x, y, t)|`

where:
- Sum is over all sources (N_sources depends on template: triangle=3, circle6=6, circle12=12, grid3=9, grid4=16, star5=5, corners=4, cross=5)
- Absolute value taken — density and radial modes show magnitude, not signed value

**Normalisation and gamma correction:**
`normalised = (total − min_total) / (max_total − min_total)`
`gamma_corrected = normalised^(1 / boost)`

where:
- `min_total, max_total` — per-frame global min and max of total intensity across all sampled points
- `boost` — gamma exponent denominator; from `params.boost`; range [1, 10]; boost > 1 brightens mid-tones; boost = 1 is linear

**Pixel value (density mode):**
`grey = floor(gamma_corrected × 255)`
Written as R=G=B=grey in ImageData (greyscale)

**Radial displacement vectors (particle mode):**
For each particle at rest position (ox, oy):
`displacement_s = {x: (ox − sx) / dist × wave_s, y: (oy − sy) / dist × wave_s}`
`total_dx = Σ_s displacement_s.x`, `total_dy = Σ_s displacement_s.y`
`p.x = ox + total_dx`, `p.y = oy + total_dy`

**Particle alpha:**
`disp = sqrt((p.x − p.ox)² + (p.y − p.oy)²)`
`alpha = min(disp × 0.15, 1)`

where:
- alpha threshold: 0.05 — particles below this are not drawn
- 20 alpha buckets: `bucketIdx = floor((alpha − 0.05) / 0.95 × 20)`
- `bucketAlpha = 0.05 + (bucketIdx + 0.5) / 20 × 0.95` — centroid of bucket

**Time accumulation:**
`t = frame × speed`

where:
- `frame` — frame count argument from host; not wall clock time
- This ensures deterministic animation with respect to frame number (no `Date.now()` dependency)

---

## Render Loop Order

`draw(ctx, canvas, params, frame)` executes in this order:

1. If `particles.length === 0` or `sources.length === 0`: call `initParticles(W, H, params.particleSpacing || 5)` and `setupSources(params.template, params.chordType, W, H, ROOT_NOTES[params.rootNote], params.amplitude)`
2. Set `t = frame × params.speed`
3. For each source: update `amp = params.amplitude`, `baseFreq = ROOT_NOTES[params.rootNote]`, `noteFreq = baseFreq × 2^(source.semitone/12)`, `freq = noteFreq / 10`
4. Parse `vizMode = params.vizMode.toLowerCase()`
5. If `'particle'`: call `drawParticle(ctx, W, H, speed)`:
   - For each particle: sum displacement vectors from all sources at rest position (ox, oy); update p.x, p.y
   - Fill black background
   - Sort particles into 20 alpha buckets by displacement magnitude
   - For each non-empty bucket: set fillStyle `rgba(192,192,192,α)`, draw rect for each particle in one path fill
6. If `'density'`: call `drawDensity(ctx, W, H, boost)`:
   - Allocate ImageData and Float32Array(W×H)
   - For each pixel: sum |wave_s| over all sources; track min/max
   - Normalise and gamma-correct; write to ImageData; putImageData
7. If `'radial'`: call `drawRadial(ctx, W, H, boost)`:
   - Fill black background
   - Sample at res=2 grid; compute intensities; track min/max
   - For each sample above threshold (0.05): compute grey; draw arc (filled circle of radius max(1, 1.6))
8. If `params.showSources`: for each source, draw 4px white filled circle at (source.x, source.y)

---

## Rebuild Mechanism

Rebuild logic is explicit in `draw()`:

- `template` or `chordType` change -> `setupSources()` + `buildPixelDistCache()` + particle rebuild
- `particleSpacing` change -> `initParticles()` + `buildParticleDistCache()`

**Live parameters** (take effect immediately): `rootNote`, `amplitude`, `speed`, `boost`, `vizMode`, `showSources`.  
**Rebuild parameters**: `template`, `chordType`, `particleSpacing`.
