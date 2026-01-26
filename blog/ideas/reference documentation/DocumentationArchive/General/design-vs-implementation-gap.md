# Design vs Implementation — Architecture Gap Analysis

**Date:** 2025-12-04  
**Issue:** Implementation doesn't match unified design concept

---

## The Core Problem

### Original Design (Unified System)

```
Point Distribution
       ↓
   Connectivity
       ↓
  Evolution (optional: None/RD/CA)
       ↓
  Distance Field
       ↓
  Rendering (Truchet/Blob/Nested/Global)
```

**Key principles:**
1. **Single point set** used by ALL render modes
2. **Evolution modulates point weights**, not separate grids
3. **Rendering modes are independent** of evolution choice
4. **Smooth transitions** via parameter interpolation

### Current Implementation (Disconnected)

```
buildPoints() → state.points
buildEdges() → state.edges
buildTruchet() → state.truchetGrid (separate!)
initFields() → state.rdState, state.caState (separate!)

renderTruchet() → Uses truchetGrid (ignores points!)
renderBlobs() → Uses points/edges ✓
renderNested() → Uses points ✓
renderGlobal() → Uses points ✓
```

**Problems:**
1. **Truchet has its own grid**, doesn't use distribution layer points
2. **RD/CA fields are separate grids**, not tied to points
3. **No single distance field**, each renderer does its own thing
4. **Evolution doesn't affect point weights**, just modulates truchet tiles

---

## UI Control Visibility Issues

### Problem 1: Always-Visible Mode-Specific Controls

**Current UI shows ALL these simultaneously:**
```
Evolution Mode: [None/RD/CA]
CA Rule: [Life/Seeds/...]          ← Shown even when mode=RD
Du: [slider]                       ← Shown even when mode=CA
Dv: [slider]                       ← Shown even when mode=CA
Feed Rate: [slider]                ← Shown even when mode=None
Kill Rate: [slider]                ← Shown even when mode=None
```

**Should be conditional:**
```
Evolution Mode: [None/RD/CA]

IF evolutionMode === 'None':
  (no additional controls)

IF evolutionMode === 'Reaction-Diffusion':
  Du: [slider]
  Dv: [slider]
  Feed Rate: [slider]
  Kill Rate: [slider]
  
IF evolutionMode === 'Cellular Automaton':
  CA Rule: [dropdown]
```

### Problem 2: Render-Mode-Specific Controls Always Shown

**Current UI:**
```
Render Mode: [Truchet/Blob/Nested/Global]
Weight Scale: [slider]             ← Relevant for ALL modes
Tile Window: [slider]              ← Only Truchet uses tiles!
Boundary Cost: [slider]            ← Only Truchet uses boundaries!
Contour Count: [stepper]           ← Only Nested/Global use contours!
```

**Should be conditional:**
```
Render Mode: [Truchet/Blob/Nested/Global]
Weight Scale: [slider]             ← Always shown

IF renderMode === 'Truchet':
  Tile Window: [slider]
  Boundary Cost: [slider]

IF renderMode === 'Nested' OR renderMode === 'Global':
  Contour Count: [stepper]

IF renderMode === 'Blob':
  (Weight Scale controls blob size)
```

---

## Architectural Mismatches

### Mismatch 1: Truchet Doesn't Use Point Distribution

**Original design (lines 24-33):**
> Point Distribution Layer feeds into one persistent point set
> Truchet tile shape determined by local edge pattern

**Current implementation:**
```javascript
// Line 260-267: buildTruchet()
function buildTruchet(v) {
    var cellSize = Math.floor(30 / v.density);
    var cols = Math.ceil(420 / cellSize);
    var rows = Math.ceil(420 / cellSize);
    
    // Generates SEPARATE grid, ignores state.points!
    state.truchetGrid = A.Patterns.generateTruchetGrid(cols, rows, 12345);
}

// Line 331-368: renderTruchet()
function renderTruchet(ctx, w, h, v) {
    // Uses truchetGrid, NOT state.points or state.edges
    for (var j = 0; j < rows; j++) {
        for (var i = 0; i < cols; i++) {
            var tileState = state.truchetGrid[idx] || 0;
            // ...
        }
    }
}
```

**Problem:** Truchet ignores the carefully distributed points. Changes to density/jitter don't affect Truchet tile PLACEMENT, only tile SIZE.

**What it SHOULD do:**
```javascript
function renderTruchet(ctx, w, h, v) {
    // Use state.points and state.edges to determine tile shapes
    // Each point region gets a tile type based on edge connectivity
    for (var i = 0; i < state.points.length; i++) {
        var p = state.points[i];
        var neighbors = getNeighbors(i, state.edges);
        var tileType = determineTileType(neighbors);  // T, corner, straight, cross
        drawTile(ctx, p.x, p.y, tileType, cellSize);
    }
}
```

### Mismatch 2: RD/CA Don't Modulate Points

**Original design (lines 48-56):**
> Each point carries local states (e.g., RD variables)
> Evolution applies discrete steps over edges
> RD adjusts weights → dynamic merging and splitting

**Current implementation:**
```javascript
// Lines 285-287: initFields()
state.rdState = A.ReactionDiffusion.initGrayScott(w, h, ...);  // Separate grid!
state.caState = A.ReactionDiffusion.initCellularAutomaton(w, h, ...);  // Separate grid!

// state.points have NO rdState or caState properties
```

**Problem:** RD/CA run on separate grids. They don't affect point weights or edge weights.

**What it SHOULD do:**
```javascript
// Each point should have evolution state
state.points[i].u = 1.0;  // RD state u
state.points[i].v = 0.0;  // RD state v
state.points[i].alive = 0;  // CA state

// Evolution steps update point properties
function stepEvolution() {
    if (evolutionMode === 'RD') {
        // Diffuse along edges, react at points
        for (each edge in state.edges) {
            diffuseOverEdge(points[edge.i], points[edge.j]);
        }
        for (each point) {
            reactAtPoint(point);
        }
    }
    if (evolutionMode === 'CA') {
        // Count alive neighbors via edges
        for (each point) {
            point.aliveNext = caRule(countAliveNeighbors(point, edges));
        }
    }
}
```

### Mismatch 3: No Global Distance Field

**Original design (lines 59-65):**
> A single global signed distance field is computed from the curve geometry
> Enables nested contours, tile-limited contours, and full-domain contours

**Current implementation:**
```javascript
// renderNested() — computes distances per-point locally
A.Rendering.renderConcentricContours(ctx, state.points, {
    count: v.contourCount,
    maxRadius: 40 * v.weightScale,
});

// renderGlobal() — samples distance field on demand
A.Rendering.renderDistanceContours(ctx, state.points, w, h, {
    resolution: 4,  // Recomputes every frame
});
```

**Problem:** No persistent distance field. Contours recomputed each frame.

**What it SHOULD do:**
```javascript
// Persistent distance field updated when geometry changes
state.distanceField = new Float32Array(w * h);

function updateDistanceField() {
    // Rasterize edges to distance field
    for (each edge in state.edges) {
        rasterizeEdgeToField(edge, state.distanceField);
    }
    // Or use JFA for exact distances
    state.distanceField = A.JFA.jumpFloodAlgorithm(seeds, w, h);
}

function renderContours(ctx, mode) {
    // Extract contours from persistent field
    var levels = generateContourLevels(v.contourCount);
    for (var level of levels) {
        var contour = A.MarchingSquares.marchingSquares(
            state.distanceField, w, h, level
        );
        strokeContour(ctx, contour);
    }
}
```

---

## The Unified System That Should Exist

### Data Flow (Correct)

```
1. DISTRIBUTION
   buildPoints(density, gridStrength, clusterScale, jitter)
   → state.points = [{x, y, u, v, alive, weight}, ...]
   
2. CONNECTIVITY
   buildEdges(neighborRadius, maxDegree, arcQuant, axisBias)
   → state.edges = [{i, j, weight}, ...]
   
3. EVOLUTION (optional)
   if evolutionMode === 'RD':
     stepRD_onNetwork(points, edges, Du, Dv, feed, kill)
     → Updates point.u, point.v
   
   if evolutionMode === 'CA':
     stepCA_onNetwork(points, edges, caRule)
     → Updates point.alive
   
4. DISTANCE FIELD
   updateDistanceField(points, edges)
   → state.distanceField = Float32Array
   
5. RENDERING
   if renderMode === 'Truchet':
     renderTruchetFromNetwork(points, edges, distanceField)
   
   if renderMode === 'Blob':
     renderBlobs(points, edges, useWeights=true)
   
   if renderMode === 'Nested':
     renderContours(distanceField, clipToTiles=true)
   
   if renderMode === 'Global':
     renderContours(distanceField, clipToTiles=false)
```

### Point Properties (What Should Exist)

```javascript
state.points[i] = {
    x: number,           // Position
    y: number,
    
    // Evolution state
    u: number,           // RD substrate (0-1)
    v: number,           // RD activator (0-1)
    alive: boolean,      // CA state
    
    // Derived properties
    weight: number,      // Affected by RD.v or CA.alive
    color: string,       // Could be modulated by evolution
};
```

### Evolution Integration (What Should Happen)

```javascript
function stepSimulation(v) {
    if (v.evolutionMode === 'Reaction-Diffusion') {
        // RD on network (not grid!)
        for (var edge of state.edges) {
            // Diffusion along edge
            var pi = state.points[edge.i];
            var pj = state.points[edge.j];
            
            var laplacianU_i = computeNetworkLaplacian(pi, 'u', state.edges);
            var laplacianV_i = computeNetworkLaplacian(pi, 'v', state.edges);
            
            // Gray-Scott reaction at point
            var uv2 = pi.u * pi.v * pi.v;
            pi.u_next = pi.u + dt * (v.rdDu * laplacianU_i - uv2 + v.feedRate * (1 - pi.u));
            pi.v_next = pi.v + dt * (v.rdDv * laplacianV_i + uv2 - (v.feedRate + v.killRate) * pi.v);
            
            // Update weight based on v concentration
            pi.weight = 1.0 + 2.0 * pi.v;
        }
        
        // Swap buffers
        for (var p of state.points) {
            p.u = p.u_next;
            p.v = p.v_next;
        }
    }
    
    if (v.evolutionMode === 'Cellular Automaton') {
        // CA on network
        for (var i = 0; i < state.points.length; i++) {
            var aliveNeighbors = countAliveNeighbors(i, state.edges, state.points);
            var rule = A.ReactionDiffusion.CA_RULES[v.caRule];
            
            if (state.points[i].alive) {
                state.points[i].alive_next = rule.survival.includes(aliveNeighbors);
            } else {
                state.points[i].alive_next = rule.birth.includes(aliveNeighbors);
            }
            
            // Update weight based on alive state
            state.points[i].weight = state.points[i].alive_next ? 2.0 : 0.5;
        }
        
        // Swap buffers
        for (var p of state.points) {
            p.alive = p.alive_next;
        }
    }
}
```

---

## Required Changes

### 1. Add Conditional UI Rendering

**ToolBase needs conditional visibility support:**

```javascript
// In sidebar config, add conditional property
['Evolution', [
    ['dropdown', 'Mode', ['None', 'Reaction-Diffusion', 'Cellular Automaton'], { key: 'evolutionMode', value: 'None' }],
    
    // Only show if evolutionMode === 'Reaction-Diffusion'
    ['slider', 'Du', 0.1, 1.0, 0.01, { 
        value: 0.2, 
        key: 'rdDu', 
        visibleWhen: { key: 'evolutionMode', value: 'Reaction-Diffusion' }
    }],
    
    // Only show if evolutionMode === 'Cellular Automaton'
    ['dropdown', 'CA Rule', ['Life', 'Seeds', ...], { 
        key: 'caRule', 
        value: 'Life',
        visibleWhen: { key: 'evolutionMode', value: 'Cellular Automaton' }
    }],
]],
```

**OR restructure tabs:**

```javascript
['EVOLUTION', [
    ['Mode', [
        ['dropdown', 'Type', ['None', 'Reaction-Diffusion', 'Cellular Automaton'], { key: 'evolutionMode' }],
    ]],
    // Dynamically populated based on evolutionMode
]],
```

### 2. Restructure Point/Edge Data

```javascript
function buildPoints(v, tool) {
    var w = tool.canvas.width, h = tool.canvas.height;
    var cols = Math.floor(w / (30 / v.density));
    var rows = Math.floor(h / (30 / v.density));
    
    var raw = A.Sampling.jitteredGrid(w, h, cols, rows, v.jitter, state.rng);
    
    state.points = raw.filter(function(p) {
        p.noise = A.Noise.simplex2D(p.x / (100 * v.clusterScale), p.y / (100 * v.clusterScale));
        return v.clusterScale <= 1 || p.noise >= -0.3;
    }).map(function(p) {
        var gx = Math.round(p.x / 30) * 30;
        var gy = Math.round(p.y / 30) * 30;
        return { 
            x: gx * v.gridStrength + p.x * (1 - v.gridStrength), 
            y: gy * v.gridStrength + p.y * (1 - v.gridStrength), 
            noise: p.noise,
            
            // Evolution state
            u: 1.0,
            v: 0.0,
            alive: 0,
            
            // Rendering properties
            weight: 1.0,
            color: '#FFFFFF'
        };
    });
    
    if (state.points.length > 0) {
        state.kdTree = A.SpatialIndex.buildKdTree(state.points);
    }
}
```

### 3. Implement Network Evolution

```javascript
function stepSim(v) {
    if (v.evolutionMode === 'Reaction-Diffusion') {
        stepRD_onNetwork(v);
    } else if (v.evolutionMode === 'Cellular Automaton') {
        stepCA_onNetwork(v);
    }
}

function stepRD_onNetwork(v) {
    // Compute Laplacian on network (not grid)
    for (var i = 0; i < state.points.length; i++) {
        var p = state.points[i];
        var lapU = 0, lapV = 0;
        var degree = 0;
        
        // Sum over neighbors
        for (var e of state.edges) {
            if (e.i === i) {
                lapU += state.points[e.j].u - p.u;
                lapV += state.points[e.j].v - p.v;
                degree++;
            } else if (e.j === i) {
                lapU += state.points[e.i].u - p.u;
                lapV += state.points[e.i].v - p.v;
                degree++;
            }
        }
        
        if (degree > 0) {
            lapU /= degree;
            lapV /= degree;
        }
        
        // Gray-Scott reaction
        var v2 = p.v * p.v;
        var uv2 = p.u * v2;
        p.u_next = p.u + (v.rdDu * lapU - uv2 + v.feedRate * (1 - p.u));
        p.v_next = p.v + (v.rdDv * lapV + uv2 - (v.feedRate + v.killRate) * p.v);
        
        // Clamp
        p.u_next = Math.max(0, Math.min(1, p.u_next));
        p.v_next = Math.max(0, Math.min(1, p.v_next));
        
        // Update weight for rendering
        p.weight = 1.0 + 2.0 * p.v_next;
    }
    
    // Swap buffers
    for (var p of state.points) {
        p.u = p.u_next;
        p.v = p.v_next;
    }
}
```

### 4. Make Truchet Use Point Network

```javascript
function renderTruchet(ctx, w, h, v) {
    var cellSize = 30 / v.density;
    
    // Voronoi-like regions around points
    for (var i = 0; i < state.points.length; i++) {
        var p = state.points[i];
        
        // Determine tile type from edge connectivity
        var neighbors = getEdgeNeighbors(i, state.edges);
        var tileType = determineTileFromNeighbors(neighbors);
        
        // Modulate by evolution state
        if (v.evolutionMode === 'Reaction-Diffusion') {
            if (p.v > 0.3) tileType = 1 - tileType;  // Flip tile
        } else if (v.evolutionMode === 'Cellular Automaton') {
            tileType = p.alive ? 1 : 0;
        }
        
        // Draw tile at point
        var arcs = A.Patterns.getTruchetArcs(0, 0, tileType, cellSize * v.tileWindow);
        drawArcsAt(ctx, p.x, p.y, arcs, v.weightScale);
    }
}
```

---

## Summary: What Needs to Happen

### Immediate (UI)
1. **Hide irrelevant controls** based on evolutionMode and renderMode
2. Requires ToolBase conditional visibility OR dynamic tab generation

### Architectural (Major Refactor)
1. **Make Truchet use point network** instead of separate grid
2. **Run RD/CA on point network** instead of separate grids
3. **Implement global distance field** from edges
4. **Update point weights** based on evolution state
5. **Use point weights** in all render modes

### Conceptual
The tool should be ONE SYSTEM, not four separate systems glued together.

**Current:** Truchet OR Blob OR Nested OR Global  
**Desired:** Unified system where render modes are just different ways to visualize the same underlying structure

---

End of Analysis






