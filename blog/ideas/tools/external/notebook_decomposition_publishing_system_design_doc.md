# Notebook Decomposition, Transformation, and Publishing System
**Status:** SPEC | **Cluster:** personal-notes, knowledge-ingest


## 1. Purpose

This document defines a system for processing scanned physical notebooks into a structured digital archive, image asset library, searchable text corpus, and category-driven publishing source.

The system is not only an OCR pipeline. It is a notebook decomposition, classification, transformation, curation, and book-generation pipeline. Each physical notebook is treated as a source object containing pages, page regions, text, drawings, diagrams, paintings, collages, fragments, textures, palettes, and reusable visual assets.

The long-term aim is to process folders of scanned notebooks and convert them into:

- cleaned archival page images
- extracted handwritten and printed text
- structured Markdown notes
- cropped image regions
- transparent drawing assets
- vectorised line-art and graphics
- colour-quantised variants
- semantic tags and metadata
- searchable indexes
- curated collections
- source material for a series of books based around categories, motifs, media types, visual qualities, and conceptual groupings

The system must preserve provenance at all stages. Every processed output must remain linked to the source notebook, source page, page coordinates, processing pipeline version, and review status.

---

## 2. Core System Principle

The physical notebook is the canonical source. All digital outputs are derived from it.

Each notebook page should be understood as:

1. a document
2. a visual asset container
3. a text source
4. a memory/provenance object
5. a source for later publishing
6. a source for generative and procedural transformation

The system should never flatten these roles into a single output. A page can simultaneously contain text, drawings, diagrams, pasted fragments, background textures, failed marks, marginal notes, and book-worthy extracted assets.

The correct structure is therefore:

```text
Notebook
  Page
    Regions
      Source crops
      Processed derivatives
      Text transcriptions
      Metadata
      Tags
      Review decisions
      Book memberships
```

---

## 3. Design Goals

### 3.1 Archival Goals

The system must:

- preserve original scans untouched
- generate cleaned page versions without replacing originals
- record all transformations
- retain page coordinates for every crop
- preserve notebook identity and page order
- allow later reprocessing with improved models
- allow manual correction without breaking provenance

### 3.2 Extraction Goals

The system must extract:

- handwritten text
- printed text
- diagrams
- sketches
- paintings
- collages
- pasted photographs
- colour swatches
- symbols
- marginal notes
- visual fragments
- textures
- empty/negative-space structures where relevant

### 3.3 Classification Goals

The system must classify assets by:

- medium
- visual mode
- content
- formal qualities
- processing suitability
- conceptual category
- book suitability
- review status

Classification must use controlled vocabularies, not uncontrolled AI-generated tag sprawl.

### 3.4 Transformation Goals

The system must generate useful derivatives, including:

- transparent PNGs
- binary black-line images
- cleaned raster images
- vector SVGs
- simplified SVGs
- colour-quantised images
- palette files
- masks
- texture crops
- contact sheets
- book-source export sets

### 3.5 Publishing Goals

The system must support category-driven books, such as:

- black ink drawings
- abstract forms
- diagrams and systems
- collages
- text fragments
- repeated motifs
- colour studies
- notebook chronology
- hybrid concept books

Books should be generated from structured rules and then manually curated.

---

## 4. Non-Goals

The system is not intended to:

- replace manual curation
- produce final books without review
- treat AI outputs as authoritative
- destroy or overwrite source scans
- rely on a single AI provider
- classify everything using whole-page vision prompts
- use unrestricted AI tag invention as the main metadata system
- assume OCR will perfectly transcribe handwriting
- assume all drawings should be cleaned or vectorised

---

## 5. High-Level Pipeline

```text
Input folders
  ↓
Notebook registration
  ↓
Scan ingestion
  ↓
Page normalisation
  ↓
Page-level layout analysis
  ↓
Region detection
  ↓
Region extraction
  ↓
OCR and transcription
  ↓
Region classification
  ↓
Type-specific processing branches
  ↓
Derivative asset generation
  ↓
Metadata writing
  ↓
Search/index database
  ↓
Human review and correction
  ↓
Category grouping
  ↓
Book-source assembly
  ↓
Export to Markdown / PDF / layout software / web archive
```

---

## 6. Physical Notebook Identity

Each physical notebook should have a stable notebook ID.

A useful optional mechanism is a QR code, barcode, NFC tag, or printed identifier placed inside each notebook. When scanned, this ID associates images with a known notebook object.

Example notebook ID:

```text
NB_2024_001
```

Each page then receives a stable derived page ID:

```text
NB_2024_001_P0001
NB_2024_001_P0002
NB_2024_001_P0003
```

Each extracted region receives a region ID:

```text
NB_2024_001_P0003_R004
```

Each derivative asset receives a derivative ID:

```text
NB_2024_001_P0003_R004_D_TRANSPARENT
NB_2024_001_P0003_R004_D_VECTOR_HIFI
NB_2024_001_P0003_R004_D_QUANT_08
```

This allows every image, transcription, crop, tag, and book placement to remain traceable to the physical source.

---

## 7. Folder Structure

Recommended root structure:

```text
notebook_archive/
  00_registry/
    notebooks.json
    tag_registry.yaml
    category_registry.yaml
    pipeline_versions.json

  01_source_scans/
    NB_2024_001/
      raw/
        NB_2024_001_P0001.tif
        NB_2024_001_P0002.tif
      intake_manifest.json

  02_processed_pages/
    NB_2024_001/
      cleaned/
        NB_2024_001_P0001.cleaned.png
      preview/
        NB_2024_001_P0001.preview.jpg
      thumbnail/
        NB_2024_001_P0001.thumb.jpg
      layout/
        NB_2024_001_P0001.layout.json
      page_metadata/
        NB_2024_001_P0001.metadata.json

  03_regions/
    NB_2024_001/
      NB_2024_001_P0001/
        NB_2024_001_P0001_R001.source_crop.png
        NB_2024_001_P0001_R001.mask.png
        NB_2024_001_P0001_R001.metadata.json

  04_derivatives/
    NB_2024_001/
      NB_2024_001_P0001_R001/
        cleaned.png
        transparent.png
        bw_binary.png
        vector_hifi.svg
        vector_simplified.svg
        quant_16.png
        quant_08.png
        palette.json
        skeleton.png
        edge_map.png
        texture_patch.png
        derivative_manifest.json

  05_text/
    NB_2024_001/
      ocr_raw/
        NB_2024_001_P0001.ocr_raw.txt
      ocr_cleaned/
        NB_2024_001_P0001.ocr_cleaned.txt
      markdown_pages/
        NB_2024_001_P0001.md
      summaries/
        NB_2024_001_P0001.summary.md

  06_indexes/
    archive.sqlite
    pages.jsonl
    regions.jsonl
    derivatives.jsonl
    ocr_index.jsonl
    assets.csv

  07_review/
    review_queue.jsonl
    corrections.jsonl
    rejected_assets.jsonl
    approved_assets.jsonl

  08_booksources/
    black_ink_abstract_forms/
      selected_assets.json
      selected_assets.csv
      contact_sheet.pdf
      captions.md
      layout_manifest.json
    diagrams_and_systems/
      selected_assets.json
      contact_sheet.pdf

  09_exports/
    obsidian_vault/
    print_pdfs/
    indesign_packages/
    web_archive/
```

---

## 8. Data Model

### 8.1 Notebook Object

```json
{
  "notebook_id": "NB_2024_001",
  "title": "Notebook 2024 001",
  "physical_label": "Black A5 notebook",
  "date_range": {
    "start": "2024-01-01",
    "end": "2024-03-31"
  },
  "source_type": "physical_notebook",
  "scan_batch_ids": ["SCAN_BATCH_2026_001"],
  "notes": "Optional human description."
}
```

### 8.2 Page Object

```json
{
  "page_id": "NB_2024_001_P0001",
  "notebook_id": "NB_2024_001",
  "page_number": 1,
  "source_file": "01_source_scans/NB_2024_001/raw/NB_2024_001_P0001.tif",
  "source_hash": "sha256...",
  "dimensions_px": [4960, 7016],
  "orientation": "portrait",
  "scan_dpi": 600,
  "page_status": "processed",
  "contains": {
    "handwriting": true,
    "printed_text": false,
    "drawings": true,
    "collage": false,
    "colour": false
  },
  "regions": [
    "NB_2024_001_P0001_R001",
    "NB_2024_001_P0001_R002"
  ],
  "ocr_files": {
    "raw": "05_text/NB_2024_001/ocr_raw/NB_2024_001_P0001.ocr_raw.txt",
    "cleaned": "05_text/NB_2024_001/ocr_cleaned/NB_2024_001_P0001.ocr_cleaned.txt"
  }
}
```

### 8.3 Region Object

```json
{
  "region_id": "NB_2024_001_P0001_R001",
  "page_id": "NB_2024_001_P0001",
  "notebook_id": "NB_2024_001",
  "region_type": "sketch",
  "crop_box_px": [420, 820, 1810, 2210],
  "crop_box_normalised": [0.0847, 0.1169, 0.3649, 0.3151],
  "source_crop": "03_regions/NB_2024_001/NB_2024_001_P0001/NB_2024_001_P0001_R001.source_crop.png",
  "mask": "03_regions/NB_2024_001/NB_2024_001_P0001/NB_2024_001_P0001_R001.mask.png",
  "tags": {
    "medium": ["sketch"],
    "visual_mode": ["bw", "line_art"],
    "content": ["abstract_form"],
    "formal": ["dense", "organic", "high_contrast"],
    "processing_branch": ["line_art_extract", "vectorise"],
    "use": ["book_asset", "procedural_input"]
  },
  "computed_metrics": {
    "colourfulness": 0.02,
    "average_brightness": 0.74,
    "edge_density": 0.48,
    "ink_density": 0.16,
    "background_uniformity": 0.91,
    "aspect_ratio": 1.0
  },
  "confidence": {
    "medium:sketch": 0.94,
    "visual_mode:bw": 0.99,
    "content:abstract_form": 0.82
  },
  "review": {
    "status": "needs_review",
    "human_approved": false,
    "notes": ""
  }
}
```

### 8.4 Derivative Object

```json
{
  "derivative_id": "NB_2024_001_P0001_R001_D_VECTOR_HIFI",
  "source_region_id": "NB_2024_001_P0001_R001",
  "derivative_type": "vector_hifi",
  "file": "04_derivatives/NB_2024_001/NB_2024_001_P0001_R001/vector_hifi.svg",
  "created_by": "potrace",
  "pipeline_version": "vectorise_line_art_v0.3",
  "parameters": {
    "threshold_method": "sauvola",
    "despeckle": 4,
    "path_simplification": "low"
  },
  "quality_scores": {
    "fidelity": 0.89,
    "editability": 0.72,
    "book_usefulness": 0.81
  },
  "review_status": "unreviewed"
}
```

---

## 9. Controlled Tag System

The system must use a controlled tag registry.

### 9.1 Tag Namespaces

```yaml
medium:
  - handwriting
  - printed_text
  - sketch
  - painting
  - collage
  - diagram
  - photograph
  - swatch
  - mixed_media

visual_mode:
  - bw
  - greyscale
  - limited_colour
  - full_colour
  - line_art
  - tonal
  - texture

content:
  - face
  - body
  - creature
  - architecture
  - object
  - landscape
  - text_fragment
  - symbol
  - abstract_form
  - map
  - system
  - unknown

formal:
  - dense
  - sparse
  - geometric
  - organic
  - repetitive
  - chaotic
  - symmetrical
  - asymmetrical
  - high_contrast
  - low_contrast

processing_branch:
  - ocr
  - line_art_extract
  - background_remove
  - vectorise
  - colour_quantise
  - palette_extract
  - preserve_raster
  - segment_fragments
  - texture_extract
  - manual_review

use:
  - archive_only
  - book_asset
  - cover_candidate
  - divider_candidate
  - procedural_input
  - texture_source
  - reference
  - discard
```

### 9.2 Tag Registry Entry

```yaml
sketch:
  namespace: medium
  aliases:
    - drawing
    - doodle
    - line drawing
  allowed_for:
    - region
    - page
  description: Hand-drawn visual mark-making, usually line-based.
  can_be_ai_assigned: true
  requires_review: false

bw:
  namespace: visual_mode
  aliases:
    - black and white
    - monochrome
    - greyscale
  allowed_for:
    - region
    - page
    - derivative
  computed: true
  can_be_ai_assigned: false
  requires_review: false

book_asset:
  namespace: use
  allowed_for:
    - region
    - derivative
  can_be_ai_assigned: false
  requires_review: true
```

AI systems may suggest tags, but final storage must map suggestions back to the controlled registry.

---

## 10. Image Size and Model Load Strategy

Vision models should not receive full-resolution notebook scans except for coarse page overview tasks.

The system should generate an image pyramid for each page:

```text
full archival image     original scan, not normally passed to AI
large working image     2000–3000 px long edge
medium image            1024–1536 px long edge
thumbnail               256–512 px long edge
```

Recommended uses:

```text
thumbnail   page triage and fast preview
medium      broad layout and page-level classification
large       detailed crop generation and OCR
full        archival preservation and high-quality derivative generation
```

Classification should operate on bounded crops, not whole scans.

Standard model input sizes:

```text
page overview:        1024 px long edge
region classification: 768–1024 px long edge
maximum direct crop:  1536 px long edge
tile size:            1024 × 1024 px
tile overlap:         128–256 px
minimum crop:          32 × 32 px, unless manually flagged
```

For extreme aspect ratios, split or pad crops before model inference.

---

## 11. Processing Modules

## 11.1 Ingest Module

Purpose:

- find source files
- register scan batches
- assign notebook/page IDs
- calculate hashes
- detect duplicates
- record scanner/camera metadata

Inputs:

```text
folders of scanned notebook images or PDFs
```

Outputs:

```text
intake_manifest.json
notebook registry entries
page source objects
hash records
```

Rules:

- never modify source files
- assign IDs before processing
- all later outputs derive from these IDs
- preserve file path and hash

---

## 11.2 Page Normalisation Module

Purpose:

- crop page boundaries
- deskew page
- correct orientation
- remove scanner bed edges
- normalise exposure
- correct uneven lighting
- create working images

Tools:

- OpenCV
- scikit-image
- OCR orientation detection where useful

Outputs:

```text
cleaned page image
preview image
thumbnail image
page cleanup metadata
```

Processing steps:

```text
1. load original scan
2. detect page boundary
3. deskew
4. crop border
5. correct rotation
6. estimate background illumination
7. generate cleaned page copy
8. generate preview and thumbnail
9. record transformation matrix
```

The transformation matrix is important because source crop coordinates may need to be mapped between raw scan, cleaned page, and derivative crops.

---

## 11.3 Layout Detection Module

Purpose:

- detect page regions
- distinguish text, drawing, collage, diagram, and blank space
- generate candidate crop boxes

Possible providers:

- OpenCV deterministic detection
- Docling
- PaddleOCR layout tools
- Florence-2 grounding/detection
- SAM/SAM 2 assisted segmentation

Recommended approach:

```text
1. deterministic candidate detection
2. layout/document model pass
3. merge candidate boxes
4. split oversized boxes
5. classify candidate regions
6. send uncertain regions to review
```

Region types:

```text
handwriting
printed_text
sketch
tonal_drawing
painting
collage
diagram
photograph
swatch
blank
mixed
unknown
```

---

## 11.4 Region Extraction Module

Purpose:

- crop detected regions from cleaned page images
- preserve crop coordinates
- add padding
- generate masks where possible
- write region metadata

Rules:

- crop from the highest useful cleaned image, not the compressed preview
- retain original crop coordinates
- store both tight crop and padded crop where useful
- do not discard overlapping regions automatically

Outputs:

```text
source_crop.png
padded_crop.png
mask.png
region metadata JSON
```

---

## 11.5 OCR and Text Module

Purpose:

- transcribe handwritten and printed text
- preserve raw OCR
- clean OCR separately
- create Markdown page notes
- extract entities and concepts

Candidate OCR providers:

- Mistral OCR
- Google Document AI / Cloud Vision
- Azure AI Document Intelligence
- Amazon Textract
- PaddleOCR
- Tesseract baseline

The system should allow provider switching.

Outputs:

```text
raw OCR text
cleaned OCR text
OCR confidence map
page Markdown note
entity extraction JSON
semantic text tags
```

Text entities to extract:

```text
dates
people
places
projects
materials
technical terms
motifs
questions
tasks
book-relevant phrases
rare words
research topics
```

Markdown page output should include:

```markdown
---
page_id: NB_2024_001_P0001
notebook_id: NB_2024_001
source_scan: ../01_source_scans/NB_2024_001/raw/NB_2024_001_P0001.tif
tags:
  - notebook
  - handwriting
  - sketch
linked_regions:
  - NB_2024_001_P0001_R001
  - NB_2024_001_P0001_R002
---

# NB_2024_001 · Page 0001

## Transcription

...

## Extracted Regions

![[NB_2024_001_P0001_R001.source_crop.png]]

## Page Summary

...

## Entities and Concepts

...
```

---

## 11.6 Image Classification Module

Purpose:

- classify region crops using controlled labels
- assign semantic tags
- select processing branches
- identify book-relevant assets

Candidate classification tools:

- Florence-2
- CLIP/OpenCLIP
- SigLIP
- GPT-class vision APIs
- Gemini vision APIs
- Claude vision APIs
- local VLMs through Ollama/llama.cpp where suitable

Recommended architecture:

```text
OpenCV metrics first
CLIP/SigLIP similarity tagging second
Florence-2 crop caption/detection third
frontier API only for hard/ambiguous cases
```

Classification prompt should never ask for freeform tagging as the main output. It should request controlled fields:

```json
{
  "medium": "sketch | painting | collage | diagram | handwriting | photograph | mixed | unknown",
  "visual_mode": "bw | greyscale | limited_colour | full_colour",
  "content": ["face", "body", "architecture", "object", "abstract_form", "symbol", "text_fragment", "unknown"],
  "processing_branch": ["line_art_extract", "vectorise", "colour_quantise", "background_remove", "ocr", "manual_review"],
  "caption": "short factual caption",
  "confidence": {
    "medium": 0.0,
    "content": 0.0,
    "processing_branch": 0.0
  }
}
```

Confidence thresholds:

```text
>= 0.85    auto-apply
0.55–0.85  store as suggested tag and send to review
< 0.55     do not apply; mark uncertain
```

Rule-based overrides:

```text
if colourfulness < threshold:
  visual_mode = bw

if background_uniformity is high and edge_density is high:
  suggest line_art_extract

if crop contains high text probability:
  suggest OCR

if region size too small:
  mark low_priority unless manually flagged
```

---

## 11.7 Deterministic Visual Metrics Module

Purpose:

- calculate non-semantic image properties without AI
- reduce unnecessary model calls
- provide objective classification features

Metrics:

```text
average brightness
contrast
colourfulness
saturation distribution
hue histogram
edge density
ink density
blankness
connected component count
line thickness estimate
background uniformity
aspect ratio
texture complexity
dominant colours
palette count estimate
```

Use these metrics to classify:

```text
colour / bw
blank / non-blank
line-based / tonal
high contrast / low contrast
simple / complex
vectorisable / not vectorisable
```

---

## 11.8 Type-Specific Processing Router

Each region is routed based on its classification and computed metrics.

### 11.8.1 BW Line Drawing Branch

Inputs:

```text
sketch, diagram, symbol, line drawing, black ink fragment
```

Outputs:

```text
cleaned raster
transparent PNG
binary black-line PNG
mask
skeleton image
vector SVG high fidelity
vector SVG simplified
line metrics JSON
```

Processing:

```text
1. estimate paper/background colour
2. correct uneven lighting
3. adaptive threshold
4. remove small noise components
5. preserve faint line components where possible
6. create alpha mask
7. export black lines on transparent background
8. generate skeleton if useful
9. vectorise with Potrace/VTracer/Inkscape
10. score vectorisation quality
```

Primary tools:

- OpenCV
- scikit-image
- Potrace
- VTracer
- Inkscape CLI

### 11.8.2 Colour Drawing / Painting Branch

Inputs:

```text
colour sketch
painting
marker drawing
watercolour fragment
mixed colour visual region
```

Outputs:

```text
cleaned raster
transparent version if possible
palette JSON
palette swatch
quant_32.png
quant_16.png
quant_08.png
quant_04.png
flat-colour vector if suitable
```

Processing:

```text
1. crop and clean
2. preserve original colour version
3. optionally isolate subject from paper
4. extract dominant palette
5. quantise to multiple palette sizes
6. optionally vectorise colour regions
7. score print usefulness
```

### 11.8.3 Collage Branch

Inputs:

```text
pasted image
collage
mixed fragment
photograph + drawing combination
```

Outputs:

```text
cleaned crop
mask
fragment segmentation
edge map
palette
texture patches
preserved raster
optional cut-out layers
```

Processing:

```text
1. preserve high-quality raster
2. detect pasted edges where possible
3. segment obvious pieces
4. extract material/texture patches
5. classify image/text mix
6. generate book preview version
```

### 11.8.4 Diagram Branch

Inputs:

```text
system drawing
map
flow chart
annotated structure
graph
node-link drawing
technical diagram
```

Outputs:

```text
cleaned diagram image
transparent line version
OCR labels
shape/line extraction
vector SVG
structure metadata
```

Processing:

```text
1. extract labels with OCR
2. detect lines/arrows/nodes/boxes
3. vectorise structure
4. classify diagram type
5. link text labels to visual regions
```

### 11.8.5 Handwriting Branch

Inputs:

```text
handwritten text block
note fragment
caption
marginalia
```

Outputs:

```text
raw OCR
cleaned transcription
confidence map
semantic tags
Markdown block
```

Processing:

```text
1. crop text region
2. run OCR
3. preserve raw transcription
4. clean using language model
5. extract concepts/entities
6. link nearby image regions if relevant
```

### 11.8.6 Texture / Background Branch

Inputs:

```text
paper texture
paint texture
ink texture
stain
scanned artefact
material fragment
```

Outputs:

```text
texture tile
normalised texture crop
palette
seamless tile attempt
metadata
```

Use cases:

```text
book backgrounds
procedural image generation
texture libraries
visual divider material
```

---

## 12. Background Removal Strategy

Background removal must be branch-specific.

### 12.1 For BW Line Art

Do not use general AI background removal first.

Use:

```text
paper colour estimation
illumination correction
adaptive thresholding
morphological cleanup
connected component filtering
alpha mask generation
```

Output:

```text
black lines on transparent background
```

### 12.2 For Colour Drawings

Use hybrid methods:

```text
background colour estimation
edge-aware masking
SAM/SAM 2-assisted segmentation
manual mask correction if required
```

### 12.3 For Collage / Photographic Objects

AI background removal is more useful.

Possible tools:

```text
SAM 2
rembg
BRIA RMBG
InSPyReNet
manual mask refinement
```

### 12.4 Mask Preservation

Every background removal output should save:

```text
source crop
mask
transparent output
mask metadata
review status
```

The mask is as important as the transparent image because it allows later correction and reprocessing.

---

## 13. Vectorisation Strategy

Vectorisation should be treated as a derivative branch, not as replacement for the raster original.

Recommended vector outputs:

```text
vector_hifi.svg
vector_simplified.svg
vector_blob.svg
vector_outline.svg
vector_print.svg
```

Vectorisation providers:

```text
Potrace
VTracer
Inkscape CLI
Autotrace
Illustrator Image Trace, optional manual workflow
Distinct AI Vector FX, experimental creative derivative
```

Vector quality metrics:

```text
path count
node count
file size
closed path count
fidelity score
simplification score
editability score
print suitability
book usefulness
```

Rules:

- always retain raster source
- save vectorisation parameters
- do not vectorise all assets by default
- vectorise BW line art first
- vectorise colour art only if flat-colour structure is useful
- mark over-complex vectors for review

---

## 14. Colour Quantisation Strategy

Colour quantisation should support both archival analysis and book styling.

Quantisation modes:

```text
native_palette
kmeans_lab
median_cut
octree
custom_book_palette
restricted_palette
```

Default outputs:

```text
quant_32.png
quant_16.png
quant_08.png
quant_04.png
palette.json
palette_swatch.svg
```

Use cases:

```text
book consistency
colour studies
palette books
procedural inputs
flat-colour vector conversion
screenprint-style derivatives
```

Metadata:

```json
{
  "palette_method": "kmeans_lab",
  "palette_size": 8,
  "colours": [
    {"hex": "#111111", "proportion": 0.34},
    {"hex": "#f2e8d2", "proportion": 0.41}
  ],
  "source_region_id": "NB_2024_001_P0001_R003"
}
```

---

## 15. Optional Generative and Experimental Branches

These should be downstream of the archive, not part of the canonical extraction process.

Possible branches:

```text
Gaussian splat / point-cloud reinterpretation
ComfyUI image-to-image transformation
ControlNet-based redraw
Florence-2 caption-to-index workflow
Distinct AI Render FX / Vector FX
local Flux / Stable Diffusion workflows
upscaling
style transfer
animated loops
procedural field extraction
```

These should be stored as experimental derivatives:

```text
04_derivatives_experimental/
```

Rules:

- never replace source assets
- label as generative derivative
- preserve prompt/model/seed/settings
- separate creative outputs from archival outputs
- do not use generated images as evidence of original content

---

## 16. AI and API Provider Abstraction

The system must be model-agnostic.

Providers should be interchangeable by configuration.

```yaml
providers:
  ocr:
    local_default: tesseract
    local_alt: paddleocr
    cloud_primary: mistral_ocr
    cloud_alt:
      - google_document_ai
      - azure_document_intelligence
      - amazon_textract

  layout:
    local_default: docling
    deterministic: opencv
    ai_alt:
      - florence2
      - sam2

  classification:
    local_fast: openclip
    local_vlm: florence2
    cloud_high_accuracy:
      - openai_vision
      - gemini_vision
      - claude_vision

  segmentation:
    deterministic: opencv
    local_ai:
      - sam2
      - rembg

  vectorisation:
    deterministic:
      - potrace
      - vtracer
      - inkscape_cli
    creative:
      - distinct_ai_vector_fx

  text_reasoning:
    local:
      - ollama_llm
    cloud:
      - openai
      - anthropic
      - gemini
      - mistral
```

Each model output should record:

```text
provider
model name
model version
prompt version
input file
input dimensions
output JSON
confidence
cost estimate
processing time
```

---

## 17. Tool and API Roles

### OpenCV

Use for:

- crop detection
- deskew
- thresholding
- contour detection
- connected components
- colour metrics
- line extraction
- mask operations

### scikit-image

Use for:

- threshold algorithms
- morphology
- skeletonisation
- image metrics
- segmentation helpers

### Docling

Use for:

- structured page/document understanding
- text/image block detection
- reading order
- layout extraction
- Markdown-style conversion support

### OCR Engines

Use multiple engines for benchmarking, then select primary/fallback providers.

Candidate roles:

```text
Tesseract: baseline local OCR
PaddleOCR: stronger local OCR candidate
Mistral OCR: cloud structured OCR candidate
Google/Azure/Amazon: comparison and fallback
```

### Florence-2

Use for:

- crop captioning
- region classification
- broad detection
- visual grounding
- controlled classification assistance

### CLIP/OpenCLIP/SigLIP

Use for:

- fast bulk similarity search
- controlled label ranking
- embedding index
- finding visually similar assets

### SAM/SAM 2

Use for:

- promptable segmentation
- mask generation
- separating object-like drawings/collage fragments

### rembg / RMBG Tools

Use for:

- quick background removal for object-like image regions
- collage/photo fragment isolation

### Potrace / VTracer / Inkscape CLI

Use for:

- line-art vectorisation
- simplified SVG outputs
- print-ready vector derivatives

### LLM APIs

Use for:

- OCR cleanup
- entity extraction
- page summaries
- concept grouping
- book category proposals
- captions
- editorial/curatorial structuring

### Distinct AI / Local Creative Tools

Use for:

- experimental vector reinterpretation
- generated divider graphics
- book cover experiments
- creative derivatives

Do not treat these as archival truth.

---

## 18. Processing Configuration

Each pipeline run should be defined by a configuration file.

Example:

```yaml
project:
  archive_root: notebook_archive
  active_notebook: NB_2024_001

processing:
  preserve_originals: true
  generate_thumbnails: true
  generate_markdown: true
  write_embedded_metadata: false

page_cleanup:
  deskew: true
  crop_page_bounds: true
  illumination_correction: true

layout:
  provider: docling
  deterministic_prepass: true
  min_region_px: 32
  merge_overlap_threshold: 0.25

ocr:
  provider: mistral_ocr
  fallback_provider: paddleocr
  preserve_raw: true
  clean_with_llm: true

classification:
  provider_order:
    - deterministic_metrics
    - openclip
    - florence2
  cloud_fallback: false
  confidence_auto_apply: 0.85
  confidence_review_min: 0.55

line_art:
  enabled: true
  threshold_method: sauvola
  output_transparent_png: true
  vectorise: true
  vector_provider: potrace

colour:
  quantise: true
  palette_sizes: [32, 16, 8, 4]
  palette_space: lab

review:
  require_review_for_book_assets: true
  require_review_for_low_confidence: true

books:
  generate_contact_sheets: true
  generate_category_sets: true
```

---

## 19. Caching and Reprocessing

Every stage should be cache-aware.

Cache keys should include:

```text
source file hash
input file hash
pipeline stage
pipeline version
provider name
model version
prompt version
parameters hash
```

If the input and parameters have not changed, the stage should skip reprocessing.

This allows:

- re-running classification without repeating OCR
- re-running vectorisation after changing thresholds
- adding a new book category without touching images
- swapping OCR provider while preserving previous outputs
- comparing AI models on the same crops

---

## 20. Review Interface

A review UI is required for accuracy and publishing quality.

Minimum UI panels:

```text
left: original page with crop overlay
centre: selected crop and derivatives
right: tags, OCR, metadata, review actions
```

Required actions:

```text
accept crop
reject crop
split crop
merge crops
adjust crop bounds
correct tags
approve OCR
edit transcription
approve transparent mask
approve vector output
mark as book-worthy
mark as cover candidate
mark as discard
assign category
```

Review statuses:

```text
unreviewed
needs_review
approved
approved_for_book
rejected
manual_fix_required
archive_only
```

The review layer should write correction records rather than directly altering source metadata destructively.

Correction example:

```json
{
  "correction_id": "CORR_000134",
  "target_id": "NB_2024_001_P0001_R001",
  "field": "tags.medium",
  "old_value": ["diagram"],
  "new_value": ["sketch"],
  "reviewer": "human",
  "timestamp": "2026-05-22T10:00:00+10:00"
}
```

---

## 21. Search and Indexing

The archive should support several search modes.

### 21.1 Structured Search

Search by:

```text
notebook
page range
date range
medium
visual mode
content tag
processing branch
review status
book suitability
colour palette
OCR text
entity
concept
```

### 21.2 Visual Similarity Search

Use image embeddings for:

```text
find similar drawings
find repeated motifs
cluster visual forms
group similar diagrams
find recurring characters/symbols
```

Candidate tools:

```text
CLIP/OpenCLIP/SigLIP embeddings
FAISS or sqlite-vss/vector extension
local embedding cache
```

### 21.3 Text Search

Use:

```text
SQLite FTS
Markdown search
Obsidian search
local search index
```

Text should include:

```text
OCR raw
OCR cleaned
page summaries
captions
tags
entities
book notes
```

---

## 22. Book Generation System

The book-generation system should assemble book-source sets from the archive using rules.

### 22.1 Book Object

```json
{
  "book_id": "BOOK_BLACK_INK_ABSTRACT_FORMS",
  "title": "Black Ink Abstract Forms",
  "selection_rules": {
    "include": {
      "medium": ["sketch"],
      "visual_mode": ["bw", "line_art"],
      "content": ["abstract_form"],
      "review_status": ["approved", "approved_for_book"]
    },
    "exclude": {
      "use": ["discard"],
      "quality": ["too_blurry"]
    },
    "minimum_scores": {
      "book_usefulness": 0.7,
      "crop_quality": 0.65
    }
  },
  "outputs": {
    "contact_sheet": true,
    "captions": true,
    "source_manifest": true,
    "layout_manifest": true
  }
}
```

### 22.2 Book Categories

Possible category structures:

```text
medium-based books
  sketches
  paintings
  collages
  diagrams

visual-mode books
  black ink
  colour fragments
  sparse pages
  dense pages

motif-based books
  faces
  creatures
  architecture
  symbols
  abstract forms

conceptual books
  systems
  memory
  planning
  absurdity
  research
  structural thinking

chronological books
  notebook by notebook
  month by month
  year by year

hybrid books
  extracted images + OCR fragments
  diagrams + cleaned explanatory text
  page spreads + isolated assets
```

### 22.3 Book-Source Outputs

For each book:

```text
selected_assets.json
selected_assets.csv
contact_sheet.pdf
captions.md
source_pages_preview.pdf
layout_manifest.json
print_assets/
  transparent_png/
  svg/
  raster_cleaned/
  palettes/
```

### 22.4 Layout Metadata

Each asset should include layout-relevant values:

```text
preferred_orientation
aspect_ratio
transparent_background_available
vector_available
minimum_print_size
recommended_print_size
caption_available
source_page_context_available
colour_profile
palette
visual_density
```

This allows later automated layout experiments.

---

## 23. Obsidian / Markdown Export

The system should be able to export an Obsidian-compatible vault.

Vault structure:

```text
Notebook Archive/
  Notebooks/
    NB_2024_001.md
  Pages/
    NB_2024_001_P0001.md
  Regions/
    NB_2024_001_P0001_R001.md
  Assets/
    NB_2024_001_P0001_R001.transparent.png
  Books/
    Black Ink Abstract Forms.md
  Indexes/
    Tags.md
    Motifs.md
    People.md
    Concepts.md
```

Page note should include:

```markdown
# NB_2024_001 · Page 0001

![[NB_2024_001_P0001.cleaned.png]]

## Transcription

...

## Regions

![[NB_2024_001_P0001_R001.source_crop.png]]

## Tags

#notebook #sketch #bw #abstract_form

## Source

Notebook: [[NB_2024_001]]
Page: 0001
```

Region note should include:

```markdown
# NB_2024_001_P0001_R001

![[NB_2024_001_P0001_R001.source_crop.png]]

## Derivatives

![[NB_2024_001_P0001_R001.transparent.png]]

## Tags

medium:: sketch
visual_mode:: bw, line_art
content:: abstract_form
processing_branch:: line_art_extract, vectorise
review_status:: needs_review

## Source

Page: [[NB_2024_001_P0001]]
Coordinates: [420, 820, 1810, 2210]
```

---

## 24. Command-Line Interface

A command-line interface should be built before a full GUI.

Example commands:

```bash
notebook-pipeline ingest ./incoming_scans --notebook NB_2024_001
notebook-pipeline preprocess --notebook NB_2024_001
notebook-pipeline detect-layout --notebook NB_2024_001
notebook-pipeline extract-regions --notebook NB_2024_001
notebook-pipeline ocr --notebook NB_2024_001 --provider mistral
notebook-pipeline classify --notebook NB_2024_001 --provider florence2
notebook-pipeline derive --notebook NB_2024_001 --branch line_art
notebook-pipeline export-md --notebook NB_2024_001
notebook-pipeline build-book BOOK_BLACK_INK_ABSTRACT_FORMS
notebook-pipeline contact-sheet BOOK_BLACK_INK_ABSTRACT_FORMS
notebook-pipeline review-server
```

---

## 25. Pipeline Scripts

Recommended script/module breakdown:

```text
01_ingest.py
  register source files, assign IDs, hash files

02_preprocess_pages.py
  crop, deskew, normalise, generate previews

03_detect_layout.py
  detect text/image/drawing/blank regions

04_extract_regions.py
  crop regions and record coordinates

05_ocr_pages.py
  OCR full pages and text regions

06_classify_regions.py
  deterministic metrics and AI classification

07_process_line_art.py
  threshold, clean, transparent PNG, skeleton, vectorise

08_process_colour_assets.py
  palette extraction, quantisation, optional vectorisation

09_process_collage_assets.py
  segmentation, texture extraction, preserved raster outputs

10_write_metadata.py
  write JSON, JSONL, SQLite, CSV indexes

11_export_markdown.py
  generate Obsidian-compatible notes

12_review_server.py
  local review/correction UI

13_build_books.py
  rule-based category selection and export

14_generate_contact_sheets.py
  PDF/contact sheet generation
```

---

## 26. Quality Control

### 26.1 OCR Quality

Measure:

```text
word accuracy on manually transcribed sample
line order preservation
heading detection
diagram label detection
false text from drawings
```

### 26.2 Crop Quality

Measure:

```text
missed drawings
false positive crops
over-cropping
under-cropping
adjacent region merging errors
fragmentation errors
```

### 26.3 Background Removal Quality

Measure:

```text
line preservation
paper removal
noise removal
faint line retention
edge quality
mask editability
```

### 26.4 Vectorisation Quality

Measure:

```text
path count
visual fidelity
file size
smoothness
editability
print suitability
```

### 26.5 Classification Quality

Measure:

```text
medium accuracy
visual mode accuracy
content tag accuracy
processing branch accuracy
confidence calibration
false invented concepts
```

### 26.6 Book Suitability

Measure:

```text
standalone usefulness
print clarity
crop quality
visual interest
category fit
caption/source availability
```

---

## 27. Benchmarking Plan

Create a benchmark set before building the full pipeline.

Minimum benchmark set:

```text
50 pages total
10 clean handwriting pages
10 messy handwriting pages
10 mixed drawing + text pages
10 diagram pages
10 dense/crossed-out/collage pages
```

For each page, create manual ground truth:

```text
page bounds
region boxes
region types
OCR sample transcription
important tags
book-worthy assets
```

Run comparisons:

```text
OCR providers
layout detectors
classification models
background removal methods
vectorisation methods
quantisation methods
```

Benchmark result should decide default providers.

---

## 28. Development Phases

### Phase 1: Local Archive Core

Build:

- ingest
- ID system
- folder structure
- page cleanup
- preview generation
- basic metadata
- SQLite/JSONL index

Do not focus on AI yet.

### Phase 2: OCR and Markdown Export

Build:

- OCR provider abstraction
- raw OCR storage
- cleaned OCR storage
- Markdown page notes
- Obsidian export

### Phase 3: Region Detection and Extraction

Build:

- deterministic crop detection
- layout detection
- crop extraction
- coordinates
- region metadata

### Phase 4: Classification

Build:

- deterministic metrics
- controlled tag registry
- CLIP/SigLIP ranking
- Florence-2 classification
- confidence thresholds
- review queue

### Phase 5: Drawing Processing

Build:

- BW line extraction
- transparent PNG export
- vectorisation
- skeletonisation
- line-art scoring

### Phase 6: Colour and Collage Processing

Build:

- palette extraction
- colour quantisation
- background masks
- collage preservation
- texture extraction

### Phase 7: Review UI

Build:

- crop correction
- tag correction
- OCR correction
- derivative approval
- book-worthiness marking

### Phase 8: Book-Source Assembly

Build:

- category rule system
- contact sheets
- selected asset manifests
- caption export
- layout manifests

### Phase 9: Generative/Experimental Derivatives

Build:

- ComfyUI workflows
- Distinct AI creative vector/render branch
- Gaussian splat/point cloud experiments
- procedural export formats

---

## 29. Minimum Viable Version

The MVP should do only the following:

```text
1. ingest a folder of page scans
2. assign notebook/page IDs
3. preserve originals
4. create cleaned page images and thumbnails
5. run OCR on each page
6. detect obvious visual regions
7. crop detected visual regions
8. compute colour/BW and simple visual metrics
9. apply controlled tags
10. save JSON metadata
11. generate Markdown page notes
12. generate a CSV/SQLite index
13. produce a contact sheet of extracted regions
```

MVP outputs:

```text
source archive
processed page images
OCR text
Markdown notes
cropped regions
basic tags
contact sheets
searchable index
```

Do not include full vectorisation, Gaussian splats, advanced AI classification, or full book generation in the first version.

---

## 30. Recommended First Build Stack

```text
Python
OpenCV
scikit-image
Pillow
Docling
Tesseract or PaddleOCR as local OCR baseline
Florence-2 for crop-level vision testing
OpenCLIP or SigLIP for similarity/tag ranking
Potrace or VTracer for early vector tests
SQLite
Markdown export
ExifTool optional
FastAPI or Flask for review UI later
```

Cloud/API comparison stack:

```text
Mistral OCR
Google Document AI
Azure AI Document Intelligence
Amazon Textract
OpenAI/Gemini/Claude vision APIs
```

Creative/generative later stack:

```text
ComfyUI
SAM/SAM 2 nodes
Florence-2 nodes
ControlNet/IP-Adapter workflows
Distinct AI Render FX / Vector FX
Stable Diffusion / Flux local workflows
```

---

## 31. Failure Modes and Safeguards

### Failure: AI misclassifies drawings as text

Safeguard:

- use deterministic visual metrics
- compare OCR confidence
- classify uncertain regions as mixed/manual_review

### Failure: OCR hallucinates text from sketches

Safeguard:

- run OCR only on text-likely regions
- preserve raw OCR separately
- mark low-confidence text

### Failure: background removal destroys faint lines

Safeguard:

- use threshold-based line extraction first
- preserve raw crop
- save mask
- require review for low-confidence masks

### Failure: vectorisation creates unusable SVGs

Safeguard:

- score path count and file size
- generate simplified and high-fidelity versions
- mark over-complex vectors for review

### Failure: category books become incoherent

Safeguard:

- use rule-based selection as first pass
- require manual approval for book inclusion
- generate contact sheets before layout

### Failure: tags become uncontrolled

Safeguard:

- enforce tag registry
- map aliases to controlled tags
- keep AI captions separate from tags

### Failure: reprocessing breaks links

Safeguard:

- use stable IDs
- preserve source hashes
- do not rename canonical objects after creation
- store derivative versions separately

---

## 32. Privacy and Local-First Considerations

Because notebooks may contain private material, the system should default to local processing where practical.

Local-first stages:

```text
file ingestion
page cleanup
crop detection
visual metrics
line-art extraction
vectorisation
basic OCR baseline
SQLite indexing
Markdown export
```

Cloud-optional stages:

```text
high-quality handwriting OCR
complex page understanding
ambiguous image classification
semantic summarisation
book structure synthesis
```

Every cloud API call should log:

```text
input file
redacted or full content flag
provider
model
timestamp
cost
output
```

Optional privacy mode:

```text
no cloud APIs
no uploaded notebook pages
local OCR only
local classification only
manual review required
```

---

## 33. Provenance Rules

Every output must answer:

```text
What original notebook did this come from?
What page did this come from?
Where on the page was it?
What process created it?
What model/tool created it?
What parameters were used?
Was it reviewed?
Is it archival, processed, or generative?
```

This is the main difference between a reliable archive and an untraceable AI asset dump.

---

## 34. Final System Definition

This system is a local-first, AI-assisted notebook decomposition and publishing pipeline.

It converts scanned notebooks into:

- structured page records
- searchable OCR text
- extracted visual regions
- classified and tagged assets
- transparent drawings
- vector graphics
- colour-quantised variants
- palettes and masks
- metadata-rich indexes
- curated book-source collections

The archive remains stable because originals, coordinates, metadata, and review decisions are preserved. AI models are used as replaceable workers, not as the foundation of the system.

The final output is not merely a digital notebook. It is a structured archive that can generate multiple future books, visual systems, procedural assets, research collections, and curated bodies of work from the same physical source material.



---

## Related ideas

- [Web-to-Knowledge Pipeline](../../thoughts/web-to-knowledge-pipeline.md)
- [Linux Screen-to-Markdown Capture](linux-screen-to-markdown-capture.md)
- [Design Knowledge Corpus Extraction](../../create-rules-for-ai/design-knowledge-corpus-extraction-system.md)
- [Design-Rule Corpus Plan](../../create-rules-for-ai/plan.md)
- [Design-Rule Audit](../../create-rules-for-ai/audit.md)
- [Generative Note Library](../generative-note-library.md)
- [Notes to Prose](../../thoughts/notes-to-prose.md)
- [Rare-Word Poem Generator](../rare-word-poem-generator.md)
- [Note Capture Pipeline](note-capture-pipeline.md)
- [Voice-to-Note](voice-to-note.md)
