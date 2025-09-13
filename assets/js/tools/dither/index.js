/**
 * Dither Algorithms Registry (collected from reference dithermark)
 *
 * This file declares a structured list of algorithms and patterns
 * to be used by the SiteBoy tools. Implementations can be added
 * progressively. This is a data-only registry for now.
 */

export const DitherRegistry = {
    bw: {
        threshold: [
            { title: 'Threshold', slug: 'threshold' },
            { title: 'Adaptive Threshold', slug: 'adaptive-threshold' },
        ],
        noise: [
            { title: 'Random', slug: 'random' },
            { title: 'Simplex', slug: 'simplex' },
        ],
        arithmetic: [
            { title: 'XOR (High)', slug: 'xor--high' },
            { title: 'XOR (Medium)', slug: 'xor--medium' },
            { title: 'XOR (Low)', slug: 'xor--low' },
            { title: 'ADD (High)', slug: 'add--high' },
            { title: 'ADD (Medium)', slug: 'add--medium' },
            { title: 'ADD (Low)', slug: 'add--low' },
        ],
        diffusion: [
            { title: 'Floyd–Steinberg', slug: 'floyd-steinberg' },
            { title: 'Javis–Judice–Ninke', slug: 'javis-judice-ninke' },
            { title: 'Stucki', slug: 'stucki' },
            { title: 'Burkes', slug: 'burkes' },
            { title: 'Sierra 3', slug: 'sierra-3' },
            { title: 'Sierra 2', slug: 'sierra-2' },
            { title: 'Sierra 1', slug: 'sierra-1' },
        ],
        diffusionReducedBleed: [
            { title: 'Atkinson', slug: 'atkinson' },
            { title: 'Reduced Atkinson', slug: 'reduced-atkinson' },
        ],
        ordered: {
            patterns: [
                { title: 'Bayer', base: 'bayer', dims: [2,4,8,16] },
                { title: 'Hatch Horizontal', base: 'hatchHorizontal', dims: [4] },
                { title: 'Hatch Vertical', base: 'hatchVertical', dims: [4] },
                { title: 'Hatch Right', base: 'hatchRight', dims: [4] },
                { title: 'Hatch Left', base: 'hatchLeft', dims: [4] },
                { title: 'Cross Hatch Horizontal', base: 'crossHatchHorizontal', dims: [4] },
                { title: 'Cross Hatch Vertical', base: 'crossHatchVertical', dims: [4] },
                { title: 'Cross Hatch Right', base: 'crossHatchRight', dims: [4] },
                { title: 'Cross Hatch Left', base: 'crossHatchLeft', dims: [4] },
                { title: 'Zigzag Horizontal', base: 'zigzagHorizontal', dims: [4,8,16] },
                { title: 'Zigzag Vertical', base: 'zigzagVertical', dims: [4,8,16] },
                { title: 'Checkerboard', base: 'checkerboard', dims: [2] },
                { title: 'Cluster', base: 'cluster', dims: [4] },
                { title: 'Heart', base: 'heart', dims: [8,16] },
                { title: 'Stars', base: 'stars', dims: [16] },
                { title: 'Smile', base: 'smile', dims: [8,16] },
                { title: 'Fishnet', base: 'fishnet', dims: [8] },
                { title: 'Dot', base: 'dot', dims: [4,8] },
                { title: 'Halftone', base: 'halftone', dims: [8] },
                { title: 'Square', base: 'square', dims: [2,4,8,16] },
            ],
            variants: ['normal', 'random', 'simplex']
        }
    },
    color: {
        threshold: [ { title: 'Closest Color', slug: 'closest-color' } ],
        noise: [ { title: 'Random', slug: 'random' }, { title: 'Simplex', slug: 'simplex' } ],
        arithmetic: [
            { title: 'XOR (High)', slug: 'xor--high' },
            { title: 'XOR (Medium)', slug: 'xor--medium' },
            { title: 'XOR (Low)', slug: 'xor--low' },
            { title: 'ADD (High)', slug: 'add--high' },
            { title: 'ADD (Medium)', slug: 'add--medium' },
            { title: 'ADD (Low)', slug: 'add--low' },
        ],
        diffusion: [
            { title: 'Floyd–Steinberg', slug: 'floyd-steinberg' },
            { title: 'Javis–Judice–Ninke', slug: 'javis-judice-ninke' },
            { title: 'Stucki', slug: 'stucki' },
            { title: 'Burkes', slug: 'burkes' },
            { title: 'Sierra 3', slug: 'sierra-3' },
            { title: 'Sierra 2', slug: 'sierra-2' },
            { title: 'Sierra 1', slug: 'sierra-1' },
        ],
        diffusionReducedBleed: [
            { title: 'Atkinson', slug: 'atkinson' },
            { title: 'Reduced Atkinson', slug: 'reduced-atkinson' },
        ],
        ordered: {
            patterns: [
                { title: 'Bayer', base: 'bayer', dims: [2,4,8,16] },
                { title: 'Hatch Horizontal', base: 'hatchHorizontal', dims: [4] },
                { title: 'Hatch Vertical', base: 'hatchVertical', dims: [4] },
                { title: 'Hatch Right', base: 'hatchRight', dims: [4] },
                { title: 'Hatch Left', base: 'hatchLeft', dims: [4] },
                { title: 'Cross Hatch Horizontal', base: 'crossHatchHorizontal', dims: [4] },
                { title: 'Cross Hatch Vertical', base: 'crossHatchVertical', dims: [4] },
                { title: 'Cross Hatch Right', base: 'crossHatchRight', dims: [4] },
                { title: 'Cross Hatch Left', base: 'crossHatchLeft', dims: [4] },
                { title: 'Zigzag Horizontal', base: 'zigzagHorizontal', dims: [4,8,16] },
                { title: 'Zigzag Vertical', base: 'zigzagVertical', dims: [4,8,16] },
                { title: 'Checkerboard', base: 'checkerboard', dims: [2] },
                { title: 'Cluster', base: 'cluster', dims: [4] },
                { title: 'Heart', base: 'heart', dims: [8,16] },
                { title: 'Stars', base: 'stars', dims: [16] },
                { title: 'Smile', base: 'smile', dims: [8,16] },
                { title: 'Fishnet', base: 'fishnet', dims: [8] },
                { title: 'Dot', base: 'dot', dims: [4,8] },
                { title: 'Halftone', base: 'halftone', dims: [8] },
                { title: 'Square', base: 'square', dims: [2,4,8,16] },
            ],
            variants: ['normal', 'random', 'simplex'],
            extraTypes: ['stark', 'hue-lightness', 'yliluoma-1', 'yliluoma-2']
        }
    }
};

export default DitherRegistry;


