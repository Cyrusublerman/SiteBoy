/**
 * Blue Noise Dithering — Nearest + Opposite (Checked) Strategy
 * 
 * Implements geometric bracketing dithering strategy using blue noise texture.
 * Determines whether to use solid color or 2-color dithering based on whether
 * the target color is geometrically "bracketed" by two palette colors in LAB space.
 * 
 * @module algorithms/dither/blue-noise-bracketing
 * @source reference/tools/New folder/colour3/src/script.js
 * @wikipedia https://en.wikipedia.org/wiki/Dither#Digital_photography_and_image_processing
 * @formula Bracketing check: project target O onto segment P1-P2, compare dist(O,M) < dist(O,P1)
 */

import {
    deltaE76,
    vecDot,
    vecSub,
    vecAdd,
    vecScale,
    vecMagSq
} from '../color/color-space.js';

/**
 * Find nearest color in palette (by Delta E in LAB space)
 * 
 * @param {{L: number, a: number, b: number}} targetLab - Target color in LAB
 * @param {Array<{L: number, a: number, b: number}>} paletteLabs - Palette in LAB space
 * @returns {number} Index of nearest color
 * 
 * @example
 * const idx = pickNearestInPalette(targetLab, paletteLabs); // 3
 */
export function pickNearestInPalette(targetLab, paletteLabs) {
    let bestDist = Infinity;
    let bestIdx = 0;
    
    if (!targetLab || !paletteLabs || paletteLabs.length === 0) return 0;

    for (let i = 0; i < paletteLabs.length; i++) {
        const labP = paletteLabs[i];
        if (!labP) continue;
        
        const d = deltaE76(targetLab, labP);
        if (d < bestDist) {
            bestDist = d;
            bestIdx = i;
            if (d < 0.001) break; // Perfect match
        }
    }
    
    return bestIdx;
}

/**
 * Find color most directionally opposite to closest color
 * 
 * Finds palette color that forms largest angle with target→closest vector.
 * Used for 2-color dithering when bracketing is beneficial.
 * 
 * @param {{L: number, a: number, b: number}} targetO_lab - Target color
 * @param {number} closestC_idx - Index of closest color
 * @param {Array<{L: number, a: number, b: number}>} paletteLabs - Palette in LAB
 * @returns {number} Index of opposite color, or -1 if none found
 * 
 * @example
 * const oppositeIdx = findOppositeColor(targetLab, 0, paletteLabs); // 7
 */
export function findOppositeColor(targetO_lab, closestC_idx, paletteLabs) {
    if (paletteLabs.length < 2) return -1;

    const labC = paletteLabs[closestC_idx];
    if (!labC) return -1;

    const vecOC = vecSub(labC, targetO_lab);
    const magSqOC = vecMagSq(vecOC);

    // If target extremely close to C, no meaningful "opposite"
    if (magSqOC < 1e-9) return -1;

    let oppositeIdx = -1;
    let minCosAngle = 1.0; // Cosine range [-1, 1], min = max angle (180°)
    const magOC = Math.sqrt(magSqOC);

    for (let k = 0; k < paletteLabs.length; k++) {
        if (k === closestC_idx) continue;

        const labK = paletteLabs[k];
        if (!labK) continue;

        const vecOk = vecSub(labK, targetO_lab);
        const magSqOk = vecMagSq(vecOk);

        if (magSqOk < 1e-9) continue;

        const magOk = Math.sqrt(magSqOk);
        const denominator = magOC * magOk;
        if (denominator < 1e-9) continue;

        const cosAngle = vecDot(vecOC, vecOk) / denominator;
        const clampedCosAngle = Math.max(-1.0, Math.min(1.0, cosAngle));

        if (clampedCosAngle < minCosAngle) {
            minCosAngle = clampedCosAngle;
            oppositeIdx = k;
        }
    }

    // Ensure we found a different index
    if (oppositeIdx === closestC_idx) return -1;

    return oppositeIdx;
}

/**
 * Project point onto line segment
 * 
 * Finds closest point M on segment P1-P2 to point O.
 * Used for geometric bracketing check.
 * 
 * @param {{L: number, a: number, b: number}} pointO - Point to project
 * @param {{L: number, a: number, b: number}} segP1 - Segment start
 * @param {{L: number, a: number, b: number}} segP2 - Segment end
 * @returns {{pointM: {L, a, b}, weightP1: number}} Closest point and weight for P1
 * 
 * @formula M = P1 + t(P2-P1), where t = clamp(dot(O-P1, P2-P1) / ||P2-P1||², 0, 1)
 * 
 * @example
 * const {pointM, weightP1} = projectOntoSegment(target, color1, color2);
 * // weightP1 = 0.7 means 70% color1, 30% color2
 */
export function projectOntoSegment(pointO, segP1, segP2) {
    const vecV = vecSub(segP2, segP1); // Vector P1 → P2
    const vecW = vecSub(pointO, segP1); // Vector P1 → O
    const dotVV = vecMagSq(vecV);

    // P1 and P2 are essentially the same point
    if (dotVV < 1e-9) {
        return { pointM: segP1, weightP1: 1.0 };
    }

    const dotWV = vecDot(vecW, vecV);
    // t = projection factor onto infinite line P1P2 (0=P1, 1=P2)
    const t = dotWV / dotVV;
    const t_clamped = Math.max(0.0, Math.min(1.0, t)); // Clamp to segment [0, 1]

    // Closest point M = P1 + t_clamped * V
    const pointM = vecAdd(segP1, vecScale(vecV, t_clamped));
    const weightP1 = 1.0 - t_clamped; // Weight for P1

    return { pointM, weightP1 };
}

/**
 * Determine dithering strategy for a single pixel
 * 
 * Uses geometric bracketing to decide between solid color or 2-color dithering.
 * If the line segment between closest and opposite color gets closer to the target
 * than the closest color alone, dithering is beneficial.
 * 
 * @param {{L: number, a: number, b: number}} originalLab - Original pixel color
 * @param {Array<{L: number, a: number, b: number}>} paletteLabs - Palette in LAB
 * @returns {{type: 'solid'|'dither', idx1: number, idx2?: number, weight1?: number}}
 * 
 * @example
 * const strategy = findDitherStrategy(pixelLab, paletteLabs);
 * if (strategy.type === 'dither') {
 *     // Use blue noise to choose between idx1 and idx2 based on weight1
 * }
 */
export function findDitherStrategy(originalLab, paletteLabs) {
    if (!paletteLabs || paletteLabs.length === 0) {
        console.warn("Strategy: Empty palette received.");
        return { type: 'solid', idx1: 0 };
    }

    // 1. Find Closest (C)
    const idxC = pickNearestInPalette(originalLab, paletteLabs);
    const labC = paletteLabs[idxC];
    if (!labC) {
        console.warn("Strategy: Closest color invalid.");
        return { type: 'solid', idx1: 0 };
    }
    const distC = deltaE76(originalLab, labC);

    // 2. Handle perfect match or single color palette
    if (distC < 0.001 || paletteLabs.length < 2) {
        return { type: 'solid', idx1: idxC };
    }

    // 3. Find Most Opposite (I)
    const idxI = findOppositeColor(originalLab, idxC, paletteLabs);

    // 4. If no valid opposite found, use solid C
    if (idxI === -1) {
        return { type: 'solid', idx1: idxC };
    }
    
    const labI = paletteLabs[idxI];
    if (!labI) {
        console.warn("Strategy: Opposite color invalid.");
        return { type: 'solid', idx1: idxC };
    }

    // 5. Perform Bracketing Check (Find closest point M on segment CI to O)
    const { pointM, weightP1: weightC } = projectOntoSegment(originalLab, labC, labI);
    const distM = deltaE76(originalLab, pointM);

    // 6. Compare and Decide
    if (distM < distC) {
        // Dithering C and I is beneficial
        return {
            type: 'dither',
            idx1: idxC,
            idx2: idxI,
            weight1: Math.max(0, Math.min(1, weightC))
        };
    } else {
        // Solid C is better or equal
        return { type: 'solid', idx1: idxC };
    }
}

/**
 * Apply blue noise dithering with Nearest + Opposite (Checked) strategy
 * 
 * For each pixel:
 * 1. Find closest palette color (C)
 * 2. Find most opposite color (I)
 * 3. Check if bracketing (dithering C and I) improves accuracy
 * 4. If yes, use blue noise threshold to choose between C and I
 * 5. If no, use solid C
 * 
 * @param {ImageData} imageData - Source image
 * @param {string[]} palette - Hex color palette
 * @param {Array<{L: number, a: number, b: number}>} paletteLabs - Palette in LAB space
 * @param {ImageData} blueNoiseTextureData - Blue noise texture (grayscale)
 * @param {Object} colorSpace - Color space converter with hexToRgb method
 * @returns {ImageData} Dithered image
 * 
 * @example
 * const dithered = ditherBlueNoiseBracketing(
 *     imageData,
 *     ['#000000', '#FFFFFF'],
 *     paletteLabs,
 *     blueNoiseTexture,
 *     colorSpace
 * );
 */
export function ditherBlueNoiseBracketing(
    imageData,
    palette,
    paletteLabs,
    blueNoiseTextureData,
    colorSpace
) {
    const { width, height, data } = imageData;
    
    if (!blueNoiseTextureData) {
        console.warn("Blue noise texture missing. Cannot apply blue noise dithering.");
        return imageData;
    }

    const { width: bnWidth, height: bnHeight, data: bnData } = blueNoiseTextureData;
    const output = new Uint8ClampedArray(data.length);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i4 = (y * width + x) * 4;
            const r = data[i4], g = data[i4 + 1], b = data[i4 + 2], a = data[i4 + 3];
            const originalLab = colorSpace.rgbToLab(r, g, b);

            // Determine strategy for this pixel
            const strategy = findDitherStrategy(originalLab, paletteLabs);

            let chosenIdx;

            if (strategy.type === 'solid') {
                chosenIdx = strategy.idx1;
            } else {
                // type === 'dither'
                // Get blue noise value (tiled)
                const bnX = x % bnWidth;
                const bnY = y % bnHeight;
                const bnIndex = (bnY * bnWidth + bnX) * 4;
                const bnValue = bnData[bnIndex] / 255.0; // Use Red channel, normalize to [0,1]

                // Threshold using calculated weight for P1 (closest color C)
                chosenIdx = (bnValue < strategy.weight1) ? strategy.idx1 : strategy.idx2;
            }

            // Safety check for chosen index
            if (chosenIdx < 0 || chosenIdx >= palette.length) {
                console.error(`Invalid chosen index ${chosenIdx} at (${x},${y}). Defaulting to 0.`);
                chosenIdx = 0;
            }

            // Get output color RGB
            const { r: qr, g: qg, b: qb } = colorSpace.hexToRgb(palette[chosenIdx]);
            output[i4] = qr;
            output[i4 + 1] = qg;
            output[i4 + 2] = qb;
            output[i4 + 3] = a;
        }
    }

    return new ImageData(output, width, height);
}

