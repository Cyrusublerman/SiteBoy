# Fibonacci Balls — Issues and Conflicts

## ERROR

None.

## WARN

**[STANDARDS] State stored on `SCRIPT_CONFIG` object**
`_circles`, `_canvasSize`, `_lastCfgKey` are properties of the exported `SCRIPT_CONFIG` object, mutated via `this.*` in `p5Setup`/`p5Draw`. This makes the module stateful at the export level; two simultaneous instances of the generator would share state. Standards require state to be scoped to per-invocation instances (component `this.*` in class, or closure).

**[STANDARDS] Preset format non-standard**
Presets are flat objects `{ name, key1, key2, ... }` rather than the standard `{ name, values: { key1, key2, ... } }`. Host preset loader may misparse or silently ignore values.

**[STANDARDS] Raw HSL values in `p.background`**
`p.background(0, 0, 8)` uses raw numeric HSL. While the generator correctly sets P5 colorMode to HSL, the canvas background cannot be overridden by the CSS variable system. The near-black value `l=8` is hard-coded.

**[ARCHITECTURE] `p5Setup`/`p5Draw` vs standard `draw` interface**
This generator uses `p5Setup(p, params)` and `p5Draw(p, params, frame)` hook names instead of the standard `draw(ctx, canvas, params, frame)`. It depends on the P5 host dispatching these specific method names from `SCRIPT_CONFIG`. This tight coupling means the generator is inoperable with any non-P5 host variant.

**[BUG] `velocityGrowth` causes simulation divergence**
Per-frame speed multiplication with `velocityGrowth > 1` (default 1.01) causes exponential velocity growth. After ~420 frames at 60 fps (~7 s), speed doubles. After several minutes, velocity exceeds canvas dimensions per frame, causing tunnelling. No reset or speed-capping mechanism exists. Design intent is "chaotic motion" but this creates an unusable end-state without a restart.
Recommended: add a `maxSpeed` cap or periodic normalisation.

**[STANDARDS] No `export` block**
No PNG/GIF/WebM export declared. User cannot capture output. For an infinite animation, at minimum static PNG export should be available.

**[CORRECTNESS] `canvas.width`/`canvas.height` in SCRIPT_CONFIG (610) does not reflect `fibIndexForCanvas` changes**
When `fibIndexForCanvas = 15`, the actual canvas size becomes 987×987, but `SCRIPT_CONFIG.canvas.width/height` remain 610. The host may use these values for initial canvas sizing and not resize on param change. Actual resize depends on host's P5 canvas management.

## NOTE

**[DESIGN] `_fibSeq` declared twice**
The module-level pure function `_fibSeq(n)` and `SCRIPT_CONFIG._fibSeq: null` (unused property) coexist. `SCRIPT_CONFIG._fibSeq` is never assigned and never read; it appears to be a stale placeholder from an earlier design. Dead property.

**[PERFORMANCE] `_packFrontChain` fallback (36-angle scan) iterates all existing circles**
At `N = 10`, the outer loop is 10 circles × 36 angles per failed primary placement — at most one fallback per circle. Minor, but the fallback is O(N × 36 × N) for the overlap check. At N = 10 this is 3600 ops, still acceptable.
