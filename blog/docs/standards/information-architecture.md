<!-- generated: do not edit -->

# Information Architecture

17 rules in this category.

## information-architecture-825228BD

**MUST:** Retain page coordinates for every crop.

*Spatial linkage to source pages is required for provenance and re-extraction.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## information-architecture-54C9E564

**MUST:** Preserve provenance at every pipeline stage.

*Traceability from physical notebooks to all derived digital outputs is the core archival requirement.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## information-architecture-9017C037

**MUST:** Link every output to notebook, page, coordinates, pipeline version, and review status.

*Downstream assets remain auditable only when full lineage metadata is retained.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## information-architecture-2C0715AC

**MUST:** Treat the physical notebook as the canonical source for all digital outputs.

*Derived artefacts must never supersede or replace the original scanned notebook.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## information-architecture-68D6EE1F

**MUST_NOT:** Never flatten page roles into a single output type.

*Pages simultaneously hold text, drawings, metadata, and publishing assets that require separate representations.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## information-architecture-A1B2E015

**MUST:** Preserve source file path and hash at ingest.

*Path and hash records enable deduplication and provenance verification.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## information-architecture-1B086081

**MUST:** Preserve prompt, model, seed, and settings for generative derivatives.

*Generative provenance requires full reproduction metadata.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## information-architecture-888CFCF9

**MUST:** Preserve source hashes across reprocessing.

*Hashes verify that derived outputs trace to unchanged source files.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## information-architecture-FE3FA353

**MUST:** Ensure every output answers notebook, page, location, process, model, parameters, review, and archival type questions.

*Complete provenance metadata distinguishes a reliable archive from an untraceable asset dump.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## information-architecture-A9818E67

**MUST:** Use an LLM to determine note type, categorise entries, and store them.

*Automated classification routes notes to the correct storage without manual filing.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/voice-to-note.md

---

## information-architecture-B431AF65

**MUST:** Transcribe audio, infer note category, and route to the correct storage location.

*Category inference enables automatic filing without user intervention at capture time.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/voice-to-note.md

---

## information-architecture-49168620

**MUST:** Connect to an Obsidian vault or other known storage locations.

*Integration with existing vaults avoids siloed notes outside the user's workflow.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/voice-to-note.md

---

## information-architecture-21A2D356

**MUST_NOT:** Do not auto-create excessive suggested backlinks.

*Large backlink sets reduce signal and clutter review workflows.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## information-architecture-836C695A

**SHOULD:** Record provider, model, version, prompt, input, output, confidence, cost, and time for each model output.

*Full model-output metadata supports audit, cost tracking, and reprocessing.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## information-architecture-636E2644

**SHOULD:** Log input file, provider, model, timestamp, cost, and output for every cloud API call.

*Cloud call logs support privacy audit, cost control, and reproducibility.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## information-architecture-982DED71

**SHOULD:** Route tagged captures to a specific library area or pipeline.

*Explicit routing places notes in the correct downstream workflow immediately.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/note-capture-pipeline.md

---

## information-architecture-E42B2B69

**SHOULD:** Suggest wikilinks only when backlink confidence is sufficient.

*Prevents noisy or incorrect automatic linking in the knowledge base.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---
