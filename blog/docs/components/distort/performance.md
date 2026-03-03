# DISTORT — Performance Management

Defines the full strategy for keeping the tool responsive under arbitrary pipeline complexity and animation load.

**Implementation files:**
- `core/WorkerBridge.js` — render request management
- `core/RenderWorker.js` — off-thread Pipeline execution
- `core/Pipeline.js` — sequential node execution, dirty cache, preview scale
- `core/BufferPool.js` — buffer recycling
- `core/ExpressionEval.js` — driver expression evaluation
- `core/AppState.js` — shared state including `renderProgress`, `lastRenderTime`

---

## 1. Execution Model

**Invariant:** The main thread never executes pipeline computation. All rendering occurs inside `RenderWorker` (Web Worker). The main thread sends render requests and receives pixel buffers via transferable `ArrayBuffer`.

```
Main thread                 RenderWorker (Web Worker)
────────────────────────    ────────────────────────
param change
  → WorkerBridge.queueRender()
  → postMessage(renderRequest, [pixelBuffer])
                             ← Pipeline.render()
                             ← postMessage(result, [resultBuffer])
  ← onResult(pixels)
  → ViewportCanvas.update()
```

Fallback: if `new Worker(...)` throws (e.g. local file protocol), `WorkerBridge` falls back to `Pipeline.render()` on the main thread synchronously. This is a degraded mode — the UI will lock during renders. Acceptable for development; not acceptable in production deployment.

---

## 2. Request Management

### 2.1 Current model (binary queue)

`WorkerBridge` allows exactly one render in-flight and one queued:

```
_pending = false, _queued = false  →  idle
_pending = true,  _queued = false  →  rendering
_pending = true,  _queued = true   →  rendering + one more pending
```

When a new request arrives while `_pending`, `_queued` is set `true`. On result receipt, if `_queued` the next render fires immediately. This means param changes during a long render result in exactly one follow-up render, not a storm.

### 2.2 Cancellation (required extension)

The current model has no cancellation. Under animation, if a frame render takes longer than the frame interval, renders queue indefinitely. The fix:

**Render ID token:**
```javascript
// WorkerBridge
_send() {
  this._renderId = (this._renderId || 0) + 1;
  const id = this._renderId;
  this._worker.postMessage({ ...payload, renderId: id }, [buffer]);
}

_onMessage(data) {
  if (data.renderId !== this._renderId) return;  // stale result, discard
  // ... process result
}
```

**Abort via renderId mismatch:** When a new render starts (new ID assigned), any result from the previous render is silently discarded. No actual interruption of the worker computation — the worker still runs to completion, but its result is ignored. This is acceptable for most renders (< 2s). For genuinely hung workers, see §7.

### 2.3 Debounce on param change

Slider drag fires `onChange` on every pointer-move event. Raw event → render without debounce = render storm.

**Rule:** All param change paths must debounce before calling `WorkerBridge.queueRender()`. Debounce window: **150ms**. This means:
- The render fires 150ms after the last change in a drag gesture
- For discrete changes (dropdown, toggle), no debounce — fire immediately
- For PREVIEW quality, 150ms is unnoticeable; for FULL quality it is critical

Implementation: `AppState.setParam(key, value)` calls `scheduleRender()` which debounces. `setParam` is the single entry point — components do not call `queueRender()` directly.

---

## 3. Quality Tiers

| Tier | Scale | When | Trigger |
|------|-------|------|---------|
| PREVIEW | `previewScale` (default 0.25 = 1/4 linear) | Interactive editing | Default; all param changes |
| FULL | 1.0 | Inspecting output, pre-export | Top bar QUALITY button |
| FINAL | 1.0 | Export only | EXPORT PNG / SVG / SEQUENCE actions |

**PREVIEW at 0.25 scale** = 1/16 the pixel count of a 1920×1080 source (480×270 = 129,600 pixels vs 2,073,600). Most nodes become essentially instant. Expensive nodes (bilateral, reaction-diffusion, median) remain interactive.

**Per-node PREVIEW shortcuts** (optional contract on node):
```javascript
apply(input, output, w, h, ctx) {
  const maxIter = ctx.quality === 'preview' ? 3 : this.params.iterations;
  // ...
}
```
Nodes with iteration counts (iterrewarp, reactiondiffusion, cellularautomata, paintstroke, median) **must** cap iterations in PREVIEW mode. The recommended cap per category:

| Category | PREVIEW cap |
|----------|-------------|
| Physics (reaction-diffusion, cellular automata) | 5 iterations |
| Accumulation (iterative rewarp) | 2 passes |
| Generative (paint stroke) | 20 iterations |
| Blur (median, bilateral) | Radius capped at 3px |

Caps are enforced by the node itself reading `ctx.quality`. They are not enforced by Pipeline.

---

## 4. Dirty-Node Cache

`Pipeline` skips all nodes whose output is already cached and unchanged. Cache validity per node:

```
node._cacheValid = true   →  node output has not changed since last render
node._cache               →  Uint8ClampedArray of last output at current resolution
```

**Invalidation rules (enforced by AppState / EffectStack):**

| Event | Nodes invalidated |
|-------|-------------------|
| Param change on node N | Node N and all downstream (N+1 … end) |
| Node enable/disable toggle | Node N and all downstream |
| Node reorder | All nodes from min(from, to) to end |
| Node add | All nodes from insertion point to end |
| Node remove | All nodes from deletion point to end |
| Source image change | All nodes |
| Global seed change | All nodes (seed affects every `ctx.nodeSeed`) |
| Quality mode change | All nodes (resolution change invalidates stored buffers) |
| Solo mode change | All nodes (active set changes) |

**Cache resolution guard:** If `node._cache.length !== bufSize`, the cache is considered invalid regardless of `_cacheValid`. This handles resolution changes automatically.

**Cache memory ceiling:** Each cached node output = `w × h × 4` bytes. At full resolution 1920×1080: 8.3MB per node. With 20 nodes: up to 166MB.

**Ceiling enforcement:**
```javascript
// Pipeline — after render
const CACHE_LIMIT_BYTES = 128 * 1024 * 1024; // 128MB
let totalCached = active.reduce((s, n) => s + (n._cache?.length || 0), 0);
if (totalCached > CACHE_LIMIT_BYTES) {
  // Evict oldest valid caches from the front of the stack
  for (let i = 0; i < active.length && totalCached > CACHE_LIMIT_BYTES; i++) {
    if (active[i]._cache) {
      totalCached -= active[i]._cache.length;
      active[i]._cache = null;
      active[i]._cacheValid = false;
    }
  }
}
```
Eviction strategy: front-of-stack first (early nodes are cheapest to re-render).

---

## 5. Buffer Management

### 5.1 BufferPool

`BufferPool` recycles `Uint8ClampedArray` buffers keyed by byte length. The pool prevents GC allocation pressure during animation where a new buffer would be allocated and discarded every frame.

| Limit | Value | Rationale |
|-------|-------|-----------|
| Per-size bucket cap | 8 | Prevents unbounded pool growth |
| Buffer returned via | `pool.release(buf)` | Caller's responsibility |

**Rule:** Every buffer acquired from `pool.acquire()` must be returned via `pool.release()` unless it is transferred out via `postMessage(..., [buf.buffer])` (transferable, buffer detached). Pipeline manages this correctly; custom code must do the same.

### 5.2 Transferable pixel data

`WorkerBridge._send()` transfers `pixelsCopy.buffer` to the worker (zero-copy). `RenderWorker` transfers `result.pixels.buffer` back. This means:
- Source buffer is detached on the main thread after send → `WorkerBridge` must not retain a reference
- Result buffer is detached in the worker after send → `Pipeline` must not retain a reference to the result

### 5.3 Modulation map allocation

`_buildModMaps()` allocates a `Uint8Array` per modulation map per render. At PREVIEW scale these are small (129,600 bytes for 480×270). At FULL scale: 2MB per map. Maps are not pooled (allocation is infrequent compared to pixel processing). If a node has no modulation, `ctx.modMaps = null` is passed and no allocation occurs.

---

## 6. Expression Driver Performance

Expression drivers evaluated at pixel scope (`= lum * 30`) execute once per pixel. At 1920×1080 with 1 per-pixel expression driver on a single node: **2,073,600 evaluations per render**.

### 6.1 Scope classification

`ExpressionEval.scope(expr)` classifies every expression before first use:

```
'frame'  →  expression contains only temporal vars (frame, t, frameCount, seed)
             evaluated ONCE per render; result broadcast to all pixels
'pixel'  →  expression contains any spatial var (r, g, b, lum, x, y, u, v)
             evaluated W × H times per render
```

Per-frame expressions are essentially free. Per-pixel expressions are potentially expensive.

### 6.2 Pre-computation

`Pipeline` inspects all active expression drivers before the render loop:

```javascript
// Pre-render pass
const frameVars = { frame: s.frame, frameCount: s.frameCount,
                    t: s.frame / Math.max(1, s.frameCount - 1),
                    seed: s.globalSeed };

// For each expression driver with scope === 'frame':
const cachedValue = ExpressionEval.evaluate(expr, frameVars);
// Stored in ctx.exprCache[key] → passed to getModulated() instead of re-evaluating

// For per-pixel scope: ctx.pixelVars[i] computed lazily or on-demand per pixel
```

This means temporal expressions (animations) pay zero per-pixel cost regardless of image size.

### 6.3 Evaluation timeout

Long-running or infinite-loop expressions must not hang the Worker indefinitely. Limit: **50ms wall time per expression evaluation pass**.

Implementation:
```javascript
static evaluate(expr, vars, timeoutMs = 50) {
  const deadline = performance.now() + timeoutMs;
  // Wrap loop-forming constructs — expression language is single-line,
  // so this primarily guards against accidentally crafted slow math.
  // Primary protection: expressions are single mathematical statements, no loops.
  return Function(...argNames, `"use strict"; return (${expr})`)(..argValues);
}
```

Because the expression language is single-line arithmetic (no loops, no recursion), runaway evaluation is unlikely. The timeout is a safety net, not the primary mechanism.

### 6.4 Performance warning in UI

`DriverPicker` displays a warning when a per-pixel expression driver is active on a node in a pipeline processing large images:

```
[+D●] SIGMA    ──────────●── 3.50
      DRIVER: expr ▾
      = lum * 30
      live: 12.6 at centre
      ⚠ per-pixel scope — 2M evals/frame at full res
```

Warning threshold: `w * h > 500_000` (roughly 720×720). The warning is informational — the expression still evaluates. For heavy per-pixel drives, the UI suggests switching to an image driver.

---

## 7. Hung Worker Detection

If `RenderWorker` takes longer than a timeout with no result, `WorkerBridge` must recover.

**Timeout:** 10 seconds (full quality, large image, complex stack). This is generous — a typical full-quality render should complete in < 3s.

```javascript
// WorkerBridge._send()
this._workerTimeout = setTimeout(() => {
  console.warn('[DISTORT] Worker timeout — terminating and restarting');
  this._worker.terminate();
  this._worker = null;
  this._pending = false;
  this._queued = false;
  this._initWorker();              // Rebuild worker
  this.onWorkerReset?.();          // Notify UI: show error state
}, 10_000);

// WorkerBridge._onMessage()
clearTimeout(this._workerTimeout); // Cancel on successful result
```

Worker restart is transparent to the user beyond a brief stall. No node cache survives a restart (cache lives in the worker's `Pipeline` instance). All nodes will re-render from source on the next request.

**UI notification on timeout:** `DistortToolbar.setStatus('render error — stack simplified?')`. No blocking dialog.

---

## 8. Animation Frame Pacing

### 8.1 The piling problem

`TransportStrip` drives playback via `AnimationLoop`. On each tick it calls `WorkerBridge.queueRender(frame)`. If a frame render takes 800ms and FPS is set to 24 (41ms/frame), renders pile up in the `_queued` slot and frames are dropped.

**Solution: completion-gated ticks**

```
AnimationLoop tick fires
  → if WorkerBridge._pending: skip this tick (frame dropped)
  → else: AppState.advance(), queueRender()
```

This means the effective playback FPS adapts to what the pipeline can sustain. A complex 30-node pipeline at PREVIEW quality might only achieve 4 FPS — the transport plays at 4 FPS rather than blocking or crashing.

**FPS display:** `TransportStrip` shows actual achieved FPS (derived from `AppState.lastRenderTime`), not the configured target FPS, when actual < target:
```
[◀][▶][▶▶] ══════●═══ 12/48  4fps  ← grey = degraded (target was 24)
```

### 8.2 PREVIEW quality during playback

Animation always plays at PREVIEW quality. Changing the QUALITY toggle to FULL during playback immediately pauses playback. The rationale: FULL renders are typically > 500ms per frame; real-time playback at FULL quality is impractical for non-trivial stacks.

**Rule enforced by TransportStrip:** On `play()`, if `AppState.quality === 'full'`, switch to `'preview'` automatically and restore on `pause()`.

### 8.3 Sequence render (batch)

`RENDER ALL FRAMES` in the EXPORT dropdown runs a batch job:

```
for frame 0..frameCount-1:
  Pipeline.render({ quality: 'full', frame })
  post result to main thread progressively
  update AppState.sequenceProgress
```

This runs in `RenderWorker` as a loop, posting each frame's buffer back individually. The main thread does not block — the sidebar remains interactive and `TransportStrip` shows progress. The user can cancel by closing the export dropdown (WorkerBridge sends a `cancel` message to the worker).

**Sequence render cancellation message:**
```javascript
// WorkerBridge.cancelSequence()
this._worker.postMessage({ type: 'cancelSequence' });

// RenderWorker — inside sequence loop
if (cancelFlag) break;
```

### 8.4 Expression drivers and animation

Per-frame expression drivers (scope `'frame'`) are the correct tool for animation — they evaluate once per frame regardless of image size. Per-pixel expression drivers in animated pipelines should be avoided at high resolutions: at 1920×1080, 48 frames, 1 per-pixel driver = **100M expression evaluations** for a full sequence render.

---

## 9. Loading Feedback

### 9.1 Status text

`DistortToolbar` exposes `setStatus(text)` called from `WorkerBridge`:

| State | Status text |
|-------|-------------|
| Idle (PREVIEW) | `480 × 270  PREVIEW  12ms` |
| Idle (FULL) | `1920 × 1080  FULL  340ms` |
| Rendering | `rendering…` |
| Sequence rendering | `rendering frame 12 / 48…` |
| Error | `render error — see console` |
| Worker reset | `render error — stack simplified?` |

`lastRenderTime` from `AppState` provides the ms readout in idle state. This gives the user direct feedback on stack cost.

### 9.2 Canvas dimming during render

`ViewportCanvas` dims its content to 70% opacity while a render is pending:

```javascript
// AppState.rendering changes → ViewportCanvas.onRenderingChange(bool)
canvas.style.opacity = rendering ? '0.7' : '1';
```

Transition: `opacity 100ms ease`. This signals that the displayed result is stale without removing it — the user still sees what was there. No spinner overlay.

### 9.3 Progress bar for slow renders

`AppState.renderProgress` (updated by `Pipeline` per node) is surfaced for:
- **Sequence export** — progress bar in the EXPORT dropdown: `████████░░ 67%`
- **Single-frame FULL render > 2s** — same progress bar, shown inline in the status area

The 2s threshold prevents the progress bar flashing for fast renders.

### 9.4 Node-level timing

In expanded node panels, `NodePanel` optionally shows the last render time for that node (from `node._lastRenderMs`, set by Pipeline):

```
▾ REACTION-DIFFUSE  [S][×]
  ─────────────────────────────────
  OPACITY   ──────●────── 1.00
  ...
  ─────────────────────────────────
  last: 312ms PREVIEW              ← shown in grey, below mask block
```

Visible only when `lastRenderMs > 50`. Helps users identify which node is the bottleneck without profiling tools.

---

## 10. Memory Management

### 10.1 Node cache ceiling

Enforced by Pipeline on every render (see §4). Hard limit: **128MB total node cache**. Eviction: front-of-stack first.

### 10.2 Source pixel buffer

`AppState.sourcePixels` holds the full-resolution source image as `Uint8ClampedArray`. Size: `sourceW × sourceH × 4` bytes. At 12MP: 48MB. This is a fixed cost; the buffer is never evicted. If memory is critical, the user should work at PREVIEW scale and only switch to FULL at export.

### 10.3 Modulation maps

One `Uint8Array` per named modulation map per render (not cached). Released after each render. No ceiling required beyond the normal GC cycle.

### 10.4 Node destroy()

Every `EffectNode` subclass must implement `destroy()`. It must:
- Release `_cache` and `_mask` buffers back to `pool`
- Cancel any async operations the node initiated
- Clear references that prevent GC

`EffectStack` calls `node.destroy()` on remove and on full stack replace.

### 10.5 Worker lifecycle

`RenderWorker` retains its own `Pipeline` instance with node caches inside the worker context. Worker memory is released when `WorkerBridge.destroy()` terminates the worker. This occurs when the tool is unloaded (`DistortTool.destroy()`).

---

## 11. Render Cost Classification

Modules are classified by render cost to help users understand pipeline performance expectations.

| Class | Cost (PREVIEW) | Cost (FULL, 1920×1080) | Examples |
|-------|----------------|------------------------|---------|
| **Instant** | < 5ms | < 50ms | greyscale, invert, levels, curves, posterize |
| **Fast** | 5–20ms | 50–200ms | gauss blur, box blur, unsharp mask, film grain, vignette, all LUT nodes |
| **Moderate** | 20–60ms | 200–600ms | bilateral, radial blur, flow field, band shift, sobel, canny, all line render |
| **Slow** | 60–200ms | 600ms–3s | median (large radius), reaction-diffusion, iterative rewarp (many passes), paint stroke (high iterations), Delaunay mesh |
| **Very slow** | > 200ms | > 3s | reaction-diffusion (many iterations), cellular automata (large grid) |

**Slow and Very slow nodes** must implement PREVIEW iteration caps (see §3). Pipeline emits a console warning if any node exceeds 2s at FULL quality.

---

## 12. Node Author Performance Checklist

When building or porting a node, verify:

- [ ] Reads `ctx.quality === 'preview'` and applies iteration/radius caps
- [ ] Does not allocate buffers inside the pixel loop — use `pool.acquire()` for large allocations outside the loop
- [ ] Does not retain references across renders (stateless `apply()`)
- [ ] Implements `destroy()` if any resources are acquired in the constructor
- [ ] For vector nodes: `buildGeometry()` is pure — no side effects, returns a new `LineSet`
- [ ] Does not call `performance.now()`, `Date.now()`, or any timing that could mask cost from Pipeline's measurement
- [ ] Does not access `document`, `window`, or any browser global — the node runs in a Worker context
- [ ] Per-pixel operations use integer arithmetic where possible (avoid `Math.sqrt`, `Math.sin` in the tight pixel loop unless necessary — pre-compute lookup tables if the operation is expensive and the parameter space is bounded)

---

## 13. Future Optimisation Paths

Documented here to avoid premature implementation — implement when profiling evidence justifies.

| Optimisation | Benefit | Prerequisite |
|---|---|---|
| LUT chain fusion | Merge all adjacent `isLUT = true` nodes into one pass | Measure that LUT nodes are actually a bottleneck |
| OffscreenCanvas-based compositing | GPU-accelerated blend modes | Validate browser support and worth vs complexity |
| Chunked progressive rendering | Show partial output while render is in progress | Only needed if single-frame renders exceed ~4s |
| SharedArrayBuffer for pixel data | Zero-copy between main thread and worker | Requires COOP/COEP headers on the server |
| Worker pool (multiple workers) | Parallel node execution | Only valid for independent nodes; sequential pipeline limits parallelism |
