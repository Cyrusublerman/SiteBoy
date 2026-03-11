# Quine — Performance

## Complexity

Let W, H = 1080. Per-frame operations:

### Text Rendering (`_imagined`)
- `im.clear()` + `im.background()`: O(W×H)
- `im.text()` per visible line: O(maxLines × lineLen) for glyph rasterisation (browser-managed, fast in practice)
- `maxLines = floor((H − 2×margin) / lineHeight)` ≈ 40–70 visible lines at defaults

### `_absorbInk`
- Iterates all pixels: **O(W×H)** = 1,166,400 iterations
- Per pixel: 3 comparisons, 2–3 arithmetic ops (fast)

### `_diffuse`
- Two full passes over all interior pixels: **2 × O(W×H)** = ~2.3M iterations
- Per pixel: 1 threshold check, 4-neighbourhood scan, 12 arithmetic ops
- Dominant CPU cost: **~28M arithmetic ops per frame**

### Composite
- O(W×H): 1 comparison + 3–5 arithmetic ops per pixel

**Total per-frame: O(W×H) dominated by 3 full pixel-array passes.**

## Frame Budget

At 60 fps, budget = 16.7 ms.

| operation | ops/frame | estimated time |
|---|---|---|
| `_absorbInk` | ~3.5M | ~3–5 ms |
| `_diffuse` (2 passes) | ~28M | ~15–25 ms |
| composite | ~5M | ~3–5 ms |

**Expected frame rate**: ~20–40 fps at defaults. The `_diffuse` pass is the dominant bottleneck. At maximum `urgency=20` and minimum `entropy=0.01`, more pixels will be active per frame (gravity threshold more likely exceeded), increasing the effective cost of the neighbourhood bleed loop.

## Memory

- `_residue`, `_echo`, `_reflection`: 3 × (1080×1080×4 floats) × 4 bytes = **3 × 18.7 MB ≈ 56 MB** of Float32Array. This is the dominant memory cost.
- `_imagined`: ~4.5 MB (Uint8ClampedArray managed by P5/browser).

Total additional heap: ~60–65 MB. May cause pressure on low-memory devices.

## Web Worker Feasibility

**Moderate.** Barriers:
- `_imagined` uses `p.createGraphics` (P5/canvas API) — not available in Workers.
- Text rasterisation and `im.text()` require a canvas context.
- `_absorbInk` reads from `imagined.pixels` (Uint8ClampedArray).

**Partial offload is feasible**: the `_diffuse` and composite steps operate only on `Float32Array` and could be moved to a Worker with `SharedArrayBuffer`. The text render + absorb step must remain on the main thread.

## Mitigation Candidates

1. **Limit diffusion iterations**: run `_diffuse` only on a bounding box of active (wet > threshold) pixels rather than the full canvas.
2. **Reduce `Float32Array` precision**: RGBA could be packed as `Uint16Array` or `Uint8Array` with fixed-point, reducing memory and improving cache efficiency.
3. **Typed `_diffuse` kernel in WASM**: the tight loop is a good candidate for WASM compilation.
4. **Skip diffuse on dormant/clearing frames**: no new ink is absorbed during clearing; diffusion could be reduced to a simple decay-only pass.
