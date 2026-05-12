---
name: review-limitations
description: Systematically review and compile all limitations, gaps, and caveats across extracted papers and synthesis. Use when assessing review limitations or preparing limitations section.
---

# Review Limitations

> **First:** Read `PROJECT_CONFIG.md` for RQ texts and target context.

Systematically extract and analyze all limitations, gaps, and caveats from the extraction outputs.

## When to Use

- Writing the Limitations section of narrative review
- Assessing evidence quality and gaps
- Identifying areas needing further research
- Evaluating the review's scope and boundaries

## What Limitations to Look For

### Evidence Limitations
- Sample sizes and methodologies
- Geographic coverage (contexts not represented)
- Time periods (recent vs. older studies)
- Study designs (commentary vs. empirical)
- Publication bias (only positive findings?)

### Coverage Limitations
- Gaps in RQ coverage (what couldn't be answered)
- Topics not addressed by literature
- Populations not studied
- Contexts not examined

### Methodological Limitations
- Search strategy boundaries
- Inclusion/exclusion decisions
- Extraction process constraints
- Synthesis approach limitations

### Interpretation Limitations
- Where evidence is weak or contradictory
- Where conclusions are tentative
- Where transferability is uncertain
- Where context-dependence is high

## Where to Find Limitations

### Location 1: Synthesis Files (Most Important)

**In each RQ answer file:** `extractions/synthesis/RQ[1-N]_answer.md`

Look for sections:
- **Caveats and Limitations**
- **What We Cannot Conclude**
- **Remaining Gaps**
- **Evidence Strength Assessment** (if MODERATE or WEAK)

**In master synthesis:** `extractions/synthesis/master_synthesis.md`

Look for:
- Evidence quality discussion
- Knowledge gaps
- Future research needs

---

### Location 2: Individual Paper Assessments

**In each paper's Layer 5:** `extractions/[AuthorYear]/layer5/assessment_enhanced.md`

Look for sections:
- **Remaining Gaps** — what the paper doesn't address
- **Caveats** — qualifications on findings
- **Transferability** ratings (if LOW)
- **Evidence Strength** ratings (if WEAK)

---

### Location 3: Layer 3 Indicators

**In each paper's RQ indicators:** `extractions/[AuthorYear]/layer3/RQ[X]_indicators.md`

Look for:
- "LIMITED EVIDENCE" markers
- Gaps in coverage checkboxes
- Weak indicator ratings

---

## Systematic Review Process

### Step 1: Extract Synthesis-Level Limitations

Read all RQ answer files and extract:

**For each RQ:**
```markdown
## RQ[X]: [Research Question]

### Caveats
[List from RQ[X]_answer.md]

### What Cannot Be Concluded
[List from RQ[X]_answer.md]

### Remaining Gaps
[List from RQ[X]_answer.md]

### Evidence Strength
Rating: [HIGH/MODERATE/LOW]
Issues: [Why not higher]
```

---

### Step 2: Extract Paper-Level Limitations

For each paper, read `layer5/assessment_enhanced.md`:

**Compile by category:**

**Coverage gaps:**
- [Paper]: [What it doesn't address]

**Methodological issues:**
- [Paper]: [Study design limitations]

**Transferability concerns:**
- [Paper]: [Why LOW/MEDIUM transferability]

**Evidence quality issues:**
- [Paper]: [Why MODERATE/LOW quality rating]

---

### Step 3: Aggregate Patterns

Identify common limitations across papers:

1. **Which RQ has weakest evidence overall?**
2. **Which contexts/populations are underrepresented?**
3. **Which methods are weak/strong?**
4. **What time periods are missing?**
5. **What populations are unstudied?**
6. **What outcomes aren't measured?**

---

### Step 4: Categorize Limitations

**Evidence Limitations:**
- Quality of studies (empirical vs. opinion)
- Sample sizes and generalizability
- Methodological rigor
- Replication and consistency

**Coverage Limitations:**
- Geographic (contexts not included)
- Temporal (time periods not covered)
- Population (groups not studied)
- Topic (aspects not addressed)

**Review Limitations:**
- Search strategy boundaries
- Selection criteria
- Language restrictions
- Publication availability

**Interpretation Limitations:**
- Weak or contradictory evidence
- Context-dependent findings
- Transferability uncertainties
- Causality vs. correlation

---

## Output Format

Create: `extractions/synthesis/LIMITATIONS_REVIEW.md`

```markdown
# Comprehensive Limitations Review

## Executive Summary
[1-2 paragraphs summarizing key limitations]

---

## RQ-Specific Limitations

### RQ1: [Full RQ text]
**Evidence Strength:** [rating]

**Caveats:**
1. [caveat] - Papers: [which]

**Cannot Conclude:**
1. [what we can't say]

**Gaps:**
1. [what wasn't studied]

---

### RQ2: [Full RQ text]
[Same structure]

### RQ3: [Full RQ text]
[Same structure]

### RQ4: [Full RQ text]
[Same structure]

---

## Cross-Cutting Limitations

### Geographic / Contextual Coverage
- **Well-represented:** [contexts with multiple papers]
- **Underrepresented:** [contexts with few papers]
- **Not represented:** [relevant contexts missing]
- **Impact:** [How this affects conclusions]

### Temporal Coverage
- **Time span:** [earliest to latest]
- **Concentration:** [where most papers cluster]
- **Gaps:** [time periods with no studies]
- **Impact:** [Whether findings may be dated]

### Population Coverage
- **Studied:** [which populations/specialties]
- **Understudied:** [which populations underrepresented]
- **Impact:** [Generalizability concerns]

### Methodological Coverage
- **Study designs represented:** [list with counts]
- **Dominant designs:** [which most common]
- **Missing designs:** [what methods not used]
- **Impact:** [Strength of causal inferences]

---

## Evidence Quality Limitations

### Overall Quality Distribution
- HIGH: [X papers, X%]
- MODERATE: [X papers, X%]
- LOW: [X papers, X%]

### Quality Issues by Paper Type
**Empirical studies:** [Common limitation]
**Program descriptions:** [Common limitation]
**Reviews:** [Common limitation]
**Commentaries:** [Common limitation]

---

## Synthesis Limitations

### Consensus Analysis Limitations
- **RQs with weak consensus:** [list]
- **Why consensus weak:** [reasons]

### Contradiction Analysis Limitations
- **Unresolved contradictions:** [list]

### Cross-Paper Comparison Limitations
- **Comparison challenges:** [what made comparison difficult]
- **Context differences:** [how contexts vary]
- **Definition variations:** [how terms differ between papers]

---

## Review Process Limitations

### Search and Selection
- **Databases searched:** [list]
- **Search limitations:** [language, date, access]
- **Selection criteria:** [inclusion/exclusion]
- **Potential missed studies:** [What might be missing]

### Extraction Process
- **Extraction approach:** 6-layer pipeline
- **What was prioritized:** [focus areas]
- **Verification:** [How extraction was verified]

### Synthesis Approach
- **Narrative vs. systematic:** [Why narrative chosen]
- **Interpretation subjectivity:** [How this affects findings]

---

## Impact on Conclusions

### High-Confidence Conclusions (Despite Limitations)
[What we can confidently conclude even with limitations]

### Moderate-Confidence Conclusions
[What we can tentatively conclude]

### Low-Confidence Conclusions
[What we cannot confidently conclude]

---

## Future Research Needs

### Priority Gaps
1. **[Gap]** - Why important: [reason]

### Methodological Improvements Needed
1. **[Improvement]** - Would address: [limitation]

### Populations to Study
1. **[Population]** - Why important: [reason]

### Contexts to Explore
1. **[Context]** - Why important: [reason]

---

## Recommendations for Review Writing

### In Limitations Section, Emphasize:
1. [Most critical limitation]
2. [Second critical limitation]

### Throughout Review, Acknowledge:
- Where evidence is weak (use "limited evidence suggests...")
- Where context differs (note transferability concerns)
- Where contradictions exist (present both views)
- Where gaps remain (note what's unknown)
```

---

## Quality Checklist

After compiling limitations:

- [ ] All RQs have limitations documented
- [ ] Synthesis-level limitations identified
- [ ] Paper-level limitations aggregated
- [ ] Geographic/temporal/population gaps noted
- [ ] Evidence quality issues documented
- [ ] Methodological limitations acknowledged
- [ ] Impact on conclusions assessed
- [ ] Future research needs specified
