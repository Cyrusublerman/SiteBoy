# Calibration Grid Export Naming Convention

## Format

All exported calibration grid files follow this systematic naming convention:

```
cal-{colors}c{layers}L-{rows}x{cols}-{tilesize}mm[-gXofY][-extra]-YYYYMMDD.ext
```

### Components

| Component | Description | Example |
|-----------|-------------|---------|
| `cal` | Prefix indicating calibration grid | `cal` |
| `{colors}c` | Number of filament colors | `3c` (3 colors) |
| `{layers}L` | Number of layers per tile | `4L` (4 layers) |
| `{rows}x{cols}` | Grid dimensions | `9x9` (9 rows, 9 columns) |
| `{tilesize}mm` | Tile size in millimeters | `10mm` |
| `-gXofY` | **Optional:** Grid split info (X of Y) | `-g1of2` (grid 1 of 2) |
| `-extra` | **Optional:** Additional descriptor | `-Red`, `-comparison` |
| `YYYYMMDD` | Date stamp (year-month-day) | `20260104` (Jan 4, 2026) |
| `.ext` | File extension | `.png`, `.stl`, `.csv` |

## File Types

### PNG Exports (Grid Images)
**Pattern:** `cal-{colors}c{layers}L-{rows}x{cols}-{tilesize}mm[-gXofY]-YYYYMMDD.png`

**Examples:**
- `cal-3c4L-9x9-10mm-20260104.png`
  - 3 colors, 4 layers, 9×9 grid, 10mm tiles, Jan 4 2026
- `cal-4c5L-16x16-8mm-g1of2-20260104.png`
  - 4 colors, 5 layers, 16×16 grid, 8mm tiles, grid 1 of 2, Jan 4 2026

### STL Exports (3D Print Files)
**Pattern:** `cal-{colors}c{layers}L-{rows}x{cols}-{tilesize}mm[-gXofY]-{ColorName}-YYYYMMDD.stl`

**Note:** One STL file is generated per color. Color names have spaces replaced with underscores.

**Examples:**
- `cal-3c4L-9x9-10mm-Jade_White-20260104.stl`
- `cal-3c4L-9x9-10mm-Red-20260104.stl`
- `cal-3c4L-9x9-10mm-Blue-20260104.stl`
- `cal-4c5L-16x16-8mm-g1of2-Magenta-20260104.stl`
- `cal-3c4L-9x9-10mm-Pumpkin_Orange-20260104.stl`

### CSV Exports (Grid Data)
**Pattern:** `cal-{colors}c{layers}L-{rows}x{cols}-{tilesize}mm[-gXofY]-YYYYMMDD.csv`

**Examples:**
- `cal-3c4L-9x9-10mm-20260104.csv`
- `cal-4c5L-16x16-8mm-g2of3-20260104.csv`

### Comparison CSV (Scan Analysis Results)
**Pattern:** `cal-{colors}c{layers}L-{rows}x{cols}-{tilesize}mm-comparison-YYYYMMDD.csv`

**Example:**
- `cal-3c4L-9x9-10mm-comparison-20260104.csv`

## Benefits

### 1. **Instant Identification**
At a glance, you know:
- How many colors were used
- How many layers per tile
- Grid dimensions
- Tile size
- Which grid (if split)
- When it was created

### 2. **Easy Sorting**
Files sort naturally by:
1. Color count (3c, 4c, 5c...)
2. Layer count (3L, 4L, 5L...)
3. Grid size (9x9, 16x16...)
4. Tile size (8mm, 10mm, 12mm...)
5. Date (chronological)

### 3. **Batch Organization**
When you generate multiple grids:
```
cal-3c4L-9x9-10mm-20260104.png
cal-3c4L-9x9-10mm-20260104.csv
cal-3c4L-9x9-10mm-JadeWhite-20260104.stl
cal-3c4L-9x9-10mm-Red-20260104.stl
cal-3c4L-9x9-10mm-Blue-20260104.stl
```
All related files are grouped together alphabetically.

### 4. **Split Grid Management**
When a grid is too large and splits:
```
cal-5c6L-20x20-8mm-g1of3-20260104.png
cal-5c6L-20x20-8mm-g2of3-20260104.png
cal-5c6L-20x20-8mm-g3of3-20260104.png
```
You can immediately see they're related and which order to print them.

### 5. **Version Tracking**
The date stamp lets you track different iterations:
```
cal-3c4L-9x9-10mm-20260104.png  (first attempt)
cal-3c4L-9x9-10mm-20260107.png  (revised 3 days later)
```

## Real-World Workflow Example

### Scenario: Testing 4-color, 5-layer calibration

**Day 1: Generate and print grid**
```
cal-4c5L-16x16-10mm-20260104.png  ← View/print this
cal-4c5L-16x16-10mm-20260104.csv  ← Reference data
cal-4c5L-16x16-10mm-Jade_White-20260104.stl  ← Print with Jade White
cal-4c5L-16x16-10mm-Red-20260104.stl          ← Print with Red
cal-4c5L-16x16-10mm-Blue-20260104.stl         ← Print with Blue
cal-4c5L-16x16-10mm-Gold-20260104.stl         ← Print with Gold
```

**Day 2: Scan results and compare**
```
cal-4c5L-16x16-10mm-comparison-20260105.csv  ← Analysis results
```

**Day 3: Try smaller tiles**
```
cal-4c5L-20x20-8mm-20260106.png  ← New test
cal-4c5L-20x20-8mm-20260106.csv
```

You can now easily:
- Compare 10mm vs 8mm tiles
- Know which CSV matches which print
- Track your calibration progress over time

## Quick Decode Guide

**Filename:** `cal-4c5L-16x16-8mm-g1of2-20260104.png`

**Translation:**
- `cal` = Calibration grid
- `4c` = 4 filament colors
- `5L` = 5 layers per tile (color changes)
- `16x16` = 256 tiles total (16 rows × 16 columns)
- `8mm` = Each tile is 8×8mm
- `g1of2` = This is grid 1 of 2 (grid was split)
- `20260104` = Created January 4, 2026
- `.png` = PNG image file

**Physical print:** 128×128mm, 256 tiles, needs 2 separate prints

