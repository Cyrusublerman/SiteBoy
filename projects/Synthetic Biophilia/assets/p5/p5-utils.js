/**
 * P5.js Utilities for SiteBoy Framework
 * 
 * Shared helper functions for p5.js sketches integrated with SiteBoy.
 * This module provides utilities for accessing CSS variables and other
 * common p5.js operations while maintaining framework compliance.
 * 
 * @version 1.0.0
 */

/**
 * Retrieves a CSS variable value from the document root.
 * Used for maintaining VGA color scheme consistency across p5.js sketches.
 * 
 * @param {string} variable - The CSS variable name (e.g., '--c-bg', '--vga-red')
 * @returns {string} The computed CSS variable value, trimmed
 * 
 * @example
 * const bgColor = getVGAColor('--c-bg');
 * p.background(bgColor);
 */
export const getVGAColor = (variable) => {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
};

/**
 * Caches all common VGA colors for a p5.js sketch.
 * Call this once in setup() to avoid repeated getComputedStyle calls.
 * 
 * @returns {Object} Object containing all cached VGA colors
 * 
 * @example
 * let colors;
 * p.setup = function() {
 *   colors = cacheVGAColors();
 *   p.background(colors.bg);
 * };
 */
export const cacheVGAColors = () => {
    return {
        bg: getVGAColor('--c-bg'),
        text: getVGAColor('--c-text'),
        accent: getVGAColor('--c-accent'),
        border: getVGAColor('--c-border'),
        // VGA palette
        black: getVGAColor('--vga-black'),
        blue: getVGAColor('--vga-blue'),
        green: getVGAColor('--vga-green'),
        cyan: getVGAColor('--vga-cyan'),
        red: getVGAColor('--vga-red'),
        magenta: getVGAColor('--vga-magenta'),
        brown: getVGAColor('--vga-brown'),
        lightGray: getVGAColor('--vga-light-gray'),
        darkGray: getVGAColor('--vga-dark-gray'),
        brightBlue: getVGAColor('--vga-bright-blue'),
        brightGreen: getVGAColor('--vga-bright-green'),
        brightCyan: getVGAColor('--vga-bright-cyan'),
        brightRed: getVGAColor('--vga-bright-red'),
        brightMagenta: getVGAColor('--vga-bright-magenta'),
        yellow: getVGAColor('--vga-yellow'),
        white: getVGAColor('--vga-white')
    };
};

/**
 * Gets the current state from SiteBoy component or returns default values.
 * This is used by p5.js sketches that are controlled by SiteBoy UI components.
 * 
 * @param {Object} defaults - Default values to use if state is not available
 * @returns {Object} The current state object
 * 
 * @example
 * const state = getSiteBoyState({ pointCount: 169, angle: 137.5 });
 * const N = state.pointCount;
 */
export const getSiteBoyState = (defaults = {}) => {
    return { ...defaults, ...(window.siteBoyP5State || {}) };
};

/**
 * Registers a p5 instance for SiteBoy component communication.
 * Call this in setup() to allow bidirectional communication.
 * 
 * @param {p5} p5Instance - The p5.js instance to register
 * 
 * @example
 * p.setup = function() {
 *   registerP5Instance(p);
 * };
 */
export const registerP5Instance = (p5Instance) => {
    if (window.siteBoyP5Component) {
        window.siteBoyP5Component.p5Instance = p5Instance;
    }
};

