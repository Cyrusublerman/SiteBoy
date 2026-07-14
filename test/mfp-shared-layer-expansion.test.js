import { describe, it, expect } from 'vitest';
import { expandToLayers } from '../assets/js/shared/algorithms/color/quantization.js';
import { buildAbsoluteLayerMaps } from '../assets/js/tools/fabrication/multifilament-print/MFP-RecipeIntegrity.js';
import { rgb_to_key } from '../assets/js/shared/algorithms/color/color-utils.js';

function makeImageData(pixels, width, height) {
    const data = new Uint8ClampedArray(width * height * 4);
    pixels.forEach((pixel, index) => {
        const offset = index * 4;
        data[offset] = pixel.r;
        data[offset + 1] = pixel.g;
        data[offset + 2] = pixel.b;
        data[offset + 3] = 255;
    });
    return { width, height, data };
}

function serialise(layerMaps) {
    return layerMaps.map(layer => layer.map(pixelSet => [...pixelSet].sort()));
}

describe('shared expandToLayers absolute-layer contract', () => {
    it('retains an intentional internal empty layer', () => {
        const rgb = { r: 10, g: 20, b: 30 };
        const sequenceMap = new Map([
            [rgb_to_key(rgb), { sequence: [1, 0, 2] }]
        ]);

        const layerMaps = expandToLayers(makeImageData([rgb], 1, 1), sequenceMap, 2);

        expect(layerMaps).toHaveLength(3);
        expect(layerMaps[0][0].has('0,0')).toBe(true);
        expect(layerMaps[1][0].size + layerMaps[1][1].size).toBe(0);
        expect(layerMaps[2][1].has('0,0')).toBe(true);
    });

    it('retains trailing empty layers in the physical layer span', () => {
        const rgb = { r: 20, g: 30, b: 40 };
        const sequenceMap = new Map([
            [rgb_to_key(rgb), { sequence: [2, 1, 0, 0] }]
        ]);

        const layerMaps = expandToLayers(makeImageData([rgb], 1, 1), sequenceMap, 2);

        expect(layerMaps).toHaveLength(4);
        expect(layerMaps[2][0].size + layerMaps[2][1].size).toBe(0);
        expect(layerMaps[3][0].size + layerMaps[3][1].size).toBe(0);
    });

    it('matches the canonical palette-index implementation', () => {
        const first = { r: 10, g: 20, b: 30 };
        const second = { r: 40, g: 50, b: 60 };
        const palette = [
            { sequence: [1, 0, 2] },
            { sequence: [0, 2, 1] }
        ];
        const sequenceMap = new Map([
            [rgb_to_key(first), palette[0]],
            [rgb_to_key(second), palette[1]]
        ]);

        const shared = expandToLayers(
            makeImageData([first, second], 2, 1),
            sequenceMap,
            2
        );
        const canonical = buildAbsoluteLayerMaps({
            map: new Uint16Array([0, 1]),
            width: 2,
            height: 1,
            palette,
            filamentCount: 2,
            layerCount: 3
        });

        expect(serialise(shared)).toEqual(serialise(canonical));
    });

    it('rejects invalid filament references instead of emitting corrupt maps', () => {
        const rgb = { r: 1, g: 2, b: 3 };
        const sequenceMap = new Map([
            [rgb_to_key(rgb), { sequence: [3] }]
        ]);

        expect(() => expandToLayers(makeImageData([rgb], 1, 1), sequenceMap, 2))
            .toThrow(/references filament 3/);
    });
});
