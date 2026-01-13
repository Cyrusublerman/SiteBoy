# Diffusion-limited aggregation

Diffusion-limited aggregation (DLA) is the process whereby particles undergoing a random walk due to Brownian motion cluster together to form aggregates of such particles. This theory, proposed by T.A. Witten Jr. and L.M. Sander in 1981, is applicable to aggregation in any system where diffusion is the primary means of transport in the system. DLA can be observed in many systems such as electrodeposition, Hele-Shaw flow, mineral deposits, and dielectric breakdown.

The clusters formed in DLA processes are referred to as Brownian trees. These clusters are an example of a fractal. In 2D these fractals exhibit a dimension of approximately 1.71 for free particles that are unrestricted by a lattice, however computer simulation of DLA on a lattice will change the fractal dimension slightly for a DLA in the same embedding dimension. Some variations are also observed depending on the geometry of the growth, whether it be from a single point radially outward or from a plane or line for example. Two examples of aggregates generated using a microcomputer by allowing random walkers to adhere to an aggregate (originally (i) a straight line consisting of 1300 particles and (ii) one particle at center) are shown on the right.

Computer simulation of DLA is one of the primary means of studying this model. Several methods are available to accomplish this. Simulations can be done on a lattice of any desired geometry of embedding dimension (this has been done in up to 8 dimensions) or the simulation can be done more along the lines of a standard molecular dynamics simulation where a particle is allowed to freely random walk until it gets within a certain critical range whereupon it is pulled onto the cluster. Of critical importance is that the number of particles undergoing Brownian motion in the system is kept very low so that only the diffusive nature of the system is present.


## Brownian tree

A Brownian tree, whose name is derived from Robert Brown via Brownian motion, is a form of computer art that was briefly popular in the 1990s, when home computers started to have sufficient power to simulate Brownian motion. Brownian trees are mathematical models of dendritic structures associated with the physical process known as diffusion-limited aggregation.

A Brownian tree is built with these steps: first, a "seed" is placed somewhere on the screen. Then, a particle is placed in a random position of the screen, and moved randomly until it bumps against the seed. The particle is left there, and another particle is placed in a random position and moved until it bumps against the seed or any previous particle, and so on.


### Factors

The resulting tree can have many different shapes, depending on principally three factors:


- the seed position
- the initial particle position (anywhere on the screen, from a circle surrounding the seed, from the top of the screen, etc.)
- the moving algorithm (usually random, but for example a particle can be deleted if it goes too far from the seed, etc.)

Particle color can change between iterations, giving interesting effects.

At the time of their popularity (helped by a Scientific American article in the Computer Recreations section, December 1988), a common computer took hours, and even days, to generate a small tree. Today's computers can generate trees with tens of thousands of particles in minutes or seconds.

These trees can also be grown easily in an electrodeposition cell, and are the direct result of diffusion-limited aggregation.


## Artwork based on diffusion-limited aggregation

The intricate and organic forms that can be generated with diffusion-limited aggregation algorithms have been explored by artists. Simutils, part of the toxiclibs open source library for the Java programming language developed by Karsten Schmidt, allows users to apply the DLA process to pre-defined guidelines or curves in the simulation space and via various other parameters dynamically direct the growth of 3D forms.


## See also


- Dielectric breakdown model
- Eden growth model
- Fractal canopy
- Lichtenberg figure


## External links


- @media screen{html.skin-theme-clientpref-night .mw-parser-output .sister-inline-image img[src*="Wiktionary-logo-en-v2.svg"]{filter:invert(1)brightness(55%)contrast(250%)hue-rotate(180deg)}}@media screen and (prefers-color-scheme:dark){html.skin-theme-clientpref-os .mw-parser-output .sister-inline-image img[src*="Wiktionary-logo-en-v2.svg"]{filter:invert(1)brightness(55%)contrast(250%)hue-rotate(180deg)}} Media related to Diffusion-limited aggregation at Wikimedia Commons
- JavaScript based DLA
- Diffusion-Limited Aggregation: A Model for Pattern Formation
- A Java applet demonstration of DLA from Hong Kong University
- Free, open source program for generating DLAs using freely available ImageJ software
- TheDLA, iOS app for generating DLA pattern
- Open-source application in C for fast generation of DLA structures in 2,3,4 and higher dimensions
