#!/usr/bin/env python3
"""
Simple Photo Processor for SiteBoy Gallery
Converts a folder of images to 3 sizes: thumbs, web, zoom

Usage:
  python scripts/process-photos.py art/Photos/FILM/Life1 art/Photos/processed/life1
  python scripts/process-photos.py art/Photos/FILM/Morocco art/Photos/processed/morocco --quality 85

Outputs:
  thumbs/     - 800px max (80% quality) - for gallery lazy loading
  web/        - 2400px max (85% quality) - for modal display
  zoom/       - 4000px max (95% quality) - full resolution backup
  manifest.json - metadata for all images
"""

import argparse
import concurrent.futures as cf
import json
import sys
from pathlib import Path
from typing import List, Dict, Tuple
from PIL import Image, ImageOps

# ==============================================
# Configuration (simple and focused)
# ==============================================

SIZES = {
    'thumbs': {'max_size': 800, 'quality': 80},
    'web': {'max_size': 2400, 'quality': 85},
    'zoom': {'max_size': 4000, 'quality': 95}
}

SUPPORTED_EXTS = {'.jpg', '.jpeg', '.JPG', '.JPEG', '.png', '.PNG', '.webp', '.WEBP', '.heic', '.HEIC'}

# ==============================================
# Image Processing
# ==============================================

def load_and_normalize(src_path: Path) -> Image.Image:
    """
    Load image and apply EXIF orientation + sRGB conversion
    """
    try:
        img = Image.open(src_path)
        img.load()
        
        # Fix EXIF orientation (auto-rotate based on camera metadata)
        img = ImageOps.exif_transpose(img)
        
        # Convert to RGB if needed (handles RGBA, CMYK, etc.)
        if img.mode not in ('RGB', 'L'):
            # If has transparency, paste on white background
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                if 'transparency' in img.info or img.mode in ('RGBA', 'LA'):
                    try:
                        background.paste(img, mask=img.split()[-1])
                        img = background
                    except:
                        img = img.convert('RGB')
                else:
                    img = img.convert('RGB')
            else:
                img = img.convert('RGB')
        elif img.mode == 'L':
            img = img.convert('RGB')
        
        return img
    
    except Exception as e:
        raise RuntimeError(f"Failed to load {src_path.name}: {e}")


def calculate_resize(orig_w: int, orig_h: int, max_size: int) -> Tuple[int, int]:
    """
    Calculate new dimensions maintaining aspect ratio
    max_size applies to longest edge
    """
    if orig_w >= orig_h:
        # Landscape or square
        if orig_w <= max_size:
            return orig_w, orig_h  # Don't upscale
        ratio = max_size / orig_w
    else:
        # Portrait
        if orig_h <= max_size:
            return orig_w, orig_h  # Don't upscale
        ratio = max_size / orig_h
    
    new_w = max(1, round(orig_w * ratio))
    new_h = max(1, round(orig_h * ratio))
    return new_w, new_h


def process_image(
    src_path: Path,
    output_base: Path,
    force: bool = False,
    verbose: bool = True
) -> Dict:
    """
    Process single image to all 3 sizes
    Returns metadata dict
    """
    basename = src_path.stem
    
    # Skip check (if all outputs exist and are newer than source)
    if not force:
        all_exist = all(
            (output_base / size_name / f"{basename}.jpg").exists()
            for size_name in SIZES.keys()
        )
        if all_exist:
            oldest_output = min(
                (output_base / size_name / f"{basename}.jpg").stat().st_mtime
                for size_name in SIZES.keys()
            )
            if oldest_output >= src_path.stat().st_mtime:
                if verbose:
                    print(f"⏭️  Skip (fresh): {src_path.name}")
                return None  # Will be filtered out
    
    # Load and normalize
    img = load_and_normalize(src_path)
    orig_w, orig_h = img.size
    
    result = {
        'filename': basename,
        'original_name': src_path.name,
        'original_size': [orig_w, orig_h],
        'aspect': round(orig_w / orig_h, 3),
        'sizes': {}
    }
    
    # Process each size
    for size_name, config in SIZES.items():
        out_dir = output_base / size_name
        out_dir.mkdir(parents=True, exist_ok=True)
        
        out_path = out_dir / f"{basename}.jpg"
        
        # Calculate dimensions
        new_w, new_h = calculate_resize(orig_w, orig_h, config['max_size'])
        
        # Resize if needed
        if new_w != orig_w or new_h != orig_h:
            resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        else:
            resized = img
        
        # Save as optimized JPEG
        resized.save(
            out_path,
            format='JPEG',
            quality=config['quality'],
            optimize=True,
            progressive=True,  # Progressive JPEG for better web loading
            subsampling='4:2:0'  # Standard chroma subsampling
        )
        
        result['sizes'][size_name] = {
            'width': new_w,
            'height': new_h,
            'path': f"{size_name}/{basename}.jpg",
            'filesize': out_path.stat().st_size
        }
    
    if verbose:
        print(f"✅ {src_path.name} → {result['sizes']['thumbs']['width']}w, "
              f"{result['sizes']['web']['width']}w, {result['sizes']['zoom']['width']}w")
    
    return result


# ==============================================
# Batch Processing
# ==============================================

def find_images(input_dir: Path) -> List[Path]:
    """
    Find all supported images in directory (non-recursive)
    """
    images = []
    for ext in SUPPORTED_EXTS:
        images.extend(input_dir.glob(f"*{ext}"))
    
    # Sort for consistent ordering
    return sorted(images)


def process_batch(
    input_dir: Path,
    output_dir: Path,
    workers: int = 4,
    force: bool = False,
    verbose: bool = True
) -> List[Dict]:
    """
    Process all images in parallel
    """
    images = find_images(input_dir)
    
    if not images:
        print(f"❌ No images found in {input_dir}")
        return []
    
    print(f"📸 Found {len(images)} images")
    print(f"🔧 Processing with {workers} workers...")
    print()
    
    results = []
    
    with cf.ThreadPoolExecutor(max_workers=workers) as executor:
        futures = [
            executor.submit(process_image, img, output_dir, force, verbose)
            for img in images
        ]
        
        for future in cf.as_completed(futures):
            try:
                result = future.result()
                if result:  # Skip None (cached)
                    results.append(result)
            except Exception as e:
                print(f"❌ Error: {e}", file=sys.stderr)
    
    return sorted(results, key=lambda x: x['filename'])


def write_manifest(output_dir: Path, results: List[Dict], metadata: Dict = None):
    """
    Write manifest.json with all image metadata
    """
    manifest = {
        'meta': metadata or {},
        'image_count': len(results),
        'images': results
    }
    
    manifest_path = output_dir / 'manifest.json'
    manifest_path.write_text(json.dumps(manifest, indent=2))
    
    return manifest_path


# ==============================================
# CLI
# ==============================================

def main():
    parser = argparse.ArgumentParser(
        description='Process photos to thumbs (800px), web (2400px), zoom (4000px)',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scripts/process-photos.py art/Photos/FILM/Life1 art/Photos/processed/life1
  python scripts/process-photos.py art/Photos/FILM/Morocco art/Photos/processed/morocco --workers 8
  python scripts/process-photos.py art/Photos/FILM/Snow art/Photos/processed/snow --force
        """
    )
    
    parser.add_argument('input', type=Path, help='Input directory with images')
    parser.add_argument('output', type=Path, help='Output directory (will create thumbs/, web/, zoom/)')
    parser.add_argument('--workers', type=int, default=4, help='Parallel workers (default: 4)')
    parser.add_argument('--force', action='store_true', help='Force rebuild all (ignore cache)')
    parser.add_argument('--quiet', action='store_true', help='Minimal output')
    parser.add_argument('--title', type=str, help='Collection title for manifest')
    
    args = parser.parse_args()
    
    # Validate
    if not args.input.exists():
        print(f"❌ Input directory not found: {args.input}", file=sys.stderr)
        sys.exit(1)
    
    if not args.input.is_dir():
        print(f"❌ Input must be a directory: {args.input}", file=sys.stderr)
        sys.exit(1)
    
    # Process
    print("=" * 60)
    print(f"📂 Input:  {args.input}")
    print(f"📁 Output: {args.output}")
    print(f"⚙️  Sizes:  thumbs (800px), web (2400px), zoom (4000px)")
    print("=" * 60)
    print()
    
    results = process_batch(
        args.input,
        args.output,
        workers=args.workers,
        force=args.force,
        verbose=not args.quiet
    )
    
    # Write manifest
    metadata = {
        'source_dir': str(args.input),
        'title': args.title or args.input.name,
    }
    
    manifest_path = write_manifest(args.output, results, metadata)
    
    print()
    print("=" * 60)
    print(f"✅ Processed {len(results)} images")
    print(f"📄 Manifest: {manifest_path}")
    print()
    print("Output structure:")
    print(f"  {args.output}/")
    print(f"    ├── thumbs/     (800px max, 80% quality)")
    print(f"    ├── web/        (2400px max, 85% quality)")
    print(f"    ├── zoom/       (4000px max, 95% quality)")
    print(f"    └── manifest.json")
    print("=" * 60)


if __name__ == '__main__':
    main()

