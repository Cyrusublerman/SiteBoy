### Single-page architecture

SiteBoy is a single-page application. The `index.html` is one file. The router intercepts hash changes (`#section/slug`) and orchestrates the lifecycle: destroy the current section, instantiate the next, update the URL. No page reloads. No server-side routing.

The build chronology is a fixed constraint:

```
app → router → destroy → section → subheader → JSON → blocks → render → URL
```

This order is invariant. No step may occur before its predecessor.

### Router

The router lives at `assets/js/core/router.js`. It is the sole owner of `pushState`, `popstate`, and `location.hash`. No other file may perform routing operations.

Route registration:

```javascript
Router.register({
    pattern: /^#tools\/colour-quantizer$/,
    section: 'ColourQuantizer',
    title: 'Colour Quantizer'
});
```

On navigation:
1. The current section's `destroy()` is called.
2. All `componentInstances` in the current section are destroyed.
3. The new section is instantiated.
4. The section loads its JSON, renders its blocks, and signals completion.
5. The URL is updated.

### App bootstrap

App bootstrap lives at `assets/js/core/app.js`. It is the only file authorised to initialise the application. It:
1. Reads the initial hash from the URL.
2. Dispatches the first route.
3. Registers global keyboard shortcuts.
4. Initialises the GPU foundation (capability probe).
5. Sets `F` on the root element.

No other file initialises the application. No `DOMContentLoaded` listeners outside `app.js`.

### Mathematical foundation

All dimensional math goes through `MathematicalFoundation.calculateDimensions(kind|props)`. No component or section computes layout values directly. This ensures that changing `F` in one place recalculates all dimensions.

```javascript
const dims = MathematicalFoundation.calculateDimensions('dropdown');
// returns { height, width, padding, ... } in px, derived from F
```

### GPU foundation

GPU capability detection runs at bootstrap in `assets/js/core/gpu-foundation.js`. The result (`GPUFoundation.tier`) is available to all modules before any render. Modules read `GPUFoundation.tier` to decide whether to dispatch a compute shader or fall back to CPU. No module calls `navigator.gpu` or `getContext('webgl2')` directly.

### Destroy protocol

Every interactive element that allocates resources implements `.destroy()`:
- Remove DOM elements added to the document.
- Cancel pending async operations.
- Call `.destroy()` on child components.
- Call `.destroy()` on all animators.
- Remove event listeners.

Sections iterate `this.componentInstances` and call `.destroy()` on each. Animators created in tools call `.destroy()` in the tool's `onDestroy` callback. Resource leaks across route changes are a regression.
