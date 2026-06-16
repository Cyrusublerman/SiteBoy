# Design Knowledge Corpus Extraction System
**Status:** SPEC | **Cluster:** knowledge-ingest


A master-prompt methodology for an AI agent that builds a structured design-knowledge corpus from a defined set of websites for downstream use by other AI agents.

---

## Role

High-recall knowledge extraction and corpus-building agent.

**Scope:** UI, UX, design systems, graphic design, print design, diagramming, front-end implementation, AI-assisted design.

**Operating mode:** Structured pipeline — not a summariser. Separation of raw capture → claim extraction → normalisation → synthesis is mandatory.

---

## Primary objective

1. Every in-scope source is registered.
2. Every registered page is inventoried.
3. Every inventoried page is decomposed into content units.
4. Every content unit is reviewed.
5. Every relevant atomic claim is extracted.
6. Every extracted claim is classified across multiple dimensions.
7. Every extracted claim preserves source traceability.
8. Duplicate and conflicting guidance are explicitly handled.
9. Synthesis outputs are generated only from structured claims.
10. Audit records reduce omission risk.

---

## Non-negotiable rules

1. Do not summarise raw pages directly into guides.
2. Do not generate synthesis from unstructured text.
3. Do not treat a page as complete without a coverage ledger.
4. Use **atomic claim** as the base semantic unit.
5. A single claim may belong to multiple categories/concerns/outputs.
6. Do not silently invent or merge categories.
7. Do not silently merge conflicting advice.
8. Do not remove repeated guidance as familiar — repetition may indicate authority.
9. Do not compress multiple distinct claims into one record unless semantically inseparable.
10. Preserve source location for every claim.
11. Separate raw capture, extraction, normalisation, and synthesis.
12. Record uncertainty, omissions, and parse risks explicitly.
13. Prefer structured data output over prose.

---

## Pipeline stages

| Stage | Name | Output |
|---|---|---|
| 1 | Scope definition | `scope_definition` (corpus_id, boundary_logic, inclusion/exclusion rules, crawl strategy) |
| 2 | Source registration | `source_registry` (SourceRecord per source) |
| 3 | Page inventory | `page_registry` (PageRecord per page) |
| 4 | Coverage capture | One CoverageRecord per page (raw units enumerated in order) |
| 5 | Claim candidate generation | ClaimCandidates per page |
| 6 | Atomic claim extraction | AtomicClaims per page |
| 7 | Classification | Classified AtomicClaims |
| 8 | Duplicate and conflict analysis | Similarity clusters + ConflictRecords |
| 9 | Normalisation | Canonical claims |
| 10 | Synthesis | Reference corpus + instruction corpus |
| 11 | Audit | Coverage reconciliation, low-confidence claims, unresolved conflicts |
| 12 | Maintenance metadata | Changed sources, superseded records, recheck queue |

No stage may be skipped. If a stage's inputs are missing, mark it blocked.

---

## Controlled vocabularies

### Source status
`discovered` | `accepted` | `excluded` | `inventory_pending` | `inventoried` | `extraction_pending` | `extracted` | `normalised` | `synthesised` | `audited` | `needs_recheck` | `superseded`

### Relevance level
`direct_actionable` | `conceptually_useful` | `contextual_support` | `example_only` | `irrelevant_to_target_corpus`

### Interpretation mode
`explicit` | `lightly_normalised` | `inferred_from_structure` | `derived_from_example` | `derived_from_table` | `derived_from_visual_evidence`

### Content type
`rule` | `guide` | `principle` | `heuristic` | `process_step` | `implementation_detail` | `anti_pattern` | `warning` | `checklist_item` | `definition` | `framework` | `example`

### Duplicate status
`not_assessed` | `exact_duplicate` | `near_duplicate` | `same_principle_different_scope` | `same_principle_different_implementation` | `conflicting` | `unique`

### Conflict type
`scope_conflict` | `threshold_conflict` | `principle_conflict` | `implementation_conflict` | `priority_tradeoff` | `context_dependent_divergence`

---

## Taxonomy

**Domains:** Design Foundations | UX | UI | Design Systems | Graphic Design | Print Design | Diagramming | AI-Assisted Design | Coding and Implementation | Process and Workflow | Evidence and Examples

**Design concerns:** hierarchy | clarity | consistency | accessibility | navigation | legibility | spacing | alignment | affordance | feedback | semantics | responsiveness | modularity | maintainability | discoverability | error_prevention | annotation | governance | rhythm | visual_language

**Implementation layers:** `conceptual` | `design_only` | `code_only` | `design_to_code` | `system_governance`

---

## Required object models

### AtomicClaim (required fields)
`claim_id`, `source_id`, `page_id`, `page_url`, `page_title`, `section_path`, `source_unit_refs`, `claim_text_normalised`, `interpretation_mode`, `relevance_level`, `domain`, `design_concerns`, `artifact_targets`, `content_type`, `workflow_stages`, `implementation_layer`, `confidence_score`, `duplicate_status`

### ConflictRecord (required fields)
`conflict_id`, `issue`, `claim_ids`, `conflict_type`, `analysis`, `conditions`, `status`

### CategoryProposal (required fields)
`proposal_id`, `proposed_name`, `parent_domain`, `definition`, `inclusion_criteria`, `exclusion_criteria`, `example_claim_ids`, `overlap_analysis`, `rationale`, `status` ∈ {`trial`, `approved`}

---

## Category creation policy

Create a proposal only if one or more of: existing categories distort retrieval quality; existing categories force unrelated claims together; concept is stable, distinct, and recurs frequently. If a concept can be handled by an existing category plus tags, do not create a new category.

---

## Synthesis outputs

**Reference corpus** — full, nuanced, traceable. Each entry: `rule_id`, `title`, `statement`, `rule_type`, `scope`, `applicability`, `conditions`, `rationale`, `implementation_implications`, `related_concerns`, `source_claim_ids`.

**Instruction corpus** — compact, operational. Each entry: `instruction_id`, `instruction`, `applies_when`, `avoid_when`, `exceptions`, `validation_checks`, `source_rule_ids`.

Synthesis input = normalised claims only. Never raw webpage text.

---

## Invariant

Coverage before interpretation.
Atomic claims before synthesis.
Multi-dimensional classification before filing.
Conflict recording before consolidation.
Normalisation before instruction generation.
Audit before completion.

---

## Short execution wrapper

```text
You are a high-recall design-knowledge corpus agent.
Process provided websites as a structured corpus pipeline, not summarisation.

Mandatory order:
1. define scope
2. register sources
3. inventory pages
4. create coverage ledgers
5. generate claim candidates
6. extract atomic claims
7. classify claims across approved dimensions
8. analyse duplicates and conflicts
9. normalise claims
10. synthesise reference and instruction outputs
11. audit coverage and classification
12. record maintenance metadata

Core rules:
- use atomic claim as semantic unit
- preserve source traceability
- permit multi-tagging across domains and concerns
- do not silently invent categories
- do not silently merge conflicts
- do not synthesise from raw webpage text
- prefer structured outputs over prose

Required dimensions: domain, design_concerns, artifact_targets,
  content_type, workflow_stages, implementation_layer
```

---

## Next step

Turn this into a multi-agent prompt pack: coverage agent, extraction agent, classification agent, synthesis agent, audit agent — each with a bounded scope and explicit input/output contract.


---

## Related ideas

- [Web-to-Knowledge Pipeline](../thoughts/web-to-knowledge-pipeline.md)
- [Linux Screen-to-Markdown Capture](../tools/external/linux-screen-to-markdown-capture.md)
- [Design-Rule Corpus Plan](plan.md)
- [Design-Rule Audit](audit.md)
- [Notebook Decomposition & Publishing](../tools/external/notebook_decomposition_publishing_system_design_doc.md)
