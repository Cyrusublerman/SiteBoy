### Source

`assets/js/tools/pixel-tiler-toolbase.js`. Original reference implementation: `reference/QuickToolRebuildReference/Tools/pixel-tiler/dist/script.js`. The ToolBase port splits the original monolithic structure into a declarative `TOOL_CONFIG` with four-tab sidebar and a set of pure helper functions.

### Module structure

| Function | Responsibility |
|---|---|
| `prepareImages(images)` | Normalise all four sources to minimum common dimensions |
| `generatePermutations(images)` | Build the 24-element permutation list |
| `generateAllCombinations(images)` | Build the 256-element combination list |
| `createTiledImage(frames, W, H, assignment)` | Render one frame from an assignment map |
| `buildFrameCache(mode)` | Lazily populate the frame array for the active mode |

State is a plain object (`state`) at module scope, tracking the four normalised `ImageData` buffers, the active mode's frame list, the current frame index, and the `AnimationFoundation.AnimationLoop` instance.

### ToolBase wiring

The three-tab sidebar (IMAGES, CONTROLS, EXPORT) maps directly to the pipeline phases. File inputs for A, B, C, D trigger `loadImage` on change; `loadImage` draws the uploaded file to an off-screen canvas and stores the resulting `ImageData`. The mode dropdown rebuilds the frame list when changed.

```javascript
onUpdate(key, value, allValues) {
    if (['imageA','imageB','imageC','imageD'].includes(key)) {
        this.loadImage(key.slice(-1), value);
        if (this.allImagesLoaded()) this.processImages(allValues);
    }
    if (key === 'mode') {
        this.currentMode = value;
        this.buildFrameCache(value);
    }
    if (key === 'fps' && this.animator) {
        this.animator.setFps(value);
    }
}
```

### Memory management

Pre-computing all 256 frames of a 1024×1024 source set would require 256 × 4 × 2048 × 2048 ≈ 4 GB, which is impractical. Instead, frames are rendered on demand and stored only if memory allows. The practical limit is governed by browser `ArrayBuffer` quotas. In the default 420×420 canvas size the 256-frame cache is 256 × 4 × 840 × 840 ≈ 724 MB — still large. The implementation therefore renders each frame into a single reused `ImageData` object and only materialises the full cache when the user initiates a GIF or batch PNG export, after which the cache is freed.

### Performance notes

The core tiling loop processes 4 channels per pixel and runs at near-memory-bandwidth speed (no arithmetic heavier than bitwise ops). At 420×420 native (840×840 output), a single frame renders in under 5 ms, giving comfortable headroom for 60 fps playback. At 2048×2048 native (4096×4096 output) a single frame takes approximately 300 ms in single-threaded JS, making real-time animation impractical at that size. A future improvement would offload the tiling loop to a `Worker` via `SharedArrayBuffer` or use `OffscreenCanvas` to parallelise frame generation for the GIF export path.
