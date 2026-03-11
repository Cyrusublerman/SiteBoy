# Wave Interference (P5) — Performance

## Complexity

Let `W`, `H` = canvas dimensions, `R` = resolution (block size). Effective pixel count = `(W/R) × (H/R)`.

Per effective pixel:
- 2 × `_calcNormal`: each calls `_sumHeight` 4 times × 2 sources = 8 `_waveHeight` calls
- 1 × `_sumHeight(allSources)`: 4 `_waveHeight` calls
- Total `_waveHeight`: **20 per pixel** (each = 1 sqrt + 1 sin + ~5 arithmetic)
- 12 `atan2` calls in `_deltaToRGB`
- 2 `sqrt` for `_normalise` (×2 normals)

**Per-frame: O((W × H / R²) × 20)** ≈ **O(W × H × R⁻²)**.

At defaults (1080×1080, resolution=2): `540 × 540 = 291,600` effective pixels × 20 sqrt/sin ≈ **~5.8M floating-point ops per frame**.

## Frame Budget

At 60 fps target, frame budget = 16.7 ms. The computation is extremely heavy for the main JS thread.

| resolution | effective pixels | expected frame rate (main thread) |
|---|---|---|
| 1 | 1,166,400 | ~2–5 fps |
| 2 (default) | 291,600 | ~5–15 fps |
| 4 | 72,900 | ~20–40 fps |
| 6 | 32,400 | ~40–60 fps |

Estimates assume ~200 ns per `_waveHeight` call on a mid-range CPU.

## Dominant Operations

1. **`_waveHeight`**: sqrt + sin per call, called 20× per effective pixel — dominant.
2. **`_deltaToRGB`**: 12 `atan2` calls per pixel — secondary cost.
3. **`_hueShift`**: RGB→HSL→RGB conversion — tertiary.
4. **Pixel buffer write**: linear array fill, negligible.

## Extreme Parameter Values

- `resolution=1, amplitude=12, all loops=30`: maximum effective pixels + complex interference patterns. Likely sub-5 fps on main thread.
- `resolution=6`: frame budget easily met even at high amplitude/frequency.

## Memory

Frame state: no persistent arrays. Source positions computed per-frame. No state accumulation. Memory footprint = ~1080×1080×4 bytes ≈ 4.5 MB (pixel buffer, managed by P5).

## Web Worker Feasibility

**High.** The generator is stateless and deterministic:
- Each frame's pixel output depends only on `params` and `frame` number.
- No P5-specific rendering calls in the computation (only pixel writes).
- Could offload `_calcNormal`, `_deltaToRGB`, `_hueShift`, and pixel fill to a Worker using `SharedArrayBuffer` or `postMessage` with `Transferable`.
- Main thread retains `loadPixels`/`updatePixels`.
- Feasibility equivalent to `p5-wave-colour` — strong candidate for Worker offload.

## Mitigation Candidates

1. **Web Worker offload**: highest impact, eliminates main-thread jank.
2. **Reduce `atan2` calls in `_deltaToRGB`**: 12 `atan2` per pixel could be reduced by caching `atan2(ref.component, ref.component)` outside the pixel loop (only 3 ref-atan2 values per frame).
3. **WASM sinusoid kernel**: replace `_waveHeight` loop with a WASM-compiled function using `Math.sin` approximation (Taylor or LUT).
4. **LUT for `Math.sin`**: precompute sin values for quantised `(freq × d − spd × time)` arguments.

## Key Constraint

The `_perimeter` constant is hardcoded to 4320. If canvas dimensions differ from 1080×1080, source start offsets (computed in `p5Draw` using `2*(W+H)`) will be inconsistent with `_perimeter`. Mismatched perimeter causes source position errors at non-square or non-1080 canvases.
