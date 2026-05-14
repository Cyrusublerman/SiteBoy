# Audit — Open Questions, Holes, Contradictions, Investigations

Living document. Sibling to `plan.md`. Gates v1 sign-off (no `status: blocking` open).

## 0. Defined Terms (this file)

- **Entry** — one numbered item across §§1–4.
- **Status** — one of: `open | resolved | wontfix | superseded | blocking`.
  - `blocking` — must be resolved before the relevant pipeline stage runs.
  - `wontfix` — explicitly deferred; rationale required.
  - `superseded` — replaced by another Entry; cite successor id.
- **Origin** — where the Entry surfaced (sample analysis, plan review, downstream consumer, etc.).
- **Owner** — `aeinoder` unless delegated.

## Conventions

- Each Entry is immutable once written except for `status`, `resolution`, `successor`, and appended notes.
- Resolved Entries stay in the file for traceability; do not delete.
- IDs never reused. Allocate the next free integer in the namespace.
- Append-only at end of each section.

---

## 1. Questions to Answer

| id | status | origin | question | resolution |
|---|---|---|---|---|
| Q-001 | resolved | plan §3 | Which LLM provider/model for Pass-B extraction (Stage 5)? Cost vs schema-adherence vs throughput trade-off. | Claude 4 Sonnet (tool_use structured output). Rationale: superior verbatim-quote fidelity vs GPT-4o; quote-substring guard is the hardest constraint. API cost negligible at ~120 articles. Pipeline must accept `--model` flag so provider is not hard-coded. GPT-4o is the designated fallback. |
| Q-002 | resolved | plan §3 | Which embedding model for Stage 6 — `text-embedding-3-small`, `bge-small-en-v1.5`, local? Trade-off: API cost vs reproducibility. | `text-embedding-3-small` (OpenAI). 1536 dimensions, sufficient for HDBSCAN over ~600 assertions. Cheap. Widest ecosystem support for downstream clustering tooling. Local models add infra cost with no quality gain at this scale. |
| Q-003 | open | plan §7 | Cluster cosine threshold: 0.82 is a guess. Validate empirically on first 10 Articles. | |
| Q-004 | open | plan §7 | `confidence = clamp(Σ source.weight / 2.0, 0, 1)`. Why divide by 2? Justify or replace with calibrated formula. | |
| Q-005 | blocking | plan §4 stage 12 | Where does the linter run — pre-commit hook, CI only, both? Affects developer feedback latency. | |
| Q-006 | open | plan §4 stage 9 | Conflict resolution mechanism: BDFL, dated commit by `aeinoder`, or movement-overlay scoping? | |
| Q-007 | open | plan §8 | Profile selection mechanism: env var, file marker (`.designprofile`), CLI flag, or per-task agent declaration? | |
| Q-008 | open | plan §6 | Does the SiteBoy project itself have a Profile? If so, declare it (e.g. `swiss + minimalism + brutalism-leaning`). | |
| Q-009 | open | plan §10 step 9 | When mined Rules conflict with existing SiteBoy `.cursorrules` / `design-law.md`, which wins? Manual review, or supersede via `priority`? | |
| Q-010 | open | plan §4a | Re-paste policy: if user updates a Tier-3 paste later, does the cache get invalidated and downstream Rules re-derived? | |
| Q-011 | open | plan §10 | Pipeline cadence: re-run on every URL-list change, weekly, on demand? | |
| Q-012 | resolved | plan §3 | `priority` is a 0–1000 integer. How is it set initially — by category, by modality, by hand? | Deterministic formula in schema.mjs: `priority = round(confidence × 500 + modality_base)`. modality_base: MUST/MUST_NOT=400, SHOULD/SHOULD_NOT=200, MAY=0. |
| Q-013 | open | sample analysis (UX Planet) | Depth-1 expansion from listicle inline links: enabled by default, or opt-in per Source? | |
| Q-014 | open | plan §11 | Schema versioning + migration policy: how is `schema_version` bumped? Migration scripts checked in? | |
| Q-015 | open | plan §9 | Token-budget gates (`.cursorrules` ≤6k, `INDEX.md` ≤2k) — measured with which tokeniser? `tiktoken` model name? | |
| Q-016 | open | plan §4 stage 11 | Generated-file delimiter for the `.cursorrules` Hot Rules block: comment markers (`<!-- HOT-RULES:START -->`)? | |
| Q-017 | open | plan §3 | Are `examples.bad` strings mandatory for `decidable: true` Rules? (Recommend yes — Detector test relies on them.) | |
| Q-018 | resolved | plan §6 | New category `accessibility` — currently absent from taxonomy but recurs across sources (WCAG, NN/g, contrast, colourblind). Add. | Added to CATEGORIES enum in schema.mjs. WCAG 2.2 added to sources.json as weight=1.0 established-design-system source. |
| Q-019 | open | sample analysis (NN/g) | Multi-category Rules — adopt `categories: []` + `primary_category`, or split into N Rules? Affects retrieval. | |
| Q-020 | open | plan §7 | Per-author authority bonus (e.g. Tufte, Norman, Müller-Brockmann named-author override of source-class weight). Worth the maintenance cost? | |

## 2. Holes in Logic

| id | status | origin | hole | mitigation |
|---|---|---|---|---|
| H-001 | resolved | plan §3 | `decidable` is binary; many Rules are partially decidable (e.g. "no decoration" — what counts as decoration?). Forces false negatives or false positives. | Schema.mjs uses ternary `decidable: 'full' \| 'partial' \| 'judgment'` (resolved before schema lock). Validation rules enforce detector presence for 'full'/'partial', and detector.kind='none' for 'judgment'. |
| H-002 | open | plan §7 | Authority weight is per-source-class only; ignores per-author reputation. Don Norman on Medium ≠ random influencer. | See Q-020. |
| H-003 | open | plan §4 stage 7 | Cluster threshold (0.82) is unvalidated. Wrong threshold yields either over-merging (loses nuance) or under-merging (duplicates). | Validate against a hand-labelled set of known-equivalent and known-distinct Assertions. |
| H-004 | open | plan §4 stage 8 | Synthesis (LLM) is non-deterministic. Re-running the pipeline can produce different canonical statements. | Pin model + seed; cache canonical statement per Cluster signature; only re-synth on Cluster membership change. |
| H-005 | open | plan §9 | Backtest corpus is mentioned but not specified. No corpus = no validation = Detector regressions unnoticed. | Curate ≥20 designs you respect + ≥20 you reject; tag each with which Rules they should/shouldn't trip. |
| H-006 | open | plan §4 stage 5 | Vendor/cookie/chrome stoplist is unbounded and grows ad-hoc. No regression coverage. | Stoplist file under version control + tests against captured fixtures. |
| H-007 | open | plan §8 | Profile-overlay model assumes movements are independently filterable; in practice movements have internal contradictions when blended. | See C-001..C-005 below. Model needs profile-conflict detection. |
| H-008 | open | plan §4 stage 11 | `.cursorrules` is human-authored AND machine-generated. Idempotent merge requires delimiter discipline. | Q-016 resolves. |
| H-009 | open | plan §9 | CI-blocking per-Rule tests scale poorly: 200 Rules × 3 examples each = 600 detector runs per CI build. | Tier tests: Hot Rules every CI; full corpus nightly. |
| H-010 | resolved | plan §3 | Quote-substring guard fails on markdown emphasis (`**word**` vs `word`), curly quotes (`"` vs `"`), nbsp vs space. | `normaliseForQuoteMatch()` in schema.mjs. `tools/scrape/extract.mjs` builds a normalised full-article string and requires each claim `quote` normalised form to be a substring (stage 5 quote guard). |
| H-011 | open | plan §4 stage 4 | Heading-as-rule pattern (brutalist-web) requires a separate sub-strategy not yet implemented. | Add: H3 with imperative/declarative full-sentence (>30 chars) + body paragraph → Assertion. |
| H-012 | open | plan §4 stage 5 | Definition vs prescription discrimination is prompt-dependent and brittle (Figma 13 principles). | Pass-B prompt template explicit; add few-shot examples of definition (reject) vs rule (accept); add validator that flags Rules whose `statement` matches `<term> is <definition>` regex. |
| H-013 | open | plan §4 stage 5 | Descriptive→prescriptive reframing (Wikipedia Swiss) loses certainty: "X used Y" → "use Y" overstates universality. | Mandatory `movements` tag when `descriptive_origin: true`; reviewer-queue any Rule with `descriptive_origin && movements: []`. |
| H-014 | open | plan §6 | Image-based rules (do/don't screenshots) are silently dropped. | Either accept the loss explicitly in §12 Out-of-Scope, or add an OCR/captioning tier. |
| H-015 | open | plan §4 stage 1 | Paywall-sentinel list (§4a) is heuristic; new patterns will leak. | Periodic audit: sample Tier-1/2 outputs <2KB body for missed paywalls. |
| H-016 | open | plan §3 | `examples.good` strings — for purely visual Rules ("balanced composition") there is no canonical text example. | Mark such Rules `decidable: false` and require longer `rationale`; do not invent fake good examples. |
| H-017 | open | plan §4 stage 12 | Detector regex on `assets/` runs on minified/built files by default. False positives across `node_modules`, `dist`, `.vite`. | Mandatory `exclude_paths` defaults: `node_modules/**`, `dist/**`, `.vite/**`, `cache/**`. |
| H-018 | open | plan §4 stage 5 | LLM may invent rules absent from Source ("hallucination beyond quote"). Quote-substring guard catches the quote but not surrounding fabricated context. | Sample audit (5%): manually verify the Rule fairly summarises the quoted passage, not just that the quote exists. |
| H-019 | open | plan §10 | Pipeline self-reference: the rules in `.cursorrules` and `plan.md` are themselves rule-like. They are not in the Rule corpus. | Decide: keep meta-rules separate (recommended), or include with `category: process` and allow self-audit. |
| H-020 | open | plan §3 | `medium` overlay: a `web` site embedding a `print` artefact (e.g. PDF download, large-format mockup) — which overlay applies? | Per-component scoping needed; out of v1. Note in §12. |

## 3. Potential Contradictions

| id | status | rule-A side | rule-B side | resolution path |
|---|---|---|---|---|
| C-001 | open | Brutalism: "buttons look like buttons" — native browser styling preferred. | Minimalism / Flat: heavily styled flat buttons that abandon native chrome. | Both are MUST under their own `movements`. Profile that selects both → conflict-detect at compile time, surface to user. |
| C-002 | open | Universal (Figma + Swiss + NN/g): "use a grid system". | Brutalism (implicit, brutalist-web): rigid grids subordinate content; raw HTML + scroll preferred. | Tag the grid Rule as `MUST_NOT` under `movements: [brutalism-strict]` and `MUST` elsewhere; require Profile to disambiguate. |
| C-003 | open | Swiss: left-alignment is fundamental. | Compositional balance: symmetrical/centred composition acceptable for posters/print. | Scope by `medium`: `[web, mobile]` favours left-align Rule; `[print, large-format]` allows centred when balance Rule applies. |
| C-004 | open | NN/g: limit colour palette; small distinct set. | Maximalism / certain brutalism variants: polychromy, raw colour clash. | `movements` overlay handles in principle; explicit conflict log per Profile. |
| C-005 | open | Universal: "no decoration that doesn't serve content". | Brutalism explicitly allows raw-decoration honesty; some Swiss posters use decorative geometry. | `decoration` is undefined. Until defined (see H-001), the Rule is judgment-only. |
| C-006 | open | Generic UX: "use rounded corners for affordance / friendliness". | SiteBoy `.cursorrules`: "Disallow rounded corners". | Project-level overrides mined Rules. Document precedence: project rules ⊃ profile rules ⊃ universal rules. Encode as `priority` + a documented override file. |
| C-007 | open | Generic UX: "use shadows for depth / hierarchy". | SiteBoy: "Disallow shadows". | Same resolution as C-006. |
| C-008 | open | Generic UX: "use gradients for visual interest". | SiteBoy: "Disallow gradients". | Same resolution as C-006. |
| C-009 | open | Performance is a feature (brutalist-web, NN/g infographics). | Heavy interactive infographics (NN/g same article endorses interactivity). | Same article internally tensions; cluster-synth must preserve both as conditional rules with `medium` scoping. |
| C-010 | open | Universal: prescribe specific behaviours (MUST/MUST_NOT). | Some sources (Tufte, Müller-Brockmann) prescribe via demonstration; their "rules" are inferred. | Inference Rules must carry `descriptive_origin: true` (see H-013) and lower default `priority`. |

## 4. Further Areas to Investigate

| id | status | area | rationale |
|---|---|---|---|
| I-001 | open | Author-level authority weighting | Q-020/H-002. Maintain an authors table with multiplier; apply on top of source-class weight. |
| I-002 | open | OCR pipeline for screenshot-based rules | H-014. Many Medium articles encode key rules in images. Evaluate cost/yield. |
| I-003 | open | Accessibility-specific corpus (WCAG, ARIA Authoring Practices) | Q-018. Currently absent from URL list. Add high-authority sources. |
| I-004 | open | Print-production rules (bleed, gutter, registration, CMYK) | Currently absent from URL list. Add print-design-specific sources. |
| I-005 | open | Data-visualisation primary sources (Tufte, Cleveland, Few) | Currently only secondary via NN/g. Acquire primary works (likely manual-paste). |
| I-006 | open | Motion / interaction / animation rules | URL list thin on this. Add Material Motion, IBM Carbon motion, Apple HIG motion sections. |
| I-007 | open | Non-Western design traditions (Japanese ma, Bauhaus successor traditions, Asian typography) | Currently Eurocentric. Investigate balance. |
| I-008 | open | Backtest corpus design | H-005. Curate the corpus before Stage 12 wires CI. |
| I-009 | open | Profile-conflict detection algorithm | H-007. When a Profile selects movements with internal contradictions (C-001..C-005), output a per-Profile conflict report at compile time. |
| I-010 | open | Rule-churn changelog discipline | How agents are notified that a Rule changed/superseded between pipeline runs. Affects cache invalidation downstream. |
| I-011 | open | Self-audit of `.cursorrules` and `plan.md` | H-019. Decide whether project meta-rules enter the corpus. |
| I-012 | open | Detector kinds beyond regex/AST/css-prop | What about colour-distance for "low contrast", token-count for "too many fonts", DOM-tree for "deeply nested cards"? Extensible Detector registry. |
| I-013 | open | LLM-based Detector tier (`kind: llm-judge`) for Judgment Rules | Trade-off: per-PR LLM cost vs catching nuanced violations. Off by default. |
| I-014 | open | Profile composition algebra | If Profiles are sets of (movements, mediums), need formal operators: union, intersection, override, exclusion. |
| I-015 | open | Documentation generation for end-users | Per-category guides are generated for agents; what about a human-readable site that browses Rules with examples? |

## 5. Resolution Workflow

1. New Entry appended with `status: open` (or `blocking` if prerequisite for a stage).
2. When working on a related task, address the Entry; record in `resolution` column.
3. Flip `status` to `resolved | wontfix | superseded`. Never delete.
4. If a new Entry replaces an old one, set old to `superseded` and record `successor: <new-id>`.
5. Before each pipeline stage runs, grep for `status: blocking` Entries with that stage in `origin`. Halt if any.
6. Before v1 sign-off (plan §13), assert no `status: blocking` Entries remain.

## 6. Append Index

Next free IDs: `Q-021`, `H-021`, `C-011`, `I-016`.
