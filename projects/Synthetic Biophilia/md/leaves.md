# Decorative (Leaves, Glazing, Attachments)

## From Structure to Surface

With the lattice defined, the dome shifts from a purely structural field to a surface capable of carrying attachments and skinning strategies. Joints become anchor points for outer components, and the trapezoidal negative spaces become candidates for glazing. The design requirement remains constant: any added element must respect the dome’s hollow interior and the flow dictated by the phyllotactic distribution.

> This array can also be appended to contain attachments for an outer structure such as the leaves detailed in later pages.

---

## Leaves — Concept and Role

> While creating the joints it is possible to create attachments for outer components I have called “leaves” for obvious reasons.
>
> These leaves are in essence the main aesthetic feature of the dome and will exaggerate the geometry’s plant-like shape (see above).

Leaves attach at lattice joints and extend outward, tracing the shell’s flow. Their orientation is generated from the joint’s local frame and can be linked directly to the phyllotactic variables, allowing controlled variation over radius, height, index, or azimuth.

---

## Joint Frame and Attachment Basis

Each joint already carries spherical directions for its connecting arms (see lattice):

$$
\operatorname{asSph}(\mathbf{v}) = \bigl(r=|\mathbf{v}|,; \vartheta,; \varphi\bigr),
$$

with the joint origin at $\mathbf{p}_m$. For attachments, use a **robust local frame** that does not assume a perfect sphere:

1. **Neighbourhood:** collect immediate neighbours ${m!\pm!N_1,; m!\pm!N_2}$ that exist.
2. **Best‑fit tangent plane:** compute two triangle normals and average:
   $$
   \hat{\mathbf{n}}*m \propto \sum*{q\in\mathcal{N}(m)} (\mathbf{p}_q-\mathbf{p}*m)\times(\mathbf{p}*{q'}-\mathbf{p}_m),
   $$
   where $q'$ is the next neighbour in cyclic order; normalise $\hat{\mathbf{n}}_m$ outward by enforcing $\hat{\mathbf{n}}_m\cdot(\mathbf{p}_m-\mathbf{c})>0$.
3. **Principal directions:** pick two in‑plane axes via PCA on the neighbour vectors (or normalise arch directions):
   $$
   \hat{\mathbf{t}}*1 \propto \mathbf{p}*{m+N_1}-\mathbf{p}_m,\qquad
   \hat{\mathbf{t}}_2 = \hat{\mathbf{n}}_m \times \hat{\mathbf{t}}_1.
   $$
4. **Continuity:** flip $\hat{\mathbf{n}}_m$ if $\hat{\mathbf{n}}*m\cdot\hat{\mathbf{n}}*{m-1}<0$ to avoid frame flips; re‑orthonormalise.

This frame provides consistent attachment transforms for leaves and other add‑ons, even when the dome deviates from a spherical cap.

---

## Generative Orientation (Tilt, Twist, Scale)

> The angle of protrusion is created when the polar coordinates of the joint arm are created and can be linked to other variables of the algorithm.
>
> For instance, if wanted, the leaves can begin almost flat with the dome and become more horizontal as they are generated further down. They may also be twisted and transformed in other ways generatively.

Let $\rho:=r/R\in[0,1]$ and $\kappa:=k/N\in[0,1]$. Typical controls:

* **Tilt** (about $\hat{\mathbf{t}}_2$):
  $$\beta(\rho) = \beta_0 + (\beta_1 - \beta_0),g(\rho), \qquad g(\rho)\in[0,1]$$
  with $g$ linear or eased (e.g., $g(\rho)=\rho^\gamma$). This realises “flat at the apex → more horizontal further down.”

* **Twist** (about $\hat{\mathbf{n}}_m$):
  $$\psi(\kappa,\varphi) = \psi_0 + a,\kappa + b,\sin(q,\varphi + \phi_0)$$
  allowing smooth global twist plus azimuthal modulation.

* **Scale** (leaf diameter/thickness):
  $$s(\rho,\kappa) = s_0,(1 + u,\rho + v,\kappa)$$
  or banded by Fibonacci index groups to echo phyllotactic banding.

The final leaf transform is

$$
\mathbf{x}_{\text{leaf}} = \mathbf{p}_m + \mathbf{R}(\hat{\mathbf{n}}_m,\psi),\mathbf{R}(\hat{\mathbf{t}}_2,\beta), s, \mathbf{x}_0,
$$

with $\mathbf{x}_0$ the leaf’s local coordinates.

### Continuity & Frame Coherence

To avoid visual noise from frame flips and phase jumps, enforce:

* $\beta(\rho)$, $\psi(\kappa,\varphi)$ **$C^1$ continuity** (e.g., cubic easing).
* **Phase locking:** choose $q$ so twists align across Fibonacci bands; enforce $|\Delta\psi|\le \psi_{\max}$ between neighbouring nodes.
* **Normal orientation:** if $(\hat{\mathbf{n}}*m\cdot\hat{\mathbf{n}}*{m'})<0$ for neighbours $m'$, flip the minority to maintain a consistent outward direction.

### Clearance & Non‑Piercing Constraints

Guarantee attachments remain outside and do not collide:

1. **Exterior test:** for each leaf centroid $\mathbf{c}*\ell$, require $(\mathbf{c}*\ell-\mathbf{p}_m)\cdot\hat{\mathbf{n}}*m > d*{\min}$.
2. **Chord avoidance:** for any lattice segment $[\mathbf{a},\mathbf{b}]$, enforce
   $$\min_{t\in[0,1]};\operatorname{dist}\bigl(\mathbf{a}+t(\mathbf{b}-\mathbf{a}),\ \mathcal{S}*{\text{leaf}}\bigr)\ge c*{\min},$$
   where $\mathcal{S}_{\text{leaf}}$ is the leaf surface.
3. **Neighbour spacing (footprint discs):** for monocle leaves of radii ${r_i}$ projected to the tangent plane with centres ${\mathbf{u}_i}$, require
   $$|\mathbf{u}_i-\mathbf{u}*j|\ge (1+g*{\text{gap}})(r_i+r_j).$$

These checks maintain the hollow interior and prevent self‑occlusion.

---

## Leaf Typologies (Parametric Variations)

> Alteration of the shape, size and relations of these leaves can result in a variety of different structural aesthetics.
>
> This manipulation can be of great use if the generation is to mimic a specific plant or form.

* **Monocle:** circular discs that emphasise the phyllotactic swirl.
* **Elliptical / lozenge:** emphasise meridional flow; anisotropic scaling along $\hat{\mathbf{t}}_1$.
* **Veined / split:** procedural subdivision introduces ribbing; twist reveals layered layering.
* **Nested:** stacked leaves per joint with radial offsets for a “bud” effect.

> The leaves do not need to be themselves naturally shaped for the resulting dome to exhibit a natural aesthetic. The above dome is an example, with circular monocle-shaped glass leaves arranged around the dome it develops the appearance of a budding or infant flower.

### Leaf Footprint & Spacing (Monocle Case)

On the tangent plane at $m$, a monocle leaf of radius $r_m$ uses footprint disc $D_m$. To ensure clean reveals and avoid overlaps:

* **Gap control:**
  $$\operatorname{dist}(D_m, D_q) \ge g_{\text{gap}},\max(r_m,r_q)$$
  for neighbours $q\in\mathcal{N}(m)$.
* **Coverage ratio:**
  $$\chi = \frac{\sum_m \pi r_m^2}{A_{\text{proj}}} \in [\chi_{\min},\chi_{\max}]$$
  where $A_{\text{proj}}$ is the projected dome area used by attachments.
* **Scale bands:** set $r_m = r_0,(1 + u,\rho_m + v,\kappa_m)$ or quantise by Fibonacci bands for a botanical read.

---

## Glazing the Negative Space

The trapezoids defined between joints (see lattice) are suitable for infill panels:

1. **Corner set:** $\bigl(m,, m+N_1,, m+N_1+N_2,, m+N_2\bigr)$.
2. **Planarisation:** best‑fit plane normal $\hat{\mathbf{n}}$ from adjacent triangles.
3. **Projection:** vertices projected to the $\hat{\mathbf{n}}$‑plane; outlines exported for cut files.
4. **Reveals & gaskets:** offset the pane polygon by $g_{\text{reveal}}$; maintain edge clearance for sealant thickness $t_{\text{gasket}}$.
5. **Colour / opacity gradients:** modulate by $\rho$, $\kappa$, or denominator family to emphasise flow.

This supports both fully glazed and partially screened domes without breaking the generative logic.

---

## Parameter Summary

| Parameter                               | Meaning                                      | Typical range                                                                       |
| --------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------- |
| $\rho,\ \kappa$                         | Normalised radius and index                  | $[0,1]$                                                                             |
| $\beta_0,\beta_1,\gamma$                | Tilt endpoints and easing                    | $\beta_0\in[0^\circ,30^\circ]$, $\beta_1\in[30^\circ,90^\circ]$, $\gamma\in[0.5,3]$ |
| $\psi_0,a,b,q,\phi_0$                   | Twist base, axial ramp, azimuthal modulation | $a\in[0,2\pi]$, $b\in[0,\tfrac{\pi}{4}]$, $q\in{1,2,3}$                             |
| $s_0,u,v$                               | Leaf scale controls                          | project‑specific                                                                    |
| $g_{\text{gap}}$                        | Planar gap ratio between leaves              | $[0.02,0.15]$                                                                       |
| $d_{\min},\ c_{\min}$                   | Exterior distance and chord clearance        | by thickness                                                                        |
| $g_{\text{reveal}},\ t_{\text{gasket}}$ | Pane offsets / sealant                       | fabrication‑specific                                                                |

---

## Implementation Notes

* Attachments use the same joint indexing, allowing consistent naming and fabrication metadata.
* Rotations $(\beta,\psi)$ are stored per joint; export as Euler angles or rotation matrices.
* Thickness, material, and edge treatments (e.g., fillets) follow a shared parameter set to keep the visual system coherent across variants.

---

## Placeholders for Renders

* *D1:* Monocle leaves (circular discs) across the shell.
* *D2:* Tilt gradient (flat at apex → horizontal at base).
* *D3:* Twisted leaf array showing azimuthal modulation.
* *D4:* Mixed glazing + leaves; pane tint gradient by height.
