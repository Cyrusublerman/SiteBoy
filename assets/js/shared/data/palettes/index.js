/**
 * Palette System — Central Export
 * 
 * All colour palettes for the SiteBoy quantization system.
 * 
 * Usage:
 *   import { getAllPalettes, getPaletteByCategory } from './palettes/index.js';
 */

import TECHNICAL_PALETTES from './technical.js';
import RETRO_PALETTES from './retro.js';
import ARTISTIC_PALETTES from './artistic.js';
import * as Generators from './generators.js';
import * as Utils from './utils.js';

/**
 * Get all palettes as a flat object
 * @returns {Object} All palettes keyed by ID
 */
export function getAllPalettes() {
    return {
        ...TECHNICAL_PALETTES,
        ...RETRO_PALETTES,
        ...ARTISTIC_PALETTES
    };
}

/**
 * Get palettes by category
 * @param {string} category - 'technical', 'retro', or 'artistic'
 * @returns {Object} Palettes in that category
 */
export function getPaletteByCategory(category) {
    switch (category) {
        case 'technical':
            return TECHNICAL_PALETTES;
        case 'retro':
            return RETRO_PALETTES;
        case 'artistic':
            return ARTISTIC_PALETTES;
        default:
            return {};
    }
}

/**
 * Get palette colour array by ID
 * @param {string} id - Palette ID
 * @returns {string[]|null} Array of hex colours, or null if not found
 */
export function getPaletteColours(id) {
    const allPalettes = getAllPalettes();
    return allPalettes[id]?.colours || null;
}

/**
 * Get list of palette names for dropdown
 * @param {boolean} categorized - If true, includes category separators
 * @returns {string[]} Array of palette names/separators
 */
export function getPaletteDropdownList(categorized = true) {
    if (!categorized) {
        return Object.keys(getAllPalettes());
    }
    
    return [
        '─── TECHNICAL ───',
        ...Object.keys(TECHNICAL_PALETTES),
        '─── RETRO ───',
        ...Object.keys(RETRO_PALETTES),
        '─── ARTISTIC ───',
        ...Object.keys(ARTISTIC_PALETTES)
    ];
}

/**
 * Check if a value is a category separator
 * @param {string} value - Dropdown value
 * @returns {boolean} True if separator
 */
export function isSeparator(value) {
    return value.startsWith('───');
}

// Named exports for direct access
export { TECHNICAL_PALETTES, RETRO_PALETTES, ARTISTIC_PALETTES };
export { Generators, Utils };

// Default export
export default {
    getAllPalettes,
    getPaletteByCategory,
    getPaletteColours,
    getPaletteDropdownList,
    isSeparator,
    TECHNICAL_PALETTES,
    RETRO_PALETTES,
    ARTISTIC_PALETTES,
    Generators,
    Utils
};

