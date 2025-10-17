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
        '#art/photography',
        '#art/photography/life1',
        '#art/photography/life2',
        '#art/photography/morocco',
        '#art/photography/nature',
        '#art/photography/rom',
        '#art/photography/snow',
        '#art/photography/urban',
        '#art/photography/all'
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
            description: 'Film photography collections across different themes and locations',
            subsections: [
                { id: 'life1', title: 'LIFE 1', count: 11 },
                { id: 'life2', title: 'LIFE 2', count: 19 },
                { id: 'morocco', title: 'MOROCCO', count: 52 },
                { id: 'nature', title: 'NATURE', count: 4 },
                { id: 'rom', title: 'ROM', count: 15 },
                { id: 'snow', title: 'SNOW', count: 22 },
                { id: 'urban', title: 'URBAN', count: 5 }
            ],
            artworks: [
                { id: 'all', title: 'ALL PHOTOS', count: 158 }
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
        } else if (subsection === 'photography') {
            this.renderPhotographyIndex();
        } else if (subsection.startsWith('photography/')) {
            const photoSection = subsection.replace('photography/', '');
            this.renderPhotographyGallery(photoSection);
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
        
        // Get preview items - handle galleries with subsections (like photography)
        let previewItems = [];
        if (gallery.subsections && gallery.subsections.length > 0) {
            // Gallery has subsections - get sample images from each subsection
            const subsectionSamples = this.getGalleryPreviewFromSubsections(galleryKey, gallery.subsections);
            previewItems = subsectionSamples.slice(0, 4);
        } else if (gallery.artworks && gallery.artworks.length > 0) {
            // Gallery has direct artworks
            previewItems = gallery.artworks.slice(0, 4);
        }
        
        // Create TOCGallery component for preview
        const galleryPreview = new ComponentLibrary.TOCGallery({
            items: previewItems,
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
     * Get preview images from subsections (e.g., for photography gallery)
     * Returns array of items formatted for TOCGallery component
     */
    getGalleryPreviewFromSubsections(galleryKey, subsections) {
        const previewItems = [];
        
        if (galleryKey === 'photography') {
            // Get one image from each of the first 4 subsections
            subsections.slice(0, 4).forEach(subsection => {
                const images = this.getPhotographyImages(subsection.id);
                if (images.length > 0) {
                    const firstImage = images[0];
                    previewItems.push({
                        id: subsection.id,
                        title: subsection.title,
                        image: firstImage.thumb || firstImage.src
                    });
                }
            });
        } else {
            // For other galleries with subsections in the future
            subsections.slice(0, 4).forEach(subsection => {
                previewItems.push({
                    id: subsection.id,
                    title: subsection.title,
                    image: null // Placeholder
                });
            });
        }
        
        return previewItems;
    },
    
    /**
     * Render photography index with subsections TOC
     */
    renderPhotographyIndex() {
        console.log('📸 Rendering photography index');
        
        this.currentContainer.innerHTML = '';
        this.currentContainer.classList.add('toc-container');
        
        const photography = this.galleryStructure['photography'];
        const F = window.MathematicalFoundation ? window.MathematicalFoundation.F : 12;
        
        // Create TOC items for each subsection (art-toc style)
        photography.subsections.forEach((subsection, index) => {
            this.createPhotoArtTOCItem(subsection, index + 1);
        });
        
        // VIEW ALL PHOTOS button after TOC - perfectly connected with no gap
        const viewAllContainer = this.createElement('div', 'view-all-container');
        viewAllContainer.style.cssText = `
            height: ${F * 6}px;
            display: flex;
            align-items: stretch;
            justify-content: stretch;
            border-left: 1px solid var(--c-border);
            border-right: 1px solid var(--c-border);
            border-bottom: 1px solid var(--c-border);
            margin: 0;
            padding: 0;
        `;
        
        const viewAllBtn = new ComponentLibrary.Button({
            text: 'VIEW ALL PHOTOS (128)',
            onClick: () => {
                if (this.navigationCallbacks && this.navigationCallbacks.navigateToSection) {
                    this.navigationCallbacks.navigateToSection('art', 'photography/all');
                }
            }
        }, { MF: window.MathematicalFoundation });
        this.componentInstances.push(viewAllBtn);
        
        const btnElement = viewAllBtn.render();
        // Make button fill entire container with no margins
        btnElement.style.cssText += `
            width: 100%;
            height: 100%;
            margin: 0;
            border: none;
            border-radius: 0;
        `;
        
        viewAllContainer.appendChild(btnElement);
        this.currentContainer.appendChild(viewAllContainer);
        
        // Add bottom padding
        const bottomPadding = this.createElement('div', 'toc-bottom-padding');
        bottomPadding.style.cssText = `height: ${F * 4}px; width: 100%;`;
        this.currentContainer.appendChild(bottomPadding);
        
        console.log('✅ Photography index rendered');
    },
    
    /**
     * Create photography TOC item (art-toc style with gallery preview)
     */
    createPhotoArtTOCItem(subsection, itemIndex) {
        const F = window.MathematicalFoundation ? window.MathematicalFoundation.F : 12;
        const headerHeight = F * 4; // 48px (4F like art-toc)
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
        titleDiv.textContent = subsection.title;
        titleDiv.style.cssText = `
            margin: 0 0 4px 0; text-transform: uppercase; font-size: 14px; line-height: 1.2;
        `;
        
        const countDiv = this.createElement('div');
        countDiv.textContent = `${subsection.count} photographs`;
        countDiv.style.cssText = `
            margin: 0; font-size: 11px; opacity: 0.7; line-height: 1.2;
        `;
        
        content.appendChild(titleDiv);
        content.appendChild(countDiv);
        
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
        
        // Get sample images for this photography subsection
        const sampleImages = this.getPhotographyImages(subsection.id);
        
        // Create TOCGallery component for preview
        const galleryPreview = new ComponentLibrary.TOCGallery({
            items: sampleImages.slice(0, 4).map(img => ({
                id: img.title,
                title: img.title,
                image: img.thumb || img.src
            })),
            cols: 4,
            showMore: true,
            showMoreText: 'Show More →',
            onItemClick: (image, index) => {
                console.log(`📸 Photo clicked: ${image.title}`);
                if (this.navigationCallbacks && this.navigationCallbacks.navigateToSection) {
                    this.navigationCallbacks.navigateToSection('art', `photography/${subsection.id}`);
                }
            },
            onShowMoreClick: () => {
                if (this.navigationCallbacks && this.navigationCallbacks.navigateToSection) {
                    this.navigationCallbacks.navigateToSection('art', `photography/${subsection.id}`);
                }
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
            if (this.navigationCallbacks && this.navigationCallbacks.navigateToSection) {
                this.navigationCallbacks.navigateToSection('art', `photography/${subsection.id}`);
            }
        });
        
        this.currentContainer.appendChild(tocItem);
    },
    
    /**
     * Create photography TOC item (old style - kept for reference)
     */
    createPhotoTOCItem(subsection, itemIndex) {
        const F = window.MathematicalFoundation ? window.MathematicalFoundation.F : 12;
        const headerHeight = F * 3; // 36px
        
        const tocItem = this.createElement('div', 'toc-item photo-toc-item');
        tocItem.style.cssText = `
            height: ${headerHeight}px; cursor: pointer; display: flex;
            border-left: 1px solid var(--c-border); border-right: 1px solid var(--c-border); 
            border-top: ${itemIndex === 1 ? '1px solid var(--c-border)' : 'none'};
            border-bottom: 1px solid var(--c-border);
            font-family: 'Atkinson Hyperlegible Mono', monospace; background: var(--c-bg);
        `;
        
        // Number box - 3F × 3F square
        const numberBox = this.createElement('div', 'toc-number');
        numberBox.textContent = String(itemIndex).padStart(2, '0');
        numberBox.style.cssText = `
            width: ${headerHeight}px; height: ${headerHeight}px; background: var(--c-text);
            color: var(--c-bg); display: flex; align-items: center; justify-content: center;
            font-size: 16px; flex-shrink: 0;
        `;
        
        // Content
        const content = this.createElement('div', 'toc-content');
        content.style.cssText = `
            flex: 1; padding: ${F}px ${F * 2}px; display: flex; flex-direction: column;
            justify-content: center; border-left: 1px solid var(--c-border);
        `;
        
        const titleDiv = this.createElement('div');
        titleDiv.textContent = `${subsection.title} (${subsection.count} photos)`;
        titleDiv.style.cssText = `
            margin: 0; text-transform: uppercase; font-size: 13px; line-height: 1.2;
        `;
        
        content.appendChild(titleDiv);
        
        // Arrow - 3F × 3F square
        const arrow = this.createElement('div', 'toc-arrow');
        arrow.textContent = '→';
        arrow.style.cssText = `
            width: ${headerHeight}px; height: ${headerHeight}px; display: flex;
            align-items: center; justify-content: center; font-size: 16px;
            border-left: 1px solid var(--c-border); flex-shrink: 0;
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
        tocItem.addEventListener('click', () => {
            if (this.navigationCallbacks && this.navigationCallbacks.navigateToSection) {
                this.navigationCallbacks.navigateToSection('art', `photography/${subsection.id}`);
            }
        });
        
        this.currentContainer.appendChild(tocItem);
    },
    
    /**
     * Render photography gallery (for individual collections or "all")
     */
    renderPhotographyGallery(photoSection) {
        console.log(`📸 Rendering photography gallery: ${photoSection}`);
        
        this.currentContainer.innerHTML = '';
        
        // Get images for this section
        const images = this.getPhotographyImages(photoSection);
        
        // Create MasonryGallery component (CSS column-based, much simpler)
        const gallery = new ComponentLibrary.MasonryGallery({
            images: images,
            gap: 0,
            columnsMobile: 1,
            columnsTablet: 2,
            columnsDesktop: 3,
            columnsWide: 4,
            loadBuffer: 200 // Start loading 200px before visible
        }, {
            MF: window.MathematicalFoundation,
            Resize: window.ResizeManager
        });
        
        this.componentInstances.push(gallery);
        this.currentContainer.appendChild(gallery.render());
        
        // Setup subheader for photography gallery
        this.setupSubheaderForPhotography(photoSection);
        
        console.log(`✅ Photography gallery rendered: ${photoSection}`);
    },
    
    /**
     * Get photography images for a specific section
     * Uses processed thumbs/display/zoom structure
     */
    getPhotographyImages(photoSection) {
        const basePath = '/art/Photos/FILM';
        const images = [];
        
        const sectionMap = {
            'life1': 'Life1',
            'life2': 'Life2',
            'morocco': 'Morocco',
            'nature': 'Nature',
            'rom': 'Rom',
            'snow': 'Snow',
            'urban': 'Urban'
        };
        
        // Complete image lists from processed folders
        const imageLists = {
            'Life1': [
                '237040610016', '237040610021', '237040610022', '237040610023', '237040610024',
                '237040610025', '237040610027', '237040610028', '237040610029', '237040610030',
                '237040610032'
            ],
            'Life2': [
                '262556200009', '262556200012', '262556200013', '262556200015', '262556200018',
                '262556200031', '262556200032', '262556200033', '262556200035',
                'R1-01040-0000', 'R1-01040-0001', 'R1-01040-0002', 'R1-01040-0004', 'R1-01040-0005',
                'R1-01040-0006', 'R1-01040-0007', 'R1-01040-0008', 'R1-01040-0009', 'R1-01040-0010'
            ],
            'Morocco': [
                '237040620001', '237040620002', '237040620003', '237040620004', '237040620009', '237040620011',
                '237040620012', '237040620013', '237040620015', '237040620016', '237040620018', '237040620019',
                '237040620020', '237040620021', '237040620024', '237040620027', '237040620030', '237040620032',
                '237040620036', '237040630002', '237040630003', '237040630004', '237040630005', '237040630006',
                '237040630007', '237040630010', '237040630011', '237040630012', '237040630013', '237040630014',
                '237040630015', '237040630016', '237040630017', '237040630018', '237040630019', '237040630020',
                '237040630021', '237040630022', '237040630023', '237040630024', '237040630025', '237040630027',
                '237040630029', '237040630031', '237040630034', '237040630035', '262556210002', '262556210003',
                '262556210004', '262556210005', '262556210006', '262556210007'
            ],
            'Nature': ['262556200028', '262556200029', '262556200030', 'R1-01040-0003'],
            'Rom': [
                '237040610034', '237040610035', '237040610036', '262556200001', '262556200002', '262556200003',
                '262556200004', '262556200006', '262556210030', '262556210031', '262556210032', '262556210033',
                '262556210034', '262556210035', '262556210036'
            ],
            'Snow': [
                '262556210008', '262556210009', '262556210010', '262556210011', '262556210012', '262556210013',
                '262556210014', '262556210015', '262556210016', '262556210017', '262556210018', '262556210019',
                '262556210020', '262556210021', '262556210022', '262556210023', '262556210024', '262556210025',
                '262556210026', '262556210027', '262556210028', '262556210029'
            ],
            'Urban': ['237040610010', '237040610011', '237040610012', '237040610014', '237040620001']
        };
        
        if (photoSection === 'all') {
            // Get all images from all sections
            Object.keys(sectionMap).forEach(key => {
                const folderName = sectionMap[key];
                const fileList = imageLists[folderName] || [];
                fileList.forEach(filename => {
                    images.push({
                        thumb: `${basePath}/${folderName}/thumbs/${filename}.jpg`,
                        src: `${basePath}/${folderName}/display/${filename}.jpg`,
                        zoom: `${basePath}/${folderName}/zoom/${filename}.jpg`,
                        title: `${folderName} - ${filename}`,
                        caption: `Film photography from ${folderName} collection`
                    });
                });
            });
        } else {
            // Get images for specific section
            const folderName = sectionMap[photoSection];
            if (folderName && imageLists[folderName]) {
                imageLists[folderName].forEach(filename => {
                    images.push({
                        thumb: `${basePath}/${folderName}/thumbs/${filename}.jpg`,
                        src: `${basePath}/${folderName}/display/${filename}.jpg`,
                        zoom: `${basePath}/${folderName}/zoom/${filename}.jpg`,
                        title: `${folderName} - ${filename}`,
                        caption: `Film photography from ${folderName} collection`
                    });
                });
            }
        }
        
        return images;
    },
    
    /**
     * Setup subheader for photography gallery
     */
    setupSubheaderForPhotography(photoSection) {
        if (!window.Subheader) return;
        
        const titles = {
            'life1': 'LIFE 1',
            'life2': 'LIFE 2',
            'morocco': 'MOROCCO',
            'nature': 'NATURE',
            'rom': 'ROM',
            'snow': 'SNOW',
            'urban': 'URBAN',
            'all': 'ALL PHOTOS'
        };
        
        window.Subheader.updateTitle(titles[photoSection] || 'PHOTOGRAPHY');
        
        // Build dropdown items
        const allPages = [
            { label: '← BACK TO PHOTOGRAPHY', path: '#art/photography', isCurrent: false },
            { label: 'ALL PHOTOS (128)', path: '#art/photography/all', isCurrent: photoSection === 'all' },
            { label: 'LIFE 1 (11)', path: '#art/photography/life1', isCurrent: photoSection === 'life1' },
            { label: 'LIFE 2 (19)', path: '#art/photography/life2', isCurrent: photoSection === 'life2' },
            { label: 'MOROCCO (52)', path: '#art/photography/morocco', isCurrent: photoSection === 'morocco' },
            { label: 'NATURE (4)', path: '#art/photography/nature', isCurrent: photoSection === 'nature' },
            { label: 'ROM (15)', path: '#art/photography/rom', isCurrent: photoSection === 'rom' },
            { label: 'SNOW (22)', path: '#art/photography/snow', isCurrent: photoSection === 'snow' },
            { label: 'URBAN (5)', path: '#art/photography/urban', isCurrent: photoSection === 'urban' }
        ];
        
        window.Subheader.setDropdownContent(allPages, (item) => {
            if (item.path) {
                this.navigateToPage(item.path);
            }
        });
        
        window.Subheader.show();
        
        if (window.SiteBoyApp && window.SiteBoyApp.setSubheaderState) {
            window.SiteBoyApp.setSubheaderState(true);
        }
        
        console.log('✅ Subheader setup for photography:', photoSection);
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