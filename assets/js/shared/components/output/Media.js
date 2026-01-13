/**
 * Media - Universal media display component
 * 
 * Types:
 * - 'image' — static image
 * - 'video' — video player
 * - 'audio' — audio player
 * 
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class Media extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'media' }, deps);
        
        this.type = options.type ?? 'image'; // 'image' | 'video' | 'audio'
        this.src = options.src ?? '';
        this.alt = options.alt ?? '';
        this.caption = options.caption ?? '';
        
        // Video/Audio options
        this.controls = options.controls ?? true;
        this.autoplay = options.autoplay ?? false;
        this.loop = options.loop ?? false;
        this.muted = options.muted ?? false;
        
        // Image options
        this.zoomable = options.zoomable ?? false;
        
        // Events
        this.onLoad = options.onLoad ?? (() => {});
        this.onError = options.onError ?? (() => {});
        
        this.mediaEl = null;
    }
    
    render() {
        if (this.element) return this.element;
        
        const F = this.deps.MF?.F ?? 14;
        
        this.element = this.createElement('figure', 'media-container component');
        this.element.style.cssText = `
            margin: 0;
            display: flex;
            flex-direction: column;
            border: 1px solid var(--c-border);
            background: var(--c-bg);
        `;
        
        switch (this.type) {
            case 'video':
                this._renderVideo();
                break;
            case 'audio':
                this._renderAudio(F);
                break;
            default:
                this._renderImage();
        }
        
        if (this.caption) {
            const captionEl = this.createElement('figcaption', 'media-caption');
            captionEl.textContent = this.caption;
            captionEl.style.cssText = `
                padding: ${F * 0.5}px ${F}px;
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: ${F}px;
                color: var(--c-text);
                border-top: 1px solid var(--c-border);
            `;
            this.element.appendChild(captionEl);
        }
        
        return this.element;
    }
    
    _renderImage() {
        this.mediaEl = this.createElement('img', 'media-image');
        this.mediaEl.src = this.src;
        this.mediaEl.alt = this.alt;
        this.mediaEl.style.cssText = `
            width: 100%;
            height: auto;
            display: block;
        `;
        
        if (this.zoomable) {
            this.mediaEl.style.cursor = 'zoom-in';
            this.mediaEl.addEventListener('click', () => this._openLightbox());
        }
        
        this.mediaEl.addEventListener('load', () => this.onLoad());
        this.mediaEl.addEventListener('error', () => this.onError());
        
        this.element.appendChild(this.mediaEl);
    }
    
    _renderVideo() {
        this.mediaEl = this.createElement('video', 'media-video');
        this.mediaEl.src = this.src;
        this.mediaEl.controls = this.controls;
        this.mediaEl.autoplay = this.autoplay;
        this.mediaEl.loop = this.loop;
        this.mediaEl.muted = this.muted;
        this.mediaEl.style.cssText = `
            width: 100%;
            display: block;
        `;
        
        this.mediaEl.addEventListener('loadeddata', () => this.onLoad());
        this.mediaEl.addEventListener('error', () => this.onError());
        
        this.element.appendChild(this.mediaEl);
    }
    
    _renderAudio(F) {
        this.mediaEl = this.createElement('audio', 'media-audio');
        this.mediaEl.src = this.src;
        this.mediaEl.controls = this.controls;
        this.mediaEl.autoplay = this.autoplay;
        this.mediaEl.loop = this.loop;
        this.mediaEl.style.cssText = `
            width: 100%;
            display: block;
            padding: ${F}px;
            box-sizing: border-box;
        `;
        
        this.mediaEl.addEventListener('loadeddata', () => this.onLoad());
        this.mediaEl.addEventListener('error', () => this.onError());
        
        this.element.appendChild(this.mediaEl);
    }
    
    _openLightbox() {
        // Simple lightbox implementation
        const overlay = this.createElement('div', 'media-lightbox');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            cursor: zoom-out;
        `;
        
        const img = this.createElement('img');
        img.src = this.src;
        img.alt = this.alt;
        img.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
        `;
        
        overlay.appendChild(img);
        
        overlay.addEventListener('click', () => {
            overlay.remove();
        });
        
        document.addEventListener('keydown', function handler(e) {
            if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', handler);
            }
        });
        
        document.body.appendChild(overlay);
    }
    
    // Public API
    setSrc(src) {
        this.src = src;
        if (this.mediaEl) {
            this.mediaEl.src = src;
        }
    }
    
    play() {
        if (this.mediaEl && (this.type === 'video' || this.type === 'audio')) {
            this.mediaEl.play();
        }
    }
    
    pause() {
        if (this.mediaEl && (this.type === 'video' || this.type === 'audio')) {
            this.mediaEl.pause();
        }
    }
    
    getMediaElement() {
        return this.mediaEl;
    }
}

