# Glossary

Defined terms used across the Vercel migration plan and ledgers. A term used in any ledger must either be in this glossary or be a proper noun (Vercel, R2, Postgres, etc.).

## Terms

| Term | Definition |
|---|---|
| **Static site (current)** | Every byte served by GitHub Pages is precomputed at `vite build` time. No request-time logic. |
| **Dynamic site (target)** | Same precomputed shell, plus a server surface that authenticates a single user and mutates persistent content. |
| **Public surface** | Every URL reachable without authentication. Read-only. |
| **Authoring surface** | UI affordances accessible only with a valid session; rendered in-place on existing URLs as per Part B §B0. |
| **Editor** | The single human with credentials. Single-tenant. |
| **Article** | Markdown body + metadata; currently a `.md` file under `blog/`; persists as a row in `articles`. |
| **GalleryItem** | Image-or-video asset + metadata; persists as a row in `gallery_items`. |
| **Image-page** | A unit within a gallery layer containing one or more `GalleryItem`s plus optional text. Has its own cover image and metadata. |
| **Gallery layer** | A folder-level node in the gallery tree; contains image-pages and/or child layers. |
| **PageBlocks** | The JSON block array a section renders; persists as a row in `page_blocks`. |
| **Media blob** | The actual file (image / video / audio) stored on R2. Only URLs are persisted in the DB. |
| **Admin mode** | The runtime state in which the editor is authenticated and the current page renders its admin variant. |
| **Admin variant** | A sibling renderer (per Part B §B2.2, hosted in `assets/js/admin/sections/`) that replaces the public render of a section while the editor is authenticated. |
| **Hidden flag** | The DB column that replaces the draft / published distinction (Part B §B3.8, §B7.1). |
| **Block (markdown)** | A fenced `:::block <type>\n<json>\n:::` directive embedded in markdown source (Part B §B3.5). |
| **F-system** | The dimensional system anchored on `var(--f)` (CSS) and `MathematicalFoundation.calculateDimensions(...)` (JS). All admin sizing uses it. |
| **Feature flag** | A runtime gate listed in `flags.md`; controls whether a unit's behaviour is active. |
| **Unit** | One implementation work-item identified by `Sxx` in Part C §C2 and tracked in `status.md`. |
| **Reconciliation pass** | The doc-only edit pass (S00) that eliminates the Part A ↔ Part B contradictions surfaced in the review. |
| **Verification matrix** | The functional / regression / security checks every implementation PR must satisfy (Part C §C5). |
| **v1 done** | The composite acceptance criterion in Part C §C7. |
