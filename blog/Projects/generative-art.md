# Generative Art

This document describes the site’s generative-art skillset: executable mathematical visualizations whose output is deterministic under a declared parameter space and a declared frame timeline.

## Technical Domain

Procedural rendering, parametric geometry, harmonic families, wave interference fields, phyllotaxis sampling, temporal animation, and export-ready rendering.

## Architecture

### 1. Generator-host contract
The unified generator host owns the page’s invariants:
- it exposes `#tools/generators` as the selection surface
- it renders through one of `{context: '2d'|'webgl'|'p5'}` based on generator reality (not intent)
- it enforces fixed layout regions: top toolbar, left sidebar, right canvas viewport
- it derives sidebar tabs from generator config:
  - `PARAMS` always
  - `ANIMATE` iff the generator config declares an `animation`
  - `EXPORT` always
  - `INFO` iff a description exists

Generator scripts must supply parameters and a draw path; they must not create competing DOM regions (no sidebar DOM, no custom toolbar, no custom export chrome).

### 2. Animation as declared sequence, not improvised playback
All generative animation timing is required to use `AnimationFoundation`. Frame progression originates at the host, which implies:
- determinism from `(params, frame)`
- pause-state correctness: pausing still renders a valid single frame
- no internal `requestAnimationFrame/setInterval/setTimeout` loops inside generator scripts

### 3. Temporal rendering primitives
Common render-stage patterns across the generative set:
- motion blur via temporal accumulation implemented as alpha-fade over the previous frame
- checkpoint interpolation for discontinuous parameter changes (notably wave-field stage transitions)
- frame-indexed parameter stepping (harmonic ratios, divergence-angle sweeps, phase offsets)

## Pieces (what the work produces)

### Parametric Curves + Harmonic Families
- **Lissajous family**: universal X/Y equation with modulation and delta coupling; framed as a coupled-oscillator parameter exploration.
- **Harmonics**: interval-ratio explorer with time warping near integer harmonic structure.

### Wave Patterns
- **Cymatics**: click-to-add source model for standing-wave interference; chord templates as structured wave sources.
- **Wave Interference**: spatial field model with R/X/Y components; phase animation and threshold/binary mode.

### Phyllotaxis and Spiral Geometry
- **Phyllo Spiral**: Vogel-style disk model with golden-angle azimuth and radius proportional to `sqrt(i)`.
- **Phyllo Spiral 2D**: phyllotaxis with explicit 2D construction, including parastichy-style polylines.
- **Phyllo Plane Animated**: divergence-angle sweep with distance-limited connections and transparency.
- **Spiral Equation**: generalised parametric spiral model \(r(\theta)\) with connect-every-*n* link structure.
- **Spiral Equation 2**: dual-interval connectivity with golden-angle stepping.
- **Spiral N-gon 3D**: phyllotaxis projected onto an N-gon cross-section (cone/helix geometry), with camera/orbit variants.
- **Spinning Phyllo Ball**: spherical Fibonacci lattice, indexed connections, and perspective projection.
- **Spin Spiral**: radius-growth + per-index rotation; trig-derived colour as a deterministic mapping.

### Recursion and Optical Illusions
- **Nested Circles**: recursive rolling geometry with modes and motion blur.
- **Squares**: structured tile timeline with easing + envelope stages and deterministic traversal orders.
- **Colour Square**: grid-based colour assembly driven by cell index; composition changes under a fixed interval schedule.

### Solid Geometry / Surfaces
- **Torus**: parametric torus wireframe with surface spirals and global rotation.
- **Clock**: time-driven geometry (clock as a rendering spec rather than UI state).
- **Solar-system / Kepler-style clock**: orbital parameter rendering as a deterministic time-to-geometry mapping.

## Common Methods (reused techniques)

### 1. Named parameter spaces
Each piece declares:
- a primary coordinate family (polar, Cartesian, spherical, screen space)
- a deterministic sample rule (step, index, interval, connectivity)
- a mapping from symbolic parameters to render state (phase, divergence angle, frequency ratios, threshold)

### 2. Wave evaluation patterns
Wave-like pieces share an evaluation structure:
- compute wave basis terms via standard `sin/cos` forms
- combine terms via sum or multiply depending on blending mode
- optionally apply binary thresholding to convert a continuous interference field into discrete topology

### 3. Temporal integration
Motion blur and checkpoint interpolation treat time as a first-class dimension:
- alpha-fade integration over the prior frame
- smooth transition functions (for discontinuities) rather than abrupt jumps

### 4. Deterministic exportability
The generator approach requires that every visible frame is reproducible from:
- seed/state inputs (where applicable)
- parameter config
- frame index

This enables static export for a given frame and sequence export when animation exists.

## Skills Demonstrated (competency tags)

- Parametric geometry translation (model → implementable state machine)
- Harmonic/wave synthesis from named ratios and phases
- Phyllotaxis sampling and parastichy connectivity construction
- Temporal determinism via `AnimationFoundation`
- Render-stage separation: simulation/update vs draw vs viewport display transforms
- Host-compliant generator authoring (sidebar tab law, forbidden internal loops, engine-choice law)

## Stack

- Generator host contract and UI invariants: `#tools/generators` docs in `blog/docs/pages/tools/generators/`
- Animation timing: `assets/js/core/animation-foundation.js`
- Generative implementation layer: `blog/docs/pages/art/generative/*` for piece specs, plus the registered generator packs under `blog/docs/pages/tools/generators/`

