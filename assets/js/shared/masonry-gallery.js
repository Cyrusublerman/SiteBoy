/**
 * Masonry Gallery - SiteBoy Framework
 * SIMPLE CSS COLUMN-BASED MASONRY (not complex grid)
 * 
 * COMPONENTS OWNED BY THIS FILE:
 * - MasonryGallery (CSS column masonry with lazy loading)
 * 
 * DO NOT ADD DUPLICATES OF THESE COMPONENTS IN OTHER FILES!
 * This is the SINGLE SOURCE OF TRUTH for masonry gallery components.
 * 
 * TECHNOLOGY:
 * - CSS Multi-Column Layout (supported since 2011)
 * - Intersection Observer API (native lazy loading)
 * - Simple fade-in animations
 * - Modal for image expansion
 * 
 * ZERO EXTERNAL DEPENDENCIES:
 * - No Alpine.js
 * - No GSAP
 * - No layout libraries
 * - Pure CSS + vanilla JS
 * 
 * USAGE PATTERN:
 * import { MasonryGallery } from './masonry-gallery.js';
 * const gallery = new MasonryGallery({ images: [...] }, deps);
 * 
 * DEPENDENCIES:
 * - foundation.js (BaseComponent)
 * 
 * 📖 PLACEMENT GUIDE: See COMPONENT_PLACEMENT_GUIDE.md for component placement rules
 * 🚨 BEFORE ADDING: Check if component already exists and verify correct category
 * 
 * @version 2.0.0
 */

import { BaseComponent } from './foundation.js';

/**
 * MasonryGallery - CSS column-based masonry layout
 * Uses native CSS columns + Intersection Observer for lazy loading
 * Much simpler than grid-based approach
 */
export class MasonryGallery extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'masonry-gallery' }, deps);
        
        // Image data: { thumb, src, title, caption }
        this.images = options.images || [];
        this.gap = options.gap || 0;
        this.columns = {
            mobile: options.columnsMobile || 1,
            tablet: options.columnsTablet || 2,
            desktop: options.columnsDesktop || 3,
            wide: options.columnsWide || 4
        };
        
        // Lazy loading
        this.observer = null;
        this.loadBuffer = options.loadBuffer || 200; // px before visible
        
        // Modal state
        this.modal = null;
        this.isModalOpen = false;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'masonry-gallery');
            
            // Create grid (actually a list for semantic HTML)
            const grid = this.createElement('ul', 'masonry-gallery__grid');
            
            // Create all items (CSS columns handle layout)
            this.images.forEach((img, index) => {
                const item = this.createItem(img, index);
                grid.appendChild(item);
            });
            
            this.element.appendChild(grid);
            
            // Setup lazy loading after DOM is ready
            requestAnimationFrame(() => {
                this.setupLazyLoading(grid);
            });
        }
        
        return this.element;
    }
    
    createItem(imageData, index) {
        const item = this.createElement('li', 'masonry-item');
        
        // Store full-size URL for modal
        item.dataset.fullSrc = imageData.src || imageData.imageUrl;
        item.dataset.title = imageData.title || '';
        item.dataset.caption = imageData.caption || '';
        item.dataset.index = index;
        
        // Image (starts with no src - lazy loaded)
        const img = this.createElement('img', 'masonry-item__img');
        img.dataset.src = imageData.thumb || imageData.src || imageData.imageUrl;
        img.alt = imageData.title || `Image ${index + 1}`;
        
        // Label overlay
        const label = this.createElement('div', 'masonry-item__label');
        label.textContent = `#${String(index + 1).padStart(4, '0')}`;
        
        item.appendChild(img);
        item.appendChild(label);
        
        // Click to expand
        item.addEventListener('click', () => {
            this.openModal({
                imageUrl: item.dataset.fullSrc,
                title: item.dataset.title,
                caption: item.dataset.caption,
                index: parseInt(item.dataset.index) + 1
            });
        });
        
        return item;
    }
    
    setupLazyLoading(grid) {
        // Create Intersection Observer for lazy loading
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const item = entry.target;
                        const img = item.querySelector('img');
                        
                        if (img && img.dataset.src) {
                            // Load the image
                            img.src = img.dataset.src;
                            
                            // Fade in when loaded
                            img.addEventListener('load', () => {
                                img.classList.add('loaded');
                            }, { once: true });
                            
                            // Clean up data attribute
                            delete img.dataset.src;
                        }
                        
                        // Stop observing this item (lazy load once)
                        this.observer.unobserve(item);
                    }
                });
            },
            {
                rootMargin: `${this.loadBuffer}px`, // Start loading before visible
                threshold: 0.01 // Trigger as soon as 1% is visible
            }
        );
        
        // Observe all items
        const items = grid.querySelectorAll('.masonry-item');
        items.forEach(item => this.observer.observe(item));
    }
    
    openModal(data) {
        if (this.isModalOpen) return;
        
        this.isModalOpen = true;
        
        // Create modal
        this.modal = this.createElement('div', 'gallery-modal');
        
        // Overlay (click to close)
        const overlay = this.createElement('div', 'gallery-modal__overlay');
        overlay.addEventListener('click', () => this.closeModal());
        
        // Content container
        const content = this.createElement('div', 'gallery-modal__content');
        
        // Full-size image
        const img = this.createElement('img', 'gallery-modal__img');
        img.src = data.imageUrl;
        img.alt = data.title;
        
        // Text underneath
        const textContainer = this.createElement('div', 'gallery-modal__text');
        
        if (data.title) {
            const title = this.createElement('h3', 'gallery-modal__title');
            title.textContent = data.title;
            textContainer.appendChild(title);
        }
        
        if (data.caption) {
            const caption = this.createElement('p', 'gallery-modal__caption');
            caption.textContent = data.caption;
            textContainer.appendChild(caption);
        }
        
        // Index number
        const indexLabel = this.createElement('div', 'gallery-modal__index');
        indexLabel.textContent = `#${String(data.index).padStart(4, '0')}`;
        
        // Assemble modal
        content.appendChild(img);
        content.appendChild(textContainer);
        content.appendChild(indexLabel);
        
        this.modal.appendChild(overlay);
        this.modal.appendChild(content);
        
        document.body.appendChild(this.modal);
        
        // Fade in
        requestAnimationFrame(() => {
            this.modal.classList.add('visible');
        });
        
        // ESC key to close
        this.modalKeyHandler = (e) => {
            if (e.key === 'Escape') this.closeModal();
        };
        window.addEventListener('keydown', this.modalKeyHandler);
    }
    
    closeModal() {
        if (!this.isModalOpen || !this.modal) return;
        
        // Fade out
        this.modal.classList.remove('visible');
        
        // Remove after animation
        setTimeout(() => {
            if (this.modal) {
                this.modal.remove();
                this.modal = null;
            }
            this.isModalOpen = false;
        }, 300); // Match CSS transition time
        
        // Remove key listener
        if (this.modalKeyHandler) {
            window.removeEventListener('keydown', this.modalKeyHandler);
            this.modalKeyHandler = null;
        }
    }
    
    destroy() {
        // Disconnect observer
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        
        // Close modal if open
        if (this.isModalOpen) {
            this.closeModal();
        }
        
        // Clean up element
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
    }
}

