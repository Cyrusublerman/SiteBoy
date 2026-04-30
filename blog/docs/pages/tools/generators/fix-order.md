# Phase 3 — Fix Order

**Generated:** 2026-04-23  
**Total issues to fix:** 136  
**Total batches:** 27  
**Skipped (wontfix):** 0
**Deferred (post-Phase 3 review):** 2

## Batch ordering rationale

1. Shared-modules batch first (cross-cutting `zero-shared-imports` ARCH set).
2. P1 GEN/EXP-heavy generator batches (alphabetical).
3. HOST contract/architecture batch.
4. Remaining P2/P3-only generator batches (alphabetical).

## Batches

### Batch 0: Shared modules (cross-cutting)

| issue_ids (ordered) | type | severity band | summary | affects |
|---|---|---|---|---|
| ARCH-003, ARCH-005, ARCH-007, ARCH-009, ARCH-011, ARCH-012, ARCH-014, ARCH-015, ARCH-016, ARCH-017, ARCH-018, ARCH-019, ARCH-020, ARCH-021, ARCH-022, ARCH-023, ARCH-024, ARCH-025, ARCH-026, ARCH-027, ARCH-028, ARCH-029, ARCH-030, ARCH-031, ARCH-032 | ARCH | P1 | Cross-generator `zero-shared-imports` remediation and shared algorithm extraction | harmonics, lissajous, torus, cymatics, moire, wave-interference, p5-wave-interference, p5-wave-colour, generative-pattern, tile-mosaic, golden-grid, order-disorder, animated-lines, shape-array, fibonacci-balls, circles, interference-figure, squares, unified-pattern, solar-system, wave-equation-synth, clockwise, curtain-morph, quine, defecated |

### Batch 1: cymatics (7 issues)
| issue_ids (ordered) | highest_priority_score | notes |
|---|---:|---|
| PERF-001, ARCH-010, GEN-008, PERF-002, DOC-010, DOC-011, DOC-012 | 90 | includes one remaining P1 issue plus PERF/DOC follow-ups |

### Batch 2: defecated (5 issues)
| issue_ids (ordered) | highest_priority_score | notes |
|---|---:|---|
| GEN-028, GEN-029, GEN-030, DOC-057, DOC-058 | 100 | placeholder-reference decisions + doc sync |

### Batch 3: generative-pattern (5 issues)
| issue_ids (ordered) | highest_priority_score | notes |
|---|---:|---|
| GEN-013, GEN-014, GEN-015, PERF-006, DOC-021 | 100 | placeholder-reference decisions + perf/doc |

### Batch 4: harmonics (8 issues)
| issue_ids (ordered) | highest_priority_score | notes |
|---|---:|---|
| GEN-001, GEN-002, GEN-003, ARCH-004, GEN-004, DOC-001, DOC-002, DOC-003 | 100 | includes behaviour + architecture alignment |

### Batch 5: interference-figure (5 issues)
| issue_ids (ordered) | highest_priority_score | notes |
|---|---:|---|
| GEN-019, GEN-020, GEN-021, DOC-037, DOC-038 | 100 | placeholder-reference decisions + doc sync |

### Batch 6: lissajous (6 issues)
| issue_ids (ordered) | highest_priority_score | notes |
|---|---:|---|
| GEN-005, ARCH-006, EXP-001, DOC-004, DOC-005, DOC-006 | 100 | includes export contract divergence |

### Batch 7: moire (6 issues)
| issue_ids (ordered) | highest_priority_score | notes |
|---|---:|---|
| EXP-002, GEN-009, PERF-003, DOC-013, DOC-014, ARCH-002 | 100 | export + perf + P3 contract cleanup |

### Batch 8: p5-wave-interference (4 issues)
| issue_ids (ordered) | highest_priority_score | notes |
|---|---:|---|
| GEN-012, PERF-004, DOC-017, DOC-018 | 100 | runtime loop-period divergence + perf/doc |

### Batch 9: tile-mosaic (5 issues)
| issue_ids (ordered) | highest_priority_score | notes |
|---|---:|---|
| GEN-016, GEN-017, GEN-018, PERF-007, DOC-023 | 100 | placeholder-reference decisions + perf/doc |

### Batch 10: torus (6 issues)
| issue_ids (ordered) | highest_priority_score | notes |
|---|---:|---|
| GEN-006, GEN-007, ARCH-008, DOC-007, DOC-008, DOC-009 | 100 | parity on projection/radius semantics + doc sync |

### Batch 11: unified-pattern (5 issues)
| issue_ids (ordered) | highest_priority_score | notes |
|---|---:|---|
| GEN-022, GEN-023, GEN-024, DOC-043, DOC-044 | 100 | placeholder-reference decisions + doc sync |

### Batch 12: wave-equation-synth (5 issues)
| issue_ids (ordered) | highest_priority_score | notes |
|---|---:|---|
| GEN-025, GEN-026, GEN-027, DOC-048, DOC-049 | 100 | placeholder-reference decisions + doc sync |

### Batch 13: wave-interference (6 issues)
| issue_ids (ordered) | highest_priority_score | notes |
|---|---:|---|
| EXP-003, GEN-010, GEN-011, ARCH-013, DOC-015, DOC-016 | 100 | export + behaviour divergences |

### Batch 14: HOST (4 issues)
| issue_ids (ordered) | highest_priority_score | notes |
|---|---:|---|
| ARCH-033, ARCH-001, DOC-059, DOC-060 | 80 | host contract + architecture cleanup |

### Batch 15: animated-lines (3 issues)
| issue_ids (ordered) | highest_priority_score | notes |
|---|---:|---|
| PERF-010, DOC-029, DOC-030 | 9 | perf/doc only |

### Batch 16: circles (3 issues)
| issue_ids (ordered) | highest_priority_score | notes |
|---|---:|---|
| PERF-013, DOC-035, DOC-036 | 9 | perf/doc only |

### Batch 17: clockwise (2 issues)
| issue_ids (ordered) | highest_priority_score | notes |
|---|---:|---|
| DOC-050, DOC-051 | 5 | doc-only |

### Batch 18: curtain-morph (4 issues)
| issue_ids (ordered) | highest_priority_score | notes |
|---|---:|---|
| PERF-015, DOC-052, DOC-053, DOC-054 | 9 | perf + doc |

### Batch 19: fibonacci-balls (3 issues)
| issue_ids (ordered) | highest_priority_score | notes |
|---|---:|---|
| PERF-012, DOC-033, DOC-034 | 9 | perf/doc only |

### Batch 20: golden-grid (3 issues)
| issue_ids (ordered) | highest_priority_score | notes |
|---|---:|---|
| PERF-008, DOC-025, DOC-026 | 9 | perf/doc only |

### Batch 21: order-disorder (3 issues)
| issue_ids (ordered) | highest_priority_score | notes |
|---|---:|---|
| PERF-009, DOC-027, DOC-028 | 9 | perf/doc only |

### Batch 22: p5-wave-colour (3 issues)
| issue_ids (ordered) | highest_priority_score | notes |
|---|---:|---|
| PERF-005, DOC-019, DOC-020 | 9 | perf/doc only |

### Batch 23: quine (2 issues)
| issue_ids (ordered) | highest_priority_score | notes |
|---|---:|---|
| DOC-055, DOC-056 | 5 | doc-only |

### Batch 24: shape-array (3 issues)
| issue_ids (ordered) | highest_priority_score | notes |
|---|---:|---|
| PERF-011, DOC-031, DOC-032 | 9 | perf/doc only |

### Batch 25: solar-system (2 issues)
| issue_ids (ordered) | highest_priority_score | notes |
|---|---:|---|
| DOC-045, DOC-046 | 5 | doc-only |

### Batch 26: squares (3 issues)
| issue_ids (ordered) | highest_priority_score | notes |
|---|---:|---|
| PERF-014, DOC-041, DOC-042 | 9 | perf/doc only |

## Skipped issues

| issue_id | reason | resolved by |
|---|---|---|
| none | — | — |

## Deferred issues

| issue_id | reason | defer source |
|---|---|---|
| DOC-022 | Broad rewrite queued for later remake cycle | Q-wontfix-candidate-DOC-022 |
| DOC-024 | Broad rewrite queued for later remake cycle | Q-wontfix-candidate-DOC-024 |

## Triage questions queued

- Q-wontfix-candidate-DOC-022 (DEFER)
- Q-wontfix-candidate-DOC-024 (DEFER)
- Q-wontfix-candidate-DOC-038 (DEFER)
