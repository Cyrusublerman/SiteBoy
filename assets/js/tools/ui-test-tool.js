/**
 * UI Test Tool - SiteBoy Framework
 * 
 * TESTING UTILITIES for component development
 * Simple tools for testing UI components in development
 * 
 * @version 1.0.0 - UI Testing
 * @dependencies ['ComponentLibrary'] - Consolidated component system
 */

const UITestTool = {
    version: '1.0.0',
    
    /**
     * Test all basic components
     */
    testAllComponents(container) {
        console.log(`🧪 UI Test Tool v${this.version} - Testing all components`);
        
        if (!container) {
            console.error('❌ No container provided for testing');
            return;
        }
        
        // Clear container
        container.innerHTML = '';
        
        // Test grid
        const testGrid = ComponentLibrary.grid(
            ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6'],
            { 
                cols: 3,
                onItemClick: (item, index) => console.log(`Grid item clicked: ${item} (${index})`)
            }
        );
        container.appendChild(testGrid.container);
        
        // Test buttons
        const testButtons = ComponentLibrary.buttonGroup([
            { text: 'Button 1', onClick: () => console.log('Button 1 clicked') },
            { text: 'Button 2', onClick: () => console.log('Button 2 clicked') },
            { text: 'Button 3', onClick: () => console.log('Button 3 clicked') }
        ]);
        container.appendChild(testButtons.container);
        
        // Test progress bar
        const testProgress = ComponentLibrary.progress({ value: 75, max: 100 });
        container.appendChild(testProgress.container);
        
        // Test dropdown
        const testDropdown = ComponentLibrary.dropdown({
            triggerText: 'Select Option',
            items: ['Option 1', 'Option 2', 'Option 3'],
            onItemClick: (item) => console.log(`Dropdown item selected: ${item}`)
        });
        container.appendChild(testDropdown.container);
        
        console.log('✅ All components tested');
    },
    
    /**
     * Test VGA color grid
     */
    testVGAGrid(container) {
        console.log('🎨 Testing VGA Grid');
        
        const vgaColors = [
            { value: '#000000' }, { value: '#800000' }, { value: '#008000' }, { value: '#808000' },
            { value: '#000080' }, { value: '#800080' }, { value: '#008080' }, { value: '#c0c0c0' },
            { value: '#808080' }, { value: '#ff0000' }, { value: '#00ff00' }, { value: '#ffff00' },
            { value: '#0000ff' }, { value: '#ff00ff' }, { value: '#00ffff' }, { value: '#ffffff' }
        ];
        
        const vgaGrid = ComponentLibrary.vgaGrid(vgaColors, {
            cols: 4,
            showHex: true,
            onItemClick: (color, index) => console.log(`Color clicked: ${color.value}`)
        });
        
        container.appendChild(vgaGrid.container);
        console.log('✅ VGA Grid tested');
    },
    
    /**
     * Test mathematical canvas
     */
    testCanvas(container) {
        console.log('📊 Testing Mathematical Canvas');
        
        const testCanvas = ComponentLibrary.canvas({
            width: 400,
            height: 200,
            drawFunction: (ctx, width, height) => {
                // Simple test drawing
                ctx.fillStyle = 'var(--c-text)';
                ctx.fillRect(10, 10, 50, 50);
                ctx.strokeRect(70, 10, 50, 50);
                ctx.fillText('Test Canvas', 10, 70);
                
                // Draw grid
                ctx.strokeStyle = 'var(--c-border)';
                for (let x = 0; x < width; x += 20) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, height);
                    ctx.stroke();
                }
                for (let y = 0; y < height; y += 20) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(width, y);
                    ctx.stroke();
                }
            }
        });
        
        container.appendChild(testCanvas.container);
        console.log('✅ Canvas tested');
    },
    
    /**
     * Test markdown rendering
     */
    testMarkdown(container) {
        console.log('📝 Testing Markdown');
        
        const sampleMarkdown = `
# Test Markdown

This is a **bold** text and this is *italic*.

## Code Example

\`\`\`javascript
console.log('Hello, world!');
\`\`\`

- List item 1
- List item 2
- List item 3

[Link Example](https://example.com)
        `;
        
        const markdownTest = ComponentLibrary.markdownBody(sampleMarkdown);
        container.appendChild(markdownTest.container);
        console.log('✅ Markdown tested');
    }
};

// Global registration
window.UITestTool = UITestTool;

console.log(`🧪 UI Test Tool v${UITestTool.version} ready`);
