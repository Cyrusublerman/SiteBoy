# Gallery Uploader / Manager (Local Only)

Scope: hidden localhost tool to batch upload, regenerate, replace, tag, group (slideshow), and attach markdown notes for gallery items, following `guides/tools/gallery-image-pipeline.md` and ai-routing-map checks.

Architecture: Pipeline (tool UI → gated API → R2 assets/manifest). Core data: manifest per set, variants (thumb/web/zoom) in R2, markdown notes objects in R2, processing presets, job logs/diffs.

ASCII flow:
```
[UI section (/tools/gallery-upload-local)]
    ↓ JSON + files (localhost + env gate)
[Local API: upload/regenerate/delete/markdown]
    ↓ generate variants (sizes/quality presets)
    ↓ upload to R2 (thumb/web/zoom + notes/*.md)
    ↓ patch manifest.json (ids, meta, group, markdownUrl)
[Gallery render]
    ↳ group by groupId → slideshow; fetch markdownUrl on demand
```

Requirements (R):
- R1 batch upload + variants + cache-control + dry-run + versioned replace
- R2 metadata edit/bulk: alt, category, tags, dateTaken, description, credit, license
- R3 grouping/slideshow: groupId, groupOrder
- R4 markdown attach: stored in R2 notes/<id|groupId>.md referenced by manifest
- R5 manifest integrity: unique ids, sizes/checksum recorded, diff/rollback path
- R6 safety/logging: localhost + env gate, errors surfaced, no repo assets

Manifest shape (per item):
```
{
  "id": "kebab-id",
  "thumb": ".../thumbs/id.jpg",
  "web": ".../web/id.jpg",
  "zoom": ".../zoom/id.jpg",        // optional
  "alt": "required",
  "meta": {
    "category": "",
    "tags": ["t1","t2"],
    "dateTaken": "2024-05-01",
    "description": "",
    "credit": "",
    "license": "",
    "groupId": "set-01",            // for slideshow grouping
    "groupOrder": 1,                // order inside group
    "markdownUrl": ".../notes/id.md",
    "checksum": "sha256",
    "sourceName": "orig.jpg",
    "generatedAt": "ISO",
    "sizes": {
      "thumb": { "w": 320, "h": 0, "quality": 72 },
      "web":   { "w": 1600, "h": 0, "quality": 82 },
      "zoom":  { "w": 2400, "h": 0, "quality": 90 }
    }
  }
}
```

Backend API (localhost + env gate):
- GET /sets → list sets; GET /sets/:set/manifest → fetch.
- POST /upload (batch): setId, items[] { id, groupId?, groupOrder?, alt, category, tags[], dateTaken, description, credit, license, markdownText?, generate { thumb/web/zoom sizes, quality, zoomEnabled, autoOrient, stripExif, sharpen? }, cacheControl, replace?, dryRun? }. Outputs: manifest diff, URLs, checksums, logs.
- POST /regenerate: items, new generate presets; updates manifest sizes/checksum.
- POST /delete: items (and assets) with confirm; updates manifest.
- POST /bulk-meta: updates tags/category/groupId/groupOrder/etc.
- POST /markdown: write/replace notes/<id|groupId>.md, update markdownUrl in manifest.
- Health: /status; optional HEAD to R2 URLs for verification.

UI blocks (ComponentLibrary only):
- Set picker + manifest viewer (shows thumb, tags, group info, markdown badge).
- Batch upload form (files, metadata, grouping, presets, cache-control, dry-run).
- Bulk ops (tags/category/grouping/regenerate/delete).
- Item detail (replace asset with version bump toggle, metadata, markdown editor/preview).
- Log/status panel (stepwise backend output).
- Group render rule: same groupId collapses to one card with slideshow ordered by groupOrder; markdown fetched on demand.

Presets & validation:
- Default sizes: thumb ~320w, web ~1600w, zoom optional ~2400–3200w; qualities thumb 70–75, web 80–85, zoom 90.
- Enforce kebab ids, required alt, duplicate guard, zoom toggle, cache-control `public, max-age=31536000`.
- Dry-run shows manifest diff/filenames before upload; confirm destructive actions.

Checks from ai-routing-map (sample 5+ applied):
- ui-bijection checklist (controls ↔ params)
- f-system checklist
- color-system checklist (VGA vars)
- duplication-guard checklist
- animation-foundation checklist (if any animated progress)
- gallery-assets checklist (pipeline adherence)

Ops notes:
- No markdown or assets in repo; drafts in `blog/docs/temp/`, final here.
- Hostname must be localhost AND env `GALLERY_UPLOAD_LOCAL=1` (deny otherwise).
- Rollback: restore prior manifest version; filenames are versioned to avoid cache collisions.

