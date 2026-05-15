/**
 * Script Registry - Lazy-loading registry for generative art scripts
 * 
 * Responsibilities:
 * - Lazy-load script configs on demand
 * - Cache loaded scripts
 * - Provide category metadata for gallery
 * - List available scripts
 * 
 * @version 1.0.0
 */

import { validateScriptConfig, SCRIPT_CATEGORIES } from './script-types.js';

/**
 * Script registry with lazy imports.
 * Format: { scriptId: { fn: () => import('path'), hidden?: true } }
 *
 * hidden: true — script file is preserved but excluded from the active generator
 * list. The script is still loadable via direct URL (?script=<id>); use listAll()
 * to enumerate including hidden scripts (e.g. for admin/debug).
 *
 * NOTE: Dynamic imports must use static string paths (no template literals)
 * for bundler compatibility. Cache busting handled by closing browser tabs.
 */
const SCRIPT_IMPORTS = {
    // Parametric
    'lissajous':           { fn: () => import('../scripts/parametric/lissajous.gen.js') },
    'harmonics':           { fn: () => import('../scripts/parametric/harmonics.gen.js') },
    'torus':               { fn: () => import('../scripts/parametric/torus.gen.js') },

    // Wave
    'wave-interference':   { fn: () => import('../scripts/wave/wave-interference.gen.js') },
    'cymatics':            { fn: () => import('../scripts/wave/cymatics.gen.js') },
    'moire':               { fn: () => import('../scripts/wave/moire.gen.js') },

    // Pattern
    'generative-pattern':  { fn: () => import('../scripts/pattern/generative-pattern.gen.js'), hidden: true },
    'tile-mosaic':         { fn: () => import('../scripts/pattern/tile-mosaic.gen.js') },
    'golden-grid':         { fn: () => import('../scripts/pattern/golden-grid.gen.js') },
    'order-disorder':      { fn: () => import('../scripts/pattern/order-disorder.gen.js') },
    'animated-lines':      { fn: () => import('../scripts/pattern/animated-lines.gen.js') },
    'shape-array':         { fn: () => import('../scripts/pattern/shape-array.gen.js') },

    // WIN-03/WIN-06: merged into wave-interference.gen.js. Aliases kept for direct-URL compat.
    'p5-wave-interference': { fn: () => import('../scripts/wave/wave-interference.gen.js'), hidden: true },
    'p5-wave-colour':       { fn: () => import('../scripts/wave/wave-interference.gen.js'), hidden: true },

    // Physics (p5)
    'fibonacci-balls':     { fn: () => import('../scripts/physics/fibonacci-balls.gen.js') },

    // Other
    'circles':             { fn: () => import('../scripts/other/circles.gen.js') },
    'squares':             { fn: () => import('../scripts/other/squares.gen.js') },
    'solar-system':        { fn: () => import('../scripts/other/solar-system.gen.js') },
    'interference-figure': { fn: () => import('../scripts/other/interference-figure.gen.js') },
    'wave-equation-synth': { fn: () => import('../scripts/other/wave-equation-synth.gen.js') },
    'unified-pattern':     { fn: () => import('../scripts/other/unified-pattern.gen.js'), hidden: true },
    'defecated':           { fn: () => import('../scripts/other/defecated.gen.js') },
    'clockwise':           { fn: () => import('../scripts/other/clockwise.gen.js') },
    'curtain-morph':       { fn: () => import('../scripts/other/curtain-morph.gen.js') },
    'quine':               { fn: () => import('../scripts/other/quine.gen.js') },
};

/**
 * Cache for loaded script configs
 */
const scriptCache = new Map();

/**
 * Script Registry API
 */
export const ScriptRegistry = {
    /**
     * Load a script configuration
     * @param {string} scriptId - Script identifier
     * @returns {Promise<ScriptConfig>} Script configuration
     */
    async load(scriptId) {
        // Check cache first
        if (scriptCache.has(scriptId)) {
            window.debugLog('TOOLS', `📦 Script "${scriptId}" loaded from cache`);
            return scriptCache.get(scriptId);
        }
        
        // Check if script exists (include hidden — direct URL access is allowed)
        const entry = SCRIPT_IMPORTS[scriptId];
        if (!entry) {
            throw new Error(`Unknown script: ${scriptId}. Available scripts: ${this.list().join(', ')}`);
        }
        
        window.debugLog('TOOLS', `🔄 Loading script: ${scriptId}`);
        
        try {
            // Import the module
            const module = await entry.fn();
            
            // Extract SCRIPT_CONFIG
            const config = module.SCRIPT_CONFIG || module.default;
            if (!config) {
                throw new Error(`Script "${scriptId}" does not export SCRIPT_CONFIG`);
            }
            
            // Validate configuration
            validateScriptConfig(config);
            
            // Cache the config
            scriptCache.set(scriptId, config);
            
            window.debugLog('TOOLS', `✅ Script "${scriptId}" loaded and validated`);
            return config;
            
        } catch (error) {
            console.error(`❌ Failed to load script "${scriptId}":`, error);
            throw error;
        }
    },
    
    /**
     * Get list of active (non-hidden) script IDs.
     * Use this to populate the generator selector.
     * @returns {string[]}
     */
    list() {
        return Object.entries(SCRIPT_IMPORTS)
            .filter(([, entry]) => !entry.hidden)
            .map(([id]) => id);
    },

    /**
     * Get list of ALL script IDs including hidden ones.
     * Use for admin/debug enumeration or direct-URL resolution.
     * @returns {string[]}
     */
    listAll() {
        return Object.keys(SCRIPT_IMPORTS);
    },
    
    /**
     * Get active (non-hidden) scripts grouped by category.
     * @returns {Object<string, string[]>} category → script IDs
     */
    getByCategory() {
        const all = {
            'parametric': ['lissajous', 'harmonics', 'torus'],
            'wave': [
                'wave-interference', 'cymatics', 'moire'
            ],
            'pattern': [
                'generative-pattern', 'tile-mosaic', 'golden-grid',
                'order-disorder', 'animated-lines', 'shape-array'
            ],
            'physics': ['fibonacci-balls'],
            'other': [
                'circles', 'squares', 'solar-system',
                'interference-figure', 'wave-equation-synth',
                'unified-pattern', 'defecated',
                'clockwise', 'curtain-morph', 'quine'
            ]
        };
        // Strip hidden scripts from each category
        const filtered = {};
        for (const [cat, ids] of Object.entries(all)) {
            const visible = ids.filter(id => !SCRIPT_IMPORTS[id]?.hidden);
            if (visible.length > 0) filtered[cat] = visible;
        }
        return filtered;
    },
    
    /**
     * Get category metadata
     * @returns {Object} Category definitions
     */
    getCategories() {
        return SCRIPT_CATEGORIES;
    },
    
    /**
     * Check if a script exists (including hidden).
     * @param {string} scriptId
     * @returns {boolean}
     */
    has(scriptId) {
        return scriptId in SCRIPT_IMPORTS;
    },

    /**
     * Check if a script is hidden.
     * @param {string} scriptId
     * @returns {boolean}
     */
    isHidden(scriptId) {
        return !!SCRIPT_IMPORTS[scriptId]?.hidden;
    },
    
    /**
     * Preload multiple scripts (for gallery)
     * @param {string[]} scriptIds - Array of script IDs to preload
     * @returns {Promise<void>}
     */
    async preload(scriptIds) {
        window.debugLog('TOOLS', `🔄 Preloading ${scriptIds.length} scripts...`);
        const promises = scriptIds.map(id => this.load(id).catch(err => {
            console.warn(`Failed to preload script "${id}":`, err);
        }));
        await Promise.all(promises);
        window.debugLog('TOOLS', `✅ Preloaded ${scriptIds.length} scripts`);
    },
    
    /**
     * Clear cache (for development/debugging)
     */
    clearCache() {
        scriptCache.clear();
        window.debugLog('TOOLS', '🗑️ Script cache cleared');
    },
    
    /**
     * Get metadata for a script without loading it
     * @param {string} scriptId - Script identifier
     * @returns {Object} Basic metadata
     */
    getMetadata(scriptId) {
        // Derive category from registry structure
        const byCategory = this.getByCategory();
        let category = 'other';
        for (const [cat, ids] of Object.entries(byCategory)) {
            if (ids.includes(scriptId)) {
                category = cat;
                break;
            }
        }
        
        return {
            id: scriptId,
            category,
            title: this._deriveTitle(scriptId),
            path: SCRIPT_IMPORTS[scriptId] ? true : false
        };
    },
    
    /**
     * Derive display title from script ID
     * @private
     */
    _deriveTitle(scriptId) {
        return scriptId
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
};

/**
 * Export as default for convenience
 */
export default ScriptRegistry;
