**Status:** DESIGN | **Cluster:** halftone-stipple

## Stipple (TO FIX)

Converts an input image into a density-controlled dot field (pointillism).

This module operates only on the current image buffer and outputs a point representation (vector and/or raster). It does not handle colour grading, compositing, masking, or file management. It assumes luminance is already defined or uses the host pipeline’s luminance model.

---

### Inputs

**Tone → Density**
- `luminanceCurve` — maps luminance (0–1) → relative dot density (0–1).
- `minDensity` — lower density bound.
- `maxDensity` — upper density bound (absolute cap).

**Distribution**
- `randomness` — 0 (grid) → 1 (blue-noise / Poisson).
- `distributionMode` — `"grid" | "jittered" | "poisson"`
- `minSpacing` — minimum centre-to-centre distance.

**Dot Geometry**
- `dotShape` — `"circle" | "square" | "jitteredCircle" | "inkBlob"`
- `sizeMapping` — luminance → radius function (linear, power, quantised).
- `collisionMode` — `"fixedRadius"` | `"variableRadius"`

**Rendering**

- `dotColour` — fixed colour or `"sample"`
- `opacity` — constant or luminance-mapped
- `backgroundColour` — fill colour
- `edgeBehaviour` — `"crop" | "wrap" | "clamp" | "fade"`

**Control**

- `iterations` — relaxation/optimisation passes
- `seed` — deterministic random seed
- `outputMode` — `"vector" | "raster" | "both"`

---

### Outputs

- `points[]` — `{x, y, radius, colour, opacity}`
- `vector` — SVG/PDF representation (optional)
- `raster` — rendered bitmap (optional)

---

### Internal Mechanism (Module Scope)

1. Convert image → luminance field.
2. Apply `luminanceCurve` to derive density field.
3. Generate initial point set according to `distributionMode` and `minSpacing`.
4. Relax/optimise point positions for spacing and density fidelity (`iterations`).
5. Assign radius, colour, opacity.
6. Render to requested output mode.

## Turing Pattern (Enhanced)

Generates emergent Turing-like structure via iterative spatial feedback. Operates as a single transform in a larger image pipeline: raster in → raster out, with optional auxiliary outputs for diagnostics or downstream compositing.

No UI, no file I/O, no layer management. All locality (masking, region control, modulation) is provided via optional input fields.

### Inputs

Primary controls

- `mode` — `"unsharpFeedback" | "reactionDiffusion"`
    
- `iterations` — integer step count.
    
- `seed` — deterministic seed (only affects noise injection and any stochastic kernels).
    

Colour space / target channels

- `colourSpace` — `"RGB" | "HSB" | "Lab" | "lumaOnly"`
    
- `channelPolicy` — `"all" | "lumaOnly" | "chromaOnly" | "custom"`
    
- `channelMult` — per-channel multipliers (space-dependent; e.g. RGB: `{r,g,b}`).
    

Masking + modulation (pipeline integration)

- `mask` — optional greyscale buffer (0–1) modulating effect strength per-pixel.
    
- `maskMode` — `"multiply" | "add" | "override"`
    
- `controlField` — optional scalar buffer (0–1) used to spatially modulate parameters.
    
- `controlMapping` — mapping rules: which params are modulated and how (min/max, curve).
    

Initialisation

- `initialNoise` — `0..1` amplitude.
    
- `initialNoiseMode` — `"none" | "additive" | "blueNoise" | "filmGrain"`
    
- `initialNoiseOpacity` — `0..1` (if noise is layered rather than added).
    
- `initialiseFromImage` — boolean (true = seed state from input image; false = start from neutral fields).
    

Spatial operator (blur / diffusion)

- `kernelType` — `"gaussian" | "box" | "bilateral" | "DoG"`
    
- `kernelTaps` — `9 | 13 | 25` (quality vs speed).
    
- `blurRadius` — base spatial scale (px).
    
- `blurRadius2` — optional second radius (px) for multi-scale.
    
- `blurMix2` — weight for second radius contribution.
    
- `radiusSchedule` — optional curve over iterations (e.g. small→large).
    
- `anisotropy` — `{aspect, angle}` for elliptical sampling (aspect ≥ 1).
    
- `kernelRotation` — rotation applied to sampling pattern (static or from `controlField`).
    

Gating + nonlinearity (reaction shaping)

- `threshold` — magnitude threshold for reaction.
    
- `thresholdMode` — `"hard" | "soft"`
    
- `softThresholdWidth` — width for smooth gating (only if soft).
    
- `diffCurve` — mapping from |diff| to response (curve / power / spline).
    
- `signedPower` — exponent p for `diff * |diff|^(p-1)` (p=1 is linear).
    
- `clampReaction` — max reaction magnitude per step (scalar or per-channel).
    
- `clampMode` — `"clamp" | "softclip" | "wrap"`
    

Stability + energy management

- `decay` — decay factor per iteration.
    
- `decayMode` — `"multiply" | "towardsMean" | "towardsNeutral"`
    
- `targetMean` — desired mean (per-channel or luma) if `towardsMean`.
    
- `energyConserve` — boolean; normalises drift (histogram/mean/variance constraint).
    
- `stopCondition` — optional early stop: `{type:"delta", epsilon, window}`.
    

Unsharp-feedback parameters (mode = `"unsharpFeedback"`)

- `blurStrength` — weight of blurred term in subtraction.
    
- `amount` — reaction gain (adds diff back).
    

Reaction–diffusion parameters (mode = `"reactionDiffusion"`, Gray–Scott style)

- Fields:
    
    - `fieldSpace` — `"AB"` (2-field) stored in RG channels (or float textures).
        
    - `mapIn` — mapping from image → initial A,B (presets or custom).
        
    - `mapOut` — mapping from A,B → output colour (presets or custom).
        
- Dynamics:
    
    - `Da` — diffusion rate for A.
        
    - `Db` — diffusion rate for B.
        
    - `feed` — feed rate.
        
    - `kill` — kill rate.
        
    - `dt` — time step scale.
        
    - `laplacianKernel` — `"5tap" | "9tap"` (diffusion operator).
        
- Optional spatial modulation:
    
    - `feedField`, `killField`, `DaField`, `DbField` — derived from `controlField` mapping.
        

Output control

- `outputBitDepth` — `"8" | "16" | "float"`
    
- `outputMode` — `"final" | "final+debug"`
    
- `debugOutputs` — booleans selecting auxiliary buffers:
    
    - `blurred`, `diff`, `thresholdMask`, `reaction`, `energyMap`, `fieldsAB`, `stats`
        

### Outputs

- `raster` — processed image buffer (same resolution as input unless host provides resample).
    
- `debug` (optional) — dictionary of auxiliary buffers selected by `debugOutputs`.
    
- `stats` (optional) — per-iteration or final metrics: `{mean, variance, clippedPct, delta}`.
    

### Mechanism (module scope)

Common pre-step

1. Convert input to working space (`colourSpace`) and determine working channels (`channelPolicy`).
    
2. Initialise internal state:
    
    - `unsharpFeedback`: start from input buffer (optionally noise-injected).
        
    - `reactionDiffusion`: initialise A/B fields via `mapIn` (optionally noise-injected).
        

Per-iteration update (unsharpFeedback)

1. Compute blurred term using `kernelType`, `kernelTaps`, `blurRadius` (+ optional second radius mix), with optional anisotropy/rotation.
    
2. Compute difference: `diff = centre − (blurred * blurStrength)`.
    
3. Gate diff via `thresholdMode` (hard/soft) and apply `diffCurve` / `signedPower`.
    
4. Reaction: `reaction = diff * amount * channelMult`.
    
5. Apply masking: combine `mask` with `maskMode`, then scale reaction locally.
    
6. Clamp reaction via `clampReaction` and `clampMode`.
    
7. Update: `next = applyDecay(centre + reaction, decay, decayMode, targetMean, energyConserve)`.
    
8. Swap ping-pong buffers.
    

Per-iteration update (reactionDiffusion)

1. Compute Laplacian for A and B using `laplacianKernel` (optionally edge-aware diffusion if `kernelType=bilateral`).
    
2. Apply Gray–Scott update:
    
    - `A += (Da * lapA − A*B*B + feed*(1−A)) * dt`
        
    - `B += (Db * lapB + A*B*B − (kill+feed)*B) * dt`
        
3. Spatially modulate params if fields are enabled (via `controlField` mappings).
    
4. Optional stabilisation: clamp/softclip A,B to valid ranges; apply energy management if enabled.
    
5. Swap A/B buffers.
    

Finalisation

- Convert working representation back to output colour:
    
    - `unsharpFeedback`: convert from working space, apply output clamp.
        
    - `reactionDiffusion`: render using `mapOut` (e.g., B as structure mask, A as base), optionally blend with original via mask.
        

### Responsibility boundary

- Input: raster buffer + optional mask/control fields + parameters.
    
- Output: raster buffer + optional debug buffers/stats.
    
- No persistence beyond invocation (unless host explicitly caches internal state for animation).
    
- No assumptions about pipeline order; safe to chain before/after other modules.
    

### Minimal parameter sets (two presets)

Unsharp-feedback (classic)

- `mode:"unsharpFeedback"`, `blurRadius`, `blurStrength`, `amount`, `thresholdMode:"soft"`, `softThresholdWidth`, `decay`, `clampReaction`, optional `mask`.
    

Reaction–diffusion (true Turing)

- `mode:"reactionDiffusion"`, `Da`, `Db`, `feed`, `kill`, `dt`, `laplacianKernel`, `mapIn/mapOut`, optional `controlField` to modulate feed/kill spatially.

## Paint Stroke


---

## Related ideas

- [Smart Halftone System](../smart-halftone-system/00-overview.md)
- [Topographic Dot Halftone](../topographic-dot-halftone/00-overview.md)
- [ASCII Art Generator](../ascii-art-generator/00-overview.md)
- [Stipple → Single-Line Path](../../art/generative/stipple-single-line-path.md)
- [Complex Line Shading](../complex-line-shading/00-overview.md)
- [Cloth Shrink Halftone](../cloth-shrink-halftone/Matt's Webcorner - Cloth.md)
