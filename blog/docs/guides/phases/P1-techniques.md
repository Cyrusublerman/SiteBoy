# P1 Techniques

Inputs: IDEA_DOC, reqs.md, ARCH_TYPE, CORE_DATA.

CORE:
- For each REQ, list TECH covering it (Generator/Transformer/Renderer).
- For each TECH: reads/writes CORE_DATA, dependency order.
- Build GLOSSARY (TECH, Role, Reads, Writes, ReqLink).

CHECK:
- Every REQ has ≥1 TECH? Y/N
- Every TECH touches CORE_DATA? Y/N
- Generator→Renderer chain complete? Y/N

