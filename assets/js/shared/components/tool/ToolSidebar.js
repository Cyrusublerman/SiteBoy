/**
 * ToolSidebar - Sidebar container for tool controls
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class ToolSidebar extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'tool-sidebar' }, deps);
    }

    render() {
        if (this.element) return this.element;

        this.element = this.createElement('div', 'tool-sidebar');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            overflow-y: auto;
        `;

        return this.element;
    }

    addContent(content) {
        if (typeof content === 'string') {
            this.element.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            this.element.appendChild(content);
        } else if (content && content.render) {
            this.element.appendChild(content.render());
        }
    }
}