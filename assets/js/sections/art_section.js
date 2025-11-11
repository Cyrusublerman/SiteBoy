/**
 * Art Section - SiteBoy Framework
 * 
 * ART SECTION HANDLER - Gallery TOC with preview thumbnails
 * Handles art galleries and visual content with gallery preview TOC structure
 * 
 * @version 3.1.0 - R2 Storage Integration
 * @dependencies ['ComponentLibrary', 'R2Helper'] - Consolidated component system + R2 URLs
 */

import R2Helper from '../shared/r2-url-helper.js';

const ArtSection = {
    version: '3.1.0',
    currentContainer: null,
    componentInstances: [],
    navigationCallbacks: null,
    animationManager: null, // Generative animation manager for resource control
    
    // Simple page list for navigation
    pages: [
        '#art',
        '#art/digital',
        '#art/generative',
        '#art/generative/circles',
        '#art/generative/torus',
        '#art/generative/cymatics',
        '#art/generative/harmonics',
        '#art/generative/lissajous',
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
    
    // Generative animations metadata
    // Proper SiteBoy components extending BaseComponent
    generativeAnimations: [
        {
            id: 'circles',
            title: 'Nested Rolling Circles',
            type: 'component',
            componentClass: 'CirclesAnimation',
            scriptPath: '/art/Generative/animations/circles.js',
            description: 'Nested circles rolling within each other - 3 display modes',
            thumbnail: '/art/Generative/thumbs/circles.jpg',
            loopFrames: 3600,  // 60 seconds @ 60fps
            gui: ['LINES', 'B/W', 'GRADIENT']
        },
        {
            id: 'torus',
            title: 'Toroidal Spirals',
            type: 'component',
            componentClass: 'TorusAnimation',
            scriptPath: '/art/Generative/animations/torus.js',
            description: '3D toroidal spiral patterns in continuous rotation',
            thumbnail: '/art/Generative/thumbs/torus.jpg',
            loopFrames: 3600,  // 60 seconds @ 60fps
            gui: []
        },
        {
            id: 'cymatics',
            title: 'Cymatics',
            type: 'component',
            componentClass: 'CymaticsAnimation',
            scriptPath: '/art/Generative/animations/cymatics.js',
            description: 'Wave interference patterns - click canvas to add sources',
            thumbnail: '/art/Generative/thumbs/cymatics.jpg',
            loopFrames: 0,  // Infinite - user controlled
            gui: ['Pattern presets', 'Click to add sources', 'Clear']
        },
        {
            id: 'harmonics',
            title: 'Musical Harmonics',
            type: 'component',
            componentClass: 'HarmonicsAnimation',
            scriptPath: '/art/Generative/animations/harmonics.js',
            description: 'Musical intervals as Lissajous patterns - 12 minute cycle',
            thumbnail: '/art/Generative/thumbs/harmonics.jpg',
            loopFrames: 43200,  // 720 seconds (12 minutes) @ 60fps
            gui: ['Ratio display']
        },
        {
            id: 'lissajous',
            title: 'Harmonic Manifold Laboratory',
            type: 'component',
            componentClass: 'LissajousAnimation',
            scriptPath: '/art/Generative/animations/lissajous.js',
            description: 'Parametric harmonic curves with presets',
            thumbnail: '/art/Generative/thumbs/lissajous.jpg',
            loopFrames: 0,  // Infinite - user controlled
            gui: ['6 pattern presets']
        }
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
        } else if (subsection === 'generative') {
            this.renderGenerativeIndex(); // NEW: Grid of thumbnails
        } else if (subsection.startsWith('generative/')) {
            const animationId = subsection.replace('generative/', '');
            this.renderGenerativeAnimation(animationId); // NEW: Individual animation page
        } else {
            this.renderArtGallery(subsection);
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
     * Uses R2 URLs for images (Cloudflare R2 storage)
     */
    getPhotographyImages(photoSection) {
        const images = [];
        
        const sectionMap = {
            'life1': 'life1',
            'life2': 'life2',
            'morocco': 'morocco',
            'nature': 'nature',
            'rom': 'rom',
            'snow': 'snow',
            'urban': 'urban'
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
            // Get all images from all sections using R2
            Object.keys(sectionMap).forEach(key => {
                const galleryName = sectionMap[key];
                const capitalizedName = key.charAt(0).toUpperCase() + key.slice(1);
                const fileList = imageLists[capitalizedName] || [];
                fileList.forEach(filename => {
                    const urls = R2Helper.getPhotoUrlSet(galleryName, `${filename}.jpg`);
                    images.push({
                        thumb: urls.thumb,
                        src: urls.web,
                        zoom: urls.zoom,
                        title: `${capitalizedName} - ${filename}`,
                        caption: `Film photography from ${capitalizedName} collection`
                    });
                });
            });
        } else {
            // Get images for specific section using R2
            const galleryName = sectionMap[photoSection];
            const capitalizedName = photoSection.charAt(0).toUpperCase() + photoSection.slice(1);
            if (galleryName && imageLists[capitalizedName]) {
                imageLists[capitalizedName].forEach(filename => {
                    const urls = R2Helper.getPhotoUrlSet(galleryName, `${filename}.jpg`);
                    images.push({
                        thumb: urls.thumb,
                        src: urls.web,
                        zoom: urls.zoom,
                        title: `${capitalizedName} - ${filename}`,
                        caption: `Film photography from ${capitalizedName} collection`
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
     * Render generative art gallery with videos and canvas elements
     * Includes performance optimization: canvas only runs when in viewport
     */
    renderGenerativeGallery() {
        console.log('🎨 Rendering generative art gallery');
        
        this.currentContainer.innerHTML = '';
        const F = window.MathematicalFoundation ? window.MathematicalFoundation.F : 12;
        
        // Define generative art pieces (mix of videos and canvas sketches)
        const generativeWorks = [
            {
                id: 'phyllotaxis-sweep',
                title: 'Phyllotaxis Sweep',
                type: 'canvas',
                scriptPath: '/projects/Synthetic Biophilia/assets/p5/phyllo-sweep-siteboy.js',
                description: 'Interactive phyllotaxis pattern generator',
                width: 600,
                height: 600
            },
            {
                id: 'phyllotaxis-manual',
                title: 'Phyllotaxis Manual',
                type: 'canvas',
                scriptPath: '/projects/Synthetic Biophilia/assets/p5/phyllo-manual-siteboy.js',
                description: 'Manual control phyllotaxis exploration',
                width: 600,
                height: 600
            },
            {
                id: 'circles-animation',
                title: 'Nested Rolling Circles',
                type: 'animation',
                scriptPath: '/art/Generative/scripts/circles-animation.js',
                className: 'CirclesAnimation',
                description: 'Nested circles rolling within each other with multiple display modes',
                width: 600,
                height: 600
            },
            {
                id: 'torus-animation',
                title: 'Toroidal Spirals',
                type: 'animation',
                scriptPath: '/art/Generative/scripts/torus-animation.js',
                className: 'TorusAnimation',
                description: '3D toroidal spiral patterns in continuous rotation',
                width: 600,
                height: 600
            },
            {
                id: 'tile-animation',
                title: 'Deterministic Tiles',
                type: 'animation',
                scriptPath: '/art/Generative/scripts/tile-animation.js',
                className: 'TileAnimation',
                description: 'Grid of rotating geometric patterns with motion blur',
                width: 600,
                height: 600
            },
            {
                id: 'harmonics-animation',
                title: 'Musical Harmonics',
                type: 'animation',
                scriptPath: '/art/Generative/scripts/harmonics-animation.js',
                className: 'HarmonicsAnimation',
                description: 'Musical interval ratios visualized as Lissajous-like patterns',
                width: 600,
                height: 600
            },
            {
                id: 'cymatics-animation',
                title: 'Wave Interference',
                type: 'animation',
                scriptPath: '/art/Generative/scripts/cymatics-animation.js',
                className: 'CymaticsAnimation',
                description: 'Cymatic patterns from wave source interference',
                width: 600,
                height: 600
            },
            {
                id: 'lissajous-animation',
                title: 'Lissajous Morphology',
                type: 'animation',
                scriptPath: '/art/Generative/scripts/lissajous-animation.js',
                className: 'LissajousAnimation',
                description: 'Self-morphing parametric harmonic curves',
                width: 600,
                height: 600
            }
        ];
        
        // Create container for gallery
        const galleryContainer = this.createElement('div', 'generative-gallery');
        galleryContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(${F * 50}px, 1fr));
            gap: ${F * 4}px;
            padding: ${F * 2}px;
            width: 100%;
            box-sizing: border-box;
        `;
        
        // NEW: Initialize animation manager for better resource control
        // Uses AnimationFoundation + lazy loading + automatic pause/resume
        this.animationManager = new window.GenerativeAnimationManager();
        
        console.log('🎯 Using GenerativeAnimationManager for resource-efficient animation control');
        
        // Create gallery items
        generativeWorks.forEach((work, index) => {
            const itemContainer = this.createElement('div', 'generative-item');
            itemContainer.dataset.generativeId = work.id;
            itemContainer.style.cssText = `
                border: 1px solid var(--c-border);
                background: var(--c-bg);
                padding: ${F}px;
                display: flex;
                flex-direction: column;
                gap: ${F}px;
            `;
            
            // Title
            const titleEl = this.createElement('h3', 'generative-title');
            titleEl.textContent = work.title;
            titleEl.style.cssText = `
                margin: 0;
                font-size: ${F + 2}px;
                text-transform: uppercase;
                border-bottom: 1px solid var(--c-border);
                padding-bottom: ${F/2}px;
            `;
            itemContainer.appendChild(titleEl);
            
            // Content container
            const contentContainer = this.createElement('div', 'generative-content');
            contentContainer.style.cssText = `
                width: 100%;
                aspect-ratio: ${work.width} / ${work.height};
                background: var(--vga-black);
                border: 1px solid var(--c-border);
                position: relative;
                overflow: hidden;
            `;
            
            if (work.type === 'video') {
                // Video element
                const video = new ComponentLibrary.Video({
                    src: work.src,
                    poster: work.poster,
                    controls: true,
                    loop: true,
                    muted: true
                }, { MF: window.MathematicalFoundation });
                
                this.componentInstances.push(video);
                contentContainer.appendChild(video.render());
                
                // Videos don't need animation manager (handled by browser)
                
            } else if (work.type === 'canvas') {
                // P5.js canvas element
                const canvasId = `generative-${work.id}`;
                contentContainer.id = canvasId;
                
                // Load and initialize p5.js sketch
                this.loadP5Sketch(work.scriptPath, canvasId, work).then(p5Instance => {
                    // Register with animation manager for smart resource control
                    this.animationManager.register(work.id, itemContainer, {
                        type: 'p5',
                        p5Instance: p5Instance,
                        targetFPS: 60
                    });
                }).catch(err => {
                    console.error(`Failed to load sketch: ${work.scriptPath}`, err);
                    contentContainer.innerHTML = `<div style="padding: ${F}px; color: var(--vga-red);">Failed to load canvas</div>`;
                });
            } else if (work.type === 'animation') {
                // Vanilla JS animation with NEW animation manager
                this.loadAnimation(work.scriptPath, work.className, contentContainer, work).then(animationInstance => {
                    // Register with animation manager for lazy init + smart resource control
                    this.animationManager.register(work.id, itemContainer, {
                        type: 'legacy', // Has its own RAF loop
                        animationClass: window[work.className],
                        options: {
                            width: work.width,
                            height: work.height
                        },
                        targetFPS: 60
                    });
                }).catch(err => {
                    console.error(`Failed to load animation: ${work.scriptPath}`, err);
                    contentContainer.innerHTML = `<div style="padding: ${F}px; color: var(--vga-red);">Failed to load animation</div>`;
                });
            }
            
            itemContainer.appendChild(contentContainer);
            
            // Description
            if (work.description) {
                const descEl = this.createElement('p', 'generative-description');
                descEl.textContent = work.description;
                descEl.style.cssText = `
                    margin: 0;
                    font-size: ${F}px;
                    opacity: 0.8;
                    border-top: 1px solid var(--c-border);
                    padding-top: ${F/2}px;
                `;
                itemContainer.appendChild(descEl);
            }
            
            galleryContainer.appendChild(itemContainer);
        });
        
        this.currentContainer.appendChild(galleryContainer);
        
        // Animation manager is stored in this.animationManager
        // Automatic cleanup happens in this.cleanup()
        
        // Setup subheader
        this.setupSubheaderForGallery('generative');
        
        console.log('✅ Generative art gallery rendered');
    },
    
    /**
     * Render generative art index with grid of thumbnails
     * NEW: Each animation on its own page for better performance
     */
    renderGenerativeIndex() {
        console.log('🎨 Rendering generative art index (thumbnails)');
        
        this.currentContainer.innerHTML = '';
        const F = window.MathematicalFoundation ? window.MathematicalFoundation.F : 12;
        
        // Create grid container
        const gridContainer = this.createElement('div', 'generative-index-grid');
        gridContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(${F * 40}px, 1fr));
            gap: 0;
            padding: 0;
            width: 100%;
        `;
        
        // Create grid items
        this.generativeAnimations.forEach(anim => {
            const item = this.createElement('div', 'gen-index-item');
            item.style.cssText = `
                aspect-ratio: 1;
                border: 1px solid var(--c-border);
                background: var(--vga-black);
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: ${F * 2}px;
                transition: background 0.1s;
                position: relative;
                overflow: hidden;
            `;
            
            // Title
            const title = this.createElement('div', 'gen-index-title');
            title.textContent = anim.title.toUpperCase();
            title.style.cssText = `
                font-size: ${F + 2}px;
                color: var(--vga-green);
                margin-bottom: ${F}px;
                z-index: 1;
                pointer-events: none;
            `;
            
            // Subtitle
            const subtitle = this.createElement('div', 'gen-index-subtitle');
            subtitle.textContent = '[CLICK TO LOAD]';
            subtitle.style.cssText = `
                font-size: ${F - 2}px;
                color: var(--vga-green);
                opacity: 0.6;
                z-index: 1;
                pointer-events: none;
            `;
            
            item.appendChild(title);
            item.appendChild(subtitle);
            
            // Hover effect
            item.addEventListener('mouseenter', () => {
                item.style.background = 'var(--vga-darkgreen)';
            });
            item.addEventListener('mouseleave', () => {
                item.style.background = 'var(--vga-black)';
            });
            
            // Click handler
            item.addEventListener('click', () => {
                if (this.navigationCallbacks && this.navigationCallbacks.navigateToSection) {
                    this.navigationCallbacks.navigateToSection('art', `generative/${anim.id}`);
                } else {
                    window.location.hash = `art/generative/${anim.id}`;
                }
            });
            
            gridContainer.appendChild(item);
        });
        
        this.currentContainer.appendChild(gridContainer);
        
        // Setup subheader
        this.setupSubheaderForGenerative();
        
        console.log(`✅ Generative index rendered with ${this.generativeAnimations.length} animations`);
    },
    
    /**
     * Render individual generative animation page
     * Includes: Full animation + GUI controls + export functionality
     */
    renderGenerativeAnimation(animationId) {
        console.log(`🎨 Rendering individual animation: ${animationId}`);
        
        this.currentContainer.innerHTML = '';
        const F = window.MathematicalFoundation ? window.MathematicalFoundation.F : 12;
        
        // Find animation data
        const animData = this.generativeAnimations.find(a => a.id === animationId);
        if (!animData) {
            console.error(`❌ Animation not found: ${animationId}`);
            this.currentContainer.innerHTML = `<div style="padding: ${F * 4}px; text-align: center;">Animation not found</div>`;
            return;
        }
        
        // Create main container
        const mainContainer = this.createElement('div', 'animation-page');
        mainContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: ${F * 2}px;
            padding: ${F * 2}px;
            max-width: 1200px;
            margin: 0 auto;
        `;
        
        // Title section
        const titleSection = this.createElement('div', 'animation-title-section');
        titleSection.style.cssText = `
            border-bottom: 1px solid var(--c-border);
            padding-bottom: ${F}px;
        `;
        
        const title = this.createElement('h2');
        title.textContent = animData.title;
        title.style.cssText = `
            margin: 0 0 ${F/2}px 0;
            font-size: ${F * 2}px;
            text-transform: uppercase;
        `;
        
        const description = this.createElement('p');
        description.textContent = animData.description;
        description.style.cssText = `
            margin: 0;
            opacity: 0.8;
            font-size: ${F}px;
        `;
        
        titleSection.appendChild(title);
        titleSection.appendChild(description);
        
        // Loop info - ALWAYS show frames
        const loopInfo = this.createElement('p');
        if (animData.loopFrames > 0) {
            const seconds = (animData.loopFrames / 60).toFixed(1);
            const minutes = (animData.loopFrames / 3600).toFixed(1);
            loopInfo.textContent = animData.loopFrames >= 3600 
                ? `Loop: ${animData.loopFrames} frames (${minutes} min @ 60fps)`
                : `Loop: ${animData.loopFrames} frames (${seconds}s @ 60fps)`;
        } else {
            loopInfo.textContent = `Loop: Infinite (user-controlled)`;
        }
        loopInfo.style.cssText = `
            margin: ${F/2}px 0 0 0;
            opacity: 0.6;
            font-size: ${F - 2}px;
        `;
        titleSection.appendChild(loopInfo);
        
        // GUI info
        if (animData.gui && animData.gui.length > 0) {
            const guiInfo = this.createElement('p');
            guiInfo.textContent = `Controls: ${animData.gui.join(', ')}`;
            guiInfo.style.cssText = `
                margin: ${F/2}px 0 0 0;
                opacity: 0.6;
                font-size: ${F - 2}px;
            `;
            titleSection.appendChild(guiInfo);
        }
        
        // Animation container - proper component instantiation
        const animContainer = this.createElement('div');
        animContainer.id = `generative-${animationId}`;
        
        mainContainer.appendChild(titleSection);
        mainContainer.appendChild(animContainer);
        
        // Load and instantiate animation component
        if (animData.type === 'component' && animData.scriptPath) {
            import(animData.scriptPath)
                .then(module => {
                    // Get the component class
                    const AnimationClass = module[animData.componentClass] || window[animData.componentClass];
                    
                    if (!AnimationClass) {
                        console.error(`❌ Component class not found: ${animData.componentClass}`);
                        animContainer.textContent = 'Animation component not found';
                        return;
                    }
                    
                    // Instantiate the animation component
                    const animation = new AnimationClass(animContainer, {
                        MF: window.MathematicalFoundation,
                        Resize: window.ResizeManager
                    });
                    
                    // Render the component
                    animation.render();
                    
                    // Track for cleanup
                    this.componentInstances.push(animation);
                    
                    console.log(`✅ Animation component instantiated: ${animData.componentClass}`);
                })
                .catch(err => {
                    console.error(`❌ Failed to load animation: ${animData.scriptPath}`, err);
                    animContainer.textContent = 'Failed to load animation';
                });
        }
        
        this.currentContainer.appendChild(mainContainer)
        
        // Setup subheader with prev/next navigation
        this.setupSubheaderForAnimation(animationId);
        
        console.log(`✅ Animation page rendered: ${animationId}`);
    },
    
    /**
     * Create export controls for animation
     */
    createExportControls(animationId, animData, F) {
        const section = this.createElement('div', 'export-controls');
        section.style.cssText = `
            border: 1px solid var(--c-border);
            padding: ${F * 2}px;
            background: var(--c-bg);
        `;
        
        const heading = this.createElement('h3');
        heading.textContent = 'EXPORT';
        heading.style.cssText = `
            margin: 0 0 ${F}px 0;
            font-size: ${F + 2}px;
            text-transform: uppercase;
            border-bottom: 1px solid var(--c-border);
            padding-bottom: ${F/2}px;
        `;
        
        section.appendChild(heading);
        
        // Frame count input
        const frameRow = this.createElement('div');
        frameRow.style.cssText = `
            display: flex;
            gap: ${F}px;
            align-items: center;
            margin-bottom: ${F}px;
        `;
        
        const frameLabel = this.createElement('label');
        frameLabel.textContent = 'Frames:';
        frameLabel.style.cssText = `flex: 0 0 ${F * 8}px; font-size: ${F}px;`;
        
        const frameInput = this.createElement('input');
        frameInput.type = 'number';
        // Default based on loop length
        const defaultFrames = animData.loopFrames || 600;
        frameInput.value = defaultFrames.toString();
        frameInput.min = '1';
        frameInput.max = '10000';
        frameInput.style.cssText = `
            flex: 1;
            padding: ${F/2}px;
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Space Mono', monospace;
            font-size: ${F}px;
        `;
        
        frameRow.appendChild(frameLabel);
        frameRow.appendChild(frameInput);
        section.appendChild(frameRow);
        
        // Export buttons
        const buttonRow = this.createElement('div');
        buttonRow.style.cssText = `
            display: flex;
            gap: ${F}px;
        `;
        
        const exportGifBtn = new ComponentLibrary.Button({
            text: 'EXPORT GIF',
            onClick: () => {
                const frames = parseInt(frameInput.value) || 60;
                this.exportAnimationAsGif(animationId, frames);
            }
        }, { MF: window.MathematicalFoundation });
        
        const exportVideoBtn = new ComponentLibrary.Button({
            text: 'EXPORT VIDEO',
            onClick: () => {
                const frames = parseInt(frameInput.value) || 60;
                this.exportAnimationAsVideo(animationId, frames);
            }
        }, { MF: window.MathematicalFoundation });
        
        const exportFrameBtn = new ComponentLibrary.Button({
            text: 'SAVE FRAME',
            onClick: () => {
                this.exportCurrentFrame(animationId);
            }
        }, { MF: window.MathematicalFoundation });
        
        this.componentInstances.push(exportGifBtn, exportVideoBtn, exportFrameBtn);
        
        buttonRow.appendChild(exportGifBtn.render());
        buttonRow.appendChild(exportVideoBtn.render());
        buttonRow.appendChild(exportFrameBtn.render());
        
        section.appendChild(buttonRow);
        
        // Status message
        const statusMsg = this.createElement('div', 'export-status');
        statusMsg.style.cssText = `
            margin-top: ${F}px;
            font-size: ${F - 1}px;
            opacity: 0.7;
            min-height: ${F * 2}px;
        `;
        statusMsg.textContent = 'Configure frame count and click export to generate media files';
        
        section.appendChild(statusMsg);
        
        return section;
    },
    
    /**
     * Setup subheader for generative index
     */
    setupSubheaderForGenerative() {
        if (!window.Subheader) return;
        
        window.Subheader.updateTitle('GENERATIVE ART');
        
        const dropdownItems = [
            { label: '← BACK TO ART', path: '#art', isCurrent: false }
        ];
        
        window.Subheader.setDropdownContent(dropdownItems, (item) => {
            if (item.path) {
                this.navigateToPage(item.path);
            }
        });
        
        window.Subheader.show();
        
        if (window.SiteBoyApp && window.SiteBoyApp.setSubheaderState) {
            window.SiteBoyApp.setSubheaderState(true);
        }
    },
    
    /**
     * Setup subheader for individual animation with prev/next
     */
    setupSubheaderForAnimation(animationId) {
        if (!window.Subheader) return;
        
        const animData = this.generativeAnimations.find(a => a.id === animationId);
        if (!animData) return;
        
        window.Subheader.updateTitle(animData.title.toUpperCase());
        
        // Build dropdown with all animations
        const dropdownItems = [
            { label: '← BACK TO GENERATIVE', path: '#art/generative', isCurrent: false }
        ];
        
        this.generativeAnimations.forEach(anim => {
            dropdownItems.push({
                label: anim.title.toUpperCase(),
                path: `#art/generative/${anim.id}`,
                isCurrent: anim.id === animationId
            });
        });
        
        window.Subheader.setDropdownContent(dropdownItems, (item) => {
            if (item.path) {
                this.navigateToPage(item.path);
            }
        });
        
        // Setup navigation context for prev/next
        const navigationContext = {
            section: 'art',
            subsection: `generative/${animationId}`,
            items: this.generativeAnimations.map(a => ({
                path: `#art/generative/${a.id}`,
                title: a.title
            })),
            navigate: (section, subsection) => {
                if (this.navigationCallbacks && this.navigationCallbacks.navigateToSection) {
                    this.navigationCallbacks.navigateToSection(section, subsection);
                }
            }
        };
        window.Subheader.updateNavigation(navigationContext);
        
        window.Subheader.show();
        
        if (window.SiteBoyApp && window.SiteBoyApp.setSubheaderState) {
            window.SiteBoyApp.setSubheaderState(true);
        }
    },
    
    /**
     * Export animation as GIF
     */
    async exportAnimationAsGif(animationId, frameCount) {
        console.log(`📦 Exporting ${animationId} as GIF (${frameCount} frames)`);
        alert(`GIF export coming soon! Will capture ${frameCount} frames.`);
        // TODO: Implement GIF.js or similar library for GIF generation
    },
    
    /**
     * Export animation as video
     */
    async exportAnimationAsVideo(animationId, frameCount) {
        console.log(`🎬 Exporting ${animationId} as video (${frameCount} frames)`);
        alert(`Video export coming soon! Will capture ${frameCount} frames.`);
        // TODO: Implement MediaRecorder API or canvas frame capture
    },
    
    /**
     * Generate placeholder image for missing thumbnails
     */
    generatePlaceholderImage(animData) {
        // Create a simple SVG placeholder
        const svg = `
            <svg width="600" height="600" xmlns="http://www.w3.org/2000/svg">
                <rect width="600" height="600" fill="#000000"/>
                <text x="50%" y="50%" 
                      font-family="Space Mono, monospace" 
                      font-size="24" 
                      fill="#00FF00" 
                      text-anchor="middle" 
                      dominant-baseline="middle">
                    ${animData.title.toUpperCase()}
                </text>
                <text x="50%" y="55%" 
                      font-family="Space Mono, monospace" 
                      font-size="12" 
                      fill="#00AA00" 
                      text-anchor="middle" 
                      dominant-baseline="middle">
                    [THUMBNAIL PENDING]
                </text>
            </svg>
        `;
        return 'data:image/svg+xml;base64,' + btoa(svg);
    },
    
    /**
     * Export current frame as image
     */
    exportCurrentFrame(animationId) {
        const container = document.getElementById(animationId);
        if (!container) return;
        
        const canvas = container.querySelector('canvas');
        if (!canvas) {
            alert('No canvas found to export');
            return;
        }
        
        // Create download link
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `${animationId}-frame-${Date.now()}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            console.log(`✅ Frame exported: ${link.download}`);
        });
    },
    
    /**
     * Load a P5.js sketch dynamically
     * @param {string} scriptPath - Path to the sketch file
     * @param {string} containerId - ID of the container element
     * @param {Object} config - Configuration object with width, height, etc.
     * @returns {Promise} Resolves with p5 instance
     */
    async loadP5Sketch(scriptPath, containerId, config) {
        // Ensure p5.js library is loaded
        if (typeof window.p5 === 'undefined') {
            await this.loadP5Library();
        }
        
        return new Promise((resolve, reject) => {
            // Load the sketch script
            const script = document.createElement('script');
            script.src = scriptPath;
            script.type = 'module';
            
            script.onload = () => {
                // Wait a bit for the sketch to initialize
                setTimeout(() => {
                    // The sketch should have created a global function or attached to window
                    // This depends on how your p5 sketches are structured
                    console.log(`✅ Loaded sketch: ${scriptPath}`);
                    resolve(null); // Return null for now, actual p5 instance tracking TBD
                }, 100);
            };
            
            script.onerror = (err) => {
                reject(new Error(`Failed to load sketch: ${scriptPath}`));
            };
            
            document.head.appendChild(script);
        });
    },
    
    /**
     * Load P5.js library from CDN
     */
    async loadP5Library() {
        if (typeof window.p5 !== 'undefined') {
            return Promise.resolve();
        }
        
        console.log('📦 Loading p5.js library...');
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.2/p5.min.js';
            script.onload = () => {
                console.log('✅ p5.js library loaded');
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },
    
    /**
     * Load vanilla JS animation
     */
    async loadAnimation(scriptPath, className, container, config) {
        return new Promise((resolve, reject) => {
            // Load the animation script
            const script = document.createElement('script');
            script.src = scriptPath;
            
            script.onload = () => {
                // Wait a bit for the script to register
                setTimeout(() => {
                    // Instantiate the animation class
                    if (typeof window[className] !== 'undefined') {
                        try {
                            const animationInstance = new window[className](container, {
                                width: config.width,
                                height: config.height
                            });
                            
                            // Start the animation
                            animationInstance.start();
                            
                            console.log(`✅ Loaded and started animation: ${className}`);
                            resolve(animationInstance);
                        } catch (err) {
                            console.error(`Error instantiating ${className}:`, err);
                            reject(err);
                        }
                    } else {
                        reject(new Error(`Animation class ${className} not found after loading ${scriptPath}`));
                    }
                }, 100);
            };
            
            script.onerror = (err) => {
                reject(new Error(`Failed to load animation script: ${scriptPath}`));
            };
            
            document.head.appendChild(script);
        });
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
        
        // Clean up intersection observer for generative gallery (legacy)
        if (this.generativeObserver) {
            this.generativeObserver.disconnect();
            this.generativeObserver = null;
        }
        
        // Cleanup animation manager (NEW - unified resource management)
        if (this.animationManager) {
            this.animationManager.destroyAll();
            this.animationManager = null;
        }
        
        // Remove loaded animation JS files
        document.querySelectorAll('script[data-anim-id]').forEach(el => el.remove());
        
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