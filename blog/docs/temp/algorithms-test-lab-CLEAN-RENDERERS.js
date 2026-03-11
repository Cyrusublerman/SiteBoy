// ═══════════════════════════════════════════════════════════════════════
// CLEAN RENDERER FUNCTIONS - Pure Orchestration Only
// ═══════════════════════════════════════════════════════════════════════
// All algorithm logic lives in assets/js/shared/algorithms/
// These functions just call library, get output, display result

/**
 * Render noise algorithms
 * Pure orchestration: call library → get pixels → draw to canvas
 */
function renderNoise(algoId, ctx, canvas, values) {
    const A = window.Algorithms;
    const w = canvas.width;
    const h = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);
    
    // Call library function (black box)
    let pixels;
    switch (algoId) {
        case 'simplex2D':
            pixels = A.Noise.simplex2D(w, h, values.scale || 1.0, values.seed || 0);
            break;
        case 'fbm2D':
            pixels = A.Noise.fbm2D(w, h, values.scale || 1.0, values.octaves || 4, values.persistence || 0.5, values.seed || 0);
            break;
        case 'domainWarp2D':
            pixels = A.Noise.domainWarp2D(w, h, values.scale || 1.0, values.strength || 25, values.seed || 0);
            break;
        case 'multiWarp2D':
            pixels = A.Noise.multiWarp2D(w, h, values.scale || 1.0, values.strength || 25, values.seed || 0);
            break;
    }
    
    // Display result (if we got pixels back)
    if (pixels) {
        drawPixelsToCanvas(ctx, pixels, w, h);
    }
}

/**
 * Render sampling algorithms
 */
function renderSampling(algoId, ctx, canvas, values) {
    const A = window.Algorithms;
    const w = canvas.width;
    const h = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);
    
    // Call library function (black box)
    let points;
    switch (algoId) {
        case 'poissonDisk':
            points = A.Sampling.poissonDisk(w, h, values.radius || 18, values.seed || 0);
            break;
        case 'haltonSequence':
            points = A.Sampling.haltonSequence(values.count || 120, [2, 3]);
            // Scale to canvas size
            points = points.map(([u, v]) => [u * w, v * h]);
            break;
        case 'lloydRelaxation':
            points = A.Sampling.lloydRelaxation(/* initial points */, w, h, values.iterations || 5);
            break;
        case 'importanceSampling':
            const importanceFn = (x, y) => {
                const dx = x - w/2;
                const dy = y - h/2;
                const dist = Math.sqrt(dx*dx + dy*dy);
                return Math.max(0, 1 - dist/(w/2));
            };
            points = A.Sampling.importanceSampling(values.count || 120, w, h, importanceFn);
            break;
    }
    
    // Display result
    if (points) {
        drawPointsToCanvas(ctx, points);
    }
}

/**
 * Render pattern algorithms
 */
function renderPatterns(algoId, ctx, canvas, values) {
    const A = window.Algorithms;
    
    // Call library function (black box)
    switch (algoId) {
        case 'truchet':
            A.Patterns.truchet(ctx, canvas.width, canvas.height, values.gridSize || 24, values.seed || 42);
            break;
        // Other patterns not implemented yet - will show N/A via centralized check
    }
}

/**
 * Render space-filling curve algorithms
 */
function renderSpaceFilling(algoId, ctx, canvas, values) {
    const A = window.Algorithms;
    const order = values.order || 5;
    
    // Call library function (black box) → get curve points
    let curvePoints;
    switch (algoId) {
        case 'hilbert':
            curvePoints = A.SpaceFilling.HilbertCurve.generate(order);
            break;
        case 'peano':
            curvePoints = A.SpaceFilling.PeanoCurve.generate(order);
            break;
        case 'moore':
            curvePoints = A.SpaceFilling.MooreCurve.generate(order);
            break;
        case 'zOrder':
            curvePoints = A.SpaceFilling.ZOrderCurve.generate(order);
            break;
        case 'lSystem':
            curvePoints = A.SpaceFilling.LSystem.generate(values.axiom, values.rules, order);
            break;
    }
    
    // Display result
    if (curvePoints) {
        drawCurveToCanvas(ctx, canvas, curvePoints);
    }
}

/**
 * Render TSP algorithms
 */
function renderTSP(algoId, ctx, canvas, values) {
    const A = window.Algorithms;
    const w = canvas.width;
    const h = canvas.height;
    
    // Generate random points (input data)
    const pointCount = values.points || 80;
    const seed = values.seed || 0;
    const points = generateSeededPoints(pointCount, w, h, seed);
    
    // Call library function (black box) → get tour
    let tour;
    switch (algoId) {
        case 'nearestNeighbor':
            tour = A.TSP.nearestNeighbor(points);
            break;
        case 'twoOpt':
            const initialTour = A.TSP.nearestNeighbor(points);
            tour = A.TSP.twoOpt(points, initialTour);
            break;
        case 'christofides':
            tour = A.TSP.christofides(points);
            break;
    }
    
    // Display result
    if (tour) {
        drawTourToCanvas(ctx, canvas, points, tour);
    }
}

/**
 * Render distance field algorithms
 */
function renderDistance(algoId, ctx, canvas, values) {
    const A = window.Algorithms;
    const w = canvas.width;
    const h = canvas.height;
    
    if (algoId === 'jfa') {
        // Create seed mask (input data)
        const seedMask = createRandomSeedMask(w, h, values.seeds || 12);
        
        // Call library function (black box) → get distance field
        const distanceField = A.JFA.jumpFloodAlgorithm(seedMask, w, h);
        
        // Display result
        if (distanceField) {
            drawDistanceFieldToCanvas(ctx, canvas, distanceField);
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════
// DISPLAY UTILITIES - Canvas Drawing Only (No Algorithm Logic)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Draw pixel array to canvas (VGA palette)
 */
function drawPixelsToCanvas(ctx, pixels, w, h) {
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;
    
    for (let i = 0; i < pixels.length; i++) {
        const colorIndex = paletteIndex(pixels[i]);
        const color = VGA[colorIndex];
        const rgb = hexToRgb(color);
        
        data[i * 4] = rgb.r;
        data[i * 4 + 1] = rgb.g;
        data[i * 4 + 2] = rgb.b;
        data[i * 4 + 3] = 255;
    }
    
    ctx.putImageData(imageData, 0, 0);
}

/**
 * Draw point array to canvas
 */
function drawPointsToCanvas(ctx, points) {
    ctx.fillStyle = '#ffffff';
    points.forEach(([x, y]) => {
        ctx.fillRect(Math.floor(x) - 1, Math.floor(y) - 1, 3, 3);
    });
}

/**
 * Draw curve points to canvas
 */
function drawCurveToCanvas(ctx, canvas, points) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    points.forEach((p, i) => {
        const x = p.x * canvas.width;
        const y = p.y * canvas.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    
    ctx.stroke();
}

/**
 * Draw TSP tour to canvas
 */
function drawTourToCanvas(ctx, canvas, points, tour) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw tour path
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    tour.forEach((idx, i) => {
        const p = points[idx];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    });
    // Close tour
    if (tour.length) {
        const first = points[tour[0]];
        ctx.lineTo(first.x, first.y);
    }
    ctx.stroke();
    
    // Draw points
    ctx.fillStyle = '#ff0000';
    tour.forEach(idx => {
        const p = points[idx];
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    });
}

/**
 * Draw distance field to canvas (VGA palette)
 */
function drawDistanceFieldToCanvas(ctx, canvas, distanceField) {
    // Similar to drawPixelsToCanvas but with distance-specific coloring
    drawPixelsToCanvas(ctx, distanceField, canvas.width, canvas.height);
}

// ═══════════════════════════════════════════════════════════════════════
// HELPER UTILITIES - Data Generation (Not Algorithm Logic)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Generate seeded random points (input data for algorithms)
 */
function generateSeededPoints(count, w, h, seed) {
    const points = [];
    for (let i = 0; i < count; i++) {
        const x = (Math.sin(seed + i * 12.9898) * 43758.5453) % 1;
        const y = (Math.sin(seed + i * 78.233) * 43758.5453) % 1;
        points.push({ x: Math.abs(x) * w, y: Math.abs(y) * h });
    }
    return points;
}

/**
 * Create random seed mask (input data for JFA)
 */
function createRandomSeedMask(w, h, seedCount) {
    const mask = new Uint8Array(w * h);
    for (let i = 0; i < seedCount; i++) {
        const x = Math.floor(Math.random() * w);
        const y = Math.floor(Math.random() * h);
        mask[y * w + x] = 255;
    }
    return mask;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

