# From Idea to Implementation: An Agentic Pipeline for Algorithmic Research

**Abstract** — This document describes a methodology for transforming unstructured creative briefs into functional code libraries using AI-assisted workflows. We demonstrate how structured knowledge extraction from Wikipedia, combined with systematic formula isolation, produces a module library that enables agents to route from high-level goals to specific implementations. The approach is validated against a real design problem: generating line-shaded artwork from images using space-filling algorithms.

---

> **Context:** This document covers **Phase 3 (Research)** of the complete pipeline.
> See `idea-to-library-pipeline.md` for the full 7-phase workflow overview.

---

## 1. Introduction

Creative technical projects often begin as loose collections of ideas—references to algorithms half-remembered, techniques seen in other work, questions about feasibility. The gap between "I want to make X" and working code is filled with research, false starts, and the gradual accumulation of domain knowledge.

This paper presents a systematic approach to closing that gap. Rather than ad-hoc googling, we treat knowledge acquisition as a structured pipeline: extract referenced techniques from the problem statement, source formal definitions from Wikipedia's API, convert to searchable markdown with preserved mathematics, isolate formulas into typed functions, and finally route from goals to module compositions.

The method was developed while working on a specific problem—generating complex line shading using space-filling curves—but the pipeline generalizes to any domain where Wikipedia provides adequate coverage of the underlying mathematics.

## 2. The Problem Statement

The input was a design brief titled *Complex Line Shading Using Space Filling Algorithms*. It specified a goal: take a raster image, extract bounded regions, fill each region with a continuous line pattern, and modulate line properties (width, density) based on local image characteristics.

The document contained approximately 70 lines mixing requirements, open questions, and technique references:

> "There are numerous methods of space filling with lines such as fractal space filling curves, L-systems, flood fill algorithms, reaction diffusion algorithms, self avoiding walks and the travelling salesman."

> "we can use the colour information as modulation variables to control the space filling algorithms"

> "what are typical ways in which images are converted to line art?"

This is characteristic of early-stage creative briefs: the *what* is clear, the *how* is scattered across half-understood references. A human researcher would now spend hours reading papers, watching tutorials, and gradually building intuition. We automated this.

## 3. Methodology

### 3.1 Technique Extraction

The first pass through the brief identified every algorithm, mathematical technique, or named method. These were categorized by function:

| Function | Extracted Techniques |
|----------|---------------------|
| Image → Edges | Canny, Sobel, Laplacian of Gaussian, Difference of Gaussians |
| Image → Regions | Otsu thresholding, watershed, connected components |
| Region → Fill Pattern | Hilbert curve, Peano curve, L-systems, reaction-diffusion |
| Points → Path | Travelling salesman, nearest neighbor, 2-opt |
| Point Distribution | Poisson disk sampling, Halton sequence, Lloyd relaxation |

This produced a glossary of 145 terms requiring formal definition.

### 3.2 Wikipedia as Structured Knowledge Base

Wikipedia articles on mathematical algorithms follow consistent structure: informal description, formal definition with equations, pseudocode or procedural steps, variations, and references. Crucially, mathematical notation is encoded as LaTeX in the source.

The standard `wikipedia` Python library extracts plaintext, which destroys formula structure:

```
# What the library returns:
"G x 2 + G y 2 {\displaystyle {\sqrt {G_{x}^{2}+G_{y}^{2}}}}"
```

This is unusable. The solution was to bypass the library and query Wikipedia's REST API directly:

```
GET https://en.wikipedia.org/api/rest_v1/page/html/{title}
```

This returns full HTML where mathematics is preserved in `<math>` elements. The critical observation: the `alttext` attribute contains clean LaTeX:

```html
<math alttext="{\displaystyle G={\sqrt {G_{x}^{2}+G_{y}^{2}}}}">
  <!-- MathML rendering (ignored) -->
</math>
```

### 3.3 HTML to Markdown Conversion

A custom parser extracts structure from Wikipedia HTML:

```python
def html_to_markdown(html):
    soup = BeautifulSoup(html, 'html.parser')
    sections = []
    
    for section in soup.find_all('section'):
        heading = section.find(['h1','h2','h3','h4'])
        if heading:
            level = '#' * int(heading.name[1])
            sections.append(f"{level} {heading.get_text()}")
        
        for p in section.find_all('p', recursive=False):
            sections.append(process_paragraph(p))
    
    return '\n\n'.join(sections)

def process_paragraph(p):
    for math in p.find_all('math'):
        latex = math.get('alttext', '')
        if latex.startswith('{\\displaystyle'):
            latex = latex[14:-1].strip()
        math.replace_with(f' $${latex}$$ ')
    return p.get_text()
```

The output preserves formula structure:

```markdown
## Formulation

The gradient magnitude is computed as:

$$G = \sqrt{G_x^2 + G_y^2}$$

And the gradient direction as:

$$\Theta = \operatorname{atan2}(G_y, G_x)$$
```

### 3.4 Corpus Organization

The 145 articles were organized into a hierarchical structure matching the glossary categories:

```
reference documentation/
├── 01_Edge_Gradient_Differential_Operators/
│   ├── Sobel_operator.md
│   ├── Canny_edge_detector.md
│   └── (10 more)
├── 04_Sampling_Point_Distribution/
│   ├── Poisson_disk_sampling.md
│   ├── Halton_sequence.md
│   └── (8 more)
├── 05_Space_Filling_Curves/
│   ├── Hilbert_curve.md
│   ├── Peano_curve.md
│   └── (12 more)
└── (13 more categories)
```

This corpus is now searchable, with mathematics intact and suitable for both human reading and AI context injection.

## 4. Formula Isolation

### 4.1 The Module Pattern

Each Wikipedia article describes one or more algorithms. Each algorithm has:

- **Inputs**: typed data (image, point set, scalar parameters)
- **Outputs**: transformed data (edge map, path, threshold value)
- **Formula**: the mathematical definition
- **Procedure**: computational steps

We encode these as JavaScript functions with JSDoc annotations preserving the original mathematics:

```javascript
/**
 * Sobel edge detection operator
 * 
 * Computes gradient magnitude and direction using 3×3 convolution kernels.
 * 
 * Formula:
 *   G = √(Gₓ² + Gᵧ²)
 *   Θ = atan2(Gᵧ, Gₓ)
 * 
 * @param {Float32Array} image - Grayscale image, values in [0, 255]
 * @param {number} width - Image width in pixels
 * @param {number} height - Image height in pixels
 * @returns {{magnitude: Float32Array, direction: Float32Array}}
 */
export function sobel(image, width, height) {
    const gx = convolve2D(image, width, height, SOBEL_X);
    const gy = convolve2D(image, width, height, SOBEL_Y);
    
    const magnitude = new Float32Array(width * height);
    const direction = new Float32Array(width * height);
    
    for (let i = 0; i < magnitude.length; i++) {
        magnitude[i] = Math.sqrt(gx[i]**2 + gy[i]**2);
        direction[i] = Math.atan2(gy[i], gx[i]);
    }
    
    return { magnitude, direction };
}
```

### 4.2 Library Structure

Functions are grouped by domain:

```
processing/
├── core/
│   ├── math-utils.js        # Vector operations, statistics, interpolation
│   └── matrix.js            # Convolution, kernel generation
├── edge-detection/
│   └── edge-operators.js    # Sobel, Canny, Prewitt, Roberts, LoG, DoG
├── segmentation/
│   └── thresholding.js      # Otsu (single/multi), connected components
├── sampling/
│   └── point-distribution.js # Poisson disk, Halton, Hammersley, Lloyd
├── space-filling/
│   └── space-filling-curves.js # Hilbert, Peano, Moore, Z-order, L-systems
├── tsp/
│   └── path-optimization.js # Nearest neighbor, 2-opt, 3-opt
└── geometry/
    └── polygon-operations.js # Point-in-polygon, area calculations
```

Each module exports pure functions. No side effects. No DOM manipulation. This makes them composable and testable.

### 4.3 The Formula Registry

The library can be indexed as a registry mapping purpose to implementation:

| Purpose | Module | Function | I/O Signature |
|---------|--------|----------|---------------|
| Find edges | edge-operators | `canny()` | image → {edges, magnitude, direction} |
| Find threshold | thresholding | `otsuThreshold()` | image → {threshold, variance} |
| Label regions | thresholding | `connectedComponents()` | binaryImage → {labels, count} |
| Distribute points | point-distribution | `poissonDisk()` | (width, height, minDist) → points[] |
| Fill with curve | space-filling-curves | `HilbertCurve.generate()` | order → points[] |
| Optimize path | path-optimization | `twoOpt()` | (points, path) → optimizedPath |

This registry is the interface between goals and implementations.

## 5. Goal Decomposition and Module Routing

With the formula library in place, we can now systematically decompose the original problem.

### 5.1 Pipeline Derivation

The goal "image → line-shaded artwork" decomposes into subgoals, each mapping to library functions:

```
GOAL: Raster image → SVG with continuous line fills per region

DECOMPOSITION:
1. Image → Grayscale
   └─ (trivial: weighted RGB sum)

2. Grayscale → Edge boundaries
   └─ edge-operators.canny(image, σ, lowT, highT)
   
3. Grayscale → Binary regions  
   └─ thresholding.otsuThreshold(image)
   └─ thresholding.connectedComponents(binaryImage)

4. Region polygon → Square packing
   └─ geometry.packSquaresInPolygon(polygon, minSize)  [GAP]

5. Squares → Hilbert curves
   └─ space-filling-curves.HilbertCurve.generate(order)
   └─ Connect curves between adjacent squares  [GAP]

6. Alternative: Region → Point distribution
   └─ sampling.poissonDisk(width, height, minDistance)
   └─ Filter points inside region polygon

7. Points → Continuous path
   └─ tsp.nearestNeighbor(points)
   └─ tsp.twoOpt(points, initialPath)

8. Path + Intensity map → Modulated stroke
   └─ Sample intensity at each path point
   └─ Map to stroke width
```

### 5.2 Gap Identification

The decomposition reveals missing pieces—functions needed but not yet implemented:

1. **Square packing in arbitrary polygon** — required for Hilbert curve approach
2. **Curve connectivity between squares** — joining Hilbert curves across square boundaries
3. **Contour tracing** — converting binary regions to polygon vertices
4. **SVG path generation** — converting point sequences to SVG markup

These become targets for the next research cycle.

## 6. Implementation Sketch

The routing produces a concrete implementation structure:

```javascript
async function generateLineShadedArt(imageData, options) {
    const { width, height } = imageData;
    
    // 1. Preprocessing
    const grayscale = toGrayscale(imageData);
    
    // 2. Region extraction
    const { threshold } = otsuThreshold(grayscale, width, height);
    const binary = applyThreshold(grayscale, threshold);
    const { labels, count } = connectedComponents(binary, width, height);
    
    // 3. Per-region processing
    const paths = [];
    for (let regionId = 1; regionId <= count; regionId++) {
        const regionMask = extractRegion(labels, regionId);
        const polygon = traceContour(regionMask);  // [GAP]
        
        if (options.method === 'hilbert') {
            const squares = packSquares(polygon, options.minSquareSize);  // [GAP]
            const curves = squares.map(sq => 
                HilbertCurve.generate(options.hilbertOrder)
                    .map(p => transformToSquare(p, sq))
            );
            const connected = connectCurves(curves);  // [GAP]
            paths.push(connected);
        } else {
            const points = poissonDisk(width, height, options.pointSpacing)
                .filter(p => pointInPolygon(p, polygon));
            const path = twoOpt(points, nearestNeighbor(points));
            paths.push(path);
        }
    }
    
    // 4. Modulation
    const modulatedPaths = paths.map(path => 
        path.map(point => ({
            ...point,
            strokeWidth: mapIntensityToWidth(
                sampleIntensity(grayscale, point),
                options.minWidth,
                options.maxWidth
            )
        }))
    );
    
    // 5. Output
    return generateSVG(modulatedPaths);  // [GAP]
}
```

The `[GAP]` markers indicate functions not yet in the library—the research backlog.

## 7. Discussion

### 7.1 Why This Works

The methodology succeeds because:

1. **Wikipedia is surprisingly complete** for algorithmic mathematics. The formulas are canonical, the notation standard, and the coverage deep.

2. **The API preserves structure** that plaintext extraction destroys. LaTeX in `alttext` is machine-readable and human-readable.

3. **Typed I/O signatures create composability**. When every function declares its input and output types, routing becomes mechanical.

4. **Gap identification is automatic**. Attempting to route goals to implementations immediately reveals missing pieces.

### 7.2 Limitations

The approach assumes:

- The problem domain has Wikipedia coverage
- Algorithms are describable as pure functions
- The agent can correctly decompose high-level goals

It does not handle:

- Novel algorithms not yet documented
- Implementation details not captured in formulas (numerical stability, edge cases)
- Performance optimization

### 7.3 Generalization

The pipeline applies to any domain where:

1. Techniques have formal definitions (mathematics, logic, protocols)
2. Wikipedia or similar structured sources exist
3. The goal can be expressed as data transformation

Examples: signal processing, cryptographic primitives, compiler passes, geometric algorithms.

## 8. Documentation Architecture

The final step transforms working analysis into reference documentation. A single monolithic document becomes unmaintainable; instead, we decompose by purpose.

### 8.1 Document Separation

Each document answers a distinct question:

| Document | Question | Audience |
|----------|----------|----------|
| **Overview** | What is this? Where do I start? | Anyone |
| **Design Spec** | What controls exist? What happens when I click X? | UI/UX designers |
| **Theoretical Foundation** | What math is behind this? Citations? | Researchers, curious devs |
| **Algorithm Library** | How do I call function X? I/O signatures? | Implementers |
| **System Architecture** | How does data flow? What depends on what? | Architects, maintainers |
| **Implementation Guide** | How do I wire this up? Class structure? | Developers |

### 8.2 Folder Structure

The tool documentation lives alongside the original idea:

```
blog/ideas/tools/
├── Complex Line Shading Using Space Filling Algorithms.md  ← Seed idea
└── complex-line-shading/                                    ← Full docs
    ├── 00-overview.md
    ├── 01-design-spec.md
    ├── 02-theoretical-foundation.md
    ├── 03-algorithm-library.md
    ├── 04-system-architecture.md
    └── 05-implementation-guide.md
```

The numbered prefixes enforce reading order. The seed document remains untouched—it's the historical record of initial intent.

### 8.3 Cross-Referencing

Each document references others where appropriate:

- **Design Spec** → Algorithm Library (for parameter effects)
- **Algorithm Library** → Theoretical Foundation (for formula derivations)
- **System Architecture** → Algorithm Library (for module dependencies)
- **Implementation Guide** → Design Spec + System Architecture (for wiring)

This creates a navigable knowledge graph rather than a linear document.

### 8.4 Living Documentation

The structure supports iteration:

| Change Type | Update Location |
|-------------|-----------------|
| New UI control | Design Spec |
| New algorithm | Algorithm Library + Theoretical Foundation |
| Architecture change | System Architecture |
| Build process change | Implementation Guide |
| Scope change | Overview |

No single document becomes a bottleneck.

---

## 9. Conclusion

We have described a methodology for converting unstructured creative briefs into functional code libraries and comprehensive documentation:

1. **Extract** technique references from problem statements
2. **Source** formal definitions via Wikipedia's REST API
3. **Convert** HTML to markdown with preserved LaTeX
4. **Isolate** formulas into typed, documented functions
5. **Route** goals through module compositions
6. **Identify** gaps for further research
7. **Document** with purpose-separated reference files

The result is a substrate that AI agents can reason over—transforming vague intentions into specific implementations through mathematical building blocks, with documentation that scales.

---

## Appendix A: File Reference

| Path | Description |
|------|-------------|
| `blog/ideas/tools/Complex Line Shading Using Space Filling Algorithms.md` | Original problem statement (seed) |
| `blog/ideas/tools/complex-line-shading/` | Complete tool documentation |
| `blog/ideas/reference documentation/` | 155 Wikipedia articles as markdown |
| `blog/ideas/reference documentation/processing/` | JavaScript formula library |

## Appendix B: API Reference

**Endpoint:** `https://en.wikipedia.org/api/rest_v1/page/html/{title}`

**Headers:** `Accept: text/html`

**Response:** Full HTML with `<math alttext="...">` elements containing LaTeX.

**Rate limit:** Respectful usage; no authentication required for read-only access.
