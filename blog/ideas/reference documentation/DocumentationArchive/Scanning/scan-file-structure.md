# SCAN Tab - File Structure

## Algorithms Library (Reusable, Pure Functions)

### Color Analysis
- `assets/js/shared/algorithms/image/tile-color-extraction.js`
  - Extract average RGB from rectangular region with dead zone inset
  - Calculate color variance (quality metric)
  
### Geometric Transforms
- `assets/js/shared/algorithms/geometry/grid-scan-transform.js`
  - Transform grid coordinates (mm) to scan coordinates (px)
  - Apply scale, rotation, offset
  - Inverse transform for click detection

### Color Grouping
- `assets/js/shared/algorithms/color/color-similarity-grouping.js`
  - Cluster colors by ΔE2000 distance
  - Sort by hue, luminance, saturation

### Data Import/Export
- `assets/js/shared/algorithms/data/grid-csv-parser.js`
  - Parse grid CSV back to configuration object
  - Validate structure and data integrity

## Tool-Specific Modules (Scan Workflow Logic)

### `assets/js/tools/fabrication/scan/` folder:

- `scan-overlay-controller.js`
  - Manages interactive overlay state (position, scale, rotation)
  - Handles mouse drag/resize interactions
  - Renders overlay grid on canvas
  - Persists transform state

- `scan-tile-analyzer.js`
  - Orchestrates tile-by-tile color extraction
  - Maps grid indices to scan coordinates
  - Applies dead zone to each tile
  - Collects RGB samples and quality metrics

- `sequence-library-builder.js`
  - Builds final sequence library from analyzed tiles
  - Matches extracted colors to grid sequences
  - Sorts and groups entries
  - Validates completeness

- `scan-visualization-modes.js`
  - Implements canvas rendering modes:
    - Scan Only
    - Overlay Mode
    - Analysis Preview (dead zones)
    - Side-by-Side Comparison
  - Handles view switching and drawing

## Main Tool File
- `assets/js/tools/fabrication/multifilament-print-tool.js`
  - Imports and wires all scan modules
  - Manages UI state and button handlers
  - Coordinates between canvas, sidebar, and algorithms

## Data Flow

```
Grid CSV File
    ↓
grid-csv-parser.js → gridConfig
    ↓
User uploads scan image → scanImageData
    ↓
scan-overlay-controller.js → transform state (drag, resize)
    ↓
scan-tile-analyzer.js → extract colors using:
    - grid-scan-transform.js (coordinates)
    - tile-color-extraction.js (RGB averaging)
    ↓
sequence-library-builder.js → sequenceLibrary
    ↓
Export: JSON, GPL, CSV
```

## Module Responsibilities

### Pure Algorithm Modules (No DOM, No State)
- Input → Processing → Output
- Fully testable
- Cite sources in JSDoc
- Located in `algorithms/` library

### Tool-Specific Modules (State Management)
- Class-based or stateful functions
- Coordinate between algorithms and UI
- Handle persistence and validation
- Located in `tools/fabrication/scan/`

### Main Tool File (Orchestration)
- Wire UI events to handlers
- Call tool-specific modules
- Update canvas and status labels
- Manage top-level state

