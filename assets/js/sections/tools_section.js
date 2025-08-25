/**
 * Tools Section - SiteBoy Framework
 * 
 * TOOLS SECTION HANDLER - Interactive development tools
 * Uses canonical Glossary components only, no router coupling
 * 
 * @version 2.0.0 - Refactored Section
 * @dependencies ['ComponentLibrary'] - Consolidated component system
 */

const ToolsSection = {
    version: '2.0.0',
    currentContainer: null,
    componentInstances: [],
    navigationCallbacks: null,
    
    /**
     * Handle route changes for tools section
     * @param {string|null} subsection - Subsection path
     * @param {HTMLElement} container - Content container
     * @param {Object} callbacks - Navigation callbacks (injected from router)
     */
    handleRoute(subsection, container, callbacks = {}) {
        console.log(`🔧 Tools Section v${this.version} handling route: ${subsection || 'index'}`);
        
        this.currentContainer = container;
        this.navigationCallbacks = callbacks;
        this.cleanup();
        
        // Show/hide subheader based on subsection
        if (window.Subheader) {
            if (subsection) {
                window.Subheader.updateTitle(`tools/${subsection}`);
                window.Subheader.show();
            } else {
                window.Subheader.hide();
            }
        }
        
        if (!subsection) {
            this.renderToolsIndex();
        } else {
            this.renderTool(subsection);
        }
    },
    
    /**
     * Render tools index using ComponentLibrary HierarchicalTOC
     */
    renderToolsIndex() {
        console.log('🔧 Rendering tools index with HierarchicalTOC component');
        
        // Clear container and add TOC container class for proper CSS styling
        this.currentContainer.innerHTML = '';
        this.currentContainer.classList.add('toc-container');
        
        // Apply proper body sizing for tools index (no subheader)
        if (window.MathematicalFoundation) {
            const contentContainer = this.currentContainer.closest('.content-container');
            if (contentContainer) {
                window.MathematicalFoundation.applyContainerVars(contentContainer, { 
                    withSubheader: false 
                });
                console.log('✅ Applied no-subheader body sizing for tools index');
            }
        }
        
        // Define tools sections structure matching home section pattern
        const toolsSections = [
            {
                id: 'development',
                title: 'DEVELOPMENT TOOLS',
                description: 'Interactive development and testing utilities',
                isExpandable: true,
                isExpanded: true, // Start expanded for better UX
                subsections: [
                    { id: 'ui-test', title: 'UI Test Tool', path: '#tools/ui-test' },
                    { id: 'component-test', title: 'Component Test', path: '#tools/component-test' },
                    { id: 'canvas-test', title: 'Canvas Test', path: '#tools/canvas-test' }
                ]
            },
            {
                id: 'creative',
                title: 'CREATIVE TOOLS',
                description: 'Color, typography, and visual design utilities',
                isExpandable: true,
                isExpanded: true, // Start expanded for better UX
                subsections: [
                    { id: 'color-grid', title: 'VGA Color Grid', path: '#tools/color-grid' },
                    { id: 'typography', title: 'Typography Tool', path: '#tools/typography' },
                    { id: 'pixel-tiler', title: 'Pixel Tiler', path: '#tools/pixel-tiler' }
                ]
            },
            {
                id: 'analysis',
                title: 'ANALYSIS TOOLS',
                description: 'Font analysis and color quantization utilities',
                isExpandable: true,
                isExpanded: false, // Start collapsed
                subsections: [
                    { id: 'font-analysis', title: 'Font Analysis', path: '#tools/font-analysis' },
                    { id: 'color-quantizer', title: 'Color Quantizer', path: '#tools/color-quantizer' }
                ]
            }
        ];
        
        // Create hierarchical TOC component using ComponentLibrary with dependencies
        const tocComponent = new ComponentLibrary.HierarchicalTOC({
            sections: toolsSections,
            onSectionClick: (sectionId) => this.handleSectionClick(sectionId),
            onSubsectionClick: (path) => this.handleSubsectionClick(path)
        }, {
            MF: window.MathematicalFoundation,
            Resize: window.ResizeManager
        });
        
        this.componentInstances.push(tocComponent);
        this.currentContainer.appendChild(tocComponent.render());
        
        console.log('✅ Tools index rendered with HierarchicalTOC component');
    },
    
    /**
     * Handle section click (expansion toggle)
     * @param {string} sectionId - Section ID
     */
    handleSectionClick(sectionId) {
        console.log(`🔧 Section clicked: ${sectionId}`);
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
        console.log(`🔧 Subsection clicked: ${path}`);
        
        // Extract section and subsection from path (e.g., '#tools/ui-test')
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
     * Render individual tool
     */
    renderTool(toolId) {
        console.log(`🔧 Rendering tool: ${toolId}`);
        
        switch (toolId) {
            case 'ui-test':
                this.renderUITestTool();
                break;
            case 'color-grid':
                this.renderColorGrid();
                break;
            case 'canvas-test':
                this.renderCanvasTest();
                break;
            case 'component-test':
                this.renderComponentTest();
                break;
            default:
                this.renderGenericTool(toolId);
        }
    },
    
    /**
     * Render UI Test Tool - Component Library API Documentation & Test Suite
     */
    renderUITestTool() {
        // Main title
        const title = new ComponentLibrary.Heading({
            level: 1,
            content: 'COMPONENT LIBRARY API DOCUMENTATION'
        });
        this.componentInstances.push(title);
        this.currentContainer.appendChild(title.render());
        
        // Consolidated API documentation
        const apiDocs = new ComponentLibrary.MarkdownBody({
            markdownText: `
## Component Library Test Suite & API Documentation

This page serves as the **Single Source of Truth** for all SiteBoy UI components. Every component used site-wide must have an example here.

### Usage Pattern
\`\`\`javascript
// Basic component creation
const component = new ComponentLibrary.ComponentName(options, deps);
this.componentInstances.push(component);
container.appendChild(component.render());

// With Mathematical Foundation dependencies
const component = new ComponentLibrary.ComponentName(options, {
    MF: window.MathematicalFoundation,
    Resize: window.ResizeManager
});
\`\`\`

### Available Components

**Navigation:** BaseNavigationDropdown, Dropdown, Menu, Breadcrumb  
**Layout:** Grid, Spacing, PageContainer, PageHeader, PageFooter, Subheader  
**Typography:** Heading, Paragraph, Quote, MarkdownBody, HierarchicalTOC  
**Forms:** Button, ButtonGroup, Input, Select  
**Data Viz:** BarGraph, LineGraph, PieGraph, ProgressBar  
**Media:** Image, Video, Audio  
**Specialized:** VGAGrid, MathematicalCanvas, CollapsibleBase  

### Component Categories

Click any section below to expand and view live examples with usage code.
            `
        });
        this.componentInstances.push(apiDocs);
        this.currentContainer.appendChild(apiDocs.render());
        
        // Render all component examples in collapsible sections
        this.renderAllComponentExamples(this.currentContainer);
        
        this.addBackLink();
    },
    
    /**
     * Render Color Grid Tool
     */
    renderColorGrid() {
        const title = new ComponentLibrary.Heading({
            level: 1,
            content: 'VGA COLOR GRID'
        });
        this.componentInstances.push(title);
        this.currentContainer.appendChild(title.render());
        
        // Create VGA color grid using ComponentLibrary
        const vgaColors = [
            { value: '#000000' }, { value: '#800000' }, { value: '#008000' }, { value: '#808000' },
            { value: '#000080' }, { value: '#800080' }, { value: '#008080' }, { value: '#c0c0c0' },
            { value: '#808080' }, { value: '#ff0000' }, { value: '#00ff00' }, { value: '#ffff00' },
            { value: '#0000ff' }, { value: '#ff00ff' }, { value: '#00ffff' }, { value: '#ffffff' }
        ];
        
        const vgaGrid = new ComponentLibrary.VGAGrid({
            items: vgaColors,
            cols: 4,
            showHex: true,
            onItemClick: (color, index) => {
                console.log(`Color clicked: ${color.value}`);
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(color.value);
                }
            }
        });
        
        this.componentInstances.push(vgaGrid);
        this.currentContainer.appendChild(vgaGrid.render());
        
        const description = new ComponentLibrary.Paragraph({
            content: 'Click any color to copy its hex value to clipboard.'
        });
        this.componentInstances.push(description);
        this.currentContainer.appendChild(description.render());
        
        this.addBackLink();
    },
    
    /**
     * Render Canvas Test Tool
     */
    renderCanvasTest() {
        const title = new ComponentLibrary.Heading({
            level: 1,
            content: 'CANVAS TEST'
        });
        this.componentInstances.push(title);
        this.currentContainer.appendChild(title.render());
        
        const testCanvas = new ComponentLibrary.MathematicalCanvas({
            width: 600,
            height: 400,
            drawFunction: (ctx, width, height) => {
                // Test drawing
                ctx.fillStyle = 'var(--c-text)';
                ctx.strokeStyle = 'var(--c-border)';
                
                // Grid
                for (let x = 0; x < width; x += 50) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, height);
                    ctx.stroke();
                }
                for (let y = 0; y < height; y += 50) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(width, y);
                    ctx.stroke();
                }
                
                // Test shapes
                ctx.fillRect(50, 50, 100, 100);
                ctx.strokeRect(200, 50, 100, 100);
                
                // Test text
                ctx.fillText('F=12px Canvas Test', 50, 200);
                ctx.fillText('Mathematical Foundation Canvas', 50, 220);
            }
        });
        
        this.componentInstances.push(testCanvas);
        this.currentContainer.appendChild(testCanvas.render());
        
        this.addBackLink();
    },
    
    /**
     * Render Component Test
     */
    renderComponentTest() {
        const title = new ComponentLibrary.Heading({
            level: 1,
            content: 'COMPONENT TEST'
        });
        this.componentInstances.push(title);
        this.currentContainer.appendChild(title.render());
        
        // Test various canonical components
        const testHeading = new ComponentLibrary.Heading({
            level: 2,
            content: 'Sample Components'
        });
        this.componentInstances.push(testHeading);
        this.currentContainer.appendChild(testHeading.render());
        
        const testParagraph = new ComponentLibrary.Paragraph({
            content: 'This is a test paragraph demonstrating the canonical Paragraph component from ComponentLibrary.'
        });
        this.componentInstances.push(testParagraph);
        this.currentContainer.appendChild(testParagraph.render());
        
        const testQuote = new ComponentLibrary.Quote({
            content: 'This is a test blockquote component with proper semantic markup.',
            cite: 'SiteBoy Framework Documentation'
        });
        this.componentInstances.push(testQuote);
        this.currentContainer.appendChild(testQuote.render());
        
        const testButton = new ComponentLibrary.Button({
            text: 'Test Button',
            onClick: () => alert('Button clicked!')
        });
        this.componentInstances.push(testButton);
        this.currentContainer.appendChild(testButton.render());
        
        this.addBackLink();
    },
    
    /**
     * Render generic tool placeholder
     */
    renderGenericTool(toolId) {
        const title = new ComponentLibrary.Heading({
            level: 1,
            content: `TOOL: ${toolId.toUpperCase()}`
        });
        this.componentInstances.push(title);
        this.currentContainer.appendChild(title.render());
        
        const description = new ComponentLibrary.Paragraph({
            content: `This tool (${toolId}) is not yet implemented. Tool interfaces will be built according to the canonical structure.`
        });
        this.componentInstances.push(description);
        this.currentContainer.appendChild(description.render());
        
        this.addBackLink();
    },
    
    /**
     * Add back navigation link
     */
    addBackLink() {
        const backParagraph = new ComponentLibrary.Paragraph({
            content: '← Back to Tools'
        });
        this.componentInstances.push(backParagraph);
        
        const backElement = backParagraph.render();
        backElement.classList.add('clickable');
        backElement.addEventListener('click', () => {
            if (this.navigationCallbacks && this.navigationCallbacks.navigateToSection) {
                this.navigationCallbacks.navigateToSection('tools');
            }
        });
        
        this.currentContainer.appendChild(backElement);
    },
    
    /**
     * Handle component section click (expansion toggle)
     */
    handleComponentSectionClick(sectionId) {
        console.log(`🧪 Component section clicked: ${sectionId}`);
        // Find the TOC component and toggle the section
        const tocComponent = this.componentInstances.find(comp => comp instanceof ComponentLibrary.HierarchicalTOC);
        if (tocComponent) {
            tocComponent.toggleSection(sectionId);
        }
    },
    
    /**
     * Scroll to component example
     */
    scrollToComponent(path) {
        const componentId = path.replace('#', '');
        const element = document.getElementById(componentId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },
    
    /**
     * Render all component examples with API documentation
     */
    renderAllComponentExamples(container) {
        // Component sections data
        const sections = [
            {
                id: 'navigation',
                title: 'NAVIGATION COMPONENTS',
                description: 'Dropdown, menu, breadcrumb, and navigation elements',
                components: [
                    { id: 'base-nav-dropdown', title: 'BaseNavigationDropdown', method: 'renderBaseNavDropdownExample' },
                    { id: 'dropdown', title: 'Dropdown', method: 'renderDropdownExample' },
                    { id: 'menu', title: 'Menu', method: 'renderMenuExample' },
                    { id: 'breadcrumb', title: 'Breadcrumb', method: 'renderBreadcrumbExample' }
                ]
            },
            {
                id: 'layout',
                title: 'LAYOUT & STRUCTURE',
                description: 'Page structure, grids, spacing, and container components',
                components: [
                    { id: 'spacing', title: 'Spacing', method: 'renderSpacingExample' },
                    { id: 'grid', title: 'Grid', method: 'renderGridExample' },
                    { id: 'page-container', title: 'PageContainer', method: 'renderPageContainerExample' },
                    { id: 'page-header', title: 'PageHeader', method: 'renderPageHeaderExample' },
                    { id: 'page-footer', title: 'PageFooter', method: 'renderPageFooterExample' },
                    { id: 'subheader', title: 'Subheader', method: 'renderSubheaderExample' }
                ]
            },
            {
                id: 'typography',
                title: 'TYPOGRAPHY & CONTENT',
                description: 'Text, headings, quotes, markdown, and content components',
                components: [
                    { id: 'heading', title: 'Heading', method: 'renderHeadingExample' },
                    { id: 'paragraph', title: 'Paragraph', method: 'renderParagraphExample' },
                    { id: 'quote', title: 'Quote', method: 'renderQuoteExample' },
                    { id: 'markdown', title: 'MarkdownBody', method: 'renderMarkdownExample' },
                    { id: 'hierarchical-toc', title: 'HierarchicalTOC', method: 'renderHierarchicalTOCExample' }
                ]
            },
            {
                id: 'forms',
                title: 'FORM ELEMENTS',
                description: 'Buttons, inputs, and interactive form components',
                components: [
                    { id: 'button', title: 'Button', method: 'renderButtonExample' },
                    { id: 'button-group', title: 'ButtonGroup', method: 'renderButtonGroupExample' },
                    { id: 'input', title: 'Input', method: 'renderInputExample' },
                    { id: 'select', title: 'Select', method: 'renderSelectExample' }
                ]
            },
            {
                id: 'data-viz',
                title: 'DATA VISUALIZATION',
                description: 'Charts, graphs, and data presentation components',
                components: [
                    { id: 'bar-graph', title: 'BarGraph', method: 'renderBarGraphExample' },
                    { id: 'line-graph', title: 'LineGraph', method: 'renderLineGraphExample' },
                    { id: 'pie-graph', title: 'PieGraph', method: 'renderPieGraphExample' },
                    { id: 'progress', title: 'ProgressBar', method: 'renderProgressExample' }
                ]
            },
            {
                id: 'media',
                title: 'MEDIA COMPONENTS',
                description: 'Images, video, audio, and multimedia elements',
                components: [
                    { id: 'image', title: 'Image', method: 'renderImageExample' },
                    { id: 'video', title: 'Video', method: 'renderVideoExample' },
                    { id: 'audio', title: 'Audio', method: 'renderAudioExample' }
                ]
            },
            {
                id: 'specialized',
                title: 'SPECIALIZED WIDGETS',
                description: 'VGA grids, canvas, collapsible, and custom interactive components',
                components: [
                    { id: 'vga-grid', title: 'VGAGrid', method: 'renderVGAGridExample' },
                    { id: 'canvas', title: 'MathematicalCanvas', method: 'renderCanvasExample' },
                    { id: 'collapsible', title: 'CollapsibleBase', method: 'renderCollapsibleExample' }
                ]
            }
        ];
        
        // Render each section as a collapsible component
        sections.forEach(section => {
            this.renderCollapsibleSection(container, section);
        });
    },
    
    /**
     * Render a collapsible component section matching TOC styling
     */
    renderCollapsibleSection(container, section) {
        const F = window.MathematicalFoundation ? window.MathematicalFoundation.F : 12;
        
        // Create section header bar (matching header/footer styling)
        const headerBar = document.createElement('div');
        headerBar.style.cssText = `
            background: var(--c-bg);
            color: var(--c-text);
            border: 1px solid var(--c-border);
            padding: ${F}px;
            margin: 0;
            cursor: pointer;
            user-select: none;
            font-family: 'Space Mono', monospace;
            font-weight: bold;
            text-transform: uppercase;
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: calc(${F}px * 4);
            box-sizing: border-box;
        `;
        
        // Title and description container
        const titleContainer = document.createElement('div');
        
        // Section title
        const titleElement = document.createElement('div');
        titleElement.textContent = section.title;
        titleContainer.appendChild(titleElement);
        
        // Section description (smaller, muted)
        const descElement = document.createElement('div');
        descElement.style.cssText = `
            font-size: 10px;
            opacity: 0.8;
            text-transform: none;
            font-weight: normal;
            margin-top: 2px;
        `;
        descElement.textContent = section.description;
        titleContainer.appendChild(descElement);
        
        // Expand/collapse indicator
        const indicator = document.createElement('div');
        indicator.style.cssText = `
            font-family: 'Space Mono', monospace;
            font-size: ${F}px;
            font-weight: bold;
            min-width: 20px;
            text-align: center;
            border-left: 1px solid var(--c-border);
            padding-left: ${F}px;
            margin-left: ${F}px;
        `;
        indicator.textContent = '+';
        
        headerBar.appendChild(titleContainer);
        headerBar.appendChild(indicator);
        
        // Create content container for examples
        const contentContainer = document.createElement('div');
        contentContainer.style.cssText = `
            margin: 0;
            padding: ${F}px;
            border: 1px solid var(--c-border);
            border-top: none;
            display: none;
            background: var(--c-bg);
        `;
        
        // Track expanded state
        let isExpanded = false;
        
        // Add hover behavior matching header/footer
        headerBar.addEventListener('mouseenter', () => {
            headerBar.style.background = 'var(--c-text)';
            headerBar.style.color = 'var(--c-bg)';
        });
        
        headerBar.addEventListener('mouseleave', () => {
            headerBar.style.background = 'var(--c-bg)';
            headerBar.style.color = 'var(--c-text)';
        });
        
        // Toggle functionality
        headerBar.addEventListener('click', () => {
            isExpanded = !isExpanded;
            contentContainer.style.display = isExpanded ? 'block' : 'none';
            indicator.textContent = isExpanded ? '−' : '+';
        });
        
        // Render each component example in this section
        section.components.forEach(comp => {
            if (this[comp.method]) {
                this[comp.method](contentContainer, comp.id, comp.title);
            } else {
                this.renderGenericComponentExample(contentContainer, comp.id, comp.title);
            }
        });
        
        // Add to container
        container.appendChild(headerBar);
        container.appendChild(contentContainer);
        
        // Track components for cleanup
        this.componentInstances.push({
            element: headerBar,
            destroy: () => {
                if (headerBar.parentNode) {
                    headerBar.parentNode.removeChild(headerBar);
                }
                if (contentContainer.parentNode) {
                    contentContainer.parentNode.removeChild(contentContainer);
                }
            }
        });
    },
    
    // Component Example Rendering Methods
    
    // Navigation Components
    renderBaseNavDropdownExample(container, id, title) {
        this.createSimpleComponentExample(container, id, title,
            'ComponentLibrary.BaseNavigationDropdown({ items, onItemClick })',
            () => {
                const baseNavDropdown = new ComponentLibrary.BaseNavigationDropdown({
                    items: [
                        { label: 'Home', value: 'home', url: '#' },
                        { label: 'About', value: 'about', url: '#about' },
                        { label: 'Services', value: 'services', url: '#services' },
                        { label: 'Contact', value: 'contact', url: '#contact' }
                    ],
                    onItemClick: (item) => console.log('BaseNav selected:', item)
                }, { MF: window.MathematicalFoundation });
                this.componentInstances.push(baseNavDropdown);
                
                // Create container and trigger for demo
                const demoContainer = document.createElement('div');
                demoContainer.style.cssText = 'position: relative; display: inline-block;';
                
                const trigger = document.createElement('button');
                trigger.textContent = 'Navigation Menu';
                trigger.style.cssText = `
                    padding: 6px 12px; 
                    background: var(--c-bg); 
                    color: var(--c-text);
                    border: 1px solid var(--c-border);
                    cursor: pointer;
                    font-family: 'Space Mono', monospace;
                `;
                
                demoContainer.appendChild(trigger);
                
                // Create dropdown on click
                trigger.addEventListener('click', () => {
                    baseNavDropdown.createDropdownStructure('demo-nav', { top: '100%', left: '0' });
                });
                
                return demoContainer;
            }
        );
    },
    
    renderDropdownExample(container, id, title) {
        this.createSimpleComponentExample(container, id, title, 
            'ComponentLibrary.Dropdown({ triggerText, items, position, onItemClick })', 
            () => {
                const dropdown = new ComponentLibrary.Dropdown({
                    triggerText: 'Select Option',
                    items: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
                    position: 'bottom-left',
                    onItemClick: (item, index) => console.log('Selected:', item)
                }, { MF: window.MathematicalFoundation });
                this.componentInstances.push(dropdown);
                return dropdown.render();
            }
        );
    },
    
    renderMenuExample(container, id, title) {
        this.createSimpleComponentExample(container, id, title,
            'ComponentLibrary.Menu({ items, current, onSelect })',
            () => {
                const menu = new ComponentLibrary.Menu({
                    items: [
                        { label: 'Dashboard', value: 'dashboard', url: '#dashboard' },
                        { label: 'Projects', value: 'projects', url: '#projects' },
                        { label: 'Settings', value: 'settings', url: '#settings' },
                        { label: 'Profile', value: 'profile', url: '#profile' }
                    ],
                    current: 'dashboard',
                    onSelect: (item) => console.log('Menu selected:', item)
                }, { MF: window.MathematicalFoundation });
                this.componentInstances.push(menu);
                return menu.render();
            }
        );
    },
    
    renderBreadcrumbExample(container, id, title) {
        this.createSimpleComponentExample(container, id, title,
            'ComponentLibrary.Breadcrumb({ items, current, onSelect })',
            () => {
                const breadcrumb = new ComponentLibrary.Breadcrumb({
                    items: [
                        { label: 'Home', value: 'home', url: '#' },
                        { label: 'Tools', value: 'tools', url: '#tools' },
                        { label: 'UI Test', value: 'ui-test', url: '#tools/ui-test' }
                    ],
                    current: 'ui-test',
                    onSelect: (item) => console.log('Breadcrumb selected:', item)
                }, { MF: window.MathematicalFoundation });
                this.componentInstances.push(breadcrumb);
                return breadcrumb.render();
            }
        );
    },
    
    // Layout & Structure Components  
    renderSpacingExample(container, id, title) {
        this.createSimpleComponentExample(container, id, title,
            'ComponentLibrary.Spacing({ size: "s|m|l" })',
            () => {
                const spacingDemo = document.createElement('div');
                spacingDemo.style.cssText = `
                    border: 1px solid var(--c-border);
                    padding: 12px;
                `;
                
                // Show different spacing sizes
                ['s', 'm', 'l'].forEach(size => {
                    const spacing = new ComponentLibrary.Spacing({ size }, { MF: window.MathematicalFoundation });
                    this.componentInstances.push(spacing);
                    
                    const label = document.createElement('div');
                    label.textContent = `Size: ${size}`;
                    label.style.cssText = `
                        font-family: 'Space Mono', monospace;
                        font-size: 10px;
                        color: var(--c-text);
                        margin-bottom: 4px;
                    `;
                    
                    spacingDemo.appendChild(label);
                    spacingDemo.appendChild(spacing.render());
                });
                
                return spacingDemo;
            }
        );
    },
    
    renderGridExample(container, id, title) {
        this.createSimpleComponentExample(container, id, title,
            'ComponentLibrary.Grid({ items, squareTiling: true, showCaptions: true })',
            () => {
                // Demo grid with perfect square tiling (like old build's superior gallery)
                const galleryItems = [
                    { title: 'Artwork 001', caption: 'Digital Composition', text: 'Abstract geometric patterns using mathematical algorithms' },
                    { title: 'Artwork 002', caption: 'Generative Art', text: 'Procedural generation with VGA color constraints' },
                    { title: 'Artwork 003', caption: 'Code Visualization', text: 'Visual representation of algorithmic processes' },
                    { title: 'Artwork 004', caption: 'Pixel Perfect', text: 'Retro-computing aesthetic with precise grid alignment' },
                    { title: 'Artwork 005', caption: 'Mathematical Art', text: 'F=12px foundation applied to visual composition' }
                ];
                
                const grid = new ComponentLibrary.Grid({
                    items: galleryItems,
                    squareTiling: true,      // Perfect squares like old build
                    showCaptions: true,      // Caption bars like old build
                    fillEmptyCells: true,    // Complete the grid
                    onItemClick: (item, index) => console.log('Gallery item clicked:', item.title)
                }, { MF: window.MathematicalFoundation });
                this.componentInstances.push(grid);
                return grid.render();
            }
        );
    },
    
    renderPageContainerExample(container, id, title) {
        this.createSimpleComponentExample(container, id, title,
            'ComponentLibrary.PageContainer({ navigationItems, onNavigate }) - Full page wrapper',
            () => {
                const demoContainer = document.createElement('div');
                demoContainer.style.cssText = `
                    border: 2px solid var(--c-border);
                    padding: 12px;
                    font-family: 'Space Mono', monospace;
                    font-size: 10px;
                    text-align: center;
                    color: var(--c-text);
                    min-height: 150px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                `;
                demoContainer.innerHTML = `
                    <div>📐 PAGE CONTAINER</div>
                    <div>Full viewport wrapper with:</div>
                    <div>• Mathematical Foundation layout</div>
                    <div>• Header/Footer positioning</div>
                    <div>• Responsive margin calculations</div>
                    <div>• Subheader state management</div>
                    <div style="margin-top: 8px; opacity: 0.7;">Too complex for inline demo</div>
                `;
                return demoContainer;
            }
        );
    },
    
    renderPageHeaderExample(container, id, title) {
        this.createSimpleComponentExample(container, id, title,
            'ComponentLibrary.PageHeader({ navigationItems, onNavigate }) - Site header',
            () => {
                const demoContainer = document.createElement('div');
                demoContainer.style.cssText = `
                    border: 1px solid var(--c-border);
                    height: 24px;
                    display: flex;
                    font-family: 'Space Mono', monospace;
                    font-size: 12px;
                    background: var(--c-bg);
                `;
                
                // Left side simulation
                const leftSide = document.createElement('div');
                leftSide.style.cssText = `
                    width: 50%;
                    height: 100%;
                    background: var(--c-bg);
                    border-right: 1px solid var(--c-border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-transform: uppercase;
                `;
                leftSide.textContent = 'SITEBOY';
                
                // Right side simulation
                const rightSide = document.createElement('div');
                rightSide.style.cssText = `
                    width: 50%;
                    height: 100%;
                    display: flex;
                `;
                
                ['BLOG', 'ART', 'TOOLS', 'PROJECTS'].forEach((item, index) => {
                    const navItem = document.createElement('div');
                    navItem.style.cssText = `
                        flex: 1;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-right: 1px solid var(--c-border);
                        cursor: pointer;
                        font-size: 10px;
                    `;
                    if (index === 3) navItem.style.borderRight = 'none';
                    navItem.textContent = item;
                    
                    navItem.addEventListener('mouseenter', () => {
                        navItem.style.background = 'var(--c-text)';
                        navItem.style.color = 'var(--c-bg)';
                    });
                    navItem.addEventListener('mouseleave', () => {
                        navItem.style.background = 'var(--c-bg)';
                        navItem.style.color = 'var(--c-text)';
                    });
                    
                    rightSide.appendChild(navItem);
                });
                
                demoContainer.appendChild(leftSide);
                demoContainer.appendChild(rightSide);
                return demoContainer;
            }
        );
    },
    
    renderPageFooterExample(container, id, title) {
        this.createSimpleComponentExample(container, id, title,
            'ComponentLibrary.PageFooter({}) - Site footer with links',
            () => {
                const demoContainer = document.createElement('div');
                demoContainer.style.cssText = `
                    border: 1px solid var(--c-border);
                    height: 24px;
                    display: flex;
                    font-family: 'Space Mono', monospace;
                    font-size: 10px;
                    background: var(--c-bg);
                `;
                
                ['GITHUB', 'EMAIL', 'RSS'].forEach((item, index) => {
                    const footerItem = document.createElement('div');
                    footerItem.style.cssText = `
                        flex: 1;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-right: 1px solid var(--c-border);
                        cursor: pointer;
                        text-transform: uppercase;
                    `;
                    if (index === 2) footerItem.style.borderRight = 'none';
                    footerItem.textContent = item;
                    
                    footerItem.addEventListener('mouseenter', () => {
                        footerItem.style.background = 'var(--c-text)';
                        footerItem.style.color = 'var(--c-bg)';
                    });
                    footerItem.addEventListener('mouseleave', () => {
                        footerItem.style.background = 'var(--c-bg)';
                        footerItem.style.color = 'var(--c-text)';
                    });
                    
                    demoContainer.appendChild(footerItem);
                });
                
                return demoContainer;
            }
        );
    },
    
    renderSubheaderExample(container, id, title) {
        this.createSimpleComponentExample(container, id, title,
            'ComponentLibrary.Subheader({ sectionTitle, onNavigate }) - Section navigation',
            () => {
                const demoContainer = document.createElement('div');
                demoContainer.style.cssText = `
                    border: 1px solid var(--c-border);
                    height: 24px;
                    display: flex;
                    font-family: 'Space Mono', monospace;
                    font-size: 12px;
                    background: var(--c-bg);
                `;
                
                // Title side (50%)
                const titleSide = document.createElement('div');
                titleSide.style.cssText = `
                    width: 50%;
                    height: 100%;
                    background: var(--c-bg);
                    border-right: 1px solid var(--c-border);
                    display: flex;
                    align-items: center;
                    padding: 0 12px;
                    text-transform: uppercase;
                    font-size: 10px;
                `;
                titleSide.textContent = 'TOOLS/UI-TEST';
                
                // Navigation side (50%)
                const navSide = document.createElement('div');
                navSide.style.cssText = `
                    width: 50%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 12px;
                    font-size: 10px;
                `;
                
                const prevBtn = document.createElement('span');
                prevBtn.textContent = '← PREV';
                prevBtn.style.cursor = 'pointer';
                
                const nextBtn = document.createElement('span');
                nextBtn.textContent = 'NEXT →';
                nextBtn.style.cursor = 'pointer';
                
                navSide.appendChild(prevBtn);
                navSide.appendChild(nextBtn);
                
                demoContainer.appendChild(titleSide);
                demoContainer.appendChild(navSide);
                return demoContainer;
            }
        );
    },
    
    renderButtonExample(container, id, title) {
        this.createSimpleComponentExample(container, id, title,
            'ComponentLibrary.Button({ text, onClick })',
            () => {
                const button = new ComponentLibrary.Button({
                    text: 'Example Button',
                    onClick: () => alert('Button clicked!')
                }, { MF: window.MathematicalFoundation });
                this.componentInstances.push(button);
                return button.render();
            }
        );
    },
    
    renderButtonGroupExample(container, id, title) {
        this.createSimpleComponentExample(container, id, title,
            'ComponentLibrary.ButtonGroup({ buttons: [{ text, onClick }] })',
            () => {
                const buttonGroup = new ComponentLibrary.ButtonGroup({
                    buttons: [
                        { text: 'Action 1', onClick: () => console.log('Action 1') },
                        { text: 'Action 2', onClick: () => console.log('Action 2') },
                        { text: 'Action 3', onClick: () => console.log('Action 3') }
                    ]
                }, { MF: window.MathematicalFoundation });
                this.componentInstances.push(buttonGroup);
                return buttonGroup.render();
            }
        );
    },
    
    renderVGAGridExample(container, id, title) {
        this.createSimpleComponentExample(container, id, title,
            'ComponentLibrary.VGAGrid({ items: [{ value }], cols, showHex, onItemClick })',
            () => {
                const vgaColors = [
                    { value: '#000000' }, { value: '#800000' }, { value: '#008000' }, { value: '#808000' },
                    { value: '#000080' }, { value: '#800080' }, { value: '#008080' }, { value: '#c0c0c0' },
                    { value: '#808080' }, { value: '#ff0000' }, { value: '#00ff00' }, { value: '#ffff00' },
                    { value: '#0000ff' }, { value: '#ff00ff' }, { value: '#00ffff' }, { value: '#ffffff' }
                ];
                const vgaGrid = new ComponentLibrary.VGAGrid({
                    items: vgaColors,
                    cols: 4,
                    showHex: true,
                    onItemClick: (color, index) => console.log('Color:', color.value)
                }, { MF: window.MathematicalFoundation });
                this.componentInstances.push(vgaGrid);
                return vgaGrid.render();
            }
        );
    },
    
    // Typography & Content Components
    renderHeadingExample(container, id, title) {
        this.createSimpleComponentExample(container, id, title,
            'ComponentLibrary.Heading({ level: 1-6, content })',
            () => {
                const headingDemo = document.createElement('div');
                [1, 2, 3, 4, 5, 6].forEach(level => {
                    const heading = new ComponentLibrary.Heading({
                        level,
                        content: `H${level} HEADING EXAMPLE`
                    }, { MF: window.MathematicalFoundation });
                    this.componentInstances.push(heading);
                    headingDemo.appendChild(heading.render());
                });
                return headingDemo;
            }
        );
    },
    
    renderParagraphExample(container, id, title) {
        this.createSimpleComponentExample(container, id, title,
            'ComponentLibrary.Paragraph({ content })',
            () => {
                const paragraph = new ComponentLibrary.Paragraph({
                    content: 'This is an example paragraph component using the SiteBoy framework. It demonstrates the canonical paragraph styling with Space Mono typography and proper F=12px mathematical spacing.'
                }, { MF: window.MathematicalFoundation });
                this.componentInstances.push(paragraph);
                return paragraph.render();
            }
        );
    },
    
    renderQuoteExample(container, id, title) {
        this.createSimpleComponentExample(container, id, title,
            'ComponentLibrary.Quote({ content, cite })',
            () => {
                const quote = new ComponentLibrary.Quote({
                    content: 'Simple and technically minimal is preferable. Speed and readability of code is key.',
                    cite: 'SiteBoy Framework Design Philosophy'
                }, { MF: window.MathematicalFoundation });
                this.componentInstances.push(quote);
                return quote.render();
            }
        );
    },
    
    renderMarkdownExample(container, id, title) {
        this.createSimpleComponentExample(container, id, title,
            'ComponentLibrary.MarkdownBody({ markdownText })',
            () => {
                const markdown = new ComponentLibrary.MarkdownBody({
                    markdownText: `## Sample Markdown\n\nThis demonstrates **bold** and *italic* text.\n\n\`\`\`javascript\nconst example = 'code block';\n\`\`\`\n\n- List item 1\n- List item 2`
                }, { MF: window.MathematicalFoundation });
                this.componentInstances.push(markdown);
                return markdown.render();
            }
        );
    },
    
    renderHierarchicalTOCExample(container, id, title) {
        this.createSimpleComponentExample(container, id, title,
            'ComponentLibrary.HierarchicalTOC({ sections, onSectionClick, onSubsectionClick })',
            () => {
                const tocSections = [
                    {
                        id: 'example',
                        title: 'EXAMPLE SECTION',
                        description: 'Demonstration section',
                        isExpandable: true,
                        isExpanded: false,
                        subsections: [
                            { id: 'sub1', title: 'Subsection 1', path: '#sub1' },
                            { id: 'sub2', title: 'Subsection 2', path: '#sub2' }
                        ]
                    }
                ];
                const toc = new ComponentLibrary.HierarchicalTOC({
                    sections: tocSections,
                    onSectionClick: (id) => console.log('TOC section:', id),
                    onSubsectionClick: (path) => console.log('TOC subsection:', path)
                }, { MF: window.MathematicalFoundation });
                this.componentInstances.push(toc);
                return toc.render();
            }
        );
    },
    
    // Form Components  
    renderInputExample(container, id, title) {
        this.createSimpleComponentExample(container, id, title,
            'ComponentLibrary.Input({ type, placeholder, value, onChange })',
            () => {
                const inputDemo = document.createElement('div');
                
                const textInput = new ComponentLibrary.Input({
                    type: 'text',
                    placeholder: 'Enter text...',
                    onChange: (value) => console.log('Input:', value)
                }, { MF: window.MathematicalFoundation });
                this.componentInstances.push(textInput);
                
                const emailInput = new ComponentLibrary.Input({
                    type: 'email',
                    placeholder: 'Enter email...',
                    onChange: (value) => console.log('Email:', value)
                }, { MF: window.MathematicalFoundation });
                this.componentInstances.push(emailInput);
                
                inputDemo.appendChild(textInput.render());
                inputDemo.appendChild(document.createElement('br'));
                inputDemo.appendChild(emailInput.render());
                
                return inputDemo;
            }
        );
    },
    
    renderSelectExample(container, id, title) {
        this.createSimpleComponentExample(container, id, title,
            'ComponentLibrary.Select({ options, value, onChange })',
            () => {
                const select = new ComponentLibrary.Select({
                    options: [
                        { value: 'option1', label: 'Option 1' },
                        { value: 'option2', label: 'Option 2' },
                        { value: 'option3', label: 'Option 3' }
                    ],
                    onChange: (value) => console.log('Selected:', value)
                }, { MF: window.MathematicalFoundation });
                this.componentInstances.push(select);
                return select.render();
            }
        );
    },
    
    // Data Visualization with VGA Colors
    renderBarGraphExample(container, id, title) {
        this.createSimpleComponentExample(container, id, title,
            'ComponentLibrary.BarGraph({ data, labels, colours }) - VGA color scheme',
            () => {
                // Define consistent VGA color palette for graphs
                const vgaGraphColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
                
                const barGraph = new ComponentLibrary.BarGraph({
                    data: [25, 45, 30, 65, 20, 80],
                    labels: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6'],
                    colours: vgaGraphColors,
                    size: 'm'
                }, { MF: window.MathematicalFoundation });
                this.componentInstances.push(barGraph);
                return barGraph.render();
            }
        );
    },
    
    renderLineGraphExample(container, id, title) {
        this.createSimpleComponentExample(container, id, title,
            'ComponentLibrary.LineGraph({ data, labels, colours }) - VGA color scheme',
            () => {
                const vgaGraphColors = ['#ff0000', '#00ff00', '#0000ff'];
                const lineGraph = new ComponentLibrary.LineGraph({
                    data: [10, 25, 35, 45, 30, 60],
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    colours: vgaGraphColors,
                    size: 'm'
                }, { MF: window.MathematicalFoundation });
                this.componentInstances.push(lineGraph);
                return lineGraph.render();
            }
        );
    },
    
    renderPieGraphExample(container, id, title) {
        this.createSimpleComponentExample(container, id, title,
            'ComponentLibrary.PieGraph({ data, labels, colours }) - VGA color scheme',
            () => {
                const vgaGraphColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];
                const pieGraph = new ComponentLibrary.PieGraph({
                    data: [30, 25, 25, 20],
                    labels: ['Red', 'Green', 'Blue', 'Yellow'],
                    colours: vgaGraphColors,
                    size: 'm'
                }, { MF: window.MathematicalFoundation });
                this.componentInstances.push(pieGraph);
                return pieGraph.render();
            }
        );
    },
    
    renderProgressExample(container, id, title) {
        this.createSimpleComponentExample(container, id, title,
            'ComponentLibrary.ProgressBar({ value, max, showPercent })',
            () => {
                const progress = new ComponentLibrary.ProgressBar({
                    value: 75,
                    max: 100,
                    showPercent: true
                }, { MF: window.MathematicalFoundation });
                this.componentInstances.push(progress);
                return progress.render();
            }
        );
    },
    
    // Media Components
    renderImageExample(container, id, title) {
        this.createSimpleComponentExample(container, id, title,
            'ComponentLibrary.Image({ src, alt, width, height })',
            () => {
                const image = new ComponentLibrary.Image({
                    src: 'data:image/svg+xml;base64,' + btoa(`
                        <svg width="150" height="100" xmlns="http://www.w3.org/2000/svg">
                            <rect width="150" height="100" fill="#808080"/>
                            <text x="75" y="55" text-anchor="middle" fill="#c0c0c0" font-family="monospace">IMAGE DEMO</text>
                        </svg>
                    `),
                    alt: 'Demo Image',
                    width: 150,
                    height: 100
                }, { MF: window.MathematicalFoundation });
                this.componentInstances.push(image);
                return image.render();
            }
        );
    },
    
    renderVideoExample(container, id, title) {
        this.createSimpleComponentExample(container, id, title,
            'ComponentLibrary.Video({ src, width, height, controls })',
            () => {
                const videoDemo = document.createElement('div');
                videoDemo.style.cssText = `
                    border: 1px solid var(--c-border);
                    padding: 12px;
                    text-align: center;
                    font-family: 'Space Mono', monospace;
                    font-size: 10px;
                    width: 200px;
                    height: 100px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--c-border);
                    color: var(--c-bg);
                `;
                videoDemo.textContent = 'VIDEO COMPONENT DEMO';
                return videoDemo;
            }
        );
    },
    
    renderAudioExample(container, id, title) {
        this.createSimpleComponentExample(container, id, title,
            'ComponentLibrary.Audio({ src, controls })',
            () => {
                const audioDemo = document.createElement('div');
                audioDemo.style.cssText = `
                    border: 1px solid var(--c-border);
                    padding: 12px;
                    text-align: center;
                    font-family: 'Space Mono', monospace;
                    font-size: 10px;
                    width: 200px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--c-border);
                    color: var(--c-bg);
                `;
                audioDemo.textContent = 'AUDIO COMPONENT DEMO';
                return audioDemo;
            }
        );
    },
    
    // Specialized Components
    renderCanvasExample(container, id, title) {
        this.createSimpleComponentExample(container, id, title,
            'ComponentLibrary.MathematicalCanvas({ width, height, drawFunction })',
            () => {
                const canvas = new ComponentLibrary.MathematicalCanvas({
                    width: 200,
                    height: 150,
                    drawFunction: (ctx, width, height) => {
                        // Mathematical precision demo with VGA colors
                        const F = 12;
                        ctx.strokeStyle = '#c0c0c0'; // VGA silver
                        ctx.fillStyle = '#ff0000';   // VGA red
                        
                        // Grid based on F=12px
                        for (let x = 0; x < width; x += F) {
                            ctx.beginPath();
                            ctx.moveTo(x, 0);
                            ctx.lineTo(x, height);
                            ctx.stroke();
                        }
                        for (let y = 0; y < height; y += F) {
                            ctx.beginPath();
                            ctx.moveTo(0, y);
                            ctx.lineTo(width, y);
                            ctx.stroke();
                        }
                        
                        // Mathematical shapes
                        ctx.fillRect(F, F, F*3, F*2);
                        ctx.strokeRect(F*5, F, F*3, F*2);
                    }
                }, { MF: window.MathematicalFoundation });
                this.componentInstances.push(canvas);
                return canvas.render();
            }
        );
    },
    
    renderCollapsibleExample(container, id, title) {
        this.createSimpleComponentExample(container, id, title,
            'ComponentLibrary.CollapsibleBase({ isExpanded, onToggle })',
            () => {
                const collapsible = new ComponentLibrary.CollapsibleBase({
                    isExpanded: false,
                    onToggle: (expanded) => console.log('Collapsible:', expanded ? 'expanded' : 'collapsed')
                }, { MF: window.MathematicalFoundation });
                this.componentInstances.push(collapsible);
                return collapsible.render();
            }
        );
    },
    
    renderGenericComponentExample(container, id, title) {
        this.createSimpleComponentExample(container, id, title,
            `${title} - Implementation pending`,
            () => {
                const placeholder = document.createElement('div');
                placeholder.style.cssText = `
                    padding: 12px; border: 1px dashed var(--c-border);
                    color: var(--c-text); text-align: center;
                    font-family: 'Space Mono', monospace;
                    font-size: 10px;
                `;
                placeholder.textContent = `${title} example - to be implemented`;
                return placeholder;
            }
        );
    },
    
    /**
     * Create a simplified component example with less markup
     */
    createSimpleComponentExample(container, id, title, usage, createExample) {
        // Simplified component container
        const exampleContainer = document.createElement('div');
        exampleContainer.id = id;
        exampleContainer.style.cssText = `
            margin: 12px 0; padding: 8px;
            border-left: 3px solid var(--c-border);
        `;
        
        // Component title and usage on same line
        const titleElement = document.createElement('div');
        titleElement.style.cssText = `
            font-weight: bold; margin-bottom: 8px;
            font-family: var(--f-mono);
        `;
        titleElement.innerHTML = `<strong>${title}:</strong> <code>${usage}</code>`;
        exampleContainer.appendChild(titleElement);
        
        // Live example
        const exampleElement = createExample();
        if (exampleElement) {
            exampleContainer.appendChild(exampleElement);
        }
        
        container.appendChild(exampleContainer);
    },
    
    /**
     * Test utility methods
     */
    runAllTests() {
        console.log('Running all UI tests...');
    },
    
    runVGATest() {
        console.log('Running VGA test...');
    },
    
    runCanvasTest() {
        console.log('Running canvas test...');
    },
    
    clearTestArea() {
        const testArea = document.getElementById('test-area');
        if (testArea) {
            testArea.innerHTML = '';
        }
    },
    
    /**
     * Cleanup section
     */
    cleanup() {
        if (this.currentContainer) {
            this.currentContainer.innerHTML = '';
        }
        
        // Destroy tracked components using ComponentLibrary method
        ComponentLibrary.destroyTracked(this.componentInstances);
    },
    
    /**
     * Initialize section (legacy support)
     */
    init() {
        console.log(`🔧 Tools Section v${this.version} initialized`);
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
window.ToolsSection = ToolsSection;

console.log(`🔧 Tools Section v${ToolsSection.version} ready - Refactored with Canonical Components`);