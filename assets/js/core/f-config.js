/**
 * F Configuration - SINGLE POINT OF CONTROL
 * 
 * *** CHANGE F HERE AND EVERYTHING UPDATES ***
 * 
 * This is your ONE PLACE to control the entire site's sizing.
 * Change the F value below and every aspect of the site adjusts:
 * - Typography sizes
 * - Component dimensions  
 * - Spacing and margins
 * - Layout calculations
 * - p5.js sketch sizing
 * - Everything!
 * 
 * @version 1.0.0 - Single Source of Truth
 */

// =================================================================
// *** CHANGE THIS VALUE TO RESIZE THE ENTIRE SITE ***
// =================================================================

/**
 * F - Base font size and mathematical foundation
 * 
 * Recommended values:
 * - F = 8   → Very compact interface
 * - F = 10  → Compact but readable  
 * - F = 12  → Standard (current default)
 * - F = 14  → Comfortable
 * - F = 16  → Large and spacious
 * - F = 18  → Very large
 * - F = 20  → Maximum recommended
 * 
 * What changes when you modify F:
 * - Header height = F × 2
 * - Desktop margins = F × 4  
 * - Mobile margins = 1px (fixed)
 * - All typography scales proportionally
 * - All component dimensions scale proportionally
 * - All spacing scales proportionally
 */
export const F = 14;

// =================================================================
// MATHEMATICAL RELATIONSHIPS - DON'T CHANGE THESE
// =================================================================

/**
 * These values are calculated automatically from F.
 * They update instantly when F changes.
 * DO NOT modify these - modify F above instead.
 */
export const DERIVED_VALUES = {
    // Core dimensions
    get header() { return F * 2; },
    get subheader() { return F * 2; },
    get footer() { return F * 2; },
    
    // Margins
    get desktopMargin() { return F * 4; },
    get mobileMargin() { return Math.max(F / 2, 6); },
    
    // Typography scale
    get h1() { return F * 2; },
    get h2() { return F * 1.5; },
    get h3() { return F; },
    get body() { return F; },
    get small() { return F * 0.8; },
    
    // Component sizing
    get dropdownMaxHeight() { return F * 25; },
    get buttonWidth() { return F * 8; },
    get indent() { return F * 2; },
    
    // Spacing system
    get xs() { return F * 0.5; },
    get sm() { return F; },
    get md() { return F * 2; },
    get lg() { return F * 3; },
    get xl() { return F * 4; }
};

// =================================================================
// USAGE EXAMPLES
// =================================================================

/*
// In JavaScript:
const buttonHeight = DERIVED_VALUES.header;  // Always F × 2
const margin = DERIVED_VALUES.desktopMargin; // Always F × 4

// In CSS (automatically updated):
height: var(--header-height);  // Always F × 2  
margin: var(--target-margin);  // Always F × 4

// Dynamic changes:
import { F } from './f-config.js';
console.log(`Current F: ${F}px`);
console.log(`Header will be: ${F * 2}px`);
console.log(`Desktop margin will be: ${F * 4}px`);

// To change F:
// 1. Edit the F value at the top of this file
// 2. Save the file
// 3. Reload the page
// 4. Everything resizes automatically!
*/

console.log(`🎯 F Configuration loaded - F = ${F}px`);
console.log(`📏 Header height: ${DERIVED_VALUES.header}px`);
console.log(`📐 Desktop margin: ${DERIVED_VALUES.desktopMargin}px`);
console.log(`📱 Mobile margin: ${DERIVED_VALUES.mobileMargin}px`);
