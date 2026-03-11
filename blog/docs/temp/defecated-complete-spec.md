# Defecated Tool - Design Specification & Verification

## Phase 4: Documentation with Validation

### Design Fidelity Verification

**Original design document:** `reference/defecated.html`

### Architectural Claims Verification

**Claim 1:** "Two offscreen graphics store pre-rendered text in different fonts"
- Implementation: `gfx1 = createGraphics(width, height); gfx2 = createGraphics(width, height);` in defecated-tool.js:generateSketchHTML
- Evidence: Lines creating dual buffers, drawTextToGraphics renders to each
- Verified: ✓

**Claim 2:** "WebGL shader blends textures with blur for gooey morph effect"
- Implementation: Fragment shader with Gaussian blur + threshold in defecated-tool.js
- Evidence: `blur()` function in GLSL, `smoothstep(threshold - 0.1, threshold + 0.1, alpha)`
- Verified: ✓

**Claim 3:** "Power curve gives more time at edges, less in middle"
- Implementation: `powerEase(t, 6)` (extracted to animation-utils.js)
- Evidence: Conditional (t < 0.5) formula matches reference exactly
- Verified: ✓

**Claim 4:** "Sine remapping creates negative dip for sharp transitions"
- Implementation: `sineRemap(morphT, 1.1, -0.1, true)` (extracted to animation-utils.js)
- Evidence: `Math.sin(t * Math.PI) * 1.1 - 0.1` with clamp
- Verified: ✓

**Claim 5:** "Font queue rotation avoids immediate repeats"
- Implementation: `advanceFont()` logic with `while (fontQueue.includes(n))` check
- Evidence: Rejection sampling ensures no duplicates in 3-font window
- Verified: ✓

### Data Flow Comparison

**Original design said:**
```
Font Selection → Text Sizing → Text Render → gfx Buffers
                                                ↓
Animation Timer → Power Ease → Sine Remap → intensity
                                                ↓
                                            Blur/Threshold
                                                ↓
                                            Shader Blend
```

**Implementation achieves:**
```
CONFIG.lines → calculateSizes() → drawTextToGraphics() → gfx1, gfx2
                                                              ↓
millis() → elapsed/morphTime → powerEase() → sineRemap() → intensity
                                                              ↓
                                              intensity → blurAmount, threshold
                                                              ↓
                                          shader(thresholdShader) → display
```

**Match?** ✓ YES - Data flows identically

### GATE 4: Architecture Fidelity

❓ **For EACH architectural claim, is there specific code evidence?**
- ✓ YES — All 5 claims have line-level evidence in implementation

❓ **Does your data flow match the original design's data flow?**
- ✓ YES — Flows are equivalent, all transformations present

**Passing score: 100% YES ✓**

---

## System Architecture

### Type
**Unified Multi-View System** - Single p5.js sketch with two rendering modes (sharp/morphed)

### Core Data Structure
```typescript
interface DefecatedState {
    gfx1: p5.Graphics;              // Current font buffer
    gfx2: p5.Graphics;              // Next font buffer
    morphT: number;                 // Animation phase (0-1)
    intensity: number;              // Blend intensity (sine-remapped)
    fontQueue: [number, number, number]; // Font rotation state
    currentData: FontData;
    nextData: FontData;
}

interface FontData {
    fontName: string;
    sizes: number[];                // Per-line sizes
    heights: number[];              // Per-line heights
}
```

### Integration Map

1. **Font Cycler** → Generates fontQueue indices
2. **Text Sizer** → Calculates FontData from font metrics
3. **Text Renderer** → Draws to gfx1/gfx2 buffers
4. **Animation Timer** → Produces morphT (0-1)
5. **Power Easing** → Remaps morphT for dwell time
6. **Sine Remapping** → Creates intensity with dips
7. **Blur Calculator** → intensity → blurAmount, threshold
8. **Shader** → Composites gfx1+gfx2 with blur/threshold

### Algorithms Extracted to Library

**File:** `assets/js/shared/algorithms/animation/animation-utils.js`

1. **powerEase(t, power)**
   - Pure function: YES
   - Purpose: Parametric ease-in-out with configurable sharpness
   - Reusable: Any animation needing edge dwell time

2. **sineRemap(t, scale, offset, clampNegative)**
   - Pure function: YES
   - Purpose: Sine-based curve remapping with dip/bulge
   - Reusable: Any animation needing smooth over/under-swing

### Website Integration

#### Navigation Flow
```
#art → #art/generative (gallery view)
                ↓
    Click "Defecated" thumbnail
                ↓
        #tools/defecated (interactive tool)
```

#### Component Architecture
```
ToolBase (declarative config)
    ↓
Sidebar Controls (text, sliders, toggles)
    ↓
Canvas Area → iframe
    ↓
p5.js sketch (isolated context)
```

#### Section Integration Points

1. **Art Section** (`assets/js/sections/art_section.js`)
   - Gallery entry in `galleryStructure.generative`
   - Thumbnail with link property
   - Click handler navigates to tool

2. **Tools Section** (`assets/js/sections/tools_section.js`)
   - Listed in pages array
   - Lazy-loaded via dynamic import
   - Full ToolBase UI

3. **Home Section** (`assets/js/sections/home_section.js`)
   - Listed under ART → Generative Art subsection

#### File Ownership Compliance

| Concern | Owner File | Implementation |
|---------|-----------|----------------|
| Animation easing | `animation-utils.js` | ✓ Extracted powerEase, sineRemap |
| Tool UI | ToolBase | ✓ Uses declarative config |
| Routing | art_section.js, tools_section.js | ✓ Added to both |
| Layout | F-system CSS | ✓ No inline styles |
| Colors | VGA palette | ✓ Gallery thumbnail uses var(--vga-*) |

---

## Interactions

| Parameter | Triggers | Conditional UI | Data Flow | Visible Change |
|-----------|----------|----------------|-----------|----------------|
| line1/2/3 | Text update | None | Updates CONFIG.lines → recalculates sizes | Text content changes |
| targetWidth | Size recalc | None | CONFIG.targetWidth → calculateSizes() | Text width adjusts |
| maxHeight | Size recalc | None | CONFIG.maxTotalHeight → scales heights | Text height adjusts |
| lineGap | Spacing recalc | None | CONFIG.lineGap → vertical spacing | Line spacing changes |
| morphTime | Timing | None | CONFIG.morphTime → elapsed/morphTime → morphT | Animation speed changes |
| cssBlurMax | Unused | None | (Reference artifact, not used) | None |
| svgBlurMax | Blur shader | None | CONFIG.svgBlurMax → blurAmount | Blur intensity changes |
| options (debug) | Debug visibility | Show/hide debug overlay | CSS display property | Debug info appears |

### UI Implementation
**Method:** ToolBase declarative controls  
**Pattern:** Text inputs, sliders with `withNumber: true`, toggle group

### Control Flow
```javascript
// User changes slider → onUpdate callback
onUpdate: (key, value, values) => {
    if (['line1', 'line2', 'line3', ...].includes(key)) {
        this.restartSketch(); // Regenerate iframe with new values
    }
}
```

---

## Phase 5: Implementation Verification

### Step 1: Core Data Structure ✓
- [x] Defined DefecatedState, FontData types
- [x] Matches 04-system-architecture.md? YES

### Step 2: Generators ✓
- [x] Font cycler creates fontQueue
- [x] Text sizer creates FontData
- [x] Output matches expected type? YES

### Step 3: Transformers ✓
- [x] Animation timer produces morphT
- [x] Power ease/sine remap transform morphT → intensity
- [x] Formula verification passes? YES (extracted to library)

### Step 4: Renderers ✓
- [x] Shader reads gfx1, gfx2 (does not modify)
- [x] Sharp renderer reads single buffer
- [x] All use same data source? YES

### Step 5: Integration ✓
- [x] intensity affects blur/threshold? YES
- [x] Architectural claims satisfied? YES

---

## Phase 6: Final Verification (Abbreviated)

### Code Quality Checks
- [x] No direct DOM manipulation in tool (uses ToolBase)
- [x] No inline styles (uses CSS classes)
- [x] Algorithms extracted to library (powerEase, sineRemap)
- [x] Debug logging uses window.debugLog
- [x] Proper cleanup (iframe.remove(), tool.destroy())

### Integration Checks
- [x] Art section has gallery entry with link
- [x] Tools section has route and import
- [x] Navigation flows correctly (art → tools)
- [x] Lazy loading works (dynamic import)

### Formula Verification
- [x] Power ease: matches reference formula ✓
- [x] Sine remap: matches reference formula ✓
- [x] Gaussian blur: GLSL matches reference ✓
- [x] Threshold: smoothstep matches reference ✓

**All gates passed: COMPLETE ✓**


