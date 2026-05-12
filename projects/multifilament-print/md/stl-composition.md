### Per-filament combined STL

The standard export generates one STL file per filament colour. Each file contains all rectangular prisms (tiles and layers) where that filament is used, across all tiles and layers. The slicer loads all files simultaneously and assigns each to the corresponding extruder.

For filament \(f\), the STL contains one box for each `(tile, layer)` pair where the sequence assigns filament \(f\) to that layer:

```javascript
function buildFilamentSTL(sequences, filamentIndex, layout) {
    const { step, tileSize, layerHeight, cols, perimeterMargin } = layout;
    const prisms = [];

    sequences.forEach((seq, tileIdx) => {
        const row = Math.floor(tileIdx / cols);
        const col = tileIdx % cols;
        const x = col * step + perimeterMargin;
        const y = row * step + perimeterMargin;

        seq.forEach((filament, layerIdx) => {
            if (filament !== filamentIndex) return;
            prisms.push({
                x, y,
                z: layerIdx * layerHeight,
                w: tileSize, d: tileSize, h: layerHeight
            });
        });
    });

    return writeBinarySTL(prisms);
}
```

`writeBinarySTL` encodes each prism as two triangles per face (12 triangles per box) in the binary STL format (80-byte header, 4-byte count, then 50 bytes per triangle: 3 floats for normal + 3×3 floats for vertices + 2-byte attribute).

### Per-layer split STL

The alternative export generates one STL per `(layer, filament)` combination. This produces more files but allows the user to inspect and remix the print at the layer level. Each file contains all tiles in the grid at that layer that use that filament.

### Gap fill STL

If gap fill is enabled, an additional STL is generated for the gap/perimeter geometry in the selected gap filament. The gap geometry uses segmented boxes (see *Grid Layout Maths*) to prevent non-manifold intersections with the tile boxes.

### ZIP package structure

The full export package is a ZIP archive with a filename encoding the print parameters:

```
cal-{c}c{L}L-{rows}x{cols}-{t}mm-g{g}mm-base{b}top{top}-{sort}-YYYYMMDD.zip
├── grid-layout.json        — All settings in machine-readable format (v1.2.0)
├── README.txt              — Human-readable usage guide
├── stl/
│   ├── color_1.stl
│   ├── color_2.stl
│   └── ...
└── images/
    ├── grid-combined.png   — Combined view at 300 DPI
    └── grid-layer-0.png    — Per-layer renders
```

The `grid-layout.json` file is the single source of truth for the SCAN phase: it records the exact tile positions, sizes, and sequence order used to generate the print, enabling the scan alignment algorithm to reconstruct the overlay without any additional user input.
