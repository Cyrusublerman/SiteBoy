/**
 * Projects Section - SiteBoy Framework
 * 
 * PROJECTS SECTION HANDLER - JSON-driven project portfolio
 * Handles project galleries and detailed views
 * 
 * @version 1.0.0 - Projects Section
 * @dependencies ['ComponentLibrary'] - Consolidated component system
 */

const ProjectsSection = {
    version: '1.0.0',
    currentContainer: null,
    componentInstances: [],
    navigationCallbacks: null,
    
    // Simple page list for navigation
    pages: [
        '#projects',
        '#projects/siteboy',
        '#projects/synthetic-biophilia',
        '#projects/pixel-tiler',
        '#projects/typography',
        '#projects/color-quantizer',
        '#projects/music-tools',
        '#projects/audio-processor'
    ],
    
    // Unified navigation config - clean and beautiful
    navigationConfig: {
        type: 'flat',
        indexTitle: 'PROJECTS',
        structure: [
            {
                id: 'siteboy',
                title: 'SITEBOY FRAMEWORK',
                description: 'Modular web framework with mathematical precision and VGA aesthetics'
            },
            {
                id: 'synthetic-biophilia',
                title: 'SYNTHETIC BIOPHILIA',
                description: 'Phyllotaxis-driven architectural system (methods, galleries, reproducibility)'
            },
            {
                id: 'pixel-tiler',
                title: 'PIXEL TILER',
                description: 'Pixel art creation and tiling pattern generator'
            },
            {
                id: 'typography',
                title: 'TYPOGRAPHY SYSTEM',
                description: 'Monospace typography testing and validation tools'
            },
            {
                id: 'color-quantizer',
                title: 'COLOR QUANTIZER',
                description: 'Image color reduction and VGA palette extraction'
            },
            {
                id: 'music-tools',
                title: 'MUSIC THEORY TOOLS',
                description: 'Chord progression analysis and musical composition utilities'
            },
            {
                id: 'audio-processor',
                title: 'AUDIO PROCESSOR',
                description: 'Audio analysis and digital signal processing tools'
            }
        ]
    },
    
    /**
     * Handle route changes for projects section
     * @param {string|null} subsection - Subsection path
     * @param {HTMLElement} container - Content container
     * @param {Object} callbacks - Navigation callbacks (injected from router)
     */
    handleRoute(subsection, container, callbacks) {
        callbacks = callbacks || {};
        console.log(`🚀 Projects Section v${this.version} handling route: ${subsection || 'index'}`);
        
        this.currentContainer = container;
        this.navigationCallbacks = callbacks;
        this.cleanup();
        
        // Setup unified navigation (same code for all sections)
        window.NavigationController.setupNavigation('projects', subsection, this.pages, this.navigationCallbacks);
        
        if (!subsection) {
            this.renderProjectsIndex();
        } else {
            this.renderProject(subsection);
        }
    },
    
    
    /**
     * Render projects index using ComponentLibrary SimpleTOC
     */
    renderProjectsIndex() {
        console.log('🚀 Rendering projects index with SimpleTOC component');
        
        // Clear container and add TOC container class for proper CSS styling
        this.currentContainer.innerHTML = '';
        this.currentContainer.classList.add('toc-container');
        
        // Apply proper body sizing for projects index (no subheader)
        if (window.MathematicalFoundation) {
            const contentContainer = this.currentContainer.closest('.content-container');
            if (contentContainer) {
                const F = window.MathematicalFoundation.F;
                contentContainer.style.setProperty('--comp-min-h', `calc(100vh - ${F * 4}px)`);
                contentContainer.style.setProperty('--top-offset', `${F * 2}px`);
                console.log('✅ Applied no-subheader body sizing for projects index');
            }
        }
        
        
        // Create simple TOC component using ComponentLibrary with dependencies
        const tocComponent = new ComponentLibrary.SimpleTOC({
            sections: this.navigationConfig.structure,
            onItemClick: (item) => this.handleProjectClick(item)
        }, {
            MF: window.MathematicalFoundation,
            Resize: window.ResizeManager
        });
        
        this.componentInstances.push(tocComponent);
        this.currentContainer.appendChild(tocComponent.render());
        
        console.log('✅ Projects index rendered with SimpleTOC component');
    },
    
    /**
     * Handle project click from SimpleTOC
     */
    handleProjectClick(item) {
        this.navigateToProject(item.id);
        console.log(`🚀 Project clicked: ${item.title} -> ${item.id}`);
    },
    
    /**
     * Navigate to specific project
     */
    navigateToProject(projectId) {
        if (this.navigationCallbacks && this.navigationCallbacks.navigateToSection) {
            this.navigationCallbacks.navigateToSection('projects', projectId);
        } else {
            console.warn('⚠️ Navigation callbacks not available');
        }
    },
    
    /**
     * Handle section click (expansion toggle)
     * @param {string} sectionId - Section ID
     */
    handleSectionClick(sectionId) {
        console.log(`🚀 Section clicked: ${sectionId}`);
        // Find the TOC component and toggle the section
        const tocComponent = this.componentInstances.find(comp => comp instanceof ComponentLibrary.SimpleTOC);
        if (tocComponent) {
            tocComponent.toggleSection(sectionId);
        }
    },
    
    /**
     * Handle subsection click (navigation)
     * @param {string} path - Navigation path
     */
    handleSubsectionClick(path) {
        console.log(`🚀 Subsection clicked: ${path}`);
        
        // Extract section and subsection from path (e.g., '#projects/siteboy')
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
     * Get dropdown items for subheader
     * @param {string} currentSubsection - Current subsection ID
     * @returns {Array} Dropdown items with current selection marked
     */
    getDropdownItems(currentSubsection) {
        const allProjects = [
            { label: 'PROJECTS INDEX', path: '#projects', isTOC: true },
            { label: 'SITEBOY FRAMEWORK', path: '#projects/siteboy' },
            { label: 'SYNTHETIC BIOPHILIA', path: '#projects/synthetic-biophilia' },
            { label: 'PIXEL TILER', path: '#projects/pixel-tiler' },
            { label: 'TYPOGRAPHY SYSTEM', path: '#projects/typography' },
            { label: 'COLOR QUANTIZER', path: '#projects/color-quantizer' },
            { label: 'MUSIC TOOLS', path: '#projects/music-tools' },
            { label: 'AUDIO PROCESSOR', path: '#projects/audio-processor' }
        ];
        
        const currentPath = `#projects/${currentSubsection}`;
        
        return allProjects.map(project => ({
            ...project,
            value: project.path,
            isCurrent: project.path === currentPath
        }));
    },
    
    /**
     * Get navigation context for subheader
     * @param {string} currentSubsection - Current subsection ID
     * @param {Object} callbacks - Navigation callbacks
     * @returns {Object} Navigation context
     */
    getNavigationContext(currentSubsection, callbacks) {
        // Define all available projects in order for navigation
        const allProjects = [
            { id: 'siteboy', title: 'SiteBoy Framework', path: '#projects/siteboy' },
            { id: 'synthetic-biophilia', title: 'Synthetic Biophilia', path: '#projects/synthetic-biophilia' },
            { id: 'pixel-tiler', title: 'Pixel Tiler', path: '#projects/pixel-tiler' },
            { id: 'typography', title: 'Typography System', path: '#projects/typography' },
            { id: 'color-quantizer', title: 'Color Quantizer', path: '#projects/color-quantizer' },
            { id: 'music-tools', title: 'Music Tools', path: '#projects/music-tools' },
            { id: 'audio-processor', title: 'Audio Processor', path: '#projects/audio-processor' }
        ];
        
        return {
            section: 'projects',
            subsection: currentSubsection,
            items: allProjects,
            navigate: (section, subsection) => {
                if (callbacks && callbacks.navigateToSection) {
                    callbacks.navigateToSection(section, subsection);
                }
            }
        };
    },
    
    /**
     * Render individual project
     */
    async renderProject(projectId) {
        console.log(`🚀 Rendering project: ${projectId}`);

        // Lazy load Synthetic Biophilia project module when needed
        if (projectId === 'synthetic-biophilia') {
            if (!window.SyntheticBiophiliaProject) {
                try {
                    console.log('📦 Lazy loading Synthetic Biophilia project...');
                    // await import('../../projects/Synthetic Biophilia/synthetic-biophilia.js'); // Temporarily disabled due to path issues
                    console.log('✅ Synthetic Biophilia project loaded successfully');
                } catch (err) {
                    console.warn('⚠️ Failed to lazy load Synthetic Biophilia project:', err.message);
                    // Fall through to mock rendering below
                }
            }

            if (window.SyntheticBiophiliaProject) {
                this.currentContainer.innerHTML = '';
                window.SyntheticBiophiliaProject.render(this.currentContainer);
                // Back link is handled within the SyntheticBiophiliaProject module
                return;
            }
        }

        // Mock project data - in real implementation, this would be loaded from JSON
        const projects = {
            'siteboy': {
                title: 'SiteBoy Framework',
                status: 'In Development',
                tech: 'JavaScript, CSS, HTML',
                description: 'A minimal F=12px component framework for building mathematical precision web interfaces.',
                features: ['F=12px Typography System', 'Component-based Architecture', 'VGA Color Palette', 'Mathematical Layout']
            },
            'pixel-tiler': {
                title: 'Pixel Tiler',
                status: 'Complete',
                tech: 'Rust, WebAssembly, JavaScript',
                description: 'High-performance pixel manipulation tool for creating tiled patterns and textures.',
                features: ['WebAssembly Performance', 'Real-time Preview', 'Pattern Generation', 'Export Options']
            },
            'music-tools': {
                title: 'Music Theory Tools',
                status: 'In Development',
                tech: 'JavaScript, Web Audio API',
                description: 'Interactive tools for music theory, composition, and analysis.',
                features: ['Chord Analysis', 'Scale Generation', 'Frequency Calculator', 'Interactive Piano']
            }
        };
        
        const project = projects[projectId] || {
            title: projectId.replace('-', ' ').toUpperCase(),
            status: 'Planned',
            tech: 'To be determined',
            description: 'Project details to be implemented.',
            features: ['Feature planning in progress']
        };
        
        const projectContent = this.createElement('div', 'project-detail');
        projectContent.innerHTML = `
            <h1>${project.title}</h1>
            
            <div style="margin: 24px 0;">
                <p><strong>Status:</strong> ${project.status}</p>
                <p><strong>Technology:</strong> ${project.tech}</p>
            </div>
            
            <h2>DESCRIPTION</h2>
            <p>${project.description}</p>
            
            <h2>KEY FEATURES</h2>
            <ul>
                ${project.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
            
            <div style="
                width: 100%; height: 200px; margin: 24px 0;
                border: 1px solid var(--c-border);
                display: flex; align-items: center; justify-content: center;
                background: var(--c-bg);
            ">
                <p>PROJECT DEMO/SCREENSHOT PLACEHOLDER</p>
            </div>
            
            <p><a href="#projects">← Back to Projects</a></p>
        `;
        
        this.currentContainer.appendChild(projectContent);
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
        console.log(`🚀 Projects Section v${this.version} initialized`);
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
window.ProjectsSection = ProjectsSection;

window.debugLog('INIT', `🚀 Projects Section v${ProjectsSection.version} ready`);
