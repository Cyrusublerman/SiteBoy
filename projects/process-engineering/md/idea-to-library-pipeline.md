The pipeline has seven phases. Each phase has defined inputs, outputs, and document locations. The pipeline is not strictly linear — Phase 7 can loop back to Phase 5 when building a page reveals a missing module.

```
Phase 1: IDEA CAPTURE → seed document + glossary
Phase 2: PROCESS DESIGN → step sequence + I/O signatures + identified gaps
Phase 3: RESEARCH → Wikipedia corpus + formula isolation
Phase 4: MODULE DISCOVERY → module IDs + classification + status flags
Phase 5: GAP ANALYSIS → gap report + action items by type
Phase 6: BUILD & CATEGORISE → shared library files + dependency graph
Phase 7: PAGE IMPLEMENTATION → live tool + router entry + working URL
```

### Phase 1 — Idea Capture

Input: a vague creative brief. Output: a seed document at `blog/ideas/tools/{name}.md` containing the raw intent plus a glossary of technique names extracted from the brief.

Example brief fragment:
> "There are numerous methods of space filling with lines such as fractal space filling curves, L-systems, flood fill algorithms, reaction diffusion algorithms, self avoiding walks and the travelling salesman."

This produces glossary entries: Hilbert curve, Peano curve, L-systems, reaction-diffusion, TSP. These become the research queue.

### Phase 2 — Process Design

Each glossary entry is mapped to a function-level I/O signature. The design decomposes the goal into sequential sub-steps:

```
1. Image → Grayscale           (trivial: weighted RGB sum)
2. Grayscale → Edges           (Canny, Sobel)
3. Grayscale → Binary regions  (Otsu threshold)
4. Binary → Labelled regions   (connected components)
5. Region → Fill path          (Hilbert curve | TSP)
6. Path + Intensity → Stroke   (modulation function)
7. Strokes → SVG               (path generation)
```

Each step maps to: technique name → function signature. Gaps appear where a step has no known implementation.

Output: design spec at `blog/docs/pages/tools/{name}.md` with UI and functional requirements; architecture doc with data flow.

### Phase 3 — Research

For each technique name, the pipeline first checks the existing corpus (`blog/ideas/reference documentation/` — 155 pre-parsed Wikipedia articles). If the article is absent, it queries Wikipedia's REST API:

```
GET https://en.wikipedia.org/api/rest_v1/page/html/{title}
```

The standard Python `wikipedia` library destroys formula structure. The REST API preserves LaTeX in `<math alttext="...">` attributes:

```html
<math alttext="{\displaystyle G={\sqrt {G_{x}^{2}+G_{y}^{2}}}}">
  <!-- MathML rendering — ignored -->
</math>
```

A custom parser extracts structure, preserves LaTeX, and converts to Markdown:

```python
for math in p.find_all('math'):
    latex = math.get('alttext', '')
    if latex.startswith('{\\displaystyle'):
        latex = latex[14:-1].strip()
    math.replace_with(f' $${latex}$$ ')
```

Output: 145+ markdown articles organised by domain, with mathematics intact and suitable for AI context injection.

### Phase 4 — Module Discovery

Two pathways:

**Extraction path**: audit existing tool implementations, identify inline functions that should be shared, extract to library with module IDs.

**Research path**: parse formulas from the corpus, create typed function signatures, write pure implementations.

Module ID format: `{CATEGORY}-{NUMBER}: {name}`. Categories: MATH, COLOR, CANVAS, GEO, ANIM, PHYS, IMG, AUDIO, PAT, STATE.

Status flags: ✅ Implemented, ⚠️ Inline (exists but not extracted), 📚 Research (formula known, no code), ❌ Missing.

### Phase 5 — Gap Analysis

Gap types:

| Type | Definition |
|---|---|
| Extraction gap | Code exists in a tool file, not yet in shared library |
| Research gap | Algorithm known by name, not yet implemented anywhere |
| Variation gap | Similar module exists, needs parameterisation to cover the new case |

Output: comparison matrix of requirements vs library contents, sorted by usage count across all tools.

### Phase 6 — Build & Categorise

Build order follows dependency layers: Foundation (pure math utils) → Colour (depends on math) → Geometry → Image Processing (depends on colour) → Specialised (physics, audio, patterns).

Module template: pure function, no DOM, no globals, JSDoc with `@source`, `@wikipedia`, `@formula` annotations.

### Phase 7 — Page Implementation

Tool implemented in ToolBase format, wired to the router, live at a URL. Shared library functions are imported; no algorithm logic is inlined in the tool file.

Common iteration:
```
Phase 7 → Phase 5  (building page reveals missing module)
Phase 4 → Phase 3  (audit finds algorithm name with no code)
Phase 6 → Phase 4  (building module reveals shared dependency)
```

Each iteration adds to the shared library, making subsequent pages faster to build.
