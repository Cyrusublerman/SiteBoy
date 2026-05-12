---
name: layer-6-synthesize
description: Synthesize across all papers to answer research questions. Use after all papers complete Layers 1-5.
---

# Layer 6: Cross-Paper Synthesis

> **First:** Read `PROJECT_CONFIG.md` for the review title, RQ texts, and target context.

After all papers are processed through Layers 1-5, synthesize across papers to answer research questions.

## When to Use

- All papers have completed Layers 1-5
- Ready to answer research questions
- Need to identify consensus and contradictions
- Preparing final narrative review sections

## Prerequisites

For ALL papers in the review:
- Layer 5 complete
- `assessment_enhanced.md` exists for each

## Instructions

### Input Required

Gather all Layer 4/5 assessments from all papers.

### Process

For each RQ:
1. Compile relevant sections from all assessments
2. Identify consensus points
3. Identify contradictions
4. Formulate evidence-based answer
5. Note caveats and remaining gaps

### Output Files

Save to `extractions/synthesis/`:
- `RQ1_consensus.md`
- `RQ1_contradictions.md`
- `RQ1_answer.md`
- `RQ2_consensus.md`
- `RQ2_contradictions.md`
- `RQ2_answer.md`
- `RQ3_consensus.md`
- `RQ3_contradictions.md`
- `RQ3_answer.md`
- `RQ4_consensus.md`
- `RQ4_contradictions.md`
- `RQ4_answer.md`
- `master_synthesis.md`

(One set per RQ defined in PROJECT_CONFIG.)

---

## Step 1: Consensus Analysis

### Template: RQ[X]_consensus.md

```markdown
# RQ[X] Consensus Analysis

## Research Question
[Full RQ text from PROJECT_CONFIG.md]

## Papers Contributing
| Paper | Addresses RQ | Direction | Strength |
|-------|-------------|-----------|----------|
| [AuthorYear] | YES/PARTIALLY/NO | [direction] | [STRONG/MOD/WEAK] |

## Consensus Points

### Strong Consensus (most papers agree)

**1. [Statement papers agree on]**
- Supporting papers: [list]
- Number: [X of Y papers]
- Representative quotes:
  - "[quote]" — AuthorYear
  - "[quote]" — AuthorYear
- Confidence: HIGH

### Moderate Consensus (several papers agree)

**1. [Statement several papers support]**
- Supporting papers: [list]
- Number: [X of Y papers]
- Confidence: MODERATE

### Weak Consensus (few papers, or weak evidence)

**1. [Statement with limited support]**
- Supporting papers: [list]
- Number: [X of Y papers]
- Confidence: LOW

## Topics Not Addressed

Papers generally do not discuss:
1. [topic most papers skip]

## Topics with No Consensus

Papers are mixed or silent on:
1. [topic where papers disagree or don't address]
```

---

## Step 2: Contradiction Analysis

### Template: RQ[X]_contradictions.md

```markdown
# RQ[X] Contradiction Analysis

## Research Question
[Full RQ text from PROJECT_CONFIG.md]

## Contradictions Identified

### Contradiction 1: [Brief label]

**Issue:** [What papers disagree about]

**Position A:** [One view]
- Papers: [list]
- Evidence: "[quote]" — AuthorYear

**Position B:** [Opposing view]
- Papers: [list]
- Evidence: "[quote]" — AuthorYear

**Possible Explanations:**
1. [Why might they differ? Context? Methods? Time period?]

**Which is Better Supported:**
- [ ] Position A (stronger evidence)
- [ ] Position B (stronger evidence)
- [ ] EQUAL
- [ ] UNCLEAR

**Resolution for Review:**
[How to handle this in the narrative]

---

## Apparent Contradictions (Resolved)

### 1. [What seemed like contradiction]
**Resolution:** [Why not actually contradictory]

---

## No Major Contradictions

If papers are consistent:
"No significant contradictions identified for RQ[X]."
```

---

## Step 3: Answer Formulation

### Template: RQ[X]_answer.md

```markdown
# RQ[X] Answer

## Research Question
[Full RQ text from PROJECT_CONFIG.md]

---

## Answer Summary

[2-3 paragraph evidence-based answer to the RQ]

---

## Supporting Evidence

### Key Evidence Point 1
**Statement:** [What evidence shows]
- Papers: [which support this]
- Strength: [STRONG/MODERATE/WEAK]
- Representative quote: "[quote]" — AuthorYear

### Key Evidence Point 2
[Continue]

---

## Caveats and Limitations

### Limitations of the Evidence

1. **[Limitation type]:** [Description]
   - Impact: [How this affects our confidence]

### What We Cannot Conclude

Based on the evidence, we cannot determine:
1. [Something the evidence doesn't support concluding]

---

## Remaining Gaps

Future research should address:
1. [Gap in the literature]

---

## Evidence Strength Assessment

**Overall confidence in answer:** [HIGH / MODERATE / LOW]

**Justification:**
- Number of papers addressing RQ: [X of Y]
- Consistency of findings: [consistent / mixed / contradictory]
- Quality of evidence: [empirical / opinion / theoretical]
- Relevance to target context: [direct / indirect]

---

## Contribution to Narrative Review

### Where This Fits
[Which section of the narrative review this answer informs]

### Key Points for Narrative
1. [Point to emphasize]

### Nuances to Include
1. [Important caveat for readers]
```

---

## Step 4: Master Synthesis

### Template: master_synthesis.md

```markdown
# Master Synthesis: Narrative Review Findings

## Review Overview

**Title:** [From PROJECT_CONFIG.md]
**Papers Analyzed:** [X]
**Primary Analysis Complete:** [date]

---

## Research Question Answers

### RQ1: [Full RQ text]

**Short Answer:** [1-2 sentences]
**Evidence Strength:** [HIGH/MODERATE/LOW]
**Key Points:**
- [Point 1]
- [Point 2]
**Primary Contributors:** [papers that most informed this answer]

---

### RQ2: [Full RQ text]

[Same structure]

---

### RQ3: [Full RQ text]

[Same structure]

---

### RQ4: [Full RQ text]

[Same structure]

---

## Cross-Cutting Themes

### Theme 1: [Emergent theme across RQs]
[Description and supporting papers]

### Theme 2: [Another theme]
[Description]

---

## Overall Narrative

[3-5 paragraph synthesis weaving together all RQ answers into a coherent account]

---

## Implications

### For Practice
1. [Implication]

### For Policy
1. [Implication]

### For Future Research
1. [Gap to address]

---

## Paper Contribution Summary

| Paper | Primary RQ | Quality | Key Contribution |
|-------|-----------|---------|------------------|
| [AuthorYear] | RQ[X] | [HIGH/MOD/LOW] | [one-liner] |

---

## Extraction Completion

- Total papers: [X]
- Papers with full extraction: [X]
- Synthesis completed: [date]
```

---

## Synthesis Quality Rules

1. **Ground in evidence** — every statement needs paper support
2. **Acknowledge uncertainty** — rate confidence honestly
3. **Show disagreement** — don't hide contradictions
4. **Stay focused on RQs** — don't drift to tangential findings
5. **Connect to target context** — keep review purpose central
6. **Note gaps** — what can't be answered is valuable information
7. **No synthesis from training data** — only sourced quotes from included papers count as evidence

## Output for Narrative Review

The master synthesis provides raw material for:
- Introduction (context, gaps)
- Thematic sections (organized by RQ or theme)
- Discussion (synthesis, implications)
- Limitations (caveats, gaps)
- Conclusion (key answers)
