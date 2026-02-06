/**
 * Script Type Definitions for Generative Art System
 * 
 * TypeScript-style JSDoc interfaces for script configuration.
 * These definitions ensure consistency across all generator scripts.
 * 
 * @version 1.0.0
 */

/**
 * Canvas configuration
 * @typedef {Object} CanvasConfig
 * @property {number} width - Canvas width in pixels
 * @property {number} height - Canvas height in pixels
 * @property {'2d'|'webgl'|'p5'} context - Rendering context type
 * @property {string} [background] - Optional background color (CSS or VGA)
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
 * @property {string[]} [animatableParams] - Parameter keys that can be animated
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
 * @property {string} category - Category for grouping ('parametric'|'wave'|'pattern'|'other')
 * @property {string} [description] - Optional description for INFO tab
 * @property {string} [version] - Script version
 * @property {CanvasConfig} canvas - Canvas configuration
 * @property {ParameterGroup[]} parameters - UI parameter definitions
 * @property {Preset[]} [presets] - Optional preset configurations
 * @property {AnimationConfig} [animation] - Optional animation configuration
 * @property {ExportConfig} [export] - Export capabilities (defaults to PNG only)
 * @property {DrawFunction} [draw] - Main draw function (required for 2d/webgl)
 * @property {SetupFunction} [setup] - Optional one-time setup (2d/webgl)
 * @property {RenderFrameFunction} [renderFrame] - Optional frame renderer for export
 * @property {P5SetupFunction} [p5Setup] - p5 setup function (required for p5 context)
 * @property {P5DrawFunction} [p5Draw] - p5 draw function (required for p5 context)
 */

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
    'other': {
        name: 'Other',
        description: 'Miscellaneous generators'
    }
};

console.log('✅ Script types loaded');

