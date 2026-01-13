/**
 * @fileoverview STL Generation — 3D geometry export for multifilament printing
 * 
 * Generates ASCII STL files from pixel data for 3D printing. Includes vectorization
 * (rectangle merging) to optimize file size and printing performance.
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
 * @param {number} config.imageWidth - Image width in pixels
 * @param {number} config.imageHeight - Image height in pixels
 * @param {number} config.printWidth - Print width in mm
 * @param {number} config.layerHeight - Layer height in mm
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
    const { imageWidth, imageHeight, printWidth, layerHeight } = config;
    const printHeight = printWidth * (imageHeight / imageWidth);
    const pixelSize = printWidth / imageWidth;

    const stls = {};
    const filamentCount = layerMaps[0].length;

    // Generate one STL per filament (all layers combined)
    for (let fi = 0; fi < filamentCount; fi++) {
        let filamentFacets = '';
        let totalRects = 0;

        // Combine all layers for this filament
        for (let li = 0; li < layerMaps.length; li++) {
            const pixels = layerMaps[li][fi];
            if (pixels.size === 0) continue;

            // Vectorize pixels to rectangles
            const rectangles = vectorizePixels(pixels, imageWidth, imageHeight);
            totalRects += rectangles.length;

            // Generate geometry for this layer
            const z0 = li * layerHeight;
            const z1 = z0 + layerHeight;

            for (let rect of rectangles) {
                const x0 = rect.x * pixelSize;
                const y0 = rect.y * pixelSize;
                const x1 = (rect.x + rect.w) * pixelSize;
                const y1 = (rect.y + rect.h) * pixelSize;

                filamentFacets += generateBox(x0, y0, z0, x1, y1, z1);
            }
        }

        // Only create STL if this filament has geometry
        if (filamentFacets.length > 0) {
            const fileName = `artwork_${filamentNames[fi].replace(/[^a-zA-Z0-9]/g, '_')}.stl`;
            stls[fileName] = wrapSTL(filamentFacets, `Artwork_${filamentNames[fi]}`);
        }
    }

    return stls;
}

