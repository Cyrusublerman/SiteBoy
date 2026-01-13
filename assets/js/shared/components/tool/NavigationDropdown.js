import { BaseComponent } from '../../foundation.js';

export class NavigationDropdown extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'navigation-dropdown' }, deps);
    }

    render() {
        if (this.element) return this.element;
        this.element = this.createElement('select', 'navigation-dropdown');
        this.element.innerHTML = '<option>Navigation</option>';
        return this.element;
    }
}