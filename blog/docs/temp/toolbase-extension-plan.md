# ToolBase Extension Plan

## Current State

### ToolBase Native Features
| Feature | Config | Location |
|---------|--------|----------|
| Sidebar tabs | `sidebar: [['TAB', [blocks]]]` | Sidebar area |
| Block modes | `{ mode: 'selectable' \| 'selectableCollapsible' \| 'container' }` | Block options |
| Canvas | `canvas: { width, height, ... }` | Canvas area |

### ATL Features Beyond ToolBase
| Feature | Current Implementation | Problem |
|---------|----------------------|---------|
| Category tabs | `CategoryTabsBar` manually positioned above tool | Requires custom wrapper, breaks height chain |
| Canvas mode tabs | `CanvasModeTabs` manually injected into canvas area | Post-render DOM manipulation |
| Page rebuilding | `rebuildToolForPage()` destroys/recreates ToolBase | Heavy, loses state |

## Proposed Extensions

### 1. Top-Level Category Tabs
```javascript
const config = {
    categoryTabs: {
        categories: [{ id: 'page1', title: 'NOISE...' }, ...],
        activeCategory: 'page1',
        enableScrollbar: true,
        onCategoryChange: (id) => { /* rebuild sidebar */ }
    },
    // ...rest of config
};
```

**Implementation**: ToolBase creates CategoryTabsBar internally, positions absolutely at top, offsets main content by `F*2`.

### 2. Canvas Mode Tabs
```javascript
const config = {
    canvasModeTabs: {
        tabs: [
            { id: 'output', label: 'OUTPUT' },
            { id: 'about', label: 'ABOUT' }
        ],
        defaultTab: 'output',
        onTabChange: (id) => { /* switch view */ }
    },
    // ...rest
};
```

**Implementation**: ToolBase creates CanvasModeTabs in canvas area header, manages show/hide of canvas vs custom content.

### 3. Dynamic Sidebar Rebuilding
```javascript
// Add method to ToolBase
tool.rebuildSidebar(newSidebarConfig);
```

**Implementation**: Clears sidebar DOM, rebuilds with new config, preserves canvas and values where possible.

## Config Schema (Complete)

```javascript
{
    // EXISTING
    title: string,
    sidebar: TabConfig[],
    canvas: CanvasConfig,
    onInit: Function,
    onUpdate: Function,
    onDraw: Function,
    
    // NEW: Top category tabs
    categoryTabs?: {
        categories: { id: string, title: string }[],
        activeCategory?: string,
        enableScrollbar?: boolean,
        onCategoryChange?: (id: string) => void
    },
    
    // NEW: Canvas area tabs
    canvasModeTabs?: {
        tabs: { id: string, label: string }[],
        defaultTab?: string,
        onTabChange?: (id: string, tool: ToolBase) => void
    }
}
```

## Block Modes (Already Implemented)

| Mode | Behaviour |
|------|-----------|
| `'container'` (default) | Collapsible via toggle icon |
| `'selectable'` | Click header to select, emits `onUpdate(key, id)` |
| `'selectableCollapsible'` | Click header to select, click icon to collapse |

## Implementation Order

1. **P1**: `canvasModeTabs` - most commonly needed, simpler
2. **P2**: `categoryTabs` - more complex, requires layout offset
3. **P3**: `rebuildSidebar()` method - convenience for dynamic tools

## File Changes

| File | Change |
|------|--------|
| `tool-base.js` | Add categoryTabs/canvasModeTabs handling in constructor + render |
| `tool-base.js` | Add `rebuildSidebar()` method |
| `algorithms-test-lab.js` | Migrate to new config format, remove manual DOM |

## Success Criteria

- [ ] ATL uses only ToolBase config (no CategoryTabsBar/CanvasModeTabs instantiation)
- [ ] No custom wrappers needed between container and ToolBase
- [ ] All tools mount ToolBase directly to container
- [ ] Block modes documented in config schema


