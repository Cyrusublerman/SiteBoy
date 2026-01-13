# Laplace's equation

In mathematics and physics, Laplace's equation is a second-order partial differential equation named after Pierre-Simon Laplace, who first studied its properties in 1786. This is often written as $\nabla ^{2}\!f=0$ or $\Delta f=0,$ where $\Delta =\nabla \cdot \nabla =\nabla ^{2}$ is the Laplace operator, $\nabla \cdot$ is the divergence operator (also symbolized "div"), $\nabla$ is the gradient operator (also symbolized "grad"), and $f(x,y,z)$ is a twice-differentiable real-valued function. The Laplace operator therefore maps a scalar function to another scalar function.

If the right-hand side is specified as a given function, $h(x,y,z)$, we have $\Delta f=h$

This is called Poisson's equation, a generalization of Laplace's equation. Laplace's equation and Poisson's equation are the simplest examples of elliptic partial differential equations. Laplace's equation is also a special case of the Helmholtz equation.

The general theory of solutions to Laplace's equation is known as potential theory. The twice continuously differentiable solutions of Laplace's equation are the harmonic functions, which are important in multiple branches of physics, notably electrostatics, gravitation, and fluid dynamics. In the study of heat conduction, the Laplace equation is the steady-state heat equation. In general, Laplace's equation describes situations of equilibrium, or those that do not depend explicitly on time.


## Forms in different coordinate systems

In rectangular coordinates,
$$\nabla ^{2}f={\frac {\partial ^{2}f}{\partial x^{2}}}+{\frac {\partial ^{2}f}{\partial y^{2}}}+{\frac {\partial ^{2}f}{\partial z^{2}}}=0.
$$

In cylindrical coordinates,
$$\nabla ^{2}f={\frac {1}{r}}{\frac {\partial }{\partial r}}\left(r{\frac {\partial f}{\partial r}}\right)+{\frac {1}{r^{2}}}{\frac {\partial ^{2}f}{\partial \phi ^{2}}}+{\frac {\partial ^{2}f}{\partial z^{2}}}=0.
$$

In spherical coordinates, using the $(r,\theta ,\varphi )$ convention,
$$\nabla ^{2}f={\frac {1}{r^{2}}}{\frac {\partial }{\partial r}}\left(r^{2}{\frac {\partial f}{\partial r}}\right)+{\frac {1}{r^{2}\sin \theta }}{\frac {\partial }{\partial \theta }}\left(\sin \theta {\frac {\partial f}{\partial \theta }}\right)+{\frac {1}{r^{2}\sin ^{2}\theta }}{\frac {\partial ^{2}f}{\partial \varphi ^{2}}}=0.
$$

More generally, in arbitrary curvilinear coordinates (ξ),
$$\nabla ^{2}f={\frac {\partial }{\partial \xi ^{j}}}\left({\frac {\partial f}{\partial \xi ^{k}}}g^{kj}\right)+{\frac {\partial f}{\partial \xi ^{j}}}g^{jm}\Gamma _{mn}^{n}=0,
$$or
$$\nabla ^{2}f={\frac {1}{\sqrt {|g|}}}{\frac {\partial }{\partial \xi ^{i}}}\!\left({\sqrt {|g|}}g^{ij}{\frac {\partial f}{\partial \xi ^{j}}}\right)=0,\qquad (g=\det\{g_{ij}\})
$$where gij is the Euclidean metric tensor relative to the new coordinates and Γ denotes its Christoffel symbols.


## Boundary conditions

The Dirichlet problem for Laplace's equation consists of finding a solution φ on some domain D such that φ on the boundary of D is equal to some given function. Since the Laplace operator appears in the heat equation, one physical interpretation of this problem is as follows: fix the temperature on the boundary of the domain according to the given specification of the boundary condition. Allow heat to flow until a stationary state is reached in which the temperature at each point on the domain does not change anymore. The temperature distribution in the interior will then be given by the solution to the corresponding Dirichlet problem.

The Neumann boundary conditions for Laplace's equation specify not the function φ itself on the boundary of D but its normal derivative. Physically, this corresponds to the construction of a potential for a vector field whose effect is known at the boundary of D alone. For the example of the heat equation it amounts to prescribing the heat flux through the boundary. In particular, at an adiabatic boundary, the normal derivative of φ is zero.

Solutions of Laplace's equation are called harmonic functions; they are all analytic within the domain where the equation is satisfied. If any two functions are solutions to Laplace's equation (or any linear homogeneous differential equation), their sum (or any linear combination) is also a solution. This property, called the principle of superposition, is very useful. For example, solutions to complex problems can be constructed by summing simple solutions.


## In two dimensions

Laplace's equation in two independent variables in rectangular coordinates has the form
$${\frac {\partial ^{2}\psi }{\partial x^{2}}}+{\frac {\partial ^{2}\psi }{\partial y^{2}}}\equiv \psi _{xx}+\psi _{yy}=0.
$$


### Analytic functions

The real and imaginary parts of a complex analytic function both satisfy the Laplace equation. That is, if z = x + iy, and if $f(z)=u(x,y)+iv(x,y),$ then the necessary condition that f(z) be analytic is that u and v be differentiable and that the Cauchy–Riemann equations be satisfied: $u_{x}=v_{y},\quad v_{x}=-u_{y}.$ where ux is the first partial derivative of u with respect to x. It follows that $u_{yy}=(-v_{x})_{y}=-(v_{y})_{x}=-(u_{x})_{x}.$ Therefore u satisfies the Laplace equation. A similar calculation shows that v also satisfies the Laplace equation. Conversely, given a harmonic function, it is the real part of an analytic function, f(z) (at least locally). If a trial form is $f(z)=\varphi (x,y)+i\psi (x,y),$ then the Cauchy–Riemann equations will be satisfied if we set
$$\psi _{x}=-\varphi _{y},\quad \psi _{y}=\varphi _{x}.
$$This relation does not determine ψ, but only its increments: $d\psi =-\varphi _{y}\,dx+\varphi _{x}\,dy.$ The Laplace equation for φ implies that the integrability condition for ψ is satisfied: $\psi _{xy}=\psi _{yx},$ and thus ψ may be defined by a line integral. The integrability condition and Stokes' theorem implies that the value of the line integral connecting two points is independent of the path. The resulting pair of solutions of the Laplace equation are called conjugate harmonic functions. This construction is only valid locally, or provided that the path does not loop around a singularity. For example, if r and θ are polar coordinates and $\varphi =\log r,$ then a corresponding analytic function is $f(z)=\log z=\log r+i\theta .$

However, the angle θ is single-valued only in a region that does not enclose the origin.

The close connection between the Laplace equation and analytic functions implies that any solution of the Laplace equation has derivatives of all orders, and can be expanded in a power series, at least inside a circle that does not enclose a singularity. This is in sharp contrast to solutions of the wave equation, which generally have less regularity.

There is an intimate connection between power series and Fourier series. If we expand a function f in a power series inside a circle of radius R, this means that
$$f(z)=\sum _{n=0}^{\infty }c_{n}z^{n},
$$with suitably defined coefficients whose real and imaginary parts are given by $c_{n}=a_{n}+ib_{n}.$ Therefore
$$f(z)=\sum _{n=0}^{\infty }\left[a_{n}r^{n}\cos n\theta -b_{n}r^{n}\sin n\theta \right]+i\sum _{n=1}^{\infty }\left[a_{n}r^{n}\sin n\theta +b_{n}r^{n}\cos n\theta \right],
$$which is a Fourier series for f. These trigonometric functions can themselves be expanded, using multiple angle formulae.


### Fluid flow

Let the quantities u and v be the horizontal and vertical components of the velocity field of a steady incompressible, irrotational flow in two dimensions. The continuity condition for an incompressible flow is that $u_{x}+v_{y}=0,$ and the condition that the flow be irrotational is that $\nabla \times \mathbf {V} =v_{x}-u_{y}=0.$ If we define the differential of a function ψ by $d\psi =u\,dy-v\,dx,$ then the continuity condition is the integrability condition for this differential: the resulting function is called the stream function because it is constant along flow lines. The first derivatives of ψ are given by $\psi _{x}=-v,\quad \psi _{y}=u,$ and the irrotationality condition implies that ψ satisfies the Laplace equation. The harmonic function φ that is conjugate to ψ is called the velocity potential. The Cauchy–Riemann equations imply that
$$\varphi _{x}=\psi _{y}=u,\quad \varphi _{y}=-\psi _{x}=v.
$$Thus every analytic function corresponds to a steady incompressible, irrotational, inviscid fluid flow in the plane. The real part is the velocity potential, and the imaginary part is the stream function.


### Electrostatics

According to Maxwell's equations, an electric field (u, v) in two space dimensions that is independent of time satisfies
$$\nabla \times (u,v,0)=(v_{x}-u_{y}){\hat {\mathbf {k} }}=\mathbf {0} ,
$$and $\nabla \cdot (u,v)=\rho ,$ where ρ is the charge density. The first Maxwell equation is the integrability condition for the differential $d\varphi =-u\,dx-v\,dy,$ so the electric potential φ may be constructed to satisfy $\varphi _{x}=-u,\quad \varphi _{y}=-v.$ The second of Maxwell's equations then implies that $\varphi _{xx}+\varphi _{yy}=-\rho ,$ which is the Poisson equation. The Laplace equation can be used in three-dimensional problems in electrostatics and fluid flow just as in two dimensions.


## In three dimensions


### Fundamental solution

A fundamental solution of Laplace's equation satisfies
$$\Delta u=u_{xx}+u_{yy}+u_{zz}=-\delta (x-x',y-y',z-z'),
$$where the Dirac delta function δ denotes a unit source concentrated at the point (x′, y′, z′). No function has this property: in fact it is a distribution rather than a function; but it can be thought of as a limit of functions whose integrals over space are unity, and whose support (the region where the function is non-zero) shrinks to a point (see weak solution). It is common to take a different sign convention for this equation than one typically does when defining fundamental solutions. This choice of sign is often convenient to work with because −Δ is a positive operator. The definition of the fundamental solution thus implies that, if the Laplacian of u is integrated over any volume that encloses the source point, then $\iiint _{V}\nabla \cdot \nabla u\,dV=-1.$

The Laplace equation is unchanged under a rotation of coordinates, and hence we can expect that a fundamental solution may be obtained among solutions that only depend upon the distance r from the source point. If we choose the volume to be a ball of radius a around the source point, then Gauss's divergence theorem implies that
$$-1=\iiint _{V}\nabla \cdot \nabla u\,dV=\iint _{S}{\frac {du}{dr}}\,dS=\left.4\pi a^{2}{\frac {du}{dr}}\right|_{r=a}.
$$

It follows that
$${\frac {du}{dr}}=-{\frac {1}{4\pi r^{2}}},
$$on a sphere of radius r that is centered on the source point, and hence
$$u={\frac {1}{4\pi r}}.
$$

Note that, with the opposite sign convention (used in physics), this is the potential generated by a point particle, for an inverse-square law force, arising in the solution of Poisson equation. A similar argument shows that in two dimensions
$$u=-{\frac {\log(r)}{2\pi }}.
$$where log(r) denotes the natural logarithm. Note that, with the opposite sign convention, this is the potential generated by a pointlike sink (see point particle), which is the solution of the Euler equations in two-dimensional incompressible flow.


### Green's function

A Green's function is a fundamental solution that also satisfies a suitable condition on the boundary S of a volume V. For instance, $G(x,y,z;x',y',z')$ may satisfy
$$\nabla \cdot \nabla G=-\delta (x-x',y-y',z-z')\qquad {\text{in }}V,
$$
$$G=0\quad {\text{if}}\quad (x,y,z)\qquad {\text{on }}S.
$$

Now if u is any solution of the Poisson equation in V: $\nabla \cdot \nabla u=-f,$

and u assumes the boundary values g on S, then we may apply Green's identity, (a consequence of the divergence theorem) which states that


$$\iiint _{V}\left[G\,\nabla \cdot \nabla u-u\,\nabla \cdot \nabla G\right]\,dV=\iiint _{V}\nabla \cdot \left[G\nabla u-u\nabla G\right]\,dV=\iint _{S}\left[Gu_{n}-uG_{n}\right]\,dS.\,
$$

The notations un and Gn denote normal derivatives on S. In view of the conditions satisfied by u and G, this result simplifies to


$$u(x',y',z')=\iiint _{V}Gf\,dV-\iint _{S}G_{n}g\,dS.\,
$$

Thus the Green's function describes the influence at (x′, y′, z′) of the data f and g. For the case of the interior of a sphere of radius a, the Green's function may be obtained by means of a reflection (Sommerfeld 1949): the source point P at distance ρ from the center of the sphere is reflected along its radial line to a point P' that is at a distance


$$\rho '={\frac {a^{2}}{\rho }}.\,
$$

Note that if P is inside the sphere, then P′ will be outside the sphere. The Green's function is then given by
$${\frac {1}{4\pi R}}-{\frac {a}{4\pi \rho R'}},\,
$$where R denotes the distance to the source point P and R′ denotes the distance to the reflected point P′. A consequence of this expression for the Green's function is the Poisson integral formula. Let ρ, θ, and φ be spherical coordinates for the source point P. Here θ denotes the angle with the vertical axis, which is contrary to the usual American mathematical notation, but agrees with standard European and physical practice. Then the solution of the Laplace equation with Dirichlet boundary values g inside the sphere is given by (Zachmanoglou & Thoe 1986, p. 228)
$$u(P)={\frac {1}{4\pi }}a^{3}\left(1-{\frac {\rho ^{2}}{a^{2}}}\right)\int _{0}^{2\pi }\int _{0}^{\pi }{\frac {g(\theta ',\varphi ')\sin \theta '}{(a^{2}+\rho ^{2}-2a\rho \cos \Theta )^{\frac {3}{2}}}}d\theta '\,d\varphi '
$$where
$$\cos \Theta =\cos \theta \cos \theta '+\sin \theta \sin \theta '\cos(\varphi -\varphi ')
$$is the cosine of the angle between (θ, φ) and (θ′, φ′). A simple consequence of this formula is that if u is a harmonic function, then the value of u at the center of the sphere is the mean value of its values on the sphere. This mean value property immediately implies that a non-constant harmonic function cannot assume its maximum value at an interior point.


### Laplace's spherical harmonics

Laplace's equation in spherical coordinates is:


$$\nabla ^{2}f={\frac {1}{r^{2}}}{\frac {\partial }{\partial r}}\left(r^{2}{\frac {\partial f}{\partial r}}\right)+{\frac {1}{r^{2}\sin \theta }}{\frac {\partial }{\partial \theta }}\left(\sin \theta {\frac {\partial f}{\partial \theta }}\right)+{\frac {1}{r^{2}\sin ^{2}\theta }}{\frac {\partial ^{2}f}{\partial \varphi ^{2}}}=0.
$$

Consider the problem of finding solutions of the form f(r, θ, φ) = R(r) Y(θ, φ). By separation of variables, two differential equations result by imposing Laplace's equation:


$${\frac {1}{R}}{\frac {d}{dr}}\left(r^{2}{\frac {dR}{dr}}\right)=\lambda ,\qquad {\frac {1}{Y}}{\frac {1}{\sin \theta }}{\frac {\partial }{\partial \theta }}\left(\sin \theta {\frac {\partial Y}{\partial \theta }}\right)+{\frac {1}{Y}}{\frac {1}{\sin ^{2}\theta }}{\frac {\partial ^{2}Y}{\partial \varphi ^{2}}}=-\lambda .
$$

The second equation can be simplified under the assumption that Y has the form Y(θ, φ) = Θ(θ) Φ(φ). Applying separation of variables again to the second equation gives way to the pair of differential equations


$${\frac {1}{\Phi }}{\frac {d^{2}\Phi }{d\varphi ^{2}}}=-m^{2}
$$
$$\lambda \sin ^{2}\theta +{\frac {\sin \theta }{\Theta }}{\frac {d}{d\theta }}\left(\sin \theta {\frac {d\Theta }{d\theta }}\right)=m^{2}
$$

for some number m. A priori, m is a complex constant, but because Φ must be a periodic function whose period evenly divides 2π, m is necessarily an integer and Φ is a linear combination of the complex exponentials e. The solution function Y(θ, φ) is regular at the poles of the sphere, where θ = 0, π. Imposing this regularity in the solution Θ of the second equation at the boundary points of the domain is a Sturm–Liouville problem that forces the parameter λ to be of the form λ = ℓ (ℓ + 1) for some non-negative integer with ℓ ≥ |m|; this is also explained below in terms of the orbital angular momentum. Furthermore, a change of variables t = cos θ transforms this equation into the Legendre equation, whose solution is a multiple of the associated Legendre polynomial Pℓ(cos θ) . Finally, the equation for R has solutions of the form R(r) = A r + B r; requiring the solution to be regular throughout R forces B = 0.

Here the solution was assumed to have the special form Y(θ, φ) = Θ(θ) Φ(φ). For a given value of ℓ, there are 2ℓ + 1 independent solutions of this form, one for each integer m with −ℓ ≤ m ≤ ℓ. These angular solutions are a product of trigonometric functions, here represented as a complex exponential, and associated Legendre polynomials:
$$Y_{\ell }^{m}(\theta ,\varphi )=Ne^{im\varphi }P_{\ell }^{m}(\cos {\theta })
$$which fulfill
$$r^{2}\nabla ^{2}Y_{\ell }^{m}(\theta ,\varphi )=-\ell (\ell +1)Y_{\ell }^{m}(\theta ,\varphi ).
$$

Here Yℓ is called a spherical harmonic function of degree ℓ and order m, Pℓ is an associated Legendre polynomial, N is a normalization constant, and θ and φ represent colatitude and longitude, respectively. In particular, the colatitude θ, or polar angle, ranges from 0 at the North Pole, to π/2 at the Equator, to π at the South Pole, and the longitude φ, or azimuth, may assume all values with 0 ≤ φ < 2π. For a fixed integer ℓ, every solution Y(θ, φ) of the eigenvalue problem $r^{2}\nabla ^{2}Y=-\ell (\ell +1)Y$ is a linear combination of Yℓ. In fact, for any such solution, r Y(θ, φ) is the expression in spherical coordinates of a homogeneous polynomial that is harmonic (see below), and so counting dimensions shows that there are 2ℓ + 1 linearly independent such polynomials.

The general solution to Laplace's equation in a ball centered at the origin is a linear combination of the spherical harmonic functions multiplied by the appropriate scale factor r,
$$f(r,\theta ,\varphi )=\sum _{\ell =0}^{\infty }\sum _{m=-\ell }^{\ell }f_{\ell }^{m}r^{\ell }Y_{\ell }^{m}(\theta ,\varphi ),
$$where the fℓ are constants and the factors r Yℓ are known as solid harmonics. Such an expansion is valid in the ball
$$r<R={\frac {1}{\limsup _{\ell \to \infty }|f_{\ell }^{m}|^{{1}/{\ell }}}}.
$$

For $r>R$, the solid harmonics with negative powers of $r$ are chosen instead. In that case, one needs to expand the solution of known regions in Laurent series (about $r=\infty$), instead of Taylor series (about $r=0$), to match the terms and find $f_{\ell }^{m}$.


### Electrostatics and magnetostatics

Let $\mathbf {E}$ be the electric field, $\rho$ be the electric charge density, and $\varepsilon _{0}$ be the permittivity of free space. Then Gauss's law for electricity (Maxwell's first equation) in differential form states
$$\nabla \cdot \mathbf {E} ={\frac {\rho }{\varepsilon _{0}}}.
$$

Now, the electric field can be expressed as the negative gradient of the electric potential $V$, $\mathbf {E} =-\nabla V,$ if the field is irrotational, $\nabla \times \mathbf {E} =\mathbf {0}$. The irrotationality of $\mathbf {E}$ is also known as the electrostatic condition.


$$\nabla \cdot \mathbf {E} =\nabla \cdot (-\nabla V)=-\nabla ^{2}V
$$$\nabla ^{2}V=-\nabla \cdot \mathbf {E}$

Plugging this relation into Gauss's law, we obtain Poisson's equation for electricity,
$$\nabla ^{2}V=-{\frac {\rho }{\varepsilon _{0}}}.
$$

In the particular case of a source-free region, $\rho =0$ and Poisson's equation reduces to Laplace's equation for the electric potential.

If the electrostatic potential $V$ is specified on the boundary of a region ${\mathcal {R}}$, then it is uniquely determined. If ${\mathcal {R}}$ is surrounded by a conducting material with a specified charge density $\rho$, and if the total charge $Q$ is known, then $V$ is also unique.

For the magnetic field, when there is no free current, $\nabla \times \mathbf {H} =\mathbf {0} .$We can thus define a magnetic scalar potential, ψ, as $\mathbf {H} =-\nabla \psi .$With the definition of H:
$$\nabla \cdot \mathbf {B} =\mu _{0}\nabla \cdot \left(\mathbf {H} +\mathbf {M} \right)=0,
$$it follows that
$$\nabla ^{2}\psi =-\nabla \cdot \mathbf {H} =\nabla \cdot \mathbf {M} .
$$

Similar to electrostatics, in a source-free region, $\mathbf {M} =0$ and Poisson's equation reduces to Laplace's equation for the magnetic scalar potential , $\nabla ^{2}\psi =0$

A potential that does not satisfy Laplace's equation together with the boundary condition is an invalid electrostatic or magnetic scalar potential.


## Gravitation

Let $\mathbf {g}$ be the gravitational field, $\rho$ the mass density, and $G$ the gravitational constant. Then Gauss's law for gravitation in differential form is $\nabla \cdot \mathbf {g} =-4\pi G\rho .$

The gravitational field is conservative and can therefore be expressed as the negative gradient of the gravitational potential:
$${\begin{aligned}\mathbf {g} &=-\nabla V,\\\nabla \cdot \mathbf {g} &=\nabla \cdot (-\nabla V)=-\nabla ^{2}V,\\\implies \nabla ^{2}V&=-\nabla \cdot \mathbf {g} .\end{aligned}}
$$

Using the differential form of Gauss's law of gravitation, we have $\nabla ^{2}V=4\pi G\rho ,$ which is Poisson's equation for gravitational fields.

In empty space, $\rho =0$ and we have $\nabla ^{2}V=0,$ which is Laplace's equation for gravitational fields.


## In the Schwarzschild metric

S. Persides solved the Laplace equation in Schwarzschild spacetime on hypersurfaces of constant t. Using the canonical variables r, θ, φ the solution is
$$\Psi (r,\theta ,\varphi )=R(r)Y_{l}(\theta ,\varphi ),
$$where Yl(θ, φ) is a spherical harmonic function, and
$$R(r)=(-1)^{l}{\frac {(l!)^{2}r_{s}^{l}}{(2l)!}}P_{l}\left(1-{\frac {2r}{r_{s}}}\right)+(-1)^{l+1}{\frac {2(2l+1)!}{(l)!^{2}r_{s}^{l+1}}}Q_{l}\left(1-{\frac {2r}{r_{s}}}\right).
$$

Here Pl and Ql are Legendre functions of the first and second kind, respectively, while rs is the Schwarzschild radius. The parameter l is an arbitrary non-negative integer.


## See also


- 6-sphere coordinates, a coordinate system under which Laplace's equation becomes R-separable
- Helmholtz equation, a generalization of Laplace's equation
- Spherical harmonic
- Quadrature domains
- Potential theory
- Potential flow
- Bateman transform
- Earnshaw's theorem uses the Laplace equation to show that stable static ferromagnetic suspension is impossible
- Vector Laplacian
- Fundamental solution


## Sources


- Courant, Richard; Hilbert, David (1962), Methods of Mathematical Physics, Volume I, Wiley-Interscience.
- Sommerfeld, A. (1949). Partial Differential Equations in Physics. New York: Academic Press. Bibcode:1949pdep.book.....S.
- Zachmanoglou, E. C.; Thoe, Dale W. (1986). Introduction to Partial Differential Equations with Applications. New York: Dover. ISBN 9780486652511.


## Further reading


- Evans, L. C. (1998). Partial Differential Equations. Providence: American Mathematical Society. ISBN 978-0-8218-0772-9.
- Petrovsky, I. G. (1967). Partial Differential Equations. Philadelphia: W. B. Saunders.
- Polyanin, A. D. (2002). Handbook of Linear Partial Differential Equations for Engineers and Scientists. Boca Raton: Chapman & Hall/CRC Press. ISBN 978-1-58488-299-2.


## External links


- "Laplace equation", Encyclopedia of Mathematics, EMS Press, 2001 [1994]
- Laplace Equation (particular solutions and boundary value problems) at EqWorld: The World of Mathematical Equations.
- Example initial-boundary value problems using Laplace's equation from exampleproblems.com.
- Weisstein, Eric W. "Laplace's Equation". MathWorld.
- Find out how boundary value problems governed by Laplace's equation may be solved numerically by boundary element method Archived 2012-02-07 at the Wayback Machine
