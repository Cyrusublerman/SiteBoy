/**
 * Parameter Builder — convert script config to ToolBase sidebar DSL.
 *
 * Produces two tabs only:
 *   PARAMS — presets/randomise/reset, then parameter groups with inline
 *            modulator-chip per param row for any modulatable parameter.
 *   OUTPUT — SIZE block (width × height), PALETTE block (palette-row per
 *            colourway layer), optional POST block.
 *
 * The ANIMATE tab has been removed; transport lives below the canvas
 * (mounted by GenerativeToolHost via buildTransportStrip()).
 *
 * @version 3.0.0
 */

/**
 * Build complete ToolBase sidebar configuration from script config.
 * @param {import('./script-types.js').ScriptConfig} scriptConfig
 * @returns {Array} ToolBase sidebar configuration
 */
export function buildSidebarConfig(scriptConfig) {
    const tabs = [];
    tabs.push(['PARAMS', buildParamsTab(scriptConfig)]);
    tabs.push(['OUTPUT', buildOutputTab(scriptConfig)]);
    return tabs;
}

/**
 * Build PARAMS tab content.
 *
 * Each modulatable parameter (one with a ModulatorDescriptor in
 * animation.modulators[]) gets a modulator-chip component immediately
 * following its control row.
 *
 * @param {import('./script-types.js').ScriptConfig} scriptConfig
 * @returns {Array} Blocks for PARAMS tab
 */
function buildParamsTab(scriptConfig) {
    const blocks = [];

    // Build set of modulatable param keys for chip injection
    const modulatorKeys = _buildModulatorKeySet(scriptConfig);

    // Presets / Controls block
    if (scriptConfig.presets && scriptConfig.presets.length > 0) {
        blocks.push(['Presets', [
            ['dropdown', 'Select', _getPresetNames(scriptConfig.presets), {
                key: 'preset',
                value: '— Select Preset —'
            }],
            ['button', 'Randomise', null, { key: 'randomise' }],
            ['button', 'Reset All', null, { key: 'resetAll' }],
        ]]);
    } else {
        blocks.push(['Controls', [
            ['button', 'Reset All', null, { key: 'resetAll' }],
        ]]);
    }

    // Parameter groups
    for (const group of scriptConfig.parameters) {
        const components = [];
        for (const param of group.params) {
            components.push(paramToComponent(param));
            // Inject modulator chip after every non-toggle, non-button param
            if (_isModulatable(param)) {
                components.push(['modulator-chip', '', {
                    key:       `mod__${param.key}`,
                    targetKey: param.key,
                    modulator: modulatorKeys.get(param.key) ?? null,
                }]);
            }
        }
        blocks.push([group.group, components, {
            defaultCollapsed: group.defaultCollapsed || false
        }]);
    }

    return blocks;
}

/**
 * Build OUTPUT tab content.
 *
 * Blocks:
 *   SIZE    — width × height inputs
 *   PALETTE — one palette-row per colourway layer (or legacy background dropdown)
 *   POST    — optional post-effect controls (iff scriptConfig.output?.post is declared)
 *
 * @param {import('./script-types.js').ScriptConfig} scriptConfig
 * @returns {Array} Blocks for OUTPUT tab
 */
function buildOutputTab(scriptConfig) {
    const blocks = [];
    const canvas = scriptConfig.canvas || {};
    const modulatorKeys = _buildModulatorKeySet(scriptConfig);

    // SIZE block — width and height
    blocks.push(['Size', [
        ['number', 'Width', {
            key:       'canvasWidth',
            value:     canvas.width  || 800,
            min:       100,
            max:       4096,
            step:      1,
            precision: 0,
        }],
        ['number', 'Height', {
            key:       'canvasHeight',
            value:     canvas.height || 800,
            min:       100,
            max:       4096,
            step:      1,
            precision: 0,
        }],
    ]]);

    // PALETTE block — palette-row per colourway layer
    if (Array.isArray(canvas.colourway) && canvas.colourway.length > 0) {
        const paletteComponents = [];
        for (const layer of canvas.colourway) {
            const layerModKey = `colourway__${layer.id}`;
            const layerMod    = modulatorKeys.get(layerModKey) ?? null;
            paletteComponents.push(['palette-row', layer.label || layer.id, {
                key:          `palette__${layer.id}`,
                layer:        { ...layer },
                hasModulator: layerMod !== null,
                modEnabled:   layerMod?.enabled ?? false,
            }]);
        }
        blocks.push(['Palette', paletteComponents]);
    } else {
        // Legacy: single background colour dropdown
        const VGA_PALETTE = [
            '#000000', '#800000', '#008000', '#808000',
            '#000080', '#800080', '#008080', '#c0c0c0',
            '#808080', '#ff0000', '#00ff00', '#ffff00',
            '#0000ff', '#ff00ff', '#00ffff', '#ffffff'
        ];
        blocks.push(['Palette', [
            ['dropdown', 'Background', VGA_PALETTE, {
                key:   'canvasBackground',
                value: canvas.background || '#000000'
            }]
        ]]);
    }

    // POST block — opt-in per script via output.post[]
    if (Array.isArray(scriptConfig.output?.post) && scriptConfig.output.post.length > 0) {
        const postComponents = [];
        for (const effect of scriptConfig.output.post) {
            postComponents.push(['toggle', _capitalise(effect.type), ['on', 'off'], {
                key:            `post__${effect.type}`,
                selectedValues: [effect.enabled ? 'on' : 'off'],
            }]);
            if (typeof effect.strength === 'number') {
                postComponents.push(['slider', 'Strength', 0, 1, 0.01, {
                    key:         `post__${effect.type}__strength`,
                    value:       effect.strength,
                    withNumber:  true,
                    precision:   2,
                }]);
            }
        }
        blocks.push(['Post', postComponents, { defaultCollapsed: true }]);
    }

    return blocks;
}

/**
 * Build the config object for a GeneratorTransportStrip instance.
 * Called by GenerativeToolHost._buildContainerLayout().
 *
 * @param {import('./script-types.js').ScriptConfig} scriptConfig
 * @returns {{ defaultSpeed: number, showTimeline: boolean }}
 */
export function buildTransportConfig(scriptConfig) {
    const anim = scriptConfig.animation;
    return {
        defaultSpeed: anim?.defaultSpeed ?? 1,
        showTimeline: anim?.sequencer    === true,
    };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a Map from param key → ModulatorDescriptor for quick lookup.
 * @param {import('./script-types.js').ScriptConfig} scriptConfig
 * @returns {Map<string, Object>}
 */
function _buildModulatorKeySet(scriptConfig) {
    const map = new Map();
    const modulators = scriptConfig.animation?.modulators;
    if (!Array.isArray(modulators)) return map;
    for (const mod of modulators) {
        map.set(mod.targetKey, mod);
    }
    return map;
}

/**
 * Determine whether a parameter should receive a modulator chip.
 * Only slider/number/color params can be modulated.
 * @param {import('./script-types.js').ParameterDef} param
 * @returns {boolean}
 */
function _isModulatable(param) {
    return ['slider', 'number', 'color'].includes(param.type);
}

/**
 * Convert a ParameterDef to a ToolBase component array.
 * @param {import('./script-types.js').ParameterDef} param
 * @returns {Array}
 */
function paramToComponent(param) {
    switch (param.type) {
        case 'slider':
            return ['slider', param.label, param.min, param.max, param.step, {
                key:        param.key,
                value:      param.default,
                withNumber: true,
                precision:  param.precision
            }];

        case 'number':
            return ['number', param.label, {
                key:       param.key,
                value:     param.default,
                min:       param.min,
                max:       param.max,
                step:      param.step,
                precision: param.precision
            }];

        case 'toggle':
            return ['toggle', param.label, param.options, {
                key:           param.key,
                selectedValues: Array.isArray(param.default) ? param.default : [param.default]
            }];

        case 'dropdown':
        case 'select':
            return ['dropdown', param.label, param.options, {
                key:   param.key,
                value: param.default
            }];

        case 'radio':
            return ['radio', param.label, param.options, {
                key:           param.key,
                selectedValue: param.default
            }];

        case 'color':
            return ['color', param.label, {
                key:   param.key,
                value: param.default || '#000000'
            }];

        case 'easing-curve':
            return ['easing-curve', param.label, {
                key:   param.key,
                value: param.default ?? 'ease-in-out'
            }];

        default:
            console.warn(`[parameter-builder] Unknown parameter type: ${param.type}`);
            return ['label', `${param.label}: (unsupported type ${param.type})`, {}];
    }
}

function _getPresetNames(presets) {
    return ['— Select Preset —', ...presets.map(p => p.name)];
}

function _capitalise(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export default {
    buildSidebarConfig,
    buildParamsTab,
    buildOutputTab,
    buildTransportConfig,
    paramToComponent,
};
