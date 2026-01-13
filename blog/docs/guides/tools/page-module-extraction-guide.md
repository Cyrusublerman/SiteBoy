# Page Module Extraction Guide

**Purpose:** Systematic extraction, categorization, and organization of reusable code modules from tool and generative art pages.

**Audience:** AI agents processing page documentation and implementations.

---

## 1. Overview

This guide covers **Phase 4 (Module Discovery)** of the complete pipeline.

→ **`Processes/idea-to-library-pipeline.md`** — Complete 7-phase workflow overview

For creating new modules from research/Wikipedia sources, see:

→ **`Processes/agentic-research-to-implementation.md`** — Research-based module creation

### Two Module Creation Pathways

| Pathway | Source | Process | This Guide |
|---------|--------|---------|------------|
| **Extraction** | Existing tool code | Audit → Extract → Refactor | ✅ Yes |
| **Research** | Wikipedia, papers, briefs | Research → Document → Implement | See companion |

Both pathways feed into the same shared library:
- `assets/js/shared/*.js` — JavaScript modules
- `Tool and Gen Pages/Functions/module-compendium.md` — Module catalog

### Extraction Workflow Steps

1. Analyzing page implementations and documentation
2. Extracting reusable functions, components, and utilities
3. Comparing against existing modules
4. Building new modules when needed
5. Organizing into a shared library
6. Creating page specifications with module references

---

## 2. Folder Structure

```
blog/docs/docs/Tool and Gen Pages/
├── README.md                       # Overview and quick start
├── Audits/                         # Per-page audit documents
│   ├── {page-name}-audit.md        # 14 existing audits
│   └── ...
├── Functions/                      # Module catalog
│   └── module-compendium.md        # Complete module inventory (49 modules)
├── Build/                          # Implementation tracking
│   ├── modules-to-build.md         # Module build queue
│   └── pages-to-build.md           # Page specifications (future)
└── Specifications/                 # Generated page specs (future)
    └── {page-name}-spec.md

blog/docs/guides/tools/
├── tool-build-guide.md                    # ToolBase implementation guide
├── page-module-extraction-guide.md        # THIS FILE - extraction process
└── ai-agent-page-processing-workflow.md   # 8-phase AI workflow guide
```

### Related Documents

| Document | Location | Purpose |
|----------|----------|---------|
| Module Compendium | `Tool and Gen Pages/Functions/module-compendium.md` | Complete module inventory |
| Modules To Build | `Tool and Gen Pages/Build/modules-to-build.md` | Build queue and templates |
| AI Workflow Guide | `guides/tools/ai-agent-page-processing-workflow.md` | 8-phase processing workflow |
| Tool Build Guide | `guides/tools/tool-build-guide.md` | ToolBase implementation |
| Tool Standards | `guides/tool-standards.md` | Output type requirements |
| F-System | `guides/f-system.md` | Sizing and layout system |

---

## 3. Module Categories

### 3.1 Mathematics (`math-modules.md`)

| Module ID | Name | Purpose | Source Tools |
|-----------|------|---------|--------------|
| MATH-001 | `safePow` | Handle negative bases with fractional exponents | lissajous, wave-interference |
| MATH-002 | `clamp` | Value clamping to range | All tools |
| MATH-003 | `lerp` | Linear interpolation | lissajous, wave-interference |
| MATH-004 | `wrap` | Wrap value to range | lissajous |
| MATH-005 | `easeIn/Out/InOut` | Cubic easing functions | squares, harmonics |
| MATH-006 | `smoothstep` | Smooth interpolation | harmonics |
| MATH-007 | `hash` | Deterministic pseudo-random | squares |
| MATH-008 | `envelope` | Smooth fade in/out | squares |

### 3.2 Color (`color-modules.md`)

| Module ID | Name | Purpose | Source Tools |
|-----------|------|---------|--------------|
| COLOR-001 | `hexToRgb` | Hex to RGB conversion | colour-quantizer |
| COLOR-002 | `rgbToLab` | RGB to LAB conversion | colour-quantizer |
| COLOR-003 | `deltaE76` | Color distance in LAB | colour-quantizer, dither |
| COLOR-004 | `pickNearest` | Find closest palette color | colour-quantizer, dither |
| COLOR-005 | `findOppositeColor` | Angular opposite finder | dither |
| COLOR-006 | `projectOntoSegment` | LAB space projection | dither |
| COLOR-007 | `vecSub/Dot/MagSq` | LAB vector operations | dither |

### 3.3 Canvas (`canvas-modules.md`)

| Module ID | Name | Purpose | Source Tools |
|-----------|------|---------|--------------|
| CANVAS-001 | `exportPng` | Download canvas as PNG | All ToolBase |
| CANVAS-002 | `exportSvg` | Generate SVG from canvas | wave-interference, solar-system |
| CANVAS-003 | `copyToClipboard` | Copy canvas to clipboard | All ToolBase |
| CANVAS-004 | `drawCard` | Draw transformed rectangle | squares |
| CANVAS-005 | `motionBlurClear` | Alpha-based trail effect | harmonics, lissajous |

### 3.4 Geometry (`geometry-modules.md`)

| Module ID | Name | Purpose | Source Tools |
|-----------|------|---------|--------------|
| GEO-001 | `project3D` | 3D to 2D projection | torus |
| GEO-002 | `torusParametric` | Torus surface point | torus |
| GEO-003 | `generateSpiral` | Spiral path generation | squares |
| GEO-004 | `polygonPoints` | Regular polygon vertices | polygon-calculator |
| GEO-005 | `apothemConversions` | Polygon measurement math | polygon-calculator |
| GEO-006 | `keplerSolver` | Orbital mechanics | solar-system |

### 3.5 Animation (`animation-modules.md`)

| Module ID | Name | Purpose | Source Tools |
|-----------|------|---------|--------------|
| ANIM-001 | `AnimationLoop` | RAF-based loop | AnimationFoundation |
| ANIM-002 | `FrameSequencer` | Frame-based playback | pixel-tiler |
| ANIM-003 | `ThrottledLoop` | Interval-based updates | solar-system |
| ANIM-004 | `Sequencer` | Checkpoint interpolation | lissajous, wave-interference |
| ANIM-005 | `timeWarp` | Non-linear time mapping | harmonics |
| ANIM-006 | `phaseAnimation` | Cyclic parameter animation | lissajous |

### 3.6 Physics (`physics-modules.md`)

| Module ID | Name | Purpose | Source Tools |
|-----------|------|---------|--------------|
| PHYS-001 | `WaveSource` | Point wave emitter | cymatics |
| PHYS-002 | `waveInterference` | Sum waves at point | cymatics, wave-interference |
| PHYS-003 | `displacement` | Wave-based displacement | cymatics |

### 3.7 Image Processing (`image-modules.md`)

| Module ID | Name | Purpose | Source Tools |
|-----------|------|---------|--------------|
| IMG-001 | `applyGamma` | Gamma correction | colour-quantizer |
| IMG-002 | `applyContrast` | Contrast adjustment | colour-quantizer |
| IMG-003 | `applySaturation` | Saturation adjustment | colour-quantizer |
| IMG-004 | `ditherNone` | Direct quantization | dither |
| IMG-005 | `ditherBlueNoise` | Blue noise dithering | dither |
| IMG-006 | `ditherFloydSteinberg` | Error diffusion | dither |
| IMG-007 | `orderedDither` | Pattern-based dithering | dither |

### 3.8 Audio (`audio-modules.md`)

| Module ID | Name | Purpose | Source Tools |
|-----------|------|---------|--------------|
| AUDIO-001 | `createOscillator` | Web Audio oscillator | tool-test-ui, cymatics |
| AUDIO-002 | `semitoneToFrequency` | Musical pitch conversion | cymatics |
| AUDIO-003 | `chordIntervals` | Chord semitone arrays | cymatics |

### 3.9 Patterns (`pattern-modules.md`)

| Module ID | Name | Purpose | Source Tools |
|-----------|------|---------|--------------|
| PAT-001 | `checkerboard` | Checkerboard pattern | squares |
| PAT-002 | `stripes` | Horizontal/vertical stripes | squares |
| PAT-003 | `cafeWall` | Café wall illusion | squares |
| PAT-004 | `bayerMatrix` | Bayer dither pattern | dither |

---

## 4. Audit Document Format

Each page audit (`{page-name}-audit.md`) must contain:

```markdown
# {Page Name} — Audit

## 1. Implementation
- File path, lines, architecture
- Key classes/functions list
- Related source files

## 2. vs Docs
- Feature comparison table
- Missing features
- Undocumented features

## 3. vs Guides
- tool-standards.md compliance
- tool-build-guide.md compliance
- f-system.md compliance

## 4. vs Source Files
- Reference file comparison
- Algorithm differences
- Functions to port

## 5. Extracted Modules
- List of MODULE IDs used/needed
- New modules discovered
- Variations of existing modules

## 6. Gap Summary
- Critical/Medium/Minor gaps

## 7. Recommended Actions
- Prioritized action items
```

---

## 5. Module Extraction Process

### Step 1: Identify Candidates

For each function in a tool implementation, ask:

1. **Is it domain-specific?** (Only useful for this exact tool)
2. **Is it reusable?** (Could work in 2+ tools with same/similar params)
3. **Is it a variation?** (Similar to existing module but with parameters)

**Decision Tree:**
```
Function Found
├── Domain-specific? → Keep in tool file
├── Reusable?
│   ├── Exists in catalog? → Reference existing module
│   └── New? → Add to modules-to-build.md
└── Variation?
    ├── Can parameterize existing? → Update existing module
    └── Fundamentally different? → New module
```

### Step 2: Document Module

For each new module, document:

```markdown
### MODULE-XXX: {function_name}

**Category:** {MATH/COLOR/CANVAS/etc.}
**Source:** {tool-file.js} lines {X-Y}
**Similar to:** {existing MODULE-ID if variation}

**Signature:**
```javascript
function name(param1, param2, options) → returnType
```

**Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| param1 | type | value | description |

**Dependencies:**
- MODULE-XXX (if any)

**Example:**
```javascript
const result = name(value1, value2);
```

**Used by:**
- tool-name-1
- tool-name-2
```

### Step 3: Check Against Compendium

Before creating new module:

1. Search `module-compendium.md` for similar functionality
2. Check if existing module can be parameterized
3. If truly new, add to `modules-to-build.md`

### Step 3b: Research Pipeline Trigger

If the needed module is:
- An algorithm named in docs but not coded anywhere
- A mathematical technique requiring formal definition
- Not in the existing codebase at all

Switch to the **Research Pipeline**:

```
1. Check reference corpus: blog/ideas/reference documentation/
2. If not present: Query Wikipedia REST API
3. Parse LaTeX from <math alttext="...">
4. Create typed function from formula
5. Add to modules-to-build.md with source: "📚 Research"
```

See `Processes/agentic-research-to-implementation.md` for full details.

### Step 4: Implement Module

When building modules:

1. Create in appropriate shared file (`assets/js/shared/{category}.js`)
2. Follow existing patterns (pure functions, no side effects)
3. Export from shared index
4. Update `module-compendium.md`

---

## 6. Page Specification Format

After audit and module extraction, create page specification:

```markdown
# {Page Name} — Specification

## 1. Overview
- Purpose
- Output type
- Interaction model

## 2. UI Structure
- Sidebar tabs/blocks/components
- Canvas configuration
- Status displays

## 3. Module Dependencies

| Category | Module ID | Purpose |
|----------|-----------|---------|
| Math | MATH-001 | safePow for equation |
| Color | COLOR-003 | deltaE76 for matching |
| Canvas | CANVAS-001 | PNG export |

## 4. Custom Logic
- Page-specific code (not modularized)
- State management
- Event handlers

## 5. Implementation References

```javascript
// Required imports
import { safePow, lerp } from 'shared/math.js';
import { deltaE76 } from 'shared/color.js';
import { exportPng } from 'shared/canvas.js';

// Module usage
const result = safePow(base, exp);
```

## 6. Visual Design
- Color scheme (VGA vars)
- Layout (F-system)
- Typography

## 7. Testing Checklist
- Functional tests
- Visual tests
- Performance tests
```

---

## 7. AI Agent Workflow

### Phase 1: Batch Intake

```
INPUT: 50 markdown files describing pages

FOR EACH page_doc:
    1. Parse page_doc for:
       - Feature list
       - UI requirements
       - Technical requirements
       - Mathematical operations
       - Visual/audio outputs
    
    2. Generate preliminary audit:
       - Extract function signatures
       - Identify reusable candidates
       - Note dependencies
    
    3. Add to processing queue
```

### Phase 2: Module Comparison

```
FOR EACH preliminary_audit:
    1. Load existing module catalog
    
    2. FOR EACH candidate_function:
       a. Search catalog for matches:
          - Exact match → Reference existing
          - Similar match → Check if parameterizable
          - No match → Flag as new
       
       b. Document comparison result
    
    3. Generate module gap list
```

### Phase 3: Module Planning

```
1. Aggregate all new modules needed

2. Group by category:
   - Math, Color, Canvas, etc.

3. FOR EACH new_module:
   a. Define signature
   b. List dependencies
   c. Identify implementation source
   d. Add to modules-to-build.md

4. FOR EACH parameterizable module:
   a. Document current params
   b. Define new params needed
   c. Add to modules-to-update.md
```

### Phase 4: Module Implementation

```
FOR EACH module in modules-to-build.md:
    1. Identify target shared file
    
    2. Implement function:
       - Pure function (no side effects)
       - Full JSDoc comments
       - Type annotations
       - Error handling
    
    3. Add to shared index exports
    
    4. Update module-library-reference.md
    
    5. Mark complete in build list
```

### Phase 5: Page Specification

```
FOR EACH page:
    1. Generate full specification:
       - UI structure from requirements
       - Module imports from analysis
       - Custom logic skeleton
       - Visual design from guides
    
    2. Include code references:
       - Specific file paths
       - Line numbers where possible
       - Import statements
    
    3. Generate implementation scaffold
```

### Phase 6: Implementation

```
FOR EACH page_specification:
    1. Create tool file scaffold
    
    2. Import required modules
    
    3. Implement TOOL_CONFIG:
       - title
       - sidebar structure
       - canvas config
       - callbacks
    
    4. Implement custom logic
    
    5. Wire to router
    
    6. Test against specification
```

---

## 8. Quality Checks

### Module Quality

- [ ] Pure function (no global state)
- [ ] Complete parameter documentation
- [ ] Error handling for edge cases
- [ ] Unit tests where applicable
- [ ] JSDoc comments

### Audit Quality

- [ ] All 7 sections complete
- [ ] Module IDs properly referenced
- [ ] Source file comparisons done
- [ ] Gap summary actionable

### Page Specification Quality

- [ ] Module dependencies complete
- [ ] UI structure matches guides
- [ ] Code references accurate
- [ ] Testing checklist specific

---

## 9. Module Naming Convention

```
{CATEGORY}-{NUMBER}: {descriptive_name}

Examples:
MATH-001: safePow
COLOR-003: deltaE76
CANVAS-002: exportSvg
ANIM-004: Sequencer
```

Categories:
- MATH — Mathematical operations
- COLOR — Color manipulation
- CANVAS — Canvas/rendering
- GEO — Geometry/spatial
- ANIM — Animation
- PHYS — Physics/simulation
- IMG — Image processing
- AUDIO — Web Audio
- PAT — Patterns/textures
- UI — UI components
- EXPORT — File export
- STATE — State management

---

## 10. Example: Processing a New Page

### Input: `my-new-tool.md`

```markdown
# My New Tool

Creates gradient visualizations with:
- LAB color interpolation
- Easing functions
- PNG export
- Animated transitions
```

### Step 1: Audit Generation

```markdown
# My New Tool — Audit

## 5. Extracted Modules

| Need | Module ID | Status |
|------|-----------|--------|
| LAB interpolation | COLOR-002, COLOR-007 | Existing |
| Easing | MATH-005 | Existing |
| PNG export | CANVAS-001 | Existing |
| Animated transitions | ANIM-001 | Existing |

All required modules exist. No new modules needed.
```

### Step 2: Page Specification

```markdown
# My New Tool — Specification

## 3. Module Dependencies

| Category | Module ID | Purpose |
|----------|-----------|---------|
| Color | COLOR-002 | rgbToLab |
| Color | COLOR-007 | vecSub for interpolation |
| Math | MATH-005 | easeInOut |
| Canvas | CANVAS-001 | exportPng |
| Anim | ANIM-001 | AnimationLoop |

## 5. Implementation References

```javascript
import { rgbToLab, vecSub } from 'shared/color.js';
import { easeInOut } from 'shared/math.js';
import { exportPng } from 'shared/canvas.js';
// AnimationFoundation loaded globally
```
```

---

## 11. Maintenance

### Adding New Module Categories

1. Create `{category}-modules.md` in Functions/
2. Add category code to naming convention
3. Update this guide's category list
4. Create shared JS file if needed

### Updating Existing Modules

1. Update module in shared JS file
2. Bump version comment
3. Update `module-library-reference.md`
4. Check dependent pages for compatibility

### Deprecating Modules

1. Mark deprecated in catalog
2. Add migration notes
3. Keep for backwards compatibility
4. Remove in major version bump

