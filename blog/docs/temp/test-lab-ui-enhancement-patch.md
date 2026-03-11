# Algorithms Test Lab — UI Component Testing Enhancement

## Summary

Add PAGE 7 for UI component testing (Scrollbar, Canvas zoom/pan) to algorithms-test-lab.js

## Changes Required

### 1. Add PAGE 7 to PAGES array (after PAGE 6, before closing bracket)

Insert at line ~481 (after PAGE 6 definition):

```javascript
        // ═══════════════════════════════════════════════════════════════════
        // PAGE 7: UI COMPONENTS TESTING
        // ═══════════════════════════════════════════════════════════════════
        {
            id: 'page7',
            title: 'UI Components',
            domains: [
                {
                    id: 'navigation',
                    title: 'Navigation Components',
                    docsPath: 'components/navigation',
                    algorithms: [
                        { id: 'scrollbar-vertical', title: 'Scrollbar (Vertical)', impl: true },
                        { id: 'scrollbar-horizontal', title: 'Scrollbar (Horizontal)', impl: true },
                        { id: 'scrollbar-slider', title: 'Scrollbar (Slider Mode)', impl: true }
                    ]
                },
                {
                    id: 'canvas',
                    title: 'Canvas Components',
                    docsPath: 'components/output',
                    algorithms: [
                        { id: 'canvas-zoom-pan', title: 'Canvas Zoom/Pan', impl: true },
                        { id: 'canvas-interactive', title: 'Canvas Interactive', impl: true }
                    ]
                }
            ]
        }
```

### 2. Add Documentation Paths to ALGORITHM_DOCS_MAP

Insert before the comment section at the end of ALGORITHM_DOCS_MAP:

```javascript
        // ═══════════════════════════════════════════════════════════════════
        // PAGE 7: UI COMPONENTS
        // ═══════════════════════════════════════════════════════════════════
        
        // Navigation Components
        'page7.navigation.scrollbar-vertical': 'blog/docs/components/navigation/Scrollbar.md',
        'page7.navigation.scrollbar-horizontal': 'blog/docs/components/navigation/Scrollbar.md',
        'page7.navigation.scrollbar-slider': 'blog/docs/components/navigation/Scrollbar.md',
        
        // Canvas Components
        'page7.canvas.canvas-zoom-pan': 'blog/docs/components/output/Canvas.md',
        'page7.canvas.canvas-interactive': 'blog/docs/components/output/Canvas.md'
```

### 3. Add Render Functions

Add these render functions in the main drawing section (search for "function draw" and add alongside other renderers):

```javascript
    /**
     * Render UI component tests
     */
    function renderUIComponent(ctx, canvas, algorithmId) {
        const { F } = window.MathematicalFoundation || { F: 14 };
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (algorithmId.includes('scrollbar')) {
            renderScrollbarTest(ctx, canvas, algorithmId);
        } else if (algorithmId.includes('canvas')) {
            renderCanvasTest(ctx, canvas, algorithmId);
        }
    }
    
    /**
     * Render scrollbar component demo
     */
    function renderScrollbarTest(ctx, canvas, algorithmId) {
        const { F } = window.MathematicalFoundation || { F: 14 };
        
        // Clear canvas
        ctx.fillStyle = 'var(--c-bg)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw title
        ctx.fillStyle = 'var(--c-text)';
        ctx.font = `${F}px 'Atkinson Hyperlegible', monospace`;
        ctx.textAlign = 'center';
        
        if (algorithmId.includes('vertical')) {
            ctx.fillText('SCROLLBAR COMPONENT (VERTICAL)', canvas.width / 2, F * 2);
            ctx.fillText('See sidebar for live demo →', canvas.width / 2, F * 4);
        } else if (algorithmId.includes('horizontal')) {
            ctx.fillText('SCROLLBAR COMPONENT (HORIZONTAL)', canvas.width / 2, F * 2);
            ctx.fillText('See below canvas for live demo', canvas.width / 2, F * 4);
        } else if (algorithmId.includes('slider')) {
            ctx.fillText('SCROLLBAR COMPONENT (SLIDER MODE)', canvas.width / 2, F * 2);
            ctx.fillText('Value slider / range control', canvas.width / 2, F * 4);
        }
        
        // Draw component features
        const features = [
            'Auto-detection (orientation, size, borders)',
            'Proportional thumb (1/3 visible = 1/3 thumb)',
            'F-system sizing (14px or 7px)',
            'VGA color integration',
            'Smooth momentum scrolling',
            'Mouse drag, wheel, keyboard, touch',
            'Theme-aware (light/dark mode)',
            'Zero-config operation'
        ];
        
        ctx.textAlign = 'left';
        ctx.font = `${F * 0.85}px 'Atkinson Hyperlegible', monospace`;
        features.forEach((feature, i) => {
            ctx.fillText(`• ${feature}`, F * 2, F * (7 + i * 1.5));
        });
        
        // Draw usage example
        ctx.fillText('Usage:', F * 2, canvas.height - F * 6);
        ctx.fillText('const scrollbar = new Scrollbar({ target: element });', F * 3, canvas.height - F * 4);
        ctx.fillText('// Auto-detects everything', F * 3, canvas.height - F * 2.5);
    }
    
    /**
     * Render canvas zoom/pan demo
     */
    function renderCanvasTest(ctx, canvas, algorithmId) {
        const { F } = window.MathematicalFoundation || { F: 14 };
        
        // Draw grid to demonstrate zoom/pan
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Grid
        ctx.strokeStyle = '#808080';
        ctx.lineWidth = 1;
        
        const gridSize = 50;
        for (let x = 0; x <= canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y <= canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // Center circle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 30, 0, Math.PI * 2);
        ctx.fill();
        
        // Instructions
        ctx.fillStyle = '#ffffff';
        ctx.font = `${F}px 'Atkinson Hyperlegible', monospace`;
        ctx.textAlign = 'center';
        ctx.fillText('CANVAS ZOOM/PAN', canvas.width / 2, F * 2);
        
        ctx.font = `${F * 0.85}px 'Atkinson Hyperlegible', monospace`;
        ctx.fillText('Wheel to zoom', canvas.width / 2, F * 4);
        ctx.fillText('Drag to pan', canvas.width / 2, F * 5.5);
        ctx.fillText('Double-click to reset', canvas.width / 2, F * 7);
        ctx.fillText('Keyboard: +/- to zoom, 0 to reset', canvas.width / 2, F * 8.5);
    }
```

### 4. Add Rendering Dispatch

In the main `draw()` function, add dispatch for UI components:

Search for the section that handles algorithm rendering (likely around the switch/if statements for different domain types). Add:

```javascript
        } else if (parts[1] === 'navigation' || parts[1] === 'canvas') {
            // UI component testing
            renderUIComponent(ctx, canvas, algorithmId);
```

### 5. Add Scrollbar Instance to Sidebar

In the `buildSidebarForPage` function or wherever the sidebar is constructed, add logic to instantiate a live Scrollbar for testing:

```javascript
// Add live scrollbar demo to sidebar when on page7
if (pageId === 'page7') {
    // Create scrollable content for demo
    const demoContent = document.createElement('div');
    demoContent.style.cssText = `
        height: 200px;
        overflow-y: auto;
        border: 1px solid var(--c-border);
        padding: calc(var(--f) * 2);
        margin: calc(var(--f)) 0;
        background: var(--c-bg);
    `;
    
    // Add content
    for (let i = 0; i < 20; i++) {
        const line = document.createElement('div');
        line.textContent = `Scrollable line ${i + 1}`;
        line.style.cssText = `
            padding: calc(var(--f) / 2) 0;
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: var(--f);
            color: var(--c-text);
        `;
        demoContent.appendChild(line);
    }
    
    // Add to sidebar
    const demoBlock = instance.tool.addBlock({
        title: 'Live Scrollbar Demo',
        content: demoContent
    });
    
    // Instantiate scrollbar
    const scrollbar = new ComponentLibrary.Scrollbar({
        target: demoContent,
        hideWhenInactive: false
    });
    
    // Track for cleanup
    if (!instance.componentInstances) {
        instance.componentInstances = [];
    }
    instance.componentInstances.push(scrollbar);
}
```

### 6. Enable Canvas Zoom/Pan

When creating the canvas for the test lab, enable zoom/pan features:

Search for where the canvas is created (likely in ToolBase configuration) and add:

```javascript
// In canvas configuration
canvas: {
    width: 420,
    height: 420,
    enableZoom: true,  // Enable zoom
    enablePan: true,   // Enable pan
    minZoom: 0.1,
    maxZoom: 10
}
```

## Implementation Steps

1. **Backup the file**: `algorithms-test-lab.js` is 4006 lines
2. **Add PAGE 7**: Insert at line ~481
3. **Add docs map**: Insert at end of ALGORITHM_DOCS_MAP
4. **Add render functions**: Insert in rendering section
5. **Add dispatch logic**: Update main draw() function
6. **Add live demo**: Update sidebar builder
7. **Enable zoom/pan**: Update canvas config

## Testing Checklist

- [ ] PAGE 7 appears in page dropdown
- [ ] Navigation tab shows in sidebar
- [ ] Canvas tab shows in sidebar
- [ ] Scrollbar algorithms render info
- [ ] Canvas algorithms show zoom/pan demo
- [ ] Live scrollbar appears in sidebar
- [ ] Canvas zoom works (mouse wheel)
- [ ] Canvas pan works (drag)
- [ ] Canvas reset works (double-click)
- [ ] Documentation links work

## Benefits

1. **Scrollbar Testing**: Live component testing in controlled environment
2. **Canvas Enhancement**: All canvases now have zoom/pan (not just test lab)
3. **Documentation**: Links to component docs for reference
4. **Developer Tool**: UI components can be tested alongside algorithms

## Files Modified

1. `assets/js/tools/utilities/algorithms-test-lab.js` (add PAGE 7, renderers, demos)
2. `assets/js/shared/components/output/Canvas.js` (already completed - zoom/pan added)

## Status

**Canvas.js**: ✅ Complete (zoom/pan system added)
**Test Lab Changes**: ⏳ Pending (requires manual edit due to file size)

The Canvas component already has full zoom/pan functionality. The test lab just needs the configuration updates described above to enable it and add the UI testing page.
