# Cymatics — Issues and Conflicts

## Standards Compliance Check (`build-page.md` §8)

**This is a 2D generator (context: '2d'); p5 rules do not apply.**

**All generator rules:**

- No `document.*` / `window.*` / `.innerHTML` / `.createElement`: **PASS** — none present in source
- No `requestAnimationFrame` / `setInterval` / `setTimeout` for animation: **PASS** — none present; animation is host-driven; `frame` argument is used deterministically
- Canvas output uses VGA palette or algorithmic colour with justification: **CONDITIONAL PASS** — greyscale values in density/radial modes are computed quantities (intensity values from wave superposition); not VGA-discrete but justified by physics model. In particle mode: `rgba(192, 192, 192, ${alpha})` uses raw rgba string with VGA silver values (192 = 0xC0) at variable alpha — the base colour is VGA but the raw rgba string violates the "only CSS vars `var(--vga-*)`" rule. Source markers: `ctx.fillStyle = '#ffffff'` — VGA white ✓. Background: `'#000000'` — VGA black ✓.
- No inline algorithm that exists in `assets/js/shared/algorithms/`: **PASS** — wave superposition and chord-to-frequency mapping are not in the shared library
- State stored on `this`, not undocumented module-level variables: **FAIL** — `sources`, `particles`, `t` are module-level mutable variables, not on `this`. The `onDestroy` hook attempts cleanup but does not correct the architecture.
- `destroy()` or equivalent cleanup: **FAIL** — `onDestroy` hook is defined as `SCRIPT_CONFIG.onDestroy` which is a non-standard cleanup method name. Standard requires `destroy()`. Whether the host calls `onDestroy` is implementation-dependent.
- `id` is kebab-case and matches filename: **PASS** — `id: 'cymatics'`, file `cymatics.gen.js`
- `title` is Title Case: **PASS** — `title: 'Cymatics'`
- `category` is one of permitted values: **PASS** — `category: 'wave'`
- All parameter keys are camelCase: **PASS** — `vizMode, showSources, rootNote, chordType, template, amplitude, speed, boost, particleSpacing, canvasWidth, canvasHeight`
- All preset objects include `name` and all parameter keys: **FAIL** — presets use nested `values: {}` format; also `canvasWidth/Height` are absent from all presets. Standard: `{ name: '...', key: value, ... }` at top level.
- Render hook is a method on SCRIPT_CONFIG: **FAIL** — `draw` is a module-level function assigned as `draw: draw`. Does not use `this`.

---

## Bug and Risk Detection

**[ERROR] [BUG] `template`, `chordType`, and `particleSpacing` have no effect after first frame**
Location: `draw()` — `if (particles.length === 0 || sources.length === 0)` guard
Evidence: `setupSources()` is called only when `sources.length === 0`. After the first frame, `sources.length > 0` always (unless `onDestroy` fired). Changing `params.template` or `params.chordType` does not trigger a new call to `setupSources()`. Similarly for `initParticles()` and `particleSpacing`.
Impact: Three of 11 user-facing parameters are silently inert after the first frame. Users see no response when moving the `template`, `chordType`, or `particleSpacing` sliders. The parameter values are consumed only at initialisation time. This is a silent correctness failure — no error is thrown.

**[WARN] [BUG] `canvasWidth` and `canvasHeight` parameters not wired in `draw()`**
Location: `draw()` — uses `canvas.width` and `canvas.height` from host argument; `params.canvasWidth` and `params.canvasHeight` are never read
Evidence: Neither key appears in the `draw()` function body.
Impact: Both Canvas sliders are inert. Same pattern as solar-system.gen.js.

**[WARN] [STANDARDS] Module-level mutable state**
Location: module level — `let sources = []`, `let particles = []`, `let t = 0`
Evidence: All three are declared at module scope, mutated by `draw()` and its called functions, and reset by `onDestroy`.
Impact: Same risk as solar-system: stale state on module reuse if the host does not call `onDestroy` before reloading the generator.

**[WARN] [STANDARDS] `onDestroy` is a non-standard cleanup hook name**
Location: `SCRIPT_CONFIG.onDestroy`
Evidence: `build-page.md` and `code-standards.md` specify `destroy()` as the cleanup method name. SCRIPT_CONFIG uses `onDestroy` instead.
Impact: If the host only calls `destroy()` on cleanup, the module-level state (`sources`, `particles`, `t`) will not be reset on generator teardown, causing incorrect initialisation on reload.

**[WARN] [STANDARDS] Preset format uses `values: {}` nesting**
Location: `SCRIPT_CONFIG.presets` — each preset: `{ name: '...', values: { ... } }`
Evidence: Standard preset format requires parameter keys at the top level of the preset object; not nested under `values`.
Impact: Host may fail to apply preset values if it reads `preset[key]` rather than `preset.values[key]`.

**[WARN] [STANDARDS] Raw `rgba()` string for particle alpha rendering**
Location: `drawParticle()` — `ctx.fillStyle = \`rgba(192, 192, 192, ${bucketAlpha.toFixed(2)})\``
Evidence: `build-page.md` §3 requires CSS vars (`var(--vga-*)`); no raw hex/rgb/rgba.
Impact: Minor — the VGA silver value (192) is correct, but the string form violates the colour rule. If VGA silver's CSS var value changes, this hardcoded 192 would desync.

**[WARN] [STANDARDS] Render hook assigned as external function reference**
Location: `SCRIPT_CONFIG = { ..., draw: draw }` where `draw` is a module-level function
Evidence: Consistent with solar-system and lissajous patterns; `draw` does not use `this`.
Impact: Violates the method pattern per `code-standards.md` §2.

**[NOTE] [STANDARDS] Non-standard SCRIPT_CONFIG fields**
Location: `SCRIPT_CONFIG.compute` and `SCRIPT_CONFIG.animation.canPrerender`
Evidence: `compute: { cost: 'per-pixel', interactionScale: 0.5, idleDelay: 200 }` and `canPrerender: true` — neither field is in the documented SCRIPT_CONFIG contract.
Impact: These are hints for optional host subsystems. If the host does not recognise them, they are silently ignored. `canPrerender: true` signals that `frame` is deterministic and the host may precompute frames for GIF/WebM export — this is accurate for this generator (`t = frame × speed`).

---

## Performance Risks

**[ERROR] [PERFORMANCE] Density mode exceeds frame budget at high source counts**
Location: `drawDensity()` — inner triple loop: `for y ... for x ... for s: total += |getWave(x, y, t)|`
Evidence: At template=grid4 (16 sources), 512×512 canvas: 16 × 262,144 ≈ 4.19M wave evaluations per frame. Each evaluation: 1 `sqrt` + 1 `sin` + ~5 arithmetic ops ≈ 40–80ns each. Estimated total: 168–336ms per frame vs 16.7ms budget.
Impact: Frame rate will drop to approximately 3–6fps at the worst case. This degrades the animation severely and is not surfaced as a warning to the user.

**[WARN] [PERFORMANCE] Per-pixel sqrt evaluated redundantly every frame (density mode)**
Location: `drawDensity()` — `getWave()` calls `Math.sqrt(dx*dx + dy*dy)`
Evidence: Source positions are fixed after setup. The distance from each source to each pixel never changes between frames. Re-evaluating `sqrt(dx² + dy²)` for every pixel, every frame, every source is redundant.
Impact: For density mode with grid4 (16 sources) on 512×512: 4.19M `sqrt` calls per frame that could be replaced by a single Float32Array lookup after one-time precomputation.

---

## Parity Holes (as Issues)

**[NOTE] [PARITY] `template`, `chordType`, `particleSpacing` frozen after first frame (also flagged as ERROR [BUG] above)**
Location: `draw()` lazy init guard
Evidence: No rebuild mechanism for these parameters.
Impact: Three parameters appear interactive but are not.

**[NOTE] [PARITY] Click-to-add source interaction absent**
Location: Not present in live source
Evidence: `cymatics.md` §1: "Click canvas to add wave sources at position"; audit: "Click to add sources: ❌ Missing"
Impact: Primary interactive feature from the original cymatics concept is unavailable.

**[NOTE] [PARITY] Web Audio oscillator playback absent**
Location: Not present in live source
Evidence: `cymatics.md` §1: "Audio playback via Web Audio oscillators"; audit: "Web Audio playback: ❌ Documented but not implemented"
Impact: Audio feedback feature documented and expected is absent.

---

## Escalation Issues

**[NOTE] [ESCALATION] Algorithm candidate: 2D wave interference computation**
Location: `WaveSource.getWave()` and `WaveSource.getDisplacement()` in `cymatics.gen.js`
Description: Point-source circular wave: `amp × sin(2π × dist / freq − t)`; radial displacement vector; designed for superposition across multiple sources.
Candidate library location: `assets/js/shared/algorithms/physics/wave-interference.js`
Reason: the same wave physics is used in `wave-interference.gen.js` and potentially `interference-figure.gen.js`; `WaveSource` class noted as high-reuse candidate in `cymatics.md` §8; not currently in shared library

**[NOTE] [ESCALATION] Algorithm candidate: semitone-to-frequency mapping**
Location: `WaveSource.constructor()` — `this.noteFreq = baseFreq * Math.pow(2, semitone / 12)`
Description: Equal-temperament frequency from semitone offset and root frequency.
Candidate library location: `assets/js/shared/algorithms/music/temperament.js`
Reason: reusable across any generator using musical pitch; noted as high-reuse candidate in `cymatics.md` §8
