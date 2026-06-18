# F2 — Notes-processing tool suite

**Status**: WIP
**Priority**: P2
**Owner file(s)**: `assets/js/tools/utilities/notes-tool.js` (to author), ingest pipeline (to author), `blog/docs/site/notes-tool-scope.md` (to author)
**Blockers**: → A3
**Blocks**: —
**Last touched**: 2026-06-18

## Goal

Ingest user's notes corpus; expose search, summarisation, tagging, linking.

## Done when

All four sub-items (F2.a–F2.d) DONE.

## Sub-tasks

### F2.a — Scope doc
- [x] Enumerate input formats: `.md`, `.txt`, `.pdf`, image scans (OCR yes/no?), other.
- [x] Enumerate source locations: filesystem path(s), Notion export, Apple Notes export, etc.
- [x] Enumerate target operations with IN/OUT contract per op:
- [x] Decide LLM dependency (yes/no; provider; cost ceiling).
- [x] Write `blog/docs/site/notes-tool-scope.md`.

### F2.b — Ingest pipeline
- [ ] Parser per format.
- [ ] Chunker (decide chunk size + overlap).
- [ ] Embedder (decide model; cost + latency).
- [ ] Writer to A3 (`notes`, `note_chunks`, `note_embeddings`).
- [ ] Writer to A4 for binary attachments.
- [ ] CLI / one-shot script to ingest a folder.
- [ ] Idempotency: same input → same row (sha256-keyed).

### F2.c — Search index
- [ ] Decide index: pgvector (A3) / Tigris / FAISS / Vespa.
- [ ] Hybrid lexical + vector query.
- [ ] Verify p95 query latency < 500ms on N=10k notes.

### F2.d — UI
- [x] Tool registered at `#tools/utilities/notes`.
- [x] Sidebar tabs (≤4): SEARCH / LIBRARY / INFO (or equivalent).
- [ ] List view (paginated).
- [ ] Detail view (per note).
- [ ] Search input + results.
- [ ] Tag editor.
- [ ] Link editor (cross-note refs).
- [ ] Passes `page-compliance-audit`.

## Notes / decisions

(append-only)

## References

- A3 (storage schema)
- A4 (attachment storage)
