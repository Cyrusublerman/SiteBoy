/**
 * ToolTabs - Tabbed interface for tool controls
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class ToolTabs extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'tool-tabs' }, deps);

        this.tabs = options.tabs || [];
        this.onTabChange = options.onTabChange || null;
        this.activeTabIndex = 0;
    }

    render() {
        if (this.element) return this.element;

        this.element = this.createElement('div', 'tool-tabs');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
        `;

        // Tab headers
        this.tabHeaders = document.createElement('div');
        this.tabHeaders.style.cssText = `
            display: flex;
            border-bottom: 1px solid var(--c-border);
        `;

        // Tab content
        this.tabContent = document.createElement('div');
        this.tabContent.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 8px;
        `;

        this.element.appendChild(this.tabHeaders);
        this.element.appendChild(this.tabContent);

        this._renderTabs();
        this._showTab(0);

        return this.element;
    }

    _renderTabs() {
        this.tabHeaders.innerHTML = '';

        this.tabs.forEach((tab, index) => {
            const [tabName, content] = tab;

            const tabButton = document.createElement('button');
            tabButton.textContent = tabName;
            tabButton.style.cssText = `
                padding: 8px 16px;
                background: var(--c-bg);
                color: var(--c-text);
                border: 1px solid var(--c-border);
                border-bottom: none;
                cursor: pointer;
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: 12px;
            `;

            if (index === this.activeTabIndex) {
                tabButton.style.background = 'var(--c-text)';
                tabButton.style.color = 'var(--c-bg)';
            }

            tabButton.addEventListener('click', () => this._showTab(index));
            this.tabHeaders.appendChild(tabButton);
        });
    }

    _showTab(index) {
        this.activeTabIndex = index;
        this._renderTabs();

        const [tabName, content] = this.tabs[index];
        this.tabContent.innerHTML = '';

        // For now, just show the tab name
        const contentDiv = document.createElement('div');
        contentDiv.textContent = `Tab content for: ${tabName}`;
        this.tabContent.appendChild(contentDiv);

        if (this.onTabChange) {
            this.onTabChange(index, tabName);
        }
    }
}