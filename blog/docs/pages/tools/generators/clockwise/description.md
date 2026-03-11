# Clockwise — Description

Clockwise models a system of N pixel-grid squares (N = `numSquares`, 2–12) orbiting a fixed canvas centre on a circular path of radius `orbitRadius`, each square simultaneously spinning about its own centre. The mathematical basis is polar coordinate composition: each cell within a square is defined at build time by its local polar coordinates (r, θ₀) relative to the square's pivot. Each frame, the square's pivot is placed on the orbit circle via `cx = 540 + orbitRadius × cos(startAngle + globalOrbitAngle)`, and every cell's canvas position is computed as `worldX = cx + r × cos(θ₀ + globalSpinAngle)`. Orbit and spin accumulate independently every frame, making the two rotational degrees of freedom fully decoupled.

Each square carries two independent scalar field grids — a pulse field (brightness, grid1) and a hue field (grid2). Both evolve via a discrete diffusion equation each frame: the next value of a cell is driven by its 3×3 neighbourhood average (cohesion term), a weighted neighbourhood difference (diffusion term), and a global decay factor. The hue field additionally has a per-square identity bias (`bias = squareIndex / numSquares`, distributing hues evenly across the hue wheel) that pulls each square's colour back toward its characteristic hue via `identityForce`.

When two squares' cells map to the same canvas pixel, their field values are exchanged — cross-contaminating pulse and hue between squares. A cooldown gate (`swapCooldown` frames) prevents cells from swapping on every frame of overlap.

Visually, the output is a field of small coloured square pixels arranged in circular formation and moving in compound orbital-spin motion. As the squares orbit and overlap, they develop diffuse colour gradients that mix, contaminate, and re-separate according to the identity restoration force. Colour organisation emerges from the interplay between diffusion (spreading hue) and identity force (anchoring hue) during periods of contact and separation.

What makes it distinct: unlike wave or interference generators that compute output from a static mathematical formula, Clockwise generates visual structure through repeated state exchange between dynamically colliding cellular automata. The identity restoration mechanism gives each square a persistent character that reasserts itself between collisions.

Algorithm origin: the per-cell update rule is a simplified discrete reaction-diffusion system (related to Turing / Gray-Scott class models in structure, without distinct activator-inhibitor species). Orbital placement is standard polar-to-Cartesian composition.

Scope boundary: Clockwise does not implement 3D projection, true two-species reaction-diffusion, physical collision (squares pass through each other — only field values are swapped, not positions), rigid-body dynamics, or audio reactivity. The grid resolution per square is derived deterministically from orbit geometry and is not a user-adjustable parameter.
