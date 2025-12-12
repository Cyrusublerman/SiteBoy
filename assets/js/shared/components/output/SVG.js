/**
 * SVG - Universal SVG display component
 * 
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class SVG extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'svg' }, deps);
        
        this.width = options.width ?? '100%';
        this.height = options.height ?? '400px';
        this.viewBox = options.viewBox ?? '0 0 100 100';
        this.preserveAspectRatio = options.preserveAspectRatio ?? 'xMidYMid meet';
        
        this.content = options.content ?? '';
        this.generator = options.generator ?? null; // (svgEl) => void
        
        this.interactive = options.interactive ?? false;
        this.onClick = options.onClick ?? null;
        
        this.downloadable = options.downloadable ?? false;
        this.filename = options.filename ?? 'image';
        
        this.svgEl = null;
    }
    
    render() {
        if (this.element) return this.element;
        
        const F = this.deps.MF?.F ?? 12;
        
        this.element = this.createElement('div', 'svg-container component');
        this.element.style.cssText = `
            width: ${typeof this.width === 'number' ? this.width + 'px' : this.width};
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            box-sizing: border-box;
        `;
        
        // Create SVG element
        this.svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svgEl.setAttribute('width', '100%');
        this.svgEl.setAttribute('height', typeof this.height === 'number' ? this.height : this.height);
        this.svgEl.setAttribute('viewBox', this.viewBox);
        this.svgEl.setAttribute('preserveAspectRatio', this.preserveAspectRatio);
        this.svgEl.style.cssText = `
            display: block;
        `;
        
        // Set content
        if (this.content) {
            this.svgEl.innerHTML = this.content;
        } else if (this.generator) {
            this.generator(this.svgEl);
        }
        
        // Interaction
        if (this.interactive && this.onClick) {
            this.svgEl.style.cursor = 'pointer';
            this.svgEl.addEventListener('click', (e) => {
                const target = e.target;
                this.onClick(target, e);
            });
        }
        
        this.element.appendChild(this.svgEl);
        
        return this.element;
    }
    
    // Public API
    setContent(content) {
        this.content = content;
        if (this.svgEl) {
            this.svgEl.innerHTML = content;
        }
    }
    
    setViewBox(viewBox) {
        this.viewBox = viewBox;
        if (this.svgEl) {
            this.svgEl.setAttribute('viewBox', viewBox);
        }
    }
    
    clear() {
        if (this.svgEl) {
            this.svgEl.innerHTML = '';
        }
    }
    
    getSVGElement() {
        return this.svgEl;
    }
    
    getSVGString() {
        if (!this.svgEl) return '';
        const serializer = new XMLSerializer();
        return serializer.serializeToString(this.svgEl);
    }
    
    downloadSVG(filename = this.filename) {
        const svgString = this.getSVGString();
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.download = `${filename}.svg`;
        link.href = url;
        link.click();
        
        URL.revokeObjectURL(url);
    }
    
    downloadPNG(filename = this.filename, scale = 2) {
        const svgString = this.getSVGString();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            const link = document.createElement('a');
            link.download = `${filename}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        };
        
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
    }
}

