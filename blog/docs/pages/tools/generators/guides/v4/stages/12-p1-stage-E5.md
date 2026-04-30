# Card 12 — Phase 1 Stage E.5 — LIBRARY HYGIENE AUDIT

## What this stage does
Verifies the live generator uses shared algorithm libraries and foundation modules where it should, instead of inlining/copy-pasting. Catches v3's deepest finding: zero generators import from `assets/js/shared/algorithms/`. Produces the Library Hygiene Report.

## Applicable rules
Operating: R5, R10. Anti-Fab: F.1, F.3 (algorithm names from source). Anti-pattern numbers: 5, 6.

## Inputs
- Live source (in context)
- Live Coverage Map (built in Stage C.5 — re-derive if not in context)
- Live State Inventory (in context from Stage C.5)
- Diff Table (in context from Stage D)
- Phase 0 reconciled answers re: foundation paths (re-Read `phase-0-questions-resolved.md` if uncertain whether Check 3 sub-rows are active)

## Outputs
- Library Hygiene Report — held in context; written in Stage F

## Procedure

- [ ] 1. Update v4-state.md: `stage: E.5`, append checkpoint.
- [ ] 1a. **Build the session-cached shared library index** (only on first Phase 1 turn of session, then cached in v4-state.md `library_index_built: true`):
  - `Glob assets/js/shared/algorithms/**/*.js` — list every algorithm module
  - `Glob assets/js/shared/components/**/*.js` — list every shared component
  - `Glob assets/js/shared/utils/**/*.js` — list every shared util
  - `Glob assets/js/shared/data/**/*.js` — list every shared data module
  - Write the lists to `blog/docs/pages/tools/generators/shared-library-index.md` (session artefact). Include the actual paths — they're nested by category (e.g. `shared/algorithms/physics/wave-solver.js`, `shared/algorithms/noise/noise-functions.js`).
  - For subsequent turns: re-Read shared-library-index.md instead of re-Globbing.
- [ ] 2. **Check 1: shared algorithm imports.** Grep the live source for imports from `assets/js/shared/`:
  ```
  rg "from .*shared/(algorithms|components|utils|data|p5-integration|foundation|specialized)" assets/js/tools/generators/scripts/<category>/<id>.gen.js
  ```
  Record every import line. If zero imports → log ARCH P1 `zero-shared-imports` (this generator inlines everything; the v3-era pattern).
- [ ] 3. **Check 1 detail — algorithm matching.** For each Reference cap_id whose `kind == 'behaviour'`:
  - Identify the algorithm domain from the cap name (wave equation, Perlin noise, Voronoi tessellation, FFT, etc.).
  - Look in `shared-library-index.md` for a path whose filename or category contains a matching keyword. Example: cap "2D wave equation step" → look for `algorithms/physics/wave-solver.js` or `algorithms/physics/wave-equation*.js`.
  - **If a candidate shared module exists** AND live does NOT import it → log ARCH P1 `algorithm-duplication-<canonical-path>`. Cite live file:line (where the algorithm is inlined) AND shared file:line (where the canonical version exists).
  - **If no candidate shared module exists** → log ARCH P2 `algorithm-shared-module-missing-<algorithm-name>` (suggests Phase 3 should create one).
  - **If matching is ambiguous** (multiple candidates, none obviously canonical) → queue OBSERVE Q-algorithm-match-ambiguous-`<id>`-`<algorithm>`. Continue with the closest match.
- [ ] 4. **Reference-side library treatment.** When matching, ignore what library the **reference** uses. The reference is allowed to use any external library however it wants — that's not a parity issue. The parity issue is whether the **live** implementation uses our shared library for the equivalent capability. Do not log ARCH issues against the reference for "not using shared/algorithms".
- [ ] 5. **Check 2: foundation usage.** Grep the live source for:
  - `requestAnimationFrame` / `cancelAnimationFrame` → if found AND not in `compute.computePixels` worker path, log ARCH P1 `manual-raf-instead-of-AnimationFoundation`
  - `setInterval` / `clearInterval` (for animation purposes) → log ARCH P1 `manual-interval-instead-of-AnimationFoundation`
  - `setTimeout` (for animation; not for one-shot timing) → log ARCH P2 `manual-timeout-instead-of-AnimationFoundation`
  - `navigator.gpu` / `getContext('webgl2')` / `getContext('webgpu')` → if found AND file is not `gpu-foundation.js` → log ARCH P0 `gpu-bypasses-foundation`
- [ ] 6. **Check 3: BaseComponent / MathematicalFoundation.** Read the Phase 0 reconcile decisions:
  - If Q-rules-base-component resolved with `confirm` (path updated) OR `override-b` (shim created) → verify live source `extends BaseComponent` (or doesn't, in which case log ARCH P1 `base-component-not-extended`)
  - If Q-rules-base-component resolved with `override-c` (skip Check 3 BaseComponent row) → SKIP this sub-row
  - If Q-rules-mathematical-foundation resolved with `confirm` (declared aspirational) → SKIP layout-math sub-row entirely
  - If Q-rules-mathematical-foundation resolved with `override-b`/`override-c` (file exists) → look for layout calculations in live (`width * 0.5`, `Math.sqrt`, etc.) outside of MathematicalFoundation calls. If found → log ARCH P2 `layout-math-inlined`
- [ ] 7. **Check 4: state inventory smell.** Re-read Live State Inventory from system-map.md. For every row with `scope: module`, log ARCH P2 `module-level-mutable-state-<name>` (per Default Assumptions Catalogue). Cite file:line.
- [ ] 8. Aggregate all ARCH issues for this generator. Build the Hygiene Report from template below.
- [ ] 9. Update v4-state.md: `stage: E.6`, `last_action: hygiene audit complete (<N> ARCH issues)`, `next_action: performance tier audit`, append checkpoint.
- [ ] 10. Read card `13-p1-stage-E6.md` — auto-advance.

## Algorithm matching — read the actual library, do not assume paths

The shared library is organised as `assets/js/shared/algorithms/<category>/<file>.js`. Categories observed in the repo include: `animation`, `ascii`, `audio`, `color`, `combinatorics`, `core`, `data`, `distance`, `dither`, `edge-detection`, `features`, `field`, `geometry`, `image`, `line`, `noise`, `painter`, `patterns`, `physics`, `rendering`, `sampling`, `space-filling`, `tsp`. **Categories and file names change** — never hard-code a path; always derive from `shared-library-index.md` built in step 1a.

Approximate guide for keyword → likely category (use as hint only, verify against the index):

| Algorithm domain | Probable category | Example file (must verify in index) |
|---|---|---|
| Wave equation, oscillation, harmonic motion | `physics` | `wave-solver.js` |
| Perlin / simplex / FBM / value noise | `noise` | `noise-functions.js`, `ridged-fbm-2d.js` |
| Voronoi / Delaunay / convex hull / SDF | `geometry` | `voronoi-2d.js`, `delaunay-2d.js`, `sdf-operations.js` |
| Pattern tiling, halftone, mosaic | `patterns` | `pattern-generators.js`, `halftone-patterns.js` |
| Space-filling curves (Hilbert, Peano) | `space-filling` | `space-filling-curves.js` |
| Color quantization, palette ops | `color` | `quantization.js` |
| Image filtering, blur, posterize, compositing | `image` | `blur-filters.js`, `posterization.js`, `compositing.js` |
| Dithering | `dither` | `nearest-color.js` |
| Flow fields, vector fields | `field` | `vector-field.js` |
| Line / stroke engines | `line` | `static-line-engine.js`, `flow-line-engine.js` |
| Brush / paint engines | `painter` | `brush-engine.js` |
| Marching squares, contouring | `geometry` | `marching-squares.js` |
| Coordinate transforms, math utils, matrices | `core` | `coordinate-transforms.js`, `math-utils.js`, `matrix.js` |
| TSP / path optimisation | `tsp` | `path-optimization.js` |
| Audio DSP | `audio` | `dsp-evaluator.js` |
| ASCII matching | `ascii` | `character-matching.js`, `flow-matching.js` |
| Geodesic / distance fields | `distance` | `geodesic.js` |

Foundations (not in `algorithms/`):

| Concept | Path |
|---|---|
| BaseComponent class | `assets/js/shared/foundation.js` |
| AnimationFoundation | `assets/js/core/animation-foundation.js` |
| GPUFoundation | `assets/js/core/gpu-foundation.js` |
| p5 integration | `assets/js/shared/p5-integration.js` |
| Specialised widgets | `assets/js/shared/specialized.js` |
| Component library | `assets/js/shared/component-library.js` |
| Color utils | `assets/js/shared/utils/color.js` |
| Canvas utils | `assets/js/shared/utils/canvas.js`, `canvas-utils.js` |

If the keyword guide doesn't match anything in the index, queue OBSERVE Q-algorithm-match-ambiguous-`<id>`-`<algorithm>` and pick the closest plausible match. Do not invent paths.

## Templates

### Library Hygiene Report

```markdown
### Library Hygiene Report

**Check 1 — Shared algorithm imports**
- Imports found: <list, or "none">
- Algorithms inlined that have shared modules: <list with cap_id refs>
- Algorithms inlined where no shared module exists: <list — log as `algorithm-shared-module-missing`>

**Check 2 — Foundation usage**
- AnimationFoundation: <yes / no — uses raw RAF / setInterval at file:line>
- GPUFoundation: <yes / no — uses raw navigator.gpu/WebGL at file:line / N/A — no GPU>

**Check 3 — BaseComponent / MathematicalFoundation**
- BaseComponent: <extends / does not extend at file:line / SKIPPED per Q-rules-base-component override-c>
- MathematicalFoundation: <uses / inlines layout math at file:line / SKIPPED per Q-rules-mathematical-foundation>

**Check 4 — State scope smells**
- Module-scope mutable state: <list of state names from Live State Inventory, or "none">

**Issues logged:** ARCH-NN, ARCH-NN+1, ...
```

## Validation

```bash
rg "from .*shared/algorithms" assets/js/tools/generators/scripts/<category>/<id>.gen.js
rg "(requestAnimationFrame|setInterval|navigator\.gpu|getContext\(['\"]webgl|getContext\(['\"]webgpu)" assets/js/tools/generators/scripts/<category>/<id>.gen.js
rg "extends BaseComponent" assets/js/tools/generators/scripts/<category>/<id>.gen.js
```

Cross-check the Hygiene Report's claims against these grep results.

## Halt-and-recover

| Trigger | Recovery |
|---|---|
| Live source has no algorithm-like content (e.g. pure UI display generator) | Check 1 produces zero rows — that's correct. State so explicitly in report. |
| Algorithm shared module exists but at non-canonical path | Use the actual path. Update the catalogue table for next sessions (queue OBSERVE Q-catalogue-update). |
| Live uses RAF in `compute.worker` setup callback (not for animation, but for worker startup timing) | Not an issue — note in Check 2 as `RAF found at file:line — used for worker startup, not animation, OK`. |
| `extends BaseComponent` not found AND live is a procedural top-level script (rare for generators) | Check 3 BaseComponent row → ARCH P1, suggest refactor to class. CONTINUE. |
| Phase 0 reconcile decisions don't exist (running E.5 before Phase 0 finished — should be impossible) | STOP. This is a state machine bug. Read Phase 0 cards. |

## Exit criteria

- [ ] Library Hygiene Report has all four Checks (no missing sections)
- [ ] Every ARCH issue has cited file:line
- [ ] Phase 0 reconcile decisions for Check 3 honoured (skip / not skip)
- [ ] v4-state.md updated; `stage: E.6`

## Next card

`blog/docs/pages/tools/generators/guides/v4/stages/13-p1-stage-E6.md`
