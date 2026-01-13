# Adaptive mesh refinement

In numerical analysis, adaptive mesh refinement (AMR) is a method of adapting the accuracy of a solution within certain sensitive or turbulent regions of simulation, dynamically and during the time the solution is being calculated. When solutions are calculated numerically, they are often limited to predetermined quantified grids as in the Cartesian plane which constitute the computational grid, or 'mesh'. Many problems in numerical analysis, however, do not require a uniform precision in the numerical grids used for graph plotting or computational simulation, and would be better suited if specific areas of graphs which needed precision could be refined in quantification only in the regions requiring the added precision. Adaptive mesh refinement provides such a dynamic programming environment for adapting the precision of the numerical computation based on the requirements of a computation problem in specific areas of multi-dimensional graphs which need precision while leaving the other regions of the multi-dimensional graphs at lower levels of precision and resolution.

This dynamic technique of adapting computation precision to specific requirements has been accredited to Marsha Berger, Joseph Oliger, and Phillip Colella who developed an algorithm for dynamic gridding called local adaptive mesh refinement. The use of AMR has since then proved of broad use and has been used in studying turbulence problems in hydrodynamics as well as in the study of large scale structures in astrophysics as in the Bolshoi cosmological simulation.


## Development of adaptive mesh refinement

In a series of papers, Marsha Berger, Joseph Oliger, and Phillip Colella developed an algorithm for dynamic gridding called local adaptive mesh refinement. The algorithm begins with the entire computational domain covered with a coarsely resolved base-level regular Cartesian grid. As the calculation progresses, individual grid cells are tagged for refinement, using a criterion that can either be user-supplied (for example mass per cell remains constant, hence higher density regions are more highly resolved) or based on Richardson extrapolation.

All tagged cells are then refined, meaning that a finer grid is overlaid on the coarse one. After refinement, individual grid patches on a single fixed level of refinement are passed off to an integrator which advances those cells in time. Finally, a correction procedure is implemented to correct the transfer along coarse-fine grid interfaces, to ensure that the amount of any conserved quantity leaving one cell exactly balances the amount entering the bordering cell. If at some point the level of refinement in a cell is greater than required, the high resolution grid may be removed and replaced with a coarser grid.

This allows the user to solve problems that are completely intractable on a uniform grid; for example, astrophysicists have used AMR to model a collapsing giant molecular cloud core down to an effective resolution of 131,072 cells per initial cloud radius, corresponding to a resolution of 10 cells on a uniform grid.

Advanced mesh refinement has been introduced via functionals. Functionals allow the ability to generate grids and provide mesh adaptation. Some advanced functionals include the Winslow and modified Liao functionals.


## Applications of adaptive mesh refinement

When calculating a solution to the shallow water equations, the solution (water height) might only be calculated for points every few feet apart—and one would assume that in between those points the height varies smoothly. The limiting factor to the resolution of the solution is thus the grid spacing: there will be no features of the numerical solution on scales smaller than the grid-spacing. Adaptive mesh refinement (AMR) changes the spacing of grid points, to change how accurately the solution is known in that region. In the shallow water example, the grid might in general be spaced every few feet—but it could be adaptively refined to have grid points every few inches in places where there are large waves.

If the region in which higher resolution is desired remains localized over the course of the computation, then static mesh refinement can be used - in which the grid is more finely spaced in some regions than others, but maintains its shape over time.

The advantages of a dynamic gridding scheme are:


1. Increased computational savings over a static grid approach.
2. Increased storage savings over a static grid approach.
3. Complete control of grid resolution, compared to the fixed resolution of a static grid approach, or the Lagrangian-based adaptivity of smoothed particle hydrodynamics.
4. Compared to pre-tuned static meshes, the adaptive approach requires less detailed a priori knowledge on the evolution of the solution.
5. The computational costs inherit properties of the physical system.

In addition, the AMR methods have been developed and applied to a wide range of fluid mechanics problems, including two-phase flows, fluid-structure interactions, and wave energy converters.


## See also


- Adaptive stepsize
- Cactus Framework
- Multigrid method
- Quadtree
- Silo (library)
