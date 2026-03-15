/**
 * Parameter Builder - Convert script parameters to ToolBase sidebar DSL
 * 
 * Responsibilities:
 * - Convert parameter definitions to ToolBase component arrays
 * - Generate PARAMS, ANIMATE, EXPORT, INFO tabs
 * - Handle parameter groups as collapsible blocks
 * - Create preset/randomise/reset controls
 * 
 * @version 1.0.0
 */

/**
 * Build complete ToolBase sidebar configuration from script config
 * @param {ScriptConfig} scriptConfig - Script configuration
 * @returns {Array} ToolBase sidebar configuration
 */
export function buildSidebarConfig(scriptConfig) {
    const tabs = [];
    
    // PARAMS tab - auto-generated from parameters
    tabs.push(['PARAMS', buildParamsTab(scriptConfig)]);
    
    // ANIMATE tab — only for generators that actually animate (type !== 'none')
    if (scriptConfig.animation && scriptConfig.animation.type !== 'none') {
        tabs.push(['ANIMATE', buildAnimateTab(scriptConfig)]);
    }
    
    // EXPORT tab — only if there is animation export content to show
    const exportBlocks = buildExportTab(scriptConfig);
    if (exportBlocks.length > 0) {
        tabs.push(['EXPORT', exportBlocks]);
    }

    // INFO tab — if description or infoSections present
    if (scriptConfig.description || (scriptConfig.infoSections && scriptConfig.infoSections.length > 0)) {
        tabs.push(['INFO', buildInfoTab(scriptConfig)]);
    }
    
    return tabs;
}

/**
 * Build PARAMS tab content
 * @param {ScriptConfig} scriptConfig - Script configuration
 * @returns {Array} Blocks for PARAMS tab
 */
function buildParamsTab(scriptConfig) {
    const blocks = [];
    
    // Presets block (always first if presets exist)
    if (scriptConfig.presets && scriptConfig.presets.length > 0) {
        blocks.push(['Presets', [
            ['dropdown', 'Select', getPresetNames(scriptConfig.presets), { 
                key: 'preset',
                value: '— Select Preset —'
            }],
            ['button', 'Randomise', null, { key: 'randomise' }],
            ['button', 'Reset All', null, { key: 'resetAll' }],
        ]]);
    } else {
        // No presets, just reset
        blocks.push(['Controls', [
            ['button', 'Reset All', null, { key: 'resetAll' }],
        ]]);
    }
    
    // Parameter groups
    for (const group of scriptConfig.parameters) {
        const components = group.params.map(param => paramToComponent(param));
        blocks.push([group.group, components, {
            defaultCollapsed: group.defaultCollapsed || false
        }]);
    }
    
    return blocks;
}

/**
 * Build ANIMATE tab content
 * @param {ScriptConfig} scriptConfig - Script configuration
 * @returns {Array} Blocks for ANIMATE tab
 */
function buildAnimateTab(scriptConfig) {
    const blocks = [];
    const anim = scriptConfig.animation;
    
    // Playback controls
    blocks.push(['Playback', [
        ['button', 'Play / Pause', null, { key: 'playPause' }],
        ['button', 'Stop & Reset', null, { key: 'stopReset' }],
        ['slider', 'Speed', 0.1, 5, 0.1, { 
            key: 'animSpeed', 
            value: anim.defaultSpeed || 1, 
            withNumber: true,
            precision: 1
        }],
    ]]);
    
    // Animatable params — each entry may be a string key or an object { key, label, mode, ... }
    if (anim.animatableParams && anim.animatableParams.length > 0) {
        const deriveLabel = (key) => key
            .replace(/^phi_/, 'φ')
            .replace(/^w([xy])/, 'ω$1')
            .replace(/_/g, '');

        const labels = anim.animatableParams.map(entry =>
            typeof entry === 'string' ? deriveLabel(entry) : (entry.label ?? deriveLabel(entry.key))
        );
        
        blocks.push(['Animate Params', [
            ['toggle', 'Animate', labels, { 
                key: 'phaseToggles',
                selectedValues: []
            }],
        ]]);
    }
    
    // Loop settings (if loopFrames defined)
    if (anim.loopFrames && anim.loopFrames > 0) {
        blocks.push(['Loop', [
            ['label', `Loop: ${anim.loopFrames} frames`, { variant: 'caption' }],
            ['toggle', 'Options', ['Enabled'], { 
                key: 'loopEnabled',
                selectedValues: ['Enabled']
            }],
        ]]);
    }

    return blocks;
}

/**
 * Build EXPORT tab content
 * @param {ScriptConfig} scriptConfig - Script configuration
 * @returns {Array} Blocks for EXPORT tab
 */
function buildExportTab(scriptConfig) {
    const blocks = [];

    // PNG export is handled by the toolbar EXPORT button — not duplicated here.
    // Animation export placeholder: injected at runtime by _injectExportUI.
    // Suppressed when type is 'none' (no animation to export) or animationExport === false.
    const animType = scriptConfig.animation?.type;
    if (scriptConfig.animation && animType !== 'none' && scriptConfig.animation.animationExport !== false) {
        blocks.push(['Animation Export', []]);
    }

    return blocks;
}

/**
 * Build INFO tab content.
 *
 * If scriptConfig.infoSections is present (array of { heading, body }), each section
 * is rendered as a labelled block. This is the full-knowledge-dump path used by
 * remediated generators.
 *
 * If infoSections is absent, falls back to the legacy title + description + stats layout
 * for backwards compatibility with unremediated generators.
 *
 * @param {ScriptConfig} scriptConfig - Script configuration
 * @returns {Array} Blocks for INFO tab
 */
function buildInfoTab(scriptConfig) {
    const blocks = [];

    if (scriptConfig.infoSections && scriptConfig.infoSections.length > 0) {
        for (const section of scriptConfig.infoSections) {
            blocks.push([section.heading, [
                ['label', section.body, { variant: 'body' }],
            ]]);
        }
        return blocks;
    }

    // Legacy fallback
    blocks.push(['About', [
        ['label', scriptConfig.title, { variant: 'heading' }],
        ['label', scriptConfig.description || '', { variant: 'body' }],
    ]]);
    
    if (scriptConfig.version) {
        blocks.push(['Version', [
            ['label', scriptConfig.version, { variant: 'caption' }],
        ]]);
    }
    
    const paramCount = scriptConfig.parameters.reduce(
        (sum, group) => sum + group.params.length, 0
    );
    blocks.push(['Statistics', [
        ['label', `Parameters: ${paramCount}`, { variant: 'caption' }],
        ['label', `Presets: ${scriptConfig.presets?.length || 0}`, { variant: 'caption' }],
        ['label', `Category: ${scriptConfig.category}`, { variant: 'caption' }],
    ]]);
    
    return blocks;
}

/**
 * Convert parameter definition to ToolBase component definition
 * @param {ParameterDef} param - Parameter definition
 * @returns {Array} Component definition array
 */
const VGA_PALETTE = [
    '#000000', '#800000', '#008000', '#808000',
    '#000080', '#800080', '#008080', '#c0c0c0',
    '#808080', '#ff0000', '#00ff00', '#ffff00',
    '#0000ff', '#ff00ff', '#00ffff', '#ffffff'
];

function paramToComponent(param) {
    switch (param.type) {
        case 'slider':
            return ['slider', param.label, param.min, param.max, param.step, {
                key: param.key,
                value: param.default,
                withNumber: true,
                precision: param.precision
            }];
            
        case 'toggle':
            return ['toggle', param.label, param.options, {
                key: param.key,
                selectedValues: Array.isArray(param.default) ? param.default : [param.default]
            }];
            
        case 'dropdown':
            return ['dropdown', param.label, param.options, {
                key: param.key,
                value: param.default
            }];
            
        case 'radio':
            return ['radio', param.label, param.options, {
                key: param.key,
                selectedValue: param.default
            }];

        case 'color':
            return ['dropdown', param.label, param.options || VGA_PALETTE, {
                key: param.key,
                value: param.default
            }];
            
        default:
            console.warn(`Unknown parameter type: ${param.type}, using label`);
            return ['label', `${param.label}: (unsupported type ${param.type})`, {}];
    }
}

/**
 * Get preset names for dropdown
 * @param {Preset[]} presets - Array of presets
 * @returns {string[]} Preset names with placeholder
 */
function getPresetNames(presets) {
    return ['— Select Preset —', ...presets.map(p => p.name)];
}

/**
 * Export functions
 */
export default {
    buildSidebarConfig,
    buildParamsTab,
    buildAnimateTab,
    buildExportTab,
    buildInfoTab,
    paramToComponent,
    getPresetNames
};
