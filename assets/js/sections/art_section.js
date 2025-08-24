/**
 * Art Section - SiteBoy Framework
 * 
 * ART SECTION HANDLER - HierarchicalTOC with gallery pages
 * Handles art galleries and visual content with proper TOC structure
 * 
 * @version 2.0.0 - TOC Structure
 * @dependencies ['ComponentLibrary'] - Consolidated component system
 */

const ArtSection = {
    version: '2.0.0',
    currentContainer: null,
    componentInstances: [],
    navigationCallbacks: null,
    
    /**
     * Handle route changes for art section
     * @param {string|null} subsection - Subsection path
     * @param {HTMLElement} container - Content container
     * @param {Object} callbacks - Navigation callbacks (injected from router)
     */
    handleRoute(subsection, container, callbacks = {}) {
        console.log(`🎨 Art Section v${this.version} handling route: ${subsection || 'index'}`);
        
        this.currentContainer = container;
        this.navigationCallbacks = callbacks;
        this.cleanup();
        
        // Hide subheader for index, show for specific art galleries
        if (window.Subheader) {
            if (subsection) {
                window.Subheader.updateTitle(`art/${subsection}`);
                window.Subheader.show();
            } else {
                window.Subheader.hide();
            }
        }
        
        if (!subsection) {
            this.renderArtIndex();
        } else {
            this.renderArtGallery(subsection);
        }
    },
    
    /**
     * Render art index using ComponentLibrary HierarchicalTOC
     */
    renderArtIndex() {
        console.log('🎨 Rendering art index with HierarchicalTOC component');
        
        // Clear container and add TOC container class for proper CSS styling
        this.currentContainer.innerHTML = '';
        this.currentContainer.classList.add('toc-container');
        
        // Apply proper body sizing for art index (no subheader)
        if (window.MathematicalFoundation) {
            const contentContainer = this.currentContainer.closest('.content-container');
            if (contentContainer) {
                window.MathematicalFoundation.applyContainerVars(contentContainer, { 
                    withSubheader: false 
                });
                console.log('✅ Applied no-subheader body sizing for art index');
            }
        }
        
        // Define art sections structure matching home section pattern
        const artSections = [
            {
                id: 'digital',
                title: 'DIGITAL COMPOSITIONS',
                description: 'Digital artworks and computer-generated compositions',
                isExpandable: true,
                isExpanded: true, // Start expanded for better UX
                subsections: [
                    { id: 'gallery', title: 'Digital Gallery', path: '#art/digital' }
                ]
            },
            {
                id: 'generative',
                title: 'GENERATIVE ART',
                description: 'Algorithmic and procedurally generated artworks',
                isExpandable: true,
                isExpanded: true, // Start expanded for better UX
                subsections: [
                    { id: 'gallery', title: 'Generative Gallery', path: '#art/generative' }
                ]
            },
            {
                id: 'sketches',
                title: 'SKETCHES & STUDIES',
                description: 'Traditional and digital sketches, studies, and experiments',
                isExpandable: true,
                isExpanded: false, // Start collapsed
                subsections: [
                    { id: 'gallery', title: 'Sketches Gallery', path: '#art/sketches' }
                ]
            },
            {
                id: 'photography',
                title: 'PHOTOGRAPHY',
                description: 'Photographic works and visual documentation',
                isExpandable: true,
                isExpanded: false, // Start collapsed
                subsections: [
                    { id: 'gallery', title: 'Photo Gallery', path: '#art/photography' }
                ]
            }
        ];
        
        // Create hierarchical TOC component using ComponentLibrary with dependencies
        const tocComponent = new ComponentLibrary.HierarchicalTOC({
            sections: artSections,
            onSectionClick: (sectionId) => this.handleSectionClick(sectionId),
            onSubsectionClick: (path) => this.handleSubsectionClick(path)
        }, {
            MF: window.MathematicalFoundation,
            Resize: window.ResizeManager
        });
        
        this.componentInstances.push(tocComponent);
        this.currentContainer.appendChild(tocComponent.render());
        
        console.log('✅ Art index rendered with HierarchicalTOC component');
    },
    
    /**
     * Handle section click (expansion toggle)
     * @param {string} sectionId - Section ID
     */
    handleSectionClick(sectionId) {
        console.log(`🎨 Section clicked: ${sectionId}`);
        // Find the TOC component and toggle the section
        const tocComponent = this.componentInstances.find(comp => comp instanceof ComponentLibrary.HierarchicalTOC);
        if (tocComponent) {
            tocComponent.toggleSection(sectionId);
        }
    },
    
    /**
     * Handle subsection click (navigation)
     * @param {string} path - Navigation path
     */
    handleSubsectionClick(path) {
        console.log(`🎨 Subsection clicked: ${path}`);
        
        // Extract section and subsection from path (e.g., '#art/digital')
        const hashPath = path.replace('#', '');
        const [section, subsection] = hashPath.split('/');
        
        // Use injected navigation callback
        if (this.navigationCallbacks && this.navigationCallbacks.navigateToSection) {
            this.navigationCallbacks.navigateToSection(section, subsection);
        } else {
            console.warn('Navigation callback not available');
        }
    },
    
    /**
     * Render individual art gallery page
     */
    renderArtGallery(galleryId) {
        console.log(`🎨 Rendering art gallery: ${galleryId}`);
        
        // Gallery information based on TOC structure
        const galleries = {
            'digital': {
                title: 'Digital Compositions',
                description: 'Digital artworks and computer-generated compositions',
                artworks: ['Abstract 01', 'Abstract 02', 'Digital Landscape', 'Geometric Study', 'Color Composition', 'Vector Art']
            },
            'generative': {
                title: 'Generative Art',
                description: 'Algorithmic and procedurally generated artworks',
                artworks: ['Algorithm 01', 'Fractal Study', 'Noise Pattern', 'Recursive Design', 'Parameter Space', 'Code Art']
            },
            'sketches': {
                title: 'Sketches & Studies',
                description: 'Traditional and digital sketches, studies, and experiments',
                artworks: ['Sketch 01', 'Character Study', 'Figure Drawing', 'Environment Study', 'Gesture Drawing', 'Concept Art']
            },
            'photography': {
                title: 'Photography',
                description: 'Photographic works and visual documentation',
                artworks: ['Portrait 01', 'Landscape', 'Street Photo', 'Architecture', 'Nature Study', 'Urban Scene']
            }
        };
        
        const gallery = galleries[galleryId] || {
            title: galleryId.toUpperCase(),
            description: 'Gallery description to be added',
            artworks: ['Placeholder 1', 'Placeholder 2', 'Placeholder 3']
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
            title: artwork
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
        const backParagraph = new ComponentLibrary.Paragraph({
            content: '← Back to Art Gallery'
        });
        this.componentInstances.push(backParagraph);
        
        const backElement = backParagraph.render();
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
        element.style.fontFamily = '"Space Mono", monospace';
        element.style.fontSize = '12px';
        element.style.lineHeight = '1.5';
        element.style.padding = '12px';
        
        return element;
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
