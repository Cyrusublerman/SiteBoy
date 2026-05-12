---
name: layer-1-extract
description: Extract atomic facts, quotes, claims, and entities from a paper section. Use when starting extraction or when you need raw data from paper text.
---

# Layer 1: Low-Level Extraction

> **First:** Read `PROJECT_CONFIG.md` → Layer 1 Topics section. Use the topics defined there; defaults are listed below.

Extract atomic information from paper sections. NO interpretation — just find and label.

## When to Use

- Starting extraction on a new paper
- Processing a specific section of a paper
- Need raw quotes, facts, or claims from text

## Instructions

### Input Required

- Paper section text (Abstract, Intro, Methods, Results, Discussion, or Conclusion)
- Paper identifier (AuthorYear format)

### Process

For each section provided:
1. Run QUOTES extraction
2. Run FACTS extraction
3. Run CLAIMS extraction
4. Run ENTITIES extraction

### Output Files

Save to `extractions/[AuthorYear]/layer1/`:
- `[section]_quotes.md`
- `[section]_facts.md`
- `[section]_claims.md`
- `[section]_entities.md`

---

## QUOTES Extraction

Find sentences mentioning key topics. Quote exactly as written.

**Default topics** (override in `PROJECT_CONFIG.md` if needed):
- Leadership (leader, leading, lead, leadership)
- Training (train, education, develop, program, curriculum)
- Skills (competenc*, skill*, abilit*, capabil*)
- Transition (transition, becoming, independent, ready, role change)
- Barriers (barrier, challenge, difficult*, obstacle, problem)
- Enablers (enable, facilitat*, support, mentor, opportunit*)
- Assessment (assess*, evaluat*, measure*, tool)

**Output format:**
```
TOPIC: [topic name]
QUOTE: "[exact sentence from text]"
---
```

---

## FACTS Extraction

List factual statements. A fact = something stated as true (not opinion or recommendation).

**Output format:**
```
FACT: [statement]
QUOTE: "[supporting text from paper]"
---
```

---

## CLAIMS Extraction

List claims the author makes or argues.

**Claim types:**
- FINDING: Result from data/research
- ARGUMENT: Logical assertion
- RECOMMENDATION: What should be done
- OPINION: Author's view without direct evidence

**Output format:**
```
CLAIM: [what author claims]
TYPE: [FINDING / ARGUMENT / RECOMMENDATION / OPINION]
QUOTE: "[supporting text]"
---
```

---

## ENTITIES Extraction

List named things mentioned in the text.

**Entity types:**
- Framework: Named theories, models, approaches
- Tool: Assessment instruments, measures
- Program: Training programs, curricula
- Organization: Colleges, institutions, governing bodies
- Place: Countries, hospitals, universities

**Output format:**
```
TYPE: [framework / tool / program / organization / place]
NAME: [exact name as written]
CONTEXT: "[sentence where mentioned]"
---
```

---

## Quality Rules

1. **Quote exactly** — use exact words from text, in quotation marks
2. **No interpretation** — just extract, don't analyze
3. **Label correctly** — use the defined categories
4. **Be thorough** — over-extract rather than miss something
5. **Mark location** — note which section each extract comes from

## Next Step

After completing Layer 1 for all sections, invoke `/layer-2-compile`
