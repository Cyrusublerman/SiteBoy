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
     * Render tools index using ComponentLibrary
     */
    renderToolsIndex() {
        console.log('🔧 Rendering tools index with canonical components');
        
        // Create title
        const title = new ComponentLibrary.Heading({
            level: 1,
            content: 'DEVELOPMENT TOOLS'
        });
        this.componentInstances.push(title);
        this.currentContainer.appendChild(title.render());
        
        // Create description
        const description = new ComponentLibrary.Paragraph({
            content: 'Interactive development and testing tools. Click on any tool to launch it.'
        });
        this.componentInstances.push(description);
        this.currentContainer.appendChild(description.render());
        
        // Create tools grid using canonical Grid component
        const toolItems = [
            { text: 'UI TEST TOOL', id: 'ui-test' },
            { text: 'COLOR GRID', id: 'color-grid' },
            { text: 'CANVAS TEST', id: 'canvas-test' },
            { text: 'TYPOGRAPHY', id: 'typography' },
            { text: 'PIXEL TILER', id: 'pixel-tiler' },
            { text: 'FONT ANALYSIS', id: 'font-analysis' },
            { text: 'COLOR QUANTIZER', id: 'color-quantizer' },
            { text: 'COMPONENT TEST', id: 'component-test' }
        ];
        
        const toolsGrid = new ComponentLibrary.Grid({
            items: toolItems,
            cols: 4,
            onItemClick: (item, index) => {
                // Use injected navigation callback instead of direct Router call
                if (this.navigationCallbacks && this.navigationCallbacks.navigateToSection) {
                    this.navigationCallbacks.navigateToSection('tools', item.id);
                } else {
                    console.warn('Navigation callback not available');
                }
            }
        });
        
        this.componentInstances.push(toolsGrid);
        this.currentContainer.appendChild(toolsGrid.render());
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
     * Render UI Test Tool
     */
    renderUITestTool() {
        const title = new ComponentLibrary.Heading({
            level: 1,
            content: 'UI TEST TOOL'
        });
        this.componentInstances.push(title);
        this.currentContainer.appendChild(title.render());
        
        // Create test buttons using ComponentLibrary
        const testButtons = new ComponentLibrary.ButtonGroup({
            buttons: [
                { text: 'Test All', onClick: () => this.runAllTests() },
                { text: 'Test VGA', onClick: () => this.runVGATest() },
                { text: 'Test Canvas', onClick: () => this.runCanvasTest() },
                { text: 'Clear', onClick: () => this.clearTestArea() }
            ]
        });
        
        this.componentInstances.push(testButtons);
        this.currentContainer.appendChild(testButtons.render());
        
        // Create test area container
        const testAreaContainer = document.createElement('div');
        testAreaContainer.id = 'test-area';
        testAreaContainer.style.cssText = `
            margin-top: 24px; min-height: 300px; 
            border: 1px solid var(--c-border); padding: 12px;
        `;
        this.currentContainer.appendChild(testAreaContainer);
        
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