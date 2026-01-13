/**
 * Grid - Flexible grid/flex container component
 * 
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class Grid extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'grid' }, deps);
        
        // Layout mode
        this.mode = options.mode ?? 'grid'; // 'grid' | 'flex'
        
        // Grid options
        this.columns = options.columns ?? 2;
        this.rows = options.rows ?? null; // Auto if not specified
        this.gap = options.gap ?? 1; // In F units (0 for shared borders)
        this.sharedBorders = options.sharedBorders ?? false; // Collapse borders between children
        
        // Flex options
        this.direction = options.direction ?? 'row'; // 'row' | 'column'
        this.wrap = options.wrap ?? true;
        this.justify = options.justify ?? 'start'; // 'start' | 'center' | 'end' | 'between' | 'around'
        this.align = options.align ?? 'start'; // 'start' | 'center' | 'end' | 'stretch'
        
        // Children
        this.children = options.children ?? [];
    }
    
    render() {
        if (this.element) return this.element;
        
        const F = this.deps.MF?.F ?? 14;
        
        this.element = this.createElement('div', 'grid-container component');
        
        const gapPx = this.sharedBorders ? 0 : this.gap * F;
        
        if (this.mode === 'grid') {
            this.element.style.cssText = `
                display: grid;
                grid-template-columns: repeat(${this.columns}, 1fr);
                ${this.rows ? `grid-template-rows: repeat(${this.rows}, auto);` : ''}
                gap: ${gapPx}px;
                ${this.sharedBorders ? 'border: 1px solid var(--c-border);' : ''}
            `;
        } else {
            const justifyMap = {
                'start': 'flex-start',
                'center': 'center',
                'end': 'flex-end',
                'between': 'space-between',
                'around': 'space-around'
            };
            const alignMap = {
                'start': 'flex-start',
                'center': 'center',
                'end': 'flex-end',
                'stretch': 'stretch'
            };
            
            this.element.style.cssText = `
                display: flex;
                flex-direction: ${this.direction};
                flex-wrap: ${this.wrap ? 'wrap' : 'nowrap'};
                justify-content: ${justifyMap[this.justify] ?? 'flex-start'};
                align-items: ${alignMap[this.align] ?? 'flex-start'};
                gap: ${gapPx}px;
            `;
        }
        
        // Render children
        this.children.forEach((child, index) => {
            let childEl;
            if (child.render) {
                childEl = child.render();
            } else if (child instanceof HTMLElement) {
                childEl = child;
            }
            
            // Apply shared border styling if enabled
            if (childEl && this.sharedBorders) {
                const col = index % this.columns;
                const row = Math.floor(index / this.columns);
                
                // Each cell has right and bottom border; container has left and top via its own border
                childEl.style.borderRight = '1px solid var(--c-border)';
                childEl.style.borderBottom = '1px solid var(--c-border)';
                childEl.style.borderTop = 'none';
                childEl.style.borderLeft = 'none';
                childEl.style.boxSizing = 'border-box';
            }
            
            if (childEl) this.element.appendChild(childEl);
        });
        
        return this.element;
    }
    
    // Public API
    addChild(child, index = -1) {
        if (index < 0 || index >= this.children.length) {
            this.children.push(child);
        } else {
            this.children.splice(index, 0, child);
        }
        
        if (this.element) {
            const childEl = child.render ? child.render() : child;
            if (index < 0 || index >= this.element.children.length) {
                this.element.appendChild(childEl);
            } else {
                this.element.insertBefore(childEl, this.element.children[index]);
            }
        }
    }
    
    removeChild(index) {
        if (index >= 0 && index < this.children.length) {
            const child = this.children.splice(index, 1)[0];
            if (child.destroy) child.destroy();
            if (this.element && this.element.children[index]) {
                this.element.children[index].remove();
            }
        }
    }
    
    clear() {
        this.children.forEach(c => c.destroy && c.destroy());
        this.children = [];
        if (this.element) this.element.innerHTML = '';
    }
    
    setColumns(columns) {
        this.columns = columns;
        if (this.element && this.mode === 'grid') {
            this.element.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        }
    }
    
    destroy() {
        // Destroy all children (children is an array in this component)
        for (const child of this.children) {
            if (child && typeof child.destroy === 'function') {
                child.destroy();
            }
        }
        this.children = [];
        super.destroy();
    }
}

