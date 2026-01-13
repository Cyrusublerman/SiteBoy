/**
 * @fileoverview Export Package — Complete calibration grid export to ZIP
 * 
 * Generates a comprehensive ZIP archive containing:
 * - README and documentation
 * - Configuration files (JSON)
 * - Visual references (PNG)
 * - STL files (combined and per-layer)
 * - Data files (CSV, JSON, GPL)
 * - Sorted variants
 * 
 * @version 1.0.0
 */

/**
 * Generate README.txt content
 * 
 * @param {Object} gridData - Grid configuration and sequences
 * @param {Object} config - Full configuration object
 * @returns {string} README content
 */
export function generateREADME(gridData, config) {
    const { colours, rows, cols, width, height, sequences, layerCount, baseLayers, tileSize, gap } = gridData;
    const timestamp = new Date().toISOString();
    const gridId = config.gridId || 'unknown';
    
    return `${'='.repeat(80)}
MULTIFILAMENT CALIBRATION GRID
${'='.repeat(80)}

Generated: ${timestamp}
Grid ID: ${gridId}

${'='.repeat(80)}
PHYSICAL SPECIFICATIONS
${'='.repeat(80)}

Grid Dimensions:    ${width.toFixed(1)}mm × ${height.toFixed(1)}mm
Tile Size:          ${tileSize}mm × ${tileSize}mm
Gap Between Tiles:  ${gap}mm
Grid Layout:        ${rows} rows × ${cols} columns = ${rows * cols} tiles

Layer Configuration:
  - Layers per Tile:    ${layerCount}
  - Layer Height:       ${config.layerHeight || 0.08}mm
  - Total Height:       ${(layerCount * (config.layerHeight || 0.08)).toFixed(2)}mm
  - Base Layers:        ${baseLayers || 0}
  - Base Direction:     ${config.baseDirection || 'bottom'}

${'='.repeat(80)}
FILAMENT CONFIGURATION
${'='.repeat(80)}

Colors Used: ${colours.length} (+ Empty = ${colours.length + 1} total indices)
  0. Empty (no filament)
${colours.map((c, i) => `  ${i + 1}. ${c.n.padEnd(20)} (${c.h})`).join('\n')}

${'='.repeat(80)}
SEQUENCE INFORMATION
${'='.repeat(80)}

Total Sequences:    ${sequences.length}
Sequence Formula:   N × (N^M - 1) / (N - 1)
                    ${colours.length} × (${colours.length}^${layerCount} - 1) / ${colours.length - 1} = ${sequences.length}

Sort Order:         ${config.sortOrder || 'layercount'} (default)
Empty Cells:        ${gridData.emptyCells ? gridData.emptyCells.length : 0}

Examples:
  [1,0,0,0]  → Pure ${colours[0].n} (1 layer)
  [1,2,0,0]  → ${colours[0].n} base + ${colours[1].n} (2 layers)
  [1,2,3,4]  → All colors stacked (${layerCount} layers)

${'='.repeat(80)}
PRINTING INSTRUCTIONS
${'='.repeat(80)}

1. Load filaments in this order:
${colours.map((c, i) => `   Slot ${i + 1}: ${c.n}`).join('\n')}

2. Print STL files in sequence:
   - Print ALL base layers first (if configured)
   - Then print each color's layers in order
   - Use slicer's sequential printing mode

3. Use these settings:
   - Layer Height: ${config.layerHeight || 0.08}mm
   - First Layer Speed: 50mm/s (for smoothness)
   - Infill: 100%
   - No supports needed

4. Bed adhesion:
   - Use smooth PEI sheet
   - Clean with IPA before printing
   - First layer is critical for scan quality

${'='.repeat(80)}
SCANNING INSTRUCTIONS
${'='.repeat(80)}

1. Wait for print to cool completely (30+ minutes)

2. Scan bottom surface (smoothest):
   - Resolution: 600 DPI minimum
   - Format: PNG or TIFF (no JPEG compression)
   - Lighting: Diffuse, even lighting
   - Place on white background
   - Scan with grid orientation matching visual.png

3. Optional: Scan top surface for comparison

4. Upload scans to SCAN tab in tool

5. Tool will auto-detect grid and extract colors

${'='.repeat(80)}
FILES INCLUDED
${'='.repeat(80)}

Grids:
  - Visual references (PNG) for each layer and combined view
  
Data:
  - sequences.csv: All sequences with coordinates and predicted colors
  - sequences.json: Machine-readable sequence map
  - palette.gpl: GIMP palette file (import into image editors)
  - grid-layout.json: Physical dimensions and constraints

STL Files:
  - combined/: One file per filament (all layers merged)
  - layers/: Individual files per filament per layer

Sorted Variants:
  - Alternative sort orders for different analysis needs

${'='.repeat(80)}
SCAN CORRELATION
${'='.repeat(80)}

After scanning, the tool will:
  1. Detect grid alignment and tile positions
  2. Extract center pixel color from each tile
  3. Map colors back to sequences using grid layout
  4. Generate actual color palette (GPL file)
  5. Export comparison CSV (predicted vs actual)

The calibrated palette can then be used for quantizing artwork images.

${'='.repeat(80)}
NOTES
${'='.repeat(80)}

- Keep this folder as a complete archive
- Each calibration is unique to these specific filaments
- Reprint if filaments change (brand, age, batch)
- Store in version control for reproducibility

${'='.repeat(80)}
`;
}

/**
 * Generate config.json content
 * 
 * @param {Object} gridData - Grid configuration
 * @param {Object} options - Additional options
 * @returns {string} JSON configuration
 */
export function generateConfigJSON(gridData, options = {}) {
    const config = {
        version: '2.0.0',
        generatedAt: new Date().toISOString(),
        gridId: options.gridId || `${gridData.colours.length}c${gridData.layerCount}L-${gridData.rows}x${gridData.cols}-${gridData.tileSize}mm-${generateDateStamp()}`,
        
        physical: {
            gridWidth: gridData.width,
            gridHeight: gridData.height,
            tileSize: gridData.tileSize,
            gap: gridData.gap,
            rows: gridData.rows,
            cols: gridData.cols,
            totalTiles: gridData.rows * gridData.cols,
            emptyCells: gridData.emptyCells ? gridData.emptyCells.length : 0,
            units: 'mm'
        },
        
        layers: {
            count: gridData.layerCount,
            height: options.layerHeight || 0.08,
            totalHeight: gridData.layerCount * (options.layerHeight || 0.08),
            baseLayers: gridData.baseLayers || 0,
            baseColor: options.baseColor || null,
            baseDirection: options.baseDirection || 'bottom'
        },
        
        filaments: gridData.colours.map((c, i) => ({
            index: i + 1,
            name: c.n,
            hex: c.h,
            brand: options.filamentBrand || 'Unknown',
            batch: options.filamentBatch || 'Unknown'
        })),
        
        sequences: {
            total: gridData.sequences.length,
            formula: 'N × (N^M - 1) / (N - 1)',
            sortOrder: options.sortOrder || 'layercount',
            available: ['layercount', 'basecolor', 'topcolor', 'complexity', 'lexicographic']
        },
        
        constraints: options.constraints || {
            bedWidth: 256,
            bedHeight: 256,
            scanWidth: 210,
            scanHeight: 297
        },
        
        export: {
            stlCombined: options.stlCombined !== false,
            stlPerLayer: options.stlPerLayer !== false,
            sortedVariants: options.sortedVariants !== false,
            layerVisuals: options.layerVisuals !== false
        }
    };
    
    return JSON.stringify(config, null, 2);
}

/**
 * Generate manifest.json content
 * 
 * @param {Array<{path: string, size: number, description: string}>} files - File list
 * @returns {string} JSON manifest
 */
export function generateManifest(files) {
    const manifest = {
        version: '1.2.0',
        toolVersion: '1.2.0',
        toolName: 'Multifilament Print Calibration Tool',
        files: files,
        totalFiles: files.length,
        totalSize: files.reduce((sum, f) => sum + (f.size || 0), 0),
        checksumAlgorithm: 'None (browser limitation)',
        generatedAt: new Date().toISOString(),
        compatibleWith: ['1.0.0', '1.0.5', '1.1.0', '1.2.0']
    };
    
    return JSON.stringify(manifest, null, 2);
}

/**
 * Generate grid-layout.json content
 * 
 * @param {Object} gridData - Grid configuration
 * @returns {string} JSON layout data
 */
export function generateLayoutJSON(gridData) {
    const layout = {
        version: '1.2.0',
        generatedAt: new Date().toISOString(),
        layerCount: gridData.layerCount || 4,
        baseLayers: gridData.baseLayers || 0,
        topLayers: gridData.topLayers || 0,
        sortMethod: gridData.sortMethod || 'Layer Count',
        tileSize: gridData.tileSize,
        gap: gridData.gap,
        gridSize: {
            rows: gridData.rows,
            cols: gridData.cols
        },
        dimensions: {
            width: gridData.width,
            height: gridData.height
        },
        palette: gridData.colours.map(c => ({
            name: c.n,
            hex: c.h
        })),
        tiles: gridData.sequences.map((seq, idx) => {
            const row = Math.floor(idx / gridData.cols);
            const col = idx % gridData.cols;
            const step = gridData.tileSize + gridData.gap;
            
            return {
                index: idx,
                row,
                col,
                position: {
                    x: col * step,
                    y: row * step,
                    width: gridData.tileSize,
                    height: gridData.tileSize
                },
                sequence: seq,
                isEmpty: gridData.emptyCells && gridData.emptyCells.includes(idx)
            };
        })
    };
    
    return JSON.stringify(layout, null, 2);
}

/**
 * Generate date stamp for filenames
 * @returns {string} YYYYMMDD format
 */
export function generateDateStamp() {
    const now = new Date();
    return now.getFullYear().toString() +
           (now.getMonth() + 1).toString().padStart(2, '0') +
           now.getDate().toString().padStart(2, '0');
}

/**
 * Generate timestamp for filenames
 * @returns {string} YYYYMMDD_HHMMSS format
 */
export function generateTimestamp() {
    const now = new Date();
    return now.getFullYear().toString() +
           (now.getMonth() + 1).toString().padStart(2, '0') +
           now.getDate().toString().padStart(2, '0') + '_' +
           now.getHours().toString().padStart(2, '0') +
           now.getMinutes().toString().padStart(2, '0') +
           now.getSeconds().toString().padStart(2, '0');
}

/**
 * Generate folder name for export
 * @param {Object} gridData - Grid configuration
 * @returns {string} Folder name
 */
export function generateFolderName(gridData) {
    return `calibration-${gridData.colours.length}c${gridData.layerCount}L-${gridData.rows}x${gridData.cols}-${gridData.tileSize}mm-${generateTimestamp()}`;
}

/**
 * Generate INSTRUCTIONS.txt for scans folder
 * @returns {string} Instructions text
 */
export function generateScanInstructions() {
    return `SCANNING INSTRUCTIONS
${'='.repeat(80)}

PREPARATION:
1. Wait for print to cool completely (30+ minutes minimum)
2. Remove any support material or raft
3. Clean surface gently with compressed air (no touching!)

SCANNING SETUP:
- Scanner: Flatbed scanner (NOT photo/phone)
- Resolution: 600 DPI minimum (1200 DPI preferred)
- Color Mode: 24-bit RGB color
- Format: PNG or TIFF (lossless only)
- Background: White paper or calibration sheet
- Lighting: Scanner's built-in light (no external light)

ALIGNMENT:
- Place grid face-down on scanner glass
- Align edges parallel to scanner edges
- Note orientation for software correlation

FILENAME CONVENTION:
- Bottom surface: grid-bottom-YYYYMMDD-HHMMSS.png
- Top surface: grid-top-YYYYMMDD-HHMMSS.png
- Multiple sheets: grid-bottom-sheet1.png, grid-bottom-sheet2.png

UPLOAD TO TOOL:
1. Go to SCAN tab in multifilament-print tool
2. Load grid CSV or use last generated grid
3. Upload scan image(s)
4. Adjust offset/scale if needed
5. Click "Analyze Scan"

TROUBLESHOOTING:
- Blurry scan: Clean scanner glass, increase resolution
- Alignment issues: Use grid overlay to adjust offset
- Color inaccuracy: Calibrate scanner, check lighting
- Missing tiles: Verify grid wasn't damaged during removal

${'='.repeat(80)}
`;
}

