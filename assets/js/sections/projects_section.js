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
    
    /**
     * Handle route changes for projects section
     * @param {string|null} subsection - Subsection path
     * @param {HTMLElement} container - Content container
     * @param {Object} callbacks - Navigation callbacks (injected from router)
     */
    handleRoute(subsection, container, callbacks = {}) {
        console.log(`🚀 Projects Section v${this.version} handling route: ${subsection || 'index'}`);
        
        this.currentContainer = container;
        this.navigationCallbacks = callbacks;
        this.cleanup();
        
        // Hide subheader for index, show for specific projects
        if (window.Subheader) {
            if (subsection) {
                window.Subheader.updateTitle(`projects/${subsection}`);
                window.Subheader.show();
            } else {
                window.Subheader.hide();
            }
        }
        
        if (!subsection) {
            this.renderProjectsIndex();
        } else {
            this.renderProject(subsection);
        }
    },
    
    /**
     * Render projects index using ComponentLibrary HierarchicalTOC
     */
    renderProjectsIndex() {
        console.log('🚀 Rendering projects index with HierarchicalTOC component');
        
        // Clear container and add TOC container class for proper CSS styling
        this.currentContainer.innerHTML = '';
        this.currentContainer.classList.add('toc-container');
        
        // Apply proper body sizing for projects index (no subheader)
        if (window.MathematicalFoundation) {
            const contentContainer = this.currentContainer.closest('.content-container');
            if (contentContainer) {
                window.MathematicalFoundation.applyContainerVars(contentContainer, { 
                    withSubheader: false 
                });
                console.log('✅ Applied no-subheader body sizing for projects index');
            }
        }
        
        // Define projects sections structure matching home section pattern
        const projectsSections = [
            {
                id: 'frameworks',
                title: 'FRAMEWORKS & LIBRARIES',
                description: 'Core development frameworks and component systems',
                isExpandable: true,
                isExpanded: true, // Start expanded for better UX
                subsections: [
                    { id: 'siteboy', title: 'SiteBoy Framework', path: '#projects/siteboy' },
                    { id: 'component-lib', title: 'Component Library', path: '#projects/component-lib' },
                    { id: 'math-foundation', title: 'Mathematical Foundation', path: '#projects/math-foundation' }
                ]
            },
            {
                id: 'creative',
                title: 'CREATIVE TOOLS',
                description: 'Visual design and creative development tools',
                isExpandable: true,
                isExpanded: true, // Start expanded for better UX
                subsections: [
                    { id: 'pixel-tiler', title: 'Pixel Tiler', path: '#projects/pixel-tiler' },
                    { id: 'typography', title: 'Typography System', path: '#projects/typography' },
                    { id: 'color-quantizer', title: 'Color Quantizer', path: '#projects/color-quantizer' }
                ]
            },
            {
                id: 'audio',
                title: 'AUDIO & MUSIC',
                description: 'Music theory tools and audio processing utilities',
                isExpandable: true,
                isExpanded: false, // Start collapsed
                subsections: [
                    { id: 'music-tools', title: 'Music Theory Tools', path: '#projects/music-tools' },
                    { id: 'audio-processor', title: 'Audio Processor', path: '#projects/audio-processor' }
                ]
            }
        ];
        
        // Create hierarchical TOC component using ComponentLibrary with dependencies
        const tocComponent = new ComponentLibrary.HierarchicalTOC({
            sections: projectsSections,
            onSectionClick: (sectionId) => this.handleSectionClick(sectionId),
            onSubsectionClick: (path) => this.handleSubsectionClick(path)
        }, {
            MF: window.MathematicalFoundation,
            Resize: window.ResizeManager
        });
        
        this.componentInstances.push(tocComponent);
        this.currentContainer.appendChild(tocComponent.render());
        
        console.log('✅ Projects index rendered with HierarchicalTOC component');
    },
    
    /**
     * Handle section click (expansion toggle)
     * @param {string} sectionId - Section ID
     */
    handleSectionClick(sectionId) {
        console.log(`🚀 Section clicked: ${sectionId}`);
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
     * Render individual project
     */
    renderProject(projectId) {
        console.log(`🚀 Rendering project: ${projectId}`);
        
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

console.log(`🚀 Projects Section v${ProjectsSection.version} ready`);
