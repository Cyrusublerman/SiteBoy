# Algorithms: Rendering

| Function | Path | Inputs | Outputs | Reference Doc | Notes |
|---|---|---|---|---|---|
| GPU tier detection | `assets/js/core/gpu-foundation.js` `FeatureDetector.detect()` | none | `{ tier, adapter, device, gl }` | `guides/standards/gpu-compute.md` | Async; cached after first call |
| WebGPU compute dispatch | `GPUContext.dispatchCompute()` | WGSL source, BufferRing, width, height, uniforms | side-effect: ring swapped | `guides/standards/gpu-compute.md` | Workgroup 16×16 |
| WebGL2 fragment dispatch | `GPUContext.drawFragment()` | GLSL source, BufferRing, width, height, uniforms | side-effect: ring swapped | `guides/standards/gpu-compute.md` | Fullscreen quad |
| GPU node partitioning | `GPURenderPath.partitionNodes()` | `EffectNode[]` | `NodeRun[]` (gpu/cpu alternating) | `components/distort/performance.md` | Routes eligible nodes to GPU |
| GPU pixel upload | `GPUContext.uploadPixels()` | BufferRing, Uint8ClampedArray, w, h | side-effect: ring write side loaded | `guides/standards/gpu-compute.md` | Zero-copy to GPU memory |
| GPU pixel readback | `GPUContext.readbackPixels()` | BufferRing, w, h | `Promise<Uint8ClampedArray>` | `guides/standards/gpu-compute.md` | Async WebGPU; sync WebGL2 |
| Per-pixel invert (GPU) | `shaders/invert.shader.js` | rgba8unorm texture, uMode | rgba8unorm texture | `guides/tools/gpu-shader-authoring.md` | Trivial tier; template for per-pixel nodes |
| Separable box blur (GPU) | `shaders/boxblur.shader.js` | rgba8unorm texture, uRadius, uPass | rgba8unorm texture | `guides/tools/gpu-shader-authoring.md` | Two-pass; shared-memory tile in WGSL |
| Sobel edge detection (GPU) | `shaders/sobel.shader.js` | rgba8unorm texture, threshold, ramp | rgba8unorm texture | `guides/tools/gpu-shader-authoring.md` | Two-pass; stencil tier |

Checklist: `../guides/checklists/algorithms.md`

---

## GPU Compute Models

### WebGPU Compute Pipeline

WebGPU exposes compute shaders (WGSL) that run on the GPU with arbitrary read/write access to storage buffers and textures.

**Execution model:**
- A dispatch is invoked as `device.queue.submit([encoder.finish()])` after `pass.dispatchWorkgroups(x, y)`.
- Workgroups contain a fixed number of invocations defined by `@workgroup_size(x, y, z)` in the shader.
- This codebase uses `@workgroup_size(16, 16)` — a 16×16 grid of invocations per workgroup, standard for 2D image processing.
- Each invocation reads its coordinates from `@builtin(global_invocation_id)`.

**Binding layout (standard for all distort node shaders):**
```
@group(0) @binding(0) var<uniform>  uniforms : UniformStruct;
@group(0) @binding(1) var           tIn      : texture_2d<f32>;         // read
@group(0) @binding(2) var           tOut     : texture_storage_2d<rgba8unorm, write>;  // write
```

**Shared memory:** Declared with `var<workgroup>`. All invocations in a workgroup can read/write. Synchronised with `workgroupBarrier()`. Used in `boxblur.shader.js` for tile+halo pattern to reduce texture fetches.

**Readback:** `GPUBuffer.mapAsync(GPUMapMode.READ)` — async; must `await` before reading. Row padding: `bytesPerRow` must be a multiple of 256. `GPUContext._readbackWebGPU` handles de-padding.

**Browser support (2026):** Chrome 113+, Edge 113+, Firefox 120+ (flag), Safari 18+ (partial). ~85–90% of desktop users.

---

### WebGL2 Fragment Shader Pipeline

WebGL2 uses fragment shaders for GPU compute by rendering a fullscreen quad and treating textures as data arrays.

**Execution model:**
- A fullscreen triangle strip covers the entire viewport.
- The fragment shader runs once per output pixel.
- Input is a texture bound to `uniform sampler2D uTex` at unit 0.
- Output is written to a framebuffer object (FBO) backed by a write texture.

**Standard vertex shader (shared, defined in `gpu-foundation.js`):**
```glsl
#version 300 es
in vec2 aPos;
out vec2 vUV;
void main() {
  vUV = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
```

**Limitations vs WebGPU:**
- No compute shaders — cannot write to arbitrary output positions (scatter).
- No shared memory between fragment invocations.
- No atomic operations.
- Readback via `gl.readPixels` is synchronous and may stall the GPU pipeline.
- WebGL2 images are bottom-up; `GPUContext._readbackWebGL2` flips vertically before returning.

**Browser support:** Universal — every browser since 2017.

---

## Common GPU Image Processing Patterns

### Per-pixel transform (trivial)

Each output pixel depends only on the same input pixel. No spatial reads.

**WGSL pattern:**
```wgsl
let px = textureLoad(tIn, vec2i(x, y), 0);
let out = /* transform px */;
textureStore(tOut, vec2i(x, y), out);
```

**GPU cost:** O(w×h) with full parallelism. Fastest class.
**Example:** `invert.shader.js`

---

### Separable kernel (convolution)

Output pixel depends on a 1D window of neighbours (rows or columns). Run twice: horizontal + vertical.

**Key optimisation:** Load a tile + halo region into `var<workgroup>` shared memory. All threads in the workgroup read from shared memory instead of the texture during the sum loop.

**WGSL pattern:**
```wgsl
var<workgroup> tile : array<vec4f, TILE_SIZE + 2*MAX_RADIUS>;
// threads cooperatively fill tile including halo
workgroupBarrier();
// each thread sums from tile[localIdx-r .. localIdx+r]
```

**GPU cost:** O(w×h×kernel_width) with partial parallelism limited by workgroup size.
**Example:** `boxblur.shader.js`

---

### Stencil / neighbourhood kernel

Output pixel depends on a small fixed 2D neighbourhood (e.g. 3×3 Sobel, 5×5 bilateral).

**WGSL pattern:**
```wgsl
// Sample all 9 neighbours via textureLoad with clamped coordinates
let tl = textureLoad(tIn, vec2i(clamp(x-1,0,w-1), clamp(y-1,0,h-1)), 0);
// ...
let mag = sqrt(gx*gx + gy*gy);
```

No shared memory required for small kernels (3×3). Larger kernels (5×5+) benefit from tile loading.

**GPU cost:** O(w×h×k²) where k is kernel width. Fully parallel.
**Example:** `sobel.shader.js`

---

### Multi-pass (sequential passes)

Some operations require multiple dispatches in sequence, each reading the output of the previous.

**Pattern in this codebase:**
- `gpuBindings.multiPass = true` declares that the node requires multiple dispatches.
- `gpuBindings.passes` (or `passesFromParams`) returns the number of dispatches.
- Each dispatch receives `uPass` (0, 1, 2...) to select behaviour.
- `BufferRing.swap()` occurs after each dispatch, so pass N reads the output of pass N-1.

**Example:** `boxblur.shader.js` (2 passes: horizontal, vertical, repeated `passes` times).
**Example:** `sobel.shader.js` (2 passes: luma extraction, then Sobel+ramp).

---

### Reduction (global min/max, histogram)

Reduction requires all invocations to contribute to a single aggregate value. WebGPU supports this via atomic operations on storage buffers.

**Pattern (not yet implemented — documented for future node authors):**
```wgsl
@group(0) @binding(3) var<storage, read_write> histogram : array<atomic<u32>, 256>;
// each invocation:
atomicAdd(&histogram[bucketIndex], 1u);
```

After the dispatch, read the buffer back to CPU, compute the result, then upload as a uniform for a second pass that applies the transformation.

**Examples that need this:** `histogrameq`, `clahe`. Currently CPU-only.

---

## Performance Reference

| Operation | CPU time (1080p) | GPU time (WebGPU) | Speedup |
|---|---|---|---|
| Per-pixel transform (invert) | ~20ms | <1ms | ~40× |
| Separable blur (radius 10) | ~120ms | ~3ms | ~40× |
| Sobel edge detection | ~80ms | ~4ms | ~20× |
| Reaction-diffusion (10 steps) | ~600ms+ | ~15ms (estimated) | ~40× |
| GPU upload (1080p RGBA) | — | ~1ms | — |
| GPU readback (1080p RGBA) | — | ~3ms (async) | — |

**Overhead threshold:** Images below 256×256 pixels (65,536 pixels) are typically faster on CPU due to upload+readback fixed cost. `GPUFoundation.GPU_MIN_PIXELS` enforces this cutoff.
