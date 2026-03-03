# ComputeScheduler — Performance Standard

SSoT: `assets/js/tools/generators/core/compute-scheduler.js`
Canvas extension: `assets/js/shared/components/output/Canvas.js` (`setBufferScale`)

---

## Problem

Main-thread canvas rendering blocks the UI. Slider drags fire 60–120 input events/s. Per-pixel scripts (512×512 = 262 k pixels/frame) take 10–50 ms/frame. Combined result: dropped frames, frozen UI, unresponsive sliders.

---

## Three-Tier System

```
Parameter change
    ↓
Tier 1 — RAF Coalesce       (always on, zero config)
    ↓
Tier 2 — Adaptive Res       (opt-in: compute.interactionScale)
    ↓
Tier 3 — Worker Offload     (opt-in: compute.worker + computePixels)
    ↓
Canvas.redraw()
```

Tiers are additive. Apply only the tiers your script needs.

### Tier 1 — RAF Coalesce

**Always active.** Replaces the direct `draw()` call from `handleUpdate` with `scheduleRedraw()`, which coalesces all parameter changes within a single animation frame into one draw. No script config needed.

**Impact:** Eliminates redundant draws during slider drag. All generators benefit immediately.

### Tier 2 — Adaptive Resolution

**Opt-in.** While the user is interacting, renders the canvas at `interactionScale` (e.g. 0.5 = 50% linear → 25% pixel count). After `idleDelay` ms of inactivity, restores full resolution and redraws once.

The buffer is resized; the CSS display size is unchanged. The canvas visually stretches to fill the same viewport — imperceptible while dragging.

**Impact at `interactionScale: 0.5`:** 4× fewer pixels per interaction frame.

### Tier 3 — Worker Offload

**Opt-in.** Routes per-pixel computation to a dedicated `Web Worker`, freeing the main thread entirely. Uses the queue-one-extra debounce pattern: if a render is in-flight, exactly one more is queued. Stale results (from superseded renders) are discarded via a generation counter.

During animation playback, the worker path is bypassed and Tier 2 reduced-res main-thread rendering is used instead (maintaining frame rate is higher priority than quality).

**Impact:** Main thread never blocked. UI stays responsive regardless of canvas resolution.

---

## Applying to a Generator Script

### Tier 1 only (free — already on)

No changes to the script. `GenerativeToolHost.handleUpdate` automatically uses `scheduleRedraw()`.

### Tiers 1 + 2

Add a `compute` block to `SCRIPT_CONFIG`:

```javascript
export const SCRIPT_CONFIG = {
    // ...
    compute: {
        cost: 'per-pixel',          // 'per-pixel' | 'particle' | 'geometric' | 'lightweight'
        interactionScale: 0.5,      // render at 50% linear res during interaction
        idleDelay: 200,             // ms after last input before full-res render
    },
    // ...
};
```

### Tiers 1 + 2 + 3

Add `worker: true` and implement `computePixels`:

```javascript
export const SCRIPT_CONFIG = {
    // ...
    compute: {
        cost: 'per-pixel',
        interactionScale: 0.5,
        idleDelay: 200,
        worker: true,               // enables Tier 3 worker offload
    },

    // Pure function — must be self-contained (no closure over module scope).
    // Receives an empty ImageData whose buffer has been transferred to the worker.
    // Must return an ImageData of the same dimensions.
    computePixels(imageData, params, frame) {
        const { width: W, height: H, data } = imageData;
        for (let i = 0; i < data.length; i += 4) {
            // compute pixel colour from params
            data[i] = data[i+1] = data[i+2] = 128;
            data[i+3] = 255;
        }
        return imageData;
    },
    // ...
};
```

---

## `computePixels` contract

| Rule | Reason |
|------|--------|
| Must be a named method on `SCRIPT_CONFIG` | Serialised as `fn.toString()` and reconstructed in the worker via `new Function` |
| No references to outer module variables | Worker scope is isolated — closures over module state will throw |
| No DOM, no canvas, no `window` | Worker has no DOM access |
| Must return the same (or a same-size) `ImageData` | Buffer is transferred back to the main thread |
| All helper functions must be defined inside `computePixels` | No external imports in worker scope |
| Params are a shallow copy — do not mutate | `{ ...params }` is passed; mutations affect nothing outside |

---

## `compute` config reference

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `cost` | string | `'lightweight'` | Informational label: `'per-pixel'`, `'particle'`, `'geometric'`, `'lightweight'` |
| `interactionScale` | number | `1` | Buffer scale during interaction. `1` = no Tier 2 |
| `idleDelay` | number (ms) | `250` | Inactivity window before full-res restore |
| `worker` | boolean | `false` | Enable Tier 3 worker offload |

---

## Decision tree

```
Is the script per-pixel (imageData loop)?
├─ Yes
│   ├─ Does draw() reference canvas context or DOM? → Tier 2 only
│   └─ Is it a pure pixel transform? → Tiers 2 + 3
├─ Is the script O(n²) particle/collision? → Tier 2 only
└─ Is the script lightweight (<2 ms/frame)? → No tiers needed
```

**Measured frame-time targets:**

| State | Budget |
|-------|--------|
| Interaction (slider drag) | < 8 ms |
| Idle (after drag, full-res) | < 50 ms |
| Animation playback | < 16 ms (60 fps) |

If a script exceeds the idle budget, add `computePixels` (Tier 3).
If it exceeds the interaction budget, reduce `interactionScale`.

---

## Reusing ComputeScheduler outside generators

`ComputeScheduler` is a plain class with no dependency on `GenerativeToolHost`. It can be wired into any tool that uses a `Canvas` component.

```javascript
import { ComputeScheduler } from 'assets/js/tools/generators/core/compute-scheduler.js';

// In your tool's init or _loadScript equivalent:
this._scheduler = new ComputeScheduler({
    computeConfig: { cost: 'per-pixel', interactionScale: 0.5, idleDelay: 200, worker: true },
    draw:               () => this.draw(),
    getCanvasComponent: () => this.canvasComponent,
    getCtx:             () => this.ctx,
    getCanvas:          () => this.canvas,
    getParams:          () => this.params,
    getFrame:           () => this.frame,
    computePixels:      myScript.computePixels ?? null,
});

// On parameter change (instead of direct draw()):
this._scheduler.scheduleRedraw();

// On animation start/stop:
this._scheduler.setAnimating(true);  // or false

// On destroy:
this._scheduler.destroy();
```

**Prerequisites:**
- The tool must use the `Canvas` component from `component-library.js` (provides `setBufferScale`).
- `computePixels` (if used) must satisfy the contract above.

---

## Existing worker infrastructure

This system is complementary to `ProcessingManager` / `WorkerBridge`:

| System | Use for |
|--------|---------|
| `ComputeScheduler` | Per-frame pixel computation with stateful params (generators) |
| `WorkerBridge` | DISTORT pipeline — full render stack, stateful pipeline graph |
| `ProcessingManager` | One-shot algorithm tasks (dithering, quantization) |

Do not use `ProcessingManager` for per-frame animation loops — it is designed for discrete tasks.
