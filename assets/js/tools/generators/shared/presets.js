/**
 * Preset Utilities - Preset management for generative scripts
 * 
 * Handles preset application, parameter randomization, and serialization.
 * 
 * @version 1.0.0
 */

/**
 * Apply preset to parameter values
 * Merges preset values into params object without mutating original
 * 
 * @param {Object} params - Current parameter values
 * @param {Preset} preset - Preset configuration
 * @param {ParameterGroup[]} paramDefs - Parameter definitions for validation
 * @returns {Object} New params object with preset applied
 * 
 * @example
 * const params = { Ax1: 0, wx1: 0 };
 * const preset = { name: 'Circle', Ax1: 1, wx1: 1 };
 * const newParams = applyPreset(params, preset);
 * // newParams = { Ax1: 1, wx1: 1 }
 */
export function applyPreset(params, preset, paramDefs = null) {
    // Clone params to avoid mutation
    const newParams = { ...params };
    
    // Get all valid param keys from definitions
    const validKeys = paramDefs ? getAllParamKeys(paramDefs) : null;
    
    // Apply preset values
    for (const key in preset) {
        // Skip metadata keys
        if (key === 'name') continue;
        
        // Validate key if definitions provided
        if (validKeys && !validKeys.has(key)) {
            console.warn(`Preset "${preset.name}" contains unknown parameter: ${key}`);
            continue;
        }
        
        newParams[key] = preset[key];
    }
    
    return newParams;
}

/**
 * Randomize all parameters within their defined ranges
 * 
 * @param {ParameterGroup[]} paramDefs - Parameter definitions with min/max
 * @returns {Object} Object with randomized parameter values
 * 
 * @example
 * const paramDefs = [{
 *   group: 'Test',
 *   params: [{ key: 'x', type: 'slider', min: 0, max: 10, default: 5 }]
 * }];
 * const random = randomizeParams(paramDefs);
 * // random = { x: 7.234... } (random value 0-10)
 */
export function randomizeParams(paramDefs) {
    const randomParams = {};
    
    for (const group of paramDefs) {
        for (const param of group.params) {
            randomParams[param.key] = randomizeParam(param);
        }
    }
    
    return randomParams;
}

/**
 * Randomize a single parameter
 * @private
 */
function randomizeParam(param) {
    switch (param.type) {
        case 'slider':
            // Random value in range, rounded to step precision
            const range = param.max - param.min;
            const raw = param.min + Math.random() * range;
            
            // Round to step if defined
            if (param.step) {
                return Math.round(raw / param.step) * param.step;
            }
            
            // Or round to precision if defined
            if (param.precision !== undefined) {
                return parseFloat(raw.toFixed(param.precision));
            }
            
            return raw;
            
        case 'toggle':
            // Random selection of options (can be multiple)
            if (!param.options) return param.default;
            const numSelected = Math.floor(Math.random() * (param.options.length + 1));
            if (numSelected === 0) return [];
            
            // Randomly select N options
            const shuffled = [...param.options].sort(() => Math.random() - 0.5);
            return shuffled.slice(0, numSelected);
            
        case 'dropdown':
        case 'radio':
            // Random option from list
            if (!param.options || param.options.length === 0) return param.default;
            return param.options[Math.floor(Math.random() * param.options.length)];
            
        default:
            return param.default;
    }
}

/**
 * Serialize parameters to JSON string (for sharing/saving)
 * 
 * @param {Object} params - Parameter values
 * @param {boolean} [pretty=false] - Pretty print JSON
 * @returns {string} JSON string
 */
export function serializeParams(params, pretty = false) {
    return JSON.stringify(params, null, pretty ? 2 : 0);
}

/**
 * Deserialize parameters from JSON string
 * 
 * @param {string} json - JSON string
 * @param {Object} defaults - Default values (fallback)
 * @returns {Object} Parameter values
 */
export function deserializeParams(json, defaults = {}) {
    try {
        const parsed = JSON.parse(json);
        // Merge with defaults to ensure all keys exist
        return { ...defaults, ...parsed };
    } catch (error) {
        console.error('Failed to deserialize params:', error);
        return defaults;
    }
}

/**
 * Encode parameters to URL-safe string
 * 
 * @param {Object} params - Parameter values
 * @returns {string} Base64 encoded string
 */
export function encodeParams(params) {
    const json = serializeParams(params);
    return btoa(json);
}

/**
 * Decode parameters from URL-safe string
 * 
 * @param {string} encoded - Base64 encoded string
 * @param {Object} defaults - Default values (fallback)
 * @returns {Object} Parameter values
 */
export function decodeParams(encoded, defaults = {}) {
    try {
        const json = atob(encoded);
        return deserializeParams(json, defaults);
    } catch (error) {
        console.error('Failed to decode params:', error);
        return defaults;
    }
}

/**
 * Get default parameter values from definitions
 * 
 * @param {ParameterGroup[]} paramDefs - Parameter definitions
 * @returns {Object} Object with default values
 */
export function getDefaultParams(paramDefs) {
    const defaults = {};
    
    for (const group of paramDefs) {
        for (const param of group.params) {
            defaults[param.key] = param.default;
        }
    }
    
    return defaults;
}

/**
 * Get all parameter keys from definitions
 * @private
 */
function getAllParamKeys(paramDefs) {
    const keys = new Set();
    
    for (const group of paramDefs) {
        for (const param of group.params) {
            keys.add(param.key);
        }
    }
    
    return keys;
}

/**
 * Validate parameter values against definitions
 * 
 * @param {Object} params - Parameter values to validate
 * @param {ParameterGroup[]} paramDefs - Parameter definitions
 * @returns {Object} Object with { valid: boolean, errors: string[] }
 */
export function validateParams(params, paramDefs) {
    const errors = [];
    const validKeys = getAllParamKeys(paramDefs);
    
    // Check for unknown keys
    for (const key in params) {
        if (!validKeys.has(key)) {
            errors.push(`Unknown parameter: ${key}`);
        }
    }
    
    // Check for missing required keys
    for (const group of paramDefs) {
        for (const param of group.params) {
            if (!(param.key in params)) {
                errors.push(`Missing required parameter: ${param.key}`);
            }
        }
    }
    
    // Validate value ranges for sliders
    for (const group of paramDefs) {
        for (const param of group.params) {
            const value = params[param.key];
            
            if (param.type === 'slider') {
                if (typeof value !== 'number') {
                    errors.push(`Parameter ${param.key} must be a number`);
                } else if (value < param.min || value > param.max) {
                    errors.push(`Parameter ${param.key} out of range [${param.min}, ${param.max}]`);
                }
            }
        }
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Create a preset from current parameters
 * 
 * @param {string} name - Preset name
 * @param {Object} params - Current parameter values
 * @returns {Preset} Preset object
 */
export function createPreset(name, params) {
    return {
        name,
        ...params
    };
}

/**
 * Export all as default
 */
export default {
    applyPreset,
    randomizeParams,
    serializeParams,
    deserializeParams,
    encodeParams,
    decodeParams,
    getDefaultParams,
    validateParams,
    createPreset
};

console.log('✅ Preset utilities loaded');

