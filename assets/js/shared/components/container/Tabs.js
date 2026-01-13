/**
 * Tabs - Tabbed container component
 * 
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class Tabs extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'tabs' }, deps);
        
        // [{id, label, content: Component|Element}]
        this.tabs = options.tabs ?? [];
        this.activeTab = options.activeTab ?? (this.tabs[0]?.id ?? 0);
        this.storageKey = options.storageKey ?? null;
        
        this.onTabChange = options.onTabChange ?? (() => {});
        
        this.tabBarEl = null;
        this.contentEl = null;
        this.tabButtons = [];
        this.tabPanels = [];
        this._lastParent = null;
        
        // Load saved state
        if (this.storageKey) {
            const saved = localStorage.getItem(this.storageKey);
            if (saved !== null) {
                this.activeTab = saved;
            }
        }
    }
    
    render() {
        if (this.element) return this.element;
        
        const F = this.deps.MF?.F ?? 14;
        
        this.element = this.createElement('div', 'tabs-container component');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            border: 1px solid var(--c-border);
            background: var(--c-bg);
        `;
        
        // Tab bar
        this.tabBarEl = this.createElement('div', 'tabs-bar');
        this.tabBarEl.style.cssText = `
            display: flex;
            border-bottom: 1px solid var(--c-border);
        `;
        
        this.tabButtons = [];
        
        this.tabs.forEach((tab, index) => {
            const tabId = tab.id ?? index;
            const button = this.createElement('button', 'tabs-button');
            button.type = 'button';
            button.textContent = tab.label ?? `Tab ${index + 1}`;
            button.dataset.tabId = tabId;
            
            const isActive = this.activeTab === tabId;
            
            button.style.cssText = `
                flex: 1;
                padding: ${F * 0.5}px ${F}px;
                border: none;
                border-right: 1px solid var(--c-border);
                background: ${isActive ? 'var(--c-text)' : 'var(--c-bg)'};
                color: ${isActive ? 'var(--c-bg)' : 'var(--c-text)'};
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: ${F}px;
                cursor: pointer;
                text-transform: uppercase;
            `;
            
            // Remove border-right from last button
            if (index === this.tabs.length - 1) {
                button.style.borderRight = 'none';
            }
            
            button.addEventListener('click', () => this.setActiveTab(tabId));
            
            if (!isActive) {
                button.addEventListener('mouseenter', () => {
                    button.style.background = 'var(--c-text)';
                    button.style.color = 'var(--c-bg)';
                });
                button.addEventListener('mouseleave', () => {
                    if (this.activeTab !== tabId) {
                        button.style.background = 'var(--c-bg)';
                        button.style.color = 'var(--c-text)';
                    }
                });
            }
            
            this.tabBarEl.appendChild(button);
            this.tabButtons.push(button);
        });
        
        this.element.appendChild(this.tabBarEl);
        
        // Content area
        this.contentEl = this.createElement('div', 'tabs-content');
        this.contentEl.style.cssText = `
            padding: ${F}px;
        `;
        
        this.tabPanels = [];
        
        this.tabs.forEach((tab, index) => {
            const tabId = tab.id ?? index;
            const panel = this.createElement('div', 'tabs-panel');
            panel.dataset.tabId = tabId;
            panel.style.display = this.activeTab === tabId ? 'block' : 'none';
            
            if (tab.content) {
                if (tab.content.render) {
                    panel.appendChild(tab.content.render());
                } else if (tab.content instanceof HTMLElement) {
                    panel.appendChild(tab.content);
                }
            }
            
            this.contentEl.appendChild(panel);
            this.tabPanels.push(panel);
        });
        
        this.element.appendChild(this.contentEl);
        
        return this.element;
    }
    
    // Public API
    setActiveTab(tabId) {
        this.activeTab = tabId;
        
        // Update buttons
        this.tabButtons.forEach((btn, i) => {
            const btnTabId = this.tabs[i].id ?? i;
            const isActive = btnTabId === tabId;
            btn.style.background = isActive ? 'var(--c-text)' : 'var(--c-bg)';
            btn.style.color = isActive ? 'var(--c-bg)' : 'var(--c-text)';
        });
        
        // Update panels
        this.tabPanels.forEach((panel, i) => {
            const panelTabId = this.tabs[i].id ?? i;
            panel.style.display = panelTabId === tabId ? 'block' : 'none';
        });
        
        // Save state
        if (this.storageKey) {
            localStorage.setItem(this.storageKey, String(tabId));
        }
        
        this.onTabChange(tabId);
    }
    
    getActiveTab() {
        return this.activeTab;
    }
    
    addTab(tab) {
        this.tabs.push(tab);
        // Re-render would be needed; for now, recreate component
        if (this.element) {
            const parent = this.element.parentNode || this._lastParent;
            this.element.remove();
            this.element = null;
            this.tabButtons = [];
            this.tabPanels = [];
            const newEl = this.render();
            this._lastParent = parent;
            if (parent) {
                parent.appendChild(newEl);
            }
        }
    }
    
    destroy() {
        this.tabs.forEach(tab => {
            if (tab.content?.destroy) tab.content.destroy();
        });
        super.destroy();
    }
}

