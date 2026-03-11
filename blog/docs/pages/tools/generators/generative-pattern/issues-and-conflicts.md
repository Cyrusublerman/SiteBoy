# Generative Pattern — Issues and Conflicts

## ERROR [BUG] — Generator Not Implemented (Stub)

**Location:** `assets/js/tools/generators/scripts/pattern/generative-pattern.gen.js` — entire file.

**Issue:** The live script is a placeholder. The `draw` function fills the canvas black regardless of any parameter. The comment `// TODO: Extract from generative-pattern.js` references a source file that does not exist in the repository. The archive source (`reference/generators/generative-pattern/source/generative-pattern.gen.js`) is identical to the live stub.

**Impact:** Catastrophic — the generator produces no output and cannot be used.

**Required action:** Full implementation of the intended algorithm (hybrid point distribution, proximity graph, optional Gray-Scott solver, distance transform, 4 rendering modes, animation).

---

## ERROR [BUG] — complexity Parameter Has No Effect

**Location:** `SCRIPT_CONFIG.parameters` — `complexity` slider; `draw` function — `params` not used.

**Issue:** The `complexity` parameter is declared but the `draw` function takes `(ctx, canvas, params)` and does not read any params. Moving the slider produces no visual change.

**Fix:** Implement or remove the parameter when the generator is built.

---

## WARN [STANDARDS] — No animation Block in SCRIPT_CONFIG

**Location:** `SCRIPT_CONFIG` — no `animation` key.

**Rule:** `code-standards.md` §Animation: all generators must declare their animation contract.

**Fix:** Add `animation: { type: 'none' }` for the stub, or full animation declaration when implemented.

---

## WARN [STANDARDS] — No export Block in SCRIPT_CONFIG

**Location:** `SCRIPT_CONFIG` — no `export` key.

**Fix:** Add `export: { png: true }` as minimum, or full export block per spec when implemented.

---

## WARN [STANDARDS] — No presets in SCRIPT_CONFIG

**Location:** `SCRIPT_CONFIG` — no `presets` key.

**Fix:** Add presets when implementation is complete.

---

## NOTE [RESEARCH] — Gray-Scott Solver Required

**Location:** Phase 3 of intended algorithm.

**Note:** Full Gray-Scott implementation with graph-topology Laplacian requires significant research and testing. The audit lists this as HIGH priority research gap. The legacy audit explicitly flags `grayScottSolver` as missing.

---

## NOTE [RESEARCH] — Jump Flood Algorithm Required

**Location:** Phase 4 of intended algorithm.

**Note:** JFA distance transform on an 800×800 canvas requires careful GPU or Worker implementation for acceptable performance. Flagged as HIGH priority in the audit.
