# Project Page Build Guide

**Scope:** Steps to add a new entry under `#projects/<id>`.
**Prerequisite:** Read `ai-routing-map.md`, `components/index.md`.

---

## Definitions

| Term | Definition |
|------|------------|
| **Project page** | A content/portfolio page under `#projects/<id>`; no ToolBase, no sidebar canvas. |
| **Section config** | Object `{ title, contentLoader, defaultOpen }` passed to `CollapsibleSection`. |
| **contentLoader** | `async () => HTMLElement` — fetches content and returns a rendered element. |
| **Project module** | IIFE file at `projects/<Name>/<name>.js` that registers `window.<NameProject>`. |

---

## File Structure

```
projects/
└── <Project Name>/          ← folder name may contain spaces
    ├── <name>.js            ← module (IIFE, window-registered)
    └── md/
        ├── abstract.md
        └── <section>.md     ← one file per CollapsibleSection

src/
└── main.js                  ← add static import here

assets/js/sections/
└── projects_section.js      ← register in 4 places (see §4)
```

Media assets are hosted at `https://media.einoder.net/projects/<slug>/web/<filename>`.

---

## 1. Write the Project Module

Pattern: IIFE that exposes a single object to `window`.

```javascript
(function () {
    const MyProject = {
        version: '1.0.0',
        componentInstances: [],

        render(container) {
            this.cleanup(container);
            const deps = { MF: window.MathematicalFoundation, Resize: window.ResizeManager };

            // --- content loaders ---
            const md = (path) => async () => {
                const res = await fetch(path, { cache: 'no-cache' });
                if (!res.ok) throw new Error(`fetch failed: ${path}`);
                const comp = new ComponentLibrary.MarkdownBody({ markdownText: await res.text() });
                this.componentInstances.push(comp);
                return await comp.render();
            };

            const gallery = () => async () => {
                const comp = new ComponentLibrary.Carousel({ images: GALLERY_IMAGES, enableZoom: true }, deps);
                this.componentInstances.push(comp);
                return await comp.render();
            };

            // --- section config ---
            const sections = [
                { title: 'ABSTRACT',  contentLoader: md('projects/My Project/md/abstract.md'),  defaultOpen: true  },
                { title: 'GALLERY',   contentLoader: gallery(),                                  defaultOpen: true  },
                { title: 'SECTION B', contentLoader: md('projects/My Project/md/section-b.md'), defaultOpen: false },
            ];

            sections.forEach((cfg, i) => {
                const c = new ComponentLibrary.CollapsibleSection({ ...cfg, isFirst: i === 0 }, deps);
                this.componentInstances.push(c);
                container.appendChild(c.render());
            });

            this._addBackLink(container);
        },

        _addBackLink(container) {
            const F = window.MathematicalFoundation ? window.MathematicalFoundation.F : 12;
            const link = new ComponentLibrary.Paragraph({
                content: '← Back to Projects',
                isClickable: true,
                onClick: () => { if (window.location.hash.startsWith('#projects/')) window.location.hash = '#projects'; }
            });
            this.componentInstances.push(link);
            const el = link.render();
            el.style.marginTop = `${F * 2}px`;
            container.appendChild(el);
        },

        cleanup(container) {
            ComponentLibrary.destroyTracked(this.componentInstances);
            this.componentInstances = [];
            if (container) container.innerHTML = '';
        }
    };

    window.MyProject = MyProject;
})();
```

**Rules:**
- No `requestAnimationFrame`, `setInterval`, `document.createElement` outside `BaseComponent`.
- All instances pushed to `componentInstances`; all cleaned in `cleanup`.
- `cleanup` resets the array — prevents accumulation across re-renders.

---

## 2. Write Markdown Content

One `.md` file per section in `projects/<Name>/md/`. Files are fetched at runtime via `fetch()`. Paths are relative to the site root (i.e., they match the filesystem path from the repo root).

**Path convention:** `projects/<Name>/md/<section>.md`

Note: spaces in folder names are valid — `fetch` handles them. Dynamic `import()` does **not** handle them reliably (see §5).

---

## 3. Register in `src/main.js`

Add a **static import** after the section imports:

```javascript
// after: import '../assets/js/sections/projects_section.js';
import '../projects/My Project/my-project.js';
```

**Do not** use dynamic `import()` for project modules — spaces in folder names break dynamic import in some bundler/browser combinations. Static import via Vite works regardless of path characters.

---

## 4. Register in `projects_section.js`

Four locations must be updated:

### 4a. `pages` array
```javascript
pages: [
    // ...
    '#projects/my-project',   // ADD
],
```

### 4b. `navigationConfig.structure`
```javascript
{ id: 'my-project', title: 'MY PROJECT', description: '...' },
```

### 4c. `getDropdownItems`
```javascript
{ label: 'MY PROJECT', path: '#projects/my-project' },
```

### 4d. `renderProject` — add a branch before the mock fallback
```javascript
if (projectId === 'my-project') {
    if (window.MyProject) {
        this.currentContainer.innerHTML = '';
        window.MyProject.render(this.currentContainer);
        return;
    }
}
```

---

## 5. Common Failure Mode

**Symptom:** Navigating to `#projects/<id>` shows the stub ("Project details to be implemented.").

**Cause:** `window.<NameProject>` is `undefined` at route time. This occurs when:
- The static import in `src/main.js` is missing, OR
- A dynamic `import()` was used but failed silently (space in path, see §3).

**Diagnostic:** Open console; check `window.<NameProject>`. If `undefined`, the import is missing or failed. If the `renderProject` branch is absent, add it (§4d).

---

## 6. Gallery Images

### 6a. Process raw images

`scripts/process-photos.py` converts originals into three size variants:

| Variant | Max | Quality | Use |
|---------|-----|---------|-----|
| `thumbs/` | 800px | 80% | not used by project pages |
| `web/` | 2400px | 85% | Carousel source |
| `zoom/` | 4000px | 95% | backup / full-res |

```bash
python scripts/process-photos.py <source-dir> <output-dir>
# e.g.
python scripts/process-photos.py "projects/My Project/raw" "projects/My Project/processed"
```

Output: `processed/web/`, `processed/thumbs/`, `processed/zoom/`, `processed/manifest.json`.

### 6b. Upload `web/` to R2

Project images live at `projects/<slug>/web/` in the bucket, **not** under `art/photos/`.

```bash
python scripts/r2-upload.py dir "projects/My Project/processed/web" projects/my-project/web
```

Public URL pattern: `https://media.einoder.net/projects/<slug>/web/<filename>`

Dry-run first: append `--dry-run` to verify keys before uploading.

### 6c. Reference in the module

```javascript
const GALLERY_IMAGES = [
    { src: 'https://media.einoder.net/projects/my-project/web/image-01.jpg', caption: 'Description' },
];
```

Pass to `ComponentLibrary.Carousel` with `enableZoom: true`.

---

## 7. Checklist

- [ ] `projects/<Name>/<name>.js` created; follows IIFE/window pattern.
- [ ] All markdown files present for every section referenced in `sections` array.
- [ ] Static import added to `src/main.js`.
- [ ] All four locations in `projects_section.js` updated.
- [ ] `cleanup` resets `componentInstances = []`.
- [ ] No raw DOM ops outside `BaseComponent`; no RAF/setInterval.
- [ ] Raw images processed via `process-photos.py` → `web/` variant exists.
- [ ] `web/` uploaded to R2 under `projects/<slug>/web/` (not `art/photos/`).
- [ ] Gallery URLs resolve (curl or browser check before publishing).
- [ ] Back link navigates to `#projects`.
