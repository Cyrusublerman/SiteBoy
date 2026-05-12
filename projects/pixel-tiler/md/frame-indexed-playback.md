### Deterministic rendering

The tiling function `createTiledImage(frames, W, H, assignment)` is a pure function of its inputs: given the same four normalised `ImageData` buffers and the same assignment, it always produces the same output. This determinism is the basis of the export model: any frame can be regenerated on demand without storing all 256 rendered images simultaneously. The frame cache is a simple indexed array of `ImageData` objects constructed lazily on first access and reused on re-draw.

### AnimationFoundation integration

Playback is managed by `AnimationFoundation.AnimationLoop` rather than a raw `requestAnimationFrame` loop. The animation state is:

```javascript
{
    currentFrame: 0,          // index into the active combination list
    totalFrames: N,           // 1, 24, or 256
    fps: 24,                  // configurable
    isPlaying: false
}
```

Each tick of `AnimationLoop.onFrame` advances `currentFrame` by 1 (wrapping at `totalFrames`), retrieves the pre-computed or lazily-generated `ImageData` for that index, and calls `ctx.putImageData` on the tool canvas. The display canvas is rescaled to the container via CSS; `putImageData` always writes at native resolution.

### Frame stepping

A stepper control exposes direct frame navigation (next/prev). The stepper dispatches to the same rendering path as the animation loop, with `AnimationLoop` paused. This allows frame-accurate scrubbing through the 256 combinations.

### GIF export

The GIF export path uses the `gif.js` library running in a Web Worker. The export algorithm:

1. Ensure all \(N\) frames are pre-rendered into `ImageData` objects (lazy cache is flushed).
2. Initialise a `GIF` instance with `workers: 4`, `quality: gifQuality`, `loop: gifLoop ? 0 : -1` (0 = infinite loop, -1 = no loop).
3. For each frame index \(i \in [0, N)\), add the frame's canvas via `gif.addFrame(canvas, { delay: 1000/fps, copy: true })`.
4. On `gif.on('finished', blob)`, trigger a download via `URL.createObjectURL`.

The `copy: true` flag is essential: without it, `gif.js` takes a reference to the canvas context and all frames end up showing the last canvas state, since the canvas is mutated between `addFrame` calls.

### PNG export

Single-frame export uses `canvas.toBlob('image/png')` on the display canvas at its native resolution (2×W × 2×H). The filename embeds the active frame index and mode, e.g. `pixel-tiler-all-frame-127.png`.

Exporting all frames as individual PNGs iterates over the combination list, renders each frame to the canvas sequentially, and triggers a download for each via a short `setTimeout` gap to avoid browser throttling. A progress indicator is shown in the sidebar status line during the batch.
