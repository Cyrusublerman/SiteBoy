# Module Maths Standards

Applies to the documentation of effect modules, specifically to the `mechanisms.md` pack file. Every formula or mathematical operation in a module source must be documented to the standards defined here. A `mechanisms.md` that contains no formulas when the source contains mathematical operations is incomplete.

---

## 1. Formula Notation

Write every non-trivial formula as an inline formula immediately followed by a definition block for every symbol.

**Format:**

```
**<Formula name>:**
`<formula in inline notation>`

where:
- `<symbol>` — <what it represents>, <unit or domain>
- `<symbol>` — <what it represents>, <unit or domain>
```

**Example — Gaussian kernel weight from GaussianBlurNode.js:**

**Gaussian kernel weight:**
`w[i] = exp(−i² / (2σ²))`

where:
- `w[i]` — weight at offset `i` pixels from the kernel centre (dimensionless, range 0–1)
- `i` — pixel offset from centre (integer, range `[−radius, radius]`)
- `σ` — standard deviation in pixels; derived from `blurRadius` as `σ = blurRadius / 3` (pixels)
- Kernel is normalised: `Σw[i] = 1` over all `i`

**Example — Gray-Scott reaction-diffusion step from ReactionDiffusionNode.js:**

**Gray-Scott update (u):**
`Δu = Du × ∇²u − u×v² + F×(1 − u)`

where:
- `Δu` — change in activator concentration per timestep (dimensionless per frame)
- `Du` — diffusion coefficient for u (dimensionless; typically 0.2)
- `∇²u` — discrete Laplacian of u at the current cell (5-point stencil)
- `u, v` — activator and inhibitor concentrations (dimensionless, range 0–1)
- `F` — feed rate parameter (dimensionless; from `params.feedRate`)

---

## 2. When a Formula Is Required

A formula is required whenever the source contains a non-trivial mathematical operation.

**Always document:**
- Convolution kernel weights (Gaussian, bilateral, box)
- Gradient operators (Sobel, Laplacian, Prewitt)
- Reaction-diffusion update rules (Gray-Scott, Turing)
- Signal operations with a defined filter formula (high-pass, unsharp mask)
- Normalisation and modular arithmetic used for colour or angle
- Distance and geometry operations (warp, displacement, polar conversion)
- Any weighted sum, interpolation, or blending formula
- Phase and frequency expressions in wave or moire modules

**One-liners that can be described in prose (no formula block required):**
- `(i * 4)` — stride computation, universally understood
- `Math.max(0, Math.min(v, 255))` — RGB clamp; prose is sufficient
- `Math.sqrt(dx*dx + dy*dy)` — Euclidean distance; note in function inventory but no formula block needed

When in doubt, write the formula. Over-documentation is preferable to under-documentation.

---

## 3. Variable Definition Requirements

Every symbol that appears in a formula must be defined immediately after the formula. Definitions must state:

1. **What it represents physically or geometrically.** "The weight" is insufficient. "The kernel weight at offset i, representing the contribution of the pixel at distance i to the output pixel" is required.

2. **Its unit or domain.** Examples:
   - `pixels` for spatial distances
   - `dimensionless, range 0–1` for normalised quantities
   - `integer, range [0, w×h)` for pixel indices
   - `RGBA channel value, range 0–255` for colour components
   - `radians` for angles in warp or polar modules

3. **Its source.** Is it a `params.*` value read via `this.getModulated(...)`? A derived intermediate? A fixed constant? Name it.

---

## 4. Mathematical Model Classification

Every module's `mechanisms.md` must state the class of mathematics used, in the opening section.

**Classification examples for distort modules:**

| Module type | Model class |
| --- | --- |
| Gaussian blur | Signal processing: Gaussian convolution (linear separable kernel) |
| Bilateral filter | Signal processing: edge-preserving joint bilateral filter |
| Reaction-diffusion | Coupled PDEs: Gray-Scott model, explicit Euler discretisation |
| Flow field | Vector field warp: Perlin-noise-derived displacement field |
| Otsu threshold | Statistical segmentation: optimal bimodal histogram threshold |
| Sobel edge | Gradient estimation: first-order discrete derivative (Sobel operator) |
| Voronoi | Computational geometry: nearest-centroid tessellation |
| Domain warp | Fractal displacement: iterated noise-domain warp |
| HSL adjust | Colour space transformation: cylindrical HSL model |
| Polar coords | Coordinate transformation: Cartesian-to-polar remapping |

If the module is a lookup or remap with no named mathematical basis, state: "This module uses a parameter-driven lookup with no named mathematical model."

---

## 5. Complexity Notation

State algorithmic complexity in Big-O notation for every loop or recursive operation. Define `n` explicitly.

**Format:** `O(f(n)) where n = <what n is>`

**Examples for distort modules:**

- `O(w × h) where w = output width, h = output height` — per-pixel operation; the baseline for all pixel modules
- `O(w × h × k) where k = 2×radius+1` — separable convolution with kernel size k
- `O(w × h × iterations) where iterations = params.iterations` — iterative physics step
- `O(w × h × r²) where r = params.radius` — O(r²) area per pixel (bilateral filter)
- `O(1)` — constant-time operation (colour remap, LUT lookup)

When a loop is bounded by a parameter, state the complexity as a product. This makes the performance impact of the parameter explicit.

---

## 6. Floating-Point Precision Notes

Note any operation where precision loss is a realistic concern.

**Precision risks to document:**
- Accumulated warp offsets: if warp vectors are summed over many iterations (iterative rewarp), the offset can accumulate floating-point error. Note if the module bounds or resets the accumulation.
- LUT index quantisation: when param values are mapped to LUT indices (`Math.round`, `Math.floor`), note if rounding produces visible banding at coarse step sizes.
- Colour space roundtrip: HSL → RGB → HSL conversions accumulate rounding error in channel values. Note if the module performs multiple roundtrips.
- Kernel normalisation: if kernel weights are normalised by their sum (`Σw`), precision loss in the sum can cause a DC offset in the output. Note if the module uses `Float32Array` vs. `Float64Array` for kernel weights.

**Format for precision notes:**

```
**Precision note:** Accumulated warp offset in iterative rewarp.
After `iterations` passes, the warp displacement `(dx, dy)` is the sum of
`iterations` per-pixel noise samples. At `iterations = 20` (max), total
accumulated offset can reach 20× the base warp magnitude. The source does
not clamp the accumulated offset — at extreme values this may cause pixels
to sample far outside the buffer boundary, hitting the clamped edge case.
```

If no precision risks exist, state: "No precision risks identified in this module."

---

## 7. When to Escalate a Formula to the Algorithm Library

A formula or algorithm in a module is a candidate for escalation when:

1. It is used in more than one module (or is likely to be)
2. It is non-trivial (more than a one-liner)
3. It can be parameterised and called as a standalone function
4. It has a name in the field

**Examples of escalation candidates:**
- Gaussian kernel construction — used by GaussianBlurNode, BilateralFilterNode; general
- Sobel operator — used by SobelNode, CannyNode, DomainWarpNode; general image gradient
- Bilinear pixel sampler — used by FlowFieldNode, AdvectionNode, IterativeRewarpNode; general
- Gray-Scott step — used only by ReactionDiffusionNode but a well-known named algorithm

**Escalation record format** (in `issues-and-conflicts.md`):

```
[NOTE] [ESCALATION] Algorithm candidate: <name>
Location: <function name> in <source file>
Description: <what it computes, one sentence>
Candidate library location: assets/js/shared/algorithms/<module>/<file>.js
Reason: non-trivial, named algorithm, likely reusable
```

Escalation does not block documentation or implementation. Flag and continue.
