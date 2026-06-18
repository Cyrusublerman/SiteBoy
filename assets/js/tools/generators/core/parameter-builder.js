/**
 * Parameter Builder — convert script config to ToolBase sidebar DSL.
 *
 * Produces two tabs only:
 *   PARAMS — presets/randomise/reset, then parameter groups with
 *            expression-param rows (static slider or expression input).
 *   OUTPUT — SIZE block (width × height), PALETTE block (palette-row per
 *            colourway layer), optional POST block.
 *
 * The ANIMATE tab has been removed; transport lives below the canvas
 * (mounted by GenerativeToolHost via buildTransportStrip()).
 *
 * @version 4.0.0
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
 * Slider and number params render as expression-param rows with an inline
 * static / expression mode toggle.
 *
 * @param {import('./script-types.js').ScriptConfig} scriptConfig
 * @returns {Array} Blocks for PARAMS tab
 */
function buildParamsTab(scriptConfig) {
    const blocks = [];

    // Presets / Controls block
    if (scriptConfig.presets && scriptConfig.presets.length > 0) {
        blocks.push(['Presets', [
            ['preset-toolbar', _getPresetNames(scriptConfig.presets), {
                key:   'preset',
                value: '— Select Preset —',
            }],
        ], { flush: true }]);
    } else {
        blocks.push(['Controls', [
            ['button', 'Reset All', null, { key: 'resetAll' }],
        ]]);
    }

    // Parameter groups — rows stack flush (no gap); only the first contract-aware
    // component (expression-param or toggle/radio/checkbox) in a group keeps its
    // top border, so mixed groups stack flush with single dividers (border-system §3).
    const CONTRACT_AWARE = new Set([
        'expression-param', 'toggle', 'radio', 'checkbox',
        'dropdown', 'select', 'color', 'easing-curve', 'line-list',
    ]);
    for (const group of scriptConfig.parameters) {
        const components = [];
        let firstContractSeen = false;
        for (const param of group.params) {
            const def = paramToComponent(param);
            if (CONTRACT_AWARE.has(def[0])) {
                const opts = def[def.length - 1];
                if (opts && typeof opts === 'object' && !Array.isArray(opts)) {
                    if (firstContractSeen) opts.topBorder = false;
                    firstContractSeen = true;
                }
            }
            components.push(def);
        }
        blocks.push([group.group, components, {
            defaultCollapsed: group.defaultCollapsed || false,
            flush: true,
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

    // SIZE block — width × height pair
    blocks.push(['Size', [
        ['canvas-size-pair', {
            width:     canvas.width  || 800,
            height:    canvas.height || 800,
            widthKey:  'canvasWidth',
            heightKey: 'canvasHeight',
            min:       100,
            max:       4096,
            step:      1,
            precision: 0,
        }],
    ], { flush: true }]);

    // PALETTE block — palette-row per colourway layer
    if (Array.isArray(canvas.colourway) && canvas.colourway.length > 0) {
        blocks.push(['Palette', [
            ['palette-table', canvas.colourway.map(layer => ({ ...layer }))],
        ], { flush: true }]);
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
            const postOpts = {
                label:   _capitalise(effect.type),
                enabled: effect.enabled,
            };
            if (typeof effect.strength === 'number') postOpts.strength = effect.strength;
            postComponents.push(['post-effect-row', effect.type, postOpts]);
        }
        blocks.push(['Post', postComponents, { defaultCollapsed: true, flush: true }]);
    }

    return blocks;
}

/**
 * Whether the script canvas supports strip-based frame recording.
 * @param {import('./script-types.js').ScriptConfig} scriptConfig
 * @returns {boolean}
 */
function isRecordableContext(scriptConfig) {
    const ctx = scriptConfig?.canvas?.context ?? '2d';
    return ctx === 'p5' || ctx === '2d' || ctx === 'canvas2d';
}

/**
 * Build the config object for a GeneratorTransportStrip instance.
 * Called by GenerativeToolHost._buildContainerLayout().
 *
 * @param {import('./script-types.js').ScriptConfig} scriptConfig
 * @returns {{ defaultFps: number, showTimeline: boolean, showRecord: boolean }}
 */
export function buildTransportConfig(scriptConfig) {
    const anim = scriptConfig.animation;
    return {
        defaultFps:   anim?.defaultFps ?? 60,
        showTimeline: anim?.sequencer  === true,
        showRecord:   isRecordableContext(scriptConfig),
    };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert a ParameterDef to a ToolBase component array.
 * @param {import('./script-types.js').ParameterDef} param
 * @returns {Array}
 */
function paramToComponent(param) {
    switch (param.type) {
        case 'slider':
            return ['expression-param', param.label, param.min, param.max, param.step, {
                key:         param.key,
                value:       param.default,
                precision:   param.precision,
                description: param.description ?? '',
                display:     'both',
            }];

        case 'number':
            return ['expression-param', param.label, param.min ?? 0, param.max ?? 100, param.step ?? 1, {
                key:         param.key,
                value:       param.default,
                precision:   param.precision,
                description: param.description ?? '',
                display:     'field',
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

        case 'text':
        case 'textarea':
        case 'lines':
            return ['line-list', param.label, {
                key:         param.key,
                value:       param.default ?? '',
                maxLines:    param.maxLines ?? (param.type === 'text' ? 1 : 8),
                minLines:    param.minLines ?? 1,
                placeholder: param.placeholder ?? '',
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
