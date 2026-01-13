# Phase 0: Context & Constraints Analysis

**Date:** December 2024  
**Scope:** 10 tools processed from DUMP folder (batch December 3, 2024)

---

## 1. Constraints Summary

All normative rules that must be obeyed when implementing tools. Cited by source.

### 1.1 Layout & Sizing Constraints

| Constraint | Rule | Source |
|------------|------|--------|
| F = 14px base unit | All dimensions must be F-multiples | `f-system.md` § Core Principle |
| Sidebar width | Fixed 30F (420px), never recalculate | `f-system.md` § Tool Page Layout |
| Control height | 2F (28px) | `f-system.md` § Control Sizing |
| Gap between controls | F2 (7px) | `f-system.md` § Spacing |
| Gap between sections | F (14px) | `f-system.md` § Spacing |
| Container padding | F (14px) | `f-system.md` § Spacing |
| Canvas sizes | Must be F-multiples: 196, 280, 392, 420, 560, 784, 840... | `page-design-guide.md` § Sizing Guidelines |
| No absolute F calculations for containers | Use `100%` and `flex: 1` | `f-system.md` § Rules |

### 1.2 Visual Style Constraints

| Constraint | Rule | Source |
|------------|------|--------|
| VGA palette only | Colors must use `var(--vga-*)` or exact VGA hex in canvas | `.cursorrules` § Colors |
| No gradients | Disallowed | `.cursorrules` § Style Constraints |
| No shadows | Disallowed | `.cursorrules` § Style Constraints |
| No rounded corners | Disallowed | `.cursorrules` § Style Constraints |
| Typeface | Atkinson Hyperlegible only | `.cursorrules` § Style Constraints |

### 1.3 Sidebar Structure Constraints

| Constraint | Rule | Source |
|------------|------|--------|
| 3-level hierarchy required | TAB → BLOCK → COMPONENT | `tool-build-guide.md` § Step 3 |
| Maximum 4 tabs | Hard limit (this is all that fits) | `.cursorrules` § Tab Limit |
| Standard tab names | CONTROLS, STYLE, CANVAS, ANIMATION, AUDIO, PRESETS, INFO | `page-design-guide.md` § Standard Tab Names |
| Standard block names | Parameters, Shape, Style, Canvas, Export, Playback, Audio, Source, Output, Options | `page-design-guide.md` § Standard Block Names |
| Keys must be camelCase | No snake_case or PascalCase | `tool-build-guide.md` § Step 5 |

### 1.4 Animation Constraints

| Constraint | Rule | Source |
|------------|------|--------|
| AnimationFoundation ONLY | NO raw requestAnimationFrame/setInterval | `.cursorrules` § ABSOLUTE PROHIBITIONS |
| Animator classes | Use AnimationLoop, FrameSequencer, ThrottledLoop, IntervalAnimator | `tool-build-guide.md` § Step 8 |
| Cleanup required | Call `animator.destroy()` in tool's `destroy()` method | `tool-build-guide.md` § Step 8 |

### 1.5 Audio Constraints

| Constraint | Rule | Source |
|------------|------|--------|
| AudioContext on user gesture | Create on click, not constructor | `tool-build-guide.md` § Step 12 |
| Resume suspended context | Call `audioContext.resume()` | `tool-build-guide.md` § Step 12 |
| Close in destroy | `audioContext.close()` required | `tool-build-guide.md` § Step 12 |
| AnimationFoundation for visualization | Use AnimationLoop for audio visualizers | `tool-build-guide.md` § Step 12 |

### 1.6 DOM Constraints

| Constraint | Rule | Source |
|------------|------|--------|
| No direct DOM manipulation | Forbidden outside BaseComponent/ComponentLibrary | `.cursorrules` § ABSOLUTE PROHIBITIONS |
| Forbidden patterns | `document.createElement()`, `.innerHTML`, `.appendChild()` | `.cursorrules` § DOM Manipulation |
| Use ComponentLibrary | All UI via existing components | `.cursorrules` § DOM Manipulation |

### 1.7 Module/Code Constraints

| Constraint | Rule | Source |
|------------|------|--------|
| Pure functions only | No side effects for shared modules | `page-module-extraction-guide.md` § Step 4 |
| File ownership | Only specific files may own concerns | `.cursorrules` § File Ownership |
| Layout math location | Only in `mathematical-foundation.js` | `.cursorrules` § File Ownership |
| Animation logic location | Only in `animation-foundation.js` | `.cursorrules` § File Ownership |
| Routing location | Only in `router.js` | `.cursorrules` § File Ownership |

### 1.8 Tool Standards by Output Type

#### Static Image Tools

| Feature | Required | Source |
|---------|----------|--------|
| Canvas sizing (width/height sliders) | ✓ | `tool-standards.md` § Canvas/Image Output |
| Export PNG button | ✓ | `tool-standards.md` § Canvas/Image Output |
| Clear/Reset button | ✓ | `tool-standards.md` § Canvas/Image Output |
| Background color | Optional | `tool-standards.md` § Canvas/Image Output |
| Export SVG | If vector output | `tool-standards.md` § Canvas/Image Output |

#### Animation Tools

| Feature | Required | Source |
|---------|----------|--------|
| Play/Pause button | ✓ | `tool-standards.md` § Animation Output |
| Stop/Reset button | ✓ | `tool-standards.md` § Animation Output |
| FPS control | ✓ (auto via animation config) | `tool-standards.md` § Animation Output |
| Loop toggle | ✓ | `tool-standards.md` § Animation Output |
| Frame export | ✓ (auto via animation config) | `tool-standards.md` § Animation Output |
| GIF/Video export | ✓ (auto via animation config) | `tool-standards.md` § Animation Output |
| Duration display | ✓ | `tool-standards.md` § Animation Output |

#### Audio Tools

| Feature | Required | Source |
|---------|----------|--------|
| Play/Stop button | ✓ | `tool-standards.md` § Audio Output |
| Volume slider (0-100) | ✓ | `tool-standards.md` § Audio Output |
| Mute toggle | Optional | `tool-standards.md` § Audio Output |
| Waveform display | Optional | `tool-standards.md` § Audio Output |
| Export audio | If applicable | `tool-standards.md` § Audio Output |

### 1.9 Lazy Loading Constraints

| Constraint | Rule | Source |
|------------|------|--------|
| Never add tool scripts to index.html directly | Use AssetLoader registry | `lazy-loading.md` § Rules |
| Export libraries on-demand | Use `ensureJSZip()` / `ensureRecordRTC()` | `lazy-loading.md` § Rules |
| Specify dependencies in registry | AssetLoader loads them first | `lazy-loading.md` § Rules |
| Show loading indicator | User must know something is happening | `lazy-loading.md` § Rules |

### 1.10 Research Pipeline Constraints

| Constraint | Rule | Source |
|------------|------|--------|
| Check reference corpus first | Before querying Wikipedia | `agentic-research-to-implementation.md` § 3.4 |
| Wikipedia REST API | Use `/api/rest_v1/page/html/{title}` | `agentic-research-to-implementation.md` § 3.2 |
| Preserve LaTeX | Extract from `alttext` attribute | `agentic-research-to-implementation.md` § 3.2 |
| 6-file documentation structure | Per-tool folder with 00-05 files | `agentic-research-to-implementation.md` § 8.2 |

---

## 2. Assumptions List

Assumptions made during batch processing that are not explicitly stated in guides.

| Assumption | Confidence | Rationale | Impact if Wrong |
|------------|------------|-----------|-----------------|
| All 10 tools are visual (canvas-based) | HIGH | Design docs describe visual output | Audio/data tools would need different patterns |
| Default canvas size 420×420 is acceptable | HIGH | 420 = 30F, matches sidebar width | May need larger for detailed output |
| Animation tools use loop-type animation | MEDIUM | Most generative art is looping | Some may need sequence or infinite type |
| VGA palette sufficient for all tools | MEDIUM | Design constraint | Some artistic tools may need extended palette |
| No external APIs needed | MEDIUM | Design docs don't mention | Research tools may need Wikipedia API |
| All modules can be pure functions | MEDIUM | Functional style preferred | Some algorithms may need state |
| Processing library functions are correct | MEDIUM | Assumed tested | May need verification against Wikipedia formulas |
| Existing module-compendium covers basics | MEDIUM | Contains 49 modules | May have gaps for specialized algorithms |
| ToolBase handles all UI patterns needed | HIGH | Comprehensive component set | May need custom components |
| No file upload/processing required | LOW | Not mentioned in most designs | Some tools (halftone) need image input |

---

## 3. Open Questions List

Questions that could block later phases if unanswered.

### 3.1 Technical Questions

| Question | Blocking Phase | Priority |
|----------|----------------|----------|
| What existing functions in `processing/index.js` can be reused? | Phase 3 (Library Mapping) | HIGH |
| ~~Do reference docs exist for: Gray-Scott RD?~~ | ~~Phase 2~~ | ✅ ANSWERED: Yes, in `08_Reaction_Diffusion_PDE/` |
| Do reference docs exist for: superellipse, moiré patterns? | Phase 2 (Knowledge Sourcing) | HIGH |
| Which tools need image upload (file input)? | Phase 7 (Specification) | MEDIUM |
| Are there performance requirements (frame budget)? | Phase 8 (Implementation) | MEDIUM |
| Should tools share state between sessions (presets)? | Phase 7 (Specification) | LOW |

### 3.2 Design Questions

| Question | Blocking Phase | Priority |
|----------|----------------|----------|
| Smart Halftone: What algorithm for halftone placement? | Phase 2 (Knowledge Sourcing) | HIGH |
| Interference Figure: Which optical interference formulas? | Phase 2 (Knowledge Sourcing) | HIGH |
| Wave Equation Synth: Web Audio or formula-based? | Phase 7 (Specification) | HIGH |
| ASCII Art: How is glyph-to-brightness matching done? | Phase 2 (Knowledge Sourcing) | HIGH |
| Moiré Generator: Which interference patterns supported? | Phase 7 (Specification) | MEDIUM |

### 3.3 Architecture Questions

| Question | Blocking Phase | Priority |
|----------|----------------|----------|
| Should physics simulations (Gray-Scott) run on Web Workers? | Phase 4 (Architecture) | MEDIUM |
| Are any tools candidates for WebGL acceleration? | Phase 4 (Architecture) | LOW |
| How many tools should share the same shared module file? | Phase 4 (Architecture) | LOW |

---

## 4. Cross-Reference: Tools vs. Constraints

Each tool mapped against key constraints for compliance checking.

| Tool | Output Type | Animation | Audio | File Input | High-Priority Questions |
|------|-------------|-----------|-------|------------|------------------------|
| Ribbon Breeze | Animation | ✓ | ✗ | ✗ | Spring physics formulas |
| Topographic Dot Halftone | Static Image | ✗ | ✗ | ✓ | Halftone algorithm |
| Tile Mosaic | Static Image | ✗ | ✗ | ✗ | Tile generation algorithm |
| Moiré Generator | Animation | ✓ | ✗ | ✗ | Interference math |
| ASCII Art Generator | Static Image | ✗ | ✗ | ✓ | Glyph matching |
| Unified Pattern Generator | Static/Anim | Maybe | ✗ | ✗ | Pattern selection |
| Generative Pattern Algorithm | Animation | ✓ | ✗ | ✗ | Gray-Scott solver |
| Wave Equation Synth | Animation | ✓ | ✓ | ✗ | Wave equation, Web Audio |
| Smart Halftone | Static Image | ✗ | ✗ | ✓ | Edge-aware placement |
| Interference Figure | Animation | ✓ | ✗ | ✗ | Optical path difference |

---

## 5. Processing Library Coverage

Existing implementations in `processing/index.js` relevant to the 10 tools:

### Already Implemented

| Function | Module | Relevant Tools |
|----------|--------|----------------|
| `sobel()` | edge-detection | Smart Halftone, Topographic Halftone |
| `canny()` | edge-detection | Smart Halftone |
| `otsuThreshold()` | segmentation | Smart Halftone, Topographic Halftone |
| `poissonDisk()` | sampling | Topographic Halftone, Smart Halftone |
| `haltonSequence()` | sampling | Pattern generators |
| `HilbertCurve.generate()` | space-filling | Generative Pattern |
| `LSystem` | space-filling | Pattern generators |
| `twoOpt()` | tsp | TSP-based point ordering |

### Not Implemented in Processing Library (Gaps)

| Function | Needed By | Reference Doc Status | Implementation Status |
|----------|-----------|---------------------|----------------------|
| Gray-Scott RD solver | Generative Pattern, Smart Halftone | ✅ `08_Reaction_Diffusion_PDE/Gray-Scott_model.md` | ❌ Code needed |
| Wave equation solver | Wave Equation Synth | ✅ `08_Reaction_Diffusion_PDE/Wave_equation.md` | ❌ Code needed |
| Distance transform | Smart Halftone | ✅ `08_Reaction_Diffusion_PDE/Distance_transform.md` | ❌ Code needed |
| Superellipse formula | Unified Pattern | ❌ Not in corpus | ❌ Wikipedia fetch needed |
| Moiré interference | Moiré Generator | ❌ Not in corpus | ❌ Wikipedia fetch needed |
| Optical path difference | Interference Figure | ❌ Not in corpus | ❌ Wikipedia fetch needed |
| ASCII glyph matcher | ASCII Art Generator | ❌ Not in corpus | ❌ Custom design needed |
| Spring physics (Hooke's law) | Ribbon Breeze | ❌ Not in corpus | ❌ Wikipedia fetch needed |

**Key Finding:** 3 of 7 gaps have existing reference documentation. Only 4 need new Wikipedia fetches.

---

## 6. Next Steps

Based on this analysis, proceed to:

1. **Phase 1 (Technique Extraction)** — Extract all techniques from each idea document with formal categorization
2. **Phase 2 (Knowledge Sourcing)** — Check reference documentation corpus and identify Wikipedia articles needed
3. **Research Pipeline** — Query Wikipedia for missing algorithms (Gray-Scott, superellipse, moiré, optical interference, etc.)

### Immediate Actions

1. ✅ Read `blog/ideas/reference documentation/08_Reaction_Diffusion_PDE/` — **CONFIRMED**: Gray-Scott, Wave equation, Distance transform all present
2. **TODO:** Verify if superellipse is documented in geometry references (likely NOT — needs Wikipedia fetch)
3. **TODO:** Check if optical interference has coverage in physics references (likely NOT — needs Wikipedia fetch)
4. **TODO:** Fetch Wikipedia articles for: Superellipse, Moiré pattern, Thin-film interference, Hooke's law
5. **TODO:** Identify which tools need file upload: Smart Halftone ✓, Topographic Halftone ✓, ASCII Art ✓

---

## Appendix: Guide File Reference

| Guide | Path | Key Sections Used |
|-------|------|-------------------|
| F-System | `blog/docs/guides/f-system.md` | Core Principle, Spacing, Rules |
| Page Design Guide | `blog/docs/guides/page-design-guide.md` | Terminology, Sizing Guidelines, Standard Names |
| Tool Standards | `blog/docs/guides/tool-standards.md` | Minimum Functionality by Output Type |
| Tool Build Guide | `blog/docs/guides/tools/tool-build-guide.md` | Steps 3, 5, 8, 12 |
| Lazy Loading | `blog/docs/guides/lazy-loading.md` | Rules |
| Shared Utilities | `blog/docs/guides/shared-utilities.md` | Status Key, Extraction Queue |
| Module Extraction | `blog/docs/guides/tools/page-module-extraction-guide.md` | Steps 1-4, Research Trigger |
| Research Pipeline | `blog/docs/Processes/agentic-research-to-implementation.md` | Sections 3, 8 |
| AI Workflow | `blog/docs/guides/tools/ai-agent-page-processing-workflow.md` | All 8 phases, Research Integration |

