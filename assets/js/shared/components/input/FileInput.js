/**
 * FileInput - File picker component
 * 
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class FileInput extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'file-input' }, deps);
        
        this.label = options.label ?? 'Choose File';
        this.accept = options.accept ?? '*/*';
        this.multiple = options.multiple ?? false;
        this.buttonText = options.buttonText ?? 'Browse...';
        
        this.onChange = options.onChange ?? (() => {});
        
        this.files = null;
        this.inputEl = null;
        this.filenameEl = null;
    }
    
    render() {
        if (this.element) return this.element;
        
        const { F, F2 } = this.getF();
        
        this.element = this.createElement('div', 'file-input component');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: ${F2}px;
            width: 100%;
        `;
        
        if (this.label) {
            const labelEl = this.createElement('label', 'file-input-label');
            labelEl.textContent = this.label;
            labelEl.style.cssText = `
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: ${F}px;
                color: var(--c-text);
            `;
            this.element.appendChild(labelEl);
        }
        
        const row = this.createElement('div', 'file-input-row');
        row.style.cssText = `
            display: flex;
            align-items: center;
            gap: ${F2}px;
        `;
        
        // Hidden file input
        this.inputEl = this.createElement('input', 'file-input-hidden');
        this.inputEl.type = 'file';
        this.inputEl.accept = this.accept;
        this.inputEl.multiple = this.multiple;
        this.inputEl.style.display = 'none';
        
        this.inputEl.addEventListener('change', (e) => {
            this.files = e.target.files;
            this._updateFilename();
            if (this.files.length > 0) {
                this.onChange(this.multiple ? this.files : this.files[0]);
            }
        });
        
        // Styled button
        const button = this.createElement('button', 'file-input-button');
        button.type = 'button';
        button.textContent = this.buttonText;
        button.style.cssText = `
            height: ${F * 2}px;
            padding: 0 ${F}px;
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${F}px;
            cursor: pointer;
        `;
        
        button.addEventListener('click', () => this.inputEl.click());
        
        button.addEventListener('mouseenter', () => {
            button.style.background = 'var(--c-text)';
            button.style.color = 'var(--c-bg)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.background = 'var(--c-bg)';
            button.style.color = 'var(--c-text)';
        });
        
        // Filename display
        this.filenameEl = this.createElement('span', 'file-input-filename');
        this.filenameEl.textContent = 'No file selected';
        this.filenameEl.style.cssText = `
            flex: 1;
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${F}px;
            color: var(--c-text);
            opacity: 0.7;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        `;
        
        row.appendChild(this.inputEl);
        row.appendChild(button);
        row.appendChild(this.filenameEl);
        this.element.appendChild(row);
        
        return this.element;
    }
    
    _updateFilename() {
        if (!this.filenameEl) return;
        
        if (!this.files || this.files.length === 0) {
            this.filenameEl.textContent = 'No file selected';
            this.filenameEl.style.opacity = '0.7';
        } else if (this.files.length === 1) {
            this.filenameEl.textContent = this.files[0].name;
            this.filenameEl.style.opacity = '1';
        } else {
            this.filenameEl.textContent = `${this.files.length} files selected`;
            this.filenameEl.style.opacity = '1';
        }
    }
    
    getFiles() {
        return this.files;
    }
    
    clear() {
        if (this.inputEl) this.inputEl.value = '';
        this.files = null;
        this._updateFilename();
    }
    
    /**
     * Set the displayed filename (for programmatic updates like imports)
     */
    setFilename(name) {
        if (!this.filenameEl) return;
        
        if (name) {
            this.filenameEl.textContent = name;
            this.filenameEl.style.opacity = '1';
        } else {
            this.filenameEl.textContent = 'No file selected';
            this.filenameEl.style.opacity = '0.7';
        }
    }
}

