# Quick Guide: Upload Project Images to R2

## For Projects (like Synthetic Biophilia, Brain Dump)

### 1. Upload Images

```bash
# Single project with thumbs/web structure
python scripts/r2-upload.py dir \
  "projects/[PROJECT_NAME]/assets/images/[bundle-name]" \
  "projects/[project-slug]"

# Example: Synthetic Biophilia
python scripts/r2-upload.py dir \
  "projects/Synthetic Biophilia/assets/images/synthetic-biophilia" \
  "projects/synthetic-biophilia"

# Single project with raw images (no subdirectories)
python scripts/r2-upload.py dir \
  "projects/Brain Dump" \
  "projects/brain-dump"
```

### 2. Create and Upload Manifest

Create `projects/[PROJECT_NAME]/manifest.json`:

```json
{
  "project_name": "project-slug",
  "base_url": "https://media.einoder.net/projects/project-slug",
  "generated_at": "2025-10-30T00:00:00Z",
  "total_images": 11,
  "description": "Project description",
  "images": [
    {
      "id": "image-id",
      "filename": "image.jpg",
      "thumb": "https://media.einoder.net/projects/project-slug/thumbs/image.jpg",
      "web": "https://media.einoder.net/projects/project-slug/web/image.jpg"
    }
  ]
}
```

Upload it:

```bash
python scripts/r2-upload.py file \
  "projects/[PROJECT_NAME]/manifest.json" \
  "projects/[project-slug]/manifest.json"
```

### 3. Update Code References

Update project JavaScript/JSON files to use cloud URLs:

```javascript
// OLD (local)
{ src: 'projects/Project Name/assets/images/bundle/thumbs/image.jpg' }

// NEW (cloud)
{ src: 'https://media.einoder.net/projects/project-slug/web/image.jpg' }
```

---

## For Photo Galleries (art/photos)

Use the specialized photo sync script:

```bash
# Single gallery
python scripts/r2-sync-photos.py gallery \
  "art/Photos/FILM/Life1" \
  "life1"

# All galleries in directory
python scripts/r2-sync-photos.py all \
  "art/Photos/FILM"
```

---

## Verify Upload

```bash
# List all files in a project
python scripts/r2-upload.py list projects/project-slug/

# Test public access (after enabling public access in Cloudflare)
curl -I "https://media.einoder.net/projects/project-slug/manifest.json"
```

---

## URL Patterns

| Type | Pattern |
|------|---------|
| Project Images | `https://media.einoder.net/projects/[slug]/[size]/[filename]` |
| Photo Galleries | `https://media.einoder.net/art/photos/[gallery]/[size]/[filename]` |
| Manifests | `https://media.einoder.net/projects/[slug]/manifest.json` |

**Sizes:** `thumbs/` (≤800px), `web/` (≤2400px), `zoom/` (high-res)

---

## Public Access Setup (One-Time)

1. Go to: https://dash.cloudflare.com/
2. R2 → `assetts-einoder` bucket
3. Settings → **Public Access** → "Allow Access"
4. Settings → **Custom Domains** → Add `media.einoder.net`
5. Wait for DNS propagation (~5 min)

---

## Common Tasks

### Dry Run (Preview Upload)
```bash
python scripts/r2-upload.py dir "projects/MyProject" "projects/my-project" --dry-run
```

### Force Re-upload
```bash
python scripts/r2-sync-photos.py gallery "path/to/gallery" "gallery-name" --force
```

### Delete Project Files
```bash
# List first to confirm
python scripts/r2-upload.py list projects/project-slug/

# Delete (careful!)
aws s3 rm s3://assetts-einoder/projects/project-slug/ --recursive \
  --endpoint-url https://584a79f3f79fa20395a998af9170d670.r2.cloudflarestorage.com \
  --profile r2
```

---

## File Size Guidelines

- **Thumbs:** 800px max, ~50-100 KB each
- **Web:** 2400px max, ~200-500 KB each  
- **Zoom:** 4K-8K, 1-5 MB each (optional)
- **Raw/Original:** Keep local, don't upload unless needed

---

## Completed Uploads

✅ **Synthetic Biophilia** - 23 files (thumbs + web + manifest)  
✅ **Brain Dump** - 18 files (full res + manifest)

**TODO:**
- Hospital project
- Neuma project
- Other projects in `projects/` directory

