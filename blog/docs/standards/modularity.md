<!-- generated: do not edit -->

# Modularity

29 rules in this category.

## modularity-DE2C0CC1

**MUST_NOT:** Do not rely on a single AI provider.

*Provider abstraction avoids lock-in and enables benchmarking and fallback.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## modularity-8A048FFE

**MUST:** Design the system to be model-agnostic.

*Replaceable AI workers prevent vendor lock-in and enable benchmarking.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## modularity-14199FF6

**MUST:** Make AI providers interchangeable by configuration.

*Configuration-driven provider swap avoids code changes when switching models.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## modularity-FD0905E0

**MUST:** Store derivative versions separately from canonical source objects.

*Separate derivative storage keeps provenance clear and enables version comparison.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## modularity-BC262883

**MUST_NOT:** Avoid VBA macros and external dependencies.

*Dependency-free queries run in Excel Online and reduce security review burden.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## modularity-0F4B6925

**MUST:** Structure code modularly for easy updates.

*Modular M code allows format handlers to be added without rewriting the pipeline.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## modularity-F9FD3662

**MUST_NOT:** Do not duplicate logic that performs the same task in multiple places.

*Repeated identical logic is harder to maintain when behaviour must change.*

Sources:
- https://piccalil.li/blog/programming-principles-for-self-taught-front-end-developers/

---

## modularity-FE2970EE

**MUST:** Use modular Python for processing and restrict shell to capture orchestration only.

*Separates brittle screenshot triggers from extensible OCR, layout, and vision modules.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## modularity-458F2302

**MUST_NOT:** Do not overwrite OCR data when producing structured layout blocks.

*Layout inference is a separate derived layer that must preserve the raw OCR record.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## modularity-21AE73B5

**MUST:** Let the Python layer own all post-capture processing.

*Centralises OCR, layout, vision, and Markdown generation in one extensible codebase.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md

---

## modularity-56A90079

**SHOULD:** Allow OCR provider switching via configuration.

*Swappable providers support benchmarking and fallback without pipeline rewrites.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md

---

## modularity-77DC9E5F

**SHOULD:** Provide access to pre-made vectors or graphics for shape matching.

*Pre-made assets speed matching and improve reconstruction fidelity.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/note-capture-pipeline.md

---

## modularity-391BFCEE

**SHOULD:** Use List.Accumulate instead of nested Text.Replace for many replacements.

*Accumulator passes reduce complexity from quadratic to linear for large dictionaries.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## modularity-A764AF82

**SHOULD:** Add new format handlers to the replacement dictionary before extending parsing.

*Dictionary entries are the documented extension point for new text tokens.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## modularity-BAE253A2

**SHOULD:** Create a specialized handler for novel date format patterns.

*Complex formats need dedicated logic beyond dictionary substitution.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## modularity-AFF720D2

**SHOULD:** Insert new specialized handlers into the parsing waterfall.

*Waterfall ordering determines which handler runs before fallbacks.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## modularity-2E1DC1C5

**SHOULD:** Use try-otherwise so Date.From failures return null instead of throwing.

*Non-throwing parse attempts keep batch transforms from halting on bad rows.*

Sources:
- file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md

---

## modularity-0DBD82DE

**SHOULD:** Understand the semantic meaning of HTML elements.

*Semantic HTML supports readable, honest websites that work across browsers and assistive technology.*

Movements: `brutalism`

Sources:
- https://brutalist-web.design/

---

## modularity-E16C7480

**SHOULD:** On third duplicate need, generalise the three implementations into one shared implementation.

*Three cases expose what can be simplified and whether one abstraction fits all.*

Sources:
- https://piccalil.li/blog/programming-principles-for-self-taught-front-end-developers/

---

## modularity-BB9C0574

**SHOULD:** Write functions to be idempotent wherever possible.

*Same inputs always yielding the same outputs simplifies reasoning about call sites.*

Sources:
- https://piccalil.li/blog/programming-principles-for-self-taught-front-end-developers/

---

## modularity-59B50A32

**SHOULD:** Split side effects into their own function and make that function idempotent.

*Isolating non-idempotent effects limits duplicate-call hazards from retries or double-clicks.*

Sources:
- https://piccalil.li/blog/programming-principles-for-self-taught-front-end-developers/

---

## modularity-1D1E9595

**SHOULD:** Give each function, module, or class only one reason to change.

*Single responsibility lets you treat units as black boxes when reasoning about the system.*

Sources:
- https://piccalil.li/blog/programming-principles-for-self-taught-front-end-developers/

---

## modularity-93BE8697

**SHOULD:** Keep database access out of code that is not responsible for persistence.

*Hiding ORM details behind one module avoids leaking storage mechanics across the codebase.*

Sources:
- https://piccalil.li/blog/programming-principles-for-self-taught-front-end-developers/

---

## modularity-94819B27

**SHOULD:** Separate data retrieval from data formatting into distinct modules.

*Coupling fetch and format forces coordinated changes when either storage or shape changes.*

Sources:
- https://piccalil.li/blog/programming-principles-for-self-taught-front-end-developers/

---

## modularity-078F2D0C

**SHOULD:** Split a unit whose one-sentence description requires the word and.

*Multiple and-clauses in one sentence signal multiple responsibilities in one place.*

Sources:
- https://piccalil.li/blog/programming-principles-for-self-taught-front-end-developers/

---

## modularity-7459AFAE

**SHOULD:** Keep each function at a single level of abstraction.

*Mixed detail levels force the reader to shift mental focus line by line.*

Sources:
- https://piccalil.li/blog/programming-principles-for-self-taught-front-end-developers/

---

## modularity-980D18F5

**SHOULD:** Split functions that need multiple and when describing what they do.

*Several and-clauses indicate multiple concerns bundled in one function.*

Sources:
- https://piccalil.li/blog/programming-principles-for-self-taught-front-end-developers/

---

## modularity-0E5744BF

**SHOULD:** Split functions that contain multiple loops over the same data.

*Repeated iteration patterns often mean separate abstraction levels should be extracted.*

Sources:
- https://piccalil.li/blog/programming-principles-for-self-taught-front-end-developers/

---

## modularity-3B405D51

**SHOULD:** Ensure each function does only one thing.

*Single-purpose functions are easier to reason about and reuse across call sites.*

Sources:
- https://piccalil.li/blog/programming-principles-for-self-taught-front-end-developers/

---
