/**
 * AdminDomainEditor - Base class for every admin domain editor.
 *
 * Owns the shell lifecycle and pane component tracking so a domain editor
 * declares tabs, supplies a renderer per tab, and nothing else.
 *
 * Subclass contract:
 *   tabRenderers()  → { [tabId]: () => void }   render into this.pane
 *   afterRender()   → optional hook run once the chrome is mounted
 *   onTabChange(id) → optional hook run before the new tab renders
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';
import { AdminEditorShell } from './AdminEditorShell.js';

export class AdminDomainEditor extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: options.componentType ?? 'admin-domain-editor' }, deps);

        this.title = options.title ?? 'EDITOR';
        this.description = options.description ?? '';
        this.shellClassName = options.shellClassName ?? '';
        this.tabs = options.tabs ?? [];
        this.activeTab = options.activeTab ?? this.tabs[0]?.id ?? null;

        this.shell = null;
        this.paneComponents = [];
    }

    /** @returns {Record<string, () => void>} */
    tabRenderers() {
        return {};
    }

    afterRender() {}

    onTabChange() {}

    get pane() {
        return this.shell?.getPane() ?? null;
    }

    render() {
        if (this.element) return this.element;

        this.shell = new AdminEditorShell({
            title: this.title,
            description: this.description,
            className: this.shellClassName,
            tabs: this.tabs,
            activeTab: this.activeTab,
            ariaLabel: `${this.title} sections`,
            onTabChange: (tabId) => this._onTabChange(tabId),
        }, this.deps);
        this.children.add(this.shell);
        this.element = this.shell.render();

        this.renderActiveTab();
        this.afterRender();
        return this.element;
    }

    _onTabChange(tabId) {
        this.activeTab = tabId;
        this.onTabChange(tabId);
        this.renderActiveTab();
    }

    selectTab(tabId) {
        this.shell?.selectTab(tabId);
    }

    setStatus(message, tone = 'neutral') {
        this.shell?.setStatus(message, tone);
    }

    /** Track a component for the current pane; pane-scoped by default. */
    track(component, { pane = true } = {}) {
        this.children.add(component);
        if (pane) this.paneComponents.push(component);
        return component;
    }

    /** Create, track and mount a component in one step. */
    append(parent, component, options = {}) {
        const tracked = this.track(component, options);
        this.appendElement(parent, tracked.render());
        return tracked;
    }

    clearPane() {
        for (const component of this.paneComponents) {
            this.children.delete(component);
            component.destroy?.();
        }
        this.paneComponents = [];
        this.shell?.clearPane();
    }

    renderActiveTab() {
        if (!this.pane) return;
        this.clearPane();
        this.tabRenderers()[this.activeTab]?.();
    }

    destroy() {
        this.paneComponents = [];
        this.shell = null;
        super.destroy();
    }
}
