/**
 * @fileoverview Combinatorics — Sequence Generation for Multifilament Printing
 * 
 * Generates valid layer sequences for multi-color 3D printing where each tile
 * can have multiple layers of different colored filaments stacked on top of each other.
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/grid/sequences.js
 * @formula Count = N × (N^M - 1) / (N - 1) where N=colors, M=layers
 */

/**
 * Generate all valid layer sequences for multifilament printing
 * 
 * IMPROVED ALGORITHM: Builds stacks by height (1 to M layers), then pads with zeros.
 * This guarantees no duplicates and no gaps.
 * 
 * A valid sequence must:
 * 1. Not be all zeros (at least one filament layer)
 * 2. Have no gaps (once a zero appears, only zeros can follow)
 * 
 * Examples:
 * - Valid: [1, 2, 0, 0] (red, then blue, then empty)
 * - Valid: [1, 1, 1, 1] (all red)
 * - Invalid: [1, 0, 2, 0] (gap: filament 2 appears after empty layer)
 * - Invalid: [0, 0, 0, 0] (all empty)
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/grid/sequences.js:24-74
 * @formula Sequence count = N × (N^M - 1) / (N - 1)
 * @param {number} N - Number of colors/filaments (1-indexed, 0 = empty)
 * @param {number} M - Number of layers per tile
 * @returns {number[][]} Array of valid sequences, each sequence is array of length M
 * 
 * @example
 * const sequences = generateSequences(4, 4);  // 4 colors, 4 layers
 * // Returns 340 valid sequences like: [1,2,0,0], [1,1,1,1], [2,3,4,0], etc.
 */
export function generateSequences(N, M) {
    const seqs = [];

    /**
     * Generate all combinations of N colors at height H
     * @param {number} H - Stack height (1 to M)
     * @returns {number[][]} All combinations of length H using colors 1..N
     */
    function generateStacksOfHeight(H) {
        const stacks = [];
        
        function recurse(current, depth) {
            if (depth === H) {
                stacks.push([...current]);
                return;
            }
            
            // Try each color (1 to N, no 0 allowed in active layers)
            for (let color = 1; color <= N; color++) {
                recurse([...current, color], depth + 1);
            }
        }
        
        recurse([], 0);
        return stacks;
    }

    // Generate stacks for each height from 1 to M
    for (let height = 1; height <= M; height++) {
        const stacks = generateStacksOfHeight(height);
        
        // Pad each stack to length M with zeros
        for (let stack of stacks) {
            const padded = [...stack];
            while (padded.length < M) {
                padded.push(0);
            }
            seqs.push(padded);
        }
    }

    return seqs;
}

/**
 * Build sequence map (RGB color → sequence data lookup)
 * 
 * This map is CRITICAL for the entire workflow. It allows us to look up
 * the layer sequence for any color in the final quantized image, enabling
 * the expansion from 2D pixels to 3D layer-by-layer printing instructions.
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/grid/sequences.js:86-107
 * @param {number[][]} sequences - Array of sequences from generateSequences()
 * @param {Array<{h: string, n: string}>} colours - Array of color objects (h=hex, n=name)
 * @param {number} cols - Grid columns (for position calculation)
 * @param {Object} colorFns - Color utility functions {simColour, rgb_to_key}
 * @returns {Map<string, Object>} Map from "r,g,b" key to sequence data
 * 
 * @example
 * import { simColour, rgb_to_key } from '../color/color-utils.js';
 * 
 * const sequences = generateSequences(4, 4);
 * const colours = [
 *   { h: '#FF0000', n: 'Red PLA' },
 *   { h: '#0000FF', n: 'Blue PLA' },
 *   { h: '#FFFF00', n: 'Yellow PLA' },
 *   { h: '#00FF00', n: 'Green PLA' }
 * ];
 * const map = buildSequenceMap(sequences, colours, 19, { simColour, rgb_to_key });
 * 
 * // Later, look up a color:
 * const rgb = {r: 128, g: 0, b: 128};  // Some purple color
 * const key = rgb_to_key(rgb);
 * const seqData = map.get(key);
 * // seqData.sequence = [1, 2, 0, 0]  (red + blue layers)
 * // seqData.grid_position = {row: 5, col: 3, index: 98}
 */
export function buildSequenceMap(sequences, colours, cols, { simColour, rgb_to_key }) {
    const map = new Map();

    sequences.forEach((seq, idx) => {
        // Calculate what color this sequence produces
        const colour = simColour(seq, colours);
        const key = rgb_to_key(colour);

        // Store sequence with metadata
        map.set(key, {
            sequence: seq,
            colours: colours,
            grid_position: {
                row: Math.floor(idx / cols),
                col: idx % cols,
                index: idx
            }
        });
    });

    return map;
}

/**
 * Calculate theoretical number of sequences (for verification)
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/grid/sequences.js:117-120
 * @formula N × (N^M - 1) / (N - 1)
 * @param {number} N - Number of colours
 * @param {number} M - Number of layers
 * @returns {number} Expected sequence count
 * 
 * @example
 * calculateSequenceCount(4, 4);  // Returns 340
 * calculateSequenceCount(3, 3);  // Returns 39
 */
export function calculateSequenceCount(N, M) {
    if (N === 1) return M; // Special case
    return N * (Math.pow(N, M) - 1) / (N - 1);
}

/**
 * Sort sequences by different criteria
 * 
 * @param {number[][]} sequences - Array of sequences to sort
 * @param {string} method - Sort method: 'layercount', 'basecolor', 'topcolor', 'complexity', 'lexicographic'
 * @returns {number[][]} Sorted sequences
 */
export function sortSequences(sequences, method) {
    const copy = [...sequences];
    
    switch (method) {
        case 'layercount':
            // Sort by number of non-zero layers, then lexicographic
            return copy.sort((a, b) => {
                const countA = a.filter(v => v !== 0).length;
                const countB = b.filter(v => v !== 0).length;
                if (countA !== countB) return countA - countB;
                // Secondary: lexicographic
                for (let i = 0; i < a.length; i++) {
                    if (a[i] !== b[i]) return a[i] - b[i];
                }
                return 0;
            });
        
        case 'basecolor':
            // Sort by first (bottom) color, then lexicographic
            return copy.sort((a, b) => {
                if (a[0] !== b[0]) return a[0] - b[0];
                // Secondary: lexicographic
                for (let i = 1; i < a.length; i++) {
                    if (a[i] !== b[i]) return a[i] - b[i];
                }
                return 0;
            });
        
        case 'topcolor':
            // Sort by top (last non-zero) color, then lexicographic
            return copy.sort((a, b) => {
                const topA = a.find(v => v !== 0) || 0;
                const topB = b.find(v => v !== 0) || 0;
                // Find actual top (last non-zero)
                let lastA = 0, lastB = 0;
                for (let v of a) if (v !== 0) lastA = v;
                for (let v of b) if (v !== 0) lastB = v;
                
                if (lastA !== lastB) return lastA - lastB;
                // Secondary: lexicographic
                for (let i = 0; i < a.length; i++) {
                    if (a[i] !== b[i]) return a[i] - b[i];
                }
                return 0;
            });
        
        case 'complexity':
            // Sort by number of color changes
            return copy.sort((a, b) => {
                let changesA = 0, changesB = 0;
                for (let i = 1; i < a.length; i++) {
                    if (a[i] !== 0 && a[i] !== a[i-1]) changesA++;
                }
                for (let i = 1; i < b.length; i++) {
                    if (b[i] !== 0 && b[i] !== b[i-1]) changesB++;
                }
                if (changesA !== changesB) return changesA - changesB;
                // Secondary: lexicographic
                for (let i = 0; i < a.length; i++) {
                    if (a[i] !== b[i]) return a[i] - b[i];
                }
                return 0;
            });
        
        case 'lexicographic':
        default:
            // Dictionary order
            return copy.sort((a, b) => {
                for (let i = 0; i < a.length; i++) {
                    if (a[i] !== b[i]) return a[i] - b[i];
                }
                return 0;
            });
    }
}

/**
 * Get all available sort methods
 * @returns {Array<{id: string, name: string, description: string}>}
 */
export function getSortMethods() {
    return [
        {
            id: 'layercount',
            name: 'By Layer Count',
            description: 'Groups by number of layers (1L, 2L, 3L, 4L...)'
        },
        {
            id: 'basecolor',
            name: 'By Base Color',
            description: 'Groups by bottom layer color'
        },
        {
            id: 'topcolor',
            name: 'By Top Color',
            description: 'Groups by visible (top) color'
        },
        {
            id: 'complexity',
            name: 'By Complexity',
            description: 'Groups by number of color changes'
        },
        {
            id: 'lexicographic',
            name: 'Lexicographic',
            description: 'Dictionary order (predictable)'
        }
    ];
}

