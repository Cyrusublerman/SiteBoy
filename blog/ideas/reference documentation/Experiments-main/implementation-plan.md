# Experiments-main to SiteBoy Tool Page Implementation Plan

## Executive Summary
This document outlines the systematic conversion of Experiments-main into a SiteBoy tool page following the enforced 6-phase implementation process. The analysis requires full examination of UX/UI, algorithms, functions, and APIs from the reference source.

## Current Status
- **Phase:** P0 (Pre-Flight Check)
- **Blocker:** Experiments-main source code not yet acquired
- **Next Action:** Populate `reference/Experiments-main/` with complete source code

## Required Reference Content
Place the following in `reference/Experiments-main/`:

### Core Source Files
- [ ] Main application entry point (HTML/JS)
- [ ] Core algorithm implementations
- [ ] UI component definitions
- [ ] Configuration and parameter files
- [ ] Documentation and README files

### UX/UI Assets
- [ ] Screenshots of interface
- [ ] Wireframes or mockups (if available)
- [ ] Style definitions (CSS/SCSS)
- [ ] Asset files (images, icons, fonts)

### Algorithm Documentation
- [ ] Mathematical formulas used
- [ ] Algorithm descriptions
- [ ] Performance characteristics
- [ ] Known limitations or edge cases

### API Documentation
- [ ] External service integrations
- [ ] Data format specifications
- [ ] Network communication patterns
- [ ] Authentication requirements

## Analysis Framework Overview

### Phase 0: Context Acquisition (Current)
- Acquire complete Experiments-main source code
- Perform comprehension check without notes
- Identify system architecture (unified vs separate)
- Determine core data structures
- Extract integration relationships

### Phase 0.5: Architecture Pattern Recognition
- Classify system type (Unified/Modular/Sequential/Separate)
- Define core data structure with TypeScript interface
- Map all integration relationships
- Create architecture diagram
- Validate data flow completeness

### Phase 1: Technique Extraction
- Identify all techniques with roles (Generator/Transformer/Renderer)
- Map data sources and sinks for each technique
- Create dependency graph showing execution order
- Verify technique integration against architecture

### Phase 2: Knowledge Sourcing
- Find reference documentation for each technique
- Verify architecture match (grid vs network vs graph)
- Document gaps where adaptation needed
- Ensure all formulas are accessible

### Phase 2.5: Formula-to-Code Verification (MANDATORY)
- Extract all mathematical formulas
- Create term-by-term mapping tables
- Verify code implementations match formulas
- Document any mathematical discrepancies

### Phase 3: Library Mapping
- Map techniques to existing SiteBoy algorithms
- Identify gaps requiring new implementations
- Plan adaptations for architecture differences
- Verify type compatibility between functions

### Phase 3.5: Page Module Design
- Design tool page JSON structure
- Define UI controls and parameters
- Implement conditional visibility rules
- Plan responsive layout using MathematicalFoundation

### Phase 4: Documentation Generation
- Create design fidelity verification
- Document UI interactions and data flow
- Generate comprehensive API specifications
- Validate against original Experiments-main claims

### Phase 5: Implementation with Verification
- Build core data structures
- Implement generators, transformers, renderers
- Verify all integrations work correctly
- Continuous testing against architecture requirements

### Phase 6: Final Validation
- Run all SiteBoy checklists (ui-bijection, f-system, color-system, etc.)
- Verify animation foundation usage
- Check lazy loading and export rules
- Final algorithm integration validation

## SiteBoy Architecture Constraints
All implementation must follow `.cursorrules`:

### File Ownership (MANDATORY)
- Layout math → `assets/js/core/mathematical-foundation.js`
- Base OO system → `assets/js/core/base-component.js`
- Animation logic → `assets/js/core/animation-foundation.js`
- UI components → `assets/js/shared/component-library.js`

### Mandatory Patterns
- All UI classes extend `BaseComponent`
- MathematicalFoundation for all dimensional calculations
- AnimationFoundation for all animations (NO manual RAF/setInterval)
- JSON-driven page rendering via ComponentLibrary

### Style Constraints
- Colors: CSS vars `var(--vga-*)` only
- Typeface: Space Mono only
- Disallowed: gradients, shadows, rounded corners

## Success Criteria
- [ ] Complete UX/UI analysis of Experiments-main
- [ ] All algorithms and functions documented
- [ ] APIs and integrations identified
- [ ] SiteBoy tool page fully functional
- [ ] Passes all Phase 6 validation checklists
- [ ] Maintains Experiments-main core functionality
- [ ] Follows SiteBoy architecture patterns

## Risk Assessment
- **High Risk:** Experiments-main architecture incompatible with SiteBoy constraints
- **Medium Risk:** Complex algorithms require significant adaptation
- **Low Risk:** UI/UX patterns can be mapped to ComponentLibrary

## Next Steps
1. Acquire Experiments-main source code
2. Complete Phase 0 comprehension check
3. Proceed through phases P0.5 → P6 systematically
4. Implement with continuous validation
5. Deploy as functional SiteBoy tool page