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
 * Script registry with lazy imports
 * Format: { scriptId: () => import('path/to/script.gen.js') }
 * 
 * NOTE: Dynamic imports must use static string paths (no template literals)
 * for bundler compatibility. Cache busting handled by closing browser tabs.
 */
const SCRIPT_IMPORTS = {
    // Parametric
    'lissajous': () => import('../scripts/parametric/lissajous.gen.js'),
    'harmonics': () => import('../scripts/parametric/harmonics.gen.js'),
    'torus': () => import('../scripts/parametric/torus.gen.js'),
    
    // Wave
    'wave-interference': () => import('../scripts/wave/wave-interference.gen.js'),
    'cymatics': () => import('../scripts/wave/cymatics.gen.js'),
    'moire': () => import('../scripts/wave/moire.gen.js'),
    
    // Pattern
    'generative-pattern': () => import('../scripts/pattern/generative-pattern.gen.js'),
    'tile-mosaic': () => import('../scripts/pattern/tile-mosaic.gen.js'),
    'golden-grid': () => import('../scripts/pattern/golden-grid.gen.js'),
    'order-disorder': () => import('../scripts/pattern/order-disorder.gen.js'),
    'animated-lines': () => import('../scripts/pattern/animated-lines.gen.js'),
    'shape-array': () => import('../scripts/pattern/shape-array.gen.js'),

    // Wave (p5)
    'p5-wave-interference': () => import('../scripts/wave/p5-wave-interference.gen.js'),
    'p5-wave-colour': () => import('../scripts/wave/p5-wave-colour.gen.js'),

    // Physics (p5)
    'fibonacci-balls': () => import('../scripts/physics/fibonacci-balls.gen.js'),

    // Other
    'circles': () => import('../scripts/other/circles.gen.js'),
    'squares': () => import('../scripts/other/squares.gen.js'),
    'solar-system': () => import('../scripts/other/solar-system.gen.js'),
    'interference-figure': () => import('../scripts/other/interference-figure.gen.js'),
    'wave-equation-synth': () => import('../scripts/other/wave-equation-synth.gen.js'),
    'unified-pattern': () => import('../scripts/other/unified-pattern.gen.js'),
    'defecated': () => import('../scripts/other/defecated.gen.js'),
    'clockwise': () => import('../scripts/other/clockwise.gen.js'),
    'curtain-morph': () => import('../scripts/other/curtain-morph.gen.js'),
    'quine': () => import('../scripts/other/quine.gen.js'),
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
        
        // Check if script exists
        const importFn = SCRIPT_IMPORTS[scriptId];
        if (!importFn) {
            throw new Error(`Unknown script: ${scriptId}. Available scripts: ${this.list().join(', ')}`);
        }
        
        window.debugLog('TOOLS', `🔄 Loading script: ${scriptId}`);
        
        try {
            // Import the module
            const module = await importFn();
            
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
     * Get list of all available script IDs
     * @returns {string[]} Array of script IDs
     */
    list() {
        return Object.keys(SCRIPT_IMPORTS);
    },
    
    /**
     * Get scripts grouped by category
     * @returns {Object<string, string[]>} Category -> script IDs
     */
    getByCategory() {
        return {
            'parametric': ['lissajous', 'harmonics', 'torus'],
            'wave': [
                'wave-interference', 'cymatics', 'moire',
                'p5-wave-interference', 'p5-wave-colour'
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
    },
    
    /**
     * Get category metadata
     * @returns {Object} Category definitions
     */
    getCategories() {
        return SCRIPT_CATEGORIES;
    },
    
    /**
     * Check if a script exists
     * @param {string} scriptId - Script identifier
     * @returns {boolean} True if script exists
     */
    has(scriptId) {
        return scriptId in SCRIPT_IMPORTS;
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
