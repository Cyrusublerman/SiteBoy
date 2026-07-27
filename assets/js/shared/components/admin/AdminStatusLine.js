/**
 * AdminStatusLine - Single status readout for admin editors.
 *
 * Tone is a state signal, not decoration: it is exposed as a data attribute
 * so styling stays in CSS.
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export const STATUS_TONES = Object.freeze(['neutral', 'loading', 'success', 'warning', 'error']);

export class AdminStatusLine extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'admin-status-line' }, deps);
        this.message = options.message ?? '';
        this.tone = options.tone ?? 'neutral';
    }

    render() {
        if (this.element) return this.element;
        this.element = this.createElement('p', 'admin-status-line');
        this.element.setAttribute('role', 'status');
        this.setStatus(this.message, this.tone);
        return this.element;
    }

    setStatus(message, tone = 'neutral') {
        this.message = message || '';
        this.tone = STATUS_TONES.includes(tone) ? tone : 'neutral';
        if (!this.element) return;
        this.element.textContent = this.message;
        this.element.dataset.tone = this.tone;
    }

    clear() {
        this.setStatus('', 'neutral');
    }

    getMessage() {
        return this.message;
    }
}
