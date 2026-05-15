# Generator Feedback Archive — 2026-04-28

> **ARCHIVED 2026-04-29.** All §4 per-gen rows promoted to `issues.md` (GEN-031 → GEN-111) as FIXED 2026-04-28/29. All §3 cross-cutting rows promoted as HOST-001 → HOST-016. This file is read-only historical record. Do not edit. See `issues.md` Notes for cross-link.

**Source:** live testing pass by user across all 25 generators + host.
**Status:** ARCHIVED — fully promoted to `issues.md`.
**Pairs with:** `issues.md` (formal register), `drift-detection.md`, `single-gen-review.md`, `verification.md`.

---

## Index

- §1 Conventions and defined terms
- §2 Categorisation indices (multi-axis)
- §3 Cross-cutting items (`X-NNN`)
- §4 Per-generator items (one row per Clause)
- §5 Severity rollup
- §6 **Pre-fix investigations** — what to verify before any code change
- §7 Component / algorithm gaps to confirm
- §8 Sequencing
- §9 Open decisions for user
- §10 Promotion to `issues.md`

---

## 1 — Conventions and defined terms

| Term | Meaning |
|---|---|
| HOST | `assets/js/tools/generators/core/generative-tool-host.js` (canvas + sidebar + toolbar contract). |
| GEN | per-script behavioural issue. |
| UI | sidebar/toolbar/control surface issue. |
| VIEW | viewport scaling, canvas-size honour, FIT/FILL/ACTUAL. |
| PERF | frame-rate, UI-thread block, worker absence. |
| ARCH | contract / file-ownership violation. |
| EXP | export pipeline issue. |
| COMP | missing or insufficient shared component (`assets/js/shared/components/`). |
| FEAT | net-new capability not present in any reference. |
| SEV | P0 broken / P1 major / P2 notable / P3 minor. |
| Clause | one discrete sentence in user feedback; one Clause = one row. |
| Cross-cutting | `X-NNN` row that resolves the same issue across ≥2 generators. |
| Promotion | move row from this file → `issues.md` with permanent ID. |

**Rules:**
- Every Clause MUST map to ≥1 row. No silent merging.
- A Clause referencing a cross-cutting fix MAY be a single line that just cites the `X-NNN` ID.
- `Investigation` (§6) MUST complete for a row before that row enters Phase B+ work.
- A "fix" is not done until its Acceptance row passes.

---

## 2 — Categorisation indices

Same backlog, four axes for triage.

### 2.1 — By severity

| SEV | Count | Row IDs |
|---|---:|---|
| P0 | 14 | CYM-01, TIL-01, TIL-02, CIR-03, CIR-04, IFG-01, IFG-02, SOL-06, DEF-03, ORD-03, MOI-01, QUI-04, QUI-05, WIN-01 |
| P1 | ~52 | (see §3, §4) |
| P2 | ~22 | (see §3, §4) |
| P3 | 0 | — |

### 2.2 — By type

| Type | Cross-cutting | Per-gen |
|---|---|---|
| GEN | — | TOR-03, TOR-04, MOI-04, CYM-01..05, WIN-04, GPA-01, TIL-01..06, GOL-02, GOL-04, ORD-03, SHA-01..04, FIB-01, CIR-03..08, SQU-01, SOL-01..04, SOL-07, IFG-01, IFG-04, IFG-05, DEF-01..03, CLK-02..05, CUR-01, CUR-02, QUI-02, QUI-03, QUI-06, QUI-07 |
| UI | X-001, X-014, X-015, X-017 | MOI-02, CYM-02, CYM-06, GOL-01, GOL-03, ORD-04, IFG-03, UNI-01, DEF-04, CLK-01, QUI-01 |
| VIEW | X-004, X-005 | MOI-01, CIR-01, ORD-01, IFG-01, QUI-04 |
| PERF | X-011 | WIN-02, ORD-03, IFG-02, QUI-05 |
| ARCH | — | WIN-03, WIN-06 |
| EXP | — | FIB-03 |
| COMP | X-002, X-006, X-007, X-008, X-009, X-010, X-012, X-013 | GOL-02, TIL-05, DEF-01, QUI-01, QUI-03 |
| FEAT | — | LIS-01, FIB-02, SOL-04, SOL-07 |
| HOST | X-001, X-002, X-003, X-004, X-005, X-007, X-011, X-014, X-016 | — |

### 2.3 — By scope (which fix unblocks the most)

| Cross-cutting fix | Per-gen rows resolved-by |
|---|---|
| X-004 / X-005 (canvas-size honour) | MOI-01, WIN-01, QUI-04, CIR-01 (partial), and any `VIEW` row referencing canvas dimensions |
| X-006 (`ColorInput` everywhere) | TOR-01, MOI-02, GOL-02 (partial), QUI-01 (partial), every "colour input" Clause |
| X-007 (per-element colourway[]) | TOR-02, CIR-02, ORD-04, QUI-01, plus implicit in `cymatics`, `solar-system`, `defecated` |
| X-002 (animate-param strength/rate) | MOI-03, CIR-06, CIR-08, CLK-04, GOL-03 (partial), plus future modulator chains |
| X-011 (worker compliance) | WIN-02, ORD-03, IFG-02, QUI-05, plus reopen of PERF-003..015 in `issues.md` |
| X-014 (drag emitter handles) | CYM-02, CYM-06, WIN-05 |
| X-017 (hidden flag) | GPA-01, UNI-01 |

### 2.4 — By generator (file order)

| Generator | Rows | Highest SEV |
|---|---|---|
| `animated-lines` | — | — (no Clauses this pass) |
| `circles` | CIR-01..08 | P0 |
| `clockwise` | CLK-01..05 | P1 |
| `curtain-morph` | CUR-01, CUR-02 | P1 |
| `cymatics` | CYM-01..06 | P0 |
| `defecated` | DEF-01..04 | P0 |
| `fibonacci-balls` | FIB-01..03 | P2 |
| `generative-pattern` | GPA-01 | P1 |
| `golden-grid` | GOL-01..04 | P1 |
| `harmonics` | — | — |
| `interference-figure` | IFG-01..05 | P0 |
| `lissajous` | LIS-01, LIS-02 | P1 |
| `moire` | MOI-01..04 | P0 |
| `order-disorder` | ORD-01..04 | P0 |
| `p5-wave-colour` | (folded into WIN-*) | P1 |
| `p5-wave-interference` | (folded into WIN-*) | P0 |
| `quine` | QUI-01..07 | P0 |
| `shape-array` | SHA-01..04 | P1 |
| `solar-system` | SOL-01..07 | P0 |
| `squares` | SQU-01 | P2 |
| `tile-mosaic` | TIL-01..06 | P0 |
| `torus` | TOR-01..04 | P1 |
| `unified-pattern` | UNI-01 | P1 |
| `wave-equation-synth` | — | — |
| `wave-interference` | WIN-01..06 | P0 |

---

## 3 — Cross-cutting items (`X-NNN`)

Resolving these at HOST/COMP level eliminates large parts of §4.

| ID | Type | SEV | Title | Summary | Owner file(s) |
|---|---|---|---|---|---|
| X-001 | HOST | P1 | Spacebar play/stop | Bind `Space` (canvas-focused, no input focus) → toggle PLAY/STOP on `ANIMATE`. | `generative-tool-host.js` |
| X-002 | HOST + COMP | P1 | Animate-param amplitude+rate | Each "animate this param" toggle lacks `strength` (amplitude) and `speed` (rate) inputs. Define `AnimateParamControl` with `{enabled, waveform, strength, rate, phase}`. Investigate modulator graph (LFO/envelope/sample-and-hold) before locking schema. | `generative-tool-host.js`, new `components/input/AnimateParamControl.js` |
| X-003 | HOST | P1 | Timeline survives orientation flip | Switching landscape↔portrait while ANIMATE timeline open destroys the timeline DOM and never re-mounts. Re-mount on canvas re-init. | `generative-tool-host.js`, `AnimationExport.js` |
| X-004 | HOST | P1 | Canvas-size honour (non-square) | Multiple generators (`wave-interference`, `quine`, `circles`) ignore `Width × Height` from CANVAS tab. CANVAS tab MUST be single source of truth; ALL `.gen.js` MUST consume `props.canvasW`, `props.canvasH` verbatim. | `generative-tool-host.js`, all `.gen.js` |
| X-005 | HOST | P1 | Identical CANVAS tab everywhere | "the canvas control and effect should be identical for every single generator." Audit every `.gen.js` for any custom canvas/size logic outside CANVAS tab; remove. | All `.gen.js` |
| X-006 | COMP | P1 | `ColorInput` mandated everywhere | All colourway / per-element colour inputs must use `assets/js/shared/components/input/ColorInput.js`. Audit completeness (swatches, alpha, hex, eyedropper). | `ColorInput.js`, all `.gen.js` |
| X-007 | HOST + COMP | P1 | Per-element `colourway[]` schema | Current `Colourway` group only sets `background`. Define schema where each generator declares paintable layers; HOST renders one `ColorInput` per layer. Example torus: `{outerLines, innerMeshLines, shadedDiscs, background}`. | `generative-tool-host.js`, `parameter-builder.js`, all `.gen.js` |
| X-008 | COMP | P2 | Equation/text overlay | Optional rendered equation overlay with `position`, `colour`, `font`, `size`, `weight`, `case`, `padding`. Used by `lissajous`, `harmonics`, `torus`, `wave-equation-synth`. | New `components/output/OverlayText.js` |
| X-009 | COMP | P2 | Typography pipeline | Central font-family list, weight axis, fallback chain. Used by X-008, `defecated` cycling, `quine`. | New `components/typography/TypographyHelper.js` (or extend foundation) |
| X-010 | COMP | P1 | `NoiseTypeSelect` | Site-wide noise selector pulling from canonical list (white / value / blue / worley / ridged-fbm / turbulence — already in `assets/js/shared/algorithms/noise/`). | New `components/input/NoiseTypeSelect.js` |
| X-011 | HOST + PERF | P1 | Worker compliance audit | "the UI should never lag, even if the generator is chugging." Audit every per-pixel/heavy generator for actual worker offload. Reopen `WONTFIX` PERF rows in `issues.md`. | All heavy `.gen.js`, `compute-scheduler.js` |
| X-012 | HOST + COMP | P2 | Easing / curve input | `golden-grid`, `clockwise` ask for animation easing/curve. New `EasingCurveInput` (presets + bezier handles). | New `components/input/EasingCurveInput.js` |
| X-013 | COMP | P2 | Sound output + audio export | `fibonacci-balls` collisions, `wave-equation-synth` audio, future. Audit existing `output/AudioOutput.js`; extend `AnimationExport.js` for audio track. | `AudioOutput.js`, `AnimationExport.js`, new `components/output/SoundEmitter.js` |
| X-014 | HOST + COMP | P2 | Drag-to-position emitter overlay | `cymatics`, wave family, `p5-wave-colour`: emitters/sources draggable on canvas. Pointer events, polar/cartesian readout. | New `components/drawing/EmitterHandles.js` |
| X-015 | UI | P2 | Standard `loopFrames` policy | When `animation.type === 'loop'`, `loopFrames` is unbounded except by EXPORT, not by generator script. | `generative-tool-host.js`, `golden-grid.gen.js` |
| X-016 | HOST | P2 | RESET = true reset | `clockwise`: pressing RESET while animation has progressed does not return to t=0; param edits also advance simulation. RESET must rewind frame counter AND re-run `init` deterministically. | `generative-tool-host.js` |
| X-017 | UI | P1 | `hidden: true` registry flag | `unified-pattern`, `generative-pattern` excluded from active generator list pending rethink. Preserves files; excludes from `Select` enumeration. | `script-registry.js` |

---

## 4 — Per-generator items (Clause → row)

Generators with no Clauses this pass omitted. Each row = one user sentence.

### 4.1 — `torus`

| ID | Clause | Type | SEV | Resolution |
|---|---|---|---|---|
| TOR-01 | "Colourway inputs need the colourpicker component" | COMP | P1 | X-006 |
| TOR-02 | "be able to colour all individual elements" — outer lines, inner mesh lines, shaded discs as separate colours | HOST | P1 | X-007 with layers `{outerLines, innerMeshLines, shadedDiscs, background}` |
| TOR-03 | "missing input for how many inner shaded rings (mesh)" | GEN | P1 | New numeric param `meshRingCount` |
| TOR-04 | "speed of their rotation" (inner mesh) | GEN | P1 | New numeric param `meshRotationSpeed` |

### 4.2 — `moire`

| ID | Clause | Type | SEV | Resolution |
|---|---|---|---|---|
| MOI-01 | "isn't changing size with the canvas" | VIEW | P0 | X-004 / X-005 |
| MOI-02 | "colours are in the params not the canvas tab" | UI | P1 | Move colour controls to CANVAS → COLOURWAY (per X-007) |
| MOI-03 | "animate params are weak" | GEN | P2 | X-002 + per-grating-rotation animation channels |
| MOI-04 | "offset the gratings by setting their polar positions relative to the center" | GEN | P1 | New params `gratingA.polarR, gratingA.polarTheta`, same for `gratingB` |

### 4.3 — `lissajous`

| ID | Clause | Type | SEV | Resolution |
|---|---|---|---|---|
| LIS-01 | "key example of benefitting from showing the equations" | FEAT | P1 | X-008. Live strings: `x = A·sin(aωt + φ)`, `y = B·sin(bωt)` substituting current params |
| LIS-02 | "do we already have components/algorithms for typography" | COMP | P2 | X-009 (investigation: §6.4 audit C-04) |

### 4.4 — `wave-interference` (+ folds for `p5-wave-interference`, `p5-wave-colour`)

| ID | Clause | Type | SEV | Resolution |
|---|---|---|---|---|
| WIN-01 | "regardless of canvas size will show a square canvas" | VIEW | P0 | X-004 |
| WIN-02 | "incredibly laggy ... such a simple generator" | PERF | P1 | Profile draw path; X-011 |
| WIN-03 | "p5 wave interference should be combined with the other wave interference" | ARCH | P1 | Merge `p5-wave-interference.gen.js` + `wave-interference.gen.js` into single script with renderer toggle (`canvas2d` / `p5`) |
| WIN-04 | "params should allow for the full range of outcomes" (combined) | GEN | P1 | Param-set union + interference mode toggle (additive / cross-product / binary threshold) |
| WIN-05 | "far better positioning controls for the emitters" | UI + GEN | P1 | X-014 + numeric (x,y) + add/remove buttons |
| WIN-06 | "p5 wave colour should also be combined ... doing the same thing" | ARCH | P1 | Promote merger to all three; add `colourMode` axis (mono / hue-mapped / palette) |

### 4.5 — `cymatics`

| ID | Clause | Type | SEV | Resolution |
|---|---|---|---|---|
| CYM-01 | "super glitchy. flash between different displays and strobe" | GEN | P0 | Reproduce; suspected first-frame rebuild race after PERF-001/002 fixes. Add cache stability test |
| CYM-02 | "no custom input for points. should be able to grab them and drag them around" | UI + GEN | P1 | X-014; cymatics-specific overlay layer |
| CYM-03 | "more inputs for display of particles (glyphs/symbols, size shape colour)" | GEN | P1 | New params `particle.glyph` (Select, glyphs from `semiotics.md`), `particle.size`, `particle.shape`, `particle.colour` |
| CYM-04 | "same with the density" | GEN | P1 | Density mode mirrors particle controls (glyph/size/colour ramp) |
| CYM-05 | "should be able to do colour blending" | GEN | P2 | Add `blendMode` (Select: source-over, multiply, screen, lighten, difference) |
| CYM-06 | "subheading 'show sources' that does nothing" | UI | P1 | Wire to X-014 overlay handles |

### 4.6 — `generative-pattern`

| ID | Clause | Type | SEV | Resolution |
|---|---|---|---|---|
| GPA-01 | "hide and store ... no clue what it is trying to do but it is broken" | UI | P1 | X-017 |

### 4.7 — `tile-mosaic`

| ID | Clause | Type | SEV | Resolution |
|---|---|---|---|---|
| TIL-01 | "fitting/packing of tiles is completely fucked" | GEN | P0 | Replace packing algorithm. Candidate: `algorithms/sampling/point-distribution.js` + Voronoi fill, or true rectangle packing (skyline / MaxRects) |
| TIL-02 | "presets show huge amounts of empty space" | GEN | P0 | Acceptance: 0% background visibility, 0% overlap. Coverage metric in test |
| TIL-03 | "depth doesn't work" | GEN | P1 | Z-axis stacking + drop-shadow-equivalent. Note: `design-law.md §6` forbids shadows in UI; canvas output may differ — confirm in §9 |
| TIL-04 | "texture is non existent" | GEN | P1 | Wire `algorithms/image/texture-overlays.js` per-tile; expose intensity |
| TIL-05 | "palette selection should be much more complete like our standard palette controls" | UI + COMP | P1 | Replace ad-hoc dropdown with `PaletteSelect`. Audit existing palette infrastructure (§6.4 audit C-02) |
| TIL-06 | "pattern variety is also garbage" | GEN | P2 | Expand pattern primitives (isohedral tilings, semi-regular, Truchet — see `temp/truchet-build-guide.md`) |

### 4.8 — `golden-grid`

| ID | Clause | Type | SEV | Resolution |
|---|---|---|---|---|
| GOL-01 | "unnecessary limit on the loop frames" | UI | P2 | X-015 + remove cap |
| GOL-02 | "don't have enough control over hue, saturation, lightness ... map ranges" | GEN + COMP | P1 | New `HSLRangeInput` (min/max per channel) + per-cell mapping function input |
| GOL-03 | "more animation controls about easing, probably a curve input" | UI + COMP | P2 | X-012 |
| GOL-04 | "more controls in the original ... position-oriented and depth-oriented modulation" | GEN | P1 | Re-survey reference vs current (§6.5 ref-comparison). Add `positionModulation` + `depthModulation` channels |

### 4.9 — `order-disorder`

| ID | Clause | Type | SEV | Resolution |
|---|---|---|---|---|
| ORD-01 | "doesn't start as 'fit'. all start as fit, or all start as whatever we previously had" | VIEW | P1 | HOST default decision required (§9 Q1) |
| ORD-02 | "noise input needs a selector for type of noise that should always use site wide" | COMP | P1 | X-010 |
| ORD-03 | "incredibly laggy and needs an assessment on performance" | PERF | P0 | Reopen PERF-009. Profile; consider worker offload |
| ORD-04 | "canvas colourway having no connection to actual presentation" | UI | P1 | X-007 — actually wire `colourway[]` into draw path |

### 4.10 — `shape-array`

| ID | Clause | Type | SEV | Resolution |
|---|---|---|---|---|
| SHA-01 | "doesn't loop better and snaps. goes from 0 straight to line" | GEN | P1 | Replace linear cycle. New param `cycleMode: linear | palindrome | rotate-and-reverse` |
| SHA-02 | "shape flip upside down when it is circle and reverse animation" | GEN | P1 | Implement palindrome+flip mode |
| SHA-03 | "rotate by a set amount each round before reversing" | GEN | P1 | New param `perCycleRotation` (degrees) |
| SHA-04 | "colour controls linked to position and animation progress" | GEN | P1 | Per-cell colour function: `colour(cell.x, cell.y, t, cycleProgress)` |

### 4.11 — `fibonacci-balls`

| ID | Clause | Type | SEV | Resolution |
|---|---|---|---|---|
| FIB-01 | "arbitrary limit" (ball count) | GEN | P2 | Lift count cap; gate by perf-budget warning, not hard limit |
| FIB-02 | "introduce sound to this generator as it needs it" | FEAT + COMP | P2 | X-013. Per-collision audio event, pitch by ball-radius |
| FIB-03 | "we will need that to be included in the export" | EXP + COMP | P2 | X-013 (audio in export pipeline; `AnimationExport.js` currently video-only) |

### 4.12 — `circles`

| ID | Clause | Type | SEV | Resolution |
|---|---|---|---|---|
| CIR-01 | "don't update when I change display mode" | VIEW | P1 | On viewport-mode change, force redraw (currently cached) |
| CIR-02 | "far more colour controls" | UI | P1 | X-007 with layer-indexed `circleStrokes[]`, `circleFills[]`, `background` |
| CIR-03 | "line going from end point to center which is a big issue" | GEN | P0 | Stray segment artifact — reproduce, isolate to drawing path, remove |
| CIR-04 | "animation is not following the original ... each circle is meant to be rotating inside the previous" | GEN | P0 | Re-architect: nested rotational frames (parent → child transform). Currently flat |
| CIR-05 | "controls for how many rotations a circle does inside parent per cycle" | GEN | P1 | New per-layer param `rotationsPerCycle` |
| CIR-06 | "should be able to link this to the layer ... should all be animatable" | GEN | P1 | Per-layer modulator hooks; depends on X-002 |
| CIR-07 | "enough colour control that we could use it to create depth maps and normal maps" | GEN | P2 | Output mode toggle: `display | depth | normal`. Depth = greyscale per layer-index; normal = packed RGB from radius gradient |
| CIR-08 | "missing other things like trails and time based modulations" | GEN | P1 | `trailLength` (frame-buffer accumulation) + time-based modulators (X-002) |

### 4.13 — `squares`

| ID | Clause | Type | SEV | Resolution |
|---|---|---|---|---|
| SQU-01 | "position, index based colour options" | GEN | P2 | Add colour function `colour(cellIndex, gridX, gridY)` |

### 4.14 — `solar-system`

| ID | Clause | Type | SEV | Resolution |
|---|---|---|---|---|
| SOL-01 | "ability to show actual size differences ... or shrunk for visibility" | GEN | P1 | New param `sizeMode: realistic | log | exaggerated` |
| SOL-02 | "shade the planets to show how much is covered by sunlight" | GEN | P1 | Per-planet terminator shading using sun-vector |
| SOL-03 | "animation of past day, week, year with movement" | GEN | P1 | New params `timeRate`, `animationRange` |
| SOL-04 | "plan on having moons" | FEAT | P2 | Extend body schema with `parent` ref + Keplerian elements per moon |
| SOL-05 | "rethink how we show the viewer's position" | UI | P2 | Replace current marker; user decision required (§9 Q5) |
| SOL-06 | "interaction doesn't work with being able to click on planets and see trigonometry and name" | UI | P0 | Reproduce broken hit-testing; restore tooltip with `{name, distance, angle, velocity}` |
| SOL-07 | "more time outputs ... universe began ... seconds, minutes, hours, days, months, years, centuries, millennia, millions, billions" | GEN | P2 | New display panel; multi-scale time readouts; ≥ ~30 reference events per scale, all verifiable to that precision. Build dataset under new `algorithms/astronomy/time-anchors.js` |

### 4.15 — `interference-figure`

| ID | Clause | Type | SEV | Resolution |
|---|---|---|---|---|
| IFG-01 | "very glitchy, especially when I change canvas size" | GEN + VIEW | P0 | Reproduce; resize race likely |
| IFG-02 | "are web workers not on this?" | PERF | P0 | X-011. Verify worker presence; add if missing |
| IFG-03 | "fully assess the colour controls as if we go stylised, what selects the styles?" | UI | P1 | Document and surface `style` selector (currently implicit) |
| IFG-04 | "no animate tab. easy generator to animate" | GEN | P1 | Add `animation` block to `SCRIPT_CONFIG` (rotation, ratio drift, phase) |
| IFG-05 | "assess the seam at 0 degrees and methods of improving" | GEN | P2 | Investigate angular seam. Candidate: blend boundary samples; modular angle without integer wrap |

### 4.16 — `unified-pattern`

| ID | Clause | Type | SEV | Resolution |
|---|---|---|---|---|
| UNI-01 | "can be hidden and marked to rethink in the future" | UI | P1 | X-017 |

### 4.17 — `defecated`

| ID | Clause | Type | SEV | Resolution |
|---|---|---|---|---|
| DEF-01 | "meant to change font constantly, preferably cycling through at least 50 different fonts" | GEN + COMP | P1 | Build font roster (≥50). Depends on X-009 + font-loading strategy (§9 Q7) |
| DEF-02 | "meant to have a transition that looks like an ink bleed effect" | GEN | P1 | Replace pulse-blur with reaction-diffusion or shader-based bleed. See `temp/reactiondiffusion-build-guide.md` |
| DEF-03 | "currently it pulses a blur, overshoots the canvas and looks like shit" | GEN | P0 | Bound rendering to canvas extents; remove blur clipping bug |
| DEF-04 | "input for text with 'have you defecated today' just being the default" | UI | P1 | Add `text` string param; default literal `"have you defecated today"` |

### 4.18 — `clockwise`

| ID | Clause | Type | SEV | Resolution |
|---|---|---|---|---|
| CLK-01 | "ability to start again ... if I reset all its already a few steps into the reaction" | UI | P1 | X-016 |
| CLK-02 | "changing the parameters seems to progress the animation" | GEN | P1 | Param updates must apply at frame boundary, not advance simulation |
| CLK-03 | "better control over how each aspect modulates the other ... chain of effects and by how much" | GEN | P1 | Surface modulation matrix as parameters |
| CLK-04 | "blur trails and time based modulation" | GEN | P2 | `trailLength` + time modulators (X-002) |
| CLK-05 | "squares lose their difference quite quickly suggesting flaw in computation and order of effects" | GEN | P1 | Audit step function operation order; symmetry-preserving update |

### 4.19 — `curtain-morph`

| ID | Clause | Type | SEV | Resolution |
|---|---|---|---|---|
| CUR-01 | "needs a full analysis as it seems to vary significantly from the original" | GEN | P1 | Analysis task: diff current vs reference (`curtain-morph/feature-parity.md` + reference source). Output gap list before fixing |
| CUR-02 | "looks a bit shit and I swear it didn't always" | GEN | P2 | Regression hunt via git history of `curtain-morph.gen.js` |

### 4.20 — `quine`

| ID | Clause | Type | SEV | Resolution |
|---|---|---|---|---|
| QUI-01 | "much better colour and typography controls" | UI + COMP | P1 | X-007 + X-009 |
| QUI-02 | "bleed and ink effect needs a good rethink and analysis" | GEN | P1 | Analysis task: characterise current vs intended; choose model (reaction-diffusion / shader / hybrid) |
| QUI-03 | "controls over page texture and how it interacts with the ink" | GEN + COMP | P1 | Wire `algorithms/image/texture-overlays.js`; expose `paperTexture, paperRoughness, inkAbsorption` |
| QUI-04 | "when canvas is 1080×1080 it doesn't seem to be at all" | VIEW | P0 | X-004 |
| QUI-05 | "web workers aren't working as the UI lags" | PERF | P0 | X-011 |
| QUI-06 | "font size and look doesn't seem accurate ... text seems squashed/stretched" | GEN | P1 | Decouple text metrics from canvas scaling; render in canvas pixel space, not viewport |
| QUI-07 | "margin is also not accurate" | GEN | P1 | Audit margin computation; should use canvas dimensions (post X-004) |

---

## 5 — Severity rollup

| SEV | Count | New cross-cutting | New per-gen | Reopens (`issues.md`) |
|---|---:|---:|---:|---:|
| P0 | 14 | 0 | 14 | candidate: PERF-009 (ORD-03), possibly PERF-003 (MOI-01 root cause), PERF-004 (WIN-02) |
| P1 | ~52 | 11 | ~41 | candidate: GEN-005, GEN-009, GEN-012 (re-evaluate post user feedback) |
| P2 | ~22 | 6 | ~16 | — |
| Total | ~88 | 17 | ~71 | ≥ 3 |

---

## 6 — Pre-fix investigations

**Purpose:** before any fix is implemented, we MUST establish (a) reproduction, (b) root cause, (c) measurable acceptance, (d) regression scope. Without these, "fixed" is unverifiable. This section is the answer to "what else should we investigate."

### 6.1 — Reproduction protocols (P0 only)

Each P0 needs a deterministic reproduction script. Until reproduced, the row stays in `INVESTIGATE`, not `READY`.

| Row | Reproduction protocol | Required artefacts |
|---|---|---|
| CYM-01 strobe | Load `cymatics`, default preset, PLAY 60s, observe. Capture frame samples at t=1,5,10,30,60s. | screen capture or frame-by-frame export |
| TIL-01/02 packing | For each preset, render 1×, measure background-pixel coverage. | coverage metric script (per §6.6) |
| CIR-03 stray line | Load `circles`, screenshot at frame 0; compare to reference at same frame. | reference frame, diff overlay |
| CIR-04 nested rotation | Compare frame sequence vs reference video; measure angular position of each ring per frame. | reference frame sequence |
| IFG-01 resize race | Load `interference-figure`; rapidly change canvas W/H in CANVAS tab; observe glitching. Capture console errors. | console log |
| SOL-06 hit-testing | Load `solar-system`; click each planet; expect tooltip; record actual behaviour. | per-planet click test result |
| DEF-03 overshoot | Load `defecated`, default text, run animation, screenshot at frames 0/30/60/90; check pixel bleed beyond canvas rect. | screenshots |
| ORD-03 perf | Load `order-disorder`, default preset, profile UI thread for 10s. Record FPS, longest task. | DevTools profile JSON |
| MOI-01 size | Set CANVAS to 1920×1080; reload; check actual rendered dimensions. | DOM inspection |
| QUI-04 size | Set CANVAS to 1080×1080; check actual canvas element + draw extents. | DOM inspection |
| QUI-05 worker absence | Profile UI thread during quine animation; identify long tasks. | DevTools profile JSON |
| WIN-01 square | Set CANVAS to 1920×1080; verify square enforcement. | DOM inspection |
| WIN-02 lag | Profile UI thread, default preset, 10s. | DevTools profile JSON |
| IFG-02 worker | Inspect `interference-figure.gen.js` for worker references. Profile UI thread. | code grep result + profile |

### 6.2 — Root-cause hypotheses (must verify before coding)

| Row | Hypothesis | Verification step | If false |
|---|---|---|---|
| CYM-01 | First-frame rebuild race after PERF-001/002 cache fixes | Inspect cache invalidation logic in `cymatics.gen.js`; reproduce with cache disabled | Re-investigate render path |
| WIN-01 / QUI-04 / MOI-01 | Generator hard-codes square aspect or uses `min(w,h)` | Grep each `.gen.js` for `Math.min`, `aspect`, hard-coded `width`/`height` constants | Investigate HOST passing wrong props |
| ORD-03 | Per-particle main-thread loop | Profile; check for `for(particles)` in draw path | Investigate cache invalidation |
| QUI-05 / IFG-02 | Worker file absent or not invoked | Grep `worker` references in script + check `compute-scheduler.js` registration | Investigate worker bottleneck |
| CIR-04 | Flat (non-nested) transform stack | Read `circles.gen.js` draw function; check for `ctx.save/translate/rotate` nesting per layer | Re-investigate animation model |
| TIL-01/02 | Packing algorithm is grid-only or naive bin-pack | Read tile-mosaic packing code; identify algorithm | Re-investigate other algorithms |
| CLK-02 | Param update calls simulation step | Read `clockwise.gen.js` param-change handlers | Re-investigate state model |
| DEF-03 | Blur shader sample radius exceeds canvas; no clipping | Read shader; check sample bounds | Re-investigate render target sizing |
| QUI-06 | Font size scales with viewport, not canvas | Read text-rendering code; check `ctx.font` value source | Investigate canvas pixel-ratio |

### 6.3 — Performance baselining (before/after metrics)

For every PERF row, capture a baseline NOW. Without baseline, "improved" is unprovable.

**Baseline harness needed:** a small script that for each generator records:
- FPS (frame rate, average over 10s post-warmup)
- Frame time p50, p95, p99 (ms)
- Longest main-thread task (ms)
- Heap delta over 60s (MB)
- Worker activity (yes/no, % time busy)

**Test matrix per generator:**
| Canvas | Mode |
|---|---|
| 512 × 512 | square baseline |
| 1024 × 1024 | square mid |
| 1920 × 1080 | landscape full |
| 1080 × 1920 | portrait full |

**Targets (proposed, confirm in §9):**
- P0: UI thread no task > 50 ms
- P1: ≥ 30 FPS at 1920×1080 (default preset)
- Heap delta < 100 MB over 60s

**Generators required to baseline:** `cymatics`, `wave-interference`, `p5-wave-interference`, `p5-wave-colour`, `interference-figure`, `quine`, `order-disorder`, `tile-mosaic`, `defecated`, `moire`, `clockwise`, `golden-grid`.

### 6.4 — Codebase audits (before §3 cross-cutting fixes)

These audits establish "is the thing we want to build already there in some form?" — required by always-applied rule "ensure a lack of redundant / duplicate code".

| Audit ID | Question | Files to inspect | Output |
|---|---|---|---|
| C-01 | Does `ColorInput` support swatches, alpha, hex entry, eyedropper? | `assets/js/shared/components/input/ColorInput.js` | Feature gap list for X-006 |
| C-02 | Is there a `PaletteSelect` component? Or only `PalettePreview` (output)? | `components/output/PalettePreview.js`, `components/input/Select.js`, palette source files | Decision: extend or create new |
| C-03 | Does any component handle equation rendering as overlay (vs `EquationEditor` for input)? | `components/input/EquationEditor.js`, all `components/output/` | Decision: extend or create new for X-008 |
| C-04 | Is there a typography helper (font registry, fallback, weight-axis)? | `assets/js/shared/`, `assets/css/styles.css` | Decision: build new for X-009 |
| C-05 | What noise types are exported from `algorithms/noise/`? Are they all wired through one selector anywhere? | `assets/js/shared/algorithms/noise/index.js` | Canonical list for X-010 |
| C-06 | Does `AudioOutput` support per-event triggers and export-pipeline integration? | `components/output/AudioOutput.js`, `components/output/AnimationExport.js` | Gap list for X-013 |
| C-07 | Is there a drag-handle/overlay primitive used anywhere (e.g. distort tool)? | `components/drawing/DrawCanvas.js`, `components/drawing/DrawMaskOverlay.js`, distort components | Decision: extend or create new for X-014 |
| C-08 | What HOST keybindings exist already? | `generative-tool-host.js` | Conflict check for X-001 |
| C-09 | What is the current orientation-flip lifecycle? What is destroyed and re-created? | `generative-tool-host.js` | Identify timeline destroy site for X-003 |
| C-10 | What does `colourway` look like in `parameter-builder.js` and how is it consumed? | `parameter-builder.js`, all `.gen.js` `canvas.background` reads | Schema design input for X-007 |
| C-11 | What does `script-registry.js` currently do? Is `hidden` already supported? | `script-registry.js`, `script-registry.json` (if exists) | Implementation surface for X-017 |

### 6.5 — Reference-comparison required (regression vs intended divergence)

User says several generators "vary from the original." Before fixing, document the diff.

| Generator | Diff source | Output document |
|---|---|---|
| `circles` | reference source + `circles/feature-parity.md` | gap list for CIR-04 (nested rotation) |
| `curtain-morph` | reference source + `curtain-morph/feature-parity.md` + git log of `curtain-morph.gen.js` | gap list for CUR-01, regression report for CUR-02 |
| `golden-grid` | reference source (look for original modulation channels) | gap list for GOL-04 |
| `defecated` | spec `defecated/description.md` + `temp/defecated-complete-spec.md` + reference source | gap list for DEF-01, DEF-02 |
| `quine` | reference + spec + git log | bleed-effect characterisation for QUI-02 |

### 6.6 — Acceptance-criteria definition (per row)

A row is not "fixed" until its acceptance check passes. P0 examples:

| Row | Acceptance |
|---|---|
| WIN-01 | At CANVAS = W×H, rendered canvas DOM = W×H, draw extents = W×H, no enforced aspect |
| QUI-04 | Same as WIN-01 |
| MOI-01 | Same as WIN-01; moire field fills canvas |
| TIL-01/02 | For every preset: 0 background pixels visible, 0 tile overlap pixels (measured on 1024² render) |
| CIR-03 | No segment from any circle endpoint to centre at any frame |
| CIR-04 | Each layer's centre traces the parent layer's circumference (verifiable by tracking centre coords per frame) |
| CYM-01 | No frame-to-frame display swap that is not driven by an animation parameter (visual stability test over 60s) |
| ORD-03 | Average FPS ≥ 30 at 1024², no main-thread task > 50 ms |
| QUI-05 | Same FPS/task targets as ORD-03 |
| IFG-01 | Resize during animation produces no console error and no visual glitch lasting > 1 frame |
| IFG-02 | Worker present and active during draw |
| SOL-06 | Click on each planet returns `{name, distance, angle, velocity}` tooltip |
| DEF-03 | All rendered pixels within canvas rect (no overshoot) |

### 6.7 — Regression-scope audits

Cross-cutting fixes can break per-gen behaviour. Before merging X-NNN, verify:

| Cross-cutting | Regression check |
|---|---|
| X-004 | Render every generator at 4 canvas sizes (per §6.3 matrix); visual diff vs current |
| X-007 | Every generator that currently uses `canvas.background` still renders correctly with new schema |
| X-006 | Every generator's colour controls produce identical output to current (post-replacement) |
| X-001 | Spacebar in any input field does NOT trigger play/stop |
| X-003 | Orientation flip preserves: timeline state, current frame, animation playing/paused state |
| X-011 | Worker offload does not change rendered output (visual diff) |
| X-017 | Hidden generators not enumerated in selector but accessible via direct URL (decision Q3 dependent) |

### 6.8 — User-intent capture (for ambiguous Clauses)

Some Clauses cannot be implemented without a user decision. Surfaced in §9.

---

## 7 — Component / algorithm gaps to confirm

Cross-references §6.4 audits. Before starting any X-NNN, the matching `C-NN` audit must complete.

| Need | Existing | Audit | Action |
|---|---|---|---|
| Colour picker | `ColorInput.js` | C-01 | Extend if gap; mandate via X-006 |
| Palette selector | `PalettePreview.js` (output only) | C-02 | Likely new `PaletteSelect` |
| Noise selector | none | C-05 | Build `NoiseTypeSelect` (X-010) |
| Equation overlay | `EquationEditor.js` (input only) | C-03 | Build `OverlayText` (X-008) |
| Easing curve | none | — | Build `EasingCurveInput` (X-012) |
| Sound output | `AudioOutput.js` | C-06 | Extend; integrate with `AnimationExport.js` (X-013) |
| Drag overlay | `DrawCanvas.js`, distort components | C-07 | Extend or build `EmitterHandles` (X-014) |
| Typography | none central | C-04 | Build `TypographyHelper` (X-009) |
| Animate-param control | not formalised | — | Build `AnimateParamControl` (X-002) |

---

## 8 — Sequencing

Strict dependency order. Each phase blocks the next.

### Phase A — Audits and baselines (no code changes)

A1. Run §6.4 audits C-01..C-11 → gap reports for X-NNN.
A2. Run §6.3 baseline harness → perf snapshot for §6.6 acceptance.
A3. Run §6.5 reference comparisons → diff documents for CIR-04, CUR-01, GOL-04, DEF-01/02, QUI-02.
A4. Reproduce all P0 rows (§6.1) → confirm or downgrade.
A5. Resolve §9 user decisions.

### Phase B — Cross-cutting foundations

In order:
1. X-004 + X-005 — canvas-size honour.
2. X-001 — spacebar.
3. X-003 — orientation re-mount.
4. X-006 — `ColorInput` mandate.
5. X-007 — `colourway[]` schema.
6. X-002 — animate-param controls.
7. X-010 — `NoiseTypeSelect`.
8. X-017 — hidden flag.

### Phase C — P0 generator-specific (post-Phase B)

CYM-01, TIL-01/02, CIR-03, CIR-04, IFG-01, SOL-06, DEF-03, ORD-03, MOI-01 (verify), QUI-04 (verify), QUI-05, WIN-01 (verify), WIN-02, IFG-02.

### Phase D — Architecture mergers

WIN-03, WIN-06 — wave-interference family unification.
IFG-04 — animate tab addition.

### Phase E — Worker compliance reopen

X-011 audit drives reopen of `issues.md` PERF-003..015. New rows for any failed worker check.

### Phase F — Net-new components

X-008 OverlayText, X-009 typography, X-012 easing, X-013 sound, X-014 emitter handles.

### Phase G — Per-gen feature work

Remaining P1/P2 rows by generator.

### Phase H — Closeout

Re-run §6.6 acceptance for every fixed row. Promote fixed rows in `issues.md` to `FIXED`.

---

## 9 — Open decisions for user

Cannot proceed without direction.

1. **ORD-01 default viewport mode** — all-FIT on load, or restore previous? Pick one.
2. **X-002 modulator scope** — single LFO per param, or shared modulator graph (LFO + envelope + sample-and-hold) usable across params?
3. **GPA-01 / UNI-01 archive method** — `_archive/` directory move, or in-place `hidden: true` flag in registry?
4. **WIN-03 / WIN-06 merger naming** — single new generator name (e.g. `wave-field`) or keep `wave-interference` and delete the others?
5. **TIL-03 depth** — confirm canvas drop-shadow is permitted (treat as canvas output, not UI). Cross-check `design-law.md §6` and `border-system.md`.
6. **SOL-07 dataset scope** — confirm minimum count of reference events per time scale ("a few dozen" → ~30?) and source of authoritative dates.
7. **DEF-01 font roster** — source of 50+ fonts: Google Fonts subset, system stack, or self-hosted? Affects loading + offline.
8. **§6.3 perf targets** — confirm or revise: 30 FPS @ 1920×1080, no task > 50 ms, < 100 MB/60s heap delta.
9. **SOL-05 viewer-position representation** — current marker style is being rejected; what is the intended representation?
10. **X-007 `colourway[]` schema** — is per-element colour stored as a flat object (`{layer1: '#fff', layer2: '#000'}`) or array indexed by layer-id (`[{id: 'layer1', colour: '#fff'}, …]`)?

---

## 10 — Promotion to `issues.md`

On approval of §8 sequencing and §9 decisions:

1. Append §3 rows to `issues.md` under appropriate type sections, allocating IDs from current max:
   - GEN-031 onward
   - UI: first new entries (currently empty)
   - VIEW: first new entries (currently empty)
   - PERF: PERF-016 onward
   - ARCH: ARCH-034 onward
   - EXP: EXP-004 onward
   - new section if needed: COMP, FEAT, HOST, X-cross-cutting (decision required)
2. Reopen contradicted `WONTFIX`/`SKIPPED` rows:
   - PERF-009 (order-disorder) — contradicted by ORD-03
   - PERF-003 (moire) — likely contradicted by MOI-01 root cause
   - PERF-004 (p5-wave-interference) — contradicted by WIN-02
   - GEN-009 (moire) — contradicted by MOI-04
   - GEN-012 (p5-wave-interference) — re-evaluate post-merger (WIN-03)
3. Cross-link this file from `issues.md` Notes section.
4. Move this file to `issues-archive-2026-04-28.md` once all rows are promoted.
