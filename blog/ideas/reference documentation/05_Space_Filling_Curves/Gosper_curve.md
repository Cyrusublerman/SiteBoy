# Gosper curve

The Gosper curve, named after Bill Gosper, also known as the Peano-Gosper Curve and the flowsnake (a spoonerism of snowflake), is a space-filling curve whose limit set is rep-7. It is a fractal curve similar in its construction to the dragon curve and the Hilbert curve.

The Gosper curve can also be used for efficient hierarchical hexagonal clustering and indexing.


## Lindenmayer system

The Gosper curve can be represented using an L-system with rules as follows:


- Angle: 60°
- Axiom: $A$
- Replacement rules: A ↦ A − B − − B + A + + A A + B − {\displaystyle A\mapsto A-B--B+A++AA+B-} B ↦ + A − B B − − B − A + + A + B {\displaystyle B\mapsto +A-BB--B-A++A+B}

In this case both A and B mean to move forward, + means to turn left 60 degrees and - means to turn right 60 degrees - using a "turtle"-style program such as Logo.


## Properties

The space filled by the curve is called the Gosper island. The first few iterations of it are shown below:

The Gosper Island can tile the plane. In fact, seven copies of the Gosper island can be joined to form a shape that is similar, but scaled up by a factor of √7 in all dimensions. As can be seen from the diagram below, performing this operation with an intermediate iteration of the island leads to a scaled-up version of the next iteration. Repeating this process indefinitely produces a tessellation of the plane. The curve itself can likewise be extended to an infinite curve filling the whole plane.


## See also


- List of fractals by Hausdorff dimension
- M.C. Escher


## External links


- NEW GOSPER SPACE FILLING CURVES
- FRACTAL DE GOSPER (in French)
- Gosper Island at Wolfram MathWorld
- Flowsnake by R. William Gosper
