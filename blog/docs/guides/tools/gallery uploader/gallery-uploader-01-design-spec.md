# 01 Design Spec — Gallery Uploader/Manager

Refs: `ai-routing-map.md`, `gallery-image-pipeline.md`, `ui-interface-overview.md`, `tool-standards.md`, `f-system.md`, `color-system`, `duplication-guard`, `gallery-assets`, `animation-foundation` (if progress anim).

UI blocks (ComponentLibrary only, ≤4 tabs):
- Overview/Status: status log, gating result (localhost/env).
- Upload/Replace: setId, itemIds (multi), groupId/order, alt, category, tags[], dateTaken, description, credit, license, file inputs, presets (sizes/quality, zoom toggle), cache-control, dry-run, version bump toggle, submit.
- Bulk Ops: tags/category/grouping updates, regenerate variants, delete with confirm.
- Item Detail: select item, edit metadata, attach/edit markdown text (uploads to notes/<id|groupId>.md), preview.
- Manifest Viewer: list items (thumb, tags, groupId, markdown badge); grouping preview (collapse by groupId).

Control ↔ Param bijection (samples):
- setId ↔ set picker; itemIds ↔ multi-select; groupId/groupOrder ↔ inputs; tags/category/dateTaken/alt/description/credit/license ↔ fields; markdownText ↔ textarea; generate.thumb/web/zoom sizes/quality/zoomEnabled/autoOrient/stripExif/sharpen ↔ controls; cacheControl ↔ select; replace ↔ toggle; dryRun ↔ toggle; regenerateTargets/deleteTargets ↔ multi-select; versionBump ↔ toggle.

States:
- manifest store (current set); selection state; job status/log; presets state; gating state.

Behaviors:
- On load: gate (localhost + env). If blocked → show denial.
- Fetch manifest/list sets via localhost API.
- Upload flow: validate ids/alt, build payload, send; show log; on success refresh manifest.
- Replace flow: same as upload with replace flag; versioned filenames expected server-side.
- Bulk ops: update manifest fields via API; refresh manifest.
- Markdown: send text to /markdown; manifest updates markdownUrl.
- Regenerate: request variant rebuild with new presets; update manifest sizes/checksum.
- Delete: confirm; remove assets+manifest entries.

Render consumption rule:
- Gallery groups items by groupId; order by groupOrder; slideshow within card; markdown fetched via markdownUrl when opening detail.

