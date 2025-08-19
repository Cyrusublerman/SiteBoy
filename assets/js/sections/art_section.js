/**
 * Art Section - SiteBoy Framework
 * 
 * ART SECTION HANDLER - JSON-driven art content
 * Handles art galleries and visual content
 * 
 * @version 1.0.0 - Art Section
 * @dependencies ['ComponentLibrary'] - Consolidated component system
 */

const ArtSection = {
    version: '1.0.0',
    currentContainer: null,
    componentInstances: [],
    
    /**
     * Handle route changes for art section
     */
    handleRoute(subsection, container) {
        console.log(`🎨 Art Section v${this.version} handling route: ${subsection || 'index'}`);
        
        this.currentContainer = container;
        this.cleanup();
        
        // Hide subheader for index, show for specific art pieces
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
            this.renderArtPiece(subsection);
        }
    },
    
    /**
     * Render art index/gallery
     */
    renderArtIndex() {
        console.log('🎨 Rendering art index');
        
        // Create art gallery grid
        const artItems = [
            'Digital Art 1', 'Digital Art 2', 'Sketch 1', 'Sketch 2',
            'Photography 1', 'Photography 2', 'Design 1', 'Design 2'
        ];
        
        const { container: gridContainer, component: gridComponent } = ComponentLibrary.grid(
            artItems,
            {
                cols: 4,
                onItemClick: (item, index) => {
                    const artId = `piece-${index + 1}`;
                    Router.navigateToSection('art', artId);
                }
            }
        );
        
        this.componentInstances.push(gridComponent);
        
        // Add title
        const title = this.createElement('h1');
        title.textContent = 'ART GALLERY';
        title.style.marginBottom = '24px';
        
        this.currentContainer.appendChild(title);
        this.currentContainer.appendChild(gridContainer);
        
        // Add description
        const description = this.createElement('p');
        description.innerHTML = 'Click on any artwork to view details. Art content will be loaded from JSON files as per the canonical structure.';
        description.style.marginTop = '24px';
        this.currentContainer.appendChild(description);
    },
    
    /**
     * Render individual art piece
     */
    renderArtPiece(artId) {
        console.log(`🎨 Rendering art piece: ${artId}`);
        
        const artContent = this.createElement('div', 'art-piece');
        artContent.innerHTML = `
            <h1>ART PIECE: ${artId.toUpperCase()}</h1>
            
            <div style="
                width: 400px; height: 300px; margin: 24px 0;
                border: 1px solid var(--c-border);
                display: flex; align-items: center; justify-content: center;
                background: var(--c-bg);
            ">
                <p>ARTWORK PLACEHOLDER</p>
            </div>
            
            <h2>DETAILS</h2>
            <p><strong>Title:</strong> ${artId}</p>
            <p><strong>Medium:</strong> Digital/Traditional</p>
            <p><strong>Created:</strong> 2024</p>
            
            <h2>DESCRIPTION</h2>
            <p>This is a placeholder for the artwork description. The actual content will be loaded from JSON files as per the canonical structure.</p>
            
            <p><a href="#art">← Back to Art Gallery</a></p>
        `;
        
        this.currentContainer.appendChild(artContent);
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
        }
        
        // Destroy tracked components
        this.componentInstances.forEach(component => {
            if (component.destroy) component.destroy();
        });
        this.componentInstances = [];
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
