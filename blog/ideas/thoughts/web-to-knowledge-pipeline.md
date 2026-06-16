# Web-to-Knowledge Pipeline (Research Technique)
**Status:** DESIGN | **Cluster:** knowledge-ingest


## Core Technique (Manual, Now)

1. Use an HTML-to-Markdown browser extension to convert target pages to `.md`.
2. Collect all pages on a given topic into a flat corpus.
3. Run narrative analysis across the corpus: extract claims, recurring constructs, contested terms, structural patterns, and lacunae.
4. Distil to a single refined document — the canonical knowledge artifact for that topic.

**Tooling prerequisite:** An extension that produces clean, structure-preserving `.md` from arbitrary HTML (no cruft, no nav/ads). The output quality gates the analysis quality.

---

## Automated Future State

**Condition:** Agent tech is sufficiently capable and cheap.

**Pipeline:**

```
query(topic)
  → crawl(N pages, ranked by relevance + authority)
  → convert_each(html → md)
  → narrative_analysis(corpus)          # claims, structure, gaps, consensus
  → synthesise(topic_library_entry)
```

**Scale-out:**

- Topic → library entry (atomic unit)
- Theme = set of topics → cross-topic analysis (shared constructs, contradictions, dependency graph)
- Domain = set of themes → macro synthesis

Each level of aggregation produces a new artifact. Lower-level artifacts feed higher-level ones — the structure is compositional.

---

## Properties

| Property | Value |
|---|---|
| Unit of work | Single topic corpus |
| Output | Structured knowledge artifact (not raw notes) |
| Analysis type | Narrative (claim-level, not keyword-level) |
| Scalability | Linear per topic; compositional across themes/domains |
| Current blocker | Manual crawl + convert step; agent cost/quality |

---

## Notes

- Narrative analysis ≠ summarisation. Summarisation collapses; narrative analysis maps structure, identifies who claims what under what conditions, and surfaces where sources diverge.
- The value compounds at theme and domain level — individual topic entries are useful but the cross-topic synthesis is where novel insight emerges.
- Format of the library entry is undecided; candidates: structured `.md`, JSON-LD, or a hybrid.


---

## Related ideas

- [Linux Screen-to-Markdown Capture](../tools/external/linux-screen-to-markdown-capture.md)
- [Design Knowledge Corpus Extraction](../create-rules-for-ai/design-knowledge-corpus-extraction-system.md)
- [Design-Rule Corpus Plan](../create-rules-for-ai/plan.md)
- [Design-Rule Audit](../create-rules-for-ai/audit.md)
- [Notebook Decomposition & Publishing](../tools/external/notebook_decomposition_publishing_system_design_doc.md)
