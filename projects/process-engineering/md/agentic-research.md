### The core problem

Creative technical projects begin as loose collections of ideas — references to algorithms half-remembered, techniques seen in other work, questions about feasibility. The gap between "I want to make X" and working code is filled with research, false starts, and the gradual accumulation of domain knowledge.

The naive approach: ad-hoc Google searches, reading multiple conflicting sources, gradually building intuition. The problem: no trace of the research, no way to verify which formula was used, no path from idea to implementation that can be audited or repeated.

The solution: treat knowledge acquisition as a structured pipeline with explicit source citation at every step.

### Wikipedia as a structured knowledge base

Wikipedia articles on mathematical algorithms follow consistent structure: informal description → formal definition with equations → pseudocode → variations → references. Critically, mathematical notation is encoded as LaTeX in the source HTML, not just rendered visually.

This makes Wikipedia the ideal corpus for this pipeline: canonical formulas, standard notation, comprehensive coverage of algorithmic mathematics, machine-readable structure.

The 145 articles produced from the initial line-shading research project cover:
- Edge and gradient operators (Sobel, Canny, LoG, DoG, Prewitt)
- Sampling and point distribution (Poisson disk, Halton, Hammersley, Lloyd relaxation)
- Space-filling curves (Hilbert, Peano, Moore, Z-order, L-systems)
- Path optimisation (TSP, nearest neighbour, 2-opt, 3-opt)
- Reaction-diffusion (Gray-Scott, Belousov-Zhabotinsky)
- Colour (CIELAB, Delta E, ICC profiles, dithering methods)
- Physics simulation (wave equation, oscillators)
- Audio (WAV format, DSP fundamentals)

### Formula isolation → typed functions

Each article is mined for function signatures. The pattern:

```
Wikipedia article → formula extraction → typed JS function with @source annotation
```

Required JSDoc fields:

```javascript
/**
 * [Brief description]
 * 
 * @source blog/ideas/reference documentation/{category}/{article}.md
 * @wikipedia https://en.wikipedia.org/wiki/{title}
 * @formula
 *   [LaTeX formula as in reference doc, with section reference]
 * 
 * @param {Type} input — Description
 * @returns {Type} Description
 */
```

The `@source` path enforces traceability: any formula can be traced from the implementation back to the markdown article and from there to the Wikipedia source. If the formula differs from the canonical definition, the discrepancy is visible.

### Formula registry

The library is indexed as a registry mapping purpose → implementation:

| Purpose | Module | Function | I/O Signature |
|---|---|---|---|
| Find edges | edge-operators | `canny()` | image → {edges, magnitude, direction} |
| Find threshold | thresholding | `otsuThreshold()` | image → {threshold, variance} |
| Label regions | thresholding | `connectedComponents()` | binaryImage → {labels, count} |
| Distribute points | point-distribution | `poissonDisk()` | (width, height, minDist) → points[] |
| Fill with curve | space-filling-curves | `HilbertCurve.generate()` | order → points[] |
| Optimise path | path-optimization | `twoOpt()` | (points, path) → optimisedPath |

When a tool needs an algorithm, the registry maps the requirement to a specific import. No re-implementation, no duplication, no "I'll just write it inline."

### Limitations of the approach

The methodology assumes the problem domain has Wikipedia coverage and that the algorithms are describable as pure functions. It does not handle: novel algorithms not yet documented, implementation details not captured in formulas (numerical stability, edge cases, precision requirements), or performance-critical paths requiring platform-specific optimisation.

Better AI models do not remove the need for this structure. A smarter agent making undocumented decisions at speed produces more confident errors faster.
