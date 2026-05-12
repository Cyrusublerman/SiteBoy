# Synthetic Biophilia

Synthetic Biophilia is a research-to-fabrication project that converts phyllotaxis (golden-angle leaf arrangement) into a hollow dome architecture: a deterministic 3D point field, a lamella-style crossing lattice of straight members, and optional leaf/glazing attachments suitable for downstream fabrication (Blender/Python export).

## Technical Domain

Biophilic design theory (organised complexity), discrete geometry, phyllotaxis and Fibonacci structure, lattice/joint construction on a lifted surface, planarisation of trapezoidal negative space, and attachment placement under clearance/non-piercing constraints.

## Architecture

### 1. Narrative justification as an engineering constraint
The project’s motivation is not decorative; it constrains what “structure” must preserve:
- ordered complexity rather than random ornament
- a stable mapping from mathematical parameters to tangible spatial affordances

The design logic is framed via biophilic design patterns and living-structure properties, then implemented as a generative pipeline.

### 2. Mathematical base: phyllotactic polar field
The seed distribution is the Vogel-style polar model:
- radius: `r_k = C * sqrt(k)`
- azimuth: `theta_k = k * alpha`
- divergence angle: golden-angle target `alpha ≈ 137.508°`

This is lifted into 3D by a dome mapping that provides `z_k` as a deterministic function of index (index-based lift), with an explicit boundary condition to constrain the outer ring.

The project uses:
- index-based height lift: `z_k = h_max * (1 - k/N)`
- boundary scaling: `C = R / sqrt(N)` so `r_N = R`

See: `[projects/Synthetic Biophilia/md/phyllotaxis.md](projects/Synthetic Biophilia/md/phyllotaxis.md)` and `[projects/Synthetic Biophilia/md/theory.md](projects/Synthetic Biophilia/md/theory.md)` and `[projects/Synthetic Biophilia/md/dome-formation.md](projects/Synthetic Biophilia/md/dome-formation.md)`.

### 3. Lattice generation: arch families as residue classes
To connect points into a coherent framework without piercing the hollow interior, the project uses residue-class arch families:
- define residue classes `F(N,i) = { k | k ≡ i (mod N) }`
- for each class, connect points as an every-`N` chain: `k → k+N → k+2N → ...`

Two denominators `N1` and `N2` produce crossing lamella families:
- each family yields arches as straight chords between dome points
- the crossing family yields a two-direction lamella lattice

Denominator selection is constrained by wrap error and commensurability:
- compute `phi = alpha/(2*pi)`
- define `delta(N) = min_m |N*phi - m|`
- prefer small `delta(N)` and coprime denominator pairs (often adjacent Fibonacci denominators)
- enforce constraints on azimuth step to keep arches adhering to the shell: `|DeltaTheta_N| <= theta_max` for a chosen window

See: `[projects/Synthetic Biophilia/md/lattice.md](projects/Synthetic Biophilia/md/lattice.md)`.

### 4. Joints and structural direction vectors
Each lattice node defines a neighbour set:
- `N(m) = { m±N1, m±N2 }` (filtered to valid indices)

For each neighbour `q`, the joint stores:
- the neighbour vector `v = p_q - p_m`
- the unit direction for fabrication placement

For attachment placement and fabrication parameterisation, vectors are expressed in spherical coordinates `(r, theta, phi)` to provide a robust transform basis even when the dome deviates from a perfect spherical cap.

See: `[projects/Synthetic Biophilia/md/lattice.md](projects/Synthetic Biophilia/md/lattice.md)`.

### 5. Negative space and panelisation
The lattice induces trapezoidal quadrilateral cells:
- cell vertices: `(m, m+N1, m+N1+N2, m+N2)` when in range

To make cells fabrication-ready, the cell is planarised via a best-fit normal computed from adjacent triangle area vectors, then vertices are projected onto the planar basis before exporting outlines for cutting.

See: `[projects/Synthetic Biophilia/md/lattice.md](projects/Synthetic Biophilia/md/lattice.md)` for planarisation formulae and cut-file logic.

### 6. Leaves: attachment transforms and non-piercing constraints
Leaves attach to lattice joints and extend outward along the dome’s local flow:
- a local frame is constructed from neighbouring geometry (robust tangent-plane approximation using averaged triangle normals + PCA-style principal in-plane axes)
- tilt/twist/scale are computed as parametric functions of normalised radius and index
- continuity constraints (C1 continuity + phase locking heuristics) prevent visible frame flips/phase jumps

Clearance and non-piercing is enforced through:
- exterior test (leaf centroid outside the dome interior)
- chord-avoidance distance constraints between lattice segments and leaf surface
- spacing/footprint disc constraints to prevent overlap under packing

See: `[projects/Synthetic Biophilia/md/leaves.md](projects/Synthetic Biophilia/md/leaves.md)`.

## Tooling chain (in-site and production)

### 1. Interactive pedagogy (p5.js)
The project embeds p5-based interactive explorations:
- a divergence-angle sweep to visualise phyllotaxis behaviour
- a manual lattice explorer that tests denominators and connection constraints

See project page scripts: `projects/Synthetic Biophilia/assets/p5/*`.

### 2. Production geometry (Blender/Python)
Production scripts convert the same mathematical method into a Blender scene with deterministic collections:
- `points`, `lattice`, `joints`, `leaf` (and variants), and bottom/top structures
- a clear run order:
  1. main generator (point field + lattice + joints + cap/top)
  2. negative space / leaf generator
  3. optional leaf object adder

See: `[projects/Synthetic Biophilia/md/blender-code.md](projects/Synthetic Biophilia/md/blender-code.md)`.

## Skills Demonstrated (competency tags)

- Phyllotaxis model implementation (Vogel-style polar model, golden-angle constraint).
- Dome lift mapping with explicit boundary scaling.
- Discrete residue-class lattice construction and crossing lamella families.
- Vector-based joint frames and spherical coordinate transforms for fabrication.
- Planarisation and export-oriented geometry pipeline for negative space cells.
- Attachment placement with continuity and non-piercing constraints.
- Bridging interactive mathematical exploration to DCC production scripting.

## Stack

- Research theory: `[projects/Synthetic Biophilia/md/theory.md](projects/Synthetic Biophilia/md/theory.md)` and related project markdown.
- Interactive exploration: `projects/Synthetic Biophilia/assets/p5/`.
- Production scripts and fabrication logic: `[projects/Synthetic Biophilia/md/blender-code.md](projects/Synthetic Biophilia/md/blender-code.md)`.

