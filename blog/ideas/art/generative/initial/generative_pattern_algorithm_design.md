# Generative Pattern Algorithm — Page Design Document

## 1. Purpose
A unified generative system capable of producing Truchet tilings, nested-contour fields, circular-lattice patterns, and blobby RD/CA structures from a single algorithmic framework. The system must allow smooth transitions between modes without image blending.

---

## 2. Conceptual Model
At the highest level, all patterns emerge from:

1. **Weighted points** in 2D.
2. **Local connectivity** between points.
3. **Local state evolution** (RD/CA optional).
4. **A single global distance field**.
5. **Multiple controlled rendering pathways**.

Transitions between aesthetics are achieved by changing parameters that affect distribution, connectivity, evolution, and visibility, not by blending outputs.

---

## 3. System Architecture

### 3.1 Point Distribution Layer
Multiple generators feed into one persistent point set:
- **Grid generator:** Regular integer grid with optional jitter.
- **Noise generator:** Points sampled via scalar noise bands or density functions.
- **Hybrid generator:** Grid points displaced by low-frequency noise; additional points inserted in high-noise areas.

Key parameters:
- `density`
- `gridStrength`
- `clusterScale`
- `jitter`

### 3.2 Connectivity Layer
Edges are established using geometric proximity and rule constraints:
- Neighbours within radius `R`.
- Degree capped for tile-like behaviour.
- Grid snapping when `gridStrength` is high.
- Arc radius quantisation for circular motifs.

Key parameters:
- `R`
- `maxDeg`
- `arcQuantisation`
- `axisBias`

### 3.3 State Evolution Layer (Optional)
Each point carries local states (e.g., RD variables). Evolution applies discrete steps over edges.

Controls pattern complexity, formation of dots, stripes, blobs.

Key parameters:
- RD coefficients (`Du`, `Dv`, `f`, `k`)
- CA rule selection

---

## 4. Distance Field
A single global signed distance field is computed from the curve geometry.

Properties:
- Defines thickness, erosion, and contouring uniformly.
- Enables nested contours, tile-limited contours, and full-domain contours.

---

## 5. Rendering Modes
All visual outcomes arise from the same field.

### 5.1 Truchet Tiles
- Tile shape determined by local edge pattern.
- Render via template shapes (straight, corner, T, cross).
- Optionally enforce dot motifs.

### 5.2 Blobby RD/CA Forms
- Inflate points and edges by weight.
- Fill union of shapes.
- RD adjusts weights → dynamic merging and splitting.

### 5.3 Nested Contours (Per-Tile)
- Contours drawn inside tile windows.
- Windows clip the global distance field.

### 5.4 Global Nested Contours
- Same field, but without tile clipping.
- Produces large arcs and rolling nested structures.

---

## 6. Continuous Transitions (No Blending)
Transitions handled through parameter interpolation:

### 6.1 Grid → Organic
`gridStrength: 1 → 0`

### 6.2 Tile-Nested → Global-Nested
- **Window expansion method:** tile windows gradually enlarge until fully overlapping.
- **Weighted metric method:** crossing tile boundaries gradually reduces penalty.

### 6.3 Stroke → Blob
- Increase weight inflation.
- Switch from stroke rendering to filled regions.

### 6.4 Static → Animated
Use a time-varying vector noise field to smoothly advect points:
- `x_i(t+1) = x_i(t) + α • V(x_i(t), t)`.
- Ensures coherent slow motion.

---

## 7. Parameter Schema
- `density`
- `gridStrength`
- `clusterScale`
- `jitter`
- `R`
- `maxDeg`
- `axisBias`
- `arcQuantisation`
- `weightScale`
- `tileWindowSize`
- `boundaryCost`
- `RD coefficients`
- `flowSpeed`
- `noiseFrequency`

---

## 8. Performance Strategy
- Persistent point set; no per-frame regeneration.
- Cached neighbour lists updated incrementally.
- Global distance field updated only when geometry changes.
- Tile templates reused; vector paths precomputed.
- Noise field sampled through 3D simplex noise for stable temporal movement.

---

## 9. Module Overview

### Point Modules
- Grid generator
- Noise generator
- Hybrid distributor
- Flow field integrator

### Connectivity Modules
- Neighbour search
- Degree limiter
- Grid-snapping
- Arc quantisation

### State Modules
- RD solver
- CA rule processor

### Distance Field Modules
- Curve rasteriser
- Distance transform (JFA or chamfer)

### Rendering Modules
- Tile renderer
- Blob renderer
- Contour renderer
- Window mask operator
- Boundary-cost metric evaluator

---

## 10. Outputs
- Fully deterministic pattern sequences.
- Smooth morphing between Truchet, blob, and nested-contour aesthetics.
- Parameter timelines for animation automation.
- A coherent single-system visual language based on point sets, local rules, and global distance geometry.

---

End of document.

