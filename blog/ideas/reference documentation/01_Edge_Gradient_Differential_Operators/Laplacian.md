# Laplacian

In mathematics, the Laplace operator or Laplacian is a differential operator given by the divergence of the gradient of a scalar function on Euclidean space. It is usually denoted by the symbols ⁠$\nabla \cdot \nabla$⁠, $\nabla ^{2}$ (where $\nabla$ is the nabla operator), or ⁠$\Delta$⁠. In a Cartesian coordinate system, the Laplacian is given by the sum of second partial derivatives of the function with respect to each independent variable. In other coordinate systems, such as cylindrical and spherical coordinates, the Laplacian also has a useful form. Informally, the Laplacian Δf (p) of a function f at a point p measures by how much the average value of f over small spheres or balls centered at p deviates from f (p).

The Laplace operator is named after the French mathematician Pierre-Simon de Laplace (1749–1827), who first applied the operator to the study of celestial mechanics: the Laplacian of the gravitational potential due to a given mass density distribution is a constant multiple of that density distribution. Solutions of Laplace's equation Δf = 0 are called harmonic functions and represent the possible gravitational potentials in regions of vacuum.

The Laplacian occurs in many differential equations describing physical phenomena. Poisson's equation describes electric and gravitational potentials; the diffusion equation describes heat and fluid flow; the wave equation describes wave propagation; and the Schrödinger equation describes the wave function in quantum mechanics. In image processing and computer vision, the Laplacian operator has been used for various tasks, such as blob and edge detection. The Laplacian is the simplest elliptic operator and is at the core of Hodge theory as well as the results of de Rham cohomology.


## Definition

The Laplace operator is a second-order differential operator in the n-dimensional Euclidean space, defined as the divergence (⁠$\nabla \cdot$⁠) of the gradient (⁠$\nabla f$⁠). Thus if $f$ is a twice-differentiable real-valued function, then the Laplacian of $f$ is the real-valued function defined by:

where the latter notations derive from formally writing:
$$\nabla =\left({\frac {\partial }{\partial x_{1}}},\ldots ,{\frac {\partial }{\partial x_{n}}}\right).
$$Explicitly, the Laplacian of f is thus the sum of all the unmixed second partial derivatives in the Cartesian coordinates xi:

As a second-order differential operator, the Laplace operator maps Ck functions to C functions for k ≥ 2. It is a linear operator Δ : C(R) → C(R), or more generally, an operator Δ : C(Ω) → C(Ω) for any open set Ω ⊆ R.

Alternatively, the Laplace operator can be defined as:
$$\nabla ^{2}f({\vec {x}})=\lim _{R\rightarrow 0}{\frac {2n}{R^{2}}}(f_{{\text{shell}}_{R}}-f({\vec {x}}))=\lim _{R\rightarrow 0}{\frac {2n}{A_{n-1}R^{1+n}}}\int _{{\text{shell}}_{R}}f({\vec {r}})-f({\vec {x}})dr^{n-1}
$$where $n$ is the dimension of the space, $f_{{\text{shell}}_{R}}$ is the average value of $f$ on the surface of an n-sphere of radius ⁠$R$⁠,
$$\textstyle \int _{{\text{shell}}_{R}}f({\vec {r}})dr^{n-1}
$$is the surface integral over an n-sphere of radius ⁠$R$⁠, and $A_{n-1}$ is the hypervolume of the boundary of a unit n-sphere.


## Analytic and geometric Laplacians

There are two conflicting conventions as to how the Laplace operator is defined:


- The "analytic" Laplacian, which could be characterized in $\mathbb {R} ^{n}$ as
$$\Delta =\nabla ^{2}=\sum _{j=1}^{n}{\Big (}{\frac {\partial }{\partial x_{j}}}{\Big )}^{2},
$$which is negative-definite in the sense that
$$\int _{\mathbb {R} ^{n}}{\overline {\varphi (x)}}\Delta \varphi (x)\,dx=-\int _{\mathbb {R} ^{n}}|\nabla \varphi (x)|^{2}\,dx<0
$$for any smooth compactly supported function $\varphi \in C_{c}^{\infty }(\mathbb {R} ^{n})$ that is not identically zero);
- The "geometric", positive-definite Laplacian defined by
$$\Delta =-\nabla ^{2}=-\sum _{j=1}^{n}{\Big (}{\frac {\partial }{\partial x_{j}}}{\Big )}^{2}.
$$


## Motivation


### Diffusion

In the physical theory of diffusion, the Laplace operator arises naturally in the mathematical description of equilibrium. Specifically, if u is the density at equilibrium of some quantity such as a chemical concentration, then the net flux of u through the boundary ∂V (also called S) of any smooth region V is zero, provided there is no source or sink within V: $\int _{S}\nabla u\cdot \mathbf {n} \,dS=0,$ where n is the outward unit normal to the boundary of V. By the divergence theorem,
$$\int _{V}\operatorname {div} \nabla u\,dV=\int _{S}\nabla u\cdot \mathbf {n} \,dS=0.
$$

Since this holds for all smooth regions V, one can show that it implies: $\operatorname {div} \nabla u=\Delta u=0.$ The left-hand side of this equation is the Laplace operator, and the entire equation Δu = 0 is known as Laplace's equation. Solutions of the Laplace equation, i.e. functions whose Laplacian is identically zero, thus represent possible equilibrium densities under diffusion.

The Laplace operator itself has a physical interpretation for non-equilibrium diffusion as the extent to which a point represents a source or sink of chemical concentration, in a sense made precise by the diffusion equation. This interpretation of the Laplacian is also explained by the following fact about averages.


### Averages

Given a twice continuously differentiable function $f:\mathbb {R} ^{n}\to \mathbb {R}$ and a point ⁠$p\in \mathbb {R} ^{n}$⁠, the average value of $f$ over the ball with radius $h$ centered at $p$ is:
$${\overline {f}}_{B}(p,h)=f(p)+{\frac {\Delta f(p)}{2(n+2)}}h^{2}+o(h^{2})\quad {\text{for}}\;\;h\to 0
$$

Similarly, the average value of $f$ over the sphere (the boundary of a ball) with radius $h$ centered at $p$ is:
$${\overline {f}}_{S}(p,h)=f(p)+{\frac {\Delta f(p)}{2n}}h^{2}+o(h^{2})\quad {\text{for}}\;\;h\to 0.
$$


### Density associated with a potential

If φ denotes the electrostatic potential associated to a charge distribution q, then the charge distribution itself is given by the negative of the Laplacian of φ: $q=-\varepsilon _{0}\Delta \varphi ,$ where ε0 is the electric constant.

This is a consequence of Gauss's law. Indeed, if V is any smooth region with boundary ∂V, then by Gauss's law the flux of the electrostatic field E across the boundary is proportional to the charge enclosed:
$$\int _{\partial V}\mathbf {E} \cdot \mathbf {n} \,dS=\int _{V}\operatorname {div} \mathbf {E} \,dV={\frac {1}{\varepsilon _{0}}}\int _{V}q\,dV.
$$where the first equality is due to the divergence theorem. Since the electrostatic field is the (negative) gradient of the potential, this gives:
$$-\int _{V}\operatorname {div} (\operatorname {grad} \varphi )\,dV={\frac {1}{\varepsilon _{0}}}\int _{V}q\,dV.
$$

Since this holds for all regions V, we must have
$$\operatorname {div} (\operatorname {grad} \varphi )=-{\frac {1}{\varepsilon _{0}}}q
$$

The same approach implies that the negative of the Laplacian of the gravitational potential is the mass distribution. Often the charge (or mass) distribution are given, and the associated potential is unknown. Finding the potential function subject to suitable boundary conditions is equivalent to solving Poisson's equation.


### Energy minimization

Another motivation for the Laplacian appearing in physics is that solutions to Δf = 0 in a region U are functions that make the Dirichlet energy functional stationary:
$$E(f)={\frac {1}{2}}\int _{U}\lVert \nabla f\rVert ^{2}\,dx.
$$

To see this, suppose f : U → R is a function, and u : U → R is a function that vanishes on the boundary of U. Then:
$$\left.{\frac {d}{d\varepsilon }}\right|_{\varepsilon =0}E(f+\varepsilon u)=\int _{U}\nabla f\cdot \nabla u\,dx=-\int _{U}u\,\Delta f\,dx
$$where the last equality follows using Green's first identity. This calculation shows that if Δf = 0, then E is stationary around f. Conversely, if E is stationary around f, then Δf = 0 by the fundamental lemma of calculus of variations.


## Coordinate expressions


### Two dimensions

The Laplace operator in two dimensions is given by:

In Cartesian coordinates,
$$\Delta f={\frac {\partial ^{2}f}{\partial x^{2}}}+{\frac {\partial ^{2}f}{\partial y^{2}}}
$$where x and y are the standard Cartesian coordinates of the xy-plane.

In polar coordinates,
$${\begin{aligned}\Delta f&={\frac {1}{r}}{\frac {\partial }{\partial r}}\left(r{\frac {\partial f}{\partial r}}\right)+{\frac {1}{r^{2}}}{\frac {\partial ^{2}f}{\partial \theta ^{2}}}\\&={\frac {\partial ^{2}f}{\partial r^{2}}}+{\frac {1}{r}}{\frac {\partial f}{\partial r}}+{\frac {1}{r^{2}}}{\frac {\partial ^{2}f}{\partial \theta ^{2}}},\end{aligned}}
$$where r represents the radial distance and θ the angle.


### Three dimensions

In three dimensions, it is common to work with the Laplacian in a variety of different coordinate systems.

In Cartesian coordinates,
$$\Delta f={\frac {\partial ^{2}f}{\partial x^{2}}}+{\frac {\partial ^{2}f}{\partial y^{2}}}+{\frac {\partial ^{2}f}{\partial z^{2}}}.
$$

In cylindrical coordinates,
$$\Delta f={\frac {1}{\rho }}{\frac {\partial }{\partial \rho }}\left(\rho {\frac {\partial f}{\partial \rho }}\right)+{\frac {1}{\rho ^{2}}}{\frac {\partial ^{2}f}{\partial \varphi ^{2}}}+{\frac {\partial ^{2}f}{\partial z^{2}}},
$$where $\rho$ represents the radial distance, φ the azimuth angle and z the height.

In spherical coordinates:
$$\Delta f={\frac {1}{r^{2}}}{\frac {\partial }{\partial r}}\left(r^{2}{\frac {\partial f}{\partial r}}\right)+{\frac {1}{r^{2}\sin \theta }}{\frac {\partial }{\partial \theta }}\left(\sin \theta {\frac {\partial f}{\partial \theta }}\right)+{\frac {1}{r^{2}\sin ^{2}\theta }}{\frac {\partial ^{2}f}{\partial \varphi ^{2}}},
$$or
$$\Delta f={\frac {1}{r}}{\frac {\partial ^{2}}{\partial r^{2}}}(rf)+{\frac {1}{r^{2}\sin \theta }}{\frac {\partial }{\partial \theta }}\left(\sin \theta {\frac {\partial f}{\partial \theta }}\right)+{\frac {1}{r^{2}\sin ^{2}\theta }}{\frac {\partial ^{2}f}{\partial \varphi ^{2}}},
$$by expanding the first and second term, these expressions read
$$\Delta f={\frac {\partial ^{2}f}{\partial r^{2}}}+{\frac {2}{r}}{\frac {\partial f}{\partial r}}+{\frac {1}{r^{2}\sin \theta }}\left(\cos \theta {\frac {\partial f}{\partial \theta }}+\sin \theta {\frac {\partial ^{2}f}{\partial \theta ^{2}}}\right)+{\frac {1}{r^{2}\sin ^{2}\theta }}{\frac {\partial ^{2}f}{\partial \varphi ^{2}}},
$$&#x2D;**********PLEASE SEE THE DISCUSSION PAGE BEFORE CHANGING THIS.********** where φ represents the azimuthal angle and θ the zenith angle or co-latitude. In particular, the above is equivalent to
$$\Delta f={\frac {\partial ^{2}f}{\partial r^{2}}}+{\frac {2}{r}}{\frac {\partial f}{\partial r}}+{\frac {1}{r^{2}}}\Delta _{S^{2}}f,
$$where $\Delta _{S^{2}}f$ is the Laplace-Beltrami operator on the unit sphere.

In general curvilinear coordinates (ξ, ξ, ξ):
$$\Delta =\nabla \xi ^{m}\cdot \nabla \xi ^{n}{\frac {\partial ^{2}}{\partial \xi ^{m}\,\partial \xi ^{n}}}+\nabla ^{2}\xi ^{m}{\frac {\partial }{\partial \xi ^{m}}}=g^{mn}\left({\frac {\partial ^{2}}{\partial \xi ^{m}\,\partial \xi ^{n}}}-\Gamma _{mn}^{l}{\frac {\partial }{\partial \xi ^{l}}}\right),
$$where summation over the repeated indices is implied, g is the inverse metric tensor and Γ mn are the Christoffel symbols for the selected coordinates.


### N dimensions

In arbitrary curvilinear coordinates in N dimensions (ξ, ..., ξ), we can write the Laplacian in terms of the inverse metric tensor, ⁠$g^{ij}$⁠:
$$\Delta ={\frac {1}{\sqrt {\det g}}}{\frac {\partial }{\partial \xi ^{i}}}\left({\sqrt {\det g}}\,g^{ij}{\frac {\partial }{\partial \xi ^{j}}}\right),
$$from the Voss-Weyl formula for the divergence.

In spherical coordinates in N dimensions, with the parametrization x = rθ ∈ R with r representing a positive real radius and θ an element of the unit sphere SN−1,
$$\Delta f={\frac {\partial ^{2}f}{\partial r^{2}}}+{\frac {N-1}{r}}{\frac {\partial f}{\partial r}}+{\frac {1}{r^{2}}}\Delta _{S^{N-1}}f
$$where ΔSN−1 is the Laplace–Beltrami operator on the (N − 1)-sphere, known as the spherical Laplacian. The two radial derivative terms can be equivalently rewritten as:
$${\frac {1}{r^{N-1}}}{\frac {\partial }{\partial r}}\left(r^{N-1}{\frac {\partial f}{\partial r}}\right).
$$

As a consequence, the spherical Laplacian of a function defined on S ⊂ R can be computed as the ordinary Laplacian of the function extended to R ∖ {0} so that it is constant along rays, i.e., homogeneous of degree zero.


## Euclidean invariance

The Laplacian is invariant under all Euclidean transformations: rotations and translations. In two dimensions, for example, this means that:
$$\Delta (f(x\cos \theta -y\sin \theta +a,x\sin \theta +y\cos \theta +b))=(\Delta f)(x\cos \theta -y\sin \theta +a,x\sin \theta +y\cos \theta +b)
$$for all θ, a, and b. In arbitrary dimensions, $\Delta (f\circ \rho )=(\Delta f)\circ \rho$ whenever ρ is a rotation, and likewise: $\Delta (f\circ \tau )=(\Delta f)\circ \tau$ whenever τ is a translation. (More generally, this remains true when ρ is an orthogonal transformation such as a reflection.)

In fact, the algebra of all scalar linear differential operators, with constant coefficients, that commute with all Euclidean transformations, is the polynomial algebra generated by the Laplace operator.


## Spectral theory

The spectrum of the Laplace operator consists of all eigenvalues λ for which there is a corresponding eigenfunction f with: $-\Delta f=\lambda f.$

This is known as the Helmholtz equation.

If Ω is a bounded domain in R, then the eigenfunctions of the Laplacian are an orthonormal basis for the Hilbert space L2(Ω). This result essentially follows from the spectral theorem on compact self-adjoint operators, applied to the inverse of the Laplacian (which is compact, by the Poincaré inequality and the Rellich–Kondrachov theorem). It can also be shown that the eigenfunctions are infinitely differentiable functions. More generally, these results hold for the Laplace–Beltrami operator on any compact Riemannian manifold with boundary, or indeed for the Dirichlet eigenvalue problem of any elliptic operator with smooth coefficients on a bounded domain. When Ω is the n-sphere, the eigenfunctions of the Laplacian are the spherical harmonics.


## Vector Laplacian

The vector Laplace operator, also denoted by ⁠$\nabla ^{2}$⁠, is a differential operator defined over a vector field. The vector Laplacian is similar to the scalar Laplacian; whereas the scalar Laplacian applies to a scalar field and returns a scalar quantity, the vector Laplacian applies to a vector field, returning a vector quantity. When computed in orthonormal Cartesian coordinates, the returned vector field is equal to the vector field of the scalar Laplacian applied to each vector component.

The vector Laplacian of a vector field $\mathbf {A}$ is defined as
$$\nabla ^{2}\mathbf {A} =\nabla (\nabla \cdot \mathbf {A} )-\nabla \times (\nabla \times \mathbf {A} ).
$$This definition can be seen as the Helmholtz decomposition of the vector Laplacian.

In Cartesian coordinates, this reduces to the much simpler expression
$$\nabla ^{2}\mathbf {A} =(\nabla ^{2}A_{x},\nabla ^{2}A_{y},\nabla ^{2}A_{z}),
$$where $A_{x}$, $A_{y}$, and $A_{z}$ are the components of the vector field $\mathbf {A}$, and $\nabla ^{2}$ just on the left of each vector field component is the (scalar) Laplace operator. This can be seen to be a special case of Lagrange's formula; see Vector triple product.

For expressions of the vector Laplacian in other coordinate systems see Del in cylindrical and spherical coordinates.


### Generalization

The Laplacian of any tensor field $\mathbf {T}$ ("tensor" includes scalar and vector) is defined as the divergence of the gradient of the tensor:
$$\nabla ^{2}\mathbf {T} =(\nabla \cdot \nabla )\mathbf {T} .
$$

For the special case where $\mathbf {T}$ is a scalar (a tensor of degree zero), the Laplacian takes on the familiar form.

If $\mathbf {T}$ is a vector (a tensor of first degree), the gradient is a covariant derivative which results in a tensor of second degree, and the divergence of this is again a vector. The formula for the vector Laplacian above may be used to avoid tensor math and may be shown to be equivalent to the divergence of the Jacobian matrix shown below for the gradient of a vector:
$$\nabla \mathbf {T} =(\nabla T_{x},\nabla T_{y},\nabla T_{z})={\begin{bmatrix}T_{xx}&T_{xy}&T_{xz}\\T_{yx}&T_{yy}&T_{yz}\\T_{zx}&T_{zy}&T_{zz}\end{bmatrix}},{\text{ where }}T_{uv}\equiv {\frac {\partial T_{u}}{\partial v}}.
$$

And, in the same manner, a dot product, which evaluates to a vector, of a vector by the gradient of another vector (a tensor of 2nd degree) can be seen as a product of matrices:
$$\mathbf {A} \cdot \nabla \mathbf {B} ={\begin{bmatrix}A_{x}&A_{y}&A_{z}\end{bmatrix}}\nabla \mathbf {B} ={\begin{bmatrix}\mathbf {A} \cdot \nabla B_{x}&\mathbf {A} \cdot \nabla B_{y}&\mathbf {A} \cdot \nabla B_{z}\end{bmatrix}}.
$$This identity is a coordinate dependent result, and is not general.


### Use in physics

An example of the usage of the vector Laplacian is the Navier-Stokes equations for a Newtonian incompressible flow:
$$\rho \left({\frac {\partial \mathbf {v} }{\partial t}}+(\mathbf {v} \cdot \nabla )\mathbf {v} \right)=\rho \mathbf {f} -\nabla p+\mu \left(\nabla ^{2}\mathbf {v} \right),
$$where the term with the vector Laplacian of the velocity field $\mu \left(\nabla ^{2}\mathbf {v} \right)$ represents the viscous stresses in the fluid.

Another example is the wave equation for the electric field that can be derived from Maxwell's equations in the absence of charges and currents:
$$\nabla ^{2}\mathbf {E} -\mu _{0}\epsilon _{0}{\frac {\partial ^{2}\mathbf {E} }{\partial t^{2}}}=0.
$$

This equation can also be written as: $\Box \,\mathbf {E} =0,$ where
$$\Box \equiv {\frac {1}{c^{2}}}{\frac {\partial ^{2}}{\partial t^{2}}}-\nabla ^{2},
$$is the D'Alembertian, used in the Klein–Gordon equation.


## Some properties

First of all, we say that a smooth function
$$u\colon \Omega \subset \mathbb {R} ^{N}\to \mathbb {R}
$$is superharmonic whenever ⁠$-\Delta u\geq 0$⁠.

Let $u\colon \Omega \to \mathbb {R}$ be a smooth function, and let $K\subset \Omega$ be a connected compact set. If $u$ is superharmonic, then, for every $x\in K$, we have
$$u(x)\geq \inf _{\Omega }u+c\lVert u\rVert _{L^{1}(K)}\;,
$$for some constant $c>0$ depending on $\Omega$ and ⁠$K$⁠.


## Generalizations

A version of the Laplacian can be defined wherever the Dirichlet energy functional makes sense, which is the theory of Dirichlet forms. For spaces with additional structure, one can give more explicit descriptions of the Laplacian, as follows.


### Laplace–Beltrami operator

The Laplacian also can be generalized to an elliptic operator called the Laplace–Beltrami operator defined on a Riemannian manifold. The Laplace–Beltrami operator, when applied to a function, is the trace (tr) of the function's Hessian: $\Delta f=\operatorname {tr} {\big (}H(f){\big )}$ where the trace is taken with respect to the inverse of the metric tensor. The Laplace–Beltrami operator also can be generalized to an operator (also called the Laplace–Beltrami operator) which operates on tensor fields, by a similar formula.

Another generalization of the Laplace operator that is available on pseudo-Riemannian manifolds uses the exterior derivative, in terms of which the "geometer's Laplacian" is expressed as $\Delta f=\delta df.$

Here δ is the codifferential, which can also be expressed in terms of the Hodge star and the exterior derivative. This operator differs in sign from the "analyst's Laplacian" defined above. More generally, the "Hodge" Laplacian is defined on differential forms α by $\Delta \alpha =\delta d\alpha +d\delta \alpha .$

This is known as the Laplace–de Rham operator, which is related to the Laplace–Beltrami operator by the Weitzenböck identity.


### D'Alembertian

The Laplacian can be generalized in certain ways to non-Euclidean spaces, where it may be elliptic, hyperbolic, or ultrahyperbolic.

In Minkowski space the Laplace–Beltrami operator becomes the D'Alembert operator $\Box$ or D'Alembertian:
$$\square ={\frac {1}{c^{2}}}{\frac {\partial ^{2}}{\partial t^{2}}}-{\frac {\partial ^{2}}{\partial x^{2}}}-{\frac {\partial ^{2}}{\partial y^{2}}}-{\frac {\partial ^{2}}{\partial z^{2}}}.
$$

It is the generalization of the Laplace operator in the sense that it is the differential operator which is invariant under the isometry group of the underlying space and it reduces to the Laplace operator if restricted to time-independent functions. The overall sign of the metric here is chosen such that the spatial parts of the operator admit a negative sign, which is the usual convention in high-energy particle physics. The D'Alembert operator is also known as the wave operator because it is the differential operator appearing in the wave equations, and it is also part of the Klein–Gordon equation, which reduces to the wave equation in the massless case.

The additional factor of c in the metric is needed in physics if space and time are measured in different units; a similar factor would be required if, for example, the x direction were measured in meters while the y direction were measured in centimeters. Indeed, theoretical physicists usually work in units such that c = 1 in order to simplify the equation.

The d'Alembert operator generalizes to a hyperbolic operator on pseudo-Riemannian manifolds.


## See also


- Laplace–Beltrami operator, generalization to submanifolds in Euclidean space and Riemannian and pseudo-Riemannian manifold.
- The Laplacian in differential geometry.
- The discrete Laplace operator is a finite-difference analog of the continuous Laplacian, defined on graphs and grids.
- The Laplacian is a common operator in image processing and computer vision (see the Laplacian of Gaussian, blob detector, and scale space).
- The list of formulas in Riemannian geometry contains expressions for the Laplacian in terms of Christoffel symbols.
- Weyl's lemma (Laplace equation).
- Earnshaw's theorem which shows that stable static gravitational, electrostatic or magnetic suspension is impossible.
- Del in cylindrical and spherical coordinates.
- Other situations in which a Laplacian is defined are: analysis on fractals, time scale calculus and discrete exterior calculus.


## Further reading


- The Laplacian - Richard Fitzpatrick 2006


## External links


- "Laplace operator", Encyclopedia of Mathematics, EMS Press, 2001 [1994]
- Weisstein, Eric W. "Laplacian". MathWorld.
- Laplacian in polar coordinates derivation
- Laplace equations on the fractal cubes and Casimir effect
