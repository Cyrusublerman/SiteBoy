# Project Configuration

> This file is read by all pipeline skills at invocation. Fill in every field before running Layer 1.

---

## Review Identity

- **Title:** [Your full review title]
- **Target context:** [The system, population, or program your review focuses on — e.g. a specific college, country, training framework, or institution. Used to assess transferability of international evidence.]

---

## Research Questions

Define 2–6 research questions. The pipeline assumes 4 by default; add or remove as needed.

- **RQ1:** [Your first research question]
- **RQ2:** [Your second research question]
- **RQ3:** [Your third research question]
- **RQ4:** [Your fourth research question]

---

## File Paths

- **Papers folder:** `[Relative path to your paper markdown files — e.g. papers/markdown/]`
- **Extractions folder:** `extractions/` *(default; change only if needed)*

---

## Layer 1: Extraction Topics

Default topics below cover most evidence-synthesis reviews. Edit or add topics relevant to your domain.

| Topic label | Keywords the agent should recognise |
|-------------|--------------------------------------|
| Leadership | leader, leading, lead, leadership |
| Training | train, education, develop, program, curriculum |
| Skills | competenc*, skill*, abilit*, capabil* |
| Transition | transition, becoming, independent, ready, role change |
| Barriers | barrier, challenge, difficult*, obstacle, problem |
| Enablers | enable, facilitat*, support, mentor, opportunit* |
| Assessment | assess*, evaluat*, measure*, tool |

---

## Layer 2: Themes

Default 8 themes below are generic across evidence-synthesis domains. Redefine only if your domain requires it.

| Code | Theme | Scope |
|------|-------|-------|
| T1 | Core phenomenon | The central concept being studied |
| T2 | Training / intervention | Programs, curricula, education methods |
| T3 | Assessment | Measurement tools, evaluation, feedback |
| T4 | Barriers | Obstacles, gaps, constraints |
| T5 | Enablers | Facilitators, supports, success factors |
| T6 | Transition / outcome | Role change, readiness, career-stage effects |
| T7 | Context | Country, system, institution, policy environment |
| T8 | Recommendations | Author proposals, implications, future directions |

---

## Layer 3: Theme → RQ Mapping

Map each RQ to the themes most likely to contain relevant indicators. Edit to match your RQs.

| RQ | Primary themes | Secondary themes |
|----|----------------|------------------|
| RQ1 | [e.g. T6] | [e.g. T3, T1] |
| RQ2 | [e.g. T2, T7] | [e.g. T3] |
| RQ3 | [e.g. T1, T2, T7] | [all] |
| RQ4 | [e.g. T4, T5] | [all] |

---

## Layer 3: Context Priority (for international / multi-context reviews)

Define how to weight evidence from different contexts relative to your target context.

| Priority | Contexts |
|----------|----------|
| HIGH | [Contexts directly equivalent to your target — same specialty, same system] |
| MEDIUM | [Contexts partially equivalent — same specialty or similar system] |
| LOWER | [Contexts with significant structural differences] |
