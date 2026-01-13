# Asset Loading Architecture

Runtime loading system for SiteBoy tools and dependencies.

---

## System Overview

```
index.html
    │
    ├── Core (always loaded)
    │   ├── config.js (MF, VGA palette)
    │   ├── base-component.js
    │   ├── component-library.js
    │   ├── animation-foundation.js
    │   ├── tool-base.js
    │   ├── asset-loader.js ← Controls lazy loading
    │   └── app.js
    │
    └── On-Demand (via AssetLoader)
        ├── Tool Scripts (~200KB)
        ├── math.js (~50KB)
        ├── JSZip (~25KB)
        └── RecordRTC (~40KB)
```

---

## File Ownership

| File | Concern | Rules |
|------|---------|-------|
| `asset-loader.js` | Dynamic script loading | SSOT for all lazy loading |
| `tool-base.js` | Export library loading | Uses AssetLoader.ensure* |
| `tools_section.js` | Tool instantiation | Uses AssetLoader.loadTool |
| `art_section.js` | Animation instantiation | Uses AssetLoader.loadTool |

**Prohibition:** No other file may implement script loading or `<script>` injection.

---

## AssetLoader Internal Structure

```javascript
window.AssetLoader = {
    // Registry of all lazily-loaded tools
    toolRegistry: {
        'lissajous': {
            script: 'assets/js/tools/lissajous-tool.js',
            className: 'LissajousTool',
            dependencies: ['mathjs']
        },
        // ...
    },
    
    // Shared dependencies (loaded once, reused)
    sharedDependencies: {
        'mathjs': {
            url: 'https://cdnjs.cloudflare.com/ajax/libs/mathjs/12.4.0/math.min.js',
            global: 'math',
            loaded: false
        },
        'google-fonts-loader': {
            url: 'assets/js/tools/google-fonts-loader.js',
            global: 'GoogleFontsLoader',
            loaded: false
        }
    },
    
    // Export libraries (loaded on export only)
    exportLibraries: {
        'jszip': {
            url: 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
            global: 'JSZip'
        },
        'recordrtc': {
            url: 'https://cdn.webrtc-experiment.com/RecordRTC.js',
            global: 'RecordRTC'
        }
    },
    
    // Tracking state
    loadedScripts: new Set(),
    pendingLoads: new Map()
};
```

---

## Load Sequences

### Tool Load (User Navigation)

```
User clicks "Tools > Lissajous"
         │
         ▼
tools_section.renderTool('lissajous')
         │
         ▼
AssetLoader.loadTool('lissajous')
         │
         ├── Check toolRegistry['lissajous'].dependencies
         │   └── ['mathjs'] → AssetLoader.ensureMathJS()
         │
         ├── Load script: assets/js/tools/lissajous-tool.js
         │
         └── Return window['LissajousTool']
         │
         ▼
new LissajousTool(container, deps).render()
```

### Export Library Load (Export Triggered)

```
User clicks "Export Animation"
         │
         ▼
ToolBase._startAnimationExport()
         │
         ├── this.setStatus('Loading export library...')
         │
         ├── format === 'frames'
         │   └── await AssetLoader.ensureJSZip()
         │
         └── format === 'gif' || 'video'
             └── await AssetLoader.ensureRecordRTC()
         │
         ▼
Proceed with export
```

---

## Script Loading Mechanics

### Basic Load

```javascript
async loadScript(src, opts = {}) {
    // Prevent duplicate loads
    if (this.loadedScripts.has(src)) return;
    
    // Coalesce concurrent requests
    if (this.pendingLoads.has(src)) {
        return this.pendingLoads.get(src);
    }
    
    const promise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            this.loadedScripts.add(src);
            this.pendingLoads.delete(src);
            resolve();
        };
        script.onerror = () => {
            this.pendingLoads.delete(src);
            reject(new Error(`Failed to load: ${src}`));
        };
        document.head.appendChild(script);
    });
    
    this.pendingLoads.set(src, promise);
    return promise;
}
```

### Tool Load with Dependencies

```javascript
async loadTool(toolId) {
    const config = this.toolRegistry[toolId];
    if (!config) throw new Error(`Unknown tool: ${toolId}`);
    
    // Load dependencies first
    for (const dep of config.dependencies || []) {
        await this.loadDependency(dep);
    }
    
    // Load tool script
    await this.loadScript(config.script);
    
    // Return class reference
    const ToolClass = window[config.className];
    if (!ToolClass) {
        throw new Error(`${config.className} not found after loading`);
    }
    
    return ToolClass;
}
```

---

## index.html Load Order

```html
<!-- CORE: Always loaded -->
<script src="assets/js/core/config.js"></script>
<script src="assets/js/core/base-component.js"></script>
<script src="assets/js/core/animation-foundation.js"></script>
<script src="assets/js/shared/component-library.js"></script>
<script src="assets/js/tools/tool-base.js"></script>
<script src="assets/js/core/asset-loader.js"></script>

<!-- SECTIONS: Always loaded (small) -->
<script src="assets/js/sections/home_section.js"></script>
<script src="assets/js/sections/tools_section.js"></script>
<script src="assets/js/sections/art_section.js"></script>
<script src="assets/js/sections/blog_section.js"></script>

<!-- THIRD-PARTY: Required at startup -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/..."></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/marked/..."></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/..."></script>

<!-- APP: Bootstrap -->
<script src="assets/js/core/app.js"></script>

<!-- TOOLS: NOT loaded here — AssetLoader handles them -->
```

---

## Tool Registration

### Adding a New Tool

1. Create tool class extending ToolBase:

```javascript
// assets/js/tools/my-tool.js
class MyTool extends ToolBase {
    constructor(container, deps) {
        super(container, deps, MY_TOOL_CONFIG);
    }
    // ...
}
window.MyTool = MyTool;
```

2. Register in AssetLoader:

```javascript
// In asset-loader.js toolRegistry
'my-tool': {
    script: 'assets/js/tools/my-tool.js',
    className: 'MyTool',
    dependencies: []  // or ['mathjs'] if needed
}
```

3. Add navigation entry (tools.json or router).

**Do not add `<script>` tag to index.html.**

---

## Error Handling

### Load Failures

```javascript
// In section code
try {
    const ToolClass = await AssetLoader.loadTool(toolId);
    const tool = new ToolClass(container, deps);
    tool.render();
} catch (err) {
    container.innerHTML = `
        <div class="tool-error">
            <h2>Failed to load ${toolId}</h2>
            <p>${err.message}</p>
        </div>
    `;
    console.error('Tool load failed:', err);
}
```

### Network Failures

AssetLoader rejects on network error. Sections must catch and display fallback UI.

### Missing Class

If script loads but class not found → likely export issue in tool file. Check `window.ToolClassName = ToolClassName;` at end of file.

---

## Performance Considerations

| Decision | Rationale |
|----------|-----------|
| No bundling | Tools independent; user loads only what they use |
| CDN for libs | Leverage browser cache across sites |
| Promise coalescing | Prevent duplicate loads on rapid navigation |
| No preloading | Prioritize initial load; tools load fast enough |

### Future Options

- **Prefetch hints:** Add `<link rel="prefetch">` for likely-visited tools
- **Service worker:** Cache tool scripts after first load
- **Bundle hot tools:** If analytics show 80%+ users visit same 3 tools

---

## Debug Interface

```javascript
// Console inspection
AssetLoader.getStatus()
// → {
//     loadedScripts: ['assets/js/tools/lissajous-tool.js', ...],
//     pendingLoads: [],
//     toolsLoaded: ['lissajous', 'circles']
// }

AssetLoader.isToolLoaded('lissajous')  // → true
AssetLoader.isDependencyLoaded('mathjs')  // → true
```

