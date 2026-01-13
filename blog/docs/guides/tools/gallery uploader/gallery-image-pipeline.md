# Gallery Image Pipeline (Cloudflare R2)

Purpose: consistent ingest, naming, upload, and manifesting of gallery images, hosted on Cloudflare R2.

Scope: gallery pages (photo/art sets). Use with `guides/checklists/gallery-assets.md`.

1) Source & curation
- Decide set, prune locally, final edits done before upload.

2) Naming
- Kebab-case, stable IDs; no spaces.
- Variants: `name-thumb.jpg`, `name-web.jpg`, `name-zoom.jpg` (if needed).
- Versioning via filename suffix if replaced: `name-v2-web.jpg`.

3) Directory layout (R2 and manifests mirror)
```
assetts-einoder/
└── art/
    └── photos/
        └── <set>/
            ├── thumbs/
            ├── web/
            ├── zoom/          (optional)
            └── manifest.json
```

4) Manifest (per set)
```json
{
  "set": "brain-dump",
  "items": [
    {
      "id": "dscf4419",
      "thumb": "https://media.einoder.net/art/photos/brain-dump/thumbs/dscf4419.jpg",
      "web":   "https://media.einoder.net/art/photos/brain-dump/web/dscf4419.jpg",
      "zoom":  "https://media.einoder.net/art/photos/brain-dump/zoom/dscf4419.jpg",
      "alt": "short alt text",
      "meta": { "width": 1920, "height": 1280 }
    }
  ]
}
```

5) Upload steps (use scripts; do not drop raw files in repo)
- Prepare local folder matching final names.
- Upload via scripts/r2-upload.py or `aws s3 sync … --endpoint-url https://<account>.r2.cloudflarestorage.com --profile r2`.
- Set `--cache-control "public, max-age=31536000"` on static assets.
- Keep manifests small; upload after images.

6) Add to site
- Point gallery JSON/config to manifest URLs.
- Do not commit large images; manifests can live in repo if small, but URLs must be cloud.

7) Replacement / rename
- Add new file with new versioned name; update manifest entry; remove old reference; (optionally delete old object).
- Never overwrite in place without name change (caching).

8) Verification
- HTTP: `curl -I <thumb-url>`; expect 200.
- Listing: `python scripts/r2-upload.py list art/photos/<set>/`.
- Gallery page renders thumbs/web; alt text present.

9) Rollback
- Keep previous manifest in git history; switch URLs back if needed.

References
- Hosting/setup: `blog/docs/CLOUD_MIGRATION_AND_CLEANUP.md`, `reference/Cloudflare.md` (do not expose credentials).
- R2 helpers: `scripts/r2-upload.py`, `scripts/r2-sync-photos.py`, `scripts/test-r2-public-access.sh|.bat`.

