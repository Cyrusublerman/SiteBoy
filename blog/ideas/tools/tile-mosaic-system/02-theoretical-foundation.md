# Tile Mosaic System — Theoretical Foundation

## 1. Tile Grammar System

### Tile Types

| Type | Description |
|------|-------------|
| Concentric | Multiple rings with radial shading |
| Wedge | Semicircles, quarter-circles |
| Stripe | Vertical/horizontal bands |
| Solid | Single filled disc |
| Texture | Radial ripple patterns |
| Micro | Dot clusters |

## 2. Layout Engine

### Uniform Grid

$$
\text{cell}(i,j) = (i \cdot s, j \cdot s, s, s)
$$

### Rect Packing

**Reference:** `blog/ideas/reference documentation/06_Polygon_Grid_Domain_Subdivision/Bin_packing_problem.md`

### Layout Morphing

$$
R(t) = (1-t) \cdot R_A + t \cdot R_B
$$

## 3. Shading Model

### Pseudo-3D Depth

$$
I_{shade} = I_0 \cdot (1 - d \cdot \cos(\theta - \theta_{light}))
$$

### Rim Highlight

Thin arc on lit side, darkened arc on opposite.

## 4. Performance

- All sprites cached in reusable buffers
- No allocations in draw loop
- Only transforms and image draws per frame

