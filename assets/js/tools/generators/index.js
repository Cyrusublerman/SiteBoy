/**
 * Generators Entry Point
 * 
 * Main export point for the generative art system.
 * Exports GenerativeToolHost and ScriptRegistry.
 * 
 * @version 1.0.0
 */

export { GenerativeToolHost } from './core/generative-tool-host.js';
export { default as ScriptRegistry } from './core/script-registry.js';
export { buildSidebarConfig } from './core/parameter-builder.js';
export { validateScriptConfig, SCRIPT_CATEGORIES } from './core/script-types.js';

// Shared utilities
export * as Evaluation from './shared/evaluation.js';
export * as Presets from './shared/presets.js';

window.debugLog('TOOLS', '✅ Generators module loaded');

