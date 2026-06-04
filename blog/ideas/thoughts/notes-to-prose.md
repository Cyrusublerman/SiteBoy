# Notes to Prose
**Status:** BRAINSTORM | **Cluster:** personal-notes


Early brainstorming for processing a notes library into generative writing output.

See also: `tools/generative-note-library.md` (formal design doc for the full system).

---

## Problem

Notes exist in heterogeneous forms — full ideas, lyric fragments, isolated phrases, word clusters, concept outlines. They may already be grouped into paragraphs, structured as lists, or scattered. How to process and recompose them into prose or song?

## Questions to resolve

- How to process large text volumes and classify by meaning, sentiment, syllable count, and meter?
- How to maintain a thesaurus of *ideas* (not just words) — a semantic neighbourhood structure?
- How to score a generated passage for rhyme-scheme compliance?
- How to score for semantic similarity to a target theme?
- How to score for word rarity?
- How to score for average word length?
- **Homophones:** should they carry elevated value in scoring? Especially where a phrase carries two simultaneous meanings (semantic doubling).
- How to quantify the number of valid inferences a phrase supports?


---

## Related ideas

- [Generative Note Library](../tools/generative-note-library.md)
- [Rare-Word Poem Generator](../tools/rare-word-poem-generator.md)
- [Note Capture Pipeline](../tools/external/note-capture-pipeline.md)
- [Voice-to-Note](../tools/external/voice-to-note.md)
- [Notebook Decomposition & Publishing](../tools/external/notebook_decomposition_publishing_system_design_doc.md)
