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

    /** Yield to the event loop so the browser can repaint between heavy steps. */
    _yield() { return new Promise(r => setTimeout(r, 0)); }

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
        toolBase.setValue('quantizeStatus', '⏳ [1/6] Scaling image…');
        await this._yield();

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

            // ── 2. Build colour space + palette ──────────────────────────────
            const { buildColorSpace } = await import('../../../shared/algorithms/color/color-space.js');
            const spaceName = (values.colourSpace || 'CIELAB').toLowerCase();
            const spaceKey  = spaceName === 'rgb' ? 'rgb' : spaceName === 'hsl' ? 'hsl' : 'lab';
            const cs = buildColorSpace(spaceKey, {
                w1: parseFloat(values.csWeight1) || 1,
                w2: parseFloat(values.csWeight2) || 1,
                w3: parseFloat(values.csWeight3) || 1,
            });

            const paletteHex  = colorMap.map(c => c.hex);
            const paletteConverted = colorMap.map(c => {
                const { r, g, b } = typeof c.rgb === 'object' && !Array.isArray(c.rgb)
                    ? c.rgb
                    : { r: c.rgb[0], g: c.rgb[1], b: c.rgb[2] };
                return cs.convert(r, g, b);
            });

            // paletteLabs still needed for form optimisation (always CIELAB)
            const paletteLabs = colorMap.map(c => {
                const { r, g, b } = typeof c.rgb === 'object' && !Array.isArray(c.rgb)
                    ? c.rgb
                    : { r: c.rgb[0], g: c.rgb[1], b: c.rgb[2] };
                return rgbToLab(r, g, b);
            });

            // ── 3. Run dither algorithm ──────────────────────────────────────
            toolBase.setValue('quantizeStatus', `⏳ [2/6] Dithering (${spaceKey.toUpperCase()})…`);
            await this._yield();
            const algo = (values.ditherAlgorithm || 'None').toLowerCase();
            let dithered;
            if (algo === 'floyd-steinberg') {
                dithered = floydSteinberg(sourceData, paletteHex, paletteConverted, cs);
            } else if (algo === 'bayer 4×4' || algo === 'bayer 4x4') {
                dithered = bayer4x4(sourceData, paletteHex, paletteConverted, cs);
            } else {
                dithered = nearestColorQuantize(sourceData, paletteHex, paletteConverted, cs);
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
            const mode = values.analysisMode || 'Fast';
            toolBase.setValue('quantizeStatus', `⏳ [3/6] Optimising (${mode})…`);
            await this._yield();
            const reassigned = await this._applyFormOptimisation(
                sequenceMap, width, height, paletteLabs, colorMap, values
            );

            // ── 4.6 Simplification (topological only — geometry smoothing
            //        is handled in the STL contour pipeline) ──────────────────
            toolBase.setValue('quantizeStatus', '⏳ [4/6] Simplifying…');
            await this._yield();

            const minCluster = parseInt(values.minimumClusterPx, 10) || 0;
            const merged     = await this._mergeBelowThreshold(sequenceMap, width, height, minCluster);

            // ── 4.7 Palette merging ──────────────────────────────────────────
            const palMergeThreshold = parseFloat(values.paletteMergeThreshold) || 0;
            const palMerged = this._mergePalettePairs(sequenceMap, paletteLabs, colorMap, palMergeThreshold);

            // ── 5. Min detail filter ─────────────────────────────────────────
            toolBase.setValue('quantizeStatus', '⏳ [5/6] Filtering detail…');
            await this._yield();
            sequenceMap = applyMinDetailFilter(sequenceMap, width, height);

            // ── 6. Rebuild visual ImageData from (possibly filtered) map ─────
            toolBase.setValue('quantizeStatus', '⏳ [6/6] Rendering…');
            await this._yield();
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

            // Palette analysis: count unique RGB colours
            const uniqueRgb = new Set();
            colorMap.forEach(c => {
                const { r, g, b } = typeof c.rgb === 'object' && !Array.isArray(c.rgb)
                    ? c.rgb : { r: c.rgb[0], g: c.rgb[1], b: c.rgb[2] };
                uniqueRgb.add(`${r},${g},${b}`);
            });
            const duplicateSeqs = colorMap.length - uniqueRgb.size;

            this.state.quantizedImageElement = new Image();
            this.state.quantizedImageElement.onload = () => {
                toolBase.draw();
                const notes = [];
                notes.push(`${uniqueRgb.size} unique RGB`);
                if (duplicateSeqs > 0) notes.push(`${duplicateSeqs} duplicate colours`);
                if (reassigned    > 0) notes.push(`${reassigned}px optimised`);
                if (merged        > 0) notes.push(`${merged}px merged`);
                if (palMerged     > 0) notes.push(`${palMerged}px pal-merged`);
                const noteStr = notes.length ? ` | ${notes.join(' | ')}` : '';
                toolBase.setValue('quantizeStatus',
                    `✅ ${width}×${height}px | ${usedSequences.size}/${colorMap.length} seq | ${tileSize}mm/px | ${algo}${noteStr}`);
            };
            this.state.quantizedImageElement.src = outputCanvas.toDataURL();

            // Store analysis metadata for the composite view
            this.state.quantizeAnalysisMeta = {
                width, height, tileSize, algo, usedCount: usedSequences.size,
                totalSeqs: colorMap.length, uniqueRgbCount: uniqueRgb.size,
                duplicateSeqs, reassigned, merged, palMerged,
                colourSpace: spaceKey.toUpperCase(),
                weights: { w1: parseFloat(values.csWeight1) || 1, w2: parseFloat(values.csWeight2) || 1, w3: parseFloat(values.csWeight3) || 1 },
            };

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
    async _applyFormOptimisation(seqMap, width, height, paletteLabs, colorMap, values) {
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
                await this._yield();

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
    async _mergeBelowThreshold(seqMap, width, height, minSize) {
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
            await this._yield();

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

    // Pixel-domain smoothing methods (Majority Vote, Straighten Seams,
    // Layer-Aware Cleanup, Perimeter:Area filter) were removed.
    // Boundary smoothing is now handled in the STL contour pipeline
    // (marching squares → Douglas-Peucker → Chaikin) where sub-pixel
    // geometry is available and the pixel-grid constraint does not apply.

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

    // ─────────────────────────────────────────────────────────────────────────
    // ANALYSIS IMAGE EXPORT
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Build and download a composite PNG showing the source image, quantised image,
     * palette, per-layer filament maps (holes highlighted in red), and quality stats.
     */
    async exportAnalysisImage(values, toolBase) {
        const qsm = this.state.quantizedSequenceMap;
        if (!qsm) {
            toolBase.setValue('quantizeStatus', '❌ Quantise image first');
            return;
        }
        try {
            toolBase.setValue('quantizeStatus', '⏳ Computing layer maps for analysis…');
            await this._yield();
            const { layerData, maxLayers, filamentCount, filamentColours } =
                this._computeLayerMapsInt(qsm);

            toolBase.setValue('quantizeStatus', '⏳ Analysing layer quality…');
            await this._yield();
            const analysis = this._analyseLayerQuality(layerData, maxLayers, qsm.width, qsm.height);

            toolBase.setValue('quantizeStatus', '⏳ Rendering analysis image…');
            await this._yield();
            const canvas = this._renderAnalysisCanvas({
                qsm, layerData, maxLayers, filamentCount, filamentColours, analysis, values,
                sourceImg:    this.state.sourceImageElement,
                quantisedImg: this.state.quantizedImageElement,
                filaments:    this.state.quantizationConfig?.filaments || [],
            });

            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a   = document.createElement('a');
                a.href     = url;
                a.download = `quantize-analysis-${Date.now()}.png`;
                a.click();
                URL.revokeObjectURL(url);
            }, 'image/png');

            const issues = analysis.reduce((s, l) => s + l.holes + l.thinStrips, 0);
            toolBase.setValue('quantizeStatus',
                `✅ Analysis downloaded | ${maxLayers} layers | ${issues > 0 ? issues + ' issues found' : 'no issues'}`);

        } catch (err) {
            toolBase.setValue('quantizeStatus', `❌ Analysis failed: ${err.message}`);
            console.error('Analysis error:', err);
        }
    }

    /**
     * Expand the Uint16Array sequence map into per-layer integer pixel maps.
     * layerData[L] = Uint8Array(width*height): 0 = no filament, 1..N = filament index (1-based).
     */
    _computeLayerMapsInt({ width, height, map, palette }) {
        let maxLayers = 0, maxFilament = 0;
        for (const entry of palette) {
            const seq = entry.sequence || [];
            maxLayers   = Math.max(maxLayers,   seq.filter(v => v > 0).length);
            for (const v of seq) if (v > maxFilament) maxFilament = v;
        }
        if (maxLayers === 0) maxLayers = 1;
        const filamentCount = maxFilament;
        const pixelCount    = width * height;

        const layerData = Array.from({ length: maxLayers }, () => new Uint8Array(pixelCount));

        for (let p = 0; p < pixelCount; p++) {
            const seq = palette[map[p]]?.sequence;
            if (!seq) continue;
            let li = 0;
            for (const filRef of seq) {
                if (filRef > 0) { layerData[li][p] = filRef; li++; }
                if (li >= maxLayers) break;
            }
        }

        // Derive display colour for each filament (1-based index)
        const filaments = this.state.quantizationConfig?.filaments || [];
        const filamentColours = [];
        for (let fi = 1; fi <= filamentCount; fi++) {
            const fil = filaments[fi - 1];
            if (fil?.hex) {
                filamentColours.push({
                    r: parseInt(fil.hex.slice(1, 3), 16),
                    g: parseInt(fil.hex.slice(3, 5), 16),
                    b: parseInt(fil.hex.slice(5, 7), 16),
                    name: fil.name || fil.n || `F${fi}`
                });
            } else {
                let rS = 0, gS = 0, bS = 0, n = 0;
                for (const entry of palette) {
                    if (!(entry.sequence || []).includes(fi)) continue;
                    const rgb = Array.isArray(entry.rgb) ? { r: entry.rgb[0], g: entry.rgb[1], b: entry.rgb[2] } : entry.rgb;
                    rS += rgb.r; gS += rgb.g; bS += rgb.b; n++;
                }
                filamentColours.push(n > 0
                    ? { r: Math.round(rS / n), g: Math.round(gS / n), b: Math.round(bS / n), name: `F${fi}` }
                    : { r: 128, g: 128, b: 128, name: `F${fi}` });
            }
        }

        return { layerData, maxLayers, filamentCount, filamentColours };
    }

    /**
     * Per-layer quality analysis.
     * Returns an array of stats objects, one per layer:
     *   { holes, components, minSize, maxSize, avgSize, thinStrips, coveredPx }
     * "holes"      = uncovered pixels fully surrounded by covered pixels (print voids)
     * "thinStrips" = components with perimeter/area > 3.5 (filament-wasting thin geometry)
     */
    _analyseLayerQuality(layerData, maxLayers, width, height) {
        const pixelCount = width * height;
        const stack      = [];

        return layerData.map(lm => {
            // Holes: uncovered pixel whose all 4 axis neighbours are covered
            let holes = 0;
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    const p = y * width + x;
                    if (lm[p] !== 0) continue;
                    if (lm[p - 1] && lm[p + 1] && lm[p - width] && lm[p + width]) holes++;
                }
            }

            // Connected-component analysis (each component groups same-filament adjacent pixels)
            const visited = new Uint8Array(pixelCount);
            let components = 0, coveredPx = 0, minSize = Infinity, maxSize = 0, thinStrips = 0;

            for (let start = 0; start < pixelCount; start++) {
                if (!lm[start] || visited[start]) continue;
                const fi = lm[start];
                stack.length = 0;
                stack.push(start);
                visited[start] = 1;
                let size = 0, perimeter = 0;

                while (stack.length > 0) {
                    const p   = stack.pop();
                    const px  = p % width, py = Math.floor(p / width);
                    size++;
                    if (px > 0)          { const n = p - 1;     if (lm[n] === fi && !visited[n]) { visited[n] = 1; stack.push(n); } else if (lm[n] !== fi) perimeter++; }
                    if (px < width  - 1) { const n = p + 1;     if (lm[n] === fi && !visited[n]) { visited[n] = 1; stack.push(n); } else if (lm[n] !== fi) perimeter++; }
                    if (py > 0)          { const n = p - width;  if (lm[n] === fi && !visited[n]) { visited[n] = 1; stack.push(n); } else if (lm[n] !== fi) perimeter++; }
                    if (py < height - 1) { const n = p + width;  if (lm[n] === fi && !visited[n]) { visited[n] = 1; stack.push(n); } else if (lm[n] !== fi) perimeter++; }
                }

                components++;
                coveredPx += size;
                if (size < minSize) minSize = size;
                if (size > maxSize) maxSize = size;
                if (perimeter / size > 3.5) thinStrips++;
            }

            return {
                holes, components,
                minSize:   minSize === Infinity ? 0 : minSize,
                maxSize,
                avgSize:   components > 0 ? +(coveredPx / components).toFixed(1) : 0,
                thinStrips,
                coveredPx,
            };
        });
    }

    /**
     * Render the composite analysis PNG.
     * Layout (top to bottom):
     *   Header — title + all settings
     *   Row 1  — source image | quantised image | palette swatches
     *   Rows   — one panel per layer: pixel map (holes in red) + stats
     */
    _renderAnalysisCanvas({ qsm, layerData, maxLayers, filamentCount, filamentColours,
                            analysis, values, sourceImg, quantisedImg, filaments }) {
        const { width, height, palette: colorMap } = qsm;
        const meta = this.state.quantizeAnalysisMeta || {};

        const PAD   = 24;
        const FS    = 16;
        const FS_SM = 13;
        const FS_LG = 20;
        const FONT     = `${FS}px "Space Mono", monospace`;
        const FONT_SM  = `${FS_SM}px "Space Mono", monospace`;
        const FONT_LG  = `${FS_LG}px "Space Mono", monospace`;
        const FONT_XL  = `bold 24px "Space Mono", monospace`;
        const BG    = '#080808';
        const FG    = '#d0d0d0';
        const DIM   = '#666666';
        const WHITE = '#ffffff';
        const WARN  = '#ff5555';
        const OK    = '#55ff55';
        const LINE_H  = FS + 6;
        const LINE_SM = FS_SM + 5;

        // Palette analysis: group sequences by rendered RGB
        const rgbGroups = new Map();
        (colorMap || []).forEach((c, i) => {
            const { r, g, b } = typeof c.rgb === 'object' && !Array.isArray(c.rgb)
                ? c.rgb : { r: c.rgb[0], g: c.rgb[1], b: c.rgb[2] };
            const key = `${r},${g},${b}`;
            if (!rgbGroups.has(key)) rgbGroups.set(key, { r, g, b, hex: c.hex, entries: [] });
            rgbGroups.get(key).entries.push({ index: i, name: c.name || '', sequence: c.sequence || [] });
        });
        const uniqueColours = [...rgbGroups.values()];

        // Uniform image sizing — all images (source, quantised, layer maps) use the same dimensions
        const IMG_SIZE = 280;
        const imgAspect = width / height;
        const imgW = imgAspect >= 1 ? IMG_SIZE : Math.round(IMG_SIZE * imgAspect);
        const imgH = imgAspect >= 1 ? Math.round(IMG_SIZE / imgAspect) : IMG_SIZE;
        const LPR     = Math.min(maxLayers, 4);
        const STAT_H  = LINE_H * 4;

        // Palette swatch layout
        const SW_SIZE  = 20;
        const SW_COL_W = 340;
        const SW_COLS  = Math.max(1, Math.min(4, Math.floor(1200 / SW_COL_W)));
        const SW_ROWS  = Math.ceil(uniqueColours.length / SW_COLS);
        const SW_ROW_H = SW_SIZE + 6;
        const palSectionH = SW_ROWS * SW_ROW_H + LINE_H + PAD;

        // Total canvas size — uses imgW/imgH for all image slots
        const HDR_H = LINE_H * 8 + PAD * 2;
        const IMG_H = imgH + LINE_H + PAD * 2;
        const LAY_H = Math.ceil(maxLayers / LPR) * (imgH + STAT_H + PAD * 2) + LINE_H + PAD;
        const CW = Math.max(LPR * (imgW + PAD) + PAD, imgW * 2 + PAD * 3, SW_COLS * SW_COL_W + PAD * 2, 800);
        const CH = HDR_H + IMG_H + palSectionH + LAY_H + PAD;

        const cv  = document.createElement('canvas');
        cv.width  = CW;
        cv.height = CH;
        const ctx = cv.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = BG;
        ctx.fillRect(0, 0, CW, CH);

        let cy = PAD;

        // Header
        ctx.fillStyle = WHITE; ctx.font = FONT_XL;
        ctx.fillText('QUANTISATION ANALYSIS', PAD, cy + 22);
        cy += 30;
        ctx.fillStyle = DIM; ctx.font = FONT_SM;
        ctx.fillText(new Date().toISOString().slice(0, 19).replace('T', ' '), PAD, cy + FS_SM);
        cy += LINE_SM + 4;

        // Palette stats
        ctx.fillStyle = FG; ctx.font = FONT;
        ctx.fillText(`Palette: ${colorMap?.length || 0} sequences  ->  ${uniqueColours.length} unique RGB colours`, PAD, cy + FS);
        cy += LINE_H;
        if ((meta.duplicateSeqs || 0) > 0) {
            ctx.fillStyle = WARN; ctx.font = FONT;
            ctx.fillText(`${meta.duplicateSeqs} sequences share colours with other sequences (identical RGB output)`, PAD, cy + FS);
            cy += LINE_H;
        }
        ctx.fillStyle = FG; ctx.font = FONT;
        ctx.fillText(`Used: ${meta.usedCount || '?'}/${meta.totalSeqs || '?'} sequences  |  Space: ${meta.colourSpace || 'CIELAB'} [${meta.weights?.w1 ?? 1}, ${meta.weights?.w2 ?? 1}, ${meta.weights?.w3 ?? 1}]`, PAD, cy + FS);
        cy += LINE_H;

        ctx.fillStyle = DIM; ctx.font = FONT_SM;
        ctx.fillText(`${width}x${height}px  |  print: ${values.printWidth || 170}mm  |  tile: ${meta.tileSize || '?'}mm  |  dither: ${values.ditherAlgorithm || 'None'}`, PAD, cy + FS_SM);
        cy += LINE_SM;
        ctx.fillText(`form-opt: ${values.analysisMode || 'Fast'}  |  variance: ${values.colourVariance || 0}  |  grouping: ${values.groupingWeight || 0}  |  cluster: ${values.minimumClusterPx || 0}px  |  pal-merge: ${values.paletteMergeThreshold || 0}`, PAD, cy + FS_SM);
        cy += LINE_SM + PAD;

        // Images row
        ctx.fillStyle = FG; ctx.font = FONT;
        ctx.fillText('SOURCE', PAD, cy + FS);
        ctx.fillText('QUANTISED', PAD * 2 + imgW, cy + FS);
        cy += LINE_H;

        if (sourceImg) ctx.drawImage(sourceImg, PAD, cy, imgW, imgH);
        else { ctx.fillStyle = '#1a1a1a'; ctx.fillRect(PAD, cy, imgW, imgH); }
        if (quantisedImg) ctx.drawImage(quantisedImg, PAD * 2 + imgW, cy, imgW, imgH);
        cy += imgH + PAD;

        // Palette section
        ctx.fillStyle = WHITE; ctx.font = FONT_LG;
        ctx.fillText(`PALETTE  (${uniqueColours.length} unique colours from ${colorMap?.length || 0} sequences)`, PAD, cy + FS_LG);
        cy += LINE_H + 4;

        uniqueColours.forEach((uc, idx) => {
            const col = idx % SW_COLS;
            const row = Math.floor(idx / SW_COLS);
            const sx = PAD + col * SW_COL_W;
            const sy = cy + row * SW_ROW_H;

            ctx.fillStyle = `rgb(${uc.r},${uc.g},${uc.b})`;
            ctx.fillRect(sx, sy, SW_SIZE, SW_SIZE);
            ctx.strokeStyle = '#333'; ctx.strokeRect(sx, sy, SW_SIZE, SW_SIZE);

            const dupLabel = uc.entries.length > 1 ? ` (x${uc.entries.length})` : '';
            const seqStr = uc.entries[0].name || uc.entries[0].sequence.join('');
            ctx.fillStyle = uc.entries.length > 1 ? WARN : FG;
            ctx.font = FONT_SM;
            ctx.fillText(`${uc.hex} ${seqStr}${dupLabel}`, sx + SW_SIZE + 6, sy + FS_SM + 2);
        });
        cy += SW_ROWS * SW_ROW_H + PAD;

        // Layer maps
        ctx.fillStyle = WHITE; ctx.font = FONT_LG;
        ctx.fillText('LAYER MAPS  (red = holes | yellow = thin strips)', PAD, cy + FS_LG);
        cy += LINE_H + 8;

        const tmp = document.createElement('canvas');
        tmp.width  = width;
        tmp.height = height;
        const tctx = tmp.getContext('2d');

        for (let rowStart = 0; rowStart < maxLayers; rowStart += LPR) {
            let lx = PAD;
            for (let L = rowStart; L < Math.min(rowStart + LPR, maxLayers); L++) {
                const lm    = layerData[L];
                const stats = analysis[L];

                const imd = tctx.createImageData(width, height);
                for (let p = 0; p < width * height; p++) {
                    const fi = lm[p];
                    const i4 = p * 4;
                    if (fi > 0 && fi <= filamentColours.length) {
                        const { r, g, b } = filamentColours[fi - 1];
                        imd.data[i4] = r; imd.data[i4+1] = g; imd.data[i4+2] = b; imd.data[i4+3] = 255;
                    } else {
                        imd.data[i4] = 14; imd.data[i4+1] = 14; imd.data[i4+2] = 14; imd.data[i4+3] = 255;
                    }
                }
                if (stats.holes > 0) {
                    for (let y = 1; y < height - 1; y++) {
                        for (let x = 1; x < width - 1; x++) {
                            const p = y * width + x;
                            if (lm[p] !== 0) continue;
                            if (lm[p-1] && lm[p+1] && lm[p-width] && lm[p+width]) {
                                const i4 = p * 4;
                                imd.data[i4] = 255; imd.data[i4+1] = 0; imd.data[i4+2] = 0; imd.data[i4+3] = 255;
                            }
                        }
                    }
                }
                tctx.putImageData(imd, 0, 0);

                ctx.fillStyle = FG; ctx.font = FONT;
                ctx.fillText(`LAYER ${L}`, lx, cy + FS);
                ctx.drawImage(tmp, lx, cy + LINE_H, imgW, imgH);

                const sy  = cy + LINE_H + imgH + 6;
                const bad = stats.holes > 0 || stats.thinStrips > 0 || stats.minSize === 1;
                ctx.fillStyle = bad ? WARN : OK; ctx.font = FONT_SM;
                ctx.fillText(`coverage: ${stats.coveredPx}px  components: ${stats.components}`, lx, sy + FS_SM);
                ctx.fillStyle = stats.holes > 0 ? WARN : DIM; ctx.font = FONT_SM;
                ctx.fillText(`holes: ${stats.holes}`, lx, sy + FS_SM + LINE_SM);
                ctx.fillStyle = (stats.thinStrips > 0 || stats.minSize < 3) ? WARN : DIM;
                ctx.fillText(`thin: ${stats.thinStrips}  min: ${stats.minSize}px  avg: ${stats.avgSize}px`, lx, sy + FS_SM + LINE_SM * 2);

                lx += imgW + PAD;
            }
            cy += imgH + STAT_H + PAD * 2;
        }

        return cv;
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

