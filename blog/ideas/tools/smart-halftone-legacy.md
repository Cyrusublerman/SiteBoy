# Smart Halftone Engine
**Status:** ARCHIVED
**Canonical:** false | **Superseded by:** [tools/smart-halftone-system/00-overview.md](../tools/smart-halftone-system/00-overview.md)



## 1. Overview

**Purpose:** A modular, field-based halftoning engine where linework and patterns are derived from the image and scalar fields (e.g. greyscale, distance fields, RD fields, geometry maps), rather than from fixed straight lines or simple screens.

**Output Type:** Static Image (primary), with extensions to Animation and Shader-Based Rendering.

**Target User:** Technical artists, generative designers, shader authors, and tool developers who want controllable, structure-aware halftones that can be reconfigured via node-based/OOP modules.

---

## 2. Parameters

### Core Parameters

These are the high-level knobs exposed in the sidebar. Internally they route into lower-level modules and node networks.

| Parameter               | Type    | Range / Options          | Default         | Step   | Purpose |
|-------------------------|---------|--------------------------|-----------------|--------|---------|
| Input Source            | select  | Image / Height / RD / AO / Custom | Image          | –      | Chooses primary scalar field driving tone/structure. |
| Tone Levels             | number  | 2–8                      | 5               | 1      | Number of discrete halftone levels (families/steps). |
| Halftone Style          | select  | Base Lines / Smart Lines / Topographic / RD-Driven / Grid-Gradient / 3D-Aware | Smart Lines | – | Chooses pattern recipe (see glossary). |
| Line Direction Mode     | select  | Global / Image-Gradient / Surface-Slope / RD-Field | Image-Gradient | – | How line directions are derived. |
| Base Frequency          | number  | 0.1–20 (1/units)         | 4               | 0.1    | Fundamental line spacing for family ℓ=0. |
| Family Count            | number  | 1–6                      | 4               | 1      | Number of dyadic line families (2^ℓ multipliers). |
| Family Width Profile    | select  | Equal / Decay / Custom   | Equal           | –      | How stroke width changes across families. |
| Contour Count           | number  | 1–64                     | 16              | 1      | Number of iso-contours for topo/RD styles. |
| Contour Width           | number  | 0.001–0.25 (value-space) | 0.03            | 0.001  | Fractional width of contour bands. |
| RD Preset               | select  | Off / Spots / Stripes / Maze / Custom | Off            | –      | Chooses RD parameter set when RD is active. |
| RD Steps                | number  | 0–5000                   | 1000            | 50     | Number of iterations for RD simulation. |
| Grid Cell Size          | number  | 4–512 px                 | 64              | 1      | Cell width for grid-to-gradient style. |
| Gradient Gamma          | number  | 0.25–4                   | 1.0             | 0.05   | Shapes edge→centre gradient falloff. |
| Domain Warp Amount      | number  | 0–1 (relative)           | 0.2             | 0.01   | Strength of domain warp from noise/RD fields. |
| Output Resolution       | number  | 256–4096 px              | 2048            | 64     | Output canvas resolution (square). |

### Appearance

| Parameter         | Type   | Options / Range      | Default      | Purpose |
|-------------------|--------|----------------------|--------------|---------|
| Stroke Colour     | color  | Any                  | #000000      | Line colour. |
| Background Colour | color  | Any                  | #ffffff      | Background colour. |
| Stroke Width Base | number | 0.2–4 px             | 1.0          | Base stroke width before family scaling. |
| Stroke Anti-Alias | toggle | On / Off             | On           | Controls smoothing at line edges. |
| Fill Mode         | select | None / Gradient / Height / Tone | Gradient | How interiors are filled when using gradient fields. |

### Behavior

| Parameter        | Type   | Options / Range      | Default | Purpose |
|------------------|--------|----------------------|---------|---------|
| Live Preview     | toggle | On / Off             | On      | Whether changes update canvas in real-time. |
| Animate RD       | toggle | On / Off             | Off     | Whether RD fields animate over time. |
| Animate Threshold| toggle | On / Off             | Off     | Whether tone thresholds slowly vary (shimmer). |
| Seed             | number | 0–10^6               | 1       | Seed for noise and RD initialisation. |

---

## 3. Controls Layout

### Tab: CONTROLS

**Sections (in order):**

1. **Input Source & Resolution**
   - Input Source
   - Output Resolution
   - Seed

2. **Tone & Levels**
   - Tone Levels
   - Halftone Style
   - Family Count
   - Base Frequency
   - Family Width Profile

3. **Structure Source**
   - Line Direction Mode
   - RD Preset / RD Steps (visible when RD is used)
   - Contour Count / Contour Width (visible for Topographic / RD styles)
   - Grid Cell Size / Gradient Gamma (visible for Grid-Gradient style)

4. **Warp & Noise**
   - Domain Warp Amount

5. **Appearance**
   - Stroke Colour
   - Background Colour
   - Stroke Width Base
   - Stroke Anti-Alias
   - Fill Mode

6. **Playback & Export**
   - Live Preview (toggle)
   - Animate RD (toggle)
   - Animate Threshold (toggle)
   - Export Image (button)
   - Export Vector (button, if supported)

### Tab: CANVAS

- Full-width canvas area following F-system sizing (sidebar width 30F, remaining width canvas).
- Optional overlay toggle: show tone field, line directions, contour levels.

---

## 4. Interactions

### Parameter Effects

- **Input Source**: switches which scalar field is considered the master tone/height; updates previews and available controls.
- **Halftone Style**: selects which recipe (module chain) to execute and how fields are composed.
- **Tone Levels & Family Count**: control discrete tone quantisation and number of line families activated per tone.
- **Base Frequency**: sets period of ℓ=0 line family; higher frequency → denser lines.
- **Line Direction Mode**: changes how the line normal/tangent is computed (global, image gradient, surface slope, RD-driven).
- **Contour Count/Width**: determine iso-line spacing and thickness in topographic styles.
- **Grid Cell Size / Gradient Gamma**: define cell-based gradients and falloff behaviour from edges to centre.
- **Domain Warp Amount**: mixes raw coordinate with warp field (noise/RD) to bend lines and contours.
- **RD Preset / RD Steps**: control RD pattern morphology and evolution depth.

### Button Actions

- **Export Image**: capture current canvas as PNG at selected resolution.
- **Export Vector** (optional implementation): run vectorisation pipeline on coverage mask and export as SVG.

---

## 5. Canvas Specification

### Visual Elements

- **Main Canvas**
  - Renders final halftone image based on selected style and parameters.
  - Supports F-system sizing and crisp-pixel scaling.

- **Optional Diagnostic Overlays** (toggle in CANVAS tab)
  - Tone field preview (greyscale of master scalar field).
  - Direction field preview (glyphs/streamlines of line direction).
  - Contour lines only (for topographic/RD styles).
  - RD field visualisation (u or v channel).

---

## 6. Algorithm Notes

This section encodes the conceptual design of the **Smart Halftone Engine** and mirrors a node-based architecture.

### 6.1 Goals & Description

- Build a **modular halftoning system** where:
  - Inputs are generic scalar/vector fields (image, geometry, RD, distance, grid).
  - Processing is done by reusable field operators.
  - Structure (tone levels, contours, directions) is extracted in shared modules.
  - Pattern generators (line families, contours, gradients) are pluggable.
  - Composition combines multiple pattern layers into final output.

- Avoid multiple bespoke implementations of the same mathematical idea:
  - Each function (distance, gradient, tone quantisation, domain warp, etc.) is implemented once and reused as a node.

### 6.2 Halftoning Styles (Glossary)

1. **Base Multi-Family Line Halftone**  
   Dyadic line families with frequencies \( f_ℓ = 2^ℓ \) along a constant line direction. All families share stroke width rules; tone controls which families are active.

2. **Smart Image-Driven Line Halftone**  
   Line families whose directions are derived from the input image (using gradients/tangents), so lines flow along edges or feature directions.

3. **Topographic Contour Halftone**  
   Iso-contour lines generated from a scalar height field, optionally combined with line families or fill gradients between contours.

4. **RD-Modulated Halftone**  
   Uses reaction–diffusion fields as tone sources, domain warps, or orientation fields, producing organic halftone patterns.

5. **Grid-to-Gradient Halftone**  
   Converts regular or analytic grids into edge→centre gradients inside each cell using distance-to-edge, optionally overlaid with halftone lines.

6. **3D-Aware Slope-Driven Halftone**  
   Uses surface normals/curvature to define line directions and tone, yielding hatching that respects 3D form.

### 6.3 Style Recipes

Each style is a specific **module chain** over shared building blocks.

#### 6.3.1 Base Multi-Family Line Halftone

**Description**  
Dyadic multi-family line halftone using a global line direction.

**Functions**
- Line coordinate: \( u = (d·p)/P + φ \), \( u_p = \mathrm{fract}(u) \).
- Family phase: \( v_ℓ = \mathrm{fract}(2^ℓ u_p) \).
- Distance: \( d_ℓ = |v_ℓ - 0.5| \).
- Mask: \( L_ℓ = \mathbf{1}[d_ℓ < α_ℓ/2] \).
- Tone index: \( T = \lfloor g·N \rfloor \).
- Combined coverage: \( M = 1 - \prod_{ℓ \le T}(1-L_ℓ) \).

**Modules (Order)**
1. ImageInput / ScalarInput → g(x,y).
2. NormalizeOperator → g ∈ [0,1].
3. ToneQuantizer → T(x,y).
4. LineCoordinateFromDirection → u(x,y).
5. LineFamilyGenerator → PatternLayer.

**Mermaid**
```mermaid
flowchart LR
    A[Scalar Input g(x,y)] --> B[Normalize]
    B --> C[ToneQuantizer T(x,y)]

    D[PositionField p(x,y)] --> E[LineCoordinateFromDirection u]

    C --> F[LineFamilyGenerator]
    E --> F

    F --> G[PatternLayer M(x,y)]
```

#### 6.3.2 Smart Image-Driven Line Halftone

**Description**  
Line directions from image gradients/tangents; tone from image.

**Modules (Order)**
1. ImageInput → g(x,y).
2. NormalizeOperator → g.
3. GradientFieldFromScalar → ∇g.
4. TangentFieldFromScalar → t(x,y).
5. DirectionBlend (global + local) → d_n(x,y).
6. LocalLineCoordinateFromField → u(x,y).
7. ToneQuantizer(g) → T.
8. LineFamilyGenerator(u, T) → PatternLayer.

**Mermaid**
```mermaid
flowchart LR
    A[Image g(x,y)] --> B[Normalize]
    B --> C[GradientFieldFromScalar]
    C --> D[TangentFieldFromScalar]
    D --> E[DirectionBlend d_n(x,y)]

    F[PositionField p(x,y)] --> G[LocalLineCoordinate u]
    E --> G

    B --> H[ToneQuantizer T(x,y)]

    G --> I[LineFamilyGenerator]
    H --> I

    I --> J[PatternLayer]
```

#### 6.3.3 Topographic Contour Halftone

**Description**  
Contours from scalar height field; optional nested halftone inside bands.

**Modules (Order)**
1. ScalarInput h(x,y) (image/height/RD).
2. NormalizeOperator(h).
3. IsoContourExtractor(h, N_c, w) → contour masks C_k.
4. Optional ToneQuantizer(h) for band-dependent styles.
5. TopographicContourGenerator → PatternLayers.
6. Optional LineFamilyGenerator within C_k.
7. LayerCompositor → final coverage.

**Mermaid**
```mermaid
flowchart LR
    A[Height Field h(x,y)] --> B[Normalize]
    B --> C[IsoContourExtractor]
    C --> D[Contour Masks C_k]
    D --> E[TopographicContourGenerator]
    E --> F[PatternLayers]
    F --> G[LayerCompositor]
```

#### 6.3.4 RD-Modulated Halftone

**Description**  
RD fields used as tone, warp, and/or orientation for halftone.

**Modules (Order)**
1. InitialConditions u0,v0.
2. GrayScottSimulator → u(x,y), v(x,y).
3. NormalizeOperator(u) → g_RD.
4. Optional GradientFieldFromScalar(u) → orientation.
5. Optional DomainWarpOperator using u/∇u.
6. ToneQuantizer(g_RD) → T_RD.
7. LineFamilyGenerator(or TopographicContourGenerator) → PatternLayer.

**Mermaid**
```mermaid
flowchart LR
    A[u0,v0] --> B[GrayScottSimulator]
    B --> C[u(x,y)]
    C --> D[Normalize g_RD]
    C --> E[GradientFieldFromScalar]
    E --> F[Optional DomainWarp]
    F --> G[Coordinate Field u_warped]
    D --> H[ToneQuantizer T_RD]
    G --> I[LineFamilyGenerator]
    H --> I
    I --> J[PatternLayer]
```

#### 6.3.5 Grid-to-Gradient Halftone

**Description**  
Analytic grid → distance-based gradient → optional halftone.

**Modules (Order)**
1. PositionField → (x,y).
2. GridCellGradient(x,y,s) → g_cell.
3. Optional Pow(g_cell, γ).
4. Optional ToneQuantizer(g_cell) → T.
5. Optional LineFamilyGenerator(u, T) per cell.

**Mermaid**
```mermaid
flowchart LR
    A[PositionField] --> B[GridCellGradient]
    B --> C[Gradient g_cell(x,y)]
    C --> D[Optional ToneQuantizer / Halftone]
```

#### 6.3.6 3D-Aware Slope-Driven Halftone

**Description**  
Lines follow surface slope/curvature; tone from AO/depth.

**Modules (Order)**
1. NormalField N(x,y); AO/Depth g_geo.
2. DirectionFieldFromNormals(N) → tangent/line direction.
3. LocalLineCoordinateFromField(p, d_n) → u(x,y).
4. NormalizeOperator(g_geo).
5. ToneQuantizer(g_geo) → T_geo.
6. LineFamilyGenerator(u, T_geo).

**Mermaid**
```mermaid
flowchart LR
    A[NormalField N(x,y)] --> B[DirectionFieldFromNormals]
    B --> C[Local Line Normal d_n]

    D[PositionField p(x,y)] --> E[LocalLineCoordinate u]
    C --> E

    F[AO/Depth g_geo] --> G[Normalize]
    G --> H[ToneQuantizer T_geo]

    E --> I[LineFamilyGenerator]
    H --> I

    I --> J[PatternLayer]
```

---

## 7. High-Level Modules (Maths, Inputs, Outputs)

Each high-level module corresponds to a reusable node group or class.

### 7.1 ScalarField2D / VectorField2D
- **Maths:** Scalar f: ℝ²→ℝ, Vector F: ℝ²→ℝ².
- **Inputs:** (x,y) coordinates.
- **Outputs:** Scalar or vector values.
- **Procedures:** `sample`, `sampleVec`.

### 7.2 NormalizeOperator
- **Maths:** g = outMin + (outMax-outMin)·(f-inMin)/(inMax-inMin).
- **Inputs:** f(x,y), ranges.
- **Outputs:** g(x,y) ∈ [outMin,outMax].
- **Procedures:** Linear remap, clamp.

### 7.3 ToneQuantizer
- **Maths:** T = floor(g·N), clamped to [0,N-1].
- **Inputs:** g(x,y)∈[0,1], N.
- **Outputs:** integer-valued scalar field.

### 7.4 GradientFieldFromScalar & TangentFieldFromScalar
- **Maths:** central differences for ∂f/∂x, ∂f/∂y; tangent = normalize(-fy, fx).
- **Inputs:** Scalar field f; step δ.
- **Outputs:** gradient field; tangent field.

### 7.5 DistanceTransform / SDFBuilder
- **Maths:** d(x,y)=min distance to mask or analytic SDFs.
- **Inputs:** masks or primitive parameters.
- **Outputs:** scalar distance field d(x,y).

### 7.6 GrayScottSimulator
- **Maths:** Gray–Scott PDEs with discrete Laplacian.
- **Inputs:** u0, v0; Du, Dv, F, K, dt, iterations.
- **Outputs:** u(x,y), v(x,y).

### 7.7 DomainWarpOperator
- **Maths:** f'(x,y)=f(x+W_x, y+W_y).
- **Inputs:** field f; vector field W.
- **Outputs:** warped field f'.

### 7.8 LineCoordinateFromDirection / LocalLineCoordinateFromField
- **Maths:** u=(d·p)/P+φ or u=(d_n(x,y)·p)/P.
- **Inputs:** position p; direction(s) d/d_n; period P; phase φ.
- **Outputs:** scalar coordinate field u(x,y).

### 7.9 LineFamilyGenerator
- **Maths:** dyadic families along u, with per-family phase, distance, threshold, and tone-dependent activation.
- **Inputs:** u(x,y), T(x,y), family params.
- **Outputs:** PatternLayer with coverage mask and direction.

### 7.10 IsoContourExtractor / TopographicContourGenerator
- **Maths:** c=h·N_c; f=fract(c); d=|f-0.5|; C=1[d<w/2].
- **Inputs:** h(x,y); N_c; w.
- **Outputs:** contour masks/layers.

### 7.11 GridCellGradient
- **Maths:** u=fract(x/s); v=fract(y/s); d_edge=min(u,v,1-u,1-v); g=clamp(d_edge/0.5,0,1).
- **Inputs:** position; cell size s.
- **Outputs:** gradient field g(x,y).

### 7.12 PatternSelector / LayerCompositor
- **Maths:** M_final=1-Π(1-M_i).
- **Inputs:** pattern layers; selection masks.
- **Outputs:** final coverage mask or combined pattern.

---

## 8. Function & Procedure Library (Node-Level Building Blocks)

These are the atomic nodes used across modules; each implemented once.

- **Arithmetic:** Add, Subtract, Multiply, Divide, Min, Max, Clamp, Abs, Pow.
- **Periodic:** Fract, Wrap, TriangleWave.
- **Threshold/Quantisation:** Step, Smoothstep, Floor, Quantise.
- **Vector:** Dot, Normalize, Rotate90, Length.
- **Sampling:** SampleScalar, SampleVector, SampleWarped.
- **Derivatives:** FiniteDiffX, FiniteDiffY, Gradient, TangentFromGradient.
- **Distance/SDF:** DistanceToEdgeDiscrete, SDF_GridCellEdge, SDF_Circle, SDF_Min.
- **RD:** Laplacian, GrayScottStep, RDIterate.
- **Coordinate:** LineCoordinate, LocalLineCoordinate, GridCellUV.
- **Halftone:** LineFamilyPhase, LineFamilyDistance, LineFamilyMask, FamilyActivation, CombineFamilies.
- **Contour:** ContourCoord, ContourPhase, ContourDistance, ContourMask.
- **Composition:** BinaryOR, BinaryAND, LayerComposite.

---

## Common Mistakes to Avoid

- Duplicating mathematical logic in multiple modules instead of reusing shared nodes.
- Hard-coding style-specific behaviour inside low-level utilities.
- Confusing tone field (g(x,y)) with coordinate field (u(x,y)); they must remain independent.
- Ignoring F-system sizing and producing sidebars/canvases that don’t align to F units.
- Blurring when a distance field is required (loss of control over gradient shape).
- Treating RD as a one-off pattern generator instead of a general-purpose scalar/vector field source.

