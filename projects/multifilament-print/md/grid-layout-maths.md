### Packing under dual constraints

The calibration grid must fit within two physical constraints simultaneously: the printer build plate (\(W_b \times H_b\) mm) and the flatbed scanner field (\(W_s \times H_s\) mm). The effective constraint is the intersection:

$$W_{\max} = \min(W_b, W_s), \quad H_{\max} = \min(H_b, H_s)$$

Given \(N\) tiles of size \(t\) mm with inter-tile gap \(g\) mm and perimeter margin \(p\) mm, the step size is \(s = t + g\). The maximum number of columns that fit within \(W_{\max}\) is:

$$\text{cols} = \left\lfloor \frac{W_{\max} - 2p + g}{s} \right\rfloor$$

The number of rows is \(\text{rows} = \lceil N / \text{cols} \rceil\). The resulting grid dimensions are:

$$W_{\text{grid}} = \text{cols} \cdot s - g + 2p, \quad H_{\text{grid}} = \text{rows} \cdot s - g + 2p$$

The grid is valid if \(W_{\text{grid}} \le W_{\max}\) and \(H_{\text{grid}} \le H_{\max}\). If either constraint is violated, the implementation falls back to an unconstrained square layout:

$$\text{cols} = \lceil \sqrt{N} \rceil, \quad \text{rows} = \lceil N / \text{cols} \rceil$$

### STL geometry: non-piercing tile boxes

Each tile in the STL is a rectangular box rather than a rectangle in a flat face. This is required to prevent adjacent tiles from sharing boundary edges, which many slicers misinterpret as a non-manifold geometry. Tile \((r, c)\) at layer \(z\) for filament \(f\) is a box:

$$\text{origin}: (c \cdot s + p,\ r \cdot s + p,\ z \cdot h), \quad \text{extent}: (t,\ t,\ h)$$

where \(h\) is the layer height in mm. Boxes for different filaments at the same layer are stored in separate STL files (one per filament colour); the slicer assigns each file to the corresponding extruder.

Gap regions between tiles use a *segmented* fill strategy to prevent STL geometry overlap:

- **Horizontal gaps** (between rows): full-width strips spanning all columns.
- **Vertical gaps** (between columns within each row): segmented per tile row, stopping at the horizontal gap boundaries.
- **Perimeter**: four border strips (top, bottom, left-of-tiles, right-of-tiles).

Segmenting vertical gaps prevents their STL boxes from overlapping with horizontal gap STL boxes, which would again produce non-manifold geometry.

### 300 DPI PNG export

The grid preview PNG is rendered at 300 DPI for use as a reference document. The canvas size in pixels is:

$$W_{\text{px}} = \text{round}\!\left(\frac{W_{\text{grid}}}{25.4} \times 300\right), \quad H_{\text{px}} = \text{round}\!\left(\frac{H_{\text{grid}}}{25.4} \times 300\right)$$

Each tile occupies \(\text{round}(t / 25.4 \times 300)\) pixels, with the gap and perimeter scaled proportionally. The scaling is exact to avoid sub-pixel tile misalignment at the reference resolution.
