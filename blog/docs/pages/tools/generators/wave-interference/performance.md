# Wave Interference — Performance

## Dominant Operations

| Operation | Per-Frame Cost | Notes |
|---|---|---|
| Pixel iteration (first pass) | O(W × H) | 262,144 iterations at 512×512 |
| computeR / computeX / computeY | 3× per pixel | Each: 2 wave terms + conditional modulation = ~12–20 float ops |
| Float32Array alloc | O(W × H) | 1 MB allocation every frame |
| ImageData alloc | O(W × H) | 1 MB allocation every frame |
| Normalisation pass | O(W × H) | Second full iteration |
| `Math.sqrt` | O(W × H) | One sqrt per pixel for r computation |
| `putImageData` | O(W × H) | GPU transfer |

**Total complexity: O(W × H)** — linear in pixel count. No spatial data structures, no O(n²) cross terms.

## Frame Budget Analysis (512×512, 60 FPS)

Frame budget at 60 FPS: **16.7 ms**.

At 512×512 = 262,144 pixels, with ~20 float ops per pixel (3 components × ~6 ops each, plus sqrt), estimated raw computation: ~5–8 M float ops per frame. On modern hardware (V8 JIT, optimised arrays) this runs at approximately 8–15 ms on the main thread depending on modulation state and JIT warmup.

**Main-thread rendering is borderline at 60 FPS with all modulation active and complex parameter combinations.** The Worker path (`compute.worker: true`, `computePixels`) offloads computation to keep the main thread responsive.

The `compute: { interactionScale: 0.5 }` hint instructs ComputeScheduler to render at 50% resolution (256×256, 65,536 pixels) during slider interaction — reducing cost to ~25% for interactive response.

## Memory Allocations Per Frame

| Allocation | Size | Freed? |
|---|---|---|
| `Float32Array(W×H)` | 1,048,576 bytes (1 MB) | On GC after frame |
| `ImageData` (via createImageData) | 1,048,576 bytes (1 MB) | On GC after putImageData |

Two 1 MB allocations every frame at 60 FPS = 120 MB/s allocation pressure. This will trigger frequent GC pauses unless the host pools or reuses these buffers. Worker path transfers the buffer (zero-copy), mitigating GC on the main thread.

## Extreme Parameter Analysis

| Parameter | Extreme Value | Effect |
|---|---|---|
| `fr1`/`fr2`/`fx1`/`fy1` = 50 | Maximum frequency | ~100 zero-crossings across the normalised range; computation unchanged, but visual aliasing at low scale |
| `pr1` = −7 | Negative power | `safePow` diverges away from offset; produces star-burst singularities unless `Or1` keeps all pixels away from coordinate 0 |
| `scale` = 50 | Minimum scale | Coordinate range ~±5; high-frequency parameters produce dense aliasing |
| `scale` = 500 | Maximum scale | Coordinate range ~±0.5; only low frequencies are visible |
| All amplitudes = 0 | Uniform zero field | Range guard triggers (range=1); canvas renders mid-grey |

## Mitigation Candidates

| Issue | Mitigation |
|---|---|
| Per-frame Float32Array alloc | Pool one Float32Array per canvas size; reuse across frames |
| Per-frame ImageData alloc | Pool one ImageData per canvas size; reuse across frames |
| Math.sqrt per pixel | Can replace with squared-distance comparison where only r² is needed (does not apply here — r is directly used in trig) |
| Main-thread 60 FPS at full resolution | Worker path already specified; ComputeScheduler must invoke `computePixels` |
| Double-pass | Could do single pass with exponential moving min/max estimate, but accuracy is lost; two-pass is correct |

## Worker Feasibility

**High.** `computePixels` is already implemented in the source. The computation has no DOM dependencies, no canvas context usage, and no module-level state. The only concern is correctness of function serialisation (the inner `_safePow`, `_wave`, `_R`, `_X`, `_Y` functions must be serialised along with `computePixels` by the ComputeScheduler).

The `compute: { worker: true }` flag is set. Implementation depends on ComputeScheduler support.
