# Subdivision surface

In the field of 3D computer graphics, a subdivision surface (commonly shortened to SubD surface or Subsurf) is a curved surface represented by the specification of a coarser polygon mesh and produced by a recursive algorithmic method. The curved surface, the underlying inner mesh, can be calculated from the coarse mesh, known as the control cage or outer mesh, as the functional limit of an iterative process of subdividing each polygonal face into smaller faces that better approximate the final underlying curved surface. Less commonly, a simple algorithm is used to add geometry to a mesh by subdividing the faces into smaller ones without changing the overall shape or volume.

The opposite is reducing polygons or un-subdividing.


## Overview

A subdivision surface algorithm is recursive in nature. The process starts with a base level polygonal mesh. A refinement scheme is then applied to this mesh. This process takes that mesh and subdivides it, creating new vertices and new faces. The positions of the new vertices in the mesh are computed based on the positions of nearby old vertices, edges, and/or faces. In many refinement schemes, the positions of old vertices are also altered (possibly based on the positions of new vertices).

This process produces a denser mesh than the original one, containing more polygonal faces (often by a factor of 4). This resulting mesh can be passed through the same refinement scheme again and again to produce more and more refined meshes. Each iteration is often called a subdivision level, starting at zero (before any refinement occurs).

The limit subdivision surface is the surface produced from this process being iteratively applied infinitely many times. In practical use however, this algorithm is only applied a limited, and fairly small ($\leq 5$), number of times.

Mathematically, the neighborhood of an extraordinary vertex (non-4-valent node for quad refined meshes) of a subdivision surface is a spline with a parametrically singular point.


## Refinement schemes

Subdivision surface refinement schemes can be broadly classified into two categories: interpolating and approximating.


- Interpolating schemes are required to match the original position of vertices in the original mesh.
- Approximating schemes are not; they can and will adjust these positions as needed.

In general, approximating schemes have greater smoothness, but the user has less overall control of the outcome. This is analogous to spline surfaces and curves, where Bézier curves are required to interpolate certain control points, while B-Splines are not (and are more approximate).

Subdivision surface schemes can also be categorized by the type of polygon that they operate on: some function best for quadrilaterals (quads), while others primarily operate on triangles (tris).


### Approximating schemes

Approximating means that the limit surfaces approximate the initial meshes, and that after subdivision the newly generated control points are not in the limit surfaces. There are five approximating subdivision schemes:


- Catmull and Clark (1978), Quads – generalizes bi-cubic uniform B-spline knot insertion. For arbitrary initial meshes, this scheme generates limit surfaces that are C2 continuous everywhere except at extraordinary vertices where they are C1 continuous (Peters and Reif 1998).
- Doo-Sabin (1978), Quads – The second subdivision scheme was developed by Doo and Sabin, who successfully extended Chaikin's corner-cutting method (George Chaikin, 1974) for curves to surfaces. They used the analytical expression of bi-quadratic uniform B-spline surface to generate their subdivision procedure to produce C1 limit surfaces with arbitrary topology for arbitrary initial meshes. An auxiliary point can improve the shape of Doo-Sabin subdivision. After a subdivision, all vertices have valence 4.
- Loop (1987), Triangles – Loop proposed his subdivision scheme based on a quartic box-spline of six direction vectors to provide a rule to generate C2 continuous limit surfaces everywhere except at extraordinary vertices where they are C1 continuous (Zorin 1997).
- Mid-Edge subdivision scheme (1997–1999) Quads? Triangles? – The mid-edge subdivision scheme was proposed independently by Peters-Reif (1997) and Habib-Warren (1999). The former used the mid-point of each edge to build the new mesh. The latter used a four-directional box spline to build the scheme. This scheme generates C1 continuous limit surfaces on initial meshes with arbitrary topology. (Mid-Edge subdivision, which could be called "√2 subdivision" since two steps halve distances, could be considered the slowest.)
- √3 subdivision scheme (2000), Triangles – This scheme was developed by Kobbelt and offers several interesting features: it handles arbitrary triangular meshes, it is C2 continuous everywhere except at extraordinary vertices where it is C1 continuous and it offers a natural adaptive refinement when required. It exhibits at least two specificities: it is a Dual scheme for triangle meshes and it has a slower refinement rate than primal ones.


### Interpolating schemes

After subdivision, the control points of the original mesh and the newly generated control points are interpolated on the limit surface. The earliest work was so-called "butterfly scheme" by Dyn, Levin and Gregory (1990), who extended the four-point interpolatory subdivision scheme for curves to a subdivision scheme for surface. Zorin, Schröder and Sweldens (1996) noticed that the butterfly scheme cannot generate smooth surfaces for irregular triangle meshes and thus modified this scheme. Kobbelt (1996) further generalized the four-point interpolatory subdivision scheme for curves to the tensor product subdivision scheme for surfaces. In 1991, Nasri proposed a scheme for interpolating Doo-Sabin; while in 1993 Halstead, Kass, and DeRose proposed one for Catmull-Clark.


- Butterfly (1990), Triangles – named after the scheme's shape
- Modified Butterfly (1996), Quads – designed to overcome artifacts generated by irregular topology
- Kobbelt (1996), Quads – a variational subdivision method that tries to overcome uniform subdivision drawbacks


## Key developments


- 1978: Subdivision surfaces were described by Edwin Catmull and Jim Clark (see Catmull-Clark subdivision surface), and by Daniel Doo and Malcom Sabin (see Doo-Sabin subdivision surfaces).
- 1995: Ulrich Reif solved subdivision surface behaviour near extraordinary vertices.
- 1998: Jos Stam contributed a method for exact evaluation for Catmull-Clark subdivision surfaces under arbitrary parameter values.


## See also


- Geri's Game (1997) – a Pixar movie which pioneered use of subdivision surfaces to represent human skin
- Non-uniform rational B-spline (NURBS) surfaces – another method of representing curved surfaces


## External links


- Geri's Game : Oscar winning animation by Pixar completed in 1997 that introduced subdivision surfaces using Catmull-Clark subdivision (along with cloth simulation)
- Subdivision for Modeling and Animation tutorial, SIGGRAPH 1999 course notes
- Subdivision for Modeling and Animation tutorial, SIGGRAPH 2000 course notes
- A unified approach to subdivision algorithms near extraordinary vertices, Ulrich Reif (Computer Aided Geometric Design 12(2):153–174 March 1995)
- Subdivision of Surface and Volumetric Meshes, software to perform subdivision using the most popular schemes
- Surface Subdivision Methods in CGAL, the Computational Geometry Algorithms Library
