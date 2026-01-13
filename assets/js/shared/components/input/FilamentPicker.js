/**
 * FilamentPicker - Filament color selection with swatch grid
 * 
 * Provides a picker for selecting multiple filament colors from a palette.
 * Shows selected colors in a row, search functionality, and a swatch grid.
 * 
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';
import { Collection } from '../container/Collection.js';
import { TextInput } from './TextInput.js';

export class FilamentPicker extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'filament-picker' }, deps);
        
        // Filament palette: [{h: '#hex', n: 'name'}]
        this.palette = options.palette ?? [];
        
        // Selection constraints
        this.min = options.min ?? 2;
        this.max = options.max ?? 10;
        this.selectedIndices = options.selectedIndices ?? []; // Array of palette indices
        
        // Labels
        this.label = options.label ?? 'Filament Colors';
        this.placeholder = options.placeholder ?? 'Select colors';
        
        // Events
        this.onChange = options.onChange ?? (() => {}); // (selectedIndices, colors) => {}
        
        // Internal state
        this.searchTerm = '';
        this.filteredPalette = [...this.palette];
        
        // Child components
        this.childComponents = [];
    }
    
    render() {
        if (this.element) return this.element;
        
        const { F, F2 } = this.getF();
        
        this.element = this.createElement('div', 'filament-picker component');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: ${F2}px;
        `;
        
        // Label
        if (this.label) {
            const label = this.createElement('div', 'filament-picker-label');
            label.textContent = this.label;
            label.style.cssText = `
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: ${F}px;
                font-weight: bold;
                color: var(--c-text);
                text-transform: uppercase;
            `;
            this.element.appendChild(label);
        }
        
        // Selected colors row
        this.selectedRow = this.createElement('div', 'selected-colors-row');
        this.selectedRow.style.cssText = `
            display: flex;
            gap: ${F2 * 0.5}px;
            padding: ${F2}px;
            min-height: ${F * 3}px;
            background: var(--c-bg);
            border: 1px solid var(--c-border);
            flex-wrap: wrap;
            align-items: center;
        `;
        this._renderSelectedColors(F, F2);
        this.element.appendChild(this.selectedRow);
        
        // Search input
        const searchInput = new TextInput({
            placeholder: 'Search filaments...',
            value: this.searchTerm,
            onInput: (value) => this._handleSearch(value)
        }, this.deps);
        this.element.appendChild(searchInput.render());
        this.childComponents.push(searchInput);
        
        // Swatch grid (using Collection)
        this._renderSwatchGrid(F, F2);
        
        return this.element;
    }
    
    _renderSelectedColors(F, F2) {
        this.selectedRow.innerHTML = '';
        
        if (this.selectedIndices.length === 0) {
            const placeholder = this.createElement('span');
            placeholder.textContent = this.placeholder;
            placeholder.style.cssText = `
                color: var(--c-text-dim);
                font-size: ${F * 0.86}px;
            `;
            this.selectedRow.appendChild(placeholder);
            return;
        }
        
        this.selectedIndices.forEach((idx, order) => {
            const color = this.palette[idx];
            if (!color) return;
            
            const swatch = this.createElement('div', 'selected-swatch');
            swatch.style.cssText = `
                width: ${F * 2}px;
                height: ${F * 2}px;
                background: ${color.h};
                border: 2px solid var(--c-border);
                cursor: pointer;
                position: relative;
                flex-shrink: 0;
            `;
            swatch.title = `${order + 1}. ${color.n}\nClick to remove`;
            
            // Order number overlay
            const label = this.createElement('span');
            label.textContent = order + 1;
            label.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: var(--c-bg);
                font-size: ${F * 0.71}px;
                font-weight: bold;
                text-shadow: 0 0 2px var(--c-text);
                pointer-events: none;
            `;
            swatch.appendChild(label);
            
            swatch.addEventListener('click', () => this._toggleSelection(idx));
            this.selectedRow.appendChild(swatch);
        });
    }
    
    _renderSwatchGrid(F, F2) {
        // Clear old grid and destroy old collection
        const oldGrid = this.element.querySelector('.swatch-grid-container');
        if (oldGrid) {
            // Find and destroy the old collection component
            const oldCollectionIndex = this.childComponents.findIndex(c => c.componentType === 'collection');
            if (oldCollectionIndex >= 0) {
                this.childComponents[oldCollectionIndex].destroy();
                this.childComponents.splice(oldCollectionIndex, 1);
            }
            oldGrid.remove();
        }
        
        // Convert palette to Collection items
        const items = this.filteredPalette.map((color, filteredIdx) => {
            const globalIdx = this.palette.indexOf(color);
            return {
                id: globalIdx,
                color: color.h,
                label: color.n
            };
        });
        
        const gridContainer = this.createElement('div', 'swatch-grid-container');
        gridContainer.style.cssText = `
            max-height: ${F * 20}px;
            overflow-y: auto;
            border: 1px solid var(--c-border);
        `;
        
        const collection = new Collection({
            items,
            layout: 'grid',
            columns: 8,
            gap: 0.3,
            itemType: 'swatch',
            itemSize: 2.5,
            selectable: false, // Disable Collection's selection handling
            multiSelect: false,
            selectedIds: [], // Don't let Collection manage selection
            onSelect: () => {} // No-op
        }, this.deps);
        
        const collectionEl = collection.render();
        
        // Manual selection handling - add click listeners after Collection renders
        const swatches = collectionEl.querySelectorAll('.collection-item');
        swatches.forEach((swatchEl, idx) => {
            const itemId = parseInt(swatchEl.dataset.itemId);
            const isSelected = this.selectedIndices.includes(itemId);
            const color = this.palette[itemId];
            
            // Ensure title is set (tooltip with color name)
            if (color) {
                swatchEl.title = color.n;
            }
            
            // Add selection styling
            if (isSelected) {
                swatchEl.style.outline = '2px solid var(--vga-yellow)';
            }
            
            // Add cursor pointer
            swatchEl.style.cursor = 'pointer';
            
            // Add click handler
            swatchEl.addEventListener('click', () => {
                this._toggleSelection(itemId);
            });
        });
        
        gridContainer.appendChild(collectionEl);
        this.element.appendChild(gridContainer);
        this.childComponents.push(collection);
    }
    
    _handleSearch(value) {
        this.searchTerm = value.toLowerCase();
        this.filteredPalette = this.palette.filter(color =>
            color.n.toLowerCase().includes(this.searchTerm)
        );
        
        const { F, F2 } = this.getF();
        this._renderSwatchGrid(F, F2);
    }
    
    _toggleSelection(idx) {
        const currentIndex = this.selectedIndices.indexOf(idx);
        
        if (currentIndex >= 0) {
            // Remove
            this.selectedIndices.splice(currentIndex, 1);
        } else {
            // Add if within limit
            if (this.selectedIndices.length >= this.max) {
                console.warn(`Maximum ${this.max} filaments allowed`);
                return;
            }
            this.selectedIndices.push(idx);
        }
        
        // Re-render
        const { F, F2 } = this.getF();
        this._renderSelectedColors(F, F2);
        this._renderSwatchGrid(F, F2);
        
        // Emit change event
        const selectedColors = this.selectedIndices.map(i => this.palette[i]);
        this.onChange(this.selectedIndices, selectedColors);
    }
    
    // PUBLIC API
    
    getSelectedIndices() {
        return [...this.selectedIndices];
    }
    
    getSelectedColors() {
        return this.selectedIndices.map(i => this.palette[i]);
    }
    
    setSelection(indices) {
        this.selectedIndices = indices.slice(0, this.max);
        const { F, F2 } = this.getF();
        this._renderSelectedColors(F, F2);
        this._renderSwatchGrid(F, F2);
    }
    
    clearSelection() {
        this.selectedIndices = [];
        const { F, F2 } = this.getF();
        this._renderSelectedColors(F, F2);
        this._renderSwatchGrid(F, F2);
    }
    
    destroy() {
        this.childComponents.forEach(comp => comp.destroy());
        this.childComponents = [];
        super.destroy();
    }
}

