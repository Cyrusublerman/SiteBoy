/**
 * Router - SiteBoy Framework
 * 
 * PURE ROUTING LOGIC - Decoupled from components
 * Handles URL hash changes and delegates to section JS files
 * Injects navigation callbacks to maintain separation
 * 
 * @version 2.0.0 - Decoupled Router
 * @dependencies [] - Self-contained
 */

const Router = {
    version: '2.0.0',
    
    // Router state
    currentSection: null,
    currentSubsection: null,
    contentContainer: null,
    
    // Available sections (must match section JS files)
    sections: {
        'home': 'HomeSection',
        'blog': 'BlogSection',
        'art': 'ArtSection', 
        'tools': 'ToolsSection',
        'projects': 'ProjectsSection'
    },
    
    /**
     * Initialize router - watch URL changes
     */
    init(contentContainer) {
        console.log(`🧭 Router v${this.version} initializing...`);
        
        this.contentContainer = contentContainer;
        
        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleRouteChange());
        
        // Handle initial route
        this.handleRouteChange();
        
        console.log('✅ Router initialized - Decoupled architecture');
    },
    
    /**
     * Parse current URL hash into section and subsection
     */
    parseRoute() {
        const hash = window.location.hash.slice(1); // Remove #
        
        if (!hash || hash === 'home') {
            return { section: 'home', subsection: null };
        }
        
        const parts = hash.split('/');
        const section = parts[0] || 'home';
        
        // If there are more parts, join them as the subsection path
        const subsection = parts.length > 1 ? parts.slice(1).join('/') : null;
        
        return { section, subsection };
    },
    
    /**
     * Handle route changes - determine section and load it
     */
    handleRouteChange() {
        const route = this.parseRoute();
        const { section, subsection } = route;
        
        console.log(`🧭 Route change: ${section}${subsection ? '/' + subsection : ''}`);
        
        // Update router state
        this.currentSection = section;
        this.currentSubsection = subsection;
        
        // Load the section
        this.loadSection(section, subsection);
    },
    
    /**
     * Load section - delegate to section JS file with injected callbacks
     */
    loadSection(sectionName, subsectionName) {
        if (!this.contentContainer) {
            console.error('❌ No content container available for routing');
            return;
        }
        
        // Clear content container
        this.contentContainer.innerHTML = '';
        
        try {
            // Delegate to section JS file
            const sectionClass = this.sections[sectionName];
            
            if (!sectionClass) {
                console.error(`❌ Unknown section: ${sectionName}`);
                this.loadErrorPage(`Section not found: ${sectionName}`);
                return;
            }
            
            // Check if section class exists globally
            const SectionModule = window[sectionClass];
            if (!SectionModule) {
                console.error(`❌ Section module not loaded: ${sectionClass}`);
                this.loadErrorPage(`Section module not available: ${sectionClass}`);
                return;
            }
            
            // Create navigation callbacks (decoupled interface)
            const navigationCallbacks = {
                navigateToSection: (section, subsection = null) => {
                    this.navigateToSection(section, subsection);
                },
                getCurrentRoute: () => this.getCurrentRoute(),
                goBack: () => window.history.back(),
                goForward: () => window.history.forward()
            };
            
            // Let section handle its own page building with injected callbacks
            if (typeof SectionModule.handleRoute === 'function') {
                SectionModule.handleRoute(subsectionName, this.contentContainer, navigationCallbacks);
            } else if (typeof SectionModule.init === 'function') {
                SectionModule.init();
                if (typeof SectionModule.render === 'function') {
                    const sectionContent = SectionModule.render(subsectionName);
                    this.contentContainer.appendChild(sectionContent);
                }
            } else {
                console.error(`❌ Section ${sectionClass} missing handleRoute or init method`);
                this.loadErrorPage(`Section ${sectionName} not properly implemented`);
            }
            
        } catch (error) {
            console.error(`❌ Error loading section ${sectionName}:`, error);
            this.loadErrorPage(`Failed to load ${sectionName}: ${error.message}`);
        }
    },
    
    /**
     * Load error page using ComponentLibrary
     */
    loadErrorPage(message) {
        console.error(`❌ Loading error page: ${message}`);
        
        // Use ComponentLibrary if available, fallback to basic DOM
        if (window.ComponentLibrary) {
            try {
                const errorHeading = new ComponentLibrary.Heading({
                    level: 1,
                    content: 'SYSTEM ERROR'
                });
                
                const errorMessage = new ComponentLibrary.Paragraph({
                    content: message
                });
                
                const reloadButton = new ComponentLibrary.Button({
                    text: 'RELOAD APPLICATION',
                    onClick: () => window.location.reload()
                });
                
                this.contentContainer.appendChild(errorHeading.render());
                this.contentContainer.appendChild(errorMessage.render());
                this.contentContainer.appendChild(reloadButton.render());
                
                return;
            } catch (componentError) {
                console.error('Failed to use ComponentLibrary for error page:', componentError);
            }
        }
        
        // Fallback to basic DOM creation
        const errorContainer = document.createElement('div');
        errorContainer.style.cssText = `
            padding: 48px;
            text-align: center;
            font-family: 'Space Mono', monospace;
            font-size: 12px;
        `;
        
        const errorTitle = document.createElement('h1');
        errorTitle.textContent = 'SYSTEM ERROR';
        errorTitle.style.cssText = `
            font-size: 24px;
            margin-bottom: 24px;
            color: var(--vga-red);
            text-transform: uppercase;
        `;
        
        const errorMsg = document.createElement('p');
        errorMsg.textContent = message;
        errorMsg.style.cssText = `
            color: var(--c-border);
            margin-bottom: 24px;
        `;
        
        const reloadButton = document.createElement('button');
        reloadButton.textContent = 'RELOAD APPLICATION';
        reloadButton.style.cssText = `
            background: var(--c-border);
            color: var(--c-bg);
            border: none;
            padding: 12px 24px;
            font-family: 'Space Mono', monospace;
            font-size: 12px;
            cursor: pointer;
            text-transform: uppercase;
        `;
        reloadButton.onclick = () => window.location.reload();
        
        errorContainer.appendChild(errorTitle);
        errorContainer.appendChild(errorMsg);
        errorContainer.appendChild(reloadButton);
        
        this.contentContainer.appendChild(errorContainer);
    },
    
    /**
     * Navigate to section (programmatic navigation)
     */
    navigateToSection(section, subsection = null) {
        const hash = `#${section}${subsection ? '/' + subsection : ''}`;
        
        if (window.location.hash !== hash) {
            window.location.hash = hash;
            // hashchange event will trigger handleRouteChange
        }
    },
    
    /**
     * Get current route info
     */
    getCurrentRoute() {
        return {
            section: this.currentSection,
            subsection: this.currentSubsection
        };
    }
};

// Global registration
window.Router = Router;

console.log(`🧭 Router v${Router.version} ready - Decoupled Architecture`);