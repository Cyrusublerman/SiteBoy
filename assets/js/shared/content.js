/**
 * Content Components - SiteBoy Framework
 * 
 * COMPONENTS OWNED BY THIS FILE:
 * - Heading (semantic heading component H1-H6)
 * - Paragraph (semantic paragraph component)
 * - Quote (semantic blockquote component)
 * - Image (semantic image with figure/caption)
 * - Video (semantic video with figure/caption)
 * - Audio (semantic audio with figure/caption)
 * - MarkdownBody (advanced markdown rendering with fallback parser)
 * 
 * DO NOT ADD DUPLICATES OF THESE COMPONENTS IN OTHER FILES!
 * This is the SINGLE SOURCE OF TRUTH for all content/media components.
 * 
 * USAGE PATTERN:
 * import { Heading, Image, MarkdownBody } from './content.js';
 * const heading = new Heading({ level: 2, content: 'Title' }, deps);
 * 
 * DEPENDENCIES:
 * - foundation.js (BaseComponent)
 * 
 * 📖 PLACEMENT GUIDE: See COMPONENT_PLACEMENT_GUIDE.md for component placement rules
 * 🚨 BEFORE ADDING: Check if component already exists and verify correct category
 */

import { BaseComponent } from './foundation.js';

/**
 * Heading - Semantic heading component
 */
export class Heading extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'heading' }, deps);
        this.level = Math.max(1, Math.min(6, options.level || 1));
        this.content = options.content || '';
    }
    
    render() {
        if (!this.element) {
            const tag = `h${this.level}`;
            this.element = this.createElement(tag, `heading heading-${this.level}`);
            this.setContent(this.content);
        }
        return this.element;
    }
}

/**
 * Paragraph - Semantic paragraph component
 */
export class Paragraph extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'paragraph' }, deps);
        this.content = options.content || '';
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('p', 'paragraph');
            this.setContent(this.content);
        }
        return this.element;
    }
}

/**
 * Quote - Semantic blockquote component
 */
export class Quote extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'quote' }, deps);
        this.content = options.content || '';
        this.cite = options.cite || null;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('blockquote', 'quote');
            this.setContent(this.content);
            
            if (this.cite) {
                const citation = this.createElement('cite', 'quote-cite');
                citation.textContent = this.cite;
                this.element.appendChild(citation);
            }
        }
        return this.element;
    }
}

/**
 * Image - Semantic image component
 */
export class Image extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'image' }, deps);
        this.src = options.src || '';
        this.size = options.size || 'm'; // s, m, l, full
        this.caption = options.caption || null;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('figure', `image image-${this.size}`);
            
            const img = this.createElement('img', 'image-element');
            img.src = this.src;
            img.alt = this.caption || '';
            this.element.appendChild(img);
            
            if (this.caption) {
                const figcaption = this.createElement('figcaption', 'image-caption');
                figcaption.textContent = this.caption;
                this.element.appendChild(figcaption);
            }
        }
        return this.element;
    }
}

/**
 * Video - Semantic video component
 */
export class Video extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'video' }, deps);
        this.src = options.src || '';
        this.size = options.size || 'm';
        this.caption = options.caption || null;
        this.controls = options.controls !== false;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('figure', `video video-${this.size}`);
            
            const video = this.createElement('video', 'video-element');
            video.src = this.src;
            if (this.controls) video.controls = true;
            this.element.appendChild(video);
            
            if (this.caption) {
                const figcaption = this.createElement('figcaption', 'video-caption');
                figcaption.textContent = this.caption;
                this.element.appendChild(figcaption);
            }
        }
        return this.element;
    }
}

/**
 * Audio - Semantic audio component
 */
export class Audio extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'audio' }, deps);
        this.src = options.src || '';
        this.caption = options.caption || null;
        this.controls = options.controls !== false;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('figure', 'audio');
            
            const audio = this.createElement('audio', 'audio-element');
            audio.src = this.src;
            if (this.controls) audio.controls = true;
            this.element.appendChild(audio);
            
            if (this.caption) {
                const figcaption = this.createElement('figcaption', 'audio-caption');
                figcaption.textContent = this.caption;
                this.element.appendChild(figcaption);
            }
        }
        return this.element;
    }
}

/**
 * MarkdownBody - Advanced markdown content rendering component
 */
export class MarkdownBody extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'markdown' }, deps);
        this.markdownText = options.markdownText || '';
        this.className = options.className || 'markdown-body';
        this.enableTOC = options.enableTOC || false;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', this.className);
            
            // Parse markdown to HTML
            const htmlContent = this.parseMarkdown(this.markdownText);
            this.element.innerHTML = htmlContent;
        }
        return this.element;
    }
    
    parseMarkdown(markdown) {
        if (!markdown || markdown.trim() === '') {
            return '<p><em>No content available.</em></p>';
        }
        
        try {
            // Use marked.js if available
            if (typeof marked !== 'undefined') {
                return marked.parse(markdown, {
                    breaks: true,
                    gfm: true
                });
            } else {
                // Fallback: basic markdown parsing
                return this.basicMarkdownParse(markdown);
            }
        } catch (error) {
            console.error('❌ Markdown parsing failed:', error);
            return `<p>Error parsing markdown: ${error.message}</p><pre>${markdown}</pre>`;
        }
    }
    
    basicMarkdownParse(markdown) {
        let html = markdown;
        
        // Headers (H1-H6)
        html = html.replace(/^#{6} (.*$)/gim, '<h6>$1</h6>');
        html = html.replace(/^#{5} (.*$)/gim, '<h5>$1</h5>');
        html = html.replace(/^#{4} (.*$)/gim, '<h4>$1</h4>');
        html = html.replace(/^#{3} (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^#{2} (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^#{1} (.*$)/gim, '<h1>$1</h1>');
        
        // Code blocks
        html = html.replace(/```([^`]+)```/gims, '<pre><code>$1</code></pre>');
        html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');
        
        // Bold and italic
        html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
        html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
        
        // Links and images
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>');
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1">');
        
        // Lists
        html = html.replace(/^[-*+] (.+)$/gim, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>');
        
        // Paragraphs
        html = html.replace(/\n\n/gim, '</p><p>');
        html = '<p>' + html + '</p>';
        
        return html;
    }
    
    updateContent(markdownText) {
        this.markdownText = markdownText;
        if (this.element) {
            const htmlContent = this.parseMarkdown(markdownText);
            this.element.innerHTML = htmlContent;
        }
    }
}

/**
 * NumberedTOC - Simple numbered table of contents component with collapsible sections
 */
export class SimpleTOC extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'simple-toc' }, deps);
        this.sections = options.sections || [];
        this.onItemClick = options.onItemClick || null;
    }
    
    render() {
        if (!this.element) {
            this.rebuildTOC();
        }
        return this.element;
    }
    
    rebuildTOC() {
        const F = this.deps.MF ? this.deps.MF.F : 12;
        
        // Clear existing content
        if (this.element) {
            this.element.innerHTML = '';
        } else {
            this.element = this.createElement('div', 'simple-toc component');
        }
        
        if (!this.sections || this.sections.length === 0) {
            this.element.innerHTML = '<p>No items available</p>';
            return;
        }
        
        this.sections.forEach((section, index) => {
            this.createSectionItem(section, F, index);
        });
    }
    
    createSectionItem(section, F, index) {
        const itemHeight = F * 4; // 48px - Mathematical precision
        
        // Determine layout based on available width
        const containerWidth = this.element.parentElement?.getBoundingClientRect().width || window.innerWidth;
        const hasWideLayout = containerWidth > 600; // Threshold for showing descriptions inline
        
        const sectionItem = this.createElement('div', 'toc-section-item');
        sectionItem.style.cssText = `
            height: ${itemHeight}px; 
            cursor: pointer; 
            display: flex; 
            align-items: stretch;
            border-right: 1px solid var(--c-border);
            border-bottom: 1px solid var(--c-border);
            ${index === 0 ? 'border-top: 1px solid var(--c-border);' : ''}
            font-family: 'Atkinson Hyperlegible Mono', monospace; 
            box-sizing: border-box;
            position: relative;
        `;
        
        if (hasWideLayout) {
            // Wide layout: title on left, description on right
            this.createWideLayoutContent(sectionItem, section, F, itemHeight);
        } else {
            // Compact layout: title only, description on hover
            this.createCompactLayoutContent(sectionItem, section, F, itemHeight);
        }
        
        // Add hover effects
        sectionItem.addEventListener('mouseenter', () => {
            sectionItem.style.background = 'var(--c-text)';
            sectionItem.style.color = 'var(--c-bg)';
        });
        
        sectionItem.addEventListener('mouseleave', () => {
            sectionItem.style.background = '';
            sectionItem.style.color = '';
        });
        
        // Add click handler
        if (this.onItemClick) {
            sectionItem.addEventListener('click', () => this.onItemClick(section));
        }
        
        // Add to DOM
        this.element.appendChild(sectionItem);
    }
    
    createWideLayoutContent(sectionItem, section, F, itemHeight) {
        // Create content area (original design - title and description stacked vertically)
        const content = this.createElement('div', 'toc-content');
        content.style.cssText = `
            flex: 1; 
            padding: ${F}px ${F * 2}px; 
            display: flex; 
            flex-direction: column;
            justify-content: center;
            box-sizing: border-box;
        `;
        
        // Create title - use F-based sizing (original design)
        const titleDiv = this.createElement('div');
        titleDiv.textContent = section.title;
        titleDiv.style.cssText = `
            margin: 0 0 ${Math.floor(F / 3)}px 0; 
            text-transform: uppercase; 
            font-size: ${Math.floor(F * 1.17)}px; 
            line-height: 1.2;
            font-weight: bold;
        `;
        
        // Create description - use F-based sizing (original design)
        const descDiv = this.createElement('div');
        descDiv.textContent = section.description || section.id || 'section';
        descDiv.style.cssText = `
            margin: 0; 
            font-size: ${Math.floor(F * 0.92)}px; 
            opacity: 0.7; 
            text-transform: uppercase; 
            line-height: 1;
        `;
        
        content.appendChild(titleDiv);
        content.appendChild(descDiv);
        
        // Create arrow - use F-based sizing (original design)
        const arrow = this.createElement('div', 'toc-arrow');
        arrow.textContent = '→';
        arrow.style.cssText = `
            width: ${itemHeight}px; 
            height: ${itemHeight}px; 
            display: flex;
            align-items: center; 
            justify-content: center; 
            font-size: ${Math.floor(F * 1.33)}px;
            border-left: 1px solid var(--c-border); 
            flex-shrink: 0;
            box-sizing: border-box;
        `;
        
        // Assemble item (original design)
        sectionItem.appendChild(content);
        sectionItem.appendChild(arrow);
    }
    
    createCompactLayoutContent(sectionItem, section, F, itemHeight) {
        // Create content area (same as wide layout structure)
        const content = this.createElement('div', 'toc-content');
        content.style.cssText = `
            flex: 1; 
            padding: ${F}px ${F * 2}px; 
            display: flex; 
            flex-direction: column;
            justify-content: center;
            box-sizing: border-box;
        `;
        
        // Create switchable text div
        const textDiv = this.createElement('div');
        textDiv.textContent = section.title;
        textDiv.style.cssText = `
            margin: 0; 
            text-transform: uppercase; 
            font-size: ${Math.floor(F * 1.17)}px; 
            line-height: 1.2;
            font-weight: bold;
        `;
        
        content.appendChild(textDiv);
        
        // Create arrow
        const arrow = this.createElement('div', 'toc-arrow');
        arrow.textContent = '→';
        arrow.style.cssText = `
            width: ${itemHeight}px; 
            height: ${itemHeight}px; 
            display: flex;
            align-items: center; 
            justify-content: center; 
            font-size: ${Math.floor(F * 1.33)}px;
            border-left: 1px solid var(--c-border); 
            flex-shrink: 0;
            box-sizing: border-box;
        `;
        
        // Switch text on hover
        sectionItem.addEventListener('mouseenter', () => {
            textDiv.textContent = section.description || section.id || 'section';
            textDiv.style.fontSize = `${Math.floor(F * 0.92)}px`;
            textDiv.style.opacity = '0.7';
            textDiv.style.fontWeight = 'normal';
        });
        
        sectionItem.addEventListener('mouseleave', () => {
            textDiv.textContent = section.title;
            textDiv.style.fontSize = `${Math.floor(F * 1.17)}px`;
            textDiv.style.opacity = '1';
            textDiv.style.fontWeight = 'bold';
        });
        
        sectionItem.appendChild(content);
        sectionItem.appendChild(arrow);
    }
}

export class NumberedTOC extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'numbered-toc' }, deps);
        this.sections = options.sections || [];
        this.onItemClick = options.onItemClick || null;
        this.showCategories = options.showCategories !== false;
        this.collapsible = options.collapsible || false;
        this.expandedSections = new Set(); // Track which sections are expanded
        
        // Initialize all sections as collapsed by default
        if (this.collapsible) {
            this.sections.forEach((section, index) => {
                if (section.expanded) {
                    this.expandedSections.add(index);
                }
            });
        }
    }
    
    render() {
        if (!this.element) {
            this.rebuildTOC();
        }
        return this.element;
    }
    
    rebuildTOC() {
        const F = this.deps.MF ? this.deps.MF.F : 12;
        
        // Clear existing content
        if (this.element) {
            this.element.innerHTML = '';
        } else {
            this.element = this.createElement('div', 'numbered-toc component');
        }
        
        if (!this.sections || this.sections.length === 0) {
            this.element.innerHTML = '<p>No items available</p>';
            return;
        }
        
        let itemIndex = 0;
        
        this.sections.forEach((section, sectionIndex) => {
            // Section header (if showing categories)
            if (this.showCategories && section.title) {
                const headerHeight = F * 2; // 24px
                const sectionHeader = this.createElement('div', 'toc-category-header');
                
                // Add expand/collapse indicator if collapsible
                const isExpanded = this.expandedSections.has(sectionIndex);
                const indicator = this.collapsible ? (isExpanded ? '▼' : '▶') : '';
                sectionHeader.textContent = `${indicator} ${section.title} /`.trim();
                
                sectionHeader.style.cssText = `
                    padding: 0 ${F * 2}px; height: ${headerHeight}px; display: flex; align-items: center;
                    background: var(--c-bg); color: var(--c-text); 
                    border: 1px solid var(--c-border);
                    ${itemIndex > 0 ? 'border-top: none;' : ''}
                    font-family: 'Atkinson Hyperlegible Mono', monospace; font-size: ${F}px; text-transform: uppercase;
                    ${this.collapsible ? 'cursor: pointer; user-select: none;' : ''}
                    box-sizing: border-box;
                `;
                
                // Add click handler for collapsible headers
                if (this.collapsible) {
                    sectionHeader.addEventListener('click', () => {
                        this.toggleSection(sectionIndex);
                    });
                    
                    // Add hover effect for collapsible headers
                    sectionHeader.addEventListener('mouseenter', () => {
                        sectionHeader.style.background = 'var(--c-text)';
                        sectionHeader.style.color = 'var(--c-bg)';
                    });
                    
                    sectionHeader.addEventListener('mouseleave', () => {
                        sectionHeader.style.background = 'var(--c-bg)';
                        sectionHeader.style.color = 'var(--c-text)';
                    });
                }
                
                this.element.appendChild(sectionHeader);
            }
            
            // Section items (show only if not collapsible or if expanded)
            const shouldShowItems = !this.collapsible || this.expandedSections.has(sectionIndex);
            if (shouldShowItems) {
                const items = section.articles || section.items || section.subsections || [section];
                items.forEach((item) => {
                    itemIndex++;
                    this.createTOCItem(item, itemIndex, F, sectionIndex);
                });
            }
        });
    }
    
    toggleSection(sectionIndex) {
        if (this.expandedSections.has(sectionIndex)) {
            this.expandedSections.delete(sectionIndex);
        } else {
            this.expandedSections.add(sectionIndex);
        }
        this.rebuildTOC();
        console.log(`📚 Toggled section ${sectionIndex}: ${this.expandedSections.has(sectionIndex) ? 'expanded' : 'collapsed'}`);
    }
    
    createTOCItem(item, itemIndex, F, sectionIndex) {
        const numberBoxSize = F * 4; // 48px
        
        const tocItem = this.createElement('div', 'toc-item');
        tocItem.style.cssText = `
            height: ${numberBoxSize}px; cursor: pointer; display: flex; align-items: stretch;
            border: 1px solid var(--c-border);
            border-top: none;
            font-family: 'Atkinson Hyperlegible Mono', monospace; transition: background-color 0.2s ease;
            box-sizing: border-box;
        `;
        
        // Number box
        const numberBox = this.createElement('div', 'toc-number');
        numberBox.textContent = String(itemIndex).padStart(2, '0');
        numberBox.style.cssText = `
            width: ${numberBoxSize}px; height: ${numberBoxSize}px; background: var(--c-text);
            color: var(--c-bg); display: flex; align-items: center; justify-content: center;
            font-size: 18px; flex-shrink: 0;
        `;
        
        // Content
        const content = this.createElement('div', 'toc-content');
        content.style.cssText = `
            flex: 1; padding: ${F}px ${F * 2}px; display: flex; flex-direction: column;
            justify-content: center; outline-left: 1px solid var(--c-border);
        `;
        
        const titleDiv = this.createElement('div');
        titleDiv.textContent = item.title;
        titleDiv.style.cssText = `
            margin: 0 0 4px 0; text-transform: uppercase; font-size: 14px; line-height: 1.2;
        `;
        
        const descDiv = this.createElement('div');
        descDiv.textContent = item.description || item.id || 'item';
        descDiv.style.cssText = `
            margin: 0; font-size: 11px; opacity: 0.7; text-transform: uppercase; line-height: 1;
        `;
        
        content.appendChild(titleDiv);
        content.appendChild(descDiv);
        
        // Arrow
        const arrow = this.createElement('div', 'toc-arrow');
        arrow.textContent = '→';
        arrow.style.cssText = `
            width: ${numberBoxSize}px; height: ${numberBoxSize}px; display: flex;
            align-items: center; justify-content: center; font-size: 16px;
            outline-left: 1px solid var(--c-border); flex-shrink: 0;
        `;
        
        tocItem.appendChild(numberBox);
        tocItem.appendChild(content);
        tocItem.appendChild(arrow);
        
        // Add hover effects
        tocItem.addEventListener('mouseenter', () => {
            tocItem.style.background = 'var(--c-text)';
            tocItem.style.color = 'var(--c-bg)';
            numberBox.style.background = 'var(--c-bg)';
            numberBox.style.color = 'var(--c-text)';
        });
        
        tocItem.addEventListener('mouseleave', () => {
            tocItem.style.background = '';
            tocItem.style.color = '';
            numberBox.style.background = 'var(--c-text)';
            numberBox.style.color = 'var(--c-bg)';
        });
        
        // Add click handler
        if (this.onItemClick) {
            tocItem.addEventListener('click', () => this.onItemClick(item));
        }
        
        this.element.appendChild(tocItem);
    }
}

/**
 * TOCGallery - Table of Contents gallery preview component
 */
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
                overflow-x: auto;
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

// Components are exported individually at their class declarations
