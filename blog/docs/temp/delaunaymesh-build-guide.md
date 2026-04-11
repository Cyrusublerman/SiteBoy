# DELAUNAYMESH — Build Guide

- module: delaunaymesh
- node: DelaunayMeshNode.js
- category: COMPOSITE
- review verdict: KEEP — rename to MOSAIC (or TESSELLATION); major architectural upgrade required
- rebuild severity: CRITICAL

---

## Current State Summary

Factory-pattern node (`createEffectModule`) with 4 params: `pointCount`, `wireWeight`, `wireLevel`, `colorMode`. Algorithm: Bowyer–Watson Delaunay triangulation over spatially uniform random points; FLAT mode fills each triangle with source colour sampled at centroid; WIRE mode strokes the triangular lattice over the source. Rendering via `OffscreenCanvas` 2D context. `forceWorkerPreview: true` declared. Preview cap: `pointCount` clamped to 100 via both `previewMax` and an explicit `ctx.quality` guard in `apply()`. `SeededRNG` driven by `ctx.nodeSeed ?? 42`. `wireLevel` declares `driveable: true` but `apply()` accepts no `modulate` argument — driver is non-functional.

The current implementation is a functional low-poly mosaic, but it is architecturally minimal: seed placement is spatially uniform (not image-aware), there is no density field, no seed optimisation, no topology choice beyond Delaunay, no Voronoi/hex/quad/adaptive modes, no fill method choice, no border/grout controls, and render modes are limited to FLAT and WIRE only. The review classifies this as requiring a complete eight-stage architectural upgrade.

---

## Reference Parity Gaps

The reference source (`reference/distort/delaunaymesh/source/DelaunayMeshNode.js`) is byte-identical to the current implementation *except* that `forceWorkerPreview: true` and `driveable: true` on `pointCount` and `wireWeight` are present in the live node but absent from the reference source. These additions in the live node are improvements, not regressions. No algorithm or structural parity holes exist between the live node and the reference source.

Parity gaps vs the review specification's eight-stage target architecture:

| Stage | Capability | Present | Gap |
|---|---|---|---|
| 1 | Image analysis fields (gradient magnitude, edge map, distance-to-edge, local contrast, luminance, colour gradient, mask) | No | All absent |
| 2 | Density field construction (DENSITY MODE, BASE DENSITY, GRADIENT BOOST, EDGE BOOST, EDGE FALLOFF, CONTRAST BOOST, LUMINANCE BIAS, DENSITY CURVE, DENSITY PREVIEW) | No | All absent |
| 3 | Seed generation: SEED MODE, SEED RANDOMNESS, MIN SPACING, SPACING MODE | No | Only UNIFORM RANDOM exists implicitly; no param exposure |
| 4 | Seed optimisation: RELAX MODE, RELAX ITERATIONS, RELAX STRENGTH, PRESERVE FEATURES | No | All absent |
| 5 | Topology: VORONOI, CENTROIDAL VORONOI, HEX, QUAD, ADAPTIVE SUBDIVISION, CELLULAR/CRACKLE | No | Only DELAUNAY present |
| 6 | Cell attribute assignment: AVERAGE COLOUR, MEDIAN COLOUR, PALETTE REDUCED, GRADIENT FILL, TEXTURE PATCH; SHOW BORDERS, BORDER WIDTH, BORDER COLOUR, BORDER OPACITY, GROUT MODE | Partial | Only CENTROID SAMPLE (implicit, unlabelled) exists |
| 7 | Render modes: FILL+WIRE, BORDER ONLY, OVERLAY, MASK, DIFFERENCE | No | Only FLAT and WIRE present |
| 8 | Output fields: CELL MASK, BORDER MASK, CELL ID, CELL AREA, DISTANCE TO BORDER | No | All absent |

---

## Review Spec Gaps

Gaps between current implementation and the review spec's required upgrade:

1. **Density field absent** — no gradient magnitude, edge map, distance-to-edge, or local contrast analysis. No BASE DENSITY, GRADIENT BOOST, EDGE BOOST, EDGE FALLOFF, DENSITY CURVE, or DENSITY PREVIEW params.
2. **Seed placement is spatially uniform** — no SEED MODE param; no gradient-weighted, edge-weighted, Poisson-disc, or hybrid seeding. No MIN SPACING or SPACING MODE.
3. **No relaxation** — no RELAX MODE, RELAX ITERATIONS, RELAX STRENGTH, or PRESERVE FEATURES.
4. **No topology choice** — TOPOLOGY METHOD param absent; Delaunay is the only mode.
5. **No Voronoi, hex, quad, adaptive subdivision, or cellular topology**.
6. **Fill method unexposed** — centroid sample is implicit; no fill mode param (AVERAGE COLOUR, MEDIAN, PALETTE REDUCED, GRADIENT FILL, TEXTURE PATCH).
7. **Border/grout absent** — no SHOW BORDERS, BORDER WIDTH, BORDER COLOUR, BORDER OPACITY, or GROUT MODE.
8. **Render modes incomplete** — FILL+WIRE, BORDER ONLY, OVERLAY, MASK, DIFFERENCE all absent.
9. **Output fields absent** — no CELL MASK, BORDER MASK, CELL ID, CELL AREA, or DISTANCE TO BORDER output.
10. **Display name not renamed** — `name: 'DELAUNAY MESH'` must become `'MOSAIC'` (or `'TESSELLATION'`).
11. **Registry label unchanged** — `label: 'DELAUNAY MESH'` in registry.js must be updated to match rename.
12. **Registry description** — must be updated post-rename.
13. **`wireLevel` driver non-functional** — declared `driveable: true`, no `modulate` in `apply()`.
14. **`pointCount` and `wireWeight` lack unit labels on some params** — `pointCount` has `unit: 'n'`, `wireWeight` has `unit: 'px'`, but `wireLevel` lacks `unit` despite having the most range (0–255 grey level).

---

## Missing Parameters

All params below are absent from the current implementation and required by the review spec.

**Stage 2 — Density Field:**
- `densityMode` — select: UNIFORM / GRADIENT WEIGHTED / EDGE WEIGHTED / EDGE DISTANCE / CONTRAST WEIGHTED / HYBRID
- `baseDensity` — range; minimum coverage floor
- `gradientBoost` — range; gradient magnitude weighting
- `edgeBoost` — range; edge weighting
- `edgeFalloff` — range; edge influence radius
- `contrastBoost` — range; local contrast contribution
- `luminanceBias` — range; bright/dark density skew
- `densityCurve` — select: LINEAR / SMOOTHSTEP / EXPONENTIAL / THRESHOLDED
- `densityPreview` — toggle; display density field

**Stage 3 — Seed Generation:**
- `seedMode` — select: UNIFORM RANDOM / JITTERED GRID / POISSON-DISC / GRADIENT WEIGHTED / EDGE WEIGHTED / MASK WEIGHTED / HYBRID WEIGHTED POISSON
- `seedRandomness` — range; regularity vs irregularity
- `minSpacing` — range; floor on centre-to-centre distance
- `spacingMode` — select: FIXED / DENSITY DERIVED

**Stage 4 — Seed Optimisation:**
- `relaxMode` — select: NONE / WEIGHTED REPULSION / WEIGHTED LLOYD / HYBRID
- `relaxIterations` — range; number of optimisation passes
- `relaxStrength` — range; point movement magnitude
- `preserveFeatures` — toggle; pin strong contour anchors

**Stage 5 — Topology:**
- `topologyMethod` — select: DELAUNAY / VORONOI / CENTROIDAL VORONOI / HEX / QUAD / ADAPTIVE SUBDIVISION / CELLULAR

**Stage 6 — Cell Attributes:**
- `fillMode` — select: AVERAGE COLOUR / CENTROID SAMPLE / MEDIAN COLOUR / PALETTE REDUCED / GRADIENT FILL / TEXTURE PATCH
- `showBorders` — toggle
- `borderWidth` — range
- `borderColour` — colour picker (shared component required; see G11)
- `borderOpacity` — range
- `groutMode` — select: SOLID / CRACKLE / GRADIENT

**Stage 7 — Render:**
- `renderMode` — select: FLAT FILL / WIREFRAME / FILL + WIRE / BORDER ONLY / OVERLAY / MASK / DIFFERENCE

**Stage 8 — Output:**
- `cellMask` — output field toggle
- `borderMask` — output field toggle
- `distanceToBorder` — output field toggle

---

## Extra/Incorrect Parameters

None structurally. Minor issues:

- `colorMode` options `['FLAT', 'WIRE']` will be absorbed into the new `renderMode` select. `colorMode` must be removed once `renderMode` is in place.
- `wireLevel` label `'WIRE LVL'` and `wireWeight` label `'WIRE W'` are abbreviated but within the 16-char limit; label updating optional post-rename.
- `wireLevel` missing `unit` field — should be `unit: 'lvl'` or `unit: '0-255'` for G16 compliance.

---

## UI Compliance Issues

1. **G14 — conditional params not hidden**: `wireWeight` and `wireLevel` should not be visible when `colorMode === 'FLAT'` and no border is configured. Post-upgrade, all density, relax, border, and topology-specific params must be hidden when their governing mode is inactive.
2. **G16 — missing unit on `wireLevel`**: `wireLevel` has no `unit` field; must add `unit: 'lvl'` or equivalent.
3. **G2 — `pointCount` and `wireWeight` missing `driveable: true`**: Both are numeric range params; G2 requires all numeric params to declare `driveable: true`. Current node has `driveable: true` on `wireWeight` and `pointCount` but NOT on `wireLevel` in the reference source (the live node corrects `wireWeight` and `pointCount` — confirm live node state is canonical). Verify all newly added numeric params also declare `driveable: true`.
4. **G5 — slider direct input / double-click-to-default**: System-wide issue; applies to all sliders in this module.
5. **Rename not reflected in registry**: Registry entry `label: 'DELAUNAY MESH'` and `description` must be updated when the `name` field is changed to `'MOSAIC'`.
6. **`colorMode` label `'MODE'` is ambiguous** in the context of a multi-mode system post-upgrade; rename to `'RENDER MODE'` or replace entirely with `renderMode`.

---

## Global Issues

| Issue | Applicability | Action |
|---|---|---|
| G1 — +D button non-functional | `wireLevel` has `driveable: true` but the button is broken system-wide | Fix G1 at system level before verifying driver wiring |
| G2 — all numeric params must declare `driveable: true` | `pointCount` and `wireWeight` missing `driveable: true` in reference source; live node adds them — confirm. All new numeric params in the upgrade must include `driveable: true` | Add `driveable: true` to all new range params |
| G5 — slider direct input + double-click-to-default | All sliders in this module | System-level fix |
| G6 — canvas click-to-pick | Not applicable — this module has no centre-point params | None |
| G7 — vector module indicator | Not applicable — pixel module | None |
| G9 — FRAME param for time-based modules | Not applicable — this module is not time/iteration-based (Delaunay is deterministic per seed) | None |
| G10 — SVG export | Not applicable — pixel module | None |
| G11 — shared components for overlapping patterns | Border colour picker, density preview toggle, seed controls must use shared components when available; do not reimplement per-module | Use shared ColourRampControl / CentrePointPicker etc. when built |
| G12 — web worker usage | `forceWorkerPreview: true` is present; however, O(n²) Bowyer–Watson at `pointCount = 2000` can still block the main thread at full quality. Full offload to render worker confirmed as required by review | Ensure all density/seed/relax/triangulation computation runs entirely in the render worker; enforce `previewMax` on all expensive new params |
| G14 — mode-conditional param hiding | `wireWeight` and `wireLevel` currently visible in FLAT mode with no strokes; post-upgrade, topology-specific, density-specific, relax-specific, and border-specific params must all be conditionally hidden | Implement `when` visibility guards on all conditional params |
| G16 — unit labels on all numeric params | `wireLevel` missing `unit`; all new numeric params must include `unit` | Add `unit` to `wireLevel` and all new params |
| G18 — GEOMETRIC category voronoi module removal | Voronoi topology becomes a mode within this module; standalone `voronoi` node in GEOMETRIC should be removed once Voronoi mode is implemented here | Coordinate removal of standalone voronoi node with GEOMETRIC category review |

---

## Merge Absorption

**G18 — Standalone Voronoi node**: When Voronoi topology is implemented as a mode within this module, the standalone `ContourNode`-adjacent `voronoi` node in GEOMETRIC (flagged for removal in G18) must be retired. Confirm Voronoi mode here provides at least feature parity with standalone before removing.

**`colorMode` params**: The two current `colorMode` options (`FLAT`, `WIRE`) will be fully absorbed into the new `renderMode` param (FLAT FILL, WIREFRAME, FILL + WIRE, BORDER ONLY, OVERLAY, MASK, DIFFERENCE). Remove `colorMode` after migration. Preserve backward compatibility in `fromJSON()` — map legacy `colorMode: 'FLAT'` → `renderMode: 'FLAT FILL'`, `colorMode: 'WIRE'` → `renderMode: 'WIREFRAME'`.

**`wireLevel` / `wireWeight`**: These survive into the upgraded node but may be reclassified under border/grout section. Ensure param keys are preserved for JSON deserialisation.

---

## Required Changes (priority ordered)

### P0 — Correctness Fixes (blocking — independent of upgrade)

1. **Fix `wireLevel` driver wiring**: Add `modulate` argument to `apply()` and call `this.getModulated('wireLevel', pixelIdx, ctx)` per-pixel, or confirm that the factory pattern resolves modulation before calling `apply()`. Either wire it correctly or remove `driveable: true` until the architecture supports it.
2. **Add `unit: 'lvl'` to `wireLevel`** (G16).
3. **Add `driveable: true` to `pointCount` and `wireWeight`** — confirm live node state vs reference source; reference source lacks them, live node has them. Ensure canonical.

### P1 — Rename (required before any new params)

4. **Rename `name` to `'MOSAIC'`** (or `'TESSELLATION'`).
5. **Update registry entry**: `label: 'DELAUNAY MESH'` → `'MOSAIC'`; update description.

### P2 — Phase 1 (minimum acceptable upgrade per review spec)

6. **Implement image analysis**: Gradient magnitude field, edge map, distance-to-edge field.
7. **Implement density field construction**: Add params `densityMode`, `baseDensity`, `gradientBoost`, `edgeBoost`, `edgeFalloff`, `densityCurve`, `densityPreview`. Default: HYBRID.
8. **Implement gradient-weighted Poisson seeding**: Add params `seedMode`, `minSpacing`, `spacingMode`. Default: HYBRID WEIGHTED POISSON.
9. **Move all heavy computation (analysis + triangulation) into render worker** (G12); ensure `previewMax` caps applied to all expensive params.

### P3 — Phase 2

10. **Implement seed relaxation**: Add params `relaxMode`, `relaxIterations`, `relaxStrength`, `preserveFeatures`.

### P4 — Phase 4

11. **Implement Voronoi topology mode**: Add `topologyMethod` param (DELAUNAY / VORONOI initially).
12. **Retire standalone voronoi node** from GEOMETRIC once Voronoi mode is functional here (coordinate with G18 GEOMETRIC review).

### P5 — Phase 5

13. **Add render modes**: Replace `colorMode` with `renderMode`; implement FLAT FILL, WIREFRAME, FILL + WIRE, BORDER ONLY, OVERLAY.
14. **Add border/grout controls**: `showBorders`, `borderWidth`, `borderColour`, `borderOpacity`, `groutMode`.
15. **Implement G14 conditional param visibility**: Hide border params when `showBorders = false`; hide wire params when render mode has no wire; hide density params when `densityMode = UNIFORM`.

### P6 — Phase 6

16. **Add HEX and ADAPTIVE SUBDIVISION topology modes** to `topologyMethod`.
17. **Add fill mode param**: `fillMode` with AVERAGE COLOUR, CENTROID SAMPLE, MEDIAN COLOUR, PALETTE REDUCED.

### P7 — Phase 7

18. **Add output fields**: `cellMask`, `borderMask`, `distanceToBorder`.

### P8 — Global/System (track but do not implement here)

19. **G1 — fix +D button** at system level.
20. **G5 — slider direct input / double-click-to-default** at system level.
21. **G11 — build shared ColourRampControl, CentrePointPicker** before implementing colour params in this module.

---

## Verification Criteria

- [ ] `name` field is `'MOSAIC'` (or `'TESSELLATION'`); registry `label` and `description` updated.
- [ ] `type` field remains `'delaunaymesh'` for backward compatibility with serialised sessions (or migration path documented).
- [ ] All numeric params (`pointCount`, `wireWeight`, `wireLevel`, and all new range params) have `driveable: true`.
- [ ] All numeric params have a `unit` field.
- [ ] `wireLevel` driver is functional: `apply()` calls `getModulated('wireLevel', ...)` per pixel or equivalent, and connecting a driver produces visible per-pixel variation.
- [ ] `densityMode: 'HYBRID'` produces visibly denser triangulation near image edges and gradient regions than spatially uniform random seeding at equivalent `pointCount`.
- [ ] `seedMode: 'HYBRID WEIGHTED POISSON'` seed placement concentrates seeds in high-density-field regions.
- [ ] `relaxMode: 'WEIGHTED LLOYD'` with `relaxIterations > 0` produces more balanced triangle distribution than unrelaxed output.
- [ ] `topologyMethod: 'VORONOI'` produces Voronoi polygon mosaic, not triangulated output.
- [ ] `renderMode: 'FILL + WIRE'` produces fill with stroked edges simultaneously.
- [ ] `renderMode: 'BORDER ONLY'` produces grout/border lines only (no fill).
- [ ] `showBorders: false` hides all border params in the NodePanel (G14).
- [ ] Inactive topology-specific params are hidden when their topology is not selected (G14).
- [ ] All computation (analysis, Poisson seeding, relaxation, triangulation/Voronoi, rendering) runs in the render worker; no main-thread block at `pointCount = 2000`.
- [ ] Preview at `pointCount = 2000` respects `previewMax: 100` cap; preview completes in < 10 ms.
- [ ] `fromJSON` correctly maps legacy `colorMode: 'FLAT'` → `renderMode: 'FLAT FILL'` and `colorMode: 'WIRE'` → `renderMode: 'WIREFRAME'`.
- [ ] Standalone `voronoi` node in GEOMETRIC is removed (or flagged for removal) once Voronoi mode is verified functional.
- [ ] Registry `description` accurately describes the module as a multi-topology tessellation/mosaic system.
- [ ] No `document.*`, `window.*`, `requestAnimationFrame`, or `setInterval` introduced outside sanctioned boundaries.
- [ ] G16: all slider params display units in the NodePanel.
