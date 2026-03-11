# Scrollbar Component — Quick Reference

## Import

```javascript
import { Scrollbar } from './shared/components/navigation/Scrollbar.js';
// OR
const scrollbar = ComponentLibrary.create('scrollbar', options);
```

## Instant Usage

```javascript
// Zero-config (auto-detects everything)
const scrollbar = new Scrollbar({ target: scrollableElement });
```

## Common Patterns

### Content Container
```javascript
const scrollbar = new Scrollbar({ 
    target: document.querySelector('.content-container')
});
```

### Tool Sidebar (Half-width)
```javascript
const scrollbar = new Scrollbar({
    target: document.querySelector('.tool-sidebar'),
    size: 'half'  // 7px instead of 14px
});
```

### Horizontal Gallery
```javascript
const scrollbar = new Scrollbar({
    target: document.querySelector('.image-gallery'),
    orientation: 'horizontal'
});
```

### Fade-Out When Inactive
```javascript
const scrollbar = new Scrollbar({
    target: element,
    hideWhenInactive: true,
    fadeDelay: 1000  // ms
});
```

### GUI Value Slider
```javascript
const slider = new Scrollbar({
    orientation: 'horizontal',
    range: { min: 0, max: 100, value: 50 },
    onChange: (value) => updateParameter(value)
});
```

### ToolBase Integration
```javascript
class MyTool extends ToolBase {
    constructor(container, deps) {
        super(container, deps);
        this.scrollbar = new Scrollbar({ target: this.viewport });
        this.componentInstances.push(this.scrollbar);
    }
}
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `target` | HTMLElement | `null` | Element to scroll |
| `orientation` | String | `'auto'` | `'vertical'` \| `'horizontal'` \| `'auto'` |
| `size` | String | `'auto'` | `'full'` (14px) \| `'half'` (7px) \| `'auto'` |
| `position` | String | `null` | `'right'`\|`'left'` \| `'top'`\|`'bottom'` |
| `smoothScrolling` | Boolean | `true` | Momentum scrolling |
| `hideWhenInactive` | Boolean | `false` | Fade out after delay |
| `keyboard` | Boolean | `true` | Arrow keys, PgUp/PgDn, Home/End |
| `touch` | Boolean | `true` | Touch drag support |
| `range` | Object | `null` | `{min, max, value}` for slider mode |
| `onChange` | Function | `null` | Slider value change callback |

## Auto-Detection

- **Orientation**: Vertical if `scrollHeight > clientHeight`
- **Size**: F/2 (7px) if parent < 400px or nested or sidebar
- **Borders**: No track border if parent has border (avoid doubles)

## Keyboard Controls

- **Arrow Keys**: Scroll by 2F (28px)
- **Page Up/Down**: Scroll by 90% of viewport
- **Home/End**: Jump to start/end

## Cleanup

```javascript
scrollbar.destroy();  // Removes scrollbar, restores native, cleans up
```

## Files

- **Component**: `assets/js/shared/components/navigation/Scrollbar.js`
- **CSS**: `assets/css/styles.css` (lines 2026-2140)
- **Docs**: `blog/docs/components/navigation/Scrollbar.md`

## Status

🟢 Production-ready, fully integrated
