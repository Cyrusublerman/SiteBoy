# Distort Tool — Module Interrogation Questionnaire

Target: every file under `assets/js/tools/processors/distort/`.
Purpose: identify needed changes by forcing pass/fail determinations across compliance, parity, architecture, and necessity.

Severity tags follow `issue-flagging.md`: `ERROR` (runtime fault / wrong output), `WARN` (standards violation, not broken), `NOTE` (gap / ambiguity / escalation).

---

## Part A — Per-Module Node Questionnaire (apply to each of the 69 `*Node.js`)

### A1. Existence Justification

| # | Question | Expected answer | Failure severity |
|---|----------|-----------------|------------------|
| A1.1 | Does this module produce a visually distinct output that no other module in the registry can produce? | YES with evidence | NOTE — candidate for removal or merge |
| A1.2 | If this module shares a category with another module, state the specific property that distinguishes them. | Concrete distinction (not "different params") | NOTE — redundancy risk |
| A1.3 | Does the module name in the registry contain the word "MODULE"? | NO | WARN — redundant qualifier per §5h of build issues |
| A1.4 | Is there a one-sentence `description` in the registry entry (≤80 chars, sentence case)? | YES | WARN — missing registry description |

### A2. Factory Pattern Compliance

| # | Question | Expected answer | Failure severity |
|---|----------|-----------------|------------------|
| A2.1 | Does the file use `createEffectModule({...})` (not class extension)? | YES | WARN — legacy pattern |
| A2.2 | Does the file contain `class`, `constructor`, or `this`? | NO | WARN — factory contract violation |
| A2.3 | Is the export a `const <Name>Node = createEffectModule({...})`? | YES | WARN — naming violation |
| A2.4 | Does the file import from `core/` other than `core/EffectModule.js`? | NO | WARN — tier violation (module reaching into host) |
| A2.5 | Does the file import from `ui/`? | NO | ERROR — module must not touch UI |

### A3. apply() Signature and Contract

| # | Question | Expected answer | Failure severity |
|---|----------|-----------------|------------------|
| A3.1 | What is the declared `apply()` signature? | `apply(src, dst, w, h, p, ctx, modulate)` | WARN — incomplete signature |
| A3.2 | If any params are `driveable: true`, is `modulate` present in the signature? | YES (or no driveable params) | WARN — driver slots non-functional |
| A3.3 | For each `driveable: true` param: is `modulate(key, pixelIndex)` called inside the pixel loop? | YES per driveable param | WARN — advertised driver slot produces no effect |
| A3.4 | Does `apply()` read any param via `this.params[key]` instead of `p[key]`? | NO | WARN — bypasses factory resolution / preview caps |
| A3.5 | Does `apply()` write to `dst`? | YES | ERROR — no output produced |
| A3.6 | Does `apply()` return without writing to `dst` under any code path? | NO (or guarded with fallback) | ERROR — silent black output |

### A4. Worker Context Safety

| # | Question | Expected answer | Failure severity |
|---|----------|-----------------|------------------|
| A4.1 | Does the file contain `document.*`? | NO | ERROR — Worker crash |
| A4.2 | Does the file contain `window.*`? | NO | ERROR — Worker crash |
| A4.3 | Does the file contain `fetch()` or `XMLHttpRequest`? | NO | ERROR — Worker crash |
| A4.4 | Does the file contain `requestAnimationFrame`, `setInterval`, or `setTimeout`? | NO | ERROR — Worker crash |
| A4.5 | Does the file contain `console.*`? | NO | WARN — debug noise in production |

### A5. Preview Strategy

| # | Question | Expected answer | Failure severity |
|---|----------|-----------------|------------------|
| A5.1 | For each param that scales cost (iterations, radius, passes, steps, gridSize): does it declare `previewMax`? | YES per scaling param | WARN — interactive perf risk |
| A5.2 | Does `apply()` contain an inline `ctx.quality === 'preview'` check? | Acceptable only if `previewMax` alone is insufficient | NOTE if redundant with previewMax |
| A5.3 | If both `previewMax` and inline check exist for the same param: is the inline check dead code? | If redundant → dead code | NOTE — remove dead code |
| A5.4 | What is the render cost class at PREVIEW resolution with capped params? | A or B (< 100ms) | WARN if C or D |

### A6. Algorithm Library Usage

| # | Question | Expected answer | Failure severity |
|---|----------|-----------------|------------------|
| A6.1 | Does the module's core algorithm exist in `assets/js/shared/algorithms/`? | State which function | — |
| A6.2 | If YES: does the module import and delegate to it? | YES | WARN — inline reimplementation |
| A6.3 | If NO: is the inline algorithm non-trivial (>15 lines)? | If YES → escalation candidate | NOTE [ESCALATION] |
| A6.4 | Does the algorithm import path match the algorithm library's actual export? | YES | ERROR — import will fail |

### A7. Parameter Definition Audit

| # | Question | Expected answer | Failure severity |
|---|----------|-----------------|------------------|
| A7.1 | Does every `range` param have `min`, `max`, `step`, and `value`? | YES | ERROR — NodePanel will render broken slider |
| A7.2 | Are all param keys camelCase? | YES | WARN |
| A7.3 | Are all labels SCREAMING CASE and ≤16 chars? | YES | WARN |
| A7.4 | Is there at least one tier-3 param? | YES | WARN |
| A7.5 | For `select` type params: does `options` array exist and contain ≥2 values? | YES | ERROR — dropdown with 0–1 options |
| A7.6 | For each param with `driveable: true`: does per-pixel modulation make physical/mathematical sense for this algorithm? | YES with reasoning | NOTE — if no, driveable should be false |
| A7.7 | Do any param ranges allow values that cause mathematical instability (division by zero, negative sqrt, CFL violation)? | NO, or guarded in apply() | ERROR if unguarded, WARN if edge case |

### A8. Pixel Safety

| # | Question | Expected answer | Failure severity |
|---|----------|-----------------|------------------|
| A8.1 | Are all pixel buffer index calculations clamped to `[0, w-1]` × `[0, h-1]`? | YES | ERROR — row-wrap or OOB artefacts |
| A8.2 | Are all divisions guarded against zero? | YES | ERROR — NaN propagation |
| A8.3 | Are all `Math.sqrt()` inputs guaranteed non-negative? | YES | ERROR — NaN propagation |
| A8.4 | Does the module allocate typed arrays inside the pixel loop? | NO | NOTE — GC pressure |

### A9. Feature Parity

| # | Question | Expected answer | Failure severity |
|---|----------|-----------------|------------------|
| A9.1 | Does a component-level doc exist at `blog/docs/components/distort/modules/<type>.md`? | YES | NOTE — no legacy spec to compare |
| A9.2 | For each feature described in the component-level doc: is it present in the live source? | List each feature with Confirmed / Absent / Changed | NOTE [PARITY] per absent/changed feature |
| A9.3 | Does the component-level doc describe features that contradict the live source? | List contradictions | NOTE [CONFLICT] per contradiction |
| A9.4 | Does the live source contain features NOT described in any documentation? | List undocumented features | NOTE — doc gap |

### A10. Vector Module Extras (only if `isVector: true`)

| # | Question | Expected answer | Failure severity |
|---|----------|-----------------|------------------|
| A10.1 | Does the config declare `isVector: true`? | YES | — |
| A10.2 | Does the config include `applyVector(src, w, h, p, ctx)`? | YES | WARN — vector path missing, SVG export broken |
| A10.3 | Does `applyVector` return a LineSet / geometry object? | YES | ERROR — pipeline expects geometry |
| A10.4 | Does `apply()` use `vectorToRaster` from `nodes/bridge/node-adapters.js`? | YES | WARN — pixel path should rasterise vector output |

### A11. Reference Pack Completeness

| # | Question | Expected answer | Failure severity |
|---|----------|-----------------|------------------|
| A11.1 | Does a reference pack exist at `reference/distort/<type>/`? | YES with 8 files | NOTE — undocumented module |
| A11.2 | Do the pack files match the current templates (not legacy template with `ctx.pool`, `this.getModulated`, class-extension checks)? | YES | NOTE — template drift |
| A11.3 | Does `issues-and-conflicts.md` in the pack have actual findings (not all-pass with zero issues)? | YES (at minimum a NOTE) | NOTE — audit likely superficial |

---

## Part B — Core System Questionnaire (apply to each file in `core/`)

### B1. Necessity and Ownership

| # | Question | File(s) | Expected answer | Failure severity |
|---|----------|---------|-----------------|------------------|
| B1.1 | Is this file imported by any other file in the distort tree or the main entry? | Each core file | YES with import list | WARN — orphaned file |
| B1.2 | Does this file duplicate functionality that exists in `assets/js/shared/` or `assets/js/core/`? | Each core file | NO | WARN — ownership violation |
| B1.3 | Is `core/Sampler.js` imported anywhere in the repository? | Sampler.js specifically | Likely NO — flagged as orphan by exploration | NOTE — remove if unused |

### B2. AppState.js

| # | Question | Expected answer | Failure severity |
|---|----------|-----------------|------------------|
| B2.1 | Does AppState contain mutable state that should instead live in individual nodes? | NO — AppState owns global tool state only | WARN if node-level state leaks in |
| B2.2 | Are all fields used by at least one consumer? | YES per field | NOTE — dead state |
| B2.3 | Does AppState emit events or use a pub/sub pattern for state changes? | Document the pattern | — |

### B3. Pipeline.js

| # | Question | Expected answer | Failure severity |
|---|----------|-----------------|------------------|
| B3.1 | Does Pipeline pass `modulate` as the 7th argument to every node's `apply()`? | YES | ERROR — no module can use drivers if Pipeline doesn't pass it |
| B3.2 | Does Pipeline resolve `previewMax`/`previewMin` before calling `apply()`? | YES (or factory does) | WARN — preview caps bypassed |
| B3.3 | Does Pipeline handle vector nodes (calling `applyVector` then `vectorToRaster`)? | YES | ERROR — vector modules broken |
| B3.4 | Does Pipeline handle the LUT path for `isLUT` modules? | YES if LUT modules exist | WARN |
| B3.5 | Does Pipeline handle node mask application? | YES | WARN — mask feature broken |
| B3.6 | Does Pipeline correctly rotate buffers between nodes (output of node N → input of node N+1)? | YES | ERROR — stack ordering broken |
| B3.7 | Does Pipeline catch or propagate errors from individual node `apply()` calls? | Document behaviour | NOTE if silent failures |

### B4. WorkerBridge.js

| # | Question | Expected answer | Failure severity |
|---|----------|-----------------|------------------|
| B4.1 | Does WorkerBridge correctly instantiate `RenderWorker.js` via `new URL()` / `new Worker()`? | YES | ERROR — rendering fails |
| B4.2 | Does WorkerBridge implement debounce for rapid parameter changes? | YES | WARN — render thrashing |
| B4.3 | Does WorkerBridge implement timeout/fallback for hung workers? | YES | WARN — UI hangs on bad modules |
| B4.4 | Does WorkerBridge transfer buffers (Transferable) or copy them? | Document — transfer is faster | NOTE |
| B4.5 | Does WorkerBridge handle worker errors / `onerror`? | YES | WARN — silent failures |

### B5. RenderWorker.js

| # | Question | Expected answer | Failure severity |
|---|----------|-----------------|------------------|
| B5.1 | Does RenderWorker import and use its own `AppState` + `Pipeline` instances? | YES | — |
| B5.2 | Does RenderWorker handle the `render` message type? | YES | ERROR — primary function broken |
| B5.3 | Does RenderWorker handle the `sequence` message type? | YES | ERROR — animation broken |
| B5.4 | Does RenderWorker post `ready` on initialisation? | YES | ERROR — bridge won't know worker is alive |
| B5.5 | Does RenderWorker import `REGISTRY`? | YES | ERROR — no modules available |

### B6. Other Core Files

| # | Question | File | Expected answer | Failure severity |
|---|----------|------|-----------------|------------------|
| B6.1 | Does EffectModule.js produce classes extending EffectNode? | EffectModule.js | YES | ERROR — factory broken |
| B6.2 | Does EffectModule.js resolve `previewMax`/`previewMin` in the produced class's apply wrapper? | EffectModule.js | YES | WARN — preview caps not enforced |
| B6.3 | Does EffectModule.js wire `modulate` through to the config's `apply`? | EffectModule.js | YES | ERROR — all driver systems broken |
| B6.4 | Does History.js correctly snapshot and restore via Recipe? | History.js | YES | WARN — undo/redo broken |
| B6.5 | Does ExpressionEval.js handle per-pixel and per-frame variable scopes correctly? | ExpressionEval.js | YES | WARN — expressions produce wrong values |
| B6.6 | Does SeededRNG produce deterministic output for the same seed? | SeededRNG.js | YES | WARN — reproducibility broken |
| B6.7 | Does BufferPool track and release allocations to prevent memory leaks? | BufferPool.js | YES | WARN — memory leak |

---

## Part C — UI Component Questionnaire (apply to each file in `ui/`)

### C0. Duplication Check

| # | Question | Expected answer | Failure severity |
|---|----------|-----------------|------------------|
| C0.1 | Does `distort-main.js` import this UI component from `./ui/` or from `assets/js/shared/components/tool/distort/`? | Document which path | — |
| C0.2 | If `distort-main.js` imports from `shared/`, is the `./ui/` copy dead code? | If unused → dead code | NOTE — remove dead file |
| C0.3 | If both copies exist, are they identical? | Document differences | WARN — fork drift |
| C0.4 | Which copy is authoritative? | The one imported by `distort-main.js` | — |

### C1. DistortToolbar

| # | Question | Expected answer | Failure severity |
|---|----------|-----------------|------------------|
| C1.1 | Does the SOURCE cell label follow the format `SOURCE: {filename} \| ADD SOURCE +`? | YES | WARN — per build issues §2 |
| C1.2 | Does the SOURCE cell use a `▾` glyph (dropdown signifier) for a file picker action? | NO — false signifier | WARN |
| C1.3 | Are all cell widths F-derived (not percentages)? | YES | WARN — per build issues §3 |
| C1.4 | Do all cell widths sum to exactly 100% of the toolbar? | YES — no gap at right edge | WARN |
| C1.5 | Does the EXPORT dropdown match the width of its parent EXPORT button? | YES | WARN |
| C1.6 | Does PREVIEW/FULL communicate the consequence of the toggle (not just the mode name)? | YES | WARN — per build issues §7 |
| C1.7 | Are FIT/FILL/ACTUAL three separate buttons? Should they be a cyclic button on mobile? | Document current state vs mobile needs | NOTE |

### C2. EffectStack

| # | Question | Expected answer | Failure severity |
|---|----------|-----------------|------------------|
| C2.1 | Does the ADD EFFECT button share borders with adjacent regions (not floating)? | YES | WARN — per build issues §4a |
| C2.2 | Is there a double border between the button and the content area? | NO | WARN — per build issues §4b |
| C2.3 | Does the empty state contain redundant placeholder text? | NO | WARN — per build issues §4c |
| C2.4 | Is the `+` glyph on the right of the label (not left)? | YES — right side | WARN — per build issues §4d |
| C2.5 | Are all spacings F-derived? | YES | WARN — per build issues §4e |

### C3. CategoryPicker

| # | Question | Expected answer | Failure severity |
|---|----------|-----------------|------------------|
| C3.1 | Is text left-aligned (not centred)? | YES | WARN — per build issues §5a |
| C3.2 | Is there exactly one close mechanism (not two)? | YES — one close | WARN — per build issues §5c |
| C3.3 | Is the search input labelled "SEARCH" (not "FILTER")? | YES | WARN — per build issues §5d |
| C3.4 | Are collapsible sections closed by default? | YES | WARN — per build issues §5e |
| C3.5 | Do collapsible sections match the site's established collapsible pattern? | YES | WARN — per build issues §5f |
| C3.6 | Do module items show a hover tooltip with a one-sentence description? | YES | NOTE — missing feature (§5g) |
| C3.7 | Have all "MODULE" prefixes been removed from module names in the picker? | YES | WARN — per build issues §5h |
| C3.8 | Does the picker float on its own layer (not displacing sidebar content)? | YES — own layer | WARN — per build issues §5i |
| C3.9 | Does the picker have complete borders (left, right, bottom)? | YES | WARN — per build issues §5i |

### C4. ViewportCanvas

| # | Question | Expected answer | Failure severity |
|---|----------|-----------------|------------------|
| C4.1 | When no source is loaded, does the canvas display a centred "UPLOAD IMAGE" affordance? | YES — clickable + drag-drop | WARN — per build issues §8 |
| C4.2 | Does the empty state support drag-and-drop file loading? | YES | NOTE — missing feature |
| C4.3 | Does the empty state box use F-derived dimensions? | YES | WARN |
| C4.4 | Does the canvas use `AnimationFoundation.AnimationLoop` (not manual RAF)? | YES | ERROR — per rules |

### C5. NodePanel

| # | Question | Expected answer | Failure severity |
|---|----------|-----------------|------------------|
| C5.1 | Does NodePanel render controls from `params` only (not hardcoded UI per module)? | YES | WARN — per rules.md §2 |
| C5.2 | Does NodePanel support all param types (`range`, `select`, at minimum)? | YES | ERROR — some params unrenderable |
| C5.3 | Does NodePanel render the driver (+D) slot for `driveable: true` params? | YES | WARN — driver UI missing |
| C5.4 | Does NodePanel render mask controls? | YES | WARN — mask feature inaccessible |

### C6. TransportStrip

| # | Question | Expected answer | Failure severity |
|---|----------|-----------------|------------------|
| C6.1 | Does TransportStrip use `AnimationFoundation.AnimationLoop`? | YES | ERROR — per rules |
| C6.2 | Does TransportStrip drive `WorkerBridge.queueRender` for each frame? | YES | WARN — animation doesn't render |
| C6.3 | Does TransportStrip force PREVIEW quality while animating? | YES | WARN — per rules.md §4 |

### C7. DriverPicker

| # | Question | Expected answer | Failure severity |
|---|----------|-----------------|------------------|
| C7.1 | Does DriverPicker use `ExpressionEval` for expression-based drivers? | YES | WARN |
| C7.2 | Does DriverPicker correctly distinguish per-frame vs per-pixel scope? | YES | WARN — wrong scope → wrong output |

### C8. VariationGrid

| # | Question | Expected answer | Failure severity |
|---|----------|-----------------|------------------|
| C8.1 | Is `drawVariationGrid` used by any component? | YES with import evidence | NOTE — remove if unused |

---

## Part D — System-Level Questionnaire

### D1. Registry Integrity

| # | Question | Expected answer | Failure severity |
|---|----------|-----------------|------------------|
| D1.1 | Does `registry.js` import every `*Node.js` file under `nodes/`? | YES — 69 imports for 69 modules | WARN per missing module |
| D1.2 | Does every imported module appear in the `REGISTRY` export? | YES | WARN — imported but unregistered |
| D1.3 | Are all `type` values unique across the registry? | YES | ERROR — collision breaks pipeline |
| D1.4 | Do all `category` values match a defined category set? | YES | WARN — orphaned category |
| D1.5 | Does every registry entry have a `description` field? | YES | WARN — CategoryPicker tooltip broken |

### D2. File Hygiene

| # | Question | Expected answer | Failure severity |
|---|----------|-----------------|------------------|
| D2.1 | List all files in `distort/` that are not imported by anything. | Should be empty (except entry point) | NOTE per orphan |
| D2.2 | Are the `distort/ui/` files used, or does `distort-main.js` import from `shared/components/tool/distort/`? | Document which set is live | NOTE — dead code if unused |
| D2.3 | If both UI paths exist: which is newer, which has more features, which should survive? | Single authoritative answer | WARN — fork must be resolved |
| D2.4 | Does `core/Sampler.js` have any importers? | Likely NO | NOTE — remove |

### D3. Template / Guide Alignment

| # | Question | Expected answer | Failure severity |
|---|----------|-----------------|------------------|
| D3.1 | Does `issues-and-conflicts.template.md` reference `ctx.pool`? | Should reference typed arrays (no ctx.pool per build-module.md §3) | NOTE — template outdated |
| D3.2 | Does the template reference `this.getModulated(...)`? | Should reference `modulate(key, i)` (factory pattern) | NOTE — template outdated |
| D3.3 | Does the template reference "Class extends EffectNode"? | Should reference `createEffectModule` factory | NOTE — template outdated |
| D3.4 | Does the template's `apply()` signature match the guide's? | `apply(src, dst, w, h, p, ctx, modulate)` — both must agree | NOTE — template outdated |

### D4. Cross-Cutting Defect Patterns

These questions identify issues that are likely systemic (present in many/all modules simultaneously). Answer once, then list affected modules.

| # | Question | How to detect | Expected result |
|---|----------|---------------|-----------------|
| D4.1 | How many modules omit `modulate` from their `apply()` signature? | Search all `*Node.js` for `apply(` and check arg count | List all; likely most/all |
| D4.2 | How many modules declare `driveable: true` on at least one param but never call `modulate()`? | Cross-reference driveable params with modulate calls | List all |
| D4.3 | How many modules have redundant inline `ctx.quality` checks alongside `previewMax` declarations? | Search for `ctx.quality` or `ctx?.quality` in apply() | List all |
| D4.4 | How many modules have `apply()` signatures shorter than the full 7-arg form? | Compare declared args | List all and their actual signature |
| D4.5 | How many modules allocate typed arrays inside apply() that could be pooled or hoisted? | Search for `new Float32Array` / `new Uint8ClampedArray` inside apply | List all |

### D5. Responsive and Mobile

| # | Question | Expected answer | Failure severity |
|---|----------|-----------------|------------------|
| D5.1 | Do PIPELINE and CANVAS tabs exist in both portrait and landscape? | YES — consistent navigation | WARN — per build issues §6a |
| D5.2 | Does the toolbar adapt for small viewports (readable text, adequate tap targets)? | YES | WARN — per build issues §6b |
| D5.3 | Does portrait mode render sidebar sections correctly? | YES | ERROR — per build issues §6d (rendering failure) |

### D6. Entry Point and Wiring

| # | Question | Expected answer | Failure severity |
|---|----------|-----------------|------------------|
| D6.1 | Does `distort-main.js` correctly wire AppState → Pipeline → WorkerBridge → ViewportCanvas? | YES | ERROR — tool doesn't render |
| D6.2 | Does `distort-main.js` contain the `_sourceReadout` sidebar duplication? | Should be removed | WARN — per build issues §1 |
| D6.3 | Does `distort-main.js` build the tool via `ToolBase`? | YES | WARN |
| D6.4 | Does the tool's `destroy()` method clean up all component instances, animators, and workers? | YES | WARN — memory leak |

---

## Part E — Execution Protocol

### E1. Triage Order

Run the questionnaire in this order to maximise early discovery of systemic issues:

1. **D4** (cross-cutting defects) — reveals patterns affecting many modules at once
2. **D2** (file hygiene) — eliminates dead code before auditing it
3. **B3** (Pipeline) — if Pipeline doesn't pass `modulate`, no module-level driver fix matters
4. **B6.3** (EffectModule factory) — same: if factory doesn't wire modulate, all modules are blocked
5. **Part A** per module, prioritising modules with `driveable: true` params
6. **Part C** (UI components)
7. **D1, D3, D5, D6** (remaining system checks)

### E2. Output Format

For each module or component interrogated, produce a findings record:

```
## <Name> — Findings

File: <path>
Date: <ISO date>

| Question | Answer | Severity | Action needed |
|----------|--------|----------|---------------|
| A2.1     | PASS   | —        | —             |
| A3.1     | FAIL: apply(src, dst, w, h, p) | WARN | Add ctx, modulate args |
| ...      | ...    | ...      | ...           |

Issues (issue-flagging.md format):

[WARN] [STANDARDS] ...
Location: ...
Evidence: ...
Impact: ...
```

### E3. Completion Criteria

The questionnaire is complete for a module when:
- Every applicable question in Parts A and (if UI) C has a PASS/FAIL answer
- Every FAIL has a severity tag and a concrete action
- Every action is recorded in `issues-and-conflicts.md` using `issue-flagging.md` format
- No question is answered "unknown" — if the answer requires reading the source, read the source

The questionnaire is complete for the tool when:
- All 69 modules have been interrogated via Part A
- All 8 UI components have been interrogated via Part C
- All core files have been interrogated via Part B
- All system-level questions in Part D have been answered
- Cross-cutting defect counts (D4) are finalised with full affected-module lists
