# SiteBoy Scripts

This directory contains various utility scripts for managing the SiteBoy project.

## 📦 R2 Storage Scripts (NEW)

Complete Cloudflare R2 integration for media asset storage and CDN delivery.

### Setup Scripts
- **`r2-setup.sh`** - Automated R2 setup (Unix/Mac)
- **`r2-setup.bat`** - Automated R2 setup (Windows)

### Upload & Sync Scripts
- **`r2-upload.py`** - Generic file/directory uploader
- **`r2-sync-photos.py`** - Photo gallery sync with manifest generation
- **`r2-migrate-all.py`** - Complete migration orchestration
- **`process-and-upload-photos.py`** - Automated photo processing + upload workflow

### Documentation
- See `reference/Cloudflare.md` for complete R2 configuration
- See `reference/R2_MIGRATION_GUIDE.md` for step-by-step migration
- See `reference/R2_QUICK_REFERENCE.md` for command quick reference

### Quick Start
```bash
# Initial setup
bash r2-setup.sh

# Upload a gallery
python r2-upload.py dir ../art/Photos/FILM/Life1 photos/life1 --dry-run

# Process and upload photos
python process-and-upload-photos.py single ../art/Photos/FILM/Life1 life1
```

---

## 📸 Photo Processing Scripts

### Image Processing
- **`process-photos.py`** - Process photos (resize, optimize)
- **`process-photos-inplace.py`** - Process photos in place
- **`process-all-photos.bat`** - Batch process all photos (Windows)

### Gallery Tools
- **`gallery-bundle-processor/`** - Complete gallery processing suite
  - `app.py` - Gallery processor with web UI
  - `batch_process.py` - Batch processing script
  - See `gallery-bundle-processor/FEATURES.md` for details

---

## 🛠️ Development Tools

### Component Generation
- **`create-component.sh`** - Generate new component boilerplate

### Server
- **`no-cache-server.py`** - Development server with cache disabled

### Migration
- **`migration/`** - Migration utilities
  - `inventory-assets.py` - Inventory asset files

### Utilities
- **`pdf2md-here.py`** - Convert PDF to Markdown

---

## 🔧 Usage Examples

### R2 Upload Examples
```bash
# Upload single file
python r2-upload.py file image.jpg photos/test/image.jpg

# Upload directory
python r2-upload.py dir ../art/Photos/FILM/Life1 photos/life1

# List bucket contents
python r2-upload.py list photos/

# Process and upload workflow
python process-and-upload-photos.py single ../art/Photos/FILM/Life1 life1 --dry-run
```

### Photo Processing Examples
```bash
# Process single gallery
python process-photos.py ../art/Photos/FILM/Life1

# Process all galleries
process-all-photos.bat
```

### Development Server
```bash
# Start no-cache server
python no-cache-server.py
```

---

## 📋 Dependencies

### R2 Scripts
- Python 3.7+
- boto3: `pip install boto3`
- AWS CLI (optional): For direct CLI operations

### Photo Processing
- Python 3.7+
- Pillow: `pip install Pillow`

---

## 🔐 Environment Variables

Create `.env.r2` file (from `.env.r2.example`):
```bash
export R2_ACCOUNT_ID="your-account-id"
export R2_BUCKET_NAME="your-bucket-name"
export R2_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
export R2_ACCESS_KEY_ID="your-access-key"
export R2_SECRET_ACCESS_KEY="your-secret-key"
export R2_PUBLIC_URL="https://media.yourdomain.com"
```

**Note:** `.env.r2` is gitignored - never commit credentials!

---

## 📚 Additional Resources

- **R2 Configuration:** `../reference/Cloudflare.md`
- **Migration Guide:** `../reference/R2_MIGRATION_GUIDE.md`
- **Quick Reference:** `../reference/R2_QUICK_REFERENCE.md`
- **Integration Examples:** `../assets/js/shared/r2-integration-example.js`

---

## 🚀 Quick Links

- Cloudflare R2 Dashboard: https://dash.cloudflare.com/
- AWS CLI S3 Reference: https://docs.aws.amazon.com/cli/latest/reference/s3/
- boto3 Documentation: https://boto3.amazonaws.com/

---

**For complete R2 setup instructions, see:** `../reference/R2_MIGRATION_GUIDE.md`

