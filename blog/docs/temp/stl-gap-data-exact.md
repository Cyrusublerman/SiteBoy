# Exact STL Data for a Gap

## Example: Horizontal Gap 1 (3×3 Grid)

### Parameters
- 3×3 grid
- Tile size: 10mm
- Gap: 1mm
- Perimeter: 2mm
- Layer 0 (z = 0.00 to 0.08mm)

### Gap Position
Between Row 0 and Row 1

### Function Call

```javascript
generateBox(2, 12, 0, 34, 13, 0.08)
```

**Meaning:**
- Bottom-left-front corner: `(2, 12, 0)`
- Top-right-back corner: `(34, 13, 0.08)`
- Size: 32mm wide × 1mm tall × 0.08mm thick

---

## Complete STL Data (All 12 Facets)

```stl
facet normal 0 0 -1
  outer loop
    vertex 2 12 0
    vertex 34 12 0
    vertex 34 13 0
  endloop
endfacet
facet normal 0 0 -1
  outer loop
    vertex 2 12 0
    vertex 34 13 0
    vertex 2 13 0
  endloop
endfacet
facet normal 0 0 1
  outer loop
    vertex 2 12 0.08
    vertex 34 13 0.08
    vertex 34 12 0.08
  endloop
endfacet
facet normal 0 0 1
  outer loop
    vertex 2 12 0.08
    vertex 2 13 0.08
    vertex 34 13 0.08
  endloop
endfacet
facet normal 0 -1 0
  outer loop
    vertex 2 12 0
    vertex 34 12 0
    vertex 34 12 0.08
  endloop
endfacet
facet normal 0 -1 0
  outer loop
    vertex 2 12 0
    vertex 34 12 0.08
    vertex 2 12 0.08
  endloop
endfacet
facet normal 0 1 0
  outer loop
    vertex 2 13 0
    vertex 34 13 0.08
    vertex 34 13 0
  endloop
endfacet
facet normal 0 1 0
  outer loop
    vertex 2 13 0
    vertex 2 13 0.08
    vertex 34 13 0.08
  endloop
endfacet
facet normal -1 0 0
  outer loop
    vertex 2 12 0
    vertex 2 13 0.08
    vertex 2 13 0
  endloop
endfacet
facet normal -1 0 0
  outer loop
    vertex 2 12 0
    vertex 2 12 0.08
    vertex 2 13 0.08
  endloop
endfacet
facet normal 1 0 0
  outer loop
    vertex 34 12 0
    vertex 34 13 0
    vertex 34 13 0.08
  endloop
endfacet
facet normal 1 0 0
  outer loop
    vertex 34 12 0
    vertex 34 13 0.08
    vertex 34 12 0.08
  endloop
endfacet
```

---

## Breakdown: Facet by Facet

### Bottom Face (z = 0, facing down)

**Facet 1 & 2** (2 triangles):
```stl
facet normal 0 0 -1
  outer loop
    vertex 2 12 0       ← Corner A
    vertex 34 12 0      ← Corner B
    vertex 34 13 0      ← Corner C
  endloop
endfacet
facet normal 0 0 -1
  outer loop
    vertex 2 12 0       ← Corner A
    vertex 34 13 0      ← Corner C
    vertex 2 13 0       ← Corner D
  endloop
endfacet
```

**Visual (looking from below):**
```
   (2,12) A ────────── B (34,12)
          │╲          │
          │  ╲  T1    │
          │    ╲      │
          │ T2   ╲    │
          │        ╲  │
   (2,13) D ────────── C (34,13)

   T1 = Triangle ABC
   T2 = Triangle ACD
```

---

### Top Face (z = 0.08, facing up)

**Facet 3 & 4** (2 triangles):
```stl
facet normal 0 0 1
  outer loop
    vertex 2 12 0.08    ← Corner A'
    vertex 34 13 0.08   ← Corner C'
    vertex 34 12 0.08   ← Corner B'
  endloop
endfacet
facet normal 0 0 1
  outer loop
    vertex 2 12 0.08    ← Corner A'
    vertex 2 13 0.08    ← Corner D'
    vertex 34 13 0.08   ← Corner C'
  endloop
endfacet
```

**Note:** Winding order reversed (counter-clockwise from above).

---

### Front Face (y = 12, facing toward you)

**Facet 5 & 6** (2 triangles):
```stl
facet normal 0 -1 0
  outer loop
    vertex 2 12 0       ← Bottom-left
    vertex 34 12 0      ← Bottom-right
    vertex 34 12 0.08   ← Top-right
  endloop
endfacet
facet normal 0 -1 0
  outer loop
    vertex 2 12 0       ← Bottom-left
    vertex 34 12 0.08   ← Top-right
    vertex 2 12 0.08    ← Top-left
  endloop
endfacet
```

**Visual (looking from front):**
```
Z ↑
  │  (2,12,0.08) ────── (34,12,0.08)
  │          │╲            │
  │          │  ╲  T1      │
  │          │    ╲        │
  │          │ T2   ╲      │
  │          │        ╲    │
  │  (2,12,0) ────────── (34,12,0)
  └──────────────────────────► X
```

---

### Back Face (y = 13, facing away)

**Facet 7 & 8** (2 triangles):
```stl
facet normal 0 1 0
  outer loop
    vertex 2 13 0       ← Bottom-left
    vertex 34 13 0.08   ← Top-right
    vertex 34 13 0      ← Bottom-right
  endloop
endfacet
facet normal 0 1 0
  outer loop
    vertex 2 13 0       ← Bottom-left
    vertex 2 13 0.08    ← Top-left
    vertex 34 13 0.08   ← Top-right
  endloop
endfacet
```

---

### Left Face (x = 2, facing left)

**Facet 9 & 10** (2 triangles):
```stl
facet normal -1 0 0
  outer loop
    vertex 2 12 0       ← Bottom-front
    vertex 2 13 0.08    ← Top-back
    vertex 2 13 0       ← Bottom-back
  endloop
endfacet
facet normal -1 0 0
  outer loop
    vertex 2 12 0       ← Bottom-front
    vertex 2 12 0.08    ← Top-front
    vertex 2 13 0.08    ← Top-back
  endloop
endfacet
```

**Visual (looking from left):**
```
Z ↑
  │  (2,12,0.08) ────── (2,13,0.08)
  │          │╲            │
  │          │  ╲  T2      │
  │          │    ╲        │
  │          │ T1   ╲      │
  │          │        ╲    │
  │  (2,12,0) ────────── (2,13,0)
  └──────────────────────────► Y
```

---

### Right Face (x = 34, facing right)

**Facet 11 & 12** (2 triangles):
```stl
facet normal 1 0 0
  outer loop
    vertex 34 12 0      ← Bottom-front
    vertex 34 13 0      ← Bottom-back
    vertex 34 13 0.08   ← Top-back
  endloop
endfacet
facet normal 1 0 0
  outer loop
    vertex 34 12 0      ← Bottom-front
    vertex 34 13 0.08   ← Top-back
    vertex 34 12 0.08   ← Top-front
  endloop
endfacet
```

---

## 3D Visualization of the Gap Box

```
      Top face (z=0.08)
      (2,12,0.08) ──────────── (34,12,0.08)
           /│                    /│
          / │                   / │
         /  │                  /  │
        /   │                 /   │
(2,13,0.08) │        (34,13,0.08) │
       │    │                │    │
       │    │ Front face     │    │ Right face
       │    │ (y=12)         │    │ (x=34)
       │    │                │    │
       │ (2,12,0) ───────────│─ (34,12,0)
       │   /                 │   /
       │  /  Back face       │  /
       │ /   (y=13)          │ /
       │/                    │/
  (2,13,0) ───────────── (34,13,0)
     Bottom face (z=0)
```

**8 Corners:**
- `(2, 12, 0)` - Bottom-left-front
- `(34, 12, 0)` - Bottom-right-front
- `(34, 13, 0)` - Bottom-right-back
- `(2, 13, 0)` - Bottom-left-back
- `(2, 12, 0.08)` - Top-left-front
- `(34, 12, 0.08)` - Top-right-front
- `(34, 13, 0.08)` - Top-right-back
- `(2, 13, 0.08)` - Top-left-back

**12 Triangles:**
- 2 per face × 6 faces = 12 facets

---

## Full STL File Context

In the complete STL file for "Jade_White.stl":

```stl
solid Artwork_Jade_White

... (tile geometry if this filament is used in tiles) ...

facet normal 0 0 -1
  outer loop
    vertex 0 0 0
    vertex 36 0 0
    vertex 36 2 0
  endloop
endfacet
... (11 more facets for perimeter top border) ...

facet normal 0 0 -1
  outer loop
    vertex 2 12 0
    vertex 34 12 0
    vertex 34 13 0
  endloop
endfacet
... (11 more facets for horizontal gap 1) ...

facet normal 0 0 -1
  outer loop
    vertex 2 23 0
    vertex 34 23 0
    vertex 34 24 0
  endloop
endfacet
... (11 more facets for horizontal gap 2) ...

facet normal 0 0 -1
  outer loop
    vertex 12 2 0
    vertex 13 2 0
    vertex 13 34 0
  endloop
endfacet
... (11 more facets for vertical gap 1) ...

facet normal 0 0 -1
  outer loop
    vertex 23 2 0
    vertex 24 2 0
    vertex 24 34 0
  endloop
endfacet
... (11 more facets for vertical gap 2) ...

... (more geometry for layers 1 and 2) ...

endsolid Artwork_Jade_White
```

---

## Data Size

**For one gap (horizontal gap 1, layer 0):**
- 12 facets
- Each facet = 7 lines of text
- Total: ~84 lines
- File size: ~2KB of text

**For complete gap/perimeter fill (3 base layers, 8 boxes/layer):**
- 24 boxes total
- 288 facets total
- ~2,016 lines of text
- File size: ~50KB of text

---

## Normal Vectors Explained

Each facet has a **normal vector** that points perpendicular to the face (outward from solid):

| Face | Normal | Meaning |
|------|--------|---------|
| Bottom | `(0, 0, -1)` | Points down (negative Z) |
| Top | `(0, 0, 1)` | Points up (positive Z) |
| Front | `(0, -1, 0)` | Points toward you (negative Y) |
| Back | `(0, 1, 0)` | Points away (positive Y) |
| Left | `(-1, 0, 0)` | Points left (negative X) |
| Right | `(1, 0, 0)` | Points right (positive X) |

**Why?** 3D software uses normals for:
- Lighting calculations (which way does light reflect?)
- Backface culling (don't render faces pointing away)
- Surface direction (which side is "outside"?)

---

## Comparison: Tile vs Gap STL Data

### Tile (10mm × 10mm × 0.08mm)
```javascript
generateBox(2, 2, 0, 12, 12, 0.08)
```

**First facet:**
```stl
facet normal 0 0 -1
  outer loop
    vertex 2 2 0
    vertex 12 2 0
    vertex 12 12 0
  endloop
endfacet
```

### Gap (32mm × 1mm × 0.08mm)
```javascript
generateBox(2, 12, 0, 34, 13, 0.08)
```

**First facet:**
```stl
facet normal 0 0 -1
  outer loop
    vertex 2 12 0
    vertex 34 12 0
    vertex 34 13 0
  endloop
endfacet
```

**Same format, different coordinates!** That's all STL is—lists of triangular coordinates.

---

## Summary

The gap STL data is:
- **Format:** ASCII text (human-readable)
- **Structure:** 12 triangular facets per gap box
- **Content:** Vertex coordinates (X Y Z in mm) + normal vectors
- **Size:** ~2KB per gap box
- **Location:** Added to the fill filament's STL file
- **Layers:** Only in base layers (not variable layers)

It's literally just text describing where triangles are in 3D space!

