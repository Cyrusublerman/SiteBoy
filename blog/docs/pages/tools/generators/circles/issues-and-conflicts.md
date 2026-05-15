# Circles — Issues and Conflicts

## WARN

**[RESOLVED] [STANDARDS] — Module-Level Mutable State**

All mutable state (`_circles`, `_largestRadius`, `_radiusDecrement`, `_prevW`, `_prevH`) moved into an IIFE closure. `SCRIPT_CONFIG` is now the return value of `(() => { ... })()`. Module scope is clean.

---

**[PARTIAL] [STANDARDS] — Raw Colour Strings**

`ctx.fillStyle = '#000000'` and `ctx.strokeStyle = '#ffffff'` use valid VGA palette hex values (`#000000` = VGA black, `#ffffff` = VGA white) and are permitted in canvas draw calls. The gradient mode still uses `` ctx.fillStyle = `rgba(255, 255, 255, ${alpha})` `` — the `rgba()` string form is forbidden. VGA hex usage is compliant; `rgba()` usage remains a violation.

---

**[RESOLVED] [STANDARDS] — No animatableParams Declared**

`animation.animatableParams: []` now declared. Correctly reflects frame-driven animation with no phase parameters.

---

**[STANDARDS] — loopFrames Hardcoded Inconsistently with cycleFrames**

`animation.loopFrames: 3600` remains a static value. When `cycleFrames` is changed by the user, the actual loop period changes but `loopFrames` does not update. Now documented in `KNOWN LIMITATIONS` infoSection.

---

**[RESOLVED] [STANDARDS] — console.log in Production**

No `console.log` present in source.

---

## NOTE

**[BUG] — Orbit Model Is Not Rolling Motion**

All circles still use the same `orbitAngle = (frame / cycleFrames) × TWO_PI`. The chain rotates as a rigid arm; inner circles do not complete additional revolutions. This is documented in `KNOWN LIMITATIONS`: "Orbit model uses uniform angular rate for all circles, producing rigid-arm rotation rather than epicyclic (rolling) motion."

---

**[RESOLVED] [BUG] — Rebuild Does Not Detect Canvas Size Change**

Rebuild condition now checks canvas dimensions: `if (_circles.length !== params.circleCount || _prevW !== W || _prevH !== H) { initCircles(W, H, params.circleCount); }`. `_prevW` and `_prevH` are updated by `initCircles`.

---

**[RESOLVED] [BUG] — displayMode.toLowerCase() Throws If displayMode Is Undefined**

Guard added: `const mode = (params.displayMode || 'lines').toLowerCase();`

---

## Stale Documentation

**[STALE DOC] [DOC-037] — ui-layout.md Stale Entries**

Animation section states "No `animatableParams`" — RESOLVED (`animatableParams: []` now declared inside `animation` block). Export section and sidebar structure may have additional stale entries related to the same fix.

---

**[STALE DOC] [DOC-038] — migration-log.md Stale**

Open Items 1 (module-level state → IIFE closure), 4 (canvas size change detection), 5 (displayMode guard), 6 (animatableParams), 8 (console.log) confirmed RESOLVED in issues-and-conflicts.md.

---

**[PARITY] — Play/Pause, Speed, largestRadius, Line Width Missing**

Play/pause, outer radius slider, line width slider, and colour customisation are still not implemented. All flagged as known limitations in infoSections.

---

## v4 turn log (2026-04-23)

- **ARCH-023 (P1, FIXED):** Live circles imports no modules from `assets/js/shared/` (`zero-shared-imports`) and remains outside BaseComponent architecture.
- **PERF-013 (P2, WONTFIX):** No worker/GPU acceleration path; workload is lightweight and low risk.
- **DOC-035 (P2, FIXED):** `ui-layout.md` refreshed against current animation/export/runtime semantics.
- **DOC-036 (P2, FIXED):** `migration-log.md` refreshed against resolved closure-state and guard fixes.
