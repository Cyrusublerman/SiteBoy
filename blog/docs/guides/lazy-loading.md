# Lazy Loading System

On-demand asset loading for tools and libraries.

---

## Overview

SiteBoy uses `AssetLoader` to defer loading of tools and libraries until needed. This reduces initial page load by ~200KB+ and improves time-to-interactive.

**Location:** `assets/js/core/asset-loader.js`

---

## What Gets Lazy Loaded

| Asset Type | Trigger | Size Saved |
|------------|---------|------------|
| Tool scripts | User navigates to tool | ~200KB+ total |
| math.js | Tools that need it (lissajous, wave-interference) | ~50KB |
| JSZip | Export triggered | ~25KB |
| RecordRTC | Video/GIF export triggered | ~40KB |

**Always loaded at startup:**
- ToolBase (required for all tools)
- ComponentLibrary
- Section scripts
- MathJax, marked, Prism (core features)

---

## Using AssetLoader

### Loading a Tool

```javascript
// In section code (e.g., tools_section.js)
const ToolClass = await window.AssetLoader.loadTool('lissajous');
const tool = new ToolClass(container, deps);
tool.render();
```

### Loading Export Libraries

```javascript
// In tool code (e.g., export function)
const JSZip = await window.AssetLoader.ensureJSZip();
const zip = new JSZip();

// Or for video/GIF
const RecordRTC = await window.AssetLoader.ensureRecordRTC();
```

### Loading math.js

```javascript
// For tools needing advanced math
await window.AssetLoader.ensureMathJS();
// window.math is now available
```

---

## Tool Registry

Tools are registered in `AssetLoader.toolRegistry`:

```javascript
toolRegistry: {
    'lissajous': {
        script: 'assets/js/tools/lissajous-tool.js',
        className: 'LissajousTool',
        dependencies: ['mathjs']  // Auto-loaded first
    },
    'circles': {
        script: 'assets/js/tools/circles-tool.js',
        className: 'CirclesTool',
        dependencies: []
    },
    // ...
}
```

### Adding a New Tool

1. Create tool file in `assets/js/tools/`
2. Add entry to `AssetLoader.toolRegistry`
3. Specify dependencies (mathjs, google-fonts-loader, etc.)
4. Tool auto-loads when user navigates to it

---

## Dependency Management

### Shared Dependencies

Loaded once, cached for subsequent use:

| ID | Script | Check |
|----|--------|-------|
| `google-fonts-loader` | `assets/js/tools/google-fonts-loader.js` | `window.GoogleFontsLoader` |
| `mathjs` | CDN math.js | `window.math` |

### Export Libraries

Loaded only when export is triggered:

| ID | Script | Check |
|----|--------|-------|
| `jszip` | CDN JSZip | `window.JSZip` |
| `recordrtc` | CDN RecordRTC | `window.RecordRTC` |

---

## Implementation in Sections

### ToolsSection Pattern

```javascript
async renderTool(toolId) {
    // Show loading indicator
    this.showLoadingIndicator(toolId);
    
    try {
        if (window.AssetLoader.toolRegistry[toolId]) {
            // Lazy load via AssetLoader
            const ToolClass = await window.AssetLoader.loadTool(toolId);
            this.currentContainer.innerHTML = '';
            const tool = new ToolClass(this.currentContainer, deps);
            tool.render();
        } else {
            // Fallback for unregistered tools
            this.renderLegacyTool(toolId);
        }
    } catch (err) {
        this.showToolError(toolId, err.message);
    }
}
```

### ArtSection Pattern

Same pattern for generative animations:

```javascript
async renderGenerativeAnimation(animationId) {
    // Show loading state
    this.showLoadingIndicator(animationId);
    
    const ToolClass = await window.AssetLoader.loadTool(animationId);
    // ... render
}
```

---

## ToolBase Export Integration

ToolBase automatically uses lazy loading for exports:

```javascript
// In _exportFrameSequence
this.setStatus('Loading export library...');
const JSZip = await window.AssetLoader.ensureJSZip();

// In _exportVideo / _exportGif  
this.setStatus('Loading video export library...');
const RecordRTC = await window.AssetLoader.ensureRecordRTC();
```

User sees status message while library loads, then export proceeds.

---

## API Reference

### AssetLoader Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `loadTool(toolId)` | `Promise<Class>` | Load tool and dependencies |
| `ensureJSZip()` | `Promise<JSZip>` | Load JSZip if not present |
| `ensureRecordRTC()` | `Promise<RecordRTC>` | Load RecordRTC if not present |
| `ensureMathJS()` | `Promise<void>` | Load math.js if not present |
| `loadScript(src, opts)` | `Promise<void>` | Low-level script loading |
| `isToolLoaded(toolId)` | `boolean` | Check if tool already loaded |
| `getStatus()` | `Object` | Debug info: loaded scripts, pending |

### AssetLoader Properties

| Property | Type | Description |
|----------|------|-------------|
| `toolRegistry` | `Object` | Map of tool IDs to config |
| `sharedDependencies` | `Object` | Shared libs (mathjs, etc.) |
| `exportLibraries` | `Object` | Export libs (JSZip, RecordRTC) |
| `loadedScripts` | `Set` | URLs already loaded |

---

## Performance Impact

| Metric | Before | After |
|--------|--------|-------|
| Initial JS payload | ~340KB | ~250KB |
| Time to interactive | ~2s | ~1.2s |
| Tool load latency | 0ms | 200-500ms |
| Export lib load | At startup | On demand |

Trade-off: First tool load has ~200-500ms latency. Subsequent visits to same tool are instant (cached).

---

## Debugging

```javascript
// Check what's loaded
console.log(window.AssetLoader.getStatus());
// → { loadedScripts: [...], pendingLoads: [...], toolsLoaded: [...] }

// Check if specific tool loaded
window.AssetLoader.isToolLoaded('lissajous');  // → true/false
```

---

## Rules

1. **Never add tool scripts to index.html** — Use registry instead
2. **Never load export libs at startup** — Use `ensureJSZip/RecordRTC`
3. **Specify dependencies in registry** — AssetLoader loads them first
4. **Show loading indicator** — User should know something is happening
5. **Handle errors gracefully** — Catch and display load failures

