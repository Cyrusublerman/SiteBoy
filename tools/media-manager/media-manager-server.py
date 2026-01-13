#!/usr/bin/env python3
"""
Media Manager API Server
Local Flask API for the browser-based Media Manager tool.
Handles file staging, processing, and R2 upload.
"""

import os
import sys
import json
import hashlib
import shutil
from pathlib import Path
from datetime import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from PIL import Image, ImageOps

# R2/S3 support
try:
    import boto3
    from botocore.exceptions import ClientError
    R2_AVAILABLE = True
except ImportError:
    R2_AVAILABLE = False

# ═══════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════

API_PORT = 5555
STAGING_DIR = Path(__file__).parent / "staging"
RAW_DIR = STAGING_DIR / "raw"
PROCESSED_DIR = STAGING_DIR / "processed"
STAGING_JSON = STAGING_DIR / "staging.json"

# Image processing settings
VARIANTS = {
    "thumb": {"max_size": 400, "quality": 75},
    "web": {"max_size": 1600, "quality": 85},
    "zoom": {"max_size": 2400, "quality": 90},
}

# R2 Configuration
R2_CONFIG = {
    "account_id": os.getenv("R2_ACCOUNT_ID", "584a79f3f79fa20395a998af9170d670"),
    "bucket_name": os.getenv("R2_BUCKET_NAME", "assetts-einoder"),
    "access_key": os.getenv("R2_ACCESS_KEY_ID", "327779b3bbcaa50676f262ca6ec4c473"),
    "secret_key": os.getenv("R2_SECRET_ACCESS_KEY", "a11a0212f21268f4340a4ebd9ab1b4d2411c538cabcfc7a216fe7f54750d8f70"),
    "public_url": os.getenv("R2_PUBLIC_URL", "https://media.einoder.net"),
}

# ═══════════════════════════════════════════════════════════════════
# FLASK APP
# ═══════════════════════════════════════════════════════════════════

app = Flask(__name__)
CORS(app, 
     origins=["http://localhost:3007", "http://127.0.0.1:3007"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"],
     supports_credentials=True)

# ═══════════════════════════════════════════════════════════════════
# HELPERS
# ═══════════════════════════════════════════════════════════════════

def ensure_dirs():
    """Create staging directories if they don't exist."""
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    for variant in VARIANTS:
        (PROCESSED_DIR / variant).mkdir(exist_ok=True)

def load_staging():
    """Load staging.json or return empty structure."""
    if STAGING_JSON.exists():
        with open(STAGING_JSON, "r") as f:
            return json.load(f)
    return {"files": [], "groups": []}

def save_staging(data):
    """Save staging.json."""
    with open(STAGING_JSON, "w") as f:
        json.dump(data, f, indent=2)

def generate_id(filename):
    """Generate a unique ID from filename."""
    base = Path(filename).stem.lower()
    # Replace spaces and special chars with hyphens
    clean = "".join(c if c.isalnum() else "-" for c in base)
    clean = "-".join(filter(None, clean.split("-")))
    return clean

def get_file_hash(file_path):
    """Calculate MD5 hash of file."""
    md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            md5.update(chunk)
    return md5.hexdigest()

def get_r2_client():
    """Get configured R2/S3 client."""
    if not R2_AVAILABLE:
        return None
    endpoint = f"https://{R2_CONFIG['account_id']}.r2.cloudflarestorage.com"
    return boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=R2_CONFIG['access_key'],
        aws_secret_access_key=R2_CONFIG['secret_key'],
        region_name="auto",
    )

# ═══════════════════════════════════════════════════════════════════
# IMAGE PROCESSING
# ═══════════════════════════════════════════════════════════════════

def process_image(file_path, file_id):
    """Process an image: create thumb, web, zoom variants."""
    results = {"id": file_id, "variants": {}}
    
    try:
        with Image.open(file_path) as img:
            # Apply EXIF orientation
            img = ImageOps.exif_transpose(img)
            
            # Convert to RGB if necessary
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            
            original_size = img.size
            results["original_size"] = list(original_size)
            results["aspect"] = round(original_size[0] / original_size[1], 3)
            
            # Create variants
            for variant_name, settings in VARIANTS.items():
                variant_dir = PROCESSED_DIR / variant_name
                output_path = variant_dir / f"{file_id}.jpg"
                
                # Resize
                max_size = settings["max_size"]
                img_copy = img.copy()
                img_copy.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
                
                # Save
                img_copy.save(output_path, "JPEG", quality=settings["quality"], optimize=True)
                
                results["variants"][variant_name] = {
                    "path": str(output_path),
                    "size": list(img_copy.size),
                    "filesize": output_path.stat().st_size,
                }
        
        results["status"] = "processed"
        
    except Exception as e:
        results["status"] = "failed"
        results["error"] = str(e)
    
    return results

# ═══════════════════════════════════════════════════════════════════
# API ROUTES
# ═══════════════════════════════════════════════════════════════════

@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({
        "status": "ok",
        "r2_available": R2_AVAILABLE,
        "staging_dir": str(STAGING_DIR),
    })

@app.route("/api/stage", methods=["POST"])
def stage_files():
    """Receive and store uploaded files."""
    ensure_dirs()
    
    if "files" not in request.files:
        return jsonify({"error": "No files provided"}), 400
    
    files = request.files.getlist("files")
    staging = load_staging()
    results = []
    
    # Get folder paths if provided
    paths_json = request.form.get("paths", "{}")
    try:
        folder_paths = json.loads(paths_json)
    except json.JSONDecodeError:
        folder_paths = {}
    
    for file in files:
        if not file.filename:
            continue
        
        # Generate ID and save
        file_id = generate_id(file.filename)
        
        # Check for duplicates, add suffix if needed
        existing_ids = {f["id"] for f in staging["files"]}
        original_id = file_id
        counter = 1
        while file_id in existing_ids:
            file_id = f"{original_id}-{counter}"
            counter += 1
        
        # Determine extension
        ext = Path(file.filename).suffix.lower()
        if ext not in [".jpg", ".jpeg", ".png", ".gif", ".webp"]:
            ext = ".jpg"
        
        # Save raw file
        raw_path = RAW_DIR / f"{file_id}{ext}"
        file.save(raw_path)
        
        # Get folder path from drag info
        folder_path = folder_paths.get(file.filename, "")
        
        # Get file info
        file_info = {
            "id": file_id,
            "original_name": file.filename,
            "folder_path": folder_path,  # Store folder path for organisation
            "raw_path": str(raw_path),
            "extension": ext,
            "filesize": raw_path.stat().st_size,
            "staged_at": datetime.utcnow().isoformat() + "Z",
            "status": "staged",
            "metadata": {
                "title": "",
                "alt": "",
                "caption": "",
                "tags": [],
                "gallery": "",
                "gallery_type": "photos",
                "source_folder": folder_path,  # Also in metadata for export
            }
        }
        
        staging["files"].append(file_info)
        results.append(file_info)
    
    save_staging(staging)
    
    return jsonify({
        "success": True,
        "count": len(results),
        "files": results,
    })

@app.route("/api/staged", methods=["GET"])
def get_staged():
    """List all staged files."""
    staging = load_staging()
    return jsonify(staging)

@app.route("/api/staged/<file_id>", methods=["GET"])
def get_staged_file(file_id):
    """Get info for a specific staged file."""
    staging = load_staging()
    for f in staging["files"]:
        if f["id"] == file_id:
            return jsonify(f)
    return jsonify({"error": "File not found"}), 404

@app.route("/api/staged/<file_id>", methods=["DELETE"])
def delete_staged_file(file_id):
    """Delete a staged file."""
    staging = load_staging()
    
    # Find and remove file
    file_info = None
    for i, f in enumerate(staging["files"]):
        if f["id"] == file_id:
            file_info = staging["files"].pop(i)
            break
    
    if not file_info:
        return jsonify({"error": "File not found"}), 404
    
    # Delete raw file
    raw_path = Path(file_info["raw_path"])
    if raw_path.exists():
        raw_path.unlink()
    
    # Delete processed variants
    for variant in VARIANTS:
        variant_path = PROCESSED_DIR / variant / f"{file_id}.jpg"
        if variant_path.exists():
            variant_path.unlink()
    
    save_staging(staging)
    
    return jsonify({"success": True, "deleted": file_id})

@app.route("/api/staged/<file_id>/thumb", methods=["GET"])
def get_thumb(file_id):
    """Get thumbnail for a staged file."""
    # Check if processed thumb exists
    thumb_path = PROCESSED_DIR / "thumb" / f"{file_id}.jpg"
    if thumb_path.exists():
        return send_file(thumb_path, mimetype="image/jpeg")
    
    # Otherwise serve raw file
    staging = load_staging()
    for f in staging["files"]:
        if f["id"] == file_id:
            raw_path = Path(f["raw_path"])
            if raw_path.exists():
                return send_file(raw_path)
    
    return jsonify({"error": "File not found"}), 404

@app.route("/api/metadata", methods=["POST"])
def update_metadata():
    """Update metadata for one or more files."""
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    file_ids = data.get("ids", [])
    metadata_updates = data.get("metadata", {})
    
    if not file_ids:
        return jsonify({"error": "No file IDs provided"}), 400
    
    staging = load_staging()
    updated = []
    
    for f in staging["files"]:
        if f["id"] in file_ids:
            # Merge metadata updates
            for key, value in metadata_updates.items():
                if key == "tags" and isinstance(value, list):
                    # For tags, extend existing
                    existing = f["metadata"].get("tags", [])
                    f["metadata"]["tags"] = list(set(existing + value))
                else:
                    f["metadata"][key] = value
            updated.append(f["id"])
    
    save_staging(staging)
    
    return jsonify({
        "success": True,
        "updated": updated,
    })

@app.route("/api/process", methods=["POST"])
def process_files():
    """Process staged files (create variants)."""
    ensure_dirs()
    
    data = request.json or {}
    file_ids = data.get("ids", [])
    
    staging = load_staging()
    
    # If no IDs specified, process all staged files
    if not file_ids:
        file_ids = [f["id"] for f in staging["files"] if f["status"] == "staged"]
    
    results = []
    
    for f in staging["files"]:
        if f["id"] in file_ids:
            raw_path = Path(f["raw_path"])
            if raw_path.exists():
                result = process_image(raw_path, f["id"])
                
                # Update file info
                f["status"] = result["status"]
                if "original_size" in result:
                    f["original_size"] = result["original_size"]
                    f["aspect"] = result["aspect"]
                if "variants" in result:
                    f["variants"] = result["variants"]
                if "error" in result:
                    f["error"] = result["error"]
                
                results.append(result)
    
    save_staging(staging)
    
    return jsonify({
        "success": True,
        "processed": len(results),
        "results": results,
    })

@app.route("/api/upload", methods=["POST"])
def upload_to_r2():
    """Upload processed files to R2."""
    if not R2_AVAILABLE:
        return jsonify({"error": "boto3 not available"}), 500
    
    data = request.json or {}
    file_ids = data.get("ids", [])
    gallery = data.get("gallery", "")
    gallery_type = data.get("gallery_type", "photos")
    
    if not gallery:
        return jsonify({"error": "Gallery name required"}), 400
    
    staging = load_staging()
    client = get_r2_client()
    
    # If no IDs specified, upload all processed files
    if not file_ids:
        file_ids = [f["id"] for f in staging["files"] if f["status"] == "processed"]
    
    stats = {"uploaded": 0, "skipped": 0, "failed": 0}
    uploaded_files = []
    
    for f in staging["files"]:
        if f["id"] not in file_ids:
            continue
        if f["status"] != "processed":
            continue
        
        file_id = f["id"]
        
        # Upload each variant
        for variant_name in ["thumb", "web", "zoom"]:
            variant_path = PROCESSED_DIR / variant_name / f"{file_id}.jpg"
            if not variant_path.exists():
                continue
            
            # R2 key
            if gallery_type == "projects":
                r2_key = f"projects/{gallery}/{variant_name}/{file_id}.jpg"
            else:
                r2_key = f"art/{gallery_type}/{gallery}/{variant_name}/{file_id}.jpg"
            
            try:
                client.upload_file(
                    str(variant_path),
                    R2_CONFIG["bucket_name"],
                    r2_key,
                    ExtraArgs={
                        "ContentType": "image/jpeg",
                        "CacheControl": "public, max-age=31536000",
                    }
                )
                stats["uploaded"] += 1
            except ClientError as e:
                stats["failed"] += 1
                f["upload_error"] = str(e)
        
        f["status"] = "uploaded"
        f["uploaded_at"] = datetime.utcnow().isoformat() + "Z"
        f["r2_gallery"] = gallery
        f["r2_gallery_type"] = gallery_type
        uploaded_files.append(f)
    
    # Generate and upload manifest
    if uploaded_files:
        manifest = generate_manifest(gallery, gallery_type, uploaded_files)
        upload_manifest(client, gallery, gallery_type, manifest)
    
    save_staging(staging)
    
    return jsonify({
        "success": stats["failed"] == 0,
        "stats": stats,
        "manifest_url": f"{R2_CONFIG['public_url']}/art/{gallery_type}/{gallery}/manifest.json" if gallery_type != "projects" else f"{R2_CONFIG['public_url']}/projects/{gallery}/manifest.json",
    })

def generate_manifest(gallery, gallery_type, files):
    """Generate R2 manifest from uploaded files."""
    if gallery_type == "projects":
        base_url = f"{R2_CONFIG['public_url']}/projects/{gallery}"
    else:
        base_url = f"{R2_CONFIG['public_url']}/art/{gallery_type}/{gallery}"
    
    manifest = {
        "gallery_name": gallery,
        "base_url": base_url,
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "total_images": len(files),
        "images": []
    }
    
    for f in files:
        manifest["images"].append({
            "id": f["id"],
            "filename": f"{f['id']}.jpg",
            "alt": f["metadata"].get("alt", ""),
            "caption": f["metadata"].get("caption", ""),
            "tags": f["metadata"].get("tags", []),
            "urls": {
                "thumb": f"{base_url}/thumb/{f['id']}.jpg",
                "web": f"{base_url}/web/{f['id']}.jpg",
                "zoom": f"{base_url}/zoom/{f['id']}.jpg",
            }
        })
    
    return manifest

def upload_manifest(client, gallery, gallery_type, manifest):
    """Upload manifest.json to R2."""
    if gallery_type == "projects":
        r2_key = f"projects/{gallery}/manifest.json"
    else:
        r2_key = f"art/{gallery_type}/{gallery}/manifest.json"
    
    try:
        client.put_object(
            Bucket=R2_CONFIG["bucket_name"],
            Key=r2_key,
            Body=json.dumps(manifest, indent=2),
            ContentType="application/json",
            CacheControl="public, max-age=3600",
        )
    except ClientError as e:
        print(f"Failed to upload manifest: {e}")

@app.route("/api/galleries", methods=["GET"])
def list_galleries():
    """List galleries on R2."""
    if not R2_AVAILABLE:
        return jsonify({"error": "boto3 not available"}), 500
    
    client = get_r2_client()
    galleries = []
    
    # Known prefixes to scan
    prefixes = ["art/photos/", "art/digital/", "art/objects/", "projects/"]
    
    for prefix in prefixes:
        try:
            response = client.list_objects_v2(
                Bucket=R2_CONFIG["bucket_name"],
                Prefix=prefix,
                Delimiter="/"
            )
            
            for common_prefix in response.get("CommonPrefixes", []):
                folder = common_prefix["Prefix"]
                gallery_name = folder.rstrip("/").split("/")[-1]
                
                # Determine type
                if prefix.startswith("art/photos"):
                    gallery_type = "photos"
                elif prefix.startswith("art/digital"):
                    gallery_type = "digital"
                elif prefix.startswith("art/objects"):
                    gallery_type = "objects"
                else:
                    gallery_type = "projects"
                
                galleries.append({
                    "id": gallery_name,
                    "type": gallery_type,
                    "path": folder,
                })
        except ClientError:
            pass
    
    return jsonify({"galleries": galleries})

@app.route("/api/gallery/<gallery_type>/<gallery_name>", methods=["GET"])
def get_gallery(gallery_type, gallery_name):
    """Get manifest for a specific gallery."""
    if gallery_type == "projects":
        manifest_url = f"{R2_CONFIG['public_url']}/projects/{gallery_name}/manifest.json"
    else:
        manifest_url = f"{R2_CONFIG['public_url']}/art/{gallery_type}/{gallery_name}/manifest.json"
    
    import urllib.request
    try:
        with urllib.request.urlopen(manifest_url) as response:
            manifest = json.loads(response.read().decode())
            return jsonify(manifest)
    except Exception as e:
        return jsonify({"error": str(e)}), 404

@app.route("/api/gallery-by-path/<path:gallery_path>", methods=["GET"])
def get_gallery_by_path(gallery_path):
    """
    Get manifest for a gallery using its full path.
    Path format: art/photos/Life1 or projects/brain-dump
    """
    import urllib.request
    
    # Construct manifest URL from path
    manifest_url = f"{R2_CONFIG['public_url']}/{gallery_path}/manifest.json"
    
    try:
        with urllib.request.urlopen(manifest_url) as response:
            manifest = json.loads(response.read().decode())
            # Add path info to manifest
            manifest['path'] = gallery_path
            manifest['base_url'] = f"{R2_CONFIG['public_url']}/{gallery_path}"
            return jsonify(manifest)
    except Exception as e:
        print(f"[R2] Failed to load manifest from {manifest_url}: {e}")
        return jsonify({"error": str(e), "path": gallery_path}), 404


@app.route("/api/update-manifest", methods=["POST"])
def update_manifest():
    """Update manifest on R2 with new metadata."""
    if not R2_AVAILABLE:
        return jsonify({"error": "boto3 not available"}), 500
    
    data = request.get_json()
    gallery_path = data.get("path")
    manifest = data.get("manifest")
    
    if not gallery_path or not manifest:
        return jsonify({"error": "path and manifest required"}), 400
    
    # Construct R2 key for manifest
    r2_key = f"{gallery_path}/manifest.json"
    
    try:
        client = get_r2_client()
        
        # Upload updated manifest
        manifest_json = json.dumps(manifest, indent=2)
        client.put_object(
            Bucket=R2_CONFIG["bucket_name"],
            Key=r2_key,
            Body=manifest_json,
            ContentType="application/json"
        )
        
        print(f"[R2] Updated manifest: {r2_key}")
        return jsonify({
            "success": True,
            "path": gallery_path,
            "url": f"{R2_CONFIG['public_url']}/{r2_key}"
        })
    except Exception as e:
        print(f"[R2] Failed to update manifest: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/clear", methods=["POST"])
def clear_staging():
    """Clear all staged files."""
    # Delete staging directory contents
    if STAGING_DIR.exists():
        shutil.rmtree(STAGING_DIR)
    ensure_dirs()
    save_staging({"files": [], "groups": []})
    
    return jsonify({"success": True})

# ═══════════════════════════════════════════════════════════════════
# FOLDER STRUCTURE
# ═══════════════════════════════════════════════════════════════════

FOLDER_STRUCTURE_FILE = Path(__file__).parent / "folder-structure.json"

def load_folder_structure():
    """Load folder structure from JSON file."""
    if FOLDER_STRUCTURE_FILE.exists():
        with open(FOLDER_STRUCTURE_FILE, "r") as f:
            return json.load(f)
    return {
        "art": {
            "books": {},
            "digital": {"posters": {}, "experiments": {}, "generative": {}, "rough": {}, "renders": {}, "AI": {}},
            "objects": {},
            "physical": {"collages": {}, "large": {}, "medium": {}, "primaries": {}, "small": {}},
            "photography": {}
        }
    }

def save_folder_structure(structure):
    """Save folder structure to JSON file."""
    with open(FOLDER_STRUCTURE_FILE, "w") as f:
        json.dump(structure, f, indent=2)

@app.route("/api/folders", methods=["GET"])
def get_folders():
    """Get the folder structure."""
    structure = load_folder_structure()
    return jsonify({"structure": structure})

@app.route("/api/folders", methods=["POST"])
def update_folders():
    """Update the folder structure."""
    data = request.get_json()
    if not data or "structure" not in data:
        return jsonify({"error": "No structure provided"}), 400
    
    save_folder_structure(data["structure"])
    return jsonify({"success": True})

# ═══════════════════════════════════════════════════════════════════
# R2 FOLDER STRUCTURE (ACTUAL DIRECTORIES)
# ═══════════════════════════════════════════════════════════════════

@app.route("/api/r2-folders", methods=["GET"])
def get_r2_folders():
    """
    Scan R2 and return the actual folder structure.
    This is used by the LIBRARY tab to browse existing galleries.
    """
    if not R2_AVAILABLE:
        return jsonify({"error": "boto3 not available", "structure": {}}), 500
    
    client = get_r2_client()
    
    # Internal folders to skip (image variants, not galleries)
    SKIP_FOLDERS = {"thumbs", "web", "zoom", "originals"}
    
    def scan_prefix(prefix, depth=0, max_depth=4):
        """Recursively scan a prefix and build folder tree."""
        if depth >= max_depth:
            return {}
        
        result = {}
        try:
            paginator = client.get_paginator('list_objects_v2')
            pages = paginator.paginate(
                Bucket=R2_CONFIG["bucket_name"],
                Prefix=prefix,
                Delimiter="/"
            )
            
            for page in pages:
                for common_prefix in page.get("CommonPrefixes", []):
                    folder_path = common_prefix["Prefix"]
                    folder_name = folder_path.rstrip("/").split("/")[-1]
                    
                    # Skip hidden folders, special folders, and variant folders
                    if folder_name.startswith(".") or folder_name.startswith("_"):
                        continue
                    if folder_name in SKIP_FOLDERS:
                        continue
                    
                    # Recursively scan children
                    result[folder_name] = scan_prefix(folder_path, depth + 1, max_depth)
                    
        except ClientError as e:
            print(f"Error scanning {prefix}: {e}")
        
        return result
    
    # Start scan from root - focus on art/ and projects/
    structure = {}
    
    # Scan art/ directory
    art_structure = scan_prefix("art/", 0, 4)
    if art_structure:
        structure["art"] = art_structure
    
    # Scan projects/ directory
    projects_structure = scan_prefix("projects/", 0, 4)
    if projects_structure:
        structure["projects"] = projects_structure
    
    # Also scan for any top-level folders
    try:
        response = client.list_objects_v2(
            Bucket=R2_CONFIG["bucket_name"],
            Prefix="",
            Delimiter="/"
        )
        for common_prefix in response.get("CommonPrefixes", []):
            folder_name = common_prefix["Prefix"].rstrip("/")
            if folder_name not in structure and not folder_name.startswith("."):
                # Scan this top-level folder
                folder_structure = scan_prefix(common_prefix["Prefix"], 0, 4)
                if folder_structure or folder_name in ["art", "projects"]:
                    structure[folder_name] = folder_structure
    except ClientError as e:
        print(f"Error scanning root: {e}")
    
    return jsonify({"structure": structure})

@app.route("/api/r2-create-folder", methods=["POST"])
def create_r2_folder():
    """
    Create a new folder on R2.
    R2/S3 doesn't have real folders, but we can create an empty placeholder object
    to make the "folder" appear in listings.
    """
    if not R2_AVAILABLE:
        return jsonify({"error": "boto3 not available"}), 500
    
    data = request.get_json()
    if not data or "path" not in data:
        return jsonify({"error": "No path provided"}), 400
    
    path = data["path"].strip("/")
    if not path:
        return jsonify({"error": "Empty path"}), 400
    
    # Validate path (alphanumeric, hyphens, slashes only)
    import re
    if not re.match(r'^[a-zA-Z0-9\-/]+$', path):
        return jsonify({"error": "Invalid path characters"}), 400
    
    client = get_r2_client()
    
    # Create a placeholder object to make the folder appear
    # R2/S3 uses trailing slash to indicate folder
    folder_key = f"{path}/.keep"
    
    try:
        client.put_object(
            Bucket=R2_CONFIG["bucket_name"],
            Key=folder_key,
            Body=b"",  # Empty content
            ContentType="application/x-directory"
        )
        print(f"[R2] Created folder: {path}")
        return jsonify({"success": True, "path": path})
    except ClientError as e:
        print(f"[R2] Failed to create folder {path}: {e}")
        return jsonify({"error": str(e)}), 500

# ═══════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    ensure_dirs()
    print(f"[MediaManager] API starting on http://localhost:{API_PORT}")
    print(f"[MediaManager] Staging directory: {STAGING_DIR}")
    print(f"[MediaManager] R2 available: {R2_AVAILABLE}")
    app.run(host="127.0.0.1", port=API_PORT, debug=True)

