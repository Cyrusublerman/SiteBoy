# Generative Note Library System
**Status:** SPEC | **Cluster:** personal-notes


A personal system for capturing, classifying, processing, storing, and reusing notes and artefacts as structured generative material — for writing, analysis, diagram reconstruction, research development, visual asset management, and procedural generation.

See also:
- `tools/external/note-capture-pipeline.md` — phone/external capture UI and routing.
- `tools/external/voice-to-note.md` — voice capture interface.
- `thoughts/notes-to-prose.md` — early brainstorming on note-to-writing pipeline.

---

## Problem

Conventional note systems fail in two ways:
1. Capture is easy; categorisation is deferred → growing backlog of ambiguous, inert material.
2. Notes stored as flat text/images → searchable only superficially; semantic structure, phonetic character, and downstream-use potential are not made explicit.

This system treats notes as **reusable material objects**, not passive records.

---

## Architecture

| Layer | Responsibility |
|---|---|
| Input | Acquisition + immediate classification |
| Processing & storage | Normalisation, cleanup, feature extraction, relationship mapping, persistence |
| Output | Retrieval, transformation, assisted composition, procedural generation |
| Rare-word lexicon (subsystem) | Structured rare-word storage, linkage, retrieval, and lexical influence on output |

---

## Design principles

1. **Categorisation at intake is mandatory.** Context is strongest at capture time.
2. **Capture is subordinate to routing.** Purpose of capture = route material to the correct treatment path.
3. **Pipeline is independent of input form.** A phone photo may become a diagram object, writing fragment, or visual asset.
4. **Raw artefacts must always be preserved.** All processing is reversible at the archival level.
5. **Notes are multi-valued objects.** A note may simultaneously function as: remembered artefact, semantic unit, phonetic unit, lexical unit, project object, research object, procedural building block.
6. **Library must support both curation and generation.** Complete when material can be retrieved, ranked, recombined, and transformed — not merely when it is searchable.
7. **High-friction metadata is unacceptable at intake.** Only essential triage decisions at capture; detailed annotation deferred.
8. **Rare-word lexicon is a generative subsystem, not a lookup aid.** Exerts controlled lexical pressure on output writing.

---

## Input modes

`screenshot` | `cropped screenshot` | `highlighted capture` | `typed note` | `spoken note` | `notebook page photo` | `doodle photo` | `diagram photo` | `graph photo` | `mixed capture`

### Intake — mandatory fields
`form` | `content_type` | `pipeline` | `destination` | `project_or_context`

### Intake — optional enrichments
`tags` | `note text` | `expand-later flag` | `research-later flag` | `attached instructions`

### Intake triage model
Three questions, answered rapidly with minimum friction:
1. What is this? (form classification)
2. Where does it belong? (content + destination)
3. What should happen to it next? (pipeline)

---

## Pipelines

| Pipeline | Purpose | Typical outputs |
|---|---|---|
| Writing | Prose, lyrics, titles, compositional fragments | Phrase banks, line banks, ranked writing candidates |
| Diagram | Hand-drawn diagrams, system maps, flowcharts | Vector diagrams, structured graph specs, Python plotting code |
| Research-further | Incomplete understanding, unresolved inquiry | Research questions, topic clusters, follow-up cards |
| Concept-development | Abstract ideas not ready for execution | Concept banks, expandable idea clusters, thematic networks |
| Visual asset | Doodles, sketches, visual motifs | Cleaned raster assets, vector traces, motif libraries |
| Task | Notes implying direct action | Task objects, project action lists |
| Archive-only | Preserve without extensive processing | Indexed archives |

---

## Processing stages

1. **Normalisation** — Convert to common internal representation (OCR, transcription, segmentation, label extraction, raw asset preservation).
2. **Cleanup** — Cropping, thresholding, quantisation, denoising, page straightening, rough formatting inference.
3. **Structured categorisation** — Refine themes, subtypes, project linkages, emotional tone, intended use, review status.
4. **Feature extraction** — Semantic features, phonetic features, structural features, lexical linkages.
5. **Relationship mapping** — Link objects by: semantic similarity/contrast, rhyme/meter compatibility, shared project/theme/imagery, output-use history.

---

## Canonical note object

```
id, timestamp, form, source_mode,
raw_asset_paths, processed_asset_paths,
ocr_text, transcript_text, clean_text, note_body,
content_type, subtype, pipeline, destination,
project, tags, themes, status,
needs_review, needs_expansion, needs_research,
semantic_features, phonetic_features, structural_features,
lexical_links, related_items,
source_metadata, output_history, confidence_scores
```

**Mandatory minimum:** `id`, `timestamp`, `form`, `content_type`, `pipeline`, `destination`, `project`, `status`

**Status values:** `raw-categorised` | `normalised` | `cleaned` | `structured` | `enriched` | `review-needed` | `output-ready` | `archived`

---

## Content taxonomy

**Primary content types:** `idea` | `lyric_fragment` | `prose_fragment` | `word` | `phrase` | `concept` | `research_note` | `question` | `diagram` | `graph` | `doodle` | `reference` | `task` | `image_asset`

**Structural types:** `list` | `paragraph` | `grouped_paragraphs` | `heading_bullets` | `isolated_line` | `page_cluster` | `image_only` | `text_only` | `mixed_media`

**Functional intents:** `capture_for_later` | `develop_for_writing` | `develop_for_research` | `develop_for_project` | `convert_to_diagram` | `archive_only` | `review_later`

---

## Semantic features
`topic`, `theme`, `domain`, `sentiment`, `emotional_tone`, `imagery_field`, `abstraction_level`, `specificity_level`, `ambiguity_level`, `inference_density`, `semantic_similarity_neighbourhood`, `semantic_contrast_neighbourhood`, `novelty`, `metaphorical_openness`

## Phonetic features
`syllable_count`, `stress_pattern`, `meter_profile`, `end_rhyme_family`, `internal_rhyme_potential`, `slant_rhyme_potential`, `vowel_pattern`, `consonant_pattern`, `assonance_density`, `consonance_density`, `alliteration_profile`, `cadence_shape`, `word_length_pattern`, `sonic_intensity`, `mouthfeel_profile`

Special case: homophones and near-homophones — elevated value for lyric/prose generation where semantic doubling or dual inference is possible.

---

## Rare-word lexicon subsystem

Purpose: generate writing that is obscure, estranged, archaic, or technically dense while remaining controlled.

**Lexicon object per entry:**
```
word, part_of_speech, definition, secondary_definitions,
etymology, rarity_score, foreignness_score, texture_score,
ambiguity_score, replaceability_score, register, domain, tone,
imagery_tags, phonetic_profile, syllable_count, stress_pattern,
rhyme_family, assonance_profile, consonance_profile,
semantic_neighbours, semantic_opposites,
common_equivalents, obscure_equivalents,
example_uses, notes
```

**Use modes:** rare substitution | tonal infusion | lexical estrangement | phonetic enrichment | register shifting | semantic drift via controlled obscure alternatives.

**Control parameters:** `rarity_weight`, `semantic_fidelity`, `phonetic_richness`, `ambiguity_weight`, `register_consistency`, `foreignness_weight`, `comprehensibility_floor` (prevents incoherence).

---

## Storage zones

| Zone | Contents |
|---|---|
| Raw | Original artefacts exactly as captured |
| Processed | Cleaned images, OCR outputs, transcripts, segmented regions, vector drafts |
| Structured | Canonical note objects + metadata |
| Feature | Semantic, phonetic, structural, lexical derivations |
| Lexicon | Rare-word entries and relationship structures |
| Output-ready | Enriched material ready for direct retrieval and generation |
| Relationship layer | Cross-object links (not folder-dependent) |

---

## Retrieval dimensions

`project`, `tag`, `content_type`, `pipeline`, `theme`, `topic`, `imagery`, `semantic_similarity`, `semantic_contrast`, `emotional_tone`, `rarity`, `ambiguity`, `phonetic_profile`, `rhyme_family`, `meter_compatibility`, `lexical_register`, `output_readiness`

Example queries:
- Lines matching a target syllable count and mood.
- Notes semantically near a given phrase.
- Fragments with high ambiguity and rare diction.


---

## Related ideas

- [Notes to Prose](../thoughts/notes-to-prose.md)
- [Rare-Word Poem Generator](rare-word-poem-generator.md)
- [Note Capture Pipeline](external/note-capture-pipeline.md)
- [Voice-to-Note](external/voice-to-note.md)
- [Notebook Decomposition & Publishing](external/notebook_decomposition_publishing_system_design_doc.md)
