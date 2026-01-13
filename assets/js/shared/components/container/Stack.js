/**
 * Stack - Vertical or horizontal stack container
 * 
 * Simplified container for common stacking patterns.
 * 
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class Stack extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'stack' }, deps);
        
        this.direction = options.direction ?? 'column'; // 'row' | 'column'
        this.gap = options.gap ?? 1; // In F units
        this.align = options.align ?? 'stretch'; // 'start' | 'center' | 'end' | 'stretch'
        this.padding = options.padding ?? 0; // In F units
        
        this.children = options.children ?? [];
    }
    
    render() {
        if (this.element) return this.element;
        
        const F = this.deps.MF?.F ?? 14;
        
        this.element = this.createElement('div', 'stack-container component');
        
        const alignMap = {
            'start': 'flex-start',
            'center': 'center',
            'end': 'flex-end',
            'stretch': 'stretch'
        };
        
        this.element.style.cssText = `
            display: flex;
            flex-direction: ${this.direction};
            gap: ${this.gap * F}px;
            align-items: ${alignMap[this.align] ?? 'stretch'};
            ${this.padding > 0 ? `padding: ${this.padding * F}px;` : ''}
        `;
        
        this.children.forEach(child => {
            if (child.render) {
                this.element.appendChild(child.render());
            } else if (child instanceof HTMLElement) {
                this.element.appendChild(child);
            }
        });
        
        return this.element;
    }
    
    addChild(child) {
        this.children.push(child);
        if (this.element) {
            const childEl = child.render ? child.render() : child;
            this.element.appendChild(childEl);
        }
    }
    
    clear() {
        this.children.forEach(c => c.destroy && c.destroy());
        this.children = [];
        if (this.element) this.element.innerHTML = '';
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

