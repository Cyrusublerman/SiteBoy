### The taxonomy problem

A shared library only delivers value if consumers can find the right function. A flat list of 200 functions is unusable. A taxonomy organises functions by purpose so that "what do I need for colour distance?" maps to a specific module without reading every file.

### Category system

| Category | Code | Domain |
|---|---|---|
| Mathematical utilities | MATH | Scalar ops, interpolation, statistics, easing functions |
| Colour space | COLOR | Colour space conversion, distance metrics, palette ops |
| Canvas/render utilities | CANVAS | 2D drawing helpers, path ops, SVG export |
| Geometry | GEO | Spatial data structures, polygon ops, curve geometry |
| Animation | ANIM | Easing, sequencing, frame-indexed helpers |
| Physics simulation | PHYS | Wave equations, reaction-diffusion, particle systems |
| Image processing | IMG | Convolution, dithering, morphological ops, HOG |
| Audio | AUDIO | Web Audio utilities, semitone arithmetic, DSP |
| Pattern generators | PAT | Noise, halftone, procedural textures |
| State management | STATE | Observable state, undo/redo, event routing |

Each module has an ID: `{CATEGORY}-{NUMBER}`. Example: `COLOR-003: deltaE76`.

### Status flags

| Flag | Meaning |
|---|---|
| ✅ Implemented | Pure function in shared library, tested |
| ⚠️ Inline | Code exists but embedded in a tool file, not extracted |
| 📚 Research | Algorithm known by name, no code anywhere |
| ❌ Missing | Required by a tool but not researched or implemented |

The module compendium (`blog/docs/docs/Tool and Gen Pages/Functions/module-compendium.md`) is the canonical source of truth for all module IDs, statuses, and descriptions. It is updated when modules are created or extracted.

### Dependency graph

Module categories form a dependency order:

```
MATH (no dependencies)
  ↓
COLOR, GEO, CANVAS  (depend on MATH)
  ↓
IMG, ANIM  (depend on COLOR + GEO)
  ↓
PHYS, AUDIO, PAT  (depend on MATH; may use IMG)
  ↓
STATE  (depends on nothing — pure observer pattern)
```

This order determines build priority: MATH and COLOR ship first because they are the widest dependencies. A tool cannot import `COLOR-003: deltaE76` until that module exists.

### Why pure functions

All modules in the shared library (`blog/ideas/reference documentation/processing/`) are pure functions: no DOM manipulation, no side effects, no globals. This is distinct from site components (`assets/js/shared/`, `assets/js/core/`) which are OOP and extend `BaseComponent`.

The processing library is a **research substrate** — functions that encode mathematical algorithms, testable in isolation, composable without a browser environment. Site components are **production UI** — they consume the processing library's functions and wrap them in the component lifecycle.

The separation is enforced by location: any file in `blog/ideas/reference documentation/processing/` must be a pure function module. Any file in `assets/js/` must follow OOP site rules.

### Gap analysis as taxonomy maintenance

Every time a new tool is designed, its Phase 5 gap analysis produces a comparison matrix:

```
WHAT PAGE NEEDS              WHAT LIBRARY HAS
─────────────────────────    ─────────────────────────
safePow for equations        MATH-001: safePow ⚠️
LAB colour distance          COLOR-003: deltaE76 ⚠️
Floyd-Steinberg dither       IMG-006: floydSteinberg ⚠️
Hilbert curve generation     (not catalogued)
SVG path export              CANVAS-002: exportSvg ⚠️
```

Extraction gaps are resolved by moving the inline code to the shared library and assigning a module ID. Research gaps are resolved by returning to Phase 3. The taxonomy grows incrementally — each new tool adds some modules and finds they already exist for others.
