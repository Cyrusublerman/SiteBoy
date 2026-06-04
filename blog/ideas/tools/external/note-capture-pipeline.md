# Note Capture Pipeline
**Status:** DESIGN | **Cluster:** personal-notes


The phone/external capture side of the Generative Note Library System. See `tools/generative-note-library.md` for the full system design.

---

## Screenshot → categorised note

Crop screenshot to region or highlight text. Save as image or extracted text. Apply classification tags. Route to a specific area/pipeline in the library.

**Key requirement:** Minimum friction — tap-and-tag, not a full editing flow.

---

## Hand-drawn diagram → vector or Python graph

Photograph a hand-drawn diagram or flowchart. System should:
- Detect shapes, lines, arrows, and labels.
- Classify diagram type.
- Reconstruct following style guides.
- Allow access to pre-made vectors or graphics for matching.
- Support attached notes and extra instructions.

**Output:** Vector diagram, structured graph spec, or Python plotting code.

---

## Doodle → clean raster/vector asset

Photograph a drawing.

**Processing pipeline:**
1. Colour path: quantise, equalise, or apply pre-made processing preset.
2. B&W path: threshold, or apply same preprocessing options.
3. Remove noise (specks, dust).
4. Auto-crop around image subject.
5. Optional: centre on visual weight (full-blur + transform so darkest average area is in centre).
6. Add tags and save to visual asset library.

---

## Written or spoken note

**Text input requirements:**
- Formatting inference — titles, bullets, numbered lists from natural structure.
- "Expand later" flag for underspecified ideas.
- "Research further" flag for items requiring investigation.
- Reference attachment (crude first pass, refine later).
- Describe-a-graph mode — textual description that generates a graph stub.

---

## Phone integration questions

- How to make capture accessible from Android without opening the app?
- How to overlay the capture UI on top of the camera?
- How to trigger from lock screen?
- Should there be a separate camera function, or a screenshot layer over the existing camera?
- How to surface existing notes for quick appending?


---

## Related ideas

- [Generative Note Library](../generative-note-library.md)
- [Notes to Prose](../../thoughts/notes-to-prose.md)
- [Rare-Word Poem Generator](../rare-word-poem-generator.md)
- [Voice-to-Note](voice-to-note.md)
- [Notebook Decomposition & Publishing](notebook_decomposition_publishing_system_design_doc.md)
