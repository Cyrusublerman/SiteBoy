# Rare-Word Poem Generator
**Status:** DESIGN | **Cluster:** personal-notes


A system for procedurally generating poems using a rare-word dictionary (bottom 0.1% of ngram frequency) enriched with phonetic, semantic, and poetic-structure metadata.

---

## Architecture overview

| Layer | Components |
|---|---|
| A — Data Ingestion | Scraper, dictionary enrichment, phonetics/IPA, frequency/rarity |
| B — Semantic | Lexical structure, embeddings, tagging, concept graph |
| C — Poetic Form Engine | Form library, sound engine, meter engine, grammar engine |
| D — Generation Engine | Input spec, theme selection, scaffolding, line realisation, device application, global pass |
| E — Tooling/UI | Dictionary browser, semantic map viewer, form debugger, parameter panel |

---

## A — Data Ingestion

### A1. Rare-Word Base
**Source:** Phrontistery International House of Logorrhea (scraped A–Z).
**Fields:** `lemma`, `phrontistery_definition`, `source_url`, `phrontistery_list_id`.

### A2. Lexicographic Enrichment
**Sources:** Free/OSS dictionary API, Wordnik (rare-word coverage), Wiktionary (archaic entries). Premium optional: Oxford/MW/Collins.
**Fields:** `definitions`, `examples`, `labels_raw`, `etymology_raw`, `pos_raw`.

### A3. Phonetics & IPA
**Sources:** English-to-IPA, CMU Pronouncing Dictionary.
**Fields:** `ipa_us_cmu`, `ipa_dict_uk/us`, `stress_pattern`, `syllable_count`.

### A4. Frequency & Rarity
**Sources:** Google Books Ngram (historical), web/news corpus, subtitle corpora.
**Fields:** `freq_written`, `freq_spoken`, `freq_historical`, `dispersion_index`, `rarity_score`, `temporal_profile`.

---

## B — Semantic Layer

### B5. WORD_RECORD Schema
```
{
  lemma, pos_primary, pos_all[],
  ipa_*, stress_pattern, syllable_count,
  rarity_score, temporal_profile,
  domain_tags[], register_tags[],
  affect_tags[], imagery_tags[],
  embedding, concept_links[]
}
```

### Concept Graph
- **CONCEPT_NODE:** `{id, label, centroid_embedding, ontology_refs}`
- **MOTIF_NODE:** `{id, label, concept_ids[]}`
- **Edges:** `ASSOCIATES_WITH`, `CONTRASTS_WITH`, `METAPHOR_BRIDGE`, `PART_OF`

---

## C — Poetic Form Engine

**Form library:** JSON specs for sonnet, villanelle, haiku, tanka, limerick, blank verse, free verse, etc. Fields: stanza count, lines per stanza, rhyme pattern, meter pattern, special rules (volta, refrains).

**Sound engine:** Rhyme classes from IPA (final stressed syllable + coda). Alliteration/assonance/consonance from onset/nucleus/coda.

**Meter engine:** Validate/repair lines against target foot pattern (iambic, trochaic, anapestic, etc.).

---

## D — Generation Engine

**Input spec:** `{form, theme, affect_profile, rarity_bias, device_profile, cross_domain, motif_density}`

**Pipeline per poem:**
1. Query Concept Graph for CONCEPT_NODEs matching theme + affect.
2. Pick 1–3 MOTIF_NODEs.
3. Build stanza/line scaffolds from Form Library.
4. For each line: query WORDs with filters (POS, tags, rarity range, rhyme/sound, concept proximity); assemble candidate; meter-adjust.
5. Apply devices: motif recurrence, enjambment, caesura, internal rhyme, metaphor bridges.
6. Global pass: smooth thematic progression, contrasts, intensity.

---

## Scoring & ranking

### Constraint model
Each line scored across: `S_rhyme`, `S_meter`, `S_semantics`, `S_affect`, `S_coherence`, `S_style`.
Utility: `U = Σ w_i · S_i`. Constraint tiers: hard (structure) > soft-high (rhyme/meter) > soft-med (theme/affect) > soft-low (devices/rarity).

### Meter metrics
- `M_foot_accuracy` — proportion of feet matching target pattern.
- `M_syllable_deviation` — normalised avg deviation from target syllable count.
- `M_stress_deviation` — Hamming distance between actual and expected stress bits / n.
- `M_rhythm_variance` — regularity of stress spacing.
- `M_downbeat_alignment` — dot product actual vs expected stress bits / n.
- `M_stability` — consistency of meter metrics across lines.
- `M_score = a·M_foot_accuracy + b·M_syllable_deviation + c·M_stress_deviation + d·M_rhythm_variance + e·M_downbeat_alignment`

### Rhyme metrics
- `R_density` — rhyme-linked positions ÷ eligible positions.
- `R_economy` — 1 − (num_rhyme_classes / max_classes).
- `R_strictness` — proportion of pairs with slant_distance ≤ τ_strict.
- `R_stability` — 1 − variance of rhyme-class assignment per symbol.

### Semantic metrics
- `S_motif_coherence` — mean similarity line_vectors → motif_centroid.
- `S_theme_coherence` — 1 − variance of theme/domain tags across lines.
- `S_depth` — normalised (rare_word_count × avg_definition_complexity).

### Technique metrics (per technique T: alliteration, assonance, consonance, internal rhyme, parallelism)
- `T_intensity` — fraction of lines containing ≥1 event of T.
- `T_density` — avg events per line.
- `T_regularisation` — 1 − variance of event positions across stanzas.
- `T_variation` — avg scheme distance between T and other techniques.
- `T_score = α·T_intensity + β·T_density + γ·T_regularisation + δ·T_variation`

### Layering score
`L_layers` — active techniques count ÷ total techniques.
`L_divergence` — average inter-technique scheme distance.

---

## Repair strategies (ordered)

1. Local substitution — swap terms within same semantic cluster.
2. Slant-rhyme tolerance — broaden rhyme class; re-evaluate linked lines.
3. Rhyme-class pivot — adopt new anchor word; update lines sharing that rhyme symbol.
4. Meter micro-edits — replace tokens with shorter/longer synonyms; insert/remove light words.
5. Semantic correction — adjust domain/affect alignment; pull back to motif.
6. Coherence smoothing — adjust nearby lines; insert bridging terms.
7. Structural relaxation (optional) — allow controlled form-breaking via policy.

### LLM usage (constrained)
Use only for bounded tasks: paraphrase under constraint, near-synonyms, micro-edits. Inputs always include target meter, rhyme class, semantic cluster, POS roles. Outputs always validated by deterministic engines.

---

## Steering policies (profiles)
`{w_rhyme, w_meter, w_semantics, allow_slant, allow_pivot, allow_breaks, max_repairs}`
Examples: `strict_sonnet`, `loose_tercet`, `free_verse`.

---

## Source priority

| Tier | Sources |
|---|---|
| 1 (required) | Phrontistery wordlist; one main dictionary API; English-to-IPA/CMU; Ngram; embedding model; hand-authored ontology + tag seed lists; hand-authored form specs |
| 2 (recommended) | Wordnik, Wiktionary, WordNet, contemporary frequency lists |
| 3 (optional) | ConceptNet, premium dictionary APIs, additional prosody databases |


---

## Related ideas

- [Generative Note Library](generative-note-library.md)
- [Notes to Prose](../thoughts/notes-to-prose.md)
- [Note Capture Pipeline](external/note-capture-pipeline.md)
- [Voice-to-Note](external/voice-to-note.md)
- [Notebook Decomposition & Publishing](external/notebook_decomposition_publishing_system_design_doc.md)
