# Multigrid method


*[Table: Multigrid method]*

In numerical analysis, a multigrid method (MG method) is an algorithm for solving differential equations using a hierarchy of discretizations. They are an example of a class of techniques called multiresolution methods, very useful in problems exhibiting multiple scales of behavior. For example, many basic relaxation methods exhibit different rates of convergence for short- and long-wavelength components, suggesting these different scales be treated differently, as in a Fourier analysis approach to multigrid. MG methods can be used as solvers as well as preconditioners.

The main idea of multigrid is to accelerate the convergence of a basic iterative method (known as relaxation, which generally reduces short-wavelength error) by a global correction of the fine grid solution approximation from time to time, accomplished by solving a coarse problem. The coarse problem, while cheaper to solve, is similar to the fine grid problem in that it also has short- and long-wavelength errors. It can also be solved by a combination of relaxation and appeal to still coarser grids. This recursive process is repeated until a grid is reached where the cost of direct solution there is negligible compared to the cost of one relaxation sweep on the fine grid. This multigrid cycle typically reduces all error components by a fixed amount bounded well below one, independent of the fine grid mesh size. The typical application for multigrid is in the numerical solution of elliptic partial differential equations in two or more dimensions.

Multigrid methods can be applied in combination with any of the common discretization techniques. For example, the finite element method may be recast as a multigrid method. In these cases, multigrid methods are among the fastest solution techniques known today. In contrast to other methods, multigrid methods are general in that they can treat arbitrary regions and boundary conditions. They do not depend on the separability of the equations or other special properties of the equation. They have also been widely used for more-complicated non-symmetric and nonlinear systems of equations, like the Lamé equations of elasticity or the Navier-Stokes equations.


## Algorithm

There are many variations of multigrid algorithms, but the common features are that a hierarchy of discretizations (grids) is considered. The important steps are:


- Smoothing – reducing high frequency errors, for example using a few iterations of the Gauss–Seidel method.
- Residual Computation – computing residual error after the smoothing operation(s).
- Restriction – downsampling the residual error to a coarser grid.
- Interpolation or prolongation – interpolating a correction computed on a coarser grid into a finer grid.
- Correction – Adding prolongated coarser grid solution onto the finer grid.

There are many choices of multigrid methods with varying trade-offs between speed of solving a single iteration and the rate of convergence with said iteration. The 3 main types are V-Cycle, F-Cycle, and W-Cycle. These differ in which and how many coarse-grain cycles are performed per fine iteration. The V-Cycle algorithm executes one coarse-grain V-Cycle. F-Cycle does a coarse-grain V-Cycle followed by a coarse-grain F-Cycle, while each W-Cycle performs two coarse-grain W-Cycles per iteration. For a discrete 2D problem, F-Cycle takes 83% more time to compute than a V-Cycle iteration while a W-Cycle iteration takes 125% more. If the problem is set up in a 3D domain, then a F-Cycle iteration and a W-Cycle iteration take about 64% and 75% more time respectively than a V-Cycle iteration ignoring overheads. Typically, W-Cycle produces similar convergence to F-Cycle. However, in cases of convection-diffusion problems with high Péclet numbers, W-Cycle can show superiority in its rate of convergence per iteration over F-Cycle. The choice of smoothing operators are extremely diverse as they include Krylov subspace methods and can be preconditioned.

Any geometric multigrid cycle iteration is performed on a hierarchy of grids and hence it can be coded using recursion. Since the function calls itself with smaller sized (coarser) parameters, the coarsest grid is where the recursion stops. In cases where the system has a high condition number, the correction procedure is modified such that only a fraction of the prolongated coarser grid solution is added onto the finer grid.


## Computational cost [citation needed]

This approach has the advantage over other methods that it often scales linearly with the number of discrete nodes used. In other words, it can solve these problems to a given accuracy in a number of operations that is proportional to the number of unknowns.

Assume that one has a differential equation which can be solved approximately (with a given accuracy) on a grid $i$ with a given grid point density $N_{i}$. Assume furthermore that a solution on any grid $N_{i}$ may be obtained with a given effort $W_{i}=\rho KN_{i}$ from a solution on a coarser grid $i+1$. Here, $\rho =N_{i+1}/N_{i}<1$ is the ratio of grid points on "neighboring" grids and is assumed to be constant throughout the grid hierarchy, and $K$ is some constant modeling the effort of computing the result for one grid point.

The following recurrence relation is then obtained for the effort of obtaining the solution on grid $k$: $W_{k}=W_{k+1}+\rho KN_{k}$

And in particular, we find for the finest grid $N_{1}$ that $W_{1}=W_{2}+\rho KN_{1}$ Combining these two expressions (and using $N_{k}=\rho ^{k-1}N_{1}$) gives
$$W_{1}=KN_{1}\sum _{p=0}^{n}\rho ^{p}
$$

Using the geometric series, we then find (for finite $n$)
$$W_{1}<KN_{1}{\frac {1}{1-\rho }}
$$

that is, a solution may be obtained in $O(N)$ time. It should be mentioned that there is one exception to the $O(N)$ i.e. W-cycle multigrid used on a 1D problem; it would result in $O(N\log N)$ complexity.


## Multigrid preconditioning

A multigrid method with an intentionally reduced tolerance can be used as an efficient preconditioner for an external iterative solver, e.g., The solution may still be obtained in $O(N)$ time as well as in the case where the multigrid method is used as a solver. Multigrid preconditioning is used in practice even for linear systems, typically with one cycle per iteration, e.g., in Hypre. Its main advantage versus a purely multigrid solver is particularly clear for nonlinear problems, e.g., eigenvalue problems.

If the matrix of the original equation or an eigenvalue problem is symmetric positive definite (SPD), the preconditioner is commonly constructed to be SPD as well, so that the standard conjugate gradient (CG) iterative methods can still be used. Such imposed SPD constraints may complicate the construction of the preconditioner, e.g., requiring coordinated pre- and post-smoothing. However, preconditioned steepest descent and flexible CG methods for SPD linear systems and LOBPCG for symmetric eigenvalue problems are all shown to be robust if the preconditioner is not SPD.


## Bramble–Pasciak–Xu preconditioner

Originally described in Xu’s Ph.D. thesis and later published in Bramble-Pasciak-Xu, the BPX-preconditioner is one of the two major multigrid approaches (the other is the classic multigrid algorithm such as V-cycle) for solving large-scale algebraic systems that arise from the discretization of models in science and engineering described by partial differential equations. In view of the subspace correction framework, BPX preconditioner is a parallel subspace correction method whereas the classic V-cycle is a successive subspace correction method. The BPX-preconditioner is known to be naturally more parallel and in some applications more robust than the classic V-cycle multigrid method. The method has been widely used by researchers and practitioners since 1990.


## Generalized multigrid methods

Multigrid methods can be generalized in many different ways. They can be applied naturally in a time-stepping solution of parabolic partial differential equations, or they can be applied directly to time-dependent partial differential equations. Research on multilevel techniques for hyperbolic partial differential equations is underway. Multigrid methods can also be applied to integral equations, or for problems in statistical physics.

Another set of multiresolution methods is based upon wavelets. These wavelet methods can be combined with multigrid methods. For example, one use of wavelets is to reformulate the finite element approach in terms of a multilevel method.

Adaptive multigrid exhibits adaptive mesh refinement, that is, it adjusts the grid as the computation proceeds, in a manner dependent upon the computation itself. The idea is to increase resolution of the grid only in regions of the solution where it is needed.


## Algebraic multigrid (AMG)

Practically important extensions of multigrid methods include techniques where no partial differential equation nor geometrical problem background is used to construct the multilevel hierarchy. Such algebraic multigrid methods (AMG) construct their hierarchy of operators directly from the system matrix. In classical AMG, the levels of the hierarchy are simply subsets of unknowns without any geometric interpretation. (More generally, coarse grid unknowns can be particular linear combinations of fine grid unknowns.) Thus, AMG methods become black-box solvers for certain classes of sparse matrices. AMG is regarded as advantageous mainly where geometric multigrid is too difficult to apply, but is often used simply because it avoids the coding necessary for a true multigrid implementation. While classical AMG was developed first, a related algebraic method is known as smoothed aggregation (SA).

In an overview paper by Jinchao Xu and Ludmil Zikatanov, the "algebraic multigrid" methods are understood from an abstract point of view. They developed a unified framework and existing algebraic multigrid methods can be derived coherently. Abstract theory about how to construct optimal coarse space as well as quasi-optimal spaces was derived. We note that this result appeared first in a note on Algebraic Multigrid by Brannick and Zikatanov and was just rewritten in the overview paper. Also, they proved that, under appropriate assumptions, the abstract two-level AMG method converges uniformly with respect to the size of the linear system, the coefficient variation, and the anisotropy. Their abstract framework covers most existing AMG methods, such as classical AMG, energy-minimization AMG, unsmoothed and smoothed aggregation AMG, and spectral AMGe.


## Multigrid in time methods

Multigrid methods have also been adopted for the solution of initial value problems. Of particular interest here are parallel-in-time multigrid methods: in contrast to classical Runge–Kutta or linear multistep methods, they can offer concurrency in temporal direction. The well known Parareal parallel-in-time integration method can also be reformulated as a two-level multigrid in time.


## Multigrid for nearly singular problems

Nearly singular problems arise in a number of important physical and engineering applications. Simple, but important example of nearly singular problems can be found at the displacement formulation of linear elasticity for nearly incompressible materials. Typically, the major problem to solve such nearly singular systems boils down to treat the nearly singular operator given by $A+\varepsilon M$ robustly with respect to the positive, but small parameter $\varepsilon$. Here $A$ is symmetric semidefinite operator with large null space, while $M$ is a symmetric positive definite operator. There were many works to attempt to design a robust and fast multigrid method for such nearly singular problems. A general guide has been provided as a design principle to achieve parameters (e.g., mesh size and physical parameters such as Poisson's ratio that appear in the nearly singular operator) independent convergence rate of the multigrid method applied to such nearly singular systems, i.e., in each grid, a space decomposition based on which the smoothing is applied, has to be constructed so that the null space of the singular part of the nearly singular operator has to be included in the sum of the local null spaces, the intersection of the null space and the local spaces resulting from the space decompositions.


## External links


- Links to AMG presentations
