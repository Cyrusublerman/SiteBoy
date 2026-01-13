# Hooke's Law (Spring Physics)

## 1. Overview
Hooke's law describes the restoring force exerted by an elastic spring, stating that force is proportional to displacement from equilibrium. It is fundamental to physics simulation, procedural animation, and soft-body dynamics in computer graphics.

## 2. Mathematical Formulation

### 2.1 Basic Spring Force
$$F = -k \cdot x$$

Where:
- \(F\) = restoring force (N)
- \(k\) = spring constant or stiffness (N/m)
- \(x\) = displacement from rest length

The negative sign indicates force opposes displacement.

### 2.2 Vector Form (2D/3D)
For a spring connecting points \(\mathbf{p}_1\) and \(\mathbf{p}_2\) with rest length \(L_0\):

$$\mathbf{d} = \mathbf{p}_2 - \mathbf{p}_1$$
$$L = \|\mathbf{d}\|$$
$$\hat{\mathbf{d}} = \mathbf{d} / L$$
$$\mathbf{F}_1 = k(L - L_0)\hat{\mathbf{d}}$$
$$\mathbf{F}_2 = -\mathbf{F}_1$$

### 2.3 With Damping
Add velocity-dependent damping to prevent oscillation:

$$\mathbf{F} = -k(\|\mathbf{d}\| - L_0)\hat{\mathbf{d}} - c(\mathbf{v}_{\text{rel}} \cdot \hat{\mathbf{d}})\hat{\mathbf{d}}$$

Where:
- \(c\) = damping coefficient
- \(\mathbf{v}_{\text{rel}} = \mathbf{v}_2 - \mathbf{v}_1\) = relative velocity

## 3. Spring-Mass System

### 3.1 Equation of Motion
For a single mass on a spring:

$$m\ddot{x} + c\dot{x} + kx = 0$$

### 3.2 Natural Frequency
$$\omega_0 = \sqrt{\frac{k}{m}}$$

### 3.3 Damping Ratio
$$\zeta = \frac{c}{2\sqrt{km}}$$

Behavior:
- \(\zeta < 1\): Underdamped (oscillates)
- \(\zeta = 1\): Critically damped (fastest no-oscillation return)
- \(\zeta > 1\): Overdamped (slow return)

### 3.4 Damped Frequency
$$\omega_d = \omega_0\sqrt{1 - \zeta^2}$$

## 4. Numerical Integration

### 4.1 Explicit Euler (Simple, Unstable)
```
v += (F / m) * dt
x += v * dt
```

Unstable for stiff springs (\(k \cdot dt^2 / m > 4\)).

### 4.2 Semi-Implicit Euler (Better Stability)
```
v += (F / m) * dt
x += v * dt  // Use updated velocity
```

### 4.3 Verlet Integration (Good Energy Conservation)
```
x_new = 2*x - x_old + (F/m) * dt²
x_old = x
x = x_new
```

### 4.4 RK4 (High Accuracy)
Fourth-order Runge-Kutta for smooth motion.

## 5. Spring Types in Simulation

### 5.1 Structural Springs
Connect adjacent nodes, maintain shape.

### 5.2 Shear Springs
Connect diagonal neighbors, resist shearing.

### 5.3 Bend (Flexion) Springs
Connect every-other node, resist bending.

### 5.4 Cloth Model Example
```
For each node (i, j) in grid:
    // Structural
    spring(node[i,j], node[i+1,j])
    spring(node[i,j], node[i,j+1])
    // Shear
    spring(node[i,j], node[i+1,j+1])
    spring(node[i+1,j], node[i,j+1])
    // Bend
    spring(node[i,j], node[i+2,j])
    spring(node[i,j], node[i,j+2])
```

## 6. Energy

### 6.1 Potential Energy
$$U = \frac{1}{2}k(x - L_0)^2$$

### 6.2 Kinetic Energy
$$K = \frac{1}{2}mv^2$$

### 6.3 Total Energy (Conservation)
$$E = K + U = \text{constant}$$ (without damping)

## 7. Common Parameters

| Application | k (stiffness) | c (damping) |
|-------------|--------------|-------------|
| Soft cloth | 10-100 | 0.1-1 |
| Rubber | 100-1000 | 1-10 |
| Hair strand | 50-500 | 0.5-5 |
| UI element | 200-500 | 10-30 |
| Rope | 1000-5000 | 5-20 |

## 8. Implementation

### 8.1 Single Spring
```javascript
function springForce(p1, p2, restLength, stiffness, damping, v1, v2) {
    const d = subtract(p2, p1);
    const length = magnitude(d);
    if (length < 0.0001) return { f1: [0,0], f2: [0,0] };
    
    const dir = scale(d, 1/length);
    const stretch = length - restLength;
    
    // Spring force
    const springF = scale(dir, stiffness * stretch);
    
    // Damping force (along spring axis)
    const relVel = subtract(v2, v1);
    const dampF = scale(dir, damping * dot(relVel, dir));
    
    const f1 = add(springF, dampF);
    const f2 = scale(f1, -1);
    
    return { f1, f2 };
}
```

### 8.2 Spring Network Update
```javascript
function updateSpringNetwork(nodes, springs, dt) {
    // Reset forces
    nodes.forEach(n => n.force = [0, 0]);
    
    // Accumulate spring forces
    springs.forEach(s => {
        const { f1, f2 } = springForce(
            nodes[s.i].pos, nodes[s.j].pos,
            s.restLength, s.k, s.c,
            nodes[s.i].vel, nodes[s.j].vel
        );
        nodes[s.i].force = add(nodes[s.i].force, f1);
        nodes[s.j].force = add(nodes[s.j].force, f2);
    });
    
    // Integrate
    nodes.forEach(n => {
        if (n.fixed) return;
        const acc = scale(n.force, 1/n.mass);
        n.vel = add(n.vel, scale(acc, dt));
        n.pos = add(n.pos, scale(n.vel, dt));
    });
}
```

## 9. Applications
- Cloth simulation
- Soft-body physics
- Procedural animation (hair, vegetation)
- UI spring animations
- Particle systems with cohesion
- Rope and chain physics

## 10. References
- Hooke, Robert. "De Potentia Restitutiva." 1678.
- Baraff, David, and Andrew Witkin. "Large steps in cloth simulation." SIGGRAPH 1998.
- "Hooke's law." Wikipedia. https://en.wikipedia.org/wiki/Hooke%27s_law

