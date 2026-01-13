# 00 Overview — Gallery Uploader/Manager

Scope: hidden localhost-only tool to upload/regenerate/replace gallery items, edit metadata, group into slideshows, and attach markdown notes. Pipeline follows `guides/tools/gallery-image-pipeline.md`; process per `guides/ai-routing-map.md`.

Architecture: Pipeline (UI → gated API → R2 assets + manifest). CORE_DATA: manifest, variants (thumb/web/zoom), markdown notes objects, processing presets, job logs/diffs.

Requirements coverage (R1–R6):
- R1 batch upload + variants + cache-control + dry-run + versioned replace.
- R2 metadata/bulk (alt, category, tags, dateTaken, description, credit, license).
- R3 grouping/slideshow (groupId, groupOrder).
- R4 markdown attach (notes/<id|groupId>.md in R2, manifest markdownUrl).
- R5 manifest integrity (unique ids, sizes/checksum, diff/rollback).
- R6 safety/logging (localhost + env gate, errors surfaced, no repo assets).

Flow (ASCII):
```
[Uploader UI (ComponentLibrary)] -> [Localhost API gate] 
    -> generate variants -> upload R2 -> patch manifest + notes/*.md
    -> return manifest diff/log
[Gallery render] group by groupId -> slideshow; fetch markdownUrl on demand
```

