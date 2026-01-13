# Cahn–Hilliard equation

The Cahn–Hilliard equation (after John W. Cahn and John E. Hilliard) is an equation of mathematical physics which describes the process of phase separation, spinodal decomposition, by which the two components of a binary fluid spontaneously separate and form domains pure in each component. If $c$ is the concentration of the fluid, with $c=\pm 1$ indicating domains, then the equation is written as


$${\frac {\partial c}{\partial t}}=D\nabla ^{2}\left(c^{3}-c-\gamma \nabla ^{2}c\right),
$$

where $D$ is a diffusion coefficient with units of ${\text{Length}}^{2}/{\text{Time}}$ and ${\sqrt {\gamma }}$ gives the length of the transition regions between the domains. Here $\partial /{\partial t}$ is the partial time derivative and $\nabla ^{2}$ is the Laplacian in $n$ dimensions. Additionally, the quantity $\mu =c^{3}-c-\gamma \nabla ^{2}c$ is identified as a chemical potential.

It is related to the Allen–Cahn equation, as well as the stochastic Allen–Cahn and the stochastic Cahn–Hilliard equations.


## Features and applications

Of interest to mathematicians is the existence of a unique solution of the Cahn–Hilliard equation, given by smooth initial data. The proof relies essentially on the existence of a Lyapunov functional. Specifically, if we identify


$$F[c]=\int d^{n}x\left[{\frac {1}{4}}\left(c^{2}-1\right)^{2}+{\frac {\gamma }{2}}\left|\nabla c\right|^{2}\right],
$$

as a free energy functional, then


$${\frac {dF}{dt}}=-\int d^{n}x\left|\nabla \mu \right|^{2},
$$

so that the free energy does not grow in time. This also indicates segregation into domains is the asymptotic outcome of the evolution of this equation.

In real experiments, the segregation of an initially mixed binary fluid into domains is observed. The segregation is characterized by the following facts.


- There is a transition layer between the segregated domains, with a profile given by the function
$$c(x)=\tanh \left({\frac {x}{\sqrt {2\gamma }}}\right),
$$and hence a typical width ${\sqrt {\gamma }}$ because this function is an equilibrium solution of the Cahn–Hilliard equation.
- Of interest also is the fact that the segregated domains grow in time as a power law. That is, if $L(t)$ is a typical domain size, then $L(t)\propto t^{1/3}$. This is the Lifshitz–Slyozov law, and has been proved rigorously for the Cahn–Hilliard equation and observed in numerical simulations and real experiments on binary fluids.
- The Cahn–Hilliard equation has the form of a conservation law,
$${\frac {\partial c}{\partial t}}=-\nabla \cdot \mathbf {j} (x),
$$with $\mathbf {j} (x)=-D\nabla \mu$. Thus the phase separation process conserves the total concentration $C=\int d^{n}xc\left(x,t\right)$, so that
$${\frac {dC}{dt}}=0
$$.
- Evolution of random initial data with γ = 0.5 {\displaystyle \gamma =0.5} and C = − 0.2 {\displaystyle C=-0.2} (60/40 mix of the blue and red phases, respectively), demonstrating Ostwald ripeningWhen one phase is significantly more abundant, the Cahn–Hilliard equation can show the phenomenon known as Ostwald ripening, where the minority phase forms spherical droplets, and the smaller droplets are absorbed through diffusion into the larger ones.

The Cahn–Hilliard equation finds applications in diverse fields: in complex fluids and soft matter (interfacial fluid flow, polymer science and in industrial applications). The solution of the Cahn–Hilliard equation for a binary mixture demonstrated to coincide well with the solution of a Stefan problem and the model of Thomas and Windle. Of interest to researchers at present is the coupling of the phase separation of the Cahn–Hilliard equation to the Navier–Stokes equations of fluid flow.


## See also


- Allen–Cahn equation
- Kuramoto–Sivashinsky equation


## Further reading


- .mw-parser-output cite.citation{font-style:inherit;word-wrap:break-word}.mw-parser-output .citation q{quotes:"\"""\"""'""'"}.mw-parser-output .citation:target{background-color:rgba(0,127,255,0.133)}.mw-parser-output .id-lock-free.id-lock-free a{background:url("//upload.wikimedia.org/wikipedia/commons/6/65/Lock-green.svg")right 0.1em center/9px no-repeat}.mw-parser-output .id-lock-limited.id-lock-limited a,.mw-parser-output .id-lock-registration.id-lock-registration a{background:url("//upload.wikimedia.org/wikipedia/commons/d/d6/Lock-gray-alt-2.svg")right 0.1em center/9px no-repeat}.mw-parser-output .id-lock-subscription.id-lock-subscription a{background:url("//upload.wikimedia.org/wikipedia/commons/a/aa/Lock-red-alt-2.svg")right 0.1em center/9px no-repeat}.mw-parser-output .cs1-ws-icon a{background:url("//upload.wikimedia.org/wikipedia/commons/4/4c/Wikisource-logo.svg")right 0.1em center/12px no-repeat}body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .id-lock-free a,body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .id-lock-limited a,body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .id-lock-registration a,body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .id-lock-subscription a,body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .cs1-ws-icon a{background-size:contain;padding:0 1em 0 0}.mw-parser-output .cs1-code{color:inherit;background:inherit;border:none;padding:inherit}.mw-parser-output .cs1-hidden-error{display:none;color:var(--color-error,#d33)}.mw-parser-output .cs1-visible-error{color:var(--color-error,#d33)}.mw-parser-output .cs1-maint{display:none;color:#085;margin-left:0.3em}.mw-parser-output .cs1-kern-left{padding-left:0.2em}.mw-parser-output .cs1-kern-right{padding-right:0.2em}.mw-parser-output .citation .mw-selflink{font-weight:inherit}@media screen{.mw-parser-output .cs1-format{font-size:95%}html.skin-theme-clientpref-night .mw-parser-output .cs1-maint{color:#18911f}}@media screen and (prefers-color-scheme:dark){html.skin-theme-clientpref-os .mw-parser-output .cs1-maint{color:#18911f}}De Jesus, Melissa; Gal, Ciprian G.; Shomberg, Joseph. "A general paradigm of binary phase-segregation processes through the lens of four critical mechanisms". Discrete and Dynamical Systems - Series A. AIMS. doi:10.3934/dcds.2024177. Retrieved 2025-01-18.


- Cahn, John W.; Hilliard, John E. (1958). "Free Energy of a Nonuniform System. I. Interfacial Free Energy". The Journal of Chemical Physics. 28 (2). AIP Publishing: 258–267. Bibcode:1958JChPh..28..258C. doi:10.1063/1.1744102. ISSN 0021-9606.
- Bray, A.J. (1994). "Theory of phase-ordering kinetics". Advances in Physics. 43 (3): 357–459. arXiv:cond-mat/9501089. Bibcode:1994AdPhy..43..357B. doi:10.1080/00018739400101505. ISSN 0001-8732. S2CID 83182.
- Zhu, Jingzhi; Chen, Long-Qing; Shen, Jie; Tikare, Veena (1999-10-01). "Coarsening kinetics from a variable-mobility Cahn-Hilliard equation: Application of a semi-implicit Fourier spectral method". Physical Review E. 60 (4). American Physical Society (APS): 3564–3572. Bibcode:1999PhRvE..60.3564Z. doi:10.1103/physreve.60.3564. ISSN 1063-651X. PMID 11970189.
- Elliott, Charles M.; Songmu, Zheng (1986). "On the Cahn-Hilliard equation". Archive for Rational Mechanics and Analysis. 96 (4). Springer Nature: 339–357. Bibcode:1986ArRMA..96..339E. doi:10.1007/bf00251803. ISSN 0003-9527. S2CID 56206640.
- Areias, P.; Samaniego, E.; Rabczuk, T. (2015-12-17). "A staggered approach for the coupling of Cahn–Hilliard type diffusion and finite strain elasticity". Computational Mechanics. 57 (2). Springer Science and Business Media LLC: 339–351. doi:10.1007/s00466-015-1235-1. ISSN 0178-7675. S2CID 123982946.
- Hashimoto, Takeji; Matsuzaka, Katsuo; Moses, Elisha; Onuki, Akira (1995-01-02). "String Phase in Phase-Separating Fluids under Shear Flow". Physical Review Letters. 74 (1). American Physical Society (APS): 126–129. Bibcode:1995PhRvL..74..126H. doi:10.1103/physrevlett.74.126. ISSN 0031-9007. PMID 10057715.
- T. Ursell, “Cahn–Hilliard Kinetics and Spinodal Decomposition in a Diffuse System,” California Institute of Technology (2007).
