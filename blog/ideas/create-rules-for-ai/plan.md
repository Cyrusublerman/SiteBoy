# Plan — Design-Rule Corpus from Web Scrape
**Status:** DESIGN | **Cluster:** knowledge-ingest


## 0. Defined Terms

- **Source** — one URL fetched and cached.
- **Article** — cleaned markdown derived from one Source.
- **Assertion** — atomic prescriptive claim extracted from an Article.
- **Rule** — canonical, deduplicated Assertion conforming to the Schema (§3).
- **Cluster** — set of Assertions deemed semantically equivalent.
- **Detector** — deterministic check (regex/AST) that decides Rule compliance.
- **Profile** — filter over Rules (e.g. `movements ⊇ {swiss}` ∧ `medium = web`).
- **Decidable Rule** — Rule with a working Detector.
- **Judgment Rule** — Rule without a Detector; surfaced via pre-decision read.
- **Hot Rule** — Rule inlined into `.cursorrules` (top-priority `MUST`/`MUST_NOT`).
- **Compact Index** — one-line-per-Rule manifest, full corpus, ≤2k tokens target.

## 1. Goal

Produce a versioned, agent-consumable corpus of design Rules covering: graphic, print, UI/UX, infographic, system, style-movement (Swiss, brutalism, minimalism), and AI-era design discourse. Output drives `.cursorrules`, per-category guides, and a linter.

## 2. Non-Goals

- Not a design-system token set. Tokens are downstream consumers of Rules.
- Not a CMS. No editorial UI; corpus is git-tracked markdown.
- Not real-time. Batch pipeline; re-runs are idempotent.
- Not subjective taste curation. Aspirational/descriptive prose is rejected at extraction.

## 3. Schema (locked before any extraction)

```yaml
id: <CATEGORY>-<MNEMONIC>          # stable, namespaced
category: <slot from §6 taxonomy>
subcategory: <free, lowercased>
modality: MUST | MUST_NOT | SHOULD | SHOULD_NOT | MAY
statement: <single imperative sentence, ≤140 chars>
rationale: <one sentence, why>
scope: [<surface keys>]            # ui-styling | canvas | print | algorithm | …
applies_to: [<file/lang globs>]
excludes: [<file/lang globs>]
decidable: bool
detector:                          # required iff decidable=true
  kind: regex | ast | css-prop | none
  pattern: <expr>
  exclude_paths: [<glob>]
examples:
  bad: [<≤3 strings>]
  good: [<≤3 strings>]
sources:
  - url: <canonical>
    author: <str|null>
    quote: <verbatim, must substring-match Article>
    weight: <0..1, see §7>
confidence: <0..1, computed>
consensus: <int, distinct sources>
movements: [<swiss|brutalism|minimalism|…>]
medium: [<web|print|mobile|motion|large-format>]
priority: <0..1000, tie-break on conflict>
conflicts_with: [<id>]
supersedes: [<id>]
tags: [<free>]
```

Validator: `zod` schema. Reject any Rule missing required fields or whose `quote` fails substring check on its Source.

## 4. Pipeline (stages, deterministic, cached)

1. **Fetch** — URL → `cache/<sha256(url)>/raw.html` + `meta.json`.
   Tier-1 `fetch`. Tier-2 Playwright if Tier-1 yields <500 chars of body. Tier-3 **manual-paste tier** (see §4a).
2. **Clean** — `@mozilla/readability` → strip nav/ads/footer.
3. **Convert** — `turndown` → `clean.md`.
4. **Pass-A Mine** — markdown AST traversal:
   - Numbered/bulleted lists under headings matching `/(rules?|principles?|laws?|heuristics?|do|don'?t|never|always)/i`.
   - Blockquotes; code fences; image alt text containing `do|don'?t`.
   Emit raw Assertions with line provenance.
5. **Pass-B Extract** — LLM call per Article chunk (≤6k tok):
   - Structured-output JSON, schema-enforced.
   - Prompt constraint: emit only atomic, prescriptive, decidable claims; verbatim quote required.
   - Reject items where quote ⊄ Article.
6. **Embed** — `text-embedding-3-small` over `statement`.
7. **Cluster** — HDBSCAN, cosine distance, min cluster size 2, threshold tuned to ~0.82 cosine.
8. **Synthesise** — per Cluster, LLM merges members into one canonical Rule; sums weights; preserves all Sources.
9. **Conflict-detect** — Clusters with mixed `MUST` vs `MUST_NOT` modalities → `conflicts.queue.md` for human resolution.
10. **Categorise** — auto via embedding nearest-centroid against §6 taxonomy; human review for `confidence<0.6`.
11. **Emit** —
    - `blog/docs/standards/rules/<category>/<id>.md` (front-matter + body).
    - `blog/docs/standards/rules/INDEX.md` (Compact Index).
    - `blog/docs/standards/<category>.md` (per-category narrative guide, regenerated).
12. **Lint compile** — Decidable Rules → `tools/lint/design-rules.mjs`. Run on `assets/`. Misfires log to `lint-misfires.md`.
13. **Test** — per Rule: `examples.bad` MUST trip Detector; `examples.good` MUST pass. CI-blocking.

Each stage reads from the previous stage's cache. Re-run is incremental.

## 4a. Manual-Paste Tier (Tier-3)

**Trigger.** A Source qualifies for Tier-3 if any of:
- Cleaned body <1000 chars after Stage 3.
- Source markup contains a paywall sentinel: `Member-only story`, `subscribe to read`, `paywall`, `metered-paywall`, `Sign in to read`, etc. (stoplist maintained in `tools/scrape/paywall-sentinels.json`).
- Domain is on `tools/scrape/manual-only.json` (e.g. `medium.com`, `*.medium.com`, custom Medium domains).

**Queue file.** `blog/ideas/create-rules-for-ai/manual-paste.queue.md` — git-tracked, append-only.
Each entry:
```
- id: <sha256(url)[:12]>
  url: <canonical>
  status: pending | pasted | skipped
  reason: paywall | empty | domain-blocklist
  detected_at: <iso-8601>
  source_index: <line in sites file>
```

**Interactive flow (when an agent runs the pipeline in a Cursor session):**
1. Pipeline runs Stage 1; new Tier-3 entries written to queue with `status: pending`.
2. Agent reads queue, processes entries one at a time.
3. For each `pending` entry: agent prompts the user with the URL and asks them to paste the article body.
4. User pastes → agent writes to `cache/<sha256(url)>/clean.md` with `meta.json`:
   ```yaml
   tier: 3
   sourced: manual-paste
   pasted_at: <iso-8601>
   url: <canonical>
   ```
5. Agent flips queue entry to `status: pasted`. Subsequent stages process as normal.
6. User may set `status: skipped` to remove an entry from the prompt loop permanently.

**Non-interactive runs.** Pipeline halts at Stage 3 for Tier-3 entries; logs the queue size; continues with non-Tier-3 sources. Manual paste happens later in an interactive session.

**Constraints.**
- Pasted content goes through Stages 4–13 identically to Tier-1/2 content.
- Quote-substring validator (Stage 5) operates on pasted text, so Rules cite the pasted body verbatim.
- `meta.json.sourced` propagates to `Rule.sources[i].sourced` for traceability — pasted Sources are auditable as not-fetched.

## 5. Repository Layout

```
tools/
  scrape/
    fetch.mjs                  # stage 1
    clean.mjs                  # stages 2–3
    mine.mjs                   # stage 4
    extract.mjs                # stage 5 (LLM)
    embed.mjs                  # stage 6
    cluster.mjs                # stage 7
    synth.mjs                  # stage 8
    emit.mjs                   # stage 11
    paste-loop.mjs             # §4a interactive prompt loop
    paywall-sentinels.json     # §4a stoplist
    manual-only.json           # §4a domain blocklist
    schema.mjs                 # zod, shared
    sources.json               # URL list, authority weights
    cache/                     # gitignored
  lint/
    design-rules.mjs     # generated stage 12
blog/docs/standards/rules/
  INDEX.md               # Compact Index, generated
  <category>/<id>.md     # atomic Rule files, generated
blog/docs/standards/
  <category>.md          # per-category guide, generated
  conflicts.queue.md     # generated, human-resolved
  defined-terms.md       # hand-authored, source of truth for §0 terms
```

Generated files carry header `<!-- generated: do not edit -->`.

## 6. Taxonomy (categories — orthogonal slots)

`colour | typography | hierarchy | contrast | iconography | grid | alignment | spacing | density | composition | motion | interaction | feedback | affordance | state | labelling | casing | voice | navigation | information-architecture | print-production | data-visualisation | tokens | naming | modularity | file-ownership | process`

Overlays (filters, not slots): `movements`, `medium`, `audience`.

## 7. Authority Weights (Source → weight)

| Source class | Weight |
|---|---|
| Established design-system docs (Material, HIG, GOV.UK), NN/g, W3C | 1.0 |
| Reputable agency / publisher (Figma, Webflow blog, Smashing) | 0.7 |
| Domain expert blog with named author + history | 0.6 |
| Generic Medium / dev.to article | 0.3 |
| Forum / Reddit / BBS thread | 0.2 |

`confidence = clamp(Σ source.weight / 2.0, 0, 1)`. `consensus = |distinct sources|`.

## 8. Agent-Control Output

Three artefacts feed the agent:

1. **Hot Rules** — top N `MUST`/`MUST_NOT` by `priority * confidence`, inlined into `.cursorrules`. N tuned to keep `.cursorrules` ≤6k tok.
2. **Compact Index** — `INDEX.md`, one line per Rule: `<id> [<modality>] <statement> → <path>`. Loadable in full.
3. **Pre-Decision Read Map** — table appended to existing AI Routing Map: `<decision-trigger> → <category>.md`. One row per category.

Decidable Rules additionally compile to the linter (§4 stage 12). The agent is not asked to remember any Rule the linter enforces.

## 9. Quality Gates (CI-blocking)

- Schema validation passes for every Rule.
- Every `quote` substring-matches its Source's `clean.md`.
- Every Detector passes its `examples.good` and trips on its `examples.bad`.
- `INDEX.md` ≤2000 tokens (count via `tiktoken`).
- `.cursorrules` ≤6000 tokens.
- No two Rules share an `id`.
- `conflicts.queue.md` empty OR all entries marked `resolved: true`.

## 10. Build Order (sequential, each gates the next)

1. Author `defined-terms.md`, lock §3 schema, lock §6 taxonomy, lock §7 weights table.
2. Build stages 1–3 (fetch/clean/convert). Run across current URL list (`sites to scrape for design rules.md`). Archive cache.
3. Build stage 4 (Pass-A mine). Eyeball output for 5 Articles. Tune heading regex.
4. Build stage 5 (Pass-B LLM). Validate JSON-schema enforcement and quote-substring guard on 5 Articles.
5. Build stages 6–8 (embed/cluster/synth). Run end-to-end on 10 Articles. Inspect Clusters.
6. Build stages 9–11 (conflict/categorise/emit). Generate first corpus.
7. Build stage 12 (linter). Run on `assets/`. Triage misfires; demote bad Detectors to `decidable: false`.
8. Build stage 13 (per-Rule tests). Wire to CI.
9. Wire Hot Rules into `.cursorrules`; wire Compact Index + Pre-Decision Map into existing AI Routing Map.
10. Re-run pipeline against full URL list. Resolve `conflicts.queue.md` manually.

## 11. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Source recycling (same listicle, many sites) | Cluster + dedupe; authority weighting |
| Movement contradiction (brutalism vs minimalism) | Keep as `movements` overlays, never blend |
| Detector over-fires | Backtest corpus + `lint-misfires.md`; demote to Judgment Rule |
| Rule sprawl | Per-category cap (e.g. ≤40 Rules); force consolidation |
| LLM hallucination at extraction | Verbatim-quote substring guard; reject on fail |
| Schema drift mid-build | Schema locked at step 1; bump `schema_version` and migrate explicitly |
| Stale rules | `published_at` recorded; re-review queue for items >3 yrs in time-sensitive categories |

## 12. Out-of-Scope (this plan)

- Visual rule examples (image generation/curation).
- Multi-language sources.
- Private/paywalled corpora.
- Live web crawl beyond depth-1 same-domain expansion from seed URLs.

## 12a. Companion Documents

- `sites to scrape for design rules.md` — seed URL list (input).
- `manual-paste.queue.md` — Tier-3 queue (generated, §4a).
- `audit.md` — open questions, logic holes, contradictions, investigation backlog. Living document; gates v1 sign-off (see §13).

## 13. Definition of Done (v1)

- ≥200 Rules emitted, all passing §9 gates.
- ≥40% of Rules are Decidable and have passing Detectors.
- `.cursorrules` regenerated with Hot Rules block.
- `INDEX.md` and per-category guides committed.
- Linter integrated into existing dev script (`npm run lint:design`).
- Pipeline re-runnable end-to-end on a clean clone in <15 min (cache cold) / <1 min (cache warm).
- `audit.md` has zero `status: blocking` entries open.


---

## Related ideas

- [Web-to-Knowledge Pipeline](../thoughts/web-to-knowledge-pipeline.md)
- [Linux Screen-to-Markdown Capture](../tools/external/linux-screen-to-markdown-capture.md)
- [Design Knowledge Corpus Extraction](design-knowledge-corpus-extraction-system.md)
- [Design-Rule Audit](audit.md)
- [Notebook Decomposition & Publishing](../tools/external/notebook_decomposition_publishing_system_design_doc.md)
