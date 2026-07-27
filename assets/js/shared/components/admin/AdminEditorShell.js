/**
 * AdminEditorShell - Chrome shared by every admin domain editor:
 * title, description, tab strip, status readout and a single content pane.
 *
 * Domain editors own the pane content only; they never rebuild the chrome.
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';
import { Heading, Paragraph } from '../../content.js';
import { AdminTabBar } from './AdminTabBar.js';
import { AdminStatusLine } from './AdminStatusLine.js';

export class AdminEditorShell extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'admin-editor-shell' }, deps);

        this.title = options.title ?? 'EDITOR';
        this.description = options.description ?? '';
        this.className = options.className ?? '';
        this.tabs = options.tabs ?? [];
        this.activeTab = options.activeTab ?? this.tabs[0]?.id ?? null;
        this.ariaLabel = options.ariaLabel ?? 'Editor sections';
        this.onTabChange = options.onTabChange ?? null;

        this.tabBar = null;
        this.statusLine = null;
        this.paneElement = null;
    }

    _adopt(component) {
        this.children.add(component);
        return component;
    }

    render() {
        if (this.element) return this.element;

        const classes = ['admin-editor-shell', this.className].filter(Boolean).join(' ');
        this.element = this.createElement('section', classes);

        const heading = this._adopt(new Heading({ level: 1, content: this.title }, this.deps));
        this.appendElement(this.element, heading.render());

        if (this.description) {
            const intro = this._adopt(new Paragraph({ content: this.description }, this.deps));
            this.appendElement(this.element, intro.render());
        }

        if (this.tabs.length) {
            this.tabBar = this._adopt(new AdminTabBar({
                tabs: this.tabs,
                activeTab: this.activeTab,
                ariaLabel: this.ariaLabel,
                onSelect: (tabId) => {
                    this.activeTab = tabId;
                    this.onTabChange?.(tabId);
                },
            }, this.deps));
            this.appendElement(this.element, this.tabBar.render());
        }

        this.statusLine = this._adopt(new AdminStatusLine({}, this.deps));
        this.appendElement(this.element, this.statusLine.render());

        this.paneElement = this.createElement('div', 'admin-editor-pane');
        this.appendElement(this.element, this.paneElement);

        return this.element;
    }

    getPane() {
        return this.paneElement;
    }

    clearPane() {
        this.clearElement(this.paneElement);
    }

    selectTab(tabId) {
        this.tabBar?.selectTab(tabId);
    }

    getActiveTab() {
        return this.tabBar ? this.tabBar.getActiveTab() : this.activeTab;
    }

    setStatus(message, tone = 'neutral') {
        this.statusLine?.setStatus(message, tone);
    }

    destroy() {
        this.tabBar = null;
        this.statusLine = null;
        this.paneElement = null;
        super.destroy();
    }
}
