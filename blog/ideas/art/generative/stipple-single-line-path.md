**Status:** DESIGN | **Cluster:** halftone-stipple, plotter-paths


Design document (p5.js raster-first, SVG later)

---

## 0. Scope and non-negotiables

### Primary outputs (separate, toggleable)

1. **Stipple points** (exportable as the “pure stipple” output)
    
2. **Single-line path** through _all_ stipple points (exportable as raster now; SVG later)
    
3. **Flow-field lines** derived from image values (parallel branch)
    
4. **Topographic contours** (parallel branch)
    
5. **Edge lines** + **edge-driven density modulation** for stippling (parallel branch feeding back into 1)
    

### Hard constraints for the point-to-line step (Output 2)

- **Single polyline only** (no multi-stroke variants, ever, for this step)
    
- **Visits every point exactly once** (Hamiltonian path as an ordering)
    
- **No crossings and no touching**
    
    - No segment intersections
        
    - No segment “kissing” another segment at a non-vertex
        
    - No collinear overlap between segments
        
- **Must eventually return a solution** (no user-visible “budget” / “gave up”)
    

### Preprocessing constraint

- If two points are closer than the Poisson minimum distance (d_{\min}), **merge them** and replace by the **average position** (centroid).
    

---

## 1. System architecture (pipeline)

### Stage A — Image analysis fields (cached)

Produce and cache:

- **Tone field** (T(x,y)): canonical “value” (default luminance; modes later)
    
- **Smoothed tone field** (S(x,y)): blurred (T) for flow/contours
    
- **Edge magnitude field** (E(x,y)): gradient magnitude of (T) or (S)
    
- **Binary edge mask** (B(x,y)): thresholded / thinned edges for line output
    
- Optional: **edge influence field** (E_b(x,y)): blurred/raised version of (E) used purely for stipple modulation
    

### Stage B — Stipple density model

Define target density:  
[  
\rho(x,y) = \rho_T(T(x,y)) ;+; w_e \cdot \rho_E(E_b(x,y))  
]

- (\rho_T) is your tone-to-density curve (editable)
    
- (\rho_E) is the edge emphasis term (blurred edges → “dark patches” → more dots)
    

### Stage C — Stipple sampler (Output 1)

Generate point set (P) from (\rho(x,y)) with Poisson/blue-noise constraints (variable density later; constant min distance in v1).

Then run **merge pass** (distance < (d_{\min}) ⇒ centroid merge).

### Stage D — Single-line solver (Output 2)

Input: merged point set (P) + start rule  
Output: ordered list (p_1,\dots,p_n) defining a polyline through all points, satisfying the strict non-crossing/non-touching constraints.

### Stage E — Parallel line generators (Outputs 3–5)

- Flow-field lines from (-\nabla S) (plus optional noise bias)
    
- Topographic contours from (S) via marching squares
    
- Edge lines from (B)
    

---

## 2. Data model

### Point record

Each stipple point stores (at minimum):

- `id`
    
- `x, y`
    
- sampled values at creation time: `t = T(x,y)`, `e = E(x,y)` (useful later for styling)
    
- `cluster_id` (for merge provenance)
    

### Path record (Output 2)

- `order[]`: indices into point array
    
- derived segments implicit: ((p_i, p_{i+1}))
    

### Field buffers

- `T`, `S`, `E`, `B`, `E_b` stored as image-sized buffers or downsampled buffers (preview mode may downsample; render uses full-res drawing).
    

---

## 3. Preprocessing: “merge too-close points”

### Requirement

If any pair of points are closer than (d_{\min}), merge them and replace by centroid.

### Design

- Treat this as **clustering under threshold** (d_{\min}):
    
    - Create adjacency for pairs with distance < (d_{\min})
        
    - Compute connected components (union-find recommended)
        
    - Replace each component by the centroid of its members
        
- Recompute ids and discard originals
    
- This runs after sampling and before path solving
    

### Notes

- This merge guarantees the point set respects the minimum spacing _even if the sampler occasionally violates it_ due to discretisation/field effects.
    
- Merging reduces degenerate cases that can create collinear “touch” events in the path stage.
    

---

## 4. Output 2 solver: guaranteed, strict, single-line Hamiltonian path

You want “no budget” and “must keep trying until it finds a solution”. The only way to make this stable is to use a **constructive method that is guaranteed to produce a simple (non-self-intersecting) Hamiltonian path**, rather than an open-ended search.

### 4.1 Formal constraints (geometry)

A candidate segment (\overline{ab}) is **invalid** if it:

- intersects any existing segment at a point other than a shared endpoint
    
- touches any existing segment at a non-endpoint (tangency / “kissing”)
    
- overlaps collinearly with any existing segment for a non-zero length
    
- produces a repeated vertex (visits a point twice)
    

### 4.2 Start rule (v1)

- Start point is the **top-left-most point in the set**:
    
    - in p5 coordinates (y downward): minimal `y`, tie-break minimal `x`
        

This matches your “outer edge = top-left pixel” intent without inventing hull logic.

### 4.3 Solver strategy (v1 MVP): monotone-chain Hamiltonian path

Goal: a deterministic ordering that **cannot self-intersect** under mild non-degeneracy conditions, and that can be made robust with a small set of deterministic tie-handling rules.

#### Key idea

Build an **x-monotone** (or y-monotone) polyline by sorting points by a primary coordinate and connecting in that order.

- If the polyline is strictly monotone in x (x strictly increasing along the path), then a self-intersection would require some x-value to be visited out-of-order, which cannot happen.
    
- Degeneracies (duplicate x, collinearity) are what cause “touching/overlap” issues, so those are handled explicitly.
    

#### Construction (conceptual, not implementation)

1. Choose monotone axis:
    
    - default: sort by `x` increasing
        
    - if many identical x, fall back to sort by `y` increasing
        
2. Sort points by primary coordinate, tie-break by secondary coordinate.
    
3. Rotate the sequence so that the first element is the required start point (top-left-most).
    
    - If rotation would break monotonicity, choose the other axis (x vs y) or reverse direction; this is deterministic and not “search”.
        
4. Connect consecutive points in this ordered list to form the polyline.
    

#### Degeneracy handling (to satisfy “no touching”)

To ensure strict “no touching”:

- **Duplicate points**: removed by merge stage.
    
- **Identical primary coordinate ties** (e.g., same x):
    
    - enforce strict ordering by secondary coordinate
        
    - if it creates collinear overlaps (rare with merged Poisson), apply a deterministic micro-perturbation rule _only for ordering_, not for rendering:
        
        - treat `(x,y)` as `(x, y + ε * rank)` for sorting, with ε extremely small in float space
            
- **Collinear consecutive triples**:
    
    - if ((p_{i-1}, p_i, p_{i+1})) are collinear, this can cause “touching” if later segments align—resolve by stable tie-breaking and (if required) switching monotone axis.
        

This is not “optimisation”; it’s correctness engineering.

#### Why this meets your “keep trying” requirement

There is no probabilistic looping. The solver deterministically produces a candidate path and deterministically repairs ordering degeneracies. It always returns.

### 4.4 Secondary priorities (ordering tie-breakers, not optimisation)

Once v1 is stable, introduce _local tie-breakers_ only when multiple monotone-consistent orderings are possible (e.g., within equal-x runs):

Priority order you specified:

1. minimise **maximum segment length**
    
2. minimise **total length**
    
3. maximise **smoothness**
    

Design approach:

- within a tied bucket (same x or same y), choose the permutation that minimises (1) then (2) then (3), while preserving monotonicity and strict non-touch constraints.
    
- this is local, bounded, and does not turn into open-ended search.
    

### 4.5 Cycle (later)

A non-self-intersecting Hamiltonian **cycle** (simple polygon through all points) is a different construction (“polygonisation”).

- Keep this as v2:
    
    - input: same point set (P)
        
    - output: cyclic order
        
- Must satisfy the same “no touching” constraint (stricter than typical polygonisation).
    
- The cycle module should be designed as an independent solver that shares intersection/touch predicates and degenerate handling with v1.
    

---

## 5. Edge detection: output + stipple modulation

### Output 5A: edge lines

- Generate binary edge mask (B(x,y))
    
- Convert to drawable polylines later; raster-first draws from mask or traced segments.
    

### Output 5B: edge→density feedback

- Compute edge influence field:
    
    - blur (E(x,y)) at a user-controlled radius
        
    - apply curve/exponent to concentrate influence into “dark patches”
        
- Add to density model (\rho(x,y))
    

This matches your intent: “blur the edges and darken to create dark patches for increased dot density”.

---

## 6. Flow-field lines (Output 3)

### Definition

- Use (S(x,y)) as a height field
    
- Compute vector field:  
    [  
    \vec{v}(x,y) = -\nabla S(x,y)  
    ]
    
- Generate lines by seeding start points and integrating along (\vec{v})
    

### Controls (v1)

- seed spacing / count
    
- step size
    
- max length
    
- stop threshold on (|\vec{v}|)
    

### Optional modulation (later)

- Add Perlin noise as a rotational or directional perturbation:
    
    - bias direction while retaining general “high → low” drift
        
- Allow stipple points as seeds for coherence between branches
    

---

## 7. Topographic contours (Output 4)

### Definition

- Contours are iso-lines of (S(x,y))
    
- Extract via marching squares at levels:  
    [  
    S = S_{\min} + k\cdot \Delta,\quad k\in \mathbb{Z}  
    ]
    
- Render as polylines (raster draw now; SVG later)
    

---

## 8. UI design (minimal, tool-first)

### Panel structure (suggested)

- **Input**
    
    - load image (shows dimensions; output canvas matches)
        
- **Analysis**
    
    - tone source mode (default luminance)
        
    - blur radius for (S)
        
    - edge sensitivity (thresholds)
        
- **Stipple**
    
    - (d_{\min}) (Poisson min distance)
        
    - density curve editor for (\rho_T) (gamma first; control points later)
        
    - edge modulation toggle + weight (w_e) + blur radius
        
    - seed (integer)
        
    - generate / regenerate
        
    - export raster of stipple-only
        
- **Path**
    
    - generate path (uses current stipple points)
        
    - show path overlay toggle
        
    - export raster of path-only
        
    - debug toggles (show intersections rejections should be zero in final output)
        
- **Flow**
    
    - seed count/spacing, max length
        
    - noise modulation (later)
        
- **Contours**
    
    - interval (\Delta), smoothing
        

No “multiple line” settings anywhere.

---

## 9. Diagnostics and correctness checks (required)

### Geometry predicates (shared)

- segment–segment intersection (including endpoint rules)
    
- segment–segment “touch” detection:
    
    - intersection at interior point
        
    - collinear overlap
        
    - near-touch with epsilon (floating point robustness)
        

### Validation routines

- Path uses each point exactly once
    
- No self-intersections / touches for the produced polyline
    
- Merge stage leaves no pair with distance < (d_{\min})
    

### Debug overlays

- highlight any invalid segment (should never appear in final)
    
- show merged clusters (optional)
    

---

## 10. Performance and determinism

### Determinism

- Same image + same parameters + same seed ⇒ same stipple points and same path.
    

### Progressive rendering (preview)

- Stipple can accumulate for responsiveness; path generation runs after points stabilise.
    

---

## 11. Test plan (practical, targeted)

### Unit-like geometry tests

- intersection/touch rules on known segment configurations:
    
    - crossing, T-junction touch, collinear overlap, endpoint-sharing
        

### Point-set tests

- random Poisson points at multiple densities
    
- adversarial: many collinear points, many shared x values, grid-aligned points
    

### Integration tests

- stipple → merge → path validation on varied images
    
- confirm “no touching” under float precision by repeated runs
    

---

## 12. Open decisions you’ve implicitly made (recorded as defaults)

- Path solver uses a **guaranteed constructive ordering** (monotone chain) rather than open-ended search, to satisfy “no budget / must succeed”.
    
- Start point = top-left-most point in the _point set_, not literal canvas pixel.
    
- Strict non-touching is enforced by robust predicates + deterministic degeneracy handling.
    

If you want, the next refinement step is to specify exactly which monotone axis selection rules and which degeneracy repair rules are acceptable (because that’s where “must never touch” lives or dies).

---

## Related ideas

- [Smart Halftone System](../../tools/smart-halftone-system/00-overview.md)
- [Topographic Dot Halftone](../../tools/topographic-dot-halftone/00-overview.md)
- [ASCII Art Generator](../../tools/ascii-art-generator/00-overview.md)
- [Complex Line Shading](../../tools/complex-line-shading/00-overview.md)
- [Stipple Node Spec](../../tools/image-editor/Nodes.md)
- [Cloth Shrink Halftone](../../tools/cloth-shrink-halftone/Matt's Webcorner - Cloth.md)
- [Pen Plotter](pen-plotter.md)
- [Glyph Rig Deformation](glyph-rig-deformation.md)
