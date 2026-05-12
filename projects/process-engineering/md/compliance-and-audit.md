### What a process compliance audit is

A process compliance audit is a structured self-assessment: does the output of a phase satisfy the requirements of the process guide? It produces a compliance matrix, identifies specific guide requirements that were violated, and generates a remediation plan.

The audit was performed after Phase 2 (Process Design) of the line-shading project. The auditor was the same agent that produced the work.

### Compliance matrix — Phase 2 implementation review

| Requirement | Status | Issue |
|---|---|---|
| Read reference documentation before implementing | ❌ FAILED | Implemented from training memory, not from corpus |
| Add `@source` annotations linking to reference docs | ❌ FAILED | No source citations in any function |
| Formula traceability to Wikipedia | ❌ FAILED | No LaTeX formulas with Wikipedia references |
| OOP compliance (site code) | N/A | Processing library is intentionally functional |
| Correct module categorisation | ✅ PASSED | Modules organised by domain |
| `index.js` exports present | ✅ PASSED | All modules exported |

### What went wrong

The implementation skipped the mandatory read-before-implement step. Algorithms were implemented from training knowledge, not from the corpus. The formulas in the JSDoc comments may differ from the canonical definitions in the reference articles. There is no paper trail from implementation to source.

**Consequence**: the implementations may be algorithmically correct, but they cannot be verified. Any discrepancy between the code and the canonical formula is invisible.

This is the exact failure mode described in the governance section: decisions (in this case, specific formula choices) exist only in the agent's context window and cannot be reconstructed after the fact.

### Guide gaps identified by the audit

**Missing: read-before-implement checkpoint**. No guide explicitly required reading reference docs before writing code. Fixed by adding a mandatory Phase 2.5 step to the process guide.

**Missing: source citation template**. No standard format for `@source`, `@wikipedia`, `@formula` annotations. Fixed by adding a citation standard to `agentic-research-to-implementation.md`.

**Missing: distinction between library paradigms**. Confusion between the processing library (pure functional) and site components (OOP, BaseComponent). Fixed by adding a paradigm table to the rules.

**Missing: verification checklist**. No step to verify implementations against reference docs after writing. Fixed by adding a post-implementation checklist.

### Remediation protocol

For each non-compliant module:
1. Read the corresponding reference doc in the corpus
2. Extract the exact formula (LaTeX, character-for-character)
3. Add `@source`, `@wikipedia`, `@formula` annotations
4. Verify variable names match reference doc conventions (or document the mapping)
5. Verify algorithm steps match reference doc procedure

This work is deferred until modules are next touched — the implementations are algorithmically correct and the tools work. But the retroactive citation work remains outstanding and is tracked in the module compendium.

### What the audit demonstrates

The value of the audit is not that it caught a critical bug. The implementations work. The value is that it made a process failure *visible* — a failure that would have compounded if not caught. Every subsequent module built the same way would inherit the same non-compliance.

The audit is a feedback loop from the output of one phase to the process guide that governs it. Without this loop, process drift is invisible until the system fails in production.
