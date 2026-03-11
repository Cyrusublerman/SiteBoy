# p5.js Generator Page Architecture Analysis

**Status:** IMPLEMENTED (Phase 1-2 complete)

Analysis of generator page structure and p5.js integration requirements.

---

## 1. Current Generator Architecture

### Entry Points
```
#tools/generators → ToolsSection → GenerativeToolHost
                                    ↓
                               ScriptRegistry.load(scriptId)
                                    ↓
                               ToolBase (sidebar + canvas)
                                    ↓
                               SCRIPT_CONFIG.draw()
```

### Key Components
| Component | Location | Role |
|-----------|----------|------|
| `GenerativeToolHost` | `tools/generators/core/generative-tool-host.js` | Orchestrator for all generators |
| `ScriptRegistry` | `tools/generators/core/script-registry.js` | Lazy-load script configs |
| `ToolBase` | `tools/core/tool-base.js` | Declarative sidebar + canvas builder |
| `GeneratorToolbar` | `shared/components/tool/GeneratorToolbar.js` | Script dropdown, display mode, export |
| `script-types.js` | `tools/generators/core/script-types.js` | Config validation + typedefs |

### Current Script Pattern (Native Canvas)
```javascript
// scripts/category/name.gen.js
export const SCRIPT_CONFIG = {
    id: 'name',
    title: 'Display Name',
    category: 'parametric|wave|pattern|other',
    canvas: { width: 800, height: 800, context: '2d' },  // or 'webgl'
    parameters: [{ group: 'Name', params: [...] }],
    presets: [...],
    animation: { type: 'parametric', loopFrames: 360, ... },
    draw(ctx, canvas, params, frame) { ... }
};
```

---

## 2. Current p5.js Integration Paths

### Path A: Standalone Tool (IframeSandbox)
Used by: `defecated-tool.js`, `p5-to-video.js`

- p5 code as template string → injected into `<iframe>`
- Security isolation for untrusted/user code
- Complex setup, CCapture.js for recording
- Not unified with generator system

### Path B: Direct p5 Components
Components: `P5Canvas`, `P5EmbeddedSketch`, `P5ControlledSketch` (in `p5-integration.js`)

- Wrapper components for p5 instance mode
- SiteBoy helpers (F-system, VGA colours)
- Lifecycle management
- Not wired into generator toolbar

### Path C: ScriptConfig `context: 'p5'`
Defined in `script-types.js` as valid context:
```javascript
const validContexts = ['2d', 'webgl', 'p5'];
```
But: **GenerativeToolHost has no p5 context handler** - only sets up Canvas2D/WebGL.

---

## 3. Gap Analysis

### Missing Pieces for p5 Generators

| Gap | Current State | Required |
|-----|---------------|----------|
| p5 context handling | Not implemented | Host must init p5 when `context: 'p5'` |
| p5 script interface | No convention | Define p5 sketch function signature |
| p5 library loading | Per-tool via `P5Canvas.ensureP5Loaded()` | Centralised in Host |
| Animation integration | Native RAF via AnimationFoundation | p5's own `draw()` loop vs external control |
| Export compatibility | Canvas `toBlob()` | p5 canvas access pattern |
| Resize handling | ToolBase → canvas element | p5's `resizeCanvas()` |

### Architectural Decisions Required

**Q1: Execution model?**
- A) Use p5 instance mode, inject params, external animation control
- B) Let p5's `draw()` loop run, sync params via global state
- C) IframeSandbox for all p5 (matches defecated-tool pattern)

**Q2: Script config structure?**
- A) Same SCRIPT_CONFIG, `setup(p)` and `draw(p, params)` callbacks
- B) Separate P5_SCRIPT_CONFIG with different signature
- C) Embed p5 code as string (IframeSandbox approach)

**Q3: Animation control ownership?**
- A) AnimationFoundation controls frame rate, calls p5 redraw
- B) p5 controls animation, reports frame count to Host
- C) Hybrid: p5 for draw, AnimationFoundation for export capture

---

## 4. Proposed Architecture: p5 in Generator System

### 4.1 Script Config Extension
```javascript
export const SCRIPT_CONFIG = {
    id: 'p5-example',
    title: 'P5 Example',
    category: 'pattern',
    canvas: {
        width: 800,
        height: 800,
        context: 'p5'  // Signals p5 mode
    },
    parameters: [...],
    
    // p5-specific functions (instance mode)
    p5Setup(p, params) {
        // Called in p.setup()
        p.colorMode(p.HSB, 360, 100, 100);
    },
    p5Draw(p, params, frame) {
        // Called per frame
        p.background(0);
        // ...
    }
};
```

### 4.2 GenerativeToolHost Modification

```javascript
// In _buildToolConfig()
if (this.scriptConfig.canvas.context === 'p5') {
    // Load p5.js
    await P5Canvas.ensureP5Loaded();
    
    // Create p5 instance
    this.p5Instance = new p5((p) => {
        p.setup = () => {
            const canvas = p.createCanvas(config.canvas.width, config.canvas.height);
            canvas.parent(this.toolContentEl);
            this.scriptConfig.p5Setup?.(p, this.params);
        };
        p.draw = () => {
            this.scriptConfig.p5Draw(p, this.params, this.frame);
        };
    });
}
```

### 4.3 Animation Control Strategy
- AnimationFoundation controls `isPlaying`, `frame` counter
- On frame tick: call `this.p5Instance.redraw()` (requires `noLoop()` in setup)
- Export captures via `this.p5Instance.canvas.toBlob()`

### 4.4 Param Sync
- Params object passed to p5Draw directly
- No global state pollution
- Changes trigger `redraw()` if paused

---

## 5. Routing Map Updates Required

### New routing path (11. p5.js Generator)
```
11) p5.js Generator / Animation
- Use prompt: `guides/idea-to-implementation-prompt-3-ENFORCED.md`
- Phases: P0 → P6 (same as tools)
- Additional checks:
  - Canvas context must be 'p5'
  - Must use p5Setup/p5Draw signatures (not setup/draw)
  - No global p5 mode (use instance mode only)
  - VGA colours via siteboy.colors helper
  - Sizing via siteboy.F helpers
- p5 standards: `guides/standards/p5-generator-standards.md` (NEW)
```

### Updates to section 8
Add:
```
- `guides/standards/p5-generator-standards.md` (p5-specific rules)
```

### Checklist additions
New file: `guides/checklists/p5-generator.md`
- [ ] context: 'p5' in canvas config
- [ ] p5Setup and p5Draw functions defined
- [ ] Uses instance mode (no global setup/draw)
- [ ] Colours via VGA palette
- [ ] Dimensions via F-system where applicable
- [ ] noLoop() called if external animation control
- [ ] Cleanup via p5Instance.remove() in destroy

---

## 6. Implementation Priority

| Phase | Task | Files Affected |
|-------|------|----------------|
| 1 | Add p5 context handler to GenerativeToolHost | `generative-tool-host.js` |
| 2 | Define p5 script config conventions | `script-types.js` |
| 3 | Create first p5 generator script | `scripts/pattern/p5-example.gen.js` |
| 4 | Add p5 generator standards doc | `guides/standards/p5-generator-standards.md` |
| 5 | Add p5 generator checklist | `guides/checklists/p5-generator.md` |
| 6 | Update ai-routing-map | `guides/ai-routing-map.md` |
| 7 | Wire export compatibility | Handle p5 canvas for PNG/GIF export |

---

## 7. Open Questions

1. **IframeSandbox for all p5?**
   - Pro: Security, matches defecated-tool pattern
   - Con: Complex, harder to wire params reactively
   - Recommendation: No. Use instance mode for trusted generators.

2. **WebGL shaders in p5?**
   - p5 WEBGL mode is separate from context: 'webgl'
   - May need `context: 'p5-webgl'` variant
   - Recommend: Support later, start with p5 2D.

3. **Library addons (p5.sound, etc.)?**
   - Require additional CDN loads
   - Add `libraries: ['sound']` to canvas config?
   - Recommend: Define allowed addons, load on demand.

4. **Existing p5 integrations (phyllo sketches)?**
   - Currently use P5ControlledSketch in sections
   - Could migrate to generator system for consistency
   - Recommend: Keep separate if page-specific; migrate if reusable.

---

## 8. Summary

**Current state:** p5.js has integration components but is not wired into the unified generator system. `context: 'p5'` is declared but unimplemented.

**Required:** 
1. Implement p5 context handler in GenerativeToolHost
2. Define p5-specific script config signature
3. Create standards/checklist docs
4. Update routing map for p5 generator workflow

**Paradigm choice:** Use p5 instance mode with external animation control (AnimationFoundation). No IframeSandbox for trusted generator scripts. Reserve IframeSandbox for user-input code (p5-to-video tool).

---

## 9. Implementation Status

### Completed
- [x] `guides/standards/p5-generator-standards.md` - p5 generator standards
- [x] `guides/checklists/p5-generator.md` - implementation checklist
- [x] `guides/ai-routing-map.md` - added section 11 for p5 generators
- [x] `script-types.js` - added `P5SetupFunction`, `P5DrawFunction` typedefs; updated validation
- [x] `generative-tool-host.js` - added `_initP5Instance()`, p5 context handling, cleanup
- [x] `golden-grid.gen.js` - first p5 generator (reference implementation)
- [x] `script-registry.js` - registered golden-grid

### First p5 Generator: Golden Grid
Location: `assets/js/tools/generators/scripts/pattern/golden-grid.gen.js`

Features:
- Recursive golden ratio subdivision
- Animated proportions using φ
- HSL colour mapping from geometry
- Configurable depth, loop frames, colour speeds
- 4 presets (Classic, Deep, Shallow, Static)

