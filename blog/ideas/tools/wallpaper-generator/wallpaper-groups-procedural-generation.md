# Wallpaper Groups — Procedural Generation Analysis

## Overview
17 distinct plane crystallographic groups exist. Each defined by specific symmetry operations: translations, rotations, reflections, glide reflections.

**Crystallographic restriction**: Only 2-, 3-, 4-, 6-fold rotations permitted in 2D discrete periodic patterns.

## Fundamental Operations

### Isometry Types
1. **Translation** `T_v`: Shift by vector `v`
2. **Rotation** `R_c,θ`: Rotate angle `θ` about center `c`
3. **Reflection** `F_L`: Mirror across line `L`
4. **Glide reflection** `G_L,d`: Reflect across `L` + translate distance `d` along `L`

### Lattice Types (5)
- **Oblique** (p): Generic parallelogram, no orthogonality
- **Rectangular** (p): Right angles, unequal sides
- **Rectangular** (c): Centered, diamond subdivisions
- **Square** (p): Right angles, equal sides
- **Hexagonal** (p): 60° angles, equal sides

## Notation Systems

### Hermann-Mauguin (IUCr)
Format: `[p|c][n][m|g|1][m|g|1]`
- Cell type: `p` primitive / `c` centered
- `n`: Max rotation order (1,2,3,4,6)
- Following: mirrors/glides perpendicular, parallel/diagonal

### Orbifold
Format: `[*][n][n][n]...`
- `*`: Mirror present
- `×`: Glide without mirror
- Numbers: Rotation order at gyration points

## The 17 Groups — Generation Methodologies

### Group p1 (o) — Oblique, No Symmetry
**Lattice**: Oblique parallelogram
**Operations**: Translation only
**Method**:
```
for each lattice point (i,j):
    place motif at i*v1 + j*v2
```
No constraints on motif. Simplest case.

### Group p2 (2222) — 180° Rotation Centers
**Lattice**: Oblique/rectangular parallelogram
**Operations**: 180° rotations at 4 positions per cell
**Method**:
```
rotation_centers = [origin, v1/2, v2/2, (v1+v2)/2]
for each lattice point:
    for each center in rotation_centers:
        place motif
        place 180° rotated motif about center
```
Motif must be 180° symmetric or asymmetric (rotated copy differs).

### Group pm (**) — Parallel Mirrors
**Lattice**: Rectangular
**Operations**: Reflection across parallel vertical lines
**Method**:
```
mirror_spacing = |v1|
for each lattice point:
    place motif
    place reflected motif across vertical axis
```
Motif has no vertical reflection symmetry (or tool becomes pmm).

### Group pg (××) — Parallel Glide Reflections
**Lattice**: Rectangular
**Operations**: Glide reflection (reflect + shift half-period)
**Method**:
```
for each lattice point (i,j):
    if i is even:
        place motif at i*v1 + j*v2
    else:
        place reflected motif at i*v1 + j*v2 + v2/2
```
Creates zigzag effect. No perpendicular mirrors.

### Group cm (*×) — Mirrors + Glide, Rhombic
**Lattice**: Rhombic (centered rectangular)
**Operations**: Parallel mirrors + perpendicular glide
**Method**:
```
Use centered cell with mirror axes
Alternate reflection and glide operations
Diamond lattice arrangement
```
Mirrors at angles to lattice vectors.

### Group pmm (*2222) — Perpendicular Mirrors
**Lattice**: Rectangular
**Operations**: Horizontal + vertical mirrors
**Method**:
```
for each lattice point:
    place motif (4 quadrants):
        original at (x,y)
        h-reflected at (-x,y)
        v-reflected at (x,-y)
        both-reflected at (-x,-y)
```
4-fold dihedral symmetry per cell. Simplest rectangular bi-mirror.

### Group pmg (22*) — Mirrors + 180° Rotations
**Lattice**: Rectangular
**Operations**: Parallel mirrors + 180° rotations between
**Method**:
```
mirror_axes = horizontal lines
rotation_centers = between mirrors
Alternate mirror strips with rotational strips
```
Rotations offset from mirror intersections.

### Group pgg (22×) — 180° Rotations + Glides
**Lattice**: Rectangular
**Operations**: Two perpendicular glide reflections + rotations
**Method**:
```
Apply horizontal glide: reflect + shift right
Apply vertical glide: reflect + shift up
Rotation centers at glide intersection points
```
No true mirror lines, only glides.

### Group cmm (2*22) — All Rectangular Ops, Centered
**Lattice**: Rhombic (centered)
**Operations**: Mirrors + glides + 180° rotations
**Method**:
```
Use diamond/centered cell
Perpendicular mirror axes through cell
180° rotations at 4 corners + center
```
Most symmetric rectangular group.

### Group p4 (442) — 90° Rotations
**Lattice**: Square
**Operations**: 90° rotations only
**Method**:
```
rotation_center = cell_center
for each lattice point:
    for rotation in [0°, 90°, 180°, 270°]:
        place rotated motif about center
```
No mirrors. Pure 4-fold rotational.

### Group p4m (*442) — Square, Full Symmetry
**Lattice**: Square
**Operations**: 90° rotations + 4 mirrors (H, V, 2 diagonals)
**Method**:
```
8-fold arrangement per cell:
    4 rotations × 2 reflections
Mirror axes: horizontal, vertical, ±45° diagonals
```
Maximum square symmetry. Kaleidoscopic.

### Group p4g (4*2) — Square, Offset Mirrors
**Lattice**: Square
**Operations**: 90° rotations + diagonal mirrors offset
**Method**:
```
90° rotations at corners
Diagonal mirrors shifted by half-cell
Glide reflections along H/V axes
```
Mirrors don't intersect at rotation centers.

### Group p3 (333) — 120° Rotations
**Lattice**: Hexagonal (equilateral triangular)
**Operations**: 120° rotations only
**Method**:
```
triangular_lattice with 60° angles
rotation_centers = vertices + cell_center
for each center:
    place motif at 0°, 120°, 240°
```
No mirrors. Pure 3-fold rotational.

### Group p3m1 (*333) — Hexagonal, Mirrors Type 1
**Lattice**: Hexagonal
**Operations**: 120° rotations + 3 mirror axes through vertices
**Method**:
```
3 mirrors at 60° intervals through rotation center
6-fold dihedral symmetry
Mirrors pass through lattice points
```
Classic hexagonal tiling pattern.

### Group p31m (3*3) — Hexagonal, Mirrors Type 2
**Lattice**: Hexagonal
**Operations**: 120° rotations + 3 mirrors between vertices
**Method**:
```
3 mirrors at 60° intervals
Mirrors bisect edges (not through vertices)
Different mirror/rotation relationship than p3m1
```
Alternate hexagonal mirror arrangement.

### Group p6 (632) — 60° Rotations
**Lattice**: Hexagonal
**Operations**: 60° rotations (implies 120°, 180°)
**Method**:
```
rotation_center = cell_center
6-fold rotation: 0°, 60°, 120°, 180°, 240°, 300°
No mirrors
```
Pure 6-fold rotational symmetry.

### Group p6m (*632) — Hexagonal, Full Symmetry
**Lattice**: Hexagonal
**Operations**: 60° rotations + 6 mirrors
**Method**:
```
12-fold arrangement: 6 rotations × 2 reflections
Mirrors: 3 through vertices + 3 between
Maximum hexagonal symmetry
```
Most complex wallpaper group. Snowflake-like.

## Procedural Implementation Strategy

### Core Algorithm Structure
```
1. Define lattice vectors (v1, v2) based on group type
2. Generate lattice points for viewport
3. For each lattice point:
   a. Determine symmetry operation positions
   b. Apply operations to base motif
   c. Render transformed instances
4. Clip to viewport bounds
```

### Motif Requirements by Group

**No constraints**: p1
**Avoid accidental symmetry**: p2, p3, p4, p6
**Must break symmetry**: pg, pmg, pgg, p4g (else becomes mirror group)
**Can have internal symmetry**: pm, pmm, cm, cmm, p4m, p3m1, p31m, p6m

### Tool Architecture Proposal

#### Input Parameters
- Group selection (dropdown: 17 options)
- Lattice scale factor
- Lattice angle (for oblique/rhombic)
- Motif: user-drawn / preset shapes / image
- Color palette (VGA constraint)
- Viewport dimensions

#### Processing Layers
1. **Lattice Generator**: Compute lattice points for group type
2. **Symmetry Operator**: Apply isometries per group rules
3. **Motif Transformer**: Rotate/reflect/translate motif
4. **Canvas Renderer**: Draw to VGA-constrained canvas

#### Validation
- Verify motif satisfies group constraints
- Detect accidental higher symmetry
- Warn if motif creates different apparent group

#### Output
- Static pattern render
- Animated symmetry demonstration
- Export as tileable texture

## Implementation Notes

### Lattice Vector Calculation
```javascript
// Square
v1 = [scale, 0]
v2 = [0, scale]

// Hexagonal
v1 = [scale, 0]
v2 = [scale * cos(60°), scale * sin(60°)]

// Rectangular
v1 = [scale_x, 0]
v2 = [0, scale_y]

// Oblique
v1 = [scale, 0]
v2 = [scale * cos(angle), scale * sin(angle)]

// Rhombic (centered)
v1 = [scale, 0]
v2 = [scale/2, scale * sqrt(3)/2]
```

### Rotation Matrix
```
R(θ) = [cos(θ)  -sin(θ)]
       [sin(θ)   cos(θ)]
```

### Reflection Matrix (across vertical axis)
```
F_y = [-1  0]
      [ 0  1]
```

### Glide Reflection
```
G(axis, distance) = F(axis) ∘ T(distance * axis_direction)
```

## Testing Strategy
- Generate test motif (asymmetric shape)
- Render each group
- Verify symmetry count/type matches definition
- Compare to reference examples (Egyptian, Assyrian patterns)

## Visual Validation Checklist
Per group, verify:
- [ ] Rotation order matches specification
- [ ] Mirror axes positioned correctly
- [ ] Glide reflections produce expected offset
- [ ] Lattice type matches (square/hex/rectangular)
- [ ] No accidental additional symmetries
- [ ] Pattern tiles seamlessly

## Code Architecture — Shared Implementation Strategy

### Hierarchical Grouping by Shared Components

#### Group 1: Rotation Family (4 groups)
**Members**: p2, p3, p4, p6
**Shared Logic**:
```
LatticeGenerator(type) → points
RotationalSymmetry(n, center) → n-fold copies
Tiler(lattice, transforms) → full pattern
```
**Unique Parameter**: rotation order `n` ∈ {2, 3, 4, 6}
**Code Reuse**: 95% — only `n` differs

**Implementation**:
```javascript
class RotationalWallpaper {
    constructor(rotationOrder, latticeType) {
        this.n = rotationOrder;
        this.lattice = new LatticeGenerator(latticeType);
    }
    
    generateCell(motif, cellOrigin) {
        const transforms = [];
        for (let i = 0; i < this.n; i++) {
            transforms.push(rotate(motif, i * 360/this.n, cellOrigin));
        }
        return transforms;
    }
}
```

#### Group 2: Mirror Family (4 groups)
**Members**: pm, pmm, cm, cmm
**Shared Logic**:
```
LatticeGenerator(rectangular/rhombic) → points
MirrorPlanes(axes[]) → reflection lines
ReflectionSymmetry(planes) → mirrored copies
```
**Unique Parameters**: 
- Number of mirror axes (1 or 2)
- Mirror orientations (parallel or perpendicular)
- Lattice type (primitive or centered)

**Code Reuse**: 80% — mirror placement logic shared

**Implementation**:
```javascript
class MirrorWallpaper {
    constructor(mirrorAxes, latticeType) {
        this.axes = mirrorAxes; // ['h'], ['v'], ['h','v'], etc.
        this.lattice = new LatticeGenerator(latticeType);
    }
    
    generateCell(motif, cellOrigin) {
        const transforms = [motif];
        this.axes.forEach(axis => {
            const reflected = reflect(motif, axis, cellOrigin);
            transforms.push(reflected);
            // Combine reflections for multiple axes
            if (this.axes.length > 1) {
                transforms.push(reflectMultiple(motif, this.axes));
            }
        });
        return transforms;
    }
}
```

#### Group 3: Kaleidoscope Family (5 groups)
**Members**: pmm, p4m, p3m1, p31m, p6m
**Shared Logic**:
```
RotationalSymmetry(n) + MirrorSymmetry(n mirrors)
→ 2n-fold dihedral symmetry
```
**Relationship**: Rotation family + mirrors = kaleidoscope
**Mathematical**: Dihedral group D_n

**Code Reuse**: 90% — combine rotation + reflection modules

**Implementation**:
```javascript
class KaleidoscopeWallpaper extends RotationalWallpaper {
    constructor(rotationOrder, mirrorConfig, latticeType) {
        super(rotationOrder, latticeType);
        this.mirrorAxes = mirrorConfig; // through/between vertices
    }
    
    generateCell(motif, cellOrigin) {
        // Generate rotations
        const rotated = super.generateCell(motif, cellOrigin);
        
        // Add reflections of each rotation
        const transforms = [];
        rotated.forEach(r => {
            transforms.push(r);
            this.mirrorAxes.forEach(axis => {
                transforms.push(reflect(r, axis, cellOrigin));
            });
        });
        return transforms;
    }
}
```

#### Group 4: Glide Family (3 groups)
**Members**: pg, pgg, p4g
**Shared Logic**:
```
GlideReflection(axis, offset) → reflect + translate
```
**Unique Parameters**: 
- Number of glide axes
- Offset distance (half-cell)
- Presence of rotations

**Code Reuse**: 70% — glide operation is identical

**Implementation**:
```javascript
class GlideWallpaper {
    constructor(glideAxes, rotationOrder = 1) {
        this.glides = glideAxes; // [{axis, offset}]
        this.n = rotationOrder;
    }
    
    applyGlide(motif, axis, offset, cellCoords) {
        const reflected = reflect(motif, axis);
        const translated = translate(reflected, offset);
        return cellCoords.parity ? translated : motif;
    }
}
```

#### Group 5: Base Cases (2 groups)
**Members**: p1, cm
**Unique**: No shared abstraction needed
- **p1**: Translation only (trivial case)
- **cm**: Rhombic mirrors + glide (complex intersection)

### Fundamental Domain Approach

**Key Insight**: Each group has a minimal region (fundamental domain) that generates entire pattern via symmetry operations.

#### Hierarchy of Fundamental Domains

```
p1:    full cell (parallelogram)
       ↓ add 180° rotation
p2:    half cell (2-fold)
       ↓ add mirrors
pmm:   quarter cell (4-fold via reflections)
       
p4:    1/4 cell (90° rotations)
       ↓ add mirrors
p4m:   1/8 cell (8-fold dihedral)

p3:    1/3 cell (120° rotations)
       ↓ add mirrors (type 1)
p3m1:  1/6 cell (6-fold dihedral)
       ↓ (alternative mirrors)
p31m:  1/6 cell (6-fold dihedral, different config)
       
p6:    1/6 cell (60° rotations)
       ↓ add mirrors
p6m:   1/12 cell (12-fold dihedral)
```

**Code Architecture**:
```javascript
class FundamentalDomain {
    constructor(groupName) {
        this.shape = this.defineShape(groupName);
        this.generators = this.defineGenerators(groupName);
    }
    
    // Returns polygon defining fundamental domain
    defineShape(group) {
        const shapes = {
            'p1': parallelogram(fullCell),
            'p2': parallelogram(halfCell),
            'p4': triangle(90°),
            'p4m': triangle(45°),
            'p3': triangle(120°),
            'p3m1': triangle(60°),
            'p6': triangle(60°),
            'p6m': triangle(30°)
        };
        return shapes[group];
    }
    
    // Returns symmetry operations to generate full cell
    defineGenerators(group) {
        const ops = {
            'p2': [rotate(180°)],
            'p4': [rotate(90°), rotate(180°), rotate(270°)],
            'p4m': [rotate(45° * i) + reflect() for i in 0..7],
            'p6m': [rotate(30° * i) + reflect() for i in 0..11]
        };
        return ops[group];
    }
    
    // Apply generators to motif within fundamental domain
    generateCell(motif) {
        return this.generators.map(op => op.apply(motif));
    }
}
```

### Subgroup Relationships (Code Inheritance)

```
p1 (base)
├─ p2 (add 180° rotation)
│  ├─ pmm (add perpendicular mirrors)
│  ├─ pmg (add one mirror)
│  ├─ pgg (add perpendicular glides)
│  └─ cmm (centered lattice + mirrors)
├─ pm (add one mirror)
│  ├─ pmm (add perpendicular mirror)
│  └─ cm (centered lattice)
└─ pg (add glide)

p4 (add 90° rotation)
├─ p4m (add 4 mirrors)
└─ p4g (add offset diagonal mirrors)

p3 (add 120° rotation)
├─ p3m1 (add 3 mirrors through vertices)
├─ p31m (add 3 mirrors between vertices)
└─ p6 (add 60° rotation)
   └─ p6m (add 6 mirrors)
```

**Inheritance Strategy**:
```javascript
// Base class
class Wallpaper {
    constructor(latticeType) {
        this.lattice = new Lattice(latticeType);
    }
    applySymmetries(motif, cell) { return [motif]; }
}

// p1 → p2 → pmm chain
class P1 extends Wallpaper {}
class P2 extends P1 {
    applySymmetries(motif, cell) {
        return [motif, rotate180(motif, cell.center)];
    }
}
class PMM extends P2 {
    applySymmetries(motif, cell) {
        const rotated = super.applySymmetries(motif, cell);
        return rotated.flatMap(m => [
            m, 
            reflectH(m, cell), 
            reflectV(m, cell)
        ]);
    }
}

// p3 → p6 → p6m chain
class P3 extends Wallpaper {
    applySymmetries(motif, cell) {
        return [0,1,2].map(i => rotate(motif, 120*i, cell.center));
    }
}
class P6 extends P3 {
    applySymmetries(motif, cell) {
        return [0,1,2,3,4,5].map(i => rotate(motif, 60*i, cell.center));
    }
}
class P6M extends P6 {
    applySymmetries(motif, cell) {
        const rotated = super.applySymmetries(motif, cell);
        return rotated.flatMap(m => [m, reflectRadial(m, cell)]);
    }
}
```

### Unified Rendering Pipeline

**All groups share**:
```javascript
class WallpaperRenderer {
    render(group, motif, viewport) {
        // 1. Generate lattice points
        const cells = this.lattice.generateCells(viewport);
        
        // 2. For each cell, apply group symmetries
        cells.forEach(cell => {
            const transforms = group.applySymmetries(motif, cell);
            
            // 3. Render each transformed motif
            transforms.forEach(t => this.drawMotif(t));
        });
    }
}
```

**Group-specific logic isolated to**: `applySymmetries(motif, cell) → Transform[]`

### Implementation Clusters (Max Code Reuse)

#### Cluster A: Pure Rotational (n-fold)
**Groups**: p2, p3, p4, p6
**Shared**: 95%
**Unique**: `n` parameter
**Lines of code**: ~50 shared, ~5 unique per group

#### Cluster B: Kaleidoscope (rotation + mirrors)
**Groups**: p4m, p3m1, p31m, p6m
**Shared**: 90% (inherit from Cluster A)
**Unique**: Mirror placement config
**Lines of code**: ~70 shared, ~10 unique per group

#### Cluster C: Rectangular Mirrors
**Groups**: pm, pmm, pmg, pgg
**Shared**: 80%
**Unique**: Mirror/glide/rotation combinations
**Lines of code**: ~60 shared, ~15 unique per group

#### Cluster D: Centered Lattice
**Groups**: cm, cmm
**Shared**: 70% (use rhombic lattice + mirror logic)
**Unique**: Centered cell handling
**Lines of code**: ~40 shared, ~20 unique per group

#### Cluster E: Glide with Rotation
**Groups**: pg, pgg, p4g
**Shared**: 75%
**Unique**: Glide axis count, rotation presence
**Lines of code**: ~50 shared, ~12 unique per group

### Module Breakdown

```
lattice.js          (5 lattice types, ~100 LOC)
├─ oblique()
├─ rectangular()
├─ centered()
├─ square()
└─ hexagonal()

transforms.js       (4 isometries, ~80 LOC)
├─ translate()
├─ rotate()
├─ reflect()
└─ glide()

symmetry-ops.js     (operation builders, ~120 LOC)
├─ nFoldRotation(n)
├─ dihedralSymmetry(n, mirrorType)
├─ mirrorGrid(axes)
└─ glidePattern(axes, offsets)

groups.js           (17 group definitions, ~300 LOC)
├─ WallpaperBase
├─ RotationalFamily
├─ MirrorFamily
├─ KaleidoscopeFamily
├─ GlideFamily
└─ [17 specific group classes]

renderer.js         (unified pipeline, ~150 LOC)
└─ WallpaperRenderer

wallpaper-tool.js   (UI/integration, ~400 LOC)
```

**Total estimated**: ~1150 LOC for all 17 groups
**Duplication**: <10% due to shared abstractions

### Parameter-Driven Approach (Alternative)

Instead of 17 classes, define groups as data:

```javascript
const WALLPAPER_GROUPS = {
    p1:   { lattice: 'oblique',    rotation: 1, mirrors: [], glides: [] },
    p2:   { lattice: 'oblique',    rotation: 2, mirrors: [], glides: [] },
    pm:   { lattice: 'rect',       rotation: 1, mirrors: ['v'], glides: [] },
    pg:   { lattice: 'rect',       rotation: 1, mirrors: [], glides: ['h'] },
    pmm:  { lattice: 'rect',       rotation: 2, mirrors: ['h','v'], glides: [] },
    p4:   { lattice: 'square',     rotation: 4, mirrors: [], glides: [] },
    p4m:  { lattice: 'square',     rotation: 4, mirrors: ['h','v','d1','d2'], glides: [] },
    p3:   { lattice: 'hexagonal',  rotation: 3, mirrors: [], glides: [] },
    p6m:  { lattice: 'hexagonal',  rotation: 6, mirrors: ['radial6'], glides: [] }
    // ... etc
};

class UniversalWallpaper {
    constructor(groupName) {
        const config = WALLPAPER_GROUPS[groupName];
        this.lattice = new Lattice(config.lattice);
        this.rotation = config.rotation;
        this.mirrors = config.mirrors;
        this.glides = config.glides;
    }
    
    applySymmetries(motif, cell) {
        let transforms = [];
        
        // Apply rotations
        for (let i = 0; i < this.rotation; i++) {
            transforms.push(rotate(motif, i * 360/this.rotation, cell.center));
        }
        
        // Apply mirrors
        transforms = transforms.flatMap(t => 
            this.mirrors.map(axis => reflect(t, axis, cell))
        );
        
        // Apply glides (parity-based)
        this.glides.forEach(axis => {
            transforms = this.applyGlide(transforms, axis, cell);
        });
        
        return transforms;
    }
}
```

**Pros**: Even more code reuse (~800 LOC total)
**Cons**: Complex edge cases (pmg, pgg, p4g, cm) may need special handling

### Recommended Architecture

**Hybrid approach**:
1. **Base classes** for major families (5 classes)
2. **Parameterization** within families
3. **Special cases** (cm, pmg, pgg, p4g) as overrides

**Estimated complexity**:
- Base system: ~400 LOC
- Family implementations: ~300 LOC
- Group specializations: ~200 LOC
- UI/tool wrapper: ~250 LOC
- **Total**: ~1150 LOC

**Code reuse**: ~85-90% across all 17 groups

---

## Tool Implementation — Input Parameters

### Essential Inputs (Required for Generation)

#### 1. Wallpaper Group Selection
**Type**: Dropdown/selector (17 options)
**Options**:
```
├─ No Symmetry
│  └─ p1 (Translation only)
├─ Rotational (2-fold)
│  ├─ p2 (180° rotations)
│  ├─ pm (Vertical mirrors)
│  ├─ pg (Vertical glides)
│  ├─ cm (Rhombic mirrors)
│  ├─ pmm (H+V mirrors)
│  ├─ pmg (Mirrors + rotations)
│  ├─ pgg (Glides + rotations)
│  └─ cmm (Centered, mirrors+rotations)
├─ Square (4-fold)
│  ├─ p4 (90° rotations)
│  ├─ p4m (90° + 4 mirrors)
│  └─ p4g (90° + offset mirrors)
├─ Triangular (3-fold)
│  ├─ p3 (120° rotations)
│  ├─ p3m1 (120° + mirrors type 1)
│  └─ p31m (120° + mirrors type 2)
└─ Hexagonal (6-fold)
   ├─ p6 (60° rotations)
   └─ p6m (60° + 6 mirrors)
```
**Default**: p4m (most visually interesting)

#### 2. Motif Source
**Type**: Multi-mode selector
**Options**:

**A. Drawing Mode** (primary)
- User draws in fundamental domain
- Canvas size: matches fundamental domain shape
- Tools: pixel painter, line, fill
- VGA palette constraint
- Clear/reset button

**B. Preset Shapes**
- Geometric primitives: dot, line, triangle, square, cross, star
- Asymmetric shapes: comma, arrow, L-shape, S-curve
- Size slider: 1-20px
- Color picker: VGA palette

**C. Noise/Procedural**
- Perlin noise pattern
- Random dots/stipple
- Voronoi cells
- Parameters: density, scale, seed

**D. Image Import** (optional, complex)
- Upload bitmap
- Auto-quantize to VGA
- Scale to fit fundamental domain
- May violate symmetry constraints

**Default**: Preset shape (triangle) in drawing mode

#### 3. Lattice Parameters

**A. Cell Size**
- **Slider**: 20-200px
- **Default**: 60px
- Determines repetition frequency
- Affects performance (smaller = more cells)

**B. Cell Aspect Ratio** (conditional)
- **When**: Rectangular/oblique lattices (p1, p2, pm, pg, pmm, pmg, pgg)
- **Slider**: 0.5-2.0 (width/height ratio)
- **Default**: 1.0 (square)
- **Disabled**: Square/hexagonal groups

**C. Cell Angle** (conditional)
- **When**: Oblique lattice (p1, p2 with oblique option)
- **Slider**: 60°-120°
- **Default**: 90° (rectangular)
- **Disabled**: Orthogonal groups

**D. Offset/Phase** (optional)
- **X/Y sliders**: 0-100% of cell size
- Shifts pattern origin
- Useful for exploring different crops

#### 4. Visual Style

**A. Background Color**
- **Type**: VGA color picker
- **Default**: `#000000` (black)
- Applied to entire canvas

**B. Motif Colors**
- **Type**: VGA palette manager
- **Count**: 1-8 colors
- **Default**: `#00ffff` (cyan) on black
- Multi-color for complex motifs

**C. Grid Overlay** (debug/educational)
- **Toggle**: Show/hide lattice grid
- **Type**: Dotted lines at cell boundaries
- **Color**: `#808080` (gray)
- Off by default

**D. Symmetry Guides** (educational)
- **Toggle**: Show/hide mirror axes, rotation centers
- **Visualization**: 
  - Mirrors: dashed lines
  - Rotations: small circles with order number
  - Glides: dash-dot lines with arrows
- Off by default

#### 5. Canvas Parameters

**A. Output Size**
- **Presets**: 512×512, 1024×1024, 2048×2048
- **Custom**: Width/height inputs (128-4096)
- **Aspect**: Free or locked
- **Default**: 1024×1024

**B. Tile Mode** (export option)
- **Toggle**: Generate seamless tileable texture
- **Effect**: Ensures edges wrap correctly
- **Default**: On

**C. Quality/Performance**
- **Anti-aliasing**: On/off (off for pure pixel art)
- **Render mode**: Fast (draft) / Full (final)
- **Default**: Fast during editing, Full on export

#### 6. Animation Parameters (optional feature)

**A. Animate What**
- **Options**: None, Rotation, Phase, Color cycle, Motif morph
- **Default**: None

**B. Animation Speed**
- **Slider**: 0.1-10 cycles/second
- **Default**: 1.0

**C. Animation Type**
- **Loop**: Infinite repeat
- **Ping-pong**: Forward then reverse
- **Once**: Single playthrough

### Input Organization (4-Tab Limit)

#### Tab 1: Pattern (Primary)
```
┌─ PATTERN ────────────────────────┐
│ Group:      [p4m ▼]              │
│                                   │
│ Motif:      ◉ Draw  ○ Preset     │
│             ○ Noise ○ Image      │
│                                   │
│ [FUNDAMENTAL DOMAIN CANVAS]      │
│  (Interactive drawing area)      │
│                                   │
│ Preset:     [Triangle ▼]         │
│ Size:       [====|====] 10px     │
└───────────────────────────────────┘
```

#### Tab 2: Lattice
```
┌─ LATTICE ────────────────────────┐
│ Cell Size:    [====|===] 60px    │
│                                   │
│ Aspect Ratio: [==|=====] 1.0     │
│ (Width/Height for rectangular)    │
│                                   │
│ Cell Angle:   [====|===] 90°     │
│ (For oblique lattices only)       │
│                                   │
│ Phase X:      [=====|==] 50%     │
│ Phase Y:      [===|====] 40%     │
│                                   │
│ ☐ Show grid overlay              │
│ ☐ Show symmetry guides           │
└───────────────────────────────────┘
```

#### Tab 3: Style
```
┌─ STYLE ──────────────────────────┐
│ Background:   [■] #000000        │
│                                   │
│ Motif Colors:                    │
│   Primary:    [■] #00ffff        │
│   Secondary:  [■] #ff00ff        │
│   + Add color                    │
│                                   │
│ Canvas:       1024×1024          │
│   Preset:     [1024×1024 ▼]     │
│   Width:      [1024]             │
│   Height:     [1024]             │
│                                   │
│ ☑ Tileable edges                 │
│ ☐ Anti-aliasing                  │
└───────────────────────────────────┘
```

#### Tab 4: Export
```
┌─ EXPORT ─────────────────────────┐
│ Format:       ◉ PNG  ○ GIF       │
│                                   │
│ Animation:    [None ▼]           │
│   Speed:      [===|====] 1.0x    │
│   Type:       [Loop ▼]           │
│                                   │
│ [GENERATE & DOWNLOAD]            │
│                                   │
│ Info:                            │
│   Group: p4m (*442)              │
│   Cells: 16×16 = 256             │
│   Transforms: 8 per cell         │
│   Size: 1024×1024 (1.0 MB)       │
└───────────────────────────────────┘
```

### Derived Parameters (Computed Internally)

#### Fundamental Domain Shape
**Computed from**: Wallpaper group
**Examples**:
- p1: Full parallelogram
- p2: Half parallelogram (180° wedge)
- p4: Quarter square (90° wedge)
- p4m: 45° triangle
- p6m: 30° triangle

**Used for**: Drawing canvas size/shape in Pattern tab

#### Symmetry Operations
**Computed from**: Wallpaper group
**Data structure**:
```javascript
{
    rotations: [0, 90, 180, 270],      // angles in degrees
    mirrors: ['h', 'v', 'd1', 'd2'],   // axis identifiers
    glides: [{axis: 'h', offset: 0.5}], // glide reflections
    centers: [[0,0], [0.5,0.5]]        // rotation centers (cell-relative)
}
```

#### Lattice Vectors
**Computed from**: Group + cell size + aspect + angle
**Example (p4m, 60px)**:
```javascript
v1 = [60, 0]
v2 = [0, 60]
```

#### Visible Cell Range
**Computed from**: Canvas size + lattice vectors + phase
**Purpose**: Determine which lattice cells to render
**Example**:
```javascript
// For 1024×1024 canvas, 60px cells
cellRange = {
    iMin: -2,  // Include cells just offscreen for seamless edges
    iMax: 18,
    jMin: -2,
    jMax: 18
}
// Total: 21×21 = 441 cells
```

#### Transform Count
**Computed from**: Symmetry operations
**Examples**:
- p1: 1 (identity only)
- p2: 2 (identity + 180°)
- p4: 4 (4 rotations)
- p4m: 8 (4 rotations × 2 mirrors)
- p6m: 12 (6 rotations × 2 mirrors)

**Used for**: Performance estimation, info display

### Constraints & Validation

#### Motif Symmetry Constraints
**Issue**: If motif accidentally has symmetry matching group, pattern appears as higher symmetry group

**Examples**:
- p4 with symmetric motif → appears as p4m
- pg with symmetric motif → appears as pm

**Solutions**:
1. **Detect**: Analyze motif for accidental symmetry
2. **Warn**: "Your motif has 4-fold symmetry, pattern will appear as p4m instead of p4"
3. **Suggest**: "Use asymmetric motif for true p4 pattern"
4. **Auto-fix**: Slightly perturb motif to break symmetry

#### Cell Size Limits
**Constraint**: Must fit at least 3×3 cells in viewport
**Reason**: Need to see pattern repetition

**Validation**:
```javascript
minCellSize = canvasWidth / 100  // Max 100 cells wide
maxCellSize = canvasWidth / 3    // Min 3 cells wide
```

#### Performance Limits
**Issue**: Small cells × large canvas = many transforms

**Example calculation**:
```
Canvas: 2048×2048
Cell: 20px
Cells: (2048/20)² = 10,404 cells
Group: p6m (12 transforms/cell)
Total: 124,848 transforms
```

**Solutions**:
1. **Warn**: "Small cell size may cause slow rendering"
2. **Throttle**: Limit to 100,000 transforms max
3. **Draft mode**: Render subset during interaction
4. **LOD**: Reduce detail for distant cells

#### Color Constraints
**Enforced**: VGA 16-color palette only
**Implementation**: Color picker restricted to VGA values
**Exception**: Noise mode may need dithering to VGA

### Advanced Options (Future)

#### Coloring Modes
- **Uniform**: All motif copies same color
- **Alternating**: Different colors for symmetry-related copies
- **Gradient**: Interpolate across lattice
- **Random**: Each cell different random VGA color

#### Distortion
- **Perspective**: Non-affine lattice distortion
- **Wave**: Sinusoidal deformation
- **Noise**: Perturb vertex positions
- **Caution**: May break mathematical symmetry

#### Hybrid Patterns
- **Blend**: Overlay multiple wallpaper groups
- **Mask**: Use one pattern to mask another
- **Complex**: Combine different groups in regions

#### Educational Mode
- **Step-through**: Animate symmetry operations one by one
- **Highlight**: Color-code transforms by operation type
- **Annotations**: Label rotation centers, mirror axes
- **Quiz**: "Identify this wallpaper group"

### Implementation Priority

**Phase 1 (MVP)**:
- Groups: p1, p2, p4, p4m, p6m (5 most common)
- Motif: Drawing mode + basic presets
- Lattice: Cell size only (square cells)
- Style: Background + single color
- Output: Fixed 512×512 PNG

**Phase 2 (Full)**:
- All 17 groups
- Noise motifs
- Full lattice params (aspect, angle)
- Multi-color motifs
- Variable canvas size
- Grid/guide overlays

**Phase 3 (Advanced)**:
- Animation
- Image import
- Coloring modes
- Educational features
- GIF export

### Data Flow

```
User Input → Group Config → Lattice Generator
               ↓
User Input → Motif Canvas → Motif Bitmap
               ↓
         Symmetry Engine
         (applies ops)
               ↓
      Cell Rendering Loop
               ↓
     Canvas Compositor
               ↓
         Final PNG/GIF
```

**Real-time Updates**:
- Group change → Reset fundamental domain shape → Re-render
- Lattice param → Keep motif → Re-tile
- Motif edit → Keep lattice → Re-render
- Style param → Keep everything → Re-composite

### Storage Format (for presets/saving)

```javascript
{
    "version": "1.0",
    "group": "p4m",
    "lattice": {
        "cellSize": 60,
        "aspectRatio": 1.0,
        "angle": 90,
        "phaseX": 0.5,
        "phaseY": 0.5
    },
    "motif": {
        "type": "bitmap",
        "width": 30,      // fundamental domain size
        "height": 30,
        "pixels": [...],  // flattened array of VGA indices
        "palette": ["#000000", "#00ffff"]
    },
    "style": {
        "background": "#000000",
        "showGrid": false,
        "showGuides": false,
        "tileable": true
    },
    "canvas": {
        "width": 1024,
        "height": 1024
    }
}
```

## References
- Wikipedia: Wallpaper group (2026-01-18)
- Fedorov (1891): Original classification proof
- IUCr: International Union of Crystallography notation
- Conway (1992): Orbifold notation system

