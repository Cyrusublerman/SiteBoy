## From Phyllotactic Field to Dome

The phyllotactic spiral, defined in polar coordinates as

$$
r_k = C \sqrt{k}, \quad \theta_k = k \cdot \alpha
$$

with $\alpha$ typically set to the golden angle ($\alpha \approx 137.5^\circ$), provides the two-dimensional basis for the dome. To extend this into three dimensions, a vertical mapping is introduced, assigning each point an elevation $z_k$.

---

## Vertical Mapping

The transformation from planar spiral to dome requires mapping either the **point index** $k$ or the **radius** $r_k$ to a height $z$. In this methodology, the simplest and most robust approach was a linear mapping:

$$
z_k = h_{\max} - \frac{k}{N} h_{\max}
$$

where $N$ is the total number of points and $h_{\max}$ is the target dome height. This places the first points at the apex and lowers subsequent points evenly until the boundary.

Alternatively, a radius-based mapping can be used:

$$
z(r) = h_{\max} \left(1 - \frac{r}{R}\right)
$$

where $R$ is the outer radius of the dome. Both approaches give a smooth curvature, though the index-based method ensures uniform coverage across the dome surface.

> Because in nature the dome’s curvature varies to such a degree, specificity of the dome curvature in the generation was not needed. Thus for this methodology and created algorithms, the relationship between point number and vertical height was linear. This allowed the radial distribution to also dictate the vertical, which creates a near uniform dome.

---

## Boundary Condition for $C$

To constrain the phyllotactic distribution within a fixed dome radius $R$, the scaling constant $C$ must satisfy:

$$
C = \frac{R}{\sqrt{N}}
$$

so that the final point $k=N$ lies at $r_N = R$. This ensures the dome has a hard geometric boundary, matching the architectural design target.

---

## Uniform Coverage

By combining the divergence angle, radial scaling, and vertical mapping, the generated points distribute nearly uniformly across the dome surface. The avoidance of clustering or sparse areas is a natural consequence of the irrational relation between the golden angle and $2\pi$.

This uniformity is crucial for structural efficiency, ensuring consistent load distribution when the lattice is later imposed.

---

## Equations Summary

1. **Phyllotactic radius:**
   $$r_k = C \sqrt{k}$$

2. **Divergence angle:**
   $$\theta_k = k \cdot \alpha, \quad \alpha = \frac{360^\circ}{\tau^2}$$
   where $\tau = \frac{1+\sqrt{5}}{2}$

3. **Boundary condition for $C$:**
   $$C = \frac{R}{\sqrt{N}}$$

4. **Vertical mapping (index-based):**
   $$z_k = h_{\max}\left(1 - \frac{k}{N}\right)$$

5. **Vertical mapping (radius-based):**
   $$z(r) = h_{\max}\left(1 - \frac{r}{R}\right)$$

---

## Coordinate Mapping (Cartesian / 3D point set)

Convert polar $(r_k,,\theta_k)$ to Cartesian for placement and rendering, then attach height $z_k$:

$$
\begin{aligned}
x_k &= r_k \cos \theta_k,\
y_k &= r_k \sin \theta_k,\
z_k &= h_{\max}\Bigl(1 - \frac{k}{N}\Bigr) \quad \text{or}\quad h_{\max}\Bigl(1 - \frac{r_k}{R}\Bigr).
\end{aligned}
$$

---

## Why the coverage is near-uniform (derivation)

**Planar field.** With $r_k=C\sqrt{k}$, the area within radius $r_k$ is $A_k=\pi r_k^2=\pi C^2,k$. Hence $\Delta A\approx\pi C^2$ per increment in $k$; the spiral allocates approximately equal area to each point. Since $\alpha/2\pi$ is irrational (golden-angle rotation), the sequence $(k\alpha \bmod 2\pi)$ is equidistributed on $[0,2\pi)$, preventing azimuthal clustering. Together these yield a near-uniform planar sampling density.

**Lift to a dome.** The index-based lift $z_k=h_{\max}(1-k/N)$ is affine in $k$, preserving the uniformity along the growth order while re-parameterising points by height. A radius-based lift $z(r)$ that is monotone in $r$ likewise maintains the absence of clumping along meridians. Strict equal-area on a chosen surface (e.g., a spherical cap of radius $S$ and cap angle $\theta_{\max}$) can be achieved if desired by selecting

$$
\theta_k=\arccos!\Bigl(1-\tfrac{k}{N}\bigl(1-\cos\theta_{\max}\bigr)\Bigr),\quad r_k'=S\sin\theta_k,\quad z_k'=S\bigl(1-\cos\theta_k\bigr),
$$

and retuning $C$ so that $r_k\approx r_k'$ at $k=N$; for this project the linear index-based lift was sufficient and retained the desired natural appearance.

---

## Placeholders for Diagrams

* *Diagram 1:* 2D spiral field before lifting.
* *Diagram 2:* Vertical mapping applied to generate dome.
* *Diagram 3:* Comparison of index-based vs radius-based z-mapping profiles.

---

## References

* Vogel, H. (1979). A better way to construct the sunflower head. *Mathematical Biosciences*. [ScienceDirect](https://www.sciencedirect.com/science/article/pii/0025556479900804)
* Adler, I., Barabé, D., & Jean, R.V. (1997). A history of the study of phyllotaxis. *Annals of Botany*. [Oxford Academic](https://academic.oup.com/aob/article/80/3/231/2587655)
* Reinhardt, D., & Gola, E.M. (2022). Phyllotaxis—From patterns of organogenesis at the meristem to shoot architecture. *Progress in Biophysics & Molecular Biology*. [ScienceDirect](https://www.sciencedirect.com/science/article/pii/S007961072300038X)

