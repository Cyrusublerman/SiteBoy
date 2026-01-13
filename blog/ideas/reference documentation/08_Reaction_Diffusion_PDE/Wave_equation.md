# Wave equation

The wave equation is a second-order linear partial differential equation for the description of waves or standing wave fields such as mechanical waves (e.g. water waves, sound waves and seismic waves) or electromagnetic waves (including light waves). It arises in fields like acoustics, electromagnetism, and fluid dynamics.

This article focuses on waves in classical physics. Quantum physics uses an operator-based wave equation often as a relativistic wave equation.


## Introduction

The wave equation is a hyperbolic partial differential equation describing waves, including traveling and standing waves; the latter can be considered as linear superpositions of waves traveling in opposite directions. This article mostly focuses on the scalar wave equation describing waves in scalars by scalar functions $u=u(x,y,z,t)$ of a time variable $t$ (a variable representing time) and one or more spatial variables $x,y,z$ (variables representing a position in a space under discussion). At the same time, there are vector wave equations describing waves in vectors such as waves for an electrical field, magnetic field, and magnetic vector potential and elastic waves. By comparison with vector wave equations, the scalar wave equation can be seen as a special case of the vector wave equations; in the Cartesian coordinate system, the scalar wave equation is the equation to be satisfied by each component (for each coordinate axis, such as the $x$ component for the x axis) of a vector wave without sources of waves in the considered domain (i.e., space and time). For example, in the Cartesian coordinate system, for $(E_{x},E_{y},E_{z})$ as the representation of an electric vector field wave ${\vec {E}}$ in the absence of wave sources, each coordinate axis component $E_{i},i=x,y,z,$ must satisfy the scalar wave equation. Other scalar wave equation solutions u are for physical quantities in scalars such as pressure in a liquid or gas, or the displacement along some specific direction of particles of a vibrating solid away from their resting (equilibrium) positions.

The scalar wave equation is


- $c$ is a fixed non-negative real coefficient representing the propagation speed of the wave
- $u$ is a scalar field representing the displacement or, more generally, the conserved quantity (e.g. pressure or density)
- $x,y,$ and $z$ are the three spatial coordinates and $t$ being the time coordinate.

The equation states that, at any given point, the second derivative of $u$ with respect to time is proportional to the sum of the second derivatives of $u$ with respect to space, with the constant of proportionality being the square of the speed of the wave.

Using notations from vector calculus, the wave equation can be written compactly as $u_{tt}=c^{2}\Delta u,$ or $\Box u=0,$ where the double subscript denotes the second-order partial derivative with respect to time, $\Delta$ is the Laplace operator and $\Box$ the d'Alembert operator, defined as:
$$u_{tt}={\frac {\partial ^{2}u}{\partial t^{2}}},\qquad \Delta ={\frac {\partial ^{2}}{\partial x^{2}}}+{\frac {\partial ^{2}}{\partial y^{2}}}+{\frac {\partial ^{2}}{\partial z^{2}}},\qquad \Box ={\frac {1}{c^{2}}}{\frac {\partial ^{2}}{\partial t^{2}}}-\Delta .
$$

A solution to this (two-way) wave equation can be quite complicated. Still, it can be analyzed as a linear combination of simple solutions that are sinusoidal plane waves with various directions of propagation and wavelengths but all with the same propagation speed $c$. This analysis is possible because the wave equation is linear and homogeneous, so that any multiple of a solution is also a solution, and the sum of any two solutions is again a solution. This property is called the superposition principle in physics.

The wave equation alone does not specify a physical solution; a unique solution is usually obtained by setting a problem with further conditions, such as initial conditions, which prescribe the amplitude and phase of the wave. Another important class of problems occurs in enclosed spaces specified by boundary conditions, for which the solutions represent standing waves, or harmonics, analogous to the harmonics of musical instruments.


## Wave equation in one space dimension

The wave equation in one spatial dimension can be written as follows:
$${\frac {\partial ^{2}u}{\partial t^{2}}}=c^{2}{\frac {\partial ^{2}u}{\partial x^{2}}}.
$$This equation is typically described as having only one spatial dimension $x$, because the only other independent variable is the time $t$.


### Derivation

The wave equation in one space dimension can be derived in a variety of different physical settings. Most famously, it can be derived for the case of a string vibrating in a two-dimensional plane, with each of its elements being pulled in opposite directions by the force of tension.

Another physical setting for derivation of the wave equation in one space dimension uses Hooke's law. In the theory of elasticity, Hooke's law is an approximation for certain materials, stating that the amount by which a material body is deformed (the strain) is linearly related to the force causing the deformation (the stress).


#### Hooke's law

The wave equation in the one-dimensional case can be derived from Hooke's law in the following way: imagine an array of little weights of mass $m$ interconnected with massless springs of length $h$. The springs have a spring constant of $k$}:

Here the dependent variable $u(x)$ measures the distance from the equilibrium of the mass situated at $x$}, so that $u(x)$ essentially measures the magnitude of a disturbance (i.e. strain) that is traveling in an elastic material. The resulting force exerted on the mass $m$ at the location $x+h$ is:
$${\begin{aligned}F_{\text{Hooke}}&=F_{x+2h}-F_{x}=k[u(x+2h,t)-u(x+h,t)]-k[u(x+h,t)-u(x,t)].\end{aligned}}
$$

By equating the latter equation with


$${\begin{aligned}F_{\text{Newton}}&=m\,a(t)=m\,{\frac {\partial ^{2}}{\partial t^{2}}}u(x+h,t),\end{aligned}}
$$

the equation of motion for the weight at the location x + h is obtained:
$${\frac {\partial ^{2}}{\partial t^{2}}}u(x+h,t)={\frac {k}{m}}[u(x+2h,t)-u(x+h,t)-u(x+h,t)+u(x,t)].
$$If the array of weights consists of $N$ weights spaced evenly over the length $L=Nh$ of total mass $M=Nm$, and the total spring constant of the array $K=k/N$, we can write the above equation as


$${\frac {\partial ^{2}}{\partial t^{2}}}u(x+h,t)={\frac {KL^{2}}{M}}{\frac {[u(x+2h,t)-2u(x+h,t)+u(x,t)]}{h^{2}}}.
$$

Taking the limit $N\rightarrow \infty ,h\rightarrow 0$ and assuming smoothness, one gets
$${\frac {\partial ^{2}u(x,t)}{\partial t^{2}}}={\frac {KL^{2}}{M}}{\frac {\partial ^{2}u(x,t)}{\partial x^{2}}},
$$which is from the definition of a second derivative. $KL^{2}/M$ is the square of the propagation speed in this particular case.


#### Stress pulse in a bar

In the case of a stress pulse propagating longitudinally through a bar, the bar acts much like an infinite number of springs in series and can be taken as an extension of the equation derived for Hooke's law. A uniform bar, i.e. of constant cross-section, made from a linear elastic material has a stiffness $K$ given by
$$K={\frac {EA}{L}},
$$where $A$ is the cross-sectional area, and $E$ is the Young's modulus of the material. The wave equation becomes
$${\frac {\partial ^{2}u(x,t)}{\partial t^{2}}}={\frac {EAL}{M}}{\frac {\partial ^{2}u(x,t)}{\partial x^{2}}}.
$$

$AL$ is equal to the volume of the bar, and therefore
$${\frac {AL}{M}}={\frac {1}{\rho }},
$$where $\rho$ is the density of the material. The wave equation reduces to
$${\frac {\partial ^{2}u(x,t)}{\partial t^{2}}}={\frac {E}{\rho }}{\frac {\partial ^{2}u(x,t)}{\partial x^{2}}}.
$$

The speed of a stress wave in a bar is therefore ${\sqrt {E/\rho }}$.


### General solution


#### Algebraic approach

For the one-dimensional wave equation a relatively simple general solution may be found. Defining new variables
$${\begin{aligned}\xi &=x-ct,\\\eta &=x+ct\end{aligned}}
$$changes the wave equation into
$${\frac {\partial ^{2}u}{\partial \xi \partial \eta }}(x,t)=0,
$$which leads to the general solution $u(x,t)=F(\xi )+G(\eta )=F(x-ct)+G(x+ct).$

In other words, the solution is the sum of a right-traveling function $F$ and a left-traveling function $G$. "Traveling" means that the shape of these individual arbitrary functions with respect to x stays constant, however, the functions are translated left and right with time at the speed $c$. This was derived by Jean le Rond d'Alembert.

Another way to arrive at this result is to factor the wave equation using two first-order differential operators:
$$\left[{\frac {\partial }{\partial t}}-c{\frac {\partial }{\partial x}}\right]\left[{\frac {\partial }{\partial t}}+c{\frac {\partial }{\partial x}}\right]u=0.
$$Then, for our original equation, we can define
$$v\equiv {\frac {\partial u}{\partial t}}+c{\frac {\partial u}{\partial x}},
$$and find that we must have
$${\frac {\partial v}{\partial t}}-c{\frac {\partial v}{\partial x}}=0.
$$

This advection equation can be solved by interpreting it as telling us that the directional derivative of $v$ in the $(1,-c)$ direction is 0. This means that the value of $v$ is constant on characteristic lines of the form x + ct = x0, and thus that $v$ must depend only on x + ct, that is, have the form H(x + ct). Then, to solve the first (inhomogenous) equation relating $v$ to u, we can note that its homogenous solution must be a function of the form F(x - ct), by logic similar to the above. Guessing a particular solution of the form G(x + ct), we find that


$$\left[{\frac {\partial }{\partial t}}+c{\frac {\partial }{\partial x}}\right]G(x+ct)=H(x+ct).
$$

Expanding out the left side, rearranging terms, then using the change of variables s = x + ct simplifies the equation to


$$G'(s)={\frac {H(s)}{2c}}.
$$

This means we can find a particular solution G of the desired form by integration. Thus, we have again shown that u obeys u(x, t) = F(x - ct) + G(x + ct).

For an initial-value problem, the arbitrary functions F and G can be determined to satisfy initial conditions: $u(x,0)=f(x),
$$u_{t}(x,0)=g(x).$

The result is d'Alembert's formula:
$$u(x,t)={\frac {f(x-ct)+f(x+ct)}{2}}+{\frac {1}{2c}}\int _{x-ct}^{x+ct}g(s)\,ds.
$$

In the classical sense, if f(x) ∈ C, and g(x) ∈ C, then u(t, x) ∈ C. However, the waveforms F and G may also be generalized functions, such as the delta-function. In that case, the solution may be interpreted as an impulse that travels to the right or the left.

The basic wave equation is a linear differential equation, and so it will adhere to the superposition principle. This means that the net displacement caused by two or more waves is the sum of the displacements which would have been caused by each wave individually. In addition, the behavior of a wave can be analyzed by breaking up the wave into components, e.g. the Fourier transform breaks up a wave into sinusoidal components.


#### Plane-wave eigenmodes

Another way to solve the one-dimensional wave equation is to first analyze its frequency eigenmodes. A so-called eigenmode is a solution that oscillates in time with a well-defined constant angular frequency ω, so that the temporal part of the wave function takes the form e = cos(ωt) − i sin(ωt), and the amplitude is a function f(x) of the spatial variable x, giving a separation of variables for the wave function: $u_{\omega }(x,t)=e^{-i\omega t}f(x).$

This produces an ordinary differential equation for the spatial part f(x):
$${\frac {\partial ^{2}u_{\omega }}{\partial t^{2}}}={\frac {\partial ^{2}}{\partial t^{2}}}\left(e^{-i\omega t}f(x)\right)=-\omega ^{2}e^{-i\omega t}f(x)=c^{2}{\frac {\partial ^{2}}{\partial x^{2}}}\left(e^{-i\omega t}f(x)\right).
$$

Therefore,
$${\frac {d^{2}}{dx^{2}}}f(x)=-\left({\frac {\omega }{c}}\right)^{2}f(x),
$$which is precisely an eigenvalue equation for f(x), hence the name eigenmode. Known as the Helmholtz equation, it has the well-known plane-wave solutions $f(x)=Ae^{\pm ikx},$ with wave number k = ω/c.

The total wave function for this eigenmode is then the linear combination
$$u_{\omega }(x,t)=e^{-i\omega t}\left(Ae^{-ikx}+Be^{ikx}\right)=Ae^{-i(kx+\omega t)}+Be^{i(kx-\omega t)},
$$where complex numbers A, B depend in general on any initial and boundary conditions of the problem.

Eigenmodes are useful in constructing a full solution to the wave equation, because each of them evolves in time trivially with the phase factor $e^{-i\omega t},$ so that a full solution can be decomposed into an eigenmode expansion:
$$u(x,t)=\int _{-\infty }^{\infty }s(\omega )u_{\omega }(x,t)\,d\omega ,
$$or in terms of the plane waves,
$${\begin{aligned}u(x,t)&=\int _{-\infty }^{\infty }s_{+}(\omega )e^{-i(kx+\omega t)}\,d\omega +\int _{-\infty }^{\infty }s_{-}(\omega )e^{i(kx-\omega t)}\,d\omega \\&=\int _{-\infty }^{\infty }s_{+}(\omega )e^{-ik(x+ct)}\,d\omega +\int _{-\infty }^{\infty }s_{-}(\omega )e^{ik(x-ct)}\,d\omega \\&=F(x-ct)+G(x+ct),\end{aligned}}
$$which is exactly in the same form as in the algebraic approach. Functions s±(ω) are known as the Fourier component and are determined by initial and boundary conditions. This is a so-called frequency-domain method, alternative to direct time-domain propagations, such as FDTD method, of the wave packet u(x, t), which is complete for representing waves in absence of time dilations. Completeness of the Fourier expansion for representing waves in the presence of time dilations has been challenged by chirp wave solutions allowing for time variation of ω. The chirp wave solutions seem particularly implied by very large but previously inexplicable radar residuals in the flyby anomaly and differ from the sinusoidal solutions in being receivable at any distance only at proportionally shifted frequencies and time dilations, corresponding to past chirp states of the source.


## Vectorial wave equation in three space dimensions

The vectorial wave equation (from which the scalar wave equation can be directly derived) can be obtained by applying a force equilibrium to an infinitesimal volume element. If the medium has a modulus of elasticity $E$ that is homogeneous (i.e. independent of $\mathbf {x}$) within the volume element, then its stress tensor is given by $\mathbf {T} =E\nabla \mathbf {u}$, for a vectorial elastic deflection $\mathbf {u} (\mathbf {x} ,t)$. The local equilibrium of:


1. the tension force
$$\operatorname {div} \mathbf {T} =\nabla \cdot (E\nabla \mathbf {u} )=E\Delta \mathbf {u}
$$due to deflection $\mathbf {u}$, and
2. the inertial force $\rho \partial ^{2}\mathbf {u} /\partial t^{2}$ caused by the local acceleration $\partial ^{2}\mathbf {u} /\partial t^{2}$

can be written as
$$\rho {\frac {\partial ^{2}\mathbf {u} }{\partial t^{2}}}-E\Delta \mathbf {u} =\mathbf {0} .
$$

By merging density $\rho$ and elasticity module $E,$ the sound velocity $c={\sqrt {E/\rho }}$ results (material law). After insertion, follows the well-known governing wave equation for a homogeneous medium:
$${\frac {\partial ^{2}\mathbf {u} }{\partial t^{2}}}-c^{2}\Delta \mathbf {u} ={\boldsymbol {0}}.
$$(Note: Instead of vectorial $\mathbf {u} (\mathbf {x} ,t),$ only scalar $u(x,t)$ can be used, i.e. waves are travelling only along the $x$ axis, and the scalar wave equation follows as
$${\frac {\partial ^{2}u}{\partial t^{2}}}-c^{2}{\frac {\partial ^{2}u}{\partial x^{2}}}=0
$$.)

The above vectorial partial differential equation of the 2nd order delivers two mutually independent solutions. From the quadratic velocity term $c^{2}=(+c)^{2}=(-c)^{2}$ can be seen that there are two waves travelling in opposite directions $+c$ and $-c$ are possible, hence results the designation "two-way wave equation". It can be shown for plane longitudinal wave propagation that the synthesis of two one-way wave equations leads to a general two-way wave equation. For $\nabla \mathbf {c} =\mathbf {0} ,$ special two-wave equation with the d'Alembert operator results:
$$\left({\frac {\partial }{\partial t}}-\mathbf {c} \cdot \nabla \right)\left({\frac {\partial }{\partial t}}+\mathbf {c} \cdot \nabla \right)\mathbf {u} =\left({\frac {\partial ^{2}}{\partial t^{2}}}+(\mathbf {c} \cdot \nabla )\mathbf {c} \cdot \nabla \right)\mathbf {u} =\left({\frac {\partial ^{2}}{\partial t^{2}}}+(\mathbf {c} \cdot \nabla )^{2}\right)\mathbf {u} =\mathbf {0} .
$$For $\nabla \mathbf {c} =\mathbf {0} ,$ this simplifies to
$$\left({\frac {\partial ^{2}}{\partial t^{2}}}+c^{2}\Delta \right)\mathbf {u} =\mathbf {0} .
$$Therefore, the vectorial 1st-order one-way wave equation with waves travelling in a pre-defined propagation direction $\mathbf {c}$ results as
$${\frac {\partial \mathbf {u} }{\partial t}}-\mathbf {c} \cdot \nabla \mathbf {u} =\mathbf {0} .
$$


## Scalar wave equation in three space dimensions

A solution of the initial-value problem for the wave equation in three space dimensions can be obtained from the corresponding solution for a spherical wave. The result can then be also used to obtain the same solution in two space dimensions.


### Spherical waves

To obtain a solution with constant frequencies, apply the Fourier transform
$$\Psi (\mathbf {r} ,t)=\int _{-\infty }^{\infty }\Psi (\mathbf {r} ,\omega )e^{-i\omega t}\,d\omega ,
$$which transforms the wave equation into an elliptic partial differential equation of the form:
$$\left(\nabla ^{2}+{\frac {\omega ^{2}}{c^{2}}}\right)\Psi (\mathbf {r} ,\omega )=0.
$$

This is the Helmholtz equation and can be solved using separation of variables. In spherical coordinates this leads to a separation of the radial and angular variables, writing the solution as:
$$\Psi (\mathbf {r} ,\omega )=\sum _{l,m}f_{lm}(r)Y_{lm}(\theta ,\phi ).
$$The angular part of the solution take the form of spherical harmonics and the radial function satisfies:
$$\left[{\frac {d^{2}}{dr^{2}}}+{\frac {2}{r}}{\frac {d}{dr}}+k^{2}-{\frac {l(l+1)}{r^{2}}}\right]f_{l}(r)=0.
$$independent of $m$, with $k^{2}=\omega ^{2}/c^{2}$. Substituting
$$f_{l}(r)={\frac {1}{\sqrt {r}}}u_{l}(r),
$$transforms the equation into
$$\left[{\frac {d^{2}}{dr^{2}}}+{\frac {1}{r}}{\frac {d}{dr}}+k^{2}-{\frac {(l+{\frac {1}{2}})^{2}}{r^{2}}}\right]u_{l}(r)=0,
$$which is the Bessel equation.


#### Example

Consider the case l = 0. Then there is no angular dependence and the amplitude depends only on the radial distance, i.e., Ψ(r, t) → u(r, t). In this case, the wave equation reduces to
$$\left(\nabla ^{2}-{\frac {1}{c^{2}}}{\frac {\partial ^{2}}{\partial t^{2}}}\right)\Psi (\mathbf {r} ,t)=0,
$$or
$$\left({\frac {\partial ^{2}}{\partial r^{2}}}+{\frac {2}{r}}{\frac {\partial }{\partial r}}-{\frac {1}{c^{2}}}{\frac {\partial ^{2}}{\partial t^{2}}}\right)u(r,t)=0.
$$

This equation can be rewritten as
$${\frac {\partial ^{2}(ru)}{\partial t^{2}}}-c^{2}{\frac {\partial ^{2}(ru)}{\partial r^{2}}}=0,
$$where the quantity ru satisfies the one-dimensional wave equation. Therefore, there are solutions in the form
$$u(r,t)={\frac {1}{r}}F(r-ct)+{\frac {1}{r}}G(r+ct),
$$where F and G are general solutions to the one-dimensional wave equation and can be interpreted as respectively an outgoing and incoming spherical waves. The outgoing wave can be generated by a point source, and they make possible sharp signals whose form is altered only by a decrease in amplitude as r increases (see an illustration of a spherical wave on the top right). Such waves exist only in cases of space with odd dimensions.

For physical examples of solutions to the 3D wave equation that possess angular dependence, see dipole radiation.


#### Monochromatic spherical wave

Although the word "monochromatic" is not exactly accurate, since it refers to light or electromagnetic radiation with well-defined frequency, the spirit is to discover the eigenmode of the wave equation in three dimensions. Following the derivation in the previous section on plane-wave eigenmodes, if we again restrict our solutions to spherical waves that oscillate in time with well-defined constant angular frequency ω, then the transformed function ru(r, t) has simply plane-wave solutions:$ru(r,t)=Ae^{i(\omega t\pm kr)},$ or
$$u(r,t)={\frac {A}{r}}e^{i(\omega t\pm kr)}.
$$

From this we can observe that the peak intensity of the spherical-wave oscillation, characterized as the squared wave amplitude
$$I=|u(r,t)|^{2}={\frac {|A|^{2}}{r^{2}}},
$$drops at the rate proportional to 1/r, an example of the inverse-square law.


### Solution of a general initial-value problem

The wave equation is linear in u and is left unaltered by translations in space and time. Therefore, we can generate a great variety of solutions by translating and summing spherical waves. Let φ(ξ, η, ζ) be an arbitrary function of three independent variables, and let the spherical wave form F be a delta function. Let a family of spherical waves have center at (ξ, η, ζ), and let r be the radial distance from that point. Thus

$r^{2}=(x-\xi )^{2}+(y-\eta )^{2}+(z-\zeta )^{2}.$

If u is a superposition of such waves with weighting function φ, then
$$u(t,x,y,z)={\frac {1}{4\pi c}}\iiint \varphi (\xi ,\eta ,\zeta ){\frac {\delta (r-ct)}{r}}\,d\xi \,d\eta \,d\zeta ;
$$the denominator 4πc is a convenience.

From the definition of the delta function, u may also be written as
$$u(t,x,y,z)={\frac {t}{4\pi }}\iint _{S}\varphi (x+ct\alpha ,y+ct\beta ,z+ct\gamma )\,d\omega ,
$$where α, β, and γ are coordinates on the unit sphere S, and ω is the area element on S. This result has the interpretation that u(t, x) is t times the mean value of φ on a sphere of radius ct centered at x: $u(t,x,y,z)=tM_{ct}[\varphi ].$

It follows that $u(0,x,y,z)=0,\quad u_{t}(0,x,y,z)=\varphi (x,y,z).$

The mean value is an even function of t, and hence if
$$v(t,x,y,z)={\frac {\partial }{\partial t}}{\big (}tM_{ct}[\varphi ]{\big )},
$$then $v(0,x,y,z)=\varphi (x,y,z),\quad v_{t}(0,x,y,z)=0.$

These formulas provide the solution for the initial-value problem for the wave equation. They show that the solution at a given point P, given (t, x, y, z) depends only on the data on the sphere of radius ct that is intersected by the light cone drawn backwards from P. It does not depend upon data on the interior of this sphere. Thus the interior of the sphere is a lacuna for the solution. This phenomenon is called Huygens' principle. It is only true for odd numbers of space dimension, where for one dimension the integration is performed over the boundary of an interval with respect to the Dirac measure.


## Scalar wave equation in two space dimensions

In two space dimensions, the wave equation is

$u_{tt}=c^{2}\left(u_{xx}+u_{yy}\right).$

We can use the three-dimensional theory to solve this problem if we regard u as a function in three dimensions that is independent of the third dimension. If

$u(0,x,y)=0,\quad u_{t}(0,x,y)=\phi (x,y),$

then the three-dimensional solution formula becomes


$$u(t,x,y)=tM_{ct}[\phi ]={\frac {t}{4\pi }}\iint _{S}\phi (x+ct\alpha ,\,y+ct\beta )\,d\omega ,
$$

where α and β are the first two coordinates on the unit sphere, and dω is the area element on the sphere. This integral may be rewritten as a double integral over the disc D with center (x, y) and radius ct:


$$u(t,x,y)={\frac {1}{2\pi c}}\iint _{D}{\frac {\phi (x+\xi ,y+\eta )}{\sqrt {(ct)^{2}-\xi ^{2}-\eta ^{2}}}}d\xi \,d\eta .
$$

It is apparent that the solution at (t, x, y) depends not only on the data on the light cone where $(x-\xi )^{2}+(y-\eta )^{2}=c^{2}t^{2},$ but also on data that are interior to that cone.


## Scalar wave equation in general dimension and Kirchhoff's formulae

We want to find solutions to utt − Δu = 0 for u : R × (0, ∞) → R with u(x, 0) = g(x) and ut(x, 0) = h(x).


### Odd dimensions

Assume n ≥ 3 is an odd integer, and g ∈ C(R), h ∈ C(R) for m = (n + 1)/2. Let γn = 1 × 3 × 5 × ⋯ × (n − 2) and let


$$u(x,t)={\frac {1}{\gamma _{n}}}\left[\partial _{t}\left({\frac {1}{t}}\partial _{t}\right)^{\frac {n-3}{2}}\left(t^{n-2}{\frac {1}{|\partial B_{t}(x)|}}\int _{\partial B_{t}(x)}g\,dS\right)+\left({\frac {1}{t}}\partial _{t}\right)^{\frac {n-3}{2}}\left(t^{n-2}{\frac {1}{|\partial B_{t}(x)|}}\int _{\partial B_{t}(x)}h\,dS\right)\right]
$$


- 
$$u\in C^{2}{\big (}\mathbf {R} ^{n}\times [0,\infty ){\big )}
$$,
- $u_{tt}-\Delta u=0$ in $\mathbf {R} ^{n}\times (0,\infty )$,
- $\lim _{(x,t)\to (x^{0},0)}u(x,t)=g(x^{0})$,
- $\lim _{(x,t)\to (x^{0},0)}u_{t}(x,t)=h(x^{0})$.


### Even dimensions

Assume n ≥ 2 is an even integer and g ∈ C(R), h ∈ C(R), for m = (n + 2)/2. Let γn = 2 × 4 × ⋯ × n and let


$$u(x,t)={\frac {1}{\gamma _{n}}}\left[\partial _{t}\left({\frac {1}{t}}\partial _{t}\right)^{\frac {n-2}{2}}\left(t^{n}{\frac {1}{|B_{t}(x)|}}\int _{B_{t}(x)}{\frac {g}{(t^{2}-|y-x|^{2})^{\frac {1}{2}}}}dy\right)+\left({\frac {1}{t}}\partial _{t}\right)^{\frac {n-2}{2}}\left(t^{n}{\frac {1}{|B_{t}(x)|}}\int _{B_{t}(x)}{\frac {h}{(t^{2}-|y-x|^{2})^{\frac {1}{2}}}}dy\right)\right]
$$


- u ∈ C(R × [0, ∞))
- utt − Δu = 0 in R × (0, ∞)
- $\lim _{(x,t)\to (x^{0},0)}u(x,t)=g(x^{0})$
- $\lim _{(x,t)\to (x^{0},0)}u_{t}(x,t)=h(x^{0})$


## Green's function

Consider the inhomogeneous wave equation in $1+D$ dimensions$(\partial _{tt}-c^{2}\nabla ^{2})u=s(t,x)$By rescaling time, we can set wave speed $c=1$.

Since the wave equation $(\partial _{tt}-\nabla ^{2})u=s(t,x)$ has order 2 in time, there are two impulse responses: an acceleration impulse and a velocity impulse. The effect of inflicting an acceleration impulse is to suddenly change the wave velocity $\partial _{t}u$. The effect of inflicting a velocity impulse is to suddenly change the wave displacement $u$.

For acceleration impulse, $s(t,x)=\delta ^{D+1}(t,x)$ where $\delta$ is the Dirac delta function. The solution to this case is called the Green's function $G$ for the wave equation.

For velocity impulse, $s(t,x)=\partial _{t}\delta ^{D+1}(t,x)$, so if we solve the Green function $G$, the solution for this case is just $\partial _{t}G$.


### Duhamel's principle

The main use of Green's functions is to solve initial value problems by Duhamel's principle, both for the homogeneous and the inhomogeneous case.

Given the Green function $G$, and initial conditions $u(0,x),\partial _{t}u(0,x)$, the solution to the homogeneous wave equation is$u=(\partial _{t}G)\ast u+G\ast \partial _{t}u$where the asterisk is convolution in space. More explicitly,
$$u(t,x)=\int (\partial _{t}G)(t,x-x')u(0,x')dx'+\int G(t,x-x')(\partial _{t}u)(0,x')dx'.
$$For the inhomogeneous case, the solution has one additional term by convolution over spacetime:$\iint _{t'<t}G(t-t',x-x')s(t',x')dt'dx'.$


### Solution by Fourier transform

By a Fourier transform,
$${\hat {G}}(\omega )={\frac {1}{-\omega _{0}^{2}+\omega _{1}^{2}+\cdots +\omega _{D}^{2}}},\quad G(t,x)={\frac {1}{(2\pi )^{D+1}}}\int {\hat {G}}(\omega )e^{+i\omega _{0}t+i{\vec {\omega }}\cdot {\vec {x}}}d\omega _{0}d{\vec {\omega }}.
$$The $\omega _{0}$ term can be integrated by the residue theorem. It would require us to perturb the integral slightly either by $+i\epsilon$ or by $-i\epsilon$, because it is an improper integral. One perturbation gives the forward solution, and the other the backward solution. The forward solution gives
$$G(t,x)={\frac {1}{(2\pi )^{D}}}\int {\frac {\sin(\|{\vec {\omega }}\|t)}{\|{\vec {\omega }}\|}}e^{i{\vec {\omega }}\cdot {\vec {x}}}d{\vec {\omega }},\quad \partial _{t}G(t,x)={\frac {1}{(2\pi )^{D}}}\int \cos(\|{\vec {\omega }}\|t)e^{i{\vec {\omega }}\cdot {\vec {x}}}d{\vec {\omega }}.
$$The integral can be solved by analytically continuing the Poisson kernel, giving
$$G(t,x)=\lim _{\epsilon \rightarrow 0^{+}}{\frac {C_{D}}{D-1}}\operatorname {Im} \left[\|x\|^{2}-(t-i\epsilon )^{2}\right]^{-(D-1)/2}
$$where $C_{D}=\pi ^{-(D+1)/2}\Gamma ((D+1)/2)$ is half the surface area of a $(D+1)$-dimensional hypersphere.


### Solutions in particular dimensions

We can relate the Green's function in $D$ dimensions to the Green's function in $D+n$ dimensions (lowering the dimension is possible in any case, raising is possible in spherical symmetry).


#### Lowering dimensions

Given a function $s(t,x)$ and a solution $u(t,x)$ of a differential equation in $(1+D)$ dimensions, we can trivially extend it to $(1+D+n)$ dimensions by setting the additional $n$ dimensions to be constant:
$$s(t,x_{1:D},x_{D+1:D+n})=s(t,x_{1:D}),\quad u(t,x_{1:D},x_{D+1:D+n})=u(t,x_{1:D}).
$$Since the Green's function is constructed from $s$ and $u$, the Green's function in $(1+D+n)$ dimensions integrates to the Green's function in $(1+D)$ dimensions:
$$G_{D}(t,x_{1:D})=\int _{\mathbb {R} ^{n}}G_{D+n}(t,x_{1:D},x_{D+1:D+n})d^{n}x_{D+1:D+n}.
$$


#### Raising dimensions

The Green's function in $D$ dimensions can be related to the Green's function in $D+2$ dimensions. By spherical symmetry,
$$G_{D}(t,r)=\int _{\mathbb {R} ^{2}}G_{D+2}(t,{\sqrt {r^{2}+y^{2}+z^{2}}})dydz.
$$Integrating in polar coordinates,
$$G_{D}(t,r)=2\pi \int _{0}^{\infty }G_{D+2}(t,{\sqrt {r^{2}+q^{2}}})qdq=2\pi \int _{r}^{\infty }G_{D+2}(t,q')q'dq',
$$where in the last equality we made the change of variables $q'={\sqrt {r^{2}+q^{2}}}$. Thus, we obtain the recurrence relation
$$G_{D+2}(t,r)=-{\frac {1}{2\pi r}}\partial _{r}G_{D}(t,r).
$$


### Solutions in D = 1, 2, 3

When $D=1$, the integrand in the Fourier transform is the sinc function
$${\begin{aligned}G_{1}(t,x)&={\frac {1}{2\pi }}\int _{\mathbb {R} }{\frac {\sin(|\omega |t)}{|\omega |}}e^{i\omega x}d\omega \\&={\frac {1}{2\pi }}\int \operatorname {sinc} (\omega )e^{i\omega {\frac {x}{t}}}d\omega \\&={\frac {\operatorname {sgn}(t-x)+\operatorname {sgn}(t+x)}{4}}\\&={\begin{cases}{\frac {1}{2}}\theta (t-|x|)\quad t>0\\-{\frac {1}{2}}\theta (-t-|x|)\quad t<0\end{cases}}\end{aligned}}
$$where $\operatorname {sgn}$ is the sign function and $\theta$ is the unit step function.

The dimension can be raised to give the $D=3$ case
$$G_{3}(t,r)={\frac {\delta (t-r)}{4\pi r}}
$$and similarly for the backward solution. This can be integrated down by one dimension to give the $D=2$ case
$$G_{2}(t,r)=\int _{\mathbb {R} }{\frac {\delta (t-{\sqrt {r^{2}+z^{2}}})}{4\pi {\sqrt {r^{2}+z^{2}}}}}dz={\frac {\theta (t-r)}{2\pi {\sqrt {t^{2}-r^{2}}}}}
$$


### Wavefronts and wakes

In $D=1$ case, the Green's function solution is the sum of two wavefronts
$${\frac {\operatorname {sgn}(t-x)}{4}}+{\frac {\operatorname {sgn}(t+x)}{4}}
$$moving in opposite directions.

In odd dimensions, the forward solution is nonzero only at $t=r$. As the dimensions increase, the shape of wavefront becomes increasingly complex, involving higher derivatives of the Dirac delta function. For example,
$${\begin{aligned}&G_{1}={\frac {1}{2c}}\theta (\tau )\\&G_{3}={\frac {1}{4\pi c^{2}}}{\frac {\delta (\tau )}{r}}\\&G_{5}={\frac {1}{8\pi ^{2}c^{2}}}\left({\frac {\delta (\tau )}{r^{3}}}+{\frac {\delta ^{\prime }(\tau )}{cr^{2}}}\right)\\&G_{7}={\frac {1}{16\pi ^{3}c^{2}}}\left(3{\frac {\delta (\tau )}{r^{4}}}+3{\frac {\delta ^{\prime }(\tau )}{cr^{3}}}+{\frac {\delta ^{\prime \prime }(\tau )}{c^{2}r^{2}}}\right)\end{aligned}}
$$where $\tau =t-r$, and the wave speed $c$ is restored.

In even dimensions, the forward solution is nonzero in $r\leq t$, the entire region behind the wavefront becomes nonzero, called a wake. The wake has equation:
$$G_{D}(t,x)=(-1)^{1+D/2}{\frac {1}{(2\pi )^{D/2}}}{\frac {1}{c^{D}}}{\frac {\theta (t-r/c)}{\left(t^{2}-r^{2}/c^{2}\right)^{(D-1)/2}}}
$$The wavefront itself also involves increasingly higher derivatives of the Dirac delta function.

This means that a general Huygens' principle – the wave displacement at a point $(t,x)$ in spacetime depends only on the state at points on characteristic rays passing $(t,x)$ – only holds in odd dimensions. A physical interpretation is that signals transmitted by waves remain undistorted in odd dimensions, but distorted in even dimensions.

Hadamard's conjecture states that this generalized Huygens' principle still holds in all odd dimensions even when the coefficients in the wave equation are no longer constant. It is not strictly correct, but it is correct for certain families of coefficients


## Problems with boundaries


### One space dimension


#### Reflection and transmission at the boundary of two media

For an incident wave traveling from one medium (where the wave speed is c1) to another medium (where the wave speed is c2), one part of the wave will transmit into the second medium, while another part reflects back into the other direction and stays in the first medium. The amplitude of the transmitted wave and the reflected wave can be calculated by using the continuity condition at the boundary.

Consider the component of the incident wave with an angular frequency of ω, which has the waveform
$$u^{\text{inc}}(x,t)=Ae^{i(k_{1}x-\omega t)},\quad A\in \mathbb {C} .
$$At t = 0, the incident reaches the boundary between the two media at x = 0. Therefore, the corresponding reflected wave and the transmitted wave will have the waveforms
$$u^{\text{refl}}(x,t)=Be^{i(-k_{1}x-\omega t)},\quad u^{\text{trans}}(x,t)=Ce^{i(k_{2}x-\omega t)},\quad B,C\in \mathbb {C} .
$$The continuity condition at the boundary is
$$u^{\text{inc}}(0,t)+u^{\text{refl}}(0,t)=u^{\text{trans}}(0,t),\quad u_{x}^{\text{inc}}(0,t)+u_{x}^{\text{ref}}(0,t)=u_{x}^{\text{trans}}(0,t).
$$This gives the equations
$$A+B=C,\quad A-B={\frac {k_{2}}{k_{1}}}C={\frac {c_{1}}{c_{2}}}C,
$$and we have the reflectivity and transmissivity
$${\frac {B}{A}}={\frac {c_{2}-c_{1}}{c_{2}+c_{1}}},\quad {\frac {C}{A}}={\frac {2c_{2}}{c_{2}+c_{1}}}.
$$When c2 < c1, the reflected wave has a reflection phase change of 180°, since B/A < 0. The energy conservation can be verified by
$${\frac {B^{2}}{c_{1}}}+{\frac {C^{2}}{c_{2}}}={\frac {A^{2}}{c_{1}}}.
$$The above discussion holds true for any component, regardless of its angular frequency of ω.

The limiting case of c2 = 0 corresponds to a "fixed end" that does not move, whereas the limiting case of c2 → ∞ corresponds to a "free end".


#### The Sturm–Liouville formulation

A flexible string that is stretched between two points x = 0 and x = L satisfies the wave equation for t > 0 and 0 < x < L. On the boundary points, u may satisfy a variety of boundary conditions. A general form that is appropriate for applications is


$${\begin{aligned}-u_{x}(t,0)+au(t,0)&=0,\\u_{x}(t,L)+bu(t,L)&=0,\end{aligned}}
$$

where a and b are non-negative. The case where u is required to vanish at an endpoint (i.e. "fixed end") is the limit of this condition when the respective a or b approaches infinity. The method of separation of variables consists in looking for solutions of this problem in the special form $u(t,x)=T(t)v(x).$

A consequence is that
$${\frac {T''}{c^{2}T}}={\frac {v''}{v}}=-\lambda .
$$

The eigenvalue λ must be determined so that there is a non-trivial solution of the boundary-value problem
$${\begin{aligned}v''+\lambda v=0,&\\-v'(0)+av(0)&=0,\\v'(L)+bv(L)&=0.\end{aligned}}
$$

This is a special case of the general problem of Sturm–Liouville theory. If a and b are positive, the eigenvalues are all positive, and the solutions are trigonometric functions. A solution that satisfies square-integrable initial conditions for u and ut can be obtained from expansion of these functions in the appropriate trigonometric series.


### Several space dimensions

The one-dimensional initial-boundary value theory may be extended to an arbitrary number of space dimensions. Consider a domain D in m-dimensional x space, with boundary B. Then the wave equation is to be satisfied if x is in D, and t > 0. On the boundary of D, the solution u shall satisfy


$${\frac {\partial u}{\partial n}}+au=0,
$$

where n is the unit outward normal to B, and a is a non-negative function defined on B. The case where u vanishes on B is a limiting case for a approaching infinity. The initial conditions are

$u(0,x)=f(x),\quad u_{t}(0,x)=g(x),$

where f and g are defined in D. This problem may be solved by expanding f and g in the eigenfunctions of the Laplacian in D, which satisfy the boundary conditions. Thus the eigenfunction v satisfies

$\nabla \cdot \nabla v+\lambda v=0$


$${\frac {\partial v}{\partial n}}+av=0
$$

In the case of two space dimensions, the eigenfunctions may be interpreted as the modes of vibration of a drumhead stretched over the boundary B. If B is a circle, then these eigenfunctions have an angular component that is a trigonometric function of the polar angle θ, multiplied by a Bessel function (of integer order) of the radial component. Further details are in Helmholtz equation.

If the boundary is a sphere in three space dimensions, the angular components of the eigenfunctions are spherical harmonics, and the radial components are Bessel functions of half-integer order.


## Inhomogeneous wave equation in one dimension

The inhomogeneous wave equation in one dimension is $u_{tt}(x,t)-c^{2}u_{xx}(x,t)=s(x,t)$ with initial conditions $u(x,0)=f(x),$ $u_{t}(x,0)=g(x).$

The function s(x, t) is often called the source function because in practice it describes the effects of the sources of waves on the medium carrying them. Physical examples of source functions include the force driving a wave on a string, or the charge or current density in the Lorenz gauge of electromagnetism.

One method to solve the initial-value problem (with the initial values as posed above) is to take advantage of a special property of the wave equation in an odd number of space dimensions, namely that its solutions respect causality. That is, for any point (xi, ti), the value of u(xi, ti) depends only on the values of f(xi + cti) and f(xi − cti) and the values of the function g(x) between (xi − cti) and (xi + cti). This can be seen in d'Alembert's formula, stated above, where these quantities are the only ones that show up in it. Physically, if the maximum propagation speed is c, then no part of the wave that cannot propagate to a given point by a given time can affect the amplitude at the same point and time.

In terms of finding a solution, this causality property means that for any given point on the line being considered, the only area that needs to be considered is the area encompassing all the points that could causally affect the point being considered. Denote the area that causally affects point (xi, ti) as RC. Suppose we integrate the inhomogeneous wave equation over this region:
$$\iint _{R_{C}}{\big (}c^{2}u_{xx}(x,t)-u_{tt}(x,t){\big )}\,dx\,dt=\iint _{R_{C}}s(x,t)\,dx\,dt.
$$

To simplify this greatly, we can use Green's theorem to simplify the left side to get the following:
$$\int _{L_{0}+L_{1}+L_{2}}{\big (}{-}c^{2}u_{x}(x,t)\,dt-u_{t}(x,t)\,dx{\big )}=\iint _{R_{C}}s(x,t)\,dx\,dt.
$$

The left side is now the sum of three line integrals along the bounds of the causality region. These turn out to be fairly easy to compute:
$$\int _{x_{i}-ct_{i}}^{x_{i}+ct_{i}}-u_{t}(x,0)\,dx=-\int _{x_{i}-ct_{i}}^{x_{i}+ct_{i}}g(x)\,dx.
$$

In the above, the term to be integrated with respect to time disappears because the time interval involved is zero, thus dt = 0.

For the other two sides of the region, it is worth noting that x ± ct is a constant, namely xi ± cti, where the sign is chosen appropriately. Using this, we can get the relation dx ± cdt = 0, again choosing the right sign:
$${\begin{aligned}\int _{L_{1}}{\big (}{-}c^{2}u_{x}(x,t)\,dt-u_{t}(x,t)\,dx{\big )}&=\int _{L_{1}}{\big (}cu_{x}(x,t)\,dx+cu_{t}(x,t)\,dt{\big )}\\&=c\int _{L_{1}}\,du(x,t)\\&=cu(x_{i},t_{i})-cf(x_{i}+ct_{i}).\end{aligned}}
$$

And similarly for the final boundary segment:
$${\begin{aligned}\int _{L_{2}}{\big (}{-}c^{2}u_{x}(x,t)\,dt-u_{t}(x,t)\,dx{\big )}&=-\int _{L_{2}}{\big (}cu_{x}(x,t)\,dx+cu_{t}(x,t)\,dt{\big )}\\&=-c\int _{L_{2}}\,du(x,t)\\&=cu(x_{i},t_{i})-cf(x_{i}-ct_{i}).\end{aligned}}
$$

Adding the three results together and putting them back in the original integral gives
$${\begin{aligned}\iint _{R_{C}}s(x,t)\,dx\,dt&=-\int _{x_{i}-ct_{i}}^{x_{i}+ct_{i}}g(x)\,dx+cu(x_{i},t_{i})-cf(x_{i}+ct_{i})+cu(x_{i},t_{i})-cf(x_{i}-ct_{i})\\&=2cu(x_{i},t_{i})-cf(x_{i}+ct_{i})-cf(x_{i}-ct_{i})-\int _{x_{i}-ct_{i}}^{x_{i}+ct_{i}}g(x)\,dx.\end{aligned}}
$$

Solving for u(xi, ti), we arrive at
$$u(x_{i},t_{i})={\frac {f(x_{i}+ct_{i})+f(x_{i}-ct_{i})}{2}}+{\frac {1}{2c}}\int _{x_{i}-ct_{i}}^{x_{i}+ct_{i}}g(x)\,dx+{\frac {1}{2c}}\int _{0}^{t_{i}}\int _{x_{i}-c(t_{i}-t)}^{x_{i}+c(t_{i}-t)}s(x,t)\,dx\,dt.
$$

In the last equation of the sequence, the bounds of the integral over the source function have been made explicit. Looking at this solution, which is valid for all choices (xi, ti) compatible with the wave equation, it is clear that the first two terms are simply d'Alembert's formula, as stated above as the solution of the homogeneous wave equation in one dimension. The difference is in the third term, the integral over the source.


## Further generalizations


### Elastic waves

The elastic wave equation (also known as the Navier–Cauchy equation) in three dimensions describes the propagation of waves in an isotropic homogeneous elastic medium. Most solid materials are elastic, so this equation describes such phenomena as seismic waves in the Earth and ultrasonic waves used to detect flaws in materials. While linear, this equation has a more complex form than the equations given above, as it must account for both longitudinal and transverse motion:
$$\rho {\ddot {\mathbf {u} }}=\mathbf {f} +(\lambda +2\mu )\nabla (\nabla \cdot \mathbf {u} )-\mu \nabla \times (\nabla \times \mathbf {u} ),
$$where:

λ and μ are the so-called Lamé parameters describing the elastic properties of the medium,

ρ is the density,

f is the source function (driving force),

u is the displacement vector.

By using ∇ × (∇ × u) = ∇(∇ ⋅ u) − ∇ ⋅ ∇ u = ∇(∇ ⋅ u) − ∆u, the elastic wave equation can be rewritten into the more common form of the Navier–Cauchy equation.

Note that in the elastic wave equation, both force and displacement are vector quantities. Thus, this equation is sometimes known as the vector wave equation. As an aid to understanding, the reader will observe that if f and ∇ ⋅ u are set to zero, this becomes (effectively) Maxwell's equation for the propagation of the electric field E, which has only transverse waves.


### Dispersion relation

In dispersive wave phenomena, the speed of wave propagation varies with the wavelength of the wave, which is reflected by a dispersion relation

$\omega =\omega (\mathbf {k} ),$

where ω is the angular frequency, and k is the wavevector describing plane-wave solutions. For light waves, the dispersion relation is ω = ±c |k|, but in general, the constant speed c gets replaced by a variable phase velocity:


$$v_{\text{p}}={\frac {\omega (k)}{k}}.
$$


## See also


## External links


- Nonlinear Wave Equations by Stephen Wolfram and Rob Knapp, Nonlinear Wave Equation Explorer by Wolfram Demonstrations Project.
- Mathematical aspects of wave equations are discussed on the Dispersive PDE Wiki Archived 2007-04-25 at the Wayback Machine.
- Graham W Griffiths and William E. Schiesser (2009). Linear and nonlinear waves. Scholarpedia, 4(7):4308. doi:10.4249/scholarpedia.4308
