/**
 * AdminTabBar - Equal-width tab strip for admin editors.
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

/** Sidebar/editor tab ceiling. See .cursor/rules/rules.mdc "Tab Limit". */
export const MAX_ADMIN_TABS = 4;

export class AdminTabBar extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'admin-tab-bar' }, deps);

        this.tabs = options.tabs ?? [];
        if (this.tabs.length > MAX_ADMIN_TABS) {
            throw new Error(`AdminTabBar accepts at most ${MAX_ADMIN_TABS} tabs, received ${this.tabs.length}`);
        }
        this.activeTab = options.activeTab ?? this.tabs[0]?.id ?? null;
        this.ariaLabel = options.ariaLabel ?? 'Editor sections';
        this.onSelect = options.onSelect ?? null;
        this.cells = new Map();
    }

    render() {
        if (this.element) return this.element;

        this.element = this.createElement('nav', 'admin-tab-bar');
        this.element.setAttribute('aria-label', this.ariaLabel);

        for (const tab of this.tabs) {
            const cell = this.createElement('button', 'admin-tab-bar-cell');
            cell.type = 'button';
            cell.textContent = tab.label;
            cell.dataset.tab = tab.id;
            if (tab.description) cell.title = tab.description;
            cell.addEventListener('click', () => this.selectTab(tab.id));
            this.appendElement(this.element, cell);
            this.cells.set(tab.id, cell);
        }

        this._syncState();
        return this.element;
    }

    _syncState() {
        for (const [id, cell] of this.cells) {
            const active = id === this.activeTab;
            cell.classList.toggle('is-active', active);
            cell.setAttribute('aria-pressed', String(active));
        }
    }

    selectTab(tabId) {
        if (!this.tabs.some((tab) => tab.id === tabId)) return;
        const changed = this.activeTab !== tabId;
        this.activeTab = tabId;
        this._syncState();
        if (changed) this.onSelect?.(tabId);
    }

    getActiveTab() {
        return this.activeTab;
    }

    destroy() {
        this.cells.clear();
        super.destroy();
    }
}
