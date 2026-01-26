/**
 * PalettePreview — Visual colour palette display
 * 
 * Displays a palette as a grid of colour swatches.
 * Supports click interaction for colour selection.
 * 
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class PalettePreview extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'palette-preview' }, deps);
        
        // Configuration
        this.colours = options.colours ?? [];
        this.swatchSize = options.swatchSize ?? null; // Auto-calculate from F if null
        this.gap = options.gap ?? null; // Auto-calculate from F if null
        this.maxPerRow = options.maxPerRow ?? null; // Auto-wrap, or null for flex wrap
        
        // Callbacks
        this.onClick = options.onClick ?? null;
    }
    
    render() {
        if (this.element) return this.element;
        
        const F = this.deps.MF?.F ?? 14;
        
        // Calculate sizes based on F if not provided
        const swatchSize = this.swatchSize ?? F;
        const gap = this.gap ?? Math.round(F * 0.5);
        
        // Container
        this.element = this.createElement('div', 'palette-preview');
        this.element.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: ${gap}px;
            padding: 0;
        `;
        
        // Render initial colours
        if (this.colours.length > 0) {
            this.setColours(this.colours);
        }
        
        return this.element;
    }
    
    /**
     * Set colours to display
     * @param {string[]} colours - Array of hex colour strings
     */
    setColours(colours) {
        if (!this.element) return;
        
        this.colours = colours;
        
        const F = this.deps.MF?.F ?? 14;
        const swatchSize = this.swatchSize ?? F;
        
        // Clear existing swatches
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }
        
        // Create new swatches
        colours.forEach((colour, index) => {
            const swatch = this._createSwatch(colour, index, swatchSize);
            this.element.appendChild(swatch);
        });
        
        window.debugLog('VERBOSE', `PalettePreview: Displaying ${colours.length} colours`);
    }
    
    /**
     * Create a single colour swatch
     * @private
     */
    _createSwatch(colour, index, size) {
        const swatch = this.createElement('div', 'palette-swatch');
        swatch.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            background: ${colour};
            border: 1px solid var(--c-border);
            box-sizing: border-box;
            cursor: ${this.onClick ? 'pointer' : 'default'};
            flex-shrink: 0;
        `;
        
        // Add hover effect if clickable
        if (this.onClick) {
            swatch.addEventListener('mouseenter', () => {
                swatch.style.transform = 'scale(1.1)';
                swatch.style.zIndex = '10';
            });
            
            swatch.addEventListener('mouseleave', () => {
                swatch.style.transform = 'scale(1)';
                swatch.style.zIndex = '1';
            });
            
            swatch.addEventListener('click', () => {
                this.onClick(colour, index);
            });
        }
        
        return swatch;
    }
    
    /**
     * Get current colours
     * @returns {string[]} Array of hex colour strings
     */
    getColours() {
        return [...this.colours];
    }
    
    /**
     * Add a colour to the palette
     * @param {string} colour - Hex colour string
     */
    addColour(colour) {
        this.colours.push(colour);
        this.setColours(this.colours);
    }
    
    /**
     * Remove a colour from the palette
     * @param {number} index - Index of colour to remove
     */
    removeColour(index) {
        if (index >= 0 && index < this.colours.length) {
            this.colours.splice(index, 1);
            this.setColours(this.colours);
        }
    }
    
    /**
     * Clear all colours
     */
    clear() {
        this.setColours([]);
    }
    
    destroy() {
        super.destroy();
    }
}
