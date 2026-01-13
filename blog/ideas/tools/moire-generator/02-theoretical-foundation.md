# Moiré Generator — Theoretical Foundation

## 1. Problem Formulation

**Input:** Grating parameters, combination mode

**Output:** Interference pattern image

## 2. Mathematical Framework

### 2.1 Radial Grating

$$
G_r(x, y) = \sin\left( \frac{2\pi r}{\lambda} + \phi \right)
$$

Where \( r = \sqrt{x^2 + y^2} \).

### 2.2 Angular Grating

$$
G_\theta(x, y) = \sin(n\theta)
$$

Where \( \theta = \arctan2(y, x) \) and \( n \) is the angular frequency.

**Reference:** `blog/ideas/reference documentation/19_Interference_Optics/Moiré_pattern.md`

### 2.3 Phase Modulation

$$
G(x, y) = \sin\left( \frac{2\pi r}{\lambda} + \beta f(x, y) + \phi \right)
$$

### 2.4 Multi-Centre

$$
G_{multi}(x, y) = w_A \cdot G(x - c_A) + w_B \cdot G(x - c_B)
$$

### 2.5 Combination Modes

| Mode | Formula |
|------|---------|
| SUM | \( \sum_i G_i \) |
| PRODUCT | \( \prod_i G_i \) |
| MIN | \( \min_i G_i \) |
| MAX | \( \max_i G_i \) |

### 2.6 Beat Frequency

When two gratings with wavelengths \( \lambda_1 \) and \( \lambda_2 \) interfere:

$$
\lambda_{beat} = \frac{\lambda_1 \lambda_2}{|\lambda_1 - \lambda_2|}
$$

**Reference:** `blog/ideas/reference documentation/19_Interference_Optics/Beat_frequency.md`

### 2.7 Threshold

$$
I_{out} = \begin{cases} 1 & \text{if } I > T \\ 0 & \text{otherwise} \end{cases}
$$

## 3. References

- Moiré patterns: Amidror (2009)
- Wave interference: Physics foundations

