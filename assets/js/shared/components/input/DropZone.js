// Duplicate DropZone definition removed to prevent re-declaration of BaseComponent.
/**
 * DropZone - Drag-and-drop file input for tools
 * 
 * Provides a keyboard-accessible drop target plus a hidden file input.
 * Emits an array of File objects via onChange callback.
 * 
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class DropZone extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'dropzone' }, deps);

        this.label = options.label ?? 'Add Files';
        this.accept = options.accept ?? '*/*';
        this.multiple = options.multiple ?? true;
        this.buttonText = options.buttonText ?? 'Choose files';
        this.hint = options.hint ?? 'Drop files here or click to select.';
        this.onChange = options.onChange ?? (() => {});

        this.files = [];
        this.disabled = options.disabled ?? false;
        this.inputEl = null;
        this.zoneEl = null;
    }

    render() {
        if (this.element) return this.element;

        const { F, F2 } = this.getF();

        this.element = this.createElement('div', 'dropzone component');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: ${F2}px;
            width: 100%;
        `;

        const labelEl = this.createElement('label', 'dropzone-label');
        labelEl.textContent = this.label;
        labelEl.style.cssText = `
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${F}px;
            color: var(--c-text);
        `;
        this.element.appendChild(labelEl);

        this.zoneEl = this.createElement('div', 'dropzone-area');
        this.zoneEl.style.cssText = `
            width: 100%;
            min-height: ${F * 5}px;
            border: 1px dashed var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: ${F}px;
            box-sizing: border-box;
            cursor: ${this.disabled ? 'not-allowed' : 'pointer'};
            user-select: none;
        `;
        this.zoneEl.tabIndex = this.disabled ? -1 : 0;
        this.zoneEl.setAttribute('role', 'button');
        this.zoneEl.setAttribute('aria-label', this.label);
        this.zoneEl.textContent = this.hint;

        this.inputEl = this.createElement('input', 'dropzone-input');
        this.inputEl.type = 'file';
        this.inputEl.accept = this.accept;
        this.inputEl.multiple = this.multiple;
        this.inputEl.style.display = 'none';
        this.inputEl.disabled = this.disabled;

        this._wireEvents();

        this.element.appendChild(this.zoneEl);
        this.element.appendChild(this.inputEl);

        return this.element;
    }

    _wireEvents() {
        if (!this.zoneEl || !this.inputEl) return;

        const handleFiles = (fileList) => {
            if (this.disabled) return;
            const files = Array.from(fileList || []).filter(f => this._accepts(f));
            this.files = files;
            this.onChange(files);
        };

        this.zoneEl.addEventListener('click', () => {
            if (this.disabled) return;
            this.inputEl.click();
        });

        this.zoneEl.addEventListener('keypress', (e) => {
            if (this.disabled) return;
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.inputEl.click();
            }
        });

        this.zoneEl.addEventListener('dragover', (e) => {
            if (this.disabled) return;
            e.preventDefault();
            this.zoneEl.style.borderColor = 'var(--c-accent)';
        });

        this.zoneEl.addEventListener('dragleave', () => {
            if (this.disabled) return;
            this.zoneEl.style.borderColor = 'var(--c-border)';
        });

        this.zoneEl.addEventListener('drop', (e) => {
            if (this.disabled) return;
            e.preventDefault();
            this.zoneEl.style.borderColor = 'var(--c-border)';
            handleFiles(e.dataTransfer?.files);
        });

        this.inputEl.addEventListener('change', (e) => {
            handleFiles(e.target.files);
        });
    }

    _accepts(file) {
        if (!this.accept || this.accept === '*/*') return true;
        const tokens = this.accept.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
        if (!tokens.length) return true;
        const type = (file.type || '').toLowerCase();
        const name = (file.name || '').toLowerCase();
        return tokens.some(tok => {
            if (tok.endsWith('/*')) {
                const prefix = tok.replace('/*', '');
                return type.startsWith(prefix);
            }
            if (tok.startsWith('.')) {
                return name.endsWith(tok);
            }
            return type === tok;
        });
    }

    getValue() {
        return this.files;
    }

    setValue(files) {
        this.files = Array.isArray(files) ? files : [];
        this.onChange(this.files);
    }

    setDisabled(disabled) {
        this.disabled = !!disabled;
        if (this.zoneEl) {
            this.zoneEl.style.cursor = this.disabled ? 'not-allowed' : 'pointer';
            this.zoneEl.tabIndex = this.disabled ? -1 : 0;
        }
        if (this.inputEl) this.inputEl.disabled = this.disabled;
    }

    clear() {
        this.files = [];
        if (this.inputEl) this.inputEl.value = '';
    }
}


