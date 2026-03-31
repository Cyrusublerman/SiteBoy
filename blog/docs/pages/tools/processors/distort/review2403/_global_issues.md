# Distort Tool — Global Issues

Issues that affect all modules or the host system. Logged here rather than in per-module review files.

---

## G1. Driver (+D) Button Non-Functional

```
[ERROR] [BUG] Driver slot button does not open driver settings on click
Location: NodePanel — +D button on all param rows
Evidence: Clicking the +D button on any param in any module produces no response — the driver settings panel does not open.
Impact: The driver system is entirely inaccessible from the UI. No per-pixel modulation can be configured by users for any module or any param. All driveable params are effectively non-functional from a user perspective.
```

**Action:** Investigate NodePanel +D button event handler. Determine whether this is a wiring failure, a missing component, or a rendering issue with the driver settings panel.

**Discovered during:** GREYSCALE review (module 1/69). Affects all modules.

---

## G2. All Numeric Params Must Support Drivers

```
[WARN] [STANDARDS] All numeric (range) params across all modules should have driver (+D) slot support
Location: All *Node.js modules — any range param lacking driveable: true
Evidence: User requirement stated during LEVELS review (module 2/69): "I want all number based parameters for all modules to be able to work with a driver."
Impact: Any numeric param without driver support cannot be spatially varied per-pixel, limiting creative control.
```

**Action:** Audit all 69 modules for numeric params lacking `driveable: true`. Add `driveable: true` to all range-type params that do not already have it. Note: driver slot UI (+D button) is currently broken (see G1) — fix G1 first so driver functionality can be verified.

**Discovered during:** LEVELS review (module 2/69). Applies to all modules.

---

## G3. Future: ANALYSIS Module Category

```
[NOTE] [PARITY] A new ANALYSIS module category should be introduced for diagnostic/read-only nodes
Location: distort tool — CategoryPicker / module taxonomy
Evidence: HISTOGRAM EQ review (module 16/69) confirmed that a histogram is an analysis tool, not an effect. No current category or module type exists for read-only diagnostic overlays.
Impact: Analysis tools (histogram, waveform, vectorscope) cannot be represented in the current module taxonomy without misclassifying them as effects.
```

**Proposal:** Introduce an ANALYSIS category in the CategoryPicker. Modules of this type sit in the effect stack but do not transform pixel output — they render diagnostic overlays (e.g. histogram of tonal distribution, waveform, vectorscope). Requires a new module type contract distinct from pixel/vector effect nodes.

**Discovered during:** HISTOGRAM EQ review (module 16/69).

---

## G4. Consider Consolidating BLUR Modules into One Module with Modes

```
[NOTE] [STANDARDS] Six separate BLUR modules (boxblur, gaussblur, motionblur, radialblur, median, bilateral) could be consolidated into a single BLUR module with a MODE dropdown
Location: CategoryPicker — BLUR category
Evidence: User suggestion during GAUSS BLUR review (module 19/69). Each blur type is a mode of the same conceptual operation.
Impact: Reduces module proliferation; simplifies the CategoryPicker; allows shared param infrastructure (e.g. radius, passes).
```

**Proposal:** Single BLUR module with MODE dropdown: BOX / GAUSSIAN / MOTION / RADIAL / MEDIAN / BILATERAL. Params shown/hidden per mode. Performance caps set per mode.

**Note:** This is a suggestion for consideration — individual blur modules may be retained if the combined module becomes too complex or if per-mode param sets are too divergent.

**Discovered during:** GAUSS BLUR review (module 19/69).

---

## G5. Slider Component: Direct Number Input and Double-Click-to-Default

```
[WARN] [STANDARDS] Slider params lack direct numeric input and double-click-to-default behaviour
Location: NodePanel — all slider param rows across all modules
Evidence: User requirement stated during AFFINE review (module 26/69): sliders should accept typed numeric input directly, and double-clicking the number value should reset it to the param's default.
Impact: Precise value entry requires repeated dragging; no quick reset mechanism exists. Degrades usability across all slider params in all 69 modules.
```

**Action:** Modify the slider component to:
1. Allow direct numeric input by clicking/focusing the displayed value field.
2. Reset the param to its defined default on double-click of the value field.

**Discovered during:** AFFINE review (module 26/69). Applies to all modules with slider params.

---

## G6. Canvas Click-to-Pick for Centre Point Params

```
[NOTE] [PARITY] Modules with centre X/Y params should support click-to-pick on the viewport canvas
Location: NodePanel — centre X / centre Y params on radialblur, twirl, spherize, and any future module with a spatial origin point
Evidence: User requests during RADIAL BLUR (module 21/69) and TWIRL (module 35/69) reviews: set centre point by clicking a button then clicking directly on the canvas rather than adjusting numeric sliders.
Impact: Precise centre placement is slow and imprecise with sliders alone.
```

**Action:** Add a PICK CENTRE button to any module with centre X/Y params. Activating it enables a one-shot canvas click interaction that sets the centre coordinates. Affects: radialblur, twirl, spherize, lensbubbles, and any future module with a spatial origin.

**Discovered during:** RADIAL BLUR review (module 21/69), confirmed during TWIRL review (module 35/69).

---

## G7. Vector Modules Must Be Clearly Identifiable

```
[WARN] [STANDARDS] No visual indicator distinguishes vector-output modules from pixel-output modules in the CategoryPicker or NodePanel
Location: CategoryPicker — all vector modules (lumflow, serpentine, statichalftone, moduleflowlines, moduleserpentine, modulestaticlines)
Evidence: User noted during LUMFLOW review (module 38/69): vector capability is a significant differentiator but is not surfaced in the UI.
Impact: Users cannot tell which modules produce vector output without prior knowledge.
```

**Action:** Add a clear visual marker to vector-output modules in the CategoryPicker (e.g. a "V" badge or distinct icon). Consider also indicating vector capability in the NodePanel header.

**Discovered during:** LUMFLOW review (module 38/69).

---

## G9. Time/Iteration-Based Modules Must Expose a FRAME param

```
[WARN] [STANDARDS] Modules with time or iteration-based internal state must expose a FRAME (or TIME) param
Location: Any module with animation/iteration state — confirmed: serpentine, statichalftone, moduleflowlines, moduleserpentine, modulestaticlines; likely: lumflow, flowfield, advection
Evidence: User requirement stated during SERPENTINE review (module 39/69): a FRAME param is required to select which iteration/frame of the animation is shown as the static output. This param is what the animation system will later drive to produce motion.
Impact: Without a FRAME param, time-based modules are frozen at an arbitrary internal state with no user control. Animation cannot be driven without an explicit time/frame input.
```

**Action:** All time/iteration-based modules must expose a FRAME (integer or float) param. Default: 0 or 1. When the animation system is implemented, this param will be the driver target. Audit all affected modules and add the param.

**Discovered during:** SERPENTINE review (module 39/69).

---

## G11. Overlapping Feature Additions Must Use Shared Components

```
[WARN] [STANDARDS] Many feature additions identified across module reviews share identical UI and logic patterns — these must not be reimplemented per-module
Location: All modules — colour pickers, ramp stages, seed/noise controls, centre-point pickers, FRAME params, SVG export actions
Evidence: Identified during EDGE module reviews (modules 44–47): colour ramp (Sobel, Canny, Laplacian, DoG share identical MIN/MAX COLOUR + RAMP SOURCE + RAMP SPACE pattern); centre-point picker (radialblur, twirl, spherize, chromaticab, lensbubbles); FRAME param (all time-based modules); SVG export (all vector modules).
Impact: Reimplementing shared patterns per-module creates maintenance debt, inconsistency, and bloat.
```

**Action:** Before implementing any feature addition identified in these reviews:
1. Check whether the required UI component already exists in the component library.
2. If not, build it as a shared component first, then consume it in all applicable modules.
3. New components likely needed: ColourRampControl, CentrePointPicker, FrameSlider, SVGExportButton, NoiseSourceControl.

**Discovered during:** LAPLACIAN review (module 46/69).

---

## G12. Web Worker Usage Must Be Improved for Expensive Modules

```
[WARN] [PERFORMANCE] Multiple modules are unacceptably slow — root cause is insufficient use of web workers for heavy computation
Location: All expensive modules — bilateral (non-functional), boxblur, gaussblur, median, and any future high-cost module
Evidence: User observed significant slowness across multiple BLUR and EDGE modules during review. Bilateral blocks entirely. Box and Gaussian blur are slow despite being separable O(n) operations.
Impact: Poor interactivity across the tool; expensive operations block the main thread.
```

**Action:**
1. Audit which modules run computation on the main thread vs in a dedicated worker.
2. Move all pixel-processing apply() calls fully into the render worker.
3. Ensure expensive modules (bilateral, median, canny, reaction-diffusion, etc.) are fully offloaded and have appropriate previewMax caps to prevent worker timeout.
4. Consider a worker pool for parallelising multi-pass operations (e.g. separable blur H+V passes).

**Discovered during:** LAPLACIAN review (module 46/69). Applies to all computationally expensive modules.

---

## G14. Mode-Conditional Params Must Be Hidden When Not Applicable

```
[WARN] [STANDARDS] Parameters that only apply in a specific mode must not be visible when that mode is not active
Location: NodePanel — all modules with mode-conditional param sets (bandshift, laplacian, dog, canny, truchet, quantise, equalisation, and any future module with mode switching)
Evidence: User requirement stated during GRATING review (module 49/69). Consistent with standard UI practice.
Impact: Exposing inapplicable params clutters the UI, causes confusion, and creates opportunities for users to set values that have no effect.
```

**Action:** All modules with a MODE or TYPE dropdown must implement conditional param visibility — only show params relevant to the currently selected mode. Params for inactive modes must be hidden, not just disabled.

**Discovered during:** GRATING review (module 49/69). Applies to all mode-switching modules.

---

## G15. Audit: Modules with Extra Internal Blend Mode Param

```
[NOTE] [STANDARDS] Some modules expose an additional internal BLEND MODE param beyond the standard NodePanel compositing blend mode — audit required to determine scope and consistency
Location: All modules — audit needed
Evidence: User raised during MOIRÉ review (module 50/69): unclear how many modules have a second, module-level blend mode param in addition to the standard compositing blend mode.
Impact: If inconsistently implemented, some modules have more compositing flexibility than others with no principled basis.
```

**Action:** Audit all 69 modules for the presence of an extra internal blend mode param. Determine whether it is intentional (module-specific blending of internal layers) or accidental (duplicate of standard compositing). Standardise: either all modules expose it or none do, unless there is a documented per-module reason.

**Discovered during:** MOIRÉ review (module 50/69).

---

## G16. Slider/Number Inputs Must Display Units

```
[WARN] [STANDARDS] Numeric slider and number inputs must display the unit of measurement alongside the value
Location: NodePanel — all slider+number param rows across all modules
Evidence: User requirement stated during MOIRÉ review (module 50/69): values without units are ambiguous — e.g. a radius of 12 could be 12px, 12%, or 12° depending on context.
Impact: Users cannot determine the scale or meaning of numeric values without unit labels.
```

**Action:** Add unit labels to all numeric params. Units should be defined per-param in the module definition and rendered by the NodePanel slider component. Common units: px, %, °, frames, 0–1 (normalised). Unit display must not be truncated.

**Discovered during:** MOIRÉ review (module 50/69). Applies to all modules.

---

## G17. Halftone Pattern Module to Become Foundation of a Future Pattern-Library System

```
[NOTE] [STANDARDS] The Halftone Pattern module should be treated as the first member of a future pattern-library framework, not a finished single-purpose effect
Location: nodes/halftonepattern — architecture
Evidence: User requirement stated during HALFTONE PATTERN review (module 51/69): the module should evolve toward a framework built from three linked concepts: sample field, pattern primitive, and response mapping. This architecture allows many halftone/print-like pattern types to be supported without rewriting core logic.
Impact: If built as a single hardcoded dot effect, future pattern types require separate modules. If built as a framework, new primitives (line, square, ellipse, cross, shape fill, stochastic, CMYK rosette) can be added as pattern-type options.
```

**Action:** When rebuilding halftonepattern, use the three-part abstraction: (1) sample field (grid type), (2) pattern primitive (pattern type), (3) response mapping (response source + curve). Even if only DOT is implemented initially, the architecture must accommodate future types without structural change. Defer selecting the full pattern collection until the desired family is researched and defined.

**Discovered during:** HALFTONE PATTERN review (module 51/69).

---

## G18. GEOMETRIC Category — All Three Modules Flagged for Removal

```
[WARN] [STANDARDS] All three GEOMETRIC modules (voronoi, contour, sdfshape) are likely redundant and should be removed
Location: CategoryPicker — GEOMETRIC category
Evidence: User determination during TEXTURE review (module 61/69): none of the three GEOMETRIC modules have a justified standalone use. Voronoi functionality belongs in the MOSAIC/TESSELLATION module (delaunaymesh); contour and sdfshape functions are either duplicated elsewhere or insufficiently developed.
Impact: Three modules taking up CategoryPicker space with no clear creative value.
```

**Action:** Review voronoi, contour, and sdfshape individually — confirm REMOVE verdict for each. Voronoi topology is already planned as a mode within the MOSAIC module; if the standalone voronoi module adds nothing distinct, remove it. Flag during GEOMETRIC category review (modules 65–67/69).

**Discovered during:** TEXTURE review (module 61/69).


---

## G13. Blend Modes Are Incorrectly Implemented — Review Required

```
[ERROR] [BUG] Blend modes do not apply correctly — LIGHTEN and DARKEN appear to set luminosity rather than perform per-pixel max/min compositing
Location: Pipeline compositing stage — blend mode application for all modules
Evidence: User observed during LAPLACIAN review (module 46/69): LIGHTEN mode darkens dark areas (incorrect); DARKEN mode lightens light areas (incorrect). Behaviour suggests luminosity is being set rather than per-pixel max (LIGHTEN) or per-pixel min (DARKEN) being applied between source and module output.
Impact: All blend modes other than NORMAL may be producing incorrect output. Affects all 69 modules.
```

**Action:**
1. Audit the blend mode compositing implementation in the pipeline.
2. Verify each mode against standard compositing definitions:
   - LIGHTEN: `output = max(src, layer)` per channel
   - DARKEN: `output = min(src, layer)` per channel
   - MULTIPLY: `output = src * layer`
   - SCREEN: `output = 1 - (1-src)(1-layer)`
   - OVERLAY: standard overlay formula
   - etc.
3. Fix all incorrectly implemented modes.
4. Add a blend mode test page or visual regression check to verify correctness across all modes.

**Discovered during:** LAPLACIAN review (module 46/69). Affects all modules.

---

## G10. Vector Modules Must Include an In-Module SVG Export Action

```
[WARN] [STANDARDS] Vector-output modules must expose a dedicated SVG export action within the module UI
Location: NodePanel — all vector modules (lumflow, serpentine, statichalftone, moduleflowlines, moduleserpentine, modulestaticlines)
Evidence: User requirement stated during SERPENTINE review (module 39/69): each vector module should have its own export control to download the current frame as an SVG, not rely solely on a global export pipeline.
Impact: Vector output is inaccessible as SVG without a per-module export action.
```

**Action:** Add an EXPORT SVG button or action to the NodePanel for each vector-output module. Exports the current rendered vector frame as a valid SVG file.

**Discovered during:** SERPENTINE review (module 39/69).

---

## G8. LINE RENDER Category Should Not Be Split Into Two Sections

```
[WARN] [STANDARDS] LINE RENDER modules are listed as two separate inventory groups ("LINE RENDER" and "LINE RENDER MODULE") — should be a single category
Location: CategoryPicker — LINE RENDER category; inventory.md
Evidence: User noted during LUMFLOW review (module 38/69): having two separate LINE RENDER sections is confusing and unnecessary.
Impact: Related modules are fragmented across two categories; CategoryPicker is harder to navigate.
```

**Action:** Merge "LINE RENDER" and "LINE RENDER MODULE" into a single "LINE RENDER" category in the CategoryPicker and inventory.

**Discovered during:** LUMFLOW review (module 38/69).

---

## G19. Timeline Component Must Be Toggleable from the Canvas Tab

```
[WARN] [STANDARDS] The timeline component is not toggleable from the canvas tab — it must be
Location: Distort tool — canvas tab UI
Evidence: User requirement stated during end-of-review session (2026-03-31): the timeline panel must be openable and closable directly from the canvas tab without requiring navigation to another tab or panel.
Impact: Users working in the canvas tab cannot access or dismiss the timeline without breaking their canvas-focused workflow. Animation and frame-scrubbing tasks require immediate timeline access from the canvas context.
```

**Action:** Add a timeline toggle control accessible from the canvas tab. When toggled open, the timeline panel should appear within or adjacent to the canvas area without requiring a tab switch. When toggled closed, full canvas area is restored.

**Discovered during:** End-of-review session (2026-03-31).

---
