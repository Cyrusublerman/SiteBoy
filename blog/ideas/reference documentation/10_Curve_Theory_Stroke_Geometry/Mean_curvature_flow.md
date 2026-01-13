# Mean curvature flow

In the field of differential geometry in mathematics, mean curvature flow is an example of a geometric flow of hypersurfaces in a Riemannian manifold (for example, smooth surfaces in 3-dimensional Euclidean space). Intuitively, a family of surfaces evolves under mean curvature flow if the normal component of the velocity of which a point on the surface moves is given by the mean curvature of the surface. For example, a round sphere evolves under mean curvature flow by shrinking inward uniformly (since the mean curvature vector of a sphere points inward). Except in special cases, the mean curvature flow develops singularities.

Under the constraint that volume enclosed is constant, this is called surface tension flow.

It is a parabolic partial differential equation, and can be interpreted as "smoothing".


## Existence and uniqueness

The following was shown by Michael Gage and Richard S. Hamilton as an application of Hamilton's general existence theorem for parabolic geometric flows.

Let $M$ be a compact smooth manifold, let $(M',g)$ be a complete smooth Riemannian manifold, and let $f:M\to M'$ be a smooth immersion. Then there is a positive number $T$, which could be infinite, and a map $F:[0,T)\times M\to M'$ with the following properties:


- $F(0,\cdot )=f$
- $F(t,\cdot ):M\to M'$ is a smooth immersion for any $t\in [0,T)$
- as $t\searrow 0,$ one has $F(t,\cdot )\to f$ in $C^{\infty }$
- for any $(t_{0},p)\in (0,T)\times M$, the derivative of the curve $t\mapsto F(t,p)$ at $t_{0}$ is equal to the mean curvature vector of $F(t_{0},\cdot )$ at $p$.
- if
$${\widetilde {F}}:[0,{\widetilde {T}})\times M\to M'
$$is any other map with the four properties above, then ${\widetilde {T}}\leq T$ and ${\widetilde {F}}(t,p)=F(t,p)$ for any $(t,p)\in [0,{\widetilde {T}})\times M.$

Necessarily, the restriction of $F$ to $(0,T)\times M$ is $C^{\infty }$.

One refers to $F$ as the (maximally extended) mean curvature flow with initial data $f$.


## Convex solutions

Following Hamilton's epochal 1982 work on the Ricci flow, in 1984 Gerhard Huisken employed the same methods for the mean curvature flow to produce the following analogous result:


- If $(M',g)$ is the Euclidean space $\mathbb {R} ^{n+1}$, where $n\geq 2$ denotes the dimension of $M$, then $T$ is necessarily finite. If the second fundamental form of the 'initial immersion' $f$ is strictly positive, then the second fundamental form of the immersion $F(t,\cdot )$ is also strictly positive for every $t\in (0,T)$, and furthermore if one choose the function $c:(0,T)\to (0,\infty )$ such that the volume of the Riemannian manifold $(M,(c(t)F(t,\cdot ))^{\ast }g_{\text{Euc}})$ is independent of $t$, then as $t\nearrow T$ the immersions $c(t)F(t,\cdot ):M\to \mathbb {R} ^{n+1}$ smoothly converge to an immersion whose image in $\mathbb {R} ^{n+1}$ is a round sphere.

Note that if $n\geq 2$ and $f:M\to \mathbb {R} ^{n+1}$ is a smooth hypersurface immersion whose second fundamental form is positive, then the Gauss map $\nu :M\to S^{n}$ is a diffeomorphism, and so one knows from the start that $M$ is diffeomorphic to $S^{n}$ and, from elementary differential topology, that all immersions considered above are embeddings.

Gage and Hamilton extended Huisken's result to the case $n=1$. Matthew Grayson (1987) showed that if $f:S^{1}\to \mathbb {R} ^{2}$ is any smooth embedding, then the mean curvature flow with initial data $f$ eventually consists exclusively of embeddings with strictly positive curvature, at which point Gage and Hamilton's result applies. In summary:


- If $f:S^{1}\to \mathbb {R} ^{2}$ is a smooth embedding, then consider the mean curvature flow $F:[0,T)\times S^{1}\to \mathbb {R} ^{2}$ with initial data $f$. Then $F(t,\cdot ):S^{1}\to \mathbb {R} ^{2}$ is a smooth embedding for every $t\in (0,T)$ and there exists $t_{0}\in (0,T)$ such that $F(t,\cdot ):S^{1}\to \mathbb {R} ^{2}$ has positive (extrinsic) curvature for every $t\in (t_{0},T)$. If one selects the function $c$ as in Huisken's result, then as $t\nearrow T$ the embeddings $c(t)F(t,\cdot ):S^{1}\to \mathbb {R} ^{2}$ converge smoothly to an embedding whose image is a round circle.


## Properties

The mean curvature flow extremalizes surface area, and minimal surfaces are the critical points for the mean curvature flow; minima solve the isoperimetric problem.

For manifolds embedded in a Kähler–Einstein manifold, if the surface is a Lagrangian submanifold, the mean curvature flow is of Lagrangian type, so the surface evolves within the class of Lagrangian submanifolds.

Huisken's monotonicity formula gives a monotonicity property of the convolution of a time-reversed heat kernel with a surface undergoing the mean curvature flow.

Related flows are:


- Curve-shortening flow, the one-dimensional case of mean curvature flow
- the surface tension flow
- the Lagrangian mean curvature flow
- the inverse mean curvature flow


## Mean curvature flow of a 2D surface

For a 2D surface embedded in $\mathbb {R} ^{3}$ as $z=S(x,y)$ , the differential equation for mean-curvature flow is given by


$${\frac {\partial S}{\partial t}}=2D\ H(x,y){\sqrt {1+\left({\frac {\partial S}{\partial x}}\right)^{2}+\left({\frac {\partial S}{\partial y}}\right)^{2}}}
$$

with $D$ being a constant relating the curvature and the speed of the surface normal, and the mean curvature being


$${\begin{aligned}H(x,y)&={\frac {1}{2}}{\frac {\left(1+\left({\frac {\partial S}{\partial x}}\right)^{2}\right){\frac {\partial ^{2}S}{\partial y^{2}}}-2{\frac {\partial S}{\partial x}}{\frac {\partial S}{\partial y}}{\frac {\partial ^{2}S}{\partial x\partial y}}+\left(1+\left({\frac {\partial S}{\partial y}}\right)^{2}\right){\frac {\partial ^{2}S}{\partial x^{2}}}}{\left(1+\left({\frac {\partial S}{\partial x}}\right)^{2}+\left({\frac {\partial S}{\partial y}}\right)^{2}\right)^{3/2}}}.\end{aligned}}
$$

In the limits
$$\left|{\frac {\partial S}{\partial x}}\right|\ll 1
$$and
$$\left|{\frac {\partial S}{\partial y}}\right|\ll 1
$$, so that the surface is nearly planar with its normal nearly parallel to the z axis, this reduces to a diffusion equation


$${\frac {\partial S}{\partial t}}=D\ \nabla ^{2}S
$$

While the conventional diffusion equation is a linear parabolic partial differential equation and does not develop singularities (when run forward in time), mean curvature flow may develop singularities because it is a nonlinear parabolic equation. In general additional constraints need to be put on a surface to prevent singularities under mean curvature flows.

Every smooth convex surface collapses to a point under the mean-curvature flow, without other singularities, and converges to the shape of a sphere as it does so. For surfaces of dimension two or more this is a theorem of Gerhard Huisken; for the one-dimensional curve-shortening flow it is the Gage–Hamilton–Grayson theorem. However, there exist embedded surfaces of two or more dimensions other than the sphere that stay self-similar as they contract to a point under the mean-curvature flow, including the Angenent torus.


## Example: mean curvature flow of m-dimensional spheres

A simple example of mean curvature flow is given by a family of concentric round hyperspheres in $\mathbb {R} ^{m+1}$. The mean curvature of an $m$-dimensional sphere of radius $R$ is $H=m/R$.

Due to the rotational symmetry of the sphere (or in general, due to the invariance of mean curvature under isometries) the mean curvature flow equation $\partial _{t}F=-H\nu$ reduces to the ordinary differential equation, for an initial sphere of radius $R_{0}$,


$${\begin{aligned}{\frac {\text{d}}{{\text{d}}t}}R(t)&=-{\frac {m}{R(t)}},\\R(0)&=R_{0}.\end{aligned}}
$$

The solution of this ODE (obtained, e.g., by separation of variables) is

$R(t)={\sqrt {R_{0}^{2}-2mt}}$,

which exists for $t\in (-\infty ,R_{0}^{2}/2m)$.


## See also


- Curve-shortening flow
