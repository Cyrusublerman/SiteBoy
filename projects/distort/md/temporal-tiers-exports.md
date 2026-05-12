### Temporal tiers

DISTORT supports three temporal modes, selected via the Canvas tab in the sidebar:

| Mode | `frameCount` | Transport strip | Animation |
|---|---|---|---|
| Still | 1 | Hidden | No |
| Sequence | 2–1000 | Visible | `buildAnimFrame` driven |
| Reactive | 1 | Hidden | Live audio or cursor modulation |

In **Sequence** mode, each frame is produced by calling `buildAnimFrame(frameIdx, totalFrames, params)` on every node that defines it, merging the returned `ParamPatch` into the base params, then executing the full pipeline. The pipeline cache operates per-frame: frame `n`'s output may be independently cached from frame `n+1`.

In **Reactive** mode (future), `modulate(x, y)` is driven by an external signal (microphone input or cursor position). The modulation hook passes a per-pixel scalar to the node's `apply()` function, allowing live spatial variation.

### Export targets

| Action | Format | Quality | Notes |
|---|---|---|---|
| EXPORT PNG | PNG | FULL | Single frame at source resolution |
| EXPORT SVG | SVG | — | Requires ≥1 node with `buildGeometry`; geometry only (no pixel data) |
| SAVE RECIPE | JSON | — | Serialised stack spec (moduleId + params only, no image data) |
| LOAD RECIPE | — | — | Deserialises a saved recipe; matched by moduleId |
| VARIATIONS | PNG × N | PREVIEW | N randomised seed variants side-by-side (N selectable: 4/9/16) |
| RENDER SEQUENCE | PNG × F | FULL | One PNG per frame, zip-archived for download |

### Recipe format

A recipe is a minimal JSON document:

```json
{
  "version": 1,
  "stack": [
    { "moduleId": "gaussian-blur", "params": { "radius": 4, "sigma": 1.5 } },
    { "moduleId": "sobel-edge",    "params": { "threshold": 0.3 } }
  ],
  "canvas": { "width": 1920, "height": 1080, "seed": 42, "frameCount": 1 }
}
```

Recipes do not embed image data. A recipe is portable across machines and can be applied to any source image. If a recipe references a `moduleId` that is not registered on the target instance, that node is skipped with a warning.

### Sequence export pipeline

When RENDER SEQUENCE is triggered:

1. The host sets quality to FULL and begins rendering frames `0..N-1` in order.
2. Each frame is rendered by the worker, returned as an `ImageBitmap`, converted to PNG via `OffscreenCanvas.convertToBlob('image/png')`.
3. PNGs are accumulated in memory (no intermediate disk I/O).
4. After all frames, the host zips the array using a streaming zip encoder and triggers a browser download.

For large sequences (>30 frames at 4K), the accumulated PNG array may exhaust memory. The tool currently warns when estimated memory exceeds 512 MB and asks the user to reduce frame count or resolution.

### VARIATIONS grid

VARIATIONS generates N images by: cloning the current stack spec, incrementing `seed` by `i` for each variant `i`, rendering all N at PREVIEW quality in parallel (N parallel worker renders), compositing the results into a single grid PNG, and prompting a download. The user can click any variant in the grid to apply its seed to the live stack.
