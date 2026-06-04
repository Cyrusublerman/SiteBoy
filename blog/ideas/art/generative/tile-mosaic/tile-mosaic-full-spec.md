# [1] PURPOSE
**Canonical:** false | **Superseded by:** [tools/tile-mosaic-system/00-overview.md](../tools/tile-mosaic-system/00-overview.md)


Generate deterministic static and animated mosaics from a base lattice using macro-tiles, tile grammars, shading, texture, and layout morphing.

# [2] TERMINOLOGY

BaseCell := cell (i,j).  
MacroTile := contiguous set of BaseCells.  
Layout := mapping BaseCell→MacroTile.  
Sprite := raster buffer for MacroTile.  
Palette := finite colour set.  
PRNG := pseudo-random generator.  
t ∈ [0,1], f ∈ ℕ.  
B(t) := interpolated MacroTile bounds.  
N(x,y) := noise.  
L := light direction.

# [3] FUNCTIONAL REQUIREMENTS

- Generate lattice C×R.
    
- Generate layouts L₀,L₁,L₂.
    
- Partition lattice into MacroTiles deterministically.
    
- Assign grammar and parameters to each MacroTile.
    
- Render Sprite for each MacroTile.
    
- Apply shading equations.
    
- Apply texture equations.
    
- Animate layout morphing.
    
- Animate tile modulation.
    
- Animate texture drift.
    
- Render mosaic per frame.
    
- Export PNG, SVG, GIF.
    

# [4] NON-FUNCTIONAL REQUIREMENTS

- No allocations in per-frame loop.
    
- Sprite generation only on change.
    
- ≥30fps at defaults.
    
- Deterministic under fixed seed.
    

# [5] SYSTEM COMPONENTS

LatticeModule, LayoutModule, GrammarModule, SpriteModule, Renderer, AnimationModule, PaletteModule, ShadingModule, TextureModule, ExportModule, PRNGModule.

# [6] DATA STRUCTURES

BaseCell := {id:ℕ, tileId:ℕ, u:ℝ, v:ℝ}.  
MacroTile := {id:ℕ, cells:list(BaseCell), bounds:(x,y,w,h), grammar:symbol, seed:ℕ, paletteIndex:ℕ}.  
Layout := mapping BaseCell→MacroTile.  
Sprite := raster(w·tileSize,h·tileSize).  
Params := key→value.

# [7] COORDINATE SYSTEMS

Canvas: origin top-left. x→right, y→down.  
Lattice: (i,j), i∈[0,C−1], j∈[0,R−1].  
Local tile coords: (u,v)∈[0,1]².  
World coords: (x,y) := (i·tileSize,j·tileSize).

# [8] PARAMETERS

|name|domain|default|effect|
|---|---|---|---|
|C|ℕ≥4|30|lattice columns|
|R|ℕ≥4|30|lattice rows|
|tileSize|ℝ⁺|24|px per cell|
|seed|ℕ|1234|PRNG seed|
|layoutMode|{0,1,2}|0|selects L₀,L₁,L₂|
|depthStrength|[0,1]|0.4|shading amplitude|
|highlightIntensity|[0,1]|0.25|highlight amplitude|
|paletteVariance|[0,1]|0.45|colour jitter|
|textureStrength|[0,1]|0.35|noise modulation|
|vx|ℝ|0.2|noise drift x-velocity|
|vy|ℝ|0.1|noise drift y-velocity|
|pulseA|[0,0.5]|0.1|tile breathing amplitude|
|pulseF|[0,10]|2|tile breathing frequency|
|ω|ℝ|1|global modulation frequency|
|φᵢⱼ|ℝ|0|per-cell phase|

# [9] ALGORITHMS & EQUATIONS

## 9.1 Layout

Base partition L₀: each BaseCell forms 1×1 MacroTile.  
Alternative partitions L₁,L₂: deterministic packing rules merge cells into MacroTiles of sizes k×l.  
Bounds interpolation: B(t) := (1−t)B₀ + tB₁.

## 9.2 Tile Grammars

Concentric: radii rₖ := k/(n+1).  
Wedge: θ ∈ [θ₀,θ₁].  
Stripe: s(u,v) := step(mod(u·n,1)−½).  
Micro-dots: positions pₖ := PRNG samples in [0,1]².

## 9.3 Global Scalar Field

Field: d(i,j,t) := i·cos(ωt) + j·sin(ωt).  
Phase: φᵢⱼ := k·d(i,j,t).

## 9.4 Shading

Height map: h(u,v) := H₀ + Σₖ Δhₖ·exp(−(r−rₖ)²/(2σₖ²)).  
Normal: n := normalize(−∂h/∂u, −∂h/∂v, 1).  
Diffuse: D := max(0,n·L).  
Specular: R := 2(n·L)n − L; S := max(0,R·V)^p.  
Colour: C′ := C·(a + bD) + cS.

## 9.5 Texture

Noise: N(x,y) ∈ [−1,1].  
Drifted: N′(x,y,t) := N(x+vx t, y+vy t).  
Composition: C″ := C′·(1 + textureStrength·N′).

## 9.6 Animation

Tile breathing: s(t) := 1 + pulseA·sin(2π pulseF t + φᵢⱼ).  
Time: t := f/F mod 1.

# [10] PROCESSES

## 10.1 Layout Generation

1. Initialise lattice C×R.
    
2. Select Lₖ using layoutMode.
    
3. Partition deterministically.
    

## 10.2 Tile Assignment

1. For each MacroTile, call PRNG for grammar, parameters, palette.
    
2. Compute φᵢⱼ via scalar field.
    

## 10.3 Tile Rendering

1. Compute geometry via grammar.
    
2. Compute shading.
    
3. Compute texture.
    
4. Rasterize to Sprite.
    

## 10.4 Frame Rendering

1. Compute t and B(t).
    
2. Compute s(t).
    
3. Draw all Sprites in interpolated bounds.
    
4. Apply global overlays.
    

## 10.5 Export

1. Encode PNG, SVG geometry, GIF from rendered frames.
    

# [11] DETERMINISM & RANDOMNESS

PRNG := LCG with m:=2³², a:=1664525, c:=1013904223.  
X₀ := seed.  
Call order: layout→tileType→grammarParams→palette→texture.

# [12] GROUND TRUTH CASES

Case A: L₀ with seed fixed must produce uniform 1×1 tiles.  
Case B: shading parameters fixed must satisfy equations in §9.4.  
Case C: full animation (layout morph + breathing + drift) must satisfy §9.1–§9.6.

# [13] CONSTRAINTS

MacroTiles non-overlapping.  
Full lattice coverage.  
All equations continuous in t.  
Texture drift periodic over t∈[0,1].  
Shading monotonic along L.

# [14] FAILURE MODES

If raster buffer exceeds memory, stop rasterisation.  
If palette invalid, assign fallback constant colour.  
If PRNG invalid, reinitialise with seed.

# [15] IMPLEMENTATION CHECKLIST

- Lattice deterministic.
    
- Layouts valid.
    
- Grammars complete.
    
- Shading implemented.
    
- Texture implemented.
    
- Animation implemented.
    
- Export deterministic.