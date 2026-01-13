# Idea to Implementation v3 — ENFORCED Edition

**Version:** 3.0 ENFORCED  
**Key Change:** Every phase has VALIDATION GATES that must pass with 100% before proceeding

---

## Critical Difference From v2

**v2:** Described what to do (agent could comply superficially)  
**v3:** Enforces understanding via YES/NO verification questions

**You cannot proceed to the next phase if ANY verification question is NO.**

---

## Phase 0: Pre-Flight Check

Read the idea document ONCE completely without taking notes.

**GATE 0: Comprehension Check**

Answer these questions WITHOUT looking back:

1. Is this a unified system (one structure, multiple views) or separate tools?
   Answer: [Unified / Separate / Hybrid]
   
2. What is the PRIMARY data structure everything operates on?
   Answer: [Grid / Point Network / Image / Graph / ...]
   
3. Name 3 integration relationships (e.g., "X modulates Y", "A determines B")
   Answer:
   - Relationship 1: ___
   - Relationship 2: ___
   - Relationship 3: ___

4. If the design mentions different "modes", are they:
   Answer: [Separate pipelines / Views of same data / Sequential transformations]

**Passing score: If you cannot answer these, re-read the document.**

---

## Phase 0.5: Architecture Pattern Recognition

**Purpose:** Extract the CONCEPTUAL MODEL before diving into techniques.

### Step 1: Identify System Architecture Type

Read the idea document looking for architectural keywords:

**Unified system indicators:**
- "single framework"
- "all X emerge from Y"
- "shared data structure"
- "multiple views"
- "transitions via parameters"

**Separate system indicators:**
- "multiple tools"
- "mode selector"
- "independent pipelines"

**Classification:**
```markdown
## System Architecture Type

Type: [Check ONE]
- [ ] Unified Multi-View System
- [ ] Modular Coordinated System
- [ ] Sequential Pipeline
- [ ] Separate Tools Collection

Evidence (quote 3+ sentences from idea doc):
1. "[Quote showing this pattern]"
2. "[Quote showing this pattern]"
3. "[Quote showing this pattern]"
```

### Step 2: Extract Core Data Structure

**Question:** What is the ONE data structure that ALL features read/write?

```markdown
## Core Data Structure

**Primary structure:** [Point Network / Grid / Image / Tree / ...]

**Properties it must have:**
- Property 1: [name] — used by [feature A, feature B]
- Property 2: [name] — used by [feature C]
- ...

**TypeScript definition:**
```typescript
interface CoreData {
    // Define the structure
}
```

**Evidence from idea doc:**
"[Quote saying what the core structure is]"
```

### Step 3: Map Integration Relationships

**For EACH feature, identify HOW it integrates:**

```markdown
## Integration Map

Feature A: [Name]
- Consumes: [data from where?]
- Produces: [data to where?]
- Modulates: [affects what other feature?]
- Quote: "[Original doc says how it integrates]"

Feature B: [Name]
- Consumes: [data from where?]
- Produces: [data to where?]
- Modulates: [affects what other feature?]
- Quote: "[Original doc says how it integrates]"
```

### Step 4: Create Architecture Diagram

```
[CoreData Structure]
       ↓
   Feature A (reads/writes properties)
       ↓
   Feature B (reads properties modified by A)
       ↓
   Renderer 1 (views CoreData)
   Renderer 2 (views CoreData)
```

### GATE 0.5: Architecture Validation

❓ **Can you trace data flow from input to output?**
- [ ] YES — Every feature connects to CoreData
- [ ] NO — Missing connections (identify and add)

❓ **If design says "X modulates Y", does the diagram show data flow from X to Y?**
- [ ] YES — Data path exists
- [ ] NO — Integration missing (revise diagram)

❓ **If design says "unified", is there ONE shared structure or multiple separate ones?**
- [ ] ONE — Unified system verified
- [ ] MULTIPLE — Architecture doesn't match design (FAIL)

❓ **Can you explain how "modes" work without looking at the doc?**
- [ ] YES — They are [views/alternatives/states] of [shared/separate] data
- [ ] NO — Re-read mode relationships

**Passing score: 100% YES or you cannot proceed to Phase 1**

---

## Phase 1: Technique Extraction

**Now** extract techniques, but in context of the architecture you identified.

### Step 1: Extract Techniques With Roles

```markdown
| Technique | Role | Data Source | Data Sink | Integration |
|-----------|------|-------------|-----------|-------------|
| [Name] | [Generator/Transformer/Renderer] | [What it reads] | [What it writes] | [Quote: how it affects others] |
```

**Roles:**
- **Generator:** Creates data from scratch or parameters
- **Transformer:** Modifies existing data
- **Renderer:** Displays data without modifying

### Step 2: Dependency Graph

For each technique, answer:
- **Depends on:** [Which techniques must run before this?]
- **Depended on by:** [Which techniques need this one's output?]

```markdown
## Dependency Graph

Generator → Transformer A → Transformer B → Renderer
    ↓
Transformer C ← (depends on Generator)
```

### GATE 1: Technique Integration Verification

❓ **For EACH technique, can you name what data structure it reads/writes?**
- [ ] YES — All connected to CoreData
- [ ] NO — Missing data connections (identify)

❓ **Can you trace a path from Generator to Renderer through transformers?**
- [ ] YES — Complete pipeline
- [ ] NO — Broken chain (find missing links)

❓ **If idea doc says "X determined by Y", is Y before X in dependency graph?**
- [ ] YES — Dependencies correct
- [ ] NO — Order wrong (revise)

**Passing score: 100% YES**

---

## Phase 2: Knowledge Sourcing WITH Architecture Check

For EACH technique, find reference documentation BUT verify it matches the architecture.

### Step 1: Find References

```markdown
| Technique | Reference Found | Architecture Match? | Notes |
|-----------|----------------|---------------------|-------|
| Gray-Scott RD | 08_RD/Gray-Scott.md | [Grid/Network] | Need network version? |
```

### Step 2: Architecture Match Verification

**For EACH reference, check:**

❓ **Does the reference algorithm operate on the SAME structure type as your design?**

Example:
- Your design: Point Network
- Reference: Grid-based RD
- Match? NO → Need to adapt or implement network version

```markdown
## Architecture Match Report

| Technique | Design Needs | Reference Provides | Match? | Gap Action |
|-----------|-------------|-------------------|--------|------------|
| RD Evolution | Network (edges between points) | Grid (2D array) | ❌ NO | Implement RD on network |
| Truchet | From connectivity | Random grid generation | ❌ NO | Implement tile-from-connectivity |
```

### GATE 2: Reference Adequacy

❓ **For techniques marked NO in "Match?" column, have you identified the gap?**
- [ ] YES — All gaps documented
- [ ] NO — Check each mismatch

❓ **For matched references, do they contain the formula/algorithm you need?**
- [ ] YES — All formulas present
- [ ] NO — Missing details (fetch or research)

**Passing score: 100% YES**

---

## Phase 2.5: Formula-to-Code Verification (MANDATORY)

For EACH mathematical formula, create term-by-term mapping.

### Step 1: Extract Formula

```markdown
## [Technique Name] Formula Verification

**Source:** [Reference doc path]
**Formula:** 
$$
\frac{\partial u}{\partial t} = D_u \nabla^2 u - uv^2 + f(1-u)
$$
```

### Step 2: Term-by-Term Mapping Table

```markdown
| Math Term | Meaning | Expected Code Pattern | Example |
|-----------|---------|----------------------|---------|
| $D_u \nabla^2 u$ | U diffusion | `Du * laplacian(u, ...)` | `Du * laplacian5(u, width, height, x, y)` |
| $-uv^2$ | Reaction (prey eaten) | `-(u[idx] * v[idx] * v[idx])` | `const v2 = v[idx]*v[idx]; const uv2 = u[idx]*v2;` |
| $f(1-u)$ | Feed rate | `feed * (1 - u[idx])` | `params.feed * (1 - uVal)` |
```

### Step 3: Code Verification

```markdown
**Implementation location:** [file:line]

**Actual code:**
```javascript
// Paste actual implementation here
```

**Verification:**
| Math Term | Code Expression | Match? |
|-----------|----------------|--------|
| $D_u \nabla^2 u$ | `Du * lapU` | ✓ |
| $-uv^2$ | `-uv2` where `uv2 = u*v*v` | ✓ |
| $f(1-u)$ | `feed * (1-u)` | ✓ |
```

### GATE 2.5: Mathematical Correctness

❓ **For EACH formula, does every term map to code correctly?**
- [ ] YES — All terms verified
- [ ] NO — Identify mismatch and fix

❓ **Are variable names in code consistent with mathematical notation?**
- [ ] YES — Clear correspondence
- [ ] NO — Add comments mapping variables

**Passing score: 100% YES**

---

## Phase 3: Library Mapping WITH Integration Check

### Step 1: Find Library Functions

```markdown
| Technique | Library Function | Input Type | Output Type | Status |
|-----------|-----------------|------------|-------------|--------|
| Gray-Scott | ReactionDiffusion.stepGrayScott | (u: Float32Array, v: Float32Array, width, height, params) | {u, v} | ✓ Exists |
```

### Step 2: Integration Verification

**Critical check:** Does the function I/O match my architecture?

```markdown
## Integration Verification

**Technique:** Gray-Scott RD

**Design needs:**
- Operates on: Point Network (each point has {u, v})
- Diffusion via: Edges between points

**Library function provides:**
- Operates on: 2D Grid (u[y*width+x], v[y*width+x])
- Diffusion via: 5-point stencil

**Match?** ❌ NO

**Gap:** Need to implement network-based diffusion

**Implementation plan:**
```javascript
function stepRD_onNetwork(points, edges, params) {
    // For each point:
    //   1. Compute network Laplacian (sum over edges)
    //   2. Apply Gray-Scott reaction
    //   3. Update point.u, point.v
}
```
```

### GATE 3: Library Integration

❓ **For EACH technique, does the library function match your architecture?**
- [ ] YES — Can use directly
- [ ] NO — Must adapt or implement (documented in Gap column)

❓ **Can you connect library function outputs to other library function inputs?**
- [ ] YES — Types match
- [ ] NO — Need adapter (document)

❓ **If you marked "Need to implement", do you have the formula from Phase 2.5?**
- [ ] YES — Can implement
- [ ] NO — Missing knowledge (go back to Phase 2)

**Passing score: 100% YES**

---

## Phase 4: Generate Documentation (WITH VALIDATION)

### 04-system-architecture.md

**Required section: Design Fidelity Check**

```markdown
## Design Fidelity Verification

**Original design document:** [path]

### Architectural Claims Verification

**Claim 1:** "[Quote from original]"
- Implementation: [Specific code/structure that achieves this]
- Evidence: [File:line or data structure definition]
- Verified: ✓/❌

**Claim 2:** "[Quote from original]"
- Implementation: [Specific code/structure that achieves this]
- Evidence: [File:line or data structure definition]
- Verified: ✓/❌

### Data Flow Comparison

**Original design said:**
```
[Quote data flow from original]
```

**Implementation achieves:**
```
[Your data flow diagram]
```

**Match?** ✓/❌

### GATE 4: Architecture Fidelity

❓ **For EACH architectural claim, is there specific code evidence?**
- [ ] YES — All claims implemented
- [ ] NO — Missing implementations (STOP)

❓ **Does your data flow match the original design's data flow?**
- [ ] YES — Flows are equivalent
- [ ] NO — Divergence (explain or revise)

**Passing score: 100% YES or you must revise implementation plan**
```

### 01-design-spec.md Section 4: Interactions (ENHANCED)

```markdown
## 4. Interactions

| Parameter | Triggers | **Conditional UI** | **Data Flow** | Visible Change |
|-----------|----------|--------------------|---------------|----------------|
| evolutionMode | initFields(), stepEvolution() | **IF 'RD': show [Du, Dv, Feed, Kill]<br>IF 'CA': show [CA Rule]<br>IF 'None': hide all** | Sets point.u/point.v (RD) or point.alive (CA) | Simulation starts |
| renderMode | draw() | **IF 'Truchet': show [Tile Window]<br>IF 'Nested'/'Global': show [Contour Count]** | Renderer reads point.weight, distanceField | Rendering style changes |

### UI Implementation

**Method:** [ToolBase conditional visibility / Dynamic tab generation / Other]

**Code example:**
```javascript
// If ToolBase supports:
['slider', 'Du', ..., { visibleWhen: { key: 'evolutionMode', value: 'Reaction-Diffusion' }}]

// Or if not:
// Describe implementation approach
```
```

---

## Phase 5: Implementation WITH CONTINUOUS VERIFICATION

### Implementation Checklist (Must Complete in Order)

- [ ] **Step 1:** Implement Core Data Structure
  - [ ] Define point/edge/state types
  - [ ] Matches 04-system-architecture.md? YES/NO
  
- [ ] **Step 2:** Implement Generators
  - [ ] Creates CoreData
  - [ ] Output matches expected type? YES/NO
  
- [ ] **Step 3:** Implement Transformers
  - [ ] Reads/writes CoreData
  - [ ] Formula verification passes? YES/NO
  
- [ ] **Step 4:** Implement Renderers
  - [ ] Reads CoreData (does not modify)
  - [ ] All use same data source? YES/NO
  
- [ ] **Step 5:** Verify Integration
  - [ ] Transformer A affects Transformer B? YES/NO
  - [ ] All architectural claims from GATE 4 satisfied? YES/NO

### Continuous Verification

After implementing EACH function:

```markdown
## Function: [name]

**Design requirement:** "[Quote from architecture doc]"
**Formula (if applicable):** [LaTeX]
**Implementation:** [file:line]

**Verification:**
- [ ] Input type matches expected
- [ ] Output type matches expected
- [ ] Formula terms map correctly (if math)
- [ ] Integrates with other functions
- [ ] No side effects on unrelated data

**Test:**
```javascript
// Minimal test showing it works
const input = {...};
const output = functionName(input);
assert(output.property === expected);
```
```

---

## Summary: Why This Version Works

### v2 (Old):
- "Extract techniques" → agent makes list without understanding
- "Find references" → agent finds files without checking fit
- "Map to library" → agent matches names without verifying architecture
- "Document architecture" → agent describes what was built, not what should be

### v3 (Enforced):
- **GATE after every phase** with YES/NO questions that must pass
- **Architecture extraction FIRST** before technique details
- **Integration verification** at every mapping step
- **Formula-to-code tables** catch math bugs
- **Design fidelity checks** maintain original vision

**You cannot skip understanding because the gates force you to demonstrate it.**

---

End of Guide






