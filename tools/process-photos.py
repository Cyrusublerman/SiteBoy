#!/usr/bin/env python3
"""
Advanced Photo Processor for SiteBoy - Fine-Grained Control

Process specific images with full control over output paths, sizes, and quality.

EXAMPLES:

1. Process single file to custom location:
   python scripts/process-photos-advanced.py \\
     --input "art/Photos/FILM/Life1/237040610016.jpg" \\
     --output "assets/gallery/favorites" \\
     --name "favorite-01"

2. Process multiple files with pattern:
   python scripts/process-photos-advanced.py \\
     --input "art/Photos/FILM/Life1/*.jpg" \\
     --output "art/Photos/processed/life1" \\
     --sizes thumb,web

3. Custom sizes and quality:
   python scripts/process-photos-advanced.py \\
     --input "art/Photos/FILM/Morocco/image.jpg" \\
     --output "projects/morocco-highlights" \\
     --thumb-size 400 --thumb-quality 75 \\
     --web-size 1920 --web-quality 90 \\
     --zoom-size 5000

4. Process list of specific files:
   python scripts/process-photos-advanced.py \\
     --input-list files.txt \\
     --output "curated/selection" \\
     --sizes thumb,web,zoom

5. Dry run (preview):
   python scripts/process-photos-advanced.py \\
     --input "art/Photos/FILM/**/*.jpg" \\
     --output "test" \\
     --dry-run

6. Skip existing files:
   python scripts/process-photos-advanced.py \\
     --input "art/Photos/FILM/Rom/*.jpg" \\
     --output "art/Photos/processed/rom" \\
     --skip-existing

7. Custom naming pattern:
   python scripts/process-photos-advanced.py \\
     --input "art/Photos/FILM/Snow/*.jpg" \\
     --output "winter-collection" \\
     --name-pattern "{index:03d}-snow-{original}"
"""

import argparse
import json
import sys
from pathlib import Path
from typing import List, Dict, Tuple, Optional, Set
from PIL import Image, ImageOps
import glob as glob_module

# ==============================================
# Default Configuration
# ==============================================

DEFAULT_SIZES = {
    'thumb': {'max_size': 800, 'quality': 80, 'suffix': 'thumb'},
    'web': {'max_size': 2400, 'quality': 85, 'suffix': 'web'},
    'zoom': {'max_size': 4000, 'quality': 95, 'suffix': 'zoom'}
}

SUPPORTED_EXTS = {'.jpg', '.jpeg', '.JPG', '.JPEG', '.png', '.PNG', '.webp', '.WEBP', '.heic', '.HEIC', '.tiff', '.tif'}

# ==============================================
# Image Processing Core
# ==============================================

def load_and_normalize(src_path: Path) -> Image.Image:
    """Load image and apply EXIF orientation + RGB conversion"""
    img = Image.open(src_path)
    img.load()
    img = ImageOps.exif_transpose(img)
    
    if img.mode not in ('RGB', 'L'):
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


def calculate_resize(orig_w: int, orig_h: int, max_size: int) -> Tuple[int, int]:
    """Calculate new dimensions maintaining aspect ratio"""
    if orig_w >= orig_h:
        if orig_w <= max_size:
            return orig_w, orig_h
        ratio = max_size / orig_w
    else:
        if orig_h <= max_size:
            return orig_w, orig_h
        ratio = max_size / orig_h
    
    return max(1, round(orig_w * ratio)), max(1, round(orig_h * ratio))


# ==============================================
# File Discovery
# ==============================================

def resolve_input_files(input_spec: str, recursive: bool = False) -> List[Path]:
    """
    Resolve input specification to list of files.
    
    Supports:
    - Single file: "path/to/image.jpg"
    - Glob pattern: "path/*.jpg"
    - Recursive glob: "path/**/*.jpg"
    """
    results = []
    
    # Check if it's a single file
    p = Path(input_spec)
    if p.is_file():
        return [p]
    
    # Check if it's a directory
    if p.is_dir():
        for ext in SUPPORTED_EXTS:
            if recursive:
                results.extend(p.rglob(f"*{ext}"))
            else:
                results.extend(p.glob(f"*{ext}"))
        return sorted(set(results))
    
    # Try as glob pattern
    matches = glob_module.glob(input_spec, recursive=True)
    for m in matches:
        mp = Path(m)
        if mp.is_file() and mp.suffix in SUPPORTED_EXTS:
            results.append(mp)
    
    return sorted(set(results))


def load_file_list(list_path: Path) -> List[Path]:
    """Load list of files from text file (one per line)"""
    files = []
    for line in list_path.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith('#'):
            p = Path(line)
            if p.exists() and p.is_file():
                files.append(p)
    return files


# ==============================================
# Naming Patterns
# ==============================================

def generate_filename(
    pattern: str,
    original_name: str,
    index: int,
    size_suffix: str,
    custom_name: Optional[str] = None
) -> str:
    """
    Generate filename from pattern.
    
    Available tokens:
    - {original} - original filename (no ext)
    - {name} - custom name if provided, else original
    - {index} - index number (0-based)
    - {index:03d} - zero-padded index
    - {size} - size suffix (thumb/web/zoom)
    """
    original_stem = Path(original_name).stem
    name = custom_name or original_stem
    
    result = pattern.format(
        original=original_stem,
        name=name,
        index=index,
        size=size_suffix
    )
    
    return result + '.jpg'


# ==============================================
# Processing
# ==============================================

def process_image_to_size(
    img: Image.Image,
    output_path: Path,
    max_size: int,
    quality: int,
    force: bool = False
) -> Dict:
    """Process image to specific size and save"""
    
    # Skip if exists and not forcing
    if output_path.exists() and not force:
        w, h = img.size
        new_w, new_h = calculate_resize(w, h, max_size)
        return {
            'path': str(output_path),
            'width': new_w,
            'height': new_h,
            'skipped': True
        }
    
    orig_w, orig_h = img.size
    new_w, new_h = calculate_resize(orig_w, orig_h, max_size)
    
    # Resize if needed
    if new_w != orig_w or new_h != orig_h:
        resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    else:
        resized = img
    
    # Ensure output directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Save
    resized.save(
        output_path,
        format='JPEG',
        quality=quality,
        optimize=True,
        progressive=True,
        subsampling='4:2:0'
    )
    
    return {
        'path': str(output_path),
        'width': new_w,
        'height': new_h,
        'filesize': output_path.stat().st_size,
        'skipped': False
    }


def process_single_file(
    src_path: Path,
    output_base: Path,
    sizes_config: Dict,
    active_sizes: Set[str],
    name_pattern: str,
    custom_name: Optional[str],
    index: int,
    force: bool,
    dry_run: bool,
    verbose: bool
) -> Dict:
    """Process single file to requested sizes"""
    
    if verbose:
        print(f"\n{'[DRY RUN] ' if dry_run else ''}📸 {src_path.name}")
    
    # Load image
    if not dry_run:
        img = load_and_normalize(src_path)
        orig_w, orig_h = img.size
    else:
        # For dry run, just get dimensions without full load
        with Image.open(src_path) as img:
            orig_w, orig_h = img.size
    
    result = {
        'source': str(src_path),
        'original_size': [orig_w, orig_h],
        'aspect': round(orig_w / orig_h, 3),
        'sizes': {}
    }
    
    # Process each requested size
    for size_name in active_sizes:
        if size_name not in sizes_config:
            continue
        
        config = sizes_config[size_name]
        
        # Generate filename
        filename = generate_filename(
            name_pattern,
            src_path.name,
            index,
            config['suffix'],
            custom_name
        )
        
        output_path = output_base / size_name / filename
        
        if dry_run:
            # Just show what would happen
            new_w, new_h = calculate_resize(orig_w, orig_h, config['max_size'])
            if verbose:
                print(f"  → {size_name:5s}: {output_path} ({new_w}x{new_h})")
            result['sizes'][size_name] = {
                'path': str(output_path),
                'width': new_w,
                'height': new_h,
                'dry_run': True
            }
        else:
            # Actually process
            size_result = process_image_to_size(
                img,
                output_path,
                config['max_size'],
                config['quality'],
                force
            )
            
            if verbose:
                status = "⏭️ " if size_result.get('skipped') else "✅"
                print(f"  {status} {size_name:5s}: {output_path} "
                      f"({size_result['width']}x{size_result['height']})")
            
            result['sizes'][size_name] = size_result
    
    return result


# ==============================================
# Batch Processing
# ==============================================

def process_batch(
    input_files: List[Path],
    output_base: Path,
    sizes_config: Dict,
    active_sizes: Set[str],
    name_pattern: str,
    custom_name: Optional[str],
    force: bool,
    dry_run: bool,
    verbose: bool
) -> List[Dict]:
    """Process batch of files"""
    
    results = []
    
    for idx, src_path in enumerate(input_files):
        try:
            result = process_single_file(
                src_path,
                output_base,
                sizes_config,
                active_sizes,
                name_pattern,
                custom_name,
                idx,
                force,
                dry_run,
                verbose
            )
            results.append(result)
        except Exception as e:
            print(f"❌ Error processing {src_path.name}: {e}", file=sys.stderr)
    
    return results


# ==============================================
# CLI
# ==============================================

def main():
    parser = argparse.ArgumentParser(
        description='Advanced photo processor with fine-grained control',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    
    # Input
    input_group = parser.add_mutually_exclusive_group(required=True)
    input_group.add_argument('--input', '-i', help='Input file/pattern/directory')
    input_group.add_argument('--input-list', '-l', type=Path, help='Text file with list of files')
    
    # Output
    parser.add_argument('--output', '-o', type=Path, required=True, help='Output directory')
    parser.add_argument('--name', '-n', help='Custom output name (overrides original)')
    parser.add_argument('--name-pattern', default='{name}-{size}',
                       help='Naming pattern (default: {name}-{size})')
    
    # Sizes
    parser.add_argument('--sizes', default='thumb,web,zoom',
                       help='Comma-separated sizes to generate (default: thumb,web,zoom)')
    
    # Size customization
    parser.add_argument('--thumb-size', type=int, help='Thumb max dimension (default: 800)')
    parser.add_argument('--thumb-quality', type=int, help='Thumb quality (default: 80)')
    parser.add_argument('--web-size', type=int, help='Web max dimension (default: 2400)')
    parser.add_argument('--web-quality', type=int, help='Web quality (default: 85)')
    parser.add_argument('--zoom-size', type=int, help='Zoom max dimension (default: 4000)')
    parser.add_argument('--zoom-quality', type=int, help='Zoom quality (default: 95)')
    
    # Behavior
    parser.add_argument('--force', '-f', action='store_true', help='Force rebuild (ignore existing)')
    parser.add_argument('--skip-existing', '-s', action='store_true', help='Skip if output exists')
    parser.add_argument('--dry-run', '-d', action='store_true', help='Preview without processing')
    parser.add_argument('--quiet', '-q', action='store_true', help='Minimal output')
    parser.add_argument('--recursive', '-r', action='store_true', help='Recursive directory search')
    parser.add_argument('--no-manifest', action='store_true', help='Skip manifest generation')
    
    args = parser.parse_args()
    
    # Build sizes config
    sizes_config = json.loads(json.dumps(DEFAULT_SIZES))  # Deep copy
    
    if args.thumb_size:
        sizes_config['thumb']['max_size'] = args.thumb_size
    if args.thumb_quality:
        sizes_config['thumb']['quality'] = args.thumb_quality
    if args.web_size:
        sizes_config['web']['max_size'] = args.web_size
    if args.web_quality:
        sizes_config['web']['quality'] = args.web_quality
    if args.zoom_size:
        sizes_config['zoom']['max_size'] = args.zoom_size
    if args.zoom_quality:
        sizes_config['zoom']['quality'] = args.zoom_quality
    
    # Parse active sizes
    active_sizes = set(s.strip() for s in args.sizes.split(','))
    
    # Resolve input files
    if args.input_list:
        input_files = load_file_list(args.input_list)
    else:
        input_files = resolve_input_files(args.input, args.recursive)
    
    if not input_files:
        print("❌ No input files found", file=sys.stderr)
        sys.exit(1)
    
    # Print plan
    if not args.quiet:
        print("=" * 70)
        print(f"{'[DRY RUN] ' if args.dry_run else ''}Photo Processing Plan")
        print("=" * 70)
        print(f"Input files:  {len(input_files)}")
        print(f"Output dir:   {args.output}")
        print(f"Sizes:        {', '.join(sorted(active_sizes))}")
        if args.name:
            print(f"Custom name:  {args.name}")
        print(f"Name pattern: {args.name_pattern}")
        print()
        
        for size_name in sorted(active_sizes):
            if size_name in sizes_config:
                cfg = sizes_config[size_name]
                print(f"  {size_name:5s}: {cfg['max_size']}px max, quality {cfg['quality']}")
        
        print("=" * 70)
    
    # Process
    results = process_batch(
        input_files,
        args.output,
        sizes_config,
        active_sizes,
        args.name_pattern,
        args.name,
        args.force and not args.skip_existing,
        args.dry_run,
        not args.quiet
    )
    
    # Write manifest
    if not args.dry_run and not args.no_manifest and results:
        manifest = {
            'file_count': len(results),
            'sizes': list(sorted(active_sizes)),
            'files': results
        }
        manifest_path = args.output / 'manifest.json'
        manifest_path.parent.mkdir(parents=True, exist_ok=True)
        manifest_path.write_text(json.dumps(manifest, indent=2))
        if not args.quiet:
            print(f"\n📄 Manifest: {manifest_path}")
    
    # Summary
    if not args.quiet:
        print("\n" + "=" * 70)
        print(f"{'[DRY RUN COMPLETE] ' if args.dry_run else '✅ COMPLETE'}")
        print(f"Processed: {len(results)} files")
        if not args.dry_run:
            total_size = sum(
                r['sizes'][s].get('filesize', 0)
                for r in results
                for s in active_sizes
                if s in r['sizes'] and not r['sizes'][s].get('dry_run', False)
            )
            print(f"Total size: {total_size / 1024 / 1024:.1f} MB")
        print("=" * 70)


if __name__ == '__main__':
    main()

