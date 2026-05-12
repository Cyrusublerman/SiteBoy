# Homepage UX/UI Analysis

Current homepage assessment, brutalist/minimalist design integration, and research agenda.

Authority: `design-law.md`, `ui-interface-overview.md §1, §4.4`.

---

## 1. Current Homepage: What It Is

The homepage (`HomeSection` v5.0.0) renders a full-viewport `AsciiNavScene`: a monospace character grid filling the content area with three words — **ART**, **TOOLS**, **BLOG** — stamped as bitmap letters into sparse ASCII noise. Hovering a word reveals its characters; clicking navigates to that section.

Not JSON-driven. Not list-first. Not partition-based. The homepage is an ambient animation with three hotspots.

---

## 2. Assessment Against Design Law

### 2.1 What Works

| Aspect | Assessment |
| --- | --- |
| Typeface | Atkinson Hyperlegible Mono — compliant (§5.1) |
| Colour | `var(--c-text)` on `var(--c-bg)` — compliant (§6.1) |
| Retro register | ASCII grid + bitmap font + noise field = strong VGA/terminal aesthetic |
| No prohibited decoration | No gradients, shadows, rounded corners, glow |
| F-based sizing | Cell dimensions derived from F (§4.1 compliant) |
| Identity signal | Immediately communicates "this is not a standard website" |

### 2.2 What Fails

| Aspect | Violation | Law |
| --- | --- | --- |
| PCS identity | Page has no PCS. Three words float in a noise field. Nothing dominates; nothing is subordinate. | §7 / §2.6 |
| Partition structure | The scene is one undifferentiated rectangle. No subdivision, no shared boundaries, no hierarchy. | §2.2, §3.1 |
| Informative minimalism | The noise characters serve no informational purpose — pure atmosphere. | §2.8 |
| Floating prohibition | The three words read as floating elements placed on a surface, not partitions cut from it. | §3.3 |
| State coverage | No uninitiated/loading/error states. If `AsciiNavScene` fails to compute layout, the user sees a void. | §14.2 |
| Discoverability | Three unlabelled words with no description or affordance signifier. A user unfamiliar with the site has no information about what "ART", "TOOLS", or "BLOG" contain. | §13.2 |
| Content density | Zero. The page communicates three navigation targets and nothing else. The site has 20+ tools, a full doc tree, art galleries — none visible. | §2.8 |
| Touch targets | Word hover reveal is mouse-dependent. No touch equivalent. Mobile users see static noise blocks with no interaction cue. | §5.4 |
| Page archetype mismatch | `ui-interface-overview.md §1` defines four archetypes. The homepage is none of them. It is closest to a "TOC page" (list-first) but contains no list. | §1 |

### 2.3 Summary Verdict

The homepage is a tech demo, not a navigation surface. It prioritises atmosphere over structure and novelty over utility. The ASCII noise effect is visually distinctive but functionally equivalent to a splash screen with three links.

---

## 3. What the Homepage Should Be

Per design-law §7.6: **TOC pages are list-first.** The homepage is the root TOC of the entire site. Its PCS should be a structured listing of the site's content, organised by section, with enough information to orient a new visitor and enough density to reward a returning one.

### 3.1 Required Properties (from Law)

1. **One PCS** — the site TOC listing. (§2.6)
2. **Partition structure** — subdivided rectangle, shared boundaries, no floats. (§2.2, §3.1, §3.3)
3. **Informative minimalism** — every element exposes content, signals state, or enables action. (§2.8)
4. **F-based geometry** — all dimensions from F. (§4.1)
5. **State coverage** — uninitiated, loading, active. (§14)
6. **Touch-safe** — minimum 3F×2F targets at portrait. (§5.4)
7. **Responsive** — portrait reflow, compact collapse. (§5.1)

### 3.2 Available TOC Components

| Component | Strengths | Fit |
| --- | --- | --- |
| `TreeTOC` | Horizontal tree with SVG connectors; collapses; handles arbitrary depth. Already used on Tools and Blog index pages. | Strong — unifies with existing section indexes |
| `NumberedTOC` | Category headers + numbered items; collapsible sections; folder nesting. | Moderate — good for flat/shallow structures |
| `SimpleTOC` | Flat numbered list with descriptions. | Weak — too shallow for site-wide TOC |
| `TOCGallery` | Thumbnail strip. | Partial — could augment Art section within TOC |

### 3.3 Proposed PCS Content

The homepage TOC should expose the full site hierarchy:

```
ALI EINODER
├── ART
│   ├── [gallery entries or series]
├── TOOLS
│   ├── Generative Art
│   │   ├── Generator Studio
│   ├── Image Processors
│   │   ├── Distort
│   │   ├── Colour Quantizer
│   │   ├── ...
│   ├── Fabrication
│   │   ├── Multifilament Print
│   ├── Utilities
│       ├── ...
├── BLOG / DOCS
│   ├── [doc tree from manifest]
├── PROJECTS
│   ├── [project entries]
├── CONTACT
│   ├── Instagram
│   ├── [other links]
```

This is the site's actual content graph. The homepage should render it, not hide it behind three words.

---

## 4. Brutalist UX/UI Integration

### 4.1 Definition (for this context)

Brutalism in digital design: **raw structural honesty**. The interface exposes its own construction logic. Surfaces are undecorated. Hierarchy is communicated through geometry, scale, and position — not through ornament.

This aligns directly with design-law first principles:
- §2.2 Recursive Partitioning = brutalist structural exposure
- §2.8 Informative Minimalism = brutalist anti-decoration
- §3.3 Floating Prohibition = brutalist anti-composition (no "designed" arrangements)
- §10 Prohibited Patterns = brutalist material honesty

### 4.2 Brutalist Strategies That Apply

| Strategy | Application | Notes |
| --- | --- | --- |
| **Raw grid** | Expose the partition grid itself as the visual. Cells, shared boundaries, visible structure. | The current ASCII grid is close to this — but uses it decoratively, not informationally. |
| **Systematic repetition** | Every TOC row is identical in structure. No visual hierarchy through decoration — only through depth (indentation) and case (UPPERCASE categories, Title Case items). | Already law: text-treatment §2 |
| **Monospace as material** | Monospace grid = typed document. The homepage should read like a structured terminal listing, not a graphic. | Typeface already Atkinson Mono |
| **No images on the landing** | A brutalist TOC is text-only. Art previews belong on the Art index, not the root. | Reduces load, increases density |
| **Visible borders as structure** | Shared boundaries between sections communicate "these are adjacent partitions of one surface." | Per border-system.md |
| **Inversion as the only accent** | Hover = invert. Active = invert. No other state decoration. | Per text-treatment §6 |

### 4.3 Brutalist Risks to Avoid

| Risk | Mitigation |
| --- | --- |
| Hostile minimalism (too sparse, no affordances) | Every leaf in the TOC is interactive. Category rows expand/collapse. The structure itself is the affordance. |
| Monotony (wall of identical rows) | Depth indentation + category headers in UPPERCASE vs Title Case items. TreeTOC's SVG connectors provide structural variation without decoration. |
| Confusion with "broken" or "unfinished" | Consistent border system + precise F-alignment signals intentionality. Brutalism reads as deliberate only when geometry is exact. |
| Inaccessibility | F-based touch targets, keyboard navigation, `title` attributes for descriptions. |

---

## 5. Minimalism Integration

### 5.1 Definition (for this context)

Minimalism here means: **maximum information per element; zero elements that don't inform, enable, or signal.** This is §2.8 restated. Every visible element must justify its existence by its function.

### 5.2 Minimalist Strategies

| Strategy | Application |
| --- | --- |
| **Single PCS, no competing surfaces** | One tree. No sidebar, no toolbar, no header widget. The tree is the page. |
| **Progressive disclosure** | Collapsed by default (per §16.3.2). User expands what they need. Root shows section count, not all leaves. |
| **No chrome** | No page title beyond the root label. No "welcome" copy. No explanatory paragraph. The structure is self-evident. |
| **Density through hierarchy** | 20+ tools exposed through 5 categories. The tree compresses information without hiding it. |

### 5.3 Minimalism Risks

| Risk | Mitigation |
| --- | --- |
| New visitor disorientation | Root labels (ART, TOOLS, BLOG, PROJECTS, CONTACT) are self-descriptive. Section descriptions available on hover via `title` attribute. |
| Loss of identity/atmosphere | The retro aesthetic is carried by the typeface, the monospace grid, the inversion states, and the border system — not by the noise animation. The character of the site survives the removal of the ASCII scene. |

---

## 6. Retro Aesthetic Preservation

The retro register must survive the transition from animation to structure.

### 6.1 Elements That Carry the Retro Signal

| Element | How it works |
| --- | --- |
| Atkinson Hyperlegible Mono | Monospace = terminal / early computing. Present on every text element site-wide. |
| `var(--c-bg)` / `var(--c-text)` two-tone | High contrast, no greyscale ramp. Reads as CRT / VGA. |
| 1px solid borders | Pixel-perfect. No anti-aliased curves. |
| UPPERCASE labels | Reads as system UI, command-line output. |
| Inversion-only hover | Binary state. On/off. No fade, no transition. |
| F-snapped grid | Pixel-locked geometry. No subpixel rendering. |
| TreeTOC SVG connectors | Line-art tree = file-system listing (`tree` command output). |

### 6.2 ASCII Scene Fate

The ASCII noise scene is preserved as a documentation page in the blog/docs section — a standalone demo. It is not lost; it is relocated from a homepage role to an archival/showcase role.

The homepage carries the retro signal through the static visual system alone. No ambient animation on the homepage.

---

## 7. Structural Proposal

### 7.1 Surface

Header and footer hidden. The tree occupies the full viewport — no chrome competes with the PCS. Navigation away from home restores header/footer.

### 7.2 Interaction Model — Pannable Viewport

The homepage is a **pannable viewport** over a 2D tree map. The TreeTOC renders at its natural spatial size (which may exceed the viewport in both axes as branches expand). The user drags to move through it.

**Why pan, not scroll:** TreeTOC grows rightward (depth = horizontal displacement via SVG connectors) as well as downward (sibling count). Standard scrolling handles one axis. Panning handles both simultaneously with one gesture, and works identically on touch and pointer.

```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│              FULL TREE (rendered, may exceed viewport)    │
│                                                          │
│   ALI EINODER                                            │
│   ├── ART                                                │
│   │   Generative and visual art works                    │
│   │   ├── [entries]                                      │
│   ├── TOOLS                                              │
│   │   Creative development tools                         │
│ ┌─│───────────────────────────────────┐                  │
│ │ │   ├── Generative Art              │← VIEWPORT        │
│ │ │   │   ├── Generator Studio        │  (visible area)  │
│ │ │   ├── Image Processors            │                  │
│ │ │   │   ├── Distort                 │                  │
│ │ │   │   ├── Colour Quantizer        │                  │
│ │ │   │   ├── ...                     │                  │
│ │ │   ├── Fabrication                 │                  │
│ │ │   ├── Utilities                   │                  │
│ └─│───────────────────────────────────┘                  │
│   ├── DOCS                                               │
│   │   ├── [manifest tree, deep nesting]                  │
│   ├── PROJECTS                                           │
│   ├── CONTACT                                            │
│       ├── Instagram                                      │
│                                                          │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

### 7.3 Pan Mechanics

| Property | Spec |
| --- | --- |
| Container | `overflow: hidden`, full viewport (100vw × 100vh) |
| Inner element | TreeTOC render, positioned via `transform: translate(panX, panY)` |
| Input | Unified pointer events (`pointerdown` / `pointermove` / `pointerup`). Works for mouse and touch. |
| Drag vs click | If pointer displacement < 4px between down and up → treat as click (expand/navigate). If ≥ 4px → treat as drag. |
| Touch action | `touch-action: none` on container. Prevents browser scroll/zoom from conflicting with pan. |
| Bounds | Clamped so that at least some text is always visible. Cannot drag into empty void. `panX ∈ [-(contentWidth - viewportWidth + F), F]`, `panY ∈ [-(contentHeight - viewportHeight + F), F]`. If content < viewport on an axis, that axis is locked (no pan). |

### 7.4 Auto-Pan on Expand (Tween)

When a branch expands and reveals children that extend beyond the current viewport:

1. Measure the bounding box of the newly visible content.
2. Compute target pan position: the **rightmost visible character** lands at **80% of viewport width**. Vertically: the first new child row is in view.
3. If the tree still fits within the viewport, no pan occurs.
4. Animate from current `(panX, panY)` to target `(panX', panY')`.

**Tween spec:**

| Property | Value |
| --- | --- |
| Easing | `easeOutCubic`: `t => 1 - (1 - t)³`. Fast departure, soft arrival. |
| Duration | 200ms. ~12 frames at 60fps. |
| Interpolation | Lerp both axes simultaneously. If only one axis changes, the other holds constant — no diagonal drift on a purely horizontal shift. |
| Implementation | AnimationFoundation (`FrameSequencer` or equivalent). No raw `requestAnimationFrame`. |
| Interruption | If the user starts dragging mid-tween, the tween cancels immediately. Pan position freezes at whatever value it had reached. User takes control with no fighting. |
| Chaining | If a second expand occurs before the first tween completes, the first tween is cancelled and a new tween begins from the current interpolated position to the new target. |

### 7.5 Initial View

On load, the tree shows only the root and top-level branches (collapsed). The root label `ALI EINODER` is positioned so it is visible with comfortable margin. Pan starts at `(0, 0)`.

### 7.6 Navigation Controls

| Control | Purpose | Placement |
| --- | --- | --- |
| **Collapse all** | Resets the tree to top-level-only view and tweens pan back to origin `(0, 0)`. Essential escape hatch when deep in the tree. | In the root label row, right-aligned. Label: `COLLAPSE ALL` or a cyclic `▸`/`▾` on the root node. |
| **Branch jump list** | A 2F strip of top-level branch labels (ART, TOOLS, DOCS, PROJECTS, CONTACT). Tapping a label tweens pan to that branch's coordinates within the tree. Express transport. | Sticky at the top of the viewport (does not pan with the tree). Shared boundary with the pannable area below. |
| **Keyboard navigation** | `Arrow keys` = pan. `Home` = pan to origin. `Escape` = collapse all. `Enter` on focused node = expand/navigate. | Desktop only. No visual cost. |

### 7.7 Core Properties

- PCS: single `TreeTOC` instance with root label `ALI EINODER`.
- Full viewport: header and footer hidden. Tree is the only surface.
- Pannable: drag to navigate the 2D tree space. Bounded so text is always visible.
- Auto-pan on expand: 200ms ease-out tween to frame newly visible content at 80% viewport width.
- Data: merged tree from all section indexes (tools TOC, blog manifest tree, art entries, projects list, contact links).
- CONTACT branch includes external links (Instagram, etc.) rendered as leaf nodes that open in new tab.
- Collapsed by default. Top-level nodes visible on load.
- Click on leaf → navigate to that page. Click on branch → expand/collapse.

---

## 8. Descriptions

Descriptions belong on **branch nodes only** (ART, TOOLS, DOCS, PROJECTS, CONTACT, and their immediate sub-categories like Generative Art, Image Processors). Leaf nodes rely on clear naming. This keeps the tree compact at depth while providing context at the levels where it matters.

### 8.1 Branch Description Format

A muted line below the branch label, rendered on expand. Sentence case, `F × 0.75`, `color: var(--c-border)`. Can wrap to multiple lines — at branch level there is vertical space before children begin.

```
├── TOOLS
│   Creative development tools for generative art,
│   image processing, and fabrication
│   ├── Generative Art
│   │   Unified studio for algorithmic visual systems
│   │   ├── Generator Studio
│   ├── Image Processors
│   │   GPU-accelerated image manipulation
│   │   ├── Distort
│   │   ├── Colour Quantizer
```

- Description appears when the branch is expanded. Collapses with the branch.
- Description is not interactive (no click target, no glyph).
- Description text is muted (`var(--c-border)`) — subordinate to the branch label and child labels which use `var(--c-text)`.
- Multi-line is acceptable at branch level. The description row height is content-driven, not fixed at 2F. This is an explicit exemption from the 2F interactive row rule — the description is not interactive.

### 8.2 Leaf `title` Attributes

All leaf nodes carry `title` attributes with short descriptions. Zero DOM cost. Available on hover (desktop) and long-press (mobile). Not the primary mechanism — a bonus.

### 8.3 Data Requirement

Every branch node in the unified tree must have a `description` field. Leaf nodes should have a `description` for the `title` attribute. Sections that already provide descriptions in their TOC data (tools) are ready. Blog manifest and art entries need auditing.

---

## 9. Research Required Before Design

| # | Topic | Question | Why |
| --- | --- | --- | --- |
| 1 | **Data aggregation** | How to merge tools TOC data, blog manifest tree, art entries, and project entries into a single tree at runtime without coupling sections? | The homepage must render a unified tree. Each section currently owns its own TOC data preparation. Need a shared aggregation layer or a homepage-specific data builder. |
| 2 | **Art section first-level galleries** | What are the top-level gallery names in the art section (e.g. Physical, Digital, ...)? Does `art_section.js` expose these as a flat list that can be adapted to TreeTOC children? | Art branch shows only first-level gallery categories as leaves. Need to extract those names from the art section's data. |
| 3 | **TreeTOC bounding box** | What are the rendered pixel dimensions of TreeTOC at various expansion states? How does the SVG connector layout translate to a pannable coordinate space? | Pan bounds, auto-pan target calculation, and the 80% rule all depend on measuring the tree's actual bounding box after render/expand. |
| 4 | **Touch interaction** | With the pan model, drag vs click discrimination (4px threshold) — does this interfere with rapid tap-to-expand on small targets? | §5.4 compliance. Need to test that the 4px threshold feels natural on mobile and doesn't eat taps. |
| 5 | **Performance at scale** | A unified tree with all tools (20+), all docs (50+ files), all art galleries, all projects — how many DOM nodes does TreeTOC generate when fully expanded? Does `transform: translate` on a large inner element cause paint/composite issues? | If > 500 nodes, may need lazy branch rendering. Transform-based pan is GPU-composited and should be cheap, but needs verification at scale. |
| 6 | **Header/footer hide API** | Does layout.js or app.js expose a method to hide/show the header and footer? Or must HomeSection manipulate DOM directly? | Homepage hides both. Need a clean API so header/footer re-appear on navigation to any other section. |
| 7 | **Tween AnimationFoundation integration** | Which AnimationFoundation class is appropriate for a 200ms one-shot lerp? FrameSequencer or a lightweight tween utility? Does one exist or does it need to be added? | The auto-pan tween must use AnimationFoundation. Need to confirm the right class and whether it supports duration-based completion. |
| 8 | **Contact popup integration** | The existing contact popup — how is it triggered? Can TreeTOC fire a popup from a branch click instead of navigating? | CONTACT node needs to open the existing contact popup, not navigate to a section. |
| 9 | **Description data completeness** | Which section TOC data sources already include `description` fields per item? Which are missing? | Branch descriptions and leaf `title` attrs both require description strings. Need audit of tools, blog manifest, art, projects data. |
| 10 | **Jump list as fixed partition** | The branch jump list is sticky (does not pan). Does this introduce a float or is it a proper partition (shared boundary with the pan area below)? | Must be a partition per §3.3. The jump list strip's bottom edge must align with the pan area's top edge = shared boundary. |
| 11 | **ASCII scene as docs page** | Where in the blog docs tree should the ASCII nav scene live? What route? Should it be a standalone demo page or filed under a specific category? | Need to pick a location and route for the preserved scene. |

---

## 10. Decision Points

All resolved.

| # | Decision | Resolution |
| --- | --- | --- |
| 1 | **Root label** | `ALI EINODER` |
| 2 | **Header/footer** | Hidden on homepage. Restored on navigation to any other section. |
| 3 | **Interaction model** | Pannable viewport with drag. |
| 4 | **Auto-pan tween** | 200ms ease-out cubic, rightmost content at 80% viewport width, interruptible by drag. |
| 5 | **Descriptions** | Branch-level muted descriptions on expand + leaf `title` attrs. |
| 6 | **Default expansion** | All collapsed. Top-level branches visible but closed. |
| 7 | **Ambient animation** | None. Static tree. Retro aesthetic carried by typeface, borders, inversion, grid. |
| 8 | **ASCII scene fate** | Preserved as a page in the blog/docs section. Not removed, just relocated. |
| 9 | **Art branch** | First-level galleries only (e.g. Physical, Digital, ...). No deeper nesting. |
| 10 | **Async branches (DOCS)** | Placeholder leaf labelled `LOADING` until blog manifest is fetched. Replace with real tree on load. |
| 11 | **External links (Instagram)** | Open in new tab. `_data.external: true` + URL on the leaf node. `onItemClick` calls `window.open(url, '_blank')`. |
| 12 | **CONTACT** | Renders as a branch node in the tree. Clicking it opens the existing contact popup. Does not navigate. No children — looks like a branch but behaves as a trigger. |
| 13 | **Pan momentum** | Brief momentum with very quick decay. Fast deceleration — feels responsive, not floaty. Needs AnimationFoundation. |

---

End of Analysis.
