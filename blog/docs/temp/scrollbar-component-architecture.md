# Custom Scrollbar Component — Full Architecture Specification

## Design Requirements

**Core Features:**
1. Modular BaseComponent extension
2. Adaptive sizing (F or F/2) based on context
3. Vertical AND horizontal support (same component)
4. Intelligent border logic (avoid double lines)
5. Proportional thumb (1/3 visible = 1/3 thumb)
6. VGA color system integration
7. AnimationFoundation for smooth scrolling
8. Zero configuration for common cases
9. Full manual control when needed

## Architecture Overview

```
CustomScrollbar extends BaseComponent
├─ Auto-detection system (size, orientation, container)
├─ Track (outer frame with conditional borders)
├─ Thumb (draggable indicator)
├─ Event system (wheel, drag, touch, keyboard)
├─ AnimationFoundation integration (smooth momentum)
└─ Resize observer (recalculate on viewport changes)
```

## File Ownership

**Primary Implementation:**
- Location: `assets/js/shared/components/scrollbar/Scrollbar.js`
- Reasoning: New component category (navigation/interaction hybrid)

**Alternative (if small enough):**
- Location: `assets/js/shared/interactive.js` 
- Add to existing interactive components

**Export via:**
- `assets/js/shared/component-library.js` (public API)

**Dependencies:**
- `foundation.js` → BaseComponent
- `animation-foundation.js` → AnimationLoop for momentum
- CSS vars → `--c-bg`, `--c-text`, `--c-border`
- F system → `getF()` method from BaseComponent

## Component API Design

### Initialization (Zero-Config)

```javascript
// AUTOMATIC — Scrollbar figures everything out
const scrollable = document.querySelector('.content-container');
const scrollbar = new Scrollbar({ target: scrollable });

// Component automatically:
// - Detects orientation (vertical if height > width)
// - Chooses size (F=14px default, F/2=7px if space limited)
// - Positions itself (right edge vertical, bottom edge horizontal)
// - Detects borders (inspect parent, avoid doubles)
// - Calculates proportional thumb
// - Binds events
```

### Manual Control (When Needed)

```javascript
// EXPLICIT — Full control for special cases
const scrollbar = new Scrollbar({
    target: scrollableElement,
    orientation: 'horizontal',  // 'vertical' | 'horizontal' | 'auto'
    size: 'half',               // 'full' (F) | 'half' (F/2) | 'auto'
    position: 'left',           // 'right'|'left' (vert) | 'top'|'bottom' (horiz)
    borders: {
        track: true,            // Show track border (default: auto-detect)
        thumb: false            // Show thumb border (default: false)
    },
    colors: {
        track: 'var(--c-bg)',
        thumb: 'var(--c-text)',
        border: 'var(--c-border)'
    },
    smoothScrolling: true,      // Use AnimationFoundation momentum
    smoothness: 0.15,           // Momentum easing factor
    hideWhenInactive: true,     // Fade out when not scrolling
    fadeDelay: 1000,            // ms before fade starts
    keyboard: true,             // Arrow keys, PgUp/PgDn, Home/End
    touch: true                 // Touch drag support
});
```

### GUI Slider Mode (Horizontal Use Case)

```javascript
// Use same component as horizontal value slider
const slider = new Scrollbar({
    target: null,               // No scroll target (GUI mode)
    orientation: 'horizontal',
    size: 'full',
    range: { min: 0, max: 100, value: 50 },
    onChange: (value) => {
        console.log('Slider value:', value);
    },
    labels: {
        min: '0%',
        max: '100%',
        showCurrent: true
    }
});
```

## Auto-Detection Logic

### Orientation Detection
```javascript
detectOrientation(target) {
    // If explicitly set, use it
    if (this.options.orientation !== 'auto') {
        return this.options.orientation;
    }
    
    // Auto-detect based on content overflow
    const hasVerticalOverflow = target.scrollHeight > target.clientHeight;
    const hasHorizontalOverflow = target.scrollWidth > target.clientWidth;
    
    // If both, choose dominant direction
    if (hasVerticalOverflow && hasHorizontalOverflow) {
        const vRatio = target.scrollHeight / target.clientHeight;
        const hRatio = target.scrollWidth / target.clientWidth;
        return vRatio > hRatio ? 'vertical' : 'horizontal';
    }
    
    return hasVerticalOverflow ? 'vertical' : 'horizontal';
}
```

### Size Detection (F vs F/2)
```javascript
detectSize(target) {
    if (this.options.size !== 'auto') {
        return this.options.size === 'full' ? this.F : this.F2;
    }
    
    const { F, F2 } = this.getF();
    
    // Use F/2 if:
    // - Parent width < 400px (small container)
    // - Nested scrollbars detected (inner scrollable)
    // - Tool sidebar context (limited space)
    
    const parentWidth = target.parentElement?.clientWidth || 0;
    const isNested = this.detectNestedScrollbar(target);
    const isSidebar = target.closest('.tool-sidebar, .animation-sidebar');
    
    if (parentWidth < 400 || isNested || isSidebar) {
        return F2;
    }
    
    return F;
}
```

### Border Detection (Avoid Doubles)
```javascript
detectBorders(target) {
    if (this.options.borders?.track !== undefined) {
        return this.options.borders.track;
    }
    
    // Check if parent has border on scrollbar side
    const parentStyle = getComputedStyle(target);
    const side = this.orientation === 'vertical' ? 'right' : 'bottom';
    const hasBorder = parentStyle[`border-${side}-width`] !== '0px';
    
    // If parent has border, don't add track border (avoid double line)
    return !hasBorder;
}
```

## DOM Structure

```html
<div class="custom-scrollbar" data-orientation="vertical" data-size="14">
    <!-- Track: outer container -->
    <div class="scrollbar-track">
        <!-- Thumb: draggable indicator -->
        <div class="scrollbar-thumb" style="height: 33.33%"></div>
    </div>
</div>
```

**CSS Classes (added to styles.css):**
```css
.custom-scrollbar {
    position: absolute;
    z-index: 100;
    /* Position/size set via inline styles (mathematical precision) */
}

.custom-scrollbar[data-orientation="vertical"] {
    /* top/right/height set by component */
}

.custom-scrollbar[data-orientation="horizontal"] {
    /* left/bottom/width set by component */
}

.scrollbar-track {
    position: relative;
    width: 100%;
    height: 100%;
    background: var(--c-bg);
    /* Border conditional via component logic */
}

.scrollbar-track.with-border {
    border: 1px solid var(--c-border);
}

.scrollbar-thumb {
    position: absolute;
    background: var(--c-text);
    cursor: grab;
    /* Size/position calculated dynamically */
}

.scrollbar-thumb:active {
    cursor: grabbing;
}

.scrollbar-thumb:hover {
    background: var(--c-accent);
}

/* Hide when inactive (optional) */
.custom-scrollbar.inactive {
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
}

.custom-scrollbar.active {
    opacity: 1;
    pointer-events: all;
}
```

## Proportional Thumb Calculation

```javascript
calculateThumbSize() {
    if (!this.target) return { size: 0, max: 0 };
    
    const { F } = this.getF();
    
    if (this.orientation === 'vertical') {
        const viewportHeight = this.target.clientHeight;
        const contentHeight = this.target.scrollHeight;
        const trackHeight = viewportHeight - (this.hasBorder ? 2 : 0);
        
        // Proportional: visible/total = thumb/track
        const visibleRatio = viewportHeight / contentHeight;
        const thumbHeight = Math.max(trackHeight * visibleRatio, F); // Min F height
        
        return {
            size: thumbHeight,
            max: trackHeight - thumbHeight
        };
    } else {
        const viewportWidth = this.target.clientWidth;
        const contentWidth = this.target.scrollWidth;
        const trackWidth = viewportWidth - (this.hasBorder ? 2 : 0);
        
        const visibleRatio = viewportWidth / contentWidth;
        const thumbWidth = Math.max(trackWidth * visibleRatio, F);
        
        return {
            size: thumbWidth,
            max: trackWidth - thumbWidth
        };
    }
}

updateThumbPosition() {
    const { size, max } = this.calculateThumbSize();
    
    if (this.orientation === 'vertical') {
        const scrollRatio = this.target.scrollTop / 
            (this.target.scrollHeight - this.target.clientHeight);
        const thumbY = scrollRatio * max;
        
        this.thumb.style.height = `${size}px`;
        this.thumb.style.top = `${thumbY}px`;
    } else {
        const scrollRatio = this.target.scrollLeft / 
            (this.target.scrollWidth - this.target.clientWidth);
        const thumbX = scrollRatio * max;
        
        this.thumb.style.width = `${size}px`;
        this.thumb.style.left = `${thumbX}px`;
    }
}
```

## Event Handling

### Scroll Synchronization
```javascript
setupScrollSync() {
    // Target scrolls → update thumb position
    this.target.addEventListener('scroll', () => {
        this.updateThumbPosition();
        this.showScrollbar();
        this.scheduleHide();
    });
}
```

### Thumb Dragging
```javascript
setupDragHandlers() {
    let isDragging = false;
    let startY = 0;
    let startScrollTop = 0;
    
    this.thumb.addEventListener('mousedown', (e) => {
        isDragging = true;
        startY = e.clientY;
        startScrollTop = this.target.scrollTop;
        this.thumb.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaY = e.clientY - startY;
        const { max } = this.calculateThumbSize();
        const scrollableHeight = this.target.scrollHeight - this.target.clientHeight;
        
        // Convert thumb delta to scroll delta
        const scrollDelta = (deltaY / max) * scrollableHeight;
        this.target.scrollTop = startScrollTop + scrollDelta;
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
        this.thumb.style.cursor = 'grab';
    });
}
```

### Wheel Events (Smooth Scrolling)
```javascript
setupWheelHandler() {
    if (!this.options.smoothScrolling) return;
    
    // Use AnimationFoundation for momentum
    this.scrollAnimator = new AnimationLoop({
        onFrame: () => {
            if (Math.abs(this.targetScroll - this.currentScroll) < 0.5) {
                this.scrollAnimator.stop();
                return;
            }
            
            // Ease towards target
            this.currentScroll += (this.targetScroll - this.currentScroll) * this.smoothness;
            this.target.scrollTop = this.currentScroll;
        }
    });
    
    this.target.addEventListener('wheel', (e) => {
        e.preventDefault();
        this.targetScroll += e.deltaY;
        this.targetScroll = Math.max(0, Math.min(
            this.targetScroll,
            this.target.scrollHeight - this.target.clientHeight
        ));
        
        if (!this.scrollAnimator.isRunning) {
            this.currentScroll = this.target.scrollTop;
            this.scrollAnimator.start();
        }
    });
}
```

### Keyboard Navigation
```javascript
setupKeyboardNav() {
    if (!this.options.keyboard) return;
    
    const { F } = this.getF();
    
    this.target.addEventListener('keydown', (e) => {
        const scrollAmount = {
            'ArrowUp': -F * 2,
            'ArrowDown': F * 2,
            'PageUp': -this.target.clientHeight * 0.9,
            'PageDown': this.target.clientHeight * 0.9,
            'Home': -this.target.scrollTop,
            'End': this.target.scrollHeight
        }[e.key];
        
        if (scrollAmount !== undefined) {
            e.preventDefault();
            this.target.scrollTop += scrollAmount;
        }
    });
}
```

### Touch Support
```javascript
setupTouchHandlers() {
    if (!this.options.touch) return;
    
    let startY = 0;
    let startScrollTop = 0;
    
    this.thumb.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        startScrollTop = this.target.scrollTop;
    });
    
    this.thumb.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const deltaY = e.touches[0].clientY - startY;
        const { max } = this.calculateThumbSize();
        const scrollableHeight = this.target.scrollHeight - this.target.clientHeight;
        const scrollDelta = (deltaY / max) * scrollableHeight;
        this.target.scrollTop = startScrollTop + scrollDelta;
    });
}
```

## Resize Handling

```javascript
setupResizeObserver() {
    // Use ResizeObserver for content/viewport changes
    this.resizeObserver = new ResizeObserver(() => {
        this.recalculate();
    });
    
    this.resizeObserver.observe(this.target);
    
    // Also watch for content mutations
    this.mutationObserver = new MutationObserver(() => {
        this.recalculate();
    });
    
    this.mutationObserver.observe(this.target, {
        childList: true,
        subtree: true
    });
}

recalculate() {
    // Recheck if scrollbar needed
    const needsScrollbar = this.orientation === 'vertical'
        ? this.target.scrollHeight > this.target.clientHeight
        : this.target.scrollWidth > this.target.clientWidth;
    
    if (needsScrollbar) {
        this.element.style.display = 'block';
        this.updateThumbPosition();
    } else {
        this.element.style.display = 'none';
    }
}
```

## Lifecycle Methods

```javascript
class Scrollbar extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'scrollbar' }, deps);
        
        this.target = options.target;
        this.orientation = null;
        this.size = null;
        this.hasBorder = null;
        
        this.scrollAnimator = null;
        this.hideTimeout = null;
        this.resizeObserver = null;
        this.mutationObserver = null;
        
        if (this.target) {
            this.init();
        }
    }
    
    init() {
        window.debugLog('INIT', '📜 Initializing CustomScrollbar');
        
        // Auto-detect parameters
        this.orientation = this.detectOrientation(this.target);
        this.size = this.detectSize(this.target);
        this.hasBorder = this.detectBorders(this.target);
        
        // Build DOM structure
        this.render();
        
        // Setup event handlers
        this.setupScrollSync();
        this.setupDragHandlers();
        this.setupWheelHandler();
        this.setupKeyboardNav();
        this.setupTouchHandlers();
        this.setupResizeObserver();
        
        // Initial calculation
        this.updateThumbPosition();
        
        window.debugLog('TOOLS', `📜 Scrollbar ready: ${this.orientation}, ${this.size}px`);
    }
    
    render() {
        // Create scrollbar container
        this.element = this.createElement('div', 'custom-scrollbar');
        this.element.dataset.orientation = this.orientation;
        this.element.dataset.size = this.size;
        
        // Create track
        this.track = this.createElement('div', 
            `scrollbar-track${this.hasBorder ? ' with-border' : ''}`
        );
        
        // Create thumb
        this.thumb = this.createElement('div', 'scrollbar-thumb');
        
        // Assemble
        this.track.appendChild(this.thumb);
        this.element.appendChild(this.track);
        
        // Position scrollbar
        this.positionScrollbar();
        
        // Insert into DOM (after target element)
        this.target.parentElement.appendChild(this.element);
    }
    
    positionScrollbar() {
        const { F } = this.getF();
        
        if (this.orientation === 'vertical') {
            const position = this.options.position || 'right';
            this.element.style.cssText = `
                position: absolute;
                top: 0;
                ${position}: 0;
                width: ${this.size}px;
                height: 100%;
            `;
        } else {
            const position = this.options.position || 'bottom';
            this.element.style.cssText = `
                position: absolute;
                ${position}: 0;
                left: 0;
                width: 100%;
                height: ${this.size}px;
            `;
        }
    }
    
    destroy() {
        window.debugLog('VERBOSE', '📜 Destroying CustomScrollbar');
        
        // Stop animations
        if (this.scrollAnimator) {
            this.scrollAnimator.destroy();
        }
        
        // Clear timers
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
        }
        
        // Disconnect observers
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
        
        // Call parent destroy
        super.destroy();
    }
}
```

## Usage Examples

### Example 1: Content Container (Auto)
```javascript
// Simplest case - component figures everything out
const container = document.querySelector('.content-container');
const scrollbar = new Scrollbar({ target: container });
```

### Example 2: Tool Sidebar (Half-size)
```javascript
// Narrow sidebar - use F/2 width
const sidebar = document.querySelector('.tool-sidebar');
const scrollbar = new Scrollbar({
    target: sidebar,
    size: 'half'  // 7px width instead of 14px
});
```

### Example 3: Horizontal Scroll (Image Gallery)
```javascript
const gallery = document.querySelector('.image-gallery');
const scrollbar = new Scrollbar({
    target: gallery,
    orientation: 'horizontal',
    position: 'bottom'
});
```

### Example 4: GUI Slider (No Scroll Target)
```javascript
// Use as value slider for tool parameter
const brightnessSlider = new Scrollbar({
    orientation: 'horizontal',
    range: { min: -100, max: 100, value: 0 },
    onChange: (value) => {
        applyBrightness(value);
    },
    labels: {
        min: '-100',
        max: '+100',
        showCurrent: true
    }
});
```

### Example 5: ToolBase Integration
```javascript
class MyTool extends ToolBase {
    constructor(container, deps) {
        super(container, deps);
        
        // Add custom scrollbar to tool viewport
        this.scrollbar = new Scrollbar({
            target: this.viewport,
            hideWhenInactive: true
        });
        
        this.componentInstances.push(this.scrollbar);
    }
}
```

## Integration Points

### With PageContainer
```javascript
// PageContainer can auto-add scrollbars
class PageContainer extends BaseComponent {
    constructor(options = {}) {
        super(options);
        
        if (options.customScrollbar) {
            this.scrollbar = new Scrollbar({
                target: this.contentContainer
            });
            this.addChild(this.scrollbar);
        }
    }
}
```

### With ToolBase
```javascript
// ToolBase provides scrollbar option
class ToolBase extends BaseComponent {
    constructor(container, deps) {
        super({ componentType: 'tool-base' }, deps);
        
        if (this.options.customScrollbar !== false) {
            this.scrollbar = new Scrollbar({
                target: this.viewport,
                size: 'auto'
            });
            this.componentInstances.push(this.scrollbar);
        }
    }
}
```

### CSS Variable Integration
```javascript
// Scrollbar respects theme changes
updateTheme() {
    const bgColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--c-bg');
    this.track.style.background = bgColor;
    
    const textColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--c-text');
    this.thumb.style.background = textColor;
}
```

## Performance Considerations

**Optimizations:**
1. **Throttle scroll updates** - Don't recalculate on every scroll pixel
2. **RAF for thumb position** - Batch DOM updates
3. **Lazy initialization** - Only create scrollbar if overflow exists
4. **Event delegation** - Single listener for multiple scrollbars
5. **CSS transforms** - Use `transform: translateY()` for thumb position (GPU)

**Memory Management:**
- Remove all event listeners in destroy()
- Disconnect all observers
- Clear all timers/intervals
- Call AnimationFoundation destroy()

## Accessibility

**ARIA Support:**
```html
<div class="custom-scrollbar" 
     role="scrollbar"
     aria-controls="content-id"
     aria-valuenow="33"
     aria-valuemin="0"
     aria-valuemax="100"
     aria-orientation="vertical"
     tabindex="0">
```

**Keyboard Navigation:**
- Arrow keys: Scroll by 2F
- PgUp/PgDn: Scroll by 90% viewport
- Home/End: Jump to start/end
- Tab: Focus scrollbar for keyboard control

**Screen Reader:**
- Announce scroll position changes
- Describe thumb as "scrollbar handle"

## Testing Strategy

**Unit Tests:**
- Orientation detection logic
- Size calculation (F vs F/2)
- Border detection algorithm
- Proportional thumb math
- Event handler binding/unbinding

**Integration Tests:**
- PageContainer integration
- ToolBase integration
- Theme switching (color updates)
- Resize behavior
- Nested scrollbars

**Visual Tests:**
- Vertical scrollbar (content-container)
- Horizontal scrollbar (image gallery)
- F-width (desktop)
- F/2-width (sidebar)
- Border logic (parent has border vs doesn't)

**Browser Tests:**
- Chrome, Firefox, Safari, Edge
- Desktop + mobile
- Touch events on mobile
- Wheel events (trackpad vs mouse)

## Rollout Plan

### Phase 1: Core Component (Week 1)
- [ ] Create Scrollbar.js file
- [ ] Implement BaseComponent extension
- [ ] Build orientation detection
- [ ] Build size detection (F/F2)
- [ ] Implement proportional thumb
- [ ] Add basic drag handling
- [ ] Add CSS classes to styles.css

### Phase 2: Advanced Features (Week 2)
- [ ] AnimationFoundation smooth scrolling
- [ ] Keyboard navigation
- [ ] Touch support
- [ ] Hide when inactive
- [ ] Border detection logic
- [ ] Resize observer
- [ ] Mutation observer

### Phase 3: Integration (Week 3)
- [ ] ComponentLibrary export
- [ ] PageContainer integration
- [ ] ToolBase opt-in flag
- [ ] Theme change handling
- [ ] ARIA attributes
- [ ] Documentation

### Phase 4: Testing & Refinement (Week 4)
- [ ] Unit tests
- [ ] Integration tests
- [ ] Visual regression tests
- [ ] Performance profiling
- [ ] Cross-browser testing
- [ ] Mobile testing

### Phase 5: Deployment (Week 5)
- [ ] Deploy to content-container
- [ ] Deploy to tool sidebars
- [ ] Monitor performance
- [ ] Collect user feedback
- [ ] Iterate on UX

## Success Criteria

**Functionality:**
- ✅ Auto-detects all parameters correctly
- ✅ Proportional thumb matches visible content ratio
- ✅ No double borders with parent elements
- ✅ Works vertically and horizontally
- ✅ Smooth momentum scrolling
- ✅ Touch drag on mobile
- ✅ Keyboard navigation

**Performance:**
- ✅ No janky scrolling (<16ms frame time)
- ✅ No memory leaks
- ✅ Minimal CPU when idle
- ✅ Handles 10+ simultaneous scrollbars

**Aesthetics:**
- ✅ Matches VGA design system
- ✅ Sharp edges (no rounded corners)
- ✅ Theme-aware colors
- ✅ Invisible integration (looks native)

**Architecture:**
- ✅ Extends BaseComponent correctly
- ✅ Uses AnimationFoundation (no raw RAF)
- ✅ F-system dimensions
- ✅ Proper destroy() cleanup
- ✅ ComponentLibrary exported

## Alternatives Considered

**Option A: CSS-only enhancement** → Rejected (can't meet proportional thumb requirement)
**Option B: Third-party library** → Rejected (doesn't match architecture, adds bloat)
**Option C: Hybrid CSS + JS measurement** → Rejected (browser controls thumb, can't override)
**Option D: Custom component (THIS OPTION)** → Selected (100% spec compliance, full control)

## Open Questions

1. **Should scrollbars be visible by default or fade in/out?**
   - Recommendation: Fade out after 1s inactivity, visible on scroll

2. **Should we hide native scrollbar completely?**
   - Recommendation: Yes, use `scrollbar-width: none` on target

3. **Should horizontal mode support bi-directional scrolling?**
   - Recommendation: Phase 2 feature, not MVP

4. **Should GUI slider mode be separate component?**
   - Recommendation: Same component, different mode (less code duplication)

5. **Should we support corner handle for 2D scrolling?**
   - Recommendation: Phase 3 feature if needed

## Risk Analysis

**High Risk:**
- Performance on large content (1000+ items) → Mitigate with throttling
- Touch event conflicts with native scroll → Test extensively on mobile
- Browser inconsistencies → Polyfill where needed

**Medium Risk:**
- Integration complexity with existing tools → Gradual opt-in rollout
- Accessibility compliance → Follow ARIA best practices from start
- Theme switching edge cases → Test all VGA theme combinations

**Low Risk:**
- Memory leaks → Standard cleanup pattern, automated tests
- F-system integration → Well-established pattern
- BaseComponent extension → Standard architecture

## Next Steps

**Awaiting Decision:**
1. Approve architecture ✓ (proceed to implementation)
2. Choose file location (new scrollbar/ dir or add to interactive.js)
3. Confirm Phase 1-5 timeline (5 weeks realistic?)
4. Identify first deployment target (content-container? tool sidebar?)

**Ready to Build:**
Once approved, start with Phase 1 core component implementation.
