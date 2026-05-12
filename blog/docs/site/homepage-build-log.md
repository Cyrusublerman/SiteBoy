# Homepage Build Log

**File:** `blog/docs/site/homepage-build-log.md`  a
**Scope:** Full record of homepage redesign — intent, instructions, decisions, outstanding issues.

---

## 1. Objective

Replace the existing ASCII scene homepage (`AsciiNavScene`) with a full-viewport site map structured as a collapsible tree TOC. The tree exposes every section of the site under a single root node labelled **ALI EINODER**. The homepage hides all site chrome (header, footer, subheader) and presents as a genuine full-viewport screen bounded by a single 1px outline.

---

## 2. User Instructions (verbatim intent)

> "I don't like our current home page. I think we can make something better utilising our new TOC structure for the tools and docs."

> "We don't say siteboy, we should say ALI EINODER. Under contact we should also have link to Instagram, pretend it is a page."

> "We would also be able to hide the header and footer for this."

> "Default expansion is closed."

> "Art section should just have first level of galleries (Physical …)."

> "Have placeholder for docs until load. Just say (LOADING)."

> "External link (Instagram) should just open page in a new tab."

> "Contact should look like a branch but is just the popup we have now."

> "I asked not to have that top bar." — ruling out any jump-list strip.

> "Full mode should just have the one level of outline on the page with no header or footer. It should be controlled in config. Remember we have no local DOMs allowed on this site. Nothing should actually hide — it should just not build. The TOC doesn't even work. Clicking does nothing. It should start centered both horizontally and vertically. All scrolling etc is just within content container."

> "We want the single line around the screen. Essentially we want the content container with all its borders and no header or footer with them hidden using the exact methodology we were hiding the footer and subheader. We did, in the config and layout, have a methodology for this. It was all in JS."

> "You need to properly analyse how the headers and footers were being controlled and built. Most of it is with JS not with CSS so you have been looking in the wrong areas."

> "The descriptions are a mess and overlap with the next level. If we instead have them limited in width to the column area and centered there it will fit with multiple lines."

> "We need to make it wider by perhaps N (from the line build) or even 2N − 2 char length."

> "It needs to be centered positionally. The text should still be aligned left."

> "You shifted the wrong direction."

> "The description should be above and linked to the word it is coming from preferably. I don't want any interaction between it and other elements. It still isn't centered."

> "The next column is also pushed down which is wrong. The first entry has to be the same height as the parent."

> "Scrolling and moving around doesn't work properly. When we get snapped to the end we can't scroll back up."

---

## 3. Architecture Decisions

### 3.1 Chrome control — JS only, not CSS

**Problem:** Early attempts used `body.full-mode` CSS class and inline `display: none` on `#header`/`#footer`. This produced race conditions with `layout.js`'s `setSubheaderState`, which writes inline `top`/`bottom`/`left`/`width`/`border` styles on `#container` — inline styles override CSS classes unless `!important` is used, and `!important` fought the layout engine.

**Resolution:** `PageHeader` and `PageFooter` both received `show()`/`hide()` methods (mirroring the existing `Subheader.show()`/`Subheader.hide()` pattern). `setSubheaderState` in `PageContainer` is the single authority for all container positioning and chrome visibility. It reads `document.body.classList.contains('home-mode')` and calls `headerComponent.hide()`, `subheaderComponent.hide()`, `footerComponent.hide()` directly when on the home route.

**`app.js`** adds/removes `body.home-mode` in `handleRouteChange` before calling `buildPageForRoute`, so the class is always set before `setSubheaderState` runs.

### 3.2 Container positioning — three modes

`setSubheaderState` branches into three modes:

| Mode | Trigger | Container |
|---|---|---|
| **home-mode** | `body.home-mode` | `top/bottom/left/right: margin; width: frameWidth; all 4 borders; overflow: auto; display: flex; align-items: center; justify-content: center` |
| **full-mode** | `body.full-mode` (`:full` URL modifier) | `top/bottom: margin; left: marginLeft; width: frameWidth; all 4 borders; overflow-y: auto` |
| **normal** | default | `top: margin+headerH; bottom: footerOffset; left: marginLeft; width: frameWidth; left+right borders only; padding: 4F; overflow-y: auto` |

All six inline properties (`top`, `bottom`, `left`, `width`, `border-*`, `padding`, `display`, etc.) are written explicitly in every branch so no stale values persist when switching between modes.

### 3.3 No local DOM

`home_section.js` was rewritten as a `BaseComponent` subclass (`HomeSectionComponent`). All element creation goes through `this.createElement()` (the `BaseComponent` method that wraps `document.createElement` inside the component system). The section module `HomeSection` is a plain singleton that creates the component, holds no DOM references itself, and calls `component.destroy()` on cleanup.

### 3.4 TreeTOC — what it is

`TreeTOC` (in `assets/js/shared/content.js`) renders a recursive tree as:
- An SVG layer for connector lines (arms, stubs, rails, collapsed `+` indicators)
- Absolutely-positioned `div.tree-toc-node` elements for each label
- Absolutely-positioned `div.tree-toc-desc` elements for branch descriptions

**Geometry (per depth column):**
```
charW = F × 0.60          (one character width — gap unit)
N     = charW × 6         (arm / stub line length)
labelX[d]   = previous railX + N
textX[d]    = labelX[d] + charW
railX[d]    = textX[d] + maxW[d] + charW + N
labelX[d+1] = railX[d] + N
```

Arm line: `textX + actualW + charW → railX` (variable, always = N for the longest label)  
Rail: vertical at `railX`, from parent row to last child row  
Stub: `railX → labelX[d+1]` (always N)

### 3.5 Descriptions

Branch descriptions sit above the parent label, centred in the arm gap (from `textX + actualW + charW` to `railX`), one row above the label row. They use `white-space: nowrap`. They do not push children down — `_assignRows` gives no extra rows for descriptions, so the first child always aligns vertically with its parent.

### 3.6 `_scrollToReveal` suppressed

`TreeTOC._scrollToReveal` was walking the DOM to find a scrollable ancestor and calling `scrollTo()` on it. On the home page this hit `document.documentElement` causing unwanted scroll jumps. Fixed by:
- Adding `noAutoScroll: true` option to `TreeTOC` constructor (passed from `HomeSectionComponent`)
- Adding an early-return guard in `_scrollToReveal` that exits if any ancestor has `overflow: hidden`

---

## 4. Files Modified

| File | What changed |
|---|---|
| `assets/js/sections/home_section.js` | Full rewrite — `HomeSectionComponent extends BaseComponent`, no pan/drag, no jump list, TreeTOC with `noAutoScroll`, async DOCS branch, click routing |
| `assets/js/shared/layout.js` | `PageHeader.show()/hide()`, `PageFooter.show()/hide()` added; `setSubheaderState` rewritten with three-mode branch; `onResize` delegates to `setSubheaderState`; `PageContainer.render()` reverted to always build all chrome |
| `assets/js/core/app.js` | `handleRouteChange` sets `body.home-mode` class before `buildPageForRoute`; removed redundant inline DOM manipulation; removed tool-page `padding/overflow` reset in `else` branch |
| `assets/js/shared/content.js` | `TreeTOC`: `noAutoScroll` option; `_scrollToReveal` guard; description rendering above parent label, centred in arm gap, no row displacement |
| `assets/js/core/animation-foundation.js` | `Tween` class added (was part of earlier pan approach — no longer called from home section but kept as general utility) |
| `assets/css/styles.css` | Removed all `body.home-mode` CSS rules (chrome control moved fully to JS) |

---

## 5. Outstanding Issues

### 5.1 Scroll snap / cannot scroll back up

**Symptom:** When the content container is in home-mode, it is styled as `display: flex; align-items: center; justify-content: center; overflow: auto`. This centres the `home-section` div within the container when the tree is smaller than the viewport. However, when the tree grows larger (branches expanded), `overflow: auto` allows scrolling but `align-items: center` fights it — the flex layout pushes the content to `containerH/2 - contentH/2`, which may be negative, and the browser clamps scroll to 0, so scrolling upward from the snapped position is blocked.

**Fix needed:** Remove `display: flex` centering from the container in home-mode. Instead, centre the `home-section` div using `margin: auto` within a block-flow container. The container should be `overflow: auto` with no flex properties. The `home-section` div should have `min-height: 100%; display: flex; align-items: center; justify-content: center` so it centres the tree when smaller, and expands naturally when larger.

Specifically in `setSubheaderState` home-mode branch:
```js
// Container: block flow, scrollable
this.contentBody.style.display         = '';
this.contentBody.style.alignItems      = '';
this.contentBody.style.justifyContent  = '';
this.contentBody.style.overflow        = 'auto';

// home-section div (set in HomeSectionComponent.render()):
this.element.style.cssText = `
    min-width: 100%;
    min-height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
`;
```

This way, when the tree is small, the flex centering of `home-section` centres it within the full 100% height. When the tree is large, `home-section` grows beyond 100%, the container scrolls normally, and there is no flex-on-container conflict.

---

## 6. Tree Data Sources

| Branch | Source |
|---|---|
| ART | Hardcoded — first-level gallery names only (Physical, Objects, Digital, Render, Book, Photography) |
| TOOLS | `window.ToolsSection.prepareToolsTOCData()` — categories + articles |
| DOCS | Async — placeholder `(LOADING)` replaced on `BlogSection.ensureManifestReady()` + `prepareBlogTreeData()` |
| PROJECTS | `window.ProjectsSection.navigationConfig.structure` |
| CONTACT | Hardcoded — Instagram (external link, `_blank`) + Send message (navigates to `#contact` popup) |
