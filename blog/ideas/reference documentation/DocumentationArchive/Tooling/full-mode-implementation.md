# Full-Page Mode Implementation

## Overview
Implemented `:full` URL modifier for displaying pages without header/footer chrome.

## URL Syntax
```
Normal:    #section/subsection
Full mode: #section/subsection:full

Examples:
  #tools/about-you:full
  #blog/article:full
  #home:full
```

## Architecture Integration

### 1. Router Layer (router.js)
**Responsibility:** Parse `:full` suffix from URL hash

```javascript
parseRoute() {
    let hash = location.hash.slice(1);
    const isFullMode = hash.endsWith(':full');
    if (isFullMode) hash = hash.slice(0, -5);
    // ... parse section/subsection
    return { section, subsection, isFullMode };
}
```

**Changes:**
- `parseRoute()` detects `:full` suffix, strips it, returns `isFullMode` boolean
- `handleRouteChange()` logs full mode status
- `navigateToSection()` accepts `fullMode` parameter, appends `:full` to hash
- `currentRoute` object includes `isFullMode` property

### 2. App Layer (app.js)
**Responsibility:** Apply full-mode class to body BEFORE page build

```javascript
handleRouteChange(route) {
    const { section, subsection, isFullMode } = route;
    
    // Apply class BEFORE building page (affects CSS calculations)
    if (isFullMode) {
        document.body.classList.add('full-mode');
    } else {
        document.body.classList.remove('full-mode');
    }
    
    this.state.isFullMode = isFullMode;
    this.buildPageForRoute(section, subsection);
}
```

**Changes:**
- `handleRouteChange()` applies/removes `full-mode` class on body
- `state.isFullMode` tracks current mode
- `navigateToSection()` passes `fullMode` parameter to router

**Timing:** Class applied BEFORE `buildPageForRoute()` ensures CSS vars recalculate with correct layout.

### 3. CSS Layer (styles.css)
**Responsibility:** Hide header/footer, reposition content

```css
/* Hide chrome */
body.full-mode #header,
body.full-mode .page-header { display: none; }

body.full-mode #footer,
body.full-mode .page-footer { display: none; }

/* Reposition content */
body.full-mode #container,
body.full-mode .content-container {
    top: var(--layout-margin);
    height: calc(100vh - (var(--layout-margin) * 2));
}

/* With subheader */
body.full-mode.has-subheader #container {
    top: calc(var(--layout-margin) + var(--subheader-height));
    height: calc(100vh - (var(--layout-margin) * 2) - var(--subheader-height));
}
```

**Behaviour:**
- Header/footer hidden via `display: none`
- Content container fills viewport minus margins
- Subheader remains visible (tools may need navigation)
- Layout margins preserved

## Flow Diagram

```
URL: #tools/about-you:full
    ↓
Router.parseRoute()
    → detects :full suffix
    → strips from path
    → returns { section: 'tools', subsection: 'about-you', isFullMode: true }
    ↓
Router.handleRouteChange()
    → logs route with :full indicator
    → notifies callbacks with route object
    ↓
App.handleRouteChange(route)
    → reads route.isFullMode
    → applies body.classList.add('full-mode')
    → stores state.isFullMode = true
    → calls buildPageForRoute()
    ↓
CSS applies body.full-mode rules
    → #header, #footer display: none
    → #container repositioned to fill viewport
    ↓
Page renders without chrome
```

## Usage Examples

### Programmatic Navigation
```javascript
// Navigate to full-page mode
SiteBoyApp.navigateToSection('tools', 'about-you', true);

// Navigate to normal mode
SiteBoyApp.navigateToSection('tools', 'about-you', false);
```

### Direct Links
```html
<!-- Full-page tool -->
<a href="#tools/about-you:full">Open Tool (Full)</a>

<!-- Normal page -->
<a href="#tools/about-you">Open Tool (Normal)</a>
```

### Iframe Embedding
```html
<!-- Embed tool without site chrome -->
<iframe src="https://site.com/#tools/about-you:full"></iframe>
```

## State Persistence

- **Refresh:** URL contains `:full` → mode persists ✓
- **Navigation:** Mode NOT automatically preserved on section change
- **Back/Forward:** Browser history includes `:full` → mode follows history ✓

## Edge Cases Handled

1. **Empty route:** `#:full` → home page in full mode ✓
2. **Subsection only:** `#tools:full` → tools section in full mode ✓
3. **Deep paths:** `#tools/category/item:full` → parses correctly ✓
4. **Invalid suffix:** `#tools:fullscreen` → NOT full mode (exact match required) ✓
5. **Multiple colons:** `#tools:other:full` → only last `:full` detected ✓

## Testing Checklist

- [ ] Navigate to `#home:full` → header/footer hidden
- [ ] Navigate to `#tools/about-you:full` → tool fills viewport
- [ ] Refresh page with `:full` in URL → mode persists
- [ ] Navigate from full to normal → chrome reappears
- [ ] Check console logs show `[FULL MODE]` indicator
- [ ] Verify `body.full-mode` class applied
- [ ] Test with subheader present → content positioned correctly
- [ ] Test programmatic navigation with `fullMode` parameter

## Files Modified

1. `assets/js/core/router.js` - Parse `:full` suffix
2. `assets/js/core/app.js` - Apply body class, track state
3. `assets/js/shared/layout.js` - Update positioning logic for full mode
4. `assets/css/styles.css` - Hide chrome, reposition content

## Critical Bug Fix

**Problem:** `document.body.className = 'with-subheader'` overwrote ALL body classes, removing `full-mode` class.

**Solution:** Changed to `classList.add/remove` to preserve multiple classes:
```javascript
// Before (WRONG - overwrites all classes)
document.body.className = 'with-subheader';

// After (CORRECT - preserves other classes)
document.body.classList.add('has-subheader');
document.body.classList.remove('no-subheader');
```

**Also updated:** `PageContainer.setSubheaderState()` and `onResize()` to check `isFullMode` and calculate positioning accordingly.

## Architectural Compliance

✓ Router owns URL parsing (SSoT)
✓ App owns page structure state
✓ CSS owns visual presentation
✓ No DOM manipulation outside BaseComponent
✓ No inline styles (uses CSS classes)
✓ Mathematical layout preserved (margins, F-system)
✓ Proper cleanup on navigation (class removed)
✓ State tracked in app.state

## Future Enhancements

- Toggle button to enter/exit full mode
- Keyboard shortcut (e.g. F11)
- Remember user preference in localStorage
- API for sections to detect full mode: `SiteBoyApp.state.isFullMode`
- Full mode variants: `:minimal` (hide subheader too), `:zen` (hide all UI)

