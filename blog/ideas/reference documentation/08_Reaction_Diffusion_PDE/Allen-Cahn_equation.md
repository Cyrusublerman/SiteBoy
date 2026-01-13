# Allen–Cahn equation

The Allen–Cahn equation (after John W. Cahn and Sam Allen) is a reaction–diffusion equation of mathematical physics which describes the process of phase separation in multi-component alloy systems, including order-disorder transitions.

The equation describes the time evolution of a scalar-valued state variable $\eta$ on a domain $\Omega$ during a time interval ${\mathcal {T}}$, and is given by:


$${\begin{aligned}{{\partial \eta } \over {\partial t}}={}&M_{\eta }[\operatorname {div} (\varepsilon _{\eta }^{2}\,\nabla \,\eta )-f'(\eta )]\quad {\text{on }}\Omega \times {\mathcal {T}},\quad \eta ={\bar {\eta }}\quad {\text{on }}\partial _{\eta }\Omega \times {\mathcal {T}},\\[5pt]&{-(\varepsilon _{\eta }^{2}\,\nabla \,\eta )}\cdot m=q\quad {\text{on }}\partial _{q}\Omega \times {\mathcal {T}},\quad \eta =\eta _{o}\quad {\text{on }}\Omega \times \{0\},\end{aligned}}
$$

where $M_{\eta }$ is the mobility, $f$ is a double-well potential, ${\bar {\eta }}$ is the control on the state variable at the portion of the boundary $\partial _{\eta }\Omega$, $q$ is the source control at $\partial _{q}\Omega$, $\eta _{o}$ is the initial condition, and $m$ is the outward normal to $\partial \Omega$.

It is the L2 gradient flow of the Ginzburg–Landau free energy functional. It is closely related to the Cahn–Hilliard equation.


## Mathematical description


- $\Omega \subset \mathbb {R} ^{n}$ be an open set,
- $v_{0}(x)\in L^{2}(\Omega )$ an arbitrary initial function,
- $\varepsilon >0$ and $T>0$ two constants.

A function $v(x,t):\Omega \times [0,T]\to \mathbb {R}$ is a solution to the Allen–Cahn equation if it solves


$$\partial _{t}v-\Delta _{x}v=-{\frac {1}{\varepsilon ^{2}}}f(v),\quad \Omega \times [0,T]
$$


- $\Delta _{x}$ is the Laplacian with respect to the space $x$,
- $f(v)=F'(v)$ is the derivative of a non-negative $F\in C^{1}(\mathbb {R} )$ with two minima $F(\pm 1)=0$.

Usually, one has the following initial condition with the Neumann boundary condition


$${\begin{cases}v(x,0)=v_{0}(x),&\Omega \times \{0\}\\\partial _{n}v=0,&\partial \Omega \times [0,T]\\\end{cases}}
$$

where $\partial _{n}v$ is the outer normal derivative.

For $F(v)$ one popular candidate is


$$F(v)={\frac {(v^{2}-1)^{2}}{4}},\qquad f(v)=v^{3}-v.
$$


## Further reading


- http://www.ctcms.nist.gov/~wcraig/variational/node10.html
- Allen, S. M.; Cahn, J. W. (1975). "Coherent and Incoherent Equilibria in Iron-Rich Iron-Aluminum Alloys". Acta Metall. 23 (9): 1017. doi:10.1016/0001-6160(75)90106-6.
- Allen, S. M.; Cahn, J. W. (1976). "On Tricritical Points Resulting from the Intersection of Lines of Higher-Order Transitions with Spinodals". Scripta Metallurgica. 10 (5): 451–454. doi:10.1016/0036-9748(76)90171-x.
- Allen, S. M.; Cahn, J. W. (1976). "Mechanisms of Phase Transformation Within the Miscibility Gap of Fe-Rich Fe-Al Alloys". Acta Metall. 24 (5): 425–437. doi:10.1016/0001-6160(76)90063-8.
- Cahn, J. W.; Allen, S. M. (1977). "A Microscopic Theory of Domain Wall Motion and Its Experimental Verification in Fe-Al Alloy Domain Growth Kinetics". Journal de Physique. 38: C7–51.
- Allen, S. M.; Cahn, J. W. (1979). "A Microscopic Theory for Antiphase Boundary Motion and Its Application to Antiphase Domain Coarsening". Acta Metall. 27 (6): 1085–1095. doi:10.1016/0001-6160(79)90196-2.
- Bronsard, L.; Reitich, F. (1993). "On three-phase boundary motion and the singular limit of a vector valued Ginzburg–Landau equation". Arch. Rat. Mech. Anal. 124 (4): 355–379. Bibcode:1993ArRMA.124..355B. doi:10.1007/bf00375607. S2CID 123291032.


## External links


- Simulation by Nils Berglund of a solution of the Allen–Cahn equation
