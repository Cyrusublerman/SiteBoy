# Standard: GPU Compute

Defines the mandatory patterns for GPU-accelerated image processing in this project. All GPU compute work must follow these rules. Violations are architecture bugs, not style preferences.

**SSoT file:** `assets/js/core/gpu-foundation.js`
**Distort integration:** `assets/js/tools/processors/distort/core/GPURenderPath.js`
**Shader sources:** `assets/js/tools/processors/distort/shaders/*.shader.js`
**Algorithm catalogue:** `algorithms/rendering.md`
**Shader authoring guide:** `guides/tools/gpu-shader-authoring.md`

---

## 1. File Ownership

| Concern | Owner |
|---------|-------|
| GPU feature detection | `gpu-foundation.js` — `FeatureDetector` |
| GPU context creation and lifecycle | `gpu-foundation.js` — `GPUContext` |
| Shader pipeline compilation and caching | `gpu-foundation.js` — `ShaderCompiler` |
| GPU texture and buffer management | `gpu-foundation.js` — `BufferRing` |
| Pixel upload / readback | `gpu-foundation.js` — `GPUContext` |
| Distort node GPU dispatch | `distort/core/GPURenderPath.js` |
| Per-node WGSL/GLSL source | `distort/shaders/<type>.shader.js` |

**Prohibited outside `gpu-foundation.js`:**
- `navigator.gpu`
- `canvas.getContext('webgl2')` for compute
- `GPUDevice`, `GPUAdapter`, `WebGL2RenderingContext` for pixel processing
- Manual `GPUBuffer`, `GPUTexture`, `WebGLTexture` creation

---

## 2. Tier Detection and Fallback Chain

```
GPUFoundation.detect()
    → WebGPU (navigator.gpu + adapter + device)
    → WebGL2 (canvas.getContext('webgl2'))
    → CPU (existing Pipeline path — always safe)
```

**Rules:**
- Detection is async. It must be called once at tool init and awaited before enabling the GPU path.
- Detection result is cached. Do not call `detect()` in a render hot path.
- Runtime errors (device lost, shader compile failure) trigger fallback to the next tier. The user sees a status indicator change, not an error dialog.
- The CPU path is always available and must never be removed or bypassed for GPU-capable nodes.

**Implementation (distort tool):**
```javascript
// In DistortTool._initGPU()
const detected = await GPUFoundation.detect();
if (detected.tier !== 'cpu') {
  this._gpuCtx = GPUFoundation.createContext(detected);
  this._gpuRenderPath = new GPURenderPath(this._gpuCtx);
  this._pipeline._gpuPath = this._gpuRenderPath;
}
```

---

## 3. GPU Eligibility Rules (Distort Nodes)

A node runs on GPU if and only if all of the following hold:

1. `node.gpuCapable === true` (the node has a WGSL or GLSL implementation)
2. No active mask (`!node.mask.enabled || node.mask.source === 'none'`)
3. No active modulation (`Object.keys(node.modulation).length === 0`)
4. `node.opacity === 1`
5. `node.blendMode === 'normal'`
6. For WebGPU tier: `node.wgsl() !== null`
7. For WebGL2 tier: `node.glsl() !== null`

Conditions 2–5 are the same constraints that cause `Pipeline` to enter the `needsBlend` branch. Until GPU blend and masking are implemented, those nodes always fall back to CPU. This is correct behaviour — never skip mask or blend logic silently.

---

## 4. Buffer Management

### CPU side

CPU pixel buffers use `BufferPool` (`distort/core/BufferPool.js`). Do not allocate `Uint8ClampedArray` for large buffers manually inside render loops.

### GPU side

GPU textures and framebuffers are managed via `BufferRing`. Rules:

- Always create a `BufferRing` via `GPUContext.createBufferRing(w, h)`. Never call `device.createTexture()` directly.
- Call `ring.resize(w, h)` before use when dimensions may have changed. `GPURenderPath` does this automatically.
- Destroy rings in `destroy()`. Leaked GPU textures are not collected by GC on all platforms.
- The ring's read and write sides swap after each dispatch. Reads always go to `ring.readTex`; writes to `ring.writeTex`/`ring.writeFBO`.

### Upload/readback cost

GPU compute introduces fixed overhead per node run (not per pixel):

| Operation | Approximate cost (1080p) |
|-----------|--------------------------|
| Upload pixels to GPU | ~1ms |
| Single dispatch (full parallelism) | <1–5ms |
| Readback (async, WebGPU) | ~2–4ms |
| Readback (sync, WebGL2) | ~5–15ms (may stall) |

**Minimum image size for GPU benefit:** 256×256 pixels (`GPUFoundation.GPU_MIN_PIXELS`). Below this threshold, the GPU path is bypassed and the CPU path runs. `GPURenderPath.execute()` checks this automatically.

---

## 5. Shader Compilation Caching

`ShaderCompiler` caches compiled pipelines/programs keyed by a hash of the shader source string. Compilation happens once per unique shader source per GPU context lifetime.

**Rules:**
- Never compile shaders manually. Always use `GPUContext.dispatchCompute()` or `GPUContext.drawFragment()` — they call the compiler internally.
- Shader source strings must be static module-level constants. Do not generate WGSL/GLSL dynamically at runtime (defeats caching and makes debugging impossible).
- If a node's shader must vary by param, use uniform values instead of string interpolation.

---

## 6. Relationship with AnimationFoundation

GPU compute and animation timing are separate concerns.

| Concern | Owner |
|---------|-------|
| When to run the pipeline | `AnimationFoundation.AnimationLoop` → `distort-main._scheduleRender()` |
| Running the pipeline on GPU | `GPURenderPath.execute()` |
| Running the pipeline on CPU | `Pipeline._runNode()` |

The GPU path does not drive its own timing. It is called from `Pipeline.render()`, which is called from `_scheduleRender()`, which is driven by `AnimationLoop`. This chain must not be broken.

**Prohibited:** Using `GPUFoundation` as an animation driver. `requestAnimationFrame` and timing remain exclusively in `AnimationFoundation`.

---

## 7. Worker Compatibility

`RenderWorker` runs `Pipeline` in a Web Worker. `GPURenderPath` is **not** passed into the worker — GPU dispatch happens on the main thread only in the current architecture.

**Rationale:** WebGPU is available in workers via `OffscreenCanvas`, but the setup complexity and the existing worker-based CPU pipeline would require significant redesign. The current split — GPU on main thread for interactive preview, CPU in worker for final quality — is the correct interim architecture.

**Consequence:** GPU acceleration applies to preview renders (main thread path) only. Final-quality renders and sequence exports run CPU in the worker as before. This is acceptable because final renders are infrequent and user-initiated; the interactive preview is where latency matters most.

---

## 8. Prohibited Patterns

```javascript
// FORBIDDEN — raw GPU context outside gpu-foundation.js
const gl = canvas.getContext('webgl2');

// FORBIDDEN — raw WebGPU outside gpu-foundation.js
const adapter = await navigator.gpu.requestAdapter();

// FORBIDDEN — manual texture creation
const tex = device.createTexture({ ... });

// FORBIDDEN — dynamic shader source generation
const wgsl = `...${someParam}...`; // defeats caching

// FORBIDDEN — GPU as animation driver
requestAnimationFrame(() => gpuCtx.dispatchCompute(...));
```

---

## 9. Quick Reference

```javascript
// Detect GPU tier (once, at tool init)
const detected = await GPUFoundation.detect();

// Create context (if not CPU)
const gpuCtx = GPUFoundation.createContext(detected);

// Create a ping-pong ring
const ring = gpuCtx.createBufferRing(width, height);

// Upload source pixels
gpuCtx.uploadPixels(ring, pixels, width, height);
ring.swap(); // make uploaded pixels the read side

// Dispatch WebGPU compute
gpuCtx.dispatchCompute(wgslSource, ring, width, height, { uRadius: 5 });

// Dispatch WebGL2 fragment
gpuCtx.drawFragment(glslSource, ring, width, height, { uRadius: 5 });

// Read back result
const out = await gpuCtx.readbackPixels(ring, width, height);

// Destroy when done
ring.destroy();
gpuCtx.destroy();
```
