/**
 * Home Section - SiteBoy Framework
 * 
 * HOME SECTION - TOC ONLY (matching reference design)
 * Shows hierarchical Table of Contents component ONLY
 * Uses canonical ComponentLibrary with HierarchicalTOC
 * 
 * @version 3.0.0 - TOC-Only Home Page
 * @dependencies ['ComponentLibrary'] - TOC component system
 */

const HomeSection = {
    version: '3.0.0',
    currentContainer: null,
    componentInstances: [],
    navigationCallbacks: null,
    
    // Main sections data matching old structure with subsections
    mainSections: [
        {
            id: 'blog',
            title: 'BLOG',
            description: 'Articles about music theory, development, and technical topics',
            isExpandable: true,
            isExpanded: false,
            subsections: [
                { id: 'music', title: 'Music Theory & Analysis', path: '#blog/music' },
                { id: 'site', title: 'Site Development', path: '#blog/site' },
                { id: 'tools', title: 'Tool Development', path: '#blog/tools' }
            ]
        },
        {
            id: 'art', 
            title: 'ART',
            description: 'Digital artworks and visual projects',
            isExpandable: true,
            isExpanded: false,
            subsections: [
                { id: 'digital', title: 'Digital Compositions', path: '#art/digital' },
                { id: 'generative', title: 'Generative Art', path: '#art/generative' },
                { id: 'sketches', title: 'Sketches & Studies', path: '#art/sketches' }
            ]
        },
        {
            id: 'tools',
            title: 'TOOLS', 
            description: 'Calculators and utilities for creative work',
            isExpandable: true,
            isExpanded: false,
            subsections: [
                { id: 'color-picker', title: 'Color Picker', path: '#tools/color-picker' },
                { id: 'grid-test', title: 'Grid Tester', path: '#tools/grid-test' },
                { id: 'typography', title: 'Typography Tool', path: '#tools/typography' }
            ]
        },
        {
            id: 'projects',
            title: 'PROJECTS',
            description: 'Selected works, experiments, and technical demos',
            isExpandable: true,
            isExpanded: false,
            subsections: [
                { id: 'siteboy', title: 'SiteBoy Framework', path: '#projects/siteboy' },
                { id: 'vga-renderer', title: 'VGA Renderer', path: '#projects/vga-renderer' },
                { id: 'math-foundation', title: 'Math Foundation', path: '#projects/math-foundation' }
            ]
        }
    ],
    
    /**
     * Handle route changes for home section
     * @param {string|null} subsection - Subsection path (should be null for home)
     * @param {HTMLElement} container - Content container
     * @param {Object} callbacks - Navigation callbacks (injected from router)
     */
    handleRoute(subsection, container, callbacks = {}) {
        console.log(`🏠 Home Section v${this.version} handling route: ${subsection || 'main'}`);
        
        this.currentContainer = container;
        this.navigationCallbacks = callbacks;
        this.cleanup();
        
        // Hide subheader for home page (TOC pages don't need subheader)
        if (window.Subheader) {
            window.Subheader.hide();
            console.log('✅ Hidden subheader for home page');
        }
        
        // Home page shows only TOC component
        this.renderTOCHomePage();
    },
    
    /**
     * Render TOC-only home page (matching reference design)
     */
    renderTOCHomePage() {
        console.log('🏠 Rendering TOC-only home page...');
        
        // Clear container
        this.currentContainer.innerHTML = '';
        
        // Add TOC container class for proper CSS styling
        this.currentContainer.classList.add('toc-container');
        
        // Apply proper body sizing for home page (no subheader)
        if (window.MathematicalFoundation) {
            // Find the content container (parent of content-body)
            const contentContainer = this.currentContainer.closest('.content-container');
            if (contentContainer) {
                window.MathematicalFoundation.applyContainerVars(contentContainer, { 
                    withSubheader: false 
                });
                console.log('✅ Applied no-subheader body sizing for home page');
            }
        }
        
        // Create hierarchical TOC component using ComponentLibrary with dependencies
        const tocComponent = new ComponentLibrary.HierarchicalTOC({
            sections: this.mainSections,
            onSectionClick: (sectionId) => this.handleSectionClick(sectionId),
            onSubsectionClick: (path) => this.handleSubsectionClick(path)
        }, {
            MF: window.MathematicalFoundation,
            Resize: window.ResizeManager
        });
        
        this.componentInstances.push(tocComponent);
        this.currentContainer.appendChild(tocComponent.render());
        
        console.log('✅ TOC-only home page rendered with HierarchicalTOC component');
    },
    
    /**
     * Handle section click (expansion toggle or navigation)
     * @param {string} sectionId - Section ID
     */
    handleSectionClick(sectionId) {
        const section = this.mainSections.find(s => s.id === sectionId);
        if (!section) return;
        
        if (section.isExpandable) {
            // Toggle expansion
            section.isExpanded = !section.isExpanded;
            
            // Re-render the TOC
            this.rerenderTOC();
            
            console.log(`🏠 Toggled section ${sectionId}: ${section.isExpanded ? 'expanded' : 'collapsed'}`);
        } else {
            // Navigate to section
            this.navigateToSection(sectionId);
        }
    },
    
    /**
     * Handle subsection click (navigation)
     * @param {string} path - Subsection path (e.g., '#blog/music')
     */
    handleSubsectionClick(path) {
        // Parse path like "#blog/music" into section and subsection
        const pathParts = path.substring(1).split('/'); // Remove # and split
        const section = pathParts[0];
        const subsection = pathParts[1] || null;
        
        this.navigateToSection(section, subsection);
        
        console.log(`🏠 Clicked subsection: ${path}`);
    },
    
    /**
     * Navigate to section using injected callbacks
     * @param {string} section - Section name
     * @param {string} subsection - Optional subsection
     */
    navigateToSection(section, subsection = null) {
        if (this.navigationCallbacks && this.navigationCallbacks.navigateToSection) {
            this.navigationCallbacks.navigateToSection(section, subsection);
        } else {
            console.warn('⚠️ Navigation callbacks not available');
        }
    },
    
    /**
     * Re-render the TOC component (for expansion changes)
     */
    rerenderTOC() {
        // Clear current content
        this.currentContainer.innerHTML = '';
        
        // Destroy old TOC component
        ComponentLibrary.destroyTracked(this.componentInstances);
        
        // Create new TOC component with updated sections and dependencies
        const tocComponent = new ComponentLibrary.HierarchicalTOC({
            sections: this.mainSections,
            onSectionClick: (sectionId) => this.handleSectionClick(sectionId),
            onSubsectionClick: (path) => this.handleSubsectionClick(path)
        }, {
            MF: window.MathematicalFoundation,
            Resize: window.ResizeManager
        });
        
        this.componentInstances.push(tocComponent);
        this.currentContainer.appendChild(tocComponent.render());
        
        console.log('🔄 TOC re-rendered');
    },
    
    /**
     * Cleanup section - destroy all component instances
     */
    cleanup() {
        if (this.currentContainer) {
            this.currentContainer.innerHTML = '';
            // Remove TOC container class
            this.currentContainer.classList.remove('toc-container');
        }
        
        // Destroy tracked components using ComponentLibrary method
        ComponentLibrary.destroyTracked(this.componentInstances);
        
        console.log('✅ Home section cleanup complete');
    },
    
    /**
     * Get section info
     */
    getSectionInfo() {
        return {
            name: 'home',
            title: 'HOME',
            type: 'toc',
            sectionCount: this.mainSections.length,
            expandedSections: this.mainSections.filter(s => s.isExpanded).length
        };
    },
    
    /**
     * Initialize section (legacy support)
     */
    init() {
        console.log(`🏠 Home Section v${this.version} initialized - TOC-Only Home Page`);
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
window.HomeSection = HomeSection;

console.log(`🏠 Home Section v${HomeSection.version} ready - TOC-Only Home Page`);