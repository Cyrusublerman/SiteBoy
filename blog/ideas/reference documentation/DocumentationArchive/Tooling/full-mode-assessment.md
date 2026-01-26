# Full-Page Mode Implementation Assessment

## Problem
Need mode showing page content without header/footer. Requires URL-based activation.

## Architecture Context

### Current System
- Router: hash-based `#section/subsection`
- Page structure: PageHeader → Subheader → ContentContainer → PageFooter
- Router parses: `window.location.hash.slice(1).split('/')`
- App builds page via `buildPageForRoute(section, subsection)`

### Components to Hide
- `PageHeader` (fixed, id='header')
- `PageFooter` (fixed, id='footer')
- `Subheader` (optionally, body-appended)

## URL Approaches

### Option 1: Query Parameter `?full=true#section/subsection`
**Syntax:** `?full=true#tools/about-you`

**Pros:**
- Separate from routing logic
- Standard web pattern
- Easy to add/remove

**Cons:**
- Requires parsing both `location.search` and `location.hash`
- Query params before hash less common
- Need new parsing logic in Router

**Implementation:**
```javascript
// router.js
parseRoute() {
    const params = new URLSearchParams(location.search);
    const isFullMode = params.get('full') === 'true';
    const hash = location.hash.slice(1);
    // ... existing parsing
    return { section, subsection, isFullMode };
}
```

### Option 2: Hash Modifier `#section/subsection:full`
**Syntax:** `#tools/about-you:full`

**Pros:**
- Single hash parsing
- Clear intent (`:` suggests mode/modifier)
- Minimal routing changes

**Cons:**
- Non-standard delimiter
- Could conflict if subsections use `:`

**Implementation:**
```javascript
// router.js
parseRoute() {
    let hash = location.hash.slice(1);
    const isFullMode = hash.endsWith(':full');
    if (isFullMode) hash = hash.slice(0, -5);
    const [section, ...rest] = hash.split('/');
    return { section, subsection: rest.join('/'), isFullMode };
}
```

### Option 3: Path Segment `#section/subsection/full`
**Syntax:** `#tools/about-you/full`

**Pros:**
- No parsing changes needed
- Router sees it as deeper path

**Cons:**
- Ambiguous (looks like subsection)
- Requires section logic to detect `/full` suffix
- Not semantically clear

**Implementation:**
```javascript
// app.js
buildPageForRoute(section, subsection) {
    const isFullMode = subsection?.endsWith('/full');
    const actualSubsection = isFullMode ? 
        subsection.slice(0, -5) : subsection;
    // ...
}
```

### Option 4: Fragment Identifier `#section/subsection#full`
**Syntax:** `#tools/about-you#full`

**Cons:**
- Only one `#` allowed in URL
- Would break hash routing entirely
- **NOT VIABLE**

### Option 5: Reserved Query in Hash `#section/subsection?full`
**Syntax:** `#tools/about-you?full`

**Pros:**
- Query-like semantics within hash
- Clear separation from path

**Cons:**
- Unusual pattern (queries typically outside hash)
- Might confuse URL parsing

**Implementation:**
```javascript
// router.js
parseRoute() {
    const hash = location.hash.slice(1);
    const [path, query] = hash.split('?');
    const isFullMode = query === 'full';
    const [section, ...rest] = path.split('/');
    return { section, subsection: rest.join('/'), isFullMode };
}
```

## Rendering Changes Required

### Minimal Approach (CSS-based)
```javascript
// app.js - in initializeRouting or buildPageForRoute
if (isFullMode) {
    document.body.classList.add('full-mode');
}

// styles.css
body.full-mode #header,
body.full-mode #footer {
    display: none;
}

body.full-mode #container {
    top: 0 !important;
    bottom: 0 !important;
}
```

### Component Approach
```javascript
// app.js - in createPageStructure
this.headerComponent.setVisible(!isFullMode);
this.footerComponent.setVisible(!isFullMode);

// layout.js - add to BaseComponent or PageHeader/Footer
setVisible(visible) {
    this.element.style.display = visible ? 'flex' : 'none';
}
```

## Recommendation

**Use Option 2: Hash Modifier `#section/subsection:full`**

**Rationale:**
1. **Single source parsing** - router already parses hash exclusively
2. **Semantic clarity** - `:` indicates mode/state modifier (CSS pseudo-classes convention)
3. **Minimal changes** - add suffix detection to existing `parseRoute()`
4. **Clean URLs** - `#tools/about-you:full` reads clearly
5. **No conflicts** - unlikely subsections use `:` in slug

**Implementation Plan:**
1. Router: detect `:full` suffix, strip from path, add `isFullMode` to route object
2. App: subscribe to `isFullMode`, apply `body.full-mode` class
3. CSS: hide header/footer, adjust content positioning when `.full-mode`
4. Maintain: update route on navigation to preserve/remove `:full`

**Alternative if `:` problematic:** Use Option 5 (`?full`) as semantically similar but less common pattern.

**Avoid:** Option 3 (ambiguous), Option 1 (overcomplicated), Option 4 (not viable).

## Edge Cases

- **Refresh:** `:full` in URL → mode persists ✓
- **Navigation:** Need logic to preserve/remove `:full` on section change
- **Direct link:** External `#tools/about-you:full` → works immediately ✓
- **Subheader:** Should it hide? Depends on use case (tools might need it)
- **Escape:** Remove `:full` from URL or toggle back to normal mode

## CSS Positioning Fix

Current positioning uses CSS vars:
- `--header-y`, `--subheader-y`, `--container-y`, `--footer-y`
- `--content-h` calculated based on header/footer presence

Full mode needs:
```css
body.full-mode #container {
    top: var(--layout-margin);
    height: calc(100vh - (var(--layout-margin) * 2));
}
```

Or recalculate `--content-h` when full mode active.

## Decision Matrix

| Criterion              | Option 1 (?full) | Option 2 (:full) | Option 3 (/full) | Option 5 (?full in hash) |
|------------------------|------------------|------------------|------------------|--------------------------|
| Parse simplicity       | Medium           | **High**         | High             | Medium                   |
| Semantic clarity       | High             | **High**         | Low              | Medium                   |
| URL readability        | Medium           | **High**         | Low              | Medium                   |
| Routing changes        | Major            | **Minor**        | Minor            | Medium                   |
| Conflict risk          | None             | **Low**          | High             | Low                      |
| Standard pattern       | High             | Medium           | Low              | Low                      |

**Winner: Option 2 (`:full` modifier)**

