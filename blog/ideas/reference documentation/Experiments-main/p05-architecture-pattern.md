# Phase 0.5: Architecture Pattern Recognition
**Status:** BLOCKED - Requires Phase 0 completion

## System Architecture Type Classification

### Analysis Framework
```
## System Architecture Type

Type: [Check ONE]
- [ ] Unified Multi-View System
- [ ] Modular Coordinated System
- [ ] Sequential Pipeline
- [ ] Separate Tools Collection

Evidence (quote 3+ sentences from Experiments-main source):
1. "[Quote showing this pattern]"
2. "[Quote showing this pattern]"
3. "[Quote showing this pattern]"
```

## Core Data Structure Definition

### Primary Structure Analysis
```
## Core Data Structure

**Primary structure:** [Point Network / Grid / Image / Tree / Custom: ________]

**Properties it must have:**
- Property 1: [name] — used by [feature A, feature B]
- Property 2: [name] — used by [feature C]
- ...

**TypeScript definition:**
```typescript
interface ExperimentsCoreData {
    // Define the structure based on analysis
}
```

**Evidence from Experiments-main:**
"[Quote saying what the core structure is]"
```

## Integration Relationships Mapping

### Feature Integration Analysis
```
## Integration Map

Feature A: [Name]
- Consumes: [data from where?]
- Produces: [data to where?]
- Modulates: [affects what other feature?]
- Quote: "[Experiments-main source says how it integrates]"

Feature B: [Name]
- Consumes: [data from where?]
- Produces: [data to where?]
- Modulates: [affects what other feature?]
- Quote: "[Experiments-main source says how it integrates]"
```

## Architecture Diagram

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

## GATE 0.5: Architecture Validation

❓ **Can you trace data flow from input to output?**
- [ ] YES — Every feature connects to CoreData
- [ ] NO — Missing connections (identify and add)

❓ **If Experiments-main says "X modulates Y", does the diagram show data flow from X to Y?**
- [ ] YES — Data path exists
- [ ] NO — Integration missing (revise diagram)

❓ **If Experiments-main says "unified", is there ONE shared structure or multiple separate ones?**
- [ ] ONE — Unified system verified
- [ ] MULTIPLE — Architecture doesn't match design (FAIL)

❓ **Can you explain how "modes" work without looking at the source?**
- [ ] YES — They are [views/alternatives/states] of [shared/separate] data
- [ ] NO — Re-read mode relationships

**Passing score: 100% YES or cannot proceed to Phase 1**