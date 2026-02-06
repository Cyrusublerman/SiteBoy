/**
 * Wave Equation Synth Script - Placeholder
 * TODO: Extract from wave-equation-synth.js
 */

export const SCRIPT_CONFIG = {
    id: 'wave-equation-synth',
    title: 'Wave Equation Synth',
    category: 'other',
    canvas: { width: 800, height: 800, context: '2d' },
    parameters: [
        { group: 'Synthesis', params: [
            { key: 'harmonics', type: 'slider', label: 'Harmonics', min: 1, max: 16, step: 1, default: 8 }
        ]}
    ],
    draw: (ctx, canvas, params) => {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
};

