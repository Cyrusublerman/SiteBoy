# TOOL DESIGN DOCUMENT
**Status:** ARCHIVED
**Canonical:** false | **Superseded by:** [tools/topographic-dot-halftone/00-overview.md](../tools/topographic-dot-halftone/00-overview.md)


**Topographic Dot Halftone — Contour-Aligned Vector & Field Shading Engine**

## 1. PURPOSE
Generate dot-based halftone patterns whose dots follow geometric contours in vector shapes and iso-lines from depth/normal/bw maps. Dots modulate size from shading and normals. One unified static WebGL engine.

## 2. PATTERN TAXONOMY
### 2.1 Contour-Aligned Halftone (Vector)
- Signed Distance Field
- Geodesic Region Distance
- Laplace Field

### 2.2 Shading-Driven Halftone (Field)
- Depth map
- Normal map
- bw/luma map
- Weighted blend

### 2.3 Hybrid
Vector contours define flow; field values set dot size.

## 3. PARAMETER SCHEMA
### 3.1 Field Construction
- Depth Map (file)
- Normal Map (file)
- Luma Image (file)
- Weight Depth w_D (slider)
- Weight Normal w_N (slider)
- Weight Luma w_L (slider)
- Normal Influence α (slider)
- Depth Influence β (slider)
- Shading Gamma γ (slider)

### 3.2 Vector Mode
- SVG Input
- Contour Source [SDF / Geodesic / Laplace]
- Boundary Scale
- Centre Point
- Direction Field

### 3.3 Dot Lattice
- Dot Density
- Min Radius
- Max Radius
- Band Pitch pσ
- Along Pitch pτ
- Band Jitter
- Mask Source

### 3.4 Style
- Foreground Colour
- Background Colour
- Composite Mode
- Invert
- Anti-aliasing

## 4. UNIFIED ALGORITHM
### 4.1 Build S(x,y)
Vector Mode:
- SDF: d = min distance to curves
- Geodesic: distance inside region from seed curves
- Laplace: solve ∇²S = 0 with contour boundaries

Field Mode:
- s_D = depth
- s_N = clamp(dot(N,view), 0,1)
- s_L = luma
- S = w_D s_D + w_N s_N + w_L s_L

### 4.2 Tangent Field
- ∇S via finite differences
- T = (-S_y, S_x) / ||∇S||

### 4.3 Contour-Aligned Lattice
- σ = S / pσ
- b = floor(σ)
- τ = dot((x,y), T) / pτ
- i = floor(τ), j = b
- u = τ - (i+0.5)
- v = σ - (j+0.5)
- jitter via hash(i,j)

### 4.4 Dot Radius
- R = clamp(α s_N + β (1-S),0,1)^γ
- r = r_min + (r_max - r_min) * R

### 4.5 Dot Test
- d = sqrt(u² + v²)
- inside if d < r and mask > 0.5

## 5. INTERACTION MODEL
- Parameter changes update shader uniforms
- Vector mode requires SDF/Laplace pre-pass
- Mask updates load new textures

## 6. PERFORMANCE STRATEGY
- Full-screen triangle fragment shader
- Precompute SDF/Laplace to texture
- Gradient in shader via 2-sample finite differences
- Hash jitter in integer domain
- PNG export via framebuffer read
- SVG export via CPU lattice sampling

## 7. PAGE LAYOUT (F- SYSTEM)
### TAB 1 — INPUT
- Mode Select
- Vector Loader
- Field Loader
- Mask Loader

### TAB 2 — FIELD
- Depth/Normal/Luma weights
- Normal/Depth influence
- Gamma

### TAB 3 — PATTERN
- Dot density, radii
- Band pitch, along pitch, jitter
- Region controls

### TAB 4 — STYLE
- Colours
- Composite mode
- AA toggle

### TAB 5 — CANVAS
- Width/Height (F multiples)
- Fit mode
- PNG/SVG export

## 8. SHARED UTILITIES
- SDFGenerator
- LaplaceSolver
- GeodesicMap
- NormalSampler
- DepthSampler
- ContourFieldBuilder
- TangentField
- DotLattice
- RadiusMapper
- DotShader
- ExportManager

## 9. UNIFIED MECHANISM
Single scalar field S(x,y) → iso-lines → contour-oriented lattice → radius shading → masked rendering. Generates vector-based and field-based halftoning in one system.

