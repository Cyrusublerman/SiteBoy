# Reaction–diffusion system

Reaction–diffusion systems are mathematical models that correspond to several physical phenomena. The most common is the change in space and time of the concentration of one or more chemical substances: local chemical reactions in which the substances are transformed into each other, and diffusion which causes the substances to spread out over a surface in space.

Reaction–diffusion systems are naturally applied in chemistry. However, the system can also describe dynamical processes of non-chemical nature. Examples are found in biology, geology and physics (neutron diffusion theory) and ecology. Mathematically, reaction–diffusion systems take the form of semi-linear parabolic partial differential equations. They can be represented in the general form


$$\partial _{t}{\boldsymbol {q}}={\underline {\underline {\boldsymbol {D}}}}\,\nabla ^{2}{\boldsymbol {q}}+{\boldsymbol {R}}({\boldsymbol {q}}),
$$

where q(x, t) represents the unknown vector function, D is a diagonal matrix of diffusion coefficients, and R accounts for all local reactions. The solutions of reaction–diffusion equations display a wide range of behaviours, including the formation of travelling waves and wave-like phenomena as well as other self-organized patterns like stripes, hexagons or more intricate structure like dissipative solitons. Such patterns have been dubbed "Turing patterns". Each function, for which a reaction diffusion differential equation holds, represents in fact a concentration variable.


## One-component reaction–diffusion equations

The simplest reaction–diffusion equation is in one spatial dimension in plane geometry,

$\partial _{t}u=D\partial _{x}^{2}u+R(u),$

is also referred to as the Kolmogorov–Petrovsky–Piskunov equation. If the reaction term vanishes, then the equation represents a pure diffusion process. The corresponding equation is Fick's second law. The choice R(u) = u(1 − u) yields Fisher's equation that was originally used to describe the spreading of biological populations, the Newell–Whitehead-Segel equation with R(u) = u(1 − u) to describe Rayleigh–Bénard convection, the more general Zeldovich–Frank-Kamenetskii equation with R(u) = u(1 − u)e and 0 < β < ∞ (Zeldovich number) that arises in combustion theory, and its particular degenerate case with R(u) = u − u that is sometimes referred to as the Zeldovich equation as well.

The dynamics of one-component systems is subject to certain restrictions as the evolution equation can also be written in the variational form


$$\partial _{t}u=-{\frac {\delta {\mathfrak {L}}}{\delta u}}
$$

and therefore describes a permanent decrease of the "free energy" ${\mathfrak {L}}$ given by the functional


$${\mathfrak {L}}=\int _{-\infty }^{\infty }\left[{\tfrac {D}{2}}\left(\partial _{x}u\right)^{2}-V(u)\right]\,{\text{d}}x
$$

with a potential V(u) such that R(u) = .mw-parser-output .sfrac{white-space:nowrap}.mw-parser-output .sfrac.tion,.mw-parser-output .sfrac .tion{display:inline-block;vertical-align:-0.5em;font-size:85%;text-align:center}.mw-parser-output .sfrac .num{display:block;line-height:1em;margin:0.0em 0.1em;border-bottom:1px solid}.mw-parser-output .sfrac .den{display:block;line-height:1em;margin:0.1em 0.1em}.mw-parser-output .sr-only{border:0;clip:rect(0,0,0,0);clip-path:polygon(0px 0px,0px 0px,0px 0px);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}⁠dV(u)/du⁠.

In systems with more than one stationary homogeneous solution, a typical solution is given by travelling fronts connecting the homogeneous states. These solutions move with constant speed without changing their shape and are of the form u(x, t) = û(ξ) with ξ = x − ct, where c is the speed of the travelling wave. Note that while travelling waves are generically stable structures, all non-monotonous stationary solutions (e.g. localized domains composed of a front-antifront pair) are unstable. For c = 0, there is a simple proof for this statement: if u0(x) is a stationary solution and u = u0(x) + ũ(x, t) is an infinitesimally perturbed solution, linear stability analysis yields the equation


$$\partial _{t}{\tilde {u}}=D\partial _{x}^{2}{\tilde {u}}-U(x){\tilde {u}},\qquad U(x)=-R^{\prime }(u){\Big |}_{u=u_{0}(x)}.
$$

With the ansatz ũ = ψ(x)exp(−λt) we arrive at the eigenvalue problem


$${\hat {H}}\psi =\lambda \psi ,\qquad {\hat {H}}=-D\partial _{x}^{2}+U(x),
$$

of Schrödinger type where negative eigenvalues result in the instability of the solution. Due to translational invariance ψ = ∂x u0(x) is a neutral eigenfunction with the eigenvalue λ = 0, and all other eigenfunctions can be sorted according to an increasing number of nodes with the magnitude of the corresponding real eigenvalue increases monotonically with the number of zeros. The eigenfunction ψ = ∂x u0(x) should have at least one zero, and for a non-monotonic stationary solution the corresponding eigenvalue λ = 0 cannot be the lowest one, thereby implying instability.

To determine the velocity c of a moving front, one may go to a moving coordinate system and look at stationary solutions:


$$D\partial _{\xi }^{2}{\hat {u}}(\xi )+c\partial _{\xi }{\hat {u}}(\xi )+R({\hat {u}}(\xi ))=0.
$$

This equation has a nice mechanical analogue as the motion of a mass D with position û in the course of the "time" ξ under the force R with the damping coefficient c which allows for a rather illustrative access to the construction of different types of solutions and the determination of c.

When going from one to more space dimensions, a number of statements from one-dimensional systems can still be applied. Planar or curved wave fronts are typical structures, and a new effect arises as the local velocity of a curved front becomes dependent on the local radius of curvature (this can be seen by going to polar coordinates). This phenomenon leads to the so-called curvature-driven instability.


## Two-component reaction–diffusion equations

Two-component systems allow for a much larger range of possible phenomena than their one-component counterparts. An important idea that was first proposed by Alan Turing is that a state that is stable in the local system can become unstable in the presence of diffusion.

A linear stability analysis however shows that when linearizing the general two-component system


$${\begin{pmatrix}\partial _{t}u\\\partial _{t}v\end{pmatrix}}={\begin{pmatrix}D_{u}&0\\0&D_{v}\end{pmatrix}}{\begin{pmatrix}\partial _{xx}u\\\partial _{xx}v\end{pmatrix}}+{\begin{pmatrix}F(u,v)\\G(u,v)\end{pmatrix}}
$$

a plane wave perturbation


$${\tilde {\boldsymbol {q}}}_{\boldsymbol {k}}({\boldsymbol {x}},t)={\begin{pmatrix}{\tilde {u}}(t)\\{\tilde {v}}(t)\end{pmatrix}}e^{i{\boldsymbol {k}}\cdot {\boldsymbol {x}}}
$$

of the stationary homogeneous solution will satisfy


$${\begin{pmatrix}\partial _{t}{\tilde {u}}_{\boldsymbol {k}}(t)\\\partial _{t}{\tilde {v}}_{\boldsymbol {k}}(t)\end{pmatrix}}=-k^{2}{\begin{pmatrix}D_{u}{\tilde {u}}_{\boldsymbol {k}}(t)\\D_{v}{\tilde {v}}_{\boldsymbol {k}}(t)\end{pmatrix}}+{\boldsymbol {R}}^{\prime }{\begin{pmatrix}{\tilde {u}}_{\boldsymbol {k}}(t)\\{\tilde {v}}_{\boldsymbol {k}}(t)\end{pmatrix}}.
$$

Turing's idea can only be realized in four equivalence classes of systems characterized by the signs of the Jacobian R′ of the reaction function. In particular, if a finite wave vector k is supposed to be the most unstable one, the Jacobian must have the signs


$${\begin{pmatrix}+&-\\+&-\end{pmatrix}},\quad {\begin{pmatrix}+&+\\-&-\end{pmatrix}},\quad {\begin{pmatrix}-&+\\-&+\end{pmatrix}},\quad {\begin{pmatrix}-&-\\+&+\end{pmatrix}}.
$$

This class of systems is named activator-inhibitor system after its first representative: close to the ground state, one component stimulates the production of both components while the other one inhibits their growth. Its most prominent representative is the FitzHugh–Nagumo equation


$${\begin{aligned}\partial _{t}u&=d_{u}^{2}\,\nabla ^{2}u+f(u)-\sigma v,\\\tau \partial _{t}v&=d_{v}^{2}\,\nabla ^{2}v+u-v\end{aligned}}
$$

with f (u) = λu − u − κ which describes how an action potential travels through a nerve. Here, du, dv, τ, σ and λ are positive constants.

When an activator-inhibitor system undergoes a change of parameters, one may pass from conditions under which a homogeneous ground state is stable to conditions under which it is linearly unstable. The corresponding bifurcation may be either a Hopf bifurcation to a globally oscillating homogeneous state with a dominant wave number k = 0 or a Turing bifurcation to a globally patterned state with a dominant finite wave number. The latter in two spatial dimensions typically leads to stripe or hexagonal patterns.


- Subcritical Turing bifurcation: formation of a hexagonal pattern from noisy initial conditions in the above two-component reaction–diffusion system of Fitzhugh–Nagumo type.
- Noisy initial conditions at t = 0.
- State of the system at t = 10.
- Almost converged state at t = 100.

For the Fitzhugh–Nagumo example, the neutral stability curves marking the boundary of the linearly stable region for the Turing and Hopf bifurcation are given by


$${\begin{aligned}q_{\text{n}}^{H}(k):&{}\quad {\frac {1}{\tau }}+\left(d_{u}^{2}+{\frac {1}{\tau }}d_{v}^{2}\right)k^{2}&=f^{\prime }(u_{h}),\\[6pt]q_{\text{n}}^{T}(k):&{}\quad {\frac {\kappa }{1+d_{v}^{2}k^{2}}}+d_{u}^{2}k^{2}&=f^{\prime }(u_{h}).\end{aligned}}
$$

If the bifurcation is subcritical, often localized structures (dissipative solitons) can be observed in the hysteretic region where the pattern coexists with the ground state. Other frequently encountered structures comprise pulse trains (also known as periodic travelling waves), spiral waves and target patterns. These three solution types are also generic features of two- (or more-) component reaction–diffusion equations in which the local dynamics have a stable limit cycle


- Other patterns found in the above two-component reaction–diffusion system of Fitzhugh–Nagumo type.
- Rotating spiral.
- Target pattern.
- Stationary localized pulse (dissipative soliton).


## Three- and more-component reaction–diffusion equations

For a variety of systems, reaction–diffusion equations with more than two components have been proposed, e.g. the Belousov–Zhabotinsky reaction, for blood clotting, fission waves or planar gas discharge systems.

It is known that systems with more components allow for a variety of phenomena not possible in systems with one or two components (e.g. stable running pulses in more than one spatial dimension without global feedback). An introduction and systematic overview of the possible phenomena in dependence on the properties of the underlying system is given in.


## Applications and universality

In recent times, reaction–diffusion systems have attracted much interest as a prototype model for pattern formation. The above-mentioned patterns (fronts, spirals, targets, hexagons, stripes and dissipative solitons) can be found in various types of reaction–diffusion systems in spite of large discrepancies e.g. in the local reaction terms. It has also been argued that reaction–diffusion processes are an essential basis for processes connected to morphogenesis in biology and may even be related to animal coats and skin pigmentation. Other applications of reaction–diffusion equations include ecological invasions, spread of epidemics, tumour growth, dynamics of fission waves, wound healing and visual hallucinations. Another reason for the interest in reaction–diffusion systems is that although they are nonlinear partial differential equations, there are often possibilities for an analytical treatment.


## Experiments

Well-controllable experiments in chemical reaction–diffusion systems have up to now been realized in three ways. First, gel reactors or filled capillary tubes may be used. Second, temperature pulses on catalytic surfaces have been investigated. Third, the propagation of running nerve pulses is modelled using reaction–diffusion systems.

Aside from these generic examples, it has turned out that under appropriate circumstances electric transport systems like plasmas or semiconductors can be described in a reaction–diffusion approach. For these systems various experiments on pattern formation have been carried out.


## Numerical treatments

A reaction–diffusion system can be solved by using methods of numerical mathematics. There exist several numerical treatments in research literature. Numerical solution methods for complex geometries are also proposed. Reaction-diffusion systems are described to the highest degree of detail with particle based simulation tools like SRSim or ReaDDy which employ among others reversible interacting-particle reaction dynamics.


## See also


- Autowave – Self-supporting non-linear waves in active media
- Diffusion-controlled reaction – Reaction rate equals rate of transport
- Chemical kinetics – Study of the rates of chemical reactions
- Phase space method
- Autocatalytic reactions and order creation – Chemical reaction whose product is also its catalystPages displaying short descriptions of redirect targets
- Pattern formation – Study of how patterns form by self-organization in nature
- Patterns in nature – Visible regularity of form found in the natural world
- Periodic travelling wave
- Self-similar solutions – Concept in partial differential equations
- Diffusion equation – Equation that describes density changes of a material that is diffusing in a medium
- Stochastic geometry – Study of random spatial patterns
- MClone
- The Chemical Basis of Morphogenesis – 1952 scholarly article by Alan Turing
- Turing pattern – Concept from evolutionary biology
- Multi-state modeling of biomolecules


## Examples


- Fisher's equation
- Zeldovich–Frank-Kamenetskii equation
- FitzHugh–Nagumo model
- Wrinkle paint


## External links


- Reaction–Diffusion by the Gray–Scott Model: Pearson's parameterization a visual map of the parameter space of Gray–Scott reaction diffusion.
- A thesis on reaction–diffusion patterns with an overview of the field
- RD Tool: an interactive web application for reaction-diffusion simulation
