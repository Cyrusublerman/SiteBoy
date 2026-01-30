import { BaseComponent } from '../../foundation.js';

/**
 * CanvasModeTabs - Simple tab switcher for canvas modes (OUTPUT/ABOUT)
 * 
 * Simpler than CategoryTabsBar - no scrolling, just 2-3 full-width tabs.
 * Used for toggling between canvas output and documentation panels.
 */
export class CanvasModeTabs extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'canvas-mode-tabs' }, deps);
        
        this.tabs = options.tabs || []; // [{id, label}, ...]
        this.activeTab = options.activeTab || (this.tabs[0]?.id);
        this.onChange = options.onChange || (() => {});
        
        this.tabButtons = [];
    }

    render() {
        if (this.element) return this.element;
        
        const F = this.deps.MF?.F || 14;
        
        this.element = this.createElement('div', 'canvas-mode-tabs');
        this.element.style.cssText = `
            display: flex;
            width: 100%;
            border-bottom: 1px solid var(--c-border);
            flex-shrink: 0;
        `;
        
        this.tabs.forEach((tab, index) => {
            const btn = this.createElement('button', 'canvas-mode-tabs__btn');
            btn.type = 'button';
            btn.textContent = tab.label;
            const isActive = tab.id === this.activeTab;
            
            btn.style.cssText = `
                flex: 1;
                height: ${F * 2}px;
                padding: 0 ${F}px;
                border: none;
                ${index < this.tabs.length - 1 ? 'border-right: 1px solid var(--c-border);' : ''}
                background: ${isActive ? 'var(--c-text)' : 'var(--c-bg)'};
                color: ${isActive ? 'var(--c-bg)' : 'var(--c-text)'};
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: ${F}px;
                text-transform: uppercase;
                cursor: pointer;
            `;
            
            btn.addEventListener('click', () => {
                this.setActiveTab(tab.id);
                this.onChange(tab.id);
            });
            
            btn.addEventListener('mouseenter', () => {
                if (tab.id !== this.activeTab) {
                    btn.style.background = 'var(--vga-gray)';
                }
            });
            
            btn.addEventListener('mouseleave', () => {
                if (tab.id !== this.activeTab) {
                    btn.style.background = 'var(--c-bg)';
                }
            });
            
            this.tabButtons.push({ id: tab.id, element: btn });
            this.element.appendChild(btn);
        });
        
        return this.element;
    }
    
    setActiveTab(tabId) {
        this.activeTab = tabId;
        
        this.tabButtons.forEach(({ id, element }) => {
            const isActive = id === tabId;
            element.style.background = isActive ? 'var(--c-text)' : 'var(--c-bg)';
            element.style.color = isActive ? 'var(--c-bg)' : 'var(--c-text)';
        });
    }
    
    destroy() {
        this.tabButtons = [];
        super.destroy();
    }
}

