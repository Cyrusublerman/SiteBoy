import { BaseComponent } from '../../foundation.js';

export class CanvasTabs extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'canvas-tabs' }, deps);
    }

    render() {
        if (this.element) return this.element;
        this.element = this.createElement('div', 'canvas-tabs');
        this.element.textContent = 'Canvas Tabs';
        return this.element;
    }
}