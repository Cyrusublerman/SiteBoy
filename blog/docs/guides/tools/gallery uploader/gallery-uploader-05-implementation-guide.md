# 05 Implementation Guide — Gallery Uploader/Manager

Files/components to touch:
- Tool entry: `assets/js/tools/gallery-uploader.js` (UI, gating).
- Registry: add to `asset-loader.js` (toolRegistry) and ToolsSection pages/listing.
- Section JSON (if needed) wired via ToolsSection (hash route `#tools/gallery-uploader`).
- Gallery consumer: grouping + markdown fetch logic where manifest is rendered.
- Docs live here; no assets/markdown in repo.

Backend contract (expected localhost API):
- GET /sets, GET /sets/:set/manifest
- POST /upload (batch/replace/dryRun), /regenerate, /delete, /bulk-meta, /markdown
- Responses include manifest diff, checksums, logs; errors surfaced.
- Gate: hostname + env flag; R2 uploads with cache-control.

UI wiring (ComponentLibrary only):
- Blocks: status/gate; set picker + manifest viewer; upload/replace form; bulk ops; item detail (markdown editor); log panel.
- Controls ↔ params: setId, itemIds, groupId/groupOrder, tags/category/dateTaken/alt/description/credit/license, markdownText, presets (sizes/quality/zoomEnabled/autoOrient/stripExif/sharpen), cacheControl, replace, dryRun, regenerateTargets, deleteTargets, versionBump.
- Tabs ≤4; ensure bijection (ui-bijection checklist).

Pipeline steps (frontend):
1) Gate check on load; block if not localhost/env flag.
2) Fetch sets + manifest; store state.
3) Submit upload/replace: validate (kebab ids, alt), send payload, stream log, refresh manifest.
4) Bulk meta: send changes, refresh manifest.
5) Markdown: post text, refresh manifest entry.
6) Regenerate/delete: confirm, send, refresh manifest.
7) Group preview: collapse by groupId; order by groupOrder.

Gallery consumption:
- Group items by groupId; order by groupOrder; render slideshow per group.
- Fetch markdownUrl when opening detail/overlay; show markdown body.

Testing checklist:
- Dry-run shows diff; no assets pushed.
- Live upload to test set: HEAD URLs 200; manifest updated; group collapse correct; markdown fetched.
- Replace bumps filenames; no cache hit.
- Delete removes assets + manifest entry.
- Cleanup: destroy components, abort any pending requests.

