# To Fix - Priority Tasks

Accumulated issues and enhancements to address.

---

## 🔴 High Priority

### 1. F-System Live Update Issues

**Problem:** Many elements on the site are not responsive to live F value updates when using the footer `[+] F=14 [-]` buttons.

**Affected Areas (to investigate):**
- [ ] Inline styles set at render time (use `${F}px` instead of `calc(var(--f) * N)`)
- [ ] Components that don't re-render on F change
- [ ] PageFooter inline styles
- [ ] Tool sidebar elements
- [ ] Any hardcoded px values in CSS

**Solution Required:**
1. Audit all CSS for hardcoded pixel values
2. Replace with `calc(var(--f) * N)` patterns
3. Audit all JS inline styles using `${F}px`
4. Either convert to CSS classes OR add resize listeners
5. Consider adding `DynamicFManager.onFChange(callback)` subscription system

**Test Command:**
```javascript
DynamicFManager.setF(20);  // Should scale everything
DynamicFManager.setF(10);  // Should scale everything back
```

---

### 2. Add Export Modules to All Canvas Tools ✅ COMPLETE

**Status:** Animation export functionality added to all animated tools.

**Tools Updated:**
- [x] `harmonics-tool.js` - Loop: 720s (12 min cycle), with onRenderFrame
- [x] `lissajous-tool.js` - Infinite, with onRenderFrame
- [x] `circles-tool.js` - Loop: 3600 frames, with onRenderFrame
- [x] `torus-tool.js` - Loop: 3600 frames, with onRenderFrame
- [x] `squares-tool.js` - Loop: 240s (4 min timeline), with onRenderFrame
- [x] `cymatics-tool.js` - Infinite, with onRenderFrame
- [x] `wave-interference-tool.js` - Sequence-based
- [x] `pixel-tiler.js` - Sequence-based, with onRenderFrame

**Static Tools (PNG export only via CANVAS tab):**
- [x] `colour-quantizer-toolbase.js` - Has custom export
- [x] `font-analysis-tool.js` - CANVAS tab enabled
- [x] `polygon-calculator.js` - Has custom export

**Archived (not needed):**
- `asteroid-belt-tool.js` → archive (user confirmed not needed)
- `nested-circles-tool.js` → archive (duplicate of circles-tool.js)

**Features Added:**
- `animation` config in TOOL_CONFIG specifying type, frames, fps
- `onRenderFrame(frameIndex, totalFrames)` callback for pre-rendering
- ToolBase auto-injects "Export Animation" block in CANVAS tab
- Supports PNG Sequence (ZIP), Video (WebM), and GIF export

---

## 🟡 Medium Priority

### 3. Home Page Animation - Canvas Only

**Problem:** The animation on the home page should NOT have UI controls. It should be the canvas by itself, displayed above the main site sections as a visual header/hero element.

**Current State:** Unknown - needs investigation

**Required Changes:**
- [ ] Remove sidebar/controls from home page animation
- [ ] Display as full-width canvas header
- [ ] Animation should auto-play, no user controls
- [ ] Consider subtle interaction (mouse parallax, etc.)
- [ ] Ensure proper cleanup on navigation

---

### 4. Generate Thumbnails for Tools & Gen Art

**Problem:** TOC (Table of Contents) pages for tools and generative art need thumbnail images to display properly.

**Required Thumbnails:**
- [ ] All tools in `/tools/` section
- [ ] All generative art in `/art/generative/`
- [ ] Consistent size (e.g., 400×400 or 16:9 ratio)
- [ ] VGA-aesthetic consistent styling

**Thumbnail Generation Process:**
1. Navigate to each tool/animation
2. Set canvas to thumbnail size
3. Export representative frame as PNG
4. Save to appropriate thumbnail directory
5. Update JSON/config to reference thumbnails

**Suggested Automation:**
- Create a thumbnail generation script
- Use Puppeteer/Playwright to automate screenshots
- Or add "Export Thumbnail" button to tools

**Thumbnail Locations:**
```
assets/images/thumbnails/tools/
assets/images/thumbnails/art/generative/
```

---

## 🟢 Lower Priority

### 5. Tool Test Coverage

See: `blog/docs/pages/tools/add-to-test-plan.md`

### 6. Architecture Violations

See: `blog/docs/pages/tools/tool-audit-discrepancies.md`

---

## Notes

- Items marked with ✅ are complete
- Items marked with [ ] need work
- Update this file as tasks are completed

---

*Last updated: Session ongoing*

