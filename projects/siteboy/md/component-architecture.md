### BaseComponent

All UI classes extend `BaseComponent`. It is the single point of authority for DOM operations. Only `BaseComponent` internals may call `document.*`, `window.*`, `.innerHTML`, `.createElement`, or `.appendChild`. Subclasses get safe, managed hooks.

Every instantiated component is tracked in the owning section's `componentInstances` array:

```javascript
const dd = new Dropdown(options);
this.componentInstances.push(dd);
```

Every component implements `.destroy()`. Sections call `.destroy()` on all instances when navigating away. No memory leaks, no orphaned event listeners.

### ComponentLibrary

All UI needs are served by `ComponentLibrary`. Direct DOM construction for any element that has a `ComponentLibrary` equivalent is a violation. If the library component lacks required behaviour, the library is extended — a one-off parallel implementation is not permitted.

Canonical component map:

| UI need | ComponentLibrary key |
|---|---|
| Numeric input (slider + field) | `'numeric-input'` |
| Dropdown (select from list) | `'dropdown'` |
| Button | `'button'` |
| Toggle group | `'toggle-group'` |
| File picker | `'file-input'` |
| Collapsible section | `'collapsible-section'` |
| Markdown content | `'markdown-body'` |
| Canvas output | `'canvas'` |
| Tab bar | ToolBase `sidebar` config |

### ToolBase

All tool pages use `ToolBase`. The tool declares its sidebar structure as a JSON config; `ToolBase` renders the tabs, blocks, and components. Tool scripts do not construct DOM; they pass a `TOOL_CONFIG` object and provide callbacks (`onDraw`, `onInit`, `onDestroy`).

```javascript
const TOOL_CONFIG = {
    title: 'COLOUR QUANTIZER',
    sidebar: [...],
    canvas: { width: 800, height: 800 },
    onDraw: function(ctx, canvas, values) { ... }
};
```

`ToolBase` wires the animation loop, handles resize, manages undo state, and calls `onDestroy` during navigation cleanup.

### File ownership

The file ownership map is enforced by the workspace rules. Violations are blocked in code review.

| Concern | Owner file |
|---|---|
| Layout math | `assets/js/core/mathematical-foundation.js` |
| Base OO system | `assets/js/core/base-component.js` |
| Animation logic | `assets/js/core/animation-foundation.js` |
| GPU compute | `assets/js/core/gpu-foundation.js` |
| Routing/nav | `assets/js/core/router.js` |
| App bootstrap | `assets/js/core/app.js` |
| UI components | `assets/js/shared/component-library.js` |
| All styling | `assets/css/styles.css` |

No other file may implement the same concern. If a change would cross ownership, the owner file is modified — never the consumer.

### Section pattern

Sections are JSON-driven. A section loads a JSON content file, iterates over its `blocks` array, and renders each block via `ComponentLibrary` or `SpecializedComponents`. No layout logic lives in the section file; no content is hardcoded.

```javascript
// Build chronology (must hold)
app → router → destroy → section → subheader → JSON → blocks → render → URL
```

### AnimationFoundation

All animations use `AnimationFoundation` classes. No `requestAnimationFrame`, `setInterval`, or `setTimeout` for animations. The canonical animator:

```javascript
this.animator = new AnimationFoundation.AnimationLoop({
    onFrame: () => this.draw()
});
```

Every animator is destroyed in the component's `destroy()` method.
