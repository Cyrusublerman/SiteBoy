# A 6-Layer Extraction Pipeline for AI-Assisted Narrative Review

*How structured agent skills replaced ad-hoc prompting and produced traceable, reproducible synthesis across 26 papers*

---

## The Problem with "Just Ask the AI"

The standard workflow for AI-assisted literature review goes something like this: paste a paper, ask GPT to summarize it, repeat 26 times, then ask it to synthesize the summaries. This produces output quickly. It also produces several silent failure modes:

- **Selective extraction**: the model retrieves evidence that confirms patterns already established in earlier papers
- **Interpretation drift**: claims made in paper 3 start shaping how paper 15 is read
- **Untraceable conclusions**: a finding appears in the synthesis with no recoverable path back to a source quote
- **Missed content**: first-pass extraction on a dense methods section reliably misses evidence buried in footnotes or secondary tables

For a narrative review of 26 papers spanning five countries and 22 years on psychiatric leadership training, these failure modes were unacceptable. The review needed to be defensible at sentence level — every finding linkable to a specific quote, every claim rated for strength, every gap explicitly named.

The solution was a 6-layer extraction pipeline, implemented as Cursor agent skills, where each layer has a single defined responsibility and outputs a specific file set that becomes the input for the next layer.

---

## Architecture Overview

```
LAYER 1 → LAYER 2 → LAYER 3 → LAYER 4 → LAYER 5 → LAYER 6
Extract    Compile   Analyze   Assess    Re-review  Synthesize
(atomic)   (themed)  (map RQs) (judge)   (gap-fill) (cross-paper)
```

Each layer enforces a strict constraint on what the agent is allowed to do. The most important constraint: **no interpretation before Layer 3**.

---

## Layer 1: Atomic Extraction

**Instruction to agent**: extract, do not analyze.

Layer 1 runs four parallel subtasks against each paper section (Abstract, Introduction, Methods, Results, Discussion, Conclusion):

| Subtype | Definition |
|---------|-----------|
| **QUOTES** | Exact sentences mentioning 7 predefined topic areas |
| **FACTS** | Statements presented as true (distinguished from opinion) |
| **CLAIMS** | Author assertions, typed as FINDING / ARGUMENT / RECOMMENDATION / OPINION |
| **ENTITIES** | Named things: frameworks, tools, programs, organizations, places |

Each output uses a rigid three-field schema:

```
CLAIM: [what author claims]
TYPE: [FINDING / ARGUMENT / RECOMMENDATION / OPINION]
QUOTE: "[supporting text]"
---
```

The quote field is non-optional. If there is no verbatim supporting text, the item does not get recorded. This single rule eliminates a class of hallucination where models assert things papers don't say.

**Output**: 4 files per section × 6 sections = up to 24 files per paper, saved to `extractions/AuthorYear/layer1/`.

**Why atomic?** Summaries compress and lose information. Atoms preserve all information and let later layers make the interpretive decisions.

---

## Layer 2: Thematic Compilation

**Instruction to agent**: sort, do not judge.

Layer 2 reads every Layer 1 file and sorts extracts into 8 predefined themes:

| Code | Theme |
|------|-------|
| T1 | Leadership (concepts, competencies, definitions) |
| T2 | Training (programs, pedagogy, curriculum) |
| T3 | Assessment (tools, measures, feedback) |
| T4 | Barriers (obstacles, constraints, gaps) |
| T5 | Enablers (facilitators, supports, opportunities) |
| T6 | Transition (readiness, career change, independence) |
| T7 | Context (country, system, institution, policy) |
| T8 | Recommendations (what authors propose) |

An extract can appear in multiple themes — a quote about barriers to mentorship legitimately belongs in T2, T4, and T5. The rule is: if in doubt, include. No extraction is discarded at this stage.

**Why 8 themes?** They were derived from the four research questions (RQs) and their anticipated subcategories. Each RQ maps to primary and secondary themes, which determines which files Layer 3 reads:

| RQ | Primary themes | Secondary themes |
|----|----------------|------------------|
| RQ1 (readiness) | T6 | T3, T1 |
| RQ2 (standardisation) | T2, T7 | T3 |
| RQ3 (international) | T1, T2, T7 | all |
| RQ4 (barriers/enablers) | T4, T5 | all |

**Output**: 8 `.md` files per paper at `extractions/AuthorYear/layer2/`.

---

## Layer 3: Indicator Analysis

**Instruction to agent**: interpret, but only against the RQs.

This is where interpretation begins. Layer 3 reads the themed files and identifies *indicators* — pieces of evidence that point toward an answer to a research question. Each indicator is rated:

| Strength | Criteria |
|----------|----------|
| STRONG | Direct statement with data or empirical evidence |
| MODERATE | Clear statement without strong quantitative backing |
| WEAK | Implied, indirect, or single-sentence reference |

Each indicator requires a quote, a source reference (which theme file), and a strength rating. The output format makes the epistemic status explicit:

```markdown
### Negative Indicators (evidence of unreadiness)

1. **Indicator:** Fellows self-rate leadership preparation as "adequate but no more"
   - Quote: "despite at least 90% of registrars receiving formal training,
     fellows rated themselves as inadequately prepared across all management
     services competencies"
   - Strength: STRONG
   - Source: T6_transition.md
```

Layer 3 also records *coverage* — a checklist of whether the paper directly addresses each RQ, provides measurable indicators, or offers only peripheral content. This prevents thin evidence from being weighted equally with direct evidence during synthesis.

**Output**: 4 files per paper at `extractions/AuthorYear/layer3/` (one per RQ).

---

## Layer 4: Qualitative Assessment

**Instruction to agent**: judge the paper's contribution.

Layer 4 synthesizes the four indicator files into a single structured assessment. It makes four classes of judgment:

1. **Addresses RQ?** — YES / PARTIALLY / NO (with defined criteria for each)
2. **Evidence strength** — STRONG / MODERATE / WEAK (across all indicators for that RQ)
3. **Overall quality rating** — HIGH / MODERATE / LOW (combining methodology and relevance)
4. **Transferability to RANZCP** — HIGH / MEDIUM / LOW (for international papers)

The assessment also produces a **gaps list**: specific, answerable questions that could be resolved by returning to the original paper. These are not vague ("could the authors say more?") but targeted ("does the methods section specify how leadership competency was operationally defined?").

The gap list feeds Layer 5.

**Output**: `extractions/AuthorYear/layer4/assessment.md`.

---

## Layer 5: Targeted Re-Review

**Instruction to agent**: return to the original paper and fill every gap in Layer 4.

This is the layer that prevents the most common multi-pass failure. After an initial extraction, models tend to be confident in what they found. Layer 5 forces a structured return with a defined target for each gap:

```markdown
## Gap: Does the paper define "leadership readiness" operationally?

### Sections Searched
- [x] Abstract
- [x] Methods
- [x] Discussion

### Evidence Found
"[exact quote if found]"
- Location: [section]
- Relevance: [how this addresses the gap]

### Gap Status
- [ ] FILLED
- [ ] PARTIALLY FILLED
- [x] NOT ADDRESSED: Paper uses the term but does not define it
```

For weak-rated claims, Layer 5 searches for additional supporting quotes and either upgrades the strength rating or, if contradictory evidence is found, revises the claim downward. Counter-evidence is not discarded — it is recorded and propagates to the synthesis.

Layer 5 also produces a **remaining gaps list**: things the paper genuinely does not address. This becomes the evidence base for the Limitations section of the review.

**Output**: 4 files at `extractions/AuthorYear/layer5/` including an `assessment_enhanced.md` that supersedes Layer 4.

---

## Layer 6: Cross-Paper Synthesis

**Instruction to agent**: answer the research questions across all 26 papers.

Layer 6 runs after all papers have completed Layers 1–5. It reads all `assessment_enhanced.md` files and produces three documents per RQ:

- **consensus.md** — points where multiple papers agree, rated by number of contributors and confidence
- **contradictions.md** — genuine disagreements between papers, with resolution strategies
- **answer.md** — a 2–3 paragraph evidence-based answer, with key points, caveats, and remaining gaps

The final output is a `master_synthesis.md` — a structured narrative covering all four RQs, cross-cutting themes, implications for practice, and a paper-contribution table.

The synthesis layer enforces one rule above all others: **every statement requires paper support**. The agent is not permitted to synthesize from its training data; all claims must trace to a file in `extractions/`.

---

## Implementation: Cursor Agent Skills

Each layer is implemented as a `SKILL.md` file — a markdown document with YAML frontmatter and structured instructions that Cursor's agent system can invoke by name.

```yaml
---
name: layer-1-extract
description: Extract atomic facts, quotes, claims, and entities from a paper
  section. Use when starting extraction or when you need raw data from paper text.
---
```

The skill files serve as both documentation and executable specification. They define:
- Prerequisites (what must exist before this layer can run)
- Input requirements (what the user must provide)
- Output schemas (exact file names and formats)
- Quality rules (what the agent must verify before completing)
- Next step (which skill to invoke after)

An orchestrator skill (`extraction-orchestrator`) manages state by reading the file system: if `layer1/` has all four file types, Layer 1 is complete; if `layer4/assessment.md` exists, Layer 4 is done. State is the file system, not agent memory.

**Why skills over prompts?** A prompt is ephemeral and unversioned. A skill file is committed to the repository, editable, and enforces consistent behavior across all 26 paper extractions. When a quality issue is found in paper 14's extraction, the fix is made to the skill file, and papers 15–26 inherit the improvement.

---

## The File System as Database

The full extraction for 26 papers produces roughly:

```
extractions/
├── VanZeistJongman2024/
│   ├── layer1/   # ~24 files
│   ├── layer2/   # 8 files
│   ├── layer3/   # 4 files
│   ├── layer4/   # 1 file
│   └── layer5/   # 4 files
├── [25 more paper folders]
└── synthesis/    # 13 files + master
```

Each `.md` file is human-readable, diff-able, and editable by the researcher at any point. The pipeline is not a black box — every intermediate state is inspectable. If the synthesis produces a claim that seems wrong, the researcher can trace it: `master_synthesis.md` → `RQ1_answer.md` → `assessment_enhanced.md` → `layer3/RQ1_indicators.md` → `layer1/results_quotes.md` → verbatim text.

This is the key property that distinguishes the pipeline from a prompt: **full provenance**.

---

## Design Principles

**Separation of concerns.** Each layer has one epistemic job. Mixing extraction and interpretation in a single pass is the primary source of confirmation bias in AI-assisted synthesis.

**Atoms before composites.** Information is extracted at the most granular level first. Compression (thematic grouping, assessment, synthesis) happens in later passes over verified atomic data, not over summaries.

**Explicit absence.** A gap list is produced at Layer 4 and resolved at Layer 5. Papers that do not address a RQ are explicitly marked as such, not silently omitted. Absence of evidence is data.

**Honest strength ratings.** The STRONG / MODERATE / WEAK taxonomy is enforced by defined criteria, not left to agent judgment. An indicator cannot be rated STRONG without empirical data. This prevents the model from overstating the robustness of opinion-based evidence.

**No synthesis from training data.** Layer 6 is explicitly restricted to extracting patterns from the files in `extractions/`. The agent's prior knowledge about, for example, what CanMEDS is or what UK leadership training typically looks like is not evidence. Only sourced quotes from included papers are evidence.

---

## What This Produced

For this review:
- 326 articles identified, 61 full-text reviewed, 26 included
- 4 research questions answered with explicit confidence ratings
- Every quantitative claim (33% of trainees in practical roles; 89% reporting major transition difficulties; 7% taught by experienced leaders) traced to a specific paper and quote
- A barriers/enablers taxonomy derived from 24 of 26 papers, structured at trainee, program, workplace, and system levels
- A limitations section built from the remaining-gaps output of Layer 5 across all 26 papers — methodological gaps that were not found, not assumed

The pipeline did not eliminate researcher judgment. It *concentrated* it: at Layer 3 (what counts as an indicator?), Layer 4 (how strong is this paper's contribution?), and Layer 6 (how do contradictions get resolved?). Everything else — extraction, sorting, formatting, gap-listing — was delegated to the agent within tight constraints.

---

## Using This Pattern

The 6-layer pattern is generalizable to any narrative synthesis task where:
- Evidence is heterogeneous (different study designs, different countries, different time periods)
- Claims need to be traceable to sources
- The corpus is large enough that single-pass extraction will miss content
- The synthesis needs to distinguish between direct evidence, inferential evidence, and absence of evidence

The skill files, folder conventions, and output schemas are the reusable artifacts. The research questions, theme definitions, and indicator criteria are domain-specific and need to be redefined for each review.

The core constraint — no interpretation until Layer 3, no synthesis until Layer 6, no claim without a quote — is what makes the output defensible. Everything else is implementation detail.
