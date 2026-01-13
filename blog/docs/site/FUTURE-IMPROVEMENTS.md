# Future Improvements

Technical debt and optimization targets.

---

## Library Overhead Reduction

### ✅ IMPLEMENTED: Lazy Loading System (Dec 2024)

`AssetLoader` (`assets/js/core/asset-loader.js`) now provides on-demand loading:

**Removed from startup:**
- ❌ ~~math.js (~50KB)~~ → Loaded only for lissajous, wave-interference tools
- ❌ ~~RecordRTC (~40KB)~~ → Loaded only when export triggered
- ❌ ~~JSZip (~25KB)~~ → Loaded only when export triggered
- ❌ ~~14 tool scripts (~200KB+)~~ → Loaded on navigation

**Still at startup (required):**
- MathJax (~200KB) — needed for equations site-wide
- marked (~15KB) — needed for blog/markdown
- Prism (~10KB) — needed for code blocks
- ToolBase (~12KB) — required for all tools

### Updated Metrics

| Metric | Before | After | Savings |
|--------|--------|-------|---------|
| Initial JS payload | ~340KB | ~250KB | ~90KB |
| Export libraries | Always loaded | On-demand | ~65KB |
| Tool scripts | All 14 loaded | On-demand | ~200KB+ |
| Time to first tool | N/A | +200-500ms | Trade-off |

### How It Works

```javascript
// Tools lazy load via AssetLoader
const ToolClass = await window.AssetLoader.loadTool('lissajous');

// Export libraries lazy load in ToolBase
const JSZip = await window.AssetLoader.ensureJSZip();
const RecordRTC = await window.AssetLoader.ensureRecordRTC();
```

### Remaining Optimizations

**math.js (~50KB)** — Still loaded for 2 tools (lissajous, wave-interference)

Options (in order of preference):
1. **Custom build** — Include only needed functions (~5-10KB)
2. **Inline critical** — Move sin/cos/pow to utility file (~1KB)
3. **Status quo** — Keep lazy loading (good enough)

---

## UI/UX Improvements

### UI Rules Documentation (Updated Dec 2024)
- [x] Unified terminology with tool-build-guide (Tab, Block, Component, Key)
- [x] Added PCS (Primary Content Surface) concept
- [x] Clarified F-system notation (CSS variables vs abstract references)
- [x] Separated UI color tokens from canvas VGA palette
- [x] Added prohibited patterns table for enforcement

### Sequencer Component Styling
- [ ] Complete visual overhaul of sequencer component
- [ ] Checkpoint items need consistent spacing
- [ ] Transition blocks need distinct visual treatment
- [ ] Drag handles need better affordance
- [ ] Must be rebuilt using ComponentLibrary primitives (per ui-interface-overview.md §8.3)

### Sidebar Layout Density

**Problem:** Many controls waste vertical space with stacked single-column layouts.

**Example - Current:**
```
φy2 Animation
Enable
[On]
Inverse  
[Rev]
Loop Frames
[====60====]
```

**Target - Compact:**
```
φy2 Animation
[On] Enable  [Rev] Inverse  [60] Frames
```

**Solutions:**
1. Multi-column layouts for toggle groups
2. Inline labels instead of stacked
3. Remove redundant labels (e.g., "On" next to visible toggle)
4. Horizontal toggle groups with label as button text

### Redundant Labels

**Problem:** Toggles show both label AND state text, doubling UI.

**Bad:**
```
Show Equation
☐ On
```

**Good:**
```
☐ Show Equation
```

**Implementation:**
- Toggle component should use label AS the toggle text
- Remove separate "On/Off" text when toggle state is visually clear
- Only show state text for ambiguous controls

### Specific Fixes Needed
- [ ] Phase animation blocks: 3-column layout (enable, reverse, frames)
- [ ] Equation toggle: remove "On" label
- [ ] Canvas options: horizontal checkbox group
- [ ] Sequencer controls: inline button row
- [ ] All toggle blocks: evaluate label redundancy

---

## Other Technical Debt

### Animation Foundation
- [ ] Phase animation pattern not standardized across tools
- [ ] Each tool reimplements play/pause/export logic

### ToolBase
- [ ] Nested tabs implementation pending
- [ ] Animation export integration incomplete

### Shared Utilities
- [ ] safePow duplicated in wave-interference, needs single source
- [ ] Color space conversion duplicated in quantizer tools

---

## Notes

This file tracks optimization opportunities. Items move to implementation when:
1. Performance impact is measured and significant
2. Solution is validated
3. Time is allocated

Do not prematurely optimize — measure first.

