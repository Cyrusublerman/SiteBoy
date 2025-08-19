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
    
    /**
     * Handle route changes for projects section
     */
    handleRoute(subsection, container) {
        console.log(`🚀 Projects Section v${this.version} handling route: ${subsection || 'index'}`);
        
        this.currentContainer = container;
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
     * Render projects index/portfolio
     */
    renderProjectsIndex() {
        console.log('🚀 Rendering projects index');
        
        // Create projects grid
        const projectItems = [
            { text: 'SiteBoy Framework', id: 'siteboy' },
            { text: 'Pixel Tiler', id: 'pixel-tiler' },
            { text: 'Music Tools', id: 'music-tools' },
            { text: 'Color Quantizer', id: 'color-quantizer' },
            { text: 'Typography System', id: 'typography' },
            { text: 'Component Library', id: 'component-lib' }
        ];
        
        const { container: gridContainer, component: gridComponent } = ComponentLibrary.grid(
            projectItems,
            {
                cols: 3,
                onItemClick: (item, index) => {
                    Router.navigateToSection('projects', item.id);
                }
            }
        );
        
        this.componentInstances.push(gridComponent);
        
        // Add title
        const title = this.createElement('h1');
        title.textContent = 'PROJECT PORTFOLIO';
        title.style.marginBottom = '24px';
        
        this.currentContainer.appendChild(title);
        this.currentContainer.appendChild(gridContainer);
        
        // Add description
        const description = this.createElement('p');
        description.innerHTML = 'Click on any project to view details, documentation, and demos. Project data will be loaded from JSON files as per the canonical structure.';
        description.style.marginTop = '24px';
        this.currentContainer.appendChild(description);
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
