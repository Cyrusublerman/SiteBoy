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
- [x] DONE — `blog/docs/site/notes-tool-scope.md` committed.

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

### F2.d — UI (skeleton WIP)
- [x] Tool registered at `#tools/utilities/notes`.
- [x] Sidebar tabs (≤4): SEARCH / LIBRARY / INFO (or equivalent).
- [x] Skeleton mounted via `ToolBase` with stub search handler.
- [ ] List view (paginated).
- [ ] Detail view (per note).
- [ ] Search input + results.
- [ ] Tag editor.
- [ ] Link editor (cross-note refs).
- [ ] Passes `page-compliance-audit`.

## Notes / decisions

- 2026-06-18: F2.a DONE (scope doc). F2.d skeleton WIP — tool mounts at `#tools/utilities/notes` with SEARCH/LIBRARY/INFO tabs; ingest (F2.b) and index (F2.c) pending A3.

## References

- A3 (storage schema)
- A4 (attachment storage)
