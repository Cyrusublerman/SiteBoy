# Voice-to-Note (Smart)
**Status:** BRAINSTORM | **Cluster:** personal-notes


Trigger a voice capture from a headphone shortcut or phone button. Use an LLM to determine the note type, categorise, and store.

---

## Core behaviour

1. Press shortcut (headphone button or phone hardware button).
2. Record audio.
3. LLM processes audio: transcribes, infers note category (idea, task, lyric fragment, research prompt, etc.), and routes to the correct storage location.
4. Stored and linked to the Generative Note Library (see `tools/generative-note-library.md`).

---

## Capabilities

- Connect to Obsidian vault or known storage locations.
- Append to existing notes by voice command.
- Read back notes on request.
- Standard LLM actions: analysis, search across notes.

---

## Open questions

- Which LLM/ASR service? (GPT-4o, Whisper + GPT, local model.)
- How is note ambiguity handled — auto-classify or prompt for confirmation?
- What is the fallback when category inference fails?
- How is sensitive content handled (local vs cloud processing)?


---

## Related ideas

- [Generative Note Library](../generative-note-library.md)
- [Notes to Prose](../../thoughts/notes-to-prose.md)
- [Rare-Word Poem Generator](../rare-word-poem-generator.md)
- [Note Capture Pipeline](note-capture-pipeline.md)
- [Notebook Decomposition & Publishing](notebook_decomposition_publishing_system_design_doc.md)
