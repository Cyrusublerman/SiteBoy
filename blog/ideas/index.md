# Ideas Index

Single-source dashboard for all idea files in `blog/ideas/`.

**Status vocabulary:** `STUB` | `BRAINSTORM` | `DESIGN` | `SPEC` | `ARCHIVED`
- `STUB` — placeholder only. `BRAINSTORM` — rough notes, open questions. `DESIGN` — structured design, decisions made. `SPEC` — full spec with acceptance criteria. `ARCHIVED` — legacy, feeder, or misplaced.

**Canonical rule:** When the same concept exists under `art/generative/` and `tools/`, `art/generative/` is canonical. Files in `tools/` or `art/generative/initial/` that duplicate a canonical entry are marked `ARCHIVED` with a pointer.

**Clusters:** `knowledge-ingest` | `personal-notes` | `halftone-stipple` | `audio-waves` | `plotter-paths` | `generative-pattern`

---

## Art / Generative

Canonical home for generative art ideas.

| Title | Path | Status | Clusters |
|---|---|---|---|
| Glyph Rig Deformation | [art/generative/glyph-rig-deformation.md](art/generative/glyph-rig-deformation.md) | DESIGN | plotter-paths |
| Pen Plotter | [art/generative/pen-plotter.md](art/generative/pen-plotter.md) | STUB | plotter-paths |
| Sonification of Climate Change | [art/generative/sonification-climate-change.md](art/generative/sonification-climate-change.md) | BRAINSTORM | audio-waves |
| Stipple — Single-Line Path System | [art/generative/stipple-single-line-path.md](art/generative/stipple-single-line-path.md) | DESIGN | halftone-stipple, plotter-paths |
| Canvas Performance Learnings | [art/generative/canvas-performance-learnings.md](art/generative/canvas-performance-learnings.md) | DESIGN | — |
| Requirements Prompt Template | [art/generative/templates/requirements-prompt.md](art/generative/templates/requirements-prompt.md) | ARCHIVED | — |

**Feeders (superseded by 6-packs in `tools/`):**

| Title | Feeder path | Canonical 6-pack |
|---|---|---|
| Generative Pattern Algorithm (initial) | art/generative/initial/generative-pattern-initial.md | [tools/generative-pattern-algorithm/](tools/generative-pattern-algorithm/00-overview.md) |
| Interference Figure Generator (initial) | art/generative/initial/interference-figure-generator-initial.md | [tools/interference-figure-generator/](tools/interference-figure-generator/00-overview.md) |
| Moiré Generator (initial) | art/generative/initial/moire-initial.md | [tools/moire-generator/](tools/moire-generator/00-overview.md) |
| Ribbon Breeze (initial) | art/generative/initial/ribbon-breeze-initial.md | [tools/ribbon-breeze/](tools/ribbon-breeze/00-overview.md) |
| Unified Pattern Generator (initial) | art/generative/initial/unified-pattern-initial.md | [tools/unified-pattern-generator/](tools/unified-pattern-generator/00-overview.md) |
| Tile Mosaic Full Spec | art/generative/tile-mosaic/tile-mosaic-full-spec.md | [tools/tile-mosaic-system/](tools/tile-mosaic-system/00-overview.md) |
| Tile Mosaic Page Design | art/generative/tile-mosaic/tile-mosaic-page-design.md | [tools/tile-mosaic-system/](tools/tile-mosaic-system/00-overview.md) |

---

## Tools / SiteBoy

Full 6-pack specs (`00-overview` … `05-implementation-guide`) for SiteBoy generative tools.

| Title | Path | Status | Clusters |
|---|---|---|---|
| ASCII Art Generator | [tools/ascii-art-generator/](tools/ascii-art-generator/00-overview.md) | SPEC | halftone-stipple |
| Complex Line Shading | [tools/complex-line-shading/](tools/complex-line-shading/00-overview.md) | SPEC | halftone-stipple, plotter-paths |
| Generative Pattern Algorithm | [tools/generative-pattern-algorithm/](tools/generative-pattern-algorithm/00-overview.md) | SPEC | generative-pattern |
| Interference Figure Generator | [tools/interference-figure-generator/](tools/interference-figure-generator/00-overview.md) | SPEC | generative-pattern |
| Moiré Generator | [tools/moire-generator/](tools/moire-generator/00-overview.md) | SPEC | generative-pattern |
| Ribbon Breeze | [tools/ribbon-breeze/](tools/ribbon-breeze/00-overview.md) | SPEC | generative-pattern |
| Smart Halftone System | [tools/smart-halftone-system/](tools/smart-halftone-system/00-overview.md) | SPEC | halftone-stipple |
| Tile Mosaic System | [tools/tile-mosaic-system/](tools/tile-mosaic-system/00-overview.md) | SPEC | generative-pattern |
| Topographic Dot Halftone | [tools/topographic-dot-halftone/](tools/topographic-dot-halftone/00-overview.md) | SPEC | halftone-stipple |
| Unified Pattern Generator | [tools/unified-pattern-generator/](tools/unified-pattern-generator/00-overview.md) | SPEC | generative-pattern |
| Wave Equation Synth | [tools/wave-equation-synth/](tools/wave-equation-synth/00-overview.md) | SPEC | audio-waves |
| Wallpaper Groups | [tools/wallpaper-generator/wallpaper-groups-procedural-generation.md](tools/wallpaper-generator/wallpaper-groups-procedural-generation.md) | DESIGN | generative-pattern |
| Stipple Node Spec | [tools/image-editor/Nodes.md](tools/image-editor/Nodes.md) | DESIGN | halftone-stipple |
| Cloth Shrink Halftone | [tools/cloth-shrink-halftone/](tools/cloth-shrink-halftone/) | ARCHIVED | halftone-stipple |

**Legacy single-file feeders (superseded by 6-packs above):**

| Title | Feeder path | Canonical 6-pack |
|---|---|---|
| Advanced ASCII Art (legacy) | [tools/ascii-art-legacy.md](tools/ascii-art-legacy.md) | [tools/ascii-art-generator/](tools/ascii-art-generator/00-overview.md) |
| Smart Halftone Engine (legacy) | [tools/smart-halftone-legacy.md](tools/smart-halftone-legacy.md) | [tools/smart-halftone-system/](tools/smart-halftone-system/00-overview.md) |
| Complex Line Shading (brainstorm) | [tools/complex-line-shading-brainstorm.md](tools/complex-line-shading-brainstorm.md) | [tools/complex-line-shading/](tools/complex-line-shading/00-overview.md) |
| Topographic Dot Halftone (legacy) | [tools/topographic-halftone-legacy.md](tools/topographic-halftone-legacy.md) | [tools/topographic-dot-halftone/](tools/topographic-dot-halftone/00-overview.md) |
| Wave Equation Synth (legacy) | [tools/wave-synth-legacy.md](tools/wave-synth-legacy.md) | [tools/wave-equation-synth/](tools/wave-equation-synth/00-overview.md) |

---

## Tools / External

Tools intended to run outside the SiteBoy browser context.

| Title | Path | Status | Clusters |
|---|---|---|---|
| Linux Screen-to-Markdown Capture | [tools/external/linux-screen-to-markdown-capture.md](tools/external/linux-screen-to-markdown-capture.md) | DESIGN | knowledge-ingest |
| Note Capture Pipeline (phone) | [tools/external/note-capture-pipeline.md](tools/external/note-capture-pipeline.md) | DESIGN | personal-notes |
| Voice-to-Note | [tools/external/voice-to-note.md](tools/external/voice-to-note.md) | BRAINSTORM | personal-notes |
| Notebook Decomposition & Publishing | [tools/external/notebook_decomposition_publishing_system_design_doc.md](tools/external/notebook_decomposition_publishing_system_design_doc.md) | SPEC | personal-notes, knowledge-ingest |
| Date Standardisation (RMIT Excel) | [thoughts/Date_Standardization_Design_Doc.md](thoughts/Date_Standardization_Design_Doc.md) | ARCHIVED | — |

---

## Tools / Fabrication

Blender/G-code physical fabrication tooling.

| Title | Path | Status |
|---|---|---|
| Blender G-code Workflow (pointer) | [tools/blender-gcode-geometry-nodes-workflow.md](tools/blender-gcode-geometry-nodes-workflow.md) | ARCHIVED |
| Blender G-code Workflow (full) | [tools/blender-gcode-workflow/](tools/blender-gcode-workflow/00-overview.md) | DESIGN |
| MFP Blender Remake | [tools/blender-gcode-workflow/mfp-blender-remake/](tools/blender-gcode-workflow/mfp-blender-remake/00-overview.md) | DESIGN |

---

## Tools / Generative Text & Vision

One-off complex tool specs.

| Title | Path | Status | Clusters |
|---|---|---|---|
| Generative Note Library | [tools/generative-note-library.md](tools/generative-note-library.md) | SPEC | personal-notes |
| Rare-Word Poem Generator | [tools/rare-word-poem-generator.md](tools/rare-word-poem-generator.md) | DESIGN | personal-notes |
| Fragment Collage Reconstruction | [tools/fragment-collage-reconstruction.md](tools/fragment-collage-reconstruction.md) | DESIGN | — |

---

## Knowledge & Capture

Ideas about building, extracting, and structuring knowledge corpora.

| Title | Path | Status | Clusters |
|---|---|---|---|
| Design Knowledge Corpus Extraction | [create-rules-for-ai/design-knowledge-corpus-extraction-system.md](create-rules-for-ai/design-knowledge-corpus-extraction-system.md) | SPEC | knowledge-ingest |
| Design-Rule Corpus Plan | [create-rules-for-ai/plan.md](create-rules-for-ai/plan.md) | DESIGN | knowledge-ingest |
| Design-Rule Audit | [create-rules-for-ai/audit.md](create-rules-for-ai/audit.md) | DESIGN | knowledge-ingest |
| Scrape Source URLs | [create-rules-for-ai/source-urls.md](create-rules-for-ai/source-urls.md) | DESIGN | knowledge-ingest |
| Web-to-Knowledge Pipeline | [thoughts/web-to-knowledge-pipeline.md](thoughts/web-to-knowledge-pipeline.md) | DESIGN | knowledge-ingest |

---

## Thoughts

Brainstorming fragments, philosophy, personal projects.

| Title | Path | Status | Clusters |
|---|---|---|---|
| Notes to Prose | [thoughts/notes-to-prose.md](thoughts/notes-to-prose.md) | BRAINSTORM | personal-notes |
| Why Is How's Baggage | [thoughts/why-vs-how.md](thoughts/why-vs-how.md) | BRAINSTORM | — |
| Heater Design | [thoughts/heater-design.md](thoughts/heater-design.md) | BRAINSTORM | — |
| Garden Mapping | [thoughts/garden-mapping.md](thoughts/garden-mapping.md) | STUB | — |
| Calendar Possibilities | [thoughts/calendar-possibilities.md](thoughts/calendar-possibilities.md) | BRAINSTORM | — |
| Agentic AI Decision Reconstruction (scraped essay) | [thoughts/agentic-ai-decision-reconstruction.md](thoughts/agentic-ai-decision-reconstruction.md) | ARCHIVED | — |

---

## Clusters (cross-reference map)

| Cluster | Members |
|---|---|
| `knowledge-ingest` | linux-screen-to-markdown-capture, design-knowledge-corpus-extraction-system, plan.md, audit.md, notebook_decomposition, web-to-knowledge-pipeline |
| `personal-notes` | generative-note-library, notes-to-prose, rare-word-poem-generator, note-capture-pipeline, voice-to-note, notebook_decomposition |
| `halftone-stipple` | smart-halftone-system/, topographic-dot-halftone/, ascii-art-generator/, stipple-single-line-path, complex-line-shading/, image-editor/Nodes, cloth-shrink-halftone/ |
| `audio-waves` | wave-equation-synth/, sonification-climate-change |
| `plotter-paths` | pen-plotter, complex-line-shading/, stipple-single-line-path, glyph-rig-deformation |
| `generative-pattern` | generative-pattern-algorithm/, interference-figure-generator/, moire-generator/, unified-pattern-generator/, ribbon-breeze/, tile-mosaic-system/, wallpaper-generator/ |
