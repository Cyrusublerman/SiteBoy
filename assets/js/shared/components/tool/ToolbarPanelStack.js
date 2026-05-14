/**
 * ToolbarPanelStack — vertical stack container for dropdown panel bodies (ToolToolbar).
 *
 * @extends BaseComponent
 */
import { BaseComponent } from '../../foundation.js';

export class ToolbarPanelStack extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'toolbar-panel-stack' }, deps);
        this.childrenElements = options.childrenElements ?? [];
    }

    render() {
        if (this.element) return this.element;

        const { F, F2 } = this.getF();

        this.element = this.createElement('div', 'toolbar-panel-stack');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: ${F2}px;
            box-sizing: border-box;
            padding: ${F}px;
        `;

        for (const child of this.childrenElements) {
            if (child) this.element.appendChild(child);
        }

        return this.element;
    }
}
