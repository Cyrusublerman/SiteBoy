# MFP Blender Remake — Roadmap And Open Questions

## 1. Build Order

### Phase 0 — Confirm Current MFP Contract

Read and freeze:

- sequence generation;
- grid layout;
- scan JSON;
- quantize mapping;
- export CSV format.

Output:

```text
MFP compatibility checklist
```

### Phase 1 — Blender Calibration Grid

Build:

- `MFP_Params`;
- `MFP_SEQ_Count`;
- `MFP_SEQ_FilamentAt`;
- `MFP_GRID_Layout`;
- `MFP_TILE_BoxLayer`.

Goal:

```text
Generate the same calibration grid geometry as web MFP STL export.
```

### Phase 2 — Attribute Identity

Add attributes:

```text
sequence_id
tile_id
row
col
layer_index
filament_id
```

Goal:

```text
Every Blender element maps back to MFP CSV/JSON.
```

### Phase 3 — Calibration Data Import

Build Python import for:

```text
quantization-config.json
comparison.csv
calibrated palette
```

Goal:

```text
sequence_id -> calibrated colour inside Blender
```

### Phase 4 — Quantized Image Geometry

Convert quantized image data to Blender tile grid.

Goal:

```text
one image pixel -> one tile -> one sequence -> layer geometry
```

### Phase 5 — Path Generation

Replace or supplement prism geometry with tile toolpaths:

- perimeter;
- raster fill;
- optional spiral fill.

Goal:

```text
MFP object becomes explicit print path, not just STL volume.
```

### Phase 6 — nozzleboss Bridge

Build:

- path mesh conversion;
- Flow/Speed/Tool vertex colours;
- vertex order repair;
- contract validation.

Goal:

```text
Export MFP-derived G-code from Blender.
```

### Phase 7 — Feedback Loop

Print new Blender-generated calibration grid, scan through MFP, import calibration back into Blender.

Goal:

```text
closed calibration loop
```

## 2. Open Questions

### MFP Compatibility

- Must Blender output match current web MFP CSV byte-for-byte?
- Should Blender import existing MFP project ZIPs?
- Should the web tool export a Blender-friendly JSON?
- Should Blender become an alternative renderer/exporter, or the main future tool?

### Geometry

- Should calibration tiles be solid boxes, paths, or both?
- What fill pattern produces the most stable colour measurement?
- Should tile top surfaces be continuous or separated by gaps?
- Should gap fill be printable or only structural?

### Tool Changes

- Is the target printer multi-tool, AMS/MMU, or manual filament swap?
- Should MFP layers map to physical tools or planned pause/macros?
- Can nozzleboss encode the required tool changes?
- What is the minimum viable two-filament print?

### Calibration

- Should scan analysis stay in the web app?
- Should Blender eventually perform scan sampling?
- How should calibration uncertainty affect quantization?
- Should high-variance sequences be excluded from palette selection?

### Quantization

- Should Blender run quantization, or import quantized image data?
- Should dithering stay in JS/Python?
- Should each image pixel remain one square tile?
- Could quantized regions become vector paths rather than tile grids?

### Export

- Should the output be one nozzleboss object or many objects?
- Should each filament/layer be a separate object?
- Should nozzleboss output be packaged with the original MFP metadata?
- How should failed validation be reported?

## 3. Minimum Viable Blender Remake

MVP:

1. Generate 2-filament, 4-layer calibration grid.
2. Preserve the exact sequence table.
3. Create tile/layer boxes in Blender.
4. Assign filament IDs as attributes.
5. Preview theoretical colours.
6. Export a nozzleboss-compatible path for a simple tile fill.
7. Print and scan using existing MFP SCAN.

## 4. Success Criteria

The remake is successful when:

- MFP sequence maths matches existing docs;
- Blender geometry maps exactly to sequence IDs;
- calibration data can round-trip through print/scan/import;
- quantized image pixels become printable Blender elements;
- nozzleboss can export the generated path;
- the workflow is documented enough to rebuild from node maps.

## 5. Link Back To Main Blender G-code Workflow

This remake depends on:

- `../02-system-architecture.md`
- `../04-node-composition.md`
- `../06-post-processing-and-print-metadata.md`
- `../07-nozzleboss-export-contract.md`
- `../10-current-geo-nodes-analysis-plan.md`

The MFP remake should not fork the export system. It should be a source/generator module inside the broader Blender G-code workflow.

