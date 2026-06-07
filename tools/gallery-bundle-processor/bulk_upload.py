#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bulk gallery uploader — tag-suffix convention.

Sources:  reference/images to upload/{book,digital,objects,physical,render}/
          Folder tags: -g gallery, -p page, -o object, -f hoist (transparent)
R2 dest:  art/{section}/{gallery-slug}/{thumbs|web|zoom}/{stem}.jpg
Manifest: art/manifests/{section}/{gallery-slug}/manifest.json
Index:    art/manifests/_index.json
"""

import json
import os
import re
import sys
import hashlib
from pathlib import Path
from datetime import datetime, timezone

from PIL import Image, ImageOps
import boto3
from botocore.exceptions import ClientError

# ── Paths ──────────────────────────────────────────────────────────────────────

REPO_ROOT     = Path(__file__).parent.parent.parent
REF_ROOT      = REPO_ROOT / "reference" / "images to upload"
OUTPUT_ROOT   = Path(__file__).parent / "output" / "_bulk2"
MANIFEST_ROOT = REPO_ROOT / "art" / "manifests"

# ── R2 config ──────────────────────────────────────────────────────────────────

_LOCAL_ONLY = "--local-only" in sys.argv
_REQUIRED_ENV = ("R2_ACCOUNT_ID", "R2_BUCKET_NAME", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY")
if not _LOCAL_ONLY:
    _missing = [k for k in _REQUIRED_ENV if not os.getenv(k)]
    if _missing:
        raise SystemExit(
            "Missing required R2 environment variables: "
            + ", ".join(_missing)
            + ". Set them or pass --local-only to write manifests without upload."
        )

R2 = {
    "account_id": os.environ["R2_ACCOUNT_ID"],
    "bucket":     os.environ["R2_BUCKET_NAME"],
    "access_key": os.environ["R2_ACCESS_KEY_ID"],
    "secret_key": os.environ["R2_SECRET_ACCESS_KEY"],
    "public_url": os.getenv("R2_PUBLIC_URL", "https://media.einoder.net"),
}

IMAGE_EXTS  = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"}
COVER_NAMES = {"cover.jpg", "cover.jpeg", "cover.png", "cover.webp"}
SECTIONS    = ["book", "digital", "objects", "physical", "render"]
TAG_RE      = re.compile(r"^(?:\d+-)?(.+?)-([gpof])$", re.IGNORECASE)
ORDER_RE    = re.compile(r"^(\d+)-")
PREFIX_RE   = re.compile(r"^(\d+)-")

SIZES = [
    ("thumbs", 800,  80),
    ("web",   2400,  85),
    ("zoom",  4000,  90),
]

Image.MAX_IMAGE_PIXELS = 500_000_000


# ── Naming helpers ─────────────────────────────────────────────────────────────

def is_ignored(name: str) -> bool:
    return name.startswith("_") or name.startswith(".")


def parse_folder_tag(name: str) -> tuple[str, str] | None:
    m = TAG_RE.match(name)
    if not m:
        return None
    return m.group(1).strip(), m.group(2).lower()


def folder_slug(name: str) -> str:
    parsed = parse_folder_tag(name)
    raw = parsed[0] if parsed else name
    m = ORDER_RE.match(raw)
    if m:
        raw = raw[m.end():]
    slug = re.sub(r"[^a-z0-9]+", "-", raw.lower()).strip("-")
    slug = re.sub(r"-+", "-", slug)
    if not slug:
        raise ValueError(f"Empty slug from folder name: {name!r}")
    return slug


def order_key(name: str) -> tuple:
    m = PREFIX_RE.match(name)
    return (int(m.group(1)), name) if m else (float("inf"), name)


def image_id(filename: str) -> str:
    """Preserve legacy safe_stem semantics for leaf files: strip nn- prefix, spaces -> _."""
    stem = Path(filename).stem
    m = PREFIX_RE.match(stem)
    if m:
        stem = stem[m.end():]
    return stem.replace(" ", "_")


def composite_stem(*parts: str) -> str:
    return "__".join(p for p in parts if p)


def is_cover(path: Path) -> bool:
    return path.name.lower() in COVER_NAMES


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


def make_urls(base_url: str, stem: str) -> dict:
    return {
        "thumb": f"{base_url}/thumbs/{stem}.jpg",
        "web":   f"{base_url}/web/{stem}.jpg",
        "zoom":  f"{base_url}/zoom/{stem}.jpg",
    }


# ── Image processing ───────────────────────────────────────────────────────────

def process_image(src: Path, out_dir: Path, stem: str) -> dict | None:
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


# ── Gallery walker ─────────────────────────────────────────────────────────────

class GalleryJob:
    """One gallery (-g) to process: source dir, section, cumulative slug parts."""

    def __init__(self, src_dir: Path, section: str, slug_parts: list[str], title: str):
        self.src_dir    = src_dir
        self.section    = section
        self.slug_parts = slug_parts
        self.title      = title

    @property
    def slug(self) -> str:
        return "/".join(self.slug_parts)

    @property
    def r2_prefix(self) -> str:
        return f"art/{self.section}/{self.slug}"


def discover_galleries(section: str, root: Path, slug_prefix: list[str] | None = None) -> list[GalleryJob]:
    """Find all -g folders under root (including nested -g)."""
    slug_prefix = slug_prefix or []
    jobs: list[GalleryJob] = []

    if parse_folder_tag(root.name) and parse_folder_tag(root.name)[1] == "g":
        slug = folder_slug(root.name)
        jobs.append(GalleryJob(root, section, slug_prefix + [slug], parse_folder_tag(root.name)[0]))
        search_dir = root
    else:
        search_dir = root

    for child in sorted(search_dir.iterdir(), key=lambda p: order_key(p.name)):
        if not child.is_dir() or is_ignored(child.name):
            continue
        tag = parse_folder_tag(child.name)
        if tag and tag[1] == "g":
            child_slug = folder_slug(child.name)
            if parse_folder_tag(root.name) and parse_folder_tag(root.name)[1] == "g":
                jobs.extend(discover_galleries(section, child, slug_prefix + [folder_slug(root.name)]))
            else:
                jobs.extend(discover_galleries(section, child, slug_prefix))

    return jobs


def collect_section_galleries(section: str) -> list[GalleryJob]:
    section_dir = REF_ROOT / section
    if not section_dir.exists():
        return []

    jobs: list[GalleryJob] = []
    for child in sorted(section_dir.iterdir(), key=lambda p: order_key(p.name)):
        if not child.is_dir():
            continue
        if is_ignored(child.name):
            continue
        tag = parse_folder_tag(child.name)
        if not tag:
            raise SystemExit(f"ERROR: untagged folder at section root: {section}/{child.name}")
        if tag[1] == "g":
            jobs.extend(discover_galleries(section, child))
        elif tag[1] == "f":
            for sub in sorted(child.iterdir(), key=lambda p: order_key(p.name)):
                if sub.is_dir() and parse_folder_tag(sub.name) and parse_folder_tag(sub.name)[1] == "g":
                    jobs.extend(discover_galleries(section, sub))
        else:
            raise SystemExit(f"ERROR: invalid tag at section root: {section}/{child.name} (expected -g or -f)")
    return jobs


def walk_cards(
    gallery_dir: Path,
    hoist_prefix: str = "",
) -> tuple[list[dict], str | None, list[tuple[str, Path]]]:
    """
    Walk direct children of a gallery folder.
    Returns (cards, intro_md, image_jobs) where image_jobs is [(stem, src_path), ...].
    """
    cards: list[dict] = []
    intro: str | None = None
    images: list[tuple[str, Path]] = []

    gallery_md = gallery_dir / "_gallery.md"
    if gallery_md.is_file():
        intro = gallery_md.read_text(encoding="utf-8")

    for child in sorted(gallery_dir.iterdir(), key=lambda p: order_key(p.name)):
        if is_ignored(child.name):
            continue

        if child.is_file():
            if child.name == "_gallery.md":
                continue
            ext = child.suffix.lower()
            if ext in IMAGE_EXTS:
                stem = composite_stem(hoist_prefix, image_id(child.name)) if hoist_prefix else image_id(child.name)
                images.append((stem, child))
                cards.append({"type": "image", "id": stem, "_stem": stem})
            elif ext == ".md":
                print(f"    WARN: stray .md at gallery root (ignored): {child.name}")
            else:
                print(f"    WARN: non-image file in gallery (ignored): {child.name}")
            continue

        tag = parse_folder_tag(child.name)
        if not tag:
            raise SystemExit(f"ERROR: untagged folder in gallery: {child}")

        kind = tag[1]
        slug = folder_slug(child.name)

        if kind == "g":
            continue  # nested gallery — own manifest

        if kind == "f":
            sub_cards, sub_intro, sub_images = walk_cards(child, composite_stem(hoist_prefix, slug) if hoist_prefix else slug)
            if sub_intro and not intro:
                intro = sub_intro
            images.extend(sub_images)
            cards.extend(sub_cards)
            continue

        if kind == "p":
            page_slug = slug
            blocks, page_images, cover_stem = _walk_page(child, page_slug)
            images.extend(page_images)
            cover = None
            if cover_stem:
                cover = {"thumb": None, "web": None, "_stem": cover_stem}
            cards.append({
                "type":    "page",
                "id":      page_slug,
                "cover":   cover,
                "blocks":  blocks,
            })
            continue

        if kind == "o":
            obj_slug = slug
            obj_images, cover_stem = _walk_object(child, obj_slug)
            images.extend(obj_images)
            cover = None
            if cover_stem:
                cover = {"thumb": None, "web": None, "_stem": cover_stem}
            cards.append({
                "type":   "object",
                "id":     obj_slug,
                "cover":  cover,
                "images": [{"id": stem, "_stem": stem} for stem, _ in obj_images],
            })
            continue

    return cards, intro, images


def _walk_page(page_dir: Path, page_slug: str) -> tuple[list[dict], list[tuple[str, Path]], str | None]:
    blocks: list[dict] = []
    images: list[tuple[str, Path]] = []
    cover_stem: str | None = None

    for child in sorted(page_dir.iterdir(), key=lambda p: order_key(p.name)):
        if is_ignored(child.name):
            continue
        if child.is_dir():
            raise SystemExit(f"ERROR: folders not allowed inside -p: {page_dir / child.name}")

        if is_cover(child):
            stem = composite_stem(page_slug, "cover")
            images.append((stem, child))
            cover_stem = stem
            continue

        ext = child.suffix.lower()
        if ext == ".md":
            blocks.append({"type": "md", "text": child.read_text(encoding="utf-8")})
        elif ext in IMAGE_EXTS:
            stem = composite_stem(page_slug, image_id(child.name))
            images.append((stem, child))
            blocks.append({"type": "image", "id": stem, "_stem": stem})
        else:
            print(f"    WARN: unknown file in page (ignored): {child.name}")

    return blocks, images, cover_stem


def _walk_object(obj_dir: Path, obj_slug: str) -> tuple[list[tuple[str, Path]], str | None]:
    images: list[tuple[str, Path]] = []
    cover_stem: str | None = None

    for child in sorted(obj_dir.iterdir(), key=lambda p: order_key(p.name)):
        if is_ignored(child.name):
            continue
        if child.is_dir():
            raise SystemExit(f"ERROR: folders not allowed inside -o: {obj_dir / child.name}")

        if is_cover(child):
            stem = composite_stem(obj_slug, "cover")
            images.append((stem, child))
            cover_stem = stem
            continue

        if child.suffix.lower() in IMAGE_EXTS:
            stem = composite_stem(obj_slug, image_id(child.name))
            images.append((stem, child))
        else:
            print(f"    WARN: non-image in object (ignored): {child.name}")

    return images, cover_stem


def resolve_card_urls(cards: list[dict], base_url: str, stem_urls: dict[str, dict]) -> list[dict]:
    """Replace _stem placeholders with real urls in cards."""

    def url_for(stem: str) -> dict:
        return stem_urls.get(stem, make_urls(base_url, stem))

    resolved = []
    for card in cards:
        c = {k: v for k, v in card.items() if k != "_stem"}
        if card["type"] == "image":
            c["urls"] = url_for(card["_stem"])
            c["filename"] = f"{card['_stem']}.jpg"
        elif card["type"] == "page":
            if card.get("cover") and card["cover"].get("_stem"):
                c["cover"] = {
                    "thumb": url_for(card["cover"]["_stem"])["thumb"],
                    "web":   url_for(card["cover"]["_stem"])["web"],
                }
            c["blocks"] = []
            for block in card.get("blocks", []):
                if block["type"] == "md":
                    c["blocks"].append(block)
                elif block["type"] == "image":
                    c["blocks"].append({
                        "type":     "image",
                        "id":       block["id"],
                        "filename": f"{block['_stem']}.jpg",
                        "urls":     url_for(block["_stem"]),
                    })
        elif card["type"] == "object":
            if card.get("cover") and card["cover"].get("_stem"):
                c["cover"] = {
                    "thumb": url_for(card["cover"]["_stem"])["thumb"],
                    "web":   url_for(card["cover"]["_stem"])["web"],
                }
            c["images"] = [
                {
                    "id":       img["id"],
                    "filename": f"{img['_stem']}.jpg",
                    "urls":     url_for(img["_stem"]),
                }
                for img in card.get("images", [])
            ]
        resolved.append(c)
    return resolved


def build_manifest(job: GalleryJob, cards: list[dict], intro: str | None) -> dict:
    base_url = f"{R2['public_url']}/{job.r2_prefix}"
    image_count = sum(
        1 for c in cards if c["type"] == "image"
    ) + sum(
        1 for c in cards if c["type"] == "page"
        for b in c.get("blocks", []) if b.get("type") == "image"
    ) + sum(
        len(c.get("images", [])) for c in cards if c["type"] == "object"
    )
    return {
        "gallery_type":  job.section,
        "gallery_name":  job.slug,
        "base_url":      base_url,
        "generated_at":  datetime.now(timezone.utc).isoformat(),
        "intro":         intro,
        "cards":         cards,
        "total_images":  image_count,
    }


def process_gallery(client, job: GalleryJob, *, local_only: bool = False) -> dict | None:
    print(f"\n[{job.section.upper()}] {job.src_dir.relative_to(REF_ROOT)}  ->  {job.r2_prefix}")

    if not job.src_dir.exists():
        print("  SKIP (source not found)")
        return None

    cards_raw, intro, image_jobs = walk_cards(job.src_dir)

    if not image_jobs and not any(c["type"] in ("page", "object") for c in cards_raw):
        print("  SKIP (0 images, 0 pages)")
        return None

    print(f"  {len(cards_raw)} cards | {len(image_jobs)} images to process")

    out_dir = OUTPUT_ROOT / job.section / Path(*job.slug_parts)
    stems_ok: list[str] = []
    stem_urls: dict[str, dict] = {}

    for stem, src_path in image_jobs:
        if process_image(src_path, out_dir, stem):
            stems_ok.append(stem)
            stem_urls[stem] = make_urls(f"{R2['public_url']}/{job.r2_prefix}", stem)

    print(f"  processed: {len(stems_ok)}/{len(image_jobs)}")

    if not local_only:
        stats = {"uploaded": 0, "skipped": 0, "failed": 0}
        for size_name, _, _ in SIZES:
            size_dir = out_dir / size_name
            if not size_dir.exists():
                continue
            for f in sorted(size_dir.glob("*.jpg")):
                key = f"{job.r2_prefix}/{size_name}/{f.name}"
                result = upload_file(client, f, key, "image/jpeg")
                stats[result] += 1
        print(f"  upload: {stats['uploaded']} uploaded, {stats['skipped']} skipped, {stats['failed']} failed")
    else:
        print("  upload: skipped (--local-only)")

    base_url = f"{R2['public_url']}/{job.r2_prefix}"
    cards = resolve_card_urls(cards_raw, base_url, stem_urls)
    manifest = build_manifest(job, cards, intro)

    manifest_key = f"{job.r2_prefix}/manifest.json"
    if not local_only:
        put_json(client, manifest_key, manifest)

    local_manifest = MANIFEST_ROOT / job.section / Path(*job.slug_parts) / "manifest.json"
    local_manifest.parent.mkdir(parents=True, exist_ok=True)
    local_manifest.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"  manifest -> {manifest_key} + art/manifests/{job.section}/{job.slug}/manifest.json")

    return {
        "slug":       job.slug,
        "title":      job.title,
        "card_count": len(cards),
        "section":    job.section,
        "pages":      [c["id"] for c in cards if c.get("type") == "page"],
    }


def build_index(entries: list[dict]) -> dict:
    index: dict = {"generated_at": datetime.now(timezone.utc).isoformat(), "sections": {}}
    for entry in entries:
        if not entry:
            continue
        sec = entry["section"]
        if sec not in index["sections"]:
            index["sections"][sec] = {"galleries": []}
        index["sections"][sec]["galleries"].append({
            "slug":       entry["slug"],
            "title":      entry["title"],
            "card_count": entry["card_count"],
            "pages":      entry.get("pages") or [],
        })
    for sec in index["sections"]:
        index["sections"][sec]["galleries"].sort(key=lambda g: g["slug"])
    return index


# ── Entry point ────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("Bulk Gallery Uploader — tag-suffix convention")
    print("=" * 60)

    local_only = _LOCAL_ONLY
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    client = None if local_only else r2_client()
    if local_only:
        print("MODE: --local-only (manifests + image processing, no R2 upload)")

    all_jobs: list[GalleryJob] = []
    for section in SECTIONS:
        try:
            jobs = collect_section_galleries(section)
        except SystemExit as e:
            print(e)
            raise
        if jobs:
            print(f"\n{'=' * 40}")
            print(f"  {section.upper()} — {len(jobs)} galleries")
            print(f"{'=' * 40}")
        all_jobs.extend(jobs)

    index_entries: list[dict] = []
    for job in all_jobs:
        entry = process_gallery(client, job, local_only=local_only)
        if entry:
            index_entries.append(entry)

    index = build_index(index_entries)
    index_path = MANIFEST_ROOT / "_index.json"
    index_path.write_text(json.dumps(index, indent=2), encoding="utf-8")
    if not local_only:
        put_json(client, "art/manifests/_index.json", index)
    print(f"\n_index.json -> art/manifests/_index.json ({len(index_entries)} galleries)")

    print("\n" + "=" * 60)
    print("Done.")


if __name__ == "__main__":
    main()
