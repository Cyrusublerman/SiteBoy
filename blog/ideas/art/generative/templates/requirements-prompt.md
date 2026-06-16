Generate a **complete deterministic requirements document** for the system described in `[INPUT]`.  
Fill every section below.  
If a requirement or process is implied by `[INPUT]`, you must formalise it explicitly here.  
Nothing may be omitted.  
No examples.  
No narrative.  
No vague language.

---

# [0] RULES

- One statement = one requirement or definition.
    
- All terms must be defined before use.
    
- All quantities must have explicit domains.
    
- All functions must have explicit formulas.
    
- All algorithms must be finite ordered sequences.
    
- All coordinate systems must be defined.
    
- All data structures must list fields + types.
    
- All processes must specify inputs, outputs, and steps.
    
- If randomness appears, define a single PRNG: modulus m, multiplier a, increment c, seed s₀, update X_{n+1} := (aX_n + c) mod m, and call order.
    
- If interpolation appears, define interpolation function(s) symbolically.
    
- If shading appears, define lighting, normals, and shading equations.
    
- If texture appears, define noise function, domain, and composition rule.
    
- If animation appears, define time variable t ∈ [0,1] or frame index f ∈ ℕ and all time-dependent functions.
    
- If `[INPUT]` leaves something unspecified but required, choose a deterministic value and state it.
    
- Document must be self-contained.
    

---

# [1] PURPOSE

□

# [2] TERMINOLOGY

□

# [3] FUNCTIONAL REQUIREMENTS

- □
    
- □
    
- □
    

# [4] NON-FUNCTIONAL REQUIREMENTS

- □
    
- □
    
- □
    

# [5] SYSTEM COMPONENTS

□

# [6] DATA STRUCTURES

□

# [7] COORDINATE SYSTEMS

□

# [8] PARAMETERS

|name|domain|default|effect|
|---|---|---|---|
|□|□|□|□|
|□|□|□|□|

# [9] ALGORITHMS & EQUATIONS

9.1 Layout equations: □  
9.2 Tile-grammar equations: □  
9.3 Shading equations: □  
9.4 Texture equations: □  
9.5 Animation equations: □

# [10] PROCESSES

10.1 Layout generation:

1. □
    
2. □
    
3. □
    

10.2 Tile assignment:

1. □
    
2. □
    

10.3 Tile rendering:

1. □
    
2. □
    
3. □
    

10.4 Frame rendering:

1. □
    
2. □
    

10.5 Export processes:

1. □
    

# [11] DETERMINISM & RANDOMNESS

□

# [12] GROUND TRUTH CASES

Case A (layout): □  
Case B (shading + texture): □  
Case C (full animation): □

# [13] CONSTRAINTS

□

# [14] FAILURE MODES

□

# [15] IMPLEMENTATION CHECKLIST

- □
    
- □
    
- □
    

---

# [VERIFY] COMPLETENESS MATRIX

|section|present?|
|---|---|
|PURPOSE|□|
|TERMINOLOGY|□|
|FUNCTIONAL|□|
|NON-FUNCTIONAL|□|
|COMPONENTS|□|
|DATA STRUCTURES|□|
|COORDINATES|□|
|PARAMETERS|□|
|ALGORITHMS|□|
|PROCESSES|□|
|DETERMINISM|□|
|GROUND TRUTH|□|
|CONSTRAINTS|□|
|FAILURE MODES|□|
|CHECKLIST|□|

---

# [INPUT]

(Insert system description here.)

**END PROMPT**