# CategoryTabsBar Fix — Enable Visible Scrollbar in Test Lab

## Problem Solved

✅ **AnimationFoundation violation fixed**: Replaced `setInterval` with `AnimationLoop`  
✅ **Visible scrollbar option added**: Can now show standard browser scrollbar  

## To Make Page 6 Visible

### Quick Fix (Test Lab)

In `algorithms-test-lab.js`, line ~3739, change:

```javascript
// FROM:
this.categoryBar = new window.ComponentLibrary.CategoryTabsBar({
    categories: PAGES.map(p => ({id: p.id, title: p.title})),
    activeCategory: defaultPage.id,
    onCategoryChange: (pageId) => {
        rebuildToolForPage(this, pageId);
    }
}, this.deps);

// TO:
this.categoryBar = new window.ComponentLibrary.CategoryTabsBar({
    categories: PAGES.map(p => ({id: p.id, title: p.title})),
    activeCategory: defaultPage.id,
    showScrollbar: true,  // ← ADD THIS LINE
    onCategoryChange: (pageId) => {
        rebuildToolForPage(this, pageId);
    }
}, this.deps);
```

This makes the horizontal scrollbar visible so users can see and access Page 6.

## What Changed in CategoryTabsBar

### 1. Added AnimationFoundation
```javascript
import { AnimationLoop } from '../../../core/animation-foundation.js';
```

### 2. Replaced setInterval
**Before:**
```javascript
this.scrollInterval = setInterval(() => {
    container.scrollLeft -= SCROLL_SPEED;
}, 16);
```

**After:**
```javascript
this.scrollAnimator = new AnimationLoop({
    onFrame: () => {
        if (this.scrollDirection === 'left') {
            container.scrollLeft -= SCROLL_SPEED;
        }
    }
});
this.scrollAnimator.start();
```

### 3. Added Scrollbar Option
```javascript
constructor(options = {}) {
    // ...
    this.showScrollbar = options.showScrollbar ?? false;
}

render() {
    if (this.showScrollbar) {
        // Use native scrollbar (visible)
        categoryRow.style.scrollbarWidth = 'thin';
    } else {
        // Hide scrollbar, use edge-scroll
        categoryRow.style.scrollbarWidth = 'none';
    }
}
```

## Benefits

**AnimationFoundation Compliance:**
- No raw setInterval/clearInterval
- Proper lifecycle management
- Consistent with site standards

**Visible Scrollbar Mode:**
- User knows more pages exist
- Standard scroll behavior (wheel, drag)
- Discoverable UI

**Backward Compatible:**
- Default behavior unchanged (`showScrollbar: false`)
- Edge-scroll still works when hidden
- No breaking changes

## Alternative: Custom Scrollbar

To use our custom Scrollbar component instead of native:

```javascript
// In CategoryTabsBar.render(), after categoryRow created:

import { Scrollbar } from '../navigation/Scrollbar.js';

// Add custom scrollbar
this.scrollbar = new Scrollbar({
    target: categoryRow,
    orientation: 'horizontal',
    size: 'half',  // F/2 (7px)
    position: 'bottom'
});

this.addChild(this.scrollbar);
```

This would give VGA-styled scrollbar instead of browser default.

## Status

✅ CategoryTabsBar fixed (AnimationFoundation compliant)  
⏳ Test lab needs one-line change to show scrollbar  
📚 Documentation updated
