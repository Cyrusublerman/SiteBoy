#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bulk gallery uploader.

Sources:  reference/images to upload/{digital,Objects,physical,Render,book}/
R2 dest:  art/{type}/{gallery-slug}/{thumbs|web|zoom}/{filename}.jpg

R2 folder structure mirrors the reference folder structure exactly,
with folder names lowercased and spaces replaced with hyphens.

Physical nested paths (physical/small/400xf etc.) are preserved as
sub-paths in R2, e.g. art/physical/small/400xf/thumbs/...

Book galleries (NUMERIC_SORT_GALLERIES) sort by trailing integer and
zero-pad stems so page order is preserved in R2 and manifests.
"""

import json
import os
import hashlib
from pathlib import Path
from datetime import datetime, timezone

from PIL import Image, ImageOps
import boto3
from botocore.exceptions import ClientError

# ── Paths ──────────────────────────────────────────────────────────────────────

REPO_ROOT   = Path(__file__).parent.parent.parent
REF_ROOT    = REPO_ROOT / "reference" / "images to upload"
OUTPUT_ROOT = Path(__file__).parent / "output" / "_bulk2"

# ── R2 config ──────────────────────────────────────────────────────────────────

R2 = {
    "account_id": os.getenv("R2_ACCOUNT_ID",      "584a79f3f79fa20395a998af9170d670"),
    "bucket":     os.getenv("R2_BUCKET_NAME",      "assetts-einoder"),
    "access_key": os.getenv("R2_ACCESS_KEY_ID",    "327779b3bbcaa50676f262ca6ec4c473"),
    "secret_key": os.getenv("R2_SECRET_ACCESS_KEY","a11a0212f21268f4340a4ebd9ab1b4d2411c538cabcfc7a216fe7f54750d8f70"),
    "public_url": os.getenv("R2_PUBLIC_URL",        "https://media.einoder.net"),
}

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"}

# ── Gallery map ────────────────────────────────────────────────────────────────
# Each entry: (source_path_relative_to_REF_ROOT, r2_type, r2_slug, direct_only)
# direct_only=True  → only images directly in that folder (no subfolder recursion)
# direct_only=False → recurse, skip reserved dirs (thumbs/web/zoom/originals)

GALLERY_MAP = [
    # ── Digital ───────────────────────────────────────────────────────────────
    ("digital/Bear and Girl",     "digital", "bear-and-girl",    False),
    ("digital/Chopped",           "digital", "chopped",          False),
    ("digital/Experiments",       "digital", "experiments",      False),
    ("digital/Low Effort",        "digital", "low-effort",       False),
    ("digital/MONSTERS",          "digital", "monsters",         False),
    ("digital/Must",              "digital", "must",             False),
    ("digital/Pieces",            "digital", "pieces",           False),
    ("digital/Portraits",         "digital", "portraits",        False),
    ("digital/Posters",           "digital", "posters",          False),
    ("digital/ROUGH",             "digital", "rough",            False),
    ("digital/Simple1",           "digital", "simple1",          False),
    ("digital/Uncertain",         "digital", "uncertain",        False),
    ("digital/Women and Horses",  "digital", "women-and-horses", False),

    # ── Physical ─────────────────────────────────────────────────────────────
    ("physical/Large",            "physical", "large",           False),
    ("physical/Medium",           "physical", "medium",          False),
    ("physical/Primaries",        "physical", "primaries",       False),
    ("physical/Collages",         "physical", "collages",        False),
    # Small root images only (subfolders have their own entries below)
    ("physical/Small",            "physical", "small",           True),
    ("physical/Small/400xf",      "physical", "small/400xf",     False),
    ("physical/Small/Casual",     "physical", "small/casual",    False),
    ("physical/Small/Plastic",    "physical", "small/plastic",   False),

    # ── Objects ───────────────────────────────────────────────────────────────
    ("Objects/guitar1",           "objects",  "guitar1",         False),
    ("Objects/Guitar Small",      "objects",  "guitar-small",    False),
    ("Objects/Plates",            "objects",  "plates",          False),

    # ── Render ────────────────────────────────────────────────────────────────
    # Note: source folder is "Stool," (trailing comma) → slug "stool"
    ("Render/Eternal Ascent",     "render",   "eternal-ascent",  False),
    ("Render/lady on Field",      "render",   "lady-on-field",   False),
    ("Render/Objects",            "render",   "objects",         False),
    ("Render/Stool,",             "render",   "stool",           False),
    ("Render/Toilet",             "render",   "toilet",          False),

    # ── Book ──────────────────────────────────────────────────────────────────
    # Numeric sort required: note_0..note_125. Handled via NUMERIC_SORT_GALLERIES.
    ("book/Notebook 1",           "book",     "notebook-1",      False),
]

# Galleries requiring numeric filename sort (e.g. note_0..note_125).
# process_gallery will sort these by trailing integer rather than lexicographically.
NUMERIC_SORT_GALLERIES = {"book/notebook-1"}

# Image output sizes
SIZES = [
    ("thumbs",    800,  80),
    ("web",      2400,  85),
    ("zoom",     4000,  90),
]

# ── R2 helpers ─────────────────────────────────────────────────────────────────

def r2_client():
    return boto3.client(
        "s3",
        endpoint_url=f"https://{R2['account_id']}.r2.cloudflarestorage.com",
        aws_access_key_id=R2["access_key"],
        aws_secret_access_key=R2["secret_key"],
        region_name="auto",
    )

def file_md5(path: Path) -> str:
    h = hashlib.md5()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()

def upload_file(client, local: Path, key: str, content_type: str) -> str:
    """Upload; skip if identical. Returns 'uploaded'|'skipped'|'failed'."""
    try:
        head = client.head_object(Bucket=R2["bucket"], Key=key)
        if head.get("ETag", "").strip('"') == file_md5(local):
            return "skipped"
    except ClientError:
        pass
    try:
        client.upload_file(
            str(local), R2["bucket"], key,
            ExtraArgs={"ContentType": content_type, "CacheControl": "public, max-age=31536000"},
        )
        return "uploaded"
    except ClientError as e:
        print(f"    FAIL {key}: {e}")
        return "failed"

def put_json(client, key: str, data: dict):
    client.put_object(
        Bucket=R2["bucket"], Key=key,
        Body=json.dumps(data, indent=2),
        ContentType="application/json",
        CacheControl="public, max-age=3600",
    )

# ── Image collection ───────────────────────────────────────────────────────────

SKIP_DIRS = {"thumbs", "web", "zoom", "display", "originals"}

def collect_images(folder: Path, direct_only: bool) -> list[Path]:
    """Collect image files. direct_only=True skips subdirectories."""
    images = []
    if direct_only:
        for p in sorted(folder.iterdir()):
            if p.is_file() and p.suffix.lower() in IMAGE_EXTS:
                images.append(p)
    else:
        for p in sorted(folder.rglob("*")):
            if not p.is_file():
                continue
            if p.suffix.lower() not in IMAGE_EXTS:
                continue
            parts = p.relative_to(folder).parts[:-1]
            if any(part.lower() in SKIP_DIRS for part in parts):
                continue
            images.append(p)
    return images

def safe_stem(path: Path, source_root: Path) -> str:
    """Build a unique stem: subfolder__filename for nested files."""
    rel = path.relative_to(source_root)
    parts = list(rel.parts)
    if len(parts) == 1:
        return parts[0].rsplit(".", 1)[0].replace(" ", "_")
    # Prefix with subfolder path to avoid collisions
    folder_part = "__".join(p.replace(" ", "_") for p in parts[:-1])
    file_part = parts[-1].rsplit(".", 1)[0].replace(" ", "_")
    return f"{folder_part}__{file_part}"

# ── Image processing ───────────────────────────────────────────────────────────

# Increase PIL limit for large canvases
Image.MAX_IMAGE_PIXELS = 500_000_000

def process_image(src: Path, out_dir: Path, stem: str) -> dict | None:
    """Resize to thumbs/web/zoom. Returns size metadata or None on error."""
    try:
        img = ImageOps.exif_transpose(Image.open(src))
        if img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGB")
        elif img.mode == "RGBA":
            bg = Image.new("RGB", img.size, (255, 255, 255))
            bg.paste(img, mask=img.split()[3])
            img = bg

        meta = {}
        for name, max_px, quality in SIZES:
            d = out_dir / name
            d.mkdir(parents=True, exist_ok=True)
            copy = img.copy()
            copy.thumbnail((max_px, max_px), Image.Resampling.LANCZOS)
            dest = d / f"{stem}.jpg"
            copy.save(dest, "JPEG", quality=quality, optimize=True)
            meta[name] = {"width": copy.width, "height": copy.height}

        return meta
    except Exception as e:
        print(f"    ERROR {src.name}: {e}")
        return None

# ── Gallery pipeline ───────────────────────────────────────────────────────────

def build_manifest(r2_prefix: str, r2_type: str, r2_slug: str, stems: list[str]) -> dict:
    base_url = f"{R2['public_url']}/{r2_prefix}"
    return {
        "gallery_type":  r2_type,
        "gallery_name":  r2_slug,
        "base_url":      base_url,
        "generated_at":  datetime.now(timezone.utc).isoformat(),
        "total_images":  len(stems),
        "images": [
            {
                "id":       stem,
                "filename": f"{stem}.jpg",
                "urls": {
                    "thumb": f"{base_url}/thumbs/{stem}.jpg",
                    "web":   f"{base_url}/web/{stem}.jpg",
                    "zoom":  f"{base_url}/zoom/{stem}.jpg",
                },
            }
            for stem in stems
        ],
    }

def _numeric_key(p: Path) -> int:
    import re
    m = re.search(r'(\d+)$', p.stem)
    return int(m.group(1)) if m else 0


def process_gallery(client, src_rel: str, r2_type: str, r2_slug: str, direct_only: bool):
    src_dir   = REF_ROOT / src_rel
    out_dir   = OUTPUT_ROOT / r2_type / r2_slug
    r2_prefix = f"art/{r2_type}/{r2_slug}"
    numeric   = f"{r2_type}/{r2_slug}" in NUMERIC_SORT_GALLERIES

    print(f"\n[{r2_type.upper()}] {src_rel}  ->  {r2_prefix}")

    if not src_dir.exists():
        print(f"  SKIP (source not found)")
        return

    images = collect_images(src_dir, direct_only)
    if not images:
        print(f"  SKIP (0 images)")
        return

    if numeric:
        images = sorted(images, key=_numeric_key)
        print(f"  {len(images)} source images | numeric sort")
    else:
        print(f"  {len(images)} source images", "| direct-only" if direct_only else "| recursive")

    # Process
    stems = []
    pad = len(str(len(images) - 1)) if numeric else 0
    for i, img_path in enumerate(images):
        if numeric:
            stem = f"note_{str(i).zfill(pad)}"
        else:
            stem = safe_stem(img_path, src_dir)
        if process_image(img_path, out_dir, stem):
            stems.append(stem)

    print(f"  processed: {len(stems)}/{len(images)}")

    # Upload
    stats = {"uploaded": 0, "skipped": 0, "failed": 0}
    for size_name, _, _ in SIZES:
        size_dir = out_dir / size_name
        if not size_dir.exists():
            continue
        for f in sorted(size_dir.glob("*.jpg")):
            key = f"{r2_prefix}/{size_name}/{f.name}"
            result = upload_file(client, f, key, "image/jpeg")
            stats[result] += 1

    print(f"  upload: {stats['uploaded']} uploaded, {stats['skipped']} skipped, {stats['failed']} failed")

    # Manifest
    manifest = build_manifest(r2_prefix, r2_type, r2_slug, stems)
    manifest_key = f"{r2_prefix}/manifest.json"
    put_json(client, manifest_key, manifest)
    print(f"  manifest -> {manifest_key}")

# ── Entry point ────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("Bulk Gallery Uploader — reference/images to upload/")
    print("=" * 60)

    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    client = r2_client()

    current_type = None
    for src_rel, r2_type, r2_slug, direct_only in GALLERY_MAP:
        if r2_type != current_type:
            current_type = r2_type
            print(f"\n{'=' * 40}")
            print(f"  {r2_type.upper()}")
            print(f"{'=' * 40}")
        process_gallery(client, src_rel, r2_type, r2_slug, direct_only)

    print("\n" + "=" * 60)
    print("Done.")

if __name__ == "__main__":
    main()
