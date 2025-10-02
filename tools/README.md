## pdf2md-here – Drop-in PDF → Markdown converter

Create editor-friendly Markdown and extracted assets from PDFs by simply placing this script in a folder and running it.

### What it does
- Scans the current folder for `.pdf` files (non-recursive).
- Creates a sibling folder named "<Folder Name> MD" next to the current folder.
- Outputs:
  - `md/<doc-slug>.md` – Markdown with visible YAML frontmatter
  - `assets/<doc-slug>/{originals,web,thumb}/…` – extracted images and WebP derivatives
  - `manifest.json` – summary of processed files

### Requirements
- Python 3.11+
- Install dependencies once:
```bash
pip install pymupdf Pillow
```

### Quick start (double-click friendly)
1) Copy `tools/pdf2md-here.py` into the folder that contains your PDFs.
2) Double‑click `pdf2md-here.py` (or run `python pdf2md-here.py`).
3) A sibling folder named "<This Folder Name> MD" will appear with outputs.

### Output layout
```
<Parent Folder>/
  <Your PDF Folder>/
    pdf2md-here.py
    *.pdf
  <Your PDF Folder> MD/
    md/
      <doc-slug>.md
    assets/
      <doc-slug>/
        originals/
        web/
        thumb/
    manifest.json
```

### Markdown frontmatter (generated)
- Contains: `title`, `header`, `subheader`, `url`, `category`, `tags`, `date`, `toc`, `source_pdf`, `import_version`, and `xSiteBoy` options.
- You can edit the `.md` in any Markdown editor. Update `category` and `url` later as needed.

### Bring results into the SiteBoy repo
- Move files as follows:
  - `md/*.md` → `blog/docs/imported/<category>/`
  - `assets/<doc-slug>/…` → `assets/img/extracted/<doc-slug>/…`
- Adjust frontmatter fields (`category`, `url`) to match your site structure.

### Optional: build a single .exe (Windows)
If you want a true double‑click standalone:
1) Install PyInstaller:
```bash
pip install pyinstaller
```
2) Build:
```bash
cd tools
pyinstaller --onefile --name pdf2md-here pdf2md-here.py
```
3) Use `dist/pdf2md-here.exe` by placing it into any PDF folder and double‑clicking.

### Notes and limitations (v1)
- Headings are inferred from font sizes and weight (capped at H4).
- Images are extracted and listed under a "Figures" section in order.
- Tables/footnotes/math receive basic treatment in this minimal tool.
- Derivatives are WebP at 1600px (web) and 480px (thumb).

### Troubleshooting
- "Missing dependency": install with `pip install pymupdf Pillow`.
- "No PDFs found": ensure `.pdf` files are in the same folder as the script.
- Output location: check the sibling "<Folder Name> MD" directory next to your PDF folder.


