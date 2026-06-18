# Notes tool — scope (F2.a)

## Input formats

| Format | Parse | OCR | Notes |
| --- | --- | --- | --- |
| `.md` | yes | n/a | Primary; front-matter optional |
| `.txt` | yes | n/a | Plain text |
| `.pdf` | planned | no (v1) | Text extract only; scans deferred |
| image scans | deferred | TBD | Out of F2 skeleton |

## Source locations (ingest)

- Local folder path(s) — CLI one-shot
- Notion export (HTML/MD bundle)
- Apple Notes export (HTML)
- Future: A3 `notes` table sync

## Operations (IN/OUT)

| Op | IN | OUT |
| --- | --- | --- |
| search (lexical) | query string | ranked note IDs + snippets |
| search (vector) | query embedding | ranked note IDs + scores |
| tag | note ID + tag set | updated tags row |
| link | note ID + target ID | cross-ref edge |
| summarise | note ID or cluster ID | summary text (stored) |
| re-export | note ID | original-format file bytes |

## LLM dependency

- v1 skeleton: **no LLM** (lexical search stub only).
- v2: optional provider TBD; cost ceiling documented before enable.

## Storage (A3)

Tables: `notes`, `note_chunks`, `note_embeddings`. Attachments → A4.

## UI (F2.d skeleton)

Route: `#tools/utilities/notes`. Tabs (≤3): **SEARCH**, **LIBRARY**, **INFO**.

## Idempotency

Ingest keyed by `sha256(content)`; re-run upserts same row.
