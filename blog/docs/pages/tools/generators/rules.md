# Generator Rules

Rules specific to generators on the unified generator host.

## 1. Non-Optional Host Parts

These are mandatory for the page:
- top toolbar
- canvas viewport
- generator selector
- `FIT/FILL/ACTUAL`
- export access
- `PARAMS` tab

These are conditional:
- `ANIMATE` tab iff animation exists
- sequencer/timeline iff animation exists
- `INFO` tab iff description exists

## 2. Sidebar Law

Generator scripts define parameters only.

Generator scripts must not define:
- sidebar tabs
- sidebar DOM
- custom toolbar controls
- custom export panels

The host derives tabs from config. The script may only influence them through:
- `parameters`
- `presets`
- `animation`
- `description`
- `export`

## 3. UI Law

Generator-specific UI must inherit the host, not compete with it.

Required:
- toolbar remains the sole display-mode owner
- sidebar remains the sole parameter owner
- canvas remains the sole output surface

Forbidden:
- overlay controls inside canvas
- custom right-side panels
- generator-local fit/fill/actual controls
- generator-local export chrome duplicating host export

## 4. Animation Law

All animation timing uses `AnimationFoundation`.

Forbidden in generator scripts:
- internal `requestAnimationFrame`
- internal `setInterval`
- internal `setTimeout` loops
- p5 `loop()`-driven playback for host-managed scripts

Required:
- frame progression comes from host playback
- same params + same frame => same output
- pause state still renders a valid single frame

## 5. Layout Decision Rules

### Tabs

Use the host default only.

Interpretation:
- parameter groups belong in `PARAMS`
- time/playback belongs in `ANIMATE`
- save/export belongs in `EXPORT`
- text description belongs in `INFO`

### Sequencer / Timeline

Use a sequencer iff the generator is frame-addressable.

That means:
- frame index changes output deterministically
- the script can render arbitrary frame `n` without replaying the full history

If this is false, the generator is not sequence-export ready.

## 6. Config Law

Each generator config must satisfy:
- one `id`
- one `title`
- one `category`
- one canvas config
- one or more parameter groups

For `2d/webgl`:
- `draw` is required

For `p5`:
- `p5Draw` is required
- `p5Setup` is optional but preferred when caching is needed

## 7. Rebuild Law

Structural params may trigger rebuild/cache refresh.

Presentation params should not.

Examples:
- particle count may rebuild data
- grid resolution may rebuild data
- display mode must not rebuild data
- zoom/pan must not rebuild data

## 8. Documentation Law

Per-generator docs must capture:
- what the generator is
- what files own it
- how it works
- what UI it exposes

Do not duplicate host rules inside per-generator packs. Link upward to this folder instead.
