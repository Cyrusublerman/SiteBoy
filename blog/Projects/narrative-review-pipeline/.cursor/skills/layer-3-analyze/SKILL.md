---
name: layer-3-analyze
description: Analyze themed documents to find indicators for research questions. Use after Layer 2 to identify evidence relevant to RQs.
---

# Layer 3: Indicator Analysis

> **First:** Read `PROJECT_CONFIG.md`. You need:
> - The exact text of each RQ
> - The Theme → RQ mapping
> - The context priority table

Analyze themed documents to find indicators of answers to research questions. This is where interpretation begins.

## When to Use

- After Layer 2 compilation is complete
- Need to identify RQ-relevant evidence
- Preparing for qualitative assessment

## Prerequisites

Layer 2 must be complete. Check for:
- `extractions/[AuthorYear]/layer2/` folder exists
- Contains T1-T8 theme files

## Research Questions

Read RQ1–RQ4 from `PROJECT_CONFIG.md`. Do not use placeholder text from this file.

## Instructions

### Process

For each RQ:
1. Read the theme files specified in the PROJECT_CONFIG Theme → RQ Mapping
2. Identify indicators (evidence that helps answer the RQ)
3. Categorize and rate indicators
4. Note gaps

### Output Files

Save to `extractions/[AuthorYear]/layer3/`:
- `RQ1_indicators.md`
- `RQ2_indicators.md`
- `RQ3_indicators.md`
- `RQ4_indicators.md`

(One file per RQ defined in PROJECT_CONFIG.)

---

## Indicator Strength

| Strength | Criteria |
|----------|----------|
| STRONG | Direct statement with data or empirical evidence |
| MODERATE | Clear statement without strong quantitative backing |
| WEAK | Implied, indirect, or single-sentence reference |

---

## Output Format (all RQs)

```markdown
# RQ[X]: [Paste exact RQ text from PROJECT_CONFIG.md]

## Paper: [AuthorYear]

### Positive Indicators (evidence the answer is YES / the phenomenon is present)

1. **Indicator:** [what the evidence shows]
   - Quote: "[exact text]"
   - Strength: [STRONG/MODERATE/WEAK]
   - Source: [theme file]

### Negative Indicators (evidence the answer is NO / the phenomenon is absent)

1. **Indicator:** [what the evidence shows]
   - Quote: "[exact text]"
   - Strength: [STRONG/MODERATE/WEAK]
   - Source: [theme file]

### Measures Mentioned

1. **Measure:** [name or description]
   - Quote: "[exact text]"

### Definitions Mentioned

1. **Definition:** [how the key concept is defined]
   - Quote: "[exact text]"

### RQ[X] Coverage
- [ ] Paper directly addresses this RQ
- [ ] Paper provides measurable indicators
- [ ] Paper defines key criteria
- [ ] LIMITED EVIDENCE for this RQ
```

---

## RQ-Specific Guidance

### For readiness / preparedness RQs
Look for: evidence trainees ARE prepared (positive), evidence they are NOT (negative), measures of readiness used, definitions of "ready" or "prepared", competencies expected at transition.

### For standardisation / consistency RQs
Look for: evidence of consistent approaches across sites, evidence of variation or inconsistency, national standards or frameworks mentioned, accreditation requirements, comparisons between programs.

### For international / comparative RQs
Look for: approaches from other contexts, direct comparisons between systems, best practices described from elsewhere, transferable elements, context-specific caveats.

Weight evidence by context priority defined in PROJECT_CONFIG.

### For barriers / enablers RQs
Look for: specific barriers named, specific enablers named, level at which they operate (individual / program / workplace / system), whether domain-specific or general, evidence strength.

---

## Barrier/Enabler Levels

| Level | Examples |
|-------|----------|
| Individual | Motivation, time, confidence, prior experience |
| Program | Curriculum space, faculty, resources, structure |
| Workplace | Culture, opportunities, workload, supervision |
| System | Policy, funding, accreditation, workforce |

---

## Quality Rules

1. **Quote supporting evidence** — every indicator needs a quote
2. **Rate honestly** — don't inflate strength
3. **Note gaps** — mark limited evidence clearly
4. **Check sources** — verify quotes match theme files
5. **Don't invent** — only report what's in the extracts

## Next Step

After completing Layer 3 for all RQs, invoke `/layer-4-assess`
