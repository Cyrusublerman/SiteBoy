/**
 * Art Section - SiteBoy Framework
 * 
 * ART SECTION HANDLER - Gallery TOC with preview thumbnails
 * Handles art galleries and visual content with gallery preview TOC structure
 * 
 * @version 3.0.0 - Gallery TOC Structure
 * @dependencies ['ComponentLibrary'] - Consolidated component system
 */

const ArtSection = {
    version: '3.0.0',
    currentContainer: null,
    componentInstances: [],
    navigationCallbacks: null,
    
    // Simple page list for navigation
    pages: [
        '#art',
        '#art/digital',
        '#art/generative', 
        '#art/sketches',
        '#art/photography'
    ],
    
    // Gallery structure for backward compatibility
    galleryStructure: {
        'digital': { 
            title: 'DIGITAL COMPOSITIONS', 
            description: 'Digital artworks and computer-generated compositions',
            artworks: [
                { id: 'abstract-01', title: 'Abstract 01' },
                { id: 'digital-landscape', title: 'Digital Landscape' },
                { id: 'geometric-01', title: 'Geometric' },
                { id: 'color-composition', title: 'Color Comp' }
            ]
        },
        'generative': { 
            title: 'GENERATIVE ART', 
            description: 'Algorithmic and procedurally generated artworks',
            artworks: [
                { id: 'algorithm-01', title: 'Algorithm' },
                { id: 'fractal-study', title: 'Fractal' },
                { id: 'noise-pattern', title: 'Noise' },
                { id: 'recursive-design', title: 'Recursive' }
            ]
        },
        'sketches': { 
            title: 'SKETCHES & STUDIES', 
            description: 'Traditional and digital sketches, studies, and experiments',
            artworks: [
                { id: 'sketch-01', title: 'Sketch 01' },
                { id: 'character-study', title: 'Character' },
                { id: 'environment-sketch', title: 'Environment' },
                { id: 'concept-art', title: 'Concept' }
            ]
        },
        'photography': { 
            title: 'PHOTOGRAPHY', 
            description: 'Photographic works and visual documentation',
            artworks: [
                { id: 'portrait-01', title: 'Portrait 01' },
                { id: 'landscape', title: 'Landscape' },
                { id: 'street-photo', title: 'Street' },
                { id: 'architecture', title: 'Architecture' }
            ]
        }
    },
    
    /**
     * Handle route changes for art section
     * @param {string|null} subsection - Subsection path
     * @param {HTMLElement} container - Content container
     * @param {Object} callbacks - Navigation callbacks (injected from router)
     */
    handleRoute(subsection, container, callbacks) {
        callbacks = callbacks || {};
        console.log(`🎨 Art Section v${this.version} handling route: ${subsection || 'index'}`);
        
        this.currentContainer = container;
        this.navigationCallbacks = callbacks;
        this.cleanup();
        
        // Setup unified navigation (same code for all sections)
        window.NavigationController.setupNavigation('art', subsection, this.pages, this.navigationCallbacks);
        
        if (!subsection) {
            this.renderArtIndex();
        } else {
            this.renderGallery(subsection);
        }
    },
    
    /**
     * Render art TOC index like blog TOC with gallery previews
     */
    renderArtIndex() {
        console.log('🎨 Rendering art TOC index with gallery previews');
        
        // Clear container and add TOC container class for proper CSS styling
        this.currentContainer.innerHTML = '';
        this.currentContainer.classList.add('toc-container');
        
        // Content container positioning is now handled by body.with-subheader CSS class
        
        // Create art TOC with gallery previews
        this.createArtTOCWithGalleries();
        
        // Add 4F padding after last TOC section
        const F = window.MathematicalFoundation ? window.MathematicalFoundation.F : 12;
        const bottomPadding = this.createElement('div', 'toc-bottom-padding');
        bottomPadding.style.cssText = `
            height: ${F * 4}px;
            width: 100%;
        `;
        this.currentContainer.appendChild(bottomPadding);
        
        console.log('✅ Art TOC index rendered with gallery previews');
    },
    
    /**
     * Setup subheader for art index page
     */
    setupSubheaderForIndex() {
        if (!window.Subheader) {
            console.warn('⚠️ Subheader component not available');
            return;
        }
        
        // Update subheader title
        window.Subheader.updateTitle('ART GALLERIES');
        
        // Build all art pages list for dropdown
        const allPages = this.getAllArtPages();
        const currentPath = '#art';
        const dropdownItems = this.buildDropdownItems(allPages, currentPath);
        
        // Setup dropdown
        window.Subheader.setDropdownContent(dropdownItems, (item) => {
            if (item.path) {
                this.navigateToPage(item.path);
            }
        });
        
        // Setup navigation context
        const navigationContext = {
            section: 'art',
            subsection: 'toc', // Use 'toc' as identifier for the main art page
            items: allPages,
            navigate: (section, subsection) => {
                if (this.navigationCallbacks && this.navigationCallbacks.navigateToSection) {
                    if (subsection === 'toc') {
                        // Navigate to main art page
                        this.navigationCallbacks.navigateToSection(section);
                    } else {
                        // Navigate to specific gallery
                        this.navigationCallbacks.navigateToSection(section, subsection);
                    }
                }
            }
        };
        window.Subheader.updateNavigation(navigationContext);
        
        // Show subheader and set body state
        window.Subheader.show();
        
        // Set app-wide subheader state to ensure proper body class and layout
        if (window.SiteBoyApp && window.SiteBoyApp.setSubheaderState) {
            window.SiteBoyApp.setSubheaderState(true);
        }
        
        console.log('✅ Subheader setup for art index');
    },
    
    /**
     * Setup subheader for individual gallery
     */
    setupSubheaderForGallery(galleryId, callbacks) {
        if (!window.Subheader) {
            console.warn('⚠️ Subheader component not available');
            return;
        }
        
        const gallery = this.galleryStructure[galleryId];
        if (!gallery) return;
        
        // Update subheader title
        window.Subheader.updateTitle(gallery.title);
        
        // Build all galleries list for dropdown
        const allPages = this.getAllArtPages();
        const currentPath = `#art/${galleryId}`;
        const dropdownItems = this.buildDropdownItems(allPages, currentPath);
        
        // Setup dropdown
        window.Subheader.setDropdownContent(dropdownItems, (item) => {
            if (item.path) {
                this.navigateToPage(item.path);
            }
        });
        
        // Setup navigation context
        const navigationContext = {
            section: 'art',
            subsection: galleryId,
            items: allPages,
            navigate: (section, subsection) => {
                if (this.navigationCallbacks && this.navigationCallbacks.navigateToSection) {
                    this.navigationCallbacks.navigateToSection(section, subsection);
                }
            }
        };
        window.Subheader.updateNavigation(navigationContext);
        
        // Show subheader and set body state
        window.Subheader.show();
        
        // Set app-wide subheader state to ensure proper body class and layout
        if (window.SiteBoyApp && window.SiteBoyApp.setSubheaderState) {
            window.SiteBoyApp.setSubheaderState(true);
        }
        
        console.log('✅ Subheader setup for gallery:', gallery.title);
    },
    
    /**
     * Create art TOC with gallery previews (like blog TOC but with galleries)
     */
    createArtTOCWithGalleries() {
        const F = window.MathematicalFoundation ? window.MathematicalFoundation.F : 12;
        const headerHeight = F * 2; // 24px
        
        let itemIndex = 0;
        Object.entries(this.galleryStructure).forEach(([galleryKey, gallery]) => {
            itemIndex++;
            this.createArtTOCItem(gallery, galleryKey, itemIndex);
        });
    },
    
    /**
     * Create individual art TOC item with gallery preview
     */
    createArtTOCItem(gallery, galleryKey, itemIndex) {
        const F = window.MathematicalFoundation ? window.MathematicalFoundation.F : 12;
        const headerHeight = F * 4; // 48px (4F for heading)
        const galleryHeight = F * 24; // 288px (24F for gallery)
        const tocItemHeight = headerHeight + galleryHeight; // 28F total (336px)
        
        const tocItem = this.createElement('div', 'toc-item art-toc-item');
        tocItem.style.cssText = `
            height: ${tocItemHeight}px; cursor: pointer; display: flex; flex-direction: column;
            border-left: 1px solid var(--c-border); border-right: 1px solid var(--c-border); 
            border-top: ${itemIndex === 1 ? '1px solid var(--c-border)' : 'none'};
            border-bottom: 1px solid var(--c-border);
            font-family: 'Atkinson Hyperlegible Mono', monospace; background: var(--c-bg);
        `;
        
        // Top half: Like blog TOC (number + title + description) - 4F height
        const topHalf = this.createElement('div', 'toc-item-top');
        topHalf.style.cssText = `
            height: ${headerHeight}px; display: flex; align-items: stretch;
        `;
        
        // Number box - 4F × 4F square
        const numberBox = this.createElement('div', 'toc-number');
        numberBox.textContent = String(itemIndex).padStart(2, '0');
        numberBox.style.cssText = `
            width: ${headerHeight}px; height: ${headerHeight}px; background: var(--c-text);
            color: var(--c-bg); display: flex; align-items: center; justify-content: center;
            font-size: 18px; flex-shrink: 0;
        `;
        
        // Content
        const content = this.createElement('div', 'toc-content');
        content.style.cssText = `
            flex: 1; padding: ${F}px ${F * 2}px; display: flex; flex-direction: column;
            justify-content: center; border-left: 1px solid var(--c-border);
        `;
        
        const titleDiv = this.createElement('div');
        titleDiv.textContent = gallery.title;
        titleDiv.style.cssText = `
            margin: 0 0 4px 0; text-transform: uppercase; font-size: 14px; line-height: 1.2;
        `;
        
        const descriptionDiv = this.createElement('div');
        descriptionDiv.textContent = gallery.description;
        descriptionDiv.style.cssText = `
            margin: 0; font-size: 11px; opacity: 0.7; line-height: 1.2;
        `;
        
        content.appendChild(titleDiv);
        content.appendChild(descriptionDiv);
        
        // Arrow - 4F × 4F square
        const arrow = this.createElement('div', 'toc-arrow');
        arrow.textContent = '→';
        arrow.style.cssText = `
            width: ${headerHeight}px; height: ${headerHeight}px; display: flex;
            align-items: center; justify-content: center; font-size: 16px;
            border-left: 1px solid var(--c-border); flex-shrink: 0;
        `;
        
        topHalf.appendChild(numberBox);
        topHalf.appendChild(content);
        topHalf.appendChild(arrow);
        
        // Bottom half: Gallery preview - exactly 24F height
        const bottomHalf = this.createElement('div', 'toc-item-bottom');
        bottomHalf.style.cssText = `
            height: ${galleryHeight}px; display: flex; align-items: stretch;
            padding: 0; margin: 0;
            border-top: 1px solid var(--c-border);
        `;
        
        // Create TOCGallery component for preview
        const galleryPreview = new ComponentLibrary.TOCGallery({
            items: gallery.artworks.slice(0, 4), // First 4 artworks
            cols: 4,
            showMore: true,
            showMoreText: 'Show More →',
            onItemClick: (artwork, index) => {
                console.log(`🖼️ Artwork clicked: ${artwork.title}`);
                // Future: Navigate to specific artwork
                this.navigateToGallery(galleryKey);
            },
            onShowMoreClick: () => {
                this.navigateToGallery(galleryKey);
            }
        }, {
            MF: window.MathematicalFoundation
        });
        
        this.componentInstances.push(galleryPreview);
        bottomHalf.appendChild(galleryPreview.render());
        
        tocItem.appendChild(topHalf);
        tocItem.appendChild(bottomHalf);
        
        // Add hover effects to top half only
        topHalf.addEventListener('mouseenter', () => {
            tocItem.style.background = 'var(--c-text)';
            tocItem.style.color = 'var(--c-bg)';
            numberBox.style.background = 'var(--c-bg)';
            numberBox.style.color = 'var(--c-text)';
        });
        
        topHalf.addEventListener('mouseleave', () => {
            tocItem.style.background = '';
            tocItem.style.color = '';
            numberBox.style.background = 'var(--c-text)';
            numberBox.style.color = 'var(--c-bg)';
        });
        
        // Add click handler to top half
        topHalf.addEventListener('click', () => {
            this.navigateToGallery(galleryKey);
        });
        
        this.currentContainer.appendChild(tocItem);
    },
    
    /**
     * Navigate to gallery
     */
    navigateToGallery(galleryKey) {
        if (this.navigationCallbacks && this.navigationCallbacks.navigateToSection) {
            this.navigationCallbacks.navigateToSection('art', galleryKey);
        }
    },
    
    /**
     * Render individual art gallery page
     */
    renderArtGallery(galleryId) {
        console.log(`🎨 Rendering art gallery: ${galleryId}`);
        
        const gallery = this.galleryStructure[galleryId] || {
            title: galleryId.toUpperCase(),
            description: 'Gallery description to be added',
            artworks: [
                { id: 'placeholder-1', title: 'Placeholder 1', image: null },
                { id: 'placeholder-2', title: 'Placeholder 2', image: null },
                { id: 'placeholder-3', title: 'Placeholder 3', image: null }
            ]
        };
        
        // Create gallery using ComponentLibrary components
        const title = new ComponentLibrary.Heading({
            level: 1,
            content: gallery.title
        });
        this.componentInstances.push(title);
        this.currentContainer.appendChild(title.render());
        
        const description = new ComponentLibrary.Paragraph({
            content: gallery.description
        });
        this.componentInstances.push(description);
        this.currentContainer.appendChild(description.render());
        
        // Create artwork grid using VGAGrid for visual placeholder squares
        const artworkItems = gallery.artworks.map((artwork, index) => ({
            value: `var(--vga-${['navy', 'teal', 'maroon', 'olive', 'purple', 'silver'][index % 6]})`,
            title: artwork.title
        }));
        
        const artworkGrid = new ComponentLibrary.VGAGrid({
            items: artworkItems,
            cols: 3,
            showHex: false,
            onItemClick: (artwork, index) => {
                console.log(`🖼️ Artwork clicked: ${artwork.title}`);
                // Future: Navigate to individual artwork view
            }
        });
        
        this.componentInstances.push(artworkGrid);
        this.currentContainer.appendChild(artworkGrid.render());
        
        // Add back link
        const backElement = this.createElement('div', 'back-link');
        backElement.textContent = '← Back to Art Gallery';
        backElement.style.cssText = `
            cursor: pointer; padding: ${window.MathematicalFoundation?.F || 12}px 0;
            text-decoration: underline; margin-top: ${(window.MathematicalFoundation?.F || 12) * 2}px;
        `;
        backElement.classList.add('clickable');
        backElement.addEventListener('click', () => {
            if (this.navigationCallbacks && this.navigationCallbacks.navigateToSection) {
                this.navigationCallbacks.navigateToSection('art');
            }
        });
        
        this.currentContainer.appendChild(backElement);
    },
    
    /**
     * Create DOM element with F=12px styling
     */
    createElement(tag, className = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        
        // Apply F=12px styling
        element.style.fontFamily = '"Atkinson Hyperlegible Mono", monospace';
        element.style.fontSize = '12px';
        element.style.lineHeight = '1.5';
        element.style.padding = '12px';
        
        return element;
    },
    
    /**
     * Get all art pages in order (TOC first, then all galleries)
     */
    getAllArtPages() {
        const pages = [
            { 
                label: 'ART TOC', 
                path: '#art', 
                id: 'toc',
                title: 'ART TOC',
                isTOC: true 
            }
        ];
        
        // Add all galleries from galleryStructure
        Object.keys(this.galleryStructure).forEach(galleryKey => {
            const gallery = this.galleryStructure[galleryKey];
            pages.push({
                label: gallery.title,
                path: `#art/${galleryKey}`,
                id: galleryKey,
                title: gallery.title,
                isTOC: false
            });
        });
        
        return pages;
    },
    
    /**
     * Build dropdown items with current selection marked
     */
    buildDropdownItems(allPages, currentPath) {
        return allPages.map(page => ({
            label: page.label,
            value: page.path,
            path: page.path,
            isCurrent: page.path === currentPath,
            isTOC: page.isTOC || false
        }));
    },
    
    /**
     * Navigate to a page path
     */
    navigateToPage(path) {
        if (this.navigationCallbacks && this.navigationCallbacks.navigateToSection) {
            const pathParts = path.replace('#', '').split('/');
            if (pathParts.length === 1) {
                // Main section (e.g., 'art') - this is the TOC
                this.navigationCallbacks.navigateToSection(pathParts[0]);
            } else if (pathParts.length >= 2) {
                // Subsection (e.g., 'art/digital')
                this.navigationCallbacks.navigateToSection(pathParts[0], pathParts[1]);
            }
        }
    },
    
    /**
     * Cleanup section
     */
    cleanup() {
        if (this.currentContainer) {
            this.currentContainer.innerHTML = '';
            // Remove layout classes
            this.currentContainer.className = this.currentContainer.className
                .replace(/toc-container|layout-\w+-\w+/g, '')
                .trim();
        }
        
        // Destroy tracked components using ComponentLibrary method
        ComponentLibrary.destroyTracked(this.componentInstances);
    },
    
    /**
     * Initialize section (legacy support)
     */
    init() {
        console.log(`🎨 Art Section v${this.version} initialized`);
    },
    
    /**
     * Render section (legacy support)
     */
    render(subsection) {
        const container = document.createElement('div');
        this.handleRoute(subsection, container);
        return container;
    }
};

// Global registration
window.ArtSection = ArtSection;

console.log(`🎨 Art Section v${ArtSection.version} ready`);