# Lattice

## From Dome to Lattice

Once the phyllotactic dome was established, the points could not remain as isolated coordinates on a curved surface. A structural logic was required to connect them into a coherent framework—yet this had to be done without any connections piercing through the dome’s hollow interior.

Geodesic domes provided no useful precedent, since their repeating Euclidean tilings are incompatible with the non-repeating distribution of phyllotaxis. The lamella dome, however, offered a closer analogue: overlapping arches that can be fabricated from straight members, and a geometry that already resonates with the spiralling pattern.

Unlike the regular parallel parabolas of a traditional lamella, here every point lies at a unique radius and azimuth. This meant each arch segment differs in length and orientation. To resolve this, a new algorithm was developed: connect points in ordered subsets so that entire families of arches can be formed without cutting through the dome’s interior.

---

## Point Field

The base coordinates are given by the phyllotactic field:

$$
\begin{aligned}
r_k &= C\sqrt{k}, \
\theta_k &= k,\alpha, \qquad \alpha = \tfrac{360^\circ}{\tau^2}, \
(x_k,y_k) &= (r_k\cos\theta_k,; r_k\sin\theta_k), \
z_k &\in \Bigl{, h_{\max}!\left(1-\tfrac{k}{N}\right),;; h_{\max}!\left(1-\tfrac{r_k}{R}\right) \Bigr}.
\end{aligned}
$$

where $k=1,\dots,N$.

---

## Arch Families

For an integer denominator $N\ge 2$, define residue classes

$$
\mathcal{F}(N,i)={,k \mid k\equiv i \pmod N ,},\qquad i=1,\dots,N.
$$

Each $\mathcal{F}(N,i)$ traces an **arch**:

$$
k ;\mapsto; k+N ;\mapsto; k+2N ;\mapsto;\dots
$$

Two denominators $N_1$ and $N_2$ generate **crossing families** of arches that together form the lamella lattice.

### Step Size and Smoothness

The azimuthal increment per step is

$$
\Delta\theta_N = (N,\alpha)\bmod 2\pi.
$$

Small $|\Delta\theta_N|$ produces smoother arches, because the points advance gradually in angle as their radius increases.

---

## Interactive Lattice Explorer

The following interactive tool allows you to explore how different denominators and parameters affect the lattice formation. Use the **Connect N₁** and **Connect N₂** controls to visualize the arch families described above. The **Lock to Golden Angle** ensures the divergence angle remains at the optimal 137.508° for phyllotactic spirals.

<div data-p5-component="phyllo-manual" data-script-path="projects/Synthetic Biophilia/assets/p5/phyllo-manual-siteboy.js" data-target-id="phyllo-manual" data-siteboy-gui="true"></div>

---

## Choosing Denominators

Let $\phi = \alpha/(2\pi) = 1-\tau^{-2}$. For each $N$ define a **wrap error**

$$
\delta(N) = \min_{m\in\mathbb{Z}} |N\phi - m|.
$$

* Select $N$ with small $\delta(N)$.
* Use coprime pairs $(N_1,N_2)$, preferably **adjacent Fibonacci numbers** (e.g. $(13,21)$, $(21,34)$, $(34,55)$).
* Avoid values where $\Delta\theta_N\approx\pi$ or $\gcd(N_1,N_2)>1$.

### Why Fibonacci Works

The divergence angle of phyllotaxis is

$$
\alpha = \tfrac{360^\circ}{\tau^2}, \qquad
\phi = \tfrac{\alpha}{2\pi} = 1 - \tau^{-2}.
$$

Because $\phi$ is irrational, multiples of $\alpha$ never repeat. Ratios of consecutive Fibonacci numbers approximate the golden ratio extremely well:

$$
\frac{F_{n}}{F_{n+1}} \approx \tfrac{1}{\tau}.
$$

This ensures that for Fibonacci denominators the quantity $N\phi$ is very close to an integer, and so the wrap error $\delta(N)$ is minimised. In practice this means $\Delta\theta_N$ is small, arches advance outward in radius while shifting only slightly in azimuth, and the curves remain smooth and nearly parallel to the dome surface. Arbitrary denominators lack this property and often cut through the interior. Multiples of Fibonacci numbers inherit the same behaviour, giving denser but equally well‑behaved families.

---

## Constraints

Each arch segment is a chord between $\mathbf{p}*k$ and $\mathbf{p}*{k+N}$.

* **Chord length:** $\ell_N(k) = |\mathbf{p}_{k+N}-\mathbf{p}_k|$.
* **Radial growth:** $\Delta r_N(k) = C(\sqrt{k+N}-\sqrt{k})>0$.
* **Azimuthal step:** $\Delta\theta_N$ (fixed for $N$).

Conditions for valid lattices:

1. **Surface adherence:** $|\Delta\theta_N|\le\theta_{\max}$ with $\theta_{\max}\in[10^\circ,25^\circ]$.
2. **Monotonicity:** $r_{k+N}>r_k$ and $z_{k+N}\le z_k$.
3. **Exclusive intersections:** segments from $N_1$ and $N_2$ may meet **only** at lattice nodes.

---

## Joints

At node $m$, the neighbour set is

$$
\mathcal{N}(m)={,m!\pm!N_1,; m!\pm!N_2,}\cap{1,\dots,N}.
$$

Each neighbour $q$ defines:

$$
\mathbf{v}*{m\to q}=\mathbf{p}*q-\mathbf{p}*m, \qquad
\hat{\mathbf{u}}*{m\to q}=\frac{\mathbf{v}*{m\to q}}{|\mathbf{v}*{m\to q}|}.
$$

For fabrication, convert vectors to spherical:

$$
\operatorname{asSph}(\mathbf{v})=
\Bigl( r=|\mathbf{v}|,;
\vartheta=\arccos\tfrac{v_z}{|\mathbf{v}|},;
\varphi=\operatorname{atan2}(v_y,v_x)\Bigr).
$$

Outer nodes may include a vertical leg $\mathbf{v}*{\text{leg}}=(0,0,-L*{\text{leg}})$ for ground connections.

---

## Negative Space

Each quadrilateral cell is defined by

$$(m,; m+N_1,; m+N_1+N_2,; m+N_2),$$

when in range. Let the vertices be $\mathbf{a},\mathbf{b},\mathbf{c},\mathbf{d}$.

**Edge lengths**

$$
a=|\mathbf{b}-\mathbf{a}|,;
b=|\mathbf{c}-\mathbf{b}|,;
c=|\mathbf{d}-\mathbf{c}|,;
d=|\mathbf{a}-\mathbf{d}|.
$$

**Angles**

$$
\cos\angle A =
\frac{(\mathbf{b}-\mathbf{a})\cdot(\mathbf{d}-\mathbf{a})}
{|\mathbf{b}-\mathbf{a}|,|\mathbf{d}-\mathbf{a}|},;; \text{etc.}
$$

**Area**

$$
\operatorname{Area}(\mathbf{a}\mathbf{b}\mathbf{c}\mathbf{d})
= \tfrac{1}{2},|(\mathbf{b}-\mathbf{a})\times(\mathbf{c}-\mathbf{a})|
* \tfrac{1}{2},|(\mathbf{c}-\mathbf{a})\times(\mathbf{d}-\mathbf{a})|.
  $$

**Planarisation**

$$
\hat{\mathbf{n}}=
\frac{((\mathbf{b}-\mathbf{a})\times(\mathbf{c}-\mathbf{a}))
+((\mathbf{c}-\mathbf{a})\times(\mathbf{d}-\mathbf{a}))}
{|((\mathbf{b}-\mathbf{a})\times(\mathbf{c}-\mathbf{a}))
+((\mathbf{c}-\mathbf{a})\times(\mathbf{d}-\mathbf{a}))|}.
$$

Vertices are projected to this plane to generate cut files; tolerances can be set on skew and edge length.

---

## Parameters and Presets

* **Fibonacci pairs:** $(13,21)$, $(21,34)$, $(34,55)$ give clear lattices.
* **Density control:** multiply both denominators by $m=2$ or $3$ for finer meshes.
* **Wide/short cells:** small denominators.
* **Tall/thin cells:** large denominators.
* **Weave intensity:** distant pairs for strong crossing; adjacent Fibonacci numbers for subtle crossings.

---

## Making the Lattice (in practice)

The lattice begins with a sweep of denominators tested against the dome. The ones that behave are those clustered around Fibonacci numbers and their small multiples—arches that keep to the shell and leave the interior clear. This discovery was both surprising and reassuring: it confirmed the consistency of the geometry and validated the mathematics behind the tools.

With a denominator chosen, the every-$N$ connection unfolds into a family of arches. They run almost parallel around the shell; introducing a second denominator produces the crossing family that completes the lamella. Candidates that cut through the dome’s interior or tangle away from nodes are rejected.

As the arches accumulate, the negative spaces resolve into four-sided panes. At the pole they resemble a simplified flower; further down they echo cones and rosettes. Each aperture is distinct but related, embodying the kind of organised complexity the project set out to demonstrate.

Practicalities follow naturally: the joints derive directly from the vectors to their neighbours, recorded as spherical directions for fabrication. Outer joints can extend vertical legs for ground connections. The panes are planarised from their four corners, their outlines exported for cutting with tolerances set on skew and minimum size. The result is a lattice that connects every required point without piercing the dome’s interior, and that is fabrication-ready without post-hoc adjustment.

---

## Placeholders

* *L1:* Arch generation from every-$N$ connection.
* *L2:* Crossing families $(N_1,N_2)$ with labelled nodes.
* *L3:* Trapezoid cell geometry with projected plane.
* *L4:* Comparative meshes: small vs large denominators.
