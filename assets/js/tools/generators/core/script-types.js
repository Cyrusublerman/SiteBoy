/**
 * Script Type Definitions for Generative Art System
 * 
 * TypeScript-style JSDoc interfaces for script configuration.
 * These definitions ensure consistency across all generator scripts.
 * 
 * @version 1.0.0
 */

/**
 * A single paintable layer in the generator's colourway.
 * @typedef {Object} ColourwayLayer
 * @property {string} id       - Unique layer identifier (camelCase, e.g. 'background', 'outerLines')
 * @property {string} label    - Human-readable label shown in OUTPUT tab
 * @property {string} colour   - Current colour value (hex, e.g. '#000000')
 * @property {'stroke'|'fill'} kind - Determines which OUTPUT controls render. Required.
 * @property {number} [alpha]     - Opacity 0–1 (default 1)
 * @property {number} [lineWidth] - Stroke width in px (stroke layers only, default 1)
 * @property {string} [lineCap]   - 'butt'|'round'|'square' (stroke layers only)
 * @property {string} [lineJoin]  - 'miter'|'round'|'bevel' (stroke layers only)
 */

/**
 * Per-stage config for a modulator.
 * @typedef {Object} ModulatorShapeConfig
 * @property {string}  [easing]   - 'linear'|'ease-in'|'ease-out'|'ease-in-out' (default 'linear')
 * @property {number}  [quantise] - Snap step size (0 = off); use for integer params
 * @property {number}  [smooth]   - Slew / lag filter rate (0 = off)
 * @property {boolean} [invert]   - Flip signal (default false)
 */

/**
 * @typedef {Object} ModulatorRangeConfig
 * @property {number}      [depth]   - Swing fraction 0–1 (default 1)
 * @property {number}      [bias]    - Offset from base value (default 0)
 * @property {number|null} [min]     - Hard minimum (null = inherit param def)
 * @property {number|null} [max]     - Hard maximum (null = inherit param def)
 * @property {boolean}     [bipolar] - Swing around base (true) or above base (false)
 */

/**
 * @typedef {Object} ModulatorSyncConfig
 * @property {'free'|'loop'|'timeline'|'trigger'} [clock] - Clock source (default 'free')
 * @property {number}      [rateMul]  - Rate multiplier (default 1)
 * @property {string|null} [trigger]  - Trigger param key or event name
 */

/**
 * Descriptor for a single modulator instance.
 * @typedef {Object} ModulatorDescriptor
 * @property {string}  targetKey - Param key or 'colourway__<id>' being modulated
 * @property {boolean} [enabled] - Whether active at load (default false — user opts in)
 * @property {{ type: string, config: Object }} driver - Driver type + config; see driver-registry.js
 * @property {ModulatorShapeConfig}  [shape]   - Shape stage
 * @property {ModulatorRangeConfig}  [range]   - Range stage
 * @property {'add'|'multiply'|'replace'|'drift'|'max'|'min'} [combine] - Combine mode (default 'add')
 * @property {ModulatorSyncConfig}   [sync]    - Sync/clock config
 */

/**
 * Optional post-processing effects (OUTPUT tab, opt-in per script).
 * @typedef {Object} PostEffect
 * @property {'grain'|'vignette'|'posterise'|'invert'} type
 * @property {number}  [strength] - Effect intensity 0–1
 * @property {boolean} [enabled]  - Active by default (default false)
 */

/**
 * Output config (post-effects; OUTPUT tab opt-in block).
 * @typedef {Object} OutputConfig
 * @property {PostEffect[]} [post] - Post-processing effects to expose in OUTPUT tab
 */

/**
 * Canvas configuration
 * @typedef {Object} CanvasConfig
 * @property {number} width    - Canvas width in pixels
 * @property {number} height   - Canvas height in pixels
 * @property {'2d'|'webgl'|'p5'} context - Rendering context type
 * @property {ColourwayLayer[]} [colourway] - Ordered array of paintable layers.
 *   Index 0 is conventionally the background layer (id: 'background').
 *   The HOST renders one ColorInput per entry and routes updates via
 *   _handleCanvasColourway(). Read in draw() as colourway[i].colour.
 * @property {string} [background] - Legacy single-colour background (CSS or VGA hex).
 *   Deprecated in favour of colourway[]. Kept for backward compat — scripts that
 *   have not migrated to colourway[] still work.
 */

/**
 * Parameter definition for UI generation
 * @typedef {Object} ParameterDef
 * @property {string} key - Unique parameter identifier (camelCase)
 * @property {'slider'|'toggle'|'dropdown'|'radio'} type - Control type
 * @property {string} label - Display label
 * @property {number} [min] - Minimum value (for slider)
 * @property {number} [max] - Maximum value (for slider)
 * @property {number} [step] - Step increment (for slider)
 * @property {*} default - Default value
 * @property {number} [precision] - Decimal precision for display
 * @property {string[]} [options] - Options array (for dropdown/radio/toggle)
 */

/**
 * Parameter group (collapsible block in sidebar)
 * @typedef {Object} ParameterGroup
 * @property {string} group - Group title
 * @property {ParameterDef[]} params - Parameters in this group
 * @property {boolean} [defaultCollapsed] - Start collapsed
 */

/**
 * Preset configuration (named parameter set)
 * @typedef {Object} Preset
 * @property {string} name - Preset display name
 * @property {Object} [key] - Parameter key-value pairs (any param keys from parameters)
 */

/**
 * Animation configuration
 * @typedef {Object} AnimationConfig
 * @property {'parametric'|'infinite'|'sequence'} [type] - Animation type
 * @property {number} [loopFrames] - Frames per loop (0 = infinite)
 * @property {ModulatorDescriptor[]} [modulators] - Modulator descriptors (preferred format)
 * @property {string[]|Array<{key:string,mode?:string,rate?:number}>} [animatableParams]
 *   Legacy format — accepted, migrated to modulators[] by _migrateScriptConfig() shim.
 *   Do not use in new scripts.
 * @property {number} [defaultSpeed] - Default animation speed multiplier
 * @property {number} [defaultFps] - Default frames per second
 */

/**
 * Export capabilities
 * @typedef {Object} ExportConfig
 * @property {boolean} [png] - Support PNG export (default: true)
 * @property {boolean} [svg] - Support SVG export (default: false)
 * @property {boolean} [gif] - Support GIF export (default: false)
 * @property {boolean} [webm] - Support WebM video export (default: false)
 * @property {boolean} [sequence] - Support frame sequence export (default: false)
 */

/**
 * Draw function signature
 * @callback DrawFunction
 * @param {CanvasRenderingContext2D|WebGLRenderingContext} ctx - Canvas context
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Object} params - Current parameter values
 * @param {number} frame - Current frame number
 * @returns {void}
 */

/**
 * Optional setup function (called once on initialization)
 * @callback SetupFunction
 * @param {CanvasRenderingContext2D|WebGLRenderingContext} ctx - Canvas context
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Object} params - Initial parameter values
 * @returns {void}
 */

/**
 * Optional frame render function for animation export
 * @callback RenderFrameFunction
 * @param {CanvasRenderingContext2D|WebGLRenderingContext} ctx - Canvas context
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Object} params - Parameter values for this frame
 * @param {number} frameIndex - Frame index (0-based)
 * @param {number} totalFrames - Total frames to render
 * @returns {void}
 */

/**
 * p5.js setup function (called once on init, context: 'p5' only)
 * @callback P5SetupFunction
 * @param {Object} p - p5 instance
 * @param {Object} params - Initial parameter values
 * @returns {void}
 */

/**
 * p5.js draw function (called per frame, context: 'p5' only)
 * @callback P5DrawFunction
 * @param {Object} p - p5 instance
 * @param {Object} params - Current parameter values
 * @param {number} frame - Current frame number
 * @returns {void}
 */

/**
 * Complete script configuration
 * @typedef {Object} ScriptConfig
 * @property {string} id - Unique identifier (kebab-case)
 * @property {string} title - Display title (UPPERCASE)
 * @property {string} category - Category for grouping ('parametric'|'wave'|'pattern'|'physics'|'other')
 * @property {string} [description] - Optional description for INFO tab
 * @property {string} [version] - Script version
 * @property {CanvasConfig} canvas - Canvas configuration
 * @property {ParameterGroup[]} parameters - UI parameter definitions
 * @property {Preset[]} [presets] - Optional preset configurations
 * @property {AnimationConfig} [animation] - Optional animation configuration
 * @property {OutputConfig} [output] - Output tab configuration (post-effects)
 * @property {ExportConfig} [export] - Export capabilities (defaults to PNG only)
 * @property {DrawFunction} [draw] - Main draw function (required for 2d/webgl)
 * @property {SetupFunction} [setup] - Optional one-time setup (2d/webgl)
 * @property {RenderFrameFunction} [renderFrame] - Optional frame renderer for export
 * @property {P5SetupFunction} [p5Setup] - p5 setup function (required for p5 context)
 * @property {P5DrawFunction} [p5Draw] - p5 draw function (required for p5 context)
 */

/**
 * Migrate legacy script config fields to the current schema.
 * Must be called BEFORE validateScriptConfig — validation always sees the new format.
 *
 * Migrations performed:
 *   animatableParams: ['x']             → animation.modulators: [{ targetKey: 'x', driver: { type: 'lfo', ... } }]
 *   animatableParams: [{ key, mode, rate }] → animation.modulators: [{ ... }]
 *
 * @param {Object} config - Raw script config (mutated in-place and returned)
 * @returns {Object} The same config object, normalised
 */
export function _migrateScriptConfig(config) {
    if (!config.animation) return config;

    const anim = config.animation;

    // Migrate animatableParams → modulators[]
    if (anim.animatableParams && anim.animatableParams.length > 0) {
        const existing = new Set((anim.modulators || []).map(m => m.targetKey));
        const migrated = [];

        for (const entry of anim.animatableParams) {
            const key  = typeof entry === 'string' ? entry : entry.key;
            const rate = typeof entry === 'object' && entry.rate != null ? entry.rate : 1;

            if (existing.has(key)) continue; // already declared as modulator

            migrated.push({
                targetKey: key,
                enabled:   false,
                driver:    { type: 'lfo', config: { waveform: 'sine', rate } },
                shape:     { easing: 'linear', invert: false },
                range:     { depth: 1, bias: 0, bipolar: true },
                combine:   'add',
                sync:      { clock: 'free', rateMul: 1 }
            });
        }

        anim.modulators = [...(anim.modulators || []), ...migrated];
        // Keep animatableParams so existing code that reads it directly still works
        // during the transition period; it is no longer authoritative.
    }

    return config;
}

/**
 * Validate script configuration
 * @param {ScriptConfig} config - Script configuration to validate
 * @throws {Error} If configuration is invalid
 * @returns {boolean} True if valid
 */
export function validateScriptConfig(config) {
    // Required fields
    if (!config.id || typeof config.id !== 'string') {
        throw new Error('Script config missing required field: id (string)');
    }
    if (!config.title || typeof config.title !== 'string') {
        throw new Error('Script config missing required field: title (string)');
    }
    if (!config.category || typeof config.category !== 'string') {
        throw new Error('Script config missing required field: category (string)');
    }
    if (!config.canvas || typeof config.canvas !== 'object') {
        throw new Error('Script config missing required field: canvas (object)');
    }
    if (!config.parameters || !Array.isArray(config.parameters)) {
        throw new Error('Script config missing required field: parameters (array)');
    }
    
    // Canvas validation (before draw validation - context determines required functions)
    if (typeof config.canvas.width !== 'number' || config.canvas.width <= 0) {
        throw new Error('Canvas width must be a positive number');
    }
    if (typeof config.canvas.height !== 'number' || config.canvas.height <= 0) {
        throw new Error('Canvas height must be a positive number');
    }
    const validContexts = ['2d', 'webgl', 'p5'];
    if (!validContexts.includes(config.canvas.context)) {
        throw new Error(`Canvas context must be one of: ${validContexts.join(', ')}`);
    }
    
    // Draw function validation (depends on context)
    if (config.canvas.context === 'p5') {
        // p5 context requires p5Draw function
        if (!config.p5Draw || typeof config.p5Draw !== 'function') {
            throw new Error('p5 context requires p5Draw function');
        }
        // p5Setup is optional but must be function if present
        if (config.p5Setup && typeof config.p5Setup !== 'function') {
            throw new Error('p5Setup must be a function');
        }
    } else {
        // 2d/webgl context requires draw function
        if (!config.draw || typeof config.draw !== 'function') {
            throw new Error('Script config missing required field: draw (function)');
        }
    }
    
    // Parameters validation
    if (config.parameters.length === 0) {
        throw new Error('Script must have at least one parameter group');
    }
    for (const group of config.parameters) {
        if (!group.group || typeof group.group !== 'string') {
            throw new Error('Parameter group missing "group" name');
        }
        if (!Array.isArray(group.params) || group.params.length === 0) {
            throw new Error(`Parameter group "${group.group}" must have at least one parameter`);
        }
        for (const param of group.params) {
            if (!param.key || typeof param.key !== 'string') {
                throw new Error(`Parameter in group "${group.group}" missing "key"`);
            }
            if (!param.type || typeof param.type !== 'string') {
                throw new Error(`Parameter "${param.key}" missing "type"`);
            }
            if (param.default === undefined) {
                throw new Error(`Parameter "${param.key}" missing "default" value`);
            }
        }
    }
    
    // Colourway validation (optional field)
    if (config.canvas.colourway) {
        if (!Array.isArray(config.canvas.colourway)) {
            throw new Error('canvas.colourway must be an array');
        }
        const colourwayIds = new Set();
        for (const layer of config.canvas.colourway) {
            if (!layer.id   || typeof layer.id   !== 'string') throw new Error('ColourwayLayer missing id');
            if (!layer.label|| typeof layer.label !== 'string') throw new Error(`ColourwayLayer "${layer.id}" missing label`);
            if (!layer.colour || typeof layer.colour !== 'string') throw new Error(`ColourwayLayer "${layer.id}" missing colour`);
            if (!layer.kind || !['stroke', 'fill'].includes(layer.kind)) {
                throw new Error(`ColourwayLayer "${layer.id}" kind must be 'stroke' or 'fill' (required)`);
            }
            if (colourwayIds.has(layer.id)) throw new Error(`Duplicate colourway id: "${layer.id}"`);
            colourwayIds.add(layer.id);
        }
    }

    // Modulator validation (optional field, post-migration)
    if (config.animation && config.animation.modulators) {
        if (!Array.isArray(config.animation.modulators)) {
            throw new Error('animation.modulators must be an array');
        }
        for (const mod of config.animation.modulators) {
            if (!mod.targetKey || typeof mod.targetKey !== 'string') {
                throw new Error('ModulatorDescriptor missing targetKey');
            }
            if (!mod.driver || typeof mod.driver.type !== 'string') {
                throw new Error(`Modulator "${mod.targetKey}" missing driver.type`);
            }
        }
    }

    return true;
}

/**
 * Category metadata for gallery organization
 */
export const SCRIPT_CATEGORIES = {
    'parametric': {
        name: 'Parametric',
        description: 'Mathematically defined curves and surfaces'
    },
    'wave': {
        name: 'Wave & Interference',
        description: 'Wave equations and interference patterns'
    },
    'pattern': {
        name: 'Pattern Generation',
        description: 'Algorithmic pattern generators'
    },
    'physics': {
        name: 'Physics',
        description: 'Physical simulations and particle systems'
    },
    'other': {
        name: 'Other',
        description: 'Miscellaneous generators'
    }
};
