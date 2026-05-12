# DISTORT (Image Effects Pipeline)

This document describes the site’s DISTORT tool skillset: a node-graph of registered image-effect modules executed as a sequential effect stack, with deterministic output under explicit quality tiers and explicit CPU/GPU eligibility rules.

## Technical Domain

GPU compute and shader execution, pixel-buffer pipelines, worker-thread offloading, node-module authoring contracts, expression/driver modulation, and deterministic export (PNG/SVG/recipes/sequences).

## Architecture

### 1. Host tool: effect-module stack with strict UI zoning
The DISTORT host is registered at `#tools/distort` and provides the only allowed UI control regions:
- top bar (source + undo/redo + FIT/FILL/ACTUAL + quality + export)
- sidebar with exactly two tabs:
  - `PIPELINE` (source readout + effect stack + inline add effect)
  - `CANVAS` (output size + seed + frame count/FPS)
- a clean canvas viewport with zoom/pan as display transforms only
- a conditional transport strip when `frameCount > 1`

The host-level rule is: modules may not define their own sidebar DOM, tab structure, toolbar controls, or canvas overlays.

### 2. Module contract: `createEffectModule(config)`
Every effect is built from a module config that yields an effect module with a typed apply surface.

Required minimum:
- unique `type` string (lowercase, no spaces, no hyphens)
- UPPERCASE `name` label (display)
- `category` that matches the registry
- `params` at least one tier-3 entry
- pixel execution method `apply(src, dst, w, h, p, ctx, modulate)`

Optional vector execution for modules with geometric output:
- `isVector: true`
- `applyVector(src, w, h, p, ctx)` returning a `LineSet`

Export surface depends on module type:
- SVG export is enabled iff all stack nodes expose vector capability (`isVector: true`).

### 3. Execution model: off-thread pipeline computation
DISTORT enforces a two-tier execution boundary:
- main thread owns UI and display transforms (zoom/pan, viewport mode, export surface controls)
- worker thread owns:
  - pipeline computation
  - per-pixel operations
  - buffer allocation and recycling
  - expression evaluation and frame sequencing

Consequences:
- a slow module does not block UI event handling; it increases worker queue depth rather than dropping UI frames
- PREVIEW and FULL renders are managed as quality-tiered render jobs with explicit cancellation semantics

### 4. Pipeline caching and invalidation
Pipeline caching is node-local and keyed by:
- node identity
- param hash
- input buffer hash
- quality tier

Invalidation is explicit and ordered downstream:
- param change on node `N` invalidates `N` and all downstream nodes
- node reorder / add / remove invalidates from the insertion/reorder point to the end
- source image change and global seed change invalidates all nodes

Cache memory ceiling is enforced (LRU eviction, 128MB total).

## Effects Corpus: module inventory and node typing

The DISTORT module corpus is documented as:
- **69 modules** across **21 categories** (`blog/docs/pages/tools/processors/distort/inventory.md`)
- modules are typed by capability:
  - `pixel` (pixel output)
  - `vector` (line geometry output; enables SVG when all nodes are vector)
  - `generative` (modules whose behaviour is parameter-driven rather than simple raster kernels)

Category examples (from the inventory):
- COLOUR / TONE: e.g. `greyscale`, `levels`, `curves`, `histogrameq`, `clahe`
- BLUR and SHARPEN: e.g. `boxblur`, `gaussblur`, `motionblur`, `unsharpmask`
- TRANSFORM / WARP / REFRACTION: e.g. `affine`, `flowfield`, `ripple`, `lensbubbles`
- EDGE / MORPHOLOGY / SEGMENTATION: e.g. `sobel`, `laplacian`, `otsuthreshold`, `openclose`
- PATTERN / NOISE / PHYSICS: e.g. `truchet`, `domainwarp`, `reactiondiffusion`, `cellularautomata`
- LINE RENDER (vector): e.g. `serpentine`, `moduleflowlines`, `statichalftone`

## GPU Compute + dual backends

### 1. GPU tier detection and fallback chain
GPU compute uses a mandatory fallback chain defined by the GPU compute standard:
1. WebGPU (feature detection via adapter/device)
2. WebGL2 compute path (fragment shader fallback)
3. CPU pipeline path (always safe; never removed)

The constraint is architectural:
- GPU compute setup is done at tool init and awaited before enabling GPU eligibility
- runtime errors trigger fallback to a next tier with status signalling rather than fatal UI dialogs

### 2. GPU eligibility rules (per node)
Within a pipeline render:
a node is GPU-dispatched only if all:
- `gpuCapable === true`
- no active mask
- no active modulation driver map
- `opacity === 1`
- `blendMode === 'normal'`
- and shader presence matches the active tier:
  - WebGPU tier: `node.wgsl() !== null`
  - WebGL2 tier: `node.glsl() !== null`

These constraints are treated as correctness boundaries:
- until masking and blend semantics are supported on GPU, nodes with those features always execute on CPU.

### 3. Workgroup/tile dispatch rules
The shader authoring standard enforces:
- mandatory WGSL `@workgroup_size(16, 16)`
- bounds checks for `global_invocation_id` against output width/height

This is aligned with the dispatch model:
- dispatch counts computed as `ceil(w/16) × ceil(h/16)`

### 4. Shader authoring constraints (what makes GPU code stable)
Shader sources are required to be static module-level constants:
- `wgsl` string constant
- `glsl` string constant
- GPU binding descriptor `gpuBindings` describing uniform types and pass counts

Uniform packing follows a deterministic rule:
- all uniforms are treated as `f32` in uniform buffer packing, so shader comparisons requiring pass indices use `f32` logic.

## Temporal rendering and quality tiers

### 1. Preview vs Full is a quality-tier constraint
DISTORT enforces tiered rendering:
- PREVIEW uses a max dimension bound suitable for interaction
- FULL uses source resolution suitable for export and final rendering

Animation playback always runs at PREVIEW.

### 2. Preview cancellation semantics
Render requests follow explicit queue/cancellation behaviour:
- new PREVIEW renders cancel superseded queued PREVIEW work
- FULL renders do not cancel each other; they are processed sequentially

### 3. Worker responsiveness/watchdog
The worker restart policy is explicit:
- PREVIEW and FULL each have bounded responsiveness windows
- unresponsive worker triggers restart and re-queue of the current render

## Export and reproducibility surfaces

DISTORT supports:
- PNG export for current frame at FULL quality
- conditional SVG export when vector-capable modules define geometry for the full stack
- recipe save/load (serialised effect stack state)
- render sequence and variation grid generation via deterministic frame addressing

Reproducibility principle:
- every exported artefact is a function of input pixels, seed, stack ordering, params, and quality tier.

## Skills Demonstrated (competency tags)

- Node-graph semantics implemented as a sequential effect stack with explicit invalidation.
- Deterministic output across preview/full and across CPU/GPU tiers.
- Dual-backend shader authoring with mandatory static shader sources and uniform descriptors.
- Workgroup dispatch aligned with authoring constraints.
- Worker offload architecture with queue management and watchdog restart.
- Export contract design: PNG/SVG gating and recipe serialisation.

## Stack

- DISTORT host and worker orchestration: `assets/js/tools/processors/distort/`
- GPU compute tiering and dispatch: `assets/js/core/gpu-foundation.js` and `assets/js/tools/processors/distort/core/GPURenderPath.js`
- Shader sources: `assets/js/tools/processors/distort/shaders/*.shader.js`
- Canonical tool authority docs: `blog/docs/pages/tools/processors/distort/*`

