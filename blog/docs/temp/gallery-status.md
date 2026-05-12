# Art Gallery Redesign — Status Doc

**Date:** 14 Apr 2026  
**Repo:** `c:\Users\Einod\Documents\GitHub\New folder`  
**Related chat:** [Art Gallery Redesign](7829289c-453a-44e6-bb55-0eea3c12f891)

---

## 0. Update — 30 Apr 2026 (project-as-folder + viewer chrome)

**Resolved**
- **Image-as-folder (data):** `manifest.json` may declare `groups[]`. Each entry: `{ id, title?, cover?, text?, images: [id | { id, size }] }`. Flat `images[]` retained for lookup. No `groups` → one implicit group `id: "default"` (legacy: viewer opens direct, no index grid).
- **Image-as-folder (`art_section.js`):** `cover` resolves to card thumb; per-image `size` ∈ `full|half|double` passed through to viewer. Open-viewer-direct only when `groups.length === 1 && groups[0].id === "default"`. Example manifest: `art/manifests/render/lady-on-field/manifest.json`.
- **Viewer chrome:** `body.viewer-mode` + `PageContainer.setSubheaderState` branch (same framed band as `home-mode`). `gallery:viewer-open` adds class + `setSubheaderState(false)`; close removes. Removes re-show race (no `_setupSubheaderGallery` after direct viewer open).
- **GalleryViewer:** Nav height `var(--header-height)`; inactive sibling cells hidden (no bare arrows). Slots: row+wrap for `half`; `MarkdownBody` for `project.text`. Dedup/strip/CSS: see `masonry-gallery.js`, `styles.css`.

**Authoring (source, future generator):** `Pg_*` folders under `reference/images to upload/...`; optional `page.json` + `.md` — schema as in plan; generator script deferred.

**Still open:** Bug 1 overflow, Bug 4 `renderAllForSection` MasonryGallery, generator script.

---

## 1. What was built (completed)

### Archive
`blog/docs/archive/gallery-pre-redesign/` contains verbatim copies of:
- `masonry-gallery.js` — old gallery components
- `art_section.js` — old section orchestrator
- `toc-gallery.js` — extracted TOCGallery class

### New components in `assets/js/shared/masonry-gallery.js`

#### `ImageGrid` (exported)
2-column CSS grid. Each card: 4-sided `1px solid var(--c-border)`, `F/2` padding, 4:3 cropped preview image (lazy-loaded via IntersectionObserver, `rootMargin: 200px`), `F/2` spacer, label row `NAME | COUNT` (`F×0.75`, UPPERCASE), `F/2` bottom gap. Hover: border→`var(--c-text)`, image opacity 0.85. Orphan last card spans full width. Collapses to 1-col at ≤768px.

#### `GalleryViewer` (exported)
In-container scrollable image viewer. Nav bar (2F height, `border-bottom`): PREV | TITLE | NEXT | CLOSE. Image stack with `F` margin L/R, `border-top` between images (shared boundary), no captions. Lazy-loads via IntersectionObserver (`rootMargin: 400px`). Click image → opens `GalleryLightbox` (zoom/pan). Card-expand animation via `clip-path` inset→0, 150ms ease-out. Dispatches `gallery:viewer-open` / `gallery:viewer-close` CustomEvents. Arrow keys navigate siblings, Escape closes.

#### Preserved (untouched)
- `GalleryLightbox` — full-screen zoom/pan, pinch, swipe, keyboard nav
- `MasonryGallery` — legacy masonry layout (still used by `renderAllForSection`)

### `assets/js/sections/art_section.js` — rewritten methods

| Method | Now does |
|---|---|
| `renderArtIndex` | `ImageGrid` of 6 top-level category cards |
| `renderSectionIndex` | `ImageGrid` of subsection cards |
| `renderMasonryGallery` | `_renderImageGallery` → `ImageGrid` of image cards → click opens `GalleryViewer` |
| `renderScrollGallery` | Same as above |
| `renderPhotographyIndex` | `ImageGrid` of photography series cards |
| `renderPhotographyGallery` | `ImageGrid` of image cards → click opens `GalleryViewer` |
| `init` | Wires `gallery:viewer-open/close` listeners to hide/restore site header |

### CSS `assets/css/styles.css`
Added: `.image-grid`, `.image-grid-card`, `.image-grid-card-img`, `.image-grid-card-label`, `.image-grid-card-name`, `.image-grid-card-count`, `.gallery-viewer`, `.gallery-viewer-nav`, `.gallery-viewer-title`, `.gallery-viewer-stack`, `.gallery-viewer-image-block`, `.gallery-viewer-footer`.  
Removed: `.masonry-gallery`, `.masonry-gallery__grid`, `.masonry-item*`, `.toc-gallery*` blocks.

### `assets/js/shared/component-library.js`
- Added `ImageGrid`, `GalleryViewer` to import, registry (`'image-grid'`, `'gallery-viewer'`), `ComponentLibrary.*` properties, and named exports.
- Removed `TOCGallery` from import, registry, property, and named export.

### `assets/js/shared/content.js`
- `TOCGallery` class de-exported (made non-export class, not deleted, kept for reference).

---

## 2. Known bugs / issues to fix

### Bug 1 — Card overflow / horizontal scroll (UNFIXED)
**Symptom:** Cards overflow the content container horizontally; the grid does not constrain to its parent width.  
**Cause:** `ImageGrid` outer element and `.image-grid-card` elements are missing `min-width: 0`. In CSS grid, children default to `min-width: auto` which allows them to grow past their column track. The wrapper `div` in `art_section.js` has `padding:${F}px` but no explicit `width: 100%` or `overflow: hidden`.  
**Fix needed:** In `ImageGrid.render()` add `min-width: 0` to the grid element. In `_createCard` add `min-width: 0` to the card. In `art_section.js` wrapper divs add `width: 100%` and `overflow: hidden`.

### Bug 2 — Duplicate images in viewer (UNFIXED)
**Symptom:** The same image appears multiple times in the `GalleryViewer` stack.  
**Cause:** `_manifestImages` maps every entry in `manifest.images` directly. If a manifest has duplicate entries (e.g. from multiple upload runs), they all pass through. No deduplication by `id` or `src`.  
**Fix needed:** In `_manifestImages`, deduplicate by `img.id` before mapping: `const seen = new Set(); images.filter(img => !seen.has(img.id) && seen.add(img.id))`.

### Bug 3 — Wrong interaction model at deepest level (UNFIXED — needs design decision)
**Current behaviour:** `#art/physical/large` → `ImageGrid` of one card per image → clicking a card opens `GalleryViewer` showing only that one image.  
**Wanted:** `#art/physical/large` should show a card grid where the card represents the entire gallery. Clicking opens `GalleryViewer` with all images in that gallery, scrolled to the clicked one (or just opening from the top). The user should scroll through all images of one gallery together.  
**Related:** The current model creates as many cards as there are images — for a gallery of 126 images (notebook-1) this is 126 tiny cards which is nonsensical.

### Bug 4 — `renderAllForSection` still uses old `MasonryGallery` (UNFIXED)
**Location:** `art_section.js` line 491.  
**Fix needed:** Replace with `GalleryViewer` showing all combined images (same pattern as `_renderImageGallery`).

### Bug 5 — Images not capped to content container size (UNFIXED)
**User requirement:** "we should never have as default an image larger in any dimensions than the content container."  
**Current behaviour:** `GalleryViewer` image elements have `width: 100%; height: auto` — images respect container width but if an image is taller than the viewport (e.g. a tall portrait), it will be taller than the container with no cap.  
**Fix needed:** In `GalleryViewer._buildImageStack`, images must have `max-width: 100%` and `max-height: calc(100vh - ${F * 2}px)` (viewport minus nav bar) so they never overflow in either dimension. With horizontal scroll layout (Decision B), each image slot is exactly one container width wide and viewport-height tall — images fit within that slot via `object-fit: contain`.

### Bug 6 — `requestAnimationFrame` in `GalleryViewer._buildImageStack` (UNFIXED)
**Location:** `masonry-gallery.js` line 795.  
**Issue:** Workspace rules prohibit `requestAnimationFrame` outside `AnimationFoundation`. Used to defer `IntersectionObserver` setup — not an animation loop but violates the literal rule.  
**Fix:** Reorganise so observer setup happens after the caller appends the element to DOM, or use `setTimeout(fn, 0)`.

---

## 3. Pending design decisions (awaiting user answer)

### Decision A — Gallery page model (deepest level)
**User requirement (confirmed):** Navigating to a leaf gallery (e.g. `#art/physical/large`) must open a viewer showing all images in that gallery. The user navigates between images within the gallery, not between individual image cards. The current behaviour — one card per image, each opening a single-image viewer — is wrong.  
**Proposed resolution:** Leaf galleries (no subsections in `galleryStructure`) skip the `ImageGrid` entirely and go directly to `GalleryViewer` with all images loaded. Section indexes (have subsections) continue to show `ImageGrid` of subsection cards. This affects `_renderImageGallery` and `renderPhotographyGallery`.

### Decision B — Horizontal scroll within viewer
**User requirement (confirmed):** "scroll horizontally between the images of that gallery" — images within a single gallery are navigated left/right (horizontal), not scrolled vertically. This means `GalleryViewer` needs a horizontal layout: images in a full-width horizontal strip, one image visible at a time (or a few), user swipes or uses arrow keys to move between them.  
**This is distinct from** the PREV/NEXT section navigation in the nav bar (which switches between sibling galleries, e.g. LARGE ↔ MEDIUM) — that remains.  
**Implementation impact:** `GalleryViewer._buildImageStack` must change from vertical `flex-direction: column` to a horizontal snap-scroll or swipe carousel. The existing `GalleryLightbox` swipe/keyboard logic may be reusable. Images in the strip should be constrained to container width and viewport height (see also: image size cap requirement below).

### Decision C — Image sizing system
Q: "we need to develop some sort of way of setting which images are to be shown larger or smaller — double sized or something"  
**Proposed approach:** Add optional `size` field to entries in `manifest.json` per gallery:
```json
{ "id": "001.jpg", "size": "full" }     // default: constrained to container width
{ "id": "002.jpg", "size": "double" }   // 2× logical width (scrolls horizontally in viewer)
{ "id": "003.jpg", "size": "half" }     // 50% width; two images sit side-by-side
```
This requires: (1) the manifest schema to support `size`, (2) `GalleryViewer._buildImageStack` to read `imageData.size` and apply width accordingly, (3) the image upload/manifest generation script to support setting `size`.  
**User has not confirmed this approach.**

### Decision D — Image groups
Q: "a way of having images (and maybe some text) grouped so that they are a single page"  
**Proposed approach:** Add `groups` array to `manifest.json` alongside `images`:
```json
{
  "images": [...],
  "groups": [
    { "ids": ["001.jpg", "002.jpg"], "text": "Caption for the pair", "layout": "side-by-side" },
    { "ids": ["003.jpg"], "text": null, "layout": "full" }
  ]
}
```
Each group renders as one visual block in `GalleryViewer`. Within a group, images can be side-by-side or stacked. Optional `text` appears below the group.  
**User has not confirmed this approach.**

### Decision E — Subheader redesign
**User request:** "edit the subheader so that the dropdown is halved in size and in place of the right half is a button to go up one level"  
**Current structure:** Subheader is split 50/50 (computed in `config.js` as `subheaderTitleWidth` = 50% of frame). Left half = dropdown trigger. Right half = PREV/NEXT buttons.  
**Wanted structure:** Left 50% = dropdown (unchanged). Right 50% = single `UP ↑` button that navigates one level up in the URL hierarchy (e.g. from `#art/physical/large` → `#art/physical`, from `#art/physical` → `#art`).  
**Files to edit:** `assets/js/shared/layout.js` (Subheader class, `render` and `setDropdownContent` methods) + `assets/js/sections/art_section.js` (`_setupSubheader`, `_setupSubheaderGallery`) to pass `onUpClick` callback.

---

## 4. Guide compliance violations (identified, not yet fixed)

From review against `border-system.md`, `text-treatment.md`, `semiotics.md`, `design-law.md`:

| # | File | Rule violated | Details |
|---|------|---------------|---------|
| 1 | `masonry-gallery.js` GalleryViewer `_buildNavBar` | border-system §4, §6 | PREV cell sets `border-right`; TITLE/NEXT/CLOSE cells also set `border-left` — double border on the shared edge when both exist. Fix: remove `border-right` from PREV; keep only `border-left` on cells to its right. |
| 2 | `masonry-gallery.js` ImageGrid `_createCard` | component-patterns §3.5 | `margin-left` used on `countEl` for spacing. Fix: use `padding-left` or `gap` on the flex label container. |
| 3 | `masonry-gallery.js` both classes | design-law §5.1 / text-treatment §1 | Font family declared as `'Atkinson Hyperlegible Mono', monospace` — missing `'Atkinson Hyperlegible'` as first preference. Canonical: `'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace`. |
| 4 | `masonry-gallery.js` GalleryViewer `_buildNavBar` | semiotics §2 | Uses `‹` / `›` (U+2039/203A) for PREV/NEXT. Catalogue specifies `←` for navigate-previous, `→` for navigate-next, with full labels `← PREV-LABEL` / `NEXT-LABEL →`. |
| 5 | `masonry-gallery.js` GalleryViewer `_buildNavBar` | semiotics §2 | CLOSE button missing `×` glyph. Should be `CLOSE ×`. |
| 6 | `masonry-gallery.js` GalleryViewer `_navCell` | semiotics §5 | Glyph+label concatenated into `cell.textContent`. Prohibited Pattern A. Fix: separate `<span>` for glyph and `<span>` for label text. |
| 7 | `masonry-gallery.js` GalleryViewer `_buildImageStack` | workspace rules | `requestAnimationFrame` used outside `AnimationFoundation`. |

---

## 5. Architecture / data flow reference

```
URL hash:  #art → #art/physical → #art/physical/large
             ↓           ↓                ↓
render:  renderArtIndex  renderSectionIndex  _renderImageGallery
component: ImageGrid      ImageGrid           ImageGrid (currently; should be direct viewer)
on click:  navigate       navigate            opens GalleryViewer
```

### Manifest structure (R2 + local)
- Location: `/art/manifests/{galleryType}/{galleryName}/manifest.json`
- Fetched via `R2Helper.fetchManifest(galleryType, galleryName)`
- Current schema:
```json
{
  "images": [
    { "id": "filename.jpg", "urls": { "thumb": "...", "web": "...", "zoom": "..." } }
  ]
}
```
- Proposed additions: `size` field per image, `groups` array at top level.

### Key files
| File | Role |
|------|------|
| `assets/js/shared/masonry-gallery.js` | `ImageGrid`, `GalleryViewer`, `GalleryLightbox`, `MasonryGallery` |
| `assets/js/sections/art_section.js` | Section orchestrator — routing, render methods, gallery structure data |
| `assets/js/shared/layout.js` | `Subheader` class (lines 1321–2044), `PageHeader`, `PageContainer` |
| `assets/js/core/config.js` | `computeLayout()` — `subheaderTitleWidth` = 50% of frame, line 235 |
| `assets/js/shared/r2-url-helper.js` | `fetchManifest()`, `getGalleryUrlSet()`, `getPhotoUrlSet()` |
| `assets/js/shared/component-library.js` | Central registry — all components exported here |
| `assets/css/styles.css` | All styling — `.image-grid*`, `.gallery-viewer*` blocks added |
| `blog/docs/archive/gallery-pre-redesign/` | Pre-redesign snapshots for rollback |

### F-system
`F = 14px`. All spacing and sizing must derive from `F`, `F/2`, or integer multiples. Only non-F value allowed is `1px` for borders.

### Colour tokens (UI only — no raw hex/rgb)
`var(--c-bg)`, `var(--c-text)`, `var(--c-border)`, `var(--c-accent)`

---

## 6. Next actions (priority order)

1. Fix Bug 1 (card overflow) — `min-width: 0` on grid and cards, `width: 100%` on wrappers.
2. Fix Bug 2 (duplicate images) — dedup by `id` in `_manifestImages`.
3. Fix Bug 5 (image size cap) — `max-width: 100%; max-height: calc(100vh - 2F)` on viewer images.
4. Implement Decision A (gallery page model) — leaf galleries go directly to `GalleryViewer`, no intermediate image card grid.
5. Implement Decision B (horizontal scroll viewer) — rework `GalleryViewer._buildImageStack` as horizontal snap-scroll strip; reuse swipe/keyboard logic from `GalleryLightbox`.
6. Fix Bug 4 (`renderAllForSection` still uses `MasonryGallery`) — replace with `GalleryViewer`.
7. Implement Decision E (subheader UP button) — edit `layout.js` Subheader render and `setDropdownContent`; pass `onUpClick` from `art_section.js` subheader helpers.
8. Fix guide violations (table in §4) — all in `masonry-gallery.js`: double border, margin→padding, font family, glyphs, DOM structure, RAF.
9. Implement Decision C (image sizing) — add `size` field to manifest schema + `GalleryViewer` rendering.
10. Implement Decision D (image groups) — add `groups` array to manifest schema + `GalleryViewer` group rendering.
