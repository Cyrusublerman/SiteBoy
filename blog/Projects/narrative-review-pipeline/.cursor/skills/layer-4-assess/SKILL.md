---
name: layer-4-assess
description: Synthesize indicators into qualitative assessment of paper contribution. Use after Layer 3 to create overall paper assessment.
---

# Layer 4: Qualitative Assessment

> **First:** Read `PROJECT_CONFIG.md` for RQ texts and the target context (used in transferability ratings).

Synthesize indicators into an initial qualitative assessment. Make judgments about what this paper contributes.

## When to Use

- After Layer 3 indicator analysis is complete
- Need to summarize paper's contribution
- Identifying gaps for re-review

## Prerequisites

Layer 3 must be complete. Check for:
- `extractions/[AuthorYear]/layer3/` folder exists
- Contains one indicator file per RQ

## Instructions

### Input Required

Read all Layer 3 indicator files for the paper.

### Process

1. Review all indicators for each RQ
2. Synthesize into overall assessment
3. Make quality judgments
4. Identify specific gaps for Layer 5 re-review

### Output Files

Save to `extractions/[AuthorYear]/layer4/`:
- `assessment.md`

---

## Assessment Template

```markdown
# Paper Assessment: [AuthorYear]

## Paper Identity

- **Title:** [full title]
- **Authors:** [lead author et al.]
- **Year:** [publication year]
- **Country:** [primary country/countries]
- **Type:** [empirical study / review / commentary / framework / guidelines]
- **Setting:** [training level, specialty, institution type]

---

## Contribution to Research Questions

### RQ1: [Paste RQ1 text from PROJECT_CONFIG.md]

**Addresses this RQ:** [YES / PARTIALLY / NO]

**Direction of evidence:**
- [ ] POSITIVE (phenomenon present / answer is yes)
- [ ] NEGATIVE (phenomenon absent / answer is no)
- [ ] MIXED EVIDENCE
- [ ] UNCLEAR

**Evidence strength:** [STRONG / MODERATE / WEAK]

**Key contribution:** [1-2 sentences summarizing what this paper adds to RQ1]

**Supporting indicators:**
- [List key indicators from Layer 3]

---

### RQ2: [Paste RQ2 text from PROJECT_CONFIG.md]

**Addresses this RQ:** [YES / PARTIALLY / NO]

**Direction of evidence:**
- [ ] POSITIVE
- [ ] NEGATIVE
- [ ] MIXED EVIDENCE
- [ ] UNCLEAR

**Evidence strength:** [STRONG / MODERATE / WEAK]

**Key contribution:** [1-2 sentences]

**Supporting indicators:**
- [List key indicators from Layer 3]

---

### RQ3: [Paste RQ3 text from PROJECT_CONFIG.md]

**Addresses this RQ:** [YES / PARTIALLY / NO]

**Comparison type:**
- [ ] DIRECT CROSS-CONTEXT COMPARISON
- [ ] DESCRIBES ONE CONTEXT IN DETAIL
- [ ] THEORETICAL/FRAMEWORK ONLY
- [ ] NO COMPARATIVE CONTENT

**Transferability to [TARGET_CONTEXT from PROJECT_CONFIG.md]:** [HIGH / MEDIUM / LOW / N/A]

**Key contribution:** [1-2 sentences]

**Supporting indicators:**
- [List key indicators from Layer 3]

---

### RQ4: [Paste RQ4 text from PROJECT_CONFIG.md]

**Addresses this RQ:** [YES / PARTIALLY / NO]

**Balance:**
- [ ] MORE BARRIERS IDENTIFIED
- [ ] MORE ENABLERS IDENTIFIED
- [ ] BALANCED
- [ ] LIMITED CONTENT

**Evidence strength:** [STRONG / MODERATE / WEAK]

**Key contribution:** [1-2 sentences]

**Key barriers identified:**
- [List from Layer 3]

**Key enablers identified:**
- [List from Layer 3]

---

## Overall Assessment

### Primary Contribution

This paper primarily contributes to: **[RQ1 / RQ2 / RQ3 / RQ4]**

### Quality Rating

**Overall quality:** [HIGH / MODERATE / LOW]

**Justification:**
- Methodology: [strong/adequate/weak]
- Evidence base: [empirical data / expert opinion / theoretical]
- Relevance to target context: [direct / indirect / peripheral]

### One-Liner Summary

[15-25 word summary of what this paper contributes to the review]

---

## Gaps for Re-Review (Layer 5)

### Questions Not Yet Answered

These questions could potentially be answered by returning to the original paper:

1. **Gap:** [specific question]
   - **Why important:** [relevance to RQs]
   - **Where to look:** [suggested sections to re-read]

2. **Gap:** [specific question]
   - **Why important:** [relevance]
   - **Where to look:** [sections]

### Weak Evidence Needing Strengthening

These claims were made but evidence was rated WEAK:

1. **Claim:** [claim from assessment]
   - **Current evidence:** [what we have]
   - **What would strengthen:** [what to look for]

### Interpretations Needing Verification

These interpretations should be checked against original text:

1. **Interpretation:** [what we concluded]
   - **Risk:** [what might be wrong]
   - **Check by:** [what to verify]

---

## Extraction Metadata

- **Layer 1 completed:** [date/status]
- **Layer 2 completed:** [date/status]
- **Layer 3 completed:** [date/status]
- **Layer 4 completed:** [date/status]
- **Ready for Layer 5:** [YES/NO]
```

---

## Decision Rules

### Addresses RQ?

| Rating | Criteria |
|--------|----------|
| YES | Multiple relevant indicators, direct discussion |
| PARTIALLY | Some indicators, indirect discussion |
| NO | No indicators or only tangential mention |

### Evidence Strength?

| Rating | Criteria |
|--------|----------|
| STRONG | Empirical data, multiple strong indicators |
| MODERATE | Clear statements, few or moderate indicators |
| WEAK | Indirect, implied, or single weak indicator |

### Quality Rating?

| Rating | Criteria |
|--------|----------|
| HIGH | Strong methodology, empirical data, directly relevant |
| MODERATE | Adequate methodology OR strong relevance |
| LOW | Weak methodology AND indirect relevance |

### Transferability?

| Rating | Criteria |
|--------|----------|
| HIGH | Same specialty and similar system as target context |
| MEDIUM | Same specialty OR similar system (not both) |
| LOW | Different specialty AND different system |

---

## Gap Identification Rules

### Good Gaps (worth pursuing)

- Specific, answerable questions
- Related to RQs
- Likely to have evidence in paper
- Would change assessment if answered

### Bad Gaps (don't pursue)

- Vague or broad questions
- Paper clearly doesn't address
- Already have strong evidence
- Tangential to RQs

## Next Step

After completing Layer 4, invoke `/layer-5-rereview`
