/**
 * @fileoverview STL Generation — 3D geometry export for multifilament printing
 * 
 * Two pipelines:
 *  1. Rectangle-based (vectorizePixels + generateBox) — pixel-aligned boxes,
 *     used for calibration grids where exact tile geometry matters.
 *  2. Contour-based (contourSTL) — marching squares → Douglas-Peucker →
 *     Chaikin smoothing → ear-clip triangulation + side walls.
 *     Used for artwork STLs where smooth region boundaries matter.
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/stl/index.js
 */

/**
 * Vectorize pixel set into rectangles using greedy merging
 * 
 * Reduces STL file size dramatically by combining adjacent pixels into larger
 * rectangles instead of creating individual boxes for each pixel.
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/stl/index.js:14-65
 * @algorithm Greedy scan: left-to-right, top-to-bottom; expand horizontally then vertically
 * @param {Set<string>} pixelSet - Set of "x,y" pixel coordinate strings
 * @param {number} width - Image width in pixels
 * @param {number} height - Image height in pixels
 * @returns {Array<{x: number, y: number, w: number, h: number}>} Array of rectangles
 * 
 * @example
 * const pixelSet = new Set(['0,0', '1,0', '2,0', '0,1', '1,1', '2,1']);
 * // Pattern: 3×2 rectangle
 * const rectangles = vectorizePixels(pixelSet, 800, 600);
 * // Returns [{x: 0, y: 0, w: 3, h: 2}]
 * // Merged 6 pixels into 1 rectangle!
 */
export function vectorizePixels(pixelSet, width, height) {
    const rectangles = [];
    const processed = new Set();

    // Convert set to 2D grid for easier access
    const grid = Array(height).fill(null).map(() => Array(width).fill(false));
    for (let coord of pixelSet) {
        const [x, y] = coord.split(',').map(Number);
        if (y >= 0 && y < height && x >= 0 && x < width) {
            grid[y][x] = true;
        }
    }

    // Greedy rectangle extraction
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const coord = `${x},${y}`;
            if (!grid[y][x] || processed.has(coord)) continue;

            // Start new rectangle
            let w = 1, h = 1;

            // Expand horizontally
            while (x + w < width && grid[y][x + w] && !processed.has(`${x + w},${y}`)) {
                w++;
            }

            // Try to expand vertically (check if all rows match)
            let canExpand = true;
            while (canExpand && y + h < height) {
                for (let dx = 0; dx < w; dx++) {
                    if (!grid[y + h][x + dx] || processed.has(`${x + dx},${y + h}`)) {
                        canExpand = false;
                        break;
                    }
                }
                if (canExpand) h++;
            }

            // Mark all pixels in this rectangle as processed
            for (let dy = 0; dy < h; dy++) {
                for (let dx = 0; dx < w; dx++) {
                    processed.add(`${x + dx},${y + dy}`);
                }
            }

            rectangles.push({x, y, w, h});
        }
    }

    return rectangles;
}

/**
 * Generate ASCII STL box geometry (12 triangular facets)
 * 
 * Creates a rectangular prism (box) using 2 triangles per face × 6 faces = 12 facets.
 * Each facet includes a normal vector (perpendicular to surface) for proper rendering.
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/stl/index.js:78-164
 * @formula Box = 6 faces × 2 triangles = 12 facets
 * @param {number} x0 - Minimum X coordinate (mm)
 * @param {number} y0 - Minimum Y coordinate (mm)
 * @param {number} z0 - Minimum Z coordinate (mm)
 * @param {number} x1 - Maximum X coordinate (mm)
 * @param {number} y1 - Maximum Y coordinate (mm)
 * @param {number} z1 - Maximum Z coordinate (mm)
 * @returns {string} ASCII STL facets (without solid/endsolid wrapper)
 * 
 * @example
 * const stl = generateBox(0, 0, 0, 10, 10, 0.08);
 * console.log(stl);
 * // facet normal 0 0 -1
 * //   outer loop
 * //     vertex 0 0 0
 * //     vertex 10 0 0
 * //     vertex 10 10 0
 * //   endloop
 * // endfacet
 * // ... (11 more facets)
 */
export function generateBox(x0, y0, z0, x1, y1, z1) {
    return `facet normal 0 0 -1
  outer loop
    vertex ${x0} ${y0} ${z0}
    vertex ${x1} ${y0} ${z0}
    vertex ${x1} ${y1} ${z0}
  endloop
endfacet
facet normal 0 0 -1
  outer loop
    vertex ${x0} ${y0} ${z0}
    vertex ${x1} ${y1} ${z0}
    vertex ${x0} ${y1} ${z0}
  endloop
endfacet
facet normal 0 0 1
  outer loop
    vertex ${x0} ${y0} ${z1}
    vertex ${x1} ${y1} ${z1}
    vertex ${x1} ${y0} ${z1}
  endloop
endfacet
facet normal 0 0 1
  outer loop
    vertex ${x0} ${y0} ${z1}
    vertex ${x0} ${y1} ${z1}
    vertex ${x1} ${y1} ${z1}
  endloop
endfacet
facet normal 0 -1 0
  outer loop
    vertex ${x0} ${y0} ${z0}
    vertex ${x1} ${y0} ${z0}
    vertex ${x1} ${y0} ${z1}
  endloop
endfacet
facet normal 0 -1 0
  outer loop
    vertex ${x0} ${y0} ${z0}
    vertex ${x1} ${y0} ${z1}
    vertex ${x0} ${y0} ${z1}
  endloop
endfacet
facet normal 0 1 0
  outer loop
    vertex ${x0} ${y1} ${z0}
    vertex ${x1} ${y1} ${z1}
    vertex ${x1} ${y1} ${z0}
  endloop
endfacet
facet normal 0 1 0
  outer loop
    vertex ${x0} ${y1} ${z0}
    vertex ${x0} ${y1} ${z1}
    vertex ${x1} ${y1} ${z1}
  endloop
endfacet
facet normal -1 0 0
  outer loop
    vertex ${x0} ${y0} ${z0}
    vertex ${x0} ${y1} ${z1}
    vertex ${x0} ${y1} ${z0}
  endloop
endfacet
facet normal -1 0 0
  outer loop
    vertex ${x0} ${y0} ${z0}
    vertex ${x0} ${y0} ${z1}
    vertex ${x0} ${y1} ${z1}
  endloop
endfacet
facet normal 1 0 0
  outer loop
    vertex ${x1} ${y0} ${z0}
    vertex ${x1} ${y1} ${z0}
    vertex ${x1} ${y1} ${z1}
  endloop
endfacet
facet normal 1 0 0
  outer loop
    vertex ${x1} ${y0} ${z0}
    vertex ${x1} ${y1} ${z1}
    vertex ${x1} ${y0} ${z1}
  endloop
endfacet
`;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTOUR-BASED STL PIPELINE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Build a binary scalar field from a pixel Set, padded by 1 cell so that
 * marching squares can produce closed contours at image boundaries.
 *
 * @param {Set<string>} pixelSet - "x,y" coordinate strings
 * @param {number} width
 * @param {number} height
 * @returns {{field: Float32Array, fieldW: number, fieldH: number}}
 */
function buildBinaryField(pixelSet, width, height) {
    const fieldW = width + 2;
    const fieldH = height + 2;
    const field = new Float32Array(fieldW * fieldH);
    for (const coord of pixelSet) {
        const [x, y] = coord.split(',').map(Number);
        if (x >= 0 && x < width && y >= 0 && y < height) {
            field[(y + 1) * fieldW + (x + 1)] = 1.0;
        }
    }
    return { field, fieldW, fieldH };
}

/**
 * Generate STL facets from a pixel region using contour extraction
 * and optional smoothing.
 *
 * Pipeline: pixels → binary field → marching squares → simplify →
 *           Chaikin smooth → ear-clip top/bottom caps → side walls.
 *
 * @param {Set<string>} pixelSet - "x,y" pixel coordinates
 * @param {number} width - Image width in pixels
 * @param {number} height - Image height in pixels
 * @param {number} z0 - Bottom Z (mm)
 * @param {number} z1 - Top Z (mm)
 * @param {number} pixelSize - Physical size of one pixel (mm)
 * @param {Object} [smoothing] - Smoothing parameters
 * @param {number} [smoothing.simplifyTolerance=0.3] - Douglas-Peucker ε in pixels
 * @param {number} [smoothing.chaikinIterations=2] - Chaikin passes (0 = none)
 * @param {number} [smoothing.minContourArea=2] - Drop contours smaller than this (px²)
 * @returns {string} ASCII STL facet data
 */
export async function contourSTL(pixelSet, width, height, z0, z1, pixelSize, smoothing = {}) {
    const {
        simplifyTolerance = 0.3,
        chaikinIterations = 2,
        minContourArea = 2
    } = smoothing;

    if (pixelSet.size === 0) return '';

    const [
        { extractContours, simplifyContour },
        { chaikinSmooth },
        { earClipTriangulate: earClip, polygonArea: polyArea, ensureCCW }
    ] = await Promise.all([
        import('./marching-squares.js'),
        import('./curve-geometry.js'),
        import('./polygon-operations.js')
    ]);

    const { field, fieldW, fieldH } = buildBinaryField(pixelSet, width, height);

    const rawContours = extractContours(field, fieldW, fieldH, 0.5, { cellSize: 1 });
    if (rawContours.length === 0) return [];

    const allParts = [];

    for (let contour of rawContours) {
        contour = contour.map(p => ({ x: p.x - 1, y: height - (p.y - 1) }));

        if (Math.abs(polyArea(contour)) < minContourArea) continue;

        if (simplifyTolerance > 0 && contour.length > 4) {
            contour = simplifyContour(contour, simplifyTolerance);
        }

        if (chaikinIterations > 0 && contour.length >= 3) {
            contour = chaikinSmooth(contour, chaikinIterations, true);
        }

        if (contour.length < 3) continue;

        contour = ensureCCW(contour);

        const scaled = contour.map(p => ({ x: p.x * pixelSize, y: p.y * pixelSize }));

        const parts = extrudeContourToSTL(scaled, z0, z1, earClip);
        for (let i = 0; i < parts.length; i++) allParts.push(parts[i]);
    }

    return allParts;
}

/**
 * Extrude a single closed 2D contour into a 3D slab and emit STL facets.
 * Produces: top cap + bottom cap + side walls.
 *
 * @param {Array<{x: number, y: number}>} contour - CCW polygon in mm
 * @param {number} z0 - Bottom Z
 * @param {number} z1 - Top Z
 * @returns {string} STL facet string
 */
function extrudeContourToSTL(contour, z0, z1, earClipTriangulate) {
    const parts = [];
    const n = contour.length;

    // ── Top cap (z1, CCW = normal +Z) ────────────────────────────
    const topTris = earClipTriangulate(contour);
    for (const [a, b, c] of topTris) {
        parts.push(`facet normal 0 0 1
  outer loop
    vertex ${a.x} ${a.y} ${z1}
    vertex ${b.x} ${b.y} ${z1}
    vertex ${c.x} ${c.y} ${z1}
  endloop
endfacet
`);
    }

    // ── Bottom cap (z0, CW when viewed from -Z = reverse winding) ─
    for (const [a, b, c] of topTris) {
        parts.push(`facet normal 0 0 -1
  outer loop
    vertex ${a.x} ${a.y} ${z0}
    vertex ${c.x} ${c.y} ${z0}
    vertex ${b.x} ${b.y} ${z0}
  endloop
endfacet
`);
    }

    // ── Side walls ───────────────────────────────────────────────
    for (let i = 0; i < n; i++) {
        const a = contour[i];
        const b = contour[(i + 1) % n];

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const nx = len > 1e-8 ? dy / len : 0;
        const ny = len > 1e-8 ? -dx / len : 0;

        parts.push(`facet normal ${nx} ${ny} 0
  outer loop
    vertex ${a.x} ${a.y} ${z0}
    vertex ${b.x} ${b.y} ${z0}
    vertex ${b.x} ${b.y} ${z1}
  endloop
endfacet
facet normal ${nx} ${ny} 0
  outer loop
    vertex ${a.x} ${a.y} ${z0}
    vertex ${b.x} ${b.y} ${z1}
    vertex ${a.x} ${a.y} ${z1}
  endloop
endfacet
`);
    }

    return parts;
}

/**
 * Wrap STL facets with ASCII STL header and footer
 * 
 * @param {string} facets - STL facet data
 * @param {string} name - Object name (alphanumeric, underscores allowed)
 * @returns {string} Complete ASCII STL file content
 */
function wrapSTL(facets, name) {
    return `solid ${name}\n${facets}endsolid ${name}\n`;
}

/**
 * Export artwork as STL files (one per filament)
 * 
 * Generates STL files for 3D printing multifilament artwork. Each filament gets
 * one STL file containing all of its layers combined.
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/stl/index.js:189-233
 * @param {Array<Array<Set<string>>>} layerMaps - From expandToLayers(): [layer][filament] = Set("x,y")
 * @param {Array<string>} filamentNames - Names for each filament
 * @param {Object} config - Export configuration
 * @param {number} config.imageWidth - Image width in pixels (or grid cols)
 * @param {number} config.imageHeight - Image height in pixels (or grid rows)
 * @param {number} config.printWidth - Print width in mm
 * @param {number} config.layerHeight - Layer height in mm
 * @param {boolean} [config.isGrid=false] - True for calibration grids with explicit sizes
 * @param {number} [config.tileSize] - Tile size in mm (grid mode only)
 * @param {number} [config.gap] - Gap size in mm (grid mode only)
 * @param {number} [config.perimeterMargin] - Perimeter margin in mm (grid mode only)
 * @param {boolean} [config.gapFillEnabled=false] - True to fill gaps/perimeter with filament
 * @param {string} [config.gapFilamentName] - Name of filament to use for gaps/perimeter
 * @param {number} [config.baseLayers=0] - Number of base layers (grid mode only)
 * @returns {Object<string, string>} Map of filename → STL content
 * 
 * @example
 * const layerMaps = expandToLayers(imageData, sequenceMap, 4);
 * const names = ['Red PLA', 'Blue PLA', 'Yellow PLA', 'White PETG'];
 * const stls = exportArtworkSTLs(layerMaps, names, {
 *   imageWidth: 800,
 *   imageHeight: 600,
 *   printWidth: 170,
 *   layerHeight: 0.08
 * });
 * 
 * // Download files:
 * Object.entries(stls).forEach(([filename, content]) => {
 *   const blob = new Blob([content], {type: 'text/plain'});
 *   saveAs(blob, filename);
 * });
 * // Creates: artwork_Red_PLA.stl, artwork_Blue_PLA.stl, etc.
 */
export function exportArtworkSTLs(layerMaps, filamentNames, config) {
    const { imageWidth, imageHeight, printWidth, layerHeight, 
            isGrid = false, tileSize, gap = 0, perimeterMargin = 0,
            gapFillEnabled = false, gapFilamentName = null, baseLayers = 0,
            totalLayers = null } = config;
    
    // Use provided totalLayers or calculate from layerMaps
    const actualTotalLayers = totalLayers || layerMaps.length;
    
    const stls = {};
    const filamentCount = layerMaps[0].length;

    // Generate one STL per filament (all layers combined)
    for (let fi = 0; fi < filamentCount; fi++) {
        const facetParts = [];
        let totalRects = 0;

        // Combine all layers for this filament
        for (let li = 0; li < layerMaps.length; li++) {
            const pixels = layerMaps[li][fi];
            if (pixels.size === 0) continue;

            const rectangles = vectorizePixels(pixels, imageWidth, imageHeight);
            totalRects += rectangles.length;

            const z0 = li * layerHeight;
            const z1 = z0 + layerHeight;

            for (let rect of rectangles) {
                if (isGrid) {
                    for (let dy = 0; dy < rect.h; dy++) {
                        for (let dx = 0; dx < rect.w; dx++) {
                            const tileCol = rect.x + dx;
                            const tileRow = rect.y + dy;
                            
                            const x0 = perimeterMargin + (tileCol * (tileSize + gap));
                            const y0 = perimeterMargin + (tileRow * (tileSize + gap));
                            const x1 = x0 + tileSize;
                            const y1 = y0 + tileSize;
                            
                            facetParts.push(generateBox(x0, y0, z0, x1, y1, z1));
                        }
                    }
                } else {
                    const pixelSize = printWidth / imageWidth;
                    const x0 = rect.x * pixelSize;
                    const y0 = rect.y * pixelSize;
                    const x1 = (rect.x + rect.w) * pixelSize;
                    const y1 = (rect.y + rect.h) * pixelSize;
                    
                    facetParts.push(generateBox(x0, y0, z0, x1, y1, z1));
                }
            }
        }
        
        if (isGrid && gapFillEnabled && gapFilamentName && filamentNames[fi] === gapFilamentName) {
            facetParts.push(generateGapAndPerimeterGeometry(
                imageWidth, imageHeight, tileSize, gap, perimeterMargin,
                layerHeight, baseLayers, actualTotalLayers
            ));
        }

        if (facetParts.length > 0) {
            const name = `Artwork_${filamentNames[fi]}`;
            const fileName = `artwork_${filamentNames[fi].replace(/[^a-zA-Z0-9]/g, '_')}.stl`;
            stls[fileName] = [`solid ${name}\n`, ...facetParts, `endsolid ${name}\n`];
        }
    }

    return stls;
}

/**
 * Generate STL geometry for gaps and perimeter margin
 * 
 * Creates boxes for:
 * - Horizontal gaps between tile rows
 * - Vertical gaps between tile columns
 * - Perimeter border around entire grid
 * 
 * @param {number} cols - Number of tile columns
 * @param {number} rows - Number of tile rows
 * @param {number} tileSize - Tile size in mm
 * @param {number} gap - Gap size in mm
 * @param {number} perimeterMargin - Perimeter margin in mm
 * @param {number} layerHeight - Layer height in mm
 * @param {number} baseLayers - Number of base layers (gaps fill these layers)
 * @param {number} totalLayers - Total number of layers
 * @returns {string} STL facet data
 */
function generateGapAndPerimeterGeometry(cols, rows, tileSize, gap, perimeterMargin, 
                                          layerHeight, baseLayers, totalLayers) {
    let facets = '';
    
    if (gap === 0 && perimeterMargin === 0) return facets;
    
    const totalWidth = (cols * tileSize) + ((cols - 1) * gap) + (2 * perimeterMargin);
    const totalHeight = (rows * tileSize) + ((rows - 1) * gap) + (2 * perimeterMargin);
    
    // Gaps and perimeter only exist in base layers
    const layerCount = Math.min(baseLayers, totalLayers);
    
    for (let li = 0; li < layerCount; li++) {
        const z0 = li * layerHeight;
        const z1 = z0 + layerHeight;
        
        // Generate perimeter border (if enabled)
        if (perimeterMargin > 0) {
            // Top border
            facets += generateBox(0, 0, z0, totalWidth, perimeterMargin, z1);
            
            // Bottom border
            facets += generateBox(0, totalHeight - perimeterMargin, z0, 
                                 totalWidth, totalHeight, z1);
            
            // Left border (excluding corners already covered)
            facets += generateBox(0, perimeterMargin, z0, 
                                 perimeterMargin, totalHeight - perimeterMargin, z1);
            
            // Right border (excluding corners already covered)
            facets += generateBox(totalWidth - perimeterMargin, perimeterMargin, z0,
                                 totalWidth, totalHeight - perimeterMargin, z1);
        }
        
        // Generate gap fill using individual cells to avoid overlaps
        // Horizontal gaps: full-width strips between rows
        if (gap > 0) {
            for (let row = 0; row < rows - 1; row++) {
                const y0 = perimeterMargin + ((row + 1) * tileSize) + (row * gap);
                const y1 = y0 + gap;
                
                // Full width horizontal gap strip
                facets += generateBox(perimeterMargin, y0, z0,
                                     totalWidth - perimeterMargin, y1, z1);
            }
        }
        
        // Vertical gaps: only fill between horizontal gaps (avoid overlap)
        if (gap > 0) {
            for (let col = 0; col < cols - 1; col++) {
                const x0 = perimeterMargin + ((col + 1) * tileSize) + (col * gap);
                const x1 = x0 + gap;
                
                // Generate separate boxes for each tile row to avoid overlapping horizontal gaps
                for (let row = 0; row < rows; row++) {
                    const y0 = perimeterMargin + (row * (tileSize + gap));
                    const y1 = y0 + tileSize;  // Only tile height, not including gap
                    
                    facets += generateBox(x0, y0, z0, x1, y1, z1);
                }
            }
        }
    }
    
    return facets;
}

