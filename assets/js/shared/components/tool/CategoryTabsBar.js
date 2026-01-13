import { BaseComponent } from '../../foundation.js';

/**
 * CategoryTabsBar - Horizontal bar with category buttons
 * Used for page/category selection in tools like AlgorithmsTestLab
 * Scrolls via edge-hover (no visible scrollbar)
 */
export class CategoryTabsBar extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'category-tabs-bar' }, deps);
        
        this.categories = options.categories || []; // [{id, title}, ...]
        this.activeCategory = options.activeCategory || (this.categories[0]?.id);
        this.onCategoryChange = options.onCategoryChange || (() => {});
        
        this.categoryButtons = [];
        this.scrollInterval = null;
    }

    render() {
        if (this.element) return this.element;
        
        const F = this.deps.MF?.F || 14;
        
        this.element = this.createElement('div', 'category-tabs-bar');
        this.element.style.cssText = `
            display: flex;
            width: 100%;
            flex-shrink: 0;
            position: relative;
        `;
        
        // Category row (page selection) - hidden scrollbar, edge-scroll
        if (this.categories.length > 0) {
            const categoryRow = this.createElement('div', 'category-row');
            categoryRow.style.cssText = `
                display: flex;
                border-bottom: 1px solid var(--c-border);
                overflow-x: scroll;
                overflow-y: hidden;
                flex-shrink: 0;
                flex: 1;
                scrollbar-width: none;
                -ms-overflow-style: none;
            `;
            // Hide webkit scrollbar
            const style = document.createElement('style');
            style.textContent = `.category-row::-webkit-scrollbar { display: none; }`;
            this.element.appendChild(style);
            
            this.categories.forEach(cat => {
                const btn = this.createElement('button', 'category-btn');
                btn.type = 'button';
                btn.textContent = cat.title.toUpperCase();
                const isActive = cat.id === this.activeCategory;
                
                btn.style.cssText = `
                    padding: ${F * 0.5}px ${F}px;
                    border: none;
                    border-right: 1px solid var(--c-border);
                    background: ${isActive ? 'var(--c-text)' : 'var(--c-bg)'};
                    color: ${isActive ? 'var(--c-bg)' : 'var(--c-text)'};
                    font-family: 'Atkinson Hyperlegible', monospace;
                    font-size: ${F * 0.85}px;
                    text-transform: uppercase;
                    cursor: pointer;
                    white-space: nowrap;
                    flex-shrink: 0;
                `;
                
                btn.addEventListener('click', () => {
                    this.setActiveCategory(cat.id);
                    this.onCategoryChange(cat.id);
                });
                
                btn.addEventListener('mouseenter', () => {
                    if (cat.id !== this.activeCategory) {
                        btn.style.background = 'var(--vga-gray)';
                    }
                });
                
                btn.addEventListener('mouseleave', () => {
                    if (cat.id !== this.activeCategory) {
                        btn.style.background = 'var(--c-bg)';
                    }
                });
                
                this.categoryButtons.push({ id: cat.id, element: btn });
                categoryRow.appendChild(btn);
            });
            
            // Edge-scroll on hover
            this._setupEdgeScroll(categoryRow);
            
            this.element.appendChild(categoryRow);
            this.categoryRow = categoryRow;
        }
        
        return this.element;
    }
    
    _setupEdgeScroll(container) {
        const EDGE_ZONE = 40; // pixels from edge to trigger scroll
        const SCROLL_SPEED = 3; // pixels per frame
        
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            
            // Clear existing interval
            if (this.scrollInterval) {
                clearInterval(this.scrollInterval);
                this.scrollInterval = null;
            }
            
            // Left edge - scroll left
            if (x < EDGE_ZONE && container.scrollLeft > 0) {
                this.scrollInterval = setInterval(() => {
                    container.scrollLeft -= SCROLL_SPEED;
                    if (container.scrollLeft <= 0) {
                        clearInterval(this.scrollInterval);
                        this.scrollInterval = null;
                    }
                }, 16);
            }
            // Right edge - scroll right
            else if (x > width - EDGE_ZONE) {
                const maxScroll = container.scrollWidth - container.clientWidth;
                if (container.scrollLeft < maxScroll) {
                    this.scrollInterval = setInterval(() => {
                        container.scrollLeft += SCROLL_SPEED;
                        if (container.scrollLeft >= maxScroll) {
                            clearInterval(this.scrollInterval);
                            this.scrollInterval = null;
                        }
                    }, 16);
                }
            }
        });
        
        container.addEventListener('mouseleave', () => {
            if (this.scrollInterval) {
                clearInterval(this.scrollInterval);
                this.scrollInterval = null;
            }
        });
    }
    
    setActiveCategory(categoryId) {
        this.activeCategory = categoryId;
        this.categoryButtons.forEach(({ id, element }) => {
            const isActive = id === categoryId;
            element.style.background = isActive ? 'var(--c-text)' : 'var(--c-bg)';
            element.style.color = isActive ? 'var(--c-bg)' : 'var(--c-text)';
        });
    }
    
    destroy() {
        if (this.scrollInterval) {
            clearInterval(this.scrollInterval);
            this.scrollInterval = null;
        }
        super.destroy();
    }
}