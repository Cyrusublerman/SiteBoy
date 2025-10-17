#!/usr/bin/env python3
"""
In-Place Photo Processor for SiteBoy Gallery
Processes photos directly in their folders: thumbs/, display/, zoom/

USAGE:
  python tools/process-photos-inplace.py art/Photos/Life1
  python tools/process-photos-inplace.py art/Photos --all

IMPORTANT:
  - Creates thumbs/, display/, zoom/ folders INSIDE the source folder
  - Moves originals to _originals/ folder (safe backup)
  - Use --delete-originals to remove originals after backup
  - Use --dry-run to preview first
"""

import argparse
import shutil
import sys
from pathlib import Path
from typing import List, Dict, Tuple
from PIL import Image, ImageOps

# Output folders
SIZES = {
    'thumbs': {'max_size': 800, 'quality': 80},
    'display': {'max_size': 2400, 'quality': 85},
    'zoom': {'max_size': 4000, 'quality': 95}
}

SUPPORTED_EXTS = {'.jpg', '.jpeg', '.JPG', '.JPEG', '.png', '.PNG', '.webp', '.WEBP', '.heic', '.HEIC'}

def load_and_normalize(src_path: Path) -> Image.Image:
    """Load and normalize image"""
    img = Image.open(src_path)
    img.load()
    img = ImageOps.exif_transpose(img)
    
    if img.mode not in ('RGB', 'L'):
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            try:
                background.paste(img, mask=img.split()[-1])
                img = background
            except:
                img = img.convert('RGB')
        else:
            img = img.convert('RGB')
    elif img.mode == 'L':
        img = img.convert('RGB')
    
    return img

def calculate_resize(orig_w: int, orig_h: int, max_size: int) -> Tuple[int, int]:
    """Calculate new dimensions"""
    if orig_w >= orig_h:
        if orig_w <= max_size:
            return orig_w, orig_h
        ratio = max_size / orig_w
    else:
        if orig_h <= max_size:
            return orig_w, orig_h
        ratio = max_size / orig_h
    return max(1, round(orig_w * ratio)), max(1, round(orig_h * ratio))

def find_images(folder: Path) -> List[Path]:
    """Find all image files in folder (not in subfolders)"""
    images = []
    for ext in SUPPORTED_EXTS:
        images.extend(folder.glob(f"*{ext}"))
    # Filter out files in subdirectories
    images = [p for p in images if p.parent == folder]
    return sorted(images)

def process_image(src: Path, folder: Path, dry_run: bool = False) -> Dict:
    """Process single image to all sizes"""
    basename = src.stem
    
    if dry_run:
        print(f"  [DRY] Would process: {src.name}")
        return None
    
    # Load once
    img = load_and_normalize(src)
    orig_w, orig_h = img.size
    
    result = {'source': src.name, 'sizes': {}}
    
    # Process each size
    for size_name, config in SIZES.items():
        size_dir = folder / size_name
        size_dir.mkdir(exist_ok=True)
        
        out_path = size_dir / f"{basename}.jpg"
        
        # Calculate dimensions
        new_w, new_h = calculate_resize(orig_w, orig_h, config['max_size'])
        
        # Resize
        if new_w != orig_w or new_h != orig_h:
            resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        else:
            resized = img
        
        # Save
        resized.save(
            out_path,
            format='JPEG',
            quality=config['quality'],
            optimize=True,
            progressive=True,
            subsampling='4:2:0'
        )
        
        result['sizes'][size_name] = {
            'width': new_w,
            'height': new_h,
            'path': f"{size_name}/{basename}.jpg"
        }
    
    print(f"  ✅ {src.name} → {result['sizes']['thumbs']['width']}w, "
          f"{result['sizes']['display']['width']}w, {result['sizes']['zoom']['width']}w")
    
    return result

def backup_originals(folder: Path, images: List[Path], dry_run: bool = False) -> Path:
    """Move originals to _originals folder"""
    backup_dir = folder / '_originals'
    
    if dry_run:
        print(f"  [DRY] Would create backup: {backup_dir}")
        return backup_dir
    
    backup_dir.mkdir(exist_ok=True)
    
    for img in images:
        dest = backup_dir / img.name
        if not dest.exists():
            shutil.move(str(img), str(dest))
    
    return backup_dir

def process_folder(folder: Path, delete_originals: bool = False, dry_run: bool = False):
    """Process all images in folder"""
    if not folder.exists():
        print(f"❌ Folder not found: {folder}")
        return False
    
    # Find images
    images = find_images(folder)
    if not images:
        print(f"⚠️  No images found in {folder}")
        return False
    
    print(f"\n{'='*70}")
    print(f"📁 {folder.name}")
    print(f"{'='*70}")
    print(f"Found {len(images)} images")
    print(f"Output: thumbs/ (800px), display/ (2400px), zoom/ (4000px)")
    if delete_originals:
        print(f"⚠️  Originals will be DELETED after backup")
    else:
        print(f"Originals will be moved to _originals/")
    print()
    
    if dry_run:
        print("[DRY RUN MODE - No files will be modified]")
        print()
    
    # Process images
    results = []
    for img in images:
        try:
            result = process_image(img, folder, dry_run)
            if result:
                results.append(result)
        except Exception as e:
            print(f"  ❌ Error: {img.name}: {e}")
    
    if dry_run:
        print(f"\n[DRY RUN] Would process {len(results)} images")
        return True
    
    # Backup originals
    print(f"\n📦 Backing up originals...")
    backup_dir = backup_originals(folder, images, dry_run)
    print(f"   → {backup_dir}")
    
    # Delete originals if requested
    if delete_originals and not dry_run:
        print(f"\n🗑️  Deleting backup folder...")
        shutil.rmtree(backup_dir)
        print(f"   ✅ Deleted: {backup_dir}")
    
    print(f"\n✅ Complete: {len(results)} images processed")
    print(f"   thumbs/   - {len(results)} files")
    print(f"   display/  - {len(results)} files")
    print(f"   zoom/     - {len(results)} files")
    if not delete_originals:
        print(f"   _originals/ - {len(images)} files (backup)")
    
    return True

def main():
    parser = argparse.ArgumentParser(
        description='Process photos in-place (creates thumbs/display/zoom folders)',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    
    parser.add_argument('folder', type=Path, help='Folder to process')
    parser.add_argument('--all', action='store_true', 
                       help='Process all subfolders in the given folder')
    parser.add_argument('--delete-originals', action='store_true',
                       help='DELETE original files after backup (DANGEROUS!)')
    parser.add_argument('--dry-run', '-d', action='store_true',
                       help='Preview without processing')
    
    args = parser.parse_args()
    
    if args.all:
        # Process all subfolders
        if not args.folder.exists() or not args.folder.is_dir():
            print(f"❌ Not a directory: {args.folder}")
            sys.exit(1)
        
        subfolders = [f for f in args.folder.iterdir() if f.is_dir() and not f.name.startswith('_')]
        
        if not subfolders:
            print(f"❌ No subfolders found in {args.folder}")
            sys.exit(1)
        
        print("="*70)
        print(f"Processing {len(subfolders)} folders in {args.folder}")
        print("="*70)
        
        for subfolder in subfolders:
            process_folder(subfolder, args.delete_originals, args.dry_run)
        
        print("\n" + "="*70)
        print(f"✅ ALL FOLDERS PROCESSED")
        print("="*70)
    else:
        # Process single folder
        process_folder(args.folder, args.delete_originals, args.dry_run)

if __name__ == '__main__':
    main()

