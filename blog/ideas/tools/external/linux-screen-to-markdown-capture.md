# Linux Screen-to-Markdown Capture System

**Command:** `capture-md`  
**Type:** External CLI tool (Linux desktop)  
**Status:** DESIGN | **Cluster:** knowledge-ingest  
**Last touched:** 2026-05-21

---

## Quick reference

| Attribute | Value |
|-----------|-------|
| **Purpose** | Hotkey-triggered capture of screen content → structured Markdown notes with preserved source assets |
| **Platform** | Linux (Wayland + X11) |
| **Output** | Markdown note + linked `assets/` folder (Obsidian, Logseq, Git notes compatible) |
| **Core pipeline** | Capture → asset save → OCR → [layout] → [vision] → tag/title → Markdown write |
| **Source of truth** | Original captured image — never OCR or AI output |
| **Default destination** | `~/Notes/Inbox` (configurable) |
| **Primary risk** | Derived layers overwrite or replace raw source in the archive |

---

## 1. Purpose

Linux-based capture tool converting selected screen content into structured Markdown notes: plain text, layout, headings, images, diagrams, tables, source screenshots, user notes, tags, metadata.

Behaves as a fast personal capture layer between screen and a Markdown knowledge base (Obsidian, Logseq, Git-tracked notes, custom archive).

**Intended invocation:**

```bash
capture-md
capture-md --dest ~/Notes/Inbox --mode full
```

Supports quick capture, structured extraction, and later review without losing the original source.

---

## 2. Core principle

**Invariant:** OCR text is never the source of truth.

**Layer hierarchy** (append-only; higher layers must not replace lower):

```text
raw screenshot
  → raw OCR
    → structured extraction
      → AI interpretation
        → user notes
          → tags / metadata
            → links / backlinks
```

**Consequences:**

- Raw OCR preserved in note body and sidecar file.
- Layout inference is probabilistic; confidence recorded.
- AI summarisation cannot replace captured material.
- User notes rank above AI interpretation in note body order.

---

## 3. Goals

| # | Goal |
|---|------|
| G1 | Capture region, active window, full screen, clipboard image, file path, or (optional) Chrome tab list |
| G2 | Save original screenshot/image as linked asset |
| G3 | Extract visible text via OCR |
| G4 | Preserve document structure where inferable (headings, lists, tables, block hierarchy) |
| G5 | Detect and optionally crop embedded image regions |
| G6 | Generate Markdown with YAML frontmatter |
| G7 | Allow manual notes at capture time |
| G8 | Auto-generate title, tags, entities, suggested backlinks |
| G9 | Default status `unreviewed`; explicit review workflow |
| G10 | Modular architecture supporting later visual analysis and procedural note libraries |

---

## 4. Non-goals (v1)

| Exclusion | Rationale |
|-----------|-----------|
| Continuous screen monitoring | Privacy risk, noise, low value |
| Exact layout reconstruction | Record confidence; do not overstate |
| PDF conversion engine | Out of scope — capture layer only |
| General browser scraper | Fragile; Chrome tab index mode only for first browser implementation |
| Full note-taking application | Output targets external knowledge bases |

---

## 5. Defined terms

| Term | Definition |
|------|------------|
| **Capture session** | One invocation producing one note folder (or tab-index note) |
| **Capture mode** | Processing depth: `text` \| `layout` \| `visual` \| `full` |
| **Capture source** | Input origin: `region` \| `window` \| `screen` \| `clipboard` \| `file` \| `chrome-tabs` |
| **Derived layer** | Any output computed from the raw screenshot (OCR, layout, vision, tags) |
| **Sidecar asset** | Non-Markdown file under `assets/` (PNG, TXT, JSON) |
| **Review status** | Closed set: `unreviewed` \| `reviewed` \| `needs-cleanup` \| `needs-source-check` \| `discard` \| `processed` |
| **Tab capture level** | `metadata-only` \| `readable-page` \| `visual-page` |

---

## 6. Intended usage

### 6.1 Basic capture

```bash
capture-md
```

```text
select region → save screenshot → OCR → optional note prompt → generate Markdown → save to default inbox
```

### 6.2 Destination override

```bash
capture-md --dest ~/Notes/Research/Inbox
```

### 6.3 Inline manual note

```bash
capture-md --note "Useful example of layout-aware capture."
```

### 6.4 Auto-tagging

```bash
capture-md --tags auto
```

### 6.5 Layout mode

```bash
capture-md --mode layout
```

### 6.6 Visual mode

```bash
capture-md --mode visual
```

### 6.7 Full mode

```bash
capture-md --mode full --tags auto --note
```

---

## 7. Capture modes

All modes emit the same note skeleton; processing depth differs.

### 7.1 `text`

**Use:** error messages, terminal output, short UI text, code snippets, simple quotes.

```text
screenshot → OCR → raw OCR → simple Markdown note
```

**Output emphasis:** raw OCR, screenshot embed, manual note, basic tags.

### 7.2 `layout`

**Use:** web articles, documentation, slides, PDF page screenshots, forms, research screenshots.

```text
screenshot → layout-aware OCR → block detection → heading/list/table inference → Markdown reconstruction
```

**Output emphasis:** headings, lists, tables, reading order, raw OCR backup.

### 7.3 `visual`

**Use:** diagrams, charts, UI layouts, maps, design references, architecture screenshots.

```text
screenshot → OCR → AI vision → visual description → region descriptions → Markdown note
```

**Output emphasis:** visual interpretation, detected regions, source image, uncertainty notes.

### 7.4 `full`

**Use:** important references, complex screen states, mixed text + diagram content.

```text
screenshot → OCR → layout → figure detection → vision → auto-title → auto-tags → manual note → Markdown + linked assets
```

**Output emphasis:** all layers.

---

## 8. CLI specification

### 8.1 Invocation

```bash
capture-md [options]
```

### 8.2 Options

| Flag | Values | Default |
|------|--------|---------|
| `--mode` | `text` \| `layout` \| `visual` \| `full` | `text` |
| `--dest` | path | config `default_destination` |
| `--title` | string | auto-generated |
| `--note` | string \| (prompt if bare) | none |
| `--note-editor` | — | opens `$EDITOR` |
| `--tags` | `auto` \| `none` \| `manual` | `none` |
| `--tag` | string (repeatable) | — |
| `--source` | see §5 | `region` |
| `--file` | path | — |
| `--current-window` | — | chrome-tabs filter |
| `--matching` | string | chrome-tabs filter |
| `--ask-each` | — | chrome-tabs confirm per tab |
| `--limit` | number | chrome-tabs cap |
| `--no-summary` | — | skip AI title |
| `--no-vision` | — | skip vision |
| `--no-layout` | — | skip layout |
| `--raw-only` | — | OCR + screenshot only |
| `--review-checklist` | — | append checklist section |
| `--open` | — | open note after write |
| `--config` | path | `~/.config/capture-md/config.yaml` |

### 8.3 Examples

```bash
capture-md --mode text
capture-md --dest ~/Notes/Research/Inbox
capture-md --mode full --dest ~/Obsidian/Inbox --tags auto --note
capture-md --source clipboard --mode layout
capture-md --file ~/Downloads/screenshot.png --mode visual
capture-md --mode full --tag research --tag interface-design
capture-md --source chrome-tabs --mode index
capture-md --source chrome-tabs --mode readable --matching "research" --limit 20
```

---

## 9. System architecture

```text
capture-md/
  capture.sh              # shell orchestration (screenshot trigger)
  capture_md.py           # entry point
  modules/
    capture.py            # region/window/screen/clipboard/file
    paths.py              # timestamps, folders, safe names, relative links
    ocr.py                # Tesseract (+ future backends)
    layout.py             # block/heading/list/table inference
    vision.py             # AI visual interpretation
    assets.py             # screenshot, crops, manifest
    tagging.py            # title, tags, entities, backlinks
    markdown.py           # frontmatter + Jinja render
    config.py             # user preferences
    cli.py                # argument parsing, dispatch
  config/default.yaml
  templates/note.md.j2
```

### 9.1 Module responsibilities

| Module | Owns |
|--------|------|
| `capture.py` | Screenshot acquisition; normalise output path |
| `paths.py` | Session ID, note folder, asset folder, collision avoidance |
| `ocr.py` | Raw OCR text, engine id, confidence if available |
| `layout.py` | Structured block data — does not overwrite OCR |
| `vision.py` | Non-textual description, diagram/UI interpretation |
| `assets.py` | Full screenshot, figure crops, sidecar files, relative paths |
| `tagging.py` | Title priority chain, tag normalisation, suggested wikilinks |
| `markdown.py` | YAML frontmatter + body from capture object |
| `config.py` | Defaults, engine selection, privacy flags |
| `cli.py` | Parse args, interactive prompts, error reporting |

### 9.2 Capture backends (Linux)

| Environment | Tools |
|-------------|-------|
| Wayland | `grim` + `slurp` |
| X11 | `maim` |
| GUI fallback | `flameshot`, `spectacle` (KDE), `gnome-screenshot` |

Shell layer triggers capture; Python layer owns all processing.

**Shell examples:**

```bash
# Wayland
grim -g "$(slurp)" "$IMG"
# X11
maim -s "$IMG"
# Flameshot
flameshot gui -r > "$IMG"
```

---

## 10. Data flow

```text
user trigger
  → capture screen region
  → create timestamped session
  → save screenshot (always)
  → run OCR
  → [layout analysis]
  → [vision analysis]
  → [prompt for note]
  → generate title/tags
  → write Markdown + sidecars
  → print note path
```

### 10.1 Capture object (internal model)

Written to Markdown; optionally serialised as JSON sidecar for reprocessing.

```json
{
  "id": "2026-05-21_103400",
  "created": "2026-05-21T10:34:00+10:00",
  "capture_type": "screen_region",
  "mode": "full",
  "source": {
    "app": "unknown",
    "window_title": null,
    "url": null
  },
  "assets": {
    "full_screenshot": "assets/2026-05-21_103400_full.png",
    "figures": ["assets/2026-05-21_103400_figure-01.png"]
  },
  "ocr": {
    "raw_text": "...",
    "engine": "tesseract",
    "confidence": null
  },
  "layout": { "blocks": [] },
  "vision": { "description": "...", "regions": [] },
  "user_notes": ["Useful example of layout-aware capture."],
  "metadata": {
    "title": "Linux OCR Capture Workflow",
    "tags": ["inbox", "ocr", "linux", "markdown"],
    "entities": ["Linux", "OCR", "Markdown"],
    "status": "unreviewed"
  }
}
```

---

## 11. Output specification

### 11.1 Folder layout

```text
Notes/Inbox/
  2026-05-21_103400_linux-ocr-capture.md
  assets/
    2026-05-21_103400_full.png
    2026-05-21_103400_figure-01.png
    2026-05-21_103400_ocr.txt
    2026-05-21_103400_layout.json
```

### 11.2 Asset rules

| Asset | Required | Notes |
|-------|----------|-------|
| Full screenshot | always | `./assets/{id}_full.png` |
| Raw OCR sidecar | always | `./assets/{id}_ocr.txt` |
| Layout JSON | if layout mode | block data for reprocessing |
| Figure crops | if detected | `{id}_figure-NN.png` |
| Image embed mode | linked (default) | no base64 unless config override |

### 11.3 Note body section order

1. Title (`#`)
2. Attached notes (user)
3. Cleaned extraction / structured content
4. Visual interpretation (if mode includes vision)
5. Source screenshot embed
6. Extracted figures (if any)
7. Suggested links (if any)
8. Raw OCR (fenced `text`)
9. Review checklist (optional, config)
10. Processing metadata (fenced `yaml`)

### 11.4 Example note (full mode)

```markdown
---
title: "Linux OCR Capture Workflow"
created: 2026-05-21T10:34:00+10:00
capture_id: 2026-05-21_103400
capture_type: screen_region
capture_mode: full
source_app: unknown
source_url:
status: unreviewed
tags:
  - inbox
  - ocr
  - linux
  - markdown
entities:
  - Linux
  - OCR
  - Markdown
assets:
  - ./assets/2026-05-21_103400_full.png
---

# Linux OCR Capture Workflow

## Attached notes

Useful example of layout-aware capture.

## Cleaned extraction

### Detected heading

Extracted body text.

## Visual interpretation

This capture appears to show a workflow for converting screen regions into Markdown notes.

## Source screenshot

![](./assets/2026-05-21_103400_full.png)

## Extracted figures

### Figure 1

![](./assets/2026-05-21_103400_figure-01.png)

Description: Possible diagram or visual region detected inside the screenshot.

## Raw OCR

```text
Raw OCR text goes here.
```

## Processing metadata

```yaml
ocr_engine: tesseract
layout_engine: none
vision_engine: none
review_required: true
```
```

---

## 12. Frontmatter specification

### 12.1 Required fields

```yaml
title:
created:          # ISO 8601 with timezone
capture_id:
capture_type:
capture_mode:
status:             # default: unreviewed
tags: []
assets: []          # relative paths
```

### 12.2 Optional fields

```yaml
modified:
source_app:
source_window:
source_url:
source_file:
source_clipboard:
source_browser:
source_tab_index:
source_window_index:
entities: []
capture_class: []
suggested_links: []
review_required: true
ocr_engine:
layout_engine:
vision_engine:
confidence:
  ocr:
  layout:
  vision:
processing:
  cloud_api_used: false
  provider:
duplicate_status:
duplicate_of:
```

### 12.3 Tag taxonomy

| Class | Source | Example |
|-------|--------|---------|
| System | always applied | `inbox`, `capture` |
| Mode | from `--mode` | `ocr`, `layout-capture`, `visual-reference`, `full-capture` |
| Auto | LLM/heuristic | `screen-capture`, `note-automation` |
| Manual | `--tag` / user | `research-pipeline` |

**Normalisation:** lowercase, hyphenated, no spaces.

**Obsidian simplification:** single `tags` field allowed; extended schema may use `auto_tags` / `manual_tags` when config enables split.

---

## 13. Structure detection

Layout inference is **probabilistic**. Confidence maps to Markdown output:

| Confidence | Output |
|------------|--------|
| High | `#` / `##` heading |
| Medium | heading + HTML comment with confidence |
| Low | `**Possible heading:**` bold text, not heading |

### 13.1 Detection targets

| Element | Signals |
|---------|---------|
| Heading | larger size, heavier weight, short line, isolated spacing, title case, low punctuation |
| List | bullet glyphs, number prefixes, indentation, alignment |
| Table | grid lines, cell alignment, row/column consistency |
| Code | monospace, indentation, syntax punctuation, terminal prompts |
| Reading order | top→bottom, left→right; column-aware; caption association |

**Table fallback:** if uncertain, emit fenced plain text under `## Possible table` — do not force Markdown table.

**Code fallback:** fenced block with language if confident; else ` ```text `.

---

## 14. Attached notes

Manual notes appear **before** AI interpretation in the note body.

| Input mode | Command | Behaviour |
|------------|---------|-----------|
| Inline | `--note "..."` | string stored verbatim |
| Interactive | `--note` | prompt: `Add note:` |
| Editor | `--note-editor` | open `$EDITOR`; save buffer on exit |

**Body section:**

```markdown
## Attached notes

<user text>
```

User intent for the capture often outweighs extracted text.

---

## 15. Auto-tagging and title

### 15.1 Auto-tagging

Enabled via `--tags auto`. Sources: OCR text, headings, manual notes, vision description, source app, destination folder, tag vocabulary file.

| Tag class | Field (extended schema) |
|-----------|-------------------------|
| System | `tags` |
| Auto | `auto_tags` |
| Manual | `manual_tags` |

### 15.2 Title priority chain

```text
manual (--title)
  → detected page/article heading
    → largest high-confidence heading
      → first meaningful OCR line
        → AI summary title
          → timestamp fallback ("Screen capture YYYY-MM-DD HH:MM")
```

**Filename:** `{capture_id}_{slugified-title}.md` — safe characters only.

---

## 16. Backlinks

Suggested wikilinks only when confidence is sufficient; prefer small useful set.

```markdown
## Suggested links

- [[OCR]]
- [[Linux automation]]
```

```yaml
suggested_links:
  - OCR
  - Linux automation
```

Do not auto-create excessive backlinks.

---

## 17. Review workflow

**Defaults:**

```yaml
status: unreviewed
review_required: true
```

**Status closed set:** `unreviewed`, `reviewed`, `needs-cleanup`, `needs-source-check`, `discard`, `processed`.

**Optional checklist** (`--review-checklist` or config):

```markdown
## Review checklist

- [ ] Check OCR accuracy
- [ ] Check heading structure
- [ ] Check tags
- [ ] Decide whether to keep source screenshot
- [ ] Link to relevant notes
```

### 17.1 Review queue

All captures land in inbox first (e.g. `~/Notes/Inbox/`). User moves to topic folders after review. System does not auto-classify on capture.

---

## 18. Source tracking and Chrome tab capture

### 18.1 Context fields

| Field | Availability |
|-------|----------------|
| `source_window` | preferred — window title when obtainable |
| `source_app` | when obtainable |
| `source_url` | later — browser-specific; fragile |
| `source_file` | `--source file` |
| `source_tab_index` / `source_window_index` | chrome-tabs mode |

### 18.2 Chrome tab capture (later stage)

**Not default.** Explicit `--source chrome-tabs` only.

| Mode | Output |
|------|--------|
| `index` | Single note listing all open tabs (title, URL, indices) — **first implementation** |
| `metadata` | Per-tab metadata only |
| `readable` | Metadata + main article/DOM text |
| `full` | Metadata + screenshot + OCR + optional vision |

**Commands:**

```bash
capture-md --source chrome-tabs --mode index
capture-md --source chrome-tabs --current-window
capture-md --source chrome-tabs --matching "research" --ask-each --limit 20
```

**Security:**

- Connect to Chrome DevTools (`localhost:9222`) only when user explicitly requests chrome-tabs capture.
- Never silently enable remote debugging.
- Example launch: `google-chrome --remote-debugging-port=9222` → query `http://localhost:9222/json`.
- Fallback: browser extension JSON export.

**Tab index note example:**

```markdown
# Chrome tab capture index

## Tabs

1. [Article title](https://example.com)
   - window: 1
   - tab: 3
   - status: captured-metadata-only
```

**Full tab mode output layout:**

```text
Notes/Browser Captures/
  2026-05-21_113000_chrome-tab-index.md
  chrome-tab-assets/
    2026-05-21_113000_tab-001.png
    2026-05-21_113000_tab-001.md
```

**Exclusion config** (sensitive domains, URL patterns), **deduplication** (`duplicate_status: possible_duplicate` — mark only, never auto-delete).

**Tab export object shape:**

```json
{
  "captured_at": "2026-05-21T11:30:00+10:00",
  "browser": "chrome",
  "windows": [{ "window_index": 1, "tabs": [{ "tab_index": 1, "title": "...", "url": "...", "active": false }] }]
}
```

---

## 19. Privacy model

| Default | Value |
|---------|-------|
| Continuous capture | off |
| Automatic upload | off |
| Background monitoring | off |
| Cloud processing | off unless `allow_cloud_processing: true` |
| Local OCR/LLM | preferred |

If cloud API used: `processing.cloud_api_used: true` in frontmatter.

---

## 20. Error handling

**Fail-safe rule:** always save screenshot; always attempt note write.

| Failure | Behaviour |
|---------|-----------|
| OCR | Note with failure reason; screenshot preserved |
| Layout | Fall back to raw OCR section |
| Vision | Omit section; note reason |
| Destination missing | Create if config allows, else prompt |

---

## 21. Configuration

**Path:** `~/.config/capture-md/config.yaml`

```yaml
default_destination: "~/Notes/Inbox"
asset_folder_name: "assets"
default_mode: "text"
default_source: "region"

capture:
  wayland_tool: "grim-slurp"
  x11_tool: "maim"
  gui_tool: "flameshot"

ocr:
  engine: "tesseract"
  language: "eng"

layout:
  enabled: false
  engine: "docling"

vision:
  enabled: false
  provider: "ollama"
  model: "llava"

markdown:
  include_raw_ocr: true
  include_source_screenshot: true
  include_review_checklist: false
  use_wikilinks: true
  image_embed_mode: "linked"

tags:
  auto: false
  default: [inbox, capture]
  vocabulary_path: "~/Notes/tag-vocabulary.md"

privacy:
  allow_cloud_processing: false
  save_processing_metadata: true

chrome_tabs:
  exclude_domains: [mail.google.com, accounts.google.com]
  exclude_url_patterns: ["*checkout*", "*account*"]
  default_mode: "index"
  ask_before_private_domains: true
```

---

## 22. OCR backend strategy

| Backend | Strength | Weakness | Stage |
|---------|----------|----------|-------|
| Tesseract | fast, local, plain text | weak structure | 1 |
| PaddleOCR | tables, multi-lang | heavy deps | 4 |
| Docling | document structure, Markdown | screen-oriented gaps | 4 |
| Marker | PDF→Markdown, layout | document-focused | 4+ |
| Vision-language | diagrams, UI, semantic | hallucination risk | 5 |

---

## 23. Hotkey integration

```text
Ctrl+Alt+C  →  capture-md --mode text
Ctrl+Alt+V  →  capture-md --mode visual
Ctrl+Alt+F  →  capture-md --mode full --note
```

Sway/Hyprland: `bind = CTRL ALT, C, exec, capture-md --mode text`  
KDE/GNOME: system keyboard shortcut settings.

---

## 24. Long-term extension (procedural note library)

Optional frontmatter for generative / retrieval systems:

```yaml
concepts: []
visual_features:
  layout:
  colour:
  density:
  contains_diagram:
textual_features:
  tone:
  structure:
  rare_words: []
  phonetic_interest: []
```

Enables: procedural writing, semantic retrieval, diagram indexing, generative note recombination.

---

## 25. Key design rules

1. Always save original screenshot.
2. Always preserve raw OCR (note + sidecar).
3. Never let AI cleanup replace raw source.
4. User notes separate from extracted text; user notes appear first.
5. Linked image files by default.
6. Mark notes `unreviewed` unless confirmed.
7. Stable YAML frontmatter schema.
8. Explicit capture only — no continuous monitoring.
9. Fast path (`text` mode) must stay fast.
10. Advanced interpretation optional per mode.
11. Data model before UI overbuild.
12. Modular Python for processing; shell for capture orchestration only.
13. Layout inference records confidence.
14. Store metadata sufficient for future reprocessing.

**Foundation priority:** note structure, asset paths, frontmatter, raw/derived separation — not OCR engine choice.

---

## 26. Implementation stages

| Stage | Scope | Done when |
|-------|-------|-----------|
| **1 — MVP** | Region capture, Tesseract, Markdown, linked screenshot, manual note, frontmatter, default tags | `capture-md` produces valid note from region select |
| **2 — Structure** | Heading heuristics, lists, code blocks, asset folder, safe filenames | Layout-like output without external layout engine |
| **3 — Metadata** | Auto-title, auto-tags, entities, review status | Tags and title without manual input |
| **4 — Layout backend** | Docling or PaddleOCR, tables, figures, layout JSON | `--mode layout` produces block-structured note |
| **5 — Vision** | Local/cloud vision model, diagram interpretation | `--mode visual` produces visual description section |
| **6 — KB integration** | Obsidian vault awareness, tag vocabulary, backlink suggestions, review queue | Suggested wikilinks and vault-relative paths work |

**Stage 1 build (shell + Python hybrid):**

```text
hotkey → grim/slurp or maim → assets/{id}_full.png → Tesseract → note.md → inbox
```

Do not attempt heading preservation in stage 1.

---

## 27. Status

| Component | Status |
|-----------|--------|
| Design spec | Complete |
| MVP implementation | Not started |
| Layout backend | Not started |
| Vision mode | Not started |
| Chrome tab capture | Not started (design only; index mode first) |

---

## 28. Key decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Source of truth | Raw screenshot | Prevents OCR/AI hallucination from corrupting archive |
| Image embed | Linked files | Git/Obsidian/sync/reprocess friendly |
| Default mode | `text` | Fast path for common captures |
| Chrome tabs v1 | Index mode only | Safest; avoids deep browser automation |
| Processing language | Python (+ shell capture) | Extensible for layout/vision/tagging |
| Review default | `unreviewed` | Captures are drafts until human confirms |
| Layout confidence | Explicit mapping | Avoid false structure in knowledge base |

---

## 29. Open questions

1. Single Obsidian vault path vs generic `--dest` only?
2. Default Chrome tab exclusion list — shipped preset vs user-only?
3. Sidecar JSON capture object — always write or config flag?
4. Wikilink vs standard Markdown link default for non-Obsidian destinations?

---

## Appendix A — Minimal Markdown template (`note.md.j2`)

```markdown
---
title: "{{ title }}"
created: {{ created }}
capture_id: {{ capture_id }}
capture_type: {{ capture_type }}
capture_mode: {{ capture_mode }}
status: unreviewed
tags:
{% for tag in tags %}
  - {{ tag }}
{% endfor %}
assets:
  - {{ screenshot_path }}
---

# {{ title }}

## Attached notes

{{ user_note }}

## Extracted text

{{ cleaned_text }}

## Source screenshot

![]({{ screenshot_path }})

## Raw OCR

```text
{{ raw_ocr }}
```
```

---

## Appendix B — Full Markdown template (`note.md.j2`)

```markdown
---
title: "{{ title }}"
created: {{ created }}
modified:
capture_id: {{ capture_id }}
capture_type: {{ capture_type }}
capture_mode: {{ capture_mode }}
source_app: {{ source_app }}
source_window: {{ source_window }}
source_url: {{ source_url }}
status: unreviewed
review_required: true
tags:
{% for tag in tags %}
  - {{ tag }}
{% endfor %}
entities:
{% for entity in entities %}
  - {{ entity }}
{% endfor %}
capture_class:
{% for item in capture_class %}
  - {{ item }}
{% endfor %}
assets:
{% for asset in assets %}
  - {{ asset }}
{% endfor %}
ocr_engine: {{ ocr_engine }}
layout_engine: {{ layout_engine }}
vision_engine: {{ vision_engine }}
confidence:
  ocr: {{ ocr_confidence }}
  layout: {{ layout_confidence }}
  vision: {{ vision_confidence }}
---

# {{ title }}

## Attached notes

{{ user_notes }}

## Cleaned extraction

{{ structured_markdown }}

## Visual interpretation

{{ visual_interpretation }}

## Source screenshot

![]({{ screenshot_path }})

## Extracted figures

{% for figure in figures %}
### Figure {{ loop.index }}

![]({{ figure.path }})

{{ figure.description }}
{% endfor %}

## Suggested links

{% for link in suggested_links %}
- [[{{ link }}]]
{% endfor %}

## Raw OCR

```text
{{ raw_ocr }}
```

## Review checklist

- [ ] Check OCR accuracy
- [ ] Check heading structure
- [ ] Check tags
- [ ] Decide whether to keep extracted figures
- [ ] Link to relevant notes

## Processing metadata

```yaml
capture_tool: {{ capture_tool }}
ocr_engine: {{ ocr_engine }}
layout_engine: {{ layout_engine }}
vision_engine: {{ vision_engine }}
cloud_api_used: {{ cloud_api_used }}
```
```

---

## File location

```text
blog/ideas/tools/external/linux-screen-to-markdown-capture.md   ← this file
```

Implementation (when started) lives outside SiteBoy — standalone `capture-md` project.


---

## Related ideas

- [Web-to-Knowledge Pipeline](../../thoughts/web-to-knowledge-pipeline.md)
- [Design Knowledge Corpus Extraction](../../create-rules-for-ai/design-knowledge-corpus-extraction-system.md)
- [Design-Rule Corpus Plan](../../create-rules-for-ai/plan.md)
- [Design-Rule Audit](../../create-rules-for-ai/audit.md)
- [Notebook Decomposition & Publishing](notebook_decomposition_publishing_system_design_doc.md)
