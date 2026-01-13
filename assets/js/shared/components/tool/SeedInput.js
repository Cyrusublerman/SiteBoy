import { BaseComponent } from '../../foundation.js';

export class SeedInput extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'seed-input' }, deps);
    }

    render() {
        if (this.element) return this.element;
        this.element = this.createElement('input', 'seed-input');
        this.element.type = 'number';
        this.element.placeholder = 'Seed';
        return this.element;
    }
}