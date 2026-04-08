# Distort Tool — Next Steps (Post WU-2)

## Status Snapshot (2026-03-31)

### Completed
| Item | Scope | Evidence |
|------|-------|----------|
| **WU-2 (G2+G14+G16)** | 65 nodes, 256 range params | `driveable: true` + `unit:` on all; `when:` on 9 conditional params |
| **Phase 0 removals** | 4 types | HIGHPASS, MODULESERPENTINE, MODULESTATICLINES, VORONOI — gone from registry + disk |
| **Phase 1 components** | 12/12 | All registered in component-library.js via DistortExtendedControls |
| **G5 (NodePanel)** | distort sliders | Direct number input + dblclick-to-default in `_buildRangeRow` |
| **G7** | 4 vector modules | `V ·` prefix in CategoryPicker via `entry.vector` |
| **G8** | category merge | Single `'LINE RENDER'` key in registry.js |
| **G9** | 13/14 time modules | FRAME param present; **IterativeRewarpNode missing** |
| **G19** | timeline toggle | TOGGLE TIMELINE button in canvas tab; TransportStrip show/hide |

### Partially Done
| Item | Gap |
|------|-----|
| **G5 (NumericInput)** | `NumericInput.js` lacks dblclick-to-default; FrameSlider uses read-only span |
| **G1 (+D driver)** | Panel opens; `__opacity__` key skipped in Pipeline; some modules' `apply()` ignores `modulate` |
| **G13 (blend modes)** | Per-channel formulas correct; sRGB vs linear + alpha gaps vs pro-tool reference |
| **G9 residual** | IterativeRewarpNode has no `frame` param |

### Not Started (from implementation plan)
- Phase 2: 38 algorithm specs written, 0 verified built to spec
- Phase 3: G1/G12/G13/G15 fixes
- Phases 4–10: algorithm builds, component wiring, ref docs, decision trees, module rebuilds

---

## Prioritised Work Units

### WU-3: G1 — Driver (+D) End-to-End Fix
**Priority:** CRITICAL — blocks all spatial modulation; 48+ modules affected.
**Scope:**
1. `NodePanel._toggleDriverPicker` → confirm DriverPicker renders (runtime test)
2. `Pipeline._applyNodeModulation` → handle `__opacity__` key (reads `node.opacity` not `node.params`)
3. `EffectNode.getModulated` → handle `__opacity__` base value
4. Audit: modules where `apply()` has `driveable` params but never calls `modulate` (dilateerode, openclose, contour, sdfshape, interference per reviews)
**Files:** NodePanel.js, Pipeline.js, EffectNode.js, DriverPicker.js, 5+ node files
**Size:** LARGE

### WU-4: G13 — Blend Mode Audit
**Priority:** HIGH — affects all compositing.
**Scope:**
1. Decide reference (SVG/CSS spec vs Photoshop)
2. Verify/fix: softlight formula variant; alpha handling in blend loop
3. Optional: linearise sRGB before blend (MEDIUM→LARGE upgrade)
4. Add regression harness (known input pairs → expected output)
**Files:** Pipeline.js (`_blend`, `ch` function)
**Size:** MEDIUM (formula fix) or LARGE (linear pipeline)

### WU-5: G5 + G9 Residuals
**Priority:** MEDIUM
**Scope:**
1. `NumericInput.js` — add dblclick-to-default on number field
2. `FrameSlider` — replace read-only span with NumericInput or editable field
3. `IterativeRewarpNode.js` — add `frame` param + `capByFrame` on `samples`
**Files:** NumericInput.js, DistortExtendedControls.js, IterativeRewarpNode.js
**Size:** SMALL

### WU-6: G12 — Worker Offload Audit
**Priority:** HIGH — bilateral hangs; several modules too slow.
**Scope:**
1. Audit which `apply()` runs on main vs worker
2. Ensure `forceWorkerPreview: true` on all expensive modules
3. Fix bilateral (currently hangs — algorithm or timeout issue)
4. Review `previewMax` caps for CA, RD, stipple, delaunay
**Files:** RenderWorker.js, Pipeline.js, BilateralFilterNode.js, + heavy nodes
**Size:** LARGE

### WU-7: Phase 2 Algorithm Verification
**Priority:** MEDIUM — prerequisite for module rebuilds (Phase 10).
**Scope:** Verify each of 38 algorithm specs against existing implementations in `assets/js/shared/algorithms/`. Three outcomes per algorithm:
- EXISTS_CORRECT: implementation matches spec
- EXISTS_NEEDS_FIX: implementation exists but diverges from spec
- MISSING: needs building
**Size:** XLARGE (audit) — parallelisable across algorithm categories

### WU-8: Per-Module Review Issue Triage
**Priority:** LOW-MEDIUM — feeds Phase 10 but not blocking.
**Scope:** Extract all [ERROR]/[WARN]/[NOTE] from 70 review files into a single structured issue register. Classify by: already-fixed-by-WU2, blocked-by-G1, blocked-by-algorithm, standalone-fix.
**Size:** MEDIUM (read-only audit)

---

## Dependency Graph

```
WU-3 (G1 driver) ──→ WU-4 (G13 blend) ──→ Phase 10 module rebuilds
       │                                          ↑
       └──→ WU-6 (G12 workers) ──────────────────┘
                                                   ↑
WU-5 (G5+G9 residuals) ──────────────────────────┘
                                                   ↑
WU-7 (algorithm audit) → Phase 4 builds ─────────┘
                                                   ↑
WU-8 (review triage) ────────────────────────────┘
```

**Recommended execution order:** WU-5 (quick wins) → WU-3 (unblocks drivers) → WU-4 (blend) → WU-6 (workers) → WU-7 (algorithms) → WU-8 (triage)

---

## Per-Module Issue Density (from review sample)

**Critical rebuilds (PARITY gap ≥ 5 issues):** stipple, chromaticab, serpentine, lumflow, reactiondiffusion, moire, truchet, scanlines, contour, dilateerode
**Moderate (2-4 issues):** filmgrain, vignette, halftonepattern, grating, domainwarp, cellularautomata, wavedistortion, paintstroke, delaunaymesh, sdfshape
**Minor (1 issue, typically G1 only):** greyscale, levels, affine, twirl, boxblur, gaussblur, motionblur, radialblur, median, unsharp, canny, sobel, dog, laplacian, invert, posterize, curves, etc.
