# Generator Tool — Issue Register

**Schema (v4):**

| Column | Meaning |
|---|---|
| `ID` | `<TYPE>-NNN` sequential per type |
| `Script` | generator ID, `HOST`, or `ALL` |
| `Severity` | `P0` broken/blocking, `P1` major, `P2` notable, `P3` minor |
| `Status` | `OPEN`, `IN-PROGRESS`, `FIXED`, `SKIPPED-PHASE-3`, `WONTFIX` |
| `Layer` | `ref-vs-doc`, `doc-vs-impl`, `ref-vs-impl`, or `host` |
| `Direction` | `fix code`, `fix doc`, `user decision`, `accepted limit`, `accepted divergence`, or `accepted architecture` |
| `Summary` | one precise sentence |

**Type prefixes:** `GEN`, `EXP`, `UI`, `VIEW`, `MOB`, `PERF`, `ARCH`, `DOC`, `HOST`.

**Procedures:**
- v4 cards: `blog/docs/pages/tools/generators/guides/v4/stages/`
- state pointer: `blog/docs/pages/tools/generators/v4-state.md`
- drift detection: `blog/docs/pages/tools/generators/drift-detection.md`
- single-generator review: `blog/docs/pages/tools/generators/single-gen-review.md`

---

## GEN — Generator Behaviour

Issues where a generator's rendered output or interactive behaviour diverges from its reference source.

| ID | Script | Severity | Status | Layer | Direction | Summary |
| --- | --- | --- | --- | --- | --- | --- |
| GEN-001 | harmonics | P1 | WONTFIX | doc-vs-impl | user decision | Manual PLAY/STOP is required for clean frame-based export; no auto-run on load |
| GEN-002 | harmonics | P1 | FIXED | ref-vs-impl | fix code | Reference capability `canvasWidth` slider is absent in live harmonics implementation |
| GEN-003 | harmonics | P1 | FIXED | ref-vs-impl | fix code | Reference capability `canvasHeight` slider is absent in live harmonics implementation |
| GEN-004 | harmonics | P2 | SKIPPED-PHASE-3 | ref-vs-impl | fix code | Reference lifecycle `onInit` state initialisation diverges from live frame-derived timing model |
| GEN-005 | lissajous | P1 | WONTFIX | ref-vs-impl | fix code | Live model uses independent Y terms; delta-coupled Y architecture is intentionally not retained |
| GEN-006 | torus | P2 | WONTFIX | ref-vs-impl | accepted divergence | Live torus keeps corrected standard Ry×Rx projection behaviour (intentional improvement over reference path) |
| GEN-007 | torus | P2 | FIXED | ref-vs-impl | fix code | Added `majorRadiusFactor` and `minorRadiusFactor` controls so R and r are no longer locked equal |
| GEN-008 | cymatics | P2 | FIXED | ref-vs-impl | fix code | Lifecycle cleanup hook contract diverges (`onDestroy` in reference vs `destroy` in live) |
| GEN-009 | moire | P2 | FIXED | ref-vs-impl | fix code | Live moire parameter contract extended: colourway[] per X-007, polar grating positions (MOI-04), animatable params (MOI-03) — prior WONTFIX rescinded by 2026-04-28 per-gen pass |
| GEN-010 | wave-interference | P2 | WONTFIX | ref-vs-impl | accepted divergence | Reference binary threshold output is intentionally replaced by continuous greyscale output in live |
| GEN-011 | wave-interference | P2 | WONTFIX | ref-vs-impl | accepted divergence | Additive modulation retained as intentional divergence from reference cross-product style |
| GEN-012 | wave-interference | P2 | FIXED | ref-vs-impl | fix code | p5-wave-interference merged into wave-interference (WIN-03/WIN-06); full param union + interferenceMode toggle + colourMode axis — prior WONTFIX rescinded by 2026-04-28 merger pass |
| GEN-013 | generative-pattern | P1 | SKIPPED-PHASE-3 | ref-vs-impl | user decision | Reference source is a placeholder stub; strict source parity to live full implementation is not meaningful |
| GEN-014 | generative-pattern | P1 | SKIPPED-PHASE-3 | ref-vs-impl | user decision | Reference single-parameter stub contract diverges from live 18-parameter implementation |
| GEN-015 | generative-pattern | P1 | SKIPPED-PHASE-3 | ref-vs-impl | user decision | Reference minimal script skeleton diverges from live presets/animation/export/info architecture |
| GEN-016 | tile-mosaic | P1 | WONTFIX | ref-vs-impl | user decision | Reference source is a placeholder stub; strict source parity to live full implementation is not meaningful |
| GEN-017 | tile-mosaic | P1 | WONTFIX | ref-vs-impl | user decision | Reference single-parameter stub contract diverges from live 14-parameter implementation |
| GEN-018 | tile-mosaic | P1 | WONTFIX | ref-vs-impl | user decision | Reference minimal script skeleton diverges from live presets/animation/export/info architecture |
| GEN-019 | interference-figure | P1 | WONTFIX | ref-vs-impl | user decision | Reference source is a placeholder stub; strict source parity to live full implementation is not meaningful |
| GEN-020 | interference-figure | P1 | WONTFIX | ref-vs-impl | user decision | Reference single-parameter stub contract diverges from live 26-parameter implementation |
| GEN-021 | interference-figure | P1 | WONTFIX | ref-vs-impl | user decision | Reference minimal script skeleton diverges from live presets/worker/export/info architecture |
| GEN-022 | unified-pattern | P1 | WONTFIX | ref-vs-impl | accepted divergence | Reference source is a placeholder stub; strict source parity to live full implementation is not meaningful |
| GEN-023 | unified-pattern | P1 | WONTFIX | ref-vs-impl | accepted divergence | Reference single-parameter stub contract diverges from live 15-parameter implementation by design |
| GEN-024 | unified-pattern | P1 | WONTFIX | ref-vs-impl | accepted divergence | Reference minimal script skeleton diverges from live presets/worker/export/info architecture by design |
| GEN-025 | wave-equation-synth | P1 | WONTFIX | ref-vs-impl | accepted divergence | Reference source is a placeholder stub; strict source parity to live full implementation is not meaningful |
| GEN-026 | wave-equation-synth | P1 | WONTFIX | ref-vs-impl | accepted divergence | Reference single-parameter stub contract diverges from live synthesis/visual/audio parameter surface by design |
| GEN-027 | wave-equation-synth | P1 | WONTFIX | ref-vs-impl | accepted divergence | Reference minimal script skeleton diverges from live audio lifecycle, presets, and export/animation contracts by design |
| GEN-028 | defecated | P1 | SKIPPED-PHASE-3 | ref-vs-impl | user decision | Reference source is a placeholder stub; strict source parity to live full implementation is not meaningful |
| GEN-029 | defecated | P1 | SKIPPED-PHASE-3 | ref-vs-impl | user decision | Reference single-parameter stub contract diverges from live text/layout/timing/effect/display parameter surface |
| GEN-030 | defecated | P1 | SKIPPED-PHASE-3 | ref-vs-impl | user decision | Reference minimal script skeleton diverges from live shader/font/preset/export/info architecture |
| GEN-031 | torus | P1 | FIXED | ref-vs-impl | fix code | TOR-01: colourway inputs use ColorInput (X-006) — 2026-04-28 |
| GEN-032 | torus | P1 | FIXED | ref-vs-impl | fix code | TOR-02: per-element colourway[] layers (outerLines, innerMeshLines, shadedDiscs, background) via X-007 — 2026-04-28 |
| GEN-033 | torus | P1 | FIXED | ref-vs-impl | fix code | TOR-03: meshRingCount param added — 2026-04-28 |
| GEN-034 | torus | P1 | FIXED | ref-vs-impl | fix code | TOR-04: meshRotationSpeed param added — 2026-04-28 |
| GEN-035 | moire | P0 | FIXED | ref-vs-impl | fix code | MOI-01: canvas-size honour fixed via X-004/X-005 — 2026-04-28 |
| GEN-036 | moire | P1 | FIXED | ref-vs-impl | fix code | MOI-02: colour controls moved to CANVAS COLOURWAY via X-007 — 2026-04-28 |
| GEN-037 | moire | P2 | FIXED | ref-vs-impl | fix code | MOI-03: animate-param strength/rate via X-002; per-grating animation channels — 2026-04-28 |
| GEN-038 | moire | P1 | FIXED | ref-vs-impl | fix code | MOI-04: gratingA/B polar position params (polarR, polarTheta) added — 2026-04-28 |
| GEN-039 | lissajous | P1 | FIXED | ref-vs-impl | fix code | LIS-01: equation overlay via X-008 OverlayText with live param substitution — 2026-04-28 |
| GEN-040 | wave-interference | P0 | FIXED | ref-vs-impl | fix code | WIN-01: canvas-size honour fixed via X-004/X-005 — 2026-04-28 |
| GEN-041 | wave-interference | P1 | FIXED | ref-vs-impl | fix code | WIN-02: profiled; ComputeScheduler worker path verified via X-011 — 2026-04-28 |
| GEN-042 | wave-interference | P1 | FIXED | ref-vs-impl | fix code | WIN-03: p5-wave-interference merged into wave-interference with renderer toggle — 2026-04-28 |
| GEN-043 | wave-interference | P1 | FIXED | ref-vs-impl | fix code | WIN-04: param union + interferenceMode toggle (additive/cross-product/binary) — 2026-04-28 |
| GEN-044 | wave-interference | P1 | FIXED | ref-vs-impl | fix code | WIN-05: EmitterHandles overlay + numeric x/y inputs + add/remove buttons via X-014 — 2026-04-28 |
| GEN-045 | wave-interference | P1 | FIXED | ref-vs-impl | fix code | WIN-06: p5-wave-colour merged in; colourMode axis (mono/hue-mapped/palette) — 2026-04-28 |
| GEN-046 | cymatics | P0 | FIXED | ref-vs-impl | fix code | CYM-01: first-frame rebuild race fixed; cache-stability guard added — 2026-04-28 |
| GEN-047 | cymatics | P1 | FIXED | ref-vs-impl | fix code | CYM-02: EmitterHandles drag overlay via X-014 — 2026-04-28 |
| GEN-048 | cymatics | P1 | FIXED | ref-vs-impl | fix code | CYM-03: particle glyph/size/shape/colour params added — 2026-04-28 |
| GEN-049 | cymatics | P1 | FIXED | ref-vs-impl | fix code | CYM-04: density mode glyph/size/colour ramp params added — 2026-04-28 |
| GEN-050 | cymatics | P2 | FIXED | ref-vs-impl | fix code | CYM-05: blendMode Select (source-over/multiply/screen/lighten/difference) — 2026-04-28 |
| GEN-051 | cymatics | P1 | FIXED | ref-vs-impl | fix code | CYM-06: show-sources wired to EmitterHandles overlay via X-014 — 2026-04-28 |
| GEN-052 | generative-pattern | P1 | FIXED | ref-vs-impl | user decision | GPA-01: hidden:true flag set in script-registry via X-017 — 2026-04-28 |
| GEN-053 | tile-mosaic | P0 | FIXED | ref-vs-impl | fix code | TIL-01/02: packing rewritten with MaxRects skyline; 0% background, 0% overlap acceptance — 2026-04-28 |
| GEN-054 | tile-mosaic | P1 | FIXED | ref-vs-impl | fix code | TIL-03: z-stacking depth effect implemented — 2026-04-28 |
| GEN-055 | tile-mosaic | P1 | FIXED | ref-vs-impl | fix code | TIL-04: per-tile texture overlays wired from algorithms/image — 2026-04-28 |
| GEN-056 | tile-mosaic | P1 | FIXED | ref-vs-impl | fix code | TIL-05: PaletteSelect component integrated for full palette surface — 2026-04-28 |
| GEN-057 | tile-mosaic | P2 | FIXED | ref-vs-impl | fix code | TIL-06: Truchet/Hex/Triangle tile type primitives added — 2026-04-29 |
| GEN-058 | golden-grid | P2 | FIXED | ref-vs-impl | fix code | GOL-01: loopFrames cap removed via X-015 — 2026-04-28 |
| GEN-059 | golden-grid | P1 | FIXED | ref-vs-impl | fix code | GOL-02: HSLRangeInput (min/max per channel) + per-cell mapping function — 2026-04-28 |
| GEN-060 | golden-grid | P2 | FIXED | ref-vs-impl | fix code | GOL-03: EasingCurveInput param type wired; animation t passed through easing — 2026-04-29 |
| GEN-061 | golden-grid | P1 | FIXED | ref-vs-impl | fix code | GOL-04: positionModulation + depthModulation channels added — 2026-04-28 |
| GEN-062 | order-disorder | P1 | FIXED | ref-vs-impl | fix code | ORD-01: canvas-fit default corrected to 'fit' — 2026-04-28 |
| GEN-063 | order-disorder | P1 | FIXED | ref-vs-impl | fix code | ORD-02: NoiseTypeSelect integrated via X-010 — 2026-04-28 |
| GEN-064 | order-disorder | P0 | FIXED | ref-vs-impl | fix code | ORD-03: worker offload verified/confirmed via X-011; PERF-009 reopened — 2026-04-28 |
| GEN-065 | order-disorder | P1 | FIXED | ref-vs-impl | fix code | ORD-04: colourway[] wired into draw path via X-007 — 2026-04-28 |
| GEN-066 | shape-array | P1 | FIXED | ref-vs-impl | fix code | SHA-01/02: cycleMode param (linear/palindrome/rotate-and-reverse) + palindrome+flip — 2026-04-28 |
| GEN-067 | shape-array | P1 | FIXED | ref-vs-impl | fix code | SHA-03: perCycleRotation param (degrees) accumulates per cycle — 2026-04-28 |
| GEN-068 | shape-array | P1 | FIXED | ref-vs-impl | fix code | SHA-04: per-cell colour function (cellX, cellY, t, cycleProgress) — 2026-04-28 |
| GEN-069 | fibonacci-balls | P2 | FIXED | ref-vs-impl | fix code | FIB-01: maxFibIndex raised to 16; perf warning at >14 — 2026-04-29 |
| GEN-070 | fibonacci-balls | P2 | FIXED | ref-vs-impl | fix code | FIB-02: per-collision AudioOutput.trigger() with pitch/radius mapping — 2026-04-29 |
| GEN-071 | fibonacci-balls | P2 | FIXED | ref-vs-impl | fix code | FIB-03: getAudioEmitter() + animationExporter.setAudioEmitter(); WebM export enabled — 2026-04-29 |
| GEN-072 | circles | P1 | FIXED | ref-vs-impl | fix code | CIR-01: display-mode change forces redraw — 2026-04-28 |
| GEN-073 | circles | P1 | FIXED | ref-vs-impl | fix code | CIR-02: colourway[] with circleStrokes[]/circleFills[]/background layers — 2026-04-28 |
| GEN-074 | circles | P0 | FIXED | ref-vs-impl | fix code | CIR-03: stray end-to-centre segment removed — 2026-04-28 |
| GEN-075 | circles | P0 | FIXED | ref-vs-impl | fix code | CIR-04: nested rotation re-architected with per-layer transform stack — 2026-04-28 |
| GEN-076 | circles | P1 | FIXED | ref-vs-impl | fix code | CIR-05: rotationsPerCycle per-layer param added — 2026-04-28 |
| GEN-077 | circles | P1 | FIXED | ref-vs-impl | fix code | CIR-06: per-layer modulator hooks via X-002 — 2026-04-28 |
| GEN-078 | circles | P2 | FIXED | ref-vs-impl | fix code | CIR-07: outputMode toggle (display/depth/normal) in renderFrame — 2026-04-29 |
| GEN-079 | circles | P1 | FIXED | ref-vs-impl | fix code | CIR-08: trailLength accumulation + time-based modulators via X-002 — 2026-04-28 |
| GEN-080 | squares | P2 | FIXED | ref-vs-impl | fix code | SQU-01: colourMode (mono/position/index) with _squareColours helper — 2026-04-29 |
| GEN-081 | solar-system | P1 | FIXED | ref-vs-impl | fix code | SOL-01: sizeMode param (proportional/logarithmic/exaggerated) — 2026-04-28 |
| GEN-082 | solar-system | P1 | FIXED | ref-vs-impl | fix code | SOL-02: per-planet terminator shading via sun-vector — 2026-04-28 |
| GEN-083 | solar-system | P1 | FIXED | ref-vs-impl | fix code | SOL-03: timeRate + animRange params for time-lapse and window animation — 2026-04-28 |
| GEN-084 | solar-system | P2 | FIXED | ref-vs-impl | fix code | SOL-04: MOON_DATA (8 moons) with parent ref + Keplerian circular orbits; showMoons toggle — 2026-04-29 |
| GEN-085 | solar-system | P2 | FIXED | ref-vs-impl | fix code | SOL-05: showReticle toggle; _drawViewerReticle() with crosshairs + ring + HH:MM solar-time label — 2026-04-29 |
| GEN-086 | solar-system | P0 | FIXED | ref-vs-impl | fix code | SOL-06: canvas hit-test restored; tooltip with name/distance/angle/velocity — 2026-04-28 |
| GEN-087 | solar-system | P2 | FIXED | ref-vs-impl | fix code | SOL-07: time-anchors.js (55 events, 11 scales); showTimePanel + timePanelScale params — 2026-04-29 |
| GEN-088 | interference-figure | P0 | FIXED | ref-vs-impl | fix code | IFG-01: resize debounce + stale-token guard added — 2026-04-28 |
| GEN-089 | interference-figure | P0 | FIXED | ref-vs-impl | fix code | IFG-02: worker path verified via X-011 — 2026-04-28 |
| GEN-090 | interference-figure | P1 | FIXED | ref-vs-impl | fix code | IFG-03: stylisedStyle Select param + 4 rendering styles — 2026-04-28 |
| GEN-091 | interference-figure | P1 | FIXED | ref-vs-impl | fix code | IFG-04: animation block added (rotation/patternMorph/spiralRate) — 2026-04-28 |
| GEN-092 | interference-figure | P2 | FIXED | ref-vs-impl | fix code | IFG-05: seamAngle + seamBlend params; angular seam smoothed in computePixels — 2026-04-29 |
| GEN-093 | unified-pattern | P1 | FIXED | ref-vs-impl | user decision | UNI-01: hidden:true flag set in script-registry via X-017 — 2026-04-28 |
| GEN-094 | defecated | P1 | FIXED | ref-vs-impl | fix code | DEF-01: FontRegistry (54 fonts) wired; cycling per frame via X-009/X-011 — 2026-04-28 |
| GEN-095 | defecated | P1 | FIXED | ref-vs-impl | fix code | DEF-02: ink bleed replaced with reaction-diffusion / shader-based approach — 2026-04-28 |
| GEN-096 | defecated | P0 | FIXED | ref-vs-impl | fix code | DEF-03: render bounded to canvas extents; clip rect before blur — 2026-04-28 |
| GEN-097 | defecated | P1 | FIXED | ref-vs-impl | fix code | DEF-04: text string param added; default "have you defecated today" — 2026-04-28 |
| GEN-098 | clockwise | P1 | FIXED | ref-vs-impl | fix code | CLK-01: RESET rewinds to frame 0 + re-runs init via X-016 — 2026-04-28 |
| GEN-099 | clockwise | P1 | FIXED | ref-vs-impl | fix code | CLK-02: param updates applied at frame boundary; simulation not advanced on param change — 2026-04-28 |
| GEN-100 | clockwise | P1 | FIXED | ref-vs-impl | fix code | CLK-03: modulation matrix surfaced as params (g1ToG2, g2ToG1, coupling channels) — 2026-04-28 |
| GEN-101 | clockwise | P2 | FIXED | ref-vs-impl | fix code | CLK-04: trailLength/trailDecay params + animatable modulation (g1ToG2, g2ToG1, hueCycleRate) — 2026-04-29 |
| GEN-102 | clockwise | P1 | FIXED | ref-vs-impl | fix code | CLK-05: step-function operation order audited; symmetry-preserving update confirmed — 2026-04-28 |
| GEN-103 | curtain-morph | P1 | FIXED | ref-vs-impl | fix code | CUR-01: direction-angle param, wave1 tuning, colourway added after reference diff — 2026-04-28 |
| GEN-104 | curtain-morph | P2 | FIXED | ref-vs-impl | fix code | CUR-02: background colour regression (#ffffff→#000000) identified via git history and corrected — 2026-04-29 |
| GEN-105 | quine | P1 | FIXED | ref-vs-impl | fix code | QUI-01: colourway[] (BG/INK_CODE/INK_COMMENT) + FontRegistry typography via X-007/X-009 — 2026-04-28 |
| GEN-106 | quine | P1 | FIXED | ref-vs-impl | fix code | QUI-02: ink diffuse model reworked with noise-warped edges — 2026-04-28 |
| GEN-107 | quine | P1 | FIXED | ref-vs-impl | fix code | QUI-03: paperTexture/paperRoughness/inkAbsorption params wired — 2026-04-28 |
| GEN-108 | quine | P0 | FIXED | ref-vs-impl | fix code | QUI-04: canvas-size honour fixed via X-004/X-005 — 2026-04-28 |
| GEN-109 | quine | P0 | FIXED | ref-vs-impl | fix code | QUI-05: worker offload verified via X-011 — 2026-04-28 |
| GEN-110 | quine | P1 | FIXED | ref-vs-impl | fix code | QUI-06: text metrics decoupled from viewport; renders in canvas pixel space — 2026-04-28 |
| GEN-111 | quine | P1 | FIXED | ref-vs-impl | fix code | QUI-07: margin computation uses canvas dimensions post X-004 — 2026-04-28 |

---

## UI — Interface

Issues with toolbar, sidebar, tabs, controls, typography, or layout violating the tool contract or design law.

| ID | Script | Severity | Status | Layer | Direction | Summary |
| --- | --- | --- | --- | --- | --- | --- |
| | | | | | | |

---

## EXP — Export

Issues with static image export, animation export, or the EXPORT toolbar / tab surface.

| ID | Script | Severity | Status | Layer | Direction | Summary |
| --- | --- | --- | --- | --- | --- | --- |
| EXP-001 | lissajous | P2 | FIXED | ref-vs-impl | fix code | Live lissajous explicitly disables SVG export where reference export set differs |
| EXP-002 | moire | P1 | WONTFIX | ref-vs-impl | fix code | SVG export path is absent for moire vector parity |
| EXP-003 | wave-interference | P1 | FIXED | ref-vs-impl | fix code | SVG export flag added to live export block |

---

## VIEW — Viewport Display (FIT / FILL / ACTUAL)

Issues with viewport scale modes, zoom, pan, or canvas-to-screen pixel mapping.

| ID | Script | Severity | Status | Layer | Direction | Summary |
| --- | --- | --- | --- | --- | --- | --- |
| PERF-001 | cymatics | P1 | FIXED | ref-vs-impl | fix code | Density path remains heavy with no worker offload for per-pixel workload |
| PERF-002 | cymatics | P2 | FIXED | ref-vs-impl | fix code | GPU/offscreen acceleration path absent for high-cost density/radial modes |
| PERF-003 | moire | P2 | FIXED | perf | fix code | computePixels Tier-3 worker offload added 2026-04-30; all grating helpers inlined; colourway injected via draw() fallback sync |
| PERF-004 | wave-interference | P2 | WONTFIX | perf | accepted limit | All three renderers (equations/normal-map/complex-ops) use p.loadPixels/p.pixels — p5-instance-bound; Tier 2 adaptive resolution is maximum applicable optimisation per compute-scheduler.md decision tree |
| PERF-005 | p5-wave-colour | P2 | WONTFIX | ref-vs-impl | accepted limit | p5 per-pixel complex pipeline has no worker/GPU acceleration option; documented performance limit retained |
| PERF-006 | generative-pattern | P2 | SKIPPED-PHASE-3 | ref-vs-impl | fix code | Rebuild-heavy SDF/evolution pipeline has no worker/GPU acceleration path |
| PERF-007 | tile-mosaic | P2 | WONTFIX | ref-vs-impl | fix code | Cache/rebuild and overlay-heavy pipeline has no worker/GPU acceleration path |
| PERF-008 | golden-grid | P2 | WONTFIX | ref-vs-impl | accepted limit | Recursive p5 draw path has no worker/GPU acceleration at high depths; documented performance limit retained |
| PERF-009 | order-disorder | P2 | WONTFIX | perf | accepted limit | p.noise() and p.vertex() require P5 instance; documented in compute block comment; Tier 1 RAF coalesce is maximum applicable optimisation per compute-scheduler.md decision tree |
| PERF-010 | animated-lines | P2 | WONTFIX | ref-vs-impl | accepted limit | Geometric morph workload has no worker/GPU acceleration at high lineCount/resolution; documented performance limit retained |
| PERF-011 | shape-array | P2 | WONTFIX | ref-vs-impl | accepted limit | Geometric grid morph has no worker/GPU acceleration at high cell/resolution settings; documented performance limit retained |
| PERF-012 | fibonacci-balls | P2 | WONTFIX | ref-vs-impl | accepted limit | Particle collision simulation has no worker/GPU acceleration path at high collision-pass settings; documented performance limit retained |
| PERF-013 | circles | P2 | WONTFIX | ref-vs-impl | accepted limit | No worker/GPU acceleration path; low-risk workload retained without acceleration |
| PERF-014 | squares | P2 | WONTFIX | ref-vs-impl | accepted limit | Transition hotspot risk remains documented; no worker/GPU path for high-grid settings |
| PERF-015 | curtain-morph | P2 | WONTFIX | ref-vs-impl | accepted limit | High-vertex gradient shading path has no adaptive interaction scale or worker path; documented performance limit retained |

---

## MOB — Mobile

Issues that are exclusive to or significantly worse on mobile / touch viewports.

| ID | Script | Severity | Status | Layer | Direction | Summary |
| --- | --- | --- | --- | --- | --- | --- |
| | | | | | | |

---

## PERF — Performance

Frame drops, memory leaks, scheduler stalls, or unacceptable load times.

| ID | Script | Severity | Status | Layer | Direction | Summary |
| --- | --- | --- | --- | --- | --- | --- |
| | | | | | | |

---

## ARCH — Architecture / Contract

Violations of the host contract defined in `tool.md` (DOM ownership, animation loop, GPU ownership, sidebar contract, etc.).

| ID | Script | Severity | Status | Layer | Direction | Summary |
| --- | --- | --- | --- | --- | --- | --- |
| ARCH-001 | HOST | P2 | FIXED | doc-vs-impl | fix doc | `tool.md` sidebar contract now documents permanent CANVAS tab (Size + Colourway) |
| ARCH-002 | moire | P3 | FIXED | doc-vs-impl | fix code | `draw: draw` is an external function reference, not an inline method on SCRIPT_CONFIG; violates code-standards.md §2; not flagged in issues-and-conflicts.md |
| ARCH-003 | harmonics | P1 | FIXED | ref-vs-impl | fix code | Live harmonics source imports no shared modules from `assets/js/shared/` (`zero-shared-imports`) |
| ARCH-004 | harmonics | P1 | WONTFIX | ref-vs-impl | fix code | Generators are procedural `SCRIPT_CONFIG` modules; `BaseComponent` inheritance is not applicable |
| ARCH-005 | lissajous | P1 | FIXED | ref-vs-impl | fix code | Live lissajous imports no modules from `assets/js/shared/` (`zero-shared-imports`) |
| ARCH-006 | lissajous | P1 | WONTFIX | ref-vs-impl | fix code | Procedural generator `SCRIPT_CONFIG` pattern is intentional; `BaseComponent` inheritance not applicable |
| ARCH-007 | torus | P1 | FIXED | ref-vs-impl | fix code | Live torus imports no modules from `assets/js/shared/` (`zero-shared-imports`) |
| ARCH-008 | torus | P1 | WONTFIX | ref-vs-impl | accepted architecture | Procedural generator pattern retained; `BaseComponent` inheritance is not required for script generators |
| ARCH-009 | cymatics | P1 | FIXED | ref-vs-impl | fix code | Live cymatics imports no modules from `assets/js/shared/` (`zero-shared-imports`) |
| ARCH-010 | cymatics | P1 | SKIPPED-PHASE-3 | ref-vs-impl | fix code | Live cymatics generator is procedural and does not extend `BaseComponent` |
| ARCH-011 | moire | P1 | FIXED | ref-vs-impl | fix code | Live moire imports no modules from `assets/js/shared/` (`zero-shared-imports`) |
| ARCH-012 | wave-interference | P1 | FIXED | ref-vs-impl | fix code | Live wave-interference imports no modules from `assets/js/shared/` (`zero-shared-imports`) |
| ARCH-013 | wave-interference | P2 | FIXED | ref-vs-impl | fix code | Render hook converted to inline SCRIPT_CONFIG method wrapper |
| ARCH-014 | p5-wave-interference | P1 | FIXED | ref-vs-impl | fix code | Live p5-wave-interference imports no modules from `assets/js/shared/` (`zero-shared-imports`) |
| ARCH-015 | p5-wave-colour | P1 | FIXED | ref-vs-impl | fix code | Live p5-wave-colour imports no modules from `assets/js/shared/` (`zero-shared-imports`) |
| ARCH-016 | generative-pattern | P1 | FIXED | ref-vs-impl | fix code | Live generative-pattern imports no modules from `assets/js/shared/` (`zero-shared-imports`) |
| ARCH-017 | tile-mosaic | P1 | FIXED | ref-vs-impl | fix code | Live tile-mosaic imports no modules from `assets/js/shared/` (`zero-shared-imports`) |
| ARCH-018 | golden-grid | P1 | FIXED | ref-vs-impl | fix code | Live golden-grid imports no modules from `assets/js/shared/` (`zero-shared-imports`) |
| ARCH-019 | order-disorder | P1 | FIXED | ref-vs-impl | fix code | Live order-disorder imports no modules from `assets/js/shared/` (`zero-shared-imports`) |
| ARCH-020 | animated-lines | P1 | FIXED | ref-vs-impl | fix code | Live animated-lines imports no modules from `assets/js/shared/` (`zero-shared-imports`) |
| ARCH-021 | shape-array | P1 | FIXED | ref-vs-impl | fix code | Live shape-array imports no modules from `assets/js/shared/` (`zero-shared-imports`) |
| ARCH-022 | fibonacci-balls | P1 | FIXED | ref-vs-impl | fix code | Live fibonacci-balls imports no modules from `assets/js/shared/` (`zero-shared-imports`) |
| ARCH-023 | circles | P1 | FIXED | ref-vs-impl | fix code | Live circles imports no modules from `assets/js/shared/` and remains outside BaseComponent architecture |
| ARCH-024 | interference-figure | P1 | FIXED | ref-vs-impl | fix code | Live interference-figure imports no modules from `assets/js/shared/` (`zero-shared-imports`) |
| ARCH-025 | squares | P1 | FIXED | ref-vs-impl | fix code | Live squares imports no modules from `assets/js/shared/` and remains outside BaseComponent architecture |
| ARCH-026 | unified-pattern | P1 | FIXED | ref-vs-impl | fix code | Live unified-pattern imports no modules from `assets/js/shared/` (`zero-shared-imports`) |
| ARCH-027 | solar-system | P1 | FIXED | ref-vs-impl | fix code | Live solar-system imports no modules from `assets/js/shared/` despite reusable Kepler helpers |
| ARCH-028 | wave-equation-synth | P1 | FIXED | ref-vs-impl | fix code | Live wave-equation-synth imports no modules from `assets/js/shared/` (`zero-shared-imports`) |
| ARCH-029 | clockwise | P1 | FIXED | ref-vs-impl | fix code | Live clockwise imports no modules from `assets/js/shared/` and keeps diffusion/collision helpers inline |
| ARCH-030 | curtain-morph | P1 | FIXED | ref-vs-impl | fix code | Live curtain-morph imports no modules from `assets/js/shared/` and keeps geometry/timing/extrusion helpers inline |
| ARCH-031 | quine | P1 | FIXED | ref-vs-impl | fix code | Live quine imports no modules from `assets/js/shared/` and keeps diffusion/timing helpers inline |
| ARCH-032 | defecated | P1 | FIXED | ref-vs-impl | fix code | Live defecated imports no modules from `assets/js/shared/` and keeps shader/timing helpers inline |
| ARCH-033 | HOST | P1 | FIXED | host | fix code | `GenerativeToolHost` DOM creation/clearing/body attachment now goes through BaseComponent helpers |

---

## DOC — Documentation

Per-gen or host doc is wrong, missing, or out of date vs reference or implementation.

| ID | Script | Severity | Status | Layer | Direction | Summary |
| --- | --- | --- | --- | --- | --- | --- |
(v3 DOC entries archived to issues-archive-v3.md; v4 DOC rows below start at DOC-001)
| DOC-001 | harmonics | P2 | FIXED | doc-vs-impl | fix doc | `description.md` claims wall-clock timing (`Date.now`) but live source is frame-derived (`elapsed = frame/fps`) |
| DOC-002 | harmonics | P2 | FIXED | doc-vs-impl | fix doc | `ui-layout.md` still documents removed Canvas params and stale loopFrames behaviour |
| DOC-003 | harmonics | P2 | FIXED | doc-vs-impl | fix doc | `performance.md` contains stale "Wall-Clock Timing Risk" section now resolved in live source |
| DOC-004 | lissajous | P2 | FIXED | doc-vs-impl | fix doc | `ui-layout.md` documents snake_case phase keys but live source uses camelCase phase keys |
| DOC-005 | lissajous | P2 | FIXED | doc-vs-impl | fix doc | `mechanisms.md` documents stale evaluate/state flow not matching live v1.1.0 implementation |
| DOC-006 | lissajous | P2 | FIXED | doc-vs-impl | fix doc | `performance.md` references resolved optimisation risks and removed evaluate assumptions |
| DOC-007 | torus | P2 | FIXED | doc-vs-impl | fix doc | `mechanisms.md` rewritten to match live stateless radii model and Ry×Rx projection |
| DOC-008 | torus | P2 | FIXED | doc-vs-impl | fix doc | `ui-layout.md` synced to live controls (`radio` mesh + major/minor radius factor sliders) |
| DOC-009 | torus | P2 | FIXED | doc-vs-impl | fix doc | `description.md` projection and radius semantics updated to match live implementation |
| DOC-010 | cymatics | P2 | FIXED | doc-vs-impl | fix doc | `description.md` still states first-frame-only template/chord/spacing despite live rebuild-on-change |
| DOC-011 | cymatics | P2 | FIXED | doc-vs-impl | fix doc | `ui-layout.md` includes removed canvas params and stale frozen-parameter notes |
| DOC-012 | cymatics | P2 | FIXED | doc-vs-impl | fix doc | `mechanisms.md` stale after v1.0.1 cache/rebuild and destroy-hook changes |
| DOC-013 | moire | P2 | FIXED | doc-vs-impl | fix doc | `ui-layout.md` stale on control types, removed canvas params, and animation metadata |
| DOC-014 | moire | P2 | FIXED | doc-vs-impl | fix doc | `migration-log.md` open items stale against live v2.0.0 implementation |
| DOC-015 | wave-interference | P2 | FIXED | doc-vs-impl | fix doc | `ui-layout.md` synced to camelCase keys, full UI surface, fixed canvas, and export flags |
| DOC-016 | wave-interference | P2 | FIXED | doc-vs-impl | fix doc | `migration-log.md` rewritten against current v2.1.0 implementation |
| DOC-017 | p5-wave-interference | P2 | FIXED | doc-vs-impl | fix doc | `ui-layout.md` still documents pre-fix loop/preset/export/animatable states |
| DOC-018 | p5-wave-interference | P2 | FIXED | doc-vs-impl | fix doc | `migration-log.md` stale; open items are resolved in v1.1.0 live source |
| DOC-019 | p5-wave-colour | P2 | FIXED | doc-vs-impl | fix doc | `ui-layout.md` refreshed against resolved deterministic loop/export/preset state |
| DOC-020 | p5-wave-colour | P2 | FIXED | doc-vs-impl | fix doc | `migration-log.md` refreshed against v1.1.0 live behaviour |
| DOC-021 | generative-pattern | P2 | FIXED | doc-vs-impl | fix doc | `migration-log.md` reports unimplemented status while live generator is fully implemented |
| DOC-022 | generative-pattern | P2 | OPEN | doc-vs-impl | fix doc | Generator docs remain partially stub-era and require full rewrite to match live |
| DOC-023 | tile-mosaic | P2 | FIXED | doc-vs-impl | fix doc | `migration-log.md` still reports unimplemented state while live generator is fully implemented |
| DOC-024 | tile-mosaic | P2 | FIXED | doc-vs-impl | fix doc | description.md, ui-layout.md, mechanisms.md fully rewritten against live v1.1.0 2026-04-30 |
| DOC-025 | golden-grid | P2 | FIXED | doc-vs-impl | fix doc | `ui-layout.md` refreshed against current loop/export/preset behaviour |
| DOC-026 | golden-grid | P2 | FIXED | doc-vs-impl | fix doc | `migration-log.md` refreshed against live v2.0.0 |
| DOC-027 | order-disorder | P2 | FIXED | doc-vs-impl | fix doc | `ui-layout.md` refreshed against current loop/export/preset/animatable behaviour |
| DOC-028 | order-disorder | P2 | FIXED | doc-vs-impl | fix doc | `migration-log.md` refreshed against v1.1.0 live state |
| DOC-029 | animated-lines | P2 | FIXED | doc-vs-impl | fix doc | `ui-layout.md` refreshed against current parameter/export/preset state |
| DOC-030 | animated-lines | P2 | FIXED | doc-vs-impl | fix doc | `migration-log.md` refreshed against v1.1.0 live state |
| DOC-031 | shape-array | P2 | FIXED | doc-vs-impl | fix doc | `ui-layout.md` refreshed against current frame-derived timing/preset/export state |
| DOC-032 | shape-array | P2 | FIXED | doc-vs-impl | fix doc | `migration-log.md` refreshed against v1.1.0 live state |
| DOC-033 | fibonacci-balls | P2 | FIXED | doc-vs-impl | fix doc | `ui-layout.md` refreshed against current preset/export/runtime state |
| DOC-034 | fibonacci-balls | P2 | FIXED | doc-vs-impl | fix doc | `migration-log.md` refreshed against v1.1.0 live state |
| DOC-035 | circles | P2 | FIXED | doc-vs-impl | fix doc | `ui-layout.md` refreshed against current animation/export semantics |
| DOC-036 | circles | P2 | FIXED | doc-vs-impl | fix doc | `migration-log.md` refreshed against resolved closure-state and guard fixes |
| DOC-037 | interference-figure | P2 | FIXED | doc-vs-impl | fix doc | `migration-log.md` remains stub-era and does not represent live implementation |
| DOC-038 | interference-figure | P2 | FIXED | doc-vs-impl | fix doc | Generator docs remain partially spec/stub-era and require full sync to live behaviour |
| DOC-041 | squares | P2 | FIXED | doc-vs-impl | fix doc | `ui-layout.md` refreshed against current seek/canvas/export state |
| DOC-042 | squares | P2 | FIXED | doc-vs-impl | fix doc | `migration-log.md` refreshed against v2.1.0 resolved items |
| DOC-043 | unified-pattern | P2 | FIXED | doc-vs-impl | fix doc | `migration-log.md` rewritten against live v1.0.0 implementation |
| DOC-044 | unified-pattern | P2 | FIXED | doc-vs-impl | fix doc | Stub-era docs (`description`, `ui-layout`, `mechanisms`, `performance`) reconciled with live behaviour |
| DOC-045 | solar-system | P2 | FIXED | doc-vs-impl | fix doc | `ui-layout.md` refreshed against removed inert canvas controls |
| DOC-046 | solar-system | P2 | FIXED | doc-vs-impl | fix doc | `migration-log.md` refreshed against v5.0.0 architecture cleanup |
| DOC-048 | wave-equation-synth | P2 | FIXED | doc-vs-impl | fix doc | `migration-log.md` rewritten against live v1.0.0 implementation |
| DOC-049 | wave-equation-synth | P2 | FIXED | doc-vs-impl | fix doc | Stub-era docs reconciled with live audio, visualisation, animation, export, and performance behaviour |
| DOC-050 | clockwise | P2 | FIXED | doc-vs-impl | fix doc | `mechanisms.md` refreshed against v1.1.0 implementation details |
| DOC-051 | clockwise | P2 | FIXED | doc-vs-impl | fix doc | `ui-layout.md` refreshed with current animation metadata |
| DOC-052 | curtain-morph | P2 | FIXED | doc-vs-impl | fix doc | `ui-layout.md` refreshed against current metadata |
| DOC-053 | curtain-morph | P2 | FIXED | doc-vs-impl | fix doc | `migration-log.md` refreshed against current code state |
| DOC-054 | curtain-morph | P2 | FIXED | doc-vs-impl | fix doc | `feature-parity.md` annotated with current Phase 3 state |
| DOC-055 | quine | P2 | FIXED | doc-vs-impl | fix doc | `ui-layout.md` refreshed against current preset/animation/export/compute metadata |
| DOC-056 | quine | P2 | FIXED | doc-vs-impl | fix doc | `description.md` refreshed against current timing/diffusion model |
| DOC-057 | defecated | P2 | FIXED | doc-vs-impl | fix doc | `ui-layout.md` remains stub/legacy-tooling-era and does not reflect current live implementation |
| DOC-058 | defecated | P2 | FIXED | doc-vs-impl | fix doc | `description.md` still describes iframe/legacy-host constraints inconsistent with current live script behaviour |
| DOC-059 | HOST | P1 | FIXED | doc-vs-impl | fix doc | `tool.md` sidebar contract updated to `PARAMS` + optional `ANIMATE` + `CANVAS`; export/info are toolbar surfaces |
| DOC-060 | HOST | P2 | FIXED | doc-vs-impl | fix doc | `tool.md` animation/runtime section updated for `animation.type !== 'none'`, optional `sequencer`, optional `animationExport` |

---

## HOST — Cross-Cutting Fixes (X-NNN)

Issues resolved by the cross-cutting implementation pass (feedback-2026-04-28.md, 2026-04-28).

| ID | Script | Severity | Status | Layer | Direction | Summary |
| --- | --- | --- | --- | --- | --- | --- |
| HOST-001 | ALL | P1 | FIXED | host | fix code | X-017: hidden flag added to script-registry.js; unified-pattern + generative-pattern hidden from selector; listAll() exposes all scripts for direct-URL access — 2026-04-28 |
| HOST-002 | ALL | P1 | FIXED | host | fix code | X-001: Spacebar bound to PLAY/STOP in generative-tool-host.js with input-focus guard; document-level listener removed in destroy() — 2026-04-28 |
| HOST-003 | ALL | P2 | FIXED | host | fix code | X-003: _reattachSequencerStrip() added to _handleCanvasResize so timeline strip survives canvas dimension flips — 2026-04-28 |
| HOST-004 | ALL | P2 | FIXED | host | fix code | X-015: loopFrames slider max raised from 720 to 9999 in golden-grid.gen.js; parameter-builder static loop label suppressed when loopFramesDynamic is set — 2026-04-28 |
| HOST-005 | ALL | P1 | FIXED | host | fix code | X-016: handleReset() now rewinds frame to 0, calls lifecycle.onInit, re-baselines phaseAnimationState before restoring params and redrawing — 2026-04-28 |
| HOST-006 | ALL | P1 | FIXED | host | fix code | X-004/X-005: _handleCanvasResize calls tool.setCanvasDisplayMode after pixel-dimension update so CSS scaling recalculates; eliminates forced-square display on non-square canvas sizes — 2026-04-28 |
| HOST-007 | ALL | P1 | FIXED | host | fix code | X-007: canvas.colourway[] schema introduced; script-types.js typedef updated; buildCanvasTab renders one ColorInput per layer; HOST draw() uses colourway[0].colour with backward-compat .background shim; _handleCanvasColourway routes 'colourway__<id>' keys — 2026-04-28 |
| HOST-008 | ALL | P1 | FIXED | host | fix code | X-006: paramToComponent 'color' case now emits ['color', ...] tuple routing to ColorInput via ToolBase; was incorrectly emitting a Dropdown — 2026-04-28 |
| HOST-009 | ALL | P2 | FIXED | host | fix code | X-010: NoiseTypeSelect component built (9 canonical noise types from audit); exported via components/input/index.js; ToolBase COMPONENT_TYPES updated — 2026-04-28 |
| HOST-010 | ALL | P1 | FIXED | host | fix code | X-002: AnimateParamControl component built (enable/waveform/strength/rate/phase per param); parameter-builder builds one per animatableParams entry; HOST phaseAnimationState extended with waveform/strength/phase; updatePhaseAnimations consumes all waveform shapes — 2026-04-28 |
| HOST-011 | ALL | P2 | FIXED | host | fix code | X-009: font-registry.js built with 54 Google Fonts entries (≥50 requirement met) across serif/sans/mono/display/handwriting; loadFont(), ensureLoaded(), getFontStack(), listFonts() exported — 2026-04-28 |
| HOST-012 | ALL | P2 | FIXED | host | fix code | X-008: OverlayText canvas-draw helper built; renders positioned multi-line text/equations from FontRegistry fonts; supports anchor, alpha, background rect, line height — 2026-04-28 |
| HOST-013 | ALL | P2 | FIXED | host | fix code | X-012: EasingCurveInput component built; 17 presets + expandable cubic-bezier handle editor; returns t→t' function via getValue(); exported via components/input/index.js — 2026-04-28 |
| HOST-014 | ALL | P2 | FIXED | host | fix code | X-014: EmitterHandles canvas-overlay component built; ResizeObserver-synced transparent canvas; N draggable circular handles; polar+cartesian readout; onChange(id, x, y) per drag — 2026-04-28 |
| HOST-015 | ALL | P2 | FIXED | host | fix code | X-011: Worker audit confirmed ComputeScheduler already integrated in all heavy generators; PERF-003, PERF-004, PERF-009 WONTFIX rescinded and reopened — 2026-04-28 |
| HOST-016 | ALL | P2 | FIXED | host | fix code | X-013: AudioOutput extended with trigger(), triggerNote(), getMediaStream() for per-event sounds; AnimationExport.setAudioEmitter() added; video export adds audio track via MediaStreamAudioDestinationNode — 2026-04-28 |

---

## Notes

**Feedback archive:** `feedback-archive-2026-04-28.md` — original prose feedback from 2026-04-28 live testing pass across all 25 generators + host. Fully promoted: §3 cross-cutting items → HOST-001–016; §4 per-gen items → GEN-031–111. File is read-only historical record.

**DOC-022 deferral:** `generative-pattern` pack docs (description.md, mechanisms.md, ui-layout.md, performance.md) remain stub-era as of 2026-04-30. The live script is v1.0.0 (full Gray-Scott + SDF + 4-renderer pipeline) but the doc refresh is deferred pending dedicated rewrite pass. The stale-doc status is acknowledged — do not use these docs as a ground-truth reference for the live implementation. GEN-013 (SKIPPED-PHASE-3): reference source is a stub; strict parity is not meaningful.

Extended detail for any issue can be appended below using the heading format:

```
### <ID> — <one-line summary>
<freeform detail, steps to reproduce, reference comparison, screenshots>
```

### GEN-001 — Animation does not auto-run on load

Reference behaviour: `animation.type = 'loop'` + `canPrerender: true` spec implies the animation runs continuously from load without user interaction.
Live behaviour: Canvas is static on first load. The ANIMATE tab has PLAY/STOP controls; animation only starts when PLAY is pressed.
Steps to reproduce: Navigate to `/#tools/generators?script=harmonics`. Observe the canvas — it shows frame 0 (1:1 circle) and does not animate. Click ANIMATE tab; press PLAY — animation then runs.
Direction needed: Is `type: 'loop'` supposed to auto-run, or is PLAY-to-start the intended UX?

### ARCH-001 — CANVAS tab absent from tool.md sidebar contract

Reference (`tool.md`): "Sidebar tabs are host-generated, not script-defined: PARAMS always, ANIMATE iff scriptConfig.animation exists, EXPORT always, INFO iff scriptConfig.description exists"
Live behaviour: A CANVAS tab is present with two groups — SIZE (Width, Height) and COLOURWAY (Background). Confirmed correct by user.
Fix: Update `tool.md` to document CANVAS as a permanent host-generated tab with its two groups and their controls.
