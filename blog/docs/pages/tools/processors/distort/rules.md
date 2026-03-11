# DISTORT Rules

Rules specific to all effect modules and the DISTORT host tool.

## 1. Non-Optional Host Parts

These are mandatory — always present:
- Top bar (DistortToolbar): source cell, UNDO, REDO, FIT, FILL, ACTUAL, QUALITY, EXPORT
- Sidebar: PIPELINE tab, CANVAS tab
- Canvas viewport (ViewportCanvas): zoom, pan, display modes
- Stack block in PIPELINE: `[+ ADD EFFECT]` button + EffectStack

These are conditional:
- Transport strip iff `frameCount > 1`
- EXPORT SVG iff all nodes in stack implement `buildGeometry()`
- CategoryPicker iff `[+ ADD EFFECT]` has been clicked (replaces stack in sidebar)

## 2. Sidebar Law

Two tabs only: `PIPELINE` and `CANVAS`.

Effect modules must not define:
- Sidebar tabs
- Sidebar DOM
- Toolbar controls
- Custom export panels

The NodePanel derives all module controls from `paramDefs`. The module may only influence the UI through:
- `paramDefs` — drives all tier-3 through tier-5 controls
- `type` / `category` — determines placement in CategoryPicker
- `buildGeometry()` — presence enables EXPORT SVG

## 3. UI Law

Required:
- Top bar is the sole owner of display-mode controls (FIT/FILL/ACTUAL) and export actions
- Sidebar is the sole owner of pipeline and canvas configuration
- Canvas is the sole output surface

Forbidden:
- Controls rendered in or over the canvas area
- A second sidebar or right-side panel
- Popup or modal for ADD EFFECT or driver editing (both must be inline)
- Variation grid as a floating panel (renders into ViewportCanvas surface)
- UNDO/REDO in sidebar
- Display mode in CANVAS tab
- Quality toggle in CANVAS tab
- Global seed in PIPELINE tab
- Node category colour badges or icons
- Custom font-size on node labels

## 4. Animation Law

All animation timing uses `AnimationFoundation.AnimationLoop`.

Forbidden in all module files and the distort tool:
- `requestAnimationFrame(...)` or `cancelAnimationFrame(...)`
- `setInterval(...)` or `clearInterval(...)` for animation
- `setTimeout(...)` used to drive frame updates

Required:
- Transport strip calls `animator.start()` / `animator.pause()` / `animator.stop()` — no custom loop
- Frame progression comes from `AnimationLoop` tick → `AppState.setFrame()` → `WorkerBridge.queueRender(frame)`
- Animation always plays at PREVIEW quality; switching to FULL pauses automatically

## 5. Module Config Law

Each module must satisfy:
- One `type` string: lowercase, no spaces, no hyphens
- One `category` string: matches a registered category name
- `paramDefs` object: at minimum one tier-3 entry
- `apply(src, dst, w, h, ctx)` method: the pixel render function

`paramDef` field requirements:

| Field | Type | Rule |
| --- | --- | --- |
| key | string | camelCase; unique within module |
| label | string | UPPERCASE; max 16 chars |
| type | string | `'range'`, `'select'`, or `'toggle'` |
| min, max, step | number | required for `range` |
| default | any | required; must be within valid range |
| tier | number | 3, 4, or 5; omit for type-specific tier 2 |

## 6. Worker Law

All pipeline computation runs inside `RenderWorker` (Web Worker). Module `apply()` and `buildGeometry()` execute off the main thread.

Forbidden in any module file:
- `document.*` — any DOM access
- `window.*` — any browser global
- `navigator.*`, `fetch()`, `XMLHttpRequest` — any network or browser API
- `requestAnimationFrame`, `setInterval`, `setTimeout`
- `console.*` (in production; permitted for development)

A module that accesses browser globals will throw when executed in the Worker context. This is an ERROR severity issue, not a warning.

## 7. Driver Law

Any `range`-type paramDef entry may have a driver attached.

Driver types:
- `none` — static param value
- `image` — greyscale map sampled per-pixel; `getModulated(key, pixelIdx, ctx)` returns driven value
- `expression` — math string evaluated per-pixel or per-frame; same method

Module `apply()` must call `this.getModulated(key, pixelIdx, ctx)` (not `this.params[key]`) for any param intended to be driveable. A param declared as `range` but read via `this.params[key]` in the pixel loop is not actually driveable — it is a WARN.

Expression scope classification:
- Per-frame scope — expression contains only `frame`, `frameCount`, `t`, `seed`, constants. Evaluated once per render.
- Per-pixel scope — expression contains any spatial var (`r`, `g`, `b`, `a`, `lum`, `x`, `y`, `u`, `v`). Evaluated W×H times per render. Pipeline pre-computes `ctx.pixelVars` when any per-pixel expression is active.

## 8. Cache/Invalidation Law

`Pipeline` maintains a dirty cache per node. Modules must not manage their own caches outside `this._cache`.

Invalidation rules (enforced by AppState / EffectStack):

| Event | Nodes invalidated |
| --- | --- |
| Param change on node N | Node N and all downstream |
| Node enable/disable | Node N and all downstream |
| Node reorder | All nodes from min(from, to) to end |
| Node add | All nodes from insertion point to end |
| Node remove | All nodes from deletion point to end |
| Source image change | All nodes |
| Global seed change | All nodes |
| Quality mode change | All nodes (resolution change) |
| Solo mode change | All nodes |

Cache memory ceiling: 128MB total. Pipeline evicts front-of-stack caches first when ceiling is exceeded.

## 9. Preview Strategy Law

Modules with iteration counts, radius params, or other expensive scaling params must cap their cost in PREVIEW quality.

Rule: read `ctx.quality` in `apply()` and apply caps when `ctx.quality === 'preview'`.

Required preview caps by category:

| Category | Required cap |
| --- | --- |
| Physics (reaction-diffusion, cellular automata) | 5 iterations |
| Accumulation (iterative rewarp) | 2 passes |
| Generative (paint stroke) | 20 iterations |
| Blur (median, bilateral) | Radius capped at 3px |

A module that does not implement PREVIEW caps and has O(n × iterations) cost is a WARN.

## 10. Documentation Law

Per-module documentation packs must capture:
- What the module is (algorithm name, image effect, scope boundary)
- What files own it (source node path, registry entry, algorithm imports)
- How it works (algorithm with formulas, apply() execution order, preview strategy)
- What UI it exposes (all paramDef tiers, mask controls, modulation targets)

Do not duplicate tool-level rules inside per-module packs. Link upward to this folder instead.
