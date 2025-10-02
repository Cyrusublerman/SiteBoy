# Phyllotaxis

## Definition

In botany, **phyllotaxis** (from Ancient Greek *phúllon* “leaf” and *táxis* “arrangement”) is the arrangement of leaves on a plant stem. **Phyllotactic spirals** form a distinctive class of patterns in nature. The patterned formation of plant organs around a central axis is one of the most consistent structural logics in plant morphology, visible from the spiral packing of sunflower seeds to the overlapping scales and primordia evident at the shoot apical meristem.

---

## Biological Basis → Why it matters for design

New primordia emerge at the meristem and are pushed outward as subsequent primordia appear. The **divergence angle**—the angular offset between successive primordia—determines the emergent packing. When this angle equals the **golden angle** (~**137.5°**), overlap is minimised and exposure is maximised; spiral families (parastichies) corresponding to consecutive Fibonacci numbers appear. This is not ornamental. It is a growth logic that produces **organised complexity** with high material efficiency—exactly the kind of structure we want to repurpose for synthetic form.

**Natural examples**

* *Floral organ initiation and phyllotaxis — scanning electron micrographs*:
  ![Anemoclema glaucifolium — floral organ initiation and phyllotaxis](https://www.researchgate.net/publication/299502037/figure/fig3/AS:960310609448961@1605967299155/Anemoclema-glaucifolium-Floral-organ-initiation-and-phyllotaxis-a-Five-sepals.jpg)

  <sub>Source (image): ResearchGate — *Anemoclema glaucifolium* floral organ initiation and phyllotaxis — direct figure link above. Full paper (stable access via JSTOR PDF): [https://www.jstor.org/stable/pdf/44853230.pdf](https://www.jstor.org/stable/pdf/44853230.pdf) </sub>

* *Sunflower head showing parastichy spirals*:
  ![Sunflower head — phyllotactic spirals](https://images.squarespace-cdn.com/content/v1/5cc369298dfc8cfea41c1840/1569610516035-AMMBBHWVWMJVZJFAQHEX/sunflower.jpg?format=1000w)

  <sub>Source: Christian Hubert Studio — “phyllotaxis” (page link): [https://www.christianhubert.com/writing/phyllotaxis](https://www.christianhubert.com/writing/phyllotaxis)</sub>

---

## Mathematical Formulation

A simple polar model (Vogel):

$$
r_k = C,\sqrt{k},\quad \theta_k = k,\alpha,
$$

where $k$ is the point index, $C$ is a scale constant, and $\alpha$ is the divergence angle. Conversion to Cartesian:

$$
\begin{aligned}
x_k &= r_k,\cos\theta_k,\
y_k &= r_k,\sin\theta_k.
\end{aligned}
$$

For the golden angle:

$$
\alpha = \frac{360^\circ}{\tau^2} \approx 137.507764^\circ,\qquad \tau = \frac{1+\sqrt{5}}{2}.
$$

**Implication**: small deviations from $\alpha$ immediately degrade uniformity (visible radial banding or clustering). This sensitivity is useful for demonstration and calibration.

---

## Algorithmic Demonstrations (p5.js)

The sketch below sweeps the divergence angle from **0° → 360°** in **0.5°** increments to expose the entire spectrum of behaviours. A manual interface with lattice connection controls is provided in the **Lattice** section.

> **Embedding note**: paste these blocks directly into your MD-capable site or framework that supports inline HTML/JS; both sketches are self-contained and namespaced.

### Divergence Angle Sweep (0° → 360°)

<div data-p5-component="phyllo-sweep" data-script-path="projects/Synthetic Biophilia/assets/p5/phyllo-sweep-siteboy.js" data-target-id="phyllo-sweep" data-siteboy-gui="true"></div>

---

---

## Fibonacci Linkage

The number of visible spiral families (parastichies) in phyllotactic patterns typically corresponds to **consecutive Fibonacci numbers** (e.g., 21–34, 34–55). This emerges from the continued fraction expansion of the golden ratio and the fact that $\alpha$ is maximally irrational with respect to $360^\circ$—it avoids commensurability, thereby producing even distribution and minimal occlusion.

---

## Design Hook → From spiral to dome (preview)

The 2D phyllotactic point set provides the **seed coordinates** for dome formation. By mapping index or radius to vertical displacement, a near-uniform dome surface is generated. Lattice connections and joint logic are then imposed on this point-field. The full conversion and structural system are detailed in the subsequent sections.

---

## References (linked)

* Vogel, H. (1979). *A better way to construct the sunflower head*. **Mathematical Biosciences**, 44(3–4), 179–189. ScienceDirect: [https://www.sciencedirect.com/science/article/pii/0025556479900804](https://www.sciencedirect.com/science/article/pii/0025556479900804)
* Adler, I., Barabé, D., & Jean, R.V. (1997). *A History of the Study of Phyllotaxis*. **Annals of Botany**, 80(3), 231–244. Oxford Academic: [https://academic.oup.com/aob/article/80/3/231/2587655](https://academic.oup.com/aob/article/80/3/231/2587655)
* “Towards solving the mystery of spiral phyllotaxis.” **Progress in Biophysics and Molecular Biology** (S007961072300038X). ScienceDirect landing: [https://www.sciencedirect.com/science/article/pii/S007961072300038X](https://www.sciencedirect.com/science/article/pii/S007961072300038X)
* *Anemoclema glaucifolium* — floral organ initiation and phyllotaxis (SEM figure). ResearchGate figure: [https://www.researchgate.net/publication/299502037/figure/fig3/AS:960310609448961@1605967299155/Anemoclema-glaucifolium-Floral-organ-initiation-and-phyllotaxis-a-Five-sepals.jpg](https://www.researchgate.net/publication/299502037/figure/fig3/AS:960310609448961@1605967299155/Anemoclema-glaucifolium-Floral-organ-initiation-and-phyllotaxis-a-Five-sepals.jpg)  — Full article PDF (JSTOR stable link): [https://www.jstor.org/stable/pdf/44853230.pdf](https://www.jstor.org/stable/pdf/44853230.pdf)
* Christian Hubert Studio — “phyllotaxis” (sunflower image context): [https://www.christianhubert.com/writing/phyllotaxis](https://www.christianhubert.com/writing/phyllotaxis)
