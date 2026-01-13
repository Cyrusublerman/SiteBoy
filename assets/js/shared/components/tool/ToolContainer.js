/**
 * ToolContainer - Main tool viewport wrapper
 *
 * Provides the root container for tool interfaces with proper viewport constraints
 * and responsive layout handling.
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class ToolContainer extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'tool-container' }, deps);

        this.orientation = options.orientation || 'auto'; // 'landscape', 'portrait', or 'auto'
        this.onOrientationChange = options.onOrientationChange || null;
    }

    render() {
        if (this.element) return this.element;

        this.element = this.createElement('div', 'tool-viewport');
        this.element.style.cssText = `
            display: flex;
            width: 100%;
            height: 100%;
            flex-direction: column;
        `;
        this.element.setAttribute('data-orientation', this.orientation);

        // Listen for resize to handle orientation changes
        this.subscribeToResize();

        return this.element;
    }

    onResize(event) {
        if (this.orientation === 'auto') {
            const isPortrait = window.innerWidth < window.innerHeight || window.innerWidth < 800;
            const newOrientation = isPortrait ? 'portrait' : 'landscape';
            const currentOrientation = this.element.getAttribute('data-orientation');

            if (newOrientation !== currentOrientation) {
                this.element.setAttribute('data-orientation', newOrientation);
                if (this.onOrientationChange) {
                    this.onOrientationChange(newOrientation, event);
                }
            }
        }
    }

    getOrientation() {
        return this.element.getAttribute('data-orientation') || this.orientation;
    }

    setOrientation(orientation) {
        this.orientation = orientation;
        if (this.element) {
            this.element.setAttribute('data-orientation', orientation);
        }
    }
}