# Guide: GPU Shader Authoring for Distort Nodes

Step-by-step process for adding a GPU shader to any distort effect node. Follow this guide in order. Read `guides/standards/gpu-compute.md` before starting.

**Canonical examples** (read these before writing a new shader):
- Per-pixel: `distort/shaders/invert.shader.js` → `nodes/colour/InvertNode.js`
- Separable kernel: `distort/shaders/boxblur.shader.js` → `nodes/blur/BoxBlurNode.js`
- Stencil: `distort/shaders/sobel.shader.js` → `nodes/edge/SobelNode.js`

---

## Step 1 — Classify the Node

Determine the GPU pattern your node uses. Most nodes fit one category.

| Pattern | Description | Shared memory? | Multi-pass? | Example |
|---------|-------------|---------------|-------------|---------|
| **Per-pixel** | Output[x,y] depends only on Input[x,y] | No | No | invert, greyscale, levels, curves, invert |
| **Stencil** | Output[x,y] depends on a fixed N×N neighbourhood | No (for N≤5) | No | sobel, laplacian, DOG |
| **Separable kernel** | Two 1D passes (horizontal + vertical) | Yes (WGSL) | Yes (2×) | boxblur, gaussblur, motionblur |
| **Gather** | Output[x,y] samples arbitrary Input positions | No | No | flowfield, ripple, affine |
| **Multi-pass other** | Sequence of logically distinct passes | — | Yes | sobel (luma+edge), CLAHE |
| **Stateful / iterative** | Output depends on prior frame's GPU output | Ping-pong | Yes (N×) | reaction-diffusion, cellularautomata |

**Stateful and reduction nodes** (histogram, CLAHE, reaction-diffusion) require advanced patterns (atomic ops, reduction passes). Do not implement these without reading `algorithms/rendering.md §Reduction` first.

---

## Step 2 — Create the Shader File

Create `assets/js/tools/processors/distort/shaders/<type>.shader.js`.

The file must export three named items:

```javascript
export const wgsl = /* wgsl */`...`;       // WebGPU compute shader (WGSL)
export const glsl = /* glsl */`...`;       // WebGL2 fragment shader (GLSL ES 3.00)
export const gpuBindings = { ... };        // binding descriptor
```

Optionally export a `uniformMap` function if the node has non-numeric params (e.g. select strings) that need conversion.

---

## Step 3 — Write the gpuBindings Descriptor

```javascript
export const gpuBindings = {
  // Declare uniform names and their WGSL scalar type.
  // Keys must match the names used in your WGSL/GLSL uniform struct.
  uniforms: {
    uRadius:    'i32',
    uThreshold: 'f32',
    uMode:      'i32',
  },

  // Set multiPass: true if your shader requires more than one dispatch.
  multiPass: false,

  // If multiPass is true, set the number of dispatches.
  // This can be a fixed number or a function (passesFromParams) — see Step 3a.
  passes: 2,
};
```

### Step 3a — Dynamic pass count (optional)

If the number of passes depends on a param (e.g. the `passes` param of BoxBlurNode):

```javascript
export const gpuBindings = {
  uniforms: { uRadius: 'i32' },
  multiPass: true,
  passes: 2,  // base (2 = H + V for one logical blur pass)
  // GPURenderPath calls this with resolved params to get total dispatch count
  passesFromParams: p => Math.round(p.passes) * 2,
};
```

### Step 3b — Uniform mapping for non-numeric params

If the node has a `select` param (string), map it to an integer for the shader:

```javascript
const MODE_INDEX = { all: 0, luminosity: 1, hue: 2 };

export const gpuBindings = {
  uniforms: { uMode: 'i32' },
  uniformMap: p => ({ uMode: MODE_INDEX[p.mode] ?? 0 }),
};
```

`uniformMap` receives the resolved (preview-capped) params object and returns an object of uniform key→value pairs. When `uniformMap` is provided, it replaces the default key-to-key mapping entirely.

---

## Step 4 — Write the WGSL Compute Shader

### Standard binding layout (mandatory — do not change binding indices)

```wgsl
struct Uniforms {
  uWidth  : f32,   // always first two
  uHeight : f32,
  // ...your uniforms...
  // Pad to 16-byte alignment: total float count must be multiple of 4
  _pad    : f32,
}

@group(0) @binding(0) var<uniform> uni  : Uniforms;
@group(0) @binding(1) var          tIn  : texture_2d<f32>;
@group(0) @binding(2) var          tOut : texture_storage_2d<rgba8unorm, write>;
```

### Workgroup size (mandatory)

```wgsl
@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let x = i32(id.x);
  let y = i32(id.y);
  let w = i32(uni.uWidth);
  let h = i32(uni.uHeight);
  if (x >= w || y >= h) { return; }  // bounds check mandatory
  // ...
}
```

Always use `@workgroup_size(16, 16)`. This matches `GPUContext.dispatchCompute()` which dispatches `ceil(w/16) × ceil(h/16)` workgroups.

### Texture access

```wgsl
// Read a pixel (clamped to image bounds)
let px = textureLoad(tIn, vec2i(x, y), 0);

// Read a neighbour with clamping
let n = textureLoad(tIn, vec2i(clamp(x+1, 0, w-1), y), 0);

// Write output
textureStore(tOut, vec2i(x, y), out);
```

### uPass for multi-pass shaders

```wgsl
if (uni.uPass < 0.5) {
  // pass 0
} else {
  // pass 1
}
```

Use `f32` comparison since `uPass` is stored as a float in the uniform buffer (all uniforms are packed as `f32` by `_buildUniformBuffer`).

---

## Step 5 — Write the GLSL Fragment Shader (WebGL2 fallback)

```glsl
#version 300 es
precision highp float;

uniform sampler2D uTex;   // always: read texture at unit 0
// ...declare your uniforms...

in  vec2 vUV;
out vec4 fragColor;

void main() {
  vec2 texelSize = vec2(1.0) / vec2(textureSize(uTex, 0));
  vec4 px = texture(uTex, vUV);
  // ...compute...
  fragColor = out;
}
```

**Rules:**
- Always declare `precision highp float`.
- Always use `in vec2 vUV` (interpolated from the standard vertex shader).
- Always use `out vec4 fragColor` (not `gl_FragColor`).
- Texture coordinates in GLSL are normalised `[0, 1]`. In WGSL they are integer pixel coords. Account for this.
- WebGL2 images read bottom-up via `gl.readPixels`. `GPUContext._readbackWebGL2` flips vertically. Do not compensate in the shader.

---

## Step 6 — Wire into the Node

Open the node's `.js` file (e.g. `nodes/colour/MyNode.js`).

```javascript
import { wgsl, glsl, gpuBindings as _gpuBindings, myUniformMap } from '../../shaders/mynode.shader.js';

export const MyNode = createEffectModule({
  type: 'mytype', name: 'MY NODE', category: 'CATEGORY',
  params: { ... },
  apply(src, dst, w, h, p) {
    // CPU implementation — unchanged
  },
  // GPU additions:
  wgsl,
  glsl,
  gpuBindings: {
    ..._gpuBindings,
    uniformMap: myUniformMap,  // omit if not needed
  },
});
```

The `createEffectModule` factory automatically wires `wgsl()`, `glsl()`, and `gpuBindings()` methods on the generated class, and the `gpuCapable` getter returns `true`.

---

## Step 7 — Verify GPU vs CPU Parity

GPU floating-point and CPU integer arithmetic produce slightly different results. Verify that the outputs are visually equivalent and numerically close.

**Tolerance:** ±2 per RGBA channel per pixel is acceptable for most image processing. Edge detection results may differ by ±5 at transition zones.

**Manual check procedure:**
1. Load a test image with sharp edges and flat regions.
2. Add the node to the distort stack.
3. Observe the GPU output (check browser devtools for `GPU:WebGPU` status label in the toolbar).
4. Temporarily disable GPU for the node (return `null` from `wgsl()` and `glsl()` in the config).
5. Compare visually and note any significant differences.
6. Re-enable GPU.

**Things to watch:**
- Coordinate systems: WGSL `textureLoad` uses integer coords; GLSL `texture()` uses normalised coords. Off-by-one errors appear as 1px shifts.
- Row orientation: GLSL fragment shaders run bottom-to-top (Y is flipped vs CPU). The readback flip in `GPUContext._readbackWebGL2` corrects this at readback, not in the shader.
- Precision: WGSL `f32` matches GLSL `highp float`. Both are 32-bit IEEE 754.

---

## Step 8 — Pre-Submission Checklist

- [ ] Shader file is in `distort/shaders/`, not inline in the node file
- [ ] `wgsl`, `glsl`, `gpuBindings` are all exported from the shader file
- [ ] `gpuBindings.uniforms` keys match the actual uniform names in both WGSL and GLSL
- [ ] WGSL uniform struct is padded to 16-byte alignment (float count divisible by 4)
- [ ] WGSL `@workgroup_size(16, 16)` — no other size
- [ ] Bounds check `if (x >= w || y >= h) { return; }` present in WGSL
- [ ] GLSL uses `#version 300 es`, `precision highp float`, `in vec2 vUV`, `out vec4 fragColor`
- [ ] Node wires `wgsl`, `glsl`, `gpuBindings` in `createEffectModule` config
- [ ] CPU `apply()` function is unchanged — GPU is an optional acceleration, not a replacement
- [ ] `uniformMap` used if any param is a string/bool that needs conversion
- [ ] Multi-pass shaders have `multiPass: true` and either `passes` or `passesFromParams`
- [ ] Visually verified GPU output matches CPU output within tolerance

---

## Common Mistakes

### Uniform struct not aligned

WGSL uniform buffers require 16-byte alignment. The struct must contain a multiple of 4 `f32` fields (or equivalent). Add `_pad : f32` fields to reach alignment:

```wgsl
struct Uniforms {
  uWidth  : f32,
  uHeight : f32,
  uMode   : f32,
  _pad    : f32,   // pad to 4 floats = 16 bytes
}
```

### Forgetting the bounds check

```wgsl
// REQUIRED — workgroup may overhang image boundary
if (x >= w || y >= h) { return; }
```

Without this, invocations past the image edge attempt to write out-of-bounds, which is undefined behaviour in WGSL.

### Normalised vs integer coordinates

```wgsl
// WGSL — integer pixel coordinates
textureLoad(tIn, vec2i(x, y), 0)

// GLSL — normalised [0,1] UV
texture(uTex, vUV)
texture(uTex, vUV + vec2(texelSize.x, 0.0))  // move one pixel right
```

### Static shader strings

```javascript
// FORBIDDEN — defeats ShaderCompiler cache
const wgsl = `...@group(0) @binding(0)...${someRuntimeValue}...`;

// CORRECT — use uniform values instead
const wgsl = `...uniform value handled via uMyParam in the struct...`;
```

### Missing `glsl` export

Every node shader must provide both `wgsl` (WebGPU) and `glsl` (WebGL2). A node without `glsl` is ineligible for WebGL2 acceleration. A node without `wgsl` is ineligible for WebGPU. Provide both for maximum coverage.
