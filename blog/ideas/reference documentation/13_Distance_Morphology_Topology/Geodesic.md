# Geodesic Distance

## 1. Overview
A geodesic is the shortest path between two points on a surface or manifold. Geodesic distance measures the length of this path, accounting for the surface's curvature. Unlike Euclidean distance (straight line), geodesic distance follows the surface, making it essential for terrain analysis, mesh processing, and contour-aligned sampling.

## 2. Mathematical Definition

### 2.1 On Surfaces
For a smooth surface \(S\), the geodesic between points \(p\) and \(q\) minimizes:

$$L[\gamma] = \int_0^1 \|\gamma'(t)\| \, dt$$

Subject to: \(\gamma(0) = p\), \(\gamma(1) = q\), \(\gamma(t) \in S\)

### 2.2 On Riemannian Manifolds
Using the metric tensor \(g_{ij}\):

$$L[\gamma] = \int_0^1 \sqrt{g_{ij}(\gamma(t)) \dot{\gamma}^i \dot{\gamma}^j} \, dt$$

### 2.3 Geodesic Equation
Geodesics satisfy:

$$\frac{d^2\gamma^k}{dt^2} + \Gamma^k_{ij} \frac{d\gamma^i}{dt} \frac{d\gamma^j}{dt} = 0$$

Where \(\Gamma^k_{ij}\) are Christoffel symbols.

## 3. Computation on Discrete Surfaces

### 3.1 Dijkstra on Graph
For mesh vertices connected by edges:

```
function dijkstraGeodesic(mesh, source):
    dist = {source: 0}
    prev = {}
    queue = PriorityQueue([(0, source)])
    
    while not queue.empty():
        d, u = queue.pop()
        if d > dist[u]: continue
        
        for (v, edgeLength) in neighbors(u):
            alt = dist[u] + edgeLength
            if alt < dist.get(v, infinity):
                dist[v] = alt
                prev[v] = u
                queue.push((alt, v))
    
    return dist, prev
```

**Limitation**: Only considers paths along edges, underestimates true geodesic.

### 3.2 Fast Marching Method (FMM)
Solves the Eikonal equation \(\|\nabla u\| = 1/f\) on triangle meshes.

```
function fastMarchingGeodesic(mesh, source):
    dist = {source: 0}
    known = set()
    front = PriorityQueue([(0, source)])
    
    while not front.empty():
        d, u = front.pop()
        if u in known: continue
        known.add(u)
        
        for triangle containing u:
            for vertex v in triangle, v not in known:
                // Update distance using triangle geometry
                newDist = computeTriangleUpdate(triangle, dist)
                if newDist < dist.get(v, infinity):
                    dist[v] = newDist
                    front.push((newDist, v))
    
    return dist
```

### 3.3 Heat Method
Fast approximate geodesics using heat diffusion:

1. **Solve heat equation**: \(\dot{u} = \Delta u\) with impulse at source
2. **Compute gradient field**: \(X = -\nabla u / \|\nabla u\|\)
3. **Solve Poisson equation**: \(\Delta \phi = \nabla \cdot X\)

Geodesic distance = \(\phi\)

**Advantages**: O(n) after preprocessing, handles multiple sources efficiently.

### 3.4 Exact Polyhedral Geodesics
Mitchell-Mount-Papadimitriou (MMP) algorithm traces exact geodesics by unfolding triangles.

## 4. On Regular Grids (Images)

### 4.1 Weighted Distance Transform
For heightmap \(h(x,y)\), weight = arc length of surface:

$$w(p, q) = \sqrt{(x_q - x_p)^2 + (y_q - y_p)^2 + (h_q - h_p)^2}$$

### 4.2 8-Connected Grid Propagation
```javascript
function geodesicDistanceGrid(heightMap, seedX, seedY) {
    const dist = new Float32Array(width * height).fill(Infinity);
    dist[seedY * width + seedX] = 0;
    
    const queue = new PriorityQueue();
    queue.push({x: seedX, y: seedY, d: 0});
    
    const dx = [-1, 0, 1, -1, 1, -1, 0, 1];
    const dy = [-1, -1, -1, 0, 0, 1, 1, 1];
    
    while (!queue.isEmpty()) {
        const {x, y, d} = queue.pop();
        if (d > dist[y * width + x]) continue;
        
        for (let i = 0; i < 8; i++) {
            const nx = x + dx[i], ny = y + dy[i];
            if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
            
            // 3D arc length
            const dz = heightMap[ny * width + nx] - heightMap[y * width + x];
            const dxy = Math.sqrt(dx[i]*dx[i] + dy[i]*dy[i]);
            const step = Math.sqrt(dxy*dxy + dz*dz);
            
            const alt = d + step;
            if (alt < dist[ny * width + nx]) {
                dist[ny * width + nx] = alt;
                queue.push({x: nx, y: ny, d: alt});
            }
        }
    }
    return dist;
}
```

### 4.3 Chamfer Approximation
For flat surfaces, use Chamfer distance (3-4 or 5-7-11 weights).

## 5. Level Sets of Geodesic Distance
Iso-contours of geodesic distance form "geodesic circles":

$$C_r = \{p : d_g(p, \text{source}) = r\}$$

These follow the surface curvature and are useful for:
- Contour-aligned halftoning
- Terrain contour maps
- Surface parameterization

## 6. Multiple Sources
Voronoi diagram on surface:

$$\text{region}(s_i) = \{p : d_g(p, s_i) < d_g(p, s_j), \forall j \neq i\}$$

## 7. Applications
- Terrain analysis (watershed, ridges)
- Mesh segmentation
- Texture synthesis along surfaces
- Contour-following halftone patterns
- Character animation (geodesic skinning)
- Surface parameterization

## 8. References
- Kimmel, R., and Sethian, J. A. "Computing geodesic paths on manifolds." PNAS 95.15 (1998): 8431-8435.
- Crane, K., Weischedel, C., and Wardetzky, M. "Geodesics in heat." ACM TOG 32.5 (2013).
- Mitchell, J. S., Mount, D. M., and Papadimitriou, C. H. "The discrete geodesic problem." SIAM J. Comput. 16.4 (1987): 647-668.
- "Geodesic." Wikipedia. https://en.wikipedia.org/wiki/Geodesic

