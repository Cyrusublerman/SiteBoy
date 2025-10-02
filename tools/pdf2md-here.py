#!/usr/bin/env python3
"""
pdf2md-here.py – Drop-in PDF → Markdown converter (double-click friendly)

Usage
  - Copy this file into any folder that contains one or more PDF files.
  - Double-click it (or run with Python).
  - It will create a sibling folder named "<This Folder Name> MD" next to the
    current directory, containing:
      - md/<doc-slug>.md                (Markdown with frontmatter)
      - assets/<doc-slug>/originals/... (extracted images)
      - assets/<doc-slug>/web/...       (web-optimized WEBP)
      - assets/<doc-slug>/thumb/...     (thumbnail WEBP)
      - manifest.json                   (import summary)

Notes
  - Dependencies: PyMuPDF (pymupdf) and Pillow. Install via:
      pip install pymupdf Pillow
  - This is a minimal, no-config runner for convenience. It aims for clean,
    editor-friendly Markdown and deterministic asset output. The repo-grade
    CLI (if used) can perform more advanced layout heuristics.

Limitations (by design for a simple, portable tool)
  - Headings are inferred heuristically from font sizes and weight, capped at H4.
  - Images are extracted and listed under a "Figures" section in document order.
  - Tables/footnotes/math are not specially handled here.

"""

from __future__ import annotations

import sys
import os
import re
import json
import hashlib
import datetime
import threading
import queue
from pathlib import Path
from typing import Dict, List, Tuple

try:
    import fitz  # PyMuPDF
except Exception:
    print("[error] Missing dependency: PyMuPDF. Install with: pip install pymupdf")
    sys.exit(1)

try:
    from PIL import Image, ImageTk
except Exception:
    print("[error] Missing dependency: Pillow. Install with: pip install Pillow")
    sys.exit(1)

# Optional GUI imports
try:
    import tkinter as tk
    from tkinter import ttk, filedialog, messagebox
    TK_AVAILABLE = True
except Exception:
    TK_AVAILABLE = False


def slugify(text: str) -> str:
    """Convert text to a lowercase kebab-case slug."""
    s = re.sub(r"[^a-zA-Z0-9\-\_\s]+", "", text)
    s = re.sub(r"\s+", "-", s)
    return s.lower().strip("-")


def compute_checksum(path: Path) -> str:
    """Compute SHA-256 checksum of a file for determinism/auditing."""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def get_run_dir() -> Path:
    """Determine the directory to process PDFs in.

    If frozen (packaged), use the executable's directory; otherwise use CWD.
    """
    if getattr(sys, "frozen", False):  # PyInstaller scenario
        return Path(sys.executable).parent
    return Path.cwd()


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def export_pixmap(pix: "fitz.Pixmap", out_path: Path) -> None:
    """Save a Pixmap as PNG; flatten alpha to avoid palette surprises."""
    if pix.alpha:  # flatten alpha to white background
        pix = fitz.Pixmap(pix, 0)
    pix.save(str(out_path))


def resize_keep_aspect(image: Image.Image, target_width: int) -> Image.Image:
    if image.width <= target_width:
        return image
    ratio = target_width / float(image.width)
    new_h = max(1, int(round(image.height * ratio)))
    return image.resize((target_width, new_h), Image.LANCZOS)


def make_derivatives(src_img: Path, web_path: Path, thumb_path: Path) -> None:
    """Generate WEBP derivatives for web and thumbnail displays."""
    try:
        with Image.open(src_img) as im:
            # Web size
            web_img = resize_keep_aspect(im, 1600)
            web_path.parent.mkdir(parents=True, exist_ok=True)
            web_img.save(web_path.with_suffix(".webp"), format="WEBP", quality=82, method=6)

            # Thumb size
            thumb_img = resize_keep_aspect(im, 480)
            thumb_path.parent.mkdir(parents=True, exist_ok=True)
            thumb_img.save(thumb_path.with_suffix(".webp"), format="WEBP", quality=80, method=6)
    except Exception as e:
        print(f"[warn] Derivative generation failed for {src_img.name}: {e}")


def collect_spans(doc: "fitz.Document") -> List[Dict]:
    """Collect text spans with font sizes/weight and positional info."""
    spans: List[Dict] = []
    for page_index in range(len(doc)):
        page = doc[page_index]
        data = page.get_text("dict")
        blocks = data.get("blocks", [])
        for b in blocks:
            for line in b.get("lines", []):
                for s in line.get("spans", []):
                    text = (s.get("text") or "").strip()
                    if not text:
                        continue
                    bbox = s.get("bbox", [0, 0, 0, 0])
                    font_name = s.get("font", "")
                    spans.append({
                        "page": page_index + 1,
                        "text": text,
                        "size": float(s.get("size", 0.0)),
                        "bold": ("Bold" in font_name) or ("Semibold" in font_name) or ("Demi" in font_name),
                        "x": float(bbox[0]),
                        "y": float(bbox[1]),
                    })
    return spans


def infer_heading_levels(spans: List[Dict]) -> Dict[float, int]:
    """Map distinct font sizes to heading levels (1..4), largest → H1.

    This is heuristic and document-specific; we cap depth at H4.
    """
    if not spans:
        return {}
    sizes = sorted({round(s["size"], 1) for s in spans if s.get("size", 0) > 0}, reverse=True)
    size_to_level: Dict[float, int] = {}
    for idx, size in enumerate(sizes):
        size_to_level[size] = min(idx + 1, 4)  # 1..4
    return size_to_level


def choose_title(spans: List[Dict]) -> str:
    """Pick a plausible document title: largest font, earliest on page."""
    if not spans:
        return "Untitled Document"
    ordered = sorted(spans, key=lambda s: (-s["size"], s["page"], s["y"], s["x"]))
    candidate = ordered[0]["text"].strip()
    return candidate[:120] if candidate else "Untitled Document"


def assemble_markdown(
    title: str,
    spans: List[Dict],
    size_to_level: Dict[float, int],
    figures: List[Tuple[int, Path]]
) -> str:
    """Turn spans and figure list into Markdown text with headings and a Figures section."""
    lines: List[str] = [f"# {title}", ""]

    # Simple segmentation: treat short lines at heading sizes as headings, otherwise paragraphs.
    for s in spans:
        text = s["text"].strip()
        if not text:
            continue
        level = size_to_level.get(round(s["size"], 1), 0)
        if level >= 2 and len(text) <= 120:
            lines.append("#" * level + f" {text}")
            lines.append("")
        else:
            lines.append(text)
            lines.append("")

    if figures:
        lines.append("## Figures")
        lines.append("")
        for idx, web_path in figures:
            alt = f"Figure {idx}"
            caption = f"Figure {idx}"
            rel_path = web_path.as_posix()
            lines.append(f"![{alt}]({rel_path} \"{caption}\")")
            lines.append("")

    # Join with single blank lines separating paragraphs/sections
    # Remove any trailing excessive blanks
    while lines and lines[-1] == "":
        lines.pop()
    return "\n".join(lines) + "\n"


def write_frontmatter(frontmatter: Dict) -> str:
    """Emit a minimal YAML frontmatter string.

    We avoid external YAML libs for portability; this suffices for our simple types.
    """
    def yaml_escape(value: str) -> str:
        if value is None:
            return "''"
        # Quote if value contains special chars
        if re.search(r"[:#\-\n\r\t]", value):
            # Use double quotes; escape quotes inside
            return '"' + value.replace('"', '\\"') + '"'
        return value

    lines: List[str] = ["---"]
    for key, value in frontmatter.items():
        if isinstance(value, bool):
            lines.append(f"{key}: {'true' if value else 'false'}")
        elif isinstance(value, (int, float)):
            lines.append(f"{key}: {value}")
        elif isinstance(value, str):
            lines.append(f"{key}: {yaml_escape(value)}")
        elif value is None:
            lines.append(f"{key}: null")
        elif isinstance(value, list):
            lines.append(f"{key}:")
            for item in value:
                if isinstance(item, (int, float)):
                    lines.append(f"  - {item}")
                elif isinstance(item, bool):
                    lines.append(f"  - {'true' if item else 'false'}")
                else:
                    lines.append(f"  - {yaml_escape(str(item))}")
        elif isinstance(value, dict):
            lines.append(f"{key}:")
            for sub_key, sub_value in value.items():
                if isinstance(sub_value, bool):
                    lines.append(f"  {sub_key}: {'true' if sub_value else 'false'}")
                elif isinstance(sub_value, (int, float)):
                    lines.append(f"  {sub_key}: {sub_value}")
                elif isinstance(sub_value, list):
                    lines.append(f"  {sub_key}:")
                    for sub_item in sub_value:
                        if isinstance(sub_item, (int, float)):
                            lines.append(f"    - {sub_item}")
                        elif isinstance(sub_item, bool):
                            lines.append(f"    - {'true' if sub_item else 'false'}")
                        else:
                            lines.append(f"    - {yaml_escape(str(sub_item))}")
                else:
                    lines.append(f"  {sub_key}: {yaml_escape(str(sub_value))}")
        else:
            # Fallback to string
            lines.append(f"{key}: {yaml_escape(str(value))}")
    lines.append("---\n")
    return "\n".join(lines)


def process_single_pdf(pdf_path: Path, out_root: Path, manifest: Dict) -> None:
    """Convert a single PDF into Markdown + assets inside out_root."""
    doc_slug = slugify(pdf_path.stem)
    checksum = compute_checksum(pdf_path)

    doc = fitz.open(str(pdf_path))

    # Prepare assets directories for this document
    assets_root = out_root / "assets" / doc_slug
    originals_dir = assets_root / "originals"
    web_dir = assets_root / "web"
    thumb_dir = assets_root / "thumb"
    ensure_dir(originals_dir)
    ensure_dir(web_dir)
    ensure_dir(thumb_dir)

    # Extract images per page (document order) and make derivatives
    figure_index = 0
    figure_web_paths: List[Tuple[int, Path]] = []  # (figure_number, web_path)
    for page_idx in range(len(doc)):
        page = doc[page_idx]
        images = page.get_images(full=True)
        for img in images:
            xref = img[0]
            try:
                pix = fitz.Pixmap(doc, xref)
                figure_index += 1
                stem = f"{doc_slug}_fig_{figure_index:02d}"
                orig_path = originals_dir / f"{stem}.png"
                export_pixmap(pix, orig_path)
                web_stub = web_dir / stem
                thumb_stub = thumb_dir / stem
                make_derivatives(orig_path, web_stub, thumb_stub)
                figure_web_paths.append((figure_index, (web_stub.with_suffix(".webp"))))
            except Exception as e:
                print(f"[warn] Image export failed on page {page_idx + 1} (xref {xref}): {e}")

    # Collect text spans
    spans = collect_spans(doc)
    size_to_level = infer_heading_levels(spans)
    title = choose_title(spans) or pdf_path.stem

    # Build frontmatter
    today = datetime.date.today().isoformat()
    frontmatter = {
        "title": title,
        "header": title,
        "subheader": "",
        "url": f"/docs/uncategorized/{doc_slug}",
        "category": "uncategorized",
        "tags": [],
        "date": today,
        "toc": True,
        "source_pdf": str(pdf_path),
        "import_version": 1,
        "xSiteBoy": {
            "dropdownThreshold": 500,
            "groupConsecutiveImagesAsGrid": True,
            "maxHeadingDepth": 4,
            "allowShortcodes": ["Video", "Audio", "Gallery", "Chart"],
        },
        "blocks_override": [],
    }

    # Assemble Markdown body
    # Figure paths should be relative to the MD file location we choose (out_root/md)
    # We will compute relative paths after determining MD output directory.
    # For now, collect absolute (posix) under out_root; adjust later.
    md_dir = out_root / "md"
    ensure_dir(md_dir)
    md_path = md_dir / f"{doc_slug}.md"

    # Compute figure rel paths from md_dir
    adjusted_figures: List[Tuple[int, Path]] = []
    for idx, web_path in figure_web_paths:
        # Relative path from md_dir to web_path
        rel = os.path.relpath(web_path, start=md_dir)
        adjusted_figures.append((idx, Path(rel)))

    body = assemble_markdown(title, spans, size_to_level, adjusted_figures)
    content = write_frontmatter(frontmatter) + body

    with open(md_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(content)

    manifest.setdefault("documents", []).append({
        "slug": doc_slug,
        "title": title,
        "pdf": str(pdf_path),
        "md": str(md_path),
        "assets_dir": str(assets_root),
        "checksum_pdf": checksum,
        "images_count": len(figure_web_paths),
    })


def main() -> None:
    run_dir = get_run_dir()
    pdf_dir = run_dir

    # Decide output location: sibling "<Folder Name> MD" next to current dir
    parent = pdf_dir.parent
    out_root = parent / f"{pdf_dir.name} MD"
    try:
        ensure_dir(out_root)
    except Exception:
        # Fallback: inside current directory
        out_root = pdf_dir / f"{pdf_dir.name} MD"
        ensure_dir(out_root)

    # Find PDFs (top-level only)
    pdfs = sorted([p for p in pdf_dir.iterdir() if p.is_file() and p.suffix.lower() == ".pdf"])
    if not pdfs:
        print("No PDFs found in this folder.")
        return

    manifest: Dict = {
        "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
        "source_folder": str(pdf_dir),
        "output_folder": str(out_root),
        "documents": [],
    }

    for pdf in pdfs:
        try:
            process_single_pdf(pdf, out_root, manifest)
            print(f"[ok] {pdf.name}")
        except Exception as e:
            print(f"[error] {pdf.name}: {e}")

    with open(out_root / "manifest.json", "w", encoding="utf-8") as mf:
        json.dump(manifest, mf, indent=2, ensure_ascii=False)

    print(f"\nDone. Output: {out_root}")

    # If double-clicked from Explorer, pause so the window does not close instantly
    if not sys.stdin.isatty():
        try:
            input("Press Enter to close…")
        except Exception:
            pass


if __name__ == "__main__":
    # If GUI is available and no CLI flags are passed, prefer GUI mode on double-click
    args_lower = {a.lower() for a in sys.argv[1:]}
    use_cli = ("--cli" in args_lower) or ("-c" in args_lower)
    if TK_AVAILABLE and not use_cli and len(sys.argv) == 1:
        # Lazy-import GUI wrapper to keep top-level clean
        class Pdf2MdApp:
            def __init__(self, root: "tk.Tk") -> None:
                self.root = root
                self.root.title("PDF → Markdown (Here)")
                self.root.geometry("900x650")

                self.src_var = tk.StringVar(value=str(get_run_dir()))
                self.out_var = tk.StringVar(value="")
                self.status_var = tk.StringVar(value="Idle")

                # Top: source folder selection
                top = ttk.Frame(root)
                top.pack(fill=tk.X, padx=10, pady=10)
                ttk.Label(top, text="Source folder:").pack(side=tk.LEFT)
                self.src_entry = ttk.Entry(top, textvariable=self.src_var)
                self.src_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=6)
                ttk.Button(top, text="Browse…", command=self.browse_src).pack(side=tk.LEFT)

                # Middle: list of PDFs and controls
                mid = ttk.Frame(root)
                mid.pack(fill=tk.BOTH, expand=True, padx=10, pady=(0,10))

                left = ttk.Frame(mid)
                left.pack(side=tk.LEFT, fill=tk.BOTH, expand=False)
                ttk.Label(left, text="PDF files:").pack(anchor=tk.W)
                self.listbox = tk.Listbox(left, selectmode=tk.EXTENDED, width=40, height=20)
                self.listbox.pack(fill=tk.BOTH, expand=True)
                btns = ttk.Frame(left)
                btns.pack(fill=tk.X, pady=6)
                ttk.Button(btns, text="Refresh", command=self.refresh_pdfs).pack(side=tk.LEFT)
                ttk.Button(btns, text="Select All", command=self.select_all).pack(side=tk.LEFT, padx=6)

                center = ttk.Frame(mid)
                center.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=10)
                ttk.Label(center, text="Log:").pack(anchor=tk.W)
                self.log = tk.Text(center, wrap=tk.word, height=12)
                self.log.pack(fill=tk.BOTH, expand=True)
                self.progress = ttk.Progressbar(center, mode="determinate")
                self.progress.pack(fill=tk.X, pady=6)
                self.status = ttk.Label(center, textvariable=self.status_var)
                self.status.pack(anchor=tk.W)

                right = ttk.LabelFrame(mid, text="Preview")
                right.pack(side=tk.LEFT, fill=tk.BOTH, expand=False)
                # Before (first page)
                ttk.Label(right, text="Before (PDF page 1)").pack(anchor=tk.W)
                self.before_canvas = tk.Label(right)
                self.before_canvas.pack(padx=4, pady=4)
                # After (first image + md snippet)
                ttk.Label(right, text="After (first image)").pack(anchor=tk.W)
                self.after_canvas = tk.Label(right)
                self.after_canvas.pack(padx=4, pady=4)
                ttk.Label(right, text="MD snippet").pack(anchor=tk.W)
                self.after_md = tk.Text(right, wrap=tk.word, height=8, width=40)
                self.after_md.pack(padx=4, pady=4)

                # Bottom controls
                bottom = ttk.Frame(root)
                bottom.pack(fill=tk.X, padx=10, pady=10)
                ttk.Button(bottom, text="Start", command=self.start).pack(side=tk.LEFT)
                ttk.Button(bottom, text="Open Output", command=self.open_output).pack(side=tk.LEFT, padx=6)
                ttk.Button(bottom, text="Quit", command=root.destroy).pack(side=tk.RIGHT)

                self.queue: "queue.Queue" = queue.Queue()
                self.worker: threading.Thread | None = None
                self.refresh_pdfs()
                self.root.after(100, self.pump_queue)

            def browse_src(self) -> None:
                path = filedialog.askdirectory(initialdir=self.src_var.get() or str(get_run_dir()))
                if path:
                    self.src_var.set(path)
                    self.refresh_pdfs()

            def refresh_pdfs(self) -> None:
                self.listbox.delete(0, tk.END)
                src = Path(self.src_var.get())
                if not src.exists():
                    return
                pdfs = sorted([p for p in src.iterdir() if p.is_file() and p.suffix.lower() == ".pdf"])
                for p in pdfs:
                    self.listbox.insert(tk.END, p.name)
                # Update default output
                out_root = src.parent / f"{src.name} MD"
                self.out_var.set(str(out_root))
                self.status_var.set(f"Found {len(pdfs)} PDF(s)")

            def select_all(self) -> None:
                self.listbox.select_set(0, tk.END)

            def log_line(self, text: str) -> None:
                self.log.insert(tk.END, text + "\n")
                self.log.see(tk.END)

            def pump_queue(self) -> None:
                try:
                    while True:
                        kind, payload = self.queue.get_nowait()
                        if kind == "status":
                            self.status_var.set(payload)
                        elif kind == "log":
                            self.log_line(payload)
                        elif kind == "progress":
                            self.progress["value"] = payload[0]
                            self.progress["maximum"] = payload[1]
                        elif kind == "preview_before":
                            img = payload
                            self.before_img = img  # keep reference
                            self.before_canvas.configure(image=img)
                        elif kind == "preview_after_img":
                            img = payload
                            self.after_img = img
                            self.after_canvas.configure(image=img)
                        elif kind == "preview_after_md":
                            self.after_md.delete("1.0", tk.END)
                            self.after_md.insert("1.0", payload)
                        elif kind == "done":
                            messagebox.showinfo("Done", f"Output in: {self.out_var.get()}")
                except queue.Empty:
                    pass
                self.root.after(100, self.pump_queue)

            def start(self) -> None:
                if self.worker and self.worker.is_alive():
                    return
                src = Path(self.src_var.get())
                if not src.exists():
                    messagebox.showerror("Error", "Source folder does not exist")
                    return
                sel = [self.listbox.get(i) for i in self.listbox.curselection()]
                if not sel:
                    # if none selected, process all
                    sel = [self.listbox.get(i) for i in range(self.listbox.size())]
                pdfs = [src / name for name in sel]
                out_root = src.parent / f"{src.name} MD"
                self.out_var.set(str(out_root))
                self.progress["value"] = 0
                self.log.delete("1.0", tk.END)
                self.status_var.set("Starting…")
                self.worker = threading.Thread(target=self.worker_run, args=(pdfs, out_root), daemon=True)
                self.worker.start()

            def open_output(self) -> None:
                out = self.out_var.get()
                if out and os.path.isdir(out):
                    try:
                        os.startfile(out)  # Windows
                    except Exception:
                        messagebox.showinfo("Output", out)

            def render_photo(self, pil_img: "Image.Image", max_size: Tuple[int,int] = (280, 280)):
                pil = pil_img.copy()
                pil.thumbnail(max_size, Image.LANCZOS)
                return ImageTk.PhotoImage(pil)

            def preview_before(self, pdf_path: Path) -> None:
                try:
                    doc = fitz.open(str(pdf_path))
                    page = doc[0]
                    pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5))
                    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                    self.queue.put(("preview_before", self.render_photo(img)))
                except Exception:
                    pass

            def preview_after(self, md_path: Path, first_image_web: Path | None) -> None:
                try:
                    # MD snippet
                    snippet = ""
                    with open(md_path, "r", encoding="utf-8") as f:
                        for _ in range(40):
                            line = f.readline()
                            if not line:
                                break
                            snippet += line
                    self.queue.put(("preview_after_md", snippet))
                except Exception:
                    pass
                if first_image_web and first_image_web.exists():
                    try:
                        im = Image.open(first_image_web)
                        self.queue.put(("preview_after_img", self.render_photo(im)))
                    except Exception:
                        pass

            def worker_run(self, pdfs: list[Path], out_root: Path) -> None:
                ensure_dir(out_root)
                manifest = {
                    "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
                    "source_folder": str(pdfs[0].parent if pdfs else self.src_var.get()),
                    "output_folder": str(out_root),
                    "documents": [],
                }
                total = len(pdfs)
                for i, pdf in enumerate(pdfs, start=1):
                    self.queue.put(("status", f"Processing {pdf.name} ({i}/{total})"))
                    self.queue.put(("progress", (i - 1, total)))
                    self.queue.put(("log", f"→ {pdf.name}"))
                    try:
                        # Before preview
                        self.preview_before(pdf)
                        # Process
                        process_single_pdf(pdf, out_root, manifest)
                        # After preview (first image + md snippet)
                        doc_slug = slugify(pdf.stem)
                        md_path = out_root / "md" / f"{doc_slug}.md"
                        first_web = None
                        web_dir = out_root / "assets" / doc_slug / "web"
                        if web_dir.exists():
                            webs = sorted(web_dir.glob("*.webp"))
                            first_web = webs[0] if webs else None
                        self.preview_after(md_path, first_web)
                        self.queue.put(("log", f"✓ {pdf.name}"))
                    except Exception as e:
                        self.queue.put(("log", f"✗ {pdf.name}: {e}"))
                    self.queue.put(("progress", (i, total)))

                with open(out_root / "manifest.json", "w", encoding="utf-8") as mf:
                    json.dump(manifest, mf, indent=2, ensure_ascii=False)
                self.queue.put(("status", "Done"))
                self.queue.put(("done", True))

        def gui_main():
            root = tk.Tk()
            Pdf2MdApp(root)
            root.mainloop()

        gui_main()
    else:
        main()


