/**
 * Section - Collapsible section container
 * 
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class Section extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'section' }, deps);
        
        this.title = options.title ?? '';
        this.collapsible = options.collapsible ?? true;
        this.collapsed = options.collapsed ?? false;
        this.storageKey = options.storageKey ?? null; // localStorage key for state
        
        this.children = options.children ?? [];
        
        this.headerEl = null;
        this.contentEl = null;
        this.toggleIcon = null;
        
        // Load saved state
        if (this.storageKey) {
            const saved = localStorage.getItem(this.storageKey);
            if (saved !== null) {
                this.collapsed = saved === 'true';
            }
        }
    }
    
    render() {
        if (this.element) return this.element;
        
        const { F, F2 } = this.getF();
        
        this.element = this.createElement('div', 'section-container component');
        this.element.style.cssText = `
            border: 1px solid var(--c-border);
            background: var(--c-bg);
        `;
        
        // Header
        this.headerEl = this.createElement('div', 'section-header');
        this.headerEl.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: ${F2}px ${F}px;
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${F}px;
            font-weight: bold;
            color: var(--c-text);
            text-transform: uppercase;
            ${this.collapsible ? 'cursor: pointer;' : ''}
            border-bottom: ${this.collapsed ? 'none' : '1px solid var(--c-border)'};
        `;
        
        const titleEl = this.createElement('span', 'section-title');
        titleEl.textContent = this.title;
        this.headerEl.appendChild(titleEl);
        
        if (this.collapsible) {
            this.toggleIcon = this.createElement('span', 'section-toggle');
            this.toggleIcon.textContent = this.collapsed ? '+' : '−';
            this.toggleIcon.style.cssText = `
                font-size: ${F}px;
                font-weight: normal;
            `;
            this.headerEl.appendChild(this.toggleIcon);
            
            this.headerEl.addEventListener('click', () => this.toggle());
            
            // Hover effect - swap colors for all children
            this.headerEl.addEventListener('mouseenter', () => {
                this.headerEl.style.background = 'var(--c-text)';
                this.headerEl.style.color = 'var(--c-bg)';
                // Also update child text elements
                titleEl.style.color = 'inherit';
                if (this.toggleIcon) this.toggleIcon.style.color = 'inherit';
            });
            this.headerEl.addEventListener('mouseleave', () => {
                this.headerEl.style.background = 'transparent';
                this.headerEl.style.color = 'var(--c-text)';
                titleEl.style.color = 'inherit';
                if (this.toggleIcon) this.toggleIcon.style.color = 'inherit';
            });
        }
        
        this.element.appendChild(this.headerEl);
        
        // Content
        this.contentEl = this.createElement('div', 'section-content');
        this.contentEl.style.cssText = `
            display: ${this.collapsed ? 'none' : 'block'};
            padding: ${F}px;
        `;
        
        this.children.forEach(child => {
            if (child.render) {
                this.contentEl.appendChild(child.render());
            } else if (child instanceof HTMLElement) {
                this.contentEl.appendChild(child);
            }
        });
        
        this.element.appendChild(this.contentEl);
        
        return this.element;
    }
    
    // Public API
    toggle() {
        this.collapsed = !this.collapsed;
        this._updateUI();
        this._saveState();
    }
    
    expand() {
        if (this.collapsed) {
            this.collapsed = false;
            this._updateUI();
            this._saveState();
        }
    }
    
    collapse() {
        if (!this.collapsed) {
            this.collapsed = true;
            this._updateUI();
            this._saveState();
        }
    }
    
    _updateUI() {
        if (this.contentEl) {
            this.contentEl.style.display = this.collapsed ? 'none' : 'block';
        }
        if (this.toggleIcon) {
            this.toggleIcon.textContent = this.collapsed ? '+' : '−';
        }
        if (this.headerEl) {
            this.headerEl.style.borderBottom = this.collapsed 
                ? 'none' 
                : '1px solid var(--c-border)';
        }
    }
    
    _saveState() {
        if (this.storageKey) {
            localStorage.setItem(this.storageKey, String(this.collapsed));
        }
    }
    
    addChild(child) {
        this.children.push(child);
        if (this.contentEl) {
            const childEl = child.render ? child.render() : child;
            this.contentEl.appendChild(childEl);
        }
    }
    
    setTitle(title) {
        this.title = title;
        const titleEl = this.headerEl?.querySelector('.section-title');
        if (titleEl) titleEl.textContent = title;
    }
    
    clear() {
        this.children.forEach(c => c.destroy && c.destroy());
        this.children = [];
        if (this.contentEl) this.contentEl.innerHTML = '';
    }
    
    destroy() {
        // Destroy all children
        this.children.forEach(c => c.destroy && c.destroy());
        // Reset to empty Set before super.destroy() (base expects Set with .clear())
        this.children = new Set();
        super.destroy();
    }
}

