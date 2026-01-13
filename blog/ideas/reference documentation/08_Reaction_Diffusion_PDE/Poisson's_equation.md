# Poisson's equation

Poisson's equation is an elliptic partial differential equation of broad utility in theoretical physics. For example, the solution to Poisson's equation is the potential field caused by a given electric charge or mass density distribution; with the potential field known, one can then calculate the corresponding electrostatic or gravitational (force) field. It is a generalization of Laplace's equation, which is also frequently seen in physics. The equation is named after French mathematician and physicist Siméon Denis Poisson who published it in 1823.


## Statement of the equation

Poisson's equation is $\Delta \varphi =f,$ where $\Delta$ is the Laplace operator, and $f$ and $\varphi$ are real or complex-valued functions on a manifold. Usually, $f$ is given, and $\varphi$ is sought. When the manifold is Euclidean space, the Laplace operator is often denoted as ∇, and so Poisson's equation is frequently written as $\nabla ^{2}\varphi =f.$

In three-dimensional Cartesian coordinates, it takes the form
$$\left({\frac {\partial ^{2}}{\partial x^{2}}}+{\frac {\partial ^{2}}{\partial y^{2}}}+{\frac {\partial ^{2}}{\partial z^{2}}}\right)\varphi (x,y,z)=f(x,y,z).
$$

When $f=0$ identically, we obtain Laplace's equation.

Poisson's equation may be solved using a Green's function:
$$\varphi (\mathbf {r} )=-\iiint {\frac {f(\mathbf {r} ')}{4\pi |\mathbf {r} -\mathbf {r} '|}}\,\mathrm {d} ^{3}r',
$$where the integral is over all of space. A general exposition of the Green's function for Poisson's equation is given in the article on the screened Poisson equation. There are various methods for numerical solution, such as the relaxation method, an iterative algorithm.


## Applications in physics and engineering


### Newtonian gravity

In the case of a gravitational field g due to an attracting massive object of density ρ, Gauss's law for gravity in differential form can be used to obtain the corresponding Poisson equation for gravity. Gauss's law for gravity is $\nabla \cdot \mathbf {g} =-4\pi G\rho .$

Since the gravitational field is conservative (and irrotational), it can be expressed in terms of a scalar potential ϕ: $\mathbf {g} =-\nabla \phi .$

Substituting this into Gauss's law, $\nabla \cdot (-\nabla \phi )=-4\pi G\rho ,$ yields Poisson's equation for gravity: $\nabla ^{2}\phi =4\pi G\rho .$

If the mass density is zero, Poisson's equation reduces to Laplace's equation. The corresponding Green's function can be used to calculate the potential at distance r from a central point mass m (i.e., the fundamental solution). In three dimensions the potential is
$$\phi (r)={\frac {-Gm}{r}},
$$which is equivalent to Newton's law of universal gravitation.


### Electrostatics

Many problems in electrostatics are governed by the Poisson equation, which relates the electric potential φ to the free charge density $\rho _{f}$, such as those found in conductors.

The mathematical details of Poisson's equation, commonly expressed in SI units (as opposed to Gaussian units), describe how the distribution of free charges generates the electrostatic potential in a given region.

Starting with Gauss's law for electricity (also one of Maxwell's equations) in differential form, one has $\mathbf {\nabla } \cdot \mathbf {D} =\rho _{f},$ where $\mathbf {\nabla } \cdot$ is the divergence operator, D is the electric displacement field, and ρf is the free-charge density (describing charges brought from outside).

Assuming the medium is linear, isotropic, and homogeneous (see polarization density), we have the constitutive equation $\mathbf {D} =\varepsilon \mathbf {E} ,$ where ε is the permittivity of the medium, and E is the electric field.

Substituting this into Gauss's law and assuming that ε is spatially constant in the region of interest yields
$$\mathbf {\nabla } \cdot \mathbf {E} ={\frac {\rho _{f}}{\varepsilon }}.
$$In electrostatics, we assume that there is no magnetic field (the argument that follows also holds in the presence of a constant magnetic field). Then, we have that $\nabla \times \mathbf {E} =0,$ where ∇× is the curl operator. This equation means that we can write the electric field as the gradient of a scalar function φ (called the electric potential), since the curl of any gradient is zero. Thus we can write $\mathbf {E} =-\nabla \varphi ,$ where the minus sign is introduced so that φ is identified as the electric potential energy per unit charge.

The derivation of Poisson's equation under these circumstances is straightforward. Substituting the potential gradient for the electric field,
$$\nabla \cdot \mathbf {E} =\nabla \cdot (-\nabla \varphi )=-\nabla ^{2}\varphi ={\frac {\rho _{f}}{\varepsilon }},
$$directly produces Poisson's equation for electrostatics, which is
$$\nabla ^{2}\varphi =-{\frac {\rho _{f}}{\varepsilon }}.
$$

Specifying the Poisson's equation for the potential requires knowing the charge density distribution. If the charge density is zero, then Laplace's equation results. If the charge density follows a Boltzmann distribution, then the Poisson–Boltzmann equation results. The Poisson–Boltzmann equation plays a role in the development of the Debye–Hückel theory of dilute electrolyte solutions.

Using a Green's function, the potential at distance r from a central point charge Q (i.e., the fundamental solution) is
$$\varphi (r)={\frac {Q}{4\pi \varepsilon r}},
$$which is Coulomb's law of electrostatics. (For historical reasons, and unlike gravity's model above, the $4\pi$ factor appears here and not in Gauss's law.)

The above discussion assumes that the magnetic field is not varying in time. The same Poisson equation arises even if it does vary in time, as long as the Coulomb gauge is used. In this more general class of cases, computing φ is no longer sufficient to calculate E, since E also depends on the magnetic vector potential A, which must be independently computed. See Maxwell's equation in potential formulation for more on φ and A in Maxwell's equations and how an appropriate Poisson's equation is obtained in this case.


#### Potential of a Gaussian charge density

If there is a static spherically symmetric Gaussian charge density
$$\rho _{f}(r)={\frac {Q}{\sigma ^{3}{\sqrt {2\pi }}^{3}}}\,e^{-r^{2}/(2\sigma ^{2})},
$$where Q is the total charge, then the solution φ(r) of Poisson's equation
$$\nabla ^{2}\varphi =-{\frac {\rho _{f}}{\varepsilon }}
$$is given by
$$\varphi (r)={\frac {1}{4\pi \varepsilon }}{\frac {Q}{r}}\operatorname {erf} \left({\frac {r}{{\sqrt {2}}\sigma }}\right),
$$where erf(x) is the error function. This solution can be checked explicitly by evaluating ∇φ.

Note that for r much greater than σ,
$${\textstyle \operatorname {erf} (r/{\sqrt {2}}\sigma )}
$$approaches unity, and the potential φ(r) approaches the point-charge potential,
$$\varphi \approx {\frac {1}{4\pi \varepsilon }}{\frac {Q}{r}},
$$as one would expect. Furthermore, the error function approaches 1 extremely quickly as its argument increases; in practice, for r > 3.4σ the relative error is smaller than one part in a thousand.


### Surface reconstruction

Surface reconstruction is an inverse problem. The goal is to digitally reconstruct a smooth surface based on a large number of points pi (a point cloud) where each point also carries an estimate of the local surface normal ni. Poisson's equation can be utilized to solve this problem with a technique called Poisson surface reconstruction.

The goal of this technique is to reconstruct an implicit function f whose value is zero at the points pi and whose gradient at the points pi equals the normal vectors ni. The set of (pi, ni) is thus modeled as a continuous vector field V. The implicit function f is found by integrating the vector field V. Since not every vector field is the gradient of a function, the problem may or may not have a solution: the necessary and sufficient condition for a smooth vector field V to be the gradient of a function f is that the curl of V must be identically zero. In case this condition is difficult to impose, it is still possible to perform a least-squares fit to minimize the difference between V and the gradient of f.

In order to effectively apply Poisson's equation to the problem of surface reconstruction, it is necessary to find a good discretization of the vector field V. The basic approach is to bound the data with a finite-difference grid. For a function valued at the nodes of such a grid, its gradient can be represented as valued on staggered grids, i.e. on grids whose nodes lie in between the nodes of the original grid. It is convenient to define three staggered grids, each shifted in one and only one direction corresponding to the components of the normal data. On each staggered grid we perform trilinear interpolation on the set of points. The interpolation weights are then used to distribute the magnitude of the associated component of ni onto the nodes of the particular staggered grid cell containing pi. Kazhdan and coauthors give a more accurate method of discretization using an adaptive finite-difference grid, i.e. the cells of the grid are smaller (the grid is more finely divided) where there are more data points. They suggest implementing this technique with an adaptive octree.


### Fluid dynamics

For the incompressible Navier–Stokes equations, given by
$${\begin{aligned}{\frac {\partial \mathbf {v} }{\partial t}}+(\mathbf {v} \cdot \nabla )\mathbf {v} &=-{\frac {1}{\rho }}\nabla p+\nu \Delta \mathbf {v} +\mathbf {g} ,\\\nabla \cdot \mathbf {v} &=0.\end{aligned}}
$$

The equation for the pressure field $p$ is an example of a nonlinear Poisson equation:
$${\begin{aligned}\Delta p&=-\rho \nabla \cdot (\mathbf {v} \cdot \nabla \mathbf {v} )\\&=-\rho \operatorname {Tr} {\big (}(\nabla \mathbf {v} )(\nabla \mathbf {v} ){\big )}.\end{aligned}}
$$Notice that the above trace is not sign-definite.


### Thermodynamics

Thermal conduction is modelled via the Heat equation. Stationary state heat conduction with a source term is modelled via the following Poisson equation:


$$\nabla ^{2}\vartheta =-{\frac {\Phi }{\lambda }},
$$

where $\vartheta$ is the temperature, $\Phi$ is the heat source term and $\lambda$ is Thermal conductivity.


## See also


- Mathematics portal
- Physics portal


- Discrete Poisson equation
- Poisson–Boltzmann equation
- Helmholtz equation
- Uniqueness theorem for Poisson's equation
- Weak formulation
- Harmonic function
- Heat equation
- Potential theory


## Further reading


- Evans, Lawrence C. (1998). Partial Differential Equations. Providence (RI): American Mathematical Society. ISBN 0-8218-0772-2.
- Mathews, Jon; Walker, Robert L. (1970). Mathematical Methods of Physics (2nd ed.). New York: W. A. Benjamin. ISBN 0-8053-7002-1.
- Polyanin, Andrei D. (2002). Handbook of Linear Partial Differential Equations for Engineers and Scientists. Boca Raton (FL): Chapman & Hall/CRC Press. ISBN 1-58488-299-9.


## External links


- "Poisson equation", Encyclopedia of Mathematics, EMS Press, 2001 [1994]
- Poisson Equation at EqWorld: The World of Mathematical Equations
