# Scrollbar

Custom VGA-styled scrollbar component with intelligent auto-detection and dual-mode operation (scroll navigation + GUI slider).

## Classification

**Category:** Navigation  
**Type:** Interactive Component  
**Extends:** BaseComponent

## Overview

`Scrollbar` replaces native browser scrollbars with F-based, theme-aware, proportionally-sized alternatives that integrate seamlessly with SiteBoy's VGA design system. Features auto-detection of orientation, sizing, and border requirements, plus smooth momentum scrolling via AnimationFoundation.

## Features

- ✅ **Auto-detection**: Orientation, size (F vs F/2), borders
- ✅ **Proportional thumb**: 1/3 visible = 1/3 thumb height (true proportion)
- ✅ **Dual-mode**: Scroll navigation OR GUI value slider
- ✅ **Smooth scrolling**: Momentum via AnimationFoundation (no RAF)
- ✅ **Full input support**: Mouse drag, touch, keyboard, wheel
- ✅ **Theme-aware**: VGA colors via CSS variables
- ✅ **Adaptive sizing**: F (14px) or F/2 (7px) based on context
- ✅ **Smart borders**: Avoids double lines with parent elements
- ✅ **Lifecycle management**: Proper cleanup via destroy()

## Import

```javascript
import { Scrollbar } from './components/navigation/Scrollbar.js';
// OR via ComponentLibrary
const scrollbar = ComponentLibrary.create('scrollbar', options);
```

## Basic Usage

### Auto-Mode (Zero Configuration)

Component auto-detects all parameters:

```javascript
const scrollableElement = document.querySelector('.content-container');
const scrollbar = new Scrollbar({ target: scrollableElement });
```

Auto-detection determines:
- Orientation (vertical if `scrollHeight > clientHeight`)
- Size (F=14px default, F/2=7px if space constrained)
- Position (right edge for vertical, bottom for horizontal)
- Borders (suppress if parent has border to avoid doubles)

### Scroll Mode (Manual Control)

```javascript
const scrollbar = new Scrollbar({
    target: scrollableElement,
    orientation: 'horizontal',  // 'vertical' | 'horizontal' | 'auto'
    size: 'half',               // 'full' (F) | 'half' (F/2) | 'auto'
    position: 'left',           // 'right'|'left' (vert) | 'top'|'bottom' (horiz)
    borders: {
        track: true,            // Show track border
        thumb: false            // No thumb border
    },
    smoothScrolling: true,      // AnimationFoundation momentum
    smoothness: 0.15,           // Easing factor (0-1)
    hideWhenInactive: true,     // Fade out when not scrolling
    fadeDelay: 1000,            // ms before fade
    keyboard: true,             // Arrow keys, PgUp/PgDn, Home/End
    touch: true                 // Touch drag support
});
```

### GUI Slider Mode

Use same component as horizontal value slider:

```javascript
const slider = new Scrollbar({
    orientation: 'horizontal',
    range: { min: 0, max: 100, value: 50 },
    onChange: (value) => {
        console.log('Value changed:', value);
        updateParameter(value);
    },
    labels: {
        min: '0%',
        max: '100%',
        showCurrent: true
    }
});
```

## Options Reference

### Target & Mode

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `target` | HTMLElement | `null` | Element to scroll (null for GUI slider mode) |
| `range` | Object | `null` | `{min, max, value}` for slider mode |
| `onChange` | Function | `null` | Callback for slider value changes |

### Appearance

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `orientation` | String | `'auto'` | `'vertical'` \| `'horizontal'` \| `'auto'` |
| `size` | String | `'auto'` | `'full'` (F) \| `'half'` (F/2) \| `'auto'` |
| `position` | String | `null` | `'right'`\|`'left'` (vert) \| `'top'`\|`'bottom'` (horiz) |
| `borders` | Object | `{}` | `{track: bool, thumb: bool}` |

### Behavior

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `smoothScrolling` | Boolean | `true` | Use AnimationFoundation momentum |
| `smoothness` | Number | `0.15` | Easing factor (0-1, higher = smoother) |
| `hideWhenInactive` | Boolean | `false` | Fade out when not scrolling |
| `fadeDelay` | Number | `1000` | ms before fade starts |
| `keyboard` | Boolean | `true` | Enable keyboard navigation |
| `touch` | Boolean | `true` | Enable touch drag |

## Methods

### Instance Methods

```javascript
// Manual updates
scrollbar._updateThumb();        // Recalculate thumb position/size
scrollbar._showScrollbar();      // Show (fade in)
scrollbar._scheduleHide();       // Hide after delay

// Slider mode
scrollbar._setSliderValue(50);  // Set slider value programmatically

// Lifecycle
scrollbar.destroy();             // Cleanup and remove
```

## Integration Examples

### Content Container

```javascript
// Add to main content area
const container = document.querySelector('.content-container');
const scrollbar = new Scrollbar({ 
    target: container,
    hideWhenInactive: true  // Fade out when not scrolling
});
```

### Tool Sidebar

```javascript
// Narrow sidebar - use F/2 width
const sidebar = document.querySelector('.tool-sidebar');
const scrollbar = new Scrollbar({
    target: sidebar,
    size: 'half'  // 7px width instead of 14px
});
```

### Horizontal Image Gallery

```javascript
const gallery = document.querySelector('.image-gallery');
const scrollbar = new Scrollbar({
    target: gallery,
    orientation: 'horizontal',
    position: 'bottom'
});
```

### ToolBase Integration

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

### Tool Parameter Slider

```javascript
// Brightness control
const brightnessControl = new Scrollbar({
    orientation: 'horizontal',
    range: { min: -100, max: 100, value: 0 },
    onChange: (value) => {
        image.adjustBrightness(value);
    },
    labels: {
        min: '-100',
        max: '+100',
        showCurrent: true
    }
});
```

## Auto-Detection Behavior

### Orientation Detection

```
1. If orientation explicitly set → use it
2. If scrollHeight > clientHeight AND scrollWidth > clientWidth → choose dominant
3. If only one direction overflows → use that
4. Default: vertical
```

### Size Detection (F vs F/2)

```
F/2 (7px) used when:
- Parent width < 400px (small container)
- Nested scrollbar detected (inner scrollable element)
- Tool sidebar context (.tool-sidebar, .animation-sidebar)

Otherwise: F (14px)
```

### Border Detection

```
1. If borders.track explicitly set → use it
2. Check parent element's border on scrollbar side
3. If parent has border → don't add track border (avoid double line)
4. Otherwise → add track border
```

## Keyboard Controls

When `keyboard: true`:

| Key | Action |
|-----|--------|
| Arrow Up/Down | Scroll by 2F (28px) |
| Arrow Left/Right | Scroll by 2F (horizontal) |
| Page Up | Scroll up 90% of viewport |
| Page Down | Scroll down 90% of viewport |
| Home | Jump to start |
| End | Jump to end |

## CSS Classes

Component generates:

```css
.custom-scrollbar              /* Container */
.scrollbar-track               /* Outer frame */
.scrollbar-track.with-border   /* Border variant */
.scrollbar-thumb               /* Draggable indicator */
.custom-scrollbar.active       /* Visible state */
.custom-scrollbar.inactive     /* Hidden state (fadeout) */
```

Styling in `assets/css/styles.css`:

```css
.scrollbar-track {
    background: var(--c-bg);
}

.scrollbar-thumb {
    background: var(--c-text);
    cursor: grab;
}

.scrollbar-thumb:hover {
    background: var(--c-accent);
}

.scrollbar-thumb:active {
    cursor: grabbing;
}
```

## Proportional Thumb Math

True 1:1 proportion:

```javascript
// Vertical
const visibleRatio = viewportHeight / contentHeight;
const thumbHeight = trackHeight * visibleRatio;
// Minimum: F (14px) for usability

// Position
const scrollRatio = scrollTop / (scrollHeight - clientHeight);
const thumbY = scrollRatio * (trackHeight - thumbHeight);
```

If 1/3 of content visible → thumb is exactly 1/3 of track height.

## Theme Integration

Scrollbar respects CSS variables:

```css
--c-bg      → Track background
--c-text    → Thumb fill
--c-border  → Track border (if enabled)
--c-accent  → Thumb hover
```

Automatically updates on theme change (light/dark mode).

## Performance

**Optimizations:**
- RAF-based rendering (via AnimationFoundation)
- Throttled scroll updates
- Lazy initialization (only creates if overflow exists)
- ResizeObserver + MutationObserver for efficient recalculation
- CSS transforms for thumb position (GPU-accelerated)

**Cleanup:**
- All event listeners removed in destroy()
- Observers disconnected
- Animators destroyed
- Native scrollbar restored on target

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile: Touch drag support (scrollbar hidden <1024px by default)

## File Locations

**Component:** `assets/js/shared/components/navigation/Scrollbar.js`  
**Index:** `assets/js/shared/components/navigation/index.js`  
**CSS:** `assets/css/styles.css` (lines 2026-2140)  
**Export:** `assets/js/shared/component-library.js`

## Dependencies

- `BaseComponent` (foundation)
- `AnimationLoop` (animation-foundation)
- CSS variables (`--c-bg`, `--c-text`, `--c-border`, `--c-accent`)
- F-system (`getF()` method)

## Accessibility

**ARIA (Future Enhancement):**
```html
<div role="scrollbar"
     aria-controls="content-id"
     aria-valuenow="33"
     aria-valuemin="0"
     aria-valuemax="100"
     aria-orientation="vertical">
```

**Current Support:**
- Keyboard navigation (arrows, page, home/end)
- Focus management (target focusable via tabindex)
- Touch support (mobile-friendly)

## Common Patterns

### Pattern 1: Replace Native Scrollbar

```javascript
const element = document.querySelector('.scrollable');
const scrollbar = new Scrollbar({ target: element });
// Native scrollbar hidden automatically
```

### Pattern 2: Temporary Visibility

```javascript
const scrollbar = new Scrollbar({
    target: element,
    hideWhenInactive: true,
    fadeDelay: 2000  // Hide after 2s
});
```

### Pattern 3: Constrained Width

```javascript
const scrollbar = new Scrollbar({
    target: sidebar,
    size: 'half'  // Use F/2 (7px) for narrow contexts
});
```

### Pattern 4: Value Range Control

```javascript
const slider = new Scrollbar({
    orientation: 'horizontal',
    range: { min: 0, max: 255, value: 128 },
    onChange: (v) => setOpacity(v / 255)
});
```

## Troubleshooting

### Scrollbar Not Appearing

```javascript
// Check if overflow exists
console.log('Overflow?', element.scrollHeight > element.clientHeight);

// Check if scrollbar created
console.log('Scrollbar element:', scrollbar.element);

// Force visibility
scrollbar.element.style.display = 'block';
```

### Thumb Size Wrong

```javascript
// Manually trigger recalculation
scrollbar._updateThumb();

// Check calculated values
const { size, max } = scrollbar._calculateThumbSize();
console.log('Thumb:', size, 'Max:', max);
```

### Smooth Scrolling Laggy

```javascript
// Reduce smoothness (faster response)
const scrollbar = new Scrollbar({
    target: element,
    smoothness: 0.05  // Lower = faster (0-1)
});

// Or disable smooth scrolling
const scrollbar = new Scrollbar({
    target: element,
    smoothScrolling: false
});
```

## Related Components

- **Dropdown**: Menu navigation with keyboard support
- **Select**: Form input selection
- **Slider** (via Scrollbar): Use Scrollbar in slider mode for range inputs

## Changelog

**v1.0.0** (2026-01-20)
- Initial release
- Auto-detection system (orientation, size, borders)
- Dual-mode (scroll + slider)
- AnimationFoundation smooth scrolling
- Full keyboard/touch support
- VGA theme integration
- Proportional thumb sizing

## See Also

- [Component Library Index](../index.md)
- [BaseComponent](../../foundation.md)
- [AnimationFoundation](../../../../core/animation-foundation.md)
- [VGA Design System](../../../site/ui-interface-overview.md)
