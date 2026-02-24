/**
 * MFP-QuantizeActions.js
 * 
 * All QUANTIZE tab logic - image loading, color quantization
 * NO DOM manipulation - pure logic only.
 * ZERO PLACEHOLDERS - ALL METHODS COMPLETE
 */

import { floydSteinberg } from '../../../shared/algorithms/dither/error-diffusion.js';
import { bayer4x4 } from '../../../shared/algorithms/dither/ordered.js';
import { nearestColorQuantize } from '../../../shared/algorithms/dither/nearest-color.js';
import { rgbToLab, hexToRgb, deltaE76 } from '../../../shared/algorithms/color/color-space.js';

const COLOR_SPACE = {
    rgbToLab: (r, g, b) => rgbToLab(r, g, b),
    hexToRgb: (hex) => hexToRgb(hex),
};

/**
 * Remove isolated pixels below min detail threshold.
 * Each pass replaces pixels whose current value matches none of their 4 neighbours.
 * @param {Uint16Array} map
 * @param {number} width
 * @param {number} height
 * @returns {Uint16Array}
 */
function applyMinDetailFilter(map, width, height) {
    const result = new Uint16Array(map);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            const cur = map[idx];
            const neighbours = [];
            if (x > 0)          neighbours.push(map[idx - 1]);
            if (x < width - 1)  neighbours.push(map[idx + 1]);
            if (y > 0)          neighbours.push(map[idx - width]);
            if (y < height - 1) neighbours.push(map[idx + width]);
            if (neighbours.length === 0 || neighbours.some(n => n === cur)) continue;
            // Isolated — replace with most common neighbour
            const freq = new Map();
            for (const n of neighbours) freq.set(n, (freq.get(n) || 0) + 1);
            let best = neighbours[0], bestF = 0;
            for (const [v, f] of freq) if (f > bestF) { bestF = f; best = v; }
            result[idx] = best;
        }
    }
    return result;
}

export class MFPQuantizeActions {
    constructor(sharedState) {
        this.state = sharedState;
    }
    
    /**
     * Load source image for quantization - COMPLETE
     */
    async loadSourceImage(file, toolBase) {
        if (!file) return;
        
        const img = new Image();
        img.onload = () => {
            this.state.sourceImageElement = img;
            
            // Feed image to adjustment bundle
            const adjustBundle = toolBase.components.get('imageAdjust');
            if (adjustBundle && typeof adjustBundle.setSourceImage === 'function') {
                // Convert image to ImageData
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = img.width;
                tempCanvas.height = img.height;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(img, 0, 0);
                const imageData = tempCtx.getImageData(0, 0, img.width, img.height);
                
                adjustBundle.setSourceImage(imageData);
                console.log('✅ Source image loaded into adjustment bundle');
            }
            
            toolBase.draw();
            toolBase.setValue('quantizeStatus', `✅ Source image loaded (${img.width}×${img.height}px)`);
        };
        img.onerror = (err) => {
            console.error('❌ Image load error:', err);
            toolBase.setValue('quantizeStatus', '❌ Failed to load image');
        };
        img.src = URL.createObjectURL(file);
    }
    
    /**
     * Quantize image using palette - stores SEQUENCE per pixel, not just RGB
     * This is critical: multiple sequences can produce similar colours, so we
     * must track which sequence was chosen for each pixel to generate STL correctly.
     */
    async quantize(values, toolBase) {
        if (!this.state.sourceImageElement && !this.state.sourceImageData) {
            toolBase.setValue('quantizeStatus', '❌ Load source image first');
            return;
        }
        if (!this.state.quantizationConfig) {
            toolBase.setValue('quantizeStatus', '❌ No palette available. Generate grid or analyze scan first.');
            return;
        }

        // Clear previous result immediately so canvas shows source while re-processing
        this.state.quantizedImageElement = null;
        this.state.quantizedImageData    = null;
        this.state.quantizedSequenceMap  = null;
        toolBase.draw();
        toolBase.setValue('quantizeStatus', '⏳ Quantizing…');

        try {
            const colorMap = this.state.quantizationConfig.colorMap;
            const sourceImg = this.state.sourceImageElement;

            // ── 1. Scale source to tile resolution ──────────────────────────
            // minDetail (mm) IS the tile size: 1 pixel = 1 tile = minDetail mm.
            // Fallback chain: minDetail setting → gridData.tileSize → 10mm.
            const minDetailMmRaw = parseFloat(values.minDetail);
            const tileSize = (minDetailMmRaw > 0)
                ? minDetailMmRaw
                : (this.state.gridData?.tileSize || this.state.referenceGridData?.tileSize || 10);
            const printWidthMm    = values.printWidth || 170;
            const printWidthTiles = Math.max(1, Math.round(printWidthMm / tileSize));

            let srcW, srcH;
            const srcCanvas = document.createElement('canvas');
            if (this.state.sourceImageData) {
                srcW = this.state.sourceImageData.width;
                srcH = this.state.sourceImageData.height;
                srcCanvas.width  = srcW;
                srcCanvas.height = srcH;
                srcCanvas.getContext('2d').putImageData(this.state.sourceImageData, 0, 0);
            } else {
                srcW = sourceImg.width;
                srcH = sourceImg.height;
                srcCanvas.width  = srcW;
                srcCanvas.height = srcH;
                srcCanvas.getContext('2d').drawImage(sourceImg, 0, 0);
            }

            const scale  = printWidthTiles / Math.max(srcW, srcH);
            const width  = Math.max(1, Math.round(srcW * scale));
            const height = Math.max(1, Math.round(srcH * scale));

            const scaledCanvas = document.createElement('canvas');
            scaledCanvas.width  = width;
            scaledCanvas.height = height;
            const scaledCtx = scaledCanvas.getContext('2d');
            scaledCtx.imageSmoothingEnabled = false;
            scaledCtx.drawImage(srcCanvas, 0, 0, width, height);
            const sourceData = scaledCtx.getImageData(0, 0, width, height);

            // ── 2. Build palette arrays required by shared dither API ────────
            const paletteHex  = colorMap.map(c => c.hex);
            const paletteLabs = colorMap.map(c => {
                const { r, g, b } = typeof c.rgb === 'object' && !Array.isArray(c.rgb)
                    ? c.rgb
                    : { r: c.rgb[0], g: c.rgb[1], b: c.rgb[2] };
                return rgbToLab(r, g, b);
            });

            // ── 3. Run dither algorithm ──────────────────────────────────────
            const algo = (values.ditherAlgorithm || 'None').toLowerCase();
            let dithered;
            if (algo === 'floyd-steinberg') {
                dithered = floydSteinberg(sourceData, paletteHex, paletteLabs, COLOR_SPACE);
            } else if (algo === 'bayer 4×4' || algo === 'bayer 4x4') {
                dithered = bayer4x4(sourceData, paletteHex, paletteLabs, COLOR_SPACE);
            } else {
                // 'None' or 'Blue Noise' (no texture available → nearest-color)
                dithered = nearestColorQuantize(sourceData, paletteHex, paletteLabs, COLOR_SPACE);
            }

            // ── 4. Map output pixels → palette indices (sequence map) ────────
            // Build RGB→index lookup; keys are "r,g,b" strings (exact after dither snap)
            const rgbToIdx = new Map();
            colorMap.forEach((c, i) => {
                const { r, g, b } = typeof c.rgb === 'object' && !Array.isArray(c.rgb)
                    ? c.rgb
                    : { r: c.rgb[0], g: c.rgb[1], b: c.rgb[2] };
                rgbToIdx.set(`${r},${g},${b}`, i);
            });

            const pixelCount  = width * height;
            let sequenceMap   = new Uint16Array(pixelCount);
            const dithData    = dithered.data;

            for (let p = 0; p < pixelCount; p++) {
                const i4  = p * 4;
                const key = `${dithData[i4]},${dithData[i4 + 1]},${dithData[i4 + 2]}`;
                sequenceMap[p] = rgbToIdx.get(key) ?? 0;
            }

            // ── 4.5 Form preference optimisation ────────────────────────────
            const reassigned = this._applyFormOptimisation(
                sequenceMap, width, height, paletteLabs, colorMap, values
            );

            // ── 4.6 Simplification ───────────────────────────────────────────
            const minCluster = parseInt(values.minimumClusterPx, 10) || 0;
            const merged     = this._mergeBelowThreshold(sequenceMap, width, height, minCluster);

            const smoothMethod = values.smoothingMethod || 'None';
            let   smoothed     = 0;
            if      (smoothMethod === 'Majority Vote 3×3')   smoothed = this._majorityVoteSmooth(sequenceMap, width, height, 3);
            else if (smoothMethod === 'Majority Vote 5×5')   smoothed = this._majorityVoteSmooth(sequenceMap, width, height, 5);
            else if (smoothMethod === 'Straighten Seams')    smoothed = this._straightenSeams(sequenceMap, width, height);
            else if (smoothMethod === 'Layer-Aware Cleanup') smoothed = this._layerAwareCleanup(sequenceMap, width, height, paletteLabs, colorMap, parseFloat(values.colourVariance) || 0);

            // ── 4.7 Perimeter:area filter ────────────────────────────────────
            const perimRatio  = parseFloat(values.perimAreaRatio)  || 0;
            const perimMaxPx  = parseInt(values.perimAreaMaxPx, 10) || 50;
            const perimFiltered = this._applyPerimeterAreaFilter(sequenceMap, width, height, perimRatio, perimMaxPx);

            // ── 4.8 Palette merging ──────────────────────────────────────────
            const palMergeThreshold = parseFloat(values.paletteMergeThreshold) || 0;
            const palMerged = this._mergePalettePairs(sequenceMap, paletteLabs, colorMap, palMergeThreshold);

            // ── 5. Min detail filter ─────────────────────────────────────────
            // When minDetail > tileSize, isolated pixels smaller than minDetail are removed.
            // Since tileSize IS minDetail here, this effectively just cleans stray single pixels.
            sequenceMap = applyMinDetailFilter(sequenceMap, width, height);

            // ── 6. Rebuild visual ImageData from (possibly filtered) map ─────
            const outputCanvas = document.createElement('canvas');
            outputCanvas.width  = width;
            outputCanvas.height = height;
            const outputCtx  = outputCanvas.getContext('2d');
            const outputData = outputCtx.createImageData(width, height);
            const usedSequences = new Set();

            for (let p = 0; p < pixelCount; p++) {
                const palIdx  = sequenceMap[p];
                const entry   = colorMap[palIdx];
                const { r, g, b } = typeof entry.rgb === 'object' && !Array.isArray(entry.rgb)
                    ? entry.rgb
                    : { r: entry.rgb[0], g: entry.rgb[1], b: entry.rgb[2] };
                const i4 = p * 4;
                outputData.data[i4]     = r;
                outputData.data[i4 + 1] = g;
                outputData.data[i4 + 2] = b;
                outputData.data[i4 + 3] = dithData[i4 + 3]; // preserve alpha
                usedSequences.add(palIdx);
            }
            outputCtx.putImageData(outputData, 0, 0);

            // ── 7. Store results ─────────────────────────────────────────────
            this.state.quantizedImageData    = outputData;
            this.state.quantizedSequenceMap  = { width, height, map: sequenceMap, palette: colorMap };

            this.state.quantizedImageElement = new Image();
            this.state.quantizedImageElement.onload = () => {
                toolBase.draw();
                const notes = [];
                if (reassigned    > 0) notes.push(`${reassigned}px optimised`);
                if (merged        > 0) notes.push(`${merged}px merged`);
                if (smoothed      > 0) notes.push(`${smoothed}px smoothed`);
                if (perimFiltered > 0) notes.push(`${perimFiltered}px perim-filtered`);
                if (palMerged     > 0) notes.push(`${palMerged}px pal-merged`);
                const noteStr = notes.length ? ` | ${notes.join(' | ')}` : '';
                toolBase.setValue('quantizeStatus',
                    `✅ ${width}×${height}px | ${usedSequences.size}/${colorMap.length} sequences | ${tileSize}mm/px | ${algo}${noteStr}`);
                console.log(`✅ Quantization complete: ${width}×${height}px, ${usedSequences.size} sequences used`);
            };
            this.state.quantizedImageElement.src = outputCanvas.toDataURL();

        } catch (err) {
            toolBase.setValue('quantizeStatus', `❌ Quantization failed: ${err.message}`);
            console.error('Quantization error:', err);
        }
    }
    
    /**
     * Export quantized image - COMPLETE
     */
    exportQuantizedImage(toolBase) {
        if (!this.state.quantizedImageElement) {
            toolBase.setValue('quantizeStatus', '❌ Quantize image first');
            return;
        }
        
        // Create canvas with quantized image
        const canvas = document.createElement('canvas');
        canvas.width = this.state.quantizedImageElement.width;
        canvas.height = this.state.quantizedImageElement.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.state.quantizedImageElement, 0, 0);
        
        // Export as PNG
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `quantized-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
            
            toolBase.setValue('quantizeStatus', '✅ Exported quantized image');
        });
    }
    
    /**
     * Post-quantization form preference optimisation.
     *
     * For each pixel, finds all palette entries within `colourVariance` ΔE76 of the
     * current assignment, then scores each by a weighted combination of:
     *   - colourScore  — closeness to the current dithered colour (primary)
     *   - groupScore   — fraction of already-assigned neighbours sharing this entry
     *   - layerScore   — normalised layer count (direction set by layerPreference)
     *
     * Score = (1 - groupingWeight) × colourScore
     *       + groupingWeight × (0.7 × groupScore + 0.3 × layerScore)
     *
     * Candidates are precomputed per palette entry so the per-pixel work is O(candidates).
     * The current assignment always appears first in the candidate list so strict `>`
     * comparison preserves it on ties (no change when all weights are 0).
     *
     * @param {Uint16Array} seqMap         - Modified in place
     * @param {number}      width
     * @param {number}      height
     * @param {Array}       paletteLabs    - {L,a,b} per palette entry (from rgbToLab)
     * @param {Array}       colorMap       - Palette entries with .sequence arrays
     * @param {Object}      values         - UI control values
     * @returns {number} Pixels reassigned
     */
    _applyFormOptimisation(seqMap, width, height, paletteLabs, colorMap, values) {
        const colourVariance  = Math.max(0, parseFloat(values.colourVariance)  || 0);
        const groupingWeight  = Math.min(1, Math.max(0, parseFloat(values.groupingWeight) || 0));
        const layerPreference = values.layerPreference || 'None';

        if (colourVariance === 0 && groupingWeight === 0) return 0;

        const palSize    = colorMap.length;
        const pixelCount = width * height;

        const layerCounts = colorMap.map(c =>
            c.sequence ? c.sequence.filter(v => v > 0).length : 0
        );
        const maxLayers = Math.max(1, ...layerCounts);

        // Precompute candidates within colourVariance for each palette entry.
        // Self (dE=0, colourScore=1.0) is always index 0 — strict `>` tiebreaker
        // preserves the current assignment when all form scores are equal.
        const candidatesFor = colorMap.map((_, i) => {
            const labI = paletteLabs[i];
            const list = [{ ci: i, colourScore: 1.0 }];
            if (colourVariance > 0) {
                for (let j = 0; j < palSize; j++) {
                    if (j === i) continue;
                    const dE = deltaE76(labI, paletteLabs[j]);
                    if (dE <= colourVariance) {
                        list.push({ ci: j, colourScore: 1 - dE / colourVariance });
                    }
                }
            }
            return list;
        });

        // Cross-layer grouping score: for each active layer in candidate ci, what
        // fraction of nbrIndices share the same filament on that layer?  Averaged
        // across all active layers.  Two different palette entries may agree on some
        // layers and differ on others — this joint score prevents optimising one
        // layer at the expense of others; a win on layer 1 that loses layer 2
        // and 3 registers as a net loss.
        const crossLayerScore = (ci, nbrIndices) => {
            const seq = colorMap[ci]?.sequence;
            if (!seq || seq.length === 0 || nbrIndices.length === 0) return 0;
            let total = 0, active = 0;
            for (let L = 0; L < seq.length; L++) {
                const myF = seq[L];
                if (!myF) continue;
                active++;
                let hits = 0;
                for (const ni of nbrIndices) {
                    const ns = colorMap[ni]?.sequence;
                    if (ns && ns[L] === myF) hits++;
                }
                total += hits / nbrIndices.length;
            }
            return active > 0 ? total / active : 0;
        };

        let totalReassigned = 0;

        // ── Phase 1: per-pixel greedy scan ───────────────────────────────────
        // Left and top neighbours propagate assignment choices as we scan.
        // groupScore uses crossLayerScore: two entries with identical filaments
        // on 3 of 4 layers score 0.75, not 0 — so partial agreement counts.
        for (let p = 0; p < pixelCount; p++) {
            const cands = candidatesFor[seqMap[p]];
            if (cands.length <= 1) continue;

            const x = p % width, y = Math.floor(p / width);
            const nbrs = [];
            if (x > 0) nbrs.push(seqMap[p - 1]);
            if (y > 0) nbrs.push(seqMap[p - width]);

            let bestIdx = seqMap[p], bestScore = -Infinity;

            for (const { ci, colourScore } of cands) {
                const groupScore = crossLayerScore(ci, nbrs);
                const normLen    = layerCounts[ci] / maxLayers;
                const layerScore = layerPreference === 'More Layers'  ?     normLen
                                 : layerPreference === 'Fewer Layers' ? 1 - normLen : 0;
                const formScore  = groupScore * 0.7 + layerScore * 0.3;
                const totalScore = (1 - groupingWeight) * colourScore
                                 + groupingWeight * formScore;
                if (totalScore > bestScore) { bestScore = totalScore; bestIdx = ci; }
            }

            if (bestIdx !== seqMap[p]) { seqMap[p] = bestIdx; totalReassigned++; }
        }

        // ── Phase 2: region consensus (flood-fill → per-region vote) ─────────
        // Skipped in Fast mode — Phase 1 alone is O(W×H×candidates).
        // Deep mode adds iterative flood-fill consensus: a 10×10 region with 10
        // candidates = 10 evaluations per pass, not 10^100.
        if (groupingWeight > 0 && values.analysisMode !== 'Fast') {
            const labels = new Int32Array(pixelCount);
            const stack  = [];
            let changed  = true;
            let pass     = 0;
            const MAX_PASSES = 4;

            while (changed && pass < MAX_PASSES) {
                changed = false;
                pass++;

                labels.fill(-1);
                const components = [];

                for (let start = 0; start < pixelCount; start++) {
                    if (labels[start] !== -1) continue;
                    const assignedIdx = seqMap[start];
                    const compId      = components.length;
                    const pixels      = [];
                    stack.length = 0;
                    stack.push(start);
                    while (stack.length > 0) {
                        const q = stack.pop();
                        if (labels[q] !== -1 || seqMap[q] !== assignedIdx) continue;
                        labels[q] = compId;
                        pixels.push(q);
                        const qx = q % width, qy = Math.floor(q / width);
                        if (qx > 0)          stack.push(q - 1);
                        if (qx < width  - 1) stack.push(q + 1);
                        if (qy > 0)          stack.push(q - width);
                        if (qy < height - 1) stack.push(q + width);
                    }
                    components.push({ pixels, currentIdx: assignedIdx });
                }

                for (const comp of components) {
                    const cands = candidatesFor[comp.currentIdx];
                    if (cands.length <= 1) continue;

                    // Collect palette indices of all external boundary neighbours.
                    // crossLayerScore then checks per-layer filament agreement against
                    // this set — not just whether the index matches.
                    const boundaryNbrs = [];
                    for (const p of comp.pixels) {
                        const px = p % width, py = Math.floor(p / width);
                        if (px > 0          && seqMap[p - 1]     !== comp.currentIdx) boundaryNbrs.push(seqMap[p - 1]);
                        if (px < width  - 1 && seqMap[p + 1]     !== comp.currentIdx) boundaryNbrs.push(seqMap[p + 1]);
                        if (py > 0          && seqMap[p - width]  !== comp.currentIdx) boundaryNbrs.push(seqMap[p - width]);
                        if (py < height - 1 && seqMap[p + width]  !== comp.currentIdx) boundaryNbrs.push(seqMap[p + width]);
                    }

                    let bestCi = comp.currentIdx, bestScore = -Infinity;

                    for (const { ci, colourScore } of cands) {
                        const groupScore = crossLayerScore(ci, boundaryNbrs);
                        const normLen    = layerCounts[ci] / maxLayers;
                        const layerScore = layerPreference === 'More Layers'  ?     normLen
                                         : layerPreference === 'Fewer Layers' ? 1 - normLen : 0;
                        const formScore  = groupScore * 0.7 + layerScore * 0.3;
                        const totalScore = (1 - groupingWeight) * colourScore
                                         + groupingWeight * formScore;
                        if (totalScore > bestScore) { bestScore = totalScore; bestCi = ci; }
                    }

                    if (bestCi !== comp.currentIdx) {
                        for (const p of comp.pixels) seqMap[p] = bestCi;
                        totalReassigned += comp.pixels.length;
                        changed = true;
                    }
                }
            }
        }

        return totalReassigned;
    }

    /**
     * Merge all connected components below minSize pixels into their most-contacted
     * boundary neighbour.  No colour-variance constraint — this is a cleanup step.
     * Iterates until convergence or MAX_PASSES safety cap.
     * Returns total number of pixels reassigned.
     */
    _mergeBelowThreshold(seqMap, width, height, minSize) {
        if (minSize <= 0) return 0;

        const pixelCount = width * height;
        const labels     = new Int32Array(pixelCount);
        const stack      = [];
        let totalMerged  = 0;
        let changed      = true;
        let pass         = 0;
        const MAX_PASSES = 30;

        while (changed && pass < MAX_PASSES) {
            changed = false;
            pass++;

            labels.fill(-1);
            const components = [];

            for (let start = 0; start < pixelCount; start++) {
                if (labels[start] !== -1) continue;
                const assignedIdx = seqMap[start];
                const compId      = components.length;
                const pixels      = [];
                stack.length = 0;
                stack.push(start);
                while (stack.length > 0) {
                    const q = stack.pop();
                    if (labels[q] !== -1 || seqMap[q] !== assignedIdx) continue;
                    labels[q] = compId;
                    pixels.push(q);
                    const qx = q % width, qy = Math.floor(q / width);
                    if (qx > 0)          stack.push(q - 1);
                    if (qx < width  - 1) stack.push(q + 1);
                    if (qy > 0)          stack.push(q - width);
                    if (qy < height - 1) stack.push(q + width);
                }
                components.push({ pixels, currentIdx: assignedIdx });
            }

            for (const comp of components) {
                if (comp.pixels.length >= minSize) continue;

                // Count boundary contact with each external component
                const contactCount = new Map();
                for (const p of comp.pixels) {
                    const px = p % width, py = Math.floor(p / width);
                    if (px > 0          && labels[p - 1]     !== labels[p]) contactCount.set(labels[p - 1],     (contactCount.get(labels[p - 1])     || 0) + 1);
                    if (px < width  - 1 && labels[p + 1]     !== labels[p]) contactCount.set(labels[p + 1],     (contactCount.get(labels[p + 1])     || 0) + 1);
                    if (py > 0          && labels[p - width]  !== labels[p]) contactCount.set(labels[p - width],  (contactCount.get(labels[p - width])  || 0) + 1);
                    if (py < height - 1 && labels[p + width]  !== labels[p]) contactCount.set(labels[p + width],  (contactCount.get(labels[p + width])  || 0) + 1);
                }

                if (contactCount.size === 0) continue;

                // Pick neighbour with most boundary contact; tie-break by component size
                let bestId = -1, bestContact = 0;
                for (const [cid, count] of contactCount) {
                    if (cid < 0) continue;
                    const rival = components[cid];
                    if (!rival) continue;
                    if (count > bestContact ||
                        (count === bestContact && rival.pixels.length > (bestId >= 0 ? components[bestId].pixels.length : 0))) {
                        bestContact = count;
                        bestId = cid;
                    }
                }

                if (bestId >= 0) {
                    const targetIdx = components[bestId].currentIdx;
                    for (const p of comp.pixels) seqMap[p] = targetIdx;
                    totalMerged += comp.pixels.length;
                    changed = true;
                }
            }
        }

        return totalMerged;
    }

    /**
     * Majority-vote smoothing: each pixel adopts the most common palette index
     * in its windowSize×windowSize neighbourhood.  Single pass, writes to a
     * temporary buffer then copies back.
     * Returns number of pixels changed.
     */
    _majorityVoteSmooth(seqMap, width, height, windowSize) {
        const half     = Math.floor(windowSize / 2);
        const output   = new Uint16Array(seqMap);
        const counts   = new Map();
        let   changed  = 0;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                counts.clear();
                let maxCount = 0;
                let maxIdx   = seqMap[y * width + x];

                for (let dy = -half; dy <= half; dy++) {
                    const ny = y + dy;
                    if (ny < 0 || ny >= height) continue;
                    for (let dx = -half; dx <= half; dx++) {
                        const nx = x + dx;
                        if (nx < 0 || nx >= width) continue;
                        const v = seqMap[ny * width + nx];
                        const c = (counts.get(v) || 0) + 1;
                        counts.set(v, c);
                        if (c > maxCount) { maxCount = c; maxIdx = v; }
                    }
                }

                output[y * width + x] = maxIdx;
                if (maxIdx !== seqMap[y * width + x]) changed++;
            }
        }

        seqMap.set(output);
        return changed;
    }

    /**
     * Eliminate checkerboard diagonal connections between regions.
     * Scans every 2×2 block; when the pattern is [A,B]/[B,A] or [B,A]/[A,B], both
     * diagonal pixels are resolved to the more common entry (tie-break: left-top wins).
     * O(W×H), single pass.  Returns number of pixels changed.
     */
    _straightenSeams(seqMap, width, height) {
        let changed = 0;
        for (let y = 0; y < height - 1; y++) {
            for (let x = 0; x < width - 1; x++) {
                const tl = y * width + x;
                const tr = tl + 1;
                const bl = tl + width;
                const br = bl + 1;
                const a = seqMap[tl], b = seqMap[tr], c = seqMap[bl], d = seqMap[br];
                // Checkerboard: top-left == bottom-right != top-right == bottom-left
                if (a === d && b === c && a !== b) {
                    // Resolve to a (top-left wins)
                    if (seqMap[tr] !== a) { seqMap[tr] = a; changed++; }
                    if (seqMap[bl] !== a) { seqMap[bl] = a; changed++; }
                }
            }
        }
        return changed;
    }

    /**
     * Per-pixel, per-layer isolated filament check.
     * If a pixel's filament on any active layer is completely surrounded on all 4 sides
     * by a different filament on that layer, search for an alternative palette entry
     * within colourVariance that improves cross-layer neighbour agreement.
     * Uses the same crossLayerScore logic as form optimisation.
     * Returns number of pixels reassigned.
     */
    _layerAwareCleanup(seqMap, width, height, paletteLabs, colorMap, colourVariance) {
        if (colourVariance <= 0) return 0;

        const palSize    = colorMap.length;
        const pixelCount = width * height;
        let   changed    = 0;

        for (let p = 0; p < pixelCount; p++) {
            const ci  = seqMap[p];
            const seq = colorMap[ci]?.sequence;
            if (!seq || seq.length === 0) continue;

            const px = p % width, py = Math.floor(p / width);
            const nbrs = [];
            if (px > 0)          nbrs.push(p - 1);
            if (px < width  - 1) nbrs.push(p + 1);
            if (py > 0)          nbrs.push(p - width);
            if (py < height - 1) nbrs.push(p + width);
            if (nbrs.length === 0) continue;

            // Check if isolated on any active layer
            let isolatedOnAnyLayer = false;
            for (let L = 0; L < seq.length; L++) {
                const myF = seq[L];
                if (!myF) continue;
                const allDiffer = nbrs.every(n => {
                    const ns = colorMap[seqMap[n]]?.sequence;
                    return !ns || ns[L] !== myF;
                });
                if (allDiffer) { isolatedOnAnyLayer = true; break; }
            }
            if (!isolatedOnAnyLayer) continue;

            // Find best alternative within colourVariance via cross-layer score
            const refLab   = paletteLabs[ci];
            const nbrIdxs  = nbrs.map(n => seqMap[n]);
            let bestAlt    = -1;
            let bestScore  = 0; // must beat baseline of 0 to switch

            for (let j = 0; j < palSize; j++) {
                if (j === ci) continue;
                const dE = deltaE76(refLab, paletteLabs[j]);
                if (dE > colourVariance) continue;

                const altSeq = colorMap[j]?.sequence;
                if (!altSeq) continue;

                // Cross-layer score against neighbours
                let total = 0, active = 0;
                for (let L = 0; L < altSeq.length; L++) {
                    const altF = altSeq[L];
                    if (!altF) continue;
                    active++;
                    let hits = 0;
                    for (const ni of nbrIdxs) {
                        const ns = colorMap[ni]?.sequence;
                        if (ns && ns[L] === altF) hits++;
                    }
                    total += hits / nbrIdxs.length;
                }
                const score = active > 0 ? total / active : 0;
                if (score > bestScore) { bestScore = score; bestAlt = j; }
            }

            if (bestAlt >= 0) { seqMap[p] = bestAlt; changed++; }
        }

        return changed;
    }

    /**
     * Merge connected components whose perimeter:area ratio exceeds maxRatio AND whose
     * area is <= maxAreaPx.  High ratio = jagged/irregular region.
     * Perimeter of a component: each pixel contributes (4 - same-neighbour-count) edges.
     * Merge target: most-contacted boundary neighbour (same rule as _mergeBelowThreshold).
     * Iterates until convergence.  Returns total pixels reassigned.
     */
    _applyPerimeterAreaFilter(seqMap, width, height, maxRatio, maxAreaPx) {
        if (maxRatio <= 0) return 0;

        const pixelCount = width * height;
        const labels     = new Int32Array(pixelCount);
        const stack      = [];
        let totalFiltered = 0;
        let changed       = true;
        let pass          = 0;
        const MAX_PASSES  = 20;

        while (changed && pass < MAX_PASSES) {
            changed = false;
            pass++;
            labels.fill(-1);
            const components = [];

            for (let start = 0; start < pixelCount; start++) {
                if (labels[start] !== -1) continue;
                const assignedIdx = seqMap[start];
                const compId      = components.length;
                const pixels      = [];
                stack.length = 0;
                stack.push(start);
                while (stack.length > 0) {
                    const q = stack.pop();
                    if (labels[q] !== -1 || seqMap[q] !== assignedIdx) continue;
                    labels[q] = compId;
                    pixels.push(q);
                    const qx = q % width, qy = Math.floor(q / width);
                    if (qx > 0)          stack.push(q - 1);
                    if (qx < width  - 1) stack.push(q + 1);
                    if (qy > 0)          stack.push(q - width);
                    if (qy < height - 1) stack.push(q + width);
                }
                // Compute perimeter: sum of exposed edges per pixel
                let perimeter = 0;
                for (const p of pixels) {
                    const px = p % width, py = Math.floor(p / width);
                    if (px === 0          || seqMap[p - 1]    !== assignedIdx) perimeter++;
                    if (px === width  - 1 || seqMap[p + 1]    !== assignedIdx) perimeter++;
                    if (py === 0          || seqMap[p - width] !== assignedIdx) perimeter++;
                    if (py === height - 1 || seqMap[p + width] !== assignedIdx) perimeter++;
                }
                components.push({ pixels, currentIdx: assignedIdx, perimeter });
            }

            for (const comp of components) {
                const area  = comp.pixels.length;
                const ratio = comp.perimeter / area;
                if (ratio <= maxRatio || area > maxAreaPx) continue;

                // Count boundary contact per neighbour component
                const contactCount = new Map();
                for (const p of comp.pixels) {
                    const px = p % width, py = Math.floor(p / width);
                    if (px > 0          && labels[p - 1]     !== labels[p]) contactCount.set(labels[p - 1],     (contactCount.get(labels[p - 1])     || 0) + 1);
                    if (px < width  - 1 && labels[p + 1]     !== labels[p]) contactCount.set(labels[p + 1],     (contactCount.get(labels[p + 1])     || 0) + 1);
                    if (py > 0          && labels[p - width]  !== labels[p]) contactCount.set(labels[p - width],  (contactCount.get(labels[p - width])  || 0) + 1);
                    if (py < height - 1 && labels[p + width]  !== labels[p]) contactCount.set(labels[p + width],  (contactCount.get(labels[p + width])  || 0) + 1);
                }
                if (contactCount.size === 0) continue;

                let bestId = -1, bestContact = 0;
                for (const [cid, count] of contactCount) {
                    if (cid < 0) continue;
                    const rival = components[cid];
                    if (!rival) continue;
                    if (count > bestContact ||
                        (count === bestContact && rival.pixels.length > (bestId >= 0 ? components[bestId].pixels.length : 0))) {
                        bestContact = count;
                        bestId = cid;
                    }
                }

                if (bestId >= 0) {
                    const targetIdx = components[bestId].currentIdx;
                    for (const p of comp.pixels) seqMap[p] = targetIdx;
                    totalFiltered += comp.pixels.length;
                    changed = true;
                }
            }
        }

        return totalFiltered;
    }

    /**
     * Merge visually near-identical palette entries using union-find.
     * All pairs with ΔE76 < mergeThreshold are grouped transitively.
     * Within each group the entry with the most pixels wins; losers reassign to winner.
     * Returns number of pixels reassigned.
     */
    _mergePalettePairs(seqMap, paletteLabs, colorMap, mergeThreshold) {
        if (mergeThreshold <= 0) return 0;

        const palSize    = colorMap.length;
        const pixelCount = seqMap.length;

        // Union-find
        const parent = Array.from({ length: palSize }, (_, i) => i);
        const find   = i => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
        const union  = (a, b) => { parent[find(a)] = find(b); };

        for (let i = 0; i < palSize; i++) {
            for (let j = i + 1; j < palSize; j++) {
                if (deltaE76(paletteLabs[i], paletteLabs[j]) < mergeThreshold) union(i, j);
            }
        }

        // Count pixels per palette entry
        const counts = new Int32Array(palSize);
        for (let p = 0; p < pixelCount; p++) counts[seqMap[p]]++;

        // Per group, find winner (most pixels)
        const groupWinner = new Int32Array(palSize).fill(-1);
        for (let i = 0; i < palSize; i++) {
            const root = find(i);
            if (groupWinner[root] === -1 || counts[i] > counts[groupWinner[root]]) {
                groupWinner[root] = i;
            }
        }

        // Build per-entry redirect
        const redirect = Array.from({ length: palSize }, (_, i) => groupWinner[find(i)]);

        let reassigned = 0;
        for (let p = 0; p < pixelCount; p++) {
            const target = redirect[seqMap[p]];
            if (target !== -1 && target !== seqMap[p]) { seqMap[p] = target; reassigned++; }
        }
        return reassigned;
    }

    /**
     * Load palette from JSON file (calibration-palette.json)
     * Format: { version, type, filaments, colorMap: [{name, rgb, hex, sequence, ...}] }
     */
    async loadPaletteFromJSON(file, toolBase) {
        if (!file) return;
        
        try {
            toolBase.setValue('paletteStatus', '⏳ Loading palette...');
            
            const text = await file.text();
            const data = JSON.parse(text);
            
            // Validate required fields
            if (!data.colors && !data.colorMap) {
                throw new Error('Invalid palette format: missing colors or colorMap');
            }
            
            // Support both formats (calibration-palette.json uses "colors", quantization-config uses "colorMap")
            const colors = data.colors || data.colorMap;
            
            // Convert to quantization config format
            this.state.quantizationConfig = {
                version: data.version || '1.0.0',
                type: data.type || 'imported',
                generatedAt: data.generatedAt || new Date().toISOString(),
                paletteName: data.paletteName || (data.filaments?.map(f => f.name).join('')) || 'Imported',
                filaments: data.filaments || [],
                layerCount: data.layerCount || colors[0]?.sequence?.length || 4,
                baseLayers: data.baseLayers || 0,
                topLayers: data.topLayers || 0,
                colorMap: colors.map(c => ({
                    name: c.sequenceStr || c.name || c.sequence?.join(''),
                    rgb: Array.isArray(c.rgb) ? { r: c.rgb[0], g: c.rgb[1], b: c.rgb[2] } : c.rgb,
                    hex: c.hex,
                    sequence: c.sequence,
                    filamentStack: c.filamentStack || null,
                    tileCount: c.tileCount || 1,
                    deviation: c.deviation || null
                })),
                tileData: data.tileData || null
            };
            
            const colorCount = this.state.quantizationConfig.colorMap.length;
            toolBase.setValue('paletteStatus', `✅ Palette loaded: ${colorCount} colours (${this.state.quantizationConfig.type})`);
            console.log(`✅ Palette loaded from JSON: ${colorCount} colours`);
            
        } catch (err) {
            console.error('❌ Palette load error:', err);
            toolBase.setValue('paletteStatus', `❌ Failed to load palette: ${err.message}`);
        }
    }
}

