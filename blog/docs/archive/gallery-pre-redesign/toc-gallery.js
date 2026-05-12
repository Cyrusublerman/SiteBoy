export class TOCGallery extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'toc-gallery' }, deps);
        this.items = options.items || [];
        this.cols = options.cols || 4;
        this.showMore = options.showMore !== false;
        this.showMoreText = options.showMoreText || 'Show More →';
        this.onItemClick = options.onItemClick || null;
        this.onShowMoreClick = options.onShowMoreClick || null;
    }
    
    render() {
        if (!this.element) {
            const F = this.deps.MF ? this.deps.MF.F : 12;
            
            this.element = this.createElement('div', 'toc-gallery component');
            
            // Gallery section is exactly 24F tall with no margins/padding
            const galleryHeight = F * 24; // 288px
            const thumbnailSize = F * 24; // 288px (24F × 24F squares)
            
            this.element.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: flex-start;
                width: 100%;
                height: ${galleryHeight}px;
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: 'Atkinson Hyperlegible Mono', monospace;
                overflow-x: hidden;
                overflow-y: hidden;
            `;
            
            // Create thumbnail grid container - no gaps, shared borders
            const galleryContainer = this.createElement('div', 'toc-gallery-grid');
            galleryContainer.style.cssText = `
                display: flex;
                flex-direction: row;
                flex-shrink: 0;
                gap: 0;
                height: ${galleryHeight}px;
                border-bottom: 1px solid var(--c-border);
                border-top: none;
                border-left: none;
                border-right: none;
                box-sizing: border-box;
                align-items: stretch;
                min-width: ${thumbnailSize * this.cols}px;
            `;
            
            // Create thumbnail items
            this.items.slice(0, this.cols).forEach((item, index) => {
                const thumbnail = this.createThumbnail(item, index, thumbnailSize);
                galleryContainer.appendChild(thumbnail);
            });
            
            this.element.appendChild(galleryContainer);
            
            // Create "Show More" link if enabled
            if (this.showMore) {
                const showMoreLink = this.createElement('div', 'toc-gallery-show-more');
                showMoreLink.textContent = '→';
                showMoreLink.style.cssText = `
                    cursor: pointer;
                    color: var(--c-text);
                    font-size: ${F * 2}px;
                    width: ${galleryHeight}px;
                    height: ${galleryHeight}px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid var(--c-border);
                    transition: all 0.2s ease;
                    margin-left: 0;
                    background: var(--c-bg);
                    flex-shrink: 0;
                `;
                
                // Add hover effects
                showMoreLink.addEventListener('mouseenter', () => {
                    showMoreLink.style.background = 'var(--c-text)';
                    showMoreLink.style.color = 'var(--c-bg)';
                    showMoreLink.style.borderColor = 'var(--c-text)';
                });
                
                showMoreLink.addEventListener('mouseleave', () => {
                    showMoreLink.style.background = '';
                    showMoreLink.style.color = 'var(--c-text)';
                    showMoreLink.style.borderColor = 'transparent';
                });
                
                // Add click handler
                if (this.onShowMoreClick) {
                    showMoreLink.addEventListener('click', () => {
                        this.onShowMoreClick();
                    });
                }
                
                this.element.appendChild(showMoreLink);
            }
        }
        return this.element;
    }
    
    createThumbnail(item, index, size) {
        const F = this.deps.MF ? this.deps.MF.F : 12;
        
        const thumbnail = this.createElement('div', 'toc-gallery-thumbnail');
        // Create shared borders - NO left border on first item to avoid double line
        const borderLeft = 'none';
        const borderRight = '1px solid var(--c-border)';
        
        thumbnail.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            border-left: ${borderLeft};
            border-right: ${borderRight};
            border-top: none;
            border-bottom: none;
            box-sizing: border-box;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            overflow: hidden;
            background: var(--c-bg);
            flex-shrink: 0;
        `;
        
        // Create thumbnail content
        if (item.image) {
            // If item has an image, create img element
            const img = this.createElement('img');
            img.src = item.image;
            img.alt = item.title || `Artwork ${index + 1}`;
            img.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            `;
            thumbnail.appendChild(img);
        } else {
            // Fallback: sophisticated artwork placeholder for 24F × 24F squares
            const placeholderContent = this.createElement('div');
            placeholderContent.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: ${F * 2}px;
                box-sizing: border-box;
            `;
            
            // Add artwork icon/symbol - much larger for 24F squares
            const artIcon = this.createElement('div');
            artIcon.textContent = '🎨'; // Art palette emoji as placeholder
            artIcon.style.cssText = `
                font-size: ${F * 8}px;
                margin-bottom: ${F * 2}px;
                opacity: 0.6;
                line-height: 1;
            `;
            
            // Add title text if available
            if (item.title) {
                const titleElement = this.createElement('div');
                titleElement.textContent = item.title; // Full title for larger square
                titleElement.style.cssText = `
                    color: inherit;
                    font-size: ${F * 1.5}px;
                    font-weight: bold;
                    text-transform: uppercase;
                    line-height: 1.3;
                    opacity: 0.8;
                    word-break: break-word;
                    text-align: center;
                    max-width: 100%;
                `;
                placeholderContent.appendChild(artIcon);
                placeholderContent.appendChild(titleElement);
            } else {
                placeholderContent.appendChild(artIcon);
            }
            
            thumbnail.appendChild(placeholderContent);
        }
        
        // Add hover effects (consistent with site-wide pattern)
        thumbnail.addEventListener('mouseenter', () => {
            thumbnail.style.background = 'var(--c-text)';
            thumbnail.style.color = 'var(--c-bg)';
            // Trigger horizontal scroll if this thumbnail is cut off
            this.handleHoverScroll(thumbnail);
        });
        
        thumbnail.addEventListener('mouseleave', () => {
            thumbnail.style.background = 'var(--c-bg)';
            thumbnail.style.color = 'var(--c-text)';
        });
        
        // Add click handler
        if (this.onItemClick) {
            thumbnail.addEventListener('click', () => {
                this.onItemClick(item, index);
            });
        }
        
        return thumbnail;
    }
    
    handleHoverScroll(thumbnail) {
        // Check if thumbnail is partially cut off and scroll to reveal it
        const container = this.element;
        const thumbnailRect = thumbnail.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Check if thumbnail is cut off on the right
        if (thumbnailRect.right > containerRect.right) {
            const scrollAmount = thumbnailRect.right - containerRect.right + 12; // Add 12px padding
            container.scrollTo({
                left: container.scrollLeft + scrollAmount,
                behavior: 'smooth'
            });
        }
        
        // Check if thumbnail is cut off on the left
        if (thumbnailRect.left < containerRect.left) {
            const scrollAmount = containerRect.left - thumbnailRect.left + 12; // Add 12px padding
            container.scrollTo({
                left: container.scrollLeft - scrollAmount,
                behavior: 'smooth'
            });
        }
    }
    
}

