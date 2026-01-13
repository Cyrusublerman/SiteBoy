# Eikonal equation

An eikonal equation (from Greek εἰκών, image) is a non-linear first-order partial differential equation that is encountered in problems of wave propagation.

The classical eikonal equation in geometric optics is a differential equation of the form

where $x$ lies in an open subset of $\mathbb {R} ^{n}$, $n(x)$ is a positive function, $\nabla$ denotes the gradient, and $|\cdot |$ is the Euclidean norm. The function $n$ is given and one seeks solutions $u$. In the context of geometric optics, the function $n$ is the refractive index of the medium.

More generally, an eikonal equation is an equation of the form

where $H$ is a function of $2n$ variables. Here the function $H$ is given, and $u$ is the solution. If $H(x,y)=|y|-n(x)$, then equation (2) becomes (1).

Eikonal equations naturally arise in the WKB method and the study of Maxwell's equations. Eikonal equations provide a link between physical (wave) optics and geometric (ray) optics.

One fast computational algorithm to approximate the solution to the eikonal equation is the fast marching method.


## History

The term "eikonal" was first used in the context of geometric optics by Heinrich Bruns. However, the actual equation appears earlier in the seminal work of William Rowan Hamilton on geometric optics.


## Physical interpretation


### Continuous shortest-path problems

Suppose that $\Omega$ is an open set with suitably smooth boundary $\partial \Omega$. The solution to the eikonal equation


$$\left|\nabla u(x)\right|={\frac {1}{f(x)}}{\text{ for }}x\in \Omega \subset \mathbb {R} ^{n},
$$

$u(x)=q(x){\text{ for }}x\in \partial \Omega$

can be interpreted as the minimal amount of time required to travel from $x$ to $\partial \Omega$, where $f:{\bar {\Omega }}\to (0,+\infty )$ is the speed of travel, and $q:\partial \Omega \to [0,+\infty )$ is an exit-time penalty. (Alternatively this can be posed as a minimal cost-to-exit by making the right-side $C(x)/f(x)$ and $q$ an exit-cost penalty.)

In the special case when $f=1$, the solution gives the signed distance from $\partial \Omega$.

By assuming that $\nabla u(x)$ exists at all points, it is easy to prove that $u(x)$ corresponds to a time-optimal control problem using Bellman's optimality principle and a Taylor expansion. Unfortunately, it is not guaranteed that $\nabla u(x)$ exists at all points, and more advanced techniques are necessary to prove this. This led to the development of viscosity solutions in the 1980s by Pierre-Louis Lions and Michael G. Crandall, and Lions won a Fields Medal for his contributions.


### Electromagnetic potential

The physical meaning of the eikonal equation is related to the formula

$\mathbf {E} =-\nabla V,$

where $\mathbf {E}$ is the electric field strength, and $V$ is the electric potential. There is a similar equation for velocity potential in fluid flow and temperature in heat transfer. The physical meaning of this equation in the electromagnetic example is that any charge in the region is pushed to move at right angles to the lines of constant potential, and along lines of force determined by the field of the E vector and the sign of the charge.

Ray optics and electromagnetism are related by the fact that the eikonal equation gives a second electromagnetic formula of the same form as the potential equation above where the line of constant potential has been replaced by a line of constant phase, and the force lines have been replaced by normal vectors coming out of the constant phase line at right angles. The magnitude of these normal vectors is given by the square root of the relative permittivity. The line of constant phase can be considered the edge of one of the advancing light waves (wavefront). The normal vectors are the rays the light is traveling down in ray optics.


## Computational algorithms

Several fast and efficient algorithms to solve the eikonal equation have been developed since the 1990s. Many of these algorithms take advantage of algorithms developed much earlier for shortest path problems on graphs with nonnegative edge lengths. These algorithms take advantage of the causality provided by the physical interpretation and typically discretize the domain using a mesh or regular grid and calculate the solution at each discretized point. Eikonal solvers on triangulated surfaces were introduced by Kimmel and Sethian in 1998.

Sethian's fast marching method (FMM) was the first "fast and efficient" algorithm created to solve the Eikonal equation. The original description discretizes the domain $\Omega \subset \mathbb {R} ^{n}$ into a regular grid and "marches" the solution from "known" values to the undiscovered regions, precisely mirroring the logic of Dijkstra's algorithm. If $\Omega$ is discretized and has $M$ meshpoints, then the computational complexity is $O(M\log M)$ where the $\log$ term comes from the use of a heap (typically binary). A number of modifications can be prescribed to FMM since it is classified as a label-setting method. In addition, FMM has been generalized to operate on general meshes that discretize the domain.

Label-correcting methods such as the Bellman–Ford algorithm can also be used to solve the discretized Eikonal equation also with numerous modifications allowed (e.g. "Small Labels First" or "Large Labels Last" ). Two-queue methods have also been developed that are essentially a version of the Bellman-Ford algorithm except two queues are used with a threshold used to determine which queue a gridpoint should be assigned to based on local information.

Sweeping algorithms such as the fast sweeping method (FSM) are highly efficient for solving Eikonal equations when the corresponding characteristic curves do not change direction very often. These algorithms are label-correcting but do not make use of a queue or heap, and instead prescribe different orderings for the gridpoints to be updated and iterate through these orderings until convergence. Some improvements were introduced such as "locking" gridpoints during a sweep if does not receive an update, but on highly refined grids and higher-dimensional spaces there is still a large overhead due to having to pass through every gridpoint. Parallel methods have been introduced that attempt to decompose the domain and perform sweeping on each decomposed subset. Zhao's parallel implementation decomposes the domain into $n$-dimensional subsets and then runs an individual FSM on each subset. Detrixhe's parallel implementation also decomposes the domain, but parallelizes each individual sweep so that processors are responsible for updating gridpoints in an $(n-1)$-dimensional hyperplane until the entire domain is fully swept.

Hybrid methods have also been introduced that take advantage of FMM's efficiency with FSM's simplicity. For example, the Heap Cell Method (HCM) decomposes the domain into cells and performs FMM on the cell-domain, and each time a "cell" is updated FSM is performed on the local gridpoint-domain that lies within that cell. A parallelized version of HCM has also been developed.


## Numerical approximation

For simplicity assume that $\Omega$ is discretized into a uniform grid with spacings $h_{x}$ and $h_{y}$ in the x and y directions, respectively.


### 2D approximation on a Cartesian grid

Assume that a gridpoint $x_{ij}$ has value $U_{ij}=U(x_{ij})\approx u(x_{ij})$. A first-order scheme to approximate the partial derivatives is


$$\max \left(D_{ij}^{-x}U,-D_{ij}^{+x}U,0\right)^{2}+\max \left(D_{ij}^{-y}U,-D_{ij}^{+y}U,0\right)^{2}\ =\ {\frac {1}{f_{ij}^{2}}}
$$


$$u_{x}(x_{ij})\approx D_{ij}^{\pm x}U={\frac {U_{i\pm 1,j}-U_{ij}}{\pm h_{x}}}\quad {\text{ and }}\quad u_{y}(x_{ij})\approx D_{ij}^{\pm y}U={\frac {U_{i,j\pm 1}-U_{ij}}{\pm h_{y}}}.
$$

Due to the consistent, monotone, and causal properties of this discretization it is easy to show that if $U_{X}=\min(U_{i-1,j},U_{i+1,j})$ and $U_{Y}=\min(U_{i,j-1},U_{i,j+1})$ and $|U_{X}/h_{x}-U_{Y}/h_{y}|\leq 1/f_{ij}$ then


$$\left({\frac {U_{ij}-U_{X}}{h_{x}}}\right)^{2}+\left({\frac {U_{ij}-U_{Y}}{h_{y}}}\right)^{2}={\frac {1}{f_{ij}^{2}}}
$$

which can be solved as a quadratic. In the limiting case of $h_{x}=h_{y}=h$, this reduces to


$$U_{ij}={\frac {U_{X}+U_{Y}}{2}}+{\frac {1}{2}}{\sqrt {(U_{X}+U_{Y})^{2}-2\left(U_{X}^{2}+U_{Y}^{2}-{\frac {h^{2}}{f_{ij}^{2}}}\right)}}.
$$

This solution will always exist as long as $|U_{X}-U_{Y}|\leq {\sqrt {2}}h/f_{ij}$ is satisfied and is larger than both, $U_{X}$ and $U_{Y}$, as long as $|U_{X}-U_{Y}|\leq h/f_{ij}$ .

If $|U_{X}/h_{x}-U_{Y}/h_{y}|\geq 1/f_{ij}$, a lower-dimensional update must be performed by assuming one of the partial derivatives is $0$:


$$U_{ij}=\min \left(U_{X}+{\frac {h_{x}}{f_{ij}}},U_{Y}+{\frac {h_{y}}{f_{ij}}}\right).
$$


### n-D approximation on a Cartesian grid

Assume that a grid point $x$ has value $U=U(x)\approx u(x)$. Repeating the same steps as in the $n=2$ case we can use a first-order scheme to approximate the partial derivatives. Let $U_{i}$ be the minimum of the values of the neighbors in the $\pm \mathbf {e} _{i}$ directions, where $\mathbf {e} _{i}$ is a standard unit basis vector. The approximation is then


$$\sum _{j=1}^{n}\left({\frac {U-U_{j}}{h}}\right)^{2}\ =\ {\frac {1}{f_{i}^{2}}}.
$$

Solving this quadratic equation for $U$ yields:


$$U={\frac {1}{n}}\sum _{j=1}^{n}U_{j}+{\frac {1}{n}}{\sqrt {\left(\sum _{j=1}^{n}U_{j}\right)^{2}-n\left(\sum _{j=1}^{n}U_{j}^{2}-{\frac {h^{2}}{f_{i}^{2}}}\right)}}.
$$

If the discriminant in the square root is negative, then a lower-dimensional update must be performed (i.e. one of the partial derivatives is $0$).

If $n=2$ then perform the one-dimensional update


$$U={\frac {h}{f_{i}}}+\min _{j=1,\ldots ,n}U_{j}.
$$

If $n\geq 3$ then perform an $n-1$ dimensional update using the values $\{U_{1},\ldots ,U_{n}\}\setminus \{U_{i}\}$ for every $i=1,\ldots ,n$ and choose the smallest.


## Mathematical description

An eikonal equation is one of the form

$H(x,\nabla u(x))=0$

$u(0,x')=u_{0}(x'),{\text{ for }}x=(x_{1},x')$

The plane $x=(0,x')$ can be thought of as the initial condition, by thinking of $x_{1}$ as $t.$ We could also solve the equation on a subset of this plane, or on a curved surface, with obvious modifications.

The eikonal equation shows up in geometrical optics, which is a way of studying solutions of the wave equation $c^{2}|\nabla _{x}u|^{2}=|\partial _{t}u|^{2}$, where $c(x)$ and $u(x,t)$. In geometric optics, the eikonal equation describes the phase fronts of waves. Under reasonable hypothesis on the "initial" data, the eikonal equation admits a local solution, but a global smooth solution (e.g. a solution for all time in the geometrical optics case) is not possible. The reason is that caustics may develop. In the geometrical optics case, this means that wavefronts cross.

We can solve the eikonal equation using the method of characteristics. One must impose the "non-characteristic" hypothesis $\partial _{p_{1}}H(x,p)\neq 0$ along the initial hypersurface $x=(0,x')$, where H = H(x,p) and p = (p1,...,pn) is the variable that gets replaced by ∇u. Here x = (x1,...,xn) = (t,x′).

First, solve the problem $H(x,\xi (x))=0$, $\xi (x)=\nabla u(x),x\in H$. This is done by defining curves (and values of $\xi$ on those curves) as


$${\dot {x}}(s)=\nabla _{\xi }H(x(s),\xi (s)),\;\;\;\;{\dot {\xi }}(s)=-\nabla _{x}H(x(s),\xi (s)).
$$

$x(0)=x_{0},\;\;\;\;\xi (x(0))=\nabla u(x(0)).$ Note that even before we have a solution $u$, we know $\nabla u(x)$ for $x=(0,x')$ due to our equation for $H$.

That these equations have a solution for some interval $0\leq s<s_{1}$ follows from standard ODE theorems (using the non-characteristic hypothesis). These curves fill out an open set around the plane $x=(0,x')$. Thus the curves define the value of $\xi$ in an open set about our initial plane. Once defined as such it is easy to see using the chain rule that $\partial _{s}H(x(s),\xi (s))=0$, and therefore $H=0$ along these curves.

We want our solution $u$ to satisfy $\nabla u=\xi$, or more specifically, for every $s$, $(\nabla u)(x(s))=\xi (x(s)).$ Assuming for a minute that this is possible, for any solution $u(x)$ we must have


$${\frac {d}{ds}}u(x(s))=\nabla u(x(s))\cdot {\dot {x}}(s)=\xi \cdot {\frac {\partial H}{\partial \xi }},
$$

and therefore


$$u(x(t))=u(x(0))+\int _{0}^{t}\xi (x(s))\cdot {\dot {x}}(s)\,ds.
$$

In other words, the solution $u$ will be given in a neighborhood of the initial plane by an explicit equation. However, since the different paths $x(t)$, starting from different initial points may cross, the solution may become multi-valued, at which point we have developed caustics. We also have (even before showing that $u$ is a solution)


$$\xi (x(t))=\xi (x(0))-\int _{0}^{t}\nabla _{x}H(x(s),\xi (x(s)))\,ds.
$$

It remains to show that $\xi$, which we have defined in a neighborhood of our initial plane, is the gradient of some function $u$. This will follow if we show that the vector field $\xi$ is curl free. Consider the first term in the definition of $\xi$. This term, $\xi (x(0))=\nabla u(x(0))$ is curl free as it is the gradient of a function. As for the other term, we note


$${\frac {\partial ^{2}}{\partial x_{k}\,\partial x_{j}}}H={\frac {\partial ^{2}}{\partial x_{j}\,\partial x_{k}}}H.
$$

The result follows.


## Applications


- A concrete application is the computation of radiowave attenuation in the atmosphere.
- Finding the shape from shading in computer vision.
- Geometric optics
- Continuous shortest path problems
- Image segmentation
- Study of the shape for a solid propellant rocket grain


## See also


- Hamilton–Jacobi–Bellman equation
- Hamilton–Jacobi equation
- Fermat's principle


## Further reading


- Paris, D. T.; Hurd, F. K. (1969). Basic Electromagnetic Theory. McGraw-Hill. pp. 383–385. ISBN 0-07-048470-8.
- Arnold, V. I. (2004). Lectures on Partial Differential Equations (2nd ed.). Springer. pp. 2–3. ISBN 3-540-40448-1.


## External links


- The linearized eikonal equation
- English translation of "Das Eikonal" by Heinrich Bruns
