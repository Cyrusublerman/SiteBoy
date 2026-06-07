# Gallery Folder Convention and Audit

Authoritative spec for the source-folder layout under `reference/images to upload/`,
the manifest shape produced by the processor, and the route shape consumed by
`art_section.js`. Supersedes the implicit convention previously expressed by
`tools/gallery-bundle-processor/bulk_upload.py::GALLERY_MAP`.

This document also records a one-shot folder migration performed on
2026-05-12 and a static audit of `assets/js/shared/masonry-gallery.js`,
`assets/js/sections/art_section.js`, `assets/css/components.css`
(gallery sections), and `tools/gallery-bundle-processor/bulk_upload.py`
against the design-law family of guides.

## 1. Status

| Concern | State |
|---|---|
| Folder rename (legacy → tagged) | DONE — 34 folders (33 + `Toilet`) |
| Convention spec | DONE — §3, §4 below |
| Processor (`bulk_upload.py`) | DONE — tag walker; emits `cards[]`, `_index.json`; no `GALLERY_MAP` |
| Reader (`art_section.js`, `masonry-gallery.js`) | DONE — `cards` switch; registry from `_index.json`; `InlineCarousel` for `-o` |
| Photography manifests | DONE — reader fetches `art/manifests/photos/<set>/manifest.json` (O3) |
| Standards violations (A/B) | DONE — A1, B1–B4, B6, B10 fixed in P1/P2 |
| Standards violations (B7/B8/B9) | DEFERRED — separate PR |
| Standards violations (C-series) | DONE — C1–C8, C5–C6, C7 |
| Standards violations (D-series) | DONE — D1–D4, D6; D5 resolved (InlineCarousel, HIS kept for strip blocks) |

The convention is finalised. Code changes to honour it are scheduled but
not done in this pass.

## 2. Definitions

| Term | Definition |
|---|---|
| **section** | Top-level folder under `reference/images to upload/`. Member of the closed set listed in §5.1. Maps to manifest field `gallery_type` and to URL prefix `#art/{section}/…`. |
| **gallery** | Folder tagged `-g`. Produces a manifest and a route. Direct file children become **cards**. |
| **page** | Folder tagged `-p` inside a gallery. Produces a route under that gallery and renders as a vertical block-stack (`ArtworkPage`). |
| **object** | Folder tagged `-o` inside a gallery. Produces a card on the parent gallery; renders as `InlineCarousel` (card-scale). No own route. |
| **folder** | Folder tagged `-f`. Transparent organisational container. Has no route, no card, no slug contribution. Its children attach to the nearest enclosing gallery. |
| **card** | Element of a gallery's manifest. Discriminated by `type ∈ {image, page, object}`. |
| **block** | Element of a page's manifest. Discriminated by `type ∈ {image, md}`. |
| **slug** | Kebab-case identifier derived from a tagged folder's name (§3.2). Used in routes, manifest keys, and R2 paths. |
| **order prefix** | Optional leading `\d+-` substring on a folder or file name. Determines sort order. Stripped before slug derivation. Does not enter the slug. |
| **F** | Mathematical Foundation unit (`14px` default). All UI dimensions express through F per `design-law.md §4`. |

## 3. Source-folder convention

### 3.1 Tags

Suffix tags label the role of every folder. Every folder under a section
must carry exactly one tag, except those that are explicitly ignored
(leading `_` or `.`).

| Suffix | Role | Owns route? | Cardinal child kinds |
|---|---|---|---|
| `-g` | gallery | yes | `-g`, `-p`, `-o`, `-f`, image files, `_gallery.md` |
| `-p` | page | yes (under parent gallery) | image files, `.md` files, `cover.{ext}` |
| `-o` | object | no (card on parent gallery) | image files, `cover.{ext}` |
| `-f` | folder | no (transparent) | `-g`, `-p`, `-o`, `-f`, image files |
| `_*` / `.*` | ignored | n/a | n/a |
| (none, folder) | **error** | — | the processor must reject the run |
| (none, file) | image or markdown | n/a (interpreted by extension) | n/a |

A `-p` MUST NOT contain folders. A `-o` MUST NOT contain folders or markdown.
A `-f` MUST NOT itself produce a card; it has no representation in the
manifest beyond the contributions of its children.

### 3.2 Slug derivation

Algorithm applied to every tagged folder name:

```
1. Match the regex ^(?:\d+-)?(.+?)-([gpof])$
   - group 1 = raw name
   - group 2 = tag letter
2. If unmatched (untagged folder under a section), abort with error.
3. Lowercase group 1.
4. Replace any run of non-alphanumeric characters with a single '-'.
5. Trim leading and trailing '-'.
6. Collapse repeated '-'.
The result is the slug.
```

Worked cases:

| Folder name | Slug | Note |
|---|---|---|
| `Portraits-g` | `portraits` | |
| `Bear and Girl-g` | `bear-and-girl` | |
| `02-bear-and-girl-p` | `bear-and-girl` | order prefix stripped |
| `400xf-g` | `400xf` | |
| `Stool,-g` | `stool` | non-word char stripped (replaces former trailing-comma special case) |
| `03-three-views-o` | `three-views` | |
| `-g` (empty raw name) | — | error |

Empty group 1 is rejected.

### 3.3 Order

Filesystem order alone is unreliable across OSes. The convention requires
order prefixes for any case where order matters.

| Where | Order prefix used | Effect |
|---|---|---|
| Galleries inside a section | optional | order of cards in the section index, if order is required |
| Cards inside a gallery (files + `-p` + `-o` interleaved) | optional | render order on the masonry page |
| Blocks inside a `-p` (images + `.md` interleaved) | required if more than one block | block order on the artwork page |
| Images inside a `-o` | required if more than one image | order in the carousel |

Padding is per-directory and inferred as `len(str(N))` where `N` is the highest
prefix integer in that directory. Implementations MUST sort by `(prefix:int, name)`
with absent prefix sorting after present prefixes. The prefix never enters the slug,
so renumbering does not change routes.

### 3.4 Nesting rules

Allowed parent → child relationships:

| Parent | Allowed children |
|---|---|
| section root | `-g`, `-f`, `_*`, `.*` |
| `-g` | `-g`, `-p`, `-o`, `-f`, image files, `_gallery.md`, `_*`, `.*` |
| `-p` | image files, `.md` files, `cover.{ext}`, `_*`, `.*` |
| `-o` | image files, `cover.{ext}`, `_*`, `.*` |
| `-f` | `-g`, `-p`, `-o`, `-f`, image files, `_*`, `.*` |

Any other combination is an error and aborts the run.

### 3.5 Reserved file names

| Name | Where | Effect |
|---|---|---|
| `cover.{jpg\|jpeg\|png\|webp}` | inside `-p` or `-o` | becomes the gallery card thumbnail; excluded from blocks/images |
| `_gallery.md` | inside `-g` | optional gallery-level intro markdown (manifest field `intro`) |
| Any name starting with `_` or `.` | anywhere | ignored entirely |

### 3.6 Hoisting (`-f`)

A `-f` is invisible to routing and the manifest topology. Its slug is not
emitted. Its children attach to the nearest enclosing gallery as if the `-f`
were not present, with these scope rules:

| `-f` child kind | Effective behaviour |
|---|---|
| image file | becomes a card on the enclosing gallery; card `id` is composed `f-slug__filename-stem` so collisions across `-f` siblings are avoided |
| `-p` | becomes a page card on the enclosing gallery |
| `-o` | becomes an object card on the enclosing gallery |
| `-g` | becomes a sub-route of the enclosing gallery (the `-f`'s slug does **not** appear in the route) |
| `-f` | recursive hoisting; composite ids accumulate via `__` |

Use `-f` only to preserve current "recursive crawl" semantics for legacy
sub-folders (e.g. `digital/Experiments-g/AI-f`, `digital/Posters-g/MUST-f`).

### 3.7 Worked example

```
reference/images to upload/
└── digital/
    └── 01-Portraits-g/
        ├── 01-warm-up.jpg                    → image card
        ├── 02-bear-and-girl-p/               → page card (own route)
        │   ├── cover.jpg                     (thumbnail; excluded from blocks)
        │   ├── 01-intro.md                   → block 1 (md)
        │   ├── 02-front.jpg                  → block 2 (image)
        │   └── 03-detail.jpg                 → block 3 (image)
        ├── 03-three-views-o/                 → object card (no route)
        │   ├── 01-front.jpg
        │   ├── 02-side.jpg
        │   └── 03-back.jpg
        └── 04-cool-down.jpg                  → image card
```

Routes produced: `digital/portraits`, `digital/portraits/bear-and-girl`.
Cards on `digital/portraits`: `[image:warm-up, page:bear-and-girl, object:three-views, image:cool-down]`.
Blocks on `digital/portraits/bear-and-girl`: `[md, image, image]`.

## 4. Manifest output

One manifest per gallery (`-g`), at
`art/manifests/{section}/{cumulative-gallery-slug}/manifest.json`.
Cumulative slug is the parent gallery's slug joined to the child's slug
via `/` (e.g. `physical/small/400xf`); `-f` does not contribute.

### 4.1 Per-gallery manifest

```jsonc
{
  "gallery_type":  "<section>",
  "gallery_slug":  "<cumulative-slug>",
  "base_url":      "https://media.einoder.net/art/<section>/<cumulative-slug>",
  "generated_at":  "<ISO-8601 UTC>",
  "intro":         null | "<markdown text from _gallery.md>",
  "cards":         [ <card> ... ],
  "total_images":  <int>   // derived image count; no flat images[] array
}
```

### 4.2 Card variants

```jsonc
// type=image
{
  "type":  "image",
  "id":    "<file-stem-or-composite-stem>",
  "urls":  { "thumb": "...", "web": "...", "zoom": "..." }
}

// type=page
{
  "type":  "page",
  "id":    "<page-slug>",
  "cover": { "thumb": "...", "web": "..." },
  "blocks": [ <block> ... ]
}

// type=object
{
  "type":  "object",
  "id":    "<object-slug>",
  "cover": { "thumb": "...", "web": "..." },
  "images": [
    { "id": "<stem>", "urls": { "thumb": "...", "web": "...", "zoom": "..." } }
  ]
}
```

### 4.3 Block variants (inside `card.blocks`)

```jsonc
// type=image
{ "type": "image", "id": "<stem>", "urls": { "thumb": "...", "web": "...", "zoom": "..." } }

// type=md
{ "type": "md", "text": "<markdown text>" }
```

Unknown block types MUST be tolerated by the reader and silently skipped
(forward-compat; `masonry-gallery.js::ArtworkPage` already does this).

## 5. Sections and routes

### 5.1 Section list

The section set is closed and hard-coded. As of this writing, on-disk:

```
{ book, digital, objects, physical, render }
```

`photos/` manifests serve the `photography` route (reader-only; O3). On-disk
`reference/images to upload/photos/` migration deferred. Section name on disk
MUST equal `gallery_type` in manifests for art sections.

### 5.2 Route construction

```
gallery route   →  #art/{section}/{cumulative-gallery-slug}
page route      →  #art/{section}/{cumulative-gallery-slug}/{page-slug}
object          →  no route (rendered inline as a card)
```

`-f` does not contribute to the cumulative slug. `cumulative-gallery-slug`
is the `/`-joined chain of `-g` slugs from section root to the gallery,
skipping any `-f` levels in between.

## 6. Migration log (2026-05-12)

The following renames were applied under `reference/images to upload/`,
deepest-first (33 entries) plus one trailing `Toilet` rename:

```
physical/Small/400xf            → physical/Small/400xf-g
physical/Small/Casual           → physical/Small/Casual-g
physical/Small/Plastic          → physical/Small/Plastic-g
digital/Experiments/AI          → digital/Experiments/AI-f
digital/Posters/MUST            → digital/Posters/MUST-f
book/Notebook 1                 → book/Notebook 1-g
digital/Bear and Girl           → digital/Bear and Girl-g
digital/Chopped                 → digital/Chopped-g
digital/Experiments             → digital/Experiments-g
digital/Low Effort              → digital/Low Effort-g
digital/MONSTERS                → digital/MONSTERS-g
digital/Must                    → digital/Must-g
digital/Pieces                  → digital/Pieces-g
digital/Portraits               → digital/Portraits-g
digital/Posters                 → digital/Posters-g
digital/ROUGH                   → digital/ROUGH-g
digital/Simple1                 → digital/Simple1-g
digital/Uncertain               → digital/Uncertain-g
digital/Women and Horses        → digital/Women and Horses-g
Objects/guitar1                 → Objects/guitar1-g
Objects/Guitar Small            → Objects/Guitar Small-g
Objects/Plates                  → Objects/Plates-g
physical/Collages               → physical/Collages-g
physical/Large                  → physical/Large-g
physical/Medium                 → physical/Medium-g
physical/Primaries              → physical/Primaries-g
physical/Small                  → physical/Small-g
Render/Eternal Ascent           → Render/Eternal Ascent-g
Render/lady on Field            → Render/lady on Field-g
Render/Objects                  → Render/Objects-g
Render/Stool,                   → Render/Stool-g          (trailing-comma fix)
Objects                         → objects                 (case-only)
Render                          → render                  (case-only)
render/Toilet                   → render/Toilet-g         (post-pass)
```

Decisions:

| Decision | Rationale |
|---|---|
| `digital/Experiments/AI` and `digital/Posters/MUST` tagged `-f` (not `-g`) | Preserves current behaviour: under `direct_only=False` recursion, those subfolders' images are merged into the parent gallery's flat list. Tagging `-g` would split them into new routes and remove the images from their current galleries. Reversible: rename `-f` → `-g` per folder when separate routes are wanted. |
| `Objects` and `Render` lowercased | Other sections were already lowercase; manifest `gallery_type` was already lowercase; folder casing now matches. |
| `Render/Stool,` → `Stool-g` | Slug derivation handles the missing comma automatically (kebab-case strips non-word). The legacy `bulk_upload.py` comment about "Stool, → stool" can be removed. |
| `digital/AI` and `Render/Toilet` not renamed in pass 1 | `digital/AI` not present on disk; `Render/Toilet` was missed by the pre-pass scan (contained `.png` + `.mkv`) and renamed in a follow-up. |

## 7. Audit findings

Static review of the gallery code path against `design-law.md`,
`border-system.md`, `semiotics.md`, `text-treatment.md`,
`component-patterns.md`, `coding-standards.md`, and `.cursor/rules/rules.mdc`.

Severity classes:

- **A — security/correctness**: must fix before next deploy.
- **B — standards violation**: documented rule, code in clear breach.
- **C — convention adoption**: required to honour §3–§5.
- **D — cosmetic / dead code**: low-impact, fix opportunistically.

### 7.1 Class A — security / correctness

| ID | Location | Finding |
|---|---|---|
| A1 | `tools/gallery-bundle-processor/bulk_upload.py:38–44` | Hardcoded R2 access key id and secret in source as defaults to `os.getenv`. The defaults will be used when env vars are absent. Secrets MUST come from env only; defaults MUST be removed. |
| A2 | `art_section.js:891–931` | `getPhotographyImages` keys (`Life1`, `Life2`, `Morocco`, …) are mixed-case. Lookups use `cap = key.charAt(0).toUpperCase() + key.slice(1)` which produces `Life1` from `life1` but yields no entry for hypothetical `life-1` or kebab inputs. Single source of truth for photography data is required (manifest, not JS array). |
| A3 | `art_section.js:258–265` `_isArtworkRoute` | Hard-coded `physical/small` 4-segment exception. Any future deeper gallery (e.g. another sub-gallery) breaks the discriminator. Route depth must be derived from registered routes, not coded. |

### 7.2 Class B — standards violations

| ID | Location | Rule | Finding |
|---|---|---|---|
| B1 | `masonry-gallery.js:123` | text-treatment §1 (UPPERCASE in controls), design-law §14.4 (deterministic loading text) | `_loadingEl.textContent = 'loading'`. Required: UPPERCASE deterministic state label, e.g. `'LOADING'` or `'LOADING…'`. |
| B2 | `masonry-gallery.js:192` | text-treatment §1, design-law §14.3 (error visually distinct, accent token) | `_loadingEl.textContent = 'failed to load'`. Required: `'FAILED TO LOAD'`; colour `var(--c-accent)` per error rule. |
| B3 | `masonry-gallery.js:96–110` | semiotics §5 (canonical glyph DOM), design-law §15.1 (state vs action position) | `← PREV`, `NEXT →`, `CLOSE ×`, `MODE FIT/FILL/ACTUAL` are set via single-string `textContent`. Canonical pattern is two `<span>`s (label + glyph). The exception in semiotics §5 covers leading state-glyphs (`▸`/`▾`); it does not cover trailing action glyphs (`→`, `×`). |
| B4 | `masonry-gallery.js:542` | text-treatment §1 (font-family stack) | `font-family: 'Atkinson Hyperlegible Mono', monospace`. Required: full stack `'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace`. Same omission appears in `art_section.js:709` and `art_section.js:862`. |
| B5 | `masonry-gallery.js:444–454` | doc-comment vs code | Block comment claims `4:3 aspect ratio`; code at `:511` sets `aspect-ratio: 1 / 1`. Reconcile (update comment or code). |
| B6 | `masonry-gallery.js:543` | text-treatment §2 (table) | `image-grid-card-label` uses `font-size: ${F}px`. The label is a name+count row analogous to a list-item label; canonical size is `F × 0.75`. If the larger size is intentional, document the row as a "block-title-class" item; otherwise reduce. |
| B7 | `art_section.js:573, 707, 860, 989, 1003, 1066` | rules.mdc (no `document.*` outside BaseComponent) | Direct `document.createElement` and `style.cssText` assignments outside any BaseComponent. `art_section` is a route handler module, not a component, but the standards expect such DOM construction to live in a component or use ComponentLibrary. Convert wrapper-building helpers to a small `ArtSectionWrap` BaseComponent or move into ComponentLibrary. |
| B8 | `art_section.js:1009` | coding-standards (no ad-hoc timing) | `setTimeout(0)` to defer measurement until after layout. Replace with `ResizeObserver` (already in use elsewhere in this file) or `requestAnimationFrame` (single-shot for measurement is permitted; `setTimeout(0)` is not). |
| B9 | `masonry-gallery.js:859, 982` | rules.mdc (animations via AnimationFoundation) | Single-shot `requestAnimationFrame(applyImgCap)` is used for layout measurement (permitted) but the `transition: 'transform 0.2s ease-out'` at `:859` is a CSS animation expressed via inline string. Move to a CSS class or, if state-driven, use `AnimationFoundation`. |
| B10 | `art_section.js:709, 862` empty-state | design-law §14.2 (empty state has affordance) | Empty-state element `'No images yet.'` is sentence case (text-treatment violation: should be UPPERCASE per controls table) and exposes no affordance. Required: `NO IMAGES YET` plus a back link or upload affordance. |

### 7.3 Class C — convention adoption (required to honour §3–§5)

| ID | Location | Action |
|---|---|---|
| C1 | `bulk_upload.py:53–97` | Delete `GALLERY_MAP` and `NUMERIC_SORT_GALLERIES`. Implement a recursive walker keyed on the section list (§5.1) and the tag regex (§3.2). Reject untagged folders. |
| C2 | `bulk_upload.py:158–186` | Replace `collect_images` and `safe_stem` with a tag-aware traversal that classifies every entry as image / `-g` / `-p` / `-o` / `-f` / ignored; produces card and block lists per §4. |
| C3 | `bulk_upload.py:221–305` | Replace `build_manifest` and `process_gallery` with a per-gallery emitter that writes `cards` (§4.2) and a derived flat `images` array for backward compatibility, plus `intro` from `_gallery.md` if present. |
| C4 | `bulk_upload.py:99–101` | Replace `NUMERIC_SORT_GALLERIES` with §3.3 generic order-prefix detection. Galleries that are not numerically prefixed sort by `(prefix:int, name)` exactly the same way; the `book/notebook-1` case becomes a regular case under `nnn-` padding. |
| C5 | `art_section.js:82–160` | Drop the in-source `galleryStructure`. Build the index, section indices, and `_galleryTitle` lookups from manifests at runtime (or from a generated index manifest). Eliminates the duplicate source of truth. |
| C6 | `art_section.js:28–79` | Drop the in-source `pages` array. Generate the route registry at runtime from the manifest tree. |
| C7 | `art_section.js:891–951` | Migrate photography to a manifest under `reference/images to upload/photos/` (or keep the legacy R2 layout but read from `art/manifests/photos/<set>/manifest.json` instead of hard-coded arrays). Remove `getPhotographyImages` from the JS once a manifest exists. |
| C8 | `masonry-gallery.js`, `art_section.js` | Update reader path: switch on `card.type` (`image | page | object`). Keep the existing `image.page` and `groups` handling as legacy fallbacks until C3 lands and all manifests are regenerated. |
| C9 | `r2-url-helper.js` | Reconcile `photography` (section key in JS) vs `photos` (R2 type and intended folder name). Pick one; recommended: rename section to `photos` once C7 lands. |

### 7.4 Class D — cosmetic / dead code

| ID | Location | Note |
|---|---|---|
| D1 | `bulk_upload.py:75, 87` | Comment about Stool trailing-comma is now stale — fixed by §6 rename. |
| D2 | `bulk_upload.py:55` `digital/AI` | Source path absent on disk. Remove from any future allowlist. |
| D3 | `bulk_upload.py:92` `Render/Toilet` | Path was thought missing during the rename pre-pass; folder exists with one image and one `.mkv`. The `.mkv` is filtered by `IMAGE_EXTS` and is harmless, but consider an explicit warning when non-image files are encountered inside a `-g`. |
| D4 | `art_section.js:75–78` `#art/photography/all` | "View all" route exists for photography but `_appendViewAllButton` is never called from `renderPhotographyIndex`; only present in `renderSectionIndex`. Either wire it up or remove the route. |
| D5 | `masonry-gallery.js:789–1012` `HorizontalImageStrip` | "Reserved for future use" per its own header. With `-o` cards introduced (§3.1) this is the natural rendering target. Wire `-o` cards through `HorizontalImageStrip` (or successor) when C8 lands. |
| D6 | `assets/css/components.css:457–463` | Mobile breakpoint `max-width: 1023px` reduces button width to `5F`. Action cells in the same toolbar share equal width; on a single viewport they all become `5F`, which is consistent. Document the breakpoint as the landscape/portrait pivot per design-law §17.2 to make it explicit. |

## 8. Recommended action order

Ordered by dependency, not by severity. Each item presupposes the previous.

1. **A1** — strip R2 secrets from `bulk_upload.py`. Independent of all other work.
2. **B1, B2, B3, B4, B6, B10** — surface-level lightbox and gallery copy/structure fixes inside `masonry-gallery.js` and `art_section.js`. Independent. Small diffs.
3. **B7, B8, B9** — DOM/animation hygiene in `art_section.js` and `masonry-gallery.js`. Self-contained.
4. **C1, C2, C3, C4** — rewrite `bulk_upload.py` walker to honour §3–§4 and emit the new manifest shape. Keep legacy `images` array in output for compatibility.
5. **C8** — extend `masonry-gallery.js` and `art_section.js` reader to consume `cards` (with `image | page | object` discrimination); keep legacy `image.page`/`groups` paths.
6. **C5, C6** — drop in-source `galleryStructure` and `pages`; derive from manifests.
7. **C7, C9** — migrate photography to manifest; reconcile section name.
8. **D1, D2, D3, D5** — opportunistic cleanups.
9. **D4** — decide whether to keep `photography/all` or remove the route.
10. **D6** — annotate the breakpoint in CSS.

A1 (security) and B1–B4 (text correctness) are cheap and should ship first.
C1–C8 form the bulk of the convention adoption; they are best done as a
single self-contained PR because the manifest schema change is read by
both the writer and the reader.

## 9. Open decisions

The following are not specified by this document and require a user decision
before implementation proceeds beyond §8 step 4.

| ID | Decision |
|---|---|
| O1 | **RESOLVED** — `AI-f`/`MUST-f` renamed to `AI-p`/`MUST-p`; page routes `digital/experiments/ai`, `digital/posters/must`. |
| O2 | **RESOLVED** — `note_NNN.png` → `NNN.png`; ids `000`..`125` (cache break accepted). |
| O3 | **RESOLVED** — reader-only via `art/manifests/photos/<set>/manifest.json`; no source migration yet. |
| O4 | **RESOLVED** — `InlineCarousel` in `specialized.js`; `HorizontalImageStrip` kept for `{type:'strip'}` page blocks. |
| O5 | **RESOLVED** — inline carousel on card; lightbox on inner image click (scoped to object images). |
| O6 | **RESOLVED** — `card.blocks[]` infinite md+image; document flow (no per-block borders); `intro` above masonry. |

**Id-compat decision:** image-file card `id`s preserve legacy `safe_stem` (spaces→`_`, case kept). Only folder slugs are kebab-cased. `book/notebook-1` ids change (`note_NNN`→`NNN`).

End of document.
