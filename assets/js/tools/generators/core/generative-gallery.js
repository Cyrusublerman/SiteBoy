/**
 * Gallery Component - Grid view of all generative scripts
 * 
 * Displays script cards organized by category with thumbnails and filtering.
 * 
 * @extends BaseComponent
 * @version 1.0.0
 */

import { BaseComponent } from '../../../shared/foundation.js';
import ScriptRegistry from './script-registry.js';

export class GenerativeGallery extends BaseComponent {
    constructor(container, deps = {}) {
        super({ componentType: 'generative-gallery' }, deps);
        
        this.container = container;
        this.deps = deps;
        this.currentCategory = 'all';
        this.searchQuery = '';
        
        this.render();
    }
    
    /**
     * Render gallery
     */
    async render() {
        window.debugLog('TOOLS', '🎨 Rendering generative gallery');
        
        const F = this.getF().F;
        
        // Create gallery container - no padding, fills container
        const gallery = this.createElement('div', 'generative-gallery');
        gallery.style.cssText = `
            width: 100%;
            height: 100%;
            overflow-y: auto;
            overflow-x: hidden;
        `;
        
        // Inner wrapper for content
        const inner = this.createElement('div', 'gallery-inner');
        inner.style.cssText = `
            width: 100%;
        `;
        
        // Category filter - no gap
        const filterBar = this.createElement('div', 'gallery-filter');
        filterBar.style.cssText = `
            display: flex;
            border-bottom: 1px solid var(--c-border);
            background: var(--c-bg);
        `;
        
        const categories = ScriptRegistry.getCategories();
        const allButton = this.createFilterButton('all', 'All');
        filterBar.appendChild(allButton);
        
        for (const [id, cat] of Object.entries(categories)) {
            const btn = this.createFilterButton(id, cat.name);
            filterBar.appendChild(btn);
        }
        
        // Grid - no gap
        const grid = this.createElement('div', 'gallery-grid');
        grid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(calc(var(--f) * 18), 1fr));
            gap: 0;
        `;
        
        // Load script cards
        await this.populateGrid(grid);
        
        // Assemble
        inner.appendChild(filterBar);
        inner.appendChild(grid);
        gallery.appendChild(inner);
        
        this.container.innerHTML = '';
        this.container.appendChild(gallery);
        
        this.gridElement = grid;
        this.filterElement = filterBar;
        
        window.debugLog('TOOLS', '✅ Gallery rendered');
    }
    
    /**
     * Create filter button
     */
    createFilterButton(categoryId, label) {
        const btn = this.createElement('button', 'filter-btn');
        btn.textContent = label;
        btn.style.cssText = `
            padding: calc(var(--f) * 0.71) calc(var(--f) * 1);
            background: ${this.currentCategory === categoryId ? 'var(--c-accent)' : 'var(--c-bg)'};
            color: ${this.currentCategory === categoryId ? 'var(--c-bg)' : 'var(--c-text)'};
            border: none;
            border-right: 1px solid var(--c-border);
            cursor: pointer;
            font-family: var(--font-mono);
            font-size: calc(var(--f) * 0.86);
            flex: 1;
        `;
        
        btn.addEventListener('click', () => {
            this.currentCategory = categoryId;
            this.updateGrid();
        });
        
        btn.addEventListener('mouseenter', () => {
            if (this.currentCategory !== categoryId) {
                btn.style.background = 'var(--c-bg-alt)';
            }
        });
        
        btn.addEventListener('mouseleave', () => {
            if (this.currentCategory !== categoryId) {
                btn.style.background = 'var(--c-bg)';
            }
        });
        
        return btn;
    }
    
    /**
     * Populate grid with script cards
     */
    async populateGrid(grid) {
        const scripts = ScriptRegistry.list();
        const byCategory = ScriptRegistry.getByCategory();
        
        for (const scriptId of scripts) {
            // Get category
            let category = 'other';
            for (const [cat, ids] of Object.entries(byCategory)) {
                if (ids.includes(scriptId)) {
                    category = cat;
                    break;
                }
            }
            
            // Filter by current category
            if (this.currentCategory !== 'all' && category !== this.currentCategory) {
                continue;
            }
            
            const card = await this.createScriptCard(scriptId, category);
            grid.appendChild(card);
        }
    }
    
    /**
     * Create script card
     */
    async createScriptCard(scriptId, category) {
        const meta = ScriptRegistry.getMetadata(scriptId);
        
        const card = this.createElement('div', 'script-card');
        card.style.cssText = `
            background: var(--c-bg);
            border: 1px solid var(--c-border);
            border-left: none;
            border-top: none;
            padding: calc(var(--f) * 1);
            cursor: pointer;
            aspect-ratio: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
        `;
        
        card.addEventListener('mouseenter', () => {
            card.style.background = 'var(--c-bg-alt)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.background = 'var(--c-bg)';
        });
        
        card.addEventListener('click', () => {
            this.openScript(scriptId);
        });
        
        // Title
        const title = this.createElement('div', 'script-title');
        title.textContent = meta.title;
        title.style.cssText = `
            font-size: calc(var(--f) * 1);
            color: var(--c-text);
            margin-bottom: calc(var(--f) * 0.5);
        `;
        
        // Category badge
        const badge = this.createElement('div', 'script-category');
        badge.textContent = category.toUpperCase();
        badge.style.cssText = `
            font-size: calc(var(--f) * 0.71);
            color: var(--c-text-dim);
        `;
        
        card.appendChild(title);
        card.appendChild(badge);
        
        return card;
    }
    
    /**
     * Update grid based on current filter
     */
    async updateGrid() {
        if (!this.gridElement) return;
        
        // Clear grid
        this.gridElement.innerHTML = '';
        
        // Repopulate
        await this.populateGrid(this.gridElement);
        
        // Update filter buttons
        const buttons = this.filterElement.querySelectorAll('.filter-btn');
        buttons.forEach((btn, index) => {
            const categories = ['all', ...Object.keys(ScriptRegistry.getCategories())];
            const isActive = categories[index] === this.currentCategory;
            
            btn.style.background = isActive ? 'var(--c-accent)' : 'var(--c-bg-alt)';
            btn.style.color = isActive ? 'var(--c-bg)' : 'var(--c-text)';
        });
    }
    
    /**
     * Open script in host
     */
    openScript(scriptId) {
        window.debugLog('TOOLS', `🎨 Opening script: ${scriptId}`);
        console.log('Gallery: Navigating to #tools/generators?script=' + scriptId);
        
        // Navigate to generators route with script param
        window.location.hash = `#tools/generators?script=${scriptId}`;
    }
    
    /**
     * Cleanup
     */
    destroy() {
        window.debugLog('TOOLS', '🗑️ Destroying gallery');
        super.destroy();
    }
}

export default GenerativeGallery;
