# Document Generator Guide

This guide produces a complete 8-file documentation pack for one generator. Work through every step in order. Do not skip steps. Do not proceed to a later step until the current step is finished. All 8 output files must pass the criteria in `review-and-correction-loop.md` before the generator is considered migrated.

---

## Step 0 — Pre-read the source

Before writing anything, read the live `.gen.js` file completely. The file is in `assets/js/tools/generators/scripts/<category>/<id>.gen.js`.

**Read in this order:**

**0.1 SCRIPT_CONFIG object**

Read every field of the exported `SCRIPT_CONFIG` object and note:

- `id` — the kebab-case identifier; this becomes the pack folder name
- `title` — display name for the generator
- `category` — one of: parametric, wave, pattern, physics, other
- `canvas.context` — `'2d'` or `'p5'`; determines which render hooks apply
- `canvas.width`, `canvas.height` — the fixed output dimensions in pixels
- `parameters` — the full array of groups and params; read every entry: key, type, label, min, max, step, default
- `presets` — every preset object; read all key-value pairs
- `animation` — if present: type, defaultFps, loopFrames, animatableParams
- `description` — if present: this is the INFO tab content, not the documentation description
- `version` — the script version

**0.2 Named functions and methods**

Read every function defined in the file (both module-level functions and methods on SCRIPT_CONFIG). For each, note:

- Its name
- What it takes as input (argument names and what they represent)
- What it returns or mutates
- Whether it contains any mathematical operations worth documenting (formulas, trigonometry, physics)

For p5 generators, identify: `p5Setup(p, params)` and `p5Draw(p, params, frame)`. For 2D generators, identify: `draw(ctx, canvas, params, frame)`.

**0.3 State model**

Identify every variable stored on `this` (i.e. `this.someName = ...` within SCRIPT_CONFIG methods). For each:

- Its name
- What it holds (data type and semantic meaning)
- When it is first assigned (in setup / on rebuild / lazily)
- When it mutates (every frame / on certain param changes / on reset)
- What causes it to be reset or rebuilt from scratch

**0.4 Render loop execution order**

Trace the execution path of the render hook (`p5Draw` or `draw`). List every step in sequence:

1. What is checked or computed first?
2. What is the main update loop?
3. What is the collision / physics / wave step if present?
4. What is the draw step?
5. What state is mutated as a side effect of the frame?

**0.5 Rebuild mechanism**

Identify how the generator detects that a structural rebuild is needed (as opposed to applying a param live). Common patterns:
- `_cfgKey(params)` — computes a string key from rebuild-sensitive params, compares to `this._lastCfgKey`
- `this._lastParams.x !== params.x` — direct comparison per key
- `p5Setup` is called fresh — the host re-calls setup when the script changes

Note which specific param keys trigger a rebuild vs. are applied live (during draw with no rebuild).

---

## Step 1 — Read and consolidate legacy docs

Check `reference/generators/<id>/legacy-docs/` for archived files. If the folder is empty, record that fact and continue.

For each legacy file found:

**1.1** Classify it using `classify-reference-material.md`.

**1.2** Read it completely. Extract every feature, parameter, behaviour, or constraint it describes. Write a flat list: "Legacy doc X describes: [feature A], [feature B], [parameter C with range D–E], [behaviour F]."

**1.3** For each feature in the list, check whether it exists in the live source:
- **Confirmed**: the feature exists in the live source and behaves as the doc describes
- **Changed**: the feature exists but the implementation differs from the doc's description
- **Absent**: the feature is described in the doc but has no corresponding implementation in the source
- **Conflicting**: the doc and source describe the same parameter or behaviour in contradictory ways

**1.4** Record the consolidation summary: three lists — confirmed features, absent features (parity holes), conflicts.

This consolidation drives both `feature-parity.md` (Step 7) and `issues-and-conflicts.md` (Step 8).

---

## Step 2 — Write `source-reference.md`

Required content:

```markdown
# <Title> — Source Reference

## Current Owners

- live script: `assets/js/tools/generators/scripts/<category>/<id>.gen.js`
- registry: `assets/js/tools/generators/core/script-registry.js`
- host: `assets/js/tools/generators/core/generative-tool-host.js`

## Archive

- `reference/generators/<id>/source/<filename>.gen.js`

## Legacy Docs Archived

For each file found in reference/generators/<id>/legacy-docs/:
- `reference/generators/<id>/legacy-docs/<filename>` — classification: <class>

If none:
- none located

## Classifications

- live script: `functional source/reference tool`
- <legacy file 1>: <classification>
- <legacy file 2>: <classification>
```

Classify each file using `classify-reference-material.md`. Record the classification here and in `migration-log.md`.

---

## Step 3 — Write `description.md`

The description must explain what the generator is, not merely restate the `SCRIPT_CONFIG.description` field. It must answer all of the following:

**3.1 Mathematical or physical model**

What mathematical or physical phenomenon does this generator model? Be specific. "A parametric curve" is insufficient. "A pair of sinusoidal oscillations with independent frequency, amplitude, and phase that trace a Lissajous figure" is the required level of detail. Name the class of mathematics: parametric equations, Newtonian particle physics, wave superposition, Voronoi tessellation, etc.

**3.2 Visual output**

What does the output look like? Describe the visual structure: what shapes appear, how they are arranged, what motion is present (if animated), what changes as the user adjusts parameters. Be specific enough that someone who has not seen the generator can visualise it.

**3.3 What makes it distinct**

What makes this generator different from other generators in the same category? Identify the specific property that is unique.

**3.4 Algorithm origin**

If the core method has a known name (front-chain circle packing, Apollonius tangent geometry, Keplerian orbital elements, discrete Fourier transform, reaction-diffusion Gray-Scott), state it. If it is a heuristic or bespoke approach, say so.

**3.5 Scope boundary**

State explicitly what this generator does NOT do. One to three sentences. This prevents scope creep in future development.

**Minimum length: 150 words.** A description that is shorter is a signal that it has not been written from the source — it has been paraphrased from the config description field and must be rewritten.

---

## Step 4 — Write `mechanisms.md`

Four required sections:

### 4.1 State model table

List every `this.*` variable:

| Variable | Type | Holds | Initialised | Mutates | Reset trigger |
| --- | --- | --- | --- | --- | --- |
| `_circles` | Array of objects | Packed circle state: position, velocity, colour, trail | `p5Setup` / rebuild | Every frame (position, velocity, trail) | Param key change via `_cfgKey` |
| `_canvasSize` | number | Current canvas size in pixels | `p5Setup` | On rebuild | `fibIndexForCanvas` change |

Every `this.*` variable must have a row. If a variable has no row it was not found — look again.

### 4.2 Function inventory

List every named function (module-level helpers and SCRIPT_CONFIG methods):

| Function | Role | Inputs | Output | Complexity |
| --- | --- | --- | --- | --- |
| `_fibSeq(n)` | Generates first n terms of the Fibonacci sequence | `n: number` — count of terms | `Array<number>` — sequence `[1,1,2,3,5,...]` | O(n) |
| `_dist(ax,ay,bx,by)` | Euclidean distance between two points | four coordinates: `number` | `number` — distance in pixels | O(1) |
| `_tangentToTwo(c1, c2, r)` | Finds candidate positions tangent to two circles at radius r | `c1, c2: {x,y,r}`, `r: number` | `Array<{x,y}>` — 0 or 2 candidate positions | O(1) |

Every named function must have a row. Methods with no interesting logic ("just assigns `this.x = x`") can be noted as "state assignment" in the Role column.

### 4.3 Mathematical model

Write every non-trivial formula in the source as an explicit formula with variable definitions. Use inline notation. Immediately after each formula, define every symbol.

Example:

**Elastic collision impulse:**
`j = dvn × (1 + e) / (1/m₁ + 1/m₂)`

where:
- `j` — impulse magnitude (pixel·mass units)
- `dvn` — relative normal velocity: `(c1.vx − c2.vx)·nx + (c1.vy − c2.vy)·ny`
- `e` — restitution coefficient (dimensionless, 0–1); from `params.restitution`
- `m₁ = r₁²`, `m₂ = r₂²` — proxy masses (radius squared, dimensionless)
- `nx, ny` — collision normal unit vector

Velocity update: `c1.vx −= (j/m₁)·nx`, `c1.vy −= (j/m₁)·ny` and analogously for c2.

**Every formula in the source must appear here.** A `mechanisms.md` with no formulas is incomplete unless the generator contains no mathematical operations.

### 4.4 Render loop order

Number every step in `p5Draw` or `draw`, in source order, with what each does:

1. Check if `_cfgKey(params) !== this._lastCfgKey`; if so, rebuild `_circles` and `_canvasSize`
2. For each circle: push current position to `trail`; if `trail.length > trailLength`, shift
3. Apply `velocityGrowth` to each circle's `vx`, `vy`; advance `x`, `y`
4. For `collisionPasses` iterations: call `_separate` on every pair; call `_bounceWalls` on every circle
5. For every pair: call `_resolveVelocity`; if collision detected, call `_applyCollisionColor`
6. For each circle with an inner: call `_updateInner`
7. Clear background: `p.background(0, 0, 8)` (HSL near-black)
8. For each circle: call `_drawCircle`

### 4.5 Rebuild mechanism

For each rebuild-sensitive parameter, state:
- The parameter key(s)
- The detection method
- What is rebuilt

Example:
- **`fibIndexForCanvas`, `maxFibIndex`** — detected via `_cfgKey(params)` which returns `"${fibIndexForCanvas}|${maxFibIndex}"`. If this string differs from `this._lastCfgKey`, `_buildCircles(params)` is called, replacing `this._circles` entirely. The canvas size `this._canvasSize` is also recomputed from the Fibonacci sequence.
- All other parameters — applied live during `p5Draw` without rebuild.

---

## Step 5 — Write `ui-layout.md`

Three required sections:

### 5.1 Parameter table

One row per parameter entry in `SCRIPT_CONFIG.parameters`. Never omit a parameter.

| Key | Label | Type | Min | Max | Step | Default | Group | Controls | Rebuild? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `fibIndexForCanvas` | Fib Canvas Index | slider | 10 | 15 | 1 | 14 | Circles | The Fibonacci index used to determine canvas size: `canvasSize = fib[fibIndexForCanvas]`. Higher values increase canvas size dramatically. | Yes |
| `outerSpeed` | Outer Speed | slider | 0.1 | 3 | 0.1 | 0.5 | Physics | Initial speed magnitude applied to each outer circle at spawn. Does not directly limit max speed due to `velocityGrowth`. | No |

The "Controls" column must explain what the parameter actually does in the render, not just restate the label.

The "Rebuild?" column is Yes if the parameter is checked in the rebuild detection mechanism (Step 4.5), No otherwise.

### 5.2 Preset table

One row per entry in `SCRIPT_CONFIG.presets`. List every parameter value the preset sets. Describe the visual character.

| Name | Key values | Visual character |
| --- | --- | --- |
| Classic | fibIndexForCanvas: 14, maxFibIndex: 12, outerSpeed: 0.5, innerSpeed: 0.3, restitution: 0.95, collisionPasses: 8, separationStrength: 0.5, collisionDamping: 0.5, velocityGrowth: 1.01, hueShiftScale: 50, satShiftScale: 15, lightShiftScale: 20, trailLength: 5, trailAlphaDecay: 0.6 | Moderate speed, moderate colour shift, short trails. The baseline state. |

### 5.3 Sidebar structure

State the tab order as it appears in the host UI, blocks within each tab, and the components under each block.

```
PARAMS
  Circles
    Fib Canvas Index (slider)
    Max Fib Index (slider)
  Physics
    Outer Speed (slider)
    Inner Speed (slider)
    Restitution (slider)
    Collision Passes (slider)
    Separation (slider)
    Collision Damping (slider)
    Velocity Growth (slider)
  Colour
    Hue Shift Scale (slider)
    Sat Shift Scale (slider)
    Light Shift Scale (slider)
  Trails
    Trail Length (slider)
    Trail Alpha Decay (slider)
ANIMATE  (present — animation config exists)
EXPORT   (always present)
INFO     (present — description field exists)
```

### 5.4 UX notes

Note any of the following if present:
- Parameters that interact non-obviously (e.g. `velocityGrowth` compounds over time; its effect is not visible at t=0)
- Parameters where the label or range is potentially misleading
- Parameters where the maximum value causes a severe performance impact
- Parameters that require a rebuild before the effect is visible (affects live-edit feel)

---

## Step 6 — Write `performance.md`

Five required sections:

### 6.1 Dominant operation

Name the single most expensive computation in the render loop. Be specific: not "the physics update" but "the O(n²) circle–circle separation pass repeated `collisionPasses` times per frame."

### 6.2 Complexity

State the loop complexity with n defined explicitly.

Example: "The outer collision loop is O(n² × collisionPasses) per frame where n = number of packed circles (determined by `maxFibIndex`). At default settings: n ≈ 10, collisionPasses = 8, giving ~800 pair evaluations per frame. At maximums: n ≈ 12, collisionPasses = 16, giving ~1152 pair evaluations per frame multiplied by two passes (separation + velocity), for ~2304 total evaluations."

### 6.3 Extreme parameter values

For each parameter with a significant performance impact at its maximum value, state what happens:

- `collisionPasses: 16` — doubles the separation and velocity resolution cost vs. default 8
- `maxFibIndex: 12` — packs ~12 circles (bounded); does not approach dangerous n²
- `velocityGrowth: 1.05` — circles accelerate rapidly; at high speed, `_bounceWalls` clamps to boundary but multiple rapid bounces per frame may occur, increasing colour computation

### 6.4 Frame budget

At `defaultFps = 60`, the available frame time is `1000/60 ≈ 16.7 ms`. Estimate which portions of the loop consume most of this budget and whether the generator is likely to drop frames at default settings or only at extreme parameter combinations.

### 6.5 Web Worker feasibility

State whether the render logic could be offloaded to a Web Worker. Blocking dependencies to name:
- p5 context (`p` object) — not transferable to a Worker without OffscreenCanvas
- `this` state that is mutated in place — state would need serialisation or SharedArrayBuffer
- DOM dependencies — none allowed in generator scripts, so this should be clean

If feasible with OffscreenCanvas: say so. If blocked by p5 instance dependency: say so.

### 6.6 Specific mitigation candidates

List, as flagged items (not fixes), anything that could reduce cost:
- Spatial index (e.g. grid or KD-tree) to reduce collision checks from O(n²) to O(n log n)
- Precomputed collision pairs (valid for static circle layouts)
- Adaptive `collisionPasses` based on velocity magnitude
- OffscreenCanvas with p5 in Worker (if p5 supports it)

---

## Step 7 — Write `feature-parity.md`

Three required sections:

### 7.1 Feature inventory

Read each legacy doc and extract every feature it describes. For each feature, record its status in the live source. If no legacy docs exist, record that and explain what the live source alone can confirm about intended features.

| Feature | Legacy source | Status in live source | Notes |
| --- | --- | --- | --- |
| Fibonacci-radius circle packing | audit.md | Confirmed | Implemented via `_packFrontChain` |
| User-adjustable restitution | spec.md | Confirmed | `params.restitution` parameter, range 0.5–1.0 |
| WebGL rendering | spec.md | Absent | Source uses p5 2D context, not WebGL |

### 7.2 Host feature audit

Check each host-level feature and whether the generator uses it:

| Host feature | Used? | Notes |
| --- | --- | --- |
| Presets | Yes — 3 presets | Classic, Bouncy, Dense |
| INFO tab | Yes | `description` field present |
| Animation config | Yes | type: infinite, defaultFps: 60 |
| Export config | Default | No explicit override; host provides PNG export |

Note any host feature the generator could use but does not (e.g. `animatableParams` list for phase animation, seeded RNG for deterministic export).

### 7.3 Parity holes

Explicit numbered list of every gap:

1. No seeded randomness — if any `Math.random()` calls exist, frame exports will not be deterministic
2. No `animatableParams` declared — the host cannot identify which parameters are safe to animate in a sequence export

"No legacy docs were located" is a valid entry only when the archive genuinely has no legacy files.

---

## Step 8 — Write `issues-and-conflicts.md`

Two required sections plus a carry-over section:

### 8.1 Standards compliance check

Run through every item below. Record pass or a specific failure for each.

**p5 generator rules** (skip for 2D generators):
- [ ] `p.noLoop()` called in `p5Setup` — pass/fail + evidence
- [ ] `createCanvas()` not called — pass/fail
- [ ] `loop()` not called internally — pass/fail
- [ ] Animation driven by host, not internal — pass/fail

**All generator rules:**
- [ ] No `document.*` / `window.*` / `.innerHTML` / `.createElement` — pass/fail
- [ ] No `requestAnimationFrame` / `setInterval` / `setTimeout` for animation — pass/fail
- [ ] Canvas output uses VGA palette only, or uses algorithmic colour space with explicit justification — pass/fail + detail
- [ ] No algorithm inline that exists in `assets/js/shared/algorithms/` — pass/fail (check geometry, noise, physics modules)
- [ ] State stored on `this`, not in module-level mutable variables (unless deliberately module-scoped) — pass/fail
- [ ] `destroy()` or equivalent cleanup implemented or not needed — pass/fail

### 8.2 Bug and risk detection

For each finding, use the record format from `issue-flagging.md`:

```
[SEVERITY] [CATEGORY] Short description
Location: function name or line reference
Evidence: exact quote or paraphrase from source
Impact: what goes wrong or is missing
```

Look for:
- Division by zero without a guard (e.g. dividing by a sum that could be zero)
- Unbounded array growth (a `.push()` inside a loop without a corresponding `.shift()` or length check)
- Off-by-one in index or loop bound
- State not reset on rebuild (a `this.*` variable that is not reinitialised when `_buildCircles` or equivalent is called)
- Parameters not applied (a key declared in `parameters` that never appears in the render logic)

### 8.3 Performance risks (carried from Step 6)

Copy the flagged items from `performance.md` §6 in issue format.

### 8.4 Parity holes (carried from Step 7)

Copy each parity hole from `feature-parity.md` as a `[NOTE] [PARITY]` issue.

---

## Step 9 — Write `migration-log.md`

Record exactly what was done in this migration. Future readers must be able to reconstruct the state of inputs and outputs from this file alone.

```markdown
# <Title> — Migration Log

## Date

<ISO date: YYYY-MM-DD>

## Inputs Used

- live script: `assets/js/tools/generators/scripts/<category>/<id>.gen.js`
- <legacy file 1>: `<path>` — classification: <class>
- <legacy file 2>: `<path>` — classification: <class>
- (or: no legacy docs located)

## Archive Outputs

- `reference/generators/<id>/source/<id>.gen.js` — copied
- `reference/generators/<id>/legacy-docs/<filename>` — copied (or: no legacy docs)

## Pack Files Produced

- source-reference.md
- description.md
- mechanisms.md
- ui-layout.md
- performance.md
- feature-parity.md
- issues-and-conflicts.md
- migration-log.md (this file)

## Classification Summary

- live script: `functional source/reference tool`
- <legacy file>: <class>
- legacy bundle overall: <class>

## Notes

Any decisions made during migration that are not obvious from the pack files themselves.
```

---

## Completion Gate

Before marking a generator's migration as done, verify every file against the pass criteria in `review-and-correction-loop.md`. A score of 8/8 files passing is required. Do not close the todo until the score is confirmed.
