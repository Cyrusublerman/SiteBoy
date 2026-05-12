### Example 1: Colour Quantizer

**Brief**: "I want a tool that reduces the number of colours in an image and applies dithering."

**Phase 1 output** — glossary: colour quantisation, palette, dithering, error diffusion, ordered dither, blue noise, CIELAB.

**Phase 3 research** — Wikipedia articles parsed: CIELAB, CIE XYZ, sRGB, Floyd-Steinberg, Bayer matrix, blue noise.

**Phase 5 gap analysis**:

| Requirement | Status |
|---|---|
| `linearise(r)` (sRGB gamma) | 📚 Research → implemented as `COLOR-001` |
| `rgbToLab(r, g, b)` | 📚 Research → implemented as `COLOR-002` |
| `deltaE76(lab1, lab2)` | 📚 Research → implemented as `COLOR-003` |
| `pickNearest(pixel, palette)` | ❌ Missing → implemented as `IMG-001` |
| `floydSteinberg(pixels, w, h, palette)` | 📚 Research → implemented as `IMG-006` |
| `bayerThreshold(x, y, n)` | 📚 Research → implemented as `IMG-007` |

**Phase 7** — tool wired at `/#tools/colour-quantizer`. All six functions imported from shared library; no algorithm logic inlined in the tool file.

**Outcome**: the colour quantizer relies on six discrete library modules, each traceable to a Wikipedia article and a typed function signature. A second tool needing Delta E distance (`deltaE76`) imports `COLOR-003` directly without re-implementing it.

---

### Example 2: Wave Interference Simulator

**Brief**: "I want to show how waves from multiple sources superpose on a 2D plane."

**Phase 2 decomposition**:
```
1. Define N point sources with position (x, y), amplitude A, frequency f, phase φ
2. For each pixel (px, py), compute distance r_i to each source
3. Compute wave contribution: A_i × sin(2π f t - k r_i + φ_i)
4. Sum contributions across sources: u(px, py, t) = Σ contributions
5. Map sum to colour (positive → warm, zero → neutral, negative → cool)
```

**Phase 5 gap**:

| Requirement | Status |
|---|---|
| `WaveSource` class | ❌ Missing |
| `waveAt(source, x, y, t)` | ❌ Missing |
| `waveSum(sources, x, y, t)` | ❌ Missing |

All three were research gaps — the wave equation is well-documented in physics but was not yet in the shared library. Phase 3 produced `Wave_equation.md` from Wikipedia. Phase 6 implemented:

$$
u(x, y, t) = \sum_{i=1}^{N} A_i \sin\!\left(2\pi f_i t - k_i r_i + \phi_i\right), \quad r_i = \sqrt{(x-x_i)^2 + (y-y_i)^2}$$

where \(k_i = 2\pi f_i / c\) is the wave number and \(c\) is wave speed.

**Phase 7** — tool wired at `/#tools/wave-interference`. Animation uses `AnimationFoundation.AnimationLoop`; the wave sum is computed on each frame by calling `waveSum(sources, px, py, frameIdx / fps)`.

---

### Example 3: Process applied to DISTORT

DISTORT's 69-module effect library was produced by applying the pipeline to a larger scope. The Phase 2 decomposition produced 21 effect categories. Each category's algorithms were researched in Phase 3. Phase 4 produced module IDs (`gaussian-blur`, `sobel-edge`, `gray-scott`, etc.). Phase 5 gap analysis identified GPU-eligible modules (those where per-pixel operations are parallelisable). Phase 6 implemented the `apply()` interface. Phase 7 wired the plugin architecture so modules are registered by ID and loaded dynamically.

The result: any new effect module can be added to DISTORT by implementing the module contract (see *DISTORT — Module Contract*) without touching the host, the pipeline engine, or the routing system.

---

### Cross-project library reuse

The taxonomy approach produces measurable reuse:

| Module | Used by |
|---|---|
| `COLOR-003: deltaE76` | Colour Quantizer, Multifilament Print, DISTORT (dither modules) |
| `IMG-006: floydSteinberg` | Colour Quantizer, Pixel Tiler, DISTORT |
| `PHYS-001: waveSum` | Wave Interference, Cymatics, Wave Equation Synth |
| `MATH-004: lerp` | Generative Art pieces, all animation tools |
| `GEO-002: poissonDisk` | Line Shading, Cymatics |

Each new tool that needs an existing module gets it for free. The marginal cost of each additional tool decreases as the library grows.
