import { BaseComponent } from '../../foundation.js';
import { AnimationLoop } from '../../../core/animation-foundation.js';

/**
 * CategoryTabsBar - Horizontal bar with category buttons
 * Used for page/category selection in tools like AlgorithmsTestLab
 * Supports optional visible scrollbar or edge-hover scrolling
 */
export class CategoryTabsBar extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'category-tabs-bar' }, deps);
        
        this.categories = options.categories || []; // [{id, title}, ...]
        this.activeCategory = options.activeCategory || (this.categories[0]?.id);
        this.onCategoryChange = options.onCategoryChange || (() => {});
        this.showScrollbar = options.showScrollbar ?? false;  // Show visible scrollbar
        
        this.categoryButtons = [];
        this.scrollAnimator = null;
        this.scrollDirection = null;
        this.scrollbar = null;
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
        
        // Category row (page selection)
        if (this.categories.length > 0) {
            // Wrapper for scrollbar positioning
            const wrapper = this.createElement('div', 'category-wrapper');
            wrapper.style.cssText = `
                position: relative;
                display: flex;
                flex-direction: column;
                width: 100%;
                flex-shrink: 0;
            `;
            
            const categoryRow = this.createElement('div', 'category-row');
            
            if (this.showScrollbar) {
                // Visible scrollbar mode
                categoryRow.style.cssText = `
                    display: flex;
                    border-bottom: 1px solid var(--c-border);
                    overflow-x: auto;
                    overflow-y: hidden;
                    flex-shrink: 0;
                    flex: 1;
                    scrollbar-width: thin;
                `;
            } else {
                // Hidden scrollbar mode (original)
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
            }
            
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
            
            wrapper.appendChild(categoryRow);
            
            // Setup edge-scroll with AnimationFoundation
            if (!this.showScrollbar) {
                this._setupEdgeScroll(categoryRow);
            }
            
            this.element.appendChild(wrapper);
            this.categoryRow = categoryRow;
        }
        
        return this.element;
    }
    
    _setupEdgeScroll(container) {
        const EDGE_ZONE = 40; // pixels from edge to trigger scroll
        const SCROLL_SPEED = 3; // pixels per frame
        
        // Use AnimationLoop instead of setInterval
        this.scrollAnimator = new AnimationLoop({
            onFrame: () => {
                if (this.scrollDirection === 'left' && container.scrollLeft > 0) {
                    container.scrollLeft -= SCROLL_SPEED;
                    if (container.scrollLeft <= 0) {
                        this.scrollAnimator.stop();
                    }
                } else if (this.scrollDirection === 'right') {
                    const maxScroll = container.scrollWidth - container.clientWidth;
                    if (container.scrollLeft < maxScroll) {
                        container.scrollLeft += SCROLL_SPEED;
                        if (container.scrollLeft >= maxScroll) {
                            this.scrollAnimator.stop();
                        }
                    } else {
                        this.scrollAnimator.stop();
                    }
                }
            }
        });
        
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            
            const maxScroll = container.scrollWidth - container.clientWidth;
            
            // Left edge - scroll left
            if (x < EDGE_ZONE && container.scrollLeft > 0) {
                this.scrollDirection = 'left';
                if (!this.scrollAnimator.isRunning) {
                    this.scrollAnimator.start();
                }
            }
            // Right edge - scroll right
            else if (x > width - EDGE_ZONE && container.scrollLeft < maxScroll) {
                this.scrollDirection = 'right';
                if (!this.scrollAnimator.isRunning) {
                    this.scrollAnimator.start();
                }
            }
            // Middle - stop scrolling
            else {
                this.scrollDirection = null;
                if (this.scrollAnimator.isRunning) {
                    this.scrollAnimator.stop();
                }
            }
        });
        
        container.addEventListener('mouseleave', () => {
            this.scrollDirection = null;
            if (this.scrollAnimator && this.scrollAnimator.isRunning) {
                this.scrollAnimator.stop();
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
        if (this.scrollAnimator) {
            this.scrollAnimator.destroy();
            this.scrollAnimator = null;
        }
        if (this.scrollbar) {
            this.scrollbar.destroy();
            this.scrollbar = null;
        }
        super.destroy();
    }
}