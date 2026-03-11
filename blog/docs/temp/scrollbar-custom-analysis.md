# Custom Scrollbar Analysis — Full Integration Options

## Requirements

**Design Spec:**
- Box: F or F/2 width (14px or 7px) depending on context
- Borders: Follow site logic (avoid double borders with adjacent elements)
- Thumb: Inverted bg rectangle, proportional height (1/3 visible → 1/3 thumb)
- Colors: Use `--c-bg`, `--c-text`, `--c-border` (dynamic, theme-aware)
- No rounded corners, gradients, shadows

**Problem:**
CSS scrollbar pseudo-elements (`::-webkit-scrollbar`) can't achieve:
1. Conditional border rendering (avoid double lines)
2. Direct integration with layout system
3. Context-aware sizing (F vs F/2 per element)
4. True proportional thumb sizing control

## Options Analysis

### Option 1: Enhanced CSS-Only (Improved Native)

**Approach:**
- Max out `::-webkit-scrollbar` pseudo-element capabilities
- Use CSS variables for dynamic theming
- Accept browser limitations on thumb proportions

**What's Possible:**
```
Track: var(--c-bg) background, var(--c-border) borders
Thumb: var(--c-text) fill, no border-radius
Width: 14px (1F) or 7px (0.5F) via media queries
Corner: var(--c-bg)
```

**What's NOT Possible:**
- Context-specific border logic (can't detect adjacent elements)
- Per-element width control (F vs F/2)
- Manual thumb proportion override
- Integration with SiteBoy's component lifecycle

**Pros:**
- Zero JS overhead
- Native scrolling performance
- Works immediately
- No accessibility concerns

**Cons:**
- Can't achieve full design spec
- Limited control over thumb sizing
- No integration with component system
- Browser calculates thumb height (can't force 1:1 proportion)

**Assessment:** Partial solution. Better than current, but compromised.

---

### Option 2: Full Custom JS Scrollbar Component

**Approach:**
- Hide native scrollbar completely
- Build scrollbar as BaseComponent subclass
- Manual scroll handling via JS (wheel events, drag, touch)
- Complete design control

**Architecture:**
```
CustomScrollbar extends BaseComponent
├─ Track (outer box, borders)
├─ Thumb (inner draggable element)
├─ Event handlers (wheel, drag, touch, keyboard)
└─ Integration with layout system
```

**File Ownership:**
- Component definition: `assets/js/shared/component-library.js` (new component)
- OR: New file `assets/js/core/scrollbar-component.js` (if complex enough)
- Usage: Sections/tools instantiate via ComponentLibrary

**What's Fully Possible:**
- F-based dimensions (14px or 7px, context-aware)
- Border logic matching site (detect parent borders, suppress doubles)
- Exact proportional thumb (1/3 visible = 1/3 thumb, enforced)
- Theme-aware colors (--c-bg, --c-text, --c-border)
- Destroy/cleanup via component lifecycle
- AnimationFoundation for smooth scrolling

**Implementation Complexity:**
- Wheel event handling (smooth scrolling, momentum)
- Touch support (mobile, though scrollbars hidden <1024px)
- Keyboard navigation (Home/End/PgUp/PgDn when focused)
- Resize observer (recalculate on viewport changes)
- Nested scrollable elements (multiple scrollbars)
- Horizontal scrolling support
- Accessibility (ARIA roles, keyboard nav)

**Pros:**
- 100% design spec compliance
- Seamless integration with SiteBoy architecture
- Context-aware behavior (F vs F/2 per instance)
- Proportional thumb control
- Border logic matching site elements

**Cons:**
- Significant development effort (~300-500 lines)
- Performance overhead (JS scroll handling)
- Accessibility complexity (must replicate native behavior)
- Risk of breaking native scroll feel
- Testing across browsers/devices required

**Assessment:** Complete solution, high cost. Overkill unless scrollbar UX is critical brand element.

---

### Option 3: Hybrid — CSS Default + Custom for Specific Contexts

**Approach:**
- Use enhanced CSS for global scrolling (body, .content-container)
- Deploy custom JS scrollbar only where critical (e.g., TOC gallery, tool panels)
- Opt-in system: components request custom scrollbar if needed

**Strategy:**
```
Global: Enhanced CSS scrollbar (Option 1)
Opt-in: Custom JS scrollbar (Option 2) via component flag

Example:
new ToolBase({
  customScrollbar: true,  // Use JS scrollbar
  scrollbarWidth: 'half'  // F/2 sizing
})
```

**File Ownership:**
- CSS: `assets/css/styles.css` (global default)
- Component: `assets/js/shared/component-library.js` or `assets/js/core/scrollbar-component.js`
- Integration: BaseComponent checks for `customScrollbar` flag

**What's Possible:**
- Best of both worlds: performance (CSS) + precision (JS where needed)
- Gradual rollout (start with high-value contexts)
- Fallback to CSS if JS fails/disabled
- Reduced complexity (only build what's used)

**Pros:**
- Pragmatic balance (cost vs benefit)
- Progressive enhancement
- Native performance for most scrolling
- Precision control where it matters
- Lower testing burden

**Cons:**
- Inconsistent scrollbar appearance (CSS vs JS)
- Complexity of two systems
- When to use which? (decision fatigue)

**Assessment:** Practical compromise. Start with CSS improvements, add custom JS only if demonstrably needed.

---

### Option 4: CSS Variables + JS Measurement (Pseudo-Custom)

**Approach:**
- Use CSS pseudo-elements (Option 1)
- Add JS to measure content/viewport ratio
- Inject CSS custom properties to simulate proportional thumb
- Fake proportional sizing via `::before`/`::after` tricks

**Strategy:**
```javascript
// On scroll, measure and update CSS var
const visibleRatio = viewportHeight / contentHeight;
element.style.setProperty('--scroll-ratio', visibleRatio);
```

```css
::-webkit-scrollbar-thumb {
  /* Try to fake height via background manipulation */
  background: linear-gradient(var(--c-text) calc(var(--scroll-ratio) * 100%), transparent 0);
}
```

**Reality Check:**
- `::-webkit-scrollbar-thumb` can't be sized via CSS vars (browser-controlled)
- Can change colors/borders, but not dimensions
- Hack attempts fail due to browser scrollbar internals

**Assessment:** Not viable. Browser controls thumb size, CSS vars can't override.

---

## Comparison Matrix

| Criterion | Option 1: CSS | Option 2: Full JS | Option 3: Hybrid |
|-----------|---------------|-------------------|------------------|
| **Design Spec Compliance** | 60% | 100% | 80% (where used) |
| **Development Cost** | Low (1-2h) | High (10-15h) | Medium (5-8h) |
| **Performance** | Excellent | Good | Excellent |
| **Maintainability** | Simple | Complex | Moderate |
| **Architecture Fit** | Acceptable | Perfect | Good |
| **F-system Integration** | Partial | Full | Full (JS parts) |
| **Border Logic** | No | Yes | Yes (JS parts) |
| **Proportional Thumb** | No (browser) | Yes (manual) | Yes (JS parts) |
| **Theme Support** | Manual | Automatic | Automatic |
| **Accessibility** | Native | Must build | Mixed |

## Recommendations

### Path A: Pragmatic (Recommended)
1. **Phase 1:** Enhance CSS scrollbar (Option 1)
   - Use exact F dimensions (14px)
   - Proper VGA color variables
   - Clean, sharp aesthetic
   - Document limitations
   
2. **Phase 2:** Evaluate need for custom JS
   - Monitor user feedback
   - Identify high-value contexts (TOC, tool sidebars)
   - Build custom component only if warranted

3. **Phase 3:** Hybrid deployment (Option 3)
   - Keep CSS as default
   - Add JS scrollbar to specific contexts
   - Measure impact on UX

**Time Investment:** Phase 1: 1-2h | Phase 2: research | Phase 3: 5-8h if needed

### Path B: Perfectionist
1. Build full custom scrollbar component (Option 2)
2. Replace all native scrollbars site-wide
3. Complete design system integration

**Time Investment:** 10-15h development + 3-5h testing

### Path C: Minimal
1. Improve CSS (Option 1) to max capability
2. Accept browser limitations on thumb sizing
3. Document that thumb proportion is browser-controlled

**Time Investment:** 1-2h

## Technical Constraints

### CSS Scrollbar Limitations (Non-Negotiable)
- Thumb height: Browser-calculated based on content ratio (can't override)
- Border rendering: Global per pseudo-element (can't vary by context)
- Width: Global or media-query based (can't vary per element)
- Layout integration: No access to parent element borders

### Custom JS Requirements (If Built)
Must comply with:
- BaseComponent extension (DOM ownership)
- AnimationFoundation for smooth scrolling (no RAF)
- MathematicalFoundation for dimensions (no ad-hoc px)
- VGA colors only
- Destroy method with cleanup
- componentInstances tracking

### Accessibility Requirements (If Custom JS)
Must implement:
- ARIA roles (`role="scrollbar"`, `aria-controls`, `aria-valuenow`)
- Keyboard navigation (Arrow keys, PgUp/PgDn, Home/End)
- Focus management
- Screen reader announcements
- Touch/pointer events
- Reduced motion support

## Decision Framework

**Choose Option 1 (CSS) if:**
- Design flexibility acceptable
- Performance priority
- Quick implementation needed
- Browser defaults "good enough"

**Choose Option 2 (JS) if:**
- Scrollbar is signature brand element
- Design spec non-negotiable
- Budget/time available
- Willing to maintain complex component

**Choose Option 3 (Hybrid) if:**
- Want best of both worlds
- Iterative approach preferred
- Budget for phased implementation
- Specific contexts demand precision

## Next Steps

1. **Define priority:** Is scrollbar UX critical enough for Option 2/3?
2. **Prototype Option 1:** Enhance CSS to limits (1-2h investment)
3. **Test perception:** Does improved CSS satisfy aesthetic requirements?
4. **Decide:** Commit to Option 1, or proceed with Option 2/3

**Question to answer:** Is the native scrollbar thumb proportion (browser-calculated) acceptable, or must it be manually enforced (1/3 visible = 1/3 thumb)?

If browser-calculated proportion acceptable → **Option 1**
If manual proportion required → **Option 2 or 3**
