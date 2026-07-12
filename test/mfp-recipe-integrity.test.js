import { webcrypto } from 'node:crypto';
import { describe, it, expect } from 'vitest';
import { MFPExportActions } from '../assets/js/tools/fabrication/multifilament-print/MFP-ExportActions.js';
import {
    buildAbsoluteLayerMaps,
    createCanonicalRecipeRecord,
    createRecipeId,
    createRecipeManifest,
    deserializeQuantizedSequenceMap,
    getAbsoluteLayerCount,
    normaliseAbsoluteSequence,
    serializeQuantizedSequenceMap,
    stableStringify
} from '../assets/js/tools/fabrication/multifilament-print/MFP-RecipeIntegrity.js';

if (!globalThis.crypto?.subtle) {
    Object.defineProperty(globalThis, 'crypto', {
        configurable: true,
        value: webcrypto
    });
}

function serialiseLayerMaps(layerMaps) {
    return layerMaps.map(layer => layer.map(set => [...set].sort()));
}

describe('MFP canonical recipe identity', () => {
    it('preserves intentional internal and trailing empty layers', () => {
        expect(normaliseAbsoluteSequence([1, 0, 2], 5)).toEqual([1, 0, 2, 0, 0]);
    });

    it('rejects truncation of an overlong physical sequence', () => {
        expect(() => normaliseAbsoluteSequence([1, 0, 2], 2)).toThrow(/shorter|contains 3 layers/);
    });

    it('uses absolute sequence length rather than occupied-layer count', () => {
        expect(getAbsoluteLayerCount([
            { sequence: [1, 0, 2] },
            { sequence: [2, 1] }
        ])).toBe(3);
    });

    it('stableStringify sorts object keys but retains array order', () => {
        const a = stableStringify({ z: 1, a: { y: 2, x: [3, 2, 1] } });
        const b = stableStringify({ a: { x: [3, 2, 1], y: 2 }, z: 1 });
        const c = stableStringify({ a: { x: [1, 2, 3], y: 2 }, z: 1 });
        expect(a).toBe(b);
        expect(a).not.toBe(c);
    });

    it('distinguishes adjacent and gapped recipes', async () => {
        const adjacent = createCanonicalRecipeRecord({ sequence: [1, 2, 0], layerCount: 3, layerHeight: 0.08 });
        const gapped = createCanonicalRecipeRecord({ sequence: [1, 0, 2], layerCount: 3, layerHeight: 0.08 });
        expect(await createRecipeId(adjacent)).not.toBe(await createRecipeId(gapped));
    });

    it('includes material and process revisions in identity', async () => {
        const base = {
            sequence: [1, 0, 2],
            layerCount: 3,
            layerHeight: 0.08,
            filamentProfiles: [
                { profileId: 'PLA-red', profileRevision: 'r1' },
                { profileId: 'PLA-blue', profileRevision: 'r1' }
            ],
            processProfileRevision: 'printer-A/profile-1',
            viewingSide: 'front'
        };
        const original = await createRecipeId(createCanonicalRecipeRecord(base));
        const materialChanged = await createRecipeId(createCanonicalRecipeRecord({
            ...base,
            filamentProfiles: [
                { profileId: 'PLA-red', profileRevision: 'r2' },
                { profileId: 'PLA-blue', profileRevision: 'r1' }
            ]
        }));
        const processChanged = await createRecipeId(createCanonicalRecipeRecord({
            ...base,
            processProfileRevision: 'printer-A/profile-2'
        }));
        expect(original).not.toBe(materialChanged);
        expect(original).not.toBe(processChanged);
    });

    it('creates deterministic manifest IDs for duplicate recipes', async () => {
        const manifest = await createRecipeManifest([
            { sequence: [1, 0, 2] },
            { sequence: [1, 0, 2] }
        ], { layerHeight: 0.08, layerCount: 3 });
        expect(manifest.recipes[0].recipeId).toBe(manifest.recipes[1].recipeId);
        expect(manifest.recipes[0].absoluteSequence).toEqual([1, 0, 2]);
    });
});

describe('MFP absolute layer expansion', () => {
    it('retains z-position through an intentional empty layer', () => {
        const layerMaps = buildAbsoluteLayerMaps({
            map: new Uint16Array([0]),
            width: 1,
            height: 1,
            palette: [{ sequence: [1, 0, 2] }],
            filamentCount: 2
        });

        expect(layerMaps).toHaveLength(3);
        expect(layerMaps[0][0].has('0,0')).toBe(true);
        expect(layerMaps[1][0].size + layerMaps[1][1].size).toBe(0);
        expect(layerMaps[2][1].has('0,0')).toBe(true);
    });

    it('preserves all absolute positions across multiple pixels and recipes', () => {
        const layerMaps = buildAbsoluteLayerMaps({
            map: [0, 1],
            width: 2,
            height: 1,
            palette: [
                { sequence: [1, 0, 2] },
                { sequence: [0, 2, 1] }
            ],
            filamentCount: 2,
            layerCount: 3
        });

        expect(serialiseLayerMaps(layerMaps)).toEqual([
            [['0,0'], []],
            [[], ['1,0']],
            [['1,0'], ['0,0']]
        ]);
    });

    it('rejects missing palette references and unknown filament indices', () => {
        expect(() => buildAbsoluteLayerMaps({
            map: [2], width: 1, height: 1,
            palette: [{ sequence: [1] }], filamentCount: 1
        })).toThrow(/missing palette entry/);

        expect(() => buildAbsoluteLayerMaps({
            map: [0], width: 1, height: 1,
            palette: [{ sequence: [2] }], filamentCount: 1
        })).toThrow(/references filament 2/);
    });

    it('is used by the live artwork export action without compressing gaps', () => {
        const exportActions = new MFPExportActions({});
        const layerMaps = exportActions._expandQuantizedToLayers(
            new Uint16Array([0]),
            1,
            1,
            [{ sequence: [1, 0, 2] }],
            2,
            3
        );

        expect(layerMaps).toHaveLength(3);
        expect(layerMaps[0][0].has('0,0')).toBe(true);
        expect(layerMaps[1][0].size + layerMaps[1][1].size).toBe(0);
        expect(layerMaps[2][1].has('0,0')).toBe(true);
    });
});

describe('MFP sequence-map save/load round trip', () => {
    it('round-trips typed map data and exact absolute sequences', async () => {
        const palette = [
            { name: 'gapped', sequence: [1, 0, 2], rgb: { r: 10, g: 20, b: 30 } },
            { name: 'empty-top', sequence: [2, 1, 0], rgb: { r: 40, g: 50, b: 60 } }
        ];
        const manifest = await createRecipeManifest(palette, { layerCount: 3, layerHeight: 0.08 });
        const stored = serializeQuantizedSequenceMap({
            width: 2,
            height: 1,
            map: new Uint16Array([0, 1]),
            palette,
            layerCount: 3,
            recipeManifest: manifest
        });
        const restored = deserializeQuantizedSequenceMap(JSON.parse(JSON.stringify(stored)));

        expect(restored.map).toBeInstanceOf(Uint16Array);
        expect([...restored.map]).toEqual([0, 1]);
        expect(restored.palette.map(entry => entry.sequence)).toEqual([
            [1, 0, 2],
            [2, 1, 0]
        ]);
        expect(restored.recipeManifest.recipes.map(entry => entry.recipeId))
            .toEqual(manifest.recipes.map(entry => entry.recipeId));
    });

    it('produces identical physical layer maps before and after JSON round trip', () => {
        const input = {
            width: 2,
            height: 2,
            map: new Uint16Array([0, 1, 1, 0]),
            palette: [
                { sequence: [1, 0, 2, 0] },
                { sequence: [0, 2, 0, 1] }
            ],
            layerCount: 4
        };
        const before = buildAbsoluteLayerMaps({ ...input, filamentCount: 2 });
        const restored = deserializeQuantizedSequenceMap(
            JSON.parse(JSON.stringify(serializeQuantizedSequenceMap(input)))
        );
        const after = buildAbsoluteLayerMaps({ ...restored, filamentCount: 2 });
        expect(serialiseLayerMaps(after)).toEqual(serialiseLayerMaps(before));
    });

    it('migrates legacy records without compressing their sequence arrays', () => {
        const restored = deserializeQuantizedSequenceMap({
            width: 1,
            height: 1,
            map: [0],
            palette: [{ sequence: [1, 0, 2] }]
        });
        expect(restored.layerCount).toBe(3);
        expect(restored.palette[0].sequence).toEqual([1, 0, 2]);
    });
});
