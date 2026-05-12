---
name: layer-5-rereview
description: Return to original paper to fill gaps identified in assessment. Use after Layer 4 to strengthen evidence and verify interpretations.
---

# Layer 5: Targeted Re-Review

Return to original paper to fill gaps, strengthen weak evidence, and verify interpretations.

## When to Use

- After Layer 4 assessment identifies gaps
- Evidence was rated WEAK and needs strengthening
- Interpretations need verification against source

## Prerequisites

Layer 4 must be complete. Check for:
- `extractions/[AuthorYear]/layer4/assessment.md` exists
- Assessment contains "Gaps for Re-Review" section

## Critical Principle

This layer prevents the common LLM failure of missing important content on first pass. By returning to the paper with specific targets, we catch what was missed.

## Instructions

### Input Required

1. Layer 4 assessment (for gaps list)
2. Original paper text

### Process

For each gap identified:
1. Read the gap description
2. Search original paper for relevant content
3. Extract new evidence or confirm absence
4. Update assessment

### Output Files

Save to `extractions/[AuthorYear]/layer5/`:
- `gaps_filled.md`
- `evidence_strengthened.md`
- `interpretations_verified.md`
- `assessment_enhanced.md` (updated copy of Layer 4)

---

## Gap Filling Process

### Step 1: List All Gaps

From Layer 4 assessment, extract:
- Questions not yet answered
- Weak evidence claims
- Interpretations needing verification

### Step 2: Search Original Paper

For each gap:

```markdown
## Gap: [description from Layer 4]

### Search Target
[What evidence would fill this gap]

### Sections Searched
- [x] Abstract
- [x] Introduction
- [x] Methods
- [x] Results
- [x] Discussion
- [x] Conclusion

### Evidence Found

**Quote 1:**
"[exact quote from paper]"
- Location: [section, paragraph if helpful]
- Relevance: [how this addresses the gap]

### Gap Status
- [ ] FILLED: Found direct evidence
- [ ] PARTIALLY FILLED: Found related evidence
- [ ] NOT ADDRESSED: Paper does not address this
- [ ] CONFIRMED ABSENCE: Paper explicitly states no evidence
```

### Step 3: Strengthen Weak Evidence

For each weak claim:

```markdown
## Weak Claim: [claim from assessment]

### Current Evidence
"[quote that was rated WEAK]"

### Additional Evidence Found

**Supporting Quote 1:**
"[new quote]"
- How it supports: [explanation]

**Counter-Evidence Found:**
"[any contradicting quote]"
- Challenge: [how it complicates the claim]

### Revised Evidence Strength
- [ ] STRONG (upgraded)
- [ ] MODERATE (upgraded)
- [ ] WEAK (unchanged)
- [ ] INSUFFICIENT (downgraded — counter-evidence found)

### Revised Claim (if needed)
[Adjusted claim based on new evidence]
```

### Step 4: Verify Interpretations

For each interpretation flagged:

```markdown
## Interpretation: [statement from assessment]

### Based On
"[original quote used]"

### Full Context
[Paste larger section around the quote — 2-3 paragraphs]

### Verification

**Accuracy:** [ACCURATE / PARTIALLY ACCURATE / INACCURATE]

**Reasoning:** [Why this rating]

**Revised Interpretation (if needed):**
[Corrected version]

**Additional Context:**
[Anything from fuller reading that changes meaning]
```

---

## Enhanced Assessment Template

After completing re-review, create updated assessment:

```markdown
# Enhanced Assessment: [AuthorYear]

## Changes from Initial Assessment

### Gaps Filled
| Gap | Status | Impact on Assessment |
|-----|--------|---------------------|
| [gap 1] | FILLED | [how it changes things] |
| [gap 2] | NOT ADDRESSED | [confirmed limitation] |

### Evidence Strengthened
| Claim | Original | Revised | Change |
|-------|----------|---------|--------|
| [claim] | WEAK | MODERATE | [new quote added] |

### Interpretations Revised
| Original | Revised | Reason |
|----------|---------|--------|
| [old] | [new] | [why changed] |

---

## Updated RQ Contributions

[Copy and update relevant sections from Layer 4 assessment, incorporating new evidence]

### RQ1 (UPDATED)
[Updated assessment with new evidence integrated]

### RQ2 (UPDATED)
[Updated assessment]

### RQ3 (UPDATED)
[Updated assessment]

### RQ4 (UPDATED)
[Updated assessment]

---

## Revised Overall Assessment

### Primary Contribution
[May have changed based on new evidence]

### Quality Rating
- Previous: [MODERATE]
- Revised: [HIGH/MODERATE/LOW]
- Reason for change: [if any]

### Updated One-Liner
[Revised 15-25 word summary]

---

## Remaining Gaps

After re-review, these gaps remain unfilled:
1. [gap that paper genuinely doesn't address]
2. [gap confirmed as limitation]

These are TRUE GAPS in the paper's coverage, not extraction failures.

---

## Extraction Complete

- Layer 5 completed: [date]
- Gaps addressed: [X of Y]
- Evidence strengthened: [X claims]
- Interpretations verified: [X of Y]
- Ready for cross-paper synthesis: YES
```

---

## Search Strategies

### For missing readiness / preparedness evidence
Search terms: ready, prepared, competent, transition, independent, role, early career
Likely locations: Discussion, Conclusion, Results

### For missing standardisation / consistency evidence
Search terms: standard, consistent, variable, different, accredit, require, curriculum
Likely locations: Background, Methods, Discussion

### For missing comparative / international content
Search terms: country names, international, comparison, abroad, equivalent, context
Likely locations: Background, Introduction, Discussion

### For missing barriers/enablers
Search terms: challenge, barrier, obstacle, difficult, support, facilitat, enable, help
Likely locations: Results, Discussion, Conclusion

---

## Quality Rules

1. **Be thorough** — search entire paper, not just expected sections
2. **Quote exactly** — new evidence needs exact quotes
3. **Acknowledge absence** — if not found, confirm paper doesn't address it
4. **Update honestly** — don't inflate evidence strength
5. **Track changes** — clear record of what changed and why

## Next Step

After completing Layer 5 for all papers, invoke `/layer-6-synthesize`
