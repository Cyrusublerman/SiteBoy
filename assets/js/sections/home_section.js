/**
 * Home Section - SiteBoy Framework
 * 
 * HOME SECTION - Simple Numbered TOC (same style as blog)
 * Shows numbered table of contents with sections and subsections
 * Uses same styling as blog section TOC for consistency
 * 
 * @version 3.1.0 - Simple Numbered TOC Home Page
 * @dependencies ['ComponentLibrary'] - Component system
 */

const HomeSection = {
    version: '3.1.0',
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
                { id: 'docs', title: 'Documentation', path: '#blog/docs' },
                { id: 'music', title: 'Music Theory', path: '#blog/music' },
                { id: 'site', title: 'Site Development', path: '#blog/site' },
                { id: 'tools', title: 'Development Tools', path: '#blog/tools' }
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
     * Render TOC-only home page (using same style as blog TOC)
     */
    renderTOCHomePage() {
        console.log('🏠 Rendering simple numbered TOC home page...');
        
        // Clear container
        this.currentContainer.innerHTML = '';
        
        // Add TOC container class for proper CSS styling
        this.currentContainer.classList.add('toc-container');
        
        // Ensure proper body sizing for home page (no subheader)
        if (window.LayoutCalculator) {
            // Apply layout calculations for content container  
            const contentContainer = this.currentContainer.closest('.content-container');
            if (contentContainer) {
                // Force content container to use no-subheader layout
                const F = window.LayoutCalculator.F;
                contentContainer.style.setProperty('--comp-min-h', `calc(100vh - ${F * 4}px)`); // Header only (2*F) + some padding
                contentContainer.style.setProperty('--top-offset', `${F * 2}px`); // Just header height
                console.log('✅ Applied no-subheader body sizing for home page');
            }
        }
        
        // Add Solar System visualization above TOC
        console.log('🔍 Checking for SolarSystemTool:', typeof window.SolarSystemTool);
        
        if (window.SolarSystemTool) {
            // Get actual computed padding from content container
            const contentContainer = this.currentContainer.closest('.content-container');
            const computedStyle = contentContainer ? window.getComputedStyle(contentContainer) : null;
            const paddingLeft = computedStyle ? parseInt(computedStyle.paddingLeft) : 0;
            const paddingRight = computedStyle ? parseInt(computedStyle.paddingRight) : 0;
            const paddingTop = computedStyle ? parseInt(computedStyle.paddingTop) : 0;
            
            const F = window.LayoutCalculator ? window.LayoutCalculator.F : 12;
            
            const solarSystemContainer = document.createElement('div');
            solarSystemContainer.className = 'solar-system-home';
            solarSystemContainer.style.cssText = `
                width: calc(100% + ${paddingLeft + paddingRight}px);
                margin: -${paddingTop}px -${paddingRight}px ${F * 2}px -${paddingLeft}px;
                padding: 0;
                background: #000000;
                box-sizing: border-box;
                display: flex;
                justify-content: center;
                align-items: center;
            `;
            
            console.log('🌌 Creating SolarSystemTool with computed padding:', {paddingLeft, paddingRight, paddingTop});
            
            const solarSystem = new window.SolarSystemTool(solarSystemContainer, {
                MF: window.LayoutCalculator,
                Resize: window.ResizeManager
            });
            
            this.componentInstances.push(solarSystem);
            solarSystem.render();
            this.currentContainer.appendChild(solarSystemContainer);
            
            console.log('✅ Solar System visualization added to home page');
        } else {
            console.warn('⚠️ SolarSystemTool not found on window object');
        }
        
        // Create simple TOC using proper ComponentLibrary component
        const tocData = this.prepareSimpleTOCData();
        const simpleTOC = new ComponentLibrary.SimpleTOC({
            sections: tocData,
            onItemClick: (item) => this.handleTOCItemClick(item)
        }, {
            MF: window.MathematicalFoundation,
            Resize: window.ResizeManager
        });
        
        this.componentInstances.push(simpleTOC);
        this.currentContainer.appendChild(simpleTOC.render());
        
        console.log('✅ Simple TOC home page rendered using ComponentLibrary');
    },

    /**
     * Prepare TOC data for SimpleTOC component (sections only, no numbers)
     */
    prepareSimpleTOCData() {
        return this.mainSections.map(section => ({
            title: section.title,
            description: section.description,
            id: section.id
        }));
    },

    /**
     * Handle TOC item click from SimpleTOC component
     */
    handleTOCItemClick(item) {
        this.navigateToSection(item.id);
        console.log(`🏠 TOC item clicked: ${item.title} -> ${item.id}`);
    },
    
    /**
     * Handle section click (navigation only - no expansion)
     * @param {string} sectionId - Section ID
     */
    handleSectionClick(sectionId) {
        this.navigateToSection(sectionId);
        console.log(`🏠 Navigating to section: ${sectionId}`);
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
            componentCount: this.componentInstances.length
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