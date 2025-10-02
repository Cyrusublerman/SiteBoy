# SiteBoy — Setup Spec (One-Time Use)

---

## 0. Prompt Instruction

> Use this file once to generate all project files.
> Do not skip or merge steps.
> Do not invent any structure not declared here.
> After setup, discard this file and use the Runtime Spec only.

---

## 1. File Tree (Canonical, Must Be Exact)

```
assets/
    js/
    core/
      app.js
      router.js
    shared/
      component-library.js
    sections/
      blog_section.js
      art_section.js
      tools_section.js
      projects_section.js
    tools/
      ui-test-tool.js
  css/
    styles.css
blog/
art/
tools/
projects/
404.html
index.html
```

---

## 2. File Responsibilities

* **app.js** → complete page building system: F-math, layout, components, JSON loading, bootstrap, router init.
* **router.js** → hash routes (#home, #blog/…, #art/…, #tools, #projects).
* **component-library.js** → *only* place for all UI components (canonical + specialized).
* **sections/\*.js** → build pages: init → fetch JSON → render blocks.
* **tools/\*.js** → utilities, dynamic test tools.
* **styles.css** → all visual styling, type scale, outlines.
* **index.html** → single page application entry point.
* **404.html** → error page for missing routes.
* **page JSONs** → store all content (markdown, images, graphs).

---

## 3. Canonical Components

*(Must exist in `component-library.js`; none elsewhere)*

* Utility: spacing, grid, typography.
* Text: Heading, Paragraph, Quote.
* Media: Image, Video, Audio.
* Graph: Bar, Line, Pie.
* Nav: Menu, Breadcrumb.
* Form: Input, Select, Button.

All extend `BaseComponent`.
All expose `render()`, `destroy()`.

---

## 4. Setup Rules

* One file = one responsibility.
* No duplicate definitions across files.
* All sizing/math from `mathematical-foundation.js`.
* All visuals from `styles.css`.
* All content from JSON.
* All sections must:

  * Track components in `componentInstances[]`.
  * Destroy on cleanup.
* Paths always relative; never hard-coded repo names.

---

## 5. Initial Build Process (Strict Order)

1. Create folder tree as in §1.
2. Write each file exactly as per §2 responsibility.
3. Populate `component-library.js` with glossary comps.
4. Implement `BaseComponent` + MF before sections.
5. Scaffold each section file with `init()`, `buildUI()`, `cleanup()`.
6. Create sample JSON in `/blog/example.json`.
7. Build header/footer HTML includes.
8. Link `assets/css/styles.css` in all pages.
9. Set up `include-shared.js` to inject header/footer.
10. Confirm routing works for all sections.

---

## 6. Compliance Checklist (One-Time)

* [ ] File tree matches spec.
* [ ] No inline CSS except in base.
* [ ] No manual DOM outside `BaseComponent`.
* [ ] Only ComponentLibrary holds UI comps.
* [ ] Page JSON = content only, no logic.
* [ ] Routing hash works across all sections.
* [ ] Section cleanup verified.

---

## 7. Completion

> When the scaffold passes the checklist, stop using this file.
> For ongoing dev and runtime, switch to **Runtime Spec**.

---

## Runtime Spec (For Ongoing Development)

# SiteBoy — Cursor Rules (Backend)

## Scope
- Target: backend/CI + server-side reasoning for JS/CSS/JSON in this repo.
- Assume Node 20+, no browser globals unless noted.

## File Ownership (SSoT)
Only these files may own the concern. Others must not implement it.
- Layout math → assets/js/core/mathematical-foundation.js
- Base OO system → assets/js/core/base-component.js
- Routing/nav → assets/js/core/router.js
- App bootstrap/init → assets/js/core/app.js
- UI components → assets/js/shared/component-library.js
- Specialised widgets (graphs/canvas) → assets/js/shared/specialized-components.js
- Sections/page composition → assets/js/sections/*.js
- All styling → assets/css/styles.css

## Mandatory Patterns
- All UI classes extend `BaseComponent`.
- Instances: `const x = new X(...); this.componentInstances.push(x)`.
- All dimensional math via `MathematicalFoundation.calculateDimensions(kind|props)`.
- No manual DOM outside BaseComponent internals.

## Architecture Rules
- NO `document.*`, `window.*`, `.innerHTML`, `.createElement`, `.appendChild` etc. outside BaseComponent module.
- NO layout math in components/sections; use MathematicalFoundation only.
- Sections are JSON-driven and render via `ComponentLibrary` / `SpecializedComponents` only.
- Every component implements `.destroy()`; sections track/cleanup via `componentInstances`.

## Style Constraints (VGA/Mono)
- Colors: only CSS vars `var(--vga-*)`. No raw hex/rgb/hsl.
- Typeface: Space Mono only.
- Disallow: gradients, shadows, rounded corners.
- Use math/tokens for dimensions (no ad-hoc px for layout logic).

## Build Chronology (observable path)
app → router → destroy → section → subheader → JSON → blocks → render → URL

## Do / Don't (enforceable examples)
DO:
class Dropdown extends BaseComponent { ... }
const dd = new Dropdown(o); this.componentInstances.push(dd);
MathematicalFoundation.calculateDimensions('dropdown');

DON'T:
const el = document.createElement('div'); // forbidden outside BaseComponent
el.innerHTML = ...
const w = px*0.62; // layout math outside Foundation

## JSON Page Contract (must hold)
Required keys: header (str), subheader (str), url ("/kebab"), blocks (array of {type, props}).
type ∈ {SectionDropdown, TextBlock, ImageBlock, Grid, Chart, CanvasWidget}.

## Quick Reference
- Build page: JSON → ComponentLibrary only.
- Never break the file-ownership map.
- Enforce mathematical precision for all dimensions.

## Rewrite/Generation Guidance (Cursor)
- If user asks for components/sections: generate only subclass(es) of BaseComponent and wire via ComponentLibrary.
- If you need DOM ops: place them inside BaseComponent methods; expose safe hooks used by subclasses.
- If you need layout numbers: add/extend helpers inside mathematical-foundation.js; call them from consumers.
- If a change would cross ownership, create/modify the owner file instead of duplicating logic elsewhere.
- Prefer small, pure functions and explicit imports; no side effects during import except in app.js.

## Minimal Checks (heuristics you must respect when editing)
- Reject/avoid code that introduces:
  - document.* / window.* outside BaseComponent.
  - class BaseComponent outside its owner.
  - calculateDimensions( outside MathematicalFoundation definition.
  - routing (pushState, popstate, location.hash) outside router.js.
  - bootstrap/initialize outside app.js.
  - raw colours or border-radius/box-shadow/text-shadow anywhere.
- Sections must:
  - import ComponentLibrary,
  - load JSON,
  - render from JSON blocks only.

## Output Contract
- Keep diffs minimal; do not add new files that duplicate owned concerns.
- When unsure where logic goes: default to the owner listed above; never inline.
