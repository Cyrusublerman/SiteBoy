# 04 Architecture — Gallery Uploader/Manager

System map:
```
[UI Section (/tools/gallery-upload-local)] 
    -> (gate: hostname localhost AND env flag)
    -> /api/upload|regenerate|delete|bulk-meta|markdown (local)
        -> variant generator (thumb/web/zoom)
        -> R2 upload (cache-control)
        -> notes/<id|groupId>.md write
        -> manifest patch (ids/meta/group/markdownUrl/sizes/checksum)
        -> diff + log -> UI
[Gallery render] 
    -> fetch manifest 
    -> group by groupId -> slideshow ordered by groupOrder 
    -> fetch markdownUrl on demand
```

Data:
- Manifest items: id, thumb/web/zoom, alt, meta { category, tags[], dateTaken, description, credit, license, groupId, groupOrder, markdownUrl, checksum, sourceName, generatedAt, sizes {thumb/web/zoom: w,h,quality} }.
- Assets: thumb/web/zoom in R2; markdown notes in R2 (`notes/<id|groupId>.md`).
- Presets: sizes/quality/zoom toggle, autoOrient, stripExif, sharpen?, cache-control.
- Logs: stepwise status per request (returned to UI).

Components/ownership:
- UI: ComponentLibrary blocks only; no raw DOM; F-system/VGA.
- Animation (optional progress): AnimationFoundation.
- Layout math: MathematicalFoundation (sizing where needed).
- Routing: hidden tools route via ToolsSection/AssetLoader registry; gated inside tool.
- No assets or markdown stored in repo; only manifests/spec docs here.

Gates/safety:
- Hostname localhost AND env flag (front-end guard; backend must also enforce).
- Dry-run mode returns manifest diff and planned filenames; confirm destructive ops.
- Duplicate id guard; alt required; groupId consistency check.

Dependencies:
- Backend image tooling (sharp/imagick) and R2 creds (not in repo).
- Frontend expects localhost API endpoints; handles errors to status panel.

