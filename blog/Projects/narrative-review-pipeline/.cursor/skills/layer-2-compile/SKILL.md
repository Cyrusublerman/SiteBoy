---
name: layer-2-compile
description: Compile Layer 1 extracts into themed documents. Use after Layer 1 extraction is complete to organize findings by theme.
---

# Layer 2: Thematic Compilation

> **First:** Read `PROJECT_CONFIG.md` → Layer 2 Themes section. Use the themes defined there; defaults are listed below.

Organize Layer 1 outputs into themed documents. Still no interpretation — just sorting.

## When to Use

- After Layer 1 extraction is complete
- Need to organize extracts by theme
- Preparing for indicator analysis

## Prerequisites

Layer 1 must be complete. Check for:
- `extractions/[AuthorYear]/layer1/` folder exists
- Contains quotes, facts, claims, entities files

## Instructions

### Input Required

Read all Layer 1 output files for the paper.

### Process

For each theme (T1-T8):
1. Read theme definition
2. Scan all Layer 1 extracts
3. Copy matching extracts to theme file
4. Preserve original format and source labels

### Output Files

Save to `extractions/[AuthorYear]/layer2/`:
- `T1_[theme].md`
- `T2_[theme].md`
- `T3_[theme].md`
- `T4_[theme].md`
- `T5_[theme].md`
- `T6_[theme].md`
- `T7_[theme].md`
- `T8_[theme].md`

Theme names come from `PROJECT_CONFIG.md`. Default names shown below.

---

## Default Theme Definitions

### T1: Core Phenomenon
**Include if extract mentions:**
- The central concept being studied (e.g. leadership, patient safety, well-being)
- Definitions, theories, or models of that concept
- Competencies or components of the concept
- What practitioners do or should do regarding it

### T2: Training / Intervention
**Include if extract mentions:**
- Training programs or curricula
- Education methods or approaches
- Workshops, courses, rotations
- Faculty development
- Learning objectives or pedagogical approaches

### T3: Assessment
**Include if extract mentions:**
- Assessment tools or instruments
- Evaluation methods
- Competency measurement
- Feedback mechanisms
- Performance review, milestones, or benchmarks

### T4: Barriers
**Include if extract mentions:**
- Obstacles or challenges
- Difficulties or problems
- What prevents development
- Negative factors, gaps, or deficits
- Constraints or limitations

### T5: Enablers
**Include if extract mentions:**
- Facilitators or supports
- Success factors or what helps development
- Positive factors, opportunities
- Resources or institutional supports

### T6: Transition / Outcome
**Include if extract mentions:**
- Role change or career-stage effects
- Readiness or preparedness
- Independence or competence at transition
- Early career experiences
- Outcome data linked to training

### T7: Context
**Include if extract mentions:**
- Country or health system
- Institutional setting
- Cultural or organizational context
- Policy environment
- Specialty-specific or population-specific factors

### T8: Recommendations
**Include if extract mentions:**
- Author suggestions or implications for practice
- Future directions
- What should be done
- Policy or research recommendations

---

## Output Format

For each theme file:

```markdown
# T[X]: [Theme Name]

## Source: [AuthorYear]

### From [section]_quotes.md

TOPIC: [original topic]
QUOTE: "[original quote]"
---

### From [section]_claims.md

CLAIM: [original claim]
TYPE: [original type]
QUOTE: "[original quote]"
---

[Continue for all matching extracts]

---
IF NO MATCHING EXTRACTS:
## No extracts for this theme
```

---

## Sorting Rules

1. **One extract can appear in multiple themes** — a quote about barriers to mentorship goes in T2, T4, and T5
2. **Preserve original format** — copy exactly as extracted
3. **Add source labels** — note which L1 file the extract came from
4. **Don't interpret** — if unclear whether it fits, include it
5. **Empty is okay** — some themes may have no extracts for some papers

## Quality Check

After compilation:
- Every L1 extract should appear in at least one theme
- No extracts should be lost
- Source labels should be accurate

## Next Step

After completing Layer 2, invoke `/layer-3-analyze`
