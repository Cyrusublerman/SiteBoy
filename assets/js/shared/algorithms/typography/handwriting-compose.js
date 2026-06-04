/**
 * Handwriting Compose — vector synthesis from captured glyph strokes.
 *
 * Pure functions; no DOM, no globals, no side effects.
 *
 * @source blog/docs/pages/tools/utilities/cursive-glyph-builder.md — preview compose pipeline
 * @wikipedia https://en.wikipedia.org/wiki/B%C3%A9zier_curve
 * @formula cubic segment: B(t) = (1−t)³P₀ + 3(1−t)²tP₁ + 3(1−t)t²P₂ + t³P₃
 * @module shared/algorithms/typography/handwriting-compose
 */

import {
    linePromptGeometry,
    projectStrokes,
    canvasStrokeBounds,
    metricBandPx,
    captureGeometryLocal,
} from './stroke-capture.js';
import { perturbCanvasStrokesWithAnchorNoise } from './anchor-noise.js';

// ─── PRNG ────────────────────────────────────────────────────────────────────

/**
 * @param {number} [seed=1]
 * @returns {{ next:()=>number, uniform:(min:number,max:number)=>number, gaussian:()=>number }}
 */
export function createRng(seed = 1) {
    let state = (seed >>> 0) || 1;
    let spare = null;

    return {
        /** @returns {number} uniform in [0, 1) */
        next() {
            state ^= state << 13;
            state ^= state >>> 17;
            state ^= state << 5;
            return ((state >>> 0) / 4294967296);
        },
        uniform(min, max) {
            return min + (max - min) * this.next();
        },
        gaussian() {
            if (spare !== null) {
                const v = spare;
                spare = null;
                return v;
            }
            let u = 0;
            let v = 0;
            while (u === 0) u = this.next();
            while (v === 0) v = this.next();
            const mag = Math.sqrt(-2 * Math.log(u));
            spare = mag * Math.cos(2 * Math.PI * v);
            return mag * Math.sin(2 * Math.PI * v);
        },
    };
}

// ─── SVG path helpers ────────────────────────────────────────────────────────

/** @param {number} n */
function fmt(n) {
    return Number(Number(n).toFixed(2));
}

/**
 * @param {{ a0:{x:number,y:number}, h1:{x:number,y:number}, h2:{x:number,y:number}, a1:{x:number,y:number} }[]} beziers
 * @returns {string}
 */
export function strokeBeziersToSVGPath(beziers) {
    if (!beziers?.length) return '';
    const parts = [`M ${fmt(beziers[0].a0.x)} ${fmt(beziers[0].a0.y)}`];
    for (const seg of beziers) {
        parts.push(
            `C ${fmt(seg.h1.x)} ${fmt(seg.h1.y)} ${fmt(seg.h2.x)} ${fmt(seg.h2.y)} ${fmt(seg.a1.x)} ${fmt(seg.a1.y)}`,
        );
    }
    return parts.join(' ');
}

/**
 * @param {object[]} strokes canvas-space strokes with beziers[]
 * @returns {string[]} one SVG path `d` per stroke
 */
export function strokesToSVGPath(strokes) {
    const paths = [];
    for (const stroke of strokes || []) {
        const d = strokeBeziersToSVGPath(stroke?.beziers);
        if (d) paths.push(d);
    }
    return paths;
}

// ─── Segmentation ────────────────────────────────────────────────────────────

/**
 * @param {string} text
 * @param {Map<string, object>} lookup
 * @returns {Array<{ text:string, drawing:object|null }>}
 */
export function segmentTextGreedy(text, lookup) {
    const segments = [];
    let i = 0;
    const s = String(text);
    while (i < s.length) {
        let matched = null;
        for (let len = Math.min(3, s.length - i); len >= 1; len -= 1) {
            const sub = s.slice(i, i + len);
            if (lookup.has(sub)) {
                matched = sub;
                break;
            }
        }
        if (matched) {
            segments.push({ text: matched, drawing: lookup.get(matched) });
            i += matched.length;
        } else {
            segments.push({ text: s[i], drawing: null });
            i += 1;
        }
    }
    return segments;
}

// ─── Weighted stochastic segmentation ────────────────────────────────────────

/** Default per-glyph multiplier for segment weight (= length × this). */
export const DEFAULT_SEGMENT_WEIGHT_PER_GLYPH = 2;

/** Alternate multiplier (user-suggested). */
export const ALT_SEGMENT_WEIGHT_PER_GLYPH = 1.5;

/** Default noise multiplier (0 = max base weight only). */
export const DEFAULT_SEGMENT_TEMPERATURE = 1.0;

/** Max segmentation paths enumerated per word before fallback. */
export const MAX_SEGMENT_PATHS = 512;

/**
 * @param {number} length  matched n-gram length (1–3)
 * @param {number} [weightPerGlyph=2]
 * @returns {number}
 */
export function segmentMatchWeight(length, weightPerGlyph = DEFAULT_SEGMENT_WEIGHT_PER_GLYPH) {
    const n = Math.max(1, Math.floor(length) || 1);
    const w = Number(weightPerGlyph) || DEFAULT_SEGMENT_WEIGHT_PER_GLYPH;
    return n * w;
}

/**
 * @param {number} baseSeed
 * @param {number} wordIndex
 * @returns {number}
 */
export function hashSegmentSeed(baseSeed, wordIndex) {
    let h = (baseSeed >>> 0) ^ Math.imul(wordIndex >>> 0, 2654435761);
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return h >>> 0 || 1;
}

/**
 * @typedef {{
 *   maxGramLen?: number,
 *   weightPerGlyph?: number,
 *   tieEpsilon?: number,
 *   segmentSeed?: number,
 *   segmentTemperature?: number,
 * }} SegmentOptions
 */

/**
 * Uniform random bonus range added to each path's weight tally.
 *
 * @param {SegmentOptions} [options]
 * @returns {number}
 */
export function segmentNoiseScale(options = {}) {
    const temp = Number(options.segmentTemperature);
    const t = Number.isFinite(temp) ? temp : DEFAULT_SEGMENT_TEMPERATURE;
    if (t <= 0) return 0;
    const wpg = Number(options.weightPerGlyph) || DEFAULT_SEGMENT_WEIGHT_PER_GLYPH;
    const maxLen = Math.max(1, Math.floor(options.maxGramLen) || 3);
    return t * wpg * maxLen;
}

/**
 * @param {number[]} lens
 * @param {number} [weightPerGlyph]
 * @returns {number}
 */
export function tallySegmentationWeight(lens, weightPerGlyph = DEFAULT_SEGMENT_WEIGHT_PER_GLYPH) {
    let total = 0;
    for (const len of lens) {
        total += segmentMatchWeight(len, weightPerGlyph);
    }
    return total;
}

/**
 * Base score for one tiling: weight tally plus average segment length bonus.
 *
 * @param {number[]} lens
 * @param {number} [weightPerGlyph]
 * @returns {{ totalWeight:number, segmentCount:number, avgSegmentLen:number, baseScore:number }}
 */
export function scoreSegmentationPath(lens, weightPerGlyph = DEFAULT_SEGMENT_WEIGHT_PER_GLYPH) {
    const wpg = Number(weightPerGlyph) || DEFAULT_SEGMENT_WEIGHT_PER_GLYPH;
    let charCount = 0;
    let totalWeight = 0;
    for (const len of lens) {
        charCount += len;
        totalWeight += segmentMatchWeight(len, wpg);
    }
    const segmentCount = Math.max(1, lens.length);
    const avgSegmentLen = charCount / segmentCount;
    const baseScore = totalWeight + avgSegmentLen * wpg;
    return { totalWeight, segmentCount, avgSegmentLen, baseScore };
}

/**
 * All valid n-gram length sequences that tile `word`.
 *
 * @param {string} word
 * @param {Map<string, object>} lookup
 * @param {number} [maxGramLen=3]
 * @returns {number[][]}
 */
export function enumerateSegmentationPaths(word, lookup, maxGramLen = 3) {
    const s = String(word);
    const maxLen = Math.max(1, Math.floor(maxGramLen) || 3);
    /** @type {number[][]} */
    const paths = [];

    /**
     * @param {number} i
     * @param {number[]} acc
     */
    function walk(i, acc) {
        if (i >= s.length) {
            paths.push([...acc]);
            return;
        }
        let matched = false;
        for (let len = Math.min(maxLen, s.length - i); len >= 1; len -= 1) {
            const sub = s.slice(i, i + len);
            if (len > 1 && !lookup.has(sub)) continue;
            matched = true;
            acc.push(len);
            walk(i + len, acc);
            acc.pop();
        }
        if (!matched) {
            acc.push(1);
            walk(i + 1, acc);
            acc.pop();
        }
    }

    walk(0, []);
    return paths;
}

/**
 * Score each path: base (tally + avg segment length) + uniform jitter; pick highest.
 *
 * @param {number[][]} paths
 * @param {ReturnType<typeof createRng>} rng
 * @param {number} weightPerGlyph
 * @param {number} noiseScale
 * @param {number} eps
 * @returns {number[]|null}
 */
export function pickJitteredSegmentationPath(paths, rng, weightPerGlyph, noiseScale, eps) {
    if (!paths.length) return null;

    let bestScore = -Infinity;
    /** @type {number[][]} */
    let best = [];

    for (const lens of paths) {
        const { baseScore } = scoreSegmentationPath(lens, weightPerGlyph);
        const jitter = noiseScale > 0 ? rng.uniform(0, noiseScale) : 0;
        const score = baseScore + jitter;
        if (score > bestScore + eps) {
            bestScore = score;
            best = [lens];
        } else if (Math.abs(score - bestScore) <= eps) {
            best.push(lens);
        }
    }

    if (!best.length) return paths[0];
    return best[Math.floor(rng.next() * best.length)];
}

/**
 * @param {string} word
 * @param {number[]} lens
 * @param {Map<string, object>} lookup
 * @returns {Array<{ text:string, drawing:object|null }>}
 */
export function segmentationLensToSegments(word, lens, lookup) {
    const s = String(word);
    /** @type {Array<{ text:string, drawing:object|null }>} */
    const out = [];
    let i = 0;
    for (const len of lens) {
        const sub = s.slice(i, i + len);
        out.push({ text: sub, drawing: lookup.get(sub) ?? null });
        i += len;
    }
    return out;
}

/**
 * Greedy longest-match path (deterministic fallback).
 *
 * @param {string} word
 * @param {Map<string, object>} lookup
 * @param {number} [maxGramLen=3]
 * @returns {number[]}
 */
export function greedySegmentationLens(word, lookup, maxGramLen = 3) {
    const s = String(word);
    const maxLen = Math.max(1, Math.floor(maxGramLen) || 3);
    /** @type {number[]} */
    const lens = [];
    let i = 0;
    while (i < s.length) {
        let picked = 1;
        for (let len = Math.min(maxLen, s.length - i); len >= 1; len -= 1) {
            if (len > 1 && !lookup.has(s.slice(i, i + len))) continue;
            picked = len;
            break;
        }
        lens.push(picked);
        i += picked;
    }
    return lens;
}

/**
 * Word segmentation: enumerate paths; score = tally + avg segment length + jitter.
 *
 * @param {string} word
 * @param {Map<string, object>} lookup
 * @param {ReturnType<typeof createRng>} rng
 * @param {SegmentOptions} [options]
 * @returns {Array<{ text:string, drawing:object|null }>}
 */
export function segmentWordWeighted(word, lookup, rng, options = {}) {
    const s = String(word);
    if (!s.length) return [];

    const maxLen = Math.max(1, Math.floor(options.maxGramLen) || 3);
    const wpg = Number(options.weightPerGlyph) || DEFAULT_SEGMENT_WEIGHT_PER_GLYPH;
    const eps = Number(options.tieEpsilon) || 1e-9;
    const noiseScale = segmentNoiseScale(options);

    let paths = enumerateSegmentationPaths(s, lookup, maxLen);
    if (!paths.length) {
        return [{ text: s, drawing: lookup.get(s) ?? null }];
    }

    if (paths.length > MAX_SEGMENT_PATHS) {
        return segmentationLensToSegments(
            s, greedySegmentationLens(s, lookup, maxLen), lookup,
        );
    }

    let picked;
    if (noiseScale <= 0) {
        let bestBase = -Infinity;
        /** @type {number[][]} */
        let best = [];
        for (const lens of paths) {
            const { baseScore } = scoreSegmentationPath(lens, wpg);
            if (baseScore > bestBase + eps) {
                bestBase = baseScore;
                best = [lens];
            } else if (Math.abs(baseScore - bestBase) <= eps) {
                best.push(lens);
            }
        }
        picked = best[Math.floor(rng.next() * best.length)];
    } else {
        picked = pickJitteredSegmentationPath(paths, rng, wpg, noiseScale, eps);
    }

    if (!picked) {
        picked = greedySegmentationLens(s, lookup, maxLen);
    }

    return segmentationLensToSegments(s, picked, lookup);
}

/**
 * Segment line text: whitespace char-by-char; words via weighted DP + tie randomisation.
 *
 * @param {string} text
 * @param {Map<string, object>} lookup
 * @param {SegmentOptions} [options]
 * @param {{ n:number }} [wordIndexState]
 * @returns {Array<{ text:string, drawing:object|null }>}
 */
export function segmentTextForCompose(text, lookup, options = {}, wordIndexState = { n: 0 }) {
    const parts = String(text).split(/(\s+)/u);
    /** @type {Array<{ text:string, drawing:object|null }>} */
    const out = [];

    for (const part of parts) {
        if (!part) continue;
        if (/^\s+$/u.test(part)) {
            for (const ch of part) {
                out.push({ text: ch, drawing: lookup.get(ch) ?? null });
            }
            continue;
        }
        const seed = hashSegmentSeed(options.segmentSeed ?? 1, wordIndexState.n);
        wordIndexState.n += 1;
        const wordRng = createRng(seed);
        out.push(...segmentWordWeighted(part, lookup, wordRng, options));
    }

    return out;
}

/**
 * Greedy fallback when no segment seed is supplied (longest n-gram first).
 *
 * @param {string} text
 * @param {Map<string, object>} lookup
 * @param {SegmentOptions} [options]
 * @param {{ n:number }} [wordIndexState]
 * @returns {Array<{ text:string, drawing:object|null }>}
 */
export function resolveSegments(text, lookup, options = {}, wordIndexState = { n: 0 }) {
    if (Number.isFinite(options.segmentSeed)) {
        return segmentTextForCompose(text, lookup, options, wordIndexState);
    }
    return segmentTextGreedy(text, lookup);
}

// ─── Space glyphs (synthetic, min→max single-glyph advance) ─────────────────

/** Minimum number of auto-generated space width variants. */
export const MIN_SPACE_VARIATIONS = 5;

/**
 * Scan reference singles + captured singles for min/max advance (em).
 *
 * @param {(text:string)=>number} advanceFn  advance in em at fontSize=1
 * @param {Map<string, object>|undefined} glyphLookup
 * @returns {{ minEm:number, maxEm:number }}
 */
export function computeSingleGlyphAdvanceBounds(advanceFn, glyphLookup) {
    let min = Infinity;
    let max = 0;

    const scan = (ch) => {
        const em = advanceFn(ch);
        if (em > 0) {
            if (em < min) min = em;
            if (em > max) max = em;
        }
    };

    const alnum = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (const ch of alnum) scan(ch);
    if (glyphLookup) {
        for (const key of glyphLookup.keys()) {
            if ([...String(key)].length === 1) scan(key);
        }
    }

    if (!Number.isFinite(min) || min <= 0) min = max > 0 ? max * 0.2 : 0.2;
    if (max <= 0) max = Math.max(min, 1);
    if (min > max) {
        const t = min;
        min = max;
        max = t;
    }
    return { minEm: min, maxEm: max };
}

/**
 * Evenly spaced space advances between min and max single-glyph width (em).
 *
 * @param {number} minEm
 * @param {number} maxEm
 * @param {number} [variationCount=5]
 * @returns {number[]}
 */
export function buildSpaceVariationAdvancesEm(minEm, maxEm, variationCount = MIN_SPACE_VARIATIONS) {
    const n = Math.max(MIN_SPACE_VARIATIONS, Math.floor(variationCount) || MIN_SPACE_VARIATIONS);
    const lo = Math.min(minEm, maxEm);
    const hi = Math.max(minEm, maxEm);
    if (hi <= 0) return Array.from({ length: n }, (_, i) => 0.2 + (0.8 * i) / Math.max(1, n - 1));
    if (n === 1) return [hi];
    const out = [];
    for (let i = 0; i < n; i += 1) {
        out.push(lo + (hi - lo) * (i / (n - 1)));
    }
    return out;
}

/**
 * @param {object} options
 * @returns {number[]|null}
 */
export function resolveSpaceVariationAdvancesEm(options) {
    if (options.spaceVariationAdvancesEm?.length) {
        return options.spaceVariationAdvancesEm;
    }
    const min = options.minSingleCharAdvanceEm;
    const max = options.maxSingleCharAdvanceEm;
    if (Number.isFinite(min) && Number.isFinite(max) && min > 0 && max > 0) {
        return buildSpaceVariationAdvancesEm(min, max, options.spaceVariationCount);
    }
    return null;
}

/**
 * Pick space advance for document-order space index (cycles variants).
 *
 * @param {number} spaceIndex
 * @param {number[]} variationAdvancesEm
 * @returns {number|null}
 */
export function spaceAdvanceEm(spaceIndex, variationAdvancesEm) {
    if (!variationAdvancesEm?.length) return null;
    return variationAdvancesEm[spaceIndex % variationAdvancesEm.length];
}

/**
 * Resolve auto-generated space glyph for a document-order space index.
 *
 * @param {number} spaceIndex 0-based uncaptured-space index (before increment)
 * @param {{ syntheticSpaceGlyphs?:object[], spaceVariationAdvancesEm?:number[], minSingleCharAdvanceEm?:number, maxSingleCharAdvanceEm?:number, spaceVariationCount?:number }} options
 * @returns {object|null}
 */
export function pickSyntheticSpaceGlyph(spaceIndex, options) {
    const table = resolveSpaceVariationAdvancesEm(options);
    const glyphs = options.syntheticSpaceGlyphs;
    if (!table?.length || !glyphs?.length) return null;
    const idx = spaceIndex % table.length;
    return glyphs[idx] ?? null;
}

/**
 * Auto-generated space glyph shells (no ink; distinct advance per variant).
 *
 * @param {{ minEm:number, maxEm:number }} bounds
 * @param {{ upm:number, fontSize:number, variationCount?:number, metrics?:{ unitsPerEm?:number, ascender?:number, descender?:number } }} opts
 * @returns {object[]}
 */
export function buildSyntheticSpaceGlyphs(bounds, opts) {
    const advances = buildSpaceVariationAdvancesEm(
        bounds.minEm,
        bounds.maxEm,
        opts.variationCount,
    );
    const upm = opts.upm ?? 1000;
    const fontSize = Math.max(1, opts.fontSize ?? 72);
    const metrics = opts.metrics ?? { unitsPerEm: upm };
    return advances.map((advanceEm, variantIndex) => {
        const advanceWidthPx = Math.max(1, advanceEm * fontSize);
        const captureGeometry = captureGeometryLocal(
            { advanceWidthPx, fontSize },
            metrics,
        );
        return {
            id:                 `auto_space_${variantIndex}`,
            promptText:         `·${variantIndex}`,
            synthetic:          true,
            syntheticSpaceVariant: variantIndex,
            advanceEm,
            strokes:            [],
            captureGeometry,
        };
    });
}

/**
 * @param {string} text
 * @param {boolean} hasDrawing
 * @returns {boolean}
 */
export function isUncapturedSpaceSegment(text, hasDrawing) {
    return text === ' ' && !hasDrawing;
}

/**
 * @param {string} text
 * @param {boolean} hasDrawing
 * @param {{ n:number }} spaceIndexState
 * @param {{ advanceFn:(t:string)=>number, spaceVariationAdvancesEm?:number[], minSingleCharAdvanceEm?:number, maxSingleCharAdvanceEm?:number, spaceVariationCount?:number }} options
 * @returns {number} advance in em
 */
export function advanceEmForSegment(text, hasDrawing, spaceIndexState, options) {
    const table = resolveSpaceVariationAdvancesEm(options);
    if (isUncapturedSpaceSegment(text, hasDrawing) && table) {
        const em = spaceAdvanceEm(spaceIndexState.n, table);
        spaceIndexState.n += 1;
        if (Number.isFinite(em) && em > 0) return em;
    }
    return options.advanceFn(text);
}

/**
 * Measure one composed line width in em, honouring synthetic space glyph advances.
 *
 * @param {string} line
 * @param {Map<string, object>} glyphLookup
 * @param {object} options
 * @param {number} [spaceStartIndex=0]
 * @param {number} [wordStartIndex=0]
 * @returns {{ em:number, spaceIndexEnd:number, wordIndexEnd:number }}
 */
export function measureLineAdvanceEm(
    line, glyphLookup, options, spaceStartIndex = 0, wordStartIndex = 0,
) {
    const wordIndexState = { n: wordStartIndex };
    const segments = resolveSegments(line, glyphLookup, options, wordIndexState);
    const spaceIndexState = { n: spaceStartIndex };
    let totalEm = 0;
    let prevChar = null;

    for (let si = 0; si < segments.length; si += 1) {
        const seg = segments[si];
        const first = seg.text[0];
        if (prevChar && first && options.kerningFn) {
            totalEm += options.kerningFn(prevChar, first) + (options.kerningAdjust ?? 0);
        }
        const hasInk = Boolean(seg.drawing?.strokes?.length);
        totalEm += advanceEmForSegment(seg.text, hasInk, spaceIndexState, options);
        if (si < segments.length - 1 && options.letterSpacingEm) {
            totalEm += options.letterSpacingEm;
        }
        prevChar = seg.text[seg.text.length - 1] ?? prevChar;
    }

    return { em: totalEm, spaceIndexEnd: spaceIndexState.n, wordIndexEnd: wordIndexState.n };
}


/**
 * @typedef {{
 *   baselineAmplitude?: number,
 *   sizeAmplitude?: number,
 *   decay?: number,
 * }} PerturbationOptions
 */

/**
 * @typedef {{
 *   baselineOffset: number,
 *   rng: ReturnType<typeof createRng>,
 * }} PerturbationState
 */

/**
 * Apply per-segment baseline drift and size jitter.
 *
 * @param {{ canvasOriginX:number, canvasBaselineY:number, canvasAdvanceWidth:number }} promptGeometry
 * @param {number} fontSize
 * @param {PerturbationOptions|null|undefined} perturbation
 * @param {PerturbationState} state
 * @returns {{ canvasOriginX:number, canvasBaselineY:number, canvasAdvanceWidth:number }}
 */
export function perturbGlyph(promptGeometry, fontSize, perturbation, state) {
    if (!perturbation) return promptGeometry;

    const baselineAmp = Number(perturbation.baselineAmplitude) || 0;
    const sizeAmp = Number(perturbation.sizeAmplitude) || 0;
    const decay = Number.isFinite(perturbation.decay) ? perturbation.decay : 0.85;

    if (baselineAmp > 0) {
        state.baselineOffset = state.baselineOffset * decay
            + state.rng.gaussian() * baselineAmp * fontSize;
    }

    let advanceWidth = promptGeometry.canvasAdvanceWidth;
    if (sizeAmp > 0) {
        const scale = 1 + state.rng.uniform(-sizeAmp, sizeAmp);
        advanceWidth = Math.max(1, advanceWidth * scale);
    }

    return {
        canvasOriginX:      promptGeometry.canvasOriginX,
        canvasBaselineY:    promptGeometry.canvasBaselineY + state.baselineOffset,
        canvasAdvanceWidth: advanceWidth,
    };
}

// ─── Layout helpers ──────────────────────────────────────────────────────────

/**
 * @param {{ unitsPerEm?:number, ascender?:number, descender?:number }} metrics
 * @param {number} fontSize
 * @param {number} rowMarginEm
 */
export function rowGridMetrics(metrics, fontSize, rowMarginEm) {
    const band = metricBandPx(metrics, fontSize);
    const marginPx = fontSize * rowMarginEm;
    const rowPitch = band.captureHeight + marginPx;
    return {
        rowPitch,
        ascPx: band.ascPx,
        descPx: band.descPx,
        bodyPx: band.captureHeight,
    };
}

/**
 * @param {number} stripH
 * @param {number} innerH
 * @param {number} slot
 * @param {number} rowPitch
 * @param {number} ascPx
 * @param {number} descPx
 * @param {number} maxRows
 */
export function rowBaselineY(stripH, innerH, slot, rowPitch, ascPx, descPx, maxRows) {
    const bodyPx = ascPx - descPx;
    const stackH = maxRows > 1
        ? (maxRows - 1) * rowPitch + bodyPx
        : bodyPx;
    const stackTop = stripH + (innerH - stackH) / 2;
    return stackTop + ascPx + slot * rowPitch;
}

/**
 * Greedy word-wrap one row (no embedded line breaks).
 *
 * @param {string} text
 * @param {number} maxWidthPx
 * @param {(line:string, spaceStartIndex:number, wordStartIndex:number)=>{ widthPx:number, spaceIndexEnd:number, wordIndexEnd:number }} measureLineAt
 * @param {{ n:number }} spaceIndexState
 * @param {{ n:number }} wordIndexState
 * @returns {string[]}
 */
function wrapWordsToWidth(text, maxWidthPx, measureLineAt, spaceIndexState, wordIndexState) {
    const words = String(text).trim().split(/\s+/u).filter(Boolean);
    if (!words.length) return [];

    const lines = [];
    let current = '';
    let rowSpaceStart = spaceIndexState.n;
    let rowWordStart = wordIndexState.n;

    for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        const cand = measureLineAt(candidate, rowSpaceStart, rowWordStart);
        if (cand.widthPx > maxWidthPx && current) {
            lines.push(current);
            const committed = measureLineAt(current, rowSpaceStart, rowWordStart);
            spaceIndexState.n = committed.spaceIndexEnd;
            wordIndexState.n = committed.wordIndexEnd;
            rowSpaceStart = spaceIndexState.n;
            rowWordStart = wordIndexState.n;
            current = word;
        } else {
            current = candidate;
        }
    }
    if (current) {
        const committed = measureLineAt(current, rowSpaceStart, rowWordStart);
        lines.push(current);
        spaceIndexState.n = committed.spaceIndexEnd;
        wordIndexState.n = committed.wordIndexEnd;
    }
    return lines;
}

/**
 * Split on user line breaks (Enter); word-wrap each row to maxWidthPx when finite.
 * Blank rows (paragraph gaps) are preserved as empty strings.
 *
 * @param {string} text
 * @param {number} maxWidthPx
 * @param {(line:string, spaceStartIndex:number, wordStartIndex:number)=>{ widthPx:number, spaceIndexEnd:number, wordIndexEnd:number }} measureLineAt
 * @param {{ n:number }} [spaceIndexState]
 * @param {{ n:number }} [wordIndexState]
 * @returns {string[]}
 */
export function wrapPreviewLines(
    text, maxWidthPx, measureLineAt, spaceIndexState = { n: 0 }, wordIndexState = { n: 0 },
) {
    const normalized = String(text).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    if (!normalized.trim() && !normalized.includes('\n')) return [];

    const explicitRows = normalized.split('\n');
    const out = [];
    const canWrap = Number.isFinite(maxWidthPx) && maxWidthPx > 0;

    for (const row of explicitRows) {
        if (row.trim() === '') {
            out.push('');
            continue;
        }
        if (canWrap) {
            out.push(...wrapWordsToWidth(row, maxWidthPx, measureLineAt, spaceIndexState, wordIndexState));
        } else {
            const m = measureLineAt(row, spaceIndexState.n, wordIndexState.n);
            spaceIndexState.n = m.spaceIndexEnd;
            wordIndexState.n = m.wordIndexEnd;
            out.push(row);
        }
    }
    return out;
}

// ─── Line composition ────────────────────────────────────────────────────────

/**
 * @param {object|null|undefined} a
 * @param {object|null|undefined} b
 */
function mergeBounds(a, b) {
    if (!a) return b ? { ...b } : null;
    if (!b) return { ...a };
    const minX = Math.min(a.minX, b.minX);
    const minY = Math.min(a.minY, b.minY);
    const maxX = Math.max(a.maxX, b.maxX);
    const maxY = Math.max(a.maxY, b.maxY);
    return {
        minX, minY, maxX, maxY,
        width:  maxX - minX,
        height: maxY - minY,
    };
}

/**
 * @param {string} sentence
 * @param {number} startX
 * @param {number} baselineY
 * @param {Map<string, object>} lookup
 * @param {object} options
 * @param {PerturbationState|null} perturbState
 * @param {{ n:number }} spaceIndexState
 * @param {{ n:number }} wordIndexState
 * @param {{ n:number }} anchorNoiseSegmentState
 */
function composeLine(
    sentence, startX, baselineY, lookup, options, perturbState,
    spaceIndexState, wordIndexState, anchorNoiseSegmentState,
) {
    const segments = resolveSegments(sentence, lookup, options, wordIndexState);
    let x = startX;
    let prevChar = null;
    const resultSegments = [];
    let lineBounds = null;

    for (let si = 0; si < segments.length; si += 1) {
        const seg = segments[si];
        const first = seg.text[0];
        if (prevChar && first && options.kerningFn) {
            x += (options.kerningFn(prevChar, first) + options.kerningAdjust) * options.fontSize;
        }

        const hasInk = Boolean(seg.drawing?.strokes?.length);
        const advanceEm = advanceEmForSegment(seg.text, hasInk, spaceIndexState, options);
        let advanceWidth = Math.max(1, advanceEm * options.fontSize);

        if (seg.drawing?.strokes?.length) {
            let geom = linePromptGeometry(x, baselineY, advanceWidth);
            if (options.perturbation && perturbState) {
                geom = perturbGlyph(geom, options.fontSize, options.perturbation, perturbState);
                advanceWidth = geom.canvasAdvanceWidth;
            }
            const fontUnits = seg.drawing.captureGeometry?.fontAdvanceWidth ?? options.upm;
            let canvasStrokes = projectStrokes(seg.drawing.strokes, geom, fontUnits);
            if (options.anchorNoise?.amplitudePx > 0) {
                canvasStrokes = perturbCanvasStrokesWithAnchorNoise(
                    canvasStrokes,
                    options.anchorNoise,
                    {
                        originX:      geom.canvasOriginX,
                        originY:      geom.canvasBaselineY,
                        segmentIndex: anchorNoiseSegmentState.n,
                    },
                );
                anchorNoiseSegmentState.n += 1;
            }
            const paths = strokesToSVGPath(canvasStrokes);
            const bounds = canvasStrokeBounds(canvasStrokes, options.lineWidth ?? 0);
            lineBounds = mergeBounds(lineBounds, bounds);
            resultSegments.push({ text: seg.text, paths, bounds, hasInk: true });
        } else {
            let syntheticSpaceVariant = null;
            let drawing = seg.drawing;
            if (isUncapturedSpaceSegment(seg.text, hasInk) && spaceIndexState.n > 0) {
                const table = resolveSpaceVariationAdvancesEm(options);
                if (table?.length) {
                    syntheticSpaceVariant = (spaceIndexState.n - 1) % table.length;
                    drawing = pickSyntheticSpaceGlyph(syntheticSpaceVariant, options) ?? drawing;
                }
            }
            resultSegments.push({
                text: seg.text,
                paths: [],
                bounds: null,
                hasInk: false,
                syntheticSpaceVariant,
                drawing,
            });
        }

        x += advanceWidth;
        if (si < segments.length - 1 && options.letterSpacingEm) {
            x += options.letterSpacingEm * options.fontSize;
        }
        prevChar = seg.text[seg.text.length - 1] ?? prevChar;
    }

    return {
        segments: resultSegments,
        width: x - startX,
        bounds: lineBounds,
    };
}

// ─── Main compose API ────────────────────────────────────────────────────────

/**
 * @typedef {{
 *   fontSize: number,
 *   upm: number,
 *   metrics: { unitsPerEm?:number, ascender?:number, descender?:number },
 *   kerningFn?: (prev:string, next:string)=>number,
 *   advanceFn: (text:string)=>number,
 *   minSingleCharAdvanceEm?: number,
 *   maxSingleCharAdvanceEm?: number,
 *   spaceVariationAdvancesEm?: number[],
 *   spaceVariationCount?: number,
 *   syntheticSpaceGlyphs?: object[],
 *   letterSpacingEm?: number,
 *   kerningAdjust?: number,
 *   lineWidth?: number,
 *   perturbation?: PerturbationOptions|null,
 *   seed?: number,
 *   segmentSeed?: number,
 *   weightPerGlyph?: number,
 *   wrapWidth?: number,
 *   layout?: {
 *     padX?: number,
 *     stripH?: number,
 *     innerH?: number,
 *     rowMarginEm?: number,
 *     minFontSize?: number,
 *   },
 * }} ComposeOptions
 */

/**
 * Compose captured glyph strokes into vector line data.
 *
 * @param {string} text
 * @param {Map<string, object>} glyphLookup
 * @param {ComposeOptions} options
 * @returns {{
 *   lines: Array<{
 *     lineIndex: number,
 *     text: string,
 *     baselineY: number,
 *     width: number,
 *     bounds: object|null,
 *     segments: Array<{ text:string, paths:string[], bounds:object|null, hasInk:boolean }>,
 *   }>,
 *   bounds: object|null,
 *   viewBox: { x:number, y:number, width:number, height:number },
 *   fontSize: number,
 * }}
 */
export function composeTextToVectors(text, glyphLookup, options) {
    const fontSize0 = Math.max(1, options.fontSize);
    const rowMarginEm = options.layout?.rowMarginEm ?? 0;
    const wrapWidth = options.wrapWidth;
    const layout = options.layout ?? {};
    const padX = layout.padX ?? 0;
    const stripH = layout.stripH ?? 0;
    const innerH = layout.innerH ?? 0;
    const minFontSize = layout.minFontSize ?? 20;
    const spaceIndexState = { n: 0 };
    const wordIndexState = { n: 0 };

    let fontSize = fontSize0;
    const wrapLimit = wrapWidth ?? Infinity;

    const runWrap = () => {
        spaceIndexState.n = 0;
        wordIndexState.n = 0;
        return wrapPreviewLines(text, wrapLimit, (line, spaceStart, wordStart) => {
            const { em, spaceIndexEnd, wordIndexEnd } = measureLineAdvanceEm(
                line, glyphLookup, options, spaceStart, wordStart,
            );
            return { widthPx: em * fontSize, spaceIndexEnd, wordIndexEnd };
        }, spaceIndexState, wordIndexState);
    };

    let lines = runWrap();

    if (wrapWidth && innerH > 0) {
        let grid = rowGridMetrics(options.metrics, fontSize, rowMarginEm);
        let maxLines = Math.max(1, Math.floor(innerH / grid.rowPitch));
        while (lines.length > maxLines && fontSize > minFontSize) {
            fontSize = Math.max(minFontSize, fontSize * 0.92);
            grid = rowGridMetrics(options.metrics, fontSize, rowMarginEm);
            lines = runWrap();
            maxLines = Math.max(1, Math.floor(innerH / grid.rowPitch));
        }
        if (innerH > 0) {
            lines = lines.slice(0, maxLines);
        }
    }

    const grid = rowGridMetrics(options.metrics, fontSize, rowMarginEm);
    const lineCount = lines.length;
    const maxRows = lineCount;

    const perturbState = options.perturbation
        ? { baselineOffset: 0, rng: createRng(options.seed ?? 1) }
        : null;

    const composeOpts = { ...options, fontSize };

    const composedLines = [];
    let globalBounds = null;

    const composeSpaceState = { n: 0 };
    const composeWordState = { n: 0 };
    const composeAnchorNoiseState = { n: 0 };

    for (let i = 0; i < lineCount; i += 1) {
        const baselineY = innerH > 0
            ? rowBaselineY(stripH, innerH, i, grid.rowPitch, grid.ascPx, grid.descPx, maxRows)
            : grid.ascPx + i * grid.rowPitch;

        const line = composeLine(
            lines[i], padX, baselineY, glyphLookup, composeOpts, perturbState,
            composeSpaceState, composeWordState, composeAnchorNoiseState,
        );
        globalBounds = mergeBounds(globalBounds, line.bounds);
        composedLines.push({
            lineIndex: i,
            text: lines[i],
            baselineY,
            width: line.width,
            bounds: line.bounds,
            segments: line.segments,
        });
    }

    const pad = Math.max(4, (options.lineWidth ?? 0) * 0.5 + 8);
    let viewBox;
    if (globalBounds) {
        viewBox = {
            x:      globalBounds.minX - pad,
            y:      globalBounds.minY - pad,
            width:  globalBounds.width + pad * 2,
            height: globalBounds.height + pad * 2,
        };
    } else {
        const estW = wrapWidth || measureLineAdvanceEm(String(text), glyphLookup, options).em * fontSize;
        const estH = grid.rowPitch * Math.max(1, lineCount);
        viewBox = { x: 0, y: 0, width: Math.max(1, estW + padX * 2), height: Math.max(1, estH) };
    }

    return {
        lines: composedLines,
        bounds: globalBounds,
        viewBox,
        fontSize,
    };
}

// ─── SVG document ────────────────────────────────────────────────────────────

/** @param {string} s */
function escapeAttr(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;');
}

/**
 * @param {ReturnType<typeof composeTextToVectors>} composedResult
 * @param {{
 *   stroke?: string,
 *   strokeWidth?: number,
 *   lineCap?: string,
 *   backgroundColor?: string|null,
 * }} [options]
 * @returns {string}
 */
export function buildSVGDocument(composedResult, options = {}) {
    const stroke = options.stroke ?? '#000000';
    const strokeWidth = options.strokeWidth ?? 2;
    const lineCap = options.lineCap ?? 'round';
    const bg = options.backgroundColor ?? null;
    const vb = composedResult.viewBox;

    const parts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${fmt(vb.x)} ${fmt(vb.y)} ${fmt(vb.width)} ${fmt(vb.height)}" width="${fmt(vb.width)}" height="${fmt(vb.height)}">`,
    ];

    if (bg) {
        parts.push(`<rect width="100%" height="100%" fill="${escapeAttr(bg)}"/>`);
    }

    for (const line of composedResult.lines) {
        parts.push(`<g class="line" data-line="${line.lineIndex}">`);
        for (const seg of line.segments) {
            if (!seg.paths?.length) continue;
            const variantAttr = seg.syntheticSpaceVariant != null
                ? ` data-space-variant="${seg.syntheticSpaceVariant}"`
                : '';
            parts.push(`<g class="segment" data-text="${escapeAttr(seg.text)}"${variantAttr}>`);
            for (const d of seg.paths) {
                parts.push(
                    `<path d="${d}" fill="none" stroke="${escapeAttr(stroke)}" stroke-width="${strokeWidth}" stroke-linecap="${escapeAttr(lineCap)}" stroke-linejoin="round"/>`,
                );
            }
            parts.push('</g>');
        }
        parts.push('</g>');
    }

    parts.push('</svg>');
    const svgContent = parts.join('\n');
    return svgContent;
}
