# Persistent homology

In topological data analysis, persistent homology is a method for computing topological features of a space at different spatial resolutions. More persistent features are detected over a wide range of spatial scales and are deemed more likely to represent true features of the underlying space rather than artifacts of sampling, noise, or particular choice of parameters.

To find the persistent homology of a space, the space must first be represented as a simplicial complex. A distance function on the underlying space corresponds to a filtration of the simplicial complex, that is a nested sequence of increasing subsets. One common method of doing this is via taking the sublevel filtration of the distance to a point cloud, or equivalently, the offset filtration on the point cloud and taking its nerve in order to get the simplicial filtration known as Čech filtration. A similar construction uses a nested sequence of Vietoris–Rips complexes known as the Vietoris–Rips filtration.


## Definition

Formally, consider a real-valued function on a simplicial complex $f:K\rightarrow \mathbb {R}$ that is non-decreasing on increasing sequences of faces, so $f(\sigma )\leq f(\tau )$ whenever $\sigma$ is a face of $\tau$ in $K$. Then for every $a\in \mathbb {R}$ the sublevel set $K_{a}=f^{-1}((-\infty ,a])$ is a subcomplex of K, and the ordering of the values of $f$ on the simplices in $K$ (which is in practice always finite) induces an ordering on the sublevel complexes that defines a filtration


$$\emptyset =K_{0}\subseteq K_{1}\subseteq \cdots \subseteq K_{n}=K
$$

When $0\leq i\leq j\leq n$, the inclusion $K_{i}\hookrightarrow K_{j}$ induces a homomorphism $f_{p}^{i,j}:H_{p}(K_{i})\rightarrow H_{p}(K_{j})$ on the simplicial homology groups for each dimension $p$. The $p^{\text{th}}$ persistent homology groups are the images of these homomorphisms, and the $p^{\text{th}}$ persistent Betti numbers $\beta _{p}^{i,j}$ are the ranks of those groups. Persistent Betti numbers for $p=0$ coincide with the size function, a predecessor of persistent homology.

Any filtered complex over a field $F$ can be brought by a linear transformation preserving the filtration to so called canonical form, a canonically defined direct sum of filtered complexes of two types: one-dimensional complexes with trivial differential $d(e_{t_{i}})=0$ and two-dimensional complexes with trivial homology $d(e_{s_{j}+r_{j}})=e_{r_{j}}$.

A persistence module over a partially ordered set $P$ is a set of vector spaces $U_{t}$ indexed by $P$, with a linear map $u_{t}^{s}:U_{s}\to U_{t}$ whenever $s\leq t$, with $u_{t}^{t}$ equal to the identity and $u_{t}^{s}\circ u_{s}^{r}=u_{t}^{r}$ for $r\leq s\leq t$. Equivalently, we may consider it as a functor from $P$ considered as a category to the category of vector spaces (or R {\displaystyle R} -modules). There is a classification of persistence modules over a field $F$ indexed by $\mathbb {N}$:
$$U\simeq \bigoplus _{i}x^{t_{i}}\cdot F[x]\oplus \left(\bigoplus _{j}x^{r_{j}}\cdot (F[x]/(x^{s_{j}}\cdot F[x]))\right).
$$Multiplication by $x$ corresponds to moving forward one step in the persistence module. Intuitively, the free parts on the right side correspond to the homology generators that appear at filtration level $t_{i}$ and never disappear, while the torsion parts correspond to those that appear at filtration level $r_{j}$ and last for $s_{j}$ steps of the filtration (or equivalently, disappear at filtration level $s_{j}+r_{j}$).

Each of these two theorems allows us to uniquely represent the persistent homology of a filtered simplicial complex with a persistence barcode or persistence diagram. A barcode represents each persistent generator with a horizontal line beginning at the first filtration level where it appears, and ending at the filtration level where it disappears, while a persistence diagram plots a point for each generator with its x-coordinate the birth time and its y-coordinate the death time. Equivalently the same data is represented by Barannikov's canonical form, where each generator is represented by a segment connecting the birth and the death values plotted on separate lines for each $p$.


## Stability

Persistent homology is stable in a precise sense, which provides robustness against noise. The bottleneck distance is a natural metric on the space of persistence diagrams given by
$$W_{\infty }(X,Y):=\inf _{\varphi :X\to Y}\sup _{x\in X}\Vert x-\varphi (x)\Vert _{\infty },
$$where $\varphi$ ranges over bijections. A small perturbation in the input filtration leads to a small perturbation of its persistence diagram in the bottleneck distance. For concreteness, consider a filtration on a space $X$ homeomorphic to a simplicial complex determined by the sublevel sets of a continuous tame function $f:X\to \mathbb {R}$. The map $D$ taking $f$ to the persistence diagram of its $k$th homology is 1-Lipschitz with respect to the $\sup$-metric on functions and the bottleneck distance on persistence diagrams. That is,
$$W_{\infty }(D(f),D(g))\leq \lVert f-g\rVert _{\infty }
$$.


## Computation

The principal algorithm is based on the bringing of the filtered complex to its canonical form by upper-triangular matrices and runs in worst-case cubical complexity in the number of simplices. The fastest known algorithm for computing persistent homology runs in matrix multiplication time.

Since the number of simplices is highly relevant for computation time, finding filtered simplicial complexes with few simplexes is an active research area. Several approaches have been proposed to reduce the number of simplices in a filtered simplicial complex in order to approximate persistent homology.


## Software

There are various software packages for computing persistence intervals of a finite filtration.


## See also


- Computational topology
