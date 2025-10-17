#!/usr/bin/env python3
"""
Batch Image Processor (CLI) - SiteBoy Gallery Pipeline

Processes all images in an input directory into a web-ready bundle:
- originals/ (normalized JPEG, EXIF-rotated, sRGB)
- web/       (max 2400px, JPEG 85)
- thumbs/    (max 800px, JPEG 80)
- manifest.json (minimal metadata)

Usage:
  python gallery-bundle-processor/batch_process.py \
    --input "reference/images to process" \
    --bundle synthetic-biophilia \
    [--output gallery-bundle-processor/output]
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import List, Dict, Any, Tuple

from PIL import Image, ImageOps


def ensure_rgb(image: Image.Image) -> Image.Image:
    if image.mode == 'RGB':
        return image
    if image.mode in ('RGBA', 'LA'):
        bg = Image.new('RGB', image.size, (255, 255, 255))
        if image.mode != 'RGBA':
            image = image.convert('RGBA')
        return Image.alpha_composite(bg.convert('RGBA'), image).convert('RGB')
    return image.convert('RGB')


def process_single_image(src_path: Path, originals_dir: Path, web_dir: Path, thumbs_dir: Path) -> Tuple[Tuple[int, int], Tuple[int, int], Tuple[int, int]]:
    image = Image.open(src_path)
    image = ImageOps.exif_transpose(image)
    image = ensure_rgb(image)

    filename_base = src_path.stem

    # Save normalized original (JPEG 95)
    original_path = originals_dir / f"{filename_base}.jpg"
    image.save(original_path, 'JPEG', quality=95, optimize=True)
    original_size = image.size

    # Web version (max 2400px)
    web_image = image.copy()
    web_image.thumbnail((2400, 2400), Image.Resampling.LANCZOS)
    web_path = web_dir / f"{filename_base}.jpg"
    web_image.save(web_path, 'JPEG', quality=85, optimize=True)
    web_size = web_image.size

    # Thumbnail (max 800px)
    thumb_image = image.copy()
    thumb_image.thumbnail((800, 800), Image.Resampling.LANCZOS)
    thumb_path = thumbs_dir / f"{filename_base}.jpg"
    thumb_image.save(thumb_path, 'JPEG', quality=80, optimize=True)
    thumb_size = thumb_image.size

    return original_size, web_size, thumb_size


def create_manifest(bundle_id: str, title: str, output_dir: Path, slides: List[Dict[str, Any]]) -> None:
    manifest = {
        "bundle_id": bundle_id,
        "title": title,
        "slides": slides,
    }
    manifest_path = output_dir / 'manifest.json'
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)


def main() -> None:
    parser = argparse.ArgumentParser(description='Batch process images into gallery bundle')
    parser.add_argument('--input', required=True, help='Input directory with source images')
    parser.add_argument('--bundle', required=True, help='Bundle ID name (output subfolder)')
    parser.add_argument('--title', default=None, help='Bundle title (defaults to bundle id)')
    parser.add_argument('--output', default='gallery-bundle-processor/output', help='Output root directory')
    args = parser.parse_args()

    input_dir = Path(args.input)
    if not input_dir.exists() or not input_dir.is_dir():
        raise SystemExit(f"Input directory not found: {input_dir}")

    output_root = Path(args.output)
    bundle_dir = output_root / args.bundle
    originals_dir = bundle_dir / 'originals'
    web_dir = bundle_dir / 'web'
    thumbs_dir = bundle_dir / 'thumbs'
    for p in (originals_dir, web_dir, thumbs_dir):
        p.mkdir(parents=True, exist_ok=True)

    exts = {'.jpg', '.jpeg', '.png', '.webp', '.JPG', '.JPEG', '.PNG', '.WEBP'}
    files = [p for p in sorted(input_dir.iterdir()) if p.suffix in exts and p.is_file()]
    if not files:
        raise SystemExit(f"No image files found in: {input_dir}")

    slides: List[Dict[str, Any]] = []
    for idx, src_path in enumerate(files, 1):
        print(f"[{idx}/{len(files)}] Processing {src_path.name}...")
        original_size, web_size, thumb_size = process_single_image(src_path, originals_dir, web_dir, thumbs_dir)
        filename_base = src_path.stem
        slides.append({
            "title": filename_base,
            "caption": "",
            "alt": filename_base,
            "filename": filename_base,
            "type": "image",
            "original_name": src_path.name,
            "original_size": list(original_size),
            "web_size": list(web_size),
            "thumb_size": list(thumb_size),
        })

    create_manifest(args.bundle, args.title or args.bundle, bundle_dir, slides)
    print(f"\n✅ Done. Output: {bundle_dir}")


if __name__ == '__main__':
    main()




