### Tier detection

At startup the host runs a capability probe and assigns one of four GPU tiers. The probe is non-blocking and resolves within ~200ms. The result is stored in `GPUFoundation.tier` and is read by all `gpuEligible` modules.

| Tier | Condition | Modules available |
|---|---|---|
| 0 | No `navigator.gpu`, no `getContext('webgl2')` | CPU only |
| 1 | `getContext('webgl2')` available | WebGL2 fragment shaders |
| 2 | `navigator.gpu` available, adapter reports basic limits | WebGPU compute shaders |
| 3 | WebGPU + 128 MB+ storage buffer support | WebGPU compute with large buffer ring |

If a module is `gpuEligible: true` and the tier is 0, the module's CPU `apply()` path executes normally. The fallback is always safe.

### GPUFoundation interface

All GPU operations go through `GPURenderPath` (WebGPU) or `GPUWebGL2` (WebGL2) in `assets/js/core/gpu-foundation.js`. No module may call `navigator.gpu`, `canvas.getContext('webgl2')`, `new GPUBuffer(...)`, or any GPU primitive directly. This is a hard constraint enforced in code review.

The module calls:

```js
GPUFoundation.dispatch({
  shader:  myShader,   // shader module (WGSL for WebGPU, GLSL for WebGL2)
  src,                 // Uint8ClampedArray — input pixels
  dst,                 // Uint8ClampedArray — output (pre-allocated)
  w, h,
  uniforms: { ...params },  // serialisable param values
});
```

`GPUFoundation.dispatch()` selects the appropriate backend based on `tier`, uploads buffers, dispatches workgroups, reads back the result into `dst`, and returns. The module sees a single synchronous-style call (internally awaited by the worker's async pipeline runner).

### Workgroup dispatch (WebGPU)

The compute shader is dispatched over a 2D grid:

$$
\text{workgroupsX} = \lceil w / 8 \rceil, \quad \text{workgroupsY} = \lceil h / 8 \rceil
$$

Each workgroup covers an 8×8 pixel tile. The shader reads input pixels from a `storage` buffer (read-only), writes output to a second `storage` buffer (write-only), and reads uniforms from a uniform buffer. The buffer layout is:

```wgsl
@group(0) @binding(0) var<storage, read>       src_buf : array<u32>;
@group(0) @binding(1) var<storage, read_write>  dst_buf : array<u32>;
@group(0) @binding(2) var<uniform>              params  : ParamsUniform;
```

Each pixel is packed as a single `u32` (RGBA 8-bit per channel). The shader unpacks with bitwise ops:

```wgsl
let r = (pixel >> 24u) & 0xFFu;
let g = (pixel >> 16u) & 0xFFu;
let b = (pixel >>  8u) & 0xFFu;
let a =  pixel         & 0xFFu;
```

### Buffer ring

To avoid GPU/CPU sync stalls on successive frames, `GPUFoundation` maintains a ring of 3 buffer pairs (`src_buf` / `dst_buf`). While the GPU is processing frame `n`, the CPU can upload frame `n+1` into the next ring slot. The ring size (3) is tunable via `GPUFoundation.setBufferRingSize(n)`.

At 128 MB ceiling (LRU) and a 4K RGBA source (~33 MB), the ring can hold approximately three full-resolution frames concurrently before the LRU begins evicting.

### Shader authoring constraints

- Shaders live in `assets/js/tools/processors/distort/shaders/*.shader.js`.
- Each shader file exports a single WGSL string constant (WebGPU) or GLSL string constant (WebGL2).
- No shader logic may be inlined in module files.
- Shaders must not read DOM or JS state; all parameters are passed through the uniform buffer.
- The shader authoring guide is at `blog/docs/guides/tools/gpu-shader-authoring.md`.

### Modules using GPU acceleration

Modules in the **Convolution**, **Blur**, **Warp**, and **Noise** categories expose `gpuEligible: true`. Specifically, the Gaussian Blur (large kernel), Box Blur, Directional Blur, Sobel Edge Detection, and Reaction-Diffusion modules dispatch compute shaders when tier ≥ 2. All other modules execute on CPU regardless of tier.
