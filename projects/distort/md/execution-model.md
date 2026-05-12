### Dual-quality paths

Every render request is tagged with a quality level:

| Quality | Max resolution | Trigger |
|---|---|---|
| PREVIEW | 800px (longest edge) | Any interactive param change, undo/redo, node reorder |
| FULL | Source resolution | EXPORT, or explicit FULL toggle in top bar |

The PREVIEW image is displayed in the viewport for real-time feedback. The FULL image is used only for export. Switching from PREVIEW to FULL does not change what the user sees until the FULL render completes.

### Worker thread

The pipeline engine runs in a `Worker` (service-worker or shared worker, depending on browser support). The host posts a `RenderRequest` message and receives a `RenderResult` message:

```
RenderRequest  { quality, stackSpec, src, seed }
RenderResult   { bitmap, frameIdx, cacheHit[] }
```

`stackSpec` is a serialisable description of the node stack: an ordered array of `{ moduleId, params }` objects. The worker deserialises the spec, resolves modules by ID, executes the pipeline, and returns the composited `ImageBitmap`.

Pixel buffers are transferred (zero-copy) using `Transferable` objects where possible.

### Queue and cancellation

The host maintains a single PREVIEW render slot. When a param change triggers a new PREVIEW request while one is already in-flight, the in-flight request is **cancelled** (via `AbortController`) and the new request is enqueued. The FULL render slot is separate and is not cancelled by PREVIEW changes.

This means: if the user drags a slider rapidly through 60 values, only the final resting value will produce a completed render. Intermediate values are discarded after enqueue.

### Watchdog

If a FULL render exceeds 30 seconds without completing, the watchdog terminates the worker, restarts it, and posts a `RenderError` to the host. The host shows an inline error state in the canvas area. PREVIEW renders have a 5-second watchdog.

### Node ordering and dependencies

The pipeline is a linear chain — there is no DAG branching in the current implementation. The output of node `n` is the input of node `n+1`. The first node receives the source image. The last node's output is the composited result.

Consequence: node execution order is exactly the visual order in the stack UI. Moving a node up or down in the stack changes the result.

### Error isolation

If a node's `apply()` throws, the engine catches the error, passes the **unmodified `src`** to the next node (as if the errored node was an identity), and adds the error to `RenderResult.errors`. The host marks the errored node in the stack with a warning indicator. The pipeline continues; no single node failure can halt the pipeline.
