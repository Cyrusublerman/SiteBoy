## Tools

### About You – Browser Fingerprinting & Tracking Demo

**Location:** `#tools/about-you` in the SiteBoy app  
**File:** `assets/js/tools/about-you-tool.js`

A comprehensive demonstration of browser-based data collection techniques integrated into the SiteBoy framework. Shows everything a website can silently collect about visitors.

**What it tracks:**
- Network identity (IP, geolocation, ISP, connection speed)
- System fingerprint (OS, browser, hardware specs)
- Display configuration (resolution, color depth, refresh rate)
- Power & sensors (battery status, device motion)
- Behavioral analysis (mouse tracking, typing speed, reading patterns, scroll behavior)
- Unique identifiers (canvas, WebGL, browser fingerprints)
- Cross-reference potential (OSINT tools, identity discovery chains)

**Usage:**
Navigate to `#tools/about-you` in the SiteBoy app or visit the Tools section and select "About You" from the index.

**Purpose:** Educational tool demonstrating the invasive nature of web tracking and fingerprinting techniques. All tracking happens client-side; no data is sent anywhere. Shows what standard JavaScript APIs can reveal without user permission.

---

## Shreddit – Reddit Post & Comment Scraper

**Location:** `tools/shreddit/`  
**Usage:** `node tools/shreddit/scrape.js <reddit-url>`

CLI tool for archiving Reddit posts with full comment threads. Outputs to SQLite, JSON, and Markdown for further analysis by agents or other tools.

**What it scrapes:**
- Post title, content, URL
- Full comment tree (recursive, preserves hierarchy)
- Author names, timestamps
- Comment depth statistics

**Output formats:**
- SQLite database (`shreddit.db`) – persistent storage, queryable history
- JSON – structured data for programmatic analysis
- Markdown – human-readable format with nested comments

**Installation:**
```bash
cd tools/shreddit
npm install
```

**Example usage:**
```bash
# Scrape a post (saves both JSON and Markdown)
node scrape.js https://reddit.com/r/programming/comments/abc123/

# JSON only
node scrape.js <url> --json --output ./data
```

**Agent workflow:**
```
"Using Shreddit, scrape https://reddit.com/r/rust/comments/xyz/ 
and analyze sentiment distribution across comment depth"
```

**Data structure:** Each scrape produces hierarchical JSON with `url`, `title`, `content`, `comments[]` (recursive replies), `stats` (total/top-level counts, max depth).

**SQLite queries:** Query historical scrapes, count comments by author, analyze thread depth patterns. See `tools/shreddit/README.md` for examples.

---

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


