# CategoryTabsBar Issues & Solutions

## Current Issues

### 1. ❌ Animation Rule Violation
**Problem:** Uses `setInterval()` for edge-scroll animation (lines 119, 131, 134)
**Rule Violation:** Must use AnimationFoundation, not raw setInterval

### 2. ⚠️ Hidden Scrollbar
**Problem:** Page tabs use `scrollbar-width: none` (line 43)
**Issue:** User can't tell if more pages exist (Page 6 hidden)

### 3. ⚠️ Edge-Scroll UX
**Problem:** Edge-hover scroll requires hovering near edges
**Issue:** Not discoverable, no visual indication of scrollability

## Solutions

### Option A: Add Visible Scrollbar (Recommended)

**Use our new Scrollbar component:**

```javascript
// In CategoryTabsBar.render(), after creating categoryRow:

if (this.categories.length > 4) {  // Only if tabs overflow
    // Wrap categoryRow in positioned container
    const wrapper = this.createElement('div');
    wrapper.style.cssText = `
        position: relative;
        width: 100%;
        height: ${F * 2}px;
    `;
    
    // Make categoryRow scrollable
    categoryRow.style.height = '100%';
    wrapper.appendChild(categoryRow);
    
    // Add horizontal scrollbar
    import('./Scrollbar.js').then(({ Scrollbar }) => {
        this.scrollbar = new Scrollbar({
            target: categoryRow,
            orientation: 'horizontal',
            size: 'half',  // F/2 (7px) for subtle appearance
            position: 'bottom'
        });
        this.addChild(this.scrollbar);
    });
    
    this.element.appendChild(wrapper);
} else {
    // No scrollbar needed
    this.element.appendChild(categoryRow);
}
```

**Benefits:**
- Visible indicator that more tabs exist
- Standard scroll interaction (wheel, drag)
- Uses our VGA-styled Scrollbar
- AnimationFoundation compliant

### Option B: Replace Edge-Scroll with AnimationFoundation

**Fix the existing edge-scroll to use proper animation:**

```javascript
_setupEdgeScroll(container) {
    const EDGE_ZONE = 40;
    const SCROLL_SPEED = 3;
    
    // Use AnimationLoop instead of setInterval
    import('../../../core/animation-foundation.js').then(({ AnimationLoop }) => {
        this.scrollAnimator = new AnimationLoop({
            onFrame: () => {
                if (this.scrollDirection === 'left' && container.scrollLeft > 0) {
                    container.scrollLeft -= SCROLL_SPEED;
                    if (container.scrollLeft <= 0) {
                        this.scrollAnimator.stop();
                    }
                } else if (this.scrollDirection === 'right') {
                    const maxScroll = container.scrollWidth - container.clientWidth;
                    if (container.scrollLeft < maxScroll) {
                        container.scrollLeft += SCROLL_SPEED;
                        if (container.scrollLeft >= maxScroll) {
                            this.scrollAnimator.stop();
                        }
                    }
                }
            }
        });
        
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            
            // Determine scroll direction
            if (x < EDGE_ZONE && container.scrollLeft > 0) {
                this.scrollDirection = 'left';
                if (!this.scrollAnimator.isRunning) {
                    this.scrollAnimator.start();
                }
            } else if (x > width - EDGE_ZONE) {
                const maxScroll = container.scrollWidth - container.clientWidth;
                if (container.scrollLeft < maxScroll) {
                    this.scrollDirection = 'right';
                    if (!this.scrollAnimator.isRunning) {
                        this.scrollAnimator.start();
                    }
                }
            } else {
                this.scrollDirection = null;
                if (this.scrollAnimator.isRunning) {
                    this.scrollAnimator.stop();
                }
            }
        });
        
        container.addEventListener('mouseleave', () => {
            this.scrollDirection = null;
            if (this.scrollAnimator && this.scrollAnimator.isRunning) {
                this.scrollAnimator.stop();
            }
        });
    });
}

destroy() {
    if (this.scrollAnimator) {
        this.scrollAnimator.destroy();
        this.scrollAnimator = null;
    }
    super.destroy();
}
```

### Option C: Both (Best UX)

**Combine visible scrollbar + AnimationFoundation edge-scroll:**

1. Add visible Scrollbar (horizontal, F/2 size)
2. Replace setInterval with AnimationLoop
3. Keep edge-scroll for convenience
4. User has multiple ways to navigate:
   - Scrollbar drag
   - Mouse wheel
   - Edge hover (enhanced)

## Recommendation: Option A (Visible Scrollbar)

**Why:**
1. Visual indicator (user knows Page 6 exists)
2. Standard UI pattern (discoverable)
3. Uses our new Scrollbar component
4. Simpler implementation
5. AnimationFoundation compliant

**Implementation:**
- Add Scrollbar to CategoryTabsBar
- Remove edge-scroll entirely (or keep as enhancement)
- User immediately sees overflow indicator

## Quick Fix (Immediate)

**To see Page 6 now without code changes:**

1. Mouse wheel over the page tabs
2. Or add this temporary CSS:

```css
.category-row {
    scrollbar-width: thin !important;
    -ms-overflow-style: auto !important;
}

.category-row::-webkit-scrollbar {
    display: block !important;
    height: 7px !important;
}
```

## Why Page 6 is Hidden

Page tabs are in a scrollable container with hidden scrollbar. If viewport is narrow or there are many pages, Page 6 scrolls out of view with no visual indication.

**Current pages:**
1. Noise, Sampling, Patterns
2. Edges, Filtering, Segmentation
3. Curves, Distance, Topology
4. Space-Filling, TSP, Graphs
5. Physics, Reaction-Diffusion
6. Colour and Perception ← **Hidden if overflow**

## Action Items

1. **Fix AnimationFoundation violation**: Replace setInterval with AnimationLoop
2. **Add visible scrollbar**: Use Scrollbar component for horizontal tabs
3. **Test**: Verify Page 6 visible and accessible
4. **Document**: Update CategoryTabsBar docs with scrollbar usage
